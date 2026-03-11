const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

try {
  const heroSource = readFile('components/Hero.jsx');
  const pageSource = readFile('pages/index.js');
  const gardenSource = readFile('components/GardenCanvas.jsx');
  const contentSource = readFile('lib/content.js');
  const contactSource = readFile('components/ContactPanel.jsx');

  assert.match(heroSource, />\s*free ticket\s*</);
  assert.match(heroSource, /entering/);
  assert.match(pageSource, /const DESKTOP_BREAKPOINT = 960/);
  assert.match(pageSource, /loadGardenCanvas/);
  assert.match(pageSource, /setShouldMountGarden\(true\)/);
  assert.match(gardenSource, /PANEL_OPEN_DELAY_MS/);
  assert.match(gardenSource, /focusId/);
  assert.match(gardenSource, /WaypointOverlay/);
  assert.match(contentSource, /getTimelineSortValue\(right\) - getTimelineSortValue\(left\)/);
  assert.match(contactSource, /NEXT_PUBLIC_FORMSPREE_ENDPOINT/);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
