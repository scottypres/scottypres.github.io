export default function InterpolationSteps({ steps }) {
  if (!steps) return null;

  const lines = steps.split('\n');

  return (
    <div className="interpolation-steps" style={{ marginTop: 8 }}>
      {lines.map((line, i) => (
        <div key={i}>{line || '\u00A0'}</div>
      ))}
    </div>
  );
}
