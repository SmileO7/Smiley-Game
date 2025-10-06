document.addEventListener('DOMContentLoaded', () => {
    // Ruft die Hauptinitialisierungsfunktion auf, sobald das DOM geladen ist.
    initialisiereSpiel();
});

//================================================================================================================
// --- 1. GLOBALE VARIABLEN & DATEN ---
//================================================================================================================

// SPIEL-DATEN (Konstanten)
const buildingsData = [
    { name: "Auto-Klicker", basePrice: 20, growthRate: 1.1, elementId: "auto_clicker_button_1x" },
    { name: "Smiley-Baum", basePrice: 100, growthRate: 1.15, elementId: "smileyTreeButton1x" },
    { name: "Smiley-Fabrik", basePrice: 1000, growthRate: 1.2, elementId: "smileyFactoryButton1x" },
];
const clickerUpgrades = [
    { name: "Stärkerer Klick", price: 250, effect: 0.1, type: "click", bought: 0, description: 'Erhöht deine Klickkraft um 10% des Basiswerts.' },
    { name: "Doppelklick-Upgrade", price: 500, effect: 0.2, type: "click", bought: 0, description: 'Erhöht deine Klickkraft um 20% des Basiswerts.' },
    { name: "Dreifachklick-Upgrade", price: 1000, effect: 0.3, type: "click", bought: 0, description: 'Erhöht deine Klickkraft um 30% des Basiswerts.' }
];
const researchUpgrades = [
    { cost: 10, description: 'Erhöht die Produktion der Auto-Klicker um 10%', type: 'autoClicker', bonusVariable: 'autoClickerResearchBonus', value: 0.1 },
    { cost: 25, description: 'Erhöht die Produktion der Smiley-Bäume um 10%', type: 'smileyTree', bonusVariable: 'smileyTreeResearchBonus', value: 0.1 },
    { cost: 50, description: 'Erhöht die Produktion der Smiley-Fabriken um 10%', type: 'smileyFactory', bonusVariable: 'smileyFactoryResearchBonus', value: 0.1 },
    { cost: 100, description: 'Deine Auto-Klicker sind 20% effizienter.', type: 'efficiency', bonusVariable: 'efficiencyBonus', value: 0.2 },
    { cost: 200, description: 'Deine Smiley-Bäume sind 20% effizienter.', type: 'efficiency', bonusVariable: 'efficiencyBonus', value: 0.2 },
    { cost: 500, description: 'Deine Smiley-Fabriken sind 20% effizienter.', type: 'efficiency', bonusVariable: 'efficiencyBonus', value: 0.2 }
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


// SPIEL-ZUSTAND (let-Variablen, die gespeichert und geändert werden)
let aktuelle_smileys = 0;
let gesammelte_smileys = 0;
let smiley_points = 0; // Nicht verwendet, aber beibehalten
let multiplikator = 1; // Nicht verwendet, aber beibehalten
let auto_klicker_count = 0;
let smileyTreeProduction = 0;
let smileyFactoryProduction = 0;
let forschungslabor_count = 0;
let forschungslabor_fps_multiplier = 1.0;
let klickUpgradeBonus = 0;
let forschungPunkte = 0; // Wichtig: Groß-/Kleinschreibung beibehalten
let researchUpgradeIndex = 0;
let gesamteGeklickteSmileys = 0;
let gesamtPrestigePunkte = 0;
let forschungslaborGekauft = false;
let prestige_punkte = 0;
let prestige_upgrades_gekauft = {}; 

// Bonus-Variablen
let globalerPrestigeMultiplikator = 1.0;
let globalSpsMultiplier = 1.0;
let buildingCostReduction = 0; 
let klickBoostPerPrestigePoint = 0;
let autoClickerPrestigeMulti = 1;
let smileyTreePrestigeMulti = 1;
let smileyFactoryPrestigeMulti = 1;
let researchLabPrestigeMulti = 1;
let sammelbuchClickPowerBonus = 0; 

// Forschungseffizienz-Boni
let autoClickerResearchBonus = 0;
let smileyTreeResearchBonus = 0;
let smileyFactoryResearchBonus = 0;
let efficiencyBonus = 0;

//prestige Variablen
let klickPrestigeMultiplier = 1;      // Startwert 1 (für 'global_multi')
let klickBoostPerPPValue = 0;         // Startwert 0 (für 'klick_boost_per_pp')

// KONSTANTEN & ELEMENTE
// Die globalen DOM-Variablen für Forschung wurden entfernt (KORREKTUR für ReferenceError).

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
    updateUpgradesDisplay();
    updatePrestigeButtons();
    updateResearchButtons();
}

