class TicTacToe {
  constructor(mode, gameManager) {
    this.gameManager = gameManager;
    this.mode = mode;
    this.board = Array(9).fill("");
    this.currentPlayer = "X";
    this.gameOver = false;
    this.playerXScore = 0;
    this.playerOScore = 0;
    this.initializeGame();
  }

  initializeGame() {
    const container = document.getElementById("game-container");
    container.innerHTML = `
            <div class="tictactoe-game">
                <div class="score-board">
                    <div class="player-score">
                        <h3>${
                          this.mode === "bot" ? "You (X)" : "Player 1 (X)"
                        }</h3>
                        <div class="score">0</div>
                    </div>
                    <div class="current-player">
                        <h3>Current Turn</h3>
                        <div class="player-turn">X</div>
                    </div>
                    <div class="opponent-score">
                        <h3>${
                          this.mode === "bot" ? "Computer (O)" : "Player 2 (O)"
                        }</h3>
                        <div class="score">0</div>
                    </div>
                </div>
                <div class="game-board">
                    ${Array(9)
                      .fill("")
                      .map(
                        (_, index) => `
                        <div class="cell" data-index="${index}"></div>
                    `
                      )
                      .join("")}
                </div>
                <div class="game-status"></div>
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
            .tictactoe-game {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2rem;
                width: 100%;
                max-width: 600px;
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
                display: grid;
                align-items: center;
                justify-content: center;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                background: var(--primary-color);
                padding: 10px;
                border-radius: 12px;
                box-shadow: var(--shadow);
            }
            .cell {
                width: 100px;
                height: 100px;
                background: var(--card-background);
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 3rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                border-radius: 8px;
            }
            .cell:hover {
                background: var(--background-color);
            }
            .cell.x {
                color: var(--primary-color);
            }
            .cell.o {
                color: var(--accent-color);
            }
            .game-status {
                font-size: 1.5rem;
                font-weight: bold;
                text-align: center;
                min-height: 2rem;
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
                    width: 80px;
                    height: 80px;
                    font-size: 2.5rem;
                }
            }
        `;
    document.head.appendChild(style);

    // Add event listeners
    container.querySelectorAll(".cell").forEach((cell) => {
      cell.addEventListener("click", () => this.makeMove(cell));
    });

    container
      .querySelector(".restart-btn")
      .addEventListener("click", () => this.restartGame());
  }

  makeMove(cell) {
    if (this.gameOver || cell.textContent !== "") return;

    const index = parseInt(cell.dataset.index);
    this.board[index] = this.currentPlayer;
    cell.textContent = this.currentPlayer;
    cell.classList.add(this.currentPlayer.toLowerCase());

    if (this.checkWin()) {
      this.handleWin();
    } else if (this.checkDraw()) {
      this.handleDraw();
    } else {
      this.switchPlayer();
      if (this.mode === "bot" && this.currentPlayer === "O") {
        this.makeBotMove();
      }
    }
  }

  makeBotMove() {
    // Simple bot that makes random moves
    const emptyCells = this.board
      .map((cell, index) => (cell === "" ? index : null))
      .filter((cell) => cell !== null);

    if (emptyCells.length > 0) {
      const randomIndex =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const cell = document.querySelector(`.cell[data-index="${randomIndex}"]`);
      this.makeMove(cell);
    }
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    document.querySelector(".player-turn").textContent = this.currentPlayer;
  }

  checkWin() {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];

    return winPatterns.some((pattern) => {
      const [a, b, c] = pattern;
      return (
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      );
    });
  }

  checkDraw() {
    return !this.board.includes("");
  }

  handleWin() {
    this.gameOver = true;
    audioManager.playSuccess();

    if (this.currentPlayer === "X") {
      this.playerXScore++;
      document.querySelector(".player-score .score").textContent =
        this.playerXScore;
    } else {
      this.playerOScore++;
      document.querySelector(".opponent-score .score").textContent =
        this.playerOScore;
    }

    const winner =
      this.mode === "bot"
        ? this.currentPlayer === "X"
          ? "You"
          : "Computer"
        : `Player ${this.currentPlayer === "X" ? "1" : "2"}`;

    document.querySelector(".game-status").textContent = `${winner} wins!`;

    // Update high scores
    if (this.mode === "bot") {
      this.gameManager.updateScore(
        "tictactoe",
        this.currentPlayer === "X" ? "Wins" : "Losses",
        this.currentPlayer === "X" ? this.playerXScore : this.playerOScore
      );
    } else {
      this.gameManager.updateScore(
        "tictactoe",
        `Player ${this.currentPlayer} Wins`,
        this.currentPlayer === "X" ? this.playerXScore : this.playerOScore
      );
    }
  }

  handleDraw() {
    this.gameOver = true;
    audioManager.playClick();
    document.querySelector(".game-status").textContent = "It's a draw!";
  }

  restartGame() {
    this.board = Array(9).fill("");
    this.currentPlayer = "X";
    this.gameOver = false;

    // Reset UI
    document.querySelectorAll(".cell").forEach((cell) => {
      cell.textContent = "";
      cell.classList.remove("x", "o");
    });
    document.querySelector(".game-status").textContent = "";
    document.querySelector(".player-turn").textContent = "X";
  }

  cleanup() {
    // Clean up event listeners if needed
  }
}
