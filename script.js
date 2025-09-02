//================================================================================================================
// ----- VARIABLEN -----
//================================================================================================================

// Wir laden die Variablen aus localStorage. Wenn keine Werte vorhanden sind, verwenden wir Standardwerte.
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

// ----- NEUE VARIABLEN FÜR FORSCHUNGSSYSTEM & UPGRADES -----
let forschungspunkte = parseInt(localStorage.getItem('forschungspunkte')) || 0;
let forschungslabor_count = parseInt(localStorage.getItem('forschungslabor_count')) || 0;
let autoClickerResearchBonus = parseFloat(localStorage.getItem('autoClickerResearchBonus')) || 0;
let smileyTreeResearchBonus = parseFloat(localStorage.getItem('smileyTreeResearchBonus')) || 0;
let smileyFactoryResearchBonus = parseFloat(localStorage.getItem('smileyFactoryResearchBonus')) || 0;
let klickUpgradeBonus = parseFloat(localStorage.getItem('klickUpgradeBonus')) || 0;
let autoClickerSpeedBonus = parseFloat(localStorage.getItem('autoClickerSpeedBonus')) || 1;
let autoClickerClickBonus = parseFloat(localStorage.getItem('autoClickerClickBonus')) || 0;
let autoClickerEfficiencyBonus = parseFloat(localStorage.getItem('autoClickerEfficiencyBonus')) || 0;
let autoClickerProductionBonus = parseFloat(localStorage.getItem('autoClickerProductionBonus')) || 0;
let autoClickerCostReduction = parseFloat(localStorage.getItem('autoClickerCostReduction')) || 1;

// Konstanten für die Basis-Kosten und den Steigerungsfaktor
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
    localStorage.setItem('autoClickerResearchBonus', autoClickerResearchBonus);
    localStorage.setItem('smileyTreeResearchBonus', smileyTreeResearchBonus);
    localStorage.setItem('smileyFactoryResearchBonus', smileyFactoryResearchBonus);
    localStorage.setItem('klickUpgradeBonus', klickUpgradeBonus);
    localStorage.setItem('autoClickerSpeedBonus', autoClickerSpeedBonus);
    localStorage.setItem('autoClickerClickBonus', autoClickerClickBonus);
    localStorage.setItem('autoClickerEfficiencyBonus', autoClickerEfficiencyBonus);
    localStorage.setItem('autoClickerProductionBonus', autoClickerProductionBonus);
    localStorage.setItem('autoClickerCostReduction', autoClickerCostReduction);
    localStorage.setItem('autoClickerUpgradeIndex', autoClickerUpgradeIndex);
    localStorage.setItem('autoClickerGrowthRate', autoClickerGrowthRate);
}

