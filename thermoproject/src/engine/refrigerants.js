/**
 * Refrigerant property engine for R-134a and R-410a.
 * Uses simplified correlations matching Borgnakke & Sonntag tables.
 */

import { R134A, R410A, PHASE } from './constants.js';

// ============================================================
// R-134a correlations
// ============================================================

// Saturation pressure (kPa) as a function of temperature (°C)
// Using Antoine-type fit calibrated to key data points
function r134a_Psat(T) {
  if (T >= R134A.T_critical) return R134A.P_critical;
  if (T <= -103) return 0.4;
  const Tk = T + 273.15;
  const Tc = R134A.T_critical + 273.15;
  const tau = 1 - Tk / Tc;
  if (tau <= 0) return R134A.P_critical;
  // Wagner-type equation fitted to R-134a
  const a1 = -7.4118;
  const a2 = 1.5498;
  const a3 = -3.2545;
  const a4 = -2.3685;
  const lnPr = (Tc / Tk) * (a1 * tau + a2 * Math.pow(tau, 1.5) + a3 * Math.pow(tau, 2.5) + a4 * Math.pow(tau, 5));
  return R134A.P_critical * Math.exp(lnPr);
}

function r134a_Tsat(P) {
  if (P >= R134A.P_critical) return R134A.T_critical;
  if (P <= 0.4) return -103;
  let lo = -103, hi = R134A.T_critical;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (r134a_Psat(mid) < P) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

function r134a_vf(T) {
  // Saturated liquid volume m³/kg — nearly constant, slight increase
  const tau = (T + 103) / (R134A.T_critical + 103);
  return 0.000720 * (1 + 0.3 * tau + 0.8 * Math.pow(tau, 6));
}

function r134a_vg(T) {
  const P = r134a_Psat(T);
  const Tk = T + 273.15;
  if (P < 0.1) return 100;
  const v_ideal = R134A.R * Tk / P;
  const tau = (T - (-103)) / (R134A.T_critical - (-103));
  const correction = Math.max(0.3, 1 - 0.5 * Math.pow(tau, 3));
  return Math.max(v_ideal * correction, r134a_vf(T) * 1.01);
}

function r134a_hf(T) {
  // Reference: hf = 0 at T = -40°C
  return 1.34 * (T + 40); // ~cp_liquid * delta_T
}

function r134a_hfg(T) {
  const Tc = R134A.T_critical;
  if (T >= Tc) return 0;
  const tau = 1 - (T + 273.15) / (Tc + 273.15);
  return 217 * Math.pow(tau, 0.38);
}

function r134a_hg(T) { return r134a_hf(T) + r134a_hfg(T); }

function r134a_sf(T) {
  const Tk = T + 273.15;
  const Tref = -40 + 273.15;
  return 1.34 * Math.log(Tk / Tref); // approx cp * ln(T/Tref)
}

function r134a_sfg(T) {
  const Tk = T + 273.15;
  const hfg = r134a_hfg(T);
  return hfg / Tk;
}

function r134a_sg(T) { return r134a_sf(T) + r134a_sfg(T); }

// ============================================================
// R-410a correlations
// ============================================================

function r410a_Psat(T) {
  if (T >= R410A.T_critical) return R410A.P_critical;
  if (T <= -70) return 10;
  const Tk = T + 273.15;
  const Tc = R410A.T_critical + 273.15;
  const tau = 1 - Tk / Tc;
  if (tau <= 0) return R410A.P_critical;
  const a1 = -7.5320;
  const a2 = 1.6480;
  const a3 = -3.4512;
  const a4 = -2.6150;
  const lnPr = (Tc / Tk) * (a1 * tau + a2 * Math.pow(tau, 1.5) + a3 * Math.pow(tau, 2.5) + a4 * Math.pow(tau, 5));
  return R410A.P_critical * Math.exp(lnPr);
}

function r410a_Tsat(P) {
  if (P >= R410A.P_critical) return R410A.T_critical;
  if (P <= 10) return -70;
  let lo = -70, hi = R410A.T_critical;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (r410a_Psat(mid) < P) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

function r410a_vf(T) {
  const tau = (T + 70) / (R410A.T_critical + 70);
  return 0.000760 * (1 + 0.25 * tau + 0.7 * Math.pow(tau, 6));
}

function r410a_vg(T) {
  const P = r410a_Psat(T);
  const Tk = T + 273.15;
  if (P < 0.1) return 100;
  const v_ideal = R410A.R * Tk / P;
  const tau = (T + 70) / (R410A.T_critical + 70);
  const correction = Math.max(0.3, 1 - 0.5 * Math.pow(tau, 3));
  return Math.max(v_ideal * correction, r410a_vf(T) * 1.01);
}

function r410a_hf(T) { return 1.55 * (T + 50); }
function r410a_hfg(T) {
  const Tc = R410A.T_critical;
  if (T >= Tc) return 0;
  const tau = 1 - (T + 273.15) / (Tc + 273.15);
  return 220 * Math.pow(tau, 0.38);
}
function r410a_hg(T) { return r410a_hf(T) + r410a_hfg(T); }
function r410a_sf(T) { return 1.55 * Math.log((T + 273.15) / (223.15)); }
function r410a_sfg(T) { return r410a_hfg(T) / (T + 273.15); }
function r410a_sg(T) { return r410a_sf(T) + r410a_sfg(T); }

// ============================================================
// Generic refrigerant interface
// ============================================================

const ENGINES = {
  r134a: {
    Psat: r134a_Psat, Tsat: r134a_Tsat,
    vf: r134a_vf, vg: r134a_vg,
    hf: r134a_hf, hfg: r134a_hfg, hg: r134a_hg,
    sf: r134a_sf, sfg: r134a_sfg, sg: r134a_sg,
    T_critical: R134A.T_critical, P_critical: R134A.P_critical,
  },
  r410a: {
    Psat: r410a_Psat, Tsat: r410a_Tsat,
    vf: r410a_vf, vg: r410a_vg,
    hf: r410a_hf, hfg: r410a_hfg, hg: r410a_hg,
    sf: r410a_sf, sfg: r410a_sfg, sg: r410a_sg,
    T_critical: R410A.T_critical, P_critical: R410A.P_critical,
  },
};

function getSatProps(eng, T) {
  T = Math.min(eng.T_critical, T);
  const P = eng.Psat(T);
  const vfv = eng.vf(T), vgv = eng.vg(T);
  const ufv = eng.hf(T) - P * vfv;
  const ugv = eng.hg(T) - P * vgv;
  return {
    T, P, vf: vfv, vg: vgv,
    hf: eng.hf(T), hfg: eng.hfg(T), hg: eng.hg(T),
    sf: eng.sf(T), sfg: eng.sfg(T), sg: eng.sg(T),
    uf: ufv, ug: ugv,
  };
}

export function getR134aSatProps(T) { return getSatProps(ENGINES.r134a, T); }
export function getR410aSatProps(T) { return getSatProps(ENGINES.r410a, T); }

function getStateFromTx(eng, T, x) {
  const sat = getSatProps(eng, T);
  x = Math.max(0, Math.min(1, x));
  return {
    T, P: sat.P,
    v: sat.vf + x * (sat.vg - sat.vf),
    h: sat.hf + x * sat.hfg,
    s: sat.sf + x * sat.sfg,
    u: sat.uf + x * (sat.ug - sat.uf),
    x,
    phase: x < 0.001 ? PHASE.SATURATED_LIQUID : x > 0.999 ? PHASE.SATURATED_VAPOR : PHASE.TWO_PHASE,
  };
}

function getStateFromTv(eng, T, v) {
  const sat = getSatProps(eng, T);
  if (v <= sat.vf) return { T, P: sat.P, v, h: sat.hf, s: sat.sf, u: sat.uf, x: null, phase: PHASE.COMPRESSED_LIQUID };
  if (v >= sat.vg) return { T, P: sat.P, v, h: sat.hg, s: sat.sg, u: sat.ug, x: null, phase: PHASE.SUPERHEATED_VAPOR };
  const x = (v - sat.vf) / (sat.vg - sat.vf);
  return getStateFromTx(eng, T, x);
}

/**
 * Master refrigerant property lookup.
 */
export function getRefrigerantProps(substanceId, prop1Name, prop1Value, prop2Name, prop2Value) {
  const eng = ENGINES[substanceId];
  if (!eng) throw new Error(`Unknown refrigerant: ${substanceId}`);

  const props = {};
  props[prop1Name] = prop1Value;
  props[prop2Name] = prop2Value;
  const has = (k) => props[k] !== undefined;

  if (has('T') && has('x')) return getStateFromTx(eng, props.T, props.x);
  if (has('T') && has('v')) return getStateFromTv(eng, props.T, props.v);

  if (has('P') && has('x')) {
    const T = eng.Tsat(props.P);
    return getStateFromTx(eng, T, props.x);
  }
  if (has('P') && has('v')) {
    const T = eng.Tsat(props.P);
    return getStateFromTv(eng, T, props.v);
  }
  if (has('T') && has('P')) {
    const Psat = eng.Psat(props.T);
    if (props.P > Psat) {
      const sat = getSatProps(eng, props.T);
      return { T: props.T, P: props.P, v: sat.vf, h: sat.hf, s: sat.sf, u: sat.uf, x: null, phase: PHASE.COMPRESSED_LIQUID };
    }
    const sat = getSatProps(eng, props.T);
    return { T: props.T, P: props.P, v: sat.vg, h: sat.hg, s: sat.sg, u: sat.ug, x: null, phase: PHASE.SUPERHEATED_VAPOR };
  }
  if (has('P') && has('h')) {
    const T = eng.Tsat(props.P);
    const sat = getSatProps(eng, T);
    if (props.h <= sat.hf) return { T, P: props.P, v: sat.vf, h: props.h, s: sat.sf, u: sat.uf, x: null, phase: PHASE.COMPRESSED_LIQUID };
    if (props.h >= sat.hg) return { T, P: props.P, v: sat.vg, h: props.h, s: sat.sg, u: sat.ug, x: null, phase: PHASE.SUPERHEATED_VAPOR };
    const x = (props.h - sat.hf) / sat.hfg;
    return getStateFromTx(eng, T, x);
  }
  if (has('P') && has('s')) {
    const T = eng.Tsat(props.P);
    const sat = getSatProps(eng, T);
    if (props.s <= sat.sf) return { T, P: props.P, v: sat.vf, h: sat.hf, s: props.s, u: sat.uf, x: null, phase: PHASE.COMPRESSED_LIQUID };
    if (props.s >= sat.sg) return { T, P: props.P, v: sat.vg, h: sat.hg, s: props.s, u: sat.ug, x: null, phase: PHASE.SUPERHEATED_VAPOR };
    const x = (props.s - sat.sf) / sat.sfg;
    return getStateFromTx(eng, T, x);
  }
  if (has('T') && has('h')) {
    const sat = getSatProps(eng, props.T);
    if (props.h <= sat.hf) return { T: props.T, P: sat.P, v: sat.vf, h: props.h, s: sat.sf, u: sat.uf, x: null, phase: PHASE.COMPRESSED_LIQUID };
    if (props.h >= sat.hg) return { T: props.T, P: sat.P, v: sat.vg, h: props.h, s: sat.sg, u: sat.ug, x: null, phase: PHASE.SUPERHEATED_VAPOR };
    const x = (props.h - sat.hf) / sat.hfg;
    return getStateFromTx(eng, props.T, x);
  }
  if (has('T') && has('s')) {
    const sat = getSatProps(eng, props.T);
    if (props.s <= sat.sf) return { T: props.T, P: sat.P, v: sat.vf, h: sat.hf, s: props.s, u: sat.uf, x: null, phase: PHASE.COMPRESSED_LIQUID };
    if (props.s >= sat.sg) return { T: props.T, P: sat.P, v: sat.vg, h: sat.hg, s: props.s, u: sat.ug, x: null, phase: PHASE.SUPERHEATED_VAPOR };
    const x = (props.s - sat.sf) / sat.sfg;
    return getStateFromTx(eng, props.T, x);
  }

  throw new Error(`Unsupported property pair for ${substanceId}: ${prop1Name}, ${prop2Name}`);
}
