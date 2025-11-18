document.addEventListener('DOMContentLoaded', () => {
    initialisiereSpiel();
});

//================================================================================================================
//--- 1. Globale Variablen & Spieldaten ---
//================================================================================================================

const buildingsData = [
    { name: "Auto-Klicker", basePrice: 20, growthRate: 1.10, baseSPS: 1, prestigeMulti: 1},
    { name: "Smiley-Baum", basePrice: 100, growthRate: 1.15, baseSPS: 20, prestigeMulti: 1},
    { name: "Smiley-Fabrik", basePrice: 1000, growthRate: 1.20, baseSPS: 150, prestigeMulti: 1},
    { name: "Forschungslabor", basePrice: 5000000, growthRate: 1.3, isSpecial: true, maxCount: 1},
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

const researchUpgrades = [
    { id: 0, cost: 10, description: 'Auto-Klicker Prod. +10%', type: 'building_mult', buildingIndex: 0, value: 0.1 },
    { id: 1, cost: 50, description: 'Auto-Klicker Prod. +15%', type: 'building_mult', buildingIndex: 0, value: 0.15 },
    { id: 2, cost: 200, description: 'Auto-Klicker Prod. +25%', type: 'building_mult', buildingIndex: 0, value: 0.25 },
    { id: 3, cost: 1000, description: 'Auto-Klicker Prod. +50%', type: 'building_mult', buildingIndex: 0, value: 0.5 },
    { id: 4, cost: 50, description: 'Smiley-Baum Prod. +10%', type: 'building_mult', buildingIndex: 1, value: 0.1 },
    { id: 5, cost: 250, description: 'Smiley-Baum Prod. +15%', type: 'building_mult', buildingIndex: 1, value: 0.15 },
    { id: 6, cost: 1000, description: 'Smiley-Baum Prod. +25%', type: 'building_mult', buildingIndex: 1, value: 0.25 },
    { id: 7, cost: 5000, description: 'Smiley-Baum Prod. +50%', type: 'building_mult', buildingIndex: 1, value: 0.5 },
    { id: 8, cost: 250, description: 'Smiley-Fabrik Prod. +10%', type: 'building_mult', buildingIndex: 2, value: 0.1 },
    { id: 9, cost: 1250, description: 'Smiley-Fabrik Prod. +15%', type: 'building_mult', buildingIndex: 2, value: 0.15 },
    { id: 10, cost: 5000, description: 'Smiley-Fabrik Prod. +25%', type: 'building_mult', buildingIndex: 2, value: 0.25 },
    { id: 11, cost: 25000, description: 'Smiley-Fabrik Prod. +50%', type: 'building_mult', buildingIndex: 2, value: 0.5 },
    { id: 12, cost: 1000, description: 'Smiley-Mine Prod. +10%', type: 'building_mult', buildingIndex: 4, value: 0.1 },
    { id: 13, cost: 5000, description: 'Smiley-Mine Prod. +15%', type: 'building_mult', buildingIndex: 4, value: 0.15 },
    { id: 14, cost: 20000, description: 'Smiley-Mine Prod. +25%', type: 'building_mult', buildingIndex: 4, value: 0.25 },
    { id: 15, cost: 100000, description: 'Smiley-Mine Prod. +50%', type: 'building_mult', buildingIndex: 4, value: 0.5 },
    { id: 16, cost: 5000, description: 'Smiley-Bohrer Prod. +10%', type: 'building_mult', buildingIndex: 5, value: 0.1 },
    { id: 17, cost: 25000, description: 'Smiley-Bohrer Prod. +15%', type: 'building_mult', buildingIndex: 5, value: 0.15 },
    { id: 18, cost: 100000, description: 'Smiley-Bohrer Prod. +25%', type: 'building_mult', buildingIndex: 5, value: 0.25 },
    { id: 19, cost: 500000, description: 'Smiley-Bohrer Prod. +50%', type: 'building_mult', buildingIndex: 5, value: 0.5 },
    { id: 20, cost: 25000, description: 'Kernkraftwerk Prod. +10%', type: 'building_mult', buildingIndex: 6, value: 0.1 },
    { id: 21, cost: 125000, description: 'Kernkraftwerk Prod. +15%', type: 'building_mult', buildingIndex: 6, value: 0.15 },
    { id: 22, cost: 500000, description: 'Kernkraftwerk Prod. +25%', type: 'building_mult', buildingIndex: 6, value: 0.25 },
    { id: 23, cost: 2500000, description: 'Kernkraftwerk Prod. +50%', type: 'building_mult', buildingIndex: 6, value: 0.5 },
    { id: 24, cost: 125000, description: 'Galaxie Prod. +10%', type: 'building_mult', buildingIndex: 7, value: 0.1 },
    { id: 25, cost: 625000, description: 'Galaxie Prod. +15%', type: 'building_mult', buildingIndex: 7, value: 0.15 },
    { id: 26, cost: 2500000, description: 'Galaxie Prod. +25%', type: 'building_mult', buildingIndex: 7, value: 0.25 },
    { id: 27, cost: 12500000, description: 'Galaxie Prod. +50%', type: 'building_mult', buildingIndex: 7, value: 0.5 },
    { id: 28, cost: 625000, description: 'Dimensionsportal Prod. +10%', type: 'building_mult', buildingIndex: 8, value: 0.1 },
    { id: 29, cost: 3125000, description: 'Dimensionsportal Prod. +15%', type: 'building_mult', buildingIndex: 8, value: 0.15 },
    { id: 30, cost: 12500000, description: 'Dimensionsportal Prod. +25%', type: 'building_mult', buildingIndex: 8, value: 0.25 },
    { id: 31, cost: 62500000, description: 'Dimensionsportal Prod. +50%', type: 'building_mult', buildingIndex: 8, value: 0.5 },
    { id: 32, cost: 3125000, description: 'Zeitmaschine Prod. +10%', type: 'building_mult', buildingIndex: 9, value: 0.1 },
    { id: 33, cost: 15625000, description: 'Zeitmaschine Prod. +15%', type: 'building_mult', buildingIndex: 9, value: 0.15 },
    { id: 34, cost: 62500000, description: 'Zeitmaschine Prod. +25%', type: 'building_mult', buildingIndex: 9, value: 0.25 },
    { id: 35, cost: 312500000, description: 'Zeitmaschine Prod. +50%', type: 'building_mult', buildingIndex: 9, value: 0.5 },
    { id: 36, cost: 15625000, description: 'Meta-Klicker Prod. +10%', type: 'building_mult', buildingIndex: 10, value: 0.1 },
    { id: 37, cost: 78125000, description: 'Meta-Klicker Prod. +15%', type: 'building_mult', buildingIndex: 10, value: 0.15 },
    { id: 38, cost: 312500000, description: 'Meta-Klicker Prod. +25%', type: 'building_mult', buildingIndex: 10, value: 0.25 },
    { id: 39, cost: 1562500000, description: 'Meta-Klicker Prod. +50%', type: 'building_mult', buildingIndex: 10, value: 0.5 },
    { id: 40, cost: 78125000, description: 'Quanten-Netzwerk Prod. +10%', type: 'building_mult', buildingIndex: 11, value: 0.1 },
    { id: 41, cost: 390625000, description: 'Quanten-Netzwerk Prod. +15%', type: 'building_mult', buildingIndex: 11, value: 0.15 },
    { id: 42, cost: 1562500000, description: 'Quanten-Netzwerk Prod. +25%', type: 'building_mult', buildingIndex: 11, value: 0.25 },
    { id: 43, cost: 7812500000, description: 'Quanten-Netzwerk Prod. +50%', type: 'building_mult', buildingIndex: 11, value: 0.5 },
    { id: 44, cost: 390625000, description: 'Endloser Speicher Prod. +10%', type: 'building_mult', buildingIndex: 12, value: 0.1 },
    { id: 45, cost: 1953125000, description: 'Endloser Speicher Prod. +15%', type: 'building_mult', buildingIndex: 12, value: 0.15 },
    { id: 46, cost: 7812500000, description: 'Endloser Speicher Prod. +25%', type: 'building_mult', buildingIndex: 12, value: 0.25 },
    { id: 47, cost: 39062500000, description: 'Endloser Speicher Prod. +50%', type: 'building_mult', buildingIndex: 12, value: 0.5 },
    { id: 48, cost: 1953125000, description: 'Ursprung Prod. +10%', type: 'building_mult', buildingIndex: 13, value: 0.1 },
    { id: 49, cost: 9765625000, description: 'Ursprung Prod. +15%', type: 'building_mult', buildingIndex: 13, value: 0.15 },
    { id: 50, cost: 39062500000, description: 'Ursprung Prod. +25%', type: 'building_mult', buildingIndex: 13, value: 0.25 },
    { id: 51, cost: 195312500000, description: 'Ursprung Prod. +50%', type: 'building_mult', buildingIndex: 13, value: 0.5 },
    { id: 52, cost: 9765625000, description: 'Kosmische Einheit Prod. +10%', type: 'building_mult', buildingIndex: 14, value: 0.1 },
    { id: 53, cost: 48828125000, description: 'Kosmische Einheit Prod. +15%', type: 'building_mult', buildingIndex: 14, value: 0.15 },
    { id: 54, cost: 195312500000, description: 'Kosmische Einheit Prod. +25%', type: 'building_mult', buildingIndex: 14, value: 0.25 },
    { id: 55, cost: 976562500000, description: 'Kosmische Einheit Prod. +50%', type: 'building_mult', buildingIndex: 14, value: 0.5 },
    { id: 56, cost: 48828125000, description: 'Absoluter Schöpfer Prod. +10%', type: 'building_mult', buildingIndex: 15, value: 0.1 },
    { id: 57, cost: 244140625000, description: 'Absoluter Schöpfer Prod. +15%', type: 'building_mult', buildingIndex: 15, value: 0.15 },
    { id: 58, cost: 976562500000, description: 'Absoluter Schöpfer Prod. +25%', type: 'building_mult', buildingIndex: 15, value: 0.25 },
    { id: 59, cost: 4882812500000, description: 'Absoluter Schöpfer Prod. +50%', type: 'building_mult', buildingIndex: 15, value: 0.5 },
    { id: 60, cost: 100, description: 'Globale Klick-Kraft +5%', type: 'click_mult', value: 0.05 },
    { id: 61, cost: 500, description: 'Globale Klick-Kraft +10%', type: 'click_mult', value: 0.1 },
    { id: 62, cost: 2000, description: 'Globale Klick-Kraft +15%', type: 'click_mult', value: 0.15 },
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
    { id: 8, cost: 15, description: 'Schalte das Pet-System frei.', type: 'unlock_pets', value: 0, x: -200, y: 400, requirements: [6] },
    { id: 9, cost: 15, description: 'Schalte die Diamanten-Mine frei.', type: 'unlock_mine', value: 0, x: 200, y: 400, requirements: [7] },
    { id: 10, cost: 50, description: 'Schalte das Gilden-System frei.', type: 'unlock_guilds', value: 0, x: 0, y: 500, requirements: [8, 9] },
];

let buildingCounts = buildingsData.map(() => 0);
let buildingPrices = buildingsData.map(item => item.basePrice);
let researchStatus = researchUpgrades.map(() => false);
let prestigeUpgradeStatus = prestigeUpgrades.map(() => false);

let gameState = {
    aktuelle_smileys: 0,
    gesammelte_smileys: 0,
    klickKraft: 1,
    totalSPS: 0,
    forschungPunkte: 0,
    prestige_punkte_verfügbar: 0,
    gesamt_prestige_punkte: 0,
    prestigeResets: 0,
    globalerPrestigeMultiplikator: 1,
    researchLabPrestigeMulti: 1,
    klickKraftMultiplier: 1,
    globalSPSMultiplier: 1,
    prestigePointMultiplier: 0.01,
    prestigeResetBonus: 0,
};

function formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    if (num < 1000) return Math.floor(num).toString();
    const suffixes = ["K", "M", "B", "T", "Qa", "Qi"];
    let i = 0;
    while (num >= 1000 && i < suffixes.length) {
        num /= 1000;
        i++;
    }
    return num.toFixed(2) + (i > 0 ? suffixes[i - 1] : '');
}

