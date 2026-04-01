// Thermodynamic constants for all supported substances

export const WATER = {
  name: 'Water (H₂O)',
  id: 'water',
  M: 18.015,       // kg/kmol
  R: 0.4615,       // kJ/(kg·K)
  T_critical: 373.946, // °C
  P_critical: 22064,   // kPa
  v_critical: 0.003155, // m³/kg
  T_triple: 0.01,      // °C
  P_triple: 0.6113,    // kPa
};

export const R134A = {
  name: 'R-134a',
  id: 'r134a',
  M: 102.03,
  R: 0.08149,
  T_critical: 101.06,  // °C
  P_critical: 4059.28, // kPa
  T_triple: -103.3,
};

export const R410A = {
  name: 'R-410a',
  id: 'r410a',
  M: 72.58,
  R: 0.11455,
  T_critical: 71.36,   // °C
  P_critical: 4901.2,  // kPa
};

export const AMMONIA = {
  name: 'Ammonia (NH₃)',
  id: 'ammonia',
  M: 17.031,
  R: 0.4882,
  T_critical: 132.25, // °C
  P_critical: 11333,  // kPa
};

export const AIR = {
  name: 'Air',
  id: 'air',
  M: 28.97,
  R: 0.287,       // kJ/(kg·K)
  cp: 1.005,      // kJ/(kg·K)
  cv: 0.718,      // kJ/(kg·K)
  k: 1.4,
};

export const NITROGEN = {
  name: 'Nitrogen (N₂)',
  id: 'nitrogen',
  M: 28.013,
  R: 0.2968,
  cp: 1.042,
  cv: 0.745,
  k: 1.400,
};

export const CO2 = {
  name: 'Carbon Dioxide (CO₂)',
  id: 'co2',
  M: 44.01,
  R: 0.1889,
  cp: 0.846,
  cv: 0.657,
  k: 1.289,
};

export const METHANE = {
  name: 'Methane (CH₄)',
  id: 'methane',
  M: 16.043,
  R: 0.5183,
  cp: 2.254,
  cv: 1.736,
  k: 1.299,
};

export const SUBSTANCES = {
  water: WATER,
  r134a: R134A,
  r410a: R410A,
  ammonia: AMMONIA,
  air: AIR,
  nitrogen: NITROGEN,
  co2: CO2,
  methane: METHANE,
};

export const IDEAL_GASES = ['air', 'nitrogen', 'co2', 'methane'];

export const PHASE = {
  COMPRESSED_LIQUID: 'Compressed Liquid',
  TWO_PHASE: 'Saturated Mixture',
  SATURATED_LIQUID: 'Saturated Liquid',
  SATURATED_VAPOR: 'Saturated Vapor',
  SUPERHEATED_VAPOR: 'Superheated Vapor',
  SUPERCRITICAL: 'Supercritical Fluid',
};
