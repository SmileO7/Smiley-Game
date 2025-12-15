//================================================================================================================
//--- 1. Globale Variablen & Spieldaten ---
//================================================================================================================

class SmileyGame {
    constructor() {
        // Der gesamte Inhalt des gelöschten 'let gameState = { ... }' Blocks
        // wird nun als Eigenschaft der Klasse initialisiert.
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
            // Wichtig: Wir müssen hier alle statischen Listen zusammenfügen
            buildingCounts: [],
            buildingPrices: [],
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

            // --- Feature-States ---
            petsUnlocked: false,
            petAutoClickTimer: 0,

            // -- Minigame Status
            diamondMinigameRunning: false,
            diamondMinigameTimer: null,
        };

        this.productionInterval = null;
        this.uiInterval = null;
        this.saveInterval = null;

        // Setup-Funktionen aufrufen (Logik aus der alten initialisiereSpiel)
        this.setupSettingsModalListeners();
        this.init();
    }

init(){
        this.ladeSpiel();

        this.createBuildingElements();
        this.renderPetShop();
        this.createPrestigeUpgradeElements(); // <-- ERSTELLT BAUM
        this.createResearchUpgradeElements();

        // NEU HINZUGEFÜGT: Stellt sicher, dass die Prestige-Klassen (available/locked) gesetzt sind
        this.updatePrestigeUI(); // <--- HIER EINFÜGEN!

        this.ladeAudioEinstellungen();
        const musicPlayer = this.getById('backgroudn-music');
        if (musicPlayer) {
            musicPlayer.play().catch(e =>{
            console.log("Hintergrundmusik wartet auf Bentuzerinteraktion(Error:", e, ").");
            });
        }

        this.setupMainEventListeners();
        this.setupPrestigeEventListeners();
        this.setupInfoPageEventListeners();

        this.startIntervals();
        this.updatePetInterval();

        this.updateUI();
    }

startIntervals() {
    // 1. Zentrale Produktion (SPS, RP, UI-Update) läuft einmal pro Sekunde (1000ms)
    this.productionInterval = setInterval(() => this.produzierePassiveErträge(), 1000);

    // 2. Automatische Speicherung (Effizient speichern alle 5 Sekunden)
    this.saveInterval = setInterval(() => {
        this.speichereSpiel();
    }, 5000);

    // 3. Speichern beim Schließen des Tabs (Critical Save)
    window.addEventListener('beforeunload', () => this.speichereSpiel());
}

//================================================================================================================
//--- 2. Hilfsfunktionen ---
//================================================================================================================

formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    if (num < 1000) return Math.floor(num).toString();
    const suffixes = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "De"];
    let i = 0;
    while (num >= 1000 && i < suffixes.length -1) {
        num /= 1000;
        i++;
    }
    return num.toFixed(2) + (i > 0 ? suffixes[i - 1] : '');
}

getById(id) { return document.getElementById(id); }

/**
 * Berechnet die Kosten für das nächste Gebäude-Level unter Berücksichtigung von Boni.
 */
calculateNextCost(basePrice, count, growthRate, buildingIndex = -1) {
    let price = Math.floor(basePrice * Math.pow(growthRate, count));
    let costReduction = 0;

    // 1. Prestige Cost Reduction
    // Suche nach allen Prestige-Upgrades mit cost_reduction, da diese additiv sein können
    prestigeUpgrades.forEach(upg => {
        if (upg.type === 'building_cost_reduction' && this.gameState.prestigeUpgradeStatus[upg.id]) {
            // Prüfe, ob die Reduktion für dieses spezifische Gebäude gilt (wenn buildingIndices definiert sind)
            if (!upg.buildingIndices || upg.buildingIndices.includes(buildingIndex)) {
                costReduction += upg.value;
            }
        }
    });

    // 2. Pet Cost Reduction (Ökonom Pet)
    const petCostReduction = petsData.find(pet => pet.effectType === 'cost_reduction' && this.gameState.activePet === pet.id);
    if (petCostReduction) {
        costReduction += petCostReduction.effect;
    }

    // 3. Wende die Reduktion auf den Preis an
    if (costReduction > 0) {
        price *= (1 - costReduction);
    }

    return Math.floor(price);
}

//================================================================================================================
//--- 3. Speicher- und Ladefunktionen ---
//================================================================================================================

speichereSpiel() {
    try {
        const allData = {
            // Wir speichern NUR das gameState-Objekt,
            // da es jetzt alle Arrays (buildingCounts, researchStatus etc.) enthält.
            gameState: this.gameState
        };
        const jsonString = JSON.stringify(allData);
        const encodedData = btoa(jsonString); // Base64 encoding
        localStorage.setItem('smileyGameSave', encodedData);
    } catch (e) {
        console.error("Fehler beim Speichern des Spiels:", e);
    }
}

ladeSpiel(encodedData) {
    try {
        let dataToLoad = encodedData;
        if (!dataToLoad) {
            dataToLoad = localStorage.getItem('smileyGameSave');
        }
        if (!dataToLoad) {
            this.applyAllBoni(); // Nur Boni anwenden, wenn kein Save da ist
            return false;
        }

        const jsonString = atob(dataToLoad);
        let allData = JSON.parse(jsonString);

        // ... (Migration Logic) ...

        this.gameState = {
            ...this.gameState,
            ...allData.gameState
        };

        const balanceVersion = localStorage.getItem('balanceVersion');
        if (this.gameState.gesamt_prestige_punkte > 10000 && balanceVersion !== '2') {
             alert("Dein Spielstand wurde aufgrund einer wichtigen Balance-Änderung angepasst. Deine Prestigepunkte und Skill-Tree-Upgrades wurden zurückgesetzt, um das Spiel fair zu halten. Dein restlicher Fortschritt bleibt erhalten.");
             this.gameState.gesamt_prestige_punkte = 0;
             this.gameState.prestige_punkte_verfügbar = 0;
             this.gameState.prestigeUpgradeStatus.fill(false);
             localStorage.setItem('balanceVersion', '2');
        }

        this.applyAllBoni(); // Wichtig: Boni auf Basis des geladenen Zustands anwenden

        return true;
    } catch (e) {
        console.error("Fehler beim Laden des Spiels:", e);
        if(encodedData) alert("Fehler beim Importieren des Spielstands. Die Daten sind möglicherweise beschädigt.");

        localStorage.removeItem('smileyGameSave');
        return false;
    }
}
//================================================================================================================
//--- 4. Boni-Anwendung & Kernlogik ---
//================================================================================================================

