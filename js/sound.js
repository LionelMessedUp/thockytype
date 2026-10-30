/* thockytype — mesin suara keyboard mechanical
 * Semua bunyi disintesis pakai Web Audio API: tidak ada file audio,
 * tidak ada network request, dan tiap ketukan sedikit berbeda
 * supaya tidak terdengar seperti mesin fotokopi.
 */
(function (global) {
  'use strict';

  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  // Tiap profil = karakter bunyi yang berbeda.
  // bodyFreq  : frekuensi "thock" di bagian bawah (Hz)
  // clickFreq : resonansi noise "clack" (Hz)
  var PROFILES = {
    thock: {
      label: 'Thock',
      bodyFreq: 84, bodyGain: 0.95, bodyDecay: 0.095, bodyType: 'sine',
      clickFreq: 1750, clickQ: 1.1, clickGain: 0.28, clickDecay: 0.025,
      airFreq: 5400, airGain: 0.09,
      doubleClick: 0
    },
    cream: {
      label: 'Cream',
      bodyFreq: 112, bodyGain: 0.78, bodyDecay: 0.068, bodyType: 'sine',
      clickFreq: 2450, clickQ: 1.5, clickGain: 0.33, clickDecay: 0.020,
      airFreq: 6000, airGain: 0.11,
      doubleClick: 0
    },
    clack: {
      label: 'Clack',
      bodyFreq: 148, bodyGain: 0.60, bodyDecay: 0.048, bodyType: 'triangle',
      clickFreq: 3300, clickQ: 2.3, clickGain: 0.50, clickDecay: 0.030,
      airFreq: 7200, airGain: 0.15,
      doubleClick: 0
    },
    clicky: {
      label: 'Clicky',
      bodyFreq: 132, bodyGain: 0.62, bodyDecay: 0.042, bodyType: 'triangle',
      clickFreq: 4700, clickQ: 3.6, clickGain: 0.72, clickDecay: 0.011,
      airFreq: 8200, airGain: 0.24,
      doubleClick: 0.013
    },
    linear: {
      label: 'Linear',
      bodyFreq: 76, bodyGain: 0.86, bodyDecay: 0.072, bodyType: 'sine',
      clickFreq: 900, clickQ: 0.7, clickGain: 0.12, clickDecay: 0.034,
      airFreq: 4200, airGain: 0.05,
      doubleClick: 0
    }
  };

  function ThockEngine() {
    this.ctx = null;
    this.noise = null;
    this.master = null;
    this.comp = null;
    this.enabled = true;
    this.volume = 0.55;
    this.profile = 'thock';
  }

  ThockEngine.prototype.ensure = function () {
    if (this.ctx) return this.ctx;
    var Ctx = global.AudioContext || global.webkitAudioContext;
    if (!Ctx) return null;

    var ctx = new Ctx();
    this.ctx = ctx;

    // Satu buffer white noise dipakai ulang oleh semua ketukan.
    var len = Math.floor(ctx.sampleRate * 1.5);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noise = buf;

    var master = ctx.createGain();
    master.gain.value = this.enabled ? this.volume : 0;

    // Compressor + makeup: menjaga tetap "punchy" saat mengetik cepat
    // tanpa bikin tiap ketukan jadi terlalu pelan.
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -8;
    comp.knee.value = 6;
    comp.ratio.value = 3;
    comp.attack.value = 0.003;
    comp.release.value = 0.14;

    var makeup = ctx.createGain();
    makeup.gain.value = 2.6;

    master.connect(comp);
    comp.connect(makeup);
    makeup.connect(ctx.destination);

    this.master = master;
    this.comp = comp;
    this.makeup = makeup;
    return ctx;
  };

  ThockEngine.prototype.setVolume = function (v) {
    this.volume = clamp(v, 0, 1);
    if (this.master) this.master.gain.value = this.enabled ? this.volume : 0;
  };

  ThockEngine.prototype.setEnabled = function (on) {
    this.enabled = !!on;
    // Jangan paksa bikin AudioContext di luar gestur user — browser akan menolaknya.
    if (this.master) this.master.gain.value = this.enabled ? this.volume : 0;
  };

  ThockEngine.prototype.setProfile = function (name) {
    if (PROFILES[name]) this.profile = name;
  };

  ThockEngine.prototype.profiles = function () {
    return Object.keys(PROFILES);
  };

  // ---------------------------------------------------------------------
  // Helper: satu tembakan noise yang difilter.
  // ---------------------------------------------------------------------
  ThockEngine.prototype._noiseHit = function (ctx, t, dest, freq, q, gain, decay, type) {
    if (gain <= 0.002) return;

    var src = ctx.createBufferSource();
    src.buffer = this.noise;

    var maxOff = Math.max(0, this.noise.duration - 0.35);
    var off = Math.random() * maxOff;
    var dur = Math.min(0.3, Math.max(0.02, decay * 5));
    try {
      src.start(t, off, dur);
    } catch (e) {
      src.start(t);
    }

    var f = ctx.createBiquadFilter();
    f.type = type || 'bandpass';
    f.frequency.setValueAtTime(clamp(freq, 40, 16000), t);
    f.Q.value = type === 'highpass' ? 0.7 : clamp(q, 0.3, 12);

    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0003, gain), t + 0.0012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.008, decay));

    src.connect(f);
    f.connect(g);
    g.connect(dest);
  };

  // ---------------------------------------------------------------------
  // play(kind, pan)
  // kind: 'char' | 'space' | 'enter' | 'backspace' | 'release'
  // pan : -1 .. 1 (posisi tombol di papan, kiri-kanan)
  // ---------------------------------------------------------------------
  ThockEngine.prototype.play = function (kind, pan) {
    if (!this.enabled || this.volume <= 0) return;

    var ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') { ctx.resume(); }

    var cfg = PROFILES[this.profile] || PROFILES.thock;
    var now = ctx.currentTime + 0.001;
    var rnd = function (a, b) { return a + Math.random() * (b - a); };

    // Sedikit acak per ketukan: bikin suara tidak monoton.
    var pitch = rnd(0.92, 1.08);
    var amp = rnd(0.86, 1.08);

    var bodyFreq = cfg.bodyFreq * pitch;
    var bodyGain = cfg.bodyGain * amp;
    var bodyDecay = cfg.bodyDecay * rnd(0.9, 1.12);
    var clickFreq = cfg.clickFreq * pitch;
    var clickGain = cfg.clickGain * amp;
    var clickDecay = cfg.clickDecay * rnd(0.9, 1.15);
    var airGain = cfg.airGain * amp;

    if (kind === 'space') {
      bodyFreq *= 0.62;
      bodyDecay *= 2.1;
      bodyGain *= 1.35;
      clickFreq *= 0.50;
      clickGain *= 0.55;
      airGain *= 0.6;
    } else if (kind === 'enter') {
      bodyFreq *= 0.78;
      bodyDecay *= 1.6;
      bodyGain *= 1.15;
      clickFreq *= 0.80;
    } else if (kind === 'backspace') {
      bodyFreq *= 1.10;
      bodyDecay *= 0.85;
      clickGain *= 0.90;
    } else if (kind === 'release') {
      bodyGain *= 0.24;
      clickGain *= 0.55;
      airGain *= 0.55;
      bodyDecay *= 0.55;
      clickDecay *= 0.6;
    }

    // Rantai output per ketukan (biar bisa dipanning sendiri-sendiri).
    var out = ctx.createGain();
    out.gain.value = kind === 'release' ? 0.55 : 1;

    if (ctx.createStereoPanner) {
      var panner = ctx.createStereoPanner();
      panner.pan.value = clamp(pan || 0, -1, 1) * 0.45;
      out.connect(panner);
      panner.connect(this.master);
    } else {
      out.connect(this.master);
    }

    // ---- 1. body: "thock" rendah ----
    var osc = ctx.createOscillator();
    osc.type = cfg.bodyType || 'sine';
    osc.frequency.setValueAtTime(Math.max(30, bodyFreq), now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(24, bodyFreq * 0.62), now + bodyDecay);

    var og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, now);
    og.gain.exponentialRampToValueAtTime(Math.max(0.0004, bodyGain), now + 0.0016);
    og.gain.exponentialRampToValueAtTime(0.0001, now + bodyDecay);

    osc.connect(og);
    og.connect(out);
    osc.start(now);
    osc.stop(now + bodyDecay + 0.03);

    // ---- 2. harmonik tipis: memberi tekstur kayu/plastik ----
    if (bodyGain > 0.04) {
      var h = ctx.createOscillator();
      h.type = 'triangle';
      h.frequency.setValueAtTime(bodyFreq * 2.02, now);
      h.frequency.exponentialRampToValueAtTime(Math.max(30, bodyFreq * 1.45), now + bodyDecay * 0.6);

      var hg = ctx.createGain();
      hg.gain.setValueAtTime(0.0001, now);
      hg.gain.exponentialRampToValueAtTime(Math.max(0.0003, bodyGain * 0.22), now + 0.002);
      hg.gain.exponentialRampToValueAtTime(0.0001, now + bodyDecay * 0.7);

      h.connect(hg);
      hg.connect(out);
      h.start(now);
      h.stop(now + bodyDecay);
    }

    // ---- 3. click: resonansi noise saat switch menyentuh bottom-out ----
    this._noiseHit(ctx, now, out, clickFreq, cfg.clickQ, clickGain, clickDecay, 'bandpass');

    // ---- 4. air: "tink" tajam frekuensi tinggi ----
    this._noiseHit(ctx, now + 0.0008, out, cfg.airFreq * pitch, 0.8, airGain, 0.013, 'highpass');

    // ---- 5. clicky punya dua klik (press + release switch) ----
    if (cfg.doubleClick) {
      this._noiseHit(ctx, now + cfg.doubleClick, out, clickFreq * 1.35, cfg.clickQ, clickGain * 0.65, clickDecay * 0.85, 'bandpass');
    }

    // ---- 6. spacebar: ada rattle stabilizer ----
    if (kind === 'space') {
      this._noiseHit(ctx, now + 0.004, out, 640, 1.6, 0.15 * amp, 0.09, 'bandpass');
      this._noiseHit(ctx, now + 0.021, out, 330, 1.2, 0.10 * amp, 0.12, 'bandpass');
    }

    // ---- 7. enter: bottom-out ganda ala big key ----
    if (kind === 'enter') {
      this._noiseHit(ctx, now + 0.012, out, 420, 1.4, 0.09 * amp, 0.10, 'bandpass');
    }
  };

  global.ThockEngine = ThockEngine;
  global.TT_PROFILES = Object.keys(PROFILES);
})(window);
