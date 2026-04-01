import { calculateAtkinson } from './atkinson.js';

export function calculateMiller(inputs, isReal = false) {
  const effectiveCompressionRatio = inputs.effective_compression_ratio ?? inputs.r_c_eff ?? inputs.r ?? 7;
  const expansionRatio = inputs.expansion_ratio ?? inputs.r_e ?? 11;
  const adaptedInputs = {
    ...inputs,
    r: effectiveCompressionRatio,
    r_e: expansionRatio,
  };

  const result = calculateAtkinson(adaptedInputs, isReal);
  if (result.error) return result;

  const intakeState = {
    ...result.states[0],
    stateNum: 0,
    component: 'delayed-intake-close',
  };

  return {
    ...result,
    states: [intakeState, ...result.states],
    derived: {
      ...(result.derived || {}),
      cycle_variant: 'miller',
    },
  };
}

