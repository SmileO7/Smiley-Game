// js/systems/GemSystem.js

// ================================================================================================================
// === SUB-SYSTEM: DER SCHWARZMARKT (Final Corrupted Edition mit Tauschhandel) ===
// ================================================================================================================

export class GemSystem {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.shopName = "DER SCHWARZMARKT";

    this.quotes = [
      "Lila ist die Farbe der Macht.",
      "Schau nicht zu tief in den Void...",
      "Alles hat seinen Preis.",
      "Exquisite Ware für exklusive Kunden.",
      "Die Realität ist nur eine Suggestion.",
      "Korruption ist auch eine Form von Währung.",
    ];

    console.log(`👾 ${this.shopName} (Corrupted) geladen.`);

    this.upgrades = {
      // --- DAUERHAFTE MACHT ---
      gem_luck: {
        name: "Schicksals-Würfel",
        desc: "Manipuliert die Wahrscheinlichkeit. +1% Krit-Chance.",
        baseCost: 5,
        costFactor: 1.5,
        type: "passive",
        icon: "🎲",
        category: "permanent",
      },
      gem_greed: {
        name: "Gier-Prisma",
        desc: "Bricht das Licht in der Mine. +5% Diamanten-Fundrate.",
        baseCost: 15,
        costFactor: 1.8,
        type: "passive",
        icon: "💎",
        category: "permanent",
      },
      gem_discount: {
        name: "Schatten-Pakt",
        desc: "Bauarbeiter stellen keine Fragen mehr. -2% Baukosten.",
        baseCost: 20,
        costFactor: 2.5,
        type: "passive",
        icon: "📜",
        category: "permanent",
      },
      gem_prestige: {
        name: "Void-Magnet",
        desc: "Zieht verlorene Seelen an. +5% Prestige-Punkte.",
        baseCost: 50,
        costFactor: 2.0,
        type: "passive",
        icon: "🧲",
        category: "permanent",
      },
      gem_offline: {
        name: "Chronos-Splitter",
        desc: "Verzerrt die Zeit bei Abwesenheit. +10% Offline-Ertrag.",
        baseCost: 10,
        costFactor: 1.5,
        type: "passive",
        icon: "⏳",
        category: "permanent",
      },
      gem_double: {
        name: "EWIGE DOMINANZ",
        desc: "Verdoppelt deine gesamte Produktion PERMANENT (x2).",
        baseCost: 500,
        costFactor: 1,
        type: "passive",
        icon: "👑",
        category: "permanent",
        maxLevel: 1,
      },

      // --- VERBRAUCHSWARE ---
      gem_timelapse: {
        name: "Warp-Antrieb (4h)",
        desc: "Reise 4 Stunden in die Zukunft und ernte die Gewinne.",
        baseCost: 20,
        costFactor: 1.0,
        type: "consumable",
        icon: "🚀",
        category: "consumable",
      },
      gem_prestige_inject: {
        name: "Seelen-Extraktor",
        desc: "Extrahiert 70% deiner Prestige-Punkte OHNE Reset.",
        baseCost: 40,
        costFactor: 1.0,
        type: "consumable",
        icon: "💉",
        category: "consumable",
      },
      gem_refresh: {
        name: "System-Reboot",
        desc: "Setzt alle Skill-Cooldowns sofort auf 0 zurück.",
        baseCost: 15,
        costFactor: 1.0,
        type: "consumable",
        icon: "🔄",
        category: "consumable",
      },
    };
  }

  renderGemShop(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // LAYOUT FIX: Erzwingt, dass der Header OBEN ist
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.width = "100%";

    const state = this.game.gameState;
    if (!state.gemUpgrades) state.gemUpgrades = {};

    const randomQuote =
      this.quotes[Math.floor(Math.random() * this.quotes.length)];

    // 1. HEADER
    let html = `
            <div style="width: 100%; text-align:center; margin-bottom:30px; padding:30px 20px; background: radial-gradient(circle at center, #240046 0%, #0a0010 100%); border-bottom: 2px solid #d500f9; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); box-sizing: border-box;">
                <div style="color:#d1c4e9; font-style:italic; font-family:'Georgia', serif; font-size:0.9em; margin-bottom:10px; opacity:0.8;">"${randomQuote}"</div>
                <h2 class="purple-header-glow" style="color:#fff; margin:0; text-transform:uppercase; font-size: 1.5rem; letter-spacing:3px; line-height: 1.2; white-space: nowrap;">${this.shopName}</h2>
                <div style="margin-top:20px; display:inline-flex; align-items:center; background:rgba(0,0,0,0.6); padding:8px 30px; border-radius:50px; border:1px solid #7c4dff;">
                    <span style="font-size:1.5em; margin-right:12px;">👾</span>
                    <span style="font-size:1.4em; font-weight:bold; color:#fff;">
                        ${this.game.formatNumber(state.gems || 0)} <span style="color:#e040fb; font-size:0.6em; margin-left:8px; letter-spacing:1px;">CORRUPTED</span>
                    </span>
                </div>
            </div>

            <div id="gem-shop-content" style="width: 100%; box-sizing: border-box;">
        `;

    // Sektionen
    html += `<h4 style="color:#b388ff; border-bottom:1px solid #4a148c; padding-bottom:10px; margin-bottom:20px; letter-spacing:2px; font-size:0.9em; margin-top:0;">⚡ ARTEFAKTE DER MACHT</h4>`;
    html += `<div id="gem-grid-permanent" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;"></div>`;

    html += `<h4 style="color:#ea80fc; border-bottom:1px solid #4a148c; padding-bottom:10px; margin-bottom:20px; letter-spacing:2px; font-size:0.9em;">📦 SCHATTEN-WAREN</h4>`;
    html += `<div id="gem-grid-consumable" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;"></div>`;

    // --- 3. NEU: DER WECHSELKURS BEREICH ---
    const exchangeRate = 1000; // 1000 Prestige = 1 Corrupted
    const canExchange = (state.prestige_punkte_verfügbar || 0) >= exchangeRate;

    html += `
            <div class="exchange-box">
                <div>
                    <h4 style="margin:0; color:#fff; text-transform:uppercase;">⚖️ Dunkler Tauschhandel</h4>
                    <p style="margin:5px 0 0 0; color:#aaa; font-size:0.9em;">
                        Opfere deine reine Macht für korrupte Energie.<br>
                        <span style="color:#e066ff;">${this.game.formatNumber(exchangeRate)} Prestige 🌟 ⮕ 1 Corrupted Smiley 👾</span>
                    </p>
                    <p style="margin:5px 0 0 0; font-size:0.8em; color: ${canExchange ? "#4CAF50" : "#FF5252"}">
                        Verfügbar: ${this.game.formatNumber(state.prestige_punkte_verfügbar || 0)} Prestige
                    </p>
                </div>
                <button id="btn-exchange-prestige" class="exchange-btn" ${!canExchange ? "disabled" : ""}>
                    UMWANDELN
                </button>
            </div>
        `;

    html += `</div>`;
    container.innerHTML = html;

    // Listener für Tausch-Button
    const exBtn = document.getElementById("btn-exchange-prestige");
    if (exBtn && canExchange) {
      exBtn.onclick = () => {
        state.prestige_punkte_verfügbar -= exchangeRate;
        state.gems = (state.gems || 0) + 1;
        this.game.playBuySound(); // Falls verfügbar
        this.game.showNotification("Tausch erfolgreich: +1 👾", "success");
        this.game.updateUI();
        this.renderGemShop(containerId); // Refresh
        this.game.speichereSpiel();
      };
    }

    const gridPerm = container.querySelector("#gem-grid-permanent");
    const gridCons = container.querySelector("#gem-grid-consumable");

    Object.keys(this.upgrades).forEach((key) => {
      const def = this.upgrades[key];
      const lvl = state.gemUpgrades[key] || 0;
      let cost = def.baseCost;
      if (def.type === "passive" && !def.maxLevel) {
        cost = Math.floor(def.baseCost * Math.pow(def.costFactor, lvl));
      }

      const canAfford = (state.gems || 0) >= cost;
      const isMaxed = def.maxLevel && lvl >= def.maxLevel;
      const targetGrid = def.category === "consumable" ? gridCons : gridPerm;

      const card = document.createElement("div");
      card.className = `purple-card ${isMaxed ? "maxed" : ""}`;

      const iconGlow =
        def.category === "consumable"
          ? "drop-shadow(0 0 8px #ea80fc)"
          : "drop-shadow(0 0 10px #7c4dff)";
      let btnText = isMaxed
        ? "MAXIMAL"
        : def.type === "consumable"
          ? `${cost} 👾`
          : `${this.game.formatNumber(cost)} 👾`;

      card.innerHTML = `
                <div>
                    <div style="display:flex; align-items:center; gap: 15px; margin-bottom:15px;">
                        <div style="font-size:2.2em; filter: ${iconGlow};">${def.icon}</div>
                        <div style="flex:1; overflow:hidden;">
                            <div style="font-weight:bold; color:#fff; font-size:1.0rem; margin-bottom:4px;">${def.name}</div>
                            ${!def.maxLevel && def.type !== "consumable" ? `<div style="font-size:0.75em; color:#b388ff; background:rgba(124, 77, 255, 0.1); display:inline-block; padding:2px 6px; border-radius:4px;">Stufe ${lvl}</div>` : ""}
                            ${isMaxed ? `<div style="font-size:0.75em; color:#00e676; border:1px solid #00e676; display:inline-block; padding:1px 5px; border-radius:4px;">VOLLSTÄNDIG</div>` : ""}
                        </div>
                    </div>
                    <p style="font-size:0.85em; color:#ccc; line-height:1.5; margin-bottom:15px;">${def.desc}</p>
                </div>
                
                <button class="purple-btn" ${!canAfford || isMaxed ? "disabled" : ""}>
                    ${btnText}
                </button>
            `;

      if (canAfford && !isMaxed) {
        const btn = card.querySelector("button");
        btn.onclick = () => this.buyUpgrade(key);
      }

      targetGrid.appendChild(card);
    });
  }

  buyUpgrade(key) {
    const state = this.game.gameState;
    const def = this.upgrades[key];
    const lvl = state.gemUpgrades[key] || 0;

    if (def.maxLevel && lvl >= def.maxLevel) return;

    let cost = def.baseCost;
    if (def.type === "passive" && !def.maxLevel) {
      cost = Math.floor(def.baseCost * Math.pow(def.costFactor, lvl));
    }

    if ((state.gems || 0) >= cost) {
      state.gems -= cost;

      if (def.type === "passive") {
        state.gemUpgrades[key] = lvl + 1;
        this.game.showNotification(`${def.name} verbessert!`, "success");
      } else if (key === "gem_timelapse") {
        const sps = this.game.computeTotalSPS();
        const seconds = 4 * 60 * 60;
        this.game.addSmileys(sps * seconds);
        this.game.showNotification(
          `🚀 WARP AKTIV! +${this.game.formatNumber(sps * seconds)} Smileys`,
          "success",
        );
        this.game.triggerBigBang();
      } else if (key === "gem_prestige_inject") {
        const potential = this.game.calculatePrestigeGain();
        if (potential > 0) {
          const gain = Math.floor(potential * 0.7);
          if (gain > 0) {
            state.prestige_punkte_verfügbar += gain;
            state.gesamt_prestige_punkte += gain;
            this.game.showNotification(
              `💉 SEELEN GEERNTET: +${this.game.formatNumber(gain)}`,
              "success",
            );
            this.game.triggerBigBang();
          } else {
            state.gems += cost;
            return;
          }
        } else {
          state.gems += cost;
          return;
        }
      } else if (key === "gem_refresh") {
        Object.keys(state.skills).forEach((skillName) => {
          state.skills[skillName].active = false;
          state.skills[skillName].cooldown = false;
          state.skills[skillName].readyAt = 0;
          this.game.updateUI();
        });
        this.game.showNotification("🔄 SYSTEM NEUGESTARTET!", "success");
      }

      if (key === "gem_luck") state.critChance += 0.01;
      if (key === "gem_greed") state.diamondMineBoost += 0.05;

      this.game.playBuySound();
      this.game.applyAllBoni();
      this.game.updateUI();
      this.renderGemShop("gem_shop_container");
      this.game.speichereSpiel();
    } else {
      // Fehlermeldung angepasst
      this.game.showNotification("Nicht genug Corrupted Smileys!", "error");
    }
  }
}
