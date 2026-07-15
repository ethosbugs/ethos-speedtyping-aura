/* ============================================
   Ethos Speedtyping v7.3 — typing.js
   Motor de escritura principal (vista "Escribir").
   Carga frases desde data/*.json (fallback local
   si el fetch falla), calcula métricas en vivo y
   entrega el resultado a EthosStats/History/Ranking.
   ============================================ */

const EthosTyping = (() => {
  const FALLBACK_PHRASES = {
    spanish: ['El único límite real es tu mente.', 'La constancia siempre vence al talento.'],
    english: ['Consistency is the absolute key to success.', 'Practice makes permanent muscle memory.'],
    code: ["const active = document.querySelector('.key');", 'return history.reduce((a, b) => a + b, 0);'],
    gaming: ['GG WP, excelente sesión de entrenamiento.', 'Mantén el control del mapa de teclas.'],
    science: ['El universo se expande aceleradamente.', 'La entropía mide el desorden de un sistema.'],
  };

  let els = {};
  let state = {};
  let timer = null;
  let phraseCache = {};
  let audioCtx = null;

  function init(refs) {
    els = refs;
    els.hiddenInput.addEventListener('input', onInput);
    els.hiddenInput.addEventListener('keydown', onKeyDown);
    els.textDisplay.addEventListener('click', () => els.hiddenInput.focus());
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        restart();
      }
    });
  }

  async function loadCategory(category) {
    if (phraseCache[category]) return phraseCache[category];
    try {
      const res = await fetch(`data/${category}.json`);
      if (!res.ok) throw new Error('bad response');
      const json = await res.json();
      phraseCache[category] = (json.phrases && json.phrases.length) ? json.phrases : FALLBACK_PHRASES[category];
    } catch (e) {
      phraseCache[category] = FALLBACK_PHRASES[category] || FALLBACK_PHRASES.spanish;
    }
    return phraseCache[category];
  }

  function applyTextFilters(text) {
    const s = EthosSettings.get();
    let out = text;
    if (s.ignorePunctuation) out = out.replace(/[.,!?;:"'()\-]/g, '').replace(/\s+/g, ' ').trim();
    if (s.ignoreCase) out = out.toLowerCase();
    return out;
  }

  async function buildText(category, minChars) {
    const phrases = await loadCategory(category);
    let text = '';
    while (text.length < minChars) {
      text += (text ? ' ' : '') + EthosUtils.randomChoice(phrases);
    }
    return applyTextFilters(text);
  }

  function resetState() {
    state = {
      text: '', chars: [], cursor: 0,
      correctCount: 0, incorrectCount: 0, totalKeystrokes: 0,
      started: false, finished: false, startTime: null,
    };
  }

  function renderText() {
    els.textDisplay.innerHTML = state.chars.map((c, i) => {
      let cls = 'char';
      if (i < state.cursor) cls += c.status === 'incorrect' ? ' incorrect' : ' correct';
      if (i === state.cursor) cls += ' current';
      return `<span class="${cls}" data-idx="${i}">${EthosUtils.escapeHtml(c.value)}</span>`;
    }).join('');
  }

  function playClick(correct) {
    if (!EthosSettings.get('soundEnabled')) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = correct ? 720 : 220;
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) { /* audio no disponible, se ignora */ }
  }

  async function startNewTest(onResultCallback) {
    const s = EthosSettings.get();
    resetState();
    state.onResultCallback = onResultCallback;

    const targetChars = s.mode === 'words' ? s.wordGoal * 6 : 260;
    state.text = await buildText(s.category, targetChars);
    state.chars = state.text.split('').map(ch => ({ value: ch, status: null }));
    renderText();

    if (els.wpmValue) els.wpmValue.textContent = '0';
    if (els.accValue) els.accValue.textContent = '100%';
    if (els.timeValue) els.timeValue.textContent = s.mode === 'words' ? '0' : String(s.duration);
    if (els.timerLabel) els.timerLabel.textContent = s.mode === 'words' ? 'Palabras' : 'Tiempo';
    if (els.startHint) els.startHint.style.display = '';
    if (els.resultsPanel) els.resultsPanel.style.display = 'none';
    if (els.typingPanel) els.typingPanel.style.display = '';

    timer = new EthosTimer({
      mode: s.mode,
      duration: s.duration,
      onTick: (remainingOrElapsed, elapsed) => {
        const wpm = EthosStats.calcWpm(state.correctCount, elapsed || 0.1);
        if (els.wpmValue) els.wpmValue.textContent = String(wpm);
        if (els.accValue) {
          els.accValue.textContent = EthosStats.calcAccuracy(state.correctCount, state.totalKeystrokes) + '%';
        }
        if (els.timeValue) {
          els.timeValue.textContent = s.mode === 'words'
            ? String(Math.floor(elapsed))
            : String(Math.max(0, Math.ceil(remainingOrElapsed)));
        }
      },
      onEnd: (elapsed) => finish(elapsed),
    });

    els.hiddenInput.value = '';
    els.hiddenInput.focus();
  }

  function onKeyDown(e) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (state.cursor > 0) {
        state.cursor -= 1;
        state.chars[state.cursor].status = null;
        renderText();
      }
    }
  }

  function onInput(e) {
    const inputChar = e.data;
    if (!inputChar) return;
    els.hiddenInput.value = '';

    if (!state.started) {
      state.started = true;
      state.startTime = Date.now();
      if (els.startHint) els.startHint.style.display = 'none';
      timer.start();
    }
    if (state.finished || state.cursor >= state.chars.length) return;

    const s = EthosSettings.get();
    const expectedRaw = state.chars[state.cursor].value;
    const typedRaw = inputChar;
    const isCorrect = s.ignoreCase
      ? typedRaw.toLowerCase() === expectedRaw.toLowerCase()
      : typedRaw === expectedRaw;

    state.chars[state.cursor].status = isCorrect ? 'correct' : 'incorrect';
    state.totalKeystrokes += 1;
    if (isCorrect) state.correctCount += 1; else state.incorrectCount += 1;
    playClick(isCorrect);

    state.cursor += 1;

    const spanEl = els.textDisplay.querySelector(`[data-idx="${state.cursor - 1}"]`);
    if (spanEl && !isCorrect) {
      spanEl.classList.add('flash');
      setTimeout(() => spanEl.classList.remove('flash'), 300);
    }

    renderText();

    if (state.mode === 'words') { /* handled by wordGoal check below */ }
    const s2 = EthosSettings.get();
    if (s2.mode === 'words') {
      const typedWords = state.text.slice(0, state.cursor).trim().split(/\s+/).filter(Boolean).length;
      if (typedWords >= s2.wordGoal && /\s|$/.test(inputChar)) {
        const elapsed = (Date.now() - state.startTime) / 1000;
        finish(elapsed);
        return;
      }
    }

    if (state.cursor >= state.chars.length) {
      const elapsed = (Date.now() - state.startTime) / 1000;
      finish(elapsed);
    }
  }

  function finish(elapsedSeconds) {
    if (state.finished) return;
    state.finished = true;
    if (timer) timer.stop(false);

    const wpm = EthosStats.calcWpm(state.correctCount, elapsedSeconds || 0.1);
    const accuracy = EthosStats.calcAccuracy(state.correctCount, state.totalKeystrokes);
    const s = EthosSettings.get();

    const result = {
      wpm, accuracy,
      correctChars: state.correctCount,
      incorrectChars: state.incorrectCount,
      totalChars: state.totalKeystrokes,
      elapsedSeconds,
      category: s.category,
      mode: s.mode,
      timestamp: Date.now(),
    };

    EthosStats.recordSession(result);
    EthosHistory.add(result);

    if (state.onResultCallback) state.onResultCallback(result);
  }

  function restart() {
    if (timer) timer.stop(false);
    startNewTest(state.onResultCallback);
  }

  function stop() {
    if (timer) timer.stop(false);
  }

  return { init, startNewTest, restart, stop, buildText };
})();
