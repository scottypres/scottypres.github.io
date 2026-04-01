/**
 * Master property lookup that routes to the correct substance engine
 * based on the substance identifier.
 */

import { getWaterProps } from './water.js';
import { getRefrigerantProps } from './refrigerants.js';
import { getIdealGasProps } from './idealGas.js';
import { IDEAL_GASES, PHASE, SUBSTANCES } from './constants.js';

// Refrigerant substance ids
const REFRIGERANTS = ['r134a', 'r410a', 'ammonia'];

// Valid input pairs per substance category
const IDEAL_GAS_INPUT_PAIRS = [
  ['T', 'P'],
  ['T', 'v'],
  ['P', 'v'],
];

const TABLE_SUBSTANCE_INPUT_PAIRS = [
  ['T', 'P'],
  ['T', 'v'],
  ['T', 'x'],
  ['T', 'h'],
  ['T', 's'],
  ['P', 'v'],
  ['P', 'x'],
  ['P', 'h'],
  ['P', 's'],
];

/**
 * Saturation properties for water at key boundary conditions.
 * These are approximate values used for phase determination.
 * In a full implementation these would come from the steam tables module.
 */
const WATER_SAT_APPROX = {
  // Temperature range for saturation data: 0.01 C to 373.946 C (critical)
  T_min: 0.01,
  T_max: 373.946,
  P_min: 0.6113,    // kPa at triple point
  P_max: 22064,     // kPa at critical point

  /**
   * Approximate saturation pressure from temperature (Antoine-style fit).
   * Valid roughly 0-374 C. Returns kPa.
   */
  Psat(T_celsius) {
    // Simple approximation using Clausius-Clapeyron inspired form
    // For more accuracy the actual steam tables should be used.
    if (T_celsius <= 0.01) return 0.6113;
    if (T_celsius >= 373.946) return 22064;
    // Antoine equation constants for water (approximation)
    const A = 8.07131;
    const B = 1730.63;
    const C = 233.426;
    // Antoine gives log10(P_mmHg)
    const log10P_mmHg = A - B / (C + T_celsius);
    const P_mmHg = Math.pow(10, log10P_mmHg);
    return P_mmHg * 0.133322; // convert mmHg to kPa
  },

  /**
   * Approximate saturation temperature from pressure.
   * Inverts the Antoine equation. Returns degrees C.
   */
  Tsat(P_kPa) {
    if (P_kPa <= 0.6113) return 0.01;
    if (P_kPa >= 22064) return 373.946;
    const P_mmHg = P_kPa / 0.133322;
    const A = 8.07131;
    const B = 1730.63;
    const C = 233.426;
    const log10P = Math.log10(P_mmHg);
    return B / (A - log10P) - C;
  },
};

/**
 * Determine the phase region of water given available properties.
 *
 * @param {number|null} T - Temperature in degrees C (or null if unknown)
 * @param {number|null} P - Pressure in kPa (or null if unknown)
 * @param {number|null} v - Specific volume in m³/kg (or null if unknown)
 * @returns {{ phase: string, T_sat?: number, P_sat?: number }}
 */
export function determinePhaseWater(T, P, v) {
  const result = {};

  // If we have both T and P, compare P to P_sat(T)
  if (T !== null && T !== undefined && P !== null && P !== undefined) {
    // Check supercritical
    if (T > 373.946 && P > 22064) {
      result.phase = PHASE.SUPERCRITICAL;
      return result;
    }

    // If T is above the critical temperature but P is below critical
    if (T > 373.946) {
      result.phase = PHASE.SUPERHEATED_VAPOR;
      return result;
    }

    // If P is above critical but T is below critical
    if (P > 22064) {
      result.phase = PHASE.COMPRESSED_LIQUID;
      return result;
    }

    const P_sat = WATER_SAT_APPROX.Psat(T);
    result.P_sat = P_sat;
    result.T_sat = T;

    const tolerance = P_sat * 0.001; // 0.1% tolerance

    if (Math.abs(P - P_sat) < tolerance) {
      // On the saturation curve -- need quality or v to distinguish
      if (v !== null && v !== undefined) {
        // Would need v_f and v_g to determine quality; approximate:
        // At saturation, if v is very small it's saturated liquid, if large it's saturated vapor
        result.phase = PHASE.TWO_PHASE;
      } else {
        result.phase = PHASE.TWO_PHASE; // Cannot determine without more info
      }
    } else if (P > P_sat) {
      result.phase = PHASE.COMPRESSED_LIQUID;
    } else {
      result.phase = PHASE.SUPERHEATED_VAPOR;
    }

    return result;
  }

  // If we only have T, estimate P_sat
  if (T !== null && T !== undefined) {
    if (T > 373.946) {
      result.phase = PHASE.SUPERCRITICAL;
    }
    result.P_sat = WATER_SAT_APPROX.Psat(T);
    result.T_sat = T;
    // Cannot fully determine phase without a second property
    return result;
  }

  // If we only have P, estimate T_sat
  if (P !== null && P !== undefined) {
    if (P > 22064) {
      result.phase = PHASE.SUPERCRITICAL;
    }
    result.T_sat = WATER_SAT_APPROX.Tsat(P);
    result.P_sat = P;
    return result;
  }

  // If we only have v (unusual), we cannot determine phase reliably
  if (v !== null && v !== undefined) {
    // Very rough heuristic
    if (v < 0.001) {
      result.phase = PHASE.COMPRESSED_LIQUID;
    } else if (v > 10) {
      result.phase = PHASE.SUPERHEATED_VAPOR;
    } else {
      result.phase = PHASE.TWO_PHASE;
    }
    return result;
  }

  throw new Error('At least one property (T, P, or v) must be provided');
}

