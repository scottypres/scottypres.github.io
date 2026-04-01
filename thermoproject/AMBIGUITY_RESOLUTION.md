# Ambiguity Resolution — Quick Reference for Opus & Gemini

**This document resolves integration ambiguities. Each section is self-contained and copy-pastable. Reference by section name in your prompts.**

---

## A. CYCLE → DIAGRAM TYPE MATRIX

**Which diagrams to render for each cycle:**

| Cycle | T-s | P-v | P-h | Dome? | Notes |
|-------|-----|-----|-----|-------|-------|
| Carnot | ✓ | ✓ | - | ✓ | Rectangle on T-s |
| Polytropic | ✓ | ✓ | - | - | Single process, no dome |
| Otto | ✓ | ✓ | - | - | Square on both |
| Diesel | ✓ | ✓ | - | - | Trapezoid shape |
| Brayton | ✓ | ✓ | - | - | Loop with regenerator variant |
| Rankine | ✓ | - | - | ✓ | T-s only (P-v rare) |
| Rankine Reheat | ✓ | - | - | ✓ | T-s only |
| Rankine Regen | ✓ | - | - | ✓ | T-s only |
| Vapor-Compression | ✓ | - | ✓ | ✓ | Both T-s and P-h |
| Stirling | ✓ | ✓ | - | - | Rectangle on T-s |
| Atkinson | ✓ | ✓ | - | - | Similar to Otto |
| Miller | ✓ | ✓ | - | - | Similar to Atkinson |
| Jet Propulsion | ✓ | - | - | - | T-s only (7 states, diffuser+nozzle) |
| Air-Std Refrigeration | ✓ | ✓ | - | - | Reversed Brayton |
| Cogeneration | ✓ | - | - | ✓ | Rankine variant, T-s only |
| Absorption Refrigeration | - | - | - | - | **Schematic only** (no state calculations) |
| Combined Brayton-Rankine | ✓ | - | - | ✓ | **Two overlaid T-s diagrams** (stacked) |

**Rule:** Dome is drawn if cycle involves phase change (water, refrigerant). Ideal gas cycles (Brayton, Otto, Stirling, etc.) do NOT show dome.

**For Gemini:** Return `diagrams: ['Ts', 'Pv']` (or subset) in cycle state object. For Absorption, return `diagrams: []` (schematic only).

---

## B. COMPONENT LABELS IN STATE ARRAY

**Gemini MUST include `component` field in each state. Opus uses this to label diagrams and map to schematic.**

| Cycle | State 1 | State 2 | State 3 | State 4 | State 5 | State 6 |
|-------|---------|---------|---------|---------|---------|---------|
| Rankine | pump_inlet | pump_outlet | turbine_inlet | turbine_outlet | - | - |
| Rankine Reheat | pump_inlet | pump_outlet | hp_turbine_inlet | ip_turbine_outlet | lp_turbine_inlet | lp_turbine_outlet |
| Rankine Regen | pump1_inlet | fwh_outlet | boiler_outlet | turbine_inlet | bleed_point | lp_turbine_outlet |
| Brayton | compressor_inlet | compressor_outlet | combustor_outlet | turbine_outlet | - | - |
| Brayton+Regen | compressor_inlet | regen_inlet | combustor_outlet | regen_outlet | turbine_outlet | - |
| Otto | cylinder_start | after_compression | after_combustion | after_expansion | - | - |
| Vapor-Compression | evaporator_outlet | compressor_outlet | condenser_outlet | throttle_outlet | - | - |

**Code example (Gemini):**
```js
states[0].component = 'pump_inlet';
states[1].component = 'pump_outlet';
states[2].component = 'turbine_inlet';
states[3].component = 'turbine_outlet';
```

**Opus uses this to:**
- Label state points on diagram with component name
- Highlight component on schematic when state is clicked
- Validate state order matches cycle topology

---

## C. ISENTROPIC EFFICIENCY DEFAULTS & RANGES

**When "Ideal → Real" toggle is ON, these sliders appear. Gemini must use these values.**

| Component | Default | Min | Max | Notes |
|-----------|---------|-----|-----|-------|
| η_turbine | 0.85 | 0.70 | 0.98 | Typical: 0.85–0.90 |
| η_compressor | 0.85 | 0.70 | 0.98 | Typical: 0.80–0.88 |
| η_pump | 0.90 | 0.75 | 0.98 | Pumps higher efficiency (~0.90) |
| Dead state T₀ | 298.15 K (25°C) | 273.15 K | 323.15 K | For exergy calculations |

**Gemini Implementation Rule:**
```js
// When isReal === true, apply isentropic efficiencies
if (isReal && inputs.eta_turbine) {
  const h_4s = calculateIsentropicExit(h_3, s_3, P_4);
  const h_4_real = h_3 - inputs.eta_turbine * (h_3 - h_4s);
  states[3].h = h_4_real;  // use real exit
} else {
  // use ideal isentropic exit
}
```

**Opus Must Support:** Real vs. Ideal toggle in CycleControls panel, with sliders for η_turbine, η_compressor, η_pump appearing when toggle is ON.

---

