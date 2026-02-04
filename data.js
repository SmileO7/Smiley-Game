/* ======================================================= */
/* 1. GEBÄUDE-DEFINITIONEN (BASE & UNIQUE)                */
/* ======================================================= */

const buildingsData = [
    { name: "Auto-Klicker", basePrice: 20, growthRate: 1.10, baseSPS: 2, prestigeMulti: 1},
    { name: "Smiley-Baum", basePrice: 150, growthRate: 1.12, baseSPS: 12, prestigeMulti: 1}, // Preis hoch, Rate runter
    { name: "Smiley-Fabrik", basePrice: 1200, growthRate: 1.14, baseSPS: 80, prestigeMulti: 1},
    { name: "Smiley-Mine", basePrice: 12000, growthRate: 1.15, baseSPS: 550, prestigeMulti: 1},
    { name: "Smiley-Bohrer", basePrice: 100000, growthRate: 1.15, baseSPS: 3200, prestigeMulti: 1},
    { name: "Smiley-Kernkraftwerk", basePrice: 850000, growthRate: 1.16, baseSPS: 20000, prestigeMulti: 1},
    { name: "Smiley-Galaxie", basePrice: 7500000, growthRate: 1.16, baseSPS: 140000, prestigeMulti: 1},
    { name: "Dimensionsportal", basePrice: 65000000, growthRate: 1.17, baseSPS: 950000, prestigeMulti: 1},
    { name: "Zeitmaschine", basePrice: 500000000, growthRate: 1.17, baseSPS: 6000000, prestigeMulti: 1},
    // Ab hier glätten wir die hohen Raten auf max 1.20 ab:
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

    {
    id: 110,
    name: "Rhythmische Ausdauer",
    description: "Verlängert das Combo-Zeitfenster auf 4 Sekunden.",
    cost: 2500000, // Von 500k auf 2.5M erhöht
    type: 'combo_time',
    value: 4000 
},
{
    id: 111,
    name: "Combo-Limit-Break",
    description: "Erhöht das maximale Combo-Limit auf x5.00!",
    cost: 25000000, // Von 2.5M auf 25M erhöht
    type: 'combo_max',
    value: 5.0
}
];

/* ======================================================= */
/* 3. PRESTIGE SYSTEM (SKILL TREE)                        */
/* ======================================================= */

