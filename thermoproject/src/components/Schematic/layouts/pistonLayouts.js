// Schematic layouts for piston-cylinder (Otto, Diesel, Dual, Stirling, Ericsson, Atkinson, Carnot).
// These use a simplified 4-snapshot layout showing the piston at each state.

function makePistonCycleLayout(states, processLabels) {
  // Generic 4-state piston layout: 2×2 grid of piston-cylinder snapshots
  const positions = [
    { x: 80, y: 60 },   // State 1 (top-left)
    { x: 320, y: 60 },  // State 2 (top-right)
    { x: 320, y: 200 }, // State 3 (bottom-right)
    { x: 80, y: 200 },  // State 4 (bottom-left)
  ];

  return {
    components: states.map((s, i) => ({
      id: s.component,
      type: s.component,
      x: positions[i].x,
      y: positions[i].y,
      width: 50,
      height: 50,
      label: s.label || processLabels[i] || `State ${i + 1}`,
      inletState: i + 1,
      outletState: ((i + 1) % states.length) + 1,
    })),
    connections: states.map((s, i) => ({
      from: s.component,
      to: states[(i + 1) % states.length].component,
      label: processLabels[i] || '',
    })),
    energyArrows: [],
  };
}

export const ottoLayout = {
  components: [
    { id: 'compression', type: 'compression', x: 80, y: 60, width: 50, height: 50, label: '1→2 Isentropic', inletState: 1, outletState: 2 },
    { id: 'heat-addition', type: 'heat-addition', x: 320, y: 60, width: 50, height: 50, label: '2→3 Isochoric Q_in', inletState: 2, outletState: 3 },
    { id: 'expansion', type: 'expansion', x: 320, y: 220, width: 50, height: 50, label: '3→4 Isentropic', inletState: 3, outletState: 4 },
    { id: 'heat-rejection', type: 'heat-rejection', x: 80, y: 220, width: 50, height: 50, label: '4→1 Isochoric Q_out', inletState: 4, outletState: 1 },
  ],
  connections: [
    { from: 'compression', to: 'heat-addition', label: 'compression' },
    { from: 'heat-addition', to: 'expansion', label: 'heat addition' },
    { from: 'expansion', to: 'heat-rejection', label: 'expansion' },
    { from: 'heat-rejection', to: 'compression', label: 'heat rejection' },
  ],
  energyArrows: [
    { id: 'Q_in', type: 'heat_in', component: 'heat-addition', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'Q_out', type: 'heat_out', component: 'heat-rejection', side: 'bottom', value: null, unit: 'kJ/kg' },
  ],
};

export const dieselLayout = {
  components: [
    { id: 'compression', type: 'compression', x: 80, y: 60, width: 50, height: 50, label: '1→2 Isentropic', inletState: 1, outletState: 2 },
    { id: 'heat-addition', type: 'heat-addition', x: 320, y: 60, width: 50, height: 50, label: '2→3 Isobaric Q_in', inletState: 2, outletState: 3 },
    { id: 'expansion', type: 'expansion', x: 320, y: 220, width: 50, height: 50, label: '3→4 Isentropic', inletState: 3, outletState: 4 },
    { id: 'heat-rejection', type: 'heat-rejection', x: 80, y: 220, width: 50, height: 50, label: '4→1 Isochoric Q_out', inletState: 4, outletState: 1 },
  ],
  connections: [
    { from: 'compression', to: 'heat-addition', label: 'compression' },
    { from: 'heat-addition', to: 'expansion', label: 'heat addition' },
    { from: 'expansion', to: 'heat-rejection', label: 'expansion' },
    { from: 'heat-rejection', to: 'compression', label: 'heat rejection' },
  ],
  energyArrows: [
    { id: 'Q_in', type: 'heat_in', component: 'heat-addition', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'Q_out', type: 'heat_out', component: 'heat-rejection', side: 'bottom', value: null, unit: 'kJ/kg' },
  ],
};

export const dualLayout = {
  components: [
    { id: 'compression', type: 'compression', x: 50, y: 80, width: 46, height: 46, label: '1→2 Isentropic', inletState: 1, outletState: 2 },
    { id: 'heat-addition-v', type: 'heat-addition-v', x: 180, y: 40, width: 46, height: 46, label: '2→3 Isochoric', inletState: 2, outletState: 3 },
    { id: 'heat-addition-p', type: 'heat-addition-p', x: 330, y: 40, width: 46, height: 46, label: '3→4 Isobaric', inletState: 3, outletState: 4 },
    { id: 'expansion', type: 'expansion', x: 460, y: 80, width: 46, height: 46, label: '4→5 Isentropic', inletState: 4, outletState: 5 },
    { id: 'heat-rejection', type: 'heat-rejection', x: 260, y: 240, width: 50, height: 46, label: '5→1 Isochoric Q_out', inletState: 5, outletState: 1 },
  ],
  connections: [
    { from: 'compression', to: 'heat-addition-v', label: 'compression' },
    { from: 'heat-addition-v', to: 'heat-addition-p', label: 'const-v heat' },
    { from: 'heat-addition-p', to: 'expansion', label: 'const-P heat' },
    { from: 'expansion', to: 'heat-rejection', label: 'expansion' },
    { from: 'heat-rejection', to: 'compression', label: 'heat rejection' },
  ],
  energyArrows: [
    { id: 'Q_v', type: 'heat_in', component: 'heat-addition-v', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'Q_p', type: 'heat_in', component: 'heat-addition-p', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'Q_out', type: 'heat_out', component: 'heat-rejection', side: 'bottom', value: null, unit: 'kJ/kg' },
  ],
};

