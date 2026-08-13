import {
  buildPlanningScenario,
  budgetPlans,
  domesticMediaPatterns,
  getBudgetBand,
  getGoalAchievementForBudget,
  getMarginalGoalAchievement,
  getMarginalReach,
  getReachForBudget,
  getScaledMix,
  mediaMix,
} from './howmuch-data.mjs';

const state = {
  step: 0,
  budget: 18.5,
  company: '',
  brand: '',
  goal: '2026 H2 신규 고객 확대',
  market: '',
  targetSegment: '',
  currentBudget: 0,
  hasCurrentBudget: false,
  competitionLevel: 'unknown',
  targetType: 'mass',
  lifecycleStage: 'launch',
  marketRevenue: 5000,
  targetShare: 10,
  monthlyTvBudget: 0,
  monthlyDigitalBudget: 0,
  grossMargin: 52,
  requiredRoas: 1.8,
  customerLtv: 42,
  conversionRate: 2.6,
  competitorMode: 'unknown',
  competitors: [],
};

const steps = Array.from(document.querySelectorAll('.screen'));
const progressSteps = Array.from(document.querySelectorAll('.step-dot'));
const slider = document.querySelector('#budgetSlider');
let whatIfTouched = false;
let apiScenario = null;
let aiEnrichment = null;
let enrichmentLoading = false;
let competitorEdited = false;

function formatWon(value) {
  return `${Number(value).toFixed(1).replace('.0', '')}억`;
}

function getCurrentScenario() {
  if (apiScenario) return apiScenario;
  return buildPlanningScenario({
    currentBudget: state.currentBudget,
    hasCurrentBudget: state.hasCurrentBudget,
    targetGoal: state.goal,
    company: state.company,
    brand: state.brand,
    market: state.market,
    targetSegment: state.targetSegment,
    competitionLevel: state.competitionLevel,
    competitionIndex: String(state.competitionIndex || ''),
    targetType: state.targetType,
    lifecycleStage: state.lifecycleStage,
    marketRevenue: state.marketRevenue,
    targetShare: state.targetShare,
    monthlyTvBudget: state.monthlyTvBudget,
    monthlyDigitalBudget: state.monthlyDigitalBudget,
    grossMargin: state.grossMargin,
    requiredRoas: state.requiredRoas,
    customerLtv: state.customerLtv,
    conversionRate: state.conversionRate,
    competitorMode: state.competitorMode,
    competitors: state.competitors,
  });
}

