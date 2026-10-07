import type { PromptFragment } from './causalPipeline';

export interface CompressionStats {
  originalChars: number;
  compressedChars: number;
  savedChars: number;
  reductionRatio: number;
  transformedFragmentIds: string[];
}

export interface PromptCompressionResult {
  fragments: PromptFragment[];
  stats: CompressionStats;
}

const KNOWLEDGE_COMPACT_TEXT: Record<string, string> = {
  V20_LIGHT_SOURCE_CAUSALITY:
    'Tie every visible highlight, shadow, reflection, color spill, and falloff to an actual scene light; no invisible fill.',
  V20_MIXED_LIGHT_GUARD:
    'If practical lights differ in color or direction, keep their effects localized and distinct; do not invent split-color facial lighting.',
  V20_OUTDOOR_AEROSOL_SCATTERING:
    'Allow faint aerosol scattering only where a plausible bright source crosses visible outdoor dust; no theatrical volumetric beams.',
  V20_INDOOR_MIE_GUARD:
    'No indoor volumetric haze, Tyndall beams, or dust shafts without an explicit visible particulate source.',
  V20_WIND_DIRECTION_SYNC:
    'Hair, loose fabric, foliage, debris, dust, and vapor must respond to one coherent airflow direction and strength.',
  V20_DEPTH_PARALLAX:
    'Preserve near-to-far scale, overlap, and parallax: selfie arm/subject near, background progressively farther.',
  V20_CONTACT_OCCLUSION:
    'Preserve contact shadows and correct occlusion order; no floating hands/objects or impossible intersections.',
  V20_GLASS_LAYERING:
    'Keep glare/reflection tied to the actual glass plane with believable transmission; no floating reflections.',
  V20_MIRROR_GEOMETRY:
    'Keep body, phone, gaze, camera position, handedness cues, and background consistent with one flat mirror plane.',
  V20_REFLECTION_CAUSALITY:
    'Reflections appear only on visible reflective surfaces and from actual scene/light content; strength, blur, and distortion follow the material.',
  V20_MATERIAL_WEAR_RESPONSE:
    'Show garment age only through plausible fabric-specific fold memory, seam softening, pilling, fading, or localized wear; no unrelated damage.',
  V20_LENS_CONTAMINATION:
    'Lens contamination may cause only subtle local micro-contrast loss or source-adjacent flare; never whole-image haze.',
};

const normalizeWhitespace = (text: string): string =>
  text
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+([,.;:])/g, '$1')
    .trim();

const compactSafeBoilerplate = (text: string): string =>
  normalizeWhitespace(text)
    .replace(
      /Authentic everyday Saudi life, strictly NO iconic landmarks or tourist stereotypes\./gi,
      'Authentic everyday Saudi setting; no iconic landmarks or tourist stereotypes.'
    )
    .replace(
      /User controls remain subject to physical FOV limits\./gi,
      'Background controls obey physical FOV limits.'
    )
    .replace(
      /Designed to mimic raw physical photography perfectly\./gi,
      ''
    )
    .replace(
      /Avoid CGI glossy look\./gi,
      'No CGI gloss.'
    )
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\.\s*\./g, '.')
    .trim();

const compactFragment = (input: PromptFragment): PromptFragment => {
  const ruleId = input.provenance.ruleIds[0];
  const knowledgeRuleId = ruleId?.startsWith('V20_') ? ruleId : undefined;
  const mapped = knowledgeRuleId
    ? KNOWLEDGE_COMPACT_TEXT[knowledgeRuleId]
    : undefined;

  return {
    ...input,
    text: compactSafeBoilerplate(mapped || input.text),
    provenance: {
      sceneFacts: [...input.provenance.sceneFacts],
      ruleIds: [...input.provenance.ruleIds],
    },
  };
};

export function compressPromptFragments(
  fragments: PromptFragment[]
): PromptCompressionResult {
  const originalChars = fragments.reduce(
    (sum, item) => sum + item.text.length,
    0
  );
  const compressed = fragments.map(compactFragment);
  const compressedChars = compressed.reduce(
    (sum, item) => sum + item.text.length,
    0
  );

  const transformedFragmentIds = compressed
    .filter((item, index) => item.text !== fragments[index]?.text)
    .map(item => item.id);

  const savedChars = Math.max(0, originalChars - compressedChars);

  return {
    fragments: compressed,
    stats: {
      originalChars,
      compressedChars,
      savedChars,
      reductionRatio:
        originalChars > 0 ? savedChars / originalChars : 0,
      transformedFragmentIds,
    },
  };
}

const normalizeNegativeClause = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Exact-clause deduplication only. It never performs fuzzy semantic deletion.
 * This is deliberately conservative because negatives are safety rails.
 */
export function compressNegativePromptText(text: string): {
  text: string;
  stats: CompressionStats;
} {
  const original = normalizeWhitespace(text);
  const sentences = original
    .split(/(?<=\.)\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const output: string[] = [];

  for (const sentence of sentences) {
    const hasPeriod = sentence.endsWith('.');
    const body = hasPeriod ? sentence.slice(0, -1) : sentence;
    const clauses = body
      .split(',')
      .map(clause => clause.trim())
      .filter(Boolean);

    const kept: string[] = [];
    for (const clause of clauses) {
      const key = normalizeNegativeClause(clause);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      kept.push(clause);
    }

    if (kept.length > 0) {
      output.push(kept.join(', ') + (hasPeriod ? '.' : ''));
    }
  }

  const compressed = normalizeWhitespace(output.join(' '));
  const savedChars = Math.max(0, original.length - compressed.length);

  return {
    text: compressed,
    stats: {
      originalChars: original.length,
      compressedChars: compressed.length,
      savedChars,
      reductionRatio:
        original.length > 0 ? savedChars / original.length : 0,
      transformedFragmentIds: [],
    },
  };
}
