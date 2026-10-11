"""
PowFinder AI - Master Braintrust Evaluation Suite Runner.
Executes all agent evaluation pipelines (Trip Planner, Deep Search, Chat Refinement)
and logs experiments to Braintrust: https://www.braintrust.dev/app/NTeodori/p/Ski%20Planner%20App/experiments
"""

import os
import sys
import time
import asyncio
from dotenv import load_dotenv

load_dotenv(override=True)

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from evals.eval_trip_planner import run_trip_planner_eval
from evals.eval_deep_search import run_deep_search_eval
from evals.eval_refine_trip import run_refine_trip_eval

async def run_master_eval_suite():
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    print("=" * 70)
    print("🎿 STARTING BRAINTRUST EVALUATION SUITE FOR SKI PLANNER APP")
    print(f"Timestamp: {timestamp}")
    print("Target: https://www.braintrust.dev/app/NTeodori/p/Ski%20Planner%20App")
    print("=" * 70)

    # 1. Trip Planner Evaluation
    print("\n[1/3] Executing Trip Planning Evaluation Pipeline...")
    t1_name = f"trip-planner-{timestamp}"
    res1 = await run_trip_planner_eval(experiment_name=t1_name)

    # 2. Deep Search Evaluation
    print("\n[2/3] Executing Live Search Grounding Evaluation Pipeline...")
    t2_name = f"deep-search-{timestamp}"
    res2 = await run_deep_search_eval(experiment_name=t2_name)

    # 3. Refine Trip Evaluation
    print("\n[3/3] Executing Conversational Refinement Evaluation Pipeline...")
    t3_name = f"refine-trip-{timestamp}"
    res3 = await run_refine_trip_eval(experiment_name=t3_name)

    print("\n" + "=" * 70)
    print("🎉 ALL BRAINTRUST EVALUATIONS COMPLETED SUCCESSFULLY!")
    print("=" * 70)
    print("📊 View your live evaluation experiments in Braintrust:")
    print(f"  • Trip Planner Evals : https://www.braintrust.dev/app/NTeodori/p/Ski%20Planner%20App/experiments/{t1_name}")
    print(f"  • Deep Search Evals  : https://www.braintrust.dev/app/NTeodori/p/Ski%20Planner%20App/experiments/{t2_name}")
    print(f"  • Refinement Evals   : https://www.braintrust.dev/app/NTeodori/p/Ski%20Planner%20App/experiments/{t3_name}")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_master_eval_suite())
