import Viewport        from './components/Viewport.jsx';
import GarmentPanel    from './components/GarmentPanel.jsx';
import DecorationPanel from './components/DecorationPanel.jsx';
import Toolbar         from './components/Toolbar.jsx';

const panelStyle = {
  background: 'rgba(3,12,28,.92)',
  borderRadius: '0 0 8px 8px',
  border: '1px solid rgba(0,180,255,.12)',
  borderTop: 'none',
  overflowY: 'auto',
  overflowX: 'hidden',
};

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0e1a' }}>
      {/* Top toolbar */}
      <Toolbar />

      {/* Main area: left panel + viewport + right panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr 260px',
        flex: 1,
        gap: '0',
        minHeight: 0,
      }}>
        {/* Left: Garment controls */}
        <div style={panelStyle}>
          <GarmentPanel />
        </div>

        {/* Center: 3D Viewport */}
        <div style={{
          overflow: 'hidden',
          borderBottom: '1px solid rgba(0,180,255,.12)',
          background: '#0a0e1a',
          position: 'relative',
        }}>
          <Viewport />
        </div>

        {/* Right: Decoration controls */}
        <div style={panelStyle}>
          <DecorationPanel />
        </div>
      </div>
    </div>
  );
}
