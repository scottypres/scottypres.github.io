ALL WORK AND CODING SHOULD BE PERFORMED WITHIN THE THERMOPROJECT SUBFOLDER. DO NOT EDIT ANY CODE IN GIT ROOT

CycleViz — Interactive Thermodynamic Cycle Explorer
Complete Build Plan (v1.0)

PROJECT OVERVIEW
CycleViz is a single-page interactive web app for Thermodynamics 1 students. It is a study tool, homework helper, and lecture companion. The app covers thermodynamic cycles, property lookups, and phase behavior visualization. It is built as a React .jsx artifact (or multi-file React project if using Claude Code) and must work fully offline once loaded, with zero server dependencies.
The source textbook is Borgnakke & Sonntag, "Fundamentals of Thermodynamics" (7th or 8th edition). The app covers material from Chapters 1–12, with emphasis on Ch. 3 (Properties), Ch. 4 (Work/Heat), Ch. 5 (First Law), Ch. 7 (Second Law/Carnot), Ch. 8 (Entropy), Ch. 9 (Second Law for Control Volumes), Ch. 10 (Exergy/Availability), Ch. 11 (Phase-Change Power & Refrigeration Cycles), and Ch. 12 (Gas Power & Refrigeration Cycles).

FEATURE 1: THERMODYNAMIC CYCLE EXPLORER (18 cycles)
1A. Diagram Panel
For each cycle, render side-by-side P-v and T-s diagrams (where applicable) as SVG. Each diagram must include:

Numbered state points (1, 2, 3, 4...) that are tappable/clickable
Process paths color-coded by type:

Isothermal = blue
Isentropic (reversible adiabatic) = green
Isobaric (constant pressure) = red
Isochoric (constant volume) = orange
Polytropic = purple


Shaded area representing net work (P-v) and net heat transfer (T-s)
The saturation dome drawn on any diagram involving phase change (Rankine, vapor-compression, etc.)

1B. Controls Panel
Each cycle has sliders for its key input parameters. Slider changes cause real-time recalculation of all state points and redraw of diagrams. Specific inputs per cycle listed below.
1C. Output Panel
For every cycle, display:

State-point table: columns for State #, T (°C or K), P (kPa), v (m³/kg), h (kJ/kg), s (kJ/kg·K), u (kJ/kg), and x (quality, if in two-phase region)
Performance metrics: thermal efficiency η_th, COP (for refrigeration/heat pump cycles), net work W_net, heat input Q_H, heat rejection Q_L, back-work ratio BWR (for Brayton)
Carnot comparison: always show η_Carnot = 1 − T_L/T_H alongside the actual cycle efficiency

1D. Complete Cycle List with Specifications
CYCLE 1: Carnot Cycle (Ch. 7)

Working fluid: ideal gas (air) or steam (togglable)
Four processes: (1→2) reversible isothermal heat addition at T_H, (2→3) reversible adiabatic expansion, (3→4) reversible isothermal heat rejection at T_L, (4→1) reversible adiabatic compression
Inputs: T_H (K), T_L (K), P_1 (kPa)
Show on both P-v and T-s. T-s is a rectangle. P-v shows two isotherms and two isentropes.
Efficiency: η = 1 − T_L/T_H

CYCLE 2: Polytropic Process Sandbox (Ch. 8)

Not a cycle but a single-process explorer
Working fluid: ideal gas (air, k=1.4)
User selects polytropic exponent n with a slider from −2 to +∞
Show the process on both P-v and T-s diagrams
Highlight special cases: n=0 (isobaric), n=1 (isothermal), n=k=1.4 (isentropic), n=±∞ (isochoric)
Calculate: work w = R(T₂−T₁)/(1−n) for n≠1, entropy change, heat transfer
Relations: P₂/P₁ = (v₁/v₂)ⁿ, T₂/T₁ = (P₂/P₁)^((n−1)/n) = (v₁/v₂)^(n−1)

CYCLE 3: Basic Rankine Cycle (Ch. 11)

