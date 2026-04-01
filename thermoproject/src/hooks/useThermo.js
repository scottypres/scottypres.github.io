import { useState, useCallback } from 'react';
import { lookupProperties } from '../engine/phaseDetermination';

export function useThermo(initialSubstance = 'water') {
  const [substance, setSubstance] = useState(initialSubstance);
  const [thermoState, setThermoState] = useState(null);
  const [error, setError] = useState(null);

  const calculate = useCallback(
    (prop1Name, prop1Val, prop2Name, prop2Val) => {
      setError(null);
      try {
        const result = lookupProperties(substance, prop1Name, prop1Val, prop2Name, prop2Val);
        setThermoState({
          T: result.T,
          P: result.P,
          v: result.v,
          x: result.x,
          phase: result.phase,
          h: result.h,
          s: result.s,
          u: result.u,
          steps: result.steps || null,
        });
        return result;
      } catch (err) {
        setError(err.message || 'Calculation failed.');
        setThermoState(null);
        return null;
      }
    },
    [substance],
  );

  return { substance, setSubstance, thermoState, error, calculate };
}
