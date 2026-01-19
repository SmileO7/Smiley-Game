// ================================================================================================================
// === SmileyGame.js: Haupspielklasse (Refactored 2025-12-15) ===
// ================================================================================================================

class SmileyGame {
    // ================================================================================================================
    // 0. KLASSE & CONSTRUCTOR
    // ================================================================================================================

    constructor() {


        this.prestigeUpgrades = [
            // === START (Mitte Unten) ===
            { 
                id: 0, 
                name: "Genesis Protokoll", 
                cost: 1, 
                description: "Initialisiert das Prestige-System. Gewährt einen dauerhaften Startbonus auf alle Einnahmen.", 
                type: 'sps_mult', 
                value: 0.10, 
                x: 50, y: 90,       
                category: 'start',
                parents: [] 
            },

            // === TIER 1: KLICK vs IDLE ===
            { 
                id: 1, 
                name: "Biometrischer Verstärker", // Vorher: Aktive Finger
                cost: 2, 
                description: "Verbessert die Signalübertragung beim Klicken. Klickkraft +25%.", 
                type: 'click_mult', 
                value: 0.25, 
                x: 30, y: 75,       
                category: 'click',
                parents: [0] 
            },
            { 
                id: 2, 
                name: "Autonome Netzwerke", // Vorher: Passive Macht
                cost: 2, 
                description: "Optimiert die Hintergrundprozesse deiner Gebäude. SPS +25%.", 
                type: 'sps_mult', 
                value: 0.25, 
                x: 70, y: 75,       
                category: 'idle',
                parents: [0] 
            },

            // === TIER 2: SPEZIALISIERUNG ===
            { 
                id: 3, 
                name: "Effizienz-Module", // Vorher: Bau-Rabatt
                cost: 5, 
                description: "Optimiert die Baukosten durch bessere Ressourcennutzung. Alle Gebäude 5% günstiger.", 
                type: 'cost_reduction', 
                value: 0.05, 
                x: 15, y: 60,       
                category: 'qol',
                parents: [1] 
            },
            { 
                id: 4, 
                name: "Zeit-Komprimierung", // Vorher: Prestige-Experte
                cost: 10, 
                description: "Erhöht die Ausbeute bei Zeitreisen. Prestige-Punkte sind 10% effektiver.", 
                type: 'prestige_efficiency', 
                value: 0.10, 
                x: 85, y: 60,       
                category: 'idle',
                parents: [2] 
            },

            // === TIER 3: SYNERGIE ===
            { 
                id: 5, 
                name: "Neural-Link Matrix", // Vorher: Synergie
                cost: 15, 
                description: "Verbindet aktive Handlungen mit passiven Systemen. Klicks skalieren jetzt mit deiner SPS.", 
                type: 'click_mult', 
                value: 0.50, 
                x: 50, y: 55,       
                category: 'special',
                parents: [1, 2]     
            },

            // === TIER 4: FEATURE UNLOCKS ===
            { 
                id: 6, 
                name: "Bio-Labor Zugang", // Vorher: Süße Begleiter
                cost: 50, 
                description: "Gewährt Zugriff auf genetisch modifizierte Begleiter. Schaltet das PET-SYSTEM frei.", 
                type: 'unlock_pets', 
                value: 0, 
                x: 35, y: 40,       
                category: 'special',
                parents: [5] 
            },
            { 
                id: 7, 
                name: "Tiefenbohrung", // Vorher: Tiefbau
                cost: 50, 
                description: "Erlaubt Bohrungen in den Erdkern. Schaltet die DIAMANTEN-MINE frei.", 
                type: 'unlock_mine', 
                value: 0, 
                x: 65, y: 40,       
                category: 'special',
                parents: [5] 
            },

            // === TIER 5: DAS IMPERIUM ===
            { 
                id: 8, 
                name: "Konzern-Gründung", // Vorher: Imperium
                cost: 100, 
                description: "Erlaube die Bildung von Allianzen und Fraktionen. Schaltet das GILDEN-SYSTEM frei.", 
                type: 'unlock_guilds', 
                value: 0, 
                x: 50, y: 25,       
                category: 'special',
                parents: [6, 7] 
            },

            // === TIER 6: GLOBALER BOOST ===
            { 
                id: 9, 
                name: "Markt-Dominanz", // Vorher: Globaler Reichtum
                cost: 250, 
                description: "Dein Unternehmen beherrscht den Markt. Verdoppelt die gesamte Produktion (x2).", 
                type: 'global_mult', 
                value: 1.0, 
                x: 50, y: 10,       
                category: 'qol',    
                parents: [8] 
            },

            // === ENDGAME ===
            { 
                id: 10, 
                name: "Kybernetischer Gott", // Vorher: Klick-Titan
                cost: 500, 
                description: "Verschmilzt Bewusstsein mit Maschine. Verdreifacht Klickkraft (+200%).", 
                type: 'click_mult', 
                value: 2.0, 
                x: 20, y: 15,       
                category: 'click',
                parents: [9] 
            },
            { 
                id: 11, 
                name: "Industrie-Singularität", // Vorher: Industrie-Gigant
                cost: 500, 
                description: "Vollständige Automation aller Sektoren. Verdreifacht passive SPS (+200%).", 
                type: 'sps_mult', 
                value: 2.0, 
                x: 80, y: 15,       
                category: 'idle',
                parents: [9] 
            },

            // === ULTIMATE ===
            { 
                id: 12, 
                name: "Nano-Konstruktion", // Vorher: Massenproduktion
                cost: 1500, 
                description: "Gebäude werden auf atomarer Ebene gebaut. Kosten -10%.", 
                type: 'cost_reduction', 
                value: 0.10, 
                x: 50, y: -10,      
                category: 'qol',
                parents: [10, 11] 
            },
            { 
                id: 13, 
                name: "Chronos-Manipulator", // Vorher: Zeitreise-Meister
                cost: 5000, 
                description: "Beugt die Zeit zu deinem Vorteil. Prestige-Effizienz +50%.", 
                type: 'prestige_efficiency', 
                value: 0.50, 
                x: 30, y: -25,      
                category: 'idle',
                parents: [12] 
            },
            { 
                id: 14, 
                name: "The Big Crunch", // Vorher: Big Bang
                cost: 10000, 
                description: "Kollaps und Neustart des Universums. Multipliziert ALLES mit 5.", 
                type: 'global_mult', 
                value: 4.0, 
                x: 70, y: -25, 
                category: 'special',
                parents: [12] 
            }
        ];
        this.gameState = {
                    // --- Währungen ---
                    aktuelle_smileys: 0,
                    lifetime_smileys: 0,
                    diamanten: 0,

                    // --- Prestige & Stats ---
                    prestige_punkte_verfügbar: 0,
                    gesamt_prestige_punkte: 0,
                    prestigeResets: 0,

                    // --- Basis-Werte & Multiplikatoren ---
                    klickKraft: 2,
                    klickKraftMultiplier: 1,
                    globalerPrestigeMultiplikator: 1,

                    // --- ZENTRALE ZUSTANDS-ARRAYs ---
                    buildingCounts: [...buildingsData, ...uniqueBuildingsData].map(() => 0),
                    buildingPrices: [...buildingsData.map(item => item.basePrice), ...uniqueBuildingsData.map(item => item.basePrice)],

                    researchStatus: globalUpgrades.map(() => false),
                    prestigeUpgradeStatus: this.prestigeUpgrades.map(() => false),

                    petLevels: {},
                    activePet: null,

                    // --- Laufzeit-Statistiken & Boni ---
                    totalSPS: 0,
                    globalSPSMultiplier: 1,
                    prestigePointMultiplier: 0.01,
                    prestigeResetBonus: 0,

                    // --- Diamant-Upgrades ---
                    critChance: 0,
                    critDamageMult: 1,
                    diamondMineBoost: 0,
                    globalCostReduction: 0,
                    clickSPSRatio: 0,
                    godModeMultiplier: 1,
                    diamondShopPurchases: [],

                    // --- Feature-States ---
                    diamondMineUnlocked: false,
                    petsUnlocked: false,
                    guildsUnlocked: false,

                    petAutoClickTimer: 0,
                    achievementsUnlocked: achievementsData.map(() => false),
                    totalClicksLifetime: 0,

                    // --- GILDEN ZUSTAND ---
                    guildName: null,
                    guildUpgradeStatus: guildUpgradesData.map(() => false),
                    guildSPSMultiplier: 0,
                    guildCostReduction: 0,
                    guildPrestigeBonus: 0,
                    guildGlobalMultiplier: 1, // <--- WICHTIGES KOMMA!

                    // NEU: Gilden-Boss (Raid)
                    guildBossLevel: 1,       // Startet bei Level 1
                    guildBossHP: 1000,       // Aktuelles Leben
                    guildBossMaxHP: 1000,    // Maximales Leben (steigt pro Level)
                    guildBossFighting: false,// Kämpfen wir gerade?
                    guildBossTimer: 0,       // Zeitlimit (30s)

                    // NEU: Gilden Quests
                    guildAvailableQuests: [], // Liste der offenen Missionen
                    guildActiveQuests: [],    // Missionen, die gerade laufen
                    lastQuestGenTime: 0,      // Wann wurden zuletzt Quests generiert?

                    // -- Minigame Status
                    diamondMinigameRunning: false,
                    diamondMinigameTimer: null,
                };

        this.productionInterval = null;
        this.uiInterval = null;
        this.saveInterval = null;

        this.setupSettingsModalListeners();
        this.init();
    }

    init() {
            // SCHRITT 1: Erst laden! (Holt den alten Zeitstempel)
            this.ladeSpiel();

            // SCHRITT 2: SOFORT prüfen (Bevor irgendwas überschrieben wird!)
            this.checkOfflineProgress();

            // --- Erst jetzt der ganze Rest ---
            this.createBuildingElements();
            this.renderPetShop();
            this.updateGlobalUpgradeUI();
            this.updatePrestigeUI();
            this.ladeAudioEinstellungen();

            const musicPlayer = this.getById('background-music');
            if (musicPlayer) {
                musicPlayer.play().catch(e => console.log("Musik wartet:", e));
            }

            this.setupMainEventListeners();
            this.setupPrestigeEventListeners();
            this.setupInfoPageEventListeners();
            this.setupSkillTreeControls();

            // SCHRITT 3: Intervalle starten (Produktion & Autosave)
            this.startIntervals();
            this.updatePetInterval();

            this.updateUI();

            // WICHTIG: KEIN this.speichereSpiel() HIER AM ENDE!
            // Das passiert automatisch durch startIntervals() nach 5 Sekunden.
            // Wenn wir hier speichern, zerstören wir manchmal den Zeitstempel für den nächsten Reload.

            console.log("Spiel initialisiert. Warte auf Autosave...");
        }

    // ================================================================================================================
    // 1. SPIELKONTROLLE & INTERVALLE
    // ================================================================================================================

