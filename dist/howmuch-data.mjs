export const mediaMix = [
  { channel: 'YouTube', percent: 25, amount: 4.5, current: 22, color: '#1e63ff' },
  { channel: 'TV', percent: 24, amount: 4.3, current: 30, color: '#111827' },
  { channel: 'Naver', percent: 21, amount: 3.8, current: 18, color: '#0f9f6e' },
  { channel: 'Kakao', percent: 12, amount: 2.2, current: 8, color: '#f2c94c' },
  { channel: 'Meta', percent: 8, amount: 1.4, current: 12, color: '#5865f2' },
  { channel: 'OOH', percent: 10, amount: 1.8, current: 10, color: '#9ca3af' },
];

export const domesticMediaPatterns = [
  {
    channel: 'Naver',
    role: '검색 수요 포착',
    pattern: '키워드별 노출, 클릭, 비용, 전환을 일 단위로 누적해 수요가 이미 형성된 구간의 하한 예산을 잡습니다.',
    modelingSignal: '검색량/클릭/전환 비용 기반 intent capture 가중치',
    source: 'Naver SearchAd API',
  },
  {
    channel: 'Kakao',
    role: 'CRM/메시지/생활권 도달',
    pattern: 'Bizboard, Display, Message, Talk Channel Reach 성과를 타깃, 시간대, 소재 단위로 읽어 반복 접촉 비용을 보정합니다.',
    modelingSignal: '타깃 모수, imp, click, cost, message unit cost 기반 frequency 가중치',
    source: 'Kakao Moment Report API',
  },
  {
    channel: 'TV',
    role: '신뢰/광범위 도달',
    pattern: '방송 광고비와 업종별 집행 강도를 기준으로 초기 도달은 빠르지만 일정 예산 이후 한계효율이 둔화되는 패턴을 둡니다.',
    modelingSignal: 'KOBACO 방송통신광고비조사 + 시청률/접촉률 벤치마크',
    source: 'KOBACO ADSTAT/MCR',
  },
  {
    channel: 'OOH',
    role: '지역 반복 노출',
    pattern: '권역, 집행 기간, 위치 인벤토리의 고정비 성격을 반영해 짧은 기간보다 충분한 기간에서 효율이 개선되도록 보정합니다.',
    modelingSignal: 'KOBACO 옥외 광고비 통계 + 권역/상권 노출 벤치마크',
    source: 'KOBACO ADSTAT/OAAA benchmark',
  },
];

export const budgetPlans = [
  {
    key: 'safe',
    label: 'SAFE',
    budget: 17.2,
    tone: 'Defensive growth',
    description: '현재 집행 구조를 크게 흔들지 않고 목표 달성 가능성을 확보하는 보수적 증액안입니다.',
  },
  {
    key: 'optimal',
    label: 'OPTIMAL',
    budget: 18.5,
    tone: 'Recommended',
    description: '목표 달성률과 추가 투자 효율의 균형이 가장 좋은 기준 추천안입니다.',
  },
  {
    key: 'aggressive',
    label: 'AGGRESSIVE',
    budget: 20.1,
    tone: 'Share capture',
    description: '경쟁 방어와 시장 점유 확대를 위해 상단 범위까지 확장하는 공격적 집행안입니다.',
  },
];

export const goalProfiles = {
  awareness: {
    label: '인지도 확대',
    difficulty: 1.08,
    floorWeight: 0.78,
    sovWeight: 1.05,
    model: 'SOV / Reach Build Model',
    mix: { YouTube: 5, TV: 6, Naver: -6, Kakao: -1, Meta: 2, OOH: 3 },
    reason: '브랜드 인지도 목표는 넓은 도달과 반복 노출이 중요해 TV, YouTube, OOH 가중치를 높입니다.',
  },
  traffic: {
    label: '방문/검색 수요',
    difficulty: 0.94,
    floorWeight: 0.35,
    sovWeight: 0.55,
    model: 'Intent Capture / CPC Traffic Model',
    mix: { YouTube: -2, TV: -6, Naver: 9, Kakao: 2, Meta: 1, OOH: -4 },
    reason: '웹사이트 방문 목표는 이미 형성된 검색 수요와 클릭 효율이 중요해 Naver/Kakao 비중을 높입니다.',
  },
  acquisition: {
    label: '신규 고객 확보',
    difficulty: 1.02,
    floorWeight: 0.62,
    sovWeight: 0.82,
    model: 'CAC / Funnel Conversion Model',
    mix: { YouTube: 1, TV: -4, Naver: 5, Kakao: 3, Meta: 4, OOH: -4 },
    reason: '신규 고객 확보는 도달과 전환의 균형이 필요해 YouTube, Naver, Meta를 함께 강화합니다.',
  },
  revenue: {
    label: '매출 증대',
    difficulty: 1.15,
    floorWeight: 0.45,
    sovWeight: 0.68,
    model: 'Incremental Revenue / mROAS Model',
    mix: { YouTube: -3, TV: -7, Naver: 8, Kakao: 4, Meta: 3, OOH: -5 },
    reason: '매출 목표는 하단 퍼널 효율과 구매 의도가 중요해 Naver/Kakao/Meta 가중치를 높입니다.',
  },
};

