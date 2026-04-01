// Schematic layouts for Rankine-family cycles.
// Component positions are in SVG coordinates (viewBox 600×360).
// Energy arrow values are placeholders — filled at runtime from metrics.

export const rankineBasicLayout = {
  components: [
    { id: 'pump', type: 'pump', x: 80, y: 220, width: 40, height: 40, label: 'Pump', inletState: 1, outletState: 2 },
    { id: 'boiler', type: 'boiler', x: 260, y: 60, width: 50, height: 50, label: 'Boiler', inletState: 2, outletState: 3 },
    { id: 'turbine', type: 'turbine', x: 440, y: 60, width: 50, height: 50, label: 'Turbine', inletState: 3, outletState: 4 },
    { id: 'condenser', type: 'condenser', x: 260, y: 220, width: 50, height: 40, label: 'Condenser', inletState: 4, outletState: 1 },
  ],
  connections: [
    { from: 'pump', to: 'boiler', label: 'compressed liquid' },
    { from: 'boiler', to: 'turbine', label: 'superheated vapor' },
    { from: 'turbine', to: 'condenser', label: 'wet steam' },
    { from: 'condenser', to: 'pump', label: 'saturated liquid' },
  ],
  energyArrows: [
    { id: 'W_pump', type: 'work_in', component: 'pump', side: 'left', value: null, unit: 'kJ/kg' },
    { id: 'Q_boiler', type: 'heat_in', component: 'boiler', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'W_turbine', type: 'work_out', component: 'turbine', side: 'right', value: null, unit: 'kJ/kg' },
    { id: 'Q_condenser', type: 'heat_out', component: 'condenser', side: 'bottom', value: null, unit: 'kJ/kg' },
  ],
};

export const rankineReheatLayout = {
  components: [
    { id: 'pump', type: 'pump', x: 60, y: 240, width: 40, height: 40, label: 'Pump', inletState: 1, outletState: 2 },
    { id: 'boiler', type: 'boiler', x: 160, y: 60, width: 50, height: 50, label: 'Boiler', inletState: 2, outletState: 3 },
    { id: 'turbine-hp', type: 'turbine-hp', x: 280, y: 60, width: 45, height: 45, label: 'HP Turbine', inletState: 3, outletState: 4 },
    { id: 'reheater', type: 'reheater', x: 370, y: 60, width: 50, height: 50, label: 'Reheater', inletState: 4, outletState: 5 },
    { id: 'turbine-lp', type: 'turbine-lp', x: 470, y: 60, width: 45, height: 45, label: 'LP Turbine', inletState: 5, outletState: 6 },
    { id: 'condenser', type: 'condenser', x: 280, y: 240, width: 50, height: 40, label: 'Condenser', inletState: 6, outletState: 1 },
  ],
  connections: [
    { from: 'pump', to: 'boiler', label: 'liquid' },
    { from: 'boiler', to: 'turbine-hp', label: 'vapor' },
    { from: 'turbine-hp', to: 'reheater', label: 'steam' },
    { from: 'reheater', to: 'turbine-lp', label: 'vapor' },
    { from: 'turbine-lp', to: 'condenser', label: 'wet steam' },
    { from: 'condenser', to: 'pump', label: 'liquid' },
  ],
  energyArrows: [
    { id: 'W_pump', type: 'work_in', component: 'pump', side: 'left', value: null, unit: 'kJ/kg' },
    { id: 'Q_boiler', type: 'heat_in', component: 'boiler', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'Q_reheat', type: 'heat_in', component: 'reheater', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'W_hp', type: 'work_out', component: 'turbine-hp', side: 'right', value: null, unit: 'kJ/kg' },
    { id: 'W_lp', type: 'work_out', component: 'turbine-lp', side: 'right', value: null, unit: 'kJ/kg' },
    { id: 'Q_cond', type: 'heat_out', component: 'condenser', side: 'bottom', value: null, unit: 'kJ/kg' },
  ],
};

