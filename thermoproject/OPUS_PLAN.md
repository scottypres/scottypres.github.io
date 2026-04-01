# OPUS SUBPLAN — Visual Architecture & Integration

## Overview
You are building visual/interactive features for CycleViz, a thermodynamic cycle explorer app. This plan covers TWO passes:
- **Pass 1 (Groundwork):** Build the visual infrastructure that Codex will plug cycle logic into
- **Pass 2 (Finish):** Integrate Codex's output, build complex visual features, polish

ALL WORK MUST BE IN THE `thermoproject/` SUBFOLDER. Do not edit files in the git root.

---

## EXISTING CODEBASE (Do Not Recreate)

### Engine Layer (fully built)
- `src/engine/water.js` — Wagner equations, saturation props, master getWaterProps() lookup
- `src/engine/refrigerants.js` — R-134a and R-410a correlations, getRefrigerantProps()
- `src/engine/idealGas.js` — Air/N₂/CO₂/CH₄ with isentropicRelation(), polytropicWork(), entropyChange()
- `src/engine/phaseDetermination.js` — Master router lookupProperties(substance, prop1, prop2)
- `src/engine/constants.js` — 8 substances with critical points, specific heats, gas constants
- `src/engine/interpolation.js` — lerp, lerpWithWork, tableInterpolate (currently unused)

### UI Layer (fully built)
- `src/App.jsx` — Tab container (Saturation Dome | Property Lookup), thermoState management
- `src/components/SaturationDome/` — DomeSVG (430 lines, multi-view SVG), DraggablePoint (187 lines), PropertyReadout
- `src/components/ParticleAnimation/` — Canvas particle engine (278 lines), React wrapper
- `src/components/PropertyLookup/` — Form-based property lookup with substance selector
- `src/hooks/useThermo.js` — React hook for property calculations
- `src/global.css` — Dark theme, CSS variables, responsive breakpoints at 768px

### Key Architecture Details
- SVG diagrams are 600×400 with padding: left=65, bottom=50, top=20, right=20
- Dark theme: bg=#0f172a, cards=#1e293b, text=#f1f5f9
- Process color convention: isothermal=blue, isentropic=green, isobaric=red, isochoric=orange, polytropic=purple
- No routing library — tab-based navigation with conditional rendering
- No state management library — React useState/useEffect only
- Vite with base: '/thermoproject/' for GitHub Pages

---

## CRITICAL: READ IMPLEMENTATION_SPECS.md FIRST

Before starting any task, read `src/engine/../IMPLEMENTATION_SPECS.md`:
- § 3: SVG coordinate transformation math (REQUIRED for Task 1.2, 1.3)
- § 7: State array standard format (REQUIRED for Task 1.2, 2.1)
- § 9: Schematic component specs (REQUIRED for Task 1.4, 1.5)

All diagram rendering MUST use the coordinate transforms specified in § 3. All cycle integration MUST handle state arrays in § 7 format.

---

## PASS 1: GROUNDWORK (Before Codex)

### Task 1.1: Cycle Data Architecture
Create `src/engine/cycles/cycleRegistry.js` — a registry that defines the shape of every cycle:

```js
// Each cycle definition contains:
{
  id: 'rankine-basic',
  name: 'Basic Rankine Cycle',
  category: 'phase-change', // or 'ideal-gas', 'combined'
  chapter: 11,
  workingFluids: ['water'],
  stateCount: 4,
  processes: [
    { from: 1, to: 2, type: 'isentropic', component: 'pump' },
    { from: 2, to: 3, type: 'isobaric', component: 'boiler' },
    { from: 3, to: 4, type: 'isentropic', component: 'turbine' },
    { from: 4, to: 1, type: 'isobaric', component: 'condenser' },
  ],
  inputs: [
    { id: 'P_high', label: 'Boiler Pressure', unit: 'kPa', min: 500, max: 15000, default: 6000 },
    { id: 'P_low', label: 'Condenser Pressure', unit: 'kPa', min: 5, max: 200, default: 10 },
    { id: 'T3', label: 'Turbine Inlet Temp', unit: '°C', min: 200, max: 600, default: 400 },
  ],
  metrics: ['eta_thermal', 'W_net', 'Q_H', 'Q_L', 'BWR', 'eta_carnot'],
  diagrams: ['Ts', 'Pv'],  // which diagrams to show
  hasSchematic: true,
  hasDome: true,  // show saturation dome on diagram
}
```

Register all 18 cycles with their full metadata. This is the contract that Codex's calculation functions will plug into.

### Task 1.2: Cycle Diagram Renderer
Create `src/components/CycleDiagram/CycleDiagram.jsx` — a generic SVG cycle diagram renderer.

