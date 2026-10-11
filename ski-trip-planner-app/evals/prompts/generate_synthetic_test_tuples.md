# PowFinder Synthetic Test Data Generation Prompt

Use this prompt template in Braintrust (or with the automated script `evals/generate_tuples.py`) to generate realistic, diverse, and well-distributed test cases for evaluating the PowFinder Ski Trip Planner agent.

---

I am designing an AI ski trip planning assistant called PowFinder. The assistant analyzes real-time NOAA teleconnections, SNOTEL snowpack data, Google web grounding, season pass affiliations, terrain distributions, travel logistics, and group vibes to recommend optimal ski resorts and construct multi-day itineraries.

I want to evaluate and benchmark the assistant against a realistic, diverse, and challenging set of ski trip planning scenarios.

## Instructions

Generate {{{num_tuples_to_generate}}} unique combinations of dimension values based on the dimensions provided below.
- **Diversity & Balance**: Ensure balanced coverage across all dimensions, ski regions, pass types, ability levels, and trip styles.
- **Ski Domain Realism**: Ground combinations in authentic ski geography, real snow science phenomena (atmospheric rivers, La Niña/El Niño setups, SNOTEL historical base depths, champagne powder vs. Pacific Northwest heavy snow, spring corn cycles), season pass economics (Epic, Ikon, Indy, Mountain Collective), and airport/transit logistics.
- **Logical Consistency Constraints**:
  - Never pair `skier_ability_level: first_time_beginner` with `trip_vibe: gnarly_lines_steeps` or extreme terrain-only destinations (e.g., Silverton, Revelstoke backcountry) without beginner infrastructure.
  - Never pair `travel_mode: drive_local_sub_3hr` from non-mountain metros (e.g., Miami, Dallas, Chicago) with Pacific Northwest or Northern Rockies destinations.
  - Strictly respect season pass boundaries:
    - Never pair `pass_affiliation: epic_pass` with Ikon-exclusive resorts (e.g., Jackson Hole, Alta, Snowbird, Big Sky, Palisades Tahoe, Mammoth).
    - Never pair `pass_affiliation: ikon_pass` with Epic-exclusive resorts (e.g., Vail, Breckenridge, Whistler Blackcomb, Park City, Crested Butte).
  - Pair `snow_priority: deepest_snowpack_storm_chase` with flexible travel styles and powder-heavy destinations (e.g., Cottonwood Canyons UT, Mt. Baker WA, Steamboat CO, Revelstoke BC).
  - Match `group_dynamic` with realistic accommodations (e.g., `family_with_young_kids` paired with ski schools, beginner terrain, and pedestrian ski-in/ski-out villages).

---

## Dimensions & Permitted Values

1. `trip_vibe_and_goal`:
   - `powder_hunting_storm_chase`: Chasing fresh snow, tracking active storms, tree skiing, deep powder bowls.
   - `gnarly_lines_and_steeps`: Extreme freeride, double black diamonds, couloirs, cliff drops, hike-to alpine terrain.
   - `cruisers_groomers_relaxed`: Wide corduroy, scenic blue/green groomers, confidence building, leisurely pace.
   - `family_friendly_vacation`: Dedicated ski school, kid-friendly progression parks, tubing, village ice skating, ski-in/ski-out lodging.
   - `party_apres_nightlife`: Vibrant village scene, energetic après bars, DJ sets, craft breweries, hot tubs, bachelor/bachelorette trips.
   - `budget_independent_soul`: Indy Pass gems, uncrowded lifts, affordable day tickets, local authentic mountain culture, motels/cabin rentals.
   - `luxury_splurge_heli`: Five-star ski chalets, fine dining, private mountain guides, cat-skiing or heli-skiing charters, VIP transfers.

2. `skier_ability_level`:
   - `first_time_beginner`: Green circles only; requires gentle magic carpets, wide bunny slopes, and rental shop proximity.
   - `novice_intermediate`: Comfortable on greens, progressing on blues; avoids ice, deep moguls, and tight trees.
   - `solid_advanced`: Confident on all groomed blues and blacks; handles moderate moguls, off-piste trees, and variable powder.
   - `expert_freerider`: Thrives on double blacks, steep couloirs, tight chutes, powder glades, and backcountry gates.
   - `mixed_ability_group`: Wide skill spread (e.g., beginners + experts traveling together) requiring mountains with balanced terrain splits.

3. `pass_affiliation`:
   - `ikon_pass`: Unlimited/limited days at Ikon destinations (Palisades Tahoe, Jackson Hole, Mammoth, Big Sky, Steamboat, Alta/Snowbird, Aspen, Deer Valley, etc.).
   - `epic_pass`: Vail Resorts network (Vail, Breckenridge, Whistler Blackcomb, Park City, Heavenly, Keystone, Stowe, Crested Butte, Telluride partner days, etc.).
   - `indy_pass`: Independent mountains (Mt. Baker, Powder Mountain, Brundage, Mission Ridge, Jay Peak, Loveland, Hoodoo, etc.).
   - `mountain_collective`: 2 days each at premier independent/Ikon destinations (Alta, Snowbird, Jackson Hole, Aspen Snowmass, Sun Valley, Taos, Big Sky).
   - `independent_single_ticket`: Walk-up or window lift tickets; open to independent resorts that offer great value or uncrowded terrain.
   - `any_pass_flexible`: No existing pass constraints; willing to purchase whatever pass or ticket matches the best conditions.

