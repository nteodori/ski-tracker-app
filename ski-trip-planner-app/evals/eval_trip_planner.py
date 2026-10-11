"""
PowFinder AI - Braintrust Evaluation Suite for Trip Planning & Synthesis.
Runs test datasets against the trip planner agent and scores pass fidelity, terrain safety, vibe alignment, and schema integrity.
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
from server import plan_trip_with_observability, TripPlanRequest, RESORT_CATALOG

BRAINTRUST_PROJECT = os.environ.get("BRAINTRUST_PROJECT", "Ski Planner App")

# ==============================================================================
# 1. Golden Dataset for Trip Planning
# ==============================================================================
TRIP_PLAN_DATASET = [
    {
        "input": {
            "skillLevel": "expert",
            "groupGoal": ["gnarly-lines", "powder-hunting"],
            "snowPriority": "powder",
            "travelMode": "fly",
            "homeLocation": "San Francisco, CA",
            "passAffiliation": "ikon",
            "groupSize": "4 freeriders"
        },
        "expected": {
            "pass": "ikon",
            "min_advanced_terrain": 35,
            "required_vibes": ["gnarly-steeps", "powder-hunting"],
            "description": "Expert powder hounds on Ikon Pass"
        }
    },
    {
        "input": {
            "skillLevel": "beginner",
            "groupGoal": ["cruisers-groomers", "friends-vacation"],
            "snowPriority": "groomed",
            "travelMode": "fly",
            "homeLocation": "Chicago, IL",
            "passAffiliation": "epic",
            "groupSize": "Family with 2 beginner kids"
        },
        "expected": {
            "pass": "epic",
            "min_beginner_terrain": 18,
            "max_advanced_terrain": 45,
            "required_vibes": ["cruisers-groomers", "friends-vacation"],
            "description": "Beginner family cruising on Epic Pass"
        }
    },
    {
        "input": {
            "skillLevel": "intermediate",
            "groupGoal": ["local-vibes", "powder-hunting"],
            "snowPriority": "powder",
            "travelMode": "drive",
            "homeLocation": "Denver, CO",
            "passAffiliation": "independent",
            "groupSize": "2 mountain locals"
        },
        "expected": {
            "pass": "independent",
            "required_vibes": ["local-vibes", "powder-hunting"],
            "description": "Local soulful powder chase on Independent/Indy pass"
        }
    },
    {
        "input": {
            "skillLevel": "expert",
            "groupGoal": ["heli-luxury"],
            "snowPriority": "powder",
            "travelMode": "fly",
            "homeLocation": "New York, NY",
            "passAffiliation": "any",
            "groupSize": "VIP Executive Crew (4 skiers)"
        },
        "expected": {
            "experienceType": "heli",
            "required_vibes": ["heli-luxury"],
            "description": "VIP Heli-Ski Splurge trip"
        }
    },
    {
        "input": {
            "skillLevel": "intermediate",
            "groupGoal": ["party-apres", "friends-vacation"],
            "snowPriority": "spring",
            "travelMode": "fly",
            "homeLocation": "Austin, TX",
            "passAffiliation": "ikon",
            "groupSize": "Bachelor Party Crew (6 buddies)"
        },
        "expected": {
            "pass": "ikon",
            "required_vibes": ["party-apres", "friends-vacation"],
            "description": "Apres party & friends vacation on Ikon Pass"
        }
    }
]

# ==============================================================================
# 2. Task Runner
# ==============================================================================
async def trip_planner_task(input: Dict[str, Any], *args, **kwargs) -> Dict[str, Any]:
    req = TripPlanRequest(**input)
    return await plan_trip_with_observability(req)

# ==============================================================================
# 3. Custom Evaluation Scorers
# ==============================================================================
def pass_fidelity_scorer(*args, **kwargs) -> Dict[str, Any]:
    """
    Evaluates whether all recommended top 3 resorts strictly match the user's pass affiliation.
    """
    input = kwargs.get("input", args[0] if len(args) > 0 else {})
    output = kwargs.get("output", args[1] if len(args) > 1 else {})
    
    user_pass = (input.get("passAffiliation") or "any").lower()
    if user_pass == "any":
        return {"name": "pass_fidelity", "score": 1.0}

    top_resorts = output.get("topResorts", [])
    if not top_resorts:
        return {"name": "pass_fidelity", "score": 0.0}

    matching = 0
    for r in top_resorts:
        r_pass = r.get("pass", "").lower()
        if user_pass in r_pass:
            matching += 1
        elif user_pass == "independent" and ("indy" in r_pass or "independent" in r_pass or "heli" in r_pass):
            matching += 1

    return {
        "name": "pass_fidelity",
        "score": round(matching / len(top_resorts), 2),
        "metadata": {"matching": matching, "total": len(top_resorts), "user_pass": user_pass}
    }

def terrain_safety_scorer(*args, **kwargs) -> Dict[str, Any]:
    """
    Evaluates whether terrain distributions (% beginner vs % advanced) match the user's skill level.
    """
    input = kwargs.get("input", args[0] if len(args) > 0 else {})
    output = kwargs.get("output", args[1] if len(args) > 1 else {})
    
    skill = (input.get("skillLevel") or "intermediate").lower()
    top_resorts = output.get("topResorts", [])
    if not top_resorts:
        return {"name": "terrain_safety", "score": 0.0}

    scores = []
    for r in top_resorts:
        terrain = r.get("terrain", {})
        beg = terrain.get("beginner", 0)
        adv = terrain.get("advanced", 0)

        if skill == "beginner":
            scores.append(1.0 if beg >= 18 and adv <= 45 else 0.3)
        elif skill in ["advanced", "expert"]:
            scores.append(1.0 if adv >= 35 else 0.5)
        else:
            scores.append(1.0)

    avg_score = round(sum(scores) / len(scores), 2)
    return {
        "name": "terrain_safety",
        "score": avg_score,
        "metadata": {"skill_level": skill, "top_resort_scores": scores}
    }

def vibe_alignment_scorer(*args, **kwargs) -> Dict[str, Any]:
    """
    Evaluates whether the recommended resorts and AI narrative align with the requested trip vibes.
    """
    input = kwargs.get("input", args[0] if len(args) > 0 else {})
    output = kwargs.get("output", args[1] if len(args) > 1 else {})
    
    goals = input.get("groupGoal", [])
    if isinstance(goals, str):
        goals = [goals]

    top_resorts = output.get("topResorts", [])
    if not top_resorts:
        return {"name": "vibe_alignment", "score": 0.0}

    # Check if heli mode is respected
    is_heli = "heli-luxury" in goals and len(goals) == 1
    if is_heli:
        heli_matches = sum(1 for r in top_resorts if r.get("experienceType"))
        return {"name": "vibe_alignment", "score": round(heli_matches / len(top_resorts), 2)}

    # Check vibe tags in resorts
    vibe_scores = []
    for r in top_resorts:
        r_vibes = r.get("vibe", [])
        matched_vibes = set(goals).intersection(set(r_vibes))
        vibe_scores.append(1.0 if len(matched_vibes) > 0 else 0.6)

    avg_score = round(sum(vibe_scores) / len(vibe_scores), 2)
    return {
        "name": "vibe_alignment",
        "score": avg_score,
        "metadata": {"requested_goals": goals}
    }

def schema_integrity_scorer(*args, **kwargs) -> Dict[str, Any]:
    """
    Checks that valid structured top 3 cards, comparison matrix list, and narrative were returned.
    """
    output = kwargs.get("output", args[1] if len(args) > 1 else {})
    
    has_narrative = bool(output.get("aiNarrative"))
    has_top3 = len(output.get("topResorts", [])) == 3
    has_comparison = len(output.get("comparisonList", [])) > 10

    score = 0.0
    if has_narrative:
        score += 0.3
    if has_top3:
        score += 0.4
    if has_comparison:
        score += 0.3
        
    return {
        "name": "schema_integrity",
        "score": round(score, 2),
        "metadata": {
            "has_narrative": has_narrative,
            "top_resorts_count": len(output.get("topResorts", [])),
            "comparison_count": len(output.get("comparisonList", []))
        }
    }

def grounding_active_scorer(*args, **kwargs) -> Dict[str, Any]:
    """
    Checks if live search grounding was active and returned citations.
    """
    output = kwargs.get("output", args[1] if len(args) > 1 else {})
    is_live = bool(output.get("isLiveGrounded"))
    return {
        "name": "grounding_active",
        "score": 1.0 if is_live else 0.5,
        "metadata": {"is_live": is_live, "citations_count": len(output.get("citations", []))}
    }

# ==============================================================================
# 4. Main Evaluation Runner
# ==============================================================================
async def run_trip_planner_eval(experiment_name: str = "trip-planner-eval-v1"):
    print(f"🏔️ Running Trip Planner Braintrust Evaluation: {experiment_name}...")
    
    result = await bt.EvalAsync(
        name=BRAINTRUST_PROJECT,
        experiment_name=experiment_name,
        data=TRIP_PLAN_DATASET,
        task=trip_planner_task,
        scores=[
            pass_fidelity_scorer,
            terrain_safety_scorer,
            vibe_alignment_scorer,
            schema_integrity_scorer,
            grounding_active_scorer
        ]
    )
    print(f"✅ Trip Planner Evaluation complete!")
    print(f"🔗 View Experiment in Braintrust: https://www.braintrust.dev/app/NTeodori/p/Ski%20Planner%20App/experiments/{experiment_name}")
    return result

if __name__ == "__main__":
    asyncio.run(run_trip_planner_eval())
