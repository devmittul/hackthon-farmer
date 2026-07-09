/**
 * useSpeechRecognition – Reusable Push-to-Talk Speech Recognition Hook
 *
 * Uses the browser-native Web Speech API (SpeechRecognition / webkitSpeechRecognition).
 * Designed for push-to-talk: call start() on press, stop() on release.
 * The hook manages its own lifecycle and cleans up on unmount.
 *
 * Language is synced from the app store automatically.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

// ── Language code mapping ───────────────────────────────────────────────────────
const LANGUAGE_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  gu: 'gu-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  pa: 'pa-IN',
  bn: 'bn-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  or: 'or-IN',
};

export type SpeechStatus = 'idle' | 'listening' | 'processing' | 'unsupported' | 'error';

export interface UseSpeechRecognitionReturn {
  /** Current status of the recognition engine. */
  status: SpeechStatus;
  /** The finalized transcript from the last recognition session. */
  transcript: string;
  /** Interim (partial) transcript shown while the user is still speaking. */
  interimTranscript: string;
  /** Human-readable error message, if any. */
  errorMessage: string | null;
  /** Whether the Web Speech API is available in this browser. */
  isSupported: boolean;
  /** Start recognition (call on press/hold). */
  start: () => void;
  /** Stop recognition (call on release). */
  stop: () => void;
  /** Reset transcript and error state. */
  reset: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const language = useAppStore((s) => s.language);

  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isStoppingRef = useRef(false);
  const finalTranscriptRef = useRef('');

  // Check browser support once
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Resolve the BCP-47 language tag from the app's language code
  const getLangTag = useCallback(() => {
    return LANGUAGE_MAP[language] || LANGUAGE_MAP['en'];
  }, [language]);

  // Build a fresh recognition instance each time language changes or on mount
  useEffect(() => {
    if (!isSupported) {
      setStatus('unsupported');
      return;
    }

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true; // keep listening until explicitly stopped
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = getLangTag();

    recognition.onstart = () => {
      setStatus('listening');
      setErrorMessage(null);
      finalTranscriptRef.current = '';
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      finalTranscriptRef.current = final;
      setInterimTranscript(interim);
      if (final) {
        setTranscript(final);
      }
    };

    recognition.onerror = (event: any) => {
      const errorCode: string = event.error;
      let message: string;

      switch (errorCode) {
        case 'no-speech':
          message = 'No speech was detected. Please try again.';
          break;
        case 'audio-capture':
          message = 'Microphone is unavailable. Please check your device settings.';
          break;
        case 'not-allowed':
          message = 'Microphone permission was denied. Please allow access in browser settings.';
          break;
        case 'network':
          message = 'Network error during speech recognition. Check your connection.';
          break;
        case 'aborted':
          // User-initiated abort — not an error
          setStatus('idle');
          return;
        default:
          message = `Speech recognition error: ${errorCode}`;
      }

      setErrorMessage(message);
      setStatus('error');
    };

    recognition.onend = () => {
      // If we were stopping intentionally and have a transcript, mark as processing
      if (isStoppingRef.current && finalTranscriptRef.current) {
        setTranscript(finalTranscriptRef.current);
        setStatus('processing');
      } else if (isStoppingRef.current) {
        // Stopped but no final transcript — check if there's interim to use
        setStatus('idle');
      } else {
        // Recognition ended on its own (timeout, etc.)
        if (finalTranscriptRef.current) {
          setTranscript(finalTranscriptRef.current);
          setStatus('processing');
        } else {
          setStatus('idle');
        }
      }
      setInterimTranscript('');
      isStoppingRef.current = false;
    };

    recognitionRef.current = recognition;

    // Cleanup on unmount or language change
    return () => {
      try {
        recognition.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, [isSupported, getLangTag]);

  const start = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;
    // Reset state for new session
    setTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);
    finalTranscriptRef.current = '';
    isStoppingRef.current = false;
    try {
      recognitionRef.current.start();
    } catch (err: any) {
      // Already started — ignore
      if (err.message?.includes('already started')) return;
      setErrorMessage('Failed to start speech recognition.');
      setStatus('error');
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    isStoppingRef.current = true;
    try {
      recognitionRef.current.stop();
    } catch {
      /* ignore */
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);
    setStatus('idle');
    finalTranscriptRef.current = '';
  }, []);

  return {
    status,
    transcript,
    interimTranscript,
    errorMessage,
    isSupported,
    start,
    stop,
    reset,
  };
}
