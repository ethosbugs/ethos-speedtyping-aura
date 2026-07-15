/* ============================================
   Ethos Speedtyping v7.3 — app.js
   Controlador core: navegación, wiring de la
   vista de escritura, dashboard, perfil, ranking
   y ajustes. Bootstrap único de la aplicación.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initOnboarding();
  EthosThemes.init();
  const boards = EthosKeyboard.init();
  initTabsRouter();
  initTypingView(boards);
  initPracticeView(boards);
  initConfigBar();
  initSettingsView();
  initProfileView();
  renderDashboard();
  EthosRanking.renderAll();
});

/* ---------- Onboarding modal ---------- */
function initOnboarding() {
  const modal = document.getElementById('onboardingModal');
  const closeBtn = document.getElementById('closeOnboardingBtn');
  if (!modal) return;

  const seen = EthosUtils.storageGet('onboardingSeen', false);
  if (!seen) modal.style.display = 'flex';

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      EthosUtils.storageSet('onboardingSeen', true);
      const activeView = document.querySelector('.view.active');
      const inputToFocus = activeView && activeView.querySelector('.hidden-input');
      if (inputToFocus) inputToFocus.focus();
    });
  }
}

/* ---------- Navegación por pestañas ---------- */
function initTabsRouter() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-view');
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.classList.add('active');

      if (targetId === 'dashboardView') renderDashboard();
      if (targetId === 'profileView') EthosRanking.renderProfileRank();
      if (targetId === 'rankingView') EthosRanking.renderLeaderboard();

      if (targetId === 'typingView') {
        const input = document.getElementById('hiddenInput');
        if (input) input.focus();
      }
      if (targetId === 'practiceView') {
        const input = document.getElementById('practiceHiddenInput');
        if (input) input.focus();
      }
    });
  });
}

/* ---------- Vista principal de escritura ---------- */
function initTypingView(boards) {
  const els = {
    hiddenInput: document.getElementById('hiddenInput'),
    textDisplay: document.getElementById('textDisplay'),
    wpmValue: document.getElementById('wpmValue'),
    accValue: document.getElementById('accValue'),
    timeValue: document.getElementById('timeValue'),
    timerLabel: document.getElementById('timerLabel'),
    startHint: document.getElementById('startHint'),
    typingPanel: document.getElementById('typingPanel'),
    resultsPanel: document.getElementById('resultsPanel'),
  };
  if (!els.hiddenInput) return;

  EthosTyping.init(els);
  EthosKeyboard.bindInput(els.hiddenInput, [boards.mainBoard].filter(Boolean));

  const onResult = (result) => {
    document.getElementById('resWpm').textContent = result.wpm;
    document.getElementById('resAcc').textContent = result.accuracy + '%';
    document.getElementById('resKeys').textContent = `${result.correctChars}/${result.incorrectChars}`;
    els.typingPanel.style.display = 'none';
    els.resultsPanel.style.display = '';
    EthosRanking.renderAll();
  };

  EthosTyping.startNewTest(onResult);

  const restartBtn = document.getElementById('restartBtn');
  if (restartBtn) restartBtn.addEventListener('click', () => EthosTyping.startNewTest(onResult));

  const closeResultsBtn = document.getElementById('closeResultsBtn');
  if (closeResultsBtn) {
    closeResultsBtn.addEventListener('click', () => {
      els.resultsPanel.style.display = 'none';
      els.typingPanel.style.display = '';
      EthosTyping.startNewTest(onResult);
    });
  }
}

/* ---------- Vista de práctica interactiva ---------- */
function initPracticeView(boards) {
  const els = {
    hiddenInput: document.getElementById('practiceHiddenInput'),
    textDisplay: document.getElementById('practiceTextDisplay'),
    nextBtn: document.getElementById('nextPracticeBtn'),
    counter: document.getElementById('practiceCounter'),
  };
  if (!els.hiddenInput) return;

  EthosPractice.init(els, boards.practiceBoard);
  EthosKeyboard.bindInput(els.hiddenInput, [boards.practiceBoard].filter(Boolean));
}

