const CYCLE_TOPICS = [
  { id: 'rankine-basic', label: 'Rankine cycle' },
  { id: 'rankine-reheat', label: 'Reheat Rankine cycle' },
  { id: 'rankine-regenerative', label: 'Regenerative Rankine cycle' },
  { id: 'rankine-cogeneration', label: 'Cogeneration cycle' },
  { id: 'vcr-basic', label: 'Vapor-compression refrigeration cycle' },
  { id: 'heat-pump', label: 'Heat-pump cycle' },
  { id: 'brayton-basic', label: 'Brayton cycle' },
  { id: 'brayton-regenerative', label: 'Regenerative Brayton cycle' },
  { id: 'brayton-reheat-intercool', label: 'Reheat/intercooled Brayton cycle' },
  { id: 'jet-propulsion', label: 'Jet-propulsion cycle' },
  { id: 'otto', label: 'Otto cycle' },
  { id: 'diesel', label: 'Diesel cycle' },
  { id: 'dual', label: 'Dual cycle' },
  { id: 'stirling', label: 'Stirling cycle' },
  { id: 'ericsson', label: 'Ericsson cycle' },
  { id: 'atkinson', label: 'Atkinson cycle' },
  { id: 'carnot', label: 'Carnot cycle' },
  { id: 'combined-brayton-rankine', label: 'Combined Brayton-Rankine cycle' },
];

const TYPE_A_PROMPTS = [
  {
    question: 'An unlabeled loop has two nearly vertical lines on a T-s plot joined by two curved heat-transfer paths. Which cycle is most likely?',
    options: ['rankine-basic', 'otto', 'brayton-basic'],
    answer: 'rankine-basic',
    explanation: 'Rankine-style turbine and pump stages appear as near-isentropic lines on T-s diagrams with heat-addition and rejection legs.',
  },
  {
    question: 'On a P-v plot, one process is constant volume heat addition followed by isentropic expansion. Which cycle does this indicate?',
    options: ['otto', 'diesel', 'brayton-basic'],
    answer: 'otto',
    explanation: 'The Otto cycle uses constant-volume heat addition and isentropic compression/expansion.',
  },
  {
    question: 'A cycle rectangle-like pattern on T-s has two isobars and two isentropes for a gas turbine. Which cycle is it?',
    options: ['brayton-basic', 'rankine-basic', 'vcr-basic'],
    answer: 'brayton-basic',
    explanation: 'The ideal Brayton cycle is composed of two isentropic and two isobaric processes.',
  },
  {
    question: 'A refrigeration loop with an isenthalpic throttling leg on P-h is most likely which cycle?',
    options: ['vcr-basic', 'air-refrigeration', 'rankine-basic'],
    answer: 'vcr-basic',
    explanation: 'Vapor-compression systems include throttling through an expansion valve (approximately constant enthalpy).',
  },
  {
    question: 'A cycle with two isothermal and two isentropic processes represents which ideal benchmark?',
    options: ['carnot', 'otto', 'diesel'],
    answer: 'carnot',
    explanation: 'The Carnot cycle is defined by two isotherms and two isentropes.',
  },
];

const TYPE_B_PROMPTS = [
  {
    question: 'If boiler pressure increases while turbine inlet temperature is fixed, thermal efficiency usually ___',
    options: ['increase', 'decrease', 'remain the same'],
    answer: 'increase',
    explanation: 'Higher average heat-addition temperature generally improves cycle efficiency.',
  },
  {
    question: 'If condenser pressure increases in a Rankine-like cycle, thermal efficiency usually ___',
    options: ['decrease', 'increase', 'remain the same'],
    answer: 'decrease',
    explanation: 'Higher sink temperature raises heat rejection and lowers net work potential.',
  },
  {
    question: 'For an ideal Brayton cycle, increasing pressure ratio (below optimum) tends to make efficiency ___',
    options: ['increase', 'decrease', 'remain the same'],
    answer: 'increase',
    explanation: 'Ideal Brayton efficiency grows with pressure ratio for fixed specific-heat ratio.',
  },
  {
    question: 'If compressor isentropic efficiency drops, required compressor work will ___',
    options: ['increase', 'decrease', 'remain the same'],
    answer: 'increase',
    explanation: 'Lower efficiency means more actual enthalpy rise for the same pressure ratio.',
  },
  {
    question: 'If evaporator temperature rises in a vapor-compression system (same condenser temperature), COP tends to ___',
    options: ['increase', 'decrease', 'remain the same'],
    answer: 'increase',
    explanation: 'Reducing lift (T_cond - T_evap) lowers compression work per unit cooling.',
  },
];

