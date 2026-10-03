import React, { useState } from 'react';
import type { Classroom, AuditLog, WasteAssessment } from '../../types';
import { WasteScannerStep } from './WasteScannerStep';
import { SummarySubmissionStep } from './SummarySubmissionStep';
import { storageService } from '../../services/storageService';
import { calculateGreenScore, calculateAuditorXp } from '../../services/scoringEngine';
import { X, Check, Camera, Trophy } from 'lucide-react';
import { sound } from '../../services/soundService';

interface AuditWizardModalProps {
  initialClassroom?: Classroom;
  allClassrooms: Classroom[];
  initialDate?: string;
  isOpen: boolean;
  onClose: () => void;
  onAuditSaved: (auditLog: AuditLog) => void;
  geminiApiKey?: string;
}

export const AuditWizardModal: React.FC<AuditWizardModalProps> = ({
  initialClassroom,
  allClassrooms,
  initialDate,
  isOpen,
  onClose,
  onAuditSaved,
}) => {
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom>(
    initialClassroom || allClassrooms[0]
  );
  const [auditDate, setAuditDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  // Pure 2-step flow: 1. Waste Check -> 2. Score & Award
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [wastePhotoUrl, setWastePhotoUrl] = useState<string>('');
  const [wasteAssessment, setWasteAssessment] = useState<WasteAssessment>({
    fullness: 'normal',
    estimatedGrams: 400,
    mainStream: 'paper',
    isProperlySorted: true,
  });
  const [notes] = useState<string>('');

  if (!isOpen || !selectedClassroom) return null;

  // Waste Score Calculation
  const scoreBreakdown = calculateGreenScore(
    [],
    selectedClassroom.studentCount,
    wasteAssessment
  );

  const xpEarned = calculateAuditorXp(
    scoreBreakdown.finalScore,
    !!wastePhotoUrl
  );

  const auditor = storageService.getAuditorProfile();
  const totalWasteGrams = wasteAssessment.estimatedGrams;

  // Save Final Audit
  const handleFinalSubmit = () => {
    const auditLog: AuditLog = {
      id: `audit-${Date.now()}`,
      classroomId: selectedClassroom.id,
      classroomName: selectedClassroom.name,
      auditorName: auditor.name,
      auditorId: 'auditor-active',
      date: auditDate,
      timestamp: Date.now(),

      energyInfractions: [],
      wasteItems: [],
      wasteAssessment,
      totalWasteGrams,
      wastePerStudentGrams: Math.round((totalWasteGrams / selectedClassroom.studentCount) * 10) / 10,
      totalEnergyInfractionsCount: 0,
      totalWattsWasted: 0,
      greenScore: scoreBreakdown.finalScore,
      scoreBreakdown,
      wastePhotoUrl,
      notes,
      xpEarned,
      badgesUnlocked: [],
    };

    storageService.addAudit(auditLog);
    onAuditSaved(auditLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center sm:p-4">
      {/* Dark sleek wizard container */}
      <div className="bg-slate-900 sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-800 overflow-hidden h-full sm:h-auto sm:max-h-[92vh] flex flex-col text-slate-100">
        
        {/* Wizard Top Header */}
        <div className="p-3.5 sm:p-5 bg-slate-950 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/30">
              🗑️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-display tracking-tight text-white flex items-center space-x-2">
                <span>Classroom Waste Audit</span>
              </h2>
              {/* Classroom Switcher Dropdown & Audit Date */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] text-slate-400 font-bold">Class:</span>
                  <select
                    value={selectedClassroom.id}
                    onChange={(e) => {
                      const found = allClassrooms.find((c) => c.id === e.target.value);
                      if (found) {
                        sound.playPop();
                        setSelectedClassroom(found);
                      }
                    }}
                    disabled={currentStep > 1}
                    className="bg-slate-850 text-emerald-400 text-xs font-black px-2 py-0.5 rounded-lg border border-slate-700 focus:outline-none"
                  >
                    {allClassrooms.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.roomNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] text-slate-400 font-bold">Date:</span>
                  <input
                    type="date"
                    value={auditDate}
                    onChange={(e) => {
                      if (e.target.value) setAuditDate(e.target.value);
                    }}
                    disabled={currentStep > 1}
                    className="bg-slate-850 text-indigo-300 text-xs font-bold px-2 py-0.5 rounded-lg border border-slate-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            aria-label="Close Audit"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Indicator Bar (2 Clean Steps) */}
        <div className="bg-slate-950/60 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between max-w-xs mx-auto">
            {/* Step 1: Waste Check */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                currentStep >= 1 ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-500'
              }`}>
                {currentStep > 1 ? <Check className="w-4 h-4" /> : <Camera className="w-3.5 h-3.5" />}
              </div>
              <span className={`text-[11px] sm:text-xs font-black ${currentStep === 1 ? 'text-emerald-400 font-display' : 'text-slate-500'}`}>
                1. Waste Check
              </span>
            </div>

            <div className={`h-1 flex-1 mx-3 rounded-full transition-colors ${currentStep > 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} />

            {/* Step 2: Score & Award */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                currentStep === 2 ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-500'
              }`}>
                <Trophy className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[11px] sm:text-xs font-black ${currentStep === 2 ? 'text-amber-400 font-display' : 'text-slate-500'}`}>
                2. Score & Award
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Wizard Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain bg-slate-900/90">
          {currentStep === 1 && (
            <WasteScannerStep
              classroom={selectedClassroom}
              wastePhotoUrl={wastePhotoUrl}
              setWastePhotoUrl={setWastePhotoUrl}
              wasteAssessment={wasteAssessment}
              setWasteAssessment={setWasteAssessment}
              onNext={() => setCurrentStep(2)}
              onBack={onClose}
            />
          )}

          {currentStep === 2 && (
            <SummarySubmissionStep
              classroom={selectedClassroom}
              energyInfractions={[]}
              wasteItems={[]}
              wasteAssessment={wasteAssessment}
              scoreBreakdown={scoreBreakdown}
              xpEarned={xpEarned}
              onSubmitFinalAudit={handleFinalSubmit}
              onBack={() => setCurrentStep(1)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