Working fluid: water/steam
Four components: pump, boiler, turbine, condenser
Four processes: (1→2) isentropic compression in pump (liquid), (2→3) constant-pressure heat addition in boiler (liquid→superheated vapor), (3→4) isentropic expansion in turbine, (4→1) constant-pressure heat rejection in condenser (back to saturated/subcooled liquid)
Inputs: boiler pressure P_high (kPa), condenser pressure P_low (kPa), turbine inlet temperature T₃ (°C, superheat)
Show on T-s diagram with saturation dome. P-v is less common for Rankine but can be included.
Efficiency: η = (W_turbine − W_pump) / Q_boiler = (h₃−h₄)−(h₂−h₁) / (h₃−h₂)
Requires steam property lookups (see Feature 4)

CYCLE 4: Reheat Rankine Cycle (Ch. 11)

Same as basic Rankine but steam is partially expanded in HP turbine, returned to boiler for reheating to original superheat temperature, then expanded in LP turbine
Six state points: (1) pump exit, (2) boiler exit/HP turbine inlet, (3) HP turbine exit/reheat inlet, (4) reheat exit/LP turbine inlet, (5) LP turbine exit, (6) condenser exit = pump inlet
Additional input: reheat pressure P_reheat (kPa)
Benefit: avoids low quality at LP turbine exit (moisture in blades)

CYCLE 5: Regenerative Rankine Cycle (Ch. 11)

Basic Rankine with an open feedwater heater (FWH)
Steam is bled from the turbine at an intermediate pressure and mixed with subcooled feedwater in the FWH to preheat it before the boiler
Two pumps: one before FWH (low pressure), one after FWH (high pressure)
Additional inputs: bleed pressure P_bleed (kPa), bleed fraction y (calculated from energy balance on FWH)
Energy balance on open FWH: y·h_bleed + (1−y)·h_pump1_exit = 1·h_saturated_liquid_at_P_bleed

CYCLE 6: Cogeneration Cycle (Ch. 11)

Rankine cycle where a fraction of steam is extracted for process heating (industrial use, building heat) instead of expanding fully through the turbine
Inputs: extraction pressure, fraction extracted
Two useful outputs: W_net (electricity) and Q_process (heat delivered to the process)
Utilization factor: ε = (W_net + Q_process) / Q_boiler

CYCLE 7: Vapor-Compression Refrigeration Cycle (Ch. 11)

Working fluid: R-134a (or R-410a, togglable)
Four components: compressor, condenser, expansion valve (throttle), evaporator
Four processes: (1→2) isentropic compression (superheated vapor), (2→3) constant-pressure heat rejection in condenser (→saturated/subcooled liquid), (3→4) throttling (isenthalpic, h₃=h₄, irreversible, entropy increases), (4→1) constant-pressure heat absorption in evaporator (→saturated vapor)
Inputs: evaporator temperature T_evap (°C), condenser temperature T_cond (°C)
COP_refrigerator = Q_L / W_compressor = (h₁−h₄) / (h₂−h₁)
COP_heat_pump = Q_H / W_compressor = (h₂−h₃) / (h₂−h₁)
Show on T-s and P-h (log P vs h) diagrams with saturation dome for the refrigerant

CYCLE 8: Ammonia Absorption Refrigeration Cycle (Ch. 11)

Replaces the compressor with a generator-absorber-pump system using heat input (e.g., natural gas flame) instead of work input
Components: generator (heat in drives NH₃ out of solution), condenser, expansion valve, evaporator, absorber (NH₃ re-dissolves into water), pump (liquid pumping, very low work)
Primarily a schematic/conceptual visualization since the cycle is complex — show the flow diagram with Q and W arrows rather than full thermodynamic state calculations

CYCLE 9: Brayton Cycle — Basic Gas Turbine (Ch. 12)

Working fluid: air (ideal gas, k=1.4, cp=1.005 kJ/kg·K)
Four processes: (1→2) isentropic compression in compressor, (2→3) constant-pressure heat addition in combustion chamber, (3→4) isentropic expansion in turbine, (4→1) constant-pressure heat rejection (exhaust)
Inputs: compressor inlet T₁ (K) and P₁ (kPa), pressure ratio r_p = P₂/P₁, turbine inlet temperature T₃ (K)
Relations: T₂/T₁ = r_p^((k−1)/k), T₄/T₃ = (1/r_p)^((k−1)/k)
Efficiency: η = 1 − 1/r_p^((k−1)/k)
Back-work ratio: BWR = W_compressor / W_turbine = (h₂−h₁)/(h₃−h₄)
Show on both P-v and T-s