This component must:
1. Accept a cycle definition + computed state points array
2. Render P-v and/or T-s diagrams (reuse coordinate transform logic from DomeSVG.jsx)
3. Draw process paths between state points, color-coded by process type:
   - Isothermal (blue): curved path at constant T on T-s, hyperbolic on P-v
   - Isentropic (green): vertical line on T-s, polytropic curve on P-v (Pv^k = const)
   - Isobaric (red): horizontal on P-v, curved on T-s
   - Isochoric (orange): vertical on P-v, curved on T-s
   - Polytropic (purple): general curve
4. Draw numbered state points (1, 2, 3...) as clickable circles
5. Shade net work area (P-v) and net heat area (T-s) with semi-transparent fill
6. Optionally overlay saturation dome (for Rankine, vapor-compression cycles)
7. Include axes with labels, grid lines, tick marks
8. Support log scale on v-axis (P-v diagrams)

Key: This renderer is GENERIC. It takes data, not cycle-specific logic. Every cycle uses the same renderer by passing different state point arrays.

### Task 1.3: Process Path Geometry
Create `src/components/CycleDiagram/processPath.js` — SVG path generators for each thermodynamic process type.

**See IMPLEMENTATION_SPECS.md § 3 for coordinate transformation math and process path equations.**

For each process type, generate an SVG path `d` attribute between two state points:
- **Isentropic on T-s:** vertical line (constant s). On P-v: curve following Pv^k = C (sample 30 points)
- **Isothermal on T-s:** horizontal line (constant T). On P-v: curve following Pv = C (sample 30 points)
- **Isobaric on P-v:** horizontal line (constant P). On T-s: curve following ds = cp·dT/T
- **Isochoric on P-v:** vertical line (constant v). On T-s: curve following ds = cv·dT/T
- **Polytropic:** general curve following Pv^n = C (sample 20-30 points)
- **Throttling (isenthalpic):** on T-s, a horizontal dashed line showing entropy increase
- **Two-phase paths:** must follow saturation dome boundary when process crosses from vapor to mixture or mixture to liquid

Each function signature:
```js
function drawProcess(state_from, state_to, processType, diagramType, saturationDome) {
  // Returns: { svgPath: "M ... C ... L ...", intermediatePoints: [{x, y}, ...] }
  // Must handle:
  // - Log scale axes (T-v, P-v, P-h)
  // - Two-phase transitions (check if path crosses dome, follow boundary if so)
  // - Validation: all intermediate points must be valid (T > 0, P > 0, etc.)
}
```

Use cubic Bezier curves (C commands) for smooth paths. Test against saturation dome to avoid plotting impossible states.

### Task 1.4: Energy Flow Schematic Framework
Create `src/components/Schematic/SchematicRenderer.jsx` — generic energy flow schematic renderer.

Build SVG component icons (each as a reusable sub-component):
- Turbine: trapezoid (wide top, narrow bottom), green W_out arrow
- Compressor: trapezoid (narrow top, wide bottom), orange W_in arrow
- Pump: circle with triangle inside
- Boiler: rectangle with flame icon, red Q_in arrow
- Condenser: rectangle with cooling waves, blue Q_out arrow
- Combustion Chamber: rectangle with flame
- Heat Exchanger / Regenerator: rectangle with counter-flow arrows
- Expansion Valve: bowtie/X shape
- Nozzle: converging trapezoid
- Diffuser: diverging trapezoid
- Feedwater Heater: small rectangle
- Evaporator: rectangle with frost symbol

Each icon is ~40×40 SVG. The schematic renderer:
1. Accepts a layout definition: `{ components: [{type, x, y, label}], connections: [{from, to}], arrows: [{type, value, unit, fromComponent, position}] }`
2. Renders components at specified positions
3. Draws flow lines connecting components (with animated dots showing flow direction)
4. Draws energy arrows (Q and W) with thickness proportional to magnitude
5. Labels each arrow with its numeric value

### Task 1.5: Schematic Layouts for All Cycles
Create `src/components/Schematic/layouts/` — one layout file per cycle category:

- `rankineLayouts.js` — Basic, Reheat (6 components), Regenerative (with FWH + 2 pumps), Cogeneration
- `braytonLayouts.js` — Basic, with Regenerator, Jet Propulsion, Combined Brayton-Rankine
- `pistonLayouts.js` — Otto, Diesel, Stirling, Atkinson, Miller (piston-cylinder with 4 snapshots)
- `refrigerationLayouts.js` — Vapor-compression, Air-standard, Absorption (conceptual)
- `carnotLayout.js` — Generic Carnot

Each layout exports: component positions, connection paths, arrow attachment points. The values (kJ/kg) come from the cycle calculator at runtime.

### Task 1.6: App Navigation Overhaul
Modify `src/App.jsx` to support the full app:

Replace the 2-tab system with a bottom navigation bar (mobile) / sidebar (desktop):
- **Cycles** tab → Cycle selector dropdown + CycleDiagram + Schematic + controls + metrics
- **Dome** tab → Existing SaturationDome + ParticleAnimation (keep as-is)
- **Lookup** tab → Existing PropertyLookup (keep as-is)
- **Quiz** tab → Quiz mode (placeholder for now)

