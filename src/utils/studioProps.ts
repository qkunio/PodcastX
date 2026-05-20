import type {PodcastXProps} from '../types';

export const sanitizeStudioProps = (props: PodcastXProps): PodcastXProps => ({
  ...props,
  tts: props.tts
    ? {
        ...props.tts,
        apiKey: props.tts.apiKey ? 'configured' : '',
      }
    : props.tts,
});
