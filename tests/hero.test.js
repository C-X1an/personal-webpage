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
  const contactApiSource = readFile('pages/api/contact.js');
  const projectSource = readFile('components/ProjectShowcase.jsx');

  assert.match(heroSource, />\s*FREE TICKET\s*</);
  assert.match(heroSource, /objectFit: isDesktop \? 'contain' : 'cover'/);
  assert.match(pageSource, /const DESKTOP_BREAKPOINT = 960/);
  assert.match(pageSource, /requestAnimationFrame/);
  assert.match(pageSource, /transitionProgress=\{heroZoomProgress\}/);
  assert.match(gardenSource, /transitionProgress/);
  assert.match(gardenSource, /focusId/);
  assert.match(gardenSource, /WaypointOverlay/);
  assert.match(contentSource, /getTimelineSortValue\(right\) - getTimelineSortValue\(left\)/);
  assert.match(contactSource, /NEXT_PUBLIC_FORMSPREE_ENDPOINT/);
  assert.match(contactSource, /postContact\('\/api\/contact'/);
  assert.match(contactApiSource, /FORMSPREE_ENDPOINT \|\| process\.env\.NEXT_PUBLIC_FORMSPREE_ENDPOINT/);
  assert.match(projectSource, /View All Projects/);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
