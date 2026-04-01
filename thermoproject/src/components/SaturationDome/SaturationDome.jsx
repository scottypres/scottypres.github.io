import { useState } from 'react';
import DomeSVG from './DomeSVG';
import PropertyReadout from './PropertyReadout';

const VIEW_OPTIONS = [
  { id: 'Tv', label: 'T-v' },
  { id: 'Ts', label: 'T-s' },
  { id: 'Pv', label: 'P-v' },
  { id: 'Ph', label: 'P-h' },
];

// Constraint options: lock one property so the point moves along a single axis
const CONSTRAINTS = [
  { id: 'none', label: 'Free' },
  { id: 'fixT', label: 'Fix T' },
  { id: 'fixP', label: 'Fix P' },
  { id: 'fixV', label: 'Fix v' },
  { id: 'fixS', label: 'Fix s' },
];

export default function SaturationDome({ thermoState, onStateChange }) {
  const [viewType, setViewType] = useState('Tv');
  const [constraint, setConstraint] = useState('none');

  return (
    <div>
      <div className="view-toggle">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            className={viewType === opt.id ? 'active' : ''}
            onClick={() => setViewType(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="constraint-selector">
        {CONSTRAINTS.map((c) => (
          <button
            key={c.id}
            className={`constraint-btn ${constraint === c.id ? 'active' : ''}`}
            onClick={() => setConstraint(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <DomeSVG
          viewType={viewType}
          thermoState={thermoState}
          onStateChange={onStateChange}
          constraint={constraint}
        />
      </div>

      <PropertyReadout thermoState={thermoState} />
    </div>
  );
}
