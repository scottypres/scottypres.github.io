import { calculateBrayton } from './brayton.js';
import { calculateRankine } from './rankine.js';
import { metricTemplate } from './common.js';

export function calculateCombinedCycle(inputs, isReal = false) {
  const braytonInputs = {
    T_1: inputs.T_1 ?? inputs.T1 ?? 293.15,
    P_1: inputs.P_1 ?? inputs.P1 ?? 100,
    r_p: inputs.r_p ?? 14,
    T_3: inputs.T_3 ?? inputs.T3 ?? 1400,
  };
  const brayton = calculateBrayton(braytonInputs, isReal);
  if (brayton.error) return brayton;

  const hrsgTurbineInletC =
    inputs.T_steam_inlet ??
    Math.max(250, (brayton.states[3].T - 273.15) * 0.7);

  const rankineInputs = {
    P_high: inputs.P_steam_high ?? inputs.P_high ?? 6000,
    P_low: inputs.P_steam_low ?? inputs.P_low ?? 10,
    T_3: hrsgTurbineInletC,
    eta_pump: inputs.eta_pump,
    eta_turbine: inputs.eta_turbine,
  };
  const rankine = calculateRankine(rankineInputs, isReal);
  if (rankine.error) return rankine;

  const etaCombined = 1 - (1 - brayton.metrics.eta_thermal) * (1 - rankine.metrics.eta_thermal);
  const W_net = brayton.metrics.W_net + rankine.metrics.W_net;
  const Q_H = brayton.metrics.Q_H;
  const Q_L = Q_H - W_net;

  const rankineStatesShifted = rankine.states.map((state, index) => ({
    ...state,
    stateNum: index + 5,
    component: `steam-${state.component}`,
  }));

  return {
    error: false,
    states: [
      ...brayton.states,
      ...rankineStatesShifted,
    ],
    metrics: metricTemplate({
      eta_thermal: etaCombined,
      eta_carnot: 1 - (brayton.states[0].T / brayton.states[2].T),
      W_net,
      Q_H,
      Q_L,
      W_turbine: (brayton.metrics.W_turbine ?? 0) + (rankine.metrics.W_turbine ?? 0),
      W_compressor: brayton.metrics.W_compressor,
      W_pump: rankine.metrics.W_pump,
      BWR: brayton.metrics.BWR,
    }),
    subcycles: {
      brayton,
      rankine,
    },
    isReal,
  };
}

