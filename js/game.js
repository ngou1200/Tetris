/**
 * game.js
 * Main game logic for Tetris
 * Handles game loop, user input, scoring, and level progression
 */

class TetrisGame {
    constructor() {
        // Constants
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.BASE_SPEED = 1000; // Base time in ms for piece to drop one row
        this.SPEED_FACTOR = 0.75; // How much speed increases per level
        this.LINES_PER_LEVEL = 10; // Number of lines to clear for level up
        
        // DOM elements
        this.boardCanvas = document.getElementById('board');
        this.nextPieceCanvas = document.getElementById('next-piece');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.linesElement = document.getElementById('lines');
        this.finalScoreElement = document.getElementById('final-score');
        this.gameOverElement = document.getElementById('game-over');
        this.pauseScreenElement = document.getElementById('pause-screen');
        this.restartButton = document.getElementById('restart-button');
        
        // Adjust cell size based on board canvas dimensions
        this.cellSize = this.boardCanvas.width / this.BOARD_WIDTH;
        
        // Game components
        this.board = new Board(this.BOARD_WIDTH, this.BOARD_HEIGHT);
        this.renderer = new Renderer(this.boardCanvas, this.nextPieceCanvas, this.cellSize);
        
        // Game state
        this.currentPiece = null;
        this.nextPiece = null;
        this.gameOver = false;
        this.paused = false;
        this.score = 0;
        this.level = 1;
        this.dropSpeed = this.BASE_SPEED;
        this.lastDropTime = 0;
        this.animatingLinesClear = false;
        
        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        document.addEventListener('keydown', this.handleKeyDown);
        
        // Restart button
        this.restartButton.addEventListener('click', () => this.restart());
        
        // Start the game
        this.init();
    }
    
    /**
     * Initialize the game
     */
    init() {
        this.board.reset();
        this.score = 0;
        this.level = 1;
        this.dropSpeed = this.BASE_SPEED;
        this.gameOver = false;
        this.paused = false;
        
        // Hide game over and pause screens
        this.gameOverElement.classList.add('hidden');
        this.pauseScreenElement.classList.add('hidden');
        
        // Create first pieces
        this.currentPiece = new Tetromino();
        this.nextPiece = new Tetromino();
        
        // Update UI
        this.updateUI();
        
        // Start game loop
        this.lastDropTime = performance.now();
        this.gameLoop();
    }
    
    /**
     * Main game loop
     */
    gameLoop(timestamp) {
        if (this.gameOver) return;
        
        if (!this.paused) {
            // Check if we need to drop the piece
            if (timestamp - this.lastDropTime >= this.dropSpeed) {
                this.dropPiece();
                this.lastDropTime = timestamp;
            }
            
            // Render the game
            this.render();
        }
        
        // Continue the game loop
        requestAnimationFrame(timestamp => this.gameLoop(timestamp));
    }
    
    /**
     * Render the current game state
     */
    render() {
        // If animating line clear, let the renderer handle it
        if (this.animatingLinesClear) {
            const animationComplete = this.renderer.updateLineClearAnimation(this.board);
            if (animationComplete) {
                this.animatingLinesClear = false;
            }
            return;
        }
        
        // Draw the board
        this.renderer.drawBoard(this.board);
        
        // Draw ghost piece (landing position)
        if (this.currentPiece) {
            const ghostPiece = this.currentPiece.getGhostPiece(this.board);
            this.renderer.drawGhostPiece(ghostPiece);
        }
        
        // Draw the current piece
        if (this.currentPiece) {
            this.renderer.drawTetromino(this.currentPiece);
        }
        
        // Draw the next piece preview
        this.renderer.drawNextPiece(this.nextPiece);
    }
    
