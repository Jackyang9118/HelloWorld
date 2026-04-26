const stepNames = ['放挡圈', '螺钉1', '放置转子', '放螺母', '点胶', '装转块', '打紧'];

const state = {
  running: true,
  startAt: Date.now() - 40000,
  totalDetected: 4,
  good: 1,
  actionNg: 0,
  prodNg: 3,
  currentStep: 1,
  elapsedStep: 12.5,
  cycleTime: 136689.5,
  steps: stepNames.map((name, index) => ({
    name,
    result: index === 0 ? 'PASS' : 'Idle',
    time: index === 0 ? 0.8 : index === 1 ? 12.5 : 0
  })),
  stats: stepNames.map((name, index) => ({
    name,
    ok: index === 0 ? 5 : 1,
    ng: 0,
    pt: [1016.4, 15924, 12456, 18439, 6374.6, 9688.8, 7102.1][index]
  }))
};

const refs = {
  runtimeRows: document.getElementById('runtimeRows'),
  statRows: document.getElementById('statRows'),
  stepCards: document.getElementById('stepCards'),
  yieldPercent: document.getElementById('yieldPercent'),
  detected: document.getElementById('detected'),
  good: document.getElementById('good'),
  actionNg: document.getElementById('actionNg'),
  prodNg: document.getElementById('prodNg'),
  ct: document.getElementById('ct'),
  statusText: document.getElementById('statusText'),
  elapsedText: document.getElementById('elapsedText'),
  resultText: document.getElementById('resultText'),
  runningTime: document.getElementById('runningTime'),
  runtimeProgress: document.getElementById('runtimeProgress'),
  footerText: document.getElementById('footerText')
};

function formatMMSS(ms) {
  const total = Math.floor(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function formatHHMMSS(ms) {
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function render() {
  const yieldRate = state.totalDetected ? ((state.good / state.totalDetected) * 100).toFixed(2) : '0.00';
  refs.yieldPercent.textContent = `${yieldRate}%`;
  refs.detected.textContent = state.totalDetected;
  refs.good.textContent = state.good;
  refs.actionNg.textContent = state.actionNg;
  refs.prodNg.textContent = state.prodNg;
  refs.ct.textContent = state.cycleTime.toFixed(1);

  const elapsed = Date.now() - state.startAt;
  refs.elapsedText.textContent = formatMMSS(elapsed);
  refs.runningTime.textContent = formatHHMMSS(elapsed);
  refs.statusText.textContent = state.running ? '运行' : '待机';
  refs.statusText.className = state.running ? 'running' : 'idle';

  const current = state.steps[state.currentStep];
  refs.resultText.textContent = current.result;
  refs.footerText.textContent = `相机: ● | 帧率: 15 fps | 速度: 59 ms | 图像: 1920*1080 | 测试ID: 7 | 动作: ${current.name}`;

  refs.runtimeRows.innerHTML = '';
  refs.stepCards.innerHTML = '';
  refs.statRows.innerHTML = '';

  state.steps.forEach((step, index) => {
    const row = document.createElement('tr');
    if (index === state.currentStep) row.classList.add('active-row');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${step.name}</td>
      <td>${step.result === 'PASS' ? '<span class="badge pass">PASS</span>' : step.result}</td>
      <td>${step.time.toFixed(1)}</td>
    `;
    refs.runtimeRows.appendChild(row);

    const card = document.createElement('div');
    card.className = `card ${index === state.currentStep ? 'active' : ''}`;
    card.innerHTML = `
      <div class="title">${index + 1}: ${step.name}</div>
      <div class="thumb"></div>
      <div class="state ${step.result === 'PASS' ? 'pass' : ''}">${step.result}</div>
    `;
    refs.stepCards.appendChild(card);
  });

  state.stats.forEach((step, index) => {
    const ngRate = step.ok + step.ng ? ((step.ng / (step.ok + step.ng)) * 100).toFixed(2) : '0.00';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${step.name}</td>
      <td>${step.ok}</td>
      <td>${step.ng}</td>
      <td class="ng">${ngRate}</td>
      <td>${step.pt}</td>
    `;
    refs.statRows.appendChild(row);
  });

  const progress = ((state.currentStep + 1) / state.steps.length) * 100;
  refs.runtimeProgress.style.width = `${progress}%`;
}

function tick() {
  if (!state.running) return;
  state.elapsedStep += 1;
  state.steps[state.currentStep].time = state.elapsedStep;

  if (state.elapsedStep >= 10) {
    state.steps[state.currentStep].result = 'PASS';
    state.stats[state.currentStep].ok += 1;
    state.totalDetected += 1;
    state.good += 1;
    state.cycleTime += state.elapsedStep;

    state.currentStep = (state.currentStep + 1) % state.steps.length;
    state.elapsedStep = 0;
    state.steps[state.currentStep].result = 'Idle';
    state.steps[state.currentStep].time = 0;
  }

  render();
}

function setRunning(flag) {
  state.running = flag;
  render();
}

document.getElementById('startBtn').addEventListener('click', () => setRunning(true));
document.getElementById('stopBtn').addEventListener('click', () => {
  setRunning(false);
  refs.resultText.textContent = 'NG';
});
document.getElementById('pauseBtn').addEventListener('click', () => setRunning(false));
document.getElementById('resetBtn').addEventListener('click', () => window.location.reload());
document.getElementById('selectBtn').addEventListener('click', () => {
  const name = prompt('请输入作业员名称', '张三');
  if (name) document.getElementById('operatorName').textContent = name;
});

render();
setInterval(() => {
  if (state.running) {
    refs.elapsedText.textContent = formatMMSS(Date.now() - state.startAt);
    refs.runningTime.textContent = formatHHMMSS(Date.now() - state.startAt);
  }
}, 1000);
setInterval(tick, 1000);
