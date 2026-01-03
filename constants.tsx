
import { Niche, CreationMode, Platform, ContentType } from './types';

export const NICHES: Niche[] = ['Students', 'Motivation', 'Fitness', 'Business', 'Personal Branding'];

export const MODES: { value: CreationMode; label: string; description: string }[] = [
  { value: 'HOOKS', label: 'Hook-led Short Posts', description: '10 viral hooks optimized for voiceover narration.' },
  { value: 'CAROUSEL', label: 'Carousel / Slides', description: '6-8 slide sequence with a hook and final CTA.' },
  { value: 'PLAN_30', label: '30-Day Content Plan', description: 'A complete month of structured content ideas.' },
];

export const PLATFORMS: Platform[] = ['TikTok', 'Instagram Reels', 'YouTube Shorts', 'Facebook Reels'];

export const CONTENT_TYPES: ContentType[] = [
  'Educational',
  'Motivational',
  'Story-based',
  'Authority',
  'Problem–Solution',
  'List-style',
];
