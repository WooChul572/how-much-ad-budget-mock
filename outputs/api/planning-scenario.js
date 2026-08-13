import { buildPlanningScenario } from '../howmuch-data.mjs';
import { mergeEnrichmentIntoScenarioInput } from './enrichment-utils.mjs';
import { buildProviderSnapshot } from './provider-data.mjs';

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

export default async function handler(request, response) {
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
    competitionIndex: toNumber(query.competitionIndex, undefined),
  };
  const enrichment = parseEnrichment(query.enrichment);
  const enrichedInput = enrichment ? mergeEnrichmentIntoScenarioInput(baseInput, enrichment) : baseInput;
  const providerSnapshot = await buildProviderSnapshot({
    company: enrichedInput.company,
    brand: enrichedInput.brand,
    market: enrichedInput.market,
    target: enrichedInput.targetSegment,
    goal: enrichedInput.targetGoal,
  });
  const scenarioInput = {
    ...enrichedInput,
    ...Object.fromEntries(Object.entries(providerSnapshot.scenarioAdjustments).filter(([, value]) => value !== undefined && value !== null && value !== '')),
    market: enrichedInput.market || providerSnapshot.scenarioAdjustments.market,
    targetSegment: enrichedInput.targetSegment || providerSnapshot.scenarioAdjustments.targetSegment,
    competitionLevel: enrichedInput.competitionLevel === 'unknown' ? providerSnapshot.scenarioAdjustments.competitionLevel : enrichedInput.competitionLevel,
  };
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
      liveDataApplied: providerSnapshot.liveDataApplied,
      dartApplied: providerSnapshot.dart.applied,
      kosisApplied: providerSnapshot.kosis.applied,
      note: providerSnapshot.liveDataApplied
        ? 'DART/KOSIS provider snapshot has been reflected in planning inputs before running the HOW MUCH engine.'
        : 'DART/KOSIS calls were attempted or checked; category and demographic benchmark fallback was applied where live rows were unavailable.',
    },
    providerSnapshot,
  });
}
