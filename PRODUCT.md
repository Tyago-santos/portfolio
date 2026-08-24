# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience is recruiters and hiring managers evaluating Tiago Santos for internship or junior full-stack developer positions. They land on the site to decide whether to move him forward to an interview.

## Product Purpose

A personal portfolio site for Tiago Santos: a single-page presentation of who he is, his skills, and his shipped projects, existing to help him land an internship or junior developer role.

## Positioning

Full-stack breadth combined with being a fast, disciplined learner: proficiency across React, TypeScript, Next.js, React Native, Node.js, Express, and MySQL/Firebase while still a 1st-semester Information Systems student (Unex), already working professionally as a developer.

## Operating Context

Static single-page site (plain HTML/CSS/JS, no framework) with sections: hero/intro, about, skills, projects, footer. Content and copy are in Brazilian Portuguese (pt-br). Résumé is offered as a downloadable PDF from the hero section. Social links (LinkedIn, GitHub, Instagram, email, Facebook) are surfaced prominently in the hero.

## Capabilities and Constraints

- The live/deployed site is `build/` (`build/index.html`, `build/css/style.css`, `build/js/script.js`) — treat this as the real project. `src/` is a separate, out-of-date copy; do not assume changes should be mirrored there unless asked.
- No build tooling/framework in place; both `build/` and `src/` are authored directly as static HTML/CSS/JS.
- Currently works professionally as a developer at Vittal Web, building software and automations. Studies Information Systems at Unex (1st semester, as of 2026-08-23).
- Font Awesome (CDN) and Google Fonts (Space Mono) are external dependencies already wired in `<head>`.
- Three shipped projects currently featured: Promise (social/relationship app for a faith-based community, React/TypeScript/Firebase), Polearn (AI-assisted language-learning app, React/TypeScript/Firebase), and an unnamed people-tracking dashboard for missionaries of The Church of Jesus Christ of Latter-day Saints (React/TypeScript/Firebase). Each has a live demo link and GitHub link.
- Project facts (names, tech stacks, links, and the LMA project's church/community context) must stay accurate in any future rewrite; wording/copy is open to improvement.

## Brand Commitments

Name "Tiago" / "Tiago Santos" is the identity anchor (nav logo reads "Tiago", page title "Portfólio | Tiago"). No other binding visual identity (logo mark, color, typeface) has been confirmed yet — current visuals are implementation, not a documented constraint.

## Evidence on Hand

- Real shipped projects with live demo URLs and GitHub repos (see Operating Context/Capabilities). No testimonials, case studies, press, or third-party proof exist — future work must not fabricate any.
- Profile illustration at `src/assets/perfil.png`; project cover images at `src/assets/{promis,polearn,lma}.jpg`; skill icons at `src/assets/icon/`; résumé PDF at `src/assets/curriculo_tiago_dev.pdf`.

## Product Principles

- Lead with breadth and momentum: show full-stack range (frontend, backend, mobile) plus evidence of fast, self-directed learning while still a student.
- Real projects over generic claims: every feature or skill claim should trace back to one of the three shipped apps, not abstract statements.
- Recruiter-first scannability: a hiring manager should be able to assess skills and see proof of work within the first screen or two, without needing to dig.
- Keep project facts truthful across any rewrite; only presentation and wording are up for reinvention.

## Accessibility & Inclusion

No project-specific accessibility requirement has been established beyond good practice (current markup already includes `aria-label`s on nav, social links, and sections).
