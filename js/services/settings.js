/* ============================================
   Ethos Speedtyping v7.3 — settings.js
   ============================================ */

const EthosSettings = (() => {
  const DEFAULTS = {
    soundEnabled: true,
    ignoreCase: false,
    ignorePunctuation: false,
    showVirtualKeyboard: true,
    duration: 15,
    mode: 'time',
    wordGoal: 10,
    category: 'spanish',
  };

  let current = { ...DEFAULTS, ...EthosUtils.storageGet('settings', {}) };

  function get(key) {
    return key ? current[key] : { ...current };
  }

  function set(key, value) {
    current[key] = value;
    EthosUtils.storageSet('settings', current);
  }

  function update(patch) {
    current = { ...current, ...patch };
    EthosUtils.storageSet('settings', current);
  }

  return { get, set, update, DEFAULTS };
})();
