import { PHASE } from '../../engine/constants.js';

/**
 * Map phase string to CSS class suffix for the phase badge.
 */
function phaseClass(phase) {
  switch (phase) {
    case PHASE.COMPRESSED_LIQUID:
    case PHASE.SATURATED_LIQUID:
      return 'compressed-liquid';
    case PHASE.TWO_PHASE:
      return 'two-phase';
    case PHASE.SATURATED_VAPOR:
      return 'saturated-vapor';
    case PHASE.SUPERHEATED_VAPOR:
      return 'superheated-vapor';
    case PHASE.SUPERCRITICAL:
      return 'supercritical';
    default:
      return '';
  }
}

function fmt(value, decimals) {
  if (value == null || isNaN(value)) return '\u2014';
  return value.toFixed(decimals);
}

const PROPERTIES = [
  { key: 'T', label: 'Temperature', unit: '\u00B0C', decimals: 2 },
  { key: 'P', label: 'Pressure', unit: 'kPa', decimals: 2 },
  { key: 'v', label: 'Specific Vol.', unit: 'm\u00B3/kg', decimals: 5 },
  { key: 'h', label: 'Enthalpy', unit: 'kJ/kg', decimals: 1 },
  { key: 's', label: 'Entropy', unit: 'kJ/(kg\u00B7K)', decimals: 4 },
  { key: 'u', label: 'Int. Energy', unit: 'kJ/kg', decimals: 1 },
];

export default function PropertyReadout({ thermoState }) {
  const isTwoPhase =
    thermoState.phase === PHASE.TWO_PHASE ||
    thermoState.phase === PHASE.SATURATED_LIQUID ||
    thermoState.phase === PHASE.SATURATED_VAPOR;

  return (
    <div className="panel">
      <div className="panel-title">State Properties</div>

      <span className={`phase-badge ${phaseClass(thermoState.phase)}`}>
        {thermoState.phase}
      </span>

      <div className="property-grid">
        {PROPERTIES.map(({ key, label, unit, decimals }) => (
          <div className="property-item" key={key}>
            <div className="label">{label}</div>
            <div className="value">
              {fmt(thermoState[key], decimals)}
              <span className="unit">{unit}</span>
            </div>
          </div>
        ))}

        {/* Quality — only shown for two-phase states */}
        {isTwoPhase && thermoState.x != null && (
          <div className="property-item">
            <div className="label">Quality</div>
            <div className="value">
              {(thermoState.x * 100).toFixed(1)}
              <span className="unit">%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
