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
  company: 'Korea Eundan',
  goal: '2026 H2 신규 고객 확대',
  market: '건강기능식품 / 전국 / 25-54',
  currentBudget: 12,
  hasCurrentBudget: true,
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

function renderMix() {
  const list = document.querySelector('#mixList');
  if (list) {
    list.innerHTML = getScaledMix(state.budget).map((item) => `
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
    comparison.innerHTML = mediaMix.map((item) => `
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
  const landingBudget = document.querySelector('#landingRecommendedBudget');
  if (landingBudget) landingBudget.innerHTML = `${formatWon(scenario.recommendedBudget)}<span>원</span>`;
  setText('#landingBudgetRange', `적정 범위 ${formatWon(scenario.range[0])} ~ ${formatWon(scenario.range[1])}`);
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
    stepsTarget.innerHTML = scenario.engineSteps.map((step, index) => `
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
  renderMix();
  drawGoalCurve();
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
    <span>DART: ${snapshot.companyData.disclosureCoverage} · KOSIS: 시장/타깃 통계 연결 준비 완료</span>
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
  button.addEventListener('click', () => showStep(state.step + 1));
});

document.querySelectorAll('[data-back]').forEach((button) => {
  button.addEventListener('click', () => showStep(state.step - 1));
});

document.querySelectorAll('[data-result]').forEach((button) => {
  button.addEventListener('click', () => showStep(4));
});

document.querySelectorAll('[data-goal]').forEach((button) => {
  button.addEventListener('click', () => {
    const value = button.dataset.goal;
    state.goal = value;
    setInput('#landingGoal', value);
    setInput('#goalInput', value);
  });
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

document.querySelector('#budgetModeInput')?.addEventListener('change', (event) => {
  state.hasCurrentBudget = event.target.value === 'with';
  const currentBudgetInput = document.querySelector('#currentBudgetInput');
  if (currentBudgetInput) currentBudgetInput.disabled = !state.hasCurrentBudget;
  renderAll();
});

document.querySelector('#currentBudgetInput')?.addEventListener('input', (event) => {
  state.currentBudget = Number(event.target.value || 12);
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
