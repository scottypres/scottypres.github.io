export const testCases = {
  rankine: [
    {
      inputs: { P_high: 6000, P_low: 10, T_3: 400 },
      expectedMetrics: { eta_thermal: 0.298, W_net: 904.74, eta_carnot: 0.526 },
      tolerance: { eta_thermal: 0.01, W_net: 10, eta_carnot: 0.02 },
    },
    {
      inputs: { P_high: 8000, P_low: 8, T_3: 480 },
      expectedMetrics: { eta_thermal: 0.32 },
      tolerance: { eta_thermal: 0.03 },
    },
  ],
  rankineReheat: [
    {
      inputs: { P_high: 8000, P_reheat: 1000, P_low: 10, T3: 500, T5: 500 },
      expectedMetrics: { eta_thermal: 0.34 },
      tolerance: { eta_thermal: 0.05 },
    },
  ],
  rankineRegenerative: [
    {
      inputs: { P_high: 8000, P_bleed: 2000, P_low: 10, T5: 350 },
      expectedDerived: { bleed_fraction: 0.0864 },
      tolerance: { bleed_fraction: 0.03 },
    },
  ],
  vaporCompression: [
    {
      inputs: { refrigerant: 'r134a', T_evap: -10, T_cond: 30 },
      expectedMetrics: { COP: 3.544, Q_L: 129.93 },
      tolerance: { COP: 0.05, Q_L: 2 },
    },
    {
      inputs: { refrigerant: 'r410a', T_evap: -5, T_cond: 35 },
      expectedMetrics: { COP: 2.8 },
      tolerance: { COP: 0.3 },
    },
  ],
  brayton: [
    {
      inputs: { T_1: 293.15, P_1: 100, r_p: 8, T_3: 1073.15 },
      expectedMetrics: { eta_thermal: 0.496, W_net: 261.2, BWR: 0.498 },
      tolerance: { eta_thermal: 0.01, W_net: 5, BWR: 0.02 },
    },
  ],
  otto: [
    {
      inputs: { r: 8, T_1: 300, P_1: 100, Q_in: 2000 },
      expectedMetrics: { eta_thermal: 0.563, W_net: 1133 },
      tolerance: { eta_thermal: 0.005, W_net: 50 },
    },
  ],
  diesel: [
    {
      inputs: { r: 18, T_1: 300, P_1: 100, Q_in: 1800 },
      expectedMetrics: { eta_thermal: 0.55 },
      tolerance: { eta_thermal: 0.08 },
    },
  ],
  dual: [
    {
      inputs: { r: 16, r_p: 1.3, T_1: 300, P_1: 100, Q_in: 1500 },
      expectedMetrics: { eta_thermal: 0.58 },
      tolerance: { eta_thermal: 0.1 },
    },
  ],
  stirling: [
    {
      inputs: { T_L: 300, T_H: 900, P_1: 100, r: 4 },
      expectedMetrics: { eta_thermal: 0.667 },
      tolerance: { eta_thermal: 0.01 },
    },
  ],
  ericsson: [
    {
      inputs: { T_L: 300, T_H: 900, P_1: 100, r_p: 6 },
      expectedMetrics: { eta_thermal: 0.667 },
      tolerance: { eta_thermal: 0.01 },
    },
  ],
  atkinson: [
    {
      inputs: { r: 8, r_e: 12, T_1: 300, P_1: 100, Q_in: 1500 },
      expectedMetrics: { eta_thermal: 0.6 },
      tolerance: { eta_thermal: 0.1 },
    },
  ],
  carnot: [
    {
      inputs: { T_H: 800, T_L: 300, P_1: 100, r: 4 },
      expectedMetrics: { eta_thermal: 0.625 },
      tolerance: { eta_thermal: 0.01 },
    },
  ],
  jetPropulsion: [
    {
      inputs: { T_1: 250, P_1: 50, r_p: 12, T_4: 1400, V_0: 250 },
      expectedDerived: { thrust_specific: 200 },
      tolerance: { thrust_specific: 200 },
    },
  ],
  cogeneration: [
    {
      inputs: { P_high: 7000, P_process: 500, P_low: 10, T3: 500, fraction_extracted: 0.25 },
      expectedDerived: { utilization_factor: 0.7 },
      tolerance: { utilization_factor: 0.3 },
    },
  ],
  combinedCycle: [
    {
      inputs: { T_1: 293.15, r_p: 14, T_3: 1400, P_steam_high: 6000, P_steam_low: 10 },
      expectedMetrics: { eta_thermal: 0.55 },
      tolerance: { eta_thermal: 0.12 },
    },
  ],
};

export function withinTolerance(actual, expected, tolerance) {
  if (expected == null || tolerance == null || actual == null) return true;
  return Math.abs(actual - expected) <= tolerance;
}

