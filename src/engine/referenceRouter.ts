import type { SceneState } from './physicsEngine';

export type ReferenceIntent =
  | 'identity_or_object_preservation'
  | 'composition_guidance'
  | 'visual_style_guidance';

export type RequiredReferenceCapability =
  | 'identity_or_object_reference'
  | 'content_reference'
  | 'style_reference';

export interface ReferenceRoute {
  intent: ReferenceIntent;
  requiredCapability: RequiredReferenceCapability;
  sourceId: string;
  role: 'primary_identity' | 'composition_guide' | 'style_guide';
}

export interface ReferencePlan {
  mode: 'none' | 'single-reference';
  hasReference: boolean;
  sourceCount: 0 | 1;
  primaryReferenceId: string | null;
  routes: ReferenceRoute[];
  invariants: string[];
}

const CAPABILITY_BY_INTENT: Record<ReferenceIntent, RequiredReferenceCapability> = {
  identity_or_object_preservation: 'identity_or_object_reference',
  composition_guidance: 'content_reference',
  visual_style_guidance: 'style_reference',
};

const ROLE_BY_INTENT: Record<ReferenceIntent, ReferenceRoute['role']> = {
  identity_or_object_preservation: 'primary_identity',
  composition_guidance: 'composition_guide',
  visual_style_guidance: 'style_guide',
};

const dedupe = <T,>(items: T[]): T[] => [...new Set(items)];

/**
 * Platform-neutral reference router.
 *
 * The current UI exposes one reference image. Its default intent is identity
 * preservation only. Composition/style influence must be explicitly requested
 * by future state/UI additions; they are never inferred from the existence of
 * a face reference.
 */
export function resolveReferencePlan(
  state: Pick<SceneState, 'referenceImageId'>,
  requestedIntents: ReferenceIntent[] = ['identity_or_object_preservation']
): ReferencePlan {
  const sourceId = state.referenceImageId?.trim() || null;

  if (!sourceId) {
    return {
      mode: 'none',
      hasReference: false,
      sourceCount: 0,
      primaryReferenceId: null,
      routes: [],
      invariants: [
        'Do not claim that a reference image is attached when none exists.',
        'Scene physics and environment rules remain independent of reference availability.',
      ],
    };
  }

  const intents = dedupe(requestedIntents);
  const routes = intents.map(intent => ({
    intent,
    requiredCapability: CAPABILITY_BY_INTENT[intent],
    sourceId,
    role: ROLE_BY_INTENT[intent],
  }));

  return {
    mode: 'single-reference',
    hasReference: true,
    sourceCount: 1,
    primaryReferenceId: sourceId,
    routes,
    invariants: [
      'Reference intent does not change camera, lighting, environment, or scene physics.',
      'Identity preservation must not silently become composition guidance.',
      'Identity preservation must not silently become visual-style guidance.',
      'Platform-specific reference syntax belongs only in the Platform Adapter.',
    ],
  };
}

export function hasReferenceIntent(
  plan: ReferencePlan,
  intent: ReferenceIntent
): boolean {
  return plan.routes.some(route => route.intent === intent);
}
