/* The Healthy Hand mock-up: behaviour (plain JS, Dawn-style).
   Hero tabs, reveal, video players, product cards with add-to-cart, cart drawer, search,
   shop sorting and the product page. Product data comes from catalog.js. */
(function () {
  'use strict';

  var T = window.THH || { products: [], collections: {}, order: [], reviews: {} };
  var byHandle = {};
  T.products.forEach(function (p) { byHandle[p.h] = p; });

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var params = new URLSearchParams(location.search);
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FREE_SHIPPING = 100;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) { return '$' + Number(n).toFixed(2); }
  function moneyShort(n) { n = Math.round(n * 100) / 100; return '$' + (n % 1 ? n.toFixed(2) : n.toFixed(0)); }
  function saving(p) { return p.cmp && p.cmp > p.price ? p.cmp - p.price : 0; }
  function sized(url, w) { return url + (url.indexOf('?') > -1 ? '&' : '?') + 'width=' + w; }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key) || 'null');
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }

  var STAR = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M10 1.6l2.55 5.2 5.75.84-4.16 4.05.98 5.72L10 14.72l-5.12 2.69.98-5.72L1.7 7.64l5.75-.84z"/></svg>';
  var CHECK = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function stars(r, label) {
    var five = STAR + STAR + STAR + STAR + STAR;
    var pct = Math.max(0, Math.min(100, (r / 5) * 100));
    return '<span class="stars" role="img" aria-label="' + esc(label || ('Rated ' + r + ' out of 5')) + '">' +
      '<span class="stars__base">' + five + '</span><span class="stars__fill" style="width:' + pct.toFixed(1) + '%">' + five + '</span></span>';
  }
  function productUrl(h) { return 'product.html?p=' + encodeURIComponent(h); }
  function mediaHtml(p, w) {
    if (p.collage) {
      return '<div class="card__collage" role="img" aria-label="' + esc(p.t) + ': ' + esc(p.collage.map(function (h) { return byHandle[h] ? byHandle[h].t : ''; }).join(', ')) + '">' +
        p.collage.map(function (h) { var q = byHandle[h]; return q ? '<img src="' + esc(sized(q.img[0], Math.round(w / 2))) + '" alt="" loading="lazy">' : ''; }).join('') + '</div>';
    }
    return '<img src="' + esc(sized(p.img[0], w)) + '" alt="' + esc(p.t) + '" loading="lazy" width="' + w + '" height="' + w + '">';
  }
  function thumbUrl(p) { return p.collage ? byHandle[p.collage[0]].img[0] : p.img[0]; }
  function priceHtml(p) {
    var sale = saving(p) > 0;
    return '<span class="' + (sale ? 'price--sale' : '') + '">' + (sale ? '<span class="visually-hidden">Sale price</span>' : '') + money(p.price) + '</span>' +
      (sale ? '<s><span class="visually-hidden">Regular price</span>' + money(p.cmp) + '</s>' : '');
  }

  /* ---------- Product card ---------- */
  function card(p) {
    var badge = p.soldout ? '<span class="badge badge--soldout">Sold out</span>'
      : p.promo ? '<span class="badge badge--promo">' + esc(p.promo) + '</span>'
      : saving(p) ? '<span class="badge">Save ' + moneyShort(saving(p)) + '</span>' : '';
    return '<li class="grid__item"><div class="card-wrapper"><div class="card">' +
      '<div class="card__inner"><div class="card__media">' + mediaHtml(p, 600) + '</div>' + (badge ? '<div class="card__badge">' + badge + '</div>' : '') + '</div>' +
      '<div class="card__content"><div class="card__information">' +
      (p.rating ? '<div class="card__rating">' + stars(p.rating) + '<span>' + p.rating.toFixed(1) + ' (' + p.count + ')</span></div>' : '') +
      '<h3 class="card__heading"><a href="' + productUrl(p.h) + '">' + esc(p.t) + '</a></h3>' +
      '<p class="price">' + priceHtml(p) + '</p></div>' +
      '<div class="thh-atc"><div class="thh-atc__row">' +
      '<div class="qty"><button type="button" data-step="-1" aria-label="Decrease quantity for ' + esc(p.t) + '" disabled>&minus;</button>' +
      '<input type="number" min="1" max="20" value="1" aria-label="Quantity for ' + esc(p.t) + '">' +
      '<button type="button" data-step="1" aria-label="Increase quantity for ' + esc(p.t) + '">+</button></div>' +
      '<button type="button" class="thh-atc__btn" data-add="' + esc(p.h) + '"' + (p.soldout ? ' disabled' : '') + '><span>' +
      (p.soldout ? 'Sold out' : 'Add to cart<span class="thh-atc__amt"> &middot; ' + money(p.price) + '</span>') + '</span></button>' +
      '</div></div></div></div>' +
      '<a class="card__link" href="' + productUrl(p.h) + '" tabindex="-1" aria-hidden="true"></a></div></li>';
  }

  /* ---------- Bundle card (2 x 2) ---------- */
  function bundle(p) {
    var inc = (p.includes || []).map(function (h) { return byHandle[h] ? byHandle[h].t : ''; }).filter(Boolean);
    return '<li class="thh-bundle"><a class="thh-bundle__media" href="' + productUrl(p.h) + '" tabindex="-1" aria-hidden="true">' + mediaHtml(p, 700) + '</a>' +
      '<div class="thh-bundle__body"><h3 class="thh-bundle__name"><a href="' + productUrl(p.h) + '">' + esc(p.t) + '</a></h3>' +
      (p.rating ? '<div class="thh-bundle__rating">' + stars(p.rating) + '<span>' + p.rating.toFixed(1) + ' (' + p.count + ' reviews)</span></div>' : '') +
      '<ul class="thh-bundle__list">' + inc.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      '<div class="thh-bundle__foot"><span class="thh-bundle__price">' + money(p.price) + (saving(p) ? '<s><span class="visually-hidden">Regular price</span>' + money(p.cmp) + '</s>' : '') + '</span>' +
      (saving(p) ? '<span class="thh-save">Save ' + moneyShort(saving(p)) + '</span>' : '') +
      '<button type="button" class="thh-btn" data-add="' + esc(p.h) + '">Add to cart</button></div></div></li>';
  }

  /* ---------- Category tiles ---------- */
  function countIn(k) { return T.products.filter(function (p) { return k === 'all' || p.c.indexOf(k) > -1; }).length; }
  function catTile(k, current) {
    var col = T.collections[k]; var p = byHandle[col.img];
    var n = countIn(k);
    return '<li class="thh-cat"' + (k === current ? ' aria-current="page"' : '') + '><a href="shop.html' + (k === 'all' ? '' : '?c=' + k) + '">' +
      '<div class="thh-cat__img"><img src="' + esc(sized(thumbUrl(p), 400)) + '" alt="" loading="lazy"></div>' +
      '<p class="thh-cat__label">' + esc(col.t) + '<span>' + n + (n === 1 ? ' product' : ' products') + '</span></p></a></li>';
  }
  function renderBlocks(root) {
    $$('[data-products]', root).forEach(function (ul) {
      ul.innerHTML = ul.getAttribute('data-products').split(',').map(function (h) { return byHandle[h.trim()]; }).filter(Boolean).map(card).join('');
    });
    $$('[data-bundles]', root).forEach(function (ul) {
      ul.innerHTML = ul.getAttribute('data-bundles').split(',').map(function (h) { return byHandle[h.trim()]; }).filter(Boolean).map(bundle).join('');
    });
    $$('[data-cats]', root).forEach(function (ul) {
      ul.innerHTML = ul.getAttribute('data-cats').split(',').map(function (k) { return catTile(k.trim(), ul.getAttribute('data-current')); }).join('');
    });
  }

  /* ---------- Quantity inputs ---------- */
  document.addEventListener('click', function (e) {
    var step = e.target.closest('.qty [data-step]');
    if (!step) return;
    var input = step.parentNode.querySelector('input');
    input.value = Math.max(1, Math.min(20, (parseInt(input.value, 10) || 1) + parseInt(step.getAttribute('data-step'), 10)));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  document.addEventListener('change', function (e) {
    if (!e.target.matches('.qty input')) return;
    var v = Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1));
    e.target.value = v;
    var minus = e.target.parentNode.querySelector('[data-step="-1"]');
    if (minus) minus.disabled = v <= 1;
  });

  /* ---------- Drawers ---------- */
  var overlay = $('.drawer-overlay');
  var lastFocus = null;
  function openDrawer(id) {
    var d = document.getElementById(id);
    if (!d) return;
    closeDrawers(true);
    lastFocus = document.activeElement;
    d.classList.add('is-open');
    d.removeAttribute('aria-hidden');
    if (overlay) overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var f = d.querySelector('[data-autofocus]') || d.querySelector('button, a, input');
    if (f) setTimeout(function () { f.focus(); }, 60);
    $$('[aria-controls="' + id + '"]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
  }
  function closeDrawers(silent) {
    $$('.drawer.is-open').forEach(function (d) {
      d.classList.remove('is-open');
      d.setAttribute('aria-hidden', 'true');
      $$('[aria-controls="' + d.id + '"]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    });
    if (overlay) overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (!silent && lastFocus) lastFocus.focus();
  }
  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open-drawer]');
    if (opener) { e.preventDefault(); openDrawer(opener.getAttribute('data-open-drawer')); return; }
    if (e.target.closest('[data-close-drawer]') || e.target === overlay) closeDrawers();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawers(); });

  /* ---------- Cart (stored in this browser only) ---------- */
  var cart = (store('thh-cart') || []).filter(function (l) { return byHandle[l.h]; });
  function saveCart() { store('thh-cart', cart); renderCart(); }
  function addToCart(h, q) {
    var line = cart.filter(function (l) { return l.h === h; })[0];
    if (line) line.q = Math.min(20, line.q + q); else cart.push({ h: h, q: q });
    saveCart();
    openDrawer('CartDrawer');
  }
  function renderCart() {
    var count = cart.reduce(function (a, l) { return a + l.q; }, 0);
    var total = cart.reduce(function (a, l) { return a + l.q * byHandle[l.h].price; }, 0);
    $$('.cart-count').forEach(function (el) { el.textContent = count; el.hidden = !count; });
    var body = $('#CartDrawer .drawer__body');
    var foot = $('#CartDrawer .drawer__footer');
    if (!body) return;
    if (!cart.length) {
      body.innerHTML = '<div class="cart-empty"><p>Your cart is empty.</p><a class="thh-btn" href="shop.html">Shop all</a></div>';
      foot.hidden = true;
      return;
    }
    var left = Math.max(0, FREE_SHIPPING - total);
    foot.hidden = false;
    body.innerHTML = '<div class="cart-ship">' + (left > 0 ? 'You are <b>' + money(left) + '</b> away from free shipping.' : 'You&rsquo;ve got <b>free shipping</b>.') +
      '<div class="cart-ship__bar"><span style="width:' + Math.min(100, (total / FREE_SHIPPING) * 100).toFixed(0) + '%"></span></div></div>' +
      '<ul class="cart-items">' + cart.map(function (l) {
        var p = byHandle[l.h];
        return '<li class="cart-item"><a class="cart-item__img" href="' + productUrl(p.h) + '"><img src="' + esc(sized(thumbUrl(p), 160)) + '" alt=""></a>' +
          '<div><p class="cart-item__name"><a href="' + productUrl(p.h) + '">' + esc(p.t) + '</a></p><p class="cart-item__price">' + money(p.price) + '</p>' +
          '<div class="qty" data-line="' + esc(p.h) + '"><button type="button" data-step="-1" aria-label="Decrease quantity"' + (l.q <= 1 ? ' disabled' : '') + '>&minus;</button>' +
          '<input type="number" min="1" max="20" value="' + l.q + '" aria-label="Quantity for ' + esc(p.t) + '"><button type="button" data-step="1" aria-label="Increase quantity">+</button></div></div>' +
          '<div><b>' + money(p.price * l.q) + '</b><br><button type="button" class="cart-item__remove" data-remove="' + esc(p.h) + '">Remove</button></div></li>';
      }).join('') + '</ul>';
    $('.cart-subtotal span:last-child', foot).textContent = money(total);
  }
  document.addEventListener('change', function (e) {
    var wrap = e.target.closest('.qty[data-line]');
    if (!wrap) return;
    var line = cart.filter(function (l) { return l.h === wrap.getAttribute('data-line'); })[0];
    if (line) { line.q = parseInt(e.target.value, 10) || 1; saveCart(); }
  });
  document.addEventListener('click', function (e) {
    var rm = e.target.closest('[data-remove]');
    if (rm) { cart = cart.filter(function (l) { return l.h !== rm.getAttribute('data-remove'); }); saveCart(); return; }
    var add = e.target.closest('[data-add]');
    if (add && !add.disabled) {
      var scope = add.closest('.thh-atc, .thh-buy');
      var input = scope && scope.querySelector('.qty input');
      addToCart(add.getAttribute('data-add'), input ? parseInt(input.value, 10) || 1 : 1);
    }
  });

  /* ---------- Search ---------- */
  var searchInput = $('#SearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var q = searchInput.value.trim().toLowerCase();
      var list = $('#SearchResults');
      if (!q) { list.innerHTML = ''; return; }
      var hits = T.products.filter(function (p) { return (p.t + ' ' + p.sub + ' ' + (p.ing || '')).toLowerCase().indexOf(q) > -1; }).slice(0, 8);
      list.innerHTML = hits.length ? hits.map(function (p) {
        return '<li><a href="' + productUrl(p.h) + '"><img src="' + esc(sized(thumbUrl(p), 120)) + '" alt=""><span><b>' + esc(p.t) + '</b><span>' + money(p.price) + '</span></span></a></li>';
      }).join('') : '<li>No products found for &ldquo;' + esc(searchInput.value) + '&rdquo;.</li>';
    });
    $('#SearchForm').addEventListener('submit', function (e) { e.preventDefault(); var a = $('#SearchResults a'); if (a) location.href = a.href; });
  }

  /* ---------- Header ---------- */
  var header = $('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  $$('img[data-logo]').forEach(function (img) {
    var fail = function () { img.closest('a').classList.add('logo-fallback'); };
    if (img.complete && !img.naturalWidth) fail(); else img.addEventListener('error', fail);
  });

  /* ---------- Hero: slides with product tabs ---------- */
  $$('[data-hero]').forEach(function (hero) {
    var slides = $$('.thh-hero__slide', hero);
    var tabs = $$('.thh-hero__tab', hero);
    var i = 0, timer = null;
    var auto = !reduceMotion;
    function go(n, focus) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === i); s.inert = k !== i; s.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
      if (focus) tabs[i].focus();
      play();
    }
    function play() {
      clearTimeout(timer);
      if (!auto) return;
      hero.classList.remove('is-playing'); void hero.offsetWidth; hero.classList.add('is-playing');
      if (!hero.classList.contains('is-held')) timer = setTimeout(function () { go(i + 1); }, 6000);
    }
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { auto = false; hero.classList.remove('is-playing'); go(k); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); auto = false; hero.classList.remove('is-playing'); go(i + (e.key === 'ArrowRight' ? 1 : -1), true); }
      });
    });
    var hold = function () { hero.classList.add('is-held'); clearTimeout(timer); };
    var release = function () { hero.classList.remove('is-held'); play(); };
    hero.addEventListener('mouseenter', hold);
    hero.addEventListener('mouseleave', release);
    hero.addEventListener('focusin', hold);
    hero.addEventListener('focusout', release);
    go(0);
  });

  /* ---------- Reveal on scroll ---------- */
  var io = null;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('thh-motion');
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-revealed'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  }
  function arm(root) { if (io) $$('[data-reveal]:not(.is-revealed)', root).forEach(function (el) { io.observe(el); }); }

  /* ---------- Video players ---------- */
  $$('[data-player]').forEach(function (box) {
    var video = $('[data-player-video]', box);
    if (!video) return;
    var src = box.getAttribute('data-src');
    var ambient = box.hasAttribute('data-player-ambient');
    var manual = box.hasAttribute('data-player-manual');
    var attach = function () { if (!video.getAttribute('src')) video.src = src; };
    var start = function () {
      attach();
      var pr = video.play();
      if (pr && pr.then) pr.then(function () { box.classList.add('is-started'); }).catch(function () {});
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && en.intersectionRatio >= 0.5) { if (!reduceMotion && !manual) start(); else attach(); }
          else if (!en.isIntersecting && !video.paused) video.pause();
        });
      }, { threshold: [0, 0.5] }).observe(box);
    }
    var prompt = $('[data-player-prompt]', box);
    if (prompt) prompt.addEventListener('click', function () {
      if (!box.classList.contains('is-started')) start();
      video.muted = false; box.classList.add('is-unmuted');
      if (!ambient) video.controls = true;
    });
    var mute = $('[data-player-mute]', box);
    if (mute) mute.addEventListener('click', function () {
      if (!box.classList.contains('is-started')) start();
      video.muted = !video.muted;
      box.classList.toggle('is-unmuted', !video.muted);
      mute.setAttribute('aria-label', video.muted ? 'Turn sound on' : 'Turn sound off');
    });
  });

  /* ---------- Tabs ---------- */
  $$('[data-tabs]').forEach(function (wrap) {
    var tabs = $$('[role="tab"]', wrap);
    function sel(k, focus) {
      tabs.forEach(function (t, n) {
        var on = n === k;
        t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tabs[k].focus();
    }
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { sel(k); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); sel((k + 1) % tabs.length, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); sel((k - 1 + tabs.length) % tabs.length, true); }
      });
    });
    sel(0);
  });

  /* ---------- Mock forms ---------- */
  $$('form[data-mock]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var s = $('.form-status', f) || f.appendChild(Object.assign(document.createElement('p'), { className: 'form-status' }));
      s.setAttribute('role', 'status');
      s.textContent = f.getAttribute('data-mock');
    });
  });

  /* ---------- Collection page ---------- */
  function initShop() {
    var c = params.get('c');
    if (!T.collections[c]) c = 'all';
    var col = T.collections[c];
    var base = T.products.filter(function (p) { return c === 'all' || p.c.indexOf(c) > -1; });
    document.title = col.t + ' | The Healthy Hand';
    $('#CollectionTitle').textContent = col.t;
    $('#CollectionCrumb').textContent = col.t;
    var d = $('#CollectionDescription');
    d.textContent = col.d; d.hidden = !col.d;
    var nav = $('#CollectionNav');
    nav.setAttribute('data-current', c);
    nav.innerHTML = T.order.map(function (k) { return catTile(k, c); }).join('');
    $('#CollectionCount').textContent = base.length + (base.length === 1 ? ' product' : ' products');
    var sortBy = $('#SortBy');
    var draw = function () {
      var list = base.slice();
      var v = sortBy.value;
      if (v === 'price-asc') list.sort(function (a, b) { return a.price - b.price; });
      if (v === 'price-desc') list.sort(function (a, b) { return b.price - a.price; });
      if (v === 'rating') list.sort(function (a, b) { return (b.rating || 0) - (a.rating || 0) || b.count - a.count; });
      $('#CollectionGrid').innerHTML = list.map(card).join('');
    };
    sortBy.addEventListener('change', draw);
    draw();
  }

  /* ---------- Product page ---------- */
  function initProduct() {
    var p = byHandle[params.get('p')] || byHandle['soursop-ginger-detox-tea-bags'];
    document.title = p.t + ' | The Healthy Hand';
    $('#ProductCrumb').textContent = p.t;

    var gallery = $('#Gallery'), main = $('#GalleryMain'), thumbs = $('#GalleryThumbs');
    if (p.collage || p.img.length < 2) {
      gallery.classList.add('thh-gallery--single');
      thumbs.hidden = true;
      main.innerHTML = mediaHtml(p, 1100);
    } else {
      var show = function (k) {
        main.innerHTML = '<img src="' + esc(sized(p.img[k], 1100)) + '" alt="' + esc(p.t) + ', image ' + (k + 1) + ' of ' + p.img.length + '" width="1100" height="1100">';
        $$('.thh-thumb', thumbs).forEach(function (b, n) { b.setAttribute('aria-current', n === k ? 'true' : 'false'); });
      };
      thumbs.innerHTML = p.img.map(function (u, k) {
        return '<li><button type="button" class="thh-thumb" data-k="' + k + '" aria-label="Show image ' + (k + 1) + '"><img src="' + esc(sized(u, 200)) + '" alt=""></button></li>';
      }).join('');
      thumbs.addEventListener('click', function (e) { var b = e.target.closest('[data-k]'); if (b) show(+b.getAttribute('data-k')); });
      show(0);
    }

    $('#ProductTitle').textContent = p.t;
    $('#ProductSub').textContent = p.sub;
    $('#ProductRating').innerHTML = p.rating
      ? stars(p.rating) + '<a href="#reviews">' + p.rating.toFixed(1) + ' from ' + p.count + ' reviews</a>'
      : '<span>No reviews yet</span>';
    var save = saving(p);
    $('#ProductPrice').innerHTML = '<span class="now' + (save ? ' is-sale' : '') + '">' + money(p.price) + '</span>' +
      (save ? '<s><span class="visually-hidden">Regular price</span>' + money(p.cmp) + '</s><span class="thh-save">Save ' + moneyShort(save) + '</span>' : '') +
      (p.promo ? '<span class="badge badge--promo">' + esc(p.sub) + '</span>' : '');
    var inst = $('#ProductInstallments');
    inst.hidden = p.price < 50;
    inst.textContent = 'Or 4 interest-free payments of ' + money(p.price / 4) + ' at checkout.';
    var checks = $('#ProductChecks');
    checks.innerHTML = (p.free || []).slice(0, 6).map(function (f) { return '<li>' + CHECK + esc(f) + '</li>'; }).join('');
    checks.hidden = !(p.free || []).length;
    if (p.includes) {
      $('#ProductIncludes').innerHTML = '<b>What&rsquo;s included</b><ul>' + p.includes.map(function (h) {
        var q = byHandle[h]; return q ? '<li><a href="' + productUrl(h) + '">' + esc(q.t) + '</a></li>' : '';
      }).join('') + '</ul>';
      $('#ProductIncludes').hidden = false;
    }
    var addBtn = $('#ProductAdd');
    addBtn.setAttribute('data-add', p.h);
    addBtn.innerHTML = p.soldout ? 'Sold out' : 'Add to cart &middot; ' + money(p.price);
    addBtn.disabled = !!p.soldout;

    var kit = p.pair && byHandle[p.pair];
    if (kit) {
      var both = byHandle['total-belly-detox'].price + byHandle['total-system-detox'].price;
      $('#PairIt').innerHTML = '<img src="' + esc(sized(kit.img[0], 160)) + '" alt="">' +
        '<div><p><b>Taking both?</b><br>Total Belly + Total System cost ' + money(both) + ' on their own, or ' + money(kit.price) + ' as the ' + esc(kit.t) + ' (save ' + moneyShort(both - kit.price) + ').</p>' +
        '<button type="button" data-add="' + esc(kit.h) + '">Add the kit instead</button></div>';
      $('#PairIt').hidden = false;
    }
    var powder = p.c.some(function (c) { return c === 'powders' || c === 'bundles'; });
    $('#HowStrip').hidden = !powder;
    $('#HowItWorks').hidden = !powder;

    $('#TabDescription').innerHTML = p.about.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');
    $('#TabInside').innerHTML = '<p>' + esc(p.ing || 'See the label.') + '</p>' +
      ((p.free || []).length ? '<ul>' + p.free.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' : '');
    $('#TabUse').innerHTML = '<ul>' + p.use.map(function (u) { return '<li>' + esc(u) + '</li>'; }).join('') + '</ul>';
    $('#SennaNote').hidden = !p.senna;

    /* Reviews with star filter */
    var revs = T.reviews[p.h] || [];
    $('#ReviewScore').innerHTML = p.rating
      ? '<b>' + p.rating.toFixed(1) + '</b><span>' + stars(p.rating) + '<small>' + p.count + ' verified reviews</small></span>'
      : '<span><small>No reviews yet for this product.</small></span>';
    $('#ReviewNote').textContent = revs.length ? 'Showing the ' + revs.length + ' most recent Loox reviews' + (revs.length < p.count ? '. The live store loads all ' + p.count + '.' : '.') : '';
    var filter = $('#ReviewFilter');
    var star = 0, shown = 6;
    var counts = [0, 0, 0, 0, 0, 0];
    revs.forEach(function (r) { counts[r.r]++; });
    filter.innerHTML = revs.length ? ['All'].concat([5, 4, 3, 2, 1]).map(function (s) {
      var n = s === 'All' ? revs.length : counts[s];
      return '<li><button type="button" data-star="' + (s === 'All' ? 0 : s) + '" aria-pressed="' + (s === 'All') + '"' + (n ? '' : ' disabled') + '>' +
        (s === 'All' ? 'All' : s + '&#9733;') + ' (' + n + ')</button></li>';
    }).join('') : '';
    var list = $('#ReviewList'), more = $('#ReviewMore');
    var draw = function () {
      var rs = revs.filter(function (r) { return !star || r.r === star; });
      list.innerHTML = rs.slice(0, shown).map(function (r) {
        var photos = (r.m || []).filter(function (m) { return m.src; }).slice(0, 3);
        return '<li class="thh-quote"><div class="thh-rlist__head">' + stars(r.r, r.r + ' out of 5 stars') + '<span class="date">' + esc(r.d) + '</span></div>' +
          '<blockquote>' + esc(r.t) + '</blockquote>' +
          (photos.length ? '<div class="thh-rlist__media">' + photos.map(function (m) {
            return '<img src="' + esc(m.src) + '" alt="' + (m.t === 'video' ? 'Video' : 'Photo') + ' from ' + esc(r.a) + '" loading="lazy">';
          }).join('') + '</div>' : '') +
          '<div class="thh-quote__by"><div><b>' + esc(r.a) + '</b><span class="verified">' + CHECK + 'Verified buyer</span></div></div></li>';
      }).join('');
      more.hidden = shown >= rs.length;
    };
    filter.addEventListener('click', function (e) {
      var b = e.target.closest('[data-star]'); if (!b) return;
      star = +b.getAttribute('data-star'); shown = 6;
      $$('[data-star]', filter).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      draw();
    });
    more.addEventListener('click', function () { shown += 6; draw(); });
    draw();

    var related = T.products.filter(function (q) { return q.h !== p.h && !q.soldout && q.c.some(function (c) { return p.c.indexOf(c) > -1; }); });
    if (related.length < 4) related = related.concat(T.products.filter(function (q) { return q.h !== p.h && related.indexOf(q) < 0; }));
    $('#Related').innerHTML = related.slice(0, 4).map(card).join('');
  }

  var page = document.body.getAttribute('data-page');
  renderBlocks(document);
  if (page === 'shop') initShop();
  if (page === 'product') initProduct();
  arm(document);
  renderCart();
})();
