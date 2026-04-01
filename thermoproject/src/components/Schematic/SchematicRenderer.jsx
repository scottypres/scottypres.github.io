import { useMemo } from 'react';

const WIDTH = 600;
const HEIGHT = 360;

// ── Component Icons (each ~40×40 SVG sub-elements) ──────────────────

function TurbineIcon({ x, y, w = 40, h = 40 }) {
  // Trapezoid: wide top, narrow bottom
  return (
    <polygon
      points={`${x},${y} ${x + w},${y} ${x + w * 0.75},${y + h} ${x + w * 0.25},${y + h}`}
      fill="#1e3a2a"
      stroke="#22c55e"
      strokeWidth="1.5"
    />
  );
}

function CompressorIcon({ x, y, w = 40, h = 40 }) {
  // Trapezoid: narrow top, wide bottom
  return (
    <polygon
      points={`${x + w * 0.25},${y} ${x + w * 0.75},${y} ${x + w},${y + h} ${x},${y + h}`}
      fill="#3b1f0e"
      stroke="#f97316"
      strokeWidth="1.5"
    />
  );
}

function PumpIcon({ x, y, w = 40, h = 40 }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.min(w, h) / 2 - 2;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
      <polygon
        points={`${cx},${cy - r * 0.55} ${cx + r * 0.5},${cy + r * 0.35} ${cx - r * 0.5},${cy + r * 0.35}`}
        fill="#3b82f6"
        opacity="0.7"
      />
    </g>
  );
}

function BoilerIcon({ x, y, w = 40, h = 40 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#3b1a1a" stroke="#ef4444" strokeWidth="1.5" />
      {/* Flame */}
      <path
        d={`M${x + w / 2 - 5},${y + h - 6} Q${x + w / 2},${y + h - 18} ${x + w / 2 + 5},${y + h - 6}`}
        fill="#f97316"
        opacity="0.8"
      />
      <path
        d={`M${x + w / 2 - 3},${y + h - 8} Q${x + w / 2},${y + h - 15} ${x + w / 2 + 3},${y + h - 8}`}
        fill="#fbbf24"
        opacity="0.9"
      />
    </g>
  );
}

function CondenserIcon({ x, y, w = 40, h = 40 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
      {/* Cooling waves */}
      {[0.3, 0.5, 0.7].map((f, i) => (
        <path
          key={i}
          d={`M${x + 6},${y + h * f} Q${x + w / 2},${y + h * f - 4} ${x + w - 6},${y + h * f}`}
          fill="none"
          stroke="#60a5fa"
          strokeWidth="1"
          opacity="0.6"
        />
      ))}
    </g>
  );
}

function CombustionChamberIcon({ x, y, w = 40, h = 40 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#3b1a1a" stroke="#f97316" strokeWidth="1.5" />
      <path
        d={`M${x + w / 2 - 6},${y + h - 5} Q${x + w / 2},${y + 8} ${x + w / 2 + 6},${y + h - 5}`}
        fill="#ef4444"
        opacity="0.6"
      />
    </g>
  );
}

function HeatExchangerIcon({ x, y, w = 40, h = 40 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#1e293b" stroke="#a855f7" strokeWidth="1.5" />
      {/* Counter-flow arrows */}
      <line x1={x + 6} y1={y + h * 0.35} x2={x + w - 6} y2={y + h * 0.35} stroke="#ef4444" strokeWidth="1" markerEnd="url(#arrowRed)" />
      <line x1={x + w - 6} y1={y + h * 0.65} x2={x + 6} y2={y + h * 0.65} stroke="#3b82f6" strokeWidth="1" markerEnd="url(#arrowBlue)" />
    </g>
  );
}

function ExpansionValveIcon({ x, y, w = 40, h = 40 }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g>
      <polygon
        points={`${cx - w * 0.4},${cy - h * 0.35} ${cx},${cy} ${cx - w * 0.4},${cy + h * 0.35}`}
        fill="#1e293b"
        stroke="#94a3b8"
        strokeWidth="1.5"
      />
      <polygon
        points={`${cx + w * 0.4},${cy - h * 0.35} ${cx},${cy} ${cx + w * 0.4},${cy + h * 0.35}`}
        fill="#1e293b"
        stroke="#94a3b8"
        strokeWidth="1.5"
      />
    </g>
  );
}

