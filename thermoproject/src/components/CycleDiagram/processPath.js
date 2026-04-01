// Process Path Geometry — generates SVG path `d` attributes for each
// thermodynamic process type between two state points.
//
// Uses coordinate transforms matching DomeSVG.jsx conventions:
//   SVG viewBox 600×400, PAD={top:20, right:20, bottom:50, left:65}
//   PLOT_W=515, PLOT_H=330
//
// State objects follow § 7 format: {T, P, v, h, s, u, x, phase}
// T in Kelvin, P in kPa, v in m³/kg, s in kJ/kg·K, h in kJ/kg

import { PROCESS_COLORS } from '../../engine/cycles/cycleRegistry.js';

// ── Axis definitions (mirrors DomeSVG.jsx AXES) ──────────────────────
export const DIAGRAM_AXES = {
  Ts: {
    xLabel: 's (kJ/(kg·K))', yLabel: 'T (K)',
    xProp: 's', yProp: 'T',
    xLog: false, yLog: false,
    xMin: 0, xMax: 10, yMin: 250, yMax: 700,
  },
  Pv: {
    xLabel: 'v (m³/kg)', yLabel: 'P (kPa)',
    xProp: 'v', yProp: 'P',
    xLog: true, yLog: true,
    xMin: -4, xMax: 3, yMin: -1, yMax: 5,
  },
  Ph: {
    xLabel: 'h (kJ/kg)', yLabel: 'P (kPa)',
    xProp: 'h', yProp: 'P',
    xLog: false, yLog: true,
    xMin: 0, xMax: 4000, yMin: -1, yMax: 5,
  },
  Tv: {
    xLabel: 'v (m³/kg)', yLabel: 'T (K)',
    xProp: 'v', yProp: 'T',
    xLog: true, yLog: false,
    xMin: -4, xMax: 3, yMin: 250, yMax: 700,
  },
};

const PAD = { top: 20, right: 20, bottom: 50, left: 65 };
const PLOT_W = 515;
const PLOT_H = 330;

// ── Coordinate transforms ────────────────────────────────────────────

/** Convert axis-space value to SVG x */
export function toSvgX(val, ax) {
  const frac = (val - ax.xMin) / (ax.xMax - ax.xMin);
  return PAD.left + frac * PLOT_W;
}

/** Convert axis-space value to SVG y (inverted) */
export function toSvgY(val, ax) {
  const frac = (val - ax.yMin) / (ax.yMax - ax.yMin);
  return PAD.top + PLOT_H - frac * PLOT_H;
}

/** Convert SVG x to axis-space value */
export function fromSvgX(px, ax) {
  const frac = (px - PAD.left) / PLOT_W;
  return ax.xMin + frac * (ax.xMax - ax.xMin);
}

/** Convert SVG y to axis-space value */
export function fromSvgY(py, ax) {
  const frac = (PAD.top + PLOT_H - py) / PLOT_H;
  return ax.yMin + frac * (ax.yMax - ax.yMin);
}

/** Map a physical property value to axis-space (handle log) */
function toAxisVal(physVal, isLog) {
  if (isLog) return Math.log10(Math.max(physVal, 1e-10));
  return physVal;
}

/** Get axis-space x from state */
function stateToAxisX(state, ax) {
  const raw = state[ax.xProp];
  return toAxisVal(raw, ax.xLog);
}

/** Get axis-space y from state */
function stateToAxisY(state, ax) {
  const raw = state[ax.yProp];
  return toAxisVal(raw, ax.yLog);
}

/** State → SVG point */
export function stateToSvg(state, ax) {
  return {
    x: toSvgX(stateToAxisX(state, ax), ax),
    y: toSvgY(stateToAxisY(state, ax), ax),
  };
}

// ── Helper: interpolate points to smooth SVG polyline ────────────────

function pointsToPolyline(pts) {
  if (pts.length === 0) return '';
  return pts.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
  ).join(' ');
}

