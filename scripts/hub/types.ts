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
  contextLabel: string;
  billingMode: 'free' | 'pay' | 'mixed';
  provider: string;
}

export interface CachedCapabilities {
  tags: string[];
  isReasoning: boolean;
  isMultimodal: boolean;
  contextSize: string;
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