CYCLE 10: Brayton Cycle with Regenerator (Ch. 12)

Same as basic Brayton but exhaust heat from turbine (state 4) preheats compressed air (state 2) before it enters the combustion chamber
Adds a regenerator/heat exchanger between compressor outlet and combustion chamber inlet
New state points: 2→x (compressed air heated in regenerator), 4→y (exhaust cooled in regenerator)
Regenerator effectiveness: ε = (T_x − T₂) / (T₄ − T₂)
Input: regenerator effectiveness (0 to 1 slider)
Efficiency increases especially at low pressure ratios

CYCLE 11: Jet Propulsion Cycle (Ch. 12)

Open Brayton cycle with a nozzle replacing the power turbine output
Components: diffuser (ram compression), compressor, combustion chamber, turbine (drives compressor only), nozzle (accelerates exhaust to high velocity)
Five state points: (a) ambient air, (1) after diffuser, (2) after compressor, (3) after combustion, (4) after turbine, (5) nozzle exit
Output is thrust, not shaft work: thrust = ṁ(V_exit − V_inlet)
Inputs: flight velocity V_0, altitude (ambient P and T), pressure ratio, T₃
Show on T-s diagram; P-v is less useful here

CYCLE 12: Otto Cycle — Spark Ignition Engine (Ch. 12)

Working fluid: air (ideal gas, cold-air-standard assumptions)
Four processes: (1→2) isentropic compression, (2→3) constant-volume heat addition (spark combustion), (3→4) isentropic expansion (power stroke), (4→1) constant-volume heat rejection (exhaust)
Inputs: compression ratio r = V₁/V₂, T₁ (K), P₁ (kPa), Q_in (kJ/kg) or T₃
Relations: T₂ = T₁·r^(k−1), T₃ from Q_in = cv(T₃−T₂), T₄ = T₃/r^(k−1)
Efficiency: η = 1 − 1/r^(k−1) (depends only on compression ratio for cold-air-standard)
Show on both P-v and T-s

CYCLE 13: Diesel Cycle — Compression Ignition Engine (Ch. 12)

Same as Otto but heat addition is at constant pressure instead of constant volume
Four processes: (1→2) isentropic compression, (2→3) constant-pressure heat addition (fuel injection), (3→4) isentropic expansion, (4→1) constant-volume heat rejection
Additional parameter: cutoff ratio r_c = V₃/V₂
Inputs: compression ratio r, cutoff ratio r_c (or Q_in), T₁, P₁
Efficiency: η = 1 − (1/r^(k−1)) · [(r_c^k − 1) / (k(r_c − 1))]
Show on both P-v and T-s. Compare against Otto at same compression ratio.

CYCLE 14: Stirling Cycle (Ch. 12)

Four processes: (1→2) isothermal compression at T_L, (2→3) constant-volume heat addition, (3→4) isothermal expansion at T_H, (4→1) constant-volume heat rejection
With perfect regeneration, efficiency equals Carnot: η = 1 − T_L/T_H
Inputs: T_H, T_L, V_min, V_max
Show on both P-v and T-s

CYCLE 15: Atkinson Cycle (Ch. 12)

Used in hybrid vehicles (Toyota Prius)
Like Otto but expansion ratio > compression ratio (longer power stroke)
Four processes: (1→2) isentropic compression with compression ratio r, (2→3) constant-volume heat addition, (3→4) isentropic expansion with expansion ratio r_e > r, (4→1) constant-pressure heat rejection
Inputs: compression ratio r, expansion ratio r_e, T₁, Q_in
Higher efficiency than Otto at same peak conditions because more work is extracted

CYCLE 16: Miller Cycle (Ch. 12)

Related to Atkinson but achieves the different compression/expansion ratio through early or late intake valve closing
Effectively reduces the compression stroke while keeping full expansion
Model similarly to Atkinson but with an additional intake process
Inputs: effective compression ratio, expansion ratio, T₁, Q_in

