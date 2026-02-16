// ================================================================================================================
// === SmileyGame.js: Hauptspielklasse (Final & Friendly Version) ===
// ================================================================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // Sicherheits-Check
    if (window.gameInstance) {
        console.log("Spiel läuft bereits.");
        return;
    }

    console.log("Starte SmileyGame...");

    // 👇 KORREKTUR: Nur EINMAL 'new' aufrufen und direkt global speichern!
    window.gameInstance = new SmileyGame();

    console.log("✅ SmileyGame gestartet und global als 'gameInstance' verfügbar!");
});

class SmileyGame {
    // ================================================================================================================
    // 0. KLASSE & CONSTRUCTOR
    // ================================================================================================================

    constructor() {
        // 1. PRESTIGE UPGRADES DEFINITION
        this.prestigeUpgrades = prestigeUpgrades; // Importierte Prestige-Upgrades aus data.js
        this.artifactsData = artifactsData; // Importierte Artefakte aus data.js

        this.currentBuyAmount = 1;
        this.mineSystem = new DiamondMine(this);
        this.guildSystem = new GuildSystem(this);
        this.chatSystem = new ChatSystem(this);
        this.petSystem = new PetSystem(this);
        this.soundSystem = new SoundSystem(this);
        this.gemSystem = new GemEmpire(this);
        this.skinSystem = new SkinSystem(this);
        this.selectedBuyAmount = 1;
    
        // 2. GAME STATE DEFINITION
        this.gameState = {
            aktuelle_smileys: 0,
            lifetime_smileys: 0,
            diamanten: 0,
            gems: 0,
            playerName: "Smiley_Gast", // Standard-Placeholder
            playerId: null,
            prestige_punkte_verfügbar: 0,
            gesamt_prestige_punkte: 0,
            prestigeResets: 0,
            klickKraft: 2,
            klickKraftMultiplier: 1,
            globalerPrestigeMultiplikator: 1,
            // Arrays werden basierend auf den Daten in data.js initialisiert
            buildingCounts: [...buildingsData, ...uniqueBuildingsData].map(() => 0),
            buildingPrices: [...buildingsData.map(item => item.basePrice), ...uniqueBuildingsData.map(item => item.basePrice)],
            researchStatus: globalUpgrades.map(() => false),
            prestigeUpgradeStatus: this.prestigeUpgrades.map(() => false),
            petLevels: {},
            activePet: null,
            totalSPS: 0,
            globalSPSMultiplier: 1,
            prestigePointMultiplier: 0.01,
            prestigeResetBonus: 0,
            critChance: 0,
            critDamageMult: 1,
            diamondMineBoost: 0,
            globalCostReduction: 0,
            clickSPSRatio: 0,
            godModeMultiplier: 1,
            mineGrid: [],
            mineDepth: 1,
            mineInventory: { pickaxe: 50, tnt: 2, drill: 1 },
            fossilien: 0,
            mineResearch: { durable_picks: 0, explosive_yield: 0, fossil_scanner: 0 },
            selectedTool: 'pickaxe',
            isTreasureRoom: false,
            diamondShopPurchases: [],
            diamondMineUnlocked: false,
            petsUnlocked: false,
            guildsUnlocked: false,
            petAutoClickTimer: 0,
            achievementsUnlocked: achievementsData.map(() => false),
            totalClicksLifetime: 0,
            guildName: null,
            guildLevel: 1,
            guildXP: 0,
            guildXPReq: 1000,
            guildSPSMultiplier: 0,
            guildCostReduction: 0,
            guildPrestigeBonus: 0,
            guildGlobalMultiplier: 1,
            lastBossDefeatTime: 0,
            guildBossLevel: 1,
            guildBossHP: 1000,
            guildBossMaxHP: 1000,
            guildBossFighting: false,
            guildBossTimer: 0,
            guildAvailableQuests: [],
            guildActiveQuests: [],
            activeBuffs: { spsMultiplier: 1, costMultiplier: 1, timerSPS: 0, timerCost: 0 },
            skills: {
                frenzy: { active: false, cooldown: false, duration: 15000, cooldownTime: 120000, color: '#ff4d4d' },
                overdrive: { active: false, cooldown: false, duration: 30000, cooldownTime: 300000, color: '#009ffd' },
                critStorm: { active: false, cooldown: false, duration: 10000, cooldownTime: 180000, color: '#ffcc00' },
                goldRush: { active: false, cooldown: false, duration: 1000, cooldownTime: 600000, color: '#4CAF50' },
                diamondPulse: { active: false, cooldown: false, duration: 20000, cooldownTime: 420000, color: '#b9f2ff' },
                efficiency: { active: false, cooldown: false, duration: 45000, cooldownTime: 600000, color: '#a0a0a0' },
                shards: { active: false, cooldown: false, duration: 20000, cooldownTime: 240000, color: '#e066ff' },
                hyperMinute: { active: false, cooldown: false, duration: 60000, cooldownTime: 900000, color: '#ff8c00' }
            }
        };

        this.productionInterval = null;
        this.uiInterval = null;
        this.saveInterval = null;

        // 3. UI EVENT LISTENERS (GLOBAL)
        this.setupSettingsModalListeners();
        
        // Chat Toggle Logik (direkt im Constructor, da es UI-Grundgerüst ist)
        const chatToggleBtn = document.getElementById('btn-chat-toggle');
        if (chatToggleBtn) {
            chatToggleBtn.onclick = () => {
                const container = document.getElementById('main-chat-container');
                if (container) {
                    container.classList.toggle('chat-minimized');
                    chatToggleBtn.innerText = container.classList.contains('chat-minimized') ? '➕' : '➖';
                }
            };
        }

        // 4. INITIALISIERUNG STARTEN
        this.init();
    }

    init() {
        // 1. Spielstand laden (Gebäude, Smileys, etc.)
        this.ladeSpiel();

        // =========================================================
        // 🛡️ ANTI-SPAM ID SYSTEM (Geräte-Bindung)
        // =========================================================
        // Wir suchen eine ID, die den "Reset" überlebt hat (im LocalStorage, nicht im SaveGame)
        let storedId = localStorage.getItem('smiley_device_id');

        if (!storedId) {
            // Fall A: Spieler ist wirklich komplett neu auf diesem Gerät
            storedId = 'uid_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
            localStorage.setItem('smiley_device_id', storedId);
            console.log("🆕 Neue Geräte-ID erstellt & gespeichert:", storedId);
        } else {
            // Fall B: Spieler war schon mal da -> Wir nutzen die alte ID wieder!
            console.log("📱 Bekanntes Gerät erkannt. ID wiederhergestellt:", storedId);
        }

        // WICHTIG: Wir überschreiben die ID im GameState mit der festen Geräte-ID.
        // So bleibt man in der Gilde, auch wenn man den Spielstand resettet.
        this.gameState.playerId = storedId;
        // =========================================================

        // Fallback für Namen
        if (this.gameState.playerName === "Smiley_Gast") {
            this.gameState.playerName = "Smiley_" + Math.floor(Math.random() * 9999);
        }

        // Mine Reparieren falls nötig
        if (this.gameState.mineGrid && this.gameState.mineGrid.length > 0) {
            if (this.gameState.mineGrid[0].content === undefined) {
                console.log("🛠️ Repariere kaputte Mine (Loot fehlt)...");
                this.mineSystem.generateMineGrid(); 
            }
        }

        this.clickSound = document.getElementById('click-sound');
    
        const storedSfx = localStorage.getItem('soundVolume');
        if (storedSfx !== null) this.sfxVolume = parseInt(storedSfx) / 100;

        this.checkOfflineProgress();
        this.createBuildingElements();
        this.renderPetShop(); // Neue Pet-System Weiterleitung
        this.renderSkillUI();
        this.updateGlobalUpgradeUI();
        this.updatePrestigeUI();
        this.ladeAudioEinstellungen();

        const musicPlayer = this.getById('background-music');
        if (musicPlayer) {
            musicPlayer.play().catch(e => console.log("Musik wartet:", e));
        }

        this.restoreCooldowns();
        this.checkSkillUnlocks();
        this.setupMainEventListeners();
        this.setupHotkeys();
        this.setupPrestigeEventListeners();
        this.setupInfoPageEventListeners();
        this.setupSkillTreeControls();
        this.startIntervals();
        this.setupTooltips();
        this.updatePetInterval(); // Neue Pet-System Weiterleitung
        this.updateNewsTicker();
        this.updateUI();
        this.guildSystem.listenToGuildData();
        
        // Chat starten (Firebase)
        this.initChat();

        console.log("✅ Spiel initialisiert. PlayerID:", this.gameState.playerId);
    }

    // ================================================================================================================
    // 1. SPIELKONTROLLE & INTERVALLE
    // ================================================================================================================

    startIntervals() {
    // 1. Der Haupt-Loop für SPS (jede Sekunde)
    setInterval(() => {
        this.addSmileys(this.gameState.totalSPS);

        // --- AUTO-HACKEN REGENERATION ---
        const inv = this.gameState.mineInventory;
        const maxPicks = 50; 
        
        if (!this.pickaxeTimer) this.pickaxeTimer = 0;
        this.pickaxeTimer++;
        
        if (this.pickaxeTimer >= 5) { 
            if (inv.pickaxe < maxPicks) {
                inv.pickaxe++;
                const qEl = document.getElementById('qty-pickaxe');
                if(qEl) qEl.innerText = inv.pickaxe;
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
        const ticker = this.getById('news-ticker-text');
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
        const pointsBonus = 1 + (points * prestigeEffects.pointEfficiency);
        const resets = this.gameState.prestigeResets || 0;
        const resetBonus = 1 + (resets * 0.01);

        // Global Multiplier enthält jetzt ALLES (siehe applyAllBoni)
        this.gameState.globalerPrestigeMultiplikator = 
            prestigeEffects.spsMultiplier * pointsBonus * resetBonus * this.gameState.globalSPSMultiplier * (1 + (this.gameState.guildSPSMultiplier || 0));

        this.gameState.totalSPS = baseSPS * this.gameState.globalerPrestigeMultiplikator;

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
            const buildingSPS = (item.baseSPS || 0) * (this.gameState.buildingCounts[index] || 0) * (item.prestigeMulti || 1);
            baseSPS += buildingSPS;
        });
        return baseSPS;
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
    
    speichereSpiel() {
        try {
            this.gameState.lastSaveTime = Date.now();
            const allData = {
                gameState: this.gameState
            };
            const jsonString = JSON.stringify(allData);
            const encodedData = btoa(jsonString);
            localStorage.setItem('smileyGameSave', encodedData);
        } catch (e) {
            console.error("Fehler beim Speichern des Spiels:", e);
        }
        this.syncGuildStats();
    }

    saveGame(returnOnly = false) {
        let source = this.gameState;

        const saveData = {
            // --- Basis Währungen ---
            aktuelle_smileys: source.aktuelle_smileys || 0,
            lifetime_smileys: source.lifetime_smileys || 0,
            diamanten: source.diamanten || 0,
            totalClicksLifetime: source.totalClicksLifetime || 0,
            playerName: source.playerName || "Smiley_Gast",

            // --- Gebäude & Upgrades ---
            buildingCounts: source.buildingCounts || [],
            researchStatus: source.researchStatus || [],

            // --- Prestige System ---
            prestigeResets: source.prestigeResets || 0,
            prestige_punkte_verfügbar: source.prestige_punkte_verfügbar || 0,
            gesamt_prestige_punkte: source.gesamt_prestige_punkte || 0,
            prestigeUpgradeStatus: source.prestigeUpgradeStatus || [],

            // --- Features & Fortschritt ---
            achievementsUnlocked: source.achievementsUnlocked || [],
            petsUnlocked: source.petsUnlocked || false,
            petLevels: source.petLevels || {},
            activePet: source.activePet || null,
            unlockedSkins: source.unlockedSkins || ['default'],
            activeSkin: source.activeSkin || 'default',

            // --- Gilden System (WICHTIG: Söldner speichern!) ---
            guildsUnlocked: source.guildsUnlocked || false,
            guildName: source.guildName || null,
            guildLevel: source.guildLevel || 1,
            guildXP: source.guildXP || 0,
            guildUpgradeStatus: source.guildUpgradeStatus || [],
            guildBossLevel: source.guildBossLevel || 1,
            
            // Neu: Söldner & Quests sichern
            guildMercenaries: source.guildMercenaries || [],
            guildActiveQuests: source.guildActiveQuests || [],

            // --- Mine & Labor ---
            diamondMineUnlocked: source.diamondMineUnlocked || false,
            diamondShopPurchases: source.diamondShopPurchases || {},
            mineDepth: source.mineDepth || 1,
            mineGrid: source.mineGrid || [],
            mineInventory: source.mineInventory || { pickaxe: 50, tnt: 2, drill: 1 },
            isTreasureRoom: source.isTreasureRoom || false,
            fossilien: source.fossilien || 0,
            mineResearch: source.mineResearch || { durable_picks: 0, fossil_scanner: 0, explosive_yield: 0 },

            // Zeitstempel
            lastSaveTime: Date.now()
        };

        if (returnOnly) return saveData;

        try {
            const jsonString = JSON.stringify(saveData);
            // Wir speichern es einmal als Base64 (Schutz) und einmal als Backup
            const encodedData = btoa(jsonString);
            localStorage.setItem('smileyGameSave', encodedData);
            
            console.log("💾 Spiel erfolgreich gespeichert.");
        } catch (e) {
            console.error("❌ Fehler beim Speichern:", e);
            this.showNotification("Fehler beim Speichern!", "error");
        }
    }

    ladeSpiel() {
        let savedString = localStorage.getItem('smileyGameSave');
        
        // Wenn kein Save da ist, starte neues Spiel
        if (!savedString) {
            console.log("🆕 Kein Spielstand gefunden, starte neues Spiel.");
            return;
        }

        // FIX: Entferne Anführungszeichen, falls der String doppelt stringified wurde
        if (savedString.startsWith('"') && savedString.endsWith('"')) {
            savedString = savedString.slice(1, -1);
        }

        let parsedData = null;

        // VERSUCH 1: Base64 Decodierung (Neuer Standard)
        try {
            // Prüfen, ob es Base64 ist (keine geschweiften Klammern am Anfang)
            if (!savedString.trim().startsWith('{')) {
                const decoded = atob(savedString);
                parsedData = JSON.parse(decoded);
                console.log("💾 Spielstand geladen (Base64 Mode)");
            }
        } catch (e) {
            console.warn("⚠️ Base64 Dekodierung fehlgeschlagen, versuche Legacy-Modus...", e);
        }

        // VERSUCH 2: Legacy JSON (Falls es einfacher Text ist)
        if (!parsedData) {
            try {
                parsedData = JSON.parse(savedString);
                console.log("💾 Spielstand geladen (Legacy JSON Mode)");
            } catch (e) {
                console.error("❌ Savegame komplett korrupt.");
            }
        }

        // DATEN ANWENDEN
        if (parsedData) {
            // Wenn in den Daten ein 'gameState' Objekt steckt (alte Struktur), nimm das
            const dataToLoad = parsedData.gameState || parsedData;
            this.loadGame(dataToLoad);
        } else {
            console.error("⚠️ Spielstand konnte nicht gelesen werden. Starte neu.");
            // Backup des kaputten Saves erstellen (für Analyse)
            localStorage.setItem('smileyGameSave_CORRUPT', savedString);
            localStorage.removeItem('smileyGameSave');
            this.showNotification("Spielstand war defekt. Backup erstellt & Neustart.", "error");
        }
    }

    // Diese Funktion verteilt die Daten wieder in die Variablen
    // Diese Funktion verteilt die Daten wieder in die Variablen
    // Bereich: 2. SPEICHERUNG & HILFSFUNKTIONEN (ca. Zeile 418)
    loadGame(saveData) {
        if (!saveData) return;

        let target = this.gameState;

        // --- Basis Werte (Mit Fallback auf 0 falls NaN/Undefined) ---
        target.aktuelle_smileys = Number(saveData.aktuelle_smileys) || 0;
        target.lifetime_smileys = Number(saveData.lifetime_smileys) || 0;
        target.diamanten = Number(saveData.diamanten) || 0;
        target.totalClicksLifetime = Number(saveData.totalClicksLifetime) || 0;
        target.playerName = saveData.playerName || target.playerName;

        // --- Arrays & Objekte wiederherstellen ---
        // Wichtig: Wir prüfen, ob die Länge stimmt, sonst nehmen wir den Default
        if (Array.isArray(saveData.buildingCounts)) target.buildingCounts = saveData.buildingCounts;
        if (Array.isArray(saveData.researchStatus)) target.researchStatus = saveData.researchStatus;
        if (Array.isArray(saveData.prestigeUpgradeStatus)) target.prestigeUpgradeStatus = saveData.prestigeUpgradeStatus;
        if (Array.isArray(saveData.achievementsUnlocked)) target.achievementsUnlocked = saveData.achievementsUnlocked;
        
        // Prestige
        target.prestigeResets = Number(saveData.prestigeResets) || 0;
        target.prestige_punkte_verfügbar = Number(saveData.prestige_punkte_verfügbar) || 0;
        target.gesamt_prestige_punkte = Number(saveData.gesamt_prestige_punkte) || 0;

        // Features
        target.petsUnlocked = !!saveData.petsUnlocked;
        target.petLevels = saveData.petLevels || {};
        target.activePet = saveData.activePet || null;

        // --- GILDE & SÖLDNER (MIGRATION) ---
        target.guildsUnlocked = !!saveData.guildsUnlocked;
        target.guildName = saveData.guildName || null;
        target.guildLevel = Number(saveData.guildLevel) || 1;
        target.guildXP = Number(saveData.guildXP) || 0;
        target.guildUpgradeStatus = saveData.guildUpgradeStatus || [];
        target.guildBossLevel = Number(saveData.guildBossLevel) || 1;

        // FIX: Wenn Söldner im Save fehlen (altes Savegame), initialisiere leeres Array!
        if (saveData.guildMercenaries && Array.isArray(saveData.guildMercenaries)) {
            target.guildMercenaries = saveData.guildMercenaries;
        } else {
            // Migration: Falls man schon eine Gilde hat, schenken wir einen Start-Söldner
            target.guildMercenaries = [];
            if (target.guildName) {
                target.guildMercenaries.push({
                    id: 'merc_starter', name: 'Ragnar (Gratis)', level: 1, xp: 0, maxXp: 100, type: 'fighter', status: 'idle', questId: null
                });
            }
        }
        
        // Quests laden oder resetten
        target.guildActiveQuests = Array.isArray(saveData.guildActiveQuests) ? saveData.guildActiveQuests : [];
        // Available Quests werden eh neu generiert, brauchen wir nicht zwingend laden, aber sicher ist sicher
        
        // --- MINE (MIGRATION) ---
        target.diamondMineUnlocked = !!saveData.diamondMineUnlocked;
        target.mineDepth = Number(saveData.mineDepth) || 1;
        target.mineGrid = Array.isArray(saveData.mineGrid) ? saveData.mineGrid : [];
        target.mineInventory = saveData.mineInventory || { pickaxe: 50, tnt: 2, drill: 1 };
        target.fossilien = Number(saveData.fossilien) || 0;
        target.collectedArtifacts = Array.isArray(saveData.collectedArtifacts) ? saveData.collectedArtifacts : []; 
        target.mineResearch = saveData.mineResearch || { durable_picks: 0, fossil_scanner: 0, explosive_yield: 0 };
        target.diamondShopPurchases = saveData.diamondShopPurchases || {};

        // Mine reparieren falls leer
        if (target.diamondMineUnlocked && target.mineGrid.length === 0) {
            console.log("🛠️ Mine war leer nach Laden -> Regeneriere...");
            // Wird im Init gemacht, da 'this.mineSystem' hier evtl noch nicht ready ist
        }

        target.unlockedSkins = Array.isArray(saveData.unlockedSkins) ? saveData.unlockedSkins : ['default'];
        target.activeSkin = saveData.activeSkin || 'default';

        // Skin sofort anwenden
        this.skinSystem.updateSmileyAppearance()

        console.log("📥 Daten erfolgreich in GameState übernommen.");
        this.updateUI();
    }

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
            earned *= (1 + this.gameState.gemOfflineBonus);
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
            const timeDisplay = document.getElementById('offline-time-display');
            const earnDisplay = document.getElementById('offline-earnings-display');
            const modal = document.getElementById('offline-modal');
            const btn = document.getElementById('close-offline-modal');

            if (timeDisplay) timeDisplay.innerText = timeString;
            if (earnDisplay) earnDisplay.innerText = "+" + this.formatNumber(earned);

            // 3. Modal öffnen
            if (modal) {
                modal.style.display = 'flex';
                
                // Sound abspielen (optional, falls du einen hast)
                if(this.playBuySound) this.playBuySound();
            }

            // 4. Button Logik (Schließen)
            if (btn) {
                // removeEventListener verhindert, dass der Button mehrere Events sammelt
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                newBtn.addEventListener('click', () => {
                    if (modal) modal.style.display = 'none';
                    this.showNotification("💰 Willkommens-Bonus eingesammelt!", "success");
                });
            }
        }
    }

    formatNumber(num) {
        if (typeof num !== 'number' || isNaN(num)) return '0';
        if (num < 1000) return Math.floor(num).toString();
        const suffixes = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "De"];
        let i = 0;
        while (num >= 1000 && i < suffixes.length) {
            num /= 1000;
            i++;
        }
        return num.toFixed(2) + (i > 0 ? suffixes[i - 1] : '');
    }

    addSmileys(menge) {
        if (!menge || menge <= 0) return;
        this.gameState.aktuelle_smileys += menge;
        if (!this.gameState.lifetime_smileys) this.gameState.lifetime_smileys = 0;
        this.gameState.lifetime_smileys += menge;
    }

    getById(id) {
        return document.getElementById(id);
    }

