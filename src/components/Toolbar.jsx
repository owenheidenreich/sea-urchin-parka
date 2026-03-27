/**
 * Toolbar.jsx — Top bar: view presets, wireframe, mannequin toggles.
 */
import { useStore } from '../store/store.js';

const VIEWS = ['FRONT', 'BACK', 'LEFT', 'RIGHT', 'TOP', '3/4'];

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
    showMannequin, toggleMannequin,
    showWireframe, toggleWireframe,
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
        PARKA STUDIO
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
      <Btn label="MANNEQUIN" active={showMannequin} onClick={toggleMannequin} />
      <Btn label="WIREFRAME" active={showWireframe} onClick={toggleWireframe} />

      {/* Spacer */}
      <div className="flex-1" />

      <div style={{ color: 'rgba(130,190,255,.4)', fontSize: '.6rem', fontFamily: 'Rajdhani,sans-serif' }}>
        Sea Urchin Parka Studio v3.0
      </div>
    </div>
  );
}
