/* thockytype — mesin tes mengetik + UI */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  var WORDS = window.TT_WORDS || [];
  var QUOTES = window.TT_QUOTES || [];
  var MODES = ['time', 'words', 'quote'];
  var FONT_OPTIONS = [
    'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Courier New',
    'Consolas', 'Cascadia Code', 'Lucida Console', 'Menlo',
    'Roboto Mono', 'IBM Plex Mono', 'Space Mono', 'DM Mono',
    'Ubuntu Mono', 'Inconsolata'
  ];
  var THEME_OPTIONS = [
    'dark', 'tokyo-night', 'matrix',
    'catppuccin-mocha', 'catppuccin-macchiato', 'catppuccin-frappe'
  ];

  var sound = new window.ThockEngine();

  // ------------------------------------------------------------------
  // elemen
  // ------------------------------------------------------------------
  var dom = {
    wordsWrap: $('#wordsWrap'),
    words: $('#words'),
    caret: $('#caret'),
    timer: $('#timer'),
    hudLabel: $('#hudLabel'),
    liveWpm: $('#liveWpm'),
    liveAcc: $('#liveAcc'),
    progress: $('#progressFill'),
    modeSeg: $('#modeSeg'),
    valueSeg: $('#valueSeg'),
    soundBtn: $('#soundBtn'),
    profileSel: $('#profileSel'),
    fontSel: $('#fontSel'),
    themeSel: $('#themeSel'),
    volume: $('#volume'),
    pulse: $('#pulse'),
    keyboard: $('#keyboard'),
    hint: $('#hint'),

    overlay: $('#results'),
    resWpm: $('#resWpm'),
    resAcc: $('#resAcc'),
    resRaw: $('#resRaw'),
    resCons: $('#resCons'),
    resErr: $('#resErr'),
    resTime: $('#resTime'),
    resChars: $('#resChars'),
    resBest: $('#resBest'),
    resMode: $('#resMode'),
    chart: $('#chart'),
    againBtn: $('#againBtn'),
    closeBtn: $('#closeBtn'),
    modeBtn: $('#modeBtn')
  };

  // ------------------------------------------------------------------
  // settings
  // ------------------------------------------------------------------
  var DEFAULTS = { mode: 'time', duration: 30, wordCount: 25, sound: true, volume: 0.55, profile: 'thock', font: 'JetBrains Mono', theme: 'dark' };

  var settings = (function () {
    var base = {};
    for (var k in DEFAULTS) base[k] = DEFAULTS[k];
    try {
      var raw = JSON.parse(localStorage.getItem('thockytype.settings') || '{}');
      for (var j in raw) {
        if (Object.prototype.hasOwnProperty.call(base, j)) base[j] = raw[j];
      }
    } catch (e) { /* ignore */ }
    if (MODES.indexOf(base.mode) < 0) base.mode = 'time';
    if (FONT_OPTIONS.indexOf(base.font) < 0) base.font = DEFAULTS.font;
    if (THEME_OPTIONS.indexOf(base.theme) < 0) base.theme = DEFAULTS.theme;
    return base;
  })();

  function persist() {
    try { localStorage.setItem('thockytype.settings', JSON.stringify(settings)); } catch (e) { /* ignore */ }
  }

  // ------------------------------------------------------------------
  // state
  // ------------------------------------------------------------------
  var state = {
    mode: settings.mode,
    duration: settings.duration,
    wordCount: settings.wordCount,
    words: [],
    active: 0,
    limit: 0,
    started: false,
    finished: false,
    startTime: 0,
    elapsed: 0,
    timer: null,
    samples: [],
    lastSample: -1,
    keys: { ok: 0, bad: 0 },
    lastWord: ''
  };

  var wordEls = [];
  var scrollOffset = 0;
  var keyMap = {};

  // ------------------------------------------------------------------
  // helper: kata
  // ------------------------------------------------------------------
  function randomWord() {
    if (!WORDS.length) return 'kata';
    var w = WORDS[(Math.random() * WORDS.length) | 0];
    var guard = 0;
    while (w === state.lastWord && guard++ < 8) {
      w = WORDS[(Math.random() * WORDS.length) | 0];
    }
    state.lastWord = w;
    return w;
  }

  function generateWords(n) {
    var out = [];
    for (var i = 0; i < n; i++) out.push({ text: randomWord(), typed: '' });
    return out;
  }

  function randomQuote() {
    if (!QUOTES.length) return 'mengetik adalah keterampilan yang bisa dilatih setiap hari.';
    var q = QUOTES[(Math.random() * QUOTES.length) | 0];
    var guard = 0;
    while (q === state.lastWord && guard++ < 6) {
      q = QUOTES[(Math.random() * QUOTES.length) | 0];
    }
    state.lastWord = q;
    return q;
  }

  // ------------------------------------------------------------------
  // statistik
  // ------------------------------------------------------------------
  function elapsedMs() {
    if (!state.started) return 0;
    return performance.now() - state.startTime;
  }

  function correctChars() {
    var n = 0;
    for (var i = 0; i < state.words.length; i++) {
      var w = state.words[i];
      var t = w.text, ty = w.typed;
      var len = Math.min(t.length, ty.length);
      for (var k = 0; k < len; k++) if (t.charAt(k) === ty.charAt(k)) n++;
    }
    return n;
  }

  function typedChars() {
    var n = 0;
    for (var i = 0; i < state.words.length; i++) n += state.words[i].typed.length;
    return n;
  }

  function wpmNow() {
    var m = elapsedMs() / 60000;
    if (m < 0.006) return 0;
    return Math.round((correctChars() / 5) / m);
  }

  function rawNow() {
    var m = elapsedMs() / 60000;
    if (m < 0.006) return 0;
    return Math.round((typedChars() / 5) / m);
  }

  function accuracyNow() {
    var total = state.keys.ok + state.keys.bad;
    if (!total) return 100;
    return (state.keys.ok / total) * 100;
  }

  function consistency(samples) {
    var vals = [];
    for (var i = 0; i < samples.length; i++) if (samples[i].t > 0) vals.push(samples[i].raw);
    if (vals.length < 2) return 100;
    var mean = 0;
    for (var j = 0; j < vals.length; j++) mean += vals[j];
    mean /= vals.length;
    if (mean <= 0) return 0;
    var sd = 0;
    for (var k = 0; k < vals.length; k++) sd += Math.pow(vals[k] - mean, 2);
    sd = Math.sqrt(sd / vals.length);
    return Math.round(clamp((1 - sd / mean) * 100, 0, 100));
  }

  // ------------------------------------------------------------------
  // render kata
  // ------------------------------------------------------------------
  function buildWords() {
    dom.words.innerHTML = '';
    dom.words.appendChild(dom.caret); // caret hidup di dalam track yang di-scroll
    wordEls = [];
    for (var i = 0; i < state.words.length; i++) appendWordEl(i);
    scrollOffset = 0;
    dom.words.style.transform = 'translateY(0px)';
  }

  function appendWordEl(i) {
    var w = state.words[i];
    var el = document.createElement('span');
    el.className = 'word';

    var letters = [];
    for (var k = 0; k < w.text.length; k++) {
      var s = document.createElement('span');
      s.className = 'ch';
      s.textContent = w.text.charAt(k);
      el.appendChild(s);
      letters.push(s);
    }

    dom.words.appendChild(el);
    wordEls[i] = { el: el, letters: letters, extras: [] };
  }

  function appendWords(n) {
    var start = state.words.length;
    for (var i = 0; i < n; i++) state.words.push({ text: randomWord(), typed: '' });
    for (var j = start; j < state.words.length; j++) appendWordEl(j);
  }

  function ensureWords() {
    if (state.mode !== 'time') return;
    if (state.active > state.words.length - 40) appendWords(120);
  }

  function paintWord(i) {
    var refs = wordEls[i];
    if (!refs) return;

    var w = state.words[i];
    var committed = i < state.active;
    var active = i === state.active;

    refs.el.classList.toggle('active', active);

    for (var k = 0; k < refs.letters.length; k++) {
      var ch = refs.letters[k];
      var typedCh = w.typed.charAt(k);
      var cls = 'ch';
      if (typedCh === '') {
        cls += committed ? ' missed' : '';
      } else if (typedCh === w.text.charAt(k)) {
        cls += ' ok';
      } else {
        cls += ' bad';
      }
      if (ch.className !== cls) ch.className = cls;
    }

    var extraCount = Math.max(0, w.typed.length - w.text.length);
    while (refs.extras.length > extraCount) {
      var dead = refs.extras.pop();
      if (dead.parentNode) dead.parentNode.removeChild(dead);
    }
    while (refs.extras.length < extraCount) {
      var s = document.createElement('span');
      s.className = 'ch bad extra';
      refs.el.appendChild(s);
      refs.extras.push(s);
    }
    for (var e = 0; e < extraCount; e++) {
      refs.extras[e].textContent = w.typed.charAt(w.text.length + e);
    }
  }

  function paintAll() {
    for (var i = 0; i < state.words.length; i++) paintWord(i);
  }

  function lineHeight() {
    var cs = getComputedStyle(dom.words);
    var lh = parseFloat(cs.lineHeight);
    if (isFinite(lh) && lh > 2) return lh;
    return wordEls[0] ? wordEls[0].el.offsetHeight : 40;
  }

  function placeCaret() {
    var refs = wordEls[state.active];
    if (!refs) { dom.caret.style.opacity = '0'; return; }

    var w = state.words[state.active];
    var letters = refs.letters;
    var idx = w.typed.length;

    var anchor = null;
    if (idx === 0) {
      anchor = letters[0];
    } else if (idx <= letters.length) {
      anchor = letters[idx - 1];
    } else {
      anchor = refs.extras[idx - letters.length - 1] || letters[letters.length - 1];
    }
    if (!anchor) { dom.caret.style.opacity = '0'; return; }

    var base = dom.words.getBoundingClientRect();
    var r = anchor.getBoundingClientRect();
    var fs = parseFloat(getComputedStyle(dom.words).fontSize) || 18;
    var caretH = fs * 1.32;

    var x = (r.left - base.left) + (idx === 0 ? 0 : r.width);
    var y = (r.top - base.top) + (r.height - caretH) / 2;

    dom.caret.style.height = caretH.toFixed(1) + 'px';
    dom.caret.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    dom.caret.style.opacity = '1';

    scrollToWord(state.active);
  }

  function scrollToWord(i) {
    var refs = wordEls[i];
    if (!refs) return;
    var lh = lineHeight();
    var row = Math.max(0, Math.round(refs.el.offsetTop / lh) - 1);
    var target = row * lh;
    if (Math.abs(target - scrollOffset) > 0.5) {
      scrollOffset = target;
      dom.words.style.transform = 'translateY(' + (-scrollOffset).toFixed(1) + 'px)';
    }
  }

  // ------------------------------------------------------------------
  // HUD
  // ------------------------------------------------------------------
  function updateHud() {
    if (state.mode === 'time') {
      var remain = Math.max(0, state.duration - state.elapsed);
      dom.timer.textContent = String(Math.ceil(remain));
      dom.hudLabel.textContent = 'sisa waktu';
      dom.timer.classList.toggle('low', state.started && remain <= 5.01);
      dom.progress.style.width = (state.started ? clamp(state.elapsed / state.duration, 0, 1) * 100 : 0) + '%';
    } else {
      dom.timer.textContent = state.active + '/' + state.limit;
      dom.hudLabel.textContent = 'kata';
      dom.timer.classList.remove('low');
      dom.progress.style.width = (state.limit ? clamp(state.active / state.limit, 0, 1) * 100 : 0) + '%';
    }

    dom.liveWpm.textContent = String(wpmNow());
    dom.liveAcc.textContent = Math.round(accuracyNow()) + '%';
  }

  // ------------------------------------------------------------------
  // sound helpers
  // ------------------------------------------------------------------
  var ROW1 = 'qwertyuiop';
  var ROW2 = 'asdfghjkl';
  var ROW3 = 'zxcvbnm';

  function panFor(ch) {
    var c = String(ch).toLowerCase();
    var rows = [ROW1, ROW2, ROW3];
    for (var i = 0; i < rows.length; i++) {
      var idx = rows[i].indexOf(c);
      if (idx >= 0) {
        var n = rows[i].length;
        return ((idx + 0.5) / n - 0.5) * 0.9;
      }
    }
    return 0;
  }

  var pulseTimer = null;
  function hitPulse() {
    if (!dom.pulse) return;
    dom.pulse.classList.remove('hit');
    void dom.pulse.offsetWidth;
    dom.pulse.classList.add('hit');
    clearTimeout(pulseTimer);
    pulseTimer = setTimeout(function () { dom.pulse.classList.remove('hit'); }, 240);
  }

  function playSound(kind, pan) {
    // Suara tidak boleh pernah menghalangi input: kalau audio gagal,
    // karakter tetap harus masuk seperti biasa.
    try {
      sound.play(kind, pan || 0);
    } catch (e) { /* abaikan */ }
    hitPulse();
  }

  function keyLabel(k) {
    return k === ' ' ? ' ' : String(k).toLowerCase();
  }

  // Keycap visual mengikuti tombol fisik (bukan timer): selama tombol
  // ditahan keycap tetap turun, baru naik saat keyup.
  function pressKeyVisual(k) {
    var el = keyMap[keyLabel(k)];
    if (el) el.classList.add('down');
  }

  function releaseKeyVisual(k) {
    var el = keyMap[keyLabel(k)];
    if (el) el.classList.remove('down');
  }

  // ------------------------------------------------------------------
  // keyboard visual
  // ------------------------------------------------------------------
  function buildKeyboard() {
    if (!dom.keyboard) return;
    dom.keyboard.innerHTML = '';
    keyMap = {};

    var rows = [ROW1, ROW2, ROW3];
    var frag = document.createDocumentFragment();

    for (var i = 0; i < rows.length; i++) {
      var rowEl = document.createElement('div');
      rowEl.className = 'kb-row';
      if (i === 1) rowEl.style.paddingLeft = '1.1rem';
      if (i === 2) rowEl.style.paddingLeft = '2.4rem';
      for (var k = 0; k < rows[i].length; k++) {
        var ch = rows[i].charAt(k);
        var key = document.createElement('div');
        key.className = 'kb-key';
        key.textContent = ch;
        rowEl.appendChild(key);
        keyMap[ch] = key;
      }
      frag.appendChild(rowEl);
    }

    var lastRow = document.createElement('div');
    lastRow.className = 'kb-row';
    var space = document.createElement('div');
    space.className = 'kb-key space';
    lastRow.appendChild(space);
    keyMap[' '] = space;
    frag.appendChild(lastRow);

    dom.keyboard.appendChild(frag);
  }

  // ------------------------------------------------------------------
  // siklus tes
  // ------------------------------------------------------------------
  function newTest() {
    if (state.timer) { clearInterval(state.timer); state.timer = null; }

    state.mode = settings.mode;
    state.duration = settings.duration;
    state.wordCount = settings.wordCount;
    state.started = false;
    state.finished = false;
    state.active = 0;
    state.elapsed = 0;
    state.startTime = 0;
    state.samples = [];
    state.lastSample = -1;
    state.keys.ok = 0;
    state.keys.bad = 0;
    state.lastWord = '';

    if (state.mode === 'quote') {
      var text = randomQuote();
      state.words = text.split(/\s+/).map(function (t) { return { text: t, typed: '' }; });
      state.limit = state.words.length;
    } else if (state.mode === 'words') {
      state.words = generateWords(settings.wordCount);
      state.limit = state.words.length;
    } else {
      state.words = generateWords(240);
      state.limit = Infinity;
    }

    buildWords();
    paintAll();
    updateHud();
    if (dom.hint) dom.hint.classList.remove('gone');

    dom.overlay.hidden = true;
    requestAnimationFrame(function () {
      placeCaret();
      scrollToWord(0);
    });
  }

  function startClock() {
    state.started = true;
    state.startTime = performance.now();
    state.elapsed = 0;
    state.timer = setInterval(tick, 100);
    if (dom.hint) dom.hint.classList.add('gone');
    updateHud();
  }

  function tick() {
    if (!state.started || state.finished) return;
    state.elapsed = (performance.now() - state.startTime) / 1000;

    if (state.mode === 'time' && state.elapsed >= state.duration) {
      state.elapsed = state.duration;
      updateHud();
      sampleNow(true);
      finish();
      return;
    }

    updateHud();
    sampleNow(false);
  }

  function sampleNow(force) {
    if (!state.started) return;
    var sec = Math.floor(state.elapsed);
    if (sec === state.lastSample) return;
    state.lastSample = sec;

    // Simpan snapshot kumulatif, lalu ubah jadi wpm per detik (instan).
    var c = correctChars();
    var ty = typedChars();
    var prev = state.samples.length
      ? state.samples[state.samples.length - 1]
      : { t: 0, chars: 0, typed: 0 };
    var dt = Math.max(0.5, sec - prev.t);

    state.samples.push({
      t: sec,
      chars: c,
      typed: ty,
      wpm: Math.round(((c - prev.chars) / 5) * (60 / dt)),
      raw: Math.round(((ty - prev.typed) / 5) * (60 / dt))
    });

    if (force) state.samples[state.samples.length - 1].forced = true;
  }

  // ------------------------------------------------------------------
  // input
  //
  // Input dan suara dipisah total:
  //  - handleChar/handleSpace/handleBackspace HANYA mengurus teks.
  //  - Suara & animasi keycap diurus di onKeyDown/onKeyUp, sekali per
  //    ketukan fisik. Auto-repeat dari OS tetap menghasilkan karakter,
  //    tapi tidak menghasilkan bunyi baru — persis seperti keyboard
  //    mechanical sungguhan yang cuma berbunyi saat switch ditekan.
  // ------------------------------------------------------------------
  var heldKeys = Object.create(null);

  function handleChar(ch) {
    if (state.finished) return;
    if (!state.started) startClock();

    var w = state.words[state.active];
    if (!w) return;
    if (w.typed.length >= w.text.length + 12) return;

    var expected = w.text.charAt(w.typed.length);
    w.typed += ch;

    if (expected === ch) state.keys.ok++;
    else state.keys.bad++;

    paintWord(state.active);
    placeCaret();
    updateHud();
    ensureWords();

    // Kata terakhir sudah lengkap -> tes selesai tanpa perlu menekan spasi.
    if (state.mode !== 'time' && state.active === state.limit - 1 && w.typed === w.text) {
      setTimeout(finish, 140);
    }
  }

  function handleSpace() {
    if (state.finished || !state.started) return;

    var w = state.words[state.active];
    if (!w || w.typed.length === 0) return;

    state.keys.ok++;
    state.active++;

    if (state.mode === 'time') {
      ensureWords();
      if (state.active >= state.words.length) appendWords(120);
    } else if (state.active >= state.limit) {
      finish();
      return;
    }

    paintWord(state.active - 1);
    paintWord(state.active);
    placeCaret();
    updateHud();
  }

  function handleBackspace() {
    if (state.finished || !state.started) return;

    var w = state.words[state.active];
    if (!w) return;

    if (w.typed.length > 0) {
      w.typed = w.typed.slice(0, -1);
    } else if (state.active > 0) {
      state.active--;
      var prev = state.words[state.active];
      prev.typed = prev.typed.slice(0, -1);
      paintWord(state.active + 1);
    } else {
      return;
    }

    paintWord(state.active);
    placeCaret();
    updateHud();
  }

  // Satu ketukan fisik: bunyi + keycap turun.
  function pressFeedback(k) {
    var kind = 'char';
    var pan = panFor(k);
    if (k === ' ') { kind = 'space'; pan = 0; }
    else if (k === 'Enter') { kind = 'enter'; pan = 0; }
    else if (k === 'Backspace') { kind = 'backspace'; pan = -0.2; }

    playSound(kind, pan);
    pressKeyVisual(k);
  }

  function onKeyDown(e) {
    var k = e.key;

    // Tab / Esc: auto-repeat diabaikan supaya tidak restart berkali-kali.
    if (k === 'Tab' || k === 'Escape') {
      e.preventDefault();
      if (e.repeat) return;
      if (k === 'Tab') {
        restart();
      } else {
        if (!dom.overlay.hidden) closeResults();
        restart();
      }
      return;
    }

    if (!dom.overlay.hidden) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    var printable = k === ' ' || k === 'Backspace' || k === 'Enter' || k.length === 1;
    if (!printable) return;
    e.preventDefault();

    // e.repeat = event auto-repeat dari OS (tombol masih ditahan).
    // heldKeys jadi jaring pengaman kalau ada browser yang tidak set flag itu.
    var fresh = !e.repeat && !heldKeys[k];
    heldKeys[k] = true;

    // Suara/animasi hanya untuk ketukan yang benar-benar memproses input.
    if (fresh && !state.finished) pressFeedback(k);

    if (k === 'Backspace') { handleBackspace(); return; }
    if (k === ' ' || k === 'Enter') { handleSpace(); return; }
    handleChar(k);
  }

  function onKeyUp(e) {
    var k = e.key;
    if (!heldKeys[k]) return;   // tombol yang tidak pernah dicatat di halaman ini
    delete heldKeys[k];

    releaseKeyVisual(k);

    if (k === 'Backspace' || k === 'Enter') return;
    if (k.length !== 1) return;
    if (dom.overlay.hidden === false) return;
    if (state.finished || !state.started) return;

    // Bunyi "switch naik" hanya kalau tombolnya benar-benar ditekan di sini.
    try {
      sound.play('release', k === ' ' ? 0 : panFor(k));
    } catch (e) { /* abaikan */ }
  }

  // Kalau jendela kehilangan fokus saat tombol ditahan, keyup tidak akan
  // pernah datang — bersihkan supaya keycap tidak nyangkut turun.
  function clearHeldKeys() {
    for (var k in heldKeys) {
      releaseKeyVisual(k);
      delete heldKeys[k];
    }
  }

  // ------------------------------------------------------------------
  // hasil
  // ------------------------------------------------------------------
  function bestKey() {
    if (state.mode === 'time') return 'time-' + state.duration;
    if (state.mode === 'words') return 'words-' + state.wordCount;
    return 'quote';
  }

  function loadBest() {
    try { return JSON.parse(localStorage.getItem('thockytype.best') || '{}'); } catch (e) { return {}; }
  }

  function saveBest(best) {
    try { localStorage.setItem('thockytype.best', JSON.stringify(best)); } catch (e) { /* ignore */ }
  }

  function finish() {
    if (state.finished) return;
    state.finished = true;

    if (state.timer) { clearInterval(state.timer); state.timer = null; }

    if (state.started) {
      var real = (performance.now() - state.startTime) / 1000;
      state.elapsed = state.mode === 'time' ? Math.min(state.duration, real) : real;
    }

    var totalKeys = state.keys.ok + state.keys.bad;
    var acc = totalKeys ? (state.keys.ok / totalKeys) * 100 : 0;
    var minutes = Math.max(state.elapsed, 0.02) / 60;
    var correct = correctChars();
    var typed = typedChars();

    var result = {
      wpm: Math.round((correct / 5) / minutes),
      raw: Math.round((typed / 5) / minutes),
      acc: acc,
      cons: consistency(state.samples),
      errors: state.keys.bad,
      time: state.elapsed,
      correct: correct,
      typed: typed
    };

    showResults(result);
  }

  function showResults(r) {
    dom.resWpm.textContent = String(r.wpm);
    dom.resAcc.textContent = Math.round(r.acc) + '%';
    dom.resRaw.textContent = String(r.raw);
    dom.resCons.textContent = r.cons + '%';
    dom.resErr.textContent = String(r.errors);
    dom.resTime.textContent = (r.time < 10 ? r.time.toFixed(1) : Math.round(r.time)) + 's';
    dom.resChars.textContent = r.correct + ' / ' + r.typed;

    if (state.mode === 'time') dom.resMode.textContent = 'waktu ' + state.duration + 's';
    else if (state.mode === 'words') dom.resMode.textContent = state.wordCount + ' kata';
    else dom.resMode.textContent = 'kutipan';

    var key = bestKey();
    var best = loadBest();
    var prev = Number(best[key]) || 0;

    if (!prev || r.wpm > prev) {
      best[key] = r.wpm;
      saveBest(best);
      dom.resBest.textContent = prev ? 'rekor baru! (+' + (r.wpm - prev) + ' wpm)' : 'rekor pertama tersimpan';
      dom.resBest.classList.add('new');
    } else {
      dom.resBest.textContent = 'rekor: ' + prev + ' wpm';
      dom.resBest.classList.remove('new');
    }

    dom.overlay.hidden = false;
    requestAnimationFrame(function () { drawChart(state.samples); });
  }

  function closeResults() {
    dom.overlay.hidden = true;
  }

  function restart() {
    closeResults();
    newTest();
  }

  // ------------------------------------------------------------------
  // grafik
  // ------------------------------------------------------------------
  function drawChart(samples) {
    var canvas = dom.chart;
    if (!canvas) return;

    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(260, Math.round(rect.width || 640));
    var h = 140;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var pad = { l: 34, r: 10, t: 14, b: 16 };
    var plotW = w - pad.l - pad.r;
    var plotH = h - pad.t - pad.b;

    var pts = (samples || []).filter(function (s) { return s && s.t > 0; });
    var styles = getComputedStyle(document.documentElement);
    var accent = styles.getPropertyValue('--accent').trim();
    var accentRgb = styles.getPropertyValue('--accent-rgb').trim();
    var chartMuted = styles.getPropertyValue('--chart-muted').trim();
    var chartRaw = styles.getPropertyValue('--chart-raw').trim();
    var chartGrid = styles.getPropertyValue('--chart-grid').trim();

    ctx.font = '10px ui-monospace, SFMono-Regular, Consolas, monospace';
    ctx.textBaseline = 'middle';

    if (pts.length === 0) {
      ctx.fillStyle = chartMuted;
      ctx.fillText('belum cukup data untuk grafik', pad.l, h / 2);
      return;
    }

    var maxV = 20;
    for (var i = 0; i < pts.length; i++) {
      maxV = Math.max(maxV, pts[i].wpm, pts[i].raw);
    }
    maxV = Math.ceil((maxV * 1.12) / 10) * 10;

    var xOf = function (i) {
      return pts.length === 1 ? pad.l + plotW / 2 : pad.l + (i / (pts.length - 1)) * plotW;
    };
    var yOf = function (v) {
      return pad.t + plotH - (clamp(v, 0, maxV) / maxV) * plotH;
    };

    // grid
    for (var g = 0; g <= 4; g++) {
      var val = (maxV / 4) * g;
      var yy = Math.round(yOf(val)) + 0.5;
      ctx.strokeStyle = chartGrid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.l, yy);
      ctx.lineTo(w - pad.r, yy);
      ctx.stroke();

      ctx.fillStyle = chartMuted;
      ctx.fillText(String(Math.round(val)), 6, yy);
    }

    function drawLine(key, color, width, fill) {
      ctx.beginPath();
      for (var i2 = 0; i2 < pts.length; i2++) {
        var x = xOf(i2);
        var y = yOf(pts[i2][key]);
        if (i2 === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      if (fill) {
        ctx.save();
        ctx.lineTo(xOf(pts.length - 1), h - pad.b);
        ctx.lineTo(xOf(0), h - pad.b);
        ctx.closePath();
        var grad = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
        grad.addColorStop(0, fill);
        grad.addColorStop(1, 'rgba(' + accentRgb + ',0)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      } else {
        ctx.stroke();
      }
    }

    drawLine('raw', chartRaw, 1.5, null);
    drawLine('wpm', accent, 2, 'rgba(' + accentRgb + ',0.22)');

    // legend
    ctx.fillStyle = chartMuted;
    ctx.fillText('wpm', w - pad.r - 62, pad.t - 2);
    ctx.fillStyle = accent;
    ctx.fillRect(w - pad.r - 74, pad.t - 5, 8, 2);
    ctx.fillStyle = chartMuted;
    ctx.fillText('raw', w - pad.r - 20, pad.t - 2);
  }

  // ------------------------------------------------------------------
  // config UI
  // ------------------------------------------------------------------
  function syncConfig() {
    var btns = dom.modeSeg.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('on', btns[i].getAttribute('data-mode') === settings.mode);
    }
    renderValues();
    dom.profileSel.value = settings.profile;
    dom.fontSel.value = settings.font;
    dom.wordsWrap.style.setProperty('--typing-font', '"' + settings.font + '", monospace');
    dom.themeSel.value = settings.theme;
    document.documentElement.setAttribute('data-theme', settings.theme);
    dom.volume.value = String(settings.volume);
    dom.soundBtn.setAttribute('aria-pressed', settings.sound ? 'true' : 'false');
    document.body.classList.toggle('muted', !settings.sound);
  }

  function renderValues() {
    var seg = dom.valueSeg;
    seg.innerHTML = '';

    if (settings.mode === 'quote') {
      var tag = document.createElement('span');
      tag.className = 'chip';
      tag.style.margin = '0.42rem 0.7rem';
      tag.textContent = 'teks acak';
      seg.appendChild(tag);
      return;
    }

    var isTime = settings.mode === 'time';
    var opts = isTime ? [15, 30, 60, 120] : [10, 25, 50, 100];
    var current = isTime ? settings.duration : settings.wordCount;

    for (var i = 0; i < opts.length; i++) {
      (function (v) {
        var b = document.createElement('button');
        b.textContent = isTime ? v + 's' : String(v);
        if (v === current) b.classList.add('on');
        b.addEventListener('click', function () {
          if (isTime) settings.duration = v;
          else settings.wordCount = v;
          persist();
          syncConfig();
          newTest();
        });
        seg.appendChild(b);
      })(opts[i]);
    }
  }

  function cycleMode() {
    var i = MODES.indexOf(settings.mode);
    settings.mode = MODES[(i + 1) % MODES.length];
    persist();
    syncConfig();
    restart();
  }

  // ------------------------------------------------------------------
  // init
  // ------------------------------------------------------------------
  function bind() {
    var btns = dom.modeSeg.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          settings.mode = btn.getAttribute('data-mode');
          persist();
          syncConfig();
          restart();
        });
      })(btns[i]);
    }

    dom.soundBtn.addEventListener('click', function () {
      settings.sound = !settings.sound;
      sound.setEnabled(settings.sound);
      if (settings.sound) sound.play('char', 0);
      persist();
      syncConfig();
    });

    dom.profileSel.addEventListener('change', function () {
      settings.profile = dom.profileSel.value;
      sound.setProfile(settings.profile);
      sound.play('char', 0);
      persist();
    });

    dom.fontSel.addEventListener('change', function () {
      settings.font = FONT_OPTIONS.indexOf(dom.fontSel.value) >= 0 ? dom.fontSel.value : DEFAULTS.font;
      persist();
      syncConfig();
      if (!state.finished) placeCaret();
      else positionScrollOnly();
    });

    dom.themeSel.addEventListener('change', function () {
      settings.theme = THEME_OPTIONS.indexOf(dom.themeSel.value) >= 0 ? dom.themeSel.value : DEFAULTS.theme;
      persist();
      syncConfig();
      if (!dom.overlay.hidden) requestAnimationFrame(function () { drawChart(state.samples); });
    });

    dom.volume.addEventListener('input', function () {
      settings.volume = parseFloat(dom.volume.value);
      sound.setVolume(settings.volume);
      persist();
    });

    dom.volume.addEventListener('change', function () {
      sound.play('char', 0);
    });

    dom.againBtn.addEventListener('click', function () { restart(); });
    dom.closeBtn.addEventListener('click', function () { closeResults(); });
    dom.modeBtn.addEventListener('click', function () { cycleMode(); });

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearHeldKeys);
    document.addEventListener('visibilitychange', clearHeldKeys);

    window.addEventListener('resize', function () {
      clearTimeout(window.__ttResize);
      window.__ttResize = setTimeout(function () {
        if (!state.finished) { placeCaret(); }
        else { positionScrollOnly(); }
      }, 120);
    });
  }

  function positionScrollOnly() {
    var refs = wordEls[state.active];
    if (!refs) return;
    var lh = lineHeight();
    var row = Math.max(0, Math.round(refs.el.offsetTop / lh) - 1);
    scrollOffset = row * lh;
    dom.words.style.transform = 'translateY(' + (-scrollOffset).toFixed(1) + 'px)';
  }

  function init() {
    sound.setProfile(settings.profile);
    sound.setVolume(settings.volume);
    sound.setEnabled(settings.sound);
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches && dom.hint) {
      dom.hint.textContent = 'tes ini butuh keyboard fisik';
    }

    buildKeyboard();
    syncConfig();
    bind();
    newTest();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
