import { getWaterProps } from '../water.js';
import {
  calculatorError,
  metricTemplate,
  propertyCall,
  stateFromWaterLike,
  toKelvin,
  validationError,
} from './common.js';

export function calculateCogeneration(inputs, isReal = false) {
  try {
    const P_high = inputs.P_high;
    const P_process = inputs.P_process ?? inputs.extraction_pressure;
    const P_low = inputs.P_low;
    const T3 = inputs.T_3 ?? inputs.T3 ?? 500;
    const y = Math.max(0, Math.min(1, inputs.fraction_extracted ?? 0.25));

    if (!Number.isFinite(P_high) || !Number.isFinite(P_process) || !Number.isFinite(P_low)) {
      return validationError('P_high, P_process, and P_low are required');
    }
    if (P_high <= P_process || P_process <= P_low) {
      return validationError('Pressures must satisfy P_high > P_process > P_low');
    }

    const s1 = propertyCall(getWaterProps, 'P', P_low, 'x', 0);
    if (s1.error) return s1;

    const h2s = s1.h + s1.v * (P_high - P_low);
    const etaPump = isReal ? Math.max(0.01, Math.min(1, inputs.eta_pump ?? 0.75)) : 1;
    const h2 = s1.h + (h2s - s1.h) / etaPump;
    const s2 = propertyCall(getWaterProps, 'P', P_high, 'h', h2);
    if (s2.error) return s2;

    const s3 = propertyCall(getWaterProps, 'T', T3, 'P', P_high);
    if (s3.error) return s3;

    const s4s = propertyCall(getWaterProps, 'P', P_process, 's', s3.s);
    if (s4s.error) return s4s;
    const etaTurb = isReal ? Math.max(0.01, Math.min(1, inputs.eta_turbine ?? 0.85)) : 1;
    const h4 = s3.h - etaTurb * (s3.h - s4s.h);
    const s4 = propertyCall(getWaterProps, 'P', P_process, 'h', h4);
    if (s4.error) return s4;

    const s5s = propertyCall(getWaterProps, 'P', P_low, 's', s4.s);
    if (s5s.error) return s5s;
    const h5 = s4.h - etaTurb * (s4.h - s5s.h);
    const s5 = propertyCall(getWaterProps, 'P', P_low, 'h', h5);
    if (s5.error) return s5;

    const processCondensate = propertyCall(getWaterProps, 'P', P_process, 'x', 0);
    if (processCondensate.error) return processCondensate;

    const W_turbine = (s3.h - s4.h) + (1 - y) * (s4.h - s5.h);
    const W_pump = s2.h - s1.h;
    const W_net = W_turbine - W_pump;
    const Q_H = s3.h - s2.h;
    const Q_L = (1 - y) * (s5.h - s1.h);
    const Q_process = y * (s4.h - processCondensate.h);

    return {
      error: false,
      states: [
        stateFromWaterLike(1, s1, 'pump-inlet'),
        stateFromWaterLike(2, s2, 'pump-outlet'),
        stateFromWaterLike(3, s3, 'turbine-inlet'),
        stateFromWaterLike(4, s4, 'extraction-point'),
        stateFromWaterLike(5, s5, 'lp-turbine-outlet'),
      ],
      metrics: metricTemplate({
        eta_thermal: W_net / Q_H,
        eta_carnot: 1 - (toKelvin(s1.T, true) / toKelvin(T3, true)),
        W_net,
        Q_H,
        Q_L,
        W_turbine,
        W_pump,
        W_compressor: W_pump,
      }),
      derived: {
        extraction_fraction: y,
        Q_process,
        utilization_factor: (W_net + Q_process) / Q_H,
      },
      isReal,
    };
  } catch (error) {
    return calculatorError('Cogeneration', error);
  }
}
