import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const required = [
  'assets/backgrounds',
  'inputs/blue-book-record-player.example.json',
];

const imageExtensions = new Set([
  '.apng',
  '.avif',
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.webp',
]);

let ok = true;

console.log('Resource check:\n');

for (const rel of required) {
  const full = path.join(root, rel);
  const exists = fs.existsSync(full);
  console.log(`${exists ? 'OK' : 'MISS'} ${rel}`);
  if (!exists) {
    ok = false;
  }
}

const imageDir = path.join(root, 'assets/backgrounds');
const imageCount =
  fs.existsSync(imageDir) && fs.statSync(imageDir).isDirectory()
    ? fs
        .readdirSync(imageDir)
        .filter((name) => imageExtensions.has(path.extname(name).toLowerCase()))
        .length
    : 0;
console.log(`${imageCount > 0 ? 'OK' : 'MISS'} assets/backgrounds image count: ${imageCount}`);
if (imageCount === 0) {
  ok = false;
}

for (const rel of ['inputs/blue-book-record-player.example.json']) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    continue;
  }

  const input = JSON.parse(fs.readFileSync(full, 'utf-8'));
  const hasApiKey = typeof input.tts?.apiKey === 'string' && input.tts.apiKey.trim();
  console.log(`${hasApiKey ? 'OK' : 'MISS'} ${rel} tts.apiKey`);
  if (!hasApiKey) {
    ok = false;
  }
}

if (!ok) {
  console.log('\nRun npm run setup or add the missing assets.');
  process.exit(1);
}

console.log('\nResources are ready. TTS will run during sync-props/render if no cache exists.');