export const stirlingLayout = {
  components: [
    { id: 'compression', type: 'compression', x: 80, y: 60, width: 50, height: 50, label: '1→2 Isothermal', inletState: 1, outletState: 2 },
    { id: 'regenerator-heat', type: 'regenerator-heat', x: 320, y: 60, width: 50, height: 50, label: '2→3 Isochoric', inletState: 2, outletState: 3 },
    { id: 'expansion', type: 'expansion', x: 320, y: 220, width: 50, height: 50, label: '3→4 Isothermal', inletState: 3, outletState: 4 },
    { id: 'regenerator-cool', type: 'regenerator-cool', x: 80, y: 220, width: 50, height: 50, label: '4→1 Isochoric', inletState: 4, outletState: 1 },
  ],
  connections: [
    { from: 'compression', to: 'regenerator-heat', label: 'isothermal comp.' },
    { from: 'regenerator-heat', to: 'expansion', label: 'regeneration' },
    { from: 'expansion', to: 'regenerator-cool', label: 'isothermal exp.' },
    { from: 'regenerator-cool', to: 'compression', label: 'regeneration' },
  ],
  energyArrows: [
    { id: 'Q_in', type: 'heat_in', component: 'expansion', side: 'right', value: null, unit: 'kJ/kg' },
    { id: 'Q_out', type: 'heat_out', component: 'compression', side: 'left', value: null, unit: 'kJ/kg' },
  ],
};

export const ericssonLayout = {
  components: [
    { id: 'compression', type: 'compression', x: 80, y: 60, width: 50, height: 50, label: '1→2 Isothermal', inletState: 1, outletState: 2 },
    { id: 'regenerator-heat', type: 'regenerator-heat', x: 320, y: 60, width: 50, height: 50, label: '2→3 Isobaric', inletState: 2, outletState: 3 },
    { id: 'expansion', type: 'expansion', x: 320, y: 220, width: 50, height: 50, label: '3→4 Isothermal', inletState: 3, outletState: 4 },
    { id: 'regenerator-cool', type: 'regenerator-cool', x: 80, y: 220, width: 50, height: 50, label: '4→1 Isobaric', inletState: 4, outletState: 1 },
  ],
  connections: [
    { from: 'compression', to: 'regenerator-heat', label: 'isothermal comp.' },
    { from: 'regenerator-heat', to: 'expansion', label: 'regeneration' },
    { from: 'expansion', to: 'regenerator-cool', label: 'isothermal exp.' },
    { from: 'regenerator-cool', to: 'compression', label: 'regeneration' },
  ],
  energyArrows: [
    { id: 'Q_in', type: 'heat_in', component: 'expansion', side: 'right', value: null, unit: 'kJ/kg' },
    { id: 'Q_out', type: 'heat_out', component: 'compression', side: 'left', value: null, unit: 'kJ/kg' },
  ],
};

export const atkinsonLayout = {
  components: [
    { id: 'compression', type: 'compression', x: 80, y: 60, width: 50, height: 50, label: '1→2 Isentropic', inletState: 1, outletState: 2 },
    { id: 'heat-addition', type: 'heat-addition', x: 320, y: 60, width: 50, height: 50, label: '2→3 Isochoric Q_in', inletState: 2, outletState: 3 },
    { id: 'over-expansion', type: 'over-expansion', x: 320, y: 220, width: 50, height: 50, label: '3→4 Isentropic', inletState: 3, outletState: 4 },
    { id: 'heat-rejection', type: 'heat-rejection', x: 80, y: 220, width: 50, height: 50, label: '4→1 Isobaric Q_out', inletState: 4, outletState: 1 },
  ],
  connections: [
    { from: 'compression', to: 'heat-addition', label: 'compression' },
    { from: 'heat-addition', to: 'over-expansion', label: 'heat addition' },
    { from: 'over-expansion', to: 'heat-rejection', label: 'over-expansion' },
    { from: 'heat-rejection', to: 'compression', label: 'heat rejection' },
  ],
  energyArrows: [
    { id: 'Q_in', type: 'heat_in', component: 'heat-addition', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'Q_out', type: 'heat_out', component: 'heat-rejection', side: 'bottom', value: null, unit: 'kJ/kg' },
  ],
};
