(() => {
  'use strict';
  const techniques = window.PRANAYAMA_TECHNIQUES;
  const engine = window.BreathingEngine;
  const overlay = document.querySelector('#session-overlay');
  const content = document.querySelector('#session-content');
  const summaries = {
    dirga: 'Settle into a deeper, fuller breath.', nadi_shodhana: 'Find calm, one side at a time.',
    sama_vritti: 'Four equal parts. A little more clarity.', ujjayi: 'Let a soft ocean rhythm steady you.',
    kapalabhati: 'A bright reset through rhythmic exhales.', bhastrika: 'Build warmth with an energizing rhythm.'
  };
  const icons = {
    dirga: '<path d="M18 34h28M18 25h28M18 16h28"/>',
    nadi_shodhana: '<path d="M23 13c-18 14 18 24 0 38M41 13c18 14-18 24 0 38"/>',
    sama_vritti: '<rect x="15" y="15" width="34" height="34" rx="5"/><path d="M15 32h7m20 0h7"/>',
    ujjayi: '<path d="M9 25q11-14 23 0t23 0M9 38q11-14 23 0t23 0"/>',
    kapalabhati: '<path d="m36 8-17 26h13l-4 22 18-28H33z"/>',
    bhastrika: '<path d="M32 9v46M9 32h46M16 16l32 32M16 48l32-32"/><circle cx="32" cy="32" r="15"/>'
  };
  const icon = id => `<svg viewBox="0 0 64 64" aria-hidden="true">${icons[id]}</svg>`;
  const formatTime = seconds => `${Math.floor(seconds / 60)}:${String(Math.ceil(seconds % 60)).padStart(2, '0')}`;
  let selected, opener, state = 'setup', timeline = [], rounds = 1, multiplier = 1, skipHolds = false;
  let elapsed = 0, startedAt = 0, frame = 0, lastPhase = -1, lastBeat = -1;
  let muted = false, context = null, audioGeneration = 0, refs = {};

  const categories = [...new Set(techniques.map(t => t.category))];
  document.querySelector('#technique-groups').innerHTML = categories.map((category, index) => `
    <section class="category category-${index}" aria-labelledby="category-${index}">
      <div class="category-heading"><span class="category-number">0${index + 1}</span><h3 id="category-${index}">${category}</h3><span class="category-line"></span><span class="category-intent">${['Unwind & soften', 'Steady & center', 'Awaken & renew'][index]}</span></div>
      <div class="card-grid">${techniques.filter(t => t.category === category).map(t => {
        const duration = engine.timeline(t, t.default_rounds, 1).at(-1).end;
        return `<button class="technique-card" data-technique="${t.id}" aria-label="Set up ${t.name}">
          <div class="card-top"><span class="technique-icon">${icon(t.id)}</span><span class="card-duration">${formatTime(duration)} MIN</span></div>
          <h4>${t.name}</h4><p class="english-name">${t.english_name}</p><p class="card-summary">${summaries[t.id]}</p>
          <div class="card-bottom"><span>${t.default_rounds} rounds <span class="small-dot">·</span> ${t.engine_type === 'pump_cycle' ? 'Energizing' : 'Guided breathing'}</span><span class="card-arrow" aria-hidden="true">↗</span></div>
        </button>`;
      }).join('')}</div>
    </section>`).join('');

  document.querySelectorAll('[data-technique]').forEach(button => button.addEventListener('click', () => {
    opener = button;
    selected = techniques.find(t => t.id === button.dataset.technique);
    rounds = selected.default_rounds; multiplier = 1; skipHolds = false;
    overlay.hidden = false; document.body.classList.add('modal-open');
    document.querySelectorAll('body > header, body > main, body > footer').forEach(el => { el.inert = true; });
    renderSetup();
    document.querySelector('#close-session').focus();
  }));

  function heading(kicker) {
    return `<p class="eyebrow">${kicker}</p><h2 id="session-title">${selected.name}</h2><p class="session-subtitle">${selected.english_name}</p>`;
  }
  function getTimeline() { return engine.timeline(selected, rounds, multiplier, skipHolds); }
  function renderSetup() {
    state = 'setup';
    content.innerHTML = `${heading('MAKE A LITTLE SPACE')}
      <div class="setup-symbol">${icon(selected.id)}</div>
      <p class="setup-description">${selected.description}</p>
      <form id="setup-form">
        <div class="settings-row"><label for="rounds">Rounds</label><div class="stepper"><button type="button" id="rounds-minus" aria-label="Fewer rounds">−</button><input id="rounds" type="number" min="1" max="99" value="${rounds}" required inputmode="numeric"/><button type="button" id="rounds-plus" aria-label="More rounds">+</button></div></div>
        ${selected.engine_type === 'continuous_timer' ? `<fieldset class="pace-setting"><legend>Breath duration</legend><div class="pace-options">${[0.75, 1, 1.5].map(p => `<label><input type="radio" name="pace" value="${p}" ${p === multiplier ? 'checked' : ''}/><span>${p === 1 ? '1.0' : p}× <small>${p < 1 ? 'Shorter' : p > 1 ? 'Longer' : 'Original'}</small></span></label>`).join('')}</div><p class="setting-help">Scales the length of each phase.</p></fieldset>` : '<p class="setting-help pump-note">A steady rhythm, followed by recovery. Pump timing stays fixed.</p>'}
        ${selected.phases.some(p => p.action.startsWith('hold')) ? '<label class="check-row"><input type="checkbox" id="skip-holds"/> Skip breath holds</label>' : ''}
        ${selected.cautions.length ? `<aside class="safety-notice"><span aria-hidden="true">ⓘ</span><div><strong>Before you begin</strong>${selected.cautions.map(c => `<p>${c}</p>`).join('')}<label class="check-row"><input type="checkbox" id="safety-ack" required/> I’ve read this notice</label></div></aside>` : ''}
        <div class="session-estimate"><span>YOUR PRACTICE</span><span id="estimate"></span></div>
        <button class="primary-button" type="submit">Begin practice <span aria-hidden="true">→</span></button>
      </form><p class="session-footnote">Find a comfortable seat. Breathe without strain.</p>`;
    const input = document.querySelector('#rounds');
    const update = () => {
      rounds = Math.max(1, Math.min(99, Number(input.value) || 1));
      multiplier = Number(document.querySelector('[name="pace"]:checked')?.value || 1);
      skipHolds = Boolean(document.querySelector('#skip-holds')?.checked);
      document.querySelector('#estimate').textContent = `${rounds} rounds · ${formatTime(getTimeline().at(-1).end)}`;
    };
    document.querySelector('#rounds-minus').onclick = () => { input.value = Math.max(1, rounds - 1); update(); };
    document.querySelector('#rounds-plus').onclick = () => { input.value = Math.min(99, rounds + 1); update(); };
    document.querySelector('#setup-form').addEventListener('input', update);
    document.querySelector('#setup-form').onsubmit = event => { event.preventDefault(); update(); timeline = getTimeline(); elapsed = 0; lastPhase = -1; lastBeat = -1; renderPlayer(); start(); };
    update();
  }

  function guide() {
    if (selected.id === 'dirga') return '<div class="dirga-guide"><div class="fill-level"></div><span>CHEST</span><span>RIBS</span><span>BELLY</span></div>';
    if (selected.id === 'sama_vritti') return '<svg class="box-guide" viewBox="0 0 240 240" aria-hidden="true"><rect class="box-track" x="26" y="26" width="188" height="188" rx="0"/><rect class="box-trace" x="26" y="26" width="188" height="188" pathLength="1"/><circle class="box-dot" r="6" cx="26" cy="26"/></svg>';
    if (selected.id === 'ujjayi') return '<div class="ocean-guide"><svg viewBox="0 0 240 180" aria-hidden="true"><path d="M-40 70Q0 20 40 70T120 70T200 70T280 70V200H-40Z"/><path d="M-40 95Q0 45 40 95T120 95T200 95T280 95V200H-40Z"/></svg></div>';
    return `<div class="breath-orb"><div class="orb-inner">${selected.id === 'nadi_shodhana' ? '<div class="nostrils"><span data-nostril="left">L</span><span data-nostril="right">R</span></div>' : icon(selected.id)}</div></div>`;
  }
  function renderPlayer() {
    content.innerHTML = `${heading('ONE BREATH AT A TIME')}<div class="player-meta"><span id="round-counter"></span><button class="text-button" id="mute-button" aria-pressed="${muted}">${muted ? 'Sound off' : 'Sound on'}</button></div>
      <div class="visual-guide" data-guide="${selected.id}">${guide()}</div>
      <div class="phase-details"><p id="phase-label" role="status" aria-live="polite"></p><div class="countdown"><span id="count-value"></span><span id="count-unit"></span></div><p id="phase-hint"></p></div>
      <div class="session-progress" role="progressbar" aria-label="Session progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div></div></div>
      <div class="player-controls"><button class="secondary-button" id="reset-button">Reset</button><button class="primary-button" id="pause-button">Pause <span aria-hidden="true">Ⅱ</span></button></div><button class="text-button exit-button" id="exit-button">Exit practice</button>`;
    refs = Object.fromEntries(['round-counter', 'phase-label', 'count-value', 'count-unit', 'phase-hint', 'pause-button'].map(id => [id, document.getElementById(id)]));
    refs.visual = content.querySelector('.visual-guide'); refs.progress = content.querySelector('.session-progress');
    document.querySelector('#pause-button').onclick = () => state === 'running' ? pause() : start();
    document.querySelector('#reset-button').onclick = () => { stop(); elapsed = 0; lastPhase = -1; lastBeat = -1; renderSetup(); };
    document.querySelector('#exit-button').onclick = close;
    document.querySelector('#mute-button').onclick = event => {
      muted = !muted; event.currentTarget.textContent = muted ? 'Sound off' : 'Sound on'; event.currentTarget.setAttribute('aria-pressed', String(muted));
      if (muted) closeAudio(); else if (state === 'running') void openAudio();
    };
    refs['pause-button'].focus();
  }
  async function openAudio() {
    if (muted || context) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const generation = ++audioGeneration;
    try {
      const next = new AudioContext(); context = next;
      await next.resume();
      if (generation !== audioGeneration || state !== 'running' || muted) { if (next.state !== 'closed') await next.close(); return; }
      const position = engine.position(timeline, elapsed);
      if (position) tone(position.phase.action);
    } catch { /* Silent mode remains available if the browser blocks audio. */ }
  }
  function closeAudio() {
    audioGeneration++;
    const previous = context; context = null;
    if (previous && previous.state !== 'closed') void previous.close().catch(() => {});
  }
  function tone(action) {
    if (muted || !context || context.state !== 'running') return;
    const frequencies = { inhale: 440, hold_full: 330, hold_empty: 330, exhale: 262, rest: 220, pump: 540 };
    const oscillator = context.createOscillator(), gain = context.createGain();
    const now = context.currentTime, length = action === 'pump' ? 0.07 : 0.32;
    oscillator.type = 'sine'; oscillator.frequency.value = frequencies[action];
    gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.075, now + 0.015); gain.gain.exponentialRampToValueAtTime(0.001, now + length);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(now); oscillator.stop(now + length + 0.02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  function start() {
    state = 'running'; startedAt = performance.now();
    refs['pause-button'].innerHTML = 'Pause <span aria-hidden="true">Ⅱ</span>';
    void openAudio(); tick();
  }
  function stop() { cancelAnimationFrame(frame); frame = 0; closeAudio(); try { navigator.vibrate?.(0); } catch {} }
  function pause() {
    if (state !== 'running') return;
    elapsed += (performance.now() - startedAt) / 1000;
    stop(); state = 'paused';
    if (elapsed >= timeline.at(-1).end) { complete(); return; }
    updatePlayer(elapsed, false);
    refs['pause-button'].innerHTML = 'Resume <span aria-hidden="true">▶</span>';
    refs['phase-hint'].textContent = 'Paused. Take your time.';
  }
  function tick() {
    if (state !== 'running') return;
    const current = elapsed + (performance.now() - startedAt) / 1000;
    if (current >= timeline.at(-1).end) { complete(); return; }
    updatePlayer(current, true); frame = requestAnimationFrame(tick);
  }
  function updatePlayer(current, feedback) {
    const p = engine.position(timeline, current); if (!p) return;
    const action = p.phase.action, isPump = action === 'pump';
    if (p.index !== lastPhase) {
      lastPhase = p.index; lastBeat = -1;
      refs['round-counter'].textContent = `Round ${p.round} of ${rounds}`;
      refs['phase-label'].textContent = p.phase.label;
      if (feedback) { if (!isPump) tone(action); try { navigator.vibrate?.(18); } catch {} }
    }
    if (isPump && p.beat !== lastBeat) { lastBeat = p.beat; if (feedback) tone('pump'); }
    refs['count-value'].textContent = isPump ? p.reps : p.remaining;
    refs['count-unit'].textContent = isPump ? 'reps left' : 'seconds';
    refs['phase-hint'].textContent = action === 'rest' ? 'Let your breathing return to its natural rhythm.' : action.startsWith('hold') ? 'Keep your body soft. Skip holds whenever needed.' : selected.id === 'nadi_shodhana' ? `Breathe through the ${p.phase.nostril} nostril.` : 'Follow the movement. Keep your breath comfortable.';
    let level = action === 'inhale' ? p.progress : action === 'exhale' ? 1 - p.progress : action === 'hold_full' ? 1 : 0;
    if (isPump) { const cycle = ((current - p.start) / p.phase.sec_per_rep) % 1; level = selected.id === 'bhastrika' ? (1 - Math.cos(cycle * Math.PI * 2)) / 2 : Math.exp(-cycle * 9); }
    if (action === 'rest') level = (1 - Math.cos((current - p.start) * Math.PI / 3)) / 2;
    refs.visual.style.setProperty('--level', level);
    refs.visual.dataset.action = action;
    refs.visual.querySelectorAll('[data-nostril]').forEach(n => n.classList.toggle('active', n.dataset.nostril === p.phase.nostril));
    const trace = refs.visual.querySelector('.box-trace');
    if (trace) {
      const phaseIndex = selected.phases.indexOf(p.phase), perimeter = (phaseIndex + p.progress) / 4;
      trace.style.strokeDasharray = `${perimeter} 1`;
      const points = [[26,26],[214,26],[214,214],[26,214],[26,26]];
      const a = points[phaseIndex], b = points[phaseIndex+1];
      const dot = refs.visual.querySelector('.box-dot'); dot.setAttribute('cx', a[0] + (b[0]-a[0])*p.progress); dot.setAttribute('cy', a[1]+(b[1]-a[1])*p.progress);
    }
    const progress = current / timeline.at(-1).end * 100;
    refs.progress.firstElementChild.style.width = `${progress}%`; refs.progress.setAttribute('aria-valuenow', String(Math.round(progress)));
  }
  function complete() {
    stop(); state = 'complete'; elapsed = timeline.at(-1).end;
    content.innerHTML = `<p class="eyebrow">PRACTICE COMPLETE</p><div class="completion-art" aria-hidden="true">✳</div><h2 id="session-title">A moment, just for you.</h2><p class="completion-copy">Carry a little of this rhythm into the rest of your day.</p><div class="completion-stats"><div><strong>${rounds}</strong><span>rounds completed</span></div><div><strong>${formatTime(elapsed)}</strong><span>time for yourself</span></div></div><p class="completed-technique">${selected.name} · ${selected.english_name}</p><button class="primary-button" id="done-button">Back to practices <span aria-hidden="true">→</span></button><button class="text-button exit-button" id="again-button">Practice again</button>`;
    document.querySelector('#done-button').onclick = close; document.querySelector('#again-button').onclick = renderSetup;
    document.querySelector('#done-button').focus();
  }
  function close() {
    stop(); state = 'setup'; overlay.hidden = true; content.innerHTML = '';
    document.body.classList.remove('modal-open');
    document.querySelectorAll('body > header, body > main, body > footer').forEach(el => { el.inert = false; });
    opener?.focus();
  }
  document.querySelector('#close-session').onclick = close;
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  document.addEventListener('keydown', event => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      const focusable = [...overlay.querySelectorAll('button, input, [href], [tabindex="0"]')].filter(el => !el.disabled);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'running') pause(); });
  window.addEventListener('pagehide', () => { if (state === 'running') pause(); else stop(); });
})();
