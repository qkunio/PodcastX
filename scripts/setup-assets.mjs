import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const dirs = [
  'assets/backgrounds',
  'assets/generated',
  'dist',
  'inputs',
];

for (const dir of dirs) {
  fs.mkdirSync(path.join(root, dir), {recursive: true});
}

const bgPath = path.join(root, 'assets/backgrounds/example-bg.png');
const templateAssets = [
  {
    source: path.join(root, 'src/templates/blue-book-record-player/tonearm.png'),
    target: path.join(
      root,
      'assets/generated/template-assets/blue-book-record-player/tonearm.png',
    ),
  },
];

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

const writeTinyPng = (filePath) => {
  fs.writeFileSync(filePath, TINY_PNG);
  console.log('[setup] wrote fallback PNG', filePath);
};

const createImageWithSharp = async (filePath) => {
  const sharp = (await import('sharp')).default;
  await sharp({
    create: {
      width: 1440,
      height: 1080,
      channels: 3,
      background: {r: 61, g: 90, b: 128},
    },
  })
    .png()
    .toFile(filePath);
};

const syncTemplateAssets = () => {
  for (const {source, target} of templateAssets) {
    if (!fs.existsSync(source)) {
      console.error('[setup] missing template asset:', source);
      process.exit(1);
    }

    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.copyFileSync(source, target);
  }
};

const main = async () => {
  console.log('[setup] preparing assets...');
  syncTemplateAssets();

  if (!fs.existsSync(bgPath)) {
    try {
      await createImageWithSharp(bgPath);
      console.log('[setup] generated background', bgPath);
    } catch (error) {
      console.warn(
        '[setup] sharp failed, using fallback PNG:',
        error instanceof Error ? error.message : error,
      );
      writeTinyPng(bgPath);
    }
  }

  if (!fs.existsSync(bgPath)) {
    console.error('[setup] missing background:', bgPath);
    process.exit(1);
  }

  console.log('[setup] done.');
};

main().catch((error) => {
  console.error('[setup] failed:', error);
  process.exit(1);
});
