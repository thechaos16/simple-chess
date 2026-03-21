import React from 'react';
import { PIECES, COLORS } from '../logic/JanggiGame';
import '../styles/JanggiBoard.css';

const JANGGI_SYMBOLS = {
    [COLORS.HAN]: { // Red
        [PIECES.KING]: '漢',
        [PIECES.GUARD]: '士',
        [PIECES.ELEPHANT]: '象',
        [PIECES.HORSE]: '馬',
        [PIECES.CHARIOT]: '車',
        [PIECES.CANNON]: '包',
        [PIECES.SOLDIER]: '兵',
    },
    [COLORS.CHO]: { // Blue
        [PIECES.KING]: '楚',
        [PIECES.GUARD]: '士',
        [PIECES.ELEPHANT]: '象',
        [PIECES.HORSE]: '馬',
        [PIECES.CHARIOT]: '車',
        [PIECES.CANNON]: '包',
        [PIECES.SOLDIER]: '卒',
    },
};

const JanggiPiece = ({ type, color }) => {
    const symbol = JANGGI_SYMBOLS[color][type];
    
    // Size logic: King is largest, Soldier/Guard are smallest, others medium
    let sizeClass = 'medium';
    if (type === PIECES.KING) sizeClass = 'large';
    else if (type === PIECES.SOLDIER || type === PIECES.GUARD) sizeClass = 'small';

    const renderPiece = () => (
        <div className={`janggi-piece ${color} ${sizeClass}`}>
            {symbol}
        </div>
    );

    return renderPiece();
};

export default JanggiPiece;
