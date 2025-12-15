//================================================================================================================
//--- SPIELSTART (ENTRY POINT) ---
//================================================================================================================

// Die Spielinstanz muss hier global deklariert werden, damit sie von der Konsole erreichbar ist.
let gameInstance;

document.addEventListener('DOMContentLoaded', () => {
    gameInstance = new SmileyGame();
});