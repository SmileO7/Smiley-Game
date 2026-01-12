//================================================================================================================
//--- SPIELSTART (ENTRY POINT) ---
//================================================================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("Starte SmileyGame...");

    // WICHTIG: Mit 'window.' machen wir die Instanz global verfügbar,
    // damit die HTML-Buttons (onclick="gameInstance.switchView(...)") sie finden.
    window.gameInstance = new SmileyGame();

    console.log("SmileyGame gestartet und global verfügbar!");
});