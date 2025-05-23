/**
 * tetromino.js
 * Contains all tetromino shapes, their colors, and rotation logic
 */

// Define the tetromino shapes and their colors
const SHAPES = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#00FFFF' // Cyan
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#0000FF' // Blue
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#FF7F00' // Orange
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#FFFF00' // Yellow
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#00FF00' // Green
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#800080' // Purple
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#FF0000' // Red
    }
};

// Names of all the tetromino shapes
const SHAPE_NAMES = Object.keys(SHAPES);

class Tetromino {
    constructor(shape = null) {
        // If no shape is provided, randomly select one
        this.type = shape || SHAPE_NAMES[Math.floor(Math.random() * SHAPE_NAMES.length)];
        this.shape = SHAPES[this.type].shape;
        this.color = SHAPES[this.type].color;
        this.rotation = 0;
        
        // Starting position (centered at the top of the board)
        this.x = 3;
        this.y = 0;
        
        // Check if we need to adjust the starting position based on the shape size
        if (this.type === 'I') {
            this.y = -1; // Adjust I piece to appear properly
        }
        
        if (this.type === 'O') {
            this.x = 4; // Center the O piece
        }
    }
    
    /**
     * Returns a copy of the current tetromino's shape matrix
     */
    getShape() {
        return this.shape.map(row => [...row]);
    }
    
    /**
     * Rotates the tetromino clockwise
     */
    rotate() {
        // Save current rotation for reverting if needed
        const originalRotation = this.rotation;
        
        // For O tetromino, no rotation is needed
        if (this.type === 'O') return;
        
        // Perform rotation
        const originalShape = this.getShape();
        const size = originalShape.length;
        let newShape = Array(size).fill().map(() => Array(size).fill(0));
        
        // Transpose and reverse to rotate clockwise
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                newShape[x][size - 1 - y] = originalShape[y][x];
            }
        }
        
        this.shape = newShape;
        this.rotation = (this.rotation + 1) % 4;
    }
    
    /**
     * Reverts the tetromino to its previous rotation
     */
    revertRotation() {
        // If it's an O piece, do nothing
        if (this.type === 'O') return;
        
        // Otherwise, rotate 3 more times to go back to previous state
        for (let i = 0; i < 3; i++) {
            this.rotate();
        }
    }
    
    /**
     * Creates a new tetromino with random shape
     */
    static createRandom() {
        return new Tetromino();
    }
    
    /**
     * Returns the ghost piece (a copy of this piece at its drop position)
     */
    getGhostPiece(board) {
        const ghost = new Tetromino(this.type);
        ghost.x = this.x;
        ghost.y = this.y;
        ghost.shape = this.getShape();
        ghost.rotation = this.rotation;
        
        // Move the ghost down until it collides
        while (!board.checkCollision(ghost, 0, 1)) {
            ghost.y++;
        }
        
        return ghost;
    }
}