    startIntervals() {
            // 1. Produktion (Jede Sekunde Geld)
            this.productionInterval = setInterval(() => this.produzierePassiveErträge(), 1000);

            // 2. Automatisches Speichern (Alle 10 Sekunden reicht eigentlich)
            this.saveInterval = setInterval(() => {
                this.speichereSpiel();
            }, 10000);

            // 3. SICHERUNG A: Wenn man den Tab schließt (Der Klassiker)
            window.addEventListener('beforeunload', () => {
                this.speichereSpiel();
            });

            // 4. SICHERUNG B: Wenn man den Tab wechselt oder minimiert (WICHTIG!)
            // Moderne Browser blockieren 'beforeunload' manchmal. Das hier ist zuverlässiger.
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    console.log("Tab minimiert/versteckt -> Speichere Spiel...");
                    this.speichereSpiel();
                }
            });
        }

    produzierePassiveErträge() {
            // 1. Berechnung der aktuellen SPS
            const actualSPS = this.computeTotalSPS();

            // 2. Gutschreiben (nur wenn Produktion > 0)
            if (actualSPS > 0) {
                // WICHTIG: Hier stand vorher 'sps' -> Das war der Fehler!
                // Es muss 'actualSPS' heißen, so wie die Variable oben drüber.
                this.addSmileys(actualSPS);
            }

            // 3. DIAMANTEN-PRODUKTION (DPS)
            const MINE_INDEX = 8;
            if (this.gameState.diamondMineUnlocked && this.gameState.buildingCounts[MINE_INDEX] > 0) {
                // Suche die Mine in den Daten (Fallback falls Variable global oder importiert)
                const mineData = (typeof uniqueBuildingsData !== 'undefined')
                    ? uniqueBuildingsData.find(u => u.id === 'diamond_mine')
                    : null;

                if (mineData) {
                    // 10% der Basis-DPS als Diamanten
                    const autoDiamondRate = mineData.baseDPS * (mineData.diamondMultiplier || 1) * 0.1;
                    this.gameState.diamanten += autoDiamondRate;
                }
            }

            // 4. UI Aktualisieren (WICHTIG: Muss erreicht werden!)
            this.updateUI();
        }

    computeTotalSPS() {
        let baseSPS = this.getSmileysPerSecond();

        // 1. Hole die Boni aus dem Tree
        const prestigeEffects = this.calculatePrestigeEffects();

        // 2. Prestige-Punkte Bonus berechnen
        // Formel: 1 + (Punkte * Effizienz aus Tree)
        const points = this.gameState.gesamt_prestige_punkte || 0;
        const pointsBonus = 1 + (points * prestigeEffects.pointEfficiency);

        // 3. Reset Bonus (Standard 1% pro Reset, falls du das noch willst)
        const resets = this.gameState.prestigeResets || 0;
        const resetBonus = 1 + (resets * 0.01);

        // 4. Alles multiplizieren
        // Tree-SPS * Punkte-Bonus * Reset-Bonus * Global * Gilde
        this.gameState.globalerPrestigeMultiplikator =
            prestigeEffects.spsMultiplier * pointsBonus * resetBonus * this.gameState.globalSPSMultiplier * (1 + (this.gameState.guildSPSMultiplier || 0));

        this.gameState.totalSPS = baseSPS * this.gameState.globalerPrestigeMultiplikator;

        // Unlocks im State speichern (für UI Updates)
        this.gameState.petsUnlocked = prestigeEffects.petsUnlocked;
        this.gameState.diamondMineUnlocked = prestigeEffects.mineUnlocked;
        this.gameState.guildsUnlocked = prestigeEffects.guildsUnlocked;

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
            // Alten Timer löschen
            if (this.petAutoClickTimer !== null) {
                clearInterval(this.petAutoClickTimer);
                this.petAutoClickTimer = null;
            }

            // Wenn kein Pet aktiv ist, abbrechen
            if (!this.gameState.activePet) return;

            const petDetails = petsData.find(p => p.id === this.gameState.activePet);

            // Prüfen, ob es wirklich der Hund ist
            if (petDetails && petDetails.id === 'pet_dog') {

                // LEVEL HOLEN (Damit Upgrades was bringen!)
                const currentLevel = this.gameState.petLevels['pet_dog'] || 1;

                // Logik: Level 1 = 1 Klick/Sek, Level 5 = 5 Klicks/Sek
                const clicksPerSecond = currentLevel;

                // Intervall berechnen (1000ms geteilt durch Klicks pro Sekunde)
                // z.B. Level 2 -> alle 500ms ein Klick
                const intervalDuration = 1000 / clicksPerSecond;

                this.petAutoClickTimer = setInterval(() => {
                    // Wir übergeben 'null' als Event, damit kein Floating Text spawnt
                    // (sonst ist der Bildschirm voll bei hohem Level)
                    this.klickeSmiley(null);
                }, intervalDuration);

                console.log(`Bello ist aktiv: ${clicksPerSecond} Klicks pro Sekunde.`);
            }
        }

    // ================================================================================================================
    // 2. SPEICHERUNG & HILFSFUNKTIONEN
    // ================================================================================================================

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
    }

    // Hilfsfunktion: Leitet englische Aufrufe an die deutsche Funktion weiter
    saveGameState() {
        this.speichereSpiel();
    }

    ladeSpiel(encodedData) {
        try {
            let dataToLoad = encodedData || localStorage.getItem('smileyGameSave');

            if (!dataToLoad) {
                this.applyAllBoni();
                return false;
            }

            const jsonString = atob(dataToLoad);
            let allData = JSON.parse(jsonString);

            this.gameState = {
                ...this.gameState,
                ...allData.gameState
            };

            this.applyAllBoni();
            return true;
        } catch (e) {
            console.error("Fehler beim Laden des Spiels:", e);
            if (encodedData) alert("Fehler beim Importieren des Spielstands. Die Daten sind möglicherweise beschädigt.");
            localStorage.removeItem('smileyGameSave');
            return false;
        }
    }

    checkOfflineProgress() {
        // 1. Haben wir einen Zeitstempel?
        if (!this.gameState.lastSaveTime) return;

        // 2. Zeit berechnen
        const now = Date.now();
        const diffInMs = now - this.gameState.lastSaveTime;
        const diffInSeconds = Math.floor(diffInMs / 1000);

        // Nur wenn man länger als 10 Sekunden weg war
        if (diffInSeconds < 10) return;

        // 3. SPS berechnen
        const currentSPS = this.computeTotalSPS();

        if (currentSPS <= 0) return;

        // 4. Gewinn berechnen
        const earned = currentSPS * diffInSeconds;

        if (earned > 0) {
            this.addSmileys(earned);

            // Zeit schön formatieren
            let timeString = "";
            if (diffInSeconds < 60) timeString = `${diffInSeconds} Sek`;
            else if (diffInSeconds < 3600) timeString = `${Math.floor(diffInSeconds / 60)} Min`;
            else timeString = `${(diffInSeconds / 3600).toFixed(1)} Std`;

            // STATT ALERT: Wir nutzen deine hübsche Notification!
            // Wir machen eine kleine Verzögerung (500ms), damit die UI erst fertig laden kann
            setTimeout(() => {
                this.showNotification(`💤 Offline-Bonus (${timeString}): +${this.formatNumber(earned)} Smileys`, 'success');
            }, 500);

            this.speichereSpiel();
            this.updateUI();
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

            // WICHTIG: Hier muss lifetime_smileys stehen!
            if (!this.gameState.lifetime_smileys) this.gameState.lifetime_smileys = 0;
            this.gameState.lifetime_smileys += menge;
        }

    getById(id) {
        return document.getElementById(id);
    }

    calculateNextCost(basePrice, count, growthRate, buildingIndex = -1) {
        let price = Math.floor(basePrice * Math.pow(growthRate, count));
        let costReduction = 0;

        // 1. Prestige Cost Reduction (bleibt gleich)
        prestigeUpgrades.forEach(upg => {
            if (upg.type === 'building_cost_reduction' && this.gameState.prestigeUpgradeStatus[upg.id]) {
                if (!upg.buildingIndices || upg.buildingIndices.includes(buildingIndex)) {
                    costReduction += upg.value;
                }
            }
        });

        // 2. Pet Cost Reduction (Gebäude-Pet)
        const activePetIndex = petsData.findIndex(pet => pet.effectType === 'cost_reduction_buildings' && this.gameState.activePet === pet.id);
        if (activePetIndex !== -1) {
            // WICHTIG: Die Level-Logik muss hier funktionieren
            const pet = petsData[activePetIndex];
            const petLevel = this.gameState.petLevels[activePetIndex];
            const petStats = this.calculatePetStat(pet, petLevel);

            costReduction += petStats.currentEffect; // NUTZT DEN SKALIERTEN EFFEKT
        }

        // --- WICHTIGE KORREKTUR: Die Reduktion anwenden! ---
        if (costReduction > 0) {
            price *= (1 - costReduction);
        }
        // ----------------------------------------------------

        return Math.floor(price);
    }

    /**
     * Berechnet die Kosten für Upgrades (ehemals Research, jetzt Global Upgrades)
     * unter Berücksichtigung von Pet-Boni (Upgrade Cost Reduction).
     */
    calculateUpgradeCost(basePrice, count) {
        // Standard Berechnung
        let price = basePrice * Math.pow(1.15, count);

        // Boni holen
        const prestigeEffects = this.calculatePrestigeEffects();

        // Rabatt anwenden (z.B. 5% Rabatt -> Preis * 0.95)
        if (prestigeEffects.costReduction > 0) {
            price *= (1 - prestigeEffects.costReduction);
        }

        return Math.ceil(price);
    }

    // Neue Hilfsfunktion für korrekte Upgrade-Preise
        getGlobalUpgradeCost(upgrade) {
            let price = upgrade.cost;
            let discount = 0;

            // A. Prestige Rabatt
            const prestigeEffects = this.calculatePrestigeEffects();
            if (prestigeEffects && prestigeEffects.costReduction) {
                discount += prestigeEffects.costReduction;
            }

            // B. Globaler Rabatt (Shop)
            if (this.gameState.globalCostReduction) {
                discount += this.gameState.globalCostReduction;
            }

            // C. Pet Rabatt (Eule) - Hier prüfen wir das aktive Pet!
            if (this.gameState.activePet) {
                // WICHTIG: Wir suchen in den Daten nach dem aktiven Pet
                const pet = petsData.find(p => p.id === this.gameState.activePet);
                // Ist es die Eule (cost_reduction_upgrades)?
                if (pet && pet.effectType === 'cost_reduction_upgrades') {
                    const level = this.gameState.petLevels[pet.id] || 0;
                    if (level > 0) {
                        const stats = this.calculatePetStat(pet, level);
                        discount += stats.currentEffect;
                    }
                }
            }

            // Maximal 90% Rabatt
            if (discount > 0.9) discount = 0.9;

            return Math.ceil(price * (1 - discount));
        }

    /**
     * Berechnet die Kosten für das nächste Pet-Level und den aktuellen Effekt.
     */
    calculatePetStat(pet, currentLevel) {
        const nextLevel = currentLevel + 1;
        const baseCost = pet.levelCost;
        const growth = pet.costGrowth;

        let nextCost = 0;
        if (nextLevel <= pet.maxLevel) {
            nextCost = Math.floor(baseCost * Math.pow(growth, currentLevel));
        }

        // Effekt: Basiswert * (1 + aktuelles Level * 0.1) - Skalierung
        const currentEffect = pet.baseEffect * (1 + currentLevel * 0.1);

        return {
            nextCost: nextCost,
            currentEffect: currentEffect,
            isMaxLevel: currentLevel >= pet.maxLevel
        };
    }

    // Diese Funktion berechnet alle aktiven Boni aus dem Skill-Tree
    calculatePrestigeEffects() {
        let effects = {
            spsMultiplier: 1.0,      // Multiplikator für Smileys pro Sekunde
            clickMultiplier: 1.0,    // Multiplikator für Klickkraft
            costReduction: 0.0,      // Rabatt (0.05 = 5%)
            pointEfficiency: 0.10,   // Wie stark ein Prestige-Punkt ist (Standard 10%)
            petsUnlocked: false,
            mineUnlocked: false,
            guildsUnlocked: false
        };

        // Wir gehen durch die DEFINITIONEN (data.js) und prüfen den STATUS
        prestigeUpgrades.forEach(upgrade => {
            // Ist dieses Upgrade gekauft?
            if (this.gameState.prestigeUpgradeStatus[upgrade.id]) {

                switch (upgrade.type) {
                    case 'sps_mult':
                        // Zinseszins (multiplikativ) oder additiv? Multiplikativ ist mächtiger!
                        effects.spsMultiplier *= (1 + upgrade.value);
                        break;
                    case 'click_mult':
                        effects.clickMultiplier *= (1 + upgrade.value);
                        break;
                    case 'cost_reduction':
                        // Additiv, damit wir nicht bei 99% Rabatt landen
                        effects.costReduction += upgrade.value;
                        break;
                    case 'prestige_efficiency':
                        effects.pointEfficiency += upgrade.value;
                        break;
                    case 'unlock_pets':
                        effects.petsUnlocked = true;
                        break;
                    case 'unlock_mine':
                        effects.mineUnlocked = true;
                        break;
                    case 'unlock_guilds':
                        effects.guildsUnlocked = true;
                        break;
                    case 'global_mult':
                        effects.spsMultiplier *= (1 + upgrade.value);
                        effects.clickMultiplier *= (1 + upgrade.value);
                        break;
                }
            }
        });

        return effects;
    }

    applyAllBoni() {
            // 1. Reset der Basis-Multiplikatoren
            this.gameState.globalSPSMultiplier = 1;
            this.gameState.prestigePointMultiplier = 0.05;
            this.gameState.prestigeResetBonus = 0;
            this.gameState.guildSPSMultiplier = 0;

            let diamondSPSMultiplier = 1;
            let diamondClickMultiplier = 1;
            this.gameState.autoDiamondMineUnlocked = false;

            // Reset Feature States (werden gleich neu gesetzt, falls Upgrade gefunden)
            this.gameState.petsUnlocked = false;
            this.gameState.diamondMineUnlocked = false;
            this.gameState.guildsUnlocked = false;

            let baseClickMultiplier = 1;
            let prestigeClickMultiplier = 0; // Hier sammeln wir ALLE Klick-Boni

            // Reset Gebäude Prestige Multi
            buildingsData.forEach(b => {
                b.prestigeMulti = 1;
            });

            // --- NEU: 0. FORSCHUNG / GLOBAL UPGRADES (Der fehlende Teil!) ---
            this.gameState.researchStatus.forEach((bought, index) => {
                if (bought) {
                    const upgrade = globalUpgrades[index];
                    if (upgrade) {
                        if (upgrade.type === 'click_mult') {
                            // Klick-Stärke addieren (z.B. 0.5 für +50%)
                            prestigeClickMultiplier += upgrade.value;
                        }
                        // Falls du später SPS-Upgrades in der Forschung hast:
                        // else if (upgrade.type === 'sps_mult') {
                        //    this.gameState.globalSPSMultiplier += upgrade.value;
                        // }
                    }
                }
            });

            // --- 1. PRESTIGE BONI ---
            this.gameState.prestigeUpgradeStatus.forEach((bought, id) => {
                if (bought) {
                    const upgrade = prestigeUpgrades.find(u => u.id === id);
                    if (upgrade) {
                        switch (upgrade.type) {
                            case 'global_sps_mult':
                                this.gameState.globalSPSMultiplier += upgrade.value;
                                break;
                            case 'global_click_mult':
                                prestigeClickMultiplier += upgrade.value;
                                break;
                            case 'prestige_point_eff':
                                this.gameState.prestigePointMultiplier += upgrade.value;
                                break;
                            case 'prestige_reset_bonus':
                                this.gameState.prestigeResetBonus += upgrade.value;
                                break;
                            case 'unlock_pets':
                                this.gameState.petsUnlocked = true;
                                break;
                            case 'unlock_mine':
                                this.gameState.diamondMineUnlocked = true;
                                break;
                            case 'unlock_guilds':
                                this.gameState.guildsUnlocked = true;
                                break;
                        }
                    }
                }
            });

            // --- 2. PET BONI ---
            if (this.gameState.activePet) {
                const pet = petsData.find(p => p.id === this.gameState.activePet);
                if (pet) {
                    const currentLevel = this.gameState.petLevels[pet.id] || 0;
                    if (currentLevel > 0) {
                        const stats = this.calculatePetStat(pet, currentLevel);
                        const scaledEffect = stats.currentEffect;

                        switch (pet.effectType) {
                            case 'click_mult':
                                prestigeClickMultiplier += scaledEffect;
                                break;
                            case 'sps_mult':
                                this.gameState.globalSPSMultiplier += scaledEffect;
                                break;
                            case 'prestige_point_eff':
                                this.gameState.prestigePointMultiplier += scaledEffect;
                                break;
                        }
                    }
                }
            }

            // --- 3. DIAMANT SHOP BONI ---
            // Reset der Werte
            this.gameState.critChance = 0;
            this.gameState.critDamageMult = 3;
            this.gameState.diamondMineBoost = 0;
            this.gameState.globalCostReduction = 0;
            this.gameState.clickSPSRatio = 0;
            this.gameState.godModeMultiplier = 1;

            let diamondStaticClick = 1;
            let diamondStaticSPS = 1;

            diamondShopUpgrades.forEach(upgrade => {
                const count = this.gameState.diamondShopPurchases[upgrade.id] || 0;
                if (count > 0) {
                    switch(upgrade.type) {
                        case 'click_mult_static':
                            diamondStaticClick *= (upgrade.value * count);
                            break;
                        case 'sps_mult_static':
                            diamondStaticSPS += (upgrade.value * count);
                            break;
                        case 'prestige_point_eff':
                            this.gameState.prestigePointMultiplier += (upgrade.value * count);
                            break;
                        case 'auto_diamond_mine':
                            this.gameState.autoDiamondMineUnlocked = true;
                            break;
                        case 'crit_chance':
                            this.gameState.critChance += (upgrade.value * count);
                            break;
                        case 'crit_damage':
                            this.gameState.critDamageMult += (upgrade.value * count);
                            break;
                        case 'mine_boost':
                            this.gameState.diamondMineBoost += (upgrade.value * count);
                            break;
                        case 'cost_reduction_global':
                            this.gameState.globalCostReduction += (upgrade.value * count);
                            break;
                        case 'click_sps_link':
                            this.gameState.clickSPSRatio += (upgrade.value * count);
                            break;
                        case 'global_god_mode':
                            this.gameState.godModeMultiplier *= (1 + upgrade.value);
                            break;
                    }
                }
            });

            // Diamant Multiplikatoren anwenden
            prestigeClickMultiplier += (diamondStaticClick - 1);
            this.gameState.globalSPSMultiplier *= diamondStaticSPS;
            this.gameState.globalSPSMultiplier *= this.gameState.godModeMultiplier;

            // --- 4. GILDEN BONI ---
            this.gameState.guildCostReduction = 0;
            this.gameState.guildPrestigeBonus = 0;
            this.gameState.guildGlobalMultiplier = 1;
            this.gameState.guildSPSMultiplier = 0;

            this.gameState.guildUpgradeStatus.forEach((bought, id) => {
                if (bought) {
                    const member = guildUpgradesData.find(u => u.id === id);
                    if (member) {
                        if (member.isClickMultiplier) {
                            prestigeClickMultiplier += (member.spsMultiplier - 1);
                        } else if (member.spsMultiplier > 1 && !member.specialEffect) {
                            this.gameState.guildSPSMultiplier += (member.spsMultiplier - 1);
                        }

                        if (member.specialEffect) {
                            switch (member.specialEffect) {
                                case "cost_reduction_2": this.gameState.guildCostReduction += 0.02; break;
                                case "cost_reduction_5": this.gameState.guildCostReduction += 0.05; break;
                                case "prestige_boost_10": this.gameState.guildPrestigeBonus += 0.10; break;
                                case "global_god_boost": this.gameState.guildGlobalMultiplier *= member.spsMultiplier; break;
                            }
                        }
                    }
                }
            });

            this.gameState.prestigePointMultiplier += this.gameState.guildPrestigeBonus;
            this.gameState.globalSPSMultiplier *= this.gameState.guildGlobalMultiplier;

            // --- 5. ACHIEVEMENTS (Bugfix: Jetzt wird es korrekt addiert!) ---
            achievementsData.forEach((achievement, index) => {
                if (this.gameState.achievementsUnlocked[index]) {
                    const bonus = achievement.bonus;
                    switch (bonus.type) {
                        case 'sps_mult':
                            this.gameState.globalSPSMultiplier += bonus.value;
                            break;
                        case 'click_mult':
                            // WICHTIG: Hier addieren wir zum Sammel-Wert, statt direkt zu setzen
                            prestigeClickMultiplier += bonus.value;
                            break;
                        case 'prestige_efficiency':
                            this.gameState.prestigePointMultiplier += bonus.value;
                            break;
                        case 'global_mult':
                            this.gameState.globalSPSMultiplier += bonus.value;
                            prestigeClickMultiplier += bonus.value;
                            break;
                    }
                }
            });

            // --- 6. FINALISIERUNG ---
            // Jetzt wird alles zusammengerechnet
            this.gameState.klickKraftMultiplier = baseClickMultiplier + prestigeClickMultiplier;

            const prestigeBonus = 1 + (this.gameState.gesamt_prestige_punkte * this.gameState.prestigePointMultiplier);
            const resetBonus = 1 + (this.gameState.prestigeResets * this.gameState.prestigeResetBonus);

            this.gameState.globalerPrestigeMultiplikator = prestigeBonus * resetBonus * this.gameState.globalSPSMultiplier * (1 + this.gameState.guildSPSMultiplier);
        }

    spawnFloatingText(event, amount, type = 'normal') {
            let x = event ? event.clientX : window.innerWidth / 2;
            let y = event ? event.clientY : window.innerHeight / 2;

            const randomX = (Math.random() - 0.5) * 40;
            const randomY = (Math.random() - 0.5) * 40;

            const el = document.createElement('div');
            el.className = `floating-text ${type}`;

            // Logik für Vorzeichen: Boss-Schaden kriegt "-", Einnahmen kriegen "+"
            if (type === 'boss-damage') {
                el.innerText = `-${this.formatNumber(amount)}`;
            } else {
                el.innerText = `+${this.formatNumber(amount)}`;
            }

            el.style.left = `${x + randomX}px`;
            el.style.top = `${y + randomY}px`;

            document.body.appendChild(el);

            setTimeout(() => {
                el.remove();
            }, 1000);
        }

    // ================================================================================================================
    // 3. KERNLOGIK (Kauf & Reset)
    // ================================================================================================================

    // WICHTIG: 'e' als Parameter hinzufügen!
        klickeSmiley(e) {
                let damage = this.getClickStrength();
                let isCrit = false;

                // Crit Berechnung
                if (this.gameState.critChance > 0 && Math.random() < this.gameState.critChance) {
                    damage *= this.gameState.critDamageMult;
                    isCrit = true;
                }

                // WICHTIG: Hier nutzen wir jetzt auch die zentrale Funktion!
                // (Vorher stand hier this.gameState.aktuelle_smileys += damage)
                this.addSmileys(damage);
                this.gameState.totalClicksLifetime++;
                this.playClickSound();

                // --- VISUALS ---
                if (e) {
                // HIER muss der Aufruf stehen:
                this.animateSmiley(); 

                // Zahlen formatieren und anzeigen
                let text = this.formatNumber(damage);
                if (isCrit) {
                    this.showClickEffect(e, text, 'crit');
                } else {
                    this.showClickEffect(e, text, 'normal');
                }
            }

                this.checkAchievements();
                this.updateUI();
            }

    getClickStrength() {
            // 1. Basis & Klick-Spezifische Multiplikatoren (Forschung, Pets, etc.)
            let strength = this.gameState.klickKraft * this.gameState.klickKraftMultiplier;

            // Prestige-spezifische Klick-Boni (falls vorhanden)
            const prestigeEffects = this.calculatePrestigeEffects();
            if (prestigeEffects) {
                strength *= prestigeEffects.clickMultiplier;
            }

            // --- NEU: DER GLOBALE MULTIPLIKATOR ---
            // Jetzt profitieren Klicks auch von deinen 38k Prestige-Punkten!
            if (this.gameState.globalerPrestigeMultiplikator > 1) {
                strength *= this.gameState.globalerPrestigeMultiplikator;
            }

            // 2. God Mode (Diamant Shop Upgrade 9)
            strength *= this.gameState.godModeMultiplier;

            // 3. Synergie-Matrix (SPS addiert zum Klick) - Additiv am Ende
            if (this.gameState.clickSPSRatio > 0) {
                strength += (this.gameState.totalSPS * this.gameState.clickSPSRatio);
            }

            return Math.floor(strength);
        }

    kaufeMehrereGebaeude(index, amount) {
        let item;
        let isUnique =  index === DIAMOND_MINE_INDEX;

        if (isUnique) {
            item = uniqueBuildingsData.find(u =>  (index === DIAMOND_MINE_INDEX && u.id === 'diamond_mine'));
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

            const nextCount = this.gameState.buildingCounts[index];
            this.calculateNextCost(item.basePrice, nextCount, item.growthRate, index); // Price update not strictly needed here if called in updateUI

            if (isUnique) this.applyAllBoni();

            this.checkAchievements();
            this.updateUI();
        }
    }

    getBuildingCost(index, count) {
        const buildingData = [...buildingsData, ...uniqueBuildingsData][index];
        if (!buildingData) return Infinity;

        const currentCount = count !== undefined ? count : this.gameState.buildingCounts[index];
        const basePrice = buildingData.basePrice;
        const growthRate = buildingData.growthRate;

        let cost = basePrice * Math.pow(growthRate, currentCount);

        // Wende den akkumulierten Kostenreduktions-Multiplikator an (Global Upgrades + Pet Boni)
        const costMultiplier = this.getBuildingCostMultiplier(index);
        cost *= costMultiplier;

        return Math.ceil(cost); // Wichtig: Kosten müssen immer ganzzahlig sein
    }

    getBuildingCostMultiplier(buildingIndex) {
        let multiplier = 1;

        // 1. RABATTE DURCH GLOBAL UPGRADES
        globalUpgrades.forEach((upgrade, index) => {
            if (this.gameState.researchStatus[index] === true) {

                // Prüfen, ob es eine Kostenreduktion für DIESES Gebäude ist
                if (upgrade.type === 'cost_reduction_buildings' && upgrade.buildingIndex === buildingIndex) {
                    multiplier *= (1 - upgrade.value);
                }
            }
        });

        // 2. RABATTE DURCH AKTIVES PET (Pet Fish)
        if (this.gameState.activePet) {
            const pet = petsData.find(p => p.id === this.gameState.activePet && p.effectType === 'cost_reduction_buildings');

            if (pet) {
                const currentLevel = this.gameState.petLevels[pet.id] || 0;
                if (currentLevel > 0) {
                    const stats = this.calculatePetStat(pet, currentLevel);
                    // Der Pet-Rabatt wird als ADDITION angewendet (z.B. 0.05 für 5%)
                    // Multiplikator = Multiplikator * (1 - Pet-Rabatt)
                    multiplier *= (1 - stats.currentEffect);
                }
            }
        }

        if (this.gameState.globalCostReduction > 0) {
                    multiplier *= (1 - this.gameState.globalCostReduction);
                }

                // 4. Gilden-Rabatt (Händler & Baumeister)
                        if (this.gameState.guildCostReduction > 0) {
                            multiplier *= (1 - this.gameState.guildCostReduction);
                        }

                        return multiplier;
    }

  // ===========================================
      // NEUE HILFSFUNKTION (Muss in die Klasse!)
      // ===========================================
      getGlobalUpgradeCost(upgrade) {
          let price = upgrade.cost;
          let discount = 0;

          // A. Prestige Rabatt
          const prestigeEffects = this.calculatePrestigeEffects();
          if (prestigeEffects && prestigeEffects.costReduction) {
              discount += prestigeEffects.costReduction;
          }

          // B. Globaler Rabatt (Shop)
          if (this.gameState.globalCostReduction) {
              discount += this.gameState.globalCostReduction;
          }

          // C. Pet Rabatt (Eule) - Hier prüfen wir das aktive Pet!
          if (this.gameState.activePet) {
              // WICHTIG: Wir suchen in den Daten nach dem aktiven Pet
              const pet = petsData.find(p => p.id === this.gameState.activePet);
              // Ist es die Eule (cost_reduction_upgrades)?
              if (pet && pet.effectType === 'cost_reduction_upgrades') {
                  const level = this.gameState.petLevels[pet.id] || 0;
                  if (level > 0) {
                      const stats = this.calculatePetStat(pet, level);
                      discount += stats.currentEffect;
                  }
              }
          }

          // Maximal 90% Rabatt
          if (discount > 0.9) discount = 0.9;

          return Math.ceil(price * (1 - discount));
      }

      // ===========================================
      // DEINE UPDATE FUNKTION (Korrigiert)
      // ===========================================
      updateGlobalUpgradeUI() {
          const container = this.getById('global-upgrades-container');
          if (!container) return;
          container.innerHTML = '';

          // 1. Gruppieren
          const groups = {};
          globalUpgrades.forEach(upgrade => {
              const groupKey = upgrade.buildingIndex !== undefined ? upgrade.buildingIndex : -1;
              if (!groups[groupKey]) groups[groupKey] = [];
              groups[groupKey].push(upgrade);
          });

          const upgradesToRender = [];

          // 2. Filtern & Sortieren
          Object.keys(groups).sort((a, b) => parseInt(a) - parseInt(b)).forEach(key => {
              const groupList = groups[key];
              groupList.sort((a, b) => a.id - b.id);

              const nextUpgrade = groupList.find(u => !this.gameState.researchStatus[u.id]);

              if (nextUpgrade) {
                  const bIndex = nextUpgrade.buildingIndex;
                  const isGlobal = (bIndex === undefined || bIndex === -1);
                  const hasBuilding = bIndex >= 0 && this.gameState.buildingCounts[bIndex] > 0;

                  if (isGlobal || hasBuilding) {
                      upgradesToRender.push(nextUpgrade);
                  }
              }
          });

          if (upgradesToRender.length === 0) {
              container.innerHTML = '<div style="padding:20px; color:#888; text-align:center;">Alle verfügbaren Upgrades erforscht! <br> <small>Kaufe mehr Gebäude für neue Upgrades.</small></div>';
              return;
          }

          // 3. Anzeigen
          upgradesToRender.forEach(upgrade => {
              // HIER IST DIE KORREKTUR: (upgrade) statt (upgrade.id)
              const finalCost = this.getGlobalUpgradeCost(upgrade);

              const canAfford = this.gameState.aktuelle_smileys >= finalCost;

              let groupTitle = 'Global / Klick';
              let typeIcon = '⚡';

              if (upgrade.buildingIndex !== undefined && upgrade.buildingIndex > -1) {
                  if (typeof buildingsData !== 'undefined' && buildingsData[upgrade.buildingIndex]) {
                      groupTitle = buildingsData[upgrade.buildingIndex].name;
                      typeIcon = '📈';
                  } else {
                      groupTitle = 'Gebäude-Upgrade';
                  }
              } else {
                  if (upgrade.type === 'click_mult') typeIcon = '🖱️';
                  if (upgrade.type === 'cost_reduction_buildings') typeIcon = '💸';
              }

              const div = document.createElement('div');
              div.className = 'research-item';

              div.innerHTML = `
                  <div class="research-content">
                      <div class="research-title-row">
                          <span class="research-group-name">${groupTitle}</span>
                          <span class="research-name">${typeIcon} ${upgrade.name || 'Upgrade'}</span>
                      </div>
                      <div class="research-desc">
                          ${upgrade.description}
                      </div>
                  </div>

                  <div class="research-action">
                      <span class="research-cost" style="color: ${canAfford ? '#4CAF50' : '#ff5252'};">
                          ${this.formatNumber(finalCost)}
                      </span>
                      <button class="btn-buy-research" data-id="${upgrade.id}" data-amount="1"
                          ${!canAfford ? 'disabled' : ''}
                          style="
                              padding: 4px 10px;
                              font-size: 0.8rem;
                              background: ${canAfford ? '#009ffd' : '#333'};
                              color: ${canAfford ? '#fff' : '#888'};
                              border: none;
                              border-radius: 4px;
                              cursor: ${canAfford ? 'pointer' : 'not-allowed'};
                              width: 100%;
                          ">
                          Kaufen
                      </button>
                  </div>
              `;
              container.appendChild(div);
          });
      }

   kaufeGlobalUpgrade(id) {
           // 1. Upgrade finden
           const upgrade = globalUpgrades.find(u => u.id === id);
           if (!upgrade) {
               console.error("Upgrade nicht gefunden mit ID:", id);
               return;
           }

           // 2. Prüfen, ob schon gekauft
           if (this.gameState.researchStatus[upgrade.id]) {
               this.showNotification("Bereits gekauft!", "info");
               return;
           }

           // 3. Kosten berechnen (Basis-Preis minus Rabatte)
           let finalCost = upgrade.cost;

           // --- Rabatt-Logik ---
           let discount = 0;

           // A. Prestige Rabatt
           const prestigeEffects = this.calculatePrestigeEffects(); // Deine existierende Methode
           if (prestigeEffects && prestigeEffects.costReduction) {
               discount += prestigeEffects.costReduction;
           }

           // B. Globaler Rabatt (z.B. aus dem Diamant-Shop)
           if (this.gameState.globalCostReduction) {
               discount += this.gameState.globalCostReduction;
           }

           // C. Pet Rabatt (Eule)
           if (this.gameState.activePet) {
               const pet = petsData.find(p => p.id === this.gameState.activePet && p.effectType === 'cost_reduction_upgrades');
               if (pet) {
                   const level = this.gameState.petLevels[pet.id] || 0;
                   if (level > 0) {
                       const stats = this.calculatePetStat(pet, level);
                       discount += stats.currentEffect;
                   }
               }
           }

           // Rabatt anwenden (Maximal 90% Rabatt erlauben, damit es nicht kostenlos wird)
           if (discount > 0.9) discount = 0.9;
           finalCost = finalCost * (1 - discount);
           finalCost = Math.ceil(finalCost); // Runde auf ganze Zahlen

           // 4. Kauf durchführen
           if (this.gameState.aktuelle_smileys >= finalCost) {
               // Bezahlen
               this.gameState.aktuelle_smileys -= finalCost;

               // Freischalten
               this.gameState.researchStatus[upgrade.id] = true;

               // Boni sofort neu berechnen!
               this.applyAllBoni();

               // Speichern & UI Updates
               this.speichereSpiel();
               this.updateUI();
               this.updateGlobalUpgradeUI(); // Liste aktualisieren (damit es verschwindet/gekauft aussieht)

               this.showNotification(`Upgrade "${upgrade.name || 'Upgrade'}" gekauft!`, 'success');
           } else {
               this.showNotification(`Nicht genug Smileys! Benötigt: ${this.formatNumber(finalCost)}`, 'error');
           }
       }

    kaufePrestigeUpgrade(id) {
        const upgrade = prestigeUpgrades.find(u => u.id === id);
        if (!upgrade) return;

        const requirementsMet = upgrade.requirements.every(reqId => this.gameState.prestigeUpgradeStatus[reqId]);

        if (this.gameState.prestigeUpgradeStatus[id] || this.gameState.prestige_punkte_verfügbar < upgrade.cost || !requirementsMet) {
            return;
        }

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
        // 1. Genug Punkte?
        if (this.gameState.prestige_punkte_verfügbar < upgrade.cost) return false;

        // 2. Parents Check (Sind alle Vorgänger gekauft?)
        if (upgrade.parents && upgrade.parents.length > 0) {
            for (let parentId of upgrade.parents) {
                // Finde den Index des Eltern-Upgrades
                const parentIndex = this.prestigeUpgrades.findIndex(u => u.id === parentId);
                // Wenn ein Elternteil NICHT gekauft ist -> False
                if (!this.gameState.prestigeUpgradeStatus[parentIndex]) {
                    return false;
                }
            }
        }

        // Wenn keine Parents da sind (Start-Knoten) oder alle gekauft sind -> True
        return true;
    }

    tryBuyPrestigeUpgrade(upgrade) {
        // 1. Schon gekauft?
        if (this.gameState.prestigeUpgradeStatus[upgrade.id]) return;

        // Sicherheits-Check: Falls requirements undefined ist, nutzen wir eine leere Liste []
        const reqs = upgrade.requirements || [];

        // 2. Voraussetzungen erfüllt?
        const requirementsMet = reqs.every(reqId => this.gameState.prestigeUpgradeStatus[reqId]);

        if (!requirementsMet) {
            this.showNotification("Du musst erst die vorherigen Skills freischalten!", "error");
            return;
        }

        // 3. Genug Punkte?
        if ((this.gameState.prestige_punkte_verfügbar || 0) >= upgrade.cost) {
            // Kaufen & Abziehen
            this.gameState.prestige_punkte_verfügbar -= upgrade.cost;
            this.gameState.prestigeUpgradeStatus[upgrade.id] = true;

            this.showNotification(`Skill "${upgrade.name || 'Upgrade'}" gelernt!`, "success");

            // --- HIER WAR DER FEHLER ---
            this.speichereSpiel(); // <--- Korrigiert von saveGameState() auf speichereSpiel()
            // ---------------------------

            this.updatePrestigeUI();
            this.updateUI(); // Unlocks aktualisieren

        } else {
            this.showNotification(`Nicht genug Punkte! Benötigt: ${upgrade.cost}`, "error");
        }
    }

    prestigeReset() {
        const prestigePointThreshold = 100000;
        const totalPotentialPoints = Math.floor(Math.pow(this.gameState.gesammelte_smileys / prestigePointThreshold, 1 / 3));
        const pointsToGain = Math.max(0, totalPotentialPoints - this.gameState.gesamt_prestige_punkte);

        if (pointsToGain <= 0) {
            console.warn("Nicht genug Smileys gesammelt, um neue Prestige-Punkte zu verdienen.");
            return;
        }

        if (!confirm(`Bist du sicher, dass du das Spiel zurücksetzen und ${pointsToGain} Prestige-Punkte verdienen möchtest?`)) {
            return;
        }

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
                    if (upgrade) {
                        refundedPoints += upgrade.cost;
                    }
                }
            });

            if (refundedPoints > 0) {
                if (!confirm("Möchtest du wirklich alle investierten Prestige-Punkte zurücksetzen? Dieser Schritt kann nicht rückgängig gemacht werden.")) {
                    return;
                }

                // NEU: Pet-Level werden als permanenter Fortschritt NICHT zurückgesetzt.
                // Wir müssen aber das aktive Pet deaktivieren.
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

                // KRITISCHE KORREKTUR: Sicherstellen, dass der Zähler mindestens 0 ist
                const currentCount = this.gameState.diamondShopPurchases[id] || 0;

                // Prüfung auf Maximalkäufe
                if (upgrade.maxPurchases && currentCount >= upgrade.maxPurchases) {
                    console.warn("Upgrade bereits maximal gekauft.");
                    return;
                }

                // --- KRITISCHE PRÜFUNG: Währung ---
                if (this.gameState.diamanten < upgrade.cost) {
                    console.warn("Nicht genug Diamanten.");
                    return;
                }

                // Kaufen
                this.gameState.diamanten -= upgrade.cost;
                this.gameState.diamondShopPurchases[id] = currentCount + 1; // Jetzt: 0 + 1 = 1 (Zahl!)

                // Spezielle Logik für Freischaltungen
                if (upgrade.type === "auto_diamond_mine") {
                    this.gameState.autoDiamondMineUnlocked = true;
                }

                // Preise und Multiplikatoren aktualisieren
                this.applyAllBoni();
                this.updateUI();
                this.renderDiamondMineContent();
                this.speichereSpiel();
            }

    checkAchievements() {
        achievementsData.forEach((achievement, index) => {
            // Falls schon freigeschaltet, überspringen
            if (this.gameState.achievementsUnlocked[index]) return;

            let isMet = false;
            const req = achievement.requirement;

            switch (req.type) {
                case 'building_count':
                    if (this.gameState.buildingCounts[req.target] >= req.value) isMet = true;
                    break;
                case 'total_clicks':
                    if (this.gameState.totalClicksLifetime >= req.value) isMet = true;
                    break;
                case 'lifetime_smileys':
                    if (this.gameState.lifetime_smileys >= req.value) isMet = true;
                    break;
                case 'guild_joined':
                    if (this.gameState.guildName !== null) isMet = true;
                    break;
            }

            if (isMet) {
                this.gameState.achievementsUnlocked[index] = true;
                this.showNotification(`🏆 Meilenstein erreicht: ${achievement.name}`, 'success');
                this.applyAllBoni(); // Boni neu berechnen
                this.speichereSpiel();
            }
        });
    }

    // ================================================================================================================
    // 4. PETS LOGIK
    // ================================================================================================================

    levelUpPet(petId) {
            if (!this.gameState.petsUnlocked) {
                console.warn("Pet-System nicht freigeschaltet.");
                return;
            }

            const pet = petsData.find(p => p.id === petId);

            // Level holen
            const currentLevel = this.gameState.petLevels[petId] || 0;

            // Werte berechnen
            const stats = this.calculatePetStat(pet, currentLevel);

            if (stats.isMaxLevel) return;

            // Prüfen ob genug Diamanten da sind
            if (this.gameState.diamanten < stats.nextCost) {
                this.showNotification(`Nicht genug Diamanten! (${this.formatNumber(stats.nextCost)} benötigt)`, 'error');
                return;
            }

            // --- KAUF DURCHFÜHREN ---
            this.gameState.diamanten -= stats.nextCost;
            this.gameState.petLevels[petId] = currentLevel + 1; // Level erhöhen

            // Wenn das Pet neu gekauft wurde (Lv 0 -> 1), automatisch aktivieren
            if (currentLevel === 0) {
                this.activatePet(petId);
            }

            this.applyAllBoni();
            this.updateUI();       // Aktualisiert das Active Pet Display (Links)
            this.renderPetShop();  // <--- WICHTIG: Aktualisiert sofort den Button im Shop!
            this.speichereSpiel();
        }
    // activatePet anpassen (Prüfung auf petLevels statt petStatus)
    activatePet(petId) {
                // Prüfen, ob man das Pet überhaupt besitzt
                if ((this.gameState.petLevels[petId] || 0) <= 0) return;

                if (this.gameState.activePet === petId) {
                    this.gameState.activePet = null; // Deaktivieren
                } else {
                    this.gameState.activePet = petId; // Aktivieren
                }

                this.applyAllBoni();
                this.updatePetInterval(); // Falls es der Hund (Auto-Clicker) ist

                this.updateUI();       // Update Hauptanzeige
                this.renderPetShop();  // Update Shop-Buttons

                // NEU: Damit Upgrade-Preise (Eule) sofort aktualisiert werden!
                this.updateGlobalUpgradeUI();

                this.speichereSpiel();
            }
    // ================================================================================================================
    // 5. DIAMANTEN MINE LOGIK
    // ================================================================================================================

    startDiamondMinigame() {
        const MINE_INDEX = DIAMOND_MINE_INDEX;
        const mineCount = this.gameState.buildingCounts[MINE_INDEX] || 0;
        const DURATION = 5000; // 5 Sekunden Laufzeit

        // Sicherheits-Check
        if (this.gameState.diamondMinigameRunning || mineCount === 0) return;

        // --- START ---
        this.currentMinigameClicks = 0;
        this.gameState.diamondMinigameRunning = true;
        this.updateUI(); // Setzt Button-Text

        const progressBar = this.getById('minigame-bar');
        const resultText = this.getById('minigame-result');

        if (resultText) {
            resultText.style.color = '#fff';
            resultText.innerText = 'Hämmer auf den Button! (Klick Klick!)';
        }

        // --- BALKEN-ANIMATION (Manuell via JS) ---
        // Wir löschen alte Animationen, falls vorhanden
        if (this.barInterval) clearInterval(this.barInterval);

        let progress = 0;
        const step = 100 / (DURATION / 50); // Wie viel % pro 50ms (Update-Rate)

        if (progressBar) {
            progressBar.style.transition = 'none'; // CSS-Automatik aus
            progressBar.style.width = '0%';

            this.barInterval = setInterval(() => {
                progress += step;
                if (progress >= 100) progress = 100;
                progressBar.style.width = `${progress}%`;

                if (progress >= 100) {
                    clearInterval(this.barInterval);
                }
            }, 50);
        }

        // --- LOGIK-TIMER (Das Ende) ---
        this.gameState.diamondMinigameTimer = setTimeout(() => {
            try {
                console.log("Minigame Timer abgelaufen. Berechne...");

                let baseGain = 5 * mineCount;
                let clickBonus = Math.floor(this.currentMinigameClicks * 0.5 * mineCount);

                // Boni berechnen
                if (this.gameState.activePet) {
                    const pet = petsData.find(p => p.id === this.gameState.activePet && p.effectType === 'prestige_point_eff');
                    if (pet) {
                        // Sicherstellen, dass Level existiert
                        const level = this.gameState.petLevels[pet.id] || 0;
                        if (level > 0) {
                            const stats = this.calculatePetStat(pet, level);
                            baseGain *= (1 + stats.currentEffect);
                            clickBonus *= (1 + stats.currentEffect);
                        }
                    }
                }

                let totalGain = Math.floor(baseGain + clickBonus);
                this.gameState.diamanten += totalGain;

                // UI Feedback
                if (resultText) {
                    resultText.innerHTML = `
                        <span style="color: #4CAF50">Erfolg!</span> Basis: ${Math.floor(baseGain)} + Klicks: ${Math.floor(clickBonus)} =
                        <strong style="color: #009ffd;">+${totalGain} 💎</strong>
                    `;
                }

                console.log(`Diamanten gutgeschrieben: ${totalGain}`);

            } catch (error) {
                console.error("Fehler im Minigame-Ende:", error);
            } finally {
                // AUFRÄUMEN (Wird immer ausgeführt, auch bei Fehlern)
                this.gameState.diamondMinigameRunning = false;
                this.currentMinigameClicks = 0;

                // Bar zurücksetzen (kurz warten, damit man 100% sieht)
                setTimeout(() => {
                    if (progressBar) progressBar.style.width = '0%';
                }, 1000);

                this.updateUI();
                this.speichereSpiel();
            }
        }, DURATION);
    }

    // ================================================================================================================
    // 6. GILDEN LOGIK
    // ================================================================================================================

    foundGuild(name) {
        const COST = 500000000;

        if (this.gameState.guildName) {
            console.warn("Gilde bereits gegründet.");
            return false;
        }
        if (this.gameState.aktuelle_smileys < COST) {
            console.warn("Nicht genug Smileys, um die Gilde zu gründen.");
            return false;
        }

        this.gameState.aktuelle_smileys -= COST;
        this.gameState.guildName = name || "Smiley Legion";

        this.updateUI();
        this.speichereSpiel();
        this.renderGuildsContent();
        return true;
    }

    buyGuildUpgrade(id) {
            // 1. Upgrade in den Daten suchen
            const upgrade = guildUpgradesData.find(u => u.id === id);

            // Sicherheits-Checks
            if (!upgrade) return;
            if (this.gameState.guildUpgradeStatus[id]) return; // Schon gekauft
            if (!this.gameState.guildName) {
                console.warn("Gilde muss zuerst gegründet werden.");
                return;
            }

            // --- WICHTIGER FIX: Wir nutzen 'baseCost' ---
            // Früher hieß das vielleicht nur 'cost', jetzt heißt es in data.js 'baseCost'
            const preis = upgrade.baseCost;

            // 2. Währung prüfen
            if (this.gameState.aktuelle_smileys < preis) {
                console.warn("Nicht genug Smileys für dieses Gilden-Mitglied.");
                return;
            }

            // 3. Kaufen
            this.gameState.aktuelle_smileys -= preis; // Hier wird jetzt sicher eine Zahl abgezogen
            this.gameState.guildUpgradeStatus[id] = true;

            // 4. Speichern & UI Updates
            this.applyAllBoni(); // Neue Boni berechnen
            this.updateUI();     // Smiley-Anzeige oben aktualisieren
            this.renderGuildsContent(); // Shop-Fenster aktualisieren (Button deaktivieren)
            this.speichereSpiel();

            // Optional: Feedback
            this.showNotification(`${upgrade.name} wurde angeheuert!`, 'success');
        }

        // ===========================================
            // ⚔️ GILDEN BOSS (RAID) LOGIK
            // ===========================================

            startGuildBoss() {
                if (this.gameState.guildBossFighting) return;

                // Boss Werte berechnen (HP wächst exponentiell: 1000 * 1.5^Level)
                const level = this.gameState.guildBossLevel;
                const hp = Math.floor(1000 * Math.pow(1.5, level - 1));

                this.gameState.guildBossMaxHP = hp;
                this.gameState.guildBossHP = hp;
                this.gameState.guildBossFighting = true;
                this.gameState.guildBossTimer = 30; // 30 Sekunden Zeit

                this.renderGuildsContent(); // UI auf "Kampf" umschalten

                // Timer starten
                if (this.bossInterval) clearInterval(this.bossInterval);

                this.bossInterval = setInterval(() => {
                    if (!this.gameState.guildBossFighting) {
                        clearInterval(this.bossInterval);
                        return;
                    }

                    this.gameState.guildBossTimer -= 1;

                    // UI Update (Timer & HP Bar)
                    const timerDisplay = this.getById('boss-timer-display');
                    if (timerDisplay) timerDisplay.innerText = this.gameState.guildBossTimer + "s";

                    // Zeit abgelaufen? -> Niederlage
                    if (this.gameState.guildBossTimer <= 0) {
                        this.endGuildBoss(false);
                    }
                }, 1000);
            }

            clickGuildBoss(e) {
                    if (!this.gameState.guildBossFighting) return;

                    // Schaden berechnen (Globaler Multiplikator wirkt jetzt auch hier!)
                    let damage = this.getClickStrength();
                    let isCrit = false;

                    // Crit Berechnung
                    if (this.gameState.critChance > 0 && Math.random() < this.gameState.critChance) {
                        damage *= this.gameState.critDamageMult;
                        isCrit = true;
                    }

                    this.gameState.guildBossHP -= damage;

                    // --- VISUALS: Rote Zahlen spawnen! ---
                    if (e) {
                        this.spawnFloatingText(e, damage, 'boss-damage');

                        // Wenn Crit, dann vielleicht noch extra Text oder größer?
                        if (isCrit) {
                            // Optional: Extra "CRIT!" Text
                            // this.spawnFloatingText(e, "CRIT!", "crit");
                        }
                    }

                    this.updateBossUI();

                    if (this.gameState.guildBossHP <= 0) {
                        this.endGuildBoss(true);
                    }
                }

            endGuildBoss(victory) {
                clearInterval(this.bossInterval);
                this.gameState.guildBossFighting = false;

                if (victory) {
                    // Belohnung: 10 Diamanten * BossLevel
                    const reward = this.gameState.guildBossLevel * 10;
                    this.gameState.diamanten += reward;
                    this.gameState.guildBossLevel++; // Boss wird stärker

                    this.showNotification(`BOSS BESIEGT! +${reward} 💎`, 'success');
                    // Konfetti oder Sound könnte hier hin
                } else {
                    this.showNotification("Zeit abgelaufen! Der Boss ist entkommen.", 'error');
                    // Boss HP resettet sich beim nächsten Start automatisch
                }

                this.updateUI();
                this.renderGuildsContent(); // Zurück zum Start-Screen
                this.speichereSpiel();
            }

            updateBossUI() {
                const hpBar = this.getById('boss-hp-bar');
                const hpText = this.getById('boss-hp-text');

                if (hpBar && hpText) {
                    const pct = Math.max(0, (this.gameState.guildBossHP / this.gameState.guildBossMaxHP) * 100);
                    hpBar.style.width = `${pct}%`;
                    hpText.innerText = `${this.formatNumber(this.gameState.guildBossHP)} / ${this.formatNumber(this.gameState.guildBossMaxHP)}`;
                }
            }

           // ===========================================
               // 📜 GILDEN QUESTS LOGIK (Korrigiert)
               // ===========================================

               generateGuildQuests() {
                   // FIX: this.gameState... verwenden!
                   if (!this.gameState.guildAvailableQuests) this.gameState.guildAvailableQuests = []; // Sicherheits-Init

                   // Nur neue Quests generieren, wenn wir weniger als 3 zur Auswahl haben
                   if (this.gameState.guildAvailableQuests.length >= 3) return;

                   const questNames = ["Patrouille im Wald", "Vorräte liefern", "Banditen verjagen", "Verlorenen Schatz suchen", "Drachen-Späher", "Königliche Eskorte"];
                   const rarities = [
                       { name: "Gewöhnlich", multi: 1, color: "#fff", chance: 0.6 },
                       { name: "Selten", multi: 3, color: "#009ffd", chance: 0.3 },
                       { name: "Legendär", multi: 10, color: "#ff9800", chance: 0.1 }
                   ];

                   // Auffüllen bis wir 3 Quests haben
                   while (this.gameState.guildAvailableQuests.length < 3) {
                       const name = questNames[Math.floor(Math.random() * questNames.length)];

                       // Zufällige Seltenheit bestimmen
                       const r = Math.random();
                       let rarity = rarities[0];
                       if (r > 0.9) rarity = rarities[2];
                       else if (r > 0.6) rarity = rarities[1];

                       // Dauer: Zwischen 1 und 10 Minuten (in Sekunden)
                       const duration = Math.floor(Math.random() * 600) + 60;

                       // Belohnung: Basiert auf deiner aktuellen SPS
                       let rewardValue = Math.max(1000, this.gameState.totalSPS * duration * 0.5);
                       rewardValue *= rarity.multi;

                       // Seltene Chance auf Diamanten bei Legendären Quests
                       let isDiamond = false;
                       if (rarity.name === "Legendär" && Math.random() > 0.5) {
                           isDiamond = true;
                           rewardValue = Math.max(5, Math.floor(duration / 60));
                       }

                       this.gameState.guildAvailableQuests.push({
                           id: Date.now() + Math.random(),
                           name: name,
                           rarity: rarity,
                           duration: duration,
                           reward: Math.floor(rewardValue),
                           isDiamond: isDiamond,
                           startTime: null
                       });
                   }
               }

              startQuest(questId) {
                      // --- FIX 1: Limit prüfen ---
                      // Wenn wir schon eine aktive Quest haben, brechen wir ab.
                      if (this.gameState.guildActiveQuests && this.gameState.guildActiveQuests.length >= 3) {
                                  this.showNotification("Deine Gilde ist voll ausgelastet (Max. 3 Missionen)!", "error");
                                  return;
                              }

                              // ... (Der Rest der Funktion bleibt exakt gleich wie vorher) ...
                              const index = this.gameState.guildAvailableQuests.findIndex(q => q.id === questId);
                              if (index === -1) return;

                              const quest = this.gameState.guildAvailableQuests[index];

                              if (!this.gameState.guildUpgradeStatus.some(status => status)) {
                                  this.showNotification("Du brauchst Gilden-Mitglieder für Missionen!", "error");
                                  return;
                              }

                              quest.startTime = Date.now();

                              if (!this.gameState.guildActiveQuests) this.gameState.guildActiveQuests = [];
                              this.gameState.guildActiveQuests.push(quest);

                              this.gameState.guildAvailableQuests.splice(index, 1);

                              this.renderGuildsContent();
                              this.speichereSpiel();
                          }

               claimQuest(questId) {
                   // Hier war es schon fast richtig, aber sicherheitshalber auch prüfen
                   if (!this.gameState.guildActiveQuests) return;

                   const index = this.gameState.guildActiveQuests.findIndex(q => q.id === questId);
                   if (index === -1) return;

                   const quest = this.gameState.guildActiveQuests[index];

                   // Ist sie wirklich fertig?
                   const elapsed = (Date.now() - quest.startTime) / 1000;
                   if (elapsed < quest.duration) return;

                   // Belohnung gutschreiben
                   if (quest.isDiamond) {
                       this.gameState.diamanten += quest.reward;
                       this.showNotification(`Quest abgeschlossen: +${quest.reward} 💎`, "success");
                   } else {
                       this.gameState.aktuelle_smileys += quest.reward;
                       this.gameState.lifetime_smileys += quest.reward;
                       this.showNotification(`Quest abgeschlossen: +${this.formatNumber(quest.reward)} Smileys`, "success");
                   }

                   // Quest löschen
                   this.gameState.guildActiveQuests.splice(index, 1);

                   // Sofort neue Quests nachladen
                   this.generateGuildQuests();

                   this.renderGuildsContent();
                   this.updateUI();
                   this.speichereSpiel();
               }

    // ================================================================================================================
    // 7. RENDERING & UI-UPDATES
    // ================================================================================================================

    updateUI() {
            // === INITIALISIERUNG (Muss immer zuerst passieren) ===
            this.computeTotalSPS();

            // ============================================================
            // PHASE 1: Die Grundlagen (August/September 2025)
            // Einfache Währungsanzeigen, Klicks und Sekunden-Berechnung
            // ============================================================

            // Diamanten (Waren früh als Währung geplant)
            const diamantenEl = this.getById('diamanten_anzeige');
            if (diamantenEl) diamantenEl.innerText = this.formatNumber(this.gameState.diamanten);

            // Der Kern des Spiels: Smileys
            const aktuelleSmileysEl = this.getById('aktuelle_smileys');
            if (aktuelleSmileysEl) aktuelleSmileysEl.innerText = this.formatNumber(this.gameState.aktuelle_smileys);

            // Klick-Kraft Anzeige
            const smileysProKlickEl = this.getById('smileys_pro_klick_anzeige');
            if (smileysProKlickEl) {
                const totalClickPower = this.gameState.klickKraft * this.gameState.klickKraftMultiplier;
                smileysProKlickEl.innerText = this.formatNumber(totalClickPower);
            }

            // SPS (Smileys per Second) Anzeige
            const smileysProSekundeEl = this.getById('smileys_pro_sekunde_anzeige');
            if (smileysProSekundeEl) smileysProSekundeEl.innerText = this.formatNumber(this.gameState.totalSPS);

            // SPM (Smileys per Minute) Anzeige
            const smileysProMinuteEl = this.getById('smileys_pro_minute_anzeige');
            if (smileysProMinuteEl) smileysProMinuteEl.innerText = this.formatNumber(this.gameState.totalSPS * 60);

            // Die ersten Gebäude
            this.updateBuildingUI();


            // ============================================================
            // PHASE 2: Erweiterungen & Unlocks (Oktober 2025)
            // Feature-Unlocks, Klick-Multiplikatoren und UI-Verfeinerung
            // ============================================================

            // Prüfen, ob neue Bereiche sichtbar werden sollen
            this.checkFeatureUnlocks();

            // Klick-Multiplikator Anzeige
            const klickMultiDisplay = this.getById('klick_multiplikator_anzeige');
            if (klickMultiDisplay) {
                klickMultiDisplay.innerText = `x${this.gameState.klickKraftMultiplier.toFixed(2)}`;
            }


            // ============================================================
                    // PHASE 3: Das Prestige System (November 2025)
                    // Der Skill-Tree, Global Multiplier und der Fortschrittsbalken
                    // ============================================================

                    // Globaler Multiplikator (mit neuem Tooltip)
                    const globalMultiDisplay = this.getById('globaler_multiplikator_anzeige');
                    if (globalMultiDisplay) {
                        globalMultiDisplay.innerText = `x${this.gameState.globalerPrestigeMultiplikator.toFixed(2)}`;

                        // Tooltip Berechnung (Sicherheits-Checks: || 1)
                        const pF = (1 + (this.gameState.gesamt_prestige_punkte * this.gameState.prestigePointMultiplier)) || 1;
                        const rF = (1 + (this.gameState.prestigeResets * this.gameState.prestigeResetBonus)) || 1;
                        const uF = this.gameState.globalSPSMultiplier || 1;
                        const gF = (1 + this.gameState.guildSPSMultiplier) || 1;

                        globalMultiDisplay.title = `Prestige: x${pF.toFixed(2)} | Resets: x${rF.toFixed(2)} | Upgrades: x${uF.toFixed(2)} | Gilden: x${gF.toFixed(2)}`;
                    }

                    // --- Prestige Fortschrittsbalken Logik (Gefixed) ---
                    const prestigePointThreshold = 100000; // Gleicher Wert wie oben!
                                const lifetime = this.gameState.lifetime_smileys || 0;

                                // WICHTIG: Wir holen uns den GEWINN aus der zentralen Funktion
                                const pointsToGain = this.calculatePrestigeGain();

                                // Um den nächsten Meilenstein zu berechnen:
                                // Aktuelle Punkte + Gewinn = Wo wir gerade stehen
                                const currentTotalLevel = (this.gameState.gesamt_prestige_punkte || 0) + pointsToGain;
                                const nextLevelTarget = currentTotalLevel + 1;

                                // Wie viele Smileys braucht man für das nächste Level?
                                const smileysForNext = Math.pow(nextLevelTarget, 3) * prestigePointThreshold;
                                const smileysForCurrent = Math.pow(nextLevelTarget - 1, 3) * prestigePointThreshold;

                                // Prozentbalken berechnen
                                const progressInLevel = lifetime - smileysForCurrent;
                                const totalNeededForLevel = smileysForNext - smileysForCurrent;

                                let percentage = 0;
                                if (totalNeededForLevel > 0) percentage = (progressInLevel / totalNeededForLevel) * 100;
                                percentage = Math.max(0, Math.min(100, percentage));

                                // UI Update
                                const bar = this.getById('prestige-progress-bar');
                                const textNext = this.getById('next-prestige-threshold');
                                const textPercent = this.getById('prestige-percent-text');

                                if (bar) bar.style.width = percentage + '%';
                                if (textNext) textNext.innerText = this.formatNumber(smileysForNext);

                                if (textPercent) {
                                    if (pointsToGain > 0) {
                                        // Zeige Gewinn in Grün
                                        textPercent.innerText = `+${pointsToGain} Punkte!`;
                                        textPercent.style.color = '#00ff00';
                                        textPercent.style.textShadow = '0 0 5px rgba(0, 255, 0, 0.5)';
                                    } else {
                                        // Zeige Prozent in Weiß
                                        textPercent.innerText = percentage.toFixed(2) + '%';
                                        textPercent.style.color = '#ffffff';
                                        textPercent.style.textShadow = 'none';
                                    }
                                }

                    // Live-Update für Prestige-View (wenn offen)
                    const prestigeView = document.getElementById('view-prestige');
                    if (prestigeView && prestigeView.classList.contains('active')) {
                         if (typeof this.updatePrestigeUIView === 'function') this.updatePrestigeUIView();
                    }


            // ============================================================
            // PHASE 4: Content Expansion (Dezember 2025)
            // Pets, Minigames und Diamanten-Mine
            // ============================================================

            // Pets
            this.updatePetButtons();

            // Diamanten-Mine Status
            this.updateDiamondMineStatus();

            // Minigame Modal (Live Render)
            const mineModal = this.getById('diamond-mine-modal');
            if (mineModal && mineModal.style.display === 'flex') {
                 this.renderDiamondMineContent();
            }


            // ============================================================
            // PHASE 5: High-Level Features (Januar 2026)
            // Gilden-System und Boss-Kämpfe
            // ============================================================

            // Gilden Button Status
            this.updateGuildsButton();

            // Gilden Modal Live-Update (Boss HP Balken etc.)
            const guildsModal = this.getById('guilds-modal');
            if (guildsModal && guildsModal.style.display === 'flex') {
                if (this.guildView === 'quests' || (this.guildView === 'boss' && this.gameState.guildBossFighting)) {
                    this.renderGuildsContent();
                }
            }
        }



    updateBuildingUI() {
            // HIER WIRD AUF DIE KORREKTE METHODE UMGESTELLT: getBuildingCost

            buildingsData.forEach((building, index) => {

                // --- KORREKTUR: Verwende getBuildingCost für die tatsächlichen Kosten ---
                const cost1x = this.getBuildingCost(index, this.gameState.buildingCounts[index]);

                let cost10x = 0;
                for (let i = 0; i < 10; i++) cost10x += this.getBuildingCost(index, this.gameState.buildingCounts[index] + i);
                let cost100x = 0;
                for (let i = 0; i < 100; i++) cost100x += this.getBuildingCost(index, this.gameState.buildingCounts[index] + i);
                // --------------------------------------------------------------------------

                const baseBuildingSPS = (this.gameState.buildingCounts[index] || 0) * (building.baseSPS || 0) * (building.prestigeMulti || 1);
                const actualBuildingSPS = baseBuildingSPS * this.gameState.globalerPrestigeMultiplikator;
                const spsPercentage = this.gameState.totalSPS > 0 ? (actualBuildingSPS / this.gameState.totalSPS * 100) : 0;

                const countElement = this.getById(`building-count-${index}`);
                if (countElement) countElement.innerText = this.gameState.buildingCounts[index];
                const spsElement = this.getById(`building-sps-${index}`);
                if (spsElement) spsElement.innerText = this.formatNumber(actualBuildingSPS);
                const spsPctElement = this.getById(`building-sps-pct-${index}`);
                if (spsPctElement) spsPctElement.innerText = spsPercentage.toFixed(1);

                const btn1x = this.getById(`buy-1-${index}`);
                if (btn1x) {
                    btn1x.innerHTML = `1x (${this.formatNumber(cost1x)})`;
                    btn1x.disabled = this.gameState.aktuelle_smileys < cost1x;
                }
                const btn10x = this.getById(`buy-10-${index}`);
                if (btn10x) {
                    btn10x.innerHTML = `10x (${this.formatNumber(cost10x)})`;
                    btn10x.disabled = this.gameState.aktuelle_smileys < cost10x;
                }
                const btn100x = this.getById(`buy-100-${index}`);
                if (btn100x) {
                    btn100x.innerHTML = `100x (${this.formatNumber(cost100x)})`;
                    btn100x.disabled = this.gameState.aktuelle_smileys < cost100x;
                }
            });
        }

    updatePrestigeUI() {
            // Berechne Fortschritt
            const currentLevel = this.gameState.prestigeLevel || 0;
            const nextLevelXP = Math.pow(10, 6 + currentLevel); // 1M * 10^Level
            const safeLifetime = this.gameState.lifetime_smileys || 0;
            const progressPercent = Math.min(100, (safeLifetime / nextLevelXP) * 100);

            // 1. Sidebar: Progress Bar (Mit Sicherheits-Check)
            const bar = this.getById('prestige-progress-bar');
            if (bar) bar.style.width = `${progressPercent}%`;

            const text = this.getById('prestige-progress-text');
            if (text) text.innerText = `${this.formatNumber(safeLifetime)} / ${this.formatNumber(nextLevelXP)}`;

            // 2. Modal: Stats & Gain (Mit Sicherheits-Check)
            const lifetimeDisp = this.getById('prestige-lifetime-display');
            if (lifetimeDisp) lifetimeDisp.innerText = this.formatNumber(safeLifetime);

            const currentDisp = this.getById('prestige-current-level');
            if (currentDisp) currentDisp.innerText = this.gameState.prestigeCurrency || 0;

            // Berechne möglichen Gewinn
            const possibleGain = this.calculatePrestigeGain ? this.calculatePrestigeGain() : 0;

            const gainDisp = this.getById('prestige-gain-display');
            if (gainDisp) {
                gainDisp.innerText = possibleGain;
                gainDisp.style.color = possibleGain > 0 ? '#4CAF50' : '#009ffd';
            }
        }

    fuehrePrestigeAus(points) {
        // 1. Prestige Währung gutschreiben (in BEIDE Töpfe)
        this.gameState.prestige_punkte_verfügbar += points; // Zum Ausgeben
        this.gameState.gesamt_prestige_punkte += points;    // Für den Fortschritt/Level

        // Zähler für Statistiken
        this.gameState.prestigeResets++;

        // 2. Alles zurücksetzen (Soft Reset)
        this.gameState.aktuelle_smileys = 0;

        // Gebäude & Preise zurücksetzen
        this.gameState.buildingCounts = this.gameState.buildingCounts.map(() => 0);
        // WICHTIG: Preise auch wieder auf Basis-Preis setzen!
        // (Dafür hast du ja buildingPrices im State, oder du berechnest sie eh dynamisch)

        // Upgrades zurücksetzen
        this.gameState.researchStatus = this.gameState.researchStatus.map(() => false);

        // UI Updates
        this.updateUI();
        this.updateGlobalUpgradeUI();
        this.updatePrestigeUI(); // Damit die neuen Prestige-Punkte sofort angezeigt werden

        this.showNotification(`Prestige erfolgreich! +${points} Smiley Points erhalten!`, 'success');
    }

    zeigePrestigeDetails() {
        // Wir suchen das neue Fenster im HTML
        const modal = document.getElementById('prestige-modal');
        if (!modal) {
            console.error("Prestige-Modal nicht gefunden! Hast du den HTML-Code eingefügt?");
            return;
        }

        // Werte berechnen
        // Fallback auf aktuelle Smileys, falls Lifetime noch 0 ist (damit nicht 0 steht)
        const totalSmileys = this.gameState.lifetime_smileys > 0
            ? this.gameState.lifetime_smileys
            : this.gameState.aktuelle_smileys;

        const potentialPoints = this.calculatePrestigeGain();
        const currentPrestige = this.gameState.prestige_currency || 0;

        // Text im Fenster aktualisieren (wir nutzen sicherheitshalber getElementById direkt)
        const elLifetime = document.getElementById('prestige-lifetime-display');
        const elLevel = document.getElementById('prestige-current-level');
        const elGain = document.getElementById('prestige-gain-display');

        if (elLifetime) elLifetime.innerText = this.formatNumber(totalSmileys);
        if (elLevel) elLevel.innerText = currentPrestige;
        if (elGain) elGain.innerText = potentialPoints;

        // DAS WICHTIGSTE: Fenster anzeigen (statt alert)
        modal.style.display = 'flex';

        // Buttons im Fenster aktivieren
        const btnConfirm = document.getElementById('btn-do-prestige');
        const btnCancel = document.getElementById('btn-cancel-prestige');

        // Alten Event-Listener entfernen (durch Klonen), damit er nicht doppelt feuert
        const newBtnConfirm = btnConfirm.cloneNode(true);
        btnConfirm.parentNode.replaceChild(newBtnConfirm, btnConfirm);

        const newBtnCancel = btnCancel.cloneNode(true);
        btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);

        // Neue Klick-Events setzen
        newBtnConfirm.onclick = () => {
            if (potentialPoints > 0) {
                this.fuehrePrestigeAus(potentialPoints);
                modal.style.display = 'none';
            } else {
                // Hier nutzen wir unser schönes Toast-System statt Alert!
                this.showNotification("Du brauchst mehr Smileys für einen Prestige-Punkt!", "error");
            }
        };

        newBtnCancel.onclick = () => {
            modal.style.display = 'none';
        };
    }

    calculatePrestigeGain() {
            // 1. Lifetime Smileys holen
            const totalSmileys = this.gameState.lifetime_smileys || 0;

            // 2. Kostenfaktor (Muss überall gleich sein, z.B. 100k)
            const BLOCK_COST = 100000;

            if (totalSmileys < BLOCK_COST) return 0;

            // 3. Totales Level berechnen (Was man insgesamt erreicht hat)
            const totalLevel = Math.floor(Math.cbrt(totalSmileys / BLOCK_COST));

            // 4. Was man schon besitzt
            const currentLevel = this.gameState.gesamt_prestige_punkte || 0;

            // 5. Ergebnis: Nur die DIFFERENZ (Der Gewinn)
            return Math.max(0, totalLevel - currentLevel);
        }

    showNotification(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';

        // Optional: Unterschiedliche Farben für verschiedene Events
        if (type === 'success') toast.style.borderLeftColor = '#4CAF50'; // Grün
        if (type === 'error') toast.style.borderLeftColor = '#f44336';   // Rot

        toast.innerText = message;
        container.appendChild(toast);

        // Animation starten (kurze Verzögerung für CSS-Transition)
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Nach 3 Sekunden entfernen
        setTimeout(() => {
            toast.classList.remove('show');
            // Warten bis die Ausblend-Animation fertig ist, dann löschen
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    showSkillTooltip(upgrade, e) {
            const tooltip = this.getById('prestige-tooltip-modal');
            if (!tooltip) return;

            // 1. Text generieren
            const isPurchased = this.gameState.prestigeUpgradeStatus[upgrade.id];
            // Sicherheits-Check: Falls requirements undefined ist, leeres Array nutzen
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

            // 2. Positionieren (An der Maus!)
            tooltip.style.display = 'block';

            // Dynamische Größe des Tooltips ermitteln (statt hardcoded 320/150)
            // Das verhindert Fehler, wenn das Element noch nicht gerendert ist
            const rect = tooltip.getBoundingClientRect();
            const tooltipWidth = rect.width || 300;
            const tooltipHeight = rect.height || 150;

            // Ein bisschen Abstand zur Maus (20px nach rechts/unten)
            let x = e.clientX + 20;
            let y = e.clientY + 20;

            // Verhindern, dass er RECHTS aus dem Bild läuft
            if (x + tooltipWidth > window.innerWidth) {
                x = e.clientX - tooltipWidth - 10; // Links von der Maus anzeigen
            }

            // Verhindern, dass er UNTEN aus dem Bild läuft
            if (y + tooltipHeight > window.innerHeight) {
                y = e.clientY - tooltipHeight - 10; // Oberhalb der Maus anzeigen
            }

            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        }

    updatePetButtons() {
            const petShopModal = this.getById('pet-shop-modal');
            if (!petShopModal) return;

            const openButton = this.getById('open-pet-shop-button');
            const petGrid = this.getById('pet-shop-grid');
            const lockMessage = this.getById('pet-lock-message');

            if (openButton) {
                openButton.style.display = this.gameState.petsUnlocked ? 'block' : 'none';
            }

            if (!this.gameState.petsUnlocked) {
                if (lockMessage) lockMessage.style.display = 'block';
                if (petGrid) petGrid.style.display = 'none';
                if (lockMessage) {
                    lockMessage.innerHTML = `<p>Schalte Pets im Prestige Shop (Upgrade ID 8) frei!</p>`;
                }
                return;
            }

            if (lockMessage) lockMessage.style.display = 'none';
            if (petGrid) petGrid.style.display = 'grid';

            // Logik für Aktivierungstoggles
            petsData.forEach((pet) => {
                const petDiv = petGrid.querySelector(`.pet-item[data-id="${pet.id}"]`);
                if (!petDiv) return;

                // --- KORREKTUR: currentLevel verwendet Pet-ID (String) ---
                const currentLevel = this.gameState.petLevels[pet.id] || 0;
                // --------------------------------------------------------

                const isActive = this.gameState.activePet === pet.id;
                const activateButton = petDiv.querySelector('.btn-pet-activate');

                petDiv.classList.toggle('active', isActive);
                petDiv.classList.toggle('bought', currentLevel > 0);

                if (activateButton) {
                    if (currentLevel > 0) {
                        activateButton.disabled = false;
                        activateButton.innerText = isActive ? 'Deaktivieren' : 'Aktivieren';
                        activateButton.classList.toggle('btn-pet-active', isActive);
                        activateButton.classList.toggle('btn-pet-inactive', !isActive);
                    } else {
                        activateButton.disabled = true;
                        activateButton.innerText = 'Aktivieren';
                        activateButton.classList.remove('btn-pet-active', 'btn-pet-inactive');
                    }
                }
            });

            // Update Active Pet Display
            const activePetDisplayElement = this.getById('active_pet_display');
            if (activePetDisplayElement) {
                if (this.gameState.activePet) {
                    const pet = petsData.find(p => p.id === this.gameState.activePet);
                    // Hole Level für die Anzeige
                    const currentLevel = this.gameState.petLevels[this.gameState.activePet] || 0;

                    // Berechne den aktuellen Effekt
                    const stats = this.calculatePetStat(pet, currentLevel);
                    const currentEffectDisplay = (stats.currentEffect * 100).toFixed(1);

                    activePetDisplayElement.innerHTML = `
                        <img src="${pet.img}" alt="${pet.name}" class="active-pet-img">
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
        
        // Basis-Klasse (macht es schwebend)
        effect.className = 'click-effect';

        // Wenn es ein Crit ist, fügen wir die rote Klasse hinzu
        if (type === 'crit') {
            effect.classList.add('crit-style');
            effect.innerText = '💥 ' + amount; // Optional: Ein Icon davor!
        } else {
            effect.innerText = '+' + amount;
        }

        // Position setzen
        effect.style.left = `${event.clientX}px`;
        effect.style.top = `${event.clientY}px`;

        document.body.appendChild(effect);

        setTimeout(() => {
            effect.remove();
        }, 1000);
    }

    // Lässt den Smiley kurz zucken
   animateSmiley() {
        const smiley = this.getById('smiley_button'); // Deine ID
        
        if (smiley) {
            smiley.classList.add('anim-squish');

            // Warte 100ms (länger als die 0.05s im CSS), dann ploppt er zurück
            setTimeout(() => {
                smiley.classList.remove('anim-squish');
            }, 100); 
        }
    }

    // ================================================================================================================
    // 8. CONTENT RENDERING
    // ================================================================================================================

      renderPrestigeTree() {
        const container = this.getById('prestige-tree-container');
        if (!container) return;

        // 1. Welt-Container erstellen
        let world = this.getById('prestige-tree-world');
        if (!world) {
            world = document.createElement('div');
            world.id = 'prestige-tree-world';
            container.appendChild(world);
            
            // Startposition zentrieren
            this.treeX = container.clientWidth / 2;
            this.treeY = container.clientHeight / 2;
            world.style.transform = `translate(${this.treeX}px, ${this.treeY}px)`;
        }
        world.innerHTML = '';

        // 2. Canvas für Linien
        const canvas = document.createElement('canvas');
        canvas.id = 'prestige-lines';
        const CANVAS_SIZE = 4000;
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        canvas.style.position = 'absolute';
        canvas.style.left = `-${CANVAS_SIZE / 2}px`;
        canvas.style.top = `-${CANVAS_SIZE / 2}px`;
        
        // WICHTIG: Auch hier per JS nochmal setzen, falls CSS versagt
        canvas.style.pointerEvents = 'none'; 
        
        world.appendChild(canvas);

        // 3. Nodes erstellen
        const ZOOM = 10; 

        this.prestigeUpgrades.forEach(upgrade => {
            const node = document.createElement('div');
            node.className = 'skill-node';

            // Koordinaten berechnen
            const pixelX = (upgrade.x - 50) * ZOOM;
            const pixelY = (upgrade.y - 50) * ZOOM; 

            node.style.left = pixelX + 'px';
            node.style.top = pixelY + 'px';

            // Icons
            if (upgrade.category) node.classList.add('node-' + upgrade.category);

            // Status prüfen
            const upgradeIndex = this.prestigeUpgrades.findIndex(u => u.id === upgrade.id);
            const isBought = this.gameState.prestigeUpgradeStatus[upgradeIndex];
            const canBuy = this.canBuyPrestigeUpgrade(upgrade);

            // Aussehen je nach Status
            if (isBought) {
                node.classList.add('purchased');
                node.innerHTML = this.getUpgradeIcon(upgrade.type); // Icon anzeigen
            } else if (canBuy) {
                node.classList.add('available');
                node.innerText = "?";
                // Klick zum Kaufen
                node.onclick = (e) => {
                    e.stopPropagation(); // Verhindert, dass man beim Klicken versehentlich die Map zieht
                    this.buyPrestigeUpgrade(upgrade.id);
                };
            } else {
                node.classList.add('locked');
                node.innerText = "🔒";
            }

            // === TOOLTIP EVENTS (Der Hover Fix) ===
            // Maus rein -> Tooltip an
            node.addEventListener('mouseenter', (e) => {
                this.showPrestigeTooltip(e, upgrade, isBought, !canBuy && !isBought);
            });

            // Maus raus -> Tooltip aus
            node.addEventListener('mouseleave', () => {
                this.hidePrestigeTooltip();
            });

            world.appendChild(node);
        });

        // 4. Linien zeichnen
        setTimeout(() => this.drawPrestigeLines(), 50);
    }

    // === NEU: Steuerung für den Drag & Drop Skill-Tree ===
    setupSkillTreeControls() {
        const container = this.getById('prestige-tree-container');
        if (!container) return;

        // Startwerte
        this.treeX = 0;
        this.treeY = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;

        // 1. Maus drücken
        container.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.startX = e.clientX - this.treeX;
            this.startY = e.clientY - this.treeY;
            container.style.cursor = 'grabbing';
        });

        // 2. Maus loslassen (überall im Fenster)
        window.addEventListener('mouseup', () => {
            this.isDragging = false;
            if(container) container.style.cursor = 'grab';
        });

        // 3. Maus bewegen
        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault(); // Verhindert Text-Markieren

            // Neue Position berechnen
            this.treeX = e.clientX - this.startX;
            this.treeY = e.clientY - this.startY;

            // Welt bewegen
            const world = this.getById('prestige-tree-world');
            if (world) {
                world.style.transform = `translate(${this.treeX}px, ${this.treeY}px)`;
            }
        });
    }

    drawPrestigeLines() {
        const canvas = this.getById('prestige-lines');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // 1. Alles löschen
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 2. WICHTIG: Den Nullpunkt in die MITTE des Canvas schieben!
        ctx.save(); 
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Styling
        ctx.lineCap = 'round';
        const ZOOM = 10; // MUSS GLEICH SEIN WIE IN renderPrestigeTree!

        this.prestigeUpgrades.forEach(upgrade => {
            // Hat das Upgrade Eltern (Vorgänger)?
            if (upgrade.parents && upgrade.parents.length > 0) {
                
                // Ziel-Koordinaten berechnen (Relativ zur Mitte)
                const targetX = (upgrade.x - 50) * ZOOM;
                const targetY = (upgrade.y - 50) * ZOOM;

                upgrade.parents.forEach(parentId => {
                    const parentUpgrade = this.prestigeUpgrades.find(u => u.id === parentId);
                    
                    if (parentUpgrade) {
                        // Start-Koordinaten berechnen
                        const startX = (parentUpgrade.x - 50) * ZOOM;
                        const startY = (parentUpgrade.y - 50) * ZOOM;

                        // Farbe bestimmen (Gekauft = Blau, Sonst = Grau)
                        const uIndex = this.prestigeUpgrades.findIndex(u => u.id === upgrade.id);
                        const pIndex = this.prestigeUpgrades.findIndex(u => u.id === parentId);
                        
                        const isTargetBought = this.gameState.prestigeUpgradeStatus[uIndex];
                        const isParentBought = this.gameState.prestigeUpgradeStatus[pIndex];

                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        ctx.lineTo(targetX, targetY);

                        if (isTargetBought && isParentBought) {
                            ctx.strokeStyle = '#009ffd'; // Blaues Leuchten
                            ctx.lineWidth = 4;
                        } else if (isParentBought) {
                            ctx.strokeStyle = '#FFD700'; // Gold (Verfügbarer Pfad)
                            ctx.lineWidth = 2;
                        } else {
                            ctx.strokeStyle = '#333'; // Dunkelgrau (Gesperrt)
                            ctx.lineWidth = 1;
                        }
                        
                        ctx.stroke();
                    }
                });
            }
        });

        ctx.restore(); // Den Context zurücksetzen
    }

    // Hilfsfunktion für kleine Icons im Baum
    getUpgradeIcon(type) {
        if (type === 'click_mult') return '👆';
        if (type === 'sps_mult') return '⚡';
        if (type === 'cost_reduction') return '📉';
        if (type === 'unlock_pets') return '🐾';
        if (type === 'unlock_mine') return '💎';
        if (type === 'unlock_guilds') return '🏰';
        return '★';
    }

       // Tooltip Anzeige
       showPrestigeTooltip(e, upgrade, isBought, isLocked) {
        const tooltip = this.getById('prestige-tooltip-modal');
        if (!tooltip) return;

        // 1. Text generieren
        const statusText = isBought ? "✅ Gekauft" : (isLocked ? "🔒 Gesperrt (Voraussetzung fehlt!)" : "Klicken zum Kaufen");
        const colorTitle = isBought ? '#4CAF50' : (isLocked ? '#777' : '#FFD700');
        
        tooltip.innerHTML = `
            <h4 style="color:${colorTitle}; margin:0 0 5px 0;">${upgrade.name}</h4>
            <p style="font-size:0.9em; margin:0 0 10px 0; color:#ddd;">${upgrade.description}</p>
            <div style="border-top:1px solid #444; padding-top:5px; font-size:0.85em;">
                <p style="margin:0;">Kosten: <span style="color:#FFD700; font-weight:bold;">${this.formatNumber(upgrade.cost)}</span></p>
                <p style="margin:0; color:${isBought?'#4CAF50':(isLocked?'#f44336':'#aaa')}">${statusText}</p>
            </div>
        `;

        // 2. Anzeigen, um Größe zu berechnen
        tooltip.style.display = 'block';

        // 3. Intelligente Positionierung
        const rect = tooltip.getBoundingClientRect();
        const offset = 15; // Abstand zur Maus
        
        let left = e.clientX + offset;
        let top = e.clientY + offset;

        // Passt es rechts nicht mehr hin? -> Nach Links schieben
        if (left + rect.width > window.innerWidth) {
            left = e.clientX - rect.width - offset;
        }

        // Passt es unten nicht mehr hin? -> Nach Oben schieben
        if (top + rect.height > window.innerHeight) {
            top = e.clientY - rect.height - offset;
        }

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

       hidePrestigeTooltip() {
           const tooltip = this.getById('prestige-tooltip-modal');
           if (tooltip) tooltip.style.display = 'none';
       }

       // Kauf-Logik (Angepasst an Requirements Array)
       buyPrestigeUpgrade(id) {
           if (!this.gameState.prestigeUpgrades) this.gameState.prestigeUpgrades = [];
           if (this.gameState.prestigeUpgrades.includes(id)) return;

           // Nutze DEINE Variable 'prestigeUpgrades'
           const upgrade = prestigeUpgrades.find(u => u.id === id);
           if (!upgrade) return;

           // Requirements Check (Array!)
           if (upgrade.requirements && upgrade.requirements.length > 0) {
               const allMet = upgrade.requirements.every(reqId => this.gameState.prestigeUpgrades.includes(reqId));
               if (!allMet) {
                   this.showNotification("Voraussetzungen nicht erfüllt!", "error");
                   return;
               }
           }

           // Geld Check
           if (this.gameState.prestigeCurrency >= upgrade.cost) {
               this.gameState.prestigeCurrency -= upgrade.cost;
               this.gameState.prestigeUpgrades.push(id);

               // Feature Unlocks direkt triggern
               if (upgrade.type === 'unlock_pets') this.showNotification("🐶 Pet Shop freigeschaltet!", "success");
               if (upgrade.type === 'unlock_mine') this.showNotification("💎 Mine freigeschaltet!", "success");
               if (upgrade.type === 'unlock_guilds') this.showNotification("⚔️ Gilden freigeschaltet!", "success");

               // WICHTIG: Buttons sichtbar machen
               this.checkFeatureUnlocks();
               this.recalculateGlobalMultipliers(); // Globalen Bonus neu berechnen

               this.showNotification(`${upgrade.name} gekauft!`, "success");
               this.speichereSpiel();
               this.renderPrestigeTree(); // Neu zeichnen
               this.updateUI(); // UI updaten wegen Geldabzug
           } else {
               this.showNotification("Nicht genug Prestige-Punkte!", "error");
           }
       }

       // Helper: Features sichtbar machen (Buttons)
       checkFeatureUnlocks() {
           if (typeof prestigeUpgrades === 'undefined') return;
           const upgrades = this.gameState.prestigeUpgrades || [];

           // Prüfe anhand der IDs oder Typen in deiner Liste
           const hasPets = upgrades.some(id => prestigeUpgrades.find(u => u.id === id)?.type === 'unlock_pets');
           const hasMine = upgrades.some(id => prestigeUpgrades.find(u => u.id === id)?.type === 'unlock_mine');
           const hasGuilds = upgrades.some(id => prestigeUpgrades.find(u => u.id === id)?.type === 'unlock_guilds');

           // Buttons ein/ausblenden
           const btnPets = this.getById('open-pet-shop-button');
           if(btnPets) btnPets.style.display = hasPets ? 'block' : 'none';

           const btnMine = this.getById('open_diamond_mine_button');
           if(btnMine) btnMine.style.display = hasMine ? 'block' : 'none';

           const btnGuilds = this.getById('open_guilds_button');
           if(btnGuilds) btnGuilds.style.display = hasGuilds ? 'block' : 'none';
       }

    renderPetShop() {
            const petGrid = this.getById('pet-shop-grid');
            if (!petGrid) return;
            petGrid.innerHTML = '';

            petsData.forEach((pet) => { // Index entfernt, da wir nur die Pet-ID verwenden
                const petDiv = document.createElement('div');
                petDiv.className = 'pet-item';
                petDiv.dataset.id = pet.id;

                // --- KORREKTUR: currentLevel verwendet Pet-ID (String) ---
                const currentLevel = this.gameState.petLevels[pet.id] || 0;
                // --------------------------------------------------------

                const stats = this.calculatePetStat(pet, currentLevel);

                let buyButtonHtml = '';
                let statusText;
                let buttonClass = 'btn-buy-pet';

                if (currentLevel === pet.maxLevel) {
                    statusText = `Max Level (${pet.maxLevel})`;
                    buyButtonHtml = `<button class="btn-confirm" disabled>Max Level</button>`;
                } else {
                    // Level 0 ist der "Kauf"
                    const canAfford = this.gameState.diamanten >= stats.nextCost;
                    statusText = `Level ${currentLevel} -> ${currentLevel + 1}`;

                    buyButtonHtml = `
                        <button class="${buttonClass}" data-id="${pet.id}" ${canAfford ? '' : 'disabled'}>
                            ${currentLevel === 0 ? 'Kaufen' : 'Level Up'} (${this.formatNumber(stats.nextCost)} 💎)
                        </button>
                    `;
                }

                // Anzeige des aktuellen Effekts (formatiert)
                const currentEffectDisplay = (stats.currentEffect * 100).toFixed(currentLevel >= 10 ? 1 : 0);
                let bonusDescription = pet.description.replace('%', currentEffectDisplay);

                petDiv.innerHTML = `
                    <img src="${pet.img}" alt="${pet.name}" class="pet-img">
                    <h3>${pet.name} (Lv. ${currentLevel})</h3>
                    <p class="pet-description">Bonus: ${bonusDescription}</p>
                    <p class="pet-status">Nächste Stufe: ${statusText}</p>
                    <div class="pet-actions">
                        ${buyButtonHtml}
                        <button class="btn-pet-activate btn-pet-inactive" data-id="${pet.id}"
                                ${currentLevel === 0 ? 'disabled' : ''}>
                            Aktivieren
                        </button>
                    </div>
                `;
                petGrid.appendChild(petDiv);
            });
        }

    diamondMineView = 'mine';

   renderDiamondMineContent() {
       const container = this.getById('diamond-mine-content');
       if (!container) return;

       // Titel aktualisieren
       const modalTitle = container.closest('.modal-content')?.querySelector('h2');
       if (modalTitle) modalTitle.innerHTML = `💎 Diamanten-Mine & Shop`;

       const MINE_INDEX = DIAMOND_MINE_INDEX;
       const mineDefinition = uniqueBuildingsData.find(u => u.id === 'diamond_mine');
       if (!mineDefinition) return;
       const mineCount = this.gameState.buildingCounts[MINE_INDEX] || 0;

       // --- FALL 1: Mine noch nicht gekauft ---
       if (mineCount === 0) {
           const mineCost = this.getBuildingCost(MINE_INDEX, 0);
           const canAfford = this.gameState.aktuelle_smileys >= mineCost;

           container.innerHTML = `
               <h3>Schalte die ${mineDefinition.name} frei</h3>
               <p style="color: #aaa;">Die Mine wird benötigt, um Diamanten zu sammeln und den Shop freizuschalten.</p>
               <p>Kosten: <span style="color: #fff; font-weight: bold;">${this.formatNumber(mineCost)} Smileys</span></p>
               <button id="buy-diamond-mine-button" class="btn-buy" data-index="${MINE_INDEX}" ${canAfford ? '' : 'disabled'} style="width: 100%; margin-top: 10px;">
                   Mine Kaufen
               </button>
           `;
           return;
       }

       // --- FALL 2: Mine gekauft (Hauptansicht) ---

       // WICHTIG: Prüfen, ob das Grundgerüst (Tabs) schon da ist.
       // Wenn JA (!hasNav), bauen wir NICHT neu, damit der Balken überlebt!
       const hasNav = container.querySelector('.mine-nav');

       if (!hasNav) {
           // Erstmaliges Rendern (Baut das HTML auf)
           container.innerHTML = `
               <div class="mine-nav">
                   <button id="mine-tab-mine" class="${this.diamondMineView === 'mine' ? 'active' : ''}">Minispiel</button>
                   <button id="mine-tab-shop" class="${this.diamondMineView === 'shop' ? 'active' : ''}">Diamanten Shop</button>
               </div>
               <div id="mine-dynamic-content" style="min-height: 200px;"></div>
               <p style="text-align: center; margin-top: 15px; border-top: 1px solid #333; padding-top: 10px;">
                   Deine Diamanten: <strong id="shop-diamanten-anzeige" style="color: #009ffd;">${this.formatNumber(this.gameState.diamanten)}</strong> 💎
               </p>
           `;

           // Event Listener für Tabs (nur einmal hinzufügen)
           this.getById('mine-tab-mine').addEventListener('click', () => {
               this.diamondMineView = 'mine';
               // Hier erzwingen wir ein Re-Render, indem wir den Container leeren,
               // damit beim Tab-Wechsel der Inhalt stimmt.
               container.innerHTML = '';
               this.renderDiamondMineContent();
           });
           this.getById('mine-tab-shop').addEventListener('click', () => {
               this.diamondMineView = 'shop';
               container.innerHTML = '';
               this.renderDiamondMineContent();
           });
       } else {
           // Update Modus: Nur Diamanten-Anzeige aktualisieren
           const diamDisplay = this.getById('shop-diamanten-anzeige');
           if(diamDisplay) diamDisplay.innerText = this.formatNumber(this.gameState.diamanten);
       }

       // Inhalt des aktiven Tabs rendern
       const dynamicContent = this.getById('mine-dynamic-content');
       if (dynamicContent) {
           if (this.diamondMineView === 'mine') {
               this.renderDiamondMinigame(dynamicContent);
           } else if (this.diamondMineView === 'shop') {
               this.renderDiamondShopContent(dynamicContent);
           }
       }
   }

    renderDiamondMinigame(targetContainer) {
        const container = targetContainer || this.getById('minigame-placeholder');
        if (!container) return;

        const MINE_INDEX = DIAMOND_MINE_INDEX;
        const mineCount = this.gameState.buildingCounts[MINE_INDEX] || 0;

        // --- Berechnung der Werte ---
        let BONUS_DIAMOND = 5 * mineCount;
        // Pet Bonus Berechnung
        if (this.gameState.activePet) {
            const pet = petsData.find(p => p.id === this.gameState.activePet && p.effectType === 'prestige_point_eff');
            if (pet) {
                const currentLevel = this.gameState.petLevels[pet.id] || 0;
                if (currentLevel > 0) {
                    const stats = this.calculatePetStat(pet, currentLevel);
                    BONUS_DIAMOND *= (1 + stats.currentEffect);
                }
            }
        }
        BONUS_DIAMOND = Math.floor(BONUS_DIAMOND);

        // --- SCHRITT 1: HTML nur erstellen, wenn es noch nicht da ist ---
        if (!this.getById('start-minigame-button')) {
            container.innerHTML = `
                <h3 style="color: #009ffd; margin-bottom: 20px; text-shadow: 0 0 10px rgba(0,159,253,0.3);">
                    Minispiel: Aktive Schürfung
                </h3>

                <div style="text-align: left; margin-bottom: 5px; color: #aaa;">
                    Ertrag pro erfolgreicher Schürfung: <strong id="minigame-base-reward" style="color: #fff;">${BONUS_DIAMOND} 💎</strong>
                </div>

                <div class="minigame-progress-container">
                    <div id="minigame-bar" style="width: 0%;"></div>
                </div>

                <div id="minigame-result" style="height: 40px; color: #8fa38f; font-style: italic; margin-bottom: 10px;">
                    Bereit zum Starten.
                </div>

                <button id="start-minigame-button">
                    <span class="pickaxe-icon">⛏️</span>
                    <span id="minigame-btn-text">Schürfen starten</span>
                </button>
            `;

            // Event Listener (Wird nur EINMAL hinzugefügt)
            const startBtn = this.getById('start-minigame-button');
            startBtn.addEventListener('click', () => {
                if (!this.gameState.diamondMinigameRunning) {
                    this.startDiamondMinigame();
                } else {
                    // Klick-Bonus während es läuft
                    this.currentMinigameClicks = (this.currentMinigameClicks || 0) + 1;

                    // Visueller Effekt beim Klicken
                    startBtn.style.transform = 'scale(0.95)';
                    setTimeout(() => startBtn.style.transform = 'scale(1)', 50);

                    // Feedback Text direkt aktualisieren
                    const resultText = this.getById('minigame-result');
                    if (resultText) {
                        resultText.style.color = '#fff';
                        // Zeige sofort an, dass geklickt wurde
                        resultText.innerHTML = `Power: <span style="color: #ff3333; font-size: 1.2em;">${this.currentMinigameClicks}</span> 🔥`;
                    }
                }
            });
        }

        // --- SCHRITT 2: Nur Texte aktualisieren (Soft Update) ---
        // Das läuft bei jedem updateUI(), zerstört aber nicht den Balken!

        // Status Text aktualisieren (nur wenn das Spiel NICHT läuft, sonst überschreiben wir den Klick-Zähler)
        if (!this.gameState.diamondMinigameRunning) {
            const btnText = this.getById('minigame-btn-text');
            if (btnText) btnText.innerText = "Schürfen starten";

            // Ergebnis nur anzeigen, wenn nicht gerade "Abgeschlossen" da steht (Logik in startDiamondMinigame)
            // Hier machen wir nichts, damit der Abschluss-Text stehen bleibt.
        } else {
            const btnText = this.getById('minigame-btn-text');
            if (btnText) btnText.innerText = "SCHÜRFE LÄUFT... (KLICK!)";
        }

        // Basis-Ertrag aktualisieren (falls Upgrades gekauft wurden)
        const rewardDisplay = this.getById('minigame-base-reward');
        if (rewardDisplay) rewardDisplay.innerText = `${BONUS_DIAMOND} 💎`;
    }

    renderDiamondShopContent(targetContainer) {
            // Wir verwenden den übergebenen Container.
            const container = targetContainer;
            if (!container) return;

            // Aktualisiere Diamanten-Anzeige oben im Modal
            const diamondDisplay = this.getById('shop-diamanten-anzeige');
            if (diamondDisplay) diamondDisplay.innerText = this.formatNumber(this.gameState.diamanten);

            // 1. Erstelle das HTML mit dem inneren Grid-Container
            container.innerHTML = `<div class="info-grid" id="diamond-shop-grid-inner"></div>`;
            const innerGrid = this.getById('diamond-shop-grid-inner');

            if (!innerGrid) { // Sicherheits-Check
                console.error("Fehler: innerGrid konnte nicht im DOM gefunden werden.");
                return;
            }

            let shopHtml = '';

            // 2. HTML für Upgrades generieren
            // HINWEIS: diamondShopUpgrades muss hier verfügbar sein.
            diamondShopUpgrades.forEach((upgrade, index) => {
                const count = this.gameState.diamondShopPurchases[index] || 0;
                const isPurchased = count > 0;
                const isMaxed = upgrade.maxPurchases && count >= upgrade.maxPurchases;

                const canAfford = this.gameState.diamanten >= upgrade.cost;

                const stateClass = isMaxed ? 'purchased' : (canAfford ? 'available' : 'locked');
                const buttonText = isMaxed ? 'Gekauft' : `Kaufen (${this.formatNumber(upgrade.cost)} 💎)`;

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

            // 3. HTML in das Grid einfügen
            innerGrid.innerHTML = shopHtml;

            // 4. Listener NUR auf die NEU ERSTELLTEN Buttons anwenden
            innerGrid.querySelectorAll('.btn-buy-diamond').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id, 10);
                    this.buyDiamondShopUpgrade(id);
                    // Optional: Kurzer Log zur Bestätigung
                    console.log(`[Shop] Klick auf Upgrade ID: ${id}`);
                });
            });
        }

    // Speichert, welchen Tab wir gerade sehen ('shop' oder 'boss')
        guildView = 'shop';

        renderGuildsContent() {
                const container = this.getById('guilds-content');
                if (!container) return;

                // ===========================================
                // FALL 1: GILDE NOCH NICHT GEGRÜNDET
                // ===========================================
                if (!this.gameState.guildName) {
                    const COST = 500000000;
                    const canAfford = this.gameState.aktuelle_smileys >= COST;
                    container.innerHTML = `
                        <h3>Gilde Gründen</h3>
                        <p>Gründe Deine eigene Gilde für Bosse und Quests.</p>
                        <p><strong>Kosten:</strong> ${this.formatNumber(COST)} Smileys</p>
                        <input type="text" id="guild-name-input" placeholder="Gildenname eingeben" maxlength="20">
                        <button id="found-guild-button" class="btn-confirm" ${canAfford ? '' : 'disabled'}>Gilde Gründen</button>
                    `;
                    this.getById('found-guild-button')?.addEventListener('click', () => {
                        const val = this.getById('guild-name-input').value;
                        if(val.length > 2) this.foundGuild(val);
                    });
                    return;
                }

                // ===========================================
                // FALL 2: GILDE EXISTIERT (TABS ANZEIGEN)
                // ===========================================
                let contentHtml = '';

                // --- TAB A: SHOP (MITGLIEDER) ---
                if (this.guildView === 'shop') {
                    let listHtml = '';
                    guildUpgradesData.forEach((u, i) => {
                       const bought = this.gameState.guildUpgradeStatus[i];
                       const cost = u.baseCost;
                       const can = this.gameState.aktuelle_smileys >= cost;
                       const icon = u.icon || '👤';

                       listHtml += `
                           <div class="guild-upgrade-item ${bought ? 'purchased' : (can ? 'available' : 'locked')}">
                               <div style="font-size:1.5em">${icon}</div>
                               <div>
                                   <h4>${u.name}</h4>
                                   <small>${u.description}</small>
                               </div>
                               <button class="btn-buy-guild" data-id="${u.id}" ${bought||!can?'disabled':''}>
                                   ${bought ? 'Aktiv' : this.formatNumber(cost)}
                               </button>
                           </div>
                       `;
                    });
                    contentHtml = `<div class="info-grid">${listHtml}</div>`;

                // --- TAB B: BOSS RAID ---
                } else if (this.guildView === 'boss') {
                    if (this.gameState.guildBossFighting) {
                         // Kampf läuft
                         const pct = Math.max(0, (this.gameState.guildBossHP / this.gameState.guildBossMaxHP) * 100);
                         contentHtml = `
                            <div class="boss-arena active" style="text-align:center;">
                                <h3>Boss Kampf läuft!</h3>
                                <div style="font-size:2em; color:red; font-weight:bold;">${this.gameState.guildBossTimer}s</div>
                                <div style="background:#333; height:20px; border-radius:10px; overflow:hidden; margin:10px 0; border:1px solid #555;">
                                    <div id="boss-hp-bar" style="width:${pct}%; height:100%; background:#d32f2f; transition:width 0.1s linear;"></div>
                                </div>
                                <p>${this.formatNumber(this.gameState.guildBossHP)} / ${this.formatNumber(this.gameState.guildBossMaxHP)} HP</p>

                                <div id="guild-boss-clicker" style="font-size:80px; cursor:crosshair; user-select:none;">👹</div>

                                <p>Klicken zum Angreifen!</p>
                            </div>`;
                    } else {
                        // Lobby
                        const nextHp = Math.floor(1000 * Math.pow(1.5, this.gameState.guildBossLevel - 1));
                        contentHtml = `
                            <div class="boss-lobby" style="text-align:center; padding:20px;">
                                <div style="font-size: 60px; margin-bottom:10px;">🏰</div>
                                <h3>Gilden-Raid (Level ${this.gameState.guildBossLevel})</h3>
                                <p>Besiege den Boss für Diamanten!</p>
                                <p>Boss HP: ${this.formatNumber(nextHp)}</p>
                                <button id="start-boss-btn" class="btn-danger" style="margin-top:15px; font-size:1.2em;">Kampf starten</button>
                            </div>`;
                    }

                // --- TAB C: QUESTS ---
                } else if (this.guildView === 'quests') {
                    this.generateGuildQuests();

                    let activeHtml = '';
                    const activeQuests = this.gameState.guildActiveQuests || [];
                    const isQuestLimitReached = activeQuests.length >= 3;

                    if (activeQuests.length > 0) {
                        activeHtml += `<h4>Laufende Missionen (${activeQuests.length} / 3)</h4>`;
                        activeQuests.forEach(q => {
                            const elapsed = (Date.now() - q.startTime) / 1000;
                            const progress = Math.min(100, (elapsed / q.duration) * 100);
                            const timeLeft = Math.max(0, Math.ceil(q.duration - elapsed));
                            const isDone = timeLeft <= 0;

                            activeHtml += `
                                <div style="background:rgba(255,255,255,0.05); border:1px solid #555; padding:10px; margin-bottom:10px; border-radius:8px;">
                                    <div style="display:flex; justify-content:space-between;">
                                        <strong>${q.name}</strong>
                                        <span>${isDone ? 'Fertig!' : timeLeft + 's'}</span>
                                    </div>
                                    <div style="background:#222; height:10px; border-radius:5px; margin:5px 0; overflow:hidden;">
                                        <div style="width:${progress}%; height:100%; background:${isDone ? '#4CAF50' : '#009ffd'}; transition:width 1s linear;"></div>
                                    </div>
                                    ${isDone ? `<button class="btn-confirm btn-claim-quest" data-id="${q.id}" style="width:100%; padding:5px; margin-top:5px;">Belohnung abholen</button>` : ''}
                                </div>
                            `;
                        });
                    } else {
                        activeHtml = `<p style="color:#888; font-style:italic; text-align:center; padding:10px;">Keine Gildenmitglieder sind unterwegs.</p>`;
                    }

                    let availableHtml = `<h4>Verfügbare Aufträge</h4><div class="info-grid">`;
                    const availQuests = this.gameState.guildAvailableQuests || [];

                    availQuests.forEach(q => {
                        const rewardText = q.isDiamond ? `${q.reward} 💎` : `${this.formatNumber(q.reward)} Smileys`;
                        const btnState = isQuestLimitReached ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : '';
                        const btnText = isQuestLimitReached ? 'Gilde voll' : 'Starten';

                        availableHtml += `
                            <div class="guild-upgrade-item" style="border-color:${q.rarity.color}">
                                <h4 style="color:${q.rarity.color}">${q.name}</h4>
                                <p style="font-size:0.9em">${q.rarity.name}</p>
                                <p>⏳ ${Math.ceil(q.duration / 60)} Min</p>
                                <p>💰 ${rewardText}</p>
                                <button class="btn-primary btn-start-quest" data-id="${q.id}" ${btnState}>${btnText}</button>
                            </div>
                        `;
                    });
                    availableHtml += `</div>`;
                    contentHtml = `<div style="padding:10px;">${activeHtml}<hr style="border-color:#444; margin:20px 0;">${availableHtml}</div>`;
                }

                // ===========================================
                // HTML IN CONTAINER SCHREIBEN
                // ===========================================
                container.innerHTML = `
                    <div style="display:flex; gap:10px; margin-bottom:20px; border-bottom:1px solid #444; padding-bottom:15px;">
                        <button id="tab-guild-shop" class="btn-primary ${this.guildView==='shop'?'':'btn-cancel'}" style="flex:1">Mitglieder</button>
                        <button id="tab-guild-boss" class="btn-primary ${this.guildView==='boss'?'':'btn-cancel'}" style="flex:1">Boss Raid</button>
                        <button id="tab-guild-quests" class="btn-primary ${this.guildView==='quests'?'':'btn-cancel'}" style="flex:1">Quests</button>
                    </div>
                    <h3>Gilde: ${this.gameState.guildName}</h3>
                    ${contentHtml}
                `;

                // ===========================================
                // EVENT LISTENER BINDEN
                // ===========================================

                // 1. TABS
                this.getById('tab-guild-shop')?.addEventListener('click', () => { this.guildView='shop'; this.renderGuildsContent(); });
                this.getById('tab-guild-boss')?.addEventListener('click', () => { this.guildView='boss'; this.renderGuildsContent(); });
                this.getById('tab-guild-quests')?.addEventListener('click', () => { this.guildView='quests'; this.renderGuildsContent(); });

                // 2. SHOP BUTTONS
                if (this.guildView === 'shop') {
                     container.querySelectorAll('.btn-buy-guild').forEach(btn => {
                        btn.addEventListener('click', (e) => this.buyGuildUpgrade(parseInt(e.target.dataset.id)));
                    });
                }

                // 3. QUEST BUTTONS
                if (this.guildView === 'quests') {
                    container.querySelectorAll('.btn-start-quest').forEach(btn => {
                        btn.addEventListener('click', (e) => this.startQuest(parseFloat(e.target.dataset.id)));
                    });
                    container.querySelectorAll('.btn-claim-quest').forEach(btn => {
                        btn.addEventListener('click', (e) => this.claimQuest(parseFloat(e.target.dataset.id)));
                    });
                }

                // 4. BOSS BUTTONS & KLICKER
                if (this.guildView === 'boss') {
                     // Start Button
                     this.getById('start-boss-btn')?.addEventListener('click', () => this.startGuildBoss());

                     // Klick auf den Boss (Oger)
                     const bossClicker = this.getById('guild-boss-clicker');
                     if(bossClicker) {
                         // WICHTIG: Hier fangen wir das Event (e) ab!
                         bossClicker.addEventListener('mousedown', (e) => {
                             bossClicker.style.transform = "scale(0.9)";

                             // Wir geben (e) an die Funktion weiter, damit die roten Zahlen an der Maus spawnen
                             this.clickGuildBoss(e);
                         });

                         bossClicker.addEventListener('mouseup', () => bossClicker.style.transform = "scale(1)");
                     }
                }
            }


    createBuildingElements() {
        const buildingGrid = this.getById('building-grid');
        if (!buildingGrid) return;
        buildingGrid.innerHTML = '';

        buildingsData.forEach((building, index) => {
            const buildingDiv = document.createElement('div');
            buildingDiv.className = 'building-item';
            buildingDiv.dataset.index = index;

            buildingDiv.innerHTML = `
            <h3>${building.name} (<span id="building-count-${index}">0</span>)</h3>
            <p class="production">Produktion: <span id="building-sps-${index}">0</span> SPS (<span id="building-sps-pct-${index}">0.0</span>%)</p>
            <div class="button-group">
                <button id="buy-1-${index}" data-amount="1" class="btn-buy">1x</button>
                <button id="buy-10-${index}" data-amount="10" class="btn-buy">10x</button>
                <button id="buy-100-${index}" data-amount="100" class="btn-buy">100x</button>
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
        if (container) containers.push({
            element: container,
            isInfo: false
        });
        if (infoContainer) containers.push({
            element: infoContainer,
            isInfo: true
        });

        containers.forEach(({
            element,
            isInfo
        }) => {
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

                const buyButtonHtml = isInfo ?
                    '' :
                    `<button class="prestige-buy-button" data-id="${upgrade.id}" style="display:none;"></button>`;

                upgradeDiv.innerHTML = `
               <div class="node-icon"></div>
               ${buyButtonHtml}
           `;
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

    setupMainEventListeners() {
            // 1. SMILEY KLICKEN
            this.getById('smiley_button')?.addEventListener('click', (e) => this.klickeSmiley(e));

            // 2. GEBÄUDE KAUFEN (Event Delegation)
            this.getById('building-grid')?.addEventListener('click', (e) => {
                const button = e.target.closest('.btn-buy');
                if (!button) return;

                const buildingItem = button.closest('.building-item');
                if (!buildingItem) return;

                const index = parseInt(buildingItem.dataset.index, 10);
                const amount = parseInt(button.dataset.amount, 10);

                if (!isNaN(index) && !isNaN(amount)) {
                    this.kaufeMehrereGebaeude(index, amount);
                }
            });

            this.getById('global-upgrades-container')?.addEventListener('click', (e) => {
                // Wir suchen das Element mit der Klasse 'btn-buy-research'
                const button = e.target.closest('.btn-buy-research');

                // Wenn kein Button geklickt wurde, brechen wir ab
                if (!button) return;

                // Daten aus dem Button lesen
                const id = parseInt(button.dataset.id, 10);
                const amount = parseInt(button.dataset.amount, 10);

                console.log("Klick auf Upgrade:", id); // <--- ZUM TESTEN

                if (!isNaN(id)) {
                    this.kaufeGlobalUpgrade(id, amount || 1);
                }
            });

            // 4. PET SHOP INTERAKTIONEN (Kaufen & Aktivieren)
            this.getById('pet-shop-grid')?.addEventListener('click', (e) => {
                const button = e.target.closest('button');
                if (!button) return;

                const petId = button.dataset.id;

                if (button.classList.contains('btn-buy-pet')) {
                    // Level Up / Kaufen
                    this.levelUpPet(petId);
                } else if (button.classList.contains('btn-pet-activate')) {
                    // Aktivieren / Deaktivieren
                    this.activatePet(petId);
                }
            });

            // 5. PET SHOP MODAL STEUERUNG
            const petModal = this.getById('pet-shop-modal');
            const openPetButton = this.getById('open-pet-shop-button');
            const closePetButton = this.getById('close-pet-shop-button');

            if (openPetButton && petModal) {
                openPetButton.addEventListener('click', () => {
                    this.updatePetButtons();
                    petModal.style.display = 'flex';
                });
            }
            if (closePetButton && petModal) {
                closePetButton.addEventListener('click', () => {
                    petModal.style.display = 'none';
                });
            }

            // 6. DIAMANT MINE & MINIGAME INTERAKTIONEN
            this.getById('diamond-mine-content')?.addEventListener('click', (e) => {
                const buyButton = e.target.closest('#buy-diamond-mine-button');
                const startButton = e.target.closest('#start-minigame-button');

                // Mine kaufen (Gebäude Index 8)
                if (buyButton) {
                    const index = parseInt(buyButton.dataset.index, 10);
                    if (index === DIAMOND_MINE_INDEX) {
                        this.kaufeMehrereGebaeude(index, 1);
                    }
                }

                // Minigame starten oder klicken
                if (startButton) {
                    if (!this.gameState.diamondMinigameRunning) {
                        this.startDiamondMinigame();
                    } else {
                        // Klick während des Spiels
                        this.currentMinigameClicks = (this.currentMinigameClicks || 0) + 1;

                        // Visueller Effekt
                        startButton.style.transform = 'scale(0.95)';
                        setTimeout(() => startButton.style.transform = 'scale(1)', 50);

                        const resultText = this.getById('minigame-result');
                        if (resultText) resultText.innerText = `Schürf-Power: ${this.currentMinigameClicks}`;
                    }
                }
            });

            // 7. DIAMANT MINE MODAL STEUERUNG
            const diamondMineModal = this.getById('diamond-mine-modal');
            const openMineButton = this.getById('open_diamond_mine_button');
            const closeMineButton = this.getById('close_diamond_mine_button');

            if (openMineButton && diamondMineModal) {
                openMineButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.updateDiamondMineStatus();
                    diamondMineModal.style.display = 'flex';
                });
            }
            if (closeMineButton && diamondMineModal) {
                closeMineButton.addEventListener('click', () => {
                    diamondMineModal.style.display = 'none';
                });
            }

            // 8. GILDEN MODAL STEUERUNG
            const guildsModal = this.getById('guilds-modal');
            const openGuildsButton = this.getById('open_guilds_button');
            const closeGuildsButton = this.getById('close_guilds_button');

            if (openGuildsButton && guildsModal) {
                openGuildsButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.renderGuildsContent();
                    guildsModal.style.display = 'flex';
                });
            }
            if (closeGuildsButton && guildsModal) {
                closeGuildsButton.addEventListener('click', () => {
                    guildsModal.style.display = 'none';
                });
            }

            window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Liste aller Modal-IDs, die geschlossen werden sollen
                const modals = [
                    'prestige-shop-modal', 
                    'skill_tree_modal', 
                    'settings-modal', 
                    'pet-shop-modal',
                    'diamond-mine-modal',
                    'guilds-modal',
                    'buildings_info_modal',
                    'global_upgrades_info_modal',
                    'info_achievements_modal',
                    'stats_info_modal',
                    'prestige_info_modal'
                ];

                let closedSomething = false;
                modals.forEach(id => {
                    const el = document.getElementById(id);
                    // Nur schließen, wenn es wirklich offen ist (display != none)
                    if (el && el.style.display && el.style.display !== 'none') {
                        el.style.display = 'none';
                        closedSomething = true;
                    }
                });

                // Wenn wir ein Fenster geschlossen haben, Sound abspielen? (Optional)
                // if (closedSomething) this.playClickSound(); 
            }
        });
    }
    


    setupPrestigeEventListeners() {
        // --- 1. PRESTIGE RESET (Das Zeitreise-Fenster) ---
        // Wir verbinden nur den Button. Die Logik zum Öffnen und Berechnen
        // liegt jetzt zentral in 'zeigePrestigeDetails()'.
        const openPrestigeModalButton = this.getById('prestige_reset_button');

        if (openPrestigeModalButton) {
            openPrestigeModalButton.addEventListener('click', () => {
                this.zeigePrestigeDetails();
            });
        }

        // (Die Buttons "Bestätigen" und "Abbrechen" IM Modal werden
        // automatisch in 'zeigePrestigeDetails' verwaltet, daher brauchen wir sie hier nicht.)


        // --- 2. SKILL TREE (Das Modal mit den Nodes) ---
        const skillTreeModal = this.getById('skill_tree_modal');
        const openSkillTreeButton = this.getById('open_skill_tree_button');
        const closeSkillTreeButton = this.getById('close_skill_tree_button');

        // Öffnen
        if (openSkillTreeButton && skillTreeModal) {
            openSkillTreeButton.addEventListener('click', () => {
                // Modal anzeigen
                skillTreeModal.style.display = 'flex';

                // WICHTIG: Jetzt den visuellen Baum zeichnen!
                // Das ersetzt das alte 'createPrestigeUpgradeElements'
                this.renderPrestigeTree();
            });
        }

        // Schließen
        if (closeSkillTreeButton && skillTreeModal) {
            closeSkillTreeButton.addEventListener('click', () => {
                skillTreeModal.style.display = 'none';
            });
        }


        // --- 3. PUNKTE ZURÜCKSETZEN (Respec) ---
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

        // 1. Punkte berechnen
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

            // 2. Reset durchführen
            this.gameState.activePet = null; // Pet deaktivieren
            this.gameState.prestige_punkte_verfügbar += refundedPoints;
            this.gameState.prestigeUpgradeStatus.fill(false); // Alle auf "falsch" setzen

            // 3. WICHTIG: Speichern & Neu berechnen
            this.applyAllBoni();

            // --- KORREKTUR HIER ---
            this.speichereSpiel(); // War vorher saveGameState()
            // ----------------------

            // 4. UI Aktualisieren
            this.updatePrestigeUI();
            this.renderPrestigeTree(); // WICHTIG: Baum neu zeichnen!
            this.updateUI();        // WICHTIG: Unlocks (Pets/Gilden) wieder ausblenden

            this.showNotification(`Reset erfolgreich! ${refundedPoints} Punkte erstattet.`, "success");
        } else {
            this.showNotification("Du hast noch keine Punkte investiert.", "info");
        }
    }

    setupInfoPageEventListeners() {
        const buildingsModal = this.getById('buildings_info_modal');
        const openBuildingsButton = this.getById('show_buildings_button');
        const closeBuildingsButton = this.getById('close_buildings_info_button');
        openBuildingsButton?.addEventListener('click', () => {

            this.createBuildingInfoElements();
            if (buildingsModal) buildingsModal.style.display = 'flex';
        });
        closeBuildingsButton?.addEventListener('click', () => {
            if (buildingsModal) buildingsModal.style.display = 'none';
        });

        const globalUpgradesModal = this.getById('global_upgrades_info_modal');
                const openGlobalUpgradesButton = this.getById('show_global_upgrades_button');
                const closeGlobalUpgradesButton = this.getById('close_global_upgrades_info_button'); // DIESE ID PRÜFEN!

                openGlobalUpgradesButton?.addEventListener('click', () => {
                    this.createInfoGlobalUpgradeElements();
                    if (globalUpgradesModal) globalUpgradesModal.style.display = 'flex';
                });

                // HIER DER WICHTIGE LISTENER:
                closeGlobalUpgradesButton?.addEventListener('click', () => {
                    if (globalUpgradesModal) globalUpgradesModal.style.display = 'none';
                });

        const prestigeModal = this.getById('prestige_info_modal');
        const openPrestigeButton = this.getById('show_prestige_button');
        const closePrestigeButton = this.getById('close_prestige_info_button');
        openPrestigeButton?.addEventListener('click', () => {
            this.createPrestigeInfoList();
            if (prestigeModal) prestigeModal.style.display = 'flex';
        });
        closePrestigeButton?.addEventListener('click', () => {
            if (prestigeModal) prestigeModal.style.display = 'none';
        });

        const statsModal = this.getById('stats_info_modal');
        const openStatsButton = this.getById('show_stats_button');
        const closeStatsButton = this.getById('close_stats_info_button');
        openStatsButton?.addEventListener('click', () => {

            this.createInfoStatsElements();
            if (statsModal) statsModal.style.display = 'flex';
        });
        closeStatsButton?.addEventListener('click', () => {
            if (statsModal) statsModal.style.display = 'none';
        });

        const petInfoModal = this.getById('pets_info_modal');
        const openPetsButton = this.getById('show_pets_button');
        const closePetsButton = this.getById('close_pets_info_button');

        openPetsButton?.addEventListener('click', () => {
            this.createInfoPetsElements();
            if (petInfoModal) petInfoModal.style.display = 'flex';
        });
        closePetsButton?.addEventListener('click', () => {
            if (petInfoModal) petInfoModal.style.display = 'none';
        });
        const achievementsModal = this.getById('achievements_info_modal');
        const openAchievementsButton = this.getById('show_achievements_button');
        const closeAchievementsButton = this.getById('close_achievements_info_button');

        openAchievementsButton?.addEventListener('click', () => {
            this.createInfoAchievementElements(); // Befüllt die Liste
            if (achievementsModal) achievementsModal.style.display = 'flex';
        });

        closeAchievementsButton?.addEventListener('click', () => {
            if (achievementsModal) achievementsModal.style.display = 'none';
        });
    }

    setupSettingsModalListeners() {
        const settingsModal = this.getById('settings-modal');
        const openSettingsButton = this.getById('open-settings-button');
        const closeSettingsButton = this.getById('close-settings-button');
        const exportButton = this.getById('export-save-button');
        const importButton = this.getById('import-save-button');
        const saveDataTextarea = this.getById('save-data-textarea');

        const musicVolumeSlider = this.getById('music-volume');
        const soundVolumeSlider = this.getById('sound-volume');

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

        openSettingsButton?.addEventListener('click', (e) => {
            e.preventDefault();
            this.speichereSpiel();
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
                        console.log("Spielstand in Zwischenablage kopiert.");
                    }, () => {
                        if (document.execCommand && saveDataTextarea.select) {
                            saveDataTextarea.select();
                            document.execCommand('copy');
                            console.log("Spielstand über execCommand in Zwischenablage kopiert.");
                        }
                    });
                } catch (err) {
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
                }
            }
        });
    }

