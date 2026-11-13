/* Back5 health checks: shared code for both checks.
   Each check page loads its data file first (which sets window.B5_CHECK:
   the areas, questions, advice and wording), then this file, then calls
   B5Check.start(copy).

   Flow: one screen per area -> leave details -> report.
   Details go to /.netlify/functions/health-check (Asana task) and to the
   Netlify form named "health-check" (email alert). */
const B5Check = (() => {
  let cfg, data, app;
  let stage = 0, lastStage = null;          // 0..n-1 = area screens, 'details', 'report'
  const answers = {};                        // answers[areaId][questionIndex] = 0..3
  let contact = { organisation: '', name: '', email: '', phone: '' };
  let sendState = 'idle';                    // idle | sending | sent | failed
  let formError = '';

  const INK = '#111116', YELLOW = '#EFD018', ORANGE = '#F4450F', SOFT = '#d2d2d8', LINE = '#55555c';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (d, size) => d ? `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" style="flex: none; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><path d="${esc(d)}"></path></svg>` : '';
  const H1 = 'margin: 0; font-size: clamp(36px, 5vw, 68px); line-height: 1; font-weight: 900; letter-spacing: -0.035em; text-wrap: balance';
  const H2 = 'margin: 0; font-size: clamp(28px, 3.2vw, 44px); line-height: 1.05; font-weight: 900; letter-spacing: -0.03em';
  const PRIMARY = (bg) => `min-height: 58px; padding: 0 32px; border: 0; border-radius: 8px; background: ${bg}; color: ${INK}; font-size: 18px; font-weight: 800`;
  const LINKBTN = 'min-height: 44px; padding: 0; border: 0; background: none; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: underline; text-underline-offset: 5px';
  const today = () => new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

  /* ---------- scoring ---------- */
  const band = (score) => score >= 70 ? { key: 'high', label: 'In good shape', color: '#ffffff' } : score >= 40 ? { key: 'mid', label: 'Room to improve', color: YELLOW } : { key: 'low', label: 'Needs attention', color: ORANGE };

  function report() {
    const areas = data.areas.map((a) => {
      const got = answers[a.id] || {};
      const total = a.qs.reduce((sum, q, i) => sum + (got[i] || 0), 0);
      const score = Math.round(100 * total / (3 * a.qs.length));
      const b = band(score);
      let weak = a.qs.map((q, i) => ({ q: q, ans: got[i] || 0 })).filter((x) => x.ans <= 1).sort((x, y) => x.ans - y.ans);
      if (!weak.length && score < 70) weak = a.qs.map((q, i) => ({ q: q, ans: got[i] || 0 })).filter((x) => x.ans === 2);
      return { id: a.id, name: a.name, icon: a.icon, help: a.help, score: score, band: b, verdict: a.verdict[b.key], actions: weak.map((x) => x.q.fix) };
    });
    const overall = Math.round(areas.reduce((s, a) => s + a.score, 0) / areas.length);
    const ranked = areas.slice().sort((a, b) => a.score - b.score);
    return {
      areas: areas, overall: overall, band: band(overall), headline: data.headline[band(overall).key],
      priorities: ranked.filter((a) => a.score < 70 && a.actions.length).slice(0, 3)
    };
  }

  /* ---------- screens ---------- */
  function areaScreen(i) {
    const a = data.areas[i];
    const got = answers[a.id] || {};
    const done = a.qs.every((q, qi) => got[qi] !== undefined);
    const last = i === data.areas.length - 1;
    return `<div style="display: flex; flex-direction: column; gap: 40px">
<div style="display: flex; flex-direction: column; gap: 16px">
${i === 0 ? `<p style="margin: 0; font-size: 19px; line-height: 1.5; color: ${SOFT}; max-width: 36em">${esc(data.intro)}</p>` : ''}
<h1 tabindex="-1" style="${H1}; display: flex; align-items: center; gap: 18px"><span style="color: ${cfg.accent}; display: flex">${icon(a.icon, 52)}</span>${esc(a.name)}</h1>
</div>
${a.qs.map((q, qi) => `<fieldset style="margin: 0; padding: 28px 0 0; border: 0; border-top: 2px solid ${LINE}; display: flex; flex-direction: column">
<legend style="float: left; width: 100%; padding: 0; margin-bottom: 16px; font-size: clamp(20px, 2vw, 24px); line-height: 1.3; font-weight: 800">${esc(q.q)}</legend>
<div style="clear: both; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(400px, 100%), 1fr)); gap: 12px">
${q.opts.map((o, oi) => { const on = got[qi] === oi; return `<button type="button" class="b5-opt" aria-pressed="${on}" data-a="answer" data-k="a${qi}-${oi}" style="min-height: 64px; padding: 14px 18px; border: 2px solid ${on ? '#ffffff' : '#8a8a92'}; border-radius: 10px; background: ${on ? '#ffffff' : 'transparent'}; color: ${on ? INK : '#ffffff'}; font-size: 17px; line-height: 1.35; font-weight: 700; text-align: left">${esc(o)}</button>`; }).join('\n')}
</div>
</fieldset>`).join('\n')}
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px 28px">
<button type="button" class="b5-go" data-a="next" data-k="next" ${done ? '' : 'disabled'} style="${PRIMARY(cfg.accent)}">${last ? 'Get my scorecard' : 'Next: ' + esc(data.areas[i + 1].name)}</button>
${i > 0 ? `<button type="button" data-a="back" data-k="back" style="${LINKBTN}">Back</button>` : ''}
${done ? '' : `<span style="font-size: 16px; color: ${SOFT}">Answer all ${a.qs.length} to continue.</span>`}
</div>
</div>`;
  }

  function details() {
    const field = (id, key, label, type, auto, required) => `<div style="display: flex; flex-direction: column; gap: 6px">
<label for="${id}" style="font-size: 15px; font-weight: 800">${esc(label)}${required ? '' : ' <span style="font-weight: 600; color: #55555c">(optional)</span>'}</label>
<input id="${id}" data-f="${key}" type="${type}" autocomplete="${auto}" ${required ? 'required aria-required="true"' : ''} value="${esc(contact[key])}" style="min-height: 54px; padding: 0 16px; border: 2px solid ${INK}; border-radius: 8px; font-size: 17px; color: ${INK}; background: #ffffff">
</div>`;
    return `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(380px, 100%), 1fr)); gap: 36px 72px; align-items: start">
<div style="display: flex; flex-direction: column; gap: 18px">
<h1 tabindex="-1" style="${H1}">Your scorecard is ready.</h1>
<p style="margin: 0; font-size: 20px; line-height: 1.5; color: ${SOFT}; max-width: 30em">Tell us who it's for and you'll see your score, what to fix first in each area, and a PDF to take to your next meeting.</p>
<button type="button" data-a="back" data-k="backq" style="${LINKBTN}; align-self: flex-start">Back to my answers</button>
</div>
<form id="b5-form" novalidate style="background: #ffffff; color: ${INK}; border-radius: 12px; padding: clamp(22px, 3vw, 36px); display: flex; flex-direction: column; gap: 18px">
${field('b5-name', 'name', 'Your name', 'text', 'name', true)}
${field('b5-email', 'email', cfg.emailLabel, 'email', 'email', true)}
${field('b5-org', 'organisation', cfg.orgLabel, 'text', 'organization', false)}
${field('b5-phone', 'phone', 'Phone', 'tel', 'tel', false)}
<p id="b5-error" role="alert" style="margin: 0; min-height: 22px; font-size: 16px; font-weight: 700; color: #b3300a">${esc(formError)}</p>
<button type="submit" class="b5-go" style="min-height: 58px; padding: 0 32px; border: 0; border-radius: 8px; background: ${INK}; color: #ffffff; font-size: 18px; font-weight: 800">Show my scorecard</button>
<p style="margin: 0; font-size: 14px; line-height: 1.5; color: #3d3d45">We'll use these details to follow up on your scorecard. See our <a href="/privacy/" style="color: ${INK}">privacy policy</a>.</p>
</form>
</div>`;
  }

  function bar(a, height) {
    return `<div role="img" aria-label="${a.score} out of 100" style="height: ${height}px; background: #3a3a42; border-radius: ${height / 2}px; overflow: hidden"><div style="width: ${Math.max(a.score, 3)}%; height: 100%; background: ${a.band.color}"></div></div>`;
  }

  function reportScreen() {
    const r = report();
    const sendNote = sendState === 'sent' ? 'Your scorecard has gone to the Back5 team. We will be in touch within two working days.'
      : sendState === 'failed' ? `We could not send your details to our team. Email ${cfg.contactEmail} and we will pick it up from there.`
      : sendState === 'sending' ? 'Sending your scorecard to the Back5 team...' : '';
    return `<div style="display: flex; flex-direction: column; gap: 64px">

<section style="display: flex; flex-direction: column; gap: 28px">
<div style="display: flex; flex-direction: column; gap: 10px">
<h1 tabindex="-1" style="${H1}">${esc(cfg.scoreTitle)}</h1>
<p style="margin: 0; font-size: 18px; color: ${SOFT}">${esc(contact.organisation || contact.name)}, ${esc(today())}</p>
<p id="b5-send" role="status" style="margin: 0; font-size: 16px; font-weight: 700; color: ${sendState === 'failed' ? ORANGE : SOFT}">${esc(sendNote)}</p>
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: 32px 56px; align-items: center">
<div style="background: ${r.band.color}; color: ${INK}; padding: clamp(26px, 3.6vw, 44px); clip-path: polygon(clamp(14px, 2.4vw, 32px) 0, 100% 0, calc(100% - clamp(14px, 2.4vw, 32px)) 100%, 0 100%); display: flex; flex-direction: column; gap: 4px">
<span style="font-size: 17px; font-weight: 800">Overall score</span>
<span style="font-size: clamp(88px, 12vw, 160px); line-height: 0.9; font-weight: 900; letter-spacing: -0.05em">${r.overall}<span style="font-size: 0.28em; letter-spacing: 0; font-weight: 800"> / 100</span></span>
<span style="font-size: clamp(22px, 2.4vw, 30px); font-weight: 900">${esc(r.band.label)}</span>
</div>
<p style="margin: 0; font-size: clamp(22px, 2.4vw, 30px); line-height: 1.3; font-weight: 800; max-width: 22em; text-wrap: balance">${esc(r.headline)}</p>
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); gap: 18px 40px">
${r.areas.map((a) => `<div style="display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px"><span style="font-size: 17px; font-weight: 800">${esc(a.name)}</span><span style="font-size: 17px; font-weight: 900">${a.score}</span></div>
${bar(a, 10)}
</div>`).join('\n')}
</div>
</section>

${r.priorities.length ? `<section style="display: flex; flex-direction: column; gap: 24px">
<h2 style="${H2}">${esc(cfg.prioritiesTitle)}</h2>
<ol style="margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 16px">
${r.priorities.map((a, i) => `<li style="background: #ffffff; color: ${INK}; padding: clamp(22px, 3vw, 36px); display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 8px clamp(16px, 2.4vw, 32px)">
<span aria-hidden="true" style="font-size: clamp(48px, 6vw, 80px); line-height: 0.9; font-weight: 900; font-style: italic; color: ${ORANGE}">${i + 1}</span>
<div style="display: flex; flex-direction: column; gap: 12px">
<div style="display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 16px"><h3 style="margin: 0; font-size: clamp(24px, 2.6vw, 34px); line-height: 1.1; font-weight: 900; letter-spacing: -0.02em">${esc(a.name)}</h3><span style="font-size: 16px; font-weight: 800">${a.score} / 100, ${esc(a.band.label.toLowerCase())}</span></div>
<p style="margin: 0; font-size: 18px; line-height: 1.5; color: #3d3d45; max-width: 40em">${esc(a.verdict)}</p>
<p style="margin: 0; font-size: 18px; line-height: 1.5; font-weight: 800; max-width: 40em">Do this first: <span style="font-weight: 600">${esc(a.actions[0])}</span></p>
<p style="margin: 0; font-size: 16px; line-height: 1.5; max-width: 40em">How Back5 helps: <a href="${esc(a.help.href)}" style="color: ${INK}; font-weight: 800; text-underline-offset: 4px">${esc(a.help.name)}</a>. ${esc(a.help.text)}</p>
</div>
</li>`).join('\n')}
</ol>
</section>` : `<section style="display: flex; flex-direction: column; gap: 14px">
<h2 style="${H2}">Nothing urgent.</h2>
<p style="margin: 0; font-size: 19px; line-height: 1.5; color: ${SOFT}; max-width: 36em">Every area scored 70 or above. The detail below shows where there is still something to gain.</p>
</section>`}

<section style="display: flex; flex-direction: column; gap: 8px">
<h2 style="${H2}; margin-bottom: 16px">Area by area</h2>
${r.areas.map((a) => `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 16px 56px; padding: 28px 0; border-top: 2px solid ${LINE}">
<div style="display: flex; flex-direction: column; gap: 12px">
<h3 style="margin: 0; display: flex; align-items: center; gap: 12px; font-size: clamp(22px, 2.2vw, 28px); line-height: 1.15; font-weight: 900; letter-spacing: -0.02em"><span style="color: ${cfg.accent}; display: flex">${icon(a.icon, 28)}</span>${esc(a.name)}</h3>
${bar(a, 14)}
<span style="font-size: 16px; font-weight: 800">${a.score} / 100, ${esc(a.band.label.toLowerCase())}</span>
</div>
<div style="display: flex; flex-direction: column; gap: 12px">
<p style="margin: 0; font-size: 18px; line-height: 1.5; font-weight: 700">${esc(a.verdict)}</p>
${a.actions.length ? `<ul style="margin: 0; padding: 0 0 0 20px; display: flex; flex-direction: column; gap: 8px; font-size: 17px; line-height: 1.5; color: ${SOFT}">${a.actions.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
</div>
</div>`).join('\n')}
</section>

<section style="background: ${cfg.accent}; color: ${INK}; padding: clamp(26px, 4vw, 48px); display: flex; flex-direction: column; gap: 20px">
<h2 style="${H2}">Take it with you.</h2>
<p style="margin: 0; font-size: 18px; line-height: 1.5; max-width: 36em">Download the scorecard for your next meeting. To talk it through, email <a href="mailto:${esc(cfg.contactEmail)}" style="color: ${INK}; font-weight: 800">${esc(cfg.contactEmail)}</a>.</p>
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 14px 24px">
<button type="button" class="b5-go" data-a="pdf" data-k="pdf" style="min-height: 58px; padding: 0 32px; border: 0; border-radius: 8px; background: ${INK}; color: #ffffff; font-size: 18px; font-weight: 800">Download scorecard (PDF)</button>
<span id="b5-pdf" role="status" style="font-size: 16px; font-weight: 800"></span>
</div>
</section>
<div style="display: flex">
<button type="button" data-a="restart" data-k="restart" style="${LINKBTN}">Start again</button>
</div>
</div>`;
  }

  /* ---------- render ---------- */
  function render() {
    const n = data.areas.length;
    const focusKey = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.k : null;
    app.innerHTML = typeof stage === 'number' ? areaScreen(stage) : stage === 'details' ? details() : reportScreen();
    const pos = typeof stage === 'number' ? stage + 1 : stage === 'details' ? n + 1 : n + 2;
    document.getElementById('b5-step').textContent = typeof stage === 'number' ? 'Area ' + pos + ' of ' + n : stage === 'details' ? 'Almost there' : 'Your scorecard';
    const prog = document.getElementById('b5-progress');
    prog.style.gridTemplateColumns = 'repeat(' + (n + 2) + ', 1fr)';
    prog.innerHTML = Array.from({ length: n + 2 }, (x, i) => `<span style="height: 6px; background: ${i < pos ? cfg.accent : '#3a3a42'}"></span>`).join('');
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
    const r = report();
    const lines = [];
    data.areas.forEach((a) => a.qs.forEach((q, i) => lines.push(q.q + ' ' + q.opts[(answers[a.id] || {})[i] || 0])));
    return {
      check: cfg.kind,
      organisation: contact.organisation, name: contact.name, email: contact.email, phone: contact.phone,
      score: r.overall + ' / 100 (' + r.band.label + ')',
      areas: r.areas.map((a) => a.name + ': ' + a.score + ' / 100 (' + a.band.label + ')').join('\n'),
      priorities: r.priorities.map((a, i) => (i + 1) + '. ' + a.name + ': ' + a.actions[0] + ' [' + a.help.name + ']').join('\n') || 'Nothing urgent',
      answers: lines.join('\n')
    };
  }

  async function send() {
    const payload = summary();
    sendState = 'sending';
    const task = fetch('/.netlify/functions/health-check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then((res) => res.ok).catch(() => false);
    const form = fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(Object.assign({ 'form-name': 'health-check' }, payload)).toString() })
      .then((res) => res.ok).catch(() => false);
    const results = await Promise.all([task, form]);
    sendState = results[0] || results[1] ? 'sent' : 'failed';
    if (stage === 'report') render();
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
    stage = 'report';
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
    const r = report();
    const logo = await loadLogo();
    const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210, M = 18, CW = W - 2 * M, GREY = '#3d3d45';
    const rgb = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    const fill = (hex) => doc.setFillColor.apply(doc, rgb(hex));
    const ink = (hex) => doc.setTextColor.apply(doc, rgb(hex));
    const font = (weight, size) => { doc.setFont('helvetica', weight); doc.setFontSize(size); };
    const paper = (c) => c === '#ffffff' ? INK : c;   // "good" is white on screen, black on paper
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
    const height = (text, size, width) => { font('normal', size); return doc.splitTextToSize(text, width || CW).length * size * 0.42; };
    const para = (text, size, weight, color, x, width) => {
      font(weight, size); ink(color);
      const lines = doc.splitTextToSize(text, width || CW);
      doc.text(lines, x || M, y); y += lines.length * size * 0.42;
    };

    header();
    ink(INK); font('bold', 22); doc.text(contact.organisation || contact.name, M, y); y += 7;
    font('normal', 10); ink(GREY);
    doc.text((contact.organisation ? contact.name + ', ' : '') + today(), M, y); y += 9;

    const top = paper(r.band.color);
    fill(top); doc.rect(M, y, 62, 40, 'F');
    ink(top === INK ? '#ffffff' : INK);
    font('bold', 10); doc.text('Overall score', M + 6, y + 9);
    font('bold', 40); doc.text(String(r.overall), M + 6, y + 27);
    const numW = doc.getTextWidth(String(r.overall));
    font('bold', 12); doc.text('/ 100', M + 8 + numW, y + 27);
    font('bold', 12); doc.text(r.band.label, M + 6, y + 35);
    ink(INK); font('bold', 13);
    doc.text(doc.splitTextToSize(r.headline, CW - 70), M + 70, y + 10);
    y += 50;

    ink(INK); font('bold', 14); doc.text('Score by area', M, y); y += 7;
    r.areas.forEach((a) => {
      ink(INK); font('bold', 10.5); doc.text(a.name, M, y);
      doc.text(a.score + ' / 100', W - M, y, { align: 'right' });
      fill('#E3E3DF'); doc.rect(M, y + 2, CW, 3, 'F');
      fill(paper(a.band.color)); doc.rect(M, y + 2, CW * Math.max(a.score, 3) / 100, 3, 'F');
      y += 11.5;
    });

    if (r.priorities.length) {
      y += 4; need(30);
      ink(INK); font('bold', 14); doc.text(cfg.prioritiesTitle, M, y); y += 8;
      r.priorities.forEach((a, i) => {
        const block = 7 + height(a.verdict, 10, CW - 12) + height('Do this first: ' + a.actions[0], 10, CW - 12) + height('How Back5 helps: ' + a.help.name + '. ' + a.help.text, 9, CW - 12) + 9;
        need(block);
        ink(ORANGE); font('bold', 22); doc.text(String(i + 1), M, y + 3);
        ink(INK); font('bold', 13); doc.text(a.name + '  (' + a.score + ' / 100)', M + 12, y); y += 6;
        para(a.verdict, 10, 'normal', GREY, M + 12, CW - 12); y += 1.5;
        para('Do this first: ' + a.actions[0], 10, 'bold', INK, M + 12, CW - 12); y += 1.5;
        para('How Back5 helps: ' + a.help.name + '. ' + a.help.text, 9, 'normal', GREY, M + 12, CW - 12); y += 7;
      });
    }

    y += 2; need(24);
    ink(INK); font('bold', 14); doc.text('Area by area', M, y); y += 8;
    r.areas.forEach((a) => {
      const block = 6 + height(a.verdict, 10) + a.actions.reduce((s, t) => s + height(t, 9.5, CW - 5) + 1.2, 0) + 6;
      need(block);
      ink(INK); font('bold', 12); doc.text(a.name, M, y);
      font('bold', 10); doc.text(a.score + ' / 100, ' + a.band.label.toLowerCase(), W - M, y, { align: 'right' }); y += 5.5;
      para(a.verdict, 10, 'normal', INK); y += 1.5;
      a.actions.forEach((t) => {
        font('normal', 9.5); ink(GREY); doc.text('-', M, y);
        para(t, 9.5, 'normal', GREY, M + 5, CW - 5); y += 1.2;
      });
      y += 5;
    });
    footer();
    const slug = (contact.organisation || contact.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'scorecard';
    doc.save('back5-' + cfg.fileWord + '-' + slug + '.pdf');
    status.textContent = 'Downloaded.';
  }

  /* ---------- events ---------- */
  function click(e) {
    const b = e.target.closest('[data-a]');
    if (!b || b.disabled) return;
    const a = b.dataset.a, n = data.areas.length;
    if (a === 'answer') {
      const p = b.dataset.k.slice(1).split('-').map(Number);
      const id = data.areas[stage].id;
      answers[id] = answers[id] || {};
      answers[id][p[0]] = p[1];
      render();
    } else if (a === 'next') { stage = stage === n - 1 ? 'details' : stage + 1; render(); }
    else if (a === 'back') { stage = stage === 'details' ? n - 1 : stage - 1; render(); }
    else if (a === 'pdf') pdf();
    else if (a === 'restart') {
      Object.keys(answers).forEach((k) => delete answers[k]);
      stage = 0; sendState = 'idle'; formError = '';
      render();
    }
  }

  function start(copy) {
    cfg = copy;
    data = window.B5_CHECK;
    app = document.getElementById('b5-app');
    app.addEventListener('click', click);
    app.addEventListener('submit', submit);
    render();
  }

  return { start };
})();
