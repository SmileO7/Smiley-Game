const { JSDOM, VirtualConsole } = require('jsdom');
const path = require('path');
const fs = require('fs');

(async () => {
  const projectDir = path.resolve(__dirname);
  const indexPath = path.join(projectDir, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.error('index.html not found at', indexPath);
    process.exit(2);
  }

  const vConsole = new VirtualConsole();
  const logs = [];
  const errors = [];
  vConsole.on('log', (msg) => logs.push({ type: 'log', msg }));
  vConsole.on('error', (msg) => errors.push({ type: 'error', msg }));
  vConsole.on('warn', (msg) => logs.push({ type: 'warn', msg }));
  vConsole.on('info', (msg) => logs.push({ type: 'info', msg }));

  try {
    const dom = await JSDOM.fromFile(indexPath, {
      runScripts: 'dangerously',
      resources: 'usable',
      virtualConsole: vConsole,
      pretendToBeVisual: true,
    });

    // Warte kurz, damit externe scripts ausgeführt werden
    await new Promise((res) => setTimeout(res, 500));

    const { window } = dom;

    // Fange mögliche Exceptions (ungefangen) ab
    let exceptionThrown = null;
    window.addEventListener('error', (e) => {
      exceptionThrown = e.error || e.message || e;
      errors.push({ type: 'window.error', msg: String(exceptionThrown) });
    });

    // Prüfe zentrale Elemente
    const report = {
      foundSmileyButton: !!window.document.getElementById('smiley_button'),
      foundBuildingGrid: !!window.document.querySelector('.building-grid'),
      foundUpgradeGrid: !!window.document.querySelector('.upgrade-grid'),
      initialAktuelleSmileys: typeof window.aktuelle_smileys !== 'undefined' ? window.aktuelle_smileys : null,
      totalSPS: typeof window.totalSPS !== 'undefined' ? window.totalSPS : null,
      buildingCountsLength: Array.isArray(window.buildingCounts) ? window.buildingCounts.length : null,
      prestigeUpgradesCount: Array.isArray(window.prestigeUpgradesData) ? window.prestigeUpgradesData.length : null,
      localStorageKeys: Object.keys(window.localStorage || {}),
      logsCaptured: logs.slice(-20),
      errorsCaptured: errors.slice(-20),
      exceptionThrown: exceptionThrown,
    };

    // Simuliere Klick auf Smiley (falls vorhanden)
    const smileyBtn = window.document.getElementById('smiley_button');
    if (smileyBtn) {
      try {
        smileyBtn.click();
      } catch (e) {
        errors.push({ type: 'click-exception', msg: String(e) });
      }
    }

    // Warte etwas nach Klick
    await new Promise((res) => setTimeout(res, 200));

    // Aktualisiere Bericht
    report.afterClickAktuelleSmileys = typeof window.aktuelle_smileys !== 'undefined' ? window.aktuelle_smileys : null;
    report.afterClickTotalSPS = typeof window.totalSPS !== 'undefined' ? window.totalSPS : null;
    report.localStorageNow = JSON.parse(window.localStorage.getItem('smileyClickerSave') || 'null');

    console.log('\n---- HEADLESS TEST REPORT ----');
    console.log(JSON.stringify(report, null, 2));
    console.log('---- END REPORT ----\n');

    if (errors.length > 0) {
      console.error('Errors captured during run:');
      errors.forEach((e) => console.error(e));
      process.exitCode = 1;
    } else {
      console.log('No errors captured.');
    }

    // Sauber aufräumen
    window.close && window.close();
  } catch (e) {
    console.error('Exception while running headless test:', e);
    process.exit(3);
  }
})();