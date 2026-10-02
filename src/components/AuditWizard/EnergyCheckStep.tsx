import React from 'react';
import type { EnergyInfraction, Classroom } from '../../types';
import { 
  Lightbulb, 
  Tv, 
  Wind, 
  Zap, 
  SquareDashedBottomCode, 
  Check, 
  ArrowRight,
  AlertTriangle,
  Info
} from 'lucide-react';
import { sound } from '../../services/soundService';

interface EnergyCheckStepProps {
  classroom: Classroom;
  infractions: EnergyInfraction[];
  onToggleInfraction: (id: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onNext: () => void;
  onCancel: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Lightbulb: <Lightbulb className="w-5 h-5" />,
  Tv: <Tv className="w-5 h-5" />,
  Wind: <Wind className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  SquareDashedBottomCode: <SquareDashedBottomCode className="w-5 h-5" />,
};

export const EnergyCheckStep: React.FC<EnergyCheckStepProps> = ({
  classroom,
  infractions,
  onToggleInfraction,
  notes,
  setNotes,
  onNext,
  onCancel,
}) => {
  const activeInfractions = infractions.filter((i) => i.detected);
  const totalWattsWasted = activeInfractions.reduce((sum, i) => sum + i.estimatedWattsWasted, 0);
  const totalDeduction = activeInfractions.reduce((sum, i) => sum + i.pointsDeduction, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Header Info for the Classroom */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-3.5 sm:p-4 border-2 border-emerald-200/90 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-3xl animate-bounce-slow">{classroom.mascot}</div>
          <div>
            <h3 className="text-base font-black text-slate-900 font-display">
              {classroom.name} • {classroom.roomNumber}
            </h3>
            <p className="text-xs text-emerald-800 font-extrabold">
              {classroom.teacher} ({classroom.studentCount} Students)
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Step 1/3</span>
          <p className="text-xs sm:text-sm font-black text-emerald-900 font-display">Energy Hunt</p>
        </div>
      </div>

      {/* Live Energy Deduction Ticker */}
      <div className={`p-4 rounded-2xl border-2 transition-all shadow-xs ${
        activeInfractions.length === 0
          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
          : 'bg-rose-50/80 border-rose-300 text-rose-950'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2.5">
            {activeInfractions.length === 0 ? (
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
                <Check className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-sm animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <div>
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider">
                {activeInfractions.length === 0
                  ? 'All Clear: Zero Vampire Loads Detected!'
                  : `${activeInfractions.length} Energy Vampire${activeInfractions.length > 1 ? 's' : ''} Spotted!`}
              </p>
              <p className="text-xs sm:text-sm font-black font-display">
                {activeInfractions.length === 0
                  ? 'Classroom is 100% conserving appliance power! 🌟'
                  : `Vampire Waste: ~${totalWattsWasted} Watts (-${totalDeduction} pts)`}
              </p>
            </div>
          </div>

          <div className="text-xs font-black px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs self-start sm:self-auto font-display">
            {activeInfractions.length === 0 ? '✨ 0 Deductions' : `⚠️ -${totalDeduction} Point Penalty`}
          </div>
        </div>
      </div>

      {/* Checklist Grid (Chunky cards with large touch targets) */}
      <div className="space-y-2.5">
        <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5 font-display">
          <span>⚡ Tap any appliance infraction found in room:</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
          {infractions.map((item) => {
            const isDetected = item.detected;
            return (
              <div
                key={item.id}
                onClick={() => {
                  sound.playToggle(!isDetected);
                  onToggleInfraction(item.id);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 active:scale-98 select-none ${
                  isDetected
                    ? 'bg-rose-50/90 border-rose-400 shadow-md ring-2 ring-rose-200'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50/80 shadow-xs'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isDetected ? 'bg-rose-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {ICON_MAP[item.icon] || <Zap className="w-5 h-5" />}
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight font-display">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {item.description}
                    </p>
                    <p className="text-[10px] font-extrabold text-emerald-800 mt-1 flex items-center">
                      <Info className="w-3 h-3 mr-1 inline shrink-0" />
                      {item.tip}
                    </p>
                  </div>
                </div>

                {/* Tactile Toggle Switch Pill */}
                <div className="shrink-0 flex flex-col items-end">
                  <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    isDetected ? 'bg-rose-500 justify-end' : 'bg-slate-200 justify-start'
                  }`}>
                    <div className="bg-white w-4 h-4 rounded-full shadow-sm" />
                  </div>
                  <span className={`text-[10px] font-black mt-1 font-display ${
                    isDetected ? 'text-rose-600' : 'text-slate-400'
                  }`}>
                    {isDetected ? `-${item.pointsDeduction} pts` : 'CLEAR'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auditor Observations Notes */}
      <div className="space-y-1">
        <label className="text-xs font-black text-slate-600 font-display">
          Auditor Notes (Optional observations)
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Blinds were lowered to use daylight; all laptops unplugged!"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
        />
      </div>

      {/* Footer Navigation (Big mobile buttons) */}
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-200 gap-2">
        <button
          onClick={onCancel}
          className="py-3 px-4 text-xs font-black text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors cursor-pointer active:scale-95"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            sound.playPop();
            onNext();
          }}
          className="flex-1 sm:flex-initial py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer btn-fun"
        >
          <span>Next: Smart Waste Scanner</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