// Funktion zum Aktualisieren der Anzeige auf allen Seiten
function updateDisplay() {
    // Aktualisiert die Anzeige auf der Hauptseite (index.html)
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

    // NEUE SPS-BERECHNUNG
    // Basis-Produktion pro Sekunde für jedes Gebäude
    const autoClickerSPS = (auto_klicker_count * autoClickerSpeedBonus * (1 + autoClickerResearchBonus)) + autoClickerClickBonus + autoClickerProductionBonus;
    const smileyTreeSPS = smileyTreeProduction * (20 + smileyTreeResearchBonus);
    const smileyFactorySPS = smileyFactoryProduction * (150 + smileyFactoryResearchBonus);
    
    const sps = (autoClickerSPS + smileyTreeSPS + smileyFactorySPS) * (1 + autoClickerEfficiencyBonus) * globalerMultiplikator;
    const smp = sps * 60;
    const spsAnzeigeMain = document.getElementById("sps_anzeige");
    if (spsAnzeigeMain) spsAnzeigeMain.innerText = Math.round(sps);
    const smpAnzeigeMain = document.getElementById("smp_anzeige");
    if (smpAnzeigeMain) smpAnzeigeMain.innerText = Math.round(smp);
    
    // Aktualisiert die Anzeige auf der Upgrades-Seite (upgrades.html)
    const smileyPointsUpgrades = document.getElementById("smiley_points_upgrades");
    if (smileyPointsUpgrades) smileyPointsUpgrades.innerText = smiley_points;
    const aktuelleSmileysUpgrades = document.getElementById("aktuelle_smileys_upgrades");
    if (aktuelleSmileysUpgrades) aktuelleSmileysUpgrades.innerText = Math.round(aktuelle_smileys);
    const autoClickerCountAnzeige = document.getElementById("auto_clicker_count_anzeige");
    if (autoClickerCountAnzeige) autoClickerCountAnzeige.innerText = auto_klicker_count;
    const smileyTreeCountAnzeige = document.getElementById("smileyTreeCountAnzeige");
    if (smileyTreeCountAnzeige) smileyTreeCountAnzeige.innerText = smileyTreeProduction;
    const smileyFactoryCountAnzeige = document.getElementById("smileyFactoryCountAnzeige");
    if (smileyFactoryCountAnzeige) smileyFactoryCountAnzeige.innerText = smileyFactoryProduction;
    const spsAnzeigeUpgrades = document.getElementById("sps_anzeige_upgrades");
    if (spsAnzeigeUpgrades) spsAnzeigeUpgrades.innerText = Math.round(sps);
    const smpAnzeigeUpgrades = document.getElementById("smp_anzeige_upgrades");
    if (smpAnzeigeUpgrades) smpAnzeigeUpgrades.innerText = Math.round(smp);

    // ----- NEUE ANZEIGEN FÜR FORSCHUNGSSYSTEM -----
    const forschungspunkteAnzeige = document.getElementById("forschung_punkte_anzeige");
    if (forschungspunkteAnzeige) forschungspunkteAnzeige.innerText = forschungspunkte;
    const forschungslaborCountAnzeige = document.getElementById("forschungslabor_count_anzeige");
    if (forschungslaborCountAnzeige) forschungslaborCountAnzeige.innerText = forschungslabor_count;

    // Aktualisiert die dynamischen Kosten-Anzeigen
    const multiplikatorKostenAnzeige = document.getElementById("multiplikator_upgrade_kosten");
    if (multiplikatorKostenAnzeige) multiplikatorKostenAnzeige.innerText = Math.round(10 * Math.pow(1.5, multiplikator - 1));
    const boosterKostenAnzeige = document.getElementById("booster_kosten_anzeige");
    if (boosterKostenAnzeige) boosterKostenAnzeige.innerText = 5000;

    // Auto-Klicker Kosten
    updateCosts("kosten_1x", autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, auto_klicker_count, 1);
    updateCosts("kosten_10x", autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, auto_klicker_count, 10);
    updateCosts("kosten_50x", autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, auto_klicker_count, 50);
    updateMaxCost("kosten_max", autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, auto_klicker_count);

    // Smiley-Baum Kosten
    updateCosts("smileyTreeCost1x", smileyTreeBaseCost, smileyTreeGrowthRate, smileyTreeProduction, 1);
    updateCosts("smileyTreeCost10x", smileyTreeBaseCost, smileyTreeGrowthRate, smileyTreeProduction, 10);
    updateCosts("smileyTreeCost50x", smileyTreeBaseCost, smileyTreeGrowthRate, smileyTreeProduction, 50);
    updateMaxCost("smileyTreeCostMax", smileyTreeBaseCost, smileyTreeGrowthRate, smileyTreeProduction);
    
    // Smiley-Fabrik Kosten
    updateCosts("smileyFactoryCost1x", smileyFactoryBaseCost, smileyFactoryGrowthRate, smileyFactoryProduction, 1);
    updateCosts("smileyFactoryCost10x", smileyFactoryBaseCost, smileyFactoryGrowthRate, smileyFactoryProduction, 10);
    updateCosts("smileyFactoryCost50x", smileyFactoryBaseCost, smileyFactoryGrowthRate, smileyFactoryProduction, 50);
    updateMaxCost("smileyFactoryCostMax", smileyFactoryBaseCost, smileyFactoryGrowthRate, smileyFactoryProduction);

    // ----- NEUE FORSCHUNGSLABOR KOSTEN -----
    updateCosts("forschungslaborCost1x", forschungslaborBaseCost, forschungslaborGrowthRate, forschungslabor_count, 1);
    updateCosts("forschungslaborCost10x", forschungslaborBaseCost, forschungslaborGrowthRate, forschungslabor_count, 10);
    updateCosts("forschungslaborCost50x", forschungslaborBaseCost, forschungslaborGrowthRate, forschungslabor_count, 50);
    updateMaxCost("forschungslaborCostMax", forschungslaborBaseCost, forschungslaborGrowthRate, forschungslabor_count);

    // Versteckt Buttons, die bereits gekauft wurden
    const boosterButton = document.getElementById("booster_button");
    if (boosterButton) {
        if (globalerMultiplikator > 1.0) {
            boosterButton.style.display = 'none';
        } else {
            boosterButton.style.display = 'block';
        }
    }
    // ----- FORSCHUNGS- & KLICK-UPGRADES AUSBLENDEN NACH KAUF -----
    const forschung1Group = document.getElementById("forschung-upgrade-1-group");
    if (forschung1Group && autoClickerResearchBonus > 0) {
        forschung1Group.style.display = 'none';
    }
    const forschung2Group = document.getElementById("forschung-upgrade-2-group");
    if (forschung2Group && smileyTreeResearchBonus > 0) {
        forschung2Group.style.display = 'none';
    }
    const forschung3Group = document.getElementById("forschung-upgrade-3-group");
    if (forschung3Group && smileyFactoryResearchBonus > 0) {
        forschung3Group.style.display = 'none';
    }
    const klick1Group = document.getElementById("klick-upgrade-1-group");
    if (klick1Group && klickUpgradeBonus >= 0.1) klick1Group.style.display = 'none';
    const klick2Group = document.getElementById("klick-upgrade-2-group");
    if (klick2Group && klickUpgradeBonus >= 0.2) klick2Group.style.display = 'none';
    const klick3Group = document.getElementById("klick-upgrade-3-group");
    if (klick3Group && klickUpgradeBonus >= 0.5) klick3Group.style.display = 'none';

    // ----- VERSTECKT DIE AUTO-KLICKER UPGRADES NACH KAUF -----
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
// Funktion zum Klicken auf den Smiley
function klickeSmiley() {
    aktuelle_smileys += (multiplikator * globalerMultiplikator * (1 + klickUpgradeBonus));
    gesammelte_smileys += (multiplikator * globalerMultiplikator * (1 + klickUpgradeBonus));
    updateDisplay();
}

// NEUE Funktion für den Auto-Klicker
function autoClick() {
    // Basis-Produktion pro Sekunde für jedes Gebäude
    const autoClickerSPS = (auto_klicker_count * autoClickerSpeedBonus * (1 + autoClickerResearchBonus)) + autoClickerClickBonus + autoClickerProductionBonus;
    const smileyTreeSPS = smileyTreeProduction * (20 + smileyTreeResearchBonus);
    const smileyFactorySPS = smileyFactoryProduction * (150 + smileyFactoryResearchBonus);

    // Gesamte SPS, inklusive Effizienz- und globalem Multiplikator
    const sps = (autoClickerSPS + smileyTreeSPS + smileyFactorySPS) * (1 + autoClickerEfficiencyBonus) * globalerMultiplikator;
    
    aktuelle_smileys += sps;
    gesammelte_smileys += sps;
    updateDisplay();
}

// Funktion für automatische Forschungspunkte
function autoForschung() {
    const fps = forschungslabor_count * 1;
    forschungspunkte += fps;
}

// Funktion, um den gesamten Spielstand zurückzusetzen
function resetGame() {
    localStorage.clear();
    location.reload();
}

// Funktion für das Prestige-System
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
        prestige_kosten = 1000 + (smiley_points * 100); 
        speichereSpiel();
        updateDisplay();
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

// Funktion zum Kauf eines Multiplikator-Upgrades
function kaufeMultiplikatorUpgrade() {
    const upgradeCost = Math.round(10 * Math.pow(1.5, multiplikator - 1));
    if (smiley_points >= upgradeCost) {
        smiley_points -= upgradeCost;
        multiplikator += 1;
        speichereSpiel();
        updateDisplay();
    } else {
        alert(`Nicht genügend Smileyvers-Punkte! Benötigt: ${upgradeCost}`);
    }
}

// Funktion zum Kauf eines Upgrades (vereint Auto-Klicker, Bäume, Fabriken und jetzt auch Labore)
function kaufeUpgrade(anzahl, baseCost, growthRate, type) {
    let currentCount;
    if (type === 'auto_clicker') currentCount = auto_klicker_count;
    else if (type === 'smiley_tree') currentCount = smileyTreeProduction;
    else if (type === 'smiley_factory') currentCount = smileyFactoryProduction;
    else if (type === 'forschungslabor') currentCount = forschungslabor_count;
    
    let totalCost = 0;
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
        anzahl = temp_count - currentCount;
    } else {
        for (let i = 0; i < anzahl; i++) {
            totalCost += Math.round(baseCost * Math.pow(growthRate, currentCount + i));
        }
    }

    if (aktuelle_smileys >= totalCost) {
        aktuelle_smileys -= totalCost;
        if (type === 'auto_clicker') auto_klicker_count += anzahl;
        else if (type === 'smiley_tree') smileyTreeProduction += anzahl;
        else if (type === 'smiley_factory') smileyFactoryProduction += anzahl;
        else if (type === 'forschungslabor') forschungslabor_count += anzahl;
        
        speichereSpiel();
        updateDisplay();
    } else {
        alert(`Nicht genügend Smileys! Benötigt: ${totalCost}`);
    }
}

