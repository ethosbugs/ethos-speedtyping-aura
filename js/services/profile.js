/* ============================================
   Ethos Speedtyping v7 — profile.js
   ============================================ */

const EthosProfile = (() => {
  const NAME_KEY = 'profileName';
  const XP_PER_TEST = 15;
  const XP_PER_100_CHARS = 4;

  function getName() {
    return EthosUtils.storageGet(NAME_KEY, 'Mecanógrafo');
  }

  function setName(name) {
    const clean = (name || '').trim().slice(0, 24) || 'Mecanógrafo';
    EthosUtils.storageSet(NAME_KEY, clean);
    return clean;
  }

  function getInitials(name) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('');
  }

  function calcXp(agg) {
    return Math.round(
      agg.testsCompleted * XP_PER_TEST +
      (agg.totalCharsTyped / 100) * XP_PER_100_CHARS
    );
  }

  // XP required to reach level n grows quadratically for a satisfying curve.
  function xpForLevel(level) {
    return Math.round(50 * Math.pow(level, 1.6));
  }

  function getLevelInfo(xp) {
    let level = 1;
    while (xp >= xpForLevel(level + 1)) level++;
    const currentFloor = xpForLevel(level);
    const nextCeiling = xpForLevel(level + 1);
    const progress = EthosUtils.clamp(
      (xp - currentFloor) / (nextCeiling - currentFloor),
      0,
      1
    );
    return { level, progress, currentFloor, nextCeiling, xp };
  }

  function render(container) {
    const name = getName();
    const agg = EthosStats.getAggregate();
    const xp = calcXp(agg);
    const levelInfo = getLevelInfo(xp);

    container.innerHTML = `
      <div class="glass-panel profile-header" style="--level-progress:${Math.round(levelInfo.progress * 100)}%">
        <div class="avatar-ring">
          <div class="avatar-inner">${EthosUtils.escapeHtml(getInitials(name))}</div>
        </div>
        <div style="flex:1">
          <div class="profile-name-row">
            <input class="profile-name-input" id="profileNameInput" value="${EthosUtils.escapeHtml(name)}" maxlength="24" />
            <span class="level-badge">Nivel ${levelInfo.level}</span>
          </div>
          <div class="profile-sub">${xp} XP totales · ${agg.testsCompleted} tests completados</div>
          <div class="xp-bar-track">
            <div class="xp-bar-fill" style="width:${Math.round(levelInfo.progress * 100)}%"></div>
          </div>
        </div>
      </div>

      <div class="glass-panel">
        <div class="profile-grid">
          <div class="profile-stat-card">
            <div class="metric-value">${agg.bestWpm}</div>
            <div class="metric-label">Mejor WPM</div>
          </div>
          <div class="profile-stat-card">
            <div class="metric-value">${EthosStats.getAverageWpm()}</div>
            <div class="metric-label">WPM promedio</div>
          </div>
          <div class="profile-stat-card">
            <div class="metric-value">${agg.bestAccuracy}%</div>
            <div class="metric-label">Mejor precisión</div>
          </div>
          <div class="profile-stat-card">
            <div class="metric-value">${EthosUtils.formatTime(agg.totalTimeSeconds)}</div>
            <div class="metric-label">Tiempo total</div>
          </div>
          <div class="profile-stat-card">
            <div class="metric-value">${agg.totalCharsTyped}</div>
            <div class="metric-label">Caracteres escritos</div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('profileNameInput').addEventListener('change', (e) => {
      const saved = setName(e.target.value);
      e.target.value = saved;
      EthosUtils.showToast('Nombre actualizado');
    });
  }

  return { getName, setName, calcXp, getLevelInfo, render };
})();