export const competitionProfiles = {
  unknown: { label: '모름', factor: 1.0, confidence: 74, note: '경쟁 강도를 모름으로 선택해 업종 평균 광고 intensity와 공개 벤치마크를 기준으로 계산합니다.' },
  low: { label: '낮음', factor: 0.78, confidence: 78, note: '경쟁 집행 압력이 낮아 목표 도달에 필요한 share-of-voice 보정이 작습니다.' },
  medium: { label: '보통', factor: 1.04, confidence: 82, note: '업종 평균 수준의 경쟁 압력을 적용합니다.' },
  high: { label: '높음', factor: 1.28, confidence: 85, note: '경쟁사 집행이 활발한 구간으로 방어 예산과 반복 노출 보정이 필요합니다.' },
  'very-high': { label: '매우 높음', factor: 1.55, confidence: 87, note: '상위 경쟁사의 share-of-voice 압력이 높아 목표 달성 예산이 크게 상승합니다.' },
};

export const targetProfiles = {
  mass: { label: '대중 인지도형', population: 2380, factor: 1.08, mix: { YouTube: 3, TV: 5, Naver: -3, Kakao: 0, Meta: 0, OOH: 2 } },
  search: { label: '검색 수요형', population: 1840, factor: 0.97, mix: { YouTube: -2, TV: -5, Naver: 8, Kakao: 2, Meta: 0, OOH: -3 } },
  conversion: { label: '전환/구매형', population: 1420, factor: 0.92, mix: { YouTube: -3, TV: -7, Naver: 6, Kakao: 4, Meta: 5, OOH: -5 } },
  local: { label: '지역 접점형', population: 980, factor: 0.88, mix: { YouTube: -3, TV: -6, Naver: 2, Kakao: 3, Meta: 0, OOH: 8 } },
};

export const lifecycleProfiles = {
  launch: {
    label: '런칭 초기',
    marketBudgetRatio: 0.28,
    sovPremium: 1.18,
    maintenanceFactor: 0.82,
    note: '런칭 초기에는 인지도 형성과 유통/검색 수요 동시 확보가 필요해 정상 운영기보다 높은 SOV 예산을 둡니다.',
  },
  scale: {
    label: '공격 성장',
    marketBudgetRatio: 0.22,
    sovPremium: 1.04,
    maintenanceFactor: 0.72,
    note: '공격 성장 단계는 초기 런칭보다 효율을 보지만, 점유율 확대를 위해 경쟁사 대비 초과 SOV를 유지합니다.',
  },
  stabilize: {
    label: '안정화',
    marketBudgetRatio: 0.14,
    sovPremium: 0.82,
    maintenanceFactor: 0.52,
    note: '안정화 단계에서는 이미 형성된 브랜드 수요와 adstock carryover를 반영해 집행을 줄이고 효율 중심으로 재배분합니다.',
  },
  defend: {
    label: '방어/유지',
    marketBudgetRatio: 0.1,
    sovPremium: 0.7,
    maintenanceFactor: 0.42,
    note: '방어/유지 단계는 과잉 도달보다 핵심 타깃 빈도와 검색/전환 방어를 우선합니다.',
  },
};

export const koreanAdMarketTrend = {
  label: '한국 광고시장 2025 트렌드',
  budgetFactor: 0.96,
  notes: [
    '국내 광고 집행은 온라인/모바일 중심으로 이동하고 있어 동일 목표에서도 디지털 검증 이후 증액하는 구조가 합리적입니다.',
    'TV는 런칭 초기 신뢰와 대중 도달에는 유효하지만, 안정화 이후에는 검색/커머스/리타겟팅 예산으로 점진 이동하는 패턴을 둡니다.',
    'OOH는 디지털 사이니지와 지역 접점 목적에서는 유지하지만, 순수 성과 목표에서는 상한을 둡니다.',
  ],
  lifecycleMix: {
    launch: { YouTube: 2, TV: 3, Naver: 1, Kakao: 1, Meta: 0, OOH: 0 },
    scale: { YouTube: 2, TV: -2, Naver: 3, Kakao: 2, Meta: 2, OOH: -1 },
    stabilize: { YouTube: 0, TV: -5, Naver: 5, Kakao: 3, Meta: 3, OOH: -2 },
    defend: { YouTube: -1, TV: -6, Naver: 5, Kakao: 4, Meta: 3, OOH: -2 },
  },
};