// Funktion für den Kauf von Forschungs-Upgrades
function kaufeForschungsUpgrade(upgradeId) {
    let kosten;
    let bonusType;
    if (upgradeId === 1 && autoClickerResearchBonus === 0) {
        kosten = 10;
        bonusType = 'auto_clicker';
    } else if (upgradeId === 2 && smileyTreeResearchBonus === 0) {
        kosten = 25;
        bonusType = 'smiley_tree';
    } else if (upgradeId === 3 && smileyFactoryResearchBonus === 0) {
        kosten = 50;
        bonusType = 'smiley_factory';
    } else {
        return;
    }

    if (forschungspunkte >= kosten) {
        forschungspunkte -= kosten;
        if (bonusType === 'auto_clicker') autoClickerResearchBonus = 0.1;
        else if (bonusType === 'smiley_tree') smileyTreeResearchBonus = 0.1;
        else if (bonusType === 'smiley_factory') smileyFactoryResearchBonus = 0.1;

        speichereSpiel();
        updateDisplay();
    } else {
        alert(`Nicht genügend Forschungspunkte! Benötigt: ${kosten}`);
    }
}

// Funktion für den Kauf von Klick-Upgrades
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
        speichereSpiel();
        updateDisplay();
    } else {
        alert(`Nicht genügend Smileys! Benötigt: ${kosten}`);
    }
}

