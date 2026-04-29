export const CAPABILITY_TAXONOMY = [
  'chat',
  'text-generation',
  'reasoning',
  'vision',
  'multimodal',
  'tool-use',
  'function-calling',
  'code-generation',
  'code-editing',
  'embeddings',
  'rerank',
  'speech-recognition',
  'speech-synthesis',
  'image-generation',
  'image-to-image',
  'image-processing',
  'video-generation',
  'video-processing',
  'music-generation',
  '3d-generation',
  'document-processing',
  'web-search',
  'translation',
  'moderation',
  'agentic',
] as const;

export type CapabilityTag = typeof CAPABILITY_TAXONOMY[number];

const SYNONYM_MAP: Record<string, CapabilityTag> = {
  'tool_use': 'tool-use',
  'tools': 'tool-use',
  'tool': 'tool-use',
  'function_calling': 'function-calling',
  'functioncall': 'function-calling',
  'function-call': 'function-calling',
  'code': 'code-generation',
  'codegen': 'code-generation',
  'programming': 'code-generation',
  'completion': 'text-generation',
  'completions': 'text-generation',
  'language-model': 'text-generation',
  'llm': 'text-generation',
  'embedding': 'embeddings',
  'sentence-similarity': 'embeddings',
  'image': 'vision',
  'visual': 'vision',
  'image-understanding': 'vision',
  'image-to-text': 'vision',
  'speech-to-text': 'speech-recognition',
  'asr': 'speech-recognition',
  'tts': 'speech-synthesis',
  'text-to-speech': 'speech-synthesis',
  'voice': 'speech-synthesis',
  'text-to-image': 'image-generation',
  'text-to-video': 'video-generation',
  'image-to-video': 'video-generation',
  'audio-to-video': 'video-processing',
};

const TAXONOMY_SET = new Set<string>(CAPABILITY_TAXONOMY);

export function normalizeCapability(raw: string): CapabilityTag | null {
  if (!raw) return null;
  const cleaned = raw
    .toLowerCase()
    .trim()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-');

  if (TAXONOMY_SET.has(cleaned)) {
    return cleaned as CapabilityTag;
  }
  if (SYNONYM_MAP[cleaned]) {
    return SYNONYM_MAP[cleaned];
  }
  return null;
}

export function normalizeCapabilities(raw: string[]): CapabilityTag[] {
  const result = new Set<CapabilityTag>();
  for (const item of raw) {
    const tag = normalizeCapability(item);
    if (tag) result.add(tag);
  }
  return Array.from(result);
}

export function deriveDerivedTags(tags: CapabilityTag[]): CapabilityTag[] {
  const set = new Set<CapabilityTag>(tags);
  if (set.has('vision') && !set.has('multimodal')) {
    set.add('multimodal');
  }
  if (set.has('reasoning') && !set.has('text-generation')) {
    set.add('text-generation');
  }
  return Array.from(set);
}
