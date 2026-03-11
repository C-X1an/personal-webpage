import fs from 'node:fs/promises';
import path from 'node:path';

const ASSET_ROOT = path.join(process.cwd(), 'assets');
const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function resolveSafeAssetPath(segments = []) {
  const requestedPath = path.resolve(ASSET_ROOT, ...segments);
  const relativePath = path.relative(ASSET_ROOT, requestedPath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return null;
  }

  return requestedPath;
}

export default async function handler(req, res) {
  const assetPath = Array.isArray(req.query.assetPath)
    ? req.query.assetPath
    : [req.query.assetPath].filter(Boolean);

  if (assetPath.length === 0) {
    return res.status(400).json({
      ok: false,
      message: 'Asset path is required.',
    });
  }

  const safePath = resolveSafeAssetPath(assetPath);

  if (!safePath) {
    return res.status(400).json({
      ok: false,
      message: 'Invalid asset path.',
    });
  }

  try {
    const file = await fs.readFile(safePath);
    const extension = path.extname(safePath).toLowerCase();

    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Type', CONTENT_TYPES[extension] || 'application/octet-stream');

    return res.status(200).send(file);
  } catch {
    return res.status(404).json({
      ok: false,
      message: 'Asset not found.',
    });
  }
}
