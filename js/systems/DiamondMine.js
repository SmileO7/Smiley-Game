// js/systems/DiamondMine.js

export class DiamondMine {
  constructor(gameInstance) {
    this.game = gameInstance;
    console.log("💎 DiamondMine System + Rendering geladen.");
  }

  // --- DATEN & LOGIK ---

  getLootContent(type) {
    const state = this.game.gameState;
    if (type === "fossil") return Math.floor(Math.random() * 3) + 1;
    if (type === "tool_tnt" || type === "tool_drill") return 1;

    const depth = state.mineDepth || 1;
    // Je tiefer, desto mehr Loot
    const multiplier = 1 + depth * 0.15;

    switch (type) {
      case "emerald":
        // Smaragde sind 5x bis 10x wertvoller als Diamanten
        return Math.floor((Math.random() * 25 + 50) * multiplier);
      case "diamond":
        return Math.floor((Math.random() * 5 + 1) * multiplier);
      case "gold":
        let base = state.totalSPS > 0 ? state.totalSPS : 10;
        let amount = Math.floor(base * (Math.random() * 60 + 10));
        return Math.max(100, amount);
      case "treasure":
        return "GIFT";
      case "passage":
        return "TIEFER";
      case "secret_passage":
        return "GEHEIM";
      default:
        return 0;
    }
  }

  generateMineGrid() {
    const state = this.game.gameState;
    const grid = new Array(25).fill(null);
    const size = 25;
    const depth = state.mineDepth || 1;

    // Smaragd-Zone ab Tiefe 5
    const isEmeraldLayer = depth >= 5;

    // 1. SCHATZKAMMER (Bleibt gleich, evtl. mehr Gold)
    if (state.isTreasureRoom) {
      this.game.showNotification("✨ SCHATZKAMMER! ✨", "success");
      const exitIndex = Math.floor(Math.random() * size);
      grid[exitIndex] = {
        id: exitIndex,
        type: "passage",
        revealed: false,
        content: "RAUS",
      };

      for (let i = 0; i < size; i++) {
        if (grid[i]) continue;
        const rng = Math.random();
        let type = "gold";
        // In der Schatzkammer gibts jetzt auch Chance auf Smaragde
        if (isEmeraldLayer && rng > 0.9) type = "emerald";
        else if (rng > 0.85) type = "fossil";
        else if (rng > 0.7) type = "tool_tnt";
        else if (rng > 0.95) type = "tool_drill";
        else if (rng > 0.4) type = "diamond";
        else if (rng > 0.2) type = "treasure";
        grid[i] = {
          id: i,
          type: type,
          revealed: false,
          content: this.getLootContent(type),
        };
      }
    }
    // 2. NORMALE EBENE
    else {
      const exitIndex = Math.floor(Math.random() * size);
      grid[exitIndex] = {
        id: exitIndex,
        type: "passage",
        revealed: false,
        content: "ABSTIEG",
      };

      // Geheimgang
      if (Math.random() < 0.05) {
        let secretIndex;
        do {
          secretIndex = Math.floor(Math.random() * size);
        } while (secretIndex === exitIndex);
        grid[secretIndex] = {
          id: secretIndex,
          type: "secret_passage",
          revealed: false,
          content: "GEHEIMNIS",
        };
      }

      // Boni berechnen
      const depthBonus = Math.min(0.3, (depth - 1) * 0.01);
      const fossilBonus = (state.mineResearch.fossil_scanner || 0) * 0.02;

      for (let i = 0; i < size; i++) {
        if (grid[i]) continue;
        const rng = Math.random();
        let type = "stone"; // Das ist die "Niete"

        // Wahrscheinlichkeiten
        if (rng > 0.98 - fossilBonus) type = "fossil";
        else if (rng > 0.95)
          type = "tool_tnt"; // 5% Chance auf TNT
        else if (rng > 0.93)
          type = "tool_drill"; // 2% Chance auf Bohrer
        else if (isEmeraldLayer && rng > 0.88)
          type = "emerald"; // Smaragde nur tief unten!
        else if (rng > 0.85 - depthBonus) type = "treasure";
        else if (rng > 0.7 - depthBonus) type = "diamond";
        else if (rng > 0.45) type = "gold";

        grid[i] = {
          id: i,
          type: type,
          revealed: false,
          content: this.getLootContent(type),
        };
      }
    }
    state.mineGrid = grid;
    this.game.speichereSpiel();
  }

