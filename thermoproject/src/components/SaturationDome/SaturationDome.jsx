import { useState } from 'react';
import DomeSVG from './DomeSVG';
import PropertyReadout from './PropertyReadout';

const VIEW_OPTIONS = [
  { id: 'Tv', label: 'T-v' },
  { id: 'Ts', label: 'T-s' },
  { id: 'Pv', label: 'P-v' },
  { id: 'Ph', label: 'P-h' },
];

export default function SaturationDome({ thermoState, onStateChange }) {
  const [viewType, setViewType] = useState('Tv');

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

      <div className="panel" style={{ marginBottom: 12 }}>
        <DomeSVG
          viewType={viewType}
          thermoState={thermoState}
          onStateChange={onStateChange}
        />
      </div>

      <PropertyReadout thermoState={thermoState} />
    </div>
  );
}
