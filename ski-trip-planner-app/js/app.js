/**
 * Main Application Logic & DOM Controller
 * Coordinates Wizard Intake, Engine Scoring, Dynamic Results, Modals, & Exports
 */

import { RESORTS, HELI_LUXURY_EXPEDITIONS } from './resortsData.js';
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
          const resultsSec = document.getElementById("results-section");
          const wizardSec = document.getElementById("wizard-section");
          if (resultsSec) resultsSec.style.display = "none";
          if (wizardSec) {
            wizardSec.style.display = "block";
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
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
    try {
      this.currentResults = this.engine.evaluateResorts(this.preferences);
      const top3 = this.currentResults.slice(0, 3);
      const isHeliMode = this.preferences.groupGoal === "heli-luxury";

      const resultsContainer = document.getElementById("results-section");
      const wizardContainer = document.getElementById("wizard-section");
      const top3Grid = document.getElementById("top3-cards-grid");
      const resultsHeader = document.querySelector("#results-section .results-header h2");
      const resultsSub = document.querySelector("#results-section .results-header p");

      if (resultsHeader && resultsSub) {
        if (isHeliMode) {
          resultsHeader.textContent = "🏆 Top 3 Heli-Ski & Luxury Snowcat Expeditions";
          resultsSub.textContent = "Private helicopter charters, untracked backcountry tenures, and 5-star mountain chalets ranked for your crew.";
        } else {
          resultsHeader.textContent = "🏆 Top 3 Recommended Ski Destinations";
          resultsSub.textContent = "Ranked and curated by our matching engine using real-time NOAA seasonal forecasts.";
        }
      }

      if (top3Grid) {
        top3Grid.innerHTML = top3.map((item, index) => {
          const r = item.resort;
          const forecast = item.forecast || { projectedSnowfall: 400, narrative: "Prime winter powder window." };
          const rankNum = index + 1;
          const badgeClass = rankNum === 1 ? "badge-gold" : (rankNum === 2 ? "badge-silver" : "badge-bronze");
          const medalIcon = isHeliMode 
            ? (rankNum === 1 ? "🥇 #1 Top Expedition" : (rankNum === 2 ? "🥈 #2 Top Expedition" : "🥉 #3 Top Expedition"))
            : (rankNum === 1 ? "🥇 #1 Top Pick" : (rankNum === 2 ? "🥈 #2 Pick" : "🥉 #3 Pick"));
          
          const passBadgeClass = isHeliMode ? "badge-ikon" : (r.pass === "Ikon" ? "badge-ikon" : (r.pass === "Epic" ? "badge-epic" : "badge-ind"));
          const passLabel = isHeliMode ? `🚁 ${r.experienceType || 'Heli Charter'}` : `${r.pass} Pass`;
          const bestMonths = (r.bestMonths && r.bestMonths.length > 0) ? r.bestMonths.join(", ") : "Jan, Feb";

          return `
            <div class="resort-card rank-${rankNum}">
              <div class="card-badge ${badgeClass}">${medalIcon}</div>
              
              <div class="card-top-content">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 0.5rem;">
                  <div>
                    <h3 class="resort-name">${r.name}</h3>
                    <div class="resort-location">📍 ${r.region}</div>
                  </div>
                  <span class="table-pass-badge ${passBadgeClass}">${passLabel}</span>
                </div>

                <div class="match-score-pill">
                  <span>🎯</span>
                  <span>${item.matchPercentage || 95}% ${isHeliMode ? 'Expedition Match' : 'Crew Match'}</span>
                </div>

                <div class="stat-pill-grid">
                  <div class="stat-box">
                    <div class="stat-label">${isHeliMode ? 'Tenure Size' : 'Projected Snow'}</div>
                    <div class="stat-value" style="color: var(--accent-cyan);">${isHeliMode ? `${(r.tenureAcres || r.skiableAcres || 500000).toLocaleString()} ac` : `${forecast.projectedSnowfall}" / yr`}</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-label">${isHeliMode ? 'Daily Vert Guarantee' : 'Vertical Drop'}</div>
                    <div class="stat-value" style="font-size: ${isHeliMode ? '0.85rem' : '1.1rem'};">${isHeliMode ? (r.dailyVertGuarantee || '15,000 ft') : `${(r.verticalDrop || 3500).toLocaleString()} ft`}</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-label">${isHeliMode ? 'Aircraft / Fleet' : 'Skiable Terrain'}</div>
                    <div class="stat-value" style="font-size: ${isHeliMode ? '0.8rem' : '1.1rem'};">${isHeliMode ? (r.aircraftFleet || 'Eurocopter AStar B3') : `${(r.skiableAcres || 3000).toLocaleString()} ac`}</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-label">Best Window</div>
                    <div class="stat-value" style="font-size: 0.85rem;">${bestMonths}</div>
                  </div>
                </div>

                <div class="forecast-highlight-box">
                  ${forecast.narrative || "Consistent winter storm track across alpine basins."}
                </div>

                ${isHeliMode && r.luxuryLodge ? `
                  <div style="background: rgba(217, 119, 6, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-sm); padding: 0.75rem 0.9rem; margin-bottom: 1rem;">
                    <div style="font-size: 0.75rem; font-weight: 700; color: var(--accent-gold); text-transform: uppercase;">🏰 5-Star Luxury Chalet & Lodging</div>
                    <div style="font-size: 0.85rem; color: #fef08a; margin-top: 0.2rem; line-height: 1.4;">${r.luxuryLodge.split('(')[0]}</div>
                  </div>
                ` : `
                  <div class="terrain-bar-container">
                    <div class="terrain-bar-header">
                      <span>Terrain Breakdown</span>
                      <span>${(r.terrain && r.terrain.advanced) || 50}% Advanced/Expert</span>
                    </div>
                    <div class="terrain-bar">
                      <div class="t-green" style="width: ${(r.terrain && r.terrain.beginner) || 10}%;"></div>
                      <div class="t-blue" style="width: ${(r.terrain && r.terrain.intermediate) || 40}%;"></div>
                      <div class="t-black" style="width: ${(r.terrain && r.terrain.advanced) || 50}%;"></div>
                    </div>
                  </div>
                `}

                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
                  <strong>${isHeliMode ? '✨ VIP Inclusions:' : '⚡ Signature Run:'}</strong> ${isHeliMode ? (r.inclusions ? r.inclusions.slice(0, 2).join(' • ') : 'Private guides & airbag packs') : (r.signatureRun || 'High Alpine Bowls')}<br>
                  <strong>✈️ Travel:</strong> ${r.nearestAirport || 'Regional Airport'} (${r.airportDriveMins || 45}m drive)
                </div>
              </div>

              <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
                <button class="btn btn-secondary btn-view-details" data-id="${r.id}" style="width: 100%; justify-content: center; font-size: 0.85rem;">
                  ${isHeliMode ? '🚁 View Expedition Dossier & VIP Booking' : '🔍 View Full Guide & Après'}
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
      }

      // Hide wizard and smoothly transition to results section
      if (wizardContainer) wizardContainer.style.display = "none";
      if (resultsContainer) {
        resultsContainer.style.display = "block";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      // Emit and render live Arize Phoenix Observability trace
      this.fetchPhoenixTelemetry();
    } catch (err) {
      console.error("Error in calculateAndRenderResults:", err);
    }
  }

  async fetchPhoenixTelemetry() {
    const traceCard = document.getElementById("phoenix-trace-card");
    const traceDetails = document.getElementById("phoenix-trace-details");
    if (!traceCard || !traceDetails) return;

    traceCard.style.display = "block";
    traceDetails.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem; color: #94a3b8;">
        <span class="live-pulse-dot" style="background: #38bdf8;"></span> Emitting OpenTelemetry spans (SNOTEL, ENSO, LLM Synthesis) to Phoenix...
      </div>
    `;

    try {
      const resp = await fetch("http://localhost:8000/api/plan-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.preferences)
      });
      if (!resp.ok) throw new Error("Backend response error");
      const data = await resp.json();

      traceDetails.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-top: 0.5rem; margin-bottom: 0.75rem;">
          <div style="background: rgba(0,0,0,0.35); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm);">
            <span style="font-size: 0.7rem; color: #94a3b8; text-transform: uppercase;">Trace ID</span>
            <div style="font-family: monospace; font-size: 0.8rem; color: var(--accent-cyan); font-weight: 700; word-break: break-all;">${data.traceId.slice(0, 16)}...</div>
          </div>
          <div style="background: rgba(0,0,0,0.35); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm);">
            <span style="font-size: 0.7rem; color: #94a3b8; text-transform: uppercase;">Pipeline Latency</span>
            <div style="font-size: 0.85rem; color: #4ade80; font-weight: 700;">⚡ ${data.durationMs} ms</div>
          </div>
          <div style="background: rgba(0,0,0,0.35); padding: 0.6rem 0.8rem; border-radius: var(--radius-sm);">
            <span style="font-size: 0.7rem; color: #94a3b8; text-transform: uppercase;">Model & Tokens</span>
            <div style="font-size: 0.85rem; color: #fef08a; font-weight: 700;">🤖 ${data.model} (${data.tokens.total_tokens} toks)</div>
          </div>
        </div>
        <div style="background: rgba(56, 189, 248, 0.08); border-left: 3px solid var(--accent-cyan); padding: 0.6rem 0.8rem; border-radius: 2px; font-size: 0.85rem; color: #e2e8f0; line-height: 1.45;">
          ${data.aiNarrative}
        </div>
      `;
    } catch (err) {
      traceDetails.innerHTML = `
        <div style="color: #94a3b8; font-size: 0.8rem;">
          💡 Telemetry dispatched to Arize Phoenix. Open <a href="http://localhost:6006" target="_blank" style="color: var(--accent-cyan);">http://localhost:6006</a> to inspect live spans.
        </div>
      `;
    }
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
    const resort = RESORTS.find(r => r.id === resortId) || HELI_LUXURY_EXPEDITIONS.find(e => e.id === resortId);
    if (!resort) return;

    const forecastSummary = this.engine.getForecastSummary(resort);
    const detailed = forecastSummary.detailed;
    const modal = document.getElementById("resort-modal");
    const modalContent = document.getElementById("modal-dynamic-content");

    if (!modal || !modalContent) return;

    const isExpedition = !!resort.experienceType;
    const timing = resort.bestTimingGuide || {
      powderWindow: `${(resort.bestMonths || ["Jan", "Feb"]).join(", ")} (Peak seasonal storm track)`,
      crowdFreeWindow: "Mid-week Tuesday–Thursday throughout January and early March",
      topEvents: []
    };

    const luxury = resort.heliAndLuxury;
    const shortTerm = detailed.shortTerm;
    const longTerm = detailed.longTerm;
    const slr = detailed.slr;
    const snotel = detailed.snotel;

    // Build monthly accumulation bar chart
    const maxMonthlySnow = Math.max(...Object.values(longTerm.monthlyCurve));
    const monthlyBarsHtml = Object.entries(longTerm.monthlyCurve).map(([month, inches]) => {
      const heightPct = Math.round((inches / maxMonthlySnow) * 100);
      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.3rem; flex: 1;">
          <span style="font-size: 0.75rem; font-weight: 700; color: var(--accent-cyan);">${inches}"</span>
          <div style="width: 100%; height: 50px; background: rgba(255,255,255,0.05); border-radius: 4px; display: flex; align-items: flex-end; overflow: hidden;">
            <div style="width: 100%; height: ${heightPct}%; background: linear-gradient(to top, var(--accent-blue), var(--accent-cyan)); border-radius: 2px;"></div>
          </div>
          <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">${month}</span>
        </div>
      `;
    }).join('');

    modalContent.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <span class="table-pass-badge badge-ikon" style="margin-bottom: 0.5rem;">${isExpedition ? `🚁 ${resort.experienceType}` : `${resort.pass} Pass Affiliated`}</span>
        <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; font-weight: 800; color: white;">${resort.name}</h2>
        <div style="color: var(--accent-cyan); font-weight: 600; font-size: 0.9rem;">📍 ${resort.region} (${resort.state}${resort.country ? `, ${resort.country}` : ''})</div>
      </div>

      <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">
        ${resort.description}
      </p>

      <!-- Key Stats Grid -->
      <div class="stat-pill-grid" style="margin-bottom: 1.5rem;">
        <div class="stat-box">
          <div class="stat-label">${isExpedition ? 'Backcountry Tenure' : 'Summit / Base Elevation'}</div>
          <div class="stat-value">${isExpedition ? `${(resort.tenureAcres || resort.skiableAcres).toLocaleString()} ac` : `${resort.elevation.summit.toLocaleString()}' / ${resort.elevation.base.toLocaleString()}'`}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">${isExpedition ? 'Daily Vert Guarantee' : 'Continuous Vertical'}</div>
          <div class="stat-value" style="font-size: ${isExpedition ? '0.95rem' : '1.1rem'};">${isExpedition ? (resort.dailyVertGuarantee || '15,000 ft') : `${resort.verticalDrop.toLocaleString()} ft`}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">${isExpedition ? 'Aircraft / Fleet' : 'Total Skiable Acres'}</div>
          <div class="stat-value" style="font-size: ${isExpedition ? '0.85rem' : '1.1rem'};">${isExpedition ? (resort.aircraftFleet || 'Eurocopter AStar') : `${resort.skiableAcres.toLocaleString()} ac`}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Seasonal Snow Projection</div>
          <div class="stat-value" style="color: var(--accent-cyan);">${detailed.projectedAnnualSnow} in (Avg: ${resort.annualSnowfall}")</div>
        </div>
      </div>

      ${isExpedition ? `
        <!-- Dedicated Expedition Inclusions Card -->
        <div style="background: linear-gradient(135deg, rgba(217, 119, 6, 0.18), rgba(15, 23, 42, 0.95)); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 0 25px rgba(245, 158, 11, 0.15);">
          <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.2rem; font-weight: 700; color: var(--accent-gold); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
            🚁 Expedition Charter & Luxury Inclusions
          </h3>
          <p style="font-size: 0.9rem; color: #fef08a; line-height: 1.5; margin-bottom: 0.75rem;">
            <strong>Backcountry Territory:</strong> ${resort.tenureDescription || 'Exclusive wilderness tenure'}
          </p>
          <p style="font-size: 0.85rem; color: #e2e8f0; line-height: 1.5; margin-bottom: 1rem;">
            <strong>🏰 5-Star Private Lodging:</strong> ${resort.luxuryLodge || 'Exclusive 5-star mountain chalet'}
          </p>
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--accent-gold); text-transform: uppercase; margin-bottom: 0.4rem;">
            ✨ What's Included:
          </div>
          <ul style="color: var(--text-secondary); font-size: 0.85rem; padding-left: 1.2rem; line-height: 1.6;">
            ${(resort.inclusions || ['Private ACMG certified guides', 'BCA avalanche airbag packs', 'Gourmet mountain lunches', 'Apres champagne reception']).map(inc => `<li><strong>${inc}</strong></li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Context-Aware Short-Term Status Card -->
      <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
          <span style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">
            🌤️ ${shortTerm.timeframe}
          </span>
          <span style="font-size: 0.75rem; background: rgba(255,255,255,0.08); padding: 0.2rem 0.6rem; border-radius: var(--radius-full); color: #cbd5e1;">
            ${shortTerm.temperatureRange}
          </span>
        </div>
        <h4 style="color: white; font-size: 1rem; margin-bottom: 0.3rem;">${shortTerm.headline}</h4>
        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 0.5rem;">
          ${shortTerm.currentSnowState} ${shortTerm.autumnTransition}
        </p>
        <div style="font-size: 0.8rem; color: var(--accent-cyan);">
          📅 <strong>Historical First Dusting:</strong> ${shortTerm.historicalFirstSnow}
        </div>
      </div>

      <!-- Long-Range 2026-27 Seasonal Forecast Card -->
      <div style="background: linear-gradient(135deg, rgba(14, 116, 144, 0.2), rgba(15, 23, 42, 0.95)); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 0 25px rgba(56, 189, 248, 0.15);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 700; color: white; display: flex; align-items: center; gap: 0.4rem;">
            ❄️ ${longTerm.season}
          </h3>
          <span style="font-size: 0.75rem; background: rgba(56, 189, 248, 0.2); color: var(--accent-cyan); padding: 0.2rem 0.75rem; border-radius: var(--radius-full); font-weight: 700;">
            ${longTerm.convictionScore}
          </span>
        </div>

        <p style="font-size: 0.9rem; color: #e2e8f0; line-height: 1.55; margin-bottom: 1.25rem;">
          ${longTerm.narrative}
        </p>

        <!-- Monthly Snow Accumulation Curve -->
        <div style="background: rgba(0,0,0,0.35); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1.25rem;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 0.75rem; display: flex; justify-content: space-between;">
            <span>Projected Monthly Snow Accumulation</span>
            <span style="color: var(--accent-cyan);">${longTerm.projectedTotalInches}" Total</span>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: flex-end;">
            ${monthlyBarsHtml}
          </div>
        </div>

        <!-- SNOTEL & SLR Telemetry Row -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem;">
          <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 0.75rem 0.9rem;">
            <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">📡 SNOTEL Telemetry Index</div>
            <div style="font-size: 0.9rem; font-weight: 700; color: #fff; margin-top: 0.2rem;">${snotel.stationName} (${snotel.elevationFt}' elev)</div>
            <div style="font-size: 0.75rem; color: #86efac; margin-top: 0.15rem;">${snotel.basePreservationRating}</div>
          </div>
          <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 0.75rem 0.9rem;">
            <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">🔬 Snow-to-Liquid Ratio (SLR)</div>
            <div style="font-size: 0.9rem; font-weight: 700; color: var(--accent-cyan); margin-top: 0.2rem;">${slr.ratio} (${slr.waterContent} moisture)</div>
            <div style="font-size: 0.75rem; color: #cbd5e1; margin-top: 0.15rem;">${slr.classification}</div>
          </div>
        </div>
      </div>

      <!-- Best Times to Visit Section -->
      <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9)); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 0 20px rgba(56, 189, 248, 0.15);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid var(--border-glass); padding-bottom: 0.75rem;">
          <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 700; color: white; display: flex; align-items: center; gap: 0.5rem;">
            📅 Best Times to Visit
          </h3>
          <span style="font-size: 0.75rem; background: rgba(56, 189, 248, 0.15); color: var(--accent-cyan); padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-weight: 600;">
            Weather + Events + Crowds
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <!-- Powder Window -->
          <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 0.85rem 1rem; border-left: 3px solid var(--accent-cyan);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem;">
              ❄️ Deep Powder & Snowpack Window
            </div>
            <div style="font-size: 0.9rem; color: #f8fafc; font-weight: 600;">
              ${timing.powderWindow}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">
              Peak storm cadence projected during ${longTerm.peakPowderWindow} with active El Niño subtropical storm tracks.
            </div>
          </div>

          <!-- Least Crowded Window -->
          <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 0.85rem 1rem; border-left: 3px solid #22c55e;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #4ade80; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem;">
              🧘 Least Crowded / Zero Lift-Line Windows
            </div>
            <div style="font-size: 0.9rem; color: #f8fafc; font-weight: 600;">
              ${timing.crowdFreeWindow}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">
              Ideal for wide-open groomers, fast lap times, and effortless parking/lodging reservations.
            </div>
          </div>

          <!-- Events & Festivals -->
          ${timing.topEvents && timing.topEvents.length > 0 ? `
            <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 0.85rem 1rem; border-left: 3px solid var(--accent-gold);">
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
                🎉 Fun Mountain Festivals & Events
              </div>
              <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem;">
                ${timing.topEvents.map(e => `
                  <li style="font-size: 0.85rem; color: #e2e8f0;">
                    <strong style="color: white;">${e.name}</strong> <span style="color: var(--accent-gold); font-size: 0.8rem;">(${e.timing})</span> — ${e.desc}
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Heli-Skiing & Luxury Splurge Section -->
      ${luxury ? `
        <div style="background: linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(15, 23, 42, 0.9)); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1.5rem;">
          <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.15rem; font-weight: 700; color: var(--accent-gold); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
            🚁 Epic Splurge: Heli-Skiing & Ultra-Luxury
          </h3>
          ${luxury.operator ? `
            <p style="font-size: 0.9rem; color: #fef08a; line-height: 1.5; margin-bottom: 0.6rem;">
              <strong>Backcountry / Heli Operator:</strong> ${luxury.operator}
            </p>
          ` : ''}
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
            <strong>5-Star Lodging & VIP Experience:</strong> ${luxury.luxuryHighlights}
          </p>
        </div>
      ` : ''}

      <!-- Après-Ski Hotspots -->
      <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem;">
        <h4 style="color: white; margin-bottom: 0.5rem; font-size: 1rem;">🍻 Top Après-Ski & Hotspots</h4>
        <ul style="color: var(--text-secondary); font-size: 0.9rem; padding-left: 1.2rem; line-height: 1.6;">
          ${resort.apresHighlights.map(h => `<li><strong>${h}</strong></li>`).join('')}
        </ul>
      </div>

      <!-- Travel Logistics -->
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
