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

export interface CachedCapabilities {
  tags: string[];
  isReasoning: boolean;
  isMultimodal: boolean;
  contextSize: string;
  updatedAt: string;
}

export interface ModelEntry {
  vendor: string;
  modelId: string;
  name: string;
  description?: string;
  contextSize: string;
  isFree: boolean;
  billingMode: 'free' | 'pay' | 'mixed';
  isReasoning: boolean;
  isMultimodal: boolean;
  capabilities: string[];
  priceInput?: number;
  priceOutput?: number;
  raw: Record<string, unknown>;
}

export type ProviderPlugin = () => Promise<RawModelData[]>;
