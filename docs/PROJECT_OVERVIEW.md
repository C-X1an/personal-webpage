# Project Overview — Chong Xian Personal Webpage

## High-level purpose
Production-ready portfolio for **Chong Xian** (software developer). Desktop-first experience featuring an interactive 3D garden landing; mobile fallback is a 2D accessible site. The site showcases projects, certifications, education/work history, resume download, and contact form.

## Visual tone
- Modern, clean, slightly playful game-like aesthetic (inspired by merodev.net baseline).
- Soft morning light palette. Avoid high-saturation or blinding UI colors.
- Accent colors: sakura pink (#ffb7d5), spring green (#8FCB9B), fountain blue (#BEE3F8). Panel foreground text should be dark and readable.
- Typography: system sans (Inter preferred); legible sizes, good line-height.

## Layout summary
- Hero (desktop): full-bleed hero image of a garden gate; centered CTA button labeled **Free ticket**. Clicking CTA animates a smooth zoom into the garden and loads the interactive garden canvas.
- Garden (desktop only): single fixed camera perspective with subtle lateral parallax on mouse move. Small scene with one primary vantage; not a free-roam 3D world.
- Mobile: no 3D canvas — show hero image + stacked HTML sections (projects, certs, timeline), each accessible by scroll.

## Scene objects ↔ content mapping
- **Sakura Tree(s)**: Certifications
- **Spring Tree(s)**: Education & Work (timeline)
- **Fountain**: Education & Work alternative entry (water-themed panel)
- **Playground** (small pavilion): Projects (PR-Brief, Driftline + others)
- **Kiosk / Info desk**: About / Contact (contact modal + email link)
- **Waypoints**: diamond-shaped markers that indicate clickable items

## Interaction primitives
- **Waypoints**
  - Implementation: HTML/CSS overlay positioned by projecting 3D coords -> screen.
  - Default state: small diamond only.
  - Hover: diamond glows and a label fades in to its side (e.g., "Certifications").
  - Keyboard: focusable with `tab`, has `aria-label`.

- **Click flow (generic, used by sakura/spring/fountain/playground)**
  1. Hover effect (glow + waypoint label).
  2. Click: spawn short particle animation relevant to object (petals / droplets / sparkles).
  3. Camera: smooth zoom-in that visually follows a single particle (e.g., a falling sakura leaf). This is a short (~600–900ms) "leaf-to-panel" micro-animation. No stutter; motion reduced if `prefers-reduced-motion`.
  4. UI: open modal/panel. Background canvas is dimmed (overlay), pointer-events disabled on canvas.
  5. Panel theme color should be a muted tone derived from the object: sakura -> soft pink; fountain -> translucent blue; playground -> soft warm color. Ensure text contrast >=4.5:1.

- **Panel behavior**
  - Slides/appears from center or side, responsive.
  - Close returns camera to garden viewpoint with smooth zoom-out.
  - Panel contains content (list/grid), CTAs (e.g., "View GitHub", "Download PDF"), and is keyboard-accessible (trap focus).

## Projects panel specifics
- Show title, short description, tech tags, repo link, optional demo.
- Clicking "View on GitHub" shows a confirmation modal: "Open external link to GitHub?" to prevent accidental navigation; on confirm open in new tab.

## Certifications panel specifics
- Grid layout, thumbnails optional.
- Search bar to filter by certification title.
- Each card: title, issuer, date, download link to PDF/image.

## Education & Work
- Vertical timeline with even spacing (consistent vertical rhythm). Each item shows title, institution/company, date, 1–3 bullets.

## Accessibility & performance
- Respect `prefers-reduced-motion`.
- Keyboard navigable waypoints and modals.
- ARIA roles and labels for landmarks, modals, and waypoints.
- Lazy-load the 3D canvas (only on desktop widths > 900px).
- GLB asset management: Codex to compress with Draco / gltfpack and use LOD where possible.
- Target aggregate 3D payload (compressed): 3–6 MB on initial load. If exceeded, create LQ fallback.

## Asset & licensing rules
- Only **free** assets allowed (CC0 preferred; CC-BY allowed with attribution).
- Store each asset with metadata in `assets/3d/_licenses.json`.
- Prefer GLB; if only OBJ/FBX, convert to GLB and compress, store originals in `assets/3d/originals/`.

## Developer experience (DX)
- All content (projects, certs, education) stored in `content/*.yml` for easy editing.
- Provide a `codex_state.json` and `STATUS.md` to allow Codex to checkpoint progress.
- Changes must be presented as diffs for review. After `APPROVE`, Codex commits and may push.

## Mobile fallback
- HTML/CSS single-page layout that mirrors desktop content but with simple interactions and no 3D.

## Testing & CI
- Minimal test that builds Next.js app and ensures pages render.
- GitHub Actions: build + lint on PR; optionally run tests.

## Notes for Codex
- Read and follow `docs/PROJECT_OVERVIEW.md`, `design/tokens.json`, and `content/*.yml`.
- Produce concise diffs; update `codex_state.json` and `STATUS.md` after each task.
- When downloading assets, record metadata to `assets/3d/_licenses.json`.
