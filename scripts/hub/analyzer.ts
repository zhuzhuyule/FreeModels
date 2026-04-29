export interface ModelProfile {
  tier: 'small' | 'medium' | 'large' | 'xlarge';
  speed: 'fast' | 'standard' | 'premium';
  useCase: string[];
  performanceLevel: 'entry' | 'mid' | 'high' | 'enterprise';
  estimatedLatency?: string;
}

const TIER_PATTERNS: Array<{ pattern: RegExp; tier: 'small' | 'medium' | 'large' | 'xlarge' }> = [
  { pattern: /\b0\.5B?\b/i, tier: 'small' },
  { pattern: /\b1\.5B?\b/i, tier: 'small' },
  { pattern: /\b2B?\b/i, tier: 'small' },
  { pattern: /\b3B?\b/i, tier: 'small' },
  { pattern: /\b4B?\b/i, tier: 'small' },
  { pattern: /\b6B?\b/i, tier: 'medium' },
  { pattern: /\b7B?\b/i, tier: 'medium' },
  { pattern: /\b8B?\b/i, tier: 'medium' },
  { pattern: /\b9B?\b/i, tier: 'medium' },
  { pattern: /\b13B?\b/i, tier: 'medium' },
  { pattern: /\b14B?\b/i, tier: 'medium' },
  { pattern: /\b20B?\b/i, tier: 'medium' },
  { pattern: /\b32B?\b/i, tier: 'large' },
  { pattern: /\b34B?\b/i, tier: 'large' },
  { pattern: /\b40B?\b/i, tier: 'large' },
  { pattern: /\b70B?\b/i, tier: 'large' },
  { pattern: /\b72B?\b/i, tier: 'large' },
  { pattern: /\b110B?\b/i, tier: 'xlarge' },
  { pattern: /\b180B?\b/i, tier: 'xlarge' },
  { pattern: /\b200B?\b/i, tier: 'xlarge' },
  { pattern: /\b400B?\b/i, tier: 'xlarge' },
];

const SPEED_INDICATORS: Array<{ pattern: RegExp; speed: 'fast' | 'standard' | 'premium'; reason: string }> = [
  { pattern: /\b(small|lite|tiny|mini|compact)\b/i, speed: 'fast', reason: 'lightweight model' },
  { pattern: /\b(instruct|chat)\b/i, speed: 'standard', reason: 'conversational model' },
  { pattern: /\b(reasoning|think|pro|plus|ultra)\b/i, speed: 'premium', reason: 'high-capability model' },
  { pattern: /\b(vl|vision|image)\b/i, speed: 'premium', reason: 'multimodal capability' },
];

const PRICING_TIER_MAP: Record<string, 'fast' | 'standard' | 'premium'> = {
  '0': 'fast',
  '0.0000001': 'fast',
  '0.0000002': 'fast',
  '0.0000003': 'fast',
  '0.000001': 'standard',
  '0.000002': 'standard',
  '0.000003': 'standard',
  '0.000004': 'premium',
};

const CAPABILITY_USE_CASE: Record<string, string[]> = {
  'text-generation': ['content-creation', 'writing-assistance'],
  'chat': ['conversation', 'q&a'],
  'reasoning': ['problem-solving', 'logical-analysis', 'math'],
  'code-generation': ['software-development', 'code-completion'],
  'code-editing': ['code-modification', 'refactoring'],
  'vision': ['image-understanding', 'visual-q&a'],
  'image-generation': ['creative-generation', 'art'],
  'image-to-image': ['image-editing', 'style-transfer'],
  'embeddings': ['semantic-search', 'similarity'],
  'rerank': ['search-improvement', 'relevance'],
  'speech-recognition': ['transcription', 'voice-input'],
  'speech-synthesis': ['text-to-speech', 'voice-output'],
  'moderation': ['content-filtering', 'safety'],
  'tool_use': ['agentic-tasks', 'tool-augmented'],
  'function_calling': ['structured-output', 'api-integration'],
  'web-search': ['information-retrieval', 'research'],
  'video-generation': ['video-creation'],
  'document-processing': ['pdf-processing', 'ocr'],
};

