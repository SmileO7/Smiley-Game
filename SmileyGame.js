// ================================================================================================================
// === SmileyGame.js: Hauptspielklasse (Final & Friendly Version) ===
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
                description: "Der Anfang von allem. Gewährt einen dauerhaften Startbonus auf alle Einnahmen.", 
                type: 'sps_mult', 
                value: 0.10, 
                x: 50, y: 90,        
                category: 'start',
                parents: [] 
            },

            // === TIER 1: KLICK vs IDLE ===
            { 
                id: 1, 
                name: "Finger-Training", // Freundlicher Name
                cost: 2, 
                description: "Deine Muskeln erinnern sich. Klickkraft +25%.", 
                type: 'click_mult', 
                value: 0.25, 
                x: 30, y: 75,        
                category: 'click',
                parents: [0] 
            },
            { 
                id: 2, 
                name: "Automatisierung", // Freundlicher Name
                cost: 2, 
                description: "Die Maschinen laufen von alleine. SPS +25%.", 
                type: 'sps_mult', 
                value: 0.25, 
                x: 70, y: 75,        
                category: 'idle',
                parents: [0] 
            },

            // === TIER 2: SPEZIALISIERUNG ===
            { 
                id: 3, 
                name: "Effizientes Bauen", 
                cost: 5, 
                description: "Wir verschwenden kein Material mehr. Alle Gebäude 5% günstiger.", 
                type: 'cost_reduction', 
                value: 0.05, 
                x: 15, y: 60,        
                category: 'qol',
                parents: [1] 
            },
            { 
                id: 4, 
                name: "Zeit-Reisender", 
                cost: 10, 
                description: "Du lernst aus der Vergangenheit. Prestige-Punkte sind 10% effektiver.", 
                type: 'prestige_efficiency', 
                value: 0.10, 
                x: 85, y: 60,        
                category: 'idle',
                parents: [2] 
            },

            // === TIER 3: SYNERGIE ===
            { 
                id: 5, 
                name: "Synergie-Effekt", 
                cost: 15, 
                description: "Aktives und Passives Spielen greifen ineinander. Klicks skalieren jetzt mit deiner SPS.", 
                type: 'click_mult', 
                value: 0.50, 
                x: 50, y: 55,        
                category: 'special',
                parents: [1, 2]      
            },

            // === TIER 4: FEATURE UNLOCKS ===
            { 
                id: 6, 
                name: "Pet Shop Lizenz", 
                cost: 50, 
                description: "Erlaubt dir, kleine Begleiter zu adoptieren. Schaltet den PET SHOP frei.", 
                type: 'unlock_pets', 
                value: 0, 
                x: 35, y: 40,        
                category: 'special',
                parents: [5] 
            },
            { 
                id: 7, 
                name: "Schürfrechte", 
                cost: 50, 
                description: "Erlaubt den Abbau von Edelsteinen. Schaltet die DIAMANTEN-MINE frei.", 
                type: 'unlock_mine', 
                value: 0, 
                x: 65, y: 40,        
                category: 'special',
                parents: [5] 
            },

            // === TIER 5: DAS IMPERIUM ===
            { 
                id: 8, 
                name: "Gilden-Gründung", 
                cost: 100, 
                description: "Schließe dich mit anderen zusammen. Schaltet das GILDEN-SYSTEM frei.", 
                type: 'unlock_guilds', 
                value: 0, 
                x: 50, y: 25,        
                category: 'special',
                parents: [6, 7] 
            },

            // === TIER 6: GLOBALER BOOST ===
            { 
                id: 9, 
                name: "Marktbeherrschung", 
                cost: 250, 
                description: "Dein Imperium ist weltweit bekannt. Verdoppelt die gesamte Produktion (x2).", 
                type: 'global_mult', 
                value: 1.0, 
                x: 50, y: 10,        
                category: 'qol',    
                parents: [8] 
            },

            // === ENDGAME ===
            { 
                id: 10, 
                name: "Klick-Gott", 
                cost: 500, 
                description: "Deine Finger bewegen sich mit Lichtgeschwindigkeit. Verdreifacht Klickkraft (+200%).", 
                type: 'click_mult', 
                value: 2.0, 
                x: 20, y: 15,        
                category: 'click',
                parents: [9] 
            },
            { 
                id: 11, 
                name: "Industrie-Gigant", 
                cost: 500, 
                description: "Fabriken so weit das Auge reicht. Verdreifacht passive SPS (+200%).", 
                type: 'sps_mult', 
                value: 2.0, 
                x: 80, y: 15,        
                category: 'idle',
                parents: [9] 
            },

            // === ULTIMATE ===
            { 
                id: 12, 
                name: "Nano-Technologie", 
                cost: 1500, 
                description: "Gebäude bauen sich selbst. Kosten -10%.", 
                type: 'cost_reduction', 
                value: 0.10, 
                x: 50, y: -10,      
                category: 'qol',
                parents: [10, 11] 
            },
            { 
                id: 13, 
                name: "Chronos-Meister", 
                cost: 5000, 
                description: "Du beherrschst die Zeit. Prestige-Effizienz +50%.", 
                type: 'prestige_efficiency', 
                value: 0.50, 
                x: 30, y: -25,      
                category: 'idle',
                parents: [12] 
            },
            { 
                id: 14, 
                name: "Der Urknall", 
                cost: 10000, 
                description: "Ein neues Universum voller Smileys. Multipliziert ALLES mit 5.", 
                type: 'global_mult', 
                value: 4.0, 
                x: 70, y: -25, 
                category: 'special',
                parents: [12] 
            }
            { 
                id: 15, 
                name: "Präzisions-Training", 
                cost: 25, 
                description: "Du triffst immer die empfindlichsten Stellen. Kritische Treffer-Chance +5%.", 
                type: 'crit_chance', // Müssen wir in der Logik noch abfangen (siehe unten)
                value: 0.05, 
                x: 10, y: 70, // Links außen bei Tier 1
                category: 'click',
                parents: [1] // Hängt am "Finger-Training"
            },
            { 
                id: 16, 
                name: "Offshore-Konten", 
                cost: 25, 
                description: "Deine Smileys arbeiten auch im Schlaf härter. Offline-Gewinn +20%.", 
                type: 'offline_boost', // Neuer Typ
                value: 0.20, 
                x: 90, y: 70, // Rechts außen bei Tier 1
                category: 'idle',
                parents: [2] // Hängt an "Automatisierung"
            },
            { 
                id: 17, 
                name: "Hype-Train", 
                cost: 75, 
                description: "Je mehr Gebäude du hast, desto stärker werden deine Klicks.", 
                type: 'building_synergy', // Neuer Typ
                value: 0.01, // 1% pro Gebäude
                x: 50, y: 65, // Genau in der Mitte
                category: 'special',
                parents: [3, 4] // Verbindet Tier 2 (Effizientes Bauen & Zeit-Reisender)
            }
        ];

        this.currentBuyAmount = 1;

        this.gameState = {
            aktuelle_smileys: 0,
            lifetime_smileys: 0,
            diamanten: 0,
            prestige_punkte_verfügbar: 0,
            gesamt_prestige_punkte: 0,
            prestigeResets: 0,
            klickKraft: 2,
            klickKraftMultiplier: 1,
            globalerPrestigeMultiplikator: 1,
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
            diamondShopPurchases: [],
            diamondMineUnlocked: false,
            petsUnlocked: false,
            guildsUnlocked: false,
            petAutoClickTimer: 0,
            achievementsUnlocked: achievementsData.map(() => false),
            totalClicksLifetime: 0,
            guildName: null,
            guildUpgradeStatus: guildUpgradesData.map(() => false),
            guildSPSMultiplier: 0,
            guildCostReduction: 0,
            guildPrestigeBonus: 0,
            guildGlobalMultiplier: 1,
            guildBossLevel: 1,
            guildBossHP: 1000,
            guildBossMaxHP: 1000,
            guildBossFighting: false,
            guildBossTimer: 0,
            guildAvailableQuests: [],
            guildActiveQuests: [],
            lastQuestGenTime: 0,
            diamondMinigameRunning: false,
            diamondMinigameTimer: null,
            activeBuffs: {
                spsMultiplier: 1,
                costMultiplier: 1,
                timerSPS: 0,
                timerCost:0
            },
            skills:{
            frenzy: { active: false, cooldown: false, duration: 15000, cooldownTime: 120000, color: '#ff4d4d' },
            overdrive: { active: false, cooldown: false, duration: 30000, cooldownTime: 300000, color: '#009ffd' },
            critStorm: { active: false, cooldown: false, duration: 10000, cooldownTime: 180000, color: '#ffcc00' },
            goldRush: { active: false, cooldown: false, duration: 1000, cooldownTime: 600000, color: '#4CAF50' }, // Sofort-Effekt
            diamondPulse: { active: false, cooldown: false, duration: 20000, cooldownTime: 420000, color: '#b9f2ff' },
            efficiency: { active: false, cooldown: false, duration: 45000, cooldownTime: 600000, color: '#a0a0a0' },
            shards: { active: false, cooldown: false, duration: 20000, cooldownTime: 240000, color: '#e066ff' },
            hyperMinute: { active: false, cooldown: false, duration: 60000, cooldownTime: 900000, color: '#ff8c00' }
        }
        };

        this.productionInterval = null;
        this.uiInterval = null;
        this.saveInterval = null;

        this.setupSettingsModalListeners();
        this.init();
    }

    init() {
        this.ladeSpiel();
        this.checkOfflineProgress();
        this.createBuildingElements();
        this.renderPetShop();
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
        this.setupPrestigeEventListeners();
        this.setupInfoPageEventListeners();
        this.setupSkillTreeControls();
        this.startIntervals();
        this.updatePetInterval();
        this.updateNewsTicker();
        this.updateUI();

        console.log("Spiel initialisiert. Warte auf Autosave...");
    }

    // ================================================================================================================
    // 1. SPIELKONTROLLE & INTERVALLE
    // ================================================================================================================

    startIntervals() {
    // 1. Der Haupt-Loop für SPS (jede Sekunde)
    setInterval(() => {
        this.addSmileys(this.gameState.totalSPS);
        this.updateUI();
    }, 1000);

    // 2. Automatisches Speichern (alle 30-60 Sek)
    setInterval(() => {
        this.saveGame();
    }, 60000);

    // 3. NEU: News-Ticker Wechsel (alle 30 Sekunden)
    setInterval(() => {
        // Wir prüfen, ob der Ticker gerade einen blauen Alarm-Text zeigt.
        // Falls nicht, laden wir eine neue zufällige Nachricht.
        const ticker = this.getById('news-ticker-text');
        if (ticker && ticker.style.color !== "rgb(0, 159, 253)") { 
            this.updateNewsTicker();
        }
    }, 30000);

    // 4. RNG-Events (Fragezeichen alle 1-3 Minuten)
    setInterval(() => {
        if (Math.random() < 0.3) { // 30% Chance alle 60 Sek
            this.spawnRandomEvent();
        }
    }, 60000);
}

    produzierePassiveErträge() {
        const actualSPS = this.computeTotalSPS();
        if (actualSPS > 0) {
            this.addSmileys(actualSPS);
        }

        const MINE_INDEX = 8;
        if (this.gameState.diamondMineUnlocked && this.gameState.buildingCounts[MINE_INDEX] > 0) {
            const mineData = (typeof uniqueBuildingsData !== 'undefined')
                ? uniqueBuildingsData.find(u => u.id === 'diamond_mine')
                : null;

            if (mineData) {
                const autoDiamondRate = mineData.baseDPS * (mineData.diamondMultiplier || 1) * 0.1;
                this.gameState.diamanten += autoDiamondRate;
            }
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
        if (this.petAutoClickTimer !== null) {
            clearInterval(this.petAutoClickTimer);
            this.petAutoClickTimer = null;
        }
        if (!this.gameState.activePet) return;

        const petDetails = petsData.find(p => p.id === this.gameState.activePet);
        if (petDetails && petDetails.id === 'pet_dog') {
            const currentLevel = this.gameState.petLevels['pet_dog'] || 1;
            const clicksPerSecond = currentLevel;
            const intervalDuration = 1000 / clicksPerSecond;

            this.petAutoClickTimer = setInterval(() => {
                this.klickeSmiley(null);
            }, intervalDuration);
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
            if (encodedData) alert("Fehler beim Importieren. Daten beschädigt.");
            localStorage.removeItem('smileyGameSave');
            return false;
        }
    }

    checkOfflineProgress() {
        if (!this.gameState.lastSaveTime) return;
        const now = Date.now();
        const diffInMs = now - this.gameState.lastSaveTime;
        const diffInSeconds = Math.floor(diffInMs / 1000);

        if (diffInSeconds < 10) return;

        const currentSPS = this.computeTotalSPS();
        if (currentSPS <= 0) return;

        // WICHTIG: Erst die Effekte laden!
        const prestige = this.calculatePrestigeEffects();
        
        // Dann berechnen (Basis * Boost)
        let earned = currentSPS * diffInSeconds;
        if (prestige.offlineBoost > 1) {
            earned *= prestige.offlineBoost;
        }

        if (earned > 0) {
            this.addSmileys(earned);
            let timeString = "";
            if (diffInSeconds < 60) timeString = `${diffInSeconds} Sek`;
            else if (diffInSeconds < 3600) timeString = `${Math.floor(diffInSeconds / 60)} Min`;
            else timeString = `${(diffInSeconds / 3600).toFixed(1)} Std`;

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

    calculatePrestigeEffects() {
        let effects = {
            spsMultiplier: 1.0,
            clickMultiplier: 1.0,
            costReduction: 0.0,
            pointEfficiency: 0.10,
            petsUnlocked: false,
            mineUnlocked: false,
            guildsUnlocked: false,
            // NEU:
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
                    
                    // --- NEUE TYPEN ---
                    case 'crit_chance': effects.critChanceBonus += upgrade.value; break;
                    case 'offline_boost': effects.offlineBoost += upgrade.value; break;
                    case 'building_synergy': effects.buildingSynergy += upgrade.value; break;
                }
            }
        });
        return effects;
    }

    applyAllBoni() {
        this.gameState.globalSPSMultiplier = 1;
        this.gameState.prestigePointMultiplier = 0.05;
        this.gameState.prestigeResetBonus = 0;
        this.gameState.guildSPSMultiplier = 0;
        this.gameState.autoDiamondMineUnlocked = false;
        this.gameState.petsUnlocked = false;
        this.gameState.diamondMineUnlocked = false;
        this.gameState.guildsUnlocked = false;

        let baseClickMultiplier = 1;
        let prestigeClickMultiplier = 0;

        buildingsData.forEach(b => { b.prestigeMulti = 1; });

        this.gameState.researchStatus.forEach((bought, index) => {
            if (bought) {
                const upgrade = globalUpgrades[index];
                if (upgrade && upgrade.type === 'click_mult') {
                    prestigeClickMultiplier += upgrade.value;
                }
            }
        });

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

        this.gameState.critChance = 0 + (prestige.critChanceBonus || 0);
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

        prestigeClickMultiplier += (diamondStaticClick - 1);
        this.gameState.globalSPSMultiplier *= diamondStaticSPS;
        this.gameState.globalSPSMultiplier *= this.gameState.godModeMultiplier;

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
                }
            }
        });

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

    // ================================================================================================================
    // 3. KERNLOGIK (Kauf & Reset)
    // ================================================================================================================

    klickeSmiley(e) {
        let damage = this.getClickStrength();
        let isCrit = false;

        // --- SKILL CHECK: CRIT STORM ---
        if (this.gameState.skills && this.gameState.skills.critStorm.active) {
            isCrit = true;
            damage *= this.gameState.critDamageMult;
        } 
        // Normaler Crit-Check, falls Skill nicht aktiv
        else if (this.gameState.critChance > 0 && Math.random() < this.gameState.critChance) {
            damage *= this.gameState.critDamageMult;
            isCrit = true;
        }

        this.addSmileys(damage);
        this.gameState.totalClicksLifetime++;
        this.playClickSound();

        if (e) {
            this.animateSmiley();
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

    // Nur die ersten 5 anzeigen, damit die Liste nicht den Bildschirm sprengt
    upgradesToRender.slice(0, 5).forEach(upgrade => {
        const finalCost = this.getGlobalUpgradeCost(upgrade);
        const canAfford = this.gameState.aktuelle_smileys >= finalCost;

        const div = document.createElement('div');
        div.className = 'research-item';
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
                <button class="btn-buy-research" data-id="${upgrade.id}">
                    Kaufen
                </button>
            </div>
        `;
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
        if (upgrade.parents && upgrade.parents.length > 0) {
            for (let parentId of upgrade.parents) {
                const parentIndex = this.prestigeUpgrades.findIndex(u => u.id === parentId);
                if (!this.gameState.prestigeUpgradeStatus[parentIndex]) return false;
            }
        }
        return true;
    }

    tryBuyPrestigeUpgrade(upgrade) {
        if (this.gameState.prestigeUpgradeStatus[upgrade.id]) return;
        const reqs = upgrade.requirements || [];
        const requirementsMet = reqs.every(reqId => this.gameState.prestigeUpgradeStatus[reqId]);

        if (!requirementsMet) {
            this.showNotification("🔒 Du musst erst das vorherige Upgrade kaufen!", "error");
            return;
        }

        if ((this.gameState.prestige_punkte_verfügbar || 0) >= upgrade.cost) {
            this.gameState.prestige_punkte_verfügbar -= upgrade.cost;
            this.gameState.prestigeUpgradeStatus[upgrade.id] = true;
            this.showNotification(`✅ Upgrade gekauft: ${upgrade.name || 'Upgrade'}`, "success");
            this.speichereSpiel();
            this.updatePrestigeUI();
            this.updateUI();
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
            if (this.gameState.achievementsUnlocked[index]) return;
            let isMet = false;
            const req = achievement.requirement;
            switch (req.type) {
                case 'building_count': if (this.gameState.buildingCounts[req.target] >= req.value) isMet = true; break;
                case 'total_clicks': if (this.gameState.totalClicksLifetime >= req.value) isMet = true; break;
                case 'lifetime_smileys': if (this.gameState.lifetime_smileys >= req.value) isMet = true; break;
                case 'guild_joined': if (this.gameState.guildName !== null) isMet = true; break;
            }
            if (isMet) {
                this.gameState.achievementsUnlocked[index] = true;
                this.showNotification(`🏆 Meilenstein erreicht: ${achievement.name}`, 'success');
                this.applyAllBoni();
                this.speichereSpiel();
            }
        });
    }

    // ================================================================================================================
    // 4. PETS LOGIK
    // ================================================================================================================

    levelUpPet(petId) {
        if (!this.gameState.petsUnlocked) return;
        const pet = petsData.find(p => p.id === petId);
        const currentLevel = this.gameState.petLevels[petId] || 0;
        const stats = this.calculatePetStat(pet, currentLevel);
        if (stats.isMaxLevel) return;

        if (this.gameState.diamanten < stats.nextCost) {
            this.showNotification(`💎 Nicht genug Diamanten!`, 'error');
            return;
        }

        this.gameState.diamanten -= stats.nextCost;
        this.gameState.petLevels[petId] = currentLevel + 1;
        if (currentLevel === 0) this.activatePet(petId);

        this.applyAllBoni();
        this.updateUI();
        this.renderPetShop();
        this.speichereSpiel();
    }

    activatePet(petId) {
        if ((this.gameState.petLevels[petId] || 0) <= 0) return;
        if (this.gameState.activePet === petId) {
            this.gameState.activePet = null;
        } else {
            this.gameState.activePet = petId;
        }
        this.applyAllBoni();
        this.updatePetInterval();
        this.updateUI();
        this.renderPetShop();
        this.updateGlobalUpgradeUI();
        this.speichereSpiel();
    }

    // ================================================================================================================
    // 5. DIAMANTEN MINE LOGIK
    // ================================================================================================================

    startDiamondMinigame() {
        const MINE_INDEX = DIAMOND_MINE_INDEX;
        const mineCount = this.gameState.buildingCounts[MINE_INDEX] || 0;
        const DURATION = 5000;
        if (this.gameState.diamondMinigameRunning || mineCount === 0) return;

        this.currentMinigameClicks = 0;
        this.gameState.diamondMinigameRunning = true;
        this.updateUI();

        const progressBar = this.getById('minigame-bar');
        const resultText = this.getById('minigame-result');
        if (resultText) {
            resultText.style.color = '#fff';
            resultText.innerText = 'Hämmer auf den Button! (Klick Klick!)';
        }

        if (this.barInterval) clearInterval(this.barInterval);
        let progress = 0;
        const step = 100 / (DURATION / 50);

        if (progressBar) {
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
            this.barInterval = setInterval(() => {
                progress += step;
                if (progress >= 100) progress = 100;
                progressBar.style.width = `${progress}%`;
                if (progress >= 100) clearInterval(this.barInterval);
            }, 50);
        }

        this.gameState.diamondMinigameTimer = setTimeout(() => {
            try {
                let baseGain = 5 * mineCount;
                let clickBonus = Math.floor(this.currentMinigameClicks * 0.5 * mineCount);
                if (this.gameState.activePet) {
                    const pet = petsData.find(p => p.id === this.gameState.activePet && p.effectType === 'prestige_point_eff');
                    if (pet) {
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

                if (resultText) {
                    resultText.innerHTML = `
                        <span style="color: #4CAF50">Erfolg!</span> Basis: ${Math.floor(baseGain)} + Klicks: ${Math.floor(clickBonus)} =
                        <strong style="color: #009ffd;">+${totalGain} 💎</strong>
                    `;
                }
            } catch (error) {
                console.error("Fehler im Minigame-Ende:", error);
            } finally {
                this.gameState.diamondMinigameRunning = false;
                this.currentMinigameClicks = 0;
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
        if (this.gameState.guildName) return false;
        if (this.gameState.aktuelle_smileys < COST) {
            this.showNotification("❌ Nicht genug Smileys!", "error");
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
        const upgrade = guildUpgradesData.find(u => u.id === id);
        if (!upgrade) return;
        if (this.gameState.guildUpgradeStatus[id]) return;
        if (!this.gameState.guildName) return;

        const preis = upgrade.baseCost;
        if (this.gameState.aktuelle_smileys < preis) {
            this.showNotification("❌ Nicht genug Smileys!", "error");
            return;
        }

        this.gameState.aktuelle_smileys -= preis;
        this.gameState.guildUpgradeStatus[id] = true;
        this.applyAllBoni();
        this.updateUI();
        this.renderGuildsContent();
        this.speichereSpiel();
        this.showNotification(`${upgrade.name} wurde angeheuert!`, 'success');
    }

    startGuildBoss() {
        if (this.gameState.guildBossFighting) return;
        const level = this.gameState.guildBossLevel;
        const hp = Math.floor(1000 * Math.pow(1.5, level - 1));
        this.gameState.guildBossMaxHP = hp;
        this.gameState.guildBossHP = hp;
        this.gameState.guildBossFighting = true;
        this.gameState.guildBossTimer = 30;
        this.renderGuildsContent();

        if (this.bossInterval) clearInterval(this.bossInterval);
        this.bossInterval = setInterval(() => {
            if (!this.gameState.guildBossFighting) {
                clearInterval(this.bossInterval);
                return;
            }
            this.gameState.guildBossTimer -= 1;
            const timerDisplay = this.getById('boss-timer-display');
            if (timerDisplay) timerDisplay.innerText = this.gameState.guildBossTimer + "s";
            if (this.gameState.guildBossTimer <= 0) {
                this.endGuildBoss(false);
            }
        }, 1000);
    }

    clickGuildBoss(e) {
        if (!this.gameState.guildBossFighting) return;
        let damage = this.getClickStrength();
        let isCrit = false;
        if (this.gameState.critChance > 0 && Math.random() < this.gameState.critChance) {
            damage *= this.gameState.critDamageMult;
            isCrit = true;
        }
        this.gameState.guildBossHP -= damage;
        if (e) {
            this.spawnFloatingText(e, damage, 'boss-damage');
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
            const reward = this.gameState.guildBossLevel * 10;
            this.gameState.diamanten += reward;
            this.gameState.guildBossLevel++;
            this.showNotification(`BOSS BESIEGT! +${reward} 💎`, 'success');
        } else {
            this.showNotification("Zeit abgelaufen! Der Boss ist entkommen.", 'error');
        }
        this.updateUI();
        this.renderGuildsContent();
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

    generateGuildQuests() {
        if (!this.gameState.guildAvailableQuests) this.gameState.guildAvailableQuests = [];
        if (this.gameState.guildAvailableQuests.length >= 3) return;

        const questNames = ["Patrouille im Wald", "Vorräte liefern", "Banditen verjagen", "Verlorenen Schatz suchen", "Drachen-Späher", "Königliche Eskorte"];
        const rarities = [
            { name: "Gewöhnlich", multi: 1, color: "#fff", chance: 0.6 },
            { name: "Selten", multi: 3, color: "#009ffd", chance: 0.3 },
            { name: "Legendär", multi: 10, color: "#ff9800", chance: 0.1 }
        ];

        while (this.gameState.guildAvailableQuests.length < 3) {
            const name = questNames[Math.floor(Math.random() * questNames.length)];
            const r = Math.random();
            let rarity = rarities[0];
            if (r > 0.9) rarity = rarities[2];
            else if (r > 0.6) rarity = rarities[1];

            const duration = Math.floor(Math.random() * 600) + 60;
            let rewardValue = Math.max(1000, this.gameState.totalSPS * duration * 0.5);
            rewardValue *= rarity.multi;

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
        if (this.gameState.guildActiveQuests && this.gameState.guildActiveQuests.length >= 3) {
            this.showNotification("Deine Gilde ist voll ausgelastet (Max. 3 Missionen)!", "error");
            return;
        }
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
        if (!this.gameState.guildActiveQuests) return;
        const index = this.gameState.guildActiveQuests.findIndex(q => q.id === questId);
        if (index === -1) return;
        const quest = this.gameState.guildActiveQuests[index];
        const elapsed = (Date.now() - quest.startTime) / 1000;
        if (elapsed < quest.duration) return;

        if (quest.isDiamond) {
            this.gameState.diamanten += quest.reward;
            this.showNotification(`Quest abgeschlossen: +${quest.reward} 💎`, "success");
        } else {
            this.gameState.aktuelle_smileys += quest.reward;
            this.gameState.lifetime_smileys += quest.reward;
            this.showNotification(`Quest abgeschlossen: +${this.formatNumber(quest.reward)} Smileys`, "success");
        }
        this.gameState.guildActiveQuests.splice(index, 1);
        this.generateGuildQuests();
        this.renderGuildsContent();
        this.updateUI();
        this.speichereSpiel();
    }

    // ================================================================================================================
    // 7. RENDERING & UI-UPDATES
    // ================================================================================================================

    updateUI() {
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
        const currentLevel = this.gameState.prestigeLevel || 0;
        const nextLevelXP = Math.pow(10, 6 + currentLevel);
        const safeLifetime = this.gameState.lifetime_smileys || 0;
        const progressPercent = Math.min(100, (safeLifetime / nextLevelXP) * 100);

        const bar = this.getById('prestige-progress-bar');
        if (bar) bar.style.width = `${progressPercent}%`;

        const text = this.getById('prestige-progress-text');
        if (text) text.innerText = `${this.formatNumber(safeLifetime)} / ${this.formatNumber(nextLevelXP)}`;

        const lifetimeDisp = this.getById('prestige-lifetime-display');
        if (lifetimeDisp) lifetimeDisp.innerText = this.formatNumber(safeLifetime);

        const currentDisp = this.getById('prestige-current-level');
        if (currentDisp) currentDisp.innerText = this.gameState.prestigeCurrency || 0;

        const possibleGain = this.calculatePrestigeGain ? this.calculatePrestigeGain() : 0;
        const gainDisp = this.getById('prestige-gain-display');
        if (gainDisp) {
            gainDisp.innerText = possibleGain;
            gainDisp.style.color = possibleGain > 0 ? '#4CAF50' : '#009ffd';
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

        petsData.forEach((pet) => {
            const petDiv = petGrid.querySelector(`.pet-item[data-id="${pet.id}"]`);
            if (!petDiv) return;
            const currentLevel = this.gameState.petLevels[pet.id] || 0;
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

        const activePetDisplayElement = this.getById('active_pet_display');
        if (activePetDisplayElement) {
            if (this.gameState.activePet) {
                const pet = petsData.find(p => p.id === this.gameState.activePet);
                const currentLevel = this.gameState.petLevels[this.gameState.activePet] || 0;
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

    // ================================================================================================================
    // 8. CONTENT RENDERING
    // ================================================================================================================

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
            world.style.transform = `translate(${this.treeX}px, ${this.treeY}px)`;
        }
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

        const ZOOM = 10;
        this.prestigeUpgrades.forEach(upgrade => {
            const node = document.createElement('div');
            node.className = 'skill-node';
            const pixelX = (upgrade.x - 50) * ZOOM;
            const pixelY = (upgrade.y - 50) * ZOOM;
            node.style.left = pixelX + 'px';
            node.style.top = pixelY + 'px';
            if (upgrade.category) node.classList.add('node-' + upgrade.category);

            const upgradeIndex = this.prestigeUpgrades.findIndex(u => u.id === upgrade.id);
            const isBought = this.gameState.prestigeUpgradeStatus[upgradeIndex];
            const canBuy = this.canBuyPrestigeUpgrade(upgrade);

            if (isBought) {
                node.classList.add('purchased');
                node.innerHTML = this.getUpgradeIcon(upgrade.type);
            } else if (canBuy) {
                node.classList.add('available');
                node.innerText = "?";
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
        this.treeX = 0;
        this.treeY = 0;
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
                world.style.transform = `translate(${this.treeX}px, ${this.treeY}px)`;
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
        ctx.lineCap = 'round';
        const ZOOM = 10;

        this.prestigeUpgrades.forEach(upgrade => {
            if (upgrade.parents && upgrade.parents.length > 0) {
                const targetX = (upgrade.x - 50) * ZOOM;
                const targetY = (upgrade.y - 50) * ZOOM;
                upgrade.parents.forEach(parentId => {
                    const parentUpgrade = this.prestigeUpgrades.find(u => u.id === parentId);
                    if (parentUpgrade) {
                        const startX = (parentUpgrade.x - 50) * ZOOM;
                        const startY = (parentUpgrade.y - 50) * ZOOM;
                        const uIndex = this.prestigeUpgrades.findIndex(u => u.id === upgrade.id);
                        const pIndex = this.prestigeUpgrades.findIndex(u => u.id === parentId);
                        const isTargetBought = this.gameState.prestigeUpgradeStatus[uIndex];
                        const isParentBought = this.gameState.prestigeUpgradeStatus[pIndex];

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
        if (type === 'click_mult') return '👆';
        if (type === 'sps_mult') return '⚡';
        if (type === 'cost_reduction') return '📉';
        if (type === 'unlock_pets') return '🐾';
        if (type === 'unlock_mine') return '💎';
        if (type === 'unlock_guilds') return '🏰';
        return '★';
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
        if (typeof prestigeUpgrades === 'undefined') return;
        const upgrades = this.gameState.prestigeUpgrades || [];
        const hasPets = upgrades.some(id => prestigeUpgrades.find(u => u.id === id)?.type === 'unlock_pets');
        const hasMine = upgrades.some(id => prestigeUpgrades.find(u => u.id === id)?.type === 'unlock_mine');
        const hasGuilds = upgrades.some(id => prestigeUpgrades.find(u => u.id === id)?.type === 'unlock_guilds');

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

        petsData.forEach((pet) => {
            const petDiv = document.createElement('div');
            petDiv.className = 'pet-item';
            petDiv.dataset.id = pet.id;
            const currentLevel = this.gameState.petLevels[pet.id] || 0;
            const stats = this.calculatePetStat(pet, currentLevel);
            let buyButtonHtml = '';
            let statusText;
            let buttonClass = 'btn-buy-pet';

            if (currentLevel === pet.maxLevel) {
                statusText = `Max Level (${pet.maxLevel})`;
                buyButtonHtml = `<button class="btn-confirm" disabled>Max Level</button>`;
            } else {
                const canAfford = this.gameState.diamanten >= stats.nextCost;
                statusText = `Level ${currentLevel} -> ${currentLevel + 1}`;
                buyButtonHtml = `
                    <button class="${buttonClass}" data-id="${pet.id}" ${canAfford ? '' : 'disabled'}>
                        ${currentLevel === 0 ? 'Kaufen' : 'Level Up'} (${this.formatNumber(stats.nextCost)} 💎)
                    </button>
                `;
            }

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
        const modalTitle = container.closest('.modal-content')?.querySelector('h2');
        if (modalTitle) modalTitle.innerHTML = `💎 Diamanten-Mine & Shop`;

        const MINE_INDEX = DIAMOND_MINE_INDEX;
        const mineDefinition = uniqueBuildingsData.find(u => u.id === 'diamond_mine');
        if (!mineDefinition) return;
        const mineCount = this.gameState.buildingCounts[MINE_INDEX] || 0;

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

        const hasNav = container.querySelector('.mine-nav');
        if (!hasNav) {
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
            this.getById('mine-tab-mine').addEventListener('click', () => {
                this.diamondMineView = 'mine';
                container.innerHTML = '';
                this.renderDiamondMineContent();
            });
            this.getById('mine-tab-shop').addEventListener('click', () => {
                this.diamondMineView = 'shop';
                container.innerHTML = '';
                this.renderDiamondMineContent();
            });
        } else {
            const diamDisplay = this.getById('shop-diamanten-anzeige');
            if(diamDisplay) diamDisplay.innerText = this.formatNumber(this.gameState.diamanten);
        }

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
        let BONUS_DIAMOND = 5 * mineCount;
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
            const startBtn = this.getById('start-minigame-button');
            startBtn.addEventListener('click', () => {
                if (!this.gameState.diamondMinigameRunning) {
                    this.startDiamondMinigame();
                } else {
                    this.currentMinigameClicks = (this.currentMinigameClicks || 0) + 1;
                    startBtn.style.transform = 'scale(0.95)';
                    setTimeout(() => startBtn.style.transform = 'scale(1)', 50);
                    const resultText = this.getById('minigame-result');
                    if (resultText) {
                        resultText.style.color = '#fff';
                        resultText.innerHTML = `Power: <span style="color: #ff3333; font-size: 1.2em;">${this.currentMinigameClicks}</span> 🔥`;
                    }
                }
            });
        }

        if (!this.gameState.diamondMinigameRunning) {
            const btnText = this.getById('minigame-btn-text');
            if (btnText) btnText.innerText = "Schürfen starten";
        } else {
            const btnText = this.getById('minigame-btn-text');
            if (btnText) btnText.innerText = "SCHÜRFE LÄUFT... (KLICK!)";
        }
        const rewardDisplay = this.getById('minigame-base-reward');
        if (rewardDisplay) rewardDisplay.innerText = `${BONUS_DIAMOND} 💎`;
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
        innerGrid.innerHTML = shopHtml;
        innerGrid.querySelectorAll('.btn-buy-diamond').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id, 10);
                this.buyDiamondShopUpgrade(id);
            });
        });
    }

    guildView = 'shop';

    renderGuildsContent() {
        const container = this.getById('guilds-content');
        if (!container) return;

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

        let contentHtml = '';
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
        } else if (this.guildView === 'boss') {
            if (this.gameState.guildBossFighting) {
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

        container.innerHTML = `
            <div style="display:flex; gap:10px; margin-bottom:20px; border-bottom:1px solid #444; padding-bottom:15px;">
                <button id="tab-guild-shop" class="btn-primary ${this.guildView==='shop'?'':'btn-cancel'}" style="flex:1">Mitglieder</button>
                <button id="tab-guild-boss" class="btn-primary ${this.guildView==='boss'?'':'btn-cancel'}" style="flex:1">Boss Raid</button>
                <button id="tab-guild-quests" class="btn-primary ${this.guildView==='quests'?'':'btn-cancel'}" style="flex:1">Quests</button>
            </div>
            <h3>Gilde: ${this.gameState.guildName}</h3>
            ${contentHtml}
        `;

        this.getById('tab-guild-shop')?.addEventListener('click', () => { this.guildView='shop'; this.renderGuildsContent(); });
        this.getById('tab-guild-boss')?.addEventListener('click', () => { this.guildView='boss'; this.renderGuildsContent(); });
        this.getById('tab-guild-quests')?.addEventListener('click', () => { this.guildView='quests'; this.renderGuildsContent(); });

        if (this.guildView === 'shop') {
             container.querySelectorAll('.btn-buy-guild').forEach(btn => {
                btn.addEventListener('click', (e) => this.buyGuildUpgrade(parseInt(e.target.dataset.id)));
            });
        }
        if (this.guildView === 'quests') {
            container.querySelectorAll('.btn-start-quest').forEach(btn => {
                btn.addEventListener('click', (e) => this.startQuest(parseFloat(e.target.dataset.id)));
            });
            container.querySelectorAll('.btn-claim-quest').forEach(btn => {
                btn.addEventListener('click', (e) => this.claimQuest(parseFloat(e.target.dataset.id)));
            });
        }
        if (this.guildView === 'boss') {
             this.getById('start-boss-btn')?.addEventListener('click', () => this.startGuildBoss());
             const bossClicker = this.getById('guild-boss-clicker');
             if(bossClicker) {
                 bossClicker.addEventListener('mousedown', (e) => {
                     bossClicker.style.transform = "scale(0.9)";
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

        // Wir fügen ein 'title' Attribut für den Tooltip hinzu
        buildingDiv.innerHTML = `
            <h3 title="Basis-Produktion: ${building.baseSPS} SPS pro Gebäude">
                ${building.name} (<span id="building-count-${index}">0</span>)
            </h3>
            <p class="production">Produktion: <span id="building-sps-${index}">0</span> SPS (<span id="building-sps-pct-${index}">0.0</span>%)</p>
            <div class="button-group">
                <button id="buy-btn-${index}" class="btn-buy" title="Klicke hier, um dieses Gebäude zu kaufen">
                    <span>Kaufen</span>
                    <span id="buy-cost-${index}">---</span>
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

    setupMainEventListeners() {
        // 1. SMILEY KLICKEN
        this.getById('smiley_button')?.addEventListener('click', (e) => this.klickeSmiley(e));

        // --- NEU: TOGGLE LEISTE (1x, 10x, 100x) ---
        const toggleContainer = this.getById('buy-amount-toggles');
        if (toggleContainer) {
            toggleContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-toggle');
                if (!btn) return;

                // Visuell umschalten (Active Klasse setzen)
                document.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Wert setzen & UI updaten
                this.currentBuyAmount = parseInt(btn.dataset.amount, 10);
                this.updateUI(); // Berechnet sofort die Preise neu
            });
        }

        // --- NEU: TASTATUR SHORTCUTS (Shift/Strg) ---
        window.addEventListener('keydown', (e) => {
            if (e.repeat) return; // Verhindert Flackern

            if (e.shiftKey) {
                this.currentBuyAmount = 10;
                this.highlightToggle(10); // Visuelles Feedback
                this.updateUI();
            } else if (e.ctrlKey) {
                this.currentBuyAmount = 100;
                this.highlightToggle(100); // Visuelles Feedback
                this.updateUI();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'Shift' || e.key === 'Control') {
                // Zurücksetzen auf den Button, der eigentlich aktiv ist
                const activeBtn = document.querySelector('.btn-toggle.active');
                if (activeBtn) {
                    this.currentBuyAmount = parseInt(activeBtn.dataset.amount);
                } else {
                    this.currentBuyAmount = 1;
                }
                
                // Visuelles Feedback entfernen
                document.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('key-active'));
                
                this.updateUI();
            }
        });

        // 2. GEBÄUDE KAUFEN (Angepasst auf dynamische Menge)
        this.getById('building-grid')?.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-buy');
            if (!button) return;

            const buildingItem = button.closest('.building-item');
            if (!buildingItem) return;

            const index = parseInt(buildingItem.dataset.index, 10);
            
            // WICHTIG: Wir nutzen jetzt die globale Variable statt data-amount!
            const amount = this.currentBuyAmount; 

            if (!isNaN(index)) {
                this.kaufeMehrereGebaeude(index, amount);
            }
        });

        // 3. GLOBAL UPGRADES (Unverändert)
        this.getById('global-upgrades-container')?.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-buy-research');
            if (!button) return;
            const id = parseInt(button.dataset.id, 10);
            const amount = parseInt(button.dataset.amount, 10);
            if (!isNaN(id)) {
                this.kaufeGlobalUpgrade(id, amount || 1);
            }
        });

        // 4. PET SHOP (Unverändert)
        this.getById('pet-shop-grid')?.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;
            const petId = button.dataset.id;
            if (button.classList.contains('btn-buy-pet')) {
                this.levelUpPet(petId);
            } else if (button.classList.contains('btn-pet-activate')) {
                this.activatePet(petId);
            }
        });

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

        // 5. DIAMANT MINE & MINIGAME (Unverändert)
        this.getById('diamond-mine-content')?.addEventListener('click', (e) => {
            const buyButton = e.target.closest('#buy-diamond-mine-button');
            const startButton = e.target.closest('#start-minigame-button');
            if (buyButton) {
                const index = parseInt(buyButton.dataset.index, 10);
                if (index === DIAMOND_MINE_INDEX) {
                    this.kaufeMehrereGebaeude(index, 1);
                }
            }
            if (startButton) {
                if (!this.gameState.diamondMinigameRunning) {
                    this.startDiamondMinigame();
                } else {
                    this.currentMinigameClicks = (this.currentMinigameClicks || 0) + 1;
                    startButton.style.transform = 'scale(0.95)';
                    setTimeout(() => startButton.style.transform = 'scale(1)', 50);
                    const resultText = this.getById('minigame-result');
                    if (resultText) resultText.innerText = `Schürf-Power: ${this.currentMinigameClicks}`;
                }
            }
        });

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

        // 6. GILDEN (Unverändert)
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

        // 7. ESCAPE KEY (Unverändert)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modals = [
                    'prestige-shop-modal', 'skill_tree_modal', 'settings-modal', 
                    'pet-shop-modal', 'diamond-mine-modal', 'guilds-modal',
                    'buildings_info_modal', 'global_upgrades_info_modal', 
                    'achievements_info_modal', 'stats_info_modal', 'prestige_info_modal'
                ];
                modals.forEach(id => {
                    const el = document.getElementById(id);
                    if (el && el.style.display && el.style.display !== 'none') {
                        el.style.display = 'none';
                    }
                });
            }
        });
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
        const closeGlobalUpgradesButton = this.getById('close_global_upgrades_info_button');
        openGlobalUpgradesButton?.addEventListener('click', () => {
            this.createInfoGlobalUpgradeElements();
            if (globalUpgradesModal) globalUpgradesModal.style.display = 'flex';
        });
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
            this.createInfoAchievementElements();
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
                        if (document.execCommand && saveDataTextarea.select) {
                            saveDataTextarea.select();
                            document.execCommand('copy');
                            this.showNotification("Spielstand kopiert.", "success");
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
        const allBuildings = [...buildingsData, ...uniqueBuildingsData];
        const globalMulti = this.gameState.globalerPrestigeMultiplikator;

        allBuildings.forEach((building, index) => {
            if (index === DIAMOND_MINE_INDEX) return;
            const item = document.createElement('div');
            item.className = 'info-stats-item building-info-item';
            const baseSPSPerUnit = building.baseSPS * (building.prestigeMulti || 1);
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
        globalUpgrades.forEach(u => {
            const bought = this.gameState.researchStatus[u.id];
            container.innerHTML += `<div class="info-upgrade-item" style="border-left:5px solid ${bought?'green':'gray'}">
                <h4>${u.description}</h4><p>${bought?'Gekauft':'Noch offen'}</p></div>`;
        });
    }

    createInfoPetsElements() {
        const container = this.getById('info_pets_container');
        if (!container) return;
        container.innerHTML = '';
        petsData.forEach(p => {
            const lvl = this.gameState.petLevels[p.id] || 0;
            container.innerHTML += `<div class="info-upgrade-item"><h4>${p.name} (Lv ${lvl})</h4><p>${p.description}</p></div>`;
        });
    }

    createInfoAchievementElements() {
        const container = this.getById('info_achievements_container');
        if (!container) return;
        container.innerHTML = '';
        achievementsData.forEach((a, i) => {
            const unlocked = this.gameState.achievementsUnlocked[i];
            container.innerHTML += `<div class="info-upgrade-item" style="opacity:${unlocked?1:0.5}">
                <h4>${unlocked?'🏆':'🔒'} ${a.name}</h4><p>${a.description}</p></div>`;
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
        container.className = 'info-grid';
        container.innerHTML = '';

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
        const divisor = (multPoints * multResets * multGuild) || 1;
        const multUpgrades = totalGlobal / divisor;

        const fmt = (val) => (val * 100).toFixed(1) + '%';
        const xFmt = (val) => 'x' + val.toFixed(2);

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
        // Balkendiagramm für Produktions-Verteilung hinzufügen
    const productionHeader = document.createElement('h3');
    productionHeader.innerText = "Produktions-Anteil";
    productionHeader.style.gridColumn = "1 / -1";
    productionHeader.style.marginTop = "20px";
    container.appendChild(productionHeader);

    buildingsData.forEach((b, i) => {
    const count = this.gameState.buildingCounts[i] || 0;
        if (count > 0) {
            const baseSPS = count * (b.baseSPS || 0) * (b.prestigeMulti || 1);
            const actualSPS = baseSPS * this.gameState.globalerPrestigeMultiplikator;
            const pct = (actualSPS / this.gameState.totalSPS) * 100;

            const barItem = document.createElement('div');
            barItem.className = 'info-upgrade-item';
            barItem.style.gridColumn = "1 / -1";
            barItem.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span>${b.name} (${count}x)</span>
                    <span style="color:var(--color-accent-blue); font-weight:bold;">${pct.toFixed(1)}%</span>
                    </div>
                <div style="background:#111; height:10px; border-radius:5px; border:1px solid #333; overflow:hidden;">
                <div style="width:${pct}%; height:100%; background:linear-gradient(90deg, #009FFD, #2af5ff); box-shadow: 0 0 10px rgba(0,159,253,0.5);"></div>
                </div>
            `;
                container.appendChild(barItem);
            }
        });
    }

    getAchievementBonusText(bonus) {
        switch (bonus.type) {
            case 'sps_mult': return `+${(bonus.value * 100)}% SPS`;
            case 'click_mult': return `+${(bonus.value * 100)}% Klickkraft`;
            case 'global_mult': return `+${(bonus.value * 100)}% auf Alles`;
            case 'prestige_efficiency': return `+${(bonus.value * 100)}% Prestige-Effekt`;
            default: return "Permanenter Bonus";
        }
    }

    ladeAudioEinstellungen() {
        const musicVolume = localStorage.getItem('musicVolume');
        const soundVolume = localStorage.getItem('soundVolume');
        const musicVolumeSlider = this.getById('music-volume');
        const soundVolumeSlider = this.getById('sound-volume');
        if (musicVolumeSlider && musicVolume !== null) musicVolumeSlider.value = musicVolume;
        if (soundVolumeSlider && soundVolume !== null) soundVolumeSlider.value = soundVolume;
        this.setzeLautstaerke();
    }

    setzeLautstaerke() {
        const musicVolume = parseFloat(localStorage.getItem('musicVolume') || 100) / 100;
        const soundVolume = parseFloat(localStorage.getItem('soundVolume') || 100) / 100;
        const musicPlayer = this.getById('background-music');
        if (musicPlayer) musicPlayer.volume = musicVolume;
        const clickSound = this.getById('click-sound');
        if (clickSound) clickSound.volume = soundVolume;
    }

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
        oscillator.type = 'triangle';
        const freq = 200 + Math.random() * 50;
        oscillator.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.3, this.audioCtx.currentTime + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);
        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + 0.06);
    }

    switchView(viewName) {
        const modals = ['prestige-shop-modal', 'info-modal', 'settings-modal'];
        modals.forEach(id => {
            const m = document.getElementById(id);
            if(m) m.style.display = 'none';
        });
        if (viewName === 'home') {
            window.scrollTo(0, 0);
        } else if (viewName === 'prestige') {
            const pModal = document.getElementById('prestige-shop-modal');
            if(pModal) {
                pModal.style.display = 'flex';
                this.updatePrestigeUIView();
            }
        } else if (viewName === 'info') {
            const iModal = document.getElementById('info-modal');
            if(iModal) iModal.style.display = 'flex';
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
        const isPositive = Math.random() < 0.6; // 60% Chance auf einen Buff
        
        if (isPositive) {
            // --- 🟢 BUFFS ---
            const buffType = Math.random();
            
            if (buffType < 0.5) {
                // Sofort-Gewinn basierend auf Produktion
                const gain = Math.max(500, this.gameState.totalSPS * 60 * 10); // 10 Min Produktion
                this.addSmileys(gain);
                this.showNotification(`🎁 Glückspilz! +${this.formatNumber(gain)} Smileys erhalten.`, 'success');
            } else {
                // SPS Boost
                this.gameState.activeBuffs.spsMultiplier = 2.5;
                this.showNotification(`⚡ Smiley-Rausch! SPS x2.5 für 30s`, 'success');
                
                // Timer zum Zurücksetzen
                setTimeout(() => {
                    this.gameState.activeBuffs.spsMultiplier = 1;
                    this.showNotification(`⌛ Der Rausch ist vorbei.`, 'info');
                    this.updateUI();
                }, 30000);
            }
        } else {
            // --- 🔴 DEBUFFS (Deine Ideen) ---
            const debuffType = Math.random();

            if (debuffType < 0.33) {
                // Direkter Abzug an Smileys
                const loss = Math.floor(this.gameState.aktuelle_smileys * 0.10); // 10% Abzug
                this.gameState.aktuelle_smileys -= loss;
                this.showNotification(`📉 Pech! -10% Deiner Smileys wurden abgezogen.`, 'error');
            } else if (debuffType < 0.66) {
                // SPS Reduktion
                this.gameState.activeBuffs.spsMultiplier = 0.4; // 60% weniger
                this.showNotification(`🐢 System-Drosselung! SPS -60% für 30s`, 'error');
                
                setTimeout(() => {
                    this.gameState.activeBuffs.spsMultiplier = 1;
                    this.showNotification(`🔧 System wieder normal.`, 'info');
                    this.updateUI();
                }, 30000);
            } else {
                // Inflation: Gebäude werden teurer
                this.gameState.activeBuffs.costMultiplier = 1.5; // 50% teurer
                this.showNotification(`💸 Inflation! Preise +50% für 1 Minute`, 'error');
                
                setTimeout(() => {
                    this.gameState.activeBuffs.costMultiplier = 1;
                    this.showNotification(`⚖️ Preise haben sich stabilisiert.`, 'info');
                    this.updateUI();
                }, 60000);
            }
        }
        
        // UI sofort aktualisieren, um Änderungen zu zeigen
        this.updateNewsTicker("ALARM: Inflation teibt die Preise hoch!")
        this.applyAllBoni();
        this.updateUI();
    
    }

// =========================================================
// 12.News Middle Colum Top
// // =========================================================

    updateNewsTicker(manualText = null) {
    const ticker = this.getById('news-ticker-text');
    if (!ticker) return;

    if (manualText) {
        ticker.innerText = manualText;
        ticker.style.color = "#009FFD"; // Blau für Events
    } else {
        const news = [
            "Wissenschaftler entdecken: Smileys machen glücklich!",
            "Gilden suchen aktive Mitglieder für den nächsten Boss-Raid.",
            "Diamanten-Mine meldet Rekordfunde in den tiefen Ebenen.",
            "Ein unbekannter Spender hat tausende Smileys verschenkt!",
            "Achtung: Geheimnisvolle Fragezeichen fliegen durch die Luft.",
            "Dein Smiley wurde zum 'Smiley des Monats' gewählt!"
        ];
        ticker.innerText = news[Math.floor(Math.random() * news.length)];
        ticker.style.color = "#ccc";
    }
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

}