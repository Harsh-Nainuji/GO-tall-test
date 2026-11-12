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

// Mid-Parental Target Calculation (Tanner Formula & Epiphyseal Biology)
export function calculateHeightPotential(quizData: {
  currentHeight?: number;
  fatherCm?: number;
  motherCm?: number;
  gender: 'male' | 'female' | null;
  age: number;
  growthPastYear?: string;
  footGrowthStopped?: boolean;
  dreamHeight?: number;
}) {
  const { currentHeight, fatherCm, motherCm, gender, age, growthPastYear, footGrowthStopped } = quizData;

  // Actual current height (ensures target is NEVER less than actual height)
  const curHeight = currentHeight && !isNaN(currentHeight) && currentHeight > 0
    ? currentHeight
    : (gender === 'female' ? 162 : 172.4);

  // Fallback calculation if one parent's height is unknown/null
  let fCm = fatherCm;
  let mCm = motherCm;
  if (!fCm && mCm) fCm = gender === 'male' ? mCm + 13 : mCm;
  if (!mCm && fCm) mCm = gender === 'male' ? fCm : fCm - 13;

  const isMale = gender === 'male' || gender === null;
  const midParental = (fCm && mCm)
    ? (isMale ? (fCm + mCm + 13) / 2 : (fCm + mCm - 13) / 2)
    : (isMale ? 175 : 162);

  // Standardized strict age 21 limit for biological epiphyseal plate fusion
  let platesLikelyClosed = false;
  let honestMessage = "";

  if (age >= 21 || (age >= 18 && growthPastYear === 'stopped' && footGrowthStopped)) {
    platesLikelyClosed = true;
    honestMessage = "Based on clinical radiological data, your epiphyseal growth plates have fused. Biological long-bone growth has completed. However, clinical spinal decompression and postural realignment of L1–L5 intervertebral discs will expand your standing stature by 1.5–2.5 cm.";
  } else if (age >= 17) {
    honestMessage = "You are in the final terminal window of epiphyseal maturation. Rigorous circadian sleep (10 PM–2 AM somatotropin release) and daily spinal traction are critical to capture your final biological millimeters before fusion.";
  } else {
    honestMessage = "Your growth plates are active and receptive! Multi-axis decompression, deep Slow-Wave Sleep, and skeletal amino acids will propel you toward your absolute genetic ceiling.";
  }

  let target: number;
  let rangeMin: number;
  let rangeMax: number;

  if (platesLikelyClosed) {
    // Adults with fused plates: target is strictly currentHeight + spinal decompression gain
    // CANNOT BE LESS THAN currentHeight!
    target = Math.round((curHeight + 2.0) * 10) / 10;
    rangeMin = Math.round((curHeight + 1.2) * 10) / 10;
    rangeMax = Math.round((curHeight + 2.8) * 10) / 10;
  } else {
    // Youth with open plates:
    // If user has already outgrown mid-parental formula, their baseline cannot drop below current height!
    const remainingYears = Math.max(0.5, Math.min(6, 21 - age));
    const estimatedBiologicalGrowth = Math.min(12, remainingYears * 2.2);
    
    // Target is maximum of midParental, or current height + biological headroom
    const potentialCeiling = Math.max(curHeight + 2.0, midParental, curHeight + estimatedBiologicalGrowth * 0.7);
    target = Math.round(potentialCeiling * 10) / 10;

    rangeMin = Math.max(curHeight, Math.round((target - 2.5) * 10) / 10);
    rangeMax = Math.max(rangeMin + 2.0, Math.round((target + 3.0) * 10) / 10);
  }

  // Final invariant: target and rangeMin can NEVER be less than currentHeight!
  if (target < curHeight) {
    target = Math.round((curHeight + 1.5) * 10) / 10;
  }
  if (rangeMin < curHeight) {
    rangeMin = curHeight;
  }
  if (rangeMax <= target) {
    rangeMax = Math.round((target + 2.0) * 10) / 10;
  }

  const potentialGain = Math.max(0, Math.round((target - curHeight) * 10) / 10);

  return { target, rangeMin, rangeMax, potentialGain, platesLikelyClosed, honestMessage };
}

// Backwards-compatible wrapper for existing mobile components calling calculateTarget
export function calculateTarget(data: QuizData) {
  const currentHeight = data.currentHeight;
  const fatherCm = data.fatherCm ?? data.fatherHeight;
  const motherCm = data.motherCm ?? data.motherHeight;
  const isGrowthStopped = Boolean(
    (data.growthPastYear && data.growthPastYear.toLowerCase().includes('stopped')) ||
    (data.growthRate && data.growthRate.toLowerCase().includes('stopped'))
  );
  const footGrowthStopped = data.footGrowthStopped ?? isGrowthStopped;

  const result = calculateHeightPotential({
    currentHeight,
    fatherCm,
    motherCm,
    gender: data.gender,
    age: data.age,
    growthPastYear: isGrowthStopped ? 'stopped' : 'normal',
    footGrowthStopped,
    dreamHeight: data.dreamHeight
  });

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


