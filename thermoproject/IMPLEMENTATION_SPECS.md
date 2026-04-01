# CycleViz Implementation Specifications
## Error Handling, Unit Conversions, Math, & Validation

---

## 1. UNIT CONVERSION & HANDLING REFERENCE

### Temperature
- **Input:** Celsius (°C) from UI sliders/inputs
- **Internal storage:** Kelvin (K) for all calculations
- **Conversion:** T(K) = T(°C) + 273.15
- **Property engines expect:** Kelvin
- **Output to UI:** Display both K and °C options in dropdown

### Pressure
- **Input:** kPa from UI (industry standard for thermodynamics)
- **Internal:** Keep as kPa throughout
- **Property engines:** water.js and refrigerants.js use kPa
- **idealGas.js:** Uses R = 0.287 kJ/kg·K for air (consistent with kPa)
- **Output:** Display kPa; show bar/atm/psi as optional view

### Specific Volume
- **Input:** m³/kg (standard)
- **Internal:** m³/kg
- **Output:** m³/kg (or cm³/g as toggle)
- **SVG scaling:** Log scale for v-axis when v ranges over 3+ orders of magnitude

### Enthalpy, Internal Energy
- **Units:** kJ/kg (all calculations)
- **Precision:** Store 4 decimal places, display 1-2

### Entropy
- **Units:** kJ/kg·K (all calculations)
- **Precision:** Store 5 decimal places, display 4

### Quality (x)
- **Range:** [0, 1] for two-phase region
- **Valid:** x ≥ 0 in two-phase. If calculated x < 0, state is compressed liquid. If x > 1, state is superheated.
- **Error handling:** If calculation produces x outside [0, 1] in two-phase region after iteration, flag as convergence error

---

## 2. ERROR HANDLING SPECIFICATION

### Gemini (Cycle Calculators)

All calculator functions must follow this pattern:

```js
export function calculateCycle(inputs, isReal = false) {
  try {
    // Validate inputs
    const errors = validateCycleInputs(inputs, cycleSpec);
    if (errors.length > 0) {
      return {
        error: true,
        message: errors[0],
        details: errors
      };
    }

    // Convert units
    const normalizedInputs = normalizeUnits(inputs);

    // Calculate states
    const states = [];
    for (let i = 0; i < stateCount; i++) {
      const state = calculateState(normalizedInputs, i, isReal);
      if (state.error) {
        return {
          error: true,
          message: `Cannot calculate state ${i + 1}: ${state.error}`,
          failedState: i + 1,
          context: state
        };
      }
      states.push(state);
    }

    // Calculate metrics
    const metrics = calculateMetrics(states);

    return {
      error: false,
      states,
      metrics
    };
  } catch (e) {
    return {
      error: true,
      message: 'Unexpected calculation error: ' + e.message,
      exception: e
    };
  }
}
```

### Input Validation Rules

For **Rankine Cycle:**
```js
function validateCycleInputs(inputs) {
  const errors = [];
  
  // P_high > P_low
  if (inputs.P_high <= inputs.P_low) {
    errors.push('Boiler pressure must exceed condenser pressure');
  }
  
  // T_3 > T_sat(P_high) — turbine inlet must be superheated
  const T_sat_high = satTemperature(inputs.P_high);
  if (inputs.T_3 + 273.15 < T_sat_high) {
    errors.push(`Turbine inlet T_3 (${inputs.T_3}°C) must exceed saturation temperature at P_high (${T_sat_high - 273.15}°C)`);
  }
  
  // Reasonable pressure range
  if (inputs.P_high < 100 || inputs.P_high > 25000) {
    errors.push('Boiler pressure should be between 100–25000 kPa');
  }
  if (inputs.P_low < 1 || inputs.P_low > 500) {
    errors.push('Condenser pressure should be between 1–500 kPa');
  }
  
  // T_3 reasonable
  if (inputs.T_3 < 0 || inputs.T_3 > 800) {
    errors.push('Turbine inlet temperature should be between 0–800°C');
  }
  
  return errors;
}
```

