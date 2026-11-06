// One library for the six separate document pages, with spec sheets and videos alongside.
(function () {
  var PH = window.PH;
  var docs = window.PH_DOCS, vids = window.PH_VIDEOS;
  var specs = window.PH_PRODUCTS.filter(function (p) { return p.pdf; }).map(function (p) {
    return { t: p.p + ': ' + p.t + (p.s ? ' (' + p.s + ')' : ''), u: p.pdf, x: 'PDF', c: ['Spec sheet'], hay: PH.productHay(p) };
  });
  var TYPES = [
    { id: '', label: 'All documents' },
    { id: 'Spec sheet', label: 'Spec sheets' },
    { id: 'Catalogs', label: 'Catalogs' },
    { id: 'Architectural', label: 'Architectural' },
    { id: 'Installation', label: 'Installation' },
    { id: 'Application', label: 'Applications' },
    { id: 'Company', label: 'Company' },
    { id: 'VA / DHA', label: 'VA / DHA' },
    { id: 'Lunch & Learn', label: 'CEU courses' },
    { id: 'video', label: 'Videos' }
  ];
  var state = { q: PH.param('q'), type: PH.param('type') };
  var input = document.getElementById('r-search');
  var chips = document.getElementById('r-chips');
  var out = document.getElementById('r-out');
  input.value = state.q;

  function docMatches(d, match) { return match(d.hay || PH.norm(d.t + ' ' + d.c.join(' '))); }
  function render() {
    var match = PH.matcher(state.q), q = state.q;
    var inDocs = docs.filter(function (d) { return !q || docMatches(d, match); });
    var inSpecs = q ? specs.filter(function (d) { return docMatches(d, match); }) : specs;
    var inVids = vids.filter(function (v) { return !q || match(PH.norm(v.t + ' ' + v.g + ' video')); });
    function count(id) {
      if (!id) return inDocs.length;
      if (id === 'Spec sheet') return inSpecs.length;
      if (id === 'video') return inVids.length;
      return inDocs.filter(function (d) { return d.c.indexOf(id) !== -1; }).length;
    }
    chips.innerHTML = TYPES.map(function (t) {
      return '<button type="button" class="chip" data-type="' + PH.esc(t.id) + '" aria-pressed="' + (state.type === t.id) + '">' + PH.esc(t.label) + ' <small>' + count(t.id) + '</small></button>';
    }).join('');

    var html = '';
    if (state.type === 'video') {
      var groups = {};
      inVids.forEach(function (v) { (groups[v.g] = groups[v.g] || []).push(v); });
      html = Object.keys(groups).map(function (g) {
        return '<h2 class="group-title">' + PH.esc(g) + '</h2><div class="video-grid">' + groups[g].map(PH.videoCard).join('') + '</div>';
      }).join('');
      if (html) html += '<p style="margin-top:24px"><a class="link-arrow" href="https://www.youtube.com/@PaladinhcLLC" target="_blank" rel="noopener">More on the Paladin YouTube channel</a></p>';
    } else if (state.type === 'Spec sheet') {
      html = inSpecs.length ? '<div class="doc-list">' + inSpecs.map(PH.docRow).join('') + '</div>' : '';
    } else {
      var list = state.type ? inDocs.filter(function (d) { return d.c.indexOf(state.type) !== -1; }) : inDocs;
      if (list.length) html = '<div class="doc-list">' + list.map(PH.docRow).join('') + '</div>';
      // A part number search from "All documents" should still reach the matching spec sheets and videos.
      if (!state.type && q) {
        if (inSpecs.length) html += '<h2 class="group-title">Spec sheets (' + inSpecs.length + ')</h2><div class="doc-list">' + inSpecs.slice(0, 40).map(PH.docRow).join('') + '</div>' + (inSpecs.length > 40 ? '<p style="margin-top:10px"><button class="clear" type="button" data-type="Spec sheet">See all ' + inSpecs.length + ' spec sheets</button></p>' : '');
        if (inVids.length) html += '<h2 class="group-title">Videos (' + inVids.length + ')</h2><div class="video-grid">' + inVids.map(PH.videoCard).join('') + '</div>';
      }
    }
    out.innerHTML = html || '<div class="empty"><h3>No documents match that</h3><p>Ask a rep and they will send what you need.</p><a class="btn btn-primary" href="contact.html">Contact Paladin</a></div>';
    PH.setParams({ q: state.q, type: state.type });
  }
  var t;
  input.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(function () { state.q = input.value.trim(); render(); }, 120);
  });
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-type]');
    if (!b) return;
    state.type = b.getAttribute('data-type');
    render();
  });
  render();
})();
