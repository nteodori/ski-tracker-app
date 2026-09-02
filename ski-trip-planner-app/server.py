"""
PowFinder AI - FastAPI Backend with Arize Phoenix Observability Bridge.
Emits OpenTelemetry / OpenInference spans directly to http://localhost:6006/v1/traces.
"""

import os
import sys
import time
import json
from pathlib import Path
from typing import Dict, Any, Optional

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# OpenTelemetry & Arize Phoenix
import phoenix as px
from phoenix.otel import register
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode
from openinference.instrumentation.openai import OpenAIInstrumentor

# Initialize Phoenix Tracer
PROJECT_NAME = "powfinder-ai"
PHOENIX_COLLECTOR = os.environ.get("PHOENIX_COLLECTOR_ENDPOINT", "http://localhost:6006/v1/traces")

tracer_provider = register(
    project_name=PROJECT_NAME,
    endpoint=PHOENIX_COLLECTOR
)

# Instrument OpenAI if available
OpenAIInstrumentor().instrument(tracer_provider=tracer_provider)
tracer = trace.get_tracer("powfinder.meteorology.engine", tracer_provider=tracer_provider)

app = FastAPI(title="PowFinder AI Observability Service", version="2.0.0")

# Enable CORS for local web app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TripPlanRequest(BaseModel):
    skillLevel: str = "advanced"
    groupGoal: str = "gnarly-lines"
    snowPriority: str = "powder"
    travelMode: str = "fly"
    homeLocation: str = "San Francisco, CA"
    passAffiliation: str = "any"
    groupSize: str = "4 buddies"

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PowFinder AI Observability Backend",
        "phoenixProject": PROJECT_NAME,
        "phoenixDashboardUrl": "http://localhost:6006"
    }

