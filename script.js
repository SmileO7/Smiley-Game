//================================================================================================================
// ----- VARIABLEN -----
//================================================================================================================
let aktuelle_smileys = parseInt(localStorage.getItem('aktuelle_smileys')) || 0;
let gesammelte_smileys = parseInt(localStorage.getItem('gesammelte_smileys')) || 0;
let smiley_points = parseInt(localStorage.getItem('smiley_points')) || 0;
let multiplikator = parseInt(localStorage.getItem('multiplikator')) || 1;
let auto_klicker_count = parseInt(localStorage.getItem('auto_klicker_count')) || 0;
let prestige_kosten = parseInt(localStorage.getItem('prestige_kosten')) || 1000;
let volume = parseFloat(localStorage.getItem('volume')) || 1.0;
let smileyTreeProduction = parseInt(localStorage.getItem('smileyTreeProduction')) || 0;
let globalerMultiplikator = parseFloat(localStorage.getItem('globalerMultiplikator')) || 1.0;
let smileyFactoryProduction = parseInt(localStorage.getItem('smileyFactoryProduction')) || 0;
let forschungspunkte = parseInt(localStorage.getItem('forschungspunkte')) || 0;
let forschungslabor_count = parseInt(localStorage.getItem('forschungslabor_count')) || 0;
let klickUpgradeBonus = parseFloat(localStorage.getItem('klickUpgradeBonus')) || 0;
let autoClickerSpeedBonus = parseFloat(localStorage.getItem('autoClickerSpeedBonus')) || 1;
let autoClickerClickBonus = parseFloat(localStorage.getItem('autoClickerClickBonus')) || 0;
let autoClickerEfficiencyBonus = parseFloat(localStorage.getItem('autoClickerEfficiencyBonus')) || 0;
let autoClickerProductionBonus = parseFloat(localStorage.getItem('autoClickerProductionBonus')) || 0;
let autoClickerCostReduction = parseFloat(localStorage.getItem('autoClickerCostReduction')) || 1;
let researchUpgradeIndex = parseInt(localStorage.getItem('researchUpgradeIndex')) || 0;
const researchUpgrades = [
    { cost: 10, description: 'Erhöht die Produktion der Auto-Klicker um 10%', type: 'autoClicker', bonusVariable: 'autoClickerResearchBonus', value: 0.1 },
    { cost: 25, description: 'Erhöht die Produktion der Smiley-Bäume um 10%', type: 'smileyTree', bonusVariable: 'smileyTreeResearchBonus', value: 0.1 },
    { cost: 50, description: 'Erhöht die Produktion der Smiley-Fabriken um 10%', type: 'smileyFactory', bonusVariable: 'smileyFactoryResearchBonus', value: 0.1 },
    { cost: 100, description: 'Deine Auto-Klicker sind 20% effizienter.', type: 'efficiency', bonusVariable: 'efficiencyBonus', value: 0.2 },
    { cost: 200, description: 'Deine Smiley-Bäume sind 20% effizienter.', type: 'efficiency', bonusVariable: 'efficiencyBonus', value: 0.2 },
    { cost: 500, description: 'Deine Smiley-Fabriken sind 20% effizienter.', type: 'efficiency', bonusVariable: 'efficiencyBonus', value: 0.2 }
];
let autoClickerResearchBonus = 0;
let smileyTreeResearchBonus = 0;
let smileyFactoryResearchBonus = 0;
let efficiencyBonus = 0;
const autoClickerBaseCost = 20;
let autoClickerGrowthRate = parseFloat(localStorage.getItem('autoClickerGrowthRate')) || 1.1;
const smileyTreeBaseCost = 150;
const smileyTreeGrowthRate = 1.2;
const smileyFactoryBaseCost = 2500;
const smileyFactoryGrowthRate = 1.25;
const forschungslaborBaseCost = 5000;
const forschungslaborGrowthRate = 1.3;

//================================================================================================================
// ----- FUNKTIONEN -----
//================================================================================================================
// NEUE Funktion zur Anzeige des Kauf-Modals
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

