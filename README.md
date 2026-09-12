# 😃 Smiley Clicker

> Ein komplexes Idle-RPG-Management-Spiel mit Multiplayer-Elementen, Wirtschaftssimulation, Minigames und einem tiefgehenden Skill-System.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()

Starte mit einem einzigen Klick und baue ein Imperium auf, das Dimensionen überschreitet!

---

## ✨ Features

### 🏗️ Wirtschaft & Aufbau
- **15+ Gebäudetypen**: Vom einfachen Auto-Klicker über Smiley-Farmen bis hin zum Absoluten Schöpfer
- **Dynamische Preise**: Kaufe 1x, 10x oder 100x Gebäude mit Hotkeys (1-9, Shift+1-9, Strg+1-9)
- **Globales Prestige**: Setze deinen Fortschritt zurück ("Urknall"), um Prestige-Punkte zu erhalten und mächtige permanente Boni im Skill-Tree freizuschalten
- **Forschung**: 100+ Upgrades für Gebäude und Klicks

### ⛏️ Die Diamanten-Mine
- **Minigame**: Grid-basiertes Grabungssystem (inspiriert von Minesweeper)
- **Werkzeuge**: Spitzhacken, TNT und Bohrer mit eigener Munition
- **Loot**: Diamanten, Gold, Fossilien und seltene Artefakte
- **Museum**: Stelle gefundene Artefakte aus für permanente Boni
- **Forschung**: Verbessere deine Ausrüstung im Labor

### ⚔️ Gilden & Multiplayer (Firebase)
- **Echtzeit-Chat**: Globaler und Gilden-Chat mit anderen Spielern
- **Boss-Raids**: Kämpfe gemeinsam mit deiner Gilde gegen riesige Bosse (HP in Echtzeit)
- **Söldner-System**: Rekrutiere Helden (Fighter, Miner, Scout) mit individuellen Talentbäumen
- **Gilden-Projekte**: Spende Smileys für globale Boni
- **Quests**: Söldner auf Missionen schicken für Belohnungen

### 🐾 Begleiter & Sammelbares
- **Pet Shop**: Haustiere mit passiven Bonis (Hund klickt automatisch, Katze gibt SPS-Bonus)
- **Kleiderschrank**: Skins mit Spezialeffekten (König, Glitch, Geist, etc.)
- **Schwarzmarkt (Gem Empire)**: Düstere Parallel-Wirtschaft mit "Corrupted Smileys"
- **Achievements**: 40+ Erfolge mit speziellen Boni

### ⚡ Active Skills
- **8 besondere Fähigkeiten** mit Cooldowns:
  - 🔥 Frenzy (x5 Klickkraft)
  - ⚡ Overdrive (x2 Produktion)
  - 🎯 CritStorm (100% Crit-Chance)
  - 💰 GoldRush (15 Min. Produktion)
  - 💎 DiamondPulse (Sofort Diamanten)
  - 📉 Efficiency (-25% Gebäudekosten)
  - 💠 Shards (Klicks ernten SPS)
  - 🚀 HyperMinute (x5 Produktion)

---

## 🎮 Quick Start

### Lokal spielen
1. Repository klonen oder als ZIP herunterladen
2. `index.html` im Browser öffnen
3. Losklicken! 🖱️

### Voraussetzungen
- Moderner Browser (Chrome, Firefox, Edge, Safari)
- JavaScript aktiviert
- LocalStorage unterstützt (für Auto-Save)
- Internetverbindung (optional, für Cloud-Save & Chat)

---

## 🛠️ Tech Stack

| Bereich | Technologie |
|---------|-------------|
| **Frontend** | Vanilla JavaScript, HTML5, CSS3 |
| **Backend** | Firebase Realtime Database |
| **Build** | Kein Build-System - läuft direkt im Browser |
| **Icons** | Unicode Emojis |
| **Design** | Custom CSS mit Dark Theme |

---

## 📁 Projekt-Struktur