CYCLE 17: Air-Standard Refrigeration Cycle (Ch. 12)

Reversed Brayton cycle using air as working fluid
Four processes: (1→2) isentropic compression, (2→3) constant-pressure heat rejection, (3→4) isentropic expansion, (4→1) constant-pressure heat absorption (cold space)
COP = Q_L / W_net = (h₁−h₄) / [(h₂−h₁)−(h₃−h₄)]
Inputs: pressure ratio, T₁ (cold space), T₃ (warm environment)
Show on both P-v and T-s

CYCLE 18: Combined Brayton-Rankine Cycle (Ch. 12)

Gas turbine (Brayton, topping cycle) exhaust heat feeds the steam power plant (Rankine, bottoming cycle)
This is the modern combined-cycle power plant with 55–62% efficiency
The Q_L from the Brayton cycle equals the Q_H for the Rankine cycle
Overall efficiency: η_combined = 1 − (1−η_Brayton)(1−η_Rankine)
Show both cycles on the same T-s diagram, one stacked above the other
Inputs: all Brayton inputs plus all Rankine inputs, linked by the heat recovery steam generator (HRSG) temperature


FEATURE 2: ENERGY FLOW SCHEMATICS (Animated Arrow Diagrams)
For every cycle in Feature 1, render an interactive schematic of the physical plant as SVG. This is a separate view that sits alongside (desktop) or below (mobile) the P-v/T-s diagrams.
2A. Component Icons
Draw clean SVG icons for each component, connected by flow lines:

Turbine (trapezoid expanding shape)
Compressor (trapezoid compressing shape)
Pump (circle with triangle)
Boiler / Steam Generator (rectangle with flame symbol)
Condenser (rectangle with cooling waves)
Combustion Chamber (rectangle with flame)
Heat Exchanger / Regenerator (rectangle with counter-flow arrows)
Expansion Valve / Throttle (X symbol or bowtie)
Nozzle (converging shape)
Diffuser (diverging shape)
Feedwater Heater (circle or rectangle)
Evaporator (rectangle with frost symbol)

2B. Animated Arrows
Four types of arrows, each animated and scaled proportionally to their magnitude:

Red arrows = Heat transfer IN (Q_H, Q_boiler, Q_combustion). Arrow thickness proportional to kJ/kg value. Points into the component.
Blue arrows = Heat transfer OUT (Q_L, Q_condenser, Q_exhaust). Arrow thickness proportional to kJ/kg value. Points away from the component.
Green arrows = Work OUT (W_turbine, W_net). Points away from the component.
Orange arrows = Work IN (W_pump, W_compressor). Points into the component.

Each arrow has a numeric label showing the value in kJ/kg (or kW if the student enters a mass flow rate ṁ in kg/s). Labels update in real time as sliders change.
2C. Working Fluid Flow Line
A continuous flow path connecting all components in cycle order. The line color shifts from cool blue (low temperature states) to hot red (high temperature states) using a gradient that maps to the actual temperature at each point.
Small animated dots or dashes travel along the flow line to show direction of flow.
2D. Click-to-Zoom Component Detail
Clicking any component icon opens a detail panel showing:

Inlet state (T, P, h, s) and outlet state
First-law energy balance: e.g., for turbine: w_turbine = h_in − h_out; for boiler: q_boiler = h_out − h_in
Isentropic efficiency slider (when "Ideal vs. Real" toggle is on)
The corresponding process path highlighted on the T-s diagram

