# GEMINI SUBPLAN — Cycle Calculators & Boilerplate

## Overview
You are generating all 18 thermodynamic cycle calculators, property data, test suites, quiz engine, and styling. This is token-heavy, straightforward work.

**DO NOT** build SVG renderers or interactive features. Focus on math and data.

---

## PHASE 2: IDEAL GAS CYCLES (5 cycles)

### Carnot Cycle
File: `src/engine/cycles/carnot.js`

```js
export function calculateCarnot(inputs) {
  const { T_H, T_L, P_1 } = inputs;  // K, K, kPa
  const substance = 'air';  // or steam toggle
  
  // State 1: (T_H, P_1, initial state)
  // State 2: isentropic expansion to T_L
  // State 3: isothermal compression at T_L
  // State 4: isentropic compression back to state 1
  
  // Return: { states: [{T, P, v, h, s, u, x}, ...], metrics: {eta, W_net, Q_H, Q_L, eta_carnot} }
}
```

Inputs: T_H (K), T_L (K), P_1 (kPa)
Outputs: State table (T, P, v, h, s, u for each of 4 states), η = 1 - T_L/T_H, W_net, Q_H, Q_L

### Polytropic Process Sandbox
File: `src/engine/cycles/polytropic.js`

Single-process explorer. User picks n (polytropic exponent) from -2 to +∞.
- n=0: isobaric, n=1: isothermal, n=k: isentropic, n=±∞: isochoric
- Work: w = R(T2-T1)/(1-n) for n≠1
- Entropy change, heat transfer
- Show process on P-v and T-s

### Otto Cycle
File: `src/engine/cycles/otto.js`

Inputs: compression ratio r, T_1 (K), P_1 (kPa), Q_in (kJ/kg)
- State 1: (T_1, P_1)
- State 2: isentropic compression, T_2 = T_1 * r^(k-1)
- State 3: constant-volume heat addition, T_3 from Q_in = cv(T_3 - T_2)
- State 4: isentropic expansion, T_4 = T_3 / r^(k-1)
- Efficiency: η = 1 - 1/r^(k-1)

### Diesel Cycle
File: `src/engine/cycles/diesel.js`

Like Otto but heat addition at constant pressure.
Inputs: compression ratio r, cutoff ratio r_c, T_1, P_1, Q_in
- State 1: (T_1, P_1)
- State 2: isentropic compression
- State 3: constant-pressure heat addition to T_3
- State 4: isentropic expansion
- Efficiency: η = 1 - (1/r^(k-1)) · [(r_c^k - 1) / (k(r_c - 1))]

### Brayton Cycle (Basic)
File: `src/engine/cycles/brayton.js`

Inputs: T_1 (K), P_1 (kPa), pressure ratio r_p, T_3 (K)
- State 1: (T_1, P_1)
- State 2: isentropic compression, T_2/T_1 = r_p^((k-1)/k)
- State 3: constant-pressure heat addition to T_3
- State 4: isentropic expansion, T_4/T_3 = (1/r_p)^((k-1)/k)
- Efficiency: η = 1 - 1/r_p^((k-1)/k)
- Back-work ratio: BWR = (h_2 - h_1) / (h_3 - h_4)

---

## PHASE 3: PHASE-CHANGE CYCLES (4 cycles)

### Rankine Cycle (Basic)
File: `src/engine/cycles/rankine.js`

Inputs: P_high (kPa), P_low (kPa), T_3 (°C, superheat)
- State 1: saturated liquid at P_low, use getWaterProps
- State 2: isentropic compression, s_2 = s_1
- State 3: superheated vapor, use getWaterProps(P_high, T_3)
- State 4: isentropic expansion, s_4 = s_3
- Efficiency: η = (W_turbine - W_pump) / Q_boiler = (h_3 - h_4) - (h_2 - h_1) / (h_3 - h_2)
- Metrics: W_net, Q_H, Q_L, η_carnot

### Reheat Rankine
File: `src/engine/cycles/rankineReheat.js`

Same as basic but 6 states:
- State 1: pump inlet (saturated liquid at P_low)
- State 2: pump outlet
- State 3: HP turbine inlet (superheated at P_high, T_superheat)
- State 4: HP turbine outlet (intermediate pressure P_reheat)
- State 5: LP turbine inlet (reheated back to T_superheat at P_reheat)
- State 6: LP turbine outlet (back to P_low)

