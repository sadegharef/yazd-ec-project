/**
 * موتور صوتی میکرو-تعامل مبتنی بر Web Audio API
 * پیش‌فرض بی‌صدا جهت آرامش هنگام مطالعه؛ قابل فعال‌سازی از نوار بالا با ذخیره وضعیت
 */
class SpatialAudioEngine {
  constructor() {
    this.ctx = null;
    try {
      const savedState = localStorage.getItem('yazd_ec_audio_enabled');
      this.enabled = savedState !== null ? JSON.parse(savedState) : false;
    } catch {
      this.enabled = false;
    }
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      this.ctx = null;
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('yazd_ec_audio_enabled', JSON.stringify(this.enabled));
    } catch {
      // نادیده گرفتن محدودیت ذخیره‌سازی
    }
    if (this.enabled) {
      this.playSuccess();
    }
    return this.enabled;
  }

  playClick(freq = 540, duration = 0.04) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + duration);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.055;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.032, now);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.24);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.24);
    });
  }

  playBMCSectionReaction(sectionIndex = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const chords = [
      [440, 554.37, 659.25],
      [493.88, 622.25, 739.99],
      [523.25, 659.25, 783.99],
      [587.33, 739.99, 880],
      [659.25, 830.61, 987.77],
      [349.23, 440, 523.25],
      [392.0, 493.88, 587.33],
      [329.63, 415.3, 493.88],
      [523.25, 659.25, 1046.5]
    ];

    const notes = chords[sectionIndex % chords.length];
    notes.forEach((note, idx) => {
      const now = this.ctx.currentTime + idx * 0.045;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = sectionIndex === 8 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(note, now);

      gain.gain.setValueAtTime(0.032, now);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    });
  }

  playPruneSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playWarningBuzz() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.setValueAtTime(150, now + 0.08);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }
}

window.spatialAudio = new SpatialAudioEngine();
