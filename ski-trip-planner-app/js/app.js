/**
 * Main Application Logic & DOM Controller
 * Coordinates Wizard Intake, Engine Scoring, Dynamic Results, Modals, & Exports
 */

import { RESORTS } from './resortsData.js';
import { WeatherMatchingEngine } from './weatherEngine.js';
import { initSnowCanvas } from './snowCanvas.js';

class SkiPlannerApp {
  constructor() {
    this.engine = new WeatherMatchingEngine();
    this.currentStep = 1;
    this.totalSteps = 4;

    this.preferences = {
      skillLevel: "advanced",
      groupSize: "4 buddies",
      groupGoal: "gnarly-lines",
      snowPriority: "powder",
      travelMode: "fly",
      homeLocation: "San Francisco, CA",
      passAffiliation: "any"
    };

    this.currentResults = [];
    this.activeFilter = "all";

    this.init();
  }

  init() {
    // Start falling snow canvas background
    initSnowCanvas("snow-canvas");

    // Bind event listeners
    this.bindWizardEvents();
    this.populateLiveEnso();
    this.bindTableFilters();
    this.bindModalEvents();
    this.bindExportEvents();

    // Render initial state
    this.updateWizardView();
    this.renderComparisonTable();
  }

  populateLiveEnso() {
    const data = this.engine.getLiveEnsoData();
    if (!data) return;
    const tag = document.getElementById("enso-status-tag");
    const sst = document.getElementById("enso-sst-val");
    const conf = document.getElementById("enso-conf-val");
    const summary = document.getElementById("enso-summary-text");
    const favored = document.getElementById("enso-favored-tags");
    
    if (tag) tag.textContent = `⚡ ${data.phaseName}`;
    if (sst) sst.textContent = data.ninoIndex;
    if (conf) conf.textContent = data.confidence;
    if (summary) summary.textContent = data.summary;
    if (favored && data.favoredRegions) {
      favored.innerHTML = data.favoredRegions.map(r => `<span class="f-tag">${r}</span>`).join('');
    }
  }

