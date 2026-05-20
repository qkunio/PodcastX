import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {COMPOSITION_ID} from './src/composition';
import {sanitizeStudioProps} from './src/utils/studioProps';
import {getProjectRoot, loadInput} from './src/utils/loadInput';
import type {PodcastXProps} from './src/types';

const writeStudioDefaultProps = (
  projectRoot: string,
  props: PodcastXProps,
): void => {
  const outDir = path.join(projectRoot, 'src', 'generated');
  const outFile = path.join(outDir, 'studio-props.json');

  fs.mkdirSync(outDir, {recursive: true});
  fs.writeFileSync(
    outFile,
    `${JSON.stringify(sanitizeStudioProps(props), null, 2)}\n`,
    'utf-8',
  );
};

const main = async () => {
  const projectRoot = getProjectRoot();
  const input = await loadInput(process.argv);
  writeStudioDefaultProps(projectRoot, input);

  const outputPath = path.isAbsolute(input.output)
    ? input.output
    : path.resolve(projectRoot, input.output);

  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, {recursive: true});

  console.log('Loading video config...');
  console.log(`  Template: ${input.template}`);
  console.log(`  Images: ${input.assets.images} (${input.imagePaths.length})`);
  console.log(`  Background: ${input.backgroundImagePath}`);
  console.log(`  TTS audio: ${input.audioPath}`);
  console.log(`  Subtitles: ${input.srtPath} (${input.subtitles.length})`);
  console.log(`  Size: ${input.width}x${input.height} @ ${input.fps}fps`);
  console.log(`  Duration: ${input.duration}s`);
  console.log(`  Output: ${outputPath}`);

  const entryPoint = path.join(projectRoot, 'src', 'index.ts');
  console.log('Bundling Remotion project...');

  const bundled = await bundle({
    publicDir: path.join(projectRoot, 'assets'),
    entryPoint,
    webpackOverride: (config) => config,
  });

  const inputProps = input;

  const composition = await selectComposition({
    serveUrl: bundled,
    id: COMPOSITION_ID,
    inputProps,
  });

  console.log('Rendering MP4...');

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps,
    overwrite: true,
  });

  console.log(`Render complete: ${outputPath}`);
};

main().catch((error: unknown) => {
  console.error('Render failed:');
  if (error instanceof Error) {
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  } else {
    console.error(error);
  }
  process.exit(1);
});
