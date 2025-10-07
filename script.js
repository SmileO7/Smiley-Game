document.addEventListener('DOMContentLoaded', () => {
    // Ruft die Hauptinitialisierungsfunktion auf, sobald das DOM geladen ist.
    initialisiereSpiel();
});

//================================================================================================================
// --- 1. GLOBALE VARIABLEN & DATEN ---
//================================================================================================================

// SPIEL-DATEN (Konstanten)
const buildingsData = [
    { name: "Auto-Klicker", basePrice: 20, growthRate: 1.10, elementId: "auto_klicker_button_1x", baseSPS: 1 },
    { name: "Smiley-Baum", basePrice: 100, growthRate: 1.15, elementId: "smileyTreeButton1x", baseSPS: 20 },
    { name: "Smiley-Fabrik", basePrice: 1000, growthRate: 1.20, elementId: "smileyFactoryButton1x", baseSPS: 150 },
    // NEUE GEBÄUDE (4 - 15)
    { name: "Smiley-Mine", basePrice: 10000, growthRate: 1.25, elementId: "smileyMineButton1x", baseSPS: 1000 },
    { name: "Smiley-Bohrer", basePrice: 50000, growthRate: 1.30, elementId: "smileyBohrerButton1x", baseSPS: 5000 },
    { name: "Smiley-Kernkraftwerk", basePrice: 250000, growthRate: 1.35, elementId: "smileyKernkraftwerkButton1x", baseSPS: 25000 },
    { name: "Smiley-Galaxie", basePrice: 1250000, growthRate: 1.40, elementId: "smileyGalaxieButton1x", baseSPS: 125000 },
    { name: "Dimensionsportal", basePrice: 6250000, growthRate: 1.45, elementId: "dimensionsPortalButton1x", baseSPS: 625000 },
    { name: "Zeitmaschine", basePrice: 31250000, growthRate: 1.50, elementId: "zeitmaschineButton1x", baseSPS: 3125000 },
    { name: "Meta-Klicker", basePrice: 156250000, growthRate: 1.55, elementId: "metaKlickerButton1x", baseSPS: 15625000 },
    { name: "Quanten-Netzwerk", basePrice: 781250000, growthRate: 1.60, elementId: "quantenNetzwerkButton1x", baseSPS: 78125000 },
    { name: "Endloser Speicher", basePrice: 3906250000, growthRate: 1.65, elementId: "endloserSpeicherButton1x", baseSPS: 390625000 },
    { name: "Ursprung", basePrice: 19531250000, growthRate: 1.70, elementId: "ursprungButton1x", baseSPS: 1953125000 },
    { name: "Kosmische Einheit", basePrice: 97656250000, growthRate: 1.75, elementId: "kosmischeEinheitButton1x", baseSPS: 9765625000 },
    { name: "Absoluter Schöpfer", basePrice: 488281250000, growthRate: 1.80, elementId: "absoluterSchoepferButton1x", baseSPS: 48828125000 },
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
const prestigeUpgrades = [
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
const forschungslaborBaseCost = 5000;
const forschungslaborGrowthRate = 1.3;
const autoClickerBaseCost = 20;
const autoClickerGrowthRate = 1.1;
const smileyTreeBaseCost = 150;
const smileyTreeGrowthRate = 1.2;
const smileyFactoryBaseCost = 2500;
const smileyFactoryGrowthRate = 1.25;


//================================================================================================================
// --- 1.1 SPIEL-ZUSTAND (let-Variablen, die gespeichert und geändert werden) ---
//================================================================================================================

// --- HAUPT-SPIELSTATUS ---
let aktuelle_smileys = 0;
let gesammelte_smileys = 0;
let smileyPoints = 0;             // Währung
let klickKraft = 1;               // Basiswert für Klicks
let multiplikator = 1;            // Nicht primär verwendet, aber beibehalten
let klickUpgradeBonus = 0;        // Additiver Klick-Bonus
let gesamteGeklickteSmileys = 0;
let gesamt_prestige_punkte = 0;
let totalSPS = 0; 

// --- FORSCHUNG & PRESTIGE STATUS ---
let forschungPunkte = 0;
let prestige_punkte = 0;
let prestige_upgrades_gekauft = {}; 
let forschungslabor_count = 0;
let forschungslabor_fps_multiplier = 1.0;
let forschungslaborGekauft = false;
let researchUpgradeIndex = 0;
// WICHTIG: Muss 'let' sein, damit es in ladeSpiel() neu zugewiesen werden kann!
let researchStatus = [false, false, false, false, false, false]; 
let gesammelte_prestige_punkte = 0;

/// --- NEUE GEBÄUDE-ZUSTÄNDE (Ersetzen die 30 Einzelvariablen) ---
// Alle Zähler, initialisiert auf 0 (Muss 15 Elemente haben)
let buildingCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; 

// Alle aktuellen Preise (Muss 15 Elemente haben, entsprechend buildingsData)
let buildingPrices = [20, 100, 1000, 10000, 50000, 250000, 1250000, 6250000, 31250000, 156250000, 781250000, 3906250000, 19531250000, 97656250000, 488281250000];


//================================================================================================================
// --- 1.2  BONI & MULTIPLIER (let) ---
//================================================================================================================

// --- GLOBALE BONI ---
let globalerPrestigeMultiplikator = 1.0;
let globalSpsMultiplier = 1.0;
let buildingCostReduction = 0; 
let sammelbuchClickPowerBonus = 0;
let klickBoostPerPrestigePoint = 0;
let klickPrestigeMultiplier = 1; 
let klickBoostPerPPValue = 0; 
let researchLabPrestigeMulti = 1;


// --- PRESTIGE MULTIPLIER (15x) ---
let autoClickerPrestigeMulti = 1;
let smileyTreePrestigeMulti = 1;
let smileyFactoryPrestigeMulti = 1;
let smileyMinePrestigeMulti = 1;
let smileyBohrerPrestigeMulti = 1;
let smileyKernkraftwerkPrestigeMulti = 1;
let smileyGalaxiePrestigeMulti = 1;
let dimensionsPortalPrestigeMulti = 1;
let zeitmaschinePrestigeMulti = 1;
let metaKlickerPrestigeMulti = 1;
let quantenNetzwerkPrestigeMulti = 1;
let endloserSpeicherPrestigeMulti = 1;
let ursprungPrestigeMulti = 1;
let kosmischeEinheitPrestigeMulti = 1;
let absoluterSchoepferPrestigeMulti = 1;

// --- FORSCHUNGSEFFIZIENZ-BONI (30x) ---

// Additive Boni (steigern die Basis-SPS)
let autoClickerResearchBonus = 0;
let smileyTreeResearchBonus = 0;
let smileyFactoryResearchBonus = 0;
let smileyMineResearchBonus = 0;
let smileyBohrerResearchBonus = 0;
let smileyKernkraftwerkResearchBonus = 0;
let smileyGalaxieResearchBonus = 0;
let dimensionsPortalResearchBonus = 0;
let zeitmaschineResearchBonus = 0;
let metaKlickerResearchBonus = 0;
let quantenNetzwerkResearchBonus = 0;
let endloserSpeicherResearchBonus = 0;
let ursprungResearchBonus = 0;
let kosmischeEinheitResearchBonus = 0;
let absoluterSchoepferResearchBonus = 0;

// Multiplikative Boni (steigern die Effizienz)
let autoClickerEfficiencyBonus = 0;
let smileyTreeEfficiencyBonus = 0;
let smileyFactoryEfficiencyBonus = 0;
let smileyMineEfficiencyBonus = 0;
let smileyBohrerEfficiencyBonus = 0;
let smileyKernkraftwerkEfficiencyBonus = 0;
let smileyGalaxieEfficiencyBonus = 0;
let dimensionsPortalEfficiencyBonus = 0;
let zeitmaschineEfficiencyBonus = 0;
let metaKlickerEfficiencyBonus = 0;
let quantenNetzwerkEfficiencyBonus = 0;
let endloserSpeicherEfficiencyBonus = 0;
let ursprungEfficiencyBonus = 0;
let kosmischeEinheitEfficiencyBonus = 0;
let absoluterSchoepferEfficiencyBonus = 0;

//================================================================================================================
// --- 2. INITIALISIERUNG & SETUP ---
//================================================================================================================

function initialisiereSpiel() {
    console.log("Spielinitialisierung gestartet.");

    // 1. Lade den gespeicherten Zustand ZUERST!
    ladeSpiel(); 
    
    // 2. Wende Prestige-Boni an (muss nach ladeSpiel() erfolgen)
    applyAllPrestigeBonuses(); 

    // 3. Initialisiere die UI-Elemente (JETZT mit den geladenen Werten)
    createUpgradeElements(clickerUpgrades, 'upgrade-grid');
    createUpgradeElements(buildingsData, 'building-grid');
    createPrestigeUpgrades();
    createPrestigeElements();
    renderResearchUpgrades(); 


    // 4. Setze alle Event Listener
    setupEventListeners(); 

    // 5. Starte die Spiel-Loops
    updateGame(); 
    setInterval(produziereSmileys, 100); 
    setInterval(updateGame, 1000); 
    window.addEventListener('beforeunload', speichereSpiel); 
    
    console.log("Spielinitialisierung abgeschlossen. Spiel ist nun aktiv.");
}

function setupEventListeners() {
    // Klicker: Mit Überprüfung auf Existenz
    const smileyButton = document.getElementById('smiley_button');
    if (smileyButton) {
        smileyButton.addEventListener('click', klickeSmiley);
    }
    
    // Gebäude & Upgrades (Event Delegation)
    const buildingGrid = document.querySelector('.building-grid');
    if (buildingGrid) {
        buildingGrid.addEventListener('click', (event) => {
            // KORREKTUR: Suche nach .btn-buy, da dies das korrekte Selektor ist.
            const button = event.target.closest('.btn-buy'); 
            if (button && button.dataset.type === 'building-grid') {
                const index = parseInt(button.dataset.index);
                const amount = parseInt(button.dataset.buyAmount);
                kaufeItem('building-grid', index, amount);
            }
        });
    }

    const upgradeGrid = document.querySelector('.upgrade-grid');
    if (upgradeGrid) {
        upgradeGrid.addEventListener('click', (event) => {
            // KORREKTUR: Suche nach .btn-buy, da dies das korrekte Selektor ist.
            const button = event.target.closest('.btn-buy'); 
            if (button && button.dataset.type === 'upgrade-grid') {
                const index = parseInt(button.dataset.index);
                kaufeItem('upgrade-grid', index, 1);
            }
        });
    }
    
    // Forschungslabor & Prestige
    const forschungslaborButton = document.getElementById('forschungslaborButton');
    if (forschungslaborButton) {
        forschungslaborButton.addEventListener('click', kaufeForschungslabor);
    }
    
    const forschungUpgradeButton = document.getElementById('forschungUpgradeButton');
    if (forschungUpgradeButton) {
        forschungUpgradeButton.addEventListener('click', kaufeForschungsUpgrade);
    }
    
    // Prestige-Button
    const prestigeButton = document.getElementById('prestige_button');
    if (prestigeButton) {
        prestigeButton.addEventListener('click', prestige); 
    }
    
    // Prestige Upgrades (Event Delegation)
    const prestigeGrid = document.getElementById('prestige_upgrades_grid');
    if (prestigeGrid) {
        prestigeGrid.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            const upgradeDiv = event.target.closest('.prestige-upgrade');
            if (button && upgradeDiv) {
                const upgradeId = upgradeDiv.dataset.id;
                kaufePrestigeUpgrade(upgradeId);
            }
        });
    }
}

