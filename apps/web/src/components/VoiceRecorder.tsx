import { Button, Tooltip } from '@heroui/react';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useEffect } from 'react';

interface VoiceRecorderProps {
    onTranscript: (text: string) => void;
    isProcessing?: boolean;
}

export const VoiceRecorder = ({ onTranscript, isProcessing = false }: VoiceRecorderProps) => {
    const { isListening, transcript, startListening, stopListening, resetTranscript, hasRecognitionSupport } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            onTranscript(transcript);
            resetTranscript();
        }
    }, [transcript, onTranscript, resetTranscript]);

    if (!hasRecognitionSupport) {
        return (
            <Tooltip content="Voice input not supported in this browser">
                <Button isIconOnly variant="light" disabled>
                    <MicOff className="w-5 h-5 text-gray-500" />
                </Button>
            </Tooltip>
        );
    }

    return (
        <Tooltip content={isListening ? 'Stop recording' : 'Start voice input'}>
            <Button
                isIconOnly
                variant={isListening ? 'solid' : 'light'}
                color={isListening ? 'danger' : 'default'}
                className={isListening ? 'animate-pulse' : ''}
                onPress={isListening ? stopListening : startListening}
                isDisabled={isProcessing}
            >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
        </Tooltip>
    );
};
