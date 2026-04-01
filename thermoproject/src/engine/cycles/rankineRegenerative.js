import { getWaterProps } from '../water.js';
import {
  calculatorError,
  metricTemplate,
  propertyCall,
  stateFromWaterLike,
  toKelvin,
  validationError,
} from './common.js';

export function calculateRankineRegenerative(inputs, isReal = false) {
  try {
    const P_high = inputs.P_high;
    const P_bleed = inputs.P_bleed;
    const P_low = inputs.P_low;
    const T_turbine = inputs.T_3 ?? inputs.T3 ?? inputs.T_5 ?? inputs.T5 ?? 350;

    if (!Number.isFinite(P_high) || !Number.isFinite(P_bleed) || !Number.isFinite(P_low)) {
      return validationError('P_high, P_bleed, and P_low are required');
    }
    if (P_high <= P_bleed || P_bleed <= P_low) {
      return validationError('Pressures must satisfy P_high > P_bleed > P_low');
    }

    const s1 = propertyCall(getWaterProps, 'P', P_low, 'x', 0);
    if (s1.error) return s1;

    const h2s = s1.h + s1.v * (P_bleed - P_low);
    const etaPump = isReal ? Math.max(0.01, Math.min(1, inputs.eta_pump ?? 0.75)) : 1;
    const h2 = s1.h + (h2s - s1.h) / etaPump;
    const s2 = propertyCall(getWaterProps, 'P', P_bleed, 'h', h2);
    if (s2.error) return s2;

    const s3 = propertyCall(getWaterProps, 'P', P_bleed, 'x', 0);
    if (s3.error) return s3;

    const h4s = s3.h + s3.v * (P_high - P_bleed);
    const h4 = s3.h + (h4s - s3.h) / etaPump;
    const s4 = propertyCall(getWaterProps, 'P', P_high, 'h', h4);
    if (s4.error) return s4;

    const s5 = propertyCall(getWaterProps, 'T', T_turbine, 'P', P_high);
    if (s5.error) return s5;

    const s6s = propertyCall(getWaterProps, 'P', P_bleed, 's', s5.s);
    if (s6s.error) return s6s;
    const etaTurb = isReal ? Math.max(0.01, Math.min(1, inputs.eta_turbine ?? 0.85)) : 1;
    const h6 = s5.h - etaTurb * (s5.h - s6s.h);
    const s6 = propertyCall(getWaterProps, 'P', P_bleed, 'h', h6);
    if (s6.error) return s6;

    const s7s = propertyCall(getWaterProps, 'P', P_low, 's', s6.s);
    if (s7s.error) return s7s;
    const h7 = s6.h - etaTurb * (s6.h - s7s.h);
    const s7 = propertyCall(getWaterProps, 'P', P_low, 'h', h7);
    if (s7.error) return s7;

    const denominator = s6.h - s2.h;
    const y = denominator !== 0 ? (s3.h - s2.h) / denominator : 0;
    const yClamped = Math.max(0, Math.min(1, y));

    const W_turbine = (s5.h - s6.h) + (1 - yClamped) * (s6.h - s7.h);
    const W_pump = (1 - yClamped) * (s2.h - s1.h) + (s4.h - s3.h);
    const W_net = W_turbine - W_pump;
    const Q_H = s5.h - s4.h;
    const Q_L = (1 - yClamped) * (s7.h - s1.h);

    const states = [
      stateFromWaterLike(1, s1, 'condenser-outlet'),
      stateFromWaterLike(2, s2, 'pump-1-outlet'),
      stateFromWaterLike(3, s3, 'fwh-outlet'),
      stateFromWaterLike(4, s4, 'pump-2-outlet'),
      stateFromWaterLike(5, s5, 'turbine-inlet'),
      stateFromWaterLike(6, s7, 'lp-turbine-outlet'),
    ];

    return {
      error: false,
      states,
      metrics: metricTemplate({
        eta_thermal: W_net / Q_H,
        eta_carnot: 1 - states[0].T / toKelvin(T_turbine, true),
        W_net,
        Q_H,
        Q_L,
        W_turbine,
        W_pump,
        W_compressor: W_pump,
      }),
      derived: {
        bleed_fraction: yClamped,
        bleed_state: stateFromWaterLike(6, s6, 'bleed-state'),
      },
      isReal,
    };
  } catch (error) {
    return calculatorError('Rankine regenerative', error);
  }
}