function updateGame() {
    // Die zentrale Funktion, die alles aktualisiert
    updateDisplay();
    updateButtons();
    berechneKlickkraft();
    updateUpgradesDisplay();
    updatePrestigeButtons();
    updateResearchButtons();
    renderResearchUpgrades(); 
    updateUI();
}

/**
 * Hauptfunktion zur Aktualisierung der gesamten Benutzeroberfläche.
 * Wird nach dem Laden des Spiels und nach jeder größeren Aktion aufgerufen.
 */
function updateUI() {
    updateDisplay();         // Aktualisiert die Textanzeigen (Deine Funktion)
    updateButtons();         // Aktualisiert die Kauf-Buttons
    renderResearchUpgrades(); // Aktualisiert den Forschungs-Reiter
    updatePrestigeButtons(); // Aktualisiert den Prestige-Button
    renderPrestigeUpgrades();  // Aktualisiert den Prestige-Baum
    // Hinweis: updateDisplay() ruft alle notwendigen Anzeige-Updates auf.
}

//================================================================================================================
// --- HILFSFUNKTIONEN (UTILITIES) ---
//================================================================================================================

/**
 * Formatiert große Zahlen in ein lesbares Format (z.B. 1.23M, 4.56B)
 * @param {number} num Die zu formatierende Zahl
 * @returns {string} Die formatierte Zahl
 */
function formatLargeNumber(num) {
    if (num < 1000) {
        // Zeigt kleine Zahlen mit zwei Dezimalstellen
        return num.toFixed(2);
    }

    const units = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    let unitIndex = 0;
    let formattedNum = num;

    // Finde die passende Einheit
    while (formattedNum >= 1000 && unitIndex < units.length - 1) {
        formattedNum /= 1000;
        unitIndex++;
    }

    // Formatiere die Zahl mit zwei Dezimalstellen und der Einheit
    return formattedNum.toFixed(2) + units[unitIndex];
}

//================================================================================================================
// --- 4. KERN-SPIELLOGIK ---
//================================================================================================================

function klickeSmiley() {
    const smileyElement = document.getElementById('smiley_button');
    if (smileyElement) {
        smileyElement.classList.add('pop');
        setTimeout(() => {
            smileyElement.classList.remove('pop');
        }, 150);
    }
    // Klickwert-Berechnung: (Basis + Upgrades + Sammelbuch) * Globaler Multi + (Gesamt PP * PP-Klickboost)
    const klickwert = (1 + klickUpgradeBonus + sammelbuchClickPowerBonus) * globalerPrestigeMultiplikator + (gesamtPrestigePunkte * klickBoostPerPrestigePoint);
    const pp_klick_bonus = gesammelte_prestige_punkte * klickBoostPerPPValue;

    aktuelle_smileys += klickwert * klickPrestigeMultiplier + pp_klick_bonus; 
    gesammelte_smileys += klickwert * klickPrestigeMultiplier + pp_klick_bonus;
    gesamteGeklickteSmileys += klickwert * klickPrestigeMultiplier + pp_klick_bonus; 
    speichereSpiel();
    updateDisplay();
    // checkAchievements(); // Auskommentiert gelassen
}

/**
 * Berechnet die Gesamt-Klickkraft des Spielers basierend auf allen Boni.
 * Das Ergebnis wird in die globale Variable klickKraft geschrieben.
 */
function berechneKlickkraft() {
    // 1. Basiswert
    let baseClickPower = 1; 
    
    // 2. Additive Boni
    // KORREKTUR: Verwende hier die Variablen, die du für Upgrades/Prestige speichern wirst!
    let totalAdditiveBonus = klickUpgradeBonus + sammelbuchClickPowerBonus + klickBoostPerPPValue;
    
    // 3. Multiplikative Boni
    let totalMultipliers = klickPrestigeMultiplier * 1.0; 
    
    // Formel: (Basiswert + Additiver Bonus) * Multiplikator
    klickKraft = (baseClickPower + totalAdditiveBonus) * totalMultipliers;
    
    // Sicherstellen, dass die Klickkraft mindestens 1 ist
    if (klickKraft < 1) {
        klickKraft = 1;
    }
}

function produziereSmileys() {
    // Array mit den Zähler-Variablen für einen einfacheren Zugriff in der Berechnung
    const productionCounts = buildingCounts;
    
    // Array mit den Additiven Forschungs-Boni (ResearchBonus)
    const researchBonuses = [
        autoClickerResearchBonus, smileyTreeResearchBonus, smileyFactoryResearchBonus, smileyMineResearchBonus, smileyBohrerResearchBonus,
        smileyKernkraftwerkResearchBonus, smileyGalaxieResearchBonus, dimensionsPortalResearchBonus, zeitmaschineResearchBonus,
        metaKlickerResearchBonus, quantenNetzwerkResearchBonus, endloserSpeicherResearchBonus, ursprungResearchBonus,
        kosmischeEinheitResearchBonus, absoluterSchoepferResearchBonus
    ];

    // Array mit den Multiplikativen Prestige-Boni (PrestigeMulti)
    const prestigeMultis = [
        autoClickerPrestigeMulti, smileyTreePrestigeMulti, smileyFactoryPrestigeMulti, smileyMinePrestigeMulti, smileyBohrerPrestigeMulti,
        smileyKernkraftwerkPrestigeMulti, smileyGalaxiePrestigeMulti, dimensionsPortalPrestigeMulti, zeitmaschinePrestigeMulti,
        metaKlickerPrestigeMulti, quantenNetzwerkPrestigeMulti, endloserSpeicherPrestigeMulti, ursprungPrestigeMulti,
        kosmischeEinheitPrestigeMulti, absoluterSchoepferPrestigeMulti
    ];

    // Array mit den Multiplikativen Effizienz-Boni (EfficiencyBonus)
    const efficiencyBonuses = [
        autoClickerEfficiencyBonus, smileyTreeEfficiencyBonus, smileyFactoryEfficiencyBonus, smileyMineEfficiencyBonus, smileyBohrerEfficiencyBonus,
        smileyKernkraftwerkEfficiencyBonus, smileyGalaxieEfficiencyBonus, dimensionsPortalEfficiencyBonus, zeitmaschineEfficiencyBonus,
        metaKlickerEfficiencyBonus, quantenNetzwerkEfficiencyBonus, endloserSpeicherEfficiencyBonus, ursprungEfficiencyBonus,
        kosmischeEinheitEfficiencyBonus, absoluterSchoepferEfficiencyBonus
    ];


    // --- 1. GESAMTPRODUKTION BERECHNEN (ALLE 15 GEBÄUDE) ---
    let totalBaseSPS = 0;
    
    // Wir iterieren durch alle 15 Gebäude in der buildingsData-Konstante (die du korrekt definiert hast)
    for (let i = 0; i < buildingsData.length; i++) {
        const data = buildingsData[i];
        
        // Formel: Basis-SPS * (1 + Forschungsbonus) * Prestige-Multiplikator * (1 + Effizienzbonus)
        const unitSPS = 
            data.baseSPS * (1 + researchBonuses[i]) * prestigeMultis[i] * (1 + efficiencyBonuses[i]);

        // Gesamt-SPS = UnitSPS * Anzahl der Einheiten
        totalBaseSPS += productionCounts[i] * unitSPS;
    }

    // --- 2. GLOBALE MULTIPLIER ANWENDEN ---
        // totalBonusSPS enthält die korrekte SPS mit allen Multiplikatoren
        const totalBonusSPS = totalBaseSPS * globalerPrestigeMultiplikator * researchLabPrestigeMulti * globalSpsMultiplier;

        // KORREKT HINZUFÜGEN: Speichere den finalen Wert in der globalen Variable!
        totalSPS = totalBonusSPS; 

        // Aktualisierung (geteilt durch 10, da diese Funktion alle 100ms läuft)
        aktuelle_smileys += totalSPS / 10;
        gesammelte_smileys += totalSPS / 10;
    
    // --- 3. FORSCHUNGSPUNKTE ---
    if (forschungslabor_count > 0) {
        // Basis-Produktion pro Labor (0.005) * Multiplikatoren
        const forschungSPSProEinheit = 0.005 * forschungslabor_fps_multiplier * researchLabPrestigeMulti;

        // Gesamtproduktion pro Sekunde
        const forschungSPS = forschungslabor_count * forschungSPSProEinheit;

        // Erhöhung der Forschungspunkte (durch 10 teilen, da alle 100ms)
        forschungPunkte += forschungSPS / 10;
    }
}