export function extractParameterCount(modelName: string): number | null {
  const patterns = [
    /(\d+(?:\.\d+)?)\s*[bB](?:\s|$|-)/,
    /(\d+(?:\.\d+)?)[bB](?:\s|$|-)/,
    /(\d+(?:\.\d+)?)\s*参数/,
    /(\d+(?:\.\d+)?)\s*parameters/,
  ];

  for (const pattern of patterns) {
    const match = modelName.match(pattern);
    if (match && match[1]) {
      const num = parseFloat(match[1]);
      if (num > 0 && num < 1000) {
        return Math.round(num * 1_000_000_000);
      }
    }
  }
  return null;
}

export function inferTier(modelName: string, capabilities: string[], priceInput?: number): 'small' | 'medium' | 'large' | 'xlarge' {
  for (const { pattern, tier } of TIER_PATTERNS) {
    if (pattern.test(modelName)) {
      return tier;
    }
  }

  if (capabilities.includes('reasoning')) return 'large';
  if (capabilities.includes('vision') && !capabilities.includes('embeddings')) return 'large';

  if (priceInput !== undefined && priceInput > 0) {
    if (priceInput < 0.0000005) return 'small';
    if (priceInput < 0.000002) return 'medium';
    if (priceInput > 0.00001) return 'large';
  }

  return 'medium';
}

export function inferSpeed(
  modelName: string,
  capabilities: string[],
  priceInput?: number,
  isFree?: boolean
): 'fast' | 'standard' | 'premium' {
  if (isFree) return 'fast';

  for (const { pattern, speed } of SPEED_INDICATORS) {
    if (pattern.test(modelName)) {
      return speed;
    }
  }

  if (capabilities.includes('reasoning')) return 'premium';
  if (capabilities.includes('tool_use') || capabilities.includes('function_calling')) return 'premium';
  if (capabilities.includes('vision')) return 'premium';
  if (capabilities.includes('code-generation') || capabilities.includes('code-editing')) return 'standard';

  if (priceInput !== undefined && priceInput > 0) {
    if (priceInput < 0.0000005) return 'fast';
    if (priceInput > 0.000005) return 'premium';
  }

  return 'standard';
}

export function inferUseCases(capabilities: string[]): string[] {
  const useCases = new Set<string>();

  for (const cap of capabilities) {
    if (CAPABILITY_USE_CASE[cap]) {
      CAPABILITY_USE_CASE[cap].forEach(uc => useCases.add(uc));
    }
  }

  if (capabilities.includes('reasoning')) {
    useCases.add('complex-reasoning');
  }

  if (capabilities.includes('tool_use')) {
    useCases.add('autonomous-agents');
  }

  return Array.from(useCases);
}

export function inferPerformanceLevel(
  tier: 'small' | 'medium' | 'large' | 'xlarge',
  speed: 'fast' | 'standard' | 'premium',
  capabilities: string[]
): 'entry' | 'mid' | 'high' | 'enterprise' {
  let score = 0;

  switch (tier) {
    case 'small': score += 1; break;
    case 'medium': score += 2; break;
    case 'large': score += 3; break;
    case 'xlarge': score += 4; break;
  }

  switch (speed) {
    case 'fast': score += 1; break;
    case 'standard': score += 2; break;
    case 'premium': score += 3; break;
  }

  if (capabilities.includes('reasoning')) score += 2;
  if (capabilities.includes('tool_use')) score += 2;
  if (capabilities.includes('vision')) score += 1;
  if (capabilities.includes('code-generation')) score += 1;

  if (score <= 4) return 'entry';
  if (score <= 7) return 'mid';
  if (score <= 10) return 'high';
  return 'enterprise';
}

export function profileModel(
  modelName: string,
  capabilities: string[],
  priceInput?: number,
  isFree?: boolean
): ModelProfile {
  const tier = inferTier(modelName, capabilities, priceInput);
  const speed = inferSpeed(modelName, capabilities, priceInput, isFree);
  const useCase = inferUseCases(capabilities);
  const performanceLevel = inferPerformanceLevel(tier, speed, capabilities);

  let estimatedLatency: string | undefined;
  if (tier === 'small' || speed === 'fast') {
    estimatedLatency = '< 1s';
  } else if (tier === 'medium') {
    estimatedLatency = '1-3s';
  } else if (tier === 'large' || tier === 'xlarge') {
    estimatedLatency = '3-10s';
  }

  return {
    tier,
    speed,
    useCase,
    performanceLevel,
    estimatedLatency,
  };
}
