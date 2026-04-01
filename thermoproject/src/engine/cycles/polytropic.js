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

export function calculatePolytropic(inputs, isReal = false) {
  try {
    const gas = getGasConstants(inputs.substance || 'air');
    const n = inputs.n ?? 1;
    const T_1 = toKelvinAuto(inputs.T_1 ?? inputs.T1 ?? 300);
    const P_1 = inputs.P_1 ?? inputs.P1 ?? 100;
    const P_2 = inputs.P_2 ?? inputs.P2 ?? P_1;

    if (!Number.isFinite(T_1) || T_1 <= 0) return validationError('T_1 must be a positive temperature');
    if (!Number.isFinite(P_1) || P_1 <= 0) return validationError('P_1 must be greater than zero');
    if (!Number.isFinite(P_2) || P_2 <= 0) return validationError('P_2 must be greater than zero');
    if (!Number.isFinite(n)) return validationError('Polytropic exponent n must be finite');

    let T_2;
    if (Math.abs(n) < 1e-9) {
      T_2 = toKelvinAuto(inputs.T_2 ?? inputs.T2 ?? T_1);
    } else if (Math.abs(n - 1) < 1e-9) {
      T_2 = T_1;
    } else {
      T_2 = T_1 * Math.pow(P_2 / P_1, (n - 1) / n);
    }

    const state1Raw = propertyCall(getIdealGasProps, gas.id, 'T', T_1, 'P', P_1);
    if (state1Raw.error) return state1Raw;
    const state2Raw = propertyCall(getIdealGasProps, gas.id, 'T', T_2, 'P', P_2);
    if (state2Raw.error) return state2Raw;

    const states = [
      stateFromIdealGas(1, state1Raw, 'inlet'),
      stateFromIdealGas(2, state2Raw, 'outlet'),
    ];

    let W;
    if (Math.abs(n - 1) < 1e-9) {
      W = gas.R * T_1 * Math.log(P_1 / P_2);
    } else {
      W = (gas.R * (T_2 - T_1)) / (1 - n);
    }
    const deltaU = gas.cv * (T_2 - T_1);
    const Q = deltaU + W;
    const deltaS = gas.cp * Math.log(T_2 / T_1) - gas.R * Math.log(P_2 / P_1);

    return {
      error: false,
      states,
      metrics: metricTemplate({
        W_net: W,
        Q_H: Q > 0 ? Q : undefined,
        Q_L: Q < 0 ? -Q : undefined,
      }),
      process: {
        n,
        delta_u: deltaU,
        delta_s: deltaS,
        heat_transfer: Q,
        work: W,
      },
      isReal,
    };
  } catch (error) {
    return calculatorError('Polytropic process', error);
  }
}