applyAllBoni() {
    // Reset all multipliers to their base values
    this.gameState.globalSPSMultiplier = 1;
    this.gameState.researchLabPrestigeMulti = 1;
    this.gameState.prestigePointMultiplier = 0.01;
    this.gameState.prestigeResetBonus = 0;
    this.gameState.petsUnlocked = false;
    let baseClickMultiplier = 1;
    let prestigeClickMultiplier = 0;

    // Reset building-specific multipliers in buildingsData
    buildingsData.forEach(b => { b.prestigeMulti = 1; });

    // 1. RESEARCH Boni anwenden
    this.gameState.researchStatus.forEach((bought, id) => {
        if(bought) {
            const upgrade = researchUpgrades.find(u => u.id === id);
            // ...

            if(upgrade.type === 'building_mult') {
                buildingsData[upgrade.buildingIndex].prestigeMulti += upgrade.value;
            } else if (upgrade.type === 'click_mult') {
                baseClickMultiplier += upgrade.value; // <--- HIER WIRD ES ZUR BASIS HINZUADDIERT
            }
        }
    });

    // 2. PRESTIGE Boni anwenden
    this.gameState.prestigeUpgradeStatus.forEach((bought, id) => {
        if(bought) {
            const upgrade = prestigeUpgrades.find(u => u.id === id);
            if(upgrade) {
                switch(upgrade.type) {
                    case 'global_sps_mult': this.gameState.globalSPSMultiplier += upgrade.value; break;
                    case 'global_click_mult': prestigeClickMultiplier += upgrade.value; break;
                    case 'research_lab_mult': this.gameState.researchLabPrestigeMulti += upgrade.value; break;
                    case 'prestige_point_eff': this.gameState.prestigePointMultiplier += upgrade.value; break;
                    case 'prestige_reset_bonus': this.gameState.prestigeResetBonus += upgrade.value; break;
                    case 'unlock_pets': this.gameState.petsUnlocked = true; break;
                    // building_cost_reduction wird in calculateNextCost behandelt
                }
            }
        }
    });

    // 3. PET Boni anwenden
    if (this.gameState.activePet) {
        const pet = petsData.find(p => p.id === this.gameState.activePet);
        if (pet) {
            switch (pet.effectType) {
                case 'click_mult': prestigeClickMultiplier += pet.effect; break;
                case 'sps_mult': this.gameState.globalSPSMultiplier += pet.effect; break;
                case 'research_mult': this.gameState.researchLabPrestigeMulti += pet.effect; break;
                case 'prestige_point_eff': this.gameState.prestigePointMultiplier += pet.effect; break;
                // cost_reduction wird in calculateNextCost behandelt
            }
        }
    }

    // 4. Finalisierung

    // Finalize click multiplier
    this.gameState.klickKraftMultiplier = baseClickMultiplier + prestigeClickMultiplier;

    // Finalize the global SPS multiplier
    const prestigeBonus = 1 + (this.gameState.gesamt_prestige_punkte * this.gameState.prestigePointMultiplier);
    const resetBonus = 1 + (this.gameState.prestigeResets * this.gameState.prestigeResetBonus);
    this.gameState.globalerPrestigeMultiplikator = prestigeBonus * resetBonus * this.gameState.globalSPSMultiplier;

    // Update Research Lab SPS Multi (für produziereSmileys)
    if (this.gameState.buildingCounts[RESEARCH_LAB_INDEX] > 0) {
        uniqueBuildingsData[0].researchMultiplier = this.gameState.researchLabPrestigeMulti;
    }
}

klickeSmiley() {
    const smileysGeklickt = this.gameState.klickKraft * this.gameState.klickKraftMultiplier;
    this.gameState.aktuelle_smileys += smileysGeklickt;
    this.gameState.gesammelte_smileys += smileysGeklickt;

    const baseClick = this.gameState.klickKraft;
    const totalMulti = this.gameState.klickKraftMultiplier;

    console.log(`[KLICK] Basis: ${baseClick} | Multiplikator: x${totalMulti.toFixed(2)} | Gewinn: ${this.formatNumber(smileysGeklickt)}`);

   const clickSound = this.getById('click-sound');
   if (clickSound){
    clickSound.currentTime = 0;

    clickSound.play().catch(e =>{

        const musicPlayer = this.getById('background-music');
        if (musicPlayer) musicPlayer.play().catch(()=> {});
        });
}
    if(typeof updateUI ==='function'){
        this.updateUI();
    }

}

