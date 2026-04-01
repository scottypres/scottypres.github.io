import { useMemo } from 'react';

const WIDTH = 500;
const HEIGHT = 300;
const PAD = { top: 30, right: 20, bottom: 40, left: 120 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

const COMPONENT_COLORS = {
  'pump': '#3b82f6',
  'pump-1': '#3b82f6',
  'pump-2': '#60a5fa',
  'compressor': '#f97316',
  'compressor-lp': '#f97316',
  'compressor-hp': '#fb923c',
  'boiler': '#ef4444',
  'turbine': '#22c55e',
  'turbine-hp': '#22c55e',
  'turbine-lp': '#4ade80',
  'gas-turbine': '#22c55e',
  'steam-turbine': '#4ade80',
  'condenser': '#3b82f6',
  'combustion-chamber': '#ef4444',
  'heat-exchanger': '#a855f7',
  'expansion-valve': '#94a3b8',
  'evaporator': '#06b6d4',
  'reheater': '#ef4444',
  'regenerator': '#a855f7',
  'regenerator-cold': '#a855f7',
  'regenerator-hot': '#c084fc',
  'nozzle': '#06b6d4',
  'diffuser': '#06b6d4',
  'fwh': '#a855f7',
  'intercooler': '#60a5fa',
  'compression': '#f97316',
  'expansion': '#22c55e',
  'over-expansion': '#4ade80',
  'heat-addition': '#ef4444',
  'heat-addition-v': '#ef4444',
  'heat-addition-p': '#f87171',
  'heat-rejection': '#3b82f6',
  'regenerator-heat': '#a855f7',
  'regenerator-cool': '#c084fc',
  'process-heater': '#f97316',
};

/**
 * ExergyChart - horizontal bar chart of exergy destruction per component.
 *
 * For each process: I = T0 * S_gen where S_gen = delta_s (for internally reversible)
 * Second-law efficiency: eta_II = W_net / (exergy input)
 *
 * Props:
 *  - states: array of state objects
 *  - metrics: cycle metrics (W_net, Q_H, etc.)
 *  - cycleDef: cycle definition with processes array
 *  - T0: dead state temperature in K (default 298.15)
 */
export default function ExergyChart({ states = [], metrics = {}, cycleDef, T0 = 298.15 }) {
  const exergyData = useMemo(() => {
    if (!cycleDef || states.length < 2) return null;

    const processes = cycleDef.processes || [];
    const components = [];
    let totalDestruction = 0;

    for (const proc of processes) {
      const from = states.find(s => s.stateNum === proc.from);
      const to = states.find(s => s.stateNum === proc.to);
      if (!from || !to) continue;

      // Entropy generation for the process
      // For heat exchange with reservoir: S_gen = (s_out - s_in) - Q/T_boundary
      // Simplified: S_gen approx = s_out - s_in (for adiabatic) or total entropy change
      const ds = (to.s || 0) - (from.s || 0);
      const sGen = Math.max(0, ds); // entropy generation is always >= 0
      const destruction = T0 * sGen;

      if (destruction > 0.01) {
        components.push({
          component: proc.component,
          processType: proc.type,
          destruction,
          sGen,
          color: COMPONENT_COLORS[proc.component] || '#94a3b8',
        });
        totalDestruction += destruction;
      }
    }

    // Second-law efficiency
    const W_net = Math.abs(metrics.W_net || 0);
    const Q_H = Math.abs(metrics.Q_H || 0);
    // Exergy input = Q_H * (1 - T0/T_H) approximately
    // Use a simpler approximation: eta_II = W_net / (W_net + total_destruction)
    const exergyInput = W_net + totalDestruction;
    const eta_II = exergyInput > 0 ? W_net / exergyInput : 0;

    return { components, totalDestruction, eta_II };
  }, [states, metrics, cycleDef, T0]);

  if (!exergyData || exergyData.components.length === 0) {
    return (
      <div className="exergy-wrapper">
        <div className="sankey-empty">No exergy data available</div>
      </div>
    );
  }

  const { components, totalDestruction, eta_II } = exergyData;
  const maxVal = Math.max(...components.map(c => c.destruction));

  return (
    <div className="exergy-wrapper">
      <svg
        className="dome-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Title */}
        <text x={WIDTH / 2} y={16} textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="600">
          Exergy Destruction by Component
        </text>

        {/* Bars */}
        {components.map((comp, i) => {
          const barH = Math.min(28, (PLOT_H - 10) / components.length - 4);
          const y = PAD.top + i * (barH + 4);
          const barW = maxVal > 0 ? (comp.destruction / maxVal) * PLOT_W : 0;

          // Prettify component name
          const label = comp.component.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

          return (
            <g key={i}>
              {/* Label */}
              <text
                x={PAD.left - 6}
                y={y + barH / 2 + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="9"
              >
                {label}
              </text>
              {/* Bar */}
              <rect
                x={PAD.left}
                y={y}
                width={Math.max(2, barW)}
                height={barH}
                rx="3"
                fill={comp.color}
                opacity="0.8"
              />
              {/* Value */}
              <text
                x={PAD.left + barW + 6}
                y={y + barH / 2 + 4}
                fill={comp.color}
                fontSize="9"
                fontWeight="600"
              >
                {comp.destruction.toFixed(1)} kJ/kg
              </text>
            </g>
          );
        })}

        {/* Summary line */}
        <line
          x1={PAD.left}
          y1={HEIGHT - PAD.bottom + 8}
          x2={PAD.left + PLOT_W}
          y2={HEIGHT - PAD.bottom + 8}
          stroke="#334155"
          strokeWidth="1"
        />
        <text x={PAD.left} y={HEIGHT - 8} fill="#94a3b8" fontSize="10">
          Total: {totalDestruction.toFixed(1)} kJ/kg
        </text>
        <text x={PAD.left + PLOT_W} y={HEIGHT - 8} textAnchor="end" fill="#06b6d4" fontSize="10" fontWeight="600">
          {'\u03B7'}_II = {(eta_II * 100).toFixed(1)}%
        </text>
      </svg>
    </div>
  );
}
