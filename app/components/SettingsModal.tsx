import React from 'react';
import { useStore } from '../store/useStore';
import { X, Settings } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    apiKey, setApiKey, 
    baseUrl, setBaseUrl, 
    model, setModel, // Ensure setModel is added to store in next step if missing, or check store
    sttLang, setSttLang
  } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Values</label>
            <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-xs text-zinc-500">
                Data is stored locally in your browser.
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">API Key</label>
            <input 
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..." 
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Base URL</label>
            <input 
              type="text" 
              value={baseUrl} 
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1" 
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Model Name</label>
            <input 
              type="text" 
              value={model} 
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-3.5-turbo" 
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">STT Language</label>
                <select 
                    value={sttLang}
                    onChange={(e) => setSttLang(e.target.value as 'zh-CN' | 'en-US')}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                    <option value="zh-CN">Chinese (zh-CN)</option>
                    <option value="en-US">English (en-US)</option>
                </select>
              </div>
               {/* Placeholder for Provider Selection if needed later
               <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Provider</label>
                 <select ... />
               </div>
               */}
          </div>
        </div>

        <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
