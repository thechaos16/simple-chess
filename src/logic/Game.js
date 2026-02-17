export const COLORS = {
    WHITE: 'w',
    BLACK: 'b',
};

export const PIECES = {
    PAWN: 'p',
    ROOK: 'r',
    KNIGHT: 'n',
    BISHOP: 'b',
    QUEEN: 'q',
    KING: 'k',
};

class Game {
    constructor() {
        this.board = this.initializeBoard();
        this.turn = COLORS.WHITE;
        this.history = [];
        this.status = 'PLAYING'; // PLAYING, CHECK, CHECKMATE
        this.deadPieces = {
            [COLORS.WHITE]: [], // Captured by White (Black pieces)
            [COLORS.BLACK]: []  // Captured by Black (White pieces)
        };
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));

        // Pawns
        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: PIECES.PAWN, color: COLORS.BLACK };
            board[6][i] = { type: PIECES.PAWN, color: COLORS.WHITE };
        }

        // Rooks
        board[0][0] = board[0][7] = { type: PIECES.ROOK, color: COLORS.BLACK };
        board[7][0] = board[7][7] = { type: PIECES.ROOK, color: COLORS.WHITE };

        // Knights
        board[0][1] = board[0][6] = { type: PIECES.KNIGHT, color: COLORS.BLACK };
        board[7][1] = board[7][6] = { type: PIECES.KNIGHT, color: COLORS.WHITE };

        // Bishops
        board[0][2] = board[0][5] = { type: PIECES.BISHOP, color: COLORS.BLACK };
        board[7][2] = board[7][5] = { type: PIECES.BISHOP, color: COLORS.WHITE };

        // Queens
        board[0][3] = { type: PIECES.QUEEN, color: COLORS.BLACK };
        board[7][3] = { type: PIECES.QUEEN, color: COLORS.WHITE };

        // Kings
        board[0][4] = { type: PIECES.KING, color: COLORS.BLACK };
        board[7][4] = { type: PIECES.KING, color: COLORS.WHITE };

        return board;
    }

    getBoard() {
        return this.board;
    }

    getTurn() {
        return this.turn;
    }
    
    getDeadPieces() {
        return this.deadPieces;
    }

    // Basic move framework - to be expanded
    move(fromRow, fromCol, toRow, toCol, promotionPieceType = null) {
        if (this.status === 'CHECKMATE') return false;

        const piece = this.board[fromRow][fromCol];

        // 1. Basic checks (piece exists, correct turn)
        if (!piece || piece.color !== this.turn) return false;

        // 2. Validate move rules
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol, piece)) return false;

        // 3. Check for Promotion
        if (piece.type === PIECES.PAWN) {
            const lastRank = piece.color === COLORS.WHITE ? 0 : 7;
            if (toRow === lastRank) {
                if (!promotionPieceType) {
                    return 'PROMOTION_NEEDED';
                }
                // If promotionPieceType is provided, we proceed.
                // Validate promotionPieceType is valid? (Optional but good)
            }
        }

        // 4. Ensure move doesn't put own King in check
        // Simulate move
        const target = this.board[toRow][toCol];
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        const inCheck = this.isInCheck(this.turn);

        // Undo move
        this.board[fromRow][fromCol] = piece;
        this.board[toRow][toCol] = target;

        if (inCheck) return false;

        // 5. Execute move
        if (target) {
            // Capture logic
            // Add target to the *current player's* collection of dead pieces
            this.deadPieces[this.turn].push(target);
        }

        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Handle Promotion execution
        if (promotionPieceType) {
            this.board[toRow][toCol] = { type: promotionPieceType, color: piece.color };
        }

        // 6. Switch turn
        const nextTurn = this.turn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        this.turn = nextTurn;

        // 7. Check Game State
        if (this.isInCheck(nextTurn)) {
            if (this.isCheckmate(nextTurn)) {
                this.status = 'CHECKMATE';
            } else {
                this.status = 'CHECK';
            }
        } else {
            this.status = 'PLAYING';
        }

        return this.status;
    }

    isInCheck(color) {
        // Find King
        let kingPos;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (p && p.type === PIECES.KING && p.color === color) {
                    kingPos = { r, c };
                    break;
                }
            }
        }
        if (!kingPos) return true; // Should not happen

        return this.isUnderAttack(kingPos.r, kingPos.c, color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE);
    }

    isUnderAttack(row, col, attackerColor) {
        // Check every opponent piece to see if it can move to (row, col)
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === attackerColor) {
                    if (this.isValidMove(r, c, row, col, piece)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isCheckmate(color) {
        if (!this.isInCheck(color)) return false;

        // Try every possible move for current color
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === color) {
                    // Try all destinations
                    for (let tr = 0; tr < 8; tr++) {
                        for (let tc = 0; tc < 8; tc++) {
                            if (this.isValidMove(r, c, tr, tc, piece)) {
                                // Simulate
                                const target = this.board[tr][tc];
                                this.board[tr][tc] = piece;
                                this.board[r][c] = null;

                                const stillInCheck = this.isInCheck(color);

                                // Undo
                                this.board[r][c] = piece;
                                this.board[tr][tc] = target;

                                if (!stillInCheck) return false; // Found a move that saves Player
                            }
                        }
                    }
                }
            }
        }
        return true;
    }

    isValidMove(fromRow, fromCol, toRow, toCol, piece) {
        if (fromRow === toRow && fromCol === toCol) return false;
        const target = this.board[toRow][toCol];
        if (target && target.color === piece.color) return false;

        const dx = toCol - fromCol;
        const dy = toRow - fromRow;

        switch (piece.type) {
            case PIECES.PAWN: return this.validatePawn(fromRow, fromCol, toRow, toCol, piece.color, target);
            case PIECES.ROOK: return this.validateRook(fromRow, fromCol, toRow, toCol);
            case PIECES.KNIGHT: return this.validateKnight(fromRow, fromCol, toRow, toCol);
            case PIECES.BISHOP: return this.validateBishop(fromRow, fromCol, toRow, toCol);
            case PIECES.QUEEN: return this.validateQueen(fromRow, fromCol, toRow, toCol);
            case PIECES.KING: return this.validateKing(fromRow, fromCol, toRow, toCol);
            default: return false;
        }
    }

    isPathClear(fromRow, fromCol, toRow, toCol) {
        const dx = Math.sign(toCol - fromCol);
        const dy = Math.sign(toRow - fromRow);
        let x = fromCol + dx;
        let y = fromRow + dy;

        while (x !== toCol || y !== toRow) {
            if (this.board[y][x]) return false;
            x += dx;
            y += dy;
        }
        return true;
    }

    validatePawn(fromRow, fromCol, toRow, toCol, color, target) {
        const direction = color === COLORS.WHITE ? -1 : 1;
        const startRow = color === COLORS.WHITE ? 6 : 1;
        const dy = toRow - fromRow;
        const dx = Math.abs(toCol - fromCol);

        // Move forward 1
        if (dx === 0 && dy === direction && !target) return true;

        // Move forward 2
        if (dx === 0 && dy === 2 * direction && fromRow === startRow && !target && !this.board[fromRow + direction][fromCol]) return true;

        // Capture
        if (dx === 1 && dy === direction && target && target.color !== color) return true;

        // En Passant (TODO)

        return false;
    }

    validateRook(fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }

    validateKnight(fromRow, fromCol, toRow, toCol) {
        const dx = Math.abs(toCol - fromCol);
        const dy = Math.abs(toRow - fromRow);
        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
    }

    validateBishop(fromRow, fromCol, toRow, toCol) {
        if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }

    validateQueen(fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol && Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }

    validateKing(fromRow, fromCol, toRow, toCol) {
        const dx = Math.abs(toCol - fromCol);
        const dy = Math.abs(toRow - fromRow);
        return dx <= 1 && dy <= 1;
        // Castling (TODO)
    }

    getValidMoves(fromRow, fromCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece || piece.color !== this.turn) return [];

        const validMoves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.isValidMove(fromRow, fromCol, r, c, piece)) {
                    // Simulate move to ensure no self-check
                    const target = this.board[r][c];
                    this.board[r][c] = piece;
                    this.board[fromRow][fromCol] = null;

                    const inCheck = this.isInCheck(this.turn);

                    // Undo
                    this.board[fromRow][fromCol] = piece;
                    this.board[r][c] = target;

                    if (!inCheck) {
                        validMoves.push({ row: r, col: c });
                    }
                }
            }
        }
        return validMoves;
    }

    reset() {
        this.board = this.initializeBoard();
        this.turn = COLORS.WHITE;
        this.history = [];
        this.status = 'PLAYING';
        this.deadPieces = {
            [COLORS.WHITE]: [],
            [COLORS.BLACK]: []
        };
    }
}

export default new Game(); // Singleton by default? Or export class? 
// Better to export class so React can instantiate or use singleton instance inside a context/hook.
// For simplicity, let's export the class and we can manage instance in React state.
export { Game };
