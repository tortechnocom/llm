import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionHook {
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    hasRecognitionSupport: boolean;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState<any>(null);
    const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                setHasRecognitionSupport(true);
                const recognitionInstance = new SpeechRecognition();
                recognitionInstance.continuous = true;
                recognitionInstance.interimResults = true;
                recognitionInstance.lang = 'en-US';

                recognitionInstance.onstart = () => {
                    setIsListening(true);
                };

                recognitionInstance.onend = () => {
                    setIsListening(false);
                };

                recognitionInstance.onresult = (event: any) => {
                    let currentTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            currentTranscript += event.results[i][0].transcript;
                        } else {
                            currentTranscript += event.results[i][0].transcript;
                        }
                    }
                    setTranscript(currentTranscript);
                };

                recognitionInstance.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    setIsListening(false);
                };

                setRecognition(recognitionInstance);
            }
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognition && !isListening) {
            try {
                recognition.start();
            } catch (error) {
                console.error("Error starting recognition:", error);
            }
        }
    }, [recognition, isListening]);

    const stopListening = useCallback(() => {
        if (recognition && isListening) {
            recognition.stop();
        }
    }, [recognition, isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        hasRecognitionSupport
    };
};
