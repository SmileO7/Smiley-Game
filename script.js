document.addEventListener('DOMContentLoaded', () => {
    initialisiereSpiel();
});
//================================================================================================================
//--- 1. Globale Variablen --- 
//================================================================================================================
//Spiel Daten 
const buildingsData = [
    { name: "Auto-Klicker", basePrice: 20, growthRate: 1.10, elementId: "auto_klicker_button_1x", baseSPS: 1, prestigeMulti: 1, researchBonus: 0, efficiencyBonus: 0 },
    { name: "Smiley-Baum", basePrice: 100, growthRate: 1.15, elementId: "smileyTreeButton1x", baseSPS: 20, prestigeMulti: 1, researchBonus: 0, efficiencyBonus: 0  },
    { name: "Smiley-Fabrik", basePrice: 1000, growthRate: 1.20, elementId: "smileyFactoryButton1x", baseSPS: 150, prestigeMulti: 1, researchBonus: 0, efficiencyBonus: 0  },
    { name: "Forschungslabor", basePrice: 5000000, growthRate: 1.3, elementId: "forschungslaborButton1x", baseSPS: 0, prestigeMulti: 0, researchBonus: 0, efficiencyBonus: 0, isSpecial: true, maxCount: 1},
    // NEUE GEBÄUDE (4 - 15)
    { name: "Smiley-Mine", basePrice: 10000, growthRate: 1.25, elementId: "smileyMineButton1x", baseSPS: 1000, prestigeMulti: 1, researchBonus: 0, efficiencyBonus: 0  },
    { name: "Smiley-Bohrer", basePrice: 50000, growthRate: 1.30, elementId: "smileyBohrerButton1x", baseSPS: 5000, prestigeMulti: 1, researchBonus: 0, efficiencyBonus: 0  },
    { name: "Smiley-Kernkraftwerk", basePrice: 250000, growthRate: 1.35, elementId: "smileyKernkraftwerkButton1x", baseSPS: 25000, prestigeMulti: 1, researchBonus: 0, efficiencyBonus: 0  },
    { name: "Smiley-Galaxie", basePrice: 1250000, growthRate: 1.40, elementId: "smileyGalaxieButton1x", baseSPS: 125000, prestigeMulti: 1, researchBonus: 0, efficiencyBonus: 0  },
    { name: "Dimensionsportal", basePrice: 6250000, growthRate: 1.45, elementId: "dimensionsPortalButton1x", baseSPS: 625000, prestigeMulti: 1, researchBonus: 0, efficiencyBonus: 0  },
    { name: "Zeitmaschine", basePrice: 31250000, growthRate: 1.50, elementId: "zeitmaschineButton1x", baseSPS: 3125000, prestigeMulti: 1, researchBonus: 0, efficiencyBonus: 0  },
    { name: "Meta-Klicker", basePrice: 156250000, growthRate: 1.55, elementId: "metaKlickerButton1x", baseSPS: 15625000, prestigeMulti: 1, researchBonus: 0, efficiencyBonus: 0  },
    { name: "Quanten-Netzwerk", basePrice: 781250000, growthRate: 1.60, elementId: "quantenNetzwerkButton1x", baseSPS: 78125000, prestigeMulti: 1, researchBonus: 0, efficiencyBonus: 0  },
    { name: "Endloser Speicher", basePrice: 3906250000, growthRate: 1.65, elementId: "endloserSpeicherButton1x", baseSPS: 390625000, prestigeMulti: 1, researchBonus: 0, efficiencyBonus: 0  },
    { name: "Ursprung", basePrice: 19531250000, growthRate: 1.70, elementId: "ursprungButton1x", baseSPS: 1953125000, prestigeMulti: 1, researchBonus: 0, efficiencyBonus: 0  },
    { name: "Kosmische Einheit", basePrice: 97656250000, growthRate: 1.75, elementId: "kosmischeEinheitButton1x", baseSPS: 9765625000, prestigeMulti: 1, researchBonus: 0, efficiencyBonus: 0 },
    { name: "Absoluter Schöpfer", basePrice: 488281250000, growthRate: 1.80, elementId: "absoluterSchoepferButton1x", baseSPS: 48828125000, prestigeMulti: 1, researchBonus: 0, efficiencyBonus: 0  },
];
const clickerUpgrades = [
    { name: "Stärkerer Klick", price: 250, effect: 0.1, type: "click", bought: 0, description: 'Erhöht deine Klickkraft um 10% des Basiswerts.' },
    { name: "Doppelklick-Upgrade", price: 500, effect: 0.2, type: "click", bought: 0, description: 'Erhöht deine Klickkraft um 20% des Basiswerts.' },
    { name: "Dreifachklick-Upgrade", price: 1000, effect: 0.3, type: "click", bought: 0, description: 'Erhöht deine Klickkraft um 30% des Basiswerts.' }
];
const researchUpgrades = [
    { id: 0, cost: 10, description: 'Erhöht die Produktion der Auto-Klicker um 10%', type: 'unit_production', unit: 'autoClicker', bonusVariable: 'autoClickerResearchBonus', value: 0.1 },
    { id: 1, cost: 25, description: 'Erhöht die Produktion der Smiley-Bäume um 10%', type: 'unit_production', unit: 'smileyTree', bonusVariable: 'smileyTreeResearchBonus', value: 0.1 },
    { id: 2, cost: 50, description: 'Erhöht die Produktion der Smiley-Fabriken um 10%', type: 'unit_production', unit: 'smileyFactory', bonusVariable: 'smileyFactoryResearchBonus', value: 0.1 },
    { id: 3, cost: 100, description: 'Deine Auto-Klicker sind 20% effizienter.', type: 'unit_efficiency', unit: 'autoClicker', bonusVariable: 'efficiencyBonus', value: 0.2 },
    { id: 4, cost: 200, description: 'Deine Smiley-Bäume sind 20% effizienter.', type: 'unit_efficiency', unit: 'smileyTree', bonusVariable: 'efficiencyBonus', value: 0.2 },
    { id: 5, cost: 500, description: 'Deine Smiley-Fabriken sind 20% effizienter.', type: 'unit_efficiency', unit: 'smileyFactory', bonusVariable: 'efficiencyBonus', value: 0.2 }
];
const prestigeUpgradesData = [
    { id: 'globaler_multiplikator_1', name: 'Globaler Klick-Multiplikator', description: 'Erhöht die Klickkraft und die Produktion aller Gebäude um 25%.', cost: 1, bonus: 0.25, type: 'global_multi', dependencies: [] },
    { id: 'auto_klicker_multi', name: 'Auto-Klicker-Boost', description: 'Die Produktion von Auto-Klickern wird verdoppelt.', cost: 5, bonus: 1, type: 'auto_clicker_multi', dependencies: ['globaler_multiplikator_1'] },
    { id: 'forschungs_multi', name: 'Forschungs-Boost', description: 'Die Produktion des Forschungslabors wird verdoppelt.', cost: 10, bonus: 1, type: 'research_multi', dependencies: ['auto_klicker_multi'] },
    { id: 'klick_multiplikator_2', name: 'Unendliche Klickkraft', description: 'Erhöht deine Klickkraft um 2 pro Prestige-Punkt, den du je gesammelt hast.', cost: 5, bonus: 2, type: 'klick_boost_per_pp', dependencies: ['globaler_multiplikator_1'] },
    { id: 'sps_multiplikator_1', name: 'Überlegenheit in der Produktion', description: 'Erhöht die Produktion aller Gebäude um 15%.', cost: 10, bonus: 0.15, type: 'global_sps_multi', dependencies: ['globaler_multiplikator_1'] },
    { id: 'kostenreduktion_1', name: 'Ökonomische Voraussicht', description: 'Reduziert die Kosten aller Gebäude um 5%.', cost: 20, bonus: 0.05, type: 'cost_reduction', dependencies: ['sps_multiplikator_1'] },
    { id: 'forschungslabor_effizienz_2', name: 'Meister der Forschung', description: 'Verdoppelt die Menge an Forschungspunkten, die du pro Sekunde verdienst.', cost: 30, bonus: 1, type: 'research_multi', dependencies: ['forschungs_multi'] }, 
    { id: 'auto_klicker_multiplikator', name: 'Auto-Klicker-Hyper-Antrieb', description: 'Die Produktion der Auto-Klicker wird um weitere 20% erhöht.', cost: 50, bonus: 0.20, type: 'auto_clicker_multi', dependencies: ['sps_multiplikator_1'] },
    { id: 'smiley_baum_multiplikator', name: 'Ur-Bäume', description: 'Die Produktion der Smiley-Bäume wird um 25% erhöht.', cost: 75, bonus: 0.25, type: 'smiley_tree_multi', dependencies: ['sps_multiplikator_1'] },
    { id: 'smiley_fabrik_multiplikator', name: 'Giganten-Fabriken', description: 'Die Produktion der Smiley-Fabriken wird um 30% erhöht.', cost: 100, bonus: 0.30, type: 'smiley_factory_multi', dependencies: ['sps_multiplikator_1'] },
    { id: 'kostenreduktion_2', name: 'Eiserne Sparsamkeit', description: 'Reduziert die Kosten aller Gebäude um weitere 10%.', cost: 150, bonus: 0.10, type: 'cost_reduction', dependencies: ['kostenreduktion_1'] },
    { id: 'mega_forschung_boost', name: 'Uraltes Wissen', description: 'Erhöht die Produktionsrate deines Forschungslabors um 50%.', cost: 200, bonus: 0.50, type: 'research_multi', dependencies: ['forschungslabor_effizienz_2'] }
];
const prestige_kosten = 100000;
//================================================================================================================
//--- 1.1 SPIEL-ZUSTAND
//================================================================================================================
let buildingCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; 
let buildingPrices = [20, 100, 1000,5000000, 10000, 50000, 250000, 1250000, 6250000, 31250000, 156250000, 781250000, 3906250000, 19531250000, 97656250000, 488281250000];
let researchStatus = [false, false, false, false, false, false];
let prestige_upgrades_gekauft = {};

