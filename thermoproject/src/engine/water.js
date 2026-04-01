/**
 * Water saturation property engine.
 * Uses the IAPWS-IF97 simplified correlations for saturation properties.
 * Provides getSatPropsAtTemp(T) and getSatPropsAtPressure(P).
 */

import { WATER, PHASE } from './constants.js';
import { lerp } from './interpolation.js';

// ---- Saturation pressure from temperature (Antoine-like / Wagner) ----

/**
 * Saturation pressure at a given temperature using a simplified Wagner equation.
 * Valid from 0.01 C to 373.946 C (critical point).
 * @param {number} T - Temperature in Celsius
 * @returns {number} Saturation pressure in kPa
 */
export function satPressure(T) {
  const Tc = WATER.T_critical; // 373.946 C
  const Pc = WATER.P_critical; // 22064 kPa
  const Tk = T + 273.15;
  const Tkc = Tc + 273.15;
  const tau = 1 - Tk / Tkc;

  if (tau <= 0) return Pc;

  // Wagner equation coefficients for water
  const a1 = -7.85951783;
  const a2 = 1.84408259;
  const a3 = -11.7866497;
  const a4 = 22.6807411;
  const a5 = -15.9618719;
  const a6 = 1.80122502;

  const lnPr =
    (Tkc / Tk) *
    (a1 * tau +
      a2 * Math.pow(tau, 1.5) +
      a3 * Math.pow(tau, 3) +
      a4 * Math.pow(tau, 3.5) +
      a5 * Math.pow(tau, 4) +
      a6 * Math.pow(tau, 7.5));

  return Pc * Math.exp(lnPr);
}

/**
 * Saturation temperature at a given pressure (inverse of satPressure).
 * Uses bisection method.
 * @param {number} P - Pressure in kPa
 * @returns {number} Temperature in Celsius
 */