    /**
     * Update game UI elements
     */
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.linesElement.textContent = this.board.linesCleared;
    }
    
    /**
     * Drop the current piece down one row
     */
    dropPiece() {
        if (!this.currentPiece || this.animatingLinesClear) return;
        
        // Try to move the piece down
        if (!this.board.checkCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
        } else {
            // Piece has landed
            this.landPiece();
        }
    }
    
    /**
     * Handle piece landing
     */
    landPiece() {
        // Merge the current piece into the board
        this.board.mergeTetromino(this.currentPiece);
        
        // Check for cleared lines
        const clearResult = this.board.clearLines();
        
        if (clearResult.clearedLines > 0) {
            // Add score based on number of lines cleared
            this.addScore(clearResult.clearedLines);
            
            // Start line clear animation
            this.animatingLinesClear = true;
            this.renderer.startLineClearAnimation(
                Array.from({ length: clearResult.clearedLines }, (_, i) => this.currentPiece.y + i)
            );
            
            // Check for level up
            this.checkLevelUp();
        }
        
        // Check if game is over
        if (this.board.isGameOver()) {
            this.endGame();
            return;
        }
        
        // Set the next piece as current and create a new next piece
        this.currentPiece = this.nextPiece;
        this.nextPiece = new Tetromino();
    }
    
    /**
     * Add score based on lines cleared
     */
    addScore(clearedLines) {
        // Scoring system: more points for clearing multiple lines at once
        const pointsMap = {
            1: 100,   // Single
            2: 300,   // Double
            3: 500,   // Triple
            4: 800    // Tetris
        };
        
        // Add points with level multiplier
        this.score += (pointsMap[clearedLines] || 0) * this.level;
        this.updateUI();
    }
    
    /**
     * Check if we should increase the level based on lines cleared
     */
    checkLevelUp() {
        const newLevel = Math.floor(this.board.linesCleared / this.LINES_PER_LEVEL) + 1;
        
        if (newLevel > this.level) {
            this.level = newLevel;
            // Increase speed with each level
            this.dropSpeed = this.BASE_SPEED * Math.pow(this.SPEED_FACTOR, this.level - 1);
            this.updateUI();
        }
    }
    
    /**
     * End the game
     */
    endGame() {
        this.gameOver = true;
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.remove('hidden');
    }
    
    /**
     * Restart the game
     */
    restart() {
        this.init();
    }
    
    /**
     * Toggle game pause
     */
    togglePause() {
        this.paused = !this.paused;
        
        if (this.paused) {
            this.pauseScreenElement.classList.remove('hidden');
        } else {
            this.pauseScreenElement.classList.add('hidden');
            this.lastDropTime = performance.now(); // Reset drop timer
        }
    }
    
    /**
     * Move the current piece left or right
     */
    movePiece(offsetX) {
        if (!this.currentPiece || this.paused || this.animatingLinesClear) return;
        
        if (!this.board.checkCollision(this.currentPiece, offsetX, 0)) {
            this.currentPiece.x += offsetX;
        }
    }
    
    /**
     * Rotate the current piece
     */
    rotatePiece() {
        if (!this.currentPiece || this.paused || this.animatingLinesClear) return;
        
        // Perform rotation
        this.currentPiece.rotate();
        
        // Check if rotation causes collision
        if (this.board.checkCollision(this.currentPiece, 0, 0)) {
            // Try to adjust position (wall kick)
            const wallKicks = [-1, 1, -2, 2]; // Try left, right, further left, further right
            
            let validRotation = false;
            for (const kick of wallKicks) {
                if (!this.board.checkCollision(this.currentPiece, kick, 0)) {
                    this.currentPiece.x += kick;
                    validRotation = true;
                    break;
                }
            }
            
            // If still in collision, revert rotation
            if (!validRotation) {
                this.currentPiece.revertRotation();
            }
        }
    }
    
    /**
     * Hard drop the piece (instantly place it at the bottom)
     */
    hardDrop() {
        if (!this.currentPiece || this.paused || this.animatingLinesClear) return;
        
        // Move down until collision
        while (!this.board.checkCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
            // Add a small score bonus for hard drop
            this.score += 2;
        }
        
        // Land the piece
        this.landPiece();
        this.updateUI();
    }
    
    /**
     * Handle keyboard input
     */
    handleKeyDown(event) {
        if (this.gameOver) {
            if (event.code === 'KeyR') {
                this.restart();
            }
            return;
        }
        
        // Handle pause toggle
        if (event.code === 'KeyP') {
            this.togglePause();
            return;
        }
        
        if (this.paused) return;
        
        switch (event.code) {
            case 'ArrowLeft':
                this.movePiece(-1);
                break;
            case 'ArrowRight':
                this.movePiece(1);
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
            case 'ArrowDown':
                this.dropPiece();
                this.score += 1; // Small score bonus for soft drop
                this.updateUI();
                break;
            case 'Space':
                this.hardDrop();
                break;
            case 'KeyR':
                this.restart();
                break;
        }
    }
}

// Start the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new TetrisGame();
});