let gameState = {
    // HAUPT-SPIELSTATUS
    aktuelle_smileys: 0,
    gesammelte_smileys: 0,
    smileyPoints: 0,
    klickKraft: 1,
    klickUpgradeBonus: 0,
    gesamteGeklickteSmileys: 0,
    totalSPS: 0, 
    
    // FORSCHUNG & PRESTIGE STATUS (KEIN forschungslabor_count/Gekauft mehr!)
    forschungPunkte: 0,
    prestige_punkte_verfügbar: 0, // Umbenannt von prestige_punkte
    researchUpgradeIndex: 0,
    
    // GLOBALE BONI & MULTIPLIER
    globalSpsMultiplier: 1.0,
    sammelbuchClickPowerBonus: 0,
    klickPrestigeMultiplier: 1, 
    klickBoostPerPPValue: 0, 
    researchLabPrestigeMulti: 1,
    
    // PRESTIGE-ZUSTAND
    gesamt_prestige_punkte: 0, 
    gesammelte_prestige_punkte: 0, 
    globalerPrestigeMultiplikator: 1, 
    globalerKlickBonus: 0,
    klickBoostPerPrestigePoint: 0, 
    buildingCostReduction: 0, 
};
//================================================================================================================
//--- 2. Hilfsfunktionen ---
//================================================================================================================
/**
 * Rundet eine Zahl auf eine lesbare Form mit Suffixen (K, M, B, T).
 * Die Funktion ist auf Performance und Robustheit optimiert.
 */
 function formatNumber(num) {
    //Stellt sicher, dass die Eingabe eine Zahl eine gültige Zahl ist
if (typeof num !== 'number' || num === null || isNaN(num)) {        return '0';
    }
    //Wir runden für die Anzeige ab 1.000 (M, B, T, Q...)
    if (num < 1000) {
        return Math.floor(num).toString();
    }
const suffixes = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "De"];
    let suffixIndex = 0; 
    let tempNum = num;

    while (tempNum >= 1000 && suffixIndex < suffixes.length - 1) {
        tempNum /= 1000;
        suffixIndex++;
    }
    return tempNum.toFixed(2) + suffixes[suffixIndex];
}
/**
 * Kürzt den Aufruf von document.getElementById
 */ 
function getById(id) {
    return document.getElementById(id);
}
/**
 * Berechnet die Kosten für das nächste Gebäude-Level 
 * @param {number} basePrice - Basispreis des Gebäudes
 * @param {nunber} count - Die aktuelle Anzahl des Gebäudes (Das Level).
 * @param {number} growthRate - Die Wachstumsrate des Gebäudes
 * @returns {number} Die Kosten für den nächsten Kauf.
 */
