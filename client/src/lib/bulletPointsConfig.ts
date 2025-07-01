export const BULLET_POINTS_CONFIG = {
  MAX_CHARS: 4000,
  WARNING_THRESHOLD: 3500,
  FEATURE_NAME: 'bullet-points-generator'
} as const;

export const DEFAULT_AGENT_CONFIG = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2000
} as const;