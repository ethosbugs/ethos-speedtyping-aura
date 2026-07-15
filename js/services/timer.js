/* ============================================
   Ethos Speedtyping v7 — timer.js
   ============================================ */

class EthosTimer {
  constructor({ mode = 'time', duration = 30, onTick, onEnd } = {}) {
    this.mode = mode; // 'time' countdown, 'words' counts up (untimed cap)
    this.duration = duration;
    this.elapsed = 0;
    this.onTick = onTick || (() => {});
    this.onEnd = onEnd || (() => {});
    this._interval = null;
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this._interval = setInterval(() => {
      this.elapsed += 0.1;
      if (this.mode === 'time') {
        const remaining = Math.max(0, this.duration - this.elapsed);
        this.onTick(remaining, this.elapsed);
        if (remaining <= 0) this.stop(true);
      } else {
        this.onTick(this.elapsed, this.elapsed);
      }
    }, 100);
  }

  stop(triggeredEnd = false) {
    if (this._interval) clearInterval(this._interval);
    this._interval = null;
    this.running = false;
    if (triggeredEnd) this.onEnd(this.elapsed);
  }

  reset(duration = this.duration) {
    this.stop(false);
    this.duration = duration;
    this.elapsed = 0;
  }

  getElapsedSeconds() {
    return this.elapsed;
  }
}
