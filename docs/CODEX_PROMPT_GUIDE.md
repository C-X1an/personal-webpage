# CODEX PROMPT GUIDE

## Purpose
This file instructs the Codex agent how to operate on this repo. The agent must read this file before making changes.

## General rules
- Work task-by-task. For each task, produce a unified git diff and a 1–3 line rationale.
- Wait for human `APPROVE` before committing. After approval, run tests/lint then commit and push (if allowed).
- Update `codex_state.json` with status ("todo" -> "in_progress" -> "done"), set `last_completed_task` and add a shorter note.
- Append a short summary entry to `STATUS.md` each session or when interrupted.

## Asset sourcing
- Only download free assets (CC0 preferred, CC-BY ok with attribution).
- Save to `assets/3d/` and register metadata in `assets/3d/_licenses.json`.
- Compress GLB with `gltf-pipeline` or `gltfpack` and produce a `_draco.glb` variant.

## Dev flow
- Start with `task_02_create_package_json_and_scaffold` from `codex_state.json`.
- When building 3D scenes, lazy-load modules and test desktop-only behavior before creating mobile fallback.

## Token conservation guidance
- Reference content files (`content/*.yml`, `docs/*`, `design/tokens.json`) rather than embedding large content in prompts.
- For large diffs or multiple-file changes, break into smaller commits.

## Error handling
- If run-time or token error occurs: write a status snapshot to `STATUS.md`, update `codex_state.json` to `in_progress` and stop.