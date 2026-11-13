class Component extends DCLogic {
constructor(...args) {
super(...args);
this.state = Object.assign({ step: 'pick', picked: {}, answers: {}, sent: false }, this.state || {});
}
strands() {
const o = '#F4450F';
return {
access: { name: 'A consented line to club families', color: o, fg: '#111116', text: 'Clubs in a program run on one platform, so members can opt in to hear from you directly.' },
presence: { name: 'A place in the club routine', color: o, fg: '#111116', text: 'Your brand sits inside the app and messages families use every week, well beyond a sign on the fence.' },
activation: { name: 'Activations, run for you', color: o, fg: '#111116', text: 'Game-day campaigns and kits delivered club by club, with participation tracked through the app.' },
local: { name: 'Local messages at the right moment', color: o, fg: '#111116', text: 'Training and game schedules tell us when a nearby offer will be useful to a family.' },
value: { name: 'A give-back clubs can see', color: o, fg: '#111116', text: 'Purchases link back to the member’s club, so spending with you helps fund their team.' },
proof: { name: 'Proof you can take to the board', color: o, fg: '#111116', text: 'Engagement, participation and agreed outcomes, reported for every club in the program.' }
};
}
problemData() {
return [
{ id: 'proof', icon: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2', strand: 'proof', text: 'We sponsor sport but can’t show what it returned', short: 'showing a return', qs: [
{ q: 'How do you report on your sport sponsorship today?', opts: [['Reach and logo exposure estimates', { proof: 3 }], ['Campaign results, but not tied to the sponsorship', { proof: 2 }], ['Sales or sign-ups we can trace back to it', {}]] },
{ q: 'If the board asked what last season’s community spend delivered, what could you show?', opts: [['Photos and a thank-you letter', { proof: 3, value: 1 }], ['Engagement numbers from our own channels', { proof: 2 }], ['A clear line from spend to outcome', {}]] }
] },
{ id: 'reach', icon: 'M4 5h16v11H9l-5 4z', strand: 'access', text: 'Our money buys logos, with no way to talk to the families', short: 'reaching families', qs: [
{ q: 'Can you contact the families at the clubs you support?', opts: [['No, the club or league holds every contact', { access: 3 }], ['Only if they join our loyalty program on their own', { access: 2, presence: 1 }], ['Yes, with their consent', {}]] },
{ q: 'Where does your brand appear in a normal club week?', opts: [['On signage at the ground', { presence: 3 }], ['Signage, plus the odd social post', { presence: 2 }], ['In the tools members use every week', {}]] }
] },
{ id: 'activation', icon: 'M3 10v4h3l7 4V6L6 10z M17 9a4 4 0 0 1 0 6', strand: 'activation', text: 'Activations are expensive and hard to run across many clubs', short: 'activations', qs: [
{ q: 'How many clubs can your team activate at in a season?', opts: [['A handful, with agency help', { activation: 3 }], ['Dozens, but it stretches us', { activation: 2 }], ['As many as we want', {}]] },
{ q: 'What happens at a typical activation?', opts: [['A marquee, staff and giveaways', { activation: 2, proof: 2 }], ['The club runs something with our kit', { activation: 2 }], ['Members take part on their phones and we see who did', {}]] }
] },
{ id: 'local', icon: 'M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z M12 12.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5z', strand: 'local', text: 'Our national campaigns don’t feel local', short: 'local relevance', qs: [
{ q: 'Do your messages change with what is happening at a member’s club?', opts: [['No, everyone gets the national campaign', { local: 3 }], ['By state or region', { local: 2 }], ['By club, team and time of season', {}]] },
{ q: 'Do you have stores or outlets near the grounds?', opts: [['Yes, and we can’t tell if club families visit', { local: 3, proof: 1 }], ['Yes, and we run local offers by hand', { local: 2 }], ['We sell online only', { access: 1, value: 1 }]] }
] },
{ id: 'value', icon: 'M12 21C5 15.5 3 12 3 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9 2.5c0 3.5-2 7-9 12.5z', strand: 'value', text: 'Clubs and families don’t see what we give', short: 'giving back', qs: [
{ q: 'What do clubs get from your sponsorship?', opts: [['A one-off grant or equipment', { value: 3 }], ['Vouchers or discounts for members', { value: 2 }], ['Ongoing money tied to what members buy', {}]] },
{ q: 'Would club families say your brand helps their club?', opts: [['Most would not know we are involved', { value: 3, presence: 2 }], ['Some would', { value: 2 }], ['Yes, they see it', {}]] }
] },
{ id: 'growth', icon: 'M3 17l6-6 4 4 8-8 M15 7h6v6', strand: 'access', text: 'We already lead our category and need a new way to grow', short: 'growth', qs: [
{ q: 'Where does your next growth come from?', opts: [['New customers we do not reach today', { access: 3 }], ['More spend from customers we already have', { value: 2, local: 2 }], ['Loyalty members we can identify and keep', { access: 1, proof: 2 }]] },
{ q: 'How much of a club family’s seasonal spend in your category do you win?', opts: [['No idea', { proof: 3 }], ['Some, we think', { value: 2, proof: 1 }], ['Most of it', {}]] }
] }
];
}
renderVals() {
const s = Object.assign({ step: 'pick', picked: {}, answers: {}, sent: false }, this.state || {});
const strands = this.strands();
const data = this.problemData();
const pickedList = data.filter((p) => s.picked[p.id]);
const problems = data.map((p) => {
const on = !!s.picked[p.id];
return {
text: p.text,
icon: p.icon,
pressed: on ? 'true' : 'false',
bg: on ? '#F4450F' : 'transparent',
fg: on ? '#111116' : '#ffffff',
border: on ? '#F4450F' : '#ffffff',
toggle: () => {
const next = Object.assign({}, (this.state || {}).picked || {});
if (next[p.id]) { delete next[p.id]; } else { next[p.id] = true; }
this.setState({ picked: next });
}
};
});
let total = 0;
let answered = 0;
const scores = {};
const reasons = {};
const groups = pickedList.map((p) => ({
text: p.text,
swatch: strands[p.strand].color,
questions: p.qs.map((qu, qi) => {
const key = p.id + '-' + qi;
total += 1;
const chosen = s.answers[key];
if (chosen !== undefined) {
answered += 1;
const pts = qu.opts[chosen][1];
Object.keys(pts).forEach((k) => {
scores[k] = (scores[k] || 0) + pts[k];
reasons[k] = reasons[k] || [];
if (reasons[k].indexOf(p.short) === -1) { reasons[k].push(p.short); }
});
}
return {
q: qu.q,
opts: qu.opts.map((o, oi) => {
const on = chosen === oi;
return {
label: o[0],
pressed: on ? 'true' : 'false',
bg: on ? '#ffffff' : 'transparent',
fg: on ? '#111116' : '#ffffff',
border: on ? '#ffffff' : '#8a8a92',
pick: () => {
const next = Object.assign({}, (this.state || {}).answers || {});
next[key] = oi;
this.setState({ answers: next });
}
};
})
};
})
}));
const ranked = Object.keys(scores).filter((k) => scores[k] > 0).sort((a, b) => scores[b] - scores[a]);
const because = (k) => {
const r = reasons[k] || [];
if (!r.length) { return ''; }
const joined = r.length === 1 ? r[0] : r.slice(0, -1).join(', ') + ' and ' + r[r.length - 1];
return 'Based on what you told us about ' + joined + '.';
};
const topKey = ranked[0];
const top = topKey ? { name: strands[topKey].name, text: strands[topKey].text, bg: strands[topKey].color, fg: strands[topKey].fg, because: because(topKey) } : { name: '', text: '', bg: '#F4450F', fg: '#111116', because: '' };
const rest = ranked.slice(1).map((k) => ({ name: strands[k].name, text: strands[k].text, swatch: strands[k].color, because: because(k) }));
const stepNumber = s.step === 'pick' ? 1 : (s.step === 'questions' ? 2 : 3);
return {
isPick: s.step === 'pick',
isQuestions: s.step === 'questions',
isResult: s.step === 'result',
stepLabel: 'Step ' + stepNumber + ' of 3',
problems: problems,
nonePicked: pickedList.length === 0,
nextLabel: pickedList.length === 0 ? 'Pick at least one' : 'Next: ' + (pickedList.length * 2) + ' quick questions',
groups: groups,
answeredLabel: answered + ' of ' + total + ' answered',
hasTop: !!topKey,
noFit: !topKey,
top: top,
hasRest: rest.length > 0,
rest: rest,
sent: s.sent,
toQuestions: () => this.setState({ step: 'questions' }),
toPick: () => this.setState({ step: 'pick' }),
toResult: () => this.setState({ step: 'result', sent: false }),
send: () => this.setState({ sent: true }),
restart: () => this.setState({ step: 'pick', picked: {}, answers: {}, sent: false })
};
}
}
