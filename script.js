// Wir laden die Variablen aus localStorage. Wenn keine Werte vorhanden sind, verwenden wir Standardwerte.
let aktuelle_smileys = parseInt(localStorage.getItem('aktuelle_smileys')) || 0;
let gesammelte_smileys = parseInt(localStorage.getItem('gesammelte_smileys')) || 0;
let smiley_points = parseInt(localStorage.getItem('smiley_points')) || 0;
let multiplikator = parseInt(localStorage.getItem('multiplikator')) || 1;
let auto_klicker_count = parseInt(localStorage.getItem('auto_klicker_count')) || 0;
let prestige_kosten = parseInt(localStorage.getItem('prestige_kosten')) || 1000; // Dynamische Prestige-Kosten, Startwert 1000
let volume = parseFloat(localStorage.getItem('volume')) || 1.0; // Lautstärke-Einstellung, Standardwert 1.0 (100%)
let smileyTreeProduction = parseInt(localStorage.getItem('smileyTreeProduction')) || 0; // Produktion durch den Smiley-Baum

// Funktion zum Aktualisieren der Anzeige auf allen Seiten
function updateDisplay() {
    // Aktualisiert die Anzeige auf der Hauptseite (index.html)
    const smileyPointsMain = document.getElementById("smiley_points");
    if (smileyPointsMain) {
        smileyPointsMain.innerText = smiley_points;
    }
    const multiplikatorMain = document.getElementById("multiplikator_anzeige");
    if (multiplikatorMain) {
        multiplikatorMain.innerText = multiplikator;
    }
    const aktuelleSmileysMain = document.getElementById("aktuelle_smileys");
    if (aktuelleSmileysMain) {
        aktuelleSmileysMain.innerText = aktuelle_smileys;
    }
    const gesammelteSmileysMain = document.getElementById("gesammelte_smileys");
    if (gesammelteSmileysMain) {
        gesammelteSmileysMain.innerText = gesammelte_smileys;
    }
    const prestigeKostenMain = document.getElementById("prestige_kosten_anzeige");
    if (prestigeKostenMain) {
        prestigeKostenMain.innerText = prestige_kosten;
    }
    const multiplikatorPerClick = document.getElementById("multiplikator_per_click");
    if (multiplikatorPerClick) {
        multiplikatorPerClick.innerText = multiplikator;
    }

    // Aktualisiert SPS und SPM auf der Hauptseite
    const spsAnzeigeMain = document.getElementById("sps_anzeige");
    const smpAnzeigeMain = document.getElementById("smp_anzeige");
    const sps = auto_klicker_count * multiplikator;
    const smp = sps * 60;
    if (spsAnzeigeMain) {
        spsAnzeigeMain.innerText = sps;
    }
    if (smpAnzeigeMain) {
        smpAnzeigeMain.innerText = smp;
    }

    // Aktualisiert die Anzeige auf der Upgrades-Seite (upgrades.html)
    const smileyPointsUpgrades = document.getElementById("smiley_points_upgrades");
    if (smileyPointsUpgrades) {
        smileyPointsUpgrades.innerText = smiley_points;
    }
    const aktuelleSmileysUpgrades = document.getElementById("aktuelle_smileys_upgrades");
    if (aktuelleSmileysUpgrades) {
        aktuelleSmileysUpgrades.innerText = aktuelle_smileys;
    }
    
    // Aktualisiert die Anzeige der dynamischen Upgrade-Kosten
    const multiplikatorKostenAnzeige = document.getElementById("multiplikator_upgrade_kosten");
    if (multiplikatorKostenAnzeige) {
        multiplikatorKostenAnzeige.innerText = Math.round(10 * Math.pow(1.5, multiplikator - 1));
    }
    
    // Aktualisiert die Anzahl der Auto-Klicker
    const autoClickerCountAnzeige = document.getElementById("auto_clicker_count_anzeige");
    if (autoClickerCountAnzeige) {
        autoClickerCountAnzeige.innerText = auto_klicker_count;
    }

    // Aktualisiert SPS und SPM auf der Upgrades-Seite
    const spsAnzeigeUpgrades = document.getElementById("sps_anzeige_upgrades");
    const smpAnzeigeUpgrades = document.getElementById("smp_anzeige_upgrades");
    if (spsAnzeigeUpgrades) {
        spsAnzeigeUpgrades.innerText = sps;
    }
    if (smpAnzeigeUpgrades) {
        smpAnzeigeUpgrades.innerText = smp;
    }
    
    // Berechne und zeige die Kosten für jede Kaufoption an
    const kosten1x = Math.round(50 * Math.pow(1.2, auto_klicker_count));
    const kosten1xAnzeige = document.getElementById("kosten_1x");
    if (kosten1xAnzeige) {
        kosten1xAnzeige.innerText = kosten1x;
    }

    let kosten10x = 0;
    for (let i = 0; i < 10; i++) {
        kosten10x += Math.round(50 * Math.pow(1.2, auto_klicker_count + i));
    }
    const kosten10xAnzeige = document.getElementById("kosten_10x");
    if (kosten10xAnzeige) {
        kosten10xAnzeige.innerText = kosten10x;
    }

    let kosten50x = 0;
    for (let i = 0; i < 50; i++) {
        kosten50x += Math.round(50 * Math.pow(1.2, auto_klicker_count + i));
    }
    const kosten50xAnzeige = document.getElementById("kosten_50x");
    if (kosten50xAnzeige) {
        kosten50xAnzeige.innerText = kosten50x;
    }

    let kostenMax = 0;
    let temp_aktuelle_smileys = aktuelle_smileys;
    let temp_auto_klicker_count = auto_klicker_count;
    while (true) {
        const kosten = Math.round(50 * Math.pow(1.2, temp_auto_klicker_count));
        if (temp_aktuelle_smileys >= kosten) {
            temp_aktuelle_smileys -= kosten;
            kostenMax += kosten;
            temp_auto_klicker_count++;
        } else {
            break;
        }
    }
    const kostenMaxAnzeige = document.getElementById("kosten_max");
    if (kostenMaxAnzeige) {
        kostenMaxAnzeige.innerText = kostenMax;
    }

    // Aktualisiert die Lautstärke-Anzeige auf der Einstellungsseite
    const volumeSlider = document.getElementById("volume_slider");
    if (volumeSlider) {
        volumeSlider.value = volume * 100;
    }
}

