/**
 * EquationsPanel — shows fundamental thermodynamic equations for each process in the cycle.
 */

const PROCESS_EQUATIONS = {
  isentropic: {
    label: 'Isentropic (s = const)',
    equations: [
      'Δs = 0',
      'T₂/T₁ = (P₂/P₁)^{(k-1)/k}',
      'T₂/T₁ = (v₁/v₂)^{(k-1)}',
      'Pv^k = const',
      'w = h₁ − h₂',
    ],
  },
  isothermal: {
    label: 'Isothermal (T = const)',
    equations: [
      'ΔT = 0',
      'Pv = const (ideal gas)',
      'q = T·Δs',
      'w = P₁v₁·ln(v₂/v₁)',
      'w = RT·ln(v₂/v₁)',
    ],
  },
  isobaric: {
    label: 'Isobaric (P = const)',
    equations: [
      'ΔP = 0',
      'q = h₂ − h₁ = cₚ·ΔT',
      'w = P·(v₂ − v₁)',
      'Δs = cₚ·ln(T₂/T₁)',
    ],
  },
  isochoric: {
    label: 'Isochoric (v = const)',
    equations: [
      'Δv = 0, w = 0',
      'q = u₂ − u₁ = cᵥ·ΔT',
      'P₂/P₁ = T₂/T₁',
      'Δs = cᵥ·ln(T₂/T₁)',
    ],
  },
  polytropic: {
    label: 'Polytropic (Pv^n = const)',
    equations: [
      'Pv^n = const',
      'T₂/T₁ = (v₁/v₂)^{(n-1)}',
      'w = (P₂v₂ − P₁v₁)/(1 − n)',
    ],
  },
  throttling: {
    label: 'Throttling (h = const)',
    equations: [
      'h₁ = h₂',
      'Δh = 0 (isenthalpic)',
      'ΔP < 0, Δs > 0',
    ],
  },
};

const CYCLE_EQUATIONS = {
  'rankine-basic': {
    label: 'Rankine Cycle',
    equations: [
      'η_th = W_net / Q_H',
      'W_net = W_turbine − W_pump',
      'W_pump = v₁·(P₂ − P₁)',
      'η_Carnot = 1 − T_L/T_H',
    ],
  },
  'brayton-basic': {
    label: 'Brayton Cycle',
    equations: [
      'η_th = 1 − 1/r_p^{(k-1)/k}',
      'W_net = W_turbine − W_compressor',
      'BWR = W_compressor / W_turbine',
    ],
  },
  otto: {
    label: 'Otto Cycle',
    equations: [
      'η_th = 1 − 1/r^{(k-1)}',
      'W_net = Q_H − Q_L',
      'Q_H = cᵥ·(T₃ − T₂)',
    ],
  },
  diesel: {
    label: 'Diesel Cycle',
    equations: [
      'η_th = 1 − (r_c^k − 1) / [k·r^{(k-1)}·(r_c − 1)]',
      'r_c = v₃/v₂ (cutoff ratio)',
      'Q_H = cₚ·(T₃ − T₂)',
    ],
  },
  carnot: {
    label: 'Carnot Cycle',
    equations: [
      'η_Carnot = 1 − T_L/T_H',
      'Q_H/T_H = Q_L/T_L',
      'W_net = Q_H − Q_L',
    ],
  },
  stirling: {
    label: 'Stirling Cycle',
    equations: [
      'η_th = η_Carnot = 1 − T_L/T_H',
      'W_net = R·(T_H − T_L)·ln(r)',
      'Q_H = R·T_H·ln(r)',
    ],
  },
  ericsson: {
    label: 'Ericsson Cycle',
    equations: [
      'η_th = η_Carnot = 1 − T_L/T_H',
      'W_net = R·(T_H − T_L)·ln(r_p)',
    ],
  },
  'vcr-basic': {
    label: 'Vapor-Compression Refrigeration',
    equations: [
      'COP_R = Q_L / W_net',
      'COP_Carnot = T_L / (T_H − T_L)',
      'W_comp = h₂ − h₁',
    ],
  },
  'heat-pump': {
    label: 'Heat Pump',
    equations: [
      'COP_HP = Q_H / W_net',
      'COP_Carnot = T_H / (T_H − T_L)',
    ],
  },
};

export default function EquationsPanel({ cycleDef }) {
  if (!cycleDef) return null;

  const processTypes = [...new Set((cycleDef.processes || []).map(p => p.type))];
  const cycleEqs = CYCLE_EQUATIONS[cycleDef.id];

  return (
    <div className="panel equations-panel">
      <div className="panel-title">Fundamental Equations</div>

      {cycleEqs && (
        <div className="equations-section">
          <div className="equations-section-title">{cycleEqs.label}</div>
          <div className="equations-list">
            {cycleEqs.equations.map((eq, i) => (
              <div key={i} className="equation-item">{eq}</div>
            ))}
          </div>
        </div>
      )}

      {processTypes.map(pType => {
        const info = PROCESS_EQUATIONS[pType];
        if (!info) return null;
        return (
          <div key={pType} className="equations-section">
            <div className="equations-section-title">{info.label}</div>
            <div className="equations-list">
              {info.equations.map((eq, i) => (
                <div key={i} className="equation-item">{eq}</div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
