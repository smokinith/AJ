/* ═══════════════════════════════════════════════════════════════════════
   AJ HOLIDAYS — APPLICATION LAYER
   Scroll orchestration · bento grid · parametric builder · form validation

   Design-system rules applied (ui-ux-pro-max):
     · Immersive/Interactive Experience — skip option + mobile fallback
     · Reduced Motion / Motion Sensitivity — unpin, no parallax, no scrub
     · Cursor Feedback on Hover — pointer over globe pins
     · Forms — visible labels, inline errors beside the field, focus the
       first invalid control
     · Animation — 150–300ms micro-interactions, transform/opacity only
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LOWPOWER = window.innerWidth < 768 ||
                 (navigator.hardwareConcurrency || 8) <= 4 ||
                 (navigator.deviceMemory || 8) <= 4;

  /* Enquiries route to this WhatsApp line. Alternate line is +91 99808 00931
     (shown on the studio card); swap the digits here to reroute leads. */
  var WA_NUMBER = '919060905030';

  var DEST = window.AJScene.destinations;
  var inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  var money = function (n) { return '₹' + inr.format(Math.round(n)); };

  /* ═══════════════════════════ SCENE BOOT ═══════════════════════════ */
  var scene = window.AJScene.init($('#scene'), { reduced: REDUCED, lowPower: LOWPOWER });
  scene.focus(0, true);

  /* ═══════════════════════════ LOADER ═══════════════════════════════ */
  (function loader() {
    var el = $('#loader'), fill = $('#loaderFill'), pct = $('#loaderPct');
    var v = 0, done = false;
    var timer = setInterval(function () {
      v = Math.min(96, v + 6 + Math.random() * 12);
      fill.style.width = v + '%';
      pct.textContent = String(Math.round(v)).padStart(2, '0');
    }, 110);

    function finish() {
      if (done) return; done = true;
      clearInterval(timer);
      fill.style.width = '100%'; pct.textContent = '100';
      setTimeout(function () {
        el.classList.add('is-done');
        document.body.classList.add('is-ready');
        onScroll();
      }, 260);
    }
    window.addEventListener('load', function () { setTimeout(finish, 320); });
    setTimeout(finish, 3200);                 /* hard ceiling — never trap the user */
  })();

  /* ═══════════════════════════ NAV ══════════════════════════════════ */
  var nav = $('#nav'), burger = $('#burger'), links = $('.nav__links');
  burger.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('.nav__links a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && links.classList.contains('is-open')) {
      links.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.focus();
    }
  });

  /* ═══════════════════════════ TICKER ═══════════════════════════════ */
  (function ticker() {
    var t = $('#ticker'); if (!t) return;
    var parts = DEST.map(function (d) {
      return '<span>' + d.name.toUpperCase() + ' · ' + d.nights + 'N · <b>' +
             money(d.price) + '</b> · ' + window.AJScene.fmtCoord(d.lat, d.lon) + '</span>';
    }).join('');
    t.innerHTML = parts + parts;             /* duplicated for a seamless loop */
  })();

  /* ═══════════════════════ BENTO PACKAGE GRID ═══════════════════════ */
  (function bento() {
    var host = $('#bento'); if (!host) return;
    var spans = ['card--xl', '', '', 'card--w', '', '', 'card--w', ''];

    host.innerHTML = DEST.map(function (d, i) {
      var inc = d.inc.map(function (x) { return '<li>' + x + '</li>'; }).join('');
      return '' +
      '<a class="card ' + spans[i] + '" href="#builder" data-i="' + i + '" ' +
        'aria-label="' + d.name + ', ' + d.nights + ' nights, from ' + money(d.price) + ' per person">' +
        '<div class="card__top">' +
          '<span class="mono card__id">' + d.id + '</span>' +
          '<span class="mono card__tier" data-tier="' + d.tier + '">' + d.tier + '</span>' +
        '</div>' +
        '<h3>' + d.name + '</h3>' +
        '<p class="mono card__geo">' + d.country.toUpperCase() + ' · ' +
           window.AJScene.fmtCoord(d.lat, d.lon) + ' · ' + d.nights + 'N/' + (d.nights + 1) + 'D</p>' +
        '<p class="card__blurb">' + d.blurb + '</p>' +
        '<ul class="card__inc">' + inc + '</ul>' +
        '<div class="card__foot">' +
          '<span class="card__price"><b>' + money(d.price) + '</b>' +
            '<span class="mono">PER PERSON · EX-BLR</span></span>' +
          '<span class="card__go" aria-hidden="true">' +
            '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</span>' +
        '</div>' +
      '</a>';
    }).join('');

    /* Hover/focus pulls that destination into the scene behind the grid */
    var cards = $$('.card', host);
    function activate(i, card) {
      scene.focus(i);
      cards.forEach(function (c) { c.classList.toggle('is-active', c === card); });
    }
    cards.forEach(function (c) {
      var i = +c.dataset.i;
      c.addEventListener('mouseenter', function () { activate(i, c); });
      c.addEventListener('focus', function () { activate(i, c); });
      c.addEventListener('click', function () { presetFromDest(i); });
    });
  })();

  /* ═════════════════════ SCROLL ORCHESTRATION ═══════════════════════ */
  var journey = $('#journey');
  var caps = $$('.journey__caption');
  var hudAlt = $('#hudAlt'), hudHdg = $('#hudHdg'), hudDst = $('#hudDst'), hudFill = $('#hudFill');
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var vh = window.innerHeight;

    nav.classList.toggle('is-stuck', y > 40);

    if (REDUCED) {
      /* Motion Sensitivity: no scrub, no pinning — just settle on the
         landscape once the hero is behind us. */
      scene.camera({ zoom: 1, blend: y > vh * 0.6 ? 1 : 0, drift: 0 });
      ticking = false;
      return;
    }

    var jTop = journey.offsetTop;
    var jRange = Math.max(1, journey.offsetHeight - vh);
    var j = clamp((y - jTop) / jRange, 0, 1);

    var zoom, blend;
    if (y < jTop) {
      var h = clamp(y / Math.max(1, vh), 0, 1);
      zoom = 1 + h * 0.14;
      blend = 0;
    } else {
      /* ease-in camera descent, then cross-fade into the landscape */
      var d = Math.pow(clamp(j / 0.62, 0, 1), 2.1);
      zoom = 1.14 + d * 4.6;
      blend = smooth((j - 0.46) / 0.36);
    }

    var past = Math.max(0, y - (jTop + jRange));
    scene.camera({ zoom: zoom, blend: blend, drift: clamp(past / (vh * 6), 0, 1) });

    /* captions */
    var active = j < 0.30 ? 0 : (j < 0.62 ? 1 : 2);
    for (var i = 0; i < caps.length; i++) {
      var on = (i === active) && j > 0.02 && j < 0.99;
      caps[i].style.opacity = on ? '1' : '0';
    }

    /* HUD telemetry */
    if (hudFill) {
      hudFill.style.width = (j * 100).toFixed(1) + '%';
      hudAlt.textContent = inr.format(Math.round(36000 * (1 - j))) + ' ft';
      hudHdg.textContent = Math.round(118 + j * 26) + '°';
      hudDst.textContent = inr.format(Math.round(5812 * (1 - j))) + ' km';
    }

    ticking = false;
  }

  function requestScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll);
  onScroll();

  /* ═══════════ POINTER PARALLAX + PIN CURSOR FEEDBACK ═══════════════ */
  if (!REDUCED) {
    var overPin = false;
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      scene.pointer((e.clientX / window.innerWidth) * 2 - 1,
                    (e.clientY / window.innerHeight) * 2 - 1);

      /* Only meaningful while the globe is the thing on screen */
      var hit = (window.pageYOffset < journey.offsetTop + window.innerHeight * 0.8)
                ? scene.hit(e.clientX, e.clientY) : -1;
      scene.setHover(hit);
      var want = hit >= 0;
      if (want !== overPin) {
        overPin = want;
        document.body.style.cursor = want ? 'pointer' : 'auto';
      }
    }, { passive: true });

    /* Pins are clickable, so make that real */
    window.addEventListener('click', function (e) {
      if (window.pageYOffset > journey.offsetTop + window.innerHeight * 0.8) return;
      var hit = scene.hit(e.clientX, e.clientY);
      if (hit >= 0) {
        presetFromDest(hit);
        $('#builder').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* ═══════════════════════ REVEAL + COUNTERS ════════════════════════ */
  (function reveals() {
    var els = $$('.reveal');
    if (REDUCED || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('is-in'); });
      $$('[data-count]').forEach(function (n) { n.textContent = n.dataset.count + (n.dataset.suffix || ''); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        $$('[data-count]', en.target).forEach(count);
        io.unobserve(en.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });

    function count(node) {
      var to = +node.dataset.count, sfx = node.dataset.suffix || '', t0 = 0;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = clamp((ts - t0) / 1400, 0, 1);
        var e = 1 - Math.pow(1 - p, 3);
        node.textContent = inr.format(Math.round(to * e)) + sfx;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  })();

  /* ═══════════════════ PARAMETRIC ITINERARY BUILDER ═════════════════ */
  var dur = $('#dur'), bud = $('#bud'), pax = $('#pax');
  var durOut = $('#durOut'), budOut = $('#budOut'), paxOut = $('#paxOut');
  var state = { nights: 6, budget: 75000, pax: 2, style: 'beach', pace: 'balanced' };

  var ACTS = {
    beach: ['Reef snorkel and sandbank picnic', 'Sunset catamaran with canapés',
            'Free morning, spa slot at 4pm', 'Island-hop by speedboat',
            'Beach club day pass', 'Local market and seafood grill'],
    alpine:['Cogwheel railway to the summit', 'Cable car and glacier walk',
            'Lakeside old-town wander', 'Panoramic rail leg to the next valley',
            'Free day — ski pass or spa', 'Gorge walk and cheese cellar'],
    city:  ['Observation deck, timed entry', 'Old quarter walking tour',
            'Desert or coastal half-day', 'Museum district, skip-the-line',
            'Rooftop dinner reservation', 'Shopping day, driver on call'],
    wild:  ['Guided valley trek with packed lunch', 'Sunrise viewpoint drive',
            'Gondola to the upper station', 'Scuba or kayak session',
            'Village walk and local lunch', 'Free day — nothing scheduled'],
    heritage:['Heritage cruise with overnight cabin', 'Temple complex at first light',
            'Sampan through the karst caves', 'Craft village and lacquer workshop',
            'Street-food trail after dark', 'Colonial quarter and coffee houses']
  };
  var PACE = { slow: 0.94, balanced: 1, packed: 1.09 };

  function score(d) {
    var s = 0;
    s += d.style === state.style ? 46 : 0;
    s += 30 * (1 - clamp(Math.abs(d.nights - state.nights) / 9, 0, 1));
    var est = estimate(d);
    s += 24 * (1 - clamp(Math.abs(est - state.budget) / Math.max(state.budget, 1), 0, 1));
    return s;
  }

  function estimate(d) {
    var ratio = 0.52 + 0.48 * (state.nights / d.nights);
    var v = d.price * ratio * PACE[state.pace];
    if (state.pax >= 6) v *= 0.94;            /* group rate */
    else if (state.pax === 1) v *= 1.18;      /* single supplement */
    return Math.round(v / 500) * 500;
  }

  function itinerary(d) {
    var pool = ACTS[d.style] || ACTS.beach;
    var out = ['Land at ' + d.name + ', private transfer, evening at leisure'];
    for (var i = 1; i < state.nights; i++) out.push(pool[(i - 1) % pool.length]);
    out.push('Checkout, transfer to airport, fly home to BLR');
    return out;
  }

  function render() {
    durOut.textContent = state.nights + ' night' + (state.nights > 1 ? 's' : '');
    budOut.textContent = money(state.budget);
    paxOut.textContent = state.pax + (state.pax > 1 ? ' travellers' : ' traveller');

    [dur, bud, pax].forEach(function (r) {
      var p = (r.value - r.min) / (r.max - r.min) * 100;
      r.style.setProperty('--fill', p + '%');
    });

    var ranked = DEST.map(function (d, i) { return { d: d, i: i, s: score(d) }; })
                     .sort(function (a, b) { return b.s - a.s; });
    var best = ranked[0], d = best.d;
    var fit = Math.round(clamp(best.s, 0, 100));
    var est = estimate(d);

    $('#boId').textContent = d.id.replace(/-\d+$/, '') + '-' +
                             String(state.nights).padStart(2, '0') + 'N-' +
                             String(state.pax).padStart(2, '0') + 'P';
    $('#boName').textContent = d.name + ' · ' + d.country;
    $('#boTag').textContent = 'BEST MATCH · ' + fit + '% FIT · ' + state.pace.toUpperCase() + ' PACE';
    $('#boPrice').textContent = money(est);
    $('#boMeter').style.width = fit + '%';
    $('#boTotal').textContent = money(est * state.pax);

    $('#boDays').innerHTML = itinerary(d).map(function (t, i) {
      return '<li><span class="d">DAY ' + String(i + 1).padStart(2, '0') +
             '</span><span class="t">' + t + '</span></li>';
    }).join('');

    $('#boAlts').innerHTML = '◦ ALSO CONSIDER: ' + ranked.slice(1, 4).map(function (r) {
      return '<b>' + r.d.name.toUpperCase() + '</b> ' + money(estimate(r.d));
    }).join(' &nbsp;·&nbsp; ');

    if (est > state.budget * 1.12) {
      $('#boAlts').innerHTML += '<br>◦ HEADS UP: BEST MATCH SITS ' +
        Math.round((est / state.budget - 1) * 100) + '% OVER YOUR BUDGET LINE';
    }

    scene.focus(best.i);
    return { d: d, est: est, fit: fit };
  }

  [['#dur', 'nights'], ['#bud', 'budget'], ['#pax', 'pax']].forEach(function (p) {
    $(p[0]).addEventListener('input', function () { state[p[1]] = +this.value; render(); });
  });

  function segWire(sel, key) {
    $$(sel + ' button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$(sel + ' button').forEach(function (x) {
          x.classList.remove('is-on'); x.setAttribute('aria-selected', 'false');
        });
        b.classList.add('is-on'); b.setAttribute('aria-selected', 'true');
        state[key] = b.dataset[key];
        render();
      });
      b.setAttribute('aria-selected', String(b.classList.contains('is-on')));
    });
  }
  segWire('#styleSeg', 'style');
  segWire('#paceSeg', 'pace');

  /* Clicking a package card or a globe pin seeds the builder with it */
  function presetFromDest(i) {
    var d = DEST[i];
    state.nights = d.nights; state.style = d.style;
    state.budget = Math.round(d.price / 5000) * 5000;
    dur.value = d.nights; bud.value = state.budget;
    $$('#styleSeg button').forEach(function (b) {
      var on = b.dataset.style === d.style;
      b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on));
    });
    render();
  }

  render();

  /* ═════════════════════════ FORM + VALIDATION ══════════════════════ */
  var form = $('#leadForm'), note = $('#formNote');

  function fieldOf(input) { return input.closest('[data-field]'); }
  function setBad(input, bad) {
    var f = fieldOf(input); if (!f) return;
    f.classList.toggle('is-bad', bad);
    input.setAttribute('aria-invalid', String(bad));
  }
  function validate(input) {
    var v = input.value.trim();
    if (input.id === 'fName')  return v.length >= 2;
    if (input.id === 'fPhone') return (v.replace(/\D/g, '').length >= 10);
    if (input.id === 'fMail')  return v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    return true;
  }

  $$('#leadForm input').forEach(function (i) {
    i.addEventListener('blur', function () { setBad(i, !validate(i)); });
    i.addEventListener('input', function () { if (validate(i)) setBad(i, false); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var inputs = $$('#leadForm input'), firstBad = null;
    inputs.forEach(function (i) {
      var ok = validate(i);
      setBad(i, !ok);
      if (!ok && !firstBad) firstBad = i;
    });

    if (firstBad) {                      /* ux: focus-management */
      firstBad.focus();
      note.classList.remove('is-ok');
      note.textContent = '◦ FIX THE HIGHLIGHTED FIELDS AND SEND AGAIN';
      return;
    }

    var pick = render();
    var msg =
      'New enquiry via ajholidays.in\n' +
      '—\n' +
      'Name: ' + $('#fName').value.trim() + '\n' +
      'Phone: ' + $('#fPhone').value.trim() + '\n' +
      'Email: ' + ($('#fMail').value.trim() || '—') + '\n' +
      'Interest: ' + ($('#fDest').value.trim() || pick.d.name) + '\n' +
      '—\n' +
      'Builder: ' + state.nights + 'N · ' + state.pax + ' pax · ' +
        state.style + ' · ' + state.pace + ' pace\n' +
      'Budget line: ' + money(state.budget) + ' pp\n' +
      'Suggested: ' + pick.d.name + ' — ' + money(pick.est) + ' pp (' + pick.fit + '% fit)\n' +
      '—\n' +
      'Brief: ' + ($('#fMsg').value.trim() || '—');

    note.classList.add('is-ok');
    note.textContent = '◦ OPENING WHATSAPP WITH YOUR BRIEF — SEND IT TO REACH THE DESK';
    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });

  $('#boSend').addEventListener('click', function () {
    $('#contact').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    var pick = render();
    $('#fDest').value = pick.d.name + ' — ' + state.nights + 'N, ' + state.pax + ' pax';
    setTimeout(function () { $('#fName').focus({ preventScroll: true }); }, REDUCED ? 0 : 700);
  });

  $('#yr').textContent = new Date().getFullYear();
})();
