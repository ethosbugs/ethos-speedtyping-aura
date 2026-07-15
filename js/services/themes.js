/* ============================================
   Ethos Speedtyping v7.3 — themes.js
   Aplica y persiste el tema. Los swatches ya
   existen en el HTML como .theme-option.
   ============================================ */

const EthosThemes = (() => {
  const THEME_KEY = 'theme';
  const DEFAULT_THEME = 'midnight';

  function apply(themeId) {
    document.body.setAttribute('data-theme', themeId);
    EthosUtils.storageSet(THEME_KEY, themeId);
  }

  function getSaved() {
    return EthosUtils.storageGet(THEME_KEY, DEFAULT_THEME);
  }

  function init() {
    const saved = getSaved();
    apply(saved);

    const options = document.querySelectorAll('.theme-option');
    options.forEach(opt => {
      if (opt.getAttribute('data-theme') === saved) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
      opt.addEventListener('click', () => {
        const chosen = opt.getAttribute('data-theme');
        apply(chosen);
        options.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
      });
    });
  }

  return { apply, getSaved, init };
})();
