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

export function calculateOtto(inputs, isReal = false) {
  try {
    const gas = getGasConstants(inputs.substance || 'air');
    const r = inputs.r ?? inputs.compression_ratio ?? 8;
    const T_1 = toKelvinAuto(inputs.T_1 ?? inputs.T1 ?? 300);
    const P_1 = inputs.P_1 ?? inputs.P1 ?? 100;
    const Q_in = inputs.Q_in ?? 2000;

    if (r <= 1) return validationError('Compression ratio r must exceed 1');
    if (T_1 <= 0) return validationError('T_1 must be a positive temperature');
    if (P_1 <= 0) return validationError('P_1 must be greater than zero');
    if (Q_in <= 0) return validationError('Q_in must be greater than zero');

    // Isentropic compression 1→2
    let T_2 = T_1 * Math.pow(r, gas.k - 1);
    if (isReal) {
      const eta_c = Math.max(0.01, Math.min(1, inputs.eta_compressor ?? inputs.eta_mechanical ?? 0.85));
      const T_2s = T_2;
      T_2 = T_1 + (T_2s - T_1) / eta_c;
    }
    const P_2 = P_1 * Math.pow(r, gas.k);
    const T_3 = T_2 + Q_in / gas.cv;
    const P_3 = P_2 * (T_3 / T_2);
    // Isentropic expansion 3→4
    let T_4 = T_3 / Math.pow(r, gas.k - 1);
    if (isReal) {
      const eta_e = Math.max(0.01, Math.min(1, inputs.eta_expansion ?? inputs.eta_mechanical ?? 0.85));
      const T_4s = T_4;
      T_4 = T_3 - eta_e * (T_3 - T_4s);
    }
    const P_4 = P_3 / Math.pow(r, gas.k);

    const s1 = propertyCall(getIdealGasProps, gas.id, 'T', T_1, 'P', P_1);
    if (s1.error) return s1;
    const s2 = propertyCall(getIdealGasProps, gas.id, 'T', T_2, 'P', P_2);
    if (s2.error) return s2;
    const s3 = propertyCall(getIdealGasProps, gas.id, 'T', T_3, 'P', P_3);
    if (s3.error) return s3;
    const s4 = propertyCall(getIdealGasProps, gas.id, 'T', T_4, 'P', P_4);
    if (s4.error) return s4;

    const states = [
      stateFromIdealGas(1, s1, 'compression-inlet'),
      stateFromIdealGas(2, s2, 'compression-outlet'),
      stateFromIdealGas(3, s3, 'combustion-outlet'),
      stateFromIdealGas(4, s4, 'expansion-outlet'),
    ];

    const Q_H = gas.cv * (T_3 - T_2);
    const Q_L = gas.cv * (T_4 - T_1);
    const W_net = Q_H - Q_L;
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
      }),
      isReal,
    };
  } catch (error) {
    return calculatorError('Otto', error);
  }
}

