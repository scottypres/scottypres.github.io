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

export function calculateStirling(inputs, isReal = false) {
  try {
    const gas = getGasConstants(inputs.substance || 'air');
    const T_L = toKelvinAuto(inputs.T_L ?? 300);
    const T_H = toKelvinAuto(inputs.T_H ?? 900);
    const P_1 = inputs.P_1 ?? inputs.P1 ?? 100;
    const r = inputs.r ?? ((inputs.V_max && inputs.V_min) ? (inputs.V_max / inputs.V_min) : 4);

    if (T_H <= T_L) return validationError('T_H must exceed T_L');
    if (P_1 <= 0) return validationError('P_1 must be greater than zero');
    if (r <= 1) return validationError('Compression ratio must exceed 1');

    const s1 = propertyCall(getIdealGasProps, gas.id, 'T', T_L, 'P', P_1);
    if (s1.error) return s1;
    const s2 = propertyCall(getIdealGasProps, gas.id, 'T', T_L, 'P', P_1 * r);
    if (s2.error) return s2;
    const s3 = propertyCall(getIdealGasProps, gas.id, 'T', T_H, 'P', s2.P * (T_H / T_L));
    if (s3.error) return s3;
    const s4 = propertyCall(getIdealGasProps, gas.id, 'T', T_H, 'P', s3.P / r);
    if (s4.error) return s4;

    const W_net = gas.R * (T_H - T_L) * Math.log(r);
    const Q_H = gas.R * T_H * Math.log(r);
    const Q_L = gas.R * T_L * Math.log(r);

    return {
      error: false,
      states: [
        stateFromIdealGas(1, s1, 'isothermal-compression-start'),
        stateFromIdealGas(2, s2, 'isothermal-compression-end'),
        stateFromIdealGas(3, s3, 'constant-volume-heat-addition-end'),
        stateFromIdealGas(4, s4, 'isothermal-expansion-end'),
      ],
      metrics: metricTemplate({
        eta_thermal: W_net / Q_H,
        eta_carnot: 1 - T_L / T_H,
        W_net,
        Q_H,
        Q_L,
      }),
      isReal,
    };
  } catch (error) {
    return calculatorError('Stirling', error);
  }
}

