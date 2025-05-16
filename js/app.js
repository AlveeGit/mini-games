class GameManager {
  constructor() {
    this.currentGame = null;
    this.currentMode = null;
    this.scores = this.loadScores();
    this.initializeEventListeners();
    this.initializeMuteButton();
  }

  initializeEventListeners() {
    // Game card click handlers
    document.querySelectorAll(".game-card").forEach((card) => {
      card.querySelectorAll(".mode-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const game = card.dataset.game;
          const mode = btn.dataset.mode;
          this.startGame(game, mode);
        });
      });
    });

    // Back button handler
    document.getElementById("back-btn").addEventListener("click", () => {
      this.returnToMenu();
    });
  }

  initializeMuteButton() {
    const muteBtn = document.getElementById("mute-btn");
    muteBtn.addEventListener("click", () => {
      const isMuted = audioManager.toggleMute();
      muteBtn.innerHTML = isMuted
        ? '<i class="fas fa-volume-mute"></i>'
        : '<i class="fas fa-volume-up"></i>';
    });
  }

  startGame(game, mode) {
    audioManager.playClick();
    this.currentGame = game;
    this.currentMode = mode;

    // Clear previous game
    if (this.currentGameInstance) {
      this.currentGameInstance.cleanup();
    }

    // Reset scores for the current game
    if (this.scores[game]) {
      delete this.scores[game];
      this.saveScores();
    }

    // Update UI
    document.getElementById("home-screen").classList.remove("active");
    document.getElementById("game-screen").classList.add("active");
    document.getElementById("game-title").textContent = this.getGameTitle(game);

    // Start background music
    audioManager.playBackgroundMusic();

    // Initialize the selected game
    switch (game) {
      case "tictactoe":
        this.currentGameInstance = new TicTacToe(mode, this);
        break;
      case "snake":
        this.currentGameInstance = new Snake(mode, this);
        break;
      case "rps":
        this.currentGameInstance = new RockPaperScissors(mode, this);
        break;
      case "connect4":
        this.currentGameInstance = new ConnectFour(mode, this);
        break;
      case "memory":
        this.currentGameInstance = new MemoryMatch(mode, this);
        break;
    }

    // Update score display
    this.updateScoreDisplay();
  }

  returnToMenu() {
    audioManager.playClick();
    if (this.currentGameInstance) {
      this.currentGameInstance.cleanup();
    }
    document.getElementById("game-screen").classList.remove("active");
    document.getElementById("home-screen").classList.add("active");
    this.currentGame = null;
    this.currentMode = null;
    this.currentGameInstance = null;

    // Stop background music
    audioManager.stopBackgroundMusic();
  }

  updateScore(game, player, score) {
    if (!this.scores[game]) {
      this.scores[game] = {};
    }
    if (!this.scores[game][player]) {
      this.scores[game][player] = 0;
    }
    this.scores[game][player] = score;
    this.saveScores();
    this.updateScoreDisplay();
  }

  updateScoreDisplay() {
    const scoreDisplay = document.getElementById("score-display");
    const currentGame = this.currentGame;
    const scores = this.scores[currentGame] || {};

    // Clear previous scores
    scoreDisplay.innerHTML = "";

    // Create score elements
    const scoreElements = Object.entries(scores).map(([key, value]) => {
      const scoreElement = document.createElement("div");
      scoreElement.className = "score-item";
      scoreElement.textContent = `${key}: ${value}`;
      return scoreElement;
    });

    // Add scores to display
    scoreElements.forEach((element) => {
      scoreDisplay.appendChild(element);
    });

    // Add animation class
    scoreDisplay.classList.add("score-update");
    setTimeout(() => {
      scoreDisplay.classList.remove("score-update");
    }, 500);
  }

  getGameTitle(game) {
    const titles = {
      tictactoe: "Tic Tac Toe",
      snake: "Snake",
      rps: "Rock Paper Scissors",
      connect4: "Connect Four",
      memory: "Memory Match",
    };
    return titles[game] || game;
  }

  loadScores() {
    const savedScores = localStorage.getItem("gameScores");
    return savedScores ? JSON.parse(savedScores) : {};
  }

  saveScores() {
    localStorage.setItem("gameScores", JSON.stringify(this.scores));
  }
}

// Initialize the game manager when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.gameManager = new GameManager();
});