2E. Specific Schematics Per Cycle
Rankine: Pump → Boiler → Turbine → Condenser. Red Q_H into boiler, blue Q_L out of condenser, green W out of turbine, orange W into pump. Reheat variant adds second turbine stage and return line. Regenerative variant adds FWH with bleed line.
Brayton: Compressor → Combustion Chamber → Turbine → (Exhaust or Regenerator). Orange W into compressor, red Q_H into combustion chamber, green W out of turbine, blue Q_L leaving as exhaust. Show back-work ratio as a percentage on the shaft connecting compressor and turbine. With regenerator, show the heat exchanger between exhaust and compressed air with a dashed Q_regen arrow.
Otto/Diesel: Piston-cylinder schematic with four snapshots for each process. Animate piston position. Red Q_in arrow during heat addition, blue Q_out during heat rejection, green W_net from crankshaft.
Vapor-Compression Refrigeration: Compressor → Condenser → Expansion Valve → Evaporator. Orange W into compressor, blue Q_H out of condenser (to warm environment), red Q_L into evaporator (from cold space). COP displayed prominently.
Combined Brayton-Rankine: Two nested schematics. The blue Q_L exhaust arrow from the Brayton turbine feeds directly into the Rankine boiler as a red Q_H arrow. This visually shows energy cascading from one cycle to the next.
Jet Propulsion: Diffuser → Compressor → Combustor → Turbine → Nozzle. Instead of W_net, show a thrust arrow leaving the nozzle with velocity and thrust values.
2F. Sankey Diagram Mode (Alternative View)
For any cycle, offer a Sankey diagram — the classic "river of energy" visualization:

A wide band of Q_H energy enters from the left
It splits: a portion flows down as W_net (useful work output) and the rest exits as Q_L (waste heat)
Each component's contribution to work or loss is shown as thinning/splitting branches
Band widths are exactly proportional to energy magnitudes
Makes abstract efficiency numbers visceral — students see that e.g. 60% of energy is wasted in a basic Rankine cycle


FEATURE 3: THERMODYNAMIC TABLE LOOKUP
3A. Supported Substances and Table Types
Substances:

Water (H₂O) — most complete: saturated by temperature, saturated by pressure, superheated vapor, compressed liquid
R-134a — saturated by temperature, superheated vapor
R-410a — saturated by temperature, superheated vapor
Ammonia (NH₃) — saturated by temperature, superheated vapor
Carbon Dioxide (CO₂) — saturated by temperature, superheated vapor
Nitrogen (N₂) — saturated by temperature, superheated vapor
Methane (CH₄) — saturated by temperature, superheated vapor
Air and ideal gases (from ideal gas relations: Pv=RT, with cp, cv, k, R per substance)

Table types (matching Borgnakke & Sonntag Appendix B structure):

B.x.1: Saturated liquid-vapor, temperature entry → P_sat, v_f, v_fg, v_g, u_f, u_fg, u_g, h_f, h_fg, h_g, s_f, s_fg, s_g
B.x.2: Saturated liquid-vapor, pressure entry → T_sat, same properties
B.x.3: Superheated vapor → at given P and T, returns v, u, h, s
B.x.4: Compressed liquid (water only) → at given P and T, returns v, u, h, s

3B. Lookup Logic
Student picks a substance, then enters any two independent properties. The app determines the phase and returns all other properties. Logic:

Parse the two inputs (any combination of T, P, v, u, h, s, x)
If T and P are both given, check if they correspond to saturation conditions. If T = T_sat(P) within tolerance, warn that T and P are not independent in the two-phase region and request a third property (x, v, h, or s)
Determine phase:

If v_f ≤ v ≤ v_g at the given T or P → two-phase mixture, compute quality x = (v − v_f)/v_fg
If v < v_f → compressed liquid
If v > v_g → superheated vapor
Same logic applies using h or s instead of v


Compute all remaining properties using quality relations in the two-phase region: (property) = (property)_f + x·(property)_fg

3C. Automatic Interpolation with Shown Work
When the input falls between table entries, perform linear interpolation and show the formula step-by-step. Example for P = 450 kPa (between 400 and 500 kPa):
T_sat = 143.63 + (147.93 − 143.63) × (450 − 400)/(500 − 400) = 145.78 °C
This teaches the interpolation technique while giving the answer. Toggle to hide/show the interpolation steps.
3D. Data Source
Do NOT extract values from the textbook PDF. Instead use:

IAPWS-IF97 formulations for water (the same equations the printed steam tables were generated from)
Standard thermodynamic correlations for refrigerants (Helmholtz free energy equations or simplified polynomial fits matching NIST data)
Ideal gas relations for air and other gases: Pv = RT, Δh = cp·ΔT, Δs = cp·ln(T₂/T₁) − R·ln(P₂/P₁)
Hardcode the key constants: for water, T_critical = 374.14°C, P_critical = 22,089 kPa, R = 0.4615 kJ/kg·K; for air, R = 0.287 kJ/kg·K, cp = 1.005 kJ/kg·K, cv = 0.718 kJ/kg·K, k = 1.4