export function getBudgetRecommendation() {
  return {
    recommendedBudget: 18.5,
    range: [17.2, 20.1],
    currentBudget: 12,
    incrementalBudget: 6.5,
    saturationBudget: 20,
    diminishingBudget: 18,
  };
}

export function buildPlanningScenario(options = {}) {
  const hasCurrentBudget = options.hasCurrentBudget !== false;
  const currentBudget = hasCurrentBudget ? Number(options.currentBudget ?? 12) : null;
  const targetGoal = options.targetGoal ?? '신규 고객 10,000명 확보';
  const goalProfile = goalProfiles[options.goalType] ?? inferGoalProfile(targetGoal);
  const parsedGoal = parseGoalValue(targetGoal);
  const competitionProfile = competitionProfiles[options.competitionLevel] ?? competitionProfiles.unknown;
  const targetProfile = targetProfiles[options.targetType] ?? targetProfiles.mass;
  const lifecycleStageKey = lifecycleProfiles[options.lifecycleStage] ? options.lifecycleStage : 'launch';
  const lifecycleProfile = lifecycleProfiles[lifecycleStageKey];
  const competitors = Array.isArray(options.competitors) ? options.competitors.filter(Boolean).slice(0, 5) : [];
  const competitorMode = options.competitorMode ?? (competitors.length ? 'known' : 'unknown');
  const marketRevenue = Number(options.marketRevenue ?? 5000);
  const targetShare = Number(options.targetShare ?? 10);
  const monthlyTvBudget = Number(options.monthlyTvBudget ?? 0);
  const monthlyDigitalBudget = Number(options.monthlyDigitalBudget ?? 0);
  const grossMargin = Number(options.grossMargin ?? 52);
  const averageOrderValue = Number(options.averageOrderValue ?? 18);
  const customerLtv = Number(options.customerLtv ?? 42);
  const conversionRate = Number(options.conversionRate ?? 2.6);
  const requiredRoas = Number(options.requiredRoas ?? 1.8);
  const currentAnnualRunRate = round((monthlyTvBudget + monthlyDigitalBudget) * 12);
  const shareRevenueOpportunity = round(marketRevenue * (targetShare / 100));
  const targetRevenueOpportunity = getRevenueOpportunity(parsedGoal, shareRevenueOpportunity);
  const goalScaleFactor = getGoalScaleFactor(parsedGoal);
  const competitorCountFactor = competitorMode === 'known' ? round(1 + Math.min(competitors.length, 5) * 0.025) : 1;
  const marketSize = options.marketSize ?? 58000;
  const targetPopulation = options.targetPopulation ?? targetProfile.population;
  const categoryAdIntensity = options.categoryAdIntensity ?? 0.000265;
  const competitionIndex = options.competitionIndex ?? round(competitionProfile.factor * competitorCountFactor);
  const goalDifficulty = options.goalDifficulty ?? goalProfile.difficulty;
  const mixComplexity = options.mixComplexity ?? targetProfile.factor;
  const adstockRetention = options.adstockRetention ?? 0.55;
  const saturationSlope = options.saturationSlope ?? 1.7;
  const priorWeight = options.priorWeight ?? 0.42;
  const domesticPatternLift = options.domesticPatternLift ?? 1.035;

  const marketBaseBudget = round(marketSize * categoryAdIntensity);
  const targetScaleFactor = round(Math.max(0.82, Math.min(1.18, targetPopulation / 2200)));
  const adstockAdjustedBudget = round(marketBaseBudget / (1 - adstockRetention * 0.18));
  const saturationAdjustedBudget = round(adstockAdjustedBudget * (1 + (saturationSlope - 1) * 0.08));
  const domesticAdjustedBudget = round(saturationAdjustedBudget * domesticPatternLift);
  const modeledBudget = round(domesticAdjustedBudget * competitionIndex * goalDifficulty * mixComplexity * targetScaleFactor * koreanAdMarketTrend.budgetFactor * goalScaleFactor);
  const mmmBudget = round((modeledBudget * (1 - priorWeight)) + (16.4 * priorWeight));
  const marketShareBudget = round(targetRevenueOpportunity * lifecycleProfile.marketBudgetRatio);
  const runRateSignal = round(currentAnnualRunRate * lifecycleProfile.maintenanceFactor);
  const sovRawBudget = round((marketShareBudget * lifecycleProfile.sovPremium * competitionIndex * goalProfile.sovWeight) + (runRateSignal * 0.28));
  const sovCeiling = round(targetRevenueOpportunity * 0.62);
  const sovBudget = round(Math.min(sovRawBudget, sovCeiling));
  const goalSizedFloor = round(currentAnnualRunRate * lifecycleProfile.maintenanceFactor * goalProfile.floorWeight * Math.max(0.28, Math.min(1, goalScaleFactor)));
  const maintenanceBudget = round(goalSizedFloor);
  const recommendedBudget = round(Math.max(mmmBudget, marketShareBudget, sovBudget, maintenanceBudget));
  const safeBudget = round(Math.max(maintenanceBudget, recommendedBudget * 0.72));
  const aggressiveBudget = round(recommendedBudget * (lifecycleProfile.label === '런칭 초기' ? 1.45 : lifecycleProfile.label === '공격 성장' ? 1.32 : 1.18));
  const incrementalBudget = hasCurrentBudget ? round(Math.max(0, recommendedBudget - currentBudget)) : null;
  const businessCase = buildBusinessCase({
    parsedGoal,
    goalProfile,
    recommendedBudget,
    targetRevenueOpportunity,
    grossMargin,
    averageOrderValue,
    customerLtv,
    conversionRate,
    requiredRoas,
  });

  return {
    mode: hasCurrentBudget ? 'gap-analysis' : 'zero-base-sizing',
    decision: hasCurrentBudget ? (incrementalBudget > 0 ? 'increase-budget' : 'hold-or-reallocate') : 'new-budget',
    targetGoal,
    parsedGoal,
    goalType: goalProfile.label,
    targetType: targetProfile.label,
    competitionLevel: competitionProfile.label,
    competitorMode,
    lifecycleStage: lifecycleProfile.label,
    competitors,
    marketRevenue,
    targetShare,
    shareRevenueOpportunity,
    targetRevenueOpportunity,
    grossMargin,
    averageOrderValue,
    customerLtv,
    conversionRate,
    requiredRoas,
    businessCase,
    currentAnnualRunRate,
    monthlyTvBudget,
    monthlyDigitalBudget,
    budgetDrivers: {
      mmmBudget,
      marketShareBudget,
      sovBudget,
      maintenanceBudget,
      selected: recommendedBudget,
    },
    mediaMix: getScenarioMix(recommendedBudget, goalProfile, targetProfile, lifecycleStageKey),
    currentBudget,
    recommendedBudget,
    range: [safeBudget, aggressiveBudget],
    incrementalBudget,
    confidence: competitionProfile.confidence,
    scenarioNotes: [
      goalProfile.reason,
      `${goalProfile.model}을 적용해 목표 유형별 예산 하한과 SOV 필요 강도를 다르게 계산했습니다.`,
      competitionProfile.note,
      lifecycleProfile.note,
      ...koreanAdMarketTrend.notes,
      parsedGoal.type === 'revenue'
        ? `목표 문장에서 매출 목표 ${formatBudget(parsedGoal.value)}를 읽어 예산 산정에 직접 반영했습니다.`
        : `시장 ${formatBudget(marketRevenue)}에서 목표 점유율 ${targetShare}%는 매출 기회 ${formatBudget(targetRevenueOpportunity)}로 환산됩니다.`,
      `현재 월 TV ${formatBudget(monthlyTvBudget)} + 디지털 ${formatBudget(monthlyDigitalBudget)} 집행은 연간 run-rate ${formatBudget(currentAnnualRunRate)}입니다.`,
      getCompetitorNote(competitorMode, competitors, competitorCountFactor),
      `타깃 성향은 ${targetProfile.label}으로 판단해 매체 배분을 보정했습니다.`,
    ],
    domesticMediaPatterns,
    dataLineage: [
      { provider: 'DART', data: '기업 기본정보, 공시, 재무 상태', usage: '광고 투자 여력과 기업 규모 보정', status: 'configured' },
      { provider: 'KOSIS', data: '시장 규모, 인구/연령/지역 타깃 모수', usage: '목표 달성 가능 모수와 TAM/SAM 추정', status: 'configured' },
      { provider: 'KOBACO ADSTAT/MCR', data: '방송/온라인/옥외 광고비, 소비자행태, 매체 접점', usage: '업종별 광고비 intensity와 TV/OOH benchmark', status: 'benchmark' },
      { provider: 'Advertiser Spend Benchmark', data: '광고주별·업종별 실제 광고비 분포', usage: '경쟁 집행 수준과 예산 하한선 보정', status: 'applied' },
      { provider: 'Naver SearchAd API', data: '검색광고 노출, 클릭, 비용, 전환, 검색상단노출률', usage: '국내 검색 수요와 하단 퍼널 예산 하한 보정', status: 'optional' },
      { provider: 'Kakao Moment API', data: '캠페인/광고그룹/소재 리포트, 타깃/시간/게재위치 지표', usage: '카카오 접점의 도달, 메시지, 재방문 효율 보정', status: 'optional' },
      { provider: 'MMM Literature', data: 'Adstock, carryover, saturation, Bayesian prior, calibration', usage: '광고비-목표 반응 곡선과 예산 최적화 공식', status: 'applied' },
    ],
    engineSteps: [
      { name: 'Market Sizing Engine', input: 'KOSIS 시장 규모 + 타깃 인구', output: `시장 기준 예산 ${formatBudget(marketBaseBudget)}` },
      { name: 'Goal Parser', input: targetGoal, output: parsedGoal.label },
      { name: 'Goal-specific Model Selector', input: goalProfile.label, output: goalProfile.model },
      { name: 'Market Opportunity Engine', input: parsedGoal.type === 'revenue' ? `입력 매출 목표 ${formatBudget(parsedGoal.value)}` : `시장 ${formatBudget(marketRevenue)} x 목표 점유율 ${targetShare}%`, output: `목표 매출 기회 ${formatBudget(targetRevenueOpportunity)} / 점유율 확보 예산 ${formatBudget(marketShareBudget)}` },
      { name: 'Lifecycle Budget Curve', input: lifecycleProfile.label, output: lifecycleProfile.note },
      { name: 'Goal-sized Run-rate Floor', input: `현재 연간 ${formatBudget(currentAnnualRunRate)} x 단계 x 목표규모`, output: `목표별 유지/감액 기준 ${formatBudget(maintenanceBudget)}` },
      { name: 'Adstock Carryover Transform', input: 'Jin et al. 2017, LightweightMMM adstock/carryover', output: `지연효과 보정 예산 ${formatBudget(adstockAdjustedBudget)}` },
      { name: 'Hill Saturation Transform', input: 'Hill-Adstock / shape effect response curve', output: `포화효과 보정 예산 ${formatBudget(saturationAdjustedBudget)}` },
      { name: 'Korean Ad Market Trend Engine', input: '온라인/모바일 중심 이동 + TV 효율 압력 + DOOH/검색 성장', output: `국내 광고시장 트렌드 보정 ${koreanAdMarketTrend.budgetFactor.toFixed(2)}x` },
      { name: 'Domestic Media Pattern Engine', input: 'KOBACO ADSTAT + Naver SearchAd + Kakao Moment + TV/OOH benchmark', output: `국내 매체 패턴 보정 ${domesticPatternLift.toFixed(3)}x` },
      { name: 'Advertiser Benchmark Engine', input: '광고주별·업종별 광고비 분포', output: '경쟁 집행 분위와 예산 하한선 보정' },
      { name: 'Company Capacity Engine', input: 'DART 기업/재무 정보', output: '광고 투자 여력 보정 계수 1.00x' },
      { name: 'Competition Intensity Engine', input: `${competitionProfile.label} 경쟁 강도 + 경쟁사 ${competitors.length}개`, output: `경쟁 강도 보정 ${competitionIndex.toFixed(2)}x` },
      { name: 'Share-of-Voice Requirement', input: '경쟁 강도 x 현재 run-rate x 단계별 SOV premium', output: `SOV 확보 예산 ${formatBudget(sovBudget)}` },
      { name: 'Goal Response Engine', input: `${goalProfile.label} 목표 + 시장 모수 + Bayesian prior calibration`, output: `추천 광고비 ${formatBudget(recommendedBudget)}` },
      { name: 'Budget Optimizer', input: 'Monte Carlo / differential evolution budget allocation logic', output: `${formatBudget(safeBudget)}~${formatBudget(aggressiveBudget)} 의사결정 범위` },
      { name: 'Media Mix Allocator', input: `${goalProfile.label} 목표 + ${targetProfile.label} 타깃 + 국내 매체 패턴`, output: '목표/타깃별 YouTube/TV/Naver/Kakao/Meta/OOH 권장 배분' },
      {
        name: hasCurrentBudget ? 'Budget Gap Analyzer' : 'Zero-base Budget Sizer',
        input: hasCurrentBudget ? `현재 예산 ${formatBudget(currentBudget)}` : '현재 예산 미입력',
        output: hasCurrentBudget ? `추가 필요 ${formatBudget(incrementalBudget)}` : '신규 예산안으로 제시',
      },
    ],
  };
}