function calculateNextCost(basePrice, count, growthRate) {
    //Die verechnung nutzt Math.pow(Rate, Anzahl) und ist sehr kurz.
    let cost = basePrice * Math.pow(growthRate, count);

    //OPTIMIERUNG: Anwendung der globalen Kostenreduktion (z.B. durch Prestige)
    //Die Reduktion muss vor der Wachstumsrate abgezogen werden (oder durch Multiplikator)
    //Wir nehmen an, dass 'gameState.buildingCostReduction' den Prozentsatz enthält. 
    const reduction = gameState.buildingCostReduction || 0;

    //Die Wachstumsrate wird durch die Reduktion angepasst
    const adjustedGrowthRate = growthRate - reduction;

    //Nur die finale Formel verwenden, die die Reduktion berücksichtigt
    cost = basePrice * Math.pow(adjustedGrowthRate > 1.0 ? adjustedGrowthRate : 1.0, count);

    return Math.floor(cost);
}
//================================================================================================================
//--- 3. Prestige & Forschungs-logik
//================================================================================================================
function applyAllPrestigeBonuses() {
    //--- 1. Globale Boni zurücksetzen ---
    //wichtig: wir setzten die Variablen zurück, die durch Prestige-Upgrades beeinflusst werden. 
    gameState.globalerPrestigeMultiplikator = 1.0;
    gameState.globalerKlickBonus = 0; //Für 'global_multi' (klickkraft)
    gameState.buildingCostReduction = 0;
    gameState.klickBoostPerPrestigePoint = 0;
   gameState. researchLabPrestigeMulti = 1;

    // Setze die gebäudespezifischen Multiplikatoren im buildingsData-Array zurück
    buildingsData.forEach(building => {
        building.prestigeMulti = 1;
    });

    //--- 2. Alle gekauften Upgrades Anwenden ---
    prestigeUpgradesData.forEach(upgrade => {
        //Wichtig: Wir prüfen den Kaufstatus direkt im Array-Objekt
        if (upgrade.bought) {
            //Die Logik muss die gleiche sein wie in kaufePrestigeUpgrade()
            switch (upgrade.type) {
                case 'global_multi':
                    gameState.globalerKlickBonus += upgrade.bonus;
                    gameState.globalerPrestigeMultiplikator += upgrade.bonus;
                    break;

                case 'global_sps_multi':
                    gameState.globalerPrestigeMultiplikator += upgrade.bonus;
                    break;

                case 'klick_boost_per_pp':
                    gameState.klickBoostPerPrestigePoint += upgrade.bonus;
                    break;

                case 'cost_reduction':
                    gameState.buildingCostReduction += upgrade.bonus;
                    break;

                case 'research_multi':
                    gameState.researchLabPrestigeMulti += upgrade.bonus;
                    break;

                //--- Gebäudespezifische Multiplikatoren ---
                case 'auto_clicker_multi':
                    buildingsData[0].prestigeMulti += upgrade.bonus;
                    break;
                
                case 'smiley_tree_multi':
                    buildingsData[1].prestigeMulti += upgrade.bonus;
                    break;

                case 'smiley_factory_multi':
                    buildingsData[2].prestigeMulti += upgrade.bonus;
                    break;
            }}});

    console.log("%cPrestige-Boni erfolgreich neu angewendet.", "color: #009FFD;");
}
function kaufePrestigeUpgrade(upgradeId) {
    // 1. Finde das Upgrade anhand seiner ID in den Daten
    const upgrade = prestigeUpgradesData.find(u => u.id === upgradeId);

    if (!upgrade) {
        console.error(`Upgrade mit ID ${upgradeId} nicht gefunden.`);
        return;
    }

    // 2. Prüfe Kaufbedingungen
    if (upgrade.bought) {
        console.log("Upgrade wurde bereits gekauft.");
        return;
    }

    // KORREKTUR: Prüfe die verfügbare Währung im gameState-Objekt
    if (gameState.prestige_punkte_verfügbar < upgrade.cost) {
        console.log("Nicht genug Smiley-Points.");
        return;
    }

    // 3. Prüfe Abhängigkeiten
    const allDependenciesMet = upgrade.dependencies.every(depId => {
        const depUpgrade = prestigeUpgradesData.find(u => u.id === depId); // Tippfehler korrigiert: u.id === depId
        // Prüfe, ob das Abhängikeits-Upgrade existiert UND gekauft wurde
        return depUpgrade && depUpgrade.bought;
    });

    if (!allDependenciesMet) {
        console.log("Abhängikeiten sind nicht erfüllt.");
        return;
    }
    
    // 4. Kauf durchführen und Status/Punkte aktualisieren 
    
    // KORREKTUR: Ziehe die Kosten von der verfügbaren Währung im gameState ab
    gameState.prestige_punkte_verfügbar -= upgrade.cost; 
    
    upgrade.bought = true; // Status im Array aktualisieren
    // Markiere auch im persistierbaren Objekt 
    prestige_upgrades_gekauft[upgradeId] = true;

    // --- 5. Effekt Anwenden (Jetzt alle über gameState) ---
    switch (upgrade.type) {
        case 'global_multi':
            gameState.globalerKlickBonus += upgrade.bonus;             // KORRIGIERT
            gameState.globalerPrestigeMultiplikator += upgrade.bonus;  // KORRIGIERT
            break;

        case 'global_sps_multi':
            gameState.globalerPrestigeMultiplikator += upgrade.bonus;  // KORRIGIERT
            break;

        case 'klick_boost_per_pp':
            gameState.klickBoostPerPrestigePoint += upgrade.bonus;     // KORRIGIERT
            break;
        
        case 'cost_reduction':
            gameState.buildingCostReduction += upgrade.bonus;          // KORRIGIERT
            break;
        
        case 'research_multi':
            gameState.researchLabPrestigeMulti += upgrade.bonus;       // KORRIGIERT
            break;
        
        // GEBÄUDESPEZIFISCHE MULTIPLIKATOREN
        case 'auto_clicker_multi':
            buildingsData[0].prestigeMulti += upgrade.bonus;
            break;

        case 'smiley_tree_multi':
            buildingsData[1].prestigeMulti += upgrade.bonus;
            break;

        case 'smiley_factory_multi':
            buildingsData[2].prestigeMulti += upgrade.bonus;
            break;
    
        default:
            console.warn(`Unbekannter Prestige-Upgradetyp: ${upgrade.type} für Upgrade ID: ${upgradeId}`);
        }

        // 6. Speichern und UI aktualisieren 
        // NOTE: Diese Funktionen sind in Block 4 & 5 definiert und werden hier aufgerufen.
        speichereSpiel();
        updateUI();

        console.log(`Upgrade '${upgrade.name}' erfolgreich gekauft!`);
}
function updatePrestigeButtons() {
    prestigeUpgradesData.forEach(upgrade => { 
    
        // HINWEIS: Es wird angenommen, dass createPrestigeElements die Divs mit data-id erzeugt hat.
        // KORREKTUR: Backticks für Template-Literal verwenden
        const upgradeDiv = document.querySelector(`.prestige-upgrade[data-id="${upgrade.id}"]`); 
        if (!upgradeDiv) return;

        const button = upgradeDiv.querySelector('button');
        if (!button) return;

        // 1. Kritische Variablen-Korrektur
        const isBought = prestige_upgrades_gekauft[upgrade.id];
        const allDependenciesMet = upgrade.dependencies.every(depId => prestige_upgrades_gekauft[depId]);
        
        // KORREKTUR: Nutze die korrekte Währungs-Variable aus gameState
        const isAffordable = gameState.prestige_punkte_verfügbar >= upgrade.cost;
        
        const isAvailable = !isBought && allDependenciesMet && isAffordable;
        
        // 1. Aktualisiere die Klassen
        upgradeDiv.classList.toggle('bought', isBought);
        upgradeDiv.classList.toggle('available', isAvailable);
        upgradeDiv.classList.toggle('locked', !isBought && !allDependenciesMet);

        // 2. Aktualisiere den Button-Status
        if (isBought) {
            button.disabled = true;
            button.textContent = 'Gekauft';
        } else if (!allDependenciesMet) {
            button.disabled = true;
            button.textContent = 'Gesperrt';
        } else {
            button.disabled = !isAvailable;
            
            // KORREKTUR: template-Literal muss Backticks verwenden und formatNumber aufrufen
            button.innerText = `Kaufen (${formatNumber(upgrade.cost)} PP)`; 
        }

        // 3. Farbe ob kaufbar oder nicht
        const costSpan = upgradeDiv.querySelector('.prestige-cost span');
        if (costSpan) {
            // KORREKTUR: Variablennamen für CSS-Farben korrigiert
            costSpan.style.color = isAffordable ? 'var(--color-blue-main)' : 'var(--color-red-main)';
        }
    });
}
//================================================================================================================
//--- 4. Speicher- und Ladefunktionen ---
//================================================================================================================
/**
 * Speichert den aktuellen Spielstan in localStorage.
 */
