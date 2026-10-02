import type { EnergyInfraction, ScoreBreakdown, WasteItem, Badge, WasteAssessment } from '../types';

export function calculateGreenScore(
  wasteItems: WasteItem[],
  studentCount: number,
  wasteAssessment?: WasteAssessment,
  _energyInfractions?: EnergyInfraction[]
): ScoreBreakdown {
  const safeStudentCount = Math.max(1, studentCount);

  // If simplified assessment is used, calculate grams directly from it
  let totalWasteGrams = 0;

  if (wasteAssessment) {
    totalWasteGrams = wasteAssessment.estimatedGrams;
  } else if (wasteItems.length > 0) {
    totalWasteGrams = wasteItems.reduce((sum, item) => {
      return sum + (item.manualGrams !== undefined ? item.manualGrams : item.estimatedGrams);
    }, 0);
  } else {
    // Default baseline if no waste logged
    totalWasteGrams = 300;
  }

  const wastePerStudent = totalWasteGrams / safeStudentCount;

  // Waste penalty: target baseline is ~15g per student
  let wastePenalty = 0;
  if (wastePerStudent > 15) {
    wastePenalty = Math.min(50, Math.round((wastePerStudent - 15) * 0.8));
  }

  // Energy & sorting sections removed as requested - pure bin volume calculation
  const energyPenalty = 0;
  const sortingBonus = 0;

  // Calculate final score
  const rawScore = 100 - wastePenalty;
  const finalScore = Math.max(10, Math.min(100, Math.round(rawScore)));

  // Determine tier
  let tier: ScoreBreakdown['tier'] = 'Needs Eco-Love';
  let tierColor = 'text-rose-600 bg-rose-50 border-rose-200';
  let summaryFeedback = 'High bin fullness detected! Encourage students to reuse paper and reduce classroom waste.';

  if (finalScore >= 90) {
    tier = 'Eco Hero';
    tierColor = 'text-emerald-600 bg-emerald-50 border-emerald-300';
    summaryFeedback = 'Outstanding waste conservation! Minimal classroom bin volume and great reduction habits!';
  } else if (finalScore >= 75) {
    tier = 'Green Guardian';
    tierColor = 'text-teal-600 bg-teal-50 border-teal-200';
    summaryFeedback = 'Great job! Low to moderate bin volume with normal daily classroom paper use.';
  } else if (finalScore >= 60) {
    tier = 'Eco Explorer';
    tierColor = 'text-amber-600 bg-amber-50 border-amber-200';
    summaryFeedback = 'Fair effort! Bin was mostly full. Remind students to double-side print and reuse paper scraps.';
  }

  return {
    baseScore: 100,
    wastePenalty,
    energyPenalty,
    sortingBonus,
    finalScore,
    tier,
    tierColor,
    summaryFeedback,
  };
}

export function calculateAuditorXp(
  finalScore: number,
  hasPhoto: boolean,
  _legacyCount?: number
): number {
  let xp = 120; // Base XP for completing classroom waste audit
  if (finalScore >= 90) xp += 60;
  if (hasPhoto) xp += 40; // Bonus for photo documentation
  return xp;
}

export function checkNewBadges(
  currentBadges: Badge[],
  auditLog: {
    totalWasteGrams: number;
    activeInfractionsCount: number;
    auditsCount: number;
    isProperlySorted: boolean;
  }
): Badge[] {
  return currentBadges.map((badge) => {
    if (badge.unlocked) return badge;

    let unlock = false;

    if (badge.id === 'badge-first-audit' && auditLog.auditsCount >= 1) {
      unlock = true;
    } else if (badge.id === 'badge-phantom-hunter' && auditLog.activeInfractionsCount >= 2) {
      unlock = true;
    } else if (badge.id === 'badge-zero-waste' && auditLog.totalWasteGrams <= 250) {
      unlock = true;
    } else if (badge.id === 'badge-streak-5' && auditLog.auditsCount >= 3) {
      unlock = true;
    } else if (badge.id === 'badge-scale-master') {
      unlock = true; // awarded on completing audit
    } else if (badge.id === 'badge-compost-champ' && auditLog.isProperlySorted) {
      unlock = true;
    }

    if (unlock) {
      return {
        ...badge,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      };
    }

    return badge;
  });
}

export function getImpactTranslations(totalWasteGrams: number, wattsSaved: number, auditsCount: number) {
  const treesSaved = ((totalWasteGrams * 0.6) / 25000) + (wattsSaved / 4000);
  const chromebookCharges = Math.round((wattsSaved / 45) * 10) / 10;
  const plasticItemsDiverted = Math.round(totalWasteGrams / 14);
  const co2PreventedKg = Math.round(((totalWasteGrams * 1.5) / 1000 + (wattsSaved * 0.4) / 1000) * 10) / 10;

  return {
    treesEquivalent: Math.max(0.1, Math.round(treesSaved * 100) / 100),
    chromebookCharges: Math.max(1, chromebookCharges || Math.round(auditsCount * 4.5)),
    plasticItemsDiverted: Math.max(4, plasticItemsDiverted),
    co2PreventedKg: Math.max(0.5, co2PreventedKg),
  };
}
