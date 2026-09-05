// js/systems/ChatSystem.js

// ================================================================================================================
// === SUB-SYSTEM: CHAT & FIREBASE ===
// ================================================================================================================
// ================================================================================================================
// === SUB-SYSTEM: CHAT & FIREBASE ===
// ================================================================================================================

export class ChatSystem {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.currentChatChannel = "global";
    this.chatHistory = { global: [], guild: [] };
    this.chatListeners = {};
    this.chatRef = null;
    console.log("💬 ChatSystem geladen.");
  }

  initChat() {
    if (!this.game.gameState.chatSettings) {
      this.game.gameState.chatSettings = {
        muteGlobal: false,
        muteGuild: false,
      };
    }

    if (typeof firebase === "undefined" || !firebase.apps.length) {
      console.warn("Chat deaktiviert: Firebase fehlt.");
      return;
    }

    const btnGlobal = this.game.getById("btn-chat-global");
    const btnGuild = this.game.getById("btn-chat-guild");
    const btnMute = this.game.getById("btn-chat-mute");
    const sendBtn = this.game.getById("btn-chat-send");
    const inputField = this.game.getById("chat-input");
    const toggleBtn = this.game.getById("btn-chat-toggle");

    // 1. Tab-Logik
    if (btnGlobal && btnGuild) {
      btnGlobal.onclick = () => {
        this.currentChatChannel = "global";
        this.updateChatTabsUI();
        this.renderChatHistory("global");
        this.switchChatChannel("global");
      };

      btnGuild.onclick = () => {
        if (!this.game.gameState.guildName) {
          this.game.showNotification("Du bist in keiner Gilde!", "error");
          return;
        }
        this.currentChatChannel = "guild";
        this.updateChatTabsUI();
        this.renderChatHistory("guild");
        this.switchChatChannel("guild");
      };
    }

    // 2. Mute-Logik
    if (btnMute) {
      this.updateMuteButtonUI();
      btnMute.onclick = () => {
        const settings = this.game.gameState.chatSettings;
        if (this.currentChatChannel === "global") {
          settings.muteGlobal = !settings.muteGlobal;
          this.game.showNotification(
            settings.muteGlobal ? "Global stumm 🔕" : "Global aktiv 🔔",
            "info",
          );
        } else {
          settings.muteGuild = !settings.muteGuild;
          this.game.showNotification(
            settings.muteGuild ? "Gilde stumm 🔕" : "Gilde aktiv 🔔",
            "info",
          );
        }
        this.updateMuteButtonUI();
        this.game.speichereSpiel();
      };
    }

    // 3. Minimieren
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        const container = document.getElementById("main-chat-container");
        if (container) {
          container.classList.toggle("chat-minimized");
          toggleBtn.innerText = container.classList.contains("chat-minimized")
            ? "➕"
            : "➖";
        }
      };
    }

    // 4. Senden & Enter/Tab
    if (sendBtn) sendBtn.onclick = () => this.sendChatMessage();
    if (inputField) {
      inputField.onkeydown = (e) => {
        if (e.key === "Enter") this.sendChatMessage();
        if (e.key === "Tab") {
          e.preventDefault();
          if (this.currentChatChannel === "global") {
            if (this.game.gameState.guildName && btnGuild) btnGuild.click();
            else this.game.showNotification("Keine Gilde!", "error");
          } else {
            if (btnGlobal) btnGlobal.click();
          }
        }
      };
    }

    this.setupChatNameChange();
    this.startBackgroundListeners();

    // Standard laden
    if (btnGlobal) btnGlobal.click();

    // Gilden-Liste starten falls vorhanden
    if (this.game.gameState.guildName) {
      this.startGuildMemberListener();
    }
  }

  switchChatChannel(type) {
    if (typeof firebase === "undefined" || !this.game.gameState.guildName)
      return;
    const chatContainer = document.getElementById("chat-messages");
    if (chatContainer) chatContainer.innerHTML = "";

    if (this.chatRef) this.chatRef.off();

    let path = "chat/global";
    if (type === "guild") {
      const safeName = this.game.gameState.guildName.replace(/\s+/g, "_");
      path = `chat/guilds/${safeName}`;
    }

    this.chatRef = firebase.database().ref(path);
    this.chatRef.limitToLast(20).on("child_added", (snapshot) => {
      const data = snapshot.val();
      if (data && data.text)
        this.displayChatMessage(
          data.user || data.sender,
          data.text,
          type,
          data.isSystem,
        );
    });
  }

  sendChatMessage() {
    if (typeof firebase === "undefined" || !this.game.gameState.guildName)
      return;
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (text === "" || !this.chatRef) return;

    const msgData = {
      user: this.game.gameState.playerName,
      userId: this.game.gameState.playerId,
      text: text,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    };

    this.chatRef.push(msgData).catch((err) => {
      console.error("Fehler beim Senden:", err);
      this.game.showNotification("Verbindungsfehler!", "error");
    });
    input.value = "";
  }

  displayChatMessage(user, text, type, isSystem = false) {
    const container = document.getElementById("chat-messages");
    if (!container) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-msg ${type}`;
    const isMe = user === this.game.gameState.playerName;

    if (isSystem || user === "SYSTEM") {
      // Spezielles Styling für System-Nachrichten
      msgDiv.style.cssText =
        "color: #009ffd; font-style: italic; font-size: 0.85em; margin: 5px 0; border-left: 3px solid #009ffd; padding-left: 8px; background: rgba(0, 159, 253, 0.05); border-radius: 0 4px 4px 0;";
      msgDiv.innerText = `📢 ${text}`;
    } else {
      msgDiv.innerHTML = `<strong style="color:${isMe ? "#009ffd" : "#aaa"}">${user}:</strong> ${text}`;
    }

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
  }

  startBackgroundListeners() {
    this.chatHistory = { global: [], guild: [] };

    const globalRef = firebase.database().ref("chat/global");
    globalRef.limitToLast(20).on("child_added", (snapshot) => {
      this.handleIncomingMessage("global", snapshot.val());
    });

    if (this.game.gameState.guildName) {
      const safeName = this.game.gameState.guildName.replace(/\s+/g, "_");
      const guildRef = firebase.database().ref(`chat/guilds/${safeName}`);
      guildRef.limitToLast(20).on("child_added", (snapshot) => {
        const data = snapshot.val();
        if (data && data.text) this.handleIncomingMessage("guild", data);
      });
    }
  }

  handleIncomingMessage(channel, data) {
    if (!data) return;
    const settings = this.game.gameState.chatSettings;
    const isGlobalMuted = settings ? settings.muteGlobal : false;
    const isGuildMuted = settings ? settings.muteGuild : false;

    if (channel === "global" && isGlobalMuted) return;
    if (channel === "guild" && isGuildMuted) return;

    if (!this.chatHistory[channel]) this.chatHistory[channel] = [];
    this.chatHistory[channel].push(data);
    if (this.chatHistory[channel].length > 50)
      this.chatHistory[channel].shift();

    // Roter Punkt Logik
    if (this.currentChatChannel !== channel) {
      const btnId = channel === "global" ? "btn-chat-global" : "btn-chat-guild";
      const btn = document.getElementById(btnId);
      if (btn) btn.classList.add("has-notification");
    }
  }

  updateChatTabsUI() {
    const btnGlobal = document.getElementById("btn-chat-global");
    const btnGuild = document.getElementById("btn-chat-guild");

    if (this.currentChatChannel === "global") {
      if (btnGlobal) {
        btnGlobal.classList.add("active");
        btnGlobal.classList.remove("has-notification");
      }
      if (btnGuild) btnGuild.classList.remove("active");
    } else {
      if (btnGuild) {
        btnGuild.classList.add("active");
        btnGuild.classList.remove("has-notification");
      }
      if (btnGlobal) btnGlobal.classList.remove("active");
    }
    this.updateMuteButtonUI();
  }

  updateMuteButtonUI() {
    const btnMute = document.getElementById("btn-chat-mute");
    if (!btnMute) return;
    const settings = this.game.gameState.chatSettings;
    let isMuted =
      this.currentChatChannel === "global"
        ? settings?.muteGlobal
        : settings?.muteGuild;

    if (isMuted) {
      btnMute.innerText = "🔕";
      btnMute.classList.add("muted");
    } else {
      btnMute.innerText = "🔔";
      btnMute.classList.remove("muted");
    }
  }

  renderChatHistory(channel) {
    const container = document.getElementById("chat-messages");
    if (!container) return;
    container.innerHTML = "";
    if (this.chatHistory && this.chatHistory[channel]) {
      this.chatHistory[channel].forEach((msg) => {
        this.displayChatMessage(msg.user, msg.text, channel);
      });
    }
    container.scrollTop = container.scrollHeight;
  }

  setupChatNameChange() {
    const nameSpan = document.getElementById("current-player-name");
    if (nameSpan && this.game.gameState.playerName) {
      nameSpan.innerText = this.game.gameState.playerName;
    }
    const displayElement = document.getElementById("chat-user-display");
    if (displayElement) {
      displayElement.onclick = () => {
        const newName = prompt(
          "Wie möchtest du heißen?",
          this.game.gameState.playerName,
        );
        if (newName && newName.trim().length > 0) {
          this.game.gameState.playerName = newName.trim().substring(0, 15);
          if (nameSpan) nameSpan.innerText = this.game.gameState.playerName;
          this.game.speichereSpiel();
          this.game.showNotification("Name geändert!", "success");
        }
      };
    }
  }

  // --- GILDEN MITGLIEDER LOGIK (War vorher in SmileyGame) ---

  syncGuildStats() {
    if (typeof firebase === "undefined" || !this.game.gameState.guildName)
      return;
    const state = this.game.gameState;
    if (!state.guildName || !state.playerId || typeof firebase === "undefined")
      return;

    // Wir säubern den Namen für Firebase
    const safeGuildName = state.guildName.replace(/\s+/g, "_");

    // KORREKTUR: 'chat/' am Anfang entfernt. Jetzt passt es zu deinen Regeln!
    const myMemberRef = firebase
      .database()
      .ref(`guilds/${safeGuildName}/members/${state.playerId}`);

    const myStats = {
      name: state.playerName,
      smileys: Math.floor(state.aktuelle_smileys || 0),
      lastSeen: firebase.database.ServerValue.TIMESTAMP,
    };

    myMemberRef
      .update(myStats)
      .catch((err) => console.warn("Gilden-Sync Fehler:", err));
  }

  startGuildMemberListener() {
    const state = this.game.gameState;
    if (typeof firebase === "undefined" || !state.guildName) return;

    const safeGuildName = state.guildName.replace(/\s+/g, "_");

    // KORREKTUR: 'chat/' am Anfang entfernt! Jetzt guckt er im richtigen Ordner.
    const membersRef = firebase
      .database()
      .ref(`guilds/${safeGuildName}/members`);

    membersRef.on("value", (snapshot) => {
      const members = [];
      snapshot.forEach((child) => {
        members.push(child.val());
      });

      // NEUE SORTIERUNG: Wer am meisten gespendet hat, ist Platz 1! 🏆
      members.sort((a, b) => (b.donated || 0) - (a.donated || 0));

      this.renderGuildMemberList(members);
    });
  }

  renderGuildMemberList(members) {
    const listBody = document.getElementById("guild-list-body");
    if (!listBody) return;
    listBody.innerHTML = "";

    members.forEach((member, index) => {
      const row = document.createElement("div");
      row.className = "guild-member-row";
      // Sauberes Flex-Layout für die Spalten
      row.style.cssText =
        "display:flex; justify-content:space-between; align-items:center; padding:8px 5px; border-bottom:1px solid rgba(255,255,255,0.05);";

      const isOnline = Date.now() - member.lastSeen < 5 * 60 * 1000;
      const statusIcon = isOnline ? "🟢" : "⚫";

      // Smileys formatieren
      let scoreDisplay = member.smileys;
      if (member.smileys >= 1000000000)
        scoreDisplay = (member.smileys / 1000000000).toFixed(2) + "B";
      else if (member.smileys >= 1000000)
        scoreDisplay = (member.smileys / 1000000).toFixed(2) + "M";
      else if (member.smileys >= 1000)
        scoreDisplay = (member.smileys / 1000).toFixed(1) + "k";

      // Spenden formatieren
      let donatedDisplay = member.donated || 0;
      if (donatedDisplay >= 1000000000)
        donatedDisplay = (donatedDisplay / 1000000000).toFixed(2) + "B";
      else if (donatedDisplay >= 1000000)
        donatedDisplay = (donatedDisplay / 1000000).toFixed(2) + "M";
      else if (donatedDisplay >= 1000)
        donatedDisplay = (donatedDisplay / 1000).toFixed(1) + "k";

      // Den eigenen Namen hervorheben
      const isMe =
        member.name === this.game.gameState.playerName
          ? "color:#009ffd; font-weight:bold;"
          : "color:#fff;";

      row.innerHTML = `
                <div style="flex:1; display:flex; gap:10px; align-items:center;">
                    <span style="color:#aaa; font-size:0.9em; width:20px;">#${index + 1}</span>
                    <span style="${isMe}">
                        ${statusIcon} ${member.name}
                    </span>
                </div>
                <div style="flex:1; text-align:right; display:flex; flex-direction:column; align-items:flex-end;">
                    <span style="color:#FFD700; font-size:0.9em;">🪙 ${scoreDisplay}</span>
                    <span style="color:#4CAF50; font-size:0.75em; background:rgba(76, 175, 80, 0.1); padding:2px 6px; border-radius:4px; margin-top:4px; border:1px solid rgba(76, 175, 80, 0.3);">
                        Gespendet: ${donatedDisplay}
                    </span>
                </div>
            `;
      listBody.appendChild(row);
    });
  }

  toggleGuildView() {
    const chatView = document.getElementById("chat-messages");
    const listView = document.getElementById("guild-member-view");
    const btnList = document.getElementById("btn-guild-list");

    if (listView.style.display === "none") {
      chatView.style.display = "none";
      listView.style.display = "flex";
      btnList.classList.add("active");
    } else {
      listView.style.display = "none";
      chatView.style.display = "flex";
      btnList.classList.remove("active");
    }
  }

  sendGuildSystemMessage(text) {
    if (typeof firebase === "undefined" || !this.game.gameState.guildName)
      return;
    const state = this.game.gameState;
    if (!state.guildName || typeof firebase === "undefined") return;

    const safeGuildName = state.guildName.replace(/\s+/g, "_");
    const chatRef = firebase.database().ref(`guilds/${safeGuildName}/chat`);

    chatRef.push({
      sender: "SYSTEM",
      text: text,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      isSystem: true, // Flag für spezielles Styling
    });
  }
}