export function parseGoalValue(goal = '') {
  const text = String(goal).replace(/,/g, '').replace(/\s+/g, ' ').trim();
  const revenueMatch = text.match(/(?:매출|판매|Revenue|revenue)[^\d]*(\d+(?:\.\d+)?)\s*(조|천억|백억|억원|억|만원)?/)
    ?? text.match(/(\d+(?:\.\d+)?)\s*(조|천억|백억|억원|억|만원)?\s*(?:매출|판매|Revenue|revenue)/);
  if (revenueMatch) {
    const raw = Number(revenueMatch[1]);
    const unit = revenueMatch[2] === '억원' ? '억' : revenueMatch[2] ?? '억';
    const multiplier = unit === '조' ? 10000 : unit === '천억' ? 1000 : unit === '백억' ? 100 : unit === '만원' ? 0.0001 : 1;
    const value = round(raw * multiplier);
    return { type: 'revenue', value, label: `매출 목표 ${formatBudget(value)}` };
  }

  const customerMatch = text.match(/(?:고객|신규|회원|리드)[^\d]*(\d+(?:\.\d+)?)\s*(만|천)?/)
    ?? text.match(/(\d+(?:\.\d+)?)\s*(만|천)?\s*(?:명|명확보|고객|신규|회원|리드)/);
  if (customerMatch) {
    const raw = Number(customerMatch[1]);
    const multiplier = customerMatch[2] === '만' ? 10000 : customerMatch[2] === '천' ? 1000 : 1;
    const value = Math.round(raw * multiplier);
    return { type: 'customers', value, label: `고객 목표 ${value.toLocaleString('ko-KR')}명` };
  }

  const trafficMatch = text.match(/(?:방문|트래픽|클릭)[^\d]*(\d+(?:\.\d+)?)\s*(만|천)?/)
    ?? text.match(/(\d+(?:\.\d+)?)\s*(만|천)?\s*(?:방문|트래픽|클릭|회)/);
  if (trafficMatch) {
    const raw = Number(trafficMatch[1]);
    const multiplier = trafficMatch[2] === '만' ? 10000 : trafficMatch[2] === '천' ? 1000 : 1;
    const value = Math.round(raw * multiplier);
    return { type: 'traffic', value, label: `방문 목표 ${value.toLocaleString('ko-KR')}회` };
  }

  const liftMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
  if (liftMatch) {
    const value = Number(liftMatch[1]);
    return { type: 'lift', value, label: `증가 목표 ${value}%` };
  }

  return { type: 'default', value: null, label: '정량 목표 미검출, 업종 평균 목표 강도 적용' };
}

