// Product finder: one page for what used to be the catalog and the spec sheet index.
(function () {
  var PH = window.PH, all = window.PH_PRODUCTS, groups = window.PH_GROUPS;
  var PAGE = 24;
  var RAILS = [
    { id: '', label: 'Any rail' },
    { id: 'evolution', label: 'Evolution / Fairfield-style' },
    { id: 'modular', label: 'Modular / AMICO' },
    { id: 'hillrom', label: 'Hill-Rom' }
  ];
  var CONTEXT = {
    hillrom: '<h3>Hill-Rom support</h3><p>Paladin is proud to support the legacy installed base of the Hill-Rom architectural products. We can provide any and all styles of installed base Hill-Rom products with updated accessories, as well as updated Headwall and Power Column systems.</p>',
    modular: '<h3>Modular and AMICO</h3><p>Accessories and adapters for Modular and AMICO headwalls and rail systems. <a href="resources.html?q=modular">See the accessories guide</a>.</p>',
    Headwalls: '<h3>More headwall systems</h3><p>Sentinel, Edge, and Prestige single tier details, finish options, and installation manuals are in <a href="resources.html?type=Architectural">Architectural documents</a>.</p>',
    va: '<h3>VA / DHA catalog</h3><p>JSN cross references and capability statements are on the <a href="va-dha.html">VA / DHA page</a>.</p>'
  };

  var state = {
    q: PH.param('q'), rail: PH.param('rail'), group: PH.param('group'), cat: PH.param('cat'), va: PH.param('va') === '1', shown: PAGE
  };

  var input = document.getElementById('p-search');
  var railBox = document.getElementById('f-rail');
  var catBox = document.getElementById('f-cat');
  var catalogBox = document.getElementById('f-catalog');
  var grid = document.getElementById('p-grid');
  var bar = document.getElementById('p-bar');
  var more = document.getElementById('p-more');
  var ctx = document.getElementById('p-context');
  var filters = document.getElementById('filters');
  var toggle = document.getElementById('filter-toggle');

  function fitsRail(p, rail) {
    if (!rail) return true;
    if (p.r === 'universal') return true;
    if (rail === 'hillrom' && p.h) return true;
    return p.r === rail;
  }
  function inGroup(p, g) { return p.c.some(function (c) { return groups[g].indexOf(c) !== -1; }); }
  // Each facet counts against every other active filter, so a number always means what clicking it gives.
  function base(skip) {
    var match = PH.matcher(state.q);
    return all.filter(function (p) {
      if (state.q && !match(PH.productHay(p))) return false;
      if (skip !== 'rail' && !fitsRail(p, state.rail)) return false;
      if (skip !== 'va' && state.va && !p.v) return false;
      if (skip !== 'cat') {
        if (state.cat && p.c.indexOf(state.cat) === -1) return false;
        if (!state.cat && state.group && !inGroup(p, state.group)) return false;
      }
      return true;
    });
  }
  function opt(attrs, label, n, sub, pressed) {
    return '<button type="button" class="opt' + (sub ? ' sub' : '') + '" ' + attrs + ' aria-pressed="' + (pressed ? 'true' : 'false') + '"' + (n === 0 && !pressed ? ' disabled' : '') + '><span>' + PH.esc(label) + '</span><small>' + n + '</small></button>';
  }
  function renderFilters() {
    var forRail = base('rail');
    railBox.innerHTML = RAILS.map(function (r) {
      var n = forRail.filter(function (p) { return fitsRail(p, r.id); }).length;
      return opt('data-rail="' + r.id + '"', r.label, n, false, state.rail === r.id);
    }).join('');
    var forCat = base('cat');
    var html = opt('data-group=""', 'All categories', forCat.length, false, !state.group && !state.cat);
    Object.keys(groups).forEach(function (g) {
      var inG = forCat.filter(function (p) { return inGroup(p, g); }).length;
      html += opt('data-group="' + PH.esc(g) + '"', g, inG, false, state.group === g && !state.cat);
      if (state.group === g) {
        groups[g].forEach(function (c) {
          var n = forCat.filter(function (p) { return p.c.indexOf(c) !== -1; }).length;
          if (n || state.cat === c) html += opt('data-group="' + PH.esc(g) + '" data-cat="' + PH.esc(c) + '"', c, n, true, state.cat === c);
        });
      }
    });
    catBox.innerHTML = html;
    var forVa = base('va');
    catalogBox.innerHTML = opt('data-va="1"', 'VA / DHA catalog', forVa.filter(function (p) { return p.v; }).length, false, state.va);
  }
  function renderBar(n) {
    var chips = [];
    function chip(key, label) { chips.push('<button type="button" class="active-chip" data-clear="' + key + '" aria-label="Remove filter: ' + PH.esc(label) + '">' + PH.esc(label) + ' ×</button>'); }
    if (state.q) chip('q', '“' + state.q + '”');
    if (state.rail) chip('rail', RAILS.filter(function (r) { return r.id === state.rail; })[0].label);
    if (state.cat) chip('cat', state.cat);
    else if (state.group) chip('group', state.group);
    if (state.va) chip('va', 'VA / DHA catalog');
    bar.innerHTML = '<span class="count" role="status">' + n + (n === 1 ? ' product' : ' products') + '</span>' + chips.join('') + (chips.length > 1 ? '<button type="button" class="clear" data-clear="all">Clear all</button>' : '');
  }
  function renderContext() {
    var key = state.rail === 'hillrom' ? 'hillrom' : state.rail === 'modular' ? 'modular' : state.group === 'Headwalls' ? 'Headwalls' : state.va ? 'va' : '';
    ctx.innerHTML = key ? '<div class="note-box context">' + CONTEXT[key] + '</div>' : '';
  }
  function render() {
    var list = base();
    renderFilters();
    renderBar(list.length);
    renderContext();
    if (!list.length) {
      grid.innerHTML = '';
      grid.insertAdjacentHTML('afterbegin', '<div class="empty" style="grid-column:1/-1"><h3>Nothing matches that yet</h3><p>At Paladin, no is never the answer. A rep can often adapt a plate for the device you have.</p><a class="btn btn-primary" href="contact.html">Ask a rep</a></div>');
      more.hidden = true;
    } else {
      grid.innerHTML = list.slice(0, state.shown).map(PH.productCard).join('');
      var left = list.length - state.shown;
      more.hidden = left <= 0;
      if (left > 0) more.querySelector('button').textContent = 'Show ' + Math.min(left, PAGE) + ' more (' + left + ' left)';
    }
    document.getElementById('filter-done').textContent = 'Show ' + list.length + (list.length === 1 ? ' product' : ' products');
    PH.setParams({ q: state.q, rail: state.rail, group: state.group, cat: state.cat, va: state.va ? '1' : '' });
  }

  input.value = state.q;
  var t;
  input.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(function () { state.q = input.value.trim(); state.shown = PAGE; render(); }, 120);
  });
  filters.addEventListener('click', function (ev) {
    var b = ev.target.closest('.opt');
    if (!b) return;
    if (b.hasAttribute('data-rail')) state.rail = b.getAttribute('data-rail');
    if (b.hasAttribute('data-group')) { state.group = b.getAttribute('data-group'); state.cat = b.getAttribute('data-cat') || ''; }
    if (b.hasAttribute('data-va')) state.va = !state.va;
    state.shown = PAGE;
    render();
  });
  bar.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-clear]');
    if (!b) return;
    var k = b.getAttribute('data-clear');
    if (k === 'all') { state.q = state.rail = state.group = state.cat = ''; state.va = false; input.value = ''; }
    else if (k === 'q') { state.q = ''; input.value = ''; }
    else if (k === 'va') state.va = false;
    else if (k === 'group') { state.group = ''; state.cat = ''; }
    else state[k] = '';
    state.shown = PAGE;
    render();
  });
  more.querySelector('button').addEventListener('click', function () { state.shown += PAGE; render(); });
  toggle.addEventListener('click', function () {
    var open = filters.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.getElementById('filter-done').addEventListener('click', function () {
    filters.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.scrollIntoView({ block: 'start' });
  });
  render();
})();