Add a cycle selector component:
- Grouped dropdown: "Ideal Gas Cycles" / "Phase-Change Cycles" / "Other Cycles"
- Shows cycle name + chapter reference
- Selecting a cycle loads its controls, diagrams, and schematic

### Task 1.7: Cycle Controls Panel
Create `src/components/CycleControls/CycleControls.jsx`:

A generic controls panel that reads the cycle definition's `inputs` array and renders:
- Labeled sliders with min/max/step/default from the registry
- +/- step buttons on each side (44×44px touch targets)
- Current value display with unit
- "Ideal vs. Real" toggle (adds η_turbine, η_compressor, η_pump sliders when on)
- Dead state temperature T₀ input (for exergy, default 298.15 K)

Returns an `inputValues` object that the cycle calculator consumes.

### Task 1.8: Metrics Display
Create `src/components/CycleMetrics/CycleMetrics.jsx`:

Displays computed performance metrics:
- State-point table: columns for State #, T, P, v, h, s, u, x
- Performance metrics row: η_thermal, COP, W_net, Q_H, Q_L, BWR
- Carnot comparison: always show η_Carnot alongside actual
- Sticky footer on mobile showing key metrics

---

## PASS 2: FINISH (After Codex)

> **Codex completion note (current status):**
> - Not fully completed: textbook-tolerance validation is pending because `node`/`npm` were unavailable in the execution environment, so build/test runs could not be executed.
> - Not fully completed: calculators are implemented and mapped through a central dispatcher, but not every module exposes a literal `calculateCycle(inputs)` export signature.
> - Not fully completed: validation data scaffolding was added, but full per-cycle numeric verification against all specified textbook cases remains pending.

### Task 2.1: Integration of Cycle Calculators
Codex will produce `src/engine/cycles/` with calculate functions for all 18 cycles. Each returns:
```js
{ states: [{T, P, v, h, s, u, x}, ...], metrics: {eta, W_net, Q_H, ...} }
```

Wire these into the CycleControls → CycleDiagram → CycleMetrics pipeline:
1. Import each calculator and map to cycle registry IDs
2. Call calculator with slider values on every input change
3. Pass state arrays to CycleDiagram for rendering
4. Pass metrics to CycleMetrics for display
5. Pass arrow values to SchematicRenderer

Debug and fix any issues with:
- State point positions on diagrams (coordinates, scaling)
- Process path rendering (especially two-phase paths crossing the dome)
- Schematic arrow magnitudes matching calculated values

### Task 2.2: Sankey Diagram
Create `src/components/Sankey/SankeyDiagram.jsx`:

A vertical "river of energy" visualization:
- Wide band of Q_H enters from the top
- Splits: W_net flows out one side, Q_L flows out the bottom
- Each component's contribution shown as thinning/splitting branches
- Band widths exactly proportional to energy magnitudes
- Smooth Bezier curves for splits
- Color gradient: red (heat in) → green (work out) → blue (heat out)

Toggle between Schematic view and Sankey view for any cycle.

### Task 2.3: Cycle Comparison Mode
Create `src/components/CycleComparison/CycleComparison.jsx`:

Allow selecting two cycles to overlay on the same T-s diagram:
- First cycle: solid lines, primary colors
- Second cycle: dashed lines, secondary colors
- Both efficiency values displayed side by side
- Preset comparisons: Rankine vs Reheat, Otto vs Diesel, Brayton vs Brayton+Regen

SVG rendering: use the same CycleDiagram but with two data sets overlaid. Manage z-ordering so labels don't collide.

### Task 2.4: Exergy Destruction Bar Chart
Create `src/components/Exergy/ExergyChart.jsx`:

Horizontal bar chart showing exergy destruction per component:
- T₀ · S_gen for each component (turbine, compressor, boiler, condenser, etc.)
- Bars colored by component type
- Total exergy destruction sum
- Second-law efficiency: η_II = W_net / (exergy input)
- Renders beside the schematic

### Task 2.5: Mobile Polish
- Bottom tab bar with 4 tabs: Diagrams | Schematic | Data | Quiz
- Landscape detection → side-by-side P-v | T-s layout
- Pinch-to-zoom on SVG diagrams (use CSS transform + touch events)
- Swipe between diagram views
- Performance: ensure all calculations complete in <16ms for 60fps slider updates

### Task 2.6: PWA Manifest
Add:
- `public/manifest.json` with app name, icons, theme color
- Service worker for offline caching (all assets are local anyway)
- Meta tags in index.html for "Add to Home Screen"

### Task 2.7: Final Integration Testing
- Verify all 18 cycles render correctly on all diagram types
- Check all schematics have correct arrow directions and magnitudes
- Validate efficiency calculations against textbook examples
- Test mobile layout on 375px (iPhone SE) and 768px (iPad) widths
- Ensure bundle size < 200KB gzipped
