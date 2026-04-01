import { useMemo, useState } from 'react';
import { getSatPropsAtTemp } from '../../engine/water.js';
import { WATER } from '../../engine/constants.js';
import {
  drawProcess,
  buildCycleAreaPath,
  computeAxisRanges,
  stateToSvg,
  toSvgX,
  toSvgY,
  getProcessColor,
  DIAGRAM_AXES,
} from './processPath.js';

const WIDTH = 600;
const HEIGHT = 400;
const PAD = { top: 20, right: 20, bottom: 50, left: 65 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

// Generate dome temps (same as DomeSVG.jsx)
function generateDomeTemps() {
  const temps = [];
  for (let i = 0; i <= 40; i++) {
    temps.push(WATER.T_triple + (i / 40) * (WATER.T_critical - 30 - WATER.T_triple));
  }
  for (let i = 1; i <= 12; i++) {
    temps.push(WATER.T_critical - 30 + (i / 12) * 29.99);
  }
  return temps;
}
const DOME_TEMPS = generateDomeTemps();

function fmtTick(val, isLog) {
  if (isLog) {
    const n = Math.pow(10, val);
    if (n >= 1000) return n.toFixed(0);
    if (n >= 1) return n.toPrecision(3);
    return n.toPrecision(2);
  }
  if (Math.abs(val) < 0.01) return '0';
  return val.toFixed(val % 1 === 0 ? 0 : 1);
}

function buildDomePath(ax, diagramType) {
  const leftPts = [];
  const rightPts = [];

  for (const Tc of DOME_TEMPS) {
    const sat = getSatPropsAtTemp(Tc);
    const Tk = Tc + 273.15; // convert °C to K for axis
    let lx, ly, rx, ry;

    switch (diagramType) {
      case 'Ts':
        lx = sat.sf; ly = Tk;
        rx = sat.sg; ry = Tk;
        break;
      case 'Pv':
        lx = Math.log10(sat.vf); ly = Math.log10(sat.P);
        rx = Math.log10(sat.vg); ry = Math.log10(sat.P);
        break;
      case 'Ph':
        lx = sat.hf; ly = Math.log10(sat.P);
        rx = sat.hg; ry = Math.log10(sat.P);
        break;
      case 'Tv':
        lx = Math.log10(sat.vf); ly = Tk;
        rx = Math.log10(sat.vg); ry = Tk;
        break;
      default:
        return { leftPath: '', rightPath: '', fillPath: '' };
    }

    leftPts.push({ x: lx, y: ly });
    rightPts.push({ x: rx, y: ry });
  }

  const toPath = (pts) => pts.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${toSvgX(p.x, ax).toFixed(1)},${toSvgY(p.y, ax).toFixed(1)}`
  ).join(' ');

  const leftPath = toPath(leftPts);
  const rightPath = toPath(rightPts);

  // Closed fill path: left up, right down
  const allPts = [
    ...leftPts.map(p => ({ sx: toSvgX(p.x, ax), sy: toSvgY(p.y, ax) })),
    ...rightPts.slice().reverse().map(p => ({ sx: toSvgX(p.x, ax), sy: toSvgY(p.y, ax) })),
  ];
  const fillPath = allPts.length > 0
    ? allPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(' ') + ' Z'
    : '';

  return { leftPath, rightPath, fillPath };
}

/**
 * CycleDiagram — generic SVG cycle diagram renderer.
 *
 * Props:
 *  - cycleDef: cycle definition from cycleRegistry
 *  - states: array of state objects (§ 7 format, T in Kelvin)
 *  - diagramType: 'Ts' | 'Pv' | 'Ph' | 'Tv' (default from cycleDef.diagrams[0])
 *  - showDome: whether to overlay saturation dome
 *  - onStateClick: callback(stateNum) when a state point is clicked
 */
export default function CycleDiagram({
  cycleDef,
  states = [],
  diagramType: diagramTypeProp,
  showDome,
  onStateClick,
}) {
  const availableDiagrams = cycleDef?.diagrams || ['Ts'];
  const [selectedDiagram, setSelectedDiagram] = useState(availableDiagrams[0]);
  const diagramType = diagramTypeProp || selectedDiagram;
  const hasDome = showDome !== undefined ? showDome : (cycleDef?.hasDome ?? false);
  const processes = cycleDef?.processes || [];

  // Compute axis ranges from state data
  const ax = useMemo(() => {
    if (states.length === 0) return DIAGRAM_AXES[diagramType] || DIAGRAM_AXES.Ts;
    return computeAxisRanges(states, diagramType);
  }, [states, diagramType]);

  // Build saturation dome paths
  const dome = useMemo(() => {
    if (!hasDome) return null;
    return buildDomePath(ax, diagramType);
  }, [hasDome, ax, diagramType]);

  // Build process paths
  const processPaths = useMemo(() => {
    if (states.length < 2 || processes.length === 0) return [];
    return processes.map((proc) => {
      const from = states.find(s => s.stateNum === proc.from);
      const to = states.find(s => s.stateNum === proc.to);
      if (!from || !to) return null;

      const result = drawProcess(from, to, proc.type, diagramType, ax);
      return {
        ...result,
        processType: proc.type,
        component: proc.component,
        color: getProcessColor(proc.type),
      };
    }).filter(Boolean);
  }, [states, processes, diagramType, ax]);

  // Build area path (net work on P-v, net heat on T-s)
  const areaPath = useMemo(() => {
    if (states.length < 3) return '';
    return buildCycleAreaPath(states, processes, diagramType, ax);
  }, [states, processes, diagramType, ax]);

  // State point SVG positions
  const statePositions = useMemo(() => {
    return states.map(s => ({
      ...s,
      svg: stateToSvg(s, ax),
    }));
  }, [states, ax]);

  // Tick marks
  const xTicks = useMemo(() => {
    const ticks = [];
    const range = ax.xMax - ax.xMin;
    const step = range <= 5 ? (range <= 2 ? 0.5 : 1) : range <= 15 ? 2 : Math.ceil(range / 8);
    for (let v = Math.ceil(ax.xMin / step) * step; v <= ax.xMax; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [ax]);

  const yTicks = useMemo(() => {
    const ticks = [];
    const range = ax.yMax - ax.yMin;
    const step = range <= 5 ? (range <= 2 ? 0.5 : 1) : range <= 15 ? 2 : Math.ceil(range / 8);
    for (let v = Math.ceil(ax.yMin / step) * step; v <= ax.yMax; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [ax]);

  const areaLabel = diagramType === 'Pv' ? 'Net Work' : diagramType === 'Ts' ? 'Net Heat' : '';

  return (
    <div className="cycle-diagram-wrapper">
      {/* Diagram type toggle */}
      {availableDiagrams.length > 1 && !diagramTypeProp && (
        <div className="view-toggle">
          {availableDiagrams.map(dt => (
            <button
              key={dt}
              className={dt === diagramType ? 'active' : ''}
              onClick={() => setSelectedDiagram(dt)}
            >
              {dt === 'Ts' ? 'T-s' : dt === 'Pv' ? 'P-v' : dt === 'Ph' ? 'P-h' : dt === 'Tv' ? 'T-v' : dt}
            </button>
          ))}
        </div>
      )}

      <svg
        className="dome-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cycleDomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.04" />
          </linearGradient>
          <filter id="stateGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect x={PAD.left} y={PAD.top} width={PLOT_W} height={PLOT_H} fill="#0f172a" rx="2" />

        {/* Grid lines */}
        {xTicks.map(v => {
          const sx = toSvgX(v, ax);
          return <line key={`gx-${v}`} x1={sx} y1={PAD.top} x2={sx} y2={PAD.top + PLOT_H} stroke="#1e293b" strokeWidth="0.5" />;
        })}
        {yTicks.map(v => {
          const sy = toSvgY(v, ax);
          return <line key={`gy-${v}`} x1={PAD.left} y1={sy} x2={PAD.left + PLOT_W} y2={sy} stroke="#1e293b" strokeWidth="0.5" />;
        })}

        {/* Saturation dome */}
        {dome && (
          <>
            <path d={dome.fillPath} fill="url(#cycleDomeGrad)" />
            <path d={dome.leftPath} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
            <path d={dome.rightPath} fill="none" stroke="#ef4444" strokeWidth="1.5" />
          </>
        )}

        {/* Shaded cycle area */}
        {areaPath && (
          <path
            d={areaPath}
            fill={diagramType === 'Pv' ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)'}
            stroke="none"
          />
        )}

        {/* Process paths */}
        {processPaths.map((pp, i) => (
          <path
            key={i}
            d={pp.svgPath}
            fill="none"
            stroke={pp.color}
            strokeWidth="2"
            strokeDasharray={pp.dashed ? '6 4' : 'none'}
            strokeLinecap="round"
          />
        ))}

        {/* State points */}
        {statePositions.map(sp => {
          const inBounds = sp.svg.x >= PAD.left && sp.svg.x <= PAD.left + PLOT_W
            && sp.svg.y >= PAD.top && sp.svg.y <= PAD.top + PLOT_H;
          if (!inBounds) return null;
          return (
            <g key={sp.stateNum} filter="url(#stateGlow)">
              <circle
                cx={sp.svg.x}
                cy={sp.svg.y}
                r="6"
                fill="#06b6d4"
                stroke="#0e7490"
                strokeWidth="1.5"
                style={{ cursor: onStateClick ? 'pointer' : 'default' }}
                onClick={() => onStateClick?.(sp.stateNum)}
              />
              <text
                x={sp.svg.x}
                y={sp.svg.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fff"
                fontSize="9"
                fontWeight="700"
                style={{ pointerEvents: 'none' }}
              >
                {sp.stateNum}
              </text>
            </g>
          );
        })}

        {/* Tick labels */}
        {xTicks.map(v => (
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
        {yTicks.map(v => (
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

        {/* Area label */}
        {areaPath && areaLabel && (
          <text
            x={PAD.left + PLOT_W - 8}
            y={PAD.top + 14}
            textAnchor="end"
            fill="#94a3b8"
            fontSize="9"
            opacity="0.7"
          >
            {areaLabel}
          </text>
        )}

        {/* Axis border */}
        <rect
          x={PAD.left} y={PAD.top} width={PLOT_W} height={PLOT_H}
          fill="none" stroke="#334155" strokeWidth="1"
        />
      </svg>

      {/* Process legend */}
      {processPaths.length > 0 && (
        <div className="process-legend">
          {processPaths.map((pp, i) => (
            <span key={i} className="legend-item">
              <span className="legend-swatch" style={{ background: pp.color, opacity: pp.dashed ? 0.6 : 1 }} />
              <span className="legend-label">{pp.component}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
