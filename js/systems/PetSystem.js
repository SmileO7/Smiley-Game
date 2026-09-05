// js/systems/PetSystem.js

// ================================================================================================================
// === SUB-SYSTEM: PET SYSTEM ===
// ================================================================================================================
// ================================================================================================================
// === SUB-SYSTEM: PET SYSTEM ===
// ================================================================================================================
// ================================================================================================================
// === SUB-SYSTEM: PET SYSTEM ===
// ================================================================================================================

export class PetSystem {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.petAutoClickTimer = null;
    console.log("🐶 PetSystem geladen.");
  }

  calculatePetStat(pet, currentLevel) {
    const nextLevel = currentLevel + 1;
    const baseCost = pet.levelCost;
    const growth = pet.costGrowth;
    let nextCost = 0;
    if (nextLevel <= pet.maxLevel) {
      nextCost = Math.floor(baseCost * Math.pow(growth, currentLevel));
    }
    const currentEffect = pet.baseEffect * (1 + currentLevel * 0.1);
    return {
      nextCost: nextCost,
      currentEffect: currentEffect,
      isMaxLevel: currentLevel >= pet.maxLevel,
    };
  }

  levelUpPet(petId) {
    const state = this.game.gameState;
    if (!state.petsUnlocked) return;

    const pet = petsData.find((p) => p.id === petId);
    if (!pet) return;

    const currentLevel = state.petLevels[petId] || 0;
    const stats = this.calculatePetStat(pet, currentLevel);

    if (stats.isMaxLevel) return;

    if (state.diamanten < stats.nextCost) {
      this.game.showNotification(`💎 Nicht genug Diamanten!`, "error");
      return;
    }

    state.diamanten -= stats.nextCost;
    state.petLevels[petId] = currentLevel + 1;

    // Automatisch aktivieren, wenn es das erste Level ist
    if (currentLevel === 0) this.activatePet(petId);

    this.game.applyAllBoni();
    this.game.updateUI(); // Ruft updatePetButtons auf
    this.renderPetShop();
    this.game.speichereSpiel();
  }

  activatePet(petId) {
    const state = this.game.gameState;
    if ((state.petLevels[petId] || 0) <= 0) return;

    if (state.activePet === petId) {
      state.activePet = null;
    } else {
      state.activePet = petId;
    }

    this.game.applyAllBoni();
    this.updatePetInterval();
    this.game.updateUI();
    this.renderPetShop();
    this.game.updateGlobalUpgradeUI();
    this.game.speichereSpiel();
  }

  updatePetInterval() {
    if (this.petAutoClickTimer !== null) {
      clearInterval(this.petAutoClickTimer);
      this.petAutoClickTimer = null;
    }

    const activePetId = this.game.gameState.activePet;
    if (!activePetId) return;

    const petDetails = petsData.find((p) => p.id === activePetId);
    // Beispiel für Auto-Clicker Pet (Hund)
    if (petDetails && petDetails.id === "pet_dog") {
      const currentLevel = this.game.gameState.petLevels["pet_dog"] || 1;
      const clicksPerSecond = currentLevel;
      const intervalDuration = 1000 / clicksPerSecond;

      this.petAutoClickTimer = setInterval(() => {
        this.game.klickeSmiley(null);
      }, intervalDuration);
    }
  }

  // --- RENDERING & UI ---

  renderPetShop() {
    const petGrid = this.game.getById("pet-shop-grid");
    const lockMessage = this.game.getById("pet-lock-message");
    const state = this.game.gameState;

    if (!petGrid) return;

    // 1. Gesperrt?
    if (!state.petsUnlocked) {
      petGrid.style.display = "none";
      if (lockMessage) {
        lockMessage.style.display = "block";
        lockMessage.innerHTML = `
                    <div style="font-size:3rem; margin-bottom:10px;">🔒</div>
                    <h3>Zutritt verweigert</h3>
                    <p>Du musst erst die <strong>"Pet Shop Lizenz"</strong> im Prestige-Shop erwerben!</p>
                    <p style="font-size:0.8rem; color:#aaa; margin-top:5px;">(Prestige Upgrade ID 6)</p>
                `;
      }
      return;
    }

    // 2. Offen
    if (lockMessage) lockMessage.style.display = "none";
    petGrid.style.display = "grid";
    petGrid.innerHTML = "";

    petsData.forEach((pet) => {
      const petDiv = document.createElement("div");
      const isActive = state.activePet === pet.id;
      const currentLevel = state.petLevels[pet.id] || 0;
      const isBought = currentLevel > 0;

      const stats = this.calculatePetStat(pet, currentLevel);
      // Effekt-Wert schön formatieren (x100 für Prozent, außer bei Auto-Click)
      const effectValue = (
        stats.currentEffect * (pet.effectType === "auto_click" ? 1 : 100)
      ).toFixed(1);

      petDiv.className = `pet-item ${isActive ? "active" : ""} ${isBought ? "bought" : ""}`;
      petDiv.dataset.id = pet.id;

      // Kauf-Button
      let btnHtml = "";
      if (currentLevel >= pet.maxLevel) {
        btnHtml = `<button disabled style="background:#444; color:#888; border:none;">MAX LEVEL</button>`;
      } else {
        const canAfford = state.diamanten >= stats.nextCost;
        const btnText = isBought
          ? `Level Up (${stats.nextCost} 💎)`
          : `Adoptieren (${stats.nextCost} 💎)`;
        const btnColor = canAfford ? "var(--color-accent-blue)" : "#ff5252";

        btnHtml = `
                    <button class="btn-buy-pet" data-id="${pet.id}" ${canAfford ? "" : "disabled"} 
                            style="border: 1px solid ${btnColor}; color: ${canAfford ? "#fff" : "#aaa"}; background: rgba(0,0,0,0.3);">
                        ${btnText}
                    </button>
                `;
      }

      // Ausrüsten-Button
      let equipHtml = "";
      if (isBought) {
        equipHtml = `
                    <button class="btn-pet-activate" data-id="${pet.id}" 
                            style="background: ${isActive ? "#f44336" : "#4CAF50"}; border:none;">
                        ${isActive ? "Zurückrufen" : "Auswählen"}
                    </button>
                `;
      } else {
        equipHtml = `<button disabled style="opacity:0.3; border:none;">Gesperrt</button>`;
      }

      petDiv.innerHTML = `
                <div class="pet-icon">${pet.icon}</div>
                <div class="pet-name">${pet.name}</div>
                <div style="font-size:0.8rem; color:#FFD700; margin-bottom:5px;">Lvl ${currentLevel} / ${pet.maxLevel}</div>
                <div class="pet-desc">${pet.description.replace("%", effectValue)}</div>
                
                <div class="pet-actions" style="width:100%;">
                    ${btnHtml}
                    ${equipHtml}
                </div>
            `;

      const buyBtn = petDiv.querySelector(".btn-buy-pet");
      if (buyBtn) {
        buyBtn.onclick = () => this.levelUpPet(pet.id);
      }

      const equipBtn = petDiv.querySelector(".btn-pet-activate");
      if (equipBtn) {
        equipBtn.onclick = () => this.activatePet(pet.id);
      }
      petGrid.appendChild(petDiv);
    });
  }

  updatePetButtons() {
    const openButton = this.game.getById("open_pet_shop_button");
    const state = this.game.gameState;

    // Button im Hauptmenü anzeigen/ausblenden
    if (openButton) {
      openButton.style.display = state.petsUnlocked ? "block" : "none";
    }

    // Anzeige des aktiven Pets oben im UI
    const activePetDisplayElement = this.game.getById("active_pet_display");
    if (activePetDisplayElement) {
      if (state.activePet) {
        const pet = petsData.find((p) => p.id === state.activePet);
        const currentLevel = state.petLevels[state.activePet] || 0;
        const stats = this.calculatePetStat(pet, currentLevel);
        const currentEffectDisplay = (stats.currentEffect * 100).toFixed(1);

        activePetDisplayElement.innerHTML = `
                    <div style="font-size: 2.5rem; margin-right: 10px; filter: drop-shadow(0 0 5px rgba(255,255,255,0.3));">
                        ${pet.icon}
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-start;">
                        <span style="color:#FFD700;">${pet.name} <small style="color:#ccc;">(Lv. ${currentLevel})</small></span>
                        <small style="color:#aaa; font-size:0.75rem;">${pet.description.replace("%", currentEffectDisplay)}</small>
                    </div>
                `;
        activePetDisplayElement.style.display = "flex";
      } else {
        activePetDisplayElement.style.display = "none";
      }
    }

    // Falls das Modal offen ist, Shop aktualisieren
    const petModal = this.game.getById("pet-shop-modal");
    if (petModal && petModal.style.display === "flex") {
      this.renderPetShop();
    }
  }

  createInfoPetsElements() {
    const container = this.game.getById("info_pets_container");
    if (!container) return;

    container.innerHTML = "";
    container.className = "info-grid";

    petsData.forEach((p) => {
      const lvl = this.game.gameState.petLevels[p.id] || 0;
      const item = document.createElement("div");
      item.className = "info-upgrade-item";

      item.innerHTML = `
                <div style="font-size:2em;">${p.icon || "🐶"}</div>
                <h4>${p.name}</h4>
                <p>Level: <span style="color:#FFD700">${lvl}</span> / ${p.maxLevel}</p>
                <p style="font-size:0.8em; margin-top:5px;">${p.description.replace("%", (lvl * 0.1 * 100).toFixed(0))}</p>
            `;
      container.appendChild(item);
    });
  }
}