//----- NEUE LOGIK FÜR DIE 8 AUTO-KLICKER UPGRADES -----
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
            autoClickerGrowthRate = 1.05; // Setzt die Wachstumsrate herab
        } else if (upgrade.type === 'efficiency') {
            if (index === 5) {
                autoClickerEfficiencyBonus = 0.15 + 0.2; // Addiert den Fließband-Bonus
            } else if (index === 7) {
                 autoClickerEfficiencyBonus = autoClickerEfficiencyBonus * 2; // Verdoppelt den Gesamtbonus
            } else {
                 autoClickerEfficiencyBonus += upgrade.value;
            }
        }
        autoClickerUpgradeIndex = index + 1;
        speichereSpiel();
        updateDisplay();
    } else {
        alert(`Nicht genügend Smileys! Benötigt: ${upgrade.cost}`);
    }
}
//----------------------------------------------------------------------------------

// Funktion zum Aktualisieren der Lautstärke
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

// Event-Listener für Auto-Klicker
const autoClickerButton1 = document.getElementById("auto_clicker_button_1x");
if (autoClickerButton1) autoClickerButton1.addEventListener("click", () => kaufeUpgrade(1, autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, 'auto_clicker'));
const autoClickerButton10 = document.getElementById("auto_clicker_button_10x");
if (autoClickerButton10) autoClickerButton10.addEventListener("click", () => kaufeUpgrade(10, autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, 'auto_clicker'));
const autoClickerButton50 = document.getElementById("auto_clicker_button_50x");
if (autoClickerButton50) autoClickerButton50.addEventListener("click", () => kaufeUpgrade(50, autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, 'auto_clicker'));
const autoClickerButtonMax = document.getElementById("auto_clicker_button_max");
if (autoClickerButtonMax) autoClickerButtonMax.addEventListener("click", () => kaufeUpgrade('max', autoClickerBaseCost * autoClickerCostReduction, autoClickerGrowthRate, 'auto_clicker'));