// Funktion zum Speichern des Spielstands
function speichereSpiel() {
    localStorage.setItem('aktuelle_smileys', aktuelle_smileys);
    localStorage.setItem('gesammelte_smileys', gesammelte_smileys);
    localStorage.setItem('smiley_points', smiley_points);
    localStorage.setItem('multiplikator', multiplikator);
    localStorage.setItem('auto_klicker_count', auto_klicker_count);
    localStorage.setItem('prestige_kosten', prestige_kosten);
    localStorage.setItem('volume', volume);
    localStorage.setItem('smileyTreeProduction', smileyTreeProduction);
    localStorage.setItem('globalerMultiplikator', globalerMultiplikator);
    localStorage.setItem('smileyFactoryProduction', smileyFactoryProduction);
    localStorage.setItem('forschungspunkte', forschungspunkte);
    localStorage.setItem('forschungslabor_count', forschungslabor_count);
    localStorage.setItem('klickUpgradeBonus', klickUpgradeBonus);
    localStorage.setItem('autoClickerSpeedBonus', autoClickerSpeedBonus);
    localStorage.setItem('autoClickerClickBonus', autoClickerClickBonus);
    localStorage.setItem('autoClickerEfficiencyBonus', autoClickerEfficiencyBonus);
    localStorage.setItem('autoClickerProductionBonus', autoClickerProductionBonus);
    localStorage.setItem('autoClickerCostReduction', autoClickerCostReduction);
    localStorage.setItem('autoClickerUpgradeIndex', autoClickerUpgradeIndex);
    localStorage.setItem('autoClickerGrowthRate', autoClickerGrowthRate);
    localStorage.setItem('researchUpgradeIndex', researchUpgradeIndex);
    localStorage.setItem('autoClickerResearchBonus', autoClickerResearchBonus);
    localStorage.setItem('smileyTreeResearchBonus', smileyTreeResearchBonus);
    localStorage.setItem('smileyFactoryResearchBonus', smileyFactoryResearchBonus);
    localStorage.setItem('efficiencyBonus', efficiencyBonus);
}

// NEUE Funktion: updateGame(), speichert und aktualisiert die Anzeige
function updateGame() {
    speichereSpiel();
    updateDisplay();
}

