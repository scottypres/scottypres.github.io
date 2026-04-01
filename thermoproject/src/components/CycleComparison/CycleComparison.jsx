import { useState, useMemo, useCallback } from 'react';
import { getCycleById, CATEGORY_LABELS, getCyclesByCategory } from '../../engine/cycles/cycleRegistry';
import { calculateCycle } from '../../engine/cycles/index.js';
import {
  computeAxisRanges,
  stateToSvg,
  toSvgX,
  toSvgY,
  drawProcess,
  getProcessColor,
} from '../CycleDiagram/processPath.js';

const PRESETS = [
  { label: 'Rankine vs Reheat', a: 'rankine-basic', b: 'rankine-reheat' },
  { label: 'Otto vs Diesel', a: 'otto', b: 'diesel' },
  { label: 'Brayton vs Brayton+Regen', a: 'brayton-basic', b: 'brayton-regenerative' },
  { label: 'Carnot vs Otto', a: 'carnot', b: 'otto' },
  { label: 'Stirling vs Ericsson', a: 'stirling', b: 'ericsson' },
];

function getDefaultInputs(cycleId) {
  const def = getCycleById(cycleId);
  if (!def) return {};
  const defaults = {};
  for (const input of def.inputs || []) {
    defaults[input.id] = input.default;
  }
  return defaults;
}

/**
 * CycleComparison - overlay two cycles on the same T-s diagram.
 * First cycle: solid lines, primary colors.
 * Second cycle: dashed lines, secondary colors.
 */
