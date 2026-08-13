function compactText(value = '') {
  return String(value).replace(/,/g, '').replace(/\s+/g, ' ').trim();
}

function firstNonEmpty(...values) {
  return values.find((value) => String(value || '').trim()) || '';
}

function inferBrand(goal, company) {
  const text = compactText(goal);
  const withoutCompany = company ? text.replace(company, '').trim() : text;
  const stopWords = /(\d|매출|신규|고객|방문|검색|인지|달성|확보|상승|증대|광고|예산|목표|연간|월간|시장|점유)/;
  const token = withoutCompany.split(' ').find((item) => item.length >= 2 && !stopWords.test(item));
  return token || '';
}

export function buildFallbackEnrichment(input = {}) {
  const goal = compactText(input.goal || input.targetGoal);
  const company = firstNonEmpty(input.company, goal.split(' ')[0]);
  const brand = firstNonEmpty(input.brand, inferBrand(goal, company));

  return {
    company,
    brand,
    market: input.market || '',
    targetSegment: input.targetSegment || '',
    marketRevenue: Number(input.marketRevenue || 0),
    targetShare: Number(input.targetShare || 0),
    competitionLevel: input.competitionLevel && input.competitionLevel !== 'unknown' ? input.competitionLevel : 'unknown',
    lifecycleStage: input.lifecycleStage || 'launch',
    competitorMode: input.competitors?.length ? 'known' : 'unknown',
    competitors: Array.isArray(input.competitors) ? input.competitors.slice(0, 5) : [],
    confidence: 0,
    sourceMode: 'gemini-required',
    dataSources: ['Gemini API required'],
    rationale: 'Gemini API가 연결되면 목표 문장과 공공 데이터 맥락을 바탕으로 시장, 타겟, 경쟁사, 시장규모를 자동 추정합니다.',
  };
}

export function mergeEnrichmentIntoScenarioInput(base = {}, enrichment = {}) {
  const merged = { ...base };
  const fill = (key) => {
    if (merged[key] === undefined || merged[key] === null || merged[key] === '' || merged[key] === 0) {
      if (enrichment[key] !== undefined && enrichment[key] !== null && enrichment[key] !== '') merged[key] = enrichment[key];
    }
  };
  ['company', 'brand', 'market', 'targetSegment', 'marketRevenue', 'targetShare', 'competitionLevel', 'lifecycleStage', 'competitorMode'].forEach(fill);
  if (!Array.isArray(merged.competitors) || merged.competitors.length === 0) {
    merged.competitors = Array.isArray(enrichment.competitors) ? enrichment.competitors : [];
  }
  return merged;
}

export function sanitizeEnrichment(data = {}, fallback = {}) {
  const allowedCompetition = new Set(['unknown', 'low', 'medium', 'high', 'very-high']);
  const allowedLifecycle = new Set(['launch', 'scale', 'stabilize', 'defend']);
  const competitors = Array.isArray(data.competitors) ? data.competitors.map(String).filter(Boolean).slice(0, 5) : fallback.competitors;
  return {
    company: firstNonEmpty(data.company, fallback.company),
    brand: firstNonEmpty(data.brand, fallback.brand),
    market: firstNonEmpty(data.market, fallback.market),
    targetSegment: firstNonEmpty(data.targetSegment, fallback.targetSegment),
    marketRevenue: Number(data.marketRevenue || fallback.marketRevenue || 0),
    targetShare: Number(data.targetShare || fallback.targetShare || 0),
    competitionLevel: allowedCompetition.has(data.competitionLevel) ? data.competitionLevel : fallback.competitionLevel,
    lifecycleStage: allowedLifecycle.has(data.lifecycleStage) ? data.lifecycleStage : fallback.lifecycleStage,
    competitorMode: competitors?.length ? 'known' : fallback.competitorMode,
    competitors: competitors || [],
    confidence: Math.max(0, Math.min(95, Number(data.confidence || fallback.confidence || 0))),
    sourceMode: data.sourceMode || fallback.sourceMode || 'gemini-required',
    dataSources: Array.isArray(data.dataSources) && data.dataSources.length ? data.dataSources.slice(0, 6) : fallback.dataSources,
    rationale: firstNonEmpty(data.rationale, fallback.rationale),
  };
}
