/* Back5 health checks: shared renderer.
   Each check page loads this file, then its own data file (which defines
   `class Component extends DCLogic` with the problems, questions and scoring),
   then calls B5Check.start(copy). */
class DCLogic {
  setState(patch) {
    Object.assign(this.state, patch);
    B5Check.render();
  }
}

const B5Check = (() => {
  let comp, cfg, app, lastStep = null;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (d, size) => d ? `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" style="flex: none; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"><path d="${esc(d)}"></path></svg>` : '';
  const H1 = 'margin: 0; font-size: clamp(40px, 5.6vw, 80px); line-height: 0.98; font-weight: 900; letter-spacing: -0.035em; text-wrap: balance';
  const GO = (bg) => `min-height: 58px; padding: 0 32px; border: 0; border-radius: 8px; background: ${bg}; color: #111116; font-size: 18px; font-weight: 800`;
  const LINKBTN = 'min-height: 44px; padding: 0; border: 0; background: none; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: underline; text-underline-offset: 5px';
  const SWATCH = (bg) => `flex: none; width: 44px; height: 34px; background: ${bg}; clip-path: polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%); display: flex; align-items: center; justify-content: center; color: #111116`;

  function pick(v) {
    return `<div style="display: flex; flex-direction: column; gap: 32px">
<div style="display: flex; flex-direction: column; gap: 18px">
<h1 tabindex="-1" style="${H1}">${esc(cfg.pickTitle)}</h1>
<p style="margin: 0; font-size: 20px; line-height: 1.5; color: #d2d2d8; max-width: 34em">${esc(cfg.pickIntro)}</p>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 12px">
${v.problems.map((p, i) => `<button type="button" class="b5-opt" aria-pressed="${p.pressed}" data-a="toggle" data-k="p${i}" style="display: inline-flex; align-items: center; gap: 12px; min-height: 56px; padding: 8px 24px; border: 2px solid ${p.border}; border-radius: 999px; background: ${p.bg}; color: ${p.fg}; font-size: 18px; font-weight: 700; text-align: left">${icon(p.icon, 24)}${esc(p.text)}</button>`).join('\n')}
</div>
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px; padding-top: 8px">
<button type="button" class="b5-go" data-a="toQuestions" data-k="next" ${v.nonePicked ? 'disabled' : ''} style="${GO(cfg.accent)}">${esc(v.nextLabel)}</button>
<span style="font-size: 16px; color: #d2d2d8">Takes about three minutes. No sign-up to see your result.</span>
</div>
</div>`;
  }

  function questions(v) {
    return `<div style="display: flex; flex-direction: column; gap: 48px">
<div style="display: flex; flex-direction: column; gap: 14px">
<h1 tabindex="-1" style="margin: 0; font-size: clamp(34px, 4.4vw, 60px); line-height: 1; font-weight: 900; letter-spacing: -0.035em; text-wrap: balance">A bit more on what you picked.</h1>
<p style="margin: 0; font-size: 19px; line-height: 1.5; color: #d2d2d8; max-width: 34em">Go with your gut. Close enough is fine.</p>
</div>
${v.groups.map((g, gi) => `<section style="display: flex; flex-direction: column; gap: 28px; padding-top: 28px; border-top: 2px solid #ffffff">
<div style="display: flex; align-items: center; gap: 16px">
<span aria-hidden="true" style="${SWATCH(g.swatch)}"></span>
<h2 style="margin: 0; font-size: clamp(22px, 2.2vw, 28px); line-height: 1.15; font-weight: 900; letter-spacing: -0.02em">${esc(g.text)}</h2>
</div>
${g.questions.map((q, qi) => `<fieldset style="margin: 0; padding: 0; border: 0; display: flex; flex-direction: column">
<legend style="padding: 0; margin-bottom: 14px; font-size: 19px; line-height: 1.4; font-weight: 700">${esc(q.q)}</legend>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)); gap: 12px">
${q.opts.map((o, oi) => `<button type="button" class="b5-opt" aria-pressed="${o.pressed}" data-a="answer" data-k="a${gi}-${qi}-${oi}" style="min-height: 68px; padding: 14px 18px; border: 2px solid ${o.border}; border-radius: 10px; background: ${o.bg}; color: ${o.fg}; font-size: 16px; line-height: 1.35; font-weight: 700; text-align: left">${esc(o.label)}</button>`).join('\n')}
</div>
</fieldset>`).join('\n')}
</section>`).join('\n')}
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px 28px; padding-top: 8px">
<button type="button" class="b5-go" data-a="toResult" data-k="result" style="${GO(cfg.accent)}">See what would help</button>
<button type="button" data-a="toPick" data-k="back" style="${LINKBTN}">Change what I picked</button>
<span style="font-size: 16px; color: #d2d2d8">${esc(v.answeredLabel)}</span>
</div>
</div>`;
  }

  function result(v) {
    const field = (id, label, type, auto) => `<div style="display: flex; flex-direction: column; gap: 6px">
<label for="${id}" style="font-size: 15px; font-weight: 800">${esc(label)}</label>
<input id="${id}" type="${type}" autocomplete="${auto}" required style="min-height: 52px; padding: 0 16px; border: 2px solid #111116; border-radius: 8px; font-size: 17px; color: #111116; background: #ffffff">
</div>`;
    return `<div style="display: flex; flex-direction: column; gap: 40px">
<h1 tabindex="-1" style="${H1}">${esc(cfg.resultTitle)}</h1>
${v.noFit ? `<p style="margin: 0; font-size: 21px; line-height: 1.5; color: #d2d2d8; max-width: 34em">${esc(cfg.noFit)}</p>` : ''}
${v.hasTop ? `<section style="background: ${v.top.bg}; color: ${v.top.fg}; padding: clamp(28px, 4vw, 56px) clamp(24px, 5vw, 72px); clip-path: polygon(clamp(16px, 3vw, 44px) 0, 100% 0, calc(100% - clamp(16px, 3vw, 44px)) 100%, 0 100%); display: flex; flex-direction: column; gap: 14px">
<span style="display: flex; align-items: center; gap: 12px; font-size: 17px; font-weight: 800">${icon(v.top.icon, 36)}Start here</span>
<h2 style="margin: 0; font-size: clamp(36px, 5vw, 68px); line-height: 1; font-weight: 900; letter-spacing: -0.035em">${esc(v.top.name)}</h2>
<p style="margin: 0; font-size: 20px; line-height: 1.45; font-weight: 600; max-width: 30em">${esc(v.top.text)}</p>
<p style="margin: 0; font-size: 16px; line-height: 1.45; max-width: 36em">${esc(v.top.because)}</p>
</section>` : ''}
${v.hasRest ? `<div style="display: flex; flex-direction: column">
<h2 style="margin: 0 0 18px; font-size: 22px; font-weight: 900; letter-spacing: -0.01em">Also worth a look</h2>
${v.rest.map((r) => `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); gap: 10px 40px; align-items: start; padding: 24px 0; border-top: 2px solid #ffffff">
<div style="display: flex; align-items: center; gap: 16px">
<span aria-hidden="true" style="${SWATCH(r.swatch)}">${icon(r.icon, 20)}</span>
<span style="font-size: 26px; font-weight: 900; letter-spacing: -0.02em">${esc(r.name)}</span>
</div>
<div style="display: flex; flex-direction: column; gap: 8px">
<p style="margin: 0; font-size: 17px; line-height: 1.5; font-weight: 600">${esc(r.text)}</p>
<p style="margin: 0; font-size: 15px; line-height: 1.45; color: #d2d2d8">${esc(r.because)}</p>
</div>
</div>`).join('\n')}
</div>` : ''}
<form id="b5-form" novalidate style="background: #ffffff; color: #111116; border-radius: 12px; padding: clamp(24px, 4vw, 48px); display: flex; flex-direction: column; gap: 24px">
<div style="display: flex; flex-direction: column; gap: 10px">
<h2 style="margin: 0; font-size: clamp(26px, 3vw, 38px); line-height: 1.05; font-weight: 900; letter-spacing: -0.03em">${esc(cfg.formTitle)}</h2>
<p style="margin: 0; font-size: 18px; line-height: 1.5; color: #3d3d45; max-width: 36em">${esc(cfg.formIntro)}</p>
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr)); gap: 16px">
${field('b5-org', cfg.orgLabel, 'text', 'organization')}
${field('b5-name', 'Your name', 'text', 'name')}
${field('b5-email', cfg.emailLabel, 'email', 'email')}
</div>
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 14px 24px">
<button type="submit" class="b5-go" id="b5-send" style="min-height: 56px; padding: 0 30px; border: 0; border-radius: 8px; background: #111116; color: #ffffff; font-size: 18px; font-weight: 800">Send my result and book a call</button>
<span id="b5-status" role="status" style="font-size: 16px; font-weight: 700; color: #3d3d45"></span>
</div>
</form>
<div style="display: flex">
<button type="button" data-a="restart" data-k="restart" style="${LINKBTN}">Start again</button>
</div>
</div>`;
  }

  function render() {
    const v = comp.renderVals();
    const step = comp.state.step;
    const focusKey = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.k : null;
    app.innerHTML = step === 'pick' ? pick(v) : step === 'questions' ? questions(v) : result(v);
    document.getElementById('b5-step').textContent = v.stepLabel;
    if (step !== lastStep) {
      if (lastStep !== null) {
        window.scrollTo(0, 0);
        const h = app.querySelector('h1');
        if (h) h.focus();
      }
      lastStep = step;
    } else if (focusKey) {
      const el = app.querySelector('[data-k="' + focusKey + '"]');
      if (el) el.focus();
    }
  }

  function summary() {
    const v = comp.renderVals();
    const answers = [];
    v.groups.forEach((g) => g.questions.forEach((q) => {
      const chosen = q.opts.find((o) => o.pressed === 'true');
      answers.push(q.q + ' ' + (chosen ? chosen.label : '(not answered)'));
    }));
    return {
      check: cfg.kind,
      problems: v.groups.map((g) => g.text).join('\n'),
      answers: answers.join('\n'),
      start_here: v.hasTop ? v.top.name : 'No clear starting point',
      also_consider: v.rest.map((r) => r.name).join(', ')
    };
  }

  async function submit(e) {
    e.preventDefault();
    const status = document.getElementById('b5-status');
    const org = document.getElementById('b5-org').value.trim();
    const name = document.getElementById('b5-name').value.trim();
    const email = document.getElementById('b5-email').value.trim();
    if (!org || !name || !/^\S+@\S+\.\S+$/.test(email)) {
      status.textContent = 'Add your ' + cfg.orgLabel.toLowerCase() + ', your name and a valid email, then send again.';
      return;
    }
    const btn = document.getElementById('b5-send');
    btn.disabled = true;
    status.textContent = 'Sending...';
    const data = Object.assign({ 'form-name': 'health-check', organisation: org, name: name, email: email }, summary());
    try {
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data).toString() });
      if (!res.ok) throw new Error(String(res.status));
      status.textContent = 'Sent. We will be in touch within two working days.';
    } catch (err) {
      btn.disabled = false;
      status.textContent = 'That did not send. Check your connection and try again.';
    }
  }

  function click(e) {
    const b = e.target.closest('[data-a]');
    if (!b || b.disabled) return;
    const v = comp.renderVals();
    const a = b.dataset.a, k = b.dataset.k;
    if (a === 'toggle') v.problems[Number(k.slice(1))].toggle();
    else if (a === 'answer') { const [g, q, o] = k.slice(1).split('-').map(Number); v.groups[g].questions[q].opts[o].pick(); }
    else if (typeof v[a] === 'function') v[a]();
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
