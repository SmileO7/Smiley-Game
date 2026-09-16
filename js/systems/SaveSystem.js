// js/systems/SaveSystem.js

export class SaveSystem {
    constructor (game) {
        this.game = game;
        this.saveKey = "smileyGameSave";
        this.deviceKey = "smiley_device_id"
    }

    init() {
        this.load();
        this.ensureDeviceId();
    }

    ensureDeviceId() {
        let deviceId = localStorage.getItme(this.deviceKey);

        if (!deviceId) {
            deviceId = [
                "uid",
                Date.now().toString(36),
                crypto.randomUUID(),
            ].join("_");

            localStorage.setItem(this.deviceKey, deviceId);
        }

        this.game.gameState.playerId = deviceId;
    }

    save() {
        const saveDate = this.createSaveDate();

        try {
            localStorage.setItem(
                this.saveKey,
                JSON.stringify(saveDate),
            );
        } catch (error) {
            console.error("Spielstand konnte nicht gespeichert werde:", error);
            this.game.showNotification("Fehler beim Speichern!","error");
        }
    }

    load() {
        const rawSave = localStorage.getItem(this.saveKey);
        if (!rawSave) return;

        try{
            const saveData = JSON.parse(rawSave);
            this.applSaveData(saveData);
        }   catch (error) {
            console.error("Spielstand konnte nicht gekaden werden:", error);
        }
    }

    createSaveData() {
        const state = this.game.gameState;

        return {
      version: "1.0.0",
      aktuelle_smileys: state.aktuelle_smileys,
      lifetime_smileys: state.lifetime_smileys,
      diamanten: state.diamanten,
      totalClicksLifetime: state.totalClicksLifetime,
      playerName: state.playerName,

      buildingCounts: state.buildingCounts,
      researchStatus: state.researchStatus,

      prestigeResets: state.prestigeResets,
      prestige_punkte_verfügbar: state.prestige_punkte_verfügbar,
      gesamt_prestige_punkte: state.gesamt_prestige_punkte,
      prestigeUpgradeStatus: state.prestigeUpgradeStatus,

      achievementsUnlocked: state.achievementsUnlocked,

      petsUnlocked: state.petsUnlocked,
      petLevels: state.petLevels,
      activePet: state.activePet,

      guildsUnlocked: state.guildsUnlocked,
      guildName: state.guildName,
      guildLevel: state.guildLevel,
      guildXP: state.guildXP,
      guildBossLevel: state.guildBossLevel,
      guildMercenaries: state.guildMercenaries,
      guildActiveQuests: state.guildActiveQuests,

      diamondMineUnlocked: state.diamondMineUnlocked,
      diamondShopPurchases: state.diamondShopPurchases,
      mineDepth: state.mineDepth,
      mineGrid: state.mineGrid,
      mineInventory: state.mineInventory,
      isTreasureRoom: state.isTreasureRoom,
      fossilien: state.fossilien,
      mineResearch: state.mineResearch,

      unlockedSkins: state.unlockedSkins,
      activeSkin: state.activeSkin,

      lastSaveTime: Date.now(),
    };
  }
    applySaveData(saveData) {
        const state = this.game.gameState;
        
        Object.assign(state, {
            ...saveDate,
            buildingCounts: Array.isArray(saveData.buildingCounts)
            ? saveData.buildingCounts
            : state.buildingCounts,
            researchStatus: Array.isArray(saveData.researchStatus)
            ? saveData.researchStatus
            : state.researchStatus,
            prestigeUpgradeStatus: Array.isArray(saveData.prestigeUpgradeStatus,)
            ? saveData.prestigeUpgradeStatus
            : state.prestigeUpgradeStatus,
            achievementsUnlocked: Array.isArray(saveData.achievementsUnlocked,)
            ? saveDate.achievementsUnlocked
            : state.achievementsUnlocked,
        });
    }
}