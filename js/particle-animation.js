/**
 * Hero Scroll State Machine — Terbium Recovery Narrative
 * ------------------------------------------------------
 * A 4-phase, scroll-driven HTML5 Canvas animation:
 *   Phase 1 (0.00–0.25)  The Terbium Spark   — pulsing neon-green ion
 *   Phase 2 (0.25–0.50)  The Expansion       — glow floods the screen
 *   Phase 3 (0.50–0.75)  The Impurity Flood  — e-waste swarm buries it
 *   Phase 4 (0.75–1.00)  Interactive Dispersal — mouse pushes junk, Tb stays trapped
 *
 * scrollRatio (0..1) is derived from the pinned hero wrapper's scroll
 * position. All visual drivers are lerped toward their per-phase targets
 * so fast/slow scrubbing stays fluid and phases cross-fade.
 */
(function () {
  'use strict';

  // ─── Feature detection / graceful fallback ────────────────────────
  var canvas = document.getElementById('heroCanvas');
  var hero = document.getElementById('heroSection');
  var pinWrap = document.getElementById('heroPinWrap');

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ctx = null;
  if (canvas && canvas.getContext) {
    try { ctx = canvas.getContext('2d'); } catch (e) { ctx = null; }
  }

  // No canvas support or user opts out of motion → CSS gradient fallback.
  if (!canvas || !ctx || !hero || !pinWrap || prefersReduced) {
    if (hero) hero.classList.add('hero-fallback');
    if (canvas) canvas.style.display = 'none';
    return;
  }

  // ─── Config (all tunables in one place) ───────────────────────────
  var CONFIG = {
    PHASE:          { spark: 0.25, expand: 0.50, flood: 0.75 },
    IMPURITY_COUNT: 260,
    TB_SHARD_COUNT: 140,
    LERP:           0.09,   // state easing (higher = snappier)
    MOUSE_RADIUS:   150,
    MOUSE_FORCE:    1.7,
    SLATE:          [15, 23, 42]  // #0f172a
  };

  // ─── Cached measurements (recomputed only on debounced resize) ────
  var W = 0, H = 0, cx = 0, cy = 0, dpr = 1;

  // ─── State machine: raw input + eased visual drivers ──────────────
  var state = {
    scrollRatio: 0,   // raw 0..1 from scroll
    sparkGlow:   0,   // Phase 1 spark intensity
    expansion:   0,   // Phase 2 green radius growth (0..1)
    bgGreen:     0,   // background slate → misty green blend (0..1)
    flood:       0,   // Phase 3 impurity presence (0..1)
    scatter:     0    // how shattered the glow is (0..1)
  };

  var mouse = { x: -9999, y: -9999, active: false };
  var impurities = [];
  var tbShards = [];
  var time = 0;
  var rafId = null;

  // ─── Helpers ──────────────────────────────────────────────────────
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function rand(min, max) { return Math.random() * (max - min) + min; }
  // Normalized 0..1 progress of scrollRatio within a [lo, hi] window.
  function phaseProgress(r, lo, hi) { return clamp01((r - lo) / (hi - lo)); }

  // ─── Scene construction (load + on resize) ────────────────────────
  function initScene() {
    impurities = [];
    tbShards = [];

    // Impurities begin off-screen on all four sides; they rush inward
    // during Phase 3. Mix of dull gray metals + jagged orange shards.
    for (var i = 0; i < CONFIG.IMPURITY_COUNT; i++) {
      var side = Math.floor(rand(0, 4));
      var sx, sy;
      if (side === 0) { sx = rand(-0.2 * W, 0);          sy = rand(0, H); }
      else if (side === 1) { sx = rand(W, 1.2 * W);      sy = rand(0, H); }
      else if (side === 2) { sx = rand(0, W);            sy = rand(-0.2 * H, 0); }
      else { sx = rand(0, W);                            sy = rand(H, 1.2 * H); }

      var isOrange = Math.random() < 0.28;
      impurities.push({
        sx: sx, sy: sy,                 // off-screen spawn (home when flood=0)
        tx: rand(0, W), ty: rand(0, H), // in-screen target (flood=1)
        x: sx, y: sy,
        vx: 0, vy: 0,
        size: isOrange ? rand(6, 13) : rand(5, 16),
        rot: rand(0, Math.PI * 2),
        rotSpeed: rand(-0.05, 0.05),
        sides: isOrange ? 3 : Math.floor(rand(4, 7)),
        color: isOrange
          ? 'rgba(' + Math.floor(rand(180, 220)) + ',' + Math.floor(rand(90, 130)) + ',30,'
          : 'rgba(' + Math.floor(rand(70, 110)) + ',' + Math.floor(rand(80, 120)) + ',' + Math.floor(rand(95, 135)) + ',',
        alpha: rand(0.55, 0.9),
        drift: rand(0.2, 0.8)
      });
    }

    // Terbium shards: the shattered remains of the big glow. They cluster
    // near center and stay trapped — they never escape the impurity sea.
    for (var j = 0; j < CONFIG.TB_SHARD_COUNT; j++) {
      var ang = rand(0, Math.PI * 2);
      var radius = rand(0, Math.min(W, H) * 0.32);
      var hx = cx + Math.cos(ang) * radius;
      var hy = cy + Math.sin(ang) * radius;
      tbShards.push({
        homeX: hx, homeY: hy,
        x: hx, y: hy,
        vx: 0, vy: 0,
        size: rand(1.5, 3.5),
        glowPhase: rand(0, Math.PI * 2)
      });
    }
  }

  // ─── Measurement caching (retina-aware) ───────────────────────────
  function measure() {
    dpr = window.devicePixelRatio || 1;
    W = hero.offsetWidth;
    H = hero.offsetHeight;
    cx = W / 2;
    cy = H / 2;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      measure();
      initScene();
    }, 150);
  }

  // ─── Scroll → scrollRatio (raw; easing happens in update) ─────────
  function readScroll() {
    var rect = pinWrap.getBoundingClientRect();
    var scrollable = pinWrap.offsetHeight - window.innerHeight;
    state.scrollRatio = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0;
  }

  // ─── Per-frame update: derive targets, lerp, run physics ──────────
  function update() {
    time++;
    var r = state.scrollRatio;
    var P = CONFIG.PHASE;

    // Phase targets from raw scrollRatio.
    var tSpark  = 1 - phaseProgress(r, P.expand, P.flood) * 0.85; // fades as flood nears
    var tExpandRaw = phaseProgress(r, P.spark, P.expand);
    var tExpand = tExpandRaw * tExpandRaw;   // exponential "explode" feel
    var tBgGreen = phaseProgress(r, P.spark, P.expand);
    var tFlood  = phaseProgress(r, P.expand, P.flood);
    var tScatter = phaseProgress(r, P.expand, P.flood);

    // Smooth toward targets — fluid for fast AND slow scrolling.
    var L = CONFIG.LERP;
    state.sparkGlow = lerp(state.sparkGlow, tSpark, L);
    state.expansion = lerp(state.expansion, tExpand, L);
    state.bgGreen   = lerp(state.bgGreen, tBgGreen, L);
    state.flood     = lerp(state.flood, tFlood, L);
    state.scatter   = lerp(state.scatter, tScatter, L);

    var inFlood = state.flood > 0.01;
    var mouseLive = r >= P.flood && mouse.active;

    // Impurity physics.
    for (var i = 0; i < impurities.length; i++) {
      var p = impurities[i];
      // Home position interpolates off-screen → in-screen with flood.
      var baseX = lerp(p.sx, p.tx, state.flood);
      var baseY = lerp(p.sy, p.ty, state.flood);

      if (inFlood) {
        // Gentle chaotic drift.
        baseX += Math.sin(time * 0.01 + i) * p.drift * 6;
        baseY += Math.cos(time * 0.013 + i) * p.drift * 6;
      }

      // Phase 4: mouse repels impurities.
      if (mouseLive) {
        var dx = p.x - mouse.x;
        var dy = p.y - mouse.y;
        var d2 = dx * dx + dy * dy;
        var rr = CONFIG.MOUSE_RADIUS;
        if (d2 < rr * rr && d2 > 0.01) {
          var d = Math.sqrt(d2);
          var force = (1 - d / rr) * CONFIG.MOUSE_FORCE;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }
      }

      // Spring back toward home + damping.
      p.vx += (baseX - p.x) * 0.02;
      p.vy += (baseY - p.y) * 0.02;
      p.vx *= 0.90;
      p.vy *= 0.90;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;
    }

    // Terbium shards: tiny jitter, stay trapped near home (can't be sorted).
    for (var j = 0; j < tbShards.length; j++) {
      var s = tbShards[j];
      s.x = lerp(s.x, s.homeX + Math.sin(time * 0.02 + j) * 4, 0.08);
      s.y = lerp(s.y, s.homeY + Math.cos(time * 0.025 + j) * 4, 0.08);
    }
  }

  // ─── Drawing ──────────────────────────────────────────────────────
  function drawBackground() {
    // Base slate fill.
    var s = CONFIG.SLATE;
    ctx.fillStyle = 'rgb(' + s[0] + ',' + s[1] + ',' + s[2] + ')';
    ctx.fillRect(0, 0, W, H);
    // Misty green wash blended in during Phase 2.
    if (state.bgGreen > 0.001) {
      ctx.fillStyle = 'rgba(16, 185, 129, ' + (0.15 * state.bgGreen) + ')';
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawSpark() {
    var pulse = 0.75 + 0.25 * Math.sin(time * 0.06);
    var core = (10 + 6 * pulse) * (0.6 + 0.4 * state.sparkGlow);
    var glow = core * 9;
    var a = state.sparkGlow;

    var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glow);
    grad.addColorStop(0.0, 'rgba(190, 255, 210, ' + (0.95 * a) + ')');
    grad.addColorStop(0.12, 'rgba(74, 222, 128, ' + (0.85 * a) + ')');
    grad.addColorStop(0.4, 'rgba(16, 185, 129, ' + (0.35 * a) + ')');
    grad.addColorStop(1.0, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Bright bioluminescent core.
    var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, core);
    cg.addColorStop(0, 'rgba(255, 255, 255, ' + (0.9 * a) + ')');
    cg.addColorStop(1, 'rgba(190, 255, 210, 0)');
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);
  }

  function drawExpansion() {
    var e = state.expansion;
    if (e < 0.001) return;
    var maxR = Math.sqrt(W * W + H * H) * 0.62;
    var baseR = maxR * e;
    // Undulating organic edge via sin-perturbed alpha ring.
    var edge = 1 + 0.04 * Math.sin(time * 0.05);
    var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * edge);
    grad.addColorStop(0.0, 'rgba(134, 239, 172, ' + (0.55 * e) + ')');
    grad.addColorStop(0.45, 'rgba(52, 211, 153, ' + (0.35 * e) + ')');
    grad.addColorStop(0.85, 'rgba(16, 185, 129, ' + (0.15 * e) + ')');
    grad.addColorStop(1.0, 'rgba(16, 185, 129, 0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function drawPolygon(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.beginPath();
    var step = (Math.PI * 2) / p.sides;
    for (var k = 0; k < p.sides; k++) {
      var ang = k * step;
      var px = Math.cos(ang) * p.size;
      var py = Math.sin(ang) * p.size;
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = p.color + (p.alpha * state.flood) + ')';
    ctx.fill();
    ctx.restore();
  }

  function drawImpurities() {
    for (var i = 0; i < impurities.length; i++) {
      drawPolygon(impurities[i]);
    }
  }

  function drawTbShards() {
    // As scatter rises, the once-huge glow is now weak scattered dots,
    // dimmed further as impurities crowd them out.
    var a = state.scatter * (1 - 0.35 * state.flood);
    if (a < 0.01) return;
    for (var i = 0; i < tbShards.length; i++) {
      var s = tbShards[i];
      var pulse = 0.6 + 0.4 * Math.sin(time * 0.05 + s.glowPhase);
      var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 4);
      g.addColorStop(0, 'rgba(134, 239, 172, ' + (0.9 * a * pulse) + ')');
      g.addColorStop(1, 'rgba(74, 222, 128, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ─── Single rAF loop ──────────────────────────────────────────────
  function tick() {
    update();
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    if (state.expansion > 0.001) drawExpansion();
    if (state.sparkGlow > 0.01) drawSpark();
    if (state.flood > 0.01) {
      drawTbShards();     // green dots first…
      drawImpurities();   // …then junk on top, burying them
    }
    rafId = requestAnimationFrame(tick);
  }

  // ─── Bootstrap ────────────────────────────────────────────────────
  measure();
  initScene();

  // Scroll: passive + rAF-throttled read (no layout work in handler body).
  var scrollTicking = false;
  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      requestAnimationFrame(function () { readScroll(); scrollTicking = false; });
      scrollTicking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', onResize);

  // Mouse tracked on window so hero buttons stay clickable (canvas is
  // pointer-events:none). Coordinates are relative to the hero box.
  window.addEventListener('mousemove', function (e) {
    var rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  }, { passive: true });
  window.addEventListener('mouseout', function () { mouse.active = false; });

  readScroll();
  tick();
})();

