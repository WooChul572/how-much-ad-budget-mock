import { buildFallbackEnrichment, sanitizeEnrichment } from './enrichment-utils.mjs';

function queryValue(query, key) {
  const value = query?.[key];
  return Array.isArray(value) ? value[0] : value || '';
}

function parseJsonFromText(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = String(text || '').match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
}

async function callGeminiForEnrichment(input, fallback) {
  if (!process.env.GEMINI_API_KEY) return null;

  const prompt = [
    'You are a Korean B2B marketing intelligence analyst.',
    'Infer missing campaign planning fields from advertiser name, brand, goal, market and target.',
    'Use cautious estimates. Never invent exact facts as verified. Mark inferred dataSources clearly.',
    'Return only valid JSON with keys: company, brand, market, targetSegment, marketRevenue, targetShare, competitionLevel, lifecycleStage, competitorMode, competitors, confidence, dataSources, rationale.',
    'competitionLevel must be one of unknown, low, medium, high, very-high.',
    'lifecycleStage must be one of launch, scale, stabilize, defend.',
    'marketRevenue is annual Korean market size in KRW eok.',
    `Input: ${JSON.stringify(input)}`,
    `Fallback baseline: ${JSON.stringify(fallback)}`,
  ].join('\n');

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 900,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini enrichment failed: ${response.status}`);
  }

  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n') ?? '';
  const parsed = parseJsonFromText(text);
  if (!parsed) throw new Error('Gemini enrichment returned no JSON');
  return { ...parsed, sourceMode: 'gemini-enriched' };
}

export default async function handler(request, response) {
  const query = request.query ?? {};
  const input = {
    goal: queryValue(query, 'goal') || queryValue(query, 'targetGoal'),
    company: queryValue(query, 'company'),
    brand: queryValue(query, 'brand'),
    market: queryValue(query, 'market'),
    targetSegment: queryValue(query, 'targetSegment'),
    competitionLevel: queryValue(query, 'competitionLevel'),
    lifecycleStage: queryValue(query, 'lifecycleStage'),
    marketRevenue: Number(queryValue(query, 'marketRevenue') || 0),
    targetShare: Number(queryValue(query, 'targetShare') || 0),
    competitors: queryValue(query, 'competitors').split(',').map((item) => item.trim()).filter(Boolean),
  };

  const fallback = buildFallbackEnrichment(input);
  try {
    const ai = await callGeminiForEnrichment(input, fallback);
    response.status(200).json({
      ...sanitizeEnrichment(ai || fallback, fallback),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  } catch (error) {
    response.status(200).json({
      ...sanitizeEnrichment({ ...fallback, sourceMode: 'fallback-after-ai-error' }, fallback),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      warning: error.message,
    });
  }
}
