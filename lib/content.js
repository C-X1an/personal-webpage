import fs from 'node:fs';
import path from 'node:path';

import yaml from 'js-yaml';

const CONTENT_DIR = path.join(process.cwd(), 'content');

function readContentFile(fileName) {
  return fs.readFileSync(path.join(CONTENT_DIR, fileName), 'utf8');
}

function normalizeBullets(bullets = []) {
  return bullets
    .filter(Boolean)
    .map((bullet) => String(bullet).replace(/^[\s\-*]+/, '').trim())
    .filter(Boolean);
}

function normalizeAssetPath(assetPath) {
  if (!assetPath || assetPath === 'None') {
    return null;
  }

  return String(assetPath)
    .replace(/^assets[\\/]+/, '')
    .split(/[\\/]/)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function loadYml(fileName) {
  return yaml.load(readContentFile(fileName));
}

export function toAssetRoute(assetPath) {
  const normalizedPath = normalizeAssetPath(assetPath);

  return normalizedPath ? `/api/asset/${normalizedPath}` : null;
}

export function getCertifications() {
  const payload = loadYml('certifications.yml') || {};

  return (payload.certifications || []).map((certification) => ({
    ...certification,
    imageSrc: toAssetRoute(certification.image),
    fileSrc: toAssetRoute(certification.file),
  }));
}

export function getProjects() {
  const payload = loadYml('projects.yml') || {};

  return (payload.projects || []).map((project) => ({
    ...project,
    thumbnailSrc: toAssetRoute(project.thumbnail),
  }));
}

function toTimestamp(value) {
  if (!value) {
    return 0;
  }

  if (/^\d{4}$/.test(value)) {
    return Number(value) * 100;
  }

  return Number(value.replace('-', ''));
}

function getTimelineSortValue(item) {
  return Math.max(toTimestamp(item.start), toTimestamp(item.end));
}

export function getTimelineItems() {
  const payload = loadYml('education.yml') || {};
  const education = (payload.education || []).map((item) => ({
    ...item,
    kind: 'education',
    organization: item.institution,
    dateLabel: item.start === item.end ? item.start : `${item.start} - ${item.end}`,
    bullets: normalizeBullets(item.bullets),
  }));
  const jobs = (payload.job || []).map((item) => ({
    ...item,
    kind: 'job',
    organization: item.company,
    dateLabel: item.start === item.end ? item.start : `${item.start} - ${item.end}`,
    bullets: normalizeBullets(item.bullets),
  }));

  return [...education, ...jobs].sort(
    (left, right) => getTimelineSortValue(right) - getTimelineSortValue(left),
  );
}

export function getHomePageContent() {
  return {
    certifications: getCertifications(),
    projects: getProjects(),
    timelineItems: getTimelineItems(),
  };
}
