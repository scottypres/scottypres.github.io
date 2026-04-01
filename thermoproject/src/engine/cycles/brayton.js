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

export function calculateBrayton(inputs, isReal = false) {
  try {
    const gas = getGasConstants(inputs.substance || 'air');
    const T_1 = toKelvinAuto(inputs.T_1 ?? inputs.T1 ?? 293.15);
    const P_1 = inputs.P_1 ?? inputs.P1 ?? 100;
    const r_p = inputs.r_p ?? inputs.pressure_ratio ?? 8;
    const T_3 = toKelvinAuto(inputs.T_3 ?? inputs.T3 ?? 1073.15);

    if (r_p <= 1) return validationError('Pressure ratio must exceed 1');
    if (T_1 <= 0 || T_3 <= 0) return validationError('Temperatures must be positive');
    if (T_3 <= T_1) return validationError('T_3 must exceed T_1');
    if (P_1 <= 0) return validationError('P_1 must be greater than zero');

    const exponent = (gas.k - 1) / gas.k;
    const T_2 = T_1 * Math.pow(r_p, exponent);
    const P_2 = P_1 * r_p;
    const T_4 = T_3 / Math.pow(r_p, exponent);
    const P_4 = P_1;

    const s1 = propertyCall(getIdealGasProps, gas.id, 'T', T_1, 'P', P_1);
    if (s1.error) return s1;
    const s2 = propertyCall(getIdealGasProps, gas.id, 'T', T_2, 'P', P_2);
    if (s2.error) return s2;
    const s3 = propertyCall(getIdealGasProps, gas.id, 'T', T_3, 'P', P_2);
    if (s3.error) return s3;
    const s4 = propertyCall(getIdealGasProps, gas.id, 'T', T_4, 'P', P_4);
    if (s4.error) return s4;

    const states = [
      stateFromIdealGas(1, s1, 'compressor-inlet'),
      stateFromIdealGas(2, s2, 'compressor-outlet'),
      stateFromIdealGas(3, s3, 'combustor-outlet'),
      stateFromIdealGas(4, s4, 'turbine-outlet'),
    ];

    const W_compressor = s2.h - s1.h;
    const W_turbine = s3.h - s4.h;
    const W_net = W_turbine - W_compressor;
    const Q_H = s3.h - s2.h;
    const Q_L = s4.h - s1.h;
    const eta = W_net / Q_H;

    return {
      error: false,
      states,
      metrics: metricTemplate({
        eta_thermal: eta,
        eta_carnot: 1 - T_1 / T_3,
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
    return calculatorError('Brayton', error);
  }
}

