export class BuildingSystem {
  constructor(game) {
    this.game = game;
    this.gameState = game.gameState;
  }

  createBuildingElements() {
    const container = document.getElementById("building-grid");
    if (!container) return; // ← FIX: container statt buildingGrid
    container.innerHTML = ""; // ← FIX

    buildingsData.forEach((building, index) => {
      const buildingDiv = document.createElement("div");
      buildingDiv.className = "building-item";
      buildingDiv.dataset.index = index;

      const icon = this.getBuildingIcon(index);

      buildingDiv.innerHTML = `
      ...
    `;
      container.appendChild(buildingDiv); // ← FIX: container statt buildingGrid
    });
  }

  updateBuildingUI() {
    buildingsData.forEach((building, index) => {
      const baseBuildingSPS =
        (this.gameState.buildingCounts[index] || 0) *
        (building.baseSPS || 0) *
        (building.prestigeMulti || 1);
      const actualBuildingSPS =
        baseBuildingSPS * this.gameState.globalerPrestigeMultiplikator;
      const spsPercentage =
        this.gameState.totalSPS > 0
          ? (actualBuildingSPS / this.gameState.totalSPS) * 100
          : 0;

      const countElement = this.game.getById(`building-count-${index}`);
      if (countElement)
        countElement.innerText = this.gameState.buildingCounts[index];
      const spsElement = this.game.getById(`building-sps-${index}`);
      if (spsElement)
        spsElement.innerText = this.game.formatNumber(actualBuildingSPS);
      const spsPctElement = this.game.getById(`building-sps-pct-${index}`);
      if (spsPctElement) spsPctElement.innerText = spsPercentage.toFixed(1);

      const amount = this.game.currentBuyAmount;
      let totalCost = 0;

      for (let i = 0; i < amount; i++) {
        totalCost += this.getBuildingCost(
          index,
          this.gameState.buildingCounts[index] + i,
        );
      }

      const buildingCard = document.querySelector(
        `.building-item[data-index="${index}"]`,
      );
      if (buildingCard) {
        if (this.gameState.aktuelle_smileys >= totalCost) {
          buildingCard.classList.add("affordable");
        } else {
          buildingCard.classList.remove("affordable");
        }
      }

      const btn = this.game.getById(`buy-btn-${index}`);
      const costSpan = this.game.getById(`buy-cost-${index}`);

      if (btn && costSpan) {
        btn.firstElementChild.innerText = `Kaufen ${amount}x`;
        costSpan.innerText = this.game.formatNumber(totalCost);

        btn.disabled = this.gameState.aktuelle_smileys < totalCost;
        costSpan.style.color =
          this.gameState.aktuelle_smileys >= totalCost ? "#4CAF50" : "#ff5252";

        const singleSPS =
          building.baseSPS *
          (building.prestigeMulti || 1) *
          this.gameState.globalerPrestigeMultiplikator;
        const groupSPS =
          singleSPS * (this.gameState.buildingCounts[index] || 0);

        btn.title = `Wert pro Stück: ${this.game.formatNumber(singleSPS)} SPS\nGesamtwert dieser Gruppe: ${this.game.formatNumber(groupSPS)} SPS`;
      }
    });
  }

  getBuildingCost(index, count) {
    const buildingData = [...buildingsData, ...uniqueBuildingsData][index];
    if (!buildingData) return Infinity;
    const currentCount =
      count !== undefined ? count : this.gameState.buildingCounts[index];
    const basePrice = buildingData.basePrice;
    const growthRate = buildingData.growthRate;
    let cost = basePrice * Math.pow(growthRate, currentCount);
    const costMultiplier = this.getBuildingCostMultiplier(index);
    cost *= costMultiplier;
    return Math.ceil(cost);
  }

  getBuildingCostMultiplier(buildingIndex) {
    let multiplier = 1;
    globalUpgrades.forEach((upgrade, index) => {
      if (this.gameState.researchStatus[index] === true) {
        if (
          upgrade.type === "cost_reduction_buildings" &&
          upgrade.buildingIndex === buildingIndex
        ) {
          multiplier *= 1 - upgrade.value;
        }
      }
    });
    if (this.gameState.activePet) {
      const pet = petsData.find(
        (p) =>
          p.id === this.gameState.activePet &&
          p.effectType === "cost_reduction_buildings",
      );
      if (pet) {
        const currentLevel = this.gameState.petLevels[pet.id] || 0;
        if (currentLevel > 0) {
          const stats = this.game.calculatePetStat(pet, currentLevel);
          multiplier *= 1 - stats.currentEffect;
        }
      }
    }
    if (this.gameState.globalCostReduction > 0) {
      multiplier *= 1 - this.gameState.globalCostReduction;
    }
    if (this.gameState.guildCostReduction > 0) {
      multiplier *= 1 - this.gameState.guildCostReduction;
    }
    if (this.gameState.skills.efficiency.active) {
      multiplier *= 0.75;
    }

    multiplier *= this.gameState.activeBuffs.costMultiplier;

    return multiplier;
  }

  getBuildingIcon(index) {
    const icons = [
      "👆",
      "🌳",
      "🏭",
      "⛏️",
      "🔩",
      "⚛️",
      "🌌",
      "🌀",
      "⏳",
      "🦾",
      "🔗",
      "💾",
      "🥚",
      "☯️",
      "👑",
    ];
    return icons[index] || "❓";
  }

  kaufeMehrereGebaeude(index, amount) {
    let item;
    let isUnique = index === DIAMOND_MINE_INDEX;
    if (isUnique) {
      item = uniqueBuildingsData.find(
        (u) => index === DIAMOND_MINE_INDEX && u.id === "diamond_mine",
      );
    } else {
      item = buildingsData[index];
    }
    if (
      !item ||
      (isUnique && this.gameState.buildingCounts[index] >= item.maxCount)
    )
      return;

    let totalCost = 0;
    const anzahl = isUnique ? 1 : amount;
    for (let i = 0; i < anzahl; i++) {
      totalCost += Math.ceil(
        this.calculateNextCost(
          item.basePrice,
          this.gameState.buildingCounts[index] + i,
          item.growthRate,
          index,
        ),
      );
    }

    if (this.gameState.aktuelle_smileys >= totalCost) {
      this.gameState.aktuelle_smileys -= totalCost;
      this.gameState.buildingCounts[index] += anzahl;
      if (isUnique) this.game.applyAllBoni();
      this.game.checkAchievements();
      this.game.updateUI();
    }
  }

  calculateNextCost(basePrice, count, growthRate, buildingIndex = -1) {
    let price = Math.floor(basePrice * Math.pow(growthRate, count));
    let costReduction = 0;

    prestigeUpgrades.forEach((upg) => {
      if (
        upg.type === "building_cost_reduction" &&
        this.gameState.prestigeUpgradeStatus[upg.id]
      ) {
        if (
          !upg.buildingIndices ||
          upg.buildingIndices.includes(buildingIndex)
        ) {
          costReduction += upg.value;
        }
      }
    });

    const activePetIndex = petsData.findIndex(
      (pet) =>
        pet.effectType === "cost_reduction_buildings" &&
        this.gameState.activePet === pet.id,
    );
    if (activePetIndex !== -1) {
      const pet = petsData[activePetIndex];
      const petLevel = this.gameState.petLevels[activePetIndex];
      const petStats = this.game.calculatePetStat(pet, petLevel);
      costReduction += petStats.currentEffect;
    }

    if (costReduction > 0) {
      price *= 1 - costReduction;
    }
    return Math.floor(price);
  }
}
