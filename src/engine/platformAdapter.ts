import type { PlatformTarget } from './causalPipeline';
import {
  hasReferenceIntent,
  type ReferencePlan,
} from './referenceRouter';

export interface CapabilityRecord {
  verifiedAt: string;
  sourceUrls: string[];
  notes: string[];
}

export const PLATFORM_CAPABILITY_REGISTRY = {
  midjourney: {
    verifiedAt: '2026-10-08',
    sourceUrls: [
      'https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version',
      'https://docs.midjourney.com/hc/en-us/articles/48495453462797-Edit-Model',
      'https://docs.midjourney.com/hc/en-us/articles/36285124473997-Omni-Reference',
    ],
    defaultVersion: '8.2',
    referenceWorkflows: {
      '8.x': {
        preferred: 'edit_model',
        maxReferenceImages: 4,
      },
      '7': {
        preferred: 'omni_reference',
      },
      '6': {
        preferred: 'character_reference',
        status: 'legacy',
      },
    },
  },
} as const;

const buildReferenceDirective = (
  plan: ReferencePlan,
  target: Exclude<PlatformTarget, 'neutral'>
): string => {
  if (!plan.hasReference) return '';

  const directives: string[] = [];

  if (hasReferenceIntent(plan, 'identity_or_object_preservation')) {
    directives.push(
      target === 'chatgpt'
        ? 'Use the attached reference image only to preserve the recognizable identity and stable subject features.'
        : 'Use the provided reference image only to preserve the recognizable identity and stable subject features.'
    );
  }

  if (hasReferenceIntent(plan, 'composition_guidance')) {
    directives.push(
      'Use the reference as composition guidance only where explicitly requested; do not let it override the resolved scene physics.'
    );
  }

  if (hasReferenceIntent(plan, 'visual_style_guidance')) {
    directives.push(
      'Use the reference as visual-style guidance only where explicitly requested; do not copy unrelated subject identity or scene geometry from it.'
    );
  }

  if (
    hasReferenceIntent(plan, 'identity_or_object_preservation') &&
    !hasReferenceIntent(plan, 'composition_guidance') &&
    !hasReferenceIntent(plan, 'visual_style_guidance')
  ) {
    directives.push(
      'Do not copy the reference image composition, camera angle, lighting, background, clothing, or visual style unless those properties are independently specified by the scene.'
    );
  }

  return directives.join('\n');
};

/**
 * Platform-specific wording only.
 *
 * The neutral prompt and ReferencePlan own intent. This adapter must never
 * change scene physics or infer extra reference purposes.
 *
 * referencePlan is optional only for backward-compatible callers; application
 * prompt paths should pass the SceneManifest reference plan explicitly.
 */
export function adaptPromptToPlatform(
  neutralPrompt: string,
  target: Exclude<PlatformTarget, 'neutral'>,
  referencePlan?: ReferencePlan
): string {
  const clean = neutralPrompt.trim();

  if (!referencePlan) {
    if (target === 'chatgpt') {
      return `You are generating an image based on an attached reference photo.\n\n${clean}`;
    }

    return `Using the provided image as the sole identity reference, generate an image following these physical constraints:\n\n${clean}`;
  }

  if (!referencePlan.hasReference) {
    return clean;
  }

  const referenceDirective = buildReferenceDirective(referencePlan, target);

  if (target === 'chatgpt') {
    return `${referenceDirective}\n\n${clean}`;
  }

  return `${referenceDirective}\n\n${clean}`;
}
