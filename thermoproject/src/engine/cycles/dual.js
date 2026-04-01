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

export function calculateDual(inputs, isReal = false) {
  try {
    const gas = getGasConstants(inputs.substance || 'air');
    const T_1 = toKelvinAuto(inputs.T_1 ?? inputs.T1 ?? 300);
    const P_1 = inputs.P_1 ?? inputs.P1 ?? 100;
    const r = inputs.r ?? 16;
    const r_p = inputs.r_p ?? 1.3;
    const Q_in = inputs.Q_in ?? 1500;

    if (P_1 <= 0) return validationError('P_1 must be greater than zero');
    if (r <= 1) return validationError('Compression ratio must exceed 1');
    if (r_p < 1) return validationError('Pressure ratio r_p must be at least 1');
    if (Q_in <= 0) return validationError('Q_in must be greater than zero');

    const T_2 = T_1 * Math.pow(r, gas.k - 1);
    const P_2 = P_1 * Math.pow(r, gas.k);
    const T_3 = T_2 * r_p;
    const P_3 = P_2 * r_p;

    const Q_23 = gas.cv * (T_3 - T_2);
    const Q_34 = Math.max(0, Q_in - Q_23);
    const T_4 = T_3 + Q_34 / gas.cp;
    const P_4 = P_3;

    const expansionRatio = r / (T_4 / T_3);
    const T_5 = T_4 / Math.pow(expansionRatio, gas.k - 1);
    const P_5 = P_4 / Math.pow(expansionRatio, gas.k);

    const s1 = propertyCall(getIdealGasProps, gas.id, 'T', T_1, 'P', P_1);
    if (s1.error) return s1;
    const s2 = propertyCall(getIdealGasProps, gas.id, 'T', T_2, 'P', P_2);
    if (s2.error) return s2;
    const s3 = propertyCall(getIdealGasProps, gas.id, 'T', T_3, 'P', P_3);
    if (s3.error) return s3;
    const s4 = propertyCall(getIdealGasProps, gas.id, 'T', T_4, 'P', P_4);
    if (s4.error) return s4;
    const s5 = propertyCall(getIdealGasProps, gas.id, 'T', T_5, 'P', P_5);
    if (s5.error) return s5;

    const Q_H = Q_23 + gas.cp * (T_4 - T_3);
    const Q_L = gas.cv * (T_5 - T_1);
    const W_net = Q_H - Q_L;

    return {
      error: false,
      states: [
        stateFromIdealGas(1, s1, 'compression-inlet'),
        stateFromIdealGas(2, s2, 'compression-outlet'),
        stateFromIdealGas(3, s3, 'cv-heat-addition-end'),
        stateFromIdealGas(4, s4, 'cp-heat-addition-end'),
        stateFromIdealGas(5, s5, 'expansion-outlet'),
      ],
      metrics: metricTemplate({
        eta_thermal: W_net / Q_H,
        eta_carnot: 1 - T_1 / T_4,
        W_net,
        Q_H,
        Q_L,
      }),
      derived: {
        q_cv: Q_23,
        q_cp: gas.cp * (T_4 - T_3),
      },
      isReal,
    };
  } catch (error) {
    return calculatorError('Dual', error);
  }
}

