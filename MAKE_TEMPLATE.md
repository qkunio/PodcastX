# Making A Template

Templates are presentation-only React code. They define layout, motion, visual styling, and template-owned artwork. They should not read input files, call TTS, download media, parse transcripts, or know where the transcript came from.

The loader resolves every JSON input into `PodcastXProps` before the template runs:

- `content`: title, subtitle, author, and other display copy
- `imagePaths` and `backgroundImagePath`: public image paths from `assets.images`
- `audioPath`: generated TTS audio under `assets/generated/`
- `subtitles`: parsed subtitle cues from generated TTS timestamps
- `duration`, `audioDuration`, `fps`, `width`, `height`
- `fitMode`: resolved from `templateConfig.fitMode`
- `bgmPath`: optional background music from `assets.bgm`

## Template Rules

- Keep layout constants inside the template folder.
- Keep subtitle styling inside the template folder.
- Keep template-owned artwork inside the template folder.
- Use only resolved props from `PodcastXProps`.
- Put genuine user-facing template switches under `templateConfig` in the input JSON.
- Do not add visual style fields like subtitle style to the global JSON schema.
- Do not import anything from `src/utils/pipeline`.
- Do not add platform-specific fields to the global input shape.

## Folder Shape

```txt
src/templates/my-template/
  index.tsx
  components/
  config/
  utils/
  artwork.png
```

## Template Assets

If an asset is owned by a template, keep the source file inside that template folder.

Example:

```txt
src/templates/blue-book-record-player/tonearm.png
```

Remotion `staticFile()` reads from the public directory, which is currently `assets/`. For template-owned assets that must be referenced by `staticFile()`, add a sync entry in `scripts/setup-assets.mjs`:

```js
const templateAssets = [
  {
    source: path.join(root, 'src/templates/my-template/artwork.png'),
    target: path.join(root, 'assets/generated/template-assets/my-template/artwork.png'),
  },
];
```

Then reference the synced runtime copy:

```tsx
<Img src={staticFile('generated/template-assets/my-template/artwork.png')} />
```

Do not maintain template-owned artwork directly under `assets/`.

## Registering

1. Add the template ID to `TemplateId` in `src/types.ts`.
2. Export the component from `src/templates/my-template/index.tsx`.
3. Register it in `src/templates/index.ts`.
4. Add an example JSON in `inputs/`.
5. If the template has owned artwork, add the setup sync entry.

## Example Component

```tsx
import React from 'react';
import {AbsoluteFill, Audio, Img} from 'remotion';
import type {PodcastXProps} from '../../types';
import {toStaticSrc} from './utils/media';

export const MyTemplate: React.FC<PodcastXProps> = ({
  content,
  imagePaths,
  audioPath,
}) => {
  const image = imagePaths[0];

  return (
    <AbsoluteFill>
      <Img src={toStaticSrc(image)} />
      <h1>{content.title}</h1>
      <Audio src={toStaticSrc(audioPath)} />
    </AbsoluteFill>
  );
};
```