/** Fit smooth cubic Bezier through a set of points (Catmull-Rom → Bezier) */
function pointsToCubicPath(pts) {
  if (pts.length < 2) return '';
  if (pts.length === 2) {
    return `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)} L${pts[1].x.toFixed(1)},${pts[1].y.toFixed(1)}`;
  }

  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  const tension = 0.3;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

// ── Process Path Generators ──────────────────────────────────────────

const STEPS = 30;

/**
 * Isentropic process (constant entropy).
 * T-s: vertical line. P-v: curve Pv^k = C.
 */
function drawIsentropic(stateFrom, stateTo, diagramType, ax) {
  const pts = [];

  if (diagramType === 'Ts') {
    // Vertical line at constant s (average of the two, should be equal)
    const sConst = (stateFrom.s + stateTo.s) / 2;
    const xVal = toAxisVal(sConst, false);
    const yFrom = toAxisVal(stateFrom.T, false);
    const yTo = toAxisVal(stateTo.T, false);
    pts.push({ x: toSvgX(xVal, ax), y: toSvgY(yFrom, ax) });
    pts.push({ x: toSvgX(xVal, ax), y: toSvgY(yTo, ax) });
    return { svgPath: pointsToPolyline(pts), points: pts };
  }

  if (diagramType === 'Pv') {
    // Pv^k = C  →  P = C / v^k
    const k = 1.4; // default; ideal gas
    const C = stateFrom.P * Math.pow(stateFrom.v, k);
    const logV1 = Math.log10(Math.max(stateFrom.v, 1e-10));
    const logV2 = Math.log10(Math.max(stateTo.v, 1e-10));

    for (let i = 0; i <= STEPS; i++) {
      const logV = logV1 + (logV2 - logV1) * i / STEPS;
      const v = Math.pow(10, logV);
      const P = C / Math.pow(v, k);
      pts.push({
        x: toSvgX(logV, ax),
        y: toSvgY(Math.log10(Math.max(P, 1e-10)), ax),
      });
    }
    return { svgPath: pointsToCubicPath(pts), points: pts };
  }

  if (diagramType === 'Ph') {
    // Approximate: linear interpolation (s is constant, h and P change together)
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      const h = stateFrom.h + (stateTo.h - stateFrom.h) * t;
      const P = stateFrom.P + (stateTo.P - stateFrom.P) * t;
      pts.push({
        x: toSvgX(h, ax),
        y: toSvgY(Math.log10(Math.max(P, 1e-10)), ax),
      });
    }
    return { svgPath: pointsToCubicPath(pts), points: pts };
  }

  // Tv: curve following T*v^(k-1) = C
  if (diagramType === 'Tv') {
    const k = 1.4;
    const C = stateFrom.T * Math.pow(stateFrom.v, k - 1);
    const logV1 = Math.log10(Math.max(stateFrom.v, 1e-10));
    const logV2 = Math.log10(Math.max(stateTo.v, 1e-10));

    for (let i = 0; i <= STEPS; i++) {
      const logV = logV1 + (logV2 - logV1) * i / STEPS;
      const v = Math.pow(10, logV);
      const T = C / Math.pow(v, k - 1);
      pts.push({
        x: toSvgX(logV, ax),
        y: toSvgY(T, ax),
      });
    }
    return { svgPath: pointsToCubicPath(pts), points: pts };
  }

  return fallbackLine(stateFrom, stateTo, ax);
}

/**
 * Isothermal process (constant temperature).
 * T-s: horizontal line. P-v: curve Pv = nRT = C.
 */
function drawIsothermal(stateFrom, stateTo, diagramType, ax) {
  const pts = [];

  if (diagramType === 'Ts') {
    // Horizontal line at constant T
    const TConst = (stateFrom.T + stateTo.T) / 2;
    const yVal = toAxisVal(TConst, false);
    const xFrom = toAxisVal(stateFrom.s, false);
    const xTo = toAxisVal(stateTo.s, false);
    pts.push({ x: toSvgX(xFrom, ax), y: toSvgY(yVal, ax) });
    pts.push({ x: toSvgX(xTo, ax), y: toSvgY(yVal, ax) });
    return { svgPath: pointsToPolyline(pts), points: pts };
  }

  if (diagramType === 'Pv') {
    // Pv = C  →  P = C/v
    const C = stateFrom.P * stateFrom.v;
    const logV1 = Math.log10(Math.max(stateFrom.v, 1e-10));
    const logV2 = Math.log10(Math.max(stateTo.v, 1e-10));

    for (let i = 0; i <= STEPS; i++) {
      const logV = logV1 + (logV2 - logV1) * i / STEPS;
      const v = Math.pow(10, logV);
      const P = C / v;
      pts.push({
        x: toSvgX(logV, ax),
        y: toSvgY(Math.log10(Math.max(P, 1e-10)), ax),
      });
    }
    return { svgPath: pointsToCubicPath(pts), points: pts };
  }

  if (diagramType === 'Tv') {
    // Horizontal line at constant T
    const TConst = (stateFrom.T + stateTo.T) / 2;
    const logV1 = Math.log10(Math.max(stateFrom.v, 1e-10));
    const logV2 = Math.log10(Math.max(stateTo.v, 1e-10));
    pts.push({ x: toSvgX(logV1, ax), y: toSvgY(TConst, ax) });
    pts.push({ x: toSvgX(logV2, ax), y: toSvgY(TConst, ax) });
    return { svgPath: pointsToPolyline(pts), points: pts };
  }

  return fallbackLine(stateFrom, stateTo, ax);
}

