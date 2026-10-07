import type { PlatformTarget } from './causalPipeline';

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

export function adaptPromptToPlatform(
  neutralPrompt: string,
  target: Exclude<PlatformTarget, 'neutral'>
): string {
  const clean = neutralPrompt.trim();

  if (target === 'chatgpt') {
    return `You are generating an image based on an attached reference photo.\n\n${clean}`;
  }

  return `Using the provided image as the sole identity reference, generate an image following these physical constraints:\n\n${clean}`;
}
