// Cycle Registry — defines the shape of every thermodynamic cycle.
// Codex's calculation functions plug into these definitions.

const CYCLE_DEFINITIONS = [
  // ─── PHASE-CHANGE CYCLES (Chapter 11) ───────────────────────────────
  {
    id: 'rankine-basic',
    name: 'Basic Rankine Cycle',
    category: 'phase-change',
    chapter: 11,
    workingFluids: ['water'],
    stateCount: 4,
    processes: [
      { from: 1, to: 2, type: 'isentropic', component: 'pump' },
      { from: 2, to: 3, type: 'isobaric', component: 'boiler' },
      { from: 3, to: 4, type: 'isentropic', component: 'turbine' },
      { from: 4, to: 1, type: 'isobaric', component: 'condenser' },
    ],
    inputs: [
      { id: 'P_high', label: 'Boiler Pressure', unit: 'kPa', min: 500, max: 15000, default: 6000, step: 100 },
      { id: 'P_low', label: 'Condenser Pressure', unit: 'kPa', min: 5, max: 200, default: 10, step: 1 },
      { id: 'T3', label: 'Turbine Inlet Temp', unit: '°C', min: 200, max: 600, default: 400, step: 5 },
    ],
    metrics: ['eta_thermal', 'W_net', 'Q_H', 'Q_L', 'W_turbine', 'W_pump', 'BWR', 'eta_carnot'],
    diagrams: ['Ts', 'Pv'],
    hasSchematic: true,
    hasDome: true,
  },
  {
    id: 'rankine-reheat',
    name: 'Rankine with Reheat',
    category: 'phase-change',
    chapter: 11,
    workingFluids: ['water'],
    stateCount: 6,
    processes: [
      { from: 1, to: 2, type: 'isentropic', component: 'pump' },
      { from: 2, to: 3, type: 'isobaric', component: 'boiler' },
      { from: 3, to: 4, type: 'isentropic', component: 'turbine-hp' },
      { from: 4, to: 5, type: 'isobaric', component: 'reheater' },
      { from: 5, to: 6, type: 'isentropic', component: 'turbine-lp' },
      { from: 6, to: 1, type: 'isobaric', component: 'condenser' },
    ],
    inputs: [
      { id: 'P_high', label: 'Boiler Pressure', unit: 'kPa', min: 2000, max: 20000, default: 8000, step: 200 },
      { id: 'P_reheat', label: 'Reheat Pressure', unit: 'kPa', min: 200, max: 5000, default: 1000, step: 50 },
      { id: 'P_low', label: 'Condenser Pressure', unit: 'kPa', min: 5, max: 200, default: 10, step: 1 },
      { id: 'T3', label: 'HP Turbine Inlet', unit: '°C', min: 300, max: 600, default: 500, step: 5 },
      { id: 'T5', label: 'LP Turbine Inlet', unit: '°C', min: 300, max: 600, default: 500, step: 5 },
    ],
    metrics: ['eta_thermal', 'W_net', 'Q_H', 'Q_L', 'W_turbine', 'W_pump', 'eta_carnot'],
    diagrams: ['Ts', 'Pv'],
    hasSchematic: true,
    hasDome: true,
  },
  {
    id: 'rankine-regenerative',
    name: 'Regenerative Rankine (Open FWH)',
    category: 'phase-change',
    chapter: 11,
    workingFluids: ['water'],
    stateCount: 6,
    processes: [
      { from: 1, to: 2, type: 'isentropic', component: 'pump-1' },
      { from: 2, to: 3, type: 'isobaric', component: 'fwh' },
      { from: 3, to: 4, type: 'isentropic', component: 'pump-2' },
      { from: 4, to: 5, type: 'isobaric', component: 'boiler' },
      { from: 5, to: 6, type: 'isentropic', component: 'turbine' },
      { from: 6, to: 1, type: 'isobaric', component: 'condenser' },
    ],
    inputs: [
      { id: 'P_high', label: 'Boiler Pressure', unit: 'kPa', min: 2000, max: 20000, default: 8000, step: 200 },
      { id: 'P_bleed', label: 'Bleed Pressure', unit: 'kPa', min: 200, max: 5000, default: 2000, step: 50 },
      { id: 'P_low', label: 'Condenser Pressure', unit: 'kPa', min: 5, max: 200, default: 10, step: 1 },
      { id: 'T5', label: 'Turbine Inlet Temp', unit: '°C', min: 200, max: 600, default: 350, step: 5 },
    ],
    metrics: ['eta_thermal', 'W_net', 'Q_H', 'Q_L', 'W_turbine', 'W_pump', 'eta_carnot'],
    diagrams: ['Ts', 'Pv'],
    hasSchematic: true,
    hasDome: true,
  },
  {
    id: 'rankine-cogeneration',
    name: 'Cogeneration (Rankine-based)',
    category: 'phase-change',
    chapter: 11,
    workingFluids: ['water'],
    stateCount: 5,
    processes: [
      { from: 1, to: 2, type: 'isentropic', component: 'pump' },
      { from: 2, to: 3, type: 'isobaric', component: 'boiler' },
      { from: 3, to: 4, type: 'isentropic', component: 'turbine' },
      { from: 4, to: 5, type: 'isobaric', component: 'process-heater' },
      { from: 5, to: 1, type: 'isobaric', component: 'condenser' },
    ],
    inputs: [
      { id: 'P_high', label: 'Boiler Pressure', unit: 'kPa', min: 2000, max: 15000, default: 7000, step: 200 },
      { id: 'P_process', label: 'Process Pressure', unit: 'kPa', min: 100, max: 2000, default: 500, step: 50 },
      { id: 'P_low', label: 'Condenser Pressure', unit: 'kPa', min: 5, max: 200, default: 10, step: 1 },
      { id: 'T3', label: 'Turbine Inlet Temp', unit: '°C', min: 300, max: 600, default: 500, step: 5 },
    ],
    metrics: ['eta_thermal', 'W_net', 'Q_H', 'Q_L', 'W_turbine', 'W_pump', 'eta_carnot'],
    diagrams: ['Ts'],
    hasSchematic: true,
    hasDome: true,
  },

  // ─── VAPOR-COMPRESSION / REFRIGERATION CYCLES (Chapter 11) ──────────
  {
    id: 'vcr-basic',
    name: 'Vapor-Compression Refrigeration',
    category: 'phase-change',
    chapter: 11,
    workingFluids: ['r134a', 'r410a', 'ammonia'],
    stateCount: 4,
    processes: [
      { from: 1, to: 2, type: 'isentropic', component: 'compressor' },
      { from: 2, to: 3, type: 'isobaric', component: 'condenser' },
      { from: 3, to: 4, type: 'throttling', component: 'expansion-valve' },
      { from: 4, to: 1, type: 'isobaric', component: 'evaporator' },
    ],
    inputs: [
      { id: 'T_evap', label: 'Evaporator Temp', unit: '°C', min: -40, max: 10, default: -10, step: 1 },
      { id: 'T_cond', label: 'Condenser Temp', unit: '°C', min: 20, max: 60, default: 30, step: 1 },
      { id: 'fluid', label: 'Refrigerant', unit: '', min: 0, max: 0, default: 'r134a', step: 0, type: 'select', options: ['r134a', 'r410a', 'ammonia'] },
    ],
    metrics: ['COP', 'W_net', 'Q_H', 'Q_L', 'eta_carnot'],
    diagrams: ['Ts', 'Ph'],
    hasSchematic: true,
    hasDome: true,
  },
  {
    id: 'heat-pump',
    name: 'Heat Pump Cycle',
    category: 'phase-change',
    chapter: 11,
    workingFluids: ['r134a', 'r410a', 'ammonia'],
    stateCount: 4,
    processes: [
      { from: 1, to: 2, type: 'isentropic', component: 'compressor' },
      { from: 2, to: 3, type: 'isobaric', component: 'condenser' },
      { from: 3, to: 4, type: 'throttling', component: 'expansion-valve' },
      { from: 4, to: 1, type: 'isobaric', component: 'evaporator' },
    ],
    inputs: [
      { id: 'T_evap', label: 'Evaporator Temp', unit: '°C', min: -20, max: 15, default: 0, step: 1 },
      { id: 'T_cond', label: 'Condenser Temp', unit: '°C', min: 30, max: 70, default: 50, step: 1 },
      { id: 'fluid', label: 'Refrigerant', unit: '', min: 0, max: 0, default: 'r134a', step: 0, type: 'select', options: ['r134a', 'r410a', 'ammonia'] },
    ],
    metrics: ['COP', 'W_net', 'Q_H', 'Q_L', 'eta_carnot'],
    diagrams: ['Ts', 'Ph'],
    hasSchematic: true,
    hasDome: true,
  },

  // ─── IDEAL-GAS POWER CYCLES (Chapter 12) ────────────────────────────
  {
    id: 'brayton-basic',
    name: 'Basic Brayton Cycle',
    category: 'ideal-gas',
    chapter: 12,
    workingFluids: ['air'],
    stateCount: 4,
    processes: [
      { from: 1, to: 2, type: 'isentropic', component: 'compressor' },
      { from: 2, to: 3, type: 'isobaric', component: 'combustion-chamber' },
      { from: 3, to: 4, type: 'isentropic', component: 'turbine' },
      { from: 4, to: 1, type: 'isobaric', component: 'heat-exchanger' },
    ],
    inputs: [
      { id: 'T1', label: 'Compressor Inlet Temp', unit: 'K', min: 250, max: 350, default: 293.15, step: 1 },
      { id: 'P1', label: 'Inlet Pressure', unit: 'kPa', min: 50, max: 200, default: 100, step: 5 },
      { id: 'r_p', label: 'Pressure Ratio', unit: '', min: 2, max: 30, default: 8, step: 0.5 },
      { id: 'T3', label: 'Turbine Inlet Temp', unit: 'K', min: 800, max: 1800, default: 1073.15, step: 10 },
    ],
    metrics: ['eta_thermal', 'W_net', 'Q_H', 'Q_L', 'W_turbine', 'W_compressor', 'BWR', 'eta_carnot'],
    diagrams: ['Ts', 'Pv'],
    hasSchematic: true,
    hasDome: false,
  },
  {
    id: 'brayton-regenerative',
    name: 'Brayton with Regenerator',
    category: 'ideal-gas',
    chapter: 12,
    workingFluids: ['air'],
    stateCount: 6,
    processes: [
      { from: 1, to: 2, type: 'isentropic', component: 'compressor' },
      { from: 2, to: 3, type: 'isobaric', component: 'regenerator-cold' },
      { from: 3, to: 4, type: 'isobaric', component: 'combustion-chamber' },
      { from: 4, to: 5, type: 'isentropic', component: 'turbine' },
      { from: 5, to: 6, type: 'isobaric', component: 'regenerator-hot' },
      { from: 6, to: 1, type: 'isobaric', component: 'heat-exchanger' },
    ],
    inputs: [
      { id: 'T1', label: 'Compressor Inlet Temp', unit: 'K', min: 250, max: 350, default: 293.15, step: 1 },
      { id: 'P1', label: 'Inlet Pressure', unit: 'kPa', min: 50, max: 200, default: 100, step: 5 },
      { id: 'r_p', label: 'Pressure Ratio', unit: '', min: 2, max: 20, default: 8, step: 0.5 },
      { id: 'T4', label: 'Turbine Inlet Temp', unit: 'K', min: 800, max: 1800, default: 1073.15, step: 10 },
      { id: 'epsilon', label: 'Regenerator Effectiveness', unit: '', min: 0.5, max: 1.0, default: 0.8, step: 0.05 },
    ],
    metrics: ['eta_thermal', 'W_net', 'Q_H', 'Q_L', 'W_turbine', 'W_compressor', 'BWR', 'eta_carnot'],
    diagrams: ['Ts', 'Pv'],
    hasSchematic: true,
    hasDome: false,
  },
  {
    id: 'brayton-reheat-intercool',
    name: 'Brayton with Reheat & Intercooling',
    category: 'ideal-gas',
    chapter: 12,
    workingFluids: ['air'],
    stateCount: 8,
    processes: [
      { from: 1, to: 2, type: 'isentropic', component: 'compressor-lp' },
      { from: 2, to: 3, type: 'isobaric', component: 'intercooler' },
      { from: 3, to: 4, type: 'isentropic', component: 'compressor-hp' },
      { from: 4, to: 5, type: 'isobaric', component: 'combustion-chamber' },
      { from: 5, to: 6, type: 'isentropic', component: 'turbine-hp' },
      { from: 6, to: 7, type: 'isobaric', component: 'reheater' },
      { from: 7, to: 8, type: 'isentropic', component: 'turbine-lp' },
      { from: 8, to: 1, type: 'isobaric', component: 'heat-exchanger' },
    ],
    inputs: [
      { id: 'T1', label: 'Inlet Temp', unit: 'K', min: 250, max: 350, default: 293.15, step: 1 },
      { id: 'P1', label: 'Inlet Pressure', unit: 'kPa', min: 50, max: 200, default: 100, step: 5 },
      { id: 'r_p', label: 'Overall Pressure Ratio', unit: '', min: 4, max: 40, default: 16, step: 1 },
      { id: 'T5', label: 'HP Turbine Inlet', unit: 'K', min: 800, max: 1800, default: 1200, step: 10 },
      { id: 'T7', label: 'LP Turbine Inlet', unit: 'K', min: 800, max: 1800, default: 1200, step: 10 },
    ],
    metrics: ['eta_thermal', 'W_net', 'Q_H', 'Q_L', 'W_turbine', 'W_compressor', 'BWR', 'eta_carnot'],
    diagrams: ['Ts', 'Pv'],
    hasSchematic: true,
    hasDome: false,
  },
  {
    id: 'jet-propulsion',
    name: 'Jet Propulsion (Brayton)',
    category: 'ideal-gas',
    chapter: 12,
    workingFluids: ['air'],
    stateCount: 5,
    processes: [
      { from: 1, to: 2, type: 'isentropic', component: 'diffuser' },
      { from: 2, to: 3, type: 'isentropic', component: 'compressor' },
      { from: 3, to: 4, type: 'isobaric', component: 'combustion-chamber' },
      { from: 4, to: 5, type: 'isentropic', component: 'turbine' },
      { from: 5, to: 1, type: 'isentropic', component: 'nozzle' },
    ],
    inputs: [
      { id: 'T1', label: 'Ambient Temp', unit: 'K', min: 200, max: 330, default: 250, step: 5 },
      { id: 'P1', label: 'Ambient Pressure', unit: 'kPa', min: 20, max: 101, default: 50, step: 5 },
      { id: 'r_p', label: 'Compressor Pressure Ratio', unit: '', min: 5, max: 30, default: 12, step: 1 },
      { id: 'T4', label: 'Combustor Exit Temp', unit: 'K', min: 1000, max: 1800, default: 1400, step: 10 },
      { id: 'V1', label: 'Flight Velocity', unit: 'm/s', min: 50, max: 350, default: 250, step: 10 },
    ],
    metrics: ['eta_thermal', 'W_net', 'Q_H', 'Q_L', 'eta_carnot'],
    diagrams: ['Ts'],
    hasSchematic: true,
    hasDome: false,
  },

  // ─── PISTON-CYLINDER CYCLES (Chapter 12) ────────────────────────────
  {
    id: 'otto',
    name: 'Otto Cycle',
    category: 'ideal-gas',
    chapter: 12,
    workingFluids: ['air'],
    stateCount: 4,
    processes: [
      { from: 1, to: 2, type: 'isentropic', component: 'compression' },
      { from: 2, to: 3, type: 'isochoric', component: 'heat-addition' },
      { from: 3, to: 4, type: 'isentropic', component: 'expansion' },
      { from: 4, to: 1, type: 'isochoric', component: 'heat-rejection' },
    ],
    inputs: [
      { id: 'T1', label: 'Intake Temp', unit: 'K', min: 250, max: 400, default: 300, step: 5 },
      { id: 'P1', label: 'Intake Pressure', unit: 'kPa', min: 50, max: 200, default: 100, step: 5 },
      { id: 'r', label: 'Compression Ratio', unit: '', min: 4, max: 14, default: 8, step: 0.5 },
      { id: 'Q_in', label: 'Heat Input', unit: 'kJ/kg', min: 500, max: 3000, default: 2000, step: 50 },
    ],
    metrics: ['eta_thermal', 'W_net', 'Q_H', 'Q_L', 'eta_carnot'],
    diagrams: ['Ts', 'Pv'],
    hasSchematic: true,
    hasDome: false,
  },
  {
    id: 'diesel',
    name: 'Diesel Cycle',
    category: 'ideal-gas',
    chapter: 12,
    workingFluids: ['air'],
    stateCount: 4,
    processes: [
      { from: 1, to: 2, type: 'isentropic', component: 'compression' },
      { from: 2, to: 3, type: 'isobaric', component: 'heat-addition' },
      { from: 3, to: 4, type: 'isentropic', component: 'expansion' },
      { from: 4, to: 1, type: 'isochoric', component: 'heat-rejection' },
    ],
    inputs: [
      { id: 'T1', label: 'Intake Temp', unit: 'K', min: 250, max: 400, default: 300, step: 5 },
      { id: 'P1', label: 'Intake Pressure', unit: 'kPa', min: 50, max: 200, default: 100, step: 5 },
      { id: 'r', label: 'Compression Ratio', unit: '', min: 12, max: 24, default: 18, step: 0.5 },
      { id: 'Q_in', label: 'Heat Input', unit: 'kJ/kg', min: 500, max: 3000, default: 1800, step: 50 },
    ],
    metrics: ['eta_thermal', 'W_net', 'Q_H', 'Q_L', 'eta_carnot'],
    diagrams: ['Ts', 'Pv'],
    hasSchematic: true,
    hasDome: false,
  },
  {
    id: 'dual',
    name: 'Dual (Limited-Pressure) Cycle',
    category: 'ideal-gas',
    chapter: 12,
    workingFluids: ['air'],
    stateCount: 5,
    processes: [
      { from: 1, to: 2, type: 'isentropic', component: 'compression' },
      { from: 2, to: 3, type: 'isochoric', component: 'heat-addition-v' },
      { from: 3, to: 4, type: 'isobaric', component: 'heat-addition-p' },
      { from: 4, to: 5, type: 'isentropic', component: 'expansion' },
      { from: 5, to: 1, type: 'isochoric', component: 'heat-rejection' },
    ],
    inputs: [
      { id: 'T1', label: 'Intake Temp', unit: 'K', min: 250, max: 400, default: 300, step: 5 },
      { id: 'P1', label: 'Intake Pressure', unit: 'kPa', min: 50, max: 200, default: 100, step: 5 },
      { id: 'r', label: 'Compression Ratio', unit: '', min: 10, max: 22, default: 16, step: 0.5 },
      { id: 'r_p', label: 'Pressure Ratio (P3/P2)', unit: '', min: 1.0, max: 2.0, default: 1.3, step: 0.05 },
      { id: 'Q_in', label: 'Total Heat Input', unit: 'kJ/kg', min: 500, max: 3000, default: 1500, step: 50 },
    ],
    metrics: ['eta_thermal', 'W_net', 'Q_H', 'Q_L', 'eta_carnot'],
    diagrams: ['Ts', 'Pv'],
    hasSchematic: true,
    hasDome: false,
  },
  {
    id: 'stirling',
    name: 'Stirling Cycle',
    category: 'ideal-gas',
    chapter: 12,
    workingFluids: ['air', 'nitrogen'],
    stateCount: 4,
    processes: [
      { from: 1, to: 2, type: 'isothermal', component: 'compression' },
      { from: 2, to: 3, type: 'isochoric', component: 'regenerator-heat' },
      { from: 3, to: 4, type: 'isothermal', component: 'expansion' },
      { from: 4, to: 1, type: 'isochoric', component: 'regenerator-cool' },
    ],
    inputs: [
      { id: 'T_L', label: 'Low Temperature', unit: 'K', min: 250, max: 400, default: 300, step: 5 },
      { id: 'T_H', label: 'High Temperature', unit: 'K', min: 500, max: 1500, default: 900, step: 10 },
      { id: 'P1', label: 'Min Pressure', unit: 'kPa', min: 50, max: 500, default: 100, step: 10 },
      { id: 'r', label: 'Compression Ratio (v1/v2)', unit: '', min: 1.5, max: 10, default: 4, step: 0.5 },
    ],
    metrics: ['eta_thermal', 'W_net', 'Q_H', 'Q_L', 'eta_carnot'],
    diagrams: ['Ts', 'Pv'],
    hasSchematic: true,
    hasDome: false,
  },
  {
    id: 'ericsson',
    name: 'Ericsson Cycle',
    category: 'ideal-gas',
    chapter: 12,
    workingFluids: ['air'],
    stateCount: 4,
    processes: [
      { from: 1, to: 2, type: 'isothermal', component: 'compression' },
      { from: 2, to: 3, type: 'isobaric', component: 'regenerator-heat' },
      { from: 3, to: 4, type: 'isothermal', component: 'expansion' },
      { from: 4, to: 1, type: 'isobaric', component: 'regenerator-cool' },
    ],
    inputs: [
      { id: 'T_L', label: 'Low Temperature', unit: 'K', min: 250, max: 400, default: 300, step: 5 },
      { id: 'T_H', label: 'High Temperature', unit: 'K', min: 500, max: 1500, default: 900, step: 10 },
      { id: 'P1', label: 'Min Pressure', unit: 'kPa', min: 50, max: 500, default: 100, step: 10 },
      { id: 'r_p', label: 'Pressure Ratio', unit: '', min: 2, max: 20, default: 6, step: 0.5 },
    ],
    metrics: ['eta_thermal', 'W_net', 'Q_H', 'Q_L', 'eta_carnot'],
    diagrams: ['Ts', 'Pv'],
    hasSchematic: true,
    hasDome: false,
  },
  {
    id: 'atkinson',
    name: 'Atkinson Cycle',
    category: 'ideal-gas',
    chapter: 12,
    workingFluids: ['air'],
    stateCount: 4,
    processes: [
      { from: 1, to: 2, type: 'isentropic', component: 'compression' },
      { from: 2, to: 3, type: 'isochoric', component: 'heat-addition' },
      { from: 3, to: 4, type: 'isentropic', component: 'over-expansion' },
      { from: 4, to: 1, type: 'isobaric', component: 'heat-rejection' },
    ],
    inputs: [
      { id: 'T1', label: 'Intake Temp', unit: 'K', min: 250, max: 400, default: 300, step: 5 },
      { id: 'P1', label: 'Intake Pressure', unit: 'kPa', min: 50, max: 200, default: 100, step: 5 },
      { id: 'r_c', label: 'Compression Ratio', unit: '', min: 6, max: 14, default: 8, step: 0.5 },
      { id: 'r_e', label: 'Expansion Ratio', unit: '', min: 8, max: 20, default: 12, step: 0.5 },
      { id: 'Q_in', label: 'Heat Input', unit: 'kJ/kg', min: 500, max: 3000, default: 1500, step: 50 },
    ],
    metrics: ['eta_thermal', 'W_net', 'Q_H', 'Q_L', 'eta_carnot'],
    diagrams: ['Ts', 'Pv'],
    hasSchematic: true,
    hasDome: false,
  },

  // ─── COMBINED / SPECIAL CYCLES ──────────────────────────────────────
  {
    id: 'combined-brayton-rankine',
    name: 'Combined Brayton-Rankine',
    category: 'combined',
    chapter: 12,
    workingFluids: ['air', 'water'],
    stateCount: 8,
    processes: [
      // Brayton topping cycle
      { from: 1, to: 2, type: 'isentropic', component: 'compressor' },
      { from: 2, to: 3, type: 'isobaric', component: 'combustion-chamber' },
      { from: 3, to: 4, type: 'isentropic', component: 'gas-turbine' },
      { from: 4, to: 1, type: 'isobaric', component: 'hrsg' },
      // Rankine bottoming cycle
      { from: 5, to: 6, type: 'isentropic', component: 'pump' },
      { from: 6, to: 7, type: 'isobaric', component: 'hrsg-steam' },
      { from: 7, to: 8, type: 'isentropic', component: 'steam-turbine' },
      { from: 8, to: 5, type: 'isobaric', component: 'condenser' },
    ],
    inputs: [
      { id: 'T1', label: 'Gas Turbine Inlet (Ambient)', unit: 'K', min: 250, max: 330, default: 293.15, step: 1 },
      { id: 'r_p', label: 'Gas Turbine Pressure Ratio', unit: '', min: 5, max: 30, default: 14, step: 1 },
      { id: 'T3', label: 'Combustor Exit Temp', unit: 'K', min: 1000, max: 1800, default: 1400, step: 10 },
      { id: 'P_steam_high', label: 'Steam Boiler Pressure', unit: 'kPa', min: 2000, max: 15000, default: 6000, step: 200 },
      { id: 'P_steam_low', label: 'Steam Condenser Pressure', unit: 'kPa', min: 5, max: 100, default: 10, step: 1 },
    ],
    metrics: ['eta_thermal', 'W_net', 'Q_H', 'Q_L', 'eta_carnot'],
    diagrams: ['Ts'],
    hasSchematic: true,
    hasDome: false,
  },
  {
    id: 'carnot',
    name: 'Carnot Cycle',
    category: 'ideal-gas',
    chapter: 12,
    workingFluids: ['air'],
    stateCount: 4,
    processes: [
      { from: 1, to: 2, type: 'isothermal', component: 'compression' },
      { from: 2, to: 3, type: 'isentropic', component: 'heat-addition' },
      { from: 3, to: 4, type: 'isothermal', component: 'expansion' },
      { from: 4, to: 1, type: 'isentropic', component: 'heat-rejection' },
    ],
    inputs: [
      { id: 'T_L', label: 'Cold Reservoir Temp', unit: 'K', min: 200, max: 400, default: 300, step: 5 },
      { id: 'T_H', label: 'Hot Reservoir Temp', unit: 'K', min: 400, max: 1500, default: 800, step: 10 },
      { id: 'P1', label: 'Starting Pressure', unit: 'kPa', min: 50, max: 500, default: 100, step: 10 },
      { id: 'r', label: 'Compression Ratio', unit: '', min: 2, max: 15, default: 6, step: 0.5 },
    ],
    metrics: ['eta_thermal', 'W_net', 'Q_H', 'Q_L', 'eta_carnot'],
    diagrams: ['Ts', 'Pv'],
    hasSchematic: true,
    hasDome: false,
  },
];

