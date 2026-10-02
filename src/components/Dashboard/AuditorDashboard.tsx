import React, { useState, useMemo } from 'react';
import type { Classroom, AuditorProfile } from '../../types';
import { ClassroomCard } from './ClassroomCard';
import { 
  Search, 
  Camera, 
  CheckCircle, 
  Scale, 
  Crown
} from 'lucide-react';
import { sound } from '../../services/soundService';

interface AuditorDashboardProps {
  classrooms: Classroom[];
  auditor: AuditorProfile;
  onStartAuditForClass: (classroom?: Classroom) => void;
  onViewClassroomDetails: (classroom: Classroom) => void;
  onNavigateToTab: (tab: 'dashboard' | 'leaderboard' | 'poster') => void;
  onOpenPosterForClass?: (classroom: Classroom) => void;
}

export const AuditorDashboard: React.FC<AuditorDashboardProps> = ({
  classrooms,
  auditor,
  onStartAuditForClass,
  onViewClassroomDetails,
  onNavigateToTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Find classrooms that have been audited today and sort by today's score
  const auditedTodayClassrooms = useMemo(() => {
    return classrooms
      .filter((c) => {
        const hasTodayAudit = c.historicalAudits?.some((h) => h.date === todayStr);
        return hasTodayAudit || (c.status === 'audited_today' && c.todayGreenScore !== undefined);
      })
      .map((c) => {
        const audit = c.historicalAudits?.find((h) => h.date === todayStr);
        const score = audit ? audit.greenScore : (c.todayGreenScore ?? c.currentGreenScore);
        return { classroom: c, todayScore: score };
      })
      .sort((a, b) => b.todayScore - a.todayScore);
  }, [classrooms, todayStr]);

  const greenestClassToday = auditedTodayClassrooms.length > 0 ? auditedTodayClassrooms[0] : null;

  // Aggregate stats (Campus Score removed per user requirement)
  const totalClassrooms = classrooms.length;
  const auditedCount = auditedTodayClassrooms.length;
  const pendingCount = totalClassrooms - auditedCount;

  const totalWeeklyWasteKg = Math.round(
    classrooms.reduce((acc, c) => acc + c.weeklyWasteAvgGrams, 0) / 1000
  );

  // Filtered classrooms
  const filteredClassrooms = useMemo(() => {
    return classrooms.filter((cls) => {
      const matchesSearch =
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.mascotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.grade.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterTag === 'pending') return cls.status === 'pending';
      if (filterTag === 'audited') return cls.status === 'audited_today';
      if (filterTag !== 'all') {
        const tagLower = filterTag.toLowerCase();
        return (
          cls.grade.toLowerCase().includes(tagLower) ||
          cls.name.toLowerCase().startsWith(tagLower)
        );
      }

      return true;
    });
  }, [classrooms, searchQuery, filterTag]);

  return (
    <div className="space-y-5 sm:space-y-6 pb-32 sm:pb-36 md:pb-16 text-slate-100">
      
      {/* Sleek Minimal Dark Hero Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/70 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Patrol Auditor: {auditor.name}
            </span>
            <span className="text-xs text-slate-400 font-bold">
              • Level {auditor.level}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
            Classroom Waste Audits 📋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Snap photos to estimate waste in grams, add individual items, and crown today's Greenest Class.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="w-full sm:w-auto shrink-0">
          <button
            onClick={() => {
              sound.playPop();
              const nextPending = classrooms.find((c) => c.status === 'pending');
              onStartAuditForClass(nextPending || classrooms[0]);
            }}
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 cursor-pointer active:scale-95 transition-all font-display"
          >
            <Camera className="w-4 h-4 text-slate-950" />
            <span>Start Classroom Audit ➔</span>
          </button>
        </div>
      </div>

      {/* Streamlined 3-Card Metrics Bento (Campus Score Removed per user request) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Metric 1: Classrooms Audited Today */}
        <div className="bg-slate-900/90 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-md flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider font-display">Audited Today</p>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-white font-mono">{auditedCount}</span>
              <span className="text-xs font-bold text-slate-500">/ {totalClassrooms} classrooms</span>
            </div>
            <p className="text-[10px] text-emerald-400 font-bold mt-0.5">
              {pendingCount > 0 ? `${pendingCount} classes pending audit` : 'All audited today! 🌟'}
            </p>
          </div>
        </div>

        {/* Metric 2: Waste Tracked */}
        <div className="bg-slate-900/90 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-md flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider font-display">Waste Tracked</p>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-white font-mono">{totalWeeklyWasteKg}</span>
              <span className="text-xs font-bold text-slate-500">kg recorded</span>
            </div>
            <p className="text-[10px] text-amber-400 font-bold mt-0.5">
              Calculated across audited bins
            </p>
          </div>
        </div>

        {/* Metric 3: Greenest Class of the Day */}
        <div 
          onClick={() => {
            sound.playPop();
            onNavigateToTab('leaderboard');
          }}
          className="bg-slate-900/90 hover:bg-slate-850 rounded-3xl p-4 sm:p-5 border border-slate-800 hover:border-amber-500/50 shadow-md flex items-center space-x-3.5 cursor-pointer transition-all group active:scale-95"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <Crown className="w-5 h-5 text-slate-950" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] sm:text-xs font-black text-amber-400 uppercase tracking-wider font-display">Greenest Class Today</p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-sm sm:text-base font-black text-white truncate font-display">
                {greenestClassToday ? greenestClassToday.classroom.name : 'Pending Audits'}
              </span>
              <span className="text-sm">{greenestClassToday ? greenestClassToday.classroom.mascot : '☀️'}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center">
              <span>{greenestClassToday ? `${greenestClassToday.todayScore} pts • View Podium ➔` : 'Audit to crown champion ➔'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Classroom Patrol Roster Section */}
      <div className="space-y-3.5 pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white font-display">
              Classroom Patrol Roster
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Select a room below to log waste weight in grams and update leaderboard
            </p>
          </div>

          {/* Minimal Dark Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search room, mascot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              sound.playPop();
              setFilterTag('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer font-display ${
              filterTag === 'all'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All ({classrooms.length})
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setFilterTag('pending');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer font-display ${
              filterTag === 'pending'
                ? 'bg-amber-950/60 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ⏳ Pending ({pendingCount})
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setFilterTag('audited');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer font-display ${
              filterTag === 'audited'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ✅ Audited ({auditedCount})
          </button>

          {/* School Grade Specific Pills */}
          {['KG', 'UG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'].map((gradeKey) => {
            const isActive = filterTag === gradeKey;
            const count = classrooms.filter(
              (c) => c.grade.toLowerCase().includes(gradeKey.toLowerCase()) || c.name.toLowerCase().startsWith(gradeKey.toLowerCase())
            ).length;

            return (
              <button
                key={gradeKey}
                onClick={() => {
                  sound.playPop();
                  setFilterTag(gradeKey);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer font-display ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {gradeKey} ({count})
              </button>
            );
          })}
        </div>

        {/* Classroom Grid */}
        {filteredClassrooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredClassrooms.map((cls) => (
              <ClassroomCard
                key={cls.id}
                classroom={cls}
                onSelectForAudit={onStartAuditForClass}
                onViewDetails={onViewClassroomDetails}
              />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 rounded-3xl p-8 text-center border border-slate-800">
            <p className="text-sm font-black text-white font-display">No classrooms found</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterTag('all');
              }}
              className="mt-3 px-4 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-black hover:bg-emerald-500/30 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