export function buildBusinessCase(options) {
  const {
    parsedGoal,
    goalProfile,
    recommendedBudget,
    targetRevenueOpportunity,
    grossMargin,
    averageOrderValue,
    customerLtv,
    conversionRate,
    requiredRoas,
  } = options;

  const revenue = round(targetRevenueOpportunity);
  const roas = recommendedBudget > 0 ? round(revenue / recommendedBudget) : 0;
  const contributionProfit = round(revenue * (grossMargin / 100));
  const profitAfterMedia = round(contributionProfit - recommendedBudget);
  const roasCapBudget = round(revenue / requiredRoas);

  if (parsedGoal.type === 'customers') {
    const cac = round((recommendedBudget * 100000000) / parsedGoal.value);
    const ltvWon = customerLtv * 10000;
    const ltvCac = round(ltvWon / cac);
    const judgement = ltvCac >= 1.4 ? '투자 적합' : ltvCac >= 1 ? '전략적 집행 가능' : 'CAC/LTV 재검토 필요';
    return {
      model: goalProfile.model,
      judgement,
      primaryMetric: `CAC ${formatKrw(cac)} / LTV:CAC ${ltvCac}x`,
      metrics: [
        `신규 고객 목표 ${parsedGoal.value.toLocaleString('ko-KR')}명`,
        `예상 CAC ${formatKrw(cac)}`,
        `가정 LTV ${formatKrw(ltvWon)} / LTV:CAC ${ltvCac}x`,
      ],
      recommendation: ltvCac < 1 ? '신규 고객 목표를 낮추거나 전환율/객단가 개선 전까지 예산을 보수적으로 집행해야 합니다.' : '고객 생애가치 기준에서 회수 가능성이 있어 퍼널별 CAC 관리를 전제로 집행할 수 있습니다.',
    };
  }

  if (parsedGoal.type === 'traffic') {
    const cpc = round((recommendedBudget * 100000000) / parsedGoal.value);
    const expectedConversions = Math.round(parsedGoal.value * (conversionRate / 100));
    const revenuePerConversion = expectedConversions > 0 ? round((revenue * 100000000) / expectedConversions) : 0;
    const judgement = roas >= requiredRoas ? '투자 적합' : roas >= requiredRoas * 0.75 ? '전략적 집행 가능' : '전환 효율 재검토 필요';
    return {
      model: goalProfile.model,
      judgement,
      primaryMetric: `CPC ${formatKrw(cpc)} / 목표 ROAS ${roas}x`,
      metrics: [
        `방문 목표 ${parsedGoal.value.toLocaleString('ko-KR')}회`,
        `예상 CPC ${formatKrw(cpc)}`,
        `CVR ${conversionRate}% 가정 시 전환 ${expectedConversions.toLocaleString('ko-KR')}건`,
        `전환당 필요 매출 ${formatKrw(revenuePerConversion)}`,
      ],
      recommendation: roas < requiredRoas ? `요구 ROAS ${requiredRoas}x 기준 예산 상한은 ${formatBudget(roasCapBudget)}입니다. 목표 달성 예산과 수익성 예산을 분리해 판단해야 합니다.` : '방문 목표와 매출 기여 가정이 요구 ROAS 범위 안에 있습니다.',
    };
  }

  if (parsedGoal.type === 'lift') {
    const trailingRevenue = round(revenue * 0.35);
    const trailingRoas = recommendedBudget > 0 ? round(trailingRevenue / recommendedBudget) : 0;
    const judgement = trailingRoas >= 1 ? '전략적 집행 가능' : '브랜드 KPI 중심 집행';
    return {
      model: goalProfile.model,
      judgement,
      primaryMetric: `후행 매출 ROAS ${trailingRoas}x / SOV 중심`,
      metrics: [
        `인지도 리프트 ${parsedGoal.value}% 목표`,
        `단기 직접 회수보다 검색량, 브랜드 리프트, 후행 매출을 KPI로 설정`,
        `후행 매출 기여 가정 ${formatBudget(trailingRevenue)}`,
      ],
      recommendation: '인지도 목표는 단기 ROAS만으로 판단하면 과소평가됩니다. 단, 브랜드 리프트/검색량/후행 매출 측정 설계를 함께 둬야 합니다.',
    };
  }

  const judgement = profitAfterMedia >= 0 && roas >= requiredRoas ? '투자 적합'
    : roas >= requiredRoas * 0.75 ? '전략적 집행 가능'
      : '수익성 재검토 필요';

  return {
    model: goalProfile.model,
    judgement,
    primaryMetric: `ROAS ${roas}x / 공헌이익 ${formatBudget(contributionProfit)}`,
    metrics: [
      `목표 매출 ${formatBudget(revenue)}`,
      `추천 예산 ${formatBudget(recommendedBudget)}`,
      `매출 ROAS ${roas}x`,
      `마진율 ${grossMargin}% 기준 공헌이익 ${formatBudget(contributionProfit)}`,
      `광고비 차감 후 ${formatBudget(profitAfterMedia)}`,
    ],
    recommendation: roas < requiredRoas
      ? `요구 ROAS ${requiredRoas}x 기준 예산 상한은 ${formatBudget(roasCapBudget)}입니다. 목표 100% 달성과 수익성 기준 사이의 조정이 필요합니다.`
      : '요구 ROAS와 공헌이익 기준에서 집행 타당성이 있습니다.',
  };
}

