document.addEventListener('DOMContentLoaded', () => {

    //================================================================================================================
    // --- 1. GLOBALE VARIABLEN & DATEN ---
    //================================================================================================================

    // SPIEL-DATEN
    let buildingsData = [
        { name: "Auto-Klicker", basePrice: 20, growthRate: 1.1, elementId: "auto_clicker_button_1x" },
        { name: "Smiley-Baum", basePrice: 100, growthRate: 1.15, elementId: "smileyTreeButton1x" },
        { name: "Smiley-Fabrik", basePrice: 1000, growthRate: 1.2, elementId: "smileyFactoryButton1x" },
    ];
    let clickerUpgrades = [
        { name: "Stärkerer Klick", price: 250, effect: 0.1, type: "click", bought: 0 },
        { name: "Doppelklick-Upgrade", price: 500, effect: 0.2, type: "click", bought: 0 },
        { name: "Dreifachklick-Upgrade", price: 1000, effect: 0.3, type: "click", bought: 0 }
    ];
    const researchUpgrades = [
        { cost: 10, description: 'Erhöht die Produktion der Auto-Klicker um 10%', type: 'autoClicker', bonusVariable: 'autoClickerResearchBonus', value: 0.1 },
        { cost: 25, description: 'Erhöht die Produktion der Smiley-Bäume um 10%', type: 'smileyTree', bonusVariable: 'smileyTreeResearchBonus', value: 0.1 },
        { cost: 50, description: 'Erhöht die Produktion der Smiley-Fabriken um 10%', type: 'smileyFactory', bonusVariable: 'smileyFactoryResearchBonus', value: 0.1 },
        { cost: 100, description: 'Deine Auto-Klicker sind 20% effizienter.', type: 'efficiency', bonusVariable: 'efficiencyBonus', value: 0.2 },
        { cost: 200, description: 'Deine Smiley-Bäume sind 20% effizienter.', type: 'efficiency', bonusVariable: 'efficiencyBonus', value: 0.2 },
        { cost: 500, description: 'Deine Smiley-Fabriken sind 20% effizienter.', type: 'efficiency', bonusVariable: 'efficiencyBonus', value: 0.2 }
    ];
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
   const prestigeUpgrades = [
    {
        id: 'globaler_multiplikator_1',
        name: 'Globaler Klick-Multiplikator',
        description: 'Erhöht die Klickkraft und die Produktion aller Gebäude um 25%.',
        cost: 1,
        bonus: 0.25,
        type: 'global_multi',
        dependencies: []
    },
    {
        id: 'auto_klicker_multi',
        name: 'Auto-Klicker-Boost',
        description: 'Die Produktion von Auto-Klickern wird verdoppelt.',
        cost: 5,
        bonus: 1,
        type: 'auto_clicker_multi',
        dependencies: ['globaler_multiplikator_1']
    },
    {
        id: 'forschungs_multi',
        name: 'Forschungs-Boost',
        description: 'Die Produktion des Forschungslabors wird verdoppelt.',
        cost: 10,
        bonus: 1,
        type: 'research_multi',
        dependencies: ['auto_klicker_multi']
    },
    {
    id: 'klick_multiplikator_2',
    name: 'Unendliche Klickkraft',
    description: 'Erhöht deine Klickkraft um 2 pro Prestige-Punkt, den du je gesammelt hast.',
    cost: 5,
    type: 'klick_boost_per_pp',
    dependencies: ['globaler_multiplikator_1']
},
{
    id: 'sps_multiplikator_1',
    name: 'Überlegenheit in der Produktion',
    description: 'Erhöht die Produktion aller Gebäude um 15%.',
    cost: 10,
    bonus: 0.15,
    type: 'global_sps_multi',
    dependencies: ['globaler_multiplikator_1']
},
{
    id: 'kostenreduktion_1',
    name: 'Ökonomische Voraussicht',
    description: 'Reduziert die Kosten aller Gebäude um 5%.',
    cost: 20,
    bonus: 0.05,
    type: 'cost_reduction',
    dependencies: ['sps_multiplikator_1']
},
{
    id: 'forschungslabor_effizienz_2',
    name: 'Meister der Forschung',
    description: 'Verdoppelt die Menge an Forschungspunkten, die du pro Sekunde verdienst.',
    cost: 30,
    bonus: 1,
    type: 'research_multi',
    dependencies: ['forscher_effizienz']
},
{
    id: 'dauerhafter_smiley_baum',
    name: 'Wunderbaum-Anfang',
    description: 'Du startest nach jedem Prestige-Reset mit einem dauerhaften Smiley-Baum.',
    cost: 40,
    bonus: 1,
    type: 'permanent_building',
    dependencies: ['dauerhafter_auto_klicker']
},
{
    id: 'auto_klicker_multiplikator',
    name: 'Auto-Klicker-Hyper-Antrieb',
    description: 'Die Produktion der Auto-Klicker wird um weitere 20% erhöht.',
    cost: 50,
    bonus: 0.20,
    type: 'auto_clicker_multi',
    dependencies: ['sps_multiplikator_1']
},
{
    id: 'smiley_baum_multiplikator',
    name: 'Ur-Bäume',
    description: 'Die Produktion der Smiley-Bäume wird um 25% erhöht.',
    cost: 75,
    bonus: 0.25,
    type: 'smiley_tree_multi',
    dependencies: ['sps_multiplikator_1']
},
{
    id: 'smiley_fabrik_multiplikator',
    name: 'Giganten-Fabriken',
    description: 'Die Produktion der Smiley-Fabriken wird um 30% erhöht.',
    cost: 100,
    bonus: 0.30,
    type: 'smiley_factory_multi',
    dependencies: ['sps_multiplikator_1']
},
{
    id: 'kostenreduktion_2',
    name: 'Eiserne Sparsamkeit',
    description: 'Reduziert die Kosten aller Gebäude um weitere 10%.',
    cost: 150,
    bonus: 0.10,
    type: 'cost_reduction',
    dependencies: ['kostenreduktion_1']
},
{
    id: 'mega_forschung_boost',
    name: 'Uraltes Wissen',
    description: 'Erhöht die Produktionsrate deines Forschungslabors um 50%.',
    cost: 200,
    bonus: 0.50,
    type: 'research_multi',
    dependencies: ['forschungslabor_effizienz_2']
}
    // Weitere Upgrades hier hinzufügen
];

    // SPIEL-ZUSTAND
    let aktuelle_smileys = 0;
    let gesammelte_smileys = 0;
    let smiley_points = 0;
    let multiplikator = 1;
    let auto_klicker_count = 0;
    let smileyTreeProduction = 0;
    let smileyFactoryProduction = 0;
    let forschungslabor_count = 0;
    let forschungslabor_fps_multiplier = 1.0;
    let klickUpgradeBonus = 0;
    let autoClickerResearchBonus = 0;
    let smileyTreeResearchBonus = 0;
    let smileyFactoryResearchBonus = 0;
    let efficiencyBonus = 0;
    let autoClickerSpeedBonus = 1;
    let autoClickerClickBonus = 0;
    let autoClickerProductionBonus = 0;
    let autoClickerCostReduction = 1;
    let autoClickerGrowthRate = 1.1;
    let researchUpgradeIndex = 0;
    let gesamteGeklickteSmileys = 0;
    let gesamteGesammelteSmileys = 0;
    let gesamtPrestigePunkte = 0;
    let gekaufteUpgrades = 0;
    let gekaufteAutoKlicker = 0;
    let gekaufteSmileyBaeume = 0;
    let gekaufteSmileyFabriken = 0;
    let autoClickerUpgradeIndex = 0;
    let forschungPunkte = 0;
  //  let autoClickerCap = 15;
  //  let smileyTreeCap = 1;
  //  let smileyFactoryCap = 1;
    let prestige_punkte = 0;
    let globalSpsMultiplier = 1;
    let buildingCostReduction = 1;
    let klickBoostPerPrestigePoint = 0;
    let permanentSmileyTreeCount = 0;
    let smileyTreePrestigeMulti = 1;
    let smileyFactoryPrestigeMulti = 1;
    console.log("Variablen geladen."); // <- Hier einfügen

    let prestige_upgrades_gekauft ={};
    let globalerMultiplikator = 1.0;
    let forschungslaborGekauft = false;
    let globalerPrestigeMultiplikator = 1;
    let autoClickerPrestigeMulti = 1;
    let researchLabPrestigeMulti = 1;


    // KONSTANTEN & ELEMENTE
    const forschungFortschrittBalken = document.getElementById('forschung_fortschritt');
    const forschungFortschrittText = document.getElementById('fortschritt-text');
    const prestige_kosten = 1000;
    const forschungUpgradeKosten = 1;
    const smileyTreeBaseCost = 150;
    const smileyTreeGrowthRate = 1.2;
    const smileyFactoryBaseCost = 2500;
    const smileyFactoryGrowthRate = 1.25;
    const forschungslaborBaseCost = 5000;
    const forschungslaborGrowthRate = 1.3;
    const autoClickerBaseCost = 20;
   

    //================================================================================================================
    // --- 2. HILFSFUNKTIONEN ---
    //================================================================================================================
    function formatLargeNumber(number) {
        if (number > 999) {
            return Intl.NumberFormat('de-DE', { notation: 'compact', maximumFractionDigits: 2 }).format(number);
        }
        return Math.round(number).toLocaleString('de-DE');
    }
    //================================================================================================================
    // --- 3. KERN-SPIELLOGIK ---
    //================================================================================================================
    function klickeSmiley() {
        const smileyElement = document.getElementById('smiley_button');
        if (smileyElement) {
            smileyElement.classList.add('pop');
            setTimeout(() => {
                smileyElement.classList.remove('pop');
            }, 150);
        }
    const klickwert = (1 + klickUpgradeBonus + sammelbuchClickPowerBonus) * globalerPrestigeMultiplikator + (gesamtPrestigePunkte * klickBoostPerPrestigePoint);

        gesammelte_smileys += klickwert;
        gesamteGeklickteSmileys += klickwert;
        speichereSpiel();
        updateDisplay();
        checkAchievements();
    }
    
   function produziereSmileys() {
    const autoClickerSPS = (auto_klicker_count * 1) * autoClickerPrestigeMulti;
    const smileyTreeSPS = smileyTreeProduction * 20 * smileyTreePrestigeMulti;
    const smileyFactorySPS = smileyFactoryProduction * 150 * smileyFactoryPrestigeMulti;
    const forschungslaborSPS = forschungslabor_count * 0.005;

    const totalBaseSPS = autoClickerSPS + smileyTreeSPS + smileyFactorySPS;
    const totalBonusSPS = totalBaseSPS * globalerPrestigeMultiplikator * researchLabPrestigeMulti * globalSpsMultiplier;

    aktuelle_smileys += totalBonusSPS / 10;
    gesammelte_smileys += totalBonusSPS / 10;

    if (forschungslabor_count > 0) {
        forschungspunkte += forschungslabor_count * 0.005 * forschungslabor_fps_multiplier;
    }

    const prestigeButton = document.getElementById("prestige_button");
    if (prestigeButton) {
        if (aktuelle_smileys >= prestige_kosten) {
            prestigeButton.classList.add("available");
        } else {
            prestigeButton.classList.remove("available");
        }
    }
}
    console.log("Prestige-Funktion gefunden."); 
    function prestige() {
    const required_smileys = 100000; // Beispielwert
    if (aktuelle_smileys < required_smileys) {
        alert("Du hast noch nicht genug Smileys für das Prestige-Upgrade!");
        return;
    }

    // Berechne die Anzahl der Prestige-Punkte
    // Eine einfache Formel wäre z.B. 1 Prestige-Punkt pro 1.000.000 gesammelter Smileys
    const earned_prestige = Math.floor(gesammelte_smileys / required_smileys);
    
    // Bestätigung vom Spieler einholen
    if (!confirm(`Möchtest du wirklich prestige? Du erhältst ${earned_prestige} Prestige-Punkte.`)) {
        return;
    }
    
    // Setze das Spiel zurück
    aktuelle_smileys = 0;
    gesammelte_smileys = 0;
    multiplikator = 1;
    auto_klicker_count = 0;
    smileyTreeProduction = 0;
    smileyFactoryProduction = 0;
    forschungslabor_count = 0;
    
    // Füge die verdienten Punkte hinzu
    prestige_punkte += earned_prestige;
    gesamtPrestigePunkte += earned_prestige;
    
    // Speichere den Spielstand und aktualisiere die Anzeige
    speichereSpiel();
    updateGame();
    alert(`Du hast ${earned_prestige} Prestige-Punkte erhalten!`);
}
    function createPrestigeUpgrades() {
    const grid = document.getElementById('prestige_upgrades_grid');
    if (!grid) return; // Stelle sicher, dass das Element existiert

    grid.innerHTML = ''; // Leere den Container
    prestigeUpgrades.forEach(upgrade => {
        // Erstelle den Container für das Upgrade
        const upgradeDiv = document.createElement('div');
        upgradeDiv.classList.add('prestige-upgrade');
        upgradeDiv.dataset.id = upgrade.id;

        // Finde den Zustand des Upgrades (gekauft oder nicht)
        const isBought = prestige_upgrades_gekauft[upgrade.id];
        let className = isBought ? 'bought' : 'available';

        // Überprüfe die Abhängigkeiten
        const allDependenciesMet = upgrade.dependencies.every(depId => prestige_upgrades_gekauft[depId]);
        if (!allDependenciesMet && !isBought) {
            className = 'locked';
        }

        upgradeDiv.classList.add(className);

        // Erstelle den Button
        const button = document.createElement('button');
        button.innerText = `${upgrade.name} - ${upgrade.cost} PP`;
        button.disabled = !allDependenciesMet || isBought;
        
        // Füge die Beschreibung hinzu
        const description = document.createElement('p');
        description.innerText = upgrade.description;

        // Füge alles zum Container hinzu
        upgradeDiv.appendChild(button);
        upgradeDiv.appendChild(description);
        grid.appendChild(upgradeDiv);
    });
}

    // Neue Funktion, um nur den Zustand der Prestige-Buttons zu aktualisieren
function updatePrestigeButtons() {
    prestigeUpgrades.forEach(upgrade => {
        const upgradeDiv = document.querySelector(`.prestige-upgrade[data-id="${upgrade.id}"]`);
        if (!upgradeDiv) return;

        const isBought = prestige_upgrades_gekauft[upgrade.id];
        const allDependenciesMet = upgrade.dependencies.every(depId => prestige_upgrades_gekauft[depId]);
        const isAvailable = !isBought && allDependenciesMet && prestige_punkte >= upgrade.cost;

        // Aktualisiere die Klassen
        upgradeDiv.classList.toggle('bought', isBought);
        upgradeDiv.classList.toggle('available', isAvailable);
        upgradeDiv.classList.toggle('locked', !isBought && !isAvailable);

        // Aktualisiere den Button-Status
        const button = upgradeDiv.querySelector('button');
        if (button) {
            button.disabled = !isAvailable;
        }
    });
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
        case 'klick_boost_per_pp': // Neu
            klickBoostPerPrestigePoint += upgrade.bonus;
            break;
        case 'global_sps_multi': // Neu
            globalSpsMultiplier += upgrade.bonus;
            break;
        case 'cost_reduction': // Neu
            buildingCostReduction -= upgrade.bonus;
            break;
        case 'permanent_building': // Neu
            permanentSmileyTreeCount += upgrade.bonus;
            break;
        case 'smiley_tree_multi': // Neu
            smileyTreePrestigeMulti += upgrade.bonus;
            break;
        case 'smiley_factory_multi': // Neu
            smileyFactoryPrestigeMulti += upgrade.bonus;
            break;
    }
}
    
function kaufeItem(type, index, amount = 1) {
    let item, itemPrice, currentCount, costFunction, growthRate;

    if (type === 'upgrade-grid') {
        item = clickerUpgrades[index];
        const cost = item.price;
        if (aktuelle_smileys >= cost && item.bought === 0) {
            aktuelle_smileys -= cost;
            multiplikator += item.effect;
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
                costFunction = (count) => autoClickerBaseCost * Math.pow(autoClickerGrowthRate, count);
                break;
            case "smileyTreeButton1x":
                currentCount = smileyTreeProduction;
                costFunction = (count) => smileyTreeBaseCost * Math.pow(smileyTreeGrowthRate, count);
                break;
            case "smileyFactoryButton1x":
                currentCount = smileyFactoryProduction;
                costFunction = (count) => smileyFactoryBaseCost * Math.pow(smileyFactoryGrowthRate, count);
                break;
            default:
                return;
        }

        // Berechne die Gesamtkosten für die gewünschte Menge
        for (let i = 0; i < amount; i++) {
            if (aktuelle_smileys >= totalCost + costFunction(currentCount + i)) {
                totalCost += costFunction(currentCount + i);
                itemsToBuy++;
            } else {
                break; // Stoppe, wenn nicht genug Geld für das nächste Item da ist
            }
        }

        // Kaufe die Items, wenn das Geld reicht
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
}
    
    function kaufeForschungsUpgrade() {
        const upgrade = researchUpgrades[researchUpgradeIndex];
        if (!upgrade) {
            alert("Alle Forschungs-Upgrades wurden bereits gekauft!");
            return;
        }
        if (forschungspunkte >= upgrade.cost) {
            forschungspunkte -= upgrade.cost;
            if (upgrade.bonusVariable) {
                window[upgrade.bonusVariable] += upgrade.value;
            }
            researchUpgradeIndex++;
            speichereSpiel();
            updateDisplay();
            updateUpgradesDisplay();
        } else {
            alert("Nicht genügend forschungspunkte!");
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
        forschungslaborGekauft = true; // Setze den Status auf "gekauft"

        const forschungslaborButton = document.getElementById('forschungslaborButton');
        if (forschungslaborButton) {
            forschungslaborButton.disabled = true;
            forschungslaborButton.innerText = 'Gekauft'; // Ändere den Text
            forschungslaborButton.classList.add('bought'); // Füge eine CSS-Klasse hinzu, falls vorhanden
        }

        speichereSpiel();
        updateGame();
    } else {
        alert("Nicht genügend Smileys!");
    }
}
    
   function kaufePrestigeUpgrade(upgradeId) {
    const upgrade = prestigeUpgrades.find(u => u.id === upgradeId);
    if (!upgrade) {
        console.error("Upgrade nicht gefunden:", upgradeId);
        return;
    }

    if (prestige_upgrades_gekauft[upgrade.id]) {
        alert("Dieses Upgrade hast du bereits gekauft!");
        return;
    }

    if (prestige_punkte >= upgrade.cost) {
        prestige_punkte -= upgrade.cost;
        prestige_upgrades_gekauft[upgrade.id] = true;
        
        // Bonus anwenden
        applyPrestigeBonus(upgrade);

        // UI und Spiel speichern
        speichereSpiel();
        updateGame();
        
        alert(`Upgrade "${upgrade.name}" gekauft!`);
    } else {
        alert("Nicht genügend Prestige-Punkte!");
    }
}

    //================================================================================================================
    // --- 4. UI-AKTUALISIERUNGSFUNKTIONEN ---
    //================================================================================================================
    // Diese Funktion erstellt die HTML-Elemente für Upgrades und Gebäude
function createUpgradeElements(items, containerClass) {
    const container = document.querySelector(`.${containerClass}`);
    if (!container) return;
    container.innerHTML = '';
    items.forEach((item, index) => {
        const upgradeElement = document.createElement('div');
        upgradeElement.classList.add('upgrade-item');
        
        let ownedCount = 0;
        let itemPrice; 

        if (containerClass === 'building-grid') {
            switch(item.elementId) {
                case "auto_clicker_button_1x":
                    ownedCount = auto_klicker_count;
                    itemPrice = autoClickerBaseCost * Math.pow(autoClickerGrowthRate, auto_klicker_count);
                    break;
                case "smileyTreeButton1x":
                    ownedCount = smileyTreeProduction;
                    itemPrice = smileyTreeBaseCost * Math.pow(smileyTreeGrowthRate, smileyTreeProduction);
                    break;
                case "smileyFactoryButton1x":
                    ownedCount = smileyFactoryProduction;
                    itemPrice = smileyFactoryBaseCost * Math.pow(smileyFactoryGrowthRate, smileyFactoryProduction);
                    break;
            }
        } else {
            // Für Upgrades, die nur einmal gekauft werden
            itemPrice = item.price;
        }

        let innerHTML = '';
        if (containerClass === 'building-grid') {
            innerHTML = `
                <h3>${item.name} (${ownedCount})</h3>
                <div class="purchase-buttons">
                    <button class="upgrade-button" data-type="${containerClass}" data-index="${index}" data-buy-amount="1">1x</button>
                    <button class="upgrade-button" data-type="${containerClass}" data-index="${index}" data-buy-amount="10">10x</button>
                    <button class="upgrade-button" data-type="${containerClass}" data-index="${index}" data-buy-amount="100">100x</button>
                </div>
            `;
        } else {
            // Für Upgrades (die nur einmal gekauft werden)
            let buttonText = item.bought ? 'Gekauft' : `Kaufen (${formatLargeNumber(itemPrice)})`;
            let buttonDisabled = item.bought ? 'disabled' : '';
            innerHTML = `
                <h3>${item.name}</h3>
                <p>Kosten: ${formatLargeNumber(itemPrice)} Smileys</p>
                <p>${item.description || ''}</p>
                <button class="upgrade-button" data-type="${containerClass}" data-index="${index}" ${buttonDisabled}>
                    ${buttonText}
                </button>
            `;
        }

        upgradeElement.innerHTML = innerHTML;
        container.appendChild(upgradeElement);
    });
}

    function updateDisplay() {
            console.log("UI wird aktualisiert."); // <- Hier einfügen
        const aktuelleSmileysElement = document.getElementById("aktuelle_smileys");
        if (aktuelleSmileysElement) {
            aktuelleSmileysElement.innerText = formatLargeNumber(aktuelle_smileys);
        }
        const gesammelteSmileysElement = document.getElementById("gesammelte_smileys");
        if (gesammelteSmileysElement) {
            gesammelteSmileysElement.innerText = formatLargeNumber(gesammelte_smileys);
        }
        const smileysPerClickElement = document.getElementById("smileys_pro_klick_anzeige");
        const smileysPerClickValue = multiplikator * (1 + klickUpgradeBonus);
        if (smileysPerClickElement) {
            smileysPerClickElement.innerText = formatLargeNumber(smileysPerClickValue);
        }
        const spsAnzeigeElement = document.getElementById("sps_anzeige");
        const autoClickerSPS = (auto_klicker_count * autoClickerSpeedBonus * (1 + autoClickerResearchBonus)) + autoClickerClickBonus + autoClickerProductionBonus;
        const smileyTreeSPS = smileyTreeProduction * (20 * (1 + smileyTreeResearchBonus));
        const smileyFactorySPS = smileyFactoryProduction * (150 * (1 + smileyFactoryResearchBonus));
        const totalSPS = (autoClickerSPS + smileyTreeSPS + smileyFactorySPS) * (1 + efficiencyBonus) * globalerMultiplikator;
        if (spsAnzeigeElement) {
            spsAnzeigeElement.innerText = formatLargeNumber(totalSPS);
        }
        const smpAnzeigeElement = document.getElementById("smp_anzeige");
        if (smpAnzeigeElement) {
            smpAnzeigeElement.innerText = formatLargeNumber(totalSPS * 60);
        }
        
        const aktuelleSmileysUpgrades = document.getElementById("aktuelle_smileys_upgrades");
        if (aktuelleSmileysUpgrades) {
            aktuelleSmileysUpgrades.innerText = formatLargeNumber(aktuelle_smileys);
        }
        const spsAnzeigeUpgrades = document.getElementById("sps_anzeige_upgrades");
        if (spsAnzeigeUpgrades) {
            spsAnzeigeUpgrades.innerText = formatLargeNumber(totalSPS);
        }
        const smpAnzeigeUpgrades = document.getElementById("smp_anzeige_upgrades");
        if (smpAnzeigeUpgrades) {
            smpAnzeigeUpgrades.innerText = formatLargeNumber(totalSPS * 60);
        }
        const smileyPointsUpgrades = document.getElementById("smiley_points_upgrades");
        if (smileyPointsUpgrades) {
            smileyPointsUpgrades.innerText = formatLargeNumber(smiley_points);
        }

        const forschungspunkteAnzeige = document.getElementById("forschungspunkte");
        if (forschungspunkteAnzeige) {
             forschungspunkteAnzeige.innerText = formatLargeNumber(forschungspunkte);
        }

        const forschungslaborCountAnzeige = document.getElementById("forschungslabor_count_anzeige");
        if (forschungslaborCountAnzeige) {
        forschungslaborCountAnzeige.innerText = forschungslabor_count;
        }
        const prestigePunkteAnzeige = document.getElementById("prestige_punkte_anzeige");
        if (prestigePunkteAnzeige) {
        prestigePunkteAnzeige.innerText = formatLargeNumber(prestige_punkte);
        }

        const prestigeButton = document.getElementById("prestige_button");
        const required_smileys = 1000000;
        const earned_prestige = Math.floor(aktuelle_smileys / required_smileys);

        if (prestigeButton) {
        prestigeButton.innerText = `Prestige (${formatLargeNumber(earned_prestige)} Punkte verdienen)`;
        if (aktuelle_smileys >= required_smileys) {
        prestigeButton.classList.add("available");
        } else {
        prestigeButton.classList.remove("available");
        }
        }

        updateButtons();
        updatePrestigeButtons();
        }

function updateButtons() {
    const allBuyButtons = document.querySelectorAll('.upgrade-button');
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
                    costFunction = (count) => autoClickerBaseCost * Math.pow(autoClickerGrowthRate, count);
                    break;
                case "smileyTreeButton1x":
                    currentCount = smileyTreeProduction;
                    costFunction = (count) => smileyTreeBaseCost * Math.pow(smileyTreeGrowthRate, count);
                    break;
                case "smileyFactoryButton1x":
                    currentCount = smileyFactoryProduction;
                    costFunction = (count) => smileyFactoryBaseCost * Math.pow(smileyFactoryGrowthRate, count);
                    break;
                default:
                    cost = Infinity;
            }

            // Berechne die kumulativen Kosten für die gewünschte Menge
            let totalCost = 0;
            for (let i = 0; i < amount; i++) {
                totalCost += costFunction(currentCount + i);
            }
            cost = totalCost;

            // --- NEUE ZEILE: TEXT AUF BUTTONS AKTUALISIEREN ---
            button.innerText = `${amount}x (${formatLargeNumber(cost)})`;
            // --- ENDE NEUER CODE ---

        } else if (type === 'upgrade-grid') {
            const item = clickerUpgrades[index];
            cost = item.price;
            // --- NEUE ZEILE: TEXT AUF UPGRADE-BUTTONS AKTUALISIEREN ---
            button.innerText = `Kaufen (${formatLargeNumber(cost)})`;
            // --- ENDE NEUER CODE ---
        }

        if (aktuelle_smileys >= cost) {
            button.disabled = false;
            button.classList.remove('disabled');
        } else {
            button.disabled = true;
            button.classList.add('disabled');
        }
    });
}
    
   function updateUpgradesDisplay() {
    const researchUpgradeButton = document.getElementById("forschungUpgradeButton");
    if (researchUpgradeButton) {
        const upgrade = researchUpgrades[researchUpgradeIndex];
        if (upgrade) {
            researchUpgradeButton.innerText = `forschungspunkte-Upgrade kaufen (${upgrade.cost} FP)`;
            researchUpgradeButton.disabled = forschungspunkte < upgrade.cost;
        } else {
            researchUpgradeButton.innerText = "Alle Upgrades gekauft";
            researchUpgradeButton.disabled = true;
        }
    }
}

  //  function checkAchievements() {
     //   if (gesammelte_smileys >= 1000) {
       //     if (autoClickerCap < 25) {
         //       autoClickerCap = 25;
           //     console.log("Erfolg freigeschaltet: 1.000 Smileys gesammelt! Auto-Klicker Cap auf 25 erhöht.");
        //    }
      //  }
   // }

    function speichereSpiel() {
        const spielstand = {
            aktuelle_smileys: aktuelle_smileys,
            gesammelte_smileys: gesammelte_smileys,
            auto_klicker_count: auto_klicker_count,
            smileyTreeProduction: smileyTreeProduction,
            smileyFactoryProduction: smileyFactoryProduction,
            multiplikator: multiplikator,
            klickUpgradeBonus: klickUpgradeBonus,
            klickerUpgrades: clickerUpgrades,
            buildingsData: buildingsData,
            forschungspunkte: forschungspunkte,
            researchUpgradeIndex: researchUpgradeIndex,
        //  autoClickerCap: autoClickerCap,
        //  smileyTreeCap: smileyTreeCap,
        //  smileyFactoryCap: smileyFactoryCap,
            gesamteGeklickteSmileys: gesamteGeklickteSmileys,
            gesamteGesammelteSmileys: gesamteGesammelteSmileys,
            gesamtPrestigePunkte: gesamtPrestigePunkte,
            gekaufteUpgrades: gekaufteUpgrades,
            gekaufteAutoKlicker: gekaufteAutoKlicker,
            gekaufteSmileyBaeume: gekaufteSmileyBaeume,
            gekaufteSmileyFabriken: gekaufteSmileyFabriken,
            prestige_punkte: prestige_punkte,
            globalerMultiplikator: globalerMultiplikator,
            forschungslabor_count: forschungslabor_count,
            prestigeUpgradeStates: prestigeUpgradeStates,
            forschungslaborGekauft: forschungslaborGekauft,
            prestige_punkte: prestige_punkte,
            gesamt_prestige_punkte: gesamtPrestigePunkte,
            prestige_upgrades_gekauft: prestige_upgrades_gekauft,
        };
        localStorage.setItem('smileyClickerSave', JSON.stringify(spielstand));
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
            klickUpgradeBonus = gespeicherterStand.klickUpgradeBonus || 0;
            clickerUpgrades = gespeicherterStand.klickerUpgrades || clickerUpgrades;
            buildingsData = gespeicherterStand.buildingsData || buildingsData;
            forschungspunkte = gespeicherterStand.forschungspunkte || 0;
            researchUpgradeIndex = gespeicherterStand.researchUpgradeIndex || 0;
        //  autoClickerCap = gespeicherterStand.autoClickerCap || 15;
        //  smileyTreeCap = gespeicherterStand.smileyTreeCap || 1;
        //  smileyFactoryCap = gespeicherterStand.smileyFactoryCap || 1;
            gesamteGeklickteSmileys = gespeicherterStand.gesamteGeklickteSmileys || 0;
            gesamteGesammelteSmileys = gespeicherterStand.gesamteGesammelteSmileys || 0;
            gesamtPrestigePunkte = gespeicherterStand.gesamtPrestigePunkte || 0;
            gekaufteUpgrades = gespeicherterStand.gekaufteUpgrades || 0;
            gekaufteAutoKlicker = gespeicherterStand.gekaufteAutoKlicker || 0;
            gekaufteSmileyBaeume = gespeicherterStand.gekaufteSmileyBaeume || 0;
            gekaufteSmileyFabriken = gespeicherterStand.gekaufteSmileyFabriken || 0;
            prestige_punkte = gespeicherterStand.prestige_punkte || 0;
            globalerMultiplikator = gespeicherterStand.globalerMultiplikator || 1.0;
            forschungslabor_count = gespeicherterStand.forschungslabor_count || 0;
            prestigeUpgradeStates = gespeicherterStand.prestigeUpgradeStates || {};
            prestige_punkte = gespeicherterStand.prestige_punkte || 0;
            gesamt_prestige_punkte = gespeicherterStand.gesamt_prestige_punkte || 0;
            prestige_upgrades_gekauft = gespeicherterStand.prestige_upgrades_gekauft || {};
            globalSpsMultiplier = gespeicherterStand.globalSpsMultiplier || 1;
            buildingCostReduction = gespeicherterStand.buildingCostReduction || 1;
            klickBoostPerPrestigePoint = gespeicherterStand.klickBoostPerPrestigePoint || 0;
            permanentSmileyTreeCount = gespeicherterStand.permanentSmileyTreeCount || 0;
            smileyTreePrestigeMulti = gespeicherterStand.smileyTreePrestigeMulti || 1;
            smileyFactoryPrestigeMulti = gespeicherterStand.smileyFactoryPrestigeMulti || 1;

            // --- KORRIGIERTER CODE FÜR DAS FORSCHUNGSLABOR ---
            forschungslaborGekauft = gespeicherterStand.forschungslaborGekauft || false;
            
            if (forschungslaborGekauft) {
                const forschungslaborButton = document.getElementById('forschungslaborButton');
                if (forschungslaborButton) {
                    forschungslaborButton.disabled = true;
                    forschungslaborButton.innerText = 'Gekauft';
                    forschungslaborButton.classList.add('bought');
                }
            }
        }
    } catch (e) {
        console.error("Laden fehlgeschlagen, Spielstand wird zurückgesetzt:", e);
        localStorage.clear();
    }
    createPrestigeUpgrades();
}

 function updateGame() {
    produziereSmileys(); // WICHTIG: Füge diese Zeile hier hinzu!
    speichereSpiel();
    updateDisplay();
    
    // --- SMILEY-PUNKTE AKTUALISIEREN (falls vorhanden) ---
    const smileyPointsElement = document.getElementById("smiley_points");
    if (smileyPointsElement) {
        smileyPointsElement.textContent = smiley_points;
    }
    const researchProduction = forschungslabor_count * researchLabPrestigeMulti;


    // --- FORSCHUNGSLABOR-FORTSCHRITT AKTUALISIEREN ---
    const nextResearchUpgrade = researchUpgrades[researchUpgradeIndex];

    if (forschungFortschrittBalken && forschungFortschrittText) {
        if (nextResearchUpgrade) {
            // Zeigt den Fortschritt zur nächsten Forschungsstufe an
            const forschungFortschritt = (forschungspunkte / nextResearchUpgrade.cost) * 100;
            forschungFortschrittBalken.style.width = Math.min(forschungFortschritt, 100) + '%';
            forschungFortschrittText.innerText = Math.min(Math.floor(forschungFortschritt), 100) + '%';
        } else {
            // Zeigt "Max" an, wenn alle Upgrades gekauft sind
            forschungFortschrittBalken.style.width = '100%';
            forschungFortschrittText.innerText = 'Max';
        }
    }
}

    //================================================================================================================
    // --- 5. EVENT-LISTENER & INITIALISIERUNG ---
    //================================================================================================================
    ladeSpiel();
    createUpgradeElements(clickerUpgrades, 'upgrade-grid');
    createUpgradeElements(buildingsData, 'building-grid');
    createPrestigeUpgrades();

    //Spiel-Loop, der die Funktionen alle 100ms aufruft
    setInterval(()=>{
        produziereSmileys();
        updateDisplay();
    },100);


    const smileyButton = document.getElementById('smiley_button');
    if (smileyButton) {
        smileyButton.addEventListener('click', klickeSmiley);
    }

    const upgradeGrid = document.getElementById('upgrade-grid');
    if (upgradeGrid) {
        upgradeGrid.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                kaufeItem(e.target.dataset.type, e.target.dataset.index);
            }
        });
    }

