/**
 * DecorationPanel.jsx — Right panel: ammunition + theme controls.
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

export default function DecorationPanel() {
  const { ammoCount, ammoSizeMin, ammoSizeMax, ammoSpread, themeKey, set } = useStore();

  return (
    <div className="flex flex-col h-full overflow-y-auto px-3 py-3"
         style={{ fontFamily: "'Rajdhani',sans-serif" }}>

      <h2 style={{
        fontFamily: 'Orbitron,monospace', color: '#00c8ff', fontSize: '.78rem',
        letterSpacing: '.1em', marginBottom: '10px', textTransform: 'uppercase',
      }}>
        Ammunition
      </h2>

      <Slider label="Ammo Count" min={500} max={8000} step={100}
              value={ammoCount} display={ammoCount.toLocaleString()}
              onChange={(v) => set({ ammoCount: v })} />

      <Slider label="Min Size" min={0.2} max={1.0} step={0.05}
              value={ammoSizeMin} display={ammoSizeMin.toFixed(2)}
              onChange={(v) => set({ ammoSizeMin: v })} />

      <Slider label="Max Size" min={0.5} max={2.0} step={0.05}
              value={ammoSizeMax} display={ammoSizeMax.toFixed(2)}
              onChange={(v) => set({ ammoSizeMax: v })} />

      <Slider label="Angle Spread" min={5} max={60}
              value={ammoSpread} display={`${ammoSpread}\u00B0`}
              onChange={(v) => set({ ammoSpread: v })} />

      {/* Theme */}
      <div className="mb-2 p-2 rounded-lg"
           style={{ background: 'rgba(0,0,0,.3)', border: '1px solid rgba(0,180,255,.07)' }}>
        <div className="mb-1" style={{ color: '#00c8ff', fontSize: '.74rem', fontWeight: 600 }}>
          Color Theme
        </div>
        <select value={themeKey} onChange={(e) => set({ themeKey: e.target.value })}>
          <option value="brass">Brass</option>
          <option value="pink">Pink</option>
          <option value="urchin">Sea Urchin Purple</option>
          <option value="biolum">Bioluminescent</option>
          <option value="coral">Deep Coral</option>
          <option value="abyss">Midnight Abyss</option>
        </select>
      </div>

      {/* Stats */}
      <div className="mt-3 p-3 rounded-lg"
           style={{ background: 'rgba(0,0,0,.2)', border: '1px solid rgba(0,180,255,.07)' }}>
        <div style={{ color: '#00c8ff', fontSize: '.72rem', fontWeight: 600, marginBottom: 4 }}>
          Print Estimates
        </div>
        <div style={{ color: 'rgba(130,190,255,.6)', fontSize: '.7rem', lineHeight: 1.6 }}>
          <div>Pieces: {ammoCount.toLocaleString()}</div>
          <div>Batches (24/batch): {Math.ceil(ammoCount / 24)}</div>
          <div>Est. print time: {(Math.ceil(ammoCount / 24) * 0.65).toFixed(0)}h</div>
          <div>Est. material: ${(ammoCount * 0.055).toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
}
