//================================================================================================================
//--- 1. Globale Variablen & Spieldaten ---
//================================================================================================================

const uniqueBuildingsData = [
    // Index 15 (RESEARCH_LAB_INDEX). Note: Index 0-14 sind reguläre Gebäude.
    { name: "Forschungslabor", basePrice: 5000000, growthRate: 1.3, isSpecial: true, maxCount: 1, baseSPS: 5, prestigeMulti: 1, researchMultiplier: 1},
];
const RESEARCH_LAB_INDEX = 15; // Index des Forschungslabors im State-Array (15 reguläre = Index 0-14. Lab ist Index 15)


const buildingsData = [
    { name: "Auto-Klicker", basePrice: 20, growthRate: 1.10, baseSPS: 2, prestigeMulti: 1},
    { name: "Smiley-Baum", basePrice: 100, growthRate: 1.15, baseSPS: 20, prestigeMulti: 1},
    { name: "Smiley-Fabrik", basePrice: 1000, growthRate: 1.20, baseSPS: 150, prestigeMulti: 1},
    { name: "Smiley-Mine", basePrice: 10000, growthRate: 1.25, baseSPS: 1000, prestigeMulti: 1},
    { name: "Smiley-Bohrer", basePrice: 50000, growthRate: 1.30, baseSPS: 5000, prestigeMulti: 1},
    { name: "Smiley-Kernkraftwerk", basePrice: 250000, growthRate: 1.35, baseSPS: 25000, prestigeMulti: 1},
    { name: "Smiley-Galaxie", basePrice: 1250000, growthRate: 1.40, baseSPS: 125000, prestigeMulti: 1},
    { name: "Dimensionsportal", basePrice: 6250000, growthRate: 1.45, baseSPS: 625000, prestigeMulti: 1},
    { name: "Zeitmaschine", basePrice: 31250000, growthRate: 1.50, baseSPS: 3125000, prestigeMulti: 1},
    { name: "Meta-Klicker", basePrice: 156250000, growthRate: 1.55, baseSPS: 15625000, prestigeMulti: 1},
    { name: "Quanten-Netzwerk", basePrice: 781250000, growthRate: 1.60, baseSPS: 78125000, prestigeMulti: 1},
    { name: "Endloser Speicher", basePrice: 3906250000, growthRate: 1.65, baseSPS: 390625000, prestigeMulti: 1},
    { name: "Ursprung", basePrice: 19531250000, growthRate: 1.70, baseSPS: 1953125000, prestigeMulti: 1},
    { name: "Kosmische Einheit", basePrice: 97656250000, growthRate: 1.75, baseSPS: 9765625000, prestigeMulti: 1},
    { name: "Absoluter Schöpfer", basePrice: 488281250000, growthRate: 1.80, baseSPS: 48828125000, prestigeMulti: 1},
];

