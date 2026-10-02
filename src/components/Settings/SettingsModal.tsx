import React, { useState } from 'react';
import type { AuditorProfile } from '../../types';
import { 
  X, 
  Settings, 
  Key, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Check, 
  Save
} from 'lucide-react';
import { sound } from '../../services/soundService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditor: AuditorProfile;
  onUpdateAuditor: (updated: AuditorProfile) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  auditor,
  onUpdateAuditor,
  onResetData,
}) => {
  const [apiKey, setApiKey] = useState(auditor.geminiApiKey || '');
  const [auditorName, setAuditorName] = useState(auditor.name);
  const [soundEnabled, setSoundEnabled] = useState(auditor.soundEnabled);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playPop();

    const updated: AuditorProfile = {
      ...auditor,
      name: auditorName.trim() || auditor.name,
      geminiApiKey: apiKey.trim(),
      soundEnabled,
      useLiveAi: !!apiKey.trim(),
    };

    sound.enabled = soundEnabled;
    onUpdateAuditor(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    if (window.confirm('Reset all audit logs, classroom rankings, and badges to default demo state?')) {
      sound.playPop();
      onResetData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center sm:p-4">
      <div className="bg-slate-900 sm:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-800 overflow-hidden h-full sm:h-auto sm:max-h-[92vh] flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-display text-white">
                EcoPatrol Configuration
              </h3>
              <p className="text-[11px] text-slate-400">
                Auditor profile, Vision AI, & sound preferences
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          
          {/* Auditor Squad Name */}
          <div>
            <label className="text-xs font-black text-slate-300 block mb-1 font-display">
              Auditor Team / Detective Name
            </label>
            <input
              type="text"
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              placeholder="e.g. Alex & Maya (Squad 7)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:border-emerald-400 focus:outline-none"
              required
            />
          </div>

          {/* Multimodal AI Vision Key */}
          <div className="bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-white flex items-center space-x-1.5 font-display">
                <Key className="w-4 h-4 text-emerald-400" />
                <span>Google Gemini Vision API Key</span>
              </label>
              <span className="text-[10px] font-black text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                Optional
              </span>
            </div>

            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:border-emerald-400 focus:outline-none"
            />

            <p className="text-[11px] text-slate-400 leading-tight font-medium">
              Leave blank to use the built-in <strong>Intelligent Client Vision AI</strong> with density tags & sample preset bins.
            </p>
          </div>

          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-slate-850 flex items-center justify-center text-slate-300">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </div>
              <div>
                <p className="text-xs font-black text-white font-display">Celebratory Audio Cues</p>
                <p className="text-[10px] text-slate-400">Audio chimes on badges, confetti, and button taps</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playToggle(!soundEnabled);
                setSoundEnabled(!soundEnabled);
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                soundEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-sm" />
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-rose-400 font-display">Reset School Patrol Data</p>
              <p className="text-[10px] text-slate-400">Clear all audit records & reset all 33 classrooms</p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 rounded-xl text-xs font-black border border-rose-500/40 transition-colors flex items-center space-x-1 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-md flex items-center space-x-1.5 transition-all cursor-pointer font-display active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
