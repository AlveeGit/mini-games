class RockPaperScissors {
  constructor(mode, gameManager) {
    this.gameManager = gameManager;
    this.mode = mode;
    this.playerScore = 0;
    this.opponentScore = 0;
    this.rounds = 0;
    this.maxRounds = 5;
    this.currentPlayer = 1; // For two-player mode
    this.player1Choice = null;
    this.player2Choice = null;
    this.roundHistory = [];
    this.gameOver = false;
    this.initializeGame();
  }

  initializeGame() {
    const container = document.getElementById("game-container");
    container.innerHTML = `
            <div class="rps-game">
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
                <div class="game-area">
                    <div class="choices">
                        <button class="choice-btn" data-choice="rock">
                            <i class="fas fa-hand-rock"></i>
                            <span>Rock</span>
                        </button>
                        <button class="choice-btn" data-choice="paper">
                            <i class="fas fa-hand-paper"></i>
                            <span>Paper</span>
                        </button>
                        <button class="choice-btn" data-choice="scissors">
                            <i class="fas fa-hand-scissors"></i>
                            <span>Scissors</span>
                        </button>
                    </div>
                    <div class="result-area">
                        <div class="player-choice">
                            <h3>${
                              this.mode === "bot" ? "Your Choice" : "Player 1"
                            }</h3>
                            <div class="choice-display"></div>
                        </div>
                        <div class="vs">VS</div>
                        <div class="opponent-choice">
                            <h3>${
                              this.mode === "bot" ? "Computer" : "Player 2"
                            }</h3>
                            <div class="choice-display"></div>
                        </div>
                    </div>
                    <div class="round-result"></div>
                </div>
                <div class="round-history">
                    <h3>Round History</h3>
                    <div class="history-list"></div>
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
            .rps-game {
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
            .game-area {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }
            .choices {
                display: flex;
                justify-content: center;
                gap: 1rem;
            }
            .choice-btn {
                background: var(--card-background);
                border: none;
                padding: 1.5rem;
                border-radius: 12px;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
                box-shadow: var(--shadow);
            }
            .choice-btn:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            }
            .choice-btn i {
                font-size: 2rem;
                color: var(--primary-color);
            }
            .choice-btn span {
                font-size: 1rem;
                font-weight: 500;
            }
            .result-area {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: var(--card-background);
                padding: 2rem;
                border-radius: 12px;
                box-shadow: var(--shadow);
            }
            .player-choice, .opponent-choice {
                text-align: center;
                flex: 1;
            }
            .choice-display {
                font-size: 3rem;
                margin-top: 1rem;
                min-height: 4rem;
            }
            .vs {
                font-size: 2rem;
                font-weight: bold;
                color: var(--accent-color);
                padding: 0 2rem;
            }
            .round-result {
                text-align: center;
                font-size: 1.5rem;
                font-weight: bold;
                min-height: 2rem;
            }
            .round-history {
                width: 100%;
                background: var(--card-background);
                padding: 1.5rem;
                border-radius: 12px;
                box-shadow: var(--shadow);
            }
            .history-list {
                margin-top: 1rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
                max-height: 300px;
                overflow-y: auto;
                padding-right: 0.5rem;
            }
            .history-item {
                background: var(--background-color);
                border-radius: 8px;
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                animation: slideIn 0.3s ease;
            }
            .history-round {
                font-weight: bold;
                color: var(--primary-color);
                font-size: 1.1rem;
            }
            .history-choices {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
            }
            .history-choice {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
            }
            .history-choice i {
                font-size: 2rem;
            }
            .history-choice.player1 i {
                color: var(--primary-color);
            }
            .history-choice.player2 i {
                color: var(--accent-color);
            }
            .history-vs {
                color: var(--secondary-color);
                font-weight: bold;
            }
            .history-result {
                text-align: center;
                font-weight: bold;
                padding: 0.5rem;
                border-radius: 4px;
                margin-top: 0.5rem;
            }
            .history-result.win {
                background: rgba(46, 204, 113, 0.2);
                color: #2ecc71;
            }
            .history-result.lose {
                background: rgba(231, 76, 60, 0.2);
                color: #e74c3c;
            }
            .history-result.tie {
                background: rgba(241, 196, 15, 0.2);
                color: #f1c40f;
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
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @media (max-width: 768px) {
                .choices {
                    flex-direction: column;
                }
                .result-area {
                    flex-direction: column;
                    gap: 1rem;
                }
                .vs {
                    padding: 1rem 0;
                }
                .history-choices {
                    flex-direction: column;
                }
                .history-vs {
                    padding: 0.5rem 0;
                }
            }
        `;
    document.head.appendChild(style);

    // Add event listeners
    container.querySelectorAll(".choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.makeChoice(btn.dataset.choice));
    });

    container
      .querySelector(".restart-btn")
      .addEventListener("click", () => this.restartGame());
  }

  makeChoice(choice) {
    if (this.gameOver) return;

    if (this.mode === "bot") {
      this.playAgainstBot(choice);
    } else {
      this.playTwoPlayer(choice);
    }
  }

  playAgainstBot(playerChoice) {
    // Disable all choice buttons
    this.disableChoiceButtons();

    const choices = ["rock", "paper", "scissors"];
    const botChoice = choices[Math.floor(Math.random() * 3)];

    this.showResult(playerChoice, botChoice);
  }

  playTwoPlayer(choice) {
    if (this.currentPlayer === 1) {
      this.player1Choice = choice;
      document.querySelector(
        ".player-choice .choice-display"
      ).innerHTML = `<i class="fas fa-question"></i>`;
      document.querySelector(".player-turn").textContent = "Player 2";
      this.currentPlayer = 2;
    } else {
      this.player2Choice = choice;
      // Disable all choice buttons
      this.disableChoiceButtons();
      this.showResult(this.player1Choice, this.player2Choice);
    }
  }

  disableChoiceButtons() {
    document.querySelectorAll(".choice-btn").forEach((btn) => {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
    });
  }

  enableChoiceButtons() {
    document.querySelectorAll(".choice-btn").forEach((btn) => {
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    });
  }

  showResult(playerChoice, opponentChoice) {
    const playerDisplay = document.querySelector(
      ".player-choice .choice-display"
    );
    const opponentDisplay = document.querySelector(
      ".opponent-choice .choice-display"
    );
    const resultDisplay = document.querySelector(".round-result");

    // Show choices
    playerDisplay.innerHTML = `<i class="fas fa-hand-${playerChoice}"></i>`;
    opponentDisplay.innerHTML = `<i class="fas fa-hand-${opponentChoice}"></i>`;

    // Determine winner
    const result = this.determineWinner(playerChoice, opponentChoice);

    // Update scores
    if (result === "win") {
      this.playerScore++;
      document.querySelector(".player-score .score").textContent =
        this.playerScore;
    } else if (result === "lose") {
      this.opponentScore++;
      document.querySelector(".opponent-score .score").textContent =
        this.opponentScore;
    }

    // Show result
    const resultText =
      this.mode === "bot"
        ? result === "win"
          ? "You win!"
          : result === "lose"
          ? "Computer wins!"
          : "It's a tie!"
        : result === "win"
        ? "Player 1 wins!"
        : result === "lose"
        ? "Player 2 wins!"
        : "It's a tie!";

    resultDisplay.textContent = resultText;

    // Add to history
    this.addToHistory(playerChoice, opponentChoice, result);

    // Play sound
    if (result === "win") {
      audioManager.playSuccess();
    } else if (result === "lose") {
      audioManager.playGameOver();
    } else {
      audioManager.playClick();
    }

    // Update high scores
    if (this.mode === "bot") {
      this.gameManager.updateScore(
        "rps",
        result === "win" ? "Wins" : result === "lose" ? "Losses" : "Ties",
        result === "win"
          ? this.playerScore
          : result === "lose"
          ? this.opponentScore
          : 0
      );
    } else {
      this.gameManager.updateScore(
        "rps",
        `${result === "win" || result === "lose" ? "Player " : ""} ${
          result === "win" ? "1" : result === "lose" ? "2" : "Tie"
        } `,
        result === "win"
          ? this.playerScore
          : result === "lose"
          ? this.opponentScore
          : 0
      );
    }

    // Check if game is over
    this.rounds++;
    if (this.rounds >= this.maxRounds) {
      this.gameOver = true;
      setTimeout(() => this.showFinalResult(), 3000);
      return;
    }

    // Reset for next round
    setTimeout(() => {
      if (!this.gameOver) {
        this.currentPlayer = 1;
        this.player1Choice = null;
        this.player2Choice = null;

        // Clear displays
        playerDisplay.innerHTML = "";
        opponentDisplay.innerHTML = "";
        resultDisplay.textContent = "";

        // Update turn display
        document.querySelector(".player-turn").textContent =
          this.mode === "bot" ? "You" : "Player 1";

        // Re-enable choice buttons for next round
        this.enableChoiceButtons();
      }
    }, 3000);
  }

  showFinalResult() {
    const scoreBoard = document.querySelector(".score-board");
    const resultDisplay = document.querySelector(".round-result");

    // Hide the current turn display
    document.querySelector(".current-player").style.display = "none";

    // Show final result
    let finalResult;
    if (this.playerScore > this.opponentScore) {
      finalResult =
        this.mode === "bot" ? "You won the game!" : "Player 1 won the game!";
    } else if (this.opponentScore > this.playerScore) {
      finalResult =
        this.mode === "bot"
          ? "Computer won the game!"
          : "Player 2 won the game!";
    } else {
      finalResult = "It's a tie!";
    }

    resultDisplay.textContent = finalResult;
    resultDisplay.style.fontSize = "2rem";
    resultDisplay.style.color = "var(--accent-color)";

    // Store timeout reference for cleanup
    this.finalResultTimeout = setTimeout(() => {
      // Any final result cleanup if needed
    }, 3000);
  }

  restartGame() {
    // Reset game state
    this.playerScore = 0;
    this.opponentScore = 0;
    this.rounds = 0;
    this.currentPlayer = 1;
    this.player1Choice = null;
    this.player2Choice = null;
    this.roundHistory = [];
    this.gameOver = false;

    // Reset UI
    document.querySelector(".player-score .score").textContent = "0";
    document.querySelector(".opponent-score .score").textContent = "0";
    document.querySelector(".player-choice .choice-display").innerHTML = "";
    document.querySelector(".opponent-choice .choice-display").innerHTML = "";
    document.querySelector(".round-result").textContent = "";
    document.querySelector(".round-result").style = "";
    document.querySelector(".player-turn").textContent =
      this.mode === "bot" ? "You" : "Player 1";
    document.querySelector(".history-list").innerHTML = "";
    document.querySelector(".current-player").style.display = "block";

    // Re-enable choice buttons
    this.enableChoiceButtons();

    // Reset game manager scores
    this.gameManager.scores.rps = {};
    this.gameManager.saveScores();
    this.gameManager.updateScoreDisplay();
  }

  addToHistory(playerChoice, opponentChoice, result) {
    const historyList = document.querySelector(".history-list");
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    const roundNumber = this.rounds;
    const resultClass =
      result === "win" ? "win" : result === "lose" ? "lose" : "tie";

    historyItem.innerHTML = `
        <div class="history-round">Round ${roundNumber}</div>
        <div class="history-choices">
            <div class="history-choice ${
              this.mode === "bot" ? "player" : "player1"
            }">
                <i class="fas fa-hand-${playerChoice}"></i>
                <span>${this.mode === "bot" ? "You" : "P1"}</span>
            </div>
            <div class="history-vs">vs</div>
            <div class="history-choice ${
              this.mode === "bot" ? "bot" : "player2"
            }">
                <i class="fas fa-hand-${opponentChoice}"></i>
                <span>${this.mode === "bot" ? "Bot" : "P2"}</span>
            </div>
        </div>
        <div class="history-result ${resultClass}">
            ${
              result === "win"
                ? this.mode === "bot"
                  ? "You Win!"
                  : "P1 Wins!"
                : result === "lose"
                ? this.mode === "bot"
                  ? "Bot Wins!"
                  : "P2 Wins!"
                : "Tie!"
            }
        </div>
    `;

    historyList.insertBefore(historyItem, historyList.firstChild);
  }

  determineWinner(playerChoice, opponentChoice) {
    if (playerChoice === opponentChoice) return "tie";

    const winConditions = {
      rock: "scissors",
      paper: "rock",
      scissors: "paper",
    };

    return winConditions[playerChoice] === opponentChoice ? "win" : "lose";
  }

  cleanup() {
    // Remove event listeners
    const container = document.getElementById("game-container");
    container.querySelectorAll(".choice-btn").forEach((button) => {
      button.removeEventListener("click", () =>
        this.makeChoice(button.dataset.choice)
      );
    });

    const restartBtn = container.querySelector(".restart-btn");
    if (restartBtn) {
      restartBtn.removeEventListener("click", () => this.restartGame());
    }

    // Clear any timeouts
    if (this.resultTimeout) {
      clearTimeout(this.resultTimeout);
    }
    if (this.finalResultTimeout) {
      clearTimeout(this.finalResultTimeout);
    }

    // Reset game state
    this.playerScore = 0;
    this.opponentScore = 0;
    this.rounds = 0;
    this.currentPlayer = 1;
    this.player1Choice = null;
    this.player2Choice = null;
    this.roundHistory = [];
    this.gameOver = false;
  }
}
