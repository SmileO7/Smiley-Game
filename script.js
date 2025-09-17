document.addEventListener('DOMContentLoaded', () => {

//================================================================================================================
// --- VARIABLEN & DATEN ---
//================================================================================================================
const clickerUpgrades = [
      {
        name: "Stärkerer Klick", 
        price: 250, 
        effect: 0.1, 
        type: "click",
        bought: 0
    },
    {
        name: "Doppelklick-Upgrade", 
        price: 500, 
        effect: 0.2, 
        type: "click",
        bought: 0
    },
    {
        name: "Dreifachklick-Upgrade", 
        price: 1000, 
        effect: 0.3, 
        type: "click",
        bought: 0
    }
];
 const buildings = [
          {
        name: "Auto-Klicker",
        basePrice: 20,
        growthRate: 1.1,
        elementId: "auto_clicker_button_1x"
    },
    {
        name: "Smiley-Baum",
        basePrice: 100,
        growthRate: 1.15,
        elementId: "smileyTreeButton1x"
    },
    {
        name: "Smiley-Fabrik",
        basePrice: 1000,
        growthRate: 1.2,
        elementId: "smileyFactoryButton1x"
    },
   
];
let aktuelle_smileys = parseInt(localStorage.getItem('aktuelle_smileys')) || 0;
let gesammelte_smileys = parseInt(localStorage.getItem('gesammelte_smileys')) || 0;
let smiley_points = parseInt(localStorage.getItem('smiley_points')) || 0;
let multiplikator = parseInt(localStorage.getItem('multiplikator')) || 1;
let auto_klicker_count = parseInt(localStorage.getItem('auto_klicker_count')) || 0;
let auto_clicker_cost = parseInt(localStorage.getItem('auto_clicker_cost')) || 0;
let prestige_kosten = parseInt(localStorage.getItem('prestige_kosten')) || 1000;
let prestige_punkte = parseInt(localStorage.getItem('prestige_punkte')) || 0;
let globalerMultiplikator = parseFloat(localStorage.getItem('globalerMultiplikator')) || 1.0;
let forschungspunkte = parseInt(localStorage.getItem('forschungspunkte')) || 0;
let forschungslabor_count = parseInt(localStorage.getItem('forschungslabor_count')) || 0;
let klickUpgradeBonus = parseFloat(localStorage.getItem('klickUpgradeBonus')) || 0;
let autoClickerResearchBonus = parseFloat(localStorage.getItem('autoClickerResearchBonus')) || 0;
let smileyTreeResearchBonus = parseFloat(localStorage.getItem('smileyTreeResearchBonus')) || 0;
let smileyFactoryResearchBonus = parseFloat(localStorage.getItem('smileyFactoryResearchBonus')) || 0;
let efficiencyBonus = parseFloat(localStorage.getItem('efficiencyBonus')) || 0;
let autoClickerSpeedBonus = parseFloat(localStorage.getItem('autoClickerSpeedBonus')) || 1;
let autoClickerClickBonus = parseFloat(localStorage.getItem('autoClickerClickBonus')) || 0;
let autoClickerEfficiencyBonus = parseFloat(localStorage.getItem('autoClickerEfficiencyBonus')) || 0;
let autoClickerProductionBonus = parseFloat(localStorage.getItem('autoClickerProductionBonus')) || 0;
let autoClickerCostReduction = parseFloat(localStorage.getItem('autoClickerCostReduction')) || 1;
let autoClickerGrowthRate = parseFloat(localStorage.getItem('autoClickerGrowthRate')) || 1.1;
let researchUpgradeIndex = parseInt(localStorage.getItem('researchUpgradeIndex')) || 0;
let gesamteGeklickteSmileys = parseInt(localStorage.getItem('gesamteGeklickteSmileys')) || 0;
let gesamteGesammelteSmileys = parseInt(localStorage.getItem('gesamteGesammelteSmileys')) || 0;
let gesamtPrestigePunkte = parseInt(localStorage.getItem('gesamtPrestigePunkte')) || 0;
let gekaufteUpgrades = parseInt(localStorage.getItem('gekaufteUpgrades')) || 0;
let gekaufteAutoKlicker = parseInt(localStorage.getItem('gekauft_auto_klicker')) || 0;
let gekaufteSmileyBaeume = parseInt(localStorage.getItem('gekauft_smiley_baeume')) || 0;
let gekaufteSmileyFabriken = parseInt(localStorage.getItem('gekauft_smiley_fabriken')) || 0;
let prestigeUpgradeStates = JSON.parse(localStorage.getItem('prestigeUpgradeStates')) || {};
let forschungslabor_fps_multiplier = parseFloat(localStorage.getItem('forschungslabor_fps_multiplier')) || 1.0;
let autoClickerUpgradeIndex = parseInt(localStorage.getItem('autoClickerUpgradeIndex')) || 0;
let smileyTreeProduction = parseInt(localStorage.getItem('smileyTreeProduction')) || 0;
let smileyFactoryProduction = parseInt(localStorage.getItem('smileyFactoryProduction')) || 0;
let forschungPunkte = 0;
// Elemente für den Fortschrittsbalken abrufen
const forschungFortschrittBalken = document.getElementById('forschung_fortschritt');
const forschungFortschrittText = document.getElementById('fortschritt-text');


const forschungUpgradeKosten = 1; // Beispielwert

const smileyTreeBaseCost = 150;
const smileyTreeGrowthRate = 1.2;
const smileyFactoryBaseCost = 2500;
const smileyFactoryGrowthRate = 1.25;
const forschungslaborBaseCost = 5000;
const forschungslaborGrowthRate = 1.3;
const autoClickerBaseCost = 20;

const researchUpgrades = [
    { cost: 10, description: 'Erhöht die Produktion der Auto-Klicker um 10%', type: 'autoClicker', bonusVariable: 'autoClickerResearchBonus', value: 0.1 },
    { cost: 25, description: 'Erhöht die Produktion der Smiley-Bäume um 10%', type: 'smileyTree', bonusVariable: 'smileyTreeResearchBonus', value: 0.1 },
    { cost: 50, description: 'Erhöht die Produktion der Smiley-Fabriken um 10%', type: 'smileyFactory', bonusVariable: 'smileyFactoryResearchBonus', value: 0.1 },
    { cost: 100, description: 'Deine Auto-Klicker sind 20% effizienter.', type: 'efficiency', bonusVariable: 'efficiencyBonus', value: 0.2 },
    { cost: 200, description: 'Deine Smiley-Bäume sind 20% effizienter.', type: 'efficiency', bonusVariable: 'efficiencyBonus', value: 0.2 },
    { cost: 500, description: 'Deine Smiley-Fabriken sind 20% effizienter.', type: 'efficiency', bonusVariable: 'efficiencyBonus', value: 0.2 }];

const autoClickerUpgrades = [
    { cost: 2000, type: 'speed', value: 2, variable: 'autoClickerSpeedBonus' },
    { cost: 8000, type: 'click', value: 2, variable: 'autoClickerClickBonus' },
    { cost: 25000, type: 'cost', value: 0.9, variable: 'autoClickerCostReduction' },
    { cost: 100000, type: 'efficiency', value: 0.15, variable: 'autoClickerEfficiencyBonus' },
    { cost: 500000, type: 'click', value: 5, variable: 'autoClickerClickBonus' },
    { cost: 2000000, type: 'efficiency', value: 0.2, variable: 'autoClickerEfficiencyBonus' },
    { cost: 8000000, type: 'speed', value: 5, variable: 'autoClickerSpeedBonus' },
    { cost: 25000000, type: 'efficiency', value: 2, variable: 'autoClickerEfficiencyBonus' }
];

const center_x = 400; // Horizontale Mitte des Containers
const center_y = 300; // Vertikale Mitte des Containers

const prestigeUpgrades = [
    {
        id: 'auto_clicker_speed',
        name: 'Auto-Klicker Beschleunigung',
        description: 'Erhöht die Geschwindigkeit aller Auto-Klicker dauerhaft um 25%.',
        cost: 10,
        effect: () => { autoClickerSpeedBonus *= 1.25; },
        prerequisites: [],
        x: center_x - 250,
        y: center_y - 150
    },
    {
        id: 'click_power_boost',
        name: 'Klickkraft Multiplikator',
        description: 'Verdoppelt deine Klickkraft dauerhaft.',
        cost: 25,
        effect: () => { multiplikator *= 2; },
        prerequisites: ['auto_clicker_speed'],
        x: center_x + 250,
        y: center_y - 150
    },
    {
        id: 'global_production_boost',
        name: 'Globale Produktionssteigerung',
        description: 'Erhöht die Produktion aller Gebäude (Klicker, Bäume, Fabriken) dauerhaft um 10%.',
        cost: 50,
        effect: () => { globalerMultiplikator *= 1.1; },
        prerequisites: ['click_power_boost'],
        x: center_x - 250,
        y: center_y + 150
    },
    {
        id: 'research_point_gain',
        name: 'Forschungspunkte Bonus',
        description: 'Erhöht die Rate, mit der Forschungspunkte generiert werden, dauerhaft um 50%.',
        cost: 100,
        effect: () => { forschungslabor_fps_multiplier *= 1.5; },
        prerequisites: ['global_production_boost'],
        x: center_x + 250,
        y: center_y + 150
    }
];

//================================================================================================================
// --- FUNKTIONEN ---
//================================================================================================================
function createUpgradeElements(items, containerClass) {
    const container = document.querySelector(`.${containerClass}`);
    if (!container) return;
    container.innerHTML = '';

    items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        
        // Füge die korrekte Klasse basierend auf dem Container hinzu
        if (containerClass === 'upgrade-grid') {
            itemElement.classList.add('upgrade-container');
        } else if (containerClass === 'building-grid') {
            itemElement.classList.add('building-container');
        }
        
        let cost;
        if (containerClass === 'upgrade-grid') {
            cost = item.price;
        } else if (containerClass === 'building-grid') {
            switch(item.elementId) {
                case "auto_clicker_button_1x":
                    cost = autoClickerBaseCost * Math.pow(autoClickerGrowthRate, auto_klicker_count);
                    break;
                case "smileyTreeButton1x":
                    cost = smileyTreeBaseCost * Math.pow(smileyTreeGrowthRate, smileyTreeProduction);
                    break;
                case "smileyFactoryButton1x":
                    cost = smileyFactoryBaseCost * Math.pow(smileyFactoryGrowthRate, smileyFactoryProduction);
                    break;
                default:
                    cost = 0;
            }
        }
        
        let count = 0;
        if (containerClass === 'upgrade-grid') {
            count = item.bought || 0;
        } else if (containerClass === 'building-grid') {
            switch(item.elementId) {
                case "auto_clicker_button_1x":
                    count = auto_klicker_count;
                    break;
                case "smileyTreeButton1x":
                    count = smileyTreeProduction;
                    break;
                case "smileyFactoryButton1x":
                    count = smileyFactoryProduction;
                    break;
            }
        }

        let isOneTimeUpgrade = (containerClass === 'upgrade-grid' && item.bought && item.bought >= 1);
        let isDisabled = (aktuelle_smileys < cost) || isOneTimeUpgrade;
        let buttonText = isOneTimeUpgrade ? 'Gekauft!' : 'Kaufen';

        itemElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>Preis: <span class="price-display">${isOneTimeUpgrade ? "Gekauft!" : formatLargeNumber(cost) + " Smileys"}</span></p>
            <p>Anzahl: <span class="count-display">${count}</span></p>
            <button class="upgrade-button btn-buy" data-index="${index}" data-type="${containerClass}" data-cost="${cost}" ${isDisabled ? 'disabled' : ''}>
                ${buttonText}
            </button>
        `;
        container.appendChild(itemElement);
    });
}


// Korrigierte kaufeItem-Funktion
function kaufeItem(type, index) {
    let item, cost;

    if (type === 'upgrade-grid') {
        item = clickerUpgrades[index];
        cost = item.price;
        // Prüfen, ob das Upgrade bereits gekauft wurde
        if (!item.bought || item.bought < 1) {
            if (aktuelle_smileys >= cost) {
                aktuelle_smileys -= cost;
                multiplikator += item.effect; 
                item.bought = 1; // Markiere das Upgrade als gekauft
            } else {
                return;
            }
        }
    } else if (type === 'building-grid') {
        item = buildings[index];

        switch (item.elementId) {
            case "auto_clicker_button_1x":
                cost = autoClickerBaseCost * Math.pow(autoClickerGrowthRate, auto_klicker_count);
                if (aktuelle_smileys >= cost) {
                    aktuelle_smileys -= cost;
                    auto_klicker_count++;
                } else {
                    return;
                }
                break;
            case "smileyTreeButton1x":
                cost = smileyTreeBaseCost * Math.pow(smileyTreeGrowthRate, smileyTreeProduction);
                if (aktuelle_smileys >= cost) {
                    aktuelle_smileys -= cost;
                    smileyTreeProduction++;
                } else {
                    return;
                }
                break;
            case "smileyFactoryButton1x":
                cost = smileyFactoryBaseCost * Math.pow(smileyFactoryGrowthRate, smileyFactoryProduction);
                if (aktuelle_smileys >= cost) {
                    aktuelle_smileys -= cost;
                    smileyFactoryProduction++;
                } else {
                    return;
                }
                break;
            default:
                return;
        }
    }
    
    speichereSpiel();
    updateDisplay();
    createUpgradeElements(clickerUpgrades, 'upgrade-grid');
    createUpgradeElements(buildings, 'building-grid');
}
function updateUpgradesDisplay() {
    const researchUpgradeButton = document.getElementById("forschungUpgradeButton");
    if (researchUpgradeButton) {
        const upgrade = researchUpgrades[researchUpgradeIndex];
        if (upgrade) {
            researchUpgradeButton.innerText = `Forschungspunkte-Upgrade kaufen (${upgrade.cost} FP)`;
            researchUpgradeButton.disabled = forschungspunkte < upgrade.cost;
        } else {
            researchUpgradeButton.innerText = "Alle Upgrades gekauft";
            researchUpgradeButton.disabled = true;
        }
    }

    const multiplikatorKostenAnzeige = document.getElementById("multiplikator_kosten_anzeige");
    if (multiplikatorKostenAnzeige) {
        multiplikatorKostenAnzeige.innerText = 10 * Math.pow(1.5, multiplikator - 1);
    }}

function kaufePrestigeUpgrade(upgradeId) {
    const upgrade = prestigeUpgrades.find(u => u.id === upgradeId);
    
    if (!upgrade || prestigeUpgradeStates[upgradeId]) {
        return;
    }
    
    const prerequisitesMet = upgrade.prerequisites.every(prereqId => prestigeUpgradeStates[prereqId]);
    if (!prerequisitesMet) {
        alert("Du musst zuerst die vorhergehenden Upgrades kaufen!");
        return;
    }

    if (prestige_punkte >= upgrade.cost) { // <-- Jetzt mit Prestige-Punkten
        prestige_punkte -= upgrade.cost;
        upgrade.effect();
        prestigeUpgradeStates[upgradeId] = true;
        speichereSpiel();
        updatePrestigeShopDisplay();
        updateGame();
        alert(`Prestige-Upgrade "${upgrade.name}" erfolgreich gekauft!`);
    } else {
        alert(`Nicht genügend Prestige-Punkte! Benötigt: ${upgrade.cost}`); // <-- Benötigt Prestige-Punkte
    }
}

function updatePrestigeShopDisplay() {
    const prestigePointsElement = document.getElementById("current_prestige_points");
    if (prestigePointsElement) {
        prestigePointsElement.innerText = prestige_punkte; // <-- Zeigt jetzt Prestige-Punkte an
    }
    const grid = document.getElementById("prestige_upgrades_grid");
    const svg = document.getElementById("prestige-lines-svg");

    if (!grid || !svg) return;

    grid.innerHTML = ''; 
    svg.innerHTML = '';
    
    const centralSmiley = document.createElement('div');
    centralSmiley.id = "central_smiley";
    grid.appendChild(centralSmiley);

    const centerX = grid.offsetWidth / 2;
    const centerY = grid.offsetHeight / 2;

    prestigeUpgrades.forEach(upgrade => {
        const isBought = prestigeUpgradeStates[upgrade.id];
        
        const upgradeDiv = document.createElement('div');
        upgradeDiv.className = 'prestige-upgrade-item';
        
        upgradeDiv.style.left = `${upgrade.x}px`;
        upgradeDiv.style.top = `${upgrade.y}px`;
        
        upgradeDiv.innerHTML = `
            <h4>${upgrade.name}</h4>
            <p>${upgrade.description}</p>
            <span class="cost">Kosten: ${upgrade.cost} PP</span>
            ${isBought ? '<span class="bought-label">Gekauft</span>' : ''}
        `;
        
        if (isBought) {
            upgradeDiv.classList.add('bought');
        } else if (prestige_punkte >= upgrade.cost && upgrade.prerequisites.every(prereqId => prestigeUpgradeStates[prereqId])) {
            upgradeDiv.classList.add('available');
            upgradeDiv.addEventListener('click', () => kaufePrestigeUpgrade(upgrade.id));
        } else {
            upgradeDiv.classList.add('locked');
        }
        
        grid.appendChild(upgradeDiv);

        const lineToCenter = document.createElementNS("http://www.w3.org/2000/svg", "line");
        lineToCenter.setAttribute("x1", centerX);
        lineToCenter.setAttribute("y1", centerY);
        lineToCenter.setAttribute("x2", upgrade.x + 60); 
        lineToCenter.setAttribute("y2", upgrade.y + 60);
        lineToCenter.classList.add('prestige-line');
        if (isBought) {
            lineToCenter.classList.add('bought-line');
        }
        svg.appendChild(lineToCenter);
    });
}
function speichereSpiel() {
    try {
        localStorage.setItem('aktuelle_smileys', aktuelle_smileys);
        localStorage.setItem('gesammelte_smileys', gesammelte_smileys);
        localStorage.setItem('multiplikator', multiplikator);
        localStorage.setItem('prestige_kosten', prestige_kosten);
        localStorage.setItem('smiley_points', smiley_points);
        localStorage.setItem('prestige_punkte', prestige_punkte);
        localStorage.setItem('prestigeUpgradeStates', JSON.stringify(prestigeUpgradeStates));
        
        // Auto-Klicker speichern
        localStorage.setItem('auto_klicker_count', auto_klicker_count);
        localStorage.setItem('auto_clicker_cost', auto_clicker_cost);
        localStorage.setItem('autoClickerGrowthRate', autoClickerGrowthRate);
        localStorage.setItem('autoClickerUpgradeIndex', autoClickerUpgradeIndex);
        localStorage.setItem('autoClickerSpeedBonus', autoClickerSpeedBonus);
        localStorage.setItem('autoClickerClickBonus', autoClickerClickBonus);
        localStorage.setItem('autoClickerEfficiencyBonus', autoClickerEfficiencyBonus);
        localStorage.setItem('autoClickerProductionBonus', autoClickerProductionBonus);
        localStorage.setItem('autoClickerCostReduction', autoClickerCostReduction);
        
        // Gebäude speichern
        localStorage.setItem('smileyTreeProduction', smileyTreeProduction);
        localStorage.setItem('smileyFactoryProduction', smileyFactoryProduction);
        
        // Forschung speichern
        localStorage.setItem('forschungslabor_count', forschungslabor_count);
        localStorage.setItem('forschungspunkte', forschungspunkte);
        localStorage.setItem('researchUpgradeIndex', researchUpgradeIndex);
        localStorage.setItem('autoClickerResearchBonus', autoClickerResearchBonus);
        localStorage.setItem('smileyTreeResearchBonus', smileyTreeResearchBonus);
        localStorage.setItem('smileyFactoryResearchBonus', smileyFactoryResearchBonus);
        localStorage.setItem('efficiencyBonus', efficiencyBonus);
    } catch (e) {
        console.error("Speichern fehlgeschlagen:", e);
    }
}

function ladeSpiel() {
    try {
        aktuelle_smileys = parseInt(localStorage.getItem('aktuelle_smileys')) || 0;
        gesammelte_smileys = parseInt(localStorage.getItem('gesammelte_smileys')) || 0;
        smiley_points = parseInt(localStorage.getItem('smiley_points')) || 0;
        multiplikator = parseInt(localStorage.getItem('multiplikator')) || 1;
        auto_klicker_count = parseInt(localStorage.getItem('auto_klicker_count')) || 0;
        auto_clicker_cost = parseFloat(localStorage.getItem('auto_clicker_cost')) || autoClickerBaseCost;
        prestige_kosten = parseInt(localStorage.getItem('prestige_kosten')) || 1000;
        prestige_punkte = parseInt(localStorage.getItem('prestige_punkte')) || 0;
        smileyTreeProduction = parseInt(localStorage.getItem('smileyTreeProduction')) || 0;
        globalerMultiplikator = parseFloat(localStorage.getItem('globalerMultiplikator')) || 1.0;
        smileyFactoryProduction = parseInt(localStorage.getItem('smileyFactoryProduction')) || 0;
        forschungspunkte = parseInt(localStorage.getItem('forschungspunkte')) || 0;
        forschungslabor_count = parseInt(localStorage.getItem('forschungslabor_count')) || 0;
        klickUpgradeBonus = parseFloat(localStorage.getItem('klickUpgradeBonus')) || 0;
        autoClickerResearchBonus = parseFloat(localStorage.getItem('autoClickerResearchBonus')) || 0;
        smileyTreeResearchBonus = parseFloat(localStorage.getItem('smileyTreeResearchBonus')) || 0;
        smileyFactoryResearchBonus = parseFloat(localStorage.getItem('smileyFactoryResearchBonus')) || 0;
        efficiencyBonus = parseFloat(localStorage.getItem('efficiencyBonus')) || 0;
        autoClickerSpeedBonus = parseFloat(localStorage.getItem('autoClickerSpeedBonus')) || 1;
        autoClickerClickBonus = parseFloat(localStorage.getItem('autoClickerClickBonus')) || 0;
        autoClickerEfficiencyBonus = parseFloat(localStorage.getItem('autoClickerEfficiencyBonus')) || 0;
        autoClickerProductionBonus = parseFloat(localStorage.getItem('autoClickerProductionBonus')) || 0;
        autoClickerCostReduction = parseFloat(localStorage.getItem('autoClickerCostReduction')) || 1;
        autoClickerGrowthRate = parseFloat(localStorage.getItem('autoClickerGrowthRate')) || 1.1;
        researchUpgradeIndex = parseInt(localStorage.getItem('researchUpgradeIndex')) || 0;
        gesamteGeklickteSmileys = parseInt(localStorage.getItem('gesamteGeklickteSmileys')) || 0;
        gesamteGesammelteSmileys = parseInt(localStorage.getItem('gesamteGesammelteSmileys')) || 0;
        gesamtPrestigePunkte = parseInt(localStorage.getItem('gesamtPrestigePunkte')) || 0;
        gekaufteUpgrades = parseInt(localStorage.getItem('gekaufteUpgrades')) || 0;
        gekaufteAutoKlicker = parseInt(localStorage.getItem('gekauft_auto_klicker')) || 0;
        gekaufteSmileyBaeume = parseInt(localStorage.getItem('gekauft_smiley_baeume')) || 0;
        gekaufteSmileyFabriken = parseInt(localStorage.getItem('gekauft_smiley_fabriken')) || 0;
        prestigeUpgradeStates = JSON.parse(localStorage.getItem('prestigeUpgradeStates')) || {};
        forschungslabor_fps_multiplier = parseFloat(localStorage.getItem('forschungslabor_fps_multiplier')) || 1.0;
        autoClickerUpgradeIndex = parseInt(localStorage.getItem('autoClickerUpgradeIndex')) || 0;
    } catch (e) {
        console.error("Laden fehlgeschlagen:", e);
    }
}

function updateGame() {
    speichereSpiel();
    updateDisplay();
    const smileyPointsElement = document.getElementById("smiley_points");
    if (smileyPointsElement) {
        smileyPointsElement.textContent = smiley_points;
    }
    
    // Stelle sicher, dass die Elemente existieren, bevor du sie verwendest
    if (forschungFortschrittBalken && forschungFortschrittText) {
        const forschungFortschritt = (forschungPunkte / forschungUpgradeKosten) * 100;
        forschungFortschrittBalken.style.width = forschungFortschritt + '%';
        forschungFortschrittText.innerText = Math.floor(forschungFortschritt) + '%';
    }
}


function formatLargeNumber(number) {
    if (number > 999) {
        return Intl.NumberFormat('de-DE', { notation: 'compact', maximumFractionDigits: 2 }).format(number);
    }
    return Math.round(number).toLocaleString('de-DE');
}

function updateDisplay() {
    const smileyPointsMain = document.getElementById("smiley_points");
    if (smileyPointsMain) smileyPointsMain.innerText = smiley_points;
    const multiplikatorMain = document.getElementById("multiplikator_anzeige");
    if (multiplikatorMain) multiplikatorMain.innerText = multiplikator;
    const aktuelleSmileysMain = document.getElementById("aktuelle_smileys");
    if (aktuelleSmileysMain) aktuelleSmileysMain.innerText = formatLargeNumber(aktuelle_smileys);
    const gesammelteSmileysMain = document.getElementById("gesammelte_smileys");
    if (gesammelteSmileysMain) gesammelteSmileysMain.innerText = formatLargeNumber(gesammelte_smileys);
    const prestigeKostenMain = document.getElementById("prestige_kosten_anzeige");
    if (prestigeKostenMain) prestigeKostenMain.innerText = formatLargeNumber(prestige_kosten);
    
    const autoClickerSPS = (auto_klicker_count * autoClickerSpeedBonus * (1 + autoClickerResearchBonus)) + autoClickerClickBonus + autoClickerProductionBonus;
    const smileyTreeSPS = smileyTreeProduction * (20 * (1 + smileyTreeResearchBonus));
    const smileyFactorySPS = smileyFactoryProduction * (150 * (1 + smileyFactoryResearchBonus));
    
    const totalSPS = (autoClickerSPS + smileyTreeSPS + smileyFactorySPS) * (1 + efficiencyBonus) * globalerMultiplikator;
    
    const spsAnzeige = document.getElementById("sps_anzeige");
    if (spsAnzeige) spsAnzeige.innerText = formatLargeNumber(totalSPS);
    
    const smpAnzeige = document.getElementById("smp_anzeige");
    if (smpAnzeige) smpAnzeige.innerText = formatLargeNumber(totalSPS * 60);
    
    const aktuelleSmileysUpgrades = document.getElementById("aktuelle_smileys_upgrades");
    if (aktuelleSmileysUpgrades) aktuelleSmileysUpgrades.innerText = formatLargeNumber(aktuelle_smileys);
    
    const smileyPointsUpgrades = document.getElementById("smiley_points_upgrades");
    if (smileyPointsUpgrades) smileyPointsUpgrades.innerText = smiley_points;
    
    const spsAnzeigeUpgrades = document.getElementById("sps_anzeige_upgrades");
    if (spsAnzeigeUpgrades) spsAnzeigeUpgrades.innerText = formatLargeNumber(totalSPS);
    
    const smpAnzeigeUpgrades = document.getElementById("smp_anzeige_upgrades");
    if (smpAnzeigeUpgrades) smpAnzeigeUpgrades.innerText = formatLargeNumber(totalSPS * 60);
    
    const autoKlickerButton = document.getElementById("auto_clicker_button_1x");
    if (autoKlickerButton) autoKlickerButton.innerText = `Kaufen (${formatLargeNumber(auto_clicker_cost)} Smileys)`;
    const autoKlickerCountAnzeige = document.getElementById("auto_klicker_count_anzeige");
    if (autoKlickerCountAnzeige) autoKlickerCountAnzeige.innerText = auto_klicker_count;
    
    const smileyTreeCost = smileyTreeBaseCost * Math.pow(smileyTreeGrowthRate, smileyTreeProduction);
    const smileyTreeButton = document.getElementById("smileyTreeButton1x");
    if (smileyTreeButton) smileyTreeButton.innerText = `Kaufen (${formatLargeNumber(smileyTreeCost)} Smileys)`;
    const smileyTreeCountAnzeige = document.getElementById("smileyTreeCountAnzeige");
    if (smileyTreeCountAnzeige) smileyTreeCountAnzeige.innerText = smileyTreeProduction;
    
    const smileyFactoryCost = smileyFactoryBaseCost * Math.pow(smileyFactoryGrowthRate, smileyFactoryProduction);
    const smileyFactoryButton = document.getElementById("smileyFactoryButton1x");
    if (smileyFactoryButton) smileyFactoryButton.innerText = `Kaufen (${formatLargeNumber(smileyFactoryCost)} Smileys)`;
    const smileyFactoryCountAnzeige = document.getElementById("smileyFactoryCountAnzeige");
    if (smileyFactoryCountAnzeige) smileyFactoryCountAnzeige.innerText = smileyFactoryProduction;
    
    const forschungslaborCost = forschungslaborBaseCost * Math.pow(forschungslaborGrowthRate, forschungslabor_count);
    const forschungslaborButton = document.getElementById("forschungslaborButton");
    if (forschungslaborButton) forschungslaborButton.innerText = `Kaufen (${formatLargeNumber(forschungslaborCost)} Smileys)`;
    const forschungslaborCountAnzeige = document.getElementById("forschungslabor_count_anzeige");
    if (forschungslaborCountAnzeige) forschungslaborCountAnzeige.innerText = forschungslabor_count;
    
    const forschungPunkteAnzeige = document.getElementById("forschung_punkte_anzeige");
    if (forschungPunkteAnzeige) forschungPunkteAnzeige.innerText = formatLargeNumber(forschungspunkte);
    
    const multiplikatorKostenAnzeige = document.getElementById("multiplikator_kosten_anzeige");
    if (multiplikatorKostenAnzeige) multiplikatorKostenAnzeige.innerText = 10 * Math.pow(1.5, multiplikator - 1);

    const allBuyButtons = document.querySelectorAll('.upgrade-button');
allBuyButtons.forEach(button => {
    const cost = parseFloat(button.dataset.cost);
    if (aktuelle_smileys >= cost) {
        button.disabled = false;
        button.classList.remove('disabled');
    } else {
        button.disabled = true;
        button.classList.add('disabled');
    }
});
}

function produziereSmileys() {
    const autoClickerSPS = (auto_klicker_count * autoClickerSpeedBonus * (1 + autoClickerResearchBonus)) + autoClickerClickBonus + autoClickerProductionBonus;
    const smileyTreeSPS = smileyTreeProduction * (20 * (1 + smileyTreeResearchBonus));
    const smileyFactorySPS = smileyFactoryProduction * (150 * (1 + smileyFactoryResearchBonus));
    
    const totalSPS = (autoClickerSPS + smileyTreeSPS + smileyFactorySPS) * (1 + efficiencyBonus) * globalerMultiplikator;
    
    aktuelle_smileys += totalSPS / 10;
    gesammelte_smileys += totalSPS / 10;
    
    if (forschungslabor_count > 0) {
        forschungspunkte += forschungslabor_count * 0.005 * forschungslabor_fps_multiplier;
    }
    
    if (aktuelle_smileys >= prestige_kosten) {
        const prestigeButton = document.getElementById("prestige_button");
        if (prestigeButton) {
            prestigeButton.classList.add("available");
        }
    } else {
        const prestigeButton = document.getElementById("prestige_button");
        if (prestigeButton) {
            prestigeButton.classList.remove("available");
        }
    }
    
    updateDisplay();
}

function klickeSmiley() {
    aktuelle_smileys += multiplikator * (1 + klickUpgradeBonus);
    gesammelte_smileys += multiplikator * (1 + klickUpgradeBonus);
    gesamteGeklickteSmileys += multiplikator * (1 + klickUpgradeBonus);
    speichereSpiel();
    updateDisplay();
}

function kaufeAutoKlicker() {
    auto_clicker_cost = autoClickerBaseCost * Math.pow(autoClickerGrowthRate, auto_klicker_count) * autoClickerCostReduction;
    
    if (aktuelle_smileys >= auto_clicker_cost) {
        aktuelle_smileys -= auto_clicker_cost;
        auto_klicker_count++;
        gekaufteAutoKlicker++;
        
        auto_clicker_cost = auto_clicker_cost * autoClickerGrowthRate;
        
        speichereSpiel();
        updateDisplay();
        zeigeKaufBestatigung("Erfolg!", "Auto-Klicker erfolgreich gekauft.", true);
    } else {
        zeigeKaufBestatigung("Fehler!", "Nicht genügend Smileys für einen Auto-Klicker!", false);
    }
}

function kaufeSmileyBaum() {
    const cost = smileyTreeBaseCost * Math.pow(smileyTreeGrowthRate, smileyTreeProduction);
    if (aktuelle_smileys >= cost) {
        aktuelle_smileys -= cost;
        smileyTreeProduction++;
        gekaufteSmileyBaeume++;
        speichereSpiel();
        updateDisplay();
        zeigeKaufBestatigung("Erfolg!", "Smiley-Baum erfolgreich gekauft.", true);
    } else {
        zeigeKaufBestatigung("Fehler!", "Nicht genügend Smileys für einen Smiley-Baum!", false);
    }
}

function kaufeSmileyFabrik() {
    const cost = smileyFactoryBaseCost * Math.pow(smileyFactoryGrowthRate, smileyFactoryProduction);
    if (aktuelle_smileys >= cost) {
        aktuelle_smileys -= cost;
        smileyFactoryProduction++;
        gekaufteSmileyFabriken++;
        speichereSpiel();
        updateDisplay();
        zeigeKaufBestatigung("Erfolg!", "Smiley-Fabrik erfolgreich gekauft.", true);
    } else {
        zeigeKaufBestatigung("Fehler!", "Nicht genügend Smileys für eine Smiley-Fabrik!", false);
    }
}

function kaufeForschungslabor() {
    const cost = forschungslaborBaseCost * Math.pow(forschungslaborGrowthRate, forschungslabor_count);
    if (aktuelle_smileys >= cost) {
        aktuelle_smileys -= cost;
        forschungslabor_count++;
        speichereSpiel();
        updateDisplay();
}}

function kaufeForschungsUpgrade() {
    const upgrade = researchUpgrades[researchUpgradeIndex];
    
    // Prüfe, ob es noch Upgrades zu kaufen gibt
    if (!upgrade) {
        alert("Alle Forschungs-Upgrades wurden bereits gekauft!");
        return;
    }
    
    // Prüfe, ob genug Forschungspunkte vorhanden sind
    if (forschungspunkte >= upgrade.cost) {
        // Kosten abziehen
        forschungspunkte -= upgrade.cost;
        
        // Upgrade-Effekt anwenden
        // Wir nutzen die dynamischen Variablen aus dem Array
        if (upgrade.bonusVariable) {
            window[upgrade.bonusVariable] += upgrade.value;
        }

        // Zum nächsten Upgrade wechseln
        researchUpgradeIndex++;
        
        // Spiel speichern und UI aktualisieren
        speichereSpiel();
        updateDisplay();
        updateUpgradesDisplay();
        
        alert(`Forschungs-Upgrade "${upgrade.description}" erfolgreich gekauft!`);
    } else {
        // Meldung, wenn nicht genug Forschungspunkte vorhanden sind
        alert(`Nicht genug Forschungspunkte! Benötigt: ${upgrade.cost}`);
    }
}

function kaufeAutoKlickerUpgrade() {
    const upgrade = autoClickerUpgrades[autoClickerUpgradeIndex];
    if (!upgrade) {
        zeigeKaufBestatigung("Hinweis", "Alle Auto-Klicker Upgrades gekauft!", true);
        return;
    }
    if (aktuelle_smileys >= upgrade.cost) {
        aktuelle_smileys -= upgrade.cost;
        
        switch(upgrade.type) {
            case 'speed':
                autoClickerSpeedBonus = upgrade.value;
                break;
            case 'click':
                autoClickerClickBonus = upgrade.value;
                break;
            case 'efficiency':
                autoClickerEfficiencyBonus += upgrade.value;
                break;
            case 'cost':
                autoClickerCostReduction = upgrade.value;
                break;
        }
        autoClickerUpgradeIndex++;
        speichereSpiel();
        updateDisplay();
        zeigeKaufBestatigung("Erfolg!", `Auto-Klicker Upgrade erfolgreich gekauft.`, true);
    } else {
        zeigeKaufBestatigung("Fehler!", `Nicht genügend Smileys! Benötigt: ${upgrade.cost}`, false);
    }
}

function klickePrestige() {
    const prestigeTextElement = document.getElementById("prestige_text");
    if (prestigeTextElement) {
        prestigeTextElement.innerHTML = `Wenn du das Smileyversum aktivierst, verlierst du alle deine aktuellen Smileys, Auto-Klicker und Upgrades. Im Gegenzug erhältst du Prestige-Punkte. Du benötigst ${formatLargeNumber(prestige_kosten)} Smileys, um fortzufahren.`;
    }
    const modal = document.getElementById("warnung_fenster");
    if (modal) {
        modal.style.display = "flex";
    }
}

function bestatigePrestige() {
    const modal = document.getElementById("warnung_fenster");
    if (modal) {
        modal.style.display = "none";
    }
    
    if (aktuelle_smileys >= prestige_kosten) {
        const neuePrestigePunkte = Math.floor(Math.sqrt(aktuelle_smileys / 1000));
        prestige_punkte += neuePrestigePunkte;
        gesamtPrestigePunkte += neuePrestigePunkte;
        
        aktuelle_smileys = 0;
        gesammelte_smileys = 0;
        multiplikator = 1;
        auto_klicker_count = 0;
        auto_clicker_cost = 20;
        smileyTreeProduction = 0;
        smileyFactoryProduction = 0;
        forschungspunkte = 0;
        forschungslabor_count = 0;
        klickUpgradeBonus = 0;
        autoClickerResearchBonus = 0;
        smileyTreeResearchBonus = 0;
        smileyFactoryResearchBonus = 0;
        efficiencyBonus = 0;
        autoClickerSpeedBonus = 1;
        autoClickerClickBonus = 0;
        autoClickerEfficiencyBonus = 0;
        autoClickerProductionBonus = 0;
        autoClickerCostReduction = 1;
        autoClickerGrowthRate = 1.1;
        researchUpgradeIndex = 0;
        
        prestige_kosten = 1000 * Math.pow(2, prestige_punkte);
        
        speichereSpiel();
        updateGame();
        
        alert(`Prestige erfolgreich! Du hast ${neuePrestigePunkte} Prestige-Punkte erhalten. Du hast jetzt insgesamt ${prestige_punkte} Prestige-Punkte.`);
    } else {
        alert("Du hast nicht genügend Smileys, um das Smileyversum zu aktivieren!");
    }
}

function schliesseBestatigungsFenster() {
    const modal = document.getElementById("kauf_bestaetigung_fenster");
    if (modal) {
        modal.style.display = "none";
    }
}

function resetGame() {
    localStorage.clear();
    location.reload();
}
//================================================================================================================
// --- INITIALISIERUNG & EVENT-LISTENER ---
//================================================================================================================
window.onload = function() {
    ladeSpiel();
    updateGame();

    document.addEventListener('click', function(event) {
    const target = event.target;
    if (target.classList.contains('upgrade-button')) {
        const index = target.dataset.index;
        const type = target.dataset.type;
        
        kaufeItem(type, index);
    }
});
    const smileyButton = document.getElementById("smiley_button");
    if (smileyButton) smileyButton.addEventListener("click", klickeSmiley);
    
    // Die folgenden spezifischen Event-Listener wurden gelöscht
    // const autoClickerButton1x = document.getElementById("auto_clicker_button_1x");
    // if (autoClickerButton1x) autoClickerButton1x.addEventListener("click", kaufeAutoKlicker);
    // ...und so weiter...

    const prestigeButton = document.getElementById("prestige_button");
    if (prestigeButton) prestigeButton.addEventListener("click", klickePrestige);
    
    const closePrestigeModal = document.querySelector("#warnung_fenster .close-button");
    if (closePrestigeModal) closePrestigeModal.addEventListener("click", () => document.getElementById("warnung_fenster").style.display = "none");
    
    const confirmPrestige = document.getElementById("bestatige_prestige_button");
    if (confirmPrestige) confirmPrestige.addEventListener("click", bestatigePrestige);

    const resetGameButton = document.getElementById("reset_button");
    if (resetGameButton) resetGameButton.addEventListener("click", () => {
        const modal = document.getElementById("reset_warnung_fenster");
        if (modal) modal.style.display = "flex";
    });

    const resetConfirmButton = document.getElementById("reset_bestatigen_button");
    if (resetConfirmButton) resetConfirmButton.addEventListener("click", resetGame);
    const resetCancelButton = document.getElementById("reset_abbrechen_button");
    if (resetCancelButton) resetCancelButton.addEventListener("click", () => {
        const modal = document.getElementById("reset_warnung_fenster");
        if (modal) modal.style.display = "none";
    });
    const forschungslaborButton = document.getElementById("forschungslaborButton");
    if (forschungslaborButton) forschungslaborButton.addEventListener("click", kaufeForschungslabor);

    const navLinks = document.querySelectorAll(".navbar a");
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const href = e.currentTarget.getAttribute("href");
            if (href) {
                e.preventDefault();
                updateGame();
                window.location.href = href;
            }
        });
    });

    const closeKaufModal = document.querySelector("#kauf_bestaetigung_fenster .close-button");
    if (closeKaufModal) closeKaufModal.addEventListener("click", schliesseBestatigungsFenster);

    updateUpgradesDisplay();
    
    // Die folgenden spezifischen Event-Listener für Klick- und Multiplikator-Upgrades wurden ebenfalls gelöscht
    // const klickUpgrade1Button = document.getElementById("klick_upgrade_1_button");
    // if (klickUpgrade1Button) klickUpgrade1Button.addEventListener("click", () => kaufeKlickUpgrade(1));
    // ...

    const prestigeGrid = document.getElementById("prestige_upgrades_grid");
    if (prestigeGrid) {
        updatePrestigeShopDisplay();
    }

    setInterval(produziereSmileys, 100);

    // Hier sollte der neue universelle Event-Listener stehen
    document.addEventListener('click', function(event) {
        const target = event.target;
        if (target.classList.contains('upgrade-button')) {
            const index = target.dataset.index;
            const type = target.dataset.type;
            
            // Jetzt musst du hier die Logik zum Kaufen einfügen
                kaufeItem(type, index);
        }
    }); 
}


setInterval(updateGame, 1000);

const researchUpgradeButton = document.getElementById('forschungUpgradeButton');

if (researchUpgradeButton) {
    researchUpgradeButton.addEventListener('click', () => {
        // Prüfe, ob genug Forschungspunkte für den Kauf vorhanden sind
        if (forschungPunkte >= forschungUpgradeKosten) {
            // Kosten abziehen
            forschungPunkte -= forschungUpgradeKosten;
            
            // Erhöhe die Forschungspunkte pro Sekunde (Beispiel)
            // Du kannst einen festen Wert hinzufügen oder einen Multiplikator verwenden
            forschungPunkte += forschungPunkteProSekunde / 10;
            
            // Hier kannst du auch die Kosten für das nächste Upgrade erhöhen,
            // um das Spiel schwieriger zu machen.
            // forschungUpgradeKosten *= 2; 
            forschungUpgradeKosten = Math.floor(forschungUpgradeKosten * 1.5);
            
            // Aktualisiere die UI, um die neuen Forschungspunkte und SPS anzuzeigen
            document.getElementById('forschung_punkte_anzeige').innerText = Math.floor(forschungPunkte);
            // Falls du eine SPS-Anzeige hast, die Forschungspunkte betrifft:
            // document.getElementById('sps_anzeige_upgrades').innerText = Math.floor(s_p_s); 
        } else {
            // Zeige eine Warnung, falls nicht genug Forschungspunkte vorhanden sind
            alert("Nicht genug Forschungspunkte!");
        }
    });
}
}); 

















