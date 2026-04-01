import { getRefrigerantProps } from '../refrigerants.js';
import { getAmmoniaProps } from '../ammonia.js';
import {
  calculatorError,
  metricTemplate,
  propertyCall,
  stateFromWaterLike,
  toKelvin,
  validationError,
} from './common.js';

function normalizeRefrigerant(fluid) {
  const f = String(fluid || 'r134a').toLowerCase();
  if (f === 'r-134a') return 'r134a';
  if (f === 'r-410a') return 'r410a';
  if (f === 'nh3') return 'ammonia';
  return f;
}

function lookupFluid(fluid, prop1, val1, prop2, val2) {
  if (fluid === 'ammonia') {
    return propertyCall(getAmmoniaProps, prop1, val1, prop2, val2);
  }
  return propertyCall(getRefrigerantProps, fluid, prop1, val1, prop2, val2);
}

export function calculateVaporCompression(inputs, isReal = false) {
  try {
    const fluid = normalizeRefrigerant(inputs.refrigerant ?? inputs.fluid ?? 'r134a');
    const T_evap = inputs.T_evap;
    const T_cond = inputs.T_cond;

    if (!Number.isFinite(T_evap) || !Number.isFinite(T_cond)) {
      return validationError('T_evap and T_cond are required');
    }
    if (T_cond <= T_evap) {
      return validationError('T_cond must exceed T_evap');
    }

    const s1 = lookupFluid(fluid, 'T', T_evap, 'x', 1);
    if (s1.error) return s1;
    const satCond = lookupFluid(fluid, 'T', T_cond, 'x', 0);
    if (satCond.error) return satCond;
    const satEvap = lookupFluid(fluid, 'T', T_evap, 'x', 0);
    if (satEvap.error) return satEvap;

    const s2s = lookupFluid(fluid, 'P', satCond.P, 's', s1.s);
    if (s2s.error) return s2s;
    let h2 = s2s.h;
    if (isReal) {
      const etaComp = Math.max(0.01, Math.min(1, inputs.eta_compressor ?? 0.8));
      h2 = s1.h + (s2s.h - s1.h) / etaComp;
    }
    const s2 = lookupFluid(fluid, 'P', satCond.P, 'h', h2);
    if (s2.error) return s2;

    const s3 = satCond;
    const s4 = lookupFluid(fluid, 'P', satEvap.P, 'h', s3.h);
    if (s4.error) return s4;

    const states = [
      stateFromWaterLike(1, s1, 'evaporator-outlet'),
      stateFromWaterLike(2, s2, 'compressor-outlet'),
      stateFromWaterLike(3, s3, 'condenser-outlet'),
      stateFromWaterLike(4, s4, 'expansion-valve-outlet'),
    ];

    const Q_L = s1.h - s4.h;
    const W_compressor = s2.h - s1.h;
    const Q_H = s2.h - s3.h;
    const COP_ref = Q_L / W_compressor;
    const COP_hp = Q_H / W_compressor;

    return {
      error: false,
      states,
      metrics: metricTemplate({
        eta_carnot: toKelvin(T_evap, true) / (toKelvin(T_cond, true) - toKelvin(T_evap, true)),
        W_net: W_compressor,
        Q_H,
        Q_L,
        W_compressor,
        COP: COP_ref,
      }),
      derived: {
        COP_refrigerator: COP_ref,
        COP_heat_pump: COP_hp,
        refrigerant: fluid,
      },
      isReal,
    };
  } catch (error) {
    return calculatorError('Vapor-compression refrigeration', error);
  }
}

export function calculateHeatPump(inputs, isReal = false) {
  const result = calculateVaporCompression(inputs, isReal);
  if (result.error) return result;
  return {
    ...result,
    metrics: {
      ...result.metrics,
      COP: result.derived.COP_heat_pump,
    },
  };
}
