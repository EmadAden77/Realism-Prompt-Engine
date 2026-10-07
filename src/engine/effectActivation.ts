export type EffectPolicy =
  | 'required'
  | 'allowed'
  | 'conditional'
  | 'prohibited'
  | 'omit_by_default';

export interface EffectActivationInput {
  policy: EffectPolicy;
  causalTrigger: boolean;
  visible: boolean;
  relevant: boolean;
}

export interface EffectActivationDecision {
  emit: boolean;
  reason:
    | 'prohibited'
    | 'no-causal-trigger'
    | 'not-visible'
    | 'not-relevant'
    | 'omit-by-default'
    | 'emit';
}

export function decideEffectActivation(
  input: EffectActivationInput
): EffectActivationDecision {
  if (input.policy === 'prohibited') {
    return { emit: false, reason: 'prohibited' };
  }
  if (!input.causalTrigger) {
    return { emit: false, reason: 'no-causal-trigger' };
  }
  if (!input.visible) {
    return { emit: false, reason: 'not-visible' };
  }
  if (!input.relevant) {
    return { emit: false, reason: 'not-relevant' };
  }
  if (input.policy === 'omit_by_default') {
    return { emit: false, reason: 'omit-by-default' };
  }

  return { emit: true, reason: 'emit' };
}
