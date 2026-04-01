import { getWaterProps } from '../water.js';
import {
  calculatorError,
  metricTemplate,
  propertyCall,
  stateFromWaterLike,
  toKelvin,
  toCelsius,
  validationError,
} from './common.js';

export function calculateRankine(inputs, isReal = false) {
  try {
    const P_high = inputs.P_high;
    const P_low = inputs.P_low;
    const T_3_C = inputs.T_3 ?? inputs.T3 ?? toCelsius(inputs.T_3_K ?? null);

    if (!Number.isFinite(P_high) || !Number.isFinite(P_low)) {
      return validationError('P_high and P_low are required');
    }
    if (P_high <= P_low) return validationError('Boiler pressure must exceed condenser pressure');
    if (P_high <= 0 || P_low <= 0) return validationError('Pressures must be greater than zero');
    if (!Number.isFinite(T_3_C)) return validationError('T_3 is required');

    const s1 = propertyCall(getWaterProps, 'P', P_low, 'x', 0);
    if (s1.error) return s1;

    const h2s = s1.h + s1.v * (P_high - P_low);
    let h2 = h2s;
    if (isReal) {
      const etaPump = Math.max(0.01, Math.min(1, inputs.eta_pump ?? 0.75));
      h2 = s1.h + (h2s - s1.h) / etaPump;
    }
    const s2 = propertyCall(getWaterProps, 'P', P_high, 'h', h2);
    if (s2.error) return s2;

    const s3 = propertyCall(getWaterProps, 'T', T_3_C, 'P', P_high);
    if (s3.error) return s3;

    const s4s = propertyCall(getWaterProps, 'P', P_low, 's', s3.s);
    if (s4s.error) return s4s;
    let h4 = s4s.h;
    if (isReal) {
      const etaTurb = Math.max(0.01, Math.min(1, inputs.eta_turbine ?? 0.85));
      h4 = s3.h - etaTurb * (s3.h - s4s.h);
    }
    const s4 = propertyCall(getWaterProps, 'P', P_low, 'h', h4);
    if (s4.error) return s4;

    const states = [
      stateFromWaterLike(1, s1, 'pump-inlet'),
      stateFromWaterLike(2, s2, 'pump-outlet'),
      stateFromWaterLike(3, s3, 'boiler-outlet'),
      stateFromWaterLike(4, s4, 'turbine-outlet'),
    ];

    const W_pump = s2.h - s1.h;
    const W_turbine = s3.h - s4.h;
    const W_net = W_turbine - W_pump;
    const Q_H = s3.h - s2.h;
    const Q_L = s4.h - s1.h;
    const T_H = toKelvin(T_3_C, true);
    const T_L = states[0].T;

    return {
      error: false,
      states,
      metrics: metricTemplate({
        eta_thermal: W_net / Q_H,
        eta_carnot: 1 - T_L / T_H,
        W_net,
        Q_H,
        Q_L,
        W_turbine,
        W_pump,
        W_compressor: W_pump,
      }),
      isReal,
    };
  } catch (error) {
    return calculatorError('Rankine', error);
  }
}
