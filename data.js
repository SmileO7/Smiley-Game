const uniqueBuildingsData = [
    // Index 15
//    { name: "Forschungslabor", basePrice: 5000000, growthRate: 1.3, isSpecial: true, maxCount: 1, baseSPS: 5, prestigeMulti: 1, researchMultiplier: 1},
    // NEU: Index 15
    { id: 'diamond_mine', name: "Diamanten-Mine", basePrice: 100000000, growthRate: 1.5, isSpecial: true, maxCount: 1, baseDPS: 1, diamondMultiplier: 1},
];
const RESEARCH_LAB_INDEX = -1; // Index des Forschungslabors im State-Array
const DIAMOND_MINE_INDEX = 15; // Index der Diamanten-Mine im State-Array
const buildingsData = [
    { name: "Auto-Klicker", basePrice: 20, growthRate: 1.10, baseSPS: 2, prestigeMulti: 1},
    { name: "Smiley-Baum", basePrice: 100, growthRate: 1.15, baseSPS: 20, prestigeMulti: 1},
    { name: "Smiley-Fabrik", basePrice: 1000, growthRate: 1.20, baseSPS: 250, prestigeMulti: 1}, // <--- NEU
    { name: "Smiley-Mine", basePrice: 10000, growthRate: 1.25, baseSPS: 1800, prestigeMulti: 1}, // <--- NEU
    { name: "Smiley-Bohrer", basePrice: 50000, growthRate: 1.30, baseSPS: 5000, prestigeMulti: 1},
    { name: "Smiley-Kernkraftwerk", basePrice: 250000, growthRate: 1.35, baseSPS: 25000, prestigeMulti: 1},
    { name: "Smiley-Galaxie", basePrice: 1250000, growthRate: 1.40, baseSPS: 125000, prestigeMulti: 1},
    { name: "Dimensionsportal", basePrice: 6250000, growthRate: 1.45, baseSPS: 625000, prestigeMulti: 1},
    { name: "Zeitmaschine", basePrice: 31250000, growthRate: 1.50, baseSPS: 5000000, prestigeMulti: 1}, // <--- NEU
    { name: "Meta-Klicker", basePrice: 156250000, growthRate: 1.55, baseSPS: 15625000, prestigeMulti: 1},
    { name: "Quanten-Netzwerk", basePrice: 781250000, growthRate: 1.60, baseSPS: 78125000, prestigeMulti: 1},
    { name: "Endloser Speicher", basePrice: 3906250000, growthRate: 1.65, baseSPS: 390625000, prestigeMulti: 1},
    { name: "Ursprung", basePrice: 19531250000, growthRate: 1.70, baseSPS: 1953125000, prestigeMulti: 1},
    { name: "Kosmische Einheit", basePrice: 97656250000, growthRate: 1.75, baseSPS: 9765625000, prestigeMulti: 1},
    { name: "Absoluter Schöpfer", basePrice: 488281250000, growthRate: 1.80, baseSPS: 70000000000, prestigeMulti: 1}, // <--- NEU
];

