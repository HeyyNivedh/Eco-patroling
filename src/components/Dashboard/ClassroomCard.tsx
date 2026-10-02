import React, { useState } from 'react';
import type { Classroom } from '../../types';
import { 
  Flame, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Scale, 
  ArrowRight, 
  BarChart3
} from 'lucide-react';
import { sound } from '../../services/soundService';

interface ClassroomCardProps {
  classroom: Classroom;
  onSelectForAudit: (classroom: Classroom) => void;
  onViewDetails: (classroom: Classroom) => void;
}

export const ClassroomCard: React.FC<ClassroomCardProps> = ({
  classroom,
  onSelectForAudit,
  onViewDetails,
}) => {
  const [mascotWiggle, setMascotWiggle] = useState(false);
  const isAuditedToday = classroom.status === 'audited_today';

  const triggerMascotReaction = () => {
    sound.playMascot();
    setMascotWiggle(true);
    setTimeout(() => setMascotWiggle(false), 600);
  };

  // Score badge style
  let scoreBadgeStyle = 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 shadow-emerald-500/30';
  let cardBorderColor = 'border-slate-800 hover:border-emerald-500/60';

  if (classroom.currentGreenScore < 75) {
    scoreBadgeStyle = 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-amber-500/30';
    cardBorderColor = 'border-slate-800 hover:border-amber-500/60';
  }
  if (classroom.currentGreenScore < 60) {
    scoreBadgeStyle = 'bg-gradient-to-br from-rose-400 to-pink-500 text-slate-950 shadow-rose-500/30';
    cardBorderColor = 'border-slate-800 hover:border-rose-500/60';
  }

  return (
    <div className={`bg-slate-900/90 rounded-3xl border-2 ${cardBorderColor} shadow-lg hover:shadow-2xl transition-all duration-300 p-5 flex flex-col justify-between group relative overflow-hidden card-fun text-slate-100`}>
      {/* Playful Top Strip */}
      <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${classroom.avatarColor}`} />

      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          
          {/* Interactive Mascot with Wiggle */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={triggerMascotReaction}
              title="Tap mascot for cheerful cheer!"
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${classroom.avatarColor} flex items-center justify-center text-3xl shadow-md border-2 border-slate-800 select-none transition-transform cursor-pointer active:scale-90 ${
                mascotWiggle ? 'animate-wiggle scale-110' : 'hover:scale-105'
              }`}
            >
              {classroom.mascot}
            </button>

            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-xl font-black text-white font-display">
                  {classroom.name}
                </h3>
                {classroom.streakDays > 0 && (
                  <span className="inline-flex items-center text-[10px] font-black text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/40 shadow-xs">
                    <Flame className="w-3 h-3 mr-0.5 fill-amber-400 text-amber-400" />
                    {classroom.streakDays}w
                  </span>
                )}
              </div>
              <p className="text-xs font-extrabold text-emerald-400">
                {classroom.mascotName} • {classroom.roomNumber}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                {classroom.teacher}
              </p>
            </div>
          </div>

          {/* Green Score Badge */}
          <div className="text-right">
            <div className={`px-3 py-1.5 rounded-2xl font-black text-lg shadow-md flex flex-col items-center justify-center border border-white/20 ${scoreBadgeStyle}`}>
              <span className="text-2xl leading-none font-display font-black">{classroom.currentGreenScore}</span>
              <span className="text-[8px] font-black uppercase tracking-widest opacity-90">Green Pts</span>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <div className="mb-3">
          {isAuditedToday ? (
            <div className="inline-flex items-center space-x-1.5 bg-emerald-950/60 text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Audited Today • High Score Logged!</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-1.5 bg-amber-950/60 text-amber-300 text-xs font-black px-3 py-1 rounded-full border border-amber-500/40">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Ready for Classroom Audit</span>
            </div>
          )}
        </div>

        {/* Key Metrics Quick Glance Bento */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/60 rounded-2xl p-3 mb-4 border border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-sm">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Waste</p>
              <p className="text-xs font-black text-white font-display">
                {Math.round(classroom.weeklyWasteAvgGrams / classroom.studentCount)}g <span className="text-[10px] text-slate-500 font-normal">/student</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total Bin</p>
              <p className="text-xs font-black text-white font-display">
                {classroom.weeklyWasteAvgGrams}g <span className="text-[10px] text-slate-500 font-normal">weight</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
        <button
          onClick={() => {
            sound.playPop();
            onViewDetails(classroom);
          }}
          className="flex-1 py-3 px-3 bg-slate-800 hover:bg-slate-750 active:scale-95 text-slate-300 hover:text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-700"
        >
          <BarChart3 className="w-4 h-4 text-slate-400" />
          <span>Stats & Trend</span>
        </button>

        <button
          onClick={() => {
            sound.playPop();
            onSelectForAudit(classroom);
          }}
          className={`flex-1 py-3 px-4 sm:px-5 rounded-2xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer touch-manipulation active:scale-95 ${
            isAuditedToday
              ? 'bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black shadow-md shadow-emerald-500/25'
          }`}
        >
          <span>{isAuditedToday ? 'Re-Audit' : 'Audit Room'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
