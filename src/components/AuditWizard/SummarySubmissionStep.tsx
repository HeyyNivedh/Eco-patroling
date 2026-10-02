import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { Classroom, EnergyInfraction, WasteItem, ScoreBreakdown, WasteAssessment } from '../../types';
import { 
  Trophy, 
  Trash2, 
  TreePine, 
  ShieldCheck, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { getImpactTranslations } from '../../services/scoringEngine';
import { sound } from '../../services/soundService';

interface SummarySubmissionStepProps {
  classroom: Classroom;
  energyInfractions: EnergyInfraction[];
  wasteItems: WasteItem[];
  wasteAssessment?: WasteAssessment;
  scoreBreakdown: ScoreBreakdown;
  xpEarned: number;
  onSubmitFinalAudit: () => void;
  onBack: () => void;
}

export const SummarySubmissionStep: React.FC<SummarySubmissionStepProps> = ({
  classroom,
  energyInfractions,
  wasteItems,
  wasteAssessment,
  scoreBreakdown,
  xpEarned,
  onSubmitFinalAudit,
  onBack,
}) => {
  const activeInfractions = energyInfractions.filter((i) => i.detected);
  const totalWattsWasted = activeInfractions.reduce((sum, i) => sum + i.estimatedWattsWasted, 0);
  
  // Total waste: prioritize wasteAssessment estimatedGrams
  const totalWasteGrams = wasteAssessment 
    ? wasteAssessment.estimatedGrams 
    : wasteItems.reduce((sum, item) => sum + (item.manualGrams !== undefined ? item.manualGrams : item.estimatedGrams), 0);

  const activeManualItems = wasteAssessment?.manualItems?.filter((item) => item.count > 0) || [];

  const impact = getImpactTranslations(totalWasteGrams, totalWattsWasted, 1);

  // Trigger confetti burst & fanfare sound on mount
  useEffect(() => {
    sound.playSuccess();
    
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 text-slate-100">
      
      {/* Celebration Trophy Banner */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex p-3 rounded-3xl bg-amber-400/20 text-amber-400 shadow-md border-2 border-amber-400/40">
          <Trophy className="w-9 h-9 sm:w-11 sm:h-11 text-amber-400" />
        </div>
        <h3 className="text-xl sm:text-3xl font-black text-white font-display">
          Audit Complete: {classroom.name}! 🎉
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 font-bold max-w-md mx-auto">
          {scoreBreakdown.summaryFeedback}
        </p>
      </div>

      {/* Main Score Hero Card */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-emerald-950/40 border-2 border-emerald-400/40 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center space-x-1.5 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 font-display">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{scoreBreakdown.tier} Status</span>
            </div>
            <h4 className="text-lg sm:text-xl font-black font-display text-white">Class Green Score</h4>
            <p className="text-xs text-emerald-200 font-bold mt-0.5">
              Ranked on Classroom Bin Weight ({totalWasteGrams}g total)
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-950 text-white flex flex-col items-center justify-center shadow-xl border-4 border-amber-400">
              <span className="text-3xl sm:text-4xl font-black font-display text-emerald-400 leading-none">
                {scoreBreakdown.finalScore}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-1 font-display">
                / 100 Pts
              </span>
            </div>
          </div>
        </div>

        {/* Score Breakdown Cards */}
        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-center">
          <div className="bg-black/20 rounded-xl p-2.5 border border-white/5">
            <p className="text-[10px] uppercase font-black text-emerald-300">Base Score</p>
            <p className="text-sm sm:text-base font-black font-display text-white">100 Pts</p>
          </div>
          <div className="bg-black/20 rounded-xl p-2.5 border border-white/5">
            <p className="text-[10px] uppercase font-black text-emerald-300">Bin Deduction</p>
            <p className="text-sm sm:text-base font-black font-display text-amber-300">
              {scoreBreakdown.wastePenalty > 0 ? `-${scoreBreakdown.wastePenalty} Pts` : '0 (Zero Waste!)'}
            </p>
          </div>
        </div>
      </div>

      {/* Itemized Waste Weight Receipt */}
      <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-display flex items-center space-x-2">
            <span>⚖️ Waste Weight Receipt</span>
          </h4>
          <span className="text-sm font-black text-emerald-400 font-mono">
            {totalWasteGrams}g Total
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-bold">
              📸 Bin Baseline ({wasteAssessment?.photoDetectedGrams ? 'Photo Estimated' : `${wasteAssessment?.fullness} fullness`}):
            </span>
            <span className="font-mono font-black text-white">
              {wasteAssessment?.photoDetectedGrams || 400}g
            </span>
          </div>

          {activeManualItems.length > 0 && (
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-black uppercase text-emerald-400 block tracking-wider">
                Individually Logged Items:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {activeManualItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-900 px-2 py-1 rounded-lg">
                    <span>{item.emoji} {item.name} × {item.count}</span>
                    <span className="font-mono text-emerald-400 font-bold">{item.count * item.unitWeightGrams}g</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-World Waste Impact Translations */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-3.5 border border-emerald-500/30 text-center">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto mb-1">
            <TreePine className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm font-black text-white font-display">{impact.treesEquivalent} Trees</p>
          <p className="text-[9px] sm:text-[10px] text-emerald-400 font-bold mt-0.5">Protected</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-3.5 border border-teal-500/30 text-center">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center mx-auto mb-1">
            <Trash2 className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm font-black text-white font-display">{impact.plasticItemsDiverted} Items</p>
          <p className="text-[9px] sm:text-[10px] text-teal-400 font-bold mt-0.5">Diverted</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-3.5 border border-amber-500/30 text-center">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto mb-1">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm font-black text-white font-display">~{Math.round(totalWasteGrams / Math.max(1, classroom.studentCount))}g</p>
          <p className="text-[9px] sm:text-[10px] text-amber-400 font-bold mt-0.5">Per Student</p>
        </div>
      </div>

      {/* Auditor XP Recognition */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg flex items-center justify-between border-2 border-emerald-500/40">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shrink-0">
            ⚡
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] font-black text-emerald-400 uppercase tracking-wider font-display">
              Auditor XP Gained
            </span>
            <p className="text-xl sm:text-2xl font-black font-display text-white">
              +{xpEarned} XP
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-bold hidden sm:block">
          Class standings are updating live!
        </p>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-800 gap-2">
        <button
          onClick={onBack}
          className="py-3 px-3 sm:px-4 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors flex items-center space-x-1 cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit</span>
        </button>

        <button
          onClick={() => {
            sound.playPop();
            onSubmitFinalAudit();
          }}
          className="flex-1 sm:flex-initial py-3.5 px-6 sm:px-8 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs sm:text-sm font-black rounded-2xl shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95 font-display"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Save Audit & Update Podium ➔</span>
        </button>
      </div>
    </div>
  );
};
