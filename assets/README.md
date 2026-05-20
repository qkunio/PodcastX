# Assets

PodcastX reads local visual assets from this directory and writes generated TTS output here.

## Required

| Path | Purpose |
| --- | --- |
| `backgrounds/` | Input image folder for templates. |
| `generated/` | Cached TTS audio, SRT files, and setup-synced runtime copies. |

## Optional

| Path | Purpose |
| --- | --- |
| `music/` | Background music referenced by `assets.bgm`. |

Do not put manuscript text here. Manuscripts belong in the input JSON or a text file referenced by `transcript.file`.
