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
Snow-to-Liquid Ratio (SLR) & Powder Quality Calculator.
Calculates snow density, fluffiness index, and Dendritic Growth Zone (DGZ) alignment.
"""

import sys
import json
import argparse

def calculate_slr(surface_temp_f, elevation_ft=9000, wind_speed_mph=10, dgz_temp_c=-14.0):
    """
    Computes SLR based on thermal profiles, mountain elevation, and wind fragmentation.
    Optimal DGZ is -12C to -18C.
    """
    # Base ratio by surface temperature
    if surface_temp_f <= 10:
        base_slr = 24.0
    elif surface_temp_f <= 18:
        base_slr = 20.0
    elif surface_temp_f <= 24:
        base_slr = 16.0
    elif surface_temp_f <= 28:
        base_slr = 12.5
    elif surface_temp_f <= 32:
        base_slr = 9.0
    else:
        base_slr = 6.0 # Wet maritime snow

    # Elevation boost (drier continental air above 8,000 ft)
    if elevation_ft >= 9000:
        base_slr += 1.5
    elif elevation_ft >= 7000:
        base_slr += 0.8

    # Dendritic Growth Zone alignment bonus
    if -16.0 <= dgz_temp_c <= -13.0:
        base_slr += 2.0 # Prime dendritic crystal production

    # Wind fragmentation penalty (high winds shatter delicate snowflake arms, packing density)
    if wind_speed_mph > 30:
        base_slr -= 4.0
    elif wind_speed_mph > 18:
        base_slr -= 2.0

    slr_final = max(5.0, round(base_slr, 1))

    # Calculate density in kg/m3 (Water = 1000 kg/m3)
    density_kg_m3 = round(1000.0 / slr_final, 1)

    # Classify powder quality
    if slr_final >= 20.0:
        quality = "Ultra-Light Blower / Champagne Powder"
        fluff_rating = "⭐⭐⭐⭐⭐ (Maximum Float / Blower Face-Shots)"
    elif slr_final >= 15.0:
        quality = "Classic Dry Rocky Mountain Powder"
        fluff_rating = "⭐⭐⭐⭐ (Excellent Cushioning & Easy Turns)"
    elif slr_final >= 10.0:
        quality = "All-Mountain Standard Snow"
        fluff_rating = "⭐⭐⭐ (Good Packable Snow)"
    else:
        quality = "Dense Maritime Base-Builder (Sierra / Cascade Concrete)"
        fluff_rating = "⭐⭐ (Heavy Moisture / Unbeatable Base Foundation)"

    return {
        "inputs": {
            "surfaceTemperatureF": surface_temp_f,
            "elevationFeet": elevation_ft,
            "windSpeedMph": wind_speed_mph,
            "dgzTemperatureC": dgz_temp_c
        },
        "snowToLiquidRatio": f"{slr_final}:1",
        "snowDensityKgM3": density_kg_m3,
        "waterContentPercent": f"{round(100.0 / slr_final, 1)}%",
        "powderQualityClassification": quality,
        "fluffinessRating": fluff_rating,
        "dgzAlignment": "Optimal (-12°C to -18°C)" if (-18.0 <= dgz_temp_c <= -12.0) else "Sub-Optimal"
    }

def main():
    parser = argparse.ArgumentParser(description="Calculate Snow-to-Liquid Ratio (SLR) and powder density.")
    parser.add_argument("--temp", type=float, default=20.0, help="Mountain surface temperature in Fahrenheit")
    parser.add_argument("--elevation", type=int, default=9000, help="Elevation in feet")
    parser.add_argument("--wind", type=float, default=12.0, help="Mountain ridge wind speed in mph")
    parser.add_argument("--dgz", type=float, default=-14.0, help="700mb Dendritic Growth Zone temperature in Celsius")
    args = parser.parse_args()

    result = calculate_slr(args.temp, args.elevation, args.wind, args.dgz)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