function getGoalScaleFactor(parsedGoal) {
  if (parsedGoal.type === 'revenue') return round(Math.max(0.22, Math.min(1.45, parsedGoal.value / 500)));
  if (parsedGoal.type === 'customers') return round(Math.max(0.45, Math.min(1.35, parsedGoal.value / 10000)));
  if (parsedGoal.type === 'traffic') return round(Math.max(0.35, Math.min(1.25, parsedGoal.value / 50000)));
  if (parsedGoal.type === 'lift') return round(Math.max(0.55, Math.min(1.3, parsedGoal.value / 30)));
  return 1;
}

function getRevenueOpportunity(parsedGoal, shareRevenueOpportunity) {
  if (parsedGoal.type === 'revenue') return parsedGoal.value;
  if (parsedGoal.type === 'customers') return round(Math.max(8, Math.min(shareRevenueOpportunity, parsedGoal.value * 0.018)));
  if (parsedGoal.type === 'traffic') return round(Math.max(3, Math.min(shareRevenueOpportunity, parsedGoal.value * 0.0012)));
  if (parsedGoal.type === 'lift') return round(Math.max(20, Math.min(shareRevenueOpportunity, shareRevenueOpportunity * (parsedGoal.value / 100))));
  return shareRevenueOpportunity;
}

