// ================================================================================================================
// === SmileyGame.js: Haupspielklasse (Refactored 2025-12-15) ===
// ================================================================================================================

class SmileyGame {
    // ================================================================================================================
    // 0. KLASSE & CONSTRUCTOR
    // ================================================================================================================

    constructor() {
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
                    prestigeUpgradeStatus: prestigeUpgrades.map(() => false),

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
        this.ladeSpiel(); // WICHTIG: Lädt den Spielstand sofort

        this.createBuildingElements();
        this.renderPetShop();

        this.updateGlobalUpgradeUI();
        this.updatePrestigeUI();

        this.ladeAudioEinstellungen();

        // FIX: Tippfehler korrigiert ('background' statt 'backgroudn')
        const musicPlayer = this.getById('background-music');
        if (musicPlayer) {
            musicPlayer.play().catch(e => {
                console.log("Musik wartet auf Interaktion:", e);
            });
        }

        this.setupMainEventListeners();
        this.setupPrestigeEventListeners(); // Hier müssen wir gleich rein!
        this.setupInfoPageEventListeners();

        this.startIntervals();
        this.updatePetInterval();

        this.updateUI();
    }

    // ================================================================================================================
    // 1. SPIELKONTROLLE & INTERVALLE
    // ================================================================================================================

    startIntervals() {
        this.productionInterval = setInterval(() => this.produzierePassiveErträge(), 1000);
        this.saveInterval = setInterval(() => {
            this.speichereSpiel();
        }, 5000);
        window.addEventListener('beforeunload', () => this.speichereSpiel());
    }

    produzierePassiveErträge() {
        // WICHTIG: Erst neu berechnen, falls sich was geändert hat (z.B. durch Upgrades)
        // Wenn das zu viel Performance frisst, kannst du es weglassen, aber so ist es exakt.
        const actualSPS = this.computeTotalSPS();

        if (actualSPS > 0) {
            // 1. Auf das Konto zum Ausgeben
            this.gameState.aktuelle_smileys += actualSPS;

            // 2. Auf das Lifetime-Konto (für Prestige-Level!)
            // HIER GEÄNDERT: Wir nutzen lifetime_smileys statt gesammelte_smileys
            // damit es zu unserem Prestige-Code von vorhin passt.
            this.gameState.lifetime_smileys += actualSPS;
        }

        // 2. DIAMANTEN-PRODUKTION (DPS)
        // (Dieser Teil von dir war schon super, habe ihn nur sicherheitshalber formatiert)
        const MINE_INDEX = 8; // Oder deine Konstante DIAMOND_MINE_INDEX

        // Prüfen ob Mine freigeschaltet (ID 8 im Tree setzt diamondMineUnlocked auf true)
        if (this.gameState.diamondMineUnlocked && this.gameState.buildingCounts[MINE_INDEX] > 0) {
            // Wir suchen das Minen-Objekt in den Daten
            // (Achte darauf, dass uniqueBuildingsData verfügbar ist)
            const mine = uniqueBuildingsData.find(u => u.id === 'diamond_mine');

            if (mine) {
                // Logik: 10% der Basis-DPS pro Sekunde
                const autoDiamondRate = mine.baseDPS * (mine.diamondMultiplier || 1) * 0.1;
                this.gameState.diamanten += autoDiamondRate;
            }
        }

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
        if (this.petAutoClickTimer !== null) {
            clearInterval(this.petAutoClickTimer);
            this.petAutoClickTimer = null;
        }

        if (this.gameState.activePet) {
            const petDetails = petsData.find(p => p.id === this.gameState.activePet);

            if (petDetails && petDetails.id === 'pet_dog') {
                const clicksPerInterval = 1;
                const intervalDuration = 1000;

                this.petAutoClickTimer = setInterval(() => {
                    this.klickeSmiley();
                }, intervalDuration);

                console.log(`Auto-Click Pet-Intervall gestartet: ${clicksPerInterval} Klicks/Sekunde.`);
            }
        }
    }

    // ================================================================================================================
    // 2. SPEICHERUNG & HILFSFUNKTIONEN
    // ================================================================================================================

    speichereSpiel() {
        try {
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

            const balanceVersion = localStorage.getItem('balanceVersion');
            if (this.gameState.gesamt_prestige_punkte > 10000 && balanceVersion !== '2') {
                alert("Dein Spielstand wurde aufgrund einer wichtigen Balance-Änderung angepasst.");
                this.gameState.gesamt_prestige_punkte = 0;
                this.gameState.prestige_punkte_verfügbar = 0;
                this.gameState.prestigeUpgradeStatus.fill(false);
                localStorage.setItem('balanceVersion', '2');
            }

            this.applyAllBoni();
            return true;
        } catch (e) {
            console.error("Fehler beim Laden des Spiels:", e);
            if (encodedData) alert("Fehler beim Importieren des Spielstands. Die Daten sind möglicherweise beschädigt.");
            localStorage.removeItem('smileyGameSave');
            return false;
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

    // Ausschnitt aus SmileyGame.js (Abschnitt 2. SPEICHERUNG & HILFSFUNKTIONEN)

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
        // Reset Multipliers
        this.gameState.globalSPSMultiplier = 1;
        this.gameState.prestigePointMultiplier = 0.01;
        this.gameState.prestigeResetBonus = 0;
        this.gameState.guildSPSMultiplier = 0;

        let diamondSPSMultiplier = 1;
        let diamondClickMultiplier = 1;
        this.gameState.autoDiamondMineUnlocked = false;

        // Reset Feature States
        this.gameState.petsUnlocked = false;
        this.gameState.diamondMineUnlocked = false;
        this.gameState.guildsUnlocked = false;

        let baseClickMultiplier = 1;
        let prestigeClickMultiplier = 0;
        buildingsData.forEach(b => {
            b.prestigeMulti = 1;
        });

        // 2. PRESTIGE Boni
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

        // 3. PET Boni
        if (this.gameState.activePet) {
                    // Findet das Pet-Objekt
                    const pet = petsData.find(p => p.id === this.gameState.activePet);

                    if (pet) {
                        // WICHTIG: Hole den skalierten Effekt basierend auf der STRING ID
                        const currentLevel = this.gameState.petLevels[pet.id] || 0;

                        // Wenn das Pet noch Level 0 ist (oder nicht existiert), überspringen wir.
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
                                // cost_reduction_buildings und cost_reduction_upgrades werden in den Cost-Methoden behandelt.
                            }
                        }
                    }
        }
        // --- DIAMANT SHOP BONI BERECHNEN ---
                // 1. Reset der Werte
                this.gameState.critChance = 0;
                this.gameState.critDamageMult = 3; // Basis-Crit ist 3x Schaden
                this.gameState.diamondMineBoost = 0;
                this.gameState.globalCostReduction = 0;
                this.gameState.clickSPSRatio = 0;
                this.gameState.godModeMultiplier = 1;

