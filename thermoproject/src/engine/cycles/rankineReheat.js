import { getWaterProps } from '../water.js';
import {
  calculatorError,
  metricTemplate,
  propertyCall,
  stateFromWaterLike,
  toKelvin,
  validationError,
} from './common.js';

export function calculateRankineReheat(inputs, isReal = false) {
  try {
    const P_high = inputs.P_high;
    const P_reheat = inputs.P_reheat;
    const P_low = inputs.P_low;
    const T3 = inputs.T_3 ?? inputs.T3 ?? 500;
    const T5 = inputs.T_5 ?? inputs.T5 ?? T3;

    if (!Number.isFinite(P_high) || !Number.isFinite(P_reheat) || !Number.isFinite(P_low)) {
      return validationError('P_high, P_reheat, and P_low are required');
    }
    if (P_high <= P_reheat || P_reheat <= P_low) {
      return validationError('Pressures must satisfy P_high > P_reheat > P_low');
    }

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

    const s3 = propertyCall(getWaterProps, 'T', T3, 'P', P_high);
    if (s3.error) return s3;
    const s4s = propertyCall(getWaterProps, 'P', P_reheat, 's', s3.s);
    if (s4s.error) return s4s;

    let h4 = s4s.h;
    if (isReal) {
      const etaTurb = Math.max(0.01, Math.min(1, inputs.eta_turbine ?? 0.85));
      h4 = s3.h - etaTurb * (s3.h - s4s.h);
    }
    const s4 = propertyCall(getWaterProps, 'P', P_reheat, 'h', h4);
    if (s4.error) return s4;

    const s5 = propertyCall(getWaterProps, 'T', T5, 'P', P_reheat);
    if (s5.error) return s5;
    const s6s = propertyCall(getWaterProps, 'P', P_low, 's', s5.s);
    if (s6s.error) return s6s;

    let h6 = s6s.h;
    if (isReal) {
      const etaTurb = Math.max(0.01, Math.min(1, inputs.eta_turbine ?? 0.85));
      h6 = s5.h - etaTurb * (s5.h - s6s.h);
    }
    const s6 = propertyCall(getWaterProps, 'P', P_low, 'h', h6);
    if (s6.error) return s6;

    const states = [
      stateFromWaterLike(1, s1, 'pump-inlet'),
      stateFromWaterLike(2, s2, 'pump-outlet'),
      stateFromWaterLike(3, s3, 'hp-turbine-inlet'),
      stateFromWaterLike(4, s4, 'hp-turbine-outlet'),
      stateFromWaterLike(5, s5, 'lp-turbine-inlet'),
      stateFromWaterLike(6, s6, 'lp-turbine-outlet'),
    ];

    const W_pump = s2.h - s1.h;
    const W_turbine = (s3.h - s4.h) + (s5.h - s6.h);
    const W_net = W_turbine - W_pump;
    const Q_H = (s3.h - s2.h) + (s5.h - s4.h);
    const Q_L = s6.h - s1.h;

    return {
      error: false,
      states,
      metrics: metricTemplate({
        eta_thermal: W_net / Q_H,
        eta_carnot: 1 - states[0].T / Math.max(toKelvin(T3, true), toKelvin(T5, true)),
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
    return calculatorError('Rankine reheat', error);
  }
}
