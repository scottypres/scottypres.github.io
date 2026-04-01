/**
 * CycleMetrics — displays computed performance metrics and state-point table.
 *
 * Props:
 *  - states: array of state objects (§ 7 format)
 *  - metrics: { eta_thermal, eta_carnot, W_net, Q_H, Q_L, COP, BWR, ... }
 *  - cycleDef: cycle definition (for knowing which metrics to show)
 */
export default function CycleMetrics({ states = [], metrics = {}, cycleDef }) {
  const showCOP = cycleDef?.metrics?.includes('COP');
  const showBWR = cycleDef?.metrics?.includes('BWR');

  return (
    <div className="cycle-metrics">
      {/* Performance metrics cards */}
      <div className="panel metrics-panel">
        <div className="panel-title">Performance</div>
        <div className="metrics-grid">
          {showCOP ? (
            <MetricCard label="COP" value={metrics.COP} fmt={v => v.toFixed(3)} />
          ) : (
            <MetricCard label="η_thermal" value={metrics.eta_thermal} fmt={v => `${(v * 100).toFixed(2)}%`} />
          )}
          <MetricCard label="η_Carnot" value={metrics.eta_carnot} fmt={v => `${(v * 100).toFixed(2)}%`} />
          <MetricCard label="W_net" value={metrics.W_net} unit="kJ/kg" />
          <MetricCard label="Q_H" value={metrics.Q_H} unit="kJ/kg" />
          <MetricCard label="Q_L" value={metrics.Q_L} unit="kJ/kg" />
          {metrics.W_turbine != null && (
            <MetricCard label="W_turbine" value={metrics.W_turbine} unit="kJ/kg" />
          )}
          {metrics.W_compressor != null && (
            <MetricCard label="W_comp" value={metrics.W_compressor} unit="kJ/kg" />
          )}
          {metrics.W_pump != null && (
            <MetricCard label="W_pump" value={metrics.W_pump} unit="kJ/kg" />
          )}
          {showBWR && metrics.BWR != null && (
            <MetricCard label="BWR" value={metrics.BWR} fmt={v => `${(v * 100).toFixed(1)}%`} />
          )}
        </div>
      </div>

      {/* State-point table */}
      {states.length > 0 && (
        <div className="panel state-table-panel">
          <div className="panel-title">State Points</div>
          <div className="state-table-scroll">
            <table className="state-table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>T (K)</th>
                  <th>P (kPa)</th>
                  <th>v (m³/kg)</th>
                  <th>h (kJ/kg)</th>
                  <th>s (kJ/kg·K)</th>
                  <th>u (kJ/kg)</th>
                  <th>x</th>
                </tr>
              </thead>
              <tbody>
                {states.map(s => (
                  <tr key={s.stateNum}>
                    <td className="state-num">{s.stateNum}</td>
                    <td>{fmtNum(s.T, 2)}</td>
                    <td>{fmtNum(s.P, 1)}</td>
                    <td>{fmtNum(s.v, 5)}</td>
                    <td>{fmtNum(s.h, 1)}</td>
                    <td>{fmtNum(s.s, 4)}</td>
                    <td>{fmtNum(s.u, 1)}</td>
                    <td>{s.x != null ? fmtNum(s.x, 3) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, unit, fmt }) {
  const display = value != null
    ? (fmt ? fmt(value) : `${value.toFixed(1)}${unit ? '' : ''}`)
    : '—';
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <span className="metric-value">
        {display}
        {unit && value != null && <span className="metric-unit"> {unit}</span>}
      </span>
    </div>
  );
}

function fmtNum(val, decimals) {
  if (val == null || isNaN(val)) return '—';
  return val.toFixed(decimals);
}