const prestigeUpgrades = [
    { id: 0, name: "Genesis", cost: 1, description: "Startbonus: +10% passive SPS.", type: 'sps_mult', value: 0.10, x: 0, y: 0, requirements: [] },
    { id: 1, name: "Aktive Finger", cost: 2, description: "Klickkraft +25%.", type: 'click_mult', value: 0.25, x: -100, y: 100, requirements: [0] },
    { id: 2, name: "Passive Macht", cost: 2, description: "SPS +25%.", type: 'sps_mult', value: 0.25, x: 100, y: 100, requirements: [0] },
    
    // --- NEU: Combo Fokus ---
    { id: 15, name: "Combo-Rausch", cost: 5, description: "Die Combo steigt 50% schneller.", type: 'combo_speed', value: 0.50, x: -50, y: 150, requirements: [1] },
    
    { id: 3, name: "Bau-Rabatt", cost: 8, description: "Alle Gebäude sind 5% günstiger.", type: 'cost_reduction', value: 0.05, x: -150, y: 200, requirements: [1] },
    { id: 4, name: "Prestige-Experte", cost: 10, description: "Prestige-Punkte sind 10% effektiver.", type: 'prestige_efficiency', value: 0.10, x: 150, y: 200, requirements: [2] },
    { id: 5, name: "Synergie", cost: 20, description: "Klicks skalieren mit 1% deiner SPS.", type: 'click_sps_ratio', value: 0.01, x: 0, y: 300, requirements: [1, 2] },
    
    { id: 6, name: "Süße Begleiter", cost: 50, description: "Schaltet das PET-SYSTEM frei.", type: 'unlock_pets', value: 0, x: -100, y: 400, requirements: [5] },
    { id: 7, name: "Tiefbau", cost: 50, description: "Schaltet die DIAMANTEN-MINE frei.", type: 'unlock_mine', value: 0, x: 100, y: 400, requirements: [5] },
    
    // --- NEU: Diamanten Fokus ---
    { id: 16, name: "Glitzer-Gier", cost: 75, description: "Minen-Erträge +20%.", type: 'mine_boost', value: 0.20, x: 150, y: 450, requirements: [7] },
    
    { id: 8, name: "Imperium", cost: 150, description: "Schaltet das GILDEN-SYSTEM frei.", type: 'unlock_guilds', value: 0, x: 0, y: 500, requirements: [6, 7] },
    { id: 9, name: "Globaler Reichtum", cost: 400, description: "Verdoppelt deine gesamte SPS-Produktion (x2).", type: 'global_mult', value: 1.0, x: 0, y: 600, requirements: [8] },
    
    // --- NEU: End-Game Combo ---
    { id: 17, name: "Ewige Combo", cost: 750, description: "Combo-Zeitfenster +2 Sekunden.", type: 'combo_time_add', value: 2000, x: -200, y: 650, requirements: [9] },

    { id: 10, name: "Klick-Titan", cost: 1000, description: "Verdreifacht deine Klickkraft (+200%).", type: 'click_mult', value: 2.0, x: -150, y: 700, requirements: [9] },
    { id: 11, name: "Industrie-Gigant", cost: 1000, description: "Verdreifacht deine passive SPS (+200%).", type: 'sps_mult', value: 2.0, x: 150, y: 700, requirements: [9] },
    { id: 12, name: "Massenproduktion", cost: 2500, description: "Reduziert alle Gebäudekosten um weitere 10%.", type: 'cost_reduction', value: 0.10, x: 0, y: 800, requirements: [10, 11] },
    { id: 13, name: "Zeitreise-Meister", cost: 7500, description: "Prestige-Punkte sind 50% effektiver.", type: 'prestige_efficiency', value: 0.50, x: -100, y: 900, requirements: [12] },
    { id: 14, name: "Big Bang", cost: 15000, description: "Multipliziert ALLES mit 5.", type: 'global_mult', value: 4.0, x: 100, y: 900, requirements: [12] }
];

/* ======================================================= */
/* 4. PET SYSTEM DATA                                     */
/* ======================================================= */

const petsData = [
    { 
        id: 'pet_rock', 
        name: 'Haustier-Stein', 
        icon: '🪨', 
        // Hier haben wir ein zweites % eingefügt
        description: 'Er tut nichts, aber er motiviert dich. +% % Klick-Stärke.',
        effectType: 'click_mult', 
        baseEffect: 0.10,         
        costGrowth: 1.5,          
        levelCost: 5,             
        maxLevel: 10              
    },
    { 
        id: 'pet_dog', 
        name: 'Büro-Hund', 
        icon: '🐶', 
        // Hier lassen wir es so, weil "1.0x" (Mal) Sinn macht
        description: 'Er bellt Kunden an. Klickt automatisch %x pro Sekunde.',
        effectType: 'auto_click', 
        baseEffect: 1,            
        costGrowth: 1.8,
        levelCost: 15,
        maxLevel: 5
    },
    { 
        id: 'pet_cat', 
        name: 'Manager-Katze', 
        icon: '😼', 
        // Hier auch ein zweites %
        description: 'Sie beurteilt deine Arbeit. +% % auf gesamte SPS Produktion.',
        effectType: 'sps_mult',   
        baseEffect: 0.05,         
        costGrowth: 2.0,
        levelCost: 25,
        maxLevel: 20
    },
    { 
        id: 'pet_dragon', 
        name: 'Gold-Drache', 
        icon: '🐉', 
        // Und hier auch
        description: 'Hortet Schätze. Gebäude sind % % billiger.',
        effectType: 'cost_reduction_buildings', 
        baseEffect: 0.02,         
        costGrowth: 2.5,
        levelCost: 100,
        maxLevel: 10
    }
];

/* ======================================================= */
/* 5. DIAMOND SHOP & GILDEN                               */
/* ======================================================= */