function getById(id) { return document.getElementById(id); }

function calculateNextCost(basePrice, count, growthRate, buildingIndex = -1) {
    let price = Math.floor(basePrice * Math.pow(growthRate, count));
    const reductionUpgrade = prestigeUpgrades.find(upg => 
        upg.type === 'building_cost_reduction' && 
        prestigeUpgradeStatus[upg.id] &&
        upg.buildingIndices.includes(buildingIndex)
    );
    if (reductionUpgrade) {
        price *= (1 - reductionUpgrade.value);
    }
    return Math.floor(price);
}

function speichereSpiel() {
    try {
        const allData = {
            gameState,
            buildingCounts,
            buildingPrices,
            researchStatus,
            prestigeUpgradeStatus
        };
        const jsonString = JSON.stringify(allData);
        const encodedData = btoa(jsonString); // Base64 encoding
        return encodedData;
    } catch (e) {
        console.error("Fehler beim Speichern des Spiels:", e);
        return null;
    }
}

function ladeSpiel(encodedData) {
    try {
        if (!encodedData) return false;
        const jsonString = atob(encodedData); // Base64 decoding
        const allData = JSON.parse(jsonString);

        gameState = allData.gameState;
        buildingCounts = allData.buildingCounts;
        buildingPrices = allData.buildingPrices;
        researchStatus = allData.researchStatus;
        prestigeUpgradeStatus = allData.prestigeUpgradeStatus;

        applyAllBoni();
        updateUI();
        return true;
    } catch (e) {
        console.error("Fehler beim Laden des Spiels:", e);
        alert("Fehler beim Importieren des Spielstands. Die Daten sind möglicherweise beschädigt.");
        return false;
    }
}

