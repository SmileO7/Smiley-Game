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
            gesammelte_smileys: 0,
         // forschungPunkte: 0,
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

            researchStatus: globalUpgrades.map(() => false), // <--- JETZT KORREKT HINZUFÜGEN!
            prestigeUpgradeStatus: prestigeUpgrades.map(() => false),

            petLevels: {}, // NEU BEHALTEN
            activePet: null,

            // --- Laufzeit-Statistiken & Boni ---
            totalSPS: 0,
            globalSPSMultiplier: 1,
            prestigePointMultiplier: 0.01,
            prestigeResetBonus: 0,

            // --- Feature-States (Freischaltung) ---
            petsUnlocked: false,
            diamondShopPurchases: [],
            diamondMineUnlocked: false, // Prio 6
            guildsUnlocked: false,      // Prio 8
            petAutoClickTimer: 0,

            // --- GILDEN ZUSTAND (Prio 9) ---
            guildName: null,
            guildUpgradeStatus: guildUpgradesData.map(() => false),
            guildSPSMultiplier: 0,

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
        this.ladeSpiel();

        this.createBuildingElements();
        this.renderPetShop();
        this.createPrestigeUpgradeElements();

        this.updateGlobalUpgradeUI();

        this.updatePrestigeUI();

        this.ladeAudioEinstellungen();
        const musicPlayer = this.getById('backgroudn-music');
        if (musicPlayer) {
            musicPlayer.play().catch(e => {
                console.log("Hintergrundmusik wartet auf Benutzerinteraktion(Error:", e, ").");
            });
        }

        this.setupMainEventListeners();
        this.setupPrestigeEventListeners();
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
        // 1. SMILEY-PRODUKTION
        const baseSPS = this.getSmileysPerSecond();
        const actualSPS = baseSPS * this.gameState.globalerPrestigeMultiplikator;

        if (actualSPS > 0) {
            this.gameState.aktuelle_smileys += actualSPS;
            this.gameState.gesammelte_smileys += actualSPS;
        }

        // 2. DIAMANTEN-PRODUKTION (DPS)
        const MINE_INDEX = DIAMOND_MINE_INDEX;
                // Bedingung: Prüft auf Unlock UND Minen-Count > 0
                if (this.gameState.autoDiamondMineUnlocked && this.gameState.buildingCounts[MINE_INDEX] > 0) {
                    const mine = uniqueBuildingsData.find(u => u.id === 'diamond_mine');
                    if (mine) {
                        // Logik: Fügt 10% der Basis-DPS hinzu
                        const autoDiamondRate = mine.baseDPS * mine.diamondMultiplier * 0.1;
                        this.gameState.diamanten += autoDiamondRate;
                    }
                }
            this.updateUI();
        }

    computeTotalSPS() {
        let baseSPS = this.getSmileysPerSecond();

        const prestigeBonus = 1 + (this.gameState.gesamt_prestige_punkte * this.gameState.prestigePointMultiplier);
        const resetBonus = 1 + (this.gameState.prestigeResets * this.gameState.prestigeResetBonus);

        // Finaler Multiplikator: Prestige * Reset * Global Upgrades * Gilden Bonus
        this.gameState.globalerPrestigeMultiplikator = prestigeBonus * resetBonus * this.gameState.globalSPSMultiplier * (1 + this.gameState.guildSPSMultiplier);

        this.gameState.totalSPS = baseSPS * this.gameState.globalerPrestigeMultiplikator;

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
    calculateUpgradeCost(baseCost) {
        let costReduction = 0;

        // 1. Pet Cost Reduction (Upgrade-Pet)
        // Wir verwenden this.gameState.activePet, da nur das aktive Pet zählt.
        const activePetIndex = petsData.findIndex(pet => pet.effectType === 'cost_reduction_upgrades' && this.gameState.activePet === pet.id);
        if (activePetIndex !== -1) {
            const pet = petsData[activePetIndex];
            const petLevel = this.gameState.petLevels[activePetIndex];
            const petStats = this.calculatePetStat(pet, petLevel);
            costReduction += petStats.currentEffect;
        }

        if (costReduction > 0) {
            return Math.floor(baseCost * (1 - costReduction));
        }
        return baseCost;
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

        this.gameState.guildUpgradeStatus.forEach((bought, id) => {
                    if (bought) {
                        // KORREKTUR: Nutze den neuen Namen guildUpgradesData
                        const upgrade = guildUpgradesData.find(u => u.id === id);
                        if (upgrade) {
                            if (upgrade.isClickMultiplier) {
                                // NEU: Füge Klick-Multiplikatoren hinzu
                                prestigeClickMultiplier += upgrade.spsMultiplier - 1;
                            } else {
                                // SPS Multiplikatoren
                                this.gameState.guildSPSMultiplier += upgrade.spsMultiplier - 1;
                            }
                        }
                    }
                });

        // 5. Finalisierung
        this.gameState.klickKraftMultiplier = baseClickMultiplier + prestigeClickMultiplier;
        const prestigeBonus = 1 + (this.gameState.gesamt_prestige_punkte * this.gameState.prestigePointMultiplier);
        const resetBonus = 1 + (this.gameState.prestigeResets * this.gameState.prestigeResetBonus);

        this.gameState.globalerPrestigeMultiplikator = prestigeBonus * resetBonus * this.gameState.globalSPSMultiplier * (1 + this.gameState.guildSPSMultiplier);
    }



    // ================================================================================================================
    // 3. KERNLOGIK (Kauf & Reset)
    // ================================================================================================================

    klickeSmiley() {
        // 1. Klickkraft berechnen
        const actualClickPower = this.gameState.klickKraft * this.gameState.klickKraftMultiplier;

        // 2. Smileys erhöhen
        this.gameState.aktuelle_smileys += actualClickPower;
        this.gameState.gesammelte_smileys += actualClickPower;

        // Keine Klick-Feedback- oder Debug-Logik mehr.

        this.updateUI();
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

        return multiplier;
    }

   // --- Ersetze die ganze kaufeGlobalUpgrade Funktion ---

   kaufeGlobalUpgrade(id, amount = 1) {
       let purchasedCount = 0;

       // Wir merken uns die Gruppe des ersten Upgrades, damit wir nicht aus Versehen
       // Upgrades eines anderen Gebäudes mitkaufen.
       const startUpgrade = globalUpgrades.find(u => u.id === id);
       if (!startUpgrade) return;
       const targetBuildingIndex = startUpgrade.buildingIndex;

       for (let i = 0; i < amount; i++) {
           // Prüfe das nächste Upgrade in der Reihe
           const nextId = id + i;
           const upgrade = globalUpgrades.find(u => u.id === nextId);

           // Abbruch-Bedingungen:
           // 1. Upgrade existiert nicht
           // 2. Upgrade gehört zu einem anderen Gebäude/Gruppe
           // 3. Upgrade ist schon gekauft
           if (!upgrade) break;
           if (upgrade.buildingIndex !== targetBuildingIndex) break;
           if (this.gameState.researchStatus[upgrade.id]) continue; // Überspringen, falls schon gekauft (Sicherheit)

           const finalCost = this.calculateUpgradeCost(upgrade.cost);

           if (this.gameState.aktuelle_smileys >= finalCost) {
               this.gameState.aktuelle_smileys -= finalCost;
               this.gameState.researchStatus[upgrade.id] = true;
               purchasedCount++;
           } else {
               break; // Nicht mehr genug Geld für das nächste in der Liste
           }
       }

       if (purchasedCount > 0) {
           this.applyAllBoni();
           this.updateGlobalUpgradeUI(); // UI sofort aktualisieren
           this.updateUI();
           this.speichereSpiel();
           return true;
       }
       return false;
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
        const BONUS_DIAMOND = 5 * mineCount; // Bonus skaliert mit der Mine
        const DURATION = 5000;

        if (this.gameState.diamondMinigameRunning || mineCount === 0) return;

        this.gameState.diamondMinigameRunning = true;
        this.updateUI(); // UI aktualisieren, um Button zu sperren

        const progressBar = this.getById('minigame-bar');
        const resultText = this.getById('minigame-result');

        if (resultText) resultText.innerText = 'Schürfe läuft...';

        // Animation der Progress Bar starten
        if (progressBar) {
            // Setze den Übergang für die Dauer
            progressBar.style.transition = `width ${DURATION}ms linear`;
            // Starte die Animation von 100% auf 0%
            progressBar.style.width = '0%';
        }

        this.gameState.diamondMinigameTimer = setTimeout(() => {

            this.gameState.diamanten += BONUS_DIAMOND;
            this.gameState.diamondMinigameRunning = false;

            if (resultText) resultText.innerText = `Erfolgreich! +${BONUS_DIAMOND} Diamanten erhalten.`;

            // Reset Progress Bar für den nächsten Start
            if (progressBar) {
                 progressBar.style.transition = `width 0s`;
                 progressBar.style.width = '100%';
            }

            this.updateUI();
            this.speichereSpiel();

            console.log(`[Minigame] Abgeschlossen. +${BONUS_DIAMOND} Diamanten.`);

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
        const upgrade = guildUpgradesData.find(u => u.id === id);
        if (!upgrade || this.gameState.guildUpgradeStatus[id]) return;

        if (!this.gameState.guildName) {
        console.warn("Gilde muss zuerst gegründet werden.");
        return;
    }

    // Prüfe gegen Smileys (da Währungssystem später kommt)
        if (this.gameState.aktuelle_smileys < upgrade.cost) { // <<< HIER GEPRÜFT
        console.warn("Nicht genug Smileys für dieses Gilden-Upgrade.");
        return;
    }

        this.gameState.aktuelle_smileys -= upgrade.cost; // <<< HIER ABGEZOGEN
        this.gameState.guildUpgradeStatus[id] = true;

        this.applyAllBoni();
        this.updateUI();
        this.speichereSpiel();
        this.renderGuildsContent();
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
                // -------------------------------------------------------------
            }

            this.updateBuildingUI();
            this.updatePetButtons();
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

        // Ausschnitt aus SmileyGame.js (Abschnitt 7. RENDERING & UI-UPDATES)

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
        if (!this.getById('prestige_punkte_verfügbar')) return;

        const prestigePointThreshold = 1000000;
        const totalPotentialPoints = Math.floor(Math.pow(this.gameState.gesammelte_smileys / prestigePointThreshold, 1 / 3));
        const pointsToGain = Math.max(0, totalPotentialPoints - this.gameState.gesamt_prestige_punkte);

        const nextPointRequirement = Math.pow(this.gameState.gesamt_prestige_punkte + pointsToGain + 1, 3) * prestigePointThreshold;

        this.getById('prestige_punkte_verfügbar').innerText = this.formatNumber(this.gameState.prestige_punkte_verfügbar);
        this.getById('gesamt_prestige_punkte').innerText = this.formatNumber(this.gameState.gesamt_prestige_punkte);
        this.getById('aktuelle_smileys_prestige').innerText = this.formatNumber(this.gameState.gesammelte_smileys);
        this.getById('next_prestige_point').innerText = this.formatNumber(nextPointRequirement);

        const globalMultiDisplay = this.getById('globaler_multiplikator_anzeige_prestige');
        if (globalMultiDisplay) {
            globalMultiDisplay.innerText = `x${this.gameState.globalerPrestigeMultiplikator.toFixed(2)}`;
        }


        const prestigeButton = this.getById('prestige_reset_button');
        if (prestigeButton) {
            prestigeButton.disabled = pointsToGain <= 0;
            prestigeButton.innerText = `Prestige Reset (${pointsToGain} Punkte)`;
        }
        const pointsToGainElement = this.getById('prestige_points_to_gain');
        if (pointsToGainElement) {
            pointsToGainElement.innerText = pointsToGain;
        }

        if (this.getById('prestige-tree-container')) {
            prestigeUpgrades.forEach(upgrade => {
                const node = document.querySelector(`.prestige-node[data-id="${upgrade.id}"]`);
                if (!node) return;

                const requirementsMet = upgrade.requirements.every(reqId => this.gameState.prestigeUpgradeStatus[reqId]);
                const canAfford = this.gameState.prestige_punkte_verfügbar >= upgrade.cost;
                const isPurchased = this.gameState.prestigeUpgradeStatus[upgrade.id];

                node.classList.remove('purchased', 'available', 'locked');

                if (isPurchased) {
                    node.classList.add('purchased');
                } else if (requirementsMet && canAfford) {
                    node.classList.add('available');
                } else {
                    node.classList.add('locked');
                }
            });
        }
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

    // Ausschnitt aus SmileyGame.js (Abschnitt 8. CONTENT RENDERING)

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

            // Stellt sicher, dass das Modal den Shop/Mine-Titel trägt
            const modalTitle = container.closest('.modal-content').querySelector('h2');
            if (modalTitle) modalTitle.innerHTML = `💎 Diamanten-Mine & Shop`;

            const MINE_INDEX = DIAMOND_MINE_INDEX;
            const mineDefinition = uniqueBuildingsData.find(u => u.id === 'diamond_mine');
            if (!mineDefinition) return;
            const mineCount = this.gameState.buildingCounts[MINE_INDEX] || 0;

            // Wenn Mine nicht gekauft: Nur Kauf-Ansicht zeigen
            if (mineCount === 0) {
                const mineCost = this.getBuildingCost(MINE_INDEX, 0);
                const canAfford = this.gameState.aktuelle_smileys >= mineCost;

                container.innerHTML = `
                    <h3>Schalte die ${mineDefinition.name} frei</h3>
                    <p>Die Mine wird benötigt, um Diamanten zu sammeln und den Shop freizuschalten.</p>
                    <p>Kosten: ${this.formatNumber(mineCost)} Smileys</p>
                    <button id="buy-diamond-mine-button" class="btn-buy" data-index="${MINE_INDEX}" ${canAfford ? '' : 'disabled'}>
                        Mine Kaufen
                    </button>
                `;
                return;
            }

            // --- HAUPTANSICHT: TAB-NAVIGATION ---
            container.innerHTML = `
                <div class="mine-nav" style="margin-bottom: 20px;">
                    <button id="mine-tab-mine" class="btn-primary ${this.diamondMineView === 'mine' ? 'active' : 'btn-cancel'}">Minispiel</button>
                    <button id="mine-tab-shop" class="btn-primary ${this.diamondMineView === 'shop' ? 'active' : 'btn-cancel'}">Diamanten Shop</button>
                </div>
                <div id="mine-dynamic-content"></div>
                <p style="text-align: center; margin-top: 10px;">Deine Diamanten: <strong id="shop-diamanten-anzeige">${this.formatNumber(this.gameState.diamanten)}</strong> 💎</p>
            `;

            // Event Listener für Tab-Wechsel
            this.getById('mine-tab-mine')?.addEventListener('click', () => {
                this.diamondMineView = 'mine';
                this.renderDiamondMineContent();
            });
            this.getById('mine-tab-shop')?.addEventListener('click', () => {
                this.diamondMineView = 'shop';
                this.renderDiamondMineContent();
            });

            // Rendere den Inhalt basierend auf dem aktiven Tab
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
                const DURATION = 5000; // 5 Sekunden

                // --- Dynamischen Bonus berechnen ---
                let BONUS_DIAMOND = 5 * mineCount;

                // BONUS durch Prestige/Pets
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
                // --------------------------------------------------------------------------

                container.innerHTML = `
                    <h3>Minispiel: Aktive Schürfung</h3>
                    <p>Ertrag pro erfolgreicher Schürfung: <strong>${BONUS_DIAMOND} 💎</strong></p>

                    <div class="minigame-progress-container">
                        <div id="minigame-bar" class="progress-bar" style="width: 100%; transition: width 0s;"></div>
                    </div>
                    <p id="minigame-result" class="info-section">Bereit zum Starten.</p>

                    <button id="start-minigame-button" class="btn-confirm" ${this.gameState.diamondMinigameRunning ? 'disabled' : ''}>
                        ${this.gameState.diamondMinigameRunning ? 'Schürfe läuft...' : 'Schürfen starten!'}
                    </button>
                `;

                // Event Listener für Start Button
                this.getById('start-minigame-button')?.addEventListener('click', () => {
                    this.startDiamondMinigame();
                });

                // Bar-Zustand beim Neu-Rendern (falls Minigame gerade läuft)
                if (this.gameState.diamondMinigameRunning) {
                    const progressBar = this.getById('minigame-bar');
                    if (progressBar) {
                         // Setzt die Bar optisch auf den laufenden Zustand zurück (wird durch startDiamondMinigame neu animiert)
                        progressBar.style.width = '100%';
                        this.getById('minigame-result').innerText = 'Schürfe läuft...';
                    }
                }
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

    renderGuildsContent() {
            const container = this.getById('guilds-content');
            if (!container) return;

            if (!this.gameState.guildName) {
                // --- GRÜNDUNGS-ANSICHT (Kostet Smileys) ---
                const COST = 500000000;
                const canAfford = this.gameState.aktuelle_smileys >= COST;

                container.innerHTML = `
                    <h3>Gilde Gründen</h3>
                    <p>Gründe Deine eigene Gilde, um dauerhafte globale Boni freizuschalten.</p>
                    <p><strong>Kosten:</strong> ${this.formatNumber(COST)} Smileys</p>
                    <input type="text" id="guild-name-input" placeholder="Gildenname eingeben" maxlength="20">
                    <button id="found-guild-button" class="btn-confirm" ${canAfford ? '' : 'disabled'}>
                        Gilde Gründen
                    </button>
                    <p id="guild-error" style="color: red; margin-top: 10px;"></p>
                `;

                this.getById('found-guild-button')?.addEventListener('click', () => {
                    const nameInput = this.getById('guild-name-input');
                    const name = nameInput ? nameInput.value.trim() : '';
                    if (name.length < 3) {
                        this.getById('guild-error').innerText = "Gildenname muss mindestens 3 Zeichen lang sein.";
                        return;
                    }
                    this.foundGuild(name);
                });

            } else {
                // --- UPGRADE-ANSICHT: ZEIGT UPGRADES ---
                let upgradesHtml = '';
                let clickBonus = 0;
                let spsBonus = 0;

                // NEU: Iteriere über die korrekten Daten
                guildUpgradesData.forEach((upgrade, index) => {
                    const isBought = this.gameState.guildUpgradeStatus[index];

                    // Berechne den Gesamtkosten-Multiplikator für skalierende Upgrades (falls wir sie später skalieren wollten)
                    const costMultiplier = upgrade.costMultiplier || 1.0;
                    // Für diese Prio verwenden wir nur die Basis-Kosten (baseCost)
                    const cost = upgrade.baseCost;

                    const canAfford = this.gameState.aktuelle_smileys >= cost;

                    const icon = upgrade.isClickMultiplier ? '🖱️' : '🏭';
                    const effectText = upgrade.isClickMultiplier ?
                                       `Klickkraft x${upgrade.spsMultiplier.toFixed(1)}` :
                                       `SPS x${upgrade.spsMultiplier.toFixed(1)}`;

                    if (isBought) {
                        if (upgrade.isClickMultiplier) {
                            clickBonus += upgrade.spsMultiplier - 1;
                        } else {
                            spsBonus += upgrade.spsMultiplier - 1;
                        }
                    }

                    upgradesHtml += `
                        <div class="guild-upgrade-item ${isBought ? 'purchased' : (canAfford ? 'available' : 'locked')}" data-id="${upgrade.id}">
                            <h4>${icon} ${upgrade.name}</h4>
                            <p>Effekt: <strong>${effectText}</strong></p>
                            <p>Kosten: ${this.formatNumber(cost)} Smileys</p>
                            <button class="btn-buy-guild" data-id="${upgrade.id}" ${isBought || !canAfford ? 'disabled' : ''}>
                                ${isBought ? 'Gekauft' : 'Kaufen'}
                            </button>
                        </div>
                    `;
                });

                container.innerHTML = `
                    <h3>Willkommen in Gilde: ${this.gameState.guildName}</h3>
                    <p>Globaler SPS-Gildenbonus: x${(1 + spsBonus).toFixed(2)}</p>
                    <p>Globaler Klick-Gildenbonus: x${(1 + clickBonus).toFixed(2)}</p>
                    <p>Guthaben: ${this.formatNumber(this.gameState.aktuelle_smileys)} Smileys</p>
                    <div class="info-grid">
                        ${upgradesHtml}
                    </div>
                `;

                container.querySelectorAll('.btn-buy-guild').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const id = parseInt(e.target.dataset.id, 10);
                        this.buyGuildUpgrade(id);
                    });
                });
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
        this.getById('smiley_button')?.addEventListener('click', () => this.klickeSmiley());

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

            if (startButton && !this.gameState.diamondMinigameRunning) {
                this.startDiamondMinigame();
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
        const prestigeModal = this.getById('prestige_confirm_modal');
        const openPrestigeModalButton = this.getById('prestige_reset_button');
        const closePrestigeModalButton = this.getById('cancel_prestige_button');
        const confirmPrestigeButton = this.getById('confirm_prestige_button');

        openPrestigeModalButton?.addEventListener('click', () => {
            this.updatePrestigeUI();
            const totalPotentialPoints = Math.floor(Math.pow(this.gameState.gesammelte_smileys / 1000000, 1 / 3));
            const pointsToGain = Math.max(0, totalPotentialPoints - this.gameState.gesamt_prestige_punkte);
            if (pointsToGain > 0) {
                prestigeModal.style.display = 'flex';
            }
        });

        closePrestigeModalButton?.addEventListener('click', () => {
            prestigeModal.style.display = 'none';
        });
        confirmPrestigeButton?.addEventListener('click', () => {
            this.prestigeReset();
            prestigeModal.style.display = 'none';
        });

        const skillTreeModal = this.getById('skill_tree_modal');
        const openSkillTreeButton = this.getById('open_skill_tree_button');
        const closeSkillTreeButton = this.getById('close_skill_tree_button');

        openSkillTreeButton?.addEventListener('click', () => {
            this.createPrestigeUpgradeElements();
            this.updatePrestigeUI();
            skillTreeModal.style.display = 'flex';
        });
        closeSkillTreeButton?.addEventListener('click', () => {
            skillTreeModal.style.display = 'none';
        });

        const prestigeTreeContainer = this.getById('prestige-tree-container');
        const tooltip = this.getById('prestige-tooltip-modal');

        prestigeTreeContainer?.addEventListener('click', (e) => {
            const node = e.target.closest('.prestige-node');
            if (!node) return;
            const id = parseInt(node.dataset.id, 10);
            if (!isNaN(id)) this.kaufePrestigeUpgrade(id);
        });

        if (prestigeTreeContainer && tooltip) {

            prestigeTreeContainer.addEventListener('mouseover', (e) => {
                const node = e.target.closest('.prestige-node');
                if (!node || node.dataset.id === undefined) return;
                this.zeigePrestigeDetails(node, true);
            });

            prestigeTreeContainer.addEventListener('mouseout', (e) => {
                const node = e.target.closest('.prestige-node');
                if (!node) return;
                tooltip.style.display = 'none';
            });
        }


        const resetPrestigeUpgradesButton = this.getById('reset_prestige_upgrades_button');
        resetPrestigeUpgradesButton?.addEventListener('click', () => {
            if (confirm("Möchtest du wirklich alle investierten Prestige-Punkte zurücksetzen? Dieser Schritt kann nicht rückgängig gemacht werden.")) {
                this.resetPrestigeUpgrades();
            }
        });
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
}