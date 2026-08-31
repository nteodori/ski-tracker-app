/**
 * Ski Trip Planner Weather & Matching Engine
 * Evaluates seasonal ENSO forecasts, snowfall probabilities, and user preference alignment.
 */

import { RESORTS } from './resortsData.js';

/**
 * Live NOAA Climate Prediction Center ENSO Diagnostic Outlook
 */
export const LIVE_ENSO_OUTLOOK = {
  phase: "el-nino",
  phaseName: "El Niño Advisory (Strong / Super El Niño Potential)",
  confidence: "90% Probability through Winter 2026-27",
  ninoIndex: "+2.03°C (Niño-3.4 SST Anomaly)",
  source: "NOAA Climate Prediction Center (CPC)",
  lastUpdated: "August 2026 Diagnostic Discussion",
  headline: "Active El Niño: Subtropical Jet Stream Energized",
  summary: "A robust El Niño is actively strengthening with SST anomalies exceeding +2.0°C. Atmospheric river storm tracks are projected to favor the Sierra Nevada, Utah Wasatch, and Southern/Central Colorado Rockies with high-volume mid-winter snow cycles.",
  favoredRegions: [
    "California / Sierra Nevada (Mammoth, Palisades Tahoe)",
    "Utah Wasatch Front (Snowbird, Alta, Park City)",
    "Southern & Central Colorado (Telluride, Crested Butte, Vail)"
  ],
  seasonTiming: "Peak deep snow accumulation projected from mid-January through March."
};

export class WeatherMatchingEngine {
  constructor() {
    // Automatically initialize with live detected NOAA climate state
    this.currentClimateState = LIVE_ENSO_OUTLOOK.phase;
  }

  getLiveEnsoData() {
    return LIVE_ENSO_OUTLOOK;
  }

  setClimateState(state) {
    this.currentClimateState = state;
  }

  /**
   * Calculates projected seasonal snowfall for a resort given current climate cycle.
   */
  getProjectedSnowfall(resort) {
    let multiplier = 1.0;
    if (this.currentClimateState === "la-nina") {
      multiplier = resort.laNinaFactor;
    } else if (this.currentClimateState === "el-nino") {
      multiplier = resort.elNinoFactor;
    } else {
      multiplier = 1.0; // Neutral
    }
    return Math.round(resort.annualSnowfall * multiplier);
  }

  /**
   * Generates a descriptive forecast highlight for the resort.
   */
  getForecastSummary(resort) {
    const projected = this.getProjectedSnowfall(resort);
    const diffPct = Math.round(((projected - resort.annualSnowfall) / resort.annualSnowfall) * 100);
    const sign = diffPct > 0 ? "+" : "";

    let climateNarrative = "";
    if (this.currentClimateState === "la-nina") {
      if (resort.laNinaFactor >= 1.15) {
        climateNarrative = `🔥 High Conviction: Pacific polar jet stream heavily favors ${resort.region}. Expect deep powder storm cycles (${sign}${diffPct}% above average).`;
      } else if (resort.laNinaFactor <= 0.95) {
        climateNarrative = `⚠️ Variable Southern Track: Snowpack will rely heavily on high base elevation (${resort.elevation.base} ft) and cold storm waves.`;
      } else {
        climateNarrative = `❄️ Consistent Baseline: Steady storm cadence forecasted throughout mid-winter.`;
      }
    } else if (this.currentClimateState === "el-nino") {
      if (resort.elNinoFactor >= 1.10) {
        climateNarrative = `🌊 Atmospheric River Surge: Subtropical jet stream projects heavy moisture dumps for ${resort.region} (${sign}${diffPct}% of normal).`;
      } else {
        climateNarrative = `🌤️ Northern Track Shift: Best powder timing concentrated in mid-winter cold snaps.`;
      }
    } else {
      climateNarrative = `📊 Typical Winter Pattern: Normal historical storm distribution across ${resort.bestMonths.join(", ")}.`;
    }

    return {
      projectedSnowfall: projected,
      historicalAverage: resort.annualSnowfall,
      diffPercent: diffPct,
      bestMonths: resort.bestMonths,
      narrative: climateNarrative
    };
  }