// NOTE: Die buildingIndex Werte für Research-Upgrades sind jetzt 0-14 (da das Labor Index 3 wegfiel)
const globalUpgrades = [
    { id: 0, cost: 10, description: 'Auto-Klicker Prod. +10%', type: 'building_mult', buildingIndex: 0, value: 0.1 },
    { id: 1, cost: 50, description: 'Auto-Klicker Prod. +15%', type: 'building_mult', buildingIndex: 0, value: 0.15 },
    { id: 2, cost: 200, description: 'Auto-Klicker Prod. +25%', type: 'building_mult', buildingIndex: 0, value: 0.25 },
    { id: 3, cost: 750, description: 'Auto-Klicker Prod. +50%', type: 'building_mult', buildingIndex: 0, value: 0.5 },
    { id: 4, cost: 50, description: 'Smiley-Baum Prod. +10%', type: 'building_mult', buildingIndex: 1, value: 0.1 },
    { id: 5, cost: 250, description: 'Smiley-Baum Prod. +15%', type: 'building_mult', buildingIndex: 1, value: 0.15 },
    { id: 6, cost: 1000, description: 'Smiley-Baum Prod. +25%', type: 'building_mult', buildingIndex: 1, value: 0.25 },
    { id: 7, cost: 3750, description: 'Smiley-Baum Prod. +50%', type: 'building_mult', buildingIndex: 1, value: 0.5 },
    { id: 8, cost: 250, description: 'Smiley-Fabrik Prod. +10%', type: 'building_mult', buildingIndex: 2, value: 0.1 },
    { id: 9, cost: 1250, description: 'Smiley-Fabrik Prod. +15%', type: 'building_mult', buildingIndex: 2, value: 0.15 },
    { id: 10, cost: 5000, description: 'Smiley-Fabrik Prod. +25%', type: 'building_mult', buildingIndex: 2, value: 0.25 },
    { id: 11, cost: 18750, description: 'Smiley-Fabrik Prod. +50%', type: 'building_mult', buildingIndex: 2, value: 0.5 },
    { id: 12, cost: 1000, description: 'Smiley-Mine Prod. +10%', type: 'building_mult', buildingIndex: 3, value: 0.1 },
    { id: 13, cost: 5000, description: 'Smiley-Mine Prod. +15%', type: 'building_mult', buildingIndex: 3, value: 0.15 },
    { id: 14, cost: 20000, description: 'Smiley-Mine Prod. +25%', type: 'building_mult', buildingIndex: 3, value: 0.25 },
    { id: 15, cost: 70000, description: 'Smiley-Mine Prod. +50%', type: 'building_mult', buildingIndex: 3, value: 0.5 },
    { id: 16, cost: 5000, description: 'Smiley-Bohrer Prod. +10%', type: 'building_mult', buildingIndex: 4, value: 0.1 },
    { id: 17, cost: 25000, description: 'Smiley-Bohrer Prod. +15%', type: 'building_mult', buildingIndex: 4, value: 0.15 },
    { id: 18, cost: 100000, description: 'Smiley-Bohrer Prod. +25%', type: 'building_mult', buildingIndex: 4, value: 0.25 },
    { id: 19, cost: 350000, description: 'Smiley-Bohrer Prod. +50%', type: 'building_mult', buildingIndex: 4, value: 0.5 },
    { id: 20, cost: 25000, description: 'Kernkraftwerk Prod. +10%', type: 'building_mult', buildingIndex: 5, value: 0.1 },
    { id: 21, cost: 125000, description: 'Kernkraftwerk Prod. +15%', type: 'building_mult', buildingIndex: 5, value: 0.15 },
    { id: 22, cost: 500000, description: 'Kernkraftwerk Prod. +25%', type: 'building_mult', buildingIndex: 5, value: 0.25 },
    { id: 23, cost: 1750000, description: 'Kernkraftwerk Prod. +50%', type: 'building_mult', buildingIndex: 5, value: 0.5 },
    { id: 24, cost: 125000, description: 'Galaxie Prod. +10%', type: 'building_mult', buildingIndex: 6, value: 0.1 },
    { id: 25, cost: 625000, description: 'Galaxie Prod. +15%', type: 'building_mult', buildingIndex: 6, value: 0.15 },
    { id: 26, cost: 2500000, description: 'Galaxie Prod. +25%', type: 'building_mult', buildingIndex: 6, value: 0.25 },
    { id: 27, cost: 12500000, description: 'Galaxie Prod. +50%', type: 'building_mult', buildingIndex: 6, value: 0.5 },
    { id: 28, cost: 625000, description: 'Dimensionsportal Prod. +10%', type: 'building_mult', buildingIndex: 7, value: 0.1 },
    { id: 29, cost: 3125000, description: 'Dimensionsportal Prod. +15%', type: 'building_mult', buildingIndex: 7, value: 0.15 },
    { id: 30, cost: 12500000, description: 'Dimensionsportal Prod. +25%', type: 'building_mult', buildingIndex: 7, value: 0.25 },
    { id: 31, cost: 62500000, description: 'Dimensionsportal Prod. +50%', type: 'building_mult', buildingIndex: 7, value: 0.5 },
    { id: 32, cost: 3125000, description: 'Zeitmaschine Prod. +10%', type: 'building_mult', buildingIndex: 8, value: 0.1 },
    { id: 33, cost: 15625000, description: 'Zeitmaschine Prod. +15%', type: 'building_mult', buildingIndex: 8, value: 0.15 },
    { id: 34, cost: 62500000, description: 'Zeitmaschine Prod. +25%', type: 'building_mult', buildingIndex: 8, value: 0.25 },
    { id: 35, cost: 312500000, description: 'Zeitmaschine Prod. +50%', type: 'building_mult', buildingIndex: 8, value: 0.5 },
    { id: 36, cost: 15625000, description: 'Meta-Klicker Prod. +10%', type: 'building_mult', buildingIndex: 9, value: 0.1 },
    { id: 37, cost: 78125000, description: 'Meta-Klicker Prod. +15%', type: 'building_mult', buildingIndex: 9, value: 0.15 },
    { id: 38, cost: 312500000, description: 'Meta-Klicker Prod. +25%', type: 'building_mult', buildingIndex: 9, value: 0.25 },
    { id: 39, cost: 1562500000, description: 'Meta-Klicker Prod. +50%', type: 'building_mult', buildingIndex: 9, value: 0.5 },
    { id: 40, cost: 78125000, description: 'Quanten-Netzwerk Prod. +10%', type: 'building_mult', buildingIndex: 10, value: 0.1 },
    { id: 41, cost: 390625000, description: 'Quanten-Netzwerk Prod. +15%', type: 'building_mult', buildingIndex: 10, value: 0.15 },
    { id: 42, cost: 1562500000, description: 'Quanten-Netzwerk Prod. +25%', type: 'building_mult', buildingIndex: 10, value: 0.25 },
    { id: 43, cost: 7812500000, description: 'Quanten-Netzwerk Prod. +50%', type: 'building_mult', buildingIndex: 10, value: 0.5 },
    { id: 44, cost: 390625000, description: 'Endloser Speicher Prod. +10%', type: 'building_mult', buildingIndex: 11, value: 0.1 },
    { id: 45, cost: 1953125000, description: 'Endloser Speicher Prod. +15%', type: 'building_mult', buildingIndex: 11, value: 0.15 },
    { id: 46, cost: 7812500000, description: 'Endloser Speicher Prod. +25%', type: 'building_mult', buildingIndex: 11, value: 0.25 },
    { id: 47, cost: 39062500000, description: 'Endloser Speicher Prod. +50%', type: 'building_mult', buildingIndex: 11, value: 0.5 },
    { id: 48, cost: 1953125000, description: 'Ursprung Prod. +10%', type: 'building_mult', buildingIndex: 12, value: 0.1 },
    { id: 49, cost: 9765625000, description: 'Ursprung Prod. +15%', type: 'building_mult', buildingIndex: 12, value: 0.15 },
    { id: 50, cost: 39062500000, description: 'Ursprung Prod. +25%', type: 'building_mult', buildingIndex: 12, value: 0.25 },
    { id: 51, cost: 195312500000, description: 'Ursprung Prod. +50%', type: 'building_mult', buildingIndex: 12, value: 0.5 },
    { id: 52, cost: 9765625000, description: 'Kosmische Einheit Prod. +10%', type: 'building_mult', buildingIndex: 13, value: 0.1 },
    { id: 53, cost: 48828125000, description: 'Kosmische Einheit Prod. +15%', type: 'building_mult', buildingIndex: 13, value: 0.15 },
    { id: 54, cost: 195312500000, description: 'Kosmische Einheit Prod. +25%', type: 'building_mult', buildingIndex: 13, value: 0.25 },
    { id: 55, cost: 976562500000, description: 'Kosmische Einheit Prod. +50%', type: 'building_mult', buildingIndex: 13, value: 0.5 },
    { id: 56, cost: 48828125000, description: 'Absoluter Schöpfer Prod. +10%', type: 'building_mult', buildingIndex: 14, value: 0.1 },
    { id: 57, cost: 244140625000, description: 'Absoluter Schöpfer Prod. +15%', type: 'building_mult', buildingIndex: 14, value: 0.15 },
    { id: 58, cost: 976562500000, description: 'Absoluter Schöpfer Prod. +25%', type: 'building_mult', buildingIndex: 14, value: 0.25 },
    { id: 59, cost: 4882812500000, description: 'Absoluter Schöpfer Prod. +50%', type: 'building_mult', buildingIndex: 14, value: 0.5 },
    { id: 60, cost: 100, description: 'Globale Klick-Kraft +5%', type: 'click_mult', value: 0.05 },
    { id: 61, cost: 500, description: 'Globale Klick-Kraft +10%', type: 'click_mult', value: 0.1 },
    { id: 62, cost: 1500, description: 'Globale Klick-Kraft +15%', type: 'click_mult', value: 0.15 },
];