These will produce values that match the textbook tables to within interpolation accuracy.

FEATURE 4: INTERACTIVE SATURATION DOME WITH DRAGGABLE POINT
4A. The Dome Diagram
Draw the saturation dome for water on a T-v diagram (with toggle for T-s, P-v, and P-h views). The dome is generated from v_f(T) and v_g(T) data points from the triple point (0.01°C) to the critical point (374.14°C). Use a logarithmic x-axis for v since v_f ≈ 0.001 m³/kg and v_g ranges from 0.003 to 200+ m³/kg.
Draw constant-quality lines inside the dome: x = 0.1, 0.2, 0.3, ... 0.9, evenly spaced between v_f and v_g at each temperature.
Optionally overlay constant-pressure lines (horizontal inside the dome since T_sat is constant at a given P, but curving upward in the superheated region) and constant-entropy lines (isentropes).
4B. Draggable Point Behavior
A circular handle the student can grab (mouse drag or touch drag) and move across the diagram.
Horizontal drag at constant T (inside the dome):

Quality x changes continuously from 0 (saturated liquid line, left) to 1 (saturated vapor line, right)
Specific volume v = v_f + x·v_fg
All properties (P, v, u, h, s) update live in a readout panel
The point snaps to x=0 and x=1 at the dome edges

Vertical drag at constant v:

Temperature and pressure change (T and P are coupled in the two-phase region)
If the point exits the dome at the top → enters superheated vapor region. Readout switches from quality to "degree of superheat = T − T_sat"
If the point goes left of the dome → compressed liquid region. Readout shows "subcooling = T_sat − T"
Phase label updates dynamically: "Compressed Liquid" → "Saturated Mixture (x = 0.43)" → "Superheated Vapor"

Above the critical point:

No dome boundary. Smooth transition. Label shows "Supercritical Fluid"

4C. T-s Version
Same draggable behavior but on T-s coordinates. Especially useful because:

Horizontal drag at constant T still changes quality
Vertical drag at constant s traces an isentropic process — literally dragging along a turbine expansion or pump compression path
Connects directly to the cycle diagrams: "the turbine process on a Rankine cycle is this vertical path"

4D. Connection to Table Lookup
When the point is at any position, the bottom panel shows which table entry the properties came from and the interpolation math (same as Feature 3C). This ties the visual dome and the numeric tables together.

FEATURE 5: PARTICLE ANIMATION (Molecular Visualization)
5A. Concept
A canvas-based animation that sits beside the saturation dome (Feature 4), showing a "microscopic view" of what the molecules are doing at the current state point. This makes abstract thermodynamic states tangible.
5B. Particle Behavior by Phase
Compressed Liquid (x = 0, left of dome):

All particles are blue
Tightly packed, nearly touching
Very slow jiggling movement (Brownian-like)
Container appears "full" — no empty space
Subtle "pressure" visual: walls slightly emphasized

Two-Phase Mixture (0 < x < 1, inside dome):

Blue liquid particles pool at the bottom, red/orange vapor particles bounce above
A purple wavy line represents the liquid surface boundary, gently undulating
Liquid level corresponds to (1−x): at x=0.5, liquid fills ~50% of the container height
Vapor particles move faster than liquid particles
Occasional bubble animation: a blue particle near the surface "escapes" and turns red (evaporation)
Occasional droplet: a red particle near the surface "falls" and turns blue (condensation)

Saturated Vapor (x = 1):

All particles are red/orange
Spread out, fast movement in all directions
No liquid pool, no surface line
Moderate energy

Superheated Vapor (right of dome):

All particles are bright red with glowing halos/trails
Very fast, violent movement
Particles spread further apart (lower density at higher superheat)
Glow intensity increases with degree of superheat
Trail length increases with temperature

Near Critical Point:

Particles flicker between blue and red colors
The liquid surface line becomes chaotic and breaks apart
Density of liquid and vapor regions converge
Visually communicates: "you can't tell liquid from vapor anymore"

