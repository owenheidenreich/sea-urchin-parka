/**
 * GarmentPanel.jsx — Left panel: gown shape + wheel + medallion controls.
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

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontFamily: 'Orbitron,monospace', color: '#00c8ff', fontSize: '.78rem',
      letterSpacing: '.1em', margin: '14px 0 10px', textTransform: 'uppercase',
    }}>
      {children}
    </h2>
  );
}

export default function GarmentPanel() {
  const {
    bodiceHeight, skirtFlare, slitHeight, slitWidth,
    waistWidth, bustWidth, hipWidth, hemHeight,
    trainLength, trainWidth, wheelCount, wheelSize,
    medallionScale, medallionX, medallionY, set,
  } = useStore();

  return (
    <div className="flex flex-col h-full overflow-y-auto px-3 py-3"
         style={{ fontFamily: "'Rajdhani',sans-serif" }}>

      <SectionTitle>Gown Shape</SectionTitle>

      <Slider label="Bodice Height" min={12} max={22} value={bodiceHeight}
              display={bodiceHeight} onChange={(v) => set({ bodiceHeight: v })} />

      <Slider label="Waist Width" min={7} max={14} step={0.2} value={waistWidth}
              display={waistWidth.toFixed(1)}
              onChange={(v) => set({ waistWidth: v })} />

      <Slider label="Bust Width" min={8} max={16} step={0.2} value={bustWidth}
              display={bustWidth.toFixed(1)}
              onChange={(v) => set({ bustWidth: v })} />

      <Slider label="Hip Width" min={8} max={16} step={0.2} value={hipWidth}
              display={hipWidth.toFixed(1)}
              onChange={(v) => set({ hipWidth: v })} />

      <Slider label="Hem Height" min={-38} max={-24} step={1} value={hemHeight}
              display={hemHeight} onChange={(v) => set({ hemHeight: v })} />

      <Slider label="Skirt Flare" min={0.5} max={2.0} step={0.1} value={skirtFlare}
              display={`${skirtFlare.toFixed(1)}x`}
              onChange={(v) => set({ skirtFlare: v })} />

      <Slider label="Slit Height" min={-28} max={5} value={slitHeight}
              display={slitHeight} onChange={(v) => set({ slitHeight: v })} />

      <Slider label="Slit Width" min={2} max={10} value={slitWidth}
              display={slitWidth} onChange={(v) => set({ slitWidth: v })} />

      <SectionTitle>Train</SectionTitle>

      <Slider label="Train Length" min={10} max={50} value={trainLength}
              display={trainLength} onChange={(v) => set({ trainLength: v })} />

      <Slider label="Train Width" min={0.5} max={2.0} step={0.1} value={trainWidth}
              display={`${trainWidth.toFixed(1)}x`}
              onChange={(v) => set({ trainWidth: v })} />

      <SectionTitle>Wheels</SectionTitle>

      <Slider label="Wheel Count" min={20} max={200} step={5} value={wheelCount}
              display={wheelCount} onChange={(v) => set({ wheelCount: v })} />

      <Slider label="Wheel Size" min={0.3} max={1.2} step={0.05} value={wheelSize}
              display={wheelSize.toFixed(2)}
              onChange={(v) => set({ wheelSize: v })} />

      <SectionTitle>Medallion</SectionTitle>

      <Slider label="Size" min={0.3} max={3.0} step={0.1} value={medallionScale}
              display={`${medallionScale.toFixed(1)}x`}
              onChange={(v) => set({ medallionScale: v })} />

      <Slider label="Y Position" min={-10} max={20} step={0.5} value={medallionY}
              display={medallionY.toFixed(1)}
              onChange={(v) => set({ medallionY: v })} />

      <Slider label="X Position" min={-10} max={10} step={0.5} value={medallionX}
              display={medallionX.toFixed(1)}
              onChange={(v) => set({ medallionX: v })} />

      <div className="mt-4 p-3 rounded-lg"
           style={{ background: 'rgba(0,0,0,.2)', border: '1px solid rgba(0,180,255,.07)' }}>
        <div style={{ color: 'rgba(130,190,255,.5)', fontSize: '.7rem', lineHeight: 1.5 }}>
          Strapless gown with dramatic floor-length skirt and trailing train.
          Embedded wheels allow the dress to glide as the wearer walks.
          Front slit reveals the legs. Covered in ammunition.
        </div>
      </div>
    </div>
  );
}
