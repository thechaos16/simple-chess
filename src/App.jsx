import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import game, { COLORS } from './logic/Game'; // Singleton instance
import './styles/App.css';

import PromotionModal from './components/PromotionModal';
import GameStatusModal from './components/GameStatusModal';

import CapturedPieces from './components/CapturedPieces';

function App() {
  const [board, setBoard] = useState(game.getBoard());
  const [turn, setTurn] = useState(game.getTurn());
  const [gameStatus, setGameStatus] = useState('PLAYING');
  const [promotionPending, setPromotionPending] = useState(null);
  const [deadPieces, setDeadPieces] = useState(game.getDeadPieces());

  // Beginner Mode State (Per Player)
  const [beginnerModes, setBeginnerModes] = useState({
    [COLORS.WHITE]: false,
    [COLORS.BLACK]: false,
  });
  const [validMoves, setValidMoves] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);

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

  // Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);

  const handleMove = (fromRow, fromCol, toRow, toCol) => {
    if (gameStatus === 'CHECKMATE') return false;

    const result = game.move(fromRow, fromCol, toRow, toCol);

    if (result === 'PROMOTION_NEEDED') {
      setPromotionPending({ fromRow, fromCol, toRow, toCol });
      return true;
    }

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

  const handlePromotionSelect = (pieceType) => {
    if (!promotionPending) return;
    const { fromRow, fromCol, toRow, toCol } = promotionPending;
    const result = game.move(fromRow, fromCol, toRow, toCol, pieceType);

    setPromotionPending(null);
    if (result) {
      updateGameState(result);
    }
  };

  const updateGameState = (result) => {
    const newBoard = game.getBoard().map(row => [...row]);
    setBoard(newBoard);
    setTurn(game.getTurn());
    setGameStatus(result);
    setDeadPieces({...game.getDeadPieces()}); // Trigger re-render

    if (result === 'CHECK' || result === 'CHECKMATE') {
      setShowStatusModal(true);
    }
  };

  const handleReset = () => {
    game.reset();
    setBoard(game.getBoard().map(row => [...row]));
    setTurn(game.getTurn());
    setGameStatus('PLAYING');
    setPromotionPending(null);
    setDeadPieces({ [COLORS.WHITE]: [], [COLORS.BLACK]: [] });
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
      setPromotionPending(null);
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

  return (
    <div className="app-container">
      {/* Title removed as requested */}
      

      
      <div className="game-area">
        <div className="side-panel left">
            <div className="beginner-toggle top">
                <label>
                    <input
                        type="checkbox"
                        checked={beginnerModes[COLORS.BLACK]}
                        onChange={() => toggleBeginnerMode(COLORS.BLACK)}
                    />
                    <br/>Beginner Mode
                </label>
            </div>
            <div className="captured-area top">
                {/* Top Left: Black player's collection (Captured White pieces) */}
                <CapturedPieces pieces={deadPieces[COLORS.BLACK]} color={COLORS.WHITE} />
            </div>
        </div>

        <Board
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
                        backgroundColor: turn === COLORS.WHITE ? 'white' : 'black',
                        border: '2px solid #555',
                        margin: '10px auto',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }} title={turn === COLORS.WHITE ? "White's Turn" : "Black's Turn"}></div>
                    {gameStatus === 'CHECK' && <div className="alert" style={{ color: 'red', marginTop: '5px' }}>Check!</div>}
                    {gameStatus === 'CHECKMATE' && <div className="alert" style={{ color: 'red', marginTop: '5px', fontWeight: 'bold' }}>Checkmate!</div>}
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
                            checked={beginnerModes[COLORS.WHITE]}
                            onChange={() => toggleBeginnerMode(COLORS.WHITE)}
                        />
                        <br/>Beginner Mode
                    </label>
                </div>
                <div className="captured-area bottom">
                    {/* Bottom Right: White player's collection (Captured Black pieces) */}
                    <CapturedPieces pieces={deadPieces[COLORS.WHITE]} color={COLORS.BLACK} />
                </div>
            </div>
        </div>
      </div>

      {promotionPending && (
        <PromotionModal
          isOpen={true}
          color={turn}
          onSelect={handlePromotionSelect}
        />
      )}

      {showStatusModal && (
        <GameStatusModal
          status={gameStatus}
          onDismiss={dismissModal}
          onRestart={handleReset}
        />
      )}
    </div>
  );
}

export default App;
