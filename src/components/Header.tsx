import React from 'react';
import { 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Settings, 
  Camera
} from 'lucide-react';
import type { AuditorProfile, AppTab } from '../types';
import { sound } from '../services/soundService';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  auditor: AuditorProfile;
  onOpenSettings: () => void;
  onStartAudit: () => void;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  auditor,
  onOpenSettings,
  onStartAudit,
  onToggleSound,
}) => {
  const handleTabClick = (tab: AppTab) => {
    sound.playPop();
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Branding */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer select-none active:scale-95 transition-transform" 
            onClick={() => {
              sound.playMascot();
              handleTabClick('dashboard');
            }}
          >
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center shadow-md shadow-emerald-500/20 border border-emerald-400/40">
                <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7 text-slate-950 drop-shadow-xs" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
                  Eco<span className="text-emerald-400">Patrol</span>
                </span>
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  HQ
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 font-bold hidden sm:block">
                🌿 Green Classroom Audit Squad
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop & Tablet) - Badges Removed */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => handleTabClick('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>📋 Auditor HQ</span>
            </button>

            <button
              onClick={() => handleTabClick('leaderboard')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-slate-800 text-amber-400 shadow-sm border border-amber-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>🏆 The Eco Podium</span>
            </button>

            <button
              onClick={() => handleTabClick('calendar')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-slate-800 text-indigo-400 shadow-sm border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>📅 Placement Calendar</span>
            </button>

            <button
              onClick={() => handleTabClick('poster')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'poster'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>🖨️ Campus Posters</span>
            </button>
          </nav>

          {/* Right Controls: Sound, Settings, Audit CTA */}
          <div className="flex items-center space-x-2 sm:space-x-3">

            {/* Sound FX Toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 transition-all cursor-pointer border border-slate-700"
              title={auditor.soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
              aria-label="Toggle Sound"
            >
              {auditor.soundEnabled ? (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
              )}
            </button>

            {/* Settings Trigger */}
            <button
              onClick={onOpenSettings}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 transition-all cursor-pointer border border-slate-700"
              title="Audit Settings"
              aria-label="Open Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 hover:rotate-45 transition-transform" />
            </button>

            {/* Desktop Start Audit CTA Button */}
            <button
              onClick={() => {
                sound.playPop();
                onStartAudit();
              }}
              className="hidden lg:inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-500/20 btn-fun cursor-pointer active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Audit Room</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
