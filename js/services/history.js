/* ============================================
   Ethos Speedtyping v7 — history.js
   ============================================ */

const EthosHistory = (() => {
  const HISTORY_KEY = 'sessionHistory';
  const MAX_ENTRIES = 200;

  function getAll() {
    return EthosUtils.storageGet(HISTORY_KEY, []);
  }

  function add(entry) {
    const list = getAll();
    list.unshift({ id: EthosUtils.uid(), ...entry });
    if (list.length > MAX_ENTRIES) list.length = MAX_ENTRIES;
    EthosUtils.storageSet(HISTORY_KEY, list);
    return list;
  }

  function clear() {
    EthosUtils.storageSet(HISTORY_KEY, []);
  }

  function getRecent(n = 20) {
    return getAll().slice(0, n);
  }

  function renderChart(container, entries) {
    container.innerHTML = '';
    if (!entries.length) {
      container.innerHTML = '<div class="chart-empty">Completa un test para ver tu progreso aquí.</div>';
      return;
    }
    const ordered = [...entries].reverse().slice(-24);
    const max = Math.max(...ordered.map(e => e.wpm), 10);
    ordered.forEach(entry => {
      const bar = document.createElement('div');
      bar.className = 'chart-bar bar-fill';
      const heightPct = Math.max(4, Math.round((entry.wpm / max) * 100));
      bar.style.height = heightPct + '%';
      bar.title = `${entry.wpm} WPM · ${entry.accuracy}% · ${EthosUtils.formatDate(entry.timestamp)}`;
      container.appendChild(bar);
    });
  }

  function renderList(container, entries) {
    container.innerHTML = '';
    if (!entries.length) {
      container.innerHTML = '<div class="chart-empty">Aún no hay sesiones registradas.</div>';
      return;
    }
    entries.forEach(entry => {
      const row = document.createElement('div');
      row.className = 'history-row';
      row.innerHTML = `
        <div>
          <div class="h-wpm">${entry.wpm} WPM</div>
          <div class="h-meta">${entry.accuracy}% precisión · ${entry.category}</div>
        </div>
        <div class="h-meta">${EthosUtils.formatDate(entry.timestamp)}</div>
      `;
      container.appendChild(row);
    });
  }

  return { getAll, add, clear, getRecent, renderChart, renderList };
})();