export function satTemperature(P) {
  if (P >= WATER.P_critical) return WATER.T_critical;
  if (P <= WATER.P_triple) return WATER.T_triple;

  let lo = WATER.T_triple;
  let hi = WATER.T_critical;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (satPressure(mid) < P) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

// ---- Saturation liquid/vapor specific volume ----

/**
 * Approximate saturated liquid specific volume vf(T) in m^3/kg.
 * Uses a polynomial fit to NIST data.
 */
function vf(T) {
  const Tc = WATER.T_critical;
  if (T >= Tc) return WATER.v_critical;

  // Compressed liquid: nearly incompressible, slight increase with T
  // vf ~ 0.001 at low T, rises to v_critical at T_critical
  const tau = T / Tc;
  const v0 = 0.001;
  // Empirical correlation
  return v0 * (1 + 0.3 * Math.pow(tau, 2) + 0.5 * Math.pow(tau, 6) + 1.155 * Math.pow(tau, 20));
}

/**
 * Approximate saturated vapor specific volume vg(T) in m^3/kg.
 * Uses ideal gas law as starting point with empirical corrections.
 */
function vg(T) {
  const Tc = WATER.T_critical;
  if (T >= Tc) return WATER.v_critical;

  const Psat = satPressure(T);
  const Tk = T + 273.15;

  // Ideal gas approximation: v = R*T / P, with compressibility correction
  const v_ideal = (WATER.R * Tk) / Psat;

  // Correction factor that approaches v_critical near critical point
  const tau = T / Tc;
  const correction = 1 - 0.5 * Math.pow(tau, 4) - 0.3 * Math.pow(tau, 8);
  let v = v_ideal * correction;

  // Ensure it converges to v_critical
  if (tau > 0.95) {
    const blend = (tau - 0.95) / 0.05;
    v = v * (1 - blend) + WATER.v_critical * blend;
  }

  return Math.max(v, WATER.v_critical);
}

// ---- Saturation enthalpies ----

/**
 * Saturated liquid enthalpy hf(T) in kJ/kg.
 */
function hf(T) {
  const Tc = WATER.T_critical;
  if (T >= Tc) return 2084; // approximate critical enthalpy

  // hf increases roughly linearly with T at low T, curves up near critical
  // Based on steam table data fit
  const tau = T / Tc;
  return 4.18 * T * (1 + 0.3 * Math.pow(tau, 3) + 0.8 * Math.pow(tau, 10));
}

/**
 * Enthalpy of vaporization hfg(T) in kJ/kg.
 */
function hfg(T) {
  const Tc = WATER.T_critical;
  if (T >= Tc) return 0;

  // hfg decreases from ~2501 at 0 C to 0 at critical point
  const tau = 1 - T / Tc;
  return 2501 * Math.pow(tau, 0.38) * (1 - 0.1 * (1 - tau));
}

function hg(T) {
  return hf(T) + hfg(T);
}

// ---- Saturation entropies ----

/**
 * Saturated liquid entropy sf(T) in kJ/(kg*K).
 */
function sf(T) {
  const Tc = WATER.T_critical;
  if (T >= Tc) return 4.41; // critical entropy

  const Tk = T + 273.15;
  // sf ~ cp * ln(T/T_ref), with corrections
  const tau = T / Tc;
  return 4.18 * Math.log(Tk / 273.15) * (1 + 0.15 * Math.pow(tau, 4));
}

/**
 * Entropy of vaporization sfg(T) in kJ/(kg*K).
 */
function sfg(T) {
  const Tc = WATER.T_critical;
  if (T >= Tc) return 0;

  const Tk = T + 273.15;
  return hfg(T) / Tk;
}

function sg(T) {
  return sf(T) + sfg(T);
}

// ---- Saturation internal energies ----

function uf(T) {
  const Psat = satPressure(T);
  return hf(T) - Psat * vf(T);
}

function ug(T) {
  const Psat = satPressure(T);
  return hg(T) - Psat * vg(T);
}

// ---- Main API ----

/**
 * Get all saturation properties at a given temperature.
 * @param {number} T - Temperature in Celsius (0.01 to 373.946)
 * @returns {Object} Saturation properties
 */
export function getSatPropsAtTemp(T) {
  T = Math.max(WATER.T_triple, Math.min(WATER.T_critical, T));

  return {
    T,
    P: satPressure(T),
    vf: vf(T),
    vg: vg(T),
    hf: hf(T),
    hg: hg(T),
    hfg: hfg(T),
    sf: sf(T),
    sg: sg(T),
    sfg: sfg(T),
    uf: uf(T),
    ug: ug(T),
  };
}

/**
 * Get all saturation properties at a given pressure.
 * @param {number} P - Pressure in kPa
 * @returns {Object} Saturation properties
 */
export function getSatPropsAtPressure(P) {
  const T = satTemperature(P);
  return getSatPropsAtTemp(T);
}

/**
 * Determine the full thermodynamic state given two independent properties.
 * For the draggable dome: given T and v (or T and s, etc.), compute all properties.
 */
export function getStateFromTv(T, v) {
  if (T >= WATER.T_critical) {
    const P = satPressure(Math.min(T, WATER.T_critical));
    return {
      T, P, v,
      h: hg(WATER.T_critical) + 2.0 * (T - WATER.T_critical),
      s: sg(WATER.T_critical),
      u: ug(WATER.T_critical),
      x: null,
      phase: PHASE.SUPERCRITICAL,
    };
  }

  const sat = getSatPropsAtTemp(T);

  if (v < sat.vf) {
    // Compressed liquid
    return {
      T, P: sat.P, v,
      h: sat.hf,
      s: sat.sf,
      u: sat.uf,
      x: null,
      phase: PHASE.COMPRESSED_LIQUID,
    };
  } else if (v > sat.vg) {
    // Superheated vapor - approximate
    const P = sat.P;
    return {
      T, P, v,
      h: sat.hg + 2.0 * (T - sat.T) + P * (v - sat.vg),
      s: sat.sg + 2.0 * Math.log((T + 273.15) / (sat.T + 273.15)),
      u: sat.ug,
      x: null,
      phase: PHASE.SUPERHEATED_VAPOR,
    };
  } else {
    // Two-phase
    const x = (v - sat.vf) / (sat.vg - sat.vf);
    return {
      T,
      P: sat.P,
      v,
      h: sat.hf + x * sat.hfg,
      s: sat.sf + x * sat.sfg,
      u: sat.uf + x * (sat.ug - sat.uf),
      x,
      phase: x < 0.001 ? PHASE.SATURATED_LIQUID : x > 0.999 ? PHASE.SATURATED_VAPOR : PHASE.TWO_PHASE,
    };
  }
}

export function getStateFromTs(T, s) {
  if (T >= WATER.T_critical) {
    return {
      T, P: WATER.P_critical, v: WATER.v_critical,
      h: 2084, s, u: 2014,
      x: null,
      phase: PHASE.SUPERCRITICAL,
    };
  }

  const sat = getSatPropsAtTemp(T);

  if (s < sat.sf) {
    return {
      T, P: sat.P, v: sat.vf,
      h: sat.hf, s, u: sat.uf,
      x: null,
      phase: PHASE.COMPRESSED_LIQUID,
    };
  } else if (s > sat.sg) {
    return {
      T, P: sat.P, v: sat.vg,
      h: sat.hg, s, u: sat.ug,
      x: null,
      phase: PHASE.SUPERHEATED_VAPOR,
    };
  } else {
    const x = (s - sat.sf) / sat.sfg;
    const v = sat.vf + x * (sat.vg - sat.vf);
    return {
      T, P: sat.P, v,
      h: sat.hf + x * sat.hfg,
      s,
      u: sat.uf + x * (sat.ug - sat.uf),
      x,
      phase: x < 0.001 ? PHASE.SATURATED_LIQUID : x > 0.999 ? PHASE.SATURATED_VAPOR : PHASE.TWO_PHASE,
    };
  }
}

export function getStateFromPv(P, v) {
  const T = satTemperature(P);
  return getStateFromTv(T, v);
}

export function getStateFromPh(P, h) {
  const T = satTemperature(P);
  if (T >= WATER.T_critical) {
    return {
      T, P, v: WATER.v_critical, h, s: 4.41, u: 2014,
      x: null,
      phase: PHASE.SUPERCRITICAL,
    };
  }

  const sat = getSatPropsAtTemp(T);

  if (h < sat.hf) {
    return {
      T, P, v: sat.vf, h, s: sat.sf, u: sat.uf,
      x: null,
      phase: PHASE.COMPRESSED_LIQUID,
    };
  } else if (h > sat.hg) {
    return {
      T, P, v: sat.vg, h, s: sat.sg, u: sat.ug,
      x: null,
      phase: PHASE.SUPERHEATED_VAPOR,
    };
  } else {
    const x = (h - sat.hf) / sat.hfg;
    const v = sat.vf + x * (sat.vg - sat.vf);
    return {
      T, P, v,
      h,
      s: sat.sf + x * sat.sfg,
      u: sat.uf + x * (sat.ug - sat.uf),
      x,
      phase: x < 0.001 ? PHASE.SATURATED_LIQUID : x > 0.999 ? PHASE.SATURATED_VAPOR : PHASE.TWO_PHASE,
    };
  }
}

/**
 * Master water property lookup accepting any two independent properties.
 */
export function getWaterProps(prop1Name, prop1Value, prop2Name, prop2Value) {
  const props = {};
  props[prop1Name] = prop1Value;
  props[prop2Name] = prop2Value;
  const has = (k) => props[k] !== undefined;

  if (has('T') && has('v')) return getStateFromTv(props.T, props.v);
  if (has('T') && has('s')) return getStateFromTs(props.T, props.s);
  if (has('P') && has('v')) return getStateFromPv(props.P, props.v);
  if (has('P') && has('h')) return getStateFromPh(props.P, props.h);

  if (has('T') && has('P')) {
    const Psat = satPressure(props.T);
    if (props.T >= WATER.T_critical) {
      return { T: props.T, P: props.P, v: WATER.v_critical, h: 2084, s: 4.41, u: 2014, x: null, phase: PHASE.SUPERCRITICAL };
    }
    if (Math.abs(props.P - Psat) / Math.max(Psat, 0.01) < 0.01) {
      const sat = getSatPropsAtTemp(props.T);
      return { T: props.T, P: props.P, v: sat.vg, h: sat.hg, s: sat.sg, u: sat.ug, x: 1, phase: PHASE.SATURATED_VAPOR };
    }
    if (props.P > Psat) {
      const sat = getSatPropsAtTemp(props.T);
      return { T: props.T, P: props.P, v: sat.vf, h: sat.hf, s: sat.sf, u: sat.uf, x: null, phase: PHASE.COMPRESSED_LIQUID };
    }
    const Tk = props.T + 273.15;
    const v = WATER.R * Tk / props.P;
    const sat = getSatPropsAtTemp(props.T);
    return { T: props.T, P: props.P, v, h: sat.hg + 2.0 * (props.T - sat.T), s: sat.sg, u: sat.ug, x: null, phase: PHASE.SUPERHEATED_VAPOR };
  }

  if (has('T') && has('x')) {
    const sat = getSatPropsAtTemp(props.T);
    const x = Math.max(0, Math.min(1, props.x));
    return {
      T: props.T, P: sat.P,
      v: sat.vf + x * (sat.vg - sat.vf),
      h: sat.hf + x * sat.hfg, s: sat.sf + x * sat.sfg,
      u: sat.uf + x * (sat.ug - sat.uf), x,
      phase: x < 0.001 ? PHASE.SATURATED_LIQUID : x > 0.999 ? PHASE.SATURATED_VAPOR : PHASE.TWO_PHASE,
    };
  }

  if (has('P') && has('x')) {
    const T = satTemperature(props.P);
    const sat = getSatPropsAtTemp(T);
    const x = Math.max(0, Math.min(1, props.x));
    return {
      T, P: props.P,
      v: sat.vf + x * (sat.vg - sat.vf),
      h: sat.hf + x * sat.hfg, s: sat.sf + x * sat.sfg,
      u: sat.uf + x * (sat.ug - sat.uf), x,
      phase: x < 0.001 ? PHASE.SATURATED_LIQUID : x > 0.999 ? PHASE.SATURATED_VAPOR : PHASE.TWO_PHASE,
    };
  }

  if (has('P') && has('s')) {
    const T = satTemperature(props.P);
    return getStateFromTs(T, props.s);
  }

  if (has('T') && has('h')) {
    const sat = getSatPropsAtTemp(props.T);
    if (props.h <= sat.hf) return { T: props.T, P: sat.P, v: sat.vf, h: props.h, s: sat.sf, u: sat.uf, x: null, phase: PHASE.COMPRESSED_LIQUID };
    if (props.h >= sat.hg) return { T: props.T, P: sat.P, v: sat.vg, h: props.h, s: sat.sg, u: sat.ug, x: null, phase: PHASE.SUPERHEATED_VAPOR };
    const x = (props.h - sat.hf) / sat.hfg;
    return { T: props.T, P: sat.P, v: sat.vf + x * (sat.vg - sat.vf), h: props.h, s: sat.sf + x * sat.sfg, u: sat.uf + x * (sat.ug - sat.uf), x, phase: PHASE.TWO_PHASE };
  }

  throw new Error(`Unsupported property pair: ${prop1Name}, ${prop2Name}`);
}
