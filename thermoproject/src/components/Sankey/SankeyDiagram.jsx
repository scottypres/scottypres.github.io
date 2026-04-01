import { useMemo } from 'react';

const WIDTH = 600;
const HEIGHT = 400;
const PAD = { top: 30, right: 40, bottom: 30, left: 40 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

/**
 * SankeyDiagram - Vertical "river of energy" visualization.
 *
 * Q_H enters from top (red), splits into W_net (green, exits left)
 * and Q_L (blue, exits bottom). Band widths proportional to energy.
 *
 * Props:
 *  - metrics: { Q_H, Q_L, W_net, W_turbine, W_pump, W_compressor, ... }
 *  - cycleDef: cycle definition for context
 */
export default function SankeyDiagram({ metrics = {}, cycleDef }) {
  const data = useMemo(() => {
    const Q_H = Math.abs(metrics.Q_H || 0);
    const Q_L = Math.abs(metrics.Q_L || 0);
    const W_net = Math.abs(metrics.W_net || 0);

    if (Q_H <= 0) return null;

    // Normalize widths to fill available space
    const maxBandW = PLOT_W * 0.6;
    const scale = maxBandW / Q_H;

    const qhWidth = Q_H * scale;
    const wnetWidth = W_net * scale;
    const qlWidth = Q_L * scale;

    // Energy balance check
    const balance = Q_H - W_net - Q_L;
    const balanceOk = Math.abs(balance) / Q_H < 0.02;

    return { Q_H, Q_L, W_net, qhWidth, wnetWidth, qlWidth, balanceOk, scale };
  }, [metrics]);

  if (!data) {
    return (
      <div className="sankey-wrapper">
        <div className="sankey-empty">No energy data available</div>
      </div>
    );
  }

  const { Q_H, Q_L, W_net, qhWidth, wnetWidth, qlWidth } = data;

  // Layout coordinates
  const centerX = PAD.left + PLOT_W / 2;

  // Q_H band enters from top center
  const qhLeft = centerX - qhWidth / 2;
  const qhRight = centerX + qhWidth / 2;
  const topY = PAD.top;

  // Split point
  const splitY = PAD.top + PLOT_H * 0.4;

  // W_net exits to the left
  const wnetExitY = splitY + 20;
  const wnetExitX = PAD.left;

  // Q_L continues down to bottom
  const qlBottomY = PAD.top + PLOT_H;
  const qlLeft = centerX - qlWidth / 2;
  const qlRight = centerX + qlWidth / 2;

  // Build the Q_H -> split path (main band from top to split)
  const mainBandPath = `
    M ${qhLeft} ${topY}
    L ${qhRight} ${topY}
    L ${qhRight} ${splitY}
    L ${qhLeft} ${splitY}
    Z
  `;

  // W_net branch: curves from right portion of split to left exit
  const wnetBranchPath = `
    M ${qhLeft} ${splitY}
    L ${qhLeft + wnetWidth} ${splitY}
    C ${qhLeft + wnetWidth} ${splitY + 40}, ${wnetExitX + wnetWidth} ${wnetExitY - 20}, ${wnetExitX + wnetWidth} ${wnetExitY}
    L ${wnetExitX + wnetWidth} ${wnetExitY + wnetWidth * 0.6}
    C ${wnetExitX + wnetWidth} ${wnetExitY + wnetWidth * 0.6 - 20}, ${qhLeft} ${splitY + 60}, ${qhLeft} ${splitY + 30}
    Z
  `;

  // Q_L branch: continues down from split
  const qlBranchPath = `
    M ${qhLeft + wnetWidth} ${splitY}
    L ${qhRight} ${splitY}
    C ${qhRight} ${splitY + 40}, ${qlRight} ${qlBottomY - 60}, ${qlRight} ${qlBottomY}
    L ${qlLeft} ${qlBottomY}
    C ${qlLeft} ${qlBottomY - 60}, ${qhLeft + wnetWidth} ${splitY + 40}, ${qhLeft + wnetWidth} ${splitY}
    Z
  `;

  const eta = Q_H > 0 ? (W_net / Q_H * 100).toFixed(1) : '0';

  return (
    <div className="sankey-wrapper">
      <svg
        className="dome-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sankeyHeat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="sankeyWork" x1="1" y1="0" x2="0" y2="0.5">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="sankeyCold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Q_H main band */}
        <path d={mainBandPath} fill="url(#sankeyHeat)" />

        {/* W_net branch */}
        <path d={wnetBranchPath} fill="url(#sankeyWork)" />

        {/* Q_L branch */}
        <path d={qlBranchPath} fill="url(#sankeyCold)" />

        {/* Labels */}
        <text x={centerX} y={topY - 6} textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="600">
          Q_H = {Q_H.toFixed(1)} kJ/kg
        </text>

        <text x={wnetExitX - 4} y={wnetExitY + wnetWidth * 0.3 + 4} textAnchor="start" fill="#22c55e" fontSize="11" fontWeight="600"
          transform={`rotate(-90, ${wnetExitX - 4}, ${wnetExitY + wnetWidth * 0.3})`}>
          W_net = {W_net.toFixed(1)}
        </text>

        <text x={centerX} y={qlBottomY + 16} textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="600">
          Q_L = {Q_L.toFixed(1)} kJ/kg
        </text>

        {/* Efficiency annotation */}
        <text x={WIDTH - PAD.right} y={PAD.top + 20} textAnchor="end" fill="#94a3b8" fontSize="10">
          {eta}% to useful work
        </text>

        {/* Flow direction arrows */}
        <polygon points={`${centerX - 4},${topY + 8} ${centerX + 4},${topY + 8} ${centerX},${topY + 16}`} fill="#ef4444" opacity="0.8" />
        <polygon points={`${centerX - 4},${qlBottomY - 16} ${centerX + 4},${qlBottomY - 16} ${centerX},${qlBottomY - 8}`} fill="#3b82f6" opacity="0.8" />
      </svg>
    </div>
  );
}