/**
 * Returns the valid input property pairs for a given substance.
 *
 * @param {string} substanceId - The substance identifier (e.g. 'water', 'air', 'r134a')
 * @returns {Array<[string, string]>} Array of valid [prop1, prop2] pairs
 */
export function getAvailableInputPairs(substanceId) {
  if (IDEAL_GASES.includes(substanceId)) {
    return IDEAL_GAS_INPUT_PAIRS;
  }
  if (substanceId === 'water' || REFRIGERANTS.includes(substanceId)) {
    return TABLE_SUBSTANCE_INPUT_PAIRS;
  }
  throw new Error(`Unknown substance: "${substanceId}"`);
}

/**
 * Master property lookup. Routes to the correct substance engine based
 * on the substance identifier and returns a complete property state.
 *
 * @param {string} substanceId  - Substance identifier (e.g. 'water', 'air', 'r134a')
 * @param {string} prop1Name    - First input property name
 * @param {number} prop1Value   - First input property value
 * @param {string} prop2Name    - Second input property name
 * @param {number} prop2Value   - Second input property value
 * @returns {{ T: number, P: number, v: number, h: number, s: number, u: number,
 *             x: number|null, phase: string, substance: string }}
 */
export function lookupProperties(substanceId, prop1Name, prop1Value, prop2Name, prop2Value) {
  const substanceInfo = SUBSTANCES[substanceId];
  if (!substanceInfo) {
    throw new Error(`Unknown substance: "${substanceId}"`);
  }

  // Validate input pair
  const validPairs = getAvailableInputPairs(substanceId);
  const pairValid = validPairs.some(
    ([a, b]) =>
      (prop1Name === a && prop2Name === b) ||
      (prop1Name === b && prop2Name === a)
  );
  if (!pairValid) {
    throw new Error(
      `Invalid input pair ("${prop1Name}", "${prop2Name}") for substance "${substanceId}". ` +
      `Valid pairs: ${validPairs.map(p => p.join('-')).join(', ')}`
    );
  }

  // Route to the correct engine
  if (IDEAL_GASES.includes(substanceId)) {
    return lookupIdealGas(substanceId, prop1Name, prop1Value, prop2Name, prop2Value);
  }

  if (substanceId === 'water') {
    return lookupWater(substanceId, prop1Name, prop1Value, prop2Name, prop2Value);
  }

  if (REFRIGERANTS.includes(substanceId)) {
    return lookupRefrigerant(substanceId, prop1Name, prop1Value, prop2Name, prop2Value);
  }

  throw new Error(`No engine available for substance: "${substanceId}"`);
}

/**
 * Ideal gas property lookup.
 * @private
 */
function lookupIdealGas(substanceId, prop1Name, prop1Value, prop2Name, prop2Value) {
  const state = getIdealGasProps(substanceId, prop1Name, prop1Value, prop2Name, prop2Value);

  return {
    T: state.T,
    P: state.P,
    v: state.v,
    h: state.h,
    s: state.s,
    u: state.u,
    x: null,                          // quality not applicable for ideal gases
    phase: PHASE.SUPERHEATED_VAPOR,   // ideal gases are always in vapor phase
    substance: substanceId,
  };
}

/**
 * Water property lookup via the water engine.
 * @private
 */
function lookupWater(substanceId, prop1Name, prop1Value, prop2Name, prop2Value) {
  const state = getWaterProps(prop1Name, prop1Value, prop2Name, prop2Value);

  // Determine phase if not already provided by the water engine
  let phase = state.phase || null;
  if (!phase) {
    const T_c = state.T !== undefined ? state.T : null;
    const P_c = state.P !== undefined ? state.P : null;
    const v_c = state.v !== undefined ? state.v : null;
    const phaseResult = determinePhaseWater(T_c, P_c, v_c);
    phase = phaseResult.phase || PHASE.TWO_PHASE;
  }

  return {
    T: state.T,
    P: state.P,
    v: state.v,
    h: state.h,
    s: state.s,
    u: state.u !== undefined ? state.u : (state.h - state.P * state.v),
    x: state.x !== undefined ? state.x : null,
    phase,
    substance: substanceId,
  };
}

/**
 * Refrigerant property lookup via the refrigerants engine.
 * @private
 */
function lookupRefrigerant(substanceId, prop1Name, prop1Value, prop2Name, prop2Value) {
  const state = getRefrigerantProps(substanceId, prop1Name, prop1Value, prop2Name, prop2Value);

  // Determine phase from quality if available
  let phase = state.phase || null;
  if (!phase) {
    if (state.x !== undefined && state.x !== null) {
      if (state.x <= 0) {
        phase = PHASE.SATURATED_LIQUID;
      } else if (state.x >= 1) {
        phase = PHASE.SATURATED_VAPOR;
      } else {
        phase = PHASE.TWO_PHASE;
      }
    } else {
      phase = PHASE.SUPERHEATED_VAPOR;
    }
  }

  return {
    T: state.T,
    P: state.P,
    v: state.v,
    h: state.h,
    s: state.s,
    u: state.u !== undefined ? state.u : (state.h - state.P * state.v),
    x: state.x !== undefined ? state.x : null,
    phase,
    substance: substanceId,
  };
}
