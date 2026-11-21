import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const files = [
  { path: 'game/dist/assets/index-2.5.250.js', count: 11, sha256: 'b9de0e8eef2a450b347a396860d0b3528db09d8dfe4b2ad7695b1990359938d9' },
  { path: 'office/source-v22.html', count: 4, sha256: '31cb1415ca7ea64614fced5abc7a0cc5308fdb7f5247a7ad082d3a88878d69d8' },
  { path: 'office/xr-babylon-8.46.2.js', count: 4, sha256: '3b1bcb82a9ee1e74aa3f58e3993fe06a3aca13ed76fe8417ff61a88219339487' },
];

for (const file of files) {
  const base = join(root, file.path);
  const partDir = base + '.parts';
  const parts = readdirSync(partDir).filter(name => /^part-\d{3}\.txt$/.test(name)).sort();
  if (parts.length !== file.count) throw new Error('Missing source fragments for ' + file.path);
  const bytes = Buffer.concat(parts.map(part => readFileSync(join(partDir, part))));
  const actual = createHash('sha256').update(bytes).digest('hex');
  if (actual !== file.sha256) throw new Error('Source checksum mismatch for ' + file.path);
  mkdirSync(dirname(base), { recursive: true });
  writeFileSync(base, bytes);
  console.log('Rebuilt and verified:', file.path, '(' + bytes.length + ' bytes)');
}
