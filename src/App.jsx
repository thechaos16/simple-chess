import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import game, { COLORS } from './logic/Game'; // Singleton instance
import './styles/App.css';

import PromotionModal from './components/PromotionModal';
import GameStatusModal from './components/GameStatusModal';

function App() {
  const [board, setBoard] = useState(game.getBoard());
  const [turn, setTurn] = useState(game.getTurn());
  const [gameStatus, setGameStatus] = useState('PLAYING');
  const [promotionPending, setPromotionPending] = useState(null);

  // Beginner Mode State
  const [beginnerMode, setBeginnerMode] = useState(false);
  const [validMoves, setValidMoves] = useState([]);

  // Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);

  const handleMove = (fromRow, fromCol, toRow, toCol) => {
    if (gameStatus === 'CHECKMATE') return false;

    const result = game.move(fromRow, fromCol, toRow, toCol);

    if (result === 'PROMOTION_NEEDED') {
      setPromotionPending({ fromRow, fromCol, toRow, toCol });
      setValidMoves([]); // Clear hints on move attempt
      return true;
    }

    if (result) {
      updateGameState(result);
      setValidMoves([]); // Clear hints on successful move
      return true;
    }
    return false;
  };

  const handlePieceSelect = (row, col) => {
    if (beginnerMode) {
      const moves = game.getValidMoves(row, col);
      setValidMoves(moves);
    } else {
      setValidMoves([]);
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
    setGameStatus('PLAYING');
    setPromotionPending(null);
    setValidMoves([]);
    setShowStatusModal(false);
  };

  const dismissModal = () => {
    setShowStatusModal(false);
  };

  return (
    <div className="app-container">
      <h1 className="title">Simple Chess</h1>
      <div className="controls">
        <label>
          <input
            type="checkbox"
            checked={beginnerMode}
            onChange={(e) => {
              setBeginnerMode(e.target.checked);
              setValidMoves([]); // Clear on toggle
            }}
          />
          {" "}Beginner Mode
        </label>
      </div>

      <div className="status">
        Turn: {turn === COLORS.WHITE ? "White" : "Black"}
        {gameStatus === 'CHECK' && <span className="alert"> - Check!</span>}
        {gameStatus === 'CHECKMATE' && <span className="alert"> - Checkmate!</span>}
      </div>
      <Board
        board={board}
        onMove={handleMove}
        turn={turn}
        onSelect={handlePieceSelect}
        highlightedSquares={validMoves}
      />
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
