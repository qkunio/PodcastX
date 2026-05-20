import {staticFile} from 'remotion';

export const toPublicAssetPath = (assetPath: string): string =>
  assetPath.replace(/\\/g, '/').replace(/^assets\//, '');

export const toStaticSrc = (assetPath: string): string =>
  staticFile(toPublicAssetPath(assetPath));
