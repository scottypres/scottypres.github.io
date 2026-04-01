import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import SaturationDome from './components/SaturationDome/SaturationDome';
import ParticleAnimation from './components/ParticleAnimation/ParticleAnimation';
import PropertyLookup from './components/PropertyLookup/PropertyLookup';
import CycleDiagram from './components/CycleDiagram/CycleDiagram';
import SchematicRenderer from './components/Schematic/SchematicRenderer';
import CycleControls from './components/CycleControls/CycleControls';
import CycleMetrics from './components/CycleMetrics/CycleMetrics';
import EquationsPanel from './components/CycleDiagram/EquationsPanel';
import SankeyDiagram from './components/Sankey/SankeyDiagram';
import CycleComparison from './components/CycleComparison/CycleComparison';
import ExergyChart from './components/Exergy/ExergyChart';
import Quiz from './components/Quiz/Quiz';
import { getCycleById, getCyclesByCategory, CATEGORY_LABELS } from './engine/cycles/cycleRegistry';
import { calculateCycle } from './engine/cycles/index.js';
import { getSchematicLayout, applyMetricsToLayout } from './components/Schematic/layouts/index';

const TABS = [
  { id: 'cycles', label: 'Cycles' },
  { id: 'compare', label: 'Compare' },
  { id: 'dome', label: 'Dome' },
  { id: 'lookup', label: 'Lookup' },
  { id: 'quiz', label: 'Quiz' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('cycles');
  const [isLandscape, setIsLandscape] = useState(false);

  // Detect landscape orientation for mobile
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight && window.innerWidth < 1024);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Dome state (preserved from original)
  const [thermoState, setThermoState] = useState({
    T: 100, P: 101.325, v: 1.694, h: 2676.1, s: 7.3549, u: 2506.1, x: 1.0,
    phase: 'Saturated Vapor',
  });
  const handleStateChange = useCallback((newState) => setThermoState(newState), []);

  // Cycle state
  const [selectedCycleId, setSelectedCycleId] = useState('rankine-basic');
  const [cycleInputs, setCycleInputs] = useState(() => getDefaultInputs('rankine-basic'));
  const [cycleStates, setCycleStates] = useState([]);
  const [cycleMetrics, setCycleMetrics] = useState({});
  const [cycleError, setCycleError] = useState(null);

  // View toggle for schematic area: 'schematic' | 'sankey' | 'exergy'
  const [schematicView, setSchematicView] = useState('schematic');

  // Diagram swipe support
  const [diagramIndex, setDiagramIndex] = useState(0);
  const touchStartRef = useRef(null);

  const cycleDef = useMemo(() => getCycleById(selectedCycleId), [selectedCycleId]);
  const cycleCategories = useMemo(() => getCyclesByCategory(), []);

  const runCycle = useCallback((cycleId, values) => {
    const result = calculateCycle(cycleId, values, values?.isReal === true);
    if (result?.error) {
      setCycleStates([]);
      setCycleMetrics({});
      setCycleError(result.message || 'Cycle calculation failed.');
      return;
    }
    setCycleStates(result?.states || []);
    setCycleMetrics(result?.metrics || {});
    setCycleError(null);
  }, []);

  // Initialize inputs from cycle defaults when cycle changes
  const handleCycleChange = useCallback((id) => {
    setSelectedCycleId(id);
    setDiagramIndex(0);
    const defaults = getDefaultInputs(id);
    setCycleInputs(defaults);
    runCycle(id, defaults);
  }, [runCycle]);

  const handleInputChange = useCallback((newValues) => {
    setCycleInputs(newValues);
    runCycle(selectedCycleId, newValues);
  }, [selectedCycleId, runCycle]);

  useEffect(() => {
    runCycle(selectedCycleId, cycleInputs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Schematic layout with runtime metrics applied
  const schematicLayout = useMemo(() => {
    const base = getSchematicLayout(selectedCycleId);
    return applyMetricsToLayout(base, cycleMetrics);
  }, [selectedCycleId, cycleMetrics]);

  // Available diagram types for swipe
  const availableDiagrams = cycleDef?.diagrams || ['Ts'];

  // Touch handlers for diagram swipe
  const handleTouchStart = useCallback((e) => {
    touchStartRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartRef.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current;
    touchStartRef.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0 && diagramIndex < availableDiagrams.length - 1) {
      setDiagramIndex(i => i + 1);
    } else if (dx > 0 && diagramIndex > 0) {
      setDiagramIndex(i => i - 1);
    }
  }, [diagramIndex, availableDiagrams.length]);

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
        {/* CYCLES TAB */}
        {activeTab === 'cycles' && (
          <div className="cycles-view">
            {/* Cycle Selector */}
            <div className="cycle-selector panel">
              <select
                className="select-control"
                value={selectedCycleId}
                onChange={e => handleCycleChange(e.target.value)}
              >
                {Object.entries(cycleCategories).map(([cat, cycles]) => (
                  <optgroup key={cat} label={CATEGORY_LABELS[cat]}>
                    {cycles.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Ch. {c.chapter})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className={`cycles-layout ${isLandscape ? 'cycles-layout-landscape' : ''}`}>
              {/* Left column: Controls */}
              <div className="cycles-sidebar">
                <CycleControls
                  cycleDef={cycleDef}
                  values={cycleInputs}
                  onChange={handleInputChange}
                />
              </div>

              {/* Center column: Diagrams */}
              <div
                className="cycles-main"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="panel diagram-panel-pinchable">
                  <div className="panel-title">
                    {cycleDef?.name || 'Select a Cycle'}
                    {availableDiagrams.length > 1 && (
                      <span className="diagram-dots">
                        {availableDiagrams.map((d, i) => (
                          <span key={d} className={`diagram-dot ${i === diagramIndex ? 'active' : ''}`} />
                        ))}
                      </span>
                    )}
                  </div>
                  {cycleError && (
                    <div className="cycle-error-banner">
                      {cycleError}
                    </div>
                  )}
                  <CycleDiagram
                    cycleDef={cycleDef}
                    states={cycleStates}
                    diagramType={availableDiagrams[diagramIndex]}
                    showDome={cycleDef?.hasDome}
                  />
                </div>

                {/* Schematic / Sankey / Exergy toggle */}
                {cycleDef?.hasSchematic && (
                  <div className="panel" style={{ marginTop: 12 }}>
                    <div className="view-toggle">
                      <button className={schematicView === 'schematic' ? 'active' : ''} onClick={() => setSchematicView('schematic')}>Schematic</button>
                      <button className={schematicView === 'sankey' ? 'active' : ''} onClick={() => setSchematicView('sankey')}>Sankey</button>
                      <button className={schematicView === 'exergy' ? 'active' : ''} onClick={() => setSchematicView('exergy')}>Exergy</button>
                    </div>

                    {schematicView === 'schematic' && schematicLayout && (
                      <SchematicRenderer layout={schematicLayout} />
                    )}
                    {schematicView === 'sankey' && (
                      <SankeyDiagram metrics={cycleMetrics} cycleDef={cycleDef} />
                    )}
                    {schematicView === 'exergy' && (
                      <ExergyChart
                        states={cycleStates}
                        metrics={cycleMetrics}
                        cycleDef={cycleDef}
                        T0={cycleInputs.T0 || 298.15}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Right column: Metrics */}
              <div className="cycles-metrics">
                <CycleMetrics
                  states={cycleStates}
                  metrics={cycleMetrics}
                  cycleDef={cycleDef}
                />
                <EquationsPanel cycleDef={cycleDef} />
              </div>
            </div>
          </div>
        )}

        {/* COMPARE TAB */}
        {activeTab === 'compare' && (
          <CycleComparison />
        )}

        {/* DOME TAB */}
        {activeTab === 'dome' && (
          <div className="dome-view">
            <div className="dome-container">
              <SaturationDome thermoState={thermoState} onStateChange={handleStateChange} />
            </div>
            <div className="particle-container">
              <ParticleAnimation thermoState={thermoState} />
            </div>
          </div>
        )}

        {/* LOOKUP TAB */}
        {activeTab === 'lookup' && <PropertyLookup />}

        {/* QUIZ TAB */}
        {activeTab === 'quiz' && (
          <Quiz />
        )}
      </main>
    </div>
  );
}

function getDefaultInputs(cycleId) {
  const def = getCycleById(cycleId);
  if (!def) return {};
  const defaults = {};
  for (const input of def.inputs || []) {
    defaults[input.id] = input.default;
  }
  return defaults;
}
