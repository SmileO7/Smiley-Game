# 💡 Design-Ideen & Überlegungen

Dieses Dokument sammelt Ideen, Inspirationen und offene Design-Fragen für zukftige Updates.

---

## 📅 Datum: 12. September 2026

### Inspiration: Cell: Idle Factory Incremental (CIFI)

**Quelle**: https://cifi.fandom.com  
**Analyse**: Systeme verglichen mit Smiley Clicker

---

## 🎯 CIFI-Systeme im Vergleich

### 1. MK-System (Mark-Level)

**CIFI Original**:
- Gebäude können auf MK1-100+ aufgewertet werden
- +2% Produktion pro Level
- Kostet Diamonds / Tokens
- Persistiert bei Loop-Prestige

**Bewertung**: ⚠️ **Problematisch**
- ❌ 15 Gebäude × 100 Levels = 1500 Upgrades (zu viel Micro-Management)
- ❌ UI wird unbersichtlich
- ❌ Balancing sehr schwierig

**Alternative Idee**:
- Nur **10 MK-Levels** pro Gebäude (statt 100)
- **+10% pro Level** (gleicher End-Bonus, weniger Komplexitt)
- ODER: **Bauplne** (einmal kaufen, permanent)

**Status**: 🤔 **Unsicher** - Passt Skalierung?

---

### 2. Tech Upgrades (Hardware / Software)

**CIFI Original**:
- Pro Gebäude-Tier: 2 Upgrades
- **Hardware**: +10% Output pro Level (kostet Tech Points)
- **Software**: +1% pro gekauftem Gebäude pro Level (kostet Tokens)
- Max Level: 50-100
- Persistiert bei Loop

**Bewertung**: ✅ **Gut, aber adaptieren**
- ✅ Gebude-spezifische Upgrades = mehr Tiefe
- ❌ 30 Upgrades (2 pro 15 Tiers) = zu viel UI
- ✅ Diamanten-Sink durch Software

**Smiley Clicker Adaption**:
- **Gebude-Forschung** statt Tech Upgrades
- Pro Gebäude-Tier: Hardware + Software
- **Hardware**: +10% SPS (kostet Smileys, 10 Level)
- **Software**: +1% pro gekauftem Gebäude (kostet Diamanten, 10 Level)
- **Forschung persistiert** bei Prestige (wie CIFI)

**Status**: 🤔 **Noch nicht ganz glücklich** - Braucht mehr Durchdenken

**Offene Fragen**:
1. Forschung umbenennen? ("Technologie" statt "Forschung"?)
2. Wie viele Level? (5, 10, oder unendlich?)
3. Beide gleichzeitig kaufbar? ODER erst Hardware, dann Software?
4. UI-Platzierung? (Eigenes Tab? In Gebäude-Info?)

---

### 3. Research Center

**CIFI Original**:
- Eigene Wahrung "Research Points"
- Forschung luft ber Zeit (Study Bar)
- Dauert Minuten bis Stunden
- Massive Boni (+25-500% SPS)
- Persistiert bei Loop

**Bewertung**: ❌ **Passt nicht**
- ❌ Smiley Clicker = aktiv + idle
- ❌ CIFI = sehr passiv (Stunden warten)
- ❌ Spieler wollen fter klicken, nicht warten

**Alternative Idee**:
- Forschung **sofort verfgbar** (wie aktuell)
- Nur **lngere Dauer** fr strkere Upgrades
- ODER: **Bestehende Forschung erweitern**

**Status**: ❌ **Verworfen** (vorerst)

---

### 4. Construction Blueprints

**CIFI Original**:
- Bauplne mit Kosten & Boni
- Permanente Upgrades fr's ganze Spiel
- 20+ Blueprints
- Kostet Ores / Materials

**Bewertung**: ✅ **Sehr gut!**
- ✅ Einmal kaufen = permanent
- ✅ Wenig UI-Space (ein Tab)
- ✅ Einfaches Balancing (lineare Skalierung)
- ✅ Passt perfekt zu Prestige-System

**Smiley Clicker Vorschlag**:
| Bauplan | Kosten | Bonus |
|---------|--------|-------|
| Blaupause: Bume | 1M Smileys | +10% alle Bume |
| Blaupause: Fabriken | 10M Smileys | +10% alle Fabriken |
| Blaupause: Minen | 100M Smileys | +10% alle Minen |
| ... | ... | ... |

**Status**: ✅ **Empfohlen** - Niedriger Aufwand, guter Impact

