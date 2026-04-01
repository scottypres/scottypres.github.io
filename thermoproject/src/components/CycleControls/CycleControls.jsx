import { useState, useCallback, useMemo } from 'react';

// Map cycle component names to the efficiency parameters they support
function getEfficiencySliders(cycleDef) {
  if (!cycleDef) return [];
  const components = (cycleDef.processes || []).map(p => p.component);
  const sliders = [];
  const seen = new Set();

  const hasTurbine = components.some(c => c.includes('turbine'));
  const hasCompressor = components.some(c => c.includes('compressor') || c === 'compression');
  const hasPump = components.some(c => c.includes('pump'));
  const hasNozzle = components.some(c => c === 'nozzle');
  const hasDiffuser = components.some(c => c === 'diffuser');
  const hasExpansion = components.some(c => c === 'expansion' || c === 'over-expansion');
  const hasRegenOrHX = components.some(c =>
    c.includes('regenerator') || c.includes('heat-exchanger') || c === 'hrsg'
  );

  if (hasTurbine && !seen.has('eta_turbine')) {
    sliders.push({ id: 'eta_turbine', label: 'Turbine Efficiency', default: 0.85 });
    seen.add('eta_turbine');
  }
  if (hasCompressor && !seen.has('eta_compressor')) {
    sliders.push({ id: 'eta_compressor', label: 'Compressor Efficiency', default: 0.80 });
    seen.add('eta_compressor');
  }
  if (hasPump && !seen.has('eta_pump')) {
    sliders.push({ id: 'eta_pump', label: 'Pump Efficiency', default: 0.75 });
    seen.add('eta_pump');
  }
  if (hasNozzle && !seen.has('eta_nozzle')) {
    sliders.push({ id: 'eta_nozzle', label: 'Nozzle Efficiency', default: 0.90 });
    seen.add('eta_nozzle');
  }
  if (hasDiffuser && !seen.has('eta_diffuser')) {
    sliders.push({ id: 'eta_diffuser', label: 'Diffuser Efficiency', default: 0.90 });
    seen.add('eta_diffuser');
  }
  if (hasExpansion && !hasTurbine && !seen.has('eta_expansion')) {
    sliders.push({ id: 'eta_expansion', label: 'Expansion Efficiency', default: 0.85 });
    seen.add('eta_expansion');
  }
  if (hasRegenOrHX && !seen.has('epsilon_regen')) {
    sliders.push({ id: 'epsilon_regen', label: 'Regenerator Effectiveness', default: 0.80 });
    seen.add('epsilon_regen');
  }

  // Fallback: if no specific components matched, offer a generic mechanical efficiency
  if (sliders.length === 0) {
    sliders.push({ id: 'eta_mechanical', label: 'Mechanical Efficiency', default: 0.90 });
  }

  return sliders;
}

/**
 * CycleControls — generic controls panel driven by a cycle definition's `inputs` array.
 *
 * Props:
 *  - cycleDef: cycle definition from cycleRegistry
 *  - values: current input values object { [inputId]: value }
 *  - onChange: callback(newValues) when any input changes
 */
export default function CycleControls({ cycleDef, values, onChange }) {
  const [isReal, setIsReal] = useState(false);
  const [T0, setT0] = useState(298.15); // dead state temp for exergy

  if (!cycleDef) return null;

  const inputs = cycleDef.inputs || [];
  const efficiencySliders = useMemo(() => getEfficiencySliders(cycleDef), [cycleDef]);

  const handleChange = useCallback((id, newVal) => {
    onChange({ ...values, [id]: newVal });
  }, [values, onChange]);

  const handleEfficiencyChange = useCallback((id, newVal) => {
    onChange({ ...values, [id]: newVal });
  }, [values, onChange]);

  const handleRealToggle = useCallback(() => {
    const next = !isReal;
    setIsReal(next);
    if (next) {
      const newVals = { ...values, isReal: true };
      for (const eff of efficiencySliders) {
        if (newVals[eff.id] == null) newVals[eff.id] = eff.default;
      }
      onChange(newVals);
    } else {
      const newVals = { ...values, isReal: false };
      for (const eff of efficiencySliders) {
        delete newVals[eff.id];
      }
      onChange(newVals);
    }
  }, [isReal, values, onChange, efficiencySliders]);

  return (
    <div className="panel cycle-controls">
      <div className="panel-title">Cycle Parameters</div>

      <div className="controls-grid">
        {inputs.map(input => {
          if (input.type === 'select') {
            return (
              <div key={input.id} className="control-item">
                <label className="control-label">{input.label}</label>
                <select
                  className="select-control"
                  value={values[input.id] || input.default}
                  onChange={e => handleChange(input.id, e.target.value)}
                >
                  {(input.options || []).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );
          }

          const val = values[input.id] ?? input.default;
          const step = input.step || 1;

          return (
            <div key={input.id} className="control-item">
              <label className="control-label">
                {input.label}
                {input.unit && <span className="control-unit"> ({input.unit})</span>}
              </label>
              <div className="slider-row">
                <button
                  className="step-btn"
                  onClick={() => handleChange(input.id, Math.max(input.min, val - step))}
                  aria-label={`Decrease ${input.label}`}
                >
                  -
                </button>
                <input
                  type="range"
                  className="slider"
                  min={input.min}
                  max={input.max}
                  step={step}
                  value={val}
                  onChange={e => handleChange(input.id, parseFloat(e.target.value))}
                />
                <button
                  className="step-btn"
                  onClick={() => handleChange(input.id, Math.min(input.max, val + step))}
                  aria-label={`Increase ${input.label}`}
                >
                  +
                </button>
              </div>
              <div className="slider-value">
                {typeof val === 'number' ? val.toFixed(step < 1 ? 2 : step < 10 ? 1 : 0) : val}
                {input.unit && <span className="control-unit"> {input.unit}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Real vs Ideal toggle */}
      <div className="real-toggle-section">
        <button
          className={`btn ${isReal ? 'btn-primary' : ''}`}
          onClick={handleRealToggle}
          style={{ width: '100%', marginTop: 8, height: 36, fontSize: '0.8rem' }}
        >
          {isReal ? 'Real (with losses)' : 'Ideal'}
        </button>

        {isReal && (
          <div className="efficiency-sliders">
            {efficiencySliders.map(eff => (
              <div key={eff.id} className="control-item control-item-sm">
                <label className="control-label">{eff.label}</label>
                <div className="slider-row">
                  <input
                    type="range"
                    className="slider"
                    min={0.5}
                    max={1.0}
                    step={0.01}
                    value={values[eff.id] ?? eff.default}
                    onChange={e => handleEfficiencyChange(eff.id, parseFloat(e.target.value))}
                  />
                  <span className="slider-value-inline">
                    {((values[eff.id] ?? eff.default) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dead state temperature */}
      <div className="control-item control-item-sm" style={{ marginTop: 8 }}>
        <label className="control-label">Dead State T₀ (K)</label>
        <div className="slider-row">
          <input
            type="range"
            className="slider"
            min={273}
            max={323}
            step={0.5}
            value={T0}
            onChange={e => {
              setT0(parseFloat(e.target.value));
              onChange({ ...values, T0: parseFloat(e.target.value) });
            }}
          />
          <span className="slider-value-inline">{T0.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
