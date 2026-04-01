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

export function calculateEricsson(inputs, isReal = false) {
  try {
    const gas = getGasConstants(inputs.substance || 'air');
    const T_L = toKelvinAuto(inputs.T_L ?? 300);
    const T_H = toKelvinAuto(inputs.T_H ?? 900);
    const P_1 = inputs.P_1 ?? inputs.P1 ?? 100;
    const r_p = inputs.r_p ?? 6;

    if (T_H <= T_L) return validationError('T_H must exceed T_L');
    if (P_1 <= 0) return validationError('P_1 must be greater than zero');
    if (r_p <= 1) return validationError('Pressure ratio must exceed 1');

    const P_2 = P_1 * r_p;
    const P_3 = P_2;
    const P_4 = P_1;

    const s1 = propertyCall(getIdealGasProps, gas.id, 'T', T_L, 'P', P_1);
    if (s1.error) return s1;
    const s2 = propertyCall(getIdealGasProps, gas.id, 'T', T_L, 'P', P_2);
    if (s2.error) return s2;
    const s3 = propertyCall(getIdealGasProps, gas.id, 'T', T_H, 'P', P_3);
    if (s3.error) return s3;
    const s4 = propertyCall(getIdealGasProps, gas.id, 'T', T_H, 'P', P_4);
    if (s4.error) return s4;

    const Q_H = gas.R * T_H * Math.log(r_p);
    const Q_L = gas.R * T_L * Math.log(r_p);
    const W_net = Q_H - Q_L;

    return {
      error: false,
      states: [
        stateFromIdealGas(1, s1, 'isothermal-compression-start'),
        stateFromIdealGas(2, s2, 'isothermal-compression-end'),
        stateFromIdealGas(3, s3, 'isobaric-heating-end'),
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
    return calculatorError('Ericsson', error);
  }
}

