// Schematic layout for Carnot cycle.

export const carnotLayout = {
  components: [
    { id: 'compression', type: 'compression', x: 80, y: 60, width: 50, height: 50, label: '1→2 Isothermal Comp.', inletState: 1, outletState: 2 },
    { id: 'heat-addition', type: 'heat-addition', x: 320, y: 60, width: 50, height: 50, label: '2→3 Isentropic Heat', inletState: 2, outletState: 3 },
    { id: 'expansion', type: 'expansion', x: 320, y: 220, width: 50, height: 50, label: '3→4 Isothermal Exp.', inletState: 3, outletState: 4 },
    { id: 'heat-rejection', type: 'heat-rejection', x: 80, y: 220, width: 50, height: 50, label: '4→1 Isentropic Cool', inletState: 4, outletState: 1 },
  ],
  connections: [
    { from: 'compression', to: 'heat-addition', label: 'isothermal' },
    { from: 'heat-addition', to: 'expansion', label: 'isentropic' },
    { from: 'expansion', to: 'heat-rejection', label: 'isothermal' },
    { from: 'heat-rejection', to: 'compression', label: 'isentropic' },
  ],
  energyArrows: [
    { id: 'Q_out', type: 'heat_out', component: 'compression', side: 'left', value: null, unit: 'kJ/kg' },
    { id: 'Q_in', type: 'heat_in', component: 'expansion', side: 'right', value: null, unit: 'kJ/kg' },
  ],
};
