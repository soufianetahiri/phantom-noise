# Phantom Noise

**Privacy-enhancing decoy traffic generator for Chrome.**

Pollutes your browsing profile with realistic noise — random site visits, natural-sounding searches, and simulated human behavior — making it harder for ISPs, data brokers, surveillance programs, and ad-tech companies to build an accurate picture of who you are and what you care about.

Runs entirely locally. No accounts, no servers, no data sent anywhere.

---

## Features

### Decoy Traffic Engine
- Opens random websites across **12 categories**: news, tech, shopping, health, finance, social media, science, entertainment, sports, travel, food, and lifestyle (150+ real URLs)
- Performs realistic searches on **Google, DuckDuckGo, Bing, and Yahoo** with natural-sounding queries (including occasional typos for authenticity)
- Uses **Poisson-process scheduling** so timing looks human, not robotic — events follow exponential inter-arrival times instead of fixed intervals

### Human Behavior Simulation
Each decoy tab simulates realistic browsing:
- **Smooth scrolling** with eased acceleration curves
- **Mouse movement** along Bézier curves (not straight lines)
- **Hovering** over links, images, and headings with natural pauses
- **Clicking** same-domain links (safely avoids logout/delete/form links)
- **Text selection** to mimic reading behavior
- All timing is randomized per intensity level

### Privacy Mode
- **Incognito windows**: All decoy tabs open in a minimized incognito window so your real browsing profile stays completely clean — no history, cookies, or cache pollution
- **Hidden window fallback**: If incognito isn't available, a minimized regular window is created so tabs never appear in your active browser window
- **Automatic cleanup fallback**: When not in incognito, the extension removes cookies, cache, history, localStorage, and service workers for each visited origin after the tab closes
- **No data exfiltration**: Everything runs locally in your browser. Zero network calls to external servers.

### 4 Intensity Levels

| Level | Rate     | Description                                      |
|-------|----------|--------------------------------------------------|
| Low   | ~18/hr   | Light background noise. Minimal resource usage.   |
| Med   | ~60/hr   | Moderate noise. Good default for daily use.       |
| High  | ~150/hr  | Heavy noise. Noticeably more tabs opening/closing.|
| Max   | ~300/hr  | Maximum noise. Uses more bandwidth and CPU.       |

### Status Tab
- Live session counters: searches performed, pages visited, ad sites hit, active tabs
- All-time statistics persisted across sessions
- Bandwidth sparkline chart (last 60 minutes)
- Session uptime tracker

### Log Tab
- Real-time feed of every action the extension takes
- Each entry shows timestamp, type, URL, and interaction details (scrolls, clicks, hovers)
- Filter by type: Search, Visit, Ad, Action, System
- Export full logs as JSON
- System events (engine start/stop, settings changes) also logged

### Settings Tab
- **Search Engines** — Enable/disable Google, DuckDuckGo, Bing, Yahoo and set their relative frequency weights
- **Task Mix** — Adjust the ratio of searches vs. page visits vs. ad-site visits with sliders
- **Site Categories** — Toggle entire categories on or off (all 12 independently)
- **Active Hours** — Schedule noise generation only during specific hours (e.g., 8:00–22:00)
- **Tab Behavior** — Configure min/max tab lifetime (how long each decoy tab stays open)
- **Privacy Controls** — Toggle incognito mode and post-close cleanup independently
- **Reset** — Reset all-time stats or restore default settings

---

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the `phantom-noise` folder
6. **Important**: Click **Details** on the extension card, then enable **Allow in Incognito** — this lets decoy tabs run in a fully isolated private window

---

## Hardcoded Sources & Websites

All websites visited by the extension are listed below. No other sites are ever contacted. You can enable or disable entire categories from the Settings tab.

### Search Engines

| Engine     | Search URL Pattern |
|------------|-------------------|
| Google     | `google.com/search?q=…` |
| DuckDuckGo | `duckduckgo.com/?q=…` |
| Bing       | `bing.com/search?q=…` |
| Yahoo      | `search.yahoo.com/search?p=…` |

### News & Media (15 sites)
`reuters.com` · `apnews.com` · `bbc.com/news` · `npr.org` · `theguardian.com` · `aljazeera.com` · `france24.com` · `dw.com` · `news.yahoo.com` · `usatoday.com` · `abcnews.go.com` · `cbsnews.com` · `nbcnews.com` · `pbs.org/newshour` · `politico.com`

### Technology (15 sites)
`arstechnica.com` · `theverge.com` · `techcrunch.com` · `wired.com` · `slashdot.org` · `news.ycombinator.com` · `tomshardware.com` · `anandtech.com` · `engadget.com` · `cnet.com` · `zdnet.com` · `techmeme.com` · `stackoverflow.com` · `github.com/trending` · `dev.to`

