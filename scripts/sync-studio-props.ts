import fs from 'node:fs';
import path from 'node:path';
import type {PodcastXProps} from '../src/types';
import {getProjectRoot, loadInputFromFile} from '../src/utils/loadInput';

const main = async () => {
  const projectRoot = getProjectRoot();
  const configArg = process.argv[2] ?? 'inputs/example.json';
  const props: PodcastXProps = await loadInputFromFile(configArg, projectRoot);
  const outDir = path.join(projectRoot, 'src', 'generated');
  const outFile = path.join(outDir, 'studio-props.json');

  fs.mkdirSync(outDir, {recursive: true});
  fs.writeFileSync(outFile, `${JSON.stringify(props, null, 2)}\n`, 'utf-8');

  console.log(`[sync-props] wrote ${outFile}`);
};

main().catch((error) => {
  console.error('[sync-props] failed:', error);
  process.exit(1);
});
