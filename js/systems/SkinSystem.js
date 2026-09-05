// js/systems/SkinSystem.js

// ================================================================================================================
// === SUB-SYSTEM: DER KLEIDERSCHRANK (Skins & Visuals) ===
// ================================================================================================================

 export class SkinSystem {
  constructor(gameInstance) {
    this.game = gameInstance;
    console.log("👕 SkinSystem geladen.");

    // Die Liste aller verfügbaren Skins
    this.skins = [
      {
        id: "default",
        name: "Klassisch",
        icon: "😊",
        cost: 0,
        desc: "Der gute alte Standard.",
        css: "",
      },
      {
        id: "cool",
        name: "Der Coole",
        icon: "😎",
        cost: 2,
        desc: "Schützt vor UV-Strahlen.",
        css: "",
      },
      {
        id: "rich",
        name: "Monokel",
        icon: "🧐",
        cost: 5,
        desc: "Wirkt sofort intelligenter.",
        css: "",
      },
      {
        id: "cowboy",
        name: "Sheriff",
        icon: "🤠",
        cost: 8,
        desc: "Dieser Server ist zu klein für uns beide.",
        css: "",
      },
      {
        id: "party",
        name: "Party",
        icon: "🥳",
        cost: 10,
        desc: "Jeder Klick ein Fest.",
        css: "",
      },
      {
        id: "robot",
        name: "Mecha-V1",
        icon: "🤖",
        cost: 15,
        desc: "Klick-Geräusche nicht inklusive.",
        css: "",
      },
      {
        id: "alien",
        name: "Area 51",
        icon: "👽",
        cost: 20,
        desc: "Sie sind unter uns.",
        css: "",
      },
      {
        id: "devil",
        name: "Diablo",
        icon: "😈",
        cost: 25,
        desc: "Ein teuflischer Deal.",
        css: "",
      },
      {
        id: "clown",
        name: "Joker",
        icon: "🤡",
        cost: 30,
        desc: "Warum denn so ernst?",
        css: "",
      },
      {
        id: "ghost",
        name: "Phantom",
        icon: "👻",
        cost: 40,
        desc: "Jetzt siehst du mich...",
        css: "ghost-anim",
      },
      {
        id: "glitch",
        name: "MISSINGNO",
        icon: "👾",
        cost: 50,
        desc: "D4t3n f3hl3r...",
        css: "glitch-anim",
      },
      {
        id: "king",
        name: "Der König",
        icon: "👑",
        cost: 100,
        desc: "Das ultimative Statussymbol.",
        css: "king-glow",
      },
    ];
  }

  // Rendert das Fenster
  renderWardrobe() {
    const container = document.getElementById("wardrobe-grid");
    const modal = document.getElementById("wardrobe-modal");
    const state = this.game.gameState;

    if (!container || !modal) return;

    // Sicherstellen, dass Datenstruktur existiert
    if (!state.unlockedSkins) state.unlockedSkins = ["default"];
    if (!state.activeSkin) state.activeSkin = "default";

    container.innerHTML = "";

    this.skins.forEach((skin) => {
      const isUnlocked = state.unlockedSkins.includes(skin.id);
      const isActive = state.activeSkin === skin.id;
      const canAfford = state.gems >= skin.cost;

      const card = document.createElement("div");
      card.className = `skin-card ${isActive ? "active-skin" : ""}`;

      let btnHtml = "";
      if (isActive) {
        btnHtml = `<button disabled style="background:#4CAF50; color:#fff; border:none; padding:5px 10px; border-radius:4px; width:100%;">Ausgerüstet</button>`;
      } else if (isUnlocked) {
        btnHtml = `<button class="btn-equip-skin" data-id="${skin.id}" style="background:#009ffd; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; width:100%;">Ausrüsten</button>`;
      } else {
        btnHtml = `<button class="btn-buy-skin" data-id="${skin.id}" ${canAfford ? "" : "disabled"} 
                           style="background:${canAfford ? "#e066ff" : "#333"}; color:${canAfford ? "#fff" : "#888"}; border:none; padding:5px 10px; border-radius:4px; cursor:${canAfford ? "pointer" : "not-allowed"}; width:100%;">
                           Kaufen (${skin.cost} 👾)
                           </button>`;
      }

      card.innerHTML = `
                <div class="skin-icon ${skin.css}">${skin.icon}</div>
                <div style="font-weight:bold; color:#fff; margin-bottom:5px;">${skin.name}</div>
                <div style="font-size:0.75em; color:#aaa; height:30px; margin-bottom:5px;">${skin.desc}</div>
                ${btnHtml}
            `;

      // Event Listener
      if (!isActive) {
        const btn = card.querySelector("button");
        if (btn.classList.contains("btn-buy-skin")) {
          btn.onclick = () => this.buySkin(skin.id);
        } else if (btn.classList.contains("btn-equip-skin")) {
          btn.onclick = () => this.equipSkin(skin.id);
        }
      }

      container.appendChild(card);
    });

    modal.style.display = "flex";
  }

  buySkin(skinId) {
    const state = this.game.gameState;
    const skin = this.skins.find((s) => s.id === skinId);

    if (!skin || state.unlockedSkins.includes(skinId)) return;

    if (state.gems >= skin.cost) {
      state.gems -= skin.cost;
      state.unlockedSkins.push(skinId);
      this.game.playBuySound();
      this.game.showNotification(`👕 Skin "${skin.name}" gekauft!`, "success");
      this.game.updateUI(); // Updated Gems Anzeige
      this.renderWardrobe();
      this.game.speichereSpiel();
    } else {
      this.game.showNotification("Nicht genug Corrupted Smileys!", "error");
    }
  }

  equipSkin(skinId) {
    const state = this.game.gameState;
    if (!state.unlockedSkins.includes(skinId)) return;

    state.activeSkin = skinId;
    this.updateSmileyAppearance();
    this.renderWardrobe();
    this.game.showNotification("Skin gewechselt!", "success");
    this.game.speichereSpiel();
  }

  updateSmileyAppearance() {
    const state = this.game.gameState;
    const btn = document.getElementById("smiley_button");
    if (!btn) return;

    const skinId = state.activeSkin || "default";
    const skin = this.skins.find((s) => s.id === skinId) || this.skins[0];

    // 1. Icon ändern
    btn.innerText = skin.icon;

    // 2. CSS Klassen resetten und neue setzen
    // Wir behalten 'active-key' und 'anim-squish' bei, falls sie gerade laufen
    const keepClasses = [];
    if (btn.classList.contains("active-key")) keepClasses.push("active-key");
    if (btn.classList.contains("anim-squish")) keepClasses.push("anim-squish");

    btn.className = ""; // Alles weg
    btn.classList.add("smiley-btn"); // Basis Klasse wieder rein (musst du im CSS haben oder id nutzen)

    // Alte Klassen wieder rein
    keepClasses.forEach((c) => btn.classList.add(c));

    // Spezial-Effekt Klasse vom Skin hinzufügen
    if (skin.css) {
      btn.classList.add(skin.css);
    }
  }
}
