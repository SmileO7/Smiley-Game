// js/GameState.js

export function createInitialGameState({
  buildingsData,
  uniqueBuildingsData,
  globalUpgrades,
  prestigeUpgrades,
  achievementsData,
}) {
  return {
    aktuelle_smileys: 0,
    lifetime_smileys: 0,
    diamanten: 0,
    gems: 0,

    playerName: "Smiley_Gast",
    playerId: null,

    prestige_punkte_verfügbar: 0,
    gesamt_prestige_punkte: 0,
    prestigeResets: 0,

    klickKraft: 2,
    klickKraftMultiplier: 1,
    globalerPrestigeMultiplikator: 1,

    buildingCounts: [
      ...buildingsData,
      ...uniqueBuildingsData,
    ].map(() => 0),

    buildingPrices: [
      ...buildingsData.map((building) => building.basePrice),
      ...uniqueBuildingsData.map((building) => building.basePrice),
    ],

    researchStatus: globalUpgrades.map(() => false),
    prestigeUpgradeStatus: prestigeUpgrades.map(() => false),

    petLevels: {},
    activePet: null,

    totalSPS: 0,
    globalSPSMultiplier: 1,
    prestigePointMultiplier: 0.01,
    prestigeResetBonus: 0,

    critChance: 0,
    critDamageMult: 1,
    diamondMineBoost: 0,
    globalCostReduction: 0,
    clickSPSRatio: 0,
    godModeMultiplier: 1,

    mineGrid: [],
    mineDepth: 1,
    mineInventory: {
      pickaxe: 50,
      tnt: 2,
      drill: 1,
    },

    fossilien: 0,
    mineResearch: {
      durable_picks: 0,
      explosive_yield: 0,
      fossil_scanner: 0,
    },

    selectedTool: "pickaxe",
    isTreasureRoom: false,
    diamondShopPurchases: {},

    diamondMineUnlocked: false,
    petsUnlocked: false,
    guildsUnlocked: false,

    petAutoClickTimer: 0,
    achievementsUnlocked: achievementsData.map(() => false),
    totalClicksLifetime: 0,

    guildName: null,
    guildLevel: 1,
    guildXP: 0,
    guildXPReq: 1000,
    guildSPSMultiplier: 0,
    guildCostReduction: 0,
    guildPrestigeBonus: 0,
    guildGlobalMultiplier: 1,

    lastBossDefeatTime: 0,
    guildBossLevel: 1,
    guildBossHP: 1000,
    guildBossMaxHP: 1000,
    guildBossFighting: false,
    guildBossTimer: 0,

    guildAvailableQuests: [],
    guildActiveQuests: [],
    guildMercenaries: [],

    activeBuffs: {
      spsMultiplier: 1,
      costMultiplier: 1,
      timerSPS: 0,
      timerCost: 0,
      spsEndTime: null,
      costEndTime: null,
    },

    skills: createInitialSkills(),
  };
}

function createInitialSkills() {
  return {
    frenzy: createSkill(15000, 120000, "#ff4d4d"),
    overdrive: createSkill(30000, 300000, "#009ffd"),
    critStorm: createSkill(10000, 180000, "#ffcc00"),
    goldRush: createSkill(1000, 600000, "#4CAF50"),
    diamondPulse: createSkill(20000, 420000, "#b9f2ff"),
    efficiency: createSkill(45000, 600000, "#a0a0a0"),
    shards: createSkill(20000, 240000, "#e066ff"),
    hyperMinute: createSkill(60000, 900000, "#ff8c00"),
  };
}

function createSkill(duration, cooldownTime, color) {
  return {
    active: false,
    cooldown: false,
    duration,
    cooldownTime,
    color,
  };
}