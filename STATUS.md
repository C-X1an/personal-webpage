# STATUS — Project progress (auto-updated by Codex)

## Overview
This file records human-readable progress checkpoints for the Codex agent. Codex MUST update this file at the end of every session or when interrupted, noting what was completed and what remains.

---

## Last update
- **timestamp:** 2026-03-10T23:22:22+08:00
- **agent:** codex (automated)

---

## Completed tasks (examples)
1. repo initialized and seed files added (README, content YAMLs, design tokens).
2. Formspree endpoint recorded in `.env.local`.
3. Hero image added at `assets/images/hero.png`.

---

## In-progress tasks
- None. Awaiting the next approved task.

---

## Next immediate tasks (priority)
1. Create Next.js scaffold + package.json and run `npm install`.
2. Implement Hero component and center CTA button.
3. Add API route / contact wiring to Formspree using `FORMSPREE_ENDPOINT`.
4. Implement 3D canvas lazy-loaded on desktop route and add GLB asset download step.
5. Add panel modal component with color theming per category.

---

## Notes / blockers
- No blockers at this time.
- Asset downloads may take time; Codex will record each asset in `assets/3d/_licenses.json`.
- `npm install` reported that `next@15.5.2` has a known security issue. Registry lookup after the push showed `15.5.12` is the latest `15.x` release, so that patch bump should be handled in the next reviewed diff before deployment work.

---

## How to resume
To resume, open the repo and run `git status`, then run `npm run dev`. Codex will read `codex_state.json` and continue from `last_completed_task`.

## Session log
2026-03-10T22:59:18+08:00: Started `task_02_create_package_json_and_scaffold` after reading the required project docs, content YAML, design tokens, checkpoint files, and waypoint reference image. Current session scope is limited to the initial Next.js Pages Router scaffold, package/config files, and an accessible hero/contact placeholder implementation so the human can review a clean atomic diff before any install, build, or commit step.

2026-03-10T23:22:22+08:00: Completed `task_02_create_package_json_and_scaffold`. Commit `d785e6a` was pushed to `origin/main` after `npm install`, `npm run lint`, `npm run build`, and `npm test` passed. Build status: passed. Preview URL: not deployed. Assets downloaded: none.

2026-03-11T18:15:28+08:00: Started `task_03_create_pages_index_and_hero` from base commit `5e4bbbb`. Scope: replace the scaffold hero with a fullscreen image-only entry state, center the squarish `Free ticket` CTA, add the desktop-only lazy procedural garden canvas scaffold with waypoint modal behavior, and add a smoke test before review. Commit hash: pending approval. Preview URL: pending.

2026-03-11T18:48:29+08:00: Completed `task_03_create_pages_index_and_hero`. Commit `2643a19` was pushed to `origin/main` after `npm ci`, `npm run lint`, `npm run build`, and `npm test` passed. Build status: passed. Preview URL: not available. Assets downloaded: none.

2026-03-11T19:19:17.8396844+08:00: Started `task_04_refine_hero_zoom_and_garden_camera`. Scope: replace the first-pass desktop entry with a more dramatic hero zoom and staged garden reveal, move waypoint positioning to projected DOM markers on actual object coordinates, add themed panel/content scaffolding for certifications, education/work, projects, and contact, and extend the mobile fallback/routes plus smoke coverage before review. Commit hash: pending approval. Preview URL: pending.

2026-03-11T19:44:31.5402985+08:00: Completed `task_04_refine_hero_zoom_and_garden_camera`. Feature commit `ac511c9` passed `npm ci`, `npm run lint`, `npm run build`, and `npm test` before push to `origin/main`. Scope delivered: dramatic hero zoom flow, desktop birds-eye garden camera with projected waypoints and themed modal panels, mobile 2D content sections/routes, contact Formspree client wiring, and smoke coverage. Remaining unrelated local changes: `.gitignore`, `package.json`, and `package-lock.json`.
