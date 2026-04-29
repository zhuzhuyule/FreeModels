export interface OpenAIModelObject {
  id: string;
  object: 'model';
  created: number;
  owned_by: string;
  permission?: unknown[];
  root?: string;
  parent?: string | null;
}

export interface ExtendedModelObject extends OpenAIModelObject {
  provider: string;
  model_id: string;
  name: string;
  description?: string;
  context_size?: number;
  context_label?: string;
  price_input?: number;
  price_output?: number;
  is_free?: boolean;
  capabilities?: string[];
  tags?: string[];
  is_reasoning?: boolean;
  is_multimodal?: boolean;
  has_tool_use?: boolean;
  billing_mode?: 'free' | 'pay' | 'mixed';
  free_tier?: 'none' | 'trial' | 'full';
  parameter_count?: number;
  tier?: 'small' | 'medium' | 'large' | 'xlarge';
  speed?: 'fast' | 'standard' | 'premium';
  use_case?: string[];
  performance_level?: 'entry' | 'mid' | 'high' | 'enterprise';
  estimated_latency?: string;
}

export interface OpenAICompatibleOutput {
  object: 'list';
  updated_at: string;
  total: number;
  providers: Record<string, ProviderMeta>;
  views: string[];
  data: ExtendedModelObject[];
}

export interface RawModelData {
  vendor: string;
  modelId: string;
  name: string;
  description?: string;
  contextSize?: number;
  priceInput?: number;
  priceOutput?: number;
  isFree?: boolean;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}

export interface EnhancedModelData extends RawModelData {
  tags: string[];
  isReasoning: boolean;
  isMultimodal: boolean;
  hasToolUse: boolean;
  contextLabel: string;
  billingMode: 'free' | 'pay' | 'mixed';
  freeTier: 'none' | 'trial' | 'full';
  provider: string;
  parameterCount?: number;
  tier: 'small' | 'medium' | 'large' | 'xlarge';
  speed: 'fast' | 'standard' | 'premium';
  useCase: string[];
  performanceLevel: 'entry' | 'mid' | 'high' | 'enterprise';
  estimatedLatency?: string;
}

export interface CachedCapabilities {
  tags: string[];
  isReasoning: boolean;
  isMultimodal: boolean;
  hasToolUse: boolean;
  contextSize: string;
  parameterCount?: number;
  tier: 'small' | 'medium' | 'large' | 'xlarge';
  performanceLevel: 'entry' | 'mid' | 'high' | 'enterprise';
  description?: string;
  updatedAt: string;
}

export interface ProviderMeta {
  name: string;
  displayName: string;
  website?: string;
  logoUrl?: string;
}

export interface ProviderOutput {
  provider: string;
  updatedAt: string;
  totalModels: number;
  models: EnhancedModelData[];
}

export interface ViewOutput {
  view: string;
  updatedAt: string;
  totalModels: number;
  filters: Record<string, string | string[]>;
  models: EnhancedModelData[];
}

export interface AggregatedOutput {
  updatedAt: string;
  totalModels: number;
  providers: string[];
  providerMeta: Record<string, ProviderMeta>;
  views: string[];
  models: EnhancedModelData[];
}

export type ProviderPlugin = () => Promise<RawModelData[]>;

export function toOpenAICompatible(models: EnhancedModelData[]): OpenAICompatibleOutput {
  const seenProviders: Record<string, boolean> = {};
  const views = [
    'all', 'free', 'free-full', 'free-trial',
    'reasoning', 'multimodal', 'tool-use',
    'fast', 'premium', 'small', 'large'
  ];

  return {
    object: 'list',
    updated_at: new Date().toISOString(),
    total: models.length,
    providers: {},
    views,
    data: models.map((m, idx) => {
      seenProviders[m.provider] = true;
      return {
        id: m.modelId,
        object: 'model' as const,
        created: Math.floor(Date.now() / 1000) - (models.length - idx),
        owned_by: m.provider,
        provider: m.provider,
        model_id: m.modelId,
        name: m.name,
        description: m.description,
        context_size: m.contextSize,
        context_label: m.contextLabel,
        price_input: m.priceInput,
        price_output: m.priceOutput,
        is_free: m.isFree,
        capabilities: m.capabilities,
        tags: m.tags,
        is_reasoning: m.isReasoning,
        is_multimodal: m.isMultimodal,
        has_tool_use: m.hasToolUse,
        billing_mode: m.billingMode,
        free_tier: m.freeTier,
        parameter_count: m.parameterCount,
        tier: m.tier,
        speed: m.speed,
        use_case: m.useCase,
        performance_level: m.performanceLevel,
        estimated_latency: m.estimatedLatency,
      };
    }),
  };
}
