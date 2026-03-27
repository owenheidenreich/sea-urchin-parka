/**
 * GarmentPanel.jsx — Left panel: parka shape controls.
 */
import { useStore } from '../store/store.js';

function Slider({ label, min, max, step, value, display, onChange }) {
  return (
    <div className="mb-2 p-2 rounded-lg"
         style={{ background: 'rgba(0,0,0,.3)', border: '1px solid rgba(0,180,255,.07)' }}>
      <div className="flex justify-between items-center mb-1"
           style={{ color: '#00c8ff', fontSize: '.74rem', fontWeight: 600, letterSpacing: '.04em' }}>
        <span>{label}</span>
        <span style={{ color: '#c8a86e', fontFamily: 'Orbitron,monospace', fontSize: '.68rem' }}>
          {display}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step || 1}
             value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export default function GarmentPanel() {
  const { hoodDepth, set } = useStore();

  return (
    <div className="flex flex-col h-full overflow-y-auto px-3 py-3"
         style={{ fontFamily: "'Rajdhani',sans-serif" }}>

      <h2 style={{
        fontFamily: 'Orbitron,monospace', color: '#00c8ff', fontSize: '.78rem',
        letterSpacing: '.1em', marginBottom: '10px', textTransform: 'uppercase',
      }}>
        Garment Shape
      </h2>

      <Slider label="Hood Depth" min={8} max={20} value={hoodDepth}
              display={`${hoodDepth}`} onChange={(v) => set({ hoodDepth: v })} />

      <div className="mt-4 p-3 rounded-lg"
           style={{ background: 'rgba(0,0,0,.2)', border: '1px solid rgba(0,180,255,.07)' }}>
        <div style={{ color: 'rgba(130,190,255,.5)', fontSize: '.7rem', lineHeight: 1.5 }}>
          Parka body uses LatheGeometry for smooth, realistic torso shape.
          Hood is constructed from two swept panels meeting at a center seam,
          mimicking real hoodie construction.
        </div>
      </div>
    </div>
  );
}
