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
    { id: 0, cost: 10, description: 'Erhöht die Produktion der Auto-Klicker um 10%', type: 'building_mult', buildingIndex: 0, value: 0.1 },
    { id: 1, cost: 25, description: 'Erhöht die Produktion der Smiley-Bäume um 10%', type: 'building_mult', buildingIndex: 1, value: 0.1 },
    { id: 2, cost: 50, description: 'Erhöht die Produktion der Smiley-Fabriken um 10%', type: 'building_mult', buildingIndex: 2, value: 0.1 },
    { id: 3, cost: 100, description: 'Erhöht die globale Klick-Kraft um 5%', type: 'click_mult', value: 0.05 },
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
    globalerPrestigeMultiplikator: 1,
    researchLabPrestigeMulti: 1,
    klickKraftMultiplier: 1,
};

//================================================================================================================
//--- 2. Kernfunktionen (Formatierung, Speichern, Laden) ---
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
    } catch (e) {
        console.error("Fehler beim Speichern: ", e);
    }
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
            if(savedResearch) researchStatus = savedResearch;

            researchStatus.forEach((bought, id) => {
                if(bought) {
                    const upgrade = researchUpgrades.find(u => u.id === id);
                    if(upgrade && upgrade.type === 'building_mult') {
                         buildingsData[upgrade.buildingIndex].prestigeMulti = (buildingsData[upgrade.buildingIndex].prestigeMulti || 1) + upgrade.value;
                    }
                    else if(upgrade && upgrade.type === 'click_mult'){
                        gameState.klickKraftMultiplier = (gameState.klickKraftMultiplier || 1) + upgrade.value;
                    }
                }
            });

        }
    } catch (e) {
        console.error("Fehler beim Laden: ", e);
        localStorage.clear();
    }
}

//================================================================================================================
//--- 3. Spiellogik (Kaufen, Produzieren) ---
//================================================================================================================

function klickeSmiley() {
    gameState.aktuelle_smileys += gameState.klickKraft * gameState.klickKraftMultiplier;
    getById('aktuelle_smileys').innerText = formatNumber(gameState.aktuelle_smileys);
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
        sps += (buildingCounts[index] || 0) * (item.baseSPS || 0) * (item.prestigeMulti || 1) * gameState.globalerPrestigeMultiplikator;
    });
    gameState.totalSPS = sps;
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
    if (!upgrade || researchStatus[id] || gameState.forschungPunkte < upgrade.cost) {
        return;
    }

    gameState.forschungPunkte -= upgrade.cost;
    researchStatus[id] = true;

    if (upgrade.type === 'building_mult') {
        buildingsData[upgrade.buildingIndex].prestigeMulti += upgrade.value;
    } else if (upgrade.type === 'click_mult') {
        gameState.klickKraftMultiplier += upgrade.value;
    }
    updateUI();
}


//================================================================================================================
//--- 4. Rendering & UI Updates ---
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
        let cost10x = 0; 
        for (let i = 0; i < 10; i++) cost10x += calculateNextCost(building.basePrice, buildingCounts[index] + i, building.growthRate);
        let cost100x = 0;
        for (let i = 0; i < 100; i++) cost100x += calculateNextCost(building.basePrice, buildingCounts[index] + i, building.growthRate);
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
        const btn = getById(`buy-research-${upgrade.id}`);
        if(!btn) return;
        if (researchStatus[upgrade.id]) {
            btn.disabled = true;
            btn.innerText = "Erforscht";
        } else {
            btn.disabled = gameState.forschungPunkte < upgrade.cost;
        }
    });
}

function updateUI() {
    computeTotalSPS();
    getById('aktuelle_smileys').innerText = formatNumber(gameState.aktuelle_smileys);
    getById('smileys_pro_sekunde_anzeige').innerText = formatNumber(gameState.totalSPS);
    getById('smileys_pro_minute_anzeige').innerText = formatNumber(gameState.totalSPS * 60);
    const finalClickPower = gameState.klickKraft * gameState.klickKraftMultiplier;
    getById('smileys_pro_klick_anzeige').innerText = formatNumber(finalClickPower);
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

//================================================================================================================
//--- 5. Initialisierung & Haupt-Schleife ---
//================================================================================================================

function setupEventListeners() {
    getById('smiley_button')?.addEventListener('click', klickeSmiley);
    getById('forschungslaborButton')?.addEventListener('click', () => kaufeMehrereGebaeude(3, 1));
    getById('building-grid')?.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-buy');
        if (!button) return;
        const buildingItem = button.closest('.building-item');
        if (!buildingItem) return;
        const index = parseInt(buildingItem.dataset.index, 10);
        const amount = parseInt(button.dataset.amount, 10);
        if (!isNaN(index) && !isNaN(amount)) {
            kaufeMehrereGebaeude(index, amount);
        }
    });
    getById('research_upgrades_grid')?.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-buy-research');
        if (!button) return;
        const researchItem = button.closest('.research-item');
        if (!researchItem) return;
        const id = parseInt(researchItem.dataset.id, 10);
        if (!isNaN(id)) {
            kaufeResearchUpgrade(id);
        }
    });
}


function initialisiereSpiel() {
    if (getById('building-grid')) {
        ladeSpiel();
        createBuildingElements();
        createResearchElements();
        setupEventListeners();
        updateUI();
        setInterval(produziereSmileys, 100);
        setInterval(updateUI, 500);
        setInterval(speichereSpiel, 5000);
    } 
}
