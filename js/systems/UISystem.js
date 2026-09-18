// js/systems/UISystem.js
export class UISystem {
  constructor(game) {
    this.game = game;
    this.activeTab = "home";
    this.modals = new Map();
  }

  init() {
    this.setupTabListeners();
    this.setupModalListeners();
  }

  setupTabListeners() {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    document
      .querySelectorAll(".tab-content")
      .forEach((el) => el.classList.add("hidden"));
    document.getElementById(`${tabId}-tab`)?.classList.remove("hidden");
    this.renderTab(tabId);
  }

  renderTab(tabId) {
    switch (tabId) {
      case "buildings":
        this.renderBuildingsTab();
        break;
      case "pets":
        this.renderPetsTab();
        break;
      // ...
    }
  }

  renderBuildingsTab() {
    const container = document.getElementById("buildings-list");
    const buildings = this.game.buildingSystem.getBuildings();
    container.innerHTML = buildings
      .map((b) => this.createBuildingCard(b))
      .join("");
  }

  createBuildingCard(building) {
    const state = this.game.gameState.state;
    const canAfford = state.clickerPoints >= building.cost;
    return `
      <div class="building-card ${canAfford ? "affordable" : ""}">
        <h3>${building.name}</h3>
        <p>Cost: ${building.cost.toLocaleString()}</p>
        <p>Owned: ${building.owned}</p>
        <button onclick="window.smileyGame.buildingSystem.buy('${building.id}')">
          Buy
        </button>
      </div>
    `;
  }

  updateDynamicUI() {
    // Nur die Werte updaten, die sich pro Frame ändern
    document.getElementById("clicker-points")?.textContent = Math.floor(
      this.game.gameState.state.clickerPoints,
    ).toLocaleString();
    // ... ähnliche Updates für andere Ressourcen
  }
}
