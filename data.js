/* ======================================================= */
/* 1. GEBÄUDE-DEFINITIONEN (BASE & UNIQUE)                */
/* ======================================================= */

const buildingsData = [
    { name: "Auto-Klicker", basePrice: 25, growthRate: 1.10, baseSPS: 2, prestigeMulti: 1},
    { name: "Smiley-Baum", basePrice: 150, growthRate: 1.12, baseSPS: 12, prestigeMulti: 1},
    { name: "Smiley-Fabrik", basePrice: 1200, growthRate: 1.14, baseSPS: 80, prestigeMulti: 1},
    { name: "Smiley-Mine", basePrice: 12000, growthRate: 1.15, baseSPS: 550, prestigeMulti: 1},
    { name: "Smiley-Bohrer", basePrice: 75000, growthRate: 1.15, baseSPS: 3200, prestigeMulti: 1}, // Preis gesenkt von 100.000
    { name: "Smiley-Kernkraftwerk", basePrice: 850000, growthRate: 1.16, baseSPS: 20000, prestigeMulti: 1},
    { name: "Smiley-Galaxie", basePrice: 7500000, growthRate: 1.16, baseSPS: 140000, prestigeMulti: 1},
    { name: "Dimensionsportal", basePrice: 65000000, growthRate: 1.17, baseSPS: 950000, prestigeMulti: 1},
    { name: "Zeitmaschine", basePrice: 500000000, growthRate: 1.17, baseSPS: 6000000, prestigeMulti: 1},
    { name: "Meta-Klicker", basePrice: 4000000000, growthRate: 1.18, baseSPS: 45000000, prestigeMulti: 1},
    { name: "Quanten-Netzwerk", basePrice: 35000000000, growthRate: 1.18, baseSPS: 380000000, prestigeMulti: 1},
    { name: "Endloser Speicher", basePrice: 250000000000, growthRate: 1.19, baseSPS: 2500000000, prestigeMulti: 1},
    { name: "Ursprung", basePrice: 2000000000000, growthRate: 1.19, baseSPS: 18000000000, prestigeMulti: 1},
    { name: "Kosmische Einheit", basePrice: 15000000000000, growthRate: 1.20, baseSPS: 120000000000, prestigeMulti: 1},
    { name: "Absoluter Schöpfer", basePrice: 100000000000000, growthRate: 1.20, baseSPS: 850000000000, prestigeMulti: 1},
];

const uniqueBuildingsData = [
    { id: 'diamond_mine', name: "Diamanten-Mine", basePrice: 100000000, growthRate: 1.5, isSpecial: true, maxCount: 1, baseDPS: 1, diamondMultiplier: 1},
];

const RESEARCH_LAB_INDEX = -1;
const DIAMOND_MINE_INDEX = 15;

/* ======================================================= */
/* 2. GLOBAL UPGRADES (RESEARCH)                          */
/* ======================================================= */

