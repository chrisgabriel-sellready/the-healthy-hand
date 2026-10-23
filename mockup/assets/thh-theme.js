/* The Healthy Hand mock-up: behaviour for the Kemp-based sections.
   Mirrors the Kemp theme's kb-refresh.js (reveal, film / reel players, gallery row) and Dawn's
   slideshow, cart drawer and quantity input, in plain JS. Product data comes from catalog.js. */
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
  function sized(url, w) { return url + (url.indexOf('?') > -1 ? '&' : '?') + 'width=' + w; }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key) || 'null');
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }

  var STAR = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M10 1.6l2.55 5.2 5.75.84-4.16 4.05.98 5.72L10 14.72l-5.12 2.69.98-5.72L1.7 7.64l5.75-.84z"/></svg>';
  var CHECK = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M7 4.5v15l12.5-7.5z"/></svg>';
  function stars(r, label) {
    var five = STAR + STAR + STAR + STAR + STAR;
    var pct = Math.max(0, Math.min(100, (r / 5) * 100));
    return '<span class="stars" role="img" aria-label="' + esc(label || ('Rated ' + r + ' out of 5')) + '">' +
      '<span class="stars__base">' + five + '</span><span class="stars__fill" style="width:' + pct.toFixed(1) + '%">' + five + '</span></span>';
  }
  function productUrl(h) { return 'product.html?p=' + encodeURIComponent(h); }
  function mediaHtml(p, w, cls) {
    if (p.collage) {
      return '<div class="card__collage" role="img" aria-label="' + esc(p.t) + ': ' + esc(p.collage.map(function (h) { return byHandle[h] ? byHandle[h].t : ''; }).join(', ')) + '">' +
        p.collage.map(function (h) { var q = byHandle[h]; return q ? '<img src="' + esc(sized(q.img[0], Math.round(w / 2))) + '" alt="" loading="lazy">' : ''; }).join('') + '</div>';
    }
    return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + esc(sized(p.img[0], w)) + '" alt="' + esc(p.t) + '" loading="lazy" width="' + w + '" height="' + w + '">';
  }
  function thumbUrl(p) { return p.collage ? byHandle[p.collage[0]].img[0] : p.img[0]; }

  /* ---------- Product card (Kemp kb-card-atc) ---------- */
  function card(p) {
    var sale = p.cmp && p.cmp > p.price;
    var badges = '';
    if (p.soldout) badges += '<span class="badge badge--soldout">Sold out</span>';
    else if (p.promo) badges += '<span class="badge badge--promo">' + esc(p.promo) + '</span>';
    else if (sale) badges += '<span class="badge">Sale</span>';
    return '<li class="grid__item"><div class="card-wrapper"><div class="card">' +
      '<div class="card__inner"><div class="card__media">' + mediaHtml(p, 600) + '</div>' +
      (badges ? '<div class="card__badge">' + badges + '</div>' : '') + '</div>' +
      '<div class="card__content"><div class="card__information">' +
      (p.rating ? '<div class="card__rating">' + stars(p.rating) + '<span>' + p.rating.toFixed(1) + ' (' + p.count + ')</span></div>' : '') +
      '<h3 class="card__heading"><a href="' + productUrl(p.h) + '">' + esc(p.t) + '</a></h3>' +
      '<div class="price"><div class="price__container">' + (sale ? '<s><span class="visually-hidden">Regular price</span>' + money(p.cmp) + '</s>' : '') +
      '<span class="' + (sale ? 'price--sale' : '') + '">' + (sale ? '<span class="visually-hidden">Sale price</span>' : '') + money(p.price) + '</span></div></div>' +
      '</div><div class="kb-atc"><div class="kb-atc__row">' +
      '<div class="qty"><button type="button" data-step="-1" aria-label="Decrease quantity for ' + esc(p.t) + '" disabled>&minus;</button>' +
      '<input type="number" min="1" max="20" value="1" aria-label="Quantity for ' + esc(p.t) + '">' +
      '<button type="button" data-step="1" aria-label="Increase quantity for ' + esc(p.t) + '">+</button></div>' +
      '<button type="button" class="kb-atc__btn" data-add="' + esc(p.h) + '"' + (p.soldout ? ' disabled' : '') + '><span>' +
      (p.soldout ? 'Sold out' : 'Add to cart<span class="kb-atc__amt"> &middot; ' + money(p.price) + '</span>') + '</span></button>' +
      '</div></div></div></div>' +
      '<a class="kb-card__link" href="' + productUrl(p.h) + '" tabindex="-1" aria-hidden="true"></a></div></li>';
  }
  function renderGrids(root) {
    $$('[data-products]', root).forEach(function (ul) {
      ul.innerHTML = ul.getAttribute('data-products').split(',').map(function (h) { return byHandle[h.trim()]; })
        .filter(Boolean).map(card).join('');
    });
  }

  /* ---------- Quantity inputs ---------- */
  document.addEventListener('click', function (e) {
    var step = e.target.closest('.qty [data-step]');
    if (!step) return;
    var input = step.parentNode.querySelector('input');
    var v = Math.max(1, Math.min(20, (parseInt(input.value, 10) || 1) + parseInt(step.getAttribute('data-step'), 10)));
    input.value = v;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  document.addEventListener('change', function (e) {
    if (!e.target.matches('.qty input')) return;
    var input = e.target;
    var v = Math.max(1, Math.min(20, parseInt(input.value, 10) || 1));
    input.value = v;
    var minus = input.parentNode.querySelector('[data-step="-1"]');
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

  /* ---------- Cart (Dawn cart drawer, stored in this browser only) ---------- */
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
    var left = Math.max(0, FREE_SHIPPING - total);
    var ship = '<div class="cart-ship">' + (left > 0 ? 'You are <b>' + money(left) + '</b> away from free shipping.' : 'You&rsquo;ve got <b>free shipping</b>.') +
      '<div class="cart-ship__bar"><span style="width:' + Math.min(100, (total / FREE_SHIPPING) * 100).toFixed(0) + '%"></span></div></div>';
    if (!cart.length) {
      body.innerHTML = '<div class="cart-empty"><p>Your cart is empty.</p><a class="kb-btn" href="shop.html">Continue shopping</a></div>';
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    body.innerHTML = ship + '<ul class="cart-items">' + cart.map(function (l) {
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
      var scope = add.closest('.kb-atc, .product-form');
      var input = scope && scope.querySelector('.qty input');
      addToCart(add.getAttribute('data-add'), input ? parseInt(input.value, 10) || 1 : 1);
    }
  });

  /* ---------- Search drawer ---------- */
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

  /* ---------- Slideshow (Kemp slideshow-new: dots, 5s autoplay) ---------- */
  $$('[data-slideshow]').forEach(function (hero) {
    var slides = $$('.slideshow__slide', hero);
    var dots = $$('.slideshow__dot', hero);
    var i = 0, timer = null, paused = reduceMotion;
    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === i); s.setAttribute('aria-hidden', k === i ? 'false' : 'true'); s.inert = k !== i; });
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    }
    function play() { stop(); if (!paused) timer = setInterval(function () { go(i + 1); }, 5000); }
    function stop() { clearInterval(timer); }
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); play(); }); });
    var pause = $('.slideshow__pause', hero);
    if (pause) pause.addEventListener('click', function () {
      paused = !paused; hero.classList.toggle('is-paused', paused);
      pause.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
      play();
    });
    hero.classList.toggle('is-paused', paused);
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', play);
    go(0); play();
  });

  /* ---------- Reveal on scroll (kb-refresh) ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('kb-motion');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-revealed'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    var arm = function (root) {
      $$('[data-kb-reveal]', root).forEach(function (el) {
        if (el.getAttribute('data-kb-reveal') === 'stagger') $$(':scope > *', el).forEach(function (c, k) { c.style.setProperty('--kb-i', k); });
        io.observe(el);
      });
    };
    arm(document);
    T.arm = arm;
  }

  /* ---------- Film / reel players (kb-film-player, kb-home-reel, kb-performance-video) ---------- */
  $$('[data-kbp]').forEach(function (box) {
    var video = $('[data-kbp-video]', box);
    if (!video) return;
    var src = box.getAttribute('data-src');
    var ambient = box.hasAttribute('data-kbp-ambient');
    var manual = box.hasAttribute('data-kbp-manual');
    var attach = function () { if (!video.getAttribute('src')) { video.src = src; } };
    var start = function () {
      attach();
      var pr = video.play();
      if (pr && pr.then) pr.then(function () { box.classList.add('is-started'); box.classList.remove('is-paused'); }).catch(function () {});
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && en.intersectionRatio >= 0.5) { if (!reduceMotion && !manual) start(); else attach(); }
          else if (!en.isIntersecting && !video.paused) { video.pause(); box.classList.add('is-paused'); }
        });
      }, { threshold: [0, 0.5] }).observe(box);
    }
    var prompt = $('[data-kbp-prompt]', box);
    if (prompt) prompt.addEventListener('click', function () {
      if (!box.classList.contains('is-started')) { start(); }
      video.muted = false; box.classList.add('is-unmuted');
      if (!ambient) video.controls = true;
    });
    var mute = $('[data-kbp-mute]', box);
    if (mute) mute.addEventListener('click', function () {
      if (!box.classList.contains('is-started')) start();
      video.muted = !video.muted;
      box.classList.toggle('is-unmuted', !video.muted);
      mute.setAttribute('aria-label', video.muted ? 'Turn sound on' : 'Turn sound off');
    });
  });

  /* ---------- Sideways rows (kb-game-day arrows, testimonial nav) ---------- */
  $$('[data-row]').forEach(function (wrap) {
    var strip = $('[data-row-strip]', wrap);
    var prev = $('[data-row-prev]', wrap), next = $('[data-row-next]', wrap);
    if (!strip || !prev || !next) return;
    var sync = function () {
      prev.disabled = strip.scrollLeft <= 2;
      next.disabled = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 2;
    };
    prev.addEventListener('click', function () { strip.scrollBy({ left: -strip.clientWidth * 0.8 }); });
    next.addEventListener('click', function () { strip.scrollBy({ left: strip.clientWidth * 0.8 }); });
    strip.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  /* ---------- YouTube click-to-play (About: customer videos) ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-yt]');
    if (!b) return;
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(b.getAttribute('data-yt')) + '?autoplay=1&rel=0';
    f.title = b.getAttribute('aria-label') || 'Customer video';
    f.allow = 'autoplay; encrypted-media; picture-in-picture';
    f.allowFullscreen = true;
    b.replaceWith(f);
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
    var list = T.products.filter(function (p) { return c === 'all' || p.c.indexOf(c) > -1; });
    document.title = col.t + ' | The Healthy Hand';
    $('#CollectionTitle').textContent = col.t;
    $('#CollectionCrumb').textContent = col.t;
    var d = $('#CollectionDescription');
    d.textContent = col.d; d.hidden = !col.d;
    $('#CollectionFilters').innerHTML = T.order.map(function (k) {
      return '<li><a href="shop.html' + (k === 'all' ? '' : '?c=' + k) + '"' + (k === c ? ' aria-current="page"' : '') + '>' + esc(T.collections[k].t) + '</a></li>';
    }).join('');
    $('#CollectionCount').textContent = list.length + (list.length === 1 ? ' product' : ' products');
    $('#CollectionGrid').innerHTML = list.map(card).join('');
  }

  /* ---------- Product page ---------- */
  function initProduct() {
    var p = byHandle[params.get('p')] || byHandle['soursop-ginger-detox-tea-bags'];
    var sale = p.cmp && p.cmp > p.price;
    document.title = p.t + ' | The Healthy Hand';
    $('#ProductCrumb').textContent = p.t;

    var main = $('#ProductMedia');
    var thumbs = $('#ProductThumbs');
    if (p.collage) {
      main.innerHTML = mediaHtml(p, 1000);
      thumbs.hidden = true;
    } else {
      var show = function (k) {
        main.innerHTML = '<img src="' + esc(sized(p.img[k], 1100)) + '" alt="' + esc(p.t) + (p.img.length > 1 ? ', image ' + (k + 1) + ' of ' + p.img.length : '') + '" width="1100" height="1100">';
        $$('.product__thumb', thumbs).forEach(function (b, n) { b.setAttribute('aria-current', n === k ? 'true' : 'false'); });
      };
      thumbs.innerHTML = p.img.length > 1 ? p.img.map(function (u, k) {
        return '<li><button type="button" class="product__thumb" data-k="' + k + '" aria-label="Show image ' + (k + 1) + '"><img src="' + esc(sized(u, 200)) + '" alt=""></button></li>';
      }).join('') : '';
      thumbs.hidden = p.img.length < 2;
      thumbs.addEventListener('click', function (e) { var b = e.target.closest('[data-k]'); if (b) show(+b.getAttribute('data-k')); });
      show(0);
    }

    $('#ProductTitle').textContent = p.t;
    $('#ProductSub').textContent = p.sub;
    $('#ProductRating').innerHTML = p.rating
      ? stars(p.rating) + '<a href="#reviews">' + p.rating.toFixed(1) + ' from ' + p.count + ' reviews</a>'
      : '<span class="product__sub" style="margin:0">No reviews yet</span>';
    $('#ProductPrice').innerHTML = '<span class="price-item--sale' + (sale ? ' price--sale' : '') + '">' + money(p.price) + '</span>' +
      (sale ? '<s><span class="visually-hidden">Regular price</span>' + money(p.cmp) + '</s><span class="badge">Save ' + Math.round((1 - p.price / p.cmp) * 100) + '%</span>' : '') +
      (p.promo ? '<span class="badge badge--promo">' + esc(p.sub) + '</span>' : '');
    $('#ProductInstallments').hidden = p.price < 50;
    $('#ProductInstallments').textContent = 'Or 4 interest-free payments of ' + money(p.price / 4) + ' at checkout.';
    $('#ProductFeatures').innerHTML = (p.free || []).slice(0, 6).map(function (f) { return '<li>' + CHECK + esc(f) + '</li>'; }).join('');
    $('#ProductFeatures').hidden = !(p.free || []).length;
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
    $('#ProductDescription').innerHTML = p.about.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');
    $('#TabIngredients').innerHTML = '<p>' + esc(p.ing || 'See the label.') + '</p>' +
      ((p.free || []).length ? '<ul>' + p.free.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' : '');
    $('#TabUse').innerHTML = '<ul>' + p.use.map(function (u) { return '<li>' + esc(u) + '</li>'; }).join('') + '</ul>';
    $('#SennaNote').hidden = !p.senna;

    var detoxish = p.c.some(function (c) { return c === 'powders' || c === 'bundles'; });
    var how = $('#HowItWorks'); if (how) how.hidden = !detoxish;

    var revs = T.reviews[p.h] || [];
    var rs = $('#ReviewSummary');
    if (p.rating) {
      rs.innerHTML = '<div><div class="reviews__score">' + p.rating.toFixed(1) + '</div>' + stars(p.rating) +
        '<p class="reviews__count">Based on ' + p.count + ' verified reviews</p></div>' +
        '<p class="reviews__note">Showing the ' + revs.length + ' most recent reviews from Loox' +
        (revs.length < p.count ? '. The live store loads all ' + p.count + ' through the Loox widget.' : '.') + '</p>';
    } else {
      rs.innerHTML = '<div><p class="reviews__count" style="margin:0">No reviews yet for this product.</p></div>';
    }
    var list = $('#ReviewList');
    var shown = 6;
    var drawReviews = function () {
      list.innerHTML = revs.slice(0, shown).map(function (r) {
        var photos = (r.m || []).filter(function (m) { return m.src; }).slice(0, 3);
        return '<li class="review">' + (photos.length ? '<div class="review__media">' + photos.map(function (m) {
          return '<img src="' + esc(m.src) + '" alt="' + (m.t === 'video' ? 'Video' : 'Photo') + ' from ' + esc(r.a) + '" loading="lazy">';
        }).join('') + '</div>' : '') +
          '<div class="review__head"><span class="review__author">' + esc(r.a) + '</span><span class="review__date">' + esc(r.d) + '</span></div>' +
          stars(r.r, r.r + ' out of 5 stars') + '<p class="verified-buyer" style="justify-content:flex-start">' + CHECK + 'Verified buyer</p>' +
          '<p class="review__text">' + esc(r.t) + '</p></li>';
      }).join('');
      var more = $('#ReviewMore');
      more.hidden = shown >= revs.length;
    };
    $('#ReviewMore').addEventListener('click', function () { shown += 6; drawReviews(); });
    drawReviews();
    $('#reviews').hidden = false;

    var related = T.products.filter(function (q) { return q.h !== p.h && !q.soldout && q.c.some(function (c) { return p.c.indexOf(c) > -1; }); });
    if (related.length < 4) related = related.concat(T.products.filter(function (q) { return q.h !== p.h && related.indexOf(q) < 0; }));
    $('#Related').innerHTML = related.slice(0, 4).map(card).join('');
  }

  var page = document.body.getAttribute('data-page');
  renderGrids(document);
  if (page === 'shop') initShop();
  if (page === 'product') initProduct();
  if (T.arm) T.arm(document);
  renderCart();
})();
