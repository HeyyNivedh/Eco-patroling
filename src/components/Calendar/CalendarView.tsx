import React, { useState, useMemo } from 'react';
import type { Classroom } from '../../types';
import { calendarService, type DailyPlacement } from '../../services/calendarService';
import { sound } from '../../services/soundService';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Flame, 
  Filter, 
  Clock, 
  Plus, 
  Eye, 
  Printer 
} from 'lucide-react';

interface CalendarViewProps {
  classrooms: Classroom[];
  initialDate?: string;
  onStartAuditForDate: (classroom?: Classroom, dateStr?: string) => void;
  onOpenPosterForClass: (classroom: Classroom) => void;
  onViewClassroomDetails: (classroom: Classroom) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  classrooms,
  initialDate,
  onStartAuditForDate,
  onOpenPosterForClass,
  onViewClassroomDetails,
}) => {
  const todayStr = useMemo(() => calendarService.formatDateISO(new Date()), []);
  
  // All audited dates sorted descending
  const allAuditedDates = useMemo(() => {
    return calendarService.getAllAuditedDates(classrooms);
  }, [classrooms]);

  // Selected date defaults to initialDate, or today if audited, or latest audited date, or today
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (initialDate) return initialDate;
    if (allAuditedDates.includes(todayStr)) return todayStr;
    if (allAuditedDates.length > 0) return allAuditedDates[0];
    return todayStr;
  });

  // Mode: 'by-date' (Calendar Grid & Daily Placements) vs 'by-class' (Class Placement History)
  const [viewMode, setViewMode] = useState<'by-date' | 'by-class'>('by-date');

  // Month navigation state
  const [currentYear, setCurrentYear] = useState<number>(() => {
    const d = new Date(selectedDate || todayStr);
    return isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    const d = new Date(selectedDate || todayStr);
    return isNaN(d.getMonth()) ? new Date().getMonth() : d.getMonth();
  });

  // Filter / Highlight specific classroom
  const [highlightClassId, setHighlightClassId] = useState<string>('all');
  
  // Selected class for "by-class" mode
  const [selectedClassIdForHistory, setSelectedClassIdForHistory] = useState<string>(() => {
    return classrooms[0]?.id || '';
  });

  // Month summary map for current year & month
  const monthAuditsMap = useMemo(() => {
    return calendarService.getMonthAuditsMap(classrooms, currentYear, currentMonth);
  }, [classrooms, currentYear, currentMonth]);

  // Selected day's summary
  const selectedDaySummary = useMemo(() => {
    return calendarService.getDayAuditSummary(classrooms, selectedDate);
  }, [classrooms, selectedDate]);

  // Selected class placement history for 'by-class' mode
  const selectedClassHistory = useMemo(() => {
    if (!selectedClassIdForHistory) return [];
    return calendarService.getClassroomPlacementHistory(classrooms, selectedClassIdForHistory);
  }, [classrooms, selectedClassIdForHistory]);

  const targetClassForHistory = useMemo(() => {
    return classrooms.find((c) => c.id === selectedClassIdForHistory);
  }, [classrooms, selectedClassIdForHistory]);

  // Class history stats
  const classStats = useMemo(() => {
    if (!selectedClassHistory.length) return null;
    const wins = selectedClassHistory.filter((h) => h.rank === 1).length;
    const podiums = selectedClassHistory.filter((h) => h.rank <= 3).length;
    const avgRank = Math.round((selectedClassHistory.reduce((sum, h) => sum + h.rank, 0) / selectedClassHistory.length) * 10) / 10;
    const bestRank = Math.min(...selectedClassHistory.map((h) => h.rank));
    const avgScore = Math.round(selectedClassHistory.reduce((sum, h) => sum + h.greenScore, 0) / selectedClassHistory.length);

    return { wins, podiums, avgRank, bestRank, avgScore, totalAudits: selectedClassHistory.length };
  }, [selectedClassHistory]);

  // Month display label
  const monthName = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [currentYear, currentMonth]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    sound.playPop();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    sound.playPop();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    sound.playPop();
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayStr);
  };

  // Quick day step
  const handleStepDay = (deltaDays: number) => {
    sound.playPop();
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d + deltaDays);
    const newStr = calendarService.formatDateISO(dateObj);
    setSelectedDate(newStr);
    setCurrentYear(dateObj.getFullYear());
    setCurrentMonth(dateObj.getMonth());
  };

  // Calendar days grid construction
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    interface GridCell {
      dayNum: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      hasAudits: boolean;
      auditCount: number;
      winnerPlacement?: DailyPlacement;
      highlightedRank?: number;
    }

    const cells: GridCell[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const mStr = String(prevMonthIdx + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      const dateStr = `${prevYear}-${mStr}-${dStr}`;
      
      const summary = calendarService.getDayAuditSummary(classrooms, dateStr);

      cells.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        hasAudits: summary.totalAudited > 0,
        auditCount: summary.totalAudited,
        winnerPlacement: summary.winner,
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      const dateStr = `${currentYear}-${mStr}-${dStr}`;

      const summary = monthAuditsMap.get(dateStr) || {
        date: dateStr,
        dateFormatted: '',
        totalAudited: 0,
        placements: [],
        winner: undefined,
        averageScore: 0,
        totalWasteGrams: 0,
      };
      const hasAudits = summary.totalAudited > 0;

      // Check if highlighted class participated
      let highlightedRank: number | undefined;
      if (highlightClassId !== 'all' && hasAudits) {
        const found = summary.placements.find((p) => p.classroom.id === highlightClassId);
        if (found) {
          highlightedRank = found.rank;
        }
      }

      cells.push({
        dayNum,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        hasAudits,
        auditCount: summary.totalAudited,
        winnerPlacement: summary.winner,
        highlightedRank,
      });
    }

    // Next month padding to fill complete rows of 7
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const mStr = String(nextMonthIdx + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      const dateStr = `${nextYear}-${mStr}-${dStr}`;

      const summary = calendarService.getDayAuditSummary(classrooms, dateStr);

      cells.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        hasAudits: summary.totalAudited > 0,
        auditCount: summary.totalAudited,
        winnerPlacement: summary.winner,
      });
    }

    return cells;
  }, [currentYear, currentMonth, todayStr, selectedDate, monthAuditsMap, highlightClassId, classrooms]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-32 sm:pb-36 md:pb-16 text-slate-100">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-indigo-500/30 flex items-center font-display">
                <CalendarIcon className="w-3 h-3 mr-1" />
                Patrol History Archive
              </span>
              <span className="text-xs text-slate-400 font-bold">
                • {allAuditedDates.length} Inspection Days on Record
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              Classroom Placement Calendar 📅
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1 max-w-2xl">
              Inspect day-by-day patrol records to see which classes placed 1st, 2nd, 3rd, and beyond on every day of the school year.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 self-stretch sm:self-auto shrink-0">
            <button
              onClick={() => {
                sound.playPop();
                setViewMode('by-date');
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap flex items-center justify-center space-x-2 font-display ${
                viewMode === 'by-date'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendar View</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                setViewMode('by-class');
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap flex items-center justify-center space-x-2 font-display ${
                viewMode === 'by-class'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Check by Class</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: DAY-BY-DAY CALENDAR & PLACEMENTS */}
      {viewMode === 'by-date' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* LEFT 7 COLS: MONTH VIEW CALENDAR */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-lg">
              
              {/* Month Navigation & Controls */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white font-display flex items-center space-x-2">
                    <span>{monthName}</span>
                  </h2>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    Click any day with audits to view full class rankings
                  </p>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={handlePrevMonth}
                    aria-label="Previous Month"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleJumpToToday}
                    className="px-3 py-1.5 text-xs font-black bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 rounded-xl transition-colors cursor-pointer font-display"
                  >
                    Today
                  </button>

                  <button
                    onClick={handleNextMonth}
                    aria-label="Next Month"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Classroom Highlight Filter */}
              <div className="mb-4 p-2.5 sm:p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                  <Filter className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Highlight on Calendar:</span>
                </div>

                <select
                  value={highlightClassId}
                  onChange={(e) => {
                    sound.playPop();
                    setHighlightClassId(e.target.value);
                  }}
                  className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer w-full sm:w-auto"
                >
                  <option value="all">🌟 All Classrooms (Show Winners)</option>
                  {classrooms.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.mascot} {cls.name} ({cls.teacher})
                    </option>
                  ))}
                </select>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 font-display py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {calendarGrid.map((cell) => {
                  const isSelected = cell.dateStr === selectedDate;

                  return (
                    <div
                      key={cell.dateStr}
                      onClick={() => {
                        sound.playPop();
                        setSelectedDate(cell.dateStr);
                      }}
                      className={`min-h-[72px] sm:min-h-[88px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                        isSelected
                          ? 'bg-indigo-950/80 border-indigo-400 shadow-md shadow-indigo-500/20 ring-2 ring-indigo-400'
                          : cell.isToday
                          ? 'bg-slate-800/90 border-emerald-400/80 hover:border-emerald-300'
                          : cell.hasAudits
                          ? 'bg-slate-800/60 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                          : cell.isCurrentMonth
                          ? 'bg-slate-950/40 border-slate-800/70 hover:border-slate-700 hover:bg-slate-900/60 text-slate-400'
                          : 'bg-slate-950/20 border-transparent text-slate-600 opacity-40 hover:opacity-75'
                      }`}
                    >
                      {/* Top Bar: Date Number & Badges */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs sm:text-sm font-black font-display ${
                            isSelected
                              ? 'text-white'
                              : cell.isToday
                              ? 'text-emerald-400 font-black'
                              : cell.hasAudits
                              ? 'text-white'
                              : 'text-slate-400'
                          }`}
                        >
                          {cell.dayNum}
                        </span>

                        {cell.isToday && (
                          <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded-md bg-emerald-400 text-slate-950 font-display">
                            Today
                          </span>
                        )}
                      </div>

                      {/* Middle/Bottom: Audit Indicators & Placements */}
                      <div className="mt-1 space-y-0.5">
                        {/* If a class is highlighted, show their exact rank on this day */}
                        {cell.highlightedRank !== undefined ? (
                          <div
                            className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-lg truncate flex items-center font-display shadow-xs ${
                              cell.highlightedRank === 1
                                ? 'bg-amber-400 text-slate-950'
                                : cell.highlightedRank === 2
                                ? 'bg-slate-200 text-slate-950'
                                : cell.highlightedRank === 3
                                ? 'bg-amber-700 text-white'
                                : 'bg-indigo-900/80 text-indigo-200 border border-indigo-500/40'
                            }`}
                          >
                            <span>
                              {cell.highlightedRank === 1
                                ? '🥇 1st'
                                : cell.highlightedRank === 2
                                ? '🥈 2nd'
                                : cell.highlightedRank === 3
                                ? '🥉 3rd'
                                : `#${cell.highlightedRank}`}
                            </span>
                          </div>
                        ) : cell.hasAudits && cell.winnerPlacement ? (
                          /* Otherwise show the day's 1st Place Winner */
                          <div className="space-y-0.5">
                            <div className="bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[8px] sm:text-[9px] font-black px-1 py-0.5 rounded-lg truncate flex items-center space-x-0.5 font-display">
                              <span className="shrink-0">🥇</span>
                              <span className="truncate">{cell.winnerPlacement.classroom.name}</span>
                            </div>
                            <div className="text-[8px] text-slate-400 font-bold hidden sm:block truncate">
                              {cell.auditCount} audited
                            </div>
                          </div>
                        ) : cell.hasAudits ? (
                          <div className="text-[9px] font-black text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded-md truncate">
                            {cell.auditCount} classes
                          </div>
                        ) : null}
                      </div>

                      {/* Selection Glow dot */}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-400 ring-2 ring-slate-900" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend bar */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>1st Place Winner</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span>Audits Recorded</span>
                  </div>
                </div>
                <span>Click any date to see all placements</span>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: SELECTED DAY PLACEMENTS & STANDINGS */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-xl space-y-5">
              
              {/* Day Header with Quick Prev/Next buttons */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 font-display">
                      Daily Placement Record
                    </span>
                    {selectedDate === todayStr && (
                      <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-emerald-500/40">
                        Today
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white font-display mt-0.5">
                    {selectedDaySummary.dateFormatted}
                  </h3>
                </div>

                {/* Day Stepper */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleStepDay(-1)}
                    title="Previous Day"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700 active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStepDay(1)}
                    title="Next Day"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700 active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day Stats Pills */}
              {selectedDaySummary.totalAudited > 0 && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800">
                    <span className="text-[9px] font-black uppercase text-slate-400 font-display">Audited</span>
                    <p className="text-lg font-black text-white font-display mt-0.5">
                      {selectedDaySummary.totalAudited}
                    </p>
                    <span className="text-[9px] text-slate-400 font-medium">classes</span>
                  </div>

                  <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-emerald-500/30">
                    <span className="text-[9px] font-black uppercase text-emerald-400 font-display">Avg Score</span>
                    <p className="text-lg font-black text-emerald-400 font-display mt-0.5">
                      {selectedDaySummary.averageScore}
                    </p>
                    <span className="text-[9px] text-emerald-400/80 font-medium">points</span>
                  </div>

                  <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-teal-500/30">
                    <span className="text-[9px] font-black uppercase text-teal-400 font-display">Total Waste</span>
                    <p className="text-lg font-black text-teal-300 font-display mt-0.5">
                      {selectedDaySummary.totalWasteGrams}g
                    </p>
                    <span className="text-[9px] text-teal-400/80 font-medium">recorded</span>
                  </div>
                </div>
              )}

              {/* DAILY CHAMPION SPOTLIGHT (If Audits Exist) */}
              {selectedDaySummary.winner && (
                <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent p-4 rounded-3xl border-2 border-amber-400/60 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full font-display flex items-center shadow-xs">
                      🏆 1st Place Champion of the Day
                    </span>
                    <span className="text-xs font-black text-amber-300 font-display">
                      {selectedDaySummary.winner.greenScore} pts
                    </span>
                  </div>

                  <div className="mt-3 flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${selectedDaySummary.winner.classroom.avatarColor} flex items-center justify-center text-2xl shadow-md border border-white/20 shrink-0`}>
                      {selectedDaySummary.winner.classroom.mascot}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-black text-white font-display truncate">
                        {selectedDaySummary.winner.classroom.name}
                      </h4>
                      <p className="text-xs text-amber-200/90 font-bold truncate">
                        {selectedDaySummary.winner.classroom.mascotName} • {selectedDaySummary.winner.classroom.roomNumber}
                      </p>
                      <p className="text-[11px] text-slate-300">
                        Teacher: {selectedDaySummary.winner.classroom.teacher}
                      </p>
                    </div>
                  </div>

                  {/* Actions for Winner */}
                  <div className="mt-3 pt-3 border-t border-amber-500/30 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        sound.playPop();
                        onViewClassroomDetails(selectedDaySummary.winner!.classroom);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer border border-slate-700 flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Details</span>
                    </button>

                    <button
                      onClick={() => {
                        sound.playPop();
                        onOpenPosterForClass(selectedDaySummary.winner!.classroom);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-colors cursor-pointer flex items-center space-x-1 shadow-sm font-display"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Trophy Poster</span>
                    </button>
                  </div>
                </div>
              )}

              {/* FULL LIST OF PLACEMENTS ON THIS DAY */}
              {selectedDaySummary.placements.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-display">
                    All Placements on this Day ({selectedDaySummary.placements.length} Classes)
                  </h4>

                  <div className="divide-y divide-slate-800 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/60">
                    {selectedDaySummary.placements.map((p) => {
                      const rankMedal =
                        p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : `#${p.rank}`;

                      return (
                        <div
                          key={p.classroom.id}
                          onClick={() => {
                            sound.playPop();
                            onViewClassroomDetails(p.classroom);
                          }}
                          className={`p-3 sm:p-3.5 flex items-center justify-between hover:bg-slate-900/80 transition-colors cursor-pointer group ${
                            p.rank === 1 ? 'bg-amber-950/20' : ''
                          }`}
                        >
                          {/* Left: Rank, Avatar, Name */}
                          <div className="flex items-center space-x-3 min-w-0">
                            {/* Rank Badge */}
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs font-display shrink-0 ${
                                p.rank === 1
                                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                                  : p.rank === 2
                                  ? 'bg-slate-300 text-slate-950'
                                  : p.rank === 3
                                  ? 'bg-amber-800 text-amber-200'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {rankMedal}
                            </div>

                            {/* Mascot Avatar */}
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.classroom.avatarColor} flex items-center justify-center text-lg shrink-0 border border-slate-700`}>
                              {p.classroom.mascot}
                            </div>

                            {/* Name & Room */}
                            <div className="truncate">
                              <h5 className="text-xs sm:text-sm font-black text-white font-display group-hover:text-indigo-300 transition-colors truncate">
                                {p.classroom.name}
                              </h5>
                              <p className="text-[10px] text-slate-400 truncate">
                                {p.classroom.roomNumber} • {p.classroom.teacher}
                              </p>
                            </div>
                          </div>

                          {/* Right: Score & Waste */}
                          <div className="flex items-center space-x-2 shrink-0">
                            <div className="text-right hidden sm:block">
                              <p className="text-xs font-black text-white font-mono font-display">
                                {p.wastePerStudentGrams}g
                              </p>
                              <p className="text-[9px] text-slate-400">waste/student</p>
                            </div>

                            <div
                              className={`px-2.5 py-1 rounded-xl font-black text-xs font-display flex items-center space-x-1 ${
                                p.greenScore >= 90
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                                  : p.greenScore >= 75
                                  ? 'bg-teal-950 text-teal-300 border border-teal-500/50'
                                  : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                              }`}
                            >
                              <span>{p.greenScore}</span>
                              <span className="text-[8px] opacity-75">pts</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* EMPTY STATE: NO AUDITS ON THIS DATE */
                <div className="bg-slate-950/60 rounded-2xl p-6 text-center border border-slate-800 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
                    📋
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white font-display">
                      No Audits on {selectedDaySummary.dateFormatted}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      There are no classroom inspection records recorded on this specific date.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        sound.playPop();
                        onStartAuditForDate(undefined, selectedDate);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-transform active:scale-95 cursor-pointer font-display flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Audit a Class for this Date</span>
                    </button>

                    {allAuditedDates.length > 0 && (
                      <button
                        onClick={() => {
                          sound.playPop();
                          setSelectedDate(allAuditedDates[0]);
                          const [y, m] = allAuditedDates[0].split('-').map(Number);
                          setCurrentYear(y);
                          setCurrentMonth(m - 1);
                        }}
                        className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                      >
                        Jump to Latest Audited Day
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CHECK BY CLASSROOM HISTORY */}
      {viewMode === 'by-class' && (
        <div className="space-y-6">
          
          {/* Class Selector Bar */}
          <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white font-display">
                Select a Classroom to View Daily Placements
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                See every single day this classroom was audited and what position they achieved.
              </p>
            </div>

            <div className="w-full md:w-auto">
              <select
                value={selectedClassIdForHistory}
                onChange={(e) => {
                  sound.playPop();
                  setSelectedClassIdForHistory(e.target.value);
                }}
                className="w-full md:w-80 bg-slate-950 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.mascot} {c.name} ({c.teacher} - {c.roomNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Class Performance Bento */}
          {targetClassForHistory && (
            <div className="bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl space-y-6">
              
              {/* Class Header Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${targetClassForHistory.avatarColor} flex items-center justify-center text-3xl shadow-lg border-2 border-white/20 shrink-0`}>
                    {targetClassForHistory.mascot}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                        {targetClassForHistory.name}
                      </h3>
                      {targetClassForHistory.streakDays > 0 && (
                        <span className="bg-amber-400 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full flex items-center font-display">
                          <Flame className="w-3 h-3 mr-0.5 fill-slate-950" />
                          {targetClassForHistory.streakDays}w streak
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-indigo-300 font-bold font-display mt-0.5">
                      {targetClassForHistory.mascotName} • {targetClassForHistory.roomNumber}
                    </p>
                    <p className="text-xs text-slate-400">
                      Teacher: {targetClassForHistory.teacher} • {targetClassForHistory.studentCount} Students
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      sound.playPop();
                      onStartAuditForDate(targetClassForHistory, todayStr);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs font-display shadow-md cursor-pointer hover:from-emerald-400 hover:to-teal-400"
                  >
                    + Audit Today
                  </button>

                  <button
                    onClick={() => {
                      sound.playPop();
                      onOpenPosterForClass(targetClassForHistory);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 cursor-pointer"
                  >
                    Print Poster
                  </button>
                </div>
              </div>

              {/* Stats Bento */}
              {classStats && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 font-display">Days Audited</span>
                    <p className="text-2xl font-black text-white font-display mt-0.5">{classStats.totalAudits}</p>
                    <span className="text-[10px] text-slate-500">inspections</span>
                  </div>

                  <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-amber-500/30 text-center">
                    <span className="text-[10px] font-black uppercase text-amber-400 font-display">Daily 1st Places</span>
                    <p className="text-2xl font-black text-amber-400 font-display mt-0.5">🏆 {classStats.wins}</p>
                    <span className="text-[10px] text-amber-400/80">gold medals</span>
                  </div>

                  <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-indigo-500/30 text-center">
                    <span className="text-[10px] font-black uppercase text-indigo-400 font-display">Podium Finishes</span>
                    <p className="text-2xl font-black text-indigo-300 font-display mt-0.5">🎖️ {classStats.podiums}</p>
                    <span className="text-[10px] text-indigo-400/80">top 3 placements</span>
                  </div>

                  <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-teal-500/30 text-center">
                    <span className="text-[10px] font-black uppercase text-teal-400 font-display">Average Rank</span>
                    <p className="text-2xl font-black text-teal-300 font-display mt-0.5">#{classStats.avgRank}</p>
                    <span className="text-[10px] text-teal-400/80">school-wide</span>
                  </div>

                  <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-emerald-500/30 text-center col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-black uppercase text-emerald-400 font-display">Avg Green Score</span>
                    <p className="text-2xl font-black text-emerald-400 font-display mt-0.5">{classStats.avgScore}</p>
                    <span className="text-[10px] text-emerald-400/80">pts</span>
                  </div>
                </div>
              )}

              {/* Day-by-Day Placement History Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-display flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Chronological Placement Log</span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-400">
                    {selectedClassHistory.length} inspection days recorded
                  </span>
                </div>

                {selectedClassHistory.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedClassHistory.map((item) => {
                      const rankLabel =
                        item.rank === 1
                          ? '🥇 1st Place (Winner)'
                          : item.rank === 2
                          ? '🥈 2nd Place'
                          : item.rank === 3
                          ? '🥉 3rd Place'
                          : `#${item.rank} Place`;

                      return (
                        <div
                          key={item.date}
                          className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                            item.rank === 1
                              ? 'bg-amber-950/20 border-amber-400/50'
                              : 'bg-slate-950/60 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-3.5">
                            {/* Rank Medal */}
                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm font-display shrink-0 ${
                                item.rank === 1
                                  ? 'bg-amber-400 text-slate-950 shadow-md'
                                  : item.rank === 2
                                  ? 'bg-slate-200 text-slate-950'
                                  : item.rank === 3
                                  ? 'bg-amber-800 text-amber-200'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
                            </div>

                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-black text-white font-display">
                                  {item.dateFormatted}
                                </span>
                                <span
                                  className={`text-[10px] font-black px-2 py-0.5 rounded-full font-display ${
                                    item.rank === 1
                                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {rankLabel} out of {item.totalAuditedOnDay} audited
                                </span>
                              </div>

                              {item.auditLog.notes && (
                                <p className="text-[11px] text-slate-400 mt-1 italic">
                                  "{item.auditLog.notes}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Stats and Action */}
                          <div className="flex items-center space-x-4 self-end sm:self-center">
                            <div className="text-right">
                              <span className="text-xs font-black text-white font-mono">{item.wastePerStudentGrams}g</span>
                              <p className="text-[9px] text-slate-400">per student</p>
                            </div>

                            <div
                              className={`px-3 py-1.5 rounded-xl font-black text-xs font-display flex items-center space-x-1 ${
                                item.greenScore >= 90
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                                  : item.greenScore >= 75
                                  ? 'bg-teal-950 text-teal-300 border border-teal-500/50'
                                  : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                              }`}
                            >
                              <span className="text-sm">{item.greenScore}</span>
                              <span className="text-[9px] opacity-75">pts</span>
                            </div>

                            <button
                              onClick={() => {
                                sound.playPop();
                                setSelectedDate(item.date);
                                const [y, m] = item.date.split('-').map(Number);
                                setCurrentYear(y);
                                setCurrentMonth(m - 1);
                                setViewMode('by-date');
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              View Day Leaderboard ➔
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-slate-950/60 rounded-2xl p-6 text-center border border-slate-800">
                    <p className="text-xs text-slate-400">
                      No historical audits recorded for {targetClassForHistory.name} yet.
                    </p>
                    <button
                      onClick={() => {
                        sound.playPop();
                        onStartAuditForDate(targetClassForHistory, todayStr);
                      }}
                      className="mt-3 px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl font-display cursor-pointer hover:bg-emerald-400"
                    >
                      Audit {targetClassForHistory.name} Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
