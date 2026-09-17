// js/SG.js

import { InputSystem } from "./systems/InputSystem.js";
import { ModalSystem } from "./systems/ModalSystem.js";
import { createInitialGameState } from "./GameState.js";
import { Utils } from "./Utils.js";
import { Mechanicalc } from "./Mechanicalc.js";
import { DiamondMine } from "./systems/DiamondMine.js";
import { GuildSystem } from "./systems/GuildSystem.js";
import { PetSystem } from "./systems/PetSystem.js";
import { ChatSystem } from "./systems/ChatSystem.js";
import { SoundSystem } from "./systems/SoundSystem.js";
import { GemSystem } from "./systems/GemSystem.js";
import { SkinSystem } from "./systems/SkinSystem.js";
import { WikiSystem } from "./systems/WikiSystem.js";
import { PrestigeSystem } from "./systems/PrestigeSystem.js";

// ================================================================================================================
// === SmileyGame.js: Hauptspielklasse (Final & Friendly Version) ===
// ================================================================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Sicherheits-Check
  if (window.gameInstance) {
    console.log("Spiel läuft bereits.");
    return;
  }

  console.log("Starte SmileyGame...");

  // 👇 KORREKTUR: Nur EINMAL 'new' aufrufen und direkt global speichern!
  window.gameInstance = new SmileyGame();

  console.log(
    "✅ SmileyGame gestartet und global als 'gameInstance' verfügbar!",
  );
});

class SmileyGame {
  // ================================================================================================================
  // 0. KLASSE & CONSTRUCTOR
  // ================================================================================================================

  constructor() {
    this.prestigeUpgrades = prestigeUpgrades;
    this.artifactsData = artifactsData;

    this.currentBuyAmount = 1;
    this.selectedBuyAmount = 1;

    this.activeModals = new Set();

    this.gameState = createInitialGameState({
      buildingsData,
      uniqueBuildingsData,
      globalUpgrades,
      prestigeUpgrades: this.prestigeUpgrades,
      achievementsData,
    });

    this.productionInterval = null;
    this.uiInterval = null;
    this.saveInterval = null;

    this.treeX = 0;
    this.treeY = 0;
    this.treeZoom = 1;
  }

  initSystems() {
    this.systems = {
      mine: new DiamondMine(this),
      guild: new GuildSystem(this),
      chat: new ChatSystem(this),
      pet: new PetSystem(this),
      sound: new SoundSystem(this),
      gem: new GemSystem(this),
      skin: new SkinSystem(this),
      wiki: new WikiSystem(this),
      prestige: new PrestigeSystem(this),
    };

    this.mineSystem = this.systems.mine;
    this.guildSystem = this.systems.guild;
    this.chatSystem = this.systems.chat;
    this.petSystem = this.systems.pet;
    this.soundSystem = this.systems.sound;
    this.gemSystem = this.systems.gem;
    this.skinSystem = this.systems.skin;
    this.wikiSystem = this.systems.wiki;
    this.prestigeSystem = this.systems.prestige;
  }

  init() {
    // 1. Systeme initialisieren (muss VOR allem anderen kommen!)
    this.initSystems();

    // 2. SaveSystem initialisieren (lädt Spielstand + Device-ID)
    this.saveSystem.init();

    // 3. Andere Systeme starten
    this.modalSystem.init();
    this.inputSystem.init();

    // 4. Mine reparieren falls nötig
    if (this.gameState.mineGrid && this.gameState.mineGrid.length > 0) {
      if (this.gameState.mineGrid[0].content === undefined) {
        console.log("🛠️ Repariere kaputte Mine (Loot fehlt)...");
        this.mineSystem.generateMineGrid();
      }
    }

    // 5. Audio Setup
    this.clickSound = document.getElementById("click-sound");
    const storedSfx = localStorage.getItem("soundVolume");
    if (storedSfx !== null) this.sfxVolume = parseInt(storedSfx) / 100;

    // 6. Spiel initialisieren
    this.checkOfflineProgress();
    this.createBuildingElements();
    this.renderPetShop();
    this.renderSkillUI();
    this.updateGlobalUpgradeUI();
    this.updatePrestigeUI();
    this.ladeAudioEinstellungen();
    this.chatSystem.setupEventListeners();

    const musicPlayer = this.getById("background-music");
    if (musicPlayer) {
      musicPlayer.play().catch((e) => console.log("Musik wartet:", e));
    }

    this.restoreCooldowns();
    this.checkSkillUnlocks();
    this.setupMainEventListeners();
    this.setupInfoPageEventListeners();
    this.setupSkillTreeControls();
    this.startIntervals();
    this.setupTooltips();
    this.updatePetInterval();
    this.updateNewsTicker();
    this.updateUI();
    this.guildSystem.listenToGuildData();
    this.setupPrestigeButtons();
    this.initChat();

    // Prestige Tree Touch + Wheel Controls
    this.setupPrestigeTreeTouchControls();

    console.log("✅ Spiel initialisiert. PlayerID:", this.gameState.playerId);
  }

  updatePetInterval() {
    this.petSystem.updatePetInterval();
  }

  // ================================================================================================================
  // 2. SPEICHERUNG & HILFSFUNKTIONEN
  // ================================================================================================================

  syncGuildStats() {
    this.chatSystem.syncGuildStats();
  }

  addSmileys(menge) {
    if (!menge || menge <= 0) return;
    this.gameState.aktuelle_smileys += menge;
    if (!this.gameState.lifetime_smileys) this.gameState.lifetime_smileys = 0;
    this.gameState.lifetime_smileys += menge;
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
      const petStats = this.calculatePetStat(pet, petLevel);
      costReduction += petStats.currentEffect;
    }

