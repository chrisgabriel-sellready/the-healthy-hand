/* The Healthy Hand theme: behaviour for the redesigned (mock-up) sections.
   Mirrors the Kemp theme's kb-refresh.js (reveal, film / reel players, gallery row) and Dawn's
   slideshow, cart drawer and quantity input, in plain JS. Cart, search and products use Shopify's
   AJAX APIs; window.THH (routes, money format, free shipping threshold) is set in layout/thh.liquid. */
(function () {
  'use strict';

  var T = window.THH || {};
  var R = T.routes || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FREE_SHIPPING = T.freeShipping || 10000;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  /* Shopify money format, e.g. "${{amount}}" */
  function money(cents) {
    var fmt = T.moneyFormat || '${{amount}}';
    var n = (cents || 0) / 100;
    return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, function (m, key) {
      var parts = n.toFixed(2).split('.');
      var whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, key.indexOf('comma') > -1 ? '.' : ',');
      if (key === 'amount_no_decimals' || key === 'amount_no_decimals_with_comma_separator') return whole;
      return whole + (key.indexOf('comma') > -1 ? ',' : '.') + parts[1];
    });
  }
  function sized(url, w) { return url ? url + (url.indexOf('?') > -1 ? '&' : '?') + 'width=' + w : ''; }
  function json(url, body) {
    return fetch(url, body ? { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) } : { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw d; return d; }); });
  }

  /* ---------- Quantity inputs ---------- */
  document.addEventListener('click', function (e) {
    var step = e.target.closest('.qty [data-step]');
    if (!step) return;
    var input = step.parentNode.querySelector('input');
    var v = Math.max(1, Math.min(99, (parseInt(input.value, 10) || 1) + parseInt(step.getAttribute('data-step'), 10)));
    input.value = v;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  document.addEventListener('change', function (e) {
    if (!e.target.matches('.qty input')) return;
    var input = e.target;
    var v = Math.max(1, Math.min(99, parseInt(input.value, 10) || 1));
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

  /* ---------- Cart (Dawn cart drawer on Shopify's AJAX cart) ---------- */
  function renderCart(c) {
    $$('.cart-count').forEach(function (el) { el.textContent = c.item_count; el.hidden = !c.item_count; });
    var bodies = $$('#CartDrawer .drawer__body');
    var foot = $('#CartDrawer .drawer__footer');
    var page = $('[data-cart-page]');
    if (page && !c.item_count) { location.reload(); return; }
    var left = Math.max(0, FREE_SHIPPING - c.total_price);
    var html;
    if (!c.item_count) {
      html = '<div class="cart-empty"><p>Your cart is empty.</p><a class="kb-btn" href="' + esc(R.allProducts || '/collections/all') + '">Continue shopping</a></div>';
    } else {
      html = '<div class="cart-ship">' + (left > 0 ? 'You are <b>' + money(left) + '</b> away from free shipping.' : 'You&rsquo;ve got <b>free shipping</b>.') +
        '<div class="cart-ship__bar"><span style="width:' + Math.min(100, (c.total_price / FREE_SHIPPING) * 100).toFixed(0) + '%"></span></div></div>' +
        '<ul class="cart-items">' + c.items.map(function (l) {
          var opts = l.product_has_only_default_variant ? '' : '<p class="cart-item__price">' + esc(l.variant_title) + '</p>';
          return '<li class="cart-item"><a class="cart-item__img" href="' + esc(l.url) + '">' + (l.image ? '<img src="' + esc(sized(l.image, 160)) + '" alt="">' : '') + '</a>' +
            '<div><p class="cart-item__name"><a href="' + esc(l.url) + '">' + esc(l.product_title) + '</a></p>' + opts + '<p class="cart-item__price">' + money(l.final_price) + '</p>' +
            '<div class="qty" data-line="' + esc(l.key) + '"><button type="button" data-step="-1" aria-label="Decrease quantity"' + (l.quantity <= 1 ? ' disabled' : '') + '>&minus;</button>' +
            '<input type="number" min="1" max="99" value="' + l.quantity + '" aria-label="Quantity for ' + esc(l.product_title) + '"><button type="button" data-step="1" aria-label="Increase quantity">+</button></div></div>' +
            '<div><b>' + money(l.final_line_price) + '</b><br><button type="button" class="cart-item__remove" data-remove="' + esc(l.key) + '">Remove</button></div></li>';
        }).join('') + '</ul>';
    }
    bodies.forEach(function (b) { b.innerHTML = html; });
    if (page) {
      page.querySelectorAll('.cart-ship, .cart-items').forEach(function (el) { el.remove(); });
      page.insertAdjacentHTML('afterbegin', html);
    }
    $$('[data-cart-subtotal]').forEach(function (el) { el.textContent = money(c.total_price); });
    if (foot) foot.hidden = !c.item_count;
  }
  function refreshCart() { return json((R.cart || '/cart') + '.js').then(renderCart); }
  function changeLine(key, qty) {
    return json((R.cartChange || '/cart/change') + '.js', { id: key, quantity: qty }).then(renderCart).catch(refreshCart);
  }
  function addToCart(variantId, qty, btn) {
    if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); }
    return json((R.cartAdd || '/cart/add') + '.js', { items: [{ id: Number(variantId), quantity: qty }] })
      .then(refreshCart)
      .then(function () { openDrawer('CartDrawer'); })
      .catch(function (err) { alert((err && (err.description || err.message)) || 'Sorry, that could not be added to your cart.'); })
      .then(function () { if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); } });
  }
  document.addEventListener('change', function (e) {
    var wrap = e.target.closest('.qty[data-line]');
    if (wrap) changeLine(wrap.getAttribute('data-line'), parseInt(e.target.value, 10) || 1);
  });
  document.addEventListener('click', function (e) {
    var rm = e.target.closest('[data-remove]');
    if (rm) { changeLine(rm.getAttribute('data-remove'), 0); return; }
    var add = e.target.closest('[data-add]');
    if (add && !add.disabled) {
      e.preventDefault();
      var scope = add.closest('.kb-atc, .product-form');
      var input = scope && scope.querySelector('.qty input');
      addToCart(add.getAttribute('data-add'), input ? parseInt(input.value, 10) || 1 : 1, add);
    }
  });
  /* The header cart icon is a link to /cart; on the cart page itself let it navigate. */
  $$('a[data-open-drawer="CartDrawer"]').forEach(function (a) { if ($('[data-cart-page]')) a.removeAttribute('data-open-drawer'); });

  /* ---------- Search drawer (Shopify predictive search) ---------- */
  var searchInput = $('#SearchInput');
  if (searchInput) {
    var timer = null, seq = 0;
    searchInput.addEventListener('input', function () {
      clearTimeout(timer);
      var q = searchInput.value.trim();
      var list = $('#SearchResults');
      if (!q) { list.innerHTML = ''; return; }
      timer = setTimeout(function () {
        var mine = ++seq;
        json((R.predictive || '/search/suggest') + '.json?q=' + encodeURIComponent(q) + '&resources[type]=product&resources[limit]=8')
          .then(function (d) {
            if (mine !== seq) return;
            var hits = (d.resources && d.resources.results && d.resources.results.products) || [];
            list.innerHTML = hits.length ? hits.map(function (p) {
              return '<li><a href="' + esc(p.url) + '">' + (p.image ? '<img src="' + esc(sized(p.image, 120)) + '" alt="">' : '') + '<span><b>' + esc(p.title) + '</b><span>' + esc(money(Math.round(parseFloat(p.price) * 100))) + '</span></span></a></li>';
            }).join('') : '<li>No products found for &ldquo;' + esc(q) + '&rdquo;.</li>';
          }).catch(function () {});
      }, 200);
    });
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

  /* ---------- Product page: gallery, variants, reviews ---------- */
  $$('[data-product]').forEach(function (box) {
    var main = $('[data-product-main]', box);
    $$('.product__thumb', box).forEach(function (b, k, all) {
      b.addEventListener('click', function () {
        main.innerHTML = '<img src="' + esc(b.getAttribute('data-src')) + '" alt="' + esc(b.getAttribute('data-alt')) + '" width="1100" height="1100">';
        all.forEach(function (o) { o.setAttribute('aria-current', o === b ? 'true' : 'false'); });
      });
    });
    var select = $('[data-variant-select]', box);
    if (select) select.addEventListener('change', function () {
      var opt = select.options[select.selectedIndex];
      var id = select.value, avail = opt.getAttribute('data-available') === 'true';
      var hidden = $('[data-variant-id]', box.parentNode); if (hidden) hidden.value = id;
      var btn = $('.product-form__submit', box);
      btn.setAttribute('data-add', id);
      btn.disabled = !avail;
      btn.innerHTML = avail ? 'Add to cart &middot; ' + esc(opt.getAttribute('data-price')) : 'Sold out';
      var price = $('[data-product-price] .price-item--sale', box);
      if (price) price.textContent = opt.getAttribute('data-price');
      if (window.history.replaceState) { var u = new URL(location.href); u.searchParams.set('variant', id); history.replaceState(null, '', u); }
    });
  });
  $$('[data-review-more]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var hiddenOnes = $$('[data-review-list] > li[hidden]', btn.closest('section'));
      hiddenOnes.slice(0, 6).forEach(function (li) { li.hidden = false; });
      btn.hidden = hiddenOnes.length <= 6;
    });
  });

  /* ---------- Collection sort ---------- */
  $$('[data-sort]').forEach(function (sel) {
    sel.addEventListener('change', function () { var u = new URL(location.href); u.searchParams.set('sort_by', sel.value); u.searchParams.delete('page'); location.href = u; });
  });

  /* ---------- HealthyText SMS sign-up (VIA by default, or Klaviyo) ---------- */
  $$('form[data-sms-signup]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var s = $('.form-status', f) || f.appendChild(Object.assign(document.createElement('p'), { className: 'form-status' }));
      s.setAttribute('role', 'status');
      var phone = f.querySelector('input[type="tel"]').value.replace(/[^\d+]/g, '');
      if (phone.charAt(0) !== '+') phone = (phone.length === 10 ? '+1' : '+') + phone;
      var req;
      if (f.getAttribute('data-provider') === 'klaviyo') {
        var list = f.getAttribute('data-list'), company = f.getAttribute('data-company');
        if (!list || !company) { s.textContent = 'Sign-up isn’t connected yet.'; return; }
        req = fetch('https://a.klaviyo.com/client/subscriptions/?company_id=' + encodeURIComponent(company), {
          method: 'POST', headers: { 'Content-Type': 'application/json', revision: '2024-10-15' },
          body: JSON.stringify({ data: { type: 'subscription', attributes: { custom_source: 'THH HealthyText band', profile: { data: { type: 'profile', attributes: { phone_number: phone, subscriptions: { sms: { marketing: { consent: 'SUBSCRIBED' } } } } } } }, relationships: { list: { data: { type: 'list', id: list } } } } })
        });
      } else {
        req = fetch('https://api.via-backend.com/api/shopify/page-subscribe', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywordId: f.getAttribute('data-via-keyword'), phoneNumber: phone })
        });
      }
      req.then(function (r) {
        s.textContent = r.ok ? f.getAttribute('data-done') : 'Please check the number and try again.';
        if (r.ok) f.reset();
      }).catch(function () { s.textContent = 'Please try again.'; });
    });
  });

  refreshCart().catch(function () {});
})();