// ================================================================================================================
// === DIAMANTEN SHOP UPGRADES (10 Slots) ===
// ================================================================================================================
const diamondShopUpgrades = [
    // --- BASIS UPGRADES (ID 0-3) ---
    {
        id: 0,
        name: "Diamant-Hände",
        description: "Permanent 10x mehr Klickkraft (Multiplikativ).",
        cost: 250,
        value: 10, // Achtung: Hier 'value' statt 'effect' nutzen für Einheitlichkeit
        type: "click_mult_static",
        maxPurchases: 1
    },
    {
        id: 1,
        name: "SPS-Kompressor",
        description: "Verdoppelt die gesamte SPS permanent (x2).",
        cost: 500,
        value: 1, // +100% = x2
        type: "sps_mult_static",
        maxPurchases: 1
    },
    {
        id: 2,
        name: "Prestige-Beschleuniger",
        description: "Erhöht Prestige-Punkte-Effektivität um +5%.",
        cost: 1000,
        value: 0.05,
        type: "prestige_point_eff",
        maxPurchases: 5
    },
    {
        id: 3,
        name: "Automatisierte Mine",
        description: "Die Mine produziert passiv 10% Ertrag/Sek.",
        cost: 2500,
        value: 1,
        type: "auto_diamond_mine",
        maxPurchases: 1
    },

    // --- NEUE MECHANIKEN (ID 4-9) ---
    {
        id: 4,
        name: "Kritische Linse",
        description: "+5% Chance auf Kritische Treffer beim Klicken.",
        cost: 150,
        value: 0.05,
        type: "crit_chance",
        maxPurchases: 10 // Max 50% Chance
    },
    {
        id: 5,
        name: "Kritischer Verstärker",
        description: "Erhöht den Schaden kritischer Treffer um +200%.",
        cost: 300,
        value: 2.0,
        type: "crit_damage",
        maxPurchases: 5
    },
    {
        id: 6,
        name: "Diamant-Bohrer",
        description: "Erhöht den Ertrag des Minigames um +25%.",
        cost: 400,
        value: 0.25,
        type: "mine_boost",
        maxPurchases: 4 // Max +100% (Verdopplung)
    },
    {
        id: 7,
        name: "Effiziente Architektur",
        description: "Reduziert ALLE Gebäudekosten um 2%.",
        cost: 600,
        value: 0.02,
        type: "cost_reduction_global",
        maxPurchases: 10 // Max -20% Kosten
    },
    {
        id: 8,
        name: "Synergie-Matrix",
        description: "Addiert 1% deiner SPS zu deinem Klick-Schaden.",
        cost: 1500,
        value: 0.01,
        type: "click_sps_link",
        maxPurchases: 5 // Max 5% der SPS pro Klick
    },
    {
        id: 9,
        name: "Göttliche Energie",
        description: "Ein extrem starker x1.5 Multiplikator auf ALLES.",
        cost: 10000,
        value: 0.5,
        type: "global_god_mode",
        maxPurchases: 1
    }
];

