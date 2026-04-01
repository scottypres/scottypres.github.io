import { useState } from 'react';
import { lookupProperties } from '../../engine/phaseDetermination';
import InterpolationSteps from './InterpolationSteps';

const SUBSTANCES = [
  { value: 'water', label: 'Water' },
  { value: 'r134a', label: 'R-134a' },
  { value: 'r410a', label: 'R-410a' },
  { value: 'ammonia', label: 'Ammonia (NH3)' },
  { value: 'air', label: 'Air' },
  { value: 'nitrogen', label: 'Nitrogen' },
  { value: 'co2', label: 'CO2' },
  { value: 'methane', label: 'Methane' },
];

const PROPERTIES = [
  { value: 'T', label: 'T (Temperature)', unit: 'C' },
  { value: 'P', label: 'P (Pressure)', unit: 'kPa' },
  { value: 'v', label: 'v (Specific Volume)', unit: 'm3/kg' },
  { value: 'h', label: 'h (Enthalpy)', unit: 'kJ/kg' },
  { value: 's', label: 's (Entropy)', unit: 'kJ/kg-K' },
  { value: 'u', label: 'u (Internal Energy)', unit: 'kJ/kg' },
  { value: 'x', label: 'x (Quality)', unit: '' },
];

const PHASE_CLASS_MAP = {
  'Compressed Liquid': 'compressed-liquid',
  'Saturated Mixture': 'two-phase',
  'Saturated Vapor': 'saturated-vapor',
  'Superheated Vapor': 'superheated-vapor',
  'Supercritical Fluid': 'supercritical',
};

function formatValue(val) {
  if (val == null || val === undefined) return '—';
  if (typeof val !== 'number') return String(val);
  if (Math.abs(val) < 0.001 && val !== 0) return val.toExponential(4);
  if (Math.abs(val) >= 1000) return val.toFixed(2);
  return val.toFixed(4);
}

export default function PropertyLookup() {
  const [substance, setSubstance] = useState('water');
  const [prop1Name, setProp1Name] = useState('T');
  const [prop1Value, setProp1Value] = useState('');
  const [prop2Name, setProp2Name] = useState('P');
  const [prop2Value, setProp2Value] = useState('');
  const [tempUnit, setTempUnit] = useState('C'); // 'C' or 'K'
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showSteps, setShowSteps] = useState(false);

  const handleCalculate = () => {
    setError(null);
    setResults(null);

    let v1 = parseFloat(prop1Value);
    let v2 = parseFloat(prop2Value);

    if (isNaN(v1) || isNaN(v2)) {
      setError('Please enter valid numeric values for both properties.');
      return;
    }

    if (prop1Name === prop2Name) {
      setError('Please select two different properties.');
      return;
    }

    // Convert K to C for the engine (engine works in C internally)
    if (tempUnit === 'K') {
      if (prop1Name === 'T') v1 = v1 - 273.15;
      if (prop2Name === 'T') v2 = v2 - 273.15;
    }

    try {
      const result = lookupProperties(substance, prop1Name, v1, prop2Name, v2);
      setResults(result);
    } catch (err) {
      setError(err.message || 'Calculation failed. Check your inputs.');
    }
  };

  const displayT = results ? (tempUnit === 'K' ? results.T + 273.15 : results.T) : null;
  const resultEntries = results
    ? [
        { label: 'T', value: displayT, unit: tempUnit === 'K' ? 'K' : '°C' },
        { label: 'P', value: results.P, unit: 'kPa' },
        { label: 'v', value: results.v, unit: 'm³/kg' },
        { label: 'u', value: results.u, unit: 'kJ/kg' },
        { label: 'h', value: results.h, unit: 'kJ/kg' },
        { label: 's', value: results.s, unit: 'kJ/(kg·K)' },
        { label: 'x', value: results.x, unit: '' },
      ]
    : [];

  return (
    <div className="panel" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="panel-title">Property Lookup</div>

      {/* Substance selector */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
          Substance
        </label>
        <select
          className="select-control"
          value={substance}
          onChange={(e) => setSubstance(e.target.value)}
        >
          {SUBSTANCES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Temperature unit toggle */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
          Temperature Unit
        </label>
        <div className="view-toggle">
          <button className={tempUnit === 'C' ? 'active' : ''} onClick={() => setTempUnit('C')}>°C</button>
          <button className={tempUnit === 'K' ? 'active' : ''} onClick={() => setTempUnit('K')}>K</button>
        </div>
      </div>

      {/* Property 1 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <select
          className="select-control"
          style={{ flex: '0 0 180px' }}
          value={prop1Name}
          onChange={(e) => setProp1Name(e.target.value)}
        >
          {PROPERTIES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <input
          className="input-control"
          type="number"
          placeholder="Value"
          value={prop1Value}
          onChange={(e) => setProp1Value(e.target.value)}
        />
      </div>

      {/* Property 2 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select
          className="select-control"
          style={{ flex: '0 0 180px' }}
          value={prop2Name}
          onChange={(e) => setProp2Name(e.target.value)}
        >
          {PROPERTIES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <input
          className="input-control"
          type="number"
          placeholder="Value"
          value={prop2Value}
          onChange={(e) => setProp2Value(e.target.value)}
        />
      </div>

      {/* Calculate button */}
      <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCalculate}>
        Calculate
      </button>

      {/* Error display */}
      {error && (
        <div style={{
          marginTop: 12,
          padding: '10px 14px',
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid var(--red)',
          borderRadius: 8,
          color: 'var(--red)',
          fontSize: '0.85rem',
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div style={{ marginTop: 16 }}>
          {results.phase && (
            <span className={`phase-badge ${PHASE_CLASS_MAP[results.phase] || ''}`}>
              {results.phase}
            </span>
          )}

          <div className="property-grid">
            {resultEntries.map((entry) => (
              <div key={entry.label} className="property-item">
                <div className="label">{entry.label}</div>
                <div className="value">
                  {formatValue(entry.value)}
                  {entry.unit && <span className="unit">{entry.unit}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Interpolation steps toggle */}
          {results.steps && (
            <div style={{ marginTop: 12 }}>
              <button
                className="btn"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  width: '100%',
                }}
                onClick={() => setShowSteps((prev) => !prev)}
              >
                {showSteps ? 'Hide' : 'Show'} Interpolation Steps
              </button>
              {showSteps && <InterpolationSteps steps={results.steps} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
