import React from 'react';
import { PIECES, COLORS } from '../logic/Game';

const PIECE_SYMBOLS = {
    [COLORS.WHITE]: {
        [PIECES.PAWN]: '♙',
        [PIECES.ROOK]: '♖',
        [PIECES.KNIGHT]: '♘',
        [PIECES.BISHOP]: '♗',
        [PIECES.QUEEN]: '♕',
        [PIECES.KING]: '♔',
    },
    [COLORS.BLACK]: {
        [PIECES.PAWN]: '♙',
        [PIECES.ROOK]: '♖',
        [PIECES.KNIGHT]: '♘',
        [PIECES.BISHOP]: '♗',
        [PIECES.QUEEN]: '♕',
        [PIECES.KING]: '♔',
    },
};

const Piece = ({ type, color }) => {
    const symbol = PIECE_SYMBOLS[color][type];

    return (
        <div className={`piece ${color}`}>
            {symbol}
        </div>
    );
};

export default Piece;
