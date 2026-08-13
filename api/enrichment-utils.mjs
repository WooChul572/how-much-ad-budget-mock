const knownMarketProfiles = [
  {
    match: /고려은단|관절|콘드로이친|리즈다|관절올케어|건강기능식품/,
    company: '고려은단',
    market: '관절 건강기능식품',
    targetSegment: '45-69 여성 / 관절 건강 관심층',
    marketRevenue: 5000,
    targetShare: 6,
    competitionLevel: 'high',
    lifecycleStage: 'launch',
    competitors: ['주영엔에스', '종근당건강', '뉴트리원', '휴온스'],
    rationale: '관절 건강기능식품은 TV와 검색 수요가 동시에 형성되는 고경쟁 카테고리로 분류했습니다.',
  },
  {
    match: /리쥬란|피부|스킨부스터|에스테틱/,
    market: '에스테틱 / 피부관리',
    targetSegment: '25-54 여성 / 피부 탄력 관심층',
    marketRevenue: 3200,
    targetShare: 5,
    competitionLevel: 'very-high',
    lifecycleStage: 'scale',
    competitors: ['울쎄라', '써마지', '쥬베룩', '올리지오'],
    rationale: '에스테틱 시장은 고가 시술과 브랜드 검색 수요가 강해 경쟁강도를 높게 산정했습니다.',
  },
];

function compactText(value = '') {
  return String(value).replace(/,/g, '').replace(/\s+/g, ' ').trim();
}

function firstNonEmpty(...values) {
  return values.find((value) => String(value || '').trim()) || '';
}

function inferBrand(goal, company) {
  const text = compactText(goal);
  const withoutCompany = company ? text.replace(company, '').trim() : text;
  const stopWords = /(\d|매출|신규|고객|방문|검색|인지|달성|확보|상승|증대|광고|예산|목표)/;
  const token = withoutCompany.split(' ').find((item) => item.length >= 2 && !stopWords.test(item));
  return token || '';
}

function inferGoalShare(goal, fallback = 6) {
  const text = compactText(goal);
  const revenue = text.match(/(\d+(?:\.\d+)?)\s*(조|천억|백억|억원|억)?\s*(?:매출|판매)/)
    ?? text.match(/(?:매출|판매)[^\d]*(\d+(?:\.\d+)?)\s*(조|천억|백억|억원|억)?/);
  if (!revenue) return fallback;
  const raw = Number(revenue[1]);
  const unit = revenue[2] === '조' ? 10000 : revenue[2] === '천억' ? 1000 : revenue[2] === '백억' ? 100 : 1;
  const revenueValue = raw * unit;
  return Math.max(1, Math.min(25, Math.round(revenueValue / 50)));
}

export function buildFallbackEnrichment(input = {}) {
  const goal = compactText(input.goal || input.targetGoal);
  const combined = `${goal} ${input.company || ''} ${input.brand || ''} ${input.market || ''}`;
  const profile = knownMarketProfiles.find((item) => item.match.test(combined)) ?? {
    market: input.market || '입력 목표 기반 추정 시장',
    targetSegment: input.targetSegment || '전국 성인 / 관심 타겟',
    marketRevenue: 1800,
    targetShare: 4,
    competitionLevel: 'unknown',
    lifecycleStage: 'launch',
    competitors: [],
    rationale: '공개 데이터 연결 전에는 목표 문장과 입력값 기반의 보수적 추정치를 사용합니다.',
  };
  const company = firstNonEmpty(input.company, profile.company, goal.split(' ')[0]);
  const brand = firstNonEmpty(input.brand, inferBrand(goal, company));
  const competitors = input.competitors?.length ? input.competitors : profile.competitors;

  return {
    company,
    brand,
    market: firstNonEmpty(input.market, profile.market),
    targetSegment: firstNonEmpty(input.targetSegment, profile.targetSegment),
    marketRevenue: Number(input.marketRevenue || 0) > 0 ? Number(input.marketRevenue) : profile.marketRevenue,
    targetShare: Number(input.targetShare || 0) > 0 ? Number(input.targetShare) : inferGoalShare(goal, profile.targetShare),
    competitionLevel: input.competitionLevel && input.competitionLevel !== 'unknown' ? input.competitionLevel : profile.competitionLevel,
    lifecycleStage: input.lifecycleStage || profile.lifecycleStage,
    competitorMode: competitors.length ? 'known' : 'unknown',
    competitors: competitors.slice(0, 5),
    confidence: process.env.GEMINI_API_KEY ? 72 : 58,
    sourceMode: 'fallback-heuristic',
    dataSources: ['입력 목표 문장', '국내 카테고리 벤치마크', 'HOW MUCH fallback profile'],
    rationale: profile.rationale,
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
  return {
    company: firstNonEmpty(data.company, fallback.company),
    brand: firstNonEmpty(data.brand, fallback.brand),
    market: firstNonEmpty(data.market, fallback.market),
    targetSegment: firstNonEmpty(data.targetSegment, fallback.targetSegment),
    marketRevenue: Number(data.marketRevenue || fallback.marketRevenue || 0),
    targetShare: Number(data.targetShare || fallback.targetShare || 0),
    competitionLevel: allowedCompetition.has(data.competitionLevel) ? data.competitionLevel : fallback.competitionLevel,
    lifecycleStage: allowedLifecycle.has(data.lifecycleStage) ? data.lifecycleStage : fallback.lifecycleStage,
    competitorMode: Array.isArray(data.competitors) && data.competitors.length ? 'known' : fallback.competitorMode,
    competitors: Array.isArray(data.competitors) ? data.competitors.map(String).filter(Boolean).slice(0, 5) : fallback.competitors,
    confidence: Math.max(0, Math.min(95, Number(data.confidence || fallback.confidence || 60))),
    sourceMode: data.sourceMode || fallback.sourceMode || 'fallback-heuristic',
    dataSources: Array.isArray(data.dataSources) && data.dataSources.length ? data.dataSources.slice(0, 6) : fallback.dataSources,
    rationale: firstNonEmpty(data.rationale, fallback.rationale),
  };
}
