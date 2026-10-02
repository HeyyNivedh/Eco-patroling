import React, { useState, useRef, useMemo } from 'react';
import type { Classroom, BinFullness, WasteAssessment, ManualWasteItem } from '../../types';
import { 
  Camera, 
  UploadCloud, 
  Sparkles, 
  RefreshCw, 
  ArrowLeft,
  Plus,
  Minus,
  PlusCircle,
  X,
  Check
} from 'lucide-react';
import { sound } from '../../services/soundService';

interface WasteScannerStepProps {
  classroom: Classroom;
  wastePhotoUrl: string;
  setWastePhotoUrl: (url: string) => void;
  wasteAssessment: WasteAssessment;
  setWasteAssessment: React.Dispatch<React.SetStateAction<WasteAssessment>>;
  onNext: () => void;
  onBack: () => void;
}

const FULLNESS_OPTIONS: { id: BinFullness; label: string; grams: number; emoji: string; color: string }[] = [
  { id: 'light', label: 'Light / Low', grams: 150, emoji: '🟢', color: 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300' },
  { id: 'normal', label: 'Half Full', grams: 400, emoji: '🟡', color: 'border-amber-500/60 bg-amber-950/40 text-amber-300' },
  { id: 'heavy', label: 'Full / Heavy', grams: 750, emoji: '🟠', color: 'border-orange-500/60 bg-orange-950/40 text-orange-300' },
  { id: 'overflowing', label: 'Overflowing', grams: 1200, emoji: '🔴', color: 'border-rose-500/60 bg-rose-950/40 text-rose-300' },
];

const INITIAL_MANUAL_ITEMS: ManualWasteItem[] = [
  { id: 'paper-roll', name: 'Paper Roll / Tube', emoji: '🧻', unitWeightGrams: 25, count: 0 },
  { id: 'pen', name: 'Pen / Marker', emoji: '🖊️', unitWeightGrams: 12, count: 0 },
  { id: 'pencil', name: 'Pencil', emoji: '✏️', unitWeightGrams: 8, count: 0 },
  { id: 'worksheet', name: 'Paper Sheet / Worksheet', emoji: '📄', unitWeightGrams: 5, count: 0 },
  { id: 'bottle', name: 'Plastic Bottle / Cup', emoji: '🥤', unitWeightGrams: 30, count: 0 },
  { id: 'wrapper', name: 'Snack Wrapper / Foil', emoji: '🥪', unitWeightGrams: 5, count: 0 },
  { id: 'cardboard', name: 'Cardboard Box / Scrap', emoji: '📦', unitWeightGrams: 50, count: 0 },
  { id: 'food', name: 'Food Scrap / Fruit Core', emoji: '🍎', unitWeightGrams: 60, count: 0 },
];

const SAMPLE_PHOTO = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80';

export const WasteScannerStep: React.FC<WasteScannerStepProps> = ({
  classroom,
  wastePhotoUrl,
  setWastePhotoUrl,
  wasteAssessment,
  setWasteAssessment,
  onNext,
  onBack,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [photoGrams, setPhotoGrams] = useState<number>(wasteAssessment.photoDetectedGrams || 380);
  const [hasPhotoScanned, setHasPhotoScanned] = useState<boolean>(Boolean(wastePhotoUrl));
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Manual items list state
  const [manualItems, setManualItems] = useState<ManualWasteItem[]>(() => {
    if (wasteAssessment.manualItems && wasteAssessment.manualItems.length > 0) {
      return wasteAssessment.manualItems;
    }
    return INITIAL_MANUAL_ITEMS;
  });

  // Custom Item Modal/Form state
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customWeight, setCustomWeight] = useState(15);
  const [customEmoji, setCustomEmoji] = useState('🗑️');

  // Sum of all manual items
  const manualItemsTotalGrams = useMemo(() => {
    return manualItems.reduce((acc, item) => acc + (item.count * item.unitWeightGrams), 0);
  }, [manualItems]);

  const manualItemsTotalCount = useMemo(() => {
    return manualItems.reduce((acc, item) => acc + item.count, 0);
  }, [manualItems]);

  // Base bin weight: if photo is taken, use photoGrams; otherwise use fullness grams
  const baseBinGrams = useMemo(() => {
    if (hasPhotoScanned) {
      return photoGrams;
    }
    const matched = FULLNESS_OPTIONS.find((opt) => opt.id === wasteAssessment.fullness);
    return matched ? matched.grams : 400;
  }, [hasPhotoScanned, photoGrams, wasteAssessment.fullness]);

  // Total grams = base bin + manual items
  const totalGrams = baseBinGrams + manualItemsTotalGrams;

  // Sync state up to parent wasteAssessment whenever totalGrams or manualItems change
  const syncAssessment = (newTotal: number, newManual: ManualWasteItem[], detectedPhotoGrams?: number) => {
    setWasteAssessment((prev) => ({
      ...prev,
      estimatedGrams: newTotal,
      photoDetectedGrams: detectedPhotoGrams ?? prev.photoDetectedGrams,
      manualItems: newManual,
    }));
  };

  // File or camera capture handler
  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setWastePhotoUrl(url);
        simulateAiDetection(url);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick 1-click sample photo
  const handleUseSample = () => {
    sound.playPop();
    setWastePhotoUrl(SAMPLE_PHOTO);
    simulateAiDetection(SAMPLE_PHOTO);
  };

  // Quick AI Scan Simulation (1.2s delay with happy chime)
  const simulateAiDetection = (photoUrl: string) => {
    setIsScanning(true);
    sound.playScan();
    // Simulate smart detection between 340g - 420g
    const calculatedGrams = 380;
    setTimeout(() => {
      setIsScanning(false);
      setHasPhotoScanned(true);
      setPhotoGrams(calculatedGrams);
      sound.playBadge();
      const newTotal = calculatedGrams + manualItemsTotalGrams;
      setWasteAssessment((prev) => ({
        ...prev,
        photoUrl,
        fullness: 'normal',
        photoDetectedGrams: calculatedGrams,
        estimatedGrams: newTotal,
        manualItems,
      }));
    }, 1200);
  };

  // Fullness selection
  const handleSelectFullness = (fullness: BinFullness, grams: number) => {
    sound.playPop();
    setPhotoGrams(grams);
    const newTotal = grams + manualItemsTotalGrams;
    setWasteAssessment((prev) => ({
      ...prev,
      fullness,
      photoDetectedGrams: hasPhotoScanned ? grams : undefined,
      estimatedGrams: newTotal,
      manualItems,
    }));
  };

  // Adjust photo grams manually if needed (+/- 25g)
  const adjustPhotoGrams = (delta: number) => {
    sound.playPop();
    const updated = Math.max(50, photoGrams + delta);
    setPhotoGrams(updated);
    const newTotal = updated + manualItemsTotalGrams;
    syncAssessment(newTotal, manualItems, updated);
  };

  // Modify manual item count
  const handleUpdateItemCount = (id: string, delta: number) => {
    sound.playPop();
    const updated = manualItems.map((item) => {
      if (item.id === id) {
        const nextCount = Math.max(0, item.count + delta);
        return { ...item, count: nextCount };
      }
      return item;
    });
    setManualItems(updated);
    const newManualTotal = updated.reduce((acc, item) => acc + (item.count * item.unitWeightGrams), 0);
    const newTotal = baseBinGrams + newManualTotal;
    syncAssessment(newTotal, updated, photoGrams);
  };

  // Add custom manual item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    sound.playBadge();
    const newItem: ManualWasteItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      emoji: customEmoji || '📦',
      unitWeightGrams: Math.max(1, Number(customWeight) || 10),
      count: 1,
    };
    const updated = [...manualItems, newItem];
    setManualItems(updated);
    const newManualTotal = updated.reduce((acc, item) => acc + (item.count * item.unitWeightGrams), 0);
    const newTotal = baseBinGrams + newManualTotal;
    syncAssessment(newTotal, updated, photoGrams);
    setIsAddingCustom(false);
    setCustomName('');
    setCustomWeight(15);
  };

  return (
    <div className="space-y-5 text-slate-100">
      
      {/* Step Header */}
      <div className="bg-slate-900/90 rounded-2xl p-3.5 sm:p-4 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{classroom.mascot}</div>
          <div>
            <h3 className="text-base font-black text-white font-display">
              {classroom.name} Classroom Waste Audit
            </h3>
            <p className="text-xs text-emerald-400 font-bold">
              Snap bin photo or add individual classroom waste items
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-display">Step 1/2</span>
          <p className="text-xs sm:text-sm font-black text-emerald-400 font-display">Waste Check</p>
        </div>
      </div>

      {/* Hidden Native Mobile Camera Input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageSelected}
        className="hidden"
      />

      {/* Hidden File Picker Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelected}
        className="hidden"
      />

      {/* SECTION 1: PHOTO CAPTURE & AI GRAMS CALCULATION */}
      <div className="bg-slate-900/80 rounded-3xl p-4 sm:p-5 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2 font-display">
            <span>📷 Step 1: Bin Photo & Weight Calculation</span>
          </h4>
          {hasPhotoScanned && (
            <span className="text-xs text-emerald-400 font-black flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>Photo Analyzed</span>
            </span>
          )}
        </div>

        {!wastePhotoUrl ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Native Mobile Camera Button */}
              <button
                onClick={() => {
                  sound.playPop();
                  cameraInputRef.current?.click();
                }}
                className="p-5 bg-gradient-to-br from-emerald-950/40 to-slate-900 hover:from-emerald-900/50 hover:to-slate-800 border-2 border-dashed border-emerald-500/60 rounded-3xl flex flex-col items-center justify-center text-center transition-all group cursor-pointer active:scale-95 shadow-md"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform mb-2">
                  <Camera className="w-7 h-7" />
                </div>
                <h5 className="text-sm sm:text-base font-black text-white font-display">
                  Take Photo with Camera 📸
                </h5>
                <p className="text-[11px] text-emerald-300/80 font-bold mt-0.5">
                  Opens camera & automatically calculates waste in grams
                </p>
              </button>

              {/* Upload File / Gallery Button */}
              <button
                onClick={() => {
                  sound.playPop();
                  fileInputRef.current?.click();
                }}
                className="p-5 bg-slate-900/90 hover:bg-slate-850 border-2 border-dashed border-slate-700 rounded-3xl flex flex-col items-center justify-center text-center transition-all group cursor-pointer active:scale-95 shadow-md"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-200 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform mb-2">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h5 className="text-sm sm:text-base font-black text-white font-display">
                  Choose from Photos 📁
                </h5>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                  Upload an image from device gallery
                </p>
              </button>
            </div>

            {/* Quick 1-Tap Sample Photo for Laptops or Quick Testing */}
            <div className="text-center pt-1">
              <button
                onClick={handleUseSample}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-950/40 hover:bg-amber-900/50 active:scale-95 text-amber-300 rounded-xl text-xs font-black transition-all cursor-pointer font-display border border-amber-500/40"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Or Tap to Use a Sample Classroom Bin Photo</span>
              </button>
            </div>
          </div>
        ) : (
          /* Scanned Photo Banner + AI Calculation Display */
          <div className="space-y-3">
            <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/80 bg-slate-950 shadow-xl">
              <img
                src={wastePhotoUrl}
                alt="Classroom Waste Bin"
                className="w-full h-44 sm:h-52 object-cover"
              />

              {/* Scanning Beam Animation */}
              {isScanning && (
                <div className="absolute inset-0 bg-emerald-500/25 pointer-events-none flex flex-col justify-between">
                  <div className="h-1.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent w-full animate-scanline" />
                  <div className="p-3 text-center">
                    <span className="inline-flex items-center space-x-2 bg-slate-950/95 text-emerald-300 text-xs font-black px-4 py-2 rounded-full border border-emerald-400 animate-pulse font-display">
                      <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                      <span>AI Vision: Calculating Waste Weight in Grams...</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Retake Button */}
              {!isScanning && (
                <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      sound.playPop();
                      setWastePhotoUrl('');
                      setHasPhotoScanned(false);
                    }}
                    className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 text-white text-[11px] font-black rounded-xl backdrop-blur-sm transition-all flex items-center space-x-1 cursor-pointer active:scale-95 font-display border border-slate-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake Photo</span>
                  </button>
                </div>
              )}

              {/* AI Badge Overlay */}
              {!isScanning && (
                <div className="absolute top-2 left-2">
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm font-display flex items-center space-x-1">
                    <span>✓ Weight Calculated</span>
                  </span>
                </div>
              )}
            </div>

            {/* PROMINENT AI PHOTO CALCULATION RESULT CARD */}
            {!isScanning && (
              <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-2 border-emerald-500/70 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-2xl shrink-0">
                    ⚖️
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                        Photo AI Analysis
                      </span>
                      <span className="text-xs text-slate-400 font-bold">Visual Density: Normal</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
                      <span className="text-emerald-400 font-mono">{photoGrams} grams</span>
                      <span className="text-xs font-bold text-slate-300 ml-2">detected in bin</span>
                    </p>
                  </div>
                </div>

                {/* Quick Calibrate Buttons */}
                <div className="flex items-center space-x-1.5 self-end sm:self-center">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">Calibrate:</span>
                  <button
                    type="button"
                    onClick={() => adjustPhotoGrams(-25)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black rounded-lg border border-slate-700 cursor-pointer active:scale-95"
                    title="Subtract 25 grams"
                  >
                    -25g
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustPhotoGrams(25)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black rounded-lg border border-slate-700 cursor-pointer active:scale-95"
                    title="Add 25 grams"
                  >
                    +25g
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bin Fullness Quick Presets */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 font-display">
            <span>Or Select Bin Level / Fill Preset:</span>
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FULLNESS_OPTIONS.map((opt) => {
              const isSelected = wasteAssessment.fullness === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectFullness(opt.id, opt.grams)}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer text-left active:scale-95 flex flex-col justify-between ${
                    isSelected
                      ? `${opt.color} ring-2 ring-emerald-400 shadow-md font-black`
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 font-bold'
                  }`}
                >
                  <span className="text-xl mb-1">{opt.emoji}</span>
                  <div>
                    <p className="text-xs font-black font-display leading-tight">{opt.label}</p>
                    <p className="text-[10px] opacity-75 mt-0.5 font-mono">~{opt.grams} grams</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: ADD INDIVIDUAL / MANUAL WASTE ITEMS */}
      <div className="bg-slate-900/80 rounded-3xl p-4 sm:p-5 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2 font-display">
              <span>📝 Step 2: Add Waste Individually (Manual Count)</span>
            </h4>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Tap + / - to add specific items like paper rolls, pens, pencils, and snack wrappers
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setIsAddingCustom(!isAddingCustom);
            }}
            className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 text-xs font-black rounded-xl border border-slate-700 active:scale-95 cursor-pointer font-display"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Custom Item</span>
          </button>
        </div>

        {/* Custom Item Form Modal / Drawer */}
        {isAddingCustom && (
          <form onSubmit={handleAddCustomItem} className="bg-slate-950 rounded-2xl p-3.5 border-2 border-emerald-500/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-300 uppercase tracking-wider font-display">
                Add Custom Waste Item
              </span>
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Milk Carton, Eraser"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Weight in Grams</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={customWeight}
                  onChange={(e) => setCustomWeight(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Emoji Icon</label>
                <input
                  type="text"
                  maxLength={2}
                  value={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold text-center focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
              >
                Add to List ➔
              </button>
            </div>
          </form>
        )}

        {/* Manual Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {manualItems.map((item) => {
            const isAdded = item.count > 0;
            const itemTotalGrams = item.count * item.unitWeightGrams;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isAdded
                    ? 'bg-emerald-950/30 border-emerald-500/60 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-750'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-white font-display leading-tight">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      ~{item.unitWeightGrams}g each
                      {isAdded && (
                        <span className="ml-1.5 text-emerald-400 font-bold font-mono">
                          ({itemTotalGrams}g total)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Counter Stepper (- / count / +) */}
                <div className="flex items-center space-x-1.5 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleUpdateItemCount(item.id, -1)}
                    disabled={item.count === 0}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      item.count > 0
                        ? 'bg-slate-800 hover:bg-slate-700 text-white active:scale-90'
                        : 'text-slate-600 opacity-40 cursor-not-allowed'
                    }`}
                    aria-label={`Decrease ${item.name}`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className={`w-7 text-center font-mono text-xs font-black ${
                    item.count > 0 ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    {item.count}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleUpdateItemCount(item.id, 1)}
                    className="w-7 h-7 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer active:scale-90 border border-emerald-500/30"
                    aria-label={`Increase ${item.name}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Manual Items Subtotal Summary if any items added */}
        {manualItemsTotalCount > 0 && (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-300">
              📦 Logged {manualItemsTotalCount} individual items:
            </span>
            <span className="font-black text-emerald-400 font-mono text-sm">
              +{manualItemsTotalGrams} grams added
            </span>
          </div>
        )}
      </div>

      {/* COMBINED TOTAL WASTE CALCULATION BAR */}
      <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 border-2 border-emerald-500/60 shadow-xl space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-display">
              Total Calculated Waste
            </span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono font-display">
                {totalGrams}g
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-300">
                (~{Math.round(totalGrams / Math.max(1, classroom.studentCount))}g / student)
              </span>
            </div>
          </div>

          {/* Breakdown pill */}
          <div className="text-right text-xs space-y-0.5">
            <p className="text-slate-400 font-medium">
              Bin Base: <strong className="text-white font-mono">{baseBinGrams}g</strong>
            </p>
            {manualItemsTotalGrams > 0 && (
              <p className="text-emerald-400 font-medium">
                Individual Items: <strong className="font-mono">+{manualItemsTotalGrams}g</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-2">
        <button
          onClick={onBack}
          className="py-3 px-3 sm:px-4 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors flex items-center space-x-1 cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={() => {
            sound.playPop();
            onNext();
          }}
          className="flex-1 sm:flex-initial py-3.5 px-6 sm:px-8 text-xs sm:text-sm font-black rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-display active:scale-95 shadow-emerald-500/25"
        >
          <span>Calculate Green Score ({totalGrams}g) ➔</span>
        </button>
      </div>
    </div>
  );
};