// NOTE: Die buildingIndex Werte für Research-Upgrades sind jetzt 0-14 (da das Labor Index 3 wegfiel)
const researchUpgrades = [
    { id: 0, cost: 10, description: 'Auto-Klicker Prod. +10%', type: 'building_mult', buildingIndex: 0, value: 0.1 },
    { id: 1, cost: 50, description: 'Auto-Klicker Prod. +15%', type: 'building_mult', buildingIndex: 0, value: 0.15 },
    { id: 2, cost: 200, description: 'Auto-Klicker Prod. +25%', type: 'building_mult', buildingIndex: 0, value: 0.25 },
    { id: 3, cost: 750, description: 'Auto-Klicker Prod. +50%', type: 'building_mult', buildingIndex: 0, value: 0.5 },
    { id: 4, cost: 50, description: 'Smiley-Baum Prod. +10%', type: 'building_mult', buildingIndex: 1, value: 0.1 },
    { id: 5, cost: 250, description: 'Smiley-Baum Prod. +15%', type: 'building_mult', buildingIndex: 1, value: 0.15 },
    { id: 6, cost: 1000, description: 'Smiley-Baum Prod. +25%', type: 'building_mult', buildingIndex: 1, value: 0.25 },
    { id: 7, cost: 3750, description: 'Smiley-Baum Prod. +50%', type: 'building_mult', buildingIndex: 1, value: 0.5 },
    { id: 8, cost: 250, description: 'Smiley-Fabrik Prod. +10%', type: 'building_mult', buildingIndex: 2, value: 0.1 },
    { id: 9, cost: 1250, description: 'Smiley-Fabrik Prod. +15%', type: 'building_mult', buildingIndex: 2, value: 0.15 },
    { id: 10, cost: 5000, description: 'Smiley-Fabrik Prod. +25%', type: 'building_mult', buildingIndex: 2, value: 0.25 },
    { id: 11, cost: 18750, description: 'Smiley-Fabrik Prod. +50%', type: 'building_mult', buildingIndex: 2, value: 0.5 },
    { id: 12, cost: 1000, description: 'Smiley-Mine Prod. +10%', type: 'building_mult', buildingIndex: 3, value: 0.1 },
    { id: 13, cost: 5000, description: 'Smiley-Mine Prod. +15%', type: 'building_mult', buildingIndex: 3, value: 0.15 },
    { id: 14, cost: 20000, description: 'Smiley-Mine Prod. +25%', type: 'building_mult', buildingIndex: 3, value: 0.25 },
    { id: 15, cost: 70000, description: 'Smiley-Mine Prod. +50%', type: 'building_mult', buildingIndex: 3, value: 0.5 },
    { id: 16, cost: 5000, description: 'Smiley-Bohrer Prod. +10%', type: 'building_mult', buildingIndex: 4, value: 0.1 },
    { id: 17, cost: 25000, description: 'Smiley-Bohrer Prod. +15%', type: 'building_mult', buildingIndex: 4, value: 0.15 },
    { id: 18, cost: 100000, description: 'Smiley-Bohrer Prod. +25%', type: 'building_mult', buildingIndex: 4, value: 0.25 },
    { id: 19, cost: 350000, description: 'Smiley-Bohrer Prod. +50%', type: 'building_mult', buildingIndex: 4, value: 0.5 },
    { id: 20, cost: 25000, description: 'Kernkraftwerk Prod. +10%', type: 'building_mult', buildingIndex: 5, value: 0.1 },
    { id: 21, cost: 125000, description: 'Kernkraftwerk Prod. +15%', type: 'building_mult', buildingIndex: 5, value: 0.15 },
    { id: 22, cost: 500000, description: 'Kernkraftwerk Prod. +25%', type: 'building_mult', buildingIndex: 5, value: 0.25 },
    { id: 23, cost: 1750000, description: 'Kernkraftwerk Prod. +50%', type: 'building_mult', buildingIndex: 5, value: 0.5 },
    { id: 24, cost: 125000, description: 'Galaxie Prod. +10%', type: 'building_mult', buildingIndex: 6, value: 0.1 },
    { id: 25, cost: 625000, description: 'Galaxie Prod. +15%', type: 'building_mult', buildingIndex: 6, value: 0.15 },
    { id: 26, cost: 2500000, description: 'Galaxie Prod. +25%', type: 'building_mult', buildingIndex: 6, value: 0.25 },
    { id: 27, cost: 12500000, description: 'Galaxie Prod. +50%', type: 'building_mult', buildingIndex: 6, value: 0.5 },
    { id: 28, cost: 625000, description: 'Dimensionsportal Prod. +10%', type: 'building_mult', buildingIndex: 7, value: 0.1 },
    { id: 29, cost: 3125000, description: 'Dimensionsportal Prod. +15%', type: 'building_mult', buildingIndex: 7, value: 0.15 },
    { id: 30, cost: 12500000, description: 'Dimensionsportal Prod. +25%', type: 'building_mult', buildingIndex: 7, value: 0.25 },
    { id: 31, cost: 62500000, description: 'Dimensionsportal Prod. +50%', type: 'building_mult', buildingIndex: 7, value: 0.5 },
    { id: 32, cost: 3125000, description: 'Zeitmaschine Prod. +10%', type: 'building_mult', buildingIndex: 8, value: 0.1 },
    { id: 33, cost: 15625000, description: 'Zeitmaschine Prod. +15%', type: 'building_mult', buildingIndex: 8, value: 0.15 },
    { id: 34, cost: 62500000, description: 'Zeitmaschine Prod. +25%', type: 'building_mult', buildingIndex: 8, value: 0.25 },
    { id: 35, cost: 312500000, description: 'Zeitmaschine Prod. +50%', type: 'building_mult', buildingIndex: 8, value: 0.5 },
    { id: 36, cost: 15625000, description: 'Meta-Klicker Prod. +10%', type: 'building_mult', buildingIndex: 9, value: 0.1 },
    { id: 37, cost: 78125000, description: 'Meta-Klicker Prod. +15%', type: 'building_mult', buildingIndex: 9, value: 0.15 },
    { id: 38, cost: 312500000, description: 'Meta-Klicker Prod. +25%', type: 'building_mult', buildingIndex: 9, value: 0.25 },
    { id: 39, cost: 1562500000, description: 'Meta-Klicker Prod. +50%', type: 'building_mult', buildingIndex: 9, value: 0.5 },
    { id: 40, cost: 78125000, description: 'Quanten-Netzwerk Prod. +10%', type: 'building_mult', buildingIndex: 10, value: 0.1 },
    { id: 41, cost: 390625000, description: 'Quanten-Netzwerk Prod. +15%', type: 'building_mult', buildingIndex: 10, value: 0.15 },
    { id: 42, cost: 1562500000, description: 'Quanten-Netzwerk Prod. +25%', type: 'building_mult', buildingIndex: 10, value: 0.25 },
    { id: 43, cost: 7812500000, description: 'Quanten-Netzwerk Prod. +50%', type: 'building_mult', buildingIndex: 10, value: 0.5 },
    { id: 44, cost: 390625000, description: 'Endloser Speicher Prod. +10%', type: 'building_mult', buildingIndex: 11, value: 0.1 },
    { id: 45, cost: 1953125000, description: 'Endloser Speicher Prod. +15%', type: 'building_mult', buildingIndex: 11, value: 0.15 },
    { id: 46, cost: 7812500000, description: 'Endloser Speicher Prod. +25%', type: 'building_mult', buildingIndex: 11, value: 0.25 },
    { id: 47, cost: 39062500000, description: 'Endloser Speicher Prod. +50%', type: 'building_mult', buildingIndex: 11, value: 0.5 },
    { id: 48, cost: 1953125000, description: 'Ursprung Prod. +10%', type: 'building_mult', buildingIndex: 12, value: 0.1 },
    { id: 49, cost: 9765625000, description: 'Ursprung Prod. +15%', type: 'building_mult', buildingIndex: 12, value: 0.15 },
    { id: 50, cost: 39062500000, description: 'Ursprung Prod. +25%', type: 'building_mult', buildingIndex: 12, value: 0.25 },
    { id: 51, cost: 195312500000, description: 'Ursprung Prod. +50%', type: 'building_mult', buildingIndex: 12, value: 0.5 },
    { id: 52, cost: 9765625000, description: 'Kosmische Einheit Prod. +10%', type: 'building_mult', buildingIndex: 13, value: 0.1 },
    { id: 53, cost: 48828125000, description: 'Kosmische Einheit Prod. +15%', type: 'building_mult', buildingIndex: 13, value: 0.15 },
    { id: 54, cost: 195312500000, description: 'Kosmische Einheit Prod. +25%', type: 'building_mult', buildingIndex: 13, value: 0.25 },
    { id: 55, cost: 976562500000, description: 'Kosmische Einheit Prod. +50%', type: 'building_mult', buildingIndex: 13, value: 0.5 },
    { id: 56, cost: 48828125000, description: 'Absoluter Schöpfer Prod. +10%', type: 'building_mult', buildingIndex: 14, value: 0.1 },
    { id: 57, cost: 244140625000, description: 'Absoluter Schöpfer Prod. +15%', type: 'building_mult', buildingIndex: 14, value: 0.15 },
    { id: 58, cost: 976562500000, description: 'Absoluter Schöpfer Prod. +25%', type: 'building_mult', buildingIndex: 14, value: 0.25 },
    { id: 59, cost: 4882812500000, description: 'Absoluter Schöpfer Prod. +50%', type: 'building_mult', buildingIndex: 14, value: 0.5 },
    { id: 60, cost: 100, description: 'Globale Klick-Kraft +5%', type: 'click_mult', value: 0.05 },
    { id: 61, cost: 500, description: 'Globale Klick-Kraft +10%', type: 'click_mult', value: 0.1 },
    { id: 62, cost: 1500, description: 'Globale Klick-Kraft +15%', type: 'click_mult', value: 0.15 },
];

