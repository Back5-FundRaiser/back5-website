/* Back5 health checks: shared code for both checks.
   Each check page loads this file, then its own data file (which defines
   `class Component extends DCLogic` with the problems, questions and
   recommendations), then calls B5Check.start(copy).

   Flow: pick problems -> answer questions -> leave details -> scorecard.
   Details go to /.netlify/functions/health-check (Asana task) and to the
   Netlify form named "health-check" (email alert). */
class DCLogic {
  setState(patch) {
    Object.assign(this.state, patch);
    B5Check.render();
  }
}

const B5Check = (() => {
  let comp, cfg, app;
  let stage = 'pick', lastStage = null;
  let contact = { organisation: '', name: '', email: '', phone: '' };
  let sendState = 'idle'; // idle | sending | sent | failed
  let formError = '';

  const INK = '#111116', YELLOW = '#EFD018', ORANGE = '#F4450F', GREY = '#3d3d45', PAPER = '#F4F4F2';
  const STAGES = ['pick', 'questions', 'details', 'score'];

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (d, size) => d ? `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" style="flex: none; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><path d="${esc(d)}"></path></svg>` : '';
  const H1 = 'margin: 0; font-size: clamp(38px, 5.2vw, 72px); line-height: 1; font-weight: 900; letter-spacing: -0.035em; text-wrap: balance';
  const PRIMARY = `min-height: 58px; padding: 0 32px; border: 0; border-radius: 8px; background: ${INK}; color: #ffffff; font-size: 18px; font-weight: 800`;
  const SECONDARY = `min-height: 58px; padding: 0 28px; border: 2px solid ${INK}; border-radius: 8px; background: #ffffff; color: ${INK}; font-size: 18px; font-weight: 800; text-decoration: none; display: inline-flex; align-items: center`;
  const LINKBTN = `min-height: 44px; padding: 0; border: 0; background: none; color: ${INK}; font-size: 16px; font-weight: 700; text-decoration: underline; text-underline-offset: 5px`;

  /* ---------- scoring ---------- */
  const points = (opt) => Object.values(opt[1]).reduce((a, b) => a + b, 0);
  const band = (score) => score >= 70 ? { label: 'In good shape', color: INK } : score >= 40 ? { label: 'Room to improve', color: YELLOW } : { label: 'Needs attention', color: ORANGE };

  function scorecard() {
    const data = comp.problemData();
    const st = comp.state;
    const areas = [], unchecked = [];
    data.forEach((p) => {
      if (!st.picked[p.id]) { unchecked.push(p.short); return; }
      const scores = [];
      p.qs.forEach((q, qi) => {
        const chosen = st.answers[p.id + '-' + qi];
        const max = Math.max.apply(null, q.opts.map(points));
        if (chosen === undefined || max === 0) return;
        scores.push(100 * (1 - points(q.opts[chosen]) / max));
      });
      if (!scores.length) { unchecked.push(p.short); return; }
      const score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      areas.push({ name: p.short.charAt(0).toUpperCase() + p.short.slice(1), score: score, band: band(score) });
    });
    areas.sort((a, b) => a.score - b.score);
    const overall = areas.length ? Math.round(areas.reduce((a, b) => a + b.score, 0) / areas.length) : null;
    return { areas: areas, unchecked: unchecked, overall: overall, band: overall === null ? null : band(overall) };
  }

  /* ---------- screens ---------- */
  function pick(v) {
    return `<div style="display: flex; flex-direction: column; gap: 32px">
<div style="display: flex; flex-direction: column; gap: 18px">
<h1 tabindex="-1" style="${H1}">${esc(cfg.pickTitle)}</h1>
<p style="margin: 0; font-size: 20px; line-height: 1.5; color: ${GREY}; max-width: 34em">${esc(cfg.pickIntro)}</p>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 12px">
${v.problems.map((p, i) => { const on = p.pressed === 'true'; return `<button type="button" class="b5-opt" aria-pressed="${p.pressed}" data-a="toggle" data-k="p${i}" style="display: inline-flex; align-items: center; gap: 12px; min-height: 56px; padding: 8px 24px; border: 2px solid ${INK}; border-radius: 999px; background: ${on ? INK : '#ffffff'}; color: ${on ? '#ffffff' : INK}; font-size: 18px; font-weight: 700; text-align: left">${icon(p.icon, 24)}${esc(p.text)}</button>`; }).join('\n')}
</div>
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px; padding-top: 8px">
<button type="button" class="b5-go" data-a="go" data-to="questions" data-k="next" ${v.nonePicked ? 'disabled' : ''} style="${PRIMARY}">${esc(v.nextLabel)}</button>
<span style="font-size: 16px; color: ${GREY}">Takes about three minutes.</span>
</div>
</div>`;
  }

  function questions(v) {
    return `<div style="display: flex; flex-direction: column; gap: 44px">
<div style="display: flex; flex-direction: column; gap: 14px">
<h1 tabindex="-1" style="margin: 0; font-size: clamp(32px, 4.2vw, 56px); line-height: 1; font-weight: 900; letter-spacing: -0.035em; text-wrap: balance">A bit more on what you picked.</h1>
<p style="margin: 0; font-size: 19px; line-height: 1.5; color: ${GREY}; max-width: 34em">Go with your gut. Close enough is fine.</p>
</div>
${v.groups.map((g, gi) => `<section style="display: flex; flex-direction: column; gap: 26px; padding-top: 26px; border-top: 2px solid ${INK}">
<h2 style="margin: 0; font-size: clamp(22px, 2.2vw, 28px); line-height: 1.15; font-weight: 900; letter-spacing: -0.02em">${esc(g.text)}</h2>
${g.questions.map((q, qi) => `<fieldset style="margin: 0; padding: 0; border: 0; display: flex; flex-direction: column">
<legend style="padding: 0; margin-bottom: 14px; font-size: 19px; line-height: 1.4; font-weight: 700">${esc(q.q)}</legend>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)); gap: 12px">
${q.opts.map((o, oi) => { const on = o.pressed === 'true'; return `<button type="button" class="b5-opt" aria-pressed="${o.pressed}" data-a="answer" data-k="a${gi}-${qi}-${oi}" style="min-height: 68px; padding: 14px 18px; border: 2px solid ${on ? INK : '#8a8a92'}; border-radius: 10px; background: ${on ? INK : '#ffffff'}; color: ${on ? '#ffffff' : INK}; font-size: 16px; line-height: 1.35; font-weight: 700; text-align: left">${esc(o.label)}</button>`; }).join('\n')}
</div>
</fieldset>`).join('\n')}
</section>`).join('\n')}
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px 28px; padding-top: 8px">
<button type="button" class="b5-go" data-a="go" data-to="details" data-k="result" style="${PRIMARY}">Get my scorecard</button>
<button type="button" data-a="go" data-to="pick" data-k="back" style="${LINKBTN}">Change what I picked</button>
<span style="font-size: 16px; color: ${GREY}">${esc(v.answeredLabel)}</span>
</div>
</div>`;
  }

  function details() {
    const field = (id, key, label, type, auto, required, note) => `<div style="display: flex; flex-direction: column; gap: 6px">
<label for="${id}" style="font-size: 15px; font-weight: 800">${esc(label)}${note ? ` <span style="font-weight: 600; color: ${GREY}">${esc(note)}</span>` : ''}</label>
<input id="${id}" data-f="${key}" type="${type}" autocomplete="${auto}" ${required ? 'required aria-required="true"' : ''} value="${esc(contact[key])}" style="min-height: 54px; padding: 0 16px; border: 2px solid ${INK}; border-radius: 8px; font-size: 17px; color: ${INK}; background: #ffffff">
</div>`;
    return `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(380px, 100%), 1fr)); gap: 36px 72px; align-items: start">
<div style="display: flex; flex-direction: column; gap: 18px">
<h1 tabindex="-1" style="margin: 0; font-size: clamp(34px, 4.6vw, 64px); line-height: 1; font-weight: 900; letter-spacing: -0.035em; text-wrap: balance">Your scorecard is ready.</h1>
<p style="margin: 0; font-size: 20px; line-height: 1.5; color: ${GREY}; max-width: 30em">Tell us who it's for and you'll see your score, where to start, and a PDF to take to your next meeting.</p>
<button type="button" data-a="go" data-to="questions" data-k="backq" style="${LINKBTN}; align-self: flex-start">Back to my answers</button>
</div>
<form id="b5-form" novalidate style="background: ${PAPER}; border-radius: 12px; padding: clamp(22px, 3vw, 36px); display: flex; flex-direction: column; gap: 18px">
${field('b5-name', 'name', 'Your name', 'text', 'name', true)}
${field('b5-email', 'email', cfg.emailLabel, 'email', 'email', true)}
${field('b5-org', 'organisation', cfg.orgLabel, 'text', 'organization', false, '(optional)')}
${field('b5-phone', 'phone', 'Phone', 'tel', 'tel', false, '(optional)')}
<p id="b5-error" role="alert" style="margin: 0; min-height: 22px; font-size: 16px; font-weight: 700; color: #b3300a">${esc(formError)}</p>
<button type="submit" class="b5-go" style="${PRIMARY}">Show my scorecard</button>
<p style="margin: 0; font-size: 14px; line-height: 1.5; color: ${GREY}">We'll use these details to follow up on your scorecard. See our <a href="/privacy/" style="color: ${INK}">privacy policy</a>.</p>
</form>
</div>`;
  }

  function score(v) {
    const sc = scorecard();
    const sendNote = sendState === 'sent' ? 'Your scorecard has gone to the Back5 team. We will be in touch within two working days.'
      : sendState === 'failed' ? `We could not send your details to our team. Email ${cfg.contactEmail} and we will pick it up from there.`
      : sendState === 'sending' ? 'Sending your scorecard to the Back5 team...' : '';
    const row = (a) => `<div style="display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px 20px; align-items: baseline; padding: 18px 0; border-top: 2px solid ${INK}">
<span style="font-size: clamp(19px, 1.9vw, 24px); font-weight: 900; letter-spacing: -0.01em">${esc(a.name)}</span>
<span style="font-size: clamp(19px, 1.9vw, 24px); font-weight: 900">${a.score}<span style="font-size: 15px; font-weight: 700; color: ${GREY}"> / 100</span></span>
<div role="img" aria-label="${a.score} out of 100" style="grid-column: 1 / -1; height: 14px; background: #E3E3DF; border-radius: 7px; overflow: hidden"><div style="width: ${Math.max(a.score, 3)}%; height: 100%; background: ${a.band.color}"></div></div>
<span style="grid-column: 1 / -1; font-size: 15px; font-weight: 800">${esc(a.band.label)}</span>
</div>`;
    const top = v.hasTop ? v.top : null;
    const topBg = top && top.bg.toLowerCase() === '#ffffff' ? INK : top ? top.bg : YELLOW;
    const topFg = topBg === INK ? '#ffffff' : INK;
    return `<div style="display: flex; flex-direction: column; gap: 48px">
<div style="display: flex; flex-direction: column; gap: 12px">
<h1 tabindex="-1" style="${H1}">${esc(cfg.scoreTitle)}</h1>
<p style="margin: 0; font-size: 19px; line-height: 1.5; color: ${GREY}">${esc(contact.organisation || contact.name)}, ${esc(new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }))}</p>
<p id="b5-send" role="status" style="margin: 0; font-size: 16px; font-weight: 700; color: ${sendState === 'failed' ? '#b3300a' : GREY}">${esc(sendNote)}</p>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr)); gap: 40px 64px; align-items: start">
<section aria-label="Overall score" style="background: ${sc.band ? sc.band.color : PAPER}; color: ${sc.band && sc.band.color === INK ? '#ffffff' : INK}; padding: clamp(28px, 4vw, 48px); clip-path: polygon(clamp(14px, 2.4vw, 32px) 0, 100% 0, calc(100% - clamp(14px, 2.4vw, 32px)) 100%, 0 100%); display: flex; flex-direction: column; gap: 6px">
<span style="font-size: 17px; font-weight: 800">Overall score</span>
<span style="font-size: clamp(88px, 12vw, 160px); line-height: 0.9; font-weight: 900; letter-spacing: -0.05em">${sc.overall === null ? '?' : sc.overall}<span style="font-size: 0.28em; letter-spacing: 0; font-weight: 800"> / 100</span></span>
<span style="font-size: clamp(22px, 2.4vw, 30px); font-weight: 900">${esc(sc.band ? sc.band.label : 'Not enough answers to score')}</span>
<span style="font-size: 15px; line-height: 1.45; max-width: 26em">Scored on the ${sc.areas.length} ${sc.areas.length === 1 ? 'area' : 'areas'} you flagged. A lower score means more to gain.</span>
</section>
<section aria-label="Score by area" style="display: flex; flex-direction: column; border-bottom: 2px solid ${INK}">
${sc.areas.map(row).join('\n')}
</section>
</div>
${sc.unchecked.length ? `<p style="margin: -16px 0 0; font-size: 16px; line-height: 1.5; color: ${GREY}; max-width: 46em">Not scored, because you didn't flag them: ${esc(sc.unchecked.join(', '))}.</p>` : ''}

${top ? `<section style="display: flex; flex-direction: column; gap: 20px">
<h2 style="margin: 0; font-size: clamp(28px, 3.2vw, 44px); line-height: 1.05; font-weight: 900; letter-spacing: -0.03em">${esc(cfg.startTitle)}</h2>
<div style="background: ${topBg}; color: ${topFg}; padding: clamp(24px, 3.4vw, 44px); display: flex; flex-direction: column; gap: 12px">
<span style="display: flex; align-items: center; gap: 12px; font-size: clamp(28px, 3.6vw, 48px); line-height: 1.05; font-weight: 900; letter-spacing: -0.03em">${icon(top.icon, 40)}${esc(top.name)}</span>
<p style="margin: 0; font-size: 19px; line-height: 1.45; font-weight: 600; max-width: 34em">${esc(top.text)}</p>
<p style="margin: 0; font-size: 15px; line-height: 1.45">${esc(top.because)}</p>
</div>
${v.hasRest ? `<div style="display: flex; flex-direction: column; border-bottom: 2px solid ${INK}">
${v.rest.map((r) => `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr)); gap: 6px 40px; padding: 18px 0; border-top: 2px solid ${INK}">
<span style="display: flex; align-items: center; gap: 12px; font-size: 21px; font-weight: 900">${icon(r.icon, 22)}${esc(r.name)}</span>
<span style="font-size: 16px; line-height: 1.5; color: ${GREY}">${esc(r.text)}</span>
</div>`).join('\n')}
</div>` : ''}
</section>` : ''}

<section style="background: ${INK}; color: #ffffff; padding: clamp(26px, 4vw, 48px); display: flex; flex-direction: column; gap: 20px">
<h2 style="margin: 0; font-size: clamp(26px, 3vw, 40px); line-height: 1.05; font-weight: 900; letter-spacing: -0.03em">Take it with you.</h2>
<p style="margin: 0; font-size: 18px; line-height: 1.5; color: #d2d2d8; max-width: 36em">Download the scorecard for your next meeting. To talk it through, email <a href="mailto:${esc(cfg.contactEmail)}" style="color: #ffffff; font-weight: 800">${esc(cfg.contactEmail)}</a>.</p>
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 14px 24px">
<button type="button" class="b5-go" data-a="pdf" data-k="pdf" style="min-height: 58px; padding: 0 32px; border: 0; border-radius: 8px; background: ${YELLOW}; color: ${INK}; font-size: 18px; font-weight: 800">Download scorecard (PDF)</button>
<span id="b5-pdf" role="status" style="font-size: 16px; font-weight: 700"></span>
</div>
</section>
<div style="display: flex">
<button type="button" data-a="restart" data-k="restart" style="${LINKBTN}">Start again</button>
</div>
</div>`;
  }

  /* ---------- render ---------- */
  function render() {
    const v = comp.renderVals();
    const focusKey = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.k : null;
    app.innerHTML = stage === 'pick' ? pick(v) : stage === 'questions' ? questions(v) : stage === 'details' ? details() : score(v);
    const n = STAGES.indexOf(stage) + 1;
    document.getElementById('b5-step').textContent = 'Step ' + n + ' of 4';
    document.querySelectorAll('#b5-progress span').forEach((el, i) => { el.style.background = i < n ? INK : '#D9D9D4'; });
    if (stage !== lastStage) {
      if (lastStage !== null) {
        window.scrollTo(0, 0);
        const h = app.querySelector('h1');
        if (h) h.focus({ preventScroll: true });
      }
      lastStage = stage;
    } else if (focusKey) {
      const el = app.querySelector('[data-k="' + focusKey + '"]');
      if (el) el.focus({ preventScroll: true });
    }
  }

  /* ---------- sending ---------- */
  function summary() {
    const v = comp.renderVals();
    const sc = scorecard();
    const answers = [];
    v.groups.forEach((g) => g.questions.forEach((q) => {
      const chosen = q.opts.find((o) => o.pressed === 'true');
      answers.push(q.q + ' ' + (chosen ? chosen.label : '(not answered)'));
    }));
    return {
      check: cfg.kind,
      organisation: contact.organisation, name: contact.name, email: contact.email, phone: contact.phone,
      score: sc.overall === null ? 'Not scored' : sc.overall + ' / 100 (' + sc.band.label + ')',
      areas: sc.areas.map((a) => a.name + ': ' + a.score + ' / 100 (' + a.band.label + ')').join('\n'),
      problems: v.groups.map((g) => g.text).join('\n'),
      answers: answers.join('\n'),
      start_here: v.hasTop ? v.top.name : 'No clear starting point',
      also_consider: v.rest.map((r) => r.name).join(', ')
    };
  }

  async function send() {
    const data = summary();
    sendState = 'sending';
    const task = fetch('/.netlify/functions/health-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then((r) => r.ok).catch(() => false);
    const form = fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(Object.assign({ 'form-name': 'health-check' }, data)).toString() })
      .then((r) => r.ok).catch(() => false);
    const results = await Promise.all([task, form]);
    sendState = results[0] || results[1] ? 'sent' : 'failed';
    if (stage === 'score') render();
  }

  function submit(e) {
    e.preventDefault();
    app.querySelectorAll('[data-f]').forEach((el) => { contact[el.dataset.f] = el.value.trim(); });
    if (!contact.name) formError = 'Add your name to see your scorecard.';
    else if (!/^\S+@\S+\.\S+$/.test(contact.email)) formError = 'Add a valid email address to see your scorecard.';
    else formError = '';
    if (formError) {
      render();
      const bad = document.getElementById(!contact.name ? 'b5-name' : 'b5-email');
      if (bad) bad.focus();
      return;
    }
    stage = 'score';
    send();
    render();
  }

  /* ---------- PDF ---------- */
  function loadLogo() {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext('2d').drawImage(img, 0, 0);
        try { resolve({ data: c.toDataURL('image/png'), ratio: img.naturalHeight / img.naturalWidth }); } catch (err) { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = '/assets/back5-logo-white.png';
    });
  }

  async function pdf() {
    const status = document.getElementById('b5-pdf');
    if (!window.jspdf) { status.textContent = 'The PDF could not be made. Reload the page and try again.'; return; }
    status.textContent = 'Making your PDF...';
    const v = comp.renderVals();
    const sc = scorecard();
    const logo = await loadLogo();
    const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210, M = 18, CW = W - 2 * M;
    const rgb = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    const fill = (hex) => doc.setFillColor.apply(doc, rgb(hex));
    const ink = (hex) => doc.setTextColor.apply(doc, rgb(hex));
    const font = (weight, size) => { doc.setFont('helvetica', weight); doc.setFontSize(size); };
    let y;
    const header = () => {
      fill(INK); doc.rect(0, 0, W, 30, 'F');
      if (logo) doc.addImage(logo.data, 'PNG', M, 8, 42, 42 * logo.ratio);
      ink('#ffffff'); font('bold', 11); doc.text(cfg.kind + ' scorecard', W - M, 18, { align: 'right' });
      y = 44;
    };
    const footer = () => {
      fill(YELLOW); doc.rect(0, 281, W, 16, 'F');
      ink(INK); font('bold', 10);
      doc.text('Talk it through with Back5: ' + cfg.contactEmail, M, 291);
      doc.text('www.back5.com.au', W - M, 291, { align: 'right' });
    };
    const need = (h) => { if (y + h > 272) { footer(); doc.addPage(); header(); } };
    const para = (text, size, weight, color, width) => {
      font(weight, size); ink(color);
      const lines = doc.splitTextToSize(text, width || CW);
      const lh = size * 0.42;
      need(lines.length * lh);
      doc.text(lines, M, y); y += lines.length * lh;
    };

    header();
    ink(INK); font('bold', 22); doc.text(contact.organisation || contact.name, M, y); y += 7;
    font('normal', 10); ink(GREY);
    doc.text((contact.organisation ? contact.name + ', ' : '') + new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }), M, y); y += 10;

    const bandColor = sc.band ? sc.band.color : PAPER;
    fill(bandColor); doc.rect(M, y, CW, 40, 'F');
    ink(bandColor === INK ? '#ffffff' : INK);
    font('bold', 10); doc.text('Overall score', M + 8, y + 10);
    font('bold', 44); doc.text(sc.overall === null ? '?' : String(sc.overall), M + 8, y + 30);
    const numW = doc.getTextWidth(sc.overall === null ? '?' : String(sc.overall));
    font('bold', 14); doc.text('/ 100', M + 11 + numW, y + 30);
    font('bold', 18); doc.text(sc.band ? sc.band.label : 'Not enough answers to score', W - M - 8, y + 20, { align: 'right' });
    font('normal', 9); doc.text('Scored on the areas you flagged. A lower score means more to gain.', W - M - 8, y + 28, { align: 'right' });
    y += 52;

    ink(INK); font('bold', 14); doc.text('Score by area', M, y); y += 7;
    sc.areas.forEach((a) => {
      need(17);
      ink(INK); font('bold', 11); doc.text(a.name, M, y);
      doc.text(a.score + ' / 100', W - M, y, { align: 'right' });
      fill('#E3E3DF'); doc.rect(M, y + 2.5, CW, 3.5, 'F');
      fill(a.band.color); doc.rect(M, y + 2.5, CW * Math.max(a.score, 3) / 100, 3.5, 'F');
      font('normal', 9); ink(GREY); doc.text(a.band.label, M, y + 10.5);
      y += 17;
    });
    if (sc.unchecked.length) { y += 1; para('Not scored, because you did not flag them: ' + sc.unchecked.join(', ') + '.', 9, 'normal', GREY); y += 4; }

    if (v.hasTop) {
      y += 4; need(40);
      ink(INK); font('bold', 14); doc.text(cfg.startTitle, M, y); y += 8;
      para(v.top.name, 16, 'bold', INK); y += 1.5;
      para(v.top.text, 10.5, 'normal', INK); y += 1;
      para(v.top.because, 9, 'normal', GREY); y += 6;
      if (v.hasRest) {
        need(14);
        ink(INK); font('bold', 12); doc.text('Also worth a look', M, y); y += 7;
        v.rest.forEach((r) => { need(16); para(r.name, 10.5, 'bold', INK); y += 0.5; para(r.text, 9.5, 'normal', GREY); y += 3.5; });
      }
    }
    footer();
    const slug = (contact.organisation || contact.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'scorecard';
    doc.save('back5-' + cfg.fileWord + '-' + slug + '.pdf');
    status.textContent = 'Downloaded.';
  }

  /* ---------- events ---------- */
  function click(e) {
    const b = e.target.closest('[data-a]');
    if (!b || b.disabled) return;
    const v = comp.renderVals();
    const a = b.dataset.a, k = b.dataset.k;
    if (a === 'toggle') v.problems[Number(k.slice(1))].toggle();
    else if (a === 'answer') { const p = k.slice(1).split('-').map(Number); v.groups[p[0]].questions[p[1]].opts[p[2]].pick(); }
    else if (a === 'go') { stage = b.dataset.to; render(); }
    else if (a === 'pdf') pdf();
    else if (a === 'restart') {
      stage = 'pick'; sendState = 'idle'; formError = '';
      comp.setState({ picked: {}, answers: {} });
    }
  }

  function start(copy) {
    cfg = copy;
    app = document.getElementById('b5-app');
    comp = new Component();
    app.addEventListener('click', click);
    app.addEventListener('submit', submit);
    render();
  }

  return { start, render };
})();
