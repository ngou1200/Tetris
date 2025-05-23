/**
 * board.js
 * Manages the game board grid, collision detection, and line clearing
 */

class Board {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = this.createEmptyGrid();
        this.linesCleared = 0;
    }
    
    /**
     * Creates an empty grid (filled with zeros)
     */
    createEmptyGrid() {
        return Array(this.height).fill().map(() => Array(this.width).fill(0));
    }
    
    /**
     * Resets the board to empty state
     */
    reset() {
        this.grid = this.createEmptyGrid();
        this.linesCleared = 0;
    }
    
    /**
     * Checks if a tetromino would collide with the board boundaries or existing blocks
     */
    checkCollision(tetromino, offsetX = 0, offsetY = 0) {
        const shape = tetromino.getShape();
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                // If this cell in the tetromino is empty, skip it
                if (shape[y][x] === 0) continue;
                
                // Calculate actual position on the board
                const boardX = tetromino.x + x + offsetX;
                const boardY = tetromino.y + y + offsetY;
                
                // Check if out of bounds
                if (boardX < 0 || boardX >= this.width || boardY >= this.height) {
                    return true;
                }
                
                // Skip collision check above the board (negative y values)
                if (boardY < 0) continue;
                
                // Check if there is already a piece at this position
                if (this.grid[boardY][boardX]) {
                    return true;
                }
            }
        }
        
        // No collision detected
        return false;
    }
    
    /**
     * Merges a tetromino into the board grid
     */
    mergeTetromino(tetromino) {
        const shape = tetromino.getShape();
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] === 0) continue;
                
                const boardX = tetromino.x + x;
                const boardY = tetromino.y + y;
                
                // Only merge cells that are on the board
                if (boardY >= 0 && boardY < this.height && boardX >= 0 && boardX < this.width) {
                    // Store the color value in the grid
                    this.grid[boardY][boardX] = tetromino.color;
                }
            }
        }
    }
    
    /**
     * Checks for and clears complete lines, returning number of lines cleared
     */
    clearLines() {
        const linesToClear = [];
        
        // Find complete lines
        for (let y = 0; y < this.height; y++) {
            if (this.grid[y].every(cell => cell !== 0)) {
                linesToClear.push(y);
            }
        }
        
        // Clear the lines found
        for (const line of linesToClear) {
            // Remove the complete line
            this.grid.splice(line, 1);
            // Add a new empty line at the top
            this.grid.unshift(Array(this.width).fill(0));
        }
        
        // Update total lines cleared
        this.linesCleared += linesToClear.length;
        
        return {
            clearedLines: linesToClear.length,
            totalLinesCleared: this.linesCleared
        };
    }
    
    /**
     * Checks if the game is over (blocks at the top of the board)
     */
    isGameOver() {
        // Check if there are any filled cells in the top row (excluding temporary positions)
        return this.grid[0].some(cell => cell !== 0);
    }
    
    /**
     * Returns the current board grid
     */
    getGrid() {
        return this.grid.map(row => [...row]);
    }
}