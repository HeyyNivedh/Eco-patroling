import React from 'react';
import type { Classroom } from '../../types';
import { 
  X, 
  Flame, 
  Calendar, 
  TrendingDown,
  Camera
} from 'lucide-react';
import { sound } from '../../services/soundService';

interface ClassroomDetailModalProps {
  classroom: Classroom | null;
  onClose: () => void;
  onStartAudit: (classroom: Classroom) => void;
  onOpenPosterForClass: (classroom: Classroom) => void;
  onNavigateToCalendar?: (date?: string, classroomId?: string) => void;
}

export const ClassroomDetailModal: React.FC<ClassroomDetailModalProps> = ({
  classroom,
  onClose,
  onStartAudit,
  onOpenPosterForClass,
  onNavigateToCalendar,
}) => {
  if (!classroom) return null;

  const history = classroom.historicalAudits || [];
  const wastePerStudent = Math.round(classroom.weeklyWasteAvgGrams / Math.max(1, classroom.studentCount));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center sm:p-4">
      <div className="bg-slate-900 sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-800 overflow-hidden h-full sm:h-auto sm:max-h-[92vh] flex flex-col text-slate-100">
        
        {/* Modal Top Header with Mascot Hero */}
        <div className={`p-4 sm:p-6 bg-gradient-to-r ${classroom.avatarColor} text-white flex items-center justify-between relative shrink-0`}>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950/30 backdrop-blur-md flex items-center justify-center text-3xl sm:text-4xl shadow-md border-2 border-white/40">
              {classroom.mascot}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-xl sm:text-2xl font-black font-display text-white">
                  {classroom.name}
                </h3>
                {classroom.streakDays > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full flex items-center font-display">
                    <Flame className="w-3 h-3 mr-0.5 fill-slate-950" />
                    {classroom.streakDays}w
                  </span>
                )}
              </div>
              <p className="text-xs font-black text-white/90 font-display">
                {classroom.mascotName} • {classroom.roomNumber}
              </p>
              <p className="text-[11px] text-white/80 mt-0.5">
                Teacher: {classroom.teacher} • {classroom.studentCount} Students
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-black/20 transition-all cursor-pointer self-start active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          
          {/* Main Key Performance Bento */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-slate-950/60 rounded-2xl p-2.5 sm:p-3.5 border border-emerald-500/30 text-center">
              <span className="text-[9px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-wider font-display">
                Green Score
              </span>
              <p className="text-2xl sm:text-3xl font-black font-display text-white mt-0.5">
                {classroom.currentGreenScore}
              </p>
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400">
                {classroom.currentGreenScore >= 90 ? '🌟 Eco Hero' : '🌱 Guardian'}
              </span>
            </div>

            <div className="bg-slate-950/60 rounded-2xl p-2.5 sm:p-3.5 border border-teal-500/30 text-center">
              <span className="text-[9px] sm:text-[10px] font-black text-teal-400 uppercase tracking-wider font-display">
                Waste/Student
              </span>
              <p className="text-2xl sm:text-3xl font-black font-display text-white mt-0.5">
                {wastePerStudent}<span className="text-xs font-normal">g</span>
              </p>
              <span className="text-[9px] sm:text-[10px] font-bold text-teal-400">
                Weekly rate
              </span>
            </div>

            <div className="bg-slate-950/60 rounded-2xl p-2.5 sm:p-3.5 border border-amber-500/30 text-center">
              <span className="text-[9px] sm:text-[10px] font-black text-amber-400 uppercase tracking-wider font-display">
                Total Bin
              </span>
              <p className="text-2xl sm:text-3xl font-black font-display text-white mt-0.5">
                {classroom.weeklyWasteAvgGrams}<span className="text-xs font-normal">g</span>
              </p>
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-400">
                Weekly avg
              </span>
            </div>
          </div>

          {/* Historical Waste Reduction Trend Visualization */}
          <div className="bg-slate-950/60 rounded-2xl p-3.5 sm:p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-1.5 font-display">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                <span>Audit & Placement History</span>
              </h4>
              {onNavigateToCalendar ? (
                <button
                  onClick={() => {
                    sound.playPop();
                    onClose();
                    onNavigateToCalendar(undefined, classroom.id);
                  }}
                  className="text-[10px] font-black text-indigo-400 bg-indigo-950/80 hover:bg-indigo-900/80 px-2.5 py-1 rounded-full font-display border border-indigo-500/40 cursor-pointer flex items-center space-x-1 transition-colors"
                >
                  <Calendar className="w-3 h-3" />
                  <span>View in Calendar ➔</span>
                </button>
              ) : (
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full font-display border border-emerald-500/30">
                  Recent Audits
                </span>
              )}
            </div>

            {/* Visual Bars for Past Audits */}
            <div className="space-y-2">
              {history.length > 0 ? (
                history.map((audit, idx) => (
                  <div key={audit.id || idx} className="bg-slate-900 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-black text-white font-display">{audit.date}</span>
                        <p className="text-[10px] text-slate-400 font-medium">Verified Inspection</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="font-black text-emerald-400 font-mono">{audit.totalWasteGrams}g</span>
                        <p className="text-[9px] text-slate-500">Total</p>
                      </div>

                      <div className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-black font-display text-xs border border-emerald-500/30">
                        {audit.greenScore} pts
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-2">No audits recorded yet</p>
              )}
            </div>
          </div>

          {/* Classroom Certificate / Poster Trigger */}
          <div className="bg-slate-950/60 rounded-2xl p-3.5 sm:p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg shrink-0">
                🖨️
              </div>
              <div>
                <h5 className="text-xs font-black text-white font-display">Campus Recognition Poster</h5>
                <p className="text-[11px] text-slate-400 font-medium">
                  Generate printable certificate & poster for {classroom.name}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playPop();
                onClose();
                onOpenPosterForClass(classroom);
              }}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95 text-center font-display"
            >
              Generate Poster
            </button>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={onClose}
            className="py-2.5 px-4 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              sound.playPop();
              onClose();
              onStartAudit(classroom);
            }}
            className="flex-1 sm:flex-initial py-3 px-5 sm:px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs sm:text-sm font-black rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer font-display active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Audit {classroom.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
