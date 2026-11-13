// Called by the health check pages when someone asks for their scorecard.
// Creates a task in the Asana project and tells the page whether it worked.
// Needs two environment variables in Netlify (never commit them):
//   ASANA_TOKEN        a personal access token from Asana
//   ASANA_PROJECT_GID  the long number in the Asana project's URL
const json = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const clean = (v, max) => String(v == null ? '' : v).slice(0, max);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'POST only' });
  let d;
  try {
    d = JSON.parse(event.body || '{}');
  } catch (err) {
    return json(400, { ok: false, error: 'Body is not JSON' });
  }
  if (!clean(d.name, 200).trim() || !/^\S+@\S+\.\S+$/.test(clean(d.email, 200))) {
    return json(400, { ok: false, error: 'Name and a valid email are required' });
  }
  const { ASANA_TOKEN, ASANA_PROJECT_GID } = process.env;
  if (!ASANA_TOKEN || !ASANA_PROJECT_GID) {
    console.error('ASANA_TOKEN or ASANA_PROJECT_GID is not set in Netlify');
    return json(500, { ok: false, error: 'Asana is not configured' });
  }
  const who = clean(d.organisation, 200).trim() || clean(d.name, 200).trim();
  const notes = [
    'Check: ' + clean(d.check, 100),
    'Organisation: ' + clean(d.organisation, 200),
    'Name: ' + clean(d.name, 200),
    'Email: ' + clean(d.email, 200),
    'Phone: ' + (clean(d.phone, 50) || 'not given'),
    '',
    'Overall score: ' + clean(d.score, 100),
    clean(d.areas, 2000),
    '',
    'Priorities:',
    clean(d.priorities, 3000),
    '',
    'Their answers:',
    clean(d.answers, 6000)
  ].join('\n');
  let res;
  try {
    res = await fetch('https://app.asana.com/api/1.0/tasks', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + ASANA_TOKEN.trim(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { name: (clean(d.check, 100) || 'Health check') + ': ' + who, notes: notes, projects: [ASANA_PROJECT_GID.trim()] } })
    });
  } catch (err) {
    console.error('Could not reach Asana', err);
    return json(502, { ok: false, error: 'Could not reach Asana' });
  }
  if (!res.ok) {
    const detail = await res.text();
    console.error('Asana rejected the task', res.status, detail);
    return json(502, { ok: false, error: 'Asana rejected the task', status: res.status });
  }
  return json(200, { ok: true });
};
