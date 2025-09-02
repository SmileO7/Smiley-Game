//================================================================================================================
// ----- VARIABLEN -----
//================================================================================================================

// Wir laden die Variablen aus localStorage. Wenn keine Werte vorhanden sind, verwenden wir Standardwerte.
let aktuelle_smileys = parseInt(localStorage.getItem('aktuelle_smileys')) || 0;
let gesammelte_smileys = parseInt(localStorage.getItem('gesammelte_smileys')) || 0;
let smiley_points = parseInt(localStorage.getItem('smiley_points')) || 0;
let multiplikator = parseInt(localStorage.getItem('multiplikator')) || 1;
let auto_klicker_count = parseInt(localStorage.getItem('auto_klicker_count')) || 0;
let prestige_kosten = parseInt(localStorage.getItem('prestige_kosten')) || 1000; // Dynamische Prestige-Kosten, Startwert 1000
let volume = parseFloat(localStorage.getItem('volume')) || 1.0; // Lautstärke-Einstellung, Standardwert 1.0 (100%)
let smileyTreeProduction = parseInt(localStorage.getItem('smileyTreeProduction')) || 0; // Produktion durch den Smiley-Baum
let globalerMultiplikator = parseFloat(localStorage.getItem('globalerMultiplikator')) || 1.0;
let smileyFactoryProduction = parseInt(localStorage.getItem('smileyFactoryProduction')) || 0;

// Konstanten für die Basis-Kosten und den Steigerungsfaktor
const autoClickerBaseCost = 20;
const autoClickerGrowthRate = 1.1;
const smileyTreeBaseCost = 150;
const smileyTreeGrowthRate = 1.2;
const smileyFactoryBaseCost = 2500;
const smileyFactoryGrowthRate = 1.25;

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
}

// Funktion zum Aktualisieren der Anzeige auf allen Seiten
function updateDisplay() {

    if(smileyTreeProduction> 0){
        const smileyTreeButton = document.getElementById("smileyTreeButton");
        if (smileyTreeButton) {
            smileyTreeButton.style.display = "none"; // Verstecke den Button nach dem Kauf
        }
    }
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
    if (multiplikatorPerClick) multiplikatorPerClick.innerText = multiplikator;

    const sps = (auto_klicker_count * 1 + smileyTreeProduction * 5 + smileyFactoryProduction * 25) * globalerMultiplikator;
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

    // Aktualisiert die dynamischen Kosten-Anzeigen
    const multiplikatorKostenAnzeige = document.getElementById("multiplikator_upgrade_kosten");
    if (multiplikatorKostenAnzeige) multiplikatorKostenAnzeige.innerText = Math.round(10 * Math.pow(1.5, multiplikator - 1));
    const boosterKostenAnzeige = document.getElementById("booster_kosten_anzeige");
    if (boosterKostenAnzeige) boosterKostenAnzeige.innerText = 5000;

    // Auto-Klicker Kosten
    updateCosts("kosten_1x", autoClickerBaseCost, autoClickerGrowthRate, auto_klicker_count, 1);
    updateCosts("kosten_10x", autoClickerBaseCost, autoClickerGrowthRate, auto_klicker_count, 10);
    updateCosts("kosten_50x", autoClickerBaseCost, autoClickerGrowthRate, auto_klicker_count, 50);
    updateMaxCost("kosten_max", autoClickerBaseCost, autoClickerGrowthRate, auto_klicker_count);

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

    // Versteckt Buttons, die bereits gekauft wurden
    const boosterButton = document.getElementById("booster_button");
    if (boosterButton) {
        if (globalerMultiplikator > 1.0) {
            boosterButton.style.display = 'none';
        } else {
            boosterButton.style.display = 'block';
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
    aktuelle_smileys += (multiplikator * globalerMultiplikator);
    gesammelte_smileys += (multiplikator * globalerMultiplikator);
    updateDisplay();
}

// Funktion für den Auto-Klicker
function autoClick() {
    const sps = (auto_klicker_count * 1 + smileyTreeProduction * 5 + smileyFactoryProduction * 25);
    aktuelle_smileys += sps * globalerMultiplikator;
    gesammelte_smileys += sps * globalerMultiplikator;
    updateDisplay();
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
        smiley_points += Math.floor(gesammelte_smileys / 1000);
        multiplikator = 1 + smiley_points;
        aktuelle_smileys = 0;
        gesammelte_smileys = 0;
        auto_klicker_count = 0;
        smileyTreeProduction = 0;
        smileyFactoryProduction = 0;
        prestige_kosten = 1000 + (smiley_points * 1000); // Erhöht die Kosten für das nächste Prestige
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
        zeigeKaufBestaetigung("Multiplikator-Upgrade", `Du hast deinen Multiplikator auf x${multiplikator} erhöht!`);
    } else {
        zeigeKaufBestaetigung("Kauf fehlgeschlagen", `Nicht genügend Smileyvers-Punkte! Benötigt: ${upgradeCost}`);
    }
}

// Funktion zum Kauf eines Upgrades (vereint Auto-Klicker, Bäume, Fabriken)
function kaufeUpgrade(anzahl, baseCost, growthRate, type) {
    let currentCount;
    if (type === 'auto_clicker') currentCount = auto_klicker_count;
    else if (type === 'smiley_tree') currentCount = smileyTreeProduction;
    else if (type === 'smiley_factory') currentCount = smileyFactoryProduction;
    
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
            zeigeKaufBestaetigung("Kauf fehlgeschlagen", "Nicht genügend Smileys, um etwas zu kaufen!");
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
        
        speichereSpiel();
        updateDisplay();
        zeigeKaufBestaetigung("Kauf erfolgreich!", `Du hast ${anzahl}x ${type} gekauft!`);
    } else {
        zeigeKaufBestaetigung("Kauf fehlgeschlagen", `Nicht genügend Smileys! Benötigt: ${totalCost}`);
    }
}