function speichereSpiel() {
    //1. Speichern des Haupt-gameState Objekts
    localStorage.setItem('gameState', JSON.stringify(gameState));

    //2. Speichere die let-Arrays (Zustand, der nicht in gameState ist)
    localStorage.setItem('buildingCounts', JSON.stringify(buildingCounts));
    localStorage.setItem('buildingPrices', JSON.stringify(buildingPrices));
    localStorage.setItem('researchStatus', JSON.stringify(researchStatus));
    
    //3. Speichere den Kaufstatus der Prestige-Upgrades
    localStorage.setItem('prestige_upgrades_gekauft', JSON.stringify(prestige_upgrades_gekauft));
    console.log("%cSpiel gespeichert.", "color: #00FF00;");
}
/**
 * Lädt den Spielstand aus localStorage.
 * @returns {boolean} true, wenn ein Spielstand geladen wurde, sonst false.
 */ 
function ladeSpiel() {
    const savedGameState = localStorage.getItem('gameState');

    //Prüfen, ob Daten vorhanden sind
    if (!savedGameState) {
        return false;
    }

    //1. Haupt-gameState laden und überschreiben
    try {
        const loadedState = JSON.parse(savedGameState);
        //Lädt gespeicherte Werte und behält neuem nicht gespeicherte Properties auf Default-Wert
        gameState = { ...gameState, ...loadedState };

        //2. Arrays laden und überschreiben
        buildingCounts = JSON.parse(localStorage.getItem('buildingCounts')) || buildingCounts;
        buildingPrices = JSON.parse(localStorage.getItem('buildingPrices')) || buildingPrices;
        researchStatus = JSON.parse(localStorage.getItem('researchStatus')) || researchStatus;

        //3. Prestige-Kaufstatus laden
        const savedPrestige = localStorage.getItem('prestigeUpgradesGekauft');
        if (savedPrestige) {
            prestige_upgrades_gekauft = JSON.parse(savedPrestige);
        }

        //4. Prestige-Upgrades im CONST-Array synchonisieren
        prestigeUpgradesData.forEach(upgrade => {
            upgrade.bought = prestige_upgrades_gekauft[upgrade.id] || false;
        });

        //5. Boni anwenden 
        applyAllPrestigeBonuses();

        return true;
    } catch (e) {
        console.error("Fehler beim Laden des Spielstandes:", e);
        //Bei fehler startet 
        localStorage.clear();
        return false;
    }
}
//================================================================================================================
// --- 5. KERN-SPIELLOGIK & HAUPTSCHLEIFE ---
//================================================================================================================

function updateGame() {
    updateUI();
    updatePrestigeButtons();
    updateResearchButtons();
}
/**
 * Aktualisiert alle sichtbaren UI Elmente auf der Seite.
 * - Smileys, SPS, Gebäudeanzahlen, Upgrade-Status etc.
 */
