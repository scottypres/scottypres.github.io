# Ready-to-Use Prompts for Opus & Codex

Copy and paste these into your AI sessions. Each is self-contained and references the planning docs.

---

## PROMPT 1: OPUS PASS 1 GROUNDWORK

```
You are building the visual framework for CycleViz, a thermodynamic cycle explorer web app.

CONTEXT:
- Existing code: React + Vite in /thermoproject/src/
- Phase 1 (property lookup, saturation dome, particle animation) is complete
- Your job: Build the remaining visual/interactive infrastructure before Codex generates cycle calculators

PLANNING DOCUMENTS (in thermoproject/):
- OPUS_PLAN.md: Your tasks (1.1–1.8, Pass 1 groundwork only)
- IMPLEMENTATION_SPECS.md § 3: SVG coordinate transformation math (REQUIRED)
- AMBIGUITY_RESOLUTION.md § A, § K: Cycle metadata and diagram types

TASKS (Execute in this order):

1.1 CYCLE REGISTRY (src/engine/cycles/cycleRegistry.js)
   - Define all 18 cycle metadata objects with structure from OPUS_PLAN.md § 1.1
   - Include: id, name, chapter, category, workingFluid, stateCount, processes, inputs, metrics, diagrams, hasSaturationDome
   - Reference AMBIGUITY_RESOLUTION.md § A for which diagrams each cycle uses
   - Reference AMBIGUITY_RESOLUTION.md § K for required fields
   - Export default array of all 18 cycles

1.2 CYCLE DIAGRAM RENDERER (src/components/CycleDiagram/CycleDiagram.jsx)
   - Generic SVG component that accepts: { cycle, states, metrics }
   - Render 600×400 SVG with 65px left, 50px bottom, 20px top/right padding
   - For each cycle.diagrams type, render that diagram:
     * T-s: linear x, linear y (see IMPLEMENTATION_SPECS.md § 3, T-s section)
     * P-v: log x, log y
     * P-h: linear x, log y
   - Draw process paths between consecutive states (use processPath.js from 1.3)
   - Draw and label state points (1, 2, 3, ...) as SVG circles
   - Shade net work area (P-v) and net heat area (T-s) with semi-transparent fill
   - If cycle.hasSaturationDome: draw saturation dome using existing water.js data
   - Include gridlines, axes, labels, tick marks

1.3 PROCESS PATH GEOMETRY (src/components/CycleDiagram/processPath.js)
   - Export functions for each process type: drawIsothermal, drawIsentropic, drawIsobaric, drawIsochoric, drawPolytropic
   - Each takes: { state_from, state_to, diagramType: 'Ts'|'Pv'|'Ph', saturationDome? }
   - Each returns: { svgPath: "M...", intermediatePoints: [{x,y}, ...] }
   - Use coordinate transforms from IMPLEMENTATION_SPECS.md § 3
   - For two-phase paths (quality 0 < x < 1), follow saturation dome boundary (see IMPLEMENTATION_SPECS.md § 3, "Two-phase paths" section)
   - Test with Rankine cycle: turbine expansion should cross dome smoothly

1.4 ENERGY FLOW SCHEMATIC FRAMEWORK (src/components/Schematic/SchematicRenderer.jsx)
   - Generic SVG component that accepts: { layout, states, metrics }
   - Render component icons (40×40 SVG each): Turbine, Compressor, Pump, Boiler, Condenser, Combustor, HeatExchanger, ExpansionValve, Nozzle, Diffuser, FeedwaterHeater, Evaporator
   - Render flow lines connecting components (from layout.connections)
   - Render energy arrows (Q_in, Q_out, W_in, W_out) with thickness proportional to magnitude
   - Arrow thickness formula in AMBIGUITY_RESOLUTION.md § G: minThickness=2px, maxThickness=12px
   - Label each arrow with numeric value (kJ/kg)
   - Animate flow direction dots along flow lines
   - Color scheme: red=heat in, blue=heat out, green=work out, orange=work in

1.5 SCHEMATIC LAYOUTS (src/components/Schematic/layouts/)
   - Create rankineLayouts.js: layouts for Basic, Reheat, Regenerative, Cogeneration
   - Create braytonLayouts.js: layouts for Basic, Regenerator variant, Jet Propulsion, Combined Brayton-Rankine
   - Create pistonLayouts.js: layouts for Otto, Diesel, Stirling, Atkinson, Miller
   - Create refrigerationLayouts.js: layouts for Vapor-Compression, Air-Standard, Absorption
   - Each layout exports: { components: [{type, x, y, label}], connections: [{from, to}], energyArrows: [{id, type, component, side, value}] }
   - See IMPLEMENTATION_SPECS.md § 9 for detailed layout structure

1.6 APP NAVIGATION OVERHAUL (src/App.jsx)
   - Replace 2-tab system with bottom navigation bar (mobile) / sidebar (desktop)
   - 4 tabs: "Cycles" | "Dome" | "Lookup" | "Quiz"
   - Cycles tab: 
     * Dropdown selector (grouped: Ideal Gas | Phase-Change | Other)
     * CycleDiagram component (renders diagrams for selected cycle)
     * SchematicRenderer below diagram
     * CycleControls panel on right (desktop) / below (mobile)
     * CycleMetrics display below
   - Dome tab: Keep existing SaturationDome + ParticleAnimation
   - Lookup tab: Keep existing PropertyLookup
   - Quiz tab: Placeholder for now (render empty container)
   - Responsive breakpoint at 768px (mobile switches to vertical stack)

1.7 CYCLE CONTROLS PANEL (src/components/CycleControls/CycleControls.jsx)
   - Accept cycle definition (from registry)
   - For each cycle.inputs, render a slider with:
     * Label, min/max, default, current value, unit
     * +/− step buttons on each side (44×44px touch targets for mobile)
   - Add "Ideal vs. Real" toggle (default OFF)
   - When toggle ON, show 3 sliders for:
     * η_turbine (default 0.85, range 0.70–0.98) — see AMBIGUITY_RESOLUTION.md § C
     * η_compressor (default 0.85, range 0.70–0.98)
     * η_pump (default 0.90, range 0.75–0.98)
   - Add "Dead State T₀" input field (default 298.15 K, for exergy)
   - On every input change, call: `calculateCycle(inputValues, isReal)` and trigger parent update
   - Export hook/callback for values

1.8 METRICS DISPLAY (src/components/CycleMetrics/CycleMetrics.jsx)
   - Accept metrics object from cycle calculator
   - Display state-point table: columns for State #, T(K/°C toggle), P, v, h, s, u, x
   - Display performance metrics row: η_thermal, η_carnot, W_net, Q_H, Q_L, BWR (if Brayton), COP (if refrigeration)
   - Sticky footer on mobile (always visible)
   - Color-code row backgrounds for two-phase states

VALIDATION:
- All 18 cycles appear in registry
- CycleDiagram renders T-s correctly for Rankine (should show T-s rectangle with dome)
- SchematicRenderer draws Rankine schematic with 5 components (Pump, Boiler, Turbine, Condenser, FWH for Regen variant)
- Controls panel has sliders that update on input change
- Mobile responsive at 375px and 768px breakpoints
- Bundle size: monitor with build output (target <200KB gzipped)

DO NOT implement:
- Sankey diagrams (Pass 2)
- Cycle comparison mode (Pass 2)
- Exergy destruction (Pass 2)
- Quiz mode (Pass 2)
- Any cycle calculations (Codex will do this)

When complete, commit with message:
"Opus Pass 1: Build cycle registry, diagram renderer, schematic framework, app navigation, controls, and metrics display"
```

