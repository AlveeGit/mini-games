class Snake {
  constructor(mode, gameManager) {
    this.gameManager = gameManager;
    this.gridSize = 20;
    this.cellSize = 20;
    this.snake = [{ x: 10, y: 10 }];
    this.direction = "right";
    this.food = this.generateFood();
    this.score = 0;
    this.gameOver = false;
    this.speed = 150;
    this.paused = false;
    this.initializeGame();
  }

  initializeGame() {
    const container = document.getElementById("game-container");
    container.innerHTML = `
            <div class="snake-game">
                <canvas id="snake-canvas" width="400" height="400"></canvas>
                <div class="game-controls">
                    <div class="game-status">Score: 0</div>
                    <div class="controls-info">
                        <p>Use arrow keys or WASD to control the snake</p>
                        <p>Press SPACE to pause/resume</p>
                    </div>
                    <div class="mobile-controls">
                        <button class="control-btn" data-direction="up">↑</button>
                        <div class="horizontal-controls">
                            <button class="control-btn" data-direction="left">←</button>
                            <button class="control-btn" data-direction="right">→</button>
                        </div>
                        <button class="control-btn" data-direction="down">↓</button>
                    </div>
                    <button id="restart-btn" class="restart-btn" style="display: none;">
                        <i class="fas fa-redo"></i> Restart Game
                    </button>
                </div>
            </div>
        `;

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
            .snake-game {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
            }
            #snake-canvas {
                border: 2px solid var(--primary-color);
                border-radius: 8px;
                background: var(--card-background);
            }
            .game-controls {
                text-align: center;
            }
            .game-status {
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--primary-color);
                margin-bottom: 1rem;
            }
            .controls-info {
                color: var(--secondary-color);
                margin-bottom: 1rem;
            }
            .controls-info p {
                margin: 0.5rem 0;
            }
            .mobile-controls {
                display: none;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
            }
            .horizontal-controls {
                display: flex;
                gap: 1rem;
            }
            .control-btn {
                background: var(--gradient);
                color: white;
                border: none;
                width: 50px;
                height: 50px;
                border-radius: 8px;
                font-size: 1.5rem;
                cursor: pointer;
                transition: transform 0.2s;
            }
            .control-btn:active {
                transform: scale(0.95);
            }
            @media (max-width: 768px) {
                .mobile-controls {
                    display: flex;
                }
                .controls-info {
                    display: none;
                }
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
                margin: 1rem auto;
                transition: all 0.3s ease;
            }
            .restart-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 8px rgba(74, 144, 226, 0.3);
            }
            .game-over-overlay {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 2rem;
                border-radius: 12px;
                text-align: center;
                display: none;
            }
            .game-over-overlay h3 {
                font-size: 2rem;
                margin-bottom: 1rem;
            }
            .game-over-overlay p {
                font-size: 1.2rem;
                margin-bottom: 1.5rem;
            }
        `;
    document.head.appendChild(style);

    this.canvas = document.getElementById("snake-canvas");
    this.ctx = this.canvas.getContext("2d");

    // Add keyboard controls
    document.addEventListener("keydown", this.handleKeyPress.bind(this));

    // Add mobile controls
    container.querySelectorAll(".control-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.handleDirection(btn.dataset.direction);
      });
    });

    // Add restart button handler
    const restartBtn = document.getElementById("restart-btn");
    restartBtn.addEventListener("click", () => this.restartGame());

    // Start game loop
    this.gameLoop();
  }

  handleKeyPress(event) {
    const key = event.key.toLowerCase();
    const directions = {
      arrowup: "up",
      arrowdown: "down",
      arrowleft: "left",
      arrowright: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
      " ": "pause",
    };

    if (directions[key]) {
      event.preventDefault();
      if (directions[key] === "pause") {
        this.togglePause();
      } else {
        this.handleDirection(directions[key]);
      }
    }
  }

  handleDirection(newDirection) {
    const opposites = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };

    if (opposites[newDirection] !== this.direction) {
      this.direction = newDirection;
    }
  }

  togglePause() {
    this.paused = !this.paused;
    if (!this.paused) {
      this.gameLoop();
    }
  }

  generateFood() {
    let food;
    do {
      food = {
        x: Math.floor(Math.random() * this.gridSize),
        y: Math.floor(Math.random() * this.gridSize),
      };
    } while (
      this.snake.some((segment) => segment.x === food.x && segment.y === food.y)
    );
    return food;
  }

  gameLoop() {
    if (this.gameOver || this.paused) return;

    this.update();
    this.draw();

    setTimeout(() => this.gameLoop(), this.speed);
  }

  update() {
    const head = { ...this.snake[0] };

    switch (this.direction) {
      case "up":
        head.y--;
        break;
      case "down":
        head.y++;
        break;
      case "left":
        head.x--;
        break;
      case "right":
        head.x++;
        break;
    }

    // Check for collisions
    if (this.checkCollision(head)) {
      this.gameOver = true;
      audioManager.playGameOver();
      this.updateStatus(`Game Over! Final Score: ${this.score}`);
      this.gameManager.updateScore(
        "snake",
        "High Score",
        Math.max(
          this.score,
          this.gameManager.scores["snake"]?.["High Score"] || 0
        )
      );
      document.getElementById("restart-btn").style.display = "flex";
      return;
    }

    this.snake.unshift(head);

    // Check if food is eaten
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.food = this.generateFood();
      audioManager.playSuccess();
      this.updateStatus();
      // Increase speed slightly
      this.speed = Math.max(50, this.speed - 2);
    } else {
      this.snake.pop();
    }
  }

  checkCollision(head) {
    // Wall collision
    if (
      head.x < 0 ||
      head.x >= this.gridSize ||
      head.y < 0 ||
      head.y >= this.gridSize
    ) {
      return true;
    }

    // Self collision
    return this.snake.some(
      (segment) => segment.x === head.x && segment.y === head.y
    );
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.ctx.strokeStyle = "#f0f0f0";
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i <= this.gridSize; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.cellSize, 0);
      this.ctx.lineTo(i * this.cellSize, this.canvas.height);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.cellSize);
      this.ctx.lineTo(this.canvas.width, i * this.cellSize);
      this.ctx.stroke();
    }

    // Draw snake
    this.snake.forEach((segment, index) => {
      const gradient = this.ctx.createLinearGradient(
        segment.x * this.cellSize,
        segment.y * this.cellSize,
        (segment.x + 1) * this.cellSize,
        (segment.y + 1) * this.cellSize
      );
      gradient.addColorStop(0, "#4a90e2");
      gradient.addColorStop(1, "#357abd");

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(
        segment.x * this.cellSize + 1,
        segment.y * this.cellSize + 1,
        this.cellSize - 2,
        this.cellSize - 2
      );

      // Draw eyes on head
      if (index === 0) {
        this.ctx.fillStyle = "white";
        const eyeSize = 4;
        const eyeOffset = 5;

        // Position eyes based on direction
        let leftEye = { x: 0, y: 0 };
        let rightEye = { x: 0, y: 0 };

        switch (this.direction) {
          case "right":
            leftEye = {
              x: segment.x * this.cellSize + this.cellSize - eyeOffset,
              y: segment.y * this.cellSize + eyeOffset,
            };
            rightEye = {
              x: segment.x * this.cellSize + this.cellSize - eyeOffset,
              y: segment.y * this.cellSize + this.cellSize - eyeOffset,
            };
            break;
          case "left":
            leftEye = {
              x: segment.x * this.cellSize + eyeOffset,
              y: segment.y * this.cellSize + eyeOffset,
            };
            rightEye = {
              x: segment.x * this.cellSize + eyeOffset,
              y: segment.y * this.cellSize + this.cellSize - eyeOffset,
            };
            break;
          case "up":
            leftEye = {
              x: segment.x * this.cellSize + eyeOffset,
              y: segment.y * this.cellSize + eyeOffset,
            };
            rightEye = {
              x: segment.x * this.cellSize + this.cellSize - eyeOffset,
              y: segment.y * this.cellSize + eyeOffset,
            };
            break;
          case "down":
            leftEye = {
              x: segment.x * this.cellSize + eyeOffset,
              y: segment.y * this.cellSize + this.cellSize - eyeOffset,
            };
            rightEye = {
              x: segment.x * this.cellSize + this.cellSize - eyeOffset,
              y: segment.y * this.cellSize + this.cellSize - eyeOffset,
            };
            break;
        }

        this.ctx.beginPath();
        this.ctx.arc(leftEye.x, leftEye.y, eyeSize, 0, Math.PI * 2);
        this.ctx.arc(rightEye.x, rightEye.y, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    // Draw food
    this.ctx.fillStyle = "#e74c3c";
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * this.cellSize + this.cellSize / 2,
      this.food.y * this.cellSize + this.cellSize / 2,
      this.cellSize / 2 - 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Draw pause overlay
    if (this.paused) {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "white";
      this.ctx.font = "30px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "PAUSED",
        this.canvas.width / 2,
        this.canvas.height / 2
      );
    }

    // Draw game over overlay
    if (this.gameOver) {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "white";
      this.ctx.font = "30px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "GAME OVER",
        this.canvas.width / 2,
        this.canvas.height / 2 - 20
      );
      this.ctx.font = "20px Arial";
      this.ctx.fillText(
        `Score: ${this.score}`,
        this.canvas.width / 2,
        this.canvas.height / 2 + 20
      );
    }
  }

  updateStatus(message) {
    const statusElement = document.querySelector(".game-status");
    if (message) {
      statusElement.textContent = message;
    } else {
      statusElement.textContent = `Score: ${this.score}`;
    }
  }

  restartGame() {
    this.snake = [{ x: 10, y: 10 }];
    this.direction = "right";
    this.food = this.generateFood();
    this.score = 0;
    this.gameOver = false;
    this.speed = 150;
    this.paused = false;
    this.updateStatus("Score: 0");
    document.getElementById("restart-btn").style.display = "none";
    this.gameLoop();
  }

  cleanup() {
    document.removeEventListener("keydown", this.handleKeyPress.bind(this));
    this.gameOver = true;
  }
}
