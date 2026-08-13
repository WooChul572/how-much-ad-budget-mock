import { buildPlanningScenario } from '../howmuch-data.mjs';
import { mergeEnrichmentIntoScenarioInput } from './enrichment-utils.mjs';

function toNumber(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return value === true || value === 'true' || value === '1' || value === 'yes';
}

function toList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function parseEnrichment(value) {
  if (!value) return null;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return null;
  }
}

export default function handler(request, response) {
  const query = request.query ?? {};
  const baseInput = {
    currentBudget: toNumber(query.currentBudget, 0),
    hasCurrentBudget: toBoolean(query.hasCurrentBudget, false),
    targetGoal: query.targetGoal || query.goal || '',
    company: query.company || '',
    brand: query.brand || '',
    market: query.market || '',
    targetSegment: query.targetSegment || '',
    competitionLevel: query.competitionLevel || 'unknown',
    targetType: query.targetType || 'mass',
    lifecycleStage: query.lifecycleStage || 'launch',
    marketRevenue: toNumber(query.marketRevenue, 5000),
    targetShare: toNumber(query.targetShare, 10),
    monthlyTvBudget: toNumber(query.monthlyTvBudget, 0),
    monthlyDigitalBudget: toNumber(query.monthlyDigitalBudget, 0),
    grossMargin: toNumber(query.grossMargin, 52),
    requiredRoas: toNumber(query.requiredRoas, 1.8),
    customerLtv: toNumber(query.customerLtv, 42),
    conversionRate: toNumber(query.conversionRate, 2.6),
    competitorMode: query.competitorMode || 'unknown',
    competitors: toList(query.competitors),
  };
  const enrichment = parseEnrichment(query.enrichment);
  const scenarioInput = enrichment ? mergeEnrichmentIntoScenarioInput(baseInput, enrichment) : baseInput;
  const scenario = buildPlanningScenario(scenarioInput);

  response.status(200).json({
    ...scenario,
    sourceMode: 'api-engine',
    enrichmentApplied: Boolean(enrichment),
    enrichment,
    apiInputs: {
      dartConfigured: Boolean(process.env.DART_API_KEY),
      kosisConfigured: Boolean(process.env.KOSIS_API_KEY),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      liveDataApplied: false,
      note: 'Current endpoint runs the HOW MUCH planning engine on API/server side. DART/KOSIS keys are detected through Vercel env vars; live provider fetch can replace mock benchmark inputs in the next integration step.',
    },
  });
}