/* ---------- Barra de configuración (modo / duración / palabras / categoría) ---------- */
function initConfigBar() {
  const modeChips = document.querySelectorAll('[data-mode]');
  const durationChips = document.getElementById('durationChips');
  const wordChips = document.getElementById('wordChips');
  const categorySelect = document.getElementById('categorySelect');

  const s = EthosSettings.get();
  if (categorySelect) categorySelect.value = s.category;

  function restartWithCurrentSettings() {
    EthosTyping.stop();
    const els = document.getElementById('resultsPanel');
    if (els) els.style.display = 'none';
    const panel = document.getElementById('typingPanel');
    if (panel) panel.style.display = '';
    EthosTyping.startNewTest((result) => {
      document.getElementById('resWpm').textContent = result.wpm;
      document.getElementById('resAcc').textContent = result.accuracy + '%';
      document.getElementById('resKeys').textContent = `${result.correctChars}/${result.incorrectChars}`;
      panel.style.display = 'none';
      els.style.display = '';
      EthosRanking.renderAll();
    });
  }

  modeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      modeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const mode = chip.getAttribute('data-mode');
      EthosSettings.set('mode', mode);
      if (durationChips) durationChips.style.display = mode === 'time' ? '' : 'none';
      if (wordChips) wordChips.style.display = mode === 'words' ? '' : 'none';
      restartWithCurrentSettings();
    });
  });

  if (durationChips) {
    durationChips.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        durationChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        EthosSettings.set('duration', parseInt(chip.getAttribute('data-value'), 10));
        restartWithCurrentSettings();
      });
    });
  }

  if (wordChips) {
    wordChips.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        wordChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        EthosSettings.set('wordGoal', parseInt(chip.getAttribute('data-value'), 10));
        restartWithCurrentSettings();
      });
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      EthosSettings.set('category', categorySelect.value);
      restartWithCurrentSettings();
    });
  }
}

/* ---------- Dashboard ---------- */
let progressChartInstance = null;

function renderDashboard() {
  const agg = EthosStats.getAggregate();
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set('dashTestsCompleted', agg.testsCompleted);
  set('dashBestWpm', agg.bestWpm);
  set('dashAvgWpm', EthosStats.getAverageWpm());
  set('dashAvgAcc', EthosStats.getAverageAccuracy() + '%');

  const historyListEl = document.getElementById('historyList');
  const recent = EthosHistory.getRecent(15);
  if (historyListEl) EthosHistory.renderList(historyListEl, recent);

  renderProgressChart(recent);
}

function renderProgressChart(recent) {
  const canvas = document.getElementById('progressChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const ordered = [...recent].reverse();
  const labels = ordered.map(e => EthosUtils.formatDate(e.timestamp));
  const data = ordered.map(e => e.wpm);

  if (progressChartInstance) progressChartInstance.destroy();

  progressChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'WPM',
        data,
        borderColor: getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#7c5cff',
        backgroundColor: 'transparent',
        tension: 0.35,
        pointRadius: 3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#8a8ea3' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#8a8ea3' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
      },
    },
  });
}

/* ---------- Perfil ---------- */
const AVATAR_SEEDS = ['Ethos1', 'Cyber', 'Neon', 'Retro', 'Alpha'];

function initProfileView() {
  const usernameInput = document.getElementById('usernameInput');
  const saveBtn = document.getElementById('saveProfileBtn');
  const avatarImg = document.getElementById('currentAvatarImg');
  const avatarOptions = document.querySelectorAll('.avatar-option');

  if (usernameInput) usernameInput.value = EthosProfile.getName();

  const savedSeed = EthosUtils.storageGet('avatarSeed', 'Ethos1');
  if (avatarImg) avatarImg.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${savedSeed}`;
  avatarOptions.forEach(opt => {
    opt.classList.toggle('selected', opt.getAttribute('data-avatar') === savedSeed);
    opt.addEventListener('click', () => {
      const seed = opt.getAttribute('data-avatar');
      EthosUtils.storageSet('avatarSeed', seed);
      if (avatarImg) avatarImg.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
      avatarOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const saved = EthosProfile.setName(usernameInput.value);
      usernameInput.value = saved;
      EthosUtils.showToast('Perfil guardado');
      EthosRanking.renderAll();
    });
  }
}

/* ---------- Ajustes ---------- */
function initSettingsView() {
  const s = EthosSettings.get();

  const ignoreCase = document.getElementById('ignoreCaseToggle');
  const ignorePunct = document.getElementById('ignorePunctuationToggle');
  const sound = document.getElementById('soundToggle');
  const resetBtn = document.getElementById('resetStatsBtn');

  if (ignoreCase) {
    ignoreCase.checked = s.ignoreCase;
    ignoreCase.addEventListener('change', () => EthosSettings.set('ignoreCase', ignoreCase.checked));
  }
  if (ignorePunct) {
    ignorePunct.checked = s.ignorePunctuation;
    ignorePunct.addEventListener('change', () => EthosSettings.set('ignorePunctuation', ignorePunct.checked));
  }
  if (sound) {
    sound.checked = s.soundEnabled;
    sound.addEventListener('change', () => EthosSettings.set('soundEnabled', sound.checked));
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas reiniciar todos tus datos guardados?')) {
        localStorage.clear();
        location.reload();
      }
    });
  }
}