const prestigeUpgrades = [
    { id: 0, cost: 1, description: 'Starte mit einem permanenten +10% SPS-Bonus', type: 'global_sps_mult', value: 0.1, x: 0, y: 0, requirements: [] },
    { id: 1, cost: 2, description: 'Permanenter globaler Klick-Multiplikator +25%', type: 'global_click_mult', value: 0.25, x: -100, y: 100, requirements: [0] },
    { id: 2, cost: 2, description: 'Erhöhe den Forschungs-Output um 50%', type: 'research_lab_mult', value: 0.5, x: 100, y: 100, requirements: [0] },
    { id: 3, cost: 5, description: 'Erhöhe die Effektivität von Prestige-Punkten um 0.1% (additiv)', type: 'prestige_point_eff', value: 0.001, x: 0, y: 200, requirements: [1, 2] },
    { id: 4, cost: 3, description: 'Auto-Klicker & Smiley-Bäume sind 50% günstiger', type: 'building_cost_reduction', buildingIndices: [0, 1], value: 0.5, x: -200, y: 200, requirements: [1] },
    { id: 5, cost: 3, description: 'Schalte einen neuen globalen Bonus frei: +1% SPS pro Prestige-Reset', type: 'prestige_reset_bonus', value: 0.01, x: 200, y: 200, requirements: [2] },
    { id: 6, cost: 10, description: 'Verbessere den globalen Klick-Multiplikator um weitere 50%', type: 'global_click_mult', value: 0.5, x: -100, y: 300, requirements: [3, 4] },
    { id: 7, cost: 10, description: 'Der Bonus pro Prestige-Reset wird verdoppelt', type: 'prestige_reset_bonus', value: 0.01, x: 100, y: 300, requirements: [3, 5] },
    { id: 8, cost: 50, description: 'Schalte das Pet-System frei.', type: 'unlock_pets', value: 0, x: -200, y: 400, requirements: [6] }, // Geändert von 15 auf 50 (für Pets)
    { id: 9, cost: 15, description: 'Schalte die Diamanten-Mine frei.', type: 'unlock_mine', value: 0, x: 200, y: 400, requirements: [7] },
    { id: 10, cost: 50, description: 'Schalte das Gilden-System frei.', type: 'unlock_guilds', value: 0, x: 0, y: 500, requirements: [8, 9] },
];

