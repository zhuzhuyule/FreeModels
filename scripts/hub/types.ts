/**
 * 严格 OpenAI /v1/models 响应字段集合.
 *
 * `object` 和 `owned_by` 是 OpenAI 标准必填字段, 之前以"无信息/冗余"为
 * 理由删除过, 但 LobeChat / NextChat / OneAPI 等 standard OpenAI client
 * 会读这两个字段做 UI 分组. 现在 FreeModels 定位为 "OpenAI /v1/models
 * drop-in 数据源", 必须严格输出.
 *
 * permission/root/parent 是 OpenAI 规范定义但消费方都没用过, 保留可选.
 *
 * 同时保留 FreeModels 历史字段 `provider` (与 owned_by 同值), 兼容
 * 现有消费方; 新消费方推荐用 owned_by.
 */
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

/**
 * `created` 字段: OpenAI 规范要求 unix timestamp, 但本项目无法得到模型真实创建时间.
 * 使用 modelId 的 SHA1 前 32 bit 作为稳定哈希 (mod 2_000_000_000 保证不溢出 32-bit signed).
 * 好处: 相同 modelId 每次输出相同 created, 避免 models.json 因每次跑都生成新时间戳
 * 导致 CI 每天产生 noise commit.
 */
function stableCreated(modelId: string): number {
  // 简单 djb2 哈希 (不需要 crypto, 也不需要 import).
  let hash = 5381;
  for (let i = 0; i < modelId.length; i++) {
    hash = ((hash << 5) + hash + modelId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * toCanonicalId 把 FreeModels 内部 modelId (部分 provider 带 "<provider>/"
 * 前缀, 历史命名约定不统一) 归一化为 raw API id —— 即 OpenAI 标准里
 * `data[].id`, 也就是 "POST body.model 直接填的字符串".
 *
 * 规则: 只剥 "<freemodels-provider-id>/" 一层前缀 (不剥 owner 前缀如
 * OpenRouter 的 `qwen/`、NVIDIA 的 `bytedance/`、Groq 的 `openai/`).
 * 保留 OpenRouter `:free` 后缀、Cloudflare `@cf/` 前缀, 它们是调 API 必需.
 *
 * 对照表 (14 个 provider):
 *   bigmodel/glm-4-flash        → glm-4-flash
 *   cerebras/llama3.1-8b        → llama3.1-8b
 *   cloudflare/@cf/openai/x     → @cf/openai/x       (剥 cloudflare/, 保留 @cf/)
 *   cohere/c4ai-aya-32b         → c4ai-aya-32b
 *   gitee/jina-clip-v1          → jina-clip-v1       (gitee 本就 raw)
 *   github/AI21-Jamba           → AI21-Jamba
 *   google/gemini-2.5-flash     → gemini-2.5-flash
 *   groq/openai/gpt-oss-20b     → openai/gpt-oss-20b (剥 groq/, 保留 owner)
 *   longcat/LongCat-Flash-Chat  → LongCat-Flash-Chat
 *   nvidia/...                  → ...                (nvidia 本就 raw, modelId 无前缀)
 *   openrouter/...              → ...                (openrouter 本就 raw, modelId 无前缀)
 *   sambanova/llama3-8b         → llama3-8b
 *   xingchen/xop35qwen2b        → xop35qwen2b
 *   xinghuo/lite                → lite
 */
export function toCanonicalId(provider: string, modelId: string): string {
  const prefix = `${provider.toLowerCase()}/`;
  if (modelId.toLowerCase().startsWith(prefix)) {
    return modelId.slice(prefix.length);
  }
  return modelId;
}

export function toOpenAICompatible(models: EnhancedModelData[]): OpenAICompatibleOutput {
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
    data: models.map((m) => {
      // id 是 raw API id (调 POST body.model 直接填的字符串).
      // 历史上有些 provider 在 modelId 上带 "<provider>/" 前缀, 这里统一剥掉.
      const canonicalId = toCanonicalId(m.provider, m.modelId);
      return {
        id: canonicalId,
        object: 'model' as const,
        created: stableCreated(m.modelId), // 基于内部 modelId, 跨版本稳定
        owned_by: m.provider,
        provider: m.provider,              // 历史字段, 与 owned_by 同值, 保留兼容
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