For **Brayton Cycle:**
```js
function validateCycleInputs(inputs) {
  const errors = [];
  
  if (inputs.r_p <= 1.0) {
    errors.push('Pressure ratio must exceed 1.0');
  }
  if (inputs.r_p > 30) {
    errors.push('Pressure ratio exceeds typical gas turbine limit (~30)');
  }
  
  if (inputs.T_1 + 273.15 < 250) {
    errors.push('Compressor inlet temperature too low');
  }
  if (inputs.T_3 + 273.15 > 1500) {
    errors.push('Turbine inlet temperature exceeds typical limit (~1500 K)');
  }
  
  if (inputs.T_3 + 273.15 <= inputs.T_1 + 273.15) {
    errors.push('Turbine inlet must be hotter than compressor inlet');
  }
  
  return errors;
}
```

### Property Engine Error Returns

When `getWaterProps(prop1_name, prop1_value, prop2_name, prop2_value)` fails:
- **Input validation:** Returns `{ error: 'Invalid property pair', valid_pairs: [...] }`
- **Interpolation failure:** Returns `{ error: 'Cannot interpolate: T/P outside table range' }`
- **Phase ambiguity:** Returns `{ error: 'T and P do not uniquely define state (two-phase region); provide x, v, h, or s', suggestion: 'Use T and x instead' }`

Cycle calculators must check for `.error` field before using the result.

### Isentropic Efficiency Handling (Real Cycles)

When `isReal = true` and η_isentropic values provided:

```js
// For turbine expansion
const h_4s = calculateIsentropicExit(h_3, s_3, P_4);  // ideal exit
const h_4_actual = h_3 - eta_turbine * (h_3 - h_4s);  // real exit (less expansion work)

// For compressor
const h_2s = calculateIsentropicExit(h_1, s_1, P_2);  // ideal exit
const h_2_actual = h_1 + (h_2s - h_1) / eta_compressor;  // real exit (more work input)

// For pump
const h_2s = calculateIsentropicExit(h_1, s_1, P_2);
const h_2_actual = h_1 + (h_2s - h_1) / eta_pump;
```

Both ideal and real state arrays should be returned separately (or in parallel in the states array).

---

## 3. SVG COORDINATE TRANSFORMATION MATH

### Diagram Dimensions & Padding
```
SVG viewBox: 0 0 600 400
Left padding: 65px (for y-axis labels)
Bottom padding: 50px (for x-axis labels)
Right padding: 20px
Top padding: 20px

Plot area: width = 600 - 65 - 20 = 515px, height = 400 - 50 - 20 = 330px
Plot origin (in SVG coords): (65, 20)
Plot max (in SVG coords): (65 + 515, 20 + 330) = (580, 350)
```

### T-v Diagram (Log Scale on v)

**Physical property ranges:**
- T: 0 K to 640 K (for water, triple to critical + superheat)
- v: 0.001 m³/kg to 500 m³/kg (huge range, needs log scale)

**Transformation:**

```js
function physicalToSvg_Tv(T_kelvin, v_m3_kg) {
  const minT = 273.15;  // 0°C
  const maxT = 640;     // above critical
  const minV = 0.001;
  const maxV = 500;
  
  const plotX = 65 + (Math.log10(v_m3_kg) - Math.log10(minV)) / (Math.log10(maxV) - Math.log10(minV)) * 515;
  const plotY = 350 - (T_kelvin - minT) / (maxT - minT) * 330;  // inverted y-axis in SVG
  
  return { x: plotX, y: plotY };
}

function svgToPhysical_Tv(svgX, svgY) {
  const minT = 273.15;
  const maxT = 640;
  const minV = 0.001;
  const maxV = 500;
  
  const v_m3_kg = Math.pow(10, Math.log10(minV) + (svgX - 65) / 515 * (Math.log10(maxV) - Math.log10(minV)));
  const T_kelvin = minT + (350 - svgY) / 330 * (maxT - minT);
  
  return { T: T_kelvin, v: v_m3_kg };
}
```

### T-s Diagram (Linear)

**Physical property ranges:**
- T: 273.15 K to 640 K
- s: 0 kJ/kg·K to 10 kJ/kg·K (for water; varies per substance)

