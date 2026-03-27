import { useState } from 'react';
import Viewport        from './components/Viewport.jsx';
import GarmentPanel    from './components/GarmentPanel.jsx';
import DecorationPanel from './components/DecorationPanel.jsx';
import Toolbar         from './components/Toolbar.jsx';

const panelStyle = {
  background: 'rgba(3,12,28,.92)',
  border: '1px solid rgba(0,180,255,.12)',
  overflowY: 'auto',
  overflowX: 'hidden',
};

export default function App() {
  // On small screens, panels are toggled via tabs instead of always-visible columns
  const [mobilePanel, setMobilePanel] = useState(null); // null = viewport, 'garment', 'decoration'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#0a0e1a' }}>
      {/* Top toolbar */}
      <Toolbar />

      {/* ── Desktop layout: 3-column grid (≥900px handled by CSS) ── */}
      <div className="desktop-layout" style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr 260px',
        flex: 1,
        gap: '0',
        minHeight: 0,
      }}>
        <div style={{ ...panelStyle, borderRadius: '0 0 0 8px' }}>
          <GarmentPanel />
        </div>
        <div style={{
          overflow: 'hidden',
          borderBottom: '1px solid rgba(0,180,255,.12)',
          background: '#0a0e1a',
          position: 'relative',
        }}>
          <Viewport />
        </div>
        <div style={{ ...panelStyle, borderRadius: '0 0 8px 0' }}>
          <DecorationPanel />
        </div>
      </div>

      {/* ── Mobile/iPad layout: tabs + single panel at a time (<900px) ── */}
      <div className="mobile-layout" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 0,
          borderBottom: '1px solid rgba(0,180,255,.15)',
          background: 'rgba(3,12,28,.95)',
        }}>
          {[
            { key: null, label: '3D VIEW' },
            { key: 'garment', label: 'GOWN' },
            { key: 'decoration', label: 'BULLETS' },
          ].map(({ key, label }) => (
            <button key={label} onClick={() => setMobilePanel(key)} style={{
              flex: 1, padding: '10px 0',
              background: mobilePanel === key ? 'rgba(0,180,255,.12)' : 'transparent',
              color: mobilePanel === key ? '#00c8ff' : '#5a7a9a',
              border: 'none', cursor: 'pointer',
              fontFamily: 'Orbitron, monospace', fontSize: '.7rem', fontWeight: 700,
              letterSpacing: '.08em',
              borderBottom: mobilePanel === key ? '2px solid #00c8ff' : '2px solid transparent',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {mobilePanel === null && <Viewport />}
          {mobilePanel === 'garment' && (
            <div style={{ ...panelStyle, height: '100%', border: 'none' }}>
              <GarmentPanel />
            </div>
          )}
          {mobilePanel === 'decoration' && (
            <div style={{ ...panelStyle, height: '100%', border: 'none' }}>
              <DecorationPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