/**
 * Isobaric process (constant pressure).
 * P-v: horizontal line. T-s: curve following ds = cp·dT/T.
 */
function drawIsobaric(stateFrom, stateTo, diagramType, ax) {
  const pts = [];

  if (diagramType === 'Pv') {
    // Horizontal line at constant P
    const PConst = (stateFrom.P + stateTo.P) / 2;
    const yVal = toAxisVal(PConst, true);
    const logV1 = toAxisVal(stateFrom.v, true);
    const logV2 = toAxisVal(stateTo.v, true);
    pts.push({ x: toSvgX(logV1, ax), y: toSvgY(yVal, ax) });
    pts.push({ x: toSvgX(logV2, ax), y: toSvgY(yVal, ax) });
    return { svgPath: pointsToPolyline(pts), points: pts };
  }

  if (diagramType === 'Ts') {
    // ds = cp*dT/T → s = s1 + cp*ln(T/T1), approximate with cp ≈ 1.005 for air
    // For general case, interpolate linearly between known states
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      const T = stateFrom.T + (stateTo.T - stateFrom.T) * t;
      const s = stateFrom.s + (stateTo.s - stateFrom.s) * t;
      pts.push({
        x: toSvgX(toAxisVal(s, false), ax),
        y: toSvgY(toAxisVal(T, false), ax),
      });
    }
    return { svgPath: pointsToCubicPath(pts), points: pts };
  }

  if (diagramType === 'Ph') {
    // Horizontal line at constant P
    const PConst = (stateFrom.P + stateTo.P) / 2;
    const yVal = toAxisVal(PConst, true);
    pts.push({ x: toSvgX(stateFrom.h, ax), y: toSvgY(yVal, ax) });
    pts.push({ x: toSvgX(stateTo.h, ax), y: toSvgY(yVal, ax) });
    return { svgPath: pointsToPolyline(pts), points: pts };
  }

  if (diagramType === 'Tv') {
    // v changes linearly at constant P for ideal gas (v = RT/P)
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      const T = stateFrom.T + (stateTo.T - stateFrom.T) * t;
      const v = stateFrom.v + (stateTo.v - stateFrom.v) * t;
      pts.push({
        x: toSvgX(toAxisVal(v, true), ax),
        y: toSvgY(T, ax),
      });
    }
    return { svgPath: pointsToCubicPath(pts), points: pts };
  }

  return fallbackLine(stateFrom, stateTo, ax);
}

/**
 * Isochoric process (constant volume).
 * P-v: vertical line. T-s: curve following ds = cv·dT/T.
 */
function drawIsochoric(stateFrom, stateTo, diagramType, ax) {
  const pts = [];

  if (diagramType === 'Pv') {
    // Vertical line at constant v
    const vConst = (stateFrom.v + stateTo.v) / 2;
    const xVal = toAxisVal(vConst, true);
    const yFrom = toAxisVal(stateFrom.P, true);
    const yTo = toAxisVal(stateTo.P, true);
    pts.push({ x: toSvgX(xVal, ax), y: toSvgY(yFrom, ax) });
    pts.push({ x: toSvgX(xVal, ax), y: toSvgY(yTo, ax) });
    return { svgPath: pointsToPolyline(pts), points: pts };
  }

  if (diagramType === 'Ts') {
    // ds = cv*dT/T, interpolate between known endpoints
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      const T = stateFrom.T + (stateTo.T - stateFrom.T) * t;
      const s = stateFrom.s + (stateTo.s - stateFrom.s) * t;
      pts.push({
        x: toSvgX(toAxisVal(s, false), ax),
        y: toSvgY(toAxisVal(T, false), ax),
      });
    }
    return { svgPath: pointsToCubicPath(pts), points: pts };
  }

  if (diagramType === 'Tv') {
    // Vertical line at constant v
    const vConst = (stateFrom.v + stateTo.v) / 2;
    const xVal = toAxisVal(vConst, true);
    pts.push({ x: toSvgX(xVal, ax), y: toSvgY(stateFrom.T, ax) });
    pts.push({ x: toSvgX(xVal, ax), y: toSvgY(stateTo.T, ax) });
    return { svgPath: pointsToPolyline(pts), points: pts };
  }

  return fallbackLine(stateFrom, stateTo, ax);
}