function getCompetitorNote(mode, competitors, factor) {
  if (mode === 'none') return '경쟁사 없음으로 선택되어 경쟁사명 보정 없이 시장 평균 광고 intensity만 적용했습니다.';
  if (mode === 'unknown') return '경쟁사를 모름으로 선택해 DART/KOSIS/업종 벤치마크 기반 평균 경쟁 강도를 적용했습니다.';
  if (competitors.length) return `입력된 주요 경쟁사 ${competitors.length}개를 기준으로 경쟁 보정 ${factor.toFixed(3)}x를 추가했습니다.`;
  return '직접 입력 모드지만 경쟁사명이 없어 업종 평균 경쟁 강도만 적용했습니다.';
}

export function inferGoalProfile(goal = '') {
  const value = String(goal);
  if (/매출|구매|ROAS|전환|판매/.test(value)) return goalProfiles.revenue;
  if (/방문|트래픽|검색|클릭|웹사이트/.test(value)) return goalProfiles.traffic;
  if (/인지|브랜드|도달|Reach|리치/.test(value)) return goalProfiles.awareness;
  return goalProfiles.acquisition;
}

export function getGoalAchievementForBudget(budget) {
  const value = Number(budget);
  if (value <= 16.4) return round(58 + (value - 10) * 6.6);
  if (value <= 20) return round(100.2 + (value - 16.4) * 3.1);
  return round(Math.min(118.5, 111.4 + (value - 20) * 1.4));
}

