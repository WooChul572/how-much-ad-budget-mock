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
  const marketSize = options.marketSize ?? 58000;
  const targetPopulation = options.targetPopulation ?? 2184;
  const categoryAdIntensity = options.categoryAdIntensity ?? 0.000265;
  const competitionIndex = options.competitionIndex ?? 1.12;
  const goalDifficulty = options.goalDifficulty ?? 0.92;
  const mixComplexity = options.mixComplexity ?? 1.04;
  const adstockRetention = options.adstockRetention ?? 0.55;
  const saturationSlope = options.saturationSlope ?? 1.7;
  const priorWeight = options.priorWeight ?? 0.42;
  const domesticPatternLift = options.domesticPatternLift ?? 1.035;

  const marketBaseBudget = round(marketSize * categoryAdIntensity);
  const targetScaleFactor = round(Math.max(0.82, Math.min(1.18, targetPopulation / 2200)));
  const adstockAdjustedBudget = round(marketBaseBudget / (1 - adstockRetention * 0.18));
  const saturationAdjustedBudget = round(adstockAdjustedBudget * (1 + (saturationSlope - 1) * 0.08));
  const domesticAdjustedBudget = round(saturationAdjustedBudget * domesticPatternLift);
  const modeledBudget = round(domesticAdjustedBudget * competitionIndex * goalDifficulty * mixComplexity * targetScaleFactor);
  const recommendedBudget = round((modeledBudget * (1 - priorWeight)) + (16.4 * priorWeight));
  const safeBudget = round(recommendedBudget * 0.93);
  const aggressiveBudget = round(recommendedBudget * 1.085);
  const incrementalBudget = hasCurrentBudget ? round(Math.max(0, recommendedBudget - currentBudget)) : null;

  return {
    mode: hasCurrentBudget ? 'gap-analysis' : 'zero-base-sizing',
    decision: hasCurrentBudget ? (incrementalBudget > 0 ? 'increase-budget' : 'hold-or-reallocate') : 'new-budget',
    targetGoal,
    currentBudget,
    recommendedBudget,
    range: [safeBudget, aggressiveBudget],
    incrementalBudget,
    confidence: 83,
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
      { name: 'Adstock Carryover Transform', input: 'Jin et al. 2017, LightweightMMM adstock/carryover', output: `지연효과 보정 예산 ${formatBudget(adstockAdjustedBudget)}` },
      { name: 'Hill Saturation Transform', input: 'Hill-Adstock / shape effect response curve', output: `포화효과 보정 예산 ${formatBudget(saturationAdjustedBudget)}` },
      { name: 'Domestic Media Pattern Engine', input: 'KOBACO ADSTAT + Naver SearchAd + Kakao Moment + TV/OOH benchmark', output: `국내 매체 패턴 보정 ${domesticPatternLift.toFixed(3)}x` },
      { name: 'Advertiser Benchmark Engine', input: '광고주별·업종별 광고비 분포', output: '경쟁 집행 분위와 예산 하한선 보정' },
      { name: 'Company Capacity Engine', input: 'DART 기업/재무 정보', output: '광고 투자 여력 보정 계수 1.00x' },
      { name: 'Investment Benchmark Engine', input: 'KOBACO/플랫폼 업종 광고비 intensity', output: `경쟁 강도 보정 ${competitionIndex.toFixed(2)}x` },
      { name: 'Goal Response Engine', input: '목표 타입 + 시장 모수 + Bayesian prior calibration', output: `추천 광고비 ${formatBudget(recommendedBudget)}` },
      { name: 'Budget Optimizer', input: 'Monte Carlo / differential evolution budget allocation logic', output: `${formatBudget(safeBudget)}~${formatBudget(aggressiveBudget)} 의사결정 범위` },
      { name: 'Media Mix Allocator', input: '국내 매체 패턴 + 채널별 benchmark + 목표 유형', output: 'YouTube/TV/Naver/Kakao/Meta/OOH 권장 배분' },
      {
        name: hasCurrentBudget ? 'Budget Gap Analyzer' : 'Zero-base Budget Sizer',
        input: hasCurrentBudget ? `현재 예산 ${formatBudget(currentBudget)}` : '현재 예산 미입력',
        output: hasCurrentBudget ? `추가 필요 ${formatBudget(incrementalBudget)}` : '신규 예산안으로 제시',
      },
    ],
  };
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

export function getScaledMix(budget) {
  return mediaMix.map((item) => ({
    ...item,
    scaledAmount: round((Number(budget) * item.percent) / 100),
  }));
}

export function formatBudget(value) {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toFixed(1).replace('.0', '')}억원`;
}

function round(value) {
  return Math.round(value * 10) / 10;
}