// ================================================================================================================
// 10. INFO SEITEN RENDERING
// ================================================================================================================

createBuildingInfoElements() {
    const container = this.getById('info_buildings_container');
    if (!container) return;
    container.innerHTML = '';

    // Kombiniere beide Datensätze
    const allBuildings = [...buildingsData, ...uniqueBuildingsData];

    // Hole den aktuellen globalen Multiplikator
    const globalMulti = this.gameState.globalerPrestigeMultiplikator;

    allBuildings.forEach((building, index) => {
        // Diamanten-Mine (Index 14) überspringen
        if (index === DIAMOND_MINE_INDEX) {
            return;
        }

        const item = document.createElement('div');
        item.className = 'info-stats-item building-info-item';

        // 1. Basis SPS pro Stück (enthält nur den Prestige-Upgrade-Multi)
        const baseSPSPerUnit = building.baseSPS * (building.prestigeMulti || 1);

        // 2. Skalierte SPS für EINE Einheit (mit globalMulti)
        const scaledSPSPerUnit = baseSPSPerUnit * globalMulti;

        let icon = '🏠';

        item.innerHTML = `
            <h3>${icon} ${building.name}</h3>
            <p><strong>Basis SPS pro Stück:</strong> ${this.formatNumber(baseSPSPerUnit)}</p>
            <p><strong>Aktuelle SPS pro Stück (mit Boni):</strong> ${this.formatNumber(scaledSPSPerUnit)}</p>
            <p class="small-text">(Beinhaltet Prestige, Pets und Gilden Boni)</p>
        `;

        container.appendChild(item);
    });
}

