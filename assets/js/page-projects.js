// One gallery instead of 143 single-photo pages, plus the client list.
(function () {
  var PH = window.PH, e = PH.esc;
  var photos = window.PH_PROJECTS, rooms = window.PH_ROOMS, clients = window.PH_CLIENTS;
  var state = { room: PH.param('room') };
  var chips = document.getElementById('room-chips');
  var grid = document.getElementById('photo-grid');
  var box = document.getElementById('lightbox');
  var boxImg = document.getElementById('lb-img');
  var boxCap = document.getElementById('lb-cap');
  var current = [], at = 0;

  function caption(p) { return p.c[0] || 'Installed project'; }
  function render() {
    current = state.room ? photos.filter(function (p) { return p.c.indexOf(state.room) !== -1; }) : photos;
    chips.innerHTML = '<button type="button" class="chip" data-room="" aria-pressed="' + (!state.room) + '">All rooms <small>' + photos.length + '</small></button>' + rooms.map(function (r) {
      var n = photos.filter(function (p) { return p.c.indexOf(r) !== -1; }).length;
      return '<button type="button" class="chip" data-room="' + e(r) + '" aria-pressed="' + (state.room === r) + '">' + e(r) + ' <small>' + n + '</small></button>';
    }).join('');
    grid.innerHTML = current.map(function (p, i) {
      return '<button type="button" class="photo-btn" data-i="' + i + '" aria-label="Enlarge photo: ' + e(caption(p)) + '"><img src="' + e(PH.local(p.th)) + '" alt="' + e(caption(p)) + ' installation by Paladin" loading="lazy" decoding="async"></button>';
    }).join('');
    PH.setParams({ room: state.room });
  }
  function show(i) {
    at = (i + current.length) % current.length;
    var p = current[at];
    boxImg.src = PH.cdn(p.i);
    boxImg.alt = caption(p) + ' installation by Paladin';
    boxCap.textContent = caption(p) + ' · ' + (at + 1) + ' of ' + current.length;
  }
  chips.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-room]');
    if (b) { state.room = b.getAttribute('data-room'); render(); }
  });
  grid.addEventListener('click', function (ev) {
    var b = ev.target.closest('.photo-btn');
    if (!b) return;
    show(+b.getAttribute('data-i'));
    box.showModal();
  });
  document.getElementById('lb-prev').addEventListener('click', function () { show(at - 1); });
  document.getElementById('lb-next').addEventListener('click', function () { show(at + 1); });
  document.getElementById('lb-close').addEventListener('click', function () { box.close(); });
  box.addEventListener('keydown', function (ev) {
    if (ev.key === 'ArrowLeft') show(at - 1);
    if (ev.key === 'ArrowRight') show(at + 1);
  });
  box.addEventListener('click', function (ev) { if (ev.target === box) box.close(); });
  render();

  // Client list
  var tabs = document.getElementById('client-tabs');
  var list = document.getElementById('client-list');
  var search = document.getElementById('client-search');
  var keys = Object.keys(clients), active = keys[0];
  function renderClients() {
    var match = PH.matcher(search.value);
    tabs.innerHTML = keys.map(function (k) {
      var n = clients[k].filter(function (c) { return match(PH.norm(c.join(' '))); }).length;
      return '<button type="button" class="chip" data-k="' + e(k) + '" aria-pressed="' + (k === active) + '">' + e(k) + ' <small>' + n + '</small></button>';
    }).join('');
    var rows = clients[active].filter(function (c) { return match(PH.norm(c.join(' '))); });
    list.innerHTML = rows.length ? rows.map(function (c) { return '<li>' + e(c[0]) + (c[1] ? '<small>' + e(c[1]) + '</small>' : '') + '</li>'; }).join('') : '<li>No match in this list.</li>';
  }
  tabs.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-k]');
    if (b) { active = b.getAttribute('data-k'); renderClients(); }
  });
  search.addEventListener('input', renderClients);
  renderClients();
})();
