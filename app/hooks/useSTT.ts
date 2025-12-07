import { useEffect, useRef, useState, useCallback } from 'react';

// Basic type definitions for Web Speech API since it might not be in all TS environments
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: Event) => void;
  onstart: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

interface UseSTTProps {
  lang: string; // 'zh-CN' or 'en-US'
  onInterimResult: (text: string) => void;
  onFinalResult: (text: string) => void;
}

export function useSTT({ lang, onInterimResult, onFinalResult }: UseSTTProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldBeListeningRef = useRef(false); // To track user intent vs API state

  const callbackRef = useRef({ onInterimResult, onFinalResult });

  useEffect(() => {
    callbackRef.current = { onInterimResult, onFinalResult };
  }, [onInterimResult, onFinalResult]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Browser does not support SpeechRecognition');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      console.log('STT Started');
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          callbackRef.current.onFinalResult(event.results[i][0].transcript);
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      if (interimTranscript) {
        callbackRef.current.onInterimResult(interimTranscript);
      }
    };

    recognition.onend = () => {
        console.log('STT Ended');
        setIsListening(false);
        // Auto-restart if we are supposed to be listening
        if (shouldBeListeningRef.current) {
            console.log('STT Auto-restarting...');
            try {
                recognition.start();
            } catch (e) {
                console.error("Failed to restart recognition", e)
            }
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
          shouldBeListeningRef.current = false;
      }
    };

    recognitionRef.current = recognition;

    return () => {
        // Only stop if we are unmounting or lang changes
        recognition.abort();
    };
  }, [lang]); // Only re-run if lang changes

  // Update lang dynamically if it changes while listening
  useEffect(() => {
    if (recognitionRef.current && recognitionRef.current.lang !== lang) {
        recognitionRef.current.lang = lang;
        // If listening, we might need to restart to apply lang change reliably in some browsers,
        // but often setting the prop is enough between sessions. 
        // For robustness, if running, we restart.
        if (shouldBeListeningRef.current) {
            recognitionRef.current.stop(); 
            // onend will trigger restart with new lang
        }
    }
  }, [lang]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
        shouldBeListeningRef.current = true;
        try {
            recognitionRef.current.start();
        } catch(e) {
            console.warn("Already started or error", e);
        }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
        shouldBeListeningRef.current = false;
        recognitionRef.current.stop();
    }
  }, []);

  return { isListening, startListening, stopListening };
}
