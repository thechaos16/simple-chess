import React, { useState } from 'react';
import Piece from './Piece';
import '../styles/Board.css';

const Board = ({ board, onMove, turn, onSelect, highlightedSquares = [] }) => {
    const [selected, setSelected] = useState(null);

    const handleSquareClick = (row, col) => {
        // 1. If nothing selected, select piece if it belongs to current turn
        if (!selected) {
            const piece = board[row][col];
            if (piece && piece.color === turn) {
                setSelected({ row, col });
                if (onSelect) onSelect(row, col);
            }
            return;
        }

        // 2. If something selected, try to move
        const { row: fromRow, col: fromCol } = selected;

        // If clicking same square, deselect
        if (fromRow === row && fromCol === col) {
            setSelected(null);
            if (onSelect) onSelect(null, null); // Clear selection
            return;
        }

        // Attempt move
        const success = onMove(fromRow, fromCol, row, col);
        console.log(`Move ${fromRow},${fromCol} to ${row},${col}: ${success}`);

        if (success) {
            setSelected(null);
            if (onSelect) onSelect(null, null);
        } else {
            // If invalid move, but clicked on own piece, select that instead
            const piece = board[row][col];
            if (piece && piece.color === turn) {
                setSelected({ row, col });
                if (onSelect) onSelect(row, col);
            } else {
                // Invalid move to empty or enemy, just deselect? or keep selected?
                // Let's deselect for now or show error feedback.
                setSelected(null);
                if (onSelect) onSelect(null, null);
            }
        }
    };

    const renderSquare = (row, col) => {
        const isDark = (row + col) % 2 === 1;
        const piece = board[row][col];
        const isSelected = selected && selected.row === row && selected.col === col;
        const isHighlighted = highlightedSquares.some(sq => sq.row === row && sq.col === col);

        return (
            <div
                key={`${row}-${col}`}
                className={`square ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSquareClick(row, col)}
            >
                {piece && <Piece type={piece.type} color={piece.color} />}
                {isHighlighted && <div className="hint-dot" />}
            </div>
        );
    };

    return (
        <div className="board">
            {board.map((rowArr, row) =>
                rowArr.map((_, col) => renderSquare(row, col))
            )}
        </div>
    );
};

export default Board;