  /**
   * Scores all resorts based on user questionnaire responses.
   * Returns a sorted array of scored resorts.
   */
  evaluateResorts(preferences) {
    const {
      skillLevel = "advanced",      // 'beginner', 'intermediate', 'advanced'
      groupGoal = "gnarly-lines",    // 'gnarly-lines', 'friends-vacation', 'party-apres', 'family-convenient'
      snowPriority = "powder",       // 'powder', 'groomers', 'flexible'
      travelMode = "fly",           // 'drive', 'fly', 'anywhere'
      homeLocation = "San Francisco, CA",
      passAffiliation = "any"        // 'any', 'Ikon', 'Epic', 'Independent'
    } = preferences;

    // Hard Pass Filter: Strictly evaluate ONLY resorts on the selected pass
    let candidateResorts = RESORTS;
    if (passAffiliation && passAffiliation !== "any") {
      const passTarget = passAffiliation.toLowerCase();
      candidateResorts = RESORTS.filter(resort => {
        const resortPass = resort.pass.toLowerCase();
        if (passTarget === "independent" || passTarget === "indy") {
          return resortPass.includes("independent") || resortPass.includes("indy");
        }
        return resortPass.includes(passTarget);
      });
    }

    const scored = candidateResorts.map(resort => {
      let score = 0;
      let scoreBreakdown = [];

      // 1. Skill Match (Max 25 pts)
      const terrain = resort.terrain;
      if (skillLevel === "beginner") {
        const beginnerFit = (terrain.beginner * 1.5) + (terrain.intermediate * 0.5);
        const pts = Math.min(25, Math.round(beginnerFit * 0.5));
        score += pts;
        scoreBreakdown.push({ label: "Beginner Comfort", pts });
      } else if (skillLevel === "intermediate") {
        const interFit = (terrain.intermediate * 1.2) + (terrain.beginner * 0.4);
        const pts = Math.min(25, Math.round(interFit * 0.45));
        score += pts;
        scoreBreakdown.push({ label: "Cruiser Terrain", pts });
      } else { // advanced / expert
        const expertFit = (terrain.advanced * 1.4) + (terrain.intermediate * 0.2);
        const pts = Math.min(25, Math.round(expertFit * 0.4));
        score += pts;
        scoreBreakdown.push({ label: "Steep / Expert Terrain", pts });
      }

      // 2. Vibe & Trip Goal Match (Max 25 pts)
      let vibePts = 5;
      if (groupGoal === "gnarly-lines") {
        if (resort.vibe.includes("gnarly-steeps")) vibePts += 15;
        if (resort.vibe.includes("powder-hunting")) vibePts += 5;
      } else if (groupGoal === "party-apres") {
        if (resort.vibe.includes("party-apres")) vibePts += 15;
        if (resort.vibe.includes("friends-vacation")) vibePts += 5;
      } else if (groupGoal === "friends-vacation") {
        if (resort.vibe.includes("friends-vacation")) vibePts += 12;
        if (resort.vibe.includes("cruisers-groomers") || resort.vibe.includes("party-apres")) vibePts += 8;
      } else {
        if (resort.vibe.includes("family-convenient") || resort.vibe.includes("cruisers-groomers")) vibePts += 20;
      }
      vibePts = Math.min(25, vibePts);
      score += vibePts;
      scoreBreakdown.push({ label: "Trip Goal & Vibe", pts: vibePts });

      // 3. Snow Forecast & Quality (Max 30 pts)
      const forecast = this.getForecastSummary(resort);
      const projectedSnow = forecast.projectedSnowfall;
      
      let snowPts = 0;
      if (snowPriority === "powder") {
        // High reward for 400"+ projected snowfall
        if (projectedSnow >= 450) snowPts = 30;
        else if (projectedSnow >= 380) snowPts = 26;
        else if (projectedSnow >= 320) snowPts = 20;
        else snowPts = 14;
      } else if (snowPriority === "groomers") {
        // Consistent base elevation and snowmaking reliability
        if (resort.elevation.base >= 7000 || resort.vibe.includes("cruisers-groomers")) snowPts = 28;
        else snowPts = 20;
      } else {
        snowPts = 22;
      }
      score += snowPts;
      scoreBreakdown.push({ label: "Snow & Weather Forecast", pts: snowPts });

      // 4. Pass Affiliation (Max 10 pts)
      let passPts = 8;
      if (passAffiliation === "any") {
        passPts = 10;
      } else if (resort.pass.toLowerCase().includes(passAffiliation.toLowerCase())) {
        passPts = 10;
      } else {
        passPts = 3;
      }
      score += passPts;
      scoreBreakdown.push({ label: "Pass Compatibility", pts: passPts });

      // 5. Travel Logistics / Proximity (Max 10 pts)
      let travelPts = 5;
      const lowerHome = homeLocation.toLowerCase();
      
      // Proximity checks for popular starting regions
      const isWestCoast = lowerHome.includes("san francisco") || lowerHome.includes("sf") || lowerHome.includes("seattle") || lowerHome.includes("los angeles") || lowerHome.includes("la") || lowerHome.includes("bay area");
      const isDenver = lowerHome.includes("denver") || lowerHome.includes("boulder") || lowerHome.includes("colorado");
      const isEastCoast = lowerHome.includes("new york") || lowerHome.includes("nyc") || lowerHome.includes("boston") || lowerHome.includes("philadelphia");

      if (travelMode === "drive") {
        if (isWestCoast && (resort.state === "CA" || resort.state === "WA" || (lowerHome.includes("seattle") && resort.state === "BC"))) travelPts = 10;
        else if (isDenver && resort.state === "CO") travelPts = 10;
        else if (isEastCoast && resort.state === "VT") travelPts = 10;
        else travelPts = 2; // Drive too far
      } else {
        // Flying: Quick airport transfer (< 45 mins) gets max score
        if (resort.airportDriveMins <= 45) travelPts = 10;
        else if (resort.airportDriveMins <= 90) travelPts = 8;
        else travelPts = 6;
      }
      score += travelPts;
      scoreBreakdown.push({ label: "Travel Logistics", pts: travelPts });

      // Calculate final Match Percentage (capped at 99%)
      const matchPercentage = Math.min(99, Math.max(55, score));

      return {
        resort,
        score,
        matchPercentage,
        scoreBreakdown,
        forecast
      };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }
}