const buildingGrid = document.getElementById('building-grid');
if (buildingGrid) {
    buildingGrid.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const buyAmount = parseInt(e.target.dataset.buyAmount, 10);
            kaufeItem(e.target.dataset.type, e.target.dataset.index, buyAmount);
        }
    });


    const researchUpgradeButton = document.getElementById("forschungUpgradeButton");
    if (researchUpgradeButton) {
        researchUpgradeButton.addEventListener('click', kaufeForschungsUpgrade);
    }

    const forschungslaborButton = document.getElementById('forschungslaborButton');
    if (forschungslaborButton) {
    forschungslaborButton.addEventListener('click', kaufeForschungslabor);
    }

    const prestigeButton = document.getElementById("prestige_button");
    if (prestigeButton) {
    prestigeButton.addEventListener('click', prestige);
    }
    const prestigeUpgradesGrid = document.getElementById('prestige_upgrades_grid');
    if (prestigeUpgradesGrid) {
    prestigeUpgradesGrid.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button) {
            const upgradeDiv = button.closest('.prestige-upgrade');
            if (upgradeDiv) {
                const upgradeId = upgradeDiv.dataset.id;
                kaufePrestigeUpgrade(upgradeId);
            }
        }
    });
 }
     document.querySelector('.building-grid').addEventListener('click', (e) => {
        const button = e.target.closest('.upgrade-button');
        if (!button) return;
        const type = button.dataset.type;
        const index = parseInt(button.dataset.index);
        const amount = parseInt(button.dataset.buyAmount);
        createUpgradeElements(clickerUpgrades, 'upgrade-grid');
        createUpgradeElements(buildingsData, 'building-grid');
        kaufeItem(type, index, amount);
        speichereSpiel()
        updateDisplay();
    })

    document.getElementById('prestige_button').addEventListener('click', prestige);

}});