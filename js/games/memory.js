class MemoryMatch {
  constructor(mode, gameManager) {
    this.gameManager = gameManager;
    this.mode = mode;
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.time = 0;
    this.timer = null;
    this.gameOver = false;
    this.initializeGame();
  }

  initializeGame() {
    const container = document.getElementById("game-container");
    container.innerHTML = `
            <div class="memory-game">
                <div class="game-stats">
                    <div class="stat">
                        <h3>Time</h3>
                        <div class="time">00:00</div>
                    </div>
                    <div class="stat">
                        <h3>Moves</h3>
                        <div class="moves">0</div>
                    </div>
                    <div class="stat">
                        <h3>Pairs</h3>
                        <div class="pairs">0/8</div>
                    </div>
                </div>
                <div class="game-board"></div>
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
            .memory-game {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2rem;
                width: 100%;
                max-width: 800px;
                margin: 0 auto;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            .game-stats {
                display: flex;
                justify-content: space-between;
                width: 100%;
                background: rgba(255, 255, 255, 0.15);
                padding: 1.5rem;
                border-radius: 16px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(5px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .stat {
                text-align: center;
                padding: 0.5rem 1rem;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.1);
                transition: transform 0.3s ease;
            }
            .stat:hover {
                transform: translateY(-2px);
            }
            .stat h3 {
                margin-bottom: 0.5rem;
                color: var(--secondary-color);
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .time, .moves, .pairs {
                font-size: 2rem;
                font-weight: bold;
                color: var(--primary-color);
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .game-board {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                padding: 1.5rem;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(5px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                width: 100%;
                max-width: 600px;
            }
            .card {
                aspect-ratio: 1;
                background: var(--gradient);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                transform-style: preserve-3d;
                position: relative;
                min-width: 80px;
                min-height: 80px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .card:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            }
            .card.flipped {
                transform: rotateY(180deg) translateY(-2px);
            }
            .card-front, .card-back {
                position: absolute;
                width: 100%;
                height: 100%;
                backface-visibility: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 12px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
            }
            .card-front {
                background: var(--gradient);
                transform: rotateY(180deg);
            }
            .card-back {
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(5px);
            }
            .card i {
                font-size: 2rem;
                color: white;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                transition: transform 0.3s ease;
            }
            .card:hover i {
                transform: scale(1.1);
            }
            .card.matched {
                cursor: default;
                pointer-events: none;
                animation: matchedPulse 0.5s ease;
            }
            @keyframes matchedPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            .card.matched .card-front {
                background: linear-gradient(135deg, #4CAF50, #45a049);
                box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
            }
            .card.matched .card-back {
                display: none;
            }
            .game-controls {
                margin-top: 1rem;
            }
            .restart-btn {
                background: var(--gradient);
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 12px;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .restart-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(74, 144, 226, 0.3);
            }
            .restart-btn:active {
                transform: translateY(0);
            }
            .game-over {
                text-align: center;
                padding: 2rem;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 20px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                animation: fadeIn 0.5s ease;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .game-over h2 {
                color: var(--primary-color);
                margin-bottom: 1rem;
                font-size: 2rem;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .game-over p {
                margin: 0.5rem 0;
                color: var(--secondary-color);
                font-size: 1.1rem;
            }
            @media (max-width: 768px) {
                .game-board {
                    grid-template-columns: repeat(3, 1fr);
                    max-width: 400px;
                    padding: 1rem;
                }
                .card {
                    min-width: 60px;
                    min-height: 60px;
                }
                .card i {
                    font-size: 1.5rem;
                }
                .game-stats {
                    flex-direction: column;
                    gap: 1rem;
                }
                .stat {
                    width: 100%;
                }
            }
        `;
    document.head.appendChild(style);

    // Create cards
    this.createCards();

    // Add restart button listener
    container
      .querySelector(".restart-btn")
      .addEventListener("click", () => this.restartGame());

    // Start timer
    this.startTimer();
  }

  createCards() {
    const icons = [
      "fa-heart",
      "fa-star",
      "fa-moon",
      "fa-sun",
      "fa-cloud",
      "fa-bolt",
      "fa-leaf",
      "fa-fire",
    ];

    // Create pairs of cards
    this.cards = [...icons, ...icons]
      .map((icon) => ({ icon, id: Math.random() }))
      .sort(() => Math.random() - 0.5);

    const gameBoard = document.querySelector(".game-board");
    gameBoard.innerHTML = "";

    this.cards.forEach((card, index) => {
      const cardElement = document.createElement("div");
      cardElement.className = "card";
      cardElement.dataset.index = index;
      cardElement.innerHTML = `
                <div class="card-front">
                    <i class="fas ${card.icon}"></i>
                </div>
                <div class="card-back">
                    <i class="fas fa-question"></i>
                </div>
            `;
      cardElement.addEventListener("click", () => this.flipCard(index));
      gameBoard.appendChild(cardElement);
    });
  }

  flipCard(index) {
    if (this.gameOver) return;

    const card = document.querySelector(`.card[data-index="${index}"]`);
    if (
      this.flippedCards.length === 2 ||
      card.classList.contains("flipped") ||
      card.classList.contains("matched")
    ) {
      return;
    }

    card.classList.add("flipped");
    this.flippedCards.push({ index, icon: this.cards[index].icon });

    if (this.flippedCards.length === 2) {
      this.moves++;
      document.querySelector(".moves").textContent = this.moves;
      this.checkMatch();
    }
  }

  checkMatch() {
    const [card1, card2] = this.flippedCards;
    if (card1.icon === card2.icon) {
      this.handleMatch();
    } else {
      this.handleMismatch();
    }
  }

  handleMatch() {
    this.matchedPairs++;
    document.querySelector(".pairs").textContent = `${this.matchedPairs}/8`;

    this.flippedCards.forEach((card) => {
      const cardElement = document.querySelector(
        `.card[data-index="${card.index}"]`
      );
      cardElement.classList.add("matched");
      cardElement.classList.add("flipped");
      // Remove the back face for matched cards
      cardElement.querySelector(".card-back").style.display = "none";
    });

    this.flippedCards = [];
    audioManager.playSuccess();

    if (this.matchedPairs === 8) {
      this.handleGameOver();
    }
  }

  handleMismatch() {
    setTimeout(() => {
      this.flippedCards.forEach((card) => {
        document
          .querySelector(`.card[data-index="${card.index}"]`)
          .classList.remove("flipped");
      });
      this.flippedCards = [];
    }, 1000);
    audioManager.playClick();
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.time++;
      const minutes = Math.floor(this.time / 60);
      const seconds = this.time % 60;
      document.querySelector(".time").textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }, 1000);
  }

  handleGameOver() {
    this.gameOver = true;
    clearInterval(this.timer);
    audioManager.playWin();

    const minutes = Math.floor(this.time / 60);
    const seconds = this.time % 60;
    const timeString = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    const gameBoard = document.querySelector(".game-board");
    gameBoard.innerHTML = `
            <div class="game-over">
                <h2>Congratulations!</h2>
                <p>You completed the game in ${timeString}</p>
                <p>Total moves: ${this.moves}</p>
                <button class="restart-btn">
                    <i class="fas fa-redo"></i> Play Again
                </button>
            </div>
        `;

    gameBoard.querySelector(".restart-btn").addEventListener("click", () => {
      this.restartGame();
    });
  }

  restartGame() {
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.time = 0;
    this.gameOver = false;
    clearInterval(this.timer);

    const gameBoard = document.querySelector(".game-board");
    gameBoard.innerHTML = "";
    document.querySelector(".moves").textContent = "0";
    document.querySelector(".pairs").textContent = "0/8";
    document.querySelector(".time").textContent = "00:00";

    this.createCards();
    this.startTimer();
  }

  cleanup() {
    clearInterval(this.timer);
    const container = document.getElementById("game-container");
    container.innerHTML = "";
  }
}
