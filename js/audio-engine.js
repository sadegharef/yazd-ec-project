/**
 * موتور صوتی فضایی مبتنی بر Web Audio API
 * پشتیبانی از حفظ وضعیت صدا بین صفحات + افکت‌های صوتی اختصاصی برای ۹ بخش بوم کسب‌وکار و کارگاه‌ها
 */
class SpatialAudioEngine {
  constructor() {
    this.ctx = null;
    const savedState = localStorage.getItem('yazd_ec_audio_enabled');
    this.enabled = savedState !== null ? JSON.parse(savedState) : true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('yazd_ec_audio_enabled', JSON.stringify(this.enabled));
    if (this.enabled) {
      this.playClick(660, 0.06);
    }
    return this.enabled;
  }

  // صدای کلیک ظریف رابط کاربری فضایی
  playClick(freq = 520, duration = 0.045) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.35, now + duration);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  // آکورد صوتی اختصاصی و متفاوت برای هر یک از ۹ بخش بوم مدل کسب‌وکار (BMC)
  playBMCSectionReaction(sectionIndex = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // ۹ گام موسیقی متمایز متناسب با ۹ بلوک بوم کسب‌وکار
    const chords = [
      [440, 554.37, 659.25],     // ۱. شرکای کلیدی (A Major)
      [493.88, 622.25, 739.99],  // ۲. فعالیت‌های کلیدی (B Major)
      [523.25, 659.25, 783.99],  // ۳. ارزش پیشنهادی (C Major)
      [587.33, 739.99, 880],     // ۴. ارتباط با مشتری (D Major)
      [659.25, 830.61, 987.77],  // ۵. بخش‌های مشتریان (E Major)
      [349.23, 440, 523.25],     // ۶. منابع کلیدی (F Major)
      [392.00, 493.88, 587.33],  // ۷. کانال‌ها (G Major)
      [329.63, 415.30, 493.88],  // ۸. ساختار هزینه‌ها (E Harm)
      [523.25, 659.25, 1046.50]  // ۹. جریان‌های درآمدی (صدای درخشش سکه)
    ];

    const notes = chords[sectionIndex % chords.length];
    notes.forEach((note, idx) => {
      const now = this.ctx.currentTime + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = sectionIndex === 8 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(note, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);
    });
  }

  // صدای هرس کردن ایده ضعیف در کارگاه تفکر واگرا
  playPruneSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  // صدای هشدار تشخیص ضدالگو در استودیوی سناریو
  playWarningBuzz() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(165, now);
    osc.frequency.setValueAtTime(135, now + 0.1);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.24);
  }
}

window.spatialAudio = new SpatialAudioEngine();