function updateUI() {
    // 1. Hauptanzeige aktualisieren
    getById('aktuelle_smileys').innerText = formatNumber(gameState.aktuelle_smileys);
    getById('smileys_pro_sekunde_anzeige').innerText = formatNumber(gameState.totalSPS);
    getById('smileys_pro_klick_anzeige').innerText = formatNumber(gameState.klickKraft);
    getById('forschungspunkte').innerText = formatNumber(gameState.forschungPunkte);
    const prestigeDisplay = getById('prestige_punkte_anzeige');
    if (prestigeDisplay) {
        prestigeDisplay.innerText = formatNumber(gameState.prestige_punkte_verfügbar);
    }
    
    // Aktualisiere SPS pro Minute
    if (getById('smileys_pro_minute_anzeige')) {
        getById('smileys_pro_minute_anzeige').innerText = formatNumber(gameState.totalSPS * 60);
    }
    
    // Prestige-Button Update
    const prestigeButton = getById('prestige_button');
    if (prestigeButton) {
        const threshold = 1_000_000;
        const newPoints = gameState.gesammelte_smileys >= threshold ? 
            Math.floor(Math.log10(gameState.gesammelte_smileys / threshold) * 10) - gameState.gesamt_prestige_punkte : 0;
        prestigeButton.textContent = `Prestige (${newPoints} Punkte verdienen)`;
        prestigeButton.disabled = newPoints <= 0;
    }

    // 2. Alle Gebäude-Buttons aktualisieren
    buildingsData.forEach((item, index) => {
        const cost = buildingPrices[index];
        const count = buildingCounts[index];

        //A) Elemente abrufen
        const priceElement = getById(`${item.elementId}_price`);
        const countElement = getById(`${item.elementId}_count`);
        const button1x = getById(`${item.elementId}_1x`);
        const button10x = getById(`${item.elementId}_10x`);
        const button100x = getById(`${item.elementId}_100x`);
    const spsElement = getById(`${item.elementId}_sps`);
    const spsPctElement = getById(`${item.elementId}_sps_pct`);

        //B) Text aktualisieren
        if (priceElement) {
            priceElement.innerText = formatNumber(cost);
        }
        if (countElement) {
            countElement.innerText = formatNumber(count);
        }

        //C) Status prüfen
        const isSpecialMaxed = item.isSpecial && item.maxCount && count >= item.maxCount;

        // Berechne SPS Beitrag für dieses Gebäude und Prozent-Share
        const buildingSPS = item.baseSPS * count * item.prestigeMulti * gameState.globalerPrestigeMultiplikator;
        const spsPercentage = gameState.totalSPS > 0 ? (buildingSPS / gameState.totalSPS * 100) : 0;
        if (spsElement) {
            spsElement.innerText = `${formatNumber(buildingSPS)}`;
        }
        if (spsPctElement) {
            spsPctElement.innerText = spsPercentage.toFixed ? spsPercentage.toFixed(1) : Number(spsPercentage).toFixed(1);
        }

        //D) UI/Button-Status setzen für 1x/10x/100x
        // Gesamtkosten für 1x, 10x, 100x
        const cost1x = cost;
        let cost10x = 0;
        let cost100x = 0;
        let tempCount = buildingCounts[index];
        for (let i = 0; i < 10; i++) cost10x += calculateNextCost(item.basePrice, tempCount + i, item.growthRate);
        tempCount = buildingCounts[index];
        for (let i = 0; i < 100; i++) cost100x += calculateNextCost(item.basePrice, tempCount + i, item.growthRate);

        const canBuy1 = gameState.aktuelle_smileys >= cost1x && !isSpecialMaxed;
        const canBuy10 = gameState.aktuelle_smileys >= cost10x && !isSpecialMaxed;
        const canBuy100 = gameState.aktuelle_smileys >= cost100x && !isSpecialMaxed;

        if (button1x) {
            button1x.disabled = !canBuy1;
            button1x.innerText = isSpecialMaxed ? 'Gekauft' : `1x (${formatNumber(cost1x)})`;
            button1x.classList.toggle('affordable', canBuy1);
            button1x.classList.toggle('unaffordable', !canBuy1);
        }
        if (button10x) {
            button10x.disabled = !canBuy10;
            button10x.innerText = isSpecialMaxed ? 'Gekauft' : `10x (${formatNumber(cost10x)})`;
            button10x.classList.toggle('affordable', canBuy10);
            button10x.classList.toggle('unaffordable', !canBuy10);
        }
        if (button100x) {
            button100x.disabled = !canBuy100;
            button100x.innerText = isSpecialMaxed ? 'Gekauft' : `100x (${formatNumber(cost100x)})`;
            button100x.classList.toggle('affordable', canBuy100);
            button100x.classList.toggle('unaffordable', !canBuy100);
        }
    });

    // Spezialfall: Falls es einen separaten Forschungslabor-Kauf-Button im Research-Panel gibt,
    // synchronisiere seinen Text und Disabled-Status mit den tatsächlichen Gebäudekosten.
    const labButton = getById('forschungslaborButton');
    if (labButton) {
        const labIndex = 3; // Forschungslabor ist Index 3 im buildingsData
        if (buildingsData[labIndex]) {
            const labCost = buildingPrices[labIndex];
            const labCount = buildingCounts[labIndex] || 0;
            const isSpecialMaxed = buildingsData[labIndex].isSpecial && buildingsData[labIndex].maxCount && labCount >= buildingsData[labIndex].maxCount;
            labButton.disabled = gameState.aktuelle_smileys < labCost || isSpecialMaxed;
            labButton.innerText = isSpecialMaxed ? 'Gekauft' : `Kaufen (${formatNumber(labCost)})`;
            labButton.classList.toggle('affordable', gameState.aktuelle_smileys >= labCost && !isSpecialMaxed);
            labButton.classList.toggle('unaffordable', gameState.aktuelle_smileys < labCost || isSpecialMaxed);
        }
    }
}
/**
 * Wird beim Klick auf den Smiley-Button ausgelöst.
 * Berechnet die finale Klickkraft unter berücksichtigung aller Boni.
 */
function klickeSmiley() {
    //1. Basis-Klickkraft
    const baseKlickPower = Number(gameState.klickKraft || 0);

    //2. Additive Boni (aus Prestige-Upgrades)
    const additiveBonus = Number(gameState.globalerKlickBonus || 0) + (Number(gameState.klickBoostPerPPValue || 0) * Number(gameState.gesamt_prestige_punkte || 0));

    //3. Forschungs-Multiplikator (aus dem neuen Forschungssystem)
    const researchMulti = Number(gameState.klickKraftMultiplikator || 1); // Fallback auf 1 wenn undefined

    //4. Finale Berechnung: (Basis + Additive) * Multiplikator
    const finalKlickPower = (baseKlickPower + additiveBonus) * researchMulti;

    //5. Smileys hinzufügen und Zähler aktualisieren
    gameState.aktuelle_smileys += finalKlickPower;
    gameState.gesamteGeklickteSmileys += finalKlickPower;

    //6. UI aktualisieren
    updateUI();
}
/**
 * Registriert alle Event Listener für Buttons, Tab-Wechsel etc.
 * Wird einmal beim Spielstart in initialisiereSpiel() aufgerufen.
 */
function setupEventListeners() {
    //1. Haupt-Smiley-Klick-Button
    const clickButton = getById('smiley_button');
    if (clickButton) {
        clickButton.addEventListener('click', klickeSmiley);
    }

    //2. Gebäude-Kauf-Buttons
    buildingsData.forEach((item, index) => {
        const buyButton = getById(item.elementId);
        if (buyButton) {
            buyButton.addEventListener('click', () => kaufeGebaeude(index));
        }
    });

    //3. Prestige Upgrades
    const prestigeGrid = getById('prestige_upgrades_grid');
    if (prestigeGrid) {
        prestigeGrid.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button) {
                const upgradeId = button.dataset.id;
                if (upgradeId) {
                    kaufePrestigeUpgrade(upgradeId);
                }
            }
        });
    }

    //4. Forschungs Upgrades
    const researchGrid = getById('research_upgrades_grid');
    if (researchGrid) {
        researchGrid.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button) {
                const upgradeIdString = button.dataset.id;
                if (upgradeIdString) {
                    const upgradeId = parseInt(upgradeIdString, 10);
                    kaufeResearchUpgrade(upgradeId);
                }
            }
        });
    }
    // 4b. Forschungslabor Kaufen (separater Button in der UI)
    const labBuyButton = getById('forschungslaborButton');
    if (labBuyButton) {
        labBuyButton.addEventListener('click', () => kaufeMehrereGebaeude(3, 1));
    }
    // 4c. Schneller Research-Upgrade Button (falls vorhanden) - kauft das erste verfügbare Upgrade
    const quickResearchButton = getById('forschungUpgradeButton');
    if (quickResearchButton) {
        quickResearchButton.addEventListener('click', () => {
            // finde erstes nicht gekauften Research-Upgrade
            const idx = researchUpgrades.findIndex((u, i) => !researchStatus[i]);
            if (idx !== -1) {
                kaufeResearchUpgrade(idx);
            }
        });
    }
    // 5. Listener für den Prestige-Reset-Button 
    const resetButton = getById('prestige_reset_button');
    if (resetButton) {
        resetButton.addEventListener('click', prestigeReset);
    }

    const tabs = ['buildings', 'upgrades', 'research', 'prestige'];

    tabs.forEach(tabName => {
        const tabButton = getById(`${tabName}-tab`);
        if (tabButton){
            tabButton.addEventListener('click', () => switchTab(tabName));
        }
    });
}
/**
 * Wechselt zwischen den verschiedenen Spiel-Tabs (z.B. Gebäuden, Forschung usw).
 * @param {string} tabName - Der Name des Tabs, der angezeigt werden soll (z.B.'building','research' usw)
 */