function showStep(index) {
  state.step = Math.max(0, Math.min(index, steps.length - 1));
  steps.forEach((step, stepIndex) => {
    step.classList.toggle('active', stepIndex === state.step);
  });
  progressSteps.forEach((step, stepIndex) => {
    step.classList.toggle('active', stepIndex <= state.step);
  });
  if (state.step === 3) {
    setTimeout(() => showStep(4), 1250);
  }
  syncVisibleInputsFromState();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function inferTargetType(value) {
  const text = String(value || '');
  if (/검색|수요|브랜드명|구매의도|고관여/.test(text)) return 'search';
  if (/전환|구매|커머스|고객|매출|ROAS|재구매/.test(text)) return 'conversion';
  if (/지역|매장|오프라인|옥외|OOH/.test(text)) return 'local';
  return 'mass';
}

function syncCurrentAnnualBudget(value) {
  const annualBudget = Number(value || 0);
  state.currentBudget = annualBudget;
  state.hasCurrentBudget = annualBudget > 0;
  state.monthlyTvBudget = 0;
  state.monthlyDigitalBudget = annualBudget > 0 ? annualBudget / 12 : 0;
}

function parseGoalHints(goal) {
  const text = String(goal || '').trim();
  const brandMatch = text.match(/^([가-힣A-Za-z0-9·&\-\s]{2,20}?)(?:\s+\d|\s+매출|\s+신규|\s+인지|\s+방문|\s+검색)/);
  const revenueMatch = text.match(/(\d+(?:\.\d+)?)\s*억(?:원)?\s*(?:매출|상승|증대|달성)?/);
  return {
    brand: brandMatch ? brandMatch[1].trim() : '',
    targetShare: revenueMatch ? Math.max(1, Math.min(50, Math.round(Number(revenueMatch[1]) / 10))) : null,
  };
}

function applyGoalHintsToMarketForm() {
  const hints = parseGoalHints(state.goal);
  if (hints.brand && !state.brand) {
    state.brand = hints.brand;
    setInput('#brandInput', hints.brand);
  }
  if (hints.targetShare && !document.querySelector('#targetShareInput')?.value) {
    state.targetShare = hints.targetShare;
    setInput('#targetShareInput', String(hints.targetShare));
  }
}

function syncWhatIfToRecommendation(scenario = getCurrentScenario()) {
  if (whatIfTouched) return scenario;
  state.budget = scenario.recommendedBudget;
  if (slider) slider.value = String(state.budget);
  return scenario;
}

function updateSliderBounds(scenario) {
  if (!slider) return;
  const min = Math.max(1, Math.floor(scenario.range[0] * 0.6));
  const max = Math.max(25, Math.ceil(scenario.range[1] * 1.15));
  slider.min = String(min);
  slider.max = String(max);
}

function markScenarioInputChanged() {
  whatIfTouched = false;
  apiScenario = null;
}

function markManualScenarioInputChanged() {
  markScenarioInputChanged();
  aiEnrichment = null;
}

function resetAiSuggestedFields() {
  [
    '#goalCompanyInput',
    '#goalBrandInput',
    '#companyInput',
    '#brandInput',
    '#marketInput',
    '#targetSegmentInput',
    '#marketSizeInput',
    '#targetShareInput',
  ].forEach((selector) => {
    const node = document.querySelector(selector);
    if (node?.dataset.aiSuggested === 'true' && node.dataset.userEdited !== 'true') {
      node.value = '';
      node.dataset.aiSuggested = '';
    }
  });
  document.querySelectorAll('.competitor-input').forEach((node) => {
    if (node.dataset.aiSuggested === 'true' && node.dataset.userEdited !== 'true') {
      node.value = '';
      node.dataset.aiSuggested = '';
    }
  });
  state.company = document.querySelector('#goalCompanyInput')?.dataset.userEdited === 'true' ? state.company : '';
  state.brand = document.querySelector('#goalBrandInput')?.dataset.userEdited === 'true' ? state.brand : '';
  state.market = '';
  state.targetSegment = '';
  state.competitors = [];
  state.competitorMode = 'unknown';
  competitorEdited = false;
}

function goHome() {
  syncFormInputsToState({ preferLandingGoal: state.step === 0 });
  syncVisibleInputsFromState();
  showStep(0);
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

function syncLandingGoalToForm() {
  const landingGoal = document.querySelector('#landingGoal');
  const value = landingGoal?.value?.trim();
  if (value) {
    state.goal = value;
    setInput('#goalInput', value);
  }
  syncGoalIdentityToMarketForm();
}

function syncGoalIdentityToMarketForm() {
  const company = readValue('#goalCompanyInput');
  const brand = readValue('#goalBrandInput');
  if (company) {
    state.company = company;
    setInput('#companyInput', company);
  }
  if (brand) {
    state.brand = brand;
    setInput('#brandInput', brand);
  }
}

function syncVisibleInputsFromState() {
  setInput('#landingGoal', state.goal);
  setInput('#goalInput', state.goal);
  setInput('#goalCompanyInput', state.company);
  setInput('#goalBrandInput', state.brand);
  setInput('#companyInput', state.company);
  setInput('#brandInput', state.brand);
}

function readValue(selector) {
  return document.querySelector(selector)?.value?.trim() || '';
}

function readNumber(selector, fallback = 0) {
  const value = readValue(selector);
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function syncFormInputsToState({ preferLandingGoal = false } = {}) {
  const landingGoal = readValue('#landingGoal');
  const goalInput = readValue('#goalInput');
  const goalCompany = readValue('#goalCompanyInput');
  const goalBrand = readValue('#goalBrandInput');
  const marketCompany = readValue('#companyInput');
  const marketBrand = readValue('#brandInput');
  if (preferLandingGoal && landingGoal) {
    state.goal = landingGoal;
    setInput('#goalInput', landingGoal);
  } else if (goalInput) {
    state.goal = goalInput;
  } else if (landingGoal) {
    state.goal = landingGoal;
  }

  state.company = state.step <= 1 ? goalCompany || marketCompany : marketCompany || goalCompany;
  state.brand = state.step <= 1 ? goalBrand || marketBrand : marketBrand || goalBrand;
  state.market = readValue('#marketInput');
  state.targetSegment = readValue('#targetSegmentInput');
  state.targetType = inferTargetType(`${state.market} ${state.targetSegment}`);
  state.competitionLevel = readValue('#competitionLevelInput') || state.competitionLevel;
  state.lifecycleStage = readValue('#lifecycleStageInput') || state.lifecycleStage;
  state.marketRevenue = readNumber('#marketSizeInput', state.marketRevenue || 0);
  state.targetShare = readNumber('#targetShareInput', state.targetShare || 0);
  syncCurrentAnnualBudget(readValue('#currentBudgetInput'));
  state.monthlyTvBudget = readNumber('#monthlyTvInput', 0);
  state.monthlyDigitalBudget = readNumber('#monthlyDigitalInput', 0);
  state.grossMargin = readNumber('#grossMarginInput', state.grossMargin || 52);
  state.requiredRoas = readNumber('#requiredRoasInput', state.requiredRoas || 1.8);
  state.customerLtv = readNumber('#customerLtvInput', state.customerLtv || 42);
  state.conversionRate = readNumber('#conversionRateInput', state.conversionRate || 2.6);
  state.competitors = Array.from(document.querySelectorAll('.competitor-input')).map((node) => node.value.trim()).filter(Boolean).slice(0, 5);
  state.competitorMode = state.competitors.length ? 'known' : 'unknown';
}

function setSelectValue(selector, value) {
  const node = document.querySelector(selector);
  if (node && value) node.value = value;
}

function fillIfEmpty(selector, value) {
  const node = document.querySelector(selector);
  if (!node || node.value.trim() || value === undefined || value === null || value === '') return false;
  node.value = String(value);
  return true;
}

function setAiSuggestedInput(selector, value) {
  const node = document.querySelector(selector);
  if (!node || value === undefined || value === null || value === '') return false;
  if (node.dataset.userEdited === 'true') return false;
  node.value = String(value).trim();
  node.dataset.aiSuggested = 'true';
  return true;
}

function applyEnrichmentField(stateKey, selectors, value) {
  if (value === undefined || value === null || value === '') return false;
  const cleanValue = String(value).trim();
  if (!cleanValue) return false;
  let applied = false;
  selectors.forEach((selector) => {
    applied = setAiSuggestedInput(selector, cleanValue) || applied;
  });
  if (!state[stateKey] || applied) {
    state[stateKey] = cleanValue;
    applied = true;
  }
  return applied;
}

function applyEnrichmentToForm(enrichment) {
  if (!enrichment) return;
  applyEnrichmentField('company', ['#goalCompanyInput', '#companyInput'], enrichment.company);
  applyEnrichmentField('brand', ['#goalBrandInput', '#brandInput'], enrichment.brand);
  if (enrichment.sourceMode === 'gemini-required') {
    syncVisibleInputsFromState();
    syncFormInputsToState();
    renderAll();
    return;
  }
  applyEnrichmentField('market', ['#marketInput'], enrichment.market);
  applyEnrichmentField('targetSegment', ['#targetSegmentInput'], enrichment.targetSegment);
  applyEnrichmentField('marketRevenue', ['#marketSizeInput'], enrichment.marketRevenue);
  applyEnrichmentField('targetShare', ['#targetShareInput'], enrichment.targetShare);
  if (document.querySelector('#competitionLevelInput')?.value === 'unknown') {
    setSelectValue('#competitionLevelInput', enrichment.competitionLevel);
  }
  setSelectValue('#lifecycleStageInput', enrichment.lifecycleStage);

  const competitorInputs = Array.from(document.querySelectorAll('.competitor-input'));
  if (enrichment.competitors?.length && competitorInputs.some((input) => input.dataset.userEdited !== 'true')) {
    state.competitorMode = 'known';
    competitorInputs.forEach((input, index) => {
      if (input.dataset.userEdited === 'true') return;
      input.disabled = false;
      input.value = enrichment.competitors[index] || '';
      input.dataset.aiSuggested = input.value ? 'true' : '';
    });
    state.competitors = competitorInputs.map((input) => input.value.trim()).filter(Boolean).slice(0, 5);
  }
  syncFormInputsToState();
  renderAll();
}

function renderEnrichmentStatus(enrichment = aiEnrichment) {
  const target = document.querySelector('#aiEnrichmentStatus');
  if (!target) return;
  if (enrichmentLoading) {
    target.innerHTML = '<b>AI 시장 보강 중</b><span>목표 문장에서 광고주, 브랜드, 시장, 경쟁사를 추정하고 있습니다.</span>';
    return;
  }
  if (!enrichment) {
    target.innerHTML = '<b>AI 자동 보강</b><span>목표에 광고주명과 브랜드명이 있으면 Step 2에서 빈 칸을 자동으로 채웁니다.</span>';
    return;
  }
  const mode = enrichment.sourceMode === 'gemini-enriched' ? 'Gemini 분석' : 'Gemini 연결 필요';
  const competitors = enrichment.competitors?.length ? enrichment.competitors.join(', ') : '경쟁사 모름';
  target.innerHTML = `
    <b>${mode}${enrichment.sourceMode === 'gemini-enriched' ? ` · 신뢰도 ${enrichment.confidence ?? 60}%` : ''}</b>
    <span>${enrichment.company || '회사 미확정'} / ${enrichment.brand || '브랜드 미확정'} · ${enrichment.market || '시장 미확정'} · ${enrichment.targetSegment || '타겟 미확정'}</span>
    <span>경쟁사: ${competitors}</span>
    <span>${enrichment.rationale || 'AI/벤치마크 기반으로 빈 입력값을 보강했습니다.'}</span>
  `;
}

async function loadAiEnrichment() {
  syncFormInputsToState({ preferLandingGoal: state.step === 0 });
  syncGoalIdentityToMarketForm();
  if (!state.goal && !state.company && !state.brand) return null;
  enrichmentLoading = true;
  renderEnrichmentStatus();
  try {
    const params = new URLSearchParams({
      brand: state.brand,
      goal: state.goal,
      goal: state.goal,
      company: state.company,
      brand: state.brand,
      market: state.market,
      targetSegment: state.targetSegment,
      competitionLevel: state.competitionLevel,
      lifecycleStage: state.lifecycleStage,
      marketRevenue: String(state.marketRevenue || 0),
      targetShare: String(state.targetShare || 0),
      competitors: state.competitors.join(','),
    });
    const response = await fetch(`/api/ai-market-enrichment?${params}`);
    if (!response.ok) throw new Error(`ai enrichment ${response.status}`);
    aiEnrichment = await response.json();
    applyEnrichmentToForm(aiEnrichment);
  } catch {
    aiEnrichment = null;
  } finally {
    enrichmentLoading = false;
    renderEnrichmentStatus();
  }
  return aiEnrichment;
}

async function prepareScenarioResult() {
  syncFormInputsToState({ preferLandingGoal: state.step === 0 });
  applyGoalHintsToMarketForm();
  syncFormInputsToState();
  await loadPlanningScenarioFromApi();
}

function drawGoalCurve() {
  const svg = document.querySelector('#goalCurve');
  if (!svg) return;
  const scenario = getCurrentScenario();
  const width = 720;
  const height = 300;
  const minBudget = Math.max(1, Math.floor((scenario.range?.[0] ?? 10) * 0.72));
  const maxBudget = Math.max(minBudget + 8, Math.ceil((scenario.range?.[1] ?? 25) * 1.18));
  const optimalBudget = scenario.recommendedBudget || state.budget || 16.4;
  const selectedBudget = Math.max(minBudget, Math.min(maxBudget, state.budget || optimalBudget));
  const lowerRange = scenario.range?.[0] ?? optimalBudget * 0.72;
  const upperRange = scenario.range?.[1] ?? optimalBudget * 1.18;
  const goalValue = (budget) => {
    const value = Number(budget);
    if (value <= optimalBudget) {
      return 55 + ((value - minBudget) / Math.max(1, optimalBudget - minBudget)) * 45;
    }
    return Math.min(122, 100 + 19 * (1 - Math.exp(-0.38 * (value - optimalBudget))));
  };
  const xForBudget = (budget) => ((budget - minBudget) / Math.max(1, maxBudget - minBudget)) * (width - 88) + 44;
  const yForGoal = (goal) => height - 46 - ((goal - 50) / 75) * (height - 82);
  const points = [];
  const step = Math.max(0.25, (maxBudget - minBudget) / 36);
  for (let budget = minBudget; budget <= maxBudget + 0.001; budget += step) {
    points.push([xForBudget(budget), yForGoal(goalValue(budget))]);
  }
  const path = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${path} L ${width - 44} ${height - 46} L 44 ${height - 46} Z`;
  const selectedX = xForBudget(selectedBudget);
  const selectedY = yForGoal(goalValue(selectedBudget));

  svg.innerHTML = `
    <defs>
      <linearGradient id="curveFill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#2f6bff" stop-opacity=".18"/>
        <stop offset="100%" stop-color="#2f6bff" stop-opacity=".02"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="${height}" rx="18" fill="#fbfcff"/>
    ${[70, 85, 100, 115].map((label) => {
      const y = height - 46 - ((label - 50) / 75) * (height - 82);
      return `<line x1="44" y1="${y}" x2="${width - 44}" y2="${y}" stroke="#e5e9f2"/><text x="16" y="${y + 4}" font-size="11" fill="#667085">${label}%</text>`;
    }).join('')}
    <line x1="44" y1="${height - 46 - ((100 - 50) / 75) * (height - 82)}" x2="${width - 44}" y2="${height - 46 - ((100 - 50) / 75) * (height - 82)}" stroke="#1e63ff" stroke-width="1.5" stroke-dasharray="6 6"/>
    <rect x="${((scenario.range[0] - 10) / 15) * (width - 88) + 44}" y="34" width="${((scenario.range[1] - scenario.range[0]) / 15) * (width - 88)}" height="${height - 80}" fill="#f2f6ff"/>
    <rect x="${((20 - 10) / 15) * (width - 88) + 44}" y="34" width="${((25 - 20) / 15) * (width - 88)}" height="${height - 80}" fill="#f7f8fb"/>
    <text x="${((scenario.range[0] - 10) / 15) * (width - 88) + 54}" y="58" font-size="12" fill="#2557d6">목표 달성 권장 범위</text>
    <text x="${((20 - 10) / 15) * (width - 88) + 54}" y="78" font-size="12" fill="#475467">추가 효율 둔화</text>
    <path d="${area}" fill="url(#curveFill)"/>
    <path d="${path}" fill="none" stroke="#1e63ff" stroke-width="4" stroke-linecap="round"/>
    <line x1="${selectedX}" y1="34" x2="${selectedX}" y2="${height - 46}" stroke="#111827" stroke-width="1.5" stroke-dasharray="5 6"/>
    <circle cx="${selectedX}" cy="${selectedY}" r="7" fill="#111827" stroke="#fff" stroke-width="4"/>
    <text x="44" y="${height - 18}" font-size="12" fill="#667085">10억</text>
    <text x="${width - 82}" y="${height - 18}" font-size="12" fill="#667085">25억</text>
  `;
}

function renderMix(scenario = getCurrentScenario()) {
  const list = document.querySelector('#mixList');
  const mixBudget = state.budget || scenario.recommendedBudget;
  if (list) {
    list.innerHTML = getScaledMix(mixBudget, scenario).map((item) => `
      <div class="mix-row">
        <div class="mix-channel">
          <span class="swatch" style="background:${item.color}"></span>
          <strong>${item.channel}</strong>
        </div>
        <div class="mix-track" aria-label="${item.channel} 추천 비중">
          <span style="width:${item.percent}%"></span>
        </div>
        <div class="mix-value">${item.percent}% <b>${formatWon(item.scaledAmount)}</b></div>
      </div>
    `).join('');
  }

  const comparison = document.querySelector('#mixCompare');
  if (comparison) {
    comparison.innerHTML = scenario.mediaMix.map((item) => `
      <div class="compare-row">
        <span>${item.channel}</span>
        <div class="compare-bars">
          <i style="width:${item.current}%"></i>
          <b style="width:${item.percent}%"></b>
        </div>
        <small>${item.current}% → ${item.percent}%</small>
      </div>
    `).join('');
  }
}

function renderPlans(scenario = getCurrentScenario()) {
  const container = document.querySelector('#plans');
  if (!container) return;
  const dynamicPlans = budgetPlans.map((plan) => {
    if (plan.key === 'safe') return { ...plan, budget: scenario.range[0] };
    if (plan.key === 'optimal') return { ...plan, budget: scenario.recommendedBudget };
    return { ...plan, budget: scenario.range[1] };
  });
  container.innerHTML = dynamicPlans.map((plan) => `
    <button class="plan-card ${Math.abs(plan.budget - state.budget) < 0.2 ? 'selected' : ''}" data-budget="${plan.budget}">
      <span>${plan.label}</span>
      <strong>${formatWon(plan.budget)}</strong>
      <em>${plan.tone}</em>
      <small>${plan.description}</small>
    </button>
  `).join('');
}

function renderMetrics(scenario = getCurrentScenario()) {
  setText('#recommendedBudget', formatWon(scenario.recommendedBudget));
  setText('#budgetRange', `${formatWon(scenario.range[0])}~${formatWon(scenario.range[1])}`);
  if (state.hasCurrentBudget) {
    setText('#budgetGapTitle', '추가 필요 예산');
    setText('#budgetGap', `+${formatWon(scenario.incrementalBudget)}`);
    setText('#currentBudgetLabel', `${formatWon(scenario.currentBudget)} 대비`);
  } else {
    setText('#budgetGapTitle', '신규 편성 기준');
    setText('#budgetGap', '0억 신규');
    setText('#currentBudgetLabel', '현재 예산 미입력');
  }
  setText('#whatIfBudget', formatWon(state.budget));
  setText('#whatIfReach', `${getReachForBudget(state.budget)}%`);
  setText('#whatIfMarginal', `+1억당 +${getMarginalReach(state.budget)}%p`);
  setText('#whatIfGoal', `${getGoalAchievementForBudget(state.budget)}%`);
  setText('#whatIfGoalMarginal', `+1억당 +${getMarginalGoalAchievement(state.budget)}%p`);
  const band = getBudgetBand(state.budget);
  const bandNode = document.querySelector('#whatIfBand');
  if (bandNode) {
    bandNode.textContent = band.label;
    bandNode.className = `band-label ${band.key}`;
  }
  renderEnginePanel(scenario);
}

function renderScenarioSummary(scenario = getCurrentScenario()) {
  const target = document.querySelector('#scenarioSummary');
  if (!target) return;

  const competitionLabels = {
    unknown: '경쟁강도 모름',
    low: '경쟁 낮음',
    medium: '경쟁 보통',
    high: '경쟁 높음',
    'very-high': '경쟁 매우 높음',
  };
  const stageLabels = {
    launch: '런칭 초기',
    growth: '성장기',
    mature: '안정기',
    renewal: '재런칭',
  };
  const sourceText = scenario.sourceMode === 'api-engine'
    ? 'API 엔진으로 재계산됨'
    : '내장 예측 모델로 계산됨';
  const companyBrand = [state.company, state.brand].filter(Boolean).join(' / ') || '미입력';
  const marketTarget = [state.market, state.targetSegment].filter(Boolean).join(' / ') || '미입력';
  const currentBudgetText = state.hasCurrentBudget ? `${formatWon(state.currentBudget)} 연간 집행` : '현재 예산 미입력';
  const competitorText = state.competitorMode === 'known' && state.competitors.length
    ? state.competitors.join(', ')
    : state.competitorMode === 'none'
      ? '경쟁사 없음'
      : '경쟁사 모름';
  const band = getBudgetBand(state.budget || scenario.recommendedBudget);

  const items = [
    ['입력 목표', state.goal || '미입력'],
    ['회사 / 브랜드', companyBrand],
    ['시장 / 타겟', marketTarget],
    ['조건', `${competitionLabels[state.competitionLevel] || state.competitionLevel} · ${stageLabels[state.lifecycleStage] || state.lifecycleStage}`],
    ['현재 예산', currentBudgetText],
    ['선택 예산안', `${band.label} · ${formatWon(state.budget || scenario.recommendedBudget)}`],
    ['경쟁사', competitorText],
  ];

  const fragment = document.createDocumentFragment();
  items.forEach(([label, value]) => {
    const item = document.createElement('div');
    const labelNode = document.createElement('span');
    const valueNode = document.createElement('b');
    labelNode.textContent = label;
    valueNode.textContent = value;
    item.append(labelNode, valueNode);
    fragment.appendChild(item);
  });
  const source = document.createElement('em');
  source.textContent = sourceText;
  fragment.appendChild(source);
  target.replaceChildren(fragment);
}

function renderEnginePanel(scenario) {
  const mode = document.querySelector('#engineMode');
  if (mode) {
    const modeText = scenario.mode === 'gap-analysis' ? 'BUDGET GAP' : 'ZERO-BASE';
    mode.textContent = scenario.sourceMode === 'api-engine' ? `API ENGINE · ${modeText}` : modeText;
    mode.className = `band-label ${scenario.mode === 'gap-analysis' ? 'optimal' : 'safe'}`;
  }

  const stepsTarget = document.querySelector('#engineSteps');
  if (stepsTarget) {
    const summary = `
      <article class="scenario-explain">
        <span>WHY</span>
        <b>입력값 반영 요약</b>
        <small>목표: ${scenario.goalType} · 타깃: ${scenario.targetType} · 경쟁 강도: ${scenario.competitionLevel} · 단계: ${scenario.lifecycleStage}</small>
        <small>정량 목표 해석: ${scenario.parsedGoal?.label ?? '업종 평균 목표 강도 적용'}</small>
        <small>시장 ${formatWon(scenario.marketRevenue)} · 목표 점유율 ${scenario.targetShare}% · 현재 연간 run-rate ${formatWon(scenario.currentAnnualRunRate)}</small>
        <small>한국 시장 트렌드: 런칭은 TV/YouTube 도달을 유지하고, 안정화 이후 검색·커머스·성과형 디지털로 이동</small>
        <small>주요 경쟁사: ${scenario.competitors?.length ? scenario.competitors.join(', ') : '업종 평균 기준'}</small>
      </article>
      <article class="scenario-explain">
        <span>MODEL</span>
        <b>예산 산정 근거</b>
        <small>시장점유율 확보 예산: ${formatWon(scenario.budgetDrivers.marketShareBudget)} · SOV 필요 예산: ${formatWon(scenario.budgetDrivers.sovBudget)}</small>
        <small>MMM 효율 예산: ${formatWon(scenario.budgetDrivers.mmmBudget)} · 유지 하한: ${formatWon(scenario.budgetDrivers.maintenanceBudget)}</small>
      </article>
      <article class="scenario-explain">
        <span>ROAS</span>
        <b>${scenario.businessCase.judgement}</b>
        <small>${scenario.businessCase.primaryMetric}</small>
        <small>${scenario.businessCase.recommendation}</small>
      </article>
    `;
    stepsTarget.innerHTML = summary + scenario.engineSteps.map((step, index) => `
      <article>
        <span>${String(index + 1).padStart(2, '0')}</span>
        <b>${step.name}</b>
        <small>Input: ${step.input}</small>
        <small>Output: ${step.output}</small>
      </article>
    `).join('');
  }

  const lineageTarget = document.querySelector('#dataLineage');
  if (lineageTarget) {
    lineageTarget.innerHTML = scenario.dataLineage.map((item) => `
      <article>
        <b>${item.provider}</b>
        <span>${item.data}</span>
        <small>${item.usage}</small>
        <em>${item.status}</em>
      </article>
    `).join('');
  }

  const domesticTarget = document.querySelector('#domesticPatterns');
  if (domesticTarget) {
    domesticTarget.innerHTML = domesticMediaPatterns.map((item) => `
      <article>
        <div>
          <b>${item.channel}</b>
          <em>${item.role}</em>
        </div>
        <span>${item.pattern}</span>
        <small>${item.modelingSignal}</small>
        <strong>${item.source}</strong>
      </article>
    `).join('');
  }
}

function renderAll() {
  const scenario = syncWhatIfToRecommendation(getCurrentScenario());
  updateSliderBounds(scenario);
  renderMetrics(scenario);
  renderScenarioSummary(scenario);
  renderPlans(scenario);
  renderMix(scenario);
  drawGoalCurve();
  renderBudgetPeriodLabels(scenario);
  renderEnrichmentStatus();
  renderCompetitorHelp();
  normalizeLandingGoalUi();
  normalizeMarketInputUi();
}

function normalizeMarketInputUi() {
  const companyInput = document.querySelector('#companyInput');
  if (companyInput) {
    if (!companyInput.dataset.normalized) {
      companyInput.value = state.company;
      companyInput.dataset.normalized = 'true';
    }
    const label = companyInput.closest('label');
    if (label?.firstChild) label.firstChild.textContent = '회사명';
  }

  const marketInput = document.querySelector('#marketInput');
  if (marketInput && !document.querySelector('#brandInput')) {
    const label = marketInput.closest('label');
    if (label?.parentNode) {
      label.innerHTML = '시장 카테고리<input id="marketInput" value="" placeholder="예: 콘드로이친 / 관절 건강기능식품">';
      label.insertAdjacentHTML('beforebegin', '<label>브랜드/제품명<input id="brandInput" value="" placeholder="예: 관절올케어"></label>');
      label.insertAdjacentHTML('afterend', '<label>타깃 세그먼트<input id="targetSegmentInput" value="" placeholder="예: 45-69 여성 / 관절 건강 관심층"></label>');
    }
  }

  const competitorInputs = Array.from(document.querySelectorAll('.competitor-input'));
  competitorInputs.forEach((input, index) => {
    input.disabled = false;
    input.placeholder = index < 3 ? 'AI 자동 제안' : '선택 입력';
    const label = input.closest('label');
    if (label?.firstChild) label.firstChild.textContent = `주요 경쟁사 ${index + 1}`;
    label?.classList.add('competitor-field');
  });

  updateCompetitorFieldState();
  normalizeBusinessUnitLabels();
  bindDynamicMarketInputs();
}

function normalizeBusinessUnitLabels() {
  const labels = [
    ['#requiredRoasInput', '요구 ROAS 배수', 'x'],
    ['#customerLtvInput', '고객 LTV', '만원'],
    ['#conversionRateInput', '방문 전환율', '%'],
    ['#grossMarginInput', '마진율', '%'],
    ['#marketSizeInput', '시장 규모', '억원'],
    ['#targetShareInput', '목표 점유율', '%'],
    ['#monthlyTvInput', '현재 TV 월 집행', '억원'],
    ['#monthlyDigitalInput', '현재 디지털 월 집행', '억원'],
  ];
  labels.forEach(([selector, text, unit]) => {
    const input = document.querySelector(selector);
    const label = input?.closest('label');
    if (label?.firstChild) label.firstChild.textContent = text;
    const span = label?.querySelector('span');
    if (span) span.textContent = unit;
  });
}

function bindDynamicMarketInputs() {
  if (window.__howmuchDynamicInputsBound) return;
  window.__howmuchDynamicInputsBound = true;

  document.addEventListener('input', (event) => {
    if (event.target?.id === 'brandInput') {
      markScenarioInputChanged();
      event.target.dataset.userEdited = 'true';
      state.brand = event.target.value;
      setInput('#goalBrandInput', event.target.value);
      renderAll();
    }
    if (event.target?.id === 'targetSegmentInput') {
      markScenarioInputChanged();
      event.target.dataset.userEdited = 'true';
      state.targetSegment = event.target.value;
      state.targetType = inferTargetType(event.target.value);
      renderAll();
    }
    if (event.target?.id === 'marketInput') {
      markScenarioInputChanged();
      event.target.dataset.userEdited = 'true';
      state.market = event.target.value;
      renderAll();
    }
    if (event.target?.classList?.contains('competitor-input')) {
      markScenarioInputChanged();
      competitorEdited = true;
      event.target.dataset.userEdited = 'true';
      state.competitors = Array.from(document.querySelectorAll('.competitor-input'))
        .map((node) => node.value.trim())
        .filter(Boolean)
        .slice(0, 5);
      state.competitorMode = state.competitors.length ? 'known' : 'unknown';
      renderCompetitorHelp();
      renderAll();
    }
  });

  document.addEventListener('focusin', (event) => {
    if (!event.target?.classList?.contains('competitor-input')) return;
    if (event.target.value.trim()) competitorEdited = true;
    renderCompetitorHelp();
  });
}

function updateCompetitorFieldState() {
  document.querySelectorAll('.competitor-input').forEach((input) => {
    input.disabled = false;
  });
}

function renderCompetitorHelp() {
  const target = document.querySelector('#competitorHelp');
  if (!target) return;
  if (competitorEdited) {
    target.innerHTML = '<b>주요 경쟁사</b><span>직접 입력값을 우선 반영합니다.</span>';
  } else {
    target.innerHTML = '<b>주요 경쟁사</b><span>시장과 브랜드 정보를 바탕으로 AI가 자동 제안합니다. 직접 입력하려면 칸을 클릭해서 수정하세요.</span>';
  }
}

function normalizeLandingGoalUi() {
  const landingGoal = document.querySelector('#landingGoal');
  if (landingGoal && landingGoal.value.includes('??')) {
    landingGoal.value = state.goal || '신규 고객 10,000명 확보';
  }
  if (landingGoal) landingGoal.placeholder = '예: 연간 매출 100억 증대';
  const submit = document.querySelector('.icon-submit');
  if (submit) {
    submit.textContent = '→';
    submit.setAttribute('aria-label', '입력한 목표로 시작');
    submit.title = '입력한 목표로 시작';
  }
  const presets = Array.from(document.querySelectorAll('[data-goal]'));
  const presetLabels = [
    ['브랜드 인지도', '30% 향상', '브랜드 인지도 30% 향상'],
    ['웹사이트 방문', '50,000회', '웹사이트 방문 50,000회'],
    ['신규 고객 확보', '10,000명', '신규 고객 10,000명 확보'],
    ['매출 증대', '10억원', '연간 매출 10억 증대'],
  ];
  presets.forEach((button, index) => {
    const preset = presetLabels[index];
    if (!preset) return;
    button.dataset.goal = preset[2];
    button.innerHTML = `${preset[0]}<br><b>${preset[1]}</b>`;
  });
}

function renderBudgetPeriodLabels(scenario = getCurrentScenario()) {
  const periodText = '연간 기준';
  const landingLabel = document.querySelector('.scenario-card .panel-label');
  if (landingLabel) landingLabel.textContent = '예시 리포트 화면';
  setText('#landingBudgetRange', '실제 분석 결과가 아닌 화면 예시입니다 · 입력 후 결과 화면에서 계산됩니다');

  const currentBudgetInput = document.querySelector('#currentBudgetInput');
  const currentBudgetLabel = currentBudgetInput?.closest('label');
  if (currentBudgetLabel?.firstChild) currentBudgetLabel.firstChild.textContent = `현재 광고비 ${periodText}`;
  const currentBudgetUnit = currentBudgetLabel?.querySelector('span');
  if (currentBudgetUnit) currentBudgetUnit.textContent = '억원';

  const dashboardHead = document.querySelector('.dashboard-head h2');
  if (dashboardHead && !document.querySelector('.period-note')) {
    const note = document.createElement('p');
    note.className = 'period-note';
    note.textContent = '모든 예산 금액은 연간 광고예산 기준입니다.';
    dashboardHead.insertAdjacentElement('afterend', note);
  }

  const metricLabels = document.querySelectorAll('.metric > span');
  if (metricLabels[0]) metricLabels[0].textContent = `추천 광고비 ${periodText}`;
  if (metricLabels[1]) metricLabels[1].textContent = `적정 범위 ${periodText}`;
  if (state.hasCurrentBudget) setText('#currentBudgetLabel', `${formatWon(scenario.currentBudget)} ${periodText} 대비`);

  const whatIfLabel = document.querySelector('label[for="budgetSlider"]');
  if (whatIfLabel?.firstChild) whatIfLabel.firstChild.textContent = 'What-if Annual Budget ';
}

function renderApiStatus(status) {
  const target = document.querySelector('#apiStatus');
  if (!target) return;
  const dart = status?.providers?.dart?.configured;
  const kosis = status?.providers?.kosis?.configured;
  const gemini = status?.providers?.gemini?.configured;
  target.innerHTML = `
    <em>Open DART ${dart ? '연결됨' : '미설정'}</em>
    <em>KOSIS ${kosis ? '연결됨' : '미설정'}</em>
    <em>Gemini ${gemini ? '연결됨' : '미설정'}</em>
  `;
}

function renderApiSnapshot(snapshot) {
  const target = document.querySelector('#apiSnapshot');
  if (!target) return;
  const isMock = /mock/i.test(`${snapshot.marketSize?.source ?? ''} ${snapshot.targetPopulation?.source ?? ''} ${snapshot.companyData?.source ?? ''} ${snapshot.note ?? ''}`);
  target.innerHTML = `
    <b>시장/타깃 데이터 연결</b>
    <span>시장 규모 ${snapshot.marketSize.value} · 타깃 규모 ${snapshot.targetPopulation.value}</span>
    <span>${isMock ? '현재 응답은 검증용 mock snapshot입니다. API 키가 Vercel 환경변수에 설정되면 live 데이터로 대체 가능합니다.' : 'DART/KOSIS API 응답을 반영했습니다.'}</span>
    <span>실서비스 단계에서는 기업/시장/타깃/경쟁사별 API 응답값으로 예산 계수를 갱신합니다.</span>
  `;
}

async function loadApiContext() {
  try {
    const statusResponse = await fetch('/api/status');
    const status = await statusResponse.json();
    renderApiStatus(status);

    const params = new URLSearchParams({
      company: state.company,
      market: state.market,
      target: '전국 25-54',
    });
    const snapshotResponse = await fetch(`/api/market-snapshot?${params}`);
    const snapshot = await snapshotResponse.json();
    if (snapshot?.scenarioAdjustments) {
      if (!state.market && snapshot.scenarioAdjustments.market) state.market = snapshot.scenarioAdjustments.market;
      if (!state.targetSegment && snapshot.scenarioAdjustments.targetSegment) state.targetSegment = snapshot.scenarioAdjustments.targetSegment;
      if (!state.marketRevenue && snapshot.scenarioAdjustments.marketRevenue) state.marketRevenue = snapshot.scenarioAdjustments.marketRevenue;
      if (!state.competitionIndex && snapshot.scenarioAdjustments.competitionIndex) state.competitionIndex = snapshot.scenarioAdjustments.competitionIndex;
    }
    renderApiSnapshot(snapshot);
  } catch {
    renderApiStatus({ providers: { dart: { configured: false }, kosis: { configured: false } } });
    const target = document.querySelector('#apiSnapshot');
    if (target) {
      target.innerHTML = `
        <b>시장/타깃 데이터 연결</b>
        <span>현재 로컬 정적 서버에서는 /api 함수가 실행되지 않아 mock snapshot 기준으로 표시됩니다.</span>
        <span>Vercel 배포 환경에서 api 폴더와 DART/KOSIS 환경변수를 함께 올리면 API 상태를 확인할 수 있습니다.</span>
      `;
    }
  }
}

function buildScenarioParams() {
  const params = new URLSearchParams({
    currentBudget: String(state.currentBudget),
    hasCurrentBudget: String(state.hasCurrentBudget),
    targetGoal: state.goal,
    company: state.company,
    brand: state.brand,
    market: state.market,
    targetSegment: state.targetSegment,
    competitionLevel: state.competitionLevel,
    targetType: state.targetType,
    lifecycleStage: state.lifecycleStage,
    marketRevenue: String(state.marketRevenue),
    targetShare: String(state.targetShare),
    monthlyTvBudget: String(state.monthlyTvBudget),
    monthlyDigitalBudget: String(state.monthlyDigitalBudget),
    grossMargin: String(state.grossMargin),
    requiredRoas: String(state.requiredRoas),
    customerLtv: String(state.customerLtv),
    conversionRate: String(state.conversionRate),
    competitorMode: state.competitorMode,
    competitors: state.competitors.join(','),
  });
  if (aiEnrichment) params.set('enrichment', JSON.stringify(aiEnrichment));
  return params;
}

async function loadPlanningScenarioFromApi() {
  try {
    const response = await fetch(`/api/planning-scenario?${buildScenarioParams()}`);
    if (!response.ok) throw new Error(`planning scenario ${response.status}`);
    apiScenario = await response.json();
    renderAll();
    return true;
  } catch {
    apiScenario = null;
    renderAll();
    return false;
  }
}

function setText(selector, text) {
  const node = document.querySelector(selector);
  if (node) node.textContent = text;
}

document.querySelectorAll('[data-next]').forEach((button) => {
  button.addEventListener('click', async () => {
    if (state.step === 0) {
      syncLandingGoalToForm();
      markScenarioInputChanged();
      showStep(1);
      await loadAiEnrichment();
      return;
    }
    if (state.step === 1) {
      applyGoalHintsToMarketForm();
      await loadAiEnrichment();
    }
    if (state.step === 2) await prepareScenarioResult();
    showStep(state.step + 1);
  });
});

document.querySelectorAll('[data-back]').forEach((button) => {
  button.addEventListener('click', () => showStep(state.step - 1));
});

document.querySelectorAll('[data-result]').forEach((button) => {
  button.addEventListener('click', async () => {
    await prepareScenarioResult();
    showStep(4);
  });
});

progressSteps.forEach((step, index) => {
  step.setAttribute('role', 'button');
  step.tabIndex = 0;
  step.title = `${step.textContent.trim()} 단계로 이동`;
  step.addEventListener('click', async () => {
    if (index >= 3) await prepareScenarioResult();
    showStep(index);
  });
  step.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    Promise.resolve(index >= 3 ? prepareScenarioResult() : null).then(() => showStep(index));
  });
});

document.querySelectorAll('[data-goal]').forEach((button) => {
  const label = button.textContent;
  if (label.includes('30')) button.dataset.goal = '브랜드 인지도 30% 향상';
  if (label.includes('50,000') || label.includes('50000')) button.dataset.goal = '웹사이트 방문 50,000회';
  if (label.includes('10,000') || label.includes('10000')) button.dataset.goal = '신규 고객 10,000명 확보';
  if (label.includes('10') && !label.includes('10,000') && !label.includes('10000')) button.dataset.goal = '연간 매출 10억 증대';
  button.addEventListener('click', () => {
    const value = button.dataset.goal;
    state.goal = value;
    setInput('#landingGoal', value);
    setInput('#goalInput', value);
    renderAll();
    showStep(1);
  });
});

document.querySelector('.brand')?.addEventListener('click', (event) => {
  event.preventDefault();
  goHome();
});

document.querySelector('#landingGoal')?.addEventListener('input', (event) => {
  markScenarioInputChanged();
  resetAiSuggestedFields();
  state.goal = event.target.value;
  setInput('#goalInput', event.target.value);
});

document.querySelector('#goalInput')?.addEventListener('input', (event) => {
  markScenarioInputChanged();
  resetAiSuggestedFields();
  state.goal = event.target.value;
  setInput('#landingGoal', event.target.value);
});

document.querySelector('#goalCompanyInput')?.addEventListener('input', (event) => {
  markScenarioInputChanged();
  event.target.dataset.userEdited = 'true';
  state.company = event.target.value;
  setInput('#companyInput', event.target.value);
});

document.querySelector('#goalBrandInput')?.addEventListener('input', (event) => {
  markScenarioInputChanged();
  event.target.dataset.userEdited = 'true';
  state.brand = event.target.value;
  setInput('#brandInput', event.target.value);
});

document.querySelector('#companyInput')?.addEventListener('input', (event) => {
  markScenarioInputChanged();
  event.target.dataset.userEdited = 'true';
  state.company = event.target.value;
  setInput('#goalCompanyInput', event.target.value);
  renderAll();
  loadApiContext();
});

document.querySelector('#marketInput')?.addEventListener('input', (event) => {
  markScenarioInputChanged();
  state.market = event.target.value;
  renderAll();
  loadApiContext();
});

document.querySelector('#targetTypeInput')?.addEventListener('change', (event) => {
  markScenarioInputChanged();
  state.targetType = event.target.value;
  renderAll();
});

document.querySelector('#competitionLevelInput')?.addEventListener('change', (event) => {
  markScenarioInputChanged();
  state.competitionLevel = event.target.value;
  renderAll();
});

document.querySelector('#lifecycleStageInput')?.addEventListener('change', (event) => {
  markScenarioInputChanged();
  state.lifecycleStage = event.target.value;
  renderAll();
});

document.querySelector('#marketSizeInput')?.addEventListener('input', (event) => {
  markScenarioInputChanged();
  state.marketRevenue = Number(event.target.value || 5000);
  renderAll();
});

document.querySelector('#targetShareInput')?.addEventListener('input', (event) => {
  markScenarioInputChanged();
  state.targetShare = Number(event.target.value || 10);
  renderAll();
});

document.querySelector('#monthlyTvInput')?.addEventListener('input', (event) => {
  markScenarioInputChanged();
  state.monthlyTvBudget = Number(event.target.value || 0);
  renderAll();
});

document.querySelector('#monthlyDigitalInput')?.addEventListener('input', (event) => {
  markScenarioInputChanged();
  state.monthlyDigitalBudget = Number(event.target.value || 0);
  renderAll();
});

document.querySelector('#grossMarginInput')?.addEventListener('input', (event) => {
  markScenarioInputChanged();
  state.grossMargin = Number(event.target.value || 52);
  renderAll();
});

document.querySelector('#requiredRoasInput')?.addEventListener('input', (event) => {
  markScenarioInputChanged();
  state.requiredRoas = Number(event.target.value || 1.8);
  renderAll();
});

document.querySelector('#customerLtvInput')?.addEventListener('input', (event) => {
  markScenarioInputChanged();
  state.customerLtv = Number(event.target.value || 42);
  renderAll();
});

document.querySelector('#conversionRateInput')?.addEventListener('input', (event) => {
  markScenarioInputChanged();
  state.conversionRate = Number(event.target.value || 2.6);
  renderAll();
});

document.querySelector('#budgetModeInput')?.addEventListener('change', (event) => {
  markScenarioInputChanged();
  state.hasCurrentBudget = event.target.value === 'with';
  const currentBudgetInput = document.querySelector('#currentBudgetInput');
  if (currentBudgetInput) currentBudgetInput.disabled = !state.hasCurrentBudget;
  renderAll();
});

document.querySelector('#currentBudgetInput')?.addEventListener('input', (event) => {
  markScenarioInputChanged();
  syncCurrentAnnualBudget(event.target.value);
  renderAll();
});

slider?.addEventListener('input', (event) => {
  whatIfTouched = true;
  state.budget = Number(event.target.value);
  renderAll();
});

document.querySelector('#plans')?.addEventListener('click', (event) => {
  const card = event.target.closest('[data-budget]');
  if (!card) return;
  whatIfTouched = true;
  state.budget = Number(card.dataset.budget);
  if (slider) slider.value = String(state.budget);
  renderAll();
});

function setInput(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.value = value;
}

showStep(window.location.hash === '#result' ? 4 : 0);
if (slider) slider.value = String(state.budget);
renderAll();
loadApiContext();
