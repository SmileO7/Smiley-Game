// js/GameInitializer.js

import { SaveSystem } from "./systems/SaveSystem.js";
import { InputSystem } from "./systems/InputSystem.js";
import { ModalSystem } from "./systems/ModalSystem.js";
import { DiamondMine } from "./systems/DiamondMine.js";
import { GuildSystem } from "./systems/GuildSystem.js";
import { PetSystem } from "./systems/PetSystem.js";
import { ChatSystem } from "./systems/ChatSystem.js";
import { SoundSystem } from "./systems/SoundSystem.js";
import { GemSystem } from "./systems/GemSystem.js";
import { SkinSystem } from "./systems/SkinSystem.js";
import { WikiSystem } from "./systems/WikiSystem.js";
import { PrestigeSystem } from "./systems/PrestigeSystem.js";
import { BuildingSystem } from "./systems/BuildingSystem.js";

export class GameInitializer {
  constructor(game) {
    this.game = game;
  }

  async init() {
    this.registerSystems();
    this.createSystemAliases();
    this.initializeSystems();
    this.initializeGameContent();
    this.setupEventListeners();
    this.startGameProcesses();
    this.initializeOnlineFeatures();

    this.game.updateUI();
  }

  registerSystems() {
    const game = this.game;

    game.systems = {
      save: new SaveSystem(game),
      input: new InputSystem(game),
      modal: new ModalSystem(game),

      buildings: new BuildingSystem(game),
      mine: new DiamondMine(game),
      guild: new GuildSystem(game),
      chat: new ChatSystem(game),
      pet: new PetSystem(game),
      sound: new SoundSystem(game),
      gem: new GemSystem(game),
      skin: new SkinSystem(game),
      wiki: new WikiSystem(game),
      prestige: new PrestigeSystem(game),
    };
  }

  createSystemAliases() {
    const game = this.game;
    const systems = game.systems;

    game.saveSystem = systems.save;
    game.inputSystem = systems.input;
    game.modalSystem = systems.modal;

    game.buildingSystem = systems.buildings;
    game.mineSystem = systems.mine;
    game.guildSystem = systems.guild;
    game.chatSystem = systems.chat;
    game.petSystem = systems.pet;
    game.soundSystem = systems.sound;
    game.gemSystem = systems.gem;
    game.skinSystem = systems.skin;
    game.wikiSystem = systems.wiki;
    game.prestigeSystem = systems.prestige;
  }

  initializeSystems() {
    const { game } = this;

    game.saveSystem.init();
    game.modalSystem.init();
    game.inputSystem.init();
  }

  initializeGameContent() {
    const { game } = this;

    game.checkOfflineProgress();

    game.createBuildingElements();
    game.renderPetShop();
    game.renderSkillUI();
    game.updateGlobalUpgradeUI();
    game.updatePrestigeUI();
    game.ladeAudioEinstellungen();
  }

  setupEventListeners() {
    const { game } = this;

    game.setupMainEventListeners();
    game.setupPrestigeButtons();
    game.setupSettingsModalListeners();
    game.setupInfoPageEventListeners();
    game.setupSkillTreeControls();
    game.setupTooltips();
  }

  startGameProcesses() {
    const { game } = this;

    game.restoreCooldowns();
    game.checkSkillUnlocks();
    game.startIntervals();
    game.updatePetInterval();
    game.updateNewsTicker();
  }

  initializeOnlineFeatures() {
    const { game } = this;

    game.guildSystem.listenToGuildData();
    game.initChat();
  }
}
