import React, { useState, useMemo } from 'react';
import type { Classroom, LeaderboardSortBy, LeaderboardTimeframe } from '../../types';
import { EcoPodium, type PodiumEntry } from './EcoPodium';
import { ClassroomDetailModal } from './ClassroomDetailModal';
import { 
  Flame, 
  SlidersHorizontal, 
  ChevronRight,
  Sun,
  Calendar,
  Award,
  Sparkles,
  Play
} from 'lucide-react';
import { sound } from '../../services/soundService';

interface LeaderboardViewProps {
  classrooms: Classroom[];
  onStartAudit: (classroom: Classroom) => void;
  onOpenPosterForClass: (classroom: Classroom) => void;
  onNavigateToCalendar?: (date?: string) => void;
}

export interface RankedClassroomItem {
  classroom: Classroom;
  displayScore: number;
  displayWasteGrams: number;
  displayWastePerStudent: number;
  isAuditedInPeriod: boolean;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  classrooms,
  onStartAudit,
  onOpenPosterForClass,
  onNavigateToCalendar,
}) => {
  // Default to daily as requested
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('daily');
  const [sortBy, setSortBy] = useState<LeaderboardSortBy>('green_score');
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  // Compute stats per classroom according to selected timeframe
  const rankedClassrooms: RankedClassroomItem[] = useMemo(() => {
    const list: RankedClassroomItem[] = classrooms.map((cls) => {
      if (timeframe === 'daily') {
        const todayAudit = cls.historicalAudits?.find((h) => h.date === todayStr);
        const isAuditedToday = Boolean(todayAudit || (cls.status === 'audited_today' && cls.todayGreenScore !== undefined));
        
        const score = todayAudit 
          ? todayAudit.greenScore 
          : (cls.todayGreenScore ?? 0);

        const waste = todayAudit 
          ? todayAudit.totalWasteGrams 
          : (isAuditedToday ? cls.weeklyWasteAvgGrams : 0);

        const wastePerStudent = todayAudit 
          ? todayAudit.wastePerStudentGrams 
          : (isAuditedToday ? Math.round(cls.weeklyWasteAvgGrams / cls.studentCount) : 0);

        return {
          classroom: cls,
          displayScore: isAuditedToday ? score : 0,
          displayWasteGrams: waste,
          displayWastePerStudent: wastePerStudent,
          isAuditedInPeriod: isAuditedToday,
        };
      }

      // Weekly, Monthly, All-time cumulative calculations
      const hasAudits = cls.historicalAudits && cls.historicalAudits.length > 0;
      const wastePerStudent = Math.round(cls.weeklyWasteAvgGrams / cls.studentCount);

      return {
        classroom: cls,
        displayScore: cls.currentGreenScore,
        displayWasteGrams: cls.weeklyWasteAvgGrams,
        displayWastePerStudent: wastePerStudent,
        isAuditedInPeriod: hasAudits || cls.currentGreenScore > 0,
      };
    });

    // Sorting algorithm:
    // If daily: audited classrooms ALWAYS rank above pending ones!
    return list.sort((a, b) => {
      if (timeframe === 'daily') {
        if (a.isAuditedInPeriod && !b.isAuditedInPeriod) return -1;
        if (!a.isAuditedInPeriod && b.isAuditedInPeriod) return 1;
        if (!a.isAuditedInPeriod && !b.isAuditedInPeriod) return 0;
      }

      if (sortBy === 'green_score') {
        return b.displayScore - a.displayScore;
      }
      if (sortBy === 'waste_per_student') {
        return a.displayWastePerStudent - b.displayWastePerStudent;
      }
      return b.displayScore - a.displayScore;
    });
  }, [classrooms, timeframe, sortBy, todayStr]);

  // Convert top 3 for EcoPodium
  const topThree: PodiumEntry[] = useMemo(() => {
    return rankedClassrooms.slice(0, 3).map((item) => ({
      classroom: item.classroom,
      displayScore: item.displayScore,
      isAuditedInPeriod: item.isAuditedInPeriod,
    }));
  }, [rankedClassrooms]);

  const auditedTodayCount = useMemo(() => {
    return rankedClassrooms.filter((r) => r.isAuditedInPeriod).length;
  }, [rankedClassrooms]);

  const dailyChampion = useMemo(() => {
    if (timeframe === 'daily' && rankedClassrooms[0]?.isAuditedInPeriod && rankedClassrooms[0]?.displayScore > 0) {
      return rankedClassrooms[0];
    }
    return null;
  }, [timeframe, rankedClassrooms]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-32 sm:pb-36 md:pb-16">
      
      {/* 3D Podium for Top 3 (Supports Daily & Historical) */}
      <EcoPodium
        topThree={topThree}
        timeframe={timeframe}
        onSelectClassroom={(cls) => setSelectedClassroom(cls)}
      />

      {/* Daily Banner Callout if Daily Mode is Active */}
      {timeframe === 'daily' && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-4 sm:p-5 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-2 border-amber-300">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center text-2xl font-black shadow-md shrink-0">
              ☀️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-amber-900/40 text-amber-100 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Today's Inspection • {todayFormatted}
                </span>
                <span className="text-xs font-bold text-amber-100">
                  {auditedTodayCount} of {classrooms.length} rooms audited
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black font-display text-white mt-0.5">
                {dailyChampion 
                  ? `🌟 Greenest Class of the Day: ${dailyChampion.classroom.name} (${dailyChampion.displayScore} pts)!`
                  : "All classrooms are scheduled for audit today! Complete audits to crown today's champion."}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onNavigateToCalendar && (
              <button
                onClick={() => {
                  sound.playPop();
                  onNavigateToCalendar(todayStr);
                }}
                className="bg-amber-950/40 hover:bg-amber-900/60 text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-amber-300/40 active:scale-95 cursor-pointer flex items-center space-x-1.5"
              >
                <Calendar className="w-4 h-4 text-amber-200" />
                <span>Past Days Calendar ➔</span>
              </button>
            )}

            {dailyChampion && (
              <button
                onClick={() => {
                  sound.playPop();
                  onOpenPosterForClass(dailyChampion.classroom);
                }}
                className="bg-white text-slate-950 font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md hover:bg-amber-50 active:scale-95 cursor-pointer flex items-center space-x-1.5 shrink-0"
              >
                <Award className="w-4 h-4 text-amber-600" />
                <span>Print Daily Trophy ➔</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Controls & Filters Bar */}
      <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-slate-100">
        
        {/* Timeframe selector: Prominent Daily / Weekly / Monthly / All-Time */}
        <div className="flex items-center space-x-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
          {/* Daily Option */}
          <button
            onClick={() => {
              sound.playPop();
              setTimeframe('daily');
            }}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
              timeframe === 'daily' 
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-md font-display' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
            <span>Today (Daily)</span>
          </button>

          {/* Weekly Option */}
          <button
            onClick={() => {
              sound.playPop();
              setTimeframe('weekly');
            }}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
              timeframe === 'weekly' ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>This Week</span>
          </button>

          {/* Monthly Option */}
          <button
            onClick={() => {
              sound.playPop();
              setTimeframe('monthly');
            }}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
              timeframe === 'monthly' ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Monthly</span>
          </button>

          {/* All-Time Option */}
          <button
            onClick={() => {
              sound.playPop();
              setTimeframe('all_time');
            }}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
              timeframe === 'all_time' ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All-Time</span>
          </button>

          {/* Calendar History Shortcut */}
          {onNavigateToCalendar && (
            <button
              onClick={() => {
                sound.playPop();
                onNavigateToCalendar();
              }}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 bg-indigo-950/70 text-indigo-300 border border-indigo-500/50 hover:bg-indigo-900/80 hover:text-white shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>📅 Calendar History</span>
            </button>
          )}
        </div>

        {/* Sort criteria */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
          <span className="text-xs font-black text-slate-400 flex items-center font-display shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            Rank by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => {
              sound.playPop();
              setSortBy(e.target.value as LeaderboardSortBy);
            }}
            className="bg-slate-950 text-white text-xs font-black px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer flex-1 sm:flex-initial"
          >
            <option value="green_score">🌿 Green Score</option>
            <option value="waste_per_student">🗑️ Lowest Waste / Student</option>
          </select>
        </div>
      </div>

      {/* Complete Rankings Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-md overflow-hidden text-slate-100">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white font-display">
              {timeframe === 'daily' ? `Today's Daily Standings (${todayFormatted})` : `School Standings (${rankedClassrooms.length} Rooms)`}
            </h3>
            <p className="text-[11px] text-slate-400 font-bold">
              {timeframe === 'daily' 
                ? 'Ranked by performance on today\'s single-day audit' 
                : 'Cumulative campus sustainability ranking'}
            </p>
          </div>
          <span className="text-[11px] font-black text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/40">
            {timeframe === 'daily' ? `${auditedTodayCount} / ${classrooms.length} Audited Today` : 'Live Standings'}
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {rankedClassrooms.map((item, index) => {
            const cls = item.classroom;
            const isFirstAndAudited = index === 0 && item.isAuditedInPeriod && item.displayScore > 0;

            return (
              <div
                key={cls.id}
                onClick={() => {
                  sound.playPop();
                  setSelectedClassroom(cls);
                }}
                className={`p-3.5 sm:p-5 flex items-center justify-between hover:bg-slate-850/80 transition-colors cursor-pointer group active:bg-slate-800 ${
                  isFirstAndAudited ? 'bg-amber-950/20 border-l-4 border-l-amber-400' : ''
                }`}
              >
                {/* Left: Rank, Mascot, Class info */}
                <div className="flex items-center space-x-2.5 sm:space-x-4">
                  {/* Rank Number */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 font-display ${
                    isFirstAndAudited
                      ? 'bg-amber-400 text-slate-950 shadow-sm animate-pulse'
                      : index === 0 && item.displayScore > 0
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : index === 1 && item.displayScore > 0
                      ? 'bg-slate-700 text-slate-200'
                      : index === 2 && item.displayScore > 0
                      ? 'bg-amber-800/80 text-amber-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.isAuditedInPeriod ? index + 1 : '—'}
                  </div>

                  {/* Mascot Avatar */}
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${cls.avatarColor} flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform shrink-0 border border-slate-700`}>
                    {cls.mascot}
                  </div>

                  {/* Name and teacher */}
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="text-xs sm:text-base font-black text-white font-display">
                        {cls.name}
                      </h4>

                      {/* Daily Champion Ribbon */}
                      {timeframe === 'daily' && isFirstAndAudited && (
                        <span className="inline-flex items-center text-[10px] font-black text-amber-950 bg-amber-400 px-2 py-0.5 rounded-full shadow-xs">
                          🌟 Greenest Class of the Day
                        </span>
                      )}

                      {cls.streakDays > 0 && (
                        <span className="inline-flex items-center text-[9px] font-black text-amber-300 bg-amber-950/60 px-1.5 py-0.2 rounded-full border border-amber-500/40">
                          <Flame className="w-2.5 h-2.5 mr-0.5 fill-amber-400 text-amber-400" />
                          {cls.streakDays}w
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-semibold truncate max-w-[150px] sm:max-w-none">
                      {cls.mascotName} • {cls.roomNumber}
                    </p>
                  </div>
                </div>

                {/* Right: Key Stats & Green Score */}
                <div className="flex items-center space-x-2 sm:space-x-5">
                  {/* Status badge for Daily mode */}
                  {timeframe === 'daily' && !item.isAuditedInPeriod ? (
                    <div className="flex items-center space-x-2">
                      <span className="hidden sm:inline-block text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-xl">
                        ⏳ Awaiting Audit
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playPop();
                          onStartAudit(cls);
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-xs active:scale-95 cursor-pointer font-display"
                      >
                        <Play className="w-3 h-3 fill-slate-950" />
                        <span>Audit Now</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Waste / Student stat */}
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-white font-display font-mono">
                          {item.displayWastePerStudent}g
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {timeframe === 'daily' ? "Today's Waste" : "Waste/Student"}
                        </p>
                      </div>

                      {/* Total Weight stat */}
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-emerald-400 font-display font-mono">
                          {item.displayWasteGrams}g
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Total Weight
                        </p>
                      </div>

                      {/* Green Score Pill */}
                      <div className="text-right">
                        <div className={`px-2.5 sm:px-3 py-1 rounded-xl font-black text-xs sm:text-sm flex items-center space-x-1 ${
                          item.displayScore >= 90
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                            : item.displayScore >= 75
                            ? 'bg-teal-950/80 text-teal-300 border border-teal-500/50'
                            : item.displayScore > 0
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          <span className="font-display text-sm sm:text-base font-black">
                            {item.displayScore}
                          </span>
                          <span className="text-[9px] font-bold opacity-75">pts</span>
                        </div>
                      </div>
                    </>
                  )}

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Classroom Detail Modal */}
      <ClassroomDetailModal
        classroom={selectedClassroom}
        onClose={() => setSelectedClassroom(null)}
        onStartAudit={onStartAudit}
        onOpenPosterForClass={onOpenPosterForClass}
      />
    </div>
  );
};