// Funktion zum Aktualisieren der Lautstärke
function updateVolume() {
    const volumeSlider = document.getElementById("volume_slider");
    if (volumeSlider) {
        volume = volumeSlider.value / 100;
        speichereSpiel();
    }
}

// Funktion zum Anzeigen des Kaufbestätigungsfensters
function zeigeKaufBestaetigung(titel, nachricht) {
    const modal = document.getElementById("kauf_bestaetigung_fenster");
    const nachrichtElement = document.getElementById("kauf_nachricht");
    const detailsElement = document.getElementById("kauf_details");
    if (nachrichtElement) {
        nachrichtElement.innerText = titel;
    }
    if (detailsElement) {
        detailsElement.innerText = nachricht;
    }
    if (modal) {
        modal.style.display = "flex";
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

const kaufBestatigenButton = document.getElementById("kauf_bestaetigung_button");
if (kaufBestatigenButton) kaufBestatigenButton.addEventListener("click", () => {
    const modal = document.getElementById("kauf_bestaetigung_fenster");
    if (modal) modal.style.display = "none";
});

const upgradeMultiplikatorButton = document.getElementById("upgrade_multiplikator_10_button");
if (upgradeMultiplikatorButton) upgradeMultiplikatorButton.addEventListener("click", kaufeMultiplikatorUpgrade);

// Event-Listener für Auto-Klicker
const autoClickerButton1 = document.getElementById("auto_clicker_button_1x");
if (autoClickerButton1) autoClickerButton1.addEventListener("click", () => kaufeUpgrade(1, autoClickerBaseCost, autoClickerGrowthRate, 'auto_clicker'));
const autoClickerButton10 = document.getElementById("auto_clicker_button_10x");
if (autoClickerButton10) autoClickerButton10.addEventListener("click", () => kaufeUpgrade(10, autoClickerBaseCost, autoClickerGrowthRate, 'auto_clicker'));
const autoClickerButton50 = document.getElementById("auto_clicker_button_50x");
if (autoClickerButton50) autoClickerButton50.addEventListener("click", () => kaufeUpgrade(50, autoClickerBaseCost, autoClickerGrowthRate, 'auto_clicker'));
const autoClickerButtonMax = document.getElementById("auto_clicker_button_max");
if (autoClickerButtonMax) autoClickerButtonMax.addEventListener("click", () => kaufeUpgrade('max', autoClickerBaseCost, autoClickerGrowthRate, 'auto_clicker'));

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
            zeigeKaufBestaetigung("Kauf fehlgeschlagen", `Nicht genügend Smileys! Benötigt: ${upgradeCost}`);
        }
    });
}

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
const googleConnectButton = document.getElementById("google_connect_button");
if (googleConnectButton) googleConnectButton.addEventListener("click", () => {
    const modal = document.getElementById("google_info_fenster");
    if (modal) modal.style.display = "flex";
});
const googleInfoCloseButton = document.getElementById("google_info_schliessen");
if (googleInfoCloseButton) googleInfoCloseButton.addEventListener("click", () => {
    const modal = document.getElementById("google_info_fenster");
    if (modal) modal.style.display = "none";
});
//================================================================================================================
// ----- SPIELSTART & AUTOMATISCHE PROZESSE -----
//================================================================================================================

// Startet den Auto-Klicker in einem festen Intervall
setInterval(autoClick, 1000);

// Startet das automatische Speichern in einem festen Intervall (alle 5 Sekunden)
setInterval(speichereSpiel, 5000);

// Stellt sicher, dass die Anzeige beim Laden der Seite aktualisiert wird
window.onload = updateDisplay;