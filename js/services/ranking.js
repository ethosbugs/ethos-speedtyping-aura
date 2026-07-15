/* ============================================
   Ethos Speedtyping v7.3 — ranking.js
   Clasificación por PUNTUACIÓN COMBINADA:
   media ponderada entre dos métricas normalizadas
   dentro del grupo (bots + usuario real):
     · Métrica A (Rendimiento): mejor WPM histórico
     · Métrica B (Constancia): tests completados
   Pesos configurables (por defecto 50/50).
   ============================================ */

const EthosRanking = (() => {
  const WEIGHT_WPM = 0.5;
  const WEIGHT_TESTS = 0.5;

  const BOTS = [
    { name: 'AlphaKeys_Pro', bestWpm: 105, tests: 38 },
    { name: 'MecaMaster_99', bestWpm: 88, tests: 64 },
    { name: 'TypingWarrior', bestWpm: 61, tests: 22 },
    { name: 'KeyCat', bestWpm: 70, tests: 12 },
    { name: 'ScribeBot', bestWpm: 52, tests: 5 },
  ];

  const TIERS = [
    { id: 'bronze', min: 0, label: 'Recluta (Bronce)', next: 25 },
    { id: 'silver', min: 25, label: 'Iniciado Avanzado (Plata)', next: 50 },
    { id: 'gold', min: 50, label: 'Veterano (Oro)', next: 75 },
    { id: 'diamond', min: 75, label: 'Leyenda Constante (Diamante)', next: null },
  ];

  function getTier(score) {
    let tier = TIERS[0];
    for (const t of TIERS) {
      if (score >= t.min) tier = t;
    }
    return tier;
  }

  // Normaliza WPM y tests dentro del grupo (0-1) y calcula la media ponderada (0-100).
  function computeScores(players) {
    const maxWpm = Math.max(...players.map(p => p.bestWpm), 1);
    const maxTests = Math.max(...players.map(p => p.tests), 1);
    return players.map(p => {
      const normWpm = p.bestWpm / maxWpm;
      const normTests = p.tests / maxTests;
      const score = (normWpm * WEIGHT_WPM + normTests * WEIGHT_TESTS) * 100;
      return { ...p, score: Math.round(score * 10) / 10 };
    });
  }

  function buildPool() {
    const agg = EthosStats.getAggregate();
    const username = EthosProfile.getName();
    return [
      ...BOTS.map(b => ({ ...b, isUser: false })),
      { name: `${username} (Tú)`, bestWpm: agg.bestWpm, tests: agg.testsCompleted, isUser: true },
    ];
  }

  function renderProfileRank() {
    const pool = computeScores(buildPool());
    const user = pool.find(p => p.isUser);
    const tier = getTier(user.score);

    const rankLabel = document.getElementById('userRank');
    const xpBarFill = document.getElementById('xpBarFill');
    const xpCurrent = document.getElementById('xpCurrent');
    const xpGoal = document.getElementById('xpGoal');

    if (rankLabel) {
      rankLabel.textContent = tier.label;
      rankLabel.className = 'rank-badge rank-' + tier.id;
    }
    if (xpCurrent) xpCurrent.textContent = `${user.score} pts (media WPM + constancia)`;
    if (xpGoal) {
      xpGoal.textContent = tier.next
        ? `Siguiente Rango: ${tier.next} pts`
        : 'Rango Máximo Alcanzado';
    }
    if (xpBarFill) {
      const floor = tier.min;
      const ceiling = tier.next || Math.max(tier.min + 25, user.score);
      const progress = EthosUtils.clamp((user.score - floor) / (ceiling - floor), 0, 1);
      xpBarFill.style.width = Math.round(progress * 100) + '%';
    }
  }

  function renderLeaderboard() {
    const tbody = document.getElementById('rankingLeaderboardBody');
    if (!tbody) return;

    const pool = computeScores(buildPool()).sort((a, b) => b.score - a.score);

    tbody.innerHTML = '';
    pool.forEach((row, idx) => {
      const tr = document.createElement('tr');
      if (row.isUser) tr.classList.add('is-user');
      tr.innerHTML = `
        <td>${idx + 1}º</td>
        <td>${EthosUtils.escapeHtml(row.name)}</td>
        <td>${row.bestWpm} WPM</td>
        <td>${row.tests}</td>
        <td><strong>${row.score}</strong></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderAll() {
    renderProfileRank();
    renderLeaderboard();
  }

  return { getTier, computeScores, renderProfileRank, renderLeaderboard, renderAll };
})();
