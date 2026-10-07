import type { PlatformTarget } from './causalPipeline';
import {
  hasReferenceIntent,
  type ReferencePlan,
} from './referenceRouter';

export type ImagePlatformTarget = Exclude<PlatformTarget, 'neutral'>;

export type PlatformReferenceWorkflow =
  | 'openai_image_input'
  | 'gemini_multimodal_image_input'
  | 'midjourney_edit_model'
  | 'none';

export interface CapabilityRecord {
  verifiedAt: string;
  sourceUrls: string[];
  notes: string[];
}

export interface PlatformAdapterPlan {
  target: ImagePlatformTarget;
  prompt: string;
  recommendedModel: string;
  version?: string;
  referenceWorkflow: PlatformReferenceWorkflow;
  referenceLimit: number | null;
  characterReferenceLimit: number | null;
  requiresReferenceAttachment: boolean;
  parameters: string[];
  verifiedAt: string;
  sourceUrls: string[];
}

export const PLATFORM_CAPABILITY_REGISTRY = {
  chatgpt: {
    verifiedAt: '2026-10-08',
    sourceUrls: [
      'https://developers.openai.com/api/docs/guides/image-generation',
      'https://developers.openai.com/api/docs/guides/tools-image-generation',
      'https://developers.openai.com/api/docs/guides/image-prompting',
    ],
    defaultModel: 'gpt-image-2.5-flare',
    precisionReferenceModel: 'gpt-image-2.5-sunburst',
    referenceWorkflow: 'openai_image_input',
    maxReferenceImages: null,
    notes: [
      'GPT Image accepts image inputs for generation/editing.',
      'Use Sunburst when reference/edit precision matters most; Flare is the faster everyday generation model.',
      'Reference images are supplied separately from prompt text.',
    ],
  },
  gemini: {
    verifiedAt: '2026-10-08',
    sourceUrls: [
      'https://ai.google.dev/gemini-api/docs/image-generation',
      'https://ai.google.dev/gemini-api/docs/gemini-3/',
    ],
    defaultModel: 'gemini-nano-banana-2.1',
    referenceWorkflow: 'gemini_multimodal_image_input',
    maxReferenceImages: 14,
    maxCharacterReferenceImages: 4,
    notes: [
      'Nano Banana 2.1 is the primary high-efficiency image model in the current Gemini image guide.',
      'It supports up to 14 total reference images and up to 4 character-consistency references.',
      'Reference images are supplied as multimodal image inputs, not encoded as prompt syntax.',
    ],
  },
  midjourney: {
    verifiedAt: '2026-10-08',
    sourceUrls: [
      'https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version',
      'https://docs.midjourney.com/hc/en-us/articles/48495453462797-Edit-Model',
      'https://docs.midjourney.com/hc/en-us/articles/32634113811853-Raw',
      'https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List',
    ],
    defaultVersion: '8.2',
    referenceWorkflow: 'midjourney_edit_model',
    maxReferenceImages: 4,
    notes: [
      'V8.2 is the current default Midjourney version.',
      'V8.x uses the Edit Model for reference-based creation instead of Omni Reference or Character Reference.',
      'The Edit Model supports up to 4 reference images.',
      'Raw mode can reduce automatic creative styling and improve literal prompt control.',
    ],
  },
} as const;

const buildIdentityOnlyGuard = (): string =>
  'Do not inherit the reference composition, camera angle, lighting, background, clothing, or visual style unless the resolved scene independently specifies them.';

const buildReferenceDirective = (
  plan: ReferencePlan,
  target: ImagePlatformTarget
): string => {
  if (!plan.hasReference) return '';

  const directives: string[] = [];

  if (hasReferenceIntent(plan, 'identity_or_object_preservation')) {
    if (target === 'chatgpt') {
      directives.push(
        'Use the attached image input only to preserve recognizable identity and stable subject features.'
      );
    } else if (target === 'gemini') {
      directives.push(
        'Use the provided image input only to preserve recognizable identity and stable subject features.'
      );
    } else {
      directives.push(
        'Using the selected Midjourney Edit Model reference, preserve recognizable identity and stable subject features.'
      );
    }
  }

  if (hasReferenceIntent(plan, 'composition_guidance')) {
    directives.push(
      'Use the reference as composition guidance only where explicitly requested; never let it override resolved scene physics.'
    );
  }

  if (hasReferenceIntent(plan, 'visual_style_guidance')) {
    directives.push(
      'Use the reference as visual-style guidance only where explicitly requested; do not copy unrelated identity or scene geometry from it.'
    );
  }

  if (
    hasReferenceIntent(plan, 'identity_or_object_preservation') &&
    !hasReferenceIntent(plan, 'composition_guidance') &&
    !hasReferenceIntent(plan, 'visual_style_guidance')
  ) {
    directives.push(buildIdentityOnlyGuard());
  }

  return directives.join('\n');
};