// ----- NEUE AUTO-KLICKER UPGRADE-LISTENER -----
for (let i = 1; i <= 8; i++) {
    const button = document.getElementById(`auto_klicker_upgrade_${i}_button`);
    if (button) {
        button.addEventListener("click", () => kaufeAutoClickerUpgrade(i - 1));
    }
}

// Event-Listener für Smiley-Baum
const smileyTreeButton1 = document.getElementById("smileyTreeButton1x");
if (smileyTreeButton1) smileyTreeButton1.addEventListener("click", () => kaufeUpgrade(1, smileyTreeBaseCost, smileyTreeGrowthRate, 'smiley_tree'));
const smileyTreeButton10 = document.getElementById("smileyTreeButton10x");
if (smileyTreeButton10) smileyTreeButton10.addEventListener("click", () => kaufeUpgrade(10, smileyTreeBaseCost, smileyTreeGrowthRate, 'smiley_tree'));
const smileyTreeButton50 = document.getElementById("smileyTreeButton50x");
if (smileyTreeButton50) smileyTreeButton50.addEventListener("click", () => kaufeUpgrade(50, smileyTreeBaseCost, smileyTreeGrowthRate, 'smiley_tree'));
const smileyTreeButtonMax = document.getElementById("smileyTreeButtonMax");
if (smileyTreeButtonMax) smileyTreeButtonMax.addEventListener("click", () => kaufeUpgrade('max', smileyTreeBaseCost, smileyTreeGrowthRate, 'smiley_tree'));

// Event-Listener für Smiley-Fabrik
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
            speichereSpiel();
            updateDisplay();
        } else {
            alert(`Nicht genügend Smileys! Benötigt: ${upgradeCost}`);
        }
    });
}
// ----- NEUE EVENT-LISTENER FÜR FORSCHUNGSSYSTEM -----
const forschungslaborButton1 = document.getElementById("forschungslaborButton1x");
if (forschungslaborButton1) forschungslaborButton1.addEventListener("click", () => kaufeUpgrade(1, forschungslaborBaseCost, forschungslaborGrowthRate, 'forschungslabor'));
const forschungslaborButton10 = document.getElementById("forschungslaborButton10x");
if (forschungslaborButton10) forschungslaborButton10.addEventListener("click", () => kaufeUpgrade(10, forschungslaborBaseCost, forschungslaborGrowthRate, 'forschungslabor'));
const forschungslaborButton50 = document.getElementById("forschungslaborButton50x");
if (forschungslaborButton50) forschungslaborButton50.addEventListener("click", () => kaufeUpgrade(50, forschungslaborBaseCost, forschungslaborGrowthRate, 'forschungslabor'));
const forschungslaborButtonMax = document.getElementById("forschungslaborButtonMax");
if (forschungslaborButtonMax) forschungslaborButtonMax.addEventListener("click", () => kaufeUpgrade('max', forschungslaborBaseCost, forschungslaborGrowthRate, 'forschungslabor'));

const forschungUpgrade1Button = document.getElementById("forschung_upgrade_1_button");
if (forschungUpgrade1Button) forschungUpgrade1Button.addEventListener("click", () => kaufeForschungsUpgrade(1));
const forschungUpgrade2Button = document.getElementById("forschung_upgrade_2_button");
if (forschungUpgrade2Button) forschungUpgrade2Button.addEventListener("click", () => kaufeForschungsUpgrade(2));
const forschungUpgrade3Button = document.getElementById("forschung_upgrade_3_button");
if (forschungUpgrade3Button) forschungUpgrade3Button.addEventListener("click", () => kaufeForschungsUpgrade(3));

// NEUE EVENT-LISTENER FÜR KLICK-UPGRADES
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

//================================================================================================================
// ----- SPIELSTART & AUTOMATISCHE PROZESSE -----
//================================================================================================================

// Startet den Auto-Klicker in einem festen Intervall
setInterval(autoClick, 1000);

// ----- STARTET FORSCHUNGSPUNKTE-PRODUKTION -----
setInterval(autoForschung, 1000);

// Startet das automatische Speichern in einem festen Intervall (alle 5 Sekunden)
setInterval(speichereSpiel, 5000);

// Stellt sicher, dass die Anzeige beim Laden der Seite aktualisiert wird
window.onload = updateDisplay;