function prestige() {
    const required_smileys = prestige_kosten;
    if (aktuelle_smileys < required_smileys) {
        alert("Du hast noch nicht genug Smileys für das Prestige-Upgrade!");
        return;
    }

    const earned_prestige = Math.floor(aktuelle_smileys / required_smileys);
    
    if (!confirm(`Möchtest du wirklich prestige? Du erhältst ${earned_prestige} Prestige-Punkte.`)) {
        return;
    }
    
    // Setze das Spiel zurück (Variablen zurücksetzen)
    aktuelle_smileys = 0;
    gesammelte_smileys = 0;
    // Multiplikatoren (klickUpgradeBonus und multiplikator) werden zurückgesetzt
    multiplikator = 1; 
    klickUpgradeBonus = 0; 
    // Gebäudeanzahlen zurücksetzen
    auto_klicker_count = 0;
    smileyTreeProduction = 0;
    smileyFactoryProduction = 0;
    forschungslabor_count = 0;
    forschungslaborGekauft = false;
    
    // Upgrades, die NICHT Prestige-Upgrades sind, zurücksetzen
    clickerUpgrades.forEach(upgrade => upgrade.bought = 0);
    // Forschungspunkte und Index zurücksetzen
    forschungPunkte = 0;
    researchUpgradeIndex = 0;

    // Füge die verdienten Punkte hinzu
    prestige_punkte += earned_prestige;
    gesamtPrestigePunkte += earned_prestige;
    
    // Prestige-Boni neu anwenden, um die globalen Multiplikatoren zurückzusetzen und nur die gekauften PP-Upgrades zu behalten
    applyAllPrestigeBonuses(); 

    // Speichere den Spielstand und aktualisiere die Anzeige
    speichereSpiel();
    updateGame();
    alert(`Du hast ${earned_prestige} Prestige-Punkte erhalten!`);
}

/**
 * Allgemeine Funktion zum Kauf von Gebäuden oder Upgrades
 * @param {String} type - 'building-grid' oder 'upgrade-grid'
 * @param {number} index - Der Index des Items im jeweiligen Array (buildingsData oder clickerUpgrades)
 * @param {number} amount - Die Menge, die gekauft werden soll (Standard: 1)
 */
function kaufeItem(type, index, amount) {
    if (type === 'building-grid') {
        const item = buildingsData[index];
        
        // KORREKTUR: Wenn das Item NICHT existiert, springe heraus.
        if (!item) return; 

        // --- 1. KAUFKOSTEN BERECHNEN ---
        let currentPrice = buildingPrices[index];
        let gesamtKosten = 0; // KORREKTUR: Einheitliche Schreibweise (CamelCase)
        let finalPrice = currentPrice;
        
        // Berechnung für den Kauf von 'amount' Einheiten 
        let tempPrice = currentPrice;
        for (let i = 0; i < amount; i++){
            // Kosten mit Rabatt (buildingCostReduction)
            const costAfterReduction = tempPrice * (1 - buildingCostReduction);
            gesamtKosten += costAfterReduction;

            // Preis für das nächste Item nach dem Kauf berechnen 
            finalPrice = tempPrice * item.growthRate;
            tempPrice = finalPrice;
        }

        // --- 2. KAUFPRÜFUNG ---
        if (aktuelle_smileys >= gesamtKosten){
            // KORREKTUR: Subtrahiere den akkumulierten, korrekten Wert (gesamtKosten)
            aktuelle_smileys -= gesamtKosten; 
            buildingCounts[index] += amount;
            buildingPrices[index] = finalPrice; // Speichere den neuen, korrekten Preis
        
            speichereSpiel();
            updateUI(); // Aktualisiert die Anzeige und Buttons
        }

    } else if (type === 'upgrade-grid'){
        // Logik für Clicker Upgrades
    }
}







function getBuildingPrice(index, count) {
    // Sicherstellen, dass der Index gültig ist
    if (index < 0 || index >= buildingsData.length) {
        console.error(`Ungültiger Gebäude-Index: ${index}`);
        return Infinity; // Verhindert Kauf bei ungültigem Index
    }
    
    const data = buildingsData[index];
    
    // Formel: Basispreis * Wachstumsrate^Anzahl
    let price = data.basePrice * Math.pow(data.growthRate, count);

    // Gebäude-Kosten-Reduktion anwenden
    if (buildingCostReduction > 0) {
        price *= (1 - buildingCostReduction);
    }
    
    // Stelle sicher, dass der Preis nicht unter den Basispreis fällt
    return Math.max(data.basePrice, Math.floor(price));
}



/**
 * 
 * @param {number} upgradeId - Die ID des Upgrdes (z.B. 1, 2, 3...)
 */
function kaufePrestigeUpgrade(upgradeId){
    //Finde das Upgrade anhand seiner ID 
    const upgrade = prestigeUpgrades.find(up => up.id === upgradeId);

    if  (!upgrade) return;

    const isBought = prestige_upgrades_gekauft[upgradeId];
    const cost = upgrade.cost;

    // 1. Prüfe Verfügbarkeit und Kosten 
    if (isBought) {
        console.log ("Upgrade wurde Bereits gekauft.");
        return;
    }

    if (prestige_punkte < cost) {
        console.log ("Nicht genug Prestige-Punkte.");
        return;
    }

    // Prüfe Abhängigkeiten (fallls im Array definiert)
    const allDependenciesMet = upgrade.dependencies.every(depId => prestige_upgrades_gekauft[depId]);
    if (!allDependenciesMet) {
        console.log ("Abhängigkeiten sind nicht erfüllt.");
        return;
    }

    // 2. Kauf durchführen und Effekt anwenden 
    prestige_punkte -= cost; 

    // Die Upgrade-ID als gekaft markieren
    prestige_upgrades_gekauft[upgradeId] = 1;

    //Effekt auf die relevanten Multiplikatoren anwenden 
    switch(upgrade.target) {
        case 'glonal_sps':
            globalerPrestigeMultiplikator *= upgrade.multiplier;
            break;
        case 'forschungslabor_fps':
            forschungslabor_fps_multiplier *= upgrade.multiplier;
            break;
        case 'research_lab_prestige_multi':
            researchLabPrestigeMulti *= upgrade.multiplier;
            break;
        case 'auto_clicker':
            autoClickerPrestigeMulti *= upgrade.multiplier;
            break;
        case 'smiley_tree':
            smileyTreePrestigeMulti *= upgrade.multiplier;
            break;
        case 'smiley_factory':
            smileyFactoryPrestigeMulti *= upgrade.multiplier;
            break;
    }

    // 3. Speichern und UI aktualisieren 
    speichereSpiel();
    updateGame();
}


