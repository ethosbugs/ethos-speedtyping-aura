/* ============================================
   Ethos Speedtyping v7 — stats.js
   ============================================ */

const EthosStats = (() => {
  const AGG_KEY = 'aggregateStats';

  const DEFAULT_AGG = {
    testsCompleted: 0,
    bestWpm: 0,
    bestAccuracy: 0,
    totalCharsTyped: 0,
    totalTimeSeconds: 0,
    totalWpm: 0, // sum, used to compute average
    totalAccuracy: 0, // sum
  };

  function calcWpm(correctChars, elapsedSeconds) {
    if (elapsedSeconds <= 0) return 0;
    const words = correctChars / 5;
    const minutes = elapsedSeconds / 60;
    return Math.round(words / minutes);
  }

  function calcAccuracy(correctChars, totalTypedChars) {
    if (totalTypedChars <= 0) return 100;
    return EthosUtils.clamp(Math.round((correctChars / totalTypedChars) * 100), 0, 100);
  }

  function getAggregate() {
    return EthosUtils.storageGet(AGG_KEY, { ...DEFAULT_AGG });
  }

  function recordSession(session) {
    // session = { wpm, accuracy, correctChars, totalChars, elapsedSeconds, category, mode, timestamp }
    const agg = getAggregate();
    agg.testsCompleted += 1;
    agg.bestWpm = Math.max(agg.bestWpm, session.wpm);
    agg.bestAccuracy = Math.max(agg.bestAccuracy, session.accuracy);
    agg.totalCharsTyped += session.totalChars;
    agg.totalTimeSeconds += session.elapsedSeconds;
    agg.totalWpm += session.wpm;
    agg.totalAccuracy += session.accuracy;
    EthosUtils.storageSet(AGG_KEY, agg);
    return agg;
  }

  function getAverageWpm() {
    const agg = getAggregate();
    if (agg.testsCompleted === 0) return 0;
    return Math.round(agg.totalWpm / agg.testsCompleted);
  }

  function getAverageAccuracy() {
    const agg = getAggregate();
    if (agg.testsCompleted === 0) return 100;
    return Math.round(agg.totalAccuracy / agg.testsCompleted);
  }

  function reset() {
    EthosUtils.storageSet(AGG_KEY, { ...DEFAULT_AGG });
  }

  return {
    calcWpm,
    calcAccuracy,
    getAggregate,
    recordSession,
    getAverageWpm,
    getAverageAccuracy,
    reset,
  };
})();
