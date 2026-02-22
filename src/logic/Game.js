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
        this.castlingRights = {
            [COLORS.WHITE]: { kingSide: true, queenSide: true },
            [COLORS.BLACK]: { kingSide: true, queenSide: true }
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

        // 5. Save History before execution
        this.history.push({
            board: this.board.map(row => row.map(cell => cell ? { ...cell } : null)),
            turn: this.turn,
            status: this.status,
            deadPieces: {
                [COLORS.WHITE]: [...this.deadPieces[COLORS.WHITE]],
                [COLORS.BLACK]: [...this.deadPieces[COLORS.BLACK]]
            },
            castlingRights: {
                [COLORS.WHITE]: { ...this.castlingRights[COLORS.WHITE] },
                [COLORS.BLACK]: { ...this.castlingRights[COLORS.BLACK] }
            }
        });

        // 6. Execute move
        if (target) {
            // Capture logic
            this.deadPieces[this.turn].push(target);
            // If dragging rook captured, deny their castling rights for it
            if (target.type === PIECES.ROOK) {
                if (target.color === COLORS.WHITE && toRow === 7) {
                    if (toCol === 0) this.castlingRights[COLORS.WHITE].queenSide = false;
                    if (toCol === 7) this.castlingRights[COLORS.WHITE].kingSide = false;
                } else if (target.color === COLORS.BLACK && toRow === 0) {
                    if (toCol === 0) this.castlingRights[COLORS.BLACK].queenSide = false;
                    if (toCol === 7) this.castlingRights[COLORS.BLACK].kingSide = false;
                }
            }
        }

        // Handle Castling Move internally: King moved two spots
        if (piece.type === PIECES.KING && Math.abs(toCol - fromCol) === 2) {
            const isKingSide = toCol === 6;
            const rookFromCol = isKingSide ? 7 : 0;
            const rookToCol = isKingSide ? 5 : 3;
            const rook = this.board[fromRow][rookFromCol];
            
            // Move Rook
            this.board[fromRow][rookToCol] = rook;
            this.board[fromRow][rookFromCol] = null;
            
            // Note: moving the king is done below as standard
        }

        // Update castling rights (move King or Rook strips rights)
        if (piece.type === PIECES.KING) {
            this.castlingRights[piece.color].kingSide = false;
            this.castlingRights[piece.color].queenSide = false;
        } else if (piece.type === PIECES.ROOK) {
            if (fromCol === 0) this.castlingRights[piece.color].queenSide = false;
            if (fromCol === 7) this.castlingRights[piece.color].kingSide = false;
        }

        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Handle Promotion execution
        if (promotionPieceType) {
            this.board[toRow][toCol] = { type: promotionPieceType, color: piece.color };
        }

        // 7. Switch turn
        const nextTurn = this.turn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        this.turn = nextTurn;

        // 8. Check Game State
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

    undo() {
        if (this.history.length === 0) return false;

        const lastState = this.history.pop();
        this.board = lastState.board;
        this.turn = lastState.turn;
        this.status = lastState.status;
        this.deadPieces = lastState.deadPieces;
        this.castlingRights = lastState.castlingRights;

        return true;
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
        
        // Standard Move
        if (dx <= 1 && dy <= 1) return true;

        // Castling
        const piece = this.board[fromRow][fromCol];
        if (dy === 0 && dx === 2) {
            // King must not be currently in check
            if (this.isInCheck(piece.color)) return false;

            const isKingSide = (toCol === 6);
            if (isKingSide) {
                if (!this.castlingRights[piece.color].kingSide) return false;
                // Path clear between king and rook?
                if (this.board[fromRow][5] || this.board[fromRow][6]) return false;
                // Rook must exist at fromRow, 7 and be a rook of same color
                const rook = this.board[fromRow][7];
                if (!rook || rook.type !== PIECES.ROOK || rook.color !== piece.color) return false;
                // Squares King passes through cannot be under attack
                if (this.isUnderAttack(fromRow, 5, piece.color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE)) return false;
                // toCol (6) check is implicitly handled in move() validation via simulation
                return true;
            } else {
                // QueenSide Castling
                if (!this.castlingRights[piece.color].queenSide) return false;
                // Path clear between king and rook?
                if (this.board[fromRow][1] || this.board[fromRow][2] || this.board[fromRow][3]) return false;
                const rook = this.board[fromRow][0];
                if (!rook || rook.type !== PIECES.ROOK || rook.color !== piece.color) return false;
                // Squares King passes through cannot be under attack
                if (this.isUnderAttack(fromRow, 3, piece.color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE)) return false;
                // Note: b1 (fromRow, 1) doesn't need to be checked for "under attack" for castling rules, only transit squares (c1, d1 / 2, 3)
                // However the king moves two squares to c1, so he passes through d1.
                // Wait col 3 is d1, col 2 is c1. King goes e1 (4) -> c1 (2), passing through d1 (3)
                return true;
            }
        }
        
        return false;
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
        this.castlingRights = {
            [COLORS.WHITE]: { kingSide: true, queenSide: true },
            [COLORS.BLACK]: { kingSide: true, queenSide: true }
        };
    }
}

export default new Game(); // Singleton by default? Or export class? 
// Better to export class so React can instantiate or use singleton instance inside a context/hook.
// For simplicity, let's export the class and we can manage instance in React state.
export { Game };
