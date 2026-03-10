# Asset sourcing instructions (free-only)

## Objective
Find free GLB (or convertible) assets that visually match required scene objects (sakura tree, spring tree, fountain, bench, kiosk, path segments). Download, convert if necessary, compress, and save to `assets/3d/` with clear names. Record metadata in `assets/3d/_licenses.json`.

## Sources (priority)
1. Sketchfab (filter: downloadable + free / CC0 / CC-BY)
2. Poly Haven (CC0)
3. Kenney.nl (free asset packs)
4. Meshy.ai (free assets)
5. Free3D, TurboSquid free section

## Search checklist per asset
- Query example: `site:sketchfab.com "sakura" "downloadable" glb` or `low poly cherry blossom glb free`.
- Candidate metadata: title, author, license string, download URL, format, polycount (if available).
- Accept only if license is clearly free (prefer CC0, CC-BY acceptable).
- Prefer GLB. If only FBX/OBJ are available: attempt automated conversion (Blender CLI or obj2gltf).
- Compression: run `gltf-pipeline --draco` or `gltfpack` to produce `*_draco.glb`.
- Save both original and compressed files into `assets/3d/` and `assets/3d/originals/` respectively.

## Filenames (naming convention)
- `assets/3d/<asset-type>_<vendor>_<candidate-index>.glb`
  - Example: `assets/3d/sakura_sketchfab_01.glb`
  - Compressed: `assets/3d/sakura_sketchfab_01_draco.glb`

## License record
Add an entry into `assets/3d/_licenses.json` for each downloaded item with:
- `source_url`
- `filename`
- `author`
- `license`
- `downloaded_at`
- `notes` (if conversion performed)

## Quality filters
- Readable at thumbnail size: blossoms or leaves must be identifiable.
- Avoid extremely high-poly models (>200k triangles) unless they provide LODs.
- Prefer separate texture maps (so recoloring is possible).

## Testing assets locally
- After downloading and compressing, Codex should test-load each GLB in a minimal r3f scene and render a screenshot for review (store in `assets/3d/previews/`).