createInfoGlobalUpgradeElements() {
    const container = this.getById('info_global_upgrades_container');
    if (!container) return;
    container.innerHTML = '';

    // Gruppiert die Upgrades nach Gebäude-Index (0-14) oder Global (-1/undefined)
    const groupedUpgrades = {};

    globalUpgrades.forEach((upgrade, index) => {
        const buildingIndex = upgrade.buildingIndex !== undefined ? upgrade.buildingIndex : -1;

        if (!groupedUpgrades[buildingIndex]) {
            groupedUpgrades[buildingIndex] = [];
        }

        // Fügt den Kaufstatus hinzu
        groupedUpgrades[buildingIndex].push({
            ...upgrade,
            isPurchased: this.gameState.researchStatus[index]
        });
    });

    let htmlContent = '';
    const buildingNames = [...buildingsData, ...uniqueBuildingsData].map(b => b.name);

    // Iteriere durch die Gruppen (Global Upgrades zuerst)
    Object.keys(groupedUpgrades).sort((a, b) => parseInt(a) - parseInt(b)).forEach(key => {
        const buildingIndex = parseInt(key, 10);
        const upgrades = groupedUpgrades[key];

        // Titel setzen (Global oder Gebäude-Name)
        const title = buildingIndex === -1 ?
            'Global (Klickkraft)' :
            `${buildingNames[buildingIndex]} (Gebäude ${buildingIndex + 1})`;

        // Status zusammenfassen
        const totalUpgrades = upgrades.length;
        const boughtCount = upgrades.filter(u => u.isPurchased).length;

        htmlContent += `
            <div class="info-group-header">
                <h3>${title}</h3>
                <p>Status: ${boughtCount} / ${totalUpgrades} Upgrades gekauft</p>
            </div>
            <div class="info-upgrade-grid">
        `;

        upgrades.forEach(upgrade => {
            let effectText;
            let effectValue = (upgrade.value * 100).toFixed(0);
            let icon = '✨';

            switch (upgrade.type) {
                case 'click_mult':
                    effectText = `Erhöht Klickkraft um ${effectValue}%`;
                    icon = '🖱️';
                    break;
                case 'building_mult':
                    effectText = `Erhöht Produktion um ${effectValue}%`;
                    icon = '📈';
                    break;
                case 'cost_reduction_buildings':
                    effectText = `Reduziert Gebäudekosten um ${effectValue}%`;
                    icon = '💸';
                    break;
                default:
                    effectText = 'Unbekannter Effekt';
            }

            const purchasedClass = upgrade.isPurchased ? 'bought-upgrade' : 'locked-upgrade';

            htmlContent += `
                <div class="info-upgrade-item ${purchasedClass}">
                    <h4>${icon} Upgrade ID ${upgrade.id}</h4>
                    <p><strong>Effekt:</strong> ${effectText}</p>
                    <p>${upgrade.description}</p>
                    <p>Kosten: ${this.formatNumber(upgrade.cost)} Smileys</p>
                </div>
            `;
        });

        htmlContent += `</div>`; // Ende info-upgrade-grid
    });

    container.innerHTML = htmlContent;
}

