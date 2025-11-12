document.addEventListener('DOMContentLoaded', () => {
    initialisiereSpiel();
});

//================================================================================================================
//--- 1. Globale Variablen & Spieldaten ---
//================================================================================================================

const buildingsData = [
    { name: "Auto-Klicker", basePrice: 20, growthRate: 1.10, elementId: "auto_klicker_button", baseSPS: 1, prestigeMulti: 1},
    { name: "Smiley-Baum", basePrice: 100, growthRate: 1.15, elementId: "smileyTreeButton", baseSPS: 20, prestigeMulti: 1},
    { name: "Smiley-Fabrik", basePrice: 1000, growthRate: 1.20, elementId: "smileyFactoryButton", baseSPS: 150, prestigeMulti: 1},
    { name: "Forschungslabor", basePrice: 5000000, growthRate: 1.3, elementId: "forschungslaborButton", isSpecial: true, maxCount: 1},
    { name: "Smiley-Mine", basePrice: 10000, growthRate: 1.25, elementId: "smileyMineButton", baseSPS: 1000, prestigeMulti: 1},
    { name: "Smiley-Bohrer", basePrice: 50000, growthRate: 1.30, elementId: "smileyBohrerButton", baseSPS: 5000, prestigeMulti: 1},
    { name: "Smiley-Kernkraftwerk", basePrice: 250000, growthRate: 1.35, elementId: "smileyKernkraftwerkButton", baseSPS: 25000, prestigeMulti: 1},
    { name: "Smiley-Galaxie", basePrice: 1250000, growthRate: 1.40, elementId: "smileyGalaxieButton", baseSPS: 125000, prestigeMulti: 1},
    { name: "Dimensionsportal", basePrice: 6250000, growthRate: 1.45, elementId: "dimensionsPortalButton", baseSPS: 625000, prestigeMulti: 1},
    { name: "Zeitmaschine", basePrice: 31250000, growthRate: 1.50, elementId: "zeitmaschineButton", baseSPS: 3125000, prestigeMulti: 1},
    { name: "Meta-Klicker", basePrice: 156250000, growthRate: 1.55, elementId: "metaKlickerButton", baseSPS: 15625000, prestigeMulti: 1},
    { name: "Quanten-Netzwerk", basePrice: 781250000, growthRate: 1.60, elementId: "quantenNetzwerkButton", baseSPS: 78125000, prestigeMulti: 1},
    { name: "Endloser Speicher", basePrice: 3906250000, growthRate: 1.65, elementId: "endloserSpeicherButton", baseSPS: 390625000, prestigeMulti: 1},
    { name: "Ursprung", basePrice: 19531250000, growthRate: 1.70, elementId: "ursprungButton", baseSPS: 1953125000, prestigeMulti: 1},
    { name: "Kosmische Einheit", basePrice: 97656250000, growthRate: 1.75, elementId: "kosmischeEinheitButton", baseSPS: 9765625000, prestigeMulti: 1},
    { name: "Absoluter Schöpfer", basePrice: 488281250000, growthRate: 1.80, elementId: "absoluterSchoepferButton", baseSPS: 48828125000, prestigeMulti: 1},
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

let buildingCounts = buildingsData.map(() => 0);
let buildingPrices = buildingsData.map(item => item.basePrice);
let researchStatus = researchUpgrades.map(() => false);

let gameState = {
    aktuelle_smileys: 0,
    gesammelte_smileys: 0,
    klickKraft: 1,
    totalSPS: 0,
    forschungPunkte: 0,
    prestige_punkte_verfügbar: 0,
    gesamt_prestige_punkte: 0,
    globalerPrestigeMultiplikator: 1,
    researchLabPrestigeMulti: 1,
    klickKraftMultiplier: 1,
};

//================================================================================================================
//--- 2. Kernfunktionen ---
//================================================================================================================

function formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    if (num < 1000) return Math.floor(num).toString();
    const suffixes = ["K", "M", "B", "T", "Qa", "Qi"];
    let suffixIndex = 0;
    let tempNum = num;
    while (tempNum >= 1000 && suffixIndex < suffixes.length - 1) {
        tempNum /= 1000;
        suffixIndex++;
    }
    return tempNum.toFixed(2) + suffixes[suffixIndex];
}

