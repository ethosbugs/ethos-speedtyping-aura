/* ============================================
   Ethos Speedtyping v7.3 — practice.js
   Práctica guiada simplificada: palabras sueltas,
   avance automático al completar cada palabra, y
   resaltado dinámico de la tecla exacta a pulsar
   en el teclado virtual.
   ============================================ */

const EthosPractice = (() => {
  const FALLBACK_WORDS = ['casa', 'perro', 'sol', 'agua', 'libro', 'mesa', 'rapido', 'feliz'];

  let els = {};
  let board = null;
  let wordBank = [];
  let currentWord = '';
  let cursor = 0;
  let chars = [];
  let wordsCompleted = 0;

  async function loadWordBank() {
    if (wordBank.length) return wordBank;
    try {
      const res = await fetch('data/words.json');
      if (!res.ok) throw new Error('bad response');
      const json = await res.json();
      wordBank = (json.words && json.words.length) ? json.words : FALLBACK_WORDS;
    } catch (e) {
      wordBank = FALLBACK_WORDS;
    }
    return wordBank;
  }

  function updateProgressLabel() {
    if (els.counter) els.counter.textContent = `${wordsCompleted} palabras completadas`;
  }

  async function nextWord() {
    await loadWordBank();
    cursor = 0;
    currentWord = EthosUtils.randomChoice(wordBank);
    chars = currentWord.split('').map(ch => ({ value: ch, status: null }));
    render();
    if (board) EthosKeyboard.highlightNextKey(board, chars[0] ? chars[0].value : null);
    els.hiddenInput.value = '';
    els.hiddenInput.focus();
  }

  function render() {
    els.textDisplay.innerHTML = chars.map((c, i) => {
      let cls = 'char';
      if (i < cursor) cls += c.status === 'incorrect' ? ' incorrect' : ' correct';
      if (i === cursor) cls += ' current';
      return `<span class="${cls}" data-idx="${i}">${EthosUtils.escapeHtml(c.value)}</span>`;
    }).join('');
  }

  function onInput(e) {
    const inputChar = e.data;
    if (!inputChar || cursor >= chars.length) return;
    els.hiddenInput.value = '';

    const expected = chars[cursor].value;
    const isCorrect = inputChar.toLowerCase() === expected.toLowerCase();
    chars[cursor].status = isCorrect ? 'correct' : 'incorrect';
    cursor += 1;
    render();

    if (cursor >= chars.length) {
      wordsCompleted += 1;
      updateProgressLabel();
      if (board) EthosKeyboard.clearNextKey(board);
      setTimeout(nextWord, 260);
    } else if (board) {
      EthosKeyboard.highlightNextKey(board, chars[cursor].value);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (cursor > 0) {
        cursor -= 1;
        chars[cursor].status = null;
        render();
        if (board) EthosKeyboard.highlightNextKey(board, chars[cursor].value);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      nextWord();
    }
  }

  function init(refs, boardEl) {
    els = refs;
    board = boardEl;
    wordsCompleted = 0;
    updateProgressLabel();

    els.hiddenInput.addEventListener('input', onInput);
    els.hiddenInput.addEventListener('keydown', onKeyDown);
    els.textDisplay.addEventListener('click', () => els.hiddenInput.focus());
    if (els.nextBtn) els.nextBtn.addEventListener('click', nextWord);

    nextWord();
  }

  return { init, nextWord };
})();