    if (costReduction > 0) {
      price *= 1 - costReduction;
    }
    return Math.floor(price);
  }

  getGlobalUpgradeCost(upgrade) {
    let price = upgrade.cost;
    let discount = 0;

    const prestigeEffects = this.calculatePrestigeEffects();
    if (prestigeEffects && prestigeEffects.costReduction) {
      discount += prestigeEffects.costReduction;
    }
    if (this.gameState.globalCostReduction) {
      discount += this.gameState.globalCostReduction;
    }
    if (this.gameState.activePet) {
      const pet = petsData.find((p) => p.id === this.gameState.activePet);
      if (pet && pet.effectType === "cost_reduction_upgrades") {
        const level = this.gameState.petLevels[pet.id] || 0;
        if (level > 0) {
          const stats = this.calculatePetStat(pet, level);
          discount += stats.currentEffect;
        }
      }
    }
    if (discount > 0.9) discount = 0.9;
    return Math.ceil(price * (1 - discount));
  }

  spawnFloatingText(event, amount, type = "normal") {
    let x = event ? event.clientX : window.innerWidth / 2;
    let y = event ? event.clientY : window.innerHeight / 2;
    const randomX = (Math.random() - 0.5) * 40;
    const randomY = (Math.random() - 0.5) * 40;
    const el = document.createElement("div");
    el.className = `floating-text ${type}`;
    if (type === "boss-damage") {
      el.innerText = `-${this.formatNumber(amount)}`;
    } else {
      el.innerText = `+${this.formatNumber(amount)}`;
    }
    el.style.left = `${x + randomX}px`;
    el.style.top = `${y + randomY}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  triggerShake(elementId) {
    const el = this.getById(elementId);
    if (!el) return;

    el.classList.remove("shake-effect");
    el.classList.remove("boss-hit-effect");
    void el.offsetWidth;

    if (elementId === "guilds-content") {
      el.classList.add("boss-hit-effect");
    } else {
      el.classList.add("shake-effect");
    }

    setTimeout(() => {
      if (el) {
        el.classList.remove("shake-effect");
        el.classList.remove("boss-hit-effect");
      }
    }, 300);
  }

  triggerBigBang() {
    const overlay = this.getById("big-bang-overlay");
    if (!overlay) return;

    // 1. Sound (falls vorhanden)
    if (typeof this.playLevelUpSound === "function") {
      this.playLevelUpSound();
    }

    // 2. Visueller Flash (CSS Klasse hinzufügen)
    overlay.classList.add("flash-bang");

    // 3. Heftiges Wackeln
    document.body.classList.add("shake-effect");

    // 4. Dramatische Nachrichten
    setTimeout(() => {
      this.showNotification(
        "🌌 DAS UNIVERSUM WIRD NEU GESCHRIEBEN...",
        "success",
      );
    }, 200);

    setTimeout(() => {
      this.showNotification("🚀 PRODUKTION VERVIELFACHT!", "success");
      // Shake beenden
      document.body.classList.remove("shake-effect");
    }, 2000);

    // 5. Aufräumen (Klasse entfernen für nächsten Reset)
    setTimeout(() => {
      overlay.classList.remove("flash-bang");
    }, 3500);
  }

  // ================================================================================================================
  // 3. KERNLOGIK (Kauf & Reset)
  // ================================================================================================================

  klickeSmiley(e) {
    // --- 1. COMBO LOGIK & PRESTIGE CHECKS ---
    if (!this.comboCount) this.comboCount = 0;

    let maxCombo = 3.0;
    let comboTime = 2000;
    let comboGain = 1; // Basis: 1 Klick = 1 Combo-Punkt

    // Check: Prestige ID 15 (Combo-Rausch) -> Combo steigt 50% schneller
    if (
      this.gameState.prestigeUpgradeStatus &&
      this.gameState.prestigeUpgradeStatus[15]
    )
      comboGain = 1.5;

    // Check: Global Upgrade IDs (aus data.js)
    if (this.gameState.researchStatus && this.gameState.researchStatus[110])
      comboTime = 4000;
    if (this.gameState.researchStatus && this.gameState.researchStatus[111])
      maxCombo = 5.0;

    // Check: Prestige ID 17 (Ewige Combo) -> +2 Sek Zeitfenster
    if (
      this.gameState.prestigeUpgradeStatus &&
      this.gameState.prestigeUpgradeStatus[17]
    )
      comboTime += 2000;

    this.comboCount += comboGain;
    this.comboMulti = Math.min(maxCombo, 1 + Math.sqrt(this.comboCount) * 0.15);

    // Combo-Reset Timer
    clearTimeout(this.comboTimer);
    this.comboTimer = setTimeout(() => {
      this.comboCount = 0;
      this.comboMulti = 1.0;
      this.updateUI();
    }, comboTime);

    // --- 2. BERECHNUNG ---
    let baseClick = this.getClickStrength();

    // Check: Prestige ID 5 (Synergie) -> 1% der SPS zum Klick addieren
    if (
      this.gameState.prestigeUpgradeStatus &&
      this.gameState.prestigeUpgradeStatus[5]
    ) {
      baseClick += this.gameState.totalSPS * 0.01;
    }

    let damage = baseClick * this.comboMulti;
    let isCrit = false;

    // Crit Check
    if (
      this.gameState.skills &&
      this.gameState.skills.critStorm &&
      this.gameState.skills.critStorm.active
    ) {
      isCrit = true;
      damage *= this.gameState.critDamageMult;
    } else if (
      this.gameState.critChance > 0 &&
      Math.random() < this.gameState.critChance
    ) {
      damage *= this.gameState.critDamageMult;
      isCrit = true;
    }

    // --- 3. GUTSCHRIFT ---
    this.addSmileys(damage);
    this.gameState.totalClicksLifetime++;
    this.playClickSound();

    // ====================================================
    // 👾 NEU: GLITCH DROP CHANCE (Corrupted Smileys)
    // ====================================================
    // 0.2% Chance (1 zu 500) bei jedem Klick
    if (Math.random() < 0.002) {
      this.gameState.gems = (this.gameState.gems || 0) + 1;

      // Kleines visuelles Feedback
      if (e) {
        // Zeigt "+1 👾" in Neon-Lila an der Mausposition
        this.spawnFloatingText("+1 👾", "glitch");
      }
      this.showNotification(
        "SYSTEM GLITCH! Corrupted Smiley gefunden.",
        "success",
      );
    }
    // ====================================================

    // --- 4. ANIMATIONEN & EFFEKTE ---
    if (e) {
      this.animateSmiley();
      this.createClickParticles(e);
      let text = this.formatNumber(damage);
      this.showClickEffect(e, text, isCrit ? "crit" : "normal");
      if (isCrit) this.triggerShake("smiley_button");
    }

    this.checkAchievements();
    this.updateUI();
  }

  createClickParticles(e) {
    // Deine Branding-Farben: Rot (#6b0504), Hellblau (#009ffd), Dunkelblau (#011638)
    const colors = ["#6b0504", "#009ffd", "#011638", "#ffffff"];
    const particleCount = 6; // Anzahl der Teilchen pro Klick

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement("div");
      p.className = "click-particle";

      // Zufälliges Icon (Punkt, kleiner Smiley oder Stern)
      const icons = ["•", "😊", "✨"];
      p.innerText = icons[Math.floor(Math.random() * icons.length)];

      // Zufällige Flugrichtung berechnen
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 80;
      const tx = Math.cos(angle) * dist + "px";
      const ty = Math.sin(angle) * dist + "px";

      // CSS Variablen setzen
      p.style.setProperty("--tw-x", tx);
      p.style.setProperty("--tw-y", ty);

      // Startposition am Mauszeiger
      p.style.left = e.clientX + "px";
      p.style.top = e.clientY + "px";
      p.style.color = colors[Math.floor(Math.random() * colors.length)];

      document.body.appendChild(p);

      // Nach der Animation löschen
      setTimeout(() => p.remove(), 800);
    }
  }

  getClickStrength() {
    let strength =
      this.gameState.klickKraft * this.gameState.klickKraftMultiplier;
    const prestigeEffects = this.calculatePrestigeEffects();

    if (prestigeEffects) {
      strength *= prestigeEffects.clickMultiplier;
    }
    if (this.gameState.globalerPrestigeMultiplikator > 1) {
      strength *= this.gameState.globalerPrestigeMultiplikator;
    }

    strength *= this.gameState.godModeMultiplier;

    // --- SKILL BOOSTS FÜR KLICKS ---
    if (this.gameState.skills && this.gameState.skills.frenzy.active) {
      strength *= 5;
    }

    if (this.gameState.skills && this.gameState.skills.shards.active) {
      strength += this.gameState.totalSPS * 0.2;
    }

    if (this.gameState.clickSPSRatio > 0) {
      strength += this.gameState.totalSPS * this.gameState.clickSPSRatio;
    }

    // --- NEU: Hype-Train (Building Synergy) ---
    // ID 17: Je mehr Gebäude, desto stärker der Klick
    if (prestigeEffects.buildingSynergy > 0) {
      const totalBuildings = this.gameState.buildingCounts.reduce(
        (a, b) => a + b,
        0,
      );
      const synergyMult = 1 + totalBuildings * prestigeEffects.buildingSynergy;
      strength *= synergyMult;
    }

    return Math.floor(strength);
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
      if (isUnique) this.applyAllBoni();
      this.checkAchievements();
      this.updateUI();
    }
  }

  getBuildingIcon(index) {
    const icons = [
      "👆", // 0: Auto-Klicker
      "🌳", // 1: Smiley-Baum
      "🏭", // 2: Smiley-Fabrik
      "⛏️", // 3: Smiley-Mine (Die normale für Smileys)
      "🔩", // 4: Smiley-Bohrer
      "⚛️", // 5: Smiley-Kernkraftwerk
      "🌌", // 6: Smiley-Galaxie
      "🌀", // 7: Dimensionsportal
      "⏳", // 8: Zeitmaschine
      "🦾", // 9: Meta-Klicker
      "🔗", // 10: Quanten-Netzwerk
      "💾", // 11: Endloser Speicher
      "🥚", // 12: Ursprung
      "☯️", // 13: Kosmische Einheit
      "👑", // 14: Absoluter Schöpfer
    ];
    return icons[index] || "❓";
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
          const stats = this.calculatePetStat(pet, currentLevel);
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

  updateGlobalUpgradeUI() {
    const container = this.getById("global-upgrades-container");
    if (!container) return;
    container.innerHTML = "";

    // Wir sammeln alle noch nicht gekauften Upgrades
    const upgradesToRender = [];

    globalUpgrades.forEach((upgrade) => {
      // Prüfen, ob das Upgrade noch NICHT gekauft wurde
      if (!this.gameState.researchStatus[upgrade.id]) {
        const bIndex = upgrade.buildingIndex;

        // Logik: Anzeigen wenn global (-1/undefined) ODER wenn man das Gebäude besitzt
        const isGlobal = bIndex === undefined || bIndex === -1;
        const hasBuilding =
          bIndex >= 0 && this.gameState.buildingCounts[bIndex] > 0;

        if (isGlobal || hasBuilding) {
          upgradesToRender.push(upgrade);
        }
      }
    });

    // Wenn gar nichts da ist
    if (upgradesToRender.length === 0) {
      container.innerHTML =
        '<div style="padding:20px; color:#888; text-align:center;">Alle Upgrades erforscht!</div>';
      return;
    }

    // Nur die ersten 5 anzeigen
    upgradesToRender.slice(0, 5).forEach((upgrade) => {
      const finalCost = this.getGlobalUpgradeCost(upgrade);
      const canAfford = this.gameState.aktuelle_smileys >= finalCost;

      const div = document.createElement("div");
      div.className = `research-item ${canAfford ? "affordable" : ""}`;

      div.innerHTML = `
                <div class="research-content">
                    <div class="research-title-row">
                        <span class="research-name">✨ ${upgrade.name || "Upgrade"}</span>
                    </div>
                    <div class="research-desc">${upgrade.description}</div>
                </div>
                <div class="research-action">
                    <span class="research-cost" style="color: ${canAfford ? "#4CAF50" : "#ff5252"};">
                        ${this.formatNumber(finalCost)}
                    </span>
                    <button class="btn-buy-research" ${canAfford ? "" : "disabled"}>
                        Kaufen
                    </button>
                </div>
            `;

      // WICHTIG: Klick-Event hier anhängen!
      const btn = div.querySelector(".btn-buy-research");
      if (btn) {
        btn.onclick = () => this.kaufeGlobalUpgrade(upgrade.id);
      }

      container.appendChild(div);
    });
  }

  kaufeGlobalUpgrade(id) {
    const upgrade = globalUpgrades.find((u) => u.id === id);
    if (!upgrade) return;
    if (this.gameState.researchStatus[upgrade.id]) {
      this.showNotification("Bereits gekauft!", "info");
      return;
    }
    let finalCost = this.getGlobalUpgradeCost(upgrade);
    if (this.gameState.aktuelle_smileys >= finalCost) {
      this.gameState.aktuelle_smileys -= finalCost;
      this.gameState.researchStatus[upgrade.id] = true;
      this.applyAllBoni();
      this.speichereSpiel();
      this.updateUI();
      this.updateGlobalUpgradeUI();
      this.showNotification(
        `✅ Upgrade gekauft: ${upgrade.name || "Upgrade"}`,
        "success",
      );
    } else {
      this.showNotification("❌ Nicht genug Smileys!", "error");
    }
  }

  buyDiamondShopUpgrade(id) {
    const upgrade = diamondShopUpgrades.find((u) => u.id === id);
    if (!upgrade) return;
    const currentCount = this.gameState.diamondShopPurchases[id] || 0;
    if (upgrade.maxPurchases && currentCount >= upgrade.maxPurchases) return;

    if (this.gameState.diamanten < upgrade.cost) {
      this.showNotification("💎 Nicht genug Diamanten!", "error");
      return;
    }

    this.gameState.diamanten -= upgrade.cost;
    this.gameState.diamondShopPurchases[id] = currentCount + 1;
    if (upgrade.type === "auto_diamond_mine") {
      this.gameState.autoDiamondMineUnlocked = true;
    }
    this.applyAllBoni();
    this.updateUI();
    this.DiamondMine.renderDiamondMineContent();
    this.speichereSpiel();
  }

  checkAchievements() {
    achievementsData.forEach((achievement, index) => {
      // Wenn schon freigeschaltet, überspringen
      if (this.gameState.achievementsUnlocked[index]) return;

      let isMet = false;
      const req = achievement.requirement;

      switch (req.type) {
        // --- BASIS ---
        case "building_count":
          if (this.gameState.buildingCounts[req.target] >= req.value)
            isMet = true;
          break;
        case "total_clicks":
          if (this.gameState.totalClicksLifetime >= req.value) isMet = true;
          break;
        case "lifetime_smileys":
          if (this.gameState.lifetime_smileys >= req.value) isMet = true;
          break;

        // --- FORTSCHRITT ---
        case "sps_reach":
          if (this.gameState.totalSPS >= req.value) isMet = true;
          break;
        case "total_buildings": // NEU: Summe aller Gebäude
          const total = this.gameState.buildingCounts.reduce(
            (a, b) => a + b,
            0,
          );
          if (total >= req.value) isMet = true;
          break;

        // --- PRESTIGE & DIAMANTEN ---
        case "prestige_count":
          if (this.gameState.prestigeResets >= req.value) isMet = true;
          break;
        case "prestige_points_held": // NEU: Punkte auf der Hand
          if (this.gameState.prestige_punkte_verfügbar >= req.value)
            isMet = true;
          break;
        case "diamond_count":
          if (this.gameState.diamanten >= req.value) isMet = true;
          break;

        // --- GILDE ---
        case "guild_joined":
          if (this.gameState.guildName !== null) isMet = true;
          break;
        case "guild_level":
          if (this.gameState.guildLevel >= req.value) isMet = true;
          break;

        // --- STATS ---
        case "crit_chance_reach": // NEU: Kritische Chance
          if (this.gameState.critChance >= req.value) isMet = true;
          break;
        // --- GEHEIMNISSE (NEU) ---
        case "artifact_count":
          if (
            this.gameState.collectedArtifacts &&
            this.gameState.collectedArtifacts.length >= req.value
          )
            isMet = true;
          break;
        case "blackmarket_purchases":
          let gemUpsCount = 0;
          if (this.gameState.gemUpgrades) {
            gemUpsCount = Object.values(this.gameState.gemUpgrades).reduce(
              (a, b) => a + b,
              0,
            );
          }
          if (gemUpsCount >= req.value) isMet = true;
          break;

        // --- SÖLDNER (NEU) ---
        case "mercenary_count":
          if (
            this.gameState.guildMercenaries &&
            this.gameState.guildMercenaries.length >= req.value
          )
            isMet = true;
          break;
        case "mercenary_level":
          if (
            this.gameState.guildMercenaries &&
            this.gameState.guildMercenaries.some((m) => m.level >= req.value)
          )
            isMet = true;
          break;
      }

      if (isMet) {
        this.gameState.achievementsUnlocked[index] = true;
        this.showNotification(`🏆 ERFOLG: ${achievement.name}`, "success");
        this.triggerShake("show_achievements_button");
        this.applyAllBoni();
        this.speichereSpiel();
      }
    });
  }

  // ================================================================================================================
  // 4. PETS LOGIK
  // ================================================================================================================

  levelUpPet(petId) {
    this.petSystem.levelUpPet(petId);
  }

  activatePet(petId) {
    this.petSystem.activatePet(petId);
  }

  updatePetInterval() {
    this.petSystem.updatePetInterval();
  }

  renderPetShop() {
    this.petSystem.renderPetShop();
  }

  updatePetButtons() {
    this.petSystem.updatePetButtons();
  }

  createInfoPetsElements() {
    this.petSystem.createInfoPetsElements();
  }

  calculatePetStat(pet, currentLevel) {
    // WICHTIG: Hier fehlte das 'return' in deinem Code!
    return this.petSystem.calculatePetStat(pet, currentLevel);
  }

  // ================================================================================================================
  // 5. DIAMANTEN MINE LOGIK (Delegation an MineSystem)
  // ================================================================================================================

  renderDiamondMineContent() {
    this.mineSystem.renderDiamondMineContent();
  }

  switchMineTab(tabName) {
    this.mineSystem.switchMineTab(tabName);
  }

  renderDiamondMinigame(targetContainer) {
    this.DiamondMine.renderDiamondMinigame(targetContainer);
  }

  updateMineVisuals() {
    this.mineSystem.updateMineVisuals();
  }

  handleMineClick(index) {
    this.mineSystem.handleMineClick(index);
  }

  // ================================================================================================================
  // 6. GILDEN LOGIK + weiter Leitung an die Guild Class
  // ================================================================================================================

  addGuildXP(amount) {
    this.guildSystem.addGuildXP(amount);
  }

  // Schaltet zwischen Chat und Liste um
  toggleGuildView() {
    this.chatSystem.toggleGuildView();
  }

  // ================================================================================================================
  // 7. RENDERING & UI-UPDATES
  // ================================================================================================================

  renderMuseum(targetContainer = null) {
    // 1. Container finden (Entweder übergeben oder per ID suchen)
    const container = targetContainer || document.getElementById("museum_grid");

    if (!container) {
      console.error("❌ Museum-Container nicht gefunden!");
      return;
    }

    // 2. Sicherheits-Check: Gibt es die Liste der gesammelten Items überhaupt?
    // Falls nicht (neues Spiel), erstellen wir sie leer, damit kein Fehler kommt.
    if (!this.gameState.collectedArtifacts) {
      this.gameState.collectedArtifacts = [];
    }

    container.innerHTML = "";

    // Grid-Styling sicherstellen (falls CSS fehlt)
    container.style.display = "grid";
    container.style.gridTemplateColumns =
      "repeat(auto-fill, minmax(180px, 1fr))";
    container.style.gap = "15px";
    container.style.padding = "10px";

    // Header Text
    const header = document.createElement("div");
    header.style.gridColumn = "1 / -1";
    header.style.textAlign = "center";
    header.style.color = "#aaa";
    header.style.marginBottom = "10px";
    header.style.background = "rgba(255,255,255,0.05)";
    header.style.padding = "10px";
    header.style.borderRadius = "8px";
    header.innerHTML =
      "<p>Sammle Artefakte in der Mine, um globale Boni freizuschalten.</p>";
    container.appendChild(header);

    // 3. Karten rendern
    this.artifactsData.forEach((art) => {
      const isOwned = this.gameState.collectedArtifacts.includes(art.id);

      const card = document.createElement("div");
      card.className = `artifact-card ${isOwned ? "owned" : "missing"}`;

      // Inline Styles als Fallback, falls CSS noch nicht greift
      card.style.position = "relative";
      card.style.padding = "15px";
      card.style.borderRadius = "10px";
      card.style.textAlign = "center";
      card.style.border = isOwned ? "1px solid #FFD700" : "1px solid #444";
      card.style.background = isOwned
        ? "rgba(255, 215, 0, 0.05)"
        : "rgba(255, 255, 255, 0.02)";
      if (!isOwned) card.style.opacity = "0.7";

      // Icons
      const icons = {
        art_coin: "🪙",
        art_fossil: "🐚",
        art_compass: "🧭",
        art_pickaxe: "⛏️",
        art_crystal: "🔮",
        art_crown: "👑",
      };
      const displayIcon = icons[art.id] || "🏺";

      const rarityStars = {
        common: "⭐",
        rare: "⭐⭐",
        epic: "⭐⭐⭐",
        legendary: "🌟🌟🌟",
      };

      card.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 10px; filter: ${isOwned ? "drop-shadow(0 0 5px gold)" : "grayscale(1)"};">
                    ${isOwned ? displayIcon : "❓"}
                </div>
                <div style="font-weight:bold; color:${isOwned ? "#fff" : "#777"}; margin-bottom:5px;">
                    ${isOwned ? art.name : "???"}
                </div>
                <div style="font-size: 0.8rem; color: #aaa; margin-bottom: 5px;">
                    ${rarityStars[art.rarity]}
                </div>
                <div style="font-size: 0.75rem; color: ${isOwned ? "#4CAF50" : "#555"}; min-height: 35px; display:flex; align-items:center; justify-content:center;">
                    ${isOwned ? art.desc : "Noch nicht entdeckt"}
                </div>
            `;
      container.appendChild(card);
    });
  }

  // Helfer für Icons (kannst du in deine getTileSymbol Logik integrieren)
  getArtifactIcon(id) {
    const icons = {
      art_coin: "🪙",
      art_fossil: "🐚",
      art_compass: "🧭",
      art_pickaxe: "⛏️",
      art_crystal: "🔮",
      art_crown: "👑",
    };
    return icons[id] || "🏺";
  }

  updateUI() {
    document.title = `${this.formatNumber(this.gameState.aktuelle_smileys)} Smileys - Idle Game`;

    this.computeTotalSPS();

    const diamantenEl = this.getById("diamanten_anzeige");
    if (diamantenEl)
      diamantenEl.innerText = this.formatNumber(this.gameState.diamanten);

    const aktuelleSmileysEl = this.getById("aktuelle_smileys");
    if (aktuelleSmileysEl)
      aktuelleSmileysEl.innerText = this.formatNumber(
        this.gameState.aktuelle_smileys,
      );

    // Klick-Werte berechnen
    const totalClickPower =
      this.gameState.klickKraft * this.gameState.klickKraftMultiplier;

    const smileysProKlickEl = this.getById("smileys_pro_klick_anzeige");
    if (smileysProKlickEl) {
      smileysProKlickEl.innerText = this.formatNumber(totalClickPower);
    }

    const smileysProSekundeEl = this.getById("smileys_pro_sekunde_anzeige");
    if (smileysProSekundeEl)
      smileysProSekundeEl.innerText = this.formatNumber(
        this.gameState.totalSPS,
      );

    const smileysProMinuteEl = this.getById("smileys_pro_minute_anzeige");
    if (smileysProMinuteEl)
      smileysProMinuteEl.innerText = this.formatNumber(
        this.gameState.totalSPS * 60,
      );

    // === NEU: Click-Werte Box aktualisieren ===
    const clickDamageEl = this.getById("click_damage_anzeige");
    if (clickDamageEl) {
      // Gesamter Click-Schaden mit allen Multiplikatoren
      const totalDamage = totalClickPower;
      clickDamageEl.innerText = this.formatNumber(totalDamage);
    }

    const critChanceEl = this.getById("crit_chance_anzeige");
    if (critChanceEl) {
      const critPercent = (this.gameState.critChance * 100).toFixed(1);
      critChanceEl.innerText = critPercent;
    }
    // === ENDE NEU ===

    this.updateBuildingUI();
    this.checkFeatureUnlocks();

    const klickMultiDisplay = this.getById("klick_multiplikator_anzeige");
    if (klickMultiDisplay) {
      klickMultiDisplay.innerText = `x${this.gameState.klickKraftMultiplier.toFixed(2)}`;
    }

    const globalMultiDisplay = this.getById("globaler_multiplikator_anzeige");
    if (globalMultiDisplay) {
      globalMultiDisplay.innerText = `x${this.gameState.globalerPrestigeMultiplikator.toFixed(2)}`;
      const pF =
        1 +
          this.gameState.gesamt_prestige_punkte *
            this.gameState.prestigePointMultiplier || 1;
      const rF =
        1 + this.gameState.prestigeResets * this.gameState.prestigeResetBonus ||
        1;
      const uF = this.gameState.globalSPSMultiplier || 1;
      const gF = 1 + this.gameState.guildSPSMultiplier || 1;
      globalMultiDisplay.title = `Prestige: x${pF.toFixed(2)} | Resets: x${rF.toFixed(2)} | Upgrades: x${uF.toFixed(2)} | Gilden: x${gF.toFixed(2)}`;
    }

    const prestigePointThreshold = 100000;
    const lifetime = this.gameState.lifetime_smileys || 0;
    const pointsToGain = this.calculatePrestigeGain();
    const currentTotalLevel =
      (this.gameState.gesamt_prestige_punkte || 0) + pointsToGain;
    const nextLevelTarget = currentTotalLevel + 1;
    const smileysForNext =
      Math.pow(nextLevelTarget, 3) * prestigePointThreshold;
    const smileysForCurrent =
      Math.pow(nextLevelTarget - 1, 3) * prestigePointThreshold;
    const progressInLevel = lifetime - smileysForCurrent;
    const totalNeededForLevel = smileysForNext - smileysForCurrent;

    let percentage = 0;
    if (totalNeededForLevel > 0)
      percentage = (progressInLevel / totalNeededForLevel) * 100;
    percentage = Math.max(0, Math.min(100, percentage));

    const bar = this.getById("prestige-progress-bar");
    const textNext = this.getById("next-prestige-threshold");
    const textPercent = this.getById("prestige-percent-text");

    if (bar) bar.style.width = percentage + "%";
    if (textNext) textNext.innerText = this.formatNumber(smileysForNext);

    if (textPercent) {
      if (pointsToGain > 0) {
        textPercent.innerText = `+${pointsToGain} Punkte!`;
        textPercent.style.color = "#00ff00";
        textPercent.style.textShadow = "0 0 5px rgba(0, 255, 0, 0.5)";
      } else {
        textPercent.innerText = percentage.toFixed(2) + "%";
        textPercent.style.color = "#ffffff";
        textPercent.style.textShadow = "none";
      }
    }

    const prestigeView = document.getElementById("view-prestige");
    if (prestigeView && prestigeView.classList.contains("active")) {
      if (typeof this.updatePrestigeUIView === "function")
        this.updatePrestigeUIView();
    }

    this.updatePetButtons();
    this.updateDiamondMineStatus();

    const mineModal = this.getById("diamond-mine-modal");
    if (mineModal && mineModal.style.display === "flex") {
      this.DiamondMine.renderDiamondMineContent();
    }

    this.updateGuildsButton();
    const guildsModal = this.getById("guilds-modal");
    if (guildsModal && guildsModal.style.display === "flex") {
      if (
        this.guildView === "quests" ||
        (this.guildView === "boss" && this.gameState.guildBossFighting)
      ) {
        this.renderGuildsContent();
      }
    }
    this.checkSkillUnlocks();
    this.updateGlobalUpgradeUI();
    this.renderBuffs();

    const comboEl = document.getElementById("combo-display");
    const comboVal = document.getElementById("combo-value");

    if (comboEl && comboVal) {
      if (this.comboCount >= 5) {
        comboEl.classList.add("active");
        comboVal.innerText = `x${this.comboMulti.toFixed(2)}`;
      } else {
        comboEl.classList.remove("active");
      }
    }
  }

  renderSkillUI() {
    // Definition der Texte und Icons für jeden Skill
    const skillDetails = {
      frenzy: { name: "Klick-Wut", desc: "x5 Klick-Stärke (15s)", icon: "🔥" },
      overdrive: { name: "Overdrive", desc: "x2 Produktion (30s)", icon: "⚡" },
      critStorm: {
        name: "Krit-Sturm",
        desc: "100% Krit-Chance (10s)",
        icon: "🎯",
      },
      goldRush: { name: "Goldrausch", desc: "+15 Min. Produktion", icon: "💰" },
      diamondPulse: {
        name: "Diamant-Puls",
        desc: "Sofortige Diamanten",
        icon: "💎",
      },
      efficiency: {
        name: "Effizienz",
        desc: "-25% Gebäudekosten (45s)",
        icon: "📉",
      },
      shards: { name: "Splitter", desc: "Klicks ernten SPS (20s)", icon: "♦️" },
      hyperMinute: {
        name: "Hyper-Zeit",
        desc: "x5 Produktion (60s)",
        icon: "🚀",
      },
    };

    // Wir gehen alle Skills durch und bauen das HTML der Buttons neu auf
    Object.keys(skillDetails).forEach((key) => {
      const btn = document.getElementById(`btn-skill-${key}`);
      if (btn) {
        const info = skillDetails[key];

        // Wir setzen den HTML-Inhalt neu, behalten aber die IDs für Timer und Cooldown bei!
        btn.innerHTML = `
                    <div style="font-size:1.8em; margin-bottom:2px;">${info.icon}</div>
                    <div style="font-weight:bold; font-size:0.9em; margin-bottom:2px; color:#fff;">${info.name}</div>
                    <div style="font-size:0.7em; color:#aaa; margin-bottom:5px; min-height:2.4em; line-height:1.2;">${info.desc}</div>
                    
                    <div id="timer-${key}" style="font-weight:bold; color:#4CAF50; font-size:0.9em;">BEREIT</div>
                    
                    <div style="position:absolute; bottom:0; left:0; width:100%; height:4px; background:rgba(0,0,0,0.5);">
                        <div id="cooldown-${key}" style="width:0%; height:100%; background:#fff; transition: width 0.1s linear;"></div>
                    </div>
                `;

        // Tooltip für Details
        btn.title = `${info.name}: ${info.desc}\nCooldown: ${this.gameState.skills[key].cooldownTime / 1000} Sekunden`;
      }
    });
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
        this.saveGame();
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

  updateBuildingUI() {
    buildingsData.forEach((building, index) => {
      // 1. Zähler & SPS (Bleibt wie vorher)
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

      const countElement = this.getById(`building-count-${index}`);
      if (countElement)
        countElement.innerText = this.gameState.buildingCounts[index];
      const spsElement = this.getById(`building-sps-${index}`);
      if (spsElement)
        spsElement.innerText = this.formatNumber(actualBuildingSPS);
      const spsPctElement = this.getById(`building-sps-pct-${index}`);
      if (spsPctElement) spsPctElement.innerText = spsPercentage.toFixed(1);

      // 2. DYNAMISCHE PREISBERECHNUNG (NEU)
      const amount = this.currentBuyAmount; // 1, 10 oder 100
      let totalCost = 0;

      // Schleife um den Gesamtpreis für X Stück zu berechnen
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

      // 3. Button & Tooltip aktualisieren
      const btn = this.getById(`buy-btn-${index}`);
      const costSpan = this.getById(`buy-cost-${index}`);

      if (btn && costSpan) {
        // Text & Preis setzen
        btn.firstElementChild.innerText = `Kaufen ${amount}x`;
        costSpan.innerText = this.formatNumber(totalCost);

        // Aktiv/Inaktiv setzen
        btn.disabled = this.gameState.aktuelle_smileys < totalCost;
        costSpan.style.color =
          this.gameState.aktuelle_smileys >= totalCost ? "#4CAF50" : "#ff5252";

        // --- NEU: Detaillierter Tooltip ---
        const singleSPS =
          building.baseSPS *
          (building.prestigeMulti || 1) *
          this.gameState.globalerPrestigeMultiplikator;
        const groupSPS =
          singleSPS * (this.gameState.buildingCounts[index] || 0);

        btn.title = `Wert pro Stück: ${this.formatNumber(singleSPS)} SPS\nGesamtwert dieser Gruppe: ${this.formatNumber(groupSPS)} SPS`;
      }
    });
  }

  showNotification(message, type = "info") {
    // --- KORREKTUR START ---
    // Wir prüfen zuerst, ob der Spieler Popups deaktiviert hat.
    // Wenn settingsToasts 'false' ist, brechen wir sofort ab.
    if (this.settingsToasts === false) return;
    // --- KORREKTUR ENDE ---

    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    if (type === "success") toast.style.borderLeftColor = "#4CAF50";
    if (type === "error") toast.style.borderLeftColor = "#f44336";

    toast.innerText = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  showSkillTooltip(upgrade, e) {
    const tooltip = this.getById("prestige-tooltip-modal");
    if (!tooltip) return;
    const isPurchased = this.gameState.prestigeUpgradeStatus[upgrade.id];
    const reqs = upgrade.requirements || [];
    const requirementsMet =
      reqs.length === 0 ||
      reqs.every((reqId) => this.gameState.prestigeUpgradeStatus[reqId]);

    let statusHtml = "";
    if (isPurchased) {
      statusHtml = `<p style="color:#4CAF50; font-weight:bold; margin-top:5px;">✅ Bereits gekauft</p>`;
    } else if (!requirementsMet) {
      statusHtml = `<p style="color:#f44336; margin-top:5px;">🔒 Gesperrt (Voraussetzung fehlt)</p>`;
    } else {
      const canAfford =
        (this.gameState.prestige_punkte_verfügbar || 0) >= upgrade.cost;
      const costColor = canAfford ? "#4CAF50" : "#f44336";
      statusHtml = `<p style="color:#aaa; margin-top:5px;">Kosten: <span style="color:${costColor}; font-weight:bold;">${this.formatNumber(upgrade.cost)}</span> Punkte</p>`;
    }

    tooltip.innerHTML = `
            <h4 style="margin:0 0 5px 0; color:#FFD700; border-bottom:1px solid #555; padding-bottom:5px;">${upgrade.name}</h4>
            <p style="margin:5px 0; font-size:0.9em; color:#ddd;">${upgrade.description}</p>
            ${statusHtml}
        `;
    tooltip.style.display = "block";
    const rect = tooltip.getBoundingClientRect();
    const tooltipWidth = rect.width || 300;
    const tooltipHeight = rect.height || 150;
    let x = e.clientX + 20;
    let y = e.clientY + 20;
    if (x + tooltipWidth > window.innerWidth) x = e.clientX - tooltipWidth - 10;
    if (y + tooltipHeight > window.innerHeight)
      y = e.clientY - tooltipHeight - 10;
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
  }

  updatePetButtons() {
    this.petSystem.updatePetButtons();
  }

  updateDiamondMineStatus() {
    const mineUpgradePurchased = this.gameState.diamondMineUnlocked;
    const mineButton = this.getById("open_diamond_mine_button");
    if (mineButton) {
      mineButton.style.display = mineUpgradePurchased ? "block" : "none";
    }
    if (mineUpgradePurchased) {
      this.renderDiamondMineContent();
    }
  }

  updateGuildsButton() {
    const button = this.getById("open_guilds_button");
    if (!button) return;
    button.style.display = this.gameState.guildsUnlocked ? "block" : "none";
  }

  showClickEffect(event, amount, type = "normal") {
    const effect = document.createElement("div");
    effect.className = "click-effect";
    if (type === "crit") {
      effect.classList.add("crit-style");
      effect.innerText = "💥 " + amount;
    } else {
      effect.innerText = "+" + amount;
    }
    effect.style.left = `${event.clientX}px`;
    effect.style.top = `${event.clientY}px`;
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
  }

  animateSmiley() {
    const smiley = this.getById("smiley_button");
    if (smiley) {
      smiley.classList.add("anim-squish");
      setTimeout(() => {
        smiley.classList.remove("anim-squish");
      }, 100);
    }
  }

  // ==========================================
  // 🛡️ BUFFS ANZEIGE (NEU)
  // ==========================================
  renderBuffs() {
    // Erst prüfen, ob was abgelaufen ist
    if (this.checkBuffExpiration()) {
      this.speichereSpiel(); // Speichern, wenn Buff endet
    }

    const container = document.getElementById("buffs-container");
    if (!container) return;

    // Wir nutzen einen String-Builder statt innerHTML='', um unnötige Layout-Reflows zu minimieren,
    // aber das Entfernen der CSS-Animation ist der wichtigste Schritt gegen das Flackern.
    let html = "";
    const now = Date.now();

    // 1. RNG SPS Effekte
    const spsMult = this.gameState.activeBuffs.spsMultiplier;
    const spsEnd = this.gameState.activeBuffs.spsEndTime;

    if (spsMult !== 1 && spsEnd) {
      const secondsLeft = Math.ceil((spsEnd - now) / 1000);
      if (secondsLeft > 0) {
        if (spsMult > 1) {
          html += this.getBadgeHtml(
            "⚡ Rausch",
            `x${spsMult} (${secondsLeft}s)`,
            "good",
          );
        } else {
          html += this.getBadgeHtml(
            "🐌 Drosselung",
            `x${spsMult} (${secondsLeft}s)`,
            "bad",
          );
        }
      }
    }

    // 2. RNG Kosten Effekte
    const costMult = this.gameState.activeBuffs.costMultiplier;
    const costEnd = this.gameState.activeBuffs.costEndTime;

    if (costMult !== 1 && costEnd) {
      const secondsLeft = Math.ceil((costEnd - now) / 1000);
      if (secondsLeft > 0) {
        if (costMult < 1) {
          html += this.getBadgeHtml(
            "📉 Rabatt",
            `-${Math.round((1 - costMult) * 100)}% (${secondsLeft}s)`,
            "good",
          );
        } else {
          html += this.getBadgeHtml(
            "💸 Inflation",
            `+${Math.round((costMult - 1) * 100)}% (${secondsLeft}s)`,
            "bad",
          );
        }
      }
    }

    // 3. Aktive Skills (Diese haben eigene Timer Logic, wir zeigen sie nur als Status)
    if (this.gameState.skills) {
      Object.entries(this.gameState.skills).forEach(([key, skill]) => {
        if (skill.active) {
          // Restzeit berechnen (Trick: readyAt - cooldown = ende der active phase)
          let timeLeft = "?";
          if (skill.readyAt) {
            const endActive = skill.readyAt - skill.cooldownTime;
            const s = Math.ceil((endActive - now) / 1000);
            if (s > 0) timeLeft = s + "s";
          }
          const name = key.charAt(0).toUpperCase() + key.slice(1);
          html += this.getBadgeHtml("★ " + name, timeLeft, "good");
        }
      });
    }

    // 4. God Mode
    if (this.gameState.godModeMultiplier > 1) {
      html += this.getBadgeHtml(
        "👼 GOD MODE",
        `x${this.gameState.godModeMultiplier}`,
        "good",
      );
    }

    container.innerHTML = html;
  }

  // Kleiner Helfer für sauberen HTML Code
  getBadgeHtml(title, value, type) {
    return `
        <div class="buff-badge ${type}">
            <span>${title}</span> 
            <small style="opacity:0.8; margin-left:6px; font-family:monospace; font-size:0.9em;">${value}</small>
        </div>`;
  }

  // Hilfsfunktion zum Bauen des HTML-Elements
  createBuffBadge(container, title, value, type) {
    const div = document.createElement("div");
    div.className = `buff-badge ${type}`;
    div.innerHTML = `<span>${title}</span> <small style="opacity:0.8; margin-left:3px;">| ${value}</small>`;
    container.appendChild(div);
  }

  // ================================================================================================================
  // 8. CONTENT RENDERING
  // ================================================================================================================

  renderPrestigeTree() {
    const container = this.getById("prestige-tree-container");
    if (!container) return;

    let world = this.getById("prestige-tree-world");
    if (!world) {
      world = document.createElement("div");
      world.id = "prestige-tree-world";
      container.appendChild(world);
      this.treeX = container.clientWidth / 2;
      this.treeY = container.clientHeight / 2;
      this.treeZoom = this.treeZoom || 1.0;
    }

    world.style.transform = `translate(${this.treeX}px, ${this.treeY}px) scale(${this.treeZoom})`;
    world.innerHTML = "";

    const canvas = document.createElement("canvas");
    canvas.id = "prestige-lines";
    const CANVAS_SIZE = 4000;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    canvas.style.position = "absolute";
    canvas.style.left = `-${CANVAS_SIZE / 2}px`;
    canvas.style.top = `-${CANVAS_SIZE / 2}px`;
    canvas.style.pointerEvents = "none";
    world.appendChild(canvas);

    this.prestigeUpgrades.forEach((upgrade) => {
      const node = document.createElement("div");
      node.className = "skill-node";

      // NEU: Größen-Zuweisung nach Kosten
      if (upgrade.cost >= 25) {
        node.classList.add("node-tier-god");
      } else if (upgrade.cost >= 5) {
        node.classList.add("node-tier-keystone");
      } else {
        node.classList.add("node-tier-travel");
      }

      const pixelX = upgrade.x;
      const pixelY = upgrade.y;

      node.style.left = pixelX + "px";
      node.style.top = pixelY + "px";
      if (upgrade.category) node.classList.add("node-" + upgrade.category);

      const upgradeIndex = this.prestigeUpgrades.findIndex(
        (u) => u.id === upgrade.id,
      );
      const isBought = this.gameState.prestigeUpgradeStatus[upgradeIndex];
      const canBuy = this.canBuyPrestigeUpgrade(upgrade);

      if (isBought) {
        node.classList.add("purchased");
        // Icon für kleine Nodes weglassen, wenn gewünscht. Hier zeigen wir es.
        node.innerHTML = this.getUpgradeIcon(upgrade.type);
      } else if (canBuy) {
        node.classList.add("available");
        node.innerText = "+"; // Ein Plus sieht eleganter aus als ein Fragezeichen
        node.onclick = (e) => {
          e.stopPropagation();
          this.tryBuyPrestigeUpgrade(upgrade);
        };
      } else {
        node.classList.add("locked");
        node.innerText = "🔒";
      }

      node.addEventListener("mouseenter", (e) => {
        this.showPrestigeTooltip(e, upgrade, isBought, !canBuy && !isBought);
      });
      node.addEventListener("mouseleave", () => {
        this.hidePrestigeTooltip();
      });
      world.appendChild(node);
    });
    setTimeout(() => this.drawPrestigeLines(), 50);
  }

  setupSkillTreeControls() {
    const container = this.getById("prestige-tree-container");
    if (!container) return;
    this.treeX = container.clientWidth / 2;
    this.treeY = container.clientHeight / 2;
    this.treeZoom = 1.0; // NEU: Start-Zoom
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    container.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.startX = e.clientX - this.treeX;
      this.startY = e.clientY - this.treeY;
      container.style.cursor = "grabbing";
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
      if (container) container.style.cursor = "grab";
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      this.treeX = e.clientX - this.startX;
      this.treeY = e.clientY - this.startY;
      const world = this.getById("prestige-tree-world");
      if (world) {
        world.style.transform = `translate(${this.treeX}px, ${this.treeY}px) scale(${this.treeZoom})`;
      }
    });

    // NEU: Mausrad Zoom-Logik
    container.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomSpeed = 0.1;
      if (e.deltaY < 0) {
        this.treeZoom += zoomSpeed; // Reinzoomen
      } else {
        this.treeZoom -= zoomSpeed; // Rauszoomen
      }

      // Limitieren, damit man sich nicht im Nichts verliert
      this.treeZoom = Math.max(0.3, Math.min(this.treeZoom, 2.0));

      const world = this.getById("prestige-tree-world");
      if (world) {
        world.style.transform = `translate(${this.treeX}px, ${this.treeY}px) scale(${this.treeZoom})`;
      }
    });
  }

  drawPrestigeLines() {
    const canvas = this.getById("prestige-lines");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // --- NEU: Hintergrund-Beschriftungen der Pfade ---
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)"; // Sehr transparentes Weiß
    ctx.font = "bold 80px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Die Texte an den entsprechenden Koordinaten platzieren
    ctx.fillText("NORDEN: Pfad des Klickers", 0, -450);
    ctx.fillText("OSTEN: Pfad der Industrie", 450, 0);
    ctx.fillText("SÜDEN: Pfad der Synergie", 0, 450);
    ctx.fillText("WESTEN: Pfad der Zeit", -450, 0);

    ctx.font = "bold 120px Arial";
    ctx.fillStyle = "rgba(224, 64, 251, 0.03)"; // Sehr transparentes Lila für Götter-Ring
    ctx.fillText("A S T R A L E R   R I N G", 0, -800);
    ctx.fillText("A S T R A L E R   R I N G", 0, 800);
    // --------------------------------------------------

    ctx.lineCap = "round";

    this.prestigeUpgrades.forEach((upgrade) => {
      const reqs = upgrade.requirements || upgrade.parents || [];

      if (reqs.length > 0) {
        const targetX = upgrade.x;
        const targetY = upgrade.y;

        reqs.forEach((parentId) => {
          const parentUpgrade = this.prestigeUpgrades.find(
            (u) => u.id === parentId,
          );
          if (parentUpgrade) {
            const startX = parentUpgrade.x;
            const startY = parentUpgrade.y;
            const uIndex = this.prestigeUpgrades.findIndex(
              (u) => u.id === upgrade.id,
            );
            const pIndex = this.prestigeUpgrades.findIndex(
              (u) => u.id === parentId,
            );

            const isTargetBought =
              this.gameState.prestigeUpgradeStatus[uIndex] || false;
            const isParentBought =
              this.gameState.prestigeUpgradeStatus[pIndex] || false;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(targetX, targetY);

            if (isTargetBought && isParentBought) {
              ctx.strokeStyle = "#009ffd";
              ctx.lineWidth = 4;
            } else if (isParentBought) {
              ctx.strokeStyle = "#FFD700";
              ctx.lineWidth = 2;
            } else {
              ctx.strokeStyle = "#333";
              ctx.lineWidth = 1;
            }
            ctx.stroke();
          }
        });
      }
    });
    ctx.restore();
  }

  getUpgradeIcon(type) {
    switch (type) {
      case "click_mult":
      case "click_static":
        return "👆"; // Klick
      case "sps_mult":
      case "sps_static":
        return "⚡"; // Energie/SPS
      case "cost_reduction_buildings":
      case "cost_reduction_global":
        return "📉"; // Rabatt
      case "global_god_mode":
        return "🌟"; // Gott
      case "unlock_pets":
        return "🐾";
      case "unlock_mine":
        return "💎";
      case "unlock_guilds":
        return "🏰";
      case "crit_chance":
        return "🎯";
      case "offline_boost":
        return "💤";
      default:
        return "⚙️"; // Standard Zahnrad
    }
  }

  showPrestigeTooltip(e, upgrade, isBought, isLocked) {
    const tooltip = this.getById("prestige-tooltip-modal");
    if (!tooltip) return;
    const statusText = isBought
      ? "✅ Gekauft"
      : isLocked
        ? "🔒 Gesperrt (Voraussetzung fehlt!)"
        : "Klicken zum Kaufen";
    const colorTitle = isBought ? "#4CAF50" : isLocked ? "#777" : "#FFD700";

    tooltip.innerHTML = `
            <h4 style="color:${colorTitle}; margin:0 0 5px 0;">${upgrade.name}</h4>
            <p style="font-size:0.9em; margin:0 0 10px 0; color:#ddd;">${upgrade.description}</p>
            <div style="border-top:1px solid #444; padding-top:5px; font-size:0.85em;">
                <p style="margin:0;">Kosten: <span style="color:#FFD700; font-weight:bold;">${this.formatNumber(upgrade.cost)}</span> Punkte</p>
                <p style="margin:0; color:${isBought ? "#4CAF50" : isLocked ? "#f44336" : "#aaa"}">${statusText}</p>
            </div>
        `;
    tooltip.style.display = "block";
    const rect = tooltip.getBoundingClientRect();
    const offset = 15;
    let left = e.clientX + offset;
    let top = e.clientY + offset;
    if (left + rect.width > window.innerWidth)
      left = e.clientX - rect.width - offset;
    if (top + rect.height > window.innerHeight)
      top = e.clientY - rect.height - offset;
    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  }

  hidePrestigeTooltip() {
    const tooltip = this.getById("prestige-tooltip-modal");
    if (tooltip) tooltip.style.display = "none";
  }

  buyPrestigeUpgrade(id) {
    if (!this.gameState.prestigeUpgrades) this.gameState.prestigeUpgrades = [];
    if (this.gameState.prestigeUpgrades.includes(id)) return;
    const upgrade = prestigeUpgrades.find((u) => u.id === id);
    if (!upgrade) return;

    if (upgrade.requirements && upgrade.requirements.length > 0) {
      const allMet = upgrade.requirements.every((reqId) =>
        this.gameState.prestigeUpgrades.includes(reqId),
      );
      if (!allMet) {
        this.showNotification(
          "🔒 Du musst erst das vorherige Upgrade kaufen!",
          "error",
        );
        return;
      }
    }

    if (this.gameState.prestigeCurrency >= upgrade.cost) {
      this.gameState.prestigeCurrency -= upgrade.cost;
      this.gameState.prestigeUpgrades.push(id);
      if (upgrade.type === "unlock_pets")
        this.showNotification("🐶 Pet Shop freigeschaltet!", "success");
      if (upgrade.type === "unlock_mine")
        this.showNotification("💎 Mine freigeschaltet!", "success");
      if (upgrade.type === "unlock_guilds")
        this.showNotification("⚔️ Gilden freigeschaltet!", "success");

      this.checkFeatureUnlocks();
      this.recalculateGlobalMultipliers();
      this.showNotification(`✅ Upgrade gekauft: ${upgrade.name}`, "success");
      this.speichereSpiel();
      this.renderPrestigeTree();
      this.updateUI();
    } else {
      this.showNotification("❌ Nicht genug Prestige-Punkte!", "error");
    }
  }

  checkFeatureUnlocks() {
    const hasPets = this.gameState.petsUnlocked;
    const hasMine = this.gameState.diamondMineUnlocked;
    const hasGuilds = this.gameState.guildsUnlocked;

    // Pet Shop Button (Unterstrich!)
    const btnPets = document.getElementById("open_pet_shop_button");
    if (btnPets) {
      // Wenn freigeschaltet -> flex, sonst none
      btnPets.style.display = hasPets ? "flex" : "none";
    }

    // Mine Button
    const btnMine = document.getElementById("open_diamond_mine_button");
    if (btnMine) {
      btnMine.style.display = hasMine ? "flex" : "none";
    }

    // Guilds Button
    const btnGuilds = document.getElementById("open_guilds_button");
    if (btnGuilds) {
      btnGuilds.style.display = hasGuilds ? "flex" : "none";
    }

    // HINWEIS: Market, Skins und Erfolge sind IMMER sichtbar,
    // daher müssen sie hier nicht behandelt werden.
  }

  renderPetShop() {
    this.petSystem.renderPetShop();
  }

  renderGuildsContent() {
    this.guildSystem.renderGuildsContent();
  }

  createBuildingElements() {
    const buildingGrid = this.getById("building-grid");
    if (!buildingGrid) return;
    buildingGrid.innerHTML = "";

    // Wir rendern NUR die normalen Gebäude aus buildingsData
    buildingsData.forEach((building, index) => {
      const buildingDiv = document.createElement("div");
      buildingDiv.className = "building-item";
      buildingDiv.dataset.index = index;

      const icon = this.getBuildingIcon(index);

      // Modernes Layout: Icon links, Info rechts, Kaufen-Button unten volle Breite
      buildingDiv.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                    <div style="font-size: 2.5rem; filter: drop-shadow(0 0 5px rgba(0,0,0,0.5)); min-width: 50px; text-align:center;">
                        ${icon}
                    </div>
                    <div style="flex:1; overflow:hidden;">
                        <h3 style="margin:0; font-size:1.0rem; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${building.name}">
                            ${building.name} 
                        </h3>
                        <div style="font-size:0.85em; color:#FFD700; margin-top:2px;">
                            Besitz: <span id="building-count-${index}" style="font-weight:bold;">0</span>
                        </div>
                    </div>
                </div>

                <div class="production" style="font-size:0.8em; color:#aaa; margin-bottom:8px; border-top:1px solid #444; padding-top:5px; display:flex; justify-content:space-between;">
                    <span>Prod: <span id="building-sps-${index}" style="color:#fff;">0</span> SPS</span>
                    <small style="color:#666;">(<span id="building-sps-pct-${index}">0.0</span>%)</small>
                </div>
                
                <div class="button-group" data-tooltip-type="building" data-index="${index}"> 
                    <button id="buy-btn-${index}" class="btn-buy" style="width:100%; display:flex; justify-content:space-between; align-items:center; padding:8px 12px;">
                        <span>Kaufen</span>
                        <span id="buy-cost-${index}" style="font-weight:bold;">---</span>
                    </button>
                </div>
            `;
      buildingGrid.appendChild(buildingDiv);
    });
  }

  createPrestigeUpgradeElements() {
    const container = this.getById("prestige-tree-container");
    const infoContainer = this.getById("info_prestige_container");
    const CONTAINER_WIDTH = 600;
    const centerX = CONTAINER_WIDTH / 2;
    const nodeOffset = 20;
    const containers = [];
    if (container) containers.push({ element: container, isInfo: false });
    if (infoContainer)
      containers.push({ element: infoContainer, isInfo: true });

    containers.forEach(({ element, isInfo }) => {
      if (!element) return;
      element.innerHTML = "";
      element.style.position = "relative";
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.id = isInfo ? "prestige-lines-info" : "prestige-lines";
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.style.position = "absolute";
      svg.style.top = "0";
      svg.style.left = "0";
      element.appendChild(svg);

      prestigeUpgrades.forEach((upgrade) => {
        const upgradeDiv = document.createElement("div");
        upgradeDiv.className = `prestige-node ${isInfo ? "info-node" : ""}`;
        upgradeDiv.dataset.id = upgrade.id;
        upgradeDiv.style.left = `calc(50% + ${upgrade.x}px)`;
        upgradeDiv.style.top = `${upgrade.y}px`;
        upgradeDiv.dataset.description = upgrade.description;
        upgradeDiv.dataset.cost = this.formatNumber(upgrade.cost);
        const buyButtonHtml = isInfo
          ? ""
          : `<button class="prestige-buy-button" data-id="${upgrade.id}" style="display:none;"></button>`;
        upgradeDiv.innerHTML = `<div class="node-icon"></div>${buyButtonHtml}`;
        element.appendChild(upgradeDiv);

        if (upgrade.requirements) {
          upgrade.requirements.forEach((reqId) => {
            const reqUpgrade = prestigeUpgrades.find((u) => u.id === reqId);
            if (reqUpgrade) {
              const line = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line",
              );
              line.setAttribute("x1", `${reqUpgrade.x + centerX + nodeOffset}`);
              line.setAttribute("y1", `${reqUpgrade.y + nodeOffset}`);
              line.setAttribute("x2", `${upgrade.x + centerX + nodeOffset}`);
              line.setAttribute("y2", `${upgrade.y + nodeOffset}`);
              line.setAttribute("stroke", "#009ffd");
              line.setAttribute("stroke-width", "3");
              line.setAttribute("class", "prestige-line");
              line.dataset.from = reqId;
              line.dataset.to = upgrade.id;
              svg.appendChild(line);
            }
          });
        }
      });
      if (isInfo) this.createPrestigeInfoList();
    });
  }

  // ================================================================================================================
  // 9. EVENT LISTENERS
  // ================================================================================================================

  openPrestigeConfirmModal() {
    const pointsToGain = this.calculatePrestigeGain();

    if (pointsToGain <= 0) {
      this.showNotification("Nicht genug Smileys für Prestige!", "error");
      return;
    }

    // Modal-Text aktualisieren
    const lifetimeDisplay = document.getElementById(
      "prestige-lifetime-display",
    );
    const gainDisplay = document.getElementById("prestige-gain-display");

    if (lifetimeDisplay) {
      lifetimeDisplay.textContent = this.formatNumber(
        this.gameState.gesammelte_smileys,
      );
    }
    if (gainDisplay) {
      gainDisplay.textContent = this.formatNumber(pointsToGain);
    }

    // Modal öffnen
    this.openModal("prestige-modal");
  }

  setupMainEventListeners() {
    console.log("🔌 Starte Event-Listener Setup...");

    // --- 1. NAVBAR HANDLER ---
    const navHome = document.getElementById("nav-home");
    if (navHome) {
      navHome.addEventListener("click", (e) => {
        e.preventDefault();
        this.switchView("home");
      });
    }

    const navPrestige = document.getElementById("nav-prestige");
    if (navPrestige) {
      navPrestige.addEventListener("click", (e) => {
        e.preventDefault();
        this.openModal("prestige-shop-modal");
        this.updatePrestigeUI();
      });
    }

    // --- 2. GLOBALE LISTENER ---
    window.addEventListener("beforeunload", () => {
      this.saveGame();
    });

    const smileyBtn = document.getElementById("smiley_button");
    if (smileyBtn)
      smileyBtn.addEventListener("click", (e) => this.klickeSmiley(e));

    // --- 3. FEATURE BUTTONS ---

    // Wiki / Smileypedia Button
    // Wiki / Smileypedia Button
    const btnWiki = document.getElementById("open_wiki_btn");
    if (btnWiki) {
      btnWiki.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("📖 Wiki Button geklickt");
        this.openWiki();
      });
    } else {
      console.error("❌ Button open_wiki_btn nicht gefunden!");
    }

    // Wiki Close Button
    const closeWikiBtn = document.getElementById("close-wiki-button");
    if (closeWikiBtn) {
      closeWikiBtn.addEventListener("click", () => {
        console.log("📖 Wiki schließen");
        this.closeModal("wiki-modal");
      });
    } else {
      console.error("❌ Close-Button close-wiki-button nicht gefunden!");
    }

    // Pet Shop
    const btnPets = document.getElementById("open_pet_shop_button");
    if (btnPets) {
      btnPets.addEventListener("click", (e) => {
        e.preventDefault();
        this.updatePetButtons();
        this.openModal("pet-shop-modal");
      });
    } else {
      console.error("❌ Button open_pet_shop_button nicht gefunden!");
    }

    // Mine
    const btnMine = document.getElementById("open_diamond_mine_button");
    if (btnMine) {
      btnMine.addEventListener("click", (e) => {
        e.preventDefault();
        this.updateDiamondMineStatus();
        this.openModal("diamond-mine-modal");
      });
    }

    // Gilden
    const btnGuilds = document.getElementById("open_guilds_button");
    if (btnGuilds) {
      btnGuilds.addEventListener("click", (e) => {
        e.preventDefault();
        this.renderGuildsContent();
        this.openModal("guilds-modal");
      });
    }

    // Market (Schwarzmarkt) - JETZT ALS MODAL
    const btnMarket = document.getElementById("open_blackmarket_button");
    if (btnMarket) {
      btnMarket.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("👾 Market Button geklickt");

        // Modal erstellen falls nicht vorhanden
        let bmModal = document.getElementById("blackmarket-modal");
        if (!bmModal) {
          bmModal = document.createElement("div");
          bmModal.id = "blackmarket-modal";
          bmModal.className = "modal";
          bmModal.innerHTML = `
          <div class="modal-content large" style="background:#05000a; border:1px solid #d500f9; box-shadow: 0 0 30px rgba(138, 43, 226, 0.3);">
            <span class="close-button" style="color:#fff; font-size:2rem;">&times;</span>
            <h2>👾 Schwarzmarkt</h2>
            <div id="gem_shop_container_main"></div>
          </div>
        `;
          document.body.appendChild(bmModal);

          // Close Button Listener
          const closeBtn = bmModal.querySelector(".close-button");
          if (closeBtn) {
            closeBtn.addEventListener("click", () => {
              this.closeModal("blackmarket-modal");
            });
          }

          // Overlay Click Listener
          bmModal.addEventListener("click", (e) => {
            if (e.target === bmModal) {
              this.closeModal("blackmarket-modal");
            }
          });
        }

        // Modal öffnen
        this.openModal("blackmarket-modal");

        // Inhalt rendern
        if (this.gemSystem) {
          this.gemSystem.renderGemShop("gem_shop_container_main");
        }
      });
    } else {
      console.error("❌ Button open_blackmarket_button nicht gefunden!");
    }

    // Settings Button
    const btnSettings = document.getElementById("open-settings-button");
    if (btnSettings) {
      btnSettings.addEventListener("click", (e) => {
        e.preventDefault();
        this.openModal("settings-modal");
      });
    }

    // Settings Close Button
    const closeSettingsBtn = document.getElementById("close-settings-button");
    if (closeSettingsBtn) {
      closeSettingsBtn.addEventListener("click", () => {
        this.closeModal("settings-modal");
      });
    }

    // Skins - JETZT ALS MODAL
    const btnSkins = document.getElementById("open_wardrobe_button");
    if (btnSkins) {
      btnSkins.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("🎩 Skins Button geklickt");

        // Modal erstellen falls nicht vorhanden
        let wModal = document.getElementById("wardrobe-modal");
        if (!wModal) {
          wModal = document.createElement("div");
          wModal.id = "wardrobe-modal";
          wModal.className = "modal";
          wModal.innerHTML = `
          <div class="modal-content large" style="background:#111; border:1px solid #444;">
            <span class="close-button" style="color:#fff; font-size:2rem;">&times;</span>
            <h2>Kleiderschrank 🎩</h2>
            <p style="text-align:center; color:#aaa; font-size:0.9em;">Bezahle mit Corrupted Smileys (👾)</p>
            <div id="wardrobe-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:15px; margin-top:20px;"></div>
          </div>
        `;
          document.body.appendChild(wModal);

          // Close Button Listener
          const closeBtn = wModal.querySelector(".close-button");
          if (closeBtn) {
            closeBtn.addEventListener("click", () => {
              this.closeModal("wardrobe-modal");
            });
          }

          // Overlay Click Listener
          wModal.addEventListener("click", (e) => {
            if (e.target === wModal) {
              this.closeModal("wardrobe-modal");
            }
          });
        }

        // Modal öffnen
        this.openModal("wardrobe-modal");

        // Inhalt rendern
        if (this.skinSystem) {
          this.skinSystem.renderWardrobe();
        }
      });
    } else {
      console.error("❌ Button open_wardrobe_button nicht gefunden!");
    }

    // Achievements
    const btnAchieve = document.getElementById("show_achievements_button");
    if (btnAchieve) {
      btnAchieve.addEventListener("click", (e) => {
        e.preventDefault();
        this.createInfoAchievementElements();
        this.openModal("achievements_info_modal");
      });
    }

    // Skill Tree Button (im Prestige Shop)
    const btnSkillTree = document.getElementById("open_skill_tree_button");
    if (btnSkillTree) {
      btnSkillTree.addEventListener("click", () => {
        this.closeModal("prestige-shop-modal");
        this.openModal("skill_tree_modal");
      });
    }

    // Prestige Reset Button
    const btnPrestigeReset = document.getElementById(
      "prestige_reset_button_page",
    );
    if (btnPrestigeReset) {
      btnPrestigeReset.addEventListener("click", () => {
        this.openPrestigeConfirmModal();
      });
    }

    // --- 4. SCHLIESSEN-BUTTONS ---
    const closeMap = {
      "close-pet-shop-button": "pet-shop-modal",
      close_diamond_mine_button: "diamond-mine-modal",
      close_guilds_button: "guilds-modal",
      close_achievements_button: "achievements_info_modal",
    };

    Object.keys(closeMap).forEach((btnId) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener("click", () => {
          this.closeModal(closeMap[btnId]);
        });
      }
    });

    // --- 5. TOGGLE BUTTONS (1x, 10x, 100x) ---
    const toggleContainer = document.getElementById("buy-amount-toggles");
    if (toggleContainer) {
      toggleContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-toggle");
        if (!btn) return;

        document
          .querySelectorAll(".btn-toggle")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        this.selectedBuyAmount = parseInt(btn.dataset.amount, 10);
        this.currentBuyAmount = this.selectedBuyAmount;
        this.updateBuildingUI();
      });
    }

    // --- 6. GEBÄUDE-KAUF (EVENT DELEGATION) ---
    const grid = document.getElementById("building-grid");
    if (grid) {
      grid.addEventListener("click", (e) => {
        const button = e.target.closest(".btn-buy");
        if (!button) return;
        const buildingItem = button.closest(".building-item");
        const index = parseInt(buildingItem.dataset.index, 10);
        if (!isNaN(index)) {
          this.kaufeMehrereGebaeude(index, this.currentBuyAmount || 1);
        }
      });
    }

    console.log("✅ Event-Listener fertig gesetzt");
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

  setupPrestigeButtons() {
    // OHNE DOMContentLoaded, weil constructor schon nach DOM-Load läuft
    const resetBtn = document.getElementById("prestige_reset_button");
    console.log("prestige_reset_button gefunden:", resetBtn);

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        console.log("Prestige Button geklickt!");
        this.zeigePrestigeDetails();
      });
    } else {
      console.error("prestige_reset_button NICHT gefunden!");
    }

    // Skill-Tree Button
    const skillTreeBtn = document.getElementById("open_skill_tree_button");
    if (skillTreeBtn) {
      skillTreeBtn.addEventListener("click", () => {
        this.closeModal("prestige-shop-modal");
        this.openModal("skill_tree_modal");
        this.renderPrestigeTree();
      });
    }

    // Bestätigungs-Buttons im Prestige-Modal
    const confirmBtn = document.getElementById("btn-do-prestige");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        this.prestigeReset();
        this.closeModal("prestige-modal");
      });
    }

    const cancelBtn = document.getElementById("btn-cancel-prestige");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.closeModal("prestige-modal");
      });
    }

    // Respec Button
    const resetPrestigeUpgradesButton = document.getElementById(
      "reset_prestige_upgrades_button",
    );
    if (resetPrestigeUpgradesButton) {
      resetPrestigeUpgradesButton.addEventListener("click", () => {
        if (
          confirm(
            "Möchtest du wirklich alle investierten Punkte zurücksetzen? Du erhältst die Punkte zurück.",
          )
        ) {
          this.respecPrestigeUpgrades();
        }
      });
    }
  }

  respecPrestigeUpgrades() {
    let refundedPoints = 0;
    this.gameState.prestigeUpgradeStatus.forEach((bought, id) => {
      if (bought) {
        const upgrade = prestigeUpgrades.find((u) => u.id === id);
        if (upgrade) {
          refundedPoints += upgrade.cost;
        }
      }
    });

    if (refundedPoints > 0) {
      if (
        !confirm(
          "Möchtest du wirklich alle investierten Prestige-Punkte zurücksetzen?",
        )
      ) {
        return;
      }
      this.gameState.activePet = null;
      this.gameState.prestige_punkte_verfügbar += refundedPoints;
      this.gameState.prestigeUpgradeStatus.fill(false);
      this.applyAllBoni();
      this.speichereSpiel();
      this.updatePrestigeUI();
      this.renderPrestigeTree();
      this.updateUI();
      this.showNotification(
        `Reset erfolgreich! ${refundedPoints} Punkte erstattet.`,
        "success",
      );
    } else {
      this.showNotification("Du hast noch keine Punkte investiert.", "info");
    }
  }

  setupInfoPageEventListeners() {
    // Veraltete Listener entfernt.
    // Das Wiki wird jetzt über openWiki() gesteuert.
    console.log("ℹ️ Info-System auf Smileypedia umgestellt.");

    // Listener für das Museum (falls noch nötig)
    const museumModal = this.getById("museum_modal");
    const closeMuseumBtn = this.getById("close_museum_button");
    if (closeMuseumBtn && museumModal) {
      closeMuseumBtn.onclick = () => (museumModal.style.display = "none");
    }
  }

  setupSettingsModalListeners() {
    const settingsModal = this.getById("settings-modal");
    const openSettingsButton = this.getById("open-settings-button");
    const closeSettingsButton = this.getById("close-settings-button");
    const exportButton = this.getById("export-save-button");
    const importButton = this.getById("import-save-button");
    const saveDataTextarea = this.getById("save-data-textarea");

    // Audio Inputs
    const musicVolumeSlider = this.getById("music-volume");
    const soundVolumeSlider = this.getById("sound-volume");

    // --- NEU: Benachrichtigungs Inputs ---
    const toastCheck = this.getById("setting-toast-toggle");
    const desktopCheck = this.getById("setting-desktop-toggle");

    // 1. Audio Listener
    if (musicVolumeSlider) {
      musicVolumeSlider.addEventListener("input", (e) => {
        localStorage.setItem("musicVolume", e.target.value);
        this.setzeLautstaerke();
      });
    }
    if (soundVolumeSlider) {
      soundVolumeSlider.addEventListener("input", (e) => {
        localStorage.setItem("soundVolume", e.target.value);
        this.setzeLautstaerke();
      });
    }

    // 2. Benachrichtigungs Listener (NEU)
    if (toastCheck) {
      toastCheck.addEventListener("change", (e) => {
        this.settingsToasts = e.target.checked;
        localStorage.setItem("setting_toasts", e.target.checked);
        // Feedback nur wenn aktiviert (sonst sieht man es ja nicht)
        if (e.target.checked)
          this.showNotification("Popups aktiviert!", "success");
      });
    }

    if (desktopCheck) {
      desktopCheck.addEventListener("change", (e) => {
        const isActive = e.target.checked;
        this.settingsDesktop = isActive;
        localStorage.setItem("setting_desktop", isActive);

        if (isActive) {
          // Browser um Erlaubnis fragen
          if ("Notification" in window) {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                new Notification("Smiley Clicker", {
                  body: "Desktop-Benachrichtigungen aktiviert!",
                  icon: "smiley.png",
                });
              } else {
                // Wenn abgelehnt, Haken wieder rausnehmen
                e.target.checked = false;
                this.settingsDesktop = false;
                localStorage.setItem("setting_desktop", false);
                this.showNotification("Berechtigung verweigert.", "error");
              }
            });
          } else {
            this.showNotification("Browser unterstützt keine Notis.", "error");
            e.target.checked = false;
          }
        }
      });
    }

    // 3. Modal & Speicher Buttons
    openSettingsButton?.addEventListener("click", (e) => {
      e.preventDefault();
      this.speichereSpiel();
      this.showNotification(
        "💾 Spielstand erfolgreich gespeichert.",
        "success",
      );
      const savedData = localStorage.getItem("smileyGameSave");
      if (saveDataTextarea) {
        saveDataTextarea.value = savedData || "";
      }
      if (settingsModal) settingsModal.style.display = "flex";
    });

    closeSettingsButton?.addEventListener("click", () => {
      if (settingsModal) settingsModal.style.display = "none";
    });

    exportButton?.addEventListener("click", () => {
      this.speichereSpiel();
      const saveData = localStorage.getItem("smileyGameSave");
      if (saveData && saveDataTextarea) {
        saveDataTextarea.value = saveData;
        try {
          navigator.clipboard.writeText(saveData).then(
            () => {
              this.showNotification(
                "Spielstand in Zwischenablage kopiert.",
                "success",
              );
            },
            () => {
              // Fallback
              if (document.execCommand && saveDataTextarea.select) {
                saveDataTextarea.select();
                document.execCommand("copy");
                this.showNotification("Spielstand kopiert.", "success");
              }
            },
          );
        } catch (err) {
          // Fallback 2
          if (document.execCommand && saveDataTextarea.select) {
            saveDataTextarea.select();
            document.execCommand("copy");
          }
        }
      }
    });

    importButton?.addEventListener("click", () => {
      const saveData = saveDataTextarea?.value.trim();
      if (
        saveData &&
        confirm(
          "Möchtest du diesen Spielstand wirklich importieren? Dein aktueller Fortschritt wird überschrieben.",
        )
      ) {
        if (this.ladeSpiel(saveData)) {
          this.speichereSpiel();
          location.reload();
        } else {
          console.error("Import fehlgeschlagen. Überprüfe den Code.");
          this.showNotification("Code ungültig!", "error");
        }
      }
    });
  }

  setupTooltips() {
    const tooltip = this.getById("custom-tooltip");
    if (!tooltip) return;

    // Event-Listener für das ganze Dokument delegieren
    document.body.addEventListener("mousemove", (e) => {
      if (tooltip.style.display === "block") {
        // Tooltip folgt der Maus (mit etwas Abstand)
        const offset = 15;
        let left = e.clientX + offset;
        let top = e.clientY + offset;

        // Verhindern, dass Tooltip aus dem Bildschirm ragt
        if (left + tooltip.offsetWidth > window.innerWidth) {
          left = e.clientX - tooltip.offsetWidth - offset;
        }
        if (top + tooltip.offsetHeight > window.innerHeight) {
          top = e.clientY - tooltip.offsetHeight - offset;
        }

        tooltip.style.left = left + "px";
        tooltip.style.top = top + "px";
      }
    });

    // Mouseover-Logik für Elemente mit 'data-tooltip' Attribut
    // Wir nutzen Event Delegation, das spart Performance
    document.body.addEventListener("mouseover", (e) => {
      const target = e.target.closest("[data-tooltip-type]");
      if (target) {
        const type = target.dataset.tooltipType;
        const index = target.dataset.index; // Optional, für Arrays
        this.showCustomTooltip(type, index);
      }
    });

    document.body.addEventListener("mouseout", (e) => {
      const target = e.target.closest("[data-tooltip-type]");
      if (target) {
        tooltip.style.display = "none";
      }
    });
  }

  showCustomTooltip(type, index) {
    const tooltip = this.getById("custom-tooltip");
    if (!tooltip) return;

    let htmlContent = "";

    // --- TYP 1: GEBÄUDE KAUFEN ---
    if (type === "building") {
      const i = parseInt(index);
      const building =
        i === 8
          ? uniqueBuildingsData.find((u) => u.id === "diamond_mine")
          : buildingsData[i];

      if (building) {
        const count = this.gameState.buildingCounts[i];
        const baseSPS = building.baseSPS * (building.prestigeMulti || 1);
        const totalSPS =
          baseSPS * count * this.gameState.globalerPrestigeMultiplikator;

        // Kosten berechnen
        let cost = 0;
        const amount = this.currentBuyAmount || 1;
        if (i === 8) {
          // Mine ist unique
          cost = this.getBuildingCost(i, count);
        } else {
          for (let k = 0; k < amount; k++)
            cost += this.getBuildingCost(i, count + k);
        }

        const canAfford = this.gameState.aktuelle_smileys >= cost;

        htmlContent = `
                    <h4>${building.name}</h4>
                    <div class="tooltip-stat"><span>Besitz:</span> <span class="highlight-gold">${count}</span></div>
                    <div class="tooltip-stat"><span>Produktion (Basis):</span> <span>${this.formatNumber(baseSPS)} SPS</span></div>
                    <div class="tooltip-stat"><span>Gesamt-Beitrag:</span> <span class="highlight-green">+${this.formatNumber(totalSPS)} SPS</span></div>
                    <hr style="border-color:#555; margin:5px 0;">
                    <div class="tooltip-stat">
                        <span>Kosten (${i === 8 ? "1x" : amount + "x"}):</span> 
                        <span class="${canAfford ? "highlight-green" : "highlight-red"}">${this.formatNumber(cost)} Smileys</span>
                    </div>
                    <div style="font-size:0.75rem; color:#aaa; margin-top:5px; font-style:italic;">
                        ${i === 8 ? "Produziert Diamanten." : "Klicke zum Kaufen."}
                    </div>
                `;
      }
    }

    // --- TYP 2: STATS ---
    else if (type === "stats_sps") {
      htmlContent = `
                <h4>SPS Berechnung</h4>
                <p>Deine Smileys pro Sekunde setzen sich zusammen aus:</p>
                <div class="tooltip-stat"><span>1. Gebäude Basis:</span> <span>${this.formatNumber(this.getSmileysPerSecond())}</span></div>
                <div class="tooltip-stat"><span>2. Globaler Multi:</span> <span class="highlight-gold">x${this.gameState.globalerPrestigeMultiplikator.toFixed(2)}</span></div>
                <hr style="border-color:#555; margin:5px 0;">
                <div style="font-size:0.8em; color:#ccc;">
                    Enthält Boni aus Prestige-Punkten, Resets, Upgrades, Gilden und Skills.
                </div>
            `;
    }

    if (htmlContent) {
      tooltip.innerHTML = htmlContent;
      tooltip.style.display = "block";
    }
  }

  // ================================================================================================================
  // 10. INFO SEITEN RENDERING
  // ================================================================================================================

  createBuildingInfoElements() {
    const container = this.getById("info_buildings_container");
    if (!container) return;

    container.innerHTML = "";
    container.className = "info-grid";

    // Wir nutzen die Standard-Liste
    const allBuildings = buildingsData;
    const globalMulti = this.gameState.globalerPrestigeMultiplikator;

    allBuildings.forEach((building, index) => {
      const item = document.createElement("div");
      item.className = "info-upgrade-item";

      // Icon & Besitz abrufen
      const icon = this.getBuildingIcon(index);
      const count = this.gameState.buildingCounts[index] || 0;

      // Werte berechnen
      const baseSPSPerUnit = building.baseSPS * (building.prestigeMulti || 1);
      const scaledSPSPerUnit = baseSPSPerUnit * globalMulti;
      const totalSPSFromBuilding = scaledSPSPerUnit * count;

      // Layout analog zum Hauptmenü, aber mit mehr Details
      item.innerHTML = `
                <div style="display:flex; align-items:center; gap:15px; margin-bottom:10px;">
                    <div style="font-size: 2.5rem; filter: drop-shadow(0 0 5px rgba(0,0,0,0.5)); min-width: 50px; text-align:center;">
                        ${icon}
                    </div>
                    <div style="flex:1;">
                        <h4 style="margin:0; font-size:1.1rem; color:var(--color-accent-blue);">${building.name}</h4>
                        <div style="font-size:0.85em; color:#FFD700; margin-top:2px;">
                            Im Besitz: <strong>${this.formatNumber(count)}</strong>
                        </div>
                    </div>
                </div>

                <div style="font-size:0.85em; color:#ccc; border-top:1px solid #444; padding-top:8px; margin-top:5px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span style="color:#888;">Basis SPS:</span>
                        <span>${this.formatNumber(baseSPSPerUnit)}</span>
                    </div>
                     <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span>Aktuell (Buffed):</span>
                        <span style="color:#fff; font-weight:bold;">${this.formatNumber(scaledSPSPerUnit)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; border-top:1px dashed #555; padding-top:4px; margin-top:4px; color:#4CAF50;">
                        <span>Gesamt-Ertrag:</span>
                        <strong>${this.formatNumber(totalSPSFromBuilding)} SPS</strong>
                    </div>
                </div>
            `;
      container.appendChild(item);
    });
  }

  createInfoGlobalUpgradeElements() {
    const container = this.getById("info_global_upgrades_container");
    if (!container) return;

    container.innerHTML = "";
    container.className = "info-grid";

    globalUpgrades.forEach((u) => {
      const bought = this.gameState.researchStatus[u.id];

      // 1. Passendes Icon holen
      let icon = this.getUpgradeIcon(u.type);

      // 2. Name Fallback (Falls in data.js kein Name steht)
      let name = u.name;
      if (!name || name === "Unbekanntes Upgrade") {
        // Versuch, einen Namen aus der Beschreibung zu erraten oder generisch zu benennen
        if (u.type.includes("click")) name = "Klick-Booster";
        else if (u.type.includes("sps")) name = "Produktions-Boost";
        else name = "Technologie";
      }

      // 3. Karte erstellen
      const item = document.createElement("div");
      item.className = `info-upgrade-item ${bought ? "purchased" : "locked"}`;

      // Styling für Status
      const statusColor = bought ? "#4CAF50" : "#ff5252";
      const statusText = bought ? "ERFORSCHT" : "OFFEN";

      if (bought) {
        item.style.borderColor = "#4CAF50";
        item.style.background = "rgba(76, 175, 80, 0.05)";
      } else {
        item.style.borderColor = "#555";
        item.style.opacity = "0.8";
      }

      item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:10px;">
                    <div style="font-size:2em;">${icon}</div>
                    <div style="font-size:0.7em; font-weight:bold; color:${statusColor}; border:1px solid ${statusColor}; padding:2px 6px; border-radius:4px;">
                        ${statusText}
                    </div>
                </div>
                
                <h4 style="margin:0 0 5px 0; font-size:1rem; color:#fff; min-height:1.2em;">
                    ${name}
                </h4>
                
                <p style="font-size:0.85em; color:#ccc; min-height:40px; margin-bottom:10px;">
                    ${u.description}
                </p>
                
                ${
                  !bought
                    ? `
                <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:8px; font-size:0.9em; color:#FFD700; display:flex; justify-content:space-between;">
                    <span>Kosten:</span>
                    <strong>${this.formatNumber(this.getGlobalUpgradeCost(u))}</strong>
                </div>`
                    : ""
                }
            `;
      container.appendChild(item);
    });
  }

  createInfoPetsElements() {
    this.petSystem.createInfoPetsElements();
  }

  createInfoAchievementElements() {
    const container = this.getById("info_achievements_container");
    if (!container) return;

    container.innerHTML = "";
    container.className = "info-grid"; // <--- WICHTIG

    achievementsData.forEach((a, i) => {
      const unlocked = this.gameState.achievementsUnlocked[i];
      const item = document.createElement("div");
      item.className = `info-upgrade-item ${unlocked ? "purchased" : "locked"}`;
      if (!unlocked) item.style.opacity = "0.5";

      item.innerHTML = `
                <h4 style="color:${unlocked ? "#FFD700" : "#888"}">${unlocked ? "🏆" : "🔒"} ${a.name}</h4>
                <p>${a.description}</p>
                ${unlocked ? '<span style="color:#4CAF50; font-size:0.8em">Freigeschaltet!</span>' : ""}
            `;
      container.appendChild(item);
    });
  }
  createPrestigeInfoList() {
    const container = this.getById("info_prestige_container");
    if (!container) return;
    container.className = "info-grid";
    container.innerHTML = "";
    prestigeUpgrades.forEach((upgrade) => {
      const isPurchased = this.gameState.prestigeUpgradeStatus[upgrade.id];
      let icon = "★";
      if (upgrade.type === "unlock_pets") icon = "🐾";
      if (upgrade.type === "unlock_mine") icon = "💎";
      if (upgrade.type === "unlock_guilds") icon = "⚔️";
      if (upgrade.type === "click_mult") icon = "👆";
      if (upgrade.type === "sps_mult") icon = "⚡";

      const item = document.createElement("div");
      item.className = `info-upgrade-item ${isPurchased ? "bought-upgrade" : ""}`;
      if (!isPurchased) {
        item.style.borderColor = "#555";
        item.style.opacity = "0.9";
      }
      item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <h3 style="margin:0; font-size:1.1rem; color:${isPurchased ? "#fff" : "#aaa"};">
                        ${icon} ${upgrade.name}
                    </h3>
                    ${isPurchased ? '<span style="color:#4CAF50;">✔ Gekauft</span>' : ""}
                </div>
                <p style="min-height:40px;">${upgrade.description}</p>
                <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:5px; margin-top:5px; font-size:0.9em;">
                    <strong>Kosten:</strong> <span style="color:#FFD700;">${this.formatNumber(upgrade.cost)}</span> Punkte
                </div>
            `;
      container.appendChild(item);
    });
  }

  createInfoStatsElements() {
    const container = this.getById("info_stats_container");
    if (!container) return;

    container.innerHTML = "";
    container.className = "info-grid"; // Grid Layout beibehalten

    // --- BERECHNUNGEN (Bleiben gleich) ---
    const prestige = this.calculatePrestigeEffects();
    const globalRed = this.gameState.globalCostReduction || 0;
    const guildRed = this.gameState.guildCostReduction || 0;
    const prestigeRed = prestige.costReduction || 0;
    let petBuildingRed = 0;
    let petUpgradeRed = 0;
    let activePetName = "Keins";

    if (this.gameState.activePet) {
      const pet = petsData.find((p) => p.id === this.gameState.activePet);
      if (pet) {
        activePetName = pet.name;
        const level = this.gameState.petLevels[pet.id] || 0;
        const stats = this.calculatePetStat(pet, level);
        if (pet.effectType === "cost_reduction_buildings")
          petBuildingRed = stats.currentEffect;
        if (pet.effectType === "cost_reduction_upgrades")
          petUpgradeRed = stats.currentEffect;
      }
    }

    const totalBuildingMult =
      (1 - globalRed) *
      (1 - guildRed) *
      (1 - prestigeRed) *
      (1 - petBuildingRed);
    const totalUpgradeMult =
      (1 - globalRed) *
      (1 - guildRed) *
      (1 - prestigeRed) *
      (1 - petUpgradeRed);
    const totalBuildingRed = (1 - totalBuildingMult) * 100;
    const totalUpgradeRed = (1 - totalUpgradeMult) * 100;

    const eff = this.gameState.prestigePointMultiplier || 0.05;
    const points = this.gameState.gesamt_prestige_punkte || 0;
    const multPoints = 1 + points * eff;
    const resets = this.gameState.prestigeResets || 0;
    const resetBonusVal = this.gameState.prestigeResetBonus || 0.01;
    const multResets = 1 + resets * resetBonusVal;
    const multGuild = 1 + (this.gameState.guildSPSMultiplier || 0);
    let totalGlobal = this.gameState.globalerPrestigeMultiplikator || 1;

    // Versuchen, den reinen Upgrade-Multiplikator zu isolieren
    const divisor = multPoints * multResets * multGuild || 1;
    const multUpgrades = totalGlobal / divisor;

    const fmt = (val) => (val * 100).toFixed(1) + "%";
    const xFmt = (val) => "x" + val.toFixed(2);

    // --- LISTE DER STATS ---
    const stats = [
      {
        label: "💰 Aktuelle Smileys",
        value: this.formatNumber(this.gameState.aktuelle_smileys),
      },
      {
        label: "🏦 Lifetime Smileys",
        value: this.formatNumber(this.gameState.lifetime_smileys),
      },
      {
        label: "💎 Diamanten",
        value: this.formatNumber(this.gameState.diamanten),
      },
      {
        label: "⚡ Smileys pro Sekunde",
        value: this.formatNumber(this.gameState.totalSPS),
        highlight: true,
      },
      {
        label: "👆 Klick-Stärke",
        value: this.formatNumber(this.getClickStrength()),
      },
      {
        label: "🔥 Kritische Treffer",
        value: `${fmt(this.gameState.critChance)} Chance / ${this.gameState.critDamageMult}x Schaden`,
      },
      {
        label: "📉 Gebäude-Rabatt",
        value: totalBuildingRed.toFixed(2) + "%",
        detail: `Prestige: ${fmt(prestigeRed)} | Gilde: ${fmt(guildRed)} | Shop: ${fmt(globalRed)} | Pet: ${fmt(petBuildingRed)}`,
        highlight: totalBuildingRed > 0,
      },
      {
        label: "📉 Upgrade-Rabatt",
        value: totalUpgradeRed.toFixed(2) + "%",
        detail: `Prestige: ${fmt(prestigeRed)} | Gilde: ${fmt(guildRed)} | Shop: ${fmt(globalRed)} | Pet: ${fmt(petUpgradeRed)}`,
        highlight: totalUpgradeRed > 0,
      },
      {
        label: "🚀 Produktions-Bonus",
        value: xFmt(totalGlobal),
        detail: `Punkte: ${xFmt(multPoints)} | Resets: ${xFmt(multResets)} | Upgrades: ${xFmt(multUpgrades)} | Gilde: ${xFmt(multGuild)}`,
        highlight: true,
      },
      {
        label: "🌟 Prestige Effizienz",
        value: fmt(eff),
        detail: `Bonus pro Prestige-Punkt (Basis + Upgrades)`,
      },
      { label: "🏆 Prestige Resets", value: this.gameState.prestigeResets },
      { label: "🐶 Aktives Pet", value: activePetName },
    ];

    // --- RENDERING ---
    stats.forEach((stat) => {
      const item = document.createElement("div");
      item.className = "info-upgrade-item";
      if (stat.highlight) item.style.borderColor = "#009ffd";

      let html = `
                <h4 style="margin:0 0 5px 0; color:#aaa; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
                    ${stat.label}
                </h4>
                <div style="font-size:1.3rem; font-weight:bold; color:${stat.highlight ? "#009ffd" : "#fff"};">
                    ${stat.value}
                </div>
            `;
      if (stat.detail) {
        html += `<div style="font-size:0.75rem; color:#888; margin-top:3px;">${stat.detail}</div>`;
      }
      item.innerHTML = html;
      container.appendChild(item);
    });

    // HIER WURDE DER TEIL MIT DEN BALKEN ENTFERNT
  }

  getAchievementBonusText(bonus) {
    switch (bonus.type) {
      case "sps_mult":
        return `+${bonus.value * 100}% SPS`;
      case "click_mult":
        return `+${bonus.value * 100}% Klickkraft`;
      case "global_mult":
        return `+${bonus.value * 100}% auf Alles`;
      case "prestige_efficiency":
        return `+${bonus.value * 100}% Prestige-Effekt`;
      // 👇 DAS HIER IST NEU 👇
      case "mine_boost":
        return `+${bonus.value * 100}% Minen-Ertrag`;
      case "cost_reduction_global":
        return `-${bonus.value * 100}% Kosten`;
      default:
        return "Permanenter Bonus";
    }
  }

  switchView(viewName) {
    // --- 1. NAVBAR UPDATE (Der blaue Strich) ---
    document
      .querySelectorAll(".navbar a")
      .forEach((el) => el.classList.remove("active"));

    if (viewName === "home") {
      const nav = document.getElementById("nav-home");
      if (nav) nav.classList.add("active");
    } else if (viewName === "prestige") {
      const nav = document.getElementById("nav-prestige");
      if (nav) nav.classList.add("active");
    }

    // --- 2. ALLE MODALS SCHLIEßEN (Reset) ---
    const modals = [
      "prestige-shop-modal",
      "wiki-modal",
      "settings-modal",
      "blackmarket-modal",
      "wardrobe-modal",
      "pet-shop-modal",
      "diamond-mine-modal",
      "guilds-modal",
      "achievements_info_modal",
    ];

    modals.forEach((id) => {
      this.closeModal(id); // NEU: closeModal statt style.display
    });

    // --- 3. ANSICHT WÄHLEN ---
    if (viewName === "home") {
      window.scrollTo(0, 0);
      this.updateUI();
    }

    // --- PRESTIGE SHOP ---
    else if (viewName === "prestige") {
      this.openModal("prestige-shop-modal");
      this.updatePrestigeUIView();
      this.renderPrestigeTree();
    }

    // --- INFO / WIKI ---
    else if (viewName === "info" || viewName === "wiki") {
      this.openModal("wiki-modal");
      if (typeof this.openWikiPage === "function") {
        this.openWikiPage("buildings");
      }
    }

    // --- OPTIONEN / SETTINGS ---
    else if (viewName === "settings") {
      this.speichereSpiel();
      const textArea = document.getElementById("save-data-textarea");
      if (textArea)
        textArea.value = localStorage.getItem("smileyGameSave") || "";
      this.openModal("settings-modal");
    }
  }
  updatePrestigeUIView() {
    const prestigeAvailable = this.getById("prestige_punkte_verfügbar");
    const prestigeTotal = this.getById("gesamt_prestige_punkte");
    const currentSmileys = this.getById("aktuelle_smileys_prestige");
    const nextPoint = this.getById("next_prestige_point");
    const multiDisplay = this.getById("prestige_view_multi");

    if (prestigeAvailable)
      prestigeAvailable.innerText = this.formatNumber(
        this.gameState.prestige_punkte_verfügbar || 0,
      );
    if (prestigeTotal)
      prestigeTotal.innerText = this.formatNumber(
        this.gameState.gesamt_prestige_punkte || 0,
      );
    if (currentSmileys)
      currentSmileys.innerText = this.formatNumber(
        this.gameState.lifetime_smileys || 0,
      );
    if (multiDisplay)
      multiDisplay.innerText = `x${this.gameState.globalerPrestigeMultiplikator.toFixed(2)}`;

    const pointsToGain = this.calculatePrestigeGain();
    const currentTotalLevel =
      (this.gameState.gesamt_prestige_punkte || 0) + pointsToGain;
    const nextLevel = currentTotalLevel + 1;
    const nextPointRequirement = Math.pow(nextLevel, 3) * 100000;

    if (nextPoint)
      nextPoint.innerText = this.formatNumber(nextPointRequirement);
  }

  // =========================================================
  // 11.🎲 RNG EVENT SYSTEM (Buffs & Debuffs)
  // =========================================================

  spawnRandomEvent() {
    // 1. Element erstellen
    const eventObj = document.createElement("div");
    eventObj.className = "rng-event-object";
    eventObj.innerText = "❓"; // Das mysteriöse Fragezeichen

    // 2. Zufällige Position (innerhalb des Sichtbereichs, mit etwas Abstand zum Rand)
    const x = Math.random() * (window.innerWidth - 150) + 75;
    const y = Math.random() * (window.innerHeight - 150) + 75;
    eventObj.style.left = x + "px";
    eventObj.style.top = y + "px";

    document.body.appendChild(eventObj);

    // 3. Klick-Event: Effekt auslösen und Smiley entfernen
    eventObj.onclick = (e) => {
      e.stopPropagation(); // Verhindert Klick auf Elemente darunter
      this.triggerRandomEffect();
      eventObj.remove();
    };

    // 4. Automatisches Verschwinden nach 12 Sekunden, falls nicht geklickt
    setTimeout(() => {
      if (eventObj.parentNode) {
        eventObj.style.opacity = "0";
        eventObj.style.transition = "opacity 0.5s";
        setTimeout(() => eventObj.remove(), 500);
      }
    }, 12000);
  }

  triggerRandomEffect() {
    const isPositive = Math.random() < 0.6; // 60% Chance auf Gut

    // Dauer für Effekte (30 oder 60 Sekunden)
    const durationShort = 30000;
    const durationLong = 60000;
    const now = Date.now();

    if (isPositive) {
      // --- 🟢 BUFFS ---
      const buffType = Math.random();

      if (buffType < 0.5) {
        // Sofort-Gewinn
        const gain = Math.max(500, this.gameState.totalSPS * 60 * 10);
        this.addSmileys(gain);
        this.showNotification(
          `🎁 Glückspilz! +${this.formatNumber(gain)} Smileys`,
          "success",
        );
      } else {
        // SPS Boost (30s)
        this.gameState.activeBuffs.spsMultiplier = 2.5;
        // WICHTIG: Wir speichern, WANN es vorbei ist
        this.gameState.activeBuffs.spsEndTime = now + durationShort;
        this.showNotification(`⚡ Smiley-Rausch! SPS x2.5 für 30s`, "success");
      }
    } else {
      // --- 🔴 DEBUFFS ---
      const debuffType = Math.random();

      if (debuffType < 0.33) {
        // Direkter Abzug
        const loss = Math.floor(this.gameState.aktuelle_smileys * 0.1);
        this.gameState.aktuelle_smileys -= loss;
        this.showNotification(`📉 Pech! -10% Deiner Smileys weg.`, "error");
      } else if (debuffType < 0.66) {
        // Drosselung (30s)
        this.gameState.activeBuffs.spsMultiplier = 0.4;
        this.gameState.activeBuffs.spsEndTime = now + durationShort;
        this.showNotification(`🐢 Drosselung! SPS -60% für 30s`, "error");
      } else {
        // Inflation (60s)
        this.gameState.activeBuffs.costMultiplier = 1.5;
        this.gameState.activeBuffs.costEndTime = now + durationLong;
        this.showNotification(`💸 Inflation! Preise +50% für 60s`, "error");
      }
    }

    this.updateUI();
    this.speichereSpiel();
  }

  checkBuffExpiration() {
    const now = Date.now();
    let changed = false;

    // Prüfe SPS Buffs/Debuffs
    if (
      this.gameState.activeBuffs.spsEndTime &&
      now > this.gameState.activeBuffs.spsEndTime
    ) {
      this.gameState.activeBuffs.spsMultiplier = 1;
      delete this.gameState.activeBuffs.spsEndTime; // Zeitstempel löschen
      this.showNotification("System wieder normal (SPS).", "info");
      changed = true;
    }

    // Prüfe Kosten Inflation/Rabatt
    if (
      this.gameState.activeBuffs.costEndTime &&
      now > this.gameState.activeBuffs.costEndTime
    ) {
      this.gameState.activeBuffs.costMultiplier = 1;
      delete this.gameState.activeBuffs.costEndTime;
      this.showNotification("Preise haben sich normalisiert.", "info");
      changed = true;
    }

    return changed;
  }

  // =========================================================
  // 12.News Middle Colum Top
  // // =========================================================

  updateNewsTicker(manualText = null) {
    const ticker = document.getElementById("news-ticker-text");
    if (!ticker) return;

    // 1. Priorität: Manuelle Events (z.B. "Inflation!")
    if (manualText) {
      ticker.innerText = manualText;
      ticker.style.color = "#ff5252"; // Alarm-Rot
      return;
    }

    // 2. Nachrichten-Pool basierend auf Fortschritt sammeln
    let newsOptions = [
      "Eilmeldung: Smileys zur neuen Weltwährung erklärt!",
      "Wissenschaftler bestätigen: Lächeln verlängert das Leben, Klicken verkürzt die Maus-Lebensdauer.",
      "Lokaler Spieler bekommt Finger-Krampf – verklagt Maushersteller.",
      "Börsen-Crash: Investoren verkaufen Gold und kaufen gelbe Pixel.",
      "Gerücht: Gibt es ein geheimes Kuh-Level? Der Entwickler schweigt.",
      "Wettervorhersage: Heiter bis wolkig mit Aussicht auf Diamanten.",
      "Vermisst: Ein trauriges Gesicht. Wurde zuletzt in der Mine gesehen.",
      "Studie: 9 von 10 Zahnärzten empfehlen, mehr Smileys zu sammeln.",
      "Breaking: Unbekanntes Artefakt im Museum fängt an zu leuchten!",
      "Tipp: Iss zwischendurch mal einen Apfel. Das ist gesund.",
    ];

    const smileys = this.gameState.aktuelle_smileys;
    const sps = this.gameState.totalSPS;
    const clicks = this.gameState.totalClicksLifetime;

    // --- Phase 1: Der Anfang (Armut) ---
    if (smileys < 100) {
      newsOptions.push("Spieler sucht Kleingeld unter dem Sofa.");
      newsOptions.push("Nachbarn beschweren sich über Klick-Geräusche.");
    }

    // --- Phase 2: Der Aufstieg ---
    if (smileys > 10000) {
      newsOptions.push("Lokale Wirtschaft boomt dank Smiley-Export.");
      newsOptions.push("Smiley-Aktienkurs steigt um 500%.");
    }

    // --- Phase 3: Reichtum ---
    if (smileys > 1000000) {
      // 1 Million
      newsOptions.push("Spieler kauft sich eine eigene Insel.");
      newsOptions.push("Forbes Liste: Du bist jetzt unter den Top 100.");
      newsOptions.push("Regierung erwägt Smiley-Steuer.");
    }

    // --- Phase 4: Gebäude-Spezifisch ---
    // Cursor (Index 0)
    if (this.gameState.buildingCounts[0] > 50) {
      newsOptions.push("Autonomer Mauszeiger entwickelt Bewusstsein.");
    }
    // Oma (Index 1)
    if (this.gameState.buildingCounts[1] > 0) {
      newsOptions.push("Omas backen Kekse... äh, Smileys.");
      newsOptions.push("Keks-Markt bricht ein, Smiley-Markt steigt.");
    }
    // Fabrik (Index 4 - Beispiel)
    if (this.gameState.buildingCounts[4] > 10) {
      newsOptions.push("Rauchwolken über der Smiley-Fabrik gesichtet.");
      newsOptions.push("Gewerkschaft der Smileys fordert Urlaub.");
    }

    // --- Phase 5: Prestige ---
    if (this.gameState.prestigeResets > 0) {
      newsOptions.push("Déjà-vu? Wir haben das doch schon mal gemacht...");
      newsOptions.push("Zeitreisen verursachen Kopfschmerzen, sagen Experten.");
      newsOptions.push("Das Universum fühlt sich heute anders an.");
    }

    // 3. Zufällige Nachricht auswählen und anzeigen
    const randomNews =
      newsOptions[Math.floor(Math.random() * newsOptions.length)];

    // Sanfter Übergang (Fade Effect Simulation via CSS opacity wäre ideal, hier direkt Text)
    ticker.style.opacity = 0;
    setTimeout(() => {
      ticker.innerText = randomNews;
      ticker.style.color = "#009FFD"; // Standard Blau/Cyan
      ticker.style.opacity = 1;
    }, 500);
  }

  // =========================================================
  // 13. ACTIVE SKILLS SYSTEM
  // =========================================================

  useSkill(skillKey) {
    const skill = this.gameState.skills[skillKey];
    if (!skill || skill.active || skill.cooldown) return;

    // --- NEU: Sicherheitsspeicherung (Anti-Cheat) ---
    // Wir speichern den exakten Zeitpunkt, wann der Skill wieder bereit ist.
    skill.readyAt = Date.now() + skill.duration + skill.cooldownTime;
    this.speichereSpiel();
    // ------------------------------------------------

    const btn = this.getById(`btn-skill-${skillKey}`);
    const timerText = this.getById(`timer-${skillKey}`);

    // --- AKTIVIERUNG ---
    skill.active = true;
    if (btn) {
      btn.classList.remove("ready");
      btn.classList.add("is-active");
    }

    this.handleImmediateSkillEffects(skillKey);
    this.applyAllBoni();
    this.updateUI();

    let timeLeft = Math.ceil(skill.duration / 1000);
    if (timerText) timerText.innerText = timeLeft + "s";

    const activeInterval = setInterval(() => {
      timeLeft--;
      if (timerText) timerText.innerText = timeLeft + "s";

      if (timeLeft <= 0) {
        clearInterval(activeInterval);

        // --- COOLDOWN START ---
        skill.active = false;
        skill.cooldown = true;
        if (btn) {
          btn.classList.remove("is-active");
          btn.disabled = true;
        }

        this.applyAllBoni();
        this.updateUI();
        this.startCooldownLogic(skillKey, skill.cooldownTime);
      }
    }, 1000);
  }

  startCooldownLogic(skillKey, cooldownTime) {
    const timerText = this.getById(`timer-${skillKey}`);
    const bar = this.getById(`cooldown-${skillKey}`);
    const btn = this.getById(`btn-skill-${skillKey}`);

    let cdLeft = Math.ceil(cooldownTime / 1000);
    if (timerText) timerText.innerText = cdLeft + "s";

    const cdInterval = setInterval(() => {
      cdLeft--;
      if (timerText) timerText.innerText = cdLeft + "s";

      let progress = (cdLeft / (cooldownTime / 1000)) * 100;
      if (bar) bar.style.width = progress + "%";

      if (cdLeft <= 0) {
        clearInterval(cdInterval);
        this.gameState.skills[skillKey].cooldown = false;
        if (btn) {
          btn.disabled = false;
          btn.classList.add("ready"); // Wieder Blau machen
        }
        if (timerText) timerText.innerText = "BEREIT";
        if (bar) bar.style.width = "0%";
        this.showNotification(
          `⭐ ${skillKey.toUpperCase()} wieder einsatzbereit!`,
          "success",
        );
      }
    }, 1000);
  }

  handleImmediateSkillEffects(skillKey) {
    if (skillKey === "goldRush") {
      const gain = this.gameState.totalSPS * 60 * 15;
      this.addSmileys(gain);
    }
    if (skillKey === "diamondPulse") {
      const dGain = (this.gameState.buildingCounts[8] || 0) * 5 + 10;
      this.gameState.diamanten += dGain;
    }
  }

  startCooldownVisual(skillKey, time) {
    const bar = this.getById(`cooldown-${skillKey}`);
    const btn = this.getById(`btn-skill-${skillKey}`);
    if (btn) btn.disabled = true;

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = (elapsed / time) * 100;
      if (bar) bar.style.width = 100 - progress + "%";
      if (elapsed >= time) {
        clearInterval(interval);
        this.gameState.skills[skillKey].cooldown = false;
        if (btn) btn.disabled = false;
        if (bar) bar.style.width = "0%";
      }
    }, 100);
  }
  // Prüft, ob Skills basierend auf Resets freigeschaltet sind
  checkSkillUnlocks() {
    const resets = this.gameState.prestigeResets || 0;

    // Liste: Welcher Skill braucht wie viele Resets?
    const unlockMap = {
      frenzy: 1,
      overdrive: 2,
      critStorm: 3,
      goldRush: 5,
      diamondPulse: 7,
      efficiency: 10,
      shards: 15,
      hyperMinute: 20,
    };

    Object.keys(unlockMap).forEach((skillKey) => {
      const btn = this.getById(`btn-skill-${skillKey}`);
      const container = btn ? btn.parentElement : null;

      if (container) {
        if (resets >= unlockMap[skillKey]) {
          container.style.opacity = "1";
          container.style.pointerEvents = "auto";
          if (btn) btn.title = btn.title.replace("Gesperrt! ", ""); // Titel säubern
        } else {
          container.style.opacity = "0.3";
          container.style.pointerEvents = "none";
          // Hinweis im Tooltip, warum es gesperrt ist
          if (btn && !btn.title.startsWith("Gesperrt")) {
            btn.title =
              `Gesperrt! Benötigt Prestige Level ${unlockMap[skillKey]} - ` +
              btn.title;
          }
        }
      }
    });
  }

  // Stellt Cooldowns nach dem Neuladen der Seite wieder her
  restoreCooldowns() {
    const now = Date.now();
    Object.keys(this.gameState.skills).forEach((key) => {
      const skill = this.gameState.gameState?.skills
        ? this.gameState.skills[key]
        : this.gameState.skills[key];
      // Fallback falls Struktur leicht abweicht, aber hier sollte this.gameState.skills[key] reichen.

      if (skill.readyAt && skill.readyAt > now) {
        // Cooldown läuft noch
        const remaining = skill.readyAt - now;
        skill.cooldown = true;
        skill.active = false;

        const btn = this.getById(`btn-skill-${key}`);
        const timerText = this.getById(`timer-${key}`);

        if (btn) {
          btn.disabled = true;
          btn.classList.remove("is-active", "ready");
        }
        // Starte den visuellen Timer genau dort, wo er aufgehört hat
        this.startCooldownLogic(key, remaining);
      } else {
        // Skill ist bereit
        skill.cooldown = false;
        skill.active = false;
        const btn = this.getById(`btn-skill-${key}`);
        const timerText = this.getById(`timer-${key}`);

        if (btn) {
          btn.disabled = false;
          btn.classList.add("ready");
        }
        if (timerText) timerText.innerText = "BEREIT";
      }
    });
  }

  initChat() {
    this.chatSystem.initChat();
  }

  // Prüft alle wichtigen Zahlen und repariert sie notfalls
  sanityCheck() {
    const s = this.gameState;

    // Währungen prüfen
    if (isNaN(s.aktuelle_smileys) || s.aktuelle_smileys < 0)
      s.aktuelle_smileys = 0;
    if (isNaN(s.diamanten) || s.diamanten < 0) s.diamanten = 0;
    if (isNaN(s.gems) || s.gems < 0) s.gems = 0;
    if (isNaN(s.totalSPS)) s.totalSPS = 0;

    // Söldner prüfen
    if (s.guildMercenaries) {
      s.guildMercenaries.forEach((m) => {
        if (isNaN(m.level)) m.level = 1;
        if (isNaN(m.xp)) m.xp = 0;
      });
    }
  }
}
