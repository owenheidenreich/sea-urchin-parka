/**
 * Toolbar.jsx — Top bar: view presets, wireframe, mannequin toggles.
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
    <div className="flex items-center gap-2 px-4 py-2"
         style={{
           background: 'rgba(3,12,28,.95)',
           borderBottom: '1px solid rgba(0,180,255,.12)',
         }}>
      {/* Title */}
      <div style={{
        fontFamily: 'Orbitron,monospace', color: '#00c8ff',
        fontSize: '.72rem', fontWeight: 700, letterSpacing: '.09em',
        marginRight: 16,
      }}>
        GOWN STUDIO
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
      <Btn label="MEDALLION" active={showMedallion} onClick={toggleMedallion} />
      <Btn label="WHEELS" active={showWheels} onClick={toggleWheels} />
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
        Bullet Gown Studio v1.0
      </div>
    </div>
  );
}
