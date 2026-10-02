import type { Classroom, AuditLog, AuditorProfile, Badge, EnergyInfraction } from '../types';

export const DEFAULT_ENERGY_INFRACTIONS: EnergyInfraction[] = [
  {
    id: 'inf-lights',
    name: 'Lights Left On in Empty Room',
    description: 'Overhead ceiling lights glowing while classroom is empty',
    category: 'lighting',
    detected: false,
    pointsDeduction: 10,
    estimatedWattsWasted: 120,
    tip: 'Flip switch off when leaving room!',
    icon: 'Lightbulb',
  },
  {
    id: 'inf-projector',
    name: 'Projector / Screen Left Idling',
    description: 'Projector running standby wallpaper with 0 viewers',
    category: 'screens',
    detected: false,
    pointsDeduction: 12,
    estimatedWattsWasted: 250,
    tip: 'Tap the sleep button during lunch/recess.',
    icon: 'Tv',
  },
  {
    id: 'inf-hvac',
    name: 'AC / Fans Running in Empty Room',
    description: 'Fans or AC blasting at max with no occupants',
    category: 'hvac',
    detected: false,
    pointsDeduction: 15,
    estimatedWattsWasted: 450,
    tip: 'Adjust thermostat or switch fans off.',
    icon: 'Wind',
  },
  {
    id: 'inf-chargers',
    name: 'Vampire Power / Idling Chargers',
    description: 'Display docks & power strips drawing standby load',
    category: 'chargers',
    detected: false,
    pointsDeduction: 6,
    estimatedWattsWasted: 60,
    tip: 'Switch off the master power strip.',
    icon: 'Zap',
  },
  {
    id: 'inf-windows',
    name: 'Windows Open with AC Running',
    description: 'Conditioned air escaping directly to the outside',
    category: 'windows',
    detected: false,
    pointsDeduction: 14,
    estimatedWattsWasted: 500,
    tip: 'Close windows when AC/heating is on.',
    icon: 'SquareDashedBottomCode',
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-first-audit',
    name: 'Eco-Detective 🎖️',
    description: 'Completed your first classroom environmental audit!',
    icon: 'Search',
    category: 'audit',
    rarity: 'common',
    unlocked: false,
  },
  {
    id: 'badge-phantom-hunter',
    name: 'Phantom Hunter ⚡',
    description: 'Caught 2+ idling energy vampire appliances!',
    icon: 'ZapOff',
    category: 'energy',
    rarity: 'rare',
    unlocked: false,
  },
  {
    id: 'badge-zero-waste',
    name: 'Zero-Waste Wizard 🪄',
    description: 'Audited a classroom with clean bin and low waste footprint!',
    icon: 'Sparkles',
    category: 'waste',
    rarity: 'epic',
    unlocked: false,
  },
  {
    id: 'badge-scale-master',
    name: 'Scale Master ⚖️',
    description: 'Calibrated waste weight measurement!',
    icon: 'Scale',
    category: 'waste',
    rarity: 'rare',
    unlocked: false,
  },
  {
    id: 'badge-compost-champ',
    name: 'Recycle Champion ♻️',
    description: 'Audited a room with 100% properly sorted recycling!',
    icon: 'Sprout',
    category: 'waste',
    rarity: 'common',
    unlocked: false,
  },
  {
    id: 'badge-streak-5',
    name: 'Audit Streak Master 🔥',
    description: 'Completed 3 classroom audits for your patrol team!',
    icon: 'Flame',
    category: 'streak',
    rarity: 'legendary',
    unlocked: false,
  },
];

export const INITIAL_AUDITOR: AuditorProfile = {
  name: 'Student Eco-Detective',
  role: 'Grade 7 Environmental Auditor',
  avatar: '🦊',
  xp: 0,
  level: 1,
  auditsCompleted: 0,
  badges: INITIAL_BADGES,
  soundEnabled: true,
  useLiveAi: false,
};

