import { getIdealGasProps } from '../idealGas.js';
import {
  calculatorError,
  getGasConstants,
  metricTemplate,
  propertyCall,
  stateFromIdealGas,
  toKelvinAuto,
  validationError,
} from './common.js';

export function calculateAtkinson(inputs, isReal = false) {
  try {
    const gas = getGasConstants(inputs.substance || 'air');
    const r = inputs.r ?? inputs.r_c ?? 8;
    const r_e = inputs.r_e ?? 12;
    const T_1 = toKelvinAuto(inputs.T_1 ?? inputs.T1 ?? 300);
    const P_1 = inputs.P_1 ?? inputs.P1 ?? 100;
    const Q_in = inputs.Q_in ?? 1500;

    if (r <= 1 || r_e <= 1) return validationError('Compression and expansion ratios must exceed 1');
    if (r_e < r) return validationError('Expansion ratio r_e should be greater than or equal to r');
    if (P_1 <= 0) return validationError('P_1 must be greater than zero');
    if (Q_in <= 0) return validationError('Q_in must be greater than zero');

    const T_2 = T_1 * Math.pow(r, gas.k - 1);
    const P_2 = P_1 * Math.pow(r, gas.k);
    const T_3 = T_2 + Q_in / gas.cv;
    const P_3 = P_2 * (T_3 / T_2);
    const T_4 = T_3 / Math.pow(r_e, gas.k - 1);
    const P_4 = P_3 / Math.pow(r_e, gas.k);

    const s1 = propertyCall(getIdealGasProps, gas.id, 'T', T_1, 'P', P_1);
    if (s1.error) return s1;
    const s2 = propertyCall(getIdealGasProps, gas.id, 'T', T_2, 'P', P_2);
    if (s2.error) return s2;
    const s3 = propertyCall(getIdealGasProps, gas.id, 'T', T_3, 'P', P_3);
    if (s3.error) return s3;
    const s4 = propertyCall(getIdealGasProps, gas.id, 'T', T_4, 'P', P_4);
    if (s4.error) return s4;

    const Q_H = gas.cv * (T_3 - T_2);
    const Q_L = gas.cp * (T_4 - T_1);
    const W_net = Q_H - Q_L;

    return {
      error: false,
      states: [
        stateFromIdealGas(1, s1, 'compression-inlet'),
        stateFromIdealGas(2, s2, 'compression-outlet'),
        stateFromIdealGas(3, s3, 'heat-addition-outlet'),
        stateFromIdealGas(4, s4, 'expansion-outlet'),
      ],
      metrics: metricTemplate({
        eta_thermal: W_net / Q_H,
        eta_carnot: 1 - T_1 / T_3,
        W_net,
        Q_H,
        Q_L,
      }),
      derived: {
        expansion_ratio: r_e,
      },
      isReal,
    };
  } catch (error) {
    return calculatorError('Atkinson', error);
  }
}

