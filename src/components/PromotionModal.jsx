import React from 'react';
import '../styles/Board.css'; // Re-use styles or create new ones
import { PIECES, COLORS } from '../logic/Game';

const PromotionModal = ({ isOpen, color, onSelect }) => {
    if (!isOpen) return null;

    const promotionOptions = [
        { type: PIECES.QUEEN, label: 'Queen' },
        { type: PIECES.ROOK, label: 'Rook' },
        { type: PIECES.BISHOP, label: 'Bishop' },
        { type: PIECES.KNIGHT, label: 'Knight' },
    ];

    // Simple inline styles for modal
    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    };

    const modalStyle = {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
    };

    const buttonStyle = {
        margin: '10px',
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h3>Choose Promotion</h3>
                <div className="promotion-options">
                    {promotionOptions.map((option) => (
                        <button
                            key={option.type}
                            onClick={() => onSelect(option.type)}
                            style={buttonStyle}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PromotionModal;
