// ============================================================================
// Phantom Noise — Background Service Worker
// Privacy-enhancing decoy traffic generator
// ============================================================================

// ─── Intensity Profiles ─────────────────────────────────────────────────────
const INTENSITY = {
  low:  { rate: 18,  label: 'Low',    desc: 'Light background noise (~18/hr)' },
  med:  { rate: 60,  label: 'Medium', desc: 'Moderate noise (~60/hr)' },
  high: { rate: 150, label: 'High',   desc: 'Heavy noise (~150/hr)' },
  max:  { rate: 300, label: 'Max',    desc: 'Maximum noise (~300/hr)' }
};

// ─── Site Categories ────────────────────────────────────────────────────────
const SITE_CATEGORIES = {
  news: {
    label: 'News & Media',
    sites: [
      'https://www.reuters.com', 'https://apnews.com', 'https://www.bbc.com/news',
      'https://www.npr.org', 'https://www.theguardian.com', 'https://www.aljazeera.com',
      'https://www.france24.com', 'https://www.dw.com', 'https://news.yahoo.com',
      'https://www.usatoday.com', 'https://abcnews.go.com', 'https://www.cbsnews.com',
      'https://www.nbcnews.com', 'https://www.pbs.org/newshour', 'https://www.politico.com'
    ]
  },
  tech: {
    label: 'Technology',
    sites: [
      'https://arstechnica.com', 'https://www.theverge.com', 'https://techcrunch.com',
      'https://www.wired.com', 'https://slashdot.org', 'https://news.ycombinator.com',
      'https://www.tomshardware.com', 'https://www.anandtech.com', 'https://www.engadget.com',
      'https://www.cnet.com', 'https://www.zdnet.com', 'https://www.techmeme.com',
      'https://stackoverflow.com', 'https://github.com/trending', 'https://dev.to'
    ]
  },
  shopping: {
    label: 'Shopping & Retail',
    sites: [
      'https://www.amazon.com', 'https://www.ebay.com', 'https://www.walmart.com',
      'https://www.target.com', 'https://www.bestbuy.com', 'https://www.etsy.com',
      'https://www.wayfair.com', 'https://www.homedepot.com', 'https://www.costco.com',
      'https://www.nordstrom.com', 'https://www.zappos.com', 'https://www.overstock.com',
      'https://www.newegg.com', 'https://www.ikea.com', 'https://www.macys.com'
    ]
  },
  health: {
    label: 'Health & Wellness',
    sites: [
      'https://www.webmd.com', 'https://www.mayoclinic.org', 'https://www.healthline.com',
      'https://www.nih.gov', 'https://www.cdc.gov', 'https://www.medicalnewstoday.com',
      'https://www.everydayhealth.com', 'https://www.health.com', 'https://www.verywellhealth.com',
      'https://www.drugs.com', 'https://www.clevelandclinic.org', 'https://medlineplus.gov',
      'https://www.psychologytoday.com', 'https://www.hopkinsmedicine.org'
    ]
  },
  finance: {
    label: 'Finance & Business',
    sites: [
      'https://www.bloomberg.com', 'https://www.cnbc.com', 'https://finance.yahoo.com',
      'https://www.marketwatch.com', 'https://www.fool.com', 'https://www.investopedia.com',
      'https://www.wsj.com', 'https://www.ft.com', 'https://www.nerdwallet.com',
      'https://www.bankrate.com', 'https://seekingalpha.com', 'https://www.barrons.com',
      'https://www.forbes.com', 'https://www.economist.com'
    ]
  },
  social: {
    label: 'Social Media',
    sites: [
      'https://www.reddit.com', 'https://www.reddit.com/r/popular',
      'https://www.reddit.com/r/technology', 'https://www.reddit.com/r/science',
      'https://www.reddit.com/r/worldnews', 'https://www.reddit.com/r/askscience',
      'https://twitter.com/explore', 'https://www.tumblr.com/explore',
      'https://www.pinterest.com', 'https://www.quora.com',
      'https://medium.com', 'https://www.linkedin.com/feed'
    ]
  },
  science: {
    label: 'Science & Education',
    sites: [
      'https://www.nature.com', 'https://www.sciencedaily.com', 'https://www.space.com',
      'https://www.scientificamerican.com', 'https://phys.org', 'https://www.newscientist.com',
      'https://www.nasa.gov', 'https://www.khanacademy.org', 'https://www.coursera.org',
      'https://www.edx.org', 'https://ocw.mit.edu', 'https://scholar.google.com',
      'https://arxiv.org', 'https://www.britannica.com'
    ]
  },
  entertainment: {
    label: 'Entertainment',
    sites: [
      'https://www.imdb.com', 'https://www.rottentomatoes.com', 'https://www.metacritic.com',
      'https://www.ign.com', 'https://www.gamespot.com', 'https://www.polygon.com',
      'https://www.rollingstone.com', 'https://pitchfork.com', 'https://www.billboard.com',
      'https://www.vulture.com', 'https://www.avclub.com', 'https://variety.com',
      'https://www.hollywoodreporter.com', 'https://www.ew.com'
    ]
  },
  sports: {
    label: 'Sports',
    sites: [
      'https://www.espn.com', 'https://www.cbssports.com', 'https://www.nba.com',
      'https://www.nfl.com', 'https://www.mlb.com', 'https://www.nhl.com',
      'https://www.bbc.com/sport', 'https://www.skysports.com', 'https://bleacherreport.com',
      'https://theathletic.com', 'https://www.si.com', 'https://www.sbnation.com'
    ]
  },
  travel: {
    label: 'Travel',
    sites: [
      'https://www.tripadvisor.com', 'https://www.lonelyplanet.com',
      'https://www.booking.com', 'https://www.expedia.com', 'https://www.kayak.com',
      'https://www.airbnb.com', 'https://www.hotels.com', 'https://www.skyscanner.com',
      'https://www.google.com/travel', 'https://www.frommers.com',
      'https://www.cntraveler.com', 'https://www.travelzoo.com'
    ]
  },
  food: {
    label: 'Food & Cooking',
    sites: [
      'https://www.allrecipes.com', 'https://www.foodnetwork.com', 'https://www.epicurious.com',
      'https://www.bonappetit.com', 'https://www.seriouseats.com', 'https://www.simplyrecipes.com',
      'https://www.food.com', 'https://www.delish.com', 'https://www.eater.com',
      'https://www.tastingtable.com', 'https://www.kingarthurbaking.com',
      'https://cooking.nytimes.com'
    ]
  },
  lifestyle: {
    label: 'Lifestyle & Home',
    sites: [
      'https://www.architecturaldigest.com', 'https://www.apartmenttherapy.com',
      'https://www.bhg.com', 'https://www.hgtv.com', 'https://www.dwell.com',
      'https://www.thespruce.com', 'https://www.familyhandyman.com',
      'https://www.realsimple.com', 'https://www.marthastewart.com',
      'https://www.gardeningknowhow.com', 'https://www.thisoldhouse.com'
    ]
  }
};