const TYPE_C_PROMPTS = [
  {
    question: 'Given h1 and h2 at compressor inlet/outlet, compressor specific work is ___',
    options: ['h2 - h1', 'h1 - h2', 'h2 + h1'],
    answer: 'h2 - h1',
    explanation: 'Compressor specific work input equals the enthalpy rise across the compressor.',
  },
  {
    question: 'Given turbine inlet/outlet enthalpies h_in and h_out, turbine specific work is ___',
    options: ['h_in - h_out', 'h_out - h_in', 'h_in + h_out'],
    answer: 'h_in - h_out',
    explanation: 'Turbine specific work output equals enthalpy drop across the turbine.',
  },
  {
    question: 'For a refrigeration cycle, evaporator heat transfer per kg is ___',
    options: ['h1 - h4', 'h2 - h1', 'h2 - h3'],
    answer: 'h1 - h4',
    explanation: 'Cooling effect is enthalpy gain through the evaporator.',
  },
  {
    question: 'For a simple power cycle, thermal efficiency is best written as ___',
    options: ['W_net / Q_H', 'Q_H / W_net', '1 - Q_H / Q_L'],
    answer: 'W_net / Q_H',
    explanation: 'Thermal efficiency is net work divided by external heat input.',
  },
  {
    question: 'In an ideal gas isentropic relation, T2/T1 equals ___',
    options: ['(P2/P1)^((k-1)/k)', '(P2/P1)^(k/(k-1))', 'P2/P1'],
    answer: '(P2/P1)^((k-1)/k)',
    explanation: 'This is the standard constant-k isentropic temperature-pressure relation.',
  },
];

const TYPE_D_PROMPTS = [
  {
    question: 'Find the modeling error: A throttling valve was treated as isentropic.',
    options: ['Process model is wrong', 'No error', 'Only unit conversion is wrong'],
    answer: 'Process model is wrong',
    explanation: 'Ideal throttling is isenthalpic, not isentropic.',
  },
  {
    question: 'Find the modeling error: A Carnot efficiency was computed with Celsius values directly.',
    options: ['Temperature scale misuse', 'No error', 'Wrong sign convention only'],
    answer: 'Temperature scale misuse',
    explanation: 'Carnot ratios require absolute temperature in Kelvin.',
  },
  {
    question: 'Find the modeling error: A Rankine pump work was set equal to turbine work by default.',
    options: ['Energy balance assumption is invalid', 'No error', 'Only pressure units are wrong'],
    answer: 'Energy balance assumption is invalid',
    explanation: 'Pump and turbine enthalpy changes are generally very different.',
  },
  {
    question: 'Find the modeling error: A Brayton compressor exit pressure was set equal to inlet pressure at r_p > 1.',
    options: ['Pressure ratio not applied', 'No error', 'Specific heat value is slightly off'],
    answer: 'Pressure ratio not applied',
    explanation: 'Compressor exit pressure must increase with pressure ratio.',
  },
  {
    question: 'Find the modeling error: Refrigeration COP was reported as W/Q_L.',
    options: ['COP definition inverted', 'No error', 'Only rounding is wrong'],
    answer: 'COP definition inverted',
    explanation: 'Refrigerator COP is Q_L/W, not W/Q_L.',
  },
];

function remapOptions(options, cycleId, fallback) {
  return options.map((opt) => {
    if (CYCLE_TOPICS.some((c) => c.id === opt)) {
      return CYCLE_TOPICS.find((c) => c.id === opt)?.label ?? opt;
    }
    if (opt === 'rankine-basic') return fallback.label;
    return opt;
  });
}

function remapAnswer(answer, cycleId, fallback) {
  if (answer === 'rankine-basic') return fallback.label;
  const matched = CYCLE_TOPICS.find((c) => c.id === answer);
  return matched ? matched.label : answer;
}

function buildQuestionsForCycle(cycle) {
  const groups = [
    { type: 'A', templates: TYPE_A_PROMPTS },
    { type: 'B', templates: TYPE_B_PROMPTS },
    { type: 'C', templates: TYPE_C_PROMPTS },
    { type: 'D', templates: TYPE_D_PROMPTS },
  ];

  const questions = [];
  groups.forEach((group) => {
    group.templates.forEach((template, index) => {
      const mappedOptions = remapOptions(template.options, cycle.id, cycle);
      const mappedAnswer = remapAnswer(template.answer, cycle.id, cycle);
      questions.push({
        id: `${cycle.id}-${group.type}-${index + 1}`,
        cycle: cycle.id,
        type: group.type,
        question: `[${cycle.label}] ${template.question}`,
        options: mappedOptions,
        answer: mappedAnswer,
        explanation: template.explanation,
      });
    });
  });

  return questions;
}

export const questionBank = CYCLE_TOPICS.flatMap(buildQuestionsForCycle);

