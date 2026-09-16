export default class PrestigeSystem {

updatePrestigeUI() {
    const availablePoints = this.gameState.prestige_punkte_verfügbar || 0;
    const totalPoints = this.gameState.gesamt_prestige_punkte || 0;
    const safeLifetime = this.gameState.lifetime_smileys || 0;

    // 1. Haupt-Prestige Seite Updates
    const elAvailable = this.getById("prestige_punkte_verfügbar");
    const elTotal = this.getById("gesamt_prestige_punkte");
    const elLifetime = this.getById("prestige-lifetime-display"); // Achtung: ID checken
    const elLifetimePrestige = this.getById("aktuelle_smileys_prestige");
    const elMulti = this.getById("prestige_view_multi");

    if (elAvailable) elAvailable.innerText = this.formatNumber(availablePoints);
    if (elTotal) elTotal.innerText = this.formatNumber(totalPoints);
    if (elLifetime) elLifetime.innerText = this.formatNumber(safeLifetime);
    if (elLifetimePrestige)
      elLifetimePrestige.innerText = this.formatNumber(safeLifetime);
    if (elMulti)
      elMulti.innerText = `x${this.gameState.globalerPrestigeMultiplikator.toFixed(2)}`;

    // 2. WICHTIG: Skill Tree Modal Update (Das fehlte!)
    const elModalPoints = this.getById("prestige_punkte_verfügbar_modal");
    if (elModalPoints) {
      elModalPoints.innerText = this.formatNumber(availablePoints);
      // Optional: Farbe rot wenn 0, grün wenn > 0
      elModalPoints.style.color = availablePoints > 0 ? "#4CAF50" : "#ff5252";
    }

    // 3. Fortschrittsbalken Logik (wie gehabt)
    const pointsToGain = this.calculatePrestigeGain();
    const currentTotalLevel = totalPoints + pointsToGain;
    const nextLevel = currentTotalLevel + 1;
    // Formel für Kosten: 100k * Level^3 (oder ähnlich, muss zur Reset-Logik passen)
    const prestigePointThreshold = 100000;
    const smileysForNext = Math.pow(nextLevel, 3) * prestigePointThreshold;

    // Prozent berechnen für Balken
    // (Vereinfacht, damit der Balken immer relativ zum nächsten Level ist)
    const prevLevelSmileys =
      Math.pow(currentTotalLevel, 3) * prestigePointThreshold;
    const needed = smileysForNext - prevLevelSmileys;
    const currentProgress = safeLifetime - prevLevelSmileys;

    let percentage = 0;
    if (needed > 0) percentage = (currentProgress / needed) * 100;
    percentage = Math.max(0, Math.min(100, percentage));

    const bar = this.getById("prestige-progress-bar");
    const textNext = this.getById("next-prestige-threshold");
    const textPercent = this.getById("prestige-percent-text");
    const gainDisp = this.getById("prestige-gain-display");

    if (bar) bar.style.width = `${percentage}%`;
    if (textNext) textNext.innerText = this.formatNumber(smileysForNext);

    if (textPercent) {
      if (pointsToGain > 0) {
        textPercent.innerText = `+${pointsToGain} Punkte bereit!`;
        textPercent.style.color = "#00ff00";
      } else {
        textPercent.innerText = `${percentage.toFixed(1)}%`;
        textPercent.style.color = "#fff";
      }
    }

    if (gainDisp) {
      gainDisp.innerText = pointsToGain;
      gainDisp.style.color = pointsToGain > 0 ? "#4CAF50" : "#009ffd";
    }
  }

  fuehrePrestigeAus(points) {
    this.gameState.prestige_punkte_verfügbar += points;
    this.gameState.gesamt_prestige_punkte += points;
    this.gameState.prestigeResets++;
    this.gameState.aktuelle_smileys = 0;
    this.gameState.buildingCounts = this.gameState.buildingCounts.map(() => 0);
    this.gameState.researchStatus = this.gameState.researchStatus.map(
      () => false,
    );

    this.updateUI();
    this.updateGlobalUpgradeUI();
    this.updatePrestigeUI();
    this.showNotification(
      `Prestige erfolgreich! +${points} Punkte erhalten!`,
      "success",
    );
  }

  zeigePrestigeDetails() {
    const modal = document.getElementById("prestige-modal");
    if (!modal) {
      console.error("prestige-modal nicht gefunden!");
      return;
    }

    const totalSmileys = this.gameState.lifetime_smileys || 0;
    const potentialPoints = this.calculatePrestigeGain();

    const elLifetime = document.getElementById("prestige-lifetime-display");
    const elGain = document.getElementById("prestige-gain-display");

    if (elLifetime) {
      elLifetime.innerText = this.formatNumber(totalSmileys);
    }

    if (elGain) {
      elGain.innerText = this.formatNumber(potentialPoints);
    }

    this.openModal("prestige-modal");
  }

  calculatePrestigeGain() {
    const totalSmileys = this.gameState.lifetime_smileys || 0;
    const BLOCKCOST = 100000;

    console.log("=== PRESTIGE CALC ===");
    console.log("lifetime_smileys:", this.gameState.lifetime_smileys);
    console.log("totalSmileys:", totalSmileys);
    console.log(
      "gesamt_prestige_punkte:",
      this.gameState.gesamt_prestige_punkte,
    );

    if (totalSmileys < BLOCKCOST) {
      console.log("Zu wenig Smileys, return 0");
      return 0;
    }

    const totalLevel = Math.floor(Math.cbrt(totalSmileys / BLOCKCOST));
    const currentLevel = this.gameState.gesamt_prestige_punkte || 0;

    console.log("totalLevel:", totalLevel);
    console.log("currentLevel:", currentLevel);

    const gain = Math.max(0, totalLevel - currentLevel);
    console.log("gain:", gain);
    console.log("=== END CALC ===");

    return gain;
  }

  kaufePrestigeUpgrade(id) {
    const upgrade = prestigeUpgrades.find((u) => u.id === id);
    if (!upgrade) return;
    const requirementsMet = upgrade.requirements.every(
      (reqId) => this.gameState.prestigeUpgradeStatus[reqId],
    );
    if (
      this.gameState.prestigeUpgradeStatus[id] ||
      this.gameState.prestige_punkte_verfügbar < upgrade.cost ||
      !requirementsMet
    )
      return;

    this.gameState.prestige_punkte_verfügbar -= upgrade.cost;
    this.gameState.prestigeUpgradeStatus[id] = true;
    this.applyAllBoni();
    this.updatePrestigeUI();
    if (document.querySelector(".main-layout")) {
      this.updateUI();
    }
    this.speichereSpiel();
  }

  canBuyPrestigeUpgrade(upgrade) {
    if (this.gameState.prestige_punkte_verfügbar < upgrade.cost) return false;

    // NEU: Unterstützt jetzt 'requirements' statt nur 'parents'
    const reqs = upgrade.requirements || upgrade.parents || [];

    if (reqs.length > 0) {
      for (let parentId of reqs) {
        const parentIndex = this.prestigeUpgrades.findIndex(
          (u) => u.id === parentId,
        );
        if (!this.gameState.prestigeUpgradeStatus[parentIndex]) return false;
      }
    }
    return true;
  }

  tryBuyPrestigeUpgrade(upgrade) {
    // Prüfen ob bereits gekauft
    if (this.gameState.prestigeUpgradeStatus[upgrade.id]) return;

    // Prüfen ob Voraussetzungen erfüllt (Eltern-Upgrades gekauft)
    const reqs = upgrade.requirements || upgrade.parents || [];
    const requirementsMet = reqs.every((parentId) => {
      const parentIndex = this.prestigeUpgrades.findIndex(
        (u) => u.id === parentId,
      );
      return this.gameState.prestigeUpgradeStatus[parentIndex];
    });

    if (!requirementsMet && reqs.length > 0) {
      this.showNotification(
        "🔒 Du musst erst das vorherige Upgrade kaufen!",
        "error",
      );
      return;
    }

    if ((this.gameState.prestige_punkte_verfügbar || 0) >= upgrade.cost) {
      // 1. Bezahlen
      this.gameState.prestige_punkte_verfügbar -= upgrade.cost;

      // 2. Status setzen
      const upgradeIndex = this.prestigeUpgrades.findIndex(
        (u) => u.id === upgrade.id,
      );
      if (upgradeIndex !== -1) {
        this.gameState.prestigeUpgradeStatus[upgradeIndex] = true;
      }

      // 3. Boni neu berechnen
      this.applyAllBoni();

      // ============================================================
      // 💥 URKNALL CHECK (ID 14)
      // ============================================================
      if (upgrade.id === 14) {
        this.triggerBigBang(); // <--- DAS LÖST DIE ANIMATION AUS
      }
      // ============================================================

      this.showNotification(`✅ Upgrade gekauft: ${upgrade.name}`, "success");
      this.playBuySound(); // Sound abspielen (wenn du das Sound-System drin hast)
      this.speichereSpiel();

      // 4. UI Updates
      this.updatePrestigeUI();
      this.updateUI();
      this.renderPrestigeTree();
    } else {
      this.showNotification("🔒 Du brauchst mehr Prestige-Punkte!", "error");
    }
  }

  prestigeReset() {
    const pointsToGain = this.calculatePrestigeGain();
    console.log("=== PRESTIGE RESET ===");
    console.log("pointsToGain:", pointsToGain);

    if (pointsToGain <= 0) {
      this.showNotification("Nicht genug Smileys für Prestige!", "error");
      return;
    }

    if (
      !confirm(`Bist du sicher? Du erhältst ${pointsToGain} Prestige-Punkte.`)
    ) {
      return;
    }

    console.log("Reset wird durchgeführt...");

    // RESET
    this.gameState.aktuelle_smileys = 0;
    this.gameState.gesammelte_smileys = 0;
    this.gameState.klickKraft = 1;
    this.gameState.totalSPS = 0;
    this.gameState.forschungPunkte = 0;

    // Prestige-Punkte hinzufügen
    console.log(
      "Vorher - gesamt_prestige_punkte:",
      this.gameState.gesamt_prestige_punkte,
    );
    this.gameState.prestige_punkte_verfügbar =
      (this.gameState.prestige_punkte_verfügbar || 0) + pointsToGain;
    this.gameState.gesamt_prestige_punkte =
      (this.gameState.gesamt_prestige_punkte || 0) + pointsToGain;
    console.log(
      "Nachher - gesamt_prestige_punkte:",
      this.gameState.gesamt_prestige_punkte,
    );
    console.log(
      "prestige_punkte_verfügbar:",
      this.gameState.prestige_punkte_verfügbar,
    );

    this.gameState.prestigeResets = (this.gameState.prestigeResets || 0) + 1;
    console.log("prestigeResets:", this.gameState.prestigeResets);

    // Gebäude zurücksetzen
    this.gameState.buildingCounts = [
      ...buildingsData,
      ...uniqueBuildingsData,
    ].map(() => 0);

    this.gameState.buildingPrices = [
      ...buildingsData.map((item) => item.basePrice),
      ...uniqueBuildingsData.map((item) => item.basePrice),
    ];

    this.applyAllBoni();
    this.speichereSpiel();

    if (document.querySelector(".prestige-main")) {
      this.updatePrestigeUI();
    }

    this.showNotification(
      `Prestige durchgeführt! +${pointsToGain} Punkte`,
      "success",
    );
    console.log("=== END RESET ===");
  }

  resetPrestigeUpgrades() {
    let refundedPoints = 0;
    this.gameState.prestigeUpgradeStatus.forEach((bought, id) => {
      if (bought) {
        const upgrade = prestigeUpgrades.find((u) => u.id === id);
        if (upgrade) refundedPoints += upgrade.cost;
      }
    });

    if (refundedPoints > 0) {
      if (!confirm("Punkte zurücksetzen? Du erhältst alle Punkte zurück."))
        return;
      this.gameState.activePet = null;
      this.gameState.prestige_punkte_verfügbar += refundedPoints;
      this.gameState.prestigeUpgradeStatus.fill(false);
      this.applyAllBoni();
      this.updatePrestigeUI();
      this.speichereSpiel();
    }
  }
}