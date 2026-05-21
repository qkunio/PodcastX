import {staticFile} from 'remotion';

/** `assets/pics/foo.png` -> `pics/foo.png` because publicDir is assets. */
export const toPublicAssetPath = (assetPath: string): string =>
  assetPath.replace(/\\/g, '/').replace(/^assets\//, '');

export const toStaticSrc = (assetPath: string): string =>
  staticFile(toPublicAssetPath(assetPath));
