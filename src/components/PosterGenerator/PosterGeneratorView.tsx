import React, { useState, useRef, useMemo } from 'react';
import type { Classroom } from '../../types';
import { toPng } from 'html-to-image';
import { 
  Printer, 
  Download, 
  Crown, 
  TreePine, 
  Trash2, 
  ShieldCheck, 
  RefreshCw, 
  X,
  Trophy,
  Medal,
  Sparkles,
  Check,
  Maximize2,
  Minimize2,
  FileText
} from 'lucide-react';
import { sound } from '../../services/soundService';

interface PosterGeneratorViewProps {
  classrooms: Classroom[];
  selectedClassroomOverride?: Classroom | null;
}

type PosterTheme = 'champion_gold' | 'emerald' | 'ocean' | 'midnight';

const THEME_CONFIG: Record<
  PosterTheme,
  {
    name: string;
    bgGradient: string;
    border: string;
    noticeHeaderBg: string;
    textColor: string;
    podiumGoldBg: string;
    podiumSilverBg: string;
    podiumBronzeBg: string;
  }
> = {
  champion_gold: {
    name: '🏆 Classic Gold Notice',
    bgGradient: 'from-slate-950 via-slate-900 to-amber-950',
    border: 'border-amber-400',
    noticeHeaderBg: 'bg-amber-400 text-slate-950',
    textColor: 'text-amber-300',
    podiumGoldBg: 'bg-gradient-to-b from-amber-400/25 to-amber-500/10 border-amber-400',
    podiumSilverBg: 'bg-gradient-to-b from-slate-300/20 to-slate-400/10 border-slate-300',
    podiumBronzeBg: 'bg-gradient-to-b from-amber-700/20 to-amber-800/10 border-amber-600',
  },
  emerald: {
    name: '🌿 Emerald Notice',
    bgGradient: 'from-slate-950 via-slate-900 to-emerald-950',
    border: 'border-emerald-400',
    noticeHeaderBg: 'bg-emerald-400 text-slate-950',
    textColor: 'text-emerald-300',
    podiumGoldBg: 'bg-gradient-to-b from-amber-400/25 to-amber-500/10 border-amber-400',
    podiumSilverBg: 'bg-gradient-to-b from-slate-300/20 to-slate-400/10 border-slate-300',
    podiumBronzeBg: 'bg-gradient-to-b from-amber-700/20 to-amber-800/10 border-amber-600',
  },
  ocean: {
    name: '🌊 Ocean Notice',
    bgGradient: 'from-slate-950 via-slate-900 to-cyan-950',
    border: 'border-cyan-400',
    noticeHeaderBg: 'bg-cyan-400 text-slate-950',
    textColor: 'text-cyan-300',
    podiumGoldBg: 'bg-gradient-to-b from-amber-400/25 to-amber-500/10 border-amber-400',
    podiumSilverBg: 'bg-gradient-to-b from-slate-300/20 to-slate-400/10 border-slate-300',
    podiumBronzeBg: 'bg-gradient-to-b from-amber-700/20 to-amber-800/10 border-amber-600',
  },
  midnight: {
    name: '⚡ Midnight Notice',
    bgGradient: 'from-slate-950 via-purple-950 to-slate-950',
    border: 'border-purple-400',
    noticeHeaderBg: 'bg-purple-400 text-slate-950',
    textColor: 'text-purple-300',
    podiumGoldBg: 'bg-gradient-to-b from-amber-400/25 to-amber-500/10 border-amber-400',
    podiumSilverBg: 'bg-gradient-to-b from-slate-300/20 to-slate-400/10 border-slate-300',
    podiumBronzeBg: 'bg-gradient-to-b from-amber-700/20 to-amber-800/10 border-amber-600',
  },
};

