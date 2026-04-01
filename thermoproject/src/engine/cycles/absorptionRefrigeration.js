import { metricTemplate } from './common.js';

export function calculateAbsorptionRefrigeration(inputs, isReal = false) {
  const COP = inputs.COP ?? 0.7;
  const Q_H = inputs.Q_H ?? 100;
  const W_pump = inputs.W_pump ?? 2;
  const Q_L = COP * (Q_H + W_pump);

  return {
    error: false,
    states: [],
    metrics: metricTemplate({
      COP,
      Q_H,
      Q_L,
      W_net: W_pump,
    }),
    schematicOnly: true,
    components: [
      'generator',
      'condenser',
      'expansion-valve',
      'evaporator',
      'absorber',
      'pump',
    ],
    isReal,
  };
}

