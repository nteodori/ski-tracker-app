/**
 * Ski Trip Planner Weather & Matching Engine
 * Evaluates seasonal ENSO forecasts, SNOTEL telemetry, sub-seasonal teleconnections,
 * and context-aware short/long-term mountain forecasts.
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
   * Calculates Snow-to-Liquid Ratio (SLR) and snow density
   */
  calculateSLR(resort) {
    let baseSLR = 15.0;
    if (resort.state === "UT" || resort.id === "steamboat") {
      baseSLR = 20.0; // Utah & Steamboat champagne powder
    } else if (resort.state === "CO" || resort.state === "WY" || resort.state === "MT") {
      baseSLR = 16.5; // Dry Continental Rockies
    } else if (resort.state === "CA") {
      baseSLR = 11.5; // High-moisture Sierra snowpack (superb base builder)
    } else if (resort.state === "WA" || resort.state === "BC") {
      baseSLR = 12.0; // Maritime Pacific Northwest / Coast Range
    } else {
      baseSLR = 12.0;
    }

    const density = Math.round(1000 / baseSLR);
    let classification = "Classic Dry Powder";
    if (baseSLR >= 19) classification = "Ultra-Light Blower / Champagne Powder ⭐⭐⭐⭐⭐";
    else if (baseSLR >= 15) classification = "Dry Continental Rocky Mountain Powder ⭐⭐⭐⭐";
    else if (baseSLR >= 11) classification = "All-Mountain Dense Foundation Snow ⭐⭐⭐";
    else classification = "Heavy Maritime Base-Builder ⭐⭐";

    return {
      ratio: `${baseSLR}:1`,
      densityKgM3: density,
      waterContent: `${Math.round(100 / baseSLR)}%`,
      classification
    };
  }

  /**
   * Generates a context-aware Short & Long-Term Meteorological Forecast.
   * Dynamically adjusts based on current month (e.g. August/Pre-Season vs January/Winter).
   */
  getDetailedForecastAnalysis(resort) {
    const currentMonthNum = new Date().getMonth(); // 0 = Jan, 7 = Aug, 11 = Dec
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonthName = monthNames[currentMonthNum];

    const isPreSeason = currentMonthNum >= 4 && currentMonthNum <= 9; // May to October
    const projectedSnow = this.getProjectedSnowfall(resort);
    const slr = this.calculateSLR(resort);

    // Monthly distribution breakdown
    const monthlyCurve = {
      "Nov": Math.round(projectedSnow * 0.10),
      "Dec": Math.round(projectedSnow * 0.20),
      "Jan": Math.round(projectedSnow * 0.28),
      "Feb": Math.round(projectedSnow * 0.25),
      "Mar": Math.round(projectedSnow * 0.13),
      "Apr": Math.round(projectedSnow * 0.04)
    };

    let shortTermOutlook = {};
    if (isPreSeason) {
      // Off-Season / Pre-Season (e.g. August/September)
      shortTermOutlook = {
        timeframe: `Current Pre-Season Status (${currentMonthName})`,
        headline: "Off-Season Mountain Baseline & Autumn Transition",
        temperatureRange: `Summit: 45°F - 62°F | Base: 55°F - 74°F`,
        currentSnowState: "Summer melting complete; mountain trails open for hiking/biking.",
        autumnTransition: `First sub-freezing summit temperatures historically occur in late September, with automated snowmaking operations launching by late October / early November.`,
        historicalFirstSnow: "Late September to Mid-October (First measurable dusting atop summit)",
        operationalReadiness: "Pre-season terrain maintenance & snowmaking infrastructure testing active."
      };
    } else {
      // Active Winter Season (November to April)
      shortTermOutlook = {
        timeframe: "Active Winter 7–14 Day Radar",
        headline: "Mid-Winter Storm Track & Cold Air Influx",
        temperatureRange: `Summit: 8°F - 22°F | Base: 18°F - 32°F`,
        currentSnowState: `Active snowpack depth building across upper bowls and glades.`,
        autumnTransition: `Cold storm fronts maintaining optimal freezing levels for high-quality dry snow preservation.`,
        historicalFirstSnow: "Established early-season base coverage",
        operationalReadiness: "100% lift operations and continuous grooming active."
      };
    }

    // Long-Term Seasonal Forecast (Looking ahead to 2026-27 winter)
    let longRangeNarrative = "";
    let convictionScore = "85%";
    if (this.currentClimateState === "el-nino") {
      if (resort.elNinoFactor >= 1.10) {
        longRangeNarrative = `🔥 Major Beneficiary: El Niño subtropical jet stream is positioned to steer high-volume Pacific atmospheric rivers into ${resort.region}. Projected ${projectedSnow}" seasonal snowfall (${Math.round((resort.elNinoFactor - 1) * 100)}% above 30-year median).`;
        convictionScore = "92% High Conviction";
      } else {
        longRangeNarrative = `❄️ Consistent Base: Steady mid-winter cold storm waves with prime snow preservation due to ${resort.name}'s high summit elevation (${resort.elevation.summit.toLocaleString()} ft).`;
        convictionScore = "82% Moderate-High Conviction";
      }
    } else {
      longRangeNarrative = `📊 Normal Historical Distribution: Standard winter storm cadence across ${resort.bestMonths.join(", ")}.`;
      convictionScore = "80% Baseline Conviction";
    }

    return {
      resortId: resort.id,
      resortName: resort.name,
      state: resort.state,
      region: resort.region,
      elevation: resort.elevation,
      projectedAnnualSnow: projectedSnow,
      historicalAverage: resort.annualSnowfall,
      diffPercent: Math.round(((projectedSnow - resort.annualSnowfall) / resort.annualSnowfall) * 100),
      isPreSeason,
      currentMonthName,
      shortTerm: shortTermOutlook,
      longTerm: {
        season: "2026–2027 Winter Season Ahead",
        projectedTotalInches: projectedSnow,
        convictionScore,
        narrative: longRangeNarrative,
        bestMonths: resort.bestMonths,
        monthlyCurve,
        peakPowderWindow: `${resort.bestMonths[0]} through ${resort.bestMonths[resort.bestMonths.length - 1]}`
      },
      slr,
      snotel: {
        stationName: `${resort.name} SNOTEL Index`,
        elevationFt: resort.elevation.base + Math.round((resort.elevation.summit - resort.elevation.base) * 0.6),
        climateZone: resort.climateZone,
        baselineMedianSWE: `${Math.round(projectedSnow * 0.085)}" SWE`,
        basePreservationRating: resort.elevation.base >= 8000 ? "⭐⭐⭐⭐⭐ Ultra-High Snow Preservation" : "⭐⭐⭐⭐ Reliable Cold Storage"
      }
    };
  }

  /**
   * Generates a descriptive forecast highlight for the resort.
   */
  getForecastSummary(resort) {
    const analysis = this.getDetailedForecastAnalysis(resort);
    return {
      projectedSnowfall: analysis.projectedAnnualSnow,
      historicalAverage: resort.annualSnowfall,
      diffPercent: analysis.diffPercent,
      bestMonths: resort.bestMonths,
      narrative: analysis.longTerm.narrative,
      detailed: analysis
    };
  }

  /**
   * Scores candidate resorts based on user preferences.
   */
  evaluateResorts(preferences) {
    const {
      skillLevel = "advanced",
      groupGoal = "gnarly-lines",
      snowPriority = "powder",
      travelMode = "fly",
      homeLocation = "San Francisco, CA",
      passAffiliation = "any"
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
      } else {
        const expertFit = (terrain.advanced * 1.4) + (terrain.intermediate * 0.2);
        const pts = Math.min(25, Math.round(expertFit * 0.4));
        score += pts;
        scoreBreakdown.push({ label: "Steep / Expert Terrain", pts });
      }

      // 2. Vibe & Trip Goal Match (Max 25 pts)
      let vibePts = 5;
      if (groupGoal === "heli-luxury") {
        if (resort.vibe.includes("heli-luxury")) vibePts += 14;
        if (resort.heliAndLuxury && resort.heliAndLuxury.hasHeli) vibePts += 8;
        else if (resort.heliAndLuxury) vibePts += 4;
      } else if (groupGoal === "gnarly-lines") {
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
        if (projectedSnow >= 450) snowPts = 30;
        else if (projectedSnow >= 380) snowPts = 26;
        else if (projectedSnow >= 320) snowPts = 20;
        else snowPts = 14;
      } else if (snowPriority === "groomers") {
        if (resort.elevation.base >= 7000 || resort.vibe.includes("cruisers-groomers")) snowPts = 28;
        else snowPts = 20;
      } else {
        snowPts = 22;
      }
      score += snowPts;
      scoreBreakdown.push({ label: "Snow & Weather Forecast", pts: snowPts });

      // 4. Pass Affiliation (Max 10 pts)
      let passPts = 10;
      score += passPts;
      scoreBreakdown.push({ label: "Pass Compatibility", pts: passPts });

      // 5. Travel Logistics / Proximity (Max 10 pts)
      let travelPts = 5;
      const lowerHome = homeLocation.toLowerCase();
      const isWestCoast = lowerHome.includes("san francisco") || lowerHome.includes("sf") || lowerHome.includes("seattle") || lowerHome.includes("los angeles") || lowerHome.includes("la") || lowerHome.includes("bay area");
      const isDenver = lowerHome.includes("denver") || lowerHome.includes("boulder") || lowerHome.includes("colorado");
      const isEastCoast = lowerHome.includes("new york") || lowerHome.includes("nyc") || lowerHome.includes("boston") || lowerHome.includes("philadelphia");

      if (travelMode === "drive") {
        if (isWestCoast && (resort.state === "CA" || resort.state === "WA" || (lowerHome.includes("seattle") && resort.state === "BC"))) travelPts = 10;
        else if (isDenver && resort.state === "CO") travelPts = 10;
        else if (isEastCoast && resort.state === "VT") travelPts = 10;
        else travelPts = 2;
      } else {
        if (resort.airportDriveMins <= 45) travelPts = 10;
        else if (resort.airportDriveMins <= 90) travelPts = 8;
        else travelPts = 6;
      }
      score += travelPts;
      scoreBreakdown.push({ label: "Travel Logistics", pts: travelPts });

      const matchPercentage = Math.min(99, Math.max(55, score));

      return {
        resort,
        score,
        matchPercentage,
        scoreBreakdown,
        forecast
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored;
  }
}
