'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardBody, Input, Button, Avatar } from '@heroui/react';
import { Send, Bot, User, ArrowLeft } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

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

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (agentId) {
            createSession();
        }
    }, [agentId]);

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
            };
        }
    }, [sessionId]);

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

        socket.emit('send-message', {
            userId: currentUserId,
            sessionId,
            content: userMessage,
        });
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col">
            {/* Sub Header / Toolbar */}
            <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur p-4">
                <div className="container mx-auto flex items-center gap-4">
                    <Button
                        isIconOnly
                        variant="light"
                        onPress={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-bold">AI Chat</h1>
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