const globalUpgrades = [
    // --- KLICKKRAFT UPGRADES ---
    { id: 0, cost: 500, description: "Finger-Training: Klickkraft +25%", type: "click_mult", value: 0.25, buildingIndex: undefined },
    { id: 1, cost: 2500, description: "Gaming-Maus: Klickkraft +50%", type: "click_mult", value: 0.50, buildingIndex: undefined },
    { id: 2, cost: 10000, description: "Doppelklick-Technik: Klickkraft +100%", type: "click_mult", value: 1.0, buildingIndex: undefined },
    { id: 3, cost: 50000, description: "Mechanische Finger: Klickkraft +200%", type: "click_mult", value: 2.0, buildingIndex: undefined },
    { id: 4, cost: 250000, description: "Göttliche Berührung: Klickkraft +500%", type: "click_mult", value: 5.0, buildingIndex: undefined },
    { id: 5, cost: 1000000, description: "Allmächtige Finger: Klickkraft +1000%", type: "click_mult", value: 10.0, buildingIndex: undefined },
    
    // --- GEBÄUDE SPEZIFISCH (Automatisierte Generierung für alle Stufen) ---
    // Auto-Klicker (0)
    
    { id: 5, cost: 15000, description: "Auto-Klicker: Bessere Schmierung (+25%)", type: "building_mult", value: 0.25, buildingIndex: 0 },
    { id: 6, cost: 40000, description: "Auto-Klicker: Stärkere Motoren (+50%)", type: "building_mult", value: 0.50, buildingIndex: 0 },
    { id: 7, cost: 100000, description: "Auto-Klicker: Mengenrabatt (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 0 },
    { id: 8, cost: 250000, description: "Auto-Klicker: Titan-Spitzen (+100%)", type: "building_mult", value: 1.0, buildingIndex: 0 },
    { id: 9, cost: 750000, description: "Auto-Klicker: Übertaktung (+200%)", type: "building_mult", value: 2.0, buildingIndex: 0 },
    { id: 10, cost: 2000000, description: "Auto-Klicker: Selbst-Reparatur (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 0 },
    { id: 11, cost: 5000000, description: "Auto-Klicker: K.I. Schwarm (+500%)", type: "building_mult", value: 5.0, buildingIndex: 0 },

    // Smiley-Baum (1)
    { id: 12, cost: 500000, description: "Smiley-Baum: Spezial-Dünger (+25%)", type: "building_mult", value: 0.25, buildingIndex: 1 },
    { id: 13, cost: 1200000, description: "Smiley-Baum: Auto-Bewässerung (+50%)", type: "building_mult", value: 0.50, buildingIndex: 1 },
    { id: 14, cost: 2500000, description: "Smiley-Baum: Großhändler-Rabatt (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 1 },
    { id: 15, cost: 5000000, description: "Smiley-Baum: Gentechnik (+100%)", type: "building_mult", value: 1.0, buildingIndex: 1 },
    { id: 16, cost: 12000000, description: "Smiley-Baum: Synthetische Blätter (+200%)", type: "building_mult", value: 2.0, buildingIndex: 1 },
    { id: 17, cost: 25000000, description: "Smiley-Baum: Stecklinge (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 1 },
    { id: 18, cost: 60000000, description: "Smiley-Baum: Yggdrasil-Wurzeln (+500%)", type: "building_mult", value: 5.0, buildingIndex: 1 },

    // Smiley-Fabrik (2)
    { id: 19, cost: 900000, description: "Smiley-Fabrik: Schichtarbeit (+25%)", type: "building_mult", value: 0.25, buildingIndex: 2 },
    { id: 20, cost: 2200000, description: "Smiley-Fabrik: Fließband-Optimierung (+50%)", type: "building_mult", value: 0.50, buildingIndex: 2 },
    { id: 21, cost: 4500000, description: "Smiley-Fabrik: Material-Recycling (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 2 },
    { id: 22, cost: 9000000, description: "Smiley-Fabrik: Roboter-Arme (+100%)", type: "building_mult", value: 1.0, buildingIndex: 2 },
    { id: 23, cost: 20000000, description: "Smiley-Fabrik: KI-Steuerung (+200%)", type: "building_mult", value: 2.0, buildingIndex: 2 },
    { id: 24, cost: 45000000, description: "Smiley-Fabrik: 3D-Druck (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 2 },
    { id: 25, cost: 100000000, description: "Smiley-Fabrik: Nanofabrikation (+500%)", type: "building_mult", value: 5.0, buildingIndex: 2 },

    // Smiley-Mine (3)
    { id: 26, cost: 1500000, description: "Smiley-Mine: Bessere Spitzhacken (+25%)", type: "building_mult", value: 0.25, buildingIndex: 3 },
    { id: 27, cost: 3500000, description: "Smiley-Mine: Dynamit-Einsatz (+50%)", type: "building_mult", value: 0.50, buildingIndex: 3 },
    { id: 28, cost: 7500000, description: "Smiley-Mine: Minen-Logistik (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 3 },
    { id: 29, cost: 15000000, description: "Smiley-Mine: Diamant-Bohrer (+100%)", type: "building_mult", value: 1.0, buildingIndex: 3 },
    { id: 30, cost: 35000000, description: "Smiley-Mine: Laser-Abbau (+200%)", type: "building_mult", value: 2.0, buildingIndex: 3 },
    { id: 31, cost: 80000000, description: "Smiley-Mine: Drohnen-Schwarm (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 3 },
    { id: 32, cost: 180000000, description: "Smiley-Mine: Planeten-Kern (+500%)", type: "building_mult", value: 5.0, buildingIndex: 3 },

    // Smiley-Bohrer (4)
    { id: 33, cost: 2500000, description: "Smiley-Bohrer: Gehärteter Stahl (+25%)", type: "building_mult", value: 0.25, buildingIndex: 4 },
    { id: 34, cost: 6000000, description: "Smiley-Bohrer: Hydraulik-System (+50%)", type: "building_mult", value: 0.50, buildingIndex: 4 },
    { id: 35, cost: 12000000, description: "Smiley-Bohrer: Modulare Bauweise (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 4 },
    { id: 36, cost: 25000000, description: "Smiley-Bohrer: Plasma-Schneider (+100%)", type: "building_mult", value: 1.0, buildingIndex: 4 },
    { id: 37, cost: 60000000, description: "Smiley-Bohrer: Magma-Antrieb (+200%)", type: "building_mult", value: 2.0, buildingIndex: 4 },
    { id: 38, cost: 130000000, description: "Smiley-Bohrer: Teleport-Fracht (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 4 },
    { id: 39, cost: 300000000, description: "Smiley-Bohrer: Erd-Spalter (+500%)", type: "building_mult", value: 5.0, buildingIndex: 4 },

    // Kernkraftwerk (5)
    { id: 40, cost: 4000000, description: "Kernkraftwerk: Uran-Anreicherung (+25%)", type: "building_mult", value: 0.25, buildingIndex: 5 },
    { id: 41, cost: 10000000, description: "Kernkraftwerk: Neue Turbinen (+50%)", type: "building_mult", value: 0.50, buildingIndex: 5 },
    { id: 42, cost: 20000000, description: "Kernkraftwerk: Sicherheitsprotokoll (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 5 },
    { id: 43, cost: 50000000, description: "Kernkraftwerk: Kalte Fusion (+100%)", type: "building_mult", value: 1.0, buildingIndex: 5 },
    { id: 44, cost: 120000000, description: "Kernkraftwerk: Antimaterie-Zelle (+200%)", type: "building_mult", value: 2.0, buildingIndex: 5 },
    { id: 45, cost: 250000000, description: "Kernkraftwerk: Strahlungs-Recycling (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 5 },
    { id: 46, cost: 600000000, description: "Kernkraftwerk: Unendliche Energie (+500%)", type: "building_mult", value: 5.0, buildingIndex: 5 },

    // Galaxie (6)
    { id: 47, cost: 8000000, description: "Galaxie: Sternenstaub-Sammler (+25%)", type: "building_mult", value: 0.25, buildingIndex: 6 },
    { id: 48, cost: 20000000, description: "Galaxie: Planeten-Former (+50%)", type: "building_mult", value: 0.50, buildingIndex: 6 },
    { id: 49, cost: 45000000, description: "Galaxie: Schwerkraft-Schleuder (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 6 },
    { id: 50, cost: 100000000, description: "Galaxie: Dyson-Sphäre (+100%)", type: "building_mult", value: 1.0, buildingIndex: 6 },
    { id: 51, cost: 250000000, description: "Galaxie: Schwarzes Loch (+200%)", type: "building_mult", value: 2.0, buildingIndex: 6 },
    { id: 52, cost: 600000000, description: "Galaxie: Raumkrümmung (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 6 },
    { id: 53, cost: 1500000000, description: "Galaxie: Supernova-Explosion (+500%)", type: "building_mult", value: 5.0, buildingIndex: 6 },

    // Portal (7)
    { id: 54, cost: 20000000, description: "Portal: Riss-Stabilisator (+25%)", type: "building_mult", value: 0.25, buildingIndex: 7 },
    { id: 55, cost: 50000000, description: "Portal: Leeren-Energie (+50%)", type: "building_mult", value: 0.50, buildingIndex: 7 },
    { id: 56, cost: 120000000, description: "Portal: Wurmloch-Karte (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 7 },
    { id: 57, cost: 300000000, description: "Portal: Taschen-Dimension (+100%)", type: "building_mult", value: 1.0, buildingIndex: 7 },
    { id: 58, cost: 800000000, description: "Portal: Ereignishorizont (+200%)", type: "building_mult", value: 2.0, buildingIndex: 7 },
    { id: 59, cost: 2000000000, description: "Portal: Realitäts-Anker (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 7 },
    { id: 60, cost: 5000000000, description: "Portal: Omni-Präsenz (+500%)", type: "building_mult", value: 5.0, buildingIndex: 7 },

    // Zeitmaschine (8)
    { id: 61, cost: 50000000, description: "Zeitmaschine: Fluxkompensator (+25%)", type: "building_mult", value: 0.25, buildingIndex: 8 },
    { id: 62, cost: 150000000, description: "Zeitmaschine: Zukunfts-Wissen (+50%)", type: "building_mult", value: 0.50, buildingIndex: 8 },
    { id: 63, cost: 400000000, description: "Zeitmaschine: Paradox-Schutz (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 8 },
    { id: 64, cost: 1000000000, description: "Zeitmaschine: Zeit-Kristalle (+100%)", type: "building_mult", value: 1.0, buildingIndex: 8 },
    { id: 65, cost: 3000000000, description: "Zeitmaschine: Ewigkeitsschleife (+200%)", type: "building_mult", value: 2.0, buildingIndex: 8 },
    { id: 66, cost: 8000000000, description: "Zeitmaschine: Kausalitäts-Bruch (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 8 },
    { id: 67, cost: 20000000000, description: "Zeitmaschine: Urzeit-Ernte (+500%)", type: "building_mult", value: 5.0, buildingIndex: 8 },

    // Meta (9)
    { id: 68, cost: 150000000, description: "Meta: Code-Optimierung (+25%)", type: "building_mult", value: 0.25, buildingIndex: 9 },
    { id: 69, cost: 400000000, description: "Meta: Vierte Wand Durchbruch (+50%)", type: "building_mult", value: 0.50, buildingIndex: 9 },
    { id: 70, cost: 1000000000, description: "Meta: Entwickler-Konsole (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 9 },
    { id: 71, cost: 3000000000, description: "Meta: Glitch-Harvesting (+100%)", type: "building_mult", value: 1.0, buildingIndex: 9 },
    { id: 72, cost: 10000000000, description: "Meta: Root-Zugriff (+200%)", type: "building_mult", value: 2.0, buildingIndex: 9 },
    { id: 73, cost: 25000000000, description: "Meta: Bug-Exploit (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 9 },
    { id: 74, cost: 60000000000, description: "Meta: Der Algorithmus (+500%)", type: "building_mult", value: 5.0, buildingIndex: 9 },

    // Quanten (10)
    { id: 75, cost: 500000000, description: "Quanten: Qubit-Prozessor (+25%)", type: "building_mult", value: 0.25, buildingIndex: 10 },
    { id: 76, cost: 1500000000, description: "Quanten: Verschränkung (+50%)", type: "building_mult", value: 0.50, buildingIndex: 10 },
    { id: 77, cost: 4000000000, description: "Quanten: Unschärfe-Filter (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 10 },
    { id: 78, cost: 10000000000, description: "Quanten: Superposition (+100%)", type: "building_mult", value: 1.0, buildingIndex: 10 },
    { id: 79, cost: 30000000000, description: "Quanten: Tunnel-Effekt (+200%)", type: "building_mult", value: 2.0, buildingIndex: 10 },
    { id: 80, cost: 80000000000, description: "Quanten: Nullpunkt-Energie (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 10 },
    { id: 81, cost: 200000000000, description: "Quanten: Schrödingers Smiley (+500%)", type: "building_mult", value: 5.0, buildingIndex: 10 },

    // Speicher (11)
    { id: 82, cost: 2000000000, description: "Speicher: Cloud-Upload (+25%)", type: "building_mult", value: 0.25, buildingIndex: 11 },
    { id: 83, cost: 6000000000, description: "Speicher: Daten-Kompression (+50%)", type: "building_mult", value: 0.50, buildingIndex: 11 },
    { id: 84, cost: 15000000000, description: "Speicher: Server-Farm (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 11 },
    { id: 85, cost: 40000000000, description: "Speicher: Holographie (+100%)", type: "building_mult", value: 1.0, buildingIndex: 11 },
    { id: 86, cost: 120000000000, description: "Speicher: Akasha-Chronik (+200%)", type: "building_mult", value: 2.0, buildingIndex: 11 },
    { id: 87, cost: 300000000000, description: "Speicher: Das Archiv (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 11 },
    { id: 88, cost: 800000000000, description: "Speicher: Unendlichkeitsschleife (+500%)", type: "building_mult", value: 5.0, buildingIndex: 11 },

    // Ursprung (12)
    { id: 89, cost: 10000000000, description: "Ursprung: Ursuppe (+25%)", type: "building_mult", value: 0.25, buildingIndex: 12 },
    { id: 90, cost: 30000000000, description: "Ursprung: Erster Funke (+50%)", type: "building_mult", value: 0.50, buildingIndex: 12 },
    { id: 91, cost: 80000000000, description: "Ursprung: Äther-Extraktion (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 12 },
    { id: 92, cost: 200000000000, description: "Ursprung: Genesis-Funktion (+100%)", type: "building_mult", value: 1.0, buildingIndex: 12 },
    { id: 93, cost: 600000000000, description: "Ursprung: Gottes-Teilchen (+200%)", type: "building_mult", value: 2.0, buildingIndex: 12 },
    { id: 94, cost: 1500000000000, description: "Ursprung: Schöpfungs-Code (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 12 },
    { id: 95, cost: 4000000000000, description: "Ursprung: Alpha & Omega (+500%)", type: "building_mult", value: 5.0, buildingIndex: 12 },

    // Einheit (13)
    { id: 96, cost: 50000000000, description: "Einheit: Telepathie (+25%)", type: "building_mult", value: 0.25, buildingIndex: 13 },
    { id: 97, cost: 150000000000, description: "Einheit: Schwarm-Bewusstsein (+50%)", type: "building_mult", value: 0.50, buildingIndex: 13 },
    { id: 98, cost: 400000000000, description: "Einheit: Kosmische Harmonie (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 13 },
    { id: 99, cost: 1000000000000, description: "Einheit: Reiner Wille (+100%)", type: "building_mult", value: 1.0, buildingIndex: 13 },
    { id: 100, cost: 3000000000000, description: "Einheit: Geist-Materie (+200%)", type: "building_mult", value: 2.0, buildingIndex: 13 },
    { id: 101, cost: 8000000000000, description: "Einheit: Transzendenz (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 13 },
    { id: 102, cost: 20000000000000, description: "Einheit: Das Eine (+500%)", type: "building_mult", value: 5.0, buildingIndex: 13 },

    // Schöpfer (14)
    { id: 103, cost: 250000000000, description: "Schöpfer: Realitäts-Editor (+25%)", type: "building_mult", value: 0.25, buildingIndex: 14 },
    { id: 104, cost: 800000000000, description: "Schöpfer: Unbegrenzte Macht (+50%)", type: "building_mult", value: 0.50, buildingIndex: 14 },
    { id: 105, cost: 2000000000000, description: "Schöpfer: Weltenbauer (Kosten -5%)", type: "cost_reduction_buildings", value: 0.05, buildingIndex: 14 },
    { id: 106, cost: 6000000000000, description: "Schöpfer: Existenz-Ebene (+100%)", type: "building_mult", value: 1.0, buildingIndex: 14 },
    { id: 107, cost: 20000000000000, description: "Schöpfer: Die Antwort 42 (+200%)", type: "building_mult", value: 2.0, buildingIndex: 14 },
    { id: 108, cost: 50000000000000, description: "Schöpfer: Game Overdrive (Kosten -10%)", type: "cost_reduction_buildings", value: 0.10, buildingIndex: 14 },
    { id: 109, cost: 150000000000000, description: "Schöpfer: Developer Mode (+500%)", type: "building_mult", value: 5.0, buildingIndex: 14 },

    // Combo Click
    { id: 110, name: "Rhythmische Ausdauer", description: "Verlängert das Combo-Zeitfenster auf 4 Sekunden.", cost: 2500000, type: 'combo_time', value: 4000 },
    { id: 111, name: "Combo-Limit-Break", description: "Erhöht das maximale Combo-Limit auf x5.00!", cost: 25000000, type: 'combo_max', value: 5.0 },

];

/* ======================================================= */
/* 3. PRESTIGE SYSTEM (POE-STYLE MEGA SKILL TREE)         */
/* ======================================================= */
const prestigeUpgrades = [
    // ==========================================
    // 🌟 ZENTRUM
    // ==========================================
    { id: 0, name: "Nexus", cost: 1, description: "Der Anfang von allem. +10% SPS.", type: 'sps_mult', value: 0.10, x: 0, y: 0, requirements: [] },

    // ==========================================
    // ⬆️ NORDEN: Der Pfad des Klickers (Aktiv)
    // ==========================================
    { id: 1, name: "Starker Finger", cost: 1, description: "Klickkraft +5%", type: 'click_mult', value: 0.05, x: 0, y: -80, requirements: [0] },
    { id: 2, name: "Sehnentraining", cost: 1, description: "Klickkraft +5%", type: 'click_mult', value: 0.05, x: 0, y: -160, requirements: [1] },
    
    { id: 3, name: "Präzision I", cost: 1, description: "Krit-Chance +1%", type: 'crit_chance', value: 0.01, x: -80, y: -160, requirements: [2] },
    { id: 4, name: "Fokus I", cost: 1, description: "Krit-Chance +1%", type: 'crit_chance', value: 0.01, x: 80, y: -160, requirements: [2] },
    { id: 5, name: "Präzision II", cost: 1, description: "Krit-Chance +2%", type: 'crit_chance', value: 0.02, x: -80, y: -240, requirements: [3] },
    { id: 6, name: "Fokus II", cost: 1, description: "Krit-Chance +2%", type: 'crit_chance', value: 0.02, x: 80, y: -240, requirements: [4] },
    { id: 7, name: "Schlagkraft", cost: 2, description: "Klickkraft +10%", type: 'click_mult', value: 0.10, x: 0, y: -240, requirements: [2] },
    
    { id: 8, name: "TITANEN-KLICK", cost: 5, description: "Verdoppelt Klickkraft (+100%)", type: 'click_mult', value: 1.0, x: 0, y: -320, requirements: [5, 6, 7] }, // TIER 1 KEYSTONE

    { id: 9, name: "Meuchelmord I", cost: 2, description: "Krit-Chance +3%", type: 'crit_chance', value: 0.03, x: -160, y: -320, requirements: [5] },
    { id: 10, name: "Instinkt I", cost: 2, description: "Krit-Chance +3%", type: 'crit_chance', value: 0.03, x: 160, y: -320, requirements: [6] },
    { id: 11, name: "Meuchelmord II", cost: 3, description: "Krit-Chance +4%", type: 'crit_chance', value: 0.04, x: -160, y: -400, requirements: [9] },
    { id: 12, name: "Instinkt II", cost: 3, description: "Krit-Chance +4%", type: 'crit_chance', value: 0.04, x: 160, y: -400, requirements: [10] },
    { id: 13, name: "Wucht", cost: 3, description: "Klickkraft +20%", type: 'click_mult', value: 0.20, x: 0, y: -400, requirements: [8] },

    { id: 14, name: "Brutalität I", cost: 5, description: "Klickkraft +25%", type: 'click_mult', value: 0.25, x: -80, y: -480, requirements: [11, 13] },
    { id: 15, name: "Brutalität II", cost: 5, description: "Klickkraft +25%", type: 'click_mult', value: 0.25, x: 80, y: -480, requirements: [12, 13] },
    { id: 16, name: "Zerstörung", cost: 10, description: "Klickkraft +50%", type: 'click_mult', value: 0.50, x: 0, y: -560, requirements: [14, 15] },

    { id: 17, name: "Tödliche Augen", cost: 5, description: "Krit-Chance +5%", type: 'crit_chance', value: 0.05, x: -240, y: -400, requirements: [9] },
    { id: 18, name: "Wahnsinn", cost: 5, description: "Krit-Chance +5%", type: 'crit_chance', value: 0.05, x: 240, y: -400, requirements: [10] },
    { id: 19, name: "Blutrausch I", cost: 8, description: "Krit-Chance +5%", type: 'crit_chance', value: 0.05, x: -240, y: -480, requirements: [17] },
    { id: 20, name: "Blutrausch II", cost: 8, description: "Krit-Chance +5%", type: 'crit_chance', value: 0.05, x: 240, y: -480, requirements: [18] },
    
    { id: 21, name: "Meteorschlag I", cost: 10, description: "Klickkraft +50%", type: 'click_mult', value: 0.50, x: -160, y: -560, requirements: [19] },
    { id: 22, name: "Meteorschlag II", cost: 10, description: "Klickkraft +50%", type: 'click_mult', value: 0.50, x: 160, y: -560, requirements: [20] },

    { id: 23, name: "GÖTTER-FAUST", cost: 50, description: "Klickkraft x5", type: 'click_mult', value: 4.0, x: 0, y: -640, requirements: [16, 21, 22] }, // TIER 2 KEYSTONE
    { id: 24, name: "ONE PUNCH", cost: 250, description: "Klickkraft x20", type: 'click_mult', value: 19.0, x: 0, y: -720, requirements: [23] }, // GOD NODE

    // ==========================================
    // ➡️ OSTEN: Der Pfad der Industrie (Idle)
    // ==========================================
    { id: 25, name: "Sanfte Ströme", cost: 1, description: "SPS +5%", type: 'sps_mult', value: 0.05, x: 80, y: 0, requirements: [0] },
    { id: 26, name: "Ölung", cost: 1, description: "SPS +5%", type: 'sps_mult', value: 0.05, x: 160, y: 0, requirements: [25] },
    
    { id: 27, name: "Skonto I", cost: 1, description: "Kosten -1%", type: 'cost_reduction', value: 0.01, x: 160, y: -80, requirements: [26] },
    { id: 28, name: "Nickerchen I", cost: 1, description: "Offline-Ertrag +5%", type: 'offline_boost', value: 0.05, x: 160, y: 80, requirements: [26] },
    { id: 29, name: "Skonto II", cost: 1, description: "Kosten -2%", type: 'cost_reduction', value: 0.02, x: 240, y: -80, requirements: [27] },
    { id: 30, name: "Nickerchen II", cost: 1, description: "Offline-Ertrag +10%", type: 'offline_boost', value: 0.10, x: 240, y: 80, requirements: [28] },
    { id: 31, name: "Zahnräder", cost: 2, description: "SPS +10%", type: 'sps_mult', value: 0.10, x: 240, y: 0, requirements: [26] },

    { id: 32, name: "INDUSTRIE-WUNDER", cost: 5, description: "Verdoppelt SPS (+100%)", type: 'sps_mult', value: 1.0, x: 320, y: 0, requirements: [29, 30, 31] }, // TIER 1 KEYSTONE

    { id: 33, name: "Großhandel I", cost: 2, description: "Kosten -3%", type: 'cost_reduction', value: 0.03, x: 320, y: -160, requirements: [29] },
    { id: 34, name: "Tiefschlaf I", cost: 2, description: "Offline-Ertrag +15%", type: 'offline_boost', value: 0.15, x: 320, y: 160, requirements: [30] },
    
    // UNLOCK NODE
    { id: 35, name: "SÜßE BEGLEITER", cost: 10, description: "Schaltet den PET-SHOP frei.", type: 'unlock_pets', value: 0, x: 400, y: -160, requirements: [33] },
    
    { id: 36, name: "Tiefschlaf II", cost: 3, description: "Offline-Ertrag +20%", type: 'offline_boost', value: 0.20, x: 400, y: 160, requirements: [34] },
    { id: 37, name: "Farbrikation", cost: 3, description: "SPS +15%", type: 'sps_mult', value: 0.15, x: 400, y: 0, requirements: [32] },

    { id: 38, name: "Expansion I", cost: 5, description: "SPS +20%", type: 'sps_mult', value: 0.20, x: 480, y: -80, requirements: [35, 37] },
    { id: 39, name: "Expansion II", cost: 5, description: "SPS +20%", type: 'sps_mult', value: 0.20, x: 480, y: 80, requirements: [36, 37] },
    { id: 40, name: "Monopol", cost: 10, description: "SPS +25%", type: 'sps_mult', value: 0.25, x: 560, y: 0, requirements: [38, 39] },

    { id: 41, name: "Korruption I", cost: 5, description: "Kosten -4%", type: 'cost_reduction', value: 0.04, x: 400, y: -240, requirements: [33] },
    { id: 42, name: "Koma I", cost: 5, description: "Offline-Ertrag +25%", type: 'offline_boost', value: 0.25, x: 400, y: 240, requirements: [34] },
    { id: 43, name: "Korruption II", cost: 8, description: "Kosten -5%", type: 'cost_reduction', value: 0.05, x: 480, y: -240, requirements: [41] },
    { id: 44, name: "Koma II", cost: 8, description: "Offline-Ertrag +30%", type: 'offline_boost', value: 0.30, x: 480, y: 240, requirements: [42] },

    { id: 45, name: "Weltmarkt I", cost: 10, description: "SPS +30%", type: 'sps_mult', value: 0.30, x: 560, y: -160, requirements: [43] },
    { id: 46, name: "Weltmarkt II", cost: 10, description: "SPS +30%", type: 'sps_mult', value: 0.30, x: 560, y: 160, requirements: [44] },

    { id: 47, name: "KAPITALISMUS", cost: 50, description: "SPS x5", type: 'sps_mult', value: 4.0, x: 640, y: 0, requirements: [40, 45, 46] }, // TIER 2 KEYSTONE
    { id: 48, name: "UNENDLICHER PROFIT", cost: 250, description: "SPS x20", type: 'sps_mult', value: 19.0, x: 720, y: 0, requirements: [47] }, // GOD NODE

    // ==========================================
    // ⬇️ SÜDEN: Der Pfad der Synergie (Gilden)
    // ==========================================
    { id: 49, name: "Kooperation I", cost: 1, description: "Globale Macht +2%", type: 'global_mult', value: 0.02, x: 0, y: 80, requirements: [0] },
    { id: 50, name: "Kooperation II", cost: 1, description: "Globale Macht +3%", type: 'global_mult', value: 0.03, x: 0, y: 160, requirements: [49] },
    
    { id: 51, name: "Schwarmgeist I", cost: 1, description: "Klickkraft +5%", type: 'click_mult', value: 0.05, x: -80, y: 160, requirements: [50] },
    { id: 52, name: "Gruppenzwang I", cost: 1, description: "SPS +5%", type: 'sps_mult', value: 0.05, x: 80, y: 160, requirements: [50] },
    { id: 53, name: "Schwarmgeist II", cost: 1, description: "Klickkraft +10%", type: 'click_mult', value: 0.10, x: -80, y: 240, requirements: [51] },
    { id: 54, name: "Gruppenzwang II", cost: 1, description: "SPS +10%", type: 'sps_mult', value: 0.10, x: 80, y: 240, requirements: [52] },
    { id: 55, name: "Zusammenhalt", cost: 2, description: "Globale Macht +5%", type: 'global_mult', value: 0.05, x: 0, y: 240, requirements: [50] },

    // UNLOCK NODE
    { id: 56, name: "IMPERIUM", cost: 5, description: "Schaltet das GILDEN-SYSTEM frei.", type: 'unlock_guilds', value: 0, x: 0, y: 320, requirements: [53, 54, 55] }, // TIER 1 KEYSTONE

    { id: 57, name: "Allianz I", cost: 2, description: "Globale Macht +5%", type: 'global_mult', value: 0.05, x: -160, y: 320, requirements: [53] },
    { id: 58, name: "Pakt I", cost: 2, description: "Globale Macht +5%", type: 'global_mult', value: 0.05, x: 160, y: 320, requirements: [54] },
    { id: 59, name: "Allianz II", cost: 3, description: "Globale Macht +10%", type: 'global_mult', value: 0.10, x: -160, y: 400, requirements: [57] },
    { id: 60, name: "Pakt II", cost: 3, description: "Globale Macht +10%", type: 'global_mult', value: 0.10, x: 160, y: 400, requirements: [58] },
    { id: 61, name: "Blutspakt", cost: 3, description: "Globale Macht +10%", type: 'global_mult', value: 0.10, x: 0, y: 400, requirements: [56] },

    { id: 62, name: "Architektur I", cost: 5, description: "Gebäude-Synergie +0.1%", type: 'building_synergy', value: 0.001, x: -80, y: 480, requirements: [59, 61] },
    { id: 63, name: "Architektur II", cost: 5, description: "Gebäude-Synergie +0.1%", type: 'building_synergy', value: 0.001, x: 80, y: 480, requirements: [60, 61] },
    { id: 64, name: "Metropolis", cost: 10, description: "Gebäude-Synergie +0.2%", type: 'building_synergy', value: 0.002, x: 0, y: 560, requirements: [62, 63] },

    { id: 65, name: "Sekte I", cost: 5, description: "Globale Macht +15%", type: 'global_mult', value: 0.15, x: -240, y: 400, requirements: [57] },
    { id: 66, name: "Kult I", cost: 5, description: "Globale Macht +15%", type: 'global_mult', value: 0.15, x: 240, y: 400, requirements: [58] },
    { id: 67, name: "Sekte II", cost: 8, description: "Globale Macht +20%", type: 'global_mult', value: 0.20, x: -240, y: 480, requirements: [65] },
    { id: 68, name: "Kult II", cost: 8, description: "Globale Macht +20%", type: 'global_mult', value: 0.20, x: 240, y: 480, requirements: [66] },

    { id: 69, name: "Weltwunder I", cost: 10, description: "Gebäude-Synergie +0.3%", type: 'building_synergy', value: 0.003, x: -160, y: 560, requirements: [67] },
    { id: 70, name: "Weltwunder II", cost: 10, description: "Gebäude-Synergie +0.3%", type: 'building_synergy', value: 0.003, x: 160, y: 560, requirements: [68] },

    { id: 71, name: "LEGION", cost: 50, description: "Globale Macht x5", type: 'global_mult', value: 4.0, x: 0, y: 640, requirements: [64, 69, 70] }, // TIER 2 KEYSTONE
    { id: 72, name: "WELTHERRSCHAFT", cost: 250, description: "Globale Macht x20", type: 'global_mult', value: 19.0, x: 0, y: 720, requirements: [71] }, // GOD NODE

    // ==========================================
    // ⬅️ WESTEN: Der Pfad der Zeit (Prestige & Mine)
    // ==========================================
    { id: 73, name: "Zeitschleife I", cost: 1, description: "Prestige-Effizienz +1%", type: 'prestige_efficiency', value: 0.01, x: -80, y: 0, requirements: [0] },
    { id: 74, name: "Zeitschleife II", cost: 1, description: "Prestige-Effizienz +1%", type: 'prestige_efficiency', value: 0.01, x: -160, y: 0, requirements: [73] },
    
    { id: 75, name: "Sparfuchs I", cost: 1, description: "Kosten -1%", type: 'cost_reduction', value: 0.01, x: -160, y: -80, requirements: [74] },
    { id: 76, name: "Geiz I", cost: 1, description: "Kosten -1%", type: 'cost_reduction', value: 0.01, x: -160, y: 80, requirements: [74] },
    { id: 77, name: "Sparfuchs II", cost: 1, description: "Kosten -2%", type: 'cost_reduction', value: 0.02, x: -240, y: -80, requirements: [75] },
    { id: 78, name: "Geiz II", cost: 1, description: "Kosten -2%", type: 'cost_reduction', value: 0.02, x: -240, y: 80, requirements: [76] },
    { id: 79, name: "Erinnerung", cost: 2, description: "Prestige-Effizienz +2%", type: 'prestige_efficiency', value: 0.02, x: -240, y: 0, requirements: [74] },

    // UNLOCK NODE
    { id: 80, name: "TIEFBAU", cost: 5, description: "Schaltet die DIAMANTEN-MINE frei.", type: 'unlock_mine', value: 0, x: -320, y: 0, requirements: [77, 78, 79] }, // TIER 1 KEYSTONE

    { id: 81, name: "Raffgier I", cost: 2, description: "Kosten -3%", type: 'cost_reduction', value: 0.03, x: -320, y: -160, requirements: [77] },
    { id: 82, name: "Schatzsuche I", cost: 2, description: "Kosten -3%", type: 'cost_reduction', value: 0.03, x: -320, y: 160, requirements: [78] },
    { id: 83, name: "Raffgier II", cost: 3, description: "Kosten -4%", type: 'cost_reduction', value: 0.04, x: -400, y: -160, requirements: [81] },
    { id: 84, name: "Schatzsuche II", cost: 3, description: "Kosten -4%", type: 'cost_reduction', value: 0.04, x: -400, y: 160, requirements: [82] },
    { id: 85, name: "Déjà-vu", cost: 3, description: "Prestige-Effizienz +5%", type: 'prestige_efficiency', value: 0.05, x: -400, y: 0, requirements: [80] },

    { id: 86, name: "Gedankensprung I", cost: 5, description: "Prestige-Effizienz +10%", type: 'prestige_efficiency', value: 0.10, x: -480, y: -80, requirements: [83, 85] },
    { id: 87, name: "Gedankensprung II", cost: 5, description: "Prestige-Effizienz +10%", type: 'prestige_efficiency', value: 0.10, x: -480, y: 80, requirements: [84, 85] },
    { id: 88, name: "Allwissenheit", cost: 10, description: "Prestige-Effizienz +15%", type: 'prestige_efficiency', value: 0.15, x: -560, y: 0, requirements: [86, 87] },

    { id: 89, name: "Gier I", cost: 5, description: "Kosten -5%", type: 'cost_reduction', value: 0.05, x: -400, y: -240, requirements: [81] },
    { id: 90, name: "Goldrausch I", cost: 5, description: "Kosten -5%", type: 'cost_reduction', value: 0.05, x: -400, y: 240, requirements: [82] },
    { id: 91, name: "Gier II", cost: 8, description: "Kosten -6%", type: 'cost_reduction', value: 0.06, x: -480, y: -240, requirements: [89] },
    { id: 92, name: "Goldrausch II", cost: 8, description: "Kosten -6%", type: 'cost_reduction', value: 0.06, x: -480, y: 240, requirements: [90] },

    { id: 93, name: "Erleuchtung I", cost: 10, description: "Prestige-Effizienz +20%", type: 'prestige_efficiency', value: 0.20, x: -560, y: -160, requirements: [91] },
    { id: 94, name: "Erleuchtung II", cost: 10, description: "Prestige-Effizienz +20%", type: 'prestige_efficiency', value: 0.20, x: -560, y: 160, requirements: [92] },

    { id: 95, name: "ZEIT-MEISTER", cost: 50, description: "Prestige-Effizienz +100%", type: 'prestige_efficiency', value: 1.0, x: -640, y: 0, requirements: [88, 93, 94] }, // TIER 2 KEYSTONE
    { id: 96, name: "OMNIPRÄSENZ", cost: 250, description: "Prestige-Effizienz +500%", type: 'prestige_efficiency', value: 5.0, x: -720, y: 0, requirements: [95] }, // GOD NODE

    // ==========================================
    // 🌌 OUTER RING (Die Brücken der Götter)
    // ==========================================
    
    { id: 97, name: "ZEIT & RAUM", cost: 150, description: "Globale Macht x3", type: 'global_mult', value: 2.0, x: -480, y: -480, requirements: [23, 95] }, // Verbindet Nord und West
    { id: 98, name: "MASCHINEN-GOTT", cost: 150, description: "SPS x5", type: 'sps_mult', value: 4.0, x: 480, y: -480, requirements: [23, 47] }, // Verbindet Nord und Ost
    { id: 99, name: "PERFEKTE HARMONIE", cost: 150, description: "Gebäude-Synergie +0.5%", type: 'building_synergy', value: 0.005, x: 480, y: 480, requirements: [47, 71] }, // Verbindet Ost und Süd
    { id: 100, name: "TIEFE SYNERGIE", cost: 150, description: "Kosten -20%", type: 'cost_reduction', value: 0.20, x: -480, y: 480, requirements: [71, 95] }, // Verbindet Süd und West
    
];

/* ======================================================= */
/* 4. PET SYSTEM DATA                                     */
/* ======================================================= */
const petsData = [
    { id: 'pet_rock', name:'Haus-Stein', icon: '🪨', description: 'Er tut nichts, aber er motiviert dich. +% % Klick-Stärke.', effectType: 'click_mult', baseEffect: 0.10, costGrowth: 1.5, levelCost: 5, maxLevel: 10 },
    { id: 'pet_dog', name:'Bello', icon: '🐶', description: 'Er bellt Kunden an. Klickt automatisch %x pro Sekunde.', effectType: 'auto_click', baseEffect: 1, costGrowth: 1.8, levelCost: 15, maxLevel: 5 },
    { id: 'pet_cat', name: 'Manager-Katze', icon: '😼', description: 'Sie beurteilt deine Arbeit. +% % auf gesamte SPS Produktion.', effectType: 'sps_mult', baseEffect: 0.05,costGrowth: 2.0, levelCost: 25, maxLevel: 20},
    { id: 'pet_dragon', name: 'Gold-Drache', icon: '🐉', description: 'Hortet Schätze. Genäude somd % % billiger.', effectType: 'cost_reduction_buildings', baseEffect: 0.02, costGrowth: 2.5, levelCost: 100, maxLevel: 100},
];

/* ======================================================= */
/* 5. DIAMOND SHOP & GILDEN                               */
/* ======================================================= */

// ================================================================================================================
// === DIAMANTEN SHOP UPGRADES (10 Slots) ===
// ================================================================================================================
const diamondShopUpgrades = [
    // --- BASIS UPGRADES (ID 0-3) ---
    { id: 0, name: "Diamanten-Hände", description: "Permanent 10x mehr Klickkraft (Multiplikativ).", cost: 250, value: 10, type: "click_mult_static", maxPurchases: 1 },
    { id: 1, name: "SPS-Kompressor", description: "Verdoppelt deine gesamte SPS (x2).", cost: 500, value: 1, type: "sps_mult_static", maxPurchases: 1 },
    { id: 2, name: "Prestige-Beschleuniger", description: "Erhöht Prestige-Punkte-Effektivität um +5%.", cost: 1000, value: 0.05, type: "prestige_point_eff", maxPurchases: 5 },
    { id: 3, name: "Automatisierte Mine", description: "Die Mine produziert passiv 10% Ertrag/Sek.", cost: 2500, value: 1, type: "auto_diamond_mine", maxPurchases: 1 },
    { id: 4, name: "Kritische Linse", description: "+5% Chance auf Kritische Treffer beim Klicken.", cost: 1500, value: 0.05, type: "crit_chance", maxPurchases: 10 },
    { id: 5, name: "Kritischer Verstärker", description: "Erhöht den Schaden kritischer Treffer um +200%.", cost: 3000, value: 2.0, type: "crit_damage", maxPurchases: 5 },
    { id: 6, name: "Diamant-Bohrer", description: "Erhöht den Ertrag des Minigames um +25%.", cost: 4000, value: 0.25, type: "mine_boost", maxPurchases: 4 },
    { id: 7, name: "Effiziente Architektur", description: "Reduziert ALLE Gebäudekosten um 2%.", cost: 6000, value: 0.02, type: "cost_reduction_global", maxPurchases: 10 },
    { id: 8, name: "Synergie-Matrix", description: "Addiert 1% deiner SPS zu deinem Klick-Schaden.", cost: 15000, value: 0.01, type: "click_sps_link", maxPurchases: 5 },
    { id: 9, name: "Göttliche Energie", description: "Ein extrem starker x1.5 Multiplikator auf ALLES.", cost: 100000, value: 0.5, type: "global_god_mode", maxPurchases: 1 },
];

/* ======================================================= */
/* 5. ACHIEVEMENT SYSTEM (MEILENSTEINE)                   */
/* ======================================================= */

const achievementsData = [
    // =========================================================================
    // 🖱️ KATEGORIE: KLICKER (Aktives Spielen)
    // =========================================================================
    { id: 0, name: "Klick-Anfänger", description: "Klicke 1.000 Mal.", requirement: { type: 'total_clicks', value: 1000 }, bonus: { type: 'click_mult', value: 0.10 }, color: '#4CAF50' },
    { id: 1, name: "Finger aus Stahl", description: "Klicke 10.000 Mal.", requirement: { type: 'total_clicks', value: 10000 }, bonus: { type: 'click_mult', value: 0.20 }, color: '#009ffd' }, // Wert korrigiert auf 10k
    { id: 2, name: "Maus-Zerstörer", description: "Klicke 50.000 Mal.", requirement: { type: 'total_clicks', value: 50000 }, bonus: { type: 'click_mult', value: 0.50 }, color: '#ff5252' },
    { id: 3, name: "Finger Gottes", description: "Klicke 100.000 Mal.", requirement: { type: 'total_clicks', value: 100000 }, bonus: { type: 'click_mult', value: 2.0 }, color: '#FFD700' },
    { id: 4, name: "Scharfschütze", description: "Erreiche 25% Kritische Trefferchance.", requirement: { type: 'crit_chance_reach', value: 0.25 }, bonus: { type: 'click_mult', value: 0.15 }, color: '#607d8b' },
    { id: 5, name: "Kritischer Meister", description: "Erreiche 50% Kritische Trefferchance.", requirement: { type: 'crit_chance_reach', value: 0.50 }, bonus: { type: 'click_mult', value: 1.0 }, color: '#9c27b0' },
    
    // =========================================================================
    // 💰 KATEGORIE: SAMMLER (Lifetime Smileys)
    // =========================================================================
    { id: 6, name: "Der erste Tausender", description: "Sammle 1.000 Smileys.", requirement: { type: 'lifetime_smileys', value: 1000 }, bonus: { type: 'sps_mult', value: 0.05 }, color: '#4CAF50' },
    { id: 7, name: "Millionär", description: "Sammle 1 Million Smileys.", requirement: { type: 'lifetime_smileys', value: 1000000 }, bonus: { type: 'prestige_efficiency', value: 0.05 }, color: '#009ffd' },
    { id: 8, name: "Milliardär", description: "Sammle 1 Milliarde Smileys.", requirement: { type: 'lifetime_smileys', value: 1000000000 }, bonus: { type: 'sps_mult', value: 0.20 }, color: '#9c27b0' },
    { id: 9, name: "Trillionär", description: "Sammle 1 Trillion Smileys.", requirement: { type: 'lifetime_smileys', value: 1000000000000 }, bonus: { type: 'prestige_efficiency', value: 0.20 }, color: '#e040fb' },
    { id: 10, name: "Quadrillionär", description: "Sammle 1 Quadrillion Smileys.", requirement: { type: 'lifetime_smileys', value: 1000000000000000 }, bonus: { type: 'sps_mult', value: 1.0 }, color: '#FFD700' },
    { id: 11, name: "DAS ENDE?", description: "Sammle 1 Quintillion Smileys.", requirement: { type: 'lifetime_smileys', value: 1000000000000000000 }, bonus: { type: 'global_mult', value: 5.0 }, color: '#000000' },

    // =========================================================================
    // 🏭 KATEGORIE: INDUSTRIE (Gebäude & SPS)
    // =========================================================================
    { id: 12, name: "Aller Anfang", description: "Besitze 10 Auto-Klicker.", requirement: { type: 'building_count', target: 0, value: 10 }, bonus: { type: 'sps_mult', value: 0.05 }, color: '#4CAF50' },
    { id: 13, name: "Bauarbeiter", description: "Besitze insgesamt 50 Gebäude.", requirement: { type: 'total_buildings', value: 50 }, bonus: { type: 'cost_reduction_global', value: 0.01 }, color: '#009ffd' },
    { id: 14, name: "Stadtplaner", description: "Besitze insgesamt 250 Gebäude.", requirement: { type: 'total_buildings', value: 250 }, bonus: { type: 'cost_reduction_global', value: 0.02 }, color: '#8d6e63' },
    { id: 15, name: "Architekt", description: "Besitze insgesamt 600 Gebäude.", requirement: { type: 'total_buildings', value: 600 }, bonus: { type: 'cost_reduction_global', value: 0.03 }, color: '#8d6e63' },
    { id: 16, name: "Metropolis", description: "Besitze insgesamt 1.500 Gebäude.", requirement: { type: 'total_buildings', value: 1500 }, bonus: { type: 'cost_reduction_global', value: 0.05 }, color: '#FFD700' }, // 1500 statt 15000 (Tippfehler)
    { id: 17, name: "Industrie-Boss", description: "Besitze 50 Fabriken.", requirement: { type: 'building_count', target: 2, value: 50 }, bonus: { type: 'sps_mult', value: 0.10 }, color: '#607d8b' }, // Target war falsch (Fabrik ist 2)
    { id: 18, name: "High-Tech", description: "Besitze 50 Dimensionsportale.", requirement: { type: 'building_count', target: 7, value: 50 }, bonus: { type: 'sps_mult', value: 0.15 }, color: '#607d8b' }, // Alien Labor gab es nicht, auf Portal geändert
    { id: 19, name: "Zeit-Herrscher", description: "Besitze 100 Zeitmaschinen.", requirement: { type: 'building_count', target: 8, value: 100 }, bonus: { type: 'prestige_efficiency', value: 0.25 }, color: '#e040fb' }, // Target war falsch (Zeitmaschine ist 8)
    { id: 20, name: "Fließbandarbeit", description: "Erreiche 100 Smileys pro Sekunde.", requirement: { type: 'sps_reach', value: 100 }, bonus: { type: 'sps_mult', value: 0.05 }, color: '#4CAF50' },
    { id: 21, name: "Produktions-Gigant", description: "Erreiche 1 Million SPS.", requirement: { type: 'sps_reach', value: 1000000 }, bonus: { type: 'sps_mult', value: 0.20 }, color: '#4CAF50' },
    { id: 22, name: "Lichtgeschwindigkeit", description: "Erreiche 1 Milliarde SPS.", requirement: { type: 'sps_reach', value: 1000000000 }, bonus: { type: 'sps_mult', value: 0.50 }, color: '#e040fb' },
    { id: 23, name: "Warp-Antrieb", description: "Erreichen 1 Billion SPS.", requirement: { type: 'sps_reach', value: 1000000000000 }, bonus: { type: 'sps_mult', value: 1.0 }, color: '#FFD700' },

    // =========================================================================
    // 🟣 KATEGORIE: PRESTIGE (Zeit & Raum)
    // =========================================================================
    { id: 24, name: "Neuanfang", description: "Führe deinen ersten Prestige-Reset durch.",  requirement: { type: 'prestige_count', value: 1 }, bonus: { type: 'global_mult', value: 0.10 }, color: '#4CAF50' },
    { id: 25, name: "Zeitschleife I", description: "Führe 5 Prestige-Resets durch.", requirement: { type: 'prestige_count', value: 5 }, bonus: { type: 'prestige_efficiency', value: 0.10 }, color: '#4CAF50' },
    { id: 26, name: "Zeitschleife 2", description: "Führe 10 Prestige-Resets durch.", requirement: { type: 'prestige_count', value: 10 }, bonus: { type: 'global_mult', value: 0.20 }, color: '#009ffd' },
    { id: 27, name: "Zeitschleife 3", description: "Führe 25 Prestige-Resets durch.", requirement: { type: 'prestige_count', value: 25 }, bonus: { type: 'global_mult', value: 0.50 }, color: '#009ffd' }, // requirement type korrigiert
    { id: 28, name: "Punktesammler", description: "Besitze 10.000 Prestige-Punkte (auf der Hand).", requirement: { type: 'prestige_points_held', value: 10000 }, bonus: { type: 'global_mult', value: 0.05 }, color: '#009ffd' }, // String zu Nummer korrigiert
    { id: 29, name: "Prestige-Gott", description: "Besitze 1 Million Prestige-Punkte.", requirement: { type: 'prestige_points_held', value: 1000000 }, bonus: { type: 'prestige_efficiency', value: 1.0 }, color: '#FFD700' }, // String zu Nummer korrigiert

    // =========================================================================
    // 💎 KATEGORIE: REICHTUM (Diamanten)
    // =========================================================================
    { id: 30, name: "Minen-Besitzer", description: "Schalte die Diamanten-Mine frei.", requirement: { type: 'building_count', target: 15, value: 1 }, bonus: { type: 'sps_mult', value: 0.10 }, color: '#00bcd4' }, // Target war 8, Mine ist aber 15 (unique)
    { id: 31, name: "Schatzsucher I", description: "Besitze 100 Diamanten gleichzeitig.", requirement: { type: 'diamond_count', value: 100 }, bonus: { type: 'sps_mult', value: 0.05 }, color: '#00bcd4' },
    { id: 32, name: "Schatzsucher II", description: "Besitze 1.000 Diamanten gleichzeitig.", requirement: { type: 'diamond_count', value: 1000 }, bonus: { type: 'click_mult', value: 0.25 }, color: '#00bcd4' },
    { id: 33, name: "Schatzsucher III", description: "Besitze 10.000 Diamanten gleichzeitig.", requirement: { type: 'diamond_count', value: 10000 }, bonus: { type: 'global_mult', value: 0.10 }, color: '#00bcd4' },

    // =========================================================================
    // ⚔️ KATEGORIE: GILDEN (Gemeinschaft)
    // =========================================================================
    { id: 34, name: "Gilden-Gründer", description: "Gründe eine Gilde oder tritt bei.", requirement: { type: 'guild_joined', value: true }, bonus: { type: 'global_mult', value: 0.05 }, color: '#8d6e63' },
    { id: 35, name: "Gilden-Level I", description: "Erreichen Gilden-Level 2.", requirement: { type: 'guild_level', value: 2 }, bonus: { type: 'sps_mult', value: 0.10 }, color: '#ff9800' },
    { id: 36, name: "Gilden-Level II", description: "Erreichen Gilden-Level 5.", requirement: { type: 'guild_level', value: 5 }, bonus: { type: 'global_mult', value: 0.15 }, color: '#ff9800' },
    { id: 37, name: "Gilden-Level III", description: "Erreichen Gilden-Level 10.", requirement: { type: 'guild_level', value: 10 }, bonus: { type: 'global_mult', value: 0.25 }, color: '#ff9800' },
    { id: 38, name: "Gilden-Level IV", description: "Erreichen Gilden-Level 20.", requirement: { type: 'guild_level', value: 20 }, bonus: { type: 'global_mult', value: 0.50 }, color: '#ff9800' },
    { id: 39, name: "Gilden-Level V", description: "Erreichen Gilden-Level 50.", requirement: { type: 'guild_level', value: 50 }, bonus: { type: 'global_mult', value: 2.0 }, color: '#FFD700' },

    // =========================================================================
    // 🎭 KATEGORIE: GEHEIMNISSE (Artefakte & Schwarzmarkt)
    // =========================================================================
    { id: 40, name: "Erster Fund", description: "Finde dein erstes Artefakt in der Mine.", requirement: { type: 'artifact_count', value: 1 }, bonus: { type: 'mine_boost', value: 0.10 }, color: '#9c27b0' },
    { id: 41, name: "Museums-Direktor", description: "Sammle 5 verschiedene Artefakte.", requirement: { type: 'artifact_count', value: 5 }, bonus: { type: 'sps_mult', value: 0.10 }, color: '#9c27b0' },
    { id: 42, name: "Dunkle Geschäfte", description: "Kaufe dein erstes Upgrade auf dem Schwarzmarkt.", requirement: { type: 'blackmarket_purchases', value: 1 }, bonus: { type: 'click_mult', value: 0.25 }, color: '#ea80fc' },
    // =========================================================================
    // 🛡️ KATEGORIE: SÖLDNER (Gilden-Quests)
    // =========================================================================
    { id: 43, name: "Die Truppe wächst", description: "Heuere deinen zweiten Söldner an.", requirement: { type: 'mercenary_count', value: 2 }, bonus: { type: 'global_mult', value: 0.05 }, color: '#ff9800' },
    { id: 44, name: "Erfahrener Held", description: "Level einen Söldner auf Stufe 5.", requirement: { type: 'mercenary_level', value: 5 }, bonus: { type: 'sps_mult', value: 0.15 }, color: '#ff9800' }
];

const GUILD_DATA = {
    mercenaryClasses: {
        fighter: { name: "Kämpfer", icon: "⚔️", description: "Spezialist für gefährliche Monsterjagd-Quests.",baseBonus: 0.20, levelScaling: 0.02},
        scout: { name: "Späher", icon: "🏹", description: "Findet schneller seltene Artefakte und Relikte.",baseBonus: 0.50, levelScaling: 0.03},
        miner: { name: "Bergbauer", icon: "⛏️", description: "Spezialisiert auf die Gewinnung von Diamanten.", baseBonus: 0.20, levelScaling: 0.02},
    
    questPool: [
        { id: "monster_hunt_1", name: "Schleim-Plage beseitgen", duration: 300, requiredClass: "fighter", difficulty: 1, rewards: { guildXP: 50, mercXP: 100, smileys: 10000, diamonds: 2, gems: 0 } },
        { id: "expedition_ruins", name: "Expedition zu den alten Tempeln", duration: 900, requiredClass: "scout", difficulty: 2, rewards: { guildXP: 150, mercXP: 300, smileys: 50000, diamonds: 5, gems: 1 } },
        { id: "deep_core_mining", name: "Abbau im Erdkern", duration: 1800, requiredClass: "miner", difficulty: 3, rewards: { guildXP: 400, mercXP: 800, smileys: 250000, diamonds: 15, gems: 3 } },
    ],
}};

const guildQuestData = {
    locations: ["den Emoji-Wald", "die Pixel-Mine", "den Lach-Palast", "den Daten-Strom", "die Schatten-Ebene", "das Void-Portal", "den Gold-Tempel", "die Server-Farm"],
    actions: ["säubern", "erkunden", "bewachen", "reparieren", "infiltrieren", "plündern", "verteidigen", "analysieren"],
    classes: {
        fighter: { name: "Kämpfer", icon: "⚔️", bonusText: "-20% Quest-Dauer" },
        scout: { name: "Späher", icon: "🏹", bonusText: "+50% Gilden-XP" },
        miner: { name: "Bergbauer", icon: "⛏️", bonusText: "+20% Diamanten/Gems" }
    }
};
/* ======================================================= */
/* 7. ARTEFAKTE (MUSEUM)                                   */
/* ======================================================= */

const artifactsData = [
    { id: 'art_coin', name: 'Antike Münze', desc: '+5% Globaler SPS Bonus', rarity: 'common', bonusType: 'sps_mult', value: 0.05 },
    { id: 'art_fossil', name: 'Versteinerter Smiley', desc: '+10% Klick-Stärke', rarity: 'common', bonusType: 'click_mult', value: 0.10 },
    { id: 'art_compass', name: 'Rostiger Kompass', desc: '+2% Prestige Punkte', rarity: 'rare', bonusType: 'prestige_efficiency', value: 0.02 },
    { id: 'art_pickaxe', name: 'Goldene Spitzhacke', desc: '-10% Minen-Upgrade Kosten', rarity: 'rare', bonusType: 'mine_cost', value: 0.10 },
    { id: 'art_crystal', name: 'Mana Kristall', desc: '-5% Cooldown für Skills', rarity: 'epic', bonusType: 'cooldown_red', value: 0.05 },
    { id: 'art_crown', name: 'Krone des Gierigen', desc: 'Verdoppelt alle Offline-Einnahmen', rarity: 'legendary', bonusType: 'offline_boost', value: 1.0 },
    
    // --- NEUE LATEGAME ARTEFAKTE ---
    { id: 'art_void', name: 'Splitter der Leere', desc: 'Kosmischer Rabatt (-3% Kosten auf ALLES)', rarity: 'epic', bonusType: 'cost_reduction_global', value: 0.03 },
    { id: 'art_core', name: 'Leuchtender Erdkern', desc: 'Gewaltige Hitze (+50% Klick-Stärke)', rarity: 'legendary', bonusType: 'click_mult', value: 0.50 }
];

/* ======================================================= */
/* GILDEN-PROJEKTE (UPGRADES)                              */
/* ======================================================= */
const guildUpgradesData = 
{ 'guild_sps': {
        name: "Synergie-Netzwerk", desc: "+1% SPS Produktion für alle Mitglieder.", baseCost: 1000000000, costFactor: 1.8, bonusPerLevel: 0.01, icon: "⚡" },
  'guild_click': {
        name: "Schwarm-Intelligenz", desc: "+2% Klick-Stärke für alle Mitglieder.", baseCost: 500000000, costFactor: 1.8, bonusPerLevel: 0.02, icon: "👆" },
  'guild_mercs': {
        name: "Elite-Ausbildung", desc: "Söldner erhalten +2% mehr XP.", baseCost: 5000000000, costFactor: 2.0, bonusPerLevel: 0.02, icon: "⚔️" },
};

// =========================================================
// GLOBALER ZUGRIFF: SÖLDNER TALENTE
// =========================================================
const MERCENARY_TALENTS = {
    fighter: {
        level5: [
            { id: 'berserker', name: 'Berserker', icon: '🪓', desc: 'Missionszeit -15%', value: 0.85, type: 'time' },
            { id: 'bodyguard', name: 'Leibwächter', icon: '🛡️', desc: 'Risiko -25%', value: 0.75, type: 'risk' }
        ],
        level10: [
            { id: 'commander', name: 'Kommandant', icon: '🚩', desc: 'Gilden-XP +50%', value: 1.5, type: 'gxp' },
            { id: 'veteran', name: 'Veteran', icon: '🎖️', desc: 'Söldner-XP +30%', value: 1.3, type: 'mxp' }
        ]
    },
    miner: {
        level5: [
            { id: 'geologist', name: 'Geologe', icon: '🔍', desc: 'Smaragd-Chance x2', value: 2.0, type: 'emerald' },
            { id: 'blaster', name: 'Sprengmeister', icon: '🧨', desc: 'Findet öfter TNT/Bohrer', value: 1.5, type: 'tools' }
        ],
        level10: [
            { id: 'deep_miner', name: 'Tiefengräber', icon: '🚇', desc: 'Diamanten +50%', value: 1.5, type: 'diamonds' },
            { id: 'corrupted_miner', name: 'Void-Gräber', icon: '👾', desc: 'Corrupted Gems +30%', value: 1.3, type: 'gems' }
        ]
    },
    scout: {
        level5: [
            { id: 'runner', name: 'Eilbote', icon: '🏃', desc: 'Missionszeit -20%', value: 0.8, type: 'time' },
            { id: 'merchant', name: 'Händler', icon: '💰', desc: 'Smileys +40%', value: 1.4, type: 'gold' }
        ],
        level10: [
            { id: 'diplomat', name: 'Diplomat', icon: '🤝', desc: 'Gilden-XP x2', value: 2.0, type: 'gxp' },
            { id: 'treasure_hunter', name: 'Schatzsucher', icon: '🗺️', desc: 'Höhere Item-Chance', value: 1.25, type: 'items' }
        ]
    }
};