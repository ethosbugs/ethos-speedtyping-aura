/* ============================================
   Ethos Speedtyping v7.3 — keyboard.js
   Teclado virtual: guías F/J permanentes,
   resaltado en vivo de la tecla pulsada y
   resaltado dinámico de la SIGUIENTE tecla a
   presionar (usado en Práctica Interactiva).
   Se activa/desactiva vía Ajustes.
   ============================================ */

const EthosKeyboard = (() => {
  const KEY_MAP = {
    Space: 'SPACE',
    Enter: 'ENTER',
    Comma: 'COMMA',
    Period: 'PERIOD',
    Minus: 'MINUS',
  };

  // Traduce un carácter de texto (el que el usuario debe escribir) al
  // identificador data-key del teclado visual.
  function charToKeyId(char) {
    if (char == null) return null;
    if (char === ' ') return 'SPACE';
    const upper = char.toUpperCase();
    if (upper === 'Ñ') return 'Ñ';
    if (upper === ',') return 'COMMA';
    if (upper === '.') return 'PERIOD';
    if (upper === '-') return 'MINUS';
    if (/^[A-ZÑ]$/.test(upper)) return upper;
    return null;
  }

  function resolveKeyId(e) {
    const upper = (e.key || '').toUpperCase();
    if (upper === 'Ñ') return 'Ñ';
    if (upper === ',' || e.code === 'Comma') return 'COMMA';
    if (upper === '.' || e.code === 'Period') return 'PERIOD';
    if (upper === '-' || e.code === 'Minus') return 'MINUS';
    if (KEY_MAP[e.code]) return KEY_MAP[e.code];
    if (e.code && e.code.startsWith('Key')) return e.code.replace('Key', '');
    return null;
  }

  function applyGuideKeys(boardEl) {
    if (!boardEl) return;
    const keyF = boardEl.querySelector('[data-key="F"]');
    const keyJ = boardEl.querySelector('[data-key="J"]');
    if (keyF) keyF.classList.add('key-guide');
    if (keyJ) keyJ.classList.add('key-guide');
  }

  function pressVisual(boardEl, keyId, isDown) {
    if (!boardEl || !keyId) return;
    const el = boardEl.querySelector(`[data-key="${keyId}"]`);
    if (!el) return;
    el.classList.toggle('active-press', isDown);
  }

  // Resalta dinámicamente la siguiente tecla a presionar (para práctica guiada).
  function highlightNextKey(boardEl, char) {
    if (!boardEl) return;
    boardEl.querySelectorAll('.key-target').forEach(el => el.classList.remove('key-target'));
    const keyId = charToKeyId(char);
    if (!keyId) return;
    const el = boardEl.querySelector(`[data-key="${keyId}"]`);
    if (el) el.classList.add('key-target');
  }

  function clearNextKey(boardEl) {
    if (!boardEl) return;
    boardEl.querySelectorAll('.key-target').forEach(el => el.classList.remove('key-target'));
  }

  // Enlaza un input (hidden input de la app) a uno o varios teclados visuales.
  function bindInput(inputEl, boardEls) {
    if (!inputEl) return;
    inputEl.addEventListener('keydown', (e) => {
      const keyId = resolveKeyId(e);
      boardEls.forEach(board => pressVisual(board, keyId, true));
    });
    inputEl.addEventListener('keyup', (e) => {
      const keyId = resolveKeyId(e);
      boardEls.forEach(board => pressVisual(board, keyId, false));
    });
  }

  function setVisible(boardEl, visible) {
    if (!boardEl) return;
    boardEl.style.display = visible ? '' : 'none';
  }

  function init() {
    const mainBoard = document.getElementById('mainKeyboard');
    const practiceBoard = document.getElementById('digitalKeyboard');

    [mainBoard, practiceBoard].forEach(applyGuideKeys);

    const showKeyboard = EthosSettings.get('showVirtualKeyboard');
    setVisible(mainBoard, showKeyboard);
    setVisible(practiceBoard, showKeyboard);

    const toggle = document.getElementById('virtualKeyboardToggle');
    if (toggle) {
      toggle.checked = showKeyboard;
      toggle.addEventListener('change', () => {
        EthosSettings.set('showVirtualKeyboard', toggle.checked);
        setVisible(mainBoard, toggle.checked);
        setVisible(practiceBoard, toggle.checked);
      });
    }

    return { mainBoard, practiceBoard };
  }

  return {
    init, bindInput, applyGuideKeys, setVisible, resolveKeyId,
    charToKeyId, highlightNextKey, clearNextKey,
  };
})();
