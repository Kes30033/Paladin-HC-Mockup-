// Shared helpers: menu, site search, and the renderers more than one page needs.
(function () {
  var PH = (window.PH = {});
  var CDN = 'https://cdn.prod.website-files.com/66390b3664755f973d6da62c/';

  PH.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  PH.cdn = function (u) { return !u ? '' : /^https?:/.test(u) ? u : CDN + u; };
  PH.local = function (f) { return f ? 'assets/img/' + f : ''; };
  PH.param = function (k) { return new URLSearchParams(location.search).get(k) || ''; };
  PH.setParams = function (obj) {
    var q = new URLSearchParams(location.search);
    Object.keys(obj).forEach(function (k) { obj[k] ? q.set(k, obj[k]) : q.delete(k); });
    var s = q.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
  };
  PH.icon = function (name) { return '<svg class="ico" aria-hidden="true"><use href="#i-' + name + '"></use></svg>'; };
  PH.norm = function (s) { return String(s || '').toLowerCase().replace(/[®’'"“”]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); };

  // Part numbers read the same with or without their hyphens, so "ac101pm" finds AC101-PM.
  PH.matcher = function (q) {
    var tokens = PH.norm(q).split(' ').filter(Boolean);
    return function (hay) { return tokens.every(function (t) { return hay.indexOf(t) !== -1; }); };
  };
  PH.productHay = function (p) {
    if (!p._hay) p._hay = PH.norm([p.p, p.p.replace(/-/g, ''), p.j, p.t, p.s, (p.c || []).join(' ')].join(' '));
    return p._hay;
  };

  PH.productCard = function (p) {
    var e = PH.esc, href = 'product.html?id=' + encodeURIComponent(p.id);
    return '<article class="pcard"><a class="pcard-img" href="' + href + '" tabindex="-1" aria-hidden="true">' +
      (p.th ? '<img src="' + e(PH.local(p.th)) + '" alt="" loading="lazy" decoding="async">' : '<span class="noimg">Photo coming</span>') +
      '</a><div class="pcard-body"><p class="part">' + e(p.p) + '</p><h3><a href="' + href + '">' + e(p.t) + '</a></h3>' +
      (p.s ? '<p class="sub">' + e(p.s) + '</p>' : '') +
      '<div class="pcard-foot">' + (p.pdf ? '<a href="' + e(PH.cdn(p.pdf)) + '" target="_blank" rel="noopener">' + PH.icon('doc') + 'Spec sheet</a>' : '<span></span>') +
      (p.j ? '<span class="badge">JSN ' + e(p.j) + '</span>' : '') + '</div></div></article>';
  };

  PH.docRow = function (d) {
    var e = PH.esc;
    var tags = (d.c || []).join(' · ');
    return '<a class="doc" href="' + e(PH.cdn(d.u)) + '" target="_blank" rel="noopener"><span class="filetype ' + e(d.x) + '">' + e(d.x) + '</span>' +
      '<span><b>' + e(d.t) + '</b>' + (tags ? '<span class="doc-tags">' + e(tags) + '</span>' : '') + '</span>' + PH.icon('out') + '</a>';
  };

  PH.videoCard = function (v) {
    var e = PH.esc;
    return '<a class="video" href="https://www.youtube.com/watch?v=' + e(v.id) + '" target="_blank" rel="noopener"><span class="video-thumb"><img src="https://i.ytimg.com/vi/' + e(v.id) + '/hqdefault.jpg" alt="" loading="lazy"></span>' + e(v.t) + '</a>';
  };

  // Trade show dates arrive as month + "9-11" + year, so turn them into something comparable.
  PH.eventEnd = function (ev) {
    var m = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 }[ev.mon.toLowerCase()];
    var bits = ev.days.split('-').map(Number);
    return new Date(+ev.yr, m, bits[1] || bits[0], 23, 59);
  };
  PH.upcoming = function (events) {
    var now = new Date();
    return events.filter(function (ev) { return PH.eventEnd(ev) >= now; }).sort(function (a, b) { return PH.eventEnd(a) - PH.eventEnd(b); });
  };

  // ---- Site search, shared by the header box and search.html
  var loading = null;
  PH.loadSearchData = function () {
    if (loading) return loading;
    var files = ['products', 'documents', 'articles', 'team'];
    loading = Promise.all(files.map(function (f) {
      return new Promise(function (ok, fail) {
        var already = { products: window.PH_PRODUCTS, documents: window.PH_DOCS, articles: window.PH_ARTICLES, team: window.PH_TEAM }[f];
        if (already) return ok();
        var s = document.createElement('script');
        s.src = 'assets/data/' + f + '.js';
        s.onload = ok;
        s.onerror = fail;
        document.head.appendChild(s);
      });
    }));
    return loading;
  };
  var PAGES = [
    { title: 'Compare the rail systems', sub: 'Evolution, ONE Rail, headwalls, mobile', href: 'systems.html', key: 'overview evolution one rail universal headwall difference mobile surge hill rom' },
    { title: 'Hill-Rom accessories', sub: 'Support for the installed Hill-Rom base', href: 'products.html?rail=hillrom', key: 'hillrom hill rom horizon integris vertical channel' },
    { title: 'Lunch & Learn courses', sub: 'AIA (HSW) and EDAC-approved CEU presentations', href: 'news.html#lunch-learns', key: 'lunch learn ceu aia edac course training' },
    { title: 'Trade shows', sub: 'Where to meet Paladin next', href: 'news.html#shows', key: 'trade show tradeshow events conference booth' },
    { title: 'Client list', sub: 'Hospitals, planners, architects, and government', href: 'projects.html#clients', key: 'clients partners architects planners hospitals' },
    { title: 'Company history', sub: 'Timeline since 1967', href: 'about.html#history', key: 'history timeline fairfield founder schindele heritage' },
    { title: 'Quality and sustainability', sub: 'ISO 9001, made in the USA', href: 'about.html#quality', key: 'iso quality warranty environmental made usa recycled' },
    { title: 'Find your rep', sub: 'Search by state', href: 'contact.html', key: 'sales rep representative contact phone email territory' }
  ];
  PH.searchAll = function (q) {
    var match = PH.matcher(q), nq = PH.norm(q), out = { Products: [], Documents: [], Articles: [], People: [], Pages: [] };
    if (!nq) return out;
    var compact = nq.replace(/ /g, '');
    (window.PH_PRODUCTS || []).forEach(function (p) {
      if (!match(PH.productHay(p))) return;
      var part = PH.norm(p.p).replace(/ /g, ''), score = part === compact ? 0 : part.indexOf(compact) === 0 ? 1 : PH.norm(p.j) === nq ? 1 : 2;
      out.Products.push({ score: score, title: p.p + ': ' + p.t, sub: p.s, href: 'product.html?id=' + encodeURIComponent(p.id) });
    });
    out.Products.sort(function (a, b) { return a.score - b.score; });
    (window.PH_DOCS || []).forEach(function (d) {
      if (match(PH.norm(d.t + ' ' + (d.c || []).join(' ')))) out.Documents.push({ title: d.t, sub: (d.c || []).join(' · '), href: PH.cdn(d.u), ext: true });
    });
    (window.PH_VIDEOS || []).forEach(function (v) {
      if (match(PH.norm(v.t + ' video ' + v.g))) out.Documents.push({ title: v.t, sub: 'Video · ' + v.g, href: 'https://www.youtube.com/watch?v=' + v.id, ext: true });
    });
    (window.PH_ARTICLES || []).forEach(function (a) {
      if (match(PH.norm(a.t + ' ' + a.a + ' ' + a.x))) out.Articles.push({ title: a.t, sub: a.x, href: 'article.html?id=' + encodeURIComponent(a.id) });
    });
    (window.PH_TEAM || []).forEach(function (t) {
      if (match(PH.norm(t.n + ' ' + t.r + ' ' + t.a))) out.People.push({ title: t.n, sub: t.r + (t.a && t.a !== 'Government' ? ' · ' + t.a : ''), href: 'contact.html#team' });
    });
    PAGES.forEach(function (g) {
      if (match(PH.norm(g.title + ' ' + g.key))) out.Pages.push({ title: g.title, sub: g.sub, href: g.href });
    });
    return out;
  };

  var KIND = { Products: 'Product', Documents: 'Document', Pages: 'Page', People: 'Person', Articles: 'Article' };
  function wireSearch(form) {
    var input = form.querySelector('input[name="q"]');
    if (!input) return;
    var box = document.createElement('div');
    box.className = 'suggest';
    box.hidden = true;
    box.id = 'suggest-' + Math.random().toString(36).slice(2, 7);
    form.appendChild(box);
    input.setAttribute('autocomplete', 'off');
    input.addEventListener('focus', function () { PH.loadSearchData(); });
    var idx = -1;
    function close() { box.hidden = true; idx = -1; }
    function render() {
      var q = input.value.trim();
      if (q.length < 2) return close();
      PH.loadSearchData().then(function () {
        var r = PH.searchAll(q), rows = [];
        ['Products', 'Documents', 'Pages', 'People', 'Articles'].forEach(function (k) {
          r[k].slice(0, k === 'Products' ? 5 : 2).forEach(function (x) {
            rows.push('<a href="' + PH.esc(x.href) + '"' + (x.ext ? ' target="_blank" rel="noopener"' : '') + '><span class="kind">' + KIND[k] + '</span><span>' + PH.esc(x.title) + (x.sub && k !== 'Articles' ? '<small>' + PH.esc(x.sub) + '</small>' : '') + '</span></a>');
          });
        });
        var total = ['Products', 'Documents', 'Pages', 'People', 'Articles'].reduce(function (n, k) { return n + r[k].length; }, 0);
        box.innerHTML = rows.length
          ? rows.join('') + '<a class="all" href="search.html?q=' + encodeURIComponent(q) + '">See all ' + total + ' results</a>'
          : '<a class="all" href="contact.html">No match for that. Ask a rep instead</a>';
        box.hidden = false;
        idx = -1;
      });
    }
    input.addEventListener('input', render);
    input.addEventListener('keydown', function (ev) {
      var links = box.hidden ? [] : box.querySelectorAll('a');
      if (ev.key === 'Escape') return close();
      if ((ev.key === 'ArrowDown' || ev.key === 'ArrowUp') && links.length) {
        ev.preventDefault();
        idx = (idx + (ev.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
        links.forEach(function (a, i) { a.classList.toggle('is-active', i === idx); });
      }
      if (ev.key === 'Enter' && idx >= 0 && links[idx]) { ev.preventDefault(); links[idx].click(); }
    });
    document.addEventListener('click', function (ev) { if (!form.contains(ev.target)) close(); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.menu-btn'), nav = document.getElementById('site-nav'), search = document.querySelector('.site-head .site-search');
    if (btn && nav) {
      btn.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (search) search.classList.toggle('in-menu', open);
      });
    }
    document.querySelectorAll('form.site-search, form.bigsearch').forEach(wireSearch);
    var news = document.querySelector('.foot-news');
    if (news) news.addEventListener('submit', function (ev) {
      ev.preventDefault();
      news.innerHTML = '<p>Mockup only: the newsletter form is not connected.</p>';
    });
  });

  // A photo that fails to load should not leave a broken-image icon in the grid.
  document.addEventListener('error', function (ev) {
    var t = ev.target;
    if (t && t.tagName === 'IMG' && t.closest('.pcard-img')) {
      var s = document.createElement('span');
      s.className = 'noimg';
      s.textContent = 'Photo coming';
      t.replaceWith(s);
    }
  }, true);
})();