### Shopping & Retail (15 sites)
`amazon.com` · `ebay.com` · `walmart.com` · `target.com` · `bestbuy.com` · `etsy.com` · `wayfair.com` · `homedepot.com` · `costco.com` · `nordstrom.com` · `zappos.com` · `overstock.com` · `newegg.com` · `ikea.com` · `macys.com`

### Health & Wellness (14 sites)
`webmd.com` · `mayoclinic.org` · `healthline.com` · `nih.gov` · `cdc.gov` · `medicalnewstoday.com` · `everydayhealth.com` · `health.com` · `verywellhealth.com` · `drugs.com` · `clevelandclinic.org` · `medlineplus.gov` · `psychologytoday.com` · `hopkinsmedicine.org`

### Finance & Business (14 sites)
`bloomberg.com` · `cnbc.com` · `finance.yahoo.com` · `marketwatch.com` · `fool.com` · `investopedia.com` · `wsj.com` · `ft.com` · `nerdwallet.com` · `bankrate.com` · `seekingalpha.com` · `barrons.com` · `forbes.com` · `economist.com`

### Social Media (12 sites)
`reddit.com` · `reddit.com/r/popular` · `reddit.com/r/technology` · `reddit.com/r/science` · `reddit.com/r/worldnews` · `reddit.com/r/askscience` · `twitter.com/explore` · `tumblr.com/explore` · `pinterest.com` · `quora.com` · `medium.com` · `linkedin.com/feed`

### Science & Education (14 sites)
`nature.com` · `sciencedaily.com` · `space.com` · `scientificamerican.com` · `phys.org` · `newscientist.com` · `nasa.gov` · `khanacademy.org` · `coursera.org` · `edx.org` · `ocw.mit.edu` · `scholar.google.com` · `arxiv.org` · `britannica.com`

### Entertainment (14 sites)
`imdb.com` · `rottentomatoes.com` · `metacritic.com` · `ign.com` · `gamespot.com` · `polygon.com` · `rollingstone.com` · `pitchfork.com` · `billboard.com` · `vulture.com` · `avclub.com` · `variety.com` · `hollywoodreporter.com` · `ew.com`

### Sports (12 sites)
`espn.com` · `cbssports.com` · `nba.com` · `nfl.com` · `mlb.com` · `nhl.com` · `bbc.com/sport` · `skysports.com` · `bleacherreport.com` · `theathletic.com` · `si.com` · `sbnation.com`

### Travel (12 sites)
`tripadvisor.com` · `lonelyplanet.com` · `booking.com` · `expedia.com` · `kayak.com` · `airbnb.com` · `hotels.com` · `skyscanner.com` · `google.com/travel` · `frommers.com` · `cntraveler.com` · `travelzoo.com`

### Food & Cooking (12 sites)
`allrecipes.com` · `foodnetwork.com` · `epicurious.com` · `bonappetit.com` · `seriouseats.com` · `simplyrecipes.com` · `food.com` · `delish.com` · `eater.com` · `tastingtable.com` · `kingarthurbaking.com` · `cooking.nytimes.com`

### Lifestyle & Home (11 sites)
`architecturaldigest.com` · `apartmenttherapy.com` · `bhg.com` · `hgtv.com` · `dwell.com` · `thespruce.com` · `familyhandyman.com` · `realsimple.com` · `marthastewart.com` · `gardeningknowhow.com` · `thisoldhouse.com`

### Ad / Shopping Sites (additional, 6 sites)
These are extra sites visited specifically during "ad site" tasks, in addition to the Shopping & Retail category above:
`groupon.com` · `wish.com` · `alibaba.com` · `aliexpress.com` · `rakuten.com` · `slickdeals.net`

**Total: ~156 unique websites across 12 categories + 4 search engines**

---

## Search Query Templates

The extension generates realistic search queries by filling templates with random terms. Here are the template categories and example filler words:

### Query Templates (by category)
- **News**: `"latest {topic} news today"` · `"what happened with {topic}"` · `"{topic} update 2026"`
- **Tech**: `"best {item} 2026"` · `"{item} review"` · `"{item} vs {item2}"` · `"how to {action} {item}"`
- **Shopping**: `"buy {item} online"` · `"best deals on {item}"` · `"{item} discount code"`
- **Health**: `"symptoms of {condition}"` · `"how to treat {condition}"` · `"benefits of {activity}"`
- **Finance**: `"{stock} stock price today"` · `"best {type} investments 2026"` · `"mortgage rates today"`
- **Science**: `"how does {concept} work"` · `"latest discoveries in {field}"`
- **Entertainment**: `"{show} season {n} release date"` · `"best {genre} movies 2026"`
- **Travel**: `"flights to {city}"` · `"best hotels in {city}"` · `"things to do in {city}"`
- **General**: `"how to {skill}"` · `"best way to {task}"` · `"DIY {project}"`

