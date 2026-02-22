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
      
      <div className="status">
        Turn: {turn === COLORS.WHITE ? "White" : "Black"}
        {gameStatus === 'CHECK' && <span className="alert"> - Check!</span>}
        {gameStatus === 'CHECKMATE' && <span className="alert"> - Checkmate!</span>}
      </div>
      
      <div className="game-area">
        <div className="side-panel left">
            <div className="captured-area top">
                {/* Top Left: Black player's collection (Captured White pieces) */}
                <CapturedPieces pieces={deadPieces[COLORS.BLACK]} color={COLORS.WHITE} />
            </div>
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
        </div>

        <Board
            board={board}
            onMove={handleMove}
            turn={turn}
            onSelect={handlePieceSelect}
            highlightedSquares={validMoves}
        />
        
        <div className="side-panel right">
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
      <button className="reset-btn" onClick={handleReset}>Reset Game</button>

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
