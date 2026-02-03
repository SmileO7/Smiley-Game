// --- IMPORTS (Modernes Firebase) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- KONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyAXLvyEnTMtVYMa5iOUXUFRoqDRfgClWDU",
    authDomain: "smiley-clicker-idle-empire.firebaseapp.com",
    databaseURL: "https://smiley-clicker-idle-empire-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "smiley-clicker-idle-empire",
    storageBucket: "smiley-clicker-idle-empire.firebasestorage.app",
    messagingSenderId: "883649043348",
    appId: "1:883649043348:web:daf31892a0d6d639ec8d81"
};

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
        if (!user) return; 

        // Deep Copy um Referenzen zu brechen
        const cleanData = JSON.parse(JSON.stringify(jsonData)); 

        try {
            await setDoc(doc(db, "users", user.uid), { 
                savedGame: cleanData, 
                date: new Date().toISOString()
            });
            console.log("☁️ Gespeichert in Firestore.");
        } catch (e) {
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

// --- EVENT LISTENER (Buttons verbinden) ---
// Da dies ein Modul ist, müssen wir die Buttons manuell suchen und verbinden,
// falls sie im HTML kein 'onclick' haben (wie der Login Button).
document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("google-login-btn");
    const logoutBtn = document.getElementById("google-logout-btn");

    if (loginBtn) {
        loginBtn.addEventListener("click", window.cloudSystem.login);
    }
    if (logoutBtn) {
        logoutBtn.addEventListener("click", window.cloudSystem.logout);
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