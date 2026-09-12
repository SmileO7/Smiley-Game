# 🏗️ Architektur-Dokument

Dieses Dokument beschreibt die technische Architektur des Smiley Clicker.

---

## 📐 Übersicht

Smiley Clicker ist ein **modulares Vanilla JavaScript Projekt** ohne Build-System. Der Code ist in logische Systeme unterteilt, die über eine zentrale `SmileyGame`-Klasse interagieren.

### Design-Prinzipien
- **Kein Framework**: Maximale Performance, minimale Abhngigkeiten
- **Modularitt**: Jedes Feature ist in einem separaten System-Modul
- **Single Source of Truth**: `gameState` Objekt enthlt alle Spiel-Daten
- **Event-Driven**: UI-Updates bei State-Ä¨nderungen
- **Live-Reload**: Code-Ä¨nderungen sofort im Browser testbar

---

## 📁 Code-Struktur

```
Smiley-Game/
├── index.html              # Entry Point
├── data.js                 # Spiel-Konstanten & Konfiguration
├── firebase-logic.js       # Backend-Integration
├── js/
│   ├── SG.js              # Haupt-Game-Klasse (~3000 Zeilen)
│   └── systems/           # Feature-Module
│       ├── ChatSystem.js   # Multiplayer-Chat
│       ├── DiamondMine.js  # Minenspiel
│       ├── GemSystem.js    # Schwarzmarkt
│       ├── GuildSystem.js  # Gilden & Sldner
│       ├── PetSystem.js    # Haustiere
│       ├── SkinSystem.js   # Smiley-Skins
│       └── SoundSystem.js  # Audio
└── styles/
    └── main.css           # Styling
```

---

## 🎯 Kern-Klassen

### 1. `SmileyGame` (SG.js)

Die Hauptklasse, die das gesamte Spiel steuert.

**Verantwortlichkeiten:**
- GameState-Management
- Spiel-Logik (Klicken, Kaufen, Prestige)
- UI-Updates
- Save/Load
- System-Initialisierung

**Wichtige Properties:**
```javascript
{
  gameState: {...},           // Alle Spiel-Daten
  currentBuyAmount: 1|10|100, // Kauf-Multiplikator
  activeModals: Set,          // Offene Modals
  treeX, treeY, treeZoom: ... // Skill-Tree Kamera
}
```

**Wichtige Methoden:**
```javascript
- constructor()              // Initialisierung
- init()                     // Spiel starten
- updateUI()                 // UI refreshen
- saveGame()                 // Speichern
- loadGame()                 // Laden
- prestigeReset()            // Prestige durchfhren
```

---

### 2. System-Klassen

Jedes Feature hat eine eigene Klasse, die von `SmileyGame` instanziiert wird.

#### `DiamondMine` (DiamondMine.js)
- Grid-basiertes Minenspiel
- Werkzeug-Logik (Spitzhacke, TNT, Bohrer)
- Loot-System
- Forschung

#### `GuildSystem` (GuildSystem.js)
- Gilden-Verwaltung
- Sldner-System
- Boss-Raids
- Quests
- Firebase-Integration fr Chat

#### `PetSystem` (PetSystem.js)
- Pet-Shop
- Pet-Leveling
- Passive Boni

#### `GemSystem` (GemSystem.js)
- Schwarzmarkt-UI
- Corrupted Smileys
- Premium-Upgrades

#### `SkinSystem` (SkinSystem.js)
- Skin-Verwaltung
- Smiley-Aussehen
- Spezialeffekte

#### `SoundSystem` (SoundSystem.js)
- Audio-Synthesizer
- Klick-Sounds
- Musik-Steuerung

#### `ChatSystem` (ChatSystem.js)
- Global-Chat
- Gilden-Chat
- Firebase Realtime-Database

---

## 🔄 Datenfluss

### 1. Spiel-Loop

```
User Action → SmileyGame → GameState → updateUI() → DOM
     ↑                                          ↓
     └────────────── Save/Load ←────────────────┘
```

### 2. Beispiel: Gebäude kaufen

```javascript
// 1. User klickt Button
button.onclick = () => gameInstance.kaufeMehrereGebaeude(index, amount)

// 2. SmileyGame prft und aktualisiert
if (gameState.aktuelle_smileys >= cost) {
  gameState.aktuelle_smileys -= cost
  gameState.buildingCounts[index] += amount
  gameState.buildingPrices[index] = calculateNextCost(...)
  
  // 3. Boni neu berechnen
  this.applyAllBoni()
  
  // 4. UI updaten
  this.updateUI()
  this.updateBuildingUI()
  
  // 5. Speichern
  this.speichereSpiel()
}
```

### 3. Beispiel: Prestige

```javascript
prestigeReset() {
  // 1. Punkte berechnen
  const points = this.calculatePrestigeGain()
  
  // 2. Besttigung
  if (!confirm(...)) return
  
  // 3. Reset
  gameState.aktuelle_smileys = 0
  gameState.buildingCounts = [0, 0, ...]
  gameState.prestige_punkte_verfgbar += points
  
  // 4. Boni
  this.applyAllBoni()
  
  // 5. UI & Save
  this.updateUI()
  this.speichereSpiel()
}
```

---

## 💾 State-Management

### GameState-Struktur

