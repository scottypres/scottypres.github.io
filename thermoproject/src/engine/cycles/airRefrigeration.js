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

export function calculateAirRefrigeration(inputs, isReal = false) {
  try {
    const gas = getGasConstants('air');
    const r_p = inputs.r_p ?? inputs.pressure_ratio ?? 4;
    const T_1 = toKelvinAuto(inputs.T_1 ?? inputs.T1 ?? 260);
    const T_3 = toKelvinAuto(inputs.T_3 ?? inputs.T3 ?? 300);
    const P_1 = inputs.P_1 ?? inputs.P1 ?? 100;

    if (r_p <= 1) return validationError('Pressure ratio must exceed 1');
    if (T_1 <= 0 || T_3 <= 0) return validationError('Temperatures must be positive');

    const exp = (gas.k - 1) / gas.k;
    const P_2 = P_1 * r_p;
    const T_2 = T_1 * Math.pow(r_p, exp);
    const P_4 = P_1;
    const T_4 = T_3 / Math.pow(r_p, exp);

    const s1 = propertyCall(getIdealGasProps, 'air', 'T', T_1, 'P', P_1);
    if (s1.error) return s1;
    const s2 = propertyCall(getIdealGasProps, 'air', 'T', T_2, 'P', P_2);
    if (s2.error) return s2;
    const s3 = propertyCall(getIdealGasProps, 'air', 'T', T_3, 'P', P_2);
    if (s3.error) return s3;
    const s4 = propertyCall(getIdealGasProps, 'air', 'T', T_4, 'P', P_4);
    if (s4.error) return s4;

    const W_net = (s2.h - s1.h) - (s3.h - s4.h);
    const Q_L = s1.h - s4.h;
    const Q_H = s2.h - s3.h;

    return {
      error: false,
      states: [
        stateFromIdealGas(1, s1, 'compressor-inlet'),
        stateFromIdealGas(2, s2, 'compressor-outlet'),
        stateFromIdealGas(3, s3, 'after-hot-heat-exchanger'),
        stateFromIdealGas(4, s4, 'expander-outlet'),
      ],
      metrics: metricTemplate({
        W_net,
        Q_H,
        Q_L,
        COP: Q_L / W_net,
      }),
      isReal,
    };
  } catch (error) {
    return calculatorError('Air refrigeration', error);
  }
}

