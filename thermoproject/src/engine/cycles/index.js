import { calculateCarnot } from './carnot.js';
import { calculatePolytropic } from './polytropic.js';
import { calculateOtto } from './otto.js';
import { calculateDiesel } from './diesel.js';
import { calculateDual } from './dual.js';
import { calculateBrayton } from './brayton.js';
import { calculateBraytonRegenerative } from './braytonRegenerative.js';
import { calculateBraytonReheatIntercool } from './braytonReheatIntercool.js';
import { calculateRankine } from './rankine.js';
import { calculateRankineReheat } from './rankineReheat.js';
import { calculateRankineRegenerative } from './rankineRegenerative.js';
import { calculateVaporCompression, calculateHeatPump } from './vaporCompression.js';
import { calculateStirling } from './stirling.js';
import { calculateEricsson } from './ericsson.js';
import { calculateAtkinson } from './atkinson.js';
import { calculateMiller } from './miller.js';
import { calculateJetPropulsion } from './jetPropulsion.js';
import { calculateAirRefrigeration } from './airRefrigeration.js';
import { calculateCogeneration } from './cogeneration.js';
import { calculateAbsorptionRefrigeration } from './absorptionRefrigeration.js';
import { calculateCombinedCycle } from './combinedCycle.js';

const CALCULATOR_MAP = {
  'rankine-basic': calculateRankine,
  'rankine-reheat': calculateRankineReheat,
  'rankine-regenerative': calculateRankineRegenerative,
  'rankine-cogeneration': calculateCogeneration,
  'vcr-basic': calculateVaporCompression,
  'heat-pump': calculateHeatPump,
  'brayton-basic': calculateBrayton,
  'brayton-regenerative': calculateBraytonRegenerative,
  'brayton-reheat-intercool': calculateBraytonReheatIntercool,
  'jet-propulsion': calculateJetPropulsion,
  otto: calculateOtto,
  diesel: calculateDiesel,
  dual: calculateDual,
  stirling: calculateStirling,
  ericsson: calculateEricsson,
  atkinson: calculateAtkinson,
  'combined-brayton-rankine': calculateCombinedCycle,
  carnot: calculateCarnot,

  // Additional calculators from the implementation plan
  polytropic: calculatePolytropic,
  miller: calculateMiller,
  'air-refrigeration': calculateAirRefrigeration,
  'absorption-refrigeration': calculateAbsorptionRefrigeration,
};

export function calculateCycle(cycleId, inputs, isReal = false) {
  const calculator = CALCULATOR_MAP[cycleId];
  if (!calculator) {
    return {
      error: true,
      message: `No calculator registered for cycle "${cycleId}"`,
    };
  }
  return calculator(inputs, isReal);
}

export {
  calculateCarnot,
  calculatePolytropic,
  calculateOtto,
  calculateDiesel,
  calculateDual,
  calculateBrayton,
  calculateBraytonRegenerative,
  calculateBraytonReheatIntercool,
  calculateRankine,
  calculateRankineReheat,
  calculateRankineRegenerative,
  calculateVaporCompression,
  calculateHeatPump,
  calculateStirling,
  calculateEricsson,
  calculateAtkinson,
  calculateMiller,
  calculateJetPropulsion,
  calculateAirRefrigeration,
  calculateCogeneration,
  calculateAbsorptionRefrigeration,
  calculateCombinedCycle,
};