// ================================================================================================================
// === GILDEN MITGLIEDER (10 Stufen) ===
// ================================================================================================================
const guildUpgradesData = [
    {
        id: 0,
        name: "Der Novize",
        description: "Kehrt die Halle. +5% SPS.",
        baseCost: 500000, // 500k
        spsMultiplier: 1.05,
        isClickMultiplier: false,
        icon: "🧹"
    },
    {
        id: 1,
        name: "Der Knappe",
        description: "Trägt dein Schwert. +10% Klickkraft.",
        baseCost: 2500000, // 2.5M
        spsMultiplier: 1.10,
        isClickMultiplier: true,
        icon: "⚔️"
    },
    {
        id: 2,
        name: "Der Händler",
        description: "Feilscht gut. -2% Gebäudekosten.",
        baseCost: 10000000, // 10M
        spsMultiplier: 1.0,
        specialEffect: "cost_reduction_2",
        isClickMultiplier: false,
        icon: "⚖️"
    },
    {
        id: 3,
        name: "Der Söldner",
        description: "Kämpft für Gold. +25% Klickkraft.",
        baseCost: 50000000, // 50M
        spsMultiplier: 1.25,
        isClickMultiplier: true,
        icon: "🛡️"
    },
    {
        id: 4,
        name: "Der Barde",
        description: "Singt von Ruhm. +10% Prestige-Punkte.",
        baseCost: 250000000, // 250M
        spsMultiplier: 1.0,
        specialEffect: "prestige_boost_10",
        isClickMultiplier: false,
        icon: "🎵"
    },
    {
        id: 5,
        name: "Der Baumeister",
        description: "Kennt Abkürzungen. -5% Gebäudekosten.",
        baseCost: 1000000000, // 1B
        spsMultiplier: 1.0,
        specialEffect: "cost_reduction_5",
        isClickMultiplier: false,
        icon: "🏗️"
    },
    {
        id: 6,
        name: "Der Ritter",
        description: "Ein Veteran. +50% Klickkraft.",
        baseCost: 5000000000, // 5B
        spsMultiplier: 1.50,
        isClickMultiplier: true,
        icon: "🐴"
    },
    {
        id: 7,
        name: "Der Alchemist",
        description: "Verwandelt Blei in Smileys. +50% SPS.",
        baseCost: 25000000000, // 25B
        spsMultiplier: 1.50,
        isClickMultiplier: false,
        icon: "⚗️"
    },
    {
        id: 8,
        name: "Der Erzmagier",
        description: "Beschwört Smileys. +100% SPS (x2).",
        baseCost: 100000000000, // 100B
        spsMultiplier: 2.0,
        isClickMultiplier: false,
        icon: "🔮"
    },
    {
        id: 9,
        name: "Der Gilden-König",
        description: "Die absolute Macht. Verdoppelt ALLES (x2 Global).",
        baseCost: 1000000000000, // 1T (1 Billion)
        spsMultiplier: 2.0,
        specialEffect: "global_god_boost",
        isClickMultiplier: false,
        icon: "👑"
    }
];
/* ======================================================= */
/* 6. ACHIEVEMENT SYSTEM (MEILENSTEINE)                   */
/* ======================================================= */