const petsData = [
    { id: 'pet_dog', name: 'Fluffy der Klick-Hund', cost: 10, effect: 0.05, effectType: 'click_mult', description: '+5% Klickkraft.', img: 'pet_dog.png.png', interval: 100 },
    { id: 'pet_cat', name: 'Miau der SPS-Booster', cost: 20, effect: 0.10, effectType: 'sps_mult', description: '+10% SPS-Rate.', img: 'pet_cat.png.png', interval: 0 },
    { id: 'pet_owl', name: 'Hoot der Forscher', cost: 30, effect: 0.25, effectType: 'research_mult', description: '+25% Forschungsrate.', img: 'pet_owl.png.png', interval: 0 },
    { id: 'pet_fish', name: 'Finny der Ökonom', cost: 50, effect: 0.05, effectType: 'cost_reduction', description: '5% Kostenreduktion aller Gebäude.', img: 'pet_fish.png.png', interval: 0 },
    { id: 'pet_chameleon', name: 'Tarn-Chamaeleon', cost: 100, effect: 0.01, effectType: 'prestige_point_eff', description: '+0.01% PP-Effektivität.', img: 'pet_chameleon.png.png', interval: 0 },
];

let gameInstance;

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

            // --- Feature-States ---
            petsUnlocked: false,
            petAutoClickTimer: 0,
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
        this.createPrestigeUpgradeElements();

        this.setupMainEventListeners();
        this.setupPrestigeEventListeners();
        this.setupInfoPageEventListeners();

        this.startIntervals();

        this.updateUI();
    }

   startIntervals(){
    this.productionInterval = setInterval(() => this.produziereSmileys(), 100);
    this.uiInterval = setInterval(() => this.updateUI(), 1000);
    this.saveInterval = setInterval(() => this.speichereSpiel(), 5000);
    window.addEventListener('beforunload', () => this.speichereSpiel());
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
            this.applyAllBoni();
            return false;
        }

        const jsonString = atob(dataToLoad);
        let allData = JSON.parse(jsonString);

           if (allData.buildingCounts) {
            console.warn("Migration: Alter Spielstand erkannt. Daten werden in gameState verschoben.");
            allData.gameState.buildingCounts = allData.gameState.buildingCounts || allData.buildingCounts;
            allData.gameState.buildingPrices = allData.gameState.buildingPrices || allData.buildingPrices;
            allData.gameState.researchStatus = allData.gameState.researchStatus || allData.researchStatus;
            allData.gameState.prestigeUpgradeStatus = allData.gameState.prestigeUpgradeStatus || allData.prestigeUpgradeStatus;
        }

        this.gameState = {
            ...this.gameState,
            ...allData.gameState
};

        const balanceVersion = localStorage.getItem('balanceVersion');
        if (this.gameState.gesamt_prestige_punkte > 10000 && balanceVersion !== '2') {
             alert("Dein Spielstand wurde aufgrund einer wichtigen Balance-Änderung angepasst. Deine Prestigepunkte und Skill-Tree-Upgrades wurden zurückgesetzt, um das Spiel fair zu halten. Dein restlicher Fortschritt bleibt erhalten.");
             this.gameState.gesamt_prestige_punkte = 0;
             this.gameState.prestige_punkte_verfügbar = 0;
             this.gameState.prestigeUpgradeStatus.fill(false); // NEU: Zugriff auf zentralisiertes Array
             localStorage.setItem('balanceVersion', '2');
        }

        this.applyAllBoni(); // Korrekt: this.
        if (document.body.className !== 'settings-page' && typeof this.updateUI === 'function') {
            this.updateUI();
        }
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
            if(!upgrade) return;

            if(upgrade.type === 'building_mult') {
                buildingsData[upgrade.buildingIndex].prestigeMulti += upgrade.value;
            } else if (upgrade.type === 'click_mult') {
                baseClickMultiplier += upgrade.value;
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
    if (typeof updateUI === 'function') {
        this.updateUI();
    }
}

