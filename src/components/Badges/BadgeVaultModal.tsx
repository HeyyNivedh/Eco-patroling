import React from 'react';
import type { AuditorProfile, Badge } from '../../types';
import { 
  X, 
  Award, 
  Lock, 
  CheckCircle2 
} from 'lucide-react';
import { sound } from '../../services/soundService';

interface BadgeVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditor: AuditorProfile;
}

const RARITY_STYLES: Record<Badge['rarity'], { border: string; text: string; bg: string }> = {
  common: { border: 'border-slate-700', text: 'text-slate-300', bg: 'bg-slate-800' },
  rare: { border: 'border-blue-500/50', text: 'text-blue-400', bg: 'bg-blue-950/40' },
  epic: { border: 'border-purple-500/50', text: 'text-purple-400', bg: 'bg-purple-950/40' },
  legendary: { border: 'border-amber-400 ring-2 ring-amber-400/40', text: 'text-amber-300', bg: 'bg-amber-950/40' },
};

export const BadgeVaultModal: React.FC<BadgeVaultModalProps> = ({
  isOpen,
  onClose,
  auditor,
}) => {
  if (!isOpen) return null;

  const unlockedCount = auditor.badges.filter((b) => b.unlocked).length;
  const currentXp = auditor.xp % 250;
  const xpForNextLevel = 250;
  const xpPercent = Math.min(100, Math.round((currentXp / xpForNextLevel) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center sm:p-4">
      <div className="bg-slate-900 sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-800 overflow-hidden h-full sm:h-auto sm:max-h-[92vh] flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-950 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg shadow-amber-400/20 border-2 border-slate-900">
              {auditor.avatar}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-lg sm:text-xl font-black font-display text-white">
                  {auditor.name}
                </h3>
                <span className="bg-emerald-500 text-slate-950 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full font-display">
                  Level {auditor.level}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-bold">{auditor.role}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs font-black text-amber-400 font-display">
                  ⚡ {auditor.xp} XP
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  • {auditor.auditsCompleted} Audits Done
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer self-start active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* XP Level Progress Bar */}
        <div className="bg-slate-950/60 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between text-xs font-black text-slate-300 mb-1 font-display">
            <span>Level {auditor.level} Progress</span>
            <span className="text-emerald-400">{currentXp} / {xpForNextLevel} XP to Level {auditor.level + 1}</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Badges Grid */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-black text-white font-display uppercase tracking-wider flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Detective Badges ({unlockedCount} / {auditor.badges.length})</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {auditor.badges.map((badge) => {
              const rarity = RARITY_STYLES[badge.rarity] || RARITY_STYLES.common;
              return (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start space-x-3 relative ${
                    badge.unlocked
                      ? `bg-slate-950/80 ${rarity.border} shadow-sm`
                      : 'bg-slate-950/30 border-slate-850 opacity-50'
                  }`}
                >
                  {/* Badge Icon */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                      badge.unlocked ? rarity.bg : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    {badge.unlocked ? badge.name.split(' ').pop() || '🎖️' : <Lock className="w-4 h-4 text-slate-500" />}
                  </div>

                  {/* Badge Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black text-white leading-tight font-display">
                        {badge.name}
                      </h5>
                      <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-md uppercase font-display ${rarity.bg} ${rarity.text}`}>
                        {badge.rarity}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug font-medium">
                      {badge.description}
                    </p>

                    {badge.unlocked && badge.unlockedAt && (
                      <p className="text-[9px] text-emerald-400 font-bold mt-1 flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl transition-colors font-display cursor-pointer"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
