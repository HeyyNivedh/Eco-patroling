import React from 'react';
import { 
  LayoutDashboard, 
  Trophy, 
  Printer, 
  Camera,
  Settings 
} from 'lucide-react';
import { sound } from '../services/soundService';

interface MobileBottomNavProps {
  activeTab: 'dashboard' | 'leaderboard' | 'poster';
  setActiveTab: (tab: 'dashboard' | 'leaderboard' | 'poster') => void;
  onStartAudit: () => void;
  onOpenSettings?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onStartAudit,
  onOpenSettings,
}) => {
  const handleNav = (tab: typeof activeTab) => {
    sound.playPop();
    setActiveTab(tab);
  };

  return (
    <nav className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] px-3 pt-2 pb-safe no-print">
      <div className="flex items-center justify-between max-w-md mx-auto relative">
        
        {/* Left 1: HQ Tab */}
        <button
          onClick={() => handleNav('dashboard')}
          className={`flex-1 flex flex-col items-center py-1 transition-all ${
            activeTab === 'dashboard'
              ? 'text-emerald-400 font-black scale-105'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className={`p-1.5 rounded-2xl transition-colors ${
            activeTab === 'dashboard' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''
          }`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 font-display tracking-wide">Patrol HQ</span>
        </button>

        {/* Left 2: Podium Tab */}
        <button
          onClick={() => handleNav('leaderboard')}
          className={`flex-1 flex flex-col items-center py-1 transition-all ${
            activeTab === 'leaderboard'
              ? 'text-amber-400 font-black scale-105'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className={`p-1.5 rounded-2xl transition-colors ${
            activeTab === 'leaderboard' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : ''
          }`}>
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 font-display tracking-wide">Podium</span>
        </button>

        {/* EXACT CENTER: Prominent Floating Audit Trigger */}
        <div className="relative -top-5 px-1 shrink-0 z-10">
          <button
            onClick={() => {
              sound.playPop();
              onStartAudit();
            }}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 text-slate-950 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/40 border-4 border-slate-900 active:scale-90 transition-transform btn-fun cursor-pointer"
            aria-label="Start Classroom Audit"
          >
            <Camera className="w-6 h-6 animate-pulse" />
          </button>
        </div>

        {/* Right 1: Posters Tab */}
        <button
          onClick={() => handleNav('poster')}
          className={`flex-1 flex flex-col items-center py-1 transition-all ${
            activeTab === 'poster'
              ? 'text-cyan-400 font-black scale-105'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className={`p-1.5 rounded-2xl transition-colors ${
            activeTab === 'poster' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : ''
          }`}>
            <Printer className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 font-display tracking-wide">A4 Posters</span>
        </button>

        {/* Right 2: Settings Tab */}
        <button
          onClick={() => {
            sound.playPop();
            onOpenSettings?.();
          }}
          className="flex-1 flex flex-col items-center py-1 transition-all text-slate-400 hover:text-slate-200 font-medium"
        >
          <div className="p-1.5 rounded-2xl">
            <Settings className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 font-display tracking-wide">Settings</span>
        </button>
      </div>
    </nav>
  );
};