W_turbine = (h_3 - h_4) + (h_5 - h_6), rest similar.

### Regenerative Rankine (with Open FWH)
File: `src/engine/cycles/rankineRegenerative.js`

Inputs: P_high, P_low, P_bleed, T_3
- States 1-3: standard boiler inlet to turbine inlet
- State 4: bleed point at P_bleed (intermediate turbine extraction)
- State 5: low-pressure turbine exit
- State 6: FWH outlet (saturated liquid at P_bleed)
- State 7: after high-pressure pump
- Energy balance on open FWH: y·h_4 + (1-y)·h_1_pump = 1·h_f(P_bleed)
- Solve for bleed fraction y
- Only fraction (1-y) goes through LP turbine

### Vapor-Compression Refrigeration
File: `src/engine/cycles/vaporCompression.js`

Inputs: T_evap (°C), T_cond (°C), refrigerant choice (R-134a or R-410a)
- State 1: saturated vapor at T_evap, use getRefrigerantProps
- State 2: isentropic compression, s_2 = s_1
- State 3: saturated liquid at T_cond (condenser outlet)
- State 4: throttling (isenthalpic), h_4 = h_3
- COP_refrigerator = Q_L / W = (h_1 - h_4) / (h_2 - h_1)
- COP_heat_pump = Q_H / W = (h_2 - h_3) / (h_2 - h_1)
- Show on T-s with saturation dome and on P-h (log P vs. h) diagram

---

## PHASE 4: REMAINING CYCLES (8 cycles)

### Stirling Cycle
File: `src/engine/cycles/stirling.js`

Inputs: T_H, T_L, V_min, V_max
- Four processes: (1→2) isothermal compression at T_L, (2→3) constant-volume heat addition, (3→4) isothermal expansion at T_H, (4→1) constant-volume heat rejection
- Efficiency: η = 1 - T_L/T_H (with perfect regeneration)

### Atkinson Cycle
File: `src/engine/cycles/atkinson.js`

Like Otto but expansion ratio r_e > compression ratio r.
Inputs: r, r_e, T_1, Q_in
- State 1: (T_1, P_1)
- State 2: isentropic compression with ratio r
- State 3: constant-volume heat addition
- State 4: isentropic expansion with ratio r_e > r
- Higher efficiency than Otto

### Miller Cycle
File: `src/engine/cycles/miller.js`

Related to Atkinson. Achieves different compression/expansion ratio through valve timing.
Inputs: effective compression ratio, expansion ratio, T_1, Q_in
- Model similarly to Atkinson but with additional intake process state

### Jet Propulsion Cycle
File: `src/engine/cycles/jetPropulsion.js`

Open Brayton with nozzle.
Inputs: flight velocity V_0, altitude (P, T ambient), r_p, T_3
- States a, 1, 2, 3, 4, 5 (diffuser, after compressor, after combustion, after turbine, nozzle exit)
- Output: thrust = ṁ(V_exit - V_inlet) instead of shaft work
- Show on T-s diagram

### Air-Standard Refrigeration
File: `src/engine/cycles/airRefrigeration.js`

Reversed Brayton (air as working fluid).
Inputs: pressure ratio, T_1 (cold space), T_3 (warm environment)
- Four isentropic/isobaric processes like Brayton but reversed
- COP = Q_L / W_net

### Cogeneration Cycle
File: `src/engine/cycles/cogeneration.js`

Rankine with extraction for process heating.
Inputs: extraction pressure, fraction extracted, P_high, P_low, T_3
- Fraction of steam extracted for Q_process (industrial heat)
- Fraction continues through LP turbine for W_net
- Utilization factor: ε = (W_net + Q_process) / Q_boiler

### Absorption Refrigeration
File: `src/engine/cycles/absorptionRefrigeration.js`

Conceptual/schematic only (too complex for full calc).
- Show flow diagram with Q and W arrows
- Generator, condenser, expansion valve, evaporator, absorber, pump
- Qualitative visualization (not thermodynamic state calculations)

### Combined Brayton-Rankine
File: `src/engine/cycles/combinedCycle.js`

