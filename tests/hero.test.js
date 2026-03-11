const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

try {
  const heroSource = readFile('components/Hero.jsx');
  const pageSource = readFile('pages/index.js');

  assert.match(heroSource, /Free ticket/);
  assert.match(heroSource, /zooming/);
  assert.match(heroSource, /getHeroPhaseClassName/);
  assert.match(pageSource, /setHeroPhase\('zooming'\)/);
  assert.match(pageSource, /dynamic\(\(\) => import\('\.\.\/components\/GardenCanvas'\)/);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
