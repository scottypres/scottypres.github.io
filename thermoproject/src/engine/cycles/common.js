import { AIR, SUBSTANCES } from '../constants.js';

const KELVIN_OFFSET = 273.15;

export function toKelvin(value, assumeCelsius = false) {
  if (value == null || Number.isNaN(value)) return null;
  if (assumeCelsius) return value + KELVIN_OFFSET;
  return value;
}

export function toKelvinAuto(value) {
  if (value == null || Number.isNaN(value)) return null;
  return value < 200 ? value + KELVIN_OFFSET : value;
}

export function toCelsius(valueKelvin) {
  if (valueKelvin == null || Number.isNaN(valueKelvin)) return null;
  return valueKelvin - KELVIN_OFFSET;
}

export function normalizeIdealGasName(substance = 'air') {
  const key = String(substance).toLowerCase();
  return SUBSTANCES[key] ? key : AIR.id;
}

export function getGasConstants(substance = 'air') {
  const normalized = normalizeIdealGasName(substance);
  return SUBSTANCES[normalized] || AIR;
}

function normalizePhase(phase) {
  if (!phase) return 'unknown';
  const p = String(phase).toLowerCase();
  if (p.includes('liquid')) return 'liquid';
  if (p.includes('mixture') || p.includes('two')) return 'mixture';
  if (p.includes('critical')) return 'supercritical';
  if (p.includes('vapor')) return 'vapor';
  return p;
}

export function stateFromWaterLike(stateNum, rawState, component, isTemperatureKelvin = false) {
  return {
    stateNum,
    T: isTemperatureKelvin ? rawState.T : toKelvin(rawState.T, true),
    P: rawState.P,
    v: rawState.v,
    h: rawState.h,
    s: rawState.s,
    u: rawState.u,
    x: rawState.x ?? null,
    phase: normalizePhase(rawState.phase),
    component,
  };
}

export function stateFromIdealGas(stateNum, rawState, component) {
  return {
    stateNum,
    T: rawState.T,
    P: rawState.P,
    v: rawState.v,
    h: rawState.h,
    s: rawState.s,
    u: rawState.u,
    x: null,
    phase: 'vapor',
    component,
  };
}

export function metricTemplate(overrides = {}) {
  return {
    eta_thermal: undefined,
    eta_carnot: undefined,
    W_net: undefined,
    Q_H: undefined,
    Q_L: undefined,
    W_turbine: undefined,
    W_compressor: undefined,
    W_pump: undefined,
    BWR: undefined,
    COP: undefined,
    ...overrides,
  };
}

export function validationError(message, details = []) {
  return {
    error: true,
    message,
    details: details.length > 0 ? details : [message],
  };
}

export function propertyCall(callable, ...args) {
  try {
    const result = callable(...args);
    if (!result) return { error: true, message: 'Property engine returned empty response' };
    if (result.error) {
      const message = typeof result.error === 'string' ? result.error : 'Property lookup failed';
      return { error: true, message, context: result };
    }
    return result;
  } catch (error) {
    return { error: true, message: error.message };
  }
}

export function calculatorError(cycleName, error) {
  return {
    error: true,
    message: `${cycleName} calculation failed: ${error.message}`,
    exception: error,
  };
}

