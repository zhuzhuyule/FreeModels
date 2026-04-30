export interface OpenAIModelObject {
  id: string;
  object: 'model';
  created: number;
  owned_by: string;
  permission?: unknown[];
  root?: string;
  parent?: string | null;
}

export type FreeMechanism =
  | 'permanent'        // 无任何限制，永久免费
  | 'rate-limited'     // 仅有 RPM/RPD 速率限制
  | 'daily-tokens'     // 每日 token 配额内免费
  | 'monthly-tokens'   // 每月 token 配额内免费
  | 'trial-credits'    // 一次性试用 credits（用完即停）
  | 'preview';         // 预览/Beta 期免费（可能下线）

export type TrialScope = 'all' | 'flagship' | 'fast' | 'specific' | 'none';
export type PriceCurrency = 'USD' | 'CNY';

export interface FreeQuota {
  rpm?: number;
  rpd?: number;
  tpm?: number;
  tokens_per_day?: number;
  tokens_per_month?: number;
  total_credits?: number;
  notes?: string;
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
  price_currency?: PriceCurrency;
  price_unit?: 'per_million_tokens';
  is_free?: boolean;
  capabilities?: string[];
  tags?: string[];
  is_reasoning?: boolean;
  is_multimodal?: boolean;
  has_tool_use?: boolean;
  free_mechanism?: FreeMechanism | null;
  free_quota?: FreeQuota | null;
  trial_scope?: TrialScope;
  model_family?: string;
  model_variant?: string;
  quantization?: string;
  aliases?: string[];
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
  /** Price in {priceCurrency} per 1,000,000 input tokens. undefined = unknown. */
  priceInput?: number;
  /** Price in {priceCurrency} per 1,000,000 output tokens. undefined = unknown. */
  priceOutput?: number;
  priceCurrency?: PriceCurrency;
  isFree?: boolean;
  capabilities?: string[];
  freeMechanism?: FreeMechanism | null;
  freeQuota?: FreeQuota | null;
  trialScope?: TrialScope;
  modelFamily?: string;
  modelVariant?: string;
  quantization?: string;
  aliases?: string[];
  metadata?: Record<string, unknown>;
}

export interface EnhancedModelData extends RawModelData {
  tags: string[];
  isReasoning: boolean;
  isMultimodal: boolean;
  hasToolUse: boolean;
  contextLabel: string;
  freeMechanism: FreeMechanism | null;
  freeQuota: FreeQuota | null;
  trialScope: TrialScope;
  modelFamily: string;
  modelVariant?: string;
  quantization?: string;
  aliases: string[];
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
        price_currency: m.priceCurrency,
        price_unit: m.priceInput !== undefined || m.priceOutput !== undefined ? 'per_million_tokens' as const : undefined,
        is_free: m.isFree,
        capabilities: m.capabilities,
        tags: m.tags,
        is_reasoning: m.isReasoning,
        is_multimodal: m.isMultimodal,
        has_tool_use: m.hasToolUse,
        free_mechanism: m.freeMechanism,
        free_quota: m.freeQuota,
        trial_scope: m.trialScope,
        model_family: m.modelFamily,
        model_variant: m.modelVariant,
        quantization: m.quantization,
        aliases: m.aliases,
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