const midjourneyPrompt = (
  clean: string,
  referenceDirective: string
): string => {
  const body = referenceDirective
    ? `${referenceDirective}\n\n${clean}`
    : clean;

  return `${body}\n\n--v 8.2 --raw`;
};

export function getPlatformCapability(
  target: ImagePlatformTarget
): (typeof PLATFORM_CAPABILITY_REGISTRY)[ImagePlatformTarget] {
  return PLATFORM_CAPABILITY_REGISTRY[target];
}

export function buildPlatformAdapterPlan(
  neutralPrompt: string,
  target: ImagePlatformTarget,
  referencePlan?: ReferencePlan
): PlatformAdapterPlan {
  const clean = neutralPrompt.trim();
  const plan = referencePlan;
  const hasReference = Boolean(plan?.hasReference);
  const referenceDirective = plan
    ? buildReferenceDirective(plan, target)
    : '';

  if (target === 'chatgpt') {
    const capability = PLATFORM_CAPABILITY_REGISTRY.chatgpt;
    const prompt = !plan
      ? `You are generating an image based on an attached reference photo.\n\n${clean}`
      : hasReference
        ? `${referenceDirective}\n\n${clean}`
        : clean;

    return {
      target,
      prompt,
      recommendedModel: hasReference
        ? capability.precisionReferenceModel
        : capability.defaultModel,
      referenceWorkflow: hasReference
        ? 'openai_image_input'
        : 'none',
      referenceLimit: null,
      characterReferenceLimit: null,
      requiresReferenceAttachment: hasReference,
      parameters: [],
      verifiedAt: capability.verifiedAt,
      sourceUrls: [...capability.sourceUrls],
    };
  }

  if (target === 'gemini') {
    const capability = PLATFORM_CAPABILITY_REGISTRY.gemini;
    const prompt = !plan
      ? `Using the provided image as the sole identity reference, generate an image following these physical constraints:\n\n${clean}`
      : hasReference
        ? `${referenceDirective}\n\n${clean}`
        : clean;

    return {
      target,
      prompt,
      recommendedModel: capability.defaultModel,
      referenceWorkflow: hasReference
        ? 'gemini_multimodal_image_input'
        : 'none',
      referenceLimit: capability.maxReferenceImages,
      characterReferenceLimit: capability.maxCharacterReferenceImages,
      requiresReferenceAttachment: hasReference,
      parameters: [],
      verifiedAt: capability.verifiedAt,
      sourceUrls: [...capability.sourceUrls],
    };
  }

  const capability = PLATFORM_CAPABILITY_REGISTRY.midjourney;
  return {
    target,
    prompt: midjourneyPrompt(clean, referenceDirective),
    recommendedModel: `Midjourney V${capability.defaultVersion}`,
    version: capability.defaultVersion,
    referenceWorkflow: hasReference
      ? 'midjourney_edit_model'
      : 'none',
    referenceLimit: capability.maxReferenceImages,
    characterReferenceLimit: capability.maxReferenceImages,
    requiresReferenceAttachment: hasReference,
    parameters: [`--v ${capability.defaultVersion}`, '--raw'],
    verifiedAt: capability.verifiedAt,
    sourceUrls: [...capability.sourceUrls],
  };
}

/**
 * Backward-compatible string adapter.
 *
 * New engine code should prefer buildPlatformAdapterPlan() when it needs
 * capability metadata or reference-workflow instructions.
 */
export function adaptPromptToPlatform(
  neutralPrompt: string,
  target: ImagePlatformTarget,
  referencePlan?: ReferencePlan
): string {
  return buildPlatformAdapterPlan(
    neutralPrompt,
    target,
    referencePlan
  ).prompt;
}
