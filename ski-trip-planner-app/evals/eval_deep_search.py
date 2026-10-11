"""
PowFinder AI - Braintrust Evaluation Suite for Live Grounded Deep Search.
Evaluates search relevance, live citations, answer structure, and grounding status.
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
from server import deep_ski_search, DeepSearchRequest

BRAINTRUST_PROJECT = os.environ.get("BRAINTRUST_PROJECT", "Ski Planner App")

# ==============================================================================
# 1. Golden Dataset for Deep Search
# ==============================================================================
DEEP_SEARCH_DATASET = [
    {
        "input": {
            "query": "Where is the deepest snow base and best powder in Utah right now?",
            "homeLocation": "San Francisco, CA",
            "skillLevel": "expert",
            "passAffiliation": "ikon",
            "travelMode": "fly"
        },
        "expected": {
            "keywords": ["Alta", "Snowbird", "Wasatch", "Cottonwood", "snowpack"],
            "must_have_citations": True
        }
    },
    {
        "input": {
            "query": "What are the best independent non-corporate ski resorts in the Pacific Northwest for deep powder?",
            "homeLocation": "Seattle, WA",
            "skillLevel": "advanced",
            "passAffiliation": "independent",
            "travelMode": "drive"
        },
        "expected": {
            "keywords": ["Baker", "Mt. Baker", "Alpental", "Mission Ridge", "Cascades"],
            "must_have_citations": True
        }
    },
    {
        "input": {
            "query": "Compare terrain and snow quality between Jackson Hole and Big Sky for expert skiers",
            "homeLocation": "Denver, CO",
            "skillLevel": "expert",
            "passAffiliation": "ikon",
            "travelMode": "fly"
        },
        "expected": {
            "keywords": ["Corbet", "Lone Peak", "vertical", "chutes", "Montana", "Wyoming"],
            "must_have_citations": True
        }
    }
]

# ==============================================================================
# 2. Task Runner
# ==============================================================================
async def deep_search_task(input: Dict[str, Any], *args, **kwargs) -> Dict[str, Any]:
    req = DeepSearchRequest(**input)
    return await deep_ski_search(req)

# ==============================================================================
# 3. Custom Evaluation Scorers
# ==============================================================================
def citations_retrieval_scorer(*args, **kwargs) -> Dict[str, Any]:
    """
    Evaluates whether real web citations and sources were retrieved during search grounding.
    """
    output = kwargs.get("output", args[1] if len(args) > 1 else {})
    citations = output.get("citations", [])
    
    if len(citations) >= 2:
        score = 1.0
    elif len(citations) > 0:
        score = 0.8
    else:
        score = 0.4

    return {
        "name": "citations_retrieval",
        "score": score,
        "metadata": {"citation_count": len(citations), "citations": [c.get("title") for c in citations[:3]]}
    }

def keyword_coverage_scorer(*args, **kwargs) -> Dict[str, Any]:
    """
    Evaluates whether key domain concepts and expected resort names are synthesized in the narrative.
    """
    output = kwargs.get("output", args[1] if len(args) > 1 else {})
    expected = kwargs.get("expected", args[2] if len(args) > 2 else {})
    
    narrative = (output.get("aiNarrative") or "").lower()
    expected_keywords = expected.get("keywords", [])
    if not expected_keywords:
        return {"name": "keyword_coverage", "score": 1.0}

    matches = sum(1 for kw in expected_keywords if kw.lower() in narrative)
    score = round(min(1.0, matches / 1.0), 2)
    return {
        "name": "keyword_coverage",
        "score": score,
        "metadata": {"matched_keywords": matches, "total_expected": len(expected_keywords)}
    }

def formatting_structure_scorer(*args, **kwargs) -> Dict[str, Any]:
    """
    Checks that the search response contains clean markdown headers, emoji callouts, and recommendations.
    """
    output = kwargs.get("output", args[1] if len(args) > 1 else {})
    narrative = output.get("aiNarrative") or ""
    
    score = 0.0
    if "###" in narrative or "##" in narrative:
        score += 0.4
    if "❄️" in narrative or "🏆" in narrative or "✈️" in narrative:
        score += 0.3
    if len(narrative) >= 150:
        score += 0.3
        
    return {
        "name": "formatting_structure",
        "score": round(min(1.0, score), 2),
        "metadata": {"length": len(narrative)}
    }

def grounding_active_scorer(*args, **kwargs) -> Dict[str, Any]:
    """
    Checks whether live Google Gemini search grounding was successfully executed.
    """
    output = kwargs.get("output", args[1] if len(args) > 1 else {})
    is_live = bool(output.get("isLiveGrounded"))
    return {
        "name": "grounding_active",
        "score": 1.0 if is_live else 0.5,
        "metadata": {"model": output.get("model")}
    }

# ==============================================================================
# 4. Main Evaluation Runner
# ==============================================================================
async def run_deep_search_eval(experiment_name: str = "deep-search-eval-v1"):
    print(f"🔍 Running Deep Search Braintrust Evaluation: {experiment_name}...")
    
    result = await bt.EvalAsync(
        name=BRAINTRUST_PROJECT,
        experiment_name=experiment_name,
        data=DEEP_SEARCH_DATASET,
        task=deep_search_task,
        scores=[
            citations_retrieval_scorer,
            keyword_coverage_scorer,
            formatting_structure_scorer,
            grounding_active_scorer
        ]
    )
    print(f"✅ Deep Search Evaluation complete!")
    print(f"🔗 View Experiment in Braintrust: https://www.braintrust.dev/app/NTeodori/p/Ski%20Planner%20App/experiments/{experiment_name}")
    return result

if __name__ == "__main__":
    asyncio.run(run_deep_search_eval())
