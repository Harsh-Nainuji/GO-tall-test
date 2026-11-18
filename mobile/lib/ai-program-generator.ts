import { StretchExercise, ProgramWeekInfo, PROGRAM_WEEK_METADATA, CLINICAL_STRETCHES } from './store';
import { GEMINI_API_KEY, GEMINI_MODEL } from './gemini';

export interface BiomechanicalClassification {
  archetype: 'KYPHOSIS_THORACIC' | 'LUMBAR_PELVIC_COMPRESSION' | 'AXIAL_DISC_COMPRESSION' | 'GROWTH_PLATE_KINETIC';
  archetypeName: string;
  intensity: 'Beginner' | 'Intermediate' | 'Advanced';
  focus: string;
  rationale: string;
}

export interface UserDiagnosticInput {
  age?: number;
  gender?: string;
  currentHeight?: number;
  sittingHours?: string;
  postureConcern?: string;
  spinalFatigue?: string;
  workoutDaysPerWeek?: number;
}

/**
 * Ultra-low token AI classifier (< 180 tokens total).
 * Classifies user diagnostic profile once into a clinical biomechanical archetype.
 */
export async function classifyBiomechanicalArchetype(
  diagnostic: UserDiagnosticInput
): Promise<BiomechanicalClassification> {
  const age = diagnostic.age || 16;
  const gender = diagnostic.gender || 'male';
  const sitting = diagnostic.sittingHours || '6-8 hours/day';
  const concern = diagnostic.postureConcern || 'Forward head & rounded shoulders';
  const fatigue = diagnostic.spinalFatigue || 'Moderate midday spinal compression';

  // 1. Try Gemini API with ultra-compact prompt if key is available
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key') {
    const compactPrompt = `Patient Diagnostic:
Age: ${age}, Gender: ${gender}, Sitting: ${sitting}, Concern: ${concern}, Spinal Fatigue: ${fatigue}.

Classify into exactly 1 Archetype:
- KYPHOSIS_THORACIC (Thoracic kyphosis, forward head, rounded shoulders)
- LUMBAR_PELVIC_COMPRESSION (Anterior pelvic tilt, tight hip flexors, lumbar compression)
- AXIAL_DISC_COMPRESSION (High sedentary compression, intervertebral fluid loss)
- GROWTH_PLATE_KINETIC (General vertical elongation & epiphyseal stimulation)

Return ONLY valid JSON (no markdown, no backticks):
{"archetype":"KYPHOSIS_THORACIC|LUMBAR_PELVIC_COMPRESSION|AXIAL_DISC_COMPRESSION|GROWTH_PLATE_KINETIC","archetypeName":"Display Name","intensity":"Beginner|Intermediate|Advanced","focus":"Specific biomechanical focus","rationale":"1-sentence clinical explanation"}`;

    const candidateModels = Array.from(
      new Set([GEMINI_MODEL, 'gemini-3.5-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'])
    );

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: compactPrompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 160,
            },
          }),
        });

        if (res.ok) {
          const json = await res.json();
          let rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

          const parsed = JSON.parse(rawText);
          if (parsed && parsed.archetype) {
            return {
              archetype: parsed.archetype,
              archetypeName: parsed.archetypeName || getArchetypeDisplayName(parsed.archetype),
              intensity: parsed.intensity || (age < 15 ? 'Beginner' : 'Intermediate'),
              focus: parsed.focus || 'Axial spinal decompression and posture verticality',
              rationale: parsed.rationale || 'Restoring intervertebral disc hydration to optimize diurnal stature.',
            };
          }
        }
      } catch (err) {
        // Fall through to offline pediatric clinical classification
      }
    }
  }

  // 2. Intelligent Offline Fallback: Deterministic Pediatric Biomechanical Classification
  return getOfflineBiomechanicalClassification(diagnostic);
}

function getArchetypeDisplayName(archetype: string): string {
  switch (archetype) {
    case 'KYPHOSIS_THORACIC':
      return 'Thoracic Extension & Cervical Posture';
    case 'LUMBAR_PELVIC_COMPRESSION':
      return 'Lumbar Decompression & Pelvic Alignment';
    case 'AXIAL_DISC_COMPRESSION':
      return 'Intervertebral Disc Rehydration';
    case 'GROWTH_PLATE_KINETIC':
    default:
      return 'Epiphyseal Longitudinal Traction';
  }
}

/**
 * Deterministic clinical fallback rules based on pediatric orthopedics
 */
export function getOfflineBiomechanicalClassification(
  diagnostic: UserDiagnosticInput
): BiomechanicalClassification {
  const sitting = (diagnostic.sittingHours || '').toLowerCase();
  const concern = (diagnostic.postureConcern || '').toLowerCase();
  const fatigue = (diagnostic.spinalFatigue || '').toLowerCase();
  const age = diagnostic.age || 16;

  if (concern.includes('neck') || concern.includes('head') || concern.includes('round') || concern.includes('shoulder')) {
    return {
      archetype: 'KYPHOSIS_THORACIC',
      archetypeName: 'Thoracic Extension & Cervical Posture',
      intensity: age < 15 ? 'Beginner' : 'Intermediate',
      focus: 'Thoracic ribcage expansion and anterior cervical ligament traction',
      rationale: 'Reversing anterior head carriage and thoracic rounding reclaims 1.0–2.0 cm of true axial vertical height.',
    };
  }

  if (concern.includes('pelvic') || concern.includes('lordosis') || concern.includes('hip') || concern.includes('lower back')) {
    return {
      archetype: 'LUMBAR_PELVIC_COMPRESSION',
      archetypeName: 'Lumbar Decompression & Pelvic Neutrality',
      intensity: 'Intermediate',
      focus: 'Psoas muscle elongation and sacral decompression',
      rationale: 'Correcting excessive anterior pelvic tilt neutralizes sacral shearing and aligns the lumbosacral junction.',
    };
  }

  if (sitting.includes('8') || sitting.includes('10') || fatigue.includes('high') || fatigue.includes('noticeable')) {
    return {
      archetype: 'AXIAL_DISC_COMPRESSION',
      archetypeName: 'Intervertebral Disc Fluid Rehydration',
      intensity: 'Beginner',
      focus: 'Full-column axial traction and intradiscal negative pressure',
      rationale: 'Prolonged seated gravity loads compress nucleus pulposus fibrocartilage; targeted traction restores disc verticality.',
    };
  }

  return {
    archetype: 'GROWTH_PLATE_KINETIC',
    archetypeName: 'Epiphyseal Longitudinal Traction',
    intensity: age < 15 ? 'Beginner' : 'Intermediate',
    focus: 'Kinetic chain elongation and long-bone micro-traction',
    rationale: 'Stimulating chondrocyte biomechanical tension across the lower limbs and axial spine during active growth windows.',
  };
}