@app.post("/api/plan-trip")
async def plan_trip_with_observability(req: TripPlanRequest):
    start_time = time.time()
    
    # Root Workflow Span
    with tracer.start_as_current_span("PowFinder_TripPlanning_Workflow") as root_span:
        trace_id = format(root_span.get_span_context().trace_id, "032x")
        span_id = format(root_span.get_span_context().span_id, "016x")
        
        # Set input attributes on root span
        root_span.set_attribute("openinference.span.kind", "CHAIN")
        root_span.set_attribute("user.skill_level", req.skillLevel)
        root_span.set_attribute("user.group_goal", req.groupGoal)
        root_span.set_attribute("user.home_location", req.homeLocation)
        root_span.set_attribute("user.pass_affiliation", req.passAffiliation)
        root_span.set_attribute("user.group_size", req.groupSize)

        # 1. Telemetry Query Span: USDA SNOTEL Snowpack
        with tracer.start_as_current_span("USDA_SNOTEL_Snowpack_Query") as snotel_span:
            snotel_span.set_attribute("openinference.span.kind", "TOOL")
            snotel_span.set_attribute("tool.name", "fetch_snotel_telemetry")
            
            # Simulated telemetry fetch (Alta, Jackson Hole, Telluride, Whistler)
            snotel_summary = {
                "active_stations": ["310:UT:SNTL (Alta Guard)", "706:WY:SNTL (Raymer)", "815:CO:SNTL (Telluride)"],
                "avg_snow_depth_inches": 48.5,
                "snowpack_pct_of_median": 118,
                "slr_powder_ratio": "20.0:1 Champagne Powder"
            }
            snotel_span.set_attribute("tool.output", json.dumps(snotel_summary))

        # 2. Climate Model Span: NOAA CPC Teleconnections (ENSO / MJO)
        with tracer.start_as_current_span("NOAA_CPC_Teleconnections_Analysis") as enso_span:
            enso_span.set_attribute("openinference.span.kind", "TOOL")
            enso_span.set_attribute("tool.name", "evaluate_enso_mjo_storm_track")
            
            enso_summary = {
                "active_phase": "El Niño Advisory",
                "nino34_sst_anomaly": "+2.03°C",
                "mjo_phase": "Phase 7/8 (Pacific Jet Extension)",
                "favored_basins": ["Sierra Nevada", "Wasatch Front", "San Juan Mountains"],
                "confidence": "90% Probability through Winter 2026-27"
            }
            enso_span.set_attribute("tool.output", json.dumps(enso_summary))

        # 3. LLM Agent Reasoning Span: Itinerary Synthesis
        ai_narrative = ""
        model_used = "gpt-4o-mini"
        token_usage = {"prompt_tokens": 340, "completion_tokens": 185, "total_tokens": 525}

        with tracer.start_as_current_span("LLM_Itinerary_Synthesis") as llm_span:
            llm_span.set_attribute("openinference.span.kind", "LLM")
            llm_span.set_attribute("llm.model_name", model_used)
            llm_span.set_attribute("llm.provider", "openai")
            
            prompt_content = (
                f"Crew Profile: {req.groupSize}, Skill: {req.skillLevel}, Goal: {req.groupGoal}, Pass: {req.passAffiliation}\n"
                f"SNOTEL Baseline: 118% of normal SWE | Climate: Active +2.03°C El Niño subtropical storm track."
            )
            llm_span.set_attribute("llm.input_messages.0.message.role", "user")
            llm_span.set_attribute("llm.input_messages.0.message.content", prompt_content)

            api_key = os.environ.get("OPENAI_API_KEY")
            if api_key:
                try:
                    from openai import OpenAI
                    client = OpenAI(api_key=api_key)
                    response = client.chat.completions.create(
                        model=model_used,
                        messages=[
                            {"role": "system", "content": "You are the PowFinder AI expert mountain meteorologist and ski trip planner."},
                            {"role": "user", "content": prompt_content}
                        ],
                        temperature=0.3
                    )
                    ai_narrative = response.choices[0].message.content
                    if response.usage:
                        token_usage = {
                            "prompt_tokens": response.usage.prompt_tokens,
                            "completion_tokens": response.usage.completion_tokens,
                            "total_tokens": response.usage.total_tokens
                        }
                except Exception as e:
                    ai_narrative = f"Generated meteorological synthesis based on active El Niño: {enso_summary['active_phase']} delivers peak storm cycles to Utah and Sierra Nevada."
            else:
                # High-fidelity simulated AI synthesis for offline/local tracing
                if req.groupGoal == "heli-luxury":
                    ai_narrative = (
                        "🚁 PowFinder AI Luxury Expeditions Engine: For your VIP crew, Selkirk Tangiers (Revelstoke, BC) "
                        "and Telluride Helitrax (San Juan Mtns, CO) represent the pinnacle of untracked backcountry vertical. "
                        "With the active +2.03°C El Niño atmospheric river track, expect deep 20:1 champagne powder and 15,000+ vertical ft per day."
                    )
                else:
                    ai_narrative = (
                        f"❄️ PowFinder AI Meteorological Intelligence: For your {req.skillLevel} crew departing from {req.homeLocation}, "
                        f"Alta Ski Area and Jackson Hole Mountain Resort provide the optimal alignment with active SNOTEL snowpack (118% of median). "
                        f"The energized subtropical jet stream favors mid-winter storm cycles from mid-January through March."
                    )

            llm_span.set_attribute("llm.output_messages.0.message.role", "assistant")
            llm_span.set_attribute("llm.output_messages.0.message.content", ai_narrative)
            llm_span.set_attribute("llm.token_count.prompt", token_usage["prompt_tokens"])
            llm_span.set_attribute("llm.token_count.completion", token_usage["completion_tokens"])
            llm_span.set_attribute("llm.token_count.total", token_usage["total_tokens"])

        duration_ms = round((time.time() - start_time) * 1000, 1)
        root_span.set_attribute("workflow.duration_ms", duration_ms)
        root_span.set_status(Status(StatusCode.OK))

    return {
        "status": "success",
        "traceId": trace_id,
        "spanId": span_id,
        "durationMs": duration_ms,
        "model": model_used,
        "tokens": token_usage,
        "aiNarrative": ai_narrative,
        "phoenixDashboardUrl": "http://localhost:6006",
        "phoenixProject": PROJECT_NAME
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting PowFinder AI Observability Backend on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
