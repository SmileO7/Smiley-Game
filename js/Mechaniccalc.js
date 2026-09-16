export default class Mechaniccalc {

calculatePetStat(pet, currentLevel) {
    this.petSystem.calculatePetStat(pet, currentLevel);
  }

  calculatePrestigeEffects() {
    let effects = {
      spsMultiplier: 1.0,
      clickMultiplier: 1.0,
      costReduction: 0.0,
      pointEfficiency: 0.1,
      petsUnlocked: false,
      mineUnlocked: false,
      guildsUnlocked: false,
      critChanceBonus: 0.0,
      offlineBoost: 1.0,
      buildingSynergy: 0.0,
    };

    prestigeUpgrades.forEach((upgrade) => {
      if (this.gameState.prestigeUpgradeStatus[upgrade.id]) {
        switch (upgrade.type) {
          case "sps_mult":
            effects.spsMultiplier *= 1 + upgrade.value;
            break;
          case "click_mult":
            effects.clickMultiplier *= 1 + upgrade.value;
            break;
          case "cost_reduction":
            effects.costReduction += upgrade.value;
            break;
          case "prestige_efficiency":
            effects.pointEfficiency += upgrade.value;
            break;
          case "unlock_pets":
            effects.petsUnlocked = true;
            break;
          case "unlock_mine":
            effects.mineUnlocked = true;
            break;
          case "unlock_guilds":
            effects.guildsUnlocked = true;
            break;
          case "global_mult":
            effects.spsMultiplier *= 1 + upgrade.value;
            effects.clickMultiplier *= 1 + upgrade.value;
            break;
          case "crit_chance":
            effects.critChanceBonus += upgrade.value;
            break;
          case "offline_boost":
            effects.offlineBoost += upgrade.value;
            break;
          case "building_synergy":
            effects.buildingSynergy += upgrade.value;
            break;
        }
      }
    });
    return effects;
  }

  applyAllBoni() {
    // 1. Reset der Basis-Werte
    this.gameState.globalSPSMultiplier = 1;
    this.gameState.prestigePointMultiplier = 0.05;
    this.gameState.prestigeResetBonus = 0;
    this.gameState.guildSPSMultiplier = 0;
    this.gameState.autoDiamondMineUnlocked = false;

    // Feature Flags zurücksetzen
    this.gameState.petsUnlocked = false;
    this.gameState.diamondMineUnlocked = false;
    this.gameState.guildsUnlocked = false;

    let baseClickMultiplier = 1;
    let prestigeClickMultiplier = 0;

    // Gebäude-Multiplikatoren zurücksetzen
    buildingsData.forEach((b) => {
      b.prestigeMulti = 1;
    });

    // 2. Globale Upgrades (Research) anwenden
    this.gameState.researchStatus.forEach((bought, index) => {
      if (bought) {
        const upgrade = globalUpgrades[index];
        if (upgrade) {
          switch (upgrade.type) {
            case "click_mult":
              prestigeClickMultiplier += upgrade.value;
              break;
            case "sps_mult":
              // WICHTIG: Unterscheidung zwischen Global und Einzel-Gebäude
              if (
                upgrade.buildingIndex !== undefined &&
                upgrade.buildingIndex >= 0
              ) {
                // Nur für ein bestimmtes Gebäude (z.B. Smiley Baum)
                if (buildingsData[upgrade.buildingIndex]) {
                  buildingsData[upgrade.buildingIndex].prestigeMulti *=
                    1 + upgrade.value;
                }
              } else {
                // Gilt für ALLE (Global)
                this.gameState.globalSPSMultiplier += upgrade.value;
              }
              break;
            case "cost_reduction_global":
            case "cost_reduction_buildings":
              this.gameState.globalCostReduction += upgrade.value;
              break;
            case "global_god_mode":
              this.gameState.godModeMultiplier *= 1 + upgrade.value;
              break;
          }
        }
      }
    });

    // 3. Prestige Upgrades (Unlocks prüfen)
    this.gameState.prestigeUpgradeStatus.forEach((bought, id) => {
      if (bought) {
        const upgrade = prestigeUpgrades.find((u) => u.id === id);
        if (upgrade) {
          switch (upgrade.type) {
            case "unlock_pets":
              this.gameState.petsUnlocked = true;
              break;
            case "unlock_mine":
              this.gameState.diamondMineUnlocked = true;
              break;
            case "unlock_guilds":
              this.gameState.guildsUnlocked = true;
              break;
          }
        }
      }
    });

    // 4. Aktives Pet berechnen
    if (this.gameState.activePet) {
      const pet = petsData.find((p) => p.id === this.gameState.activePet);
      if (pet) {
        const currentLevel = this.gameState.petLevels[pet.id] || 0;
        if (currentLevel > 0) {
          const stats = this.calculatePetStat(pet, currentLevel);
          const scaledEffect = stats.currentEffect;
          switch (pet.effectType) {
            case "click_mult":
              prestigeClickMultiplier += scaledEffect;
              break;
            case "sps_mult":
              this.gameState.globalSPSMultiplier += scaledEffect;
              break;
            case "prestige_point_eff":
              this.gameState.prestigePointMultiplier += scaledEffect;
              break;
          }
        }
      }
    }

    // 5. Prestige Effekte aus dem Tree holen (für die Berechnung am Ende)
    const prestigeTreeEffects = this.calculatePrestigeEffects();

    // Stats aus dem Tree übernehmen
    this.gameState.critChance = 0 + (prestigeTreeEffects.critChanceBonus || 0);
    this.gameState.critDamageMult = 3;
    this.gameState.diamondMineBoost = 0;
    this.gameState.globalCostReduction = 0;
    this.gameState.clickSPSRatio = 0;
    this.gameState.godModeMultiplier = 1;

    // 6. Diamanten-Shop Boni
    let diamondStaticClick = 1;
    let diamondStaticSPS = 1;

    diamondShopUpgrades.forEach((upgrade) => {
      const count = this.gameState.diamondShopPurchases[upgrade.id] || 0;
      if (count > 0) {
        switch (upgrade.type) {
          case "click_mult_static":
            diamondStaticClick *= upgrade.value * count;
            break;
          case "sps_mult_static":
            diamondStaticSPS += upgrade.value * count;
            break;
          case "prestige_point_eff":
            this.gameState.prestigePointMultiplier += upgrade.value * count;
            break;
          case "auto_diamond_mine":
            this.gameState.autoDiamondMineUnlocked = true;
            break;
          case "crit_chance":
            this.gameState.critChance += upgrade.value * count;
            break;
          case "crit_damage":
            this.gameState.critDamageMult += upgrade.value * count;
            break;
          case "mine_boost":
            this.gameState.diamondMineBoost += upgrade.value * count;
            break;
          case "cost_reduction_global":
            this.gameState.globalCostReduction += upgrade.value * count;
            break;
          case "click_sps_link":
            this.gameState.clickSPSRatio += upgrade.value * count;
            break;
          case "global_god_mode":
            this.gameState.godModeMultiplier *= 1 + upgrade.value;
            break;
        }
      }
    });

    // Diamanten-Boni anwenden
    prestigeClickMultiplier += diamondStaticClick - 1;
    this.gameState.globalSPSMultiplier *= diamondStaticSPS;
    this.gameState.globalSPSMultiplier *= this.gameState.godModeMultiplier;

    // 7. Gilden Boni (NEU: Basierend auf Gilden-Level!)
    this.gameState.guildCostReduction = 0;
    this.gameState.guildPrestigeBonus = 0;
    this.gameState.guildGlobalMultiplier = 1;
    this.gameState.guildSPSMultiplier = 0;

    const gLevel = this.gameState.guildLevel || 1;

    // Automatische Boni pro Level
    if (gLevel >= 2) this.gameState.guildSPSMultiplier += 0.1; // Lv 2: +10% SPS
    if (gLevel >= 3) prestigeClickMultiplier += 0.1; // Lv 3: +10% Klick
    if (gLevel >= 5) this.gameState.guildCostReduction += 0.05; // Lv 5: -5% Kosten
    if (gLevel >= 7) this.gameState.guildPrestigeBonus += 0.1; // Lv 7: +10% Prestige Punkte
    if (gLevel >= 10) this.gameState.guildGlobalMultiplier *= 2.0; // Lv 10: VERDOPPELUNG (x2)
    if (gLevel >= 15) this.gameState.guildSPSMultiplier += 0.5; // Lv 15: +50% SPS
    if (gLevel >= 20) this.gameState.guildGlobalMultiplier *= 5.0; // Lv 20: x5 Global!

    // Gilden-Effekte final verrechnen
    this.gameState.prestigePointMultiplier += this.gameState.guildPrestigeBonus;
    this.gameState.globalSPSMultiplier *= this.gameState.guildGlobalMultiplier;

    // 8. Achievements Boni
    achievementsData.forEach((achievement, index) => {
      if (this.gameState.achievementsUnlocked[index]) {
        const bonus = achievement.bonus;
        switch (bonus.type) {
          case "sps_mult":
            this.gameState.globalSPSMultiplier += bonus.value;
            break;
          case "click_mult":
            prestigeClickMultiplier += bonus.value;
            break;
          case "prestige_efficiency":
            this.gameState.prestigePointMultiplier += bonus.value;
            break;
          case "global_mult":
            this.gameState.globalSPSMultiplier += bonus.value;
            prestigeClickMultiplier += bonus.value;
            break;
          case "cost_reduction_global":
            this.gameState.globalCostReduction += bonus.value;
            break;
          // 👇 DAS HIER IST NEU 👇
          case "mine_boost":
            this.gameState.diamondMineBoost += bonus.value;
            break;
        }
      }
    });

    // 8.5 Artefakt Boni (NEU - WICHTIG FÜR DAS MUSEUM)
    this.gameState.artifactMineCostRed = 0; // Spezieller Stat für Mine

    // Sicherstellen, dass das Array existiert
    if (this.gameState.collectedArtifacts && this.artifactsData) {
      this.gameState.collectedArtifacts.forEach((artId) => {
        const art = this.artifactsData.find((a) => a.id === artId);
        if (art) {
          switch (art.bonusType) {
            case "sps_mult":
              this.gameState.globalSPSMultiplier += art.value;
              break;
            case "click_mult":
              prestigeClickMultiplier += art.value;
              break;
            case "prestige_efficiency":
              this.gameState.prestigePointMultiplier += art.value;
              break;
            case "mine_cost":
              this.gameState.artifactMineCostRed += art.value;
              break;
            case "offline_boost":
              // Offline Boost ist kein globaler Multiplier, sondern wirkt beim Laden.
              // Wir speichern ihn hier nicht, sondern nutzen ihn in checkOfflineProgress.
              break;
          }
        }
      });
    }

    // 8.6 Gilden-Projekt Boni (SPS, Klick, Söldner)
    const gUpgrades = this.gameState.guildServerUpgrades || {};

    // Hilfsfunktion: Holt das Level, egal ob alte (Zahl) oder neue (Objekt) Datenstruktur
    const getGuildLvl = (key) =>
      typeof gUpgrades[key] === "object"
        ? gUpgrades[key].level || 0
        : gUpgrades[key] || 0;

    // Synergie-Netzwerk: +1% SPS pro Level
    this.gameState.guildSPSMultiplier += getGuildLvl("guild_sps") * 0.01;

    // Schwarm-Intelligenz: +2% Klick-Stärke pro Level
    prestigeClickMultiplier += getGuildLvl("guild_click") * 0.02;
    // --- 8.7 GEM KONZERN BONI (Final Balanced) ---
    const gemUps = this.gameState.gemUpgrades || {};

    // 1. Rabatt-Karte (-2% Kosten pro Level)
    if (gemUps["gem_discount"]) {
      this.gameState.globalCostReduction += gemUps["gem_discount"] * 0.02;
    }

    // 2. Prestige-Magnet (+5% Prestige Punkte pro Level) -> VORHER 10%
    if (gemUps["gem_prestige"]) {
      this.gameState.prestigePointMultiplier += gemUps["gem_prestige"] * 0.05;
    }

    // 3. Gewinn-Verdoppler (x2 Global, Max 1 Level)
    if (gemUps["gem_double"]) {
      // Da Max Level = 1 ist, einfach * 2 rechnen
      const doubleMulti = 2;
      this.gameState.globalSPSMultiplier *= doubleMulti;
      prestigeClickMultiplier += doubleMulti - 1;
    }

    // 4. Offline Bonus (Zeit-Dehner)
    this.gameState.gemOfflineBonus = (gemUps["gem_offline"] || 0) * 0.1;

    // 5. Gieriger Blick (Mine) - Bereits beim Kauf angewendet, aber hier zur Sicherheit für Neuberechnung
    // Hinweis: diamondMineBoost wird oft beim Laden gesetzt, daher addieren wir hier nur den dynamischen Teil,
    // oder wir verlassen uns auf den Wert im State. Besser ist es, den Wert hier sauber neu zu berechnen:
    this.gameState.diamondMineBoost = 0; // Reset Basis
    if (gemUps["gem_greed"]) {
      this.gameState.diamondMineBoost += gemUps["gem_greed"] * 0.05;
    }

    // 6. Schicksals-Politur (Crit) - Reset und Neu
    this.gameState.critChance = 0 + (prestigeTreeEffects.critChanceBonus || 0); // Basis aus Tree
    if (gemUps["gem_luck"]) {
      this.gameState.critChance += gemUps["gem_luck"] * 0.01;
    }

    // 9. Finale Berechnung
    this.gameState.klickKraftMultiplier =
      baseClickMultiplier + prestigeClickMultiplier;

    const prestigeBonus =
      1 +
      this.gameState.gesamt_prestige_punkte *
        this.gameState.prestigePointMultiplier;
    const resetBonus =
      1 + this.gameState.prestigeResets * this.gameState.prestigeResetBonus;

    // WICHTIG: Hier wird jetzt ALLES zusammengeführt
    // Global SPS * Gilden SPS * Prestige Punkte * Resets * Skill-Tree (Urknall etc.)
    this.gameState.globalerPrestigeMultiplikator =
      prestigeBonus *
      resetBonus *
      this.gameState.globalSPSMultiplier *
      (1 + this.gameState.guildSPSMultiplier) *
      prestigeTreeEffects.spsMultiplier;
  }
}