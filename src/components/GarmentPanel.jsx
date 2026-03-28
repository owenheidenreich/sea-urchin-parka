/**
 * GarmentPanel.jsx — Left panel: data-driven sliders for active garment.
 */
import { useStore } from '../store/store.js';

const GOWN_SECTIONS = [
  {
    title: 'Gown Shape',
    sliders: [
      { label: 'Bodice Height', key: 'bodiceHeight', min: 12, max: 22, step: 1 },
      { label: 'Waist Width',   key: 'waistWidth',   min: 7,  max: 14, step: 0.2, decimals: 1 },
      { label: 'Bust Width',    key: 'bustWidth',    min: 8,  max: 16, step: 0.2, decimals: 1 },
      { label: 'Hip Width',     key: 'hipWidth',     min: 8,  max: 16, step: 0.2, decimals: 1 },
      { label: 'Hem Height',    key: 'hemHeight',    min: -38, max: -24, step: 1 },
      { label: 'Skirt Flare',   key: 'skirtFlare',   min: 0.5, max: 2.0, step: 0.1, decimals: 1, suffix: 'x' },
      { label: 'Slit Height',   key: 'slitHeight',   min: -28, max: 5, step: 1 },
      { label: 'Slit Width',    key: 'slitWidth',    min: 2,  max: 10, step: 1 },
    ],
  },
  {
    title: 'Train',
    sliders: [
      { label: 'Train Length', key: 'trainLength', min: 10, max: 50, step: 1 },
      { label: 'Train Width',  key: 'trainWidth',  min: 0.5, max: 2.0, step: 0.1, decimals: 1, suffix: 'x' },
    ],
  },
  {
    title: 'Wheels',
    sliders: [
      { label: 'Wheel Count', key: 'wheelCount', min: 20, max: 200, step: 5 },
      { label: 'Wheel Size',  key: 'wheelSize',  min: 0.3, max: 1.2, step: 0.05, decimals: 2 },
    ],
  },
  {
    title: 'Medallion',
    sliders: [
      { label: 'Size',       key: 'medallionScale', min: 0.3, max: 3.0, step: 0.1, decimals: 1, suffix: 'x' },
      { label: 'Y Position', key: 'medallionY',     min: -10, max: 20, step: 0.5, decimals: 1 },
      { label: 'X Position', key: 'medallionX',     min: -10, max: 10, step: 0.5, decimals: 1 },
    ],
  },
];

const PARKA_SECTIONS = [
  {
    title: 'Parka Shape',
    sliders: [
      { label: 'Hood Depth',     key: 'hoodDepth',    min: 8,  max: 20, step: 1 },
      { label: 'Body Length',    key: 'bodyLength',   min: 40, max: 70, step: 1 },
      { label: 'Waist Taper',   key: 'waistTaper',   min: 0.7, max: 1.0, step: 0.02, decimals: 2 },
      { label: 'Sleeve Length',  key: 'sleeveLength', min: 20, max: 45, step: 1 },
      { label: 'Collar Height', key: 'collarHeight', min: 2,  max: 8,  step: 1 },
    ],
  },
];

const GARMENT_DESCRIPTIONS = {
  gown: 'Strapless gown with dramatic floor-length skirt and trailing train. Embedded wheels allow the dress to glide as the wearer walks. Front slit reveals the legs. Covered in ammunition.',
  parka: 'Biomimetic parka with hood, sleeves, and collar. Surface covered in ammunition arranged in sea urchin distribution. Telescoping spines collapse for storage.',
};

const SECTIONS = { gown: GOWN_SECTIONS, parka: PARKA_SECTIONS };

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
  const activeGarment = useStore((s) => s.activeGarment);
  const garmentParams = useStore((s) => s[activeGarment]);
  const setParam = useStore((s) =>
    activeGarment === 'gown' ? s.setGownParam : s.setParkaParam
  );

  const sections = SECTIONS[activeGarment] || [];

  function formatValue(slider, val) {
    if (slider.decimals != null) {
      const formatted = val.toFixed(slider.decimals);
      return slider.suffix ? `${formatted}${slider.suffix}` : formatted;
    }
    return slider.suffix ? `${val}${slider.suffix}` : val;
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-3 py-3"
         style={{ fontFamily: "'Rajdhani',sans-serif" }}>

      {sections.map((section) => (
        <div key={section.title}>
          <SectionTitle>{section.title}</SectionTitle>
          {section.sliders.map((sl) => (
            <Slider key={sl.key}
                    label={sl.label}
                    min={sl.min}
                    max={sl.max}
                    step={sl.step}
                    value={garmentParams[sl.key]}
                    display={formatValue(sl, garmentParams[sl.key])}
                    onChange={(v) => setParam(sl.key, v)} />
          ))}
        </div>
      ))}

      <div className="mt-4 p-3 rounded-lg"
           style={{ background: 'rgba(0,0,0,.2)', border: '1px solid rgba(0,180,255,.07)' }}>
        <div style={{ color: 'rgba(130,190,255,.5)', fontSize: '.7rem', lineHeight: 1.5 }}>
          {GARMENT_DESCRIPTIONS[activeGarment]}
        </div>
      </div>
    </div>
  );
}
