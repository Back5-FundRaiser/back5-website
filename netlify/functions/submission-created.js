// Runs automatically whenever a Netlify form submission is verified.
// Creates a task in the Asana project for each completed health check.
// Needs two environment variables in Netlify (never commit them):
//   ASANA_TOKEN        a personal access token from Asana
//   ASANA_PROJECT_GID  the long number in the Asana project's URL
exports.handler = async (event) => {
  let payload;
  try {
    payload = JSON.parse(event.body).payload;
  } catch (err) {
    return { statusCode: 400, body: 'Bad payload' };
  }
  if (!payload || payload.form_name !== 'health-check') {
    return { statusCode: 200, body: 'Ignored' };
  }
  const { ASANA_TOKEN, ASANA_PROJECT_GID } = process.env;
  if (!ASANA_TOKEN || !ASANA_PROJECT_GID) {
    console.error('ASANA_TOKEN or ASANA_PROJECT_GID is not set');
    return { statusCode: 500, body: 'Asana is not configured' };
  }
  const d = payload.data || {};
  const notes = [
    'Check: ' + (d.check || ''),
    'Organisation: ' + (d.organisation || ''),
    'Contact: ' + (d.name || '') + ' <' + (d.email || '') + '>',
    '',
    'Start here: ' + (d.start_here || ''),
    'Also worth a look: ' + (d.also_consider || 'none'),
    '',
    'What they picked:',
    d.problems || '',
    '',
    'Their answers:',
    d.answers || ''
  ].join('\n');
  const res = await fetch('https://app.asana.com/api/1.0/tasks', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + ASANA_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { name: (d.check || 'Health check') + ': ' + (d.organisation || 'Unknown'), notes: notes, projects: [ASANA_PROJECT_GID] } })
  });
  if (!res.ok) {
    console.error('Asana error', res.status, await res.text());
    return { statusCode: 502, body: 'Asana rejected the task' };
  }
  return { statusCode: 200, body: 'Task created' };
};
