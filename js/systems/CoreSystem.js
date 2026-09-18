// js/systems/CoreSystem.js
export class CoreSystem {
  constructor(game) {
    this.game = game;
    this.lastTiem = performance.now();
    this.accumulatedTime = 0;
    this.saveInterval = 30000; // Auch bekannt als 30 Sec
    this.lastSaveTime = 0;
  }

  init() {
    this.lastTime = performance.now();
    this.lastSaveTime = this.lastTime;
  }

  update(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.accumlatedTime += deltaTime;

    // Auto-save alle 30 Sec
    if (currentTime - this.lastSaveTime >= this.saveInterval) {
      this.game.saveSyste.save();
      this.lastSaveTime = currentTime;
    }

    // Tick Basierte updates (passives Einkommen, etc.)
    this.updateGameLogic(deltaTime);
  }

  updateGameLogic(deltaTime) {
    const state = this.game.gameState.state;

    if (state.diamondMine.level > 0) {
      const diamondIncome = this.game.mechaicalc.calculateDiamondIncome(state);
      state.diamonds += diamondIncome * (deltaTime / 1000);
    }
  }
  render() {
    this.game.uiSystem.updateDynamicUI();
  }
}
