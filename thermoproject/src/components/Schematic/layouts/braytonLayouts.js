// Schematic layouts for Brayton-family cycles.

export const braytonBasicLayout = {
  components: [
    { id: 'compressor', type: 'compressor', x: 80, y: 140, width: 50, height: 50, label: 'Compressor', inletState: 1, outletState: 2 },
    { id: 'combustion-chamber', type: 'combustion-chamber', x: 260, y: 60, width: 50, height: 50, label: 'Combustor', inletState: 2, outletState: 3 },
    { id: 'turbine', type: 'turbine', x: 440, y: 140, width: 50, height: 50, label: 'Turbine', inletState: 3, outletState: 4 },
    { id: 'heat-exchanger', type: 'heat-exchanger', x: 260, y: 240, width: 50, height: 40, label: 'Heat Rejection', inletState: 4, outletState: 1 },
  ],
  connections: [
    { from: 'compressor', to: 'combustion-chamber', label: 'compressed air' },
    { from: 'combustion-chamber', to: 'turbine', label: 'hot gas' },
    { from: 'turbine', to: 'heat-exchanger', label: 'exhaust' },
    { from: 'heat-exchanger', to: 'compressor', label: 'cool air' },
  ],
  energyArrows: [
    { id: 'W_comp', type: 'work_in', component: 'compressor', side: 'left', value: null, unit: 'kJ/kg' },
    { id: 'Q_in', type: 'heat_in', component: 'combustion-chamber', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'W_turb', type: 'work_out', component: 'turbine', side: 'right', value: null, unit: 'kJ/kg' },
    { id: 'Q_out', type: 'heat_out', component: 'heat-exchanger', side: 'bottom', value: null, unit: 'kJ/kg' },
  ],
};

export const braytonRegenerativeLayout = {
  components: [
    { id: 'compressor', type: 'compressor', x: 50, y: 140, width: 45, height: 45, label: 'Compressor', inletState: 1, outletState: 2 },
    { id: 'regenerator', type: 'regenerator-cold', x: 160, y: 140, width: 45, height: 40, label: 'Regenerator', inletState: 2, outletState: 3 },
    { id: 'combustion-chamber', type: 'combustion-chamber', x: 280, y: 50, width: 50, height: 50, label: 'Combustor', inletState: 3, outletState: 4 },
    { id: 'turbine', type: 'turbine', x: 430, y: 140, width: 50, height: 50, label: 'Turbine', inletState: 4, outletState: 5 },
    { id: 'regenerator-hot', type: 'regenerator-hot', x: 320, y: 240, width: 45, height: 40, label: 'Regen (hot)', inletState: 5, outletState: 6 },
    { id: 'heat-exchanger', type: 'heat-exchanger', x: 160, y: 240, width: 45, height: 40, label: 'Heat Rejection', inletState: 6, outletState: 1 },
  ],
  connections: [
    { from: 'compressor', to: 'regenerator', label: 'compressed' },
    { from: 'regenerator', to: 'combustion-chamber', label: 'preheated' },
    { from: 'combustion-chamber', to: 'turbine', label: 'hot gas' },
    { from: 'turbine', to: 'regenerator-hot', label: 'exhaust' },
    { from: 'regenerator-hot', to: 'heat-exchanger', label: 'cooled' },
    { from: 'heat-exchanger', to: 'compressor', label: 'cool air' },
  ],
  energyArrows: [
    { id: 'W_comp', type: 'work_in', component: 'compressor', side: 'left', value: null, unit: 'kJ/kg' },
    { id: 'Q_in', type: 'heat_in', component: 'combustion-chamber', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'W_turb', type: 'work_out', component: 'turbine', side: 'right', value: null, unit: 'kJ/kg' },
    { id: 'Q_out', type: 'heat_out', component: 'heat-exchanger', side: 'bottom', value: null, unit: 'kJ/kg' },
  ],
};

export const braytonReheatIntercoolLayout = {
  components: [
    { id: 'compressor-lp', type: 'compressor-lp', x: 30, y: 140, width: 42, height: 42, label: 'LP Comp', inletState: 1, outletState: 2 },
    { id: 'intercooler', type: 'intercooler', x: 110, y: 140, width: 42, height: 36, label: 'Intercooler', inletState: 2, outletState: 3 },
    { id: 'compressor-hp', type: 'compressor-hp', x: 190, y: 140, width: 42, height: 42, label: 'HP Comp', inletState: 3, outletState: 4 },
    { id: 'combustion-chamber', type: 'combustion-chamber', x: 270, y: 50, width: 50, height: 50, label: 'Combustor', inletState: 4, outletState: 5 },
    { id: 'turbine-hp', type: 'turbine-hp', x: 370, y: 50, width: 45, height: 45, label: 'HP Turb', inletState: 5, outletState: 6 },
    { id: 'reheater', type: 'reheater', x: 445, y: 50, width: 45, height: 45, label: 'Reheater', inletState: 6, outletState: 7 },
    { id: 'turbine-lp', type: 'turbine-lp', x: 520, y: 50, width: 45, height: 45, label: 'LP Turb', inletState: 7, outletState: 8 },
    { id: 'heat-exchanger', type: 'heat-exchanger', x: 270, y: 260, width: 50, height: 40, label: 'Heat Rejection', inletState: 8, outletState: 1 },
  ],
  connections: [
    { from: 'compressor-lp', to: 'intercooler', label: 'air' },
    { from: 'intercooler', to: 'compressor-hp', label: 'cooled air' },
    { from: 'compressor-hp', to: 'combustion-chamber', label: 'compressed' },
    { from: 'combustion-chamber', to: 'turbine-hp', label: 'hot gas' },
    { from: 'turbine-hp', to: 'reheater', label: 'gas' },
    { from: 'reheater', to: 'turbine-lp', label: 'reheated' },
    { from: 'turbine-lp', to: 'heat-exchanger', label: 'exhaust' },
    { from: 'heat-exchanger', to: 'compressor-lp', label: 'cool air' },
  ],
  energyArrows: [
    { id: 'W_lp_comp', type: 'work_in', component: 'compressor-lp', side: 'left', value: null, unit: 'kJ/kg' },
    { id: 'W_hp_comp', type: 'work_in', component: 'compressor-hp', side: 'left', value: null, unit: 'kJ/kg' },
    { id: 'Q_in', type: 'heat_in', component: 'combustion-chamber', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'Q_reheat', type: 'heat_in', component: 'reheater', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'W_hp_turb', type: 'work_out', component: 'turbine-hp', side: 'right', value: null, unit: 'kJ/kg' },
    { id: 'W_lp_turb', type: 'work_out', component: 'turbine-lp', side: 'right', value: null, unit: 'kJ/kg' },
    { id: 'Q_out', type: 'heat_out', component: 'heat-exchanger', side: 'bottom', value: null, unit: 'kJ/kg' },
    { id: 'Q_intercool', type: 'heat_out', component: 'intercooler', side: 'bottom', value: null, unit: 'kJ/kg' },
  ],
};