                let diamondStaticClick = 1;
                let diamondStaticSPS = 1;

                // 2. Loop durch Upgrades
                diamondShopUpgrades.forEach(upgrade => {
                    const count = this.gameState.diamondShopPurchases[upgrade.id] || 0;
                    if (count > 0) {
                        switch(upgrade.type) {
                            case 'click_mult_static':
                                diamondStaticClick *= (upgrade.value * count); // x10
                                break;
                            case 'sps_mult_static':
                                diamondStaticSPS += (upgrade.value * count); // +100% = x2
                                break;
                            case 'prestige_point_eff':
                                this.gameState.prestigePointMultiplier += (upgrade.value * count);
                                break;
                            case 'auto_diamond_mine':
                                this.gameState.autoDiamondMineUnlocked = true;
                                break;
                            // -- NEUE --
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

                // 3. Multiplikatoren anwenden
                prestigeClickMultiplier += (diamondStaticClick - 1); // Klick verrechnen
                this.gameState.globalSPSMultiplier *= diamondStaticSPS; // SPS verdoppeln
                this.gameState.globalSPSMultiplier *= this.gameState.godModeMultiplier; // God Mode auf SPS

        // --- GILDEN BONI BERECHNEN (10 Mitglieder) ---
                // Reset
                this.gameState.guildCostReduction = 0;
                this.gameState.guildPrestigeBonus = 0;
                this.gameState.guildGlobalMultiplier = 1;
                this.gameState.guildSPSMultiplier = 0;

                this.gameState.guildUpgradeStatus.forEach((bought, id) => {
                    if (bought) {
                        const member = guildUpgradesData.find(u => u.id === id);
                        if (member) {
                            // 1. Standard Multiplikatoren (SPS oder Klick)
                            if (member.isClickMultiplier) {
                                // Klick: Nur addieren (z.B. 1.10 -> +0.10)
                                prestigeClickMultiplier += (member.spsMultiplier - 1);
                            } else if (member.spsMultiplier > 1 && !member.specialEffect) {
                                // SPS: Nur addieren, wenn KEIN Special Effect (oder beides)
                                this.gameState.guildSPSMultiplier += (member.spsMultiplier - 1);
                            }

                            // 2. Spezialeffekte (Neu)
                            if (member.specialEffect) {
                                switch (member.specialEffect) {
                                    case "cost_reduction_2":
                                        this.gameState.guildCostReduction += 0.02; // Händler
                                        break;
                                    case "cost_reduction_5":
                                        this.gameState.guildCostReduction += 0.05; // Baumeister
                                        break;
                                    case "prestige_boost_10":
                                        this.gameState.guildPrestigeBonus += 0.10; // Barde
                                        break;
                                    case "global_god_boost":
                                        this.gameState.guildGlobalMultiplier *= member.spsMultiplier; // König (x2)
                                        break;
                                }
                            }
                        }
                    }
                });

                // Einrechnen der neuen Gilden-Spezials in die globalen Werte
                // A. Prestige Bonus (Barde)
                this.gameState.prestigePointMultiplier += this.gameState.guildPrestigeBonus;

                // B. Globaler Multiplikator (König)
                this.gameState.globalSPSMultiplier *= this.gameState.guildGlobalMultiplier;

        // In applyAllBoni()
        achievementsData.forEach((achievement, index) => {
            if (this.gameState.achievementsUnlocked[index]) {
                const bonus = achievement.bonus;
                switch (bonus.type) {
                    case 'sps_mult':
                        this.gameState.globalSPSMultiplier += bonus.value;
                        break;
                    case 'click_mult':
                        this.gameState.klickKraftMultiplier += bonus.value;
                        break;
                    case 'prestige_efficiency':
                        this.gameState.prestigePointMultiplier += bonus.value;
                        break;
                    case 'global_mult':
                        this.gameState.globalSPSMultiplier += bonus.value;
                        this.gameState.klickKraftMultiplier += bonus.value;
                        break;
                }
            }
        });

        // 5. Finalisierung
        this.gameState.klickKraftMultiplier = baseClickMultiplier + prestigeClickMultiplier;
        const prestigeBonus = 1 + (this.gameState.gesamt_prestige_punkte * this.gameState.prestigePointMultiplier);
        const resetBonus = 1 + (this.gameState.prestigeResets * this.gameState.prestigeResetBonus);

        this.gameState.globalerPrestigeMultiplikator = prestigeBonus * resetBonus * this.gameState.globalSPSMultiplier * (1 + this.gameState.guildSPSMultiplier);
    }

    spawnFloatingText(event, amount, type = 'normal') {
            // Position bestimmen (Mauszeiger oder Mitte des Buttons falls undefined)
            let x = event ? event.clientX : window.innerWidth / 2;
            let y = event ? event.clientY : window.innerHeight / 2;

            // Etwas Zufall in die Position bringen (damit Zahlen nicht stapeln)
            const randomX = (Math.random() - 0.5) * 40; // +/- 20px
            const randomY = (Math.random() - 0.5) * 40;

            // HTML Element erstellen
            const el = document.createElement('div');
            el.className = `floating-text ${type}`; // 'normal' oder 'crit'
            el.innerText = `+${this.formatNumber(amount)}`;

            // Positionieren
            el.style.left = `${x + randomX}px`;
            el.style.top = `${y + randomY}px`;

            document.body.appendChild(el);

            // Nach Ende der Animation (1s) löschen, um Speicher zu sparen
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

            // Crit Chance prüfen
            if (this.gameState.critChance > 0 && Math.random() < this.gameState.critChance) {
                damage *= this.gameState.critDamageMult;
                isCrit = true;
            }

            this.gameState.aktuelle_smileys += damage;
            this.gameState.lifetime_smileys += damage;

            // --- VISUALS ---
            // Wenn wir ein Maus-Event haben (e), zeigen wir den Text
            if (e) {
                this.spawnFloatingText(e, damage, isCrit ? 'crit' : 'normal');
            }

            // Optional: Kleines Konsolen-Feedback bei Crits wegnehmen, nervt sonst
            // if (isCrit) console.log("CRIT!");

            this.checkAchievements();
            this.updateUI();
        }

    getClickStrength() {
            // 1. Basis & Prestige
            let strength = this.gameState.klickKraft * this.gameState.klickKraftMultiplier;

            if (this.calculatePrestigeEffects) {
                const prestigeEffects = this.calculatePrestigeEffects();
                strength *= prestigeEffects.clickMultiplier;
            }

            // 2. God Mode (Diamant Shop Upgrade 9)
            strength *= this.gameState.godModeMultiplier;

            // 3. Synergie-Matrix (SPS addiert zum Klick)
            if (this.gameState.clickSPSRatio > 0) {
                strength += (this.gameState.totalSPS * this.gameState.clickSPSRatio);
            }

            // --- Kritischer Treffer Logik ---
            // Wir prüfen hier nicht den Zufall (das macht klickeSmiley),
            // sondern geben nur die Basis-Stärke zurück.
            // Die Crit-Berechnung muss in 'klickeSmiley' passieren!

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

   // --- Ersetze die ganze kaufeGlobalUpgrade Funktion ---

   kaufeGlobalUpgrade(id, amount = 1) {
       let purchasedCount = 0;

       const startUpgrade = globalUpgrades.find(u => u.id === id);
       if (!startUpgrade) return;
       const targetBuildingIndex = startUpgrade.buildingIndex;

       for (let i = 0; i < amount; i++) {
           const nextId = id + i;
           const upgrade = globalUpgrades.find(u => u.id === nextId);

           if (!upgrade) break;
           if (upgrade.buildingIndex !== targetBuildingIndex) break;
           if (this.gameState.researchStatus[upgrade.id]) continue;

           // WICHTIG: Auch hier Math.ceil nutzen, damit es zur UI passt
           const finalCost = Math.ceil(this.calculateUpgradeCost(upgrade.cost));

           if (this.gameState.aktuelle_smileys >= finalCost) {
               this.gameState.aktuelle_smileys -= finalCost;
               this.gameState.researchStatus[upgrade.id] = true;
               purchasedCount++;

               // --- HIER IST DAS NEUE VISUELLE FEEDBACK ---
               // Wir rufen die Toast-Nachricht auf:
               this.showNotification(`Upgrade gekauft: ${upgrade.description}`, 'success');
               // -------------------------------------------

           } else {
               break;
           }
       }

       // UI aktualisieren, wenn etwas gekauft wurde
       if (purchasedCount > 0) {
           this.updateUI();
           // Falls du eine spezielle Funktion für Upgrades hast:
           if (this.updateGlobalUpgradeUI) this.updateGlobalUpgradeUI();
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

            this.renderSkillTree();
            this.updatePrestigeUI();
            this.updateUI(); // Unlocks aktualisieren

        } else {
            this.showNotification(`Nicht genug Punkte! Benötigt: ${upgrade.cost}`, "error");
        }
    }

    prestigeReset() {
        const prestigePointThreshold = 1000000;
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
            // const petIndex = petsData.findIndex(p => p.id === petId); // Nicht mehr benötigt
            const pet = petsData.find(p => p.id === petId); // Pet-Objekt finden

            // --- KORREKTUR: currentLevel und Speicherung verwenden Pet-ID (String) ---
            const currentLevel = this.gameState.petLevels[petId] || 0;
            // -------------------------------------------------------------------------

            // Wichtig: Wir nutzen die Funktion, die wir in Abschnitt 2 erstellt haben
            const stats = this.calculatePetStat(pet, currentLevel);

            if (stats.isMaxLevel) {
                console.warn(`Pet ${petId} hat das maximale Level erreicht.`);
                return;
            }

            // PETS KOSTEN DIAMANTEN ZUM LEVELN
            if (this.gameState.diamanten < stats.nextCost) {
                console.warn(`Nicht genug Diamanten (${this.formatNumber(stats.nextCost)} 💎 benötigt).`);
                return;
            }

            // Kosten abziehen und Level erhöhen
            this.gameState.diamanten -= stats.nextCost;
            // --- KORREKTUR DER SPEICHERUNG ---
            this.gameState.petLevels[petId] = currentLevel + 1; // Speichert unter Pet-ID-String
            // ----------------------------------

            // Wenn das Pet zum ersten Mal gekauft wird (Level 0 -> 1), aktiviere es
            if (currentLevel === 0) {
                this.activatePet(petId);
            }

            this.applyAllBoni();
            this.updateUI();
            this.speichereSpiel();
        }
    // activatePet anpassen (Prüfung auf petLevels statt petStatus)
    activatePet(petId) {
        const petIndex = petsData.findIndex(p => p.id === petId);
        // PRÜFUNG: Muss Level > 0 sein
        if (this.gameState.petLevels[petId] <= 0) {
            console.warn("Pet nicht gekauft.");
            return;
        }

        if (this.gameState.activePet === petId) {
            this.gameState.activePet = null;
            console.log(`Pet ${petId} deaktiviert.`);
        } else {
            this.gameState.activePet = petId;
            console.log(`Pet ${petId} aktiviert.`);
        }

        this.applyAllBoni();
        this.updatePetInterval();
        this.updateUI();
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

            clickGuildBoss() {
                if (!this.gameState.guildBossFighting) return;

                // Schaden berechnen (Klickstärke + Bonus für Gildenmitglieder?)
                // Wir nehmen erstmal die normale Klickstärke
                let damage = this.getClickStrength();

                // Optional: Kritische Treffer auch hier erlauben!
                if (this.gameState.critChance > 0 && Math.random() < this.gameState.critChance) {
                    damage *= this.gameState.critDamageMult;
                    this.spawnFloatingText(null, "CRIT!", "crit"); // Visuelles Feedback
                }

                this.gameState.guildBossHP -= damage;

                // HP Update im UI
                this.updateBossUI();

                // Boss tot? -> Sieg
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
            this.computeTotalSPS();

            // ... (Anzeigen für Währungen und SPS/Klick bleiben gleich) ...
            const diamantenEl = this.getById('diamanten_anzeige');
            if (diamantenEl) {
                diamantenEl.innerText = this.formatNumber(this.gameState.diamanten);
            }

            const aktuelleSmileysEl = this.getById('aktuelle_smileys');
            if (aktuelleSmileysEl) {
                aktuelleSmileysEl.innerText = this.formatNumber(this.gameState.aktuelle_smileys);
            }

            const smileysProKlickEl = this.getById('smileys_pro_klick_anzeige');
            if (smileysProKlickEl) {
                smileysProKlickEl.innerText = this.formatNumber(this.gameState.klickKraft * this.gameState.klickKraftMultiplier);
            }

            const smileysProSekundeEl = this.getById('smileys_pro_sekunde_anzeige');
            if (smileysProSekundeEl) {
                smileysProSekundeEl.innerText = this.formatNumber(this.gameState.totalSPS);
            }

            const smileysProMinuteEl = this.getById('smileys_pro_minute_anzeige');
            if (smileysProMinuteEl) {
                smileysProMinuteEl.innerText = this.formatNumber(this.gameState.totalSPS * 60);
            }

            const klickMultiDisplay = this.getById('klick_multiplikator_anzeige');
            if (klickMultiDisplay) {
                klickMultiDisplay.innerText = `x${this.gameState.klickKraftMultiplier.toFixed(2)}`;
            }

            const globalMultiDisplay = this.getById('globaler_multiplikator_anzeige');
            if (globalMultiDisplay) {
                globalMultiDisplay.innerText = `x${this.gameState.globalerPrestigeMultiplikator.toFixed(2)}`;

                // --- NEUE UX: Detaillierte Multiplikator-Aufschlüsselung ---
                const prestigeFactor = 1 + (this.gameState.gesamt_prestige_punkte * this.gameState.prestigePointMultiplier);
                const resetFactor = 1 + (this.gameState.prestigeResets * this.gameState.prestigeResetBonus);
                const upgradeFactor = this.gameState.globalSPSMultiplier;
                const guildFactor = 1 + this.gameState.guildSPSMultiplier;

                const tooltipText = `
                    Prestige Punkte: x${prestigeFactor.toFixed(2)}
                    Resets Bonus: x${resetFactor.toFixed(2)}
                    Upgrades/Pets: x${upgradeFactor.toFixed(2)}
                    Gilden Bonus: x${guildFactor.toFixed(2)}
                `.trim().replace(/\s{2,}/g, ' ');

                globalMultiDisplay.title = tooltipText;


            }

            this.updateBuildingUI();
            this.updatePetButtons();
            this.checkFeatureUnlocks();
            this.updateDiamondMineStatus();
            this.updateGuildsButton();

            const prestigePointThreshold = 1000000;
            const totalPotentialPoints = Math.floor(Math.pow(this.gameState.gesammelte_smileys / prestigePointThreshold, 1 / 3));
            const pointsToGain = Math.max(0, totalPotentialPoints - this.gameState.gesamt_prestige_punkte);

            const nextPointRequirement = Math.pow(this.gameState.gesamt_prestige_punkte + pointsToGain + 1, 3) * prestigePointThreshold;
            const lastPointRequirement = Math.pow(this.gameState.gesamt_prestige_punkte + pointsToGain, 3) * prestigePointThreshold;

            const progressBar = this.getById('prestige-progress-bar');
            const progressText = this.getById('prestige-progress-text');

            if (progressBar && progressText) {
                if (pointsToGain > 0) {
                    progressBar.style.width = '100%';
                    progressText.innerText = `+${pointsToGain} Prestige-Punkt${pointsToGain > 1 ? 'e' : ''} verfügbar!`;
                } else {
                    const progress = Math.max(0, this.gameState.gesammelte_smileys - lastPointRequirement);
                    const goal = nextPointRequirement - lastPointRequirement;
                    const percentage = goal > 0 ? Math.min(100, (progress / goal) * 100) : 0;
                    progressBar.style.width = `${percentage}%`;
                    progressText.innerText = `${this.formatNumber(this.gameState.gesammelte_smileys)} / ${this.formatNumber(nextPointRequirement)}`;
                }
            }

            const guildsModal = this.getById('guilds-modal');
                    if (guildsModal && guildsModal.style.display === 'flex') {
                        if (this.guildView === 'quests' || (this.guildView === 'boss' && this.gameState.guildBossFighting)) {
                            this.renderGuildsContent();
                        }
                    }

            const prestigeView = document.getElementById('view-prestige');
                    if (prestigeView && prestigeView.classList.contains('active')) {
                        // Wenn Prestige-Seite offen ist -> Live aktualisieren!
                        if (typeof this.updatePrestigeUIView === 'function') {
                            this.updatePrestigeUIView();
                        }
                    }

                    // Modals live updaten (hast du schon, aber prüf es nochmal)
                    if(this.getById('guilds-modal')?.style.display === 'flex') this.renderGuildsContent();
                    if(this.getById('diamond-mine-modal')?.style.display === 'flex') this.renderDiamondMineContent();
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

        updateGlobalUpgradeUI() {
           const container = this.getById('global-upgrades-container');
           if (!container) return;
           container.innerHTML = '';

           let nextUpgradeFound = false;
           let currentGroupIndex = null;
           let upgradeGroup = [];
           const MAX_GROUP_RENDER = 4;

           // 1. Gruppierung (bleibt gleich, sucht das nächste offene Upgrade)
           globalUpgrades.forEach(upgrade => {
               const isPurchased = this.gameState.researchStatus[upgrade.id];
               const buildingIndex = upgrade.buildingIndex !== undefined ? upgrade.buildingIndex : -1;

               if (isPurchased) return;

               // Wir wollen immer nur das allererste verfügbare Upgrade einer Gruppe finden
               if (!nextUpgradeFound) {
                    upgradeGroup.push(upgrade);
                    nextUpgradeFound = true; // Sobald wir eins haben, hören wir auf zu suchen (pro Render-Zyklus)
               }
           });

           // 2. Rendering
           if (upgradeGroup.length > 0) {
               const firstUpgrade = upgradeGroup[0];
               const finalCost = this.calculateUpgradeCost(firstUpgrade.cost);

               // WICHTIG: Hier nutzen wir auch Math.ceil, damit der Button korrekt reagiert
               const canAfford = this.gameState.aktuelle_smileys >= Math.ceil(finalCost);

               // --- Stufe berechnen (z.B. "Stufe 3 von 7") ---
               const groupIndex = firstUpgrade.buildingIndex !== undefined ? firstUpgrade.buildingIndex : -1;
               const totalInGroup = globalUpgrades.filter(u => (u.buildingIndex !== undefined ? u.buildingIndex : -1) === groupIndex).length;
               const boughtInGroup = globalUpgrades.filter(u => (u.buildingIndex !== undefined ? u.buildingIndex : -1) === groupIndex && this.gameState.researchStatus[u.id]).length;
               const currentStep = boughtInGroup + 1;

               const typeIcon = firstUpgrade.type === 'click_mult' ? '🖱️' : '🏭';

               const upgradeDiv = document.createElement('div');
               upgradeDiv.className = 'research-item research-group';
               upgradeDiv.dataset.id = firstUpgrade.id;

               // HTML ohne die überflüssigen 10x/100x Buttons
               upgradeDiv.innerHTML = `
                   <div style="flex: 1; padding-right: 15px;">
                       <h4 style="margin: 0 0 5px 0;">
                           ${typeIcon} ${firstUpgrade.description}
                           <span style="font-size: 0.8em; color: var(--color-accent-blue); margin-left: 5px;">
                               (Stufe ${currentStep} / ${totalInGroup})
                           </span>
                       </h4>
                       <p style="margin: 0; color: #888; font-size: 0.9em; text-align: left;">
                           Kosten: <strong style="color: #fff;">${this.formatNumber(Math.ceil(finalCost))}</strong> Smileys
                       </p>
                   </div>
                   <div class="button-group-upgrade">
                       <button class="btn-buy-research" data-id="${firstUpgrade.id}" data-amount="1" ${!canAfford ? 'disabled' : ''} style="min-width: 120px;">
                           Kaufen
                       </button>
                   </div>
               `;
               container.appendChild(upgradeDiv);
           }
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
        this.gameState.lifetime_smileys = 0; // Reset für den nächsten Run

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
        // Wir nutzen lifetime_smileys oder aktuelle_smileys als Fallback
        const totalSmileys = this.gameState.lifetime_smileys || this.gameState.aktuelle_smileys || 0;

        const BLOCK_COST = 1000000; // 1 Million Smileys für den ersten Punkt

        if (totalSmileys < BLOCK_COST) return 0;

        // Formel: Dritte Wurzel
        const points = Math.cbrt(totalSmileys / BLOCK_COST);
        return Math.floor(points);
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

    showSkillTooltip(upgrade, element) {
        const tooltip = this.getById('prestige-tooltip-modal');
        if (!tooltip) return;

        // 1. Daten befüllen
        const title = document.getElementById('tooltip-title');
        const cost = document.getElementById('tooltip-cost');
        const status = document.getElementById('tooltip-status');

        if (title) title.innerText = upgrade.name;
        if (cost) cost.innerText = `Kosten: ${this.formatNumber(upgrade.cost)} Smiley Points`;

        // 2. Status-Text generieren
        const isPurchased = this.gameState.prestigeUpgradeStatus[upgrade.id];
        const reqs = upgrade.requirements || [];
        const requirementsMet = reqs.length === 0 || reqs.every(reqId => this.gameState.prestigeUpgradeStatus[reqId]);

        let statusText = upgrade.description;
        if (isPurchased) {
            statusText += "\n\n✅ Bereits erlernt";
        } else if (!requirementsMet) {
            statusText += "\n\n❌ Voraussetzungen nicht erfüllt";
        }

        if (status) status.innerText = statusText;

        // 3. Tooltip positionieren (neben dem Mauszeiger oder dem Node)
        tooltip.style.display = 'block';

        // Wir positionieren ihn etwas versetzt zum Button
        const rect = element.getBoundingClientRect();
        tooltip.style.top = (rect.top + window.scrollY - 10) + 'px';
        tooltip.style.left = (rect.right + 15) + 'px';
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
                        <span>Aktives Pet: ${pet.name} (Lv. ${currentLevel})</span>
                        <span class="pet-tooltip" title="${pet.description.replace('%', currentEffectDisplay)}">ℹ️</span>
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


    // ================================================================================================================
    // 8. CONTENT RENDERING
    // ================================================================================================================

    renderSkillTree() {
            const container = this.getById('prestige-tree-container');
            if (!container) return;

            container.innerHTML = '';

            // --- SVG HINTERGRUND FÜR LINIEN ---
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.style.position = "absolute";
            svg.style.width = "100%";
            svg.style.height = "100%";
            svg.style.zIndex = "0";
            svg.style.pointerEvents = "none"; // WICHTIG: Damit man durch die Linien klicken kann
            container.appendChild(svg);

            // --- 1. LINIEN ZEICHNEN ---
            const containerWidth = container.clientWidth || 600;
            const centerX = containerWidth / 2;

            prestigeUpgrades.forEach(upgrade => {
                const reqs = upgrade.requirements || [];
                reqs.forEach(reqId => {
                    const parent = prestigeUpgrades.find(u => u.id === reqId);
                    if (parent) {
                        const line = document.createElementNS(svgNS, "line");
                        // Koordinaten berechnen (Mitte + Offset)
                        line.setAttribute("x1", centerX + parent.x);
                        line.setAttribute("y1", parent.y + 50);
                        line.setAttribute("x2", centerX + upgrade.x);
                        line.setAttribute("y2", upgrade.y + 50);

                        line.setAttribute("stroke", this.gameState.prestigeUpgradeStatus[parent.id] ? "#FFD700" : "#555");
                        line.setAttribute("stroke-width", "3");
                        svg.appendChild(line);
                    }
                });
            });

            // --- 2. NODES (KREISE) ZEICHNEN ---
            prestigeUpgrades.forEach(upgrade => {
                const node = document.createElement('div');
                node.className = 'prestige-node';

                // Positionierung
                node.style.left = `calc(50% + ${upgrade.x}px)`;
                node.style.top = `${upgrade.y + 50}px`;

                // Status prüfen
                const reqs = upgrade.requirements || [];
                const isPurchased = this.gameState.prestigeUpgradeStatus[upgrade.id];
                const requirementsMet = reqs.length === 0 || reqs.every(reqId => this.gameState.prestigeUpgradeStatus[reqId]);
                const canAfford = (this.gameState.prestigeCurrency || 0) >= upgrade.cost;

                // Klassen & Text setzen
                if (isPurchased) {
                    node.classList.add('purchased');
                    node.innerText = "✔";
                } else if (requirementsMet && canAfford) {
                    node.classList.add('available');
                    node.innerText = upgrade.id;
                } else if (requirementsMet && !canAfford) {
                    node.classList.add('locked');
                    node.innerText = upgrade.id;
                    node.style.borderColor = "#f44336"; // Rot für "zu teuer"
                } else {
                    node.classList.add('locked');
                    node.innerText = "?";
                }

                // Klick Event
                node.onclick = () => this.tryBuyPrestigeUpgrade(upgrade);

                // --- 🛠️ FIX: TOOLTIP DIREKT HIER BEFÜLLEN ---
                node.onmouseenter = () => {
                    const tooltip = document.getElementById('prestige-tooltip-modal');
                    if (tooltip) {
                        // HTML Inhalt bauen
                        let html = `<h4 style="margin:0 0 5px 0; color:#FFD700; border-bottom:1px solid #555; padding-bottom:5px;">${upgrade.name}</h4>`;
                        html += `<p style="margin:5px 0; font-size:0.9em;">${upgrade.description}</p>`;

                        if(isPurchased) {
                            html += `<p style="color:#4CAF50; font-weight:bold; margin-top:5px;">✅ Bereits gekauft</p>`;
                        } else {
                            const color = canAfford ? '#4CAF50' : '#f44336';
                            html += `<p style="color:#aaa; margin-top:5px;">Kosten: <span style="color:${color}; font-weight:bold;">${this.formatNumber(upgrade.cost)}</span> Punkte</p>`;
                        }

                        // Inhalt setzen & Anzeigen
                        tooltip.innerHTML = html;
                        tooltip.style.display = 'block';

                        // Positionieren (Rechts neben dem Node)
                        // Wir nutzen die Node-Position + einen festen Wert
                        const nodeRect = node.getBoundingClientRect();
                        const containerRect = container.getBoundingClientRect();

                        // Position relativ zum Container berechnen
                        let leftPos = (parseInt(node.style.left) || (container.offsetWidth / 2 + upgrade.x)) + 30;
                        let topPos = (parseInt(node.style.top) || (upgrade.y + 50)) - 10;

                        tooltip.style.left = leftPos + 'px';
                        tooltip.style.top = topPos + 'px';
                    }
                };

                node.onmouseleave = () => {
                    const tooltip = document.getElementById('prestige-tooltip-modal');
                    if (tooltip) tooltip.style.display = 'none';
                };

                container.appendChild(node);
            });
        }

   // =========================================================
       // PRESTIGE SKILL TREE (Angepasst für DEINE Datenstruktur)
       // =========================================================

       renderPrestigeTree() {
           const container = this.getById('prestige-tree-container');
           if (!container) return;

           container.innerHTML = ''; // Altes löschen

           // 1. Anzeige der verfügbaren Punkte aktualisieren
           const ptsDisplay = this.getById('prestige_punkte_verfügbar');
           // Fallback auf 0, falls undefined
           if(ptsDisplay) ptsDisplay.innerText = this.formatNumber(this.gameState.prestigeCurrency || 0);

           // CHECK: Nutzen wir deine Variable 'prestigeUpgrades'?
           if (typeof prestigeUpgrades === 'undefined') {
               container.innerHTML = '<div style="padding:20px; text-align:center; color:red;">Variable "prestigeUpgrades" fehlt in data.js!</div>';
               return;
           }

           // 2. SVG-Layer für Verbindungslinien
           const svgNS = "http://www.w3.org/2000/svg";
           const svg = document.createElementNS(svgNS, "svg");
           Object.assign(svg.style, {
               position: "absolute", width: "100%", height: "100%", top: "0", left: "0", pointerEvents: "none"
           });
           container.appendChild(svg);

           // ZENTRIERUNG: Deine Koordinaten sind z.B. x:0, y:0.
           // Wir verschieben den Startpunkt in die Mitte des Fensters.
           const centerX = container.offsetWidth / 2;
           const startY = 50; // Etwas Abstand von oben

           // 3. Nodes zeichnen
           prestigeUpgrades.forEach(upgrade => {
               // Check: Ist gekauft?
               const isBought = (this.gameState.prestigeUpgrades || []).includes(upgrade.id);

               // Check: Sind Voraussetzungen (Requirements) erfüllt?
               let requirementsMet = true;
               if (upgrade.requirements && upgrade.requirements.length > 0) {
                   // Jede ID im requirements-Array muss gekauft sein
                   requirementsMet = upgrade.requirements.every(reqId =>
                       (this.gameState.prestigeUpgrades || []).includes(reqId)
                   );
               }

               const canBuy = requirementsMet && (this.gameState.prestigeCurrency >= upgrade.cost);
               const isLocked = !requirementsMet;

               // Berechne echte Position im Fenster
               const drawX = centerX + upgrade.x;
               const drawY = startY + upgrade.y;

               // A. LINIEN ZU DEN ELTERN ZEICHNEN
               if (upgrade.requirements && upgrade.requirements.length > 0) {
                   upgrade.requirements.forEach(reqId => {
                       const parent = prestigeUpgrades.find(p => p.id === reqId);
                       if (parent) {
                           const parentX = centerX + parent.x;
                           const parentY = startY + parent.y;

                           const line = document.createElementNS(svgNS, "line");
                           // Offset +25, damit die Linie in der Mitte des Buttons (50px breit) startet
                           const offset = 25;

                           line.setAttribute("x1", parentX + offset);
                           line.setAttribute("y1", parentY + offset);
                           line.setAttribute("x2", drawX + offset);
                           line.setAttribute("y2", drawY + offset);

                           // Farbe: Gold wenn Parent gekauft, sonst Grau
                           const parentIsBought = (this.gameState.prestigeUpgrades || []).includes(parent.id);
                           line.setAttribute("stroke", parentIsBought ? "#ffd700" : "#555");
                           line.setAttribute("stroke-width", "4");
                           svg.appendChild(line);
                       }
                   });
               }

               // B. DEN BUTTON (NODE) ERSTELLEN
               const node = document.createElement('div');
               node.className = `prestige-node ${isBought ? 'bought' : (isLocked ? 'locked' : (canBuy ? 'available' : 'expensive'))}`;

               // Inline Styles für Position
               Object.assign(node.style, {
                   position: 'absolute',
                   left: drawX + 'px',
                   top: drawY + 'px',
                   width: '50px',
                   height: '50px',
                   borderRadius: '50%',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   cursor: isLocked ? 'not-allowed' : 'pointer',
                   border: '2px solid #fff',
                   zIndex: '10',
                   fontSize: '20px'
               });

               // Farben Logik
               if (isBought) {
                   node.style.backgroundColor = '#ffd700'; // Gold
                   node.style.borderColor = '#b8860b';
                   node.style.color = '#000';
               } else if (isLocked) {
                   node.style.backgroundColor = '#333'; // Grau
                   node.style.borderColor = '#555';
               } else if (canBuy) {
                   node.style.backgroundColor = '#009ffd'; // Blau
                   node.style.borderColor = '#fff';
               } else {
                   node.style.backgroundColor = '#8b0000'; // Rot (zu teuer)
               }

               // Icon bestimmen (Fallback falls undefined)
               let iconSymbol = '★';
               if (upgrade.type === 'unlock_pets') iconSymbol = '🐾';
               else if (upgrade.type === 'unlock_mine') iconSymbol = '💎';
               else if (upgrade.type === 'unlock_guilds') iconSymbol = '⚔️';
               else if (upgrade.type === 'click_mult') iconSymbol = '👆';
               else if (upgrade.type === 'sps_mult') iconSymbol = '⚡';

               node.innerHTML = `<span>${iconSymbol}</span>`;

               // Hover Events
               node.addEventListener('mouseenter', (e) => this.showPrestigeTooltip(e, upgrade, isBought, isLocked));
               node.addEventListener('mouseleave', () => this.hidePrestigeTooltip());

               // Klick Event
               if (!isBought && !isLocked) {
                   node.addEventListener('click', () => this.buyPrestigeUpgrade(upgrade.id));
               }

               container.appendChild(node);
           });
       }

       // Tooltip Anzeige
       showPrestigeTooltip(e, upgrade, isBought, isLocked) {
           const tooltip = this.getById('prestige-tooltip-modal');
           if (!tooltip) return;

           tooltip.style.display = 'block';
           // Positionierung etwas neben der Maus
           tooltip.style.left = (e.clientX + 20) + 'px';
           tooltip.style.top = (e.clientY + 20) + 'px';

           const statusText = isBought ? "✅ Gekauft" : (isLocked ? "🔒 Gesperrt (Voraussetzung fehlt!)" : "Klicken zum Kaufen");

           tooltip.innerHTML = `
               <h4 style="color:#ffd700; margin:0 0 5px 0;">${upgrade.name}</h4>
               <p style="font-size:0.9em; margin:0 0 5px 0;">${upgrade.description}</p>
               <p style="font-weight:bold;">Kosten: ${this.formatNumber(upgrade.cost)} Prestige-Punkte</p>
               <small style="color:${isBought?'#4CAF50':(isLocked?'#f44336':'#ccc')}">${statusText}</small>
           `;
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

                // Fall 1: Gilde noch nicht gegründet
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

                // Fall 2: Gilde existiert -> TAB Navigation zeigen
                let contentHtml = '';

                if (this.guildView === 'shop') {
                    // --- SHOP LOGIK ---
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
                    // --- BOSS ARENA ---
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
                    // --- QUESTS TAB ---
                    this.generateGuildQuests();

                    let activeHtml = '';
                    const activeQuests = this.gameState.guildActiveQuests || [];

                    // 🛑 HIER IST DIE SPERRE AUF 3 GESETZT 🛑
                    const isQuestLimitReached = activeQuests.length >= 3;

                    if (activeQuests.length > 0) {
                        // Anzeige aktualisiert: Zeigt jetzt x / 3 an
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

                        // 🛑 BUTTON LOGIK 🛑
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

                // HTML zusammenbauen
                container.innerHTML = `
                    <div style="display:flex; gap:10px; margin-bottom:20px; border-bottom:1px solid #444; padding-bottom:15px;">
                        <button id="tab-guild-shop" class="btn-primary ${this.guildView==='shop'?'':'btn-cancel'}" style="flex:1">Mitglieder</button>
                        <button id="tab-guild-boss" class="btn-primary ${this.guildView==='boss'?'':'btn-cancel'}" style="flex:1">Boss Raid</button>
                        <button id="tab-guild-quests" class="btn-primary ${this.guildView==='quests'?'':'btn-cancel'}" style="flex:1">Quests</button>
                    </div>
                    <h3>Gilde: ${this.gameState.guildName}</h3>
                    ${contentHtml}
                `;

                // Event Listeners
                this.getById('tab-guild-shop')?.addEventListener('click', () => { this.guildView='shop'; this.renderGuildsContent(); });
                this.getById('tab-guild-boss')?.addEventListener('click', () => { this.guildView='boss'; this.renderGuildsContent(); });
                this.getById('tab-guild-quests')?.addEventListener('click', () => { this.guildView='quests'; this.renderGuildsContent(); });

                // Buttons binden
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
                         bossClicker.addEventListener('mousedown', () => {
                             bossClicker.style.transform = "scale(0.9)";
                             this.clickGuildBoss();
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

            if (isInfo) this.updatePrestigeInfoTree();
        });
    }

    // ================================================================================================================
    // 9. EVENT LISTENERS
    // ================================================================================================================

    setupMainEventListeners() {
        // Wir geben 'e' (das Event) weiter!
        this.getById('smiley_button')?.addEventListener('click', (e) => this.klickeSmiley(e));
        this.getById('building-grid')?.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-buy');
            if (!button) return;
            const buildingItem = button.closest('.building-item');
            if (!buildingItem) return;
            const index = parseInt(buildingItem.dataset.index, 10);
            const amount = parseInt(button.dataset.amount, 10);
            if (!isNaN(index) && !isNaN(amount)) this.kaufeMehrereGebaeude(index, amount);
        });

        this.getById('global-upgrades-container')?.addEventListener('click', (e) => {
            // 1. Suche den Button (auch wenn man auf das Icon/Text im Button klickt)
            const button = e.target.closest('.btn-buy-research');
            if (!button) return;

            // 2. Daten auslesen
            const id = parseInt(button.dataset.id, 10);
            const amount = parseInt(button.dataset.amount, 10);

            // 3. Debugging (Drück F12, falls es immer noch nicht geht)
            console.log(`Klick erkannt! ID: ${id}, Menge: ${amount}`);

            // 4. Kauf auslösen
            if (!isNaN(id) && !isNaN(amount) && amount > 0) {
                this.kaufeGlobalUpgrade(id, amount);
            } else {
                console.error("Fehler: Ungültige ID oder Menge beim Kauf.");
            }
        });

        this.getById('pet-shop-grid')?.addEventListener('click', (e) => {
                const button = e.target.closest('button');
                if (!button) return;
                const petId = button.dataset.id;

                if (button.classList.contains('btn-buy-pet')) { // Prüft auf Level Up Button (Klasse von renderPetShop)
                    this.levelUpPet(petId); // Level Up Logik
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
                    // Wenn es läuft, zählen wir die Klicks für den Bonus!
                    this.currentMinigameClicks = (this.currentMinigameClicks || 0) + 1;

                    // Kleiner visueller Effekt beim Klicken
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

        // NEU: Gilden Modal Steuerung (Prio 8/9)
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
                this.renderSkillTree();
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
            this.renderSkillTree(); // WICHTIG: Baum neu zeichnen!
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
            this.updatePrestigeInfoTree();
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

updatePrestigeInfoTree() {
    const treeContainer = this.getById('info_prestige_container');
    if (!treeContainer) return;

    prestigeUpgrades.forEach(upgrade => {
        const node = treeContainer.querySelector(`.prestige-node[data-id="${upgrade.id}"]`);
        if (!node) return;
        const isPurchased = this.gameState.prestigeUpgradeStatus[upgrade.id];

        node.classList.toggle('purchased', isPurchased);

        const requirementsMet = upgrade.requirements.every(reqId => this.gameState.prestigeUpgradeStatus[reqId]);
        const svg = this.getById('prestige-lines-info');
        if (svg) {
            svg.querySelectorAll('line').forEach(line => {
                const fromId = parseInt(line.dataset.from, 10);
                const isFromPurchased = this.gameState.prestigeUpgradeStatus[fromId];
                line.classList.toggle('active', isFromPurchased);
            });
        }
    });
}

createInfoStatsElements() {
    const container = this.getById('info_stats_container');
    if (!container) return;
    container.innerHTML = '';

    container.innerHTML = `
        <div class="info-upgrade-item">
            <h3>Smileys pro Sekunde (SPS)</h3>
            <p>Dies ist der wichtigste Wert im Spiel. Er gibt an, wie viele Smileys deine Gebäude automatisch pro Sekunde für dich generieren.</p>
        </div>
        <div class="info-upgrade-item">
            <h3>Smiley pro Klick (SPC)</h3>
            <p>Gibt an, wie viele Smileys du mit einem einzigen, manuellen Klick auf den großen Smiley erhältst. Dieser Wert wird durch Klick-Upgrades und bestimmte Prestige-Boni erhöht.</p>
        </div>
        <div class="info-upgrade-item">
            <h3>Klick-Multiplikator</h3>
            <p>Ein Bonus, der direkt deine "Smiley pro Klick" erhöht. Du kannst ihn durch Forschung und Prestige-Upgrades steigern.</p>
        </div>
        <div class="info-upgrade-item">
            <h3>Globaler Multiplikator</h3>
            <p>Dies ist der mächtigste Bonus im Spiel. Er wird durch deine gesammelten Prestige-Punkte und bestimmte Prestige-Upgrades berechnet und erhöht deine gesamte Smiley-Produktion (SPS) drastisch.</p>
        </div>
    `;
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
            case 'click_mult':
                bonusText = `Erhöht die Klick-Stärke um ${(currentBonusValue * 100).toFixed(1)}% (Global)`;
                icon = '🖱️';
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

            // Nutze Sicherheits-Checks, falls Elemente nicht gefunden werden
            if (prestigeAvailable) prestigeAvailable.innerText = this.formatNumber(this.gameState.prestigeCurrency || 0);
            if (prestigeTotal) prestigeTotal.innerText = this.formatNumber(this.gameState.gesamt_prestige_punkte || 0);
            if (currentSmileys) currentSmileys.innerText = this.formatNumber(this.gameState.lifetime_smileys || 0);
            if (multiDisplay) multiDisplay.innerText = `x${this.gameState.globalerPrestigeMultiplikator.toFixed(2)}`;

            // Berechnung für den nächsten Punkt
            const totalPotentialPoints = this.calculatePrestigeGain();
            const nextLevel = totalPotentialPoints + 1;
            const nextPointRequirement = Math.pow(nextLevel, 3) * 1000000;
            if (nextPoint) nextPoint.innerText = this.formatNumber(nextPointRequirement);

            // Reset Button auf der Seite verknüpfen
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

        createInfoStatsElements() {
            const c = this.getById('info_stats_container'); if(!c) return;
            c.innerHTML = `
                <div class="info-upgrade-item"><h4>Total Klicks</h4><p>${this.formatNumber(this.gameState.totalClicksLifetime)}</p></div>
                <div class="info-upgrade-item"><h4>Lifetime Smileys</h4><p>${this.formatNumber(this.gameState.lifetime_smileys)}</p></div>
                <div class="info-upgrade-item"><h4>Resets</h4><p>${this.gameState.prestigeResets}</p></div>
            `;
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
            const bind = (btnId, modalId, fn) => {
                const btn = this.getById(btnId);
                if(btn) btn.onclick = () => {
                    this.getById(modalId).style.display='flex';
                    if(fn) fn.call(this);
                };
                const closeBtn = this.getById(modalId)?.querySelector('.btn-cancel');
                if(closeBtn) closeBtn.onclick = () => this.getById(modalId).style.display='none';
            };

            bind('show_buildings_button', 'buildings_info_modal', this.createBuildingInfoElements);
            bind('show_global_upgrades_button', 'global_upgrades_info_modal', this.createInfoGlobalUpgradeElements);
            bind('show_pets_button', 'pets_info_modal', this.createInfoPetsElements);
            bind('show_stats_button', 'stats_info_modal', this.createInfoStatsElements);
            bind('show_achievements_button', 'achievements_info_modal', this.createInfoAchievementElements);
            bind('show_prestige_button', 'prestige_info_modal', this.updatePrestigeInfoTree);
        }
        }