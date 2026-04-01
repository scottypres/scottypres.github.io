import { useState, useCallback } from 'react';
import SaturationDome from './components/SaturationDome/SaturationDome';
import ParticleAnimation from './components/ParticleAnimation/ParticleAnimation';
import PropertyLookup from './components/PropertyLookup/PropertyLookup';

const TABS = [
  { id: 'dome', label: 'Saturation Dome' },
  { id: 'lookup', label: 'Property Lookup' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dome');
  const [thermoState, setThermoState] = useState({
    T: 100,       // °C
    P: 101.325,   // kPa
    v: 1.694,     // m³/kg
    h: 2676.1,    // kJ/kg
    s: 7.3549,    // kJ/(kg·K)
    u: 2506.1,    // kJ/kg
    x: 1.0,       // quality
    phase: 'Saturated Vapor',
  });

  const handleStateChange = useCallback((newState) => {
    setThermoState(newState);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>CycleViz</h1>
        <p className="subtitle">Interactive Thermodynamic Explorer</p>
      </header>

      <nav className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === 'dome' && (
          <div className="dome-view">
            <div className="dome-container">
              <SaturationDome
                thermoState={thermoState}
                onStateChange={handleStateChange}
              />
            </div>
            <div className="particle-container">
              <ParticleAnimation thermoState={thermoState} />
            </div>
          </div>
        )}

        {activeTab === 'lookup' && (
          <PropertyLookup />
        )}
      </main>
    </div>
  );
}