// Build lookup maps
const cycleMap = new Map();
const categoryMap = new Map();

for (const cycle of CYCLE_DEFINITIONS) {
  cycleMap.set(cycle.id, cycle);
  if (!categoryMap.has(cycle.category)) {
    categoryMap.set(cycle.category, []);
  }
  categoryMap.get(cycle.category).push(cycle);
}

/** Get a cycle definition by id */
export function getCycleById(id) {
  return cycleMap.get(id) || null;
}

/** Get all cycle definitions */
export function getAllCycles() {
  return CYCLE_DEFINITIONS;
}

/** Get cycles grouped by category */
export function getCyclesByCategory() {
  return {
    'phase-change': categoryMap.get('phase-change') || [],
    'ideal-gas': categoryMap.get('ideal-gas') || [],
    'combined': categoryMap.get('combined') || [],
  };
}

/** Category display labels */
export const CATEGORY_LABELS = {
  'phase-change': 'Phase-Change Cycles',
  'ideal-gas': 'Ideal-Gas Power Cycles',
  'combined': 'Combined / Special Cycles',
};

/** Process type color map (used as fallback) */
export const PROCESS_COLORS = {
  isothermal: '#3b82f6',   // blue
  isentropic: '#22c55e',   // green
  isobaric: '#ef4444',     // red
  isochoric: '#f97316',    // orange
  polytropic: '#a855f7',   // purple
  throttling: '#94a3b8',   // gray dashed
};

/**
 * Palette of distinct colors for per-component coloring.
 * Used when a cycle has many processes sharing the same type.
 */
export const COMPONENT_PALETTE = [
  '#06b6d4', // cyan
  '#f97316', // orange
  '#22c55e', // green
  '#ef4444', // red
  '#a855f7', // purple
  '#3b82f6', // blue
  '#fbbf24', // amber
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#84cc16', // lime
];

export { CYCLE_DEFINITIONS };