---

### 5. Gebäude-Spezialisierung

**Idee** (nicht aus CIFI):
- Ab 100 Gebäuden: Spezialisierung whlen
- 3 Optionen pro Gebäude:
  - **Quantitt**: +20% Produktion, -10% Klickkraft
  - **Qualitt**: +10% Produktion, +5% Crit-Chance
  - **Effizienz**: +15% Produktion, -5% Kosten

**Bewertung**: ✅ **Sehr gut!**
- ✅ Nur 1 Entscheidung pro Gebäude (nicht 100 MK-Levels)
- ✅ Strategische Tiefe ohne Komplexitt
- ✅ UI-freundlich (Dropdown pro Gebäude)

**Status**: ✅ **Empfohlen** - Mittlere Komplexitt

---

### 6. Meilenstein-Boni

**Idee** (nicht aus CIFI):
- Automatische Boni bei Gebäude-Anzahl:
  - 10 Gebäude: +5% SPS
  - 25 Gebäude: +10% SPS
  - 50 Gebäude: +20% SPS
  - 100 Gebäude: +50% SPS

**Bewertung**: ✅ **Perfekt!**
- ✅ Automatisch (kein Kaufen ntig)
- ✅ Belohnt Progression
- ✅ Kein Balancing ntig
- ✅ Kein UI ntig

**Status**: ✅ **Sehr empfohlen** - Sehr niedriger Aufwand

---

## 🎯 Prioritten (aktuelle Einschtzung)

| Prioritt | System | Aufwand | Impact | Status |
|----------|--------|---------|--------|--------|
| **🔥 P1** | Bauplne | Niedrig | ⭐⭐⭐ | ✅ Empfohlen |
| **🔥 P1** | Meilenstein-Boni | Sehr niedrig | ⭐⭐⭐ | ✅ Empfohlen |
| **📅 P2** | Gebude-Spezialisierung | Mittel | ⭐⭐⭐⭐ | ✅ Empfohlen |
| **🤔 P3** | Gebude-Forschung (Tech Upgrades) | Mittel | ⭐⭐⭐ | 🤔 Unsicher |
| **❌ P4** | MK-System (100 Levels) | Hoch | ⭐⭐ | ❌ Zu komplex |
| **❌ P5** | Research Center (zeit-basiert) | Hoch | ⭐⭐ | ❌ Passt nicht |

---

## 💭 Offene Fragen & Probleme

### Gebude-Forschung (Tech Upgrades Adaption)

**Probleme**:
- ❓ Passt die Skalierung? (15 Gebäude × 2 Upgrades × 10 Level = 300 Upgrades)
- ❓ UI-Overwhelm? (Zu viele Tabs/Buttons?)
- ❓ Balancing? (Zu stark? Zu schwach?)
- ❓ Diamanten-Kosten? (Zu teuer? Zu billig?)

**Ideen**:
- Nur **5 Level** statt 10? (weniger Upgrades)
- Nur **1 Upgrade** pro Gebäude? (nur Hardware ODER Software)
- **Gebude gruppieren**? (Tier 1-5 = 1 Upgrade, Tier 6-10 = 1 Upgrade, etc.)

**Nchste Schritte**:
- [ ] Balancing testen (Excel/Rechner?)
- [ ] UI-Mockup erstellen
- [ ] Community-Feedback einholen?

---

### MK-System Alternativen

**Problem**: 100 MK-Levels sind zu viel

**Alternativen**:
1. **10 MK-Levels** (+10% pro Level = +100% Ende)
2. **Bauplne** (einmal kaufen, permanent +10-50%)
3. **Spezialisierung** (1 Entscheidung, 3 Optionen)
4. **Meilensteine** (automatisch bei 10/25/50/100 Gebäuden)

**Empfehlung**: Kombination aus 2, 3, 4 (ohne MK-System)

---

## 📝 Notizen für später

### Wenn dir was einfllt:

- Idee: ___________________
- Datum: ___________________
- Status: [ ] Neu [ ] In Diskussion [ ] Getestet [ ] Verworfen

---

## 🔗 Quellen & Referenzen

- **CIFI Wiki**: https://cifi.fandom.com
- **CIFI Game-Vault**: https://cifi.game-vault.net
- **Idle Framework**: https://github.com/ac2522/IdleFramework
- **Smiley Clicker ROADMAP**: ./ROADMAP.md

---

**Letztes Update**: 12. September 2026  
**Status**: In Arbeit - Ideen sammeln