```javascript
gameState = {
  // Whrung
  aktuelle_smileys: 0,
  lifetime_smileys: 0,
  diamanten: 0,
  gems: 0,
  
  // Produktion
  klickKraft: 2,
  klickKraftMultiplier: 1,
  totalSPS: 0,
  globalerPrestigeMultiplikator: 1,
  
  // Gebude
  buildingCounts: [0, 0, ...],  // 15+ Gebude
  buildingPrices: [25, 150, ...],
  
  // Forschung
  researchStatus: [false, false, ...],  // 100+ Upgrades
  
  // Prestige
  prestige_punkte_verfgbar: 0,
  gesamt_prestige_punkte: 0,
  prestigeUpgradeStatus: [false, false, ...],  // Skill-Tree
  
  // Features
  petsUnlocked: false,
  petLevels: {},
  activePet: null,
  diamondMineUnlocked: false,
  guildsUnlocked: false,
  
  // Gilden
  guildName: null,
  guildLevel: 1,
  guildMercenaries: [],
  guildActiveQuests: [],
  
  // Sonstiges
  achievementsUnlocked: [false, false, ...],
  skills: {...},  // Active Skills
  activeBuffs: {...},  // Temporre Boni
}
```

### Save/Load

**Speichern:**
```javascript
speichereSpiel() {
  const saveString = JSON.stringify({
    gameState: this.gameState,
    version: "1.0"
  })
  localStorage.setItem("smileyGameSave", saveString)
  
  // Optional: Cloud-Save
  if (window.cloudSystem) {
    cloudSystem.saveToCloud(saveString)
  }
}
```

**Laden:**
```javascript
ladeSpiel() {
  const saved = localStorage.getItem("smileyGameSave")
  if (!saved) return
  
  const parsed = JSON.parse(saved)
  const data = parsed.gameState || parsed
  
  // Werte bernehmen mit Fallbacks
  this.gameState.aktuelle_smileys = data.aktuelle_smileys || 0
  this.gameState.buildingCounts = data.buildingCounts || [...]
  // ...
  
  this.updateUI()
}
```

---

## 🎨 UI-System

### Modal-System

```javascript
// Modal ffnen
this.openModal("prestige-shop-modal")

// Modal schlieen
this.closeModal("prestige-shop-modal")

// Esc-Taste schlieet Modal
setupModalEsc() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      this.closeTopModal()
    }
  })
}
```

### Update-Loop

```javascript
startIntervals() {
  // UI alle 100ms
  this.uiInterval = setInterval(() => {
    this.updateUI()
  }, 100)
  
  // Produktion alle 1s
  this.productionInterval = setInterval(() => {
    this.addSmileys(this.gameState.totalSPS)
  }, 1000)
  
  // Auto-Save alle 60s
  this.saveInterval = setInterval(() => {
    this.speichereSpiel()
  }, 60000)
}
```

---

## 🔌 Firebase-Integration

### Chat-System

```javascript
// firebase-logic.js
class CloudSystem {
  saveToCloud(data) {
    return firebase.database()
      .ref(`saves/${playerId}`)
      .set(data)
  }
  
  load() {
    return firebase.database()
      .ref(`saves/${playerId}`)
      .once("value")
      .then(snapshot => snapshot.val())
  }
  
  // Chat
  sendMessage(channel, message) {
    firebase.database()
      .ref(`chat/${channel}`)
      .push({
        player: playerName,
        message: message,
        timestamp: Date.now()
      })
  }
  
  listenToChat(channel, callback) {
    firebase.database()
      .ref(`chat/${channel}`)
      .limitToLast(50)
      .on("child_added", callback)
  }
}
```

---

## 🛠️ Hilfsfunktionen

### `formatNumber()`

Formatiert große Zahlen lesbar:
```javascript
formatNumber(1234567)  // "1.23M"
formatNumber(1e12)     // "1.00T"
```

### `calculatePrestigeGain()`

Berechnet Prestige-Punkte:
```javascript
calculatePrestigeGain() {
  const threshold = 100000
  const lifetime = this.gameState.lifetime_smileys
  const alreadyEarned = this.gameState.gesamt_prestige_punkte
  
  const totalLevel = Math.floor(Math.cbrt(lifetime / threshold))
  return Math.max(0, totalLevel - alreadyEarned)
}
```

---

## 📝 Code-Style

### Naming-Conventions
- **Klassen**: PascalCase (`SmileyGame`, `DiamondMine`)
- **Methoden**: camelCase (`updateUI`, `kaufeGebude`)
- **Properties**: snake_case (`aktuelle_smileys`, `building_counts`)
- **Konstanten**: UPPER_CASE (`BLOCKCOST`, `MAX_COMBO`)

### Dateistruktur
```javascript
// 1. Imports
import { Firebase } from "./firebase-logic.js"

// 2. Konstanten
const THRESHOLD = 100000

// 3. Klasse
class SmileyGame {
  constructor() { ... }
  init() { ... }
  updateUI() { ... }
}

// 4. Export (falls ntig)
export { SmileyGame }
```

---

## 🚀 Performance-Optimierung

- **Kein Framework**: Vanilla JS ist schneller als React/Vue
- **Batch-Updates**: UI nur alle 100ms refreshen
- **Event-Delegation**: Ein Listener statt viele
- **Lazy-Loading**: Modals nur bei Bedarf rendern
- **Caching**: Berechnete Werte speichern

---

## 📊 Metriken

- **Code-Zeilen**: ~4000 (SG.js: ~3000, Systems: ~1000)
- **Dateigrö¨´´e**: ~250KB (unminified)
- **Ladezeit**: < 1s lokal
- **FPS**: 60 (UI-Updates optimiert)

---

**Letztes Update**: September 2026  
**Version**: 1.0
