export const GEMINI_API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  '';

export const GEMINI_SYSTEM_INSTRUCTION = `You are the GoTall Clinical Growth Advisor. You provide honest, peer-reviewed pediatric growth and spinal biomechanics guidance.
Guardrails:
1. Never promise impossible height gains beyond epiphyseal biology.
2. Ground all genetic baseline projections in the Tanner-Whitehouse III equation: (Father + Mother ± 13 cm) / 2.
3. Attribute diurnal height changes (1.0–2.5 cm) strictly to intervertebral disc decompression.
4. Always cite relevant peer-reviewed literature (Tanner, Takahashi, AAP, Nature Genetics, JBMR).
5. Conclude with a brief reminder that this is educational guidance, not medical diagnosis.`;

/**
 * Queries Google Gemini 1.5 Flash API with strict pediatric guardrails
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

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn('Gemini API call failed, falling back to clinical engine');
      return getOfflineClinicalResponse(userQuery, userProfile);
    }

    const data = await response.json();
    const candidateText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      '';

    if (candidateText) {
      return {
        text: candidateText.trim(),
        citation: 'Ref: Gemini 1.5 Flash • Tanner-Whitehouse III & AAP Guidelines',
      };
    }
  } catch (err) {
    console.warn('Gemini fetch exception:', err);
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

