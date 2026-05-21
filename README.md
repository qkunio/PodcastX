# PodcastX

PodcastX is a transcript-to-video renderer built with Remotion, React, and TypeScript.

It takes a JSON input with transcript text, TTS settings, visual assets, and a template ID. The renderer synthesizes voice audio, writes a cached SRT subtitle file, resolves local assets, and exports an MP4.

## Scope

PodcastX only does video generation from prepared inputs:

- transcript text or a local transcript file
- TTS credentials and voice parameters in JSON
- local image/music assets
- template configuration
- render size, FPS, and output path

It does not download videos, connect to Douyin, run ASR, rewrite text, or generate images.

## Templates

Currently supported templates:

- `classic-player`
- `blue-book-record-player`
- `dialogue-podcast`

## Setup

```bash
npm install
npm run check
```

## Input JSON

All information needed for a render lives in the input JSON, including TTS credentials.

Example:

```json
{
  "template": "classic-player",
  "render": {
    "fps": 30,
    "width": 1440,
    "height": 1080,
    "output": "dist/output.mp4"
  },
  "content": {
    "title": "一口气听完",
    "subtitle": "《沙雕心理学》"
  },
  "assets": {
    "background": "assets/pics/example-bg.png"
  },
  "transcript": {
    "text": "第一句文稿会被 TTS 合成为声音。\n第二句文稿会同时生成字幕时间轴。"
  },
  "tts": {
    "apiKey": "your-api-key",
    "resourceId": "seed-tts-2.0",
    "speaker": "zh_male_xuanyijieshuo_uranus_bigtts",
    "audioFormat": "mp3",
    "sampleRate": 24000
  },
  "templateConfig": {
    "fitMode": "cover"
  }
}
```

You can also point to a local manuscript:

```json
"transcript": {
  "file": "inputs/manuscript.txt"
}
```

Assets are specified one by one. Each template decides which asset names it
requires:

```json
"assets": {
  "background": "assets/pics/image.png",
  "album_img": "assets/cover.png",
  "bgm": "assets/music/月光.mp3"
}
```

For multi-speaker dialogue, add speaker labels to the manuscript and map those
labels to TTS voices:

```txt
[host] Today we are talking about hypnosis.
[guest_a] A lot of people misunderstand it.
[guest_b] It is not the same thing as falling asleep.
```

```json
"tts": {
  "apiKey": "your-api-key",
  "speaker": "fallback-speaker",
  "speakers": {
    "host": "host-voice",
    "guest_a": "guest-a-voice",
    "guest_b": "guest-b-voice"
  }
}
```

## Commands

Preview in Remotion Studio:

```bash
npm run dev
```

Render the default input:

```bash
npm run render
```

Render a specific input:

```bash
npm run render inputs/blue-book-record-player.example.json
```

On Windows, if PowerShell blocks `npm.ps1`, use `cmd /c`:

```bash
cmd /c npm run render inputs/blue-book-record-player.example.json
```

## Generated Files

TTS audio, subtitles, and setup-synced runtime assets are cached in:

```txt
assets/generated/
```

The cache key includes transcript text and TTS voice settings. If you change the manuscript or TTS options, PodcastX creates a new cached audio/SRT pair.
