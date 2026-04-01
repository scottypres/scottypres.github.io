import { AMMONIA, PHASE } from './constants.js';

function satPressure(T) {
  if (T >= AMMONIA.T_critical) return AMMONIA.P_critical;
  if (T <= -77.7) return 0.6;

  const Tk = T + 273.15;
  const Tc = AMMONIA.T_critical + 273.15;
  const tau = 1 - Tk / Tc;
  if (tau <= 0) return AMMONIA.P_critical;

  const a1 = -7.1855;
  const a2 = 1.2500;
  const a3 = -2.6620;
  const a4 = -3.0100;
  const lnPr = (Tc / Tk) * (a1 * tau + a2 * Math.pow(tau, 1.5) + a3 * Math.pow(tau, 3) + a4 * Math.pow(tau, 6));
  return AMMONIA.P_critical * Math.exp(lnPr);
}

function satTemperature(P) {
  if (P >= AMMONIA.P_critical) return AMMONIA.T_critical;
  if (P <= 0.6) return -77.7;
  let low = -77.7;
  let high = AMMONIA.T_critical;
  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    if (satPressure(mid) < P) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

function vf(T) {
  const tau = (T + 77.7) / (AMMONIA.T_critical + 77.7);
  return 0.00145 * (1 + 0.14 * tau + 0.95 * Math.pow(tau, 6));
}

function vg(T) {
  const P = satPressure(T);
  const Tk = T + 273.15;
  const vIdeal = (AMMONIA.R * Tk) / Math.max(P, 0.001);
  const tau = (T + 77.7) / (AMMONIA.T_critical + 77.7);
  const correction = Math.max(0.2, 1 - 0.52 * Math.pow(tau, 3));
  return Math.max(vIdeal * correction, vf(T) * 1.01);
}

function hf(T) {
  return 4.7 * (T + 40);
}

function hfg(T) {
  if (T >= AMMONIA.T_critical) return 0;
  const tau = 1 - (T + 273.15) / (AMMONIA.T_critical + 273.15);
  return 1280 * Math.pow(tau, 0.38);
}

function hg(T) {
  return hf(T) + hfg(T);
}

function sf(T) {
  return 4.7 * Math.log((T + 273.15) / 233.15);
}

function sfg(T) {
  return hfg(T) / (T + 273.15);
}

function sg(T) {
  return sf(T) + sfg(T);
}

function getSatPropsAtTemp(T) {
  const boundedT = Math.max(-77.7, Math.min(AMMONIA.T_critical, T));
  const P = satPressure(boundedT);
  const vfv = vf(boundedT);
  const vgv = vg(boundedT);
  return {
    T: boundedT,
    P,
    vf: vfv,
    vg: vgv,
    hf: hf(boundedT),
    hfg: hfg(boundedT),
    hg: hg(boundedT),
    sf: sf(boundedT),
    sfg: sfg(boundedT),
    sg: sg(boundedT),
    uf: hf(boundedT) - P * vfv,
    ug: hg(boundedT) - P * vgv,
  };
}

function phaseFromX(x) {
  if (x <= 0.001) return PHASE.SATURATED_LIQUID;
  if (x >= 0.999) return PHASE.SATURATED_VAPOR;
  return PHASE.TWO_PHASE;
}

function stateFromTx(T, x) {
  const sat = getSatPropsAtTemp(T);
  const quality = Math.max(0, Math.min(1, x));
  return {
    T: sat.T,
    P: sat.P,
    v: sat.vf + quality * (sat.vg - sat.vf),
    h: sat.hf + quality * sat.hfg,
    s: sat.sf + quality * sat.sfg,
    u: sat.uf + quality * (sat.ug - sat.uf),
    x: quality,
    phase: phaseFromX(quality),
  };
}

function stateFromTv(T, v) {
  const sat = getSatPropsAtTemp(T);
  if (v <= sat.vf) {
    return {
      T: sat.T,
      P: sat.P,
      v,
      h: sat.hf,
      s: sat.sf,
      u: sat.uf,
      x: null,
      phase: PHASE.COMPRESSED_LIQUID,
    };
  }
  if (v >= sat.vg) {
    return {
      T: sat.T,
      P: sat.P,
      v,
      h: sat.hg,
      s: sat.sg,
      u: sat.ug,
      x: null,
      phase: PHASE.SUPERHEATED_VAPOR,
    };
  }
  const x = (v - sat.vf) / (sat.vg - sat.vf);
  return stateFromTx(T, x);
}

export function getAmmoniaProps(prop1Name, prop1Value, prop2Name, prop2Value) {
  const props = {};
  props[prop1Name] = prop1Value;
  props[prop2Name] = prop2Value;
  const has = (k) => props[k] !== undefined;

  if (has('T') && has('x')) return stateFromTx(props.T, props.x);
  if (has('T') && has('v')) return stateFromTv(props.T, props.v);

  if (has('P') && has('x')) {
    return stateFromTx(satTemperature(props.P), props.x);
  }
  if (has('P') && has('v')) {
    return stateFromTv(satTemperature(props.P), props.v);
  }
  if (has('T') && has('P')) {
    const sat = getSatPropsAtTemp(props.T);
    if (props.P >= sat.P) {
      return {
        T: props.T,
        P: props.P,
        v: sat.vf,
        h: sat.hf,
        s: sat.sf,
        u: sat.uf,
        x: null,
        phase: PHASE.COMPRESSED_LIQUID,
      };
    }
    return {
      T: props.T,
      P: props.P,
      v: sat.vg,
      h: sat.hg,
      s: sat.sg,
      u: sat.ug,
      x: null,
      phase: PHASE.SUPERHEATED_VAPOR,
    };
  }
  if (has('P') && has('h')) {
    const T = satTemperature(props.P);
    const sat = getSatPropsAtTemp(T);
    if (props.h <= sat.hf) return { T, P: props.P, v: sat.vf, h: props.h, s: sat.sf, u: sat.uf, x: null, phase: PHASE.COMPRESSED_LIQUID };
    if (props.h >= sat.hg) return { T, P: props.P, v: sat.vg, h: props.h, s: sat.sg, u: sat.ug, x: null, phase: PHASE.SUPERHEATED_VAPOR };
    const x = (props.h - sat.hf) / sat.hfg;
    return stateFromTx(T, x);
  }
  if (has('P') && has('s')) {
    const T = satTemperature(props.P);
    const sat = getSatPropsAtTemp(T);
    if (props.s <= sat.sf) return { T, P: props.P, v: sat.vf, h: sat.hf, s: props.s, u: sat.uf, x: null, phase: PHASE.COMPRESSED_LIQUID };
    if (props.s >= sat.sg) return { T, P: props.P, v: sat.vg, h: sat.hg, s: props.s, u: sat.ug, x: null, phase: PHASE.SUPERHEATED_VAPOR };
    const x = (props.s - sat.sf) / sat.sfg;
    return stateFromTx(T, x);
  }
  if (has('T') && has('h')) {
    const sat = getSatPropsAtTemp(props.T);
    if (props.h <= sat.hf) return { T: props.T, P: sat.P, v: sat.vf, h: props.h, s: sat.sf, u: sat.uf, x: null, phase: PHASE.COMPRESSED_LIQUID };
    if (props.h >= sat.hg) return { T: props.T, P: sat.P, v: sat.vg, h: props.h, s: sat.sg, u: sat.ug, x: null, phase: PHASE.SUPERHEATED_VAPOR };
    const x = (props.h - sat.hf) / sat.hfg;
    return stateFromTx(props.T, x);
  }

  throw new Error(`Unsupported property pair for ammonia: ${prop1Name}, ${prop2Name}`);
}

export function getMasterProps(prop1Name, prop1Value, prop2Name, prop2Value) {
  return getAmmoniaProps(prop1Name, prop1Value, prop2Name, prop2Value);
}

export function getAmmoniaSatProps(T) {
  return getSatPropsAtTemp(T);
}

export function getAmmoniaSatTemperature(P) {
  return satTemperature(P);
}

