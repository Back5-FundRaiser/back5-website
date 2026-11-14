/* Back5 health check report: builds the PDF scorecard.
   Called by health-check.js as B5Report.make({ cfg, report, contact, date }).
   Everything is drawn from the report data, so any club, score or length of
   text works. Text is real text (selectable), shapes are vector, and the
   email, website and button are live links.

   Pages: 1 overview, 2 priorities, 3+ roadmap, with the contact section at
   the foot of the last page. The roadmap runs onto another page when a
   club's advice is too long to fit beside the contact section. */
const B5Report = (() => {
  const INK = '#111116', YELLOW = '#EFD018', ORANGE = '#F4450F', GREY = '#55555c', PAPER = '#F5F5F2', TRACK = '#E4E4DF', TINT = '#FBF4C4';
  const W = 210, H = 297, M = 16, CW = W - 2 * M;
  const PT = 0.3528; // one point in millimetres
  const cache = {};

  /* ---------- loading ---------- */
  const b64 = (buf) => {
    const bytes = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  };
  const loadFont = (file) => fetch('/assets/fonts/' + file).then((r) => { if (!r.ok) throw new Error(file); return r.arrayBuffer(); }).then(b64);
  const loadImage = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      try { resolve({ data: c.toDataURL('image/png'), ratio: img.naturalHeight / img.naturalWidth }); } catch (err) { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
  async function assets(photo) {
    if (!cache.done) {
      const [r, b, x, logo, person] = await Promise.all([
        loadFont('NunitoSans_400Regular.ttf').catch(() => null),
        loadFont('NunitoSans_700Bold.ttf').catch(() => null),
        loadFont('NunitoSans_900Black.ttf').catch(() => null),
        loadImage('/assets/back5-logo-white.png'),
        loadImage(photo)
      ]);
      Object.assign(cache, { r: r, b: b, x: x, logo: logo, person: person, done: true });
    }
    return cache;
  }

  /* ---------- the report ---------- */
  async function make(input) {
    const cfg = input.cfg, rep = input.report, contact = input.contact, date = input.date;
    const a = await assets(cfg.rep.photo);
    const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', compress: true });
    const brandFont = a.r && a.b && a.x;
    if (brandFont) {
      doc.addFileToVFS('ns-r.ttf', a.r); doc.addFont('ns-r.ttf', 'NSR', 'normal');
      doc.addFileToVFS('ns-b.ttf', a.b); doc.addFont('ns-b.ttf', 'NSB', 'normal');
      doc.addFileToVFS('ns-x.ttf', a.x); doc.addFont('ns-x.ttf', 'NSX', 'normal');
    }

    const rgb = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    const fill = (hex) => doc.setFillColor.apply(doc, rgb(hex));
    const stroke = (hex) => doc.setDrawColor.apply(doc, rgb(hex));
    const ink = (hex) => doc.setTextColor.apply(doc, rgb(hex));
    const font = (w, size) => {
      if (brandFont) doc.setFont(w === 'r' ? 'NSR' : w === 'b' ? 'NSB' : 'NSX', 'normal');
      else doc.setFont('helvetica', w === 'r' ? 'normal' : 'bold');
      doc.setFontSize(size);
    };
    const lh = (size) => size * PT * 1.34;
    const wrap = (text, w, weight, size) => { font(weight, size); return doc.splitTextToSize(String(text), w); };
    const blockH = (text, w, weight, size) => wrap(text, w, weight, size).length * lh(size);
    // Draws wrapped text with its top edge at y. Returns the y below it.
    const block = (text, x, y, w, weight, size, color, opts) => {
      const lines = wrap(text, w, weight, size);
      ink(color);
      lines.forEach((ln, i) => doc.text(ln, x, y + size * PT * 0.82 + i * lh(size), opts || {}));
      return y + lines.length * lh(size);
    };
    const line = (text, x, y, weight, size, color, opts) => { font(weight, size); ink(color); doc.text(String(text), x, y, opts || {}); return doc.getTextWidth(String(text)); };
    const label = (text, x, y, color) => { font('x', 7); ink(color || GREY); doc.text(text.toUpperCase(), x, y, { charSpace: 0.35 }); };

    const status = (key) => key === 'low' ? { bg: ORANGE, fg: INK, bar: ORANGE } : key === 'mid' ? { bg: YELLOW, fg: INK, bar: YELLOW } : { bg: INK, fg: '#ffffff', bar: INK };
    const pill = (text, x, y, key) => {
      const s = status(key);
      font('x', 7.5);
      const w = doc.getTextWidth(text) + 5.6;
      fill(s.bg); doc.roundedRect(x, y, w, 5.4, 2.7, 2.7, 'F');
      ink(s.fg); doc.text(text, x + 2.8, y + 3.75);
      return w;
    };
    const bar = (x, y, w, h, score, key) => {
      fill(TRACK); doc.roundedRect(x, y, w, h, h / 2, h / 2, 'F');
      fill(status(key).bar); doc.roundedRect(x, y, Math.max(w * score / 100, h), h, h / 2, h / 2, 'F');
    };
    const ring = (cx, cy, r, width, score, key) => {
      doc.setLineWidth(width); doc.setLineCap('round');
      stroke(TRACK); doc.circle(cx, cy, r, 'S');
      if (score > 0) {
        stroke(status(key).bar);
        const end = Math.min(score, 100) / 100 * Math.PI * 2, steps = Math.max(2, Math.round(end / 0.05));
        let px = cx, py = cy - r;
        for (let i = 1; i <= steps; i++) {
          const t = end * i / steps, nx = cx + r * Math.sin(t), ny = cy - r * Math.cos(t);
          doc.line(px, py, nx, ny); px = nx; py = ny;
        }
      }
      doc.setLineCap('butt');
    };

    const header = () => {
      fill(INK); doc.rect(0, 0, W, 20, 'F');
      if (a.logo) doc.addImage(a.logo.data, 'PNG', M, 5.2, 29, 29 * a.logo.ratio, 'logo', 'FAST');
      line(cfg.kind, W - M, 11.6, 'x', 10, '#ffffff', { align: 'right' });
    };
    const newPage = () => { doc.addPage(); header(); };
    const two = (n) => (n < 10 ? '0' : '') + n;
    const who = contact.organisation || contact.name;

    /* ----- page 1: overview ----- */
    header();
    let y = 31;
    y = block(cfg.report.title, M, y, CW, 'x', 29, INK) + 5;
    const meta = [];
    if (contact.organisation) meta.push([cfg.orgLabel, contact.organisation]);
    meta.push(['Assessment date', date]);
    meta.push(['Completed by', contact.name]);
    const mw = CW / meta.length;
    let metaBottom = y;
    meta.forEach((m, i) => {
      label(m[0], M + i * mw, y + 2.6);
      metaBottom = Math.max(metaBottom, block(m[1], M + i * mw, y + 5, mw - 6, 'b', 11.5, INK));
    });
    y = metaBottom + 8;

    const headLines = wrap(rep.headline, CW - 78, 'b', 14);
    const cardH = Math.max(62, 26 + headLines.length * lh(14) + 12);
    fill(PAPER); doc.roundedRect(M, y, CW, cardH, 5, 5, 'F');
    const cx = M + 35, cy = y + cardH / 2;
    ring(cx, cy, 22, 5.5, rep.overall, rep.band.key);
    line(rep.overall, cx, cy + 3.2, 'x', 32, INK, { align: 'center' });
    line('/ 100', cx, cy + 9.6, 'b', 9, GREY, { align: 'center' });
    const tx = M + 70, ty = y + (cardH - (5.4 + 6 + 4 + 5 + headLines.length * lh(14))) / 2;
    label('Overall score', tx, ty + 2.6);
    pill(rep.band.label, tx, ty + 5.5, rep.band.key);
    block(rep.headline, tx, ty + 16, CW - 78, 'b', 14, INK);
    y += cardH + 11;

    line('How each area scored', M, y, 'x', 15, INK); y += 8;
    rep.areas.forEach((ar) => {
      line(ar.name, M, y + 1.2, 'b', 10.5, INK);
      bar(M + 62, y - 1.9, CW - 62 - 22, 3.8, ar.score, ar.band.key);
      line(ar.score, W - M - 11.5, y + 1.2, 'x', 11, INK, { align: 'right' });
      line('/ 100', W - M, y + 1.2, 'r', 8.5, GREY, { align: 'right' });
      y += 9.3;
    });
    y += 6;

    if (rep.priorities.length) {
      line(cfg.report.prioritiesTitle, M, y, 'x', 15, INK); y += 5.5;
      const n = rep.priorities.length, gap = 5, pw = (CW - gap * (n - 1)) / n;
      const ph = Math.max.apply(null, rep.priorities.map((p) => 17 + blockH(p.name, pw - 12, 'x', 11.5) + 11));
      rep.priorities.forEach((p, i) => {
        const px = M + i * (pw + gap);
        fill(PAPER); doc.roundedRect(px, y, pw, ph, 4, 4, 'F');
        line(two(i + 1), px + 6, y + 12.5, 'x', 22, ORANGE);
        const by = block(p.name, px + 6, y + 17, pw - 12, 'x', 11.5, INK);
        line(p.score + ' / 100', px + 6, by + 5, 'b', 9, GREY);
      });
    } else {
      line('Nothing urgent', M, y, 'x', 15, INK);
      block('Every area scored 70 or above. The roadmap shows where there is still something to gain.', M, y + 4, CW, 'r', 11, GREY);
    }

    /* ----- page 2: priorities ----- */
    if (rep.priorities.length) {
      newPage();
      y = 31;
      y = block(cfg.report.improveTitle, M, y, CW, 'x', 24, INK) + 2.5;
      y = block(cfg.report.improveIntro, M, y, CW - 30, 'r', 10.5, GREY) + 5;
      const pad = 6.5, leftW = 44, rx = M + pad + leftW + 6, rw = CW - pad * 2 - leftW - 6;
      rep.priorities.forEach((p, i) => {
        const hChallenge = blockH(p.verdict, rw, 'r', 9.8);
        const hStep = blockH(p.actions[0], rw - 8, 'b', 9.8);
        const helpText = p.help.name + ': ' + p.help.text;
        const hHelp = blockH(helpText, rw, 'r', 9.8);
        const rightH = (4.6 + hChallenge) + 3.5 + (3.5 + 4.6 + hStep + 3.5) + 3.5 + (4.6 + hHelp);
        const nameH = blockH(p.name, leftW, 'x', 15.5);
        const leftH = 5 + nameH + 4 + 10 + 3 + 5.4;
        const h = Math.max(rightH, leftH) + pad * 2;
        if (y + h > 285) { newPage(); y = 31; }
        fill(PAPER); doc.roundedRect(M, y, CW, h, 5, 5, 'F');
        // left: what and how bad
        let ly = y + pad;
        font('x', 8); ink(ORANGE); doc.text('PRIORITY ' + two(i + 1), M + pad, ly + 3, { charSpace: 0.4 });
        ly = block(p.name, M + pad, ly + 5, leftW, 'x', 15.5, INK) + 4;
        const sw = line(p.score, M + pad, ly + 8, 'x', 24, INK);
        line('/ 100', M + pad + sw + 1.6, ly + 8, 'b', 9, GREY);
        pill(p.band.label, M + pad, ly + 12, p.band.key);
        // right: challenge, first step, how Back5 helps
        let ry = y + pad;
        label('The challenge', rx, ry + 2.6); ry = block(p.verdict, rx, ry + 4.6, rw, 'r', 9.8, INK) + 3.5;
        fill(TINT); doc.roundedRect(rx - 4, ry, rw + 4, 3.5 + 4.6 + hStep + 3.5, 3, 3, 'F');
        label('Your first step', rx, ry + 3.5 + 2.6, INK); block(p.actions[0], rx, ry + 3.5 + 4.6, rw - 8, 'b', 9.8, INK);
        ry += 3.5 + 4.6 + hStep + 3.5 + 3.5;
        label('How Back5 can help', rx, ry + 2.6); block(helpText, rx, ry + 4.6, rw, 'r', 9.8, INK);
        y += h + 4;
      });
    }

    /* ----- page 3+: roadmap, then the contact section ----- */
    const CONTACT_H = 56, OVERLAP = 9;
    const colGap = 6, colW = (CW - colGap) / 2, cpad = 5.5, inner = colW - cpad * 2;
    const cards = rep.areas.map((ar) => {
      const vh = blockH(ar.verdict, inner, 'b', 9.3);
      const acts = ar.actions.map((t) => ({ t: t, h: blockH(t, inner - 4.5, 'r', 9) }));
      const h = cpad + 6 + 3 + 5.4 + 4 + vh + (acts.length ? 3.5 + acts.reduce((s, x) => s + x.h + 2, 0) - 2 : 0) + cpad;
      return { ar: ar, vh: vh, acts: acts, h: h };
    });
    const drawCard = (c, x, top) => {
      fill(PAPER); doc.roundedRect(x, top, colW, c.h, 4, 4, 'F');
      let cy2 = top + cpad;
      line(c.ar.name, x + cpad, cy2 + 4.2, 'x', 11.5, INK);
      line('/ 100', x + colW - cpad, cy2 + 4.2, 'r', 8, GREY, { align: 'right' });
      font('r', 8); const sfx = doc.getTextWidth('/ 100');
      line(c.ar.score, x + colW - cpad - sfx - 1.4, cy2 + 4.2, 'x', 11.5, INK, { align: 'right' });
      cy2 += 6 + 3;
      pill(c.ar.band.label, x + cpad, cy2, c.ar.band.key);
      cy2 += 5.4 + 4;
      cy2 = block(c.ar.verdict, x + cpad, cy2, inner, 'b', 9.3, INK);
      if (c.acts.length) {
        cy2 += 3.5;
        c.acts.forEach((act) => {
          fill(ORANGE); doc.circle(x + cpad + 1, cy2 + 1.9, 0.75, 'F');
          block(act.t, x + cpad + 4.5, cy2, inner - 4.5, 'r', 9, GREY);
          cy2 += act.h + 2;
        });
      }
    };
    // Packs cards into two columns between `top` and `limit`. Returns how many fitted.
    const pack = (list, top, limit, draw) => {
      const cols = [top, top];
      let n = 0;
      for (; n < list.length; n++) {
        const k = cols[0] <= cols[1] ? 0 : 1;
        const pick = cols[k] + list[n].h <= limit ? k : (cols[1 - k] + list[n].h <= limit ? 1 - k : -1);
        if (pick < 0) break;
        if (draw) drawCard(list[n], M + pick * (colW + colGap), cols[pick]);
        cols[pick] += list[n].h + 4;
      }
      return n;
    };
    // The last roadmap page shares its space with the contact section. Work out
    // the fewest cards that must go on earlier pages for the rest to fit there.
    const lastLimit = H - CONTACT_H - OVERLAP - 5;
    const titleH = blockH(cfg.report.roadmapTitle, CW, 'x', 24) + 6;
    let split = 0;
    while (split < cards.length && pack(cards.slice(split), 31 + (split === 0 ? titleH : 0), lastLimit, false) < cards.length - split) split++;
    // When the roadmap needs two pages anyway, share the cards between them
    // evenly instead of leaving one page nearly empty.
    if (split > 0) {
      const even = Math.ceil(cards.length / 2);
      if (even > split && pack(cards.slice(0, even), 31 + titleH, 281, false) === even) split = even;
    }
    let head = cards.slice(0, split), first = true;
    const startPage = () => {
      newPage();
      if (!first) return 31;
      first = false;
      return block(cfg.report.roadmapTitle, M, 31, CW, 'x', 24, INK) + 6;
    };
    while (head.length) {
      const n = pack(head, startPage(), 281, true);
      head = head.slice(n || 1);
    }
    pack(cards.slice(split), startPage(), lastLimit, true);

    // contact section, at the foot of the last page
    const cTop = H - CONTACT_H;
    fill(INK); doc.rect(0, cTop, W, CONTACT_H, 'F');
    let textX = M;
    if (a.person) {
      const ph = CONTACT_H + OVERLAP, pw = ph / a.person.ratio;
      doc.addImage(a.person.data, 'PNG', 5, H - ph, pw, ph, 'rep', 'FAST');
      textX = 5 + pw + 8;
    }
    const textW = W - M - textX;
    let ty2 = cTop + 9;
    ty2 = block('Chat to ' + cfg.rep.name + ' if you want to know more.', textX, ty2, textW, 'x', 15.5, '#ffffff') + 2.5;
    ty2 = block(cfg.report.contactCopy, textX, ty2, textW, 'r', 9.8, '#d2d2d8') + 5;
    font('b', 10.5); ink('#ffffff');
    doc.textWithLink(cfg.rep.email, textX, ty2 + 3, { url: 'mailto:' + cfg.rep.email });
    const ew = doc.getTextWidth(cfg.rep.email);
    doc.textWithLink(cfg.rep.site, textX + ew + 8, ty2 + 3, { url: 'https://' + cfg.rep.site });
    const bw = 36, bh = 9.5, bx = textX, by2 = Math.min(ty2 + 8, H - bh - 6);
    fill(YELLOW); doc.roundedRect(bx, by2, bw, bh, 2.5, 2.5, 'F');
    line('Get in touch', bx + bw / 2, by2 + 6.2, 'x', 10.5, INK, { align: 'center' });
    doc.link(bx, by2, bw, bh, { url: 'mailto:' + cfg.rep.email });

    // footers on every page except the last, which ends with the contact section
    const total = doc.getNumberOfPages();
    for (let p = 1; p < total; p++) {
      doc.setPage(p);
      line(who + ', ' + date, M, 290, 'r', 8, GREY);
      line('Page ' + p + ' of ' + total, W - M, 290, 'r', 8, GREY, { align: 'right' });
    }
    doc.setPage(total);

    const slug = who.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'scorecard';
    doc.save('back5-' + cfg.fileWord + '-' + slug + '.pdf');
  }

  return { make };
})();