// Official School Classrooms:
// KG, UG, 1st - 7th: 3 divisions (A, B, C)
// 8th, 9th, 10th: 2 divisions (A, B)
export const INITIAL_CLASSROOMS: Classroom[] = [
  // --- KINDERGARTEN (3 Divisions) ---
  {
    id: 'class-kg-a',
    name: 'KG - A',
    grade: 'KG',
    roomNumber: 'KG Room 1',
    teacher: 'Class Teacher (KG-A)',
    studentCount: 22,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-amber-400 to-yellow-500',
    mascot: '🐣',
    mascotName: 'The Sunny Chicks',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-kg-b',
    name: 'KG - B',
    grade: 'KG',
    roomNumber: 'KG Room 2',
    teacher: 'Class Teacher (KG-B)',
    studentCount: 22,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-emerald-400 to-teal-500',
    mascot: '🐢',
    mascotName: 'The Little Turtles',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-kg-c',
    name: 'KG - C',
    grade: 'KG',
    roomNumber: 'KG Room 3',
    teacher: 'Class Teacher (KG-C)',
    studentCount: 22,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-sky-400 to-blue-500',
    mascot: '🐬',
    mascotName: 'The Baby Dolphins',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },

  // --- UG (Upper Kindergarten - 3 Divisions) ---
  {
    id: 'class-ug-a',
    name: 'UG - A',
    grade: 'UG',
    roomNumber: 'UG Room 1',
    teacher: 'Class Teacher (UG-A)',
    studentCount: 24,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-pink-400 to-rose-500',
    mascot: '🌸',
    mascotName: 'The Bloomers',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-ug-b',
    name: 'UG - B',
    grade: 'UG',
    roomNumber: 'UG Room 2',
    teacher: 'Class Teacher (UG-B)',
    studentCount: 24,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-violet-400 to-purple-500',
    mascot: '🦋',
    mascotName: 'The Butterflies',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-ug-c',
    name: 'UG - C',
    grade: 'UG',
    roomNumber: 'UG Room 3',
    teacher: 'Class Teacher (UG-C)',
    studentCount: 24,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-cyan-400 to-teal-500',
    mascot: '🌱',
    mascotName: 'The Sprouts',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },

  // --- GRADE 1 (3 Divisions) ---
  {
    id: 'class-1a',
    name: '1st - A',
    grade: '1st Grade',
    roomNumber: 'Room 101',
    teacher: 'Class Teacher (1-A)',
    studentCount: 26,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-lime-400 to-green-500',
    mascot: '🐸',
    mascotName: 'The Tree Frogs',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-1b',
    name: '1st - B',
    grade: '1st Grade',
    roomNumber: 'Room 102',
    teacher: 'Class Teacher (1-B)',
    studentCount: 26,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-amber-400 to-emerald-500',
    mascot: '🐝',
    mascotName: 'The Busy Bees',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-1c',
    name: '1st - C',
    grade: '1st Grade',
    roomNumber: 'Room 103',
    teacher: 'Class Teacher (1-C)',
    studentCount: 26,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-blue-400 to-indigo-500',
    mascot: '🐧',
    mascotName: 'The Polar Penguins',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },

  // --- GRADE 2 (3 Divisions) ---
  {
    id: 'class-2a',
    name: '2nd - A',
    grade: '2nd Grade',
    roomNumber: 'Room 104',
    teacher: 'Class Teacher (2-A)',
    studentCount: 26,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-orange-400 to-amber-500',
    mascot: '🐿️',
    mascotName: 'The Squirrels',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-2b',
    name: '2nd - B',
    grade: '2nd Grade',
    roomNumber: 'Room 105',
    teacher: 'Class Teacher (2-B)',
    studentCount: 26,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-yellow-400 to-emerald-500',
    mascot: '🦔',
    mascotName: 'The Hedgehogs',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-2c',
    name: '2nd - C',
    grade: '2nd Grade',
    roomNumber: 'Room 106',
    teacher: 'Class Teacher (2-C)',
    studentCount: 26,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-cyan-400 to-sky-500',
    mascot: '🦭',
    mascotName: 'The Harbor Seals',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },

  // --- GRADE 3 (3 Divisions) ---
  {
    id: 'class-3a',
    name: '3rd - A',
    grade: '3rd Grade',
    roomNumber: 'Room 201',
    teacher: 'Class Teacher (3-A)',
    studentCount: 28,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-emerald-400 to-green-600',
    mascot: '🐼',
    mascotName: 'The Bamboo Pandas',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-3b',
    name: '3rd - B',
    grade: '3rd Grade',
    roomNumber: 'Room 202',
    teacher: 'Class Teacher (3-B)',
    studentCount: 28,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-amber-400 to-orange-600',
    mascot: '🦁',
    mascotName: 'The Golden Lions',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-3c',
    name: '3rd - C',
    grade: '3rd Grade',
    roomNumber: 'Room 203',
    teacher: 'Class Teacher (3-C)',
    studentCount: 28,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-indigo-400 to-purple-600',
    mascot: '🐨',
    mascotName: 'The Koalas',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },

  // --- GRADE 4 (3 Divisions) ---
  {
    id: 'class-4a',
    name: '4th - A',
    grade: '4th Grade',
    roomNumber: 'Room 204',
    teacher: 'Class Teacher (4-A)',
    studentCount: 28,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-cyan-400 to-blue-600',
    mascot: '🐬',
    mascotName: 'The Swift Dolphins',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-4b',
    name: '4th - B',
    grade: '4th Grade',
    roomNumber: 'Room 205',
    teacher: 'Class Teacher (4-B)',
    studentCount: 28,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-teal-400 to-emerald-600',
    mascot: '🦚',
    mascotName: 'The Emerald Peacocks',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-4c',
    name: '4th - C',
    grade: '4th Grade',
    roomNumber: 'Room 206',
    teacher: 'Class Teacher (4-C)',
    studentCount: 28,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-rose-400 to-pink-600',
    mascot: '🦩',
    mascotName: 'The Flamingos',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },

  // --- GRADE 5 (3 Divisions) ---
  {
    id: 'class-5a',
    name: '5th - A',
    grade: '5th Grade',
    roomNumber: 'Room 301',
    teacher: 'Class Teacher (5-A)',
    studentCount: 30,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-green-400 to-teal-600',
    mascot: '🐯',
    mascotName: 'The Jungle Tigers',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-5b',
    name: '5th - B',
    grade: '5th Grade',
    roomNumber: 'Room 302',
    teacher: 'Class Teacher (5-B)',
    studentCount: 30,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-blue-400 to-cyan-600',
    mascot: '🦈',
    mascotName: 'The Blue Sharks',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-5c',
    name: '5th - C',
    grade: '5th Grade',
    roomNumber: 'Room 303',
    teacher: 'Class Teacher (5-C)',
    studentCount: 30,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-violet-400 to-purple-600',
    mascot: '🐆',
    mascotName: 'The Snow Leopards',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },

  // --- GRADE 6 (3 Divisions) ---
  {
    id: 'class-6a',
    name: '6th - A',
    grade: '6th Grade',
    roomNumber: 'Room 304',
    teacher: 'Class Teacher (6-A)',
    studentCount: 30,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-amber-400 to-yellow-600',
    mascot: '🦅',
    mascotName: 'The Golden Eagles',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-6b',
    name: '6th - B',
    grade: '6th Grade',
    roomNumber: 'Room 305',
    teacher: 'Class Teacher (6-B)',
    studentCount: 30,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-emerald-400 to-teal-600',
    mascot: '🦬',
    mascotName: 'The Prairie Bisons',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-6c',
    name: '6th - C',
    grade: '6th Grade',
    roomNumber: 'Room 306',
    teacher: 'Class Teacher (6-C)',
    studentCount: 30,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-sky-400 to-indigo-600',
    mascot: '🦉',
    mascotName: 'The Night Owls',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },

  // --- GRADE 7 (3 Divisions) ---
  {
    id: 'class-7a',
    name: '7th - A',
    grade: '7th Grade',
    roomNumber: 'Room 401',
    teacher: 'Class Teacher (7-A)',
    studentCount: 32,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-emerald-400 to-teal-500',
    mascot: '🦊',
    mascotName: 'The Forest Foxes',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-7b',
    name: '7th - B',
    grade: '7th Grade',
    roomNumber: 'Room 402',
    teacher: 'Class Teacher (7-B)',
    studentCount: 32,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-cyan-400 to-blue-500',
    mascot: '🦦',
    mascotName: 'The Solar Otters',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-7c',
    name: '7th - C',
    grade: '7th Grade',
    roomNumber: 'Room 403',
    teacher: 'Class Teacher (7-C)',
    studentCount: 32,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-teal-400 to-emerald-500',
    mascot: '🐺',
    mascotName: 'The Timber Wolves',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },

  // --- GRADE 8 (2 Divisions: A, B) ---
  {
    id: 'class-8a',
    name: '8th - A',
    grade: '8th Grade',
    roomNumber: 'Room 404',
    teacher: 'Class Teacher (8-A)',
    studentCount: 32,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-sky-400 to-indigo-500',
    mascot: '🦅',
    mascotName: 'The River Hawks',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-8b',
    name: '8th - B',
    grade: '8th Grade',
    roomNumber: 'Room 405',
    teacher: 'Class Teacher (8-B)',
    studentCount: 32,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-purple-400 to-pink-500',
    mascot: '⚡',
    mascotName: 'The Storm Falcons',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },

  // --- GRADE 9 (2 Divisions: A, B) ---
  {
    id: 'class-9a',
    name: '9th - A',
    grade: '9th Grade',
    roomNumber: 'Room 501',
    teacher: 'Class Teacher (9-A)',
    studentCount: 34,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-amber-400 to-orange-500',
    mascot: '🐆',
    mascotName: 'The Mountain Cheetahs',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-9b',
    name: '9th - B',
    grade: '9th Grade',
    roomNumber: 'Room 502',
    teacher: 'Class Teacher (9-B)',
    studentCount: 34,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-red-400 to-rose-500',
    mascot: '🔥',
    mascotName: 'The Fire Phoenixes',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },

  // --- GRADE 10 (2 Divisions: A, B) ---
  {
    id: 'class-10a',
    name: '10th - A',
    grade: '10th Grade',
    roomNumber: 'Room 503',
    teacher: 'Class Teacher (10-A)',
    studentCount: 35,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-indigo-400 to-blue-600',
    mascot: '👑',
    mascotName: 'The Apex Titans',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
  {
    id: 'class-10b',
    name: '10th - B',
    grade: '10th Grade',
    roomNumber: 'Room 504',
    teacher: 'Class Teacher (10-B)',
    studentCount: 35,
    currentGreenScore: 0,
    streakDays: 0,
    avatarColor: 'from-teal-400 to-cyan-500',
    mascot: '🛡️',
    mascotName: 'The Eco Guardians',
    weeklyWasteAvgGrams: 0,
    weeklyEnergyInfractionsAvg: 0,
    status: 'pending',
    historicalAudits: [],
  },
];

const STORAGE_KEYS = {
  CLASSROOMS: 'ecopatrol_v5_school_classrooms',
  AUDITOR: 'ecopatrol_v5_school_auditor',
  AUDIT_LOGS: 'ecopatrol_v5_school_logs',
};

export const storageService = {
  getClassrooms(): Classroom[] {
    try {
      // Clear out older storage keys if present to ensure clean switch
      if (localStorage.getItem('ecopatrol_v4_clean_classrooms')) {
        localStorage.removeItem('ecopatrol_v4_clean_classrooms');
        localStorage.removeItem('ecopatrol_v4_clean_auditor');
        localStorage.removeItem('ecopatrol_v4_clean_logs');
      }

      const data = localStorage.getItem(STORAGE_KEYS.CLASSROOMS);
      if (data) {
        const classrooms: Classroom[] = JSON.parse(data);
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Dynamically compute today's status & score based on current date
        return classrooms.map((cls) => {
          const todayAudit = cls.historicalAudits?.find((h) => h.date === todayStr);
          const isAuditedToday = Boolean(todayAudit || (cls.lastAuditedDate && cls.lastAuditedDate.startsWith(todayStr)));
          return {
            ...cls,
            status: isAuditedToday ? ('audited_today' as const) : ('pending' as const),
            todayGreenScore: todayAudit ? todayAudit.greenScore : undefined,
          };
        });
      }
    } catch (e) {
      console.error('Error loading classrooms from localStorage', e);
    }
    this.saveClassrooms(INITIAL_CLASSROOMS);
    return INITIAL_CLASSROOMS;
  },

  saveClassrooms(classrooms: Classroom[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(classrooms));
    } catch (e) {
      console.error('Error saving classrooms to localStorage', e);
    }
  },

  getAuditorProfile(): AuditorProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDITOR);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading auditor profile', e);
    }
    this.saveAuditorProfile(INITIAL_AUDITOR);
    return INITIAL_AUDITOR;
  },

  saveAuditorProfile(profile: AuditorProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDITOR, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving auditor profile', e);
    }
  },

  getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading audit logs', e);
    }
    return [];
  },

  saveAuditLogs(logs: AuditLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Error saving audit logs', e);
    }
  },

  addAudit(log: AuditLog): void {
    const logs = this.getAuditLogs();
    logs.unshift(log);
    this.saveAuditLogs(logs);

    // Update classroom
    const classrooms = this.getClassrooms();
    const updatedClassrooms = classrooms.map((cls) => {
      if (cls.id === log.classroomId) {
        const history = [log, ...cls.historicalAudits];
        const recentScores = history.map((h) => h.greenScore);
        const avgScore = Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length);
        const totalGrams = history.reduce((sum, h) => sum + h.totalWasteGrams, 0);
        const avgGrams = Math.round(totalGrams / history.length);
        const infractionsAvg =
          Math.round((history.reduce((sum, h) => sum + h.totalEnergyInfractionsCount, 0) / history.length) * 10) / 10;

        return {
          ...cls,
          currentGreenScore: avgScore,
          todayGreenScore: log.greenScore,
          streakDays: cls.streakDays + 1,
          status: 'audited_today' as const,
          lastAuditedDate: new Date().toISOString(),
          weeklyWasteAvgGrams: avgGrams,
          weeklyEnergyInfractionsAvg: infractionsAvg,
          historicalAudits: history,
        };
      }
      return cls;
    });
    this.saveClassrooms(updatedClassrooms);

    // Update auditor profile XP & badges
    const auditor = this.getAuditorProfile();
    const newXp = auditor.xp + log.xpEarned;
    const newLevel = Math.floor(newXp / 200) + 1;
    const updatedBadges = auditor.badges.map((b) => {
      const matchingUnlocked = log.badgesUnlocked.find((ub) => ub.id === b.id);
      return matchingUnlocked || b;
    });

    this.saveAuditorProfile({
      ...auditor,
      xp: newXp,
      level: newLevel,
      auditsCompleted: auditor.auditsCompleted + 1,
      badges: updatedBadges,
    });
  },

  resetToDefaultData(): void {
    localStorage.removeItem(STORAGE_KEYS.CLASSROOMS);
    localStorage.removeItem(STORAGE_KEYS.AUDITOR);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    // Also clean any previous versions
    localStorage.removeItem('ecopatrol_v4_clean_classrooms');
    localStorage.removeItem('ecopatrol_v4_clean_auditor');
    localStorage.removeItem('ecopatrol_v4_clean_logs');
    localStorage.removeItem('ecopatrol_classrooms_v2');
    localStorage.removeItem('ecopatrol_auditor_v2');
    localStorage.removeItem('ecopatrol_audit_logs_v2');
    this.saveClassrooms(INITIAL_CLASSROOMS);
    this.saveAuditorProfile(INITIAL_AUDITOR);
    this.saveAuditLogs([]);
  },
};
