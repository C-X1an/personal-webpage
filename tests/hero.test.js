const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { transformSync } = require('next/dist/build/swc');

function loadHeroComponent() {
  const heroPath = path.join(process.cwd(), 'components', 'Hero.jsx');
  const source = fs.readFileSync(heroPath, 'utf8');
  const transformed = transformSync(source, {
    filename: heroPath,
    sourceMaps: false,
    jsc: {
      parser: {
        syntax: 'ecmascript',
        jsx: true,
      },
      transform: {
        react: {
          runtime: 'automatic',
        },
      },
    },
    module: {
      type: 'commonjs',
    },
  });
  const testModule = new Module(heroPath, module);
  const originalLoad = Module._load;

  testModule.filename = heroPath;
  testModule.paths = Module._nodeModulePaths(path.dirname(heroPath));

  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === 'next/image') {
      return function MockImage({ alt = '', src = '' }) {
        const resolvedSource = typeof src === 'string' ? src : src?.src || '';

        return React.createElement('img', {
          alt,
          src: resolvedSource,
        });
      };
    }

    if (request.endsWith('Hero.module.css')) {
      return new Proxy(
        {},
        {
          get: (_, key) => String(key),
        },
      );
    }

    if (request.endsWith('hero.png')) {
      return {
        src: '/hero.png',
        width: 1440,
        height: 900,
      };
    }

    return originalLoad.call(Module, request, parent, isMain);
  };

  try {
    testModule._compile(transformed.code, heroPath);
  } finally {
    Module._load = originalLoad;
  }

  return testModule.exports.default || testModule.exports;
}

try {
  const Hero = loadHeroComponent();
  const html = renderToStaticMarkup(
    React.createElement(Hero, {
      onTicketClick: () => {},
      isTransitioning: false,
      isGardenOpen: false,
    }),
  );

  assert.match(html, /Free ticket/);
  assert.match(html, /Enter Chong Xian&#x27;s garden \(free ticket\)/);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
