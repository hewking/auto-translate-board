import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TranscriptSegment {
  id: string;
  text: string;
  translation: string;
  originalLang: 'zh' | 'en';
  timestamp: number;
}

interface AppState {
  // Settings
  apiKey: string;
  baseUrl: string; // e.g., https://api.openai.com/v1
  provider: 'openai' | 'deepseek'; // For future specific handling if needed
  model: string;
  
  // STT Settings
  sttLang: 'zh-CN' | 'en-US'; // The language we are currently listening for (or primary)
  
  // State
  isListening: boolean;
  
  // Data
  segments: TranscriptSegment[];
  currentText: string; // The interim text currently being spoken
  currentTranslation: string; // The interim translation
  
  // Actions
  setApiKey: (key: string) => void;
  setBaseUrl: (url: string) => void;
  setModel: (model: string) => void;
  setProvider: (provider: 'openai' | 'deepseek') => void;
  setSttLang: (lang: 'zh-CN' | 'en-US') => void;
  setIsListening: (isListening: boolean) => void;
  
  addSegment: (segment: TranscriptSegment) => void;
  updateSegment: (id: string, updates: Partial<TranscriptSegment>) => void;
  updateCurrentText: (text: string) => void;
  updateCurrentTranslation: (translation: string) => void;
  clearTranscript: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      apiKey: '',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
      provider: 'openai',
      model: 'gemini-2.0-flash-exp', // Fast and robust
      
      sttLang: 'zh-CN',
      
      isListening: false,
      
      segments: [],
      currentText: '',
      currentTranslation: '',
      
      setApiKey: (apiKey) => set({ apiKey }),
      setBaseUrl: (baseUrl) => set({ baseUrl }),
      setModel: (model) => set({ model }),
      setProvider: (provider) => set({ provider }),
      setSttLang: (sttLang) => set({ sttLang }),
      setIsListening: (isListening) => set({ isListening }),
      
      addSegment: (segment) => set((state) => ({ 
        segments: [...state.segments, segment],
        currentText: '',       // Clear interim on commit
        currentTranslation: '' // Clear interim on commit
      })),
      
      updateSegment: (id, updates) => set((state) => ({
        segments: state.segments.map((seg) => 
          seg.id === id ? { ...seg, ...updates } : seg
        )
      })),
      
      updateCurrentText: (currentText) => set({ currentText }),
      updateCurrentTranslation: (currentTranslation) => set({ currentTranslation }),
      
      clearTranscript: () => set({ segments: [], currentText: '', currentTranslation: '' }),
    }),
    {
      name: 'translation-board-storage',
      partialize: (state) => ({ 
        apiKey: state.apiKey, 
        baseUrl: state.baseUrl,
        provider: state.provider,
        sttLang: state.sttLang 
      }), // Only persist settings
    }
  )
);