function applyAllBoni() {
    gameState.globalSPSMultiplier = 1;
    gameState.researchLabPrestigeMulti = 1;
    gameState.prestigePointMultiplier = 0.01;
    gameState.prestigeResetBonus = 0;
    buildingsData.forEach(b => { b.prestigeMulti = 1; });
    let baseClickMultiplier = 1;
    let prestigeClickMultiplier = 0;

    researchStatus.forEach((bought, id) => {
        if(bought) {
            const upgrade = researchUpgrades.find(u => u.id === id);
            if(upgrade.type === 'building_mult') {
                buildingsData[upgrade.buildingIndex].prestigeMulti += upgrade.value;
            } else if (upgrade.type === 'click_mult') {
                baseClickMultiplier += upgrade.value;
            }
        }
    });

    prestigeUpgradeStatus.forEach((bought, id) => {
        if(bought) {
            const upgrade = prestigeUpgrades.find(u => u.id === id);
            if(upgrade) {
                switch(upgrade.type) {
                    case 'global_sps_mult': gameState.globalSPSMultiplier += upgrade.value; break;
                    case 'global_click_mult': prestigeClickMultiplier += upgrade.value; break;
                    case 'research_lab_mult': gameState.researchLabPrestigeMulti += upgrade.value; break;
                    case 'prestige_point_eff': gameState.prestigePointMultiplier += upgrade.value; break;
                    case 'prestige_reset_bonus': gameState.prestigeResetBonus += upgrade.value; break;
                }
            }
        }
    });

    gameState.klickKraftMultiplier = baseClickMultiplier + prestigeClickMultiplier;

    const prestigeBonus = 1 + (gameState.gesamt_prestige_punkte * gameState.prestigePointMultiplier);
    const resetBonus = 1 + (gameState.prestigeResets * gameState.prestigeResetBonus);
    gameState.globalerPrestigeMultiplikator = prestigeBonus * resetBonus * gameState.globalSPSMultiplier;
}

