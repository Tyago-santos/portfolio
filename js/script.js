/* ============================================================================
   TIAGO SANTOS — interações
   Vanilla JS, IIFE, sem dependências. Todo efeito é progressivo: o conteúdo
   permanece legível e navegável se este arquivo falhar ou for desativado.
   ========================================================================== */
(function () {
  "use strict";

  var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var coarseQuery = window.matchMedia("(pointer: coarse)");

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function prefersReducedMotion() {
    return reduceQuery.matches;
  }

  /* ── relógio de Vitória da Conquista (UTC-3) ───────────────────────────── */
  function initClock() {
    var targets = qsa("[data-clock]");
    if (!targets.length) return;

    var formatter;
    try {
      formatter = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Bahia",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch (error) {
      formatter = null;
    }

    function paint() {
      var now = new Date();
      var label = formatter
        ? formatter.format(now)
        : String(now.getHours()).padStart(2, "0") +
          ":" +
          String(now.getMinutes()).padStart(2, "0") +
          ":" +
          String(now.getSeconds()).padStart(2, "0");

      targets.forEach(function (node) {
        node.textContent = label;
        node.setAttribute("datetime", now.toISOString());
      });
    }

    paint();
    window.setInterval(paint, 1000);
  }

  /* ── menu mobile ───────────────────────────────────────────────────────── */
  function initMenu() {
    var toggle = qs("[data-menu-toggle]");
    var menu = qs("[data-menu]");
    if (!toggle || !menu) return;

    var lastFocused = null;

    function open() {
      lastFocused = document.activeElement;
      menu.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      toggle.textContent = "Fechar";
      document.body.style.overflow = "hidden";
      var firstLink = qs("a", menu);
      if (firstLink) firstLink.focus();
    }

    function close() {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "Menu";
      document.body.style.overflow = "";
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    toggle.addEventListener("click", function () {
      if (toggle.getAttribute("aria-expanded") === "true") close();
      else open();
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) close();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") close();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1100 && toggle.getAttribute("aria-expanded") === "true") close();
    });
  }

  /* ── hero: parallax de ponteiro e holofote ─────────────────────────────── */
  function initHero() {
    var hero = qs(".hero");
    var photo = qs(".hero__photo");
    if (!hero || !photo) return;

    var frame = null;
    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;

    function render() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      photo.style.transform =
        "translate(-50%, -50%) translate3d(" +
        (currentX * 18).toFixed(2) +
        "px, " +
        (currentY * 14).toFixed(2) +
        "px, 0)";

      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        frame = window.requestAnimationFrame(render);
      } else {
        frame = null;
      }
    }

    hero.addEventListener(
      "pointermove",
      function (event) {
        var spot = qs(".hero__spot");
        if (spot) {
          spot.style.setProperty("--mx", event.clientX + "px");
          spot.style.setProperty("--my", event.clientY + "px");
        }

        if (prefersReducedMotion() || coarseQuery.matches) return;

        targetX = event.clientX / window.innerWidth - 0.5;
        targetY = event.clientY / window.innerHeight - 0.5;
        if (!frame) frame = window.requestAnimationFrame(render);
      },
      { passive: true }
    );

    reduceQuery.addEventListener("change", function () {
      if (prefersReducedMotion()) {
        if (frame) window.cancelAnimationFrame(frame);
        frame = null;
        photo.style.transform = "";
      }
    });
  }

  /* ── reveal por IntersectionObserver ───────────────────────────────────── */
  function initReveal() {
    var items = qsa("[data-reveal]");
    if (!items.length) return;

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      items.forEach(function (node) {
        node.classList.add("is-in");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    items.forEach(function (node) {
      observer.observe(node);
    });
  }

  /* ── manifesto: palavras acendem conforme o scroll ─────────────────────── */
  function initManifesto() {
    var section = qs(".about");
    var words = qsa("[data-manifesto] .w");
    if (!section || !words.length) return;

    var lastCount = -1;
    var ticking = false;

    function paint() {
      ticking = false;
      var rect = section.getBoundingClientRect();
      var progress = clamp((window.innerHeight * 0.82 - rect.top) / (rect.height * 0.85), 0, 1);
      var count = Math.round(progress * words.length);

      if (count === lastCount) return;
      lastCount = count;

      words.forEach(function (word, index) {
        word.classList.toggle("is-on", index < count);
      });
    }

    function request() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(paint);
    }

    if (prefersReducedMotion()) {
      words.forEach(function (word) {
        word.classList.add("is-on");
      });
      return;
    }

    paint();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
  }

  /* ── stack: travessia horizontal guiada pelo scroll vertical ───────────── */
  function initStack() {
    var section = qs("[data-stack]");
    var track = qs("[data-stack-track]");
    var viewport = qs(".st__viewport");
    var progress = qs("[data-stack-progress]");
    if (!section || !track || !viewport) return;

    var maxShift = 0;
    var enabled = false;
    var ticking = false;

    function update() {
      ticking = false;
      if (!enabled) return;

      var rect = section.getBoundingClientRect();
      var scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      var progressValue = clamp(-rect.top / scrollable, 0, 1);
      track.style.transform = "translate3d(" + (-progressValue * maxShift).toFixed(2) + "px, 0, 0)";

      if (progress) progress.style.width = (progressValue * 100).toFixed(1) + "%";
    }

    function request() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    function measure() {
      var isStacked = window.matchMedia("(max-width: 900px)").matches;
      enabled = !isStacked && !prefersReducedMotion();

      if (!enabled) {
        section.style.height = "";
        track.style.transform = "";
        if (progress) progress.style.width = "0%";
        return;
      }

      maxShift = Math.max(0, track.scrollWidth - viewport.clientWidth);
      section.style.height = window.innerHeight + maxShift + "px";
      update();
    }

    measure();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", measure);
    reduceQuery.addEventListener("change", measure);
  }

  /* ── revela a cor original das imagens somente sob o ponteiro ──────────── */
  function initCursorImageReveal() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var reveal = document.createElement("img");
    reveal.className = "cursor-image-reveal";
    reveal.alt = "";
    reveal.setAttribute("aria-hidden", "true");
    reveal.draggable = false;
    document.body.appendChild(reveal);

    var frame = null;
    var activeImage = null;
    var pointerX = 0;
    var pointerY = 0;

    function paint() {
      frame = null;
      if (activeImage) {
        var rect = activeImage.getBoundingClientRect();
        var imageStyle = window.getComputedStyle(activeImage);
        var x = pointerX - rect.left;
        var y = pointerY - rect.top;
        var radius = 96;
        var mask =
          "radial-gradient(circle " +
          radius +
          "px at " +
          x +
          "px " +
          y +
          "px, #000 0, #000 58%, transparent 100%)";

        reveal.style.left = rect.left + "px";
        reveal.style.top = rect.top + "px";
        reveal.style.width = rect.width + "px";
        reveal.style.height = rect.height + "px";
        reveal.style.objectFit = imageStyle.objectFit;
        reveal.style.objectPosition = imageStyle.objectPosition;
        reveal.style.borderRadius = imageStyle.borderRadius;
        reveal.style.opacity = imageStyle.opacity;
        reveal.style.maskImage = mask;
        reveal.style.webkitMaskImage = mask;
        reveal.classList.add("is-visible");
      } else {
        reveal.classList.remove("is-visible");
      }
    }

    document.addEventListener(
      "pointermove",
      function (event) {
        if (event.pointerType === "touch") return;

        var image = event.target && event.target.closest
          ? event.target.closest("img")
          : null;
        var images = document.elementsFromPoint(event.clientX, event.clientY);
        var imageUnderPointer = images.find(function (node) {
          return node.tagName === "IMG";
        });
        image = image || imageUnderPointer || null;
        activeImage = image;
        if (activeImage && reveal.src !== (activeImage.currentSrc || activeImage.src)) {
          reveal.src = activeImage.currentSrc || activeImage.src;
        }

        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!frame) frame = window.requestAnimationFrame(paint);
      },
      { passive: true }
    );

    document.addEventListener("pointerout", function (event) {
      if (event.relatedTarget) return;
      activeImage = null;
      reveal.classList.remove("is-visible");
    });

    window.addEventListener("blur", function () {
      activeImage = null;
      reveal.classList.remove("is-visible");
    });
  }

  /* ── barra de progresso + deriva do texto gigante ──────────────────────── */
  function initScrollFx() {
    var bar = qs("[data-scroll-progress]");
    var giant = qs(".xp__giant");
    var xp = qs(".xp");
    if (!bar && !giant) return;

    var ticking = false;

    function paint() {
      ticking = false;

      if (bar) {
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        var ratio = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
        bar.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
      }

      if (!giant) return;

      if (prefersReducedMotion() || !xp) {
        giant.style.setProperty("--gx", "0px");
        return;
      }

      var rect = xp.getBoundingClientRect();
      var span = window.innerHeight + rect.height;
      var progress = clamp((window.innerHeight - rect.top) / span, 0, 1);
      giant.style.setProperty("--gx", ((progress - 0.5) * 110).toFixed(1) + "px");
    }

    function request() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(paint);
    }

    paint();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    reduceQuery.addEventListener("change", request);
  }

  /* ── destaque de texto preso ao cursor ─────────────────────────────────── */
  function textNodeAt(x, y) {
    var node = document.elementFromPoint(x, y);
    if (!node) return null;

    var parent = node.parentElement;
    if (parent && parent.closest("button, .btn")) return null;
    if (node.closest("button, .btn")) return null;

    while (node && node !== document.body) {
      if (node.nodeType === 1 && node.classList && node.classList.contains("cursor-text-color")) {
        return node;
      }

      if (node.parentElement && node.parentElement.closest("button, .btn")) {
        return null;
      }
      node = node.parentElement;
    }

    return null;
  }

  function initCursorTextColor() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var activeText = null;
    var frame = null;

    function paint() {
      frame = null;
      if (!activeText) return;

      var rect = activeText.getBoundingClientRect();
      var x = rect.left + rect.width / 2;
      var y = rect.top + rect.height / 2;
      activeText.style.setProperty("--cursor-text-x", x + "px");
      activeText.style.setProperty("--cursor-text-y", y + "px");
      activeText.classList.add("cursor-text-color");
    }

    document.addEventListener(
      "pointermove",
      function (event) {
        if (event.pointerType === "touch") return;

        if (event.target && event.target.closest && event.target.closest("button, .btn")) {
          if (activeText) {
            activeText.classList.remove("cursor-text-color");
            activeText.style.removeProperty("--cursor-text-x");
            activeText.style.removeProperty("--cursor-text-y");
            activeText = null;
          }
          return;
        }

        var next = textNodeAt(event.clientX, event.clientY);
        if (next === activeText) return;

        if (activeText) {
          activeText.classList.remove("cursor-text-color");
          activeText.style.removeProperty("--cursor-text-x");
          activeText.style.removeProperty("--cursor-text-y");
        }

        activeText = next;
        if (activeText && !frame) {
          frame = window.requestAnimationFrame(paint);
        }
      },
      { passive: true }
    );

    document.addEventListener("pointerleave", function () {
      if (activeText) {
        activeText.classList.remove("cursor-text-color");
        activeText.style.removeProperty("--cursor-text-x");
        activeText.style.removeProperty("--cursor-text-y");
        activeText = null;
      }
    });
  }

  function initProjectMarquees() {
    var marquees = qsa(".case__tags .marquee");
    if (!marquees.length || prefersReducedMotion()) return;

    var tracks = marquees.map(function (marquee) {
      var track = qs(".marquee__track", marquee);
      var first = track && track.children[0];
      var second = track && track.children[1];
      if (!first || !second) return null;

      return {
        marquee: marquee,
        first: first,
        second: second,
        content: Array.prototype.map.call(first.childNodes, function (node) {
          return node.cloneNode(true);
        }),
      };
    }).filter(Boolean);

    function fillTracks() {
      tracks.forEach(function (item) {
        item.first.replaceChildren.apply(item.first, item.content.map(function (node) {
          return node.cloneNode(true);
        }));
        item.second.replaceChildren.apply(item.second, item.content.map(function (node) {
          return node.cloneNode(true);
        }));

        var baseWidth = item.first.getBoundingClientRect().width;
        if (!baseWidth) return;

        var repeats = Math.max(1, Math.ceil(item.marquee.clientWidth / baseWidth));
        for (var index = 1; index < repeats; index += 1) {
          item.content.forEach(function (node) {
            item.first.appendChild(node.cloneNode(true));
            item.second.appendChild(node.cloneNode(true));
          });
        }
      });
    }

    fillTracks();
    var resizeTimer = null;
    window.addEventListener(
      "resize",
      function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(fillTracks, 120);
      },
      { passive: true }
    );
  }

  /* ── entrada das seções ao entrar na viewport ─────────────────────────── */
  function initSectionReveal() {
    var sections = qsa("[data-section]");
    if (!sections.length) return;

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;

    var targets = [];
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    sections.forEach(function (section) {
      qsa(
        ".about__inner, .xp__inner, .case__inner, .st__viewport, .cr__sheet, .ct__inner",
        section
      ).forEach(function (target) {
        target.setAttribute("data-scroll-reveal", "");
        targets.push(target);
      });
    });

    targets.forEach(function (target) {
      observer.observe(target);
    });
  }

  /* ── inicialização ─────────────────────────────────────────────────────── */
  function boot() {
    initClock();
    initMenu();
    initHero();
    initReveal();
    initManifesto();
    initStack();
    initScrollFx();
    initCursorImageReveal();
    initCursorTextColor();
    initProjectMarquees();
    initSectionReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