function getById(id) { return document.getElementById(id); }

function calculateNextCost(basePrice, count, growthRate) {
    return Math.floor(basePrice * Math.pow(growthRate, count));
}

function speichereSpiel() {
    try {
        localStorage.setItem('gameState', JSON.stringify(gameState));
        localStorage.setItem('buildingCounts', JSON.stringify(buildingCounts));
        localStorage.setItem('buildingPrices', JSON.stringify(buildingPrices));
        localStorage.setItem('researchStatus', JSON.stringify(researchStatus));
    } catch (e) {}
}

function ladeSpiel() {
    try {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            Object.assign(gameState, JSON.parse(savedState));
            for (const key in gameState) {
                if(typeof gameState[key] === 'string' && !isNaN(parseFloat(gameState[key]))) {
                    gameState[key] = parseFloat(gameState[key]);
                }
            }
            const savedCounts = JSON.parse(localStorage.getItem('buildingCounts'));
            if (savedCounts) buildingCounts = savedCounts;
            
            const savedPrices = JSON.parse(localStorage.getItem('buildingPrices'));
            if(savedPrices) buildingPrices = savedPrices;

            const savedResearch = JSON.parse(localStorage.getItem('researchStatus'));
            if(savedResearch && savedResearch.length === researchUpgrades.length) {
                researchStatus = savedResearch;
            } else {
                researchStatus = researchUpgrades.map(()=>false);
            }

            applyAllResearchBonuses();
        }
    } catch (e) {
        localStorage.clear();
    }
}

function applyAllResearchBonuses() {
    buildingsData.forEach(b => { b.prestigeMulti = 1; });
    gameState.klickKraftMultiplier = 1;

    researchStatus.forEach((bought, id) => {
        if(bought) {
            const upgrade = researchUpgrades.find(u => u.id === id);
            if(upgrade) {
                if (upgrade.type === 'building_mult') {
                    buildingsData[upgrade.buildingIndex].prestigeMulti += upgrade.value;
                } else if (upgrade.type === 'click_mult') {
                    gameState.klickKraftMultiplier += upgrade.value;
                }
            }
        }
    });
}

//================================================================================================================
//--- 3. Spiellogik ---
//================================================================================================================

function klickeSmiley() {
    gameState.aktuelle_smileys += gameState.klickKraft * gameState.klickKraftMultiplier;
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
    // 1. Basis-SPS aus Gebäuden und deren spezifischen Boni (aus Forschung etc.) berechnen
    buildingsData.forEach((item, index) => {
        if (item.isSpecial) return;
        // Beachten Sie, dass der globalePrestigeMultiplikator hier NICHT mehr angewendet wird
        sps += (buildingCounts[index] || 0) * (item.baseSPS || 0) * (item.prestigeMulti || 1);
    });

    // 2. Globalen Prestige-Bonus berechnen (1% pro gesamt Prestige-Punkt)
    const prestigeBonus = 1 + (gameState.gesamt_prestige_punkte * 0.01);
    gameState.globalerPrestigeMultiplikator = prestigeBonus;

    // 3. Finalen SPS-Wert mit globalem Bonus setzen (wobei der Multiplikator nur EINMAL angewendet wird)
    gameState.totalSPS = sps * prestigeBonus;
}

