export const COLORS = {
    CHO: 'blue', // Typically plays first
    HAN: 'red',
};

export const PIECES = {
    KING: 'k',     // Jang/Cho
    GUARD: 'g',    // Sa
    ELEPHANT: 'e', // Sang
    HORSE: 'h',    // Ma
    CHARIOT: 'r',  // Cha
    CANNON: 'c',   // Po
    SOLDIER: 's',  // Jol/Byung
};

class JanggiGame {
    constructor() {
        this.board = this.initializeBoard();
        this.turn = COLORS.CHO; // Cho traditionally moves first
        this.history = [];
        this.status = 'PLAYING';
        this.deadPieces = {
            [COLORS.CHO]: [],
            [COLORS.HAN]: []
        };
    }

    initializeBoard() {
        const board = Array(10).fill(null).map(() => Array(9).fill(null));

        const initRank = (row, color) => {
            board[row][0] = { type: PIECES.CHARIOT, color };
            board[row][1] = { type: PIECES.HORSE, color };
            board[row][2] = { type: PIECES.ELEPHANT, color };
            board[row][3] = { type: PIECES.GUARD, color };
            board[row][5] = { type: PIECES.GUARD, color };
            board[row][6] = { type: PIECES.HORSE, color };
            board[row][7] = { type: PIECES.ELEPHANT, color };
            board[row][8] = { type: PIECES.CHARIOT, color };
        };

        // HAN (Red) at Top
        initRank(0, COLORS.HAN);
        board[1][4] = { type: PIECES.KING, color: COLORS.HAN };
        board[2][1] = { type: PIECES.CANNON, color: COLORS.HAN };
        board[2][7] = { type: PIECES.CANNON, color: COLORS.HAN };
        [0, 2, 4, 6, 8].forEach(c => board[3][c] = { type: PIECES.SOLDIER, color: COLORS.HAN });

        // CHO (Blue) at Bottom
        initRank(9, COLORS.CHO);
        board[8][4] = { type: PIECES.KING, color: COLORS.CHO };
        board[7][1] = { type: PIECES.CANNON, color: COLORS.CHO };
        board[7][7] = { type: PIECES.CANNON, color: COLORS.CHO };
        [0, 2, 4, 6, 8].forEach(c => board[6][c] = { type: PIECES.SOLDIER, color: COLORS.CHO });

        return board;
    }

    getBoard() { return this.board; }
    getTurn() { return this.turn; }
    getDeadPieces() { return this.deadPieces; }

    move(fromRow, fromCol, toRow, toCol) {
        if (this.status === 'CHECKMATE') return false;

        const piece = this.board[fromRow][fromCol];
        if (!piece || piece.color !== this.turn) return false;

        if (!this.isValidMove(fromRow, fromCol, toRow, toCol, piece)) return false;

        const target = this.board[toRow][toCol];
        
        // Simulate to check for own King in Check
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        let inCheck = this.isInCheck(this.turn);
        this.board[fromRow][fromCol] = piece;
        this.board[toRow][toCol] = target;

        if (inCheck) return false;

        // Save History
        this.history.push({
            board: this.board.map(row => row.map(cell => cell ? { ...cell } : null)),
            turn: this.turn,
            status: this.status,
            deadPieces: {
                [COLORS.CHO]: [...this.deadPieces[COLORS.CHO]],
                [COLORS.HAN]: [...this.deadPieces[COLORS.HAN]]
            }
        });

        if (target) {
            this.deadPieces[this.turn].push(target);
        }

        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        const nextTurn = this.turn === COLORS.CHO ? COLORS.HAN : COLORS.CHO;
        this.turn = nextTurn;

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
        return true;
    }

    isInCheck(color) {
        let kingPos;
        for (let r = 0; r <= 9; r++) {
            for (let c = 0; c <= 8; c++) {
                const p = this.board[r][c];
                if (p && p.type === PIECES.KING && p.color === color) {
                    kingPos = { r, c };
                    break;
                }
            }
        }
        if (!kingPos) return true;
        return this.isUnderAttack(kingPos.r, kingPos.c, color === COLORS.CHO ? COLORS.HAN : COLORS.CHO);
    }