// Funktion zum Sammeln von Smileys
function klickeSmiley() {
    aktuelle_smileys += multiplikator;
    gesammelte_smileys += multiplikator;
    speichereSpiel();
    updateDisplay();
}

// Funktion, um das Prestige-Warnfenster direkt anzuzeigen
function klickprestige() {
    if (aktuelle_smileys >= prestige_kosten) {
        const modal = document.getElementById("warnung_fenster");
        if (modal) {
            modal.style.display = "flex";
        }
    } else {
        const modal = document.getElementById("kauf_bestaetigung_fenster");
        const nachricht = document.getElementById("kauf_nachricht");
        const details = document.getElementById("kauf_details");
        if (nachricht) {
            nachricht.innerText = "Nicht genug Smileys!";
        }
        if (details) {
            details.innerText = `Du hast nicht genug Smileys für Prestige! Benötigt: ${prestige_kosten}`;
        }
        if (modal) {
            modal.style.display = "flex";
        }
    }
}

// Funktion zur Bestätigung des Prestige-Vorgangs
function bestatigePrestige() {
    aktuelle_smileys = 0;
    smiley_points += multiplikator; 
    multiplikator = multiplikator + 3;
    prestige_kosten = Math.round(prestige_kosten * 2);
    
    auto_klicker_count = 0;
    
    speichereSpiel();
    schliesseWarnung();
    updateDisplay();
}

