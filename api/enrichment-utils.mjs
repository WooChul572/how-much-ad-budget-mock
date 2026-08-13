function compactText(value = '') {
  return String(value).replace(/,/g, '').replace(/\s+/g, ' ').trim();
}

function firstNonEmpty(...values) {
  return values.find((value) => String(value || '').trim()) || '';
}

const CATEGORY_ENRICHMENTS = [
  {
    patterns: [/땡겨요/i, /배달앱/i, /배달\s*앱/i, /음식\s*배달/i],
    company: '신한은행',
    brand: '땡겨요',
    market: '배달앱 / 음식 배달 플랫폼',
    targetSegment: '2030대 모바일 주문 이용자 / 수도권 직장인·1인 가구',
    marketRevenue: 26000,
    targetShare: 5,
    competitionLevel: 'very-high',
    lifecycleStage: 'scale',
    competitors: ['배달의민족', '요기요', '쿠팡이츠'],
    dataSources: ['Gemini inference', 'category prior: Korean delivery app market'],
  },
];

function inferCategoryEnrichment(input = {}) {
  const text = compactText([
    input.goal,
    input.targetGoal,
    input.company,
    input.brand,
    input.market,
    input.targetSegment,
  ].filter(Boolean).join(' '));
  return CATEGORY_ENRICHMENTS.find((item) => item.patterns.some((pattern) => pattern.test(text))) || null;
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
  const category = inferCategoryEnrichment(input);
  const company = firstNonEmpty(input.company, goal.split(' ')[0]);
  const brand = firstNonEmpty(input.brand, inferBrand(goal, company));

  return {
    company: firstNonEmpty(input.company, category?.company, company),
    brand: firstNonEmpty(input.brand, category?.brand, brand),
    market: firstNonEmpty(input.market, category?.market),
    targetSegment: firstNonEmpty(input.targetSegment, category?.targetSegment),
    marketRevenue: Number(input.marketRevenue || category?.marketRevenue || 0),
    targetShare: Number(input.targetShare || category?.targetShare || 0),
    competitionLevel: input.competitionLevel && input.competitionLevel !== 'unknown' ? input.competitionLevel : category?.competitionLevel || 'unknown',
    lifecycleStage: input.lifecycleStage || category?.lifecycleStage || 'launch',
    competitorMode: input.competitors?.length || category?.competitors?.length ? 'known' : 'unknown',
    competitors: Array.isArray(input.competitors) && input.competitors.length ? input.competitors.slice(0, 5) : category?.competitors || [],
    confidence: 0,
    sourceMode: category ? 'category-assisted' : 'gemini-required',
    dataSources: category?.dataSources || ['Gemini API required'],
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
  const competitors = Array.isArray(data.competitors) && data.competitors.length
    ? data.competitors.map(String).filter(Boolean).slice(0, 5)
    : fallback.competitors;
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