  handleMineClick(index) {
    const state = this.game.gameState;
    const tool = state.selectedTool || "pickaxe";
    if (tool === "tnt") this.useTNT(index);
    else if (tool === "drill") this.useDrill(index);
    else this.usePickaxe(index);
  }

  usePickaxe(index) {
    const state = this.game.gameState;
    if (state.mineInventory.pickaxe <= 0) {
      this.game.showNotification("⛏️ Keine Spitzhacken mehr!", "error");
      return;
    }
    const tile = state.mineGrid[index];
    if (!tile || tile.revealed) return;

    const saveChance = (state.mineResearch.durable_picks || 0) * 0.1;
    if (Math.random() > saveChance) state.mineInventory.pickaxe--;

    this.processTile(index);
  }

  processTile(index) {
    const state = this.game.gameState;
    const tile = state.mineGrid[index];
    if (!tile || tile.revealed) return;

    tile.revealed = true;
    this.game.playClickSound();

    let amount = tile.content;
    if (!amount || amount <= 0) amount = 100;

    // --- PRESTIGE CHECK (ID 16: Glitzer-Gier) ---
    // Falls das Upgrade gekauft wurde, erhöhen wir die Ausbeute von Edelsteinen um 20%
    const hasMineBuff = this.game.gameState.prestigeUpgradeStatus[16];
    const lootMultiplier = hasMineBuff ? 1.2 : 1.0;

    // --- LOOT LOGIK MIT FLOATING TEXT ---

    if (tile.type === "emerald") {
      const finalAmount = Math.ceil(amount * lootMultiplier);
      state.diamanten += finalAmount;
      this.showLootText(index, `+${finalAmount} 💚`, "#00ff88"); // Hellgrün
      this.game.triggerShake("diamanten_anzeige");
    } else if (tile.type === "diamond") {
      const finalAmount = Math.ceil(amount * lootMultiplier);
      state.diamanten += finalAmount;
      this.showLootText(index, `+${finalAmount} 💎`, "#009ffd"); // Blau
    } else if (tile.type === "gold") {
      this.game.addSmileys(amount);
      this.showLootText(
        index,
        `+${this.game.formatNumber(amount)} 💰`,
        "#ffeb3b",
      ); // Gelb
    } else if (tile.type === "fossil") {
      state.fossilien += amount;
      this.showLootText(index, `+${amount} 🦖`, "#e0e0e0"); // Grau/Weiß
    } else if (tile.type === "tool_tnt") {
      state.mineInventory.tnt++;
      this.showLootText(index, "+1 🧨", "#ff5252"); // Rot
    } else if (tile.type === "tool_drill") {
      state.mineInventory.drill++;
      this.showLootText(index, "+1 🔩", "#ffa726"); // Orange
    } else if (tile.type === "treasure") {
      // Schätze geben auch mehr, wenn der Buff aktiv ist
      const baseDia = Math.floor(50 * (1 + state.mineDepth * 0.1));
      const finalDia = Math.ceil(baseDia * lootMultiplier);
      state.diamanten += finalDia;
      this.showLootText(index, `+${finalDia} 💎`, "#FFD700"); // Gold
      this.game.showNotification(`🎁 SCHATZ GEFUNDEN!`, "success");
    } else if (tile.type === "passage" || tile.type === "secret_passage") {
      if (state.isTreasureRoom) {
        state.isTreasureRoom = false;
        this.game.showNotification("Schatzkammer verlassen.", "info");
      }
      if (tile.type === "secret_passage") state.isTreasureRoom = true;

      state.mineDepth++;
      this.showLootText(index, "ABSTIEG!", "#ffffff");

      setTimeout(() => {
        this.reloadMineLevel();
      }, 500);
    }

    this.game.speichereSpiel();
    this.updateMineVisuals();
  }

