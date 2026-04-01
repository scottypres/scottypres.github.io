/**
 * Ideal gas property calculations for the CycleViz thermodynamic engine.
 * Assumes constant specific heats (cold-air-standard assumptions).
 */

import { AIR, NITROGEN, CO2, METHANE, SUBSTANCES } from './constants.js';

// Reference state
const T_REF = 298.15; // K
const P_REF = 100;    // kPa
const H_REF = 0;      // kJ/kg
const S_REF = 0;      // kJ/(kg·K)

/**
 * Resolve a substance object from its id string or object.
 * @param {string|Object} substanceId
 * @returns {Object}
 */
function resolveSubstance(substanceId) {
  if (typeof substanceId === 'object' && substanceId !== null) {
    return substanceId;
  }
  const sub = SUBSTANCES[substanceId];
  if (!sub) {
    throw new Error(`Unknown substance: ${substanceId}`);
  }
  if (sub.cp === undefined || sub.cv === undefined || sub.k === undefined) {
    throw new Error(`Substance "${substanceId}" is not an ideal gas (missing cp, cv, or k)`);
  }
  return sub;
}

/**
 * Compute ideal gas state at given T and P, with h, u, s relative to the
 * reference state (T_ref = 298.15 K, P_ref = 100 kPa, h_ref = 0, s_ref = 0).
 *
 * @param {string|Object} substance - Substance id or object
 * @param {number} T - Temperature in K
 * @param {number} P - Pressure in kPa
 * @returns {{ T: number, P: number, v: number, h: number, s: number, u: number }}
 */
export function idealGasState(substance, T, P) {
  const sub = resolveSubstance(substance);
  const v = (sub.R * T) / P;                              // m³/kg
  const h = H_REF + sub.cp * (T - T_REF);                 // kJ/kg
  const u = H_REF + sub.cv * (T - T_REF);                 // kJ/kg
  const s = S_REF + sub.cp * Math.log(T / T_REF) - sub.R * Math.log(P / P_REF); // kJ/(kg·K)
  return { T, P, v, h, s, u };
}

/**
 * Given any two of T (K), P (kPa), v (m³/kg), compute all ideal gas
 * properties including h, u, and s changes from the reference state.
 *
 * @param {string|Object} substanceId - Substance id or object
 * @param {string} input1Name - 'T', 'P', or 'v'
 * @param {number} input1Val  - Value of input 1
 * @param {string} input2Name - 'T', 'P', or 'v'
 * @param {number} input2Val  - Value of input 2
 * @returns {{ T: number, P: number, v: number, h: number, s: number, u: number }}
 */
export function getIdealGasProps(substanceId, input1Name, input1Val, input2Name, input2Val) {
  const sub = resolveSubstance(substanceId);

  const inputs = {};
  inputs[input1Name] = input1Val;
  inputs[input2Name] = input2Val;

  let T, P, v;

  if (inputs.T !== undefined && inputs.P !== undefined) {
    T = inputs.T;
    P = inputs.P;
    v = (sub.R * T) / P;
  } else if (inputs.T !== undefined && inputs.v !== undefined) {
    T = inputs.T;
    v = inputs.v;
    P = (sub.R * T) / v;
  } else if (inputs.P !== undefined && inputs.v !== undefined) {
    P = inputs.P;
    v = inputs.v;
    T = (P * v) / sub.R;
  } else {
    throw new Error(
      `Invalid input pair: "${input1Name}" and "${input2Name}". ` +
      'Must provide exactly two of T, P, v.'
    );
  }

  if (T <= 0) throw new Error(`Temperature must be positive (got ${T} K)`);
  if (P <= 0) throw new Error(`Pressure must be positive (got ${P} kPa)`);

  return idealGasState(sub, T, P);
}

/**
 * Compute isentropic process endpoint ratios using ideal-gas relations
 * with constant specific heats.
 *
 * Isentropic relations:
 *   T2/T1 = (P2/P1)^((k-1)/k) = (v1/v2)^(k-1)
 *
 * Convention:
 *   - knownProp/knownVal: value of a property at state 2
 *   - otherVal: value of the SAME property (knownProp) at state 1
 *   - targetProp: the property whose ratio (state2/state1) is returned
 *
 * Returns the ratio targetProp2 / targetProp1. Multiply by your known
 * targetProp1 to obtain the absolute value at state 2.
 *
 * @param {string|Object} substance  - Substance id or object
 * @param {string} knownProp   - Property whose values at both states are known: 'T', 'P', or 'v'
 * @param {number} knownVal    - Value of knownProp at state 2
 * @param {string} targetProp  - Property to compute the ratio for: 'T', 'P', or 'v'
 * @param {number} otherVal    - Value of knownProp at state 1
 * @returns {number} The ratio targetProp2 / targetProp1
 */
