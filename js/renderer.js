/**
 * renderer.js
 * Handles all visual rendering of the game elements using HTML5 Canvas
 * Part of the full Tetris implementation
 */

class Renderer {
    constructor(boardCanvas, nextPieceCanvas, cellSize = 30) {
        // Main game board canvas and context
        this.boardCanvas = boardCanvas;
        this.boardCtx = boardCanvas.getContext('2d');
        
        // Next piece preview canvas and context
        this.nextPieceCanvas = nextPieceCanvas;
        this.nextPieceCtx = nextPieceCanvas.getContext('2d');
        
        // Size of each tetromino cell
        this.cellSize = cellSize;
        
        // Animation variables
        this.linesClearingAnimation = null;
        this.linesClearingFrames = 0;
        this.linesClearingRows = [];
    }
    
    /**
     * Clears the main game board canvas
     */
    clearBoard() {
        this.boardCtx.clearRect(0, 0, this.boardCanvas.width, this.boardCanvas.height);
    }
    
    /**
     * Clears the next piece preview canvas
     */
    clearNextPiecePreview() {
        this.nextPieceCtx.clearRect(0, 0, this.nextPieceCanvas.width, this.nextPieceCanvas.height);
    }
    
    /**
     * Draws the grid background on the main board
     */
    drawGrid(boardWidth, boardHeight) {
        this.boardCtx.strokeStyle = '#333';
        this.boardCtx.lineWidth = 0.5;
        
        // Draw vertical grid lines
        for (let x = 0; x <= boardWidth; x++) {
            this.boardCtx.beginPath();
            this.boardCtx.moveTo(x * this.cellSize, 0);
            this.boardCtx.lineTo(x * this.cellSize, boardHeight * this.cellSize);
            this.boardCtx.stroke();
        }
        
        // Draw horizontal grid lines
        for (let y = 0; y <= boardHeight; y++) {
            this.boardCtx.beginPath();
            this.boardCtx.moveTo(0, y * this.cellSize);
            this.boardCtx.lineTo(boardWidth * this.cellSize, y * this.cellSize);
            this.boardCtx.stroke();
        }
    }
    