```js
function physicalToSvg_Ts(T_kelvin, s_kJ_kg_K, minS = 0, maxS = 10) {
  const minT = 273.15;
  const maxT = 640;
  
  const plotX = 65 + (s_kJ_kg_K - minS) / (maxS - minS) * 515;
  const plotY = 350 - (T_kelvin - minT) / (maxT - minT) * 330;
  
  return { x: plotX, y: plotY };
}
```

### P-v Diagram (Log-Log)

**Physical ranges:**
- P: 0.1 kPa to 25000 kPa
- v: 0.001 to 500 m³/kg

```js
function physicalToSvg_Pv(P_kPa, v_m3_kg) {
  const minP = 0.1;
  const maxP = 25000;
  const minV = 0.001;
  const maxV = 500;
  
  const plotX = 65 + (Math.log10(v_m3_kg) - Math.log10(minV)) / (Math.log10(maxV) - Math.log10(minV)) * 515;
  const plotY = 350 - (Math.log10(P_kPa) - Math.log10(minP)) / (Math.log10(maxP) - Math.log10(minP)) * 330;
  
  return { x: plotX, y: plotY };
}
```

### P-h Diagram (Log P, Linear h)

**Physical ranges:**
- P: 0.1 to 25000 kPa
- h: typically -500 to 3500 kJ/kg (varies widely, auto-scale per substance)

```js
function physicalToSvg_Ph(P_kPa, h_kJ_kg, minH, maxH) {
  const minP = 0.1;
  const maxP = 25000;
  
  const plotX = 65 + (h_kJ_kg - minH) / (maxH - minH) * 515;
  const plotY = 350 - (Math.log10(P_kPa) - Math.log10(minP)) / (Math.log10(maxP) - Math.log10(minP)) * 330;
  
  return { x: plotX, y: plotY };
}
```

### Saturation Dome Temperature Points

**Water saturation dome (pre-computed):**
```js
const saturationDomeTemperatures = [
  273.16,  // triple point
  280, 290, 300, 310, 320, 330, 340, 350, 360, 370,
  373.946  // critical point
];
// At each T, compute v_f and v_g using water.js
// These define the dome boundaries
```

### Process Path Curves

**Isentropic on T-s:** Vertical line (constant entropy)
```js
function drawIsentropicPath_Ts(s_const, T_start, T_end) {
  const x = ... // s_const mapped to x coordinate
  return `M ${x} ${svgY(T_end)} L ${x} ${svgY(T_start)}`;  // vertical line
}
```

**Isentropic on P-v:** Follows Pv^k = C (polytropic with n=k)
```js
function drawIsentropicPath_Pv(P_1, v_1, v_2, k) {
  // P * v^k = P_1 * v_1^k = constant
  // At each v, compute P = (P_1 * v_1^k) / v^k
  const C = P_1 * Math.pow(v_1, k);
  const points = [];
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const v = v_1 + (v_2 - v_1) * i / steps;
    const P = C / Math.pow(v, k);
    const {x, y} = physicalToSvg_Pv(P, v);
    points.push(`${x},${y}`);
  }
  return `M ${points[0]} C ...`;  // cubic bezier through points
}
```

**Isothermal on T-s:** Horizontal line (constant T)
```js
function drawIsothermalPath_Ts(T_const, s_start, s_end) {
  const y = ... // T_const mapped to y coordinate
  return `M ${svgX(s_start)} ${y} L ${svgX(s_end)} ${y}`;
}
```

**Isothermal on P-v:** Follows Pv = C
```js
function drawIsothermalPath_Pv(P_1, v_1, v_2) {
  const C = P_1 * v_1;
  const points = [];
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const v = v_1 + (v_2 - v_1) * i / steps;
    const P = C / v;
    const {x, y} = physicalToSvg_Pv(P, v);
    points.push(`${x},${y}`);
  }
  return `M ${points[0]} C ...`;
}
```

**Isobaric on P-v:** Vertical line (constant P)
```js
function drawIsobaricPath_Pv(P_const, v_start, v_end) {
  const x = ... // P_const mapped to x coordinate
  return `M ${x} ${svgY(v_end)} L ${x} ${svgY(v_start)}`;
}
```

