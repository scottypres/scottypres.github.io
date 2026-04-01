import { useRef, useMemo } from 'react';
import { getSatPropsAtTemp } from '../../engine/water.js';
import { WATER } from '../../engine/constants.js';
import DraggablePoint from './DraggablePoint';

const WIDTH = 600;
const HEIGHT = 400;
const PAD = { top: 20, right: 20, bottom: 50, left: 65 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

// Axis ranges per view type
const AXES = {
  Tv: {
    xLabel: 'v (m\u00B3/kg)',
    yLabel: 'T (\u00B0C)',
    xMin: -4, xMax: 3,   // log10(v): 0.0001 to 1000
    yMin: 0,  yMax: 400,
    xLog: true, yLog: false,
  },
  Ts: {
    xLabel: 's (kJ/(kg\u00B7K))',
    yLabel: 'T (\u00B0C)',
    xMin: 0, xMax: 10,
    yMin: 0, yMax: 400,
    xLog: false, yLog: false,
  },
  Pv: {
    xLabel: 'v (m\u00B3/kg)',
    yLabel: 'P (kPa)',
    xMin: -4, xMax: 3,        // log10(v)
    yMin: -1, yMax: 5,        // log10(P): 0.1 to 100000
    xLog: true, yLog: true,
  },
  Ph: {
    xLabel: 'h (kJ/kg)',
    yLabel: 'P (kPa)',
    xMin: 0, xMax: 4000,
    yMin: -1, yMax: 5,        // log10(P)
    xLog: false, yLog: true,
  },
};

// Generate ~50 temperature sample points for the dome curves
function generateDomeTemps() {
  const temps = [];
  // More density near the critical point for a smooth curve
  for (let i = 0; i <= 40; i++) {
    temps.push(WATER.T_triple + (i / 40) * (WATER.T_critical - 30 - WATER.T_triple));
  }
  // Fine resolution near critical
  for (let i = 1; i <= 12; i++) {
    temps.push(WATER.T_critical - 30 + (i / 12) * 29.99);
  }
  return temps;
}

const DOME_TEMPS = generateDomeTemps();

function toSvgX(val, ax) {
  const frac = (val - ax.xMin) / (ax.xMax - ax.xMin);
  return PAD.left + frac * PLOT_W;
}

function toSvgY(val, ax) {
  const frac = (val - ax.yMin) / (ax.yMax - ax.yMin);
  return PAD.top + PLOT_H - frac * PLOT_H;
}

function fromSvgX(px, ax) {
  const frac = (px - PAD.left) / PLOT_W;
  return ax.xMin + frac * (ax.xMax - ax.xMin);
}

function fromSvgY(py, ax) {
  const frac = (PAD.top + PLOT_H - py) / PLOT_H;
  return ax.yMin + frac * (ax.yMax - ax.yMin);
}

// Map a thermo state to the raw axis value used for plotting
function stateToXVal(state, viewType) {
  switch (viewType) {
    case 'Tv': return Math.log10(Math.max(state.v, 1e-6));
    case 'Ts': return state.s;
    case 'Pv': return Math.log10(Math.max(state.v, 1e-6));
    case 'Ph': return state.h;
    default: return 0;
  }
}

function stateToYVal(state, viewType) {
  switch (viewType) {
    case 'Tv': return state.T;
    case 'Ts': return state.T;
    case 'Pv': return Math.log10(Math.max(state.P, 0.01));
    case 'Ph': return Math.log10(Math.max(state.P, 0.01));
    default: return 0;
  }
}

// Build dome path data for a given view type
function buildDomePaths(viewType) {
  const leftPoints = [];
  const rightPoints = [];

  for (const T of DOME_TEMPS) {
    const sat = getSatPropsAtTemp(T);
    let lx, ly, rx, ry;

    switch (viewType) {
      case 'Tv':
        lx = Math.log10(sat.vf);
        ly = T;
        rx = Math.log10(sat.vg);
        ry = T;
        break;
      case 'Ts':
        lx = sat.sf;
        ly = T;
        rx = sat.sg;
        ry = T;
        break;
      case 'Pv':
        lx = Math.log10(sat.vf);
        ly = Math.log10(sat.P);
        rx = Math.log10(sat.vg);
        ry = Math.log10(sat.P);
        break;
      case 'Ph':
        lx = sat.hf;
        ly = Math.log10(sat.P);
        rx = sat.hg;
        ry = Math.log10(sat.P);
        break;
      default:
        break;
    }

    leftPoints.push({ x: lx, y: ly });
    rightPoints.push({ x: rx, y: ry });
  }

  return { leftPoints, rightPoints };
}

// Build constant-quality lines
function buildQualityLines(viewType) {
  const qualities = [0.2, 0.4, 0.6, 0.8];
  return qualities.map((q) => {
    const pts = [];
    for (const T of DOME_TEMPS) {
      const sat = getSatPropsAtTemp(T);
      let x, y;

      switch (viewType) {
        case 'Tv': {
          const v = sat.vf + q * (sat.vg - sat.vf);
          x = Math.log10(v);
          y = T;
          break;
        }
        case 'Ts': {
          const s = sat.sf + q * sat.sfg;
          x = s;
          y = T;
          break;
        }
        case 'Pv': {
          const v = sat.vf + q * (sat.vg - sat.vf);
          x = Math.log10(v);
          y = Math.log10(sat.P);
          break;
        }
        case 'Ph': {
          const h = sat.hf + q * sat.hfg;
          x = h;
          y = Math.log10(sat.P);
          break;
        }
        default:
          break;
      }

      pts.push({ x, y });
    }
    return { q, pts };
  });
}

// Format tick labels
function fmtTick(val, isLog) {
  if (isLog) {
    const n = Math.pow(10, val);
    if (n >= 1000) return n.toFixed(0);
    if (n >= 1) return n.toPrecision(3);
    return n.toPrecision(2);
  }
  return val.toFixed(val % 1 === 0 ? 0 : 1);
}

export default function DomeSVG({ viewType, thermoState, onStateChange, constraint = 'none' }) {
  const svgRef = useRef(null);
  const ax = AXES[viewType];

  // Pre-compute dome data
  const { leftPoints, rightPoints } = useMemo(() => buildDomePaths(viewType), [viewType]);
  const qualityLines = useMemo(() => buildQualityLines(viewType), [viewType]);

  // Critical point position
  const criticalSat = useMemo(() => getSatPropsAtTemp(WATER.T_critical), []);
  const critX = useMemo(() => {
    switch (viewType) {
      case 'Tv': return Math.log10(WATER.v_critical);
      case 'Ts': return criticalSat.sf;
      case 'Pv': return Math.log10(WATER.v_critical);
      case 'Ph': return criticalSat.hf;
      default: return 0;
    }
  }, [viewType, criticalSat]);
  const critY = useMemo(() => {
    switch (viewType) {
      case 'Tv': case 'Ts': return WATER.T_critical;
      case 'Pv': case 'Ph': return Math.log10(WATER.P_critical);
      default: return 0;
    }
  }, [viewType]);

  // Build dome SVG path: left side up, then right side down, closing the dome
  const domePath = useMemo(() => {
    const allPts = [
      ...leftPoints.map((p) => ({ sx: toSvgX(p.x, ax), sy: toSvgY(p.y, ax) })),
      ...rightPoints.slice().reverse().map((p) => ({ sx: toSvgX(p.x, ax), sy: toSvgY(p.y, ax) })),
    ];
    if (allPts.length === 0) return '';
    return allPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(' ') + ' Z';
  }, [leftPoints, rightPoints, ax]);

  // Dome outline (left then right, no closure for the stroke)
  const leftPath = useMemo(() => {
    return leftPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${toSvgX(p.x, ax).toFixed(1)},${toSvgY(p.y, ax).toFixed(1)}`)
      .join(' ');
  }, [leftPoints, ax]);

  const rightPath = useMemo(() => {
    return rightPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${toSvgX(p.x, ax).toFixed(1)},${toSvgY(p.y, ax).toFixed(1)}`)
      .join(' ');
  }, [rightPoints, ax]);

  // Grid lines
  const xTicks = useMemo(() => {
    const ticks = [];
    const range = ax.xMax - ax.xMin;
    const step = range <= 10 ? (range <= 5 ? 1 : 2) : Math.ceil(range / 8);
    for (let v = ax.xMin; v <= ax.xMax; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [ax]);

  const yTicks = useMemo(() => {
    const ticks = [];
    const range = ax.yMax - ax.yMin;
    const step = range <= 10 ? (range <= 5 ? 1 : 2) : Math.ceil(range / 8);
    for (let v = ax.yMin; v <= ax.yMax; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [ax]);

  // Coordinate mappers to pass down
  const mapToSvgX = (val) => toSvgX(val, ax);
  const mapToSvgY = (val) => toSvgY(val, ax);
  const mapFromSvgX = (px) => fromSvgX(px, ax);
  const mapFromSvgY = (py) => fromSvgY(py, ax);

  return (
    <svg
      ref={svgRef}
      className="dome-svg"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradient fill for the dome interior */}
        <linearGradient id="domeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.04" />
        </linearGradient>
        {/* Glow filter for the draggable point */}
        <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect x={PAD.left} y={PAD.top} width={PLOT_W} height={PLOT_H} fill="#0f172a" rx="2" />

      {/* Grid lines */}
      {xTicks.map((v) => {
        const sx = toSvgX(v, ax);
        return (
          <line
            key={`gx-${v}`}
            x1={sx} y1={PAD.top} x2={sx} y2={PAD.top + PLOT_H}
            stroke="#1e293b" strokeWidth="0.5"
          />
        );
      })}
      {yTicks.map((v) => {
        const sy = toSvgY(v, ax);
        return (
          <line
            key={`gy-${v}`}
            x1={PAD.left} y1={sy} x2={PAD.left + PLOT_W} y2={sy}
            stroke="#1e293b" strokeWidth="0.5"
          />
        );
      })}

      {/* Dome fill */}
      <path d={domePath} fill="url(#domeGrad)" />

      {/* Constant quality lines */}
      {qualityLines.map(({ q, pts }) => {
        const d = pts
          .map((p, i) => `${i === 0 ? 'M' : 'L'}${toSvgX(p.x, ax).toFixed(1)},${toSvgY(p.y, ax).toFixed(1)}`)
          .join(' ');
        return (
          <path
            key={`q-${q}`}
            d={d}
            fill="none"
            stroke="#64748b"
            strokeWidth="0.5"
            strokeDasharray="4 3"
            opacity="0.5"
          />
        );
      })}

      {/* Dome boundary - left (liquid) */}
      <path d={leftPath} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
      {/* Dome boundary - right (vapor) */}
      <path d={rightPath} fill="none" stroke="#ef4444" strokeWidth="1.5" />

      {/* Critical point */}
      <circle
        cx={toSvgX(critX, ax)}
        cy={toSvgY(critY, ax)}
        r="4"
        fill="#fbbf24"
        stroke="#f59e0b"
        strokeWidth="1"
      />

      {/* Axis tick labels */}
      {xTicks.map((v) => (
        <text
          key={`tx-${v}`}
          x={toSvgX(v, ax)}
          y={PAD.top + PLOT_H + 16}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="10"
        >
          {fmtTick(v, ax.xLog)}
        </text>
      ))}
      {yTicks.map((v) => (
        <text
          key={`ty-${v}`}
          x={PAD.left - 8}
          y={toSvgY(v, ax) + 3}
          textAnchor="end"
          fill="#94a3b8"
          fontSize="10"
        >
          {fmtTick(v, ax.yLog)}
        </text>
      ))}

      {/* Axis labels */}
      <text
        x={PAD.left + PLOT_W / 2}
        y={HEIGHT - 6}
        textAnchor="middle"
        fill="#cbd5e1"
        fontSize="12"
        fontWeight="500"
      >
        {ax.xLabel}
      </text>
      <text
        x={14}
        y={PAD.top + PLOT_H / 2}
        textAnchor="middle"
        fill="#cbd5e1"
        fontSize="12"
        fontWeight="500"
        transform={`rotate(-90, 14, ${PAD.top + PLOT_H / 2})`}
      >
        {ax.yLabel}
      </text>

      {/* Axis border */}
      <rect
        x={PAD.left} y={PAD.top} width={PLOT_W} height={PLOT_H}
        fill="none" stroke="#334155" strokeWidth="1"
      />

      {/* Draggable state point */}
      <DraggablePoint
        svgRef={svgRef}
        viewType={viewType}
        thermoState={thermoState}
        onStateChange={onStateChange}
        toSvgX={mapToSvgX}
        toSvgY={mapToSvgY}
        fromSvgX={mapFromSvgX}
        fromSvgY={mapFromSvgY}
        constraint={constraint}
      />
    </svg>
  );
}