    /**
     * Draws a single tetromino cell with a 3D effect
     */
    drawCell(ctx, x, y, color) {
        if (!color) return; // Don't draw empty cells
        
        const cellSize = this.cellSize;
        
        // Main cell color
        ctx.fillStyle = color;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        
        // Light edge (top, left)
        ctx.fillStyle = this.lightenColor(color, 30);
        ctx.beginPath();
        ctx.moveTo(x * cellSize, y * cellSize);
        ctx.lineTo((x + 1) * cellSize, y * cellSize);
        ctx.lineTo((x + 0.9) * cellSize, (y + 0.1) * cellSize);
        ctx.lineTo((x + 0.1) * cellSize, (y + 0.1) * cellSize);
        ctx.lineTo((x + 0.1) * cellSize, (y + 0.9) * cellSize);
        ctx.lineTo(x * cellSize, (y + 1) * cellSize);
        ctx.closePath();
        ctx.fill();
        
        // Dark edge (bottom, right)
        ctx.fillStyle = this.darkenColor(color, 30);
        ctx.beginPath();
        ctx.moveTo((x + 1) * cellSize, y * cellSize);
        ctx.lineTo((x + 1) * cellSize, (y + 1) * cellSize);
        ctx.lineTo(x * cellSize, (y + 1) * cellSize);
        ctx.lineTo((x + 0.1) * cellSize, (y + 0.9) * cellSize);
        ctx.lineTo((x + 0.9) * cellSize, (y + 0.9) * cellSize);
        ctx.lineTo((x + 0.9) * cellSize, (y + 0.1) * cellSize);
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * Helper method to lighten a color by a percentage
     */
    lightenColor(color, percent) {
        const num = parseInt(color.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, ((num >> 16) & 0xff) + amt);
        const G = Math.min(255, ((num >> 8) & 0xff) + amt);
        const B = Math.min(255, (num & 0xff) + amt);
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }
    
    /**
     * Helper method to darken a color by a percentage
     */
    darkenColor(color, percent) {
        const num = parseInt(color.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, ((num >> 16) & 0xff) - amt);
        const G = Math.max(0, ((num >> 8) & 0xff) - amt);
        const B = Math.max(0, (num & 0xff) - amt);
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }
    
    /**
     * Draws the entire game board
     */
    drawBoard(board) {
        this.clearBoard();
        this.drawGrid(board.width, board.height);
        
        // Draw the board cells
        const grid = board.getGrid();
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                if (grid[y][x]) {
                    this.drawCell(this.boardCtx, x, y, grid[y][x]);
                }
            }
        }
    }
    
    /**
     * Draws a tetromino on the game board
     */
    drawTetromino(tetromino) {
        const shape = tetromino.getShape();
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = tetromino.x + x;
                    const boardY = tetromino.y + y;
                    
                    // Only draw cells that are on the board
                    if (boardY >= 0) {
                        this.drawCell(this.boardCtx, boardX, boardY, tetromino.color);
                    }
                }
            }
        }
    }
    
    /**
     * Draws the ghost piece (shadow) showing where the piece will land
     */
    drawGhostPiece(ghostPiece) {
        const shape = ghostPiece.getShape();
        
        // Semi-transparent version of the color
        const ghostColor = ghostPiece.color + '40'; // 40 is 25% opacity in hex
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = ghostPiece.x + x;
                    const boardY = ghostPiece.y + y;
                    
                    // Only draw cells that are on the board
                    if (boardY >= 0) {
                        // Draw a simple rectangle for ghost piece (no 3D effect)
                        this.boardCtx.fillStyle = ghostColor;
                        this.boardCtx.fillRect(
                            boardX * this.cellSize, 
                            boardY * this.cellSize, 
                            this.cellSize, 
                            this.cellSize
                        );
                    }
                }
            }
        }
    }
    
    /**
     * Draws the next piece preview
     */
    drawNextPiece(tetromino) {
        this.clearNextPiecePreview();
        
        if (!tetromino) return;
        
        const shape = tetromino.getShape();
        const shapeSize = shape.length;
        
        // Calculate centering offset
        const offsetX = (this.nextPieceCanvas.width - shapeSize * this.cellSize) / 2;
        const offsetY = (this.nextPieceCanvas.height - shapeSize * this.cellSize) / 2;
        
        // Draw each cell of the next piece
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    // Calculate position with centering offset
                    const drawX = offsetX + x * this.cellSize;
                    const drawY = offsetY + y * this.cellSize;
                    
                    // Draw the cell
                    this.nextPieceCtx.fillStyle = tetromino.color;
                    this.nextPieceCtx.fillRect(drawX, drawY, this.cellSize, this.cellSize);
                    
                    // Add 3D effect
                    this.nextPieceCtx.fillStyle = this.lightenColor(tetromino.color, 30);
                    this.nextPieceCtx.beginPath();
                    this.nextPieceCtx.moveTo(drawX, drawY);
                    this.nextPieceCtx.lineTo(drawX + this.cellSize, drawY);
                    this.nextPieceCtx.lineTo(drawX + this.cellSize * 0.9, drawY + this.cellSize * 0.1);
                    this.nextPieceCtx.lineTo(drawX + this.cellSize * 0.1, drawY + this.cellSize * 0.1);
                    this.nextPieceCtx.lineTo(drawX + this.cellSize * 0.1, drawY + this.cellSize * 0.9);
                    this.nextPieceCtx.lineTo(drawX, drawY + this.cellSize);
                    this.nextPieceCtx.closePath();
                    this.nextPieceCtx.fill();
                    
                    this.nextPieceCtx.fillStyle = this.darkenColor(tetromino.color, 30);
                    this.nextPieceCtx.beginPath();
                    this.nextPieceCtx.moveTo(drawX + this.cellSize, drawY);
                    this.nextPieceCtx.lineTo(drawX + this.cellSize, drawY + this.cellSize);
                    this.nextPieceCtx.lineTo(drawX, drawY + this.cellSize);
                    this.nextPieceCtx.lineTo(drawX + this.cellSize * 0.1, drawY + this.cellSize * 0.9);
                    this.nextPieceCtx.lineTo(drawX + this.cellSize * 0.9, drawY + this.cellSize * 0.9);
                    this.nextPieceCtx.lineTo(drawX + this.cellSize * 0.9, drawY + this.cellSize * 0.1);
                    this.nextPieceCtx.closePath();
                    this.nextPieceCtx.fill();
                }
            }
        }
    }
    
    /**
     * Starts the line clearing animation
     */
    startLineClearAnimation(rows) {
        this.linesClearingRows = rows;
        this.linesClearingFrames = 0;
        this.linesClearingAnimation = true;
    }
    
    /**
     * Performs a frame of the line clearing animation
     * Returns true when animation is complete
     */
    updateLineClearAnimation(board) {
        if (!this.linesClearingAnimation) return true;
        
        this.linesClearingFrames++;
        
        // Draw board and highlight clearing rows
        this.drawBoard(board);
        
        const animationDuration = 30; // frames
        const flashRate = 3; // flash frequency
        
        // Flash the rows being cleared
        if (this.linesClearingFrames % flashRate < Math.floor(flashRate / 2)) {
            // Draw white flash
            for (const row of this.linesClearingRows) {
                this.boardCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                this.boardCtx.fillRect(
                    0, 
                    row * this.cellSize, 
                    board.width * this.cellSize, 
                    this.cellSize
                );
            }
        }
        
        // End animation after specified duration
        if (this.linesClearingFrames >= animationDuration) {
            this.linesClearingAnimation = false;
            return true;
        }
        
        return false;
    }
}