---

## PROMPT 2: CODEX CYCLE CALCULATORS

```
You are generating all 18 thermodynamic cycle calculators for CycleViz, a React-based educational web app.

CONTEXT:
- Existing: React + Vite, complete property engines (water.js, refrigerants.js, idealGas.js)
- Your job: Generate pure math functions for all 18 cycles
- Opus has built the visual framework; you plug the logic in
- These functions will be called by React sliders → update diagrams in real-time

PLANNING DOCUMENTS (in thermoproject/):
- CODEX_PLAN.md: All 18 cycle specs with inputs/outputs
- IMPLEMENTATION_SPECS.md: Error handling, unit conversions, validated test cases, state array format
- AMBIGUITY_RESOLUTION.md § B, § E, § I, § L: Component labels, path crossing, state format, tolerances

CRITICAL REQUIREMENTS (read before coding):
1. STATE ARRAY FORMAT (IMPLEMENTATION_SPECS.md § 7) — MUST follow exactly:
   ```js
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
       component: 'pump_inlet'  // from AMBIGUITY_RESOLUTION.md § B
     },
     // ... more states
   ]
   ```

2. METRICS FORMAT (IMPLEMENTATION_SPECS.md § 7):
   ```js
   metrics: {
     eta_thermal: 0.298,
     eta_carnot: 0.526,
     W_net: 904.74,
     Q_H: 3036.93,
     Q_L: 2132.19,
     W_turbine: 906.9,
     W_compressor: 2.16,
     W_pump: 2.16,
     BWR: undefined,      // only for Brayton
     COP: undefined       // only for refrigeration
   }
   ```

3. ERROR HANDLING (IMPLEMENTATION_SPECS.md § 2):
   ```js
   export function calculateCycle(inputs, isReal = false) {
     // Always return { error, states, metrics } or { error: true, message, details }
     // NEVER throw exceptions
   }
   ```

4. UNIT CONVERSIONS (IMPLEMENTATION_SPECS.md § 1):
   - Inputs: T in °C, P in kPa
   - Internal: T in K (T_K = T_C + 273.15)
   - Property engines: use K
   - Output: display both K and °C

5. PROPERTY ENGINE USAGE (IMPLEMENTATION_SPECS.md § 8):
   - MUST use: getWaterProps, getRefrigerantProps, getIdealGasProps (don't rewrite)
   - Check .error field before using result
   - See spec for examples

6. ISENTROPIC EFFICIENCIES (AMBIGUITY_RESOLUTION.md § C):
   - When isReal === true, apply η_turbine, η_compressor, η_pump
   - defaults: 0.85, 0.85, 0.90
   - Return BOTH ideal and real states (see § I for format)

7. TWO-PHASE PATH DETECTION (AMBIGUITY_RESOLUTION.md § E):
   - When turbine expands into two-phase region, set: states[3].pathCrossesPhase = true
   - Opus uses this to draw dome transition on T-s diagram

CYCLE GENERATION ORDER (build in this order):

### PHASE 2: IDEAL GAS CYCLES (5 cycles)
1. Carnot (carnot.js) — Isothermal and isentropic processes
2. Polytropic (polytropic.js) — Single process sandbox, variable n
3. Otto (otto.js) — Compression ratio, constant-volume heat addition
4. Diesel (diesel.js) — Compression ratio, constant-pressure heat addition, cutoff ratio
5. Brayton (brayton.js) — Pressure ratio, turbine inlet temp, back-work ratio

### PHASE 3: PHASE-CHANGE CYCLES (4 cycles)
6. Rankine Basic (rankine.js) — Pump, boiler, turbine, condenser (4 states)
7. Rankine Reheat (rankineReheat.js) — HP + LP turbines with reheat (6 states)
8. Rankine Regenerative (rankineRegenerative.js) — Open feedwater heater, bleed fraction (8 states)
9. Vapor-Compression (vaporCompression.js) — R-134a or R-410a, expansion valve throttle

### PHASE 4: REMAINING CYCLES (8 cycles)
10. Stirling (stirling.js) — Isothermal + constant-volume processes
11. Atkinson (atkinson.js) — Different compression/expansion ratios
12. Miller (miller.js) — Valve timing variant of Atkinson
13. Jet Propulsion (jetPropulsion.js) — Open Brayton with nozzle, 7 states
14. Air-Standard Refrigeration (airRefrigeration.js) — Reversed Brayton
15. Cogeneration (cogeneration.js) — Rankine with process heat extraction
16. Absorption Refrigeration (absorptionRefrigeration.js) — Conceptual/schematic only (no calc)
17. Combined Brayton-Rankine (combinedCycle.js) — Topping + bottoming cycles
18. Ammonia Engine (ammonia.js) — Property correlations for NH₃

VALIDATION TESTS (from IMPLEMENTATION_SPECS.md § 5):

Run each calculator against these test cases. Results MUST be within tolerance:

RANKINE TEST (Example 11.3, page 564):
```js
const input = { P_high: 6000, P_low: 10, T_3: 400 };
const result = calculateRankine(input);
console.assert(Math.abs(result.metrics.eta_thermal - 0.298) < 0.01, 'η should be ~0.298 ±1%');
console.assert(Math.abs(result.metrics.W_net - 904.74) < 10, 'W_net should be ~904.74 ±10 kJ/kg');
console.assert(result.states[0].h > 191 && result.states[0].h < 192, 'State 1 h');
```

BRAYTON TEST (Example 12.2, page 652):
```js
const input = { T_1: 20, P_1: 100, r_p: 8, T_3: 800 };
const result = calculateBrayton(input);
console.assert(Math.abs(result.metrics.eta_thermal - 0.496) < 0.01, 'η should be ~0.496 ±1%');
console.assert(Math.abs(result.metrics.W_net - 261.2) < 5, 'W_net should be ~261.2');
console.assert(Math.abs(result.metrics.BWR - 0.498) < 0.02, 'BWR should be ~0.498');
```

OTTO TEST (Example 12.6, page 685):
```js
const input = { r: 8, T_1: 27, P_1: 100, Q_in: 2000 };
const result = calculateOtto(input);
console.assert(Math.abs(result.metrics.eta_thermal - 0.563) < 0.005, 'η should be ~0.563 ±0.5%');
console.assert(Math.abs(result.metrics.W_net - 1133) < 50, 'W_net should be ~1133');
```

VAPOR-COMPRESSION TEST (Example 11.5, page 580):
```js
const input = { refrigerant: 'R-134a', T_evap: -10, T_cond: 30 };
const result = calculateVaporCompression(input);
console.assert(Math.abs(result.metrics.COP - 3.544) < 0.05, 'COP should be ~3.544 ±1.4%');
console.assert(Math.abs(result.metrics.Q_L - 129.93) < 2, 'Q_L should be ~129.93');
```

COMPONENT LABELS (AMBIGUITY_RESOLUTION.md § B):
Each state MUST have correct component label:
```js
Rankine: states[0].component = 'pump_inlet', states[1].component = 'pump_outlet', etc.
Brayton: states[0].component = 'compressor_inlet', states[1].component = 'compressor_outlet', etc.
```

FILE STRUCTURE:
Create: src/engine/cycles/
- carnot.js
- polytropic.js
- otto.js
- diesel.js
- brayton.js
- rankine.js
- rankineReheat.js
- rankineRegenerative.js
- vaporCompression.js
- stirling.js
- atkinson.js
- miller.js
- jetPropulsion.js
- airRefrigeration.js
- cogeneration.js
- absorptionRefrigeration.js (schematic only, return empty)
- combinedCycle.js
- ammonia.js (property engine)

Each exports: export function calculateCycleName(inputs, isReal = false) { ... }

DETAILED SPECS:
See CODEX_PLAN.md for each cycle's inputs/outputs/equations

TEST & VALIDATE:
- Run each calculator with test inputs
- Confirm output within tolerance (AMBIGUITY_RESOLUTION.md § L)
- Check component labels match § B
- Verify no exceptions thrown, all errors returned as { error: true, ... }
- Test isReal = true for Rankine and Brayton (should return both ideal and real states)

When complete, commit with message:
"Codex: Generate all 18 cycle calculators with validated test cases"
```

