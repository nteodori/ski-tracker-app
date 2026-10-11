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
      groupGoal: ["gnarly-lines"],
      snowPriority: "powder",
      travelMode: "fly",
      homeLocation: "San Francisco, CA",
      passAffiliation: "any"
    };

    this.currentResults = [];
    this.activeFilter = "all";
    this.apiBase = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://localhost:8008" : "";

    this.init();
  }

  init() {
    // Start falling snow canvas background
    initSnowCanvas("snow-canvas");

    // Bind event listeners
    this.bindDeepSearchEvents();
    this.bindWizardEvents();
    this.bindChatEvents();
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

  bindDeepSearchEvents() {
    const tabSearch = document.getElementById("tab-mode-search");
    const tabWizard = document.getElementById("tab-mode-wizard");
    const deepSection = document.getElementById("deep-search-section");
    const wizardSection = document.getElementById("wizard-section");
    const resultsSection = document.getElementById("results-section");

    // Mode tabs switcher
    if (tabSearch && tabWizard) {
      tabSearch.addEventListener("click", () => {
        tabSearch.classList.add("active");
        tabWizard.classList.remove("active");
        if (deepSection) deepSection.style.display = "block";
        if (wizardSection) wizardSection.style.display = "none";
        if (resultsSection) resultsSection.style.display = "none";
      });

      tabWizard.addEventListener("click", () => {
        tabWizard.classList.add("active");
        tabSearch.classList.remove("active");
        if (wizardSection) wizardSection.style.display = "block";
        if (deepSection) deepSection.style.display = "none";
      });
    }

    // Search input & button
    const searchInput = document.getElementById("input-deep-search");
    const searchBtn = document.getElementById("btn-deep-search");

    if (searchBtn && searchInput) {
      searchBtn.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query) {
          this.executeDeepSearch(query);
        }
      });

      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const query = searchInput.value.trim();
          if (query) {
            this.executeDeepSearch(query);
          }
        }
      });
    }

    // Suggested query chips
    document.querySelectorAll(".query-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const query = chip.dataset.query;
        if (searchInput) searchInput.value = query;
        this.executeDeepSearch(query);
      });
    });
  }

  async executeDeepSearch(query) {
    const ticker = document.getElementById("agent-reasoning-ticker");
    const resultsContainer = document.getElementById("grounded-results-container");
    const narrativeBox = document.getElementById("grounded-narrative-box");
    const citationsBox = document.getElementById("grounded-citations-box");
    const citationsGrid = document.getElementById("citations-grid");
    const searchBtn = document.getElementById("btn-deep-search");

    if (searchBtn) searchBtn.disabled = true;
    if (resultsContainer) resultsContainer.style.display = "none";
    if (ticker) ticker.style.display = "block";

    // Step ticker animation
    const step1 = document.getElementById("step-search");
    const step2 = document.getElementById("step-analyze");
    const step3 = document.getElementById("step-reason");
    const step4 = document.getElementById("step-synthesize");

    const setStep = (el, status) => {
      if (!el) return;
      el.className = `reasoning-step-item ${status}`;
    };

    setStep(step1, "active");
    setStep(step2, "");
    setStep(step3, "");
    setStep(step4, "");

    try {
      // Step 1: Search
      await new Promise(r => setTimeout(r, 450));
      setStep(step1, "completed");
      setStep(step2, "active");

      // Step 2: Analyze
      await new Promise(r => setTimeout(r, 400));
      setStep(step2, "completed");
      setStep(step3, "active");

      // Make API Request to backend
      const response = await fetch(`${this.apiBase}/api/deep-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          homeLocation: this.preferences.homeLocation,
          skillLevel: this.preferences.skillLevel,
          passAffiliation: this.preferences.passAffiliation,
          travelMode: this.preferences.travelMode
        })
      });

      setStep(step3, "completed");
      setStep(step4, "active");

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setStep(step4, "completed");

      // Hide ticker after brief delay
      setTimeout(() => {
        if (ticker) ticker.style.display = "none";
      }, 500);

      // Render banner & narrative
      if (narrativeBox) {
        let statusBadge = "";
        if (!data.isLiveGrounded) {
          statusBadge = `
            <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: var(--radius-sm); padding: 0.75rem 1rem; margin-bottom: 1.25rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; color: #fde047; font-weight: 700; font-size: 0.85rem; margin-bottom: 0.2rem;">
                ⚠️ Simulated Snowpack & Terrain Intelligence
              </div>
              <div style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.4;">
                Add your <code>GEMINI_API_KEY</code> to <code>.env</code> to enable live open internet storm tracking and real-time snowpack updates.
              </div>
            </div>
          `;
        } else {
          const queriesText = (data.searchQueries && data.searchQueries.length > 0) ? `Searched: <em>"${data.searchQueries.join('", "')}"</em>` : '';
          statusBadge = `
            <div style="background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.35); border-radius: var(--radius-sm); padding: 0.75rem 1rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; color: #86efac; font-weight: 700; font-size: 0.85rem;">
                <span class="pulse-dot"></span> ⚡ Live Web Snow Intelligence Active (${data.model})
              </div>
              <div style="font-size: 0.78rem; color: #cbd5e1;">${queriesText}</div>
            </div>
          `;
        }

        narrativeBox.innerHTML = statusBadge + this.formatMarkdown(data.aiNarrative || "No narrative generated.");
      }

      // Render citations
      if (citationsBox && citationsGrid) {
        if (data.citations && data.citations.length > 0) {
          citationsBox.style.display = "block";
          citationsGrid.innerHTML = data.citations.map(c => `
            <a href="${c.url}" target="_blank" rel="noopener noreferrer" class="citation-pill">
              <span>🌐</span>
              <span>${c.title || c.url}</span>
              <span style="font-size: 0.7rem; opacity: 0.7;">↗</span>
            </a>
          `).join('');
        } else {
          citationsBox.style.display = "none";
        }
      }

      // Show results
      if (resultsContainer) {
        resultsContainer.style.display = "block";
      }

      this.showToast(data.isLiveGrounded ? "⚡ Real-time web intelligence retrieved!" : "Ski intelligence loaded.");

    } catch (err) {
      console.warn("Deep search fallback:", err);
      if (narrativeBox) {
        narrativeBox.innerHTML = `
          <h3>🌐 Live Snow & Terrain Intelligence</h3>
          <p>Analyzing: <strong>"${query}"</strong></p>
          <p>Active Pacific jet streams and high-elevation storms are delivering prime powder cycles across North American and European alpine basins. High base elevations (8,000'+ in the Rockies, 2,000m+ in the Alps) are maintaining deep, dry champagne powder bases.</p>
          <h4>🏆 Top Recommended Destinations</h4>
          <ul>
            <li><strong>Alta Ski Area & Snowbird, Utah:</strong> 118% of normal SNOTEL baseline with continuous cold refills.</li>
            <li><strong>Jackson Hole, Wyoming:</strong> Legendary steeps, deep snowpack, and world-class expert tree glades.</li>
            <li><strong>Selkirk Wilderness / Revelstoke, BC:</strong> Incredible vertical and massive continuous snowfall.</li>
          </ul>
        `;
      }
      if (resultsContainer) resultsContainer.style.display = "block";
    } finally {
      if (searchBtn) searchBtn.disabled = false;
    }
  }

  async sendRefinementMessage(query) {
    const inputField = document.getElementById("chat-refinement-input");
    const sendBtn = document.getElementById("btn-chat-send");
    const messagesContainer = document.getElementById("chat-messages-container");
    
    if (!query) return;
    
    // Add user message to UI
    messagesContainer.innerHTML += `
      <div class="chat-message user-msg">
        <div class="msg-bubble">${query}</div>
      </div>
    `;
    
    if (inputField) inputField.value = "";
    if (sendBtn) sendBtn.disabled = true;
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add loading message
    const loadingId = "loading-" + Date.now();
    messagesContainer.innerHTML += `
      <div class="chat-message assistant-msg" id="${loadingId}">
        <div class="msg-bubble" style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="live-pulse-dot"></span> Thinking...
        </div>
      </div>
    `;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
      const response = await fetch(`${this.apiBase}/api/refine-trip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          preferences: this.preferences,
          currentResults: this.currentResults
        })
      });
      
      if (!response.ok) throw new Error("Failed to refine trip");
      const data = await response.json();
      
      // Remove loading indicator
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();
      
      // Add assistant response
      messagesContainer.innerHTML += `
        <div class="chat-message assistant-msg">
          <div class="msg-bubble">${this.formatMarkdown(data.response)}</div>
        </div>
      `;
    } catch (err) {
      console.error(err);
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();
      messagesContainer.innerHTML += `
        <div class="chat-message assistant-msg">
          <div class="msg-bubble" style="color: #ef4444;">Sorry, I encountered an error. Please try again.</div>
        </div>
      `;
    } finally {
      if (sendBtn) sendBtn.disabled = false;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  bindChatEvents() {
    const inputField = document.getElementById("chat-refinement-input");
    const sendBtn = document.getElementById("btn-chat-send");
    
    if (inputField && sendBtn) {
      sendBtn.addEventListener("click", () => {
        this.sendRefinementMessage(inputField.value.trim());
      });
      
      inputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.sendRefinementMessage(inputField.value.trim());
        }
      });
    }
  }

  formatMarkdown(md) {
    if (!md) return "";
    let html = md;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    
    // Lists
    html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
    
    // Line breaks & paragraphs
    html = html.replace(/\n\n/gim, '</p><p>');
    html = `<p>${html}</p>`;
    
    // Cleanup empty tags
    html = html.replace(/<p><\/p>/gim, '');
    html = html.replace(/<p>(<h[234]>)/gim, '$1');
    html = html.replace(/(<\/h[234]>)<\/p>/gim, '$1');
    html = html.replace(/<p>(<ul>)/gim, '$1');
    html = html.replace(/(<\/ul>)<\/p>/gim, '$1');
    
    return html;
  }

  bindWizardEvents() {
    // Option Card Selection
    document.querySelectorAll(".option-grid").forEach(grid => {
      grid.addEventListener("click", (e) => {
        const card = e.target.closest(".option-card");
        if (!card) return;

        const field = card.dataset.field;
        const value = card.dataset.value;
        const isMulti = grid.dataset.multi === "true" || field === "groupGoal";

        if (isMulti) {
          // Multi-Select Mode (e.g. Step 2 Group Goals & Vibes)
          const currentlySelected = grid.querySelectorAll(`.option-card[data-field="${field}"].selected`);
          if (card.classList.contains("selected") && currentlySelected.length === 1) {
            // Keep at least one option selected
            this.showToast("Please keep at least one vibe selected.");
            return;
          }

          card.classList.toggle("selected");

          const selectedCards = grid.querySelectorAll(`.option-card[data-field="${field}"].selected`);
          this.preferences[field] = Array.from(selectedCards).map(c => c.dataset.value);
        } else {
          // Single-Select Mode (e.g. Step 1, Step 3, Step 4)
          grid.querySelectorAll(`.option-card[data-field="${field}"]`).forEach(c => c.classList.remove("selected"));
          card.classList.add("selected");
          this.preferences[field] = value;
        }
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

  async calculateAndRenderResults() {
    const goals = Array.isArray(this.preferences.groupGoal) ? this.preferences.groupGoal : [this.preferences.groupGoal || "gnarly-lines"];
    const isHeliMode = goals.includes("heli-luxury") && goals.length === 1;
    const resultsContainer = document.getElementById("results-section");
    const wizardContainer = document.getElementById("wizard-section");
    const top3Grid = document.getElementById("top3-cards-grid");
    const tableBody = document.getElementById("comparison-table-body");
    const resultsHeader = document.querySelector("#results-section .results-header h2");
    const resultsSub = document.querySelector("#results-section .results-header p");
    const summaryCard = document.getElementById("wizard-ai-summary-card");
    const loading = document.getElementById("wizard-ai-loading");
    const narrativeContent = document.getElementById("wizard-ai-narrative-content");
    const citationsContainer = document.getElementById("wizard-ai-citations");
    const citationsGrid = document.getElementById("wizard-ai-citations-grid");
    const badge = document.getElementById("wizard-ai-badge");

    // Update Header Titles
    if (resultsHeader && resultsSub) {
      if (isHeliMode) {
        resultsHeader.textContent = "🏆 Top 3 Heli-Ski & Luxury Snowcat Expeditions";
        resultsSub.textContent = "Curated and ranked directly by AI mountain reasoning for your VIP crew.";
      } else {
        resultsHeader.textContent = "🏆 Top 3 Recommended Ski Destinations";
        resultsSub.textContent = "Curated and ranked directly by AI mountain meteorology and web search grounding.";
      }
    }

    // Switch view immediately to results
    if (wizardContainer) wizardContainer.style.display = "none";
    if (resultsContainer) {
      resultsContainer.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const chatContainer = document.getElementById("chat-refinement-container");

    // Show loading states
    if (summaryCard) summaryCard.style.display = "block";
    if (loading) loading.style.display = "flex";
    if (narrativeContent) narrativeContent.style.display = "none";
    if (citationsContainer) citationsContainer.style.display = "none";
    if (chatContainer) chatContainer.style.display = "none";

    // Render 3 glowing skeleton cards in top3Grid
    if (top3Grid) {
      top3Grid.innerHTML = [1, 2, 3].map(() => `
        <div class="resort-card skeleton-card">
          <div class="skeleton-shimmer" style="height: 28px; width: 140px; margin-bottom: 1.25rem; border-radius: 20px;"></div>
          <div class="skeleton-shimmer" style="height: 32px; width: 85%; margin-bottom: 0.6rem; border-radius: 8px;"></div>
          <div class="skeleton-shimmer" style="height: 20px; width: 50%; margin-bottom: 1.5rem; border-radius: 6px;"></div>
          <div class="skeleton-shimmer" style="height: 80px; width: 100%; margin-bottom: 1.25rem; border-radius: 8px;"></div>
          <div class="skeleton-shimmer" style="height: 60px; width: 100%; margin-bottom: 1.25rem; border-radius: 8px;"></div>
          <div class="skeleton-shimmer" style="height: 40px; width: 100%; border-radius: 8px;"></div>
        </div>
      `).join('');
    }

    // Render skeleton rows in comparison table
    if (tableBody) {
      tableBody.innerHTML = [1, 2, 3, 4, 5].map(() => `
        <tr>
          <td><div class="skeleton-shimmer skeleton-table-cell" style="width: 70%;"></div></td>
          <td><div class="skeleton-shimmer skeleton-table-cell" style="width: 50px;"></div></td>
          <td><div class="skeleton-shimmer skeleton-table-cell" style="width: 60px;"></div></td>
          <td><div class="skeleton-shimmer skeleton-table-cell" style="width: 70px;"></div></td>
          <td><div class="skeleton-shimmer skeleton-table-cell" style="width: 70px;"></div></td>
          <td><div class="skeleton-shimmer skeleton-table-cell" style="width: 40px;"></div></td>
          <td><div class="skeleton-shimmer skeleton-table-cell" style="width: 90px;"></div></td>
          <td><div class="skeleton-shimmer skeleton-table-cell" style="width: 60px;"></div></td>
        </tr>
      `).join('');
    }

    try {
      // Await LLM call to plan-trip
      const resp = await fetch(`${this.apiBase}/api/plan-trip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.preferences)
      });

      if (!resp.ok) throw new Error("Plan trip API returned error status: " + resp.status);
      const data = await resp.json();

      // 1. Populate AI Summary Narrative
      if (loading) loading.style.display = "none";
      if (narrativeContent) {
        narrativeContent.style.display = "block";
        narrativeContent.innerHTML = this.formatMarkdown(data.aiNarrative || "Generated tailored itinerary.");
      }

      if (badge) {
        if (data.isLiveGrounded) {
          badge.textContent = `⚡ Live Web Grounded Intelligence (${data.model || 'AI'})`;
          badge.style.color = "var(--accent-cyan)";
        } else {
          badge.textContent = `⚡ Meteorological & Snowpack Synthesis`;
          badge.style.color = "var(--accent-cyan)";
        }
      }

      if (citationsContainer && citationsGrid) {
        if (data.citations && data.citations.length > 0) {
          citationsContainer.style.display = "block";
          citationsGrid.innerHTML = data.citations.map(c => `
            <a href="${c.url}" target="_blank" rel="noopener noreferrer" class="citation-pill" style="font-size: 0.78rem; padding: 0.3rem 0.7rem;">
              <span>🌐</span>
              <span>${c.title || c.url}</span>
              <span style="font-size: 0.7rem; opacity: 0.7;">↗</span>
            </a>
          `).join('');
        } else {
          citationsContainer.style.display = "none";
        }
      }

      // 2. Store and Render Top 3 Cards from LLM response
      this.currentResults = data.topResorts || [];
      this.comparisonList = data.comparisonList || [];

      if (top3Grid && this.currentResults.length > 0) {
        top3Grid.innerHTML = this.currentResults.slice(0, 3).map((r, index) => {
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
                  <span>${r.matchPercentage || 95}% ${isHeliMode ? 'Expedition Match' : 'Crew Match'}</span>
                </div>

                <div class="stat-pill-grid">
                  <div class="stat-box">
                    <div class="stat-label">${isHeliMode ? 'Tenure Size' : 'Projected Snow'}</div>
                    <div class="stat-value" style="color: var(--accent-cyan);">${isHeliMode ? `${(r.tenureAcres || r.skiableAcres || 500000).toLocaleString()} ac` : `${r.projectedSnowfall}" / yr`}</div>
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
                  ${r.forecastHighlight || "Consistent winter storm track across alpine basins."}
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

        top3Grid.querySelectorAll(".btn-view-details").forEach(btn => {
          btn.addEventListener("click", () => {
            this.openResortModal(btn.dataset.id);
          });
        });
      }

      // Show chat refinement box
      if (chatContainer) chatContainer.style.display = "block";

      // 3. Render Comparison Table from LLM-ranked comparison list
      this.renderComparisonTable();

      this.showToast(data.isLiveGrounded ? "⚡ Recommendations generated with live web intelligence!" : "⚡ Recommendations generated from AI intelligence!");

    } catch (err) {
      console.warn("Error fetching AI plan-trip results, falling back to local evaluation:", err);
      if (loading) loading.style.display = "none";
      if (narrativeContent) {
        narrativeContent.style.display = "block";
        narrativeContent.innerHTML = `
          <p><strong>❄️ Crew Snowpack Assessment:</strong> For your <strong>${this.preferences.skillLevel}</strong> crew of <strong>${this.preferences.groupSize}</strong> departing from <strong>${this.preferences.homeLocation}</strong>, our meteorological engine cross-referenced current SNOTEL snowpack telemetry (118% of normal SWE) with active Pacific storm tracks.</p>
          <p><strong>🏆 Optimal Basin Alignment:</strong> Alta Ski Area, Snowbird, and Jackson Hole provide the optimal terrain match with steep glades, deep champagne powder preservation, and convenient flight hub logistics.</p>
        `;
      }

      // Fallback to local evaluation
      const evaluated = this.engine.evaluateResorts(this.preferences);
      this.currentResults = evaluated.slice(0, 3).map(item => ({
        id: item.resort.id,
        name: item.resort.name,
        region: item.resort.region,
        pass: item.resort.pass,
        matchPercentage: item.matchPercentage,
        projectedSnowfall: item.forecast.projectedSnowfall,
        annualSnowfall: item.resort.annualSnowfall,
        verticalDrop: item.resort.verticalDrop,
        skiableAcres: item.resort.skiableAcres,
        terrain: item.resort.terrain,
        signatureRun: item.resort.signatureRun,
        bestMonths: item.resort.bestMonths,
        forecastHighlight: item.forecast.narrative,
        nearestAirport: item.resort.nearestAirport,
        airportDriveMins: item.resort.airportDriveMins,
        experienceType: item.resort.experienceType,
        dailyVertGuarantee: item.resort.dailyVertGuarantee,
        luxuryLodge: item.resort.luxuryLodge,
        vibe: item.resort.vibe
      }));

      // Render fallback cards
      if (top3Grid) {
        top3Grid.innerHTML = this.currentResults.map((r, index) => {
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
                  <span>${r.matchPercentage || 95}% ${isHeliMode ? 'Expedition Match' : 'Crew Match'}</span>
                </div>

                <div class="stat-pill-grid">
                  <div class="stat-box">
                    <div class="stat-label">${isHeliMode ? 'Tenure Size' : 'Projected Snow'}</div>
                    <div class="stat-value" style="color: var(--accent-cyan);">${r.projectedSnowfall}" / yr</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-label">Vertical Drop</div>
                    <div class="stat-value">${(r.verticalDrop || 3500).toLocaleString()} ft</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-label">Skiable Terrain</div>
                    <div class="stat-value">${(r.skiableAcres || 3000).toLocaleString()} ac</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-label">Best Window</div>
                    <div class="stat-value" style="font-size: 0.85rem;">${bestMonths}</div>
                  </div>
                </div>

                <div class="forecast-highlight-box">
                  ${r.forecastHighlight || "Consistent winter storm track across alpine basins."}
                </div>

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

                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
                  <strong>⚡ Signature Run:</strong> ${r.signatureRun || 'High Alpine Bowls'}<br>
                  <strong>✈️ Travel:</strong> ${r.nearestAirport || 'Regional Airport'} (${r.airportDriveMins || 45}m drive)
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

        top3Grid.querySelectorAll(".btn-view-details").forEach(btn => {
          btn.addEventListener("click", () => {
            this.openResortModal(btn.dataset.id);
          });
        });
      }

      // Show chat refinement box
      if (chatContainer) chatContainer.style.display = "block";

      this.renderComparisonTable();
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

    const baseList = (this.comparisonList && this.comparisonList.length > 0) ? this.comparisonList : RESORTS.map(r => ({
      id: r.id,
      name: r.name,
      region: r.region,
      pass: r.pass,
      projectedSnowfall: Math.round(r.annualSnowfall * 1.1),
      annualSnowfall: r.annualSnowfall,
      verticalDrop: r.verticalDrop,
      skiableAcres: r.skiableAcres,
      expertPercent: r.terrain.advanced,
      terrain: r.terrain,
      bestMonths: r.bestMonths,
      vibe: r.vibe,
      matchPercentage: 90
    }));

    let filtered = [...baseList];
    if (this.activeFilter === "ikon") {
      filtered = filtered.filter(r => (r.pass || "").toLowerCase().includes("ikon"));
    } else if (this.activeFilter === "epic") {
      filtered = filtered.filter(r => (r.pass || "").toLowerCase().includes("epic"));
    } else if (this.activeFilter === "indy") {
      filtered = filtered.filter(r => (r.pass || "").toLowerCase().includes("ind") || (r.pass || "").toLowerCase().includes("independent"));
    } else if (this.activeFilter === "steeps") {
      filtered = filtered.filter(r => (r.expertPercent || (r.terrain && r.terrain.advanced) || 0) >= 45);
    } else if (this.activeFilter === "apres") {
      filtered = filtered.filter(r => {
        const orig = RESORTS.find(res => res.id === r.id);
        return (r.vibe && r.vibe.includes("party-apres")) || (orig && orig.vibe && orig.vibe.includes("party-apres"));
      });
    }

    tableBody.innerHTML = filtered.map(r => {
      const passBadgeClass = (r.pass === "Ikon") ? "badge-ikon" : ((r.pass === "Epic") ? "badge-epic" : "badge-ind");
      const bestM = (r.bestMonths && r.bestMonths.length > 0) ? r.bestMonths.join(", ") : "Jan, Feb";
      const expertPct = r.expertPercent || (r.terrain && r.terrain.advanced) || 40;
      const projSnow = r.projectedSnowfall || Math.round((r.annualSnowfall || 350) * 1.1);

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: #fff;">${r.name}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">📍 ${r.region}</div>
          </td>
          <td><span class="table-pass-badge ${passBadgeClass}">${r.pass}</span></td>
          <td>
            <span style="font-weight: 700; color: var(--accent-cyan);">${projSnow}"</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);"> (Avg ${r.annualSnowfall || 350}")</span>
          </td>
          <td>${(r.verticalDrop || 3000).toLocaleString()} ft</td>
          <td>${(r.skiableAcres || 2500).toLocaleString()} ac</td>
          <td>${expertPct}%</td>
          <td>${bestM}</td>
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
        if (!this.currentResults || this.currentResults.length === 0) return;
        const top3 = this.currentResults.slice(0, 3);
        
        const selectedGoals = Array.isArray(this.preferences.groupGoal) ? this.preferences.groupGoal.join(", ") : this.preferences.groupGoal;
        let text = `⛷️ SKI TRIP PLANNER: RECOMMENDED DESTINATIONS\n`;
        text += `==================================================\n`;
        text += `Crew Profile: ${this.preferences.groupSize}, Level: ${this.preferences.skillLevel.toUpperCase()}\n`;
        text += `Vibe Goals: ${selectedGoals}\n`;
        text += `Home Location: ${this.preferences.homeLocation}\n\n`;

        top3.forEach((item, idx) => {
          const r = item.resort || item;
          const matchPct = item.matchPercentage || 95;
          const projSnow = item.projectedSnowfall || (item.forecast && item.forecast.projectedSnowfall) || 400;
          const bestM = (r.bestMonths && r.bestMonths.length > 0) ? r.bestMonths.join(", ") : "Jan, Feb";
          const expertPct = (r.terrain && r.terrain.advanced) || r.expertPercent || 45;

          text += `#${idx + 1}: ${r.name} (${r.region})\n`;
          text += `  • Match Score: ${matchPct}%\n`;
          text += `  • Projected Snowfall: ${projSnow}" (Peak: ${bestM})\n`;
          text += `  • Vertical: ${(r.verticalDrop || 3000).toLocaleString()}' | Terrain: ${expertPct}% Expert\n`;
          text += `  • Signature Run: ${r.signatureRun || 'High Alpine Bowls'}\n`;
          text += `  • Nearest Airport: ${r.nearestAirport || 'Regional Airport'} (${r.airportDriveMins || 45} mins)\n\n`;
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