const achievementsData = [
    // =========================================================================
    // 🖱️ KATEGORIE: KLICKER (Aktives Spielen)
    // =========================================================================
    {
        id: 0, name: "Klick-Anfänger", description: "Klicke 1.000 Mal.",
        requirement: { type: 'total_clicks', value: 1000 },
        bonus: { type: 'click_mult', value: 0.10 }, color: '#4CAF50'
    },
    {
        id: 1, name: "Finger aus Stahl", description: "Klicke 10.000 Mal.",
        requirement: { type: 'total_clicks', value: 10000 },
        bonus: { type: 'click_mult', value: 0.20 }, color: '#009ffd'
    },
    {
        id: 2, name: "Maus-Zerstörer", description: "Klicke 50.000 Mal.",
        requirement: { type: 'total_clicks', value: 50000 },
        bonus: { type: 'click_mult', value: 0.50 }, color: '#ff5252'
    },
    {
        id: 3, name: "Finger Gottes", description: "Klicke 100.000 Mal.",
        requirement: { type: 'total_clicks', value: 100000 },
        bonus: { type: 'click_mult', value: 2.0 }, color: '#FFD700'
    },
    {
        id: 4, name: "Scharfschütze", description: "Erreiche 25% Kritische Trefferchance.",
        requirement: { type: 'crit_chance_reach', value: 0.25 },
        bonus: { type: 'click_mult', value: 0.15 }, color: '#ff5252'
    },
    {
        id: 5, name: "Kritischer Meister", description: "Erreiche 50% Kritische Trefferchance.",
        requirement: { type: 'crit_chance_reach', value: 0.50 },
        bonus: { type: 'click_mult', value: 1.0 }, color: '#FFD700'
    },

    // =========================================================================
    // 💰 KATEGORIE: SAMMLER (Lifetime Smileys)
    // =========================================================================
    {
        id: 6, name: "Der erste Tausender", description: "Sammle 1.000 Smileys.",
        requirement: { type: 'lifetime_smileys', value: 1000 },
        bonus: { type: 'sps_mult', value: 0.05 }, color: '#4CAF50'
    },
    {
        id: 7, name: "Millionär", description: "Sammle 1 Million Smileys.",
        requirement: { type: 'lifetime_smileys', value: 1000000 },
        bonus: { type: 'prestige_efficiency', value: 0.05 }, color: '#009ffd'
    },
    {
        id: 8, name: "Milliardär", description: "Sammle 1 Milliarde Smileys.",
        requirement: { type: 'lifetime_smileys', value: 1000000000 },
        bonus: { type: 'sps_mult', value: 0.20 }, color: '#9c27b0'
    },
    {
        id: 9, name: "Trillionär", description: "Sammle 1 Trillion Smileys.",
        requirement: { type: 'lifetime_smileys', value: 1000000000000 },
        bonus: { type: 'prestige_efficiency', value: 0.20 }, color: '#e040fb'
    },
    {
        id: 10, name: "Quadrillionär", description: "Sammle 1 Quadrillion Smileys.",
        requirement: { type: 'lifetime_smileys', value: 1000000000000000 },
        bonus: { type: 'global_mult', value: 1.0 }, color: '#FFD700'
    },
    {
        id: 11, name: "DAS ENDE?", description: "Sammle 1 Quintillion Smileys.",
        requirement: { type: 'lifetime_smileys', value: 1000000000000000000 },
        bonus: { type: 'global_mult', value: 5.0 }, color: '#000000'
    },

    // =========================================================================
    // 🏭 KATEGORIE: INDUSTRIE (Gebäude & SPS)
    // =========================================================================
    {
        id: 12, name: "Aller Anfang", description: "Besitze 10 Auto-Klicker.",
        requirement: { type: 'building_count', target: 0, value: 10 },
        bonus: { type: 'sps_mult', value: 0.05 }, color: '#4CAF50'
    },
    {
        id: 13, name: "Bauarbeiter", description: "Besitze insgesamt 50 Gebäude.",
        requirement: { type: 'total_buildings', value: 50 },
        bonus: { type: 'cost_reduction_global', value: 0.01 }, color: '#009ffd'
    },
    {
        id: 14, name: "Stadtplaner", description: "Besitze insgesamt 250 Gebäude.",
        requirement: { type: 'total_buildings', value: 250 },
        bonus: { type: 'cost_reduction_global', value: 0.02 }, color: '#8d6e63'
    },
    {
        id: 15, name: "Architekt", description: "Besitze insgesamt 600 Gebäude.",
        requirement: { type: 'total_buildings', value: 600 },
        bonus: { type: 'cost_reduction_global', value: 0.03 }, color: '#8d6e63'
    },
    {
        id: 16, name: "Metropolis", description: "Besitze insgesamt 1.500 Gebäude.",
        requirement: { type: 'total_buildings', value: 1500 },
        bonus: { type: 'cost_reduction_global', value: 0.05 }, color: '#FFD700'
    },
    {
        id: 17, name: "Industrie-Boss", description: "Besitze 50 Fabriken.",
        requirement: { type: 'building_count', target: 4, value: 50 },
        bonus: { type: 'sps_mult', value: 0.10 }, color: '#607d8b'
    },
    {
        id: 18, name: "High-Tech", description: "Besitze 50 Alien-Labore.",
        requirement: { type: 'building_count', target: 6, value: 50 },
        bonus: { type: 'sps_mult', value: 0.15 }, color: '#607d8b'
    },
    {
        id: 19, name: "Zeit-Herrscher", description: "Besitze 100 Zeitmaschinen.",
        requirement: { type: 'building_count', target: 7, value: 100 },
        bonus: { type: 'prestige_efficiency', value: 0.25 }, color: '#e040fb'
    },
    {
        id: 20, name: "Fließbandarbeit", description: "Erreiche 100 Smileys pro Sekunde.",
        requirement: { type: 'sps_reach', value: 100 },
        bonus: { type: 'sps_mult', value: 0.05 }, color: '#4CAF50'
    },
    {
        id: 21, name: "Produktions-Gigant", description: "Erreiche 1 Million SPS.",
        requirement: { type: 'sps_reach', value: 1000000 },
        bonus: { type: 'sps_mult', value: 0.20 }, color: '#4CAF50'
    },
    {
        id: 22, name: "Lichtgeschwindigkeit", description: "Erreiche 1 Milliarde SPS.",
        requirement: { type: 'sps_reach', value: 1000000000 },
        bonus: { type: 'sps_mult', value: 0.50 }, color: '#e040fb'
    },
    {
        id: 23, name: "Warp-Antrieb", description: "Erreiche 1 Billion SPS.",
        requirement: { type: 'sps_reach', value: 1000000000000 },
        bonus: { type: 'sps_mult', value: 1.0 }, color: '#FFD700'
    },

    // =========================================================================
    // 🟣 KATEGORIE: PRESTIGE (Zeit & Raum)
    // =========================================================================
    {
        id: 24, name: "Neuanfang", description: "Führe deinen ersten Prestige-Reset durch.",
        requirement: { type: 'prestige_count', value: 1 },
        bonus: { type: 'global_mult', value: 0.10 }, color: '#9c27b0'
    },
    {
        id: 25, name: "Zeitschleife I", description: "Führe 5 Prestige-Resets durch.",
        requirement: { type: 'prestige_count', value: 5 },
        bonus: { type: 'prestige_efficiency', value: 0.10 }, color: '#9c27b0'
    },
    {
        id: 26, name: "Zeitschleife II", description: "Führe 10 Prestige-Resets durch.",
        requirement: { type: 'prestige_count', value: 10 },
        bonus: { type: 'global_mult', value: 0.20 }, color: '#e040fb'
    },
    {
        id: 27, name: "Zeitschleife III", description: "Führe 25 Prestige-Resets durch.",
        requirement: { type: 'prestige_count', value: 25 },
        bonus: { type: 'global_mult', value: 0.50 }, color: '#e040fb'
    },
    {
        id: 28, name: "Punktesammler", description: "Besitze 10.000 Prestige-Punkte (auf der Hand).",
        requirement: { type: 'prestige_points_held', value: 10000 },
        bonus: { type: 'global_mult', value: 0.05 }, color: '#e040fb'
    },
    {
        id: 29, name: "Prestige-Gott", description: "Besitze 1 Million Prestige-Punkte.",
        requirement: { type: 'prestige_points_held', value: 1000000 },
        bonus: { type: 'prestige_efficiency', value: 1.0 }, color: '#FFD700'
    },

    // =========================================================================
    // 💎 KATEGORIE: REICHTUM (Diamanten)
    // =========================================================================
    {
        id: 30, name: "Minen-Besitzer", description: "Schalte die Diamanten-Mine frei.",
        requirement: { type: 'building_count', target: 8, value: 1 },
        bonus: { type: 'sps_mult', value: 0.10 }, color: '#00bcd4'
    },
    {
        id: 31, name: "Schatzsucher I", description: "Besitze 100 Diamanten gleichzeitig.",
        requirement: { type: 'diamond_count', value: 100 },
        bonus: { type: 'sps_mult', value: 0.05 }, color: '#00bcd4'
    },
    {
        id: 32, name: "Schatzsucher II", description: "Besitze 1.000 Diamanten gleichzeitig.",
        requirement: { type: 'diamond_count', value: 1000 },
        bonus: { type: 'click_mult', value: 0.25 }, color: '#00bcd4'
    },
    {
        id: 33, name: "Schatzsucher III", description: "Besitze 10.000 Diamanten gleichzeitig.",
        requirement: { type: 'diamond_count', value: 10000 },
        bonus: { type: 'global_mult', value: 0.10 }, color: '#00bcd4'
    },

    // =========================================================================
    // ⚔️ KATEGORIE: GILDEN (Gemeinschaft)
    // =========================================================================
    {
        id: 34, name: "Gilden-Gründer", description: "Gründe eine Gilde oder tritt bei.",
        requirement: { type: 'guild_joined', value: true },
        bonus: { type: 'global_mult', value: 0.05 }, color: '#8d6e63'
    },
    {
        id: 35, name: "Gilden-Level I", description: "Erreiche Gilden-Level 2.",
        requirement: { type: 'guild_level', value: 2 },
        bonus: { type: 'sps_mult', value: 0.10 }, color: '#ff9800'
    },
    {
        id: 36, name: "Gilden-Level II", description: "Erreiche Gilden-Level 5.",
        requirement: { type: 'guild_level', value: 5 },
        bonus: { type: 'global_mult', value: 0.15 }, color: '#ff9800'
    },
    {
        id: 37, name: "Gilden-Level III", description: "Erreiche Gilden-Level 10.",
        requirement: { type: 'guild_level', value: 10 },
        bonus: { type: 'global_mult', value: 0.25 }, color: '#ff9800'
    },
    {
        id: 38, name: "Gilden-Level IV", description: "Erreiche Gilden-Level 20.",
        requirement: { type: 'guild_level', value: 20 },
        bonus: { type: 'global_mult', value: 0.50 }, color: '#ff9800'
    },
    {
        id: 39, name: "Gilden-Level V", description: "Erreiche Gilden-Level 50.",
        requirement: { type: 'guild_level', value: 50 },
        bonus: { type: 'global_mult', value: 2.0 }, color: '#FFD700'
    }
];

