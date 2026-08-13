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
  monthlyTvBudget: 12,
  monthlyDigitalBudget: 14,
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

function formatWon(value) {
  return `${Number(value).toFixed(1).replace('.0', '')}억`;
}

function getCurrentScenario() {
  return buildPlanningScenario({
    currentBudget: state.currentBudget,
    hasCurrentBudget: state.hasCurrentBudget,
    targetGoal: state.goal,
    company: state.company,
    brand: state.brand,
    market: state.market,
    targetSegment: state.targetSegment,
    competitionLevel: state.competitionLevel,
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

function goHome() {
  showStep(0);
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

function syncLandingGoalToForm() {
  const landingGoal = document.querySelector('#landingGoal');
  const value = landingGoal?.value?.trim();
  if (!value) return;
  state.goal = value;
  setInput('#goalInput', value);
}

function drawGoalCurve() {
  const svg = document.querySelector('#goalCurve');
  if (!svg) return;
  const scenario = getCurrentScenario();
  const width = 720;
  const height = 300;
  const points = [];
  for (let budget = 10; budget <= 25; budget += 0.5) {
    const x = ((budget - 10) / 15) * (width - 88) + 44;
    const y = height - 46 - ((getGoalAchievementForBudget(budget) - 50) / 75) * (height - 82);
    points.push([x, y]);
  }
  const path = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${path} L ${width - 44} ${height - 46} L 44 ${height - 46} Z`;
  const selectedX = ((state.budget - 10) / 15) * (width - 88) + 44;
  const selectedY = height - 46 - ((getGoalAchievementForBudget(state.budget) - 50) / 75) * (height - 82);

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
  if (list) {
    list.innerHTML = getScaledMix(state.budget, scenario).map((item) => `
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

function renderMetrics() {
  const scenario = getCurrentScenario();
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

function renderEnginePanel(scenario) {
  const mode = document.querySelector('#engineMode');
  if (mode) {
    mode.textContent = scenario.mode === 'gap-analysis' ? 'BUDGET GAP' : 'ZERO-BASE';
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
  const scenario = getCurrentScenario();
  renderMetrics();
  renderPlans(scenario);
  renderMix(scenario);
  drawGoalCurve();
  renderBudgetPeriodLabels(scenario);
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
  if (competitorInputs.length && !document.querySelector('#competitorModeInput')) {
    const firstLabel = competitorInputs[0].closest('label');
    firstLabel?.insertAdjacentHTML('beforebegin', `
      <label>경쟁사 입력<select id="competitorModeInput">
        <option value="unknown">모름</option>
        <option value="none">없음</option>
        <option value="known">직접 입력</option>
      </select></label>
    `);
    competitorInputs.forEach((input, index) => {
      input.value = '';
      input.placeholder = index === 0 ? '예: 주영엔에스' : '선택 입력';
      const label = input.closest('label');
      if (label?.firstChild) label.firstChild.textContent = `주요 경쟁사 ${index + 1}`;
      label?.classList.add('competitor-field');
    });
  }

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
      state.brand = event.target.value;
      renderAll();
    }
    if (event.target?.id === 'targetSegmentInput') {
      state.targetSegment = event.target.value;
      state.targetType = inferTargetType(event.target.value);
      renderAll();
    }
    if (event.target?.id === 'marketInput') {
      state.market = event.target.value;
      renderAll();
    }
    if (event.target?.classList?.contains('competitor-input')) {
      if (state.competitorMode !== 'known') {
        state.competitors = [];
      } else {
        state.competitors = Array.from(document.querySelectorAll('.competitor-input'))
          .map((node) => node.value.trim())
          .filter(Boolean)
          .slice(0, 5);
      }
      renderAll();
    }
  });

  document.addEventListener('change', (event) => {
    if (event.target?.id === 'competitorModeInput') {
      state.competitorMode = event.target.value;
      if (state.competitorMode !== 'known') state.competitors = [];
      updateCompetitorFieldState();
      renderAll();
    }
  });
}

function updateCompetitorFieldState() {
  const mode = document.querySelector('#competitorModeInput')?.value ?? state.competitorMode;
  const disabled = mode !== 'known';
  document.querySelectorAll('.competitor-input').forEach((input) => {
    input.disabled = disabled;
    if (disabled) input.value = '';
  });
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
  target.innerHTML = `
    <em>Open DART ${dart ? '연결됨' : '미설정'}</em>
    <em>KOSIS ${kosis ? '연결됨' : '미설정'}</em>
  `;
}

function renderApiSnapshot(snapshot) {
  const target = document.querySelector('#apiSnapshot');
  if (!target) return;
  target.innerHTML = `
    <b>시장/타깃 데이터 연결</b>
    <span>시장 규모 ${snapshot.marketSize.value} · 타깃 규모 ${snapshot.targetPopulation.value}</span>
    <span>DART/KOSIS 키 상태를 확인했고, 현재 목업은 live API 대신 검증용 mock snapshot을 사용합니다.</span>
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
    renderApiSnapshot(snapshot);
  } catch {
    renderApiStatus({ providers: { dart: { configured: false }, kosis: { configured: false } } });
    const target = document.querySelector('#apiSnapshot');
    if (target) {
      target.innerHTML = `
        <b>시장/타깃 데이터 연결</b>
        <span>로컬 API 프록시에 연결하지 못해 mock snapshot을 사용 중입니다.</span>
      `;
    }
  }
}

function setText(selector, text) {
  const node = document.querySelector(selector);
  if (node) node.textContent = text;
}

document.querySelectorAll('[data-next]').forEach((button) => {
  button.addEventListener('click', () => {
    if (state.step === 0) syncLandingGoalToForm();
    showStep(state.step + 1);
  });
});

document.querySelectorAll('[data-back]').forEach((button) => {
  button.addEventListener('click', () => showStep(state.step - 1));
});

document.querySelectorAll('[data-result]').forEach((button) => {
  button.addEventListener('click', () => showStep(4));
});

progressSteps.forEach((step, index) => {
  step.setAttribute('role', 'button');
  step.tabIndex = 0;
  step.title = `${step.textContent.trim()} 단계로 이동`;
  step.addEventListener('click', () => showStep(index));
  step.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    showStep(index);
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
  state.goal = event.target.value;
  setInput('#goalInput', event.target.value);
});

document.querySelector('#goalInput')?.addEventListener('input', (event) => {
  state.goal = event.target.value;
});

document.querySelector('#companyInput')?.addEventListener('input', (event) => {
  state.company = event.target.value;
  loadApiContext();
});

document.querySelector('#marketInput')?.addEventListener('input', (event) => {
  state.market = event.target.value;
  loadApiContext();
});

document.querySelector('#targetTypeInput')?.addEventListener('change', (event) => {
  state.targetType = event.target.value;
  renderAll();
});

document.querySelector('#competitionLevelInput')?.addEventListener('change', (event) => {
  state.competitionLevel = event.target.value;
  renderAll();
});

document.querySelector('#lifecycleStageInput')?.addEventListener('change', (event) => {
  state.lifecycleStage = event.target.value;
  renderAll();
});

document.querySelector('#marketSizeInput')?.addEventListener('input', (event) => {
  state.marketRevenue = Number(event.target.value || 5000);
  renderAll();
});

document.querySelector('#targetShareInput')?.addEventListener('input', (event) => {
  state.targetShare = Number(event.target.value || 10);
  renderAll();
});

document.querySelector('#monthlyTvInput')?.addEventListener('input', (event) => {
  state.monthlyTvBudget = Number(event.target.value || 0);
  renderAll();
});

document.querySelector('#monthlyDigitalInput')?.addEventListener('input', (event) => {
  state.monthlyDigitalBudget = Number(event.target.value || 0);
  renderAll();
});

document.querySelector('#grossMarginInput')?.addEventListener('input', (event) => {
  state.grossMargin = Number(event.target.value || 52);
  renderAll();
});

document.querySelector('#requiredRoasInput')?.addEventListener('input', (event) => {
  state.requiredRoas = Number(event.target.value || 1.8);
  renderAll();
});

document.querySelector('#customerLtvInput')?.addEventListener('input', (event) => {
  state.customerLtv = Number(event.target.value || 42);
  renderAll();
});

document.querySelector('#conversionRateInput')?.addEventListener('input', (event) => {
  state.conversionRate = Number(event.target.value || 2.6);
  renderAll();
});

document.querySelector('#budgetModeInput')?.addEventListener('change', (event) => {
  state.hasCurrentBudget = event.target.value === 'with';
  const currentBudgetInput = document.querySelector('#currentBudgetInput');
  if (currentBudgetInput) currentBudgetInput.disabled = !state.hasCurrentBudget;
  renderAll();
});

document.querySelector('#currentBudgetInput')?.addEventListener('input', (event) => {
  syncCurrentAnnualBudget(event.target.value);
  renderAll();
});

slider?.addEventListener('input', (event) => {
  state.budget = Number(event.target.value);
  renderAll();
});

document.querySelector('#plans')?.addEventListener('click', (event) => {
  const card = event.target.closest('[data-budget]');
  if (!card) return;
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
