export const BULLET_POINTS_CONFIG = {
  MAX_CHARS: 4000,
  MIN_CHARS: 100,
  WARNING_THRESHOLD: 3500,
  FEATURE_NAME: 'bullet-points-generator',
  FIELD_LIMITS: {
    productName: 120,
    brand: 40,
    targetAudience: 150,
    warranty: 15,
    keywords: 150,
    uniqueDifferential: 100,
    materials: 120,
    textInput: 2000
  }
} as const;

export const DEFAULT_AGENT_CONFIG = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2000
} as const;