---

## PROMPT 3: OPUS PASS 2 FINISH

```
Complete any unfinished items from Codex_plan.md
You are completing CycleViz by integrating Codex's cycle calculators, building advanced features, and polishing.

CONTEXT:
- Pass 1 (visual framework, controls, diagrams, schematics) is complete
- Codex has generated all 18 cycle calculators in src/engine/cycles/
- Your job: Wire everything together, build advanced features, test, and polish for production

PLANNING DOCUMENTS:
- OPUS_PLAN.md Pass 2 (Tasks 2.1–2.7)
- IMPLEMENTATION_SPECS.md: Validation tolerances, coordinate math, error handling
- AMBIGUITY_RESOLUTION.md: Quick reference for all integration details

TASKS:

2.1 INTEGRATION OF CYCLE CALCULATORS
   - Import all 18 cycle functions from src/engine/cycles/*.js
   - Create src/engine/cycles/index.js that exports all calculators mapped to cycle IDs
   - Wire CycleControls → Calculator → CycleDiagram → CycleMetrics pipeline:
     * On input change in CycleControls, extract inputValues
     * Call appropriate calculator: calculateRankine(inputValues, isReal)
     * Check result.error; if error, display message in UI
     * If success, pass states to CycleDiagram and metrics to CycleMetrics
   - Handle real vs. ideal toggle: when toggle ON, display statesReal and metricsReal
   - Validate test cases (from IMPLEMENTATION_SPECS.md § 5) pass within tolerance (AMBIGUITY_RESOLUTION.md § L)
   - Debug any issues:
     * State points not on diagrams correctly → check coordinate transforms
     * Process paths not following saturation dome → check processPath.js logic
     * Schematic arrows have wrong magnitudes → check calculator outputs

2.2 SANKEY DIAGRAM
   - Create src/components/Sankey/SankeyDiagram.jsx
   - Vertical "river of energy" visualization:
     * Top: Q_H enters as wide band (red)
     * Splits: W_net exits left side (green), Q_L exits bottom (blue)
     * Each component's contribution shown as branch
     * Band widths proportional to energy magnitude
     * Smooth Bezier curves for splits
   - Toggle between Schematic and Sankey view for any cycle
   - See OPUS_PLAN.md § 2.2 for full spec

2.3 CYCLE COMPARISON MODE
   - Create src/components/CycleComparison/CycleComparison.jsx
   - Allow selecting two cycles to overlay on same T-s diagram
   - First cycle: solid lines, primary colors
   - Second cycle: dashed lines, secondary colors
   - Display both efficiency values side by side
   - Preset comparisons: Rankine vs Reheat, Otto vs Diesel, Brayton vs Brayton+Regen
   - Use same CycleDiagram but with dual data sets overlaid

2.4 EXERGY DESTRUCTION BAR CHART
   - Create src/components/Exergy/ExergyChart.jsx
   - Horizontal bar chart showing exergy destruction per component
   - For each component: I = T₀ · S_gen (dead state temperature × entropy generation)
   - Bars colored by component type
   - Show total exergy destruction and second-law efficiency: η_II = W_net / (exergy input)
   - Render beside schematic

2.5 MOBILE POLISH
   - Bottom tab bar with 4 tabs: Diagrams | Schematic | Data | Quiz
   - Landscape detection → side-by-side P-v | T-s layout
   - Pinch-to-zoom on SVG diagrams (CSS transform + touch events)
   - Swipe between diagram views (T-s ↔ P-v ↔ P-h)
   - Ensure all calculations complete in <16ms for 60fps updates
   - Test at 375px (iPhone SE), 768px (iPad), 1920px (desktop)
   - Font sizes readable on small screens, touch targets ≥44×44px

2.6 PWA MANIFEST
   - Create public/manifest.json with app name, icons, theme color
   - Add service worker for offline caching (all assets are local)
   - Meta tags in index.html for "Add to Home Screen"
   - Test "Add to Home Screen" on iOS and Android

2.7 FINAL INTEGRATION TESTING
   - [ ] All 18 cycles render correctly on correct diagram types (per AMBIGUITY_RESOLUTION.md § A)
   - [ ] Efficiency values match textbook examples within ±1% (AMBIGUITY_RESOLUTION.md § L)
   - [ ] All schematics have correct arrow directions and magnitudes
   - [ ] State points labeled correctly with component names (per § B)
   - [ ] Two-phase processes cross saturation dome smoothly (Rankine turbine)
   - [ ] Real vs. Ideal toggle works; both state arrays display correctly
   - [ ] Sankey diagram splits energy correctly (W_net + Q_L ≈ Q_H within ±1%)
   - [ ] Cycle comparison overlay works (two cycles visible, no label collision)
   - [ ] Exergy chart shows correct component contributions
   - [ ] Mobile layout responsive at all breakpoints
   - [ ] Bundle size <200KB gzipped
   - [ ] No console errors in browser dev tools
   - [ ] Service worker caches assets; app works offline

VALIDATION EXAMPLES:

Rankine (P_high=6000, P_low=10, T_3=400):
- η_thermal should display ~0.298 (29.8%)
- η_carnot should display ~0.526 (52.6%)
- Diagram shows dome, states labeled 1-4, T-s rectangular path
- Schematic shows 5 components with arrows: W_pump (small), Q_boiler (large), W_turbine (medium), Q_condenser (medium)
- Sankey shows Q_boiler splits into W_net and Q_condenser

Brayton (T_1=20, P_1=100, r_p=8, T_3=800):
- η_thermal should display ~0.496 (49.6%)
- BWR should display ~0.498 (49.8%)
- Diagram shows closed loop on P-v and T-s
- Schematic shows 4 components: Compressor → Combustor → Turbine → Exhaust
- No saturation dome (ideal gas)

KNOWN EDGE CASES:
- States near critical point (T > 373°C, P > 22000 kPa): x becomes undefined, label "Supercritical"
- Polytropic n = k: should equal isentropic
- Polytropic n = 0: should be isobaric (constant P path)
- Polytropic n = ±∞: should be isochoric (constant v path)
- Absorption refrigeration: return diagrams: [] (schematic only, no calculation)

DEBUGGING CHECKLIST:
- Coordinate transforms wrong? Check IMPLEMENTATION_SPECS.md § 3 formulas
- Process paths not smooth? Increase sample points from 20 to 30
- Arrows tiny/huge? Check scaling formula in AMBIGUITY_RESOLUTION.md § G
- State points not labeled? Ensure calculator includes states[i].component field
- Two-phase path wrong? Check IMPLEMENTATION_SPECS.md § 3, "Two-phase paths" algorithm

When complete, commit with message:
"Opus Pass 2: Integrate cycle calculators, build Sankey/comparison/exergy, polish mobile, add PWA, final testing"

Then push to main and you're done!
```

---

## USAGE INSTRUCTIONS

1. **Start with OPUS PASS 1:**
   - Copy "PROMPT 1: OPUS PASS 1 GROUNDWORK" above
   - Paste into Opus chat
   - Reference OPUS_PLAN.md, IMPLEMENTATION_SPECS.md, AMBIGUITY_RESOLUTION.md as needed
   - When complete, commit and ask Opus to confirm

2. **Then CODEX:**
   - Copy "PROMPT 2: CODEX CYCLE CALCULATORS" above
   - Paste into Codex chat
   - Codex generates all 18 cycles with test validation
   - When complete, download .js files and add to src/engine/cycles/
   - Run validation tests locally to confirm within tolerance

3. **Finally OPUS PASS 2:**
   - Copy "PROMPT 3: OPUS PASS 2 FINISH" above
   - Paste into Opus chat
   - Reference AMBIGUITY_RESOLUTION.md heavily for integration details
   - When complete, commit, test in browser, push to main

All three prompts are self-contained and reference the documentation as needed.
