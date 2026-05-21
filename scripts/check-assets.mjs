import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const required = [
  'inputs/blue-book-record-player.example.json',
  'inputs/dialogue-podcast.example.json',
];

const exampleInputs = [
  'inputs/blue-book-record-player.example.json',
  'inputs/dialogue-podcast.example.json',
];

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

for (const rel of exampleInputs) {
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

  for (const [name, assetPath] of Object.entries(input.assets ?? {})) {
    if (typeof assetPath !== 'string' || !assetPath.trim()) {
      continue;
    }

    const assetFullPath = path.isAbsolute(assetPath)
      ? assetPath
      : path.join(root, assetPath);
    const exists = fs.existsSync(assetFullPath);
    console.log(`${exists ? 'OK' : 'MISS'} ${rel} assets.${name}: ${assetPath}`);
    if (!exists) {
      ok = false;
    }
  }
}

if (!ok) {
  console.log('\nRun npm run setup or add the missing assets.');
  process.exit(1);
}

console.log('\nResources are ready. TTS will run during sync-props/render if no cache exists.');
