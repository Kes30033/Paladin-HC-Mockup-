// Small page behaviors: home next-show card, news, article, search results, VA / DHA.
(function () {
  var PH = window.PH, e = PH.esc, page = document.body.getAttribute('data-page');

  function fmtDate(ev) { return e(ev.mon) + ' ' + e(ev.days) + '<small>' + e(ev.yr) + '</small>'; }
  function eventRow(ev, next) {
    return '<div class="event' + (next ? ' next' : '') + '"><div class="event-date">' + fmtDate(ev) + '</div><div><b>' + e(ev.name) + '</b><span>' + e(ev.loc) + '</span></div>' + (ev.booth ? '<span class="booth">Booth ' + e(ev.booth) + '</span>' : '') + '</div>';
  }

  if (page === 'home') {
    var soon = PH.upcoming(window.PH_EVENTS)[0];
    var card = document.getElementById('next-show');
    if (soon) card.innerHTML = '<p class="eyebrow">Next trade show</p><h3>' + e(soon.name) + '</h3><p>' + e(soon.mon) + ' ' + e(soon.days) + ', ' + e(soon.yr) + '<br>' + e(soon.loc) + (soon.booth ? '<br>Booth ' + e(soon.booth) : '') + '</p><a href="news.html#shows">All shows</a>';
    else card.innerHTML = '<p class="eyebrow">Trade shows</p><h3>Meet us on the road</h3><p>Paladin exhibits at healthcare design and engineering shows across the country.</p><a href="news.html#shows">See the calendar</a>';
  }

  if (page === 'news') {
    var evs = window.PH_EVENTS, up = PH.upcoming(evs), past = evs.filter(function (x) { return up.indexOf(x) === -1; }).reverse();
    document.getElementById('upcoming').innerHTML = up.length ? up.map(function (ev, i) { return eventRow(ev, i === 0); }).join('') : '<p>The next season of shows will be posted soon.</p>';
    document.getElementById('past').innerHTML = past.map(function (ev) { return eventRow(ev, false); }).join('');
    document.getElementById('past-count').textContent = past.length;
    document.getElementById('article-grid').innerHTML = window.PH_ARTICLES.map(function (a) {
      return '<a class="acard" href="article.html?id=' + encodeURIComponent(a.id) + '"><img src="' + e(PH.local(a.th)) + '" alt="" loading="lazy"><h3>' + e(a.t) + '</h3>' + (a.a ? '<p>By ' + e(a.a) + '</p>' : '') + '</a>';
    }).join('');
    var pics = window.PH_GALLERY, gal = document.getElementById('show-gallery'), box = document.getElementById('lightbox'), img = document.getElementById('lb-img'), cap = document.getElementById('lb-cap'), at = 0;
    gal.innerHTML = pics.map(function (p, i) { return '<button type="button" class="photo-btn" data-i="' + i + '" aria-label="Enlarge trade show photo ' + (i + 1) + '"><img src="' + e(PH.local(p.t)) + '" alt="Paladin at a trade show" loading="lazy"></button>'; }).join('');
    var show = function (i) { at = (i + pics.length) % pics.length; img.src = PH.cdn(pics[at].s); img.alt = 'Paladin at a trade show'; cap.textContent = 'Trade show · ' + (at + 1) + ' of ' + pics.length; };
    gal.addEventListener('click', function (ev) { var b = ev.target.closest('.photo-btn'); if (b) { show(+b.getAttribute('data-i')); box.showModal(); } });
    document.getElementById('lb-prev').addEventListener('click', function () { show(at - 1); });
    document.getElementById('lb-next').addEventListener('click', function () { show(at + 1); });
    document.getElementById('lb-close').addEventListener('click', function () { box.close(); });
    box.addEventListener('keydown', function (ev) { if (ev.key === 'ArrowLeft') show(at - 1); if (ev.key === 'ArrowRight') show(at + 1); });
    box.addEventListener('click', function (ev) { if (ev.target === box) box.close(); });
  }

  if (page === 'article') {
    var list = window.PH_ARTICLES, id = PH.param('id'), idx = list.map(function (a) { return a.id; }).indexOf(id), a = list[idx], root = document.getElementById('article-root');
    if (!a) {
      root.innerHTML = '<div class="empty" style="margin:40px 0"><h3>We could not find that article</h3><a class="btn btn-primary" href="news.html#articles">See all articles</a></div>';
    } else {
      document.title = a.t + ' | Paladin Healthcare';
      var others = list.filter(function (x) { return x.id !== a.id; }).slice(0, 3);
      // Article bodies were sanitized when the data file was built from the live site.
      root.innerHTML = '<nav class="crumbs" aria-label="Breadcrumb"><a href="news.html#articles">News &amp; Events</a><span aria-hidden="true">/</span><span>Article</span></nav><div class="article-head"><h1 style="font-size:clamp(1.8rem,3.6vw,2.7rem)">' + e(a.t) + '</h1>' + (a.a ? '<p style="margin-top:10px;color:var(--muted);font-weight:600">By ' + e(a.a) + '</p>' : '') + '</div>' +
        '<img class="photo article-hero" src="' + e(PH.cdn(a.i)) + '" alt="">' +
        '<div class="prose">' + a.b + '</div>' +
        '<section style="margin-top:48px"><h2 style="font-size:1.4rem;margin-bottom:16px">Keep reading</h2><div class="article-grid">' + others.map(function (x) { return '<a class="acard" href="article.html?id=' + encodeURIComponent(x.id) + '"><img src="' + e(PH.local(x.th)) + '" alt="" loading="lazy"><h3>' + e(x.t) + '</h3></a>'; }).join('') + '</div></section>';
    }
  }

  if (page === 'search') {
    var q = PH.param('q'), input = document.getElementById('s-input'), out = document.getElementById('s-out');
    input.value = q;
    var run = function (val) {
      if (!val.trim()) { out.innerHTML = '<p style="color:var(--muted)">Type a part number, JSN, product, document, or person.</p>'; return; }
      var r = PH.searchAll(val), html = '', total = 0;
      ['Products', 'Documents', 'Pages', 'People', 'Articles'].forEach(function (k) {
        if (!r[k].length) return;
        total += r[k].length;
        html += '<h2 class="group-title">' + k + ' <small style="color:var(--muted);font-weight:500">' + r[k].length + '</small></h2><div class="doc-list">' + r[k].slice(0, 60).map(function (x) {
          return '<a class="doc" style="grid-template-columns:minmax(0,1fr) auto" href="' + e(x.href) + '"' + (x.ext ? ' target="_blank" rel="noopener"' : '') + '><span><b>' + e(x.title) + '</b>' + (x.sub ? '<span class="doc-tags">' + e(x.sub) + '</span>' : '') + '</span>' + PH.icon(x.ext ? 'out' : 'arrow') + '</a>';
        }).join('') + '</div>';
      });
      out.innerHTML = '<p class="count" role="status" style="font-weight:700;color:var(--blue-ink)">' + total + ' results for “' + e(val) + '”</p>' + (html || '<div class="empty" style="margin-top:16px"><h3>Nothing found</h3><p>At Paladin, no is never the answer. Ask a rep directly.</p><a class="btn btn-primary" href="contact.html">Contact Paladin</a></div>');
    };
    PH.loadSearchData().then(function () { run(q); });
    var t;
    input.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () { PH.setParams({ q: input.value }); run(input.value); }, 120);
    });
    document.getElementById('s-form').addEventListener('submit', function (ev) { ev.preventDefault(); run(input.value); });
  }

  if (page === 'va') {
    var withJsn = window.PH_PRODUCTS.filter(function (p) { return p.j; });
    var body = document.getElementById('jsn-body'), jsnInput = document.getElementById('jsn-search'), jc = document.getElementById('jsn-count');
    var draw = function () {
      var match = PH.matcher(jsnInput.value);
      var rows = withJsn.filter(function (p) { return match(PH.productHay(p)); });
      jc.textContent = rows.length + ' of ' + withJsn.length + ' JSN-listed parts';
      body.innerHTML = rows.map(function (p) {
        return '<tr><td class="part">' + e(p.j) + '</td><td class="part"><a href="product.html?id=' + encodeURIComponent(p.id) + '">' + e(p.p) + '</a></td><td>' + e(p.t) + (p.s ? '<br><small style="color:var(--muted)">' + e(p.s) + '</small>' : '') + '</td><td>' + (p.pdf ? '<a href="' + e(PH.cdn(p.pdf)) + '" target="_blank" rel="noopener">Spec</a>' : '') + '</td></tr>';
      }).join('') || '<tr><td colspan="4">No JSN-listed part matches that.</td></tr>';
    };
    jsnInput.addEventListener('input', draw);
    draw();
    var feat = ['JSN Cross Reference Guide', 'JSN Cross Reference Typicals', 'JSN Cross Reference Item List'];
    document.getElementById('va-docs').innerHTML = window.PH_DOCS.filter(function (d) { return d.c.indexOf('VA / DHA') !== -1 && feat.indexOf(d.t) === -1; }).map(function (d) { return PH.docRow({ t: d.t, u: d.u, x: d.x }); }).join('');
  }
})();