4. `origin_and_travel_logistics`:
   - `drive_local_sub_3hr`: Weekend trip within driving distance from home metro (e.g., Denver to Summit County, SF/Sacramento to Tahoe, Seattle to Cascades, Boston to Vermont).
   - `drive_road_trip_extended`: 6-12 hour storm chase road trip in AWD/4WD with snow tires and ski rack.
   - `fly_short_haul_direct`: 2-4 hr domestic flight into major ski hubs (SLC, DEN, RNO, YYC, SEA) with rental SUV or express shuttle.
   - `fly_regional_mountain_airport`: Direct regional flight directly into mountain towns (JAC, EGE, ASE, HDN, SUN) with minimal ground transfer.
   - `fly_cross_country_long_haul`: Coast-to-coast flight (e.g., NYC, Miami, Atlanta, or Austin to Western US / Canada).

5. `snow_priority_and_season_timing`:
   - `deepest_snowpack_storm_chase`: Actively tracking incoming atmospheric rivers, deep base requirements, powder alert triggers.
   - `early_season_december_prep`: Reliable early snowmaking infrastructure, high base elevation, guaranteed holiday open terrain.
   - `peak_winter_cold_smoke_jan_feb`: Sub-freezing temperatures, dry champagne powder, consistent mid-season storm tracks.
   - `spring_corn_sunshine_mar_apr`: High solar radiation, soft corn snow cycles, sunny patio après, high-elevation snow preservation.
   - `weather_immune_groomers`: Cold temperatures and world-class snowmaking fleet prioritized over unpredictable natural snowfall.

6. `group_dynamic_and_party_size`:
   - `solo_skier_powder_hound`: 1 person; first chair to last chair, hostels or micro-hotel rooms, maximum vertical focus.
   - `couple_romantic_getaway`: 2 people; ski-in/ski-out, cozy fireplaces, spa, fine dining, picturesque alpine village.
   - `family_with_young_kids`: 3-5 people; childcare/ski school, beginner magic carpets, condo with kitchen, easy village shuttles.
   - `friends_crew_powder_chasers`: 4-8 skiers/riders; split Airbnb/cabin, budget-conscious, competitive lap counts and apres.
   - `corporate_or_vip_group`: 6-12 people; private luxury chalet, private guides, catered dining, executive airport transfers.

7. `query_style_and_specificity`:
   - `short_keywords_minimal_detail`: Fragmented search query (e.g., "ikon powder road trip feb 4 days 4 guys").
   - `concise_direct_inquiry`: Clear 1-2 sentence prompt with key constraints (pass, home city, budget, skill level).
   - `verbose_detailed_narrative`: Detailed multi-paragraph backstory with group dynamics, preferences, and specific trade-offs.
   - `complex_conflicting_constraints`: Challenging trade-offs (e.g., "expert steeps for parents, beginner magic carpet for 5-year-old, non-skier spa, no rental car, under $3k total").
   - `real_time_condition_check`: Conversational query asking for live snowpack comparisons between two specific regions right now.

8. `target_geographic_region`:
   - `utah_wasatch`: Little & Big Cottonwood Canyons, Park City, Ogden Valley.
   - `colorado_rockies`: I-70 corridor, Summit County, Roaring Fork Valley, San Juan Mountains.
   - `pacific_northwest_cascades`: Washington (Mt. Baker, Crystal Mountain, Stevens Pass), Oregon (Mt. Hood, Mt. Bachelor).
   - `california_sierra_nevada`: North Lake Tahoe, South Lake Tahoe, Mammoth Mountain.
   - `northern_rockies_id_mt_wy`: Jackson Hole, Grand Targhee, Big Sky, Sun Valley, Schweitzer.
   - `canadian_rockies_and_bc_powder_highway`: Whistler Blackcomb, Banff/Lake Louise, Revelstoke, Kicking Horse, RED Mountain.
   - `us_northeast_new_england`: Vermont (Stowe, Killington, Jay Peak), New Hampshire, Maine (Sugarloaf).

---

## Output JSON Schema

Return valid JSON with an array of objects under the key `"tuples"`. Each tuple must have the following structure:
```json
{
  "tuples": [
    {
      "dimension_values": {
        "trip_vibe_and_goal": "...",
        "skier_ability_level": "...",
        "pass_affiliation": "...",
        "origin_and_travel_logistics": "...",
        "snow_priority_and_season_timing": "...",
        "group_dynamic_and_party_size": "...",
        "query_style_and_specificity": "...",
        "target_geographic_region": "..."
      },
      "input": {
        "skillLevel": "expert",
        "groupGoal": ["gnarly-lines", "powder-hunting"],
        "snowPriority": "powder",
        "travelMode": "fly",
        "homeLocation": "San Francisco, CA",
        "passAffiliation": "ikon",
        "groupSize": "4 freeriders",
        "userQuery": "Need extreme chutes and deep powder on Ikon Pass departing SFO"
      },
      "expected": {
        "pass": "ikon",
        "min_advanced_terrain": 35,
        "required_vibes": ["gnarly-steeps", "powder-hunting"],
        "description": "Expert powder hounds on Ikon Pass from SFO"
      }
    }
  ]
}
```

Generate {{{num_tuples_to_generate}}} realistic, diverse, and well-distributed dimension tuples following these instructions.