  bindWizardEvents() {
    // Option Card Selection
    document.querySelectorAll(".option-grid").forEach(grid => {
      grid.addEventListener("click", (e) => {
        const card = e.target.closest(".option-card");
        if (!card) return;

        const field = card.dataset.field;
        const value = card.dataset.value;

        // Toggle selection visuals
        grid.querySelectorAll(`.option-card[data-field="${field}"]`).forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");

        // Save preference
        this.preferences[field] = value;
      });
    });

    // Text inputs
    const homeInput = document.getElementById("input-home-location");
    if (homeInput) {
      homeInput.addEventListener("input", (e) => {
        this.preferences.homeLocation = e.target.value.trim() || "San Francisco, CA";
      });
    }

    const sizeInput = document.getElementById("input-group-size");
    if (sizeInput) {
      sizeInput.addEventListener("input", (e) => {
        this.preferences.groupSize = e.target.value.trim() || "4 buddies";
      });
    }

    // Step Navigation Buttons
    const btnNext = document.getElementById("btn-wizard-next");
    const btnPrev = document.getElementById("btn-wizard-prev");
    const btnRestart = document.getElementById("btn-restart-wizard");

    if (btnNext) {
      btnNext.addEventListener("click", () => {
        if (this.currentStep < this.totalSteps) {
          this.currentStep++;
          this.updateWizardView();
        } else {
          this.calculateAndRenderResults();
        }
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener("click", () => {
        if (this.currentStep > 1) {
          this.currentStep--;
          this.updateWizardView();
        }
      });
    }

    if (btnRestart) {
      btnRestart.addEventListener("click", () => {
        this.currentStep = 1;
        this.updateWizardView();
        document.getElementById("results-section").style.display = "none";
        document.getElementById("wizard-section").style.display = "block";
        document.getElementById("wizard-section").scrollIntoView({ behavior: "smooth" });
      });
    }

    // Step indicators click
    document.querySelectorAll(".step-indicator").forEach(indicator => {
      indicator.addEventListener("click", () => {
        const targetStep = parseInt(indicator.dataset.step);
        if (targetStep <= this.currentStep || this.currentResults.length > 0) {
          this.currentStep = targetStep;
          this.updateWizardView();
        }
      });
    });
  }

  updateWizardView() {
    // Update step panels
    document.querySelectorAll(".wizard-step").forEach(step => {
      step.classList.remove("active");
      if (parseInt(step.dataset.step) === this.currentStep) {
        step.classList.add("active");
      }
    });

    // Update progress indicators
    document.querySelectorAll(".step-indicator").forEach(indicator => {
      const stepNum = parseInt(indicator.dataset.step);
      indicator.classList.remove("active", "completed");
      if (stepNum === this.currentStep) {
        indicator.classList.add("active");
      } else if (stepNum < this.currentStep) {
        indicator.classList.add("completed");
      }
    });

    // Update progress bar line
    const progressFill = document.querySelector(".progress-bar-fill");
    if (progressFill) {
      const percentage = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
      progressFill.style.width = `${percentage}%`;
    }

    // Update buttons
    const btnPrev = document.getElementById("btn-wizard-prev");
    const btnNext = document.getElementById("btn-wizard-next");

    if (btnPrev) {
      btnPrev.style.visibility = this.currentStep === 1 ? "hidden" : "visible";
    }

    if (btnNext) {
      if (this.currentStep === this.totalSteps) {
        btnNext.innerHTML = `⚡ Find Gnarliest Trips`;
        btnNext.className = "btn btn-accent";
      } else {
        btnNext.innerHTML = `Continue →`;
        btnNext.className = "btn btn-primary";
      }
    }
  }

  calculateAndRenderResults() {
    this.currentResults = this.engine.evaluateResorts(this.preferences);
    const top3 = this.currentResults.slice(0, 3);

    const resultsContainer = document.getElementById("results-section");
    const wizardContainer = document.getElementById("wizard-section");
    const top3Grid = document.getElementById("top3-cards-grid");

    if (!top3Grid || !resultsContainer) return;

    top3Grid.innerHTML = top3.map((item, index) => {
      const r = item.resort;
      const forecast = item.forecast;
      const rankNum = index + 1;
      const badgeClass = rankNum === 1 ? "badge-gold" : (rankNum === 2 ? "badge-silver" : "badge-bronze");
      const medalIcon = rankNum === 1 ? "🥇 #1 Top Pick" : (rankNum === 2 ? "🥈 #2 Pick" : "🥉 #3 Pick");
      const passBadgeClass = r.pass === "Ikon" ? "badge-ikon" : (r.pass === "Epic" ? "badge-epic" : "badge-ind");

      return `
        <div class="resort-card rank-${rankNum}">
          <div class="card-badge ${badgeClass}">${medalIcon}</div>
          
          <div class="card-top-content">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 0.5rem;">
              <div>
                <h3 class="resort-name">${r.name}</h3>
                <div class="resort-location">📍 ${r.region}</div>
              </div>
              <span class="table-pass-badge ${passBadgeClass}">${r.pass} Pass</span>
            </div>

            <div class="match-score-pill">
              <span>🎯</span>
              <span>${item.matchPercentage}% Crew Match</span>
            </div>

            <div class="stat-pill-grid">
              <div class="stat-box">
                <div class="stat-label">Projected Snow</div>
                <div class="stat-value" style="color: var(--accent-cyan);">${forecast.projectedSnowfall}" / yr</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Vertical Drop</div>
                <div class="stat-value">${r.verticalDrop.toLocaleString()} ft</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Skiable Terrain</div>
                <div class="stat-value">${r.skiableAcres.toLocaleString()} ac</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Best Window</div>
                <div class="stat-value" style="font-size: 0.9rem;">${r.bestMonths.join(", ")}</div>
              </div>
            </div>

            <div class="forecast-highlight-box">
              ${forecast.narrative}
            </div>

            <div class="terrain-bar-container">
              <div class="terrain-bar-header">
                <span>Terrain Breakdown</span>
                <span>${r.terrain.advanced}% Advanced/Expert</span>
              </div>
              <div class="terrain-bar">
                <div class="t-green" style="width: ${r.terrain.beginner}%;" title="Beginner: ${r.terrain.beginner}%"></div>
                <div class="t-blue" style="width: ${r.terrain.intermediate}%;" title="Intermediate: ${r.terrain.intermediate}%"></div>
                <div class="t-black" style="width: ${r.terrain.advanced}%;" title="Advanced: ${r.terrain.advanced}%"></div>
              </div>
            </div>

            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
              <strong>⚡ Signature Run:</strong> ${r.signatureRun}<br>
              <strong>✈️ Travel:</strong> ${r.nearestAirport} (${r.airportDriveMins}m drive)
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
            <button class="btn btn-secondary btn-view-details" data-id="${r.id}" style="width: 100%; justify-content: center; font-size: 0.85rem;">
              🔍 View Full Guide & Après
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners to cards' details buttons
    top3Grid.querySelectorAll(".btn-view-details").forEach(btn => {
      btn.addEventListener("click", () => {
        this.openResortModal(btn.dataset.id);
      });
    });

    // Show results section
    resultsContainer.style.display = "block";
    resultsContainer.scrollIntoView({ behavior: "smooth" });
  }

  bindTableFilters() {
    document.querySelectorAll(".filter-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.activeFilter = pill.dataset.filter;
        this.renderComparisonTable();
      });
    });
  }

  renderComparisonTable() {
    const tableBody = document.getElementById("comparison-table-body");
    if (!tableBody) return;

    let filtered = [...RESORTS];
    if (this.activeFilter === "ikon") {
      filtered = filtered.filter(r => r.pass === "Ikon");
    } else if (this.activeFilter === "epic") {
      filtered = filtered.filter(r => r.pass === "Epic");
    } else if (this.activeFilter === "indy") {
      filtered = filtered.filter(r => r.pass === "Independent");
    } else if (this.activeFilter === "steeps") {
      filtered = filtered.filter(r => r.terrain.advanced >= 45);
    } else if (this.activeFilter === "apres") {
      filtered = filtered.filter(r => r.vibe.includes("party-apres"));
    }

    tableBody.innerHTML = filtered.map(r => {
      const forecast = this.engine.getForecastSummary(r);
      const passBadgeClass = r.pass === "Ikon" ? "badge-ikon" : (r.pass === "Epic" ? "badge-epic" : "badge-ind");

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: #fff;">${r.name}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">📍 ${r.region}</div>
          </td>
          <td><span class="table-pass-badge ${passBadgeClass}">${r.pass}</span></td>
          <td>
            <span style="font-weight: 700; color: var(--accent-cyan);">${forecast.projectedSnowfall}"</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);"> (Avg ${r.annualSnowfall}")</span>
          </td>
          <td>${r.verticalDrop.toLocaleString()} ft</td>
          <td>${r.skiableAcres.toLocaleString()} ac</td>
          <td>${r.terrain.advanced}%</td>
          <td>${r.bestMonths.join(", ")}</td>
          <td>
            <button class="btn btn-secondary btn-table-view" data-id="${r.id}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
              Details
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tableBody.querySelectorAll(".btn-table-view").forEach(btn => {
      btn.addEventListener("click", () => {
        this.openResortModal(btn.dataset.id);
      });
    });
  }

  bindModalEvents() {
    const modal = document.getElementById("resort-modal");
    const closeBtn = document.getElementById("modal-close-btn");

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("open");
      });

      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("open");
      });
    }
  }

  openResortModal(resortId) {
    const resort = RESORTS.find(r => r.id === resortId);
    if (!resort) return;

    const forecast = this.engine.getForecastSummary(resort);
    const modal = document.getElementById("resort-modal");
    const modalContent = document.getElementById("modal-dynamic-content");

    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <span class="table-pass-badge" style="margin-bottom: 0.5rem;">${resort.pass} Pass Affiliated</span>
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; font-weight: 800; color: white;">${resort.name}</h2>
        <div style="color: var(--accent-cyan); font-weight: 600; font-size: 0.9rem;">📍 ${resort.region} (${resort.state})</div>
      </div>

      <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">
        ${resort.description}
      </p>

      <div class="stat-pill-grid" style="margin-bottom: 1.5rem;">
        <div class="stat-box">
          <div class="stat-label">Summit / Base Elevation</div>
          <div class="stat-value">${resort.elevation.summit.toLocaleString()}' / ${resort.elevation.base.toLocaleString()}'</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Continuous Vertical</div>
          <div class="stat-value">${resort.verticalDrop.toLocaleString()} ft</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Total Skiable Acres</div>
          <div class="stat-value">${resort.skiableAcres.toLocaleString()} ac</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Seasonal Snow Projection</div>
          <div class="stat-value" style="color: var(--accent-cyan);">${forecast.projectedSnowfall} in</div>
        </div>
      </div>

      <div class="forecast-highlight-box" style="margin-bottom: 1.5rem;">
        <strong>❄️ Long-Range Seasonal Outlook:</strong><br>
        ${forecast.narrative}
      </div>

      <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem;">
        <h4 style="color: white; margin-bottom: 0.5rem; font-size: 1rem;">🍻 Top Après-Ski & Hotspots</h4>
        <ul style="color: var(--text-secondary); font-size: 0.9rem; padding-left: 1.2rem; line-height: 1.6;">
          ${resort.apresHighlights.map(h => `<li><strong>${h}</strong></li>`).join('')}
        </ul>
      </div>

      <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
        <h4 style="color: white; margin-bottom: 0.5rem; font-size: 1rem;">✈️ Travel Logistics & Hubs</h4>
        <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">
          <strong>Nearest Regional Airport:</strong> ${resort.nearestAirport} (${resort.airportDriveMins} mins drive)<br>
          <strong>Nearest Major Hub:</strong> ${resort.nearestMajorHub}
        </p>
      </div>
    `;

    modal.classList.add("open");
  }

  bindExportEvents() {
    const btnCopy = document.getElementById("btn-copy-itinerary");
    if (btnCopy) {
      btnCopy.addEventListener("click", () => {
        if (this.currentResults.length === 0) return;
        const top3 = this.currentResults.slice(0, 3);
        
        let text = `⛷️ SKI TRIP PLANNER: RECOMMENDED DESTINATIONS\n`;
        text += `==================================================\n`;
        text += `Crew Profile: ${this.preferences.groupSize}, Level: ${this.preferences.skillLevel.toUpperCase()}\n`;
        text += `Home Location: ${this.preferences.homeLocation}\n\n`;

        top3.forEach((item, idx) => {
          const r = item.resort;
          text += `#${idx + 1}: ${r.name} (${r.region})\n`;
          text += `  • Match Score: ${item.matchPercentage}%\n`;
          text += `  • Projected Snowfall: ${item.forecast.projectedSnowfall}" (Peak: ${r.bestMonths.join(", ")})\n`;
          text += `  • Vertical: ${r.verticalDrop}' | Terrain: ${r.terrain.advanced}% Expert\n`;
          text += `  • Signature Run: ${r.signatureRun}\n`;
          text += `  • Nearest Airport: ${r.nearestAirport} (${r.airportDriveMins} mins)\n\n`;
        });

        navigator.clipboard.writeText(text).then(() => {
          this.showToast("📋 Trip Summary copied to clipboard for your crew!");
        }).catch(() => {
          this.showToast("Could not copy automatically. Check permissions.");
        });
      });
    }
  }

  showToast(message) {
    const toast = document.getElementById("toast-notification");
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 3500);
  }
}

// Instantiate on DOM load
document.addEventListener("DOMContentLoaded", () => {
  window.skiApp = new SkiPlannerApp();
});