const GUILD_DATA = {
    mercenaryClasses: {
        fighter: {
            name: "Kämpfer",
            icon: "⚔️",
            description: "Spezialist für gefährliche Monsterjagd-Quests.",
            statBonus: "attack"
        },
        scout: {
            name: "Späher",
            icon: "🏹",
            description: "Findet schneller seltene Artefakte und Relikte.",
            statBonus: "speed"
        },
        miner: {
            name: "Bergbauer",
            icon: "⛏️",
            description: "Spezialisiert auf die Gewinnung von Diamanten.",
            statBonus: "resource"
        }
    },
    
    questPool: [
        {
            id: "monster_hunt_1",
            name: "Schleim-Plage beseitigen",
            duration: 300, 
            requiredClass: "fighter",
            difficulty: 1,
            rewards: {
                guildXP: 50,      // Erfahrung für die gesamte Gilde
                mercXP: 100,      // Erfahrung nur für den beteiligten Söldner
                smileys: 10000,   // Normale Währung
                diamonds: 2,      // Premium Währung
                gems: 0           // Die neue Resource (noch im Aufbau)
            }
        },
        {
            id: "expedition_ruins",
            name: "Expedition zu den alten Tempeln",
            duration: 900, 
            requiredClass: "scout",
            difficulty: 2,
            rewards: {
                guildXP: 150,
                mercXP: 300,
                smileys: 50000,
                diamonds: 5,
                gems: 1           // Erste Gems als seltene Belohnung
            }
        },
        {
            id: "deep_core_mining",
            name: "Abbau im Erdkern",
            duration: 1800, 
            requiredClass: "miner",
            difficulty: 3,
            rewards: {
                guildXP: 400,
                mercXP: 800,
                smileys: 250000,
                diamonds: 15,
                gems: 3
            }
        }
    ]
};

const GEM_SHOP_DATA = [
    {
        id: "gem_buff_sps",
        name: "Smaragd-Verstärker",
        description: "Erhöht deine gesamte Produktion permanent um 15%.",
        cost: 25,
        type: "sps_boost",
        value: 0.15
    },
    {
        id: "gem_buff_click",
        name: "Rubin-Schärfe",
        description: "Kritische Treffer verursachen +50% mehr Schaden.",
        cost: 40,
        type: "crit_damage",
        value: 0.50
    },
    {
        id: "gem_unlock_automation",
        name: "Kristall-Logistik",
        description: "Söldner starten Quests automatisch neu (wenn verfügbar).",
        cost: 100,
        type: "automation"
    }
];