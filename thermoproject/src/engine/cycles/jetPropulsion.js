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

export function calculateJetPropulsion(inputs, isReal = false) {
  try {
    const gas = getGasConstants('air');
    const T_a = toKelvinAuto(inputs.T_1 ?? inputs.T1 ?? 250);
    const P_a = inputs.P_1 ?? inputs.P1 ?? 50;
    const V_0 = inputs.V_0 ?? inputs.V1 ?? 250;
    const r_p = inputs.r_p ?? 12;
    const T_4 = toKelvinAuto(inputs.T_4 ?? inputs.T4 ?? 1400);

    if (T_a <= 0 || T_4 <= 0) return validationError('Temperatures must be positive');
    if (P_a <= 0) return validationError('Ambient pressure must be greater than zero');
    if (r_p <= 1) return validationError('Pressure ratio must exceed 1');

    const exp = (gas.k - 1) / gas.k;

    const T_1 = T_a + (V_0 * V_0) / (2 * 1000 * gas.cp);
    const P_1 = P_a * Math.pow(T_1 / T_a, gas.k / (gas.k - 1));

    const T_2 = T_1 * Math.pow(r_p, exp);
    const P_2 = P_1 * r_p;

    const T_3 = T_4;
    const P_3 = P_2;

    const T_5 = T_3 - (T_2 - T_1);
    const P_5 = P_3 * Math.pow(T_5 / T_3, gas.k / (gas.k - 1));

    const P_6 = P_a;
    const T_6 = T_5 * Math.pow(P_6 / P_5, exp);
    const V_exit = Math.sqrt(Math.max(0, 2 * 1000 * gas.cp * (T_5 - T_6)));

    const s1 = propertyCall(getIdealGasProps, 'air', 'T', T_a, 'P', P_a);
    if (s1.error) return s1;
    const s2 = propertyCall(getIdealGasProps, 'air', 'T', T_1, 'P', P_1);
    if (s2.error) return s2;
    const s3 = propertyCall(getIdealGasProps, 'air', 'T', T_2, 'P', P_2);
    if (s3.error) return s3;
    const s4 = propertyCall(getIdealGasProps, 'air', 'T', T_3, 'P', P_3);
    if (s4.error) return s4;
    const s5 = propertyCall(getIdealGasProps, 'air', 'T', T_5, 'P', P_5);
    if (s5.error) return s5;
    const s6 = propertyCall(getIdealGasProps, 'air', 'T', T_6, 'P', P_6);
    if (s6.error) return s6;

    const W_compressor = s3.h - s2.h;
    const W_turbine = s4.h - s5.h;
    const Q_H = s4.h - s3.h;
    const thrustSpecific = V_exit - V_0;
    const kineticGain = (V_exit * V_exit - V_0 * V_0) / 2000;

    return {
      error: false,
      states: [
        stateFromIdealGas(1, s1, 'ambient'),
        stateFromIdealGas(2, s2, 'diffuser-outlet'),
        stateFromIdealGas(3, s3, 'compressor-outlet'),
        stateFromIdealGas(4, s4, 'combustor-outlet'),
        stateFromIdealGas(5, s5, 'turbine-outlet'),
        stateFromIdealGas(6, s6, 'nozzle-exit'),
      ],
      metrics: metricTemplate({
        eta_thermal: kineticGain / Q_H,
        eta_carnot: 1 - T_a / T_3,
        W_net: W_turbine - W_compressor,
        Q_H,
        Q_L: undefined,
        W_turbine,
        W_compressor,
        BWR: W_compressor / W_turbine,
      }),
      derived: {
        thrust_specific: thrustSpecific,
        V_exit,
      },
      isReal,
    };
  } catch (error) {
    return calculatorError('Jet propulsion', error);
  }
}

