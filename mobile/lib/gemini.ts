export const GEMINI_API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  '';

export const GEMINI_MODEL =
  process.env.EXPO_PUBLIC_GEMINI_MODEL ||
  process.env.NEXT_PUBLIC_GEMINI_MODEL ||
  process.env.GEMINI_MODEL ||
  'gemini-3.5-flash-lite';

export const GEMINI_SYSTEM_INSTRUCTION = `You are the GoTall Clinical Growth Advisor. You provide honest, peer-reviewed pediatric growth and spinal biomechanics guidance.
Guardrails:
1. Never promise impossible height gains beyond epiphyseal biology.
2. Ground all genetic baseline projections in the Tanner-Whitehouse III equation: (Father + Mother ± 13 cm) / 2.
3. Attribute diurnal height changes (1.0–2.5 cm) strictly to intervertebral disc decompression.
4. Always cite relevant peer-reviewed literature (Tanner, Takahashi, AAP, Nature Genetics, JBMR).
5. Conclude with a brief reminder that this is educational guidance, not medical diagnosis.`;

/**
 * Queries Google Gemini API (gemini-3.5-flash-lite) with strict pediatric guardrails
 */
export async function queryGeminiAdvisor(
  userQuery: string,
  userProfile?: {
    age?: number;
    gender?: string;
    currentHeight?: number;
    growthRate?: string;
  }
): Promise<{ text: string; citation: string }> {
  // If no Gemini API key is configured, use the intelligent clinical knowledge base
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key') {
    return getOfflineClinicalResponse(userQuery, userProfile);
  }

  const contextPrefix = userProfile
    ? `User context: Age ${userProfile.age || 17}, Biological Sex: ${userProfile.gender || 'Male'}, Current Height: ${userProfile.currentHeight || 172.4} cm, Annual Velocity: ${userProfile.growthRate || '2–5 cm/year'}.\n\n`
    : '';

  const payload = {
    systemInstruction: {
      parts: [{ text: GEMINI_SYSTEM_INSTRUCTION }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: `${contextPrefix}User Question: ${userQuery}` }],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 300,
    },
  };

  // Modern Gemini models cascade starting with gemini-3.5-flash-lite
  const candidateModels = Array.from(
    new Set([GEMINI_MODEL, 'gemini-3.5-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'])
  );

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const candidateText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (candidateText) {
          return {
            text: candidateText.trim(),
            citation: `Ref: Gemini (${model}) • Tanner-Whitehouse III & AAP Guidelines`,
          };
        }
      }
    } catch (err) {
      // Continue to next model in cascade
    }
  }

  return getOfflineClinicalResponse(userQuery, userProfile);
}

/**
 * Peer-reviewed clinical fallback engine when offline or testing without API key
 */
function getOfflineClinicalResponse(
  query: string,
  userProfile?: { age?: number; gender?: string; currentHeight?: number }
): { text: string; citation: string } {
  const lower = query.toLowerCase();
  const age = userProfile?.age || 17;

  if (lower.includes('plate') || lower.includes('open') || lower.includes('age') || lower.includes('fuse')) {
    return {
      text: `At age ${age}, distal femoral and proximal tibial epiphyseal plates are approaching terminal ossification (typically completing at 16–19 in males, 14–16 in females). While chondrocytes in the proliferative zone decelerate, postural and spinal decompression protocols allow you to maximize your remaining millimeters.`,
      citation: 'Ref: UpToDate: Normal Pubertal Growth & Skeletal Maturation',
    };
  }

  if (lower.includes('bedtime') || lower.includes('food') || lower.includes('snack') || lower.includes('hgh')) {
    return {
      text: 'To optimize the nocturnal somatotropin pulse during Slow-Wave Sleep (SWS), consume slow-digesting micellar casein (like 150g Greek yogurt or cottage cheese) 60 minutes before bed. Avoid high glycemic sugars right before sleep, as elevated insulin blunts the initial growth hormone surge.',
      citation: 'Ref: Takahashi et al., Journal of Clinical Investigation',
    };
  }

  if (lower.includes('stretch') || lower.includes('hang') || lower.includes('spine') || lower.includes('decompression')) {
    return {
      text: 'Diurnal gravity compresses the 23 human intervertebral discs by 1.0 to 2.5 cm over the course of a day. Daily axial traction (like 60s passive bar hangs and cobra extensions) creates negative intradiscal pressure, drawing fluid and nutrients back into the nucleus pulposus.',
      citation: 'Ref: Journal of Back and Musculoskeletal Rehabilitation',
    };
  }

  if (lower.includes('genetics') || lower.includes('parents') || lower.includes('father') || lower.includes('mother')) {
    return {
      text: 'The Tanner-Whitehouse formula establishes your mid-parental genetic set-point: (Father + Mother ± 13 cm) / 2. This accounts for 60–80% of human stature variance, while the remaining 20–40% is governed by epigenetics, deep sleep, and spinal alignment.',
      citation: 'Ref: Visscher et al., Nature Genetics: Twin Stature Studies',
    };
  }

  return {
    text: 'Skeletal development depends on epiphyseal cartilage cell proliferation in long bones and daily intervertebral disc hydration. Ensure 8–10 hours of consistent slow-wave sleep, hit your personalized bone-matrix protein target, and perform 60-second decompression daily.',
    citation: 'Ref: American Academy of Pediatrics Pediatric Growth Guidelines',
  };
}