produziereSmileys() {
    const timeFactor = 0.1;
    if (this.gameState.totalSPS > 0) {
        this.gameState.aktuelle_smileys += this.gameState.totalSPS * timeFactor;
        this.gameState.gesammelte_smileys += this.gameState.totalSPS * timeFactor;
    }

    // Forschungslabor-Produktion (Research Points)
    if (this.gameState.buildingCounts[RESEARCH_LAB_INDEX] > 0) {
        // Research Lab base production is 1 RP/s
        const lab = uniqueBuildingsData[0];
        const researchRate = 1 * this.gameState.buildingCounts[RESEARCH_LAB_INDEX] * (lab.researchMultiplier || 1);
        this.gameState.forschungPunkte += researchRate * timeFactor;
    }

    // Pet-Logik (Auto-Click)
    if (this.gameState.activePet) {
        const pet = petsData.find(p => p.id === this.gameState.activePet);
        if (pet && pet.effectType === 'auto_click' && pet.interval > 0) {
            this.gameState.petAutoClickTimer += 1;
            if (this.gameState.petAutoClickTimer >= pet.interval) {
                this.klickeSmiley();
                this.gameState.petAutoClickTimer = 0;
            }
        }
    }

    this.speichereSpiel(); // Speichere Spiel alle 100ms
}

computeTotalSPS() {
    let sps = 0;

    // Zähle reguläre Gebäude (Index 0 bis 14)
    buildingsData.forEach((item, index) => {
        sps += (this.gameState.buildingCounts[index] || 0) * (item.baseSPS || 0) * (item.prestigeMulti || 1);
    });

    // Wende den globalen Multiplikator an (inkl. Prestige, Resets, Pet-Boni)
    this.gameState.totalSPS = sps * this.gameState.globalerPrestigeMultiplikator;
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
        buildingPrices[index] = this.calculateNextCost(item.basePrice, nextCount, item.growthRate, index);

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
    this.applyAllBoni();
    this.updateUI();
    this.speichereSpiel();
}

