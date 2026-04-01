/**
 * Linear interpolation utilities with "show work" capability.
 * Used throughout the property engine to interpolate between table entries.
 */

/**
 * Linear interpolation between two points.
 * @param {number} x - Input value
 * @param {number} x0 - Lower bound input
 * @param {number} x1 - Upper bound input
 * @param {number} y0 - Lower bound output
 * @param {number} y1 - Upper bound output
 * @returns {number} Interpolated value
 */
export function lerp(x, x0, x1, y0, y1) {
  if (x1 === x0) return y0;
  return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
}

/**
 * Linear interpolation with step-by-step work shown.
 * @param {string} outputName - Name of the property being calculated (e.g., "T_sat")
 * @param {string} outputUnit - Unit string (e.g., "°C")
 * @param {number} x - Input value
 * @param {string} xName - Name of input variable (e.g., "P")
 * @param {string} xUnit - Unit of input variable (e.g., "kPa")
 * @param {number} x0 - Lower bound input
 * @param {number} x1 - Upper bound input
 * @param {number} y0 - Lower bound output
 * @param {number} y1 - Upper bound output
 * @returns {{ value: number, steps: string }}
 */
export function lerpWithWork(outputName, outputUnit, x, xName, xUnit, x0, x1, y0, y1) {
  const value = lerp(x, x0, x1, y0, y1);
  const fraction = (x - x0) / (x1 - x0);

  const steps =
    `${outputName} = ${fmt(y0)} + (${fmt(y1)} − ${fmt(y0)}) × (${fmt(x)} − ${fmt(x0)}) / (${fmt(x1)} − ${fmt(x0)})\n` +
    `${outputName} = ${fmt(y0)} + ${fmt(y1 - y0)} × ${fmt(fraction)}\n` +
    `${outputName} = ${fmt(value)} ${outputUnit}`;

  return { value, steps };
}

/**
 * Find the bounding indices in a sorted array for a given value.
 * @param {number[]} arr - Sorted array (ascending)
 * @param {number} val - Value to find bounds for
 * @returns {{ lo: number, hi: number, exact: boolean }}
 */
export function findBounds(arr, val) {
  if (val <= arr[0]) return { lo: 0, hi: 1, exact: Math.abs(val - arr[0]) < 1e-10 };
  if (val >= arr[arr.length - 1]) return { lo: arr.length - 2, hi: arr.length - 1, exact: Math.abs(val - arr[arr.length - 1]) < 1e-10 };

  for (let i = 0; i < arr.length - 1; i++) {
    if (val >= arr[i] && val <= arr[i + 1]) {
      const exact = Math.abs(val - arr[i]) < 1e-10 || Math.abs(val - arr[i + 1]) < 1e-10;
      return { lo: i, hi: i + 1, exact };
    }
  }
  return { lo: 0, hi: 1, exact: false };
}

/**
 * Interpolate within a data table (array of objects).
 * @param {Object[]} table - Array of data rows
 * @param {string} inputKey - Key to interpolate on
 * @param {number} inputVal - Input value
 * @param {string} outputKey - Key to get output from
 * @returns {number}
 */
export function tableInterpolate(table, inputKey, inputVal, outputKey) {
  const vals = table.map(row => row[inputKey]);
  const { lo, hi } = findBounds(vals, inputVal);
  return lerp(inputVal, table[lo][inputKey], table[hi][inputKey], table[lo][outputKey], table[hi][outputKey]);
}

/**
 * Double interpolation for superheated tables (interpolate on both P and T).
 * @param {Object} superheatData - { pressures: number[], temperatures: number[], data: { [P]: { [T]: { v, h, s, u } } } }
 * @param {number} P - Pressure (kPa)
 * @param {number} T - Temperature (°C)
 * @param {string} prop - Property key (v, h, s, u)
 * @returns {number}
 */
export function doubleInterpolate(superheatData, P, T, prop) {
  const { pressures, data } = superheatData;
  const pBounds = findBounds(pressures, P);
  const P_lo = pressures[pBounds.lo];
  const P_hi = pressures[pBounds.hi];

  // Interpolate at P_lo
  const val_lo = interpolateAtPressure(data[P_lo], T, prop);
  // Interpolate at P_hi
  const val_hi = interpolateAtPressure(data[P_hi], T, prop);

  // Interpolate between pressures
  return lerp(P, P_lo, P_hi, val_lo, val_hi);
}

function interpolateAtPressure(pressureData, T, prop) {
  const temps = Object.keys(pressureData).map(Number).sort((a, b) => a - b);
  const tBounds = findBounds(temps, T);
  const T_lo = temps[tBounds.lo];
  const T_hi = temps[tBounds.hi];
  return lerp(T, T_lo, T_hi, pressureData[T_lo][prop], pressureData[T_hi][prop]);
}

function fmt(n) {
  if (Math.abs(n) < 0.001 && n !== 0) return n.toExponential(4);
  if (Math.abs(n) >= 10000) return n.toFixed(1);
  if (Math.abs(n) >= 100) return n.toFixed(2);
  if (Math.abs(n) >= 1) return n.toFixed(4);
  return n.toFixed(6);
}