function kaufeForschungsUpgrade(upgradeIndex) {
    const upgrade = researchUpgrades[upgradeIndex];
    
    // 1. Prüfen, ob das Upgrade existiert und noch nicht gekauft wurde
    if (!upgrade || researchStatus[upgradeIndex]) {
        console.warn('Upgrade existiert nicht oder wurde bereits gekauft.');
        return;
    }
    
    // 2. Prüfen, ob der Spieler genug Forschungspunkte hat
    if (forschungPunkte >= upgrade.cost) { 
        // Punkte abziehen
        forschungPunkte -= upgrade.cost;
        
        // Upgrade als gekauft markieren
        researchStatus[upgradeIndex] = true;
        
        // 3. Bonus anwenden: Die spezifische Bonusvariable updaten
        
        // A. Additive Produktions-Boni (unit_production)
        if (upgrade.type === 'unit_production') {
            switch(upgrade.unit) {
                case 'autoClicker': autoClickerResearchBonus += upgrade.value; break;
                case 'smileyTree': smileyTreeResearchBonus += upgrade.value; break;
                case 'smileyFactory': smileyFactoryResearchBonus += upgrade.value; break;
                
                // NEUE GEBÄUDE (Additive Boni)
                case 'smileyMine': smileyMineResearchBonus += upgrade.value; break;
                case 'smileyBohrer': smileyBohrerResearchBonus += upgrade.value; break;
                case 'smileyKernkraftwerk': smileyKernkraftwerkResearchBonus += upgrade.value; break;
                case 'smileyGalaxie': smileyGalaxieResearchBonus += upgrade.value; break;
                case 'dimensionsPortal': dimensionsPortalResearchBonus += upgrade.value; break;
                case 'zeitmaschine': zeitmaschineResearchBonus += upgrade.value; break;
                case 'metaKlicker': metaKlickerResearchBonus += upgrade.value; break;
                case 'quantenNetzwerk': quantenNetzwerkResearchBonus += upgrade.value; break;
                case 'endloserSpeicher': endloserSpeicherResearchBonus += upgrade.value; break;
                case 'ursprung': ursprungResearchBonus += upgrade.value; break;
                case 'kosmischeEinheit': kosmischeEinheitResearchBonus += upgrade.value; break;
                case 'absoluterSchoepfer': absoluterSchoepferResearchBonus += upgrade.value; break;
            }
        
        // B. Multiplikative Effizienz-Boni (unit_efficiency)
        } else if (upgrade.type === 'unit_efficiency') {
             switch(upgrade.unit) {
                case 'autoClicker': autoClickerEfficiencyBonus += upgrade.value; break;
                case 'smileyTree': smileyTreeEfficiencyBonus += upgrade.value; break;
                case 'smileyFactory': smileyFactoryEfficiencyBonus += upgrade.value; break;
                
                // NEUE GEBÄUDE (Multiplikative Boni)
                case 'smileyMine': smileyMineEfficiencyBonus += upgrade.value; break;
                case 'smileyBohrer': smileyBohrerEfficiencyBonus += upgrade.value; break;
                case 'smileyKernkraftwerk': smileyKernkraftwerkEfficiencyBonus += upgrade.value; break;
                case 'smileyGalaxie': smileyGalaxieEfficiencyBonus += upgrade.value; break;
                case 'dimensionsPortal': dimensionsPortalEfficiencyBonus += upgrade.value; break;
                case 'zeitmaschine': zeitmaschineEfficiencyBonus += upgrade.value; break;
                case 'metaKlicker': metaKlickerEfficiencyBonus += upgrade.value; break;
                case 'quantenNetzwerk': quantenNetzwerkEfficiencyBonus += upgrade.value; break;
                case 'endloserSpeicher': endloserSpeicherEfficiencyBonus += upgrade.value; break;
                case 'ursprung': ursprungEfficiencyBonus += upgrade.value; break;
                case 'kosmischeEinheit': kosmischeEinheitEfficiencyBonus += upgrade.value; break;
                case 'absoluterSchoepfer': absoluterSchoepferEfficiencyBonus += upgrade.value; break;
             }
        }
        
        // WICHTIG: UI und Stats aktualisieren
        updateUI();
        renderResearchUpgrades();
        updateGame(); 
        
        console.log(`Forschungs-Upgrade ${upgradeIndex} erfolgreich gekauft!`);
    } else {
        console.log('Nicht genug Forschungspunkte!');
    }
}

function kaufeForschungslabor() {
    const cost = forschungslaborBaseCost * Math.pow(forschungslaborGrowthRate, forschungslabor_count);

    if (forschungslaborGekauft) {
        alert("Das Forschungslabor wurde bereits gekauft!");
        return;
    }

    if (aktuelle_smileys >= cost) {
        aktuelle_smileys -= cost;
        forschungslabor_count++;
        forschungslaborGekauft = true; 

        const forschungslaborButton = document.getElementById('forschungslaborButton');
        if (forschungslaborButton) {
            forschungslaborButton.disabled = true;
            forschungslaborButton.innerText = 'Gekauft'; 
            forschungslaborButton.classList.add('bought'); 
        }

        speichereSpiel();
        updateGame();
    } else {
        alert("Nicht genügend Smileys!");
    }
}
/**
 * 
 * @param {string} upgradeId 
 */
function kaufePrestigeUpgrade(upgradeId) {
    // Finde das Upgrade anhand seiner ID
    const upgrade = prestigeUpgrades.find(up => up.id === upgradeId);
    
    if (!upgrade) return;

    // Wir gehen davon aus, dass prestige_upgrades_gekauft ein Objekt ist: { 'id': 1/0, ... }
    const isBought = prestige_upgrades_gekauft[upgradeId];
    const cost = upgrade.cost;

    // Abhängigkeitsprüfung
    const allDependenciesMet = upgrade.dependencies.every(depId => prestige_upgrades_gekauft[depId]);

    // 1. Prüfe Verfügbarkeit und Kosten
    if (isBought || prestige_punkte < cost || !allDependenciesMet) {
        return;
    }

    // 2. Kauf durchführen und Effekt anwenden
    prestige_punkte -= cost;
    
    // Die Upgrade-ID als gekauft markieren
    prestige_upgrades_gekauft[upgradeId] = 1; 

    // Effekt auf die relevanten Multiplikatoren anwenden (Multiplikation mit 1 + Bonus für SPS-Upgrades!)
    switch(upgrade.type) {
        case 'global_multi':
            // Betrifft Klickkraft UND alle Gebäude (Globaler Multiplikator)
            globalerPrestigeMultiplikator *= (1 + upgrade.bonus);
            clickPrestigeMultiplier *= (1 + upgrade.bonus); // Annahme: clickPrestigeMultiplier existiert für Klickkraft
            break;
        case 'auto_clicker_multi':
            autoClickerPrestigeMulti *= (1 + upgrade.bonus);
            break;
        case 'smiley_tree_multi':
            smileyTreePrestigeMulti *= (1 + upgrade.bonus);
            break;
        case 'smiley_factory_multi':
            smileyFactoryPrestigeMulti *= (1 + upgrade.bonus);
            break;
        case 'research_multi':
            forschungslabor_fps_multiplier *= (1 + upgrade.bonus);
            break;
        case 'global_sps_multi':
            // Nur globale SPS-Produktion, NICHT Klickkraft
            globalerPrestigeMultiplikator *= (1 + upgrade.bonus);
            break;
        case 'cost_reduction':
            // Kostenreduktionen werden addiert (z.B. 0.05 + 0.10 = 0.15)
            buildingCostReduction += upgrade.bonus;
            break;
        case 'klick_boost_per_pp':
            // Annahme: Wir definieren eine Variable, die den totalen Boost pro PP speichert
            klickBoostPerPPValue += upgrade.bonus; 
            break;
    }

    // 3. Speichern und UI aktualisieren
    speichereSpiel();
    updateGame();
}

function applyPrestigeBonus(upgrade) {
    switch (upgrade.type) {
        case 'global_multi':
            globalerPrestigeMultiplikator += upgrade.bonus;
            break;
        case 'auto_clicker_multi':
            autoClickerPrestigeMulti += upgrade.bonus;
            break;
        case 'research_multi':
            researchLabPrestigeMulti += upgrade.bonus;
            break;
        case 'klick_boost_per_pp': 
            klickBoostPerPrestigePoint += upgrade.bonus;
            break;
        case 'global_sps_multi': 
            globalSpsMultiplier += upgrade.bonus;
            break;
        case 'cost_reduction': 
            buildingCostReduction += upgrade.bonus; // Hier wird addiert, da es eine Reduzierung ist (1 - buildingCostReduction)
            break;
        case 'smiley_tree_multi': 
            smileyTreePrestigeMulti += upgrade.bonus;
            break;
        case 'smiley_factory_multi': 
            smileyFactoryPrestigeMulti += upgrade.bonus;
            break;
    }
}

//================================================================================================================
// --- 5. SPEICHERN & LADEN ---
//================================================================================================================

