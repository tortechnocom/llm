import { useState, useEffect, useCallback } from 'react';

interface TextToSpeechHook {
    speak: (text: string) => void;
    cancel: () => void;
    isSpeaking: boolean;
    hasSpeechSynthesisSupport: boolean;
    voices: SpeechSynthesisVoice[];
}

export const useTextToSpeech = (): TextToSpeechHook => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [hasSpeechSynthesisSupport, setHasSpeechSynthesisSupport] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            setHasSpeechSynthesisSupport(true);

            const updateVoices = () => {
                setVoices(window.speechSynthesis.getVoices());
            };

            updateVoices();
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (!hasSpeechSynthesisSupport) return;

        window.speechSynthesis.cancel(); // Cancel any existing speech

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [hasSpeechSynthesisSupport]);

    const cancel = useCallback(() => {
        if (!hasSpeechSynthesisSupport) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, [hasSpeechSynthesisSupport]);

    return {
        speak,
        cancel,
        isSpeaking,
        hasSpeechSynthesisSupport,
        voices
    };
};