function kaufeMehrereGebaeude(index, amount) {
    const item = buildingsData[index];
    if (item.isSpecial && buildingCounts[index] >= item.maxCount) return;

    let totalCost = 0;
    const anzahl = item.isSpecial ? 1 : amount;
    let tempCount = buildingCounts[index];

    for (let i = 0; i < anzahl; i++) {
        totalCost += calculateNextCost(item.basePrice, tempCount + i, item.growthRate);
    }

    if (gameState.aktuelle_smileys >= totalCost) {
        gameState.aktuelle_smileys -= totalCost;
        buildingCounts[index] += anzahl;
        if(!item.isSpecial) {
            buildingPrices[index] = calculateNextCost(item.basePrice, buildingCounts[index], item.growthRate);
        }
        updateUI(); 
    }
}

function kaufeResearchUpgrade(id) {
    const upgrade = researchUpgrades.find(u => u.id === id);
    if (!upgrade || researchStatus[id] || gameState.forschungPunkte < upgrade.cost) return;

    gameState.forschungPunkte -= upgrade.cost;
    researchStatus[id] = true;

    if (upgrade.type === 'building_mult') {
        buildingsData[upgrade.buildingIndex].prestigeMulti += upgrade.value;
    } else if (upgrade.type === 'click_mult') {
        gameState.klickKraftMultiplier += upgrade.value;
    }
    updateUI();
}

function prestigeReset() {
    const prestigePointThreshold = 1000000;
    const pointsToGain = Math.max(0, Math.floor(Math.log10(gameState.gesammelte_smileys / prestigePointThreshold)) - gameState.gesamt_prestige_punkte);

    if (pointsToGain <= 0) return;

    gameState.aktuelle_smileys = 0;
    gameState.gesammelte_smileys = 0;
    gameState.klickKraft = 1;
    gameState.totalSPS = 0;
    gameState.forschungPunkte = 0;
    gameState.klickKraftMultiplier = 1;
    gameState.prestige_punkte_verfügbar += pointsToGain;
    gameState.gesamt_prestige_punkte += pointsToGain;

    buildingCounts = buildingsData.map(() => 0);
    buildingPrices = buildingsData.map(item => item.basePrice);
    researchStatus = researchUpgrades.map(() => false);
    
    applyAllResearchBonuses(); 
    speichereSpiel();
    
    if(document.querySelector('.prestige-main')) {
        updatePrestigeUI();
    }
}

//================================================================================================================
//--- 4. UI / Rendering ---
//================================================================================================================

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
    const researchGrid = getById('research_upgrades_grid');
    if (!researchGrid) return;
    researchGrid.innerHTML = '';

    researchUpgrades.forEach(upgrade => {
        const upgradeDiv = document.createElement('div');
        upgradeDiv.className = 'research-item';
        upgradeDiv.dataset.id = upgrade.id;
        upgradeDiv.innerHTML = `
            <h4>${upgrade.description}</h4>
            <p>Kosten: ${formatNumber(upgrade.cost)} RP</p>
            <button class="btn-buy-research" id="buy-research-${upgrade.id}">Forschen</button>
        `;
        researchGrid.appendChild(upgradeDiv);
    });
}

function updateBuildingUI() {
    buildingsData.forEach((building, index) => {
        if (building.isSpecial) return;
        const cost1x = buildingPrices[index];
        let cost10x = 0; for (let i = 0; i < 10; i++) cost10x += calculateNextCost(building.basePrice, buildingCounts[index] + i, building.growthRate);
        let cost100x = 0; for (let i = 0; i < 100; i++) cost100x += calculateNextCost(building.basePrice, buildingCounts[index] + i, building.growthRate);
        const buildingSPS = (buildingCounts[index] || 0) * (building.baseSPS || 0) * (building.prestigeMulti || 1) * gameState.globalerPrestigeMultiplikator;
        const spsPercentage = gameState.totalSPS > 0 ? (buildingSPS / gameState.totalSPS * 100) : 0;
        getById(`building-count-${index}`).innerText = buildingCounts[index];
        getById(`building-sps-${index}`).innerText = formatNumber(buildingSPS);
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
    const researchGrid = getById('research_upgrades_grid');
    if (!researchGrid) return;
    if(buildingCounts[3] > 0) researchGrid.style.display = 'grid';
    else { researchGrid.style.display = 'none'; return; }
    researchUpgrades.forEach(upgrade => {
        const researchItem = document.querySelector(`.research-item[data-id="${upgrade.id}"]`);
        if (!researchItem) return;
        if (researchStatus[upgrade.id]) {
            researchItem.style.display = 'none'; 
        } else {
            researchItem.style.display = 'flex'; 
            const btn = researchItem.querySelector('.btn-buy-research');
            if(btn) btn.disabled = gameState.forschungPunkte < upgrade.cost;
        }
    });
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
            const labCost = buildingPrices[labIndex];
            labButton.innerText = `Kaufen (${formatNumber(labCost)})`;
            labButton.disabled = gameState.aktuelle_smileys < labCost;
        }
    }
}