/**
 * Polytropic process: Pv^n = C (general curve).
 */
function drawPolytropic(stateFrom, stateTo, diagramType, ax) {
  const pts = [];

  if (diagramType === 'Pv') {
    // Determine n from the two states: n = ln(P1/P2) / ln(v2/v1)
    const n = Math.log(stateFrom.P / stateTo.P) / Math.log(stateTo.v / stateFrom.v);
    const C = stateFrom.P * Math.pow(stateFrom.v, n);
    const logV1 = Math.log10(Math.max(stateFrom.v, 1e-10));
    const logV2 = Math.log10(Math.max(stateTo.v, 1e-10));

    for (let i = 0; i <= STEPS; i++) {
      const logV = logV1 + (logV2 - logV1) * i / STEPS;
      const v = Math.pow(10, logV);
      const P = C / Math.pow(v, n);
      pts.push({
        x: toSvgX(logV, ax),
        y: toSvgY(Math.log10(Math.max(P, 1e-10)), ax),
      });
    }
    return { svgPath: pointsToCubicPath(pts), points: pts };
  }

  // For other diagrams, use linear interpolation between states
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const state = {
      T: stateFrom.T + (stateTo.T - stateFrom.T) * t,
      P: stateFrom.P + (stateTo.P - stateFrom.P) * t,
      v: stateFrom.v + (stateTo.v - stateFrom.v) * t,
      h: stateFrom.h + (stateTo.h - stateFrom.h) * t,
      s: stateFrom.s + (stateTo.s - stateFrom.s) * t,
    };
    pts.push({
      x: toSvgX(stateToAxisX(state, ax), ax),
      y: toSvgY(stateToAxisY(state, ax), ax),
    });
  }
  return { svgPath: pointsToCubicPath(pts), points: pts };
}

/**
 * Throttling (isenthalpic) process.
 * T-s: entropy increases at roughly constant h, shown as dashed path.
 * P-h: vertical line at constant h.
 */
function drawThrottling(stateFrom, stateTo, diagramType, ax) {
  const pts = [];

  if (diagramType === 'Ph') {
    // Vertical line at constant h
    const hConst = (stateFrom.h + stateTo.h) / 2;
    pts.push({ x: toSvgX(hConst, ax), y: toSvgY(toAxisVal(stateFrom.P, true), ax) });
    pts.push({ x: toSvgX(hConst, ax), y: toSvgY(toAxisVal(stateTo.P, true), ax) });
    return { svgPath: pointsToPolyline(pts), points: pts, dashed: true };
  }

  if (diagramType === 'Ts') {
    // Entropy increases, temperature may drop slightly
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      const T = stateFrom.T + (stateTo.T - stateFrom.T) * t;
      const s = stateFrom.s + (stateTo.s - stateFrom.s) * t;
      pts.push({
        x: toSvgX(s, ax),
        y: toSvgY(T, ax),
      });
    }
    return { svgPath: pointsToCubicPath(pts), points: pts, dashed: true };
  }

  // Default: interpolate
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const state = {
      T: stateFrom.T + (stateTo.T - stateFrom.T) * t,
      P: stateFrom.P + (stateTo.P - stateFrom.P) * t,
      v: stateFrom.v + (stateTo.v - stateFrom.v) * t,
      h: stateFrom.h + (stateTo.h - stateFrom.h) * t,
      s: stateFrom.s + (stateTo.s - stateFrom.s) * t,
    };
    pts.push({
      x: toSvgX(stateToAxisX(state, ax), ax),
      y: toSvgY(stateToAxisY(state, ax), ax),
    });
  }
  return { svgPath: pointsToCubicPath(pts), points: pts, dashed: true };
}

