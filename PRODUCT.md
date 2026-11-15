# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience is recruiters and hiring managers evaluating Tiago Santos for internship or junior full-stack developer positions. They land on the site to decide whether to move him forward to an interview.

## Product Purpose

A personal portfolio site for Tiago Santos: a single-page presentation of who he is, his skills, and his shipped projects, existing to help him land an internship or junior developer role.

## Positioning

Full-stack breadth with an AI-and-mobile edge: proficiency across React, TypeScript, Next.js, React Native, Node.js, Prisma, and MySQL/PostgreSQL/Firebase while still a 1st-semester Information Systems student (Unex), with completed professional internship experience at Vittal Web. The declared differentiators are AI/LLM agents (Gemini tool-calling), offline-first mobile architecture, and secure REST APIs (JWT, Zod, Docker).

## Operating Context

Static single-page site (plain HTML/CSS/JS, no framework) with sections in editorial order: hero (`#top`), about (`#sobre`), experience (`#experiencia`), projects (`#projetos`), stack (`#stack`), education (`#formacao`), and contact (`#contato`). Content and copy are in Brazilian Portuguese (pt-br). Deployed on Render at `portfolio-tiago-kjf4.onrender.com` (canonical domain in `<head>`); the repo root is the live site — `build/` and `src/` no longer exist. Résumé is offered as a downloadable PDF from the hero and from the education section. Social links (LinkedIn, GitHub, Instagram, e-mail, Facebook) live in the contact section; the hero carries two calls to action (jump to projects, download résumé).

## Capabilities and Constraints

- The live site is the repo root: `index.html`, `css/style.css`, `js/script.js`, `assets/`. There is no build tooling; everything is authored directly as static HTML/CSS/JS.
- Completed an internship at Vittal Web in November 2026, building software, automations, and web scraping solutions. No longer works at the company. Studies Information Systems at Unex (1st semester, confirmed 2026-10-20).
- Dependencies are local/self-hosted: fonts (Space Grotesk for display, Inter for body, JetBrains Mono for labels) are woff2 files in `assets/fonts/`, declared with `@font-face` and preloaded in `<head>`. There are no icon sprites and no external icon library — the interface uses typographic glyphs. No CDN dependencies.
- Tests live in `tests/*.test.mjs` and run with the built-in Node runner (`node --test tests/*.test.mjs`, zero dependencies, no `package.json`). They cover integrity, structure, factual content, and motion/accessibility guards.
- Six shipped projects are featured, each with a live demo link and a GitHub link (Connect Dev links to a LinkedIn post instead of a repo): Gnosis IA / Estudy IA (AI study platform — Node.js/TypeScript API with Prisma/PostgreSQL, React Native/Expo offline-first app, Gemini agent, Docker), Connect Dev (social network — Node.js/TypeScript, MySQL, Supabase, Helmet, Controller→Service→Repository), Pergunta da Igreja SUD (scripture quiz — Next.js 14, React 18, Gemini API, Firestore, Tailwind, gamified rankings), Promise (social/relationship app for a faith-based community — Node.js/React/TypeScript, Zustand, TanStack), Polearn (AI-assisted language learning — React/TypeScript, Google Studio AI, Shadcn UI, Zustand), and Acompanhamento de Pessoas/LMA (people-tracking dashboard for missionaries of The Church of Jesus Christ of Latter-day Saints — React/TypeScript/Firebase, Styled Components, Swiper).
- Project facts (names, tech stacks, links, and the LMA project's church/community context) must stay accurate in any future rewrite; wording/copy is open to improvement.
- `README.md` documents the site as it stands today; where it and this record disagree, this record plus the shipped markup are the source of truth (Sistemas de Informação at Unex — not Ciência da Computação at Uninter).

## Brand Commitments

Name "Tiago" / "Tiago Santos" is the identity anchor (nav brand reads "TIAGO SANTOS", footer sign reads "TIAGO SANTOS", page title "Tiago Santos — Desenvolvedor Full Stack | React, Node.js & IA"). The visual system is now an implemented, coherent direction rather than an open question: light base `#f9f9f7` alternating with dark bands `#0a0a0c`, paper `#f0f0ed`, type stack Space Grotesk / Inter / JetBrains Mono, numbered sections, grain overlay, marquees, and a fixed HUD using `mix-blend-mode: difference`. It is implementation, not a documented brand constraint — but it is consistent across the whole page and should be preserved in rewrites unless the user asks for a change.

## Evidence on Hand

- Assets live in root `assets/`. Actually referenced by the site: hero portrait `perfil.webp`, project covers `gnosis.jpg`, `print_connect-dev.jpg`, `quiz.jpg`, `promis.jpg`, `polearn.jpg`, `lma.jpg`, `favicon.svg`, résumé `curriculo_tiago_dev.pdf`, and the three woff2 fonts in `assets/fonts/`. The hero portrait was generated from the user-provided photo `assets/Retrato Profissional de Homem de Terno.png` (cropped to 640×960, 2:3, transparent background) — the user said they would send their own photo, and this is the current stand-in until a replacement arrives. Legacy files that exist but are no longer referenced: `perfil.png`, `perfil.mp4`, `pet.jpg`, `logo_lma.png`, `logo_porlean.png`, `logo_promise.png`, `curriculo_tiago_ful_stack.pdf`, and everything in `assets/icon/`.
- Real shipped projects with live demo URLs and GitHub repos (see Capabilities and Constraints). No testimonials, case studies, press, or third-party proof exist — future work must not fabricate any.

## Product Principles

- Lead with breadth and momentum: show full-stack range (frontend, backend, mobile, AI agents) plus evidence of fast, self-directed learning while still a student.
- Real projects over generic claims: every feature or skill claim should trace back to one of the six shipped apps, not abstract statements.
- Recruiter-first scannability: a hiring manager should be able to assess skills and see proof of work within the first screen or two, without needing to dig.
- Keep project facts truthful across any rewrite; only presentation and wording are up for reinvention.

## Accessibility & Inclusion

Concrete measures shipped in the markup and enforced by `tests/`: a skip link to `#conteudo`, a single `<main>` landmark, `aria-label` on every navigation and section, one `h1` (with an accessible name; its decorative letter spans are `aria-hidden`), `alt` plus explicit `width`/`height` on every image, `aria-expanded`/`aria-controls` on the mobile menu button, an accessible label on the live clock, `:focus-visible` styling on interactive elements, and a contact/footer region labelled for screen readers.

Motion follows `prefers-reduced-motion: reduce`: animations, transitions, animation/transition delays, and smooth scrolling are all neutralized there, and every piece of content is readable with JavaScript disabled (gating rules are prefixed with `.js`).

Location stated on the site is Vitória da Conquista, BA (Bahia, UTC-3) — confirmed by the user 2026-11-03.
