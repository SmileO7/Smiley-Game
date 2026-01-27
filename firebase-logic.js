// firebase-logic.js

// 1. Importiere die Funktionen von Google (Version 10.7.1 - das läuft stabil)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. Deine Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyAXLvyEnTMtVYMa5iOUXUFRoqDRfgClWDU",
    authDomain: "smiley-clicker-idle-empire.firebaseapp.com",
    projectId: "smiley-clicker-idle-empire",
    storageBucket: "smiley-clicker-idle-empire.firebasestorage.app",
    messagingSenderId: "883649043348",
    appId: "1:883649043348:web:daf31892a0d6d639ec8d81"
};

// 3. Starten
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

console.log("Firebase wurde geladen!");

// 4. Das System global verfügbar machen
window.cloudSystem = {
    // Einloggen
    login: async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("Eingeloggt als:", result.user.displayName);
            // Hier kein Alert mehr, wir sehen es ja am UI
        } catch (error) {
            console.error("Login Fehler:", error);
            alert("Fehler: " + error.message);
        }
    },

    // Ausloggen
    logout: async () => {
        await signOut(auth);
        console.log("Ausgeloggt.");
    },

    // Speichern (JETZT LEISE! 🤫)
    save: async (jsonData) => {
        const user = auth.currentUser;
        if (!user) return; // Einfach abbrechen, wenn nicht eingeloggt

        // Der Waschgang für saubere Daten
        const cleanData = JSON.parse(JSON.stringify(jsonData)); 

        try {
            await setDoc(doc(db, "users", user.uid), { 
                savedGame: cleanData, 
                date: new Date().toISOString()
            });
            // HIER WAR DER FEHLER! JETZT NUR NOCH LOG:
            console.log("✅ Daten erfolgreich an Firestore gesendet.");
        } catch (e) {
            console.error("Fehler beim Speichern:", e);
            throw e; // Fehler weitergeben, damit index.html ihn sieht
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

// Login-Status überwachen
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User erkannt:", user.email);
    }
});