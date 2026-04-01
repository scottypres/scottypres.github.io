import { useState, useCallback, useEffect } from 'react';
import {
  getStateFromTv,
  getStateFromTs,
  getStateFromPv,
  getStateFromPh,
} from '../../engine/water.js';

/**
 * Convert a mouse/touch event to SVG-coordinate space.
 */
function clientToSvg(svgEl, clientX, clientY) {
  const pt = svgEl.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svgEl.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const svgPt = pt.matrixTransform(ctm.inverse());
  return { x: svgPt.x, y: svgPt.y };
}

/**
 * Map raw axis values (possibly log-scaled) back to physical thermo values
 * and compute a full thermodynamic state.
 */
function resolveState(rawX, rawY, viewType) {
  switch (viewType) {
    case 'Tv': {
      const T = Math.max(0.01, Math.min(600, rawY));
      const v = Math.pow(10, rawX);
      return getStateFromTv(T, v);
    }
    case 'Ts': {
      const T = Math.max(0.01, Math.min(600, rawY));
      const s = Math.max(0, rawX);
      return getStateFromTs(T, s);
    }
    case 'Pv': {
      const P = Math.pow(10, rawY);
      const v = Math.pow(10, rawX);
      return getStateFromPv(P, v);
    }
    case 'Ph': {
      const P = Math.pow(10, rawY);
      const h = Math.max(0, rawX);
      return getStateFromPh(P, h);
    }
    default:
      return null;
  }
}

/**
 * Get the SVG-space position of the current thermo state for the active view.
 */
function stateToSvgPos(state, viewType, toSvgX, toSvgY) {
  let rawX, rawY;
  switch (viewType) {
    case 'Tv':
      rawX = Math.log10(Math.max(state.v, 1e-6));
      rawY = state.T;
      break;
    case 'Ts':
      rawX = state.s;
      rawY = state.T;
      break;
    case 'Pv':
      rawX = Math.log10(Math.max(state.v, 1e-6));
      rawY = Math.log10(Math.max(state.P, 0.01));
      break;
    case 'Ph':
      rawX = state.h;
      rawY = Math.log10(Math.max(state.P, 0.01));
      break;
    default:
      rawX = 0;
      rawY = 0;
  }
  return { cx: toSvgX(rawX), cy: toSvgY(rawY) };
}

/**
 * Given a constraint type ('fixT', 'fixP', 'fixV', 'fixS') and the current view,
 * determine which axis to lock. Returns 'lockX', 'lockY', or null.
 *
 * The view axes are:
 *   Tv: X=v, Y=T    Ts: X=s, Y=T    Pv: X=v, Y=P    Ph: X=h, Y=P
 */
function getAxisLock(constraint, viewType) {
  if (!constraint || constraint === 'none') return null;

  const axisMap = {
    Tv: { fixT: 'lockY', fixV: 'lockX' },
    Ts: { fixT: 'lockY', fixS: 'lockX' },
    Pv: { fixP: 'lockY', fixV: 'lockX' },
    Ph: { fixP: 'lockY' },
  };

  return axisMap[viewType]?.[constraint] || null;
}

export default function DraggablePoint({
  svgRef,
  viewType,
  thermoState,
  onStateChange,
  toSvgX,
  toSvgY,
  fromSvgX,
  fromSvgY,
  constraint = 'none',
}) {
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      if (!dragging) return;
      const svgEl = svgRef.current;
      if (!svgEl) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const { x, y } = clientToSvg(svgEl, clientX, clientY);

      let rawX = fromSvgX(x);
      let rawY = fromSvgY(y);

      // Apply constraint: lock one axis to the current state value
      const lock = getAxisLock(constraint, viewType);
      if (lock === 'lockX') {
        // Keep X at current state position
        const curPos = stateToSvgPos(thermoState, viewType, toSvgX, toSvgY);
        rawX = fromSvgX(curPos.cx);
      } else if (lock === 'lockY') {
        // Keep Y at current state position
        const curPos = stateToSvgPos(thermoState, viewType, toSvgX, toSvgY);
        rawY = fromSvgY(curPos.cy);
      }

      const newState = resolveState(rawX, rawY, viewType);
      if (newState) {
        onStateChange(newState);
      }
    },
    [dragging, svgRef, fromSvgX, fromSvgY, toSvgX, toSvgY, viewType, onStateChange, constraint, thermoState]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Attach move/up listeners to window so dragging works outside the point
  useEffect(() => {
    if (!dragging) return;

    const onMove = (e) => handlePointerMove(e);
    const onUp = () => handlePointerUp();

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging, handlePointerMove, handlePointerUp]);

  const { cx, cy } = stateToSvgPos(thermoState, viewType, toSvgX, toSvgY);

  return (
    <g style={{ cursor: dragging ? 'grabbing' : 'grab' }}>
      {/* Crosshair lines when dragging - extend locked axis line fully */}
      {dragging && (() => {
        const lock = getAxisLock(constraint, viewType);
        const vLen = lock === 'lockY' ? 600 : 30;
        const hLen = lock === 'lockX' ? 600 : 30;
        const lockColor = lock ? '#fbbf24' : '#06b6d4';
        return (
          <>
            <line x1={cx} y1={cy - vLen} x2={cx} y2={cy + vLen} stroke={lock === 'lockY' ? lockColor : '#06b6d4'} strokeWidth={lock === 'lockY' ? '1' : '0.5'} opacity="0.6" />
            <line x1={cx - hLen} y1={cy} x2={cx + hLen} y2={cy} stroke={lock === 'lockX' ? lockColor : '#06b6d4'} strokeWidth={lock === 'lockX' ? '1' : '0.5'} opacity="0.6" />
          </>
        );
      })()}

      {/* Invisible larger hit area for touch */}
      <circle
        cx={cx}
        cy={cy}
        r={30}
        fill="transparent"
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      />

      {/* Visible point with glow */}
      <circle
        cx={cx}
        cy={cy}
        r={dragging ? 20 : 18}
        fill="#06b6d4"
        fillOpacity={0.2}
        stroke="#06b6d4"
        strokeWidth="2.5"
        filter="url(#pointGlow)"
        style={{ pointerEvents: 'none', transition: dragging ? 'none' : 'cx 0.1s, cy 0.1s' }}
      />
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#06b6d4"
        style={{ pointerEvents: 'none' }}
      />
    </g>
  );
}
