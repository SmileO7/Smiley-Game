//================================================================================================================
// --- VARIABLEN & DATEN ---
//================================================================================================================
let aktuelle_smileys = parseInt(localStorage.getItem('aktuelle_smileys')) || 0;
let gesammelte_smileys = parseInt(localStorage.getItem('gesammelte_smileys')) || 0;
let smiley_points = parseInt(localStorage.getItem('smiley_points')) || 0;
let multiplikator = parseInt(localStorage.getItem('multiplikator')) || 1;
let auto_klicker_count = parseInt(localStorage.getItem('auto_klicker_count')) || 0;
let auto_clicker_cost = parseInt(localStorage.getItem('auto_clicker_cost')) || 0;
let prestige_kosten = parseInt(localStorage.getItem('prestige_kosten')) || 1000;
let prestige_punkte = parseInt(localStorage.getItem('prestige_punkte')) || 0;
let smileyTreeProduction = parseInt(localStorage.getItem('smileyTreeProduction')) || 0;
let globalerMultiplikator = parseFloat(localStorage.getItem('globalerMultiplikator')) || 1.0;
let smileyFactoryProduction = parseInt(localStorage.getItem('smileyFactoryProduction')) || 0;
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

function zeigeKaufBestatigung(titel, nachricht, istErfolg) {
    const modal = document.getElementById("kauf_bestaetigung_fenster");
    const modalContent = modal.querySelector(".modal-content");
    const titelElement = modal.querySelector("h3");
    const nachrichtElement = modal.querySelector("p");

    titelElement.innerText = titel;
    nachrichtElement.innerText = nachricht;

    if (istErfolg) {
        modalContent.classList.remove('error');
    } else {
        modalContent.classList.add('error');
    }
    modal.style.display = "flex";
}

function speichereSpiel() {
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
}

function updateGame() {
    speichereSpiel();
    updateDisplay();
    const smileyPointsElement = document.getElementById("smiley_points");
    if (smileyPointsElement) {
        smileyPointsElement.textContent = smiley_points;
    }
}

