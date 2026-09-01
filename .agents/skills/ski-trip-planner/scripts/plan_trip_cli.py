# Copyright (c) 2026 MyCompany LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
Ski Trip Planner Helper CLI.
Interactive intake tool for collecting group ski preferences.
"""

import sys
import json

def prompt_choice(question, options):
    print(f"\n{question}")
    for idx, opt in enumerate(options, 1):
        print(f"  [{idx}] {opt}")
    while True:
        try:
            choice = input("Select an option (number): ").strip()
            num = int(choice)
            if 1 <= num <= len(options):
                return options[num - 1]
        except (ValueError, IndexError):
            pass
        print(f"Please enter a number between 1 and {len(options)}.")

def collect_preferences():
    print("=" * 60)
    print("⛷️  SKI TRIP PLANNER - INTAKE QUESTIONNAIRE")
    print("=" * 60)

    skill_level = prompt_choice(
        "1. What is your group's predominant ski / snowboard level?",
        ["Beginner (Greens, learning area)", 
         "Intermediate (Groomed blues, cruisers)", 
         "Advanced / Expert (Steep chutes, bowls, powder glades, cliffs)"]
    )

    group_size = input("\n2. Size of group (e.g. 4 buddies, 10 people): ").strip() or "4 people"

    goal = prompt_choice(
        "3. What is the primary goal of the trip?",
        ["Time with friends / Relaxed vacation",
         "Ski the gnarliest lines & hunt deep powder",
         "Epic splurge: Heli-skiing, private cat-skiing & ultra-luxury chalets",
         "Apres-ski, nightlife, and village party scene",
         "Family-friendly & all-around convenience"]
    )

    snow_quality = prompt_choice(
        "4. Snow quality priority:",
        ["Maximum dry powder (willing to storm chase)",
         "Reliable coverage & grooming (consistent conditions)",
         "Doesn't matter as long as there's terrain open"]
    )

    proximity = prompt_choice(
        "5. Proximity / Travel convenience:",
        ["Drive-only from home location",
         "Quick non-stop flight + short shuttle (<1h from airport)",
         "Willing to travel anywhere for the best snow"]
    )

    home_location = input("\n6. What is your home location / departure city? ").strip() or "San Francisco, CA"

    summary = {
        "skill_level": skill_level,
        "group_size": group_size,
        "trip_goal": goal,
        "snow_quality_priority": snow_quality,
        "travel_proximity": proximity,
        "home_location": home_location
    }

    print("\n" + "=" * 60)
    print("✅ PREFERENCES SUMMARY")
    print("=" * 60)
    print(json.dumps(summary, indent=2))
    print("\nFeed these preferences to your Antigravity Ski Trip Planner Agent to get your Top 3 recommendations!")
    return summary

if __name__ == "__main__":
    collect_preferences()