function speichereSpiel() {
    const dataToSave = {
        // --- HAUPT-VARIABLEN ---
        aktuelle_smileys: aktuelle_smileys,
        gesammelte_smileys: gesammelte_smileys,
        smileyPoints: smileyPoints, 
        klickKraft: klickKraft, // Deine Variable klickKraft wird in ladeSpiel benötigt
        multiplikator: multiplikator,
        klickUpgradeBonus: klickUpgradeBonus,
        gesamteGeklickteSmileys: gesamteGeklickteSmileys,
        gesamtPrestigePunkte: gesamtPrestigePunkte,

        // --- FORSCHUNGSLABOR & STATUS ---
        forschungslabor_count: forschungslabor_count,
        forschungslabor_fps_multiplier: forschungslabor_fps_multiplier,
        forschungslaborGekauft: forschungslaborGekauft,
        forschungPunkte: forschungPunkte,
        researchStatus: researchStatus, 
        researchUpgradeIndex: researchUpgradeIndex,

        buildingCounts: buildingCounts,
        buildingPrices: buildingPrices,

        // --- PRESTIGE-DATEN ---
        prestige_punkte: prestige_punkte,
        prestige_upgrades_gekauft: prestige_upgrades_gekauft,
        globalerPrestigeMultiplikator: globalerPrestigeMultiplikator,
        researchLabPrestigeMulti: researchLabPrestigeMulti,
        klickPrestigeMultiplier: klickPrestigeMultiplier,
        klickBoostPerPPValue: klickBoostPerPPValue,
        buildingCostReduction: buildingCostReduction,
        globalSpsMultiplier: globalSpsMultiplier,
        klickBoostPerPrestigePoint: klickBoostPerPrestigePoint,
        sammelbuchClickPowerBonus: sammelbuchClickPowerBonus,
        
        // --- PRESTIGE MULTIPLIKATOREN (15x) ---
        autoClickerPrestigeMulti: autoClickerPrestigeMulti,
        smileyTreePrestigeMulti: smileyTreePrestigeMulti,
        smileyFactoryPrestigeMulti: smileyFactoryPrestigeMulti,
        smileyMinePrestigeMulti: smileyMinePrestigeMulti,
        smileyBohrerPrestigeMulti: smileyBohrerPrestigeMulti,
        smileyKernkraftwerkPrestigeMulti: smileyKernkraftwerkPrestigeMulti,
        smileyGalaxiePrestigeMulti: smileyGalaxiePrestigeMulti,
        dimensionsPortalPrestigeMulti: dimensionsPortalPrestigeMulti,
        zeitmaschinePrestigeMulti: zeitmaschinePrestigeMulti,
        metaKlickerPrestigeMulti: metaKlickerPrestigeMulti,
        quantenNetzwerkPrestigeMulti: quantenNetzwerkPrestigeMulti,
        endloserSpeicherPrestigeMulti: endloserSpeicherPrestigeMulti,
        ursprungPrestigeMulti: ursprungPrestigeMulti,
        kosmischeEinheitPrestigeMulti: kosmischeEinheitPrestigeMulti,
        absoluterSchoepferPrestigeMulti: absoluterSchoepferPrestigeMulti,

        // --- FORSCHUNGS-BONI (30x) ---
        // Additive
        autoClickerResearchBonus: autoClickerResearchBonus,
        smileyTreeResearchBonus: smileyTreeResearchBonus,
        smileyFactoryResearchBonus: smileyFactoryResearchBonus,
        smileyMineResearchBonus: smileyMineResearchBonus,
        smileyBohrerResearchBonus: smileyBohrerResearchBonus,
        smileyKernkraftwerkResearchBonus: smileyKernkraftwerkResearchBonus,
        smileyGalaxieResearchBonus: smileyGalaxieResearchBonus,
        dimensionsPortalResearchBonus: dimensionsPortalResearchBonus,
        zeitmaschineResearchBonus: zeitmaschineResearchBonus,
        metaKlickerResearchBonus: metaKlickerResearchBonus,
        quantenNetzwerkResearchBonus: quantenNetzwerkResearchBonus,
        endloserSpeicherResearchBonus: endloserSpeicherResearchBonus,
        ursprungResearchBonus: ursprungResearchBonus,
        kosmischeEinheitResearchBonus: kosmischeEinheitResearchBonus,
        absoluterSchoepferResearchBonus: absoluterSchoepferResearchBonus,
        // Multiplikative
        autoClickerEfficiencyBonus: autoClickerEfficiencyBonus,
        smileyTreeEfficiencyBonus: smileyTreeEfficiencyBonus,
        smileyFactoryEfficiencyBonus: smileyFactoryEfficiencyBonus,
        smileyMineEfficiencyBonus: smileyMineEfficiencyBonus,
        smileyBohrerEfficiencyBonus: smileyBohrerEfficiencyBonus,
        smileyKernkraftwerkEfficiencyBonus: smileyKernkraftwerkEfficiencyBonus,
        smileyGalaxieEfficiencyBonus: smileyGalaxieEfficiencyBonus,
        dimensionsPortalEfficiencyBonus: dimensionsPortalEfficiencyBonus,
        zeitmaschineEfficiencyBonus: zeitmaschineEfficiencyBonus,
        metaKlickerEfficiencyBonus: metaKlickerEfficiencyBonus,
        quantenNetzwerkEfficiencyBonus: quantenNetzwerkEfficiencyBonus,
        endloserSpeicherEfficiencyBonus: endloserSpeicherEfficiencyBonus,
        ursprungEfficiencyBonus: ursprungEfficiencyBonus,
        kosmischeEinheitEfficiencyBonus: kosmischeEinheitEfficiencyBonus,
        absoluterSchoepferEfficiencyBonus: absoluterSchoepferEfficiencyBonus,

        buildingCounts: buildingCounts,
        buildingPrices: buildingPrices,
        // upgradeStatus: upgradeStatus, // Wird nicht mehr direkt gespeichert
    };
    
    // Speichern im Local Storage
    localStorage.setItem('smileyClickerSave', JSON.stringify(dataToSave));
}

function ladeSpiel() {
    const savedData = localStorage.getItem('smileyClickerSave');
    if (!savedData) return;

    try {
        const loadedData = JSON.parse(savedData);
        
        // --- HAUPT-VARIABLEN ---
        // Wichtig: Deine globalen Variablen müssen mit 'let' deklariert sein, um neu zugewiesen werden zu können.
        aktuelle_smileys = loadedData.aktuelle_smileys || 0;
        gesammelte_smileys = loadedData.gesammelte_smileys || 0;
        smileyPoints = loadedData.smileyPoints || 0;
        klickKraft = loadedData.klickKraft || 1;
        multiplikator = loadedData.multiplikator || 1;
        klickUpgradeBonus = loadedData.klickUpgradeBonus || 0;
        gesamteGeklickteSmileys = loadedData.gesamteGeklickteSmileys || 0;
        gesamtPrestigePunkte = loadedData.gesamtPrestigePunkte || 0;

        if (loadedData.buildingCounts){
            buildingCounts = loadedData.buildingCounts;
        }
        if ( loadedData.buildingPrices){
            buildingPrices = loadedData.buildingPrices;
        }

        // --- FORSCHUNGSLABOR & STATUS ---
        forschungslabor_count = loadedData.forschungslabor_count || 0;
        forschungslabor_fps_multiplier = loadedData.forschungslabor_fps_multiplier || 1.0;
        forschungslaborGekauft = loadedData.forschungslaborGekauft || false;
        forschungPunkte = loadedData.forschungPunkte || 0;
        researchStatus = loadedData.researchStatus || [false, false, false, false, false, false]; 
        researchUpgradeIndex = loadedData.researchUpgradeIndex || 0;

        // --- PRESTIGE-DATEN ---
        prestige_punkte = loadedData.prestige_punkte || 0;
        prestige_upgrades_gekauft = loadedData.prestige_upgrades_gekauft || {};
        globalerPrestigeMultiplikator = loadedData.globalerPrestigeMultiplikator || 1.0;
        researchLabPrestigeMulti = loadedData.researchLabPrestigeMulti || 1.0;
        klickPrestigeMultiplier = loadedData.klickPrestigeMultiplier || 1.0;
        klickBoostPerPPValue = loadedData.klickBoostPerPPValue || 0;
        buildingCostReduction = loadedData.buildingCostReduction || 0;
        globalSpsMultiplier = loadedData.globalSpsMultiplier || 1.0;
        klickBoostPerPrestigePoint = loadedData.klickBoostPerPrestigePoint || 0;
        sammelbuchClickPowerBonus = loadedData.sammelbuchClickPowerBonus || 0;
        
        // --- PRESTIGE MULTIPLIKATOREN (15x) ---
        autoClickerPrestigeMulti = loadedData.autoClickerPrestigeMulti || 1.0;
        smileyTreePrestigeMulti = loadedData.smileyTreePrestigeMulti || 1.0;
        smileyFactoryPrestigeMulti = loadedData.smileyFactoryPrestigeMulti || 1.0;
        smileyMinePrestigeMulti = loadedData.smileyMinePrestigeMulti || 1.0;
        smileyBohrerPrestigeMulti = loadedData.smileyBohrerPrestigeMulti || 1.0;
        smileyKernkraftwerkPrestigeMulti = loadedData.smileyKernkraftwerkPrestigeMulti || 1.0;
        smileyGalaxiePrestigeMulti = loadedData.smileyGalaxiePrestigeMulti || 1.0;
        dimensionsPortalPrestigeMulti = loadedData.dimensionsPortalPrestigeMulti || 1.0;
        zeitmaschinePrestigeMulti = loadedData.zeitmaschinePrestigeMulti || 1.0;
        metaKlickerPrestigeMulti = loadedData.metaKlickerPrestigeMulti || 1.0;
        quantenNetzwerkPrestigeMulti = loadedData.quantenNetzwerkPrestigeMulti || 1.0;
        endloserSpeicherPrestigeMulti = loadedData.endloserSpeicherPrestigeMulti || 1.0;
        ursprungPrestigeMulti = loadedData.ursprungPrestigeMulti || 1.0;
        kosmischeEinheitPrestigeMulti = loadedData.kosmischeEinheitPrestigeMulti || 1.0;
        absoluterSchoepferPrestigeMulti = loadedData.absoluterSchoepferPrestigeMulti || 1.0;

        // --- FORSCHUNGS-BONI (30x) ---
        // Additive
        autoClickerResearchBonus = loadedData.autoClickerResearchBonus || 0;
        smileyTreeResearchBonus = loadedData.smileyTreeResearchBonus || 0;
        smileyFactoryResearchBonus = loadedData.smileyFactoryResearchBonus || 0;
        smileyMineResearchBonus = loadedData.smileyMineResearchBonus || 0;
        smileyBohrerResearchBonus = loadedData.smileyBohrerResearchBonus || 0;
        smileyKernkraftwerkResearchBonus = loadedData.smileyKernkraftwerkResearchBonus || 0;
        smileyGalaxieResearchBonus = loadedData.smileyGalaxieResearchBonus || 0;
        dimensionsPortalResearchBonus = loadedData.dimensionsPortalResearchBonus || 0;
        zeitmaschineResearchBonus = loadedData.zeitmaschineResearchBonus || 0;
        metaKlickerResearchBonus = loadedData.metaKlickerResearchBonus || 0;
        quantenNetzwerkResearchBonus = loadedData.quantenNetzwerkResearchBonus || 0;
        endloserSpeicherResearchBonus = loadedData.endloserSpeicherResearchBonus || 0;
        ursprungResearchBonus = loadedData.ursprungResearchBonus || 0;
        kosmischeEinheitResearchBonus = loadedData.kosmischeEinheitResearchBonus || 0;
        absoluterSchoepferResearchBonus = loadedData.absoluterSchoepferResearchBonus || 0;
        // Multiplikative
        autoClickerEfficiencyBonus = loadedData.autoClickerEfficiencyBonus || 0;
        smileyTreeEfficiencyBonus = loadedData.smileyTreeEfficiencyBonus || 0;
        smileyFactoryEfficiencyBonus = loadedData.smileyFactoryEfficiencyBonus || 0;
        smileyMineEfficiencyBonus = loadedData.smileyMineEfficiencyBonus || 0;
        smileyBohrerEfficiencyBonus = loadedData.smileyBohrerEfficiencyBonus || 0;
        smileyKernkraftwerkEfficiencyBonus = loadedData.smileyKernkraftwerkEfficiencyBonus || 0;
        smileyGalaxieEfficiencyBonus = loadedData.smileyGalaxieEfficiencyBonus || 0;
        dimensionsPortalEfficiencyBonus = loadedData.dimensionsPortalEfficiencyBonus || 0;
        zeitmaschineEfficiencyBonus = loadedData.zeitmaschineEfficiencyBonus || 0;
        metaKlickerEfficiencyBonus = loadedData.metaKlickerEfficiencyBonus || 0;
        quantenNetzwerkEfficiencyBonus = loadedData.quantenNetzwerkEfficiencyBonus || 0;
        endloserSpeicherEfficiencyBonus = loadedData.endloserSpeicherEfficiencyBonus || 0;
        ursprungEfficiencyBonus = loadedData.ursprungEfficiencyBonus || 0;
        kosmischeEinheitEfficiencyBonus = loadedData.kosmischeEinheitEfficiencyBonus || 0;
        absoluterSchoepferEfficiencyBonus = loadedData.absoluterSchoepferEfficiencyBonus || 0;
        
        // --- UI & LOGIK AKTUALISIEREN ---
        updateUI();
        renderResearchUpgrades();
        updateGame();

        console.log('Spielstand erfolgreich geladen.');

    } catch (e) {
        console.error('Fehler beim Laden des Spielstands:', e);
        localStorage.removeItem('smileyClickerSave');
    }
}

