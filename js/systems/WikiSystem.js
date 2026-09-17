export class WikiSystem {
  openWiki() {
    const modal = document.getElementById("wiki-modal");
    if (modal) {
      // ✅ RICHTIG: openModal verwenden (setzt is-open Klasse)
      this.openModal("wiki-modal");
      this.openWikiPage("buildings");

      // Close Button Event
      const closeBtn = document.getElementById("close-wiki-button");
      if (closeBtn) {
        // removeEventListener trick um doppelte Events zu vermeiden
        const newBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newBtn, closeBtn);
        newBtn.onclick = () => this.closeModal("wiki-modal"); // ✅ Auch closeModal verwenden
      }
    }
  }

  openWikiPage(pageName) {
    const container = document.getElementById("wiki-content-area");
    if (!container) return;

    // 1. Sidebar Buttons aktualisieren (Highlight setzen)
    document.querySelectorAll(".wiki-nav-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("onclick").includes(pageName)) {
        btn.classList.add("active");
      }
    });

    // 2. Container leeren
    container.innerHTML = "";

    // 3. Temporären Wrapper erstellen
    const wrapper = document.createElement("div");
    wrapper.className = "info-grid";

    // Switch: Welcher Inhalt soll rein?
    switch (pageName) {
      case "buildings":
        wrapper.id = "info_buildings_container";
        container.appendChild(wrapper);
        this.createBuildingInfoElements();
        break;
      case "upgrades":
        wrapper.id = "info_global_upgrades_container";
        container.appendChild(wrapper);
        this.createInfoGlobalUpgradeElements();
        break;
      case "prestige":
        wrapper.id = "info_prestige_container";
        container.appendChild(wrapper);
        this.createPrestigeInfoList();
        break;
      case "achievements":
        wrapper.id = "info_achievements_container";
        container.appendChild(wrapper);
        this.createInfoAchievementElements();
        break;
      case "pets":
        wrapper.id = "info_pets_container";
        container.appendChild(wrapper);
        this.createInfoPetsElements();
        break;
      case "stats":
        wrapper.id = "info_stats_container";
        container.appendChild(wrapper);
        this.createInfoStatsElements();
        break;
      case "museum":
        wrapper.id = "museum_grid"; // WICHTIG: Die ID, die renderMuseum sucht
        container.appendChild(wrapper);
        this.renderMuseum(wrapper); // Ruft die Museum-Logik auf
        break;
      case "gem_empire":
        wrapper.id = "gem_shop_container";
        container.appendChild(wrapper);
        this.gemSystem.renderGemShop("gem_shop_container");
        break;
    }
  }
}