function switchTab(tabName){
    // 1. Alle Content-Container ausblenden
    const allGrids = ['building-grid', 'upgrade-grid', 'research_upgrades_grid', 'prestige_upgrades_grid'];
    allGrids.forEach(gridId => {
        const grid = getById(gridId);
        if(grid) {
            grid.style.display = 'none';
        }
    });

    // 2. Den ausgewählten Content-Container anzeigen
    // Angepasst an die HTML-Struktur
    const selectedContent = tabName === 'buildings' ? getById('building-grid') :
                          tabName === 'upgrades' ? getById('upgrade-grid') :
                          tabName === 'research' ? getById('research_upgrades_grid') :
                          tabName === 'prestige' ? getById('prestige_upgrades_grid') : null;
    if(selectedContent){
        selectedContent.style.display = 'grid';
    }

    // 3. Alle Tab-Buttons in der Navigation de-aktivieren 
    document.querySelectorAll('.tab-button').forEach(button=> {
        button.classList.remove('active');
    });

    // 4. Den ausgewählten Tab-Button in der Navigation hervorheben 
    // KORRIGIERT: Nutzung von Backticks (`) für Template Literal
    const selectedButton = getById(`${tabName}-tab`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
}
/**
 * Erstellt die HTML-elemente für alle Prestige-Upgrades einmalig beim laden. 
 */
function renderPrestigeUpgrades(){
    // Radial prestige map renderer with three sections
    const container = getById('prestige_upgrades_grid');
    if (!container) return;

    container.innerHTML = '';
    container.classList.add('prestige-map');
    container.style.position = 'relative';

    // Central universe smiley
    const center = document.createElement('div');
    center.className = 'prestige-center';
    center.innerHTML = `
        <div class="prestige-center-inner">
            <img src="Smiley.jpg" alt="Universum Smiley" />
            <div class="prestige-center-label">Universum</div>
        </div>
    `;
    container.appendChild(center);

    // Category mapping: map upgrade.type to one of three sections
    const categoryMap = {
        generelle: ['global_multi', 'global_sps_multi', 'cost_reduction', 'research_multi'],
        gebaeude: ['auto_clicker_multi', 'smiley_tree_multi', 'smiley_factory_multi'],
        klick: ['klick_boost_per_pp']
    };

    const sectors = [
        { name: 'generelle', start: -Math.PI / 2 },
        { name: 'gebaeude', start: -Math.PI / 2 + (2 * Math.PI) / 3 },
        { name: 'klick', start: -Math.PI / 2 + (4 * Math.PI) / 3 }
    ];
    const sectorSize = (2 * Math.PI) / 3;
    const radius = 38; // percent radius from center

    // Group upgrades by category
    const groups = { generelle: [], gebaeude: [], klick: [] };
    prestigeUpgradesData.forEach(u => {
        let placed = false;
        for (const cat in categoryMap) {
            if (categoryMap[cat].includes(u.type)) {
                groups[cat].push(u);
                placed = true;
                break;
            }
        }
        if (!placed) groups.generelle.push(u); // default to generelle
    });

    // Render cluster labels and nodes
    sectors.forEach((sector, si) => {
        const items = groups[sector.name] || [];
        if (items.length === 0) return;

        // cluster label
        const midAngle = sector.start + sectorSize / 2;
        const labelRadius = 62; // percent
        const labelX = 50 + labelRadius * Math.cos(midAngle);
        const labelY = 50 + labelRadius * Math.sin(midAngle);
        const label = document.createElement('div');
        label.className = 'cluster-label';
        label.textContent = sector.name === 'gebaeude' ? 'Gebäude' : (sector.name === 'klick' ? 'Klick-Booster' : 'Generelle');
        label.style.position = 'absolute';
        label.style.left = `${labelX}%`;
        label.style.top = `${labelY}%`;
        label.style.transform = 'translate(-50%, -50%)';
        container.appendChild(label);

    // place nodes in a sequence along the sector's mid-angle (radial line)
        const startRadius = 18; // percent from center for first node
        const stepRadius = 8;   // percent increment per node

        items.forEach((upgrade, idx) => {
            const r = startRadius + idx * stepRadius;
            const angle = midAngle; // all nodes in this sector share the mid-angle
            const x = 50 + r * Math.cos(angle);
            const y = 50 + r * Math.sin(angle);

            const node = document.createElement('div');
            node.className = 'prestige-node';
            node.setAttribute('data-id', upgrade.id);
            node.style.position = 'absolute';
            node.style.left = `${x}%`;
            node.style.top = `${y}%`;
            node.style.transform = 'translate(-50%, -50%)';

            const icon = upgrade.icon || 'favicon.svg';
            node.innerHTML = `
                <div class="node-inner">
                    <div class="node-icon"><img src="${icon}" alt="${upgrade.name}"></div>
                    <div class="node-name">${upgrade.name}</div>
                    <div class="node-cost">${formatNumber(upgrade.cost)} PP</div>
                    <button class="prestige-buy-button" data-id="${upgrade.id}">Kaufen</button>
                </div>
            `;

            container.appendChild(node);
        });
    });
}
/**
 * Erstellt die HTML-Elemente für alle FOrschungs-Upgrades einmalig beim laden.
 */
function renderResearchUpgrades(){
    const container = getById('research_upgrades_grid');
    if (!container) return;

    container.innerHTML ='';

    researchUpgrades.forEach(upgrade => {
        const upgradeDiv = document.createElement('div');
        upgradeDiv.classList.add('research-upgrade');
        upgradeDiv.id = `research-${upgrade.id}`;  
    
        upgradeDiv.setAttribute('data-id', upgrade.id);

        upgradeDiv.innerHTML = ` 
            <div class = "research-header">
                <span class="research-name">Forschung ${upgrade.id}:</span>
                <span class="research-cost"><span class="cost-value">${formatNumber(upgrade.cost)}</span> RP</span>   
            </div>
            <p class="research-description">${upgrade.description}</p>
            <button class="research-buy-button" data-id="${upgrade.id}">Kaufen</button>
            `;

            container.appendChild(upgradeDiv);
        });
    }
/**
 * Aktualisiert den Status aller Forschungs-Upgrade-Buttoms.
 */
function updateResearchButtons(){
    researchUpgrades.forEach((upgrade, index)=> {
        const upgradeDiv = document.querySelector(`.research-upgrade[data-id="${upgrade.id}"]`);
        if(!upgradeDiv) return;

        const button = upgradeDiv.querySelector('button');
        if(!button) return;

        const isBought = researchStatus[index];
        const isAffordable = gameState.forschungPunkte >= upgrade.cost;
        const isResearchLabOwned = buildingCounts[3] > 0;

        upgradeDiv.classList.toggle ('bought', isBought);

        if (isBought) {
            button.disabled = true;
            button.textContent = 'Gekauft';
            upgradeDiv.classList.remove('locked');
            upgradeDiv.classList.add('available');
        } else if (!isResearchLabOwned){
            button.disabled = true;
            button.textContent = 'Labor benötigt';
            upgradeDiv.classList.add('locked');
            upgradeDiv.classList.remove('available');
        } else {
            button.disabled = !isAffordable;
            button.textContent = `Kaufen (${formatNumber(upgrade.cost)} RP)`;
            upgradeDiv.classList.toggle('available', isAffordable);
            upgradeDiv.classList.toggle('locked', !isAffordable);
        }

        const costSpan = upgradeDiv.querySelector('.research-cost span');
        if (costSpan) {
            costSpan.style.color = isAffordable ? 'var(--color-blue-main)' : 'var(--color-red-main)';
        }
    });
}

/**
 * Kaufe ein Forschungs-Upgrade
 * @param {number} upgradeIndex - Index im researchUpgrades Array
 */
function kaufeResearchUpgrade(upgradeIndex) {
    const upgrade = researchUpgrades[upgradeIndex];
    if (!upgrade) return;

    // Prüfen ob Labor vorhanden
    if (buildingCounts[3] <= 0) {
        alert('Du brauchst ein Forschungslabor, um Forschungs-Upgrades zu kaufen.');
        return;
    }

    // Prüfe ob bereits gekauft
    if (researchStatus[upgradeIndex]) {
        console.log('Research bereits gekauft');
        return;
    }

    // Prüfe Kosten
    if (gameState.forschungPunkte < upgrade.cost) {
        alert('Nicht genug Forschungspunkte.');
        return;
    }

    // Ziehe Kosten
    gameState.forschungPunkte -= upgrade.cost;
    researchStatus[upgradeIndex] = true;

    // Wende Effekt an
    if (upgrade.type === 'unit_production') {
        // map unit names to building indices
        const mapping = { autoClicker: 0, smileyTree: 1, smileyFactory: 2 };
        const targetIndex = mapping[upgrade.unit];
        if (typeof targetIndex === 'number' && buildingsData[targetIndex]) {
            buildingsData[targetIndex].baseSPS = Number(buildingsData[targetIndex].baseSPS) * (1 + (upgrade.value || 0));
        }
    } else if (upgrade.type === 'unit_efficiency') {
        const mapping = { autoClicker: 0, smileyTree: 1, smileyFactory: 2 };
        const targetIndex = mapping[upgrade.unit];
        if (typeof targetIndex === 'number' && buildingsData[targetIndex]) {
            // apply efficiency as additional multiplier to baseSPS
            buildingsData[targetIndex].baseSPS = Number(buildingsData[targetIndex].baseSPS) * (1 + (upgrade.value || 0));
        }
    }

    // Aktualisiere UI und speichere
    computeTotalSPS();
    updateResearchButtons();
    updateUI();
    speichereSpiel();
}
/**
 * Berechnet die verdienten Prestieg-Punkte und führt den Spiel-Reset durch.
 */
function prestigeReset(){
    const threshold = 1_000_000;
    if (gameState.gesammelte_smileys < threshold){
        alert("Du brauchst mindestens 1 Million gesammelte Smileys, um Prestige-Punkte zu verdienen!");
        return;
    }

    const newTotalPoints = Math.floor(Math.log10(gameState.gesammelte_smileys / threshold) * 10);
    const newPointsToEarn = Math.max(0, newTotalPoints - gameState.gesamt_prestige_punkte);

    if(newPointsToEarn === 0 ){
        alert("Du verdienst aktuell keine neuen Prestige-Punkte.");
        return;
    }

    if (!confirm(`Bist du sicher, dass du das Spiel zurücksetzen und ${newPointsToEarn} Prestige-Punkte verdienen möchtest?`)) {
        return;
}

gameState.gesamt_prestige_punkte += newPointsToEarn;
gameState.prestige_punkte_verfügbar += newPointsToEarn;

gameState.aktuelle_smileys = 0;
gameState.gesammelte_smileys = 0; 
gameState.totalSPS = 0;
gameState.forschungPunkte = 0;
gameState.gesamteGeklickteSmileys = 0; 
gameState.klickKraft = 1;
gameState.klickUpgradeBonus = 0;

buildingCounts = buildingCounts.map(()=> 0);
buildingPrices = buildingsData.map(item => item.basePrice);
researchStatus = researchStatus.map(()=> false);

applyAllPrestigeBonuses();
updateUI();
speichereSpiel();

alert(`Prestige-Reset erfolgreich! Du hast ${newPointsToEarn} Prestige-Punkte verdient.`);
}

/** 
 * Führt den kauf eines Gebäudes durch, aktualisiert Zähler, Preis und speichert 
 * @param {number} index - Index des kaufenden Gebäudes in buildingCOunts/buildingsData.
 */
function kaufeMehrereGebaeude(index, amount) {
    const item = buildingsData[index];
    let totalCost = 0;
    
    // Prüfe ob es ein spezielles Gebäude mit max. Anzahl ist
    if (item.isSpecial && item.maxCount) {
        const possibleAmount = item.maxCount - buildingCounts[index];
        if (possibleAmount <= 0) return;
        amount = Math.min(amount, possibleAmount);
    }
    
    // Berechne die Gesamtkosten
    let tempCount = buildingCounts[index];
    for(let i = 0; i < amount; i++) {
        totalCost += calculateNextCost(item.basePrice, tempCount + i, item.growthRate);
    }
    
    // Prüfe ob genug Smileys vorhanden sind
    if (gameState.aktuelle_smileys < totalCost) {
        return;
    }
    
    // Kaufe die Gebäude
    gameState.aktuelle_smileys -= totalCost;
    buildingCounts[index] += amount;
    
    // Aktualisiere den Preis für den nächsten Kauf
    buildingPrices[index] = calculateNextCost(item.basePrice, buildingCounts[index], item.growthRate);
    
    produziereSmileys();
    updateUI();
    speichereSpiel();
}

function kaufeGebaeude(index) {
    kaufeMehrereGebaeude(index, 1);
}
/**
 * Der Haupt-Loop des Spiels (alle 100ms). Berechnet SPS, sammelt Smileys/Forschungspunkte und speichert.
 */
function produziereSmileys(){
    // benutze computeTotalSPS um totalSPS konsistent zu halten
    const currentSPS = computeTotalSPS();

    // Forschungslabor-SPS (Index 3) separat behandeln
    let researchSPS = 0;
    if (buildingCounts[3] > 0) {
        researchSPS = 1 * buildingCounts[3] * (gameState.researchLabPrestigeMulti || 1);
    }

    const timeFactor = 0.1;
    gameState.aktuelle_smileys += currentSPS * timeFactor;
    gameState.gesammelte_smileys += currentSPS * timeFactor;

    gameState.forschungPunkte += researchSPS * timeFactor;

    speichereSpiel();
}

/**
 * Berechnet und setzt gameState.totalSPS basierend auf aktuellen Gebäuden und Boni.
 * @returns {number} totalSPS
 */
function computeTotalSPS() {
    let currentSPS = 0;
    buildingsData.forEach((item, index) => {
        const count = buildingCounts[index] || 0;
        if (count > 0) {
            currentSPS += item.baseSPS * count * (item.prestigeMulti || 1) * (gameState.globalerPrestigeMultiplikator || 1);
        }
    });
    gameState.totalSPS = currentSPS;
    return currentSPS;
}
function renderBuildings() {
    const buildingGrid = getById('building-grid');
    if (!buildingGrid) return;

    buildingGrid.innerHTML = '';
    
    buildingsData.forEach((building, index) => {
        const buildingDiv = document.createElement('div');
        buildingDiv.classList.add('building');
        
        // Berechne die Kosten für 10x und 100x
        const cost1x = buildingPrices[index];
        let cost10x = 0;
        let cost100x = 0;
        
        // Simuliere die Kosten für 10 und 100 Käufe
        let tempCount = buildingCounts[index];
        for(let i = 0; i < 10; i++) {
            cost10x += calculateNextCost(building.basePrice, tempCount + i, building.growthRate);
        }
        tempCount = buildingCounts[index];
        for(let i = 0; i < 100; i++) {
            cost100x += calculateNextCost(building.basePrice, tempCount + i, building.growthRate);
        }
        
        // Berechne den SPS-Beitrag
        const buildingSPS = building.baseSPS * buildingCounts[index] * building.prestigeMulti * gameState.globalerPrestigeMultiplikator;
        const spsPercentage = gameState.totalSPS > 0 ? (buildingSPS / gameState.totalSPS * 100).toFixed(1) : 0;
        
        buildingDiv.innerHTML = `
            <h3>${building.name}</h3>
            <p class="count">Anzahl: <span id="${building.elementId}_count">0</span></p>
            <p class="production">Produktion: <span id="${building.elementId}_sps">${formatNumber(buildingSPS)}</span> SPS (<span id="${building.elementId}_sps_pct">${spsPercentage}</span>%)</p>
            <p class="price">Kosten: <span id="${building.elementId}_price">${formatNumber(cost1x)}</span></p>
            <div class="button-group">
                <button id="${building.elementId}_1x" class="btn-buy">1x (${formatNumber(cost1x)})</button>
                <button id="${building.elementId}_10x" class="btn-buy">10x (${formatNumber(cost10x)})</button>
                <button id="${building.elementId}_100x" class="btn-buy">100x (${formatNumber(cost100x)})</button>
            </div>
        `;
        
        buildingGrid.appendChild(buildingDiv);
        
        // Event Listener für alle drei Buttons
        ['1x', '10x', '100x'].forEach(amount => {
            const button = getById(`${building.elementId}_${amount}`);
            if (button) {
                button.addEventListener('click', () => {
                    const count = amount === '1x' ? 1 : amount === '10x' ? 10 : 100;
                    kaufeMehrereGebaeude(index, count);
                });
            }
        });
    });
}

function initialisierePrestigePage() {
    ladeSpiel();
    renderPrestigeUpgrades();
    applyAllPrestigeBonuses();
    updatePrestigeUI();
    
    const resetButton = getById('prestige_reset_button');
    if (resetButton) {
        resetButton.addEventListener('click', prestigeReset);
    }
    
    setInterval(updatePrestigeUI, 100);
}

function updatePrestigeUI() {
    const threshold = 1_000_000;
    const possiblePoints = Math.floor(Math.log10(gameState.gesammelte_smileys / threshold) * 10);
    const newPoints = Math.max(0, possiblePoints - gameState.gesamt_prestige_punkte);

    // Update Prestige-Seiten-spezifische Elemente
    if (getById('prestige_punkte_verfügbar')) {
        getById('prestige_punkte_verfügbar').innerText = formatNumber(gameState.prestige_punkte_verfügbar);
    }
    if (getById('gesamt_prestige_punkte')) {
        getById('gesamt_prestige_punkte').innerText = formatNumber(gameState.gesamt_prestige_punkte);
    }
    if (getById('aktuelle_smileys_prestige')) {
        getById('aktuelle_smileys_prestige').innerText = formatNumber(gameState.aktuelle_smileys);
    }
    if (getById('next_prestige_point')) {
        const nextThreshold = threshold * Math.pow(10, Math.ceil(Math.log10(gameState.gesammelte_smileys / threshold)));
        getById('next_prestige_point').innerText = formatNumber(nextThreshold);
    }

    // Update Reset-Button
    const resetButton = getById('prestige_reset_button');
    if (resetButton) {
        resetButton.disabled = newPoints <= 0;
        resetButton.innerText = `Prestige Reset (${formatNumber(newPoints)} Punkte)`;
    }
}

function initialisiereSpiel(){
    ladeSpiel();

    // Prüfe, auf welcher Seite wir sind
    if (document.querySelector('.prestige-main')) {
        initialisierePrestigePage();
        return;
    }

    // Wende Boni an bevor UI gerendert wird, damit SPS-Berechnungen korrekt sind
    applyAllPrestigeBonuses();
    // Berechne totalSPS vor dem Rendern, damit Prozentwerte korrekt initialisiert sind
    computeTotalSPS();

    renderBuildings();
    renderPrestigeUpgrades();
    renderResearchUpgrades();

    setupEventListeners();

    updateUI();

    // Initial einmal alle UI Elemente anzeigen
    getById('building-grid').style.display = 'grid';
    getById('upgrade-grid').style.display = 'none';
    getById('research_upgrades_grid').style.display = 'none';
    getById('prestige_upgrades_grid').style.display = 'none';

    setInterval(updateGame, 100);
    setInterval(produziereSmileys, 100);
}