export default function CycleComparison() {
  const [cycleIdA, setCycleIdA] = useState('rankine-basic');
  const [cycleIdB, setCycleIdB] = useState('rankine-reheat');

  const categories = useMemo(() => getCyclesByCategory(), []);

  const resultA = useMemo(() => {
    const inputs = getDefaultInputs(cycleIdA);
    return calculateCycle(cycleIdA, inputs, false);
  }, [cycleIdA]);

  const resultB = useMemo(() => {
    const inputs = getDefaultInputs(cycleIdB);
    return calculateCycle(cycleIdB, inputs, false);
  }, [cycleIdB]);

  const defA = useMemo(() => getCycleById(cycleIdA), [cycleIdA]);
  const defB = useMemo(() => getCycleById(cycleIdB), [cycleIdB]);

  const handlePreset = useCallback((preset) => {
    setCycleIdA(preset.a);
    setCycleIdB(preset.b);
  }, []);

  const etaA = resultA?.metrics?.eta_thermal != null
    ? (resultA.metrics.eta_thermal * 100).toFixed(1) + '%'
    : resultA?.metrics?.COP != null ? `COP ${resultA.metrics.COP.toFixed(2)}` : '--';

  const etaB = resultB?.metrics?.eta_thermal != null
    ? (resultB.metrics.eta_thermal * 100).toFixed(1) + '%'
    : resultB?.metrics?.COP != null ? `COP ${resultB.metrics.COP.toFixed(2)}` : '--';

  // Merge states for axis range computation: combine both state arrays
  const mergedStates = useMemo(() => {
    const statesA = resultA?.states || [];
    const statesB = (resultB?.states || []).map(s => ({ ...s, stateNum: s.stateNum + 100 }));
    return [...statesA, ...statesB];
  }, [resultA, resultB]);

  const CycleSelector = ({ value, onChange, label }) => (
    <div className="comparison-selector">
      <label className="control-label">{label}</label>
      <select className="select-control" value={value} onChange={e => onChange(e.target.value)}>
        {Object.entries(categories).map(([cat, cycles]) => (
          <optgroup key={cat} label={CATEGORY_LABELS[cat]}>
            {cycles.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );

  return (
    <div className="cycle-comparison">
      <div className="panel" style={{ padding: 12 }}>
        <div className="panel-title">Cycle Comparison</div>

        {/* Presets */}
        <div className="comparison-presets">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              className={`btn ${cycleIdA === p.a && cycleIdB === p.b ? 'btn-primary' : ''}`}
              style={{ fontSize: '0.7rem', height: 32, padding: '0 10px' }}
              onClick={() => handlePreset(p)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Selectors */}
        <div className="comparison-selectors">
          <CycleSelector value={cycleIdA} onChange={setCycleIdA} label="Cycle A (solid)" />
          <CycleSelector value={cycleIdB} onChange={setCycleIdB} label="Cycle B (dashed)" />
        </div>

        {/* Efficiency comparison */}
        <div className="comparison-efficiency">
          <div className="comparison-eta">
            <span className="comparison-eta-label" style={{ color: '#06b6d4' }}>{defA?.name}:</span>
            <span className="comparison-eta-value">{etaA}</span>
          </div>
          <div className="comparison-eta">
            <span className="comparison-eta-label" style={{ color: '#f97316' }}>{defB?.name}:</span>
            <span className="comparison-eta-value">{etaB}</span>
          </div>
        </div>
      </div>

      {/* Overlaid T-s diagram */}
      <div className="panel" style={{ marginTop: 12 }}>
        <div className="panel-title">T-s Overlay</div>
        <ComparisonDiagram
          defA={defA} statesA={resultA?.states || []}
          defB={defB} statesB={resultB?.states || []}
          mergedStates={mergedStates}
          nameA={defA?.name || 'Cycle A'}
          nameB={defB?.name || 'Cycle B'}
        />
      </div>
    </div>
  );
}

/**
 * ComparisonDiagram - renders two cycles overlaid on one T-s plot.
 */
const WIDTH = 600;
const HEIGHT = 400;
const PAD = { top: 20, right: 20, bottom: 50, left: 65 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

function ComparisonDiagram({ defA, statesA, defB, statesB, mergedStates, nameA, nameB }) {
  const ax = useMemo(() => {
    if (mergedStates.length === 0) return { xLabel: 's (kJ/(kg·K))', yLabel: 'T (K)', xProp: 's', yProp: 'T', xLog: false, yLog: false, xMin: 0, xMax: 10, yMin: 250, yMax: 700 };
    return computeAxisRanges(mergedStates, 'Ts');
  }, [mergedStates]);

  const pathsA = useMemo(() => {
    if (!defA || statesA.length < 2) return [];
    return (defA.processes || []).map(proc => {
      const from = statesA.find(s => s.stateNum === proc.from);
      const to = statesA.find(s => s.stateNum === proc.to);
      if (!from || !to) return null;
      const result = drawProcess(from, to, proc.type, 'Ts', ax);
      return { ...result, color: getProcessColor(proc.type), dashed: false };
    }).filter(Boolean);
  }, [defA, statesA, ax]);

  const pathsB = useMemo(() => {
    if (!defB || statesB.length < 2) return [];
    return (defB.processes || []).map(proc => {
      const from = statesB.find(s => s.stateNum === proc.from);
      const to = statesB.find(s => s.stateNum === proc.to);
      if (!from || !to) return null;
      const result = drawProcess(from, to, proc.type, 'Ts', ax);
      return { ...result, color: '#f97316', dashed: true };
    }).filter(Boolean);
  }, [defB, statesB, ax]);

  const xTicks = useMemo(() => {
    const ticks = [];
    const range = ax.xMax - ax.xMin;
    const step = range <= 5 ? (range <= 2 ? 0.5 : 1) : range <= 15 ? 2 : Math.ceil(range / 8);
    for (let v = Math.ceil(ax.xMin / step) * step; v <= ax.xMax; v += step) ticks.push(v);
    return ticks;
  }, [ax]);

  const yTicks = useMemo(() => {
    const ticks = [];
    const range = ax.yMax - ax.yMin;
    const step = range <= 5 ? (range <= 2 ? 0.5 : 1) : range <= 15 ? 2 : Math.ceil(range / 8);
    for (let v = Math.ceil(ax.yMin / step) * step; v <= ax.yMax; v += step) ticks.push(v);
    return ticks;
  }, [ax]);

  return (
    <svg className="dome-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="compareClip">
          <rect x={PAD.left} y={PAD.top} width={PLOT_W} height={PLOT_H} />
        </clipPath>
      </defs>
      <rect x={PAD.left} y={PAD.top} width={PLOT_W} height={PLOT_H} fill="#0f172a" rx="2" />

      {/* Grid */}
      {xTicks.map(v => <line key={`gx-${v}`} x1={toSvgX(v, ax)} y1={PAD.top} x2={toSvgX(v, ax)} y2={PAD.top + PLOT_H} stroke="#1e293b" strokeWidth="0.5" />)}
      {yTicks.map(v => <line key={`gy-${v}`} x1={PAD.left} y1={toSvgY(v, ax)} x2={PAD.left + PLOT_W} y2={toSvgY(v, ax)} stroke="#1e293b" strokeWidth="0.5" />)}

      <g clipPath="url(#compareClip)">
      {/* Cycle A paths (solid) */}
      {pathsA.map((pp, i) => (
        <path key={`a-${i}`} d={pp.svgPath} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
      ))}

      {/* Cycle B paths (dashed) */}
      {pathsB.map((pp, i) => (
        <path key={`b-${i}`} d={pp.svgPath} fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="8 4" strokeLinecap="round" />
      ))}

      {/* State points A */}
      {statesA.map(s => {
        const pt = stateToSvg(s, ax);
        return (
          <g key={`sa-${s.stateNum}`}>
            <circle cx={pt.x} cy={pt.y} r="5" fill="#06b6d4" stroke="#0e7490" strokeWidth="1" />
            <text x={pt.x} y={pt.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="8" fontWeight="700">{s.stateNum}</text>
          </g>
        );
      })}

      {/* State points B */}
      {statesB.map(s => {
        const pt = stateToSvg(s, ax);
        return (
          <g key={`sb-${s.stateNum}`}>
            <circle cx={pt.x} cy={pt.y} r="5" fill="#f97316" stroke="#c2410c" strokeWidth="1" />
            <text x={pt.x} y={pt.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="8" fontWeight="700">{s.stateNum}</text>
          </g>
        );
      })}
      </g>

      {/* Tick labels */}
      {xTicks.map(v => <text key={`tx-${v}`} x={toSvgX(v, ax)} y={PAD.top + PLOT_H + 16} textAnchor="middle" fill="#94a3b8" fontSize="10">{v % 1 === 0 ? v : v.toFixed(1)}</text>)}
      {yTicks.map(v => <text key={`ty-${v}`} x={PAD.left - 8} y={toSvgY(v, ax) + 3} textAnchor="end" fill="#94a3b8" fontSize="10">{v % 1 === 0 ? v : v.toFixed(1)}</text>)}

      {/* Axis labels */}
      <text x={PAD.left + PLOT_W / 2} y={HEIGHT - 6} textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="500">{ax.xLabel}</text>
      <text x={14} y={PAD.top + PLOT_H / 2} textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="500" transform={`rotate(-90, 14, ${PAD.top + PLOT_H / 2})`}>{ax.yLabel}</text>

      {/* Legend */}
      <rect x={PAD.left + 8} y={PAD.top + 8} width="10" height="3" rx="1" fill="#06b6d4" />
      <text x={PAD.left + 22} y={PAD.top + 12} fill="#06b6d4" fontSize="9">{nameA}</text>
      <rect x={PAD.left + 8} y={PAD.top + 20} width="10" height="3" rx="1" fill="#f97316" />
      <text x={PAD.left + 22} y={PAD.top + 24} fill="#f97316" fontSize="9">{nameB}</text>

      <rect x={PAD.left} y={PAD.top} width={PLOT_W} height={PLOT_H} fill="none" stroke="#334155" strokeWidth="1" />
    </svg>
  );
}
