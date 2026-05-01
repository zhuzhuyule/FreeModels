/**
 * 历史上参考 OpenAI /v1/models 响应保留的字段集合.
 * `object` / `owned_by` 两个字段已从输出中移除:
 *   - `object` 一直是常量 "model", 无信息
 *   - `owned_by` 一直 ≡ `provider`, 是冗余
 * permission/root/parent 是 OpenAI 规范定义但消费方都没用过, 保留可选.
 */
export interface OpenAIModelObject {
  id: string;
  created: number;
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
  name: string;
  description?: string;
  context_size?: number;
  context_label?: string;
  price_input?: number;
  price_output?: number;
  // price_currency / price_unit 已上提到 ProviderMeta (per-provider 唯一)
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
  /**
   * 推荐的 API base URL (含路径), 例如 "https://api.groq.com/openai/v1".
   * 下游消费方 (如 api-center 网关) 可由此派生 host 做反查关联,
   * 也可作为新建分组时的默认上游填充值.
   */
  apiBaseUrl?: string;
  /** API 协议族, 决定下游网关用哪种 channel 适配. */
  channelType?: 'openai' | 'anthropic' | 'gemini';
  /**
   * Per-provider 统一的定价货币. 上提自 EnhancedModelData.priceCurrency
   * (单 provider 内 100% 同值, 放在每条 model 上是冗余).
   */
  priceCurrency?: 'USD' | 'CNY';
  /**
   * Per-provider 统一的定价单位. 同上, 上提以瘦身 model 数据.
   */
  priceUnit?: 'per_million_tokens';
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
      // 已删除字段 (上提到 providerMeta 或与其他字段 100% 等价):
      //   object        — 全局常量 "model", 无信息
      //   model_id      — 100% ≡ id
      //   owned_by      — 100% ≡ provider
      //   price_currency, price_unit — per-provider 唯一, 上提到 providerMeta
      return {
        id: m.modelId,
        created: Math.floor(Date.now() / 1000) - (models.length - idx),
        provider: m.provider,
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
