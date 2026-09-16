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
}
