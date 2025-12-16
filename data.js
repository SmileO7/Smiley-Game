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
    // --- 0. KLICKKRAFT UPGRADES (ID 0 - 4 | Gesamt: 5) ---
    { id: 0, cost: 10000, description: "Klickkraft: Multiplikator +10%", type: "click_mult", value: 0.1, buildingIndex: undefined },
    { id: 1, cost: 28284, description: "Klickkraft: Multiplikator +10%", type: "click_mult", value: 0.1, buildingIndex: undefined },
    { id: 2, cost: 51961, description: "Klickkraft: Multiplikator +10%", type: "click_mult", value: 0.1, buildingIndex: undefined },
    { id: 3, cost: 80000, description: "Klickkraft: Multiplikator +10%", type: "click_mult", value: 0.1, buildingIndex: undefined },
    { id: 4, cost: 111803, description: "Klickkraft: Multiplikator +10%", type: "click_mult", value: 0.1, buildingIndex: undefined },

    // --- GEBÄUDE 0: Auto-Klicker (ID 5 - 11 | Gesamt: 7) ---
    { id: 5, cost: 146969, description: "Auto-Klicker: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 0 },
    { id: 6, cost: 185219, description: "Auto-Klicker: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 0 },
    { id: 7, cost: 226274, description: "Auto-Klicker: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 0 }, // NEU: Kostenreduktion
    { id: 8, cost: 270000, description: "Auto-Klicker: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 0 },
    { id: 9, cost: 316228, description: "Auto-Klicker: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 0 },
    { id: 10, cost: 364917, description: "Auto-Klicker: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 0 }, // NEU: Kostenreduktion
    { id: 11, cost: 415692, description: "Auto-Klicker: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 0 },

    // --- GEBÄUDE 1: Smiley-Baum (ID 12 - 18 | Gesamt: 7) ---
    { id: 12, cost: 468324, description: "Smiley-Baum: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 1 },
    { id: 13, cost: 522653, description: "Smiley-Baum: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 1 },
    { id: 14, cost: 578535, description: "Smiley-Baum: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 1 }, // NEU: Kostenreduktion
    { id: 15, cost: 635849, description: "Smiley-Baum: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 1 },
    { id: 16, cost: 694484, description: "Smiley-Baum: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 1 },
    { id: 17, cost: 754341, description: "Smiley-Baum: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 1 }, // NEU: Kostenreduktion
    { id: 18, cost: 815334, description: "Smiley-Baum: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 1 },

    // --- GEBÄUDE 2: Smiley-Fabrik (ID 19 - 25 | Gesamt: 7) ---
    { id: 19, cost: 877383, description: "Smiley-Fabrik: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 2 },
    { id: 20, cost: 940407, description: "Smiley-Fabrik: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 2 },
    { id: 21, cost: 1004456, description: "Smiley-Fabrik: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 2 }, // NEU: Kostenreduktion
    { id: 22, cost: 1069485, description: "Smiley-Fabrik: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 2 },
    { id: 23, cost: 1135467, description: "Smiley-Fabrik: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 2 },
    { id: 24, cost: 1202377, description: "Smiley-Fabrik: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 2 }, // NEU: Kostenreduktion
    { id: 25, cost: 1270191, description: "Smiley-Fabrik: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 2 },

    // --- GEBÄUDE 3: Smiley-Mine (ID 26 - 32 | Gesamt: 7) ---
    { id: 26, cost: 1338885, description: "Smiley-Mine: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 3 },
    { id: 27, cost: 1408436, description: "Smiley-Mine: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 3 },
    { id: 28, cost: 1478822, description: "Smiley-Mine: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 3 }, // NEU: Kostenreduktion
    { id: 29, cost: 1550024, description: "Smiley-Mine: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 3 },
    { id: 30, cost: 1622020, description: "Smiley-Mine: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 3 },
    { id: 31, cost: 1694794, description: "Smiley-Mine: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 3 }, // NEU: Kostenreduktion
    { id: 32, cost: 1768326, description: "Smiley-Mine: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 3 },

    // --- GEBÄUDE 4: Smiley-Bohrer (ID 33 - 39 | Gesamt: 7) ---
    { id: 33, cost: 1842600, description: "Smiley-Bohrer: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 4 },
    { id: 34, cost: 1917600, description: "Smiley-Bohrer: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 4 },
    { id: 35, cost: 1993310, description: "Smiley-Bohrer: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 4 }, // NEU: Kostenreduktion
    { id: 36, cost: 2069715, description: "Smiley-Bohrer: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 4 },
    { id: 37, cost: 2146797, description: "Smiley-Bohrer: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 4 },
    { id: 38, cost: 2224542, description: "Smiley-Bohrer: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 4 }, // NEU: Kostenreduktion
    { id: 39, cost: 2302936, description: "Smiley-Bohrer: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 4 },

    // --- GEBÄUDE 5: Smiley-Kernkraftwerk (ID 40 - 46 | Gesamt: 7) ---
    { id: 40, cost: 2381966, description: "Smiley-Kernkraftwerk: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 5 },
    { id: 41, cost: 2461623, description: "Smiley-Kernkraftwerk: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 5 },
    { id: 42, cost: 2541902, description: "Smiley-Kernkraftwerk: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 5 }, // NEU: Kostenreduktion
    { id: 43, cost: 2622791, description: "Smiley-Kernkraftwerk: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 5 },
    { id: 44, cost: 2704283, description: "Smiley-Kernkraftwerk: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 5 },
    { id: 45, cost: 2786369, description: "Smiley-Kernkraftwerk: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 5 }, // NEU: Kostenreduktion
    { id: 46, cost: 2869041, description: "Smiley-Kernkraftwerk: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 5 },

    // --- GEBÄUDE 6: Smiley-Galaxie (ID 47 - 53 | Gesamt: 7) ---
    { id: 47, cost: 2952290, description: "Smiley-Galaxie: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 6 },
    { id: 48, cost: 3036109, description: "Smiley-Galaxie: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 6 },
    { id: 49, cost: 3120491, description: "Smiley-Galaxie: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 6 }, // NEU: Kostenreduktion
    { id: 50, cost: 3205427, description: "Smiley-Galaxie: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 6 },
    { id: 51, cost: 3290910, description: "Smiley-Galaxie: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 6 },
    { id: 52, cost: 3376934, description: "Smiley-Galaxie: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 6 }, // NEU: Kostenreduktion
    { id: 53, cost: 3463490, description: "Smiley-Galaxie: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 6 },

    // --- GEBÄUDE 7: Dimensionsportal (ID 54 - 60 | Gesamt: 7) ---
    { id: 54, cost: 3550572, description: "Dimensionsportal: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 7 },
    { id: 55, cost: 3638173, description: "Dimensionsportal: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 7 },
    { id: 56, cost: 3726286, description: "Dimensionsportal: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 7 }, // NEU: Kostenreduktion
    { id: 57, cost: 3814894, description: "Dimensionsportal: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 7 },
    { id: 58, cost: 3903993, description: "Dimensionsportal: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 7 },
    { id: 59, cost: 3993577, description: "Dimensionsportal: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 7 }, // NEU: Kostenreduktion
    { id: 60, cost: 4083639, description: "Dimensionsportal: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 7 },

    // --- GEBÄUDE 8: Zeitmaschine (ID 61 - 67 | Gesamt: 7) ---
    { id: 61, cost: 4174175, description: "Zeitmaschine: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 8 },
    { id: 62, cost: 4265179, description: "Zeitmaschine: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 8 },
    { id: 63, cost: 4356644, description: "Zeitmaschine: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 8 }, // NEU: Kostenreduktion
    { id: 64, cost: 4448564, description: "Zeitmaschine: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 8 },
    { id: 65, cost: 4540933, description: "Zeitmaschine: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 8 },
    { id: 66, cost: 4633744, description: "Zeitmaschine: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 8 }, // NEU: Kostenreduktion
    { id: 67, cost: 4726992, description: "Zeitmaschine: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 8 },

    // --- GEBÄUDE 9: Meta-Klicker (ID 68 - 74 | Gesamt: 7) ---
    { id: 68, cost: 4820670, description: "Meta-Klicker: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 9 },
    { id: 69, cost: 4914775, description: "Meta-Klicker: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 9 },
    { id: 70, cost: 5009299, description: "Meta-Klicker: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 9 }, // NEU: Kostenreduktion
    { id: 71, cost: 5104239, description: "Meta-Klicker: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 9 },
    { id: 72, cost: 5199589, description: "Meta-Klicker: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 9 },
    { id: 73, cost: 5295346, description: "Meta-Klicker: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 9 }, // NEU: Kostenreduktion
    { id: 74, cost: 5391506, description: "Meta-Klicker: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 9 },

    // --- GEBÄUDE 10: Quanten-Netzwerk (ID 75 - 81 | Gesamt: 7) ---
    { id: 75, cost: 5488065, description: "Quanten-Netzwerk: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 10 },
    { id: 76, cost: 5585018, description: "Quanten-Netzwerk: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 10 },
    { id: 77, cost: 5682361, description: "Quanten-Netzwerk: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 10 }, // NEU: Kostenreduktion
    { id: 78, cost: 5780090, description: "Quanten-Netzwerk: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 10 },
    { id: 79, cost: 5878199, description: "Quanten-Netzwerk: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 10 },
    { id: 80, cost: 5976686, description: "Quanten-Netzwerk: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 10 }, // NEU: Kostenreduktion
    { id: 81, cost: 6075545, description: "Quanten-Netzwerk: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 10 },

    // --- GEBÄUDE 11: Endloser Speicher (ID 82 - 88 | Gesamt: 7) ---
    { id: 82, cost: 6174771, description: "Endloser Speicher: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 11 },
    { id: 83, cost: 6274360, description: "Endloser Speicher: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 11 },
    { id: 84, cost: 6374309, description: "Endloser Speicher: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 11 }, // NEU: Kostenreduktion
    { id: 85, cost: 6474614, description: "Endloser Speicher: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 11 },
    { id: 86, cost: 6575271, description: "Endloser Speicher: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 11 },
    { id: 87, cost: 6676277, description: "Endloser Speicher: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 11 }, // NEU: Kostenreduktion
    { id: 88, cost: 6777628, description: "Endloser Speicher: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 11 },

    // --- GEBÄUDE 12: Ursprung (ID 89 - 95 | Gesamt: 7) ---
    { id: 89, cost: 6879321, description: "Ursprung: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 12 },
    { id: 90, cost: 6981352, description: "Ursprung: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 12 },
    { id: 91, cost: 7083719, description: "Ursprung: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 12 }, // NEU: Kostenreduktion
    { id: 92, cost: 7186419, description: "Ursprung: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 12 },
    { id: 93, cost: 7289450, description: "Ursprung: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 12 },
    { id: 94, cost: 7392809, description: "Ursprung: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 12 }, // NEU: Kostenreduktion
    { id: 95, cost: 7496494, description: "Ursprung: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 12 },

    // --- GEBÄUDE 13: Kosmische Einheit (ID 96 - 102 | Gesamt: 7) ---
    { id: 96, cost: 7600502, description: "Kosmische Einheit: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 13 },
    { id: 97, cost: 7704832, description: "Kosmische Einheit: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 13 },
    { id: 98, cost: 7809480, description: "Kosmische Einheit: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 13 }, // NEU: Kostenreduktion
    { id: 99, cost: 7914445, description: "Kosmische Einheit: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 13 },
    { id: 100, cost: 8019726, description: "Kosmische Einheit: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 13 },
    { id: 101, cost: 8125319, description: "Kosmische Einheit: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 13 }, // NEU: Kostenreduktion
    { id: 102, cost: 8231224, description: "Kosmische Einheit: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 13 },

    // --- GEBÄUDE 14: Absoluter Schöpfer (ID 103 - 109 | Gesamt: 7) ---
    { id: 103, cost: 8337438, description: "Absoluter Schöpfer: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 14 },
    { id: 104, cost: 8443958, description: "Absoluter Schöpfer: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 14 },
    { id: 105, cost: 8550782, description: "Absoluter Schöpfer: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 14 }, // NEU: Kostenreduktion
    { id: 106, cost: 8657908, description: "Absoluter Schöpfer: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 14 },
    { id: 107, cost: 8765335, description: "Absoluter Schöpfer: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 14 },
    { id: 108, cost: 8873059, description: "Absoluter Schöpfer: Gebäudekosten -1%", type: "cost_reduction_buildings", value: 0.01, buildingIndex: 14 }, // NEU: Kostenreduktion
    { id: 109, cost: 8981079, description: "Absoluter Schöpfer: Produktion +10%", type: "building_mult", value: 0.1, buildingIndex: 14 },
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

const guildUpgradesData = [
    {
        id: 0,
        name: "Erster Lehrling (x1.1 SPS)",
        description: "Ein unmotivierter Lehrling, der 10% zur SPS beiträgt.",
        baseCost: 1e5, // 100 Tausend Smileys
        costMultiplier: 2.0,
        spsMultiplier: 1.1, // 10% mehr SPS
    },
    {
        id: 1,
        name: "Erfahrener Sammler (x1.5 SPS)",
        description: "Dein erster richtiger Produktionsschub. Ein Muss.",
        baseCost: 1e8, // 100 Millionen Smileys
        costMultiplier: 2.2,
        spsMultiplier: 1.5
    },
    {
        id: 2,
        name: "Gildenmeister (x2.0 Klick)",
        description: "Der Gildenmeister verdoppelt deine Klickkraft.",
        baseCost: 1e12, // 1 Billion Smileys
        costMultiplier: 3.0,
        spsMultiplier: 2.0,
        isClickMultiplier: true // Flag, um SPS vs. Klick zu unterscheiden
    },
    {
        id: 3,
        name: "Kontinentales Abkommen (x5.0 SPS)",
        description: "Erweiterung der Reichweite über Kontinente.",
        baseCost: 1e16, // 10 Billiarden Smileys
        costMultiplier: 3.0,
        spsMultiplier: 5.0
    },
];