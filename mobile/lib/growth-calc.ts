export interface QuizData {
  gender: 'male' | 'female' | null;
  age: number;
  ethnicity?: string;
  currentHeight: number;
  fatherHeight?: number;
  motherHeight?: number;
  growthRate?: string;
  shoeSize?: string | number;
  sleepHours?: string;
  dietType?: string;
  smokeDrink?: string;
  sittingHours?: string;
  motivation?: string;
  dreamHeight?: number;
  activityLevel?: string;
  // Alternative key names for flexibility across components
  fatherCm?: number;
  motherCm?: number;
  growthPastYear?: string;
  footGrowthStopped?: boolean;
}

export function cmToFtIn(cm?: number | null): string {
  if (cm === undefined || cm === null || isNaN(cm)) return "0'0\"";
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inches = Math.round(totalIn % 12);
  return `${ft}'${inches}"`;
}

// Mid-Parental Target Calculation (Tanner Formula)
export function calculateHeightPotential(quizData: {
  fatherCm?: number;
  motherCm?: number;
  gender: 'male' | 'female' | null;
  age: number;
  growthPastYear?: string;
  footGrowthStopped?: boolean;
  dreamHeight?: number;
}) {
  const { fatherCm, motherCm, gender, age, growthPastYear, footGrowthStopped } = quizData;

  // BUG FIX: Fallback calculation if one parent's height is unknown/null
  let fCm = fatherCm;
  let mCm = motherCm;
  if (!fCm && mCm) fCm = gender === 'male' ? mCm + 13 : mCm;
  if (!mCm && fCm) mCm = gender === 'male' ? fCm : fCm - 13;
  if (!fCm || !mCm) return null; // Failsafe if both are missing

  let target = gender === 'male' ? (fCm + mCm + 13) / 2 : (fCm + mCm - 13) / 2;
  const rangeMin = Math.round((target - 2.5) * 10) / 10;
  const rangeMax = Math.round((target + 2.5) * 10) / 10;
  target = Math.round(target * 10) / 10;

  // BUG FIX: Standardized strict age 21 limit for biological plate fusion
  let platesLikelyClosed = false;
  let honestMessage = "";

  if (age >= 21 || (age >= 18 && growthPastYear === 'stopped' && footGrowthStopped)) {
    platesLikelyClosed = true;
    honestMessage = "Based on clinical data, your growth plates have likely fused. You cannot biologically grow taller. However, decompression exercises can optimize spinal alignment, improving posture and height appearance by 1–2.5 cm.";
  } else if (age >= 17) {
    honestMessage = "You are in the final stage of bone maturation. Habit optimization (deep sleep + protein) is critical to maximize the final remaining millimeters before fusion.";
  } else {
    honestMessage = "Your growth plates are active! Consistent sleep and adequate nutrition are proven to help you reach the upper limit of your genetic window.";
  }

  return { target, rangeMin, rangeMax, platesLikelyClosed, honestMessage };
}

// Backwards-compatible wrapper for existing mobile components calling calculateTarget
export function calculateTarget(data: QuizData) {
  const fatherCm = data.fatherCm ?? data.fatherHeight;
  const motherCm = data.motherCm ?? data.motherHeight;
  const isGrowthStopped = Boolean(
    (data.growthPastYear && data.growthPastYear.toLowerCase().includes('stopped')) ||
    (data.growthRate && data.growthRate.toLowerCase().includes('stopped'))
  );
  const footGrowthStopped = data.footGrowthStopped ?? isGrowthStopped;

  const result = calculateHeightPotential({
    fatherCm,
    motherCm,
    gender: data.gender,
    age: data.age,
    growthPastYear: isGrowthStopped ? 'stopped' : 'normal',
    footGrowthStopped,
    dreamHeight: data.dreamHeight
  });

  if (!result) {
    // Ultimate fallback if both parents heights are missing
    const defaultTarget = data.gender === 'female' ? 162 : 175;
    return {
      target: defaultTarget,
      rangeMin: defaultTarget - 3,
      rangeMax: defaultTarget + 3,
      platesLikelyClosed: data.age >= 21,
      honestMessage: data.age >= 21
        ? "Based on clinical data, your growth plates have likely fused. Stretches can improve spinal posture by 1–2.5 cm, but biological bone growth is no longer possible."
        : "Consistent sleep and nutrition will help you reach your genetic ceiling.",
      dreamWarning: null
    };
  }

  let dreamWarning: string | null = null;
  if (data.dreamHeight && data.dreamHeight > result.rangeMax + 10) {
    dreamWarning = `Your dream height (${data.dreamHeight} cm) is above what genetics typically allows (${result.rangeMin}–${result.rangeMax} cm). We'll help you maximize every cm within your biological range.`;
  }

  return {
    ...result,
    dreamWarning
  };
}

// BUG FIX: Deterministic Daily Shuffle without Modulo sorting crashes
export function getDailyStretches<T>(allStretches: T[], userDaySchedule: number[], dayOfWeek: number) {
  // If today is a rest day based on user's chosen schedule
  if (!userDaySchedule.includes(dayOfWeek)) {
    return { isRestDay: true, stretches: [] };
  }

  if (!allStretches || allStretches.length === 0) {
    return { isRestDay: false, stretches: [] };
  }

  // Safely rotate the array using slice to guarantee consistent ordering across all devices
  const rotationIndex = dayOfWeek % allStretches.length;
  const rotated = [
    ...allStretches.slice(rotationIndex),
    ...allStretches.slice(0, rotationIndex)
  ];

  return { isRestDay: false, stretches: rotated.slice(0, 8) };
}