function formatLargeNumber(number) {
    if (number > 999) {
        return Intl.NumberFormat('de-DE', {
            notation: 'compact',
            maximumFractionDigits: 2
        }).format(number);
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
    const multiplikatorPerClick = document.getElementById("multiplikator_per_click");
    if (multiplikatorPerClick) multiplikatorPerClick.innerText = (multiplikator * (1 + klickUpgradeBonus)).toFixed(2);
    const autoClickerSPS = (auto_klicker_count * autoClickerSpeedBonus * (1 + autoClickerResearchBonus)) + autoClickerClickBonus + autoClickerProductionBonus;
    const smileyTreeSPS = smileyTreeProduction * (20 + smileyTreeResearchBonus);
    const smileyFactorySPS = smileyFactoryProduction * (150 + smileyFactoryResearchBonus);
    const sps = (autoClickerSPS + smileyTreeSPS + smileyFactorySPS) * (1 + autoClickerEfficiencyBonus + efficiencyBonus) * globalerMultiplikator;
    const smp = sps * 60;
    const spsAnzeigeMain = document.getElementById("sps_anzeige");
    if (spsAnzeigeMain) spsAnzeigeMain.innerText = formatLargeNumber(sps);
    const smpAnzeigeMain = document.getElementById("smp_anzeige");
    if (smpAnzeigeMain) smpAnzeigeMain.innerText = formatLargeNumber(smp);
    const smileyPointsUpgrades = document.getElementById("smiley_points_upgrades");
    if (smileyPointsUpgrades) smileyPointsUpgrades.innerText = smiley_points;
    const aktuelleSmileysUpgrades = document.getElementById("aktuelle_smileys_upgrades");
    if (aktuelleSmileysUpgrades) aktuelleSmileysUpgrades.innerText = formatLargeNumber(aktuelle_smileys);
    const autoClickerCountAnzeige = document.getElementById("auto_klicker_count_anzeige");
    if (autoClickerCountAnzeige) autoClickerCountAnzeige.innerText = auto_klicker_count;
    const smileyTreeCountAnzeige = document.getElementById("smileyTreeCountAnzeige");
    if (smileyTreeCountAnzeige) smileyTreeCountAnzeige.innerText = smileyTreeProduction;
    const smileyFactoryCountAnzeige = document.getElementById("smileyFactoryCountAnzeige");
    if (smileyFactoryCountAnzeige) smileyFactoryCountAnzeige.innerText = smileyFactoryProduction;
    const spsAnzeigeUpgrades = document.getElementById("sps_anzeige_upgrades");
    if (spsAnzeigeUpgrades) spsAnzeigeUpgrades.innerText = formatLargeNumber(sps);
    const smpAnzeigeUpgrades = document.getElementById("smp_anzeige_upgrades");
    if (smpAnzeigeUpgrades) smpAnzeigeUpgrades.innerText = formatLargeNumber(smp);
    const forschungspunkteAnzeige = document.getElementById("forschung_punkte_anzeige");
    if (forschungspunkteAnzeige) forschungspunkteAnzeige.innerText = Math.floor(forschungspunkte);
    const forschungslaborCountAnzeige = document.getElementById("forschungslabor_count_anzeige");
    if (forschungslaborCountAnzeige) forschungslaborCountAnzeige.innerText = forschungslabor_count;
    const multiplikatorKostenAnzeige = document.getElementById("multiplikator_upgrade_kosten");
    if (multiplikatorKostenAnzeige) multiplikatorKostenAnzeige.innerText = formatLargeNumber(10 * Math.pow(1.5, multiplikator - 1));
    const boosterKostenAnzeige = document.getElementById("booster_kosten_anzeige");
    if (boosterKostenAnzeige) boosterKostenAnzeige.innerText = 5000;
    updateCosts("kosten_1x", autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, auto_klicker_count, 1);
    updateCosts("kosten_10x", autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, auto_klicker_count, 10);
    updateCosts("smileyTreeCost1x", smileyTreeBaseCost, smileyTreeGrowthRate, smileyTreeProduction, 1);
    updateCosts("smileyTreeCost10x", smileyTreeBaseCost, smileyTreeGrowthRate, smileyTreeProduction, 10);
    updateCosts("smileyFactoryCost1x", smileyFactoryBaseCost, smileyFactoryGrowthRate, smileyFactoryProduction, 1);
    updateCosts("smileyFactoryCost10x", smileyFactoryBaseCost, smileyFactoryGrowthRate, smileyFactoryProduction, 10);
    const forschungslaborButton = document.getElementById("forschungslaborButton");
    if (forschungslaborButton) {
        if (forschungslabor_count > 0) {
            forschungslaborButton.style.display = 'none';
        } else {
            forschungslaborButton.style.display = 'block';
        }
    }
    const boosterButton = document.getElementById("booster_button");
    if (boosterButton) {
        if (globalerMultiplikator > 1.0) {
            boosterButton.style.display = 'none';
        } else {
            boosterButton.style.display = 'block';
        }
    }
    const klick1Group = document.getElementById("klick-upgrade-1-group");
    if (klick1Group && klickUpgradeBonus >= 0.1) klick1Group.style.display = 'none';
    const klick2Group = document.getElementById("klick-upgrade-2-group");
    if (klick2Group && klickUpgradeBonus < 0.2) klick2Group.style.display = 'block';
    else if (klick2Group) klick2Group.style.display = 'none';
    const klick3Group = document.getElementById("klick-upgrade-3-group");
    if (klick3Group && klickUpgradeBonus < 0.5) klick3Group.style.display = 'block';
    else if (klick3Group) klick3Group.style.display = 'none';
    const autoKlickerUpgradeGroups = [
        document.getElementById("auto_klicker_upgrade_1_group"),
        document.getElementById("auto_klicker_upgrade_2_group"),
        document.getElementById("auto_klicker_upgrade_3_group"),
        document.getElementById("auto_klicker_upgrade_4_group"),
        document.getElementById("auto_klicker_upgrade_5_group"),
        document.getElementById("auto_klicker_upgrade_6_group"),
        document.getElementById("auto_klicker_upgrade_7_group"),
        document.getElementById("auto_klicker_upgrade_8_group")
    ];
    if (autoClickerUpgradeIndex > 0) {
        for (let i = 0; i < autoClickerUpgradeIndex; i++) {
            if (autoKlickerUpgradeGroups[i]) autoKlickerUpgradeGroups[i].style.display = 'none';
        }
    }
    const researchProgressBar = document.getElementById('research_progress_bar');
    if (researchProgressBar) {
        const progress = (researchUpgradeIndex / researchUpgrades.length) * 100;
        researchProgressBar.style.width = `${progress}%`;
    }
    const researchUpgradeButtonsWrapper = document.querySelector('.upgrade-buttons-wrapper');
    if (researchUpgradeButtonsWrapper) {
        researchUpgradeButtonsWrapper.innerHTML = '';
        researchUpgrades.forEach((upgrade, index) => {
            const button = document.createElement('button');
            button.innerText = index + 1;
            button.className = 'research-upgrade-button';
            if (index < researchUpgradeIndex) {
                button.classList.add('bought');
                button.disabled = true;
            } else if (index === researchUpgradeIndex && forschungspunkte >= upgrade.cost) {
                button.classList.add('available');
                button.disabled = false;
                button.addEventListener('click', kaufeForschungsUpgrade);
            } else {
                button.classList.add('locked');
                button.disabled = true;
            }
            if (index === researchUpgradeIndex) {
                const tooltipSpan = document.createElement('span');
                tooltipSpan.className = 'tooltip-text';
                tooltipSpan.innerText = `${upgrade.description}\nKosten: ${upgrade.cost} Forschungspunkte`;
                button.appendChild(tooltipSpan);
            }
            researchUpgradeButtonsWrapper.appendChild(button);
        });
    }
}
function updateCosts(elementId, baseCost, growthRate, currentCount, amount) {
    const element = document.getElementById(elementId);
    if (!element) return;
    let totalCost = 0;
    for (let i = 0; i < amount; i++) {
        totalCost += Math.round(baseCost * Math.pow(growthRate, currentCount + i));
    }
    element.innerText = formatLargeNumber(totalCost);
}

function klickeSmiley() {
    let clickValue = 1 + klickUpgradeBonus;
    aktuelle_smileys += clickValue * globalerMultiplikator;
    gesammelte_smileys += clickValue * globalerMultiplikator;
    gesamteGeklickteSmileys += clickValue * globalerMultiplikator;
    gesamteGesammelteSmileys += clickValue * globalerMultiplikator;
    updateDisplay();
}

function autoClick() {
    const autoClickerSPS = (auto_klicker_count * autoClickerSpeedBonus * (1 + autoClickerResearchBonus)) + autoClickerClickBonus + autoClickerProductionBonus;
    const smileyTreeSPS = smileyTreeProduction * (20 + smileyTreeResearchBonus);
    const smileyFactorySPS = smileyFactoryProduction * (150 + smileyFactoryResearchBonus);
    const sps = (autoClickerSPS + smileyTreeSPS + smileyFactorySPS) * (1 + autoClickerEfficiencyBonus + efficiencyBonus) * globalerMultiplikator;
    aktuelle_smileys += sps;
    gesammelte_smileys += sps;
    gesamteGesammelteSmileys += sps;
    updateDisplay();
}

function autoForschung() {
    const fps = forschungslabor_count * 0.2 * forschungslabor_fps_multiplier;
    forschungspunkte += fps;
}

function resetGame() {
    localStorage.clear();
    location.reload();
}
function klickePrestige() {
    const warnungFenster = document.getElementById("warnung_fenster");
    const prestigeCostDisplay = document.getElementById("prestige_kosten_anzeige");

    if (warnungFenster && prestigeCostDisplay) {
        prestigeCostDisplay.innerText = formatLargeNumber(prestige_kosten);
        warnungFenster.style.display = "flex";
    }
}

function bestatigePrestige() {
    console.log("Die Funktion bestatigePrestige() wurde aufgerufen.");
    console.log("Gesammelte Smileys: ", gesammelte_smileys);
    console.log("Prestige Kosten: ", prestige_kosten);
    
    if (gesammelte_smileys >= prestige_kosten) {
        // Berechne die neuen Prestige-Punkte
        const neuePrestigePunkte = Math.floor(gesammelte_smileys / 100);
        
        prestige_punkte += neuePrestigePunkte;
        
        // Setze die Spielvariablen zurück
        aktuelle_smileys = 0;
        gesammelte_smileys = 0;
        multiplikator = 1;
        auto_klicker_count = 0;
        smileyTreeProduction = 0;
        smileyFactoryProduction = 0;
        forschungslabor_count = 0;
        klickUpgradeBonus = 0;
        autoClickerUpgradeIndex = 0;
        autoClickerSpeedBonus = 1;
        autoClickerClickBonus = 0;
        autoClickerEfficiencyBonus = 0;
        autoClickerProductionBonus = 0;
        autoClickerCostReduction = 1;
        autoClickerGrowthRate = 1.1;
        forschungspunkte = 0;
        researchUpgradeIndex = 0;
        autoClickerResearchBonus = 0;
        smileyTreeResearchBonus = 0;
        smileyFactoryResearchBonus = 0;
        efficiencyBonus = 0;
        
        // Erhöhe die Kosten für das nächste Prestige
        prestige_kosten = 1000 + (prestige_punkte * 100);

        alert(`Smileyversum erfolgreich! Du hast ${neuePrestigePunkte} Prestige-Punkte erhalten.`);
        schliesseWarnung();
        speichereSpiel();
        updateGame();
    } else {
        alert("Nicht genügend Smileys, um das Smileyversum zu aktivieren.");
    }
}

function schliesseWarnung() {
    const warnungFenster = document.getElementById("warnung_fenster");
    if (warnungFenster) {
        warnungFenster.style.display = "none";
    }
}


function abbrechenPrestige() {
    const warnungFenster = document.getElementById("warnung_fenster");
    if (warnungFenster) {
        warnungFenster.style.display = "none";
    }
}

function kaufeUpgrade(anzahl, baseCost, growthRate, type) {
    let currentCount;
    let name;
    if (type === 'auto_klicker') {
        currentCount = auto_klicker_count;
        name = "Auto-Klicker";
    } else if (type === 'smiley_tree') {
        currentCount = smileyTreeProduction;
        name = "Smiley-Baum";
    } else if (type === 'smiley_factory') {
        currentCount = smileyFactoryProduction;
        name = "Smiley-Fabrik";
    }

    let totalCost = 0;
    let kaufeAnzahl = anzahl;

    if (anzahl === 'max') {
        let temp_aktuelle_smileys = aktuelle_smileys;
        let temp_count = currentCount;
        while (true) {
            const kosten = Math.round(baseCost * Math.pow(growthRate, temp_count));
            if (temp_aktuelle_smileys >= kosten) {
                temp_aktuelle_smileys -= kosten;
                totalCost += kosten;
                temp_count++;
            } else {
                break;
            }
        }
        if (totalCost === 0) {
            alert("Nicht genügend Smileys, um etwas zu kaufen!");
            return;
        }
        kaufeAnzahl = temp_count - currentCount;
    } else {
        for (let i = 0; i < anzahl; i++) {
            totalCost += Math.round(baseCost * Math.pow(growthRate, currentCount + i));
        }
    }

    if (aktuelle_smileys >= Math.round(totalCost)) {
        aktuelle_smileys -= totalCost;
        if (type === 'auto_klicker') {
            auto_klicker_count += kaufeAnzahl;
            gekaufteAutoKlicker += kaufeAnzahl;
        } else if (type === 'smiley_tree') {
            smileyTreeProduction += kaufeAnzahl;
            gekaufteSmileyBaeume += kaufeAnzahl;
        } else if (type === 'smiley_factory') {
            smileyFactoryProduction += kaufeAnzahl;
            gekaufteSmileyFabriken += kaufeAnzahl;
        }
        
        updateGame();
    } else {
        alert(`Nicht genügend Smileys! Benötigt: ${totalCost}`);
    }
    function kaufUpgrade() {
    // ... (dein Kauf-Code)
    globalerMultiplikator += 0.10; // Erhöhe den Multiplikator
    updateMultiplikatorAnzeige(); // Aktualisiere die Anzeige
}
}


function kaufeKlickUpgrade(upgradeId) {
    let kosten;
    let bonus;
    if (upgradeId === 1 && klickUpgradeBonus === 0) {
        kosten = 1000;
        bonus = 0.1;
    } else if (upgradeId === 2 && klickUpgradeBonus < 0.2) {
        kosten = 5000;
        bonus = 0.2;
    } else if (upgradeId === 3 && klickUpgradeBonus < 0.5) {
        kosten = 25000;
        bonus = 0.5;
    } else {
        return;
    }

    if (aktuelle_smileys >= kosten) {
        aktuelle_smileys -= kosten;
        klickUpgradeBonus = bonus;
        gekaufteUpgrades++;
        updateGame();
    } else {
        alert(`Nicht genügend Smileys! Benötigt: ${kosten}`);
    }
}

function kaufeAutoClickerUpgrade(index) {
    const upgrade = autoClickerUpgrades[index];
    if (aktuelle_smileys >= upgrade.cost) {
        aktuelle_smileys -= upgrade.cost;
        if (upgrade.type === 'speed') {
            autoClickerSpeedBonus = upgrade.value;
        } else if (upgrade.type === 'click') {
            autoClickerClickBonus += upgrade.value;
        } else if (upgrade.type === 'cost') {
            autoClickerCostReduction = upgrade.value;
            autoClickerGrowthRate = 1.05;
        } else if (upgrade.type === 'efficiency') {
            if (index === 5) {
                autoClickerEfficiencyBonus = 0.15 + 0.2;
            } else if (index === 7) {
                autoClickerEfficiencyBonus = autoClickerEfficiencyBonus * 2;
            } else {
                autoClickerEfficiencyBonus += upgrade.value;
            }
        }
        autoClickerUpgradeIndex = index + 1;
        gekaufteUpgrades++;
        updateGame();
    } else {
        alert(`Nicht genügend Smileys! Benötigt: ${upgrade.cost}`);
    }
}
function kaufeForschungslabor() {
    const kosten = 10000;
    if (aktuelle_smileys >= kosten) {
        aktuelle_smileys -= kosten;
        forschungslabor_count += 1;
        updateGame();
    } else {
        alert("Nicht genügend Smileys!");
    }
}
function kaufeForschungsUpgrade() {
    const upgrade = researchUpgrades[researchUpgradeIndex];
    if (Math.floor(forschungspunkte) >= upgrade.cost) {
        forschungspunkte -= upgrade.cost;
        if (upgrade.type === 'autoClicker') {
            autoClickerResearchBonus = upgrade.value;
        } else if (upgrade.type === 'smileyTree') {
            smileyTreeResearchBonus = upgrade.value;
        } else if (upgrade.type === 'smileyFactory') {
            smileyFactoryResearchBonus = upgrade.value;
        } else if (upgrade.type === 'efficiency') {
            efficiencyBonus += upgrade.value;
        }
        researchUpgradeIndex++;
        updateGame();
    } else {
        alert(`Nicht genügend Forschungspunkte! Benötigt: ${upgrade.cost}`);
    }
}
function updateMultiplikatorAnzeige() {
    // 1. Hole das HTML-Element mit seiner ID
    const multiplikatorAnzeige = document.getElementById('allgemeiner_multiplikator');

    // 2. Aktualisiere den Textinhalt
    multiplikatorAnzeige.textContent = globalerMultiplikator.toFixed(2);
}

function updateStatistikDisplay() {
    const gesamteGeklickteSmileysElement = document.getElementById("gesamte_geklickte_smileys");
    if (gesamteGeklickteSmileysElement) {
        gesamteGeklickteSmileysElement.innerText = formatLargeNumber(gesamteGeklickteSmileys);
    }
    const gesamteGesammelteSmileysElement = document.getElementById("gesamte_gesammelte_smileys");
    if (gesamteGesammelteSmileysElement) {
        gesamteGesammelteSmileysElement.innerText = formatLargeNumber(gesamteGesammelteSmileys);
    }
    const gesamtPrestigePunkteElement = document.getElementById("gesamt_prestige_punkte");
    if (gesamtPrestigePunkteElement) {
        gesamtPrestigePunkteElement.innerText = gesamtPrestigePunkte;
    }
    const gekaufteUpgradesElement = document.getElementById("gekaufte_upgrades");
    if (gekaufteUpgradesElement) {
        gekaufteUpgradesElement.innerText = gekaufteUpgrades;
    }
    const gekaufteAutoKlickerElement = document.getElementById("gekauft_auto_klicker");
    if (gekaufteAutoKlickerElement) {
        gekaufteAutoKlickerElement.innerText = gekaufteAutoKlicker;
    }
    const gekaufteSmileyBaeumeElement = document.getElementById("gekauft_smiley_baeume");
    if (gekaufteSmileyBaeumeElement) {
        gekaufteSmileyBaeumeElement.innerText = gekaufteSmileyBaeume;
    }
    const gekaufteSmileyFabrikenElement = document.getElementById("gekauft_smiley_fabriken");
    if (gekaufteSmileyFabrikenElement) {
        gekaufteSmileyFabrikenElement.innerText = gekaufteSmileyFabriken;
    }
}

function ladeSpiel() {
    aktuelle_smileys = parseInt(localStorage.getItem('aktuelle_smileys')) || 0;
    gesammelte_smileys = parseInt(localStorage.getItem('gesammelte_smileys')) || 0;
    smiley_points = parseInt(localStorage.getItem('smiley_points')) || 0;
    multiplikator = parseInt(localStorage.getItem('multiplikator')) || 1;
    auto_klicker_count = parseInt(localStorage.getItem('auto_klicker_count')) || 0;
    prestige_kosten = parseInt(localStorage.getItem('prestige_kosten')) || 1000;
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
}


//================================================================================================================
// --- INITIALISIERUNG & AUTOMATISCHE PROZESSE ---
//================================================================================================================

window.onload = function() {
    ladeSpiel();
    prestigeUpgrades.forEach(upgrade => {
        if (prestigeUpgradeStates[upgrade.id]) {
            upgrade.effect();
        }
    });

    updateDisplay();
    updateStatistikDisplay();
    if (document.getElementById("prestige_upgrades_grid")) {
        updatePrestigeShopDisplay();
    }
};

setInterval(autoClick, 1000);
setInterval(autoForschung, 1000);
setInterval(updateGame, 5000);
setInterval(updateStatistikDisplay, 1000);


//================================================================================================================
// --- EVENT-LISTENER ---
//================================================================================================================
const smileyButton = document.getElementById("smiley_button");
if (smileyButton) smileyButton.addEventListener("click", klickeSmiley);
const prestigeButton = document.getElementById("prestige_button");
if (prestigeButton) prestigeButton.addEventListener("click", klickePrestige);
const bestatigenButton = document.getElementById("bestatigen_button");
if (bestatigenButton) bestatigenButton.addEventListener("click", bestatigePrestige);
const abbrechenButton = document.getElementById("abbrechen_button");
if (abbrechenButton) abbrechenButton.addEventListener("click", schliesseWarnung);
const schliessenButton = document.getElementById("schliessen");
if (schliessenButton) { schliessenButton.addEventListener("click", abbrechenPrestige); }
const autoClickerButton1 = document.getElementById("auto_clicker_button_1x");
if (autoClickerButton1) autoClickerButton1.addEventListener("click", () => kaufeUpgrade(1, autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, 'auto_klicker'));
const autoClickerButton10 = document.getElementById("auto_klicker_button_10x");
if (autoClickerButton10) autoClickerButton10.addEventListener("click", () => kaufeUpgrade(10, autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, 'auto_klicker'));

for (let i = 1; i <= 8; i++) {
    const button = document.getElementById(`auto_klicker_upgrade_${i}_button`);
    if (button) {
        button.addEventListener("click", () => kaufeAutoClickerUpgrade(i - 1));
    }
}
const smileyTreeButton1 = document.getElementById("smileyTreeButton1x");
if (smileyTreeButton1) smileyTreeButton1.addEventListener("click", () => kaufeUpgrade(1, smileyTreeBaseCost, smileyTreeGrowthRate, 'smiley_tree'));
const smileyTreeButton10 = document.getElementById("smileyTreeButton10x");
if (smileyTreeButton10) smileyTreeButton10.addEventListener("click", () => kaufeUpgrade(10, smileyTreeBaseCost, smileyTreeGrowthRate, 'smiley_tree'));

const smileyFactoryButton1 = document.getElementById("smileyFactoryButton1x");
if (smileyFactoryButton1) smileyFactoryButton1.addEventListener("click", () => kaufeUpgrade(1, smileyFactoryBaseCost, smileyFactoryGrowthRate, 'smiley_factory'));
const smileyFactoryButton10 = document.getElementById("smileyFactoryButton10x");
if (smileyFactoryButton10) smileyFactoryButton10.addEventListener("click", () => kaufeUpgrade(10, smileyFactoryBaseCost, smileyFactoryGrowthRate, 'smiley_factory'));
const boosterButton = document.getElementById("booster_button");
if (boosterButton) {
    boosterButton.addEventListener("click", () => {
        const upgradeCost = 5000;
        if (aktuelle_smileys >= upgradeCost) {
            aktuelle_smileys -= upgradeCost;
            globalerMultiplikator += 0.1;
            updateGame();
        } else {
            alert(`Nicht genügend Smileys! Benötigt: ${upgradeCost}`);
        }
    });
}
const forschungslaborButton = document.getElementById("forschungslaborButton");
if (forschungslaborButton) {
    forschungslaborButton.addEventListener("click", () => kaufeForschungslabor());
}
const klickUpgrade1Button = document.getElementById("klick_upgrade_1_button");
if (klickUpgrade1Button) klickUpgrade1Button.addEventListener("click", () => kaufeKlickUpgrade(1));
const klickUpgrade2Button = document.getElementById("klick_upgrade_2_button");
if (klickUpgrade2Button) klickUpgrade2Button.addEventListener("click", () => kaufeKlickUpgrade(2));
const klickUpgrade3Button = document.getElementById("klick_upgrade_3_button");
if (klickUpgrade3Button) klickUpgrade3Button.addEventListener("click", () => kaufeKlickUpgrade(3));
const resetButton = document.getElementById("reset_button");
if (resetButton) resetButton.addEventListener("click", () => {
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
const kaufBestatigenButton = document.getElementById("kauf_bestaetigung_fenster");
if (kaufBestatigenButton) {
    kaufBestatigenButton.addEventListener("click", () => {
        const modal = document.getElementById("kauf_bestaetigung_fenster");
        if (modal) modal.style.display = "none";
    });
}