export function getMarginalGoalAchievement(budget) {
  const current = getGoalAchievementForBudget(budget);
  const next = getGoalAchievementForBudget(Number(budget) + 1);
  return round(next - current);
}

export function getReachForBudget(budget) {
  const value = Number(budget);
  if (value <= 18) return round(43 + (value - 10) * 4.25);
  if (value <= 20) return round(77 + (value - 18) * 2.1);
  return round(Math.min(84.8, 81.2 + (value - 20) * 0.7));
}

export function getMarginalReach(budget) {
  const current = getReachForBudget(budget);
  const next = getReachForBudget(Number(budget) + 1);
  return round(next - current);
}

export function getBudgetBand(budget) {
  const value = Number(budget);
  if (value < 17.2) return budgetPlans[0];
  if (value <= 20.1) return budgetPlans[1];
  return budgetPlans[2];
}

export function getScenarioMix(budget, goalProfile = goalProfiles.acquisition, targetProfile = targetProfiles.mass, lifecycleStage = 'launch') {
  const trendMix = koreanAdMarketTrend.lifecycleMix[lifecycleStage] ?? koreanAdMarketTrend.lifecycleMix.launch;
  const adjusted = mediaMix.map((item) => ({
    ...item,
    percent: Math.max(4, item.percent + (goalProfile.mix[item.channel] ?? 0) + (targetProfile.mix[item.channel] ?? 0) + (trendMix[item.channel] ?? 0)),
  }));
  const total = adjusted.reduce((sum, item) => sum + item.percent, 0);
  return adjusted.map((item) => ({
    ...item,
    percent: Math.round((item.percent / total) * 100),
  })).map((item, index, list) => {
    if (index === list.length - 1) {
      const used = list.slice(0, -1).reduce((sum, other) => sum + other.percent, 0);
      return { ...item, percent: 100 - used, scaledAmount: round((Number(budget) * (100 - used)) / 100) };
    }
    return { ...item, scaledAmount: round((Number(budget) * item.percent) / 100) };
  });
}

export function getScaledMix(budget, scenario) {
  if (scenario?.mediaMix) {
    const totalBudget = Number(budget);
    const recommended = Number(scenario.recommendedBudget || totalBudget || 1);
    const budgetRatio = totalBudget / Math.max(1, recommended);
    const budgetMixShift = {
      YouTube: budgetRatio < 0.85 ? -3 : budgetRatio > 1.12 ? 4 : 0,
      TV: budgetRatio < 0.85 ? -6 : budgetRatio > 1.12 ? 6 : 0,
      Naver: budgetRatio < 0.85 ? 6 : budgetRatio > 1.12 ? -4 : 0,
      Kakao: budgetRatio < 0.85 ? 3 : budgetRatio > 1.12 ? -1 : 0,
      Meta: budgetRatio < 0.85 ? 2 : budgetRatio > 1.12 ? -2 : 0,
      OOH: budgetRatio < 0.85 ? -2 : budgetRatio > 1.12 ? 3 : 0,
    };
    const adjusted = scenario.mediaMix.map((item) => ({
      ...item,
      percent: Math.max(3, item.percent + (budgetMixShift[item.channel] ?? 0)),
    }));
    const totalPercent = adjusted.reduce((sum, item) => sum + item.percent, 0);
    return adjusted.map((item) => ({
      ...item,
      percent: Math.round((item.percent / totalPercent) * 100),
    })).map((item, index, list) => {
      const percent = index === list.length - 1
        ? 100 - list.slice(0, -1).reduce((sum, other) => sum + other.percent, 0)
        : item.percent;
      return {
        ...item,
        percent,
        scaledAmount: round((totalBudget * percent) / 100),
      };
    }).map((item, index, list) => {
      if (index !== list.length - 1) return item;
      const used = list.slice(0, -1).reduce((sum, other) => sum + other.scaledAmount, 0);
      return { ...item, scaledAmount: round(totalBudget - used) };
    });
  }
  return getScenarioMix(budget);
}

export function formatBudget(value) {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toFixed(1).replace('.0', '')}억원`;
}

export function formatKrw(value) {
  if (!Number.isFinite(Number(value))) return '-';
  const numeric = Number(value);
  if (numeric >= 100000000) return `${round(numeric / 100000000)}억원`;
  if (numeric >= 10000) return `${round(numeric / 10000)}만원`;
  return `${Math.round(numeric).toLocaleString('ko-KR')}원`;
}

function round(value) {
  return Math.round(value * 10) / 10;
}
