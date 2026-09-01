/**
 * Comprehensive North American Ski Resort Database
 * Includes terrain stats, snow averages, climate profiles, vibe tags, passes,
 * luxury / heli-skiing options, best timing guides, and events.
 */

export const RESORTS = [
  {
    id: "jackson-hole",
    name: "Jackson Hole Mountain Resort",
    region: "Wyoming / Northern Rockies",
    state: "WY",
    pass: "Ikon",
    annualSnowfall: 458,
    verticalDrop: 4139,
    skiableAcres: 2500,
    elevation: { base: 6311, summit: 10450 },
    terrain: { beginner: 10, intermediate: 40, advanced: 50 },
    vibe: ["gnarly-steeps", "powder-hunting", "cowboy-apres", "heli-luxury"],
    climateZone: "Northern Rockies",
    laNinaFactor: 1.15,
    elNinoFactor: 0.90,
    bestMonths: ["January", "February"],
    signatureRun: "Corbet's Couloir & Rendezvous Bowl",
    nearestAirport: "Jackson Hole Airport (JAC)",
    airportDriveMins: 25,
    nearestMajorHub: "Salt Lake City (SLC) - 4.5h drive",
    apresHighlights: ["Mangy Moose Saloon", "Million Dollar Cowboy Bar", "Continuum Bar"],
    heliAndLuxury: {
      hasHeli: true,
      operator: "High Mountain Heli-Skiing (Snake River & Palisades ranges)",
      luxuryHighlights: "Four Seasons Resort Jackson Hole, Amangani 5-star cliffside suites, private backcountry snowcat tours, and slopeside heated pools."
    },
    bestTimingGuide: {
      powderWindow: "January 15 – February 28 (highest frequency of Teton cold storm cycles)",
      crowdFreeWindow: "January 6 – January 18 (post-holiday lull) and mid-week early February",
      topEvents: [
        { name: "Kings & Queens of Corbet's", timing: "Mid-February", desc: "Freeriders and pros throw down massive airs into Corbet's Couloir." },
        { name: "Rendezvous Spring Festival", timing: "Late March", desc: "Legendary outdoor free concerts on the historic Jackson Town Square." }
      ]
    },
    description: "Legendary big-mountain terrain with continuous vertical fall lines, relentless steep chutes, and deep dry Teton powder."
  },
  {
    id: "snowbird",
    name: "Snowbird & Alta (Cottonwood Canyons)",
    region: "Utah / Wasatch",
    state: "UT",
    pass: "Ikon",
    annualSnowfall: 500,
    verticalDrop: 3240,
    skiableAcres: 4700,
    elevation: { base: 7760, summit: 11000 },
    terrain: { beginner: 15, intermediate: 35, advanced: 50 },
    vibe: ["powder-hunting", "gnarly-steeps", "die-hard-skiers", "heli-luxury"],
    climateZone: "Wasatch Front",
    laNinaFactor: 1.10,
    elNinoFactor: 1.05,
    bestMonths: ["January", "February", "March"],
    signatureRun: "The Cirque, Great Scott, & High Rustler",
    nearestAirport: "Salt Lake City Intl (SLC)",
    airportDriveMins: 40,
    nearestMajorHub: "Salt Lake City (SLC) - 40m drive",
    apresHighlights: ["Tram Club", "Goldminer's Daughter Saloon", "Aerie Lounge"],
    heliAndLuxury: {
      hasHeli: true,
      operator: "Wasatch Powderbird Guides (Exclusive Wasatch backcountry drops directly from Snowbird)",
      luxuryHighlights: "The Cliff Spa rooftop heated pool & luxury suites, Alta Lodge traditional gourmet dining, and private canyon guides."
    },
    bestTimingGuide: {
      powderWindow: "January 10 – March 15 (lake-effect storm cycles deliver ultra-light 'Greatest Snow on Earth')",
      crowdFreeWindow: "Mid-week Tuesday–Thursday throughout January and early March",
      topEvents: [
        { name: "Subaru Freeride Series", timing: "Mid-March", desc: "Big-mountain freeride athletes charge the steep terrain of North Baldy." },
        { name: "Plaza Spring Music Series", timing: "April weekends", desc: "Sunny spring deck parties, live reggae and brews on the Snowbird tram deck." }
      ]
    },
    description: "Famous for 'The Greatest Snow on Earth'. Little Cottonwood Canyon traps storm cycles, delivering ultra-light, high-volume powder."
  },
  {
    id: "palisades-tahoe",
    name: "Palisades Tahoe (Olympic Valley & Alpine)",
    region: "California / Sierra Nevada",
    state: "CA",
    pass: "Ikon",
    annualSnowfall: 400,
    verticalDrop: 2850,
    skiableAcres: 6000,
    elevation: { base: 6200, summit: 9050 },
    terrain: { beginner: 25, intermediate: 45, advanced: 30 },
    vibe: ["gnarly-steeps", "party-apres", "scenic-views", "heli-luxury"],
    climateZone: "Sierra Nevada",
    laNinaFactor: 0.95,
    elNinoFactor: 1.15,
    bestMonths: ["February", "March", "April"],
    signatureRun: "KT-22, The Fingers, & Silverado Bowl",
    nearestAirport: "Reno-Tahoe Intl (RNO)",
    airportDriveMins: 45,
    nearestMajorHub: "San Francisco / Sacramento (3-3.5h drive)",
    apresHighlights: ["Le Chamois (The Chammy)", "Auld Dubliner", "Plaza Bar"],
    heliAndLuxury: {
      hasHeli: true,
      operator: "Pacific Crest Snowcats & Tahoe Private Guided Backcountry Tours",
      luxuryHighlights: "Everline Resort & Spa ski-in/ski-out, Ritz-Carlton Lake Tahoe nearby with private gondola and champagne marshology."
    },
    bestTimingGuide: {
      powderWindow: "February 1 – March 20 (Atmospheric river storms drop 5–10 feet per cycle)",
      crowdFreeWindow: "Mid-week Tuesdays/Wednesdays and late April spring season",
      topEvents: [
        { name: "Pain McShlonkey Classic", timing: "Late March", desc: "Hilarious throwback snowblade comp honoring skiing legend Shane McConkey." },
        { name: "Cushing Crossing Pond Skim", timing: "Late April / Early May", desc: "The original and wildest spring pond skimming contest in North America." }
      ]
    },
    description: "Birthplace of extreme freeride skiing. Famous for cliff drops, KT-22 chairlift, vibrant Olympic Village, and spring snowpacks lasting till May."
  },
  {
    id: "whistler-blackcomb",
    name: "Whistler Blackcomb",
    region: "British Columbia / Coast Range",
    state: "BC",
    pass: "Epic",
    annualSnowfall: 465,
    verticalDrop: 5354,
    skiableAcres: 8171,
    elevation: { base: 2214, summit: 7494 },
    terrain: { beginner: 20, intermediate: 55, advanced: 25 },
    vibe: ["party-apres", "friends-vacation", "gnarly-steeps", "heli-luxury"],
    climateZone: "Pacific Northwest",
    laNinaFactor: 1.20,
    elNinoFactor: 0.85,
    bestMonths: ["January", "February", "March"],
    signatureRun: "Spanky's Ladder & Peak to Creek",
    nearestAirport: "Vancouver Intl (YVR)",
    airportDriveMins: 120,
    nearestMajorHub: "Vancouver (YVR) - 2h scenic Sea-to-Sky drive",
    apresHighlights: ["Garibaldi Lift Co (GLC)", "Merlin's", "Longhorn Saloon", "Dusty's"],
    heliAndLuxury: {
      hasHeli: true,
      operator: "Whistler Heli-Skiing (432,000 acres of exclusive Coast Mountain glaciers)",
      luxuryHighlights: "Four Seasons Resort Whistler, Fairmont Chateau Whistler private penthouse suites, luxury private chalet rentals with private executive chefs."
    },
    bestTimingGuide: {
      powderWindow: "January 15 – March 10 (coldest alpine storm systems and deepest base depth)",
      crowdFreeWindow: "Early December and late January mid-week (avoid Canadian Family Day & President's Day week)",
      topEvents: [
        { name: "World Ski & Snowboard Festival (WSSF)", timing: "Mid-April", desc: "Mega celebration of mountain culture, big air competitions, and live music." },
        { name: "Whistler Pride & Ski Festival", timing: "Late January", desc: "One of the world's biggest winter pride ski festivals with vibrant village parties." }
      ]
    },
    description: "The largest ski resort in North America. Two massive interconnected peaks with high-alpine glaciers, alpine bowls, and world-class pedestrian nightlife."
  },
  {
    id: "revelstoke",
    name: "Revelstoke Mountain Resort",
    region: "British Columbia / Interior",
    state: "BC",
    pass: "Ikon",
    annualSnowfall: 450,
    verticalDrop: 5620,
    skiableAcres: 3121,
    elevation: { base: 1680, summit: 7300 },
    terrain: { beginner: 12, intermediate: 43, advanced: 45 },
    vibe: ["gnarly-steeps", "powder-hunting", "chill-authentic", "heli-luxury"],
    climateZone: "Interior BC",
    laNinaFactor: 1.25,
    elNinoFactor: 0.90,
    bestMonths: ["January", "February"],
    signatureRun: "Kill the Banker & North Bowl Chutes",
    nearestAirport: "Kelowna Intl (YLW)",
    airportDriveMins: 150,
    nearestMajorHub: "Calgary (YYC) - 4.5h drive",
    apresHighlights: ["Mackenzie Common Tavern", "The Village Idiot", "Chubby Funsters"],
    heliAndLuxury: {
      hasHeli: true,
      operator: "Selkirk Tangiers Heli Skiing (Over 500,000 acres in Selkirk & Monashee Mountains)",
      luxuryHighlights: "The Sutton Place Hotel ski-in/ski-out penthouses, Bighorn Luxury Heli-Ski Chalet (voted World's Best Ski Chalet), private hot springs access."
    },
    bestTimingGuide: {
      powderWindow: "January 5 – February 25 (unrivaled interior BC blower powder)",
      crowdFreeWindow: "Virtually uncrowded all season; midweek January offers private-mountain feel",
      topEvents: [
        { name: "Natural Selection Tour Qualifier / Freeride Cup", timing: "February", desc: "Elite snowboarders and skiers battle in steep natural pillow lines." }
      ]
    },
    description: "Boasts the greatest vertical descent in North America (5,620 ft) with incredible pillow lines, deep interior snow, and expansive powder bowls."
  },
  {
    id: "telluride",
    name: "Telluride Ski Resort",
    region: "Colorado / San Juan Mountains",
    state: "CO",
    pass: "Epic",
    annualSnowfall: 300,
    verticalDrop: 4425,
    skiableAcres: 2000,
    elevation: { base: 8725, summit: 13150 },
    terrain: { beginner: 23, intermediate: 36, advanced: 41 },
    vibe: ["gnarly-steeps", "friends-vacation", "scenic-views", "heli-luxury"],
    climateZone: "San Juan Mountains",
    laNinaFactor: 0.95,
    elNinoFactor: 1.15,
    bestMonths: ["February", "March"],
    signatureRun: "Palmyra Peak Hike-to Chutes & Plunge",
    nearestAirport: "Montrose (MTJ) / Telluride (TEX)",
    airportDriveMins: 70,
    nearestMajorHub: "Denver (DEN) - 6.5h drive",
    apresHighlights: ["Tomboy Tavern", "There Bar", "Historic Sheridan Opera House Bar", "Alpino Vino"],
    heliAndLuxury: {
      hasHeli: true,
      operator: "Telluride Helitrax (Colorado's premier high-altitude heli-skiing operation since 1982)",
      luxuryHighlights: "Madeline Hotel & Residences (Auberge Resorts Collection), Alpino Vino (highest fine-dining restaurant in North America at 11,966 ft), private heated gondola."
    },
    bestTimingGuide: {
      powderWindow: "February 1 – March 25 (San Juan storm tracks deliver dry alpine dumps)",
      crowdFreeWindow: "Late January and early March (zero lift lines guaranteed due to uncrowded slopes)",
      topEvents: [
        { name: "Telluride Comedy Festival", timing: "Mid-February", desc: "Top comedians perform at the historic Sheridan Opera House." },
        { name: "Telluride Gay Ski Week", timing: "Late February", desc: "High-energy alpine costume parties, parties, and ski parades." }
      ]
    },
    description: "Box-canyon beauty in the rugged San Juan Mountains. Features extreme hike-to peaks, free gondola transit between mountain and historic town, and zero lift lines."
  },
  {
    id: "aspen-snowmass",
    name: "Aspen Snowmass (Ajax, Highlands, Snowmass, Buttermilk)",
    region: "Colorado / Roaring Fork Valley",
    state: "CO",
    pass: "Ikon",
    annualSnowfall: 300,
    verticalDrop: 4406,
    skiableAcres: 5517,
    elevation: { base: 8104, summit: 12510 },
    terrain: { beginner: 10, intermediate: 45, advanced: 45 },
    vibe: ["party-apres", "gnarly-steeps", "friends-vacation", "heli-luxury"],
    climateZone: "Central Rockies",
    laNinaFactor: 1.05,
    elNinoFactor: 1.00,
    bestMonths: ["January", "February", "March"],
    signatureRun: "Highland Bowl (legendary hike-to steeps)",
    nearestAirport: "Aspen/Pitkin County (ASE)",
    airportDriveMins: 10,
    nearestMajorHub: "Denver (DEN) - 3.5h drive",
    apresHighlights: ["Cloud Nine Alpine Bistro", "Belly Up Aspen", "The Red Onion", "Ajax Tavern"],
    heliAndLuxury: {
      hasHeli: true,
      operator: "Aspen Mountain Powder Tours (Private snowcat skiing on 1,100+ pristine acres on the backside of Aspen)",
      luxuryHighlights: "The Little Nell 5-star 5-diamond ski-in/ski-out hotel, St. Regis Aspen Resort, private sommelier cellar tastings, and Cloud Nine VIP champagne parties."
    },
    bestTimingGuide: {
      powderWindow: "January 20 – March 15 (Highland Bowl opens with consistent alpine snowpack)",
      crowdFreeWindow: "January 5 – January 20 (post-holidays) and mid-April spring skiing",
      topEvents: [
        { name: "Winter X Games Aspen", timing: "Late January", desc: "The world's premier action sports competition with live headlining music." },
        { name: "Bud Light Hi-Fi Concert Series", timing: "Throughout March & April", desc: "Free outdoor concerts at the base of Aspen Mountain and Snowmass." }
      ]
    },
    description: "Four distinct mountains on one ticket. Famous for the exhilarating Highland Bowl hike, premier fine dining, and legendary alpine champagne parties."
  },
  {
    id: "vail",
    name: "Vail Ski Resort",
    region: "Colorado / Central Rockies",
    state: "CO",
    pass: "Epic",
    annualSnowfall: 354,
    verticalDrop: 3450,
    skiableAcres: 5317,
    elevation: { base: 8120, summit: 11570 },
    terrain: { beginner: 18, intermediate: 29, advanced: 53 },
    vibe: ["friends-vacation", "party-apres", "cruisers-groomers", "heli-luxury"],
    climateZone: "Central Rockies",
    laNinaFactor: 1.05,
    elNinoFactor: 1.00,
    bestMonths: ["January", "February", "March"],
    signatureRun: "Sun Up Bowl & Blue Sky Basin",
    nearestAirport: "Eagle County (EGE) / Denver (DEN)",
    airportDriveMins: 35,
    nearestMajorHub: "Denver (DEN) - 2h drive via I-70",
    apresHighlights: ["Pepi's Bar", "The Red Lion", "Vendetta's", "Root & Flower"],
    heliAndLuxury: {
      hasHeli: false,
      operator: "Vail Backcountry Snowcat Skiing & Private VIP Guide Service",
      luxuryHighlights: "The Arrabelle at Vail Square, Four Seasons Resort Vail with ski concierge, private heated cobblestone walkways, and Matsuhisa fine dining."
    },
    bestTimingGuide: {
      powderWindow: "January 15 – March 1 (Blue Sky Basin and Back Bowls fully open with peak coverage)",
      crowdFreeWindow: "Midweek January 8–20 and first week of April",
      topEvents: [
        { name: "Vail Snow Days", timing: "Mid-December", desc: "Early season music festival and village celebration." },
        { name: "Taste of Vail", timing: "Early April", desc: "Premier food and wine festival featuring world-renowned chefs and vintners." }
      ]
    },
    description: "Iconic luxury resort with vast legendary Back Bowls, immense groomers, and upscale European-style pedestrian villages."
  },
  {
    id: "breckenridge",
    name: "Breckenridge Ski Resort",
    region: "Colorado / Summit County",
    state: "CO",
    pass: "Epic",
    annualSnowfall: 366,
    verticalDrop: 3398,
    skiableAcres: 2908,
    elevation: { base: 9600, summit: 12998 },
    terrain: { beginner: 19, intermediate: 25, advanced: 56 },
    vibe: ["friends-vacation", "party-apres", "family-convenient"],
    climateZone: "Central Rockies",
    laNinaFactor: 1.05,
    elNinoFactor: 1.00,
    bestMonths: ["February", "March", "April"],
    signatureRun: "Imperial Bowl & Peak 6 High Alpine Chutes",
    nearestAirport: "Denver Intl (DEN)",
    airportDriveMins: 100,
    nearestMajorHub: "Denver (DEN) - 1.5h drive",
    apresHighlights: ["Breckenridge Brewery", "The Gold Pan Saloon", "RMU (Rocky Mountain Underground)"],
    heliAndLuxury: {
      hasHeli: false,
      operator: "High Country Snowmobile & Private Mountain Guides",
      luxuryHighlights: "Grand Colorado on Peak 8 luxury ski-in/ski-out residences, private heated slope-side spas, and historic Victorian town chalets."
    },
    bestTimingGuide: {
      powderWindow: "February 1 – March 31 (Peak snow retention thanks to high 9,600' base)",
      crowdFreeWindow: "Late January midweek and mid-April (Peak 8 stays open until late May)",
      topEvents: [
        { name: "Ullr Fest", timing: "Mid-December", desc: "Wild Nordic celebration honoring the Norse God of Snow with costume parades and the World's Longest Shot Ski." },
        { name: "International Snow Sculpture Championships", timing: "Late January", desc: "World artists carve 20-ton blocks of snow into incredible museum-grade sculptures." }
      ]
    },
    description: "Five towering peaks with high-alpine bowl skiing, vibrant Victorian mining town nightlife, and consistent snow retention due to high base elevation."
  },
  {
    id: "steamboat",
    name: "Steamboat Ski Resort",
    region: "Colorado / Northern Rockies",
    state: "CO",
    pass: "Ikon",
    annualSnowfall: 314,
    verticalDrop: 3668,
    skiableAcres: 3741,
    elevation: { base: 6900, summit: 10568 },
    terrain: { beginner: 14, intermediate: 42, advanced: 44 },
    vibe: ["powder-hunting", "friends-vacation", "chill-authentic", "heli-luxury"],
    climateZone: "Northern Colorado",
    laNinaFactor: 1.10,
    elNinoFactor: 0.95,
    bestMonths: ["January", "February"],
    signatureRun: "Shadows & Closets (world-class aspen glades)",
    nearestAirport: "Yampa Valley (HDN) / Denver (DEN)",
    airportDriveMins: 30,
    nearestMajorHub: "Denver (DEN) - 3.5h drive",
    apresHighlights: ["T-Bar at Steamboat", "Timber & Torch", "Strawberry Park Hot Springs"],
    heliAndLuxury: {
      hasHeli: false,
      operator: "Steamboat Powdercats (Premier luxury snowcat skiing on Buffalo Pass)",
      luxuryHighlights: "One Steamboat Place luxury residences, private natural thermal hot springs tours, and sleigh ride mountain dinners."
    },
    bestTimingGuide: {
      powderWindow: "January 5 – February 20 (Trademark Champagne Powder at peak lightness)",
      crowdFreeWindow: "January 10 – January 22 and first two weeks of March",
      topEvents: [
        { name: "Steamboat Winter Carnival", timing: "Early February", desc: "110+ year tradition featuring kids pulled on skis behind galloping horses down Main Street and the Lighted Man fireworks." },
        { name: "MusicFest at Steamboat", timing: "Early January", desc: "Massive 6-day Americana and Texas country music festival." }
      ]
    },
    description: "Home of legendary trademarked 'Champagne Powder'. World-renowned for perfectly spaced aspen glades, western hospitality, and thermal hot springs."
  },
  {
    id: "park-city",
    name: "Park City Mountain Resort",
    region: "Utah / Wasatch Back",
    state: "UT",
    pass: "Epic",
    annualSnowfall: 355,
    verticalDrop: 3226,
    skiableAcres: 7300,
    elevation: { base: 6800, summit: 10026 },
    terrain: { beginner: 17, intermediate: 50, advanced: 33 },
    vibe: ["friends-vacation", "party-apres", "cruisers-groomers", "heli-luxury"],
    climateZone: "Wasatch Front",
    laNinaFactor: 1.05,
    elNinoFactor: 1.05,
    bestMonths: ["January", "February", "March"],
    signatureRun: "Jupiter Bowl & McConkey's Bowl",
    nearestAirport: "Salt Lake City Intl (SLC)",
    airportDriveMins: 35,
    nearestMajorHub: "Salt Lake City (SLC) - 35m drive",
    apresHighlights: ["High West Distillery", "No Name Saloon", "The Pig Pen Saloon"],
    heliAndLuxury: {
      hasHeli: true,
      operator: "Wasatch Powderbird (Direct heli pick-up options) & Private Montage Deer Valley Ski Valet",
      luxuryHighlights: "Montage Deer Valley, St. Regis Deer Valley with daily champagne sabering, and private ski-in Town Lift directly to Historic Main Street."
    },
    bestTimingGuide: {
      powderWindow: "January 15 – March 10 (Reliable Wasatch storms with 7,300 acres of open terrain)",
      crowdFreeWindow: "January 5 – January 18 (Right before Sundance Film Festival) and late March",
      topEvents: [
        { name: "Sundance Film Festival", timing: "Late January", desc: "World-famous film festival bringing Hollywood stars, parties, and screenings to Main Street." },
        { name: "Spring Grüv & Pond Skim", timing: "Late March", desc: "16 days of live music, costume parties, and the annual pond skim." }
      ]
    },
    description: "The largest ski resort in the United States. Offers ski-in/ski-out directly to historic Main Street, extensive cruiser terrain, and ultra-easy airport access."
  },
  {
    id: "big-sky",
    name: "Big Sky Resort",
    region: "Montana / Northern Rockies",
    state: "MT",
    pass: "Ikon",
    annualSnowfall: 400,
    verticalDrop: 4350,
    skiableAcres: 5850,
    elevation: { base: 6800, summit: 11166 },
    terrain: { beginner: 15, intermediate: 25, advanced: 60 },
    vibe: ["gnarly-steeps", "powder-hunting", "chill-authentic", "heli-luxury"],
    climateZone: "Northern Rockies",
    laNinaFactor: 1.20,
    elNinoFactor: 0.90,
    bestMonths: ["January", "February", "March"],
    signatureRun: "The Big Couloir & Lone Peak Tram Chutes",
    nearestAirport: "Bozeman Yellowstone Intl (BZN)",
    airportDriveMins: 55,
    nearestMajorHub: "Bozeman (BZN) - 1h scenic canyon drive",
    apresHighlights: ["Montana Jack", "Scissorbills Saloon", "Everett's 8800"],
    heliAndLuxury: {
      hasHeli: false,
      operator: "Yellowstone Club adjacent & Lone Mountain Ranch Private Snowcat Tours",
      luxuryHighlights: "Montage Big Sky, brand-new Lone Peak Tram with VIP glass viewing platform, Everett's 8,800' fine dining atop Andesite Mountain."
    },
    bestTimingGuide: {
      powderWindow: "January 20 – March 15 (Northern storm track packs Lone Peak's couloirs)",
      crowdFreeWindow: "Consistently lowest skier density in North America (~2 acres per skier); any non-holiday week is wide open",
      topEvents: [
        { name: "Big Sky Big Grass Festival", timing: "Late January / Early February", desc: "4-day bluegrass festival with top mountain picking." },
        { name: "Shedhorn Skimo Race", timing: "Mid-March", desc: "Hardcore ski-mountaineering race scaling Lone Peak's ridgelines." }
      ]
    },
    description: "Massive terrain surrounding the majestic Lone Peak. Known for empty lift lines, thrilling high-alpine exposure, and cutting-edge tram infrastructure."
  },
  {
    id: "crested-butte",
    name: "Crested Butte Mountain Resort",
    region: "Colorado / Southern Rockies",
    state: "CO",
    pass: "Epic",
    annualSnowfall: 300,
    verticalDrop: 3062,
    skiableAcres: 1547,
    elevation: { base: 9375, summit: 12162 },
    terrain: { beginner: 18, intermediate: 29, advanced: 53 },
    vibe: ["gnarly-steeps", "chill-authentic", "powder-hunting"],
    climateZone: "Southern/Central Rockies",
    laNinaFactor: 0.95,
    elNinoFactor: 1.10,
    bestMonths: ["February", "March"],
    signatureRun: "The North Face Extreme Limits & Rambo",
    nearestAirport: "Gunnison-Crested Butte (GUC) / Montrose (MTJ)",
    airportDriveMins: 35,
    nearestMajorHub: "Denver (DEN) - 4.5h drive",
    apresHighlights: ["The Eldo Brewery", "Talk of the Town", "The Secret Stash Pizza"],
    heliAndLuxury: {
      hasHeli: false,
      operator: "Irwin Guides / Eleven Experience (World-class private cat-skiing in Irwin Basin receiving 600\"+ of snow)",
      luxuryHighlights: "Scarp Ridge Lodge by Eleven Experience (ultra-exclusive luxury chalet with private custom snowcats and private chef)."
    },
    bestTimingGuide: {
      powderWindow: "February 5 – March 20 (North Face Extreme Limits open once mid-winter base is set)",
      crowdFreeWindow: "Midweek throughout February; remote location keeps lift lines near zero",
      topEvents: [
        { name: "Al Johnson Memorial Uphill/Downhill Telemark Race", timing: "Mid-March", desc: "Costumed racers climb 1,200 ft and charge down the extreme North Face." },
        { name: "Flauschink Spring Festival", timing: "Early April", desc: "Historic local celebration saying goodbye to winter with polka and coronation ceremonies." }
      ]
    },
    description: "Colorado's last great ski town. Renowned for North Face 'Extreme Limits' in-bounds cliff bands, chutes, and funky, historic local soul."
  },
  {
    id: "mammoth",
    name: "Mammoth Mountain",
    region: "California / Eastern Sierra",
    state: "CA",
    pass: "Ikon",
    annualSnowfall: 400,
    verticalDrop: 3100,
    skiableAcres: 3500,
    elevation: { base: 7953, summit: 11053 },
    terrain: { beginner: 25, intermediate: 40, advanced: 35 },
    vibe: ["friends-vacation", "powder-hunting", "party-apres"],
    climateZone: "Sierra Nevada",
    laNinaFactor: 0.90,
    elNinoFactor: 1.20,
    bestMonths: ["January", "February", "March", "April"],
    signatureRun: "Dave's Run & Huevos Grande Chutes",
    nearestAirport: "Bishop (BIH) / Reno (RNO)",
    airportDriveMins: 45,
    nearestMajorHub: "Los Angeles (LAX) - 5h drive",
    apresHighlights: ["Yodler Restaurant & Bar", "Clocktower Cellar", "Tusks Bar"],
    heliAndLuxury: {
      hasHeli: false,
      operator: "Sierra Mountain Guides (Backcountry splitboard / ski tours in the High Sierra)",
      luxuryHighlights: "The Westin Monache Resort, private luxury chalet rentals in The Village, snowmobile excursions to Minaret Vista."
    },
    bestTimingGuide: {
      powderWindow: "January 15 – March 15 (El Niño atmospheric river sequences drop massive feet of snow)",
      crowdFreeWindow: "Midweek Monday–Thursday and early May (season often runs into July 4th)",
      topEvents: [
        { name: "Mammoth Film Festival", timing: "Early February", desc: "Celebrity-attended winter independent film festival." },
        { name: "Canyon Beach Party & Pond Skim", timing: "Mid-April", desc: "Tropical-themed spring celebration with outdoor DJ stages." }
      ]
    },
    description: "California's highest ski summit. Legendary for monster storm cycles, incredible terrain parks, and an ultra-long spring season running into June."
  },
  {
    id: "mt-baker",
    name: "Mt. Baker Ski Area",
    region: "Washington / Cascades",
    state: "WA",
    pass: "Independent",
    annualSnowfall: 663,
    verticalDrop: 1500,
    skiableAcres: 1000,
    elevation: { base: 3500, summit: 5087 },
    terrain: { beginner: 24, intermediate: 45, advanced: 31 },
    vibe: ["powder-hunting", "gnarly-steeps", "chill-authentic"],
    climateZone: "Pacific Northwest",
    laNinaFactor: 1.30,
    elNinoFactor: 0.80,
    bestMonths: ["December", "January", "February"],
    signatureRun: "The Shuksan Arm & Hemispheres",
    nearestAirport: "Bellingham (BLI) / Seattle (SEA)",
    airportDriveMins: 75,
    nearestMajorHub: "Seattle (SEA) - 2.5h drive",
    apresHighlights: ["Chair 9 Woodstone Pizza & Bar", "North Fork Brewery"],
    heliAndLuxury: {
      hasHeli: false,
      operator: "North Cascades Mountain Guides (Pure backcountry powder exploration)",
      luxuryHighlights: "Cozy rustic glacier A-frame cabins, authentic Pacific Northwest craft beer and woodfired lodge comfort."
    },
    bestTimingGuide: {
      powderWindow: "December 15 – February 20 (World-record seasonal storm cycles)",
      crowdFreeWindow: "Tuesday–Thursday all season long (no on-mountain lodging keeps day crowds light)",
      topEvents: [
        { name: "Legendary Mt. Baker Banked Slalom", timing: "Early February", desc: "The oldest and most prestigious snowboard race in the world, founded in 1985." }
      ]
    },
    description: "World record holder for highest seasonal snowfall (1,140 inches in 1998-99). Unmatched deep powder, backcountry terrain access, and pure core soul."
  },
  {
    id: "killington",
    name: "Killington Resort ('The Beast of the East')",
    region: "Vermont / Green Mountains",
    state: "VT",
    pass: "Ikon",
    annualSnowfall: 250,
    verticalDrop: 3050,
    skiableAcres: 1509,
    elevation: { base: 1165, summit: 4241 },
    terrain: { beginner: 28, intermediate: 33, advanced: 39 },
    vibe: ["party-apres", "friends-vacation", "cruisers-groomers"],
    climateZone: "Northeast",
    laNinaFactor: 1.00,
    elNinoFactor: 1.00,
    bestMonths: ["January", "February"],
    signatureRun: "Outer Limits (steepest mogul run in the East)",
    nearestAirport: "Rutland (RUT) / Burlington (BTV) / Boston (BOS)",
    airportDriveMins: 45,
    nearestMajorHub: "Boston (BOS) - 2.5h drive",
    apresHighlights: ["Wobbly Barn", "Pickle Barrel Nightclub", "Lookout Tavern"],
    heliAndLuxury: {
      hasHeli: false,
      operator: "Killington Mountain VIP Private Guide Experience",
      luxuryHighlights: "Killington Grand Resort Hotel, private spa treatments, Peak Lodge panoramic fine dining via express gondola."
    },
    bestTimingGuide: {
      powderWindow: "January 20 – February 28 (Nor'easter storm cycles and peak natural snow coverage)",
      crowdFreeWindow: "Midweek non-holiday weeks (Tuesday–Thursday)",
      topEvents: [
        { name: "Audi FIS Ski World Cup (Killington Cup)", timing: "Late November / Thanksgiving", desc: "Women's World Cup slalom and giant slalom races drawing 30,000+ fans." },
        { name: "Dazed & Defrosted Spring Festival", timing: "Mid-April", desc: "Spring moguls, craft brews, and live outdoor concerts at Bear Mountain." }
      ]
    },
    description: "The largest ski resort in Eastern North America. Features 6 mountain peaks, colossal snowmaking firepower, and the legendary Access Road nightlife scene."
  }
];