**Two-phase paths:** Must follow saturation dome boundary
```js
function drawTwoPhaseProcess(state_1, state_2, diagram_type) {
  // If process starts in two-phase and ends in two-phase:
  // - Check if path crosses dome boundaries
  // - Follow dome edge if crossing occurs
  // - For quality change at constant T: horizontal path on T-v, T-s, P-h (along dome)
}
```

---

## 4. VALIDATED TEST CASES (Borgnakke & Sonntag, 7th Edition)

### Rankine Cycle Test Case
**Example 11.3 (page 564):**
```
Inputs:
  P_high = 6000 kPa
  P_low = 10 kPa
  T_3 = 400°C

Expected Results:
  State 1: T = 45.81°C, P = 10 kPa, h = 191.81 kJ/kg, s = 0.6493 kJ/kg·K (saturated liquid at P_low)
  State 2: T = 49.73°C, P = 6000 kPa, h = 193.97 kJ/kg, s = 0.6493 kJ/kg·K (isentropic pump)
  State 3: T = 400°C, P = 6000 kPa, h = 3230.9 kJ/kg, s = 7.0206 kJ/kg·K (superheated)
  State 4: T = 69.06°C, P = 10 kPa, h = 2324.0 kJ/kg, s = 7.0206 kJ/kg·K (turbine exit, two-phase, x ≈ 0.7285)
  
  W_pump = 193.97 - 191.81 = 2.16 kJ/kg
  W_turbine = 3230.9 - 2324.0 = 906.9 kJ/kg
  W_net = 906.9 - 2.16 = 904.74 kJ/kg
  Q_boiler = 3230.9 - 193.97 = 3036.93 kJ/kg
  η_thermal = 904.74 / 3036.93 = 0.298 (29.8%)
  η_carnot = 1 - (45.81 + 273.15) / (400 + 273.15) = 1 - 319 / 673 = 0.526 (52.6%)

Validation tolerance: ±1% on efficiency, ±2 kJ/kg on work values
```

### Brayton Cycle Test Case
**Example 12.2 (page 652):**
```
Inputs:
  T_1 = 20°C = 293.15 K
  P_1 = 100 kPa
  r_p = 8 (pressure ratio)
  T_3 = 800°C = 1073.15 K

Expected Results:
  State 1: T = 293.15 K, P = 100 kPa, h = 293.2 kJ/kg, s = 6.8473 kJ/kg·K
  State 2: T = 293.15 * 8^(0.4/1.4) = 549.76 K, P = 800 kPa
           h = 1.005 * 549.76 = 552.5 kJ/kg, s = 6.8473 - 0.287 * ln(8) = 6.0773 kJ/kg·K
  State 3: T = 1073.15 K, P = 800 kPa, h = 1.005 * 1073.15 = 1078.6 kJ/kg
  State 4: T = 1073.15 / 8^(0.4/1.4) = 555.3 K, P = 100 kPa
           h = 1.005 * 555.3 = 558.1 kJ/kg
  
  W_compressor = 552.5 - 293.2 = 259.3 kJ/kg
  W_turbine = 1078.6 - 558.1 = 520.5 kJ/kg
  W_net = 520.5 - 259.3 = 261.2 kJ/kg
  Q_in = 1078.6 - 552.5 = 526.1 kJ/kg
  η_thermal = 261.2 / 526.1 = 0.496 (49.6%)
  η_carnot = 1 - 293.15 / 1073.15 = 0.727 (72.7%)
  BWR = 259.3 / 520.5 = 0.498 (49.8%)

Validation tolerance: ±1% on efficiency, ±5 kJ/kg on work (ideal gas approximations)
```

### Otto Cycle Test Case
**Example 12.6 (page 685):**
```
Inputs:
  Compression ratio r = 8
  T_1 = 300 K
  P_1 = 100 kPa
  Q_in = 2000 kJ/kg

Expected Results:
  T_2 = 300 * 8^0.4 = 753 K
  T_3 = T_2 + Q_in / cv = 753 + 2000 / 0.718 = 3535 K
  T_4 = T_3 / 8^0.4 = 1410 K
  
  W_net = cv * (T_3 - T_2 - T_4 + T_1) = 0.718 * (3535 - 753 - 1410 + 300) = 1133 kJ/kg
  η = 1 - 1/8^0.4 = 1 - 0.397 = 0.563 (56.3%)

Validation tolerance: ±0.5% on efficiency
```

