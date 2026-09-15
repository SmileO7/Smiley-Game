// js/systems/SoundSystem.js

// ================================================================================================================
// === SUB-SYSTEM: AUDIO & SFX (Retro Synthesizer) ===
// ================================================================================================================

export class SoundSystem {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.ctx = null; // AudioContext
    this.masterGain = null;
    this.sfxVolume = 0.5;
    this.musicVolume = 0.3;
    this.init();
    console.log("🔊 SoundSystem (Arcade Synth) geladen.");
  }

  init() {
    // Lautstärke laden
    const storedSfx = localStorage.getItem("soundVolume");
    if (storedSfx !== null) this.sfxVolume = parseInt(storedSfx) / 100;

    // AudioContext darf erst nach User-Interaktion starten (Browser-Regel)
    window.addEventListener("mousedown", () => this.checkContext(), {
      once: true,
    });
    window.addEventListener("keydown", () => this.checkContext(), {
      once: true,
    });
  }

  checkContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    } else if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playClickSound() {
    if (!this.clickSound) return;

    // Lautstärke anpassen (0.0 bis 1.0)
    this.clickSound.volume = this.sfxVolume / 100;

    // Sound zurückspulen, damit man schnell hintereinander klicken kann
    this.clickSound.currentTime = 0;

    // Abspielen mit Fehler-Abfangung (Browser blockieren Autoplay manchmal)
    this.clickSound.play().catch((e) => {
      // Ignorieren oder Loggen, wenn Audio noch nicht erlaubt ist
      // console.warn("Audio konnte nicht abgespielt werden:", e);
    });
  }

  // Hilfsfunktion: Spielt einen Ton
  playTone(freq, type, duration, volRel = 1.0, slideTo = null) {
    if (!this.ctx || this.sfxVolume <= 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type; // 'sine', 'square', 'triangle', 'sawtooth'
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Pitch-Slide Effekt (z.B. für "Pew"-Sounds)
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(
        slideTo,
        this.ctx.currentTime + duration,
      );
    }

    const vol = this.sfxVolume * volRel;
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.ctx.currentTime + duration,
    );

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // --- DIE SOUND EFFEKTE ---

  playClick() {
    // Sanftes "Plop"
    this.playTone(400, "sine", 0.1, 0.5, 200);
  }

  playCrit() {
    // Wuchtigeres "Zack!"
    this.playTone(150, "square", 0.15, 0.4, 50);
    setTimeout(() => this.playTone(200, "sawtooth", 0.1, 0.2), 10); // Layering
  }

  playBuy() {
    // Klassisches "Ka-Ching" (Münze)
    this.playTone(1200, "sine", 0.1, 0.4);
    setTimeout(() => this.playTone(2000, "sine", 0.2, 0.4), 80);
  }

  playError() {
    // Dumpfes "Buzz"
    this.playTone(150, "sawtooth", 0.2, 0.3, 100);
  }

  playLevelUp() {
    // Fanfare "Ta-Da!"
    this.playTone(440, "triangle", 0.1, 0.4); // A4
    setTimeout(() => this.playTone(554, "triangle", 0.1, 0.4), 100); // C#5
    setTimeout(() => this.playTone(659, "triangle", 0.2, 0.4), 200); // E5
    setTimeout(() => this.playTone(880, "square", 0.4, 0.3, 1200), 300); // A5 (lang)
  }

  playLegendary() {
    // Epischer Sound für Artefakte/Legendäres
    [300, 400, 500, 600, 800].forEach((f, i) => {
      setTimeout(() => this.playTone(f, "sine", 0.3, 0.3), i * 60);
    });
  }

  updateVolume(val) {
    this.sfxVolume = val / 100;
    this.checkContext();
  }

  // --- AUDIO SYNTHESIZER ---
  playTone(freq, type, duration, volMult = 1.0) {
    const soundVolumeSlider = this.getById("sound-volume");
    const volume = soundVolumeSlider
      ? parseInt(soundVolumeSlider.value) / 100
      : 0.5;
    if (volume <= 0) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!this.audioCtx) this.audioCtx = new AudioContext();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

    gain.gain.setValueAtTime(volume * volMult, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioCtx.currentTime + duration,
    );

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  playClickSound() {
    this.soundSystem.playClickSound();
  }

  playAchievementSound() {
    this.soundSystem.playAchievementSound();
  }

  playLevelUpSound() {
    this.soundSystem.playLevelUp();
  }

  playBuySound() {
    this.playTone(1200, "sine", 0.05, 0.3);
  }

  ladeAudioEinstellungen() {
    // 1. Audio laden
    const musicVolume = localStorage.getItem("musicVolume");
    const soundVolume = localStorage.getItem("soundVolume");
    const musicSlider = this.getById("music-volume");
    const soundSlider = this.getById("sound-volume");

    if (musicSlider && musicVolume !== null) musicSlider.value = musicVolume;
    if (soundSlider && soundVolume !== null) soundSlider.value = soundVolume;
    this.setzeLautstaerke();

    // 2. Benachrichtigungen laden (DAS HIER IST WICHTIG)
    const toastSetting = localStorage.getItem("setting_toasts");
    const desktopSetting = localStorage.getItem("setting_desktop");

    const toastCheck = this.getById("setting-toast-toggle");
    const desktopCheck = this.getById("setting-desktop-toggle");

    // Standard: Toasts AN (true), wenn noch nichts gespeichert wurde
    this.settingsToasts =
      toastSetting === null ? true : toastSetting === "true";
    this.settingsDesktop = desktopSetting === "true";

    if (toastCheck) toastCheck.checked = this.settingsToasts;
    if (desktopCheck) desktopCheck.checked = this.settingsDesktop;
  }

  setzeLautstaerke() {
    const musicVolume =
      parseFloat(localStorage.getItem("musicVolume") || 100) / 100;
    const soundVolume =
      parseFloat(localStorage.getItem("soundVolume") || 100) / 100;
    const musicPlayer = this.getById("background-music");
    if (musicPlayer) musicPlayer.volume = musicVolume;
    // Klick-Sound wird live generiert, nutzt soundVolume direkt beim Abspielen
  }
}
