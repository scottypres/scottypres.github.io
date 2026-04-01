import { useRef, useEffect } from 'react';
import { ParticleEngine } from './particleEngine';

export default function ParticleAnimation({ thermoState }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  // Create / destroy engine on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Size canvas to container
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 280;
    };
    resize();

    const engine = new ParticleEngine(canvas);
    engineRef.current = engine;
    engine.start();

    // Keep canvas sized to container
    const observer = new ResizeObserver(() => {
      resize();
      // re-init particles to fit new dimensions
      engine._createParticles(80);
    });
    observer.observe(canvas.parentElement);

    return () => {
      observer.disconnect();
      engine.stop();
      engineRef.current = null;
    };
  }, []);

  // Forward thermoState changes to the engine
  useEffect(() => {
    if (engineRef.current && thermoState) {
      engineRef.current.updateState(thermoState);
    }
  }, [thermoState]);

  return (
    <div className="panel particle-container">
      <div className="panel-title">Molecular View</div>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: 280,
          background: '#0a0f1a',
          borderRadius: 8,
          display: 'block',
        }}
      />
    </div>
  );
}
