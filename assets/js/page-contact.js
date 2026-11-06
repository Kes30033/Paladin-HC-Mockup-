// Rep finder, team directory, and the contact form (not connected in this mockup).
(function () {
  var PH = window.PH, e = PH.esc, team = window.PH_TEAM;
  var NAMES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
  // Standard tile-grid map of the US: every state is one square in its rough real position.
  var MAP = [
    ['AK', '', '', '', '', '', '', '', '', '', 'ME'],
    ['', '', '', '', '', '', '', '', '', 'VT', 'NH'],
    ['WA', 'ID', 'MT', 'ND', 'MN', 'IL', 'WI', 'MI', 'NY', 'RI', 'MA'],
    ['OR', 'NV', 'WY', 'SD', 'IA', 'IN', 'OH', 'PA', 'NJ', 'CT', ''],
    ['CA', 'UT', 'CO', 'NE', 'MO', 'KY', 'WV', 'VA', 'MD', 'DE', ''],
    ['', 'AZ', 'NM', 'KS', 'AR', 'TN', 'NC', 'SC', 'DC', '', ''],
    ['', '', '', 'OK', 'LA', 'MS', 'AL', 'GA', '', '', ''],
    ['HI', '', '', 'TX', '', '', '', '', 'FL', '', '']
  ];
  var reps = {};
  team.forEach(function (t) {
    if (!t.a || t.a === 'Government') return;
    t.a.split(',').forEach(function (raw) {
      var s = raw.trim(), m = s.match(/\b([A-Z]{2})\b/);
      if (!m) return;
      var note = s.replace(m[1], '').trim();
      (reps[m[1]] = reps[m[1]] || []).push({ p: t, note: note });
    });
  });
  function person(t, note) {
    var tel = t.tel.replace(/[^0-9+]/g, '');
    return '<div class="rep-card">' + (t.i ? '<img src="' + e(PH.local(t.i)) + '" alt="" loading="lazy">' : '<span></span>') + '<div><b>' + e(t.n) + '</b><span class="role">' + e(t.r) + (note ? ' · ' + e(note) : '') + '</span>' +
      '<div class="ways"><a href="tel:' + e(tel) + '">' + e(t.tel) + '</a><a href="mailto:' + e(t.em) + '">Email</a></div></div></div>';
  }

  var result = document.getElementById('rep-result');
  var select = document.getElementById('state-select');
  var map = document.getElementById('usmap');
  select.innerHTML = '<option value="">Choose your state</option>' + Object.keys(NAMES).sort(function (a, b) { return NAMES[a] < NAMES[b] ? -1 : 1; }).map(function (k) { return '<option value="' + k + '">' + e(NAMES[k]) + '</option>'; }).join('');
  map.innerHTML = MAP.map(function (row) {
    return row.map(function (s) {
      return s ? '<button type="button" data-s="' + s + '" class="' + (reps[s] ? '' : 'none') + '" aria-label="' + e(NAMES[s]) + '" aria-pressed="false">' + s + '</button>' : '<span aria-hidden="true"></span>';
    }).join('');
  }).join('');
  function pick(s) {
    select.value = s;
    map.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-s') === s); });
    if (!s) { result.innerHTML = '<p style="color:var(--muted)">Pick a state to see who covers it.</p>'; return; }
    var list = reps[s];
    var head = '<h3 style="margin-bottom:10px">' + e(NAMES[s]) + '</h3>';
    if (list) {
      result.innerHTML = head + list.map(function (r) { return person(r.p, r.note); }).join('');
    } else {
      result.innerHTML = head + '<div class="note-box"><p>No regional rep is listed for this state yet. The main office will connect you.</p><div class="btn-row" style="margin-top:10px"><a class="btn" href="tel:+14076148781">407-614-8781</a><a class="btn" href="mailto:info@paladinhc.com">info@paladinhc.com</a></div></div>';
    }
    PH.setParams({ state: s });
  }
  map.addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-s]');
    if (b) pick(b.getAttribute('data-s'));
  });
  select.addEventListener('change', function () { pick(select.value); });
  pick(NAMES[PH.param('state')] ? PH.param('state') : '');

  // Everyone else: contact details visible, not hidden behind a hover
  document.getElementById('team-field').innerHTML = team.filter(function (t) { return t.a && t.a !== 'Government'; }).map(function (t) { return person(t, ''); }).join('');
  document.getElementById('team-office').innerHTML = team.filter(function (t) { return !t.a || t.a === 'Government'; }).map(function (t) { return person(t, ''); }).join('');

  // Form: prefill from the page that sent the visitor here
  var form = document.getElementById('contact-form');
  var topic = form.elements.topic, msg = form.elements.message;
  var TOPICS = { quote: 'Quote or order', lunch: 'Lunch & Learn', gov: 'VA / DHA or government' };
  if (TOPICS[PH.param('topic')]) topic.value = TOPICS[PH.param('topic')];
  if (PH.param('part')) msg.value = 'I would like a quote for part ' + PH.param('part') + '.\n\nQuantity: \nProject or facility: ';
  if (PH.param('course')) msg.value = 'We would like to schedule this course: ' + PH.param('course') + '\n\nNumber of attendees: \nPreferred dates: ';
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    document.getElementById('form-status').innerHTML = '<div class="warn-box" role="status">Mockup only: this form is not connected yet, so nothing was sent. For now, email <a href="mailto:info@paladinhc.com">info@paladinhc.com</a>.</div>';
  });
})();
