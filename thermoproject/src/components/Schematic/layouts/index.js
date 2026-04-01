// Maps cycle IDs to their schematic layouts.

import { rankineBasicLayout, rankineReheatLayout, rankineRegenerativeLayout, rankineCogenerationLayout } from './rankineLayouts.js';
import { braytonBasicLayout, braytonRegenerativeLayout, braytonReheatIntercoolLayout, jetPropulsionLayout, combinedBraytonRankineLayout } from './braytonLayouts.js';
import { ottoLayout, dieselLayout, dualLayout, stirlingLayout, ericssonLayout, atkinsonLayout } from './pistonLayouts.js';
import { vcrBasicLayout, heatPumpLayout } from './refrigerationLayouts.js';
import { carnotLayout } from './carnotLayout.js';

const SCHEMATIC_LAYOUTS = {
  'rankine-basic': rankineBasicLayout,
  'rankine-reheat': rankineReheatLayout,
  'rankine-regenerative': rankineRegenerativeLayout,
  'rankine-cogeneration': rankineCogenerationLayout,
  'vcr-basic': vcrBasicLayout,
  'heat-pump': heatPumpLayout,
  'brayton-basic': braytonBasicLayout,
  'brayton-regenerative': braytonRegenerativeLayout,
  'brayton-reheat-intercool': braytonReheatIntercoolLayout,
  'jet-propulsion': jetPropulsionLayout,
  'otto': ottoLayout,
  'diesel': dieselLayout,
  'dual': dualLayout,
  'stirling': stirlingLayout,
  'ericsson': ericssonLayout,
  'atkinson': atkinsonLayout,
  'combined-brayton-rankine': combinedBraytonRankineLayout,
  'carnot': carnotLayout,
};

/** Get schematic layout for a cycle by ID */
export function getSchematicLayout(cycleId) {
  return SCHEMATIC_LAYOUTS[cycleId] || null;
}

/**
 * Apply runtime metric values to a layout's energy arrows.
 * Returns a new layout with values filled in from the metrics object.
 */
export function applyMetricsToLayout(layout, metrics) {
  if (!layout || !metrics) return layout;

  const metricKeyMap = {
    'W_pump': 'W_pump',
    'W_pump2': 'W_pump',
    'W_comp': 'W_compressor',
    'W_lp_comp': 'W_compressor',
    'W_hp_comp': 'W_compressor',
    'W_turb': 'W_turbine',
    'W_hp': 'W_turbine',
    'W_lp': 'W_turbine',
    'W_hp_turb': 'W_turbine',
    'W_lp_turb': 'W_turbine',
    'W_gas_turb': 'W_turbine',
    'W_steam_turb': 'W_turbine',
    'Q_boiler': 'Q_H',
    'Q_in': 'Q_H',
    'Q_reheat': 'Q_H',
    'Q_v': 'Q_H',
    'Q_p': 'Q_H',
    'Q_cond': 'Q_L',
    'Q_condenser': 'Q_L',
    'Q_out': 'Q_L',
    'Q_intercool': 'Q_L',
    'Q_process': 'Q_L',
    'Q_H': 'Q_H',
    'Q_L': 'Q_L',
  };

  return {
    ...layout,
    energyArrows: layout.energyArrows.map(arrow => {
      const metricKey = metricKeyMap[arrow.id];
      const value = metricKey ? metrics[metricKey] : undefined;
      return { ...arrow, value: value != null ? value : arrow.value };
    }),
  };
}
