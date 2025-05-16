class AudioManager {
  constructor() {
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.sounds = {};
    this.muted = false;
    this.bgMusic = null;
    this.bgMusicSource = null;
    this.bgMusicGain = null;
    this.isPlaying = false;
  }

  async loadBackgroundMusic() {
    try {
      const response = await fetch("assets/sounds/background-music.wav");
      const arrayBuffer = await response.arrayBuffer();
      this.bgMusic = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error("Error loading background music:", error);
    }
  }

  playBackgroundMusic() {
    if (this.muted || this.isPlaying) return;

    if (!this.bgMusic) {
      this.loadBackgroundMusic().then(() => this.startBackgroundMusic());
    } else {
      this.startBackgroundMusic();
    }
  }

  startBackgroundMusic() {
    if (!this.bgMusic) return;

    // Create a gain node for volume control
    this.bgMusicGain = this.audioContext.createGain();
    this.bgMusicGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    this.bgMusicGain.connect(this.audioContext.destination);

    // Create and configure the audio source
    this.bgMusicSource = this.audioContext.createBufferSource();
    this.bgMusicSource.buffer = this.bgMusic;
    this.bgMusicSource.connect(this.bgMusicGain);

    // Set up looping
    this.bgMusicSource.loop = true;

    // Start playing
    this.bgMusicSource.start(0);
    this.isPlaying = true;

    // Handle when the music ends (shouldn't happen due to looping, but just in case)
    this.bgMusicSource.onended = () => {
      this.isPlaying = false;
    };
  }

  stopBackgroundMusic() {
    if (this.bgMusicSource && this.isPlaying) {
      // Fade out the music
      this.bgMusicGain.gain.setValueAtTime(
        this.bgMusicGain.gain.value,
        this.audioContext.currentTime
      );
      this.bgMusicGain.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + 0.5
      );

      // Stop the source after the fade out
      setTimeout(() => {
        if (this.bgMusicSource) {
          this.bgMusicSource.stop();
          this.bgMusicSource.disconnect();
          this.bgMusicSource = null;
        }
        if (this.bgMusicGain) {
          this.bgMusicGain.disconnect();
          this.bgMusicGain = null;
        }
        this.isPlaying = false;
      }, 500);
    }
  }

  createSound(frequency, type = "sine", duration = 0.1) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime
    );

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playClick() {
    if (this.muted) return;
    this.createSound(800, "sine", 0.05);
  }

  playSuccess() {
    if (this.muted) return;
    this.createSound(1200, "sine", 0.2);
    setTimeout(() => this.createSound(1400, "sine", 0.2), 200);
  }

  playError() {
    if (this.muted) return;
    this.createSound(400, "sine", 0.2);
    setTimeout(() => this.createSound(300, "sine", 0.2), 200);
  }

  playGameOver() {
    if (this.muted) return;
    this.createSound(300, "sine", 0.2);
    setTimeout(() => this.createSound(200, "sine", 0.2), 200);
    setTimeout(() => this.createSound(100, "sine", 0.2), 400);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
    return this.muted;
  }
}

// Create a global audio manager instance
const audioManager = new AudioManager();
