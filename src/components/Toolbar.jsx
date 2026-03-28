/**
 * Toolbar.jsx — Top bar: garment switcher, view presets, toggles, bg shades.
 */
import { useStore } from '../store/store.js';

const VIEWS = ['FRONT', 'BACK', 'LEFT', 'RIGHT', 'TOP', '3/4'];

export const BG_SHADES = [
  '#0a0e1a', // darkest (default)
  '#1a1f2e',
  '#2e3444',
  '#4a505e',
  '#787e8a',
  '#c8ccd4', // lightest
];

function Btn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'rgba(0,200,255,.22)' : 'rgba(0,200,255,.06)',
      border: active ? '1px solid #00c8ff' : '1px solid rgba(0,200,255,.17)',
      color: active ? '#00c8ff' : '#8ab8d8',
      padding: '4px 10px', borderRadius: '5px', cursor: 'pointer',
      fontFamily: 'Orbitron,monospace', fontSize: '.62rem', fontWeight: 700,
      letterSpacing: '.04em', transition: 'all .15s',
    }}>
      {label}
    </button>
  );
}

export default function Toolbar() {
  const {
    activeGarment, setActiveGarment,
    cameraPreset, setCameraPreset,
    showAmmo, toggleAmmo,
    showMannequin, toggleMannequin,
    showWireframe, toggleWireframe,
    showMedallion, toggleMedallion,
    showWheels, toggleWheels,
    showAxes, toggleAxes,
    bgShade, setBgShade,
  } = useStore();

  return (
    <div className="flex items-center gap-2 px-4 py-2 flex-wrap"
         style={{
           background: 'rgba(3,12,28,.95)',
           borderBottom: '1px solid rgba(0,180,255,.12)',
         }}>
      {/* Title */}
      <div style={{
        fontFamily: 'Orbitron,monospace', color: '#00c8ff',
        fontSize: '.72rem', fontWeight: 700, letterSpacing: '.09em',
        marginRight: 8,
      }}>
        GARMENT STUDIO
      </div>

      {/* Garment switcher */}
      <div className="flex" style={{
        border: '1px solid rgba(0,180,255,.25)',
        borderRadius: 6, overflow: 'hidden', marginRight: 8,
      }}>
        <button onClick={() => setActiveGarment('gown')} style={{
          background: activeGarment === 'gown' ? 'rgba(0,200,255,.25)' : 'transparent',
          border: 'none', color: activeGarment === 'gown' ? '#00c8ff' : '#5a7a9a',
          padding: '4px 12px', cursor: 'pointer',
          fontFamily: 'Orbitron,monospace', fontSize: '.6rem', fontWeight: 700,
          letterSpacing: '.06em', transition: 'all .15s',
        }}>
          GOWN
        </button>
        <div style={{ width: 1, background: 'rgba(0,180,255,.25)' }} />
        <button onClick={() => setActiveGarment('parka')} style={{
          background: activeGarment === 'parka' ? 'rgba(0,200,255,.25)' : 'transparent',
          border: 'none', color: activeGarment === 'parka' ? '#00c8ff' : '#5a7a9a',
          padding: '4px 12px', cursor: 'pointer',
          fontFamily: 'Orbitron,monospace', fontSize: '.6rem', fontWeight: 700,
          letterSpacing: '.06em', transition: 'all .15s',
        }}>
          PARKA
        </button>
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 20, background: 'rgba(0,180,255,.15)', marginRight: 8 }} />

      {/* View presets */}
      <div className="flex gap-1">
        {VIEWS.map((v) => (
          <Btn key={v} label={v} active={cameraPreset === v}
               onClick={() => setCameraPreset(v)} />
        ))}
      </div>

      <div style={{ width: 1, height: 20, background: 'rgba(0,180,255,.15)', margin: '0 8px' }} />

      {/* Toggles */}
      <Btn label="BULLETS" active={showAmmo} onClick={toggleAmmo} />
      <Btn label="MANNEQUIN" active={showMannequin} onClick={toggleMannequin} />
      <Btn label="WIREFRAME" active={showWireframe} onClick={toggleWireframe} />
      {activeGarment === 'gown' && (
        <>
          <Btn label="MEDALLION" active={showMedallion} onClick={toggleMedallion} />
          <Btn label="WHEELS" active={showWheels} onClick={toggleWheels} />
        </>
      )}
      <Btn label="AXES" active={showAxes} onClick={toggleAxes} />

      <div style={{ width: 1, height: 20, background: 'rgba(0,180,255,.15)', margin: '0 8px' }} />

      {/* Background shades */}
      <div className="flex gap-1 items-center">
        {BG_SHADES.map((color, i) => (
          <button key={i} onClick={() => setBgShade(i)} style={{
            width: 16, height: 16, borderRadius: 3, background: color, cursor: 'pointer',
            border: bgShade === i ? '2px solid #00c8ff' : '1px solid rgba(255,255,255,.15)',
          }} />
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      <div style={{ color: 'rgba(130,190,255,.4)', fontSize: '.6rem', fontFamily: 'Rajdhani,sans-serif' }}>
        Garment Studio v2.0
      </div>
    </div>
  );
}