//================================================================================================================
// --- 3. HILFSFUNKTIONEN ---
//================================================================================================================

function formatLargeNumber(number) {
    if (number > 999) {
        return Intl.NumberFormat('de-DE', { notation: 'compact', maximumFractionDigits: 2 }).format(number);
    }
    return Math.round(number).toLocaleString('de-DE');
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

function produziereSmileys() {
    // 1. Berechnung der ECHTEN SPS-Werte pro Einheit
    // Formel: Basis-SPS * (1 + Forschungsbonus) * Prestige-Multiplikator * (1 + Globaler Effizienzbonus)
    
    // Auto-Klicker (Basis 1 SPS)
    const autoClickerUnitSPS = 
        1 * (1 + autoClickerResearchBonus) * autoClickerPrestigeMulti * (1 + efficiencyBonus); // Globaler Effizienzbonus als Multiplikator
    
    // Smiley-Baum (Basis 20 SPS)
    const smileyTreeUnitSPS = 
        20 * (1 + smileyTreeResearchBonus) * smileyTreePrestigeMulti * (1 + efficiencyBonus);
    
    // Smiley-Fabrik (Basis 150 SPS)
    const smileyFactoryUnitSPS = 
        150 * (1 + smileyFactoryResearchBonus) * smileyFactoryPrestigeMulti * (1 + efficiencyBonus);


    // 2. Gesamtproduktion (Einheit x Anzahl) - Hier wird nun der korrekte UnitSPS verwendet
    const totalBaseSPS = 
        (auto_klicker_count * autoClickerUnitSPS) + 
        (smileyTreeProduction * smileyTreeUnitSPS) + 
        (smileyFactoryProduction * smileyFactoryUnitSPS);

    // 3. Globale Multiplikatoren anwenden (researchLabPrestigeMulti ist hier der globale Forschungs-Multi)
    const totalBonusSPS = totalBaseSPS * globalerPrestigeMultiplikator * researchLabPrestigeMulti * globalSpsMultiplier; 
    
    // Aktualisierung (geteilt durch 10, da diese Funktion alle 100ms läuft)
    aktuelle_smileys += totalBonusSPS / 10;
    gesammelte_smileys += totalBonusSPS / 10;
    
    // Forschungspunkte
    // HINWEIS: Hier sollte später researchLabPrestigeMulti nicht doppelt gezählt werden, 
    // da es bereits in totalBonusSPS enthalten ist. Wir vereinfachen dies später.
    if (forschungslabor_count > 0) {
        // Basis-Produktion pro Labor (0.005) * Multiplikatoren
        const forschungSPSProEinheit = 0.005 * forschungslabor_fps_multiplier * researchLabPrestigeMulti;

        // Gesamtproduktion pro Sekunde
        const forschungSPS = forschungslabor_count * forschungSPSProEinheit;

        // Erhöhung der Forschungspunkte (durch 10 teilen, da alle 100ms)
        forschungPunkte += forschungSPS / 10;
    }

    // Aktualisiere die Gesamt-SPS-Anzeige im Header
    document.getElementById('smileys_pro_sekunde_anzeige').innerText = formatLargeNumber(totalBonusSPS);
    // Prestige Button Aktivierung
    const prestigeButton = document.getElementById("prestige_button");
    if (prestigeButton) {
        const required_smileys = prestige_kosten;
        if (aktuelle_smileys >= required_smileys) {
            prestigeButton.classList.add("available");
        } else {
            prestigeButton.classList.remove("available");
        }
    }
    
    updatePrestigeButtons(); 
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

function kaufeItem(type, index, amount = 1) {
    let item, currentCount, costFunction;
    let costReductionFactor = 1 - buildingCostReduction; 

    if (type === 'upgrade-grid') {
        item = clickerUpgrades[index];
        const cost = item.price;
        if (aktuelle_smileys >= cost && item.bought === 0) {
            aktuelle_smileys -= cost;
            // Der Multiplikator ist hier nicht definiert. Ich nutze den korrekten Bonus:
            klickUpgradeBonus += item.effect; 
            item.bought = 1;
        } else {
            return;
        }
    } else if (type === 'building-grid') {
        item = buildingsData[index];
        let totalCost = 0;
        let itemsToBuy = 0;

        switch (item.elementId) {
            case "auto_clicker_button_1x":
                currentCount = auto_klicker_count;
                costFunction = (count) => autoClickerBaseCost * Math.pow(autoClickerGrowthRate, count) * costReductionFactor;
                break;
            case "smileyTreeButton1x":
                currentCount = smileyTreeProduction;
                costFunction = (count) => smileyTreeBaseCost * Math.pow(smileyTreeGrowthRate, count) * costReductionFactor;
                break;
            case "smileyFactoryButton1x":
                currentCount = smileyFactoryProduction;
                costFunction = (count) => smileyFactoryBaseCost * Math.pow(smileyFactoryGrowthRate, count) * costReductionFactor;
                break;
            default:
                return;
        }

        for (let i = 0; i < amount; i++) {
            const nextCost = costFunction(currentCount + i);
            if (aktuelle_smileys >= totalCost + nextCost) {
                totalCost += nextCost;
                itemsToBuy++;
            } else {
                break;
            }
        }

        if (itemsToBuy > 0) {
            aktuelle_smileys -= totalCost;
            switch (item.elementId) {
                case "auto_clicker_button_1x":
                    auto_klicker_count += itemsToBuy;
                    break;
                case "smileyTreeButton1x":
                    smileyTreeProduction += itemsToBuy;
                    break;
                case "smileyFactoryButton1x":
                    smileyFactoryProduction += itemsToBuy;
                    break;
            }
        } else {
            return;
        }
    }
    speichereSpiel();
    updateGame();
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


function kaufeForschungsUpgrade() {
    const upgrade = researchUpgrades[researchUpgradeIndex];
    if (!upgrade) {
        alert("Alle Forschungs-Upgrades wurden bereits gekauft!");
        return;
    }
    if (forschungPunkte >= upgrade.cost) {
        forschungPunkte -= upgrade.cost;
        // WICHTIG: window[upgrade.bonusVariable] durch direkte Zuweisung ersetzen,
        // um Abhängigkeit von globalen Variablen zu behalten.
        switch(upgrade.bonusVariable) {
            case 'autoClickerResearchBonus': autoClickerResearchBonus += upgrade.value; break;
            case 'smileyTreeResearchBonus': smileyTreeResearchBonus += upgrade.value; break;
            case 'smileyFactoryResearchBonus': smileyFactoryResearchBonus += upgrade.value; break;
            case 'efficiencyBonus': efficiencyBonus += upgrade.value; break;
        }
        
        researchUpgradeIndex++;
        speichereSpiel();
        updateGame();
    } else {
        alert("Nicht genügend Forschungspunkte!");
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
    const spielstand = {
        aktuelle_smileys: aktuelle_smileys,
        gesammelte_smileys: gesammelte_smileys,
        auto_klicker_count: auto_klicker_count,
        smileyTreeProduction: smileyTreeProduction,
        smileyFactoryProduction: smileyFactoryProduction,
        multiplikator: multiplikator,
        klickUpgradeBonus: klickUpgradeBonus,
        clickerUpgrades: clickerUpgrades,
        forschungPunkte: forschungPunkte,
        researchUpgradeIndex: researchUpgradeIndex,
        gesamteGeklickteSmileys: gesamteGeklickteSmileys,
        gesamtPrestigePunkte: gesamtPrestigePunkte,
        forschungslabor_count: forschungslabor_count,
        forschungslaborGekauft: forschungslaborGekauft,
        prestige_punkte: prestige_punkte,
        prestige_upgrades_gekauft: prestige_upgrades_gekauft, 
    };
    localStorage.setItem('smileyClickerSave', JSON.stringify(spielstand));
    console.log("Spiel gespeichert.");
}

function ladeSpiel() {
    try {
        const gespeicherterStand = JSON.parse(localStorage.getItem('smileyClickerSave'));
        if (gespeicherterStand) {
            aktuelle_smileys = gespeicherterStand.aktuelle_smileys || 0;
            gesammelte_smileys = gespeicherterStand.gesammelte_smileys || 0;
            auto_klicker_count = gespeicherterStand.auto_klicker_count || 0;
            smileyTreeProduction = gespeicherterStand.smileyTreeProduction || 0;
            smileyFactoryProduction = gespeicherterStand.smileyFactoryProduction || 0;
            multiplikator = gespeicherterStand.multiplikator || 1;
            
            // KORREKTUR: klickUpgradeBonus wird beim Laden neu berechnet
            klickUpgradeBonus = 0; 
            if (gespeicherterStand.clickerUpgrades) {
                gespeicherterStand.clickerUpgrades.forEach((savedItem, index) => {
                    if (clickerUpgrades[index]) {
                        clickerUpgrades[index].bought = savedItem.bought;
                        // Füge den Bonus nur hinzu, wenn das Upgrade gekauft wurde
                        if (savedItem.bought) {
                            klickUpgradeBonus += clickerUpgrades[index].effect;
                        }
                    }
                });
            }
            // Ende KORREKTUR
            
            // Forschung laden
            forschungPunkte = gespeicherterStand.forschungPunkte || 0;
            researchUpgradeIndex = gespeicherterStand.researchUpgradeIndex || 0;
            forschungslabor_count = gespeicherterStand.forschungslabor_count || 0;
            forschungslaborGekauft = gespeicherterStand.forschungslaborGekauft || false;
            
            // Prestige laden
            gesamteGeklickteSmileys = gespeicherterStand.gesamteGeklickteSmileys || 0;
            gesamtPrestigePunkte = gespeicherterStand.gesamtPrestigePunkte || 0;
            prestige_punkte = gespeicherterStand.prestige_punkte || 0;
            
            // Prestige Upgrades laden
            if (gespeicherterStand.prestige_upgrades_gekauft) {
                prestige_upgrades_gekauft = gespeicherterStand.prestige_upgrades_gekauft; 
            }
            
            console.log("Spielstand geladen.");
        }
    } catch (e) {
        console.error("Fehler beim Laden des Spielstands:", e);
        // Altes, defektes Save löschen, um Neustart zu erzwingen
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
    const totalSPS = (auto_klicker_count * 1 * autoClickerPrestigeMulti + 
                      smileyTreeProduction * 20 * smileyTreePrestigeMulti + 
                      smileyFactoryProduction * 150 * smileyFactoryPrestigeMulti) * globalerPrestigeMultiplikator * researchLabPrestigeMulti * globalSpsMultiplier;
    
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

function updateButtons() {
    // KORREKTUR: Suche nach .btn-buy, da dies das korrekte Selektor ist.
    const allBuyButtons = document.querySelectorAll('.btn-buy'); 
    const costReductionFactor = 1 - buildingCostReduction;

    allBuyButtons.forEach(button => {
        const type = button.dataset.type;
        const index = parseInt(button.dataset.index);
        const amount = parseInt(button.dataset.buyAmount, 10) || 1;
        let cost;

        if (type === 'building-grid') {
            const item = buildingsData[index];
            let currentCount;
            let costFunction;
            
            switch (item.elementId) {
                case "auto_clicker_button_1x":
                    currentCount = auto_klicker_count;
                    costFunction = (count) => autoClickerBaseCost * Math.pow(autoClickerGrowthRate, count) * costReductionFactor;
                    break;
                case "smileyTreeButton1x":
                    currentCount = smileyTreeProduction;
                    costFunction = (count) => smileyTreeBaseCost * Math.pow(smileyTreeGrowthRate, count) * costReductionFactor;
                    break;
                case "smileyFactoryButton1x":
                    currentCount = smileyFactoryProduction;
                    costFunction = (count) => smileyFactoryBaseCost * Math.pow(smileyFactoryGrowthRate, count) * costReductionFactor;
                    break;
                default:
                    cost = Infinity;
            }

            let totalCost = 0;
            for (let i = 0; i < amount; i++) {
                totalCost += costFunction(currentCount + i);
            }
            cost = totalCost;

            button.innerText = `${amount}x (${formatLargeNumber(cost)})`;

        } else if (type === 'upgrade-grid') {
            const item = clickerUpgrades[index];
            cost = item.price;
            if (item.bought) {
                 button.disabled = true;
                 button.innerText = 'Gekauft';
                 button.classList.add('disabled');
                 return;
            }
            // Der Button-Text wurde bereits in createUpgradeElements gesetzt
            // Hier muss nur die Kosten-Prüfung durchgeführt werden.
        }
        
        // Allgemeine Verfügbarkeitsprüfung
        if (aktuelle_smileys >= cost) {
            button.disabled = false;
            button.classList.remove('disabled');
        } else {
            button.disabled = true;
            button.classList.add('disabled');
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
    }
}
    
function updateUpgradesDisplay() {
    // 1. Gebäude-Karten (building-grid) aktualisieren
    buildingsData.forEach((item, index) => {
        const upgradeElement = document.querySelector(`.building-grid .upgrade-item[data-index="${index}"]`);
        if (!upgradeElement) return; // Karte existiert nicht

        let ownedCount = 0;
        let baseSPS = 0; // Basiswert für die SPS-Berechnung
        let prestigeMulti = 1; // Individueller Prestige-Multi
        let researchBonus = 0; // Individueller Forschungsbonus
        let costReductionFactor = 1 - buildingCostReduction; 

        // Anzahl, Boni und Basis-SPS abrufen
        switch(item.elementId) {
            case "auto_clicker_button_1x":
                ownedCount = auto_klicker_count; 
                baseSPS = 1; // Basis SPS für Auto-Klicker
                prestigeMulti = autoClickerPrestigeMulti;
                researchBonus = autoClickerResearchBonus;
                break;
            case "smileyTreeButton1x":
                ownedCount = smileyTreeProduction;
                baseSPS = 20; // Basis SPS für Smiley-Baum
                prestigeMulti = smileyTreePrestigeMulti;
                researchBonus = smileyTreeResearchBonus;
                break;
            case "smileyFactoryButton1x":
                ownedCount = smileyFactoryProduction;
                baseSPS = 150; // Basis SPS für Smiley-Fabrik
                prestigeMulti = smileyFactoryPrestigeMulti;
                researchBonus = smileyFactoryResearchBonus;
                break;
        }

        // Berechnung der SPS pro Einheit (inkl. individueller Multiplikatoren)
        const unitSPS = baseSPS * (1 + researchBonus) * prestigeMulti * (1 + efficiencyBonus);
        
        // Gesamt-SPS, die dieser Gebäudetyp generiert (ownedCount * unitSPS)
        const totalBuildingSPS_individual = unitSPS * ownedCount; // Umbenannt zur Klarheit

        // NEU: Globale Multiplikatoren anwenden, damit die Summe mit dem Header übereinstimmt!
        const totalBuildingSPS_final = 
            totalBuildingSPS_individual * globalerPrestigeMultiplikator * researchLabPrestigeMulti * globalSpsMultiplier;

        // 1. UI-Element der Anzahl aktualisieren
        const countP = upgradeElement.querySelector('.building-count');
        if (countP) {
            countP.innerText = `Anzahl: ${formatLargeNumber(ownedCount)}`;
        }
        
        // 2. UI-Element der Produktion aktualisieren (zeigt jetzt den synchronisierten Wert!)
        const productionP = upgradeElement.querySelector('.building-production');
        if (productionP) {
            // Zeigt die ENDGÜLTIGE, globale SPS-Rate
            productionP.innerText = `Produziert: ${formatLargeNumber(totalBuildingSPS_final)} SPS`;
        }
        // Ende der SPS-Anzeige Implementierung

        // 3. Preise in den Buttons aktualisieren (Kosten für 1x, 10x, 100x)
        const buttons = upgradeElement.querySelectorAll('.btn-buy');
        buttons.forEach(button => {
            const amount = parseInt(button.dataset.buyAmount);
            let nextCost = 0;
            let currentBuyCount = ownedCount;
            
            // Gesamtkosten für die Menge berechnen
            for(let i = 0; i < amount; i++) {
                let costFunction;
                // Bestimme die korrekte Kosten-Funktion basierend auf der Building-ID
                switch(item.elementId) {
                    case "auto_clicker_button_1x": costFunction = (count) => autoClickerBaseCost * Math.pow(autoClickerGrowthRate, count) * costReductionFactor; break;
                    case "smileyTreeButton1x": costFunction = (count) => smileyTreeBaseCost * Math.pow(smileyTreeGrowthRate, count) * costReductionFactor; break;
                    case "smileyFactoryButton1x": costFunction = (count) => smileyFactoryBaseCost * Math.pow(smileyFactoryGrowthRate, count) * costReductionFactor; break;
                }
                nextCost += costFunction(currentBuyCount + i);
            }

            // Text des Buttons aktualisieren
            button.innerText = `${amount}x (${formatLargeNumber(nextCost)})`;
        });
    });

    // 2. Klicker-Upgrades (upgrade-grid) aktualisieren
    clickerUpgrades.forEach((item, index) => {
        const upgradeElement = document.querySelector(`.upgrade-grid .upgrade-item[data-index="${index}"]`);
        if (!upgradeElement) return;

        const button = upgradeElement.querySelector('.btn-buy');
        if (button) {
            const buttonText = item.bought ? 'Gekauft' : `Kaufen (${formatLargeNumber(item.price)})`;
            button.innerText = buttonText;
            button.disabled = item.bought;
        }
        
        const boughtP = upgradeElement.querySelector('.upgrade-count');
        if (boughtP) {
            boughtP.innerText = `Gekauft: ${item.bought}`;
        }
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