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

export function calculateBraytonRegenerative(inputs, isReal = false) {
  try {
    const gas = getGasConstants(inputs.substance || 'air');
    const T_1 = toKelvinAuto(inputs.T_1 ?? inputs.T1 ?? 293.15);
    const P_1 = inputs.P_1 ?? inputs.P1 ?? 100;
    const r_p = inputs.r_p ?? 8;
    const T_4 = toKelvinAuto(inputs.T_4 ?? inputs.T4 ?? 1073.15);
    const epsilon = Math.min(1, Math.max(0, inputs.epsilon ?? 0.8));

    if (T_1 <= 0 || T_4 <= 0) return validationError('Temperatures must be positive');
    if (T_4 <= T_1) return validationError('T_4 must exceed T_1');
    if (P_1 <= 0) return validationError('P_1 must be greater than zero');
    if (r_p <= 1) return validationError('Pressure ratio must exceed 1');

    const exp = (gas.k - 1) / gas.k;
    const P_2 = P_1 * r_p;
    const T_2 = T_1 * Math.pow(r_p, exp);
    const P_5 = P_1;
    const T_5 = T_4 / Math.pow(r_p, exp);
    const T_3 = T_2 + epsilon * (T_5 - T_2);
    const T_6 = T_5 - (T_3 - T_2);

    const s1 = propertyCall(getIdealGasProps, gas.id, 'T', T_1, 'P', P_1);
    if (s1.error) return s1;
    const s2 = propertyCall(getIdealGasProps, gas.id, 'T', T_2, 'P', P_2);
    if (s2.error) return s2;
    const s3 = propertyCall(getIdealGasProps, gas.id, 'T', T_3, 'P', P_2);
    if (s3.error) return s3;
    const s4 = propertyCall(getIdealGasProps, gas.id, 'T', T_4, 'P', P_2);
    if (s4.error) return s4;
    const s5 = propertyCall(getIdealGasProps, gas.id, 'T', T_5, 'P', P_5);
    if (s5.error) return s5;
    const s6 = propertyCall(getIdealGasProps, gas.id, 'T', T_6, 'P', P_5);
    if (s6.error) return s6;

    const states = [
      stateFromIdealGas(1, s1, 'compressor-inlet'),
      stateFromIdealGas(2, s2, 'compressor-outlet'),
      stateFromIdealGas(3, s3, 'regenerator-cold-outlet'),
      stateFromIdealGas(4, s4, 'combustor-outlet'),
      stateFromIdealGas(5, s5, 'turbine-outlet'),
      stateFromIdealGas(6, s6, 'regenerator-hot-outlet'),
    ];

    const W_compressor = s2.h - s1.h;
    const W_turbine = s4.h - s5.h;
    const W_net = W_turbine - W_compressor;
    const Q_H = s4.h - s3.h;
    const Q_L = s6.h - s1.h;
    const eta = W_net / Q_H;

    return {
      error: false,
      states,
      metrics: metricTemplate({
        eta_thermal: eta,
        eta_carnot: 1 - T_1 / T_4,
        W_net,
        Q_H,
        Q_L,
        W_turbine,
        W_compressor,
        BWR: W_compressor / W_turbine,
      }),
      isReal,
    };
  } catch (error) {
    return calculatorError('Brayton regenerative', error);
  }
}

