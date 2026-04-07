// --- IMPORTS (Modernes Firebase) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import firebaseConfig from './config.js';

// 1. Initialisierung Modern (für Cloud Save & Auth)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// 2. Initialisierung Kompatibilität (für Chat/Global Scripts falls nötig)
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("🔥 Globales Firebase (Legacy) initialisiert.");
}

console.log("✅ Firebase Logic geladen!");

// --- SYSTEM FUNKTIONEN ---
window.cloudSystem = {
    // Einloggen
    login: async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("Eingeloggt als:", result.user.displayName);
        } catch (error) {
            console.error("Login Fehler:", error);
            alert("Fehler: " + error.message);
        }
    },

    // Ausloggen
    logout: async () => {
        await signOut(auth);
        console.log("Ausgeloggt.");
        // UI Update passiert automatisch durch onAuthStateChanged in der HTML
        // oder wir erzwingen ein Neuladen der Seite:
        // location.reload(); 
    },

    // Speichern (Leise)
    save: async (jsonData) => {
    const user = auth.currentUser;
    const cloudIcon = document.getElementById('cloud-save-status');
    if (!user) return; 

    // Visuelles Feedback: Start
    if (cloudIcon) {
        cloudIcon.className = 'saving';
        cloudIcon.title = "Speichere in Cloud...";
    }

    const cleanData = JSON.parse(JSON.stringify(jsonData)); 

    try {
        await setDoc(doc(db, "users", user.uid), { 
            savedGame: cleanData, 
            date: new Date().toISOString()
        });
        
        // Visuelles Feedback: Erfolg
        if (cloudIcon) {
            cloudIcon.className = 'success';
            cloudIcon.title = "Cloud-Sync: OK";
            // Nach 3 Sekunden zurück auf neutral
            setTimeout(() => { cloudIcon.className = ''; }, 3000);
        }
        console.log("☁️ Gespeichert in Firestore.");
    } catch (e) {
        // Visuelles Feedback: Fehler
        if (cloudIcon) {
            cloudIcon.className = 'error';
            cloudIcon.title = "Cloud-Sync Fehler!";
        }
        console.error("Fehler beim Speichern:", e);
        throw e; 
    }
},

    // Laden
    load: async () => {
        const user = auth.currentUser;
        if (!user) {
            alert("Du bist nicht eingeloggt!");
            return null;
        }
        try {
            const docSnap = await getDoc(doc(db, "users", user.uid));
            if (docSnap.exists()) {
                console.log("📥 Spielstand geladen.");
                return docSnap.data().savedGame;
            } else {
                alert("Kein Spielstand in der Cloud gefunden.");
                return null;
            }
        } catch (e) {
            console.error("Fehler beim Laden:", e);
            alert("Laden fehlgeschlagen: " + e.message);
            return null;
        }
    },
    
    getUser: () => auth.currentUser
};

// Funktion zum Beitreten oder Erstellen einer Gilde
window.cloudSystem.joinGuild = async (guildName) => {
    const user = auth.currentUser;
    if (!user) {
        console.error("Du musst eingeloggt sein, um einer Gilde beizutreten!");
        return;
    }

    const memberId = user.uid;
    const guildRef = ref(db, `guilds/${guildName}/members/${memberId}`);

    try {
        // Wir speichern die Daten genau so, wie es die .validate-Regel verlangt
        await set(guildRef, {
            role: "Member", // Standard-Rolle
            joinedAt: Date.now(),
            playerName: user.displayName || "Anonymer Smiley"
        });
        
        console.log(`✅ Erfolg: Du bist jetzt Mitglied der Gilde ${guildName}!`);
        
        // Initialer Eintrag in die Bank (optional, falls noch nicht vorhanden)
        const bankRef = ref(db, `guilds/${guildName}/bank`);
        const bankSnap = await get(bankRef);
        if (!bankSnap.exists()) {
            await set(bankRef, 0);
        }

    } catch (error) {
        console.error("Fehler beim Gilden-Beitritt:", error.message);
        alert("Beitritt verweigert: Entweder existiert die Gilde nicht oder du hast keine Rechte.");
    }
};

// --- EVENT LISTENER (Buttons verbinden) ---
// Da dies ein Modul ist, müssen wir die Buttons manuell suchen und verbinden,
// falls sie im HTML kein 'onclick' haben (wie der Login Button).
document.addEventListener("DOMContentLoaded", () => {
    // Bestehende Login/Logout Buttons
    const loginBtn = document.getElementById("google-login-btn");
    const logoutBtn = document.getElementById("google-logout-btn");

    if (loginBtn) {
        loginBtn.addEventListener("click", window.cloudSystem.login);
    }
    if (logoutBtn) {
        logoutBtn.addEventListener("click", window.cloudSystem.logout);
    }

    // --- NEU: Gilden-Logik ---
    const joinBtn = document.getElementById("join-guild-btn");
    const inputField = document.getElementById("guild-name-input");

    if (joinBtn && inputField) {
        joinBtn.addEventListener("click", () => {
            const name = inputField.value.trim();
            if (name) {
                // Hier rufen wir die Funktion auf, die wir vorhin erstellt haben
                window.cloudSystem.joinGuild(name);
            } else {
                alert("Bitte gib einen Gilden-Namen ein!");
            }
        });
    }
});

// --- STATUS ÜBERWACHUNG ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("👤 User erkannt:", user.email);
        // Optional: Hier könnte man automatischen Load anstoßen, wenn gewünscht
    } else {
        console.log("👤 Kein User eingeloggt.");
    }
});