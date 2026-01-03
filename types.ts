
export type Niche = 'Students' | 'Motivation' | 'Fitness' | 'Business' | 'Personal Branding';
export type CreationMode = 'HOOKS' | 'CAROUSEL' | 'PLAN_30';
export type Platform = 'TikTok' | 'Instagram Reels' | 'YouTube Shorts' | 'Facebook Reels';
export type ContentType = 'Educational' | 'Motivational' | 'Story-based' | 'Authority' | 'Problem–Solution' | 'List-style';

export interface HookPost {
  content: string;
  visualIdea: string;
}

export interface CarouselSlide {
  text: string;
  visual: string;
}

export interface CarouselOutput {
  slides: CarouselSlide[];
  cta: string;
}

export interface DayPlan {
  day: number;
  topic: string;
  type: string;
  idea: string;
  visualIdea: string;
  slides?: CarouselSlide[];
}

export interface GenerationResult {
  id: string;
  timestamp: number;
  mode: CreationMode;
  niche: Niche;
  platform: Platform[];
  contentType: ContentType;
  topic: string;
  data: HookPost[] | CarouselOutput | DayPlan[];
}

export interface AppState {
  niche: Niche;
  mode: CreationMode;
  platforms: Platform[];
  contentType: ContentType;
  topic: string;
  loading: boolean;
  result: GenerationResult | null;
  history: GenerationResult[];
}
