"""
PowFinder AI - Braintrust Evaluation Suite for Trip Refinement & Follow-Up Assistant.
Evaluates context retention, conversational coherence, and resort-specific recommendations.
Logs experiments to Braintrust: https://www.braintrust.dev/app/NTeodori/p/Ski%20Planner%20App/experiments
"""

import os
import sys
import json
import asyncio
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv(override=True)

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import braintrust as bt
from server import refine_trip, RefineTripRequest

BRAINTRUST_PROJECT = os.environ.get("BRAINTRUST_PROJECT", "Ski Planner App")

# ==============================================================================
# 1. Golden Dataset for Trip Refinement
# ==============================================================================
REFINE_TRIP_DATASET = [
    {
        "input": {
            "query": "Which of these top 3 resorts has the easiest airport drive for a quick 3-day weekend trip?",
            "preferences": {
                "skillLevel": "expert",
                "homeLocation": "San Francisco, CA",
                "passAffiliation": "ikon"
            },
            "currentResults": [
                {"id": "snowbird", "name": "Alta & Snowbird", "airportDriveMins": 45, "nearestAirport": "Salt Lake City (SLC)"},
                {"id": "jackson-hole", "name": "Jackson Hole Mountain Resort", "airportDriveMins": 30, "nearestAirport": "Jackson Hole (JAC)"},
                {"id": "big-sky", "name": "Big Sky Resort", "airportDriveMins": 60, "nearestAirport": "Bozeman (BZN)"}
            ]
        },
        "expected": {
            "expected_resorts": ["Alta", "Snowbird", "Jackson Hole", "Big Sky"],
            "required_topics": ["airport", "drive", "SLC", "JAC", "minute", "drive"]
        }
    },
    {
        "input": {
            "query": "What signature expert runs should we not miss at these mountains?",
            "preferences": {
                "skillLevel": "expert",
                "groupGoal": ["gnarly-lines", "powder-hunting"]
            },
            "currentResults": [
                {"id": "snowbird", "name": "Alta & Snowbird", "signatureRun": "Alf's High Rustler & Great Scott"},
                {"id": "jackson-hole", "name": "Jackson Hole Mountain Resort", "signatureRun": "Corbet's Couloir & Alta Chutes"}
            ]
        },
        "expected": {
            "expected_resorts": ["Alta", "Snowbird", "Jackson Hole"],
            "required_topics": ["Corbet", "Alf", "chutes", "run", "steep", "bowl"]
        }
    }
]

# ==============================================================================
# 2. Task Runner
# ==============================================================================
async def refine_trip_task(input: Dict[str, Any], *args, **kwargs) -> Dict[str, Any]:
    req = RefineTripRequest(**input)
    return await refine_trip(req)

# ==============================================================================
# 3. Custom Evaluation Scorers
# ==============================================================================
def context_retention_scorer(input: Dict[str, Any], output: Dict[str, Any], expected: Dict[str, Any], **kwargs) -> Dict[str, Any]:
    """
    Evaluates whether the follow-up response correctly references the user's specific top recommended resorts.
    """
    resp_text = (output.get("response") or "").lower()
    expected_resorts = expected.get("expected_resorts", [])
    if not expected_resorts:
        return {"name": "context_retention_scorer", "score": 1.0}

    matches = sum(1 for r in expected_resorts if r.lower() in resp_text)
    score = round(min(1.0, matches / 1.0), 2)
    return {
        "name": "context_retention_scorer",
        "score": score,
        "metadata": {"matched_resorts": matches, "total_expected": len(expected_resorts)}
    }

def response_actionability_scorer(input: Dict[str, Any], output: Dict[str, Any], expected: Dict[str, Any], **kwargs) -> Dict[str, Any]:
    """
    Evaluates whether the response is helpful, non-empty, and free of technical errors.
    """
    resp_text = output.get("response") or ""
    if not resp_text or "Sorry, I encountered an error" in resp_text:
        return {"name": "response_actionability_scorer", "score": 0.0}

    score = 0.5
    if len(resp_text) >= 80:
        score += 0.3
    if any(topic.lower() in resp_text.lower() for topic in expected.get("required_topics", [])):
        score += 0.2

    return {
        "name": "response_actionability_scorer",
        "score": round(min(1.0, score), 2),
        "metadata": {"response_length": len(resp_text)}
    }

# ==============================================================================
# 4. Main Evaluation Runner
# ==============================================================================
async def run_refine_trip_eval(experiment_name: str = "refine-trip-assistant-v1"):
    print(f"💬 Running Trip Refinement Braintrust Evaluation: {experiment_name}...")
    
    result = await bt.EvalAsync(
        name=BRAINTRUST_PROJECT,
        experiment_name=experiment_name,
        data=REFINE_TRIP_DATASET,
        task=refine_trip_task,
        scores=[
            context_retention_scorer,
            response_actionability_scorer
        ]
    )
    print(f"✅ Trip Refinement Evaluation complete!")
    print(f"🔗 View Experiment in Braintrust: https://www.braintrust.dev/app/NTeodori/p/Ski%20Planner%20App/experiments/{experiment_name}")
    return result

if __name__ == "__main__":
    asyncio.run(run_refine_trip_eval())
