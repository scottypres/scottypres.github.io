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

export function calculateCarnot(inputs, isReal = false) {
  try {
    const gas = getGasConstants(inputs.substance || 'air');
    const T_H = toKelvinAuto(inputs.T_H);
    const T_L = toKelvinAuto(inputs.T_L);
    const P_1 = inputs.P_1 ?? inputs.P1 ?? 100;
    const r = Math.max(1.05, inputs.r ?? 4);

    if (!Number.isFinite(T_H) || !Number.isFinite(T_L)) {
      return validationError('T_H and T_L must be finite temperatures');
    }
    if (T_H <= T_L) {
      return validationError('T_H must exceed T_L');
    }
    if (P_1 <= 0) {
      return validationError('P_1 must be greater than zero');
    }

    const state1Raw = propertyCall(getIdealGasProps, gas.id, 'T', T_H, 'P', P_1);
    if (state1Raw.error) return state1Raw;

    const P_2 = P_1 / r;
    const state2Raw = propertyCall(getIdealGasProps, gas.id, 'T', T_H, 'P', P_2);
    if (state2Raw.error) return state2Raw;

    const P_3 = P_2 * Math.pow(T_L / T_H, gas.k / (gas.k - 1));
    const state3Raw = propertyCall(getIdealGasProps, gas.id, 'T', T_L, 'P', P_3);
    if (state3Raw.error) return state3Raw;

    const P_4 = P_3 * r;
    const state4Raw = propertyCall(getIdealGasProps, gas.id, 'T', T_L, 'P', P_4);
    if (state4Raw.error) return state4Raw;

    const states = [
      stateFromIdealGas(1, state1Raw, 'isothermal-heat-addition'),
      stateFromIdealGas(2, state2Raw, 'isentropic-expansion'),
      stateFromIdealGas(3, state3Raw, 'isothermal-heat-rejection'),
      stateFromIdealGas(4, state4Raw, 'isentropic-compression'),
    ];

    const Q_H = gas.R * T_H * Math.log(r);
    const Q_L = gas.R * T_L * Math.log(r);
    const W_net = Q_H - Q_L;
    const eta = W_net / Q_H;

    return {
      error: false,
      states,
      metrics: metricTemplate({
        eta_thermal: eta,
        eta_carnot: 1 - T_L / T_H,
        W_net,
        Q_H,
        Q_L,
      }),
      isReal,
    };
  } catch (error) {
    return calculatorError('Carnot', error);
  }
}

