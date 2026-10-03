import type { Classroom, AuditLog, ScoreBreakdown } from '../types';

export interface DailyPlacement {
  classroom: Classroom;
  rank: number;
  greenScore: number;
  wasteGrams: number;
  wastePerStudentGrams: number;
  energyInfractionsCount: number;
  auditLog: AuditLog;
  totalAuditedOnDay: number;
}

export interface DayAuditSummary {
  date: string;
  dateFormatted: string;
  totalAudited: number;
  winner?: DailyPlacement;
  placements: DailyPlacement[];
  averageScore: number;
  totalWasteGrams: number;
}

export interface ClassDayHistoryEntry {
  date: string;
  dateFormatted: string;
  rank: number;
  totalAuditedOnDay: number;
  greenScore: number;
  wasteGrams: number;
  wastePerStudentGrams: number;
  energyInfractionsCount: number;
  auditLog: AuditLog;
  isWinner: boolean;
}

export const calendarService = {
  /**
   * Format Date to 'YYYY-MM-DD' without timezone shift
   */
  formatDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Format 'YYYY-MM-DD' string to readable format e.g. 'Fri, Oct 2, 2026'
   */
  formatDateDisplay(dateStr: string, options?: { includeDayOfWeek?: boolean; fullMonth?: boolean }): string {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString('en-US', {
      weekday: options?.includeDayOfWeek !== false ? 'short' : undefined,
      month: options?.fullMonth ? 'long' : 'short',
      day: 'numeric',
      year: 'numeric',
    });
  },

  /**
   * Extract all unique dates that have audits across all classrooms
   */
  getAllAuditedDates(classrooms: Classroom[]): string[] {
    const dateSet = new Set<string>();
    for (const cls of classrooms) {
      if (cls.historicalAudits) {
        for (const audit of cls.historicalAudits) {
          if (audit.date) {
            dateSet.add(audit.date);
          }
        }
      }
    }
    // Return sorted descending (newest first)
    return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  },

  /**
   * Compute exact placements of all classrooms audited on a specific date
   */
  getPlacementsForDate(classrooms: Classroom[], dateStr: string): DailyPlacement[] {
    const auditedList: { classroom: Classroom; auditLog: AuditLog }[] = [];

    for (const cls of classrooms) {
      if (!cls.historicalAudits) continue;
      // If a classroom has an audit on this date
      const audit = cls.historicalAudits.find((a) => a.date === dateStr);
      if (audit) {
        auditedList.push({ classroom: cls, auditLog: audit });
      }
    }

    if (auditedList.length === 0) return [];

    // Sort: highest green score first; tie breaker: lowest waste per student; tie breaker 2: lowest total waste
    auditedList.sort((a, b) => {
      if (b.auditLog.greenScore !== a.auditLog.greenScore) {
        return b.auditLog.greenScore - a.auditLog.greenScore;
      }
      if (a.auditLog.wastePerStudentGrams !== b.auditLog.wastePerStudentGrams) {
        return a.auditLog.wastePerStudentGrams - b.auditLog.wastePerStudentGrams;
      }
      return a.auditLog.totalWasteGrams - b.auditLog.totalWasteGrams;
    });

    const totalAudited = auditedList.length;

    return auditedList.map((item, index) => ({
      classroom: item.classroom,
      rank: index + 1,
      greenScore: item.auditLog.greenScore,
      wasteGrams: item.auditLog.totalWasteGrams,
      wastePerStudentGrams: item.auditLog.wastePerStudentGrams,
      energyInfractionsCount: item.auditLog.totalEnergyInfractionsCount ?? 0,
      auditLog: item.auditLog,
      totalAuditedOnDay: totalAudited,
    }));
  },

  /**
   * Get a full summary of an entire day's audit placements
   */
  getDayAuditSummary(classrooms: Classroom[], dateStr: string): DayAuditSummary {
    const placements = this.getPlacementsForDate(classrooms, dateStr);
    const totalAudited = placements.length;

    if (totalAudited === 0) {
      return {
        date: dateStr,
        dateFormatted: this.formatDateDisplay(dateStr),
        totalAudited: 0,
        placements: [],
        averageScore: 0,
        totalWasteGrams: 0,
      };
    }

    const totalScore = placements.reduce((sum, p) => sum + p.greenScore, 0);
    const totalWaste = placements.reduce((sum, p) => sum + p.wasteGrams, 0);

    return {
      date: dateStr,
      dateFormatted: this.formatDateDisplay(dateStr),
      totalAudited,
      winner: placements[0],
      placements,
      averageScore: Math.round(totalScore / totalAudited),
      totalWasteGrams: totalWaste,
    };
  },

  /**
   * For a single classroom: get all days it was audited, and what position it placed on each day
   */
  getClassroomPlacementHistory(classrooms: Classroom[], classroomId: string): ClassDayHistoryEntry[] {
    const targetClass = classrooms.find((c) => c.id === classroomId);
    if (!targetClass || !targetClass.historicalAudits || targetClass.historicalAudits.length === 0) {
      return [];
    }

    const history: ClassDayHistoryEntry[] = [];

    for (const audit of targetClass.historicalAudits) {
      const dateStr = audit.date;
      if (!dateStr) continue;

      // Compute day placements among all classes
      const dayPlacements = this.getPlacementsForDate(classrooms, dateStr);
      const foundIndex = dayPlacements.findIndex((p) => p.classroom.id === classroomId);
      const rank = foundIndex >= 0 ? dayPlacements[foundIndex].rank : 1;
      const totalOnDay = dayPlacements.length;

      history.push({
        date: dateStr,
        dateFormatted: this.formatDateDisplay(dateStr),
        rank,
        totalAuditedOnDay: totalOnDay,
        greenScore: audit.greenScore,
        wasteGrams: audit.totalWasteGrams,
        wastePerStudentGrams: audit.wastePerStudentGrams,
        energyInfractionsCount: audit.totalEnergyInfractionsCount ?? 0,
        auditLog: audit,
        isWinner: rank === 1,
      });
    }

    // Sort chronological descending (latest date first)
    return history.sort((a, b) => b.date.localeCompare(a.date));
  },

  /**
   * Map of day summaries for a specific month
   */
  getMonthAuditsMap(classrooms: Classroom[], year: number, monthIndex: number): Map<string, DayAuditSummary> {
    const map = new Map<string, DayAuditSummary>();
    // MonthIndex is 0-11
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const mStr = String(monthIndex + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;

      const summary = this.getDayAuditSummary(classrooms, dateStr);
      if (summary.totalAudited > 0) {
        map.set(dateStr, summary);
      }
    }

    return map;
  },

  /**
   * Generate realistic past audit data for demo/default initialization
   */
  createSampleAudits(classrooms: Classroom[]): Classroom[] {
    const now = new Date();

    // Helper to get past date string
    const getPastDateStr = (daysAgo: number): string => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      return this.formatDateISO(d);
    };

    const getPastTimestamp = (daysAgo: number, hour = 11): number => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      d.setHours(hour, 30, 0, 0);
      return d.getTime();
    };

    const createBreakdown = (score: number): ScoreBreakdown => {
      const tier = score >= 90 ? 'Eco Hero' : score >= 75 ? 'Green Guardian' : score >= 60 ? 'Eco Explorer' : 'Needs Eco-Love';
      const tierColor = score >= 90 ? 'emerald' : score >= 75 ? 'teal' : score >= 60 ? 'amber' : 'rose';
      return {
        baseScore: 100,
        wastePenalty: Math.max(0, 100 - score - 5),
        energyPenalty: 5,
        sortingBonus: score >= 85 ? 10 : 0,
        finalScore: score,
        tier,
        tierColor,
        summaryFeedback: score >= 90 ? 'Outstanding sorting and minimal waste!' : 'Good effort, some recyclable items were misclassified.',
      };
    };

    // Define past days and participating classes with scores
    interface DayPlan {
      daysAgo: number;
      audits: {
        classId: string;
        greenScore: number;
        totalWasteGrams: number;
        infractions: number;
        notes: string;
      }[];
    }

    const pastPlans: DayPlan[] = [
      {
        daysAgo: 1, // Yesterday
        audits: [
          { classId: 'class-7a', greenScore: 98, totalWasteGrams: 140, infractions: 0, notes: 'Impeccable bin sorting! All compost separated.' },
          { classId: 'class-5b', greenScore: 94, totalWasteGrams: 210, infractions: 0, notes: 'Clean paper recycling bin. Great job!' },
          { classId: 'class-4a', greenScore: 90, totalWasteGrams: 260, infractions: 1, notes: 'One monitor left idling at lunch, otherwise stellar.' },
          { classId: 'class-8a', greenScore: 84, totalWasteGrams: 390, infractions: 1, notes: 'Some snack plastic wrappers in general waste.' },
          { classId: 'class-2c', greenScore: 78, totalWasteGrams: 480, infractions: 2, notes: 'Ceiling fans running in empty room.' },
          { classId: 'class-kg-a', greenScore: 74, totalWasteGrams: 520, infractions: 1, notes: 'Juice carton in paper bin.' },
        ],
      },
      {
        daysAgo: 2, // 2 days ago
        audits: [
          { classId: 'class-6b', greenScore: 99, totalWasteGrams: 110, infractions: 0, notes: 'Classroom of the day! Zero food waste.' },
          { classId: 'class-7a', greenScore: 95, totalWasteGrams: 170, infractions: 0, notes: 'Excellent sorting and power switches off.' },
          { classId: 'class-3a', greenScore: 91, totalWasteGrams: 240, infractions: 1, notes: 'Clean room, lights switched off.' },
          { classId: 'class-1b', greenScore: 85, totalWasteGrams: 320, infractions: 1, notes: 'Recycling bin 80% properly sorted.' },
          { classId: 'class-9a', greenScore: 80, totalWasteGrams: 440, infractions: 2, notes: 'Charging strip idling, heavy paper waste.' },
        ],
      },
      {
        daysAgo: 3, // 3 days ago
        audits: [
          { classId: 'class-5a', greenScore: 97, totalWasteGrams: 130, infractions: 0, notes: 'Top marks! Student monitors turned all devices off.' },
          { classId: 'class-7b', greenScore: 93, totalWasteGrams: 190, infractions: 0, notes: 'Very low waste footprint per student.' },
          { classId: 'class-6a', greenScore: 89, totalWasteGrams: 270, infractions: 1, notes: 'Projector left on standby screen.' },
          { classId: 'class-8b', greenScore: 83, totalWasteGrams: 380, infractions: 1, notes: 'Plastic wrappers found in paper stream.' },
          { classId: 'class-10a', greenScore: 76, totalWasteGrams: 490, infractions: 2, notes: 'Lights glowing during lunch break.' },
        ],
      },
      {
        daysAgo: 4, // 4 days ago
        audits: [
          { classId: 'class-8b', greenScore: 98, totalWasteGrams: 120, infractions: 0, notes: 'Exceptional sorting by 8th graders!' },
          { classId: 'class-7a', greenScore: 94, totalWasteGrams: 180, infractions: 0, notes: 'Consistent high performer.' },
          { classId: 'class-4b', greenScore: 91, totalWasteGrams: 230, infractions: 1, notes: 'Minimal waste, projector switched off.' },
          { classId: 'class-3c', greenScore: 86, totalWasteGrams: 340, infractions: 1, notes: 'Paper scraps around bins picked up.' },
          { classId: 'class-ug-b', greenScore: 79, totalWasteGrams: 420, infractions: 1, notes: 'Snack packaging in compost bin.' },
        ],
      },
      {
        daysAgo: 5, // 5 days ago
        audits: [
          { classId: 'class-3b', greenScore: 96, totalWasteGrams: 150, infractions: 0, notes: 'Super clean classroom and bins!' },
          { classId: 'class-6c', greenScore: 92, totalWasteGrams: 200, infractions: 0, notes: 'All switches turned off during recess.' },
          { classId: 'class-5c', greenScore: 88, totalWasteGrams: 290, infractions: 1, notes: 'Solid recycling hygiene.' },
          { classId: 'class-2a', greenScore: 82, totalWasteGrams: 410, infractions: 2, notes: 'Fans running with windows open.' },
        ],
      },
      {
        daysAgo: 7, // 1 week ago
        audits: [
          { classId: 'class-7c', greenScore: 97, totalWasteGrams: 140, infractions: 0, notes: 'Weekly champion! Outstanding effort.' },
          { classId: 'class-8a', greenScore: 93, totalWasteGrams: 190, infractions: 0, notes: 'Great recycling practices.' },
          { classId: 'class-1a', greenScore: 89, totalWasteGrams: 260, infractions: 1, notes: 'Young eco-patrol champions did great.' },
          { classId: 'class-4c', greenScore: 83, totalWasteGrams: 370, infractions: 1, notes: 'A few wrappers in wrong bins.' },
          { classId: 'class-9b', greenScore: 77, totalWasteGrams: 460, infractions: 2, notes: 'Idling display power strips.' },
        ],
      },
    ];

    // Build audit logs by classroom
    const classroomAuditsMap = new Map<string, AuditLog[]>();

    pastPlans.forEach((plan) => {
      const dateStr = getPastDateStr(plan.daysAgo);
      const timestamp = getPastTimestamp(plan.daysAgo);

      plan.audits.forEach((auditPlan, idx) => {
        const cls = classrooms.find((c) => c.id === auditPlan.classId);
        const studentCount = cls ? cls.studentCount : 25;
        const className = cls ? cls.name : auditPlan.classId;

        const auditLog: AuditLog = {
          id: `seed-audit-${plan.daysAgo}-${auditPlan.classId}-${idx}`,
          classroomId: auditPlan.classId,
          classroomName: className,
          auditorName: 'Patrol Squad Alpha',
          auditorId: 'auditor-patrol',
          date: dateStr,
          timestamp,
          energyInfractions: [],
          wasteItems: [],
          totalWasteGrams: auditPlan.totalWasteGrams,
          wastePerStudentGrams: Math.round((auditPlan.totalWasteGrams / studentCount) * 10) / 10,
          totalEnergyInfractionsCount: auditPlan.infractions,
          totalWattsWasted: auditPlan.infractions * 120,
          greenScore: auditPlan.greenScore,
          scoreBreakdown: createBreakdown(auditPlan.greenScore),
          notes: auditPlan.notes,
          xpEarned: 50,
          badgesUnlocked: [],
        };

        const existing = classroomAuditsMap.get(auditPlan.classId) || [];
        existing.push(auditLog);
        classroomAuditsMap.set(auditPlan.classId, existing);
      });
    });

    // Update classrooms with historical audits and calculate realistic averages
    return classrooms.map((cls) => {
      const seeded = classroomAuditsMap.get(cls.id) || [];
      const combinedAudits = [...seeded, ...(cls.historicalAudits || [])].sort(
        (a, b) => b.timestamp - a.timestamp
      );

      if (combinedAudits.length === 0) {
        return cls;
      }

      const scores = combinedAudits.map((a) => a.greenScore);
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const totalWaste = combinedAudits.reduce((sum, a) => sum + a.totalWasteGrams, 0);
      const avgWaste = Math.round(totalWaste / combinedAudits.length);
      const totalInfractions = combinedAudits.reduce((sum, a) => sum + (a.totalEnergyInfractionsCount || 0), 0);
      const avgInfractions = Math.round((totalInfractions / combinedAudits.length) * 10) / 10;

      return {
        ...cls,
        currentGreenScore: avgScore,
        streakDays: Math.min(5, combinedAudits.length),
        lastAuditedDate: combinedAudits[0].date,
        weeklyWasteAvgGrams: avgWaste,
        weeklyEnergyInfractionsAvg: avgInfractions,
        historicalAudits: combinedAudits,
      };
    });
  },
};