// Funktion, um das Warnfenster zu schließen
function schliesseWarnung() {
    const modal = document.getElementById("warnung_fenster");
    if (modal) {
        modal.style.display = "none";
    }
}

// Funktion zum Kaufen des Multiplikator-Upgrades
function kaufeMultiplikatorUpgrade() {
    let kosten = Math.round(10 * Math.pow(1.5, multiplikator - 1));
    if (smiley_points >= kosten) {
        smiley_points -= kosten;
        multiplikator += 1;
        speichereSpiel();
        updateDisplay();
    } else {
        const modal = document.getElementById("kauf_bestaetigung_fenster");
        const nachricht = document.getElementById("kauf_nachricht");
        const details = document.getElementById("kauf_details");
        if (nachricht) {
            nachricht.innerText = "Nicht genug Punkte!";
        }
        if (details) {
            details.innerText = `Du hast zu wenig Punkte für dieses Upgrade! Benötigt: ${kosten}`;
        }
        if (modal) {
            modal.style.display = "flex";
        }
    }
}

// Funktion zum Kaufen von Auto-Clickern
function kaufeAutoClicker(anzahl) {
    let gekaufte_anzahl = 0;
    let gesamtkosten = 0;
    let temp_aktuelle_smileys = aktuelle_smileys;

    if (anzahl === 'max') {
        while (true) {
            let kosten = Math.round(50 * Math.pow(1.2, auto_klicker_count + gekaufte_anzahl));
            if (temp_aktuelle_smileys >= kosten) {
                temp_aktuelle_smileys -= kosten;
                gesamtkosten += kosten;
                gekaufte_anzahl++;
            } else {
                break;
            }
        }
    } else {
        for (let i = 0; i < anzahl; i++) {
            let kosten = Math.round(50 * Math.pow(1.2, auto_klicker_count + i));
            gesamtkosten += kosten;
        }
        gekaufte_anzahl = anzahl;
    }

    if (aktuelle_smileys >= gesamtkosten) {
        aktuelle_smileys -= gesamtkosten;
        auto_klicker_count += gekaufte_anzahl;
        speichereSpiel();
        updateDisplay();
    } else {
        const modal = document.getElementById("kauf_bestaetigung_fenster");
        const nachricht = document.getElementById("kauf_nachricht");
        const details = document.getElementById("kauf_details");
        if (nachricht) {
            nachricht.innerText = "Nicht genug Smileys!";
        }
        if (details) {
            details.innerText = `Du hast zu wenige Smileys für dieses Upgrade! Benötigt: ${gesamtkosten}`;
        }
        if (modal) {
            modal.style.display = "flex";
        }
    }
}

// Funktion, die automatisch Smileys sammelt
function autoClick() {
    aktuelle_smileys += auto_klicker_count * multiplikator;
    gesammelte_smileys += auto_klicker_count * multiplikator;
    speichereSpiel();
    updateDisplay();
}

// Funktion, die das Spiel in localStorage speichert
function speichereSpiel() {
    localStorage.setItem('aktuelle_smileys', aktuelle_smileys);
    localStorage.setItem('gesammelte_smileys', gesammelte_smileys);
    localStorage.setItem('smiley_points', smiley_points);
    localStorage.setItem('multiplikator', multiplikator);
    localStorage.setItem('auto_klicker_count', auto_klicker_count);
    localStorage.setItem('prestige_kosten', prestige_kosten);
    localStorage.setItem('volume', volume);
}

// Funktion, um den gesamten Spielstand zurückzusetzen
function resetGame() {
    localStorage.clear();
    location.reload();
}

// Funktion zur Aktualisierung der Lautstärke
function updateVolume() {
    const volumeSlider = document.getElementById("volume_slider");
    if (volumeSlider) {
        volume = volumeSlider.value / 100;
        speichereSpiel();
    }
}