function applyAllPrestigeBonuses() {
    // Alle Boni zurücksetzen
    globalerPrestigeMultiplikator = 1.0;
    globalSpsMultiplier = 1.0;
    buildingCostReduction = 0;
    klickBoostPerPrestigePoint = 0;
    autoClickerPrestigeMulti = 1;
    smileyTreePrestigeMulti = 1;
    smileyFactoryPrestigeMulti = 1;
    researchLabPrestigeMulti = 1;
    
    // Alle Upgrades durchgehen und deren Boni anwenden
    prestigeUpgrades.forEach(upgrade => {
        if (prestige_upgrades_gekauft[upgrade.id]) {
            applyPrestigeBonus(upgrade); 
        }
    });
    console.log("Prestige-Boni neu angewendet.");
}


//================================================================================================================
// --- 6. UI-AKTUALISIERUNGSFUNKTIONEN ---
//================================================================================================================

function renderResearchUpgrades() {
    const grid = document.getElementById('research_upgrades_grid');
    if (!grid) return; // Stoppt, falls das Element nicht existiert

    grid.innerHTML = ''; // Leert den Container

    researchUpgrades.forEach((upgrade, index) => {
        // Prüfen, ob bereits gekauft
        const isBought = researchStatus[index];
        const canAfford = gameData.researchPoints >= upgrade.cost;
        const className = isBought ? 'bought' : (canAfford ? 'available' : 'locked');

        const upgradeDiv = document.createElement('div');
        upgradeDiv.className = `research-upgrade ${className}`;
        upgradeDiv.setAttribute('onclick', isBought ? '' : `kaufeForschungsUpgrade(${index})`);
        
        upgradeDiv.innerHTML = `
            <h3>Forschung ${index + 1}</h3>
            <p>${upgrade.description}</p>
            <div class="research-cost">
                Kosten: <span>${upgrade.cost} RP</span>
            </div>
        `;

        grid.appendChild(upgradeDiv);
    });
}
function updateResearchButtons() {
    // Ruft das aktuell verfügbare Upgrade ab
    const upgrade = researchUpgrades[researchUpgradeIndex];
    
    // Annahme: Du hast ein zentrales UI-Element für das Upgrade (z.B. eine Box oder einen Button)
    const upgradeButton = document.getElementById('forschungsUpgradeButton'); 
    const upgradeName = document.getElementById('forschungsUpgradeName');
    const upgradeDescription = document.getElementById('forschungsUpgradeDescription');
    const researchPanel = document.getElementById('research-upgrade-panel'); // Container

    // 1. Prüfe, ob alle Upgrades gekauft sind
    if (!upgrade) {
        if (researchPanel) researchPanel.style.display = 'none';
        if (upgradeName) upgradeName.innerText = 'Alle Forschung abgeschlossen';
        return;
    }

    // 2. Element-Texte aktualisieren
    if (upgradeName) upgradeName.innerText = upgrade.name;
    if (upgradeDescription) upgradeDescription.innerText = upgrade.description;
    
    // 3. Button-Status (Kosten & Verfügbarkeit) aktualisieren
    const cost = upgrade.cost;
    const canAfford = forschungPunkte >= cost;

    if (upgradeButton) {
        upgradeButton.innerText = `Kaufen (${formatLargeNumber(cost)} FP)`; // FP = Forschungspunkte
        upgradeButton.disabled = !canAfford;
        
        // Füge den Event Listener hinzu (oder überprüfe, ob er bereits existiert)
        // Wir setzen hier nur den Zustand, der Event Listener muss einmalig im HTML oder in einer init-Funktion gesetzt werden.
        if (canAfford) {
            upgradeButton.classList.add('available');
        } else {
            upgradeButton.classList.remove('available');
        }
    }
}

function createUpgradeElements(items, containerClass) {
    const container = document.querySelector(`.${containerClass}`);
    if (!container) return;
    container.innerHTML = '';
    
    items.forEach((item, index) => {
        // Erstellt das äußere Element, das alle Styles und Data-Attribute erhält
        const upgradeElement = document.createElement('div');
        upgradeElement.classList.add('upgrade-item');
        upgradeElement.setAttribute('data-index', index); 
        
        let ownedCount = 0;
        let costFunction; // Funktion zur Berechnung der Kosten
        // Ermittelt den Kosten-Reduktionsfaktor
        let costReductionFactor = 1 - (typeof buildingCostReduction !== 'undefined' ? buildingCostReduction : 0); 
        let innerHTML = '';

        if (containerClass === 'building-grid') {
            // --- 1. Berechnung des Preises und der Anzahl ---
            switch(item.elementId) {
                case "auto_clicker_button_1x":
                    // auto_klicker_count war bereits korrekt
                    ownedCount = typeof auto_klicker_count !== 'undefined' ? auto_klicker_count : 0; 
                    itemPrice = item.basePrice * Math.pow(item.growthRate, ownedCount) * costReductionFactor;
                    break;
                case "smileyTreeButton1x":
                    // ✅ KORREKTUR: Verwende smileyTreeProduction
                    ownedCount = typeof smileyTreeProduction !== 'undefined' ? smileyTreeProduction : 0; 
                    itemPrice = item.basePrice * Math.pow(item.growthRate, ownedCount) * costReductionFactor;
                    break;
                case "smileyFactoryButton1x":
                    // ✅ KORREKTUR: Verwende smileyFactoryProduction
                    ownedCount = typeof smileyFactoryProduction !== 'undefined' ? smileyFactoryProduction : 0; 
                    itemPrice = item.basePrice * Math.pow(item.growthRate, ownedCount) * costReductionFactor;
                    break;
                default:
                    itemPrice = item.basePrice * costReductionFactor;
            }
                    // Fallback, sollte nicht erreicht werden
                    costFunction = () => Infinity; 
            

            // --- 2. HTML-Erstellung für Gebäude (UI-Anpassung: Titel in Box, "Nächste Kosten" entfernt) ---
            innerHTML = `
                <div class="upgrade-content">
                    <h3>${item.name}</h3> <p class="building-count">Anzahl: ${formatLargeNumber(ownedCount)}</p>
                    <p class="building-production">Produziert: 0 SPS</p>
                    </div>
                
                <div class="purchase-buttons">
                    <button class="btn-buy" data-type="${containerClass}" data-index="${index}" data-buy-amount="1">1x (0)</button>
                    <button class="btn-buy" data-type="${containerClass}" data-index="${index}" data-buy-amount="10">10x (0)</button>
                    <button class="btn-buy" data-type="${containerClass}" data-index="${index}" data-buy-amount="100">100x (0)</button>
                </div>
            `;
        } else { // Für Klicker-Upgrades
            // --- 1. Berechnung des Preises ---
            const itemPrice = item.price;

            // --- 2. HTML-Erstellung für Klicker-Upgrades (UI-Anpassung: Titel in Box, unnötiger Text entfernt) ---
            const boughtCount = typeof item.bought !== 'undefined' ? item.bought : 0;
            const buttonText = item.bought ? 'Gekauft' : `Kaufen (${formatLargeNumber(itemPrice)})`;
            const buttonDisabled = item.bought ? 'disabled' : '';
            
            innerHTML = `
                <div class="upgrade-content">
                    <h3>${item.name}</h3> <p class="upgrade-count">Gekauft: ${boughtCount}</p>
                    <p class="upgrade-description">${item.description || ''}</p> 
                    </div>

                <button class="btn-buy" data-type="${containerClass}" data-index="${index}" ${buttonDisabled}>
                    ${buttonText}
                </button>
            `;
        }

        upgradeElement.innerHTML = innerHTML;
        container.appendChild(upgradeElement);
    });
}