function klickeSmiley() {
    const smileysGeklickt = gameState.klickKraft * gameState.klickKraftMultiplier;
    gameState.aktuelle_smileys += smileysGeklickt;
    gameState.gesammelte_smileys += smileysGeklickt;
    updateUI(); 
}

function produziereSmileys() {
    const timeFactor = 0.1;
    if (gameState.totalSPS > 0) {
        gameState.aktuelle_smileys += gameState.totalSPS * timeFactor;
        gameState.gesammelte_smileys += gameState.totalSPS * timeFactor;
    }
    if (buildingCounts[3] > 0) {
        gameState.forschungPunkte += 1 * gameState.researchLabPrestigeMulti * timeFactor;
    }
}

function computeTotalSPS() {
    let sps = 0;
    buildingsData.forEach((item, index) => {
        if (item.isSpecial) return;
        sps += (buildingCounts[index] || 0) * (item.baseSPS || 0) * (item.prestigeMulti || 1);
    });

    gameState.totalSPS = sps * gameState.globalerPrestigeMultiplikator;
}

function kaufeMehrereGebaeude(index, amount) {
    const item = buildingsData[index];
    if (item.isSpecial && buildingCounts[index] >= item.maxCount) return;

    let totalCost = 0;
    const anzahl = item.isSpecial ? 1 : amount;
    for (let i = 0; i < anzahl; i++) {
        totalCost += calculateNextCost(item.basePrice, buildingCounts[index] + i, item.growthRate, index);
    }

    if (gameState.aktuelle_smileys >= totalCost) {
        gameState.aktuelle_smileys -= totalCost;
        buildingCounts[index] += anzahl;
        buildingPrices[index] = calculateNextCost(item.basePrice, buildingCounts[index], item.growthRate, index);
        updateUI(); 
    }
}

function kaufeResearchUpgrade(id) {
    const upgrade = researchUpgrades.find(u => u.id === id);
    if (!upgrade || researchStatus[id] || gameState.forschungPunkte < upgrade.cost) return;

    gameState.forschungPunkte -= upgrade.cost;
    researchStatus[id] = true;
    applyAllBoni();
    updateUI();
    speichereSpiel();
}

function kaufePrestigeUpgrade(id) {
    const upgrade = prestigeUpgrades.find(u => u.id === id);
    const requirementsMet = upgrade.requirements.every(reqId => prestigeUpgradeStatus[reqId]);

    if (!upgrade || prestigeUpgradeStatus[id] || gameState.prestige_punkte_verfügbar < upgrade.cost || !requirementsMet) return;

    gameState.prestige_punkte_verfügbar -= upgrade.cost;
    prestigeUpgradeStatus[id] = true;

    applyAllBoni();
    updatePrestigeUI();
    if (document.querySelector('.main-layout')) {
        updateUI();
    }
    speichereSpiel();
}

function prestigeReset() {
    const prestigePointThreshold = 1000000;
    const totalPotentialPoints = Math.floor(Math.pow(gameState.gesammelte_smileys / prestigePointThreshold, 1/3));
    const pointsToGain = Math.max(0, totalPotentialPoints - gameState.gesamt_prestige_punkte);

    if (pointsToGain <= 0) return;

    gameState.aktuelle_smileys = 0;
    gameState.gesammelte_smileys = 0;
    gameState.klickKraft = 1;
    gameState.totalSPS = 0;
    gameState.forschungPunkte = 0;
    gameState.prestige_punkte_verfügbar += pointsToGain;
    gameState.gesamt_prestige_punkte += pointsToGain;
    gameState.prestigeResets += 1; 

    buildingCounts = buildingsData.map(() => 0);
    buildingPrices = buildingsData.map(item => item.basePrice);
    researchStatus = researchUpgrades.map(() => false);
    
    applyAllBoni(); 
    speichereSpiel();
    
    if(document.querySelector('.prestige-main')) {
        updatePrestigeUI();
    }
}

function resetPrestigeUpgrades() {
    let refundedPoints = 0;
    prestigeUpgradeStatus.forEach((bought, id) => {
        if (bought) {
            const upgrade = prestigeUpgrades.find(u => u.id === id);
            if (upgrade) {
                refundedPoints += upgrade.cost;
            }
        }
    });

    if (refundedPoints > 0) {
        gameState.prestige_punkte_verfügbar += refundedPoints;
        prestigeUpgradeStatus.fill(false);
        applyAllBoni();
        updatePrestigeUI();
        speichereSpiel();
    }
}

