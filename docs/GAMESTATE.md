# 📊 GameState Dokumentation

Dieses Dokument beschreibt alle Properties im `gameState` Objekt.

---

## 🎯 Übersicht

Der `gameState` ist das zentrale Datenobjekt, das **alle Spielinformationen** enthält. Er wird bei jedem Speichern serialisiert und beim Laden wiederhergestellt.

---

## 💰 Whrung

### `aktuelle_smileys` (number)
- **Beschreibung**: Aktuell verfgbare Smileys (Hauptwhrung)
- **Startwert**: `0`
- **Reset bei Prestige**: Ja (auf 0)
- **Beispiel**: `1234567`

### `lifetime_smileys` (number)
- **Beschreibung**: Insgesamt im Spielverlauf gesammelte Smileys
- **Startwert**: `0`
- **Reset bei Prestige**: Nein (bleibt erhalten)
- **Verwendung**: Prestige-Punkte Berechnung
- **Beispiel**: `407844890615`

### `diamanten` (number)
- **Beschreibung**: Premium-Whrung aus der Diamanten-Mine
- **Startwert**: `0`
- **Reset bei Prestige**: Nein
- **Verwendung**: Diamanten-Shop Upgrades
- **Beispiel**: `1542`

### `gems` (number)
- **Beschreibung**: Corrupted Smileys (Schwarzmarkt-Whrung)
- **Startwert**: `0`
- **Reset bei Prestige**: Nein
- **Verwendung**: Gem Empire Upgrades
- **Drop-Chance**: 0.2% pro Klick
- **Beispiel**: `23`

---

## 🏭 Produktion

### `klickKraft` (number)
- **Beschreibung**: Basis-Klickkraft
- **Startwert**: `2`
- **Reset bei Prestige**: Ja (auf 1)
- **Beispiel**: `2`

### `klickKraftMultiplier` (number)
- **Beschreibung**: Multiplikator auf Klickkraft (durch Upgrades, Prestige, etc.)
- **Startwert**: `1`
- **Reset bei Prestige**: Nein
- **Beispiel**: `15.5`

### `totalSPS` (number)
- **Beschreibung**: Smileys pro Sekunde (gesamte Produktion)
- **Startwert**: `0`
- **Reset bei Prestige**: Ja (wird neu berechnet)
- **Berechnung**: Summe aller Gebäude × Multiplikatoren
- **Beispiel**: `1250000`

### `globalerPrestigeMultiplikator` (number)
- **Beschreibung**: Globaler Multiplikator aus Prestige-Punkten, Resets, Upgrades
- **Startwert**: `1`
- **Reset bei Prestige**: Nein
- **Berechnung**: `(1 + gesamt_prestige_punkte × prestigePointMultiplier) × (1 + prestigeResets × prestigeResetBonus) × globalSPSMultiplier × guildSPSMultiplier`
- **Beispiel**: `3.45`

---

## 🏗️ Gebude

### `buildingCounts` (Array<number>)
- **Beschreibung**: Anzahl jedes Gebäudetyps
- **Lnge**: 16 (15 normale + 1 spezielles)
- **Startwert**: `[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]`
- **Reset bei Prestige**: Ja (alle auf 0)
- **Index-Mapping**:
  - `0`: Auto-Klicker
  - `1`: Smiley-Baum
  - `2`: Smiley-Fabrik
  - `3`: Smiley-Mine
  - `4`: Smiley-Bohrer
  - `5`: Smiley-Kernkraftwerk
  - `6`: Smiley-Galaxie
  - `7`: Dimensionsportal
  - `8`: Zeitmaschine
  - `9`: Meta-Klicker
  - `10`: Quanten-Netzwerk
  - `11`: Endloser Speicher
  - `12`: Ursprung
  - `13`: Kosmische Einheit
  - `14`: Absoluter Schpfer
  - `15`: Diamanten-Mine (spezial)
- **Beispiel**: `[150, 85, 42, 18, 7, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1]`

### `buildingPrices` (Array<number>)
- **Beschreibung**: Aktueller Preis jedes Gebäudes
- **Lnge**: 16
- **Startwert**: Basierend auf `basePrice` aus `data.js`
- **Reset bei Prestige**: Ja (auf `basePrice`)
- **Wachstum**: `basePrice × growthRate^count`
- **Beispiel**: `[25, 150, 1200, 12000, 75000, 850000, ...]`

---

## 🔬 Forschung

### `researchStatus` (Array<boolean>)
- **Beschreibung**: Freigeschaltete Global Upgrades (Forschung)
- **Lnge**: ~112 (basierend auf `globalUpgrades` Array)
- **Startwert**: Alle `false`
- **Reset bei Prestige**: Nein
- **Beispiel**: `[true, true, false, true, false, ...]`

---

## 🌌 Prestige