// ─── Search Engines ─────────────────────────────────────────────────────────
const SEARCH_ENGINES = {
  google:     { label: 'Google',     url: q => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
  duckduckgo: { label: 'DuckDuckGo', url: q => `https://duckduckgo.com/?q=${encodeURIComponent(q)}` },
  bing:       { label: 'Bing',       url: q => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
  yahoo:      { label: 'Yahoo',      url: q => `https://search.yahoo.com/search?p=${encodeURIComponent(q)}` }
};

// ─── Natural Search Queries ─────────────────────────────────────────────────
const QUERY_TEMPLATES = {
  news: [
    'latest {topic} news today', 'what happened with {topic}', '{topic} update 2026',
    '{topic} breaking news', 'analysis of {topic}', '{topic} explained',
    'why is {topic} trending', '{topic} latest developments'
  ],
  tech: [
    'best {item} 2026', '{item} review', '{item} vs {item2}', 'how to {action} {item}',
    '{item} setup guide', '{item} troubleshooting', 'is {item} worth it',
    '{item} alternatives', 'new {item} release date', '{item} comparison chart'
  ],
  shopping: [
    'buy {item} online', 'best deals on {item}', '{item} discount code',
    '{item} price comparison', 'cheapest {item} near me', '{item} sale today',
    '{item} free shipping', 'where to buy {item}', '{item} reviews consumer reports'
  ],
  health: [
    'symptoms of {condition}', 'how to treat {condition}', '{condition} home remedies',
    'is {food} healthy', 'benefits of {activity}', '{condition} causes',
    'best exercises for {goal}', '{supplement} side effects', 'healthy {meal} recipes'
  ],
  finance: [
    '{stock} stock price today', 'best {type} investments 2026', 'how to save money on {expense}',
    '{crypto} price prediction', 'mortgage rates today', 'best savings accounts',
    '{company} earnings report', 'tax tips for {situation}', 'retirement planning {age}'
  ],
  science: [
    'how does {concept} work', '{topic} research paper', 'latest discoveries in {field}',
    '{phenomenon} explained simply', '{scientist} contribution to {field}',
    'is {claim} scientifically proven', '{experiment} results'
  ],
  entertainment: [
    '{show} season {n} release date', 'best {genre} movies 2026', '{game} walkthrough',
    '{artist} new album', '{show} episode recap', 'upcoming {genre} games',
    '{movie} box office', '{show} cast interview'
  ],
  travel: [
    'flights to {city}', 'best hotels in {city}', 'things to do in {city}',
    '{city} travel guide', 'cheap vacation {destination}', '{country} visa requirements',
    'best time to visit {city}', '{city} weather forecast', 'road trip {route}'
  ],
  general: [
    'how to {skill}', 'best way to {task}', 'DIY {project}',
    'tips for {activity}', '{topic} for beginners', 'what is {concept}',
    '{topic} tutorial', 'pros and cons of {thing}'
  ]
};

const QUERY_FILLERS = {
  topic: ['climate change', 'artificial intelligence', 'space exploration', 'renewable energy',
    'election results', 'cryptocurrency regulation', 'housing market', 'supply chain',
    'immigration policy', 'cybersecurity threats', 'autonomous vehicles', 'gene therapy',
    'quantum computing', 'ocean conservation', 'labor market', 'trade agreements',
    'public health', 'education reform', 'infrastructure bill', 'data privacy'],
  item: ['laptop', 'smartphone', 'headphones', 'monitor', 'keyboard', 'webcam', 'tablet',
    'smartwatch', 'router', 'SSD', 'graphics card', 'wireless earbuds', 'standing desk',
    'ergonomic chair', 'air purifier', 'robot vacuum', 'espresso machine', 'blender',
    'running shoes', 'winter jacket', 'backpack', 'sunglasses', 'mattress', 'bookshelf'],
  item2: ['alternative', 'competitor', 'upgrade', 'replacement', 'budget option'],
  action: ['set up', 'configure', 'optimize', 'install', 'fix', 'upgrade', 'customize',
    'troubleshoot', 'reset', 'calibrate', 'clean', 'maintain'],
  condition: ['headache', 'back pain', 'insomnia', 'allergies', 'fatigue', 'stress',
    'joint pain', 'dry skin', 'high blood pressure', 'vitamin deficiency'],
  food: ['avocado', 'quinoa', 'dark chocolate', 'green tea', 'oatmeal', 'salmon',
    'blueberries', 'kale', 'turmeric', 'almonds', 'yogurt', 'olive oil'],
  activity: ['meditation', 'yoga', 'walking', 'swimming', 'cycling', 'stretching',
    'hiking', 'weight training', 'running', 'dancing'],
  goal: ['weight loss', 'muscle building', 'flexibility', 'endurance', 'back pain relief',
    'better sleep', 'stress relief', 'posture improvement'],
  supplement: ['vitamin D', 'omega 3', 'magnesium', 'probiotics', 'zinc', 'B12',
    'iron', 'collagen', 'melatonin', 'creatine'],
  meal: ['breakfast', 'lunch', 'dinner', 'snack', 'smoothie', 'salad'],
  stock: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'],
  type: ['ETF', 'index fund', 'bond', 'dividend', 'growth stock', 'real estate'],
  expense: ['groceries', 'electricity', 'gas', 'insurance', 'internet', 'rent'],
  crypto: ['Bitcoin', 'Ethereum', 'Solana', 'Cardano'],
  company: ['Apple', 'Google', 'Amazon', 'Microsoft', 'Tesla', 'Netflix', 'Meta'],
  situation: ['freelancers', 'remote workers', 'homeowners', 'students', 'small business'],
  age: ['in your 30s', 'in your 40s', 'in your 50s', 'early'],
  concept: ['blockchain', 'CRISPR', 'nuclear fusion', 'dark matter', 'mRNA vaccines',
    'machine learning', 'photosynthesis', 'plate tectonics'],
  field: ['physics', 'biology', 'astronomy', 'neuroscience', 'genetics', 'chemistry'],
  phenomenon: ['aurora borealis', 'black holes', 'gravitational waves', 'evolution'],
  scientist: ['Einstein', 'Curie', 'Hawking', 'Darwin', 'Tesla', 'Feynman'],
  claim: ['intermittent fasting', 'cold showers', 'grounding', 'blue light blocking'],
  experiment: ['CERN', 'James Webb', 'ITER fusion', 'Mars rover'],
  show: ['The Last of Us', 'Severance', 'Andor', 'House of the Dragon', 'Fallout',
    'Shogun', 'The Bear', 'Slow Horses', 'Reacher', 'Silo'],
  genre: ['sci-fi', 'thriller', 'comedy', 'horror', 'drama', 'action', 'RPG', 'indie'],
  game: ['Elden Ring', "Baldur's Gate 3", 'Zelda', 'Starfield', 'GTA VI'],
  artist: ['Beyonce', 'Taylor Swift', 'Kendrick Lamar', 'Billie Eilish', 'Bad Bunny'],
  movie: ['Dune', 'Oppenheimer', 'Barbie', 'Spider-Verse', 'Inside Out 2'],
  n: ['2', '3', '4', '5'],
  city: ['Tokyo', 'Paris', 'London', 'New York', 'Barcelona', 'Rome', 'Sydney',
    'Bangkok', 'Istanbul', 'Dubai', 'Lisbon', 'Prague', 'Kyoto', 'Marrakech'],
  destination: ['Caribbean', 'Europe', 'Southeast Asia', 'Hawaii', 'Alaska', 'Patagonia'],
  country: ['Japan', 'India', 'Brazil', 'Australia', 'South Korea', 'Morocco'],
  route: ['Pacific Coast Highway', 'Route 66', 'Amalfi Coast', 'Ring Road Iceland'],
  skill: ['cook', 'code', 'draw', 'invest', 'negotiate', 'meditate', 'garden'],
  task: ['organize your closet', 'study for exams', 'meal prep', 'learn a language'],
  project: ['bookshelf', 'raised garden bed', 'home office desk', 'closet organizer'],
  thing: ['working from home', 'electric cars', 'smart home devices', 'meal kits']
};

// ─── State ──────────────────────────────────────────────────────────────────
let state = {
  running: false,
  intensity: 'med',
  incognitoWindowId: null,
  hiddenWindowId: null,
  activeTabs: new Map(),
  maxConcurrentTabs: 3,
  nextTaskTimer: null,
  settings: {
    searchEngines: { google: true, duckduckgo: true, bing: true, yahoo: true },
    engineWeights: { google: 40, duckduckgo: 30, bing: 20, yahoo: 10 },
    taskMix: { search: 40, browse: 45, adsite: 15 },
    categories: Object.fromEntries(Object.keys(SITE_CATEGORIES).map(k => [k, true])),
    schedule: { enabled: false, startHour: 8, endHour: 22 },
    maxTabLifetime: 45,
    minTabLifetime: 8,
    cleanupAfterClose: true,
    useIncognito: true
  },
  stats: {
    session: { searches: 0, visits: 0, adClicks: 0, startedAt: Date.now() },
    allTime: { searches: 0, visits: 0, adClicks: 0, totalBandwidth: 0 },
    bandwidth: { current: 0, history: [] }
  }
};

let logs = [];
const MAX_LOGS = 500;

// ─── Utility Functions ──────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick(options) {
  const entries = Object.entries(options).filter(([, w]) => w > 0);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [key, weight] of entries) {
    r -= weight;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

function poissonInterval(ratePerHour) {
  const ratePerMs = ratePerHour / 3600000;
  return -Math.log(1 - Math.random()) / ratePerMs;
}

function jitter(ms, factor = 0.3) {
  return ms * (1 + (Math.random() - 0.5) * 2 * factor);
}

function generateQuery() {
  const enabledCategories = Object.entries(state.settings.categories)
    .filter(([, v]) => v).map(([k]) => k);
  const category = pick([...enabledCategories, 'general']);
  const templates = QUERY_TEMPLATES[category] || QUERY_TEMPLATES.general;
  let query = pick(templates);

  query = query.replace(/\{(\w+)\}/g, (_, key) => {
    const fillers = QUERY_FILLERS[key];
    return fillers ? pick(fillers) : key;
  });

  if (Math.random() < 0.15) {
    const prefixes = ['how to', 'best way to', 'why does', 'should I', 'what is the best'];
    query = pick(prefixes) + ' ' + query;
  }

  if (Math.random() < 0.05) {
    const i = Math.floor(Math.random() * query.length);
    query = query.slice(0, i) + query.slice(i + 1);
  }

  return query;
}

function getSearchUrl(query) {
  const enabled = Object.entries(state.settings.searchEngines)
    .filter(([, v]) => v).map(([k]) => k);
  if (enabled.length === 0) return SEARCH_ENGINES.duckduckgo.url(query);

  const weights = {};
  enabled.forEach(e => { weights[e] = state.settings.engineWeights[e] || 25; });
  const engine = weightedPick(weights);
  return SEARCH_ENGINES[engine].url(query);
}

function getRandomSiteUrl() {
  const enabledCategories = Object.entries(state.settings.categories)
    .filter(([, v]) => v).map(([k]) => k);
  if (enabledCategories.length === 0) return 'https://en.wikipedia.org/wiki/Special:Random';
  const cat = pick(enabledCategories);
  return pick(SITE_CATEGORIES[cat].sites);
}

function addLog(type, data) {
  const entry = {
    id: Date.now() + Math.random(),
    timestamp: new Date().toISOString(),
    type,
    ...data
  };
  logs.unshift(entry);
  if (logs.length > MAX_LOGS) logs.length = MAX_LOGS;
  chrome.runtime.sendMessage({ action: 'log', entry }).catch(() => {});
}

async function saveState() {
  await chrome.storage.local.set({
    phantomState: {
      intensity: state.intensity,
      running: state.running,
      settings: state.settings,
      stats: state.stats
    }
  });
}

async function loadState() {
  const data = await chrome.storage.local.get('phantomState');
  if (data.phantomState) {
    const s = data.phantomState;
    state.intensity = s.intensity || 'med';
    state.running = false;
    if (s.settings) state.settings = { ...state.settings, ...s.settings };
    if (s.stats) {
      state.stats.allTime = { ...state.stats.allTime, ...s.stats.allTime };
    }
  }
}

// ─── Tab Management ─────────────────────────────────────────────────────────

async function getOrCreateHiddenWindow() {
  // Try incognito first if enabled
  if (state.settings.useIncognito) {
    if (state.incognitoWindowId) {
      try {
        const win = await chrome.windows.get(state.incognitoWindowId);
        if (win) return state.incognitoWindowId;
      } catch {
        state.incognitoWindowId = null;
      }
    }

    try {
      const win = await chrome.windows.create({
        incognito: true,
        focused: false,
        state: 'minimized',
        url: 'about:blank'
      });
      state.incognitoWindowId = win.id;
      addLog('system', { message: 'Opened private browsing window', windowId: win.id });
      return win.id;
    } catch (e) {
      addLog('system', {
        message: 'Incognito unavailable — falling back to hidden minimized window',
        detail: e.message
      });
      state.settings.useIncognito = false;
      state.incognitoWindowId = null;
    }
  }

  // Fallback: use a minimized regular window so tabs don't appear in the user's window
  if (state.hiddenWindowId) {
    try {
      const win = await chrome.windows.get(state.hiddenWindowId);
      if (win) return state.hiddenWindowId;
    } catch {
      state.hiddenWindowId = null;
    }
  }

  try {
    const win = await chrome.windows.create({
      focused: false,
      state: 'minimized',
      url: 'about:blank'
    });
    state.hiddenWindowId = win.id;
    addLog('system', { message: 'Opened hidden minimized window for tabs', windowId: win.id });
    return win.id;
  } catch (e) {
    addLog('error', { message: 'Failed to create hidden window', detail: e.message });
    return null;
  }
}

async function openTab(url, taskType) {
  try {
    const tabOptions = { url, active: false };
    const windowId = await getOrCreateHiddenWindow();
    if (windowId) {
      tabOptions.windowId = windowId;
    } else {
      addLog('error', { message: 'No hidden window available — skipping tab to avoid disturbing user' });
      return null;
    }

    const tab = await chrome.tabs.create(tabOptions);
    state.activeTabs.set(tab.id, {
      url,
      taskType,
      openedAt: Date.now(),
      interactions: []
    });

    const lifetime = state.settings.minTabLifetime +
      Math.random() * (state.settings.maxTabLifetime - state.settings.minTabLifetime);
    setTimeout(() => closeTab(tab.id), lifetime * 1000);
    setTimeout(() => triggerBehavior(tab.id), jitter(2000));

    return tab;
  } catch (e) {
    addLog('error', { message: 'Failed to open tab', url, error: e.message });
    return null;
  }
}

async function closeTab(tabId) {
  const tabInfo = state.activeTabs.get(tabId);
  if (!tabInfo) return;

  try {
    if (state.settings.cleanupAfterClose && !state.settings.useIncognito) {
      try {
        const url = new URL(tabInfo.url);
        await chrome.browsingData.remove(
          { origins: [url.origin] },
          { cache: true, cookies: true, history: true, localStorage: true, serviceWorkers: true }
        );
      } catch (e) { /* cleanup is best-effort */ }
    }
    await chrome.tabs.remove(tabId);
  } catch (e) { /* tab may already be closed */ }

  state.activeTabs.delete(tabId);
}

async function triggerBehavior(tabId) {
  if (!state.activeTabs.has(tabId)) return;
  try {
    await chrome.tabs.sendMessage(tabId, { action: 'simulate', intensity: state.intensity });
  } catch {
    setTimeout(async () => {
      try {
        await chrome.tabs.sendMessage(tabId, { action: 'simulate', intensity: state.intensity });
      } catch { /* give up */ }
    }, 3000);
  }
}

// ─── Task Execution ─────────────────────────────────────────────────────────

async function executeTask() {
  if (!state.running) return;

  if (state.settings.schedule.enabled) {
    const hour = new Date().getHours();
    if (hour < state.settings.schedule.startHour || hour >= state.settings.schedule.endHour) {
      scheduleNext();
      return;
    }
  }

  if (state.activeTabs.size >= state.maxConcurrentTabs) {
    scheduleNext();
    return;
  }

  const taskType = weightedPick(state.settings.taskMix);

  try {
    switch (taskType) {
      case 'search': await doSearch(); break;
      case 'browse': await doBrowse(); break;
      case 'adsite': await doAdSite(); break;
      default: await doBrowse();
    }
  } catch (e) {
    addLog('error', { message: `Task failed: ${e.message}`, taskType });
  }

  scheduleNext();
}

async function doSearch() {
  const query = generateQuery();
  const url = getSearchUrl(query);
  const tab = await openTab(url, 'search');
  if (tab) {
    state.stats.session.searches++;
    state.stats.allTime.searches++;
    addLog('search', { query, url, tabId: tab.id });
    estimateBandwidth(150);
  }
}

async function doBrowse() {
  const url = getRandomSiteUrl();
  const tab = await openTab(url, 'browse');
  if (tab) {
    state.stats.session.visits++;
    state.stats.allTime.visits++;
    addLog('visit', { url, tabId: tab.id });
    estimateBandwidth(500);
  }
}

async function doAdSite() {
  const adSites = [
    ...SITE_CATEGORIES.shopping.sites,
    'https://www.groupon.com', 'https://www.wish.com',
    'https://www.alibaba.com', 'https://www.aliexpress.com',
    'https://www.rakuten.com', 'https://slickdeals.net'
  ];
  const url = pick(adSites);
  const tab = await openTab(url, 'adsite');
  if (tab) {
    state.stats.session.adClicks++;
    state.stats.allTime.adClicks++;
    addLog('adclick', { url, tabId: tab.id });
    estimateBandwidth(800);
  }
}

// ─── Scheduling ─────────────────────────────────────────────────────────────

function scheduleNext() {
  if (!state.running) return;
  const rate = INTENSITY[state.intensity].rate;
  const interval = poissonInterval(rate);
  const clampedInterval = Math.max(1000, Math.min(interval, 600000));

  if (state.nextTaskTimer) clearTimeout(state.nextTaskTimer);
  state.nextTaskTimer = setTimeout(() => executeTask(), clampedInterval);
}

function startEngine() {
  if (state.running) return;
  state.running = true;
  state.stats.session = { searches: 0, visits: 0, adClicks: 0, startedAt: Date.now() };
  addLog('system', { message: `Engine started — intensity: ${state.intensity}` });
  saveState();
  executeTask();
  startBandwidthTracker();
  broadcastState();
}

function stopEngine() {
  state.running = false;
  if (state.nextTaskTimer) {
    clearTimeout(state.nextTaskTimer);
    state.nextTaskTimer = null;
  }
  for (const tabId of state.activeTabs.keys()) {
    closeTab(tabId);
  }
  addLog('system', { message: 'Engine stopped' });
  saveState();
  broadcastState();
}

// ─── Bandwidth Tracking ─────────────────────────────────────────────────────

let bandwidthInterval = null;

function estimateBandwidth(kb) {
  state.stats.bandwidth.current += kb;
  state.stats.allTime.totalBandwidth += kb;
}

function startBandwidthTracker() {
  if (bandwidthInterval) clearInterval(bandwidthInterval);
  bandwidthInterval = setInterval(() => {
    state.stats.bandwidth.history.push(state.stats.bandwidth.current);
    if (state.stats.bandwidth.history.length > 60) {
      state.stats.bandwidth.history.shift();
    }
    state.stats.bandwidth.current = 0;
    saveState();
  }, 60000);
}

// ─── Message Handling ───────────────────────────────────────────────────────

function broadcastState() {
  chrome.runtime.sendMessage({
    action: 'stateUpdate',
    state: {
      running: state.running,
      intensity: state.intensity,
      settings: state.settings,
      stats: state.stats,
      activeTabCount: state.activeTabs.size,
      incognitoWindowId: state.incognitoWindowId,
      hiddenWindowId: state.hiddenWindowId
    }
  }).catch(() => {});
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.action) {
    case 'getState':
      sendResponse({
        running: state.running,
        intensity: state.intensity,
        settings: state.settings,
        stats: state.stats,
        activeTabCount: state.activeTabs.size,
        incognitoWindowId: state.incognitoWindowId,
        hiddenWindowId: state.hiddenWindowId,
        intensityLevels: INTENSITY,
        categories: Object.fromEntries(
          Object.entries(SITE_CATEGORIES).map(([k, v]) => [k, v.label])
        )
      });
      break;
    case 'getLogs':
      sendResponse({ logs: logs.slice(0, msg.limit || 100) });
      break;
    case 'start':
      startEngine();
      sendResponse({ ok: true });
      break;
    case 'stop':
      stopEngine();
      sendResponse({ ok: true });
      break;
    case 'setIntensity':
      state.intensity = msg.value;
      addLog('system', { message: `Intensity changed to ${msg.value}` });
      saveState();
      broadcastState();
      sendResponse({ ok: true });
      break;
    case 'updateSettings':
      state.settings = { ...state.settings, ...msg.settings };
      addLog('system', { message: 'Settings updated' });
      saveState();
      broadcastState();
      sendResponse({ ok: true });
      break;
    case 'clearLogs':
      logs = [];
      sendResponse({ ok: true });
      break;
    case 'exportLogs':
      sendResponse({ logs });
      break;
    case 'interaction':
      if (sender.tab && state.activeTabs.has(sender.tab.id)) {
        const info = state.activeTabs.get(sender.tab.id);
        info.interactions.push(msg.detail);
        addLog('interaction', { tabId: sender.tab.id, url: info.url, detail: msg.detail });
      }
      break;
    default: break;
  }
  return true;
});

// ─── Lifecycle ──────────────────────────────────────────────────────────────

chrome.tabs.onRemoved.addListener((tabId) => {
  if (state.activeTabs.has(tabId)) state.activeTabs.delete(tabId);
});

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === state.incognitoWindowId) {
    state.incognitoWindowId = null;
    for (const [tabId] of state.activeTabs) state.activeTabs.delete(tabId);
  } else if (windowId === state.hiddenWindowId) {
    state.hiddenWindowId = null;
    for (const [tabId] of state.activeTabs) state.activeTabs.delete(tabId);
  }
});

(async () => {
  await loadState();
  addLog('system', { message: 'Phantom Noise initialized' });
  broadcastState();
})();
