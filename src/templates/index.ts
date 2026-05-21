import React from 'react';
import type {TemplateId, PodcastXProps} from '../types';
import {BlueBookRecordPlayer} from './blue-book-record-player';
import {ClassicPlayer} from './classic-player';
import {DialoguePodcast} from './dialogue-podcast';

export const DEFAULT_TEMPLATE: TemplateId = 'classic-player';

export const templates: Record<TemplateId, React.FC<PodcastXProps>> = {
  'blue-book-record-player': BlueBookRecordPlayer,
  'classic-player': ClassicPlayer,
  'dialogue-podcast': DialoguePodcast,
};