export const jetPropulsionLayout = {
  components: [
    { id: 'diffuser', type: 'diffuser', x: 40, y: 150, width: 45, height: 40, label: 'Diffuser', inletState: 1, outletState: 2 },
    { id: 'compressor', type: 'compressor', x: 140, y: 140, width: 50, height: 50, label: 'Compressor', inletState: 2, outletState: 3 },
    { id: 'combustion-chamber', type: 'combustion-chamber', x: 260, y: 60, width: 55, height: 50, label: 'Combustor', inletState: 3, outletState: 4 },
    { id: 'turbine', type: 'turbine', x: 400, y: 140, width: 50, height: 50, label: 'Turbine', inletState: 4, outletState: 5 },
    { id: 'nozzle', type: 'nozzle', x: 500, y: 150, width: 45, height: 40, label: 'Nozzle', inletState: 5, outletState: 1 },
  ],
  connections: [
    { from: 'diffuser', to: 'compressor', label: 'slowed air' },
    { from: 'compressor', to: 'combustion-chamber', label: 'compressed' },
    { from: 'combustion-chamber', to: 'turbine', label: 'hot gas' },
    { from: 'turbine', to: 'nozzle', label: 'gas' },
  ],
  energyArrows: [
    { id: 'Q_in', type: 'heat_in', component: 'combustion-chamber', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'W_turb', type: 'work_out', component: 'turbine', side: 'right', value: null, unit: 'kJ/kg' },
    { id: 'W_comp', type: 'work_in', component: 'compressor', side: 'left', value: null, unit: 'kJ/kg' },
  ],
};

export const combinedBraytonRankineLayout = {
  components: [
    // Brayton (top)
    { id: 'compressor', type: 'compressor', x: 40, y: 40, width: 45, height: 45, label: 'Compressor', inletState: 1, outletState: 2 },
    { id: 'combustion-chamber', type: 'combustion-chamber', x: 180, y: 30, width: 50, height: 50, label: 'Combustor', inletState: 2, outletState: 3 },
    { id: 'gas-turbine', type: 'gas-turbine', x: 340, y: 40, width: 50, height: 50, label: 'Gas Turbine', inletState: 3, outletState: 4 },
    { id: 'hrsg', type: 'hrsg', x: 460, y: 120, width: 50, height: 50, label: 'HRSG', inletState: 4, outletState: 1 },
    // Rankine (bottom)
    { id: 'pump', type: 'pump', x: 40, y: 260, width: 36, height: 36, label: 'Pump', inletState: 5, outletState: 6 },
    { id: 'hrsg-steam', type: 'hrsg-steam', x: 180, y: 200, width: 50, height: 50, label: 'Steam Gen', inletState: 6, outletState: 7 },
    { id: 'steam-turbine', type: 'steam-turbine', x: 340, y: 200, width: 50, height: 50, label: 'Steam Turbine', inletState: 7, outletState: 8 },
    { id: 'condenser', type: 'condenser', x: 340, y: 290, width: 50, height: 36, label: 'Condenser', inletState: 8, outletState: 5 },
  ],
  connections: [
    { from: 'compressor', to: 'combustion-chamber', label: 'compressed air' },
    { from: 'combustion-chamber', to: 'gas-turbine', label: 'hot gas' },
    { from: 'gas-turbine', to: 'hrsg', label: 'exhaust' },
    { from: 'pump', to: 'hrsg-steam', label: 'water' },
    { from: 'hrsg-steam', to: 'steam-turbine', label: 'steam' },
    { from: 'steam-turbine', to: 'condenser', label: 'wet steam' },
    { from: 'condenser', to: 'pump', label: 'liquid' },
  ],
  energyArrows: [
    { id: 'W_comp', type: 'work_in', component: 'compressor', side: 'left', value: null, unit: 'kJ/kg' },
    { id: 'Q_in', type: 'heat_in', component: 'combustion-chamber', side: 'top', value: null, unit: 'kJ/kg' },
    { id: 'W_gas_turb', type: 'work_out', component: 'gas-turbine', side: 'right', value: null, unit: 'kJ/kg' },
    { id: 'W_steam_turb', type: 'work_out', component: 'steam-turbine', side: 'right', value: null, unit: 'kJ/kg' },
    { id: 'W_pump', type: 'work_in', component: 'pump', side: 'left', value: null, unit: 'kJ/kg' },
    { id: 'Q_cond', type: 'heat_out', component: 'condenser', side: 'bottom', value: null, unit: 'kJ/kg' },
  ],
};
