/* ============================================================
   Portfólio Tiago Santos — interações
   HTML + JS puro · sem dependências
   ============================================================ */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------------------------------------------------
     1. Header: estado "scrolled"
     --------------------------------------------------------- */
  var header = document.querySelector(".site-header");

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is_scrolled", window.scrollY > 24);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------------------------------------------------------
     2. Menu mobile
     --------------------------------------------------------- */
  var menuToggle = document.getElementById("menuToggle");
  var nav = document.getElementById("nav");

  function closeMenu() {
    if (!nav || !menuToggle) return;
    nav.classList.remove("is_open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is_open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });

    // fecha ao clicar em um link
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });

    // fecha ao clicar fora e com Esc
    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is_open")) return;
      if (nav.contains(event.target) || menuToggle.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  /* ---------------------------------------------------------
     3. Scroll reveal (entrada suave ao rolar)
     --------------------------------------------------------- */
  var revealItems = document.querySelectorAll("[data-reveal]");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    revealItems.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---------------------------------------------------------
     4. Scroll-spy: destaca o link da seção visível
     --------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav a[href^="#"]')
  );
  var sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            var active = link.getAttribute("href") === "#" + entry.target.id;
            link.classList.toggle("is_active", active);
            if (active) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach(function (section) {
      spyObserver.observe(section);
    });
  }

  /* ---------------------------------------------------------
     5. Contadores do painel de métricas
     --------------------------------------------------------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";

    if (prefersReducedMotion) {
      el.textContent = prefix + target + suffix;
      return;
    }

    var duration = 1200;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      // easing outCubic
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");

  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
    } else {
      var counterObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.5 }
      );

      counters.forEach(function (el) {
        counterObserver.observe(el);
      });
    }
  }

  /* ---------------------------------------------------------
     6. Efeito de digitação no terminal
     --------------------------------------------------------- */
  var typedLine = document.querySelector("[data-terminal]");

  if (typedLine && !prefersReducedMotion) {
    var fullText = typedLine.textContent.trim();
    var charIndex = 0;

    typedLine.textContent = "";

    var typing = window.setInterval(function () {
      charIndex += 1;
      typedLine.textContent = fullText.slice(0, charIndex);
      if (charIndex >= fullText.length) window.clearInterval(typing);
    }, 26);
  }

  /* ---------------------------------------------------------
     7. Holofote que segue o mouse nos cards
     --------------------------------------------------------- */
  if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    var spotlightCards = document.querySelectorAll(".card");
    var pendingFrame = null;
    var pointerX = 0;
    var pointerY = 0;

    function paintSpotlight() {
      pendingFrame = null;
      spotlightCards.forEach(function (card) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", pointerX - rect.left + "px");
        card.style.setProperty("--my", pointerY - rect.top + "px");
      });
    }

    document.addEventListener(
      "mousemove",
      function (event) {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (pendingFrame === null) pendingFrame = requestAnimationFrame(paintSpotlight);
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------
     8. Barra de progresso da rolagem (topo do header)
     --------------------------------------------------------- */
  var progress = document.createElement("div");
  progress.className = "scroll_progress";
  progress.setAttribute("aria-hidden", "true");
  if (header) header.appendChild(progress);

  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    progress.style.transform = "scaleX(" + ratio + ")";
  }

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  /* ---------------------------------------------------------
     9. Rodapé: ano dinâmico
     --------------------------------------------------------- */
  var yearSlot = document.getElementById("year");
  if (yearSlot) yearSlot.textContent = String(new Date().getFullYear());
})();