function createBuildingElements() {
    const buildingGrid = getById('building-grid');
    if (!buildingGrid) return;
    buildingGrid.innerHTML = '';
    buildingsData.forEach((building, index) => {
        if (building.isSpecial) return;
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

function createResearchElements() {
    // Leer, da die Logik in updateResearchUI liegt
}

function createPrestigeUpgradeElements() {
    const treeContainer = getById('prestige-tree-container');
    if (!treeContainer) return;
    treeContainer.innerHTML = '';
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = 'prestige-lines';
    treeContainer.appendChild(svg);
    prestigeUpgrades.forEach(upgrade => {
        const upgradeDiv = document.createElement('div');
        upgradeDiv.className = 'prestige-node';
        upgradeDiv.dataset.id = upgrade.id;
        upgradeDiv.style.left = `calc(50% + ${upgrade.x}px)`;
        upgradeDiv.style.top = `${upgrade.y}px`;
        upgradeDiv.innerHTML = `<div class="node-icon"></div><div class="node-tooltip"><h4>${upgrade.description}</h4><p>Kosten: ${formatNumber(upgrade.cost)} PP</p></div>`;
        treeContainer.appendChild(upgradeDiv);
        upgrade.requirements.forEach(reqId => {
            const reqUpgrade = prestigeUpgrades.find(u => u.id === reqId);
            if(reqUpgrade) {
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
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
}

function createBuildingInfoElements() {
    const container = getById('info_buildings_container');
    if (!container) return;
    container.innerHTML = '';
    buildingsData.forEach(building => {
        if (building.isSpecial) return;
        const item = document.createElement('div');
        item.className = 'info-upgrade-item';
        item.innerHTML = `<h3>${building.name}</h3><p><strong>Start-Produktion:</strong> ${formatNumber(building.baseSPS || 0)} SPS</p><p><strong>Start-Kosten:</strong> ${formatNumber(building.basePrice)} Smileys</p><p><strong>Wachstumsrate:</strong> x${building.growthRate.toFixed(2)} pro Kauf</p>`;
        container.appendChild(item);
    });
}

function createResearchInfoElements() {
    const container = getById('info_research_container');
    if (!container) return;
    container.innerHTML = '';
    researchUpgrades.forEach(upgrade => {
        const item = document.createElement('div');
        item.className = 'info-upgrade-item';
        item.innerHTML = `<h3>${upgrade.description}</h3><p><strong>Kosten:</strong> ${formatNumber(upgrade.cost)} Forschungspunkte</p>`;
        container.appendChild(item);
    });
}

function createPrestigeInfoTree() {
    const treeContainer = getById('info_prestige_container');
    if (!treeContainer) return;
    treeContainer.innerHTML = '';
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = 'prestige-lines-info';
    treeContainer.appendChild(svg);
    prestigeUpgrades.forEach(upgrade => {
        const upgradeDiv = document.createElement('div');
        upgradeDiv.className = 'prestige-node info-node';
        upgradeDiv.dataset.id = upgrade.id;
        upgradeDiv.style.left = `calc(50% + ${upgrade.x}px)`;
        upgradeDiv.style.top = `${upgrade.y}px`;
        upgradeDiv.innerHTML = `<div class="node-icon"></div><div class="node-tooltip"><h4>${upgrade.description}</h4><p>Kosten: ${formatNumber(upgrade.cost)} PP</p></div>`;
        treeContainer.appendChild(upgradeDiv);
        upgrade.requirements.forEach(reqId => {
            const reqUpgrade = prestigeUpgrades.find(u => u.id === reqId);
            if (reqUpgrade) {
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
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
}

function updatePrestigeInfoTree() {
    const treeContainer = getById('info_prestige_container');
    if (!treeContainer) return;
    prestigeUpgrades.forEach(upgrade => {
        const node = treeContainer.querySelector(`.prestige-node[data-id="${upgrade.id}"]`);
        if (!node) return;
        const isPurchased = prestigeUpgradeStatus[upgrade.id];
        node.classList.toggle('purchased', isPurchased);
        const requirementsMet = upgrade.requirements.every(reqId => prestigeUpgradeStatus[reqId]);
        node.classList.toggle('available', requirementsMet && !isPurchased);
        node.classList.toggle('locked', !requirementsMet && !isPurchased);
    });
    const svg = getById('prestige-lines-info');
    if (!svg) return;
    svg.querySelectorAll('line').forEach(line => {
        const fromId = parseInt(line.dataset.from, 10);
        const toId = parseInt(line.dataset.to, 10);
        line.classList.toggle('active', prestigeUpgradeStatus[fromId] && prestigeUpgradeStatus[toId]);
    });
}

function updateBuildingUI() {
    buildingsData.forEach((building, index) => {
        if (building.isSpecial) return;
        const cost1x = calculateNextCost(building.basePrice, buildingCounts[index], building.growthRate, index);
        let cost10x = 0; for (let i = 0; i < 10; i++) cost10x += calculateNextCost(building.basePrice, buildingCounts[index] + i, building.growthRate, index);
        let cost100x = 0; for (let i = 0; i < 100; i++) cost100x += calculateNextCost(building.basePrice, buildingCounts[index] + i, building.growthRate, index);
        
        const baseBuildingSPS = (buildingCounts[index] || 0) * (building.baseSPS || 0) * (building.prestigeMulti || 1);
        const actualBuildingSPS = baseBuildingSPS * gameState.globalerPrestigeMultiplikator;
        const spsPercentage = gameState.totalSPS > 0 ? (actualBuildingSPS / gameState.totalSPS * 100) : 0;
        
        getById(`building-count-${index}`).innerText = buildingCounts[index];
        getById(`building-sps-${index}`).innerText = formatNumber(actualBuildingSPS);
        getById(`building-sps-pct-${index}`).innerText = spsPercentage.toFixed(1);

        const btn1x = getById(`buy-1-${index}`);
        btn1x.innerHTML = `1x (${formatNumber(cost1x)})`;
        btn1x.disabled = gameState.aktuelle_smileys < cost1x;
        const btn10x = getById(`buy-10-${index}`);
        btn10x.innerHTML = `10x (${formatNumber(cost10x)})`;
        btn10x.disabled = gameState.aktuelle_smileys < cost10x;
        const btn100x = getById(`buy-100-${index}`);
        btn100x.innerHTML = `100x (${formatNumber(cost100x)})`;
        btn100x.disabled = gameState.aktuelle_smileys < cost100x;
    });
}

function updateResearchUI() {
    const labContent = getById('lab-main-content');
    if (!labContent) return;

    const hasLab = buildingCounts[3] > 0;
    const purchaseContainer = getById('lab-purchase-container');
    labContent.style.display = hasLab ? 'block' : 'none';
    if(purchaseContainer) purchaseContainer.style.display = hasLab ? 'none' : 'block';
    if (!hasLab) return;

    const nextUpgradeContainer = getById('next-research-container');
    if (!nextUpgradeContainer) return;

    const nextUpgrade = researchUpgrades.find(upgrade => !researchStatus[upgrade.id]);

    if (!nextUpgrade) {
        nextUpgradeContainer.innerHTML = '<h4>Alle Forschungen abgeschlossen!</h4>';
        return;
    }

    const canAfford = gameState.forschungPunkte >= nextUpgrade.cost;

    nextUpgradeContainer.innerHTML = `
        <h4>Nächstes Upgrade:</h4>
        <div class="research-item" data-id="${nextUpgrade.id}">
            <p>${nextUpgrade.description}</p>
            <p>Kosten: ${formatNumber(nextUpgrade.cost)} RP</p>
            <button class="btn-buy-research" id="buy-research-${nextUpgrade.id}">
                Forschen
            </button>
        </div>
    `;
    
    const btn = nextUpgradeContainer.querySelector('.btn-buy-research');
    if (btn) {
        btn.disabled = !canAfford;
        if (!canAfford) {
            btn.style.backgroundColor = "var(--color-red-main)";
            btn.style.color = "white";
        } else {
            btn.style.backgroundColor = ""; 
            btn.style.color = "";
        }
    }
}

function updateUI() {
    computeTotalSPS();
    getById('aktuelle_smileys').innerText = formatNumber(gameState.aktuelle_smileys);
    getById('smileys_pro_sekunde_anzeige').innerText = formatNumber(gameState.totalSPS);
    getById('smileys_pro_minute_anzeige').innerText = formatNumber(gameState.totalSPS * 60);
    getById('smileys_pro_klick_anzeige').innerText = formatNumber(gameState.klickKraft * gameState.klickKraftMultiplier);
    getById('klick_multiplikator_anzeige').innerText = `x${gameState.klickKraftMultiplier.toFixed(2)}`;
    getById('globaler_multiplikator_anzeige').innerText = `x${gameState.globalerPrestigeMultiplikator.toFixed(2)}`;
    updateBuildingUI(); 
    updateResearchUI();

    const labIndex = 3;
    const labOwned = buildingCounts[labIndex] > 0;
    const purchaseContainer = getById('lab-purchase-container');
    const mainContent = getById('lab-main-content');

    if (purchaseContainer) purchaseContainer.style.display = labOwned ? 'none' : 'block';
    if (mainContent) mainContent.style.display = labOwned ? 'block' : 'none';

    if (labOwned) {
        getById('forschungspunkte').innerText = formatNumber(gameState.forschungPunkte);
    } else {
        const labButton = getById('forschungslaborButton');
        if (labButton) {
            const labCost = calculateNextCost(buildingsData[labIndex].basePrice, 0, buildingsData[labIndex].growthRate, labIndex);
            labButton.innerText = `Kaufen (${formatNumber(labCost)})`;
            labButton.disabled = gameState.aktuelle_smileys < labCost;
        }
    }

    const prestigePointThreshold = 1000000;
    const totalPotentialPoints = Math.floor(Math.pow(gameState.gesammelte_smileys / prestigePointThreshold, 1/3));
    const pointsToGain = Math.max(0, totalPotentialPoints - gameState.gesamt_prestige_punkte);

    const nextPointRequirement = Math.pow(totalPotentialPoints + 1, 3) * prestigePointThreshold;
    const lastPointRequirement = Math.pow(totalPotentialPoints, 3) * prestigePointThreshold;

    const progressBar = getById('prestige-progress-bar');
    const progressText = getById('prestige-progress-text');

    if(progressBar && progressText) {
        if (pointsToGain > 0) {
            progressBar.style.width = '100%';
            progressText.innerText = `+${pointsToGain} Prestige-Punkt${pointsToGain > 1 ? 'e' : ''} verfügbar!`;
        } else {
            const progress = Math.max(0, gameState.gesammelte_smileys - lastPointRequirement);
            const goal = nextPointRequirement - lastPointRequirement;
            const percentage = goal > 0 ? Math.min(100, (progress / goal) * 100) : 0;
            progressBar.style.width = `${percentage}%`;
            progressText.innerText = `${formatNumber(gameState.gesammelte_smileys)} / ${formatNumber(nextPointRequirement)}`;
        }
    }
}

function updatePrestigeUI() {
    if(!getById('prestige_punkte_verfügbar')) return;
    
    ladeSpiel();

    const prestigePointThreshold = 1000000;
    const totalPotentialPoints = Math.floor(Math.pow(gameState.gesammelte_smileys / prestigePointThreshold, 1/3));
    const pointsToGain = Math.max(0, totalPotentialPoints - gameState.gesamt_prestige_punkte);
    
    const nextPointRequirement = Math.pow(totalPotentialPoints + 1, 3) * prestigePointThreshold;

    getById('prestige_punkte_verfügbar').innerText = formatNumber(gameState.prestige_punkte_verfügbar);
    getById('gesamt_prestige_punkte').innerText = formatNumber(gameState.gesamt_prestige_punkte);
    getById('aktuelle_smileys_prestige').innerText = formatNumber(gameState.gesammelte_smileys);
    getById('next_prestige_point').innerText = formatNumber(nextPointRequirement);

    computeTotalSPS();
    getById('globaler_multiplikator_anzeige').innerText = `x${gameState.globalerPrestigeMultiplikator.toFixed(2)}`;

    const prestigeButton = getById('prestige_reset_button');
    if(prestigeButton) {
        prestigeButton.disabled = pointsToGain <= 0;
        prestigeButton.innerText = `Prestige (${pointsToGain} Punkte)`;
    }
    const pointsToGainElement = getById('prestige_points_to_gain');
    if(pointsToGainElement) {
        pointsToGainElement.innerText = pointsToGain;
    }

    if (getById('prestige-tree-container')) {
        prestigeUpgrades.forEach(upgrade => {
            const node = document.querySelector(`.prestige-node[data-id="${upgrade.id}"]`);
            if (!node) return;

            const requirementsMet = upgrade.requirements.every(reqId => prestigeUpgradeStatus[reqId]);
            const canAfford = gameState.prestige_punkte_verfügbar >= upgrade.cost;
            const isPurchased = prestigeUpgradeStatus[upgrade.id];

            node.classList.remove('purchased', 'available', 'locked');

            if (isPurchased) {
                node.classList.add('purchased');
            } else if (requirementsMet && canAfford) {
                node.classList.add('available');
            } else {
                node.classList.add('locked');
            }
        });

        const svg = getById('prestige-lines');
        if (!svg) return;
        svg.querySelectorAll('line').forEach(line => {
            const fromId = parseInt(line.dataset.from, 10);
            const toId = parseInt(line.dataset.to, 10);
            if (prestigeUpgradeStatus[fromId] && prestigeUpgradeStatus[toId]) {
                line.classList.add('active');
            } else {
                line.classList.remove('active');
            }
        });
    }
}

function setupMainEventListeners() {
    getById('smiley_button')?.addEventListener('click', klickeSmiley);
    getById('forschungslaborButton')?.addEventListener('click', () => kaufeMehrereGebaeude(3, 1));
    
    getById('building-grid')?.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-buy');
        if (!button) return;
        const buildingItem = button.closest('.building-item');
        if (!buildingItem) return;
        const index = parseInt(buildingItem.dataset.index, 10);
        const amount = parseInt(button.dataset.amount, 10);
        if (!isNaN(index) && !isNaN(amount)) kaufeMehrereGebaeude(index, amount);
    });

    getById('next-research-container')?.addEventListener('click', (e) => {
        const buyButton = e.target.closest('.btn-buy-research');
        if (!buyButton) return;

        const researchItem = buyButton.closest('.research-item');
        if (!researchItem) return;

        const id = parseInt(researchItem.dataset.id, 10);
        if (!isNaN(id)) {
            kaufeResearchUpgrade(id);
        }
    });
}

function setupPrestigeEventListeners() {
    const prestigeModal = getById('prestige_confirm_modal');
    const openPrestigeModalButton = getById('prestige_reset_button');
    const closePrestigeModalButton = getById('cancel_prestige_button');
    const confirmPrestigeButton = getById('confirm_prestige_button');

    openPrestigeModalButton?.addEventListener('click', () => {
        updatePrestigeUI();
        const totalPotentialPoints = Math.floor(Math.pow(gameState.gesammelte_smileys / 1000000, 1/3));
        const pointsToGain = Math.max(0, totalPotentialPoints - gameState.gesamt_prestige_punkte);
        if (pointsToGain > 0) {
            prestigeModal.style.display = 'flex';
        }
    });

    closePrestigeModalButton?.addEventListener('click', () => { prestigeModal.style.display = 'none'; });
    confirmPrestigeButton?.addEventListener('click', () => {
        prestigeReset();
        prestigeModal.style.display = 'none';
    });

    const skillTreeModal = getById('skill_tree_modal');
    const openSkillTreeButton = getById('open_skill_tree_button');
    const closeSkillTreeButton = getById('close_skill_tree_button');

    openSkillTreeButton?.addEventListener('click', () => { skillTreeModal.style.display = 'flex'; });
    closeSkillTreeButton?.addEventListener('click', () => { skillTreeModal.style.display = 'none'; });

    getById('prestige-tree-container')?.addEventListener('click', (e) => {
        const node = e.target.closest('.prestige-node');
        if (!node) return;
        const id = parseInt(node.dataset.id, 10);
        if (!isNaN(id)) kaufePrestigeUpgrade(id);
    });

    const resetPrestigeUpgradesButton = getById('reset_prestige_upgrades_button');
    resetPrestigeUpgradesButton?.addEventListener('click', () => {
        if (confirm("Möchtest du wirklich alle investierten Prestige-Punkte zurücksetzen? Dieser Schritt kann nicht rückgängig gemacht werden.")) {
            resetPrestigeUpgrades();
        }
    });
}

function setupInfoPageEventListeners() {
    const buildingsModal = getById('buildings_info_modal');
    const openBuildingsButton = getById('show_buildings_button');
    const closeBuildingsButton = getById('close_buildings_info_button');
    openBuildingsButton?.addEventListener('click', () => buildingsModal.style.display = 'flex');
    closeBuildingsButton?.addEventListener('click', () => buildingsModal.style.display = 'none');

    const researchModal = getById('research_info_modal');
    const openResearchButton = getById('show_research_button');
    const closeResearchButton = getById('close_research_info_button');
    openResearchButton?.addEventListener('click', () => researchModal.style.display = 'flex');
    closeResearchButton?.addEventListener('click', () => researchModal.style.display = 'none');

    const prestigeModal = getById('prestige_info_modal');
    const openPrestigeButton = getById('show_prestige_button');
    const closePrestigeButton = getById('close_prestige_info_button');
    openPrestigeButton?.addEventListener('click', () => {
        updatePrestigeInfoTree();
        prestigeModal.style.display = 'flex';
    });
    closePrestigeButton?.addEventListener('click', () => prestigeModal.style.display = 'none');

    const statsModal = getById('stats_info_modal');
    const openStatsButton = getById('show_stats_button');
    const closeStatsButton = getById('close_stats_info_button');
    openStatsButton?.addEventListener('click', () => statsModal.style.display = 'flex');
    closeStatsButton?.addEventListener('click', () => statsModal.style.display = 'none');
}

function createInfoStatsElements() {
    const container = getById('info_stats_container');
    if (!container) return;

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
            <p>Ein Bonus, der direkt deine "Smileys pro Klick" erhöht. Du kannst ihn durch Forschung und Prestige-Upgrades steigern.</p>
        </div>
        <div class="info-upgrade-item">
            <h3>Globaler Multiplikator</h3>
            <p>Dies ist der mächtigste Bonus im Spiel. Er wird durch deine gesammelten Prestige-Punkte und bestimmte Prestige-Upgrades berechnet und erhöht deine gesamte Smiley-Produktion (SPS) drastisch.</p>
        </div>
    `;
}

function setupSettingsModalListeners() {
    const settingsModal = getById('settings-modal');
    const openSettingsButton = getById('open-settings-button');
    const closeSettingsButton = getById('close-settings-button');
    const exportButton = getById('export-save-button');
    const importButton = getById('import-save-button');
    const saveDataTextarea = getById('save-data-textarea');

    openSettingsButton?.addEventListener('click', (e) => {
        e.preventDefault();
        settingsModal.style.display = 'flex';
    });

    closeSettingsButton?.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    exportButton?.addEventListener('click', () => {
        const saveData = speichereSpiel();
        if (saveData) {
            saveDataTextarea.value = saveData;
            navigator.clipboard.writeText(saveData).then(() => {
                alert("Spielstand in die Zwischenablage kopiert!");
            }, () => {
                alert("Konnte nicht in die Zwischenablage kopieren, bitte manuell kopieren.");
            });
        }
    });

    importButton?.addEventListener('click', () => {
        const saveData = saveDataTextarea.value.trim();
        if (saveData && confirm("Möchtest du diesen Spielstand wirklich importieren? Dein aktueller Fortschritt wird überschrieben.")) {
            if (ladeSpiel(saveData)) {
                alert("Spielstand erfolgreich importiert!");
                location.reload();
            }
        }
    });
}

function initialisiereHauptSpiel() {
    ladeSpiel();
    window.addEventListener('beforeunload', speichereSpiel);
    createBuildingElements();
    createResearchElements(); 
    setupMainEventListeners();
    updateUI();
    setInterval(produziereSmileys, 100);
    setInterval(updateUI, 1000);
    setInterval(speichereSpiel, 5000);
}

function initialisierePrestigeSeite() {
    ladeSpiel();
    createPrestigeUpgradeElements();
    setupPrestigeEventListeners();
    updatePrestigeUI();
    setInterval(updatePrestigeUI, 1000);
}

function initialisiereInfoSeite() {
    ladeSpiel();
    createBuildingInfoElements();
    createResearchInfoElements();
    createPrestigeInfoTree();
    createInfoStatsElements();
    setupInfoPageEventListeners();
}

function initialisiereSpiel() {
    setupSettingsModalListeners();
    if (document.querySelector('.main-layout')) {
        initialisiereHauptSpiel();
    } else if (document.querySelector('.prestige-main')) {
        initialisierePrestigeSeite();
    } else if (document.body.classList.contains('info-page')) {
        initialisiereInfoSeite();
    }
}
