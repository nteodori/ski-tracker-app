"""
PowFinder AI - Synthetic Test Data Tuple Generator for Braintrust.
Reads the dimension prompt template, invokes Gemini to generate realistic dimension combinations
and valid evaluation test cases, and saves them locally or pushes them directly to Braintrust Datasets.
"""

import os
import sys
import json
import re
import argparse
import asyncio
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv(override=True)
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import braintrust as bt
from google import genai
from google.genai import types

PROMPT_FILE_PATH = os.path.join(os.path.dirname(__file__), "prompts", "generate_synthetic_test_tuples.md")
BRAINTRUST_PROJECT = os.environ.get("BRAINTRUST_PROJECT", "Ski Planner App")
DEFAULT_OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "datasets", "synthetic_tuples.json")


def load_prompt_template(num_tuples: int) -> str:
    if not os.path.exists(PROMPT_FILE_PATH):
        raise FileNotFoundError(f"Prompt template not found at {PROMPT_FILE_PATH}")
    
    with open(PROMPT_FILE_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    
    return content.replace("{{{num_tuples_to_generate}}}", str(num_tuples))


def generate_tuples_with_llm(num_tuples: int = 5) -> List[Dict[str, Any]]:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment or .env file.")
    
    client = genai.Client(api_key=api_key)
    prompt_text = load_prompt_template(num_tuples)
    
    system_instruction = (
        "You are an expert AI evaluation engineer specializing in synthetic dataset generation for "
        "travel, weather, and ski planning AI systems. Generate rich, diverse, realistic, and schema-compliant "
        "evaluation tuples in JSON format according to the user instructions."
    )
    
    models_to_try = [
        "gemini-flash-latest",
        "gemini-3.6-flash",
        "gemini-2.5-pro",
        "gemini-2.5-flash"
    ]
    
    raw_text = None
    last_err = None
    
    for model_name in models_to_try:
        try:
            print(f"🤖 Generating {num_tuples} synthetic test tuples using model '{model_name}'...")
            response = client.models.generate_content(
                model=model_name,
                contents=[prompt_text],
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.7,
                    response_mime_type="application/json"
                )
            )
            raw_text = response.text
            print(f"✅ Received response from {model_name}")
            break
        except Exception as e:
            print(f"⚠️ Warning: Model {model_name} failed: {e}. Trying next fallback...")
            last_err = e
            
    if not raw_text:
        raise RuntimeError(f"Failed to generate tuples from LLM: {last_err}")
    
    # Parse JSON
    try:
        parsed = json.loads(raw_text)
        if isinstance(parsed, dict) and "tuples" in parsed:
            tuples_list = parsed["tuples"]
        elif isinstance(parsed, list):
            tuples_list = parsed
        else:
            tuples_list = [parsed]
            
        print(f"✨ Successfully parsed {len(tuples_list)} synthetic test tuples.")
        return tuples_list
    except json.JSONDecodeError:
        # Attempt to clean markdown block
        match = re.search(r"```(?:json)?(.*?)```", raw_text, re.DOTALL)
        if match:
            parsed = json.loads(match.group(1).strip())
            return parsed.get("tuples", parsed) if isinstance(parsed, dict) else parsed
        raise ValueError(f"Could not parse valid JSON from response: {raw_text[:300]}")


def save_tuples_to_file(tuples: List[Dict[str, Any]], filepath: str = DEFAULT_OUTPUT_FILE):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump({"tuples": tuples}, f, indent=2)
    print(f"💾 Saved {len(tuples)} tuples to: {filepath}")


def push_tuples_to_braintrust(tuples: List[Dict[str, Any]], dataset_name: str = "Synthetic Ski Scenarios"):
    print(f"🚀 Pushing {len(tuples)} tuples to Braintrust Dataset '{dataset_name}' in project '{BRAINTRUST_PROJECT}'...")
    try:
        dataset = bt.init_dataset(
            project=BRAINTRUST_PROJECT,
            name=dataset_name
        )
        for t in tuples:
            inp = t.get("input", {})
            exp = t.get("expected", {})
            meta = t.get("dimension_values", {})
            dataset.insert(
                input=inp,
                expected=exp,
                metadata=meta
            )
        dataset.flush()
        print(f"🎉 Successfully uploaded {len(tuples)} records to Braintrust Dataset '{dataset_name}'!")
        print(f"🔗 View in Braintrust: https://www.braintrust.dev/app/NTeodori/p/Ski%20Planner%20App/datasets")
    except Exception as e:
        print(f"❌ Failed to push dataset to Braintrust: {e}")


def main():
    parser = argparse.ArgumentParser(description="Generate synthetic evaluation test tuples for PowFinder.")
    parser.add_argument("--count", "-n", type=int, default=5, help="Number of tuples to generate (default: 5)")
    parser.add_argument("--output", "-o", type=str, default=DEFAULT_OUTPUT_FILE, help="Path to output JSON file")
    parser.add_argument("--push", "-p", action="store_true", help="Push generated tuples directly to Braintrust Dataset")
    parser.add_argument("--dataset-name", type=str, default="Synthetic Ski Scenarios", help="Braintrust Dataset name")
    parser.add_argument("--print", action="store_true", help="Print formatted tuples to console")

    args = parser.parse_args()

    tuples = generate_tuples_with_llm(num_tuples=args.count)
    save_tuples_to_file(tuples, filepath=args.output)

    if args.print:
        print(json.dumps(tuples, indent=2))

    if args.push:
        push_tuples_to_braintrust(tuples, dataset_name=args.dataset_name)


if __name__ == "__main__":
    main()
