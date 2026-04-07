// --- IMPORTS ---
import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import firebaseConfig from './config.js';

// 1. Initialisierung (Verhindert "No App created" Fehler)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app); // WICHTIG: rtdb hier definieren!
const provider = new GoogleAuthProvider();

window.cloudSystem = {
    // 1. Die fehlende getUser Funktion wieder einbauen
    getUser: () => auth.currentUser,

    login: async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("Eingeloggt als:", result.user.displayName);
        } catch (error) {
            console.error("Login Fehler:", error);
        }
    },

    logout: async () => {
        await signOut(auth);
        console.log("Ausgeloggt.");
    },

    // 2. Umbenennen von load zu loadFromCloud (damit der Listener unten funktioniert)
    loadFromCloud: async () => {
        const user = auth.currentUser;
        if (!user) return null;
        try {
            const docSnap = await getDoc(doc(db, "users", user.uid));
            if (docSnap.exists()) {
                return docSnap.data().savedGame;
            }
        } catch (e) {
            console.error("Fehler beim Laden:", e);
        }
        return null;
    },

    // 3. Umbenennen von save zu saveToCloud
    saveToCloud: async (jsonData) => {
    const user = auth.currentUser;
    if (!user) return Promise.reject(new Error("Nicht eingeloggt")); 

    try {
        await setDoc(doc(db, "users", user.uid), { 
            savedGame: jsonData, 
            date: new Date().toISOString()
        });
        console.log("☁️ Gespeichert in Firestore.");
        return true; // Wichtig für das .then()
    } catch (e) {
        console.error("Fehler beim Speichern:", e);
        throw e; // Wichtig für das .catch()
    }
},

    checkUserGuild: async () => {
        const user = auth.currentUser;
        if (!user) return null;
        try {
            // WICHTIG: Nutze rtdb für Gilden
            const guildsRef = ref(rtdb, 'guilds');
            const snapshot = await get(guildsRef);
            if (snapshot.exists()) {
                const allGuilds = snapshot.val();
                for (const guildName in allGuilds) {
                    if (allGuilds[guildName].members && allGuilds[guildName].members[user.uid]) {
                        return { name: guildName, data: allGuilds[guildName] };
                    }
                }
            }
        } catch (error) {
            console.error("Gilden-Check Fehler:", error);
        }
        return null;
    }
};

// Gilden-Beitritt Funktion (angepasst auf rtdb)
window.cloudSystem.joinGuild = async (guildName) => {
    const user = auth.currentUser;
    if (!user) return;
    const memberId = user.uid;
    const guildRef = ref(rtdb, `guilds/${guildName}/members/${memberId}`);
    try {
        await set(guildRef, {
            role: "Member",
            joinedAt: Date.now(),
            playerName: user.displayName || "Anonymer Smiley"
        });
        location.reload(); // Seite neu laden, um UI zu refreshen
    } catch (error) {
        alert("Fehler beim Beitritt: " + error.message);
    }
};

// --- STATUS ÜBERWACHUNG ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("👤 User eingeloggt:", user.email);
        
        // Jetzt passt der Name!
        const cloudData = await window.cloudSystem.loadFromCloud();
        
        if (cloudData && window.gameInstance) {
            window.gameInstance.loadGame(cloudData);
            window.gameInstance.updateUI();
        }

        const userGuild = await window.cloudSystem.checkUserGuild();
        const guildDisplay = document.getElementById('guilds-content');
        
        if (userGuild && guildDisplay) {
            guildDisplay.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h3 style="color: #ffd700;">Gilde: ${userGuild.name}</h3>
                    <p>Rolle: ${userGuild.data.members[user.uid].role}</p>
                    <button class="buy-button">Chat öffnen</button>
                </div>`;
            const inputCont = document.querySelector('.guild-input-container');
            if(inputCont) inputCont.style.display = 'none';
        }
    }
});

// Event Listener
document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("google-login-btn");
    const logoutBtn = document.getElementById("google-logout-btn");
    if (loginBtn) loginBtn.addEventListener("click", window.cloudSystem.login);
    if (logoutBtn) logoutBtn.addEventListener("click", window.cloudSystem.logout);

    const joinBtn = document.getElementById("join-guild-btn");
    const inputField = document.getElementById("guild-name-input");
    if (joinBtn && inputField) {
        joinBtn.addEventListener("click", () => {
            const name = inputField.value.trim();
            if (name) window.cloudSystem.joinGuild(name);
        });
    }
});