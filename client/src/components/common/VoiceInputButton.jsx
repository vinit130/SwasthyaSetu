import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

export default function VoiceInputButton({ onTranscript, lang = 'mr-IN', className = '' }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang; // 'mr-IN' for Marathi, 'hi-IN' for Hindi, 'en-IN' for English

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage('');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && onTranscript) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied');
        } else if (event.error === 'no-speech') {
          // Silent timeout
        } else {
          setErrorMessage(`Voice input error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [lang, onTranscript]);

  const toggleListening = (e) => {
    e.preventDefault();
    if (!isSupported) {
      alert('Voice input is not supported by your current browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = lang;
          recognitionRef.current.start();
        }
      } catch (err) {
        console.warn('Recognition start failed:', err);
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggleListening}
        title={isListening ? 'Listening... Speak now' : 'Click to speak (Voice typing)'}
        className={`p-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
          isListening
            ? 'bg-red-500 text-white animate-pulse shadow-md ring-2 ring-red-300'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
        } ${className}`}
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4 animate-spin" />
            <span className="text-xs font-semibold">बोलत रहा (Listening...)</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 text-emerald-600" />
            <span className="text-xs hidden sm:inline">Voice Type</span>
          </>
        )}
      </button>
      {errorMessage && (
        <span className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errorMessage}
        </span>
      )}
    </div>
  );
}