/** Fallback: straight line between two states */
function fallbackLine(stateFrom, stateTo, ax) {
  const p1 = stateToSvg(stateFrom, ax);
  const p2 = stateToSvg(stateTo, ax);
  return {
    svgPath: `M${p1.x.toFixed(1)},${p1.y.toFixed(1)} L${p2.x.toFixed(1)},${p2.y.toFixed(1)}`,
    points: [p1, p2],
  };
}

// ── Main dispatch ────────────────────────────────────────────────────

/**
 * Generate SVG path for a process between two state points.
 *
 * @param {Object} stateFrom - Starting state {T, P, v, h, s, u, x, phase}
 * @param {Object} stateTo - Ending state
 * @param {string} processType - 'isentropic'|'isothermal'|'isobaric'|'isochoric'|'polytropic'|'throttling'
 * @param {string} diagramType - 'Ts'|'Pv'|'Ph'|'Tv'
 * @param {Object} [axisOverrides] - Optional axis range overrides
 * @returns {{ svgPath: string, points: Array<{x,y}>, dashed?: boolean }}
 */
export function drawProcess(stateFrom, stateTo, processType, diagramType, axisOverrides) {
  const baseAx = DIAGRAM_AXES[diagramType];
  if (!baseAx) return fallbackLine(stateFrom, stateTo, DIAGRAM_AXES.Ts);

  const ax = axisOverrides ? { ...baseAx, ...axisOverrides } : baseAx;

  switch (processType) {
    case 'isentropic':
      return drawIsentropic(stateFrom, stateTo, diagramType, ax);
    case 'isothermal':
      return drawIsothermal(stateFrom, stateTo, diagramType, ax);
    case 'isobaric':
      return drawIsobaric(stateFrom, stateTo, diagramType, ax);
    case 'isochoric':
      return drawIsochoric(stateFrom, stateTo, diagramType, ax);
    case 'polytropic':
      return drawPolytropic(stateFrom, stateTo, diagramType, ax);
    case 'throttling':
      return drawThrottling(stateFrom, stateTo, diagramType, ax);
    default:
      return fallbackLine(stateFrom, stateTo, ax);
  }
}

/**
 * Generate the closed area path for net work (P-v) or net heat (T-s).
 * Connects all process paths in order to form a closed polygon.
 */
export function buildCycleAreaPath(states, processes, diagramType, axisOverrides) {
  const baseAx = DIAGRAM_AXES[diagramType];
  if (!baseAx || states.length < 3) return '';

  const ax = axisOverrides ? { ...baseAx, ...axisOverrides } : baseAx;
  const allPoints = [];

  for (const proc of processes) {
    const from = states.find(s => s.stateNum === proc.from);
    const to = states.find(s => s.stateNum === proc.to);
    if (!from || !to) continue;

    const { points } = drawProcess(from, to, proc.type, diagramType, axisOverrides);
    // Skip first point of subsequent segments to avoid duplicates
    if (allPoints.length > 0 && points.length > 0) {
      allPoints.push(...points.slice(1));
    } else {
      allPoints.push(...points);
    }
  }

  if (allPoints.length < 3) return '';
  return allPoints.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
  ).join(' ') + ' Z';
}

/**
 * Compute sensible axis ranges from an array of state points.
 * Adds 10% margin on each side.
 */
export function computeAxisRanges(states, diagramType) {
  const baseAx = DIAGRAM_AXES[diagramType];
  if (!baseAx || states.length === 0) return baseAx;

  let xVals = [];
  let yVals = [];

  for (const s of states) {
    xVals.push(toAxisVal(s[baseAx.xProp], baseAx.xLog));
    yVals.push(toAxisVal(s[baseAx.yProp], baseAx.yLog));
  }

  const xRange = Math.max(...xVals) - Math.min(...xVals);
  const yRange = Math.max(...yVals) - Math.min(...yVals);
  const margin = 0.15;

  return {
    ...baseAx,
    xMin: Math.min(...xVals) - xRange * margin,
    xMax: Math.max(...xVals) + xRange * margin,
    yMin: Math.min(...yVals) - yRange * margin,
    yMax: Math.max(...yVals) + yRange * margin,
  };
}

/** Get the display color for a process type */
export function getProcessColor(processType) {
  return PROCESS_COLORS[processType] || '#94a3b8';
}
