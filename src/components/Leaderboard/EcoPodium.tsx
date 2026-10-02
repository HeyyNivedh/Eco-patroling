import React from 'react';
import type { Classroom, LeaderboardTimeframe } from '../../types';
import { Crown } from 'lucide-react';
import { sound } from '../../services/soundService';

export interface PodiumEntry {
  classroom: Classroom;
  displayScore: number;
  isAuditedInPeriod: boolean;
}

interface EcoPodiumProps {
  topThree: PodiumEntry[];
  timeframe?: LeaderboardTimeframe;
  onSelectClassroom: (classroom: Classroom) => void;
}

export const EcoPodium: React.FC<EcoPodiumProps> = ({ 
  topThree, 
  timeframe = 'daily',
  onSelectClassroom 
}) => {
  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  if (!first) return null;

  const isDaily = timeframe === 'daily';
  const hasAuditedLeader = first.isAuditedInPeriod && first.displayScore > 0;

  // Title & subtitles depending on timeframe
  const badgeLabel = isDaily 
    ? "☀️ Today's Daily Patrol" 
    : timeframe === 'weekly' 
    ? "🗓️ Weekly Green Standings"
    : timeframe === 'monthly'
    ? "🏆 Monthly Champions"
    : "🌟 All-Time Legends";

  const mainHeading = isDaily
    ? "Greenest Class of the Day 🌟"
    : timeframe === 'weekly'
    ? "Greenest Classrooms of the Week 🌿"
    : timeframe === 'monthly'
    ? "Greenest Classrooms of the Month 🏆"
    : "All-Time Eco Champions 👑";

  const subHeading = isDaily
    ? hasAuditedLeader
      ? `🎉 ${first.classroom.name} takes 1st place in today's patrol with a ${first.displayScore} Green Score!`
      : "☀️ Today's patrol is underway! Audit your assigned classrooms today to crown today's Greenest Class."
    : first.displayScore === 0
    ? "New patrol season underway! Complete classroom audits to award points & climb the podium."
    : "Awarded for lowest waste footprint and stellar energy conservation habits!";

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-2xl border-2 border-emerald-500/30">
      {/* Background glow & sparkles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8 relative z-10">
        <div className="inline-flex items-center space-x-1.5 bg-amber-400 text-slate-950 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 font-display shadow-sm">
          <Crown className="w-3.5 h-3.5" />
          <span>{badgeLabel}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
          {mainHeading}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
          {subHeading}
        </p>

        {isDaily && hasAuditedLeader && (
          <div className="mt-3.5 inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400/20 via-yellow-400/25 to-amber-400/20 text-amber-300 border-2 border-amber-400/50 text-xs sm:text-sm font-black px-4 py-1.5 rounded-full shadow-lg">
            <span>👑 TODAY'S GREENEST CLASS:</span>
            <span className="text-white underline decoration-amber-400 underline-offset-2">{first.classroom.name}</span>
            <span className="bg-amber-400 text-slate-950 text-[10px] px-2 py-0.2 rounded-full font-black">
              {first.displayScore} pts
            </span>
          </div>
        )}

        {!hasAuditedLeader && (
          <div className="mt-3 inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] sm:text-xs font-bold px-3.5 py-1 rounded-full">
            {isDaily ? "✨ 0 classrooms audited today • Start today's first audit below!" : "✨ All classrooms awaiting audit • Be the first patrol squad!"}
          </div>
        )}
      </div>

      {/* 3D Podium Layout (Scales smoothly on phones and tablets) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto pt-4 sm:pt-6 pb-2 relative z-10">
        
        {/* 2nd Place (Silver) */}
        {second && (
          <div 
            onClick={() => {
              sound.playMascot();
              onSelectClassroom(second.classroom);
            }}
            className="flex flex-col items-center cursor-pointer group active:scale-95 transition-transform"
          >
            {/* Mascot */}
            <div className="w-13 h-13 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-3xl sm:text-4xl shadow-lg border-2 border-slate-200 group-hover:scale-110 transition-all mb-1.5">
              {second.classroom.mascot}
            </div>

            <span className="text-[11px] sm:text-sm font-black text-slate-200 text-center truncate max-w-full font-display">
              {second.classroom.name}
            </span>
            <span className="text-[9px] sm:text-xs text-slate-400 font-bold mb-1.5 truncate max-w-full">
              {second.classroom.mascotName}
            </span>

            {/* Podium Block */}
            <div className="w-full bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-2xl p-2.5 sm:p-4 text-center border-t-2 border-slate-400 h-28 sm:h-40 flex flex-col justify-between shadow-lg">
              <div className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-300 text-slate-900 font-black text-xs sm:text-sm mx-auto shadow-sm font-display">
                2
              </div>
              <div>
                <p className="text-base sm:text-2xl font-black font-display text-white">
                  {second.isAuditedInPeriod ? second.displayScore : '—'}
                </p>
                <p className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  {second.isAuditedInPeriod ? 'Score' : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 1st Place (Gold - Taller & Highlighted) */}
        {first && (
          <div 
            onClick={() => {
              sound.playMascot();
              onSelectClassroom(first.classroom);
            }}
            className="flex flex-col items-center cursor-pointer group -mt-4 sm:-mt-6 active:scale-95 transition-transform"
          >
            {/* Crown decoration */}
            <div className="animate-bounce-slow">
              <Crown className="w-6 h-6 sm:w-9 sm:h-9 text-amber-400 fill-amber-400 drop-shadow-md" />
            </div>

            {/* Mascot */}
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl border-4 border-amber-200 group-hover:scale-110 transition-all mb-1.5">
              {first.classroom.mascot}
            </div>

            <span className="text-xs sm:text-base font-black text-amber-300 text-center truncate max-w-full font-display">
              {first.classroom.name}
            </span>
            <span className="text-[10px] sm:text-xs text-amber-200 font-bold mb-1.5 truncate max-w-full">
              👑 {first.classroom.mascotName}
            </span>

            {/* Podium Block */}
            <div className="w-full bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-3xl p-3 sm:p-5 text-center border-t-4 border-amber-300 h-36 sm:h-52 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 pointer-events-none shimmer-bg" />
              <div className="inline-flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white text-amber-900 font-black text-xs sm:text-base mx-auto shadow-md font-display">
                1
              </div>
              <div className="relative z-10">
                <p className="text-xl sm:text-4xl font-black font-display text-white">
                  {first.isAuditedInPeriod ? first.displayScore : '—'}
                </p>
                <p className="text-[9px] sm:text-xs font-black text-amber-100 uppercase tracking-wider font-display">
                  {isDaily ? (first.isAuditedInPeriod ? 'Daily Star ⭐' : 'Pending') : 'Champion'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3rd Place (Bronze) */}
        {third && (
          <div 
            onClick={() => {
              sound.playMascot();
              onSelectClassroom(third.classroom);
            }}
            className="flex flex-col items-center cursor-pointer group active:scale-95 transition-transform"
          >
            {/* Mascot */}
            <div className="w-13 h-13 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center text-3xl sm:text-4xl shadow-lg border-2 border-amber-600 group-hover:scale-110 transition-all mb-1.5">
              {third.classroom.mascot}
            </div>

            <span className="text-[11px] sm:text-sm font-black text-amber-200 text-center truncate max-w-full font-display">
              {third.classroom.name}
            </span>
            <span className="text-[9px] sm:text-xs text-amber-400 font-bold mb-1.5 truncate max-w-full">
              {third.classroom.mascotName}
            </span>

            {/* Podium Block */}
            <div className="w-full bg-gradient-to-t from-amber-950 to-amber-900 rounded-t-2xl p-2.5 sm:p-4 text-center border-t-2 border-amber-600 h-24 sm:h-36 flex flex-col justify-between shadow-lg">
              <div className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-600 text-amber-100 font-black text-xs sm:text-sm mx-auto shadow-sm font-display">
                3
              </div>
              <div>
                <p className="text-base sm:text-2xl font-black font-display text-white">
                  {third.isAuditedInPeriod ? third.displayScore : '—'}
                </p>
                <p className="text-[8px] sm:text-[10px] font-black text-amber-300 uppercase tracking-widest">
                  {third.isAuditedInPeriod ? 'Score' : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