kaufePrestigeUpgrade(id) {
    const upgrade = prestigeUpgrades.find(u => u.id === id);
    const requirementsMet = upgrade.requirements.every(reqId => this.gameState.prestigeUpgradeStatus[reqId]);

    if (!upgrade || this.gameState.prestigeUpgradeStatus[id] || this.gameState.prestige_punkte_verfügbar < upgrade.cost || !requirementsMet) return;

    this.gameState.prestige_punkte_verfügbar -= upgrade.cost;
    this.gameState.prestigeUpgradeStatus[id] = true;

    this.applyAllBoni();
    this.updatePRestigeUI();
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

    this.applyAllBoni(); // Wichtig: Boni neu anwenden, um den Effekt zu sehen
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

renderPetShop() {
    const petGrid = this.getById('pet-shop-grid');
    if (!petGrid) return;
    petGrid.innerHTML = '';

    petsData.forEach(pet => {
        const petDiv = document.createElement('div');
        petDiv.className = 'pet-item';
        petDiv.dataset.id = pet.id;

        let bonusText;
        switch (pet.effectType) {
            case 'click_mult': bonusText = `+${(pet.effect * 100).toFixed(0)}% Klickkraft`; break;
            case 'sps_mult': bonusText = `+${(pet.effect * 100).toFixed(0)}% globale SPS`; break;
            case 'research_mult': bonusText = `+${(pet.effect * 100).toFixed(0)}% Forschungsrate`; break;
            case 'cost_reduction': bonusText = `-${(pet.effect * 100).toFixed(0)}% Kostenreduktion`; break;
            case 'auto_click': bonusText = `Auto-Klick alle ${pet.interval / 10} Sek.`; break;
            default: bonusText = 'Unbekannter Bonus';
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
}

updateResearchUI() {
    const labContent = this.getById('lab-main-content');
    const purchaseContainer = this.getById('lab-purchase-container');
    if (!labContent || !purchaseContainer) return;

    const labOwned = this.gameState.buildingCounts[RESEARCH_LAB_INDEX] > 0;

    // UI-Elemente für das Labor ein-/ausblenden
    purchaseContainer.style.display = labOwned ? 'none' : 'block';
    labContent.style.display = labOwned ? 'block' : 'none';

    if (labOwned) {
        this.getById('forschungspunkte').innerText = this.formatNumber(this.gameState.forschungPunkte);
        // Forschungsrate für das Lab Label anzeigen
        const labCountElement = this.getById('forschungslabor_count_anzeige');
        if(labCountElement) labCountElement.innerText = this.gameState.buildingCounts[RESEARCH_LAB_INDEX];
    } else {
        const labButton = this.getById('forschungslaborButton');
    if (labButton) {
        // KORREKTUR: Muss this. verwenden
        const labCost = this.calculateNextCost(uniqueBuildingsData[0].basePrice, 0, uniqueBuildingsData[0].growthRate, RESEARCH_LAB_INDEX);
        labButton.innerText = `Kaufen (${this.formatNumber(labCost)})`;
        labButton.disabled = this.gameState.aktuelle_smileys < labCost;
    }

    const nextUpgradeContainer = this.getById('next-research-container');
    if (!nextUpgradeContainer) return;

    const nextUpgrade = researchUpgrades.find(upgrade => !this.gameState.researchStatus[upgrade.id]);

    // UI für nächstes Upgrade rendern
    if (!nextUpgrade) {
        nextUpgradeContainer.innerHTML = '<h4>Alle Forschungen abgeschlossen!</h4>';
        return;
    }

    const canAfford = this.gameState.forschungPunkte >= nextUpgrade.cost;

    nextUpgradeContainer.innerHTML = `
        <h4>Nächstes Upgrade:</h4>
        <div class="research-item" data-id="${nextUpgrade.id}">
            <p>${nextUpgrade.description}</p>
            <p>Kosten: ${this.formatNumber(nextUpgrade.cost)} RP</p>
            <button class="btn-buy-research" id="buy-research-${nextUpgrade.id}">
                Forschen
            </button>
        </div>
    `;

    const btn = nextUpgradeContainer.querySelector('.btn-buy-research');
    if (btn) {
        btn.disabled = !canAfford || !labOwned;
    }
}}

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
    this.getById('aktuelle_smileys').innerText = this.formatNumber(this.gameState.aktuelle_smileys);
    this.getById('smileys_pro_sekunde_anzeige').innerText = this.formatNumber(this.gameState.totalSPS);
    this.getById('smileys_pro_minute_anzeige').innerText = this.formatNumber(this.gameState.totalSPS * 60);
    this.getById('smileys_pro_klick_anzeige').innerText = this.formatNumber(this.gameState.klickKraft * this.gameState.klickKraftMultiplier);

    // Stat Multiplikatoren
    const klickMultiDisplay = this.getById('klick_multiplikator_anzeige');
    if (klickMultiDisplay) klickMultiDisplay.innerText = `x${this.gameState.klickKraftMultiplier.toFixed(2)}`;
    const globalMultiDisplay = this.getById('globaler_multiplikator_anzeige');
    if (globalMultiDisplay) globalMultiDisplay.innerText = `x${this.gameState.globalerPrestigeMultiplikator.toFixed(2)}`;

    this.updateBuildingUI();
    this.updateResearchUI();
    this.updatePetButtons(); // Pet Buttons aktualisieren

    // Prestige Progress Bar Update
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
        // Linien aktualisieren... (Teil der Prestige Map Logik)
    }
}


//================================================================================================================
//--- 6. Event Listener Setup ---
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
            const pointsToGainElement = this.getById('prestige_points_to_gain');
            if(pointsToGainElement) pointsToGainElement.innerText = pointsToGain;
            if(prestigeModal) prestigeModal.style.display = 'flex';
        }
    });

    closePrestigeModalButton?.addEventListener('click', () => { if(prestigeModal) prestigeModal.style.display = 'none'; });

    confirmPrestigeButton?.addEventListener('click', () => {
        this.prestigeReset();
        if(prestigeModal) prestigeModal.style.display = 'none';
    });

    // Skill Tree Modal Logic
    const skillTreeModal = this.getById('skill_tree_modal');
    const openSkillTreeButton = this.getById('open_skill_tree_button');
    const closeSkillTreeButton = this.getById('close_skill_tree_button');

    openSkillTreeButton?.addEventListener('click', () => {
        createPrestigeUpgradeElements(); // Rendere den Baum
        this.updatePRestigeUI(); // UI-Elemente im Baum aktualisieren
        if(skillTreeModal) skillTreeModal.style.display = 'flex';
    });
    closeSkillTreeButton?.addEventListener('click', () => { if(skillTreeModal) skillTreeModal.style.display = 'none'; });

    this.getById('prestige-tree-container')?.addEventListener('click', (e) => {
        const node = e.target.closest('.prestige-node');
        if (!node) return;
        const id = parseInt(node.dataset.id, 10);
        if (!isNaN(id)) this.kaufePrestigeUpgrade(id);
    });

    const resetPrestigeUpgradesButton = this.getById('reset_prestige_upgrades_button');
    resetPrestigeUpgradesButton?.addEventListener('click', () => this.resetPrestigeUpgrades());
}
    setupInfoPageEventListeners() {

    const buildingsModal = this.getById('buildings_info_modal');
    const openBuildingsButton = this.getById('show_buildings_button');
    const closeBuildingsButton = this.getById('close_buildings_info_button');
    openBuildingsButton?.addEventListener('click', () => {
        this.createBuildingInfoElements(); // Elemente erstellen
        if(buildingsModal) buildingsModal.style.display = 'flex';
    });
    closeBuildingsButton?.addEventListener('click', () => {if(buildingsModal) buildingsModal.style.display = 'none';});

    const researchModal = this.getById('research_info_modal');
    const openResearchButton = this.getById('show_research_button');
    const closeResearchButton = this.getById('close_research_info_button');
    openResearchButton?.addEventListener('click', () => {
        this.createResearchInfoElements(); // Elemente erstellen
        if(researchModal) researchModal.style.display = 'flex';
    });
    closeResearchButton?.addEventListener('click', () => {if(researchModal) researchModal.style.display = 'none';});

    const openPrestigeButton = this.getById('show_prestige_button');
    const closePrestigeButton = this.getById('close_prestige_info_button');
    openPrestigeButton?.addEventListener('click', () => {
        this.createPrestigeInfoTree(); // Baum einmal rendern (oder updaten)
        if(prestigeModal) prestigeModal.style.display = 'flex';
    });
    closePrestigeButton?.addEventListener('click', () => {if(prestigeModal) prestigeModal.style.display = 'none';});

    const statsModal = this.getById('stats_info_modal');
    const openStatsButton = this.getById('show_stats_button');
    const closeStatsButton = this.getById('close_stats_info_button');
    openStatsButton?.addEventListener('click', () => {
        this.createInfoStatsElements(); // Stats Elemente rendern
        if(statsModal) statsModal.style.display = 'flex';
    });
    closeStatsButton?.addEventListener('click', () => {if(statsModal) statsModal.style.display = 'none';});
}

