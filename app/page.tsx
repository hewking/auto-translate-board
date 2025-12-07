'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Settings, Mic, MicOff, Maximize2, Minimize2 } from 'lucide-react';
import { useStore, TranscriptSegment } from './store/useStore';
import { useSTT } from './hooks/useSTT';
import { translateTextStream } from './lib/llm-client';
import { TranslationBoard } from './components/TranslationBoard';
import { SettingsModal } from './components/SettingsModal';
import { clsx } from 'clsx';

export default function Home() {
  const { 
    apiKey, baseUrl, model, sttLang, 
    addSegment, updateSegment, updateCurrentText,
    setIsListening: setStoreIsListening
  } = useStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle final result from STT
  const handleFinalResult = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // 1. Create new segment
    const newId = crypto.randomUUID();
    const newSegment: TranscriptSegment = {
      id: newId,
      text: text,
      translation: '', // Start empty, will stream in
      originalLang: sttLang === 'zh-CN' ? 'zh' : 'en',
      timestamp: Date.now()
    };

    addSegment(newSegment);

    // 2. Trigger Translation Logic
    // Detect target lang: if source is zh, target en; else zh.
    // Note: The LLM prompt handles the "Smart Translate" logic mostly, 
    // but explicit target helps with prompting if we want strict mode.
    const targetLang = sttLang === 'zh-CN' ? 'en' : 'zh';

    if (!apiKey) {
      updateSegment(newId, { translation: '[Please set API Key]' });
      return;
    }

    try {
      const stream = translateTextStream(text, targetLang, { apiKey, baseUrl, model });
      
      let fullTranslation = '';
      for await (const chunk of stream) {
        fullTranslation += chunk;
        updateSegment(newId, { translation: fullTranslation });
      }
    } catch (error) {
      console.error('Translation failed', error);
      updateSegment(newId, { translation: '[Error]' });
    }

  }, [apiKey, baseUrl, model, sttLang, addSegment, updateSegment]);

  // STT Hook
  const { isListening, startListening, stopListening } = useSTT({
    lang: sttLang,
    onInterimResult: (text) => updateCurrentText(text),
    onFinalResult: handleFinalResult
  });

  // Sync internal listening state with global store for UI
  useEffect(() => {
    setStoreIsListening(isListening);
  }, [isListening, setStoreIsListening]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* Header / Controls */}
      <header className="fixed top-0 left-0 right-0 z-40 p-4 transition-transform hover:translate-y-0 translate-y-[-100%] hover:translate-y-0 opacity-0 hover:opacity-100 focus-within:opacity-100 focus-within:translate-y-0 group-hover:opacity-100 md:opacity-100 md:translate-y-0 flex justify-between items-start bg-gradient-to-b from-zinc-950/90 to-transparent pointer-events-none">
         <div className="pointer-events-auto flex items-center gap-2">
            <h1 className="text-sm font-semibold text-zinc-500 tracking-wider uppercase">Auto Translate Board</h1>
         </div>
         
         <div className="pointer-events-auto flex gap-2">
            <button 
              onClick={toggleFullscreen}
              className="p-2 rounded-full bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 backdrop-blur-md border border-zinc-800 transition-all"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 backdrop-blur-md border border-zinc-800 transition-all"
            >
              <Settings size={20} />
            </button>
         </div>
      </header>

      {/* Main Board */}
      <div className="flex-1 relative pt-16 pb-32">
        <TranslationBoard />
      </div>

      {/* Floating Action Button (Mic) */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={toggleListening}
          className={clsx(
            "relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95",
            isListening 
              ? "bg-red-500 hover:bg-red-600 shadow-red-500/30" 
              : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
          )}
        >
          {isListening ? (
             <>
               <span className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-20"></span>
               <MicOff size={28} className="text-white relative z-10" />
             </>
          ) : (
             <Mic size={28} className="text-white" />
          )}
        </button>
        <p className="mt-4 text-center text-xs font-medium text-zinc-500 uppercase tracking-widest opacity-0 animate-fade-in transition-opacity duration-500" style={{opacity: isListening ? 1 : 0}}>
          Listening
        </p>
      </div>

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

    </main>
  );
}
