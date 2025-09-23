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
            id: 'auto_clicker_speed',
            name: 'Auto-Klicker Beschleunigung',
            description: 'Erhöht die Geschwindigkeit aller Auto-Klicker dauerhaft um 25%.',
            cost: 10,
            effect: () => { autoClickerSpeedBonus *= 1.25; },
            prerequisites: [],
            x: 400 - 250,
            y: 300 - 150
        },
        {
            id: 'click_power_boost',
            name: 'Klickkraft Multiplikator',
            description: 'Verdoppelt deine Klickkraft dauerhaft.',
            cost: 25,
            effect: () => { multiplikator *= 2; },
            prerequisites: ['auto_clicker_speed'],
            x: 400 + 250,
            y: 300 - 150
        },
        {
            id: 'global_production_boost',
            name: 'Globale Produktionssteigerung',
            description: 'Erhöht die Produktion aller Gebäude (Klicker, Bäume, Fabriken) dauerhaft um 10%.',
            cost: 50,
            effect: () => { globalerMultiplikator *= 1.1; },
            prerequisites: ['click_power_boost'],
            x: 400 - 250,
            y: 300 + 150
        },
        {
            id: 'research_point_gain',
            name: 'forschungspunkte Bonus',
            description: 'Erhöht die Rate, mit der forschungspunkte generiert werden, dauerhaft um 50%.',
            cost: 100,
            effect: () => { forschungslabor_fps_multiplier *= 1.5; },
            prerequisites: ['global_production_boost'],
            x: 400 + 250,
            y: 300 + 150
        }
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
    let prestigeUpgradeStates = {};
    let autoClickerUpgradeIndex = 0;
    let forschungPunkte = 0;
    let autoClickerCap = 15;
    let smileyTreeCap = 1;
    let smileyFactoryCap = 1;
    let prestige_punkte = 0;
    let globalerMultiplikator = 1.0;
    let forschungslaborGekauft = false;

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
        const klickwert = multiplikator * (1 + klickUpgradeBonus);
        aktuelle_smileys += klickwert;
        gesammelte_smileys += klickwert;
        gesamteGeklickteSmileys += klickwert;
        speichereSpiel();
        updateDisplay();
        checkAchievements();
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

    const prestigeButton = document.getElementById("prestige_button");
    if (prestigeButton) {
        if (aktuelle_smileys >= prestige_kosten) {
            prestigeButton.classList.add("available");
        } else {
            prestigeButton.classList.remove("available");
        }
    }
}
    
    function kaufeItem(type, index) {
        let item, cost;
        if (type === 'upgrade-grid') {
            item = clickerUpgrades[index];
            cost = item.price;
            if (aktuelle_smileys >= cost && item.bought === 0) {
                aktuelle_smileys -= cost;
                multiplikator += item.effect;
                item.bought = 1;
            } else {
                return;
            }
        } else if (type === 'building-grid') {
            item = buildingsData[index];
            switch (item.elementId) {
                case "auto_clicker_button_1x":
                    if (auto_klicker_count >= autoClickerCap) {
                        alert("Du hast das Maximum an Auto-Klickern erreicht!");
                        return;
                    }
                    cost = autoClickerBaseCost * Math.pow(autoClickerGrowthRate, auto_klicker_count);
                    if (aktuelle_smileys >= cost) {
                        aktuelle_smileys -= cost;
                        auto_klicker_count++;
                    } else {
                        return;
                    }
                    break;
                case "smileyTreeButton1x":
                    if (smileyTreeProduction >= smileyTreeCap) {
                        alert("Du hast das Maximum an Smiley-Bäumen erreicht!");
                        return;
                    }
                    cost = smileyTreeBaseCost * Math.pow(smileyTreeGrowthRate, smileyTreeProduction);
                    if (aktuelle_smileys >= cost) {
                        aktuelle_smileys -= cost;
                        smileyTreeProduction++;
                    } else {
                        return;
                    }
                    break;
                case "smileyFactoryButton1x":
                    if (smileyFactoryProduction >= smileyFactoryCap) {
                        alert("Du hast das Maximum an Smiley-Fabriken erreicht!");
                        return;
                    }
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
        createUpgradeElements(clickerUpgrades, 'upgrade-grid');
        createUpgradeElements(buildingsData, 'building-grid');
        updateDisplay();
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

        if (!upgrade || prestigeUpgradeStates[upgradeId]) {
            return;
        }

        const prerequisitesMet = upgrade.prerequisites.every(prereqId => prestigeUpgradeStates[prereqId]);
        if (!prerequisitesMet) {
            alert("Du musst zuerst die vorhergehenden Upgrades kaufen!");
            return;
        }

        if (prestige_punkte >= upgrade.cost) {
            prestige_punkte -= upgrade.cost;
            upgrade.effect();
            prestigeUpgradeStates[upgradeId] = true;
            speichereSpiel();
            updatePrestigeShopDisplay();
            updateGame();
            alert(`Prestige-Upgrade "${upgrade.name}" erfolgreich gekauft!`);
        } else {
            alert(`Nicht genügend Prestige-Punkte! Benötigt: ${upgrade.cost}`);
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
        
        let buttonText = item.name;
        let buttonClass = '';
        let buttonDisabled = false;
        
        let ownedCount = 0;
        let itemPrice; // Deklariere itemPrice hier

        if (containerClass === 'building-grid') {
            switch(item.elementId) {
                case "auto_clicker_button_1x":
                    ownedCount = auto_klicker_count;
                    // >>> DIESE ZEILE WIRD HINZUGEFÜGT ODER KORRIGIERT
                    itemPrice = autoClickerBaseCost * Math.pow(autoClickerGrowthRate, auto_klicker_count);
                    break;
                case "smileyTreeButton1x":
                    ownedCount = smileyTreeProduction;
                    // >>> DIESE ZEILE WIRD HINZUGEFÜGT ODER KORRIGIERT
                    itemPrice = smileyTreeBaseCost * Math.pow(smileyTreeGrowthRate, smileyTreeProduction);
                    break;
                case "smileyFactoryButton1x":
                    ownedCount = smileyFactoryProduction;
                    // >>> DIESE ZEILE WIRD HINZUGEFÜGT ODER KORRIGIERT
                    itemPrice = smileyFactoryBaseCost * Math.pow(smileyFactoryGrowthRate, smileyFactoryProduction);
                    break;
            }
            buttonText = `${item.name} (${ownedCount})`;
        } else {
            itemPrice = item.price;
        }

        if (item.bought) {
            buttonText = 'Gekauft';
            buttonClass = 'bought-button';
            buttonDisabled = true;
        }
        
        let effectText = '';
        if (item.type === 'click') {
            effectText = `Effekt: Klickkraft +${item.effect} Smiley pro Klick`;
        } else if (item.production) {
            effectText = `Effekt: ${item.production} Smileys pro Sekunde`;
        } else if (containerClass === 'building-grid') {
            effectText = `Effekt: +1 Smiley pro Sekunde`; 
            if (item.name === "Smiley-Baum") {
                 effectText = `Effekt: +20 Smileys pro Sekunde`;
            } else if (item.name === "Smiley-Fabrik") {
                 effectText = `Effekt: +150 Smileys pro Sekunde`;
            }
        }

        upgradeElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>Kosten: ${formatLargeNumber(itemPrice)} Smileys</p>
            <button class="upgrade-button ${buttonClass}"
                    data-type="${containerClass}"
                    data-index="${index}"
                    data-cost="${itemPrice}"
                    ${buttonDisabled ? 'disabled' : ''}>
                ${buttonText}
            </button>
        `;
        container.appendChild(upgradeElement);
    });
}

    function updateDisplay() {
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

        updateButtons();
        }

    function updateButtons() {
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

    function updatePrestigeShopDisplay() {
        const prestigePointsElement = document.getElementById("current_prestige_points");
        if (prestigePointsElement) {
            prestigePointsElement.innerText = prestige_punkte;
        }
        const grid = document.getElementById("prestige_upgrades_grid");
        const svg = document.getElementById("prestige-lines-svg");

        if (!grid || !svg) return;

        grid.innerHTML = '';
        svg.innerHTML = '';
        
        const center_x = 400;
        const center_y = 300;

        const centralSmiley = document.createElement('div');
        centralSmiley.id = "central_smiley";
        centralSmiley.style.left = `${center_x - 60}px`;
        centralSmiley.style.top = `${center_y - 60}px`;
        grid.appendChild(centralSmiley);

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
            lineToCenter.setAttribute("x1", center_x);
            lineToCenter.setAttribute("y1", center_y);
            lineToCenter.setAttribute("x2", upgrade.x + 60);
            lineToCenter.setAttribute("y2", upgrade.y + 60);
            lineToCenter.classList.add('prestige-line');
            if (isBought) {
                lineToCenter.classList.add('bought-line');
            }
            svg.appendChild(lineToCenter);
        });
    }

    function checkAchievements() {
        if (gesammelte_smileys >= 1000) {
            if (autoClickerCap < 25) {
                autoClickerCap = 25;
                console.log("Erfolg freigeschaltet: 1.000 Smileys gesammelt! Auto-Klicker Cap auf 25 erhöht.");
            }
        }
    }

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
            autoClickerCap: autoClickerCap,
            smileyTreeCap: smileyTreeCap,
            smileyFactoryCap: smileyFactoryCap,
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
            autoClickerCap = gespeicherterStand.autoClickerCap || 15;
            smileyTreeCap = gespeicherterStand.smileyTreeCap || 1;
            smileyFactoryCap = gespeicherterStand.smileyFactoryCap || 1;
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
                kaufeItem(e.target.dataset.type, e.target.dataset.index);
            }
        });
    }

    const researchUpgradeButton = document.getElementById("forschungUpgradeButton");
    if (researchUpgradeButton) {
        researchUpgradeButton.addEventListener('click', kaufeForschungsUpgrade);
    }

    const forschungslaborButton = document.getElementById('forschungslaborButton');
    if (forschungslaborButton) {
    forschungslaborButton.addEventListener('click', kaufeForschungslabor);
    }
    
setInterval(updateGame, 100);
    updateDisplay();
    updatePrestigeShopDisplay();
    updateUpgradesDisplay();
});