function NozzleIcon({ x, y, w = 40, h = 40 }) {
  return (
    <polygon
      points={`${x},${y} ${x + w},${y + h * 0.25} ${x + w},${y + h * 0.75} ${x},${y + h}`}
      fill="#1e293b"
      stroke="#06b6d4"
      strokeWidth="1.5"
    />
  );
}

function DiffuserIcon({ x, y, w = 40, h = 40 }) {
  return (
    <polygon
      points={`${x},${y + h * 0.25} ${x + w},${y} ${x + w},${y + h} ${x},${y + h * 0.75}`}
      fill="#1e293b"
      stroke="#06b6d4"
      strokeWidth="1.5"
    />
  );
}

function FeedwaterHeaterIcon({ x, y, w = 40, h = 30 }) {
  return (
    <rect x={x} y={y} width={w} height={h} rx="3" fill="#1e293b" stroke="#a855f7" strokeWidth="1.5" />
  );
}

function EvaporatorIcon({ x, y, w = 40, h = 40 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#1a2e3b" stroke="#06b6d4" strokeWidth="1.5" />
      {/* Frost symbol */}
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fill="#06b6d4" fontSize="16" opacity="0.7">*</text>
    </g>
  );
}

function RegeneratorIcon({ x, y, w = 40, h = 40 }) {
  return <HeatExchangerIcon x={x} y={y} w={w} h={h} />;
}

function ProcessHeaterIcon({ x, y, w = 40, h = 40 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#2a1a0e" stroke="#f97316" strokeWidth="1.5" />
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fill="#f97316" fontSize="10" opacity="0.8">Q</text>
    </g>
  );
}

function GenericIcon({ x, y, w = 40, h = 40 }) {
  return <rect x={x} y={y} width={w} height={h} rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />;
}

const ICON_MAP = {
  'turbine': TurbineIcon,
  'turbine-hp': TurbineIcon,
  'turbine-lp': TurbineIcon,
  'gas-turbine': TurbineIcon,
  'steam-turbine': TurbineIcon,
  'compressor': CompressorIcon,
  'compressor-lp': CompressorIcon,
  'compressor-hp': CompressorIcon,
  'pump': PumpIcon,
  'pump-1': PumpIcon,
  'pump-2': PumpIcon,
  'boiler': BoilerIcon,
  'hrsg': BoilerIcon,
  'hrsg-steam': BoilerIcon,
  'condenser': CondenserIcon,
  'combustion-chamber': CombustionChamberIcon,
  'heat-exchanger': HeatExchangerIcon,
  'regenerator': RegeneratorIcon,
  'regenerator-cold': RegeneratorIcon,
  'regenerator-hot': RegeneratorIcon,
  'expansion-valve': ExpansionValveIcon,
  'nozzle': NozzleIcon,
  'diffuser': DiffuserIcon,
  'fwh': FeedwaterHeaterIcon,
  'evaporator': EvaporatorIcon,
  'reheater': BoilerIcon,
  'intercooler': CondenserIcon,
  'process-heater': ProcessHeaterIcon,
  // Piston-cylinder processes use generic boxes
  'compression': GenericIcon,
  'expansion': GenericIcon,
  'over-expansion': GenericIcon,
  'heat-addition': BoilerIcon,
  'heat-addition-v': BoilerIcon,
  'heat-addition-p': BoilerIcon,
  'heat-rejection': CondenserIcon,
  'regenerator-heat': RegeneratorIcon,
  'regenerator-cool': RegeneratorIcon,
};

// ── Energy arrow helper ──────────────────────────────────────────────