Two cycles coupled: Brayton topping, Rankine bottoming.
Inputs: All Brayton inputs + all Rankine inputs, linked via HRSG temperature
- Q_L from Brayton = Q_H for Rankine
- Overall efficiency: η_combined = 1 - (1 - η_Brayton)(1 - η_Rankine)
- Return both cycle's state arrays for overlaid T-s diagram

---

## PROPERTY DATA & CONSTANTS

### Ammonia Engine
File: `src/engine/ammonia.js`

Add ammonia (NH₃) property engine using standard correlations:
- Saturation pressure (Wagner), saturation temperature
- Specific volumes (vf, vg), enthalpies (hf, hfg, hg), entropies (sf, sfg, sg)
- Implement getMasterProps() to match water.js and refrigerants.js interface

---

## QUIZ ENGINE

File: `src/engine/quiz/quizGenerator.js`

Generate question types:
- **Type A:** Unlabeled P-v or T-s diagram → multiple choice cycle identification
- **Type B:** Predict effect → "If boiler pressure increases, efficiency ___?" (increase/decrease/no change)
- **Type C:** Calculate property → given two properties, compute a third (uses property lookup)
- **Type D:** Find error → show cycle with one incorrect process, identify which

File: `src/engine/quiz/questionBank.js`

Hardcoded question templates for each cycle:
```js
[
  {
    cycle: 'rankine',
    type: 'B',
    question: 'If boiler pressure increases in a Rankine cycle while keeping turbine inlet temperature constant, thermal efficiency will ___',
    options: ['increase', 'decrease', 'remain the same'],
    answer: 'increase',
    explanation: 'Higher boiler pressure increases the pressure ratio, improving the cycle efficiency according to the Rankine efficiency equation.'
  },
  // ... ~20-30 questions per cycle
]
```

File: `src/components/Quiz/Quiz.jsx` (React component)

Quiz UI:
- Question display with multiple choice buttons
- Timer (optional)
- Score tracker
- Explanation after answer
- Next button
- Results summary at end (% correct)

---

## STYLING ENHANCEMENTS

File: `src/global.css` — Add:
- Modal/overlay styles for cycle selector dropdown
- Slider track and thumb styles (44×44px touch targets)
- Table styling (state-point, metrics)
- Phase badge colors (6 variants)
- Responsive: tab bar layout changes at 768px breakpoint
- Grid column layouts for metrics display
- Animation keyframes (if needed for animated arrows)

---

## TEST DATA

File: `src/engine/cycles/__tests__/cycleValidation.js`

For each cycle, define test cases with expected outputs:
```js
const testCases = {
  rankine: [
    {
      inputs: { P_high: 6000, P_low: 10, T_3: 400 },
      expectedMetrics: { eta: 0.40, W_net: 'approx 1200 kJ/kg', eta_carnot: 'approx 0.62' },
      tolerance: 0.01  // 1% error tolerance
    },
    // ... 2-3 more test cases per cycle
  ]
}
```

Manually compute expected values from textbook examples and validate calculations.

---

## DELIVERABLES CHECKLIST

- [ ] 18 cycle calculator functions in `src/engine/cycles/`
- [ ] All calculators export `calculateCycle(inputs)` returning `{states, metrics}`
- [ ] Ammonia property engine added to `src/engine/`
- [ ] Quiz question bank with ~300+ questions
- [ ] Test validation data for all cycles
- [ ] Enhanced `src/global.css` with table/modal/slider styles
- [ ] React Quiz component skeleton with state management
- [ ] All code imports and uses existing engines (water.js, refrigerants.js, idealGas.js)

---

## NOTES

- **Use existing property engines:** Every cycle should call `getWaterProps()`, `getRefrigerantProps()`, or `getIdealGasProps()` from existing engines. Do NOT rewrite property logic.
- **State array format:** Always return `[{T, P, v, h, s, u, x}, {T, P, v, h, s, u, x}, ...]` so Opus diagram renderer can consume it directly.
- **Metrics format:** Always include `{eta_thermal, W_net, Q_H, Q_L, eta_carnot, COP}` where applicable.
- **No interactive features:** Just pure math functions and data. SVG rendering, dragging, animations are Opus's job.
- **Test against textbook:** Validate calculations against Borgnakke & Sonntag examples to ensure correctness.