// Ersetzt den grafischen Baum durch eine übersichtliche Liste
    createPrestigeInfoList() {
        const container = this.getById('info_prestige_container');
        if (!container) return;

        // WICHTIG: Wir nutzen das Grid-Layout statt des Baum-Layouts
        container.className = 'info-grid';
        container.innerHTML = '';

        prestigeUpgrades.forEach(upgrade => {
            const isPurchased = this.gameState.prestigeUpgradeStatus[upgrade.id];

            // Icon Logik (Dieselbe wie im Baum)
            let icon = "★";
            if (upgrade.type === 'unlock_pets') icon = "🐾";
            if (upgrade.type === 'unlock_mine') icon = "💎";
            if (upgrade.type === 'unlock_guilds') icon = "⚔️";
            if (upgrade.type === 'click_mult') icon = "👆";
            if (upgrade.type === 'sps_mult') icon = "⚡";

            const item = document.createElement('div');
            // Wir nutzen Klassen für "gekauft" oder "noch offen"
            item.className = `info-upgrade-item ${isPurchased ? 'bought-upgrade' : ''}`;

            // Stylen basierend auf Status
            if (!isPurchased) {
                item.style.borderColor = '#555'; // Grau für nicht gekauft
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

        container.className = 'info-grid';
        container.innerHTML = '';

        // ===============================================
        // 1. RABATTE BERECHNEN (Wie vorher)
        // ===============================================
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

        // ===============================================
        // 2. GLOBALER MULTIPLIKATOR AUFSCHLÜSSELN (NEU!)
        // ===============================================

        // A. Prestige-Punkte Bonus
        // Wir nehmen die Effizienz aus dem State (da sind Shop & Pets schon drin)
        const eff = this.gameState.prestigePointMultiplier || 0.05;
        const points = this.gameState.gesamt_prestige_punkte || 0;
        const multPoints = 1 + (points * eff);

        // B. Reset Bonus
        const resets = this.gameState.prestigeResets || 0;
        const resetBonusVal = this.gameState.prestigeResetBonus || 0.01;
        const multResets = 1 + (resets * resetBonusVal);

        // C. Gilden Bonus
        const multGuild = 1 + (this.gameState.guildSPSMultiplier || 0);

        // D. Upgrades & Items (Der Rest)
        // Da der Gesamt-Multiplikator das Produkt aus allem ist, können wir den Rest errechnen:
        // Gesamt = Punkte * Resets * Gilde * Upgrades
        // Also: Upgrades = Gesamt / (Punkte * Resets * Gilde)
        let totalGlobal = this.gameState.globalerPrestigeMultiplikator || 1;
        // Sicherheits-Check gegen Division durch Null
        const divisor = (multPoints * multResets * multGuild) || 1;
        const multUpgrades = totalGlobal / divisor;

        // Hilfsfunktion Formatierung
        const fmt = (val) => (val * 100).toFixed(1) + '%';
        const xFmt = (val) => 'x' + val.toFixed(2); // z.B. x1.50

        // ===============================================
        // 3. LISTE DEFINIEREN
        // ===============================================
        const stats = [
            // FINANZEN
            { label: '💰 Aktuelle Smileys', value: this.formatNumber(this.gameState.aktuelle_smileys) },
            { label: '🏦 Lifetime Smileys', value: this.formatNumber(this.gameState.lifetime_smileys) },
            { label: '💎 Diamanten', value: this.formatNumber(this.gameState.diamanten) },

            // PRODUKTION
            { label: '⚡ Smileys pro Sekunde', value: this.formatNumber(this.gameState.totalSPS), highlight: true },
            { label: '👆 Klick-Stärke', value: this.formatNumber(this.getClickStrength()) },
            { label: '🔥 Kritische Treffer', value: `${fmt(this.gameState.critChance)} Chance / ${this.gameState.critDamageMult}x Schaden` },

            // RABATTE
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

            // MULTIPLIKATOREN (JETZT MIT DETAIL!)
            {
                label: '🚀 Produktions-Bonus',
                value: xFmt(totalGlobal),
                // HIER IST DIE NEUE AUFSCHLÜSSELUNG:
                detail: `Punkte: ${xFmt(multPoints)} | Resets: ${xFmt(multResets)} | Upgrades: ${xFmt(multUpgrades)} | Gilde: ${xFmt(multGuild)}`,
                highlight: true
            },
            {
                label: '🌟 Prestige Effizienz',
                value: fmt(eff),
                detail: `Bonus pro Prestige-Punkt (Basis + Upgrades)`
            },

            // INFO
            { label: '🏆 Prestige Resets', value: this.gameState.prestigeResets },
            { label: '🐶 Aktives Pet', value: activePetName }
        ];

        // ===============================================
        // 4. HTML BAUEN
        // ===============================================
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
    }

createInfoPetsElements() {
    const container = this.getById('info_pets_container');
    if (!container) return;
    container.innerHTML = '';

    petsData.forEach((pet) => {
        // Holt den Level-Status anhand der Pet-ID
        const petStatus = this.gameState.petLevels[pet.id] || 0;

        // Berechnung des aktuellen Bonus und der Kosten
        const stats = this.calculatePetStat(pet, petStatus);
        const currentBonusValue = stats.currentEffect;

        let bonusText = '';
        let icon = '';

        switch (pet.effectType) {
            case 'auto_click':
                bonusText = `Klickt automatisch ${petStatus}x pro Sekunde.`;
                icon = '🐕';
                break;
            case 'sps_mult':
                bonusText = `Erhöht die SPS-Rate um ${(currentBonusValue * 100).toFixed(1)}% (Global)`;
                icon = '🏭';
                break;
            case 'cost_reduction_upgrades':
                bonusText = `Reduziert Kosten für Global Upgrades um ${(currentBonusValue * 100).toFixed(1)}% (Global)`;
                icon = '🦉'; // Pet Owl
                break;
            case 'cost_reduction_buildings':
                bonusText = `Reduziert Gebäudekosten um ${(currentBonusValue * 100).toFixed(1)}% (Global)`;
                icon = '🐟'; // Pet Fish
                break;
            case 'prestige_point_eff':
                // Wird für Prestige-Punkte ODER Diamant-Minigame-Ertrag verwendet (Fox)
                bonusText = `Erhöht die Prestige-Punkt-Effektivität ODER den Minigame-Diamant-Ertrag um ${(currentBonusValue * 100).toFixed(1)}%`;
                icon = '🦊'; // Pet Fox
                break;
            default:
                bonusText = 'Unbekannter Bonus';
                icon = '❓';
        }

        const item = document.createElement('div');
        item.className = 'info-stats-item pet-info-item';
        item.innerHTML = `
            <h3>${icon} ${pet.name} (Level ${petStatus}/${pet.maxLevel})</h3>
            <p><strong>Typ:</strong> ${pet.description}</p>
            <p><strong>Aktueller Effekt:</strong> ${bonusText}</p>
            <p>
                ${petStatus < pet.maxLevel ?
                    `<strong>Nächstes Level:</strong> Kostet ${this.formatNumber(stats.nextCost)} 💎.` :
                    `<strong>Status:</strong> Maximales Level erreicht.`
                }
            </p>
        `;
        container.appendChild(item);
    });
}

    createInfoAchievementElements() {
        const container = this.getById('info_achievements_container');
        if (!container) return;
        container.innerHTML = '';

        achievementsData.forEach((achiev, index) => {
            const isUnlocked = this.gameState.achievementsUnlocked[index];
            const item = document.createElement('div');

            // Nutzt deine Farben: Blau für geschafft, Dunkel für gesperrt
            item.className = `info-upgrade-item ${isUnlocked ? 'bought-upgrade' : 'locked-upgrade'}`;
            item.style.borderColor = isUnlocked ? achiev.color : 'var(--color-neutral-olive)';

            item.innerHTML = `
                <h3>${isUnlocked ? '🏆' : '🔒'} ${achiev.name}</h3>
                <p>${achiev.description}</p>
                <p style="font-size: 0.8em; color: ${isUnlocked ? 'var(--color-accent-blue)' : '#777'};">
                    ${isUnlocked ? 'ERLEDIGT: ' + this.getAchievementBonusText(achiev.bonus) : 'Noch gesperrt'}
                </p>
            `;
            container.appendChild(item);
        });
    }

    // Hilfsfunktion für die Bonustexte
    getAchievementBonusText(bonus) {
        switch (bonus.type) {
            case 'sps_mult': return `+${(bonus.value * 100)}% SPS`;
            case 'click_mult': return `+${(bonus.value * 100)}% Klickkraft`;
            case 'global_mult': return `+${(bonus.value * 100)}% auf Alles`;
            case 'prestige_efficiency': return `+${(bonus.value * 100)}% Prestige-Effekt`;
            default: return "Permanenter Bonus";
        }
    }

    // ================================================================================================================
    // 11. EINSTELLUNGEN
    // ================================================================================================================

    ladeAudioEinstellungen() {
            const musicVolume = localStorage.getItem('musicVolume');
            const soundVolume = localStorage.getItem('soundVolume');

            const musicVolumeSlider = this.getById('music-volume');
            const soundVolumeSlider = this.getById('sound-volume');

            if (musicVolumeSlider && musicVolume !== null) {
                musicVolumeSlider.value = musicVolume;
            }

            if (soundVolumeSlider && soundVolume !== null) {
                soundVolumeSlider.value = soundVolume;
            }
            this.setzeLautstaerke();
        }

        setzeLautstaerke() {
            const musicVolume = parseFloat(localStorage.getItem('musicVolume') || 100) / 100;
            const soundVolume = parseFloat(localStorage.getItem('soundVolume') || 100) / 100;

            const musicPlayer = this.getById('background-music');
            if (musicPlayer) {
                musicPlayer.volume = musicVolume;
            }

            const clickSound = this.getById('click-sound');
            if (clickSound) {
                clickSound.volume = soundVolume;
            }
        }

        // =========================================
            // 🎵 AUDIO SYSTEM
            // =========================================
            playClickSound() {
                const sound = this.getById('click-sound');
                // Nur abspielen, wenn Element da ist und Lautstärke > 0
                if (sound && sound.volume > 0) {
                    sound.currentTime = 0; // WICHTIG: Setzt Sound zurück -> Erlaubt schnelles Hämmern!
                    sound.play().catch(e => {
                        // Fehler abfangen (z.B. wenn Browser Audio blockiert)
                        // console.log("Audio play blocked", e);
                    });
                }
            }

        // =// =========================================
                // 🎵 AUDIO SYSTEM (Version: Mechanischer Klick)
                // =========================================
                playClickSound() {
                    const soundVolumeSlider = this.getById('sound-volume');
                    const volume = soundVolumeSlider ? (parseInt(soundVolumeSlider.value) / 100) : 0.5;

                    if (volume <= 0) return;

                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    if (!this.audioCtx) this.audioCtx = new AudioContext();
                    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

                    const oscillator = this.audioCtx.createOscillator();
                    const gainNode = this.audioCtx.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioCtx.destination);

                    // --- DESIGN: MECHANISCHER KLICK ---

                    // 'triangle' klingt etwas schärfer/metallischer als 'sine'
                    oscillator.type = 'triangle';

                    // Konstante, tiefere Frequenz (kein "Pew"-Effekt mehr)
                    // Leichte Variation (200-250Hz), damit es natürlich klingt
                    const freq = 200 + Math.random() * 50;
                    oscillator.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

                    // Sehr kurz und knackig
                    gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
                    gainNode.gain.linearRampToValueAtTime(volume * 0.3, this.audioCtx.currentTime + 0.005); // Sehr schneller Attack
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);  // Sofort weg

                    oscillator.start();
                    oscillator.stop(this.audioCtx.currentTime + 0.06);
                }

        // =========================================================
        // NAVIGATION & ONE-PAGE LOGIK (Muss INNERHALB der Klasse sein!)
        // =========================================================

        switchView(viewName) {
                // 1. Schließe alle großen Modals erst einmal
                const modals = ['prestige-shop-modal', 'info-modal', 'settings-modal'];
                modals.forEach(id => {
                    const m = document.getElementById(id);
                    if(m) m.style.display = 'none';
                });

                // 2. Logik je nach Button
                if (viewName === 'home') {
                    // Bei "Start" machen wir einfach alle Modals zu (siehe oben)
                    // und stellen sicher, dass man wieder oben auf der Seite ist
                    window.scrollTo(0, 0);
                }
                else if (viewName === 'prestige') {
                    // Öffne das Prestige Modal
                    const pModal = document.getElementById('prestige-shop-modal');
                    if(pModal) {
                        pModal.style.display = 'flex';
                        this.updatePrestigeUIView(); // Daten aktualisieren
                    }
                }
                else if (viewName === 'info') {
                    // Öffne das Info Modal
                    const iModal = document.getElementById('info-modal');
                    if(iModal) iModal.style.display = 'flex';
                }
            }

        // Spezielle Update-Funktion für die Elemente auf der Prestige-Seite
        updatePrestigeUIView() {
                const prestigeAvailable = this.getById('prestige_punkte_verfügbar');
                const prestigeTotal = this.getById('gesamt_prestige_punkte');
                const currentSmileys = this.getById('aktuelle_smileys_prestige');
                const nextPoint = this.getById('next_prestige_point');
                const multiDisplay = this.getById('prestige_view_multi');

                if (prestigeAvailable) prestigeAvailable.innerText = this.formatNumber(this.gameState.prestige_punkte_verfügbar || 0);
                if (prestigeTotal) prestigeTotal.innerText = this.formatNumber(this.gameState.gesamt_prestige_punkte || 0);
                if (currentSmileys) currentSmileys.innerText = this.formatNumber(this.gameState.lifetime_smileys || 0); // Lifetime anzeigen!
                if (multiDisplay) multiDisplay.innerText = `x${this.gameState.globalerPrestigeMultiplikator.toFixed(2)}`;

                // Berechnung für den nächsten Punkt Korrigieren
                const pointsToGain = this.calculatePrestigeGain();
                const currentTotalLevel = (this.gameState.gesamt_prestige_punkte || 0) + pointsToGain;
                const nextLevel = currentTotalLevel + 1;

                // Hier wieder die 100k Kosten beachten
                const nextPointRequirement = Math.pow(nextLevel, 3) * 100000;

                if (nextPoint) nextPoint.innerText = this.formatNumber(nextPointRequirement);

                // Reset Button
                const btnPage = this.getById('prestige_reset_button_page');
                if (btnPage) {
                    btnPage.onclick = () => this.zeigePrestigeDetails();
                }
            }

        // --- HELPER FÜR INFO SEITEN (Damit sie nicht leer sind) ---

        createBuildingInfoElements() {
            const c = this.getById('info_buildings_container'); if(!c) return;
            c.innerHTML = '';
            const all = [...buildingsData, ...uniqueBuildingsData];
            all.forEach(b => {
                // Zeige nur freigeschaltete
                if(b.id === 'diamond_mine' && !this.gameState.diamondMineUnlocked) return;

                const div = document.createElement('div');
                div.className = 'info-upgrade-item';
                div.innerHTML = `<h4>${b.name}</h4><p>Basis Preis: ${this.formatNumber(b.basePrice)}</p>`;
                c.appendChild(div);
            });
        }

        createInfoGlobalUpgradeElements() {
            const c = this.getById('info_global_upgrades_container'); if(!c) return;
            c.innerHTML = '';
            globalUpgrades.forEach(u => {
                const bought = this.gameState.researchStatus[u.id];
                c.innerHTML += `<div class="info-upgrade-item" style="border-left:5px solid ${bought?'green':'gray'}">
                    <h4>${u.description}</h4><p>${bought?'Gekauft':'Noch offen'}</p></div>`;
            });
        }

        createInfoPetsElements() {
            const c = this.getById('info_pets_container'); if(!c) return;
            c.innerHTML = '';
            petsData.forEach(p => {
                const lvl = this.gameState.petLevels[p.id] || 0;
                c.innerHTML += `<div class="info-upgrade-item"><h4>${p.name} (Lv ${lvl})</h4><p>${p.description}</p></div>`;
            });
        }



        createInfoAchievementElements() {
            const c = this.getById('info_achievements_container'); if(!c) return;
            c.innerHTML = '';
            achievementsData.forEach((a, i) => {
                const unlocked = this.gameState.achievementsUnlocked[i];
                c.innerHTML += `<div class="info-upgrade-item" style="opacity:${unlocked?1:0.5}">
                    <h4>${unlocked?'🏆':'🔒'} ${a.name}</h4><p>${a.description}</p></div>`;
            });
        }

        setupInfoPageEventListeners() {
                // Hilfsfunktion zum Binden von Buttons an Modals
                const bind = (btnId, modalId, fn) => {
                    const btn = this.getById(btnId);

                    if (btn) {
                        btn.addEventListener('click', () => {
                            const modal = this.getById(modalId);
                            if (modal) {
                                modal.style.display = 'flex';
                                // Ruft die Render-Funktion auf, falls vorhanden
                                if (fn) fn.call(this);
                            } else {
                                console.error(`FEHLER: Das Modal mit der ID '${modalId}' wurde im HTML nicht gefunden!`);
                            }
                        });
                    }

                    // Close-Button Logik (ebenfalls sicherer gemacht)
                    const modalEl = this.getById(modalId);
                    if (modalEl) {
                        const closeBtn = modalEl.querySelector('.btn-cancel');
                        // Auch prüfen, ob IDs wie 'close_buildings_info_button' direkt genutzt werden
                        // (Optional, falls du Klassen statt IDs für Close-Buttons nutzt)

                        if (closeBtn) {
                            closeBtn.addEventListener('click', () => {
                                modalEl.style.display = 'none';
                            });
                        }
                    }
                };

                // Binden der Buttons (Hier definiert du, welche ID zu welchem Modal gehört)
                bind('show_buildings_button', 'buildings_info_modal', this.createBuildingInfoElements);
                bind('show_global_upgrades_button', 'global_upgrades_info_modal', this.createInfoGlobalUpgradeElements);
                bind('show_pets_button', 'pets_info_modal', this.createInfoPetsElements);
                bind('show_stats_button', 'stats_info_modal', this.createInfoStatsElements);
                bind('show_achievements_button', 'achievements_info_modal', this.createInfoAchievementElements);
                bind('show_prestige_button', 'prestige_info_modal', this.createPrestigeInfoList);
            }
            }