// js/systems/InputSystem.js

export class InputSystem {
  constructor(game) {
    this.game = game;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleSmileyClick = this.handleSmileyClick.bind(this);
  }

  init() {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);

    const smileyButton = document.getElementById("smiley_button");

    smileyButton?.addEventListener("click", this.handleSmileyClick);
  }

  handleSmileyClick(event) {
    this.game.klickeSmiley(event);
  }

  handleKeyDown(event) {
    const target = event.target;

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    if (event.code === "Space" || event.key === "Enter") {
      event.preventDefault();
      this.game.klickeSmiley(null);
      this.animateSmileyButton();
      return;
    }

    if (event.key.toLowerCase() === "s") {
      this.game.saveSystem.save();
      this.game.showNotification("💾 Schnellspeicherung!", "success");
    }

    if (event.key === "Shift") {
      this.game.currentBuyAmount = 10;
      this.game.updateBuildingUI();
    }

    if (event.key === "Control") {
      this.game.currentBuyAmount = 100;
      this.game.updateBuildingUI();
    }

    this.handleBuildingHotkey(event);
  }

  handleKeyUp(event) {
    if (event.key === "Shift" || event.key === "Control") {
      this.game.currentBuyAmount = this.game.selectedBuyAmount || 1;

      this.game.updateBuildingUI();
    }
  }

  handleBuildingHotkey(event) {
    if (!event.code.startsWith("Digit")) return;

    const digit = Number(event.code.replace("Digit", ""));
    if (digit < 1 || digit > 9) return;

    this.game.kaufeMehrereGebaeude(digit - 1, this.game.currentBuyAmount);
  }

  animateSmileyButton() {
    const button = document.getElementById("smiley_button");
    if (!button) return;

    button.classList.add("active-key");

    setTimeout(() => {
      button.classList.remove("active-key");
    }, 100);
  }

  destroy() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);

    const smileyButton = document.getElementById("smiley_button");
    smileyButton?.removeEventListener("click", this.handleSmileyClick);
  }

  setupHotkeys() {
    // --- TASTE DRÜCKEN ---
    document.addEventListener("keydown", (e) => {
      // Ignorieren, wenn man gerade schreibt
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      // --- NEU: ESC schließt alle Fenster ---
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay").forEach((modal) => {
          modal.style.display = "none";
        });
      }

      // NEU: Temporärer Kauf-Modifikator (Shift = 10x, Strg = 100x)
      if (e.key === "Shift") {
        this.currentBuyAmount = 10;
        this.highlightToggle(10);
        this.updateBuildingUI();
      }
      if (e.key === "Control") {
        this.currentBuyAmount = 100;
        this.highlightToggle(100);
        this.updateBuildingUI();
      }

      // LEERTASTE = Smiley Klicken
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        this.klickeSmiley(null);

        const btn = this.getById("smiley_button");
        if (btn) {
          btn.classList.add("active-key");
          setTimeout(() => btn.classList.remove("active-key"), 100);
        }
      }

      // 'S' = Speichern
      if (e.key === "s" || e.key === "S") {
        this.saveSystem.save();
        this.showNotification("💾 Schnellspeicherung!", "success");
      }

      // ZAHLEN 1-9 = Gebäude kaufen
      if (e.code.startsWith("Digit")) {
        const digit = parseInt(e.code.replace("Digit", ""));
        if (!isNaN(digit) && digit >= 1 && digit <= 9) {
          const index = digit - 1;
          const maxIndex =
            buildingsData.length +
            (typeof uniqueBuildingsData !== "undefined"
              ? uniqueBuildingsData.length
              : 0);

          if (index < maxIndex) {
            this.kaufeMehrereGebaeude(index, this.currentBuyAmount);

            // Visuelles Feedback
            const buyBtn = this.getById(`buy-btn-${index}`);
            if (buyBtn) {
              buyBtn.style.transform = "scale(0.95)";
              setTimeout(() => (buyBtn.style.transform = "scale(1)"), 100);
            }
          }
        }
      }
    });

    // --- TASTE LOSLASSEN ---
    document.addEventListener("keyup", (e) => {
      // Sobald Shift oder Strg losgelassen wird, kehren wir zum Standard-Wert aus dem Menü zurück
      if (e.key === "Shift" || e.key === "Control") {
        this.currentBuyAmount = this.selectedBuyAmount || 1;
        this.highlightToggle(this.currentBuyAmount);
        this.updateBuildingUI();
      }
    });
  }

  // Hilfsfunktion: Visuelles Highlight bei Tastendruck (Shift/Ctrl)
  highlightToggle(amount) {
    const btns = document.querySelectorAll(".btn-toggle");
    btns.forEach((b) => {
      // Wenn der Button dem gedrückten Key entspricht -> Highlight an
      if (parseInt(b.dataset.amount) === amount) {
        b.classList.add("key-active");
      } else {
        b.classList.remove("key-active");
      }
    });
  }
}