### Vapor-Compression Refrigeration Test Case
**Example 11.5 (page 580):**
```
Inputs:
  Refrigerant: R-134a
  T_evap = -10°C
  T_cond = 30°C
  (isentropic compressor, ideal expansion valve)

Expected Results (from R-134a tables):
  State 1: T = -10°C, x = 1 (saturated vapor), h = 245.67 kJ/kg, s = 0.9207 kJ/kg·K
  State 2: T ≈ 74.7°C, P = 1.466 MPa, h = 282.34 kJ/kg, s = 0.9207 kJ/kg·K (isentropic)
  State 3: T = 30°C, x = 0 (saturated liquid), h = 115.74 kJ/kg, s = 0.4164 kJ/kg·K
  State 4: h = h_3 = 115.74 kJ/kg (throttle), T ≈ -10°C, x ≈ 0.404
  
  Q_L = h_1 - h_4 = 245.67 - 115.74 = 129.93 kJ/kg
  W = h_2 - h_1 = 282.34 - 245.67 = 36.67 kJ/kg
  Q_H = h_2 - h_3 = 282.34 - 115.74 = 166.6 kJ/kg
  COP_ref = Q_L / W = 129.93 / 36.67 = 3.544
  COP_hp = Q_H / W = 166.6 / 36.67 = 4.544

Validation tolerance: ±0.5% on COP values
```

### Regenerative Rankine Test Case
**Example 11.9 (page 597):**
```
Inputs:
  P_high = 8000 kPa
  P_bleed = 2000 kPa
  P_low = 10 kPa
  T_3 = 350°C

Expected Results:
  Bleed fraction y ≈ 0.0864 (8.64%)
  η ≈ 0.360 (36.0%) — improved over basic Rankine at same pressures
  
  Verify: Energy balance on FWH should be satisfied to within ±0.01%
  Check: η > η_basic_rankine at same P_high/P_low
```

---

## 5. QUALITY ASSURANCE CHECKLIST

### Before Gemini Generates Code
- [ ] All 18 cycle definitions reviewed and validated against textbook
- [ ] All input ranges and validation rules defined
- [ ] Test cases extracted from Borgnakke & Sonntag with page numbers
- [ ] Unit conversion rules specified in code comments
- [ ] Error messages templated (copy-paste ready)

### After Gemini Generates Calculators
- [ ] Each calculator runs against test case, result within tolerance
- [ ] All error paths tested (invalid inputs return error object, not exception)
- [ ] Real vs. ideal modes both tested for applicable cycles
- [ ] Edge cases tested: near critical point, very low/high pressures, x near 0 and 1

### Before Opus Integrates
- [ ] All 18 state arrays formatted consistently: `[{T, P, v, h, s, u, x}, ...]`
- [ ] All metrics objects include required keys: `{eta_thermal, W_net, Q_H, Q_L, eta_carnot, COP?, BWR?}`
- [ ] Coordinate transformations tested: point at (v_f, T) maps to left edge of dome in SVG
- [ ] Process paths validated: isentropic curves follow Pv^k = C within ±1% on a P-v plot
- [ ] Two-phase paths follow saturation dome boundary without crossing

### Final Validation (User Testing)
- [ ] Drag dome point in all diagram types, properties update correctly
- [ ] Select each cycle, adjust sliders, diagrams and metrics update in real time
- [ ] Calculated efficiency matches textbook example to within ±1%
- [ ] Mobile layout responds at 375px and 768px breakpoints
- [ ] Bundle size < 200KB gzipped

---

## 6. PRECISION & ROUNDING RULES