function EnergyArrow({ arrow, components }) {
  const comp = components.find(c => c.id === arrow.component);
  if (!comp) return null;

  const cw = comp.width || 40;
  const ch = comp.height || 40;
  const cx = comp.x + cw / 2;
  const cy = comp.y + ch / 2;

  const arrowLen = 40;
  let x1, y1, x2, y2;

  switch (arrow.side) {
    case 'top':
      x1 = cx; y1 = comp.y - arrowLen; x2 = cx; y2 = comp.y - 4;
      break;
    case 'bottom':
      x1 = cx; y1 = comp.y + ch + 4; x2 = cx; y2 = comp.y + ch + arrowLen;
      break;
    case 'left':
      x1 = comp.x - arrowLen; y1 = cy; x2 = comp.x - 4; y2 = cy;
      break;
    case 'right':
      x1 = comp.x + cw + 4; y1 = cy; x2 = comp.x + cw + arrowLen; y2 = cy;
      break;
    default:
      return null;
  }

  // Flip direction for "out" arrows
  const isOut = arrow.type === 'work_out' || arrow.type === 'heat_out';
  if (isOut) {
    [x1, y1, x2, y2] = [x2, y2, x1, y1];
  }

  const isWork = arrow.type === 'work_in' || arrow.type === 'work_out';
  const color = isWork ? '#22c55e' : '#ef4444';
  const thickness = Math.max(1.5, Math.min(4, (arrow.value || 100) / 500));

  const labelX = (x1 + x2) / 2;
  const labelY = (y1 + y2) / 2;
  const isVertical = arrow.side === 'top' || arrow.side === 'bottom';

  return (
    <g>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={thickness}
        markerEnd={`url(#arrow${isWork ? 'Green' : 'Red'})`}
      />
      {arrow.value != null && (
        <text
          x={labelX + (isVertical ? 14 : 0)}
          y={labelY + (isVertical ? 0 : -8)}
          textAnchor="middle"
          fill={color}
          fontSize="8"
          fontWeight="600"
        >
          {typeof arrow.value === 'number' ? arrow.value.toFixed(1) : arrow.value}
          {arrow.unit ? ` ${arrow.unit}` : ''}
        </text>
      )}
    </g>
  );
}

// ── Flow connection line with animated dots ──────────────────────────

function FlowConnection({ from, to, components }) {
  const compFrom = components.find(c => c.id === from);
  const compTo = components.find(c => c.id === to);
  if (!compFrom || !compTo) return null;

  const fw = compFrom.width || 40;
  const fh = compFrom.height || 40;
  const tw = compTo.width || 40;
  const th = compTo.height || 40;

  // Connect centers, offset to edges
  const fx = compFrom.x + fw / 2;
  const fy = compFrom.y + fh / 2;
  const tx = compTo.x + tw / 2;
  const ty = compTo.y + th / 2;

  // Simple line for now — could be upgraded to routed paths
  const pathId = `flow-${from}-${to}`;

  return (
    <g>
      <line
        x1={fx} y1={fy} x2={tx} y2={ty}
        stroke="#475569"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Animated flow dot */}
      <circle r="2.5" fill="#94a3b8">
        <animateMotion dur="2s" repeatCount="indefinite">
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
      <path
        id={pathId}
        d={`M${fx},${fy} L${tx},${ty}`}
        fill="none"
        stroke="none"
      />
    </g>
  );
}

// ── Main SchematicRenderer ───────────────────────────────────────────

/**
 * SchematicRenderer — renders an energy flow schematic for a cycle.
 *
 * Props:
 *  - layout: { components, connections, energyArrows }
 *  - metrics: computed metric values (to fill arrow values at runtime)
 */
export default function SchematicRenderer({ layout }) {
  if (!layout) return null;

  const { components = [], connections = [], energyArrows = [] } = layout;

  return (
    <div className="schematic-wrapper">
      <svg
        className="dome-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="arrowGreen" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 Z" fill="#22c55e" />
          </marker>
          <marker id="arrowRed" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 Z" fill="#ef4444" />
          </marker>
          <marker id="arrowBlue" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 Z" fill="#3b82f6" />
          </marker>
          <marker id="flowArrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 Z" fill="#475569" />
          </marker>
        </defs>

        {/* Flow connections (drawn first, behind components) */}
        {connections.map((conn, i) => (
          <FlowConnection
            key={i}
            from={conn.from}
            to={conn.to}
            components={components}
          />
        ))}

        {/* Component icons + labels */}
        {components.map(comp => {
          const Icon = ICON_MAP[comp.type] || GenericIcon;
          return (
            <g key={comp.id}>
              <Icon
                x={comp.x}
                y={comp.y}
                w={comp.width || 40}
                h={comp.height || 40}
              />
              <text
                x={comp.x + (comp.width || 40) / 2}
                y={comp.y + (comp.height || 40) + 12}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="9"
                fontWeight="500"
              >
                {comp.label || comp.id}
              </text>
            </g>
          );
        })}

        {/* Energy arrows */}
        {energyArrows.map((arrow, i) => (
          <EnergyArrow key={i} arrow={arrow} components={components} />
        ))}
      </svg>
    </div>
  );
}
