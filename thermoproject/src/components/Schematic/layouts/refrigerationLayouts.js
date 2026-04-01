// Schematic layouts for vapor-compression refrigeration and heat pump cycles.

export const vcrBasicLayout = {
  components: [
    { id: 'compressor', type: 'compressor', x: 80, y: 80, width: 50, height: 50, label: 'Compressor', inletState: 1, outletState: 2 },
    { id: 'condenser', type: 'condenser', x: 280, y: 60, width: 55, height: 45, label: 'Condenser', inletState: 2, outletState: 3 },
    { id: 'expansion-valve', type: 'expansion-valve', x: 440, y: 150, width: 40, height: 40, label: 'Exp. Valve', inletState: 3, outletState: 4 },
    { id: 'evaporator', type: 'evaporator', x: 280, y: 230, width: 55, height: 45, label: 'Evaporator', inletState: 4, outletState: 1 },
  ],
  connections: [
    { from: 'compressor', to: 'condenser', label: 'hot vapor' },
    { from: 'condenser', to: 'expansion-valve', label: 'sat. liquid' },
    { from: 'expansion-valve', to: 'evaporator', label: 'cold mix' },
    { from: 'evaporator', to: 'compressor', label: 'sat. vapor' },
  ],
  energyArrows: [
    { id: 'W_comp', type: 'work_in', component: 'compressor', side: 'left', value: null, unit: 'kJ/kg' },
    { id: 'Q_H', type: 'heat_out', component: 'condenser', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'Q_L', type: 'heat_in', component: 'evaporator', side: 'bottom', value: null, unit: 'kJ/kg' },
  ],
};

// Heat pump uses the same physical components as VCR
export const heatPumpLayout = {
  components: [
    { id: 'compressor', type: 'compressor', x: 80, y: 80, width: 50, height: 50, label: 'Compressor', inletState: 1, outletState: 2 },
    { id: 'condenser', type: 'condenser', x: 280, y: 60, width: 55, height: 45, label: 'Condenser (Hot)', inletState: 2, outletState: 3 },
    { id: 'expansion-valve', type: 'expansion-valve', x: 440, y: 150, width: 40, height: 40, label: 'Exp. Valve', inletState: 3, outletState: 4 },
    { id: 'evaporator', type: 'evaporator', x: 280, y: 230, width: 55, height: 45, label: 'Evaporator (Cold)', inletState: 4, outletState: 1 },
  ],
  connections: [
    { from: 'compressor', to: 'condenser', label: 'hot vapor' },
    { from: 'condenser', to: 'expansion-valve', label: 'sat. liquid' },
    { from: 'expansion-valve', to: 'evaporator', label: 'cold mix' },
    { from: 'evaporator', to: 'compressor', label: 'sat. vapor' },
  ],
  energyArrows: [
    { id: 'W_comp', type: 'work_in', component: 'compressor', side: 'left', value: null, unit: 'kJ/kg' },
    { id: 'Q_H', type: 'heat_out', component: 'condenser', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'Q_L', type: 'heat_in', component: 'evaporator', side: 'bottom', value: null, unit: 'kJ/kg' },
  ],
};
