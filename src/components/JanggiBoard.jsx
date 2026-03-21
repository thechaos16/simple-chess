import React, { useState } from 'react';
import JanggiPiece from './JanggiPiece';
import '../styles/JanggiBoard.css';

const JanggiBoard = ({ board, onMove, turn, onSelect, highlightedSquares = [] }) => {
    const [selected, setSelected] = useState(null);

    const handleSquareClick = (row, col) => {
        if (!selected) {
            const piece = board[row][col];
            if (piece && piece.color === turn) {
                setSelected({ row, col });
                if (onSelect) onSelect(row, col);
            }
            return;
        }

        const { row: fromRow, col: fromCol } = selected;

        if (fromRow === row && fromCol === col) {
            setSelected(null);
            if (onSelect) onSelect(null, null);
            return;
        }

        const success = onMove(fromRow, fromCol, row, col);

        if (success) {
            setSelected(null);
            if (onSelect) onSelect(null, null);
        } else {
            const piece = board[row][col];
            if (piece && piece.color === turn) {
                setSelected({ row, col });
                if (onSelect) onSelect(row, col);
            } else {
                setSelected(null);
                if (onSelect) onSelect(null, null);
            }
        }
    };

    const renderIntersection = (row, col) => {
        const piece = board[row][col];
        const isSelected = selected && selected.row === row && selected.col === col;
        const isHighlighted = highlightedSquares.some(sq => sq.row === row && sq.col === col);

        // Calculate palace diagonals styling
        // Handled via CSS background on the overall container, or specific line elements.
        // For simplicity, we'll draw lines using CSS grid and pseudo-elements.

        return (
            <div
                key={`${row}-${col}`}
                className={`janggi-intersection ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSquareClick(row, col)}
            >
                {piece && <JanggiPiece type={piece.type} color={piece.color} />}
                {isHighlighted && <div className="janggi-hint-dot" />}
            </div>
        );
    };

    // We render a grid of 10 rows and 9 cols
    // The visual lines are separated from the clickable nodes (intersections)
    return (
        <div className="janggi-board-container">
            {/* The background lines */}
            <div className="janggi-board-bg">
                {/* 9 boxes wide? No, 8 boxes wide and 9 boxes high */}
                {Array(9).fill(null).map((_, r) => (
                    <div className="janggi-bg-row" key={`bg-row-${r}`}>
                        {Array(8).fill(null).map((_, c) => (
                            <div className="janggi-bg-cell" key={`bg-cell-${r}-${c}`}>
                                {/* Draw diagonals for palace cells */}
                                {( (r===0 || r===1 || r===7 || r===8) && (c===3 || c===4) ) && (
                                    <svg className="palace-diagonal" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        {/* If it's top palace 0,3 -> 2,5. This spans cells (0,3), (0,4), (1,3), (1,4) */}
                                        {((r===0 && c===3) || (r===1 && c===4) || (r===7 && c===3) || (r===8 && c===4)) && <line x1="0" y1="0" x2="100" y2="100" stroke="#000" strokeWidth="2" />}
                                        {((r===0 && c===4) || (r===1 && c===3) || (r===7 && c===4) || (r===8 && c===3)) && <line x1="100" y1="0" x2="0" y2="100" stroke="#000" strokeWidth="2" />}
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* The interactive intersections layer */}
            <div className="janggi-intersections">
                {board.map((rowArr, row) =>
                    rowArr.map((_, col) => renderIntersection(row, col))
                )}
            </div>
        </div>
    );
};

export default JanggiBoard;
