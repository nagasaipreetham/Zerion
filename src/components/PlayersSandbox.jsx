import { useState } from 'react';
import { Link } from 'react-router-dom';
import VintagePlayer from './vintage-player/VintagePlayer';
import './PlayersSandbox.css';

const PlayersSandbox = () => {
  const [viewMode, setViewMode] = useState('both'); // 'both', 'dark', 'light'

  return (
    <div className="sandbox-container">
      <div className="sandbox-header">
        <div className="sandbox-header-left">
          <Link to="/" className="sandbox-back-btn">
            ← Back to Portfolio
          </Link>
          <h1 className="sandbox-title">Turntable Sandbox</h1>
          <p className="sandbox-subtitle">
            A dedicated playground to tweak, test, and polish the vintage vinyl player components.
          </p>
        </div>
        
        <div className="sandbox-controls">
          <button 
            className={`sandbox-tab ${viewMode === 'both' ? 'active' : ''}`}
            onClick={() => setViewMode('both')}
          >
            Show Both
          </button>
          <button 
            className={`sandbox-tab ${viewMode === 'dark' ? 'active' : ''}`}
            onClick={() => setViewMode('dark')}
          >
            Noir (Dark)
          </button>
          <button 
            className={`sandbox-tab ${viewMode === 'light' ? 'active' : ''}`}
            onClick={() => setViewMode('light')}
          >
            Classic (Light)
          </button>
        </div>
      </div>

      <div className={`sandbox-workspace ${viewMode}`}>
        {(viewMode === 'both' || viewMode === 'dark') && (
          <div className="sandbox-player-card dark-theme-card">
            <div className="card-badge">NOIR THEME</div>
            <VintagePlayer theme="dark" />
          </div>
        )}

        {(viewMode === 'both' || viewMode === 'light') && (
          <div className="sandbox-player-card light-theme-card">
            <div className="card-badge">CLASSIC THEME</div>
            <VintagePlayer theme="light" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersSandbox;
