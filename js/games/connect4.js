class ConnectFour {
  constructor(mode, gameManager) {
    this.gameManager = gameManager;
    this.mode = mode;
    this.rows = 6;
    this.cols = 7;
    this.board = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(null));
    this.currentPlayer = "red";
    this.gameOver = false;
    this.playerScore = 0;
    this.opponentScore = 0;
    this.initializeGame();
  }

  initializeGame() {
    const container = document.getElementById("game-container");
    container.innerHTML = `
            <div class="connect4-game">
                <div class="score-board">
                    <div class="player-score">
                        <h3>${this.mode === "bot" ? "You" : "Player 1"}</h3>
                        <div class="score">0</div>
                    </div>
                    <div class="current-player">
                        <h3>Current Turn</h3>
                        <div class="player-turn">${
                          this.mode === "bot" ? "You" : "Player 1"
                        }</div>
                    </div>
                    <div class="opponent-score">
                        <h3>${
                          this.mode === "bot" ? "Computer" : "Player 2"
                        }</h3>
                        <div class="score">0</div>
                    </div>
                </div>
                <div class="game-board">
                    <div class="board-grid"></div>
                </div>
                <div class="game-controls">
                    <button class="restart-btn">
                        <i class="fas fa-redo"></i> New Game
                    </button>
                </div>
            </div>
        `;

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
            .connect4-game {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2rem;
                width: 100%;
                max-width: 800px;
                margin: 0 auto;
            }
            .score-board {
                display: flex;
                justify-content: space-between;
                width: 100%;
                background: var(--card-background);
                padding: 1.5rem;
                border-radius: 12px;
                box-shadow: var(--shadow);
            }
            .player-score, .opponent-score, .current-player {
                text-align: center;
            }
            .score {
                font-size: 2rem;
                font-weight: bold;
                color: var(--primary-color);
            }
            .player-turn {
                font-size: 2rem;
                font-weight: bold;
                color: var(--accent-color);
            }
            .game-board {
                background: var(--card-background);
                padding: 2rem;
                border-radius: 12px;
                box-shadow: var(--shadow);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .board-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 0.5rem;
                background: #1a73e8;
                padding: 0.5rem;
                border-radius: 8px;
            }
            .cell {
                width: 60px;
                height: 60px;
                background: white;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
            }
            .cell:hover {
                background: #f0f0f0;
            }
            .cell.red {
                background: #e74c3c;
            }
            .cell.yellow {
                background: #f1c40f;
            }
            .cell::before {
                content: '';
                position: absolute;
                top: -4px;
                left: -4px;
                right: -4px;
                bottom: -4px;
                border-radius: 50%;
                border: 2px solid transparent;
                transition: all 0.3s ease;
            }
            .cell:hover::before {
                border-color: rgba(255, 255, 255, 0.3);
            }
            .game-controls {
                margin-top: 1rem;
            }
            .restart-btn {
                background: var(--gradient);
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
            }
            .restart-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 8px rgba(74, 144, 226, 0.3);
            }
            @media (max-width: 768px) {
                .cell {
                    width: 40px;
                    height: 40px;
                }
            }
        `;
    document.head.appendChild(style);

    // Create board cells
    const boardGrid = container.querySelector(".board-grid");
    for (let i = 0; i < this.rows * this.cols; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.col = i % this.cols;
      cell.addEventListener("click", () => this.makeMove(i % this.cols));
      boardGrid.appendChild(cell);
    }

    // Add restart button listener
    container
      .querySelector(".restart-btn")
      .addEventListener("click", () => this.restartGame());
  }

  makeMove(col) {
    if (this.gameOver) return;

    const row = this.getLowestEmptyRow(col);
    if (row === -1) return;

    this.board[row][col] = this.currentPlayer;
    this.updateBoard();

    if (this.checkWin(row, col)) {
      this.handleWin();
      return;
    }

    if (this.checkDraw()) {
      this.handleDraw();
      return;
    }

    this.switchPlayer();

    if (this.mode === "bot" && this.currentPlayer === "yellow") {
      setTimeout(() => this.makeBotMove(), 500);
    }
  }

  getLowestEmptyRow(col) {
    for (let row = this.rows - 1; row >= 0; row--) {
      if (!this.board[row][col]) {
        return row;
      }
    }
    return -1;
  }

  makeBotMove() {
    if (this.gameOver) return;

    // Try to win
    for (let col = 0; col < this.cols; col++) {
      const row = this.getLowestEmptyRow(col);
      if (row !== -1) {
        this.board[row][col] = "yellow";
        if (this.checkWin(row, col)) {
          this.updateBoard();
          this.handleWin();
          return;
        }
        this.board[row][col] = null;
      }
    }

    // Block player's winning move
    for (let col = 0; col < this.cols; col++) {
      const row = this.getLowestEmptyRow(col);
      if (row !== -1) {
        this.board[row][col] = "red";
        if (this.checkWin(row, col)) {
          this.board[row][col] = "yellow";
          this.updateBoard();
          this.switchPlayer();
          return;
        }
        this.board[row][col] = null;
      }
    }

    // Make a random move
    const availableCols = [];
    for (let col = 0; col < this.cols; col++) {
      if (this.getLowestEmptyRow(col) !== -1) {
        availableCols.push(col);
      }
    }

    if (availableCols.length > 0) {
      const randomCol =
        availableCols[Math.floor(Math.random() * availableCols.length)];
      this.makeMove(randomCol);
    }
  }

  updateBoard() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, index) => {
      const row = Math.floor(index / this.cols);
      const col = index % this.cols;
      cell.className = "cell";
      if (this.board[row][col]) {
        cell.classList.add(this.board[row][col]);
      }
    });
  }

  checkWin(row, col) {
    const directions = [
      [
        [0, 1],
        [0, -1],
      ], // horizontal
      [
        [1, 0],
        [-1, 0],
      ], // vertical
      [
        [1, 1],
        [-1, -1],
      ], // diagonal /
      [
        [1, -1],
        [-1, 1],
      ], // diagonal \
    ];

    return directions.some((dir) => {
      const count =
        1 +
        this.countDirection(row, col, dir[0][0], dir[0][1]) +
        this.countDirection(row, col, dir[1][0], dir[1][1]);
      return count >= 4;
    });
  }

  countDirection(row, col, deltaRow, deltaCol) {
    let count = 0;
    let currentRow = row + deltaRow;
    let currentCol = col + deltaCol;
    const player = this.board[row][col];

    while (
      currentRow >= 0 &&
      currentRow < this.rows &&
      currentCol >= 0 &&
      currentCol < this.cols &&
      this.board[currentRow][currentCol] === player
    ) {
      count++;
      currentRow += deltaRow;
      currentCol += deltaCol;
    }

    return count;
  }

  checkDraw() {
    return this.board[0].every((cell) => cell !== null);
  }

  handleWin() {
    this.gameOver = true;
    if (this.currentPlayer === "red") {
      this.playerScore++;
      document.querySelector(".player-score .score").textContent =
        this.playerScore;
      this.gameManager.updateScore("connect4", "Wins", this.playerScore);
    } else {
      this.opponentScore++;
      document.querySelector(".opponent-score .score").textContent =
        this.opponentScore;
      this.gameManager.updateScore("connect4", "Losses", this.opponentScore);
    }
    audioManager.playSuccess();
  }

  handleDraw() {
    this.gameOver = true;
    audioManager.playClick();
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === "red" ? "yellow" : "red";
    document.querySelector(".player-turn").textContent =
      this.mode === "bot"
        ? this.currentPlayer === "red"
          ? "You"
          : "Computer"
        : this.currentPlayer === "red"
        ? "Player 1"
        : "Player 2";
  }

  restartGame() {
    this.board = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(null));
    this.currentPlayer = "red";
    this.gameOver = false;
    this.updateBoard();
    document.querySelector(".player-turn").textContent =
      this.mode === "bot" ? "You" : "Player 1";
  }

  cleanup() {
    const container = document.getElementById("game-container");
    container.querySelectorAll(".cell").forEach((cell) => {
      cell.removeEventListener("click", () => this.makeMove(cell.dataset.col));
    });

    const restartBtn = container.querySelector(".restart-btn");
    if (restartBtn) {
      restartBtn.removeEventListener("click", () => this.restartGame());
    }

    // Reset game state
    this.board = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(null));
    this.currentPlayer = "red";
    this.gameOver = false;
    this.playerScore = 0;
    this.opponentScore = 0;
  }
}
