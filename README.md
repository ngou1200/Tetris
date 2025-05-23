# Tetris Game

This is a full-featured implementation of the classic Tetris game built with HTML, CSS, and JavaScript.

## Features

- Classic Tetris gameplay with all 7 standard tetromino shapes
- Score tracking and level progression
- Increasing difficulty as levels advance
- Game controls:
  - **Left/Right arrows:** Move piece horizontally
  - **Down arrow:** Soft drop (accelerate downward)
  - **Up arrow:** Rotate piece clockwise
  - **Space:** Hard drop (instant placement)
  - **P:** Pause/resume game
  - **R:** Restart game
- Next piece preview
- Line clear animations
- Game over detection

## Folder Structure

tetris/ ├── index.html # Main HTML page ├── css/ │ └── style.css # Game styling ├── js/ │ ├── game.js # Main game logic │ ├── tetromino.js # Tetromino shapes and behavior │ ├── board.js # Game board logic │ └── renderer.js # Canvas rendering └── README.md # This file

Code

## How to Play

1. Open `index.html` in a web browser to start the game.
2. Use the controls listed above to play.
3. Clear lines to score points and advance levels.
4. The game ends when pieces stack to the top of the board.

## Implementation Details

This Tetris implementation follows classic game mechanics with a modern HTML5 Canvas-based renderer. The code is organized into modular components for maintainability:

- **game.js:** Controls game state, main loop, and input handling
- **tetromino.js:** Defines all tetromino shapes and their rotation patterns
- **board.js:** Manages the game grid, collision detection, and line clearing
- **renderer.js:** Handles all visual rendering of game elements

## License

Feel free to use, modify, and distribute this game code.

**Happy gaming!**