## D. AXIS AUTO-SCALING STRATEGY

**For each diagram type, specify how to handle variable state ranges.**

### T-v Diagram (Log Scale v-axis)
**Fixed axis ranges:**
- T: 273.15 K to 650 K (triple point to 377°C, covers all cycles)
- v: 0.0001 to 1000 m³/kg (log10 scale, covers liquid to superheated gas)

**Rule:** Always use these fixed ranges. Do NOT auto-fit. This ensures:
- Saturation dome position is consistent across cycles
- Quality lines (x=0.2, 0.4, ..., 0.8) are always visible
- User can compare cycles visually

### T-s Diagram (Linear)
**Fixed axis ranges:**
- T: 273.15 K to 650 K
- s: Auto-fit based on cycle states (min_s - 0.5 to max_s + 0.5 kJ/kg·K)

**Rule:** T always fixed, s auto-fitted. Reason: Cycles have different entropy ranges (Rankine narrow, Brayton wide), but all fit same temperature range.

### P-v Diagram (Log-Log)
**Fixed axis ranges:**
- P: 0.1 to 25000 kPa (log scale)
- v: 0.0001 to 1000 m³/kg (log scale)

**Rule:** Always use these fixed ranges for consistency.

### P-h Diagram (Log P, Linear h)
**Auto-fit both axes:**
- P: log-scale, fitted to [min_P/2, max_P*2] or [0.1, 25000], whichever is wider
- h: linear, fitted to [min_h - 100, max_h + 100] kJ/kg

**Rule:** Auto-fit because different refrigerants (R-134a, R-410a, Ammonia) have very different h ranges.

---

## E. TWO-PHASE PATH HANDLING ALGORITHM

**When a process crosses the saturation dome, follow boundary. Gemini specifies path type; Opus draws it.**

### Algorithm for Turbine Expansion (State 3 → 4)

```
1. Calculate ideal isentropic state 4s (same entropy as 3, lower pressure)
2. Check if state 4s is two-phase (v_f < v_4s < v_g):
   YES → Path crosses into two-phase region
   NO → Path stays in superheated region (draw simple curve)

3. If path crosses two-phase:
   a) Find quality x_sat where path crosses saturation dome (at P_4)
   b) Draw isentropic curve from state 3 (superheated) down to x_sat line
   c) Follow saturation line along x_sat from turbine inlet pressure to turbine outlet pressure
   d) OR if outlet P < P_sat at x_sat, follow saturation curve down to P_4
   e) End at state 4 (which is two-phase, x ≈ 0.7)
   
   In T-s diagram: path is vertical (isentropic) then curves along saturation
   In P-v diagram: path curves following Pv^k = C, then follows saturation dome edge
```

**Gemini MUST check for this:**
```js
const x_at_exit = (v_4 - v_f) / v_fg;  // quality at state 4
if (x_at_exit > 0 && x_at_exit < 1) {
  states[3].pathCrossesPhase = true;  // signal to Opus: draw dome transition
}
```

---

## F. CONSTANT-QUALITY LINES (x = 0.2, 0.4, 0.6, 0.8)

**Draw on diagrams ONLY if saturation dome is shown.**

| Cycle | Show Lines? | Style | Notes |
|-------|-------------|-------|-------|
| Rankine, Reheat, Regen | YES | dashed, light gray | Help visualize quality |
| Vapor-Compression | YES | dashed, light gray | Both T-s and P-h |
| Carnot (with steam) | YES | dashed, light gray | If using steam WF |
| Polytropic, Otto, Diesel, etc. | NO | - | No phase change |
| Combined Brayton-Rankine | YES (Rankine side) | dashed | Rankine T-s only |

**Opus draws quality lines from saturation data (already in DomeSVG.jsx as reference).**

---

## G. SCHEMATIC ARROW SCALING

**Arrows scale proportionally to energy magnitude (kJ/kg), but with min/max bounds to prevent extreme sizes.**

### Arrow Thickness Scaling
```js
minThickness = 2;     // pixels
maxThickness = 12;    // pixels
minValue = 1;         // kJ/kg (absolute minimum visible)
maxValue = max(|all Q and W values in cycle|);

thickness(value) = minThickness + (value / maxValue) * (maxThickness - minThickness);
```

### Examples
**Rankine Cycle (P_high=6000, P_low=10, T_3=400):**
- W_pump = 2.16 kJ/kg → thickness ≈ 2px (barely visible, labeled)
- Q_boiler = 3036.93 kJ/kg → thickness ≈ 12px (maximum, boldest line)
- W_turbine = 906.9 kJ/kg → thickness ≈ 4px
- Q_cond = 2132.19 kJ/kg → thickness ≈ 8px

**Rule:** Always label arrows with numeric values. Even tiny arrows (W_pump) must be labeled so student understands the relative magnitudes.

---

## H. COMPONENT-TO-SCHEMATIC MAPPING

**Each cycle has a schematic. When user clicks state point, that component highlights on schematic. Mapping is explicit:**

