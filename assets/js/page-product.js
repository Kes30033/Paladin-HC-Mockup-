// One product template replaces the 294 separate product pages.
(function () {
  var PH = window.PH, e = PH.esc;
  var byId = {};
  window.PH_PRODUCTS.forEach(function (p) { byId[p.id] = p; });
  var root = document.getElementById('product-root');
  var id = PH.param('id');
  var p = byId[id];
  if (!p) {
    root.innerHTML = '<div class="empty" style="margin:40px 0"><h3>We could not find that product</h3><p>Search the full list by part number instead.</p><a class="btn btn-primary" href="products.html">Browse all products</a></div>';
    return;
  }
  var d = window.PH_DETAILS[id] || { g: [], x: [] };
  document.title = p.p + ': ' + p.t + ' | Paladin Healthcare';

  var RAIL = { evolution: 'Evolution / Fairfield-style rail', modular: 'Modular and AMICO rail', hillrom: 'Hill-Rom', universal: 'Universal: any rail profile' };
  var SUFFIX = [
    { re: /-PM(\b|-)/i, title: 'Product mounted', body: 'The product itself is Paladin factory mounted to the plate and adapter kit. The item and adapter kit are both included in the price, and it may be used for its intended purpose out of the box.' },
    { re: /-P(\b|-)/i, title: 'Mounting plate only', body: 'The item to be mounted is not included. You get the mounting plate and adapter kit needed to mount it to the rail. Some additional installation may be required on a third party device.' },
    { re: /-A(\b|-)/i, title: 'Adapter only', body: 'The item to be mounted is not included. Just the adapter (no plate) is delivered, and it can be mounted directly on the accessory. Some additional installation may be required on a third party device.' }
  ];
  var suffix = SUFFIX.filter(function (s) { return s.re.test(p.p); })[0];

  var rows = [];
  if (p.j) rows.push(['JSN number', '<span class="part">' + e(p.j) + '</span>']);
  if (d.d) rows.push(['Dimensions', e(d.d)]);
  if (RAIL[p.r]) rows.push(['Fits', e(RAIL[p.r])]);
  if (p.c.length) rows.push(['Category', p.c.map(function (c) { return '<a href="products.html?cat=' + encodeURIComponent(c) + '&group=' + encodeURIComponent(groupOf(c)) + '">' + e(c) + '</a>'; }).join(', ')]);
  if (d.x && d.x.length) rows.push(['Also available as', '<div class="variants">' + d.x.filter(function (x) { return byId[x]; }).map(function (x) { return '<a href="product.html?id=' + encodeURIComponent(x) + '">' + e(byId[x].p) + '</a>'; }).join('') + '</div>']);

  function groupOf(c) {
    var g = window.PH_GROUPS;
    return Object.keys(g).filter(function (k) { return g[k].indexOf(c) !== -1; })[0] || '';
  }
  var desc = [];
  if (d.e) desc = desc.concat(d.e);
  if (d.b) desc = desc.concat(window.PH_BOILER);
  var imgs = d.g && d.g.length ? d.g : (p.i ? [p.i] : []);

  // The live site separates notes with "**". Short ones are cautions like "Does not include vacuum bottle".
  var notes = (d.n || '').split(/\s*\*+\s*/).filter(function (x) { return /[a-z0-9]/i.test(x) && desc.indexOf(x) === -1; });
  var cautions = notes.filter(function (x) { return x.length <= 120; });
  var longNotes = notes.filter(function (x) { return x.length > 120; });

  // Same category, closest rail first, skipping the variants already linked above.
  var related = window.PH_PRODUCTS.filter(function (q) {
    return q.id !== p.id && q.c.some(function (c) { return p.c.indexOf(c) !== -1; }) && (d.x || []).indexOf(q.id) === -1;
  }).sort(function (a, b) { return (a.r === p.r ? 0 : 1) - (b.r === p.r ? 0 : 1); }).slice(0, 4);

  root.innerHTML =
    '<nav class="crumbs" aria-label="Breadcrumb"><a href="products.html">Products</a><span aria-hidden="true">/</span>' +
    (p.c[0] ? '<a href="products.html?group=' + encodeURIComponent(groupOf(p.c[0])) + '">' + e(groupOf(p.c[0])) + '</a><span aria-hidden="true">/</span>' : '') +
    '<span class="part">' + e(p.p) + '</span></nav>' +
    '<div class="product" style="padding-top:0"><div>' +
    '<div class="gallery-main">' + (imgs[0] ? '<img id="main-img" src="' + e(p.th ? PH.local(p.th) : PH.cdn(imgs[0])) + '" alt="' + e(p.t) + ', part ' + e(p.p) + '">' : '<span class="noimg" style="width:100%;height:100%">Photo coming</span>') + '</div>' +
    (imgs.length > 1 ? '<div class="thumbs">' + imgs.map(function (g, i) { return '<button type="button" data-img="' + e(PH.cdn(g)) + '" aria-label="Show photo ' + (i + 1) + ' of ' + imgs.length + '" aria-current="' + (i === 0) + '"><img src="' + e(PH.cdn(g)) + '" alt="" loading="lazy"></button>'; }).join('') + '</div>' : '') +
    '</div><div>' +
    '<p class="part part-big">' + e(p.p) + '</p><h1>' + e(p.t) + '</h1>' +
    (p.s ? '<p class="subtitle">' + e(p.s) + '</p>' : '') +
    longNotes.map(function (x) { return '<p style="margin-top:12px">' + e(x) + '</p>'; }).join('') +
    (cautions.length ? '<p class="warn-box" style="margin-top:14px">' + cautions.map(e).join('<br>') + '</p>' : '') +
    (rows.length ? '<table class="spec-table"><tbody>' + rows.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table>' : '') +
    '<div class="btn-row"><a class="btn btn-primary" href="contact.html?topic=quote&part=' + encodeURIComponent(p.p) + '#message">Request a quote</a>' +
    (p.pdf ? '<a class="btn" href="' + e(PH.cdn(p.pdf)) + '" target="_blank" rel="noopener">' + PH.icon('doc') + 'Download spec sheet</a>' : '') + '</div>' +
    (suffix ? '<div class="note-box" style="margin-top:20px"><h3>What “' + e(suffix.title.toLowerCase()) + '” means</h3><p>' + e(suffix.body) + '</p></div>' : '') +
    '</div></div>' +
    (desc.length ? '<section class="two top" style="padding-bottom:44px"><div><h2 style="font-size:1.4rem;margin-bottom:12px">Details</h2><ul class="ticks">' + desc.map(function (x) { return '<li' + (/:$/.test(x) ? ' class="lead-in"' : '') + '>' + e(x) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="note-box"><h3>See it in a real room</h3><p>Browse installed projects by room type, or ask a rep how this part would work on your wall.</p><div class="btn-row" style="margin-top:12px"><a class="btn" href="projects.html">See projects</a><a class="btn" href="contact.html">Find my rep</a></div></div></section>' : '') +
    (related.length ? '<section style="padding-bottom:56px"><h2 style="font-size:1.4rem;margin-bottom:14px">Related parts</h2><div class="pgrid">' + related.map(PH.productCard).join('') + '</div></section>' : '');

  // Show the small local thumbnail right away, then swap in the full photo once it has loaded.
  var mainImg = document.getElementById('main-img');
  function showFull(src) {
    var hi = new Image();
    hi.onload = function () { mainImg.src = src; };
    hi.src = src;
  }
  if (mainImg && imgs[0]) showFull(PH.cdn(imgs[0]));

  root.addEventListener('click', function (ev) {
    var b = ev.target.closest('.thumbs button');
    if (!b) return;
    showFull(b.getAttribute('data-img'));
    root.querySelectorAll('.thumbs button').forEach(function (x) { x.setAttribute('aria-current', x === b); });
  });
})();
