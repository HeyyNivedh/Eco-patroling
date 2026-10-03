import React, { useState, useEffect } from 'react';
import type { Classroom, AuditorProfile, AuditLog, AppTab } from './types';
import { storageService } from './services/storageService';
import { sound } from './services/soundService';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AuditorDashboard } from './components/Dashboard/AuditorDashboard';
import { LeaderboardView } from './components/Leaderboard/LeaderboardView';
import { CalendarView } from './components/Calendar/CalendarView';
import { PosterGeneratorView } from './components/PosterGenerator/PosterGeneratorView';
import { AuditWizardModal } from './components/AuditWizard/AuditWizardModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { ClassroomDetailModal } from './components/Leaderboard/ClassroomDetailModal';

export const App: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [auditor, setAuditor] = useState<AuditorProfile>(storageService.getAuditorProfile());
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [calendarTargetDate, setCalendarTargetDate] = useState<string | undefined>(undefined);
  const [auditWizardDate, setAuditWizardDate] = useState<string | undefined>(undefined);

  // Modals state
  const [isAuditWizardOpen, setIsAuditWizardOpen] = useState<boolean>(false);
  const [activeAuditClassroom, setActiveAuditClassroom] = useState<Classroom | undefined>(undefined);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [detailModalClassroom, setDetailModalClassroom] = useState<Classroom | null>(null);
  const [posterClassroomOverride, setPosterClassroomOverride] = useState<Classroom | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const loadedClassrooms = storageService.getClassrooms();
    const loadedAuditor = storageService.getAuditorProfile();
    setClassrooms(loadedClassrooms);
    setAuditor(loadedAuditor);
    sound.enabled = loadedAuditor.soundEnabled;
  }, []);

  // Launch Audit for class or generic
  const handleStartAudit = (classroom?: Classroom, dateStr?: string) => {
    setActiveAuditClassroom(classroom || classrooms[0]);
    setAuditWizardDate(dateStr);
    setIsAuditWizardOpen(true);
  };

  // When audit is completed & saved
  const handleAuditSaved = (_auditLog: AuditLog) => {
    const updatedClassrooms = storageService.getClassrooms();
    const updatedAuditor = storageService.getAuditorProfile();
    setClassrooms(updatedClassrooms);
    setAuditor(updatedAuditor);
  };

  // Toggle Sound FX
  const handleToggleSound = () => {
    const nextState = !auditor.soundEnabled;
    sound.enabled = nextState;
    const updated: AuditorProfile = { ...auditor, soundEnabled: nextState };
    setAuditor(updated);
    storageService.saveAuditorProfile(updated);
    if (nextState) sound.playPop();
  };

  // Update Auditor settings
  const handleUpdateAuditor = (updated: AuditorProfile) => {
    setAuditor(updated);
    storageService.saveAuditorProfile(updated);
  };

  // Reset Demo Data
  const handleResetData = () => {
    storageService.resetToDefaultData();
    setClassrooms(storageService.getClassrooms());
    setAuditor(storageService.getAuditorProfile());
  };

  // Open Poster for a specific classroom
  const handleOpenPosterForClass = (classroom: Classroom) => {
    setPosterClassroomOverride(classroom);
    setActiveTab('poster');
  };

  // Jump to Calendar
  const handleNavigateToCalendar = (dateStr?: string) => {
    if (dateStr) setCalendarTargetDate(dateStr);
    setActiveTab('calendar');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-400 selection:text-slate-950 font-sans pb-28 sm:pb-32 md:pb-0">
      
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab)}
        auditor={auditor}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onStartAudit={() => handleStartAudit()}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area (With bottom padding for Mobile Navigation) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {activeTab === 'dashboard' && (
          <AuditorDashboard
            classrooms={classrooms}
            onStartAuditForClass={handleStartAudit}
            onViewClassroomDetails={(cls) => setDetailModalClassroom(cls)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onOpenPosterForClass={handleOpenPosterForClass}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            classrooms={classrooms}
            onStartAudit={handleStartAudit}
            onOpenPosterForClass={handleOpenPosterForClass}
            onNavigateToCalendar={handleNavigateToCalendar}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            classrooms={classrooms}
            initialDate={calendarTargetDate}
            onStartAuditForDate={(cls, dateStr) => handleStartAudit(cls, dateStr)}
            onOpenPosterForClass={handleOpenPosterForClass}
            onViewClassroomDetails={(cls) => setDetailModalClassroom(cls)}
          />
        )}

        {activeTab === 'poster' && (
          <PosterGeneratorView
            classrooms={classrooms}
            selectedClassroomOverride={posterClassroomOverride}
          />
        )}
      </main>

      {/* Footer Branding (Hidden on mobile or during printing) */}
      <footer className="bg-slate-900/90 border-t border-slate-800/80 py-5 text-center text-xs text-slate-400 no-print mt-auto hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-black text-white font-display">EcoPatrol HQ</span>
            <span>• 7th Grade Environmental Audit Engine</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Student Environmental Conservation & Classroom Waste Auditing
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab)}
        onStartAudit={() => handleStartAudit()}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Full Audit Wizard Modal */}
      {isAuditWizardOpen && (
        <AuditWizardModal
          initialClassroom={activeAuditClassroom}
          allClassrooms={classrooms}
          initialDate={auditWizardDate}
          isOpen={isAuditWizardOpen}
          onClose={() => setIsAuditWizardOpen(false)}
          onAuditSaved={handleAuditSaved}
          geminiApiKey={auditor.geminiApiKey}
        />
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          auditor={auditor}
          onUpdateAuditor={handleUpdateAuditor}
          onResetData={handleResetData}
        />
      )}

      {/* Classroom Quick Detail Modal */}
      {detailModalClassroom && (
        <ClassroomDetailModal
          classroom={detailModalClassroom}
          onClose={() => setDetailModalClassroom(null)}
          onStartAudit={handleStartAudit}
          onOpenPosterForClass={handleOpenPosterForClass}
          onNavigateToCalendar={handleNavigateToCalendar}
        />
      )}
    </div>
  );
};

export default App;