Smiley-Game/
├── index.html # Haupt-HTML Datei
├── data.js # Spiel-Daten (Gebäude, Upgrades, Achievements, etc.)
├── firebase-logic.js # Cloud-Speicher & Multiplayer Logik
├── favicon.svg # Browser Icon
├── manifest.json # PWA Manifest
├── Smiley.png # Haupt-Icon
├── icon.png # App Icon
├── js/
│ ├── SG.js # Haupt-Game-Code (~200KB, ~3000 Zeilen)
│ └── systems/ # Modularisierte Systeme
│ ├── ChatSystem.js # Global & Gilden Chat
│ ├── DiamondMine.js # Minenspiel Logik
│ ├── GemSystem.js # Schwarzmarkt
│ ├── GuildSystem.js # Gilden, Söldner, Bosse
│ ├── PetSystem.js # Haustiere
│ ├── SkinSystem.js # Smiley Skins
│ └── SoundSystem.js # Audio Synthesizer
└── styles/
└── main.css # Haupt-Stylesheet


---

## 🎮 Spielanleitung

### Grundlagen
1. **Klicken**: Klicke auf den Smiley um Smileys zu sammeln
2. **Gebäude kaufen**: Erhöhe deine Produktion (SPS = Smileys pro Sekunde)
3. **Upgrades forschen**: Verbessere Klicks und Gebäude
4. **Prestige machen**: Bei ~100k+ Lifetime-Smileys resetten für Boni

### Fortgeschritten
- **Diamanten-Mine**: Ab 100 Millionen Smileys freischaltbar
- **Gilden**: Nach erstem Prestige verfügbar
- **Schwarzmarkt**: Mit Diamanten zugänglich
- **Pet Shop**: Nach Gilden-Freischaltung

### Tipps
- Kaufe Gebäude im 10er oder 100er Pack für besseren Preis
- Nutze Active Skills strategisch (z.B. Frenzy bei vielen Klicks)
- Spare für Prestige bis du mindestens 10 Punkte bekommst
- Tritt einer Gilde bei für Multiplayer-Boni

---

## 🔧 Entwicklung

### Installation für Entwickler
```bash
git clone [https://github.com/SmileO7/Smiley-Game.git](https://github.com/SmileO7/Smiley-Game.git)
cd Smiley-Game
# Einfach index.html im Browser öffnen
```

### Code-Qualität
- **ES6+**: Moderne JavaScript Features
- **Modular**: Systeme in separaten Dateien
- **Kein Framework**: Vanilla JS für maximale Performance
- **Live-Reload**: Einfach speichern und Browser neu laden

### Firebase Setup (Optional)
Für Cloud-Save & Multiplayer:
1. Firebase Projekt erstellen auf [firebase.google.com](https://firebase.google.com)
2. Realtime Database aktivieren
3. `firebase-logic.js` mit deinen Keys konfigurieren

### Debugging
- **Console**: F12 → Console für Logs
- **Save löschen**: `localStorage.clear()` in Console
- **Cloud löschen**: Firebase Console → Database

---

## 📊 GameState (Save-Struktur)

Der Spielstand enthält:
- Aktuelle & Lifetime Smileys
- Gebäude-Level & Preise
- Forschung & Prestige-Upgrades
- Diamanten, Corrupted Gems
- Pets & Skins
- Gilden-Daten & Söldner
- Achievements & Stats

Mehr Details in `docs/GAMESTATE.md` (kommt noch)

---

## 🚀 Roadmap

### Version 1.0 (Aktuell) ✅
- Alle Core Features implementiert
- Stable Release

### Geplante Updates
- [ ] Neue Gebäude-Tier
- [ ] Mehr Active Skills
- [ ] Gilden vs. Gilden Events
- [ ] Tägliche Challenges
- [ ] Mehr Achievements
- [ ] Mobile Optimierung

---

## 📜 License

MIT License

Copyright (c) 2026 SmileO7

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

---

## 🔗 Links

- [GitHub Repository](https://github.com/SmileO7/Smiley-Game)
- [Issues](https://github.com/SmileO7/Smiley-Game/issues)
- [SmileO7 auf GitHub](https://github.com/SmileO7)

---

**Viel Spaß beim Spielen!** 😃🎮