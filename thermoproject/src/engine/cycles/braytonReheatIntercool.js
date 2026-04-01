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

export function calculateBraytonReheatIntercool(inputs, isReal = false) {
  try {
    const gas = getGasConstants(inputs.substance || 'air');
    const T_1 = toKelvinAuto(inputs.T_1 ?? inputs.T1 ?? 293.15);
    const P_1 = inputs.P_1 ?? inputs.P1 ?? 100;
    const r_p_total = inputs.r_p ?? 16;
    const T_5 = toKelvinAuto(inputs.T_5 ?? inputs.T5 ?? 1200);
    const T_7 = toKelvinAuto(inputs.T_7 ?? inputs.T7 ?? T_5);

    if (T_1 <= 0 || T_5 <= 0 || T_7 <= 0) return validationError('Temperatures must be positive');
    if (P_1 <= 0) return validationError('P_1 must be greater than zero');
    if (r_p_total <= 1) return validationError('Pressure ratio must exceed 1');

    const stageRatio = Math.sqrt(r_p_total);
    const exp = (gas.k - 1) / gas.k;

    const P_2 = P_1 * stageRatio;
    const T_2 = T_1 * Math.pow(stageRatio, exp);

    const P_3 = P_2;
    const T_3 = T_1;

    const P_4 = P_3 * stageRatio;
    const T_4 = T_3 * Math.pow(stageRatio, exp);

    const P_5 = P_4;

    const P_6 = P_5 / stageRatio;
    const T_6 = T_5 / Math.pow(stageRatio, exp);

    const P_7 = P_6;

    const P_8 = P_1;
    const T_8 = T_7 / Math.pow(stageRatio, exp);

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
    const s6 = propertyCall(getIdealGasProps, gas.id, 'T', T_6, 'P', P_6);
    if (s6.error) return s6;
    const s7 = propertyCall(getIdealGasProps, gas.id, 'T', T_7, 'P', P_7);
    if (s7.error) return s7;
    const s8 = propertyCall(getIdealGasProps, gas.id, 'T', T_8, 'P', P_8);
    if (s8.error) return s8;

    const states = [
      stateFromIdealGas(1, s1, 'lp-compressor-inlet'),
      stateFromIdealGas(2, s2, 'lp-compressor-outlet'),
      stateFromIdealGas(3, s3, 'intercooler-outlet'),
      stateFromIdealGas(4, s4, 'hp-compressor-outlet'),
      stateFromIdealGas(5, s5, 'combustor-outlet'),
      stateFromIdealGas(6, s6, 'hp-turbine-outlet'),
      stateFromIdealGas(7, s7, 'reheater-outlet'),
      stateFromIdealGas(8, s8, 'lp-turbine-outlet'),
    ];

    const W_compressor = (s2.h - s1.h) + (s4.h - s3.h);
    const W_turbine = (s5.h - s6.h) + (s7.h - s8.h);
    const W_net = W_turbine - W_compressor;
    const Q_H = (s5.h - s4.h) + (s7.h - s6.h);
    const Q_L = (s8.h - s1.h) + (s2.h - s3.h);

    return {
      error: false,
      states,
      metrics: metricTemplate({
        eta_thermal: W_net / Q_H,
        eta_carnot: 1 - T_1 / Math.max(T_5, T_7),
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
    return calculatorError('Brayton reheat/intercool', error);
  }
}

