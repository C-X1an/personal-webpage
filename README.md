# Chong Xian Personal Portfolio

## Requirements
- Node.js 18 (`.nvmrc` is included)
- npm

## Local development
1. Create `.env.local` from `.env.example` and set `NEXT_PUBLIC_FORMSPREE_ENDPOINT`.
2. Install dependencies with `npm install`.
3. Start the dev server with `npm run dev`.
4. Open `http://localhost:3000`.
5. Use `npm run lint`, `npm test`, and `npm run build` before shipping changes.

## Project structure
- `assets/` stores images, resume files, and 3D assets.
- `components/` stores reusable UI such as the hero and contact form.
- `content/` stores editable YAML content for projects, certifications, and education.
- `design/` stores shared tokens for color, spacing, and typography.
- `pages/` contains the Next.js Pages Router entrypoints and API routes.
- `STATUS.md` and `codex_state.json` track resumable task progress for Codex.