  useTNT(centerIndex) {
    const state = this.game.gameState;
    if (state.mineInventory.tnt <= 0) {
      this.game.showNotification("Kein TNT!", "error");
      return;
    }
    state.mineInventory.tnt--;
    const size = 5;
    const row = Math.floor(centerIndex / size);
    const col = centerIndex % size;
    let hit = false;

    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < size && c >= 0 && c < size) {
          const idx = r * size + c;
          if (!state.mineGrid[idx].revealed) {
            this.processTile(idx);
            hit = true;
          }
        }
      }
    }
    if (hit) this.game.showNotification("BOOM! 💥", "success");
    this.updateMineVisuals();
  }

  useDrill(centerIndex) {
    const state = this.game.gameState;
    if (state.mineInventory.drill <= 0) {
      this.game.showNotification("Kein Bohrer!", "error");
      return;
    }
    state.mineInventory.drill--;
    const row = Math.floor(centerIndex / 5);
    for (let c = 0; c < 5; c++) {
      const idx = row * 5 + c;
      if (!state.mineGrid[idx].revealed) this.processTile(idx);
    }
    this.game.showNotification("BRRRRRR!", "success");
    this.updateMineVisuals();
  }

  // --- RENDERING & TABS (DAS HIER FEHLTE!) ---

  renderDiamondMineContent() {
    const container = document.getElementById("diamond-mine-content");
    if (!container) return;

    // 1. Navigation & Header EINMALIG aufbauen
    if (!document.getElementById("mine-nav-wrapper")) {
      container.innerHTML = `
                <div id="mine-nav-wrapper" class="mine-nav" style="display:flex; gap:10px; margin-bottom:15px;">
                    <button id="tab-mine" class="btn-primary" style="flex:1">⛏️ Mine</button>
                    <button id="tab-research" class="btn-primary" style="flex:1">🧪 Labor</button>
                    <button id="tab-shop" class="btn-primary" style="flex:1">💎 Shop</button>
                </div>
                
                <div style="background:rgba(0,0,0,0.3); padding:8px; border-radius:8px; display:flex; justify-content:space-around; margin-bottom:15px; font-weight:bold;">
                    <span style="color:#009ffd">💎 <span id="res-dias">0</span></span>
                    <span style="color:#e0e0e0">🦖 <span id="res-fossil">0</span></span>
                    <span style="color:#ffeb3b">💰 <span id="res-gold">0</span></span>
                </div>

                <div id="mine-sub-content"></div>
            `;

      // Listener (Nur einmal!)
      document.getElementById("tab-mine").onclick = () =>
        this.switchMineTab("mine");
      document.getElementById("tab-research").onclick = () =>
        this.switchMineTab("research");
      document.getElementById("tab-shop").onclick = () =>
        this.switchMineTab("shop");
    }

    // 2. Werte oben immer aktuell halten
    const elDias = document.getElementById("res-dias");
    const elFossil = document.getElementById("res-fossil");
    const elGold = document.getElementById("res-gold");

    if (elDias)
      elDias.innerText = this.game.formatNumber(this.game.gameState.diamanten);
    if (elFossil) elFossil.innerText = this.game.gameState.fossilien || 0;
    if (elGold)
      elGold.innerText = this.game.formatNumber(
        this.game.gameState.aktuelle_smileys,
      );

    // 3. Tab-Styling
    const activeTab = this.game.diamondMineView || "mine";
    const navWrapper = document.getElementById("mine-nav-wrapper");

    if (navWrapper.dataset.lastActive !== activeTab) {
      ["mine", "research", "shop"].forEach((t) => {
        const btn = document.getElementById(`tab-${t}`);
        if (activeTab === t) {
          btn.style.background = "#009ffd";
          btn.style.borderColor = "#009ffd";
          btn.style.color = "#fff";
          btn.classList.remove("btn-cancel");
        } else {
          btn.style.background = "#333";
          btn.style.borderColor = "#444";
          btn.style.color = "#aaa";
          btn.classList.add("btn-cancel");
        }
      });
      navWrapper.dataset.lastActive = activeTab;
    }

    // 4. Inhalt rendern
    const contentDiv = document.getElementById("mine-sub-content");

    if (activeTab === "mine") {
      if (!document.getElementById("mine-interface-wrapper")) {
        this.renderDiamondMinigame(contentDiv);
      } else {
        this.updateMineVisuals();
      }
    } else if (activeTab === "research") {
      if (
        contentDiv.innerHTML === "" ||
        !document.getElementById("research-grid")
      ) {
        this.renderMineResearch(contentDiv);
      }
    } else {
      if (
        contentDiv.innerHTML === "" ||
        !document.getElementById("diamond-shop-grid-inner")
      ) {
        this.renderDiamondShopContent(contentDiv);
      }
    }
  }

  switchMineTab(tabName) {
    this.game.diamondMineView = tabName;
    const contentDiv = document.getElementById("mine-sub-content");
    if (contentDiv) contentDiv.innerHTML = "";
    this.renderDiamondMineContent();
  }

  renderMineResearch(container) {
    container.innerHTML = `
            <h3 style="text-align:center; margin-bottom:10px;">Forschungs-Labor</h3>
            <p style="text-align:center; font-size:0.9em; color:#aaa; margin-bottom:20px;">
                Untersuche gefundene Fossilien, um deine Bergbau-Technologie zu verbessern.
            </p>
            <div class="info-grid" id="research-grid"></div>
        `;

    const grid = document.getElementById("research-grid");
    const upgrades = [
      {
        id: "durable_picks",
        name: "Haltbare Spitzen",
        desc: "10% Chance pro Level, keine Spitzhacke zu verbrauchen.",
        icon: "⛏️",
        max: 5,
        baseCost: 5,
      },
      {
        id: "fossil_scanner",
        name: "Fossilien-Scanner",
        desc: "Erhöht die Chance, Fossilien in Steinen zu finden.",
        icon: "🦖",
        max: 5,
        baseCost: 10,
      },
      {
        id: "explosive_yield",
        name: "Sprengmeister",
        desc: "TNT deckt Ressourcen besser auf (Test-Upgrade).",
        icon: "🧨",
        max: 3,
        baseCost: 20,
      },
    ];

    upgrades.forEach((u) => {
      const currentLvl = this.game.gameState.mineResearch[u.id] || 0;
      const cost = Math.floor(u.baseCost * Math.pow(1.5, currentLvl));
      const isMaxed = currentLvl >= u.max;
      const canAfford = this.game.gameState.fossilien >= cost;

      const div = document.createElement("div");
      div.className = `info-upgrade-item ${isMaxed ? "purchased" : canAfford ? "available" : "locked"}`;
      div.innerHTML = `
                <div style="font-size:2em; margin-bottom:5px;">${u.icon}</div>
                <h4>${u.name} (Lv. ${currentLvl}/${u.max})</h4>
                <p style="font-size:0.85em; min-height:40px;">${u.desc}</p>
                <button class="btn-buy-research" ${isMaxed || !canAfford ? "disabled" : ""} 
                        style="width:100%; margin-top:5px; background:${canAfford ? "var(--color-primary)" : "#444"}">
                    ${isMaxed ? "MAX" : `Forschen (${cost} 🦖)`}
                </button>
            `;

      div.querySelector("button").onclick = () => {
        if (!isMaxed && canAfford) {
          this.game.gameState.fossilien -= cost;
          if (!this.game.gameState.mineResearch[u.id])
            this.game.gameState.mineResearch[u.id] = 0;
          this.game.gameState.mineResearch[u.id]++;
          this.game.playBuySound();
          this.game.showNotification("Forschung abgeschlossen! 🧪", "success");
          this.renderDiamondMineContent();
          this.game.speichereSpiel();
        }
      };
      grid.appendChild(div);
    });
  }

  renderDiamondShopContent(targetContainer) {
    const container = targetContainer;
    if (!container) return;
    const diamondDisplay = this.game.getById("shop-diamanten-anzeige");
    if (diamondDisplay)
      diamondDisplay.innerText = this.game.formatNumber(
        this.game.gameState.diamanten,
      );

    container.innerHTML = `<div class="info-grid" id="diamond-shop-grid-inner"></div>`;
    const innerGrid = this.game.getById("diamond-shop-grid-inner");
    if (!innerGrid) return;

    let shopHtml = "";
    diamondShopUpgrades.forEach((upgrade, index) => {
      const count = this.game.gameState.diamondShopPurchases[index] || 0;
      const isPurchased = count > 0;
      const isMaxed = upgrade.maxPurchases && count >= upgrade.maxPurchases;
      const canAfford = this.game.gameState.diamanten >= upgrade.cost;
      const stateClass = isMaxed
        ? "purchased"
        : canAfford
          ? "available"
          : "locked";
      const buttonText = isMaxed
        ? "Gekauft"
        : `Kaufen (${this.game.formatNumber(upgrade.cost)} 💎)`;

      shopHtml += `
                <div class="info-upgrade-item ${stateClass}" data-id="${upgrade.id}">
                    <h4>${upgrade.name}</h4>
                    <p>${upgrade.description}</p>
                    <p>Status: ${isMaxed ? "Permanent" : "Verfügbar"}</p>
                    <button class="btn-buy-diamond" data-id="${upgrade.id}" ${isMaxed || !canAfford ? "disabled" : ""}>
                        ${buttonText}
                    </button>
                </div>
            `;
    });
    innerGrid.innerHTML = shopHtml;
    innerGrid.querySelectorAll(".btn-buy-diamond").forEach((button) => {
      button.addEventListener("click", (e) => {
        const id = parseInt(e.target.dataset.id, 10);
        this.game.buyDiamondShopUpgrade(id);
      });
    });
  }

  renderDiamondMinigame(targetContainer) {
    const container =
      targetContainer || document.getElementById("minigame-placeholder");
    const finalContainer =
      container || document.getElementById("mine-sub-content");
    if (!finalContainer) return;

    if (
      !this.game.gameState.mineGrid ||
      this.game.gameState.mineGrid.length === 0
    ) {
      this.generateMineGrid();
    }

    // 1. Grundgerüst bauen
    if (!document.getElementById("mine-interface-wrapper")) {
      finalContainer.innerHTML = `
                <div id="mine-interface-wrapper">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <div>
                            <h3 id="mine-title" style="margin:0; color:#009ffd;">Lade...</h3>
                            <small id="mine-subtitle" style="color:#aaa;">...</small>
                        </div>
                    </div>
                    <div class="tool-bar" style="display:flex; gap:10px; justify-content:center; margin-bottom:15px; background:rgba(0,0,0,0.2); padding:10px; border-radius:10px;">
                        <button id="tool-pickaxe" class="btn-tool" title="Standard">⛏️ <span id="qty-pickaxe">0</span></button>
                        <button id="tool-tnt" class="btn-tool" title="Sprengt 3x3">🧨 <span id="qty-tnt">0</span></button>
                        <button id="tool-drill" class="btn-tool" title="Bohrt Zeile">🔩 <span id="qty-drill">0</span></button>
                    </div>
                    <div class="mine-grid" id="mine-grid-area"></div>
                </div>
            `;

      // Listener binden (intern in der Klasse)
      document.getElementById("tool-pickaxe").onclick = () => {
        this.game.gameState.selectedTool = "pickaxe";
        this.updateMineVisuals();
      };
      document.getElementById("tool-tnt").onclick = () => {
        this.game.gameState.selectedTool = "tnt";
        this.updateMineVisuals();
      };
      document.getElementById("tool-drill").onclick = () => {
        this.game.gameState.selectedTool = "drill";
        this.updateMineVisuals();
      };
    }

    // 2. Steine rendern
    const gridArea = document.getElementById("mine-grid-area");
    if (gridArea && gridArea.children.length === 0) {
      this.game.gameState.mineGrid.forEach((tile, index) => {
        const tileDiv = document.createElement("div");
        tileDiv.id = `mine-tile-${index}`;
        tileDiv.className = "mine-tile";
        if (tile.revealed) {
          tileDiv.className += " revealed";
          let symbol = this.getTileSymbol(tile.type);
          tileDiv.innerHTML = symbol;
        }
        // HIER: Aufruf an die interne handleMineClick Funktion
        tileDiv.onclick = () => this.handleMineClick(index);
        gridArea.appendChild(tileDiv);
      });
    }
    this.updateMineVisuals();
  }

  updateMineVisuals() {
    if (this.game.diamondMineView !== "mine") return;
    if (!document.getElementById("mine-interface-wrapper")) return;

    const state = this.game.gameState;
    const inv = state.mineInventory;
    const currentTool = state.selectedTool || "pickaxe";
    const isTreasure = state.isTreasureRoom;

    const titleEl = document.getElementById("mine-title");
    const subEl = document.getElementById("mine-subtitle");
    if (titleEl) {
      titleEl.innerText = isTreasure
        ? "👑 SCHATZKAMMER"
        : `⛏️ Ebene ${state.mineDepth}`;
      titleEl.style.color = isTreasure ? "#FFD700" : "#009ffd";
    }
    if (subEl)
      subEl.innerText = isTreasure
        ? "Alles einsammeln!"
        : "Finde den Ausgang 🚪";

    this.safeText("qty-pickaxe", inv.pickaxe);
    this.safeText("qty-tnt", inv.tnt);
    this.safeText("qty-drill", inv.drill);

    this.updateToolBtn("tool-pickaxe", "pickaxe", currentTool);
    this.updateToolBtn("tool-tnt", "tnt", currentTool);
    this.updateToolBtn("tool-drill", "drill", currentTool);

    const gridArea = document.getElementById("mine-grid-area");
    if (gridArea)
      gridArea.style.borderColor = isTreasure ? "#FFD700" : "transparent";

    state.mineGrid.forEach((tile, index) => {
      const tileDiv = document.getElementById(`mine-tile-${index}`);
      if (!tileDiv) return;

      const newClass = `mine-tile ${tile.revealed ? "revealed" : "hidden"}`;
      if (tileDiv.className !== newClass) tileDiv.className = newClass;

      if (tile.revealed) {
        const newHTML = this.getTileSymbol(tile.type);
        if (tileDiv.innerHTML !== newHTML) tileDiv.innerHTML = newHTML;
        tileDiv.title = "";
      } else {
        if (tileDiv.innerHTML !== "") tileDiv.innerHTML = "";
        let tip = "";
        if (currentTool === "tnt") tip = "Sprengen (3x3)";
        else if (currentTool === "drill") tip = "Bohren (Zeile)";
        if (tileDiv.title !== tip) tileDiv.title = tip;
      }
    });
  }

  reloadMineLevel() {
    this.game.gameState.mineGrid = [];
    this.generateMineGrid();
    const gridArea = document.getElementById("mine-grid-area");
    if (gridArea) gridArea.innerHTML = "";
    const contentDiv = document.getElementById("mine-sub-content");
    this.renderDiamondMinigame(contentDiv);
  }

  // --- HELPER ---
  safeText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  }

  updateToolBtn(id, toolName, currentTool) {
    const btn = document.getElementById(id);
    if (!btn) return;
    if (currentTool === toolName) {
      btn.style.border = "2px solid #009ffd";
      btn.style.backgroundColor = "#444";
      btn.style.transform = "scale(1.1)";
    } else {
      btn.style.border = "1px solid #555";
      btn.style.backgroundColor = "#333";
      btn.style.transform = "scale(1)";
    }
  }

  getTileSymbol(type) {
    switch (type) {
      case "stone":
        return '<span class="loot-stone">🪨</span>';
      case "emerald":
        return '<span class="loot-emerald">💚</span>'; // <-- NEU
      case "diamond":
        return '<span class="loot-diamond">💎</span>';
      case "gold":
        return '<span class="loot-gold">💰</span>';
      case "treasure":
        return '<span class="loot-diamond">🎁</span>';
      case "passage":
        return '<span class="loot-passage">🚪</span>';
      case "secret_passage":
        return '<span class="loot-passage">🕳️</span>';
      case "tool_tnt":
        return "<span>🧨</span>";
      case "tool_drill":
        return "<span>🔩</span>";
      case "fossil":
        return '<span class="loot-fossil">🦖</span>';
      case "artifact":
        return "<span>🏺</span>";
      default:
        return "";
    }
  }

  // Zeigt Text genau über einem Stein an
  showLootText(index, text, color) {
    const tile = document.getElementById(`mine-tile-${index}`);
    if (!tile) return;

    const rect = tile.getBoundingClientRect();
    const el = document.createElement("div");
    el.className = "floating-text"; // Nutzt dein existierendes CSS
    el.innerText = text;

    // Positionierung: Mitte des Steins
    el.style.left = rect.left + rect.width / 2 + "px";
    el.style.top = rect.top + rect.height / 2 + "px";
    el.style.color = color || "#fff";
    el.style.zIndex = "2000"; // Über allem anderen

    document.body.appendChild(el);

    // Animation (hochschweben und verblassen)
    el.animate(
      [
        { transform: "translate(-50%, -50%) translateY(0)", opacity: 1 },
        { transform: "translate(-50%, -50%) translateY(-40px)", opacity: 0 },
      ],
      {
        duration: 1000,
        easing: "ease-out",
      },
    );

    setTimeout(() => el.remove(), 1000);
  }
}