### Filler Word Lists
- **Topics** (20): climate change, artificial intelligence, space exploration, renewable energy, election results, cryptocurrency regulation, housing market, supply chain, immigration policy, cybersecurity threats, autonomous vehicles, gene therapy, quantum computing, ocean conservation, labor market, trade agreements, public health, education reform, infrastructure bill, data privacy
- **Items** (24): laptop, smartphone, headphones, monitor, keyboard, webcam, tablet, smartwatch, router, SSD, graphics card, wireless earbuds, standing desk, ergonomic chair, air purifier, robot vacuum, espresso machine, blender, running shoes, winter jacket, backpack, sunglasses, mattress, bookshelf
- **Conditions** (10): headache, back pain, insomnia, allergies, fatigue, stress, joint pain, dry skin, high blood pressure, vitamin deficiency
- **Foods** (12): avocado, quinoa, dark chocolate, green tea, oatmeal, salmon, blueberries, kale, turmeric, almonds, yogurt, olive oil
- **Activities** (10): meditation, yoga, walking, swimming, cycling, stretching, hiking, weight training, running, dancing
- **Supplements** (10): vitamin D, omega 3, magnesium, probiotics, zinc, B12, iron, collagen, melatonin, creatine
- **Stocks** (8): AAPL, GOOGL, MSFT, AMZN, TSLA, NVDA, META, NFLX
- **Companies** (7): Apple, Google, Amazon, Microsoft, Tesla, Netflix, Meta
- **Concepts** (8): blockchain, CRISPR, nuclear fusion, dark matter, mRNA vaccines, machine learning, photosynthesis, plate tectonics
- **Shows** (10): The Last of Us, Severance, Andor, House of the Dragon, Fallout, Shogun, The Bear, Slow Horses, Reacher, Silo
- **Games** (5): Elden Ring, Baldur's Gate 3, Zelda, Starfield, GTA VI
- **Cities** (14): Tokyo, Paris, London, New York, Barcelona, Rome, Sydney, Bangkok, Istanbul, Dubai, Lisbon, Prague, Kyoto, Marrakech
- **Skills** (7): cook, code, draw, invest, negotiate, meditate, garden

---

## File Structure

```
phantom-noise/
├── manifest.json      # Chrome extension manifest (Manifest V3)
├── background.js      # Service worker: scheduler, tab manager, query generator, stats
├── content.js         # Content script: human behavior simulation
├── popup.html         # Popup UI layout (3 tabs: Status, Log, Settings)
├── popup.css          # Dark theme styles
├── popup.js           # Popup controller: charts, live log, settings sync
├── icons/
│   ├── icon16.png     # Toolbar icon
│   ├── icon48.png     # Extensions page icon
│   └── icon128.png    # Chrome Web Store icon
└── README.md          # This file
```

## How It Works

1. **Poisson scheduling**: Instead of fixed intervals, the engine draws random wait times from an exponential distribution. At "Medium" intensity (λ=60/hr), the average gap between events is 1 minute, but individual gaps vary naturally — some back-to-back, some several minutes apart. This is mathematically identical to how real human browsing sessions are distributed.

2. **Query generation**: Search queries are built from templates with placeholder slots (`"best {item} 2026"`, `"symptoms of {condition}"`) filled from curated word lists. The system occasionally prepends modifiers (`"how to"`, `"should I"`) and introduces typos (5% chance of a deleted character) to increase realism.

3. **Weighted selection**: Search engines and task types use weighted random selection, so you can bias toward DuckDuckGo over Google, or favor page visits over searches, while still maintaining randomness.

4. **Tab lifecycle**: Each tab opens in a hidden minimized window (incognito if available, regular otherwise). The page loads, the behavior simulation script runs, then the tab closes after a random lifetime (configurable, default 8–45 seconds). If incognito mode is active, isolation is automatic. If not, browsing data for that origin is purged after close.

5. **Behavior simulation**: The content script runs a shuffled sequence of scroll/hover/click/select actions. Mouse movements follow quadratic Bézier curves. Scrolling uses easeInOut timing. All durations and pauses are randomized within intensity-dependent ranges.

## Permissions Explained

| Permission        | Why                                                       |
|-------------------|-----------------------------------------------------------|
| `tabs`            | Open and close decoy tabs                                 |
| `storage`         | Persist settings and all-time stats                       |
| `browsingData`    | Clean up cookies/cache/history after tab close            |
| `webNavigation`   | Track page load completion                                |
| `scripting`       | Inject behavior simulation into decoy pages               |
| `<all_urls>`      | Visit any website as a decoy target                       |
| `incognito: spanning` | Open tabs in incognito windows                       |

## Privacy & Safety

- **No data leaves your machine.** There are no analytics, no telemetry, no external API calls.
- **Safe clicking**: The content script only clicks links on the same domain and explicitly avoids logout, delete, unsubscribe, mailto, tel, and form-related links.
- **No form interaction**: The extension never fills in forms, enters text, or submits anything.
- **Incognito isolation**: When enabled, all decoy traffic is fully isolated from your real browsing session.
- **Hidden window mode**: Even without incognito, tabs open in a minimized window so they never appear in your active browser.

## License

MIT