/**
 * World-Class Heli-Skiing, Private Snowcat & Ultra-Luxury Ski Expeditions
 */
export const HELI_LUXURY_EXPEDITIONS = [
  {
    id: "selkirk-tangiers",
    name: "Selkirk Tangiers Heli Skiing",
    experienceType: "Heli-Skiing Charter",
    operatorType: "heli",
    region: "Revelstoke / Selkirk & Monashee Ranges",
    state: "BC",
    country: "Canada",
    tenureAcres: 500000,
    tenureDescription: "500,000+ acres of untouched alpine bowls, massive glades, and glacier runs across two legendary mountain ranges.",
    dailyVertGuarantee: "15,000 – 20,000 vertical ft / day",
    aircraftFleet: "Eurocopter AStar B3 & Bell 212",
    luxuryLodge: "Bighorn Luxury Heli-Ski Chalet (Private helipad, private executive chef, indoor pool) & The Sutton Place Hotel",
    packageType: "Private Helicopter Charter & Multi-Day Powder Safaris",
    annualSnowfall: 450,
    laNinaFactor: 1.25,
    elNinoFactor: 0.90,
    bestMonths: ["January", "February"],
    nearestAirport: "Kelowna Intl (YLW) / Private Helicopter Transfer",
    airportDriveMins: 150,
    inclusions: ["Certified ACMG/IFMGA mountain guides", "BCA Float avalanche airbag & transceiver", "Gourmet hot mountain lunches", "Private chef multi-course dinners", "Unlimited powder guarantee options"],
    vibe: ["heli-luxury", "powder-hunting", "gnarly-steeps"],
    description: "The gold standard of world heli-skiing. 500,000 acres of exclusive tenure in the Selkirk and Monashee Mountains, delivering deep interior British Columbia blower powder."
  },
  {
    id: "telluride-helitrax",
    name: "Telluride Helitrax",
    experienceType: "High-Altitude Heli-Skiing",
    operatorType: "heli",
    region: "San Juan Mountains",
    state: "CO",
    country: "USA",
    tenureAcres: 128000, // 200+ sq miles
    tenureDescription: "Over 200 square miles of pristine high-alpine San Juan backcountry with landings exceeding 13,500 ft elevation.",
    dailyVertGuarantee: "10,000 – 14,000 vertical ft / day (6 runs standard)",
    aircraftFleet: "Eurocopter AStar 350 B3e (Optimized for extreme high-altitude performance)",
    luxuryLodge: "Madeline Hotel & Residences (Auberge Resorts Collection) & Dunton Hot Springs Private Chalets",
    packageType: "Day Heli-Skiing & Private Custom Charters",
    annualSnowfall: 300,
    laNinaFactor: 0.95,
    elNinoFactor: 1.15,
    bestMonths: ["February", "March"],
    nearestAirport: "Telluride Regional (TEX) / Montrose (MTJ)",
    airportDriveMins: 15,
    inclusions: ["Full avalanche safety kit with airbag packs", "Tailored backcountry groups (4 guests to 1 guide ratio)", "Gourmet mountain-side lunch", "Apres champagne toast at base"],
    vibe: ["heli-luxury", "gnarly-steeps", "scenic-views"],
    description: "Colorado's premier heli-skiing operation since 1982. Flies among the dramatic 13,000-foot peaks of the San Juan Mountains with direct departures from Mountain Village."
  },
  {
    id: "whistler-heli",
    name: "Whistler Heli-Skiing",
    experienceType: "Glacier & Big Mountain Heli-Skiing",
    operatorType: "heli",
    region: "Coast Mountain Range",
    state: "BC",
    country: "Canada",
    tenureAcres: 432000,
    tenureDescription: "432,000 acres of exclusive high-alpine Coast Mountain terrain featuring 173 glaciers and 475 named runs.",
    dailyVertGuarantee: "12,000 – 18,000 vertical ft / day",
    aircraftFleet: "Bell 212 & Bell 407",
    luxuryLodge: "Four Seasons Resort Whistler Private Residences & Fairmont Chateau Whistler VIP Penthouse",
    packageType: "Private Bell 407 Platinum Charter & Elite Glacier Safaris",
    annualSnowfall: 465,
    laNinaFactor: 1.20,
    elNinoFactor: 0.85,
    bestMonths: ["January", "February", "March"],
    nearestAirport: "Vancouver Intl (YVR) / Whistler Heliport",
    airportDriveMins: 120,
    inclusions: ["ACMG/UIAGM certified mountain guides", "Electronic avalanche safety backpack system", "Gourmet glacier lunch prepared by Bearfoot Bistro", "Private village transfers"],
    vibe: ["heli-luxury", "party-apres", "powder-hunting"],
    description: "Operates 54 times the skiable terrain of Whistler and Blackcomb combined. Expansive high-alpine glacier cruisers, couloirs, and deep coastal powder bowls."
  },
  {
    id: "eleven-experience-irwin",
    name: "Eleven Experience: Scarp Ridge Lodge & Irwin Cat-Skiing",
    experienceType: "Private Luxury Snowcat & Exclusive Wilderness Chalet",
    operatorType: "cat",
    region: "Irwin Basin / Elk Mountains",
    state: "CO",
    country: "USA",
    tenureAcres: 1000,
    tenureDescription: "1,000+ private backcountry acres in Lake Irwin basin receiving over 600 inches of snow annually due to a unique local orographic microclimate.",
    dailyVertGuarantee: "Unlimited vertical (typically 10–14 untracked runs / day)",
    aircraftFleet: "Custom Heated Tucker Sno-Cats equipped with leather seating and flat screens",
    luxuryLodge: "Scarp Ridge Lodge (19th-century Victorian bank converted into a 5-star private luxury lodge with indoor saltwater pool and private chef)",
    packageType: "All-Inclusive Private Lodge Buyout & Bespoke Guided Cat-Skiing",
    annualSnowfall: 600,
    laNinaFactor: 0.95,
    elNinoFactor: 1.10,
    bestMonths: ["February", "March"],
    nearestAirport: "Gunnison-Crested Butte (GUC) / Montrose (MTJ)",
    airportDriveMins: 35,
    inclusions: ["Private cat and full staff of guides", "Chef-prepared custom breakfast, lunch, and multi-course dinners", "Full open bar with curated sommelier wine cellars", "Custom ski gear and avalanche airbags"],
    vibe: ["heli-luxury", "chill-authentic", "powder-hunting"],
    description: "The pinnacle of private luxury snowcat skiing. Combines an ultra-exclusive private luxury mansion in downtown Crested Butte with deep private powder in Irwin Basin."
  },
  {
    id: "powderbird-wasatch",
    name: "Wasatch Powderbird Guides",
    experienceType: "Heli-Skiing Charter",
    operatorType: "heli",
    region: "Wasatch & Uinta Mountain Ranges",
    state: "UT",
    country: "USA",
    tenureAcres: 150000,
    tenureDescription: "Hundreds of square miles of exclusive backcountry permits spanning Little Cottonwood, Big Cottonwood, and the high Uintas.",
    dailyVertGuarantee: "12,000 – 16,000 vertical ft / day (7 runs standard)",
    aircraftFleet: "Eurocopter AStar B3",
    luxuryLodge: "The Cliff Spa Penthouse Suites (Snowbird) & Montage Deer Valley Helipad",
    packageType: "Day Heli-Skiing & Private Group Charters",
    annualSnowfall: 500,
    laNinaFactor: 1.10,
    elNinoFactor: 1.05,
    bestMonths: ["January", "February", "March"],
    nearestAirport: "Salt Lake City Intl (SLC)",
    airportDriveMins: 40,
    inclusions: ["Dedicated backcountry guides", "BCA Float avalanche airbag systems", "Breakfast and gourmet après-ski luncheon at the Powderbird Heliport", "Complimentary demo powder skis"],
    vibe: ["heli-luxury", "powder-hunting", "gnarly-steeps"],
    description: "Legendary Utah heli-skiing operation operating directly out of Snowbird and Park City. Offers instant helicopter access to untracked Wasatch powder."
  },
  {
    id: "high-mountain-heli",
    name: "High Mountain Heli-Skiing",
    experienceType: "Heli-Skiing Charter",
    operatorType: "heli",
    region: "Snake River, Wyoming & Palisades Ranges",
    state: "WY",
    country: "USA",
    tenureAcres: 305000,
    tenureDescription: "305,000 acres of dramatic wilderness south of Jackson Hole, spanning the Snake River, Wyoming, Hoback, and Gros Ventre ranges.",
    dailyVertGuarantee: "12,000 – 15,000 vertical ft / day (6 runs standard)",
    aircraftFleet: "Eurocopter AStar B3",
    luxuryLodge: "Amangani (5-Star Luxury Cliffside Resort) & Four Seasons Resort Jackson Hole",
    packageType: "Daily Heli-Skiing & Private Heli Charters",
    annualSnowfall: 458,
    laNinaFactor: 1.15,
    elNinoFactor: 0.90,
    bestMonths: ["January", "February"],
    nearestAirport: "Jackson Hole Airport (JAC)",
    airportDriveMins: 25,
    inclusions: ["Certified professional guides", "Full avalanche rescue gear and airbag pack", "Hearty mountain lunch and beverage service", "Private shuttle from Jackson Hole lodges"],
    vibe: ["heli-luxury", "powder-hunting", "gnarly-steeps"],
    description: "Jackson Hole's premier heli-skiing operator since 1974. Delivers unmatched open bowl and glade skiing across five distinct mountain ranges south of the Tetons."
  },
  {
    id: "steamboat-powdercats",
    name: "Steamboat Powdercats",
    experienceType: "Private Luxury Snowcat Skiing",
    operatorType: "cat",
    region: "Buffalo Pass / Park Range",
    state: "CO",
    country: "USA",
    tenureAcres: 4000,
    tenureDescription: "4,000 acres on legendary Buffalo Pass, which holds the Colorado state record for seasonal snowfall.",
    dailyVertGuarantee: "10,000 – 14,000 vertical ft / day (8–12 untracked runs)",
    aircraftFleet: "Custom Heated Luxury Snowcats with heated boots and sound systems",
    luxuryLodge: "One Steamboat Place VIP Ski-in/Ski-out Chalets & Moving Mountains Private Luxury Residences",
    packageType: "Level 1 to Level 3 Custom Snowcat Tours & Private Cat Buyouts",
    annualSnowfall: 450,
    laNinaFactor: 1.10,
    elNinoFactor: 0.95,
    bestMonths: ["January", "February"],
    nearestAirport: "Yampa Valley (HDN) / Denver (DEN)",
    airportDriveMins: 30,
    inclusions: ["3 guides per cat + dedicated photographer", "Gourmet hot breakfast and catered hot lunch in heated backcountry yurt", "Full demo powder ski & board fleet", "Digital high-res photo package"],
    vibe: ["heli-luxury", "powder-hunting", "friends-vacation"],
    description: "Colorado's premier luxury snowcat operator. Operates in the legendary aspen glades and open bowls of Buffalo Pass with a 3-guide ratio per cat."
  },
  {
    id: "aspen-powder-tours",
    name: "Aspen Mountain Powder Tours",
    experienceType: "Snowcat Skiing & Champagne Fine Dining",
    operatorType: "cat",
    region: "Richmond Ridge / Backside of Aspen Mountain",
    state: "CO",
    country: "USA",
    tenureAcres: 1100,
    tenureDescription: "1,100+ private backcountry acres along Richmond Ridge on the backside of Aspen Mountain.",
    dailyVertGuarantee: "10,000 – 12,000 vertical ft / day (10–12 runs)",
    aircraftFleet: "Custom luxury heated Prinoth snowcats",
    luxuryLodge: "The Little Nell (5-Star / 5-Diamond) & St. Regis Aspen Resort",
    packageType: "Private Cat Charters & VIP Mountain Experience",
    annualSnowfall: 300,
    laNinaFactor: 1.05,
    elNinoFactor: 1.00,
    bestMonths: ["January", "February", "March"],
    nearestAirport: "Aspen/Pitkin County (ASE)",
    airportDriveMins: 10,
    inclusions: ["Two dedicated Aspen Mountain ski guides", "Avalanche beacons and safety briefings", "Three-course gourmet hot lunch served with fine wines in a private heated wood cabin", "Complimentary powder skis"],
    vibe: ["heli-luxury", "party-apres", "friends-vacation"],
    description: "Exclusive snowcat skiing on the backside of Aspen Mountain. Combines untracked Rocky Mountain powder with a multi-course wine-paired cabin lunch."
  }
];