5C. Temperature Effects
At any given quality, increasing temperature makes:

All particles move faster (higher kinetic energy)
Vapor particles glow more intensely (shift from orange toward bright red)
Liquid particles jiggle more
The surface line becomes more turbulent

5D. Integration
This animation updates live as the student:

Drags the point on the dome (Feature 4)
Changes sliders on any cycle (Feature 1) — e.g., clicking a state point on the Rankine cycle shows the molecular view at that state


FEATURE 6: CYCLE COMPARISON MODE
Allow overlaying two cycles on the same T-s diagram. Use cases:

Rankine vs. Reheat Rankine (at same pressures)
Otto vs. Diesel (at same compression ratio and heat input)
Brayton vs. Brayton with Regenerator
Any cycle vs. equivalent Carnot cycle

Render the first cycle in solid lines and the second in dashed lines with a different color. Show both efficiency values side by side.

FEATURE 7: IDEAL VS. REAL TOGGLE
Add an "Ideal → Real" toggle that introduces isentropic efficiencies for turbines, compressors, and pumps.
When enabled, add sliders for:

η_turbine (isentropic efficiency of turbine, 0.7–1.0)
η_compressor (isentropic efficiency of compressor, 0.7–1.0)
η_pump (isentropic efficiency of pump, 0.7–1.0)

Real state calculation: h₂_actual = h₁ + (h₂s − h₁)/η_compressor for a compressor, h₄_actual = h₃ − η_turbine·(h₃ − h₄s) for a turbine, where h₂s and h₄s are the isentropic exit enthalpies.
On the T-s diagram, the real processes visually deviate from vertical isentropic lines (they lean to the right since entropy increases in irreversible processes). This ties directly to Ch. 9 (second-law analysis for control volumes) and Ch. 11.6 (deviation of actual cycles from ideal).

FEATURE 8: EXERGY DESTRUCTION TRACKER
For any cycle, show the exergy (available work) destroyed at each component due to irreversibilities. Based on Ch. 10 (Irreversibility and Availability).
For each component: I = T₀ · S_gen, where T₀ is the dead state (ambient) temperature and S_gen is the entropy generated in that component.
Display as a bar chart next to the schematic, showing which component wastes the most potential work. Typical finding: the boiler (combustion) is the largest source of irreversibility in a Rankine cycle, the combustion chamber in a Brayton cycle.
Input: dead state temperature T₀ (K), defaults to 298.15 K (25°C)

FEATURE 9: QUIZ MODE
A study mode where the app generates questions and checks answers:
Type A — Identify the Cycle: Show an unlabeled P-v or T-s diagram. Student selects from multiple choice which cycle it is.
Type B — Predict the Effect: "If we increase the boiler pressure in a Rankine cycle, what happens to thermal efficiency?" Student answers increase/decrease/no change.
Type C — Calculate a Property: Given two properties, compute a third (uses the table lookup engine). Timed, with difficulty levels.
Type D — Find the Error: Show a cycle diagram with one process drawn incorrectly (e.g., an isentropic process that goes the wrong way on T-s). Student identifies the error.

MOBILE BROWSER COMPATIBILITY
Layout Strategy
Responsive design with breakpoints:

Desktop (>768px): side-by-side layout — diagrams left, controls right, data table below
Mobile (<768px): everything stacks vertically in this order:

Cycle selector dropdown (always at top)
P-v and T-s diagrams (full width, stacked vertically, pinch-to-zoom enabled)
Energy flow schematic (simplified vertical layout on mobile)
Sliders and controls (full width)
State-point table (horizontally scrollable)
Performance metrics as a sticky footer bar (η, COP, W_net always visible)



Touch Interaction

All sliders: custom-styled with 44×44px minimum thumb size, plus +/− step buttons on each side for precision
State points on diagrams: tap to show property card overlay, tap elsewhere to dismiss (replaces desktop hover tooltips)
Diagrams: pinch-to-zoom and pan support
Draggable dome point: works with touch drag, large hit area (20px radius minimum)

Orientation

Landscape on phone triggers side-by-side P-v | T-s layout
Optional "rotate phone" hint icon near diagrams in portrait mode