export const PosterGeneratorView: React.FC<PosterGeneratorViewProps> = ({
  classrooms,
  selectedClassroomOverride,
}) => {
  const [theme, setTheme] = useState<PosterTheme>('champion_gold');
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    selectedClassroomOverride ? selectedClassroomOverride.id : 'podium-summary'
  );
  const [customSlogan, setCustomSlogan] = useState<string>(
    'CONSERVE ENERGY • CUT CLASSROOM WASTE • PROTECT OUR PLANET'
  );
  
  // Mobile responsive view mode (Fit to screen vs Full A4 resolution preview)
  const [fitScreenOnMobile, setFitScreenOnMobile] = useState<boolean>(true);

  // Export & Mobile Download States
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedImageModalUrl, setExportedImageModalUrl] = useState<string | null>(null);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  const posterRef = useRef<HTMLDivElement | null>(null);
  const currentTheme = THEME_CONFIG[theme];

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  // Compute rankings sorted by today's score, then current score
  const rankedClassrooms = useMemo(() => {
    return [...classrooms].sort((a, b) => {
      const scoreA = a.todayGreenScore ?? a.currentGreenScore;
      const scoreB = b.todayGreenScore ?? b.currentGreenScore;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return a.weeklyWasteAvgGrams - b.weeklyWasteAvgGrams;
    });
  }, [classrooms]);

  const firstPlace = rankedClassrooms[0] || null;
  const secondPlace = rankedClassrooms[1] || null;
  const thirdPlace = rankedClassrooms[2] || null;

  // Selected specific target classroom
  const singleClass = selectedTargetId !== 'podium-summary'
    ? classrooms.find((c) => c.id === selectedTargetId) || null
    : null;

  const singleClassRank = singleClass
    ? rankedClassrooms.findIndex((c) => c.id === singleClass.id) + 1
    : null;

  // Aggregate metrics
  const totalWasteTrackedKg = Math.round(
    classrooms.reduce((acc, c) => acc + c.weeklyWasteAvgGrams, 0) / 1000
  );
  const treesSaved = Math.max(1, Math.round(totalWasteTrackedKg * 0.3 * 10) / 10);
  const itemsDiverted = Math.round(totalWasteTrackedKg * 25);

  // Print Handler (opens browser print / PDF export dialog)
  const handlePrint = () => {
    sound.playPop();
    window.print();
  };

  // Robust Mobile + Desktop A4 PNG Exporter
  const handleDownloadPng = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    sound.playScan();

    try {
      // Capture at crisp 2x resolution with font safety
      const dataUrl = await toPng(posterRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        skipFonts: true,
        cacheBust: true,
        style: {
          transform: 'none',
          margin: '0 auto',
        },
      });

      // Convert data URL to Blob for native device handling
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const filename = `EcoPatrol_NoticeBoard_A4_${Date.now()}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      // Check if mobile device supports native Web Share API with images (iOS Safari & Android Chrome)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'EcoPatrol A4 Notice Board Poster',
            text: `Green Classroom Notice Board Poster: 1st Place: ${firstPlace?.name || 'Class'}, 2nd: ${secondPlace?.name || 'Class'}, 3rd: ${thirdPlace?.name || 'Class'}!`,
          });
          sound.playSuccess();
          setExportSuccessMessage('Shared! Tap "Save Image" to add to camera roll.');
          setTimeout(() => setExportSuccessMessage(null), 3500);
          return;
        } catch (shareErr) {
          console.log('Share dismissed or cancelled', shareErr);
        }
      }

      // Direct download trigger via Blob Object URL
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);

      // On phones, also show the modal so user can tap & hold to save
      if (window.innerWidth < 768) {
        setExportedImageModalUrl(dataUrl);
      }

      sound.playSuccess();
      setExportSuccessMessage('Poster downloaded! High-res A4 ready for notice board.');
      setTimeout(() => setExportSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to export poster as PNG', err);
      alert('Opening Print / PDF view so you can save high-res A4 poster!');
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-36 sm:pb-40 md:pb-20 text-slate-100">
      
      {/* Studio Top Controls Bar (Hidden during print) */}
      <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl no-print space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-1 font-display border border-amber-400/30">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Standard A4 Notice Board Format (210mm × 297mm)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">
              Notice Board Poster Studio
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Formatted in standard A4 dimensions ready to print and hang on school notice boards!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-3 bg-slate-800 hover:bg-slate-750 text-white rounded-2xl text-xs font-black flex items-center justify-center space-x-2 border border-slate-700 cursor-pointer active:scale-95 font-display"
              title="Print directly or save as A4 PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4</span>
            </button>

            <button
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="flex-1 sm:flex-initial px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 cursor-pointer active:scale-95 font-display"
            >
              {isExporting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Download className="w-4 h-4 text-slate-950" />
              )}
              <span>{isExporting ? 'Generating...' : 'Download A4 Image'}</span>
            </button>
          </div>
        </div>

        {/* Success toast if triggered */}
        {exportSuccessMessage && (
          <div className="bg-emerald-950/80 border border-emerald-500/60 rounded-xl p-3 flex items-center space-x-2 text-xs text-emerald-300 font-bold">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{exportSuccessMessage}</span>
          </div>
        )}

        {/* Customization Options Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          
          {/* View Mode: All-Classroom Podium vs Single Class */}
          <div>
            <label className="text-xs font-black text-slate-300 block mb-1 font-display">
              Notice Focus
            </label>
            <select
              value={selectedTargetId}
              onChange={(e) => {
                sound.playPop();
                setSelectedTargetId(e.target.value);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-emerald-400 cursor-pointer"
            >
              <option value="podium-summary">🏆 1st, 2nd, & 3rd Place Podium + All Rooms</option>
              {classrooms.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.mascotName} • Room {cls.roomNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Theme Color Selector */}
          <div>
            <label className="text-xs font-black text-slate-300 block mb-1 font-display">
              Notice Theme
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(THEME_CONFIG) as PosterTheme[]).map((tKey) => (
                <button
                  key={tKey}
                  onClick={() => {
                    sound.playPop();
                    setTheme(tKey);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer text-left truncate active:scale-95 font-display ${
                    theme === tKey
                      ? 'bg-slate-800 text-amber-400 border border-amber-400/50 shadow-xs'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {THEME_CONFIG[tKey].name}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Slogan */}
          <div>
            <label className="text-xs font-black text-slate-300 block mb-1 font-display">
              Notice Board Slogan
            </label>
            <input
              type="text"
              value={customSlogan}
              onChange={(e) => setCustomSlogan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:border-emerald-400"
            />
          </div>
        </div>

        {/* Mobile View Toggle: Fit Screen vs Full A4 */}
        <div className="sm:hidden flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span>Phone Screen View:</span>
          <button
            onClick={() => setFitScreenOnMobile(!fitScreenOnMobile)}
            className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-750 text-white rounded-lg text-xs font-bold border border-slate-700"
          >
            {fitScreenOnMobile ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            <span>{fitScreenOnMobile ? 'Zoom to 100%' : 'Fit to Phone Screen'}</span>
          </button>
        </div>
      </div>

      {/* POSTER CANVAS - EXACT STANDARD A4 RATIO (210/297) */}
      <div className={`flex justify-center ${fitScreenOnMobile ? 'overflow-hidden' : 'overflow-x-auto'} px-1`}>
        <div
          ref={posterRef}
          id="printable-poster"
          className={`poster-print-container w-full max-w-[794px] aspect-[210/297] bg-gradient-to-b ${currentTheme.bgGradient} text-white rounded-3xl p-4 sm:p-7 shadow-2xl border-4 ${currentTheme.border} flex flex-col justify-between relative overflow-hidden select-none`}
        >
          {/* Ambient Lighting Ornaments */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* 1. TOP NOTICE BOARD HEADER */}
          <div className="space-y-2">
            {/* Notice Board Bulletin Banner Strip */}
            <div className="flex items-center justify-between border-b-2 border-white/20 pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📌</span>
                <div>
                  <h4 className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-amber-300 font-display">
                    OAKRIDGE MIDDLE SCHOOL • OFFICIAL BULLETIN
                  </h4>
                  <p className="text-[8px] sm:text-[9px] text-slate-300 font-bold uppercase tracking-wider">
                    School Hallway Notice Board Post • EcoPatrol 7th Grade Taskforce
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 font-display shadow-sm">
                  {todayFormatted}
                </span>
              </div>
            </div>

            {/* Poster Main Title */}
            <div className="text-center pt-1">
              <div className="inline-flex items-center space-x-1.5 text-[10px] sm:text-xs uppercase font-black tracking-widest text-amber-300 font-display">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Greenest Classroom Standings</span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-white uppercase drop-shadow-md leading-tight">
                {singleClass ? `${singleClass.name} Performance Award` : 'GREENEST CLASSROOM CHAMPIONS'}
              </h1>
              {singleClass && (
                <div className="inline-flex items-center space-x-1 bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase font-display mt-0.5 shadow-sm">
                  <span>🏆 Official Rank: Position #{singleClassRank} Place</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. THE PODIUM OF CHAMPIONS (1ST, 2ND, AND 3RD POSITION) */}
          <div className="my-2 sm:my-3">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end">
              
              {/* 🥈 2ND PLACE PODIUM */}
              <div className={`rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 border-2 ${currentTheme.podiumSilverBg} text-center flex flex-col justify-between shadow-lg relative min-h-[170px] sm:min-h-[200px]`}>
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-950 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider font-display shadow-md flex items-center space-x-1 whitespace-nowrap">
                  <Medal className="w-2.5 h-2.5" />
                  <span>2nd Place</span>
                </div>

                <div className="pt-2">
                  <div className="text-2xl sm:text-3xl my-0.5">{secondPlace?.mascot || '🥈'}</div>
                  <h3 className="text-xs sm:text-sm font-black text-white font-display leading-tight">
                    {secondPlace ? secondPlace.name : 'Classroom'}
                  </h3>
                  <p className="text-[9px] text-slate-300 font-bold truncate">
                    {secondPlace ? secondPlace.roomNumber : 'Room 206'}
                  </p>
                </div>

                <div className="mt-1 pt-1.5 border-t border-white/10">
                  <span className="text-xl sm:text-2xl font-black font-display text-white">
                    {secondPlace ? (secondPlace.todayGreenScore ?? secondPlace.currentGreenScore) : 92}
                  </span>
                  <span className="text-[8px] uppercase font-bold text-slate-300 block">Green Points</span>
                  <p className="text-[8px] sm:text-[9px] text-emerald-400 font-mono font-bold mt-0.5">
                    {secondPlace ? `${secondPlace.weeklyWasteAvgGrams}g waste` : '240g'}
                  </p>
                </div>
              </div>

              {/* 🥇 1ST PLACE CHAMPION PODIUM (GOLD & TALLER) */}
              <div className={`rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 ${currentTheme.podiumGoldBg} text-center flex flex-col justify-between shadow-2xl relative min-h-[195px] sm:min-h-[240px] scale-105 z-10 ring-2 ring-amber-400/60`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black px-2.5 sm:px-3 py-0.5 rounded-full uppercase tracking-widest font-display shadow-xl flex items-center space-x-1 whitespace-nowrap">
                  <Crown className="w-3 h-3 fill-slate-950" />
                  <span>1st Place Gold</span>
                </div>

                <div className="pt-2">
                  <div className="text-3xl sm:text-4xl my-1 animate-bounce-slow">{firstPlace?.mascot || '🥇'}</div>
                  <h3 className="text-xs sm:text-base font-black text-amber-300 font-display leading-tight">
                    {firstPlace ? firstPlace.name : 'Classroom'}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-white font-black font-display">
                    {firstPlace ? `${firstPlace.mascotName} • ${firstPlace.roomNumber}` : 'Swift Foxes'}
                  </p>
                  <p className="text-[8px] sm:text-[9px] text-slate-300 font-medium">
                    {firstPlace?.teacher || 'Oakridge Faculty'}
                  </p>
                </div>

                <div className="mt-1 pt-1.5 border-t border-amber-400/30">
                  <span className="text-2xl sm:text-4xl font-black font-display text-amber-300">
                    {firstPlace ? (firstPlace.todayGreenScore ?? firstPlace.currentGreenScore) : 96}
                  </span>
                  <span className="text-[9px] uppercase font-black text-amber-200 block font-display">Gold Points</span>
                  <p className="text-[9px] text-emerald-300 font-mono font-black mt-0.5">
                    {firstPlace ? `Only ${firstPlace.weeklyWasteAvgGrams}g waste!` : 'Only 180g!'}
                  </p>
                </div>
              </div>

              {/* 🥉 3RD PLACE PODIUM */}
              <div className={`rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 border-2 ${currentTheme.podiumBronzeBg} text-center flex flex-col justify-between shadow-lg relative min-h-[165px] sm:min-h-[195px]`}>
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-700 text-amber-100 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider font-display shadow-md flex items-center space-x-1 whitespace-nowrap">
                  <Medal className="w-2.5 h-2.5" />
                  <span>3rd Place</span>
                </div>

                <div className="pt-2">
                  <div className="text-2xl sm:text-3xl my-0.5">{thirdPlace?.mascot || '🥉'}</div>
                  <h3 className="text-xs sm:text-sm font-black text-white font-display leading-tight">
                    {thirdPlace ? thirdPlace.name : 'Classroom'}
                  </h3>
                  <p className="text-[9px] text-slate-300 font-bold truncate">
                    {thirdPlace ? thirdPlace.roomNumber : 'Room 102'}
                  </p>
                </div>

                <div className="mt-1 pt-1.5 border-t border-white/10">
                  <span className="text-xl sm:text-2xl font-black font-display text-white">
                    {thirdPlace ? (thirdPlace.todayGreenScore ?? thirdPlace.currentGreenScore) : 88}
                  </span>
                  <span className="text-[8px] uppercase font-bold text-slate-300 block">Green Points</span>
                  <p className="text-[8px] sm:text-[9px] text-emerald-400 font-mono font-bold mt-0.5">
                    {thirdPlace ? `${thirdPlace.weeklyWasteAvgGrams}g waste` : '310g'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. FULL NOTICE BOARD STANDINGS TABLE (Positions 4, 5, 6...) */}
          <div className="bg-slate-950/70 border border-white/15 rounded-2xl p-2 sm:p-3 space-y-1.5 my-1 sm:my-2">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-white/10 pb-1 font-display">
              <span>Full Notice Board Standings</span>
              <span>Waste • Score</span>
            </div>

            <div className="space-y-1">
              {rankedClassrooms.map((cls, idx) => {
                const score = cls.todayGreenScore ?? cls.currentGreenScore;
                const is1st = idx === 0;
                const is2nd = idx === 1;
                const is3rd = idx === 2;

                return (
                  <div
                    key={cls.id}
                    className={`flex items-center justify-between px-2 py-1 rounded-lg text-[10px] sm:text-xs transition-colors ${
                      is1st 
                        ? 'bg-amber-400/15 border border-amber-400/40 text-amber-200' 
                        : is2nd 
                        ? 'bg-slate-300/10 border border-slate-300/30 text-slate-200' 
                        : is3rd 
                        ? 'bg-amber-800/10 border border-amber-700/30 text-amber-200' 
                        : 'bg-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center font-black text-[9px] sm:text-[10px] font-display ${
                        is1st ? 'bg-amber-400 text-slate-950' : is2nd ? 'bg-slate-300 text-slate-950' : is3rd ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className="text-sm">{cls.mascot}</span>
                      <span className="font-black text-white font-display truncate max-w-[120px] sm:max-w-none">{cls.name}</span>
                      <span className="text-[9px] text-slate-400">({cls.roomNumber})</span>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-3 text-right">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono">{cls.weeklyWasteAvgGrams}g</span>
                      <span className="font-black font-mono text-xs sm:text-sm text-white">{score} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. ENVIRONMENTAL NOTICE BOARD METRICS */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 my-1">
            <div className="bg-slate-900/80 border border-emerald-500/40 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 text-center">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-0.5">
                <TreePine className="w-3.5 h-3.5" />
              </div>
              <p className="text-sm sm:text-lg font-black text-white font-display">
                {treesSaved} Trees
              </p>
              <p className="text-[8px] sm:text-[9px] text-emerald-400 font-bold uppercase">
                Paper Waste Diverted
              </p>
            </div>

            <div className="bg-slate-900/80 border border-teal-500/40 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 text-center">
              <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-0.5">
                <Trash2 className="w-3.5 h-3.5" />
              </div>
              <p className="text-sm sm:text-lg font-black text-white font-display">
                {itemsDiverted}+ Items
              </p>
              <p className="text-[8px] sm:text-[9px] text-teal-400 font-bold uppercase">
                Recycled Away from Landfills
              </p>
            </div>
          </div>

          {/* 5. BOTTOM SECTION: SLOGAN & AUDITOR SIGN-OFF */}
          <div className="border-t-2 border-white/20 pt-2 space-y-1">
            <div className="text-center">
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 font-display">
                ⭐ "{customSlogan}" ⭐
              </p>
            </div>

            <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-300 pt-0.5">
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-black text-white font-display leading-tight">Official Notice Board Bulletin</p>
                  <p className="text-[8px] text-slate-400">Audited by Student Detective Taskforce</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-black text-white font-display leading-tight">Oakridge EcoPatrol Squad</p>
                <p className="text-[8px] text-emerald-400 font-bold">Standard A4 Print Certified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE SAVE TO PHOTOS MODAL */}
      {exportedImageModalUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-4 text-center space-y-3 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white font-display flex items-center space-x-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Notice Board Poster Ready</span>
              </h3>
              <button
                onClick={() => setExportedImageModalUrl(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl text-xs text-emerald-300 font-medium">
              👉 <strong>Phone Save Tip:</strong> Long-press (touch & hold) the poster image below, then choose <strong>"Save to Photos"</strong> or <strong>"Download Image"</strong>!
            </div>

            <div className="max-h-[55vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950">
              <img
                src={exportedImageModalUrl}
                alt="Generated EcoPatrol Notice Board Poster"
                className="w-full rounded-xl object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => {
                  const newTab = window.open();
                  if (newTab) {
                    newTab.document.write(`<img src="${exportedImageModalUrl}" style="width:100%;max-width:800px;margin:auto;display:block;" />`);
                  }
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-black"
              >
                Open Full View
              </button>

              <button
                onClick={() => setExportedImageModalUrl(null)}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black font-display"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