// Funktion zur Formatierung großer Zahlen
function formatLargeNumber(number) {
    if (number > 1e12) {
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
    if (aktuelleSmileysMain) aktuelleSmileysMain.innerText = Math.round(aktuelle_smileys);
    const gesammelteSmileysMain = document.getElementById("gesammelte_smileys");
    if (gesammelteSmileysMain) gesammelteSmileysMain.innerText = Math.round(gesammelte_smileys);
    const prestigeKostenMain = document.getElementById("prestige_kosten_anzeige");
    if (prestigeKostenMain) prestigeKostenMain.innerText = prestige_kosten;
    const multiplikatorPerClick = document.getElementById("multiplikator_per_click");
    if (multiplikatorPerClick) multiplikatorPerClick.innerText = (multiplikator * (1 + klickUpgradeBonus)).toFixed(2);
    const autoClickerSPS = (auto_klicker_count * autoClickerSpeedBonus * (1 + autoClickerResearchBonus)) + autoClickerClickBonus + autoClickerProductionBonus;
    const smileyTreeSPS = smileyTreeProduction * (20 + smileyTreeResearchBonus);
    const smileyFactorySPS = smileyFactoryProduction * (150 + smileyFactoryResearchBonus);
    const sps = (autoClickerSPS + smileyTreeSPS + smileyFactorySPS) * (1 + autoClickerEfficiencyBonus + efficiencyBonus) * globalerMultiplikator;
    const smp = sps * 60;
    const spsAnzeigeMain = document.getElementById("sps_anzeige");
    if (spsAnzeigeMain) spsAnzeigeMain.innerText = Math.round(sps);
    const smpAnzeigeMain = document.getElementById("smp_anzeige");
    if (smpAnzeigeMain) smpAnzeigeMain.innerText = Math.round(smp);
    const smileyPointsUpgrades = document.getElementById("smiley_points_upgrades");
    if (smileyPointsUpgrades) smileyPointsUpgrades.innerText = smiley_points;
    const aktuelleSmileysUpgrades = document.getElementById("aktuelle_smileys_upgrades");
    if (aktuelleSmileysUpgrades) aktuelleSmileysUpgrades.innerText = Math.round(aktuelle_smileys);
    const autoClickerCountAnzeige = document.getElementById("auto_klicker_count_anzeige");
    if (autoClickerCountAnzeige) autoClickerCountAnzeige.innerText = auto_klicker_count;
    const smileyTreeCountAnzeige = document.getElementById("smileyTreeCountAnzeige");
    if (smileyTreeCountAnzeige) smileyTreeCountAnzeige.innerText = smileyTreeProduction;
    const smileyFactoryCountAnzeige = document.getElementById("smileyFactoryCountAnzeige");
    if (smileyFactoryCountAnzeige) smileyFactoryCountAnzeige.innerText = smileyFactoryProduction;
    const spsAnzeigeUpgrades = document.getElementById("sps_anzeige_upgrades");
    if (spsAnzeigeUpgrades) spsAnzeigeUpgrades.innerText = Math.round(sps);
    const smpAnzeigeUpgrades = document.getElementById("smp_anzeige_upgrades");
    if (smpAnzeigeUpgrades) smpAnzeigeUpgrades.innerText = Math.round(smp);
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
    updateCosts("kosten_50x", autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, auto_klicker_count, 50);
    updateMaxCost("kosten_max", autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, auto_klicker_count);
    updateCosts("smileyTreeCost1x", smileyTreeBaseCost, smileyTreeGrowthRate, smileyTreeProduction, 1);
    updateCosts("smileyTreeCost10x", smileyTreeBaseCost, smileyTreeGrowthRate, smileyTreeProduction, 10);
    updateCosts("smileyTreeCost50x", smileyTreeBaseCost, smileyTreeGrowthRate, smileyTreeProduction, 50);
    updateMaxCost("smileyTreeCostMax", smileyTreeBaseCost, smileyTreeGrowthRate, smileyTreeProduction);
    updateCosts("smileyFactoryCost1x", smileyFactoryBaseCost, smileyFactoryGrowthRate, smileyFactoryProduction, 1);
    updateCosts("smileyFactoryCost10x", smileyFactoryBaseCost, smileyFactoryGrowthRate, smileyFactoryProduction, 10);
    updateCosts("smileyFactoryCost50x", smileyFactoryBaseCost, smileyFactoryGrowthRate, smileyFactoryProduction, 50);
    updateMaxCost("smileyFactoryCostMax", smileyFactoryBaseCost, smileyFactoryGrowthRate, smileyFactoryProduction);
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
    element.innerText = totalCost;
}
function updateMaxCost(elementId, baseCost, growthRate, currentCount) {
    const element = document.getElementById(elementId);
    if (!element) return;
    let totalCost = 0;
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
    element.innerText = totalCost;
}

// UPDATE: FÜGT updateDisplay() HINZU
function klickeSmiley() {
    aktuelle_smileys += (multiplikator * globalerMultiplikator * (1 + klickUpgradeBonus));
    gesammelte_smileys += (multiplikator * globalerMultiplikator * (1 + klickUpgradeBonus));
    updateDisplay();
}

// UPDATE: ENTFERNT updateDisplay()
function autoClick() {
    const autoClickerSPS = (auto_klicker_count * autoClickerSpeedBonus * (1 + autoClickerResearchBonus)) + autoClickerClickBonus + autoClickerProductionBonus;
    const smileyTreeSPS = smileyTreeProduction * (20 + smileyTreeResearchBonus);
    const smileyFactorySPS = smileyFactoryProduction * (150 + smileyFactoryResearchBonus);
    const sps = (autoClickerSPS + smileyTreeSPS + smileyFactorySPS) * (1 + autoClickerEfficiencyBonus + efficiencyBonus) * globalerMultiplikator;
    aktuelle_smileys += sps;
    gesammelte_smileys += sps;
}

// UPDATE: ENTFERNT updateDisplay()
function autoForschung() {
    const fps = forschungslabor_count * 0.2;
    forschungspunkte += fps;
}
function resetGame() {
    localStorage.clear();
    location.reload();
}
function klickprestige() {
    const warnungFenster = document.getElementById("warnung_fenster");
    if (warnungFenster) {
        warnungFenster.style.display = "flex";
    }
}
function bestatigePrestige() {
    if (gesammelte_smileys >= prestige_kosten) {
        smiley_points += Math.floor(Math.sqrt(gesammelte_smileys / 100000));
        multiplikator = 1 + smiley_points;
        aktuelle_smileys = 0;
        gesammelte_smileys = 0;
        auto_klicker_count = 0;
        smileyTreeProduction = 0;
        smileyFactoryProduction = 0;
        forschungslabor_count = 0;
        globalerMultiplikator = 1.0;
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
        prestige_kosten = 1000 + (smiley_points * 100); 
        updateGame();
        schliesseWarnung();
    } else {
        alert("Du hast nicht genügend Smileys, um Prestige zu aktivieren.");
    }
}
function schliesseWarnung() {
    const warnungFenster = document.getElementById("warnung_fenster");
    if (warnungFenster) {
        warnungFenster.style.display = "none";
    }
}
function kaufeMultiplikatorUpgrade() {
    const upgradeCost = Math.round(10 * Math.pow(1.5, multiplikator - 1));
    if (smiley_points >= upgradeCost) {
        smiley_points -= upgradeCost;
        multiplikator += 1;
        updateGame();
    } else {
        alert(`Nicht genügend Smileyvers-Punkte! Benötigt: ${upgradeCost}`);
    }
}
function kaufeUpgrade(anzahl, baseCost, growthRate, type) {
    let currentCount;
    let name;
    if (type === 'auto_clicker') {
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

    if (aktuelle_smileys >= totalCost) {
        aktuelle_smileys -= totalCost;
        if (type === 'auto_clicker') auto_klicker_count += kaufeAnzahl;
        else if (type === 'smiley_tree') smileyTreeProduction += kaufeAnzahl;
        else if (type === 'smiley_factory') smileyFactoryProduction += kaufeAnzahl;
        
        updateGame();
    } else {
        alert(`Nicht genügend Smileys! Benötigt: ${totalCost}`);
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
        updateGame();
    } else {
        alert(`Nicht genügend Smileys! Benötigt: ${kosten}`);
    }
}
let autoClickerUpgradeIndex = parseInt(localStorage.getItem('autoClickerUpgradeIndex')) || 0;
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
        updateGame();
    } else {
        alert(`Nicht genügend Smileys! Benötigt: ${upgrade.cost}`);
    }
}
function kaufeForschungslabor() {
    const kosten = 5000;
    if (forschungslabor_count === 0 && aktuelle_smileys >= kosten) {
        aktuelle_smileys -= kosten;
        forschungslabor_count = 1;
        updateGame();
    } else if (forschungslabor_count > 0) {
        alert("Du kannst nur ein Forschungslabor besitzen.");
    } else {
        alert("Nicht genügend Smileys! Benötigt: " + kosten);
    }
}
function kaufeForschungsUpgrade() {
    const upgrade = researchUpgrades[researchUpgradeIndex];
    if (forschungspunkte >= upgrade.cost) {
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
function updateVolume() {
    const volumeSlider = document.getElementById("volume_slider");
    if (volumeSlider) {
        volume = volumeSlider.value / 100;
        speichereSpiel();
    }
}

//================================================================================================================
// ----- EVENT-LISTENER -----
//================================================================================================================
const smileyButton = document.getElementById("smiley_button");
if (smileyButton) smileyButton.addEventListener("click", klickeSmiley);
const prestigeButton = document.getElementById("prestige_button");
if (prestigeButton) prestigeButton.addEventListener("click", klickprestige);
const bestatigenButton = document.getElementById("bestatigen_button");
if (bestatigenButton) bestatigenButton.addEventListener("click", bestatigePrestige);
const abbrechenButton = document.getElementById("abbrechen_button");
if (abbrechenButton) abbrechenButton.addEventListener("click", schliesseWarnung);
const upgradeMultiplikatorButton = document.getElementById("upgrade_multiplikator_10_button");
if (upgradeMultiplikatorButton) upgradeMultiplikatorButton.addEventListener("click", kaufeMultiplikatorUpgrade);
const autoClickerButton1 = document.getElementById("auto_clicker_button_1x");
if (autoClickerButton1) autoClickerButton1.addEventListener("click", () => kaufeUpgrade(1, autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, 'auto_clicker'));
const autoClickerButton10 = document.getElementById("auto_clicker_button_10x");
if (autoClickerButton10) autoClickerButton10.addEventListener("click", () => kaufeUpgrade(10, autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, 'auto_clicker'));
const autoClickerButton50 = document.getElementById("auto_klicker_button_50x");
if (autoClickerButton50) autoClickerButton50.addEventListener("click", () => kaufeUpgrade(50, autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, 'auto_clicker'));
const autoClickerButtonMax = document.getElementById("auto_klicker_button_max");
if (autoClickerButtonMax) autoClickerButtonMax.addEventListener("click", () => kaufeUpgrade('max', autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, 'auto_clicker'));
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
const smileyTreeButton50 = document.getElementById("smileyTreeButton50x");
if (smileyTreeButton50) smileyTreeButton50.addEventListener("click", () => kaufeUpgrade(50, smileyTreeBaseCost, smileyTreeGrowthRate, 'smiley_tree'));
const smileyTreeButtonMax = document.getElementById("smileyTreeButtonMax");
if (smileyTreeButtonMax) smileyTreeButtonMax.addEventListener("click", () => kaufeUpgrade('max', smileyTreeBaseCost, smileyTreeGrowthRate, 'smiley_tree'));
const smileyFactoryButton1 = document.getElementById("smileyFactoryButton1x");
if (smileyFactoryButton1) smileyFactoryButton1.addEventListener("click", () => kaufeUpgrade(1, smileyFactoryBaseCost, smileyFactoryGrowthRate, 'smiley_factory'));
const smileyFactoryButton10 = document.getElementById("smileyFactoryButton10x");
if (smileyFactoryButton10) smileyFactoryButton10.addEventListener("click", () => kaufeUpgrade(10, smileyFactoryBaseCost, smileyFactoryGrowthRate, 'smiley_factory'));
const smileyFactoryButton50 = document.getElementById("smileyFactoryButton50x");
if (smileyFactoryButton50) smileyFactoryButton50.addEventListener("click", () => kaufeUpgrade(50, smileyFactoryBaseCost, smileyFactoryGrowthRate, 'smiley_factory'));
const smileyFactoryButtonMax = document.getElementById("smileyFactoryButtonMax");
if (smileyFactoryButtonMax) smileyFactoryButtonMax.addEventListener("click", () => kaufeUpgrade('max', smileyFactoryBaseCost, smileyFactoryGrowthRate, 'smiley_factory'));
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
if (forschungslaborButton) forschungslaborButton.addEventListener("click", kaufeForschungslabor);
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
const volumeSlider = document.getElementById("volume_slider");
if (volumeSlider) volumeSlider.addEventListener("input", updateVolume);

// Event-Listener für das neue Kaufbestätigungsfenster
const kaufBestatigenButton = document.getElementById("kauf_bestaetigen_button");
if (kaufBestatigenButton) {
    kaufBestatigenButton.addEventListener("click", () => {
        const modal = document.getElementById("kauf_bestaetigung_fenster");
        if (modal) modal.style.display = "none";
    });
}
//================================================================================================================
// ----- SPIELSTART & AUTOMATISCHE PROZESSE -----
//================================================================================================================
setInterval(autoClick, 1000);
setInterval(autoForschung, 1000);
setInterval(updateGame, 5000);
window.onload = updateDisplay;