import React from 'react';
import Piece from './Piece';
import '../styles/CapturedPieces.css';

const CapturedPieces = ({ pieces, color }) => {
    return (
        <div className={`captured-pieces ${color}`}>
            {pieces.map((piece, index) => (
                <div key={index} className="captured-piece">
                    <Piece type={piece.type} color={piece.color} />
                </div>
            ))}
        </div>
    );
};

export default CapturedPieces;