produzierePassiveErträge(){
    // 1. SMILEY-PRODUKTION
    const baseSPS = this.getSmileysPerSecond(); // <-- Ruft die Methode auf, die wir gerade erstellt haben
    const actualSPS = baseSPS * this.gameState.globalerPrestigeMultiplikator;

    if(actualSPS > 0) {
        this.gameState.aktuelle_smileys += actualSPS;
        this.gameState.gesammelte_smileys += actualSPS;
    }

    // 2. FORSCHUNGSPUNKTE-PRODUKTION (RP)
    const RESEARCH_LAB_INDEX = 15;

    if(this.gameState.buildingCounts[RESEARCH_LAB_INDEX] > 0){
        const lab = uniqueBuildingsData[0];
        // KORREKTUR: this.gameState.buildingCounts (ohne 's' nach building)
        const researchRate = 1 * this.gameState.buildingCounts[RESEARCH_LAB_INDEX] * (this.gameState.researchLabPrestigeMulti || 1);
        this.gameState.forschungPunkte += researchRate;
    }

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

getSmileysPerSecond() {
    let baseSPS = 0;

    // Zähle die Basis-SPS aus allen regulären Gebäuden (Index 0 bis 14)
    buildingsData.forEach((item, index) => {
        // Basis-SPS * Anzahl * Gebäude-spezifischer Prestige/Research-Multi
        const buildingSPS = (item.baseSPS || 0) * (this.gameState.buildingCounts[index] || 0) * (item.prestigeMulti || 1);
        baseSPS += buildingSPS;
    });

    // Zähle das Forschungslabor (Unique Building, Index 15)
    const labIndex = RESEARCH_LAB_INDEX;
    const labDefinition = uniqueBuildingsData[0];
    if (this.gameState.buildingCounts[labIndex] > 0) {
        // Das Labor gibt 5 Basis-SPS (gemäß Definition) * Anzahl * (Research Multi)
        const labSPS = labDefinition.baseSPS * (this.gameState.buildingCounts[labIndex] || 0) * (labDefinition.researchMultiplier || 1);
        baseSPS += labSPS;
    }

    return baseSPS;
}

computeTotalSPS() {
    // Ruft die neue Methode auf, um die Basis-SPS zu erhalten
    let baseSPS = this.getSmileysPerSecond();

    // Wende den globalen Multiplikator an (inkl. Prestige, Resets, Pet-Boni)
    const prestigeBonus = 1 + (this.gameState.gesamt_prestige_punkte * this.gameState.prestigePointMultiplier);
    const resetBonus = 1 + (this.gameState.prestigeResets * this.gameState.prestigeResetBonus);

    // Gesamt-Global-Multiplikator berechnen
    // (prestigeBonus * resetBonus) * globalSPSMultiplier (von Prestige Upgrades und Pet Cat)
    this.gameState.globalerPrestigeMultiplikator = prestigeBonus * resetBonus * this.gameState.globalSPSMultiplier;

    // Finalisierung der totalen SPS
    this.gameState.totalSPS = baseSPS * this.gameState.globalerPrestigeMultiplikator;

    // *** NEU: CONSOLE LOG ZUR VERFOLGUNG DER BERECHNUNG ***
    console.log("--- SPS BERECHNUNG ---");
    console.log(`Basis SPS (Gebäude): ${this.formatNumber(baseSPS)}`);
    console.log(`Punkte-Bonus (PP * Eff.): x${prestigeBonus.toFixed(3)}`);

    // Nur loggen, wenn Resets stattgefunden haben
    if (this.gameState.prestigeResets > 0) {
        console.log(`Reset-Bonus (${this.gameState.prestigeResets} Resets): x${resetBonus.toFixed(3)}`);
    }

    // Nur loggen, wenn globale Boni vorhanden sind (Pet Cat, Prestige Upgrade)
    if (this.gameState.globalSPSMultiplier > 1) {
        console.log(`Globaler SPS Upgrade/Pet Bonus: x${this.gameState.globalSPSMultiplier.toFixed(3)}`);
    }

    console.log(`Gesamt-Multiplikator: x${this.gameState.globalerPrestigeMultiplikator.toFixed(3)}`);
    console.log(`Finale SPS: ${this.formatNumber(this.gameState.totalSPS)}`);
    // ----------------------------------------------------

    return this.gameState.totalSPS;
}

/**
 * Kauflogik für reguläre Gebäude und das Forschungslabor (Unique Building)
 */
kaufeMehrereGebaeude(index, amount) {
    let item;
    let isUnique = index === RESEARCH_LAB_INDEX;

    if (isUnique) {
        item = uniqueBuildingsData[0];
    } else {
        item = buildingsData[index];
    }

    if (isUnique && this.gameState.buildingCounts[index] >= item.maxCount) return;

    let totalCost = 0;
    const anzahl = isUnique ? 1 : amount;

    // Berechne die Gesamtkosten
    for (let i = 0; i < anzahl; i++) {
        totalCost += this.calculateNextCost(item.basePrice, this.gameState.buildingCounts[index] + i, item.growthRate, index);
    }

    if (this.gameState.aktuelle_smileys >= totalCost) {
        this.gameState.aktuelle_smileys -= totalCost;
        this.gameState.buildingCounts[index] += anzahl;

        // Aktualisiere den Preis für den nächsten Kauf
        const nextCount = this.gameState.buildingCounts[index];
         const buildingsData = this.calculateNextCost(item.basePrice, nextCount, item.growthRate, index);

        // Bei Kauf des Labors (oder Pet-Bonus) müssen alle Boni neu angewendet werden
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
    this.applyAllBoni(); // <-- Der Bonus wird neu berechnet
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
    this.updatePrestigeUI(); // KORREKTUR: Tippfehler behoben
    if (document.querySelector('.main-layout')) {
        this.updateUI();
    }
    this.speichereSpiel();
}

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

    // Aktiviere das Pet sofort nach dem Kauf
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

    this.applyAllBoni(); // Wichtig: Boni ZUERST neu anwenden
    this.updatePetInterval(); // <--- Pet Timer MUSS HIER stehen!
    this.updateUI();
    this.speichereSpiel();
}

prestigeReset() {
    const prestigePointThreshold = 1000000;
    const totalPotentialPoints = Math.floor(Math.pow(this.gameState.gesammelte_smileys / prestigePointThreshold, 1/3));
    const pointsToGain = Math.max(0, totalPotentialPoints - this.gameState.gesamt_prestige_punkte);

    if (pointsToGain <= 0) {
        // Anstelle von alert()
        console.warn("Nicht genug Smileys gesammelt, um neue Prestige-Punkte zu verdienen.");
        return;
    }

    // Modal-Logik (Platzhalter für echtes Modal, da confirm() blockiert)
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

    // Setze alle Arrays zurück (reguläre + Unique)
    this.gameState.buildingCounts = [...buildingsData, ...uniqueBuildingsData].map(() => 0);

    this.gameState.buildingPrices = [
    ...buildingsData.map(item => item.basePrice),
    ...uniqueBuildingsData.map(item => item.basePrice)
    ];

    this.gameState.researchStatus = researchUpgrades.map(() => false);

    // Pet-Status wird NICHT zurückgesetzt (Pet ist Prestige-Upgrade)

    this.applyAllBoni();
    this.speichereSpiel();

    if(document.querySelector('.prestige-main')) {
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

        // Zurücksetzen von Pet Status beim Prestige Reset
        this.gameState.petStatus.fill(false);
        this.gameState.activePet = null;

        this.gameState.prestige_punkte_verfügbar += refundedPoints;
        this.gameState.prestigeUpgradeStatus.fill(false);
        this.applyAllBoni();
        this.updatePRestigeUI();
        this.speichereSpiel();
    }
}

//================================================================================================================
//--- 5. Rendering & UI-Update ---
//================================================================================================================

createBuildingElements() {
    const buildingGrid = this.getById('building-grid');
    if (!buildingGrid) return;
    buildingGrid.innerHTML = '';

    // Building Grid rendern (nur reguläre Gebäude 0-14)
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

    // Aktuell gibt es keinen aktiven Timer (diese Logik kommt später in Aktion 3)
    const isRunning = this.gameState.diamondMinigameRunning; // Wir definieren diese Variable später

    // Einfache HTML-Struktur für das Minispiel
    container.innerHTML = `
        <div id="minigame-box" style="padding: 15px; border: 1px solid #009ffd; border-radius: 8px;">
            <h4>Diamanten schürfen:</h4>
            <div id="minigame-progress" style="height: 20px; background-color: #333; margin-bottom: 10px;">
                <div id="minigame-bar" style="width: 0%; height: 100%; background-color: #009ffd; transition: width 1s linear;"></div>
            </div>
            <button id="start-minigame-button" class="btn-buy" ${isRunning ? 'disabled' : ''}>
                ${isRunning ? 'Schürfe läuft...' : 'Schürfen starten (5s)'}
            </button>
        </div>
        <p id="minigame-result" style="margin-top: 10px; font-weight: bold;"></p>
    `;
}

renderPetShop() {
    const petGrid = this.getById('pet-shop-grid');
    if (!petGrid) return;
    petGrid.innerHTML = '';

    petsData.forEach(pet => {
        const petDiv = document.createElement('div');
        petDiv.className = 'pet-item';
        petDiv.dataset.id = pet.id;

        let bonusText;

        // **KORREKTUR:** Separate Logik für Auto-Klick (pet_dog)
        if (pet.interval > 0) {
            // Der Pet Dog hat Auto-Klick und Klickkraft-Bonus
            bonusText = `Auto-Klick alle ${pet.interval}ms (zusätzlich +${(pet.effect * 100).toFixed(0)}% Klickkraft)`;
        } else {
            // Logik für alle passiven Boni
            switch (pet.effectType) {
                case 'click_mult': bonusText = `+${(pet.effect * 100).toFixed(0)}% Klickkraft`; break;
                case 'sps_mult': bonusText = `+${(pet.effect * 100).toFixed(0)}% globale SPS`; break;
                case 'research_mult': bonusText = `+${(pet.effect * 100).toFixed(0)}% Forschungsrate`; break;
                case 'cost_reduction': bonusText = `-${(pet.effect * 100).toFixed(0)}% Kostenreduktion`; break;
                case 'prestige_point_eff': bonusText = `+${(pet.effect * 100).toFixed(2)}% PP-Effektivität`; break; // **NEU: Pet Chameleon**
                default: bonusText = 'Unbekannter Bonus';
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

createResearchUpgradeElements() {
    const gridContainer = this.getById('research-upgrade-grid');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    researchUpgrades.forEach(upgrade => {
        const upgradeDiv = document.createElement('div');
        upgradeDiv.className = 'research-item';
        upgradeDiv.dataset.id = upgrade.id;

        // Bestimme den Upgrade-Typ für visuelle Unterscheidung
        let typeIcon = '';
        if (upgrade.type === 'click_mult') {
            typeIcon = '🖱️'; // Klick-Upgrade
        } else if (upgrade.type === 'building_mult') {
            typeIcon = '🏭'; // Gebäude-Upgrade
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


updateBuildingUI() {
    buildingsData.forEach((building, index) => {
        const cost1x = this.calculateNextCost(building.basePrice, this.gameState.buildingCounts[index], building.growthRate, index);

        let cost10x = 0; for (let i = 0; i < 10; i++) cost10x += this.calculateNextCost(building.basePrice, this.gameState.buildingCounts[index] + i, building.growthRate, index);
        let cost100x = 0; for (let i = 0; i < 100; i++) cost100x += this.calculateNextCost(building.basePrice, this.gameState.buildingCounts[index] + i, building.growthRate, index);

        // Berücksichtige den prestigeMulti (Research Boni)
        const baseBuildingSPS = (this.gameState.buildingCounts[index] || 0) * (building.baseSPS || 0) * (building.prestigeMulti || 1);
        const actualBuildingSPS = baseBuildingSPS * this.gameState.globalerPrestigeMultiplikator;
        const spsPercentage = this.gameState.totalSPS > 0 ? (actualBuildingSPS / this.gameState.totalSPS * 100) : 0;

        const countElement = this.getById(`building-count-${index}`);
        if(countElement) countElement.innerText = this.gameState.buildingCounts[index];
        const spsElement = this.getById(`building-sps-${index}`);
        if(spsElement) spsElement.innerText = this.formatNumber(actualBuildingSPS);
        const spsPctElement = this.getById(`building-sps-pct-${index}`);
        if(spsPctElement) spsPctElement.innerText = spsPercentage.toFixed(1);

        const btn1x = this.getById(`buy-1-${index}`);
        if(btn1x) {
            btn1x.innerHTML = `1x (${this.formatNumber(cost1x)})`;
            btn1x.disabled = this.gameState.aktuelle_smileys < cost1x;
        }
        const btn10x = this.getById(`buy-10-${index}`);
        if(btn10x) {
            btn10x.innerHTML = `10x (${this.formatNumber(cost10x)})`;
            btn10x.disabled = this.gameState.aktuelle_smileys < cost10x;
        }
        const btn100x = this.getById(`buy-100-${index}`);
        if(btn100x) {
            btn100x.innerHTML = `100x (${this.formatNumber(cost100x)})`;
            btn100x.disabled = this.gameState.aktuelle_smileys < cost100x;
        }
    });
        this.updateDiamondMineStatus();
}

updateDiamondMineStatus(){
    const mineUpgradePurchased = this.gameState.prestigeUpgradeStatus[9];
    const mineButton = this.getById('open_diamond_mine_button');

    if (mineButton){
        mineButton.style.display = mineUpgradePurchased ? 'block' : 'none'; // KORRIGIERT
    }

    if (mineUpgradePurchased) {
        this.renderDiamondMineContent();
    }
}

updateDiamondMineButton() {
    const button = this.getById('open_diamond_mine_button');
    if (!button) return;

    if (this.gameState.diamondMineUnlocked) {
        button.style.display = 'block';
    } else {
        button.style.display = 'none';
    }
}

updateResearchUI() {
    const labContent = this.getById('lab-main-content');
    const purchaseContainer = this.getById('lab-purchase-container');
    const gridContainer = this.getById('research-upgrade-grid'); // NEU: Zugriff auf das Grid

    if (!labContent || !purchaseContainer || !gridContainer) return;

    const labOwned = this.gameState.buildingCounts[RESEARCH_LAB_INDEX] > 0;

    // UI-Elemente für das Labor ein-/ausblenden
    purchaseContainer.style.display = labOwned ? 'none' : 'block';
    labContent.style.display = labOwned ? 'block' : 'none';

    // Anzeige der RP-Zahl
    const forschungspunkteElement = this.getById('forschungspunkte');
    if (forschungspunkteElement) {
        forschungspunkteElement.innerText = this.formatNumber(this.gameState.forschungPunkte);
    }

    // Wenn das Labor nicht existiert, kann nichts gekauft werden
    if (!labOwned) {
        const labButton = this.getById('forschungslaborButton');
        if (labButton) {
            const labCost = this.calculateNextCost(uniqueBuildingsData[0].basePrice, 0, uniqueBuildingsData[0].growthRate, RESEARCH_LAB_INDEX);
            labButton.innerText = `Kaufen (${this.formatNumber(labCost)})`;
            labButton.disabled = this.gameState.aktuelle_smileys < labCost;
        }
        return; // Stoppt hier, wenn Lab nicht gekauft ist
    }

    // **********************************************
    // NEU: Update des RESEARCH UPGRADE GRIDS
    // **********************************************
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
        // Pet-Button in der mittleren Spalte nur anzeigen, wenn freigeschaltet
        openButton.style.display = this.gameState.petsUnlocked ? 'block' : 'none';
    }

    if (!this.gameState.petsUnlocked) {
        // Modal-Inhalt: Zeige Schloss-Nachricht
        if (lockMessage) lockMessage.style.display = 'block';
        if (petGrid) petGrid.style.display = 'none';

        if (lockMessage) {
            // WICHTIG: Prüfen Sie hier, ob 'Upgrade ID 8' korrekt ist
            lockMessage.innerHTML = `<p>Schalte Pets im Prestige Shop (Upgrade ID 8) frei!</p>`;
        }
        return;
    }

    // Pet-Shop ist freigeschaltet, Modal-Inhalt vorbereiten
    if (lockMessage) lockMessage.style.display = 'none';
    if (petGrid) petGrid.style.display = 'grid';


    // Rendern und aktualisieren der Pet-Karten
    petsData.forEach((pet, index) => {
        const petDiv = petGrid.querySelector(`.pet-item[data-id="${pet.id}"]`);
        if (!petDiv) return;

        const isBought = this.gameState.petStatus[index]; // Angenommen: petStatus ist nun this.gameState.petStatus
        const isAffordable = this.gameState.prestige_punkte_verfügbar >= pet.cost;
        const isActive = this.gameState.activePet === pet.id; // Angenommen: activePet ist nun this.gameState.activePet

        const buyButton = petDiv.querySelector('.btn-pet-buy');
        const activateButton = petDiv.querySelector('.btn-pet-activate');

        petDiv.classList.toggle('bought', isBought);
        petDiv.classList.toggle('active', isActive);

        if (isBought) {
            if(buyButton) {
                buyButton.disabled = true;
                buyButton.innerText = 'Gekauft';
            }
            if(activateButton) {
                activateButton.disabled = false;
                activateButton.innerText = isActive ? 'Deaktivieren' : 'Aktivieren';
                activateButton.classList.toggle('btn-pet-active', isActive);
                activateButton.classList.toggle('btn-pet-inactive', !isActive);
            }
        } else {
            if(buyButton) {
                buyButton.disabled = !isAffordable;
                buyButton.innerText = `Kaufen (${this.formatNumber(pet.cost)} PP)`;
            }
            if(activateButton) {
                activateButton.disabled = true;
                activateButton.innerText = 'Aktivieren';
                activateButton.classList.remove('btn-pet-active', 'btn-pet-inactive');
            }
        }
    });

    // Update Active Pet Display in Left Column (Statusbereich)
    // KORREKTUR DER FEHLERHAFTEN ZEILE 833
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

updateUI() {
    this.computeTotalSPS();

    const diamantenEl = this.getById('diamanten_anzeige');
    if (diamantenEl) {
        diamantenEl.innerText = this.formatNumber(this.gameState.diamanten);
    }

    // KORREKTUR: Null-Checks für alle UI-Elemente hinzufügen
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

    const prestigePointThreshold = 1000000;
    const totalPotentialPoints = Math.floor(Math.pow(this.gameState.gesammelte_smileys / prestigePointThreshold, 1/3));
    const pointsToGain = Math.max(0, totalPotentialPoints - this.gameState.gesamt_prestige_punkte);

    const nextPointRequirement = Math.pow(this.gameState.gesamt_prestige_punkte + pointsToGain + 1, 3) * prestigePointThreshold;
    const lastPointRequirement = Math.pow(this.gameState.gesamt_prestige_punkte + pointsToGain, 3) * prestigePointThreshold;

    const progressBar = this.getById('prestige-progress-bar');
    const progressText = this.getById('prestige-progress-text');

    if(progressBar && progressText) {
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
    if(!this.getById('prestige_punkte_verfügbar')) return;

    const prestigePointThreshold = 1000000;
    const totalPotentialPoints = Math.floor(Math.pow(this.gameState.gesammelte_smileys / prestigePointThreshold, 1/3));
    const pointsToGain = Math.max(0, totalPotentialPoints - this.gameState.gesamt_prestige_punkte);

    const nextPointRequirement = Math.pow(this.gameState.gesamt_prestige_punkte + pointsToGain + 1, 3) * prestigePointThreshold;

    this.getById('prestige_punkte_verfügbar').innerText = this.formatNumber(this.gameState.prestige_punkte_verfügbar);
    this.getById('gesamt_prestige_punkte').innerText = this.formatNumber(this.gameState.gesamt_prestige_punkte);
    this.getById('aktuelle_smileys_prestige').innerText = this.formatNumber(this.gameState.gesammelte_smileys);
    this.getById('next_prestige_point').innerText = this.formatNumber(nextPointRequirement);

    // Globaler Multiplikator auf der Prestige Seite anzeigen
    const globalMultiDisplay = this.getById('globaler_multiplikator_anzeige_prestige');
    if (globalMultiDisplay) {
         globalMultiDisplay.innerText = `x${this.gameState.globalerPrestigeMultiplikator.toFixed(2)}`;
    }


    const prestigeButton = this.getById('prestige_reset_button');
    if(prestigeButton) {
        prestigeButton.disabled = pointsToGain <= 0;
        prestigeButton.innerText = `Prestige Reset (${pointsToGain} Punkte)`;
    }
    const pointsToGainElement = this.getById('prestige_points_to_gain');
    if(pointsToGainElement) {
        pointsToGainElement.innerText = pointsToGain;
    }

    if (this.getById('prestige-tree-container')) {
        prestigeUpgrades.forEach(upgrade => {
            const node = document.querySelector(`.prestige-node[data-id="${upgrade.id}"]`);
            if (!node) return;

            const requirementsMet = upgrade.requirements.every(reqId => this.gameState.prestigeUpgradeStatus[reqId]);
            const canAfford = this.gameState.prestige_punkte_verfügbar >= upgrade.cost; // <--- WICHTIGE VARIABLE
            const isPurchased = this.gameState.prestigeUpgradeStatus[upgrade.id];

            node.classList.remove('purchased', 'available', 'locked');

            if (isPurchased) {
                node.classList.add('purchased');
            } else if (requirementsMet && canAfford) { // <--- KAUF NUR, WENN VORAUSSETZUNGEN UND GELD DA SIND
                node.classList.add('available');
            } else {
                node.classList.add('locked');
            }
        });
        // Linien aktualisieren... (Teil der Prestige Map Logik)
    }
}

zeigePrestigeDetails(nodeElement, isHover = false){
    const tooltip = this.getById('prestige-tooltip-modal');
    if (!tooltip) return;

    const description = nodeElement.dataset.description;
    const cost = nodeElement.dataset.cost;
    const id = parseInt(nodeElement.dataset.id, 10);

    const isPurchased = nodeElement.classList.contains('purchased');
    const isAvailable = nodeElement.classList.contains('available');

    let statusText;
    if (isPurchased){
        statusText = 'Gekauft';
    } else if(isAvailable){
        statusText = 'Bereit zum Kauf'; // "Available" zu Deutsch korrigiert
    } else {
        statusText = 'Nicht verfügbar';
    }

    // --- KORRIGIERT: Nutzung von Template Strings (Backticks) und korrekte Zuweisung ---

    // Zuweisung 1 (Titel/Beschreibung)
    this.getById('tooltip-title').innerText = description;

    // Zuweisung 2 (Kosten) - KORRIGIERT: Verwendung von Backticks
    this.getById('tooltip-cost').innerText = `Kosten: ${cost} PP`;

    // Zuweisung 3 (Status) - KORRIGIERT: Korrekter Abschluss
    this.getById('tooltip-status').innerText = `Status: ${statusText}`;

    // -----------------------------------------------------------------------------------

    tooltip.style.display = 'flex';

    const closeListener = (e) => {
        if(!tooltip.contains(e.target) && !nodeElement.contains(e.target)){
            tooltip.style.display = 'none';
            document.removeEventListener('click', closeListener);
        }
    };

    setTimeout(() => {
        document.addEventListener('click', closeListener);
    }, 50);
}

//================================================================================================================
//--- 6. Diamond Mine MiniGame ---
//================================================================================================================

startDiamondMinigame() {
    const DURATION = 5000; // 5 Sekunden
    const BONUS_DIAMOND = 5;

    // Prüfe, ob das Spiel bereits läuft
    if (this.gameState.diamondMinigameRunning) return;

    this.gameState.diamondMinigameRunning = true;
    this.updateUI(); // Deaktiviert den Start-Button

    const progressBar = this.getById('minigame-bar');
    const resultText = this.getById('minigame-result'); // Korrekterweise resultText, nicht progressText

    if (progressBar) progressBar.style.width = '100%';
    if (resultText) resultText.innerText = 'Schürfe läuft...';

    // 1. Minispiel Timer starten
    this.gameState.diamondMinigameTimer = setTimeout(() => {

        // 2. Bonus hinzufügen
        this.gameState.diamanten += BONUS_DIAMOND;
        this.gameState.diamondMinigameRunning = false;

        // 3. UI updaten und Log
        if (resultText) resultText.innerText = `Erfolgreich! +${BONUS_DIAMOND} Diamanten erhalten.`;
        if (progressBar) progressBar.style.width = '0%';

        this.updateUI(); 
        this.speichereSpiel();

        // KORRIGIERT: Konstante ist BONUS_DIAMOND
        console.log(`[Minigame] Abgeschlossen. +${BONUS_DIAMOND} Diamanten.`);

    }, DURATION);
}

//================================================================================================================
//--- 7. Pets ---
//================================================================================================================
 updatePetInterval(){
     // 1. Intervall stoppen, falls aktiv
     if (this.petAutoClickTimer !== null) {
         clearInterval(this.petAutoClickTimer);
         this.petAutoClickTimer = null;
     }

     // 2. Prüfen, ob Auto-Click Pet aktiv ist
     if (this.gameState.activePet){
         const petDetails = petsData.find(p => p.id === this.gameState.activePet);

         // Wir prüfen hier nur auf den 'pet_dog', der den Auto-Click auslösen soll.
         if(petDetails && petDetails.id === 'pet_dog') {
             const clicksPerInterval = 1;
             const intervalDuration = 1000;

             this.petAutoClickTimer = setInterval(() => {
                     this.klickeSmiley();

             }, intervalDuration);

             // KORREKTUR: Korrekte Verwendung von Backticks (`)
             console.log(`Auto-Click Pet-Intervall gestartet: ${clicksPerInterval} Klicks/Sekunde.`);
         }
     }
 }

//================================================================================================================
//--- 7. Event Listener Setup ---
//================================================================================================================

setupMainEventListeners() {
    // KORREKTUR: Muss in eine anonyme Funktion, um 'this' zu erhalten
    this.getById('smiley_button')?.addEventListener('click', () => this.klickeSmiley());

    // KORREKTUR: Muss in eine anonyme Funktion, um 'this' zu erhalten
    this.getById('forschungslaborButton')?.addEventListener('click', () => this.kaufeMehrereGebaeude(RESEARCH_LAB_INDEX, 1));

    // Building Grid Event Listener (Bereits ein Pfeilfunktion, aber Aufruf muss korrigiert werden)
    this.getById('building-grid')?.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-buy');
        if (!button) return;
        const buildingItem = button.closest('.building-item');
        if (!buildingItem) return;
        const index = parseInt(buildingItem.dataset.index, 10);
        const amount = parseInt(button.dataset.amount, 10);
        // KORREKTUR: Aufruf muss this. verwenden
        if (!isNaN(index) && !isNaN(amount)) this.kaufeMehrereGebaeude(index, amount);
    });

    this.getById('research-upgrade-grid')?.addEventListener('click', (e) => {
        const buyButton = e.target.closest('.btn-buy-research');
        if (!buyButton) return;
        const id = parseInt(buyButton.dataset.id, 10); // Holt ID direkt vom Button

        if (!isNaN(id)) {
            this.kaufeResearchUpgrade(id);
        }
    });

    // Research Quick Buy Button Event Listener
    this.getById('next-research-container')?.addEventListener('click', (e) => {
        const buyButton = e.target.closest('.btn-buy-research');
        if (!buyButton) return;
        const researchItem = buyButton.closest('.research-item');
        if (!researchItem) return;
        const id = parseInt(researchItem.dataset.id, 10);
        // KORREKTUR: Aufruf muss this. verwenden
        if (!isNaN(id)) {
            this.kaufeResearchUpgrade(id);
        }
    });

    // Pet Shop Event Listeners (im Modal)
    this.getById('pet-shop-grid')?.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        const petId = button.dataset.id;

        // KORREKTUR: Aufrufe müssen this. verwenden
        if (button.classList.contains('btn-pet-buy')) {
                this.kaufePet(petId);
            } else if (button.classList.contains('btn-pet-activate')) {
                this.activatePet(petId);
        }
    });

    // Pet Modal Steuerung
    const petModal = this.getById('pet-shop-modal');
    const openPetButton = this.getById('open-pet-shop-button');
    const closePetButton = this.getById('close-pet-shop-button');

    if (openPetButton && petModal) {
        openPetButton.addEventListener('click', () => {
            this.updatePetButtons(); // Update Modal-Inhalt vor dem Öffnen
            petModal.style.display = 'flex';
        });
    }

    if (closePetButton && petModal) {
        closePetButton.addEventListener('click', () => {
            petModal.style.display = 'none';
        });
    }

    // Nur EINE Instanz dieses Listeners sollte in setupMainEventListeners() existieren:
    this.getById('diamond-mine-content')?.addEventListener('click', (e) => {
        const buyButton = e.target.closest('#buy-diamond-mine-button');
        const startButton = e.target.closest('#start-minigame-button');

        // Kauf-Logik
        if (buyButton) {
            const index = parseInt(buyButton.dataset.index, 10);
            if (index === DIAMOND_MINE_INDEX) {
                this.kaufeMehrereGebaeude(index, 1);
            }
        }

        // Minispiel Start-Logik
        if (startButton && !this.gameState.diamondMinigameRunning) {
            this.startDiamondMinigame();
        }
    });

    const diamondMineModal = this.getById('diamond-mine-modal');
    const openMineButton = this.getById('open_diamond_mine_button');
    const closeMineButton = this.getById('close_diamond_mine_button');

    if (openMineButton && diamondMineModal) {
        openMineButton.addEventListener('click', (e) => {
            e.preventDefault(); // Verhindert das Navigieren zur leeren #
            this.updateDiamondMineStatus(); // Stellt sicher, dass der Inhalt (Kauf/Spiel) aktuell ist
            diamondMineModal.style.display = 'flex';
        });
    }

    if (closeMineButton && diamondMineModal) {
        closeMineButton.addEventListener('click', () => {
            diamondMineModal.style.display = 'none';
        });
    }
}


setupPrestigeEventListeners() {
    const prestigeModal = this.getById('prestige_confirm_modal');
    const openPrestigeModalButton = this.getById('prestige_reset_button');
    const closePrestigeModalButton = this.getById('cancel_prestige_button');
    const confirmPrestigeButton = this.getById('confirm_prestige_button');

    // Prestige Reset Button Logic (opens modal)
    openPrestigeModalButton?.addEventListener('click', () => {
        this.updatePrestigeUI();
        const totalPotentialPoints = Math.floor(Math.pow(this.gameState.gesammelte_smileys / 1000000, 1/3));
        const pointsToGain = Math.max(0, totalPotentialPoints - this.gameState.gesamt_prestige_punkte);
        if (pointsToGain > 0) {
            prestigeModal.style.display = 'flex';
        }
    });

    closePrestigeModalButton?.addEventListener('click', () => { prestigeModal.style.display = 'none'; });
    confirmPrestigeButton?.addEventListener('click', () => {
        this.prestigeReset();
        prestigeModal.style.display = 'none';
    });

    const skillTreeModal = this.getById('skill_tree_modal');
    const openSkillTreeButton = this.getById('open_skill_tree_button');
    const closeSkillTreeButton = this.getById('close_skill_tree_button');

    // Listener für das Öffnen des Skill-Trees
    openSkillTreeButton?.addEventListener('click', () => {
        this.createPrestigeUpgradeElements();
        this.updatePrestigeUI(); // WICHTIGE KORREKTUR: Setzt den Status (.available)
        skillTreeModal.style.display = 'flex';
    });
    closeSkillTreeButton?.addEventListener('click', () => { skillTreeModal.style.display = 'none'; });

    // --- ZENTRALER LISTENER FÜR KLICK (KAUF) ---
    const prestigeTreeContainer = this.getById('prestige-tree-container');
    const tooltip = this.getById('prestige-tooltip-modal'); // Notwendig für Hover-Logik

    prestigeTreeContainer?.addEventListener('click', (e) => {
        const node = e.target.closest('.prestige-node');
        if (!node) return;

        // Zeigt Details an (isHover=false -> Schließ-Logik aktiv)
        this.zeigePrestigeDetails(node, false);

        // Kauflogik
        const isPurchased = node.classList.contains('purchased');
        const isAvailable = node.classList.contains('available');

        if (!isPurchased && isAvailable) {
            const id = parseInt(node.dataset.id, 10);
            if (!isNaN(id)) {
                this.kaufePrestigeUpgrade(id);
            }
        }
    });

    // --- HOVER LISTENER (DETAILS ANZEIGEN/VERSTECKEN) ---
    if (prestigeTreeContainer && tooltip) {

        // MOUSE ENTER (HOVER START)
        prestigeTreeContainer.addEventListener('mouseover', (e) => {
            const node = e.target.closest('.prestige-node');
            if (!node || node.dataset.id === undefined) return;

            // Zeigt Details an (isHover=true -> KEINE Schließ-Logik aktiv)
            this.zeigePrestigeDetails(node, true);
        });

        // MOUSE LEAVE (HOVER ENDE)
        prestigeTreeContainer.addEventListener('mouseout', (e) => {
            const node = e.target.closest('.prestige-node');
            if (!node) return;

            // Versteckt das Tooltip-Modal
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
    closeBuildingsButton?.addEventListener('click', () => { if (buildingsModal) buildingsModal.style.display = 'none'; });

    const researchModal = this.getById('research_info_modal');
    const openResearchButton = this.getById('show_research_button');
    const closeResearchButton = this.getById('close_research_info_button');
    openResearchButton?.addEventListener('click', () => {

     this.createResearchInfoElements();
     if (researchModal) researchModal.style.display = 'flex';
      });
    closeResearchButton?.addEventListener('click', () => { if (researchModal) researchModal.style.display = 'none'; });

    const prestigeModal = this.getById('prestige_info_modal');
    const openPrestigeButton = this.getById('show_prestige_button');
    const closePrestigeButton = this.getById('close_prestige_info_button');
    openPrestigeButton?.addEventListener('click', () => {
        this.updatePrestigeInfoTree();
        if (prestigeModal) prestigeModal.style.display = 'flex';
    });
    closePrestigeButton?.addEventListener('click', () => { if (prestigeModal) prestigeModal.style.display = 'none'; });

const statsModal = this.getById('stats_info_modal');
    const openStatsButton = this.getById('show_stats_button');
    const closeStatsButton = this.getById('close_stats_info_button');
    openStatsButton?.addEventListener('click', () => {

     this.createInfoStatsElements();
     if (statsModal) statsModal.style.display = 'flex';
      });
    closeStatsButton?.addEventListener('click', () => { if (statsModal) statsModal.style.display = 'none'; });

    // Pet Info Modal Listener
    const petInfoModal = this.getById('pets_info_modal'); // Annahme: ID des Modal-Containers
    const openPetsButton = this.getById('show_pets_button'); // Annahme: ID des Buttons
    const closePetsButton = this.getById('close_pets_info_button');

    openPetsButton?.addEventListener('click', () => {
        this.createInfoPetsElements();
        if (petInfoModal) petInfoModal.style.display = 'flex';
    });
    // KORREKTUR DER SCHLIESSENDEN KLAMMER
    closePetsButton?.addEventListener('click', () => {
        if (petInfoModal) petInfoModal.style.display = 'none';
    });
}

updatePrestigeInfoTree() {
    const treeContainer = this.getById('info_prestige_container');if (!treeContainer) return;

    this.prestigeUpgrades.forEach(upgrade => {
        const node = treeContainer.querySelector(`.prestige-node[data-id="${upgrade.id}"]`);
        if (!node) return;
        const isPurchased = this.gameState.prestigeUpgradeStatus[upgrade.id];
        node.classList.toggle('purchased', isPurchased);
        const requirementsMet = upgrade.requirements.every(reqId => this.gameState.prestigeUpgradeStatus[reqId]);
        node.classList.toggle('available', requirementsMet && !isPurchased);
        node.classList.toggle('locked', !requirementsMet && !isPurchased);
    });

    const svg = this.getById('prestige-lines-info');
    if (!svg) return;
    svg.querySelectorAll('line').forEach(line => {
        const fromId = parseInt(line.dataset.from, 10);
        const toId = parseInt(line.dataset.to, 10);
        line.classList.toggle('active', this.gameState.prestigeUpgradeStatus[fromId] && this.gameState.prestigeUpgradeStatus[toId]);
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

    if (musicVolumeSlider){
        musicVolumeSlider.addEventListener('input', (e) => {
        localStorage.setItem('musicVolume', e.target.value);
        this.setzeLautstaerke();
    });
    }

    if (soundVolumeSlider){
        soundVolumeSlider.addEventListener('input', (e) => {
        localStorage.setItem('soundVolume', e.target.value);
        this.setzeLautstaerke();
    });
    }

    openSettingsButton?.addEventListener('click', (e) => {
        e.preventDefault();
        // Generiert den Code für den Export, bevor das Modal geöffnet wird
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

            // Kopieren in die Zwischenablage (robust für iFrame)
            try {
                navigator.clipboard.writeText(saveData).then(() => {
                    console.log("Spielstand in Zwischenablage kopiert.");
                }, () => {
                    // Fallback, wenn navigator.clipboard fehlschlägt
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
            // KORREKTUR: Zugriff auf die Klassenmethode
                if (this.ladeSpiel(saveData)) {
                    this.speichereSpiel();
                // Ein Neuladen ist notwendig, um die UI korrekt zu resetten
                // alert("Spielstand erfolgreich importiert! Die Seite wird neu geladen.");
                        location.reload();
            } else {
                 console.error("Import fehlgeschlagen. Überprüfe den Code.");
            }
        }
    });
}

ladeAudioEinstellungen(){
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

setzeLautstaerke(){

    const musicVolume = parseFloat(localStorage.getItem('musicVolume') || 100) /100;
    const soundVolume = parseFloat(localStorage.getItem('soundVolume') || 100) /100;

    const musicPlayer = this.getById('background-music');
    if (musicPlayer){
        musicPlayer.volume = musicVolume;
    }

    const clickSound = this.getById('click-sound');

    if (clickSound){
        clickSound.volume = soundVolume;
    }

}

//================================================================================================================
//--- 7. Info Seite Hilfsfunktionen (Rendering) ---
//================================================================================================================

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

    // Unique Buildings (Labor)
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

    // Geht alle Upgrades durch und rendert sie
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


createPrestigeUpgradeElements() {
    const container = this.getById('prestige-tree-container');
    const infoContainer = this.getById('info_prestige_container');

    const CONTAINER_WIDTH = 600;
    const centerX = CONTAINER_WIDTH / 2;
    const nodeOffset = 20;

    const containers = [];
    if (container) containers.push({element: container, isInfo: false});
    if (infoContainer) containers.push({element: infoContainer, isInfo: true});

    containers.forEach(({element, isInfo}) => {
        if (!element) return;
        element.innerHTML = '';

        // Den Container auf relative Positionierung setzen (wichtig für die Knoten)
        element.style.position = 'relative';

        // SVG-Viewbox muss definiert werden, damit die Linien sichtbar sind (z.B. 1000x1000)
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.id = isInfo ? 'prestige-lines-info' : 'prestige-lines';
        // Definiere die Größe der SVG basierend auf der maximalen Position + Rändern
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        element.appendChild(svg);

        // HINWEIS: Die SVG-Elemente müssen im HTML/CSS korrekt positioniert sein (z-index beachten)

        prestigeUpgrades.forEach(upgrade => {
            const upgradeDiv = document.createElement('div');
            upgradeDiv.className = `prestige-node ${isInfo ? 'info-node' : ''}`;
            upgradeDiv.dataset.id = upgrade.id;

            // Die Knotenpositionierung bleibt gut mit calc(50% + ...)
            upgradeDiv.style.left = `calc(50% + ${upgrade.x}px)`;
            upgradeDiv.style.top = `${upgrade.y}px`;

            upgradeDiv.dataset.description = upgrade.description;
            upgradeDiv.dataset.cost = this.formatNumber(upgrade.cost);

            const buyButton = isInfo ? '' : `<button class="prestige-buy-button" data-id="${upgrade.id}">Kaufen (${this.formatNumber(upgrade.cost)} PP)</button>`;

            const buyButtonHtml = isInfo
               ? ''
               : `<button class="prestige-buy-button" data-id="${upgrade.id}" style="display:none;"></button>`;

           upgradeDiv.innerHTML = `
               <div class="node-icon"></div>
               ${buyButtonHtml}
           `;
            element.appendChild(upgradeDiv);

            // Verbindungen zeichnen
            if (upgrade.requirements) {
                upgrade.requirements.forEach(reqId => {
                    const reqUpgrade = prestigeUpgrades.find(u => u.id === reqId);
                    if(reqUpgrade) {
                        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

                        // KORREKTUR: Verwenden von reinen Pixelwerten relativ zum SVG-Element.
                        // Wir müssen die '50%' Offset hier manuell einrechnen, wenn wir die CSS-Positionierung beibehalten.

                        // Annahme: Dein CSS zentriert den Baum um 50%.
                        // Wir verwenden die x/y Werte und addieren einen festen Offset (z.B. 500 für die Mitte des SVGs + 20px für die Knotenmitte)

                        // Dies ist eine Näherungslösung, da wir das CSS nicht kennen, aber es behebt den calc() Fehler in der SVG:
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

createPrestigeInfoTree() {
    // Rendert den Prestige-Baum im Info-Modal
    this.createPrestigeUpgradeElements();
    this.updatePrestigeInfoTree();
}

updatePrestigeInfoTree() {
    const treeContainer = this.getById('info_prestige_container');
    if (!treeContainer) return;

    // 1. KNOTEN-STATUS AKTUALISIEREN
    prestigeUpgrades.forEach(upgrade => {
        const node = treeContainer.querySelector(`.prestige-node[data-id="${upgrade.id}"]`);
        if (!node) return;

        const isPurchased = this.gameState.prestigeUpgradeStatus[upgrade.id];
        const requirementsMet = upgrade.requirements.every(reqId => this.gameState.prestigeUpgradeStatus[reqId]);

        // Fügt die Klassen 'purchased', 'available', 'locked' basierend auf dem Status hinzu
        node.classList.remove('purchased', 'available', 'locked');

        if (isPurchased) {
            node.classList.add('purchased');
        } else if (requirementsMet) {
            // Hier nutzen wir nur requirementsMet, da die Kosten auf der Info-Seite nicht relevant sind.
            node.classList.add('available');
        } else {
            node.classList.add('locked');
        }
    });

    // 2. LINIEN-STATUS AKTUALISIEREN (MUSSTE AUS DER obigen Schleife HERAUSGESCHOBEN WERDEN)
    const svg = this.getById('prestige-lines-info');
    if (svg) {
        svg.querySelectorAll('line').forEach(line => {
            const fromId = parseInt(line.dataset.from, 10);
            const toId = parseInt(line.dataset.to, 10);

            // Die Linie ist aktiv, wenn SOWOHL der Startknoten ALS AUCH der Endknoten gekauft sind
            // (oder wenn der Endknoten verfügbar ist, aber das ist komplizierter.)
            // Die sauberste Logik: Zeige die Verbindung, wenn sie freigeschaltet ist (fromId gekauft).
            const isFromPurchased = this.gameState.prestigeUpgradeStatus[fromId];

            // Wir setzen die Linie aktiv, wenn der Startpunkt gekauft ist.
            line.classList.toggle('active', isFromPurchased);
        });
    }
}


createInfoPetsElements() {
    const container = this.getById('info_pets_container');
    if (!container) return;
    container.innerHTML = '';

    container.innerHTML += `
        <div class="info-upgrade-item special">
            <h3>Tier-System (Pets)</h3>
            <p>Pets werden im Prestige Skill-Tree freigeschaltet und können mit Prestige-Punkten gekauft werden. Es kann immer nur ein Pet aktiv sein.</p>
        </div>
    `;

    petsData.forEach(pet => {
        let effectDetails;
        switch (pet.effectType) {
            case 'click_mult':
                effectDetails = `Erhöht die globale Klickkraft um ${(pet.effect * 100).toFixed(0)}%.`;
                if (pet.interval > 0) {
                    effectDetails += ` Zusätzlich: Automatischer Klick alle ${pet.interval}ms.`;
                }
                break;
            case 'sps_mult':
                effectDetails = `Erhöht die gesamte SPS-Produktion um ${(pet.effect * 100).toFixed(0)}%.`;
                break;
            case 'research_mult':
                effectDetails = `Erhöht die Forschungsrate um ${(pet.effect * 100).toFixed(0)}%.`;
                break;
            case 'cost_reduction':
                effectDetails = `Reduziert die Gebäudekosten um ${(pet.effect * 100).toFixed(0)}%.`;
                break;
            case 'prestige_point_eff':
                effectDetails = `Erhöht die Effektivität von Prestige-Punkten um ${(pet.effect * 100).toFixed(2)}% (additiv).`;
                break;
            default: effectDetails = 'Unbekannter Effekt.';
        }

        const item = document.createElement('div');
        item.className = 'info-upgrade-item';
        item.innerHTML = `
            <h3>${pet.name} (Kosten: ${this.formatNumber(pet.cost)} PP)</h3>
            <p><strong>Beschreibung:</strong> ${pet.description}</p>
            <p><strong>Effekt:</strong> ${effectDetails}</p>
        `;
        container.appendChild(item);
    });
}
}