### Display Precision by Property
| Property | Decimals | Example |
|----------|----------|---------|
| T (K) | 2 | 500.15 K |
| T (°C) | 1 | 227.0°C |
| P (kPa) | 1 | 6000.0 kPa |
| v (m³/kg) | 5 | 0.00103 m³/kg |
| h (kJ/kg) | 1 | 3230.9 kJ/kg |
| s (kJ/kg·K) | 4 | 7.0206 kJ/kg·K |
| u (kJ/kg) | 1 | 2900.3 kJ/kg |
| x (quality) | 3 | 0.728 (or 72.8%) |
| η (efficiency) | 4 | 0.2976 (or 29.76%) |
| COP | 3 | 3.544 |

### Internal Storage Precision
- All calculations use full JavaScript number precision (IEEE 754, ~15 significant digits)
- Intermediate results (T_2, P_2, etc.) kept at full precision
- Round only for UI display, not for subsequent calculations

---

## 7. CYCLE STATE ARRAY STANDARD FORMAT

Every cycle calculator must return:

```js
{
  error: false,
  states: [
    {
      stateNum: 1,
      T: 318.96,          // Kelvin
      P: 10,              // kPa
      v: 0.14670,         // m³/kg
      h: 191.81,          // kJ/kg
      s: 0.6493,          // kJ/kg·K
      u: 191.25,          // kJ/kg
      x: 0,               // quality (null if not two-phase)
      phase: 'liquid',    // 'liquid', 'vapor', 'mixture', 'supercritical'
      component: 'pump'   // which component (for schematic/diagram labeling)
    },
    // ... more states
  ],
  metrics: {
    eta_thermal: 0.298,
    eta_carnot: 0.526,
    W_net: 904.74,
    Q_H: 3036.93,
    Q_L: 2132.19,
    W_turbine: 906.9,
    W_compressor: 2.16,
    W_pump: 2.16,  // alias for W_compressor in Rankine
    BWR: undefined,  // only for Brayton
    COP: undefined   // only for refrigeration cycles
  }
}
```

**Non-applicable metrics should be `undefined`, not omitted or null.**

---

## 8. PROPERTY ENGINE INTEGRATION RULES

### Gemini Must Use These Existing Functions

**For water/steam:**
```js
import { getWaterProps } from '../engine/water.js';

const state = getWaterProps(
  'T_P',        // property pair name
  400,          // value 1 (°C for T, kPa for P)
  6000          // value 2
);
// Returns: {T, P, v, h, s, u, x, phase, error?}
```

**For refrigerants:**
```js
import { getRefrigerantProps } from '../engine/refrigerants.js';

const state = getRefrigerantProps(
  'R-134a',     // substance
  'T_x',        // property pair
  -10,          // T in °C
  1             // x (quality)
);
// Returns: {T, P, v, h, s, u, x, phase, error?}
```

**For ideal gases:**
```js
import { getIdealGasProps } from '../engine/idealGas.js';

const state = getIdealGasProps(
  'Air',        // substance
  'T_P',        // property pair
  293.15,       // T in K
  100           // P in kPa
);
// Returns: {T, P, v, h, s, u, phase: 'vapor', error?}
```

### Never Rewrite Property Logic
- Do NOT reimplement water saturation correlations
- Do NOT hardcode steam table values
- Do NOT approximate Pv = RT for real fluids
- Always call the existing engines. If they don't work, report as a bug to Opus for fixing.

---

## 9. SCHEMATIC COMPONENT SPECIFICATIONS

Each schematic must define:

```js
const schematicLayout = {
  components: [
    {
      id: 'pump',
      type: 'pump',
      x: 100,      // SVG x coordinate
      y: 200,
      width: 40,
      height: 40,
      label: 'Pump',
      inletState: 1,    // state number
      outletState: 2
    },
    // ... more components
  ],
  
  connections: [
    { from: 'pump', to: 'boiler', label: 'liquid' },
    { from: 'boiler', to: 'turbine', label: 'vapor' }
  ],
  
  energyArrows: [
    {
      id: 'W_pump',
      type: 'work_in',
      component: 'pump',
      side: 'left',
      value: 2.16,  // kJ/kg (computed at runtime)
      unit: 'kJ/kg'
    },
    {
      id: 'Q_boiler',
      type: 'heat_in',
      component: 'boiler',
      side: 'top',
      value: 3036.93,
      unit: 'kJ/kg'
    }
  ]
};
```

Opus will use this layout to render the schematic dynamically.