Mobile-Specific Simplifications

Energy flow schematic switches to vertical flow (top-to-bottom) instead of horizontal on screens <500px wide
Sankey diagram preferred over full schematic on very small screens (it's naturally narrow/vertical)
Bottom tab bar with 4 tabs: Diagrams | Schematic | Data | Quiz (prevents excessive scrolling)

Performance

All calculations are pure client-side math, zero API latency
SVG-based diagrams for resolution independence and CSS media query compatibility
Target total bundle size <200KB gzipped
Works fully offline once loaded — no server dependencies
Consider PWA manifest for "Add to Home Screen" behavior


SUGGESTED BUILD PHASES
## SUGGESTED BUILD PHASES

### Phase 1: Foundation (Features 3, 4, 5)
- Interactive Saturation Dome (Feature 4)
- Particle Animation (Feature 5)
- Table Lookup engine (Feature 3)
- Notes: Foundation — validates the property calculation engine that everything depends on. Professor specifically requested the draggable dome.

### Phase 2: Ideal Gas Cycles (Features 1 & 2, partial)
- Carnot Cycle
- Polytropic Process Sandbox
- Otto Cycle
- Diesel Cycle
- Brayton Cycle (basic)
- Notes: These all use ideal gas relations only (no steam tables), so they're self-contained. Includes energy flow schematics for each.

### Phase 3: Phase-Change Cycles (Features 1 & 2, continued)
- Rankine Cycle (basic)
- Reheat Rankine Cycle
- Regenerative Rankine Cycle
- Vapor-Compression Refrigeration Cycle
- Notes: Requires the steam/refrigerant property engine from Phase 1. Includes energy flow schematics.

### Phase 4: Remaining Cycles (Features 1 & 2, completed)
- Stirling Cycle
- Atkinson Cycle
- Miller Cycle
- Jet Propulsion Cycle
- Air-Standard Refrigeration Cycle
- Cogeneration Cycle
- Absorption Refrigeration Cycle
- Combined Brayton-Rankine Cycle
- Notes: Builds on Phases 2 and 3.

### Phase 5: Enhancements (Features 6, 7, 8, 2F)
- Cycle Comparison Mode (Feature 6)
- Ideal vs. Real Toggle (Feature 7)
- Exergy Destruction Tracker (Feature 8)
- Sankey Diagrams (Feature 2F)
- Notes: Enhancement layer that adds analytical depth.

### Phase 6: Polish (Feature 9)
- Quiz Mode (Feature 9)
- Final mobile polish
- PWA manifest for "Add to Home Screen"
- Notes: Polish and pedagogy layer.

KEY THERMODYNAMIC RELATIONS REFERENCE
For the builder's reference — these are the core equations used across all features:
Ideal gas: Pv = RT, du = cv·dT, dh = cp·dT, cp − cv = R, k = cp/cv
Isentropic ideal gas: T₂/T₁ = (P₂/P₁)^((k−1)/k) = (v₁/v₂)^(k−1), Pv^k = constant
Polytropic ideal gas: Pv^n = constant, w = R(T₂−T₁)/(1−n) for n≠1, w = RT·ln(v₂/v₁) for n=1
Two-phase mixtures: (any property) = (property)_f + x·(property)_fg, where x = quality = m_vapor/m_total
Carnot efficiency: η = 1 − T_L/T_H (temperatures in Kelvin)
COP refrigerator: β = Q_L/W = T_L/(T_H − T_L) for Carnot
COP heat pump: β' = Q_H/W = T_H/(T_H − T_L) for Carnot
Gibbs equations: Tds = du + Pdv, Tds = dh − vdP
Entropy change, ideal gas: Δs = cv·ln(T₂/T₁) + R·ln(v₂/v₁) = cp·ln(T₂/T₁) − R·ln(P₂/P₁)
Steady-state energy balance (per unit mass): q − w = Δh + ΔKE + ΔPE (simplified: q − w = h_out − h_in for negligible KE and PE)
Entropy balance: S_gen = Δs_system − Q/T_boundary ≥ 0
Exergy destruction: I = T₀ · S_gen

END OF PLAN