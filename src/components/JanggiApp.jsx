import React, { useState, useEffect } from 'react';
import JanggiBoard from './JanggiBoard';
import game, { COLORS, PIECES } from '../logic/JanggiGame'; // Singleton instance
import '../styles/App.css';
import GameStatusModal from './GameStatusModal';
import CapturedPieces from './CapturedPieces';
import JanggiPiece from './JanggiPiece'; // For captured pieces, though standard CapturedPieces might use traditional icons

function JanggiApp() {
  const [board, setBoard] = useState(game.getBoard());
  const [turn, setTurn] = useState(game.getTurn());
  const [gameStatus, setGameStatus] = useState('PLAYING');
  const [deadPieces, setDeadPieces] = useState(game.getDeadPieces());

  const [beginnerModes, setBeginnerModes] = useState({
    [COLORS.CHO]: false, // Blue
    [COLORS.HAN]: false, // Red
  });
  const [validMoves, setValidMoves] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);

  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    if (selectedSquare) {
      const { row, col } = selectedSquare;
      const piece = board[row][col];
      if (piece && beginnerModes[piece.color]) {
        const moves = game.getValidMoves(row, col);
        setValidMoves(moves);
      } else {
        setValidMoves([]);
      }
    } else {
      setValidMoves([]);
    }
  }, [selectedSquare, beginnerModes, board]);

  const handleMove = (fromRow, fromCol, toRow, toCol) => {
    if (gameStatus === 'CHECKMATE') return false;
    const result = game.move(fromRow, fromCol, toRow, toCol);
    if (result) {
      updateGameState(result);
      return true;
    }
    return false;
  };

  const handlePieceSelect = (row, col) => {
    if (row === null || col === null) {
      setSelectedSquare(null);
    } else {
      setSelectedSquare({ row, col });
    }
  };

  const updateGameState = (result) => {
    const newBoard = game.getBoard().map(row => [...row]);
    setBoard(newBoard);
    setTurn(game.getTurn());
    setGameStatus(result);
    setDeadPieces({...game.getDeadPieces()}); 

    if (result === 'CHECK' || result === 'CHECKMATE') {
      setShowStatusModal(true);
    }
  };

  const handleReset = () => {
    game.reset();
    setBoard(game.getBoard().map(row => [...row]));
    setTurn(game.getTurn());
    setGameStatus('PLAYING');
    setDeadPieces({ [COLORS.CHO]: [], [COLORS.HAN]: [] });
    setSelectedSquare(null);
    setValidMoves([]);
    setShowStatusModal(false);
  };

  const handleUndo = () => {
    if (game.undo()) {
      setBoard(game.getBoard().map(row => [...row]));
      setTurn(game.getTurn());
      setGameStatus(game.status);
      setDeadPieces({...game.getDeadPieces()});
      setSelectedSquare(null);
      setValidMoves([]);
      setShowStatusModal(false);
    }
  };

  const dismissModal = () => {
    setShowStatusModal(false);
  };

  const toggleBeginnerMode = (color) => {
    setBeginnerModes(prev => ({
      ...prev,
      [color]: !prev[color]
    }));
  };

  // Custom captured rendering because standard CapturedPieces uses chess text
  const renderCaptured = (pieceList) => {
      // PieceList contains objects like { type, color }
      return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', padding: '5px' }}>
              {pieceList.map((p, idx) => (
                  <div key={idx} style={{ transform: 'scale(0.6)', transformOrigin: 'left top', width: '25px', height: '25px' }}>
                      <JanggiPiece type={p.type} color={p.color} />
                  </div>
              ))}
          </div>
      );
  };

  return (
    <div className="game-area">
      <div className="side-panel left">
          <div className="beginner-toggle top">
              <label>
                  <input
                      type="checkbox"
                      checked={beginnerModes[COLORS.HAN]}
                      onChange={() => toggleBeginnerMode(COLORS.HAN)}
                  />
                  <br/>Beginner Mode (Red)
              </label>
          </div>
          <div className="captured-area top">
              {/* Top Left: Red (Han) captures Blue (Cho) pieces */}
              {renderCaptured(deadPieces[COLORS.HAN])}
          </div>
      </div>

      <JanggiBoard
          board={board}
          onMove={handleMove}
          turn={turn}
          onSelect={handlePieceSelect}
          highlightedSquares={validMoves}
      />
      
      <div className="side-panel right">
          <div className="top-controls" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
              <div className="status" style={{ fontSize: '1.2rem', textAlign: 'center', marginBottom: '10px' }}>
                  <div style={{
                      width: '30px', 
                      height: '30px', 
                      borderRadius: '50%', 
                      backgroundColor: turn === COLORS.CHO ? 'blue' : 'red',
                      border: '2px solid #555',
                      margin: '10px auto',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }} title={turn === COLORS.CHO ? "Blue's Turn" : "Red's Turn"}></div>
                  {gameStatus === 'CHECK' && <div className="alert" style={{ color: 'red', marginTop: '5px' }}>장군!</div>}
                  {gameStatus === 'CHECKMATE' && <div className="alert" style={{ color: 'red', marginTop: '5px', fontWeight: 'bold' }}>외통!</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
                  <button className="undo-btn" onClick={handleUndo} style={{ padding: '8px 5px', fontSize: '0.8rem', width: '100%', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#e2e8f0', color: '#333' }}>
                      Previous Turn
                  </button>
                  <button className="reset-btn" onClick={handleReset} style={{ padding: '8px 5px', fontSize: '0.8rem', width: '100%', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}>
                      Reset Game
                  </button>
              </div>
          </div>
          <div className="bottom-controls" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="beginner-toggle bottom">
                  <label>
                      <input
                          type="checkbox"
                          checked={beginnerModes[COLORS.CHO]}
                          onChange={() => toggleBeginnerMode(COLORS.CHO)}
                      />
                      <br/>Beginner Mode (Blue)
                  </label>
              </div>
              <div className="captured-area bottom">
                  {/* Bottom Right: Blue (Cho) captures Red (Han) pieces */}
                  {renderCaptured(deadPieces[COLORS.CHO])}
              </div>
          </div>
      </div>

      {showStatusModal && (
        <GameStatusModal
          status={gameStatus}
          onDismiss={dismissModal}
          onRestart={handleReset}
          gameType="janggi"
        />
      )}
    </div>
  );
}

export default JanggiApp;
