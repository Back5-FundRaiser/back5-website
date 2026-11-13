class Component extends DCLogic {
constructor(...args) {
super(...args);
this.state = Object.assign({ step: 'pick', picked: {}, answers: {}, sent: false }, this.state || {});
}
strands() {
return {
software: { icon: 'M3 5h18v11H3z M8 20h8 M12 16v4', name: 'Club software', color: '#EFD018', fg: '#111116', text: 'Put rego, payments and messages in one app and take the load off the people carrying it.' },
apparel: { icon: 'M8 3 L3 6 l2 4 l3-1.5 V21 h8 V8.5 l3 1.5 l2-4 L16 3 c-.5 2-2 3-4 3 s-3.5-1-4-3z', name: 'Club Apparel', color: '#F4450F', fg: '#111116', text: 'Move kit to an online club shop run by our partners, with the club earning on each order.' },
mobile: { icon: 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z M10.5 18.5h3', name: 'Club Mobile', color: '#ffffff', fg: '#111116', text: 'Offer club-branded mobile plans and get a share back every month, no event required.' },
marketplace: { icon: 'M5 8h14l-1 13H6z M9 8V6a3 3 0 0 1 6 0v2', name: 'Club Marketplace', color: '#EFD018', fg: '#111116', text: 'Connect your members to partners for the things they buy every day, with a share of each purchase coming back to the club.' },
position: { icon: 'M5 22V3 M5 4h13l-3 4.5L18 13H5', name: 'Club Brand Positioning', color: '#F4450F', fg: '#111116', text: 'Rebuild how the club shows up, from badge and story to sponsorship packages, so players and partners choose you.' },
programs: { icon: 'M3 10v4h3l7 4V6L6 10z M17 9a4 4 0 0 1 0 6', name: 'Brand programs', color: '#ffffff', fg: '#111116', text: 'Get into the network so brands can pick your club for member offers, game-day kits and money back on what families already buy.' }
};
}
problemData() {
return [
{ id: 'fees', icon: 'M12 22a10 10 0 1 0 0-20a10 10 0 0 0 0 20z M15 9c-.5-1.2-1.6-2-3-2-1.7 0-3 1-3 2.5S10.3 12 12 12s3 1 3 2.5S13.7 17 12 17c-1.4 0-2.5-.8-3-2 M12 5v2 M12 17v2', strand: 'software', text: 'Rego and chasing fees eat our weekends', short: 'rego and fees', qs: [
{ q: 'How do members pay their fees today?', opts: [['Bank transfer or cash, then we tick names off a list', { software: 3 }], ['Online, but in a separate system from rego', { software: 2 }], ['Online, in the same place they register', {}]] },
{ q: 'By mid-season, how many fees are still outstanding?', opts: [['More than a quarter', { software: 3 }], ['A handful we keep chasing', { software: 2 }], ['Almost none', {}]] }
] },
{ id: 'people', icon: 'M9 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8z M2 21c0-4 3-6 7-6s7 2 7 6 M17 3.5a4 4 0 0 1 0 7.5 M22 21c0-3-1.5-5-4-5.7', strand: 'software', text: 'The same few people do everything', short: 'volunteer load', qs: [
{ q: 'If your registrar stepped down tomorrow, who could run rego and payments?', opts: [['Nobody else knows how', { software: 3 }], ['One other person, maybe', { software: 2 }], ['A few of us could', {}]] },
{ q: 'Where do most of the hours go?', opts: [['Answering the same parent questions again and again', { software: 2 }], ['Typing the same details into different places', { software: 2 }], ['Running events and fundraisers', { mobile: 2, marketplace: 2, programs: 2, apparel: 1 }]] }
] },
{ id: 'sponsors', icon: 'M3 10v4h3l7 4V6L6 10z M17 9a4 4 0 0 1 0 6', strand: 'programs', text: 'Sponsors are hard to find and harder to keep', short: 'sponsors', qs: [
{ q: 'What does a sponsor get from your club right now?', opts: [['A sign on the fence and a thank-you post', { programs: 3, position: 2 }], ['That, plus an offer we send to members', { programs: 2 }], ['A proper package, with numbers we report back', { programs: 1 }]] },
{ q: 'Could you tell a sponsor how many families you reach each week?', opts: [['Not with any confidence', { programs: 2, software: 2 }], ['Roughly', { programs: 2, software: 1 }], ['Yes, with numbers', { programs: 2 }]] }
] },
{ id: 'apps', icon: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z', strand: 'software', text: 'We run on five apps and a spreadsheet', short: 'too many tools', qs: [
{ q: 'How many different tools does a team manager touch in a normal week?', opts: [['Four or more', { software: 3 }], ['Two or three', { software: 2 }], ['Just one', {}]] },
{ q: 'Are you locked into what you use now?', opts: [['Our association makes us use it', { software: 1 }], ['We chose it, but nobody loves it', { software: 3 }], ['We are free to change', { software: 2 }]] }
] },
{ id: 'funds', icon: 'M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z M14 6v12', strand: 'mobile', text: 'Fundraising is raffles and the canteen', short: 'fundraising', qs: [
{ q: 'What would the club do with money that arrives every month without an event?', opts: [['Cut fees for families', { mobile: 3, marketplace: 2, apparel: 1 }], ['Fix the facilities or buy equipment', { mobile: 2, programs: 2 }], ['Honestly, just stay afloat', { mobile: 3, marketplace: 3, programs: 2, apparel: 1 }]] },
{ q: 'How many fundraisers can your volunteers face in a season?', opts: [['One, at a push', { mobile: 3, marketplace: 3, programs: 1 }], ['Two or three', { mobile: 2, apparel: 1 }], ['We like them, bring them on', { programs: 2, apparel: 1 }]] }
] },
{ id: 'kit', icon: 'M8 3 L3 6 l2 4 l3-1.5 V21 h8 V8.5 l3 1.5 l2-4 L16 3 c-.5 2-2 3-4 3 s-3.5-1-4-3z', strand: 'apparel', text: 'Kit ordering is a mess every season', short: 'kit ordering', qs: [
{ q: 'Who handles kit orders?', opts: [['A volunteer with a spreadsheet and a car boot', { apparel: 3 }], ['A local supplier, with us collecting the orders', { apparel: 2 }], ['An online shop members use themselves', { apparel: 1 }]] },
{ q: 'Does the club make anything on kit?', opts: [['No, we sell at cost or lose a bit', { apparel: 3 }], ['A little', { apparel: 2 }], ['Yes, it is a decent earner', {}]] }
] },
{ id: 'spend', icon: 'M5 8h14l-1 13H6z M9 8V6a3 3 0 0 1 6 0v2', strand: 'marketplace', text: 'Our families spend everywhere but the club', short: 'everyday spending', qs: [
{ q: 'Does the club earn anything when members shop with local or national businesses?', opts: [['No, nothing', { marketplace: 3 }], ['Members get a sponsor discount, but nothing comes back to the club', { marketplace: 2, programs: 1 }], ['Yes, we get a cut', {}]] },
{ q: 'Would families change where they buy everyday things if it helped the club?', opts: [['Most would, if it was easy', { marketplace: 3 }], ['Some would', { marketplace: 2 }], ['Hard to say', { marketplace: 1 }]] }
] },
{ id: 'brand', icon: 'M5 22V3 M5 4h13l-3 4.5L18 13H5', strand: 'position', text: 'Our club doesn’t stand out any more', short: 'standing out', qs: [
{ q: 'When did the club last update its badge, kit design or website?', opts: [['Nobody can remember', { position: 3 }], ['In the last five years, in bits and pieces', { position: 2 }], ['Recently, all together', {}]] },
{ q: 'Why do new families pick your club over the one down the road?', opts: [['It is closest, or their friends are here', { position: 3 }], ['Our results', { position: 2 }], ['They know what we stand for', { position: 1 }]] }
] },
{ id: 'reach', icon: 'M4 5h16v11H9l-5 4z', strand: 'software', text: 'We can’t reach all our parents and members', short: 'reaching members', qs: [
{ q: 'When a game is washed out, how does the news travel?', opts: [['Group chats, and we hope it gets passed on', { software: 3 }], ['An email that half the club opens', { software: 2 }], ['One alert that reaches every team', {}]] },
{ q: 'Do you hold up-to-date contact details for every family?', opts: [['They are scattered across coaches’ phones', { software: 3, programs: 1 }], ['In a list that is a season old', { software: 2 }], ['Yes, in one place', { programs: 1 }]] }
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
bg: on ? '#EFD018' : 'transparent',
fg: on ? '#111116' : '#ffffff',
border: on ? '#EFD018' : '#ffffff',
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
const top = topKey ? { name: strands[topKey].name, text: strands[topKey].text, icon: strands[topKey].icon, bg: strands[topKey].color, fg: strands[topKey].fg, because: because(topKey) } : { icon: '', name: '', text: '', bg: '#EFD018', fg: '#111116', because: '' };
const rest = ranked.slice(1).map((k) => ({ name: strands[k].name, text: strands[k].text, swatch: strands[k].color, icon: strands[k].icon, because: because(k) }));
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