    isUnderAttack(row, col, attackerColor) {
        for (let r = 0; r <= 9; r++) {
            for (let c = 0; c <= 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === attackerColor) {
                    if (this.isValidMove(r, c, row, col, piece)) return true;
                }
            }
        }
        return false;
    }

    isCheckmate(color) {
        if (!this.isInCheck(color)) return false;
        for (let r = 0; r <= 9; r++) {
            for (let c = 0; c <= 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === color) {
                    for (let tr = 0; tr <= 9; tr++) {
                        for (let tc = 0; tc <= 8; tc++) {
                            if (this.isValidMove(r, c, tr, tc, piece)) {
                                const target = this.board[tr][tc];
                                this.board[tr][tc] = piece;
                                this.board[r][c] = null;
                                const stillInCheck = this.isInCheck(color);
                                this.board[r][c] = piece;
                                this.board[tr][tc] = target;
                                if (!stillInCheck) return false;
                            }
                        }
                    }
                }
            }
        }
        return true;
    }

    getValidMoves(fromRow, fromCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece || piece.color !== this.turn) return [];
        const validMoves = [];
        for (let r = 0; r <= 9; r++) {
            for (let c = 0; c <= 8; c++) {
                if (this.isValidMove(fromRow, fromCol, r, c, piece)) {
                    const target = this.board[r][c];
                    this.board[r][c] = piece;
                    this.board[fromRow][fromCol] = null;
                    const inCheck = this.isInCheck(this.turn);
                    this.board[fromRow][fromCol] = piece;
                    this.board[r][c] = target;
                    if (!inCheck) validMoves.push({ row: r, col: c });
                }
            }
        }
        return validMoves;
    }

    reset() {
        this.board = this.initializeBoard();
        this.turn = COLORS.CHO;
        this.history = [];
        this.status = 'PLAYING';
        this.deadPieces = { [COLORS.CHO]: [], [COLORS.HAN]: [] };
    }

    // Validation Helpers
    isPalace(r, c) {
        return (c >= 3 && c <= 5) && ((r >= 0 && r <= 2) || (r >= 7 && r <= 9));
    }

    isPalaceCenter(r, c) {
        return (r === 1 && c === 4) || (r === 8 && c === 4);
    }

    isValidPalaceStep(r1, c1, r2, c2) {
        if (!this.isPalace(r1, c1) || !this.isPalace(r2, c2)) return false;
        // Must be exactly 1 diagonal step
        if (Math.abs(r1 - r2) !== 1 || Math.abs(c1 - c2) !== 1) return false;
        // One of them must be the center
        return this.isPalaceCenter(r1, c1) || this.isPalaceCenter(r2, c2);
    }

    isSamePalace(r1, c1, r2, c2) {
        if (!this.isPalace(r1, c1) || !this.isPalace(r2, c2)) return false;
        if (r1 <= 2 && r2 <= 2) return true;
        if (r1 >= 7 && r2 >= 7) return true;
        return false;
    }

    isValidMove(fromRow, fromCol, toRow, toCol, piece) {
        if (fromRow === toRow && fromCol === toCol) return false;
        const target = this.board[toRow][toCol];
        if (target && target.color === piece.color) return false;

        const dx = toCol - fromCol;
        const dy = toRow - fromRow;

        switch (piece.type) {
            case PIECES.KING:
            case PIECES.GUARD:
                return this.validatePalacePiece(fromRow, fromCol, toRow, toCol);
            case PIECES.HORSE:
                return this.validateHorse(fromRow, fromCol, toRow, toCol);
            case PIECES.ELEPHANT:
                return this.validateElephant(fromRow, fromCol, toRow, toCol);
            case PIECES.CHARIOT:
                return this.validateChariot(fromRow, fromCol, toRow, toCol);
            case PIECES.CANNON:
                return this.validateCannon(fromRow, fromCol, toRow, toCol, target);
            case PIECES.SOLDIER:
                return this.validateSoldier(fromRow, fromCol, toRow, toCol, piece.color);
            default: return false;
        }
    }

    validatePalacePiece(r1, c1, r2, c2) {
        if (!this.isPalace(r2, c2)) return false;
        if (!this.isSamePalace(r1, c1, r2, c2)) return false;
        
        const adx = Math.abs(c1 - c2);
        const ady = Math.abs(r1 - r2);
        
        // Orthogonal 1 step
        if ((adx === 1 && ady === 0) || (adx === 0 && ady === 1)) return true;
        // Diagonal 1 step in palace
        if (this.isValidPalaceStep(r1, c1, r2, c2)) return true;
        
        return false;
    }

    validateHorse(r1, c1, r2, c2) {
        const adx = Math.abs(c1 - c2);
        const ady = Math.abs(r1 - r2);
        if (!((adx === 1 && ady === 2) || (adx === 2 && ady === 1))) return false;

        const dirR = ady === 2 ? Math.sign(r2 - r1) : 0;
        const dirC = adx === 2 ? Math.sign(c2 - c1) : 0;
        
        // Check hurdle
        if (this.board[r1 + dirR][c1 + dirC]) return false;
        return true;
    }

    validateElephant(r1, c1, r2, c2) {
        const adx = Math.abs(c1 - c2);
        const ady = Math.abs(r1 - r2);
        if (!((adx === 2 && ady === 3) || (adx === 3 && ady === 2))) return false;

        const dirR = ady === 3 ? Math.sign(r2 - r1) : Math.sign(r2 - r1);
        const dirC = adx === 3 ? Math.sign(c2 - c1) : Math.sign(c2 - c1);
        
        // Find orthogonal step
        let orthR = 0, orthC = 0;
        if (ady === 3) orthR = Math.sign(r2 - r1);
        else orthC = Math.sign(c2 - c1);

        // First step (orthogonal)
        if (this.board[r1 + orthR][c1 + orthC]) return false;
        
        // Second step (diagonal)
        const diagR = orthR + Math.sign(r2 - (r1 + orthR));
        const diagC = orthC + Math.sign(c2 - (c1 + orthC));
        if (this.board[r1 + diagR][c1 + diagC]) return false;

        return true;
    }

    isPathClear(r1, c1, r2, c2) {
        const adx = Math.abs(c1 - c2);
        const ady = Math.abs(r1 - r2);
        if (adx !== 0 && ady !== 0) return false; // This is strictly for orthogonal check

        const dx = Math.sign(c2 - c1);
        const dy = Math.sign(r2 - r1);
        let x = c1 + dx;
        let y = r1 + dy;
        while (x !== c2 || y !== r2) {
            if (this.board[y][x]) return false;
            x += dx;
            y += dy;
        }
        return true;
    }

    countPathPieces(r1, c1, r2, c2) {
        const dx = Math.sign(c2 - c1);
        const dy = Math.sign(r2 - r1);
        let count = 0;
        let x = c1 + dx;
        let y = r1 + dy;
        while (x !== c2 || y !== r2) {
            if (this.board[y][x]) count++;
            x += dx;
            y += dy;
        }
        return count;
    }

    validateChariot(r1, c1, r2, c2) {
        const adx = Math.abs(c1 - c2);
        const ady = Math.abs(r1 - r2);

        // Orthogonal
        if (adx === 0 || ady === 0) {
            return this.isPathClear(r1, c1, r2, c2);
        }

        // Diagonal within palace
        if (adx === ady && this.isSamePalace(r1, c1, r2, c2)) {
            // Must go through center if it's 2 steps
            if (adx === 2) {
                const midR = r1 + Math.sign(r2 - r1);
                const midC = c1 + Math.sign(c2 - c1);
                if (!this.isPalaceCenter(midR, midC)) return false;
                if (this.board[midR][midC]) return false;
                return true;
            }
            // 1 step diagonal
            return this.isValidPalaceStep(r1, c1, r2, c2);
        }
        return false;
    }

    validateCannon(r1, c1, r2, c2, target) {
        if (target && target.type === PIECES.CANNON) return false;

        const adx = Math.abs(c1 - c2);
        const ady = Math.abs(r1 - r2);

        // Orthogonal
        if (adx === 0 || ady === 0) {
            let count = 0;
            // Count pieces between
            const dx = Math.sign(c2 - c1);
            const dy = Math.sign(r2 - r1);
            let x = c1 + dx;
            let y = r1 + dy;
            while (x !== c2 || y !== r2) {
                const p = this.board[y][x];
                if (p) {
                    if (p.type === PIECES.CANNON) return false; // Hurdle cannot be Cannon
                    count++;
                }
                x += dx;
                y += dy;
            }
            return count === 1;
        }

        // Diagonal within palace
        if (adx === ady && adx === 2 && this.isSamePalace(r1, c1, r2, c2)) {
            const midR = r1 + Math.sign(r2 - r1);
            const midC = c1 + Math.sign(c2 - c1);
            const hurdle = this.board[midR][midC];
            if (hurdle) {
                if (hurdle.type === PIECES.CANNON) return false;
                return true;
            }
        }
        
        return false;
    }

    validateSoldier(r1, c1, r2, c2, color) {
        const adx = Math.abs(c1 - c2);
        const ady = Math.abs(r1 - r2);
        const dir = color === COLORS.HAN ? 1 : -1; // Han (Red) moves down (+1), Cho (Blue) moves up (-1)
        const dy = r2 - r1;

        // Sideways or forward 1 step
        if ((adx === 1 && dy === 0) || (adx === 0 && dy === dir)) return true;

        // Palace diagonal forward
        if (this.isPalace(r1, c1) && this.isPalace(r2, c2) && adx === 1 && ady === 1) {
            // Must proceed forward
            if (dy === dir) {
                return this.isValidPalaceStep(r1, c1, r2, c2);
            }
        }

        return false;
    }
}

export default new JanggiGame();
export { JanggiGame };
