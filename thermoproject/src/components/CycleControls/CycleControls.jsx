import { useState, useCallback } from 'react';

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

  const handleChange = useCallback((id, newVal) => {
    onChange({ ...values, [id]: newVal });
  }, [values, onChange]);

  const handleEfficiencyChange = useCallback((id, newVal) => {
    onChange({ ...values, [id]: newVal });
  }, [values, onChange]);

  const handleRealToggle = useCallback(() => {
    const next = !isReal;
    setIsReal(next);
    // When toggling to real, inject default efficiency values
    if (next) {
      const newVals = { ...values, isReal: true };
      if (!newVals.eta_turbine) newVals.eta_turbine = 0.85;
      if (!newVals.eta_compressor) newVals.eta_compressor = 0.80;
      if (!newVals.eta_pump) newVals.eta_pump = 0.75;
      onChange(newVals);
    } else {
      const { eta_turbine, eta_compressor, eta_pump, isReal: _, ...rest } = values;
      onChange({ ...rest, isReal: false });
    }
  }, [isReal, values, onChange]);

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
            {[
              { id: 'eta_turbine', label: 'Turbine Efficiency', default: 0.85 },
              { id: 'eta_compressor', label: 'Compressor Efficiency', default: 0.80 },
              { id: 'eta_pump', label: 'Pump Efficiency', default: 0.75 },
            ].map(eff => (
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