const prestigeUpgrades = [
    { id: 0, cost: 1, description: 'Starte mit einem permanenten +10% SPS-Bonus', type: 'global_sps_mult', value: 0.1, x: 0, y: 0, requirements: [] },
    { id: 1, cost: 2, description: 'Permanenter globaler Klick-Multiplikator +25%', type: 'global_click_mult', value: 0.25, x: -100, y: 100, requirements: [0] },
    { id: 2, cost: 5, description: 'Erhöhe die Effektivität von Prestige-Punkten um 0.1% (additiv)', type: 'prestige_point_eff', value: 0.001, x: 0, y: 200, requirements: [1, 2] },
    { id: 3, cost: 3, description: 'Auto-Klicker & Smiley-Bäume sind 50% günstiger', type: 'building_cost_reduction', buildingIndices: [0, 1], value: 0.5, x: -200, y: 200, requirements: [1] },
    { id: 4, cost: 3, description: 'Schalte einen neuen globalen Bonus frei: +1% SPS pro Prestige-Reset', type: 'prestige_reset_bonus', value: 0.01, x: 200, y: 200, requirements: [2] },
    { id: 5, cost: 10, description: 'Verbessere den globalen Klick-Multiplikator um weitere 50%', type: 'global_click_mult', value: 0.5, x: -100, y: 300, requirements: [3, 4] },
    { id: 6, cost: 10, description: 'Der Bonus pro Prestige-Reset wird verdoppelt', type: 'prestige_reset_bonus', value: 0.01, x: 100, y: 300, requirements: [3, 5] },
    { id: 7, cost: 50, description: 'Schalte das Pet-System frei.', type: 'unlock_pets', value: 0, x: -200, y: 400, requirements: [6] }, // Geändert von 15 auf 50 (für Pets)
    { id: 8, cost: 15, description: 'Schalte die Diamanten-Mine frei.', type: 'unlock_mine', value: 0, x: 200, y: 400, requirements: [7] },
    { id: 9, cost: 50, description: 'Schalte das Gilden-System frei.', type: 'unlock_guilds', value: 0, x: 0, y: 500, requirements: [8, 9] },
];

