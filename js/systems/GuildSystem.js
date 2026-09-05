// js/systems/GuildSystem.js

// ================================================================================================================
// === SUB-SYSTEM: GUILD SYSTEM (Mit Söldner-Feature) ===
// ================================================================================================================

export class GuildSystem {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.guildView = "shop";
    this.selectedMercenaryId = null; // Welcher Söldner ist gerade ausgewählt?
    this.currentGuildBank = 0;
    console.log("⚔️ GuildSystem + Söldner geladen.");
    this.upgradeDefinitions = guildUpgradesData;
    setInterval(() => {
      const modal = document.getElementById("guilds-modal"); // Prüfen, ob Gilden-Fenster offen ist
      if (
        modal &&
        modal.style.display === "flex" &&
        this.guildView === "quests"
      ) {
        this.renderGuildsContent();
      }
    }, 60000); // Alle 60 Sekunden
  }

  // --- SÖLDNER LOGIK ---

  getMercenaryBonus(merc) {
    // Basis-Bonus: 10% mehr pro Level
    let multiplier = 1 + (merc.level - 1) * 0.1;
    return multiplier;
  }

  recruitMercenary() {
    const state = this.game.gameState;
    // Kosten: 1 Mrd * Anzahl Söldner
    const cost = 1000000000 * (state.guildMercenaries.length + 1);

    if (state.aktuelle_smileys < cost) {
      this.game.showNotification(
        "❌ Nicht genug Smileys zum Anheuern!",
        "error",
      );
      return;
    }
    if (state.guildMercenaries.length >= 5) {
      // Max 5 Söldner
      this.game.showNotification("Deine Kaserne ist voll (Max 5)!", "error");
      return;
    }

    state.aktuelle_smileys -= cost;

    const names = [
      "Geralt",
      "Xena",
      "Arthur",
      "Merlin",
      "Robin",
      "Buffy",
      "Conan",
      "Viking",
    ];
    const types = ["scout", "miner", "fighter"];

    const newMerc = {
      id: "merc_" + Date.now(),
      name: names[Math.floor(Math.random() * names.length)],
      level: 1,
      xp: 0,
      maxXp: 100,
      type: types[Math.floor(Math.random() * types.length)],
      status: "idle",
      questId: null,
      talents: {
        availablePoints: 0,
        spentPoints: 0,
        choices: {},
      },
    };

    // HIER WAR DER CODE - JETZT GELÖSCHT!

    state.guildMercenaries.push(newMerc);
    this.game.showNotification("⚔️ Neuer Söldner angeheuert!", "success");
    this.game.updateUI();
    this.renderGuildsContent();
    this.game.speichereSpiel();
  }

  // --- QUEST LOGIK (NEU) ---

  generateGuildQuests(force = false) {
    const state = this.game.gameState;
    if (!state.guildAvailableQuests) state.guildAvailableQuests = [];

    const now = Date.now();
    const COOLDOWN = 30 * 60 * 1000;

    const needsRefill = state.guildAvailableQuests.length === 0;
    const cooldownOver = now - (state.lastQuestFolderRefresh || 0) > COOLDOWN;

    if (!force && !needsRefill && !cooldownOver) return;

    state.lastQuestFolderRefresh = now;

    if (state.guildAvailableQuests.length > 5) {
      state.guildAvailableQuests = state.guildAvailableQuests.slice(0, 5);
    }
    if (state.guildAvailableQuests.length === 5) return;

    const rarities = [
      {
        name: "Gewöhnlich",
        multi: 1,
        color: "#fff",
        chance: 0.6,
        failRisk: 0.05,
      },
      {
        name: "Selten",
        multi: 3,
        color: "#009ffd",
        chance: 0.3,
        failRisk: 0.15,
      },
      {
        name: "Episch",
        multi: 8,
        color: "#9c27b0",
        chance: 0.09,
        failRisk: 0.3,
      },
      {
        name: "Legendär",
        multi: 20,
        color: "#ff9800",
        chance: 0.01,
        failRisk: 0.5,
      },
    ];

    // NEU: Unsere 3 Spezialisierungen
    const questFocuses = [
      { id: "gold", prefix: "💰", chance: 0.4 },
      { id: "gems", prefix: "💎", chance: 0.3 },
      { id: "exp", prefix: "⚔️", chance: 0.3 },
    ];

    while (state.guildAvailableQuests.length < 5) {
      // 1. Seltenheit auswürfeln
      const r = Math.random();
      let rarity = rarities[0];
      if (r > 0.99) rarity = rarities[3];
      else if (r > 0.9) rarity = rarities[2];
      else if (r > 0.6) rarity = rarities[1];

      // 2. Fokus auswürfeln
      const rFocus = Math.random();
      let focus = questFocuses[0];
      if (rFocus > 0.7) focus = questFocuses[2];
      else if (rFocus > 0.4) focus = questFocuses[1];

      const duration = Math.floor(Math.random() * 300) + 60; // 1 bis 6 Minuten
      const loc =
        guildQuestData.locations[
          Math.floor(Math.random() * guildQuestData.locations.length)
        ];
      const act =
        guildQuestData.actions[
          Math.floor(Math.random() * guildQuestData.actions.length)
        ];

      // Name bekommt jetzt ein passendes Icon davor!
      let name = `${focus.prefix} ${loc} ${act}`;

      // 3. BELOHNUNGEN VERTEILEN
      let r_smileys = 0;
      let r_diamonds = 0;
      let r_gems = 0;
      let r_guildXP = 10 * rarity.multi;
      let r_mercXP = 25 * rarity.multi;

      if (focus.id === "gold") {
        // MASSIV Smileys & Gilden-XP
        r_smileys = Math.max(
          100,
          Math.floor((state.totalSPS || 0) * duration * 0.8 * rarity.multi),
        );
        r_guildXP = Math.floor(r_guildXP * 1.5);
      } else if (focus.id === "gems") {
        // DIAMANTEN & GEMS (Keine Smileys)
        r_diamonds = Math.floor((Math.random() * 3 + 2) * rarity.multi);
        if (rarity.name === "Episch" || rarity.name === "Legendär") {
          r_gems = Math.floor((Math.random() * 2 + 1) * rarity.multi * 0.5); // Gems nur bei seltenen Quests!
        }
        r_smileys = Math.floor(
          (state.totalSPS || 0) * duration * 0.05 * rarity.multi,
        ); // Nur ein kleines Taschengeld
      } else if (focus.id === "exp") {
        // MASSIV SÖLDNER XP (Für Level-Ups)
        r_mercXP = Math.floor(r_mercXP * 3);
        r_smileys = Math.floor(
          (state.totalSPS || 0) * duration * 0.1 * rarity.multi,
        );
        if (Math.random() > 0.5) r_diamonds = rarity.multi; // Kleine Chance auf einen Dia
      }

      state.guildAvailableQuests.push({
        id: Date.now() + Math.random(),
        name: name,
        rarity: rarity,
        duration: duration,
        baseDuration: duration,
        failRisk: rarity.failRisk,
        focus: focus.id, // Speichern wir für spätere Nutzung
        rewards: {
          smileys: r_smileys,
          diamonds: r_diamonds,
          gems: r_gems,
          guildXP: r_guildXP,
          mercXP: r_mercXP,
        },
        assignedMerc: null,
        startTime: null,
      });
    }
  }

  completeQuest(quest) {
    const state = this.game.gameState;
    const merc = state.guildMercenaries.find(
      (m) => m.id === quest.assignedMerc,
    );
    if (!merc) return;

    // --- MIGRATIONS-CHECK (Falls alte Söldner geladen werden) ---
    if (!merc.talents) {
      merc.talents = { spentPoints: 0, choices: {}, availablePoints: 0 };
    }

    const classData = guildQuestData.classes[merc.type] || {
      levelScaling: 0.02,
    };
    const levelRiskReduction = (merc.level - 1) * classData.levelScaling;
    const finalRisk = Math.max(0.01, quest.failRisk - levelRiskReduction);

    const failRoll = Math.random();

    if (failRoll < finalRisk) {
      merc.status = "recovering";
      merc.recoveryUntil = Date.now() + 1000 * 60 * 15;
      this.game.showNotification(
        `${merc.name} wurde verletzt! Risiko war ${Math.round(finalRisk * 100)}%`,
        "error",
      );
    } else {
      this.applyQuestRewards(quest.rewards);

      merc.xp = (merc.xp || 0) + quest.rewards.mercXP;
      merc.xpNeeded = merc.xpNeeded || 100;

      if (merc.xp >= merc.xpNeeded) {
        merc.level = (merc.level || 1) + 1;
        merc.xp = 0;
        merc.xpNeeded = Math.floor(merc.xpNeeded * 1.5);

        // ====================================================
        // 🌟 NEU: TALENTPUNKT-CHECK (Alle 5 Level)
        // ====================================================
        if (merc.level % 5 === 0) {
          merc.talents.availablePoints =
            (merc.talents.availablePoints || 0) + 1;
          this.game.showNotification(
            `🌟 Talentpunkt für ${merc.name}!`,
            "success",
          );
          this.game.playLevelUpSound(); // Falls Sound vorhanden
        }
        // ====================================================

        this.game.showNotification(
          `LEVEL UP! ${merc.name} ist nun Level ${merc.level}!`,
          "success",
        );
      }

      merc.status = "idle";
      this.game.showNotification(`${merc.name} war erfolgreich!`, "success");
    }

    state.guildActiveQuests = state.guildActiveQuests.filter(
      (q) => q.id !== quest.id,
    );
    this.game.speichereSpiel();
    this.renderGuildsContent();
  }

  assignMercenaryToQuest(questId) {
    const state = this.game.gameState;

    if (!this.selectedMercenaryId) {
      this.game.showNotification("Wähle erst einen Söldner aus!", "error");
      return;
    }

    const merc = state.guildMercenaries.find(
      (m) => m.id === this.selectedMercenaryId,
    );
    if (!merc || merc.status !== "idle") {
      this.game.showNotification("Dieser Söldner ist beschäftigt!", "error");
      return;
    }

    const questIndex = state.guildAvailableQuests.findIndex(
      (q) => q.id === questId,
    );
    if (questIndex === -1) return;

    // Quest-Objekt klonen
    const quest = JSON.parse(
      JSON.stringify(state.guildAvailableQuests[questIndex]),
    );

    // --- BONI ANWENDEN (KLASSE + TALENTE) ---
    if (quest.rewards) {
      // 1. ZEIT-BERECHNUNG
      let timeMult = 1.0;
      if (merc.type === "fighter") timeMult *= 0.8; // Basis: Fighter sind 20% schneller
      // Talent-Check (z.B. Berserker oder Eilbote)
      timeMult *= this.getMercenaryTalentBonus(merc, "time");

      const baseDuration = quest.baseDuration || quest.duration;
      quest.duration = Math.floor(baseDuration * timeMult);

      // 2. GILDEN-XP
      let gxpMult = 1.0;
      if (merc.type === "scout") gxpMult = 1.5; // Basis: Scout +50% XP
      // Talent-Check (z.B. Diplomat)
      gxpMult *= this.getMercenaryTalentBonus(merc, "gxp");

      quest.rewards.guildXP = Math.floor(
        (quest.rewards.guildXP || 0) * gxpMult,
      );

      // 3. LOOT (DIAMANTEN & GEMS)
      let lootMult = 1.0;
      if (merc.type === "miner") lootMult = 1.2; // Basis: Miner +20% Loot

      // Spezifische Talent-Checks
      const diaTalent = this.getMercenaryTalentBonus(merc, "diamonds"); // z.B. Tiefengräber
      const gemTalent = this.getMercenaryTalentBonus(merc, "gems"); // z.B. Void-Gräber

      // Berechnung
      if (quest.rewards.diamonds > 0) {
        quest.rewards.diamonds = Math.ceil(
          quest.rewards.diamonds * lootMult * diaTalent,
        );
      }
      if (quest.rewards.gems > 0) {
        quest.rewards.gems = Math.ceil(
          quest.rewards.gems * lootMult * gemTalent,
        );
      }

      // 4. SMILEYS (GOLD) - z.B. durch "Händler"-Talent beim Scout
      const goldTalent = this.getMercenaryTalentBonus(merc, "gold");
      if (goldTalent !== 1.0) {
        quest.rewards.smileys = Math.floor(quest.rewards.smileys * goldTalent);
      }
    }

    // Quest-Metadaten setzen
    quest.assignedMerc = merc.id;
    quest.startTime = Date.now();
    quest.notified = false;

    // Söldner-Status updaten
    merc.status = "busy";
    merc.questId = quest.id;

    // Listen-Management
    if (!state.guildActiveQuests) state.guildActiveQuests = [];
    state.guildActiveQuests.push(quest);
    state.guildAvailableQuests.splice(questIndex, 1);

    this.selectedMercenaryId = null;

    // UI und Speicher
    this.renderGuildsContent();
    this.game.speichereSpiel();
    this.game.showNotification(`⚔️ ${merc.name} ist aufgebrochen!`, "success");
  }

  claimQuest(questId) {
    const state = this.game.gameState;
    const index = state.guildActiveQuests.findIndex((q) => q.id === questId);
    if (index === -1) return;

    const quest = state.guildActiveQuests[index];
    const merc = state.guildMercenaries.find(
      (m) => m.id === quest.assignedMerc,
    );

    // 1. Zeit-Check
    const elapsed = (Date.now() - quest.startTime) / 1000;
    if (elapsed < quest.duration) return;

    // 2. EP Verteilung
    if (merc) {
      merc.xp += quest.rewards.mercXP;
      // Level Up Check für Söldner
      if (merc.xp >= merc.maxXp) {
        merc.level++;
        merc.xp -= merc.maxXp;
        merc.maxXp = Math.floor(merc.maxXp * 1.8);
        this.game.showNotification(
          `${merc.name} ist nun Level ${merc.level}!`,
          "success",
        );
      }
      merc.status = "idle";
      merc.questId = null;
    }

    // Gilden XP hinzufügen
    this.addGuildXP(quest.rewards.guildXP);

    // 3. Währungen auszahlen
    this.game.addSmileys(quest.rewards.smileys);
    state.diamanten += quest.rewards.diamonds;
    state.gems += quest.rewards.gems || 0; // Die neuen Gems!

    // 4. Feedback & Speichern
    this.game.showNotification(
      `Mission abgeschlossen! +${this.game.formatNumber(quest.rewards.smileys)} ☺, +${quest.rewards.diamonds} 💎, +${quest.rewards.gems || 0} ✨`,
      "success",
    );

    state.guildActiveQuests.splice(index, 1);
    this.generateGuildQuests();
    this.renderGuildsContent();
    this.game.updateUI();
    this.game.speichereSpiel();
  }

  // --- STANDARD GILDEN LOGIK (Unverändert) ---
  foundGuild(name) {
    const state = this.game.gameState;
    const COST = 500000000;
    if (state.guildName) return false;
    if (state.aktuelle_smileys < COST) {
      this.game.showNotification("❌ Nicht genug Smileys!", "error");
      return false;
    }
    state.aktuelle_smileys -= COST;
    state.guildName = name || "Smiley Legion";
    // Init Mercenaries falls noch nicht da
    if (!state.guildMercenaries) state.guildMercenaries = [];
    this.game.updateUI();
    this.game.speichereSpiel();
    this.renderGuildsContent();
    return true;
  }

  addGuildXP(amount) {
    if (!this.game.gameState.guildName) return;
    this.game.gameState.guildXP += amount;
    let leveledUp = false;
    while (this.game.gameState.guildXP >= this.game.gameState.guildXPReq) {
      this.game.gameState.guildXP -= this.game.gameState.guildXPReq;
      this.game.gameState.guildLevel++;
      this.game.gameState.guildXPReq = Math.floor(
        this.game.gameState.guildXPReq * 1.5,
      );
      leveledUp = true;
    }
    if (leveledUp) {
      this.game.showNotification(
        `🆙 GILDEN LEVEL UP! Stufe ${this.game.gameState.guildLevel}`,
        "success",
      );
      this.game.applyAllBoni();
    }
    this.renderGuildsContent();
    this.game.speichereSpiel();
  }

  startGuildBoss() {
    if (typeof firebase === "undefined" || !this.game.gameState.guildName)
      return;
    const state = this.game.gameState;
    if (
      state.guildBossFighting ||
      !state.guildName ||
      typeof firebase === "undefined"
    )
      return;

    const safeGuildName = state.guildName.replace(/\s+/g, "_");
    const bossRef = firebase.database().ref(`guilds/${safeGuildName}/boss`);

    const level = state.guildBossLevel || 1;
    const hp = Math.floor(1000000000 * Math.pow(3.0, level - 1));

    // Wir informieren den Server: "Der Bosskampf hat JETZT begonnen!"
    bossRef
      .update({
        hp: hp,
        maxHp: hp,
        level: level,
        isFighting: true,
        startTime: firebase.database.ServerValue.TIMESTAMP,
      })
      .then(() => {
        this.game.showNotification(
          "⚔️ Boss-Raid gestartet! Alle Mann Angriff!",
          "success",
        );
      });

    // Lokaler Timer für das flüssige UI (zählt einfach die Sekunden runter)
    if (this.game.bossInterval) clearInterval(this.game.bossInterval);
    this.game.bossInterval = setInterval(() => {
      if (!state.guildBossFighting) {
        clearInterval(this.game.bossInterval);
        return;
      }

      state.guildBossTimer -= 1;
      const timerDisplay = this.game.getById("boss-timer-display");
      if (timerDisplay)
        timerDisplay.innerText = Math.max(0, state.guildBossTimer) + "s";

      if (state.guildBossTimer <= 0) {
        this.endGuildBoss(false);
      }
    }, 1000);
    this.game.chatSystem.sendGuildSystemMessage(
      `${state.username} hat den Gilden-Boss (Lv. ${level}) herausgefordert! ⚔️`,
    );
  }

  clickGuildBoss(e) {
    if (typeof firebase === "undefined" || !this.game.gameState.guildName)
      return;
    const state = this.game.gameState;
    if (!state.guildBossFighting || !state.guildName) return;

    const bossIcon = document.getElementById("guild-boss-clicker");

    // --- SCHADEN BERECHNEN ---
    let rawClick = this.game.getClickStrength();
    let damage = Math.ceil(rawClick * 0.0001);
    let mercBonus = 0;
    if (state.guildMercenaries) {
      state.guildMercenaries.forEach((merc) => {
        if (merc.status === "idle") mercBonus += merc.level * 0.001 * rawClick;
      });
    }
    damage += mercBonus;
    if (damage < 1) damage = 1;

    let isCrit = false;
    if (state.critChance > 0 && Math.random() < state.critChance) {
      damage *= state.critDamageMult;
      isCrit = true;
    }

    // --- VISUELLE EFFEKTE ---
    if (bossIcon) {
      // Alte Klassen entfernen, um Animation neu zu triggern
      bossIcon.classList.remove("boss-hit-shake", "boss-crit-shake");
      void bossIcon.offsetWidth; // Trigger Reflow
      bossIcon.classList.add(isCrit ? "boss-crit-shake" : "boss-hit-shake");
    }

    // Floating Text (Nutzt Gildenfarben: Gold für Crit, Rot für Normal)
    if (e) {
      this.game.spawnFloatingText(
        e,
        damage,
        isCrit ? "boss-damage crit" : "boss-damage",
      );
    }

    // --- SERVER SYNC ---
    const safeGuildName = state.guildName.replace(/\s+/g, "_");
    const bossHpRef = firebase
      .database()
      .ref(`guilds/${safeGuildName}/boss/hp`);

    bossHpRef
      .transaction((currentHp) => {
        if (currentHp === null) return currentHp;
        const newHp = currentHp - damage;
        return newHp < 0 ? 0 : newHp;
      })
      .then((result) => {
        if (result.committed) {
          const finalHp = result.snapshot.val();
          state.guildBossHP = finalHp;
          this.updateBossUI();
          if (finalHp <= 0) this.endGuildBoss(true);
        }
      });
  }

  endGuildBoss(victory) {
    if (typeof firebase === "undefined" || !this.game.gameState.guildName)
      return;
    const state = this.game.gameState;
    if (!state.guildBossFighting || !state.guildName) return;

    clearInterval(this.game.bossInterval);
    state.guildBossFighting = false;

    const safeGuildName = state.guildName.replace(/\s+/g, "_");
    const bossRef = firebase.database().ref(`guilds/${safeGuildName}/boss`);

    if (victory) {
      const reward = state.guildBossLevel * 10;
      state.diamanten += reward;

      // Dem Server sagen, dass der Boss tot ist, das Level steigt und der Cooldown beginnt
      bossRef.update({
        isFighting: false,
        level: state.guildBossLevel + 1,
        lastDefeatTime: firebase.database.ServerValue.TIMESTAMP,
      });

      this.game.chatSystem.sendGuildSystemMessage(
        `🏆 DER BOSS WURDE BESIEGT! Die Gilde feiert einen glorreichen Sieg!`,
      );
    } else {
      // Dem Server sagen, dass die Zeit um ist
      bossRef.update({
        isFighting: false,
      });
      this.game.chatSystem.sendGuildSystemMessage(
        `💀 Der Boss war zu stark... Wir müssen trainieren und es erneut versuchen.`,
      );
    }

    this.game.updateUI();
    this.renderGuildsContent();
    this.game.speichereSpiel();
  }

  updateBossUI() {
    const hpBar = this.game.getById("boss-hp-bar");
    const hpText = this.game.getById("boss-hp-text");
    const state = this.game.gameState;
    if (hpBar && hpText) {
      const pct = Math.max(0, (state.guildBossHP / state.guildBossMaxHP) * 100);
      hpBar.style.width = `${pct}%`;
      hpText.innerText = `${this.game.formatNumber(state.guildBossHP)} / ${this.game.formatNumber(state.guildBossMaxHP)}`;
    }
  }

  checkBossAlarm() {
    const state = this.game.gameState;
    if (state.guildBossFighting || Notification.permission !== "granted")
      return;

    const now = Date.now();
    const cooldown = 30 * 60 * 1000;
    const nextSpawn = (state.lastBossDefeatTime || 0) + cooldown;
    const timeLeft = nextSpawn - now;

    // 1. Warnung: 5 Minuten vorher
    if (timeLeft <= 300000 && timeLeft > 299000 && !this.bossWarned5Min) {
      this.bossWarned5Min = true;
      new Notification("Gilden-Alarm! 📢", {
        body: "Boss-Raid in 5 Minuten!",
        icon: "smiley.png",
      });
    }

    // 2. Start-Meldung & RESET der Warn-Flags
    if (timeLeft <= 0) {
      if (!this.bossStartNotified) {
        this.bossStartNotified = true;
        new Notification("DER BOSS IST DA! 👹", {
          body: "Angriff möglich!",
          icon: "smiley.png",
        });
      }
    } else {
      // Falls timeLeft > 0 (Boss ist noch im Cooldown),
      // stellen wir sicher, dass das Start-Flag für den nächsten Spawn bereit ist
      this.bossStartNotified = false;
    }
  }
  // --- RENDER LOGIK (Mit Söldner UI) ---

  renderGuildsContent() {
    const container = this.game.getById("guilds-content");
    if (!container) return;
    const state = this.game.gameState;

    // --- KEINE GILDE ---
    if (!state.guildName) {
      const COST = 500000000;
      const canAfford = state.aktuelle_smileys >= COST;

      container.innerHTML = `
                <div style="display:flex; justify-content:flex-end;">
                    <button id="btn-close-guild-empty" style="background:transparent; border:none; color:#fff; font-size:2rem; cursor:pointer;">&times;</button>
                </div>
                <div style="text-align:center; padding:10px 20px 20px 20px;">
                    <div style="font-size:4rem; margin-bottom:10px;">🏰</div>
                    <h3>Gilde Gründen</h3>
                    <p style="color:#aaa;">Erstelle eine Allianz für Bosse, Quests und globale Boni.</p>
                    <div style="margin:20px 0; padding:15px; background:rgba(255,255,255,0.05); border-radius:10px;">
                        <p><strong>Kosten:</strong> <span style="color:#FFD700">${this.game.formatNumber(COST)}</span> Smileys</p>
                    </div>
                    <input type="text" id="guild-name-input" placeholder="Name deiner Gilde" maxlength="20" style="padding:10px; border-radius:5px; border:1px solid #555; background:#222; color:#fff; width:70%; margin-bottom:10px;">
                    <br>
                    <button id="found-guild-button" class="btn-confirm" ${canAfford ? "" : "disabled"} style="width:70%;">Gilde Gründen</button>
                </div>
            `;

      const foundBtn = this.game.getById("found-guild-button");
      if (foundBtn) {
        foundBtn.onclick = () => {
          const input = this.game.getById("guild-name-input");
          const val = input ? input.value : "";
          if (val.length > 2) this.foundGuild(val);
        };
      }
      const closeBtn = this.game.getById("btn-close-guild-empty");
      if (closeBtn)
        closeBtn.onclick = () =>
          (document.getElementById("guilds-modal").style.display = "none");
      return;
    }

    // --- NAVIGATION (MIT FESTEM X-BUTTON) ---
    let tabsHtml = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #444; padding-bottom:15px;">
                <div style="display:flex; gap:10px; flex:1;">
                    <button id="tab-guild-shop" class="btn-primary ${this.guildView === "shop" ? "" : "btn-cancel"}" style="flex:1">Zentrale</button>
                    <button id="tab-guild-boss" class="btn-primary ${this.guildView === "boss" ? "" : "btn-cancel"}" style="flex:1">Boss Raid</button>
                    <button id="tab-guild-quests" class="btn-primary ${this.guildView === "quests" ? "" : "btn-cancel"}" style="flex:1">Söldner</button>
                </div>
                <button id="btn-close-guild-modal" style="background:transparent; border:none; color:#aaa; font-size:2.5rem; cursor:pointer; margin-left:15px; line-height:0.5;">&times;</button>
            </div>
        `;

    let contentHtml = "";

    // ==========================================
    // ANSICHT: ZENTRALE
    // ==========================================
    if (this.guildView === "shop") {
      let upgradesHtml = `
            <div style="margin-bottom:20px;">
                <h4 style="color:#fff; margin-bottom:10px;">Gilden-Projekte</h4>
                <div id="guild-upgrades-list"></div>
            </div>
            `;

      let listHtml = `
                <div style="background:rgba(0,0,0,0.3); border-radius:8px; padding:10px; margin-bottom:20px;">
                    <h4 style="margin:0 0 10px 0; border-bottom:1px solid #444; padding-bottom:5px;">Mitglieder (${state.guildName})</h4>
                    <div id="guild-list-body" class="custom-scrollbar" style="max-height: 150px; overflow-y: auto; display:flex; flex-direction:column; gap:2px; min-height:50px;">
                        <div style="text-align:center; padding:10px; color:#666;">Verbinde mit Gilden-Server... 📡</div>
                    </div>
                </div>
            `;

      const progressPct = Math.min(
        100,
        (state.guildXP / state.guildXPReq) * 100,
      );
      let progressHtml = `
                <div style="margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <strong>Gilden-Level ${state.guildLevel}</strong>
                        <span style="color:#aaa;">${this.game.formatNumber(state.guildXP)} / ${this.game.formatNumber(state.guildXPReq)} XP</span>
                    </div>
                    <div style="background:#222; height:10px; border-radius:5px; overflow:hidden; border:1px solid #444;">
                        <div style="width:${progressPct}%; height:100%; background:#009ffd; transition:width 0.3s;"></div>
                    </div>
                </div>
            `;

      contentHtml = upgradesHtml + listHtml + progressHtml;

      setTimeout(() => {
        if (this.game.chatSystem)
          this.game.chatSystem.startGuildMemberListener();
        this.renderGuildUpgradesList();
      }, 50);
    }

    // ==========================================
    // ANSICHT: BOSS RAID
    // ==========================================
    else if (this.guildView === "boss") {
      const now = Date.now();
      const cooldownTime = 30 * 60 * 1000;
      const nextAvailable = (state.lastBossDefeatTime || 0) + cooldownTime;
      const canFight = now >= nextAvailable;

      if (state.guildBossFighting) {
        const pct = Math.max(
          0,
          (state.guildBossHP / state.guildBossMaxHP) * 100,
        );
        contentHtml = `
                    <div class="boss-arena active" style="text-align:center;">
                        <h3 style="color:#ff5252;">🔥 RAID LÄUFT! 🔥</h3>
                        <div style="font-size:3em; color:#fff; font-weight:bold; margin:10px 0;"><span id="boss-timer-display">${state.guildBossTimer}s</span></div>
                        <div style="background:#222; height:25px; border-radius:15px; overflow:hidden; margin:10px auto; width:80%; border:2px solid #555; position:relative;">
                            <div id="boss-hp-bar" style="width:${pct}%; height:100%; background:linear-gradient(90deg, #d32f2f, #ff5252); transition:width 0.1s linear;"></div>
                            <span id="boss-hp-text" style="position:absolute; width:100%; text-align:center; top:0; line-height:25px; color:#fff; font-size:0.8em;">${this.game.formatNumber(state.guildBossHP)} / ${this.game.formatNumber(state.guildBossMaxHP)}</span>
                        </div>
                        <div id="guild-boss-clicker" style="font-size:100px; cursor:pointer; user-select:none; margin:20px 0;">👹</div>
                    </div>`;
      } else {
        if (canFight) {
          const nextHp = Math.floor(
            5000000 * Math.pow(2.0, state.guildBossLevel - 1),
          );
          contentHtml = `
                        <div class="boss-lobby" style="text-align:center; padding:40px;">
                            <div style="font-size: 80px; margin-bottom:20px;">💀</div>
                            <h3>Gilden-Raid (Stufe ${state.guildBossLevel})</h3>
                            <p>Boss HP: <strong style="color:#ff5252;">${this.game.formatNumber(nextHp)}</strong></p>
                            <button id="start-boss-btn" class="boss-btn-active" style="padding:15px 40px; font-size:1.2em; cursor:pointer;">KAMPF STARTEN</button>
                        </div>`;
        } else {
          const remainingSec = Math.ceil((nextAvailable - now) / 1000);
          const mins = Math.floor(remainingSec / 60);
          const secs = remainingSec % 60;

          contentHtml = `
                        <div class="boss-lobby" style="text-align:center; padding:40px; opacity:0.7;">
                            <div style="font-size: 80px; margin-bottom:20px; filter:grayscale(1);">💤</div>
                            <h3>Boss regeneriert sich...</h3>
                            <p>Nächster Spawn in: <strong id="boss-cooldown-timer" style="color:#009ffd;">${mins}:${secs < 10 ? "0" : ""}${secs}</strong></p>
                        </div>`;
        }
      }
    }

    // ==========================================
    // ANSICHT: SÖLDNER & QUESTS
    // ==========================================
    else if (this.guildView === "quests") {
      if (!state.guildMercenaries) state.guildMercenaries = [];
      this.generateGuildQuests();

      const hasIdleMercs = state.guildMercenaries.some(
        (m) => m.status === "idle",
      );

      // 1. Söldner-Übersicht
      let recruitBtnHtml =
        state.guildMercenaries.length < 5
          ? `<button id="btn-recruit" class="btn-confirm" style="font-size:0.8em; padding:8px 15px;">+ Anheuern (${this.game.formatNumber(1000000000 * (state.guildMercenaries.length + 1))})</button>`
          : "";

      let mercHtml = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h4 style="margin:0;">Deine Kasernen (${state.guildMercenaries.length}/5)</h4>
                    ${recruitBtnHtml}
                </div>
                <div style="display:flex; gap:15px; overflow-x:auto; padding-bottom:10px; margin-bottom:20px;">`;

      state.guildMercenaries.forEach((merc) => {
        const isSelected = this.selectedMercenaryId === merc.id;
        const isBusy = merc.status === "busy";
        const isRecovering = merc.status === "recovering";

        let talentButtonHtml = "";
        if (!merc.talents) merc.talents = { availablePoints: 0, choices: {} };

        if (merc.talents.availablePoints > 0) {
          talentButtonHtml = `
                        <button class="btn-open-talents" data-id="${merc.id}" 
                                style="width:100%; padding:6px; font-size:0.75em; margin:8px 0; background:#e040fb; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; box-shadow: 0 0 10px rgba(224, 64, 251, 0.4); transition: transform 0.1s;">
                            🌟 TALENT WÄHLEN
                        </button>`;
        }

        // Spezialisierungs-Info
        let specIcon = "⚔️";
        let specName = "Fighter";
        let specBonus = "🛡️ -50% Risiko";

        if (merc.type === "miner") {
          specIcon = "⛏️";
          specName = "Miner";
          specBonus = "💎 +50% Beute";
        } else if (merc.type === "scout") {
          specIcon = "🏹";
          specName = "Scout";
          specBonus = "🚩 x2 Gilden-XP";
        }

        let statusText = isBusy ? "Unterwegs" : "Bereit";
        let statusColor = isBusy ? "#ff5252" : "#aaa";
        let statusIcon = isBusy ? "⏳" : "💤";

        if (isRecovering) {
          const remainingMin = Math.ceil(
            ((merc.recoveryUntil || 0) - Date.now()) / 60000,
          );
          statusText =
            remainingMin > 0 ? `Verletzt (${remainingMin}m)` : "Bereit";
          statusColor = remainingMin > 0 ? "#ff4444" : "#aaa";
          statusIcon = remainingMin > 0 ? "🩹" : "💤";
          if (remainingMin <= 0) merc.status = "idle";
        }

        const borderColor = isSelected ? "#009ffd" : "#333";
        const bgColor = isSelected
          ? "rgba(0, 159, 253, 0.1)"
          : "rgba(255,255,255,0.03)";

        mercHtml += `
                    <div class="mercenary-card ${isSelected ? "active-merc" : ""}" data-id="${merc.id}" 
                         style="min-width:140px; background:${bgColor}; border:2px solid ${borderColor}; padding:12px; border-radius:12px; cursor:${!isBusy && !isRecovering ? "pointer" : "default"}; text-align:center; transition: all 0.2s;">
                        <div style="font-size:2.2em; margin-bottom:5px;">${specIcon}</div>
                        <div style="font-weight:bold; font-size:0.9em;">${merc.name}</div>
                        
                        ${talentButtonHtml}

                        <div style="font-size:0.7em; color:#009ffd; font-weight:bold; margin-top:2px;">${specName}</div>
                        <div style="font-size:0.65em; color:#4CAF50; background:rgba(0,0,0,0.3); padding:2px 4px; border-radius:4px; margin-top:4px;">${specBonus}</div>
                        <div style="font-size:0.75rem; color:#FFD700; margin-top:5px;">Lvl ${merc.level}</div>
                        <div style="font-size:0.7em; color:${statusColor}; font-weight:bold; margin-top:3px;">${statusIcon} ${statusText}</div>
                        
                        <div class="xp-bar-outer" style="background:#222; height:10px; margin-top:8px; border-radius:5px; overflow:hidden; border:1px solid #444;">
                            <div style="width:${(merc.xp / (merc.maxXp || 100)) * 100}%; height:100%; background:linear-gradient(90deg, #4CAF50, #8BC34A);"></div>
                        </div>
                    </div>`;
      });
      mercHtml += `</div>`;

      // 2. Aktive Quests
      let activeQuestsHtml = "";
      if (state.guildActiveQuests && state.guildActiveQuests.length > 0) {
        activeQuestsHtml = `<h4 style="margin:0 0 10px 0; color:#009ffd;">Laufende Missionen</h4><div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:15px; margin-bottom:20px;">`;

        state.guildActiveQuests.forEach((q) => {
          const merc = state.guildMercenaries.find(
            (m) => m.id === q.assignedMerc,
          );
          const elapsed = (Date.now() - q.startTime) / 1000;
          const timeLeft = Math.max(0, Math.ceil(q.duration - elapsed));
          const isDone = timeLeft <= 0;
          const progress = Math.min(100, (elapsed / q.duration) * 100);
          const progressColor = isDone ? "#4CAF50" : "#00C897";

          activeQuestsHtml += `
                        <div style="background:rgba(0,0,0,0.4); border:1px solid #333; border-left:4px solid ${progressColor}; padding:15px; border-radius:10px;">
                            <div style="font-weight:bold;">${q.name}</div>
                            <div style="font-size:0.85em; color:#ccc;">Held: <span style="color:#009ffd;">${merc ? merc.name : "???"}</span></div>
                            <div style="background:#1a1a1a; height:8px; margin:8px 0; border-radius:4px; overflow:hidden;">
                                <div id="bar-quest-${q.id}" style="width:${progress}%; height:100%; background:${progressColor}; transition:width 0.5s linear;"></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span id="timer-quest-${q.id}" style="color:${isDone ? "#4CAF50" : "#aaa"}; font-size:0.85em;">
                                    ${isDone ? "✅ Abgeschlossen!" : `⏳ Noch ${timeLeft}s`}
                                </span>
                                ${isDone ? `<button class="btn-confirm btn-claim-quest" data-id="${q.id}">Einsammeln</button>` : ""}
                            </div>
                        </div>`;
        });
        activeQuestsHtml += `</div>`;
      }

      // 3. Verfügbare Quests (Nur anzeigen, wenn Söldner frei sind!)
      let availableQuestsHtml = "";
      if (hasIdleMercs) {
        availableQuestsHtml = `
                    <div style="border-top:1px solid #333; padding-top:20px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <h4 style="margin:0 0 5px 0;">Neue Aufträge (Wähle einen Söldner)</h4>
                            <button id="btn-refresh-quests" style="background:#009ffd; color:#fff; border:none; padding:8px 15px; border-radius:5px; font-weight:bold; cursor:pointer;">
                                🔄 Neue suchen (5 💎)
                            </button>
                        </div>
                        <div class="info-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:15px;">`;

        state.guildAvailableQuests.forEach((q) => {
          let rewardHtml = "";
          if (q.rewards.smileys > 0)
            rewardHtml += `<span style="background:rgba(255,215,0,0.1); color:#FFD700; padding:2px 6px; border-radius:4px; margin-right:5px; display:inline-block; margin-bottom:4px; font-size:0.85em;">${this.game.formatNumber(q.rewards.smileys)} 🪙</span>`;
          if (q.rewards.diamonds > 0)
            rewardHtml += `<span style="background:rgba(0,159,253,0.1); color:#009ffd; padding:2px 6px; border-radius:4px; margin-right:5px; display:inline-block; margin-bottom:4px; font-size:0.85em;">${q.rewards.diamonds} 💎</span>`;
          if (q.rewards.gems > 0)
            rewardHtml += `<span style="background:rgba(224,64,251,0.1); color:#e040fb; padding:2px 6px; border-radius:4px; margin-right:5px; display:inline-block; margin-bottom:4px; font-size:0.85em;">${q.rewards.gems} ✨</span>`;
          rewardHtml += `<span style="background:rgba(76,175,80,0.1); color:#4CAF50; padding:2px 6px; border-radius:4px; margin-right:5px; display:inline-block; margin-bottom:4px; font-size:0.85em;">${q.rewards.mercXP} XP</span>`;

          const canStart = this.selectedMercenaryId !== null;
          const buttonStyle = canStart
            ? `background:#009ffd; color:#fff;`
            : `background:#333; color:#777;`;

          availableQuestsHtml += `
                        <div style="background:rgba(255,255,255,0.03); border:1px solid #333; border-left:4px solid ${q.rarity.color}; padding:15px; border-radius:10px;">
                            <div style="color:${q.rarity.color}; font-weight:bold; font-size:1.1em;">${q.name}</div>
                            <div style="font-size:0.8em; color:#aaa; margin-bottom:10px;">
                                ${q.rarity.name} • 🕒 ${Math.ceil(q.duration / 60)} Min • ⚠️ Risiko: ${Math.round(q.failRisk * 100)}%
                            </div>
                            <div style="margin:10px 0; padding:10px; background:rgba(0,0,0,0.3); border-radius:6px;">
                                <div style="font-size:0.75em; color:#888; margin-bottom:5px; text-transform:uppercase;">Belohnungen:</div>
                                <div>${rewardHtml}</div>
                            </div>
                            <button class="btn-assign-quest" data-id="${q.id}" ${canStart ? "" : "disabled"} 
                                style="${buttonStyle} width:100%; border:none; padding:12px; border-radius:6px; font-weight:bold; cursor:pointer; text-transform:uppercase; font-size:0.9em;">
                                ${canStart ? "🚀 Entsenden" : "Söldner wählen"}
                            </button>
                        </div>`;
        });
        availableQuestsHtml += `</div></div>`;
      } else {
        availableQuestsHtml = `
                    <div style="border-top:1px solid #333; padding-top:20px; text-align:center; color:#888; font-style:italic;">
                        <p>Alle deine Söldner sind beschäftigt oder erholen sich. <br>Neue Aufträge werden angezeigt, sobald jemand bereit ist.</p>
                    </div>
                `;
      }

      container.querySelectorAll(".btn-open-talents").forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation(); // Wichtig: Damit die Karte nicht gleichzeitig ausgewählt wird
          this.openTalentMenu(btn.dataset.id);
        };
      });

      contentHtml = mercHtml + activeQuestsHtml + availableQuestsHtml;
    }

    container.innerHTML = tabsHtml + contentHtml;

    // --- EVENT LISTENERS FÜR BUTTONS ---
    this.game.getById("tab-guild-shop")?.addEventListener("click", () => {
      this.guildView = "shop";
      this.renderGuildsContent();
    });
    this.game.getById("tab-guild-boss")?.addEventListener("click", () => {
      this.guildView = "boss";
      this.renderGuildsContent();
    });
    this.game.getById("tab-guild-quests")?.addEventListener("click", () => {
      this.guildView = "quests";
      this.renderGuildsContent();
    });

    // Das reparierte X-Button Event
    this.game
      .getById("btn-close-guild-modal")
      ?.addEventListener("click", () => {
        const modal = document.getElementById("guilds-modal");
        if (modal) modal.style.display = "none";
      });

    if (this.guildView === "boss") {
      this.game
        .getById("start-boss-btn")
        ?.addEventListener("click", () => this.startGuildBoss());
      const bc = this.game.getById("guild-boss-clicker");
      if (bc) bc.addEventListener("mousedown", (e) => this.clickGuildBoss(e));
    }

    if (this.guildView === "quests") {
      container.querySelectorAll(".mercenary-card").forEach((card) => {
        const mercId = card.dataset.id;
        const merc = state.guildMercenaries.find((m) => m.id === mercId);
        const isLocked =
          merc && (merc.status === "busy" || merc.status === "recovering");

        if (!isLocked) {
          card.onclick = () => {
            this.selectedMercenaryId = mercId;
            this.renderGuildsContent();
          };
        }
      });
      this.game
        .getById("btn-recruit")
        ?.addEventListener("click", () => this.recruitMercenary());
      container
        .querySelectorAll(".btn-assign-quest")
        .forEach(
          (btn) =>
            (btn.onclick = () =>
              this.assignMercenaryToQuest(parseFloat(btn.dataset.id))),
        );
      container
        .querySelectorAll(".btn-claim-quest")
        .forEach(
          (btn) =>
            (btn.onclick = () => this.claimQuest(parseFloat(btn.dataset.id))),
        );

      container.querySelectorAll(".btn-open-talents").forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation(); // Verhindert, dass man den Söldner nur "auswählt"
          this.openTalentMenu(btn.dataset.id);
        };
      });

      const refreshBtn = this.game.getById("btn-refresh-quests");
      if (refreshBtn) {
        refreshBtn.onclick = () => {
          if ((state.diamanten || 0) >= 5) {
            state.diamanten -= 5;
            state.guildAvailableQuests = [];
            this.generateGuildQuests(true);
            this.game.speichereSpiel();
            this.renderGuildsContent();
            this.game.showNotification(
              "Neue Aufträge eingetroffen!",
              "success",
            );
          } else {
            this.game.showNotification(
              "Nicht genug Diamanten für einen Refresh!",
              "error",
            );
          }
        };
      }
    }
  }

  toggleNotifications() {
    if (!("Notification" in window)) {
      this.game.showNotification(
        "Dein Browser unterstützt keine Desktop-Notis.",
        "error",
      );
      return;
    }

    // Abfrage der Berechtigung
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        this.game.showNotification("Gilden-Funk aktiviert! 🔔", "success");
        // Test-Notiz senden
        new Notification("Smiley Game", {
          body: "Gilden-Funk bereit! Ich melde mich, wenn Quests fertig sind.",
          icon: "smiley.png",
        });
      } else {
        this.game.showNotification("Berechtigung verweigert.", "error");
      }
      // UI aktualisieren, damit der Button-Text von "Deaktiviert" auf "Aktiviert" springt
      this.renderGuildsContent();
    });
  }

  donateToProject(projectId, amount) {
    if (typeof firebase === "undefined" || !this.game.gameState.guildName)
      return;
    const state = this.game.gameState;

    if ((state.aktuelle_smileys || 0) < amount) {
      this.game.showNotification("Nicht genug Smileys zum Spenden!", "error");
      return;
    }

    if (!state.guildName || typeof firebase === "undefined") return;

    if (amount >= 1000000000) {
      this.game.chatSystem.sendGuildSystemMessage(
        `💰 Großzügige Spende: ${state.username} hat ${this.game.formatNumber(amount)} Smileys investiert!`,
      );
    }

    state.aktuelle_smileys -= amount;
    this.game.speichereSpiel();

    const safeGuildName = state.guildName.replace(/\s+/g, "_");
    const projectRef = firebase
      .database()
      .ref(`guilds/${safeGuildName}/upgrades/${projectId}`);

    projectRef
      .transaction((currentData) => {
        let data = currentData || { level: 0, invested: 0 };
        if (typeof data === "number") data = { level: data, invested: 0 };

        data.invested += amount;

        const def = this.upgradeDefinitions[projectId];
        let cost = Math.floor(
          def.baseCost * Math.pow(def.costFactor, data.level),
        );

        while (data.invested >= cost) {
          data.invested -= cost;
          data.level += 1;
          cost = Math.floor(
            def.baseCost * Math.pow(def.costFactor, data.level),
          );
        }

        return data;
      })
      .then((result) => {
        if (result.committed) {
          this.game.showNotification("Spende erfolgreich!", "success");

          // --- NEU: SPENDE DEM SPIELER GUTSCHREIBEN ---
          const memberRef = firebase
            .database()
            .ref(`guilds/${safeGuildName}/members/${state.playerId}/donated`);
          // Wir nutzen wieder eine Transaction, um den Wert einfach hochzuzählen
          memberRef.transaction((current) => (current || 0) + amount);

          if (this.guildView === "shop" && this.renderGuildsContent)
            this.renderGuildsContent();
        }
      })
      .catch((err) => {
        console.error("Fehler beim Spenden:", err);
        state.aktuelle_smileys += amount;
        this.game.speichereSpiel();
        this.game.showNotification(
          "Netzwerkfehler: Smileys zurückerstattet.",
          "error",
        );
      });
  }

  renderGuildUpgradesList() {
    const container = document.getElementById("guild-upgrades-list");
    if (!container) return;

    container.innerHTML = "";
    const state = this.game.gameState;
    const serverData = state.guildServerUpgrades || {};

    Object.keys(this.upgradeDefinitions).forEach((key) => {
      const def = this.upgradeDefinitions[key];

      // Neue Struktur lesen (oder Standardwerte setzen)
      const projectData = serverData[key] || { level: 0, invested: 0 };
      const currentLevel =
        typeof projectData === "object" ? projectData.level || 0 : projectData;
      const invested =
        typeof projectData === "object" ? projectData.invested || 0 : 0;

      // Kosten berechnen
      const cost = Math.floor(
        def.baseCost * Math.pow(def.costFactor, currentLevel),
      );
      const remaining = Math.max(0, cost - invested);
      const progressPct = Math.min(100, (invested / cost) * 100);

      const div = document.createElement("div");
      div.className = "guild-upgrade-card";
      div.style.cssText =
        "background:rgba(0,0,0,0.4); border:1px solid #444; border-radius:8px; padding:15px; margin-bottom:15px;";

      div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div>
                        <div style="font-weight:bold; color:#fff; font-size:1.1em;">${def.icon} ${def.name} <span style="color:#FFD700; font-size:0.8em;">(Lv. ${currentLevel})</span></div>
                        <div style="font-size:0.85em; color:#aaa; margin-top:3px;">${def.desc}</div>
                        <div style="font-size:0.8em; color:#009ffd; margin-top:3px;">Aktueller Bonus: +${Math.round(currentLevel * def.bonusPerLevel * 100)}%</div>
                    </div>
                </div>
                
                <div style="margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.8em; color:#ddd; margin-bottom:5px;">
                        <span>Spenden: ${this.game.formatNumber(invested)}</span>
                        <span>Ziel: ${this.game.formatNumber(cost)}</span>
                    </div>
                    <div style="background:#222; height:12px; border-radius:6px; overflow:hidden; border:1px solid #444; position:relative;">
                        <div style="width:${progressPct}%; height:100%; background:linear-gradient(90deg, #4CAF50, #8BC34A); transition:width 0.3s;"></div>
                    </div>
                </div>
                
                <div style="display:flex; gap:10px;">
                    <button class="btn-donate-project" data-key="${key}" data-type="10" style="flex:1; background:#333; color:#fff; border:1px solid #555; padding:8px; border-radius:5px; cursor:pointer;">
                        10% Spenden
                    </button>
                    <button class="btn-donate-project" data-key="${key}" data-type="max" style="flex:1; background:#009ffd; color:#fff; border:none; padding:8px; border-radius:5px; cursor:pointer; font-weight:bold;">
                        Maximal Spenden
                    </button>
                </div>
            `;

      // Klick-Events für die Spenden-Buttons
      div.querySelectorAll(".btn-donate-project").forEach((btn) => {
        btn.onclick = () => {
          const type = btn.dataset.type;
          let amountToDonate = 0;

          if (type === "10") {
            amountToDonate = Math.floor((state.aktuelle_smileys || 0) * 0.1);
          } else if (type === "max") {
            // Max Spende = Entweder alles was ich habe, oder nur so viel wie noch zum Level-Up fehlt
            amountToDonate = Math.floor(
              Math.min(state.aktuelle_smileys || 0, remaining),
            );
          }

          if (amountToDonate > 0) {
            this.donateToProject(key, amountToDonate);
          } else {
            this.game.showNotification("Nicht genug Smileys!", "error");
          }
        };
      });

      container.appendChild(div);
    });
  }

  listenToGuildData() {
    const state = this.game.gameState;
    if (typeof firebase === "undefined" || !state.guildName) return;

    const safeGuildName = state.guildName.replace(/\s+/g, "_");
    const guildRef = firebase.database().ref(`guilds/${safeGuildName}`);

    console.log(`📡 Lausche auf Gilden-Daten für: ${safeGuildName}`);

    guildRef.on("value", (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        this.currentGuildBank = 0;
      } else {
        this.currentGuildBank = data.bank || 0;
        this.game.gameState.guildServerUpgrades = data.upgrades || {};

        // --- NEU: BOSS-DATEN VOM SERVER ÜBERNEHMEN ---
        if (data.boss) {
          state.guildBossHP = data.boss.hp || 0;
          state.guildBossMaxHP = data.boss.maxHp || 1000;
          state.guildBossLevel = data.boss.level || 1;
          state.guildBossFighting = data.boss.isFighting || false;
          state.lastBossDefeatTime = data.boss.lastDefeatTime || 0;

          // Schlauer Timer: Wir berechnen die Restzeit anhand der Startzeit.
          // Das verhindert, dass jeder Spieler jede Sekunde den Timer in der Datenbank überschreiben muss (Datenstau).
          if (data.boss.isFighting && data.boss.startTime) {
            const elapsedSeconds = Math.floor(
              (Date.now() - data.boss.startTime) / 1000,
            );
            state.guildBossTimer = Math.max(0, 30 - elapsedSeconds);
          }
        }
      }

      const display = document.getElementById("guild-bank-display");
      if (display) {
        display.innerText =
          this.game.formatNumber(this.currentGuildBank) + " Smileys";
      }

      this.game.applyAllBoni();
      this.game.updateUI();

      // WICHTIG: Das UI muss sich auch aktualisieren, wenn wir im Boss-Tab sind!
      if (this.guildView === "shop" || this.guildView === "boss") {
        this.renderGuildsContent();
      }
    });
  }

  buyGuildUpgrade(upgradeKey) {
    if (typeof firebase === "undefined" || !this.game.gameState.guildName)
      return;
    const state = this.game.gameState;
    if (!state.guildName || typeof firebase === "undefined") return;

    const safeGuildName = state.guildName.replace(/\s+/g, "_");
    const guildRef = firebase.database().ref(`guilds/${safeGuildName}`);

    guildRef.transaction(
      (currentData) => {
        if (currentData) {
          const def = this.upgradeDefinitions[upgradeKey];
          const currentLevel =
            (currentData.upgrades && currentData.upgrades[upgradeKey]) || 0;
          const cost = Math.floor(
            def.baseCost * Math.pow(def.costFactor, currentLevel),
          );

          if ((currentData.bank || 0) >= cost) {
            currentData.bank -= cost;
            if (!currentData.upgrades) currentData.upgrades = {};
            currentData.upgrades[upgradeKey] = currentLevel + 1;
          } else {
            return; // Abbruch, kein Geld (race condition protection)
          }
        }
        return currentData;
      },
      (error, committed, snapshot) => {
        if (committed) {
          this.game.showNotification("Gilden-Upgrade gekauft! 🎉", "success");
          // Sound abspielen
          this.game.playLevelUpSound();
        } else {
          this.game.showNotification(
            "Kauf fehlgeschlagen (Zu wenig Geld?)",
            "error",
          );
        }
      },
    );
  }

  getMercenaryTalentBonus(merc, type) {
    if (!merc.talents || !merc.talents.choices) return 1.0;

    let totalMult = 1.0;
    // Wir gehen durch alle gewählten Talente (z.B. choices: { level5: 'berserker' })
    Object.entries(merc.talents.choices).forEach(([lvlKey, talentId]) => {
      const levelOptions = MERCENARY_TALENTS[merc.type][lvlKey];
      const choice = levelOptions.find((t) => t.id === talentId);

      // Wenn der gesuchte Typ (z.B. 'time') übereinstimmt, Bonus addieren/multiplizieren
      if (choice && choice.type === type) {
        // Bei Zeit und Risiko nutzen wir Multiplikation, bei Gold/XP Addition
        if (type === "time" || type === "risk") totalMult *= choice.value;
        else totalMult += choice.value - 1;
      }
    });
    return totalMult;
  }
  openTalentMenu(mercId) {
    const merc = this.game.gameState.guildMercenaries.find(
      (m) => m.id === mercId,
    );
    if (!merc || !merc.talents || merc.talents.availablePoints <= 0) return;

    // Welches Level-Paket ist als nächstes dran?
    // Wenn choices.level5 fehlt, zeige level5, sonst level10 etc.
    let targetLevelKey = "level5";
    if (merc.talents.choices.level5) targetLevelKey = "level10";
    // Erweitere dies, wenn du mehr Level hast!

    const options = MERCENARY_TALENTS[merc.type][targetLevelKey];
    if (!options) {
      this.game.showNotification(
        "Keine weiteren Talente auf dieser Stufe!",
        "info",
      );
      return;
    }

    const modal = document.getElementById("merc-talent-modal");
    const container = document.getElementById("talent-options-container");
    const title = document.getElementById("talent-modal-title");
    const desc = document.getElementById("talent-modal-desc");

    title.innerText = `${merc.name}: Stufe ${targetLevelKey.replace("level", "")}`;
    desc.innerText = `Wähle eine Spezialisierung. Diese Wahl ist permanent!`;
    container.innerHTML = "";

    options.forEach((opt) => {
      const card = document.createElement("div");
      card.className = "info-upgrade-item";
      card.style.cssText =
        "cursor:pointer; text-align:center; border: 1px solid #444; transition: transform 0.2s;";
      card.innerHTML = `
                <div style="font-size:3em; margin-bottom:10px;">${opt.icon}</div>
                <div style="font-weight:bold; color:#fff;">${opt.name}</div>
                <div style="font-size:0.8em; color:#aaa; margin:10px 0;">${opt.desc}</div>
                <button class="btn-confirm" style="width:100%; font-size:0.7em;">WÄHLEN</button>
            `;

      card.onclick = () => {
        this.selectTalent(mercId, targetLevelKey, opt.id);
        modal.style.display = "none";
      };
      container.appendChild(card);
    });

    modal.style.display = "flex";
  }

  selectTalent(mercId, levelKey, talentId) {
    const merc = this.game.gameState.guildMercenaries.find(
      (m) => m.id === mercId,
    );
    if (!merc) return;

    // Wahl speichern
    merc.talents.choices[levelKey] = talentId;
    merc.talents.availablePoints--;
    merc.talents.spentPoints++;

    this.game.showNotification("✨ Talent freigeschaltet!", "success");
    this.game.playLevelUpSound();
    this.game.speichereSpiel();
    this.renderGuildsContent();
  }
}