export function isentropicRelation(substance, knownProp, knownVal, targetProp, otherVal) {
  const sub = resolveSubstance(substance);
  const k = sub.k;

  const ratio = knownVal / otherVal; // ratio of knownProp: state2 / state1

  if (knownProp === targetProp) {
    throw new Error('knownProp and targetProp must be different');
  }

  if (knownProp === 'T' && targetProp === 'P') {
    // T2/T1 = (P2/P1)^((k-1)/k)  =>  P2/P1 = (T2/T1)^(k/(k-1))
    return Math.pow(ratio, k / (k - 1));
  }

  if (knownProp === 'P' && targetProp === 'T') {
    // T2/T1 = (P2/P1)^((k-1)/k)
    return Math.pow(ratio, (k - 1) / k);
  }

  if (knownProp === 'T' && targetProp === 'v') {
    // T2/T1 = (v1/v2)^(k-1)  =>  v2/v1 = (T1/T2)^(1/(k-1)) = ratio^(-1/(k-1))
    return Math.pow(ratio, -1 / (k - 1));
  }

  if (knownProp === 'v' && targetProp === 'T') {
    // T2/T1 = (v1/v2)^(k-1) = (1/ratio)^(k-1) = ratio^(-(k-1))
    return Math.pow(ratio, -(k - 1));
  }

  if (knownProp === 'P' && targetProp === 'v') {
    // P2/P1 = (v1/v2)^k  =>  v2/v1 = (P1/P2)^(1/k) = ratio^(-1/k)
    return Math.pow(ratio, -1 / k);
  }

  if (knownProp === 'v' && targetProp === 'P') {
    // P2/P1 = (v1/v2)^k = ratio^(-k)
    return Math.pow(ratio, -k);
  }

  throw new Error(`Invalid property pair: "${knownProp}" and "${targetProp}". Use T, P, or v.`);
}

/**
 * Compute specific work for a polytropic process (Pv^n = const).
 *
 * For n !== 1:  w = R(T2 - T1) / (1 - n)
 * For n === 1 (isothermal):  w = R * T * ln(v2/v1)
 *   (T1 === T2 for isothermal; v2/v1 = P1/P2)
 *
 * @param {string|Object} substance - Substance id or object
 * @param {number} T1 - Initial temperature (K)
 * @param {number} T2 - Final temperature (K)
 * @param {number} n  - Polytropic exponent
 * @param {Object} [options] - Additional options for n=1 case
 * @param {number} [options.P1] - Initial pressure (kPa), needed when n=1
 * @param {number} [options.P2] - Final pressure (kPa), needed when n=1
 * @param {number} [options.v1] - Initial specific volume (m³/kg), alt for n=1
 * @param {number} [options.v2] - Final specific volume (m³/kg), alt for n=1
 * @returns {number} Specific work in kJ/kg
 */
export function polytropicWork(substance, T1, T2, n, options = {}) {
  const sub = resolveSubstance(substance);

  if (Math.abs(n - 1) < 1e-12) {
    // Isothermal: w = R * T * ln(v2/v1) = R * T * ln(P1/P2)
    const T = (T1 + T2) / 2; // Should be equal for true isothermal
    if (options.P1 !== undefined && options.P2 !== undefined) {
      return sub.R * T * Math.log(options.P1 / options.P2);
    }
    if (options.v1 !== undefined && options.v2 !== undefined) {
      return sub.R * T * Math.log(options.v2 / options.v1);
    }
    throw new Error(
      'For n=1 (isothermal), supply { P1, P2 } or { v1, v2 } in options'
    );
  }

  // General polytropic: w = R(T2 - T1) / (1 - n)
  return (sub.R * (T2 - T1)) / (1 - n);
}

/**
 * Compute the change in specific entropy between two states for an ideal gas
 * with constant specific heats.
 *
 * ds = cp * ln(T2/T1) - R * ln(P2/P1)
 *
 * @param {string|Object} substance - Substance id or object
 * @param {number} T1 - Initial temperature (K)
 * @param {number} T2 - Final temperature (K)
 * @param {number} P1 - Initial pressure (kPa)
 * @param {number} P2 - Final pressure (kPa)
 * @returns {number} Entropy change ds in kJ/(kg·K)
 */
export function entropyChange(substance, T1, T2, P1, P2) {
  const sub = resolveSubstance(substance);
  return sub.cp * Math.log(T2 / T1) - sub.R * Math.log(P2 / P1);
}