// Event-Listener für die Schaltflächen auf der Hauptseite
const smileyButton = document.getElementById("smiley_button");
if (smileyButton) {
    smileyButton.addEventListener("click", klickeSmiley);
}
const prestigeButton = document.getElementById("prestige_button");
if (prestigeButton) {
    prestigeButton.addEventListener("click", klickprestige);
}
const bestatigenButton = document.getElementById("bestatigen_button");
if (bestatigenButton) {
    bestatigenButton.addEventListener("click", bestatigePrestige);
}
const abbrechenButton = document.getElementById("abbrechen_button");
if (abbrechenButton) {
    abbrechenButton.addEventListener("click", schliesseWarnung);
}

// Event-Listener für das Kaufbestätigungsfenster
const kaufBestatigenButton = document.getElementById("kauf_bestaetigen_button");
if (kaufBestatigenButton) {
    kaufBestatigenButton.addEventListener("click", () => {
        const modal = document.getElementById("kauf_bestaetigung_fenster");
        if (modal) {
            modal.style.display = "none";
        }
    });
}

// Event-Listener für die Upgrade-Buttons (wird nur auf upgrades.html verwendet)
const upgradeMultiplikatorButton = document.getElementById("upgrade_multiplikator_10_button");
if (upgradeMultiplikatorButton) {
    upgradeMultiplikatorButton.addEventListener("click", kaufeMultiplikatorUpgrade);
}

const autoClickerButton1 = document.getElementById("auto_clicker_button_1x");
if (autoClickerButton1) {
    autoClickerButton1.addEventListener("click", () => kaufeAutoClicker(1));
}

const autoClickerButton10 = document.getElementById("auto_clicker_button_10x");
if (autoClickerButton10) {
    autoClickerButton10.addEventListener("click", () => kaufeAutoClicker(10));
}

const autoClickerButton50 = document.getElementById("auto_clicker_button_50x");
if (autoClickerButton50) {
    autoClickerButton50.addEventListener("click", () => kaufeAutoClicker(50));
}

const autoClickerButtonMax = document.getElementById("auto_clicker_button_max");
if (autoClickerButtonMax) {
    autoClickerButtonMax.addEventListener("click", () => kaufeAutoClicker('max'));
}

// Event-Listener für die Schaltflächen auf der Einstellungsseite (einstellungen.html)
const resetButton = document.getElementById("reset_button");
if (resetButton) {
    resetButton.addEventListener("click", () => {
        const modal = document.getElementById("reset_warnung_fenster");
        if (modal) {
            modal.style.display = "flex";
        }
    });
}
const resetConfirmButton = document.getElementById("reset_bestatigen_button");
if (resetConfirmButton) {
    resetConfirmButton.addEventListener("click", resetGame);
}
const resetCancelButton = document.getElementById("reset_abbrechen_button");
if (resetCancelButton) {
    resetCancelButton.addEventListener("click", () => {
        const modal = document.getElementById("reset_warnung_fenster");
        if (modal) {
            modal.style.display = "none";
        }
    });
}
const volumeSlider = document.getElementById("volume_slider");
if (volumeSlider) {
    volumeSlider.addEventListener("input", updateVolume);
}
const googleConnectButton = document.getElementById("google_connect_button");
if (googleConnectButton) {
    googleConnectButton.addEventListener("click", () => {
        const modal = document.getElementById("google_info_fenster");
        if (modal) {
            modal.style.display = "flex";
        }
    });
}
const googleInfoCloseButton = document.getElementById("google_info_schliessen");
if (googleInfoCloseButton) {
    googleInfoCloseButton.addEventListener("click", () => {
        const modal = document.getElementById("google_info_fenster");
        if (modal) {
            modal.style.display = "none";
        }
    });
}

// Stellt sicher, dass die Anzeige beim Laden der Seite aktualisiert wird
window.onload = updateDisplay;

// Startet den Auto-Clicker in einem festen Intervall
setInterval(autoClick, 1000); // Klickt jede Sekunde

// Startet das automatische Speichern in einem festen Intervall (alle 5 Sekunden)
setInterval(speichereSpiel, 5000);