export interface EstimatedMealMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Bedtime Anabolic' | 'Snack';
  highlight: string;
}

/**
 * AI Nutrition Macro Estimator powered by Gemini 3.5 Flash Lite
 * Calculates calories, protein, carbs, fat, and meal category for custom user foods.
 */
export async function estimateMealMacros(foodName: string): Promise<EstimatedMealMacros> {
  const defaultFallback: EstimatedMealMacros = getOfflineEstimatedMacros(foodName);

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key' || !foodName.trim()) {
    return defaultFallback;
  }

  const prompt = `You are a clinical sports nutritionist and pediatric growth dietician.
Estimate the nutritional macro profile for this meal: "${foodName.trim()}".
Return ONLY a valid JSON object with exactly these fields (no markdown, no backticks):
{
  "calories": <integer in kcal>,
  "protein": <integer in grams>,
  "carbs": <integer in grams>,
  "fat": <integer in grams>,
  "category": <one of "Breakfast", "Lunch", "Dinner", "Bedtime Anabolic", "Snack">,
  "highlight": <brief 3-5 word benefit, e.g. "High Leucine Bone Fuel">
}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 200,
    },
  };

  const candidateModels = Array.from(
    new Set([GEMINI_MODEL, 'gemini-3.5-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'])
  );

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(rawText);

        return {
          calories: Math.max(10, Math.round(Number(parsed.calories) || defaultFallback.calories)),
          protein: Math.max(0, Math.round(Number(parsed.protein) || defaultFallback.protein)),
          carbs: Math.max(0, Math.round(Number(parsed.carbs) || defaultFallback.carbs)),
          fat: Math.max(0, Math.round(Number(parsed.fat) || defaultFallback.fat)),
          category: (['Breakfast', 'Lunch', 'Dinner', 'Bedtime Anabolic', 'Snack'].includes(parsed.category)
            ? parsed.category
            : defaultFallback.category) as any,
          highlight: String(parsed.highlight || defaultFallback.highlight),
        };
      }
    } catch (e) {
      // Cascade to next model or offline heuristic
    }
  }

  return defaultFallback;
}

/**
 * Offline clinical macro heuristics for common foods
 */
function getOfflineEstimatedMacros(foodName: string): EstimatedMealMacros {
  const query = foodName.toLowerCase();

  if (query.includes('chicken') || query.includes('poultry')) {
    return { calories: 330, protein: 42, carbs: 4, fat: 12, category: 'Lunch', highlight: 'High Skeletal Leucine' };
  }
  if (query.includes('egg') || query.includes('omelet') || query.includes('omelette')) {
    return { calories: 210, protein: 18, carbs: 2, fat: 14, category: 'Breakfast', highlight: 'Choline & Vitamin D3' };
  }
  if (query.includes('yogurt') || query.includes('curd') || query.includes('dahi')) {
    return { calories: 140, protein: 20, carbs: 9, fat: 1, category: 'Breakfast', highlight: '250mg Bone Calcium' };
  }
  if (query.includes('paneer') || query.includes('cottage cheese')) {
    return { calories: 290, protein: 24, carbs: 6, fat: 20, category: 'Bedtime Anabolic', highlight: 'Slow Micellar Casein' };
  }
  if (query.includes('dal') || query.includes('lentil') || query.includes('beans')) {
    return { calories: 260, protein: 16, carbs: 40, fat: 4, category: 'Dinner', highlight: 'Plant Amino Acids & Iron' };
  }
  if (query.includes('roti') || query.includes('chapati') || query.includes('bread')) {
    return { calories: 220, protein: 7, carbs: 42, fat: 3, category: 'Lunch', highlight: 'Complex Carbohydrates' };
  }
  if (query.includes('rice') || query.includes('biryani') || query.includes('pulao')) {
    return { calories: 420, protein: 22, carbs: 58, fat: 12, category: 'Dinner', highlight: 'Glycogen Replenishment' };
  }
  if (query.includes('salmon') || query.includes('fish') || query.includes('tuna')) {
    return { calories: 320, protein: 36, carbs: 0, fat: 18, category: 'Dinner', highlight: 'Omega-3 & Vitamin D3' };
  }
  if (query.includes('shake') || query.includes('smoothie') || query.includes('protein')) {
    return { calories: 280, protein: 30, carbs: 28, fat: 4, category: 'Snack', highlight: 'Rapid Chondrocyte Uptake' };
  }
  if (query.includes('milk')) {
    return { calories: 150, protein: 8, carbs: 12, fat: 8, category: 'Bedtime Anabolic', highlight: 'Calcium & IGF-1 Catalyst' };
  }

  // General balanced default
  return {
    calories: 320,
    protein: 20,
    carbs: 35,
    fat: 10,
    category: 'Lunch',
    highlight: 'Balanced Growth Matrix',
  };
}

