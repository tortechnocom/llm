'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardBody, Input, Button, Avatar, Tooltip } from '@heroui/react';
import { Send, Bot, User, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

function ChatContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const agentId = searchParams.get('agentId');

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [agentName, setAgentName] = useState<string>('');
    const [isSoundOn, setIsSoundOn] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { speak, cancel, isSpeaking } = useTextToSpeech();

    useEffect(() => {
        if (agentId) {
            fetchAgentInfo();
            createSession();
        }
    }, [agentId]);

    const fetchAgentInfo = async () => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
                        query GetAgent($id: String!) {
                            agent(id: $id) {
                                id
                                name
                            }
                        }
                    `,
                    variables: { id: agentId },
                }),
            });

            const result = await response.json();
            if (result.data?.agent) {
                setAgentName(result.data.agent.name);
            }
        } catch (error) {
            console.error('Failed to fetch agent info:', error);
        }
    };

    useEffect(() => {
        if (sessionId) {
            // Connect to WebSocket
            // Ensure we connect to the root URL, not /api
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const socketUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
            const newSocket = io(socketUrl);

            newSocket.on('connect', () => {
                newSocket.emit('join-session', { sessionId });
            });

            newSocket.on('message', (data: { role: string; content: string }) => {
                setMessages((prev) => [
                    ...prev,
                    { role: data.role as 'user' | 'assistant', content: data.content, timestamp: new Date() },
                ]);
            });

            newSocket.on('message-chunk', (data: { content: string }) => {
                setMessages((prev) => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.role === 'assistant') {
                        return [
                            ...prev.slice(0, -1),
                            { ...lastMessage, content: lastMessage.content + data.content },
                        ];
                    }
                    return [
                        ...prev,
                        { role: 'assistant', content: data.content, timestamp: new Date() },
                    ];
                });
            });

            newSocket.on('message-complete', () => {
                setIsLoading(false);
            });

            setSocket(newSocket);

            newSocket.on('error', (data: { message: string }) => {
                setIsLoading(false);
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: `Error: ${data.message}`, timestamp: new Date() },
                ]);
            });

            return () => {
                newSocket.disconnect();
                cancel(); // Stop speaking when component unmounts
            };
        }
    }, [sessionId, cancel]);

    // Handle TTS on message completion
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (isSoundOn && lastMessage?.role === 'assistant' && !isLoading) {
            // Only speak if it's a complete message (isLoading is false)
            // But we need to make sure we don't repeat speaking if re-rendering.
            // A simple check is if we are not already speaking the exact same content?
            // Or better, trigger it in the 'message-complete' socket handler?
            // The issue is 'message-complete' doesn't have the full content payload usually.
            // Let's rely on the fact that isLoading goes false when 'message-complete' fires.
            speak(lastMessage.content);
        }
    }, [messages, isSoundOn, isLoading, speak]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const createSession = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    query: `
            mutation CreateSession($input: CreateSessionInput!) {
              createChatSession(input: $input) {
                id
                userId
              }
            }
          `,
                    variables: { input: { agentId } },
                }),
            });

            const responseData = await response.json();
            console.log('Create session response:', responseData);

            if (responseData.errors) {
                console.error('GraphQL Errors:', responseData.errors);
            }

            setSessionId(responseData.data?.createChatSession?.id);
            setCurrentUserId(responseData.data?.createChatSession?.userId);
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !sessionId || !socket) return;

        const userMessage = input;
        setInput('');
        setIsLoading(true);
        cancel(); // Stop any current speech

        socket.emit('send-message', {
            userId: currentUserId,
            sessionId,
            content: userMessage,
        });
    };

    const handleVoiceTranscript = (text: string) => {
        if (text) {
            setInput((prev) => (prev ? `${prev} ${text}` : text));
        }
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col">
            {/* Sub Header / Toolbar */}
            <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            isIconOnly
                            variant="light"
                            onPress={() => router.back()}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-xl font-bold">
                            Chat with Agent {agentName && `> ${agentName}`}
                        </h1>
                    </div>
                    <div>
                        <Tooltip content={isSoundOn ? 'Mute Agent' : 'Enable Voice Output'}>
                            <Button
                                isIconOnly
                                variant={isSoundOn ? 'solid' : 'light'}
                                color={isSoundOn ? 'primary' : 'default'}
                                onPress={() => {
                                    if (isSoundOn) cancel();
                                    setIsSoundOn(!isSoundOn);
                                }}
                            >
                                {isSoundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto max-w-4xl p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-12">
                            <Bot className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <p className="text-gray-400">Start a conversation with the AI agent</p>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                {message.role === 'assistant' && (
                                    <Avatar
                                        icon={<Bot className="w-5 h-5" />}
                                        className="bg-primary-500/10 text-primary-500"
                                    />
                                )}
                                <Card
                                    className={`max-w-[70%] ${message.role === 'user'
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-gray-800'
                                        }`}
                                >
                                    <CardBody>
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    </CardBody>
                                </Card>
                                {message.role === 'user' && (
                                    <Avatar
                                        icon={<User className="w-5 h-5" />}
                                        className="bg-gray-700"
                                    />
                                )}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur p-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex gap-2">
                        <VoiceRecorder onTranscript={handleVoiceTranscript} isProcessing={isLoading} />
                        <Input
                            size="lg"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            disabled={isLoading || !sessionId}
                            classNames={{
                                inputWrapper: 'bg-gray-800',
                            }}
                        />
                        <Button
                            isIconOnly
                            color="primary"
                            size="lg"
                            onPress={handleSend}
                            isLoading={isLoading}
                            disabled={!input.trim() || !sessionId}
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div>Loading chat...</div>}>
            <ChatContent />
        </Suspense>
    );
}
