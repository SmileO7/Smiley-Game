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

            researchStatus: researchUpgrades.map(() => false), // <--- JETZT KORREKT HINZUFÜGEN!
            prestigeUpgradeStatus: prestigeUpgrades.map(() => false),

            petLevels: petsData.map(() => 0), // NEU BEHALTEN
            activePet: null,

            // --- Laufzeit-Statistiken & Boni ---
            totalSPS: 0,
            globalSPSMultiplier: 1,
            prestigePointMultiplier: 0.01,
            prestigeResetBonus: 0,

            // --- Feature-States (Freischaltung) ---
            petsUnlocked: false,
            diamondMineUnlocked: false, // Prio 6
            guildsUnlocked: false,      // Prio 8
            petAutoClickTimer: 0,

            // --- GILDEN ZUSTAND (Prio 9) ---
            guildName: null,
            guildUpgradeStatus: guildUpgrades.map(() => false),
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
        if (this.gameState.buildingCounts[MINE_INDEX] > 0) {
            const mine = uniqueBuildingsData.find(u => u.id === 'diamond_mine');
            if (mine) {
                const diamondRate = mine.baseDPS * mine.diamondMultiplier;
                this.gameState.diamanten += diamondRate;
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
                    const petIndex = petsData.findIndex(p => p.id === this.gameState.activePet);
                    const pet = petsData[petIndex];

                    // WICHTIG: Hole den skalierten Effekt basierend auf dem aktuellen Level
                    const currentLevel = this.gameState.petLevels[petIndex];

                    // Wenn das Pet noch Level 0 ist (kann bei geladenen alten Spielständen passieren), überspringen wir.
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
                            // cost_reduction_buildings und cost_reduction_upgrades werden in calculateNextCost/calculateUpgradeCost behandelt.
                        }
                    }
                }

        this.gameState.guildUpgradeStatus.forEach((bought, id) => {
            if (bought) {
                const upgrade = guildUpgrades.find(u => u.id === id);
                if (upgrade && upgrade.effectType === 'global_sps_mult') {
                    this.gameState.guildSPSMultiplier += upgrade.effect;
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
        const smileysGeklickt = this.gameState.klickKraft * this.gameState.klickKraftMultiplier;
        this.gameState.aktuelle_smileys += smileysGeklickt;
        this.gameState.gesammelte_smileys += smileysGeklickt;

        const baseClick = this.gameState.klickKraft;
        const totalMulti = this.gameState.klickKraftMultiplier;

        console.log(`[KLICK] Basis: ${baseClick} | Multiplikator: x${totalMulti.toFixed(2)} | Gewinn: ${this.formatNumber(smileysGeklickt)}`);

        const clickSound = this.getById('click-sound');
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(e => {
                const musicPlayer = this.getById('background-music');
                if (musicPlayer) musicPlayer.play().catch(() => {});
            });
        }

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
            totalCost += this.calculateNextCost(item.basePrice, this.gameState.buildingCounts[index] + i, item.growthRate, index);
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

    // ================================================================================================================
    // 4. PETS LOGIK
    // ================================================================================================================

    levelUpPet(petId) {
        if (!this.gameState.petsUnlocked) {
            console.warn("Pet-System nicht freigeschaltet.");
            return;
        }
        const petIndex = petsData.findIndex(p => p.id === petId);
        const pet = petsData[petIndex];
        const currentLevel = this.gameState.petLevels[petIndex];
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
        this.gameState.petLevels[petIndex] = currentLevel + 1;

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
        if (this.gameState.petLevels[petIndex] <= 0) {
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
        const upgrade = guildUpgrades.find(u => u.id === id);
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
        }

        this.updateBuildingUI();
        this.updatePetButtons();
        this.updateDiamondMineStatus();
        this.updateGuildsButton(); // NEU HINZUGEFÜGT

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

    updateBuildingUI() {
        buildingsData.forEach((building, index) => {
            const cost1x = this.calculateNextCost(building.basePrice, this.gameState.buildingCounts[index], building.growthRate, index);

            let cost10x = 0;
            for (let i = 0; i < 10; i++) cost10x += this.calculateNextCost(building.basePrice, this.gameState.buildingCounts[index] + i, building.growthRate, index);
            let cost100x = 0;
            for (let i = 0; i < 100; i++) cost100x += this.calculateNextCost(building.basePrice, this.gameState.buildingCounts[index] + i, building.growthRate, index);

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
            petsData.forEach((pet, index) => {
                const petDiv = petGrid.querySelector(`.pet-item[data-id="${pet.id}"]`);
                if (!petDiv) return;

                const currentLevel = this.gameState.petLevels[index]; // <-- KORREKTE PRÜFUNG
                const isActive = this.gameState.activePet === pet.id;
                const activateButton = petDiv.querySelector('.btn-pet-activate');

                petDiv.classList.toggle('active', isActive);
                petDiv.classList.toggle('bought', currentLevel > 0); // <-- KORREKTE PRÜFUNG

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

            // Update Active Pet Display (Bleibt gleich)
            const activePetDisplayElement = this.getById('active_pet_display');
            if (activePetDisplayElement) {
                if (this.gameState.activePet) {
                    const pet = petsData.find(p => p.id === this.gameState.activePet);
                    activePetDisplayElement.innerHTML = `
                        <img src="${pet.img}" alt="${pet.name}" class="active-pet-img">
                        <span>Aktives Pet: ${pet.name} (${pet.description})</span>
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

        petsData.forEach((pet, index) => {
            const petDiv = document.createElement('div');
            petDiv.className = 'pet-item';
            petDiv.dataset.id = pet.id;

            const currentLevel = this.gameState.petLevels[index];
            const stats = this.calculatePetStat(pet, currentLevel);

            let buyButtonHtml = '';
            let statusText;
            let buttonClass = 'btn-buy-pet'; // Neue Klasse für Level-Up

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

    renderDiamondMineContent() {
        const container = this.getById('diamond-mine-content');
        if (!container) return;

        const MINE_INDEX = DIAMOND_MINE_INDEX;
        const mineDefinition = uniqueBuildingsData.find(u => u.id === 'diamond_mine');
        if (!mineDefinition) return;

        const mineCount = this.gameState.buildingCounts[MINE_INDEX] || 0;
        const isOwned = mineCount > 0;

        if (isOwned) {
            container.innerHTML = `
            <h3>${mineDefinition.name} (Aktiv)</h3>
            <p>Diamantenproduktion: <span id="diamond-rate-display">0</span> DPS</p>
            <div id="minigame-placeholder">Hier kommt das Minispiel hin!</div>
        `;
            this.renderDiamondMinigame();
        } else {
            const mineCost = this.calculateNextCost(mineDefinition.basePrice, 0, mineDefinition.growthRate, MINE_INDEX);
            const canAfford = this.gameState.aktuelle_smileys >= mineCost;

            container.innerHTML = `
            <h3>Schalte die ${mineDefinition.name} frei</h3>
            <p>Die Mine wird benötigt, um das Diamanten-Minispiel zu starten.</p>
            <p>Kosten: ${this.formatNumber(mineCost)} Smileys</p>
            <button id="buy-diamond-mine-button" class="btn-buy" data-index="${MINE_INDEX}" ${canAfford ? '' : 'disabled'}>
                Mine Kaufen
            </button>
        `;
        }
    }

    renderDiamondMinigame() {
        const container = this.getById('minigame-placeholder');
        if (!container) return;

        const MINE_INDEX = DIAMOND_MINE_INDEX;
        const mineCount = this.gameState.buildingCounts[MINE_INDEX] || 0;
        const BONUS_DIAMOND = 5 * mineCount; // Bonus skaliert mit der Anzahl der Minen
        const DURATION = 5000; // 5 Sekunden

        container.innerHTML = `
            <h3>Minispiel: Aktive Schürfung</h3>
            <p>Ertrag pro erfolgreicher Schürfung: ${BONUS_DIAMOND} 💎</p>

            <div class="minigame-progress-container">
                <div id="minigame-bar" class="progress-bar" style="width: 0%; transition: width 0s;"></div>
            </div>
            <p id="minigame-result" class="info-section">Bereit zum Starten.</p>

            <button id="start-minigame-button" class="btn-confirm" ${this.gameState.diamondMinigameRunning ? 'disabled' : ''}>
                ${this.gameState.diamondMinigameRunning ? 'Schürfe läuft...' : 'Schürfen starten!'}
            </button>
        `;

        // Wenn das Spiel läuft, muss die Bar korrekt animiert werden
        if (this.gameState.diamondMinigameRunning) {
            const progressBar = this.getById('minigame-bar');
            if (progressBar) {
                // Um die Animation zu simulieren, setzen wir die Breite sofort auf 100% und fügen eine Transition hinzu,
                // wenn es gestartet wird. Hier setzen wir den Startzustand, falls wir die Seite neu laden.
                // Die eigentliche Animation wird in startDiamondMinigame() durchgeführt.
                progressBar.style.width = '100%';
                this.getById('minigame-result').innerText = 'Schürfe läuft...';
            }
        }
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
            // --- UPGRADE-ANSICHT: ZEIGT SMILEYS ---
            let upgradesHtml = '';

            guildUpgrades.forEach((upgrade, index) => {
                const isBought = this.gameState.guildUpgradeStatus[index];
                // Prüfe gegen Smileys
                const canAfford = this.gameState.aktuelle_smileys >= upgrade.cost;

                upgradesHtml += `
                    <div class="guild-upgrade-item ${isBought ? 'purchased' : (canAfford ? 'available' : 'locked')}">
                        <h4>${upgrade.name}</h4>
                        <p>${upgrade.description}</p>
                        <p>Kosten: ${this.formatNumber(upgrade.cost)} Smileys</p>
                        <button class="btn-buy-guild" data-id="${upgrade.id}" ${isBought || !canAfford ? 'disabled' : ''}>
                            ${isBought ? 'Gekauft' : 'Kaufen'}
                        </button>
                    </div>
                `;
            });

            container.innerHTML = `
                <h3>Willkommen in Gilde: ${this.gameState.guildName}</h3>
                <p>Dein Gilden-Bonus: x${(1 + this.gameState.guildSPSMultiplier).toFixed(2)}</p>
                <p>Guthaben: ${this.formatNumber(this.gameState.aktuelle_smileys)} Smileys</p>
                <div class="guild-upgrades-grid">
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

    // Reguläre Gebäude
    buildingsData.forEach(building => {
        const item = document.createElement('div');
        item.className = 'info-upgrade-item';
        item.innerHTML = `<h3>${building.name}</h3><p><strong>Start-Produktion:</strong> ${this.formatNumber(building.baseSPS || 0)} SPS</p><p><strong>Start-Kosten:</strong> ${this.formatNumber(building.basePrice)} Smileys</p><p><strong>Wachstumsrate:</strong> x${building.growthRate.toFixed(2)} pro Kauf</p>`;
        container.appendChild(item);
    });

    // NEU: Nur die Mine anzeigen (UNIQUE BUILDING)
    const mineDefinition = uniqueBuildingsData.find(u => u.id === 'diamond_mine');
    if (mineDefinition) {
        const mineItem = document.createElement('div');
        mineItem.className = 'info-upgrade-item special';
        mineItem.innerHTML = `<h3>${mineDefinition.name} (Spezial)</h3><p><strong>Effekt:</strong> Passive Diamantenproduktion und Freischaltung Minigame.</p><p><strong>Start-Kosten:</strong> ${this.formatNumber(mineDefinition.basePrice)} Smileys</p><p><strong>Maximal:</strong> ${mineDefinition.maxCount} Kauf</p>`;
        container.appendChild(mineItem);
    }
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