setupSettingsModalListeners() {
    const settingsModal = this.getById('settings-modal');
    const openSettingsButton = this.getById('open-settings-button');
    const closeSettingsButton = this.getById('close-settings-button');
    const exportButton = this.getById('export-save-button');
    const importButton = this.getById('import-save-button');
    const saveDataTextarea = this.getById('save-data-textarea');

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
            if (ladeSpiel(saveData)) {
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

//================================================================================================================
//--- 7. Initialisierung der Seiten ---
//================================================================================================================



//================================================================================================================
//--- 8. Info Seite Hilfsfunktionen (Rendering) ---
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
    // Funktioniert als Renderer für den Prestige-Shop und für den Info-Baum
    const container = this.getById('prestige-tree-container');
    const infoContainer = this.getById('info_prestige_container');

    // Definiere die Zielcontainer
    const containers = [];
    if (container) containers.push({element: container, isInfo: false});
    if (infoContainer) containers.push({element: infoContainer, isInfo: true});

    containers.forEach(({element, isInfo}) => {
        if (!element) return;
        element.innerHTML = '';

        // Code zum Erstellen der SVG-Linien und Prestige-Knoten
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.id = isInfo ? 'prestige-lines-info' : 'prestige-lines';
        element.appendChild(svg);

        prestigeUpgrades.forEach(upgrade => {
            const upgradeDiv = document.createElement('div');
            upgradeDiv.className = `prestige-node ${isInfo ? 'info-node' : ''}`;
            upgradeDiv.dataset.id = upgrade.id;
            // Nutze die festen x/y Koordinaten in den Daten
            upgradeDiv.style.left = `calc(50% + ${upgrade.x}px)`;
            upgradeDiv.style.top = `${upgrade.y}px`;

            const buyButton = isInfo ? '' : `<button class="prestige-buy-button" data-id="${upgrade.id}">Kaufen (${this.formatNumber(upgrade.cost)} PP)</button>`;

            // Simpler Node-Inhalt
            upgradeDiv.innerHTML = `
                <div class="node-inner">
                    <div class="node-icon"></div>
                    <div class="node-name">${upgrade.description}</div>
                    <div class="node-cost">Kosten: ${this.formatNumber(upgrade.cost)} PP</div>
                    ${buyButton}
                </div>
            `;
            element.appendChild(upgradeDiv);

            // Verbindungen zeichnen
            upgrade.requirements.forEach(reqId => {
                const reqUpgrade = prestigeUpgrades.find(u => u.id === reqId);
                if(reqUpgrade) {
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    // Platzhalter für Linien (die exakte SVG-Pfad-Logik ist komplex)
                    line.setAttribute('x1', `calc(50% + ${reqUpgrade.x}px + 20px)`);
                    line.setAttribute('y1', `${reqUpgrade.y + 20}px`);
                    line.setAttribute('x2', `calc(50% + ${upgrade.x}px + 20px)`);
                    line.setAttribute('y2', `${upgrade.y + 20}px`);
                    line.setAttribute('class', 'prestige-line');
                    line.dataset.from = reqId;
                    line.dataset.to = upgrade.id;
                    svg.appendChild(line);
                }
            });
        });

        if (isInfo) updatePrestigeInfoTree(); // Sofortiger Update für Info-Seite
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

    // Status aktualisieren (gekaufte, verfügbare)
    prestigeUpgrades.forEach(upgrade => {
        const node = treeContainer.querySelector(`.prestige-node[data-id="${upgrade.id}"]`);
        if (!node) return;
        const isPurchased = this.gameState.prestigeUpgradeStatus[upgrade.id];

        node.classList.toggle('purchased', isPurchased);

        // Linienstatus
        const requirementsMet = upgrade.requirements.every(reqId => this.gameState.prestigeUpgradeStatus[reqId]);
        const svg = this.getById('prestige-lines-info');
        if (svg) {
svg.querySelectorAll('line').forEach(line => {
                const fromId = parseInt(line.dataset.from, 10);
                const toId = parseInt(line.dataset.to, 10);
                // ... Logik ...
                if (this.gameState.prestigeUpgradeStatus[fromId] && this.gameState.prestigeUpgradeStatus[toId]) {
                    line.classList.add('active');
                } else {
                    line.classList.remove('active');
                }
            }); // <--- DIESE KLAMMER FEHLTE FÜR DIE forEach(line)
        }
    }); // Schließt die prestigeUpgrades.forEach
} // <--- DIESE KLAMMER SCHLIESST updatePrestigeInfoTree()

// HIER MUSS DIE KLAMMER DER KLASSE FOLGEN:
} // <--- [WICHTIG] DIESE KLAMMER SCHLIESST DIE GESAMTE KLASSE SmileyGame

document.addEventListener('DOMContentLoaded', () => {
    gameInstance = new SmileyGame();
});
