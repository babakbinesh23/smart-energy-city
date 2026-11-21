import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

// This PUBLIC repository must not accidentally ingest private WordPress datasets.
// A first-pass defense only, not a substitute for rights/PII/security review.
const root = process.cwd();
const excludeDirs = new Set(['.git', 'node_modules', 'dist', 'coverage', '.vite', '.next']);
const denyDirs = new Set(['portable-data', 'production-assets', '.media-recovery', '.media-incoming']);
const denyPaths = [
  /(^|\/)\.env(?:\.|$)/i, /\.sql$/i, /\.sqlite(?:3)?$/i,
  /\.(?:pem|p12|pfx|key)$/i, /(^|\/)visitors-\d+\.php$/i,
  /(^|\/)snapshot\.php$/i
];
const sourceExts = new Set(['.js', '.cjs', '.mjs', '.php', '.html', '.css', '.json', '.yaml', '.yml', '.ts', '.tsx']);
const obviousCredentials = new RegExp([
  'sk-' + '[A-Za-z0-9_-]{20,}',
  'ghp_' + '[A-Za-z0-9]{20,}',
  'AKIA' + '[A-Z0-9]{16}',
  'AIza' + '[A-Za-z0-9_-]{30,}'
].join('|'), 'g');
const localIPv4 = /\b(?:10(?:\.\d{1,3}){3}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|192\.168(?:\.\d{1,3}){2})\b/g;
const problems = [];
let checked = 0;
function walk(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, item.name);
    const rel = relative(root, abs).split(sep).join('/');
    if (item.isSymbolicLink()) { problems.push('Symlink: ' + rel); continue; }
    if (item.isDirectory()) {
      if (denyDirs.has(item.name.toLowerCase())) problems.push('Private directory: ' + rel);
      else if (!excludeDirs.has(item.name)) walk(abs);
      continue;
    }
    if (!item.isFile()) continue;
    if (denyPaths.some(rule => rule.test(rel))) problems.push('Forbidden private file: ' + rel);
    const ext = '.' + item.name.split('.').pop().toLowerCase();
    if (!sourceExts.has(ext) || rel === 'scripts/oss-preflight.mjs') continue;
    if (statSync(abs).size > 10 * 1024 * 1024) { problems.push('Large source, manual review needed: ' + rel); continue; }
    const content = readFileSync(abs, 'utf8');
    checked++;
    if (obviousCredentials.test(content)) problems.push('Potential key: ' + rel);
    obviousCredentials.lastIndex = 0;
    if (localIPv4.test(content)) problems.push('Private IPv4: ' + rel);
    localIPv4.lastIndex = 0;
  }
}
walk(root);
if (problems.length) {
  console.error('Public-source preflight failed:\n' + problems.map(x => '- ' + x).join('\n'));
  process.exitCode = 1;
} else console.log('Public-source preflight passed (' + checked + ' text files inspected).');
