import React from 'react';

const GameStatusModal = ({ status, onDismiss, onRestart }) => {
    if (!status || status === 'PLAYING') return null;

    // Simple inline styles for modal (similar to PromotionModal)
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
        animation: 'fadeIn 0.3s ease-out',
    };

    const modalStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        minWidth: '300px',
        animation: 'slideIn 0.3s ease-out',
    };

    const titleStyle = {
        margin: '0 0 20px 0',
        fontSize: '24px',
        color: status === 'CHECK' ? '#d32f2f' : '#333',
    };

    const messageStyle = {
        marginBottom: '25px',
        fontSize: '18px',
        color: '#666',
    };

    const buttonStyle = {
        padding: '10px 25px',
        fontSize: '16px',
        cursor: 'pointer',
        backgroundColor: '#4a3426',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
    };

    const isCheck = status === 'CHECK';
    const title = isCheck ? 'Check!' : 'Checkmate!';
    const message = isCheck
        ? 'Your King is in danger.'
        : 'Game Over. The King is captured.';

    const infoMessage = isCheck
        ? 'You must move your King or block the attack.'
        : '';

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <h2 style={titleStyle}>{title}</h2>
                <p style={messageStyle}>{message}</p>
                {infoMessage && <p style={{ fontSize: '14px', marginBottom: '20px', color: '#888' }}>{infoMessage}</p>}

                {isCheck ? (
                    <button style={buttonStyle} onClick={onDismiss}>OK</button>
                ) : (
                    <button style={buttonStyle} onClick={onRestart}>New Game</button>
                )}
            </div>
        </div>
    );
};

export default GameStatusModal;