export const rankineRegenerativeLayout = {
  components: [
    { id: 'pump-1', type: 'pump-1', x: 50, y: 240, width: 36, height: 36, label: 'Pump 1', inletState: 1, outletState: 2 },
    { id: 'fwh', type: 'fwh', x: 150, y: 240, width: 50, height: 30, label: 'Open FWH', inletState: 2, outletState: 3 },
    { id: 'pump-2', type: 'pump-2', x: 260, y: 240, width: 36, height: 36, label: 'Pump 2', inletState: 3, outletState: 4 },
    { id: 'boiler', type: 'boiler', x: 260, y: 60, width: 50, height: 50, label: 'Boiler', inletState: 4, outletState: 5 },
    { id: 'turbine', type: 'turbine', x: 440, y: 60, width: 50, height: 50, label: 'Turbine', inletState: 5, outletState: 6 },
    { id: 'condenser', type: 'condenser', x: 440, y: 240, width: 50, height: 40, label: 'Condenser', inletState: 6, outletState: 1 },
  ],
  connections: [
    { from: 'condenser', to: 'pump-1', label: 'liquid' },
    { from: 'pump-1', to: 'fwh', label: 'liquid' },
    { from: 'fwh', to: 'pump-2', label: 'sat. liquid' },
    { from: 'pump-2', to: 'boiler', label: 'liquid' },
    { from: 'boiler', to: 'turbine', label: 'vapor' },
    { from: 'turbine', to: 'condenser', label: 'wet steam' },
    { from: 'turbine', to: 'fwh', label: 'bleed steam' },
  ],
  energyArrows: [
    { id: 'W_pump', type: 'work_in', component: 'pump-1', side: 'left', value: null, unit: 'kJ/kg' },
    { id: 'W_pump2', type: 'work_in', component: 'pump-2', side: 'left', value: null, unit: 'kJ/kg' },
    { id: 'Q_boiler', type: 'heat_in', component: 'boiler', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'W_turb', type: 'work_out', component: 'turbine', side: 'right', value: null, unit: 'kJ/kg' },
    { id: 'Q_cond', type: 'heat_out', component: 'condenser', side: 'bottom', value: null, unit: 'kJ/kg' },
  ],
};

export const rankineCogenerationLayout = {
  components: [
    { id: 'pump', type: 'pump', x: 80, y: 240, width: 40, height: 40, label: 'Pump', inletState: 1, outletState: 2 },
    { id: 'boiler', type: 'boiler', x: 240, y: 40, width: 50, height: 50, label: 'Boiler', inletState: 2, outletState: 3 },
    { id: 'turbine', type: 'turbine', x: 420, y: 40, width: 50, height: 50, label: 'Turbine', inletState: 3, outletState: 4 },
    { id: 'process-heater', type: 'process-heater', x: 420, y: 160, width: 50, height: 40, label: 'Process Heater', inletState: 4, outletState: 5 },
    { id: 'condenser', type: 'condenser', x: 240, y: 240, width: 50, height: 40, label: 'Condenser', inletState: 5, outletState: 1 },
  ],
  connections: [
    { from: 'pump', to: 'boiler', label: 'liquid' },
    { from: 'boiler', to: 'turbine', label: 'vapor' },
    { from: 'turbine', to: 'process-heater', label: 'steam' },
    { from: 'process-heater', to: 'condenser', label: 'liquid' },
    { from: 'condenser', to: 'pump', label: 'liquid' },
  ],
  energyArrows: [
    { id: 'W_pump', type: 'work_in', component: 'pump', side: 'left', value: null, unit: 'kJ/kg' },
    { id: 'Q_boiler', type: 'heat_in', component: 'boiler', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'W_turb', type: 'work_out', component: 'turbine', side: 'right', value: null, unit: 'kJ/kg' },
    { id: 'Q_process', type: 'heat_out', component: 'process-heater', side: 'right', value: null, unit: 'kJ/kg' },
    { id: 'Q_cond', type: 'heat_out', component: 'condenser', side: 'bottom', value: null, unit: 'kJ/kg' },
  ],
};
