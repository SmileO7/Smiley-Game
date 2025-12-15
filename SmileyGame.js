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
            forschungPunkte: 0,
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
            researchStatus: researchUpgrades.map(() => false),
            prestigeUpgradeStatus: prestigeUpgrades.map(() => false),
            petStatus: petsData.map(() => false),
            activePet: null,

            // --- Laufzeit-Statistiken & Boni ---
            totalSPS: 0,
            researchLabPrestigeMulti: 1,
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
        this.createResearchUpgradeElements();

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

        // 2. FORSCHUNGSPUNKTE-PRODUKTION (RP)
        if (this.gameState.buildingCounts[RESEARCH_LAB_INDEX] > 0) {
            const lab = uniqueBuildingsData[0];
            const researchRate = 1 * this.gameState.buildingCounts[RESEARCH_LAB_INDEX] * (this.gameState.researchLabPrestigeMulti || 1);
            this.gameState.forschungPunkte += researchRate;
        }

        // 3. DIAMANTEN-PRODUKTION (DPS)
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

        const labIndex = RESEARCH_LAB_INDEX;
        const labDefinition = uniqueBuildingsData[0];
        if (this.gameState.buildingCounts[labIndex] > 0) {
            const labSPS = labDefinition.baseSPS * (this.gameState.buildingCounts[labIndex] || 0) * (labDefinition.researchMultiplier || 1);
            baseSPS += labSPS;
        }

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

        prestigeUpgrades.forEach(upg => {
            if (upg.type === 'building_cost_reduction' && this.gameState.prestigeUpgradeStatus[upg.id]) {
                if (!upg.buildingIndices || upg.buildingIndices.includes(buildingIndex)) {
                    costReduction += upg.value;
                }
            }
        });

        const petCostReduction = petsData.find(pet => pet.effectType === 'cost_reduction' && this.gameState.activePet === pet.id);
        if (petCostReduction) {
            costReduction += petCostReduction.effect;
        }

        if (costReduction > 0) {
            price *= (1 - costReduction);
        }

        return Math.floor(price);
    }

    applyAllBoni() {
        // Reset Multipliers
        this.gameState.globalSPSMultiplier = 1;
        this.gameState.researchLabPrestigeMulti = 1;
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

        // 1. RESEARCH Boni
        this.gameState.researchStatus.forEach((bought, id) => {
            if (bought) {
                const upgrade = researchUpgrades.find(u => u.id === id);
                if (!upgrade) return;
                if (upgrade.type === 'building_mult') {
                    buildingsData[upgrade.buildingIndex].prestigeMulti += upgrade.value;
                } else if (upgrade.type === 'click_mult') {
                    baseClickMultiplier += upgrade.value;
                }
            }
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
                        case 'research_lab_mult':
                            this.gameState.researchLabPrestigeMulti += upgrade.value;
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
            const pet = petsData.find(p => p.id === this.gameState.activePet);
            if (pet) {
                switch (pet.effectType) {
                    case 'click_mult':
                        prestigeClickMultiplier += pet.effect;
                        break;
                    case 'sps_mult':
                        this.gameState.globalSPSMultiplier += pet.effect;
                        break;
                    case 'research_mult':
                        this.gameState.researchLabPrestigeMulti += pet.effect;
                        break;
                    case 'prestige_point_eff':
                        this.gameState.prestigePointMultiplier += pet.effect;
                        break;
                }
            }
        }

        // 4. GILDEN BONI
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

        if (this.gameState.buildingCounts[RESEARCH_LAB_INDEX] > 0) {
            uniqueBuildingsData[0].researchMultiplier = this.gameState.researchLabPrestigeMulti;
        }
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
        let isUnique = index === RESEARCH_LAB_INDEX || index === DIAMOND_MINE_INDEX;

        if (isUnique) {
            item = uniqueBuildingsData.find(u => (index === RESEARCH_LAB_INDEX && u.name === 'Forschungslabor') || (index === DIAMOND_MINE_INDEX && u.id === 'diamond_mine'));
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

    kaufeResearchUpgrade(id) {
        const upgrade = researchUpgrades.find(u => u.id === id);
        if (!upgrade || this.gameState.researchStatus[id] || this.gameState.forschungPunkte < upgrade.cost) return;

        if (this.gameState.buildingCounts[RESEARCH_LAB_INDEX] === 0) {
            console.warn("Forschungslabor wird benötigt, um Upgrades zu kaufen.");
            return;
        }

        this.gameState.forschungPunkte -= upgrade.cost;
        this.gameState.researchStatus[id] = true;
        this.applyAllBoni();
        this.updateUI();
        this.speichereSpiel();
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
        this.gameState.researchStatus = researchUpgrades.map(() => false);

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

            this.gameState.petStatus.fill(false);
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

    kaufePet(petId) {
        if (!this.gameState.petsUnlocked) {
            console.warn("Pet-System nicht freigeschaltet.");
            return;
        }
        const pet = petsData.find(p => p.id === petId);
        const petIndex = petsData.findIndex(p => p.id === petId);

        if (this.gameState.petStatus[petIndex]) {
            console.warn("Pet bereits gekauft.");
            return;
        }
        if (this.gameState.prestige_punkte_verfügbar < pet.cost) {
            console.warn("Nicht genug Prestige-Punkte.");
            return;
        }

        this.gameState.prestige_punkte_verfügbar -= pet.cost;
        this.gameState.petStatus[petIndex] = true;

        this.activatePet(petId);

        this.updateUI();
        this.speichereSpiel();
    }

    activatePet(petId) {
        const petIndex = petsData.findIndex(p => p.id === petId);
        if (!this.gameState.petStatus[petIndex]) {
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
        const DURATION = 5000;
        const BONUS_DIAMOND = 5;

        if (this.gameState.diamondMinigameRunning) return;

        this.gameState.diamondMinigameRunning = true;
        this.updateUI();

        const progressBar = this.getById('minigame-bar');
        const resultText = this.getById('minigame-result');

        if (progressBar) progressBar.style.width = '100%';
        if (resultText) resultText.innerText = 'Schürfe läuft...';

        this.gameState.diamondMinigameTimer = setTimeout(() => {

            this.gameState.diamanten += BONUS_DIAMOND;
            this.gameState.diamondMinigameRunning = false;

            if (resultText) resultText.innerText = `Erfolgreich! +${BONUS_DIAMOND} Diamanten erhalten.`;
            if (progressBar) progressBar.style.width = '0%';

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
        this.updateResearchUI();
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

    updateResearchUI() {
        const labContent = this.getById('lab-main-content');
        const purchaseContainer = this.getById('lab-purchase-container');
        const gridContainer = this.getById('research-upgrade-grid');

        if (!labContent || !purchaseContainer || !gridContainer) return;

        const labOwned = this.gameState.buildingCounts[RESEARCH_LAB_INDEX] > 0;

        purchaseContainer.style.display = labOwned ? 'none' : 'block';
        labContent.style.display = labOwned ? 'block' : 'none';

        const forschungspunkteElement = this.getById('forschungspunkte');
        if (forschungspunkteElement) {
            forschungspunkteElement.innerText = this.formatNumber(this.gameState.forschungPunkte);
        }

        if (!labOwned) {
            const labButton = this.getById('forschungslaborButton');
            if (labButton) {
                const labCost = this.calculateNextCost(uniqueBuildingsData[0].basePrice, 0, uniqueBuildingsData[0].growthRate, RESEARCH_LAB_INDEX);
                labButton.innerText = `Kaufen (${this.formatNumber(labCost)})`;
                labButton.disabled = this.gameState.aktuelle_smileys < labCost;
            }
            return;
        }

        researchUpgrades.forEach(upgrade => {
            const node = gridContainer.querySelector(`.research-item[data-id="${upgrade.id}"]`);
            if (!node) return;

            const isPurchased = this.gameState.researchStatus[upgrade.id];
            const canAfford = this.gameState.forschungPunkte >= upgrade.cost;

            const costElement = node.querySelector(`#research-cost-${upgrade.id}`);
            if (costElement) costElement.innerText = this.formatNumber(upgrade.cost);

            const btn = node.querySelector('.btn-buy-research');

            node.classList.remove('purchased', 'available', 'locked');

            if (isPurchased) {
                node.classList.add('purchased');
                btn.disabled = true;
                btn.innerText = 'Gekauft';
            } else if (canAfford) {
                node.classList.add('available');
                btn.disabled = false;
                btn.innerText = 'Forschen';
            } else {
                node.classList.add('locked');
                btn.disabled = true;
                btn.innerText = 'Forschen';
            }
        });
    }

    updatePetButtons() {
        const petShopModal = this.getById('pet-shop-modal');
        if (!petShopModal) return;

        const petGrid = this.getById('pet-shop-grid');
        const lockMessage = this.getById('pet-lock-message');
        const openButton = this.getById('open-pet-shop-button');

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

        petsData.forEach((pet, index) => {
            const petDiv = petGrid.querySelector(`.pet-item[data-id="${pet.id}"]`);
            if (!petDiv) return;

            const isBought = this.gameState.petStatus[index];
            const isAffordable = this.gameState.prestige_punkte_verfügbar >= pet.cost;
            const isActive = this.gameState.activePet === pet.id;

            const buyButton = petDiv.querySelector('.btn-pet-buy');
            const activateButton = petDiv.querySelector('.btn-pet-activate');

            petDiv.classList.toggle('bought', isBought);
            petDiv.classList.toggle('active', isActive);

            if (isBought) {
                if (buyButton) {
                    buyButton.disabled = true;
                    buyButton.innerText = 'Gekauft';
                }
                if (activateButton) {
                    activateButton.disabled = false;
                    activateButton.innerText = isActive ? 'Deaktivieren' : 'Aktivieren';
                    activateButton.classList.toggle('btn-pet-active', isActive);
                    activateButton.classList.toggle('btn-pet-inactive', !isActive);
                }
            } else {
                if (buyButton) {
                    buyButton.disabled = !isAffordable;
                    buyButton.innerText = `Kaufen (${this.formatNumber(pet.cost)} PP)`;
                }
                if (activateButton) {
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

    renderPetShop() {
        const petGrid = this.getById('pet-shop-grid');
        if (!petGrid) return;
        petGrid.innerHTML = '';

        petsData.forEach(pet => {
            const petDiv = document.createElement('div');
            petDiv.className = 'pet-item';
            petDiv.dataset.id = pet.id;

            let bonusText;

            if (pet.interval > 0) {
                bonusText = `Auto-Klick alle ${pet.interval}ms (zusätzlich +${(pet.effect * 100).toFixed(0)}% Klickkraft)`;
            } else {
                switch (pet.effectType) {
                    case 'click_mult':
                        bonusText = `+${(pet.effect * 100).toFixed(0)}% Klickkraft`;
                        break;
                    case 'sps_mult':
                        bonusText = `+${(pet.effect * 100).toFixed(0)}% globale SPS`;
                        break;
                    case 'research_mult':
                        bonusText = `+${(pet.effect * 100).toFixed(0)}% Forschungsrate`;
                        break;
                    case 'cost_reduction':
                        bonusText = `-${(pet.effect * 100).toFixed(0)}% Kostenreduktion`;
                        break;
                    case 'prestige_point_eff':
                        bonusText = `+${(pet.effect * 100).toFixed(2)}% PP-Effektivität`;
                        break;
                    default:
                        bonusText = 'Unbekannter Bonus';
                }
            }

            petDiv.innerHTML = `
            <img src="${pet.img}" alt="${pet.name}" class="pet-img">
            <h3>${pet.name}</h3>
            <p class="pet-description">${pet.description}</p>
            <p class="pet-bonus">Bonus: ${bonusText}</p>
            <div class="pet-actions">
                <button class="btn-pet-buy" data-id="${pet.id}">Kaufen (${this.formatNumber(pet.cost)} PP)</button>
                <button class="btn-pet-activate btn-pet-inactive" data-id="${pet.id}">Aktivieren</button>
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

    createResearchUpgradeElements() {
        const gridContainer = this.getById('research-upgrade-grid');
        if (!gridContainer) return;
        gridContainer.innerHTML = '';

        researchUpgrades.forEach(upgrade => {
            const upgradeDiv = document.createElement('div');
            upgradeDiv.className = 'research-item';
            upgradeDiv.dataset.id = upgrade.id;

            let typeIcon = '';
            if (upgrade.type === 'click_mult') {
                typeIcon = '🖱️';
            } else if (upgrade.type === 'building_mult') {
                typeIcon = '🏭';
            }

            upgradeDiv.innerHTML = `
            <h4>${typeIcon} ${upgrade.description}</h4>
            <p>Kosten: <span id="research-cost-${upgrade.id}"></span> RP</p>
            <button id="buy-research-${upgrade.id}" class="btn-buy-research" data-id="${upgrade.id}">
                Forschen
            </button>
        `;
            gridContainer.appendChild(upgradeDiv);
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
        this.getById('forschungslaborButton')?.addEventListener('click', () => this.kaufeMehrereGebaeude(RESEARCH_LAB_INDEX, 1));

        this.getById('building-grid')?.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-buy');
            if (!button) return;
            const buildingItem = button.closest('.building-item');
            if (!buildingItem) return;
            const index = parseInt(buildingItem.dataset.index, 10);
            const amount = parseInt(button.dataset.amount, 10);
            if (!isNaN(index) && !isNaN(amount)) this.kaufeMehrereGebaeude(index, amount);
        });

        this.getById('research-upgrade-grid')?.addEventListener('click', (e) => {
            const buyButton = e.target.closest('.btn-buy-research');
            if (!buyButton) return;
            const id = parseInt(buyButton.dataset.id, 10);

            if (!isNaN(id)) {
                this.kaufeResearchUpgrade(id);
            }
        });

        this.getById('next-research-container')?.addEventListener('click', (e) => {
            const buyButton = e.target.closest('.btn-buy-research');
            if (!buyButton) return;
            const researchItem = buyButton.closest('.research-item');
            if (!researchItem) return;
            const id = parseInt(researchItem.dataset.id, 10);
            if (!isNaN(id)) {
                this.kaufeResearchUpgrade(id);
            }
        });

        this.getById('pet-shop-grid')?.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;
            const petId = button.dataset.id;

            if (button.classList.contains('btn-pet-buy')) {
                this.kaufePet(petId);
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

        const researchModal = this.getById('research_info_modal');
        const openResearchButton = this.getById('show_research_button');
        const closeResearchButton = this.getById('close_research_info_button');
        openResearchButton?.addEventListener('click', () => {

            this.createResearchInfoElements();
            if (researchModal) researchModal.style.display = 'flex';
        });
        closeResearchButton?.addEventListener('click', () => {
            if (researchModal) researchModal.style.display = 'none';
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

        buildingsData.forEach(building => {
            const item = document.createElement('div');
            item.className = 'info-upgrade-item';
            item.innerHTML = `<h3>${building.name}</h3><p><strong>Start-Produktion:</strong> ${this.formatNumber(building.baseSPS || 0)} SPS</p><p><strong>Start-Kosten:</strong> ${this.formatNumber(building.basePrice)} Smileys</p><p><strong>Wachstumsrate:</strong> x${building.growthRate.toFixed(2)} pro Kauf</p>`;
            container.appendChild(item);
        });

        const lab = uniqueBuildingsData[0];
        const labItem = document.createElement('div');
        labItem.className = 'info-upgrade-item special';
        labItem.innerHTML = `<h3>${lab.name} (Spezial)</h3><p><strong>Effekt:</strong> Generiert Forschungspunkte (RP) zur Freischaltung von Upgrades.</p><p><strong>Start-Kosten:</strong> ${this.formatNumber(lab.basePrice)} Smileys</p><p><strong>Maximal:</strong> ${lab.maxCount} Kauf</p>`;
        container.appendChild(labItem);
    }

    createResearchInfoElements() {
        const container = this.getById('info_research_container');
        if (!container) return;
        container.innerHTML = '';

        researchUpgrades.forEach(upgrade => {
            const item = document.createElement('div');
            item.className = 'info-upgrade-item';
            item.innerHTML = `<h3>${upgrade.description}</h3><p><strong>Kosten:</strong> ${this.formatNumber(upgrade.cost)} Forschungspunkte</p>`;
            container.appendChild(item);
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