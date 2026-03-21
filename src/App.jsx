import React, { useState } from 'react';
import ChessApp from './components/ChessApp';
import JanggiApp from './components/JanggiApp';
import './styles/App.css';

function App() {
  const [activeTab, setActiveTab] = useState('chess');

  return (
    <div className="app-container">
      <div className="tabs">
        <button 
          className={activeTab === 'chess' ? 'active tab-btn' : 'tab-btn'} 
          onClick={() => setActiveTab('chess')}
        >
          Chess
        </button>
        <button 
          className={activeTab === 'janggi' ? 'active tab-btn' : 'tab-btn'} 
          onClick={() => setActiveTab('janggi')}
        >
          Janggi
        </button>
      </div>

      <div className="tab-content" style={{ flexGrow: 1, display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        {activeTab === 'chess' && <ChessApp />}
        {activeTab === 'janggi' && <JanggiApp />}
      </div>
    </div>
  );
}

export default App;
