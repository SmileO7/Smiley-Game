export class Utils {
  checkOfflineProgress() {
    if (!this.gameState.lastSaveTime) return;

    const now = Date.now();
    const diffInMs = now - this.gameState.lastSaveTime;
    const diffInSeconds = Math.floor(diffInMs / 1000);

    // Erst ab 60 Sekunden Abwesenheit anzeigen (nervt sonst beim Neuladen)
    if (diffInSeconds < 60) return;

    // SPS berechnen (damit wir wissen, wie viel man verdient hätte)
    const currentSPS = this.computeTotalSPS();
    if (currentSPS <= 0) return;

    const prestige = this.calculatePrestigeEffects();

    // Berechnung des Gewinns
    let earned = currentSPS * diffInSeconds;

    // Offline-Boost durch Prestige/Upgrades anwenden
    if (prestige.offlineBoost > 1) {
      earned *= prestige.offlineBoost;
    }

    // 👇 NEU: GEM-BONUS (Zeit-Dehner)
    if (this.gameState.gemOfflineBonus > 0) {
      earned *= 1 + this.gameState.gemOfflineBonus;
    }

    if (earned > 0) {
      // Smileys gutschreiben
      this.addSmileys(earned);
      this.speichereSpiel(); // Sofort speichern, damit man nicht neu lädt und nochmal kriegt
      this.updateUI();

      // --- NEU: Modal anzeigen statt nur Toast ---

      // 1. Zeit formatieren
      let timeString = "";
      if (diffInSeconds < 3600) {
        timeString = `${Math.floor(diffInSeconds / 60)} Minuten`;
      } else {
        const hours = Math.floor(diffInSeconds / 3600);
        const mins = Math.floor((diffInSeconds % 3600) / 60);
        timeString = `${hours} Std ${mins} Min`;
      }

      // 2. Texte ins HTML füllen
      const timeDisplay = document.getElementById("offline-time-display");
      const earnDisplay = document.getElementById("offline-earnings-display");
      const modal = document.getElementById("offline-modal");
      const btn = document.getElementById("close-offline-modal");

      if (timeDisplay) timeDisplay.innerText = timeString;
      if (earnDisplay) earnDisplay.innerText = "+" + this.formatNumber(earned);

      // 3. Modal öffnen
      if (modal) {
        modal.style.display = "flex";

        // Sound abspielen (optional, falls du einen hast)
        if (this.playBuySound) this.playBuySound();
      }

      // 4. Button Logik (Schließen)
      if (btn) {
        // removeEventListener verhindert, dass der Button mehrere Events sammelt
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener("click", () => {
          if (modal) modal.style.display = "none";
          this.showNotification(
            "💰 Willkommens-Bonus eingesammelt!",
            "success",
          );
        });
      }
    }
  }

  formatNumber(num) {
    if (typeof num !== "number" || isNaN(num)) return "0";
    if (num < 1000) return Math.floor(num).toString();
    const suffixes = [
      "K",
      "M",
      "B",
      "T",
      "Qa",
      "Qi",
      "Sx",
      "Sp",
      "Oc",
      "No",
      "De",
    ];
    let i = 0;
    while (num >= 1000 && i < suffixes.length) {
      num /= 1000;
      i++;
    }
    return num.toFixed(2) + (i > 0 ? suffixes[i - 1] : "");
  }

  getById(id) {
    return document.getElementById(id);
  }

  startIntervals() {
    // 1. Der Haupt-Loop für SPS (jede Sekunde)
    setInterval(() => {
      this.sanityCheck();
      this.addSmileys(this.gameState.totalSPS);

      // --- AUTO-HACKEN REGENERATION ---
      const inv = this.gameState.mineInventory;
      const maxPicks = 50;

      if (!this.pickaxeTimer) this.pickaxeTimer = 0;
      this.pickaxeTimer++;

      if (this.pickaxeTimer >= 5) {
        if (inv.pickaxe < maxPicks) {
          inv.pickaxe++;
          const qEl = document.getElementById("qty-pickaxe");
          if (qEl) qEl.innerText = inv.pickaxe;
        }
        this.pickaxeTimer = 0;
      }

      // --- GILDEN & SÖLDNER HINTERGRUND-LOGIK ---
      // Boss-Alarm Prüfung (immer aktiv)
      if (this.guildSystem) {
        this.guildSystem.checkBossAlarm();
      }

      // KORREKTUR: updateGuildTimers wird jetzt IMMER aufgerufen.
      // Die Methode steuert intern, ob nur die Benachrichtigung (Hintergrund)
      // oder auch das UI (Vordergrund) aktualisiert wird.
      this.updateGuildTimers();

      this.updateUI();
    }, 1000);

    // 2. Automatisches Speichern (alle 60 Sek)
    setInterval(() => {
      this.saveGame();
    }, 60000);

    // 3. News-Ticker Wechsel (alle 30 Sekunden)
    setInterval(() => {
      const ticker = this.getById("news-ticker-text");
      if (ticker && ticker.style.color !== "rgb(0, 159, 253)") {
        this.updateNewsTicker();
      }
    }, 30000);

    // 4. RNG-Events (Fragezeichen alle 1-3 Minuten)
    setInterval(() => {
      if (Math.random() < 0.3) {
        this.spawnRandomEvent();
      }
    }, 60000);
  }

  produzierePassiveErträge() {
    const actualSPS = this.computeTotalSPS();
    if (actualSPS > 0) {
      this.addSmileys(actualSPS);
    }

    // Falls du eine "Automatische Diamanten-Generierung" hast (z.B. durch ein Shop-Upgrade),
    // gehört die Logik hier hin, aber NICHT basierend auf Gebäude-Index 8.
    if (this.gameState.autoDiamondMineUnlocked) {
      // Beispiel: 1 Diamant pro Sekunde (oder mehr)
      this.gameState.diamanten += 1;
    }

    this.updateUI();
  }

  computeTotalSPS() {
    let baseSPS = this.getSmileysPerSecond();
    const prestigeEffects = this.calculatePrestigeEffects();
    const points = this.gameState.gesamt_prestige_punkte || 0;
    const pointsBonus = 1 + points * prestigeEffects.pointEfficiency;
    const resets = this.gameState.prestigeResets || 0;
    const resetBonus = 1 + resets * 0.01;

    // Global Multiplier enthält jetzt ALLES (siehe applyAllBoni)
    this.gameState.globalerPrestigeMultiplikator =
      prestigeEffects.spsMultiplier *
      pointsBonus *
      resetBonus *
      this.gameState.globalSPSMultiplier *
      (1 + (this.gameState.guildSPSMultiplier || 0));

    this.gameState.totalSPS =
      baseSPS * this.gameState.globalerPrestigeMultiplikator;

    // --- SKILL BOOSTS ---
    if (this.gameState.skills.overdrive.active) this.gameState.totalSPS *= 2;
    if (this.gameState.skills.hyperMinute.active) this.gameState.totalSPS *= 5;

    this.gameState.petsUnlocked = prestigeEffects.petsUnlocked;
    this.gameState.diamondMineUnlocked = prestigeEffects.mineUnlocked;
    this.gameState.guildsUnlocked = prestigeEffects.guildsUnlocked;

    // RNG Buffs
    this.gameState.totalSPS *= this.gameState.activeBuffs.spsMultiplier;

    return this.gameState.totalSPS;
  }

  getSmileysPerSecond() {
    let baseSPS = 0;
    buildingsData.forEach((item, index) => {
      const buildingSPS =
        (item.baseSPS || 0) *
        (this.gameState.buildingCounts[index] || 0) *
        (item.prestigeMulti || 1);
      baseSPS += buildingSPS;
    });
    return baseSPS;
  }
}
