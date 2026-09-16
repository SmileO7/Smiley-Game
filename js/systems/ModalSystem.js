// js/systems/ModalSystem.js

export class ModalSystem {
  constructor(game) {
    this.game = game;
    this.activeModals = new Set();

    this.handleKeyDown = this.handleKeyDown(this);
  }

  init() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  open(id) {
    const modal = document.getElementById(id);
    if (!modal) {
      console.warn("Modal nicht gefunden: ${id}");
      return;
    }
    modal.classList.add("is-open");
    this.activeModals.add(id);
  }

  close(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.classList.remove("is-open");
    this.activeModals.delete(id);
  }
  closeTop() {
    const lastModal = [...this.activeModals].at(-1);
    if (lastModal) this.close(lastModal);
  }

  closeAll() {
    for (const id of this.activeModals) {
      this.close(id);
    }
  }

  handleKeyDown(event) {
    if (event.key === "Escape") {
      this.closeTop();
    }
  }

  destroy() {
    document.removeEventListener("keydown", this.handleKeyDown);
    this.closeAll();
  }
}