function updatePrestigeUI() {
    ladeSpiel(); 
    const prestigePointThreshold = 1000000;
    const pointsToGain = Math.max(0, Math.floor(Math.log10(gameState.gesammelte_smileys / prestigePointThreshold)) - gameState.gesamt_prestige_punkte);
    
    let nextPointRequirement = prestigePointThreshold * Math.pow(10, gameState.gesamt_prestige_punkte + pointsToGain);

    getById('prestige_punkte_verfügbar').innerText = formatNumber(gameState.prestige_punkte_verfügbar);
    getById('gesamt_prestige_punkte').innerText = formatNumber(gameState.gesamt_prestige_punkte);
    getById('aktuelle_smileys_prestige').innerText = formatNumber(gameState.aktuelle_smileys);
    getById('next_prestige_point').innerText = formatNumber(nextPointRequirement);

    const prestigeButton = getById('prestige_reset_button');
    if(prestigeButton) {
        prestigeButton.disabled = pointsToGain <= 0;
    }
    const pointsToGainElement = getById('prestige_points_to_gain');
    if(pointsToGainElement) {
        pointsToGainElement.innerText = pointsToGain;
    }
}

//================================================================================================================
//--- 5. Initialisierung ---
//================================================================================================================

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
    getById('research_upgrades_grid')?.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-buy-research');
        if (!button) return;
        const researchItem = button.closest('.research-item');
        if (!researchItem) return;
        const id = parseInt(researchItem.dataset.id, 10);
        if (!isNaN(id)) kaufeResearchUpgrade(id);
    });
}

function setupPrestigeEventListeners() {
    const modal = getById('prestige_confirm_modal');
    const openModalButton = getById('prestige_reset_button');
    const closeModalButton = getById('cancel_prestige_button');
    const confirmButton = getById('confirm_prestige_button');

    openModalButton?.addEventListener('click', () => {
        updatePrestigeUI(); // Update values before showing
        const pointsToGain = Math.max(0, Math.floor(Math.log10(gameState.gesammelte_smileys / 1000000)) - gameState.gesamt_prestige_punkte);
        if (pointsToGain > 0) {
            modal.style.display = 'flex';
        }
    });

    closeModalButton?.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    confirmButton?.addEventListener('click', () => {
        prestigeReset();
        modal.style.display = 'none';
    });
}

function initialisiereHauptSpiel() {
    ladeSpiel();
    researchUpgrades.sort((a,b) => a.cost - b.cost);
    createBuildingElements();
    createResearchElements();
    setupMainEventListeners();
    updateUI();
    setInterval(produziereSmileys, 100);
    setInterval(updateUI, 500);
    setInterval(speichereSpiel, 5000);
}

function initialisierePrestigeSeite() {
    setupPrestigeEventListeners();
    updatePrestigeUI();
    setInterval(updatePrestigeUI, 1000); 
}

function initialisiereSpiel() {
    if (document.querySelector('.main-layout')) {
        initialisiereHauptSpiel();
    } else if (document.querySelector('.prestige-main')) {
        initialisierePrestigeSeite();
    }
}