const petsData = [
    // 1. Pet Dog: KLICK-KRAFT
    { id: 'pet_dog', name: 'Fluffy der Klick-Hund', baseEffect: 0.05, effectType: 'click_mult', description: '+% Klickkraft.', img: 'pet_dog.png.png', interval: 100, levelCost: 10, costGrowth: 1.5, maxLevel: 100 },

    // 2. Pet Cat: SPS-BOOSTER
    { id: 'pet_cat', name: 'Miau der SPS-Booster', baseEffect: 0.10, effectType: 'sps_mult', description: '+% SPS-Rate.', img: 'pet_cat.png.png', interval: 0, levelCost: 20, costGrowth: 1.5, maxLevel: 100 },

    // 3. Pet Owl: KOSTENREDUKTION UPGRADES (ehemals Forschung/Global Upgrades)
    { id: 'pet_owl', name: 'Hoot der Taktiker', baseEffect: 0.05, effectType: 'cost_reduction_upgrades', description: '-% Upgrade-Kosten.', img: 'pet_owl.png.png', interval: 0, levelCost: 30, costGrowth: 1.5, maxLevel: 100 },

    // 4. Pet Fish: KOSTENREDUKTION GEBÄUDE
    { id: 'pet_fish', name: 'Finny der Ökonom', baseEffect: 0.05, effectType: 'cost_reduction_buildings', description: '-% Gebäudekosten.', img: 'pet_fish.png.png', interval: 0, levelCost: 50, costGrowth: 1.5, maxLevel: 100 },

    // 5. Pet Chameleon: PRESTIGE-EFFEKTIVITÄT (bleibt gleich)
    { id: 'pet_chameleon', name: 'Tarn-Chamaeleon', baseEffect: 0.01, effectType: 'prestige_point_eff', description: '+% PP-Effektivität.', img: 'pet_chameleon.png.png', interval: 0, levelCost: 100, costGrowth: 1.5, maxLevel: 100 },
];

const guildUpgrades = [
    { id: 0, name: "Gilden-Macht I", cost: 10000000000, effect: 0.05, effectType: 'global_sps_mult', description: "Globale SPS +5%" },
    { id: 1, name: "Gilden-Macht II", cost: 50000000000, effect: 0.10, effectType: 'global_sps_mult', description: "Globale SPS +10%" },
    { id: 2, name: "Gilden-Macht III", cost: 250000000000, effect: 0.15, effectType: 'global_sps_mult', description: "Globale SPS +15%" },
    // Weitere Upgrades können hier später hinzugefügt werden
];