function createPrestigeElements() {
    // Stellen Sie sicher, dass Sie im HTML einen Container mit der ID 'prestige-grid' haben
    const container = document.getElementById('prestige-grid'); 
    if (!container) return; 

    container.innerHTML = ''; // Vorherige Elemente entfernen

    prestigeUpgrades.forEach(upgrade => {
        // 1. Hauptelement erstellen (WICHTIG: Verwende die Klasse aus deiner update-Funktion!)
        const upgradeDiv = document.createElement('div');
        upgradeDiv.classList.add('upgrade-item', 'prestige-upgrade'); 
        upgradeDiv.dataset.id = upgrade.id; // Damit der Query-Selector in updatePrestigeButtons funktioniert

        // 2. Inhalt (Titel, Beschreibung)
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('upgrade-content');
        
        const nameH3 = document.createElement('h3');
        nameH3.innerText = upgrade.name;
        
        const descP = document.createElement('p');
        descP.innerText = upgrade.description;
        
        const costP = document.createElement('p');
        costP.classList.add('prestige-cost'); 
        costP.innerHTML = `Kosten: <span>${formatLargeNumber(upgrade.cost)} PP</span>`;
        
        contentDiv.appendChild(nameH3);
        contentDiv.appendChild(descP);
        contentDiv.appendChild(costP);
        
        // 3. Kauf-Button
        const button = document.createElement('button');
        button.classList.add('btn-buy');
        button.innerText = `Kaufen (${formatLargeNumber(upgrade.cost)} PP)`;

        // WICHTIG: Event Listener für den Kauf
        button.addEventListener('click', () => {
            kaufePrestigeUpgrade(upgrade.id); 
        });

        // 4. Alles zusammenfügen
        upgradeDiv.appendChild(contentDiv);
        upgradeDiv.appendChild(button);
        container.appendChild(upgradeDiv);
    });
}

function updateDisplay() {
    
    const smileysPerClickValue = (1 + klickUpgradeBonus + sammelbuchClickPowerBonus) * globalerPrestigeMultiplikator + (gesamtPrestigePunkte * klickBoostPerPrestigePoint);

    // HILFSFUNKTION FÜR ZUVERLÄSSIGES UPDATE
    const updateTextIfExist = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = formatLargeNumber(value);
    };

    // Die SPS/SPM IDs müssen im HTML mit der Funktion übereinstimmen!
    updateTextIfExist("aktuelle_smileys", aktuelle_smileys);
    updateTextIfExist("gesammelte_smileys", gesammelte_smileys);
    updateTextIfExist("smileys_pro_klick_anzeige", smileysPerClickValue);

    const spsElement = document.getElementById("smileys_pro_sekunde_anzeige");
    if(spsElement) spsElement.innerText = formatLargeNumber(totalSPS);
    
    const spmElement = document.getElementById("smileys_pro_minute_anzeige");
    if(spmElement) spmElement.innerText = formatLargeNumber(totalSPS * 60);

    // Forschungs- und Prestige-Werte
    updateTextIfExist("forschungspunkte", forschungPunkte);
    updateTextIfExist("forschungslabor_count_anzeige", forschungslabor_count);
    updateTextIfExist("prestige_punkte_anzeige", prestige_punkte);

    // KORREKTUR: Lokale Abfrage der DOM-Elemente für den Forschungsbalken
    const forschungFortschrittBalken = document.getElementById('forschung_fortschritt'); 
    const forschungFortschrittText = document.getElementById('fortschritt-text');
    
    if (forschungslaborGekauft && forschungFortschrittBalken && forschungFortschrittText) {
        const nextUpgrade = researchUpgrades[researchUpgradeIndex];
        if (nextUpgrade) {
            const fortschrittProzent = Math.min(100, (forschungPunkte / nextUpgrade.cost) * 100);
            forschungFortschrittBalken.style.width = fortschrittProzent + '%';
            forschungFortschrittText.innerText = `Fortschritt: ${fortschrittProzent.toFixed(0)}% (Nächstes Upgrade bei ${formatLargeNumber(nextUpgrade.cost)} FP)`;
        } else {
             forschungFortschrittText.innerText = `Alle Forschungs-Upgrades gekauft!`;
             forschungFortschrittBalken.style.width = '100%';
        }
    } else if (forschungFortschrittText) {
        // Zustand, wenn Labor nicht gekauft
        forschungFortschrittText.innerText = `Kaufen Sie das Labor für Forschung.`;
    }

    // Prestige Button Text Aktualisierung
    const prestigeButton = document.getElementById("prestige_button");
    const earned_prestige = Math.floor(aktuelle_smileys / prestige_kosten);
    if (prestigeButton) {
        prestigeButton.innerText = `Prestige (${formatLargeNumber(earned_prestige)} Punkte verdienen)`;
    }
}

/**
 * Aktualisiert alle Buttons (Gebäude und Upgrades) basierend auf dem aktuellen Smiley-Kontostand.
 */
function updateButtons() {
    // Holen des globalen Reduktionsfaktors
    const costReductionFactor = 1 - buildingCostReduction;

    // --- GEBÄUDE BUTTONS AKTUALISIEREN ---
    buildingsData.forEach((item, index) => {
        
        // FIX 1: Lese den korrekten Zähler und Preis aus den globalen Arrays
        const currentCount = buildingCounts[index]; 
        const nextPriceFor1x = buildingPrices[index]; // Das ist der Preis für den Kauf von 1x Item
        
        const itemDiv = document.querySelector(`.building-item[data-index="${index}"]`);
        
        // Finde den Button anhand der elementId (Wenn du die Id verwendest) ODER das Item-DIV
        const button = document.getElementById(item.elementId); // Nur für den 1x Kauf
        if (!button) return; 

        // 1. Berechnung der Gesamtkosten für die Menge 'amount' (Hier nur für 1x)
        const finalCost = nextPriceFor1x * costReductionFactor;

        // 2. Button-Text und Verfügbarkeit aktualisieren
        const countElement = button.querySelector('.count');
        const priceElement = button.querySelector('.price');
        
        // Preis-Text (sichtbar machen)
        if (priceElement) {
            priceElement.innerText = formatLargeNumber(finalCost);
        }
        
        // Zähler-Text (sichtbar machen)
        if (countElement) {
            countElement.innerText = formatLargeNumber(currentCount); 
        }

        // Allgemeine Verfügbarkeitsprüfung (Gebäude)
        const isAvailable = aktuelle_smileys >= finalCost;
        button.classList.toggle('available', isAvailable);
        button.disabled = !isAvailable;

        // OPTIONAL: Preis einfärben
        const priceSpan = button.querySelector('.price');
        if (priceSpan) {
            priceSpan.style.color = isAvailable ? 'blue' : 'red'; // Deine Lieblingsfarben!
        }
    });
    
    // Forschungs-Labor Button
    const forschungslaborButton = document.getElementById('forschungslaborButton');
    if (forschungslaborButton && !forschungslaborGekauft) {
        const cost = forschungslaborBaseCost * Math.pow(forschungslaborGrowthRate, forschungslabor_count);
        forschungslaborButton.innerText = `Kaufen (${formatLargeNumber(cost)} Smileys)`;
        if (aktuelle_smileys >= cost) {
            forschungslaborButton.disabled = false;
            forschungslaborButton.classList.remove('disabled');
        } else {
            forschungslaborButton.disabled = true;
            forschungslaborButton.classList.add('disabled');
        }
    }
    
    // Forschungs-Upgrade Button
    const forschungUpgradeButton = document.getElementById('forschungUpgradeButton');
    const nextUpgrade = researchUpgrades[researchUpgradeIndex];
    if (forschungUpgradeButton) {
        if (nextUpgrade) {
            forschungUpgradeButton.innerText = `Upgrade kaufen (${formatLargeNumber(nextUpgrade.cost)} FP)`;
            if (forschungPunkte >= nextUpgrade.cost) {
                forschungUpgradeButton.disabled = false;
                forschungUpgradeButton.classList.remove('disabled');
            } else {
                forschungUpgradeButton.disabled = true;
                forschungUpgradeButton.classList.add('disabled');
            }
        } else {
            forschungUpgradeButton.innerText = `Alle Upgrades gekauft`;
            forschungUpgradeButton.disabled = true;
            forschungUpgradeButton.classList.add('bought');
        }
    }}

    
