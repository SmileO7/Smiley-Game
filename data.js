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
    // Konzept: Exponentielles Wachstum, damit Klicken auch später noch relevant bleibt.
    { id: 0, cost: 500, description: "Finger-Training: Klickkraft +25%", type: "click_mult", value: 0.25, buildingIndex: undefined },
    { id: 1, cost: 2500, description: "Gaming-Maus: Klickkraft +50%", type: "click_mult", value: 0.50, buildingIndex: undefined },
    { id: 2, cost: 10000, description: "Doppelklick-Technik: Klickkraft +100%", type: "click_mult", value: 1.0, buildingIndex: undefined },
    { id: 3, cost: 50000, description: "Mechanische Finger: Klickkraft +200%", type: "click_mult", value: 2.0, buildingIndex: undefined },
    { id: 4, cost: 250000, description: "Göttliche Berührung: Klickkraft +500%", type: "click_mult", value: 5.0, buildingIndex: undefined },

    // --- GEBÄUDE 0: Auto-Klicker (ID 5 - 11 | Gesamt: 7) ---
    // Konzept: Von einfacher Ölung bis zur künstlichen Intelligenz.
    { id: 5, cost: 15000, description: "Auto-Klicker: Bessere Schmierung (+25%)", type: "building_mult", value: 0.25, buildingIndex: 0 },
    { id: 6, cost: 40000, description: "Auto-Klicker: Stärkere Motoren (+50%)", type: "building_mult", value: 0.50, buildingIndex: 0 },
    { id: 7, cost: 100000, description: "Auto-Klicker: Mengenrabatt (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 0 },
    { id: 8, cost: 250000, description: "Auto-Klicker: Titan-Spitzen (+100%)", type: "building_mult", value: 1.0, buildingIndex: 0 },
    { id: 9, cost: 750000, description: "Auto-Klicker: Übertaktung (+200%)", type: "building_mult", value: 2.0, buildingIndex: 0 },
    { id: 10, cost: 2000000, description: "Auto-Klicker: Selbst-Reparatur (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 0 },
    { id: 11, cost: 5000000, description: "Auto-Klicker: K.I. Schwarm (+500%)", type: "building_mult", value: 5.0, buildingIndex: 0 },

    // --- GEBÄUDE 1: Smiley-Baum (ID 12 - 18) ---
        // Thema: Natur & Wachstum
        { id: 12, cost: 500000, description: "Smiley-Baum: Spezial-Dünger (+25%)", type: "building_mult", value: 0.25, buildingIndex: 1 },
        { id: 13, cost: 1200000, description: "Smiley-Baum: Auto-Bewässerung (+50%)", type: "building_mult", value: 0.50, buildingIndex: 1 },
        { id: 14, cost: 2500000, description: "Smiley-Baum: Großhändler-Rabatt (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 1 },
        { id: 15, cost: 5000000, description: "Smiley-Baum: Gentechnik (+100%)", type: "building_mult", value: 1.0, buildingIndex: 1 },
        { id: 16, cost: 12000000, description: "Smiley-Baum: Synthetische Blätter (+200%)", type: "building_mult", value: 2.0, buildingIndex: 1 },
        { id: 17, cost: 25000000, description: "Smiley-Baum: Stecklinge (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 1 },
        { id: 18, cost: 60000000, description: "Smiley-Baum: Yggdrasil-Wurzeln (+500%)", type: "building_mult", value: 5.0, buildingIndex: 1 },

        // --- GEBÄUDE 2: Smiley-Fabrik (ID 19 - 25) ---
        // Thema: Industrie & Automatisierung
        { id: 19, cost: 900000, description: "Smiley-Fabrik: Schichtarbeit (+25%)", type: "building_mult", value: 0.25, buildingIndex: 2 },
        { id: 20, cost: 2200000, description: "Smiley-Fabrik: Fließband-Optimierung (+50%)", type: "building_mult", value: 0.50, buildingIndex: 2 },
        { id: 21, cost: 4500000, description: "Smiley-Fabrik: Material-Recycling (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 2 },
        { id: 22, cost: 9000000, description: "Smiley-Fabrik: Roboter-Arme (+100%)", type: "building_mult", value: 1.0, buildingIndex: 2 },
        { id: 23, cost: 20000000, description: "Smiley-Fabrik: KI-Steuerung (+200%)", type: "building_mult", value: 2.0, buildingIndex: 2 },
        { id: 24, cost: 45000000, description: "Smiley-Fabrik: 3D-Druck (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 2 },
        { id: 25, cost: 100000000, description: "Smiley-Fabrik: Nanofabrikation (+500%)", type: "building_mult", value: 5.0, buildingIndex: 2 },

        // --- GEBÄUDE 3: Smiley-Mine (ID 26 - 32) ---
        // Thema: Bergbau & Untergrund
        { id: 26, cost: 1500000, description: "Smiley-Mine: Bessere Spitzhacken (+25%)", type: "building_mult", value: 0.25, buildingIndex: 3 },
        { id: 27, cost: 3500000, description: "Smiley-Mine: Dynamit-Einsatz (+50%)", type: "building_mult", value: 0.50, buildingIndex: 3 },
        { id: 28, cost: 7500000, description: "Smiley-Mine: Minen-Logistik (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 3 },
        { id: 29, cost: 15000000, description: "Smiley-Mine: Diamant-Bohrer (+100%)", type: "building_mult", value: 1.0, buildingIndex: 3 },
        { id: 30, cost: 35000000, description: "Smiley-Mine: Laser-Abbau (+200%)", type: "building_mult", value: 2.0, buildingIndex: 3 },
        { id: 31, cost: 80000000, description: "Smiley-Mine: Drohnen-Schwarm (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 3 },
        { id: 32, cost: 180000000, description: "Smiley-Mine: Planeten-Kern (+500%)", type: "building_mult", value: 5.0, buildingIndex: 3 },

        // --- GEBÄUDE 4: Smiley-Bohrer (ID 33 - 39) ---
        // Thema: Schweres Gerät & Tiefsee/Erde
        { id: 33, cost: 2500000, description: "Smiley-Bohrer: Gehärteter Stahl (+25%)", type: "building_mult", value: 0.25, buildingIndex: 4 },
        { id: 34, cost: 6000000, description: "Smiley-Bohrer: Hydraulik-System (+50%)", type: "building_mult", value: 0.50, buildingIndex: 4 },
        { id: 35, cost: 12000000, description: "Smiley-Bohrer: Modulare Bauweise (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 4 },
        { id: 36, cost: 25000000, description: "Smiley-Bohrer: Plasma-Schneider (+100%)", type: "building_mult", value: 1.0, buildingIndex: 4 },
        { id: 37, cost: 60000000, description: "Smiley-Bohrer: Magma-Antrieb (+200%)", type: "building_mult", value: 2.0, buildingIndex: 4 },
        { id: 38, cost: 130000000, description: "Smiley-Bohrer: Teleport-Fracht (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 4 },
        { id: 39, cost: 300000000, description: "Smiley-Bohrer: Erd-Spalter (+500%)", type: "building_mult", value: 5.0, buildingIndex: 4 },

    // --- GEBÄUDE 5: Smiley-Kernkraftwerk (ID 40 - 46) ---
        // Thema: Atomare Energie & Strahlung
        { id: 40, cost: 4000000, description: "Kernkraftwerk: Uran-Anreicherung (+25%)", type: "building_mult", value: 0.25, buildingIndex: 5 },
        { id: 41, cost: 10000000, description: "Kernkraftwerk: Neue Turbinen (+50%)", type: "building_mult", value: 0.50, buildingIndex: 5 },
        { id: 42, cost: 20000000, description: "Kernkraftwerk: Sicherheitsprotokoll (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 5 },
        { id: 43, cost: 50000000, description: "Kernkraftwerk: Kalte Fusion (+100%)", type: "building_mult", value: 1.0, buildingIndex: 5 },
        { id: 44, cost: 120000000, description: "Kernkraftwerk: Antimaterie-Zelle (+200%)", type: "building_mult", value: 2.0, buildingIndex: 5 },
        { id: 45, cost: 250000000, description: "Kernkraftwerk: Strahlungs-Recycling (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 5 },
        { id: 46, cost: 600000000, description: "Kernkraftwerk: Unendliche Energie (+500%)", type: "building_mult", value: 5.0, buildingIndex: 5 },

        // --- GEBÄUDE 6: Smiley-Galaxie (ID 47 - 53) ---
        // Thema: Weltraum & Sterne
        { id: 47, cost: 8000000, description: "Galaxie: Sternenstaub-Sammler (+25%)", type: "building_mult", value: 0.25, buildingIndex: 6 },
        { id: 48, cost: 20000000, description: "Galaxie: Planeten-Former (+50%)", type: "building_mult", value: 0.50, buildingIndex: 6 },
        { id: 49, cost: 45000000, description: "Galaxie: Schwerkraft-Schleuder (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 6 },
        { id: 50, cost: 100000000, description: "Galaxie: Dyson-Sphäre (+100%)", type: "building_mult", value: 1.0, buildingIndex: 6 },
        { id: 51, cost: 250000000, description: "Galaxie: Schwarzes Loch (+200%)", type: "building_mult", value: 2.0, buildingIndex: 6 },
        { id: 52, cost: 600000000, description: "Galaxie: Raumkrümmung (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 6 },
        { id: 53, cost: 1500000000, description: "Galaxie: Supernova-Explosion (+500%)", type: "building_mult", value: 5.0, buildingIndex: 6 },

        // --- GEBÄUDE 7: Dimensionsportal (ID 54 - 60) ---
        // Thema: Multiversum & Risse
        { id: 54, cost: 20000000, description: "Portal: Riss-Stabilisator (+25%)", type: "building_mult", value: 0.25, buildingIndex: 7 },
        { id: 55, cost: 50000000, description: "Portal: Leeren-Energie (+50%)", type: "building_mult", value: 0.50, buildingIndex: 7 },
        { id: 56, cost: 120000000, description: "Portal: Wurmloch-Karte (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 7 },
        { id: 57, cost: 300000000, description: "Portal: Taschen-Dimension (+100%)", type: "building_mult", value: 1.0, buildingIndex: 7 },
        { id: 58, cost: 800000000, description: "Portal: Ereignishorizont (+200%)", type: "building_mult", value: 2.0, buildingIndex: 7 },
        { id: 59, cost: 2000000000, description: "Portal: Realitäts-Anker (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 7 },
        { id: 60, cost: 5000000000, description: "Portal: Omni-Präsenz (+500%)", type: "building_mult", value: 5.0, buildingIndex: 7 },

        // --- GEBÄUDE 8: Zeitmaschine (ID 61 - 67) ---
        // Thema: Zeitreisen & Paradoxa
        { id: 61, cost: 50000000, description: "Zeitmaschine: Fluxkompensator (+25%)", type: "building_mult", value: 0.25, buildingIndex: 8 },
        { id: 62, cost: 150000000, description: "Zeitmaschine: Zukunfts-Wissen (+50%)", type: "building_mult", value: 0.50, buildingIndex: 8 },
        { id: 63, cost: 400000000, description: "Zeitmaschine: Paradox-Schutz (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 8 },
        { id: 64, cost: 1000000000, description: "Zeitmaschine: Zeit-Kristalle (+100%)", type: "building_mult", value: 1.0, buildingIndex: 8 },
        { id: 65, cost: 3000000000, description: "Zeitmaschine: Ewigkeitsschleife (+200%)", type: "building_mult", value: 2.0, buildingIndex: 8 },
        { id: 66, cost: 8000000000, description: "Zeitmaschine: Kausalitäts-Bruch (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 8 },
        { id: 67, cost: 20000000000, description: "Zeitmaschine: Urzeit-Ernte (+500%)", type: "building_mult", value: 5.0, buildingIndex: 8 },

        // --- GEBÄUDE 9: Meta-Klicker (ID 68 - 74) ---
        // Thema: Code, Glitches & 4. Wand
        { id: 68, cost: 150000000, description: "Meta: Code-Optimierung (+25%)", type: "building_mult", value: 0.25, buildingIndex: 9 },
        { id: 69, cost: 400000000, description: "Meta: Vierte Wand Durchbruch (+50%)", type: "building_mult", value: 0.50, buildingIndex: 9 },
        { id: 70, cost: 1000000000, description: "Meta: Entwickler-Konsole (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 9 },
        { id: 71, cost: 3000000000, description: "Meta: Glitch-Harvesting (+100%)", type: "building_mult", value: 1.0, buildingIndex: 9 },
        { id: 72, cost: 10000000000, description: "Meta: Root-Zugriff (+200%)", type: "building_mult", value: 2.0, buildingIndex: 9 },
        { id: 73, cost: 25000000000, description: "Meta: Bug-Exploit (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 9 },
        { id: 74, cost: 60000000000, description: "Meta: Der Algorithmus (+500%)", type: "building_mult", value: 5.0, buildingIndex: 9 },

        // --- GEBÄUDE 10: Quanten-Netzwerk (ID 75 - 81) ---
        // Thema: Physik & Wahrscheinlichkeiten
        { id: 75, cost: 500000000, description: "Quanten: Qubit-Prozessor (+25%)", type: "building_mult", value: 0.25, buildingIndex: 10 },
        { id: 76, cost: 1500000000, description: "Quanten: Verschränkung (+50%)", type: "building_mult", value: 0.50, buildingIndex: 10 },
        { id: 77, cost: 4000000000, description: "Quanten: Unschärfe-Filter (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 10 },
        { id: 78, cost: 10000000000, description: "Quanten: Superposition (+100%)", type: "building_mult", value: 1.0, buildingIndex: 10 },
        { id: 79, cost: 30000000000, description: "Quanten: Tunnel-Effekt (+200%)", type: "building_mult", value: 2.0, buildingIndex: 10 },
        { id: 80, cost: 80000000000, description: "Quanten: Nullpunkt-Energie (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 10 },
        { id: 81, cost: 200000000000, description: "Quanten: Schrödingers Smiley (+500%)", type: "building_mult", value: 5.0, buildingIndex: 10 },

        // --- GEBÄUDE 11: Endloser Speicher (ID 82 - 88) ---
        // Thema: Daten & Unendlichkeit
        { id: 82, cost: 2000000000, description: "Speicher: Cloud-Upload (+25%)", type: "building_mult", value: 0.25, buildingIndex: 11 },
        { id: 83, cost: 6000000000, description: "Speicher: Daten-Kompression (+50%)", type: "building_mult", value: 0.50, buildingIndex: 11 },
        { id: 84, cost: 15000000000, description: "Speicher: Server-Farm (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 11 },
        { id: 85, cost: 40000000000, description: "Speicher: Holographie (+100%)", type: "building_mult", value: 1.0, buildingIndex: 11 },
        { id: 86, cost: 120000000000, description: "Speicher: Akasha-Chronik (+200%)", type: "building_mult", value: 2.0, buildingIndex: 11 },
        { id: 87, cost: 300000000000, description: "Speicher: Das Archiv (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 11 },
        { id: 88, cost: 800000000000, description: "Speicher: Unendlichkeitsschleife (+500%)", type: "building_mult", value: 5.0, buildingIndex: 11 },

        // --- GEBÄUDE 12: Ursprung (ID 89 - 95) ---
        // Thema: Schöpfung & Urknall
        { id: 89, cost: 10000000000, description: "Ursprung: Ursuppe (+25%)", type: "building_mult", value: 0.25, buildingIndex: 12 },
        { id: 90, cost: 30000000000, description: "Ursprung: Erster Funke (+50%)", type: "building_mult", value: 0.50, buildingIndex: 12 },
        { id: 91, cost: 80000000000, description: "Ursprung: Äther-Extraktion (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 12 },
        { id: 92, cost: 200000000000, description: "Ursprung: Genesis-Funktion (+100%)", type: "building_mult", value: 1.0, buildingIndex: 12 },
        { id: 93, cost: 600000000000, description: "Ursprung: Gottes-Teilchen (+200%)", type: "building_mult", value: 2.0, buildingIndex: 12 },
        { id: 94, cost: 1500000000000, description: "Ursprung: Schöpfungs-Code (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 12 },
        { id: 95, cost: 4000000000000, description: "Ursprung: Alpha & Omega (+500%)", type: "building_mult", value: 5.0, buildingIndex: 12 },

        // --- GEBÄUDE 13: Kosmische Einheit (ID 96 - 102) ---
        // Thema: Bewusstsein & Harmonie
        { id: 96, cost: 50000000000, description: "Einheit: Telepathie (+25%)", type: "building_mult", value: 0.25, buildingIndex: 13 },
        { id: 97, cost: 150000000000, description: "Einheit: Schwarm-Bewusstsein (+50%)", type: "building_mult", value: 0.50, buildingIndex: 13 },
        { id: 98, cost: 400000000000, description: "Einheit: Kosmische Harmonie (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 13 },
        { id: 99, cost: 1000000000000, description: "Einheit: Reiner Wille (+100%)", type: "building_mult", value: 1.0, buildingIndex: 13 },
        { id: 100, cost: 3000000000000, description: "Einheit: Geist-Materie (+200%)", type: "building_mult", value: 2.0, buildingIndex: 13 },
        { id: 101, cost: 8000000000000, description: "Einheit: Transzendenz (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 13 },
        { id: 102, cost: 20000000000000, description: "Einheit: Das Eine (+500%)", type: "building_mult", value: 5.0, buildingIndex: 13 },

        // --- GEBÄUDE 14: Absoluter Schöpfer (ID 103 - 109) ---
        // Thema: Ultimative Macht
        { id: 103, cost: 250000000000, description: "Schöpfer: Realitäts-Editor (+25%)", type: "building_mult", value: 0.25, buildingIndex: 14 },
        { id: 104, cost: 800000000000, description: "Schöpfer: Unbegrenzte Macht (+50%)", type: "building_mult", value: 0.50, buildingIndex: 14 },
        { id: 105, cost: 2000000000000, description: "Schöpfer: Weltenbauer (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 14 },
        { id: 106, cost: 6000000000000, description: "Schöpfer: Existenz-Ebene (+100%)", type: "building_mult", value: 1.0, buildingIndex: 14 },
        { id: 107, cost: 20000000000000, description: "Schöpfer: Die Antwort 42 (+200%)", type: "building_mult", value: 2.0, buildingIndex: 14 },
        { id: 108, cost: 50000000000000, description: "Schöpfer: Game Overdrive (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 14 },
        { id: 109, cost: 150000000000000, description: "Schöpfer: Developer Mode (+500%)", type: "building_mult", value: 5.0, buildingIndex: 14 },
    ];

// data.js - Prestige Upgrades Overhaul
const prestigeUpgrades = [
    // --- STUFE 1: Der Start ---
    {
        id: 0, name: "Genesis", cost: 1,
        description: "Startbonus: +10% passive SPS.",
        type: 'sps_mult', value: 0.10,
        x: 0, y: 0, requirements: []
    },

    // --- STUFE 2: Spezialisierung ---
    {
        id: 1, name: "Aktive Finger", cost: 2,
        description: "Klickkraft +25%.",
        type: 'click_mult', value: 0.25,
        x: -100, y: 100, requirements: [0]
    },
    {
        id: 2, name: "Passive Macht", cost: 2,
        description: "SPS +25%.",
        type: 'sps_mult', value: 0.25,
        x: 100, y: 100, requirements: [0]
    },

    // --- STUFE 3: Utility & Effizienz ---
    {
        id: 3, name: "Bau-Rabatt", cost: 5,
        description: "Alle Gebäude sind 5% günstiger.",
        type: 'cost_reduction', value: 0.05,
        x: -150, y: 200, requirements: [1]
    },
    {
        id: 4, name: "Prestige-Experte", cost: 10,
        description: "Prestige-Punkte sind 10% effektiver.",
        type: 'prestige_efficiency', value: 0.10,
        x: 150, y: 200, requirements: [2]
    },

    // --- STUFE 4: Die Mitte (Verbindung) ---
    {
        id: 5, name: "Synergie", cost: 15,
        description: "Klicks geben kurzzeitig SPS-Boost (Simuliert: Klickkraft +50%)",
        type: 'click_mult', value: 0.50,
        x: 0, y: 300, requirements: [1, 2]
    },

    // --- STUFE 5: Feature Unlocks (Midgame) ---
    {
        id: 6, name: "Süße Begleiter", cost: 50,
        description: "Schaltet das PET-SYSTEM frei.",
        type: 'unlock_pets', value: 0,
        x: -100, y: 400, requirements: [5]
    },
    {
        id: 7, name: "Tiefbau", cost: 50,
        description: "Schaltet die DIAMANTEN-MINE frei.",
        type: 'unlock_mine', value: 0,
        x: 100, y: 400, requirements: [5]
    },

    // --- STUFE 6: Das Gilden-System ---
    {
        id: 8, name: "Imperium", cost: 100,
        description: "Schaltet das GILDEN-SYSTEM frei.",
        type: 'unlock_guilds', value: 0,
        x: 0, y: 500, requirements: [6, 7]
    },

    // --- STUFE 7: Die Expansion (Late Game) ---
    // Hier beginnen die richtig starken Upgrades
    {
        id: 9, name: "Globaler Reichtum", cost: 250,
        description: "Verdoppelt deine gesamte SPS-Produktion (x2).",
        type: 'global_mult', value: 1.0, // 1.0 = +100%
        x: 0, y: 600, requirements: [8]
    },

    // --- STUFE 8: Spezialisierte Pfade ---
    {
        id: 10, name: "Klick-Titan", cost: 500,
        description: "Verdreifacht deine Klickkraft (+200%).",
        type: 'click_mult', value: 2.0,
        x: -150, y: 700, requirements: [9]
    },
    {
        id: 11, name: "Industrie-Gigant", cost: 500,
        description: "Verdreifacht deine passive SPS (+200%).",
        type: 'sps_mult', value: 2.0,
        x: 150, y: 700, requirements: [9]
    },

    // --- STUFE 9: Extreme Effizienz ---
    {
        id: 12, name: "Massenproduktion", cost: 1500,
        description: "Reduziert alle Gebäudekosten um weitere 10%.",
        type: 'cost_reduction', value: 0.10,
        x: 0, y: 800, requirements: [10, 11]
    },

    // --- STUFE 10: Endgame Unlocks / Boosts ---
    {
        id: 13, name: "Zeitreise-Meister", cost: 5000,
        description: "Prestige-Punkte sind 50% effektiver.",
        type: 'prestige_efficiency', value: 0.50,
        x: -100, y: 900, requirements: [12]
    },
    {
        id: 14, name: "Big Bang", cost: 10000,
        description: "Multipliziert ALLES mit 5.",
        type: 'global_mult', value: 4.0, // +400%
        x: 100, y: 900, requirements: [12]
    }
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

const diamondShopUpgrades = [
    {
        id: 0,
        name: "Diamant-Hände (x10 Klick)",
        description: "Permanent 10x mehr Klickkraft. Das ist spürbar!",
        cost: 250, // 250 Diamanten
        effect: 10,
        type: "click_mult", // Wird zu klickKraftMultiplier addiert
        maxPurchases: 1
    },
    {
        id: 1,
        name: "SPS-Kompressor (x2 SPS)",
        description: "Verdoppelt die gesamte SPS permanent.",
        cost: 500, // 500 Diamanten
        effect: 2,
        type: "sps_mult", // Wird zu globalSPSMultiplier multipliziert
        maxPurchases: 1
    },
    {
        id: 2,
        name: "Prestige-Beschleuniger",
        description: "Erhöht die Effektivität von Prestige-Punkten um weitere 0.5%.",
        cost: 1000, // 1000 Diamanten
        effect: 0.005, // 0.5%
        type: "prestige_point_eff",
        maxPurchases: 1
    },
    {
        id: 3,
        name: "Automatisierte Diamanten-Mine",
        description: "Schaltet die automatische Diamantenproduktion frei (entsprechend der Minenanzahl, ohne Minispiel).",
        cost: 2500, // 2500 Diamanten
        effect: 1, // Wird als Flag genutzt
        type: "auto_diamond_mine",
        maxPurchases: 1
    }
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