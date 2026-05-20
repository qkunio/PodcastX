import {staticFile} from 'remotion';

/** `assets/backgrounds/foo.png` → `backgrounds/foo.png`（publicDir 為 assets） */
export const toPublicAssetPath = (assetPath: string): string =>
  assetPath.replace(/\\/g, '/').replace(/^assets\//, '');

export const toStaticSrc = (assetPath: string): string =>
  staticFile(toPublicAssetPath(assetPath));