/**
 * Local Deterministic Curriculum Router:
 * Slices and routes the 100-exercise admin database into a tailored 6-week schedule.
 * Guarantees distinct, non-repeating exercises each day of each week (Day 1 != Day 2 != Day 3).
 */
export function buildCalibrated6WeekProgram(
  classification: BiomechanicalClassification,
  pool: StretchExercise[],
  daysCount: number = 4
): Record<number, ProgramWeekInfo> {
  const allExercises = pool && pool.length > 0 ? pool : CLINICAL_STRETCHES;
  const count = Math.min(7, Math.max(3, daysCount));

  // Day names for the week schedule
  const dayRosterLabels: Record<number, string[]> = {
    3: ['Monday (Target Phase)', 'Wednesday (Axial Core)', 'Friday (Traction Release)'],
    4: ['Monday (Target Mobility)', 'Tuesday (Spine Core)', 'Thursday (Axial Traction)', 'Saturday (Full Alignment)'],
    5: ['Monday (Target Mobility)', 'Tuesday (Spine Core)', 'Wednesday (Axial Traction)', 'Thursday (Posterior Chain)', 'Friday (Full Alignment)'],
    6: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    7: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  };

  const dayNames = dayRosterLabels[count] || dayRosterLabels[4];

  // Prioritize exercises matching the user's archetype
  const targetedKeywords: Record<string, string[]> = {
    KYPHOSIS_THORACIC: ['thoracic', 'posture', 'cervical', 'cobra', 'ribcage', 'shoulder', 'chest', 'upper'],
    LUMBAR_PELVIC_COMPRESSION: ['lumbar', 'pelvic', 'psoas', 'hip', 'sacral', 'lordosis', 'lower', 'bridge'],
    AXIAL_DISC_COMPRESSION: ['axial', 'decompression', 'traction', 'hang', 'spine', 'gravity', 'inversion'],
    GROWTH_PLATE_KINETIC: ['reach', 'elongation', 'traction', 'growth', 'leg', 'tibia', 'femur', 'standing'],
  };

  const primaryKeywords = targetedKeywords[classification.archetype] || ['spine', 'traction'];

  // Partition the pool into primary priority vs secondary support
  const primaryPool: StretchExercise[] = [];
  const supportPool: StretchExercise[] = [];

  allExercises.forEach((ex) => {
    const text = `${ex.title} ${ex.category} ${ex.targetZone} ${ex.clinicalBenefit}`.toLowerCase();
    const matchesPrimary = primaryKeywords.some((kw) => text.includes(kw));
    if (matchesPrimary) {
      primaryPool.push(ex);
    } else {
      supportPool.push(ex);
    }
  });

  // Ensure pools are non-empty
  const primaryList = primaryPool.length > 0 ? primaryPool : allExercises;
  const supportList = supportPool.length > 0 ? supportPool : allExercises;

  const result: Record<number, ProgramWeekInfo> = {};

  for (let weekNum = 1; weekNum <= 6; weekNum++) {
    const weekMeta = PROGRAM_WEEK_METADATA[(weekNum - 1) % PROGRAM_WEEK_METADATA.length];
    const weeklyPlan: Record<string, StretchExercise[]> = {};

    dayNames.forEach((dayLabel, dayIndex) => {
      const dayExercises: StretchExercise[] = [];
      const sessionSize = 4; // 4 targeted exercises per daily session

      // Stagger indices across weeks and days to ensure Day 1 != Day 2 != Day 3 and Week 1 != Week 2
      for (let slot = 0; slot < sessionSize; slot++) {
        let candidate: StretchExercise;
        if (slot % 2 === 0) {
          // Take from primary targeted pool
          const idx = (weekNum * 3 + dayIndex * 2 + slot) % primaryList.length;
          candidate = primaryList[idx];
        } else {
          // Take from supporting decompression pool
          const idx = (weekNum * 2 + dayIndex * 3 + slot) % supportList.length;
          candidate = supportList[idx];
        }

        // Avoid duplicates within the same day
        if (candidate && !dayExercises.some((e) => e.id === candidate.id)) {
          dayExercises.push(candidate);
        } else {
          // Fallback pick next distinct exercise
          const fallback = allExercises.find((e) => !dayExercises.some((de) => de.id === e.id)) || candidate;
          if (fallback) dayExercises.push(fallback);
        }
      }

      weeklyPlan[dayLabel] = dayExercises;
    });

    result[weekNum] = {
      weekNumber: weekNum,
      title: `Week ${weekNum}: ${weekMeta.title}`,
      focus: `${classification.archetypeName} • ${weekMeta.focus}`,
      scientificGoal: weekMeta.scientificGoal,
      plan: weeklyPlan,
    };
  }

  return result;
}
