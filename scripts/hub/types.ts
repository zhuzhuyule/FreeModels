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