    calculateNextCost(basePrice, count, growthRate, buildingIndex = -1) {
        let price = Math.floor(basePrice * Math.pow(growthRate, count));
        let costReduction = 0;

        prestigeUpgrades.forEach(upg => {
            if (upg.type === 'building_cost_reduction' && this.gameState.prestigeUpgradeStatus[upg.id]) {
                if (!upg.buildingIndices || upg.buildingIndices.includes(buildingIndex)) {
                    costReduction += upg.value;
                }
            }
        });

        const activePetIndex = petsData.findIndex(pet => pet.effectType === 'cost_reduction_buildings' && this.gameState.activePet === pet.id);
        if (activePetIndex !== -1) {
            const pet = petsData[activePetIndex];
            const petLevel = this.gameState.petLevels[activePetIndex];
            const petStats = this.calculatePetStat(pet, petLevel);
            costReduction += petStats.currentEffect;
        }

        if (costReduction > 0) {
            price *= (1 - costReduction);
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
            const pet = petsData.find(p => p.id === this.gameState.activePet);
            if (pet && pet.effectType === 'cost_reduction_upgrades') {
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

    calculatePetStat(pet, currentLevel) {
        this.petSystem.calculatePetStat(pet, currentLevel);
    }

    calculatePrestigeEffects() {
        let effects = {
            spsMultiplier: 1.0,
            clickMultiplier: 1.0,
            costReduction: 0.0,
            pointEfficiency: 0.10,
            petsUnlocked: false,
            mineUnlocked: false,
            guildsUnlocked: false,
            critChanceBonus: 0.0,
            offlineBoost: 1.0,
            buildingSynergy: 0.0
        };

        prestigeUpgrades.forEach(upgrade => {
            if (this.gameState.prestigeUpgradeStatus[upgrade.id]) {
                switch (upgrade.type) {
                    case 'sps_mult': effects.spsMultiplier *= (1 + upgrade.value); break;
                    case 'click_mult': effects.clickMultiplier *= (1 + upgrade.value); break;
                    case 'cost_reduction': effects.costReduction += upgrade.value; break;
                    case 'prestige_efficiency': effects.pointEfficiency += upgrade.value; break;
                    case 'unlock_pets': effects.petsUnlocked = true; break;
                    case 'unlock_mine': effects.mineUnlocked = true; break;
                    case 'unlock_guilds': effects.guildsUnlocked = true; break;
                    case 'global_mult':
                        effects.spsMultiplier *= (1 + upgrade.value);
                        effects.clickMultiplier *= (1 + upgrade.value);
                        break;
                    case 'crit_chance': effects.critChanceBonus += upgrade.value; break;
                    case 'offline_boost': effects.offlineBoost += upgrade.value; break;
                    case 'building_synergy': effects.buildingSynergy += upgrade.value; break;
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
        buildingsData.forEach(b => { b.prestigeMulti = 1; });

        // 2. Globale Upgrades (Research) anwenden
        this.gameState.researchStatus.forEach((bought, index) => {
            if (bought) {
                const upgrade = globalUpgrades[index];
                if (upgrade) {
                    switch (upgrade.type) {
                        case 'click_mult': 
                            prestigeClickMultiplier += upgrade.value; 
                            break;
                        case 'sps_mult': 
                            // WICHTIG: Unterscheidung zwischen Global und Einzel-Gebäude
                            if (upgrade.buildingIndex !== undefined && upgrade.buildingIndex >= 0) {
                                // Nur für ein bestimmtes Gebäude (z.B. Smiley Baum)
                                if (buildingsData[upgrade.buildingIndex]) {
                                    buildingsData[upgrade.buildingIndex].prestigeMulti *= (1 + upgrade.value);
                                }
                            } else {
                                // Gilt für ALLE (Global)
                                this.gameState.globalSPSMultiplier += upgrade.value; 
                            }
                            break;
                        case 'cost_reduction_global':
                        case 'cost_reduction_buildings': 
                            this.gameState.globalCostReduction += upgrade.value;
                            break;
                        case 'global_god_mode':
                            this.gameState.godModeMultiplier *= (1 + upgrade.value);
                            break;
                    }
                }
            }
        });

        // 3. Prestige Upgrades (Unlocks prüfen)
        this.gameState.prestigeUpgradeStatus.forEach((bought, id) => {
            if (bought) {
                const upgrade = prestigeUpgrades.find(u => u.id === id);
                if (upgrade) {
                    switch (upgrade.type) {
                        case 'unlock_pets': this.gameState.petsUnlocked = true; break;
                        case 'unlock_mine': this.gameState.diamondMineUnlocked = true; break;
                        case 'unlock_guilds': this.gameState.guildsUnlocked = true; break;
                    }
                }
            }
        });

        // 4. Aktives Pet berechnen
        if (this.gameState.activePet) {
            const pet = petsData.find(p => p.id === this.gameState.activePet);
            if (pet) {
                const currentLevel = this.gameState.petLevels[pet.id] || 0;
                if (currentLevel > 0) {
                    const stats = this.calculatePetStat(pet, currentLevel);
                    const scaledEffect = stats.currentEffect;
                    switch (pet.effectType) {
                        case 'click_mult': prestigeClickMultiplier += scaledEffect; break;
                        case 'sps_mult': this.gameState.globalSPSMultiplier += scaledEffect; break;
                        case 'prestige_point_eff': this.gameState.prestigePointMultiplier += scaledEffect; break;
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

        diamondShopUpgrades.forEach(upgrade => {
            const count = this.gameState.diamondShopPurchases[upgrade.id] || 0;
            if (count > 0) {
                switch(upgrade.type) {
                    case 'click_mult_static': diamondStaticClick *= (upgrade.value * count); break;
                    case 'sps_mult_static': diamondStaticSPS += (upgrade.value * count); break;
                    case 'prestige_point_eff': this.gameState.prestigePointMultiplier += (upgrade.value * count); break;
                    case 'auto_diamond_mine': this.gameState.autoDiamondMineUnlocked = true; break;
                    case 'crit_chance': this.gameState.critChance += (upgrade.value * count); break;
                    case 'crit_damage': this.gameState.critDamageMult += (upgrade.value * count); break;
                    case 'mine_boost': this.gameState.diamondMineBoost += (upgrade.value * count); break;
                    case 'cost_reduction_global': this.gameState.globalCostReduction += (upgrade.value * count); break;
                    case 'click_sps_link': this.gameState.clickSPSRatio += (upgrade.value * count); break;
                    case 'global_god_mode': this.gameState.godModeMultiplier *= (1 + upgrade.value); break;
                }
            }
        });

        // Diamanten-Boni anwenden
        prestigeClickMultiplier += (diamondStaticClick - 1);
        this.gameState.globalSPSMultiplier *= diamondStaticSPS;
        this.gameState.globalSPSMultiplier *= this.gameState.godModeMultiplier;

        // 7. Gilden Boni (NEU: Basierend auf Gilden-Level!)
        this.gameState.guildCostReduction = 0;
        this.gameState.guildPrestigeBonus = 0;
        this.gameState.guildGlobalMultiplier = 1;
        this.gameState.guildSPSMultiplier = 0;

        const gLevel = this.gameState.guildLevel || 1;

        // Automatische Boni pro Level
        if (gLevel >= 2) this.gameState.guildSPSMultiplier += 0.10;      // Lv 2: +10% SPS
        if (gLevel >= 3) prestigeClickMultiplier += 0.10;                // Lv 3: +10% Klick
        if (gLevel >= 5) this.gameState.guildCostReduction += 0.05;      // Lv 5: -5% Kosten
        if (gLevel >= 7) this.gameState.guildPrestigeBonus += 0.10;      // Lv 7: +10% Prestige Punkte
        if (gLevel >= 10) this.gameState.guildGlobalMultiplier *= 2.0;   // Lv 10: VERDOPPELUNG (x2)
        if (gLevel >= 15) this.gameState.guildSPSMultiplier += 0.50;     // Lv 15: +50% SPS
        if (gLevel >= 20) this.gameState.guildGlobalMultiplier *= 5.0;   // Lv 20: x5 Global!

        // Gilden-Effekte final verrechnen
        this.gameState.prestigePointMultiplier += this.gameState.guildPrestigeBonus;
        this.gameState.globalSPSMultiplier *= this.gameState.guildGlobalMultiplier;

        // 8. Achievements Boni
        achievementsData.forEach((achievement, index) => {
            if (this.gameState.achievementsUnlocked[index]) {
                const bonus = achievement.bonus;
                switch (bonus.type) {
                    case 'sps_mult': this.gameState.globalSPSMultiplier += bonus.value; break;
                    case 'click_mult': prestigeClickMultiplier += bonus.value; break;
                    case 'prestige_efficiency': this.gameState.prestigePointMultiplier += bonus.value; break;
                    case 'global_mult':
                        this.gameState.globalSPSMultiplier += bonus.value;
                        prestigeClickMultiplier += bonus.value;
                        break;
                    case 'cost_reduction_global':
                        this.gameState.globalCostReduction += bonus.value;
                        break;
                    // 👇 DAS HIER IST NEU 👇
                    case 'mine_boost':
                        this.gameState.diamondMineBoost += bonus.value;
                        break;
                }
            }
        });

        // 8.5 Artefakt Boni (NEU - WICHTIG FÜR DAS MUSEUM)
        this.gameState.artifactMineCostRed = 0; // Spezieller Stat für Mine
        
        // Sicherstellen, dass das Array existiert
        if (this.gameState.collectedArtifacts && this.artifactsData) {
             this.gameState.collectedArtifacts.forEach(artId => {
                const art = this.artifactsData.find(a => a.id === artId);
                if (art) {
                    switch (art.bonusType) {
                        case 'sps_mult': this.gameState.globalSPSMultiplier += art.value; break;
                        case 'click_mult': prestigeClickMultiplier += art.value; break;
                        case 'prestige_efficiency': this.gameState.prestigePointMultiplier += art.value; break;
                        case 'mine_cost': this.gameState.artifactMineCostRed += art.value; break;
                        case 'offline_boost': 
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
        const getGuildLvl = (key) => typeof gUpgrades[key] === 'object' ? (gUpgrades[key].level || 0) : (gUpgrades[key] || 0);

        // Synergie-Netzwerk: +1% SPS pro Level
        this.gameState.guildSPSMultiplier += (getGuildLvl('guild_sps') * 0.01); 

        // Schwarm-Intelligenz: +2% Klick-Stärke pro Level
        prestigeClickMultiplier += (getGuildLvl('guild_click') * 0.02);
        // --- 8.7 GEM KONZERN BONI (Final Balanced) ---
        const gemUps = this.gameState.gemUpgrades || {};
        
        // 1. Rabatt-Karte (-2% Kosten pro Level)
        if (gemUps['gem_discount']) {
            this.gameState.globalCostReduction += (gemUps['gem_discount'] * 0.02);
        }

        // 2. Prestige-Magnet (+5% Prestige Punkte pro Level) -> VORHER 10%
        if (gemUps['gem_prestige']) {
            this.gameState.prestigePointMultiplier += (gemUps['gem_prestige'] * 0.05);
        }

        // 3. Gewinn-Verdoppler (x2 Global, Max 1 Level)
        if (gemUps['gem_double']) {
            // Da Max Level = 1 ist, einfach * 2 rechnen
            const doubleMulti = 2; 
            this.gameState.globalSPSMultiplier *= doubleMulti;
            prestigeClickMultiplier += (doubleMulti - 1); 
        }

        // 4. Offline Bonus (Zeit-Dehner)
        this.gameState.gemOfflineBonus = (gemUps['gem_offline'] || 0) * 0.10; 
        
        // 5. Gieriger Blick (Mine) - Bereits beim Kauf angewendet, aber hier zur Sicherheit für Neuberechnung
        // Hinweis: diamondMineBoost wird oft beim Laden gesetzt, daher addieren wir hier nur den dynamischen Teil,
        // oder wir verlassen uns auf den Wert im State. Besser ist es, den Wert hier sauber neu zu berechnen:
        this.gameState.diamondMineBoost = 0; // Reset Basis
        if (gemUps['gem_greed']) {
            this.gameState.diamondMineBoost += (gemUps['gem_greed'] * 0.05);
        }
        
        // 6. Schicksals-Politur (Crit) - Reset und Neu
        this.gameState.critChance = 0 + (prestigeTreeEffects.critChanceBonus || 0); // Basis aus Tree
        if (gemUps['gem_luck']) {
            this.gameState.critChance += (gemUps['gem_luck'] * 0.01);
        }

        // 9. Finale Berechnung
        this.gameState.klickKraftMultiplier = baseClickMultiplier + prestigeClickMultiplier;

        const prestigeBonus = 1 + (this.gameState.gesamt_prestige_punkte * this.gameState.prestigePointMultiplier);
        const resetBonus = 1 + (this.gameState.prestigeResets * this.gameState.prestigeResetBonus);
        
        // WICHTIG: Hier wird jetzt ALLES zusammengeführt
        // Global SPS * Gilden SPS * Prestige Punkte * Resets * Skill-Tree (Urknall etc.)
        this.gameState.globalerPrestigeMultiplikator = 
            prestigeBonus * resetBonus * this.gameState.globalSPSMultiplier * (1 + this.gameState.guildSPSMultiplier) * prestigeTreeEffects.spsMultiplier;
    }

    spawnFloatingText(event, amount, type = 'normal') {
        let x = event ? event.clientX : window.innerWidth / 2;
        let y = event ? event.clientY : window.innerHeight / 2;
        const randomX = (Math.random() - 0.5) * 40;
        const randomY = (Math.random() - 0.5) * 40;
        const el = document.createElement('div');
        el.className = `floating-text ${type}`;
        if (type === 'boss-damage') {
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
        
        el.classList.remove('shake-effect');
        el.classList.remove('boss-hit-effect');
        void el.offsetWidth; 

        if (elementId === 'guilds-content') { 
            el.classList.add('boss-hit-effect');
        } else {
            el.classList.add('shake-effect');
        }

        setTimeout(() => {
            if(el) {
                el.classList.remove('shake-effect');
                el.classList.remove('boss-hit-effect');
            }
        }, 300);
    }

    triggerBigBang() {
        const overlay = this.getById('big-bang-overlay');
        if (!overlay) return;

        // 1. Sound (falls vorhanden)
        if (typeof this.playLevelUpSound === 'function') {
             this.playLevelUpSound(); 
        }

        // 2. Visueller Flash (CSS Klasse hinzufügen)
        overlay.classList.add('flash-bang');
        
        // 3. Heftiges Wackeln
        document.body.classList.add('shake-effect');
        
        // 4. Dramatische Nachrichten
        setTimeout(() => {
            this.showNotification("🌌 DAS UNIVERSUM WIRD NEU GESCHRIEBEN...", "success");
        }, 200);

        setTimeout(() => {
            this.showNotification("🚀 PRODUKTION VERVIELFACHT!", "success");
            // Shake beenden
            document.body.classList.remove('shake-effect');
        }, 2000);

        // 5. Aufräumen (Klasse entfernen für nächsten Reset)
        setTimeout(() => {
            overlay.classList.remove('flash-bang');
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
        if (this.gameState.prestigeUpgradeStatus && this.gameState.prestigeUpgradeStatus[15]) comboGain = 1.5;
        
        // Check: Global Upgrade IDs (aus data.js)
        if (this.gameState.researchStatus && this.gameState.researchStatus[110]) comboTime = 4000; 
        if (this.gameState.researchStatus && this.gameState.researchStatus[111]) maxCombo = 5.0;

        // Check: Prestige ID 17 (Ewige Combo) -> +2 Sek Zeitfenster
        if (this.gameState.prestigeUpgradeStatus && this.gameState.prestigeUpgradeStatus[17]) comboTime += 2000;

        this.comboCount += comboGain;
        this.comboMulti = Math.min(maxCombo, 1 + (Math.sqrt(this.comboCount) * 0.15));

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
        if (this.gameState.prestigeUpgradeStatus && this.gameState.prestigeUpgradeStatus[5]) {
            baseClick += (this.gameState.totalSPS * 0.01);
        }

        let damage = baseClick * this.comboMulti;
        let isCrit = false;

        // Crit Check
        if (this.gameState.skills && this.gameState.skills.critStorm && this.gameState.skills.critStorm.active) {
            isCrit = true;
            damage *= this.gameState.critDamageMult;
        } else if (this.gameState.critChance > 0 && Math.random() < this.gameState.critChance) {
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
                this.spawnFloatingText("+1 👾", 'glitch');
            }
            this.showNotification("SYSTEM GLITCH! Corrupted Smiley gefunden.", "success");
        }
        // ====================================================

        // --- 4. ANIMATIONEN & EFFEKTE ---
        if (e) {
            this.animateSmiley();
            this.createClickParticles(e); 
            let text = this.formatNumber(damage);
            this.showClickEffect(e, text, isCrit ? 'crit' : 'normal');
            if (isCrit) this.triggerShake('smiley_button');
        }
        
        this.checkAchievements();
        this.updateUI();
    }

    // 👇 NEUE METHODE UNTER klickeSmiley EINFÜGEN:
    createClickParticles(e) {
        // Deine Branding-Farben: Rot (#6b0504), Hellblau (#009ffd), Dunkelblau (#011638)
        const colors = ['#6b0504', '#009ffd', '#011638', '#ffffff']; 
        const particleCount = 6; // Anzahl der Teilchen pro Klick

        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'click-particle';
            
            // Zufälliges Icon (Punkt, kleiner Smiley oder Stern)
            const icons = ['•', '😊', '✨'];
            p.innerText = icons[Math.floor(Math.random() * icons.length)];
            
            // Zufällige Flugrichtung berechnen
            const angle = Math.random() * Math.PI * 2;
            const dist = 40 + Math.random() * 80;
            const tx = (Math.cos(angle) * dist) + "px";
            const ty = (Math.sin(angle) * dist) + "px";
            
            // CSS Variablen setzen
            p.style.setProperty('--tw-x', tx);
            p.style.setProperty('--tw-y', ty);
            
            // Startposition am Mauszeiger
            p.style.left = e.clientX + 'px';
            p.style.top = e.clientY + 'px';
            p.style.color = colors[Math.floor(Math.random() * colors.length)];
            
            document.body.appendChild(p);
            
            // Nach der Animation löschen
            setTimeout(() => p.remove(), 800);
        }
    }

    getClickStrength() {
        let strength = this.gameState.klickKraft * this.gameState.klickKraftMultiplier;
        const prestigeEffects = this.calculatePrestigeEffects();
        
        if (prestigeEffects) {
            strength *= prestigeEffects.clickMultiplier;
        }
        if (this.gameState.globalerPrestigeMultiplikator > 1) {
            strength *= this.gameState.globalerPrestigeMultiplikator;
        }
        
        strength *= this.gameState.godModeMultiplier;
        
        // --- SKILL BOOSTS FÜR KLICKS ---
        if (this.gameState.skills && this.gameState.skills.frenzy.active){
            strength *= 5;
        }
        
        if (this.gameState.skills && this.gameState.skills.shards.active) {
            strength += (this.gameState.totalSPS * 0.2);
        }

        if (this.gameState.clickSPSRatio > 0) {
            strength += (this.gameState.totalSPS * this.gameState.clickSPSRatio);
        }

        // --- NEU: Hype-Train (Building Synergy) ---
        // ID 17: Je mehr Gebäude, desto stärker der Klick
        if (prestigeEffects.buildingSynergy > 0) {
            const totalBuildings = this.gameState.buildingCounts.reduce((a, b) => a + b, 0);
            const synergyMult = 1 + (totalBuildings * prestigeEffects.buildingSynergy);
            strength *= synergyMult;
        }
        
        return Math.floor(strength);
    }

    kaufeMehrereGebaeude(index, amount) {
        let item;
        let isUnique = index === DIAMOND_MINE_INDEX;
        if (isUnique) {
            item = uniqueBuildingsData.find(u => (index === DIAMOND_MINE_INDEX && u.id === 'diamond_mine'));
        } else {
            item = buildingsData[index];
        }
        if (!item || (isUnique && this.gameState.buildingCounts[index] >= item.maxCount)) return;

        let totalCost = 0;
        const anzahl = isUnique ? 1 : amount;
        for (let i = 0; i < anzahl; i++) {
            totalCost += Math.ceil(this.calculateNextCost(item.basePrice, this.gameState.buildingCounts[index] + i, item.growthRate, index));
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
            '👆', // 0: Auto-Klicker
            '🌳', // 1: Smiley-Baum
            '🏭', // 2: Smiley-Fabrik
            '⛏️', // 3: Smiley-Mine (Die normale für Smileys)
            '🔩', // 4: Smiley-Bohrer
            '⚛️', // 5: Smiley-Kernkraftwerk
            '🌌', // 6: Smiley-Galaxie
            '🌀', // 7: Dimensionsportal
            '⏳', // 8: Zeitmaschine
            '🦾', // 9: Meta-Klicker
            '🔗', // 10: Quanten-Netzwerk
            '💾', // 11: Endloser Speicher
            '🥚', // 12: Ursprung
            '☯️', // 13: Kosmische Einheit
            '👑'  // 14: Absoluter Schöpfer
        ];
        return icons[index] || '❓';
    }

    getBuildingCost(index, count) {
        const buildingData = [...buildingsData, ...uniqueBuildingsData][index];
        if (!buildingData) return Infinity;
        const currentCount = count !== undefined ? count : this.gameState.buildingCounts[index];
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
                if (upgrade.type === 'cost_reduction_buildings' && upgrade.buildingIndex === buildingIndex) {
                    multiplier *= (1 - upgrade.value);
                }
            }
        });
        if (this.gameState.activePet) {
            const pet = petsData.find(p => p.id === this.gameState.activePet && p.effectType === 'cost_reduction_buildings');
            if (pet) {
                const currentLevel = this.gameState.petLevels[pet.id] || 0;
                if (currentLevel > 0) {
                    const stats = this.calculatePetStat(pet, currentLevel);
                    multiplier *= (1 - stats.currentEffect);
                }
            }
        }
        if (this.gameState.globalCostReduction > 0) {
            multiplier *= (1 - this.gameState.globalCostReduction);
        }
        if (this.gameState.guildCostReduction > 0) {
            multiplier *= (1 - this.gameState.guildCostReduction);
        }
        if (this.gameState.skills.efficiency.active){
            multiplier *= 0.75;
        }

        multiplier *= this.gameState.activeBuffs.costMultiplier;

        return multiplier;
    }

    updateGlobalUpgradeUI() {
        const container = this.getById('global-upgrades-container');
        if (!container) return;
        container.innerHTML = '';

        // Wir sammeln alle noch nicht gekauften Upgrades
        const upgradesToRender = [];

        globalUpgrades.forEach(upgrade => {
            // Prüfen, ob das Upgrade noch NICHT gekauft wurde
            if (!this.gameState.researchStatus[upgrade.id]) {
                const bIndex = upgrade.buildingIndex;
                
                // Logik: Anzeigen wenn global (-1/undefined) ODER wenn man das Gebäude besitzt
                const isGlobal = (bIndex === undefined || bIndex === -1);
                const hasBuilding = bIndex >= 0 && (this.gameState.buildingCounts[bIndex] > 0);

                if (isGlobal || hasBuilding) {
                    upgradesToRender.push(upgrade);
                }
            }
        });

        // Wenn gar nichts da ist
        if (upgradesToRender.length === 0) {
            container.innerHTML = '<div style="padding:20px; color:#888; text-align:center;">Alle Upgrades erforscht!</div>';
            return;
        }

        // Nur die ersten 5 anzeigen
        upgradesToRender.slice(0, 5).forEach(upgrade => {
            const finalCost = this.getGlobalUpgradeCost(upgrade);
            const canAfford = this.gameState.aktuelle_smileys >= finalCost;

            const div = document.createElement('div');
            div.className = `research-item ${canAfford ? 'affordable' : ''}`;
            
            div.innerHTML = `
                <div class="research-content">
                    <div class="research-title-row">
                        <span class="research-name">✨ ${upgrade.name || 'Upgrade'}</span>
                    </div>
                    <div class="research-desc">${upgrade.description}</div>
                </div>
                <div class="research-action">
                    <span class="research-cost" style="color: ${canAfford ? '#4CAF50' : '#ff5252'};">
                        ${this.formatNumber(finalCost)}
                    </span>
                    <button class="btn-buy-research" ${canAfford ? '' : 'disabled'}>
                        Kaufen
                    </button>
                </div>
            `;
            
            // WICHTIG: Klick-Event hier anhängen!
            const btn = div.querySelector('.btn-buy-research');
            if (btn) {
                btn.onclick = () => this.kaufeGlobalUpgrade(upgrade.id);
            }

            container.appendChild(div);
        });
    }

    kaufeGlobalUpgrade(id) {
        const upgrade = globalUpgrades.find(u => u.id === id);
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
            this.showNotification(`✅ Upgrade gekauft: ${upgrade.name || 'Upgrade'}`, 'success');
        } else {
            this.showNotification("❌ Nicht genug Smileys!", 'error');
        }
    }

    kaufePrestigeUpgrade(id) {
        const upgrade = prestigeUpgrades.find(u => u.id === id);
        if (!upgrade) return;
        const requirementsMet = upgrade.requirements.every(reqId => this.gameState.prestigeUpgradeStatus[reqId]);
        if (this.gameState.prestigeUpgradeStatus[id] || this.gameState.prestige_punkte_verfügbar < upgrade.cost || !requirementsMet) return;

        this.gameState.prestige_punkte_verfügbar -= upgrade.cost;
        this.gameState.prestigeUpgradeStatus[id] = true;
        this.applyAllBoni();
        this.updatePrestigeUI();
        if (document.querySelector('.main-layout')) {
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
                const parentIndex = this.prestigeUpgrades.findIndex(u => u.id === parentId);
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
        const requirementsMet = reqs.every(parentId => {
             const parentIndex = this.prestigeUpgrades.findIndex(u => u.id === parentId);
             return this.gameState.prestigeUpgradeStatus[parentIndex];
        });

        if (!requirementsMet && reqs.length > 0) {
            this.showNotification("🔒 Du musst erst das vorherige Upgrade kaufen!", "error");
            return;
        }

        if ((this.gameState.prestige_punkte_verfügbar || 0) >= upgrade.cost) {
            // 1. Bezahlen
            this.gameState.prestige_punkte_verfügbar -= upgrade.cost;
            
            // 2. Status setzen
            const upgradeIndex = this.prestigeUpgrades.findIndex(u => u.id === upgrade.id);
            if(upgradeIndex !== -1) {
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
        const prestigePointThreshold = 100000;
        const totalPotentialPoints = Math.floor(Math.pow(this.gameState.gesammelte_smileys / prestigePointThreshold, 1 / 3));
        const pointsToGain = Math.max(0, totalPotentialPoints - this.gameState.gesamt_prestige_punkte);

        if (pointsToGain <= 0) return;

        if (!confirm(`Bist du sicher? Du erhältst ${pointsToGain} Prestige-Punkte.`)) return;

        this.gameState.aktuelle_smileys = 0;
        this.gameState.gesammelte_smileys = 0;
        this.gameState.klickKraft = 1;
        this.gameState.totalSPS = 0;
        this.gameState.forschungPunkte = 0;
        this.gameState.prestige_punkte_verfügbar += pointsToGain;
        this.gameState.gesamt_prestige_punkte += pointsToGain;
        this.gameState.prestigeResets += 1;
        this.gameState.buildingCounts = [...buildingsData, ...uniqueBuildingsData].map(() => 0);
        this.gameState.buildingPrices = [...buildingsData.map(item => item.basePrice), ...uniqueBuildingsData.map(item => item.basePrice)];

        this.applyAllBoni();
        this.speichereSpiel();
        if (document.querySelector('.prestige-main')) {
            this.updatePrestigeUI();
        }
    }

    resetPrestigeUpgrades() {
        let refundedPoints = 0;
        this.gameState.prestigeUpgradeStatus.forEach((bought, id) => {
            if (bought) {
                const upgrade = prestigeUpgrades.find(u => u.id === id);
                if (upgrade) refundedPoints += upgrade.cost;
            }
        });

        if (refundedPoints > 0) {
            if (!confirm("Punkte zurücksetzen? Du erhältst alle Punkte zurück.")) return;
            this.gameState.activePet = null;
            this.gameState.prestige_punkte_verfügbar += refundedPoints;
            this.gameState.prestigeUpgradeStatus.fill(false);
            this.applyAllBoni();
            this.updatePrestigeUI();
            this.speichereSpiel();
        }
    }

    buyDiamondShopUpgrade(id) {
        const upgrade = diamondShopUpgrades.find(u => u.id === id);
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
        this.renderDiamondMineContent();
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
                case 'building_count': 
                    if (this.gameState.buildingCounts[req.target] >= req.value) isMet = true; 
                    break;
                case 'total_clicks': 
                    if (this.gameState.totalClicksLifetime >= req.value) isMet = true; 
                    break;
                case 'lifetime_smileys': 
                    if (this.gameState.lifetime_smileys >= req.value) isMet = true; 
                    break;
                
                // --- FORTSCHRITT ---
                case 'sps_reach': 
                    if (this.gameState.totalSPS >= req.value) isMet = true;
                    break;
                case 'total_buildings': // NEU: Summe aller Gebäude
                    const total = this.gameState.buildingCounts.reduce((a, b) => a + b, 0);
                    if (total >= req.value) isMet = true;
                    break;

                // --- PRESTIGE & DIAMANTEN ---
                case 'prestige_count': 
                    if (this.gameState.prestigeResets >= req.value) isMet = true; 
                    break;
                case 'prestige_points_held': // NEU: Punkte auf der Hand
                    if (this.gameState.prestige_punkte_verfügbar >= req.value) isMet = true;
                    break;
                case 'diamond_count': 
                    if (this.gameState.diamanten >= req.value) isMet = true; 
                    break;
                
                // --- GILDE ---
                case 'guild_joined': 
                    if (this.gameState.guildName !== null) isMet = true; 
                    break;
                case 'guild_level': 
                    if (this.gameState.guildLevel >= req.value) isMet = true; 
                    break;

                // --- STATS ---
                case 'crit_chance_reach': // NEU: Kritische Chance
                    if (this.gameState.critChance >= req.value) isMet = true;
                    break;
                // --- GEHEIMNISSE (NEU) ---
                case 'artifact_count': 
                    if (this.gameState.collectedArtifacts && this.gameState.collectedArtifacts.length >= req.value) isMet = true; 
                    break;
                case 'blackmarket_purchases':
                    let gemUpsCount = 0;
                    if (this.gameState.gemUpgrades) {
                        gemUpsCount = Object.values(this.gameState.gemUpgrades).reduce((a, b) => a + b, 0);
                    }
                    if (gemUpsCount >= req.value) isMet = true;
                    break;

                // --- SÖLDNER (NEU) ---
                case 'mercenary_count':
                    if (this.gameState.guildMercenaries && this.gameState.guildMercenaries.length >= req.value) isMet = true;
                    break;
                case 'mercenary_level':
                    if (this.gameState.guildMercenaries && this.gameState.guildMercenaries.some(m => m.level >= req.value)) isMet = true;
                    break;
            }

            if (isMet) {
                this.gameState.achievementsUnlocked[index] = true;
                this.showNotification(`🏆 ERFOLG: ${achievement.name}`, 'success');
                this.triggerShake('show_achievements_button');
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
        this.mineSystem.renderDiamondMinigame(targetContainer);
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
        const container = targetContainer || document.getElementById('museum_grid');
        
        if (!container) {
            console.error("❌ Museum-Container nicht gefunden!");
            return;
        }
        
        // 2. Sicherheits-Check: Gibt es die Liste der gesammelten Items überhaupt?
        // Falls nicht (neues Spiel), erstellen wir sie leer, damit kein Fehler kommt.
        if (!this.gameState.collectedArtifacts) {
            this.gameState.collectedArtifacts = [];
        }

        container.innerHTML = '';
        
        // Grid-Styling sicherstellen (falls CSS fehlt)
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
        container.style.gap = '15px';
        container.style.padding = '10px';

        // Header Text
        const header = document.createElement('div');
        header.style.gridColumn = '1 / -1';
        header.style.textAlign = 'center';
        header.style.color = '#aaa';
        header.style.marginBottom = '10px';
        header.style.background = 'rgba(255,255,255,0.05)';
        header.style.padding = '10px';
        header.style.borderRadius = '8px';
        header.innerHTML = '<p>Sammle Artefakte in der Mine, um globale Boni freizuschalten.</p>';
        container.appendChild(header);

        // 3. Karten rendern
        this.artifactsData.forEach(art => {
            const isOwned = this.gameState.collectedArtifacts.includes(art.id);
            
            const card = document.createElement('div');
            card.className = `artifact-card ${isOwned ? 'owned' : 'missing'}`;
            
            // Inline Styles als Fallback, falls CSS noch nicht greift
            card.style.position = 'relative';
            card.style.padding = '15px';
            card.style.borderRadius = '10px';
            card.style.textAlign = 'center';
            card.style.border = isOwned ? '1px solid #FFD700' : '1px solid #444';
            card.style.background = isOwned ? 'rgba(255, 215, 0, 0.05)' : 'rgba(255, 255, 255, 0.02)';
            if (!isOwned) card.style.opacity = '0.7';

            // Icons
            const icons = {
                'art_coin': '🪙', 'art_fossil': '🐚', 'art_compass': '🧭',
                'art_pickaxe': '⛏️', 'art_crystal': '🔮', 'art_crown': '👑'
            };
            const displayIcon = icons[art.id] || '🏺';

            const rarityStars = { common: '⭐', rare: '⭐⭐', epic: '⭐⭐⭐', legendary: '🌟🌟🌟' };

            card.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 10px; filter: ${isOwned ? 'drop-shadow(0 0 5px gold)' : 'grayscale(1)'};">
                    ${isOwned ? displayIcon : '❓'}
                </div>
                <div style="font-weight:bold; color:${isOwned ? '#fff' : '#777'}; margin-bottom:5px;">
                    ${isOwned ? art.name : '???'}
                </div>
                <div style="font-size: 0.8rem; color: #aaa; margin-bottom: 5px;">
                    ${rarityStars[art.rarity]}
                </div>
                <div style="font-size: 0.75rem; color: ${isOwned ? '#4CAF50' : '#555'}; min-height: 35px; display:flex; align-items:center; justify-content:center;">
                    ${isOwned ? art.desc : 'Noch nicht entdeckt'}
                </div>
            `;
            container.appendChild(card);
        });
    }

// Helfer für Icons (kannst du in deine getTileSymbol Logik integrieren)
getArtifactIcon(id) {
    const icons = {
        'art_coin': '🪙', 'art_fossil': '🐚', 'art_compass': '🧭',
        'art_pickaxe': '⛏️', 'art_crystal': '🔮', 'art_crown': '👑'
    };
    return icons[id] || '🏺';
}
    
    updateUI() {

        document.title = `${this.formatNumber(this.gameState.aktuelle_smileys)} Smileys - Idle Game`;

        this.computeTotalSPS();

        const diamantenEl = this.getById('diamanten_anzeige');
        if (diamantenEl) diamantenEl.innerText = this.formatNumber(this.gameState.diamanten);

        const aktuelleSmileysEl = this.getById('aktuelle_smileys');
        if (aktuelleSmileysEl) aktuelleSmileysEl.innerText = this.formatNumber(this.gameState.aktuelle_smileys);

        const smileysProKlickEl = this.getById('smileys_pro_klick_anzeige');
        if (smileysProKlickEl) {
            const totalClickPower = this.gameState.klickKraft * this.gameState.klickKraftMultiplier;
            smileysProKlickEl.innerText = this.formatNumber(totalClickPower);
        }

        const smileysProSekundeEl = this.getById('smileys_pro_sekunde_anzeige');
        if (smileysProSekundeEl) smileysProSekundeEl.innerText = this.formatNumber(this.gameState.totalSPS);

        const smileysProMinuteEl = this.getById('smileys_pro_minute_anzeige');
        if (smileysProMinuteEl) smileysProMinuteEl.innerText = this.formatNumber(this.gameState.totalSPS * 60);

        this.updateBuildingUI();
        this.checkFeatureUnlocks();

        const klickMultiDisplay = this.getById('klick_multiplikator_anzeige');
        if (klickMultiDisplay) {
            klickMultiDisplay.innerText = `x${this.gameState.klickKraftMultiplier.toFixed(2)}`;
        }

        const globalMultiDisplay = this.getById('globaler_multiplikator_anzeige');
        if (globalMultiDisplay) {
            globalMultiDisplay.innerText = `x${this.gameState.globalerPrestigeMultiplikator.toFixed(2)}`;
            const pF = (1 + (this.gameState.gesamt_prestige_punkte * this.gameState.prestigePointMultiplier)) || 1;
            const rF = (1 + (this.gameState.prestigeResets * this.gameState.prestigeResetBonus)) || 1;
            const uF = this.gameState.globalSPSMultiplier || 1;
            const gF = (1 + this.gameState.guildSPSMultiplier) || 1;
            globalMultiDisplay.title = `Prestige: x${pF.toFixed(2)} | Resets: x${rF.toFixed(2)} | Upgrades: x${uF.toFixed(2)} | Gilden: x${gF.toFixed(2)}`;
        }

        const prestigePointThreshold = 100000;
        const lifetime = this.gameState.lifetime_smileys || 0;
        const pointsToGain = this.calculatePrestigeGain();
        const currentTotalLevel = (this.gameState.gesamt_prestige_punkte || 0) + pointsToGain;
        const nextLevelTarget = currentTotalLevel + 1;
        const smileysForNext = Math.pow(nextLevelTarget, 3) * prestigePointThreshold;
        const smileysForCurrent = Math.pow(nextLevelTarget - 1, 3) * prestigePointThreshold;
        const progressInLevel = lifetime - smileysForCurrent;
        const totalNeededForLevel = smileysForNext - smileysForCurrent;

        let percentage = 0;
        if (totalNeededForLevel > 0) percentage = (progressInLevel / totalNeededForLevel) * 100;
        percentage = Math.max(0, Math.min(100, percentage));

        const bar = this.getById('prestige-progress-bar');
        const textNext = this.getById('next-prestige-threshold');
        const textPercent = this.getById('prestige-percent-text');

        if (bar) bar.style.width = percentage + '%';
        if (textNext) textNext.innerText = this.formatNumber(smileysForNext);

        if (textPercent) {
            if (pointsToGain > 0) {
                textPercent.innerText = `+${pointsToGain} Punkte!`;
                textPercent.style.color = '#00ff00';
                textPercent.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.5)';
            } else {
                textPercent.innerText = percentage.toFixed(2) + '%';
                textPercent.style.color = '#ffffff';
                textPercent.style.textShadow = 'none';
            }
        }

        const prestigeView = document.getElementById('view-prestige');
        if (prestigeView && prestigeView.classList.contains('active')) {
            if (typeof this.updatePrestigeUIView === 'function') this.updatePrestigeUIView();
        }

        this.updatePetButtons();
        this.updateDiamondMineStatus();

        const mineModal = this.getById('diamond-mine-modal');
        if (mineModal && mineModal.style.display === 'flex') {
            this.renderDiamondMineContent();
        }

        this.updateGuildsButton();
        const guildsModal = this.getById('guilds-modal');
        if (guildsModal && guildsModal.style.display === 'flex') {
            if (this.guildView === 'quests' || (this.guildView === 'boss' && this.gameState.guildBossFighting)) {
                this.renderGuildsContent();
            }
        }
        this.checkSkillUnlocks();
        this.updateGlobalUpgradeUI();
        this.renderBuffs();
    
        const comboEl = document.getElementById('combo-display');
        const comboVal = document.getElementById('combo-value');

        if (comboEl && comboVal) {
            if (this.comboCount >= 5) { // Erscheint erst ab 5 schnellen Klicks
                comboEl.classList.add('active');
                comboVal.innerText = `x${this.comboMulti.toFixed(2)}`;
            } else {
                comboEl.classList.remove('active');
            }
        }
    }

    renderSkillUI() {
        // Definition der Texte und Icons für jeden Skill
        const skillDetails = {
            frenzy:       { name: "Klick-Wut",      desc: "x5 Klick-Stärke (15s)",      icon: "🔥" },
            overdrive:    { name: "Overdrive",      desc: "x2 Produktion (30s)",        icon: "⚡" },
            critStorm:    { name: "Krit-Sturm",     desc: "100% Krit-Chance (10s)",     icon: "🎯" },
            goldRush:     { name: "Goldrausch",     desc: "+15 Min. Produktion",        icon: "💰" },
            diamondPulse: { name: "Diamant-Puls",   desc: "Sofortige Diamanten",        icon: "💎" },
            efficiency:   { name: "Effizienz",      desc: "-25% Gebäudekosten (45s)",   icon: "📉" },
            shards:       { name: "Splitter",       desc: "Klicks ernten SPS (20s)",    icon: "♦️" },
            hyperMinute:  { name: "Hyper-Zeit",     desc: "x5 Produktion (60s)",        icon: "🚀" }
        };

        // Wir gehen alle Skills durch und bauen das HTML der Buttons neu auf
        Object.keys(skillDetails).forEach(key => {
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
        document.addEventListener('keydown', (e) => {
            // Ignorieren, wenn man gerade schreibt
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // --- NEU: ESC schließt alle Fenster ---
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay').forEach(modal => {
                    modal.style.display = 'none';
                });
            }

            // NEU: Temporärer Kauf-Modifikator (Shift = 10x, Strg = 100x)
            if (e.key === 'Shift') {
                this.currentBuyAmount = 10;
                this.highlightToggle(10);
                this.updateBuildingUI();
            }
            if (e.key === 'Control') {
                this.currentBuyAmount = 100;
                this.highlightToggle(100);
                this.updateBuildingUI();
            }

            // LEERTASTE = Smiley Klicken
            if (e.code === 'Space' || e.key === 'Enter') {
                e.preventDefault(); 
                this.klickeSmiley(null); 
                
                const btn = this.getById('smiley_button');
                if(btn) {
                    btn.classList.add('active-key');
                    setTimeout(() => btn.classList.remove('active-key'), 100);
                }
            }

            // 'S' = Speichern
            if (e.key === 's' || e.key === 'S') {
                this.saveGame();
                this.showNotification("💾 Schnellspeicherung!", "success");
            }

            // ZAHLEN 1-9 = Gebäude kaufen
            if (e.code.startsWith('Digit')) {
                const digit = parseInt(e.code.replace('Digit', '')); 
                if (!isNaN(digit) && digit >= 1 && digit <= 9) {
                    const index = digit - 1; 
                    const maxIndex = buildingsData.length + (typeof uniqueBuildingsData !== 'undefined' ? uniqueBuildingsData.length : 0);
                    
                    if (index < maxIndex) {
                        this.kaufeMehrereGebaeude(index, this.currentBuyAmount);
                        
                        // Visuelles Feedback
                        const buyBtn = this.getById(`buy-btn-${index}`);
                        if(buyBtn) {
                            buyBtn.style.transform = "scale(0.95)";
                            setTimeout(() => buyBtn.style.transform = "scale(1)", 100);
                        }
                    }
                }
            }
        });

        // --- TASTE LOSLASSEN ---
        document.addEventListener('keyup', (e) => {
            // Sobald Shift oder Strg losgelassen wird, kehren wir zum Standard-Wert aus dem Menü zurück
            if (e.key === 'Shift' || e.key === 'Control') {
                this.currentBuyAmount = this.selectedBuyAmount || 1;
                this.highlightToggle(this.currentBuyAmount);
                this.updateBuildingUI();
            }
        });
    }

   updateBuildingUI() {
    buildingsData.forEach((building, index) => {
        // 1. Zähler & SPS (Bleibt wie vorher)
        const baseBuildingSPS = (this.gameState.buildingCounts[index] || 0) * (building.baseSPS || 0) * (building.prestigeMulti || 1);
        const actualBuildingSPS = baseBuildingSPS * this.gameState.globalerPrestigeMultiplikator;
        const spsPercentage = this.gameState.totalSPS > 0 ? (actualBuildingSPS / this.gameState.totalSPS * 100) : 0;

        const countElement = this.getById(`building-count-${index}`);
        if (countElement) countElement.innerText = this.gameState.buildingCounts[index];
        const spsElement = this.getById(`building-sps-${index}`);
        if (spsElement) spsElement.innerText = this.formatNumber(actualBuildingSPS);
        const spsPctElement = this.getById(`building-sps-pct-${index}`);
        if (spsPctElement) spsPctElement.innerText = spsPercentage.toFixed(1);

        // 2. DYNAMISCHE PREISBERECHNUNG (NEU)
        const amount = this.currentBuyAmount; // 1, 10 oder 100
        let totalCost = 0;
        
        // Schleife um den Gesamtpreis für X Stück zu berechnen
        for (let i = 0; i < amount; i++) {
            totalCost += this.getBuildingCost(index, this.gameState.buildingCounts[index] + i);
        }

        const buildingCard = document.querySelector(`.building-item[data-index="${index}"]`);
        if (buildingCard) {
            if (this.gameState.aktuelle_smileys >= totalCost) {
                buildingCard.classList.add('affordable');
            } else {
                buildingCard.classList.remove('affordable');
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
            costSpan.style.color = (this.gameState.aktuelle_smileys >= totalCost) ? '#4CAF50' : '#ff5252';

            // --- NEU: Detaillierter Tooltip ---
            const singleSPS = building.baseSPS * (building.prestigeMulti || 1) * this.gameState.globalerPrestigeMultiplikator;
            const groupSPS = singleSPS * (this.gameState.buildingCounts[index] || 0);

            btn.title = `Wert pro Stück: ${this.formatNumber(singleSPS)} SPS\nGesamtwert dieser Gruppe: ${this.formatNumber(groupSPS)} SPS`;
        }
    });
}

    updatePrestigeUI() {
        const availablePoints = this.gameState.prestige_punkte_verfügbar || 0;
        const totalPoints = this.gameState.gesamt_prestige_punkte || 0;
        const safeLifetime = this.gameState.lifetime_smileys || 0;

        // 1. Haupt-Prestige Seite Updates
        const elAvailable = this.getById('prestige_punkte_verfügbar');
        const elTotal = this.getById('gesamt_prestige_punkte');
        const elLifetime = this.getById('prestige-lifetime-display'); // Achtung: ID checken
        const elLifetimePrestige = this.getById('aktuelle_smileys_prestige');
        const elMulti = this.getById('prestige_view_multi');

        if (elAvailable) elAvailable.innerText = this.formatNumber(availablePoints);
        if (elTotal) elTotal.innerText = this.formatNumber(totalPoints);
        if (elLifetime) elLifetime.innerText = this.formatNumber(safeLifetime);
        if (elLifetimePrestige) elLifetimePrestige.innerText = this.formatNumber(safeLifetime);
        if (elMulti) elMulti.innerText = `x${this.gameState.globalerPrestigeMultiplikator.toFixed(2)}`;

        // 2. WICHTIG: Skill Tree Modal Update (Das fehlte!)
        const elModalPoints = this.getById('prestige_punkte_verfügbar_modal');
        if (elModalPoints) {
            elModalPoints.innerText = this.formatNumber(availablePoints);
            // Optional: Farbe rot wenn 0, grün wenn > 0
            elModalPoints.style.color = availablePoints > 0 ? '#4CAF50' : '#ff5252';
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
        const prevLevelSmileys = Math.pow(currentTotalLevel, 3) * prestigePointThreshold;
        const needed = smileysForNext - prevLevelSmileys;
        const currentProgress = safeLifetime - prevLevelSmileys;
        
        let percentage = 0;
        if (needed > 0) percentage = (currentProgress / needed) * 100;
        percentage = Math.max(0, Math.min(100, percentage));

        const bar = this.getById('prestige-progress-bar');
        const textNext = this.getById('next-prestige-threshold');
        const textPercent = this.getById('prestige-percent-text');
        const gainDisp = this.getById('prestige-gain-display');

        if (bar) bar.style.width = `${percentage}%`;
        if (textNext) textNext.innerText = this.formatNumber(smileysForNext);
        
        if (textPercent) {
            if (pointsToGain > 0) {
                textPercent.innerText = `+${pointsToGain} Punkte bereit!`;
                textPercent.style.color = '#00ff00';
            } else {
                textPercent.innerText = `${percentage.toFixed(1)}%`;
                textPercent.style.color = '#fff';
            }
        }

        if (gainDisp) {
            gainDisp.innerText = pointsToGain;
            gainDisp.style.color = pointsToGain > 0 ? '#4CAF50' : '#009ffd';
        }
    }

    fuehrePrestigeAus(points) {
        this.gameState.prestige_punkte_verfügbar += points;
        this.gameState.gesamt_prestige_punkte += points;
        this.gameState.prestigeResets++;
        this.gameState.aktuelle_smileys = 0;
        this.gameState.buildingCounts = this.gameState.buildingCounts.map(() => 0);
        this.gameState.researchStatus = this.gameState.researchStatus.map(() => false);

        this.updateUI();
        this.updateGlobalUpgradeUI();
        this.updatePrestigeUI();
        this.showNotification(`Prestige erfolgreich! +${points} Punkte erhalten!`, 'success');
    }

    zeigePrestigeDetails() {
        const modal = document.getElementById('prestige-modal');
        if (!modal) return;

        const totalSmileys = this.gameState.lifetime_smileys > 0 ? this.gameState.lifetime_smileys : this.gameState.aktuelle_smileys;
        const potentialPoints = this.calculatePrestigeGain();
        const currentPrestige = this.gameState.prestige_currency || 0;

        const elLifetime = document.getElementById('prestige-lifetime-display');
        const elLevel = document.getElementById('prestige-current-level');
        const elGain = document.getElementById('prestige-gain-display');

        if (elLifetime) elLifetime.innerText = this.formatNumber(totalSmileys);
        if (elLevel) elLevel.innerText = currentPrestige;
        if (elGain) elGain.innerText = potentialPoints;

        modal.style.display = 'flex';

        const btnConfirm = document.getElementById('btn-do-prestige');
        const btnCancel = document.getElementById('btn-cancel-prestige');

        const newBtnConfirm = btnConfirm.cloneNode(true);
        btnConfirm.parentNode.replaceChild(newBtnConfirm, btnConfirm);
        const newBtnCancel = btnCancel.cloneNode(true);
        btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);

        newBtnConfirm.onclick = () => {
            if (potentialPoints > 0) {
                this.fuehrePrestigeAus(potentialPoints);
                modal.style.display = 'none';
            } else {
                this.showNotification("🔒 Du brauchst mehr Fortschritt für ein Prestige.", "error");
            }
        };

        newBtnCancel.onclick = () => {
            modal.style.display = 'none';
        };
    }

    calculatePrestigeGain() {
        const totalSmileys = this.gameState.lifetime_smileys || 0;
        const BLOCK_COST = 100000;
        if (totalSmileys < BLOCK_COST) return 0;
        const totalLevel = Math.floor(Math.cbrt(totalSmileys / BLOCK_COST));
        const currentLevel = this.gameState.gesamt_prestige_punkte || 0;
        return Math.max(0, totalLevel - currentLevel);
    }

    showNotification(message, type = 'info') {
        // --- KORREKTUR START ---
        // Wir prüfen zuerst, ob der Spieler Popups deaktiviert hat.
        // Wenn settingsToasts 'false' ist, brechen wir sofort ab.
        if (this.settingsToasts === false) return; 
        // --- KORREKTUR ENDE ---

        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        if (type === 'success') toast.style.borderLeftColor = '#4CAF50';
        if (type === 'error') toast.style.borderLeftColor = '#f44336';
        
        toast.innerText = message;
        container.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    showSkillTooltip(upgrade, e) {
        const tooltip = this.getById('prestige-tooltip-modal');
        if (!tooltip) return;
        const isPurchased = this.gameState.prestigeUpgradeStatus[upgrade.id];
        const reqs = upgrade.requirements || [];
        const requirementsMet = reqs.length === 0 || reqs.every(reqId => this.gameState.prestigeUpgradeStatus[reqId]);

        let statusHtml = '';
        if (isPurchased) {
            statusHtml = `<p style="color:#4CAF50; font-weight:bold; margin-top:5px;">✅ Bereits gekauft</p>`;
        } else if (!requirementsMet) {
            statusHtml = `<p style="color:#f44336; margin-top:5px;">🔒 Gesperrt (Voraussetzung fehlt)</p>`;
        } else {
            const canAfford = (this.gameState.prestige_punkte_verfügbar || 0) >= upgrade.cost;
            const costColor = canAfford ? '#4CAF50' : '#f44336';
            statusHtml = `<p style="color:#aaa; margin-top:5px;">Kosten: <span style="color:${costColor}; font-weight:bold;">${this.formatNumber(upgrade.cost)}</span> Punkte</p>`;
        }

        tooltip.innerHTML = `
            <h4 style="margin:0 0 5px 0; color:#FFD700; border-bottom:1px solid #555; padding-bottom:5px;">${upgrade.name}</h4>
            <p style="margin:5px 0; font-size:0.9em; color:#ddd;">${upgrade.description}</p>
            ${statusHtml}
        `;
        tooltip.style.display = 'block';
        const rect = tooltip.getBoundingClientRect();
        const tooltipWidth = rect.width || 300;
        const tooltipHeight = rect.height || 150;
        let x = e.clientX + 20;
        let y = e.clientY + 20;
        if (x + tooltipWidth > window.innerWidth) x = e.clientX - tooltipWidth - 10;
        if (y + tooltipHeight > window.innerHeight) y = e.clientY - tooltipHeight - 10;
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
    }

    updatePetButtons() {
        this.petSystem.updatePetButtons();
    }

    updateDiamondMineStatus() {
        const mineUpgradePurchased = this.gameState.diamondMineUnlocked;
        const mineButton = this.getById('open_diamond_mine_button');
        if (mineButton) {
            mineButton.style.display = mineUpgradePurchased ? 'block' : 'none';
        }
        if (mineUpgradePurchased) {
            this.renderDiamondMineContent();
        }
    }

    updateGuildsButton() {
        const button = this.getById('open_guilds_button');
        if (!button) return;
        button.style.display = this.gameState.guildsUnlocked ? 'block' : 'none';
    }

    showClickEffect(event, amount, type = 'normal') {
        const effect = document.createElement('div');
        effect.className = 'click-effect';
        if (type === 'crit') {
            effect.classList.add('crit-style');
            effect.innerText = '💥 ' + amount;
        } else {
            effect.innerText = '+' + amount;
        }
        effect.style.left = `${event.clientX}px`;
        effect.style.top = `${event.clientY}px`;
        document.body.appendChild(effect);
        setTimeout(() => effect.remove(), 1000);
    }

    animateSmiley() {
        const smiley = this.getById('smiley_button');
        if (smiley) {
            smiley.classList.add('anim-squish');
            setTimeout(() => {
                smiley.classList.remove('anim-squish');
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

        const container = document.getElementById('buffs-container');
        if (!container) return;
        
        // Wir nutzen einen String-Builder statt innerHTML='', um unnötige Layout-Reflows zu minimieren,
        // aber das Entfernen der CSS-Animation ist der wichtigste Schritt gegen das Flackern.
        let html = '';
        const now = Date.now();

        // 1. RNG SPS Effekte
        const spsMult = this.gameState.activeBuffs.spsMultiplier;
        const spsEnd = this.gameState.activeBuffs.spsEndTime;
        
        if (spsMult !== 1 && spsEnd) {
            const secondsLeft = Math.ceil((spsEnd - now) / 1000);
            if (secondsLeft > 0) {
                if (spsMult > 1) {
                    html += this.getBadgeHtml('⚡ Rausch', `x${spsMult} (${secondsLeft}s)`, 'good');
                } else {
                    html += this.getBadgeHtml('🐌 Drosselung', `x${spsMult} (${secondsLeft}s)`, 'bad');
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
                    html += this.getBadgeHtml('📉 Rabatt', `-${Math.round((1-costMult)*100)}% (${secondsLeft}s)`, 'good');
                } else {
                    html += this.getBadgeHtml('💸 Inflation', `+${Math.round((costMult-1)*100)}% (${secondsLeft}s)`, 'bad');
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
                    html += this.getBadgeHtml('★ ' + name, timeLeft, 'good');
                }
            });
        }
        
        // 4. God Mode
        if (this.gameState.godModeMultiplier > 1) {
             html += this.getBadgeHtml('👼 GOD MODE', `x${this.gameState.godModeMultiplier}`, 'good');
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
        const div = document.createElement('div');
        div.className = `buff-badge ${type}`;
        div.innerHTML = `<span>${title}</span> <small style="opacity:0.8; margin-left:3px;">| ${value}</small>`;
        container.appendChild(div);
    }

    // ================================================================================================================
    // 8. CONTENT RENDERING
    // ================================================================================================================

    updateGuildTimers() {
    const state = this.gameState;
    const now = Date.now();
    let needsFullRender = false;
    
    const guildsModal = document.getElementById('guilds-modal');
    const isModalOpen = guildsModal && guildsModal.style.display === 'flex';

    // A) QUEST TIMER (Söldner)
    if (state.guildActiveQuests && state.guildActiveQuests.length > 0) {
        state.guildActiveQuests.forEach(q => {
            const elapsed = (now - q.startTime) / 1000;
            const timeLeft = Math.max(0, Math.ceil(q.duration - elapsed));
            
            if (timeLeft <= 0 && !q.notified) {
                q.notified = true; 
                needsFullRender = true;
                if (Notification.permission === "granted") {
                    const merc = state.guildMercenaries.find(m => m.id === q.assignedMerc);
                    new Notification("Quest abgeschlossen! ⚔️", {
                        body: `${merc ? merc.name : 'Dein Söldner'} ist zurückgekehrt!`,
                        icon: "smiley.png"
                    });
                }
            }

            if (isModalOpen) {
                const timerEl = document.getElementById(`timer-quest-${q.id}`);
                const barEl = document.getElementById(`bar-quest-${q.id}`);
                if (timerEl) {
                    timerEl.innerText = timeLeft > 0 ? `⏳ Noch ${timeLeft}s` : "✅ Bereit!";
                    if (barEl) barEl.style.width = Math.min(100, (elapsed / q.duration) * 100) + "%";
                }
            }
        });
    }

    // B) BOSS REGENERATION TIMER (Garantiertes Ticken)
    if (this.guildView === 'boss' && !state.guildBossFighting && isModalOpen) {
        const cooldownTime = 30 * 60 * 1000; 
        const nextAvailable = (state.lastBossDefeatTime || 0) + cooldownTime;
        // WICHTIG: 'now' muss hier aktuell sein
        const currentTime = Date.now();
        const bossTimeLeft = nextAvailable - currentTime;

        if (bossTimeLeft > 0) {
            const bossTimerDisplay = document.getElementById('boss-cooldown-timer');
            
            if (bossTimerDisplay) {
                const bRemaining = Math.ceil(bossTimeLeft / 1000);
                const bMins = Math.floor(bRemaining / 60);
                const bSecs = bRemaining % 60;
                // Live-Überschreiben des Textes
                bossTimerDisplay.innerText = `${bMins}:${bSecs < 10 ? '0' : ''}${bSecs}`;
            }
        } else if (state.lastBossDefeatTime > 0) {
            // Timer abgelaufen -> Kampf-Button rendern
            needsFullRender = true;
        }
    } // <-- Diese Klammer hat gefehlt!

    if (needsFullRender && isModalOpen) {
        this.renderGuildsContent();
    }
}

    renderPrestigeTree() {
        const container = this.getById('prestige-tree-container');
        if (!container) return;

        let world = this.getById('prestige-tree-world');
        if (!world) {
            world = document.createElement('div');
            world.id = 'prestige-tree-world';
            container.appendChild(world);
            this.treeX = container.clientWidth / 2;
            this.treeY = container.clientHeight / 2;
            this.treeZoom = this.treeZoom || 1.0;
        }
        
        world.style.transform = `translate(${this.treeX}px, ${this.treeY}px) scale(${this.treeZoom})`;
        world.innerHTML = '';

        const canvas = document.createElement('canvas');
        canvas.id = 'prestige-lines';
        const CANVAS_SIZE = 4000;
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        canvas.style.position = 'absolute';
        canvas.style.left = `-${CANVAS_SIZE / 2}px`;
        canvas.style.top = `-${CANVAS_SIZE / 2}px`;
        canvas.style.pointerEvents = 'none';
        world.appendChild(canvas);

        this.prestigeUpgrades.forEach(upgrade => {
            const node = document.createElement('div');
            node.className = 'skill-node';
            
            // NEU: Größen-Zuweisung nach Kosten
            if (upgrade.cost >= 25) {
                node.classList.add('node-tier-god');
            } else if (upgrade.cost >= 5) {
                node.classList.add('node-tier-keystone');
            } else {
                node.classList.add('node-tier-travel');
            }
            
            const pixelX = upgrade.x;
            const pixelY = upgrade.y;
            
            node.style.left = pixelX + 'px';
            node.style.top = pixelY + 'px';
            if (upgrade.category) node.classList.add('node-' + upgrade.category);

            const upgradeIndex = this.prestigeUpgrades.findIndex(u => u.id === upgrade.id);
            const isBought = this.gameState.prestigeUpgradeStatus[upgradeIndex];
            const canBuy = this.canBuyPrestigeUpgrade(upgrade);

            if (isBought) {
                node.classList.add('purchased');
                // Icon für kleine Nodes weglassen, wenn gewünscht. Hier zeigen wir es.
                node.innerHTML = this.getUpgradeIcon(upgrade.type);
            } else if (canBuy) {
                node.classList.add('available');
                node.innerText = "+"; // Ein Plus sieht eleganter aus als ein Fragezeichen
                node.onclick = (e) => {
                    e.stopPropagation();
                    this.tryBuyPrestigeUpgrade(upgrade);
                };
            } else {
                node.classList.add('locked');
                node.innerText = "🔒";
            }

            node.addEventListener('mouseenter', (e) => {
                this.showPrestigeTooltip(e, upgrade, isBought, !canBuy && !isBought);
            });
            node.addEventListener('mouseleave', () => {
                this.hidePrestigeTooltip();
            });
            world.appendChild(node);
        });
        setTimeout(() => this.drawPrestigeLines(), 50);
    }

    setupSkillTreeControls() {
        const container = this.getById('prestige-tree-container');
        if (!container) return;
        this.treeX = container.clientWidth / 2;
        this.treeY = container.clientHeight / 2;
        this.treeZoom = 1.0; // NEU: Start-Zoom
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;

        container.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.startX = e.clientX - this.treeX;
            this.startY = e.clientY - this.treeY;
            container.style.cursor = 'grabbing';
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
            if(container) container.style.cursor = 'grab';
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            this.treeX = e.clientX - this.startX;
            this.treeY = e.clientY - this.startY;
            const world = this.getById('prestige-tree-world');
            if (world) {
                world.style.transform = `translate(${this.treeX}px, ${this.treeY}px) scale(${this.treeZoom})`;
            }
        });

        // NEU: Mausrad Zoom-Logik
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.1;
            if (e.deltaY < 0) {
                this.treeZoom += zoomSpeed; // Reinzoomen
            } else {
                this.treeZoom -= zoomSpeed; // Rauszoomen
            }
            
            // Limitieren, damit man sich nicht im Nichts verliert
            this.treeZoom = Math.max(0.3, Math.min(this.treeZoom, 2.0));
            
            const world = this.getById('prestige-tree-world');
            if (world) {
                world.style.transform = `translate(${this.treeX}px, ${this.treeY}px) scale(${this.treeZoom})`;
            }
        });
    }

    drawPrestigeLines() {
        const canvas = this.getById('prestige-lines');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        // --- NEU: Hintergrund-Beschriftungen der Pfade ---
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // Sehr transparentes Weiß
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Die Texte an den entsprechenden Koordinaten platzieren
        ctx.fillText("NORDEN: Pfad des Klickers", 0, -450);
        ctx.fillText("OSTEN: Pfad der Industrie", 450, 0);
        ctx.fillText("SÜDEN: Pfad der Synergie", 0, 450);
        ctx.fillText("WESTEN: Pfad der Zeit", -450, 0);
        
        ctx.font = 'bold 120px Arial';
        ctx.fillStyle = 'rgba(224, 64, 251, 0.03)'; // Sehr transparentes Lila für Götter-Ring
        ctx.fillText("A S T R A L E R   R I N G", 0, -800);
        ctx.fillText("A S T R A L E R   R I N G", 0, 800);
        // --------------------------------------------------

        ctx.lineCap = 'round';

        this.prestigeUpgrades.forEach(upgrade => {
            const reqs = upgrade.requirements || upgrade.parents || [];
            
            if (reqs.length > 0) {
                const targetX = upgrade.x;
                const targetY = upgrade.y;
                
                reqs.forEach(parentId => {
                    const parentUpgrade = this.prestigeUpgrades.find(u => u.id === parentId);
                    if (parentUpgrade) {
                        const startX = parentUpgrade.x;
                        const startY = parentUpgrade.y;
                        const uIndex = this.prestigeUpgrades.findIndex(u => u.id === upgrade.id);
                        const pIndex = this.prestigeUpgrades.findIndex(u => u.id === parentId);
                        
                        const isTargetBought = this.gameState.prestigeUpgradeStatus[uIndex] || false;
                        const isParentBought = this.gameState.prestigeUpgradeStatus[pIndex] || false;

                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(targetX, targetY);

                        if (isTargetBought && isParentBought) {
                            ctx.strokeStyle = '#009ffd';
                            ctx.lineWidth = 4;
                        } else if (isParentBought) {
                            ctx.strokeStyle = '#FFD700';
                            ctx.lineWidth = 2;
                        } else {
                            ctx.strokeStyle = '#333';
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
            case 'click_mult': 
            case 'click_static': return '👆'; // Klick
            case 'sps_mult': 
            case 'sps_static': return '⚡'; // Energie/SPS
            case 'cost_reduction_buildings': 
            case 'cost_reduction_global': return '📉'; // Rabatt
            case 'global_god_mode': return '🌟'; // Gott
            case 'unlock_pets': return '🐾';
            case 'unlock_mine': return '💎';
            case 'unlock_guilds': return '🏰';
            case 'crit_chance': return '🎯';
            case 'offline_boost': return '💤';
            default: return '⚙️'; // Standard Zahnrad
        }
    }

    showPrestigeTooltip(e, upgrade, isBought, isLocked) {
        const tooltip = this.getById('prestige-tooltip-modal');
        if (!tooltip) return;
        const statusText = isBought ? "✅ Gekauft" : (isLocked ? "🔒 Gesperrt (Voraussetzung fehlt!)" : "Klicken zum Kaufen");
        const colorTitle = isBought ? '#4CAF50' : (isLocked ? '#777' : '#FFD700');

        tooltip.innerHTML = `
            <h4 style="color:${colorTitle}; margin:0 0 5px 0;">${upgrade.name}</h4>
            <p style="font-size:0.9em; margin:0 0 10px 0; color:#ddd;">${upgrade.description}</p>
            <div style="border-top:1px solid #444; padding-top:5px; font-size:0.85em;">
                <p style="margin:0;">Kosten: <span style="color:#FFD700; font-weight:bold;">${this.formatNumber(upgrade.cost)}</span> Punkte</p>
                <p style="margin:0; color:${isBought?'#4CAF50':(isLocked?'#f44336':'#aaa')}">${statusText}</p>
            </div>
        `;
        tooltip.style.display = 'block';
        const rect = tooltip.getBoundingClientRect();
        const offset = 15;
        let left = e.clientX + offset;
        let top = e.clientY + offset;
        if (left + rect.width > window.innerWidth) left = e.clientX - rect.width - offset;
        if (top + rect.height > window.innerHeight) top = e.clientY - rect.height - offset;
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

    hidePrestigeTooltip() {
        const tooltip = this.getById('prestige-tooltip-modal');
        if (tooltip) tooltip.style.display = 'none';
    }

    buyPrestigeUpgrade(id) {
        if (!this.gameState.prestigeUpgrades) this.gameState.prestigeUpgrades = [];
        if (this.gameState.prestigeUpgrades.includes(id)) return;
        const upgrade = prestigeUpgrades.find(u => u.id === id);
        if (!upgrade) return;

        if (upgrade.requirements && upgrade.requirements.length > 0) {
            const allMet = upgrade.requirements.every(reqId => this.gameState.prestigeUpgrades.includes(reqId));
            if (!allMet) {
                this.showNotification("🔒 Du musst erst das vorherige Upgrade kaufen!", "error");
                return;
            }
        }

        if (this.gameState.prestigeCurrency >= upgrade.cost) {
            this.gameState.prestigeCurrency -= upgrade.cost;
            this.gameState.prestigeUpgrades.push(id);
            if (upgrade.type === 'unlock_pets') this.showNotification("🐶 Pet Shop freigeschaltet!", "success");
            if (upgrade.type === 'unlock_mine') this.showNotification("💎 Mine freigeschaltet!", "success");
            if (upgrade.type === 'unlock_guilds') this.showNotification("⚔️ Gilden freigeschaltet!", "success");

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
        const btnPets = document.getElementById('open_pet_shop_button');
        if (btnPets) {
            // Wenn freigeschaltet -> flex, sonst none
            btnPets.style.display = hasPets ? 'flex' : 'none';
        }

        // Mine Button
        const btnMine = document.getElementById('open_diamond_mine_button');
        if (btnMine) {
            btnMine.style.display = hasMine ? 'flex' : 'none';
        }

        // Guilds Button
        const btnGuilds = document.getElementById('open_guilds_button');
        if (btnGuilds) {
            btnGuilds.style.display = hasGuilds ? 'flex' : 'none';
        }
        
        // HINWEIS: Market, Skins und Erfolge sind IMMER sichtbar, 
        // daher müssen sie hier nicht behandelt werden.
    }

    renderPetShop() {
        this.petSystem.renderPetShop();
    }

    diamondMineView = 'mine';

    switchMineTab(tabName) {
        this.diamondMineView = tabName;
        // Inhalt leeren erzwingt Neu-Render des Inhalts beim nächsten Update
        const contentDiv = document.getElementById('mine-sub-content');
        if(contentDiv) contentDiv.innerHTML = ''; 
        
        // Sofort rendern damit es sich schnell anfühlt
        this.renderDiamondMineContent();
    }

    // --- DER BAUARBEITER: Baut das HTML Gerüst ---
    renderDiamondMinigame(targetContainer) {
        const container = targetContainer || document.getElementById('minigame-placeholder');
        // Fallback: Wenn kein Container übergeben wurde, such den richtigen im DOM
        const finalContainer = container || document.getElementById('mine-sub-content');
        
        if (!finalContainer) return;

        // Grid generieren falls leer
        if (!this.gameState.mineGrid || this.gameState.mineGrid.length === 0) {
            this.generateMineGrid();
        }

        const inv = this.gameState.mineInventory;

        // 1. Grundgerüst bauen (nur wenn nicht vorhanden)
        if (!document.getElementById('mine-interface-wrapper')) {
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
                    
                    <div id="buy-picks-container" style="text-align:center; margin-bottom:10px; height:30px;">
                         <small style="color:#666;">Hacken regenerieren automatisch...</small>
                    </div>

                    <div class="mine-grid" id="mine-grid-area"></div>
                </div>
            `;
            
            // Listener binden
            document.getElementById('tool-pickaxe').onclick = () => { this.gameState.selectedTool = 'pickaxe'; this.updateMineVisuals(); };
            document.getElementById('tool-tnt').onclick = () => { this.gameState.selectedTool = 'tnt'; this.updateMineVisuals(); };
            document.getElementById('tool-drill').onclick = () => { this.gameState.selectedTool = 'drill'; this.updateMineVisuals(); };
        }

        // 2. Steine rendern (WICHTIG: Auch prüfen ob Container leer ist!)
        const gridArea = document.getElementById('mine-grid-area');
        if (gridArea && gridArea.children.length === 0) {
            this.gameState.mineGrid.forEach((tile, index) => {
                const tileDiv = document.createElement('div');
                tileDiv.id = `mine-tile-${index}`;
                tileDiv.className = 'mine-tile';
                // Hier wird der Inhalt (falls schon offen) sofort gesetzt
                if (tile.revealed) {
                    tileDiv.className += ' revealed';
                    // Inhalt ermitteln
                    let symbol = '';
                    let cssClass = '';
                    switch(tile.type) {
                        case 'stone': symbol = '🪨'; cssClass='loot-stone'; break;
                        case 'diamond': symbol = '💎'; cssClass='loot-diamond'; break;
                        case 'gold': symbol = '💰'; cssClass='loot-gold'; break;
                        case 'treasure': symbol = '🎁'; cssClass='loot-diamond'; break;
                        case 'passage': symbol = '🚪'; cssClass='loot-passage'; break;
                        case 'secret_passage': symbol = '🕳️'; cssClass='loot-passage'; break;
                        case 'tool_tnt': symbol = '🧨'; break;
                        case 'tool_drill': symbol = '🔩'; break;
                        case 'fossil': symbol = '🦖'; cssClass='loot-fossil'; break;
                        case 'artifact': symbol = '🏺'; break;
                    }
                    tileDiv.innerHTML = `<span class="${cssClass}">${symbol}</span>`;
                }
                
                tileDiv.onclick = () => this.handleMineClick(index); 
                gridArea.appendChild(tileDiv);
            });
        }

        this.updateMineVisuals();
    }

    // Update NUR für eine einzelne Kachel (Ultra-Schnell) ⚡
    updateTileVisual(index) {
        const tile = this.gameState.mineGrid[index];
        const tileDiv = document.getElementById(`mine-tile-${index}`);
        
        if (!tile || !tileDiv) return;

        // 1. Klasse ändern (Visuelles Aufdecken)
        tileDiv.className = `mine-tile ${tile.revealed ? 'revealed' : 'hidden'}`;
        
        // 2. Inhalt setzen (Nur wenn aufgedeckt)
        if (tile.revealed) {
            let symbol = '';
            let cssClass = '';
            
            switch(tile.type) {
                case 'stone': symbol = '🪨'; cssClass='loot-stone'; break;
                case 'diamond': symbol = '💎'; cssClass='loot-diamond'; break;
                case 'gold': symbol = '💰'; cssClass='loot-gold'; break;
                case 'treasure': symbol = '🎁'; cssClass='loot-diamond'; break;
                case 'passage': symbol = '🚪'; cssClass='loot-passage'; break;
                case 'secret_passage': symbol = '🕳️'; cssClass='loot-passage'; break;
                case 'tool_tnt': symbol = '🧨'; break;
                case 'tool_drill': symbol = '🔩'; break;
                case 'fossil': symbol = '🦖'; cssClass='loot-fossil'; break;
                case 'artifact': symbol = '🏺'; break;
            }
            
            tileDiv.innerHTML = `<span class="${cssClass}">${symbol}</span>`;
            
            // Tooltip entfernen
            tileDiv.title = ""; 
        }
    }

    // Update für die Zahlen im Header (Werkzeuge, Dias etc.)
    updateMineStatsUI() {
        const inv = this.gameState.mineInventory;
        
        // Werkzeuge
        const pEl = document.getElementById('qty-pickaxe');
        const tEl = document.getElementById('qty-tnt');
        const dEl = document.getElementById('qty-drill');
        
        if(pEl) pEl.innerText = inv.pickaxe;
        if(tEl) tEl.innerText = inv.tnt;
        if(dEl) dEl.innerText = inv.drill;
               
    }

    renderMineResearch(container) {
        // --- 1. Header & Grid ---
        let html = `
            <h3 style="text-align:center; margin-bottom:10px;">Forschungs-Labor</h3>
            <p style="text-align:center; font-size:0.9em; color:#aaa; margin-bottom:20px;">
                Untersuche Fossilien, um deine Ausrüstung zu verbessern.
            </p>
            <div class="info-grid" id="research-grid" style="margin-bottom:30px;"></div>
        `;

        // --- 2. Drop-Chancen Berechnung (Dynamisch) ---
        const state = this.game.gameState;
        const depth = state.mineDepth || 1;
        const depthBonus = Math.min(0.3, (depth - 1) * 0.01); // Max 30% Bonus
        const fossilBonus = (state.mineResearch.fossil_scanner || 0) * 0.02;
        const isEmerald = depth >= 5;

        // Wir berechnen die Wahrscheinlichkeiten basierend auf deiner generateMineGrid Logik
        const chanceArt = 1; // 1%
        const chanceFossil = Math.round((0.99 - (0.98 - fossilBonus)) * 100); // 1% Basis + Bonus
        const chanceTNT = 3; 
        const chanceDrill = 2;
        const chanceEmerald = isEmerald ? 5 : 0;
        
        // Schätzung für die variablen Werte
        const chanceTreasure = Math.round((0.15 + depthBonus) * 100) - 10; 
        const chanceDiamond = Math.round((0.25 + depthBonus) * 100) - 10; 
        const chanceGold = 25;
        
        // Der Rest ist Stein
        let sumChance = chanceArt + chanceFossil + chanceTNT + chanceDrill + chanceEmerald + chanceTreasure + chanceDiamond + chanceGold;
        let chanceStone = Math.max(0, 100 - sumChance);

        // --- 3. Drop-Chancen Tabelle (HTML) ---
        html += `
            <div style="background:rgba(255,255,255,0.05); border-radius:10px; padding:15px; border:1px solid #444;">
                <h4 style="margin-top:0; border-bottom:1px solid #555; padding-bottom:10px; margin-bottom:10px;">
                    Analyse: Ebene ${depth}
                </h4>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:0.9em;">
                    <div style="color:#FFD700">🏺 Artefakte: <strong>${chanceArt}%</strong></div>
                    <div style="color:#e0e0e0">🦖 Fossilien: <strong>${chanceFossil}%</strong></div>
                    <div style="color:#ff5252">🧨 Werkzeuge: <strong>${chanceTNT + chanceDrill}%</strong></div>
                    <div style="color:#00ff88">💚 Smaragde: <strong>${chanceEmerald}%</strong> ${!isEmerald ? '<small>(ab Ebene 5)</small>' : ''}</div>
                    <div style="color:#009ffd">🎁 Schätze: <strong>~${chanceTreasure}%</strong></div>
                    <div style="color:#009ffd">💎 Diamanten: <strong>~${chanceDiamond}%</strong></div>
                    <div style="color:#ffeb3b">💰 Goldadern: <strong>${chanceGold}%</strong></div>
                    <div style="color:#888">🪨 Gestein: <strong>~${chanceStone}%</strong></div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // --- 4. Upgrades Rendern (Logik wie vorher) ---
        const grid = document.getElementById('research-grid');
        const upgrades = [
            { 
                id: 'durable_picks', 
                name: 'Titan-Spitzen', // Klingt stärker als "Haltbare Spitzen"
                desc: 'Verstärkte Legierung. 10% Chance, dass die Hacke nicht zerbricht.', 
                icon: '⛏️', max: 5, baseCost: 5 
            },
            { 
                id: 'fossil_scanner', 
                name: 'Röntgen-Brille', // Cooler als "Scanner"
                desc: 'Lässt dich durch Steine sehen. Erhöht Fossilien-Chance massiv.', 
                icon: '🥽', max: 5, baseCost: 10 
            },
            { 
                id: 'explosive_yield', 
                name: 'Big Bada Boom', // Referenz :)
                desc: 'TNT deckt mehr Ressourcen auf und sieht cooler aus.', 
                icon: '🧨', max: 3, baseCost: 20 
            }
        ];

        upgrades.forEach(u => {
            const currentLvl = this.game.gameState.mineResearch[u.id] || 0;
            const cost = Math.floor(u.baseCost * Math.pow(1.5, currentLvl));
            
            // WICHTIG: Hier die harte Prüfung auf das Max-Level aus dem Objekt
            const isMaxed = currentLvl >= u.max; 
            const canAfford = this.game.gameState.fossilien >= cost;
            
            // ... (Dein restlicher HTML Code für effectInfo und div)

            const btn = div.querySelector('button');
            if (btn) {
                // Button nur klickbar machen, wenn nicht maxed UND genug Fossilien
                if (!isMaxed && canAfford) {
                    btn.onclick = () => {
                        // Doppelte Sicherheitsprüfung im Klick-Event
                        const freshLvl = this.game.gameState.mineResearch[u.id] || 0;
                        if (freshLvl < u.max && this.game.gameState.fossilien >= cost) {
                            this.game.gameState.fossilien -= cost;
                            this.game.gameState.mineResearch[u.id] = freshLvl + 1;
                            
                            this.game.playBuySound();
                            this.game.showNotification("Forschung verbessert! 🧪", "success");
                            this.renderDiamondMineContent(); 
                            this.game.speichereSpiel();
                        }
                    };
                } else {
                    btn.disabled = true; // Button wirklich im DOM deaktivieren
                }
            }
            grid.appendChild(div);
        });
    }

    renderDiamondShopContent(targetContainer) {
        const container = targetContainer;
        if (!container) return;
        const diamondDisplay = this.getById('shop-diamanten-anzeige');
        if (diamondDisplay) diamondDisplay.innerText = this.formatNumber(this.gameState.diamanten);

        container.innerHTML = `<div class="info-grid" id="diamond-shop-grid-inner"></div>`;
        const innerGrid = this.getById('diamond-shop-grid-inner');
        if (!innerGrid) return;

        let shopHtml = '';
        diamondShopUpgrades.forEach((upgrade, index) => {
            const count = this.game.gameState.diamondShopPurchases[upgrade.id] || 0;
            const isMaxed = upgrade.maxPurchases && count >= upgrade.maxPurchases;
            const canAfford = this.game.gameState.diamanten >= upgrade.cost;
            
            const div = document.createElement('div');
            div.className = `info-upgrade-item ${isMaxed ? 'purchased' : (canAfford ? 'available' : 'locked')}`;
            
            // --- Einheits-Design für die Buttons ---
            const buttonStyle = isMaxed 
                ? "background:#444; color:#888; border:none; cursor:default;" 
                : (canAfford 
                    ? "background:#009ffd; color:#fff; border:none; cursor:pointer; box-shadow: 0 4px 0 #007bbd;" 
                    : "background:#333; color:#777; border:none; cursor:not-allowed;");

            div.innerHTML = `
                <div style="font-size:2em; margin-bottom:5px;">💎</div>
                <h4 style="margin:5px 0; color:#fff;">${upgrade.name}</h4>
                <p style="font-size:0.8em; min-height:40px; color:#ccc;">${upgrade.description}</p>
                <div style="font-size:0.75em; color:#009ffd; margin-bottom:10px;">Status: ${isMaxed ? 'Permanent aktiv' : 'Verfügbar'}</div>
                
                <button class="btn-buy-diamond" data-id="${upgrade.id}" ${isMaxed || !canAfford ? 'disabled' : ''} 
                        style="width:100%; padding:10px; border-radius:6px; font-weight:bold; text-transform:uppercase; font-size:0.85em; transition:all 0.1s; ${buttonStyle}">
                    ${isMaxed ? 'BEREITS GEKAUFT' : `Kaufen (${this.game.formatNumber(upgrade.cost)} 💎)`}
                </button>
            `;
            
            const btn = div.querySelector('button');
            if (btn && !isMaxed && canAfford) {
                // Klick-Effekt (nach unten drücken)
                btn.onmousedown = () => { btn.style.transform = "translateY(2px)"; btn.style.boxShadow = "none"; };
                btn.onmouseup = () => { btn.style.transform = "translateY(0)"; btn.style.boxShadow = "0 4px 0 #007bbd"; };
                
                btn.onclick = () => {
                    this.game.buyDiamondShopUpgrade(upgrade.id);
                    this.renderDiamondMineContent(); // Sofortiger Refresh des Shops
                };
            }
            innerGrid.appendChild(div);
        });
    }

    guildView = 'shop';

    renderGuildsContent() {
        this.guildSystem.renderGuildsContent();
    }

    createBuildingElements() {
        const buildingGrid = this.getById('building-grid');
        if (!buildingGrid) return;
        buildingGrid.innerHTML = '';

        // Wir rendern NUR die normalen Gebäude aus buildingsData
        buildingsData.forEach((building, index) => {
            const buildingDiv = document.createElement('div');
            buildingDiv.className = 'building-item';
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
        const container = this.getById('prestige-tree-container');
        const infoContainer = this.getById('info_prestige_container');
        const CONTAINER_WIDTH = 600;
        const centerX = CONTAINER_WIDTH / 2;
        const nodeOffset = 20;
        const containers = [];
        if (container) containers.push({ element: container, isInfo: false });
        if (infoContainer) containers.push({ element: infoContainer, isInfo: true });

        containers.forEach(({ element, isInfo }) => {
            if (!element) return;
            element.innerHTML = '';
            element.style.position = 'relative';
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.id = isInfo ? 'prestige-lines-info' : 'prestige-lines';
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            element.appendChild(svg);

            prestigeUpgrades.forEach(upgrade => {
                const upgradeDiv = document.createElement('div');
                upgradeDiv.className = `prestige-node ${isInfo ? 'info-node' : ''}`;
                upgradeDiv.dataset.id = upgrade.id;
                upgradeDiv.style.left = `calc(50% + ${upgrade.x}px)`;
                upgradeDiv.style.top = `${upgrade.y}px`;
                upgradeDiv.dataset.description = upgrade.description;
                upgradeDiv.dataset.cost = this.formatNumber(upgrade.cost);
                const buyButtonHtml = isInfo ? '' : `<button class="prestige-buy-button" data-id="${upgrade.id}" style="display:none;"></button>`;
                upgradeDiv.innerHTML = `<div class="node-icon"></div>${buyButtonHtml}`;
                element.appendChild(upgradeDiv);

                if (upgrade.requirements) {
                    upgrade.requirements.forEach(reqId => {
                        const reqUpgrade = prestigeUpgrades.find(u => u.id === reqId);
                        if (reqUpgrade) {
                            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                            line.setAttribute('x1', `${reqUpgrade.x + centerX + nodeOffset}`);
                            line.setAttribute('y1', `${reqUpgrade.y + nodeOffset}`);
                            line.setAttribute('x2', `${upgrade.x + centerX + nodeOffset}`);
                            line.setAttribute('y2', `${upgrade.y + nodeOffset}`);
                            line.setAttribute('stroke', '#009ffd');
                            line.setAttribute('stroke-width', '3');
                            line.setAttribute('class', 'prestige-line');
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

    openWiki() {
        const modal = document.getElementById('wiki-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.openWikiPage('buildings'); // Startseite ist immer Gebäude
            
            // Close Button Event
            const closeBtn = document.getElementById('close-wiki-button');
            if(closeBtn) {
                // removeEventListener trick um doppelte Events zu vermeiden
                const newBtn = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newBtn, closeBtn);
                newBtn.onclick = () => modal.style.display = 'none';
            }
        }
    }

    openWikiPage(pageName) {
        const container = document.getElementById('wiki-content-area');
        if (!container) return;

        // 1. Sidebar Buttons aktualisieren (Highlight setzen)
        document.querySelectorAll('.wiki-nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if(btn.getAttribute('onclick').includes(pageName)) {
                btn.classList.add('active');
            }
        });

        // 2. Container leeren
        container.innerHTML = '';
        
        // 3. Temporären Wrapper erstellen
        const wrapper = document.createElement('div');
        wrapper.className = 'info-grid'; 
        
        // Switch: Welcher Inhalt soll rein?
        switch (pageName) {
            case 'buildings':
                wrapper.id = 'info_buildings_container'; 
                container.appendChild(wrapper);
                this.createBuildingInfoElements(); 
                break;
            case 'upgrades':
                wrapper.id = 'info_global_upgrades_container';
                container.appendChild(wrapper);
                this.createInfoGlobalUpgradeElements();
                break;
            case 'prestige':
                wrapper.id = 'info_prestige_container';
                container.appendChild(wrapper);
                this.createPrestigeInfoList();
                break;
            case 'achievements':
                wrapper.id = 'info_achievements_container';
                container.appendChild(wrapper);
                this.createInfoAchievementElements();
                break;
            case 'pets':
                wrapper.id = 'info_pets_container';
                container.appendChild(wrapper);
                this.createInfoPetsElements();
                break;
            case 'stats':
                wrapper.id = 'info_stats_container';
                container.appendChild(wrapper);
                this.createInfoStatsElements();
                break;
            case 'museum':
                wrapper.id = 'museum_grid'; // WICHTIG: Die ID, die renderMuseum sucht
                container.appendChild(wrapper);
                this.renderMuseum(wrapper); // Ruft die Museum-Logik auf
                break;
            case 'gem_empire':
                wrapper.id = 'gem_shop_container'; 
                container.appendChild(wrapper);
                this.gemSystem.renderGemShop('gem_shop_container');
                break;
        }
    }

    setupMainEventListeners() {
        console.log("🔌 Starte Event-Listener Setup...");

        // 1. Globale Listener
        window.addEventListener('beforeunload', () => { this.saveGame(); });

        const smileyBtn = document.getElementById('smiley_button');
        if (smileyBtn) smileyBtn.addEventListener('click', (e) => this.klickeSmiley(e));

        // 2. Feature Buttons (JETZT ALLES MIT UNTERSTRICHEN!)
        
        // Wiki / Smileypedia Button
        const btnWiki = document.getElementById('open_wiki_btn');
        if (btnWiki) {
            btnWiki.onclick = (e) => {
                e.preventDefault();
                this.openWiki();
            };
        }

        // Pet Shop
        const btnPets = document.getElementById('open_pet_shop_button');
        if (btnPets) {
            btnPets.onclick = (e) => {
                e.preventDefault();
                this.updatePetButtons();
                const modal = document.getElementById('pet-shop-modal');
                if(modal) modal.style.display = 'flex';
            };
        } else { console.error("❌ Button open_pet_shop_button nicht gefunden!"); }

        // Mine
        const btnMine = document.getElementById('open_diamond_mine_button');
        if (btnMine) {
            btnMine.onclick = (e) => {
                e.preventDefault();
                this.updateDiamondMineStatus();
                const modal = document.getElementById('diamond-mine-modal');
                if(modal) modal.style.display = 'flex';
            };
        }

        // Gilden
        const btnGuilds = document.getElementById('open_guilds_button');
        if (btnGuilds) {
            btnGuilds.onclick = (e) => {
                e.preventDefault();
                this.renderGuildsContent();
                const modal = document.getElementById('guilds-modal');
                if(modal) modal.style.display = 'flex';
            };
        }

        // Market (Schwarzmarkt)
        const btnMarket = document.getElementById('open_blackmarket_button');
        if (btnMarket) {
            btnMarket.onclick = (e) => {
                e.preventDefault();
                this.switchView('blackmarket');
            };
        } else { console.error("❌ Button open_blackmarket_button nicht gefunden!"); }

        // Skins
        const btnSkins = document.getElementById('open_wardrobe_button');
        if (btnSkins) {
            btnSkins.onclick = (e) => {
                e.preventDefault();
                this.switchView('wardrobe');
            };
        }

        // Achievements
        const btnAchieve = document.getElementById('show_achievements_button');
        if (btnAchieve) {
            btnAchieve.onclick = (e) => {
                e.preventDefault();
                // 1. Erst den Inhalt generieren...
                this.createInfoAchievementElements(); 
                // 2. ...dann anzeigen
                const modal = document.getElementById('achievements_info_modal');
                if(modal) modal.style.display = 'flex';
            };
        }

        // 3. Schließen-Buttons (Modal X)
        const closeMap = {
            'close-pet-shop-button': 'pet-shop-modal',
            'close_diamond_mine_button': 'diamond-mine-modal',
            'close_guilds_button': 'guilds-modal',
            'close_achievements_button': 'achievements_info_modal'
        };

        Object.keys(closeMap).forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.onclick = () => {
                    document.getElementById(closeMap[btnId]).style.display = 'none';
                };
            }
        });
        
        // 4. Toggle Buttons (1x, 10x, 100x)
        const toggleContainer = document.getElementById('buy-amount-toggles');
        if (toggleContainer) {
            toggleContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-toggle');
                if (!btn) return;
                
                document.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // KORREKTUR: Wir speichern den Wert fest ab
                this.selectedBuyAmount = parseInt(btn.dataset.amount, 10);
                this.currentBuyAmount = this.selectedBuyAmount;
                
                // Wir aktualisieren nur die Preise, nicht das ganze UI
                this.updateBuildingUI(); 
            });
        }
        
        // 5. Gebäude-Kauf im Grid (Event Delegation)
        const grid = document.getElementById('building-grid');
        if(grid) {
             grid.addEventListener('click', (e) => {
                const button = e.target.closest('.btn-buy');
                if (!button) return;
                const buildingItem = button.closest('.building-item');
                const index = parseInt(buildingItem.dataset.index, 10);
                if (!isNaN(index)) {
                    this.kaufeMehrereGebaeude(index, this.currentBuyAmount || 1);
                }
            });
        }
    }

    // Hilfsfunktion: Visuelles Highlight bei Tastendruck (Shift/Ctrl)
    highlightToggle(amount) {
        const btns = document.querySelectorAll('.btn-toggle');
        btns.forEach(b => {
            // Wenn der Button dem gedrückten Key entspricht -> Highlight an
            if (parseInt(b.dataset.amount) === amount) {
                b.classList.add('key-active');
            } else {
                b.classList.remove('key-active');
            }
        });
    }

    setupPrestigeEventListeners() {
        const openPrestigeModalButton = this.getById('prestige_reset_button');
        if (openPrestigeModalButton) {
            openPrestigeModalButton.addEventListener('click', () => {
                this.zeigePrestigeDetails();
            });
        }

        const skillTreeModal = this.getById('skill_tree_modal');
        const openSkillTreeButton = this.getById('open_skill_tree_button');
        const closeSkillTreeButton = this.getById('close_skill_tree_button');
        if (openSkillTreeButton && skillTreeModal) {
            openSkillTreeButton.addEventListener('click', () => {
                skillTreeModal.style.display = 'flex';
                this.renderPrestigeTree();
            });
        }
        if (closeSkillTreeButton && skillTreeModal) {
            closeSkillTreeButton.addEventListener('click', () => {
                skillTreeModal.style.display = 'none';
            });
        }

        const resetPrestigeUpgradesButton = this.getById('reset_prestige_upgrades_button');
        if (resetPrestigeUpgradesButton) {
            resetPrestigeUpgradesButton.addEventListener('click', () => {
                if (confirm("Möchtest du wirklich alle investierten Punkte zurücksetzen? Du erhältst die Punkte zurück.")) {
                    this.respecPrestigeUpgrades();
                }
            });
        }
    }

    respecPrestigeUpgrades() {
        let refundedPoints = 0;
        this.gameState.prestigeUpgradeStatus.forEach((bought, id) => {
            if (bought) {
                const upgrade = prestigeUpgrades.find(u => u.id === id);
                if (upgrade) {
                    refundedPoints += upgrade.cost;
                }
            }
        });

        if (refundedPoints > 0) {
            if (!confirm("Möchtest du wirklich alle investierten Prestige-Punkte zurücksetzen?")) {
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
            this.showNotification(`Reset erfolgreich! ${refundedPoints} Punkte erstattet.`, "success");
        } else {
            this.showNotification("Du hast noch keine Punkte investiert.", "info");
        }
    }

    setupInfoPageEventListeners() {
        // Veraltete Listener entfernt.
        // Das Wiki wird jetzt über openWiki() gesteuert.
        console.log("ℹ️ Info-System auf Smileypedia umgestellt.");
        
        // Listener für das Museum (falls noch nötig)
        const museumModal = this.getById('museum_modal');
        const closeMuseumBtn = this.getById('close_museum_button');
        if (closeMuseumBtn && museumModal) {
            closeMuseumBtn.onclick = () => museumModal.style.display = 'none';
        }
    }

    setupSettingsModalListeners() {
        const settingsModal = this.getById('settings-modal');
        const openSettingsButton = this.getById('open-settings-button');
        const closeSettingsButton = this.getById('close-settings-button');
        const exportButton = this.getById('export-save-button');
        const importButton = this.getById('import-save-button');
        const saveDataTextarea = this.getById('save-data-textarea');
        
        // Audio Inputs
        const musicVolumeSlider = this.getById('music-volume');
        const soundVolumeSlider = this.getById('sound-volume');
        
        // --- NEU: Benachrichtigungs Inputs ---
        const toastCheck = this.getById('setting-toast-toggle');
        const desktopCheck = this.getById('setting-desktop-toggle');

        // 1. Audio Listener
        if (musicVolumeSlider) {
            musicVolumeSlider.addEventListener('input', (e) => {
                localStorage.setItem('musicVolume', e.target.value);
                this.setzeLautstaerke();
            });
        }
        if (soundVolumeSlider) {
            soundVolumeSlider.addEventListener('input', (e) => {
                localStorage.setItem('soundVolume', e.target.value);
                this.setzeLautstaerke();
            });
        }

        // 2. Benachrichtigungs Listener (NEU)
        if (toastCheck) {
            toastCheck.addEventListener('change', (e) => {
                this.settingsToasts = e.target.checked;
                localStorage.setItem('setting_toasts', e.target.checked);
                // Feedback nur wenn aktiviert (sonst sieht man es ja nicht)
                if(e.target.checked) this.showNotification("Popups aktiviert!", "success");
            });
        }

        if (desktopCheck) {
            desktopCheck.addEventListener('change', (e) => {
                const isActive = e.target.checked;
                this.settingsDesktop = isActive;
                localStorage.setItem('setting_desktop', isActive);

                if (isActive) {
                    // Browser um Erlaubnis fragen
                    if ("Notification" in window) {
                        Notification.requestPermission().then(permission => {
                            if (permission === "granted") {
                                new Notification("Smiley Clicker", { 
                                    body: "Desktop-Benachrichtigungen aktiviert!", 
                                    icon: "smiley.png" 
                                });
                            } else {
                                // Wenn abgelehnt, Haken wieder rausnehmen
                                e.target.checked = false; 
                                this.settingsDesktop = false;
                                localStorage.setItem('setting_desktop', false);
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
        openSettingsButton?.addEventListener('click', (e) => {
            e.preventDefault();
            this.speichereSpiel();
            this.showNotification("💾 Spielstand erfolgreich gespeichert.", "success");
            const savedData = localStorage.getItem('smileyGameSave');
            if (saveDataTextarea) {
                saveDataTextarea.value = savedData || '';
            }
            if (settingsModal) settingsModal.style.display = 'flex';
        });

        closeSettingsButton?.addEventListener('click', () => {
            if (settingsModal) settingsModal.style.display = 'none';
        });

        exportButton?.addEventListener('click', () => {
            this.speichereSpiel();
            const saveData = localStorage.getItem('smileyGameSave');
            if (saveData && saveDataTextarea) {
                saveDataTextarea.value = saveData;
                try {
                    navigator.clipboard.writeText(saveData).then(() => {
                        this.showNotification("Spielstand in Zwischenablage kopiert.", "success");
                    }, () => {
                        // Fallback
                        if (document.execCommand && saveDataTextarea.select) {
                            saveDataTextarea.select();
                            document.execCommand('copy');
                            this.showNotification("Spielstand kopiert.", "success");
                        }
                    });
                } catch (err) {
                     // Fallback 2
                    if (document.execCommand && saveDataTextarea.select) {
                        saveDataTextarea.select();
                        document.execCommand('copy');
                    }
                }
            }
        });

        importButton?.addEventListener('click', () => {
            const saveData = saveDataTextarea?.value.trim();
            if (saveData && confirm("Möchtest du diesen Spielstand wirklich importieren? Dein aktueller Fortschritt wird überschrieben.")) {
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
        const tooltip = this.getById('custom-tooltip');
        if (!tooltip) return;

        // Event-Listener für das ganze Dokument delegieren
        document.body.addEventListener('mousemove', (e) => {
            if (tooltip.style.display === 'block') {
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

                tooltip.style.left = left + 'px';
                tooltip.style.top = top + 'px';
            }
        });

        // Mouseover-Logik für Elemente mit 'data-tooltip' Attribut
        // Wir nutzen Event Delegation, das spart Performance
        document.body.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-tooltip-type]');
            if (target) {
                const type = target.dataset.tooltipType;
                const index = target.dataset.index; // Optional, für Arrays
                this.showCustomTooltip(type, index);
            }
        });

        document.body.addEventListener('mouseout', (e) => {
            const target = e.target.closest('[data-tooltip-type]');
            if (target) {
                tooltip.style.display = 'none';
            }
        });
    }

    showCustomTooltip(type, index) {
        const tooltip = this.getById('custom-tooltip');
        if (!tooltip) return;

        let htmlContent = '';

        // --- TYP 1: GEBÄUDE KAUFEN ---
        if (type === 'building') {
            const i = parseInt(index);
            const building = (i === 8) ? uniqueBuildingsData.find(u => u.id === 'diamond_mine') : buildingsData[i];
            
            if (building) {
                const count = this.gameState.buildingCounts[i];
                const baseSPS = building.baseSPS * (building.prestigeMulti || 1);
                const totalSPS = baseSPS * count * this.gameState.globalerPrestigeMultiplikator;
                
                // Kosten berechnen
                let cost = 0;
                const amount = this.currentBuyAmount || 1;
                if (i === 8) { // Mine ist unique
                     cost = this.getBuildingCost(i, count);
                } else {
                    for(let k=0; k<amount; k++) cost += this.getBuildingCost(i, count + k);
                }
                
                const canAfford = this.gameState.aktuelle_smileys >= cost;

                htmlContent = `
                    <h4>${building.name}</h4>
                    <div class="tooltip-stat"><span>Besitz:</span> <span class="highlight-gold">${count}</span></div>
                    <div class="tooltip-stat"><span>Produktion (Basis):</span> <span>${this.formatNumber(baseSPS)} SPS</span></div>
                    <div class="tooltip-stat"><span>Gesamt-Beitrag:</span> <span class="highlight-green">+${this.formatNumber(totalSPS)} SPS</span></div>
                    <hr style="border-color:#555; margin:5px 0;">
                    <div class="tooltip-stat">
                        <span>Kosten (${i===8 ? '1x' : amount+'x'}):</span> 
                        <span class="${canAfford ? 'highlight-green' : 'highlight-red'}">${this.formatNumber(cost)} Smileys</span>
                    </div>
                    <div style="font-size:0.75rem; color:#aaa; margin-top:5px; font-style:italic;">
                        ${i===8 ? 'Produziert Diamanten.' : 'Klicke zum Kaufen.'}
                    </div>
                `;
            }
        }

        // --- TYP 2: STATS ---
        else if (type === 'stats_sps') {
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
            tooltip.style.display = 'block';
        }
    }

    // ================================================================================================================
    // 10. INFO SEITEN RENDERING
    // ================================================================================================================

    createBuildingInfoElements() {
        const container = this.getById('info_buildings_container');
        if (!container) return;
        
        container.innerHTML = '';
        container.className = 'info-grid'; 

        // Wir nutzen die Standard-Liste
        const allBuildings = buildingsData; 
        const globalMulti = this.gameState.globalerPrestigeMultiplikator;

        allBuildings.forEach((building, index) => {
            const item = document.createElement('div');
            item.className = 'info-upgrade-item'; 
            
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
        const container = this.getById('info_global_upgrades_container');
        if (!container) return;
        
        container.innerHTML = '';
        container.className = 'info-grid';

        globalUpgrades.forEach(u => {
            const bought = this.gameState.researchStatus[u.id];
            
            // 1. Passendes Icon holen
            let icon = this.getUpgradeIcon(u.type);
            
            // 2. Name Fallback (Falls in data.js kein Name steht)
            let name = u.name;
            if (!name || name === "Unbekanntes Upgrade") {
                // Versuch, einen Namen aus der Beschreibung zu erraten oder generisch zu benennen
                if(u.type.includes('click')) name = "Klick-Booster";
                else if(u.type.includes('sps')) name = "Produktions-Boost";
                else name = "Technologie";
            }

            // 3. Karte erstellen
            const item = document.createElement('div');
            item.className = `info-upgrade-item ${bought ? 'purchased' : 'locked'}`;
            
            // Styling für Status
            const statusColor = bought ? '#4CAF50' : '#ff5252';
            const statusText = bought ? 'ERFORSCHT' : 'OFFEN';
            
            if (bought) {
                item.style.borderColor = '#4CAF50';
                item.style.background = 'rgba(76, 175, 80, 0.05)';
            } else {
                item.style.borderColor = '#555';
                item.style.opacity = '0.8';
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
                
                ${!bought ? `
                <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:8px; font-size:0.9em; color:#FFD700; display:flex; justify-content:space-between;">
                    <span>Kosten:</span>
                    <strong>${this.formatNumber(this.getGlobalUpgradeCost(u))}</strong>
                </div>` : ''}
            `;
            container.appendChild(item);
        });
    }

    createInfoPetsElements() {
        this.petSystem.createInfoPetsElements();
    }

    createInfoAchievementElements() {
        const container = this.getById('info_achievements_container');
        if (!container) return;
        
        container.innerHTML = '';
        container.className = 'info-grid'; // <--- WICHTIG

        achievementsData.forEach((a, i) => {
            const unlocked = this.gameState.achievementsUnlocked[i];
            const item = document.createElement('div');
            item.className = `info-upgrade-item ${unlocked ? 'purchased' : 'locked'}`;
            if(!unlocked) item.style.opacity = "0.5";

            item.innerHTML = `
                <h4 style="color:${unlocked ? '#FFD700' : '#888'}">${unlocked ? '🏆' : '🔒'} ${a.name}</h4>
                <p>${a.description}</p>
                ${unlocked ? '<span style="color:#4CAF50; font-size:0.8em">Freigeschaltet!</span>' : ''}
            `;
            container.appendChild(item);
        });
    }
    createPrestigeInfoList() {
        const container = this.getById('info_prestige_container');
        if (!container) return;
        container.className = 'info-grid';
        container.innerHTML = '';
        prestigeUpgrades.forEach(upgrade => {
            const isPurchased = this.gameState.prestigeUpgradeStatus[upgrade.id];
            let icon = "★";
            if (upgrade.type === 'unlock_pets') icon = "🐾";
            if (upgrade.type === 'unlock_mine') icon = "💎";
            if (upgrade.type === 'unlock_guilds') icon = "⚔️";
            if (upgrade.type === 'click_mult') icon = "👆";
            if (upgrade.type === 'sps_mult') icon = "⚡";

            const item = document.createElement('div');
            item.className = `info-upgrade-item ${isPurchased ? 'bought-upgrade' : ''}`;
            if (!isPurchased) {
                item.style.borderColor = '#555';
                item.style.opacity = '0.9';
            }
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <h3 style="margin:0; font-size:1.1rem; color:${isPurchased ? '#fff' : '#aaa'};">
                        ${icon} ${upgrade.name}
                    </h3>
                    ${isPurchased ? '<span style="color:#4CAF50;">✔ Gekauft</span>' : ''}
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
        const container = this.getById('info_stats_container');
        if (!container) return;
        
        container.innerHTML = '';
        container.className = 'info-grid'; // Grid Layout beibehalten

        // --- BERECHNUNGEN (Bleiben gleich) ---
        const prestige = this.calculatePrestigeEffects();
        const globalRed = this.gameState.globalCostReduction || 0;
        const guildRed = this.gameState.guildCostReduction || 0;
        const prestigeRed = prestige.costReduction || 0;
        let petBuildingRed = 0;
        let petUpgradeRed = 0;
        let activePetName = "Keins";

        if (this.gameState.activePet) {
            const pet = petsData.find(p => p.id === this.gameState.activePet);
            if (pet) {
                activePetName = pet.name;
                const level = this.gameState.petLevels[pet.id] || 0;
                const stats = this.calculatePetStat(pet, level);
                if (pet.effectType === 'cost_reduction_buildings') petBuildingRed = stats.currentEffect;
                if (pet.effectType === 'cost_reduction_upgrades') petUpgradeRed = stats.currentEffect;
            }
        }

        const totalBuildingMult = (1 - globalRed) * (1 - guildRed) * (1 - prestigeRed) * (1 - petBuildingRed);
        const totalUpgradeMult = (1 - globalRed) * (1 - guildRed) * (1 - prestigeRed) * (1 - petUpgradeRed);
        const totalBuildingRed = (1 - totalBuildingMult) * 100;
        const totalUpgradeRed = (1 - totalUpgradeMult) * 100;

        const eff = this.gameState.prestigePointMultiplier || 0.05;
        const points = this.gameState.gesamt_prestige_punkte || 0;
        const multPoints = 1 + (points * eff);
        const resets = this.gameState.prestigeResets || 0;
        const resetBonusVal = this.gameState.prestigeResetBonus || 0.01;
        const multResets = 1 + (resets * resetBonusVal);
        const multGuild = 1 + (this.gameState.guildSPSMultiplier || 0);
        let totalGlobal = this.gameState.globalerPrestigeMultiplikator || 1;
        
        // Versuchen, den reinen Upgrade-Multiplikator zu isolieren
        const divisor = (multPoints * multResets * multGuild) || 1;
        const multUpgrades = totalGlobal / divisor;

        const fmt = (val) => (val * 100).toFixed(1) + '%';
        const xFmt = (val) => 'x' + val.toFixed(2);

        // --- LISTE DER STATS ---
        const stats = [
            { label: '💰 Aktuelle Smileys', value: this.formatNumber(this.gameState.aktuelle_smileys) },
            { label: '🏦 Lifetime Smileys', value: this.formatNumber(this.gameState.lifetime_smileys) },
            { label: '💎 Diamanten', value: this.formatNumber(this.gameState.diamanten) },
            { label: '⚡ Smileys pro Sekunde', value: this.formatNumber(this.gameState.totalSPS), highlight: true },
            { label: '👆 Klick-Stärke', value: this.formatNumber(this.getClickStrength()) },
            { label: '🔥 Kritische Treffer', value: `${fmt(this.gameState.critChance)} Chance / ${this.gameState.critDamageMult}x Schaden` },
            { 
                label: '📉 Gebäude-Rabatt', 
                value: totalBuildingRed.toFixed(2) + '%', 
                detail: `Prestige: ${fmt(prestigeRed)} | Gilde: ${fmt(guildRed)} | Shop: ${fmt(globalRed)} | Pet: ${fmt(petBuildingRed)}`,
                highlight: totalBuildingRed > 0 
            },
            { 
                label: '📉 Upgrade-Rabatt', 
                value: totalUpgradeRed.toFixed(2) + '%', 
                detail: `Prestige: ${fmt(prestigeRed)} | Gilde: ${fmt(guildRed)} | Shop: ${fmt(globalRed)} | Pet: ${fmt(petUpgradeRed)}`,
                highlight: totalUpgradeRed > 0 
            },
            { 
                label: '🚀 Produktions-Bonus', 
                value: xFmt(totalGlobal), 
                detail: `Punkte: ${xFmt(multPoints)} | Resets: ${xFmt(multResets)} | Upgrades: ${xFmt(multUpgrades)} | Gilde: ${xFmt(multGuild)}`,
                highlight: true 
            },
            { 
                label: '🌟 Prestige Effizienz', 
                value: fmt(eff),
                detail: `Bonus pro Prestige-Punkt (Basis + Upgrades)`
            },
            { label: '🏆 Prestige Resets', value: this.gameState.prestigeResets },
            { label: '🐶 Aktives Pet', value: activePetName }
        ];

        // --- RENDERING ---
        stats.forEach(stat => {
            const item = document.createElement('div');
            item.className = 'info-upgrade-item';
            if (stat.highlight) item.style.borderColor = '#009ffd';
            
            let html = `
                <h4 style="margin:0 0 5px 0; color:#aaa; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
                    ${stat.label}
                </h4>
                <div style="font-size:1.3rem; font-weight:bold; color:${stat.highlight ? '#009ffd' : '#fff'};">
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
            case 'sps_mult': return `+${(bonus.value * 100)}% SPS`;
            case 'click_mult': return `+${(bonus.value * 100)}% Klickkraft`;
            case 'global_mult': return `+${(bonus.value * 100)}% auf Alles`;
            case 'prestige_efficiency': return `+${(bonus.value * 100)}% Prestige-Effekt`;
            // 👇 DAS HIER IST NEU 👇
            case 'mine_boost': return `+${(bonus.value * 100)}% Minen-Ertrag`;
            case 'cost_reduction_global': return `-${(bonus.value * 100)}% Kosten`;
            default: return "Permanenter Bonus";
        }
    }

    ladeAudioEinstellungen() {
        // 1. Audio laden
        const musicVolume = localStorage.getItem('musicVolume');
        const soundVolume = localStorage.getItem('soundVolume');
        const musicSlider = this.getById('music-volume');
        const soundSlider = this.getById('sound-volume');

        if (musicSlider && musicVolume !== null) musicSlider.value = musicVolume;
        if (soundSlider && soundVolume !== null) soundSlider.value = soundVolume;
        this.setzeLautstaerke();

        // 2. Benachrichtigungen laden (DAS HIER IST WICHTIG)
        const toastSetting = localStorage.getItem('setting_toasts');
        const desktopSetting = localStorage.getItem('setting_desktop');

        const toastCheck = this.getById('setting-toast-toggle');
        const desktopCheck = this.getById('setting-desktop-toggle');

        // Standard: Toasts AN (true), wenn noch nichts gespeichert wurde
        this.settingsToasts = (toastSetting === null) ? true : (toastSetting === 'true');
        this.settingsDesktop = (desktopSetting === 'true');

        if (toastCheck) toastCheck.checked = this.settingsToasts;
        if (desktopCheck) desktopCheck.checked = this.settingsDesktop;
    }

    setzeLautstaerke() {
        const musicVolume = parseFloat(localStorage.getItem('musicVolume') || 100) / 100;
        const soundVolume = parseFloat(localStorage.getItem('soundVolume') || 100) / 100;
        const musicPlayer = this.getById('background-music');
        if (musicPlayer) musicPlayer.volume = musicVolume;
        // Klick-Sound wird live generiert, nutzt soundVolume direkt beim Abspielen
    }

     // --- AUDIO SYNTHESIZER ---
    playTone(freq, type, duration, volMult = 1.0) {
        const soundVolumeSlider = this.getById('sound-volume');
        const volume = soundVolumeSlider ? (parseInt(soundVolumeSlider.value) / 100) : 0.5;
        if (volume <= 0) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!this.audioCtx) this.audioCtx = new AudioContext();
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        
        gain.gain.setValueAtTime(volume * volMult, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }

    playClickSound() {
        this.soundSystem.playClickSound();
    }

    playAchievementSound() {
        this.soundSystem.playAchievementSound(); 
    }

    playLevelUpSound() {
        this.soundSystem.playLevelUp();
    }

    playBuySound() {
        this.playTone(1200, 'sine', 0.05, 0.3); 
    }



    switchView(viewName) {
        // --- 1. NAVBAR UPDATE (Der blaue Strich) ---
        // Wir entfernen 'active' erst von allen Links...
        document.querySelectorAll('.navbar a').forEach(el => el.classList.remove('active'));

        // ... und setzen ihn neu, je nachdem wo wir sind
        if (viewName === 'home') {
            const nav = document.getElementById('nav-home');
            if(nav) nav.classList.add('active');
        } else if (viewName === 'prestige') {
            const nav = document.getElementById('nav-prestige');
            if(nav) nav.classList.add('active');
        }

        // --- 2. ALLE MODALS SCHLIEßEN (Reset) ---
        const modals = [
            'prestige-shop-modal',  
            'wiki-modal',
            'settings-modal', 
            'blackmarket-modal', 
            'wardrobe-modal', 
            'pet-shop-modal', 
            'diamond-mine-modal', 
            'guilds-modal',
            'achievements_info_modal' // <--- WICHTIG: Das hier fehlte!
        ];

        modals.forEach(id => {
            const m = document.getElementById(id);
            if (m) m.style.display = 'none';
        });

        // --- 3. ANSICHT WÄHLEN ---
        if (viewName === 'home') {
            window.scrollTo(0, 0);
            this.updateUI();
        } 
        
        // --- PRESTIGE SHOP ---
        else if (viewName === 'prestige') {
            const pModal = document.getElementById('prestige-shop-modal');
            if (pModal) {
                pModal.style.display = 'flex';
                this.updatePrestigeUIView(); 
                this.renderPrestigeTree(); 
            }
        } 
        
        // --- INFO / WIKI ---
        else if (viewName === 'info' || viewName === 'wiki') {
            const iModal = document.getElementById('wiki-modal') || document.getElementById('info-modal');
            if (iModal) {
                iModal.style.display = 'flex';
                if (typeof this.openWikiPage === 'function') {
                    this.openWikiPage('buildings'); 
                }
            }
        }

        // --- OPTIONEN ---
        else if (viewName === 'settings') {
            const sModal = document.getElementById('settings-modal');
            if (sModal) {
                this.speichereSpiel();
                const textArea = document.getElementById('save-data-textarea');
                if(textArea) textArea.value = localStorage.getItem('smileyGameSave') || '';
                sModal.style.display = 'flex';
            }
        }

        // --- DER SCHWARZMARKT (GemEmpire) ---
        else if (viewName === 'blackmarket') {
            let bmModal = document.getElementById('blackmarket-modal');
            if (!bmModal) {
                bmModal = document.createElement('div');
                bmModal.id = 'blackmarket-modal';
                bmModal.className = 'modal-overlay';
                bmModal.style.display = 'none';
                bmModal.innerHTML = `
                    <div class="modal-content" style="background:#05000a; border:1px solid #d500f9; max-width:850px; width:95%; max-height:90vh; overflow-y:auto; box-shadow: 0 0 30px rgba(138, 43, 226, 0.3);">
                        <span class="close-modal" onclick="document.getElementById('blackmarket-modal').style.display='none'" style="color:#fff; font-size:2rem;">&times;</span>
                        <div id="gem_shop_container_main"></div>
                    </div>
                `;
                document.body.appendChild(bmModal);
            }
            bmModal.style.display = 'flex';
            if (this.gemSystem) {
                this.gemSystem.renderGemShop('gem_shop_container_main');
            }
        }

        // --- DER KLEIDERSCHRANK (Skins) ---
        else if (viewName === 'wardrobe') {
            let wModal = document.getElementById('wardrobe-modal');
            if (!wModal) {
                wModal = document.createElement('div');
                wModal.id = 'wardrobe-modal';
                wModal.className = 'modal-overlay';
                wModal.style.display = 'none';
                wModal.innerHTML = `
                    <div class="modal-content" style="background:#111; border:1px solid #444; max-width:600px; width:95%; max-height:85vh; overflow-y:auto;">
                        <span class="close-modal" onclick="document.getElementById('wardrobe-modal').style.display='none'">&times;</span>
                        <h2 style="text-align:center; color:#fff; border-bottom:1px solid #333; padding-bottom:10px; margin-top:0;">Kleiderschrank 🎩</h2>
                        <p style="text-align:center; color:#aaa; font-size:0.9em;">Bezahle mit Corrupted Smileys (👾)</p>
                        <div id="wardrobe-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:15px; margin-top:20px;"></div>
                    </div>
                `;
                document.body.appendChild(wModal);
            }
            wModal.style.display = 'flex';
            if (this.skinSystem) {
                this.skinSystem.renderWardrobe();
            }
        }
    }

    updatePrestigeUIView() {
        const prestigeAvailable = this.getById('prestige_punkte_verfügbar');
        const prestigeTotal = this.getById('gesamt_prestige_punkte');
        const currentSmileys = this.getById('aktuelle_smileys_prestige');
        const nextPoint = this.getById('next_prestige_point');
        const multiDisplay = this.getById('prestige_view_multi');

        if (prestigeAvailable) prestigeAvailable.innerText = this.formatNumber(this.gameState.prestige_punkte_verfügbar || 0);
        if (prestigeTotal) prestigeTotal.innerText = this.formatNumber(this.gameState.gesamt_prestige_punkte || 0);
        if (currentSmileys) currentSmileys.innerText = this.formatNumber(this.gameState.lifetime_smileys || 0);
        if (multiDisplay) multiDisplay.innerText = `x${this.gameState.globalerPrestigeMultiplikator.toFixed(2)}`;

        const pointsToGain = this.calculatePrestigeGain();
        const currentTotalLevel = (this.gameState.gesamt_prestige_punkte || 0) + pointsToGain;
        const nextLevel = currentTotalLevel + 1;
        const nextPointRequirement = Math.pow(nextLevel, 3) * 100000;

        if (nextPoint) nextPoint.innerText = this.formatNumber(nextPointRequirement);

        const btnPage = this.getById('prestige_reset_button_page');
        if (btnPage) {
            btnPage.onclick = () => this.zeigePrestigeDetails();
        }
    }


// =========================================================
    // 11.🎲 RNG EVENT SYSTEM (Buffs & Debuffs)
    // =========================================================

    spawnRandomEvent() {
        // 1. Element erstellen
        const eventObj = document.createElement('div');
        eventObj.className = 'rng-event-object';
        eventObj.innerText = '❓'; // Das mysteriöse Fragezeichen

        // 2. Zufällige Position (innerhalb des Sichtbereichs, mit etwas Abstand zum Rand)
        const x = Math.random() * (window.innerWidth - 150) + 75;
        const y = Math.random() * (window.innerHeight - 150) + 75;
        eventObj.style.left = x + 'px';
        eventObj.style.top = y + 'px';

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
                eventObj.style.opacity = '0';
                eventObj.style.transition = 'opacity 0.5s';
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
                this.showNotification(`🎁 Glückspilz! +${this.formatNumber(gain)} Smileys`, 'success');
            } else {
                // SPS Boost (30s)
                this.gameState.activeBuffs.spsMultiplier = 2.5;
                // WICHTIG: Wir speichern, WANN es vorbei ist
                this.gameState.activeBuffs.spsEndTime = now + durationShort; 
                this.showNotification(`⚡ Smiley-Rausch! SPS x2.5 für 30s`, 'success');
            }
        } else {
            // --- 🔴 DEBUFFS ---
            const debuffType = Math.random();

            if (debuffType < 0.33) {
                // Direkter Abzug
                const loss = Math.floor(this.gameState.aktuelle_smileys * 0.10); 
                this.gameState.aktuelle_smileys -= loss;
                this.showNotification(`📉 Pech! -10% Deiner Smileys weg.`, 'error');
            } else if (debuffType < 0.66) {
                // Drosselung (30s)
                this.gameState.activeBuffs.spsMultiplier = 0.4; 
                this.gameState.activeBuffs.spsEndTime = now + durationShort;
                this.showNotification(`🐢 Drosselung! SPS -60% für 30s`, 'error');
            } else {
                // Inflation (60s)
                this.gameState.activeBuffs.costMultiplier = 1.5; 
                this.gameState.activeBuffs.costEndTime = now + durationLong;
                this.showNotification(`💸 Inflation! Preise +50% für 60s`, 'error');
            }
        }
        
        this.updateUI();
        this.speichereSpiel();
    }

    checkBuffExpiration() {
        const now = Date.now();
        let changed = false;

        // Prüfe SPS Buffs/Debuffs
        if (this.gameState.activeBuffs.spsEndTime && now > this.gameState.activeBuffs.spsEndTime) {
            this.gameState.activeBuffs.spsMultiplier = 1;
            delete this.gameState.activeBuffs.spsEndTime; // Zeitstempel löschen
            this.showNotification("System wieder normal (SPS).", "info");
            changed = true;
        }

        // Prüfe Kosten Inflation/Rabatt
        if (this.gameState.activeBuffs.costEndTime && now > this.gameState.activeBuffs.costEndTime) {
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
        const ticker = document.getElementById('news-ticker-text');
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
            "Tipp: Iss zwischendurch mal einen Apfel. Das ist gesund."
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
        if (smileys > 1000000) { // 1 Million
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
        const randomNews = newsOptions[Math.floor(Math.random() * newsOptions.length)];
        
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
        btn.classList.remove('ready');
        btn.classList.add('is-active');
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
                btn.classList.remove('is-active');
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
                btn.classList.add('ready'); // Wieder Blau machen
            }
            if (timerText) timerText.innerText = "BEREIT";
            if (bar) bar.style.width = "0%";
            this.showNotification(`⭐ ${skillKey.toUpperCase()} wieder einsatzbereit!`, "success");
        }
    }, 1000);
}

    handleImmediateSkillEffects(skillKey) {
        if (skillKey === 'goldRush') {
            const gain = this.gameState.totalSPS * 60 * 15;
            this.addSmileys(gain);
        }
        if (skillKey === 'diamondPulse') {
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
            if (bar) bar.style.width = (100 - progress) + "%";
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
        hyperMinute: 20
    };

    Object.keys(unlockMap).forEach(skillKey => {
        const btn = this.getById(`btn-skill-${skillKey}`);
        const container = btn ? btn.parentElement : null;
        
        if (container) {
            if (resets >= unlockMap[skillKey]) {
                container.style.opacity = "1";
                container.style.pointerEvents = "auto";
                if(btn) btn.title = btn.title.replace("Gesperrt! ", ""); // Titel säubern
            } else {
                container.style.opacity = "0.3";
                container.style.pointerEvents = "none";
                // Hinweis im Tooltip, warum es gesperrt ist
                if(btn && !btn.title.startsWith("Gesperrt")) {
                    btn.title = `Gesperrt! Benötigt Prestige Level ${unlockMap[skillKey]} - ` + btn.title;
                }
            }
        }
    });
}

// Stellt Cooldowns nach dem Neuladen der Seite wieder her
restoreCooldowns() {
    const now = Date.now();
    Object.keys(this.gameState.skills).forEach(key => {
        const skill = this.gameState.gameState?.skills ? this.gameState.skills[key] : this.gameState.skills[key]; 
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
                btn.classList.remove('is-active', 'ready');
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
                btn.classList.add('ready');
            }
            if (timerText) timerText.innerText = "BEREIT";
        }
    });
}

initChat() {
     this.chatSystem.initChat();
}

}

// ================================================================================================================
// === SUB-SYSTEM: DIAMOND MINE ===
// ================================================================================================================
class DiamondMine {
    constructor(gameInstance) {
        this.game = gameInstance;
        console.log("💎 DiamondMine System + Rendering geladen.");
    }

    // --- DATEN & LOGIK ---

    getLootContent(type) {
        const state = this.game.gameState;
        if (type === 'fossil') return Math.floor(Math.random() * 3) + 1;
        if (type === 'tool_tnt' || type === 'tool_drill') return 1;

        const depth = state.mineDepth || 1;
        // Je tiefer, desto mehr Loot
        const multiplier = 1 + (depth * 0.15); 

        switch (type) {
            case 'emerald': 
                // Smaragde sind 5x bis 10x wertvoller als Diamanten
                return Math.floor((Math.random() * 25 + 50) * multiplier);
            case 'diamond': 
                return Math.floor((Math.random() * 5 + 1) * multiplier);
            case 'gold':
                let base = (state.totalSPS > 0) ? state.totalSPS : 10;
                let amount = Math.floor(base * (Math.random() * 60 + 10));
                return Math.max(100, amount);
            case 'treasure': return 'GIFT';
            case 'passage': return 'TIEFER';
            case 'secret_passage': return 'GEHEIM';
            default: return 0;
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
            grid[exitIndex] = { id: exitIndex, type: 'passage', revealed: false, content: 'RAUS' };

            for (let i = 0; i < size; i++) {
                if (grid[i]) continue;
                const rng = Math.random();
                let type = 'gold';
                // In der Schatzkammer gibts jetzt auch Chance auf Smaragde
                if (isEmeraldLayer && rng > 0.90) type = 'emerald';
                else if (rng > 0.85) type = 'fossil';
                else if (rng > 0.7) type = 'tool_tnt';
                else if (rng > 0.95) type = 'tool_drill';
                else if (rng > 0.4) type = 'diamond';
                else if (rng > 0.2) type = 'treasure';
                grid[i] = { id: i, type: type, revealed: false, content: this.getLootContent(type) };
            }
        }
        // 2. NORMALE EBENE
        else {
            const exitIndex = Math.floor(Math.random() * size);
            grid[exitIndex] = { id: exitIndex, type: 'passage', revealed: false, content: 'ABSTIEG' };

            // Geheimgang
            if (Math.random() < 0.05) {
                let secretIndex;
                do { secretIndex = Math.floor(Math.random() * size); } while (secretIndex === exitIndex);
                grid[secretIndex] = { id: secretIndex, type: 'secret_passage', revealed: false, content: 'GEHEIMNIS' };
            }

            // Boni berechnen
            const depthBonus = Math.min(0.3, (depth - 1) * 0.01);
            const fossilBonus = (state.mineResearch.fossil_scanner || 0) * 0.02;

            for (let i = 0; i < size; i++) {
                if (grid[i]) continue;
                const rng = Math.random();
                let type = 'stone'; // Das ist die "Niete"
                
                // Wahrscheinlichkeiten
                if (rng > 0.98 - fossilBonus) type = 'fossil';
                else if (rng > 0.95) type = 'tool_tnt';   // 5% Chance auf TNT
                else if (rng > 0.93) type = 'tool_drill'; // 2% Chance auf Bohrer
                else if (isEmeraldLayer && rng > 0.88) type = 'emerald'; // Smaragde nur tief unten!
                else if (rng > 0.85 - depthBonus) type = 'treasure';
                else if (rng > 0.70 - depthBonus) type = 'diamond';
                else if (rng > 0.45) type = 'gold';
                
                grid[i] = { id: i, type: type, revealed: false, content: this.getLootContent(type) };
            }
        }
        state.mineGrid = grid;
        this.game.speichereSpiel();
    }

    handleMineClick(index) {
        const state = this.game.gameState;
        const tool = state.selectedTool || 'pickaxe';
        if (tool === 'tnt') this.useTNT(index);
        else if (tool === 'drill') this.useDrill(index);
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

        const saveChance = (state.mineResearch.durable_picks || 0) * 0.10;
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
    const lootMultiplier = hasMineBuff ? 1.20 : 1.0;

    // --- LOOT LOGIK MIT FLOATING TEXT ---
    
    if (tile.type === 'emerald') {
        const finalAmount = Math.ceil(amount * lootMultiplier);
        state.diamanten += finalAmount;
        this.showLootText(index, `+${finalAmount} 💚`, '#00ff88'); // Hellgrün
        this.game.triggerShake('diamanten_anzeige');
    }
    else if (tile.type === 'diamond') {
        const finalAmount = Math.ceil(amount * lootMultiplier);
        state.diamanten += finalAmount;
        this.showLootText(index, `+${finalAmount} 💎`, '#009ffd'); // Blau
    }
    else if (tile.type === 'gold') {
        this.game.addSmileys(amount);
        this.showLootText(index, `+${this.game.formatNumber(amount)} 💰`, '#ffeb3b'); // Gelb
    }
    else if (tile.type === 'fossil') {
        state.fossilien += amount;
        this.showLootText(index, `+${amount} 🦖`, '#e0e0e0'); // Grau/Weiß
    }
    else if (tile.type === 'tool_tnt') {
        state.mineInventory.tnt++;
        this.showLootText(index, "+1 🧨", '#ff5252'); // Rot
    }
    else if (tile.type === 'tool_drill') {
        state.mineInventory.drill++;
        this.showLootText(index, "+1 🔩", '#ffa726'); // Orange
    }
    else if (tile.type === 'treasure') {
        // Schätze geben auch mehr, wenn der Buff aktiv ist
        const baseDia = Math.floor(50 * (1 + state.mineDepth * 0.1));
        const finalDia = Math.ceil(baseDia * lootMultiplier);
        state.diamanten += finalDia;
        this.showLootText(index, `+${finalDia} 💎`, '#FFD700'); // Gold
        this.game.showNotification(`🎁 SCHATZ GEFUNDEN!`, "success");
    }
    else if (tile.type === 'passage' || tile.type === 'secret_passage') {
        if (state.isTreasureRoom) {
            state.isTreasureRoom = false;
            this.game.showNotification("Schatzkammer verlassen.", "info");
        }
        if (tile.type === 'secret_passage') state.isTreasureRoom = true;
        
        state.mineDepth++;
        this.showLootText(index, "ABSTIEG!", '#ffffff');

        setTimeout(() => { this.reloadMineLevel(); }, 500); 
    }

    this.game.speichereSpiel();
    this.updateMineVisuals();
}

    useTNT(centerIndex) {
        const state = this.game.gameState;
        if (state.mineInventory.tnt <= 0) {
            this.game.showNotification("Kein TNT!", "error"); return;
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
        if(hit) this.game.showNotification("BOOM! 💥", "success");
        this.updateMineVisuals();
    }

    useDrill(centerIndex) {
        const state = this.game.gameState;
        if (state.mineInventory.drill <= 0) {
            this.game.showNotification("Kein Bohrer!", "error"); return;
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
        const container = document.getElementById('diamond-mine-content');
        if (!container) return;

        // 1. Navigation & Header EINMALIG aufbauen
        if (!document.getElementById('mine-nav-wrapper')) {
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
            document.getElementById('tab-mine').onclick = () => this.switchMineTab('mine');
            document.getElementById('tab-research').onclick = () => this.switchMineTab('research');
            document.getElementById('tab-shop').onclick = () => this.switchMineTab('shop');
        }

        // 2. Werte oben immer aktuell halten
        const elDias = document.getElementById('res-dias');
        const elFossil = document.getElementById('res-fossil');
        const elGold = document.getElementById('res-gold');
        
        if(elDias) elDias.innerText = this.game.formatNumber(this.game.gameState.diamanten);
        if(elFossil) elFossil.innerText = this.game.gameState.fossilien || 0;
        if(elGold) elGold.innerText = this.game.formatNumber(this.game.gameState.aktuelle_smileys);

        // 3. Tab-Styling
        const activeTab = this.game.diamondMineView || 'mine';
        const navWrapper = document.getElementById('mine-nav-wrapper');
        
        if (navWrapper.dataset.lastActive !== activeTab) {
            ['mine', 'research', 'shop'].forEach(t => {
                const btn = document.getElementById(`tab-${t}`);
                if (activeTab === t) {
                    btn.style.background = '#009ffd';
                    btn.style.borderColor = '#009ffd';
                    btn.style.color = '#fff';
                    btn.classList.remove('btn-cancel');
                } else {
                    btn.style.background = '#333';
                    btn.style.borderColor = '#444';
                    btn.style.color = '#aaa';
                    btn.classList.add('btn-cancel');
                }
            });
            navWrapper.dataset.lastActive = activeTab;
        }

        // 4. Inhalt rendern
        const contentDiv = document.getElementById('mine-sub-content');
        
        if (activeTab === 'mine') {
            if (!document.getElementById('mine-interface-wrapper')) {
                this.renderDiamondMinigame(contentDiv);
            } else {
                this.updateMineVisuals(); 
            }
        } else if (activeTab === 'research') {
            if(contentDiv.innerHTML === '' || !document.getElementById('research-grid')) {
                 this.renderMineResearch(contentDiv);
            }
        } else {
             if(contentDiv.innerHTML === '' || !document.getElementById('diamond-shop-grid-inner')) {
                this.renderDiamondShopContent(contentDiv);
             }
        }
    }

    switchMineTab(tabName) {
        this.game.diamondMineView = tabName;
        const contentDiv = document.getElementById('mine-sub-content');
        if(contentDiv) contentDiv.innerHTML = ''; 
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

        const grid = document.getElementById('research-grid');
        const upgrades = [
            { id: 'durable_picks', name: 'Haltbare Spitzen', desc: '10% Chance pro Level, keine Spitzhacke zu verbrauchen.', icon: '⛏️', max: 5, baseCost: 5 },
            { id: 'fossil_scanner', name: 'Fossilien-Scanner', desc: 'Erhöht die Chance, Fossilien in Steinen zu finden.', icon: '🦖', max: 5, baseCost: 10 },
            { id: 'explosive_yield', name: 'Sprengmeister', desc: 'TNT deckt Ressourcen besser auf (Test-Upgrade).', icon: '🧨', max: 3, baseCost: 20 }
        ];

        upgrades.forEach(u => {
            const currentLvl = this.game.gameState.mineResearch[u.id] || 0;
            const cost = Math.floor(u.baseCost * Math.pow(1.5, currentLvl));
            const isMaxed = currentLvl >= u.max;
            const canAfford = this.game.gameState.fossilien >= cost;

            const div = document.createElement('div');
            div.className = `info-upgrade-item ${isMaxed ? 'purchased' : (canAfford ? 'available' : 'locked')}`;
            div.innerHTML = `
                <div style="font-size:2em; margin-bottom:5px;">${u.icon}</div>
                <h4>${u.name} (Lv. ${currentLvl}/${u.max})</h4>
                <p style="font-size:0.85em; min-height:40px;">${u.desc}</p>
                <button class="btn-buy-research" ${isMaxed || !canAfford ? 'disabled' : ''} 
                        style="width:100%; margin-top:5px; background:${canAfford?'var(--color-primary)':'#444'}">
                    ${isMaxed ? 'MAX' : `Forschen (${cost} 🦖)`}
                </button>
            `;
            
            div.querySelector('button').onclick = () => {
                if (!isMaxed && canAfford) {
                    this.game.gameState.fossilien -= cost;
                    if(!this.game.gameState.mineResearch[u.id]) this.game.gameState.mineResearch[u.id] = 0;
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
        const diamondDisplay = this.game.getById('shop-diamanten-anzeige');
        if (diamondDisplay) diamondDisplay.innerText = this.game.formatNumber(this.game.gameState.diamanten);

        container.innerHTML = `<div class="info-grid" id="diamond-shop-grid-inner"></div>`;
        const innerGrid = this.game.getById('diamond-shop-grid-inner');
        if (!innerGrid) return;

        let shopHtml = '';
        diamondShopUpgrades.forEach((upgrade, index) => {
            const count = this.game.gameState.diamondShopPurchases[index] || 0;
            const isPurchased = count > 0;
            const isMaxed = upgrade.maxPurchases && count >= upgrade.maxPurchases;
            const canAfford = this.game.gameState.diamanten >= upgrade.cost;
            const stateClass = isMaxed ? 'purchased' : (canAfford ? 'available' : 'locked');
            const buttonText = isMaxed ? 'Gekauft' : `Kaufen (${this.game.formatNumber(upgrade.cost)} 💎)`;

            shopHtml += `
                <div class="info-upgrade-item ${stateClass}" data-id="${upgrade.id}">
                    <h4>${upgrade.name}</h4>
                    <p>${upgrade.description}</p>
                    <p>Status: ${isMaxed ? 'Permanent' : 'Verfügbar'}</p>
                    <button class="btn-buy-diamond" data-id="${upgrade.id}" ${isMaxed || !canAfford ? 'disabled' : ''}>
                        ${buttonText}
                    </button>
                </div>
            `;
        });
        innerGrid.innerHTML = shopHtml;
        innerGrid.querySelectorAll('.btn-buy-diamond').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id, 10);
                this.game.buyDiamondShopUpgrade(id);
            });
        });
    }

    renderDiamondMinigame(targetContainer) {
        const container = targetContainer || document.getElementById('minigame-placeholder');
        const finalContainer = container || document.getElementById('mine-sub-content');
        if (!finalContainer) return;

        if (!this.game.gameState.mineGrid || this.game.gameState.mineGrid.length === 0) {
            this.generateMineGrid();
        }

        // 1. Grundgerüst bauen
        if (!document.getElementById('mine-interface-wrapper')) {
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
            document.getElementById('tool-pickaxe').onclick = () => { this.game.gameState.selectedTool = 'pickaxe'; this.updateMineVisuals(); };
            document.getElementById('tool-tnt').onclick = () => { this.game.gameState.selectedTool = 'tnt'; this.updateMineVisuals(); };
            document.getElementById('tool-drill').onclick = () => { this.game.gameState.selectedTool = 'drill'; this.updateMineVisuals(); };
        }

        // 2. Steine rendern
        const gridArea = document.getElementById('mine-grid-area');
        if (gridArea && gridArea.children.length === 0) {
            this.game.gameState.mineGrid.forEach((tile, index) => {
                const tileDiv = document.createElement('div');
                tileDiv.id = `mine-tile-${index}`;
                tileDiv.className = 'mine-tile';
                if (tile.revealed) {
                    tileDiv.className += ' revealed';
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
        if (this.game.diamondMineView !== 'mine') return;
        if (!document.getElementById('mine-interface-wrapper')) return;

        const state = this.game.gameState;
        const inv = state.mineInventory;
        const currentTool = state.selectedTool || 'pickaxe';
        const isTreasure = state.isTreasureRoom;

        const titleEl = document.getElementById('mine-title');
        const subEl = document.getElementById('mine-subtitle');
        if(titleEl) {
            titleEl.innerText = isTreasure ? '👑 SCHATZKAMMER' : `⛏️ Ebene ${state.mineDepth}`;
            titleEl.style.color = isTreasure ? '#FFD700' : '#009ffd';
        }
        if(subEl) subEl.innerText = isTreasure ? 'Alles einsammeln!' : 'Finde den Ausgang 🚪';

        this.safeText('qty-pickaxe', inv.pickaxe);
        this.safeText('qty-tnt', inv.tnt);
        this.safeText('qty-drill', inv.drill);

        this.updateToolBtn('tool-pickaxe', 'pickaxe', currentTool);
        this.updateToolBtn('tool-tnt', 'tnt', currentTool);
        this.updateToolBtn('tool-drill', 'drill', currentTool);

        const gridArea = document.getElementById('mine-grid-area');
        if (gridArea) gridArea.style.borderColor = isTreasure ? "#FFD700" : "transparent";

        state.mineGrid.forEach((tile, index) => {
            const tileDiv = document.getElementById(`mine-tile-${index}`);
            if (!tileDiv) return;

            const newClass = `mine-tile ${tile.revealed ? 'revealed' : 'hidden'}`;
            if (tileDiv.className !== newClass) tileDiv.className = newClass;

            if (tile.revealed) {
                const newHTML = this.getTileSymbol(tile.type);
                if (tileDiv.innerHTML !== newHTML) tileDiv.innerHTML = newHTML;
                tileDiv.title = "";
            } else {
                if (tileDiv.innerHTML !== '') tileDiv.innerHTML = '';
                let tip = "";
                if (currentTool === 'tnt') tip = "Sprengen (3x3)";
                else if (currentTool === 'drill') tip = "Bohren (Zeile)";
                if (tileDiv.title !== tip) tileDiv.title = tip;
            }
        });
    }

    reloadMineLevel() {
        this.game.gameState.mineGrid = []; 
        this.generateMineGrid();
        const gridArea = document.getElementById('mine-grid-area');
        if(gridArea) gridArea.innerHTML = ''; 
        const contentDiv = document.getElementById('mine-sub-content');
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
        switch(type) {
            case 'stone': return '<span class="loot-stone">🪨</span>';
            case 'emerald': return '<span class="loot-emerald">💚</span>'; // <-- NEU
            case 'diamond': return '<span class="loot-diamond">💎</span>';
            case 'gold': return '<span class="loot-gold">💰</span>';
            case 'treasure': return '<span class="loot-diamond">🎁</span>';
            case 'passage': return '<span class="loot-passage">🚪</span>';
            case 'secret_passage': return '<span class="loot-passage">🕳️</span>';
            case 'tool_tnt': return '<span>🧨</span>';
            case 'tool_drill': return '<span>🔩</span>';
            case 'fossil': return '<span class="loot-fossil">🦖</span>';
            case 'artifact': return '<span>🏺</span>';
            default: return '';
        }
    }

    // Zeigt Text genau über einem Stein an
    showLootText(index, text, color) {
        const tile = document.getElementById(`mine-tile-${index}`);
        if (!tile) return;
        
        const rect = tile.getBoundingClientRect();
        const el = document.createElement('div');
        el.className = 'floating-text'; // Nutzt dein existierendes CSS
        el.innerText = text;
        
        // Positionierung: Mitte des Steins
        el.style.left = (rect.left + rect.width / 2) + 'px';
        el.style.top = (rect.top + rect.height / 2) + 'px';
        el.style.color = color || '#fff';
        el.style.zIndex = "2000"; // Über allem anderen
        
        document.body.appendChild(el);
        
        // Animation (hochschweben und verblassen)
        el.animate([
            { transform: 'translate(-50%, -50%) translateY(0)', opacity: 1 },
            { transform: 'translate(-50%, -50%) translateY(-40px)', opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        });

        setTimeout(() => el.remove(), 1000);
    }
}

// ================================================================================================================
// === SUB-SYSTEM: GUILD SYSTEM (Mit Söldner-Feature) ===
// ================================================================================================================
class GuildSystem {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.guildView = 'shop'; 
        this.selectedMercenaryId = null; // Welcher Söldner ist gerade ausgewählt?
        this.currentGuildBank = 0;
        console.log("⚔️ GuildSystem + Söldner geladen.");
        this.upgradeDefinitions = guildUpgradesData;
        setInterval(() => {
            const modal = document.getElementById('guilds-modal'); // Prüfen, ob Gilden-Fenster offen ist
            if (modal && modal.style.display === 'flex' && this.guildView === 'quests') {
            this.renderGuildsContent();
            }
        }, 60000); // Alle 60 Sekunden
    }

    // --- SÖLDNER LOGIK ---

    getMercenaryBonus(merc) {
        // Basis-Bonus: 10% mehr pro Level
        let multiplier = 1 + ((merc.level - 1) * 0.10);
        return multiplier;
    }

    recruitMercenary() {
        const state = this.game.gameState;
        // Kosten: 1 Mrd * Anzahl Söldner
        const cost = 1000000000 * (state.guildMercenaries.length + 1);
        
        if (state.aktuelle_smileys < cost) {
            this.game.showNotification("❌ Nicht genug Smileys zum Anheuern!", "error");
            return;
        }
        if (state.guildMercenaries.length >= 5) { // Max 5 Söldner
            this.game.showNotification("Deine Kaserne ist voll (Max 5)!", "error");
            return;
        }

        state.aktuelle_smileys -= cost;

        const names = ["Geralt", "Xena", "Arthur", "Merlin", "Robin", "Buffy", "Conan", "Viking"];
        const types = ['scout', 'miner', 'fighter']; // Scout=SmileyBonus, Miner=DiaBonus, Fighter=Schneller
        
        const newMerc = {
            id: 'merc_' + Date.now(),
            name: names[Math.floor(Math.random() * names.length)],
            level: 1,
            xp: 0,
            maxXp: 100,
            type: types[Math.floor(Math.random() * types.length)],
            status: 'idle',
            questId: null
        };

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
            { name: "Gewöhnlich", multi: 1, color: "#fff", chance: 0.6, failRisk: 0.05 },
            { name: "Selten", multi: 3, color: "#009ffd", chance: 0.3, failRisk: 0.15 },
            { name: "Episch", multi: 8, color: "#9c27b0", chance: 0.09, failRisk: 0.30 },
            { name: "Legendär", multi: 20, color: "#ff9800", chance: 0.01, failRisk: 0.50 }
        ];

        // NEU: Unsere 3 Spezialisierungen
        const questFocuses = [
            { id: 'gold', prefix: "💰", chance: 0.4 },
            { id: 'gems', prefix: "💎", chance: 0.3 },
            { id: 'exp',  prefix: "⚔️", chance: 0.3 }
        ];

        while (state.guildAvailableQuests.length < 5) {
            // 1. Seltenheit auswürfeln
            const r = Math.random();
            let rarity = rarities[0];
            if (r > 0.99) rarity = rarities[3];
            else if (r > 0.90) rarity = rarities[2];
            else if (r > 0.60) rarity = rarities[1];

            // 2. Fokus auswürfeln
            const rFocus = Math.random();
            let focus = questFocuses[0];
            if (rFocus > 0.7) focus = questFocuses[2];
            else if (rFocus > 0.4) focus = questFocuses[1];

            const duration = Math.floor(Math.random() * 300) + 60; // 1 bis 6 Minuten
            const loc = guildQuestData.locations[Math.floor(Math.random() * guildQuestData.locations.length)];
            const act = guildQuestData.actions[Math.floor(Math.random() * guildQuestData.actions.length)];
            
            // Name bekommt jetzt ein passendes Icon davor!
            let name = `${focus.prefix} ${loc} ${act}`;

            // 3. BELOHNUNGEN VERTEILEN
            let r_smileys = 0;
            let r_diamonds = 0;
            let r_gems = 0;
            let r_guildXP = 10 * rarity.multi;
            let r_mercXP = 25 * rarity.multi;

            if (focus.id === 'gold') {
                // MASSIV Smileys & Gilden-XP
                r_smileys = Math.max(100, Math.floor((state.totalSPS || 0) * duration * 0.8 * rarity.multi));
                r_guildXP = Math.floor(r_guildXP * 1.5);
            } else if (focus.id === 'gems') {
                // DIAMANTEN & GEMS (Keine Smileys)
                r_diamonds = Math.floor((Math.random() * 3 + 2) * rarity.multi); 
                if (rarity.name === "Episch" || rarity.name === "Legendär") {
                    r_gems = Math.floor((Math.random() * 2 + 1) * rarity.multi * 0.5); // Gems nur bei seltenen Quests!
                }
                r_smileys = Math.floor((state.totalSPS || 0) * duration * 0.05 * rarity.multi); // Nur ein kleines Taschengeld
            } else if (focus.id === 'exp') {
                // MASSIV SÖLDNER XP (Für Level-Ups)
                r_mercXP = Math.floor(r_mercXP * 3);
                r_smileys = Math.floor((state.totalSPS || 0) * duration * 0.1 * rarity.multi);
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
                    mercXP: r_mercXP
                },
                assignedMerc: null,
                startTime: null
            });
        }
    }

    completeQuest(quest) {
    const state = this.game.gameState;
    const merc = state.guildMercenaries.find(m => m.id === quest.assignedMerc);
    if (!merc) return;

    // 1. Level-Bonus berechnen (Risiko-Reduktion)
    // Wir holen uns das Scaling aus der data.js oder nutzen 2% als Fallback
    const classData = guildQuestData.classes[merc.type] || { levelScaling: 0.02 };
    const levelRiskReduction = (merc.level - 1) * classData.levelScaling;
    
    // Finales Risiko: Basis-Risiko der Quest minus Level-Bonus
    const finalRisk = Math.max(0.01, quest.failRisk - levelRiskReduction); 

    const failRoll = Math.random();
    
    if (failRoll < finalRisk) {
        // --- FEHLSCHLAG: Verletzung ---
        merc.status = 'recovering';
        merc.recoveryUntil = Date.now() + (1000 * 60 * 15); // 15 Min Pause
        this.game.showNotification(`${merc.name} wurde verletzt! Risiko war ${Math.round(finalRisk * 100)}%`, "error");
    } else {
        // --- ERFOLG: Belohnungen & XP ---
        this.applyQuestRewards(quest.rewards);
        
        // Söldner-XP verarbeiten
        merc.xp = (merc.xp || 0) + quest.rewards.mercXP;
        merc.xpNeeded = merc.xpNeeded || 100;

        if (merc.xp >= merc.xpNeeded) {
            merc.level = (merc.level || 1) + 1;
            merc.xp = 0;
            merc.xpNeeded = Math.floor(merc.xpNeeded * 1.5);
            this.game.showNotification(`LEVEL UP! ${merc.name} ist nun Level ${merc.level}!`, "success");
        }
        
        merc.status = 'idle';
        this.game.showNotification(`${merc.name} war erfolgreich!`, "success");
    }

    state.guildActiveQuests = state.guildActiveQuests.filter(q => q.id !== quest.id);
    this.game.speichereSpiel();
    this.renderGuildsContent();
}

    assignMercenaryToQuest(questId) {
        const state = this.game.gameState; // KORRIGIERT
        
        if (!this.selectedMercenaryId) {
            this.game.showNotification("Wähle erst einen Söldner aus!", "error"); // KORRIGIERT
            return;
        }
        const merc = state.guildMercenaries.find(m => m.id === this.selectedMercenaryId);
        if (!merc || merc.status !== 'idle') {
            this.game.showNotification("Dieser Söldner ist beschäftigt!", "error"); // KORRIGIERT
            return;
        }

        const questIndex = state.guildAvailableQuests.findIndex(q => q.id === questId);
        if (questIndex === -1) return;
        const quest = state.guildAvailableQuests[questIndex];

        // KLASSEN-BONI ANWENDEN
        if (merc.type === 'fighter') {
            quest.duration = Math.floor(quest.baseDuration * 0.8);
        }
        if (merc.type === 'scout') {
            quest.rewards.guildXP = Math.floor(quest.rewards.guildXP * 1.5);
        }
        if (merc.type === 'miner') {
            if (quest.rewards.diamonds > 0) quest.rewards.diamonds += Math.max(1, Math.floor(quest.rewards.diamonds * 0.2));
            if (quest.rewards.gems > 0) quest.rewards.gems += Math.max(1, Math.floor(quest.rewards.gems * 0.2));
        }

        quest.assignedMerc = merc.id;
        quest.startTime = Date.now();
        quest.notified = false;
        
        merc.status = 'busy';
        merc.questId = quest.id;

        if (!state.guildActiveQuests) state.guildActiveQuests = [];
        state.guildActiveQuests.push(quest);
        state.guildAvailableQuests.splice(questIndex, 1);

        this.selectedMercenaryId = null; 
        if (typeof this.renderGuildsContent === 'function') this.renderGuildsContent();
        this.game.speichereSpiel(); // KORRIGIERT
        this.game.showNotification(`${merc.name} ist aufgebrochen!`, "success"); // KORRIGIERT
    }

    claimQuest(questId) {
    const state = this.game.gameState;
    const index = state.guildActiveQuests.findIndex(q => q.id === questId);
    if (index === -1) return;
    
    const quest = state.guildActiveQuests[index];
    const merc = state.guildMercenaries.find(m => m.id === quest.assignedMerc);

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
            this.game.showNotification(`${merc.name} ist nun Level ${merc.level}!`, "success");
        }
        merc.status = 'idle';
        merc.questId = null;
    }
    
    // Gilden XP hinzufügen
    this.addGuildXP(quest.rewards.guildXP);

    // 3. Währungen auszahlen
    this.game.addSmileys(quest.rewards.smileys);
    state.diamanten += quest.rewards.diamonds;
    state.gems += (quest.rewards.gems || 0); // Die neuen Gems!

    // 4. Feedback & Speichern
    this.game.showNotification(`Mission abgeschlossen! +${this.game.formatNumber(quest.rewards.smileys)} ☺, +${quest.rewards.diamonds} 💎, +${quest.rewards.gems || 0} ✨`, "success");
    
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
        if(!state.guildMercenaries) state.guildMercenaries = []; 
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
            this.game.gameState.guildXPReq = Math.floor(this.game.gameState.guildXPReq * 1.5);
            leveledUp = true;
        }
        if (leveledUp) {
            this.game.showNotification(`🆙 GILDEN LEVEL UP! Stufe ${this.game.gameState.guildLevel}`, 'success');
            this.game.applyAllBoni();
        }
        this.renderGuildsContent();
        this.game.speichereSpiel();
    }

    startGuildBoss() {
        const state = this.game.gameState;
        if (state.guildBossFighting || !state.guildName || typeof firebase === 'undefined') return;

        const safeGuildName = state.guildName.replace(/\s+/g, '_');
        const bossRef = firebase.database().ref(`guilds/${safeGuildName}/boss`);

        const level = state.guildBossLevel || 1;
        const hp = Math.floor(1000000000 * Math.pow(3.0, level - 1));

        // Wir informieren den Server: "Der Bosskampf hat JETZT begonnen!"
        bossRef.update({
            hp: hp,
            maxHp: hp,
            level: level,
            isFighting: true,
            startTime: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            this.game.showNotification("⚔️ Boss-Raid gestartet! Alle Mann Angriff!", "success");
        });

        // Lokaler Timer für das flüssige UI (zählt einfach die Sekunden runter)
        if (this.game.bossInterval) clearInterval(this.game.bossInterval);
        this.game.bossInterval = setInterval(() => {
            if (!state.guildBossFighting) {
                clearInterval(this.game.bossInterval);
                return;
            }
            
            state.guildBossTimer -= 1;
            const timerDisplay = this.game.getById('boss-timer-display');
            if (timerDisplay) timerDisplay.innerText = Math.max(0, state.guildBossTimer) + "s";
            
            if (state.guildBossTimer <= 0) {
                this.endGuildBoss(false);
            }
        }, 1000);
        this.game.chatSystem.sendGuildSystemMessage(`${state.username} hat den Gilden-Boss (Lv. ${level}) herausgefordert! ⚔️`);
    }

    clickGuildBoss(e) {
        const state = this.game.gameState;
        if (!state.guildBossFighting || !state.guildName) return;

        const bossIcon = document.getElementById('guild-boss-clicker');
        
        // --- SCHADEN BERECHNEN ---
        let rawClick = this.game.getClickStrength();
        let damage = Math.ceil(rawClick * 0.0001); 
        let mercBonus = 0;
        if (state.guildMercenaries) {
            state.guildMercenaries.forEach(merc => {
                if (merc.status === 'idle') mercBonus += (merc.level * 0.001 * rawClick);
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
            bossIcon.classList.remove('boss-hit-shake', 'boss-crit-shake');
            void bossIcon.offsetWidth; // Trigger Reflow
            bossIcon.classList.add(isCrit ? 'boss-crit-shake' : 'boss-hit-shake');
        }

        // Floating Text (Nutzt Gildenfarben: Gold für Crit, Rot für Normal)
        if (e) {
            this.game.spawnFloatingText(e, damage, isCrit ? 'boss-damage crit' : 'boss-damage');
        }

        // --- SERVER SYNC ---
        const safeGuildName = state.guildName.replace(/\s+/g, '_');
        const bossHpRef = firebase.database().ref(`guilds/${safeGuildName}/boss/hp`);

        bossHpRef.transaction((currentHp) => {
            if (currentHp === null) return currentHp;
            const newHp = currentHp - damage;
            return newHp < 0 ? 0 : newHp;
        }).then((result) => {
            if (result.committed) {
                const finalHp = result.snapshot.val();
                state.guildBossHP = finalHp;
                this.updateBossUI();
                if (finalHp <= 0) this.endGuildBoss(true);
            }
        });
    }

    endGuildBoss(victory) {
        const state = this.game.gameState;
        if (!state.guildBossFighting || !state.guildName) return;

        clearInterval(this.game.bossInterval);
        state.guildBossFighting = false;

        const safeGuildName = state.guildName.replace(/\s+/g, '_');
        const bossRef = firebase.database().ref(`guilds/${safeGuildName}/boss`);

        if (victory) {
            const reward = state.guildBossLevel * 10;
            state.diamanten += reward;
            
            // Dem Server sagen, dass der Boss tot ist, das Level steigt und der Cooldown beginnt
            bossRef.update({
                isFighting: false,
                level: state.guildBossLevel + 1,
                lastDefeatTime: firebase.database.ServerValue.TIMESTAMP
            });

            this.game.chatSystem.sendGuildSystemMessage(`🏆 DER BOSS WURDE BESIEGT! Die Gilde feiert einen glorreichen Sieg!`);
        } else {
            // Dem Server sagen, dass die Zeit um ist
            bossRef.update({
                isFighting: false
            });
            this.game.chatSystem.sendGuildSystemMessage(`💀 Der Boss war zu stark... Wir müssen trainieren und es erneut versuchen.`);
        }
        
        this.game.updateUI();
        this.renderGuildsContent();
        this.game.speichereSpiel();
    }

    updateBossUI() {
        const hpBar = this.game.getById('boss-hp-bar');
        const hpText = this.game.getById('boss-hp-text');
        const state = this.game.gameState;
        if (hpBar && hpText) {
            const pct = Math.max(0, (state.guildBossHP / state.guildBossMaxHP) * 100);
            hpBar.style.width = `${pct}%`;
            hpText.innerText = `${this.game.formatNumber(state.guildBossHP)} / ${this.game.formatNumber(state.guildBossMaxHP)}`;
        }
    }

    checkBossAlarm() {
    const state = this.game.gameState;
    if (state.guildBossFighting || Notification.permission !== "granted") return;

    const now = Date.now();
    const cooldown = 30 * 60 * 1000; 
    const nextSpawn = (state.lastBossDefeatTime || 0) + cooldown;
    const timeLeft = nextSpawn - now;

    // 1. Warnung: 5 Minuten vorher
    if (timeLeft <= 300000 && timeLeft > 299000 && !this.bossWarned5Min) {
        this.bossWarned5Min = true;
        new Notification("Gilden-Alarm! 📢", { body: "Boss-Raid in 5 Minuten!", icon: "smiley.png" });
    }

    // 2. Start-Meldung & RESET der Warn-Flags
    if (timeLeft <= 0) {
        if (!this.bossStartNotified) {
            this.bossStartNotified = true;
            new Notification("DER BOSS IST DA! 👹", { body: "Angriff möglich!", icon: "smiley.png" });
        }
    } else {
        // Falls timeLeft > 0 (Boss ist noch im Cooldown), 
        // stellen wir sicher, dass das Start-Flag für den nächsten Spawn bereit ist
        this.bossStartNotified = false;
    }
}
    // --- RENDER LOGIK (Mit Söldner UI) ---

    renderGuildsContent() {
        const container = this.game.getById('guilds-content');
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
                    <button id="found-guild-button" class="btn-confirm" ${canAfford ? '' : 'disabled'} style="width:70%;">Gilde Gründen</button>
                </div>
            `;

            const foundBtn = this.game.getById('found-guild-button');
            if (foundBtn) {
                foundBtn.onclick = () => {
                    const input = this.game.getById('guild-name-input');
                    const val = input ? input.value : "";
                    if(val.length > 2) this.foundGuild(val);
                };
            }
            const closeBtn = this.game.getById('btn-close-guild-empty');
            if (closeBtn) closeBtn.onclick = () => document.getElementById('guilds-modal').style.display = 'none';
            return;
        }

        // --- NAVIGATION (MIT FESTEM X-BUTTON) ---
        let tabsHtml = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #444; padding-bottom:15px;">
                <div style="display:flex; gap:10px; flex:1;">
                    <button id="tab-guild-shop" class="btn-primary ${this.guildView==='shop'?'':'btn-cancel'}" style="flex:1">Zentrale</button>
                    <button id="tab-guild-boss" class="btn-primary ${this.guildView==='boss'?'':'btn-cancel'}" style="flex:1">Boss Raid</button>
                    <button id="tab-guild-quests" class="btn-primary ${this.guildView==='quests'?'':'btn-cancel'}" style="flex:1">Söldner</button>
                </div>
                <button id="btn-close-guild-modal" style="background:transparent; border:none; color:#aaa; font-size:2.5rem; cursor:pointer; margin-left:15px; line-height:0.5;">&times;</button>
            </div>
        `;

        let contentHtml = '';

        // ==========================================
        // ANSICHT: ZENTRALE
        // ==========================================
        if (this.guildView === 'shop') {
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

            const progressPct = Math.min(100, (state.guildXP / state.guildXPReq) * 100);
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
                if(this.game.chatSystem) this.game.chatSystem.startGuildMemberListener(); 
                this.renderGuildUpgradesList();
            }, 50);
        }

        // ==========================================
        // ANSICHT: BOSS RAID
        // ==========================================
        else if (this.guildView === 'boss') {
            const now = Date.now();
            const cooldownTime = 30 * 60 * 1000;
            const nextAvailable = (state.lastBossDefeatTime || 0) + cooldownTime;
            const canFight = now >= nextAvailable;

            if (state.guildBossFighting) {
                const pct = Math.max(0, (state.guildBossHP / state.guildBossMaxHP) * 100);
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
                    const nextHp = Math.floor(5000000 * Math.pow(2.0, state.guildBossLevel - 1));
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
                            <p>Nächster Spawn in: <strong id="boss-cooldown-timer" style="color:#009ffd;">${mins}:${secs < 10 ? '0' : ''}${secs}</strong></p>
                        </div>`;
                }
            }
        } 
        
        // ==========================================
        // ANSICHT: SÖLDNER & QUESTS
        // ==========================================
        else if (this.guildView === 'quests') {
            if (!state.guildMercenaries) state.guildMercenaries = [];
            this.generateGuildQuests();

            const hasIdleMercs = state.guildMercenaries.some(m => m.status === 'idle');

            // 1. Söldner-Übersicht
            let recruitBtnHtml = state.guildMercenaries.length < 5 
                ? `<button id="btn-recruit" class="btn-confirm" style="font-size:0.8em; padding:8px 15px;">+ Anheuern (${this.game.formatNumber(1000000000 * (state.guildMercenaries.length + 1))})</button>` 
                : '';

            let mercHtml = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h4 style="margin:0;">Deine Kasernen (${state.guildMercenaries.length}/5)</h4>
                    ${recruitBtnHtml}
                </div>
                <div style="display:flex; gap:15px; overflow-x:auto; padding-bottom:10px; margin-bottom:20px;">`;

            state.guildMercenaries.forEach(merc => {
                const isSelected = this.selectedMercenaryId === merc.id;
                const isBusy = merc.status === 'busy';
                const isRecovering = merc.status === 'recovering';
                
                let statusText = isBusy ? 'Unterwegs' : 'Bereit';
                let statusColor = isBusy ? '#ff5252' : '#aaa';
                let statusIcon = isBusy ? '⏳' : '💤';

                if (isRecovering) {
                    const remainingMin = Math.ceil(((merc.recoveryUntil || 0) - Date.now()) / 60000);
                    if (remainingMin > 0) {
                        statusText = `Verletzt (${remainingMin}m)`;
                        statusColor = '#ff4444';
                        statusIcon = '🩹';
                    } else {
                        merc.status = 'idle';
                        statusText = 'Bereit';
                        statusColor = '#aaa';
                        statusIcon = '💤';
                    }
                }

                let typeIcon = merc.type === 'scout' ? '🏹' : (merc.type === 'miner' ? '⛏️' : '⚔️');
                const borderColor = isSelected ? '#009ffd' : '#333';
                const bgColor = isSelected ? 'rgba(0, 159, 253, 0.1)' : 'rgba(255,255,255,0.03)';
                const isClickable = !isBusy && !isRecovering;

                mercHtml += `
                    <div class="mercenary-card ${isSelected ? 'active-merc' : ''}" data-id="${merc.id}" 
                         style="min-width:130px; background:${bgColor}; border:2px solid ${borderColor}; padding:15px; border-radius:12px; cursor:${isClickable ? 'pointer' : 'default'}; text-align:center;">
                        <div style="font-size:2.5em; margin-bottom:5px;">${typeIcon}</div>
                        <div style="font-weight:bold;">${merc.name}</div>
                        <div style="font-size:0.8em; color:#FFD700;">Level ${merc.level}</div>
                        <div style="font-size:0.75em; color:${statusColor}; font-weight:bold; margin-top:3px;">${statusIcon} ${statusText}</div>
                        
                        <div class="xp-bar-outer" style="background:#222; height:18px; margin-top:10px; border-radius:9px; position:relative; overflow:hidden; border:1px solid #444;">
                            <div style="width:${(merc.xp / (merc.maxXp || merc.xpNeeded)) * 100}%; height:100%; background:linear-gradient(90deg, #4CAF50, #8BC34A); transition: width 0.3s ease;"></div>
                            <div style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:10px; color:white; font-weight:bold; text-shadow:1px 1px 2px black;">
                                ${Math.floor(merc.xp)} / ${merc.maxXp || merc.xpNeeded}
                            </div>
                        </div>
                    </div>`;
            });
            mercHtml += `</div>`;

            // 2. Aktive Quests
            let activeQuestsHtml = '';
            if (state.guildActiveQuests && state.guildActiveQuests.length > 0) {
                activeQuestsHtml = `<h4 style="margin:0 0 10px 0; color:#009ffd;">Laufende Missionen</h4><div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:15px; margin-bottom:20px;">`;
                
                state.guildActiveQuests.forEach(q => {
                    const merc = state.guildMercenaries.find(m => m.id === q.assignedMerc);
                    const elapsed = (Date.now() - q.startTime) / 1000;
                    const timeLeft = Math.max(0, Math.ceil(q.duration - elapsed));
                    const isDone = timeLeft <= 0;
                    const progress = Math.min(100, (elapsed / q.duration) * 100);
                    const progressColor = isDone ? '#4CAF50' : '#00C897'; 

                    activeQuestsHtml += `
                        <div style="background:rgba(0,0,0,0.4); border:1px solid #333; border-left:4px solid ${progressColor}; padding:15px; border-radius:10px;">
                            <div style="font-weight:bold;">${q.name}</div>
                            <div style="font-size:0.85em; color:#ccc;">Held: <span style="color:#009ffd;">${merc ? merc.name : '???'}</span></div>
                            <div style="background:#1a1a1a; height:8px; margin:8px 0; border-radius:4px; overflow:hidden;">
                                <div id="bar-quest-${q.id}" style="width:${progress}%; height:100%; background:${progressColor}; transition:width 0.5s linear;"></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span id="timer-quest-${q.id}" style="color:${isDone ? '#4CAF50' : '#aaa'}; font-size:0.85em;">
                                    ${isDone ? '✅ Abgeschlossen!' : `⏳ Noch ${timeLeft}s`}
                                </span>
                                ${isDone ? `<button class="btn-confirm btn-claim-quest" data-id="${q.id}">Einsammeln</button>` : ''}
                            </div>
                        </div>`;
                });
                activeQuestsHtml += `</div>`;
            }

            // 3. Verfügbare Quests (Nur anzeigen, wenn Söldner frei sind!)
            let availableQuestsHtml = '';
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

                state.guildAvailableQuests.forEach(q => {
                    let rewardHtml = '';
                    if (q.rewards.smileys > 0) rewardHtml += `<span style="background:rgba(255,215,0,0.1); color:#FFD700; padding:2px 6px; border-radius:4px; margin-right:5px; display:inline-block; margin-bottom:4px; font-size:0.85em;">${this.game.formatNumber(q.rewards.smileys)} 🪙</span>`;
                    if (q.rewards.diamonds > 0) rewardHtml += `<span style="background:rgba(0,159,253,0.1); color:#009ffd; padding:2px 6px; border-radius:4px; margin-right:5px; display:inline-block; margin-bottom:4px; font-size:0.85em;">${q.rewards.diamonds} 💎</span>`;
                    if (q.rewards.gems > 0) rewardHtml += `<span style="background:rgba(224,64,251,0.1); color:#e040fb; padding:2px 6px; border-radius:4px; margin-right:5px; display:inline-block; margin-bottom:4px; font-size:0.85em;">${q.rewards.gems} ✨</span>`;
                    rewardHtml += `<span style="background:rgba(76,175,80,0.1); color:#4CAF50; padding:2px 6px; border-radius:4px; margin-right:5px; display:inline-block; margin-bottom:4px; font-size:0.85em;">${q.rewards.mercXP} XP</span>`;

                    const canStart = this.selectedMercenaryId !== null;
                    const buttonStyle = canStart ? `background:#009ffd; color:#fff;` : `background:#333; color:#777;`;

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
                            <button class="btn-assign-quest" data-id="${q.id}" ${canStart ? '' : 'disabled'} 
                                style="${buttonStyle} width:100%; border:none; padding:12px; border-radius:6px; font-weight:bold; cursor:pointer; text-transform:uppercase; font-size:0.9em;">
                                ${canStart ? '🚀 Entsenden' : 'Söldner wählen'}
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

            contentHtml = mercHtml + activeQuestsHtml + availableQuestsHtml;
        }

        container.innerHTML = tabsHtml + contentHtml;

        // --- EVENT LISTENERS FÜR BUTTONS ---
        this.game.getById('tab-guild-shop')?.addEventListener('click', () => { this.guildView='shop'; this.renderGuildsContent(); });
        this.game.getById('tab-guild-boss')?.addEventListener('click', () => { this.guildView='boss'; this.renderGuildsContent(); });
        this.game.getById('tab-guild-quests')?.addEventListener('click', () => { this.guildView='quests'; this.renderGuildsContent(); });
        
        // Das reparierte X-Button Event
        this.game.getById('btn-close-guild-modal')?.addEventListener('click', () => {
            const modal = document.getElementById('guilds-modal');
            if (modal) modal.style.display = 'none';
        });

        if (this.guildView === 'boss') {
             this.game.getById('start-boss-btn')?.addEventListener('click', () => this.startGuildBoss());
             const bc = this.game.getById('guild-boss-clicker');
             if(bc) bc.addEventListener('mousedown', (e) => this.clickGuildBoss(e));
        }

        if (this.guildView === 'quests') {
            container.querySelectorAll('.mercenary-card').forEach(card => {
                const mercId = card.dataset.id;
                const merc = state.guildMercenaries.find(m => m.id === mercId);
                const isLocked = merc && (merc.status === 'busy' || merc.status === 'recovering');

                if (!isLocked) {
                    card.onclick = () => { 
                        this.selectedMercenaryId = mercId; 
                        this.renderGuildsContent(); 
                    };
                }
            });
            this.game.getById('btn-recruit')?.addEventListener('click', () => this.recruitMercenary());
            container.querySelectorAll('.btn-assign-quest').forEach(btn => btn.onclick = () => this.assignMercenaryToQuest(parseFloat(btn.dataset.id)));
            container.querySelectorAll('.btn-claim-quest').forEach(btn => btn.onclick = () => this.claimQuest(parseFloat(btn.dataset.id)));
            
            const refreshBtn = this.game.getById('btn-refresh-quests');
            if (refreshBtn) {
                refreshBtn.onclick = () => {
                    if ((state.diamanten || 0) >= 5) {
                        state.diamanten -= 5;
                        state.guildAvailableQuests = []; 
                        this.generateGuildQuests(true);  
                        this.game.speichereSpiel();
                        this.renderGuildsContent();
                        this.game.showNotification("Neue Aufträge eingetroffen!", "success");
                    } else {
                        this.game.showNotification("Nicht genug Diamanten für einen Refresh!", "error");
                    }
                };
            }
        }
    }

    toggleNotifications() {
    if (!("Notification" in window)) {
        this.game.showNotification("Dein Browser unterstützt keine Desktop-Notis.", "error");
        return;
    }

    // Abfrage der Berechtigung
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            this.game.showNotification("Gilden-Funk aktiviert! 🔔", "success");
            // Test-Notiz senden
            new Notification("Smiley Game", {
                body: "Gilden-Funk bereit! Ich melde mich, wenn Quests fertig sind.",
                icon: "smiley.png"
            });
        } else {
            this.game.showNotification("Berechtigung verweigert.", "error");
        }
        // UI aktualisieren, damit der Button-Text von "Deaktiviert" auf "Aktiviert" springt
        this.renderGuildsContent();
    });
}

    donateToProject(projectId, amount) {
        const state = this.game.gameState;
        
        if ((state.aktuelle_smileys || 0) < amount) {
            this.game.showNotification("Nicht genug Smileys zum Spenden!", "error");
            return;
        }

        if (!state.guildName || typeof firebase === 'undefined') return;

        if (amount >= 1000000000) {
        this.game.chatSystem.sendGuildSystemMessage(`💰 Großzügige Spende: ${state.username} hat ${this.game.formatNumber(amount)} Smileys investiert!`);
        }

        state.aktuelle_smileys -= amount;
        this.game.speichereSpiel();

        const safeGuildName = state.guildName.replace(/\s+/g, '_');
        const projectRef = firebase.database().ref(`guilds/${safeGuildName}/upgrades/${projectId}`);

        projectRef.transaction((currentData) => {
            let data = currentData || { level: 0, invested: 0 };
            if (typeof data === 'number') data = { level: data, invested: 0 };

            data.invested += amount;
            
            const def = this.upgradeDefinitions[projectId];
            let cost = Math.floor(def.baseCost * Math.pow(def.costFactor, data.level));
            
            while (data.invested >= cost) {
                data.invested -= cost;
                data.level += 1;
                cost = Math.floor(def.baseCost * Math.pow(def.costFactor, data.level));
            }
            
            return data;
        }).then((result) => {
            if (result.committed) {
                this.game.showNotification("Spende erfolgreich!", "success");
                
                // --- NEU: SPENDE DEM SPIELER GUTSCHREIBEN ---
                const memberRef = firebase.database().ref(`guilds/${safeGuildName}/members/${state.playerId}/donated`);
                // Wir nutzen wieder eine Transaction, um den Wert einfach hochzuzählen
                memberRef.transaction(current => (current || 0) + amount);

                if (this.guildView === 'shop' && this.renderGuildsContent) this.renderGuildsContent();
            }
        }).catch(err => {
            console.error("Fehler beim Spenden:", err);
            state.aktuelle_smileys += amount;
            this.game.speichereSpiel();
            this.game.showNotification("Netzwerkfehler: Smileys zurückerstattet.", "error");
        });
    }

    renderGuildUpgradesList() {
        const container = document.getElementById('guild-upgrades-list');
        if (!container) return;
        
        container.innerHTML = '';
        const state = this.game.gameState;
        const serverData = state.guildServerUpgrades || {}; 

        Object.keys(this.upgradeDefinitions).forEach(key => {
            const def = this.upgradeDefinitions[key];
            
            // Neue Struktur lesen (oder Standardwerte setzen)
            const projectData = serverData[key] || { level: 0, invested: 0 };
            const currentLevel = typeof projectData === 'object' ? (projectData.level || 0) : projectData;
            const invested = typeof projectData === 'object' ? (projectData.invested || 0) : 0;
            
            // Kosten berechnen
            const cost = Math.floor(def.baseCost * Math.pow(def.costFactor, currentLevel));
            const remaining = Math.max(0, cost - invested);
            const progressPct = Math.min(100, (invested / cost) * 100);

            const div = document.createElement('div');
            div.className = "guild-upgrade-card";
            div.style.cssText = "background:rgba(0,0,0,0.4); border:1px solid #444; border-radius:8px; padding:15px; margin-bottom:15px;";

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
            div.querySelectorAll('.btn-donate-project').forEach(btn => {
                btn.onclick = () => {
                    const type = btn.dataset.type;
                    let amountToDonate = 0;
                    
                    if (type === '10') {
                        amountToDonate = Math.floor((state.aktuelle_smileys || 0) * 0.1);
                    } else if (type === 'max') {
                        // Max Spende = Entweder alles was ich habe, oder nur so viel wie noch zum Level-Up fehlt
                        amountToDonate = Math.floor(Math.min(state.aktuelle_smileys || 0, remaining));
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
        if (typeof firebase === 'undefined' || !state.guildName) return;

        const safeGuildName = state.guildName.replace(/\s+/g, '_');
        const guildRef = firebase.database().ref(`guilds/${safeGuildName}`);

        console.log(`📡 Lausche auf Gilden-Daten für: ${safeGuildName}`);

        guildRef.on('value', (snapshot) => {
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
                        const elapsedSeconds = Math.floor((Date.now() - data.boss.startTime) / 1000);
                        state.guildBossTimer = Math.max(0, 30 - elapsedSeconds); 
                    }
                }
            }

            const display = document.getElementById('guild-bank-display');
            if (display) {
                display.innerText = this.game.formatNumber(this.currentGuildBank) + " Smileys";
            }

            this.game.applyAllBoni();
            this.game.updateUI();

            // WICHTIG: Das UI muss sich auch aktualisieren, wenn wir im Boss-Tab sind!
            if (this.guildView === 'shop' || this.guildView === 'boss') {
                this.renderGuildsContent();
            }
        });
    }

    buyGuildUpgrade(upgradeKey) {
    const state = this.game.gameState;
    if (!state.guildName || typeof firebase === 'undefined') return;

    const safeGuildName = state.guildName.replace(/\s+/g, '_');
    const guildRef = firebase.database().ref(`guilds/${safeGuildName}`);

    guildRef.transaction(currentData => {
        if (currentData) {
            const def = this.upgradeDefinitions[upgradeKey];
            const currentLevel = (currentData.upgrades && currentData.upgrades[upgradeKey]) || 0;
            const cost = Math.floor(def.baseCost * Math.pow(def.costFactor, currentLevel));

            if ((currentData.bank || 0) >= cost) {
                currentData.bank -= cost;
                if (!currentData.upgrades) currentData.upgrades = {};
                currentData.upgrades[upgradeKey] = currentLevel + 1;
            } else {
                return; // Abbruch, kein Geld (race condition protection)
            }
        }
        return currentData;
    }, (error, committed, snapshot) => {
        if (committed) {
            this.game.showNotification("Gilden-Upgrade gekauft! 🎉", "success");
            // Sound abspielen
            this.game.playLevelUpSound();
        } else {
            this.game.showNotification("Kauf fehlgeschlagen (Zu wenig Geld?)", "error");
        }
    });
}

}

// ================================================================================================================
// === SUB-SYSTEM: CHAT & FIREBASE ===
// ================================================================================================================
class ChatSystem {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.currentChatChannel = 'global';
        this.chatHistory = { global: [], guild: [] };
        this.chatListeners = {};
        this.chatRef = null;
        console.log("💬 ChatSystem geladen.");
    }

    initChat() {
        if (!this.game.gameState.chatSettings) {
            this.game.gameState.chatSettings = { muteGlobal: false, muteGuild: false };
        }

        if (typeof firebase === 'undefined' || !firebase.apps.length) {
            console.warn("Chat deaktiviert: Firebase fehlt.");
            return;
        }

        const btnGlobal = this.game.getById('btn-chat-global');
        const btnGuild = this.game.getById('btn-chat-guild');
        const btnMute = this.game.getById('btn-chat-mute');
        const sendBtn = this.game.getById('btn-chat-send');
        const inputField = this.game.getById('chat-input');
        const toggleBtn = this.game.getById('btn-chat-toggle');

        // 1. Tab-Logik
        if (btnGlobal && btnGuild) {
            btnGlobal.onclick = () => {
                this.currentChatChannel = 'global';
                this.updateChatTabsUI();
                this.renderChatHistory('global');
                this.switchChatChannel('global');
            };

            btnGuild.onclick = () => {
                if (!this.game.gameState.guildName) {
                    this.game.showNotification("Du bist in keiner Gilde!", "error");
                    return;
                }
                this.currentChatChannel = 'guild';
                this.updateChatTabsUI();
                this.renderChatHistory('guild');
                this.switchChatChannel('guild');
            };
        }

        // 2. Mute-Logik
        if (btnMute) {
            this.updateMuteButtonUI();
            btnMute.onclick = () => {
                const settings = this.game.gameState.chatSettings;
                if (this.currentChatChannel === 'global') {
                    settings.muteGlobal = !settings.muteGlobal;
                    this.game.showNotification(settings.muteGlobal ? "Global stumm 🔕" : "Global aktiv 🔔", "info");
                } else {
                    settings.muteGuild = !settings.muteGuild;
                    this.game.showNotification(settings.muteGuild ? "Gilde stumm 🔕" : "Gilde aktiv 🔔", "info");
                }
                this.updateMuteButtonUI();
                this.game.speichereSpiel();
            };
        }

        // 3. Minimieren
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                const container = document.getElementById('main-chat-container');
                if (container) {
                    container.classList.toggle('chat-minimized');
                    toggleBtn.innerText = container.classList.contains('chat-minimized') ? '➕' : '➖';
                }
            };
        }

        // 4. Senden & Enter/Tab
        if (sendBtn) sendBtn.onclick = () => this.sendChatMessage();
        if (inputField) {
            inputField.onkeydown = (e) => {
                if (e.key === 'Enter') this.sendChatMessage();
                if (e.key === 'Tab') {
                    e.preventDefault();
                    if (this.currentChatChannel === 'global') {
                        if (this.game.gameState.guildName && btnGuild) btnGuild.click();
                        else this.game.showNotification("Keine Gilde!", "error");
                    } else {
                        if (btnGlobal) btnGlobal.click();
                    }
                }
            };
        }

        this.setupChatNameChange();
        this.startBackgroundListeners();
        
        // Standard laden
        if (btnGlobal) btnGlobal.click();
        
        // Gilden-Liste starten falls vorhanden
        if (this.game.gameState.guildName) {
            this.startGuildMemberListener();
        }
    }

    switchChatChannel(type) {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) chatContainer.innerHTML = ''; 

        if (this.chatRef) this.chatRef.off();

        let path = 'chat/global';
        if (type === 'guild') {
            const safeName = this.game.gameState.guildName.replace(/\s+/g, '_');
            path = `chat/guilds/${safeName}`;
        }

        this.chatRef = firebase.database().ref(path);
        this.chatRef.limitToLast(20).on('child_added', (snapshot) => {
            const data = snapshot.val();
            if(data && data.text) this.displayChatMessage(data.user || data.sender, data.text, type, data.isSystem);
        });
    }

    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (text === "" || !this.chatRef) return;

        const msgData = {
            user: this.game.gameState.playerName,
            userId: this.game.gameState.playerId,
            text: text,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };

        this.chatRef.push(msgData).catch((err) => {
            console.error("Fehler beim Senden:", err);
            this.game.showNotification("Verbindungsfehler!", "error");
        });
        input.value = "";
    }

    displayChatMessage(user, text, type, isSystem = false) {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${type}`;
        const isMe = user === this.game.gameState.playerName;
        
        if (isSystem || user === "SYSTEM") {
            // Spezielles Styling für System-Nachrichten
            msgDiv.style.cssText = "color: #009ffd; font-style: italic; font-size: 0.85em; margin: 5px 0; border-left: 3px solid #009ffd; padding-left: 8px; background: rgba(0, 159, 253, 0.05); border-radius: 0 4px 4px 0;";
            msgDiv.innerText = `📢 ${text}`;
        } else {
            msgDiv.innerHTML = `<strong style="color:${isMe ? '#009ffd' : '#aaa'}">${user}:</strong> ${text}`;
        }

        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
    }

    startBackgroundListeners() {
        this.chatHistory = { global: [], guild: [] };
        
        const globalRef = firebase.database().ref('chat/global');
        globalRef.limitToLast(20).on('child_added', (snapshot) => {
            this.handleIncomingMessage('global', snapshot.val());
        });

        if (this.game.gameState.guildName) {
            const safeName = this.game.gameState.guildName.replace(/\s+/g, '_');
            const guildRef = firebase.database().ref(`chat/guilds/${safeName}`);
            guildRef.limitToLast(20).on('child_added', (snapshot) => {
                const data = snapshot.val();
                if (data && data.text) this.handleIncomingMessage('guild', data);
            });
        }
    }

    handleIncomingMessage(channel, data) {
        if (!data) return;
        const settings = this.game.gameState.chatSettings;
        const isGlobalMuted = settings ? settings.muteGlobal : false;
        const isGuildMuted = settings ? settings.muteGuild : false;

        if (channel === 'global' && isGlobalMuted) return;
        if (channel === 'guild' && isGuildMuted) return;

        if (!this.chatHistory[channel]) this.chatHistory[channel] = [];
        this.chatHistory[channel].push(data);
        if (this.chatHistory[channel].length > 50) this.chatHistory[channel].shift();

        // Roter Punkt Logik
        if (this.currentChatChannel !== channel) {
            const btnId = channel === 'global' ? 'btn-chat-global' : 'btn-chat-guild';
            const btn = document.getElementById(btnId);
            if (btn) btn.classList.add('has-notification');
        }
    }

    updateChatTabsUI() {
        const btnGlobal = document.getElementById('btn-chat-global');
        const btnGuild = document.getElementById('btn-chat-guild');

        if (this.currentChatChannel === 'global') {
            if(btnGlobal) { btnGlobal.classList.add('active'); btnGlobal.classList.remove('has-notification'); }
            if(btnGuild) btnGuild.classList.remove('active');
        } else {
            if(btnGuild) { btnGuild.classList.add('active'); btnGuild.classList.remove('has-notification'); }
            if(btnGlobal) btnGlobal.classList.remove('active');
        }
        this.updateMuteButtonUI();
    }

    updateMuteButtonUI() {
        const btnMute = document.getElementById('btn-chat-mute');
        if (!btnMute) return;
        const settings = this.game.gameState.chatSettings;
        let isMuted = (this.currentChatChannel === 'global') ? settings?.muteGlobal : settings?.muteGuild;

        if (isMuted) {
            btnMute.innerText = "🔕";
            btnMute.classList.add('muted');
        } else {
            btnMute.innerText = "🔔";
            btnMute.classList.remove('muted');
        }
    }

    renderChatHistory(channel) {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        container.innerHTML = '';
        if (this.chatHistory && this.chatHistory[channel]) {
            this.chatHistory[channel].forEach(msg => {
                this.displayChatMessage(msg.user, msg.text, channel);
            });
        }
        container.scrollTop = container.scrollHeight;
    }

    setupChatNameChange() {
        const nameSpan = document.getElementById('current-player-name');
        if (nameSpan && this.game.gameState.playerName) {
            nameSpan.innerText = this.game.gameState.playerName;
        }
        const displayElement = document.getElementById('chat-user-display');
        if (displayElement) {
            displayElement.onclick = () => {
                const newName = prompt("Wie möchtest du heißen?", this.game.gameState.playerName);
                if (newName && newName.trim().length > 0) {
                    this.game.gameState.playerName = newName.trim().substring(0, 15);
                    if (nameSpan) nameSpan.innerText = this.game.gameState.playerName;
                    this.game.speichereSpiel();
                    this.game.showNotification("Name geändert!", "success");
                }
            };
        }
    }

    // --- GILDEN MITGLIEDER LOGIK (War vorher in SmileyGame) ---

    syncGuildStats() {
        const state = this.game.gameState;
        if (!state.guildName || !state.playerId || typeof firebase === 'undefined') return;

        // Wir säubern den Namen für Firebase
        const safeGuildName = state.guildName.replace(/\s+/g, '_');
        
        // KORREKTUR: 'chat/' am Anfang entfernt. Jetzt passt es zu deinen Regeln!
        const myMemberRef = firebase.database().ref(`guilds/${safeGuildName}/members/${state.playerId}`);

        const myStats = {
            name: state.playerName,
            smileys: Math.floor(state.aktuelle_smileys || 0),
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        };

        myMemberRef.update(myStats).catch(err => console.warn("Gilden-Sync Fehler:", err));
    }

    startGuildMemberListener() {
        const state = this.game.gameState;
        if (typeof firebase === 'undefined' || !state.guildName) return; 

        const safeGuildName = state.guildName.replace(/\s+/g, '_');
        
        // KORREKTUR: 'chat/' am Anfang entfernt! Jetzt guckt er im richtigen Ordner.
        const membersRef = firebase.database().ref(`guilds/${safeGuildName}/members`);

        membersRef.on('value', (snapshot) => {
            const members = [];
            snapshot.forEach((child) => { members.push(child.val()); });
            
            // NEUE SORTIERUNG: Wer am meisten gespendet hat, ist Platz 1! 🏆
            members.sort((a, b) => (b.donated || 0) - (a.donated || 0));
            
            this.renderGuildMemberList(members);
        });
    }

    renderGuildMemberList(members) {
        const listBody = document.getElementById('guild-list-body');
        if (!listBody) return;
        listBody.innerHTML = '';

        members.forEach((member, index) => {
            const row = document.createElement('div');
            row.className = 'guild-member-row';
            // Sauberes Flex-Layout für die Spalten
            row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:8px 5px; border-bottom:1px solid rgba(255,255,255,0.05);";

            const isOnline = (Date.now() - member.lastSeen) < 5 * 60 * 1000;
            const statusIcon = isOnline ? '🟢' : '⚫';
            
            // Smileys formatieren
            let scoreDisplay = member.smileys;
            if (member.smileys >= 1000000000) scoreDisplay = (member.smileys / 1000000000).toFixed(2) + 'B';
            else if (member.smileys >= 1000000) scoreDisplay = (member.smileys / 1000000).toFixed(2) + 'M';
            else if (member.smileys >= 1000) scoreDisplay = (member.smileys / 1000).toFixed(1) + 'k';

            // Spenden formatieren
            let donatedDisplay = member.donated || 0;
            if (donatedDisplay >= 1000000000) donatedDisplay = (donatedDisplay / 1000000000).toFixed(2) + 'B';
            else if (donatedDisplay >= 1000000) donatedDisplay = (donatedDisplay / 1000000).toFixed(2) + 'M';
            else if (donatedDisplay >= 1000) donatedDisplay = (donatedDisplay / 1000).toFixed(1) + 'k';

            // Den eigenen Namen hervorheben
            const isMe = member.name === this.game.gameState.playerName ? 'color:#009ffd; font-weight:bold;' : 'color:#fff;';

            row.innerHTML = `
                <div style="flex:1; display:flex; gap:10px; align-items:center;">
                    <span style="color:#aaa; font-size:0.9em; width:20px;">#${index + 1}</span>
                    <span style="${isMe}">
                        ${statusIcon} ${member.name}
                    </span>
                </div>
                <div style="flex:1; text-align:right; display:flex; flex-direction:column; align-items:flex-end;">
                    <span style="color:#FFD700; font-size:0.9em;">🪙 ${scoreDisplay}</span>
                    <span style="color:#4CAF50; font-size:0.75em; background:rgba(76, 175, 80, 0.1); padding:2px 6px; border-radius:4px; margin-top:4px; border:1px solid rgba(76, 175, 80, 0.3);">
                        Gespendet: ${donatedDisplay}
                    </span>
                </div>
            `;
            listBody.appendChild(row);
        });
    }

    toggleGuildView() {
        const chatView = document.getElementById('chat-messages');
        const listView = document.getElementById('guild-member-view');
        const btnList = document.getElementById('btn-guild-list');

        if (listView.style.display === 'none') {
            chatView.style.display = 'none';
            listView.style.display = 'flex';
            btnList.classList.add('active');
        } else {
            listView.style.display = 'none';
            chatView.style.display = 'flex'; 
            btnList.classList.remove('active');
        }
    }

    sendGuildSystemMessage(text) {
        const state = this.game.gameState;
        if (!state.guildName || typeof firebase === 'undefined') return;

        const safeGuildName = state.guildName.replace(/\s+/g, '_');
        const chatRef = firebase.database().ref(`guilds/${safeGuildName}/chat`);

        chatRef.push({
            sender: "SYSTEM",
            text: text,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            isSystem: true // Flag für spezielles Styling
        });
    }
}
// ================================================================================================================
// === SUB-SYSTEM: PET SYSTEM ===
// ================================================================================================================
class PetSystem {
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
            isMaxLevel: currentLevel >= pet.maxLevel
        };
    }

    levelUpPet(petId) {
        const state = this.game.gameState;
        if (!state.petsUnlocked) return;
        
        const pet = petsData.find(p => p.id === petId);
        if (!pet) return;

        const currentLevel = state.petLevels[petId] || 0;
        const stats = this.calculatePetStat(pet, currentLevel);
        
        if (stats.isMaxLevel) return;

        if (state.diamanten < stats.nextCost) {
            this.game.showNotification(`💎 Nicht genug Diamanten!`, 'error');
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

        const petDetails = petsData.find(p => p.id === activePetId);
        // Beispiel für Auto-Clicker Pet (Hund)
        if (petDetails && petDetails.id === 'pet_dog') {
            const currentLevel = this.game.gameState.petLevels['pet_dog'] || 1;
            const clicksPerSecond = currentLevel; 
            const intervalDuration = 1000 / clicksPerSecond;

            this.petAutoClickTimer = setInterval(() => {
                this.game.klickeSmiley(null);
            }, intervalDuration);
        }
    }

    // --- RENDERING & UI ---

    renderPetShop() {
        const petGrid = this.game.getById('pet-shop-grid');
        const lockMessage = this.game.getById('pet-lock-message');
        const state = this.game.gameState;
        
        if (!petGrid) return;

        // 1. Gesperrt?
        if (!state.petsUnlocked) {
            petGrid.style.display = 'none';
            if (lockMessage) {
                lockMessage.style.display = 'block';
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
        if (lockMessage) lockMessage.style.display = 'none';
        petGrid.style.display = 'grid';
        petGrid.innerHTML = ''; 

        petsData.forEach((pet) => {
            const petDiv = document.createElement('div');
            const isActive = state.activePet === pet.id;
            const currentLevel = state.petLevels[pet.id] || 0;
            const isBought = currentLevel > 0;
            
            const stats = this.calculatePetStat(pet, currentLevel);
            // Effekt-Wert schön formatieren (x100 für Prozent, außer bei Auto-Click)
            const effectValue = (stats.currentEffect * (pet.effectType === 'auto_click' ? 1 : 100)).toFixed(1);
            
            petDiv.className = `pet-item ${isActive ? 'active' : ''} ${isBought ? 'bought' : ''}`;
            petDiv.dataset.id = pet.id;

            // Kauf-Button
            let btnHtml = '';
            if (currentLevel >= pet.maxLevel) {
                btnHtml = `<button disabled style="background:#444; color:#888; border:none;">MAX LEVEL</button>`;
            } else {
                const canAfford = state.diamanten >= stats.nextCost;
                const btnText = isBought ? `Level Up (${stats.nextCost} 💎)` : `Adoptieren (${stats.nextCost} 💎)`;
                const btnColor = canAfford ? 'var(--color-accent-blue)' : '#ff5252';
                
                btnHtml = `
                    <button class="btn-buy-pet" data-id="${pet.id}" ${canAfford ? '' : 'disabled'} 
                            style="border: 1px solid ${btnColor}; color: ${canAfford ? '#fff' : '#aaa'}; background: rgba(0,0,0,0.3);">
                        ${btnText}
                    </button>
                `;
            }

            // Ausrüsten-Button
            let equipHtml = '';
            if (isBought) {
                equipHtml = `
                    <button class="btn-pet-activate" data-id="${pet.id}" 
                            style="background: ${isActive ? '#f44336' : '#4CAF50'}; border:none;">
                        ${isActive ? 'Zurückrufen' : 'Auswählen'}
                    </button>
                `;
            } else {
                equipHtml = `<button disabled style="opacity:0.3; border:none;">Gesperrt</button>`;
            }

            petDiv.innerHTML = `
                <div class="pet-icon">${pet.icon}</div>
                <div class="pet-name">${pet.name}</div>
                <div style="font-size:0.8rem; color:#FFD700; margin-bottom:5px;">Lvl ${currentLevel} / ${pet.maxLevel}</div>
                <div class="pet-desc">${pet.description.replace('%', effectValue)}</div>
                
                <div class="pet-actions" style="width:100%;">
                    ${btnHtml}
                    ${equipHtml}
                </div>
            `;

            const buyBtn = petDiv.querySelector('.btn-buy-pet');
            if (buyBtn) {
                buyBtn.onclick = () => this.levelUpPet(pet.id);
            }

            const equipBtn = petDiv.querySelector('.btn-pet-activate');
            if (equipBtn) {
                equipBtn.onclick = () => this.activatePet(pet.id);
            }
            petGrid.appendChild(petDiv);
        });
    }

    updatePetButtons() {
        const openButton = this.game.getById('open_pet_shop_button');
        const state = this.game.gameState;

        // Button im Hauptmenü anzeigen/ausblenden
        if (openButton) {
            openButton.style.display = state.petsUnlocked ? 'block' : 'none';
        }

        // Anzeige des aktiven Pets oben im UI
        const activePetDisplayElement = this.game.getById('active_pet_display');
        if (activePetDisplayElement) {
            if (state.activePet) {
                const pet = petsData.find(p => p.id === state.activePet);
                const currentLevel = state.petLevels[state.activePet] || 0;
                const stats = this.calculatePetStat(pet, currentLevel);
                const currentEffectDisplay = (stats.currentEffect * 100).toFixed(1);

                activePetDisplayElement.innerHTML = `
                    <div style="font-size: 2.5rem; margin-right: 10px; filter: drop-shadow(0 0 5px rgba(255,255,255,0.3));">
                        ${pet.icon}
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-start;">
                        <span style="color:#FFD700;">${pet.name} <small style="color:#ccc;">(Lv. ${currentLevel})</small></span>
                        <small style="color:#aaa; font-size:0.75rem;">${pet.description.replace('%', currentEffectDisplay)}</small>
                    </div>
                `;
                activePetDisplayElement.style.display = 'flex';
            } else {
                activePetDisplayElement.style.display = 'none';
            }
        }
        
        // Falls das Modal offen ist, Shop aktualisieren
        const petModal = this.game.getById('pet-shop-modal');
        if (petModal && petModal.style.display === 'flex') {
            this.renderPetShop();
        }
    }
    
    createInfoPetsElements() {
        const container = this.game.getById('info_pets_container');
        if (!container) return;
        
        container.innerHTML = '';
        container.className = 'info-grid';

        petsData.forEach(p => {
            const lvl = this.game.gameState.petLevels[p.id] || 0;
            const item = document.createElement('div');
            item.className = 'info-upgrade-item';
            
            item.innerHTML = `
                <div style="font-size:2em;">${p.icon || '🐶'}</div>
                <h4>${p.name}</h4>
                <p>Level: <span style="color:#FFD700">${lvl}</span> / ${p.maxLevel}</p>
                <p style="font-size:0.8em; margin-top:5px;">${p.description.replace('%', ((lvl*0.1)*100).toFixed(0))}</p>
            `;
            container.appendChild(item);
        });
    }
}

// ================================================================================================================
// === SUB-SYSTEM: AUDIO & SFX (Retro Synthesizer) ===
// ================================================================================================================
class SoundSystem {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.ctx = null; // AudioContext
        this.masterGain = null;
        this.sfxVolume = 0.5;
        this.musicVolume = 0.3;
        this.init();
        console.log("🔊 SoundSystem (Arcade Synth) geladen.");
    }

    init() {
        // Lautstärke laden
        const storedSfx = localStorage.getItem('soundVolume');
        if (storedSfx !== null) this.sfxVolume = parseInt(storedSfx) / 100;
        
        // AudioContext darf erst nach User-Interaktion starten (Browser-Regel)
        window.addEventListener('mousedown', () => this.checkContext(), { once: true });
        window.addEventListener('keydown', () => this.checkContext(), { once: true });
    }

    checkContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
        } else if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playClickSound() {
        if (!this.clickSound) return;
        
        // Lautstärke anpassen (0.0 bis 1.0)
        this.clickSound.volume = this.sfxVolume / 100;
        
        // Sound zurückspulen, damit man schnell hintereinander klicken kann
        this.clickSound.currentTime = 0;
        
        // Abspielen mit Fehler-Abfangung (Browser blockieren Autoplay manchmal)
        this.clickSound.play().catch(e => {
            // Ignorieren oder Loggen, wenn Audio noch nicht erlaubt ist
            // console.warn("Audio konnte nicht abgespielt werden:", e);
        });
    }

    // Hilfsfunktion: Spielt einen Ton
    playTone(freq, type, duration, volRel = 1.0, slideTo = null) {
        if (!this.ctx || this.sfxVolume <= 0) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type; // 'sine', 'square', 'triangle', 'sawtooth'
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        // Pitch-Slide Effekt (z.B. für "Pew"-Sounds)
        if (slideTo) {
            osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
        }

        const vol = this.sfxVolume * volRel;
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    // --- DIE SOUND EFFEKTE ---

    playClick() {
        // Sanftes "Plop"
        this.playTone(400, 'sine', 0.1, 0.5, 200); 
    }

    playCrit() {
        // Wuchtigeres "Zack!"
        this.playTone(150, 'square', 0.15, 0.4, 50); 
        setTimeout(() => this.playTone(200, 'sawtooth', 0.1, 0.2), 10); // Layering
    }

    playBuy() {
        // Klassisches "Ka-Ching" (Münze)
        this.playTone(1200, 'sine', 0.1, 0.4);
        setTimeout(() => this.playTone(2000, 'sine', 0.2, 0.4), 80);
    }

    playError() {
        // Dumpfes "Buzz"
        this.playTone(150, 'sawtooth', 0.2, 0.3, 100);
    }

    playLevelUp() {
        // Fanfare "Ta-Da!"
        this.playTone(440, 'triangle', 0.1, 0.4); // A4
        setTimeout(() => this.playTone(554, 'triangle', 0.1, 0.4), 100); // C#5
        setTimeout(() => this.playTone(659, 'triangle', 0.2, 0.4), 200); // E5
        setTimeout(() => this.playTone(880, 'square', 0.4, 0.3, 1200), 300); // A5 (lang)
    }

    playLegendary() {
        // Epischer Sound für Artefakte/Legendäres
        [300, 400, 500, 600, 800].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'sine', 0.3, 0.3), i * 60);
        });
    }

    updateVolume(val) {
        this.sfxVolume = val / 100;
        this.checkContext();
    }
}
// ================================================================================================================
// === SUB-SYSTEM: DER SCHWARZMARKT (Final Corrupted Edition mit Tauschhandel) ===
// ================================================================================================================
class GemEmpire {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.shopName = "DER SCHWARZMARKT"; 
        
        this.quotes = [
            "Lila ist die Farbe der Macht.",
            "Schau nicht zu tief in den Void...",
            "Alles hat seinen Preis.",
            "Exquisite Ware für exklusive Kunden.",
            "Die Realität ist nur eine Suggestion.",
            "Korruption ist auch eine Form von Währung."
        ];

        console.log(`👾 ${this.shopName} (Corrupted) geladen.`);
        
        this.upgrades = {
            // --- DAUERHAFTE MACHT ---
            'gem_luck': { 
                name: "Schicksals-Würfel", 
                desc: "Manipuliert die Wahrscheinlichkeit. +1% Krit-Chance.", 
                baseCost: 5, costFactor: 1.5, type: 'passive', icon: "🎲", category: "permanent" 
            },
            'gem_greed': { 
                name: "Gier-Prisma", 
                desc: "Bricht das Licht in der Mine. +5% Diamanten-Fundrate.", 
                baseCost: 15, costFactor: 1.8, type: 'passive', icon: "💎", category: "permanent" 
            },
            'gem_discount': { 
                name: "Schatten-Pakt", 
                desc: "Bauarbeiter stellen keine Fragen mehr. -2% Baukosten.", 
                baseCost: 20, costFactor: 2.5, type: 'passive', icon: "📜", category: "permanent" 
            },
            'gem_prestige': { 
                name: "Void-Magnet", 
                desc: "Zieht verlorene Seelen an. +5% Prestige-Punkte.", 
                baseCost: 50, costFactor: 2.0, type: 'passive', icon: "🧲", category: "permanent" 
            },
            'gem_offline': { 
                name: "Chronos-Splitter", 
                desc: "Verzerrt die Zeit bei Abwesenheit. +10% Offline-Ertrag.", 
                baseCost: 10, costFactor: 1.5, type: 'passive', icon: "⏳", category: "permanent" 
            },
            'gem_double': { 
                name: "EWIGE DOMINANZ", 
                desc: "Verdoppelt deine gesamte Produktion PERMANENT (x2).", 
                baseCost: 500, costFactor: 1, type: 'passive', icon: "👑", category: "permanent", maxLevel: 1 
            },

            // --- VERBRAUCHSWARE ---
            'gem_timelapse': { 
                name: "Warp-Antrieb (4h)", 
                desc: "Reise 4 Stunden in die Zukunft und ernte die Gewinne.", 
                baseCost: 20, costFactor: 1.0, type: 'consumable', icon: "🚀", category: "consumable" 
            },
            'gem_prestige_inject': { 
                name: "Seelen-Extraktor", 
                desc: "Extrahiert 70% deiner Prestige-Punkte OHNE Reset.", 
                baseCost: 40, costFactor: 1.0, type: 'consumable', icon: "💉", category: "consumable" 
            },
            'gem_refresh': { 
                name: "System-Reboot", 
                desc: "Setzt alle Skill-Cooldowns sofort auf 0 zurück.", 
                baseCost: 15, costFactor: 1.0, type: 'consumable', icon: "🔄", category: "consumable" 
            }
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

        const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];

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
                    <p style="margin:5px 0 0 0; font-size:0.8em; color: ${canExchange ? '#4CAF50' : '#FF5252'}">
                        Verfügbar: ${this.game.formatNumber(state.prestige_punkte_verfügbar || 0)} Prestige
                    </p>
                </div>
                <button id="btn-exchange-prestige" class="exchange-btn" ${!canExchange ? 'disabled' : ''}>
                    UMWANDELN
                </button>
            </div>
        `;

        html += `</div>`;
        container.innerHTML = html;

        // Listener für Tausch-Button
        const exBtn = document.getElementById('btn-exchange-prestige');
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

        const gridPerm = container.querySelector('#gem-grid-permanent');
        const gridCons = container.querySelector('#gem-grid-consumable');

        Object.keys(this.upgrades).forEach(key => {
            const def = this.upgrades[key];
            const lvl = state.gemUpgrades[key] || 0;
            let cost = def.baseCost;
            if (def.type === 'passive' && !def.maxLevel) {
                cost = Math.floor(def.baseCost * Math.pow(def.costFactor, lvl));
            }

            const canAfford = (state.gems || 0) >= cost;
            const isMaxed = def.maxLevel && lvl >= def.maxLevel;
            const targetGrid = def.category === 'consumable' ? gridCons : gridPerm;

            const card = document.createElement('div');
            card.className = `purple-card ${isMaxed ? 'maxed' : ''}`;

            const iconGlow = def.category === 'consumable' ? 'drop-shadow(0 0 8px #ea80fc)' : 'drop-shadow(0 0 10px #7c4dff)';
            let btnText = isMaxed ? "MAXIMAL" : (def.type === 'consumable' ? `${cost} 👾` : `${this.game.formatNumber(cost)} 👾`);

            card.innerHTML = `
                <div>
                    <div style="display:flex; align-items:center; gap: 15px; margin-bottom:15px;">
                        <div style="font-size:2.2em; filter: ${iconGlow};">${def.icon}</div>
                        <div style="flex:1; overflow:hidden;">
                            <div style="font-weight:bold; color:#fff; font-size:1.0rem; margin-bottom:4px;">${def.name}</div>
                            ${!def.maxLevel && def.type !== 'consumable' ? `<div style="font-size:0.75em; color:#b388ff; background:rgba(124, 77, 255, 0.1); display:inline-block; padding:2px 6px; border-radius:4px;">Stufe ${lvl}</div>` : ''}
                            ${isMaxed ? `<div style="font-size:0.75em; color:#00e676; border:1px solid #00e676; display:inline-block; padding:1px 5px; border-radius:4px;">VOLLSTÄNDIG</div>` : ''}
                        </div>
                    </div>
                    <p style="font-size:0.85em; color:#ccc; line-height:1.5; margin-bottom:15px;">${def.desc}</p>
                </div>
                
                <button class="purple-btn" ${!canAfford || isMaxed ? 'disabled' : ''}>
                    ${btnText}
                </button>
            `;

            if (canAfford && !isMaxed) {
                const btn = card.querySelector('button');
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
        if (def.type === 'passive' && !def.maxLevel) {
            cost = Math.floor(def.baseCost * Math.pow(def.costFactor, lvl));
        }

        if ((state.gems || 0) >= cost) {
            state.gems -= cost;

            if (def.type === 'passive') {
                state.gemUpgrades[key] = lvl + 1;
                this.game.showNotification(`${def.name} verbessert!`, "success");
            } else if (key === 'gem_timelapse') {
                const sps = this.game.computeTotalSPS(); 
                const seconds = 4 * 60 * 60; 
                this.game.addSmileys(sps * seconds);
                this.game.showNotification(`🚀 WARP AKTIV! +${this.game.formatNumber(sps * seconds)} Smileys`, "success");
                this.game.triggerBigBang(); 
            } else if (key === 'gem_prestige_inject') {
                const potential = this.game.calculatePrestigeGain();
                if (potential > 0) {
                    const gain = Math.floor(potential * 0.70);
                    if (gain > 0) {
                        state.prestige_punkte_verfügbar += gain;
                        state.gesamt_prestige_punkte += gain;
                        this.game.showNotification(`💉 SEELEN GEERNTET: +${this.game.formatNumber(gain)}`, "success");
                        this.game.triggerBigBang(); 
                    } else { state.gems += cost; return; }
                } else { state.gems += cost; return; }
            } else if (key === 'gem_refresh') {
                Object.keys(state.skills).forEach(skillName => {
                    state.skills[skillName].active = false;
                    state.skills[skillName].cooldown = false;
                    state.skills[skillName].readyAt = 0;
                    this.game.updateUI(); 
                });
                this.game.showNotification("🔄 SYSTEM NEUGESTARTET!", "success");
            }

            if (key === 'gem_luck') state.critChance += 0.01;
            if (key === 'gem_greed') state.diamondMineBoost += 0.05;

            this.game.playBuySound();
            this.game.applyAllBoni(); 
            this.game.updateUI(); 
            this.renderGemShop('gem_shop_container'); 
            this.game.speichereSpiel();
        } else {
            // Fehlermeldung angepasst
            this.game.showNotification("Nicht genug Corrupted Smileys!", "error");
        }
    }
}

// ================================================================================================================
// === SUB-SYSTEM: DER KLEIDERSCHRANK (Skins & Visuals) ===
// ================================================================================================================
class SkinSystem {
    constructor(gameInstance) {
        this.game = gameInstance;
        console.log("👕 SkinSystem geladen.");

        // Die Liste aller verfügbaren Skins
        this.skins = [
            { id: 'default', name: 'Klassisch', icon: '😊', cost: 0, desc: 'Der gute alte Standard.', css: '' },
            { id: 'cool',    name: 'Der Coole', icon: '😎', cost: 2, desc: 'Schützt vor UV-Strahlen.', css: '' },
            { id: 'rich',    name: 'Monokel',   icon: '🧐', cost: 5, desc: 'Wirkt sofort intelligenter.', css: '' },
            { id: 'cowboy',  name: 'Sheriff',   icon: '🤠', cost: 8, desc: 'Dieser Server ist zu klein für uns beide.', css: '' },
            { id: 'party',   name: 'Party',     icon: '🥳', cost: 10, desc: 'Jeder Klick ein Fest.', css: '' },
            { id: 'robot',   name: 'Mecha-V1',  icon: '🤖', cost: 15, desc: 'Klick-Geräusche nicht inklusive.', css: '' },
            { id: 'alien',   name: 'Area 51',   icon: '👽', cost: 20, desc: 'Sie sind unter uns.', css: '' },
            { id: 'devil',   name: 'Diablo',    icon: '😈', cost: 25, desc: 'Ein teuflischer Deal.', css: '' },
            { id: 'clown',   name: 'Joker',     icon: '🤡', cost: 30, desc: 'Warum denn so ernst?', css: '' },
            { id: 'ghost',   name: 'Phantom',   icon: '👻', cost: 40, desc: 'Jetzt siehst du mich...', css: 'ghost-anim' },
            { id: 'glitch',  name: 'MISSINGNO', icon: '👾', cost: 50, desc: 'D4t3n f3hl3r...', css: 'glitch-anim' },
            { id: 'king',    name: 'Der König', icon: '👑', cost: 100, desc: 'Das ultimative Statussymbol.', css: 'king-glow' }
        ];
    }

    // Rendert das Fenster
    renderWardrobe() {
        const container = document.getElementById('wardrobe-grid');
        const modal = document.getElementById('wardrobe-modal');
        const state = this.game.gameState;

        if (!container || !modal) return;

        // Sicherstellen, dass Datenstruktur existiert
        if (!state.unlockedSkins) state.unlockedSkins = ['default'];
        if (!state.activeSkin) state.activeSkin = 'default';

        container.innerHTML = '';

        this.skins.forEach(skin => {
            const isUnlocked = state.unlockedSkins.includes(skin.id);
            const isActive = state.activeSkin === skin.id;
            const canAfford = state.gems >= skin.cost;

            const card = document.createElement('div');
            card.className = `skin-card ${isActive ? 'active-skin' : ''}`;
            
            let btnHtml = '';
            if (isActive) {
                btnHtml = `<button disabled style="background:#4CAF50; color:#fff; border:none; padding:5px 10px; border-radius:4px; width:100%;">Ausgerüstet</button>`;
            } else if (isUnlocked) {
                btnHtml = `<button class="btn-equip-skin" data-id="${skin.id}" style="background:#009ffd; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; width:100%;">Ausrüsten</button>`;
            } else {
                btnHtml = `<button class="btn-buy-skin" data-id="${skin.id}" ${canAfford ? '' : 'disabled'} 
                           style="background:${canAfford ? '#e066ff' : '#333'}; color:${canAfford ? '#fff' : '#888'}; border:none; padding:5px 10px; border-radius:4px; cursor:${canAfford?'pointer':'not-allowed'}; width:100%;">
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
                const btn = card.querySelector('button');
                if (btn.classList.contains('btn-buy-skin')) {
                    btn.onclick = () => this.buySkin(skin.id);
                } else if (btn.classList.contains('btn-equip-skin')) {
                    btn.onclick = () => this.equipSkin(skin.id);
                }
            }

            container.appendChild(card);
        });

        modal.style.display = 'flex';
    }

    buySkin(skinId) {
        const state = this.game.gameState;
        const skin = this.skins.find(s => s.id === skinId);
        
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
        const btn = document.getElementById('smiley_button');
        if (!btn) return;

        const skinId = state.activeSkin || 'default';
        const skin = this.skins.find(s => s.id === skinId) || this.skins[0];

        // 1. Icon ändern
        btn.innerText = skin.icon;

        // 2. CSS Klassen resetten und neue setzen
        // Wir behalten 'active-key' und 'anim-squish' bei, falls sie gerade laufen
        const keepClasses = [];
        if (btn.classList.contains('active-key')) keepClasses.push('active-key');
        if (btn.classList.contains('anim-squish')) keepClasses.push('anim-squish');
        
        btn.className = ''; // Alles weg
        btn.classList.add('smiley-btn'); // Basis Klasse wieder rein (musst du im CSS haben oder id nutzen)
        
        // Alte Klassen wieder rein
        keepClasses.forEach(c => btn.classList.add(c));

        // Spezial-Effekt Klasse vom Skin hinzufügen
        if (skin.css) {
            btn.classList.add(skin.css);
        }
    }
}