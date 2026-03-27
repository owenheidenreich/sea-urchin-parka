/**
 * DecorationPanel.jsx — Right panel: ammunition + theme controls + presets.
 */
import { useState, useEffect } from 'react';
import { useStore } from '../store/store.js';

const STORAGE_KEY = 'sup-bullet-presets';
const PRESET_FIELDS = ['ammoCount','ammoSizeMin','ammoSizeMax','ammoSpread','flatRatio','layerCount','themeKey'];

function loadPresets() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function savePresets(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

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
  const { ammoCount, ammoSizeMin, ammoSizeMax, ammoSpread, flatRatio, layerCount, themeKey, set } = useStore();
  const [presets, setPresets] = useState(loadPresets);
  const [presetName, setPresetName] = useState('');

  function handleSave() {
    const name = presetName.trim() || `Preset ${presets.length + 1}`;
    const values = {};
    PRESET_FIELDS.forEach(k => values[k] = useStore.getState()[k]);
    const updated = [...presets.filter(p => p.name !== name), { name, values }];
    savePresets(updated);
    setPresets(updated);
    setPresetName('');
  }

  function handleLoad(preset) {
    set(preset.values);
  }

  function handleDelete(name) {
    const updated = presets.filter(p => p.name !== name);
    savePresets(updated);
    setPresets(updated);
  }

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

      <Slider label="Flat vs Urchin" min={0} max={100} step={5}
              value={Math.round(flatRatio * 100)}
              display={`${Math.round(flatRatio * 100)}% flat`}
              onChange={(v) => set({ flatRatio: v / 100 })} />

      <Slider label="Layers" min={1} max={3} step={1}
              value={layerCount} display={layerCount}
              onChange={(v) => set({ layerCount: v })} />

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

      {/* Presets */}
      <div className="mb-2 p-2 rounded-lg"
           style={{ background: 'rgba(0,0,0,.3)', border: '1px solid rgba(0,180,255,.07)' }}>
        <div className="mb-1" style={{ color: '#00c8ff', fontSize: '.74rem', fontWeight: 600 }}>
          Save / Load Presets
        </div>

        {/* Save row */}
        <div className="flex gap-1 mb-2">
          <input type="text" placeholder="Preset name..."
                 value={presetName} onChange={e => setPresetName(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSave()}
                 style={{
                   flex: 1, background: 'rgba(0,0,0,.4)', border: '1px solid rgba(0,180,255,.15)',
                   color: '#c8a86e', fontSize: '.7rem', padding: '4px 6px', borderRadius: 4,
                   fontFamily: 'Rajdhani,sans-serif',
                 }} />
          <button onClick={handleSave}
                  style={{
                    background: 'rgba(0,180,255,.15)', border: '1px solid rgba(0,180,255,.3)',
                    color: '#00c8ff', fontSize: '.68rem', padding: '4px 10px', borderRadius: 4,
                    cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap',
                  }}>
            Save
          </button>
        </div>

        {/* Saved presets list */}
        {presets.length === 0 && (
          <div style={{ color: 'rgba(130,190,255,.4)', fontSize: '.66rem', fontStyle: 'italic' }}>
            No saved presets yet
          </div>
        )}
        {presets.map(p => (
          <div key={p.name} className="flex items-center justify-between mb-1"
               style={{ padding: '3px 0' }}>
            <button onClick={() => handleLoad(p)}
                    style={{
                      flex: 1, textAlign: 'left', background: 'none', border: 'none',
                      color: '#c8a86e', fontSize: '.68rem', cursor: 'pointer',
                      fontFamily: 'Rajdhani,sans-serif', padding: 0,
                    }}>
              {p.name}
            </button>
            <button onClick={() => handleDelete(p.name)}
                    style={{
                      background: 'none', border: 'none', color: 'rgba(255,80,80,.6)',
                      fontSize: '.62rem', cursor: 'pointer', padding: '0 4px',
                    }}>
              X
            </button>
          </div>
        ))}
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