| Cycle | State 1 | State 2 | State 3 | State 4 | State 5 |
|-------|---------|---------|---------|---------|---------|
| Rankine | Pump inlet | Pump outlet | Boiler outlet | Turbine outlet | Condenser outlet (=1) |
| Brayton | Compressor inlet | Compressor outlet | Combustor outlet | Turbine outlet | Exhaust (=1) |
| Otto | Cyl start | End compression | End combustion | End expansion | Exhaust (=1) |

**Opus must maintain state→component reverse mapping for click highlighting.**

---

## I. REAL vs. IDEAL STATE ARRAY FORMAT

**Gemini returns both ideal and real states when `isReal === true`. Format:**

```js
{
  error: false,
  states: [
    // Ideal cycle (isentropic processes)
    { stateNum: 1, T: 318.96, P: 10, v: 0.14670, h: 191.81, s: 0.6493, u: 191.25, x: 0, component: 'pump_inlet', isIdeal: true },
    { stateNum: 2, T: 49.73, P: 6000, v: 0.00107, h: 193.97, s: 0.6493, u: 192.40, x: 0, component: 'pump_outlet', isIdeal: true },
    // ... more ideal states
  ],
  statesReal: [
    // Real cycle (with isentropic efficiencies applied)
    { stateNum: 1, T: 318.96, P: 10, v: 0.14670, h: 191.81, s: 0.6493, u: 191.25, x: 0, component: 'pump_inlet', isIdeal: false },
    { stateNum: 2, T: 51.2, P: 6000, v: 0.00108, h: 195.5, s: 0.6510, u: 193.8, x: 0, component: 'pump_outlet', isIdeal: false },
    // ... more real states
  ],
  metrics: { /* ideal metrics */ },
  metricsReal: { /* real metrics */ }
}
```

**Opus behavior:** When "Ideal→Real" toggle is OFF, display `states` and `metrics`. When ON, display `statesReal` and `metricsReal`.

---

## J. NEAR-CRITICAL-POINT EDGE CASE

**If any state lands near critical point (T > 373°C, P > 22000 kPa for water), dome rendering changes:**

### Criteria
```js
const T_crit = 374.14;  // water critical temperature in °C
const P_crit = 22089;   // water critical pressure in kPa

const nearCritical = (state.T > T_crit - 5) || (state.P > P_crit - 1000);
```

### Rendering
- If any state is nearCritical: Draw saturation dome but **skip quality lines** (x becomes undefined)
- Label dome region as "Supercritical" above critical point
- Do NOT attempt to calculate quality if state is supercritical

**Gemini:** Set `x: null` and `phase: 'supercritical'` for states above critical point.

---

## K. CYCLE REGISTRY REQUIRED FIELDS

**Gemini doesn't need to know this, but Opus needs these fields for each cycle in cycleRegistry.js:**

```js
{
  id: 'rankine-basic',
  name: 'Basic Rankine Cycle',
  chapter: 11,
  category: 'phase-change',  // 'ideal-gas', 'phase-change', 'combined'
  workingFluid: 'water',      // 'water', 'air', 'R-134a', etc.
  stateCount: 4,
  processes: [
    { from: 1, to: 2, type: 'isentropic', component: 'pump' },
    { from: 2, to: 3, type: 'isobaric', component: 'boiler' },
    { from: 3, to: 4, type: 'isentropic', component: 'turbine' },
    { from: 4, to: 1, type: 'isobaric', component: 'condenser' }
  ],
  inputs: [
    { id: 'P_high', label: 'Boiler Pressure', unit: 'kPa', min: 500, max: 15000, default: 6000 },
    { id: 'P_low', label: 'Condenser Pressure', unit: 'kPa', min: 5, max: 200, default: 10 },
    { id: 'T_3', label: 'Turbine Inlet Temp', unit: '°C', min: 200, max: 600, default: 400 }
  ],
  diagrams: ['Ts'],           // from table A above
  hasSaturationDome: true,    // from table A above
  hasQualityLines: true,
  schematicLayout: 'rankine'  // references layouts in src/components/Schematic/layouts/
}
```

---

## L. VALIDATION TOLERANCE MATRIX

**When Gemini produces results, acceptable error ranges:**

| Metric | Tolerance | Source |
|--------|-----------|--------|
| η_thermal | ±1.0% | Borgnakke & Sonntag textbook |
| η_carnot | ±0.5% | Theoretical (1 - T_L/T_H) |
| W_net | ±5% | Borgnakke & Sonntag examples |
| Q_H, Q_L | ±5% | Depends on property engine accuracy |
| COP (refrigeration) | ±2% | Depends on refrigerant tables |
| BWR (Brayton) | ±3% | Work ratio is sensitive to T ratios |

**Opus checks these during integration. If Gemini result is outside tolerance, Opus investigates property engine or cycle logic.**

---

## QUICK REFERENCE FOR PROMPTING

**When prompting Gemini:**
- Reference: "See AMBIGUITY_RESOLUTION § B for component labels"
- Copy-paste: Component label table from § B
- Code example: Use § E algorithm for two-phase paths

**When prompting Opus:**
- Reference: "See AMBIGUITY_RESOLUTION § A for diagram types per cycle"
- Copy-paste: Cycle → Diagram matrix from § A
- Math: Use § F for arrow scaling formula