function updateUpgradesDisplay() {
    const grid = document.getElementById('building_grid');
    if (!grid) return; // Stoppt, falls das Element nicht existiert
    grid.innerHTML = ''; // Leert das Grid

    // --- HILFS-ARRAYS ZUM ABGLEICH MIT buildingsData ---
    const counts = [
        auto_klicker_count, smileyTreeProduction, smileyFactoryProduction, smileyMineProduction, smileyBohrerProduction,
        smileyKernkraftwerkProduction, smileyGalaxieProduction, dimensionsPortalProduction, zeitmaschineProduction, 
        metaKlickerProduction, quantenNetzwerkProduction, endloserSpeicherProduction, ursprungProduction, 
        kosmischeEinheitProduction, absoluterSchoepferProduction
    ];
    const prices = [
        auto_klicker_price, smileyTreePrice, smileyFactoryPrice, smileyMinePrice, smileyBohrerPrice,
        smileyKernkraftwerkPrice, smileyGalaxiePrice, dimensionsPortalPrice, zeitmaschinePrice, 
        metaKlickerPrice, quantenNetzwerkPrice, endloserSpeicherPrice, ursprungPrice, 
        kosmischeEinheitPrice, absoluterSchoepferPrice
    ];
    const prestigeMultis = [
        autoClickerPrestigeMulti, smileyTreePrestigeMulti, smileyFactoryPrestigeMulti, smileyMinePrestigeMulti, smileyBohrerPrestigeMulti,
        smileyKernkraftwerkPrestigeMulti, smileyGalaxiePrestigeMulti, dimensionsPortalPrestigeMulti, zeitmaschinePrestigeMulti, 
        metaKlickerPrestigeMulti, quantenNetzwerkPrestigeMulti, endloserSpeicherPrestigeMulti, ursprungPrestigeMulti, 
        kosmischeEinheitPrestigeMulti, absoluterSchoepferPrestigeMulti
    ];
    const researchBonuses = [
        autoClickerResearchBonus, smileyTreeResearchBonus, smileyFactoryResearchBonus, smileyMineResearchBonus, smileyBohrerResearchBonus,
        smileyKernkraftwerkResearchBonus, smileyGalaxieResearchBonus, dimensionsPortalResearchBonus, zeitmaschineResearchBonus, 
        metaKlickerResearchBonus, quantenNetzwerkResearchBonus, endloserSpeicherResearchBonus, ursprungResearchBonus, 
        kosmischeEinheitResearchBonus, absoluterSchoepferResearchBonus
    ];
    const efficiencyBonuses = [
        autoClickerEfficiencyBonus, smileyTreeEfficiencyBonus, smileyFactoryEfficiencyBonus, smileyMineEfficiencyBonus, smileyBohrerEfficiencyBonus,
        smileyKernkraftwerkEfficiencyBonus, smileyGalaxieEfficiencyBonus, dimensionsPortalEfficiencyBonus, zeitmaschineEfficiencyBonus, 
        metaKlickerEfficiencyBonus, quantenNetzwerkEfficiencyBonus, endloserSpeicherEfficiencyBonus, ursprungEfficiencyBonus, 
        kosmischeEinheitEfficiencyBonus, absoluterSchoepferEfficiencyBonus
    ];
    
    // Iteriere über alle 15 Gebäude in buildingsData
    buildingsData.forEach((item, index) => {
        
        // --- WERTE FÜR DIESES GEBÄUDE ABGREIFEN ---
        const ownedCount = counts[index];
        const currentPrice = prices[index];
        const baseSPS = item.baseSPS; // Neu: baseSPS direkt aus dem Array
        const prestigeMulti = prestigeMultis[index];
        const researchBonus = researchBonuses[index]; // Additiver Bonus
        const currentEfficiencyBonus = efficiencyBonuses[index]; // Multiplikativer Bonus
        const costReductionFactor = 1 - buildingCostReduction;

        // --- BERECHNUNG DER SPS ---
        // Einheitenspezifische SPS: Basis-SPS * (1 + Add. Forschung) * Prestige-Multi * (1 + Effizienz)
        const unitSPS = baseSPS * (1 + researchBonus) * prestigeMulti * (1 + currentEfficiencyBonus);
        
        // Gesamt-SPS dieses Gebäudes (inkl. Boni, aber noch ohne GLOBALE Boni)
        const totalBuildingSPS_individual = unitSPS * ownedCount; 

        // Gesamt-SPS FINAL (inkl. ALLER Globalen Boni)
        const totalBuildingSPS_final = 
            totalBuildingSPS_individual * globalerPrestigeMultiplikator * researchLabPrestigeMulti * globalSpsMultiplier;


        // --- RENDERING DES ELEMENTS ---
        const upgradeDiv = document.createElement('div');
        upgradeDiv.className = `upgrade-item building-item`;
        upgradeDiv.setAttribute('data-index', index);
        
        const canAfford = smileyPoints >= currentPrice * costReductionFactor;
        
        upgradeDiv.innerHTML = `
            <div class="upgrade-content">
                <h3>${item.name}</h3>
                <p>Besitz: ${formatNumber(ownedCount)}</p>
                <p>Basis-SPS: ${formatNumber(item.baseSPS)}</p>
                <p>Aktuelle SPS/Einheit: ${formatNumber(unitSPS)}</p>
                <p>Gesamtproduktion: ${formatNumber(totalBuildingSPS_final)} SPS</p>
            </div>
            <div class="purchase-buttons">
                <button class="btn-buy ${canAfford ? '' : 'disabled'}" onclick="kaufeUpgrade(${index}, 1)">Kauf (1x): ${formatNumber(currentPrice * costReductionFactor)}</button>
                <button class="btn-buy ${smileyPoints >= calculateMultiBuyCost(index, 10) ? '' : 'disabled'}" onclick="kaufeUpgrade(${index}, 10)">Kauf (10x): ${formatNumber(calculateMultiBuyCost(index, 10) * costReductionFactor)}</button>
                <button class="btn-buy ${smileyPoints >= calculateMultiBuyCost(index, 100) ? '' : 'disabled'}" onclick="kaufeUpgrade(${index}, 100)">Kauf (100x): ${formatNumber(calculateMultiBuyCost(index, 100) * costReductionFactor)}</button>
            </div>
        `;
        
        grid.appendChild(upgradeDiv);
    });
}

function createPrestigeUpgrades() {
    const grid = document.getElementById('prestige_upgrades_grid');
    if (!grid) return; 

    grid.innerHTML = ''; 
    prestigeUpgrades.forEach(upgrade => {
        const upgradeDiv = document.createElement('div');
        upgradeDiv.classList.add('prestige-upgrade');
        upgradeDiv.dataset.id = upgrade.id;

        const isBought = prestige_upgrades_gekauft[upgrade.id];
        let className = isBought ? 'bought' : 'available';

        const allDependenciesMet = upgrade.dependencies.every(depId => prestige_upgrades_gekauft[depId]);
        if (!allDependenciesMet && !isBought) {
            className = 'locked';
        }

        upgradeDiv.classList.add(className);

        const button = document.createElement('button');
        button.innerText = `${upgrade.name} - ${upgrade.cost} PP`;
        button.disabled = !allDependenciesMet || isBought || prestige_punkte < upgrade.cost;
        
        const description = document.createElement('p');
        description.innerText = upgrade.description;

        upgradeDiv.appendChild(button);
        upgradeDiv.appendChild(description);
        grid.appendChild(upgradeDiv);
    });
}

function updatePrestigeButtons() {
    prestigeUpgrades.forEach(upgrade => {
        // Hier sollte upgradeDiv jetzt gefunden werden, da es in createPrestigeElements erzeugt wird
        const upgradeDiv = document.querySelector(`.prestige-upgrade[data-id="${upgrade.id}"]`);
        if (!upgradeDiv) return;

        const button = upgradeDiv.querySelector('button');
        if (!button) return; 
        
        const isBought = prestige_upgrades_gekauft[upgrade.id];
        const allDependenciesMet = upgrade.dependencies.every(depId => prestige_upgrades_gekauft[depId]);
        const isAffordable = prestige_punkte >= upgrade.cost;
        const isAvailable = !isBought && allDependenciesMet && isAffordable;

        // 1. Aktualisiere die Klassen
        upgradeDiv.classList.toggle('bought', isBought);
        upgradeDiv.classList.toggle('available', isAvailable);
        upgradeDiv.classList.toggle('locked', !isBought && !allDependenciesMet); 

        // 2. Aktualisiere den Button-Text und Zustand (UX-Verbesserung)
        if (isBought) {
            button.innerText = 'Gekauft';
            button.disabled = true;
        } else if (!allDependenciesMet) {
            button.innerText = 'Gesperrt';
            button.disabled = true;
        } else {
            button.innerText = `Kaufen (${formatLargeNumber(upgrade.cost)} PP)`;
            button.disabled = !isAvailable;
        }
        
        // 3. Optional: Kosten-Text einfärben (falls Sie das möchten)
        const costSpan = upgradeDiv.querySelector('.prestige-cost span');
        if (costSpan) {
            costSpan.style.color = isAffordable ? 'var(--color-blue-main)' : 'var(--color-red-main)';
        }
    });
}

/**
 * Rendert die Prestige-Upgrades in der Benutzeroberfläche und aktualisiert deren Status.
 * Diese Funktion wird einmal beim Laden/Prestige und bei jedem UI-Update aufgerufen.
 */
function renderPrestigeUpgrades() {
    // Annahme: Die Prestige-Upgrades sind in einem globalen Array/Objekt namens 'prestigeUpgradesData' gespeichert.
    
    // Die Logik, um die DOM-Elemente zu finden und zu aktualisieren, ist komplex, 
    // aber wir definieren hier zumindest die Funktion, um den ReferenceError zu beheben.
    
    // Du kannst hier später die Logik hinzufügen, die durch dein prestigeUpgradesData-Objekt iteriert.
    
    // Da wir keine Upgrade-Daten vorliegen haben, fügen wir nur eine Logik für die Anzeige hinzu.
    // **WICHTIG:** Wenn du eine Funktion `createPrestigeElements()` hast, die die HTML-Elemente erstellt, 
    // muss diese beim initialen Spielstart einmal aufgerufen werden, nicht hier.
    
    // Diese Funktion wird in der Regel nur die Status-Klassen (bought, available, locked) aktualisieren.
    
    // Ein leerer Platzhalter, um den Fehler zu beheben:
    // Hier sollte später deine Iterations-Logik stehen, die die Klassen anpasst.
}