### `prestige_punkte_verfgbar` (number)
- **Beschreibung**: Aktuell verfgbare Prestige-Punkte (Whrung)
- **Startwert**: `0`
- **Reset bei Prestige**: Nein (werden addiert)
- **Verwendung**: Skill-Tree Upgrades kaufen
- **Beispiel**: `159`

### `gesamt_prestige_punkte` (number)
- **Beschreibung**: Insgesamt gesammelte Prestige-Punkte
- **Startwert**: `0`
- **Reset bei Prestige**: Nein (werden addiert)
- **Verwendung**: Globaler Multiplikator
- **Beispiel**: `159`

### `prestigeResets` (number)
- **Beschreibung**: Anzahl durchgefhrter Prestige-Resets
- **Startwert**: `0`
- **Reset bei Prestige**: Nein (wird inkrementiert)
- **Bonus**: +1% globaler Multiplikator pro Reset
- **Beispiel**: `3`

### `prestigeUpgradeStatus` (Array<boolean>)
- **Beschreibung**: Gekaufte Prestige-Upgrades (Skill-Tree)
- **Lnge**: 101 (basierend auf `prestigeUpgrades` Array)
- **Startwert**: Alle `false`
- **Reset bei Prestige**: Nein (bleibt erhalten)
- **Beispiel**: `[true, true, true, false, true, ...]`

---

## 🐾 Haustiere

### `petsUnlocked` (boolean)
- **Beschreibung**: Pet-Shop freigeschaltet
- **Startwert**: `false`
- **Freischaltung**: Nach Gilden-System
- **Reset bei Prestige**: Nein

### `petLevels` (Object)
- **Beschreibung**: Level jedes Pets
- **Startwert**: `{}`
- **Format**: `{ pet_rock: 5, pet_dog: 3, pet_cat: 10 }`
- **Reset bei Prestige**: Nein

### `activePet` (string | null)
- **Beschreibung**: Aktuell aktives Pet
- **Startwert**: `null`
- **Werte**: Pet-ID oder `null`
- **Reset bei Prestige**: Nein
- **Beispiel**: `"pet_cat"`

---

## ⛏️ Diamanten-Mine

### `diamondMineUnlocked` (boolean)
- **Beschreibung**: Diamanten-Mine freigeschaltet
- **Startwert**: `false`
- **Freischaltung**: 100 Millionen Lifetime-Smileys
- **Reset bei Prestige**: Nein

### `mineGrid` (Array)
- **Beschreibung**: 8×§ Grid der Mine
- **Startwert**: `[]` (wird generiert)
- **Format**: Array von Tile-Objekten
- **Reset bei Prestige**: Nein

### `mineDepth` (number)
- **Beschreibung**: Aktuelle Minen-Tiefe
- **Startwert**: `1`
- **Reset bei Prestige**: Nein
- **Beispiel**: `15`

### `mineInventory` (Object)
- **Beschreibung**: Werkzeuge & Munition
- **Startwert**: `{ pickaxe: 50, tnt: 2, drill: 1 }`
- **Reset bei Prestige**: Nein
- **Beispiel**: `{ pickaxe: 35, tnt: 0, drill: 1 }`

### `fossilien` (number)
- **Beschreibung**: Gefundene Fossilien (Mine-Forschung)
- **Startwert**: `0`
- **Reset bei Prestige**: Nein
- **Verwendung**: Forschung in der Mine
- **Beispiel**: `1250`

### `mineResearch` (Object)
- **Beschreibung**: Forschungs-Level in der Mine
- **Startwert**: `{ durable_picks: 0, fossil_scanner: 0, explosive_yield: 0 }`
- **Reset bei Prestige**: Nein
- **Beispiel**: `{ durable_picks: 3, fossil_scanner: 1, explosive_yield: 2 }`

### `collectedArtifacts` (Array<string>)
- **Beschreibung**: Gefundene Artefakte fr Museum
- **Startwert**: `[]`
- **Format**: Array von Artefakt-IDs
- **Reset bei Prestige**: Nein
- **Beispiel**: `["art_coin", "art_fossil", "art_crystal"]`

### `diamondShopPurchases` (Object)
- **Beschreibung**: Gekaufte Diamanten-Shop Upgrades
- **Startwert**: `{}`
- **Format**: `{ upgrade_id: count }`
- **Reset bei Prestige**: Nein
- **Beispiel**: `{ "0": 1, "1": 1, "4": 3 }`

---

## ⚔️ Gilden

### `guildsUnlocked` (boolean)
- **Beschreibung**: Gilden-System freigeschaltet
- **Startwert**: `false`
- **Freischaltung**: Nach erstem Prestige
- **Reset bei Prestige**: Nein

### `guildName` (string | null)
- **Beschreibung**: Name der Gilde
- **Startwert**: `null`
- **Reset bei Prestige**: Nein
- **Beispiel**: `"Smiley Masters"`

### `guildLevel` (number)
- **Beschreibung**: Gilden-Level
- **Startwert**: `1`
- **Reset bei Prestige**: Nein
- **Beispiel**: `15`

### `guildXP` (number)
- **Beschreibung**: Aktuelle Gilden-EP
- **Startwert**: `0`
- **Reset bei Prestige**: Nein
- **Beispiel**: `7500`

### `guildMercenaries` (Array)
- **Beschreibung**: Angeworbene Sldner
- **Startwert**: `[]`
- **Format**: Array von Sldner-Objekten
- **Reset bei Prestige**: Nein
- **Beispiel**:
```javascript
[
  {
    id: "merc_001",
    name: "Ragnar",
    level: 5,
    xp: 450,
    maxXp: 500,
    type: "fighter",
    status: "idle",
    questId: null
  }
]
```

### `guildActiveQuests` (Array)
- **Beschreibung**: Laufende Quests
- **Startwert**: `[]`
- **Format**: Array von Quest-Objekten
- **Reset bei Prestige**: Nein

---

## 🎨 Skins

### `unlockedSkins` (Array<string>)
- **Beschreibung**: Freigeschaltete Skins
- **Startwert**: `["default"]`
- **Reset bei Prestige**: Nein
- **Beispiel**: `["default", "king", "glitch", "ghost"]`

### `activeSkin` (string)
- **Beschreibung**: Aktuell aktiver Skin
- **Startwert**: `"default"`
- **Reset bei Prestige**: Nein
- **Beispiel**: `"king"`

---

## 🏆 Erfolge

### `achievementsUnlocked` (Array<boolean>)
- **Beschreibung**: Freigeschaltete Achievements
- **Lnge**: ~45 (basierend auf `achievementsData`)
- **Startwert**: Alle `false`
- **Reset bei Prestige**: Nein
- **Beispiel**: `[true, true, false, true, ...]`

---

## ⚡ Active Skills

### `skills` (Object)
- **Beschreibung**: Status aller Active Skills
- **Startwert**:
```javascript
{
  frenzy: {
    active: false,
    cooldown: false,
    duration: 15000,
    cooldownTime: 120000,
    readyAt: 0,
    color: "#ff4d4d"
  },
  overdrive: { ... },
  critStorm: { ... },
  goldRush: { ... },
  diamondPulse: { ... },
  efficiency: { ... },
  shards: { ... },
  hyperMinute: { ... }
}
```
- **Reset bei Prestige**: Nein (Cooldowns laufen weiter)

---

## 🎯 Stats

### `totalClicksLifetime` (number)
- **Beschreibung**: Insgesamt geklickte Male
- **Startwert**: `0`
- **Reset bei Prestige**: Nein
- **Beispiel**: `15420`

### `playerName` (string)
- **Beschreibung**: Spieler-Name
- **Startwert**: `"Smiley_Gast"`
- **Reset bei Prestige**: Nein
- **Beispiel**: `"Smiley_42"`

### `playerId` (string)
- **Beschreibung**: Eindeutige Gerten-ID (fr Gilden)
- **Startwert**: Auto-generiert
- **Reset bei Prestige**: Nein (berlebt Reset)
- **Format**: `"uid_xxxxxxxx"`

---

## 🔮 Temporre Buffs

### `activeBuffs` (Object)
- **Beschreibung**: Aktive temporre Effekte
- **Startwert**:
```javascript
{
  spsMultiplier: 1,
  costMultiplier: 1,
  timerSPS: 0,
  timerCost: 0
}
```
- **Reset bei Prestige**: Ja (alle Buffs enden)

---

## 💎 Sonstiges

### `godModeMultiplier` (number)
- **Beschreibung**: Debug-Modus Multiplikator
- **Startwert**: `1`
- **Reset bei Prestige**: Nein
- **Beispiel**: `1` (normal), `1000000` (god mode)

### `comboCount` (number)
- **Beschreibung**: Aktueller Combo-Zhler
- **Startwert**: `0`
- **Reset bei Prestige**: Ja
- **Max**: 5.0

### `comboMulti` (number)
- **Beschreibung**: Aktueller Combo-Multiplikator
- **Startwert**: `1.0`
- **Reset bei Prestige**: Ja
- **Berechnung**: `1 + sqrt(comboCount) × 0.15`

### `clickSPSRatio` (number)
- **Beschreibung**: SPS → Klick-Kraft Ratio
- **Startwert**: `0`
- **Reset bei Prestige**: Nein
- **Beispiel**: `0.01` (1% der SPS)

---

## 📝 Save-Format

Der komplette Save-String sieht so aus:

```javascript
{
  gameState: {
    // Alle oben genannten Properties
  },
  version: "1.0"
}
```

**Speicherung:**
- **Lokal**: `localStorage.setItem("smileyGameSave", JSON.stringify(data))`
- **Cloud**: Firebase Realtime Database unter `/saves/{playerId}`

**Migration:**
- Alte Saves (pre-1.0) werden automatisch erkannt
- Fehlende Properties werden mit Default-Werten aufgeflt

---

**Letztes Update**: September 2026  
**Version**: 1.0
