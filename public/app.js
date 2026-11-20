'use strict';

// ============================================================
// SCARLET - LOCAL GAME LIBRARY
// Fih! + Core Ball + Drift Hunters ONLY
// ============================================================

let games = [];
let currentSearch = '';
let selectedCategory = 'All';

const fallbackGames = [
  {
    id: 'fih',
    name: 'Fih!',
    desc: 'A customizable image spinner. Upload your own PNG and change its size, speed, axis, colors, and direction.',
    href: 'FIH/FIH.html',
    category: 'Tools',
    tags: [],
    enabled: true
  },
  {
    id: 'core-ball',
    name: 'Core Ball',
    desc: 'A timing game where you launch pins into the rotating core. Your progress is saved in this browser.',
    href: 'coreball/index.html',
    category: 'Arcade',
    tags: [],
    enabled: true
  },
  {
    id: 'drift-hunters',
    name: 'Drift Hunters',
    desc: 'High-speed drifting game. Tune your car and rack up points with long drifts.',
    href: 'https://cdn.jsdelivr.net/gh/GoatTech-42/NEBULACDN@main/games/drift-hunters.html',
    category: 'Racing',
    tags: [],
    enabled: true
  }
];

// ============================================================
// ELEMENTS
// ============================================================

const grid = document.getElementById('gameGrid');
const gamesPanel = document.getElementById('games');

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

const searchForm = document.getElementById('searchForm');
const homeSearchInput = document.getElementById('searchInput');
const searchMsg = document.getElementById('searchMsg');

const tabGifToast = document.getElementById('tabGifToast');
const tabGifImage = document.getElementById('tabGifImage');

// ============================================================
// CREATE GAMES SEARCH BAR
// ============================================================

let libraryControls = null;
let librarySearch = null;
let categoryFilter = null;
let resultCount = null;

if (gamesPanel && grid) {
  libraryControls = document.createElement('div');
  libraryControls.className = 'game-library-controls';
  libraryControls.id = 'gameLibraryControls';

  librarySearch = document.createElement('input');
  librarySearch.id = 'gameLibrarySearch';
  librarySearch.type = 'search';
  librarySearch.placeholder = 'Search games...';
  librarySearch.autocomplete = 'off';
  librarySearch.setAttribute('aria-label', 'Search games');

  categoryFilter = document.createElement('select');
  categoryFilter.id = 'gameCategoryFilter';
  categoryFilter.setAttribute('aria-label', 'Filter by category');

  resultCount = document.createElement('div');
  resultCount.id = 'gameResultCount';

  libraryControls.append(
    librarySearch,
    categoryFilter,
    resultCount
  );

  const heading = gamesPanel.querySelector('.section-title');

  if (heading) {
    heading.insertAdjacentElement('afterend', libraryControls);
  } else {
    gamesPanel.insertBefore(libraryControls, grid);
  }
}

// ============================================================
// GAME URL HANDLING
// ============================================================

function getGameUrl(game) {
  let href = game.href || '#';

  if (game.id === 'core-ball') {
    href = 'coreball/index.html';
  }

  if (game.id === 'drift-hunters') {
    href = 'https://cdn.jsdelivr.net/gh/GoatTech-42/NEBULACDN@main/games/drift-hunters.html';
  }

  if (game.id === 'fih') {
    href = 'FIH/FIH.html';
  }

  try {
    const url = new URL(href, window.location.href);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return '#';
    }
    return url.href;
  } catch (error) {
    console.error('[Scarlet] Invalid game URL:', href, error);
    return '#';
  }
}

// ============================================================
// LOAD GAMES (no API)
// ============================================================

function loadGames() {
  if (grid) {
    grid.innerHTML = '<p>Loading Scarlet Game Library...</p>';
  }

  games = fallbackGames.map(g => ({ ...g }));

  buildCategoryOptions();
  renderGames();

  console.log(`[Scarlet] Final game count: ${games.length}`);
}

// ============================================================
// CATEGORY OPTIONS
// ============================================================

function buildCategoryOptions() {
  if (!categoryFilter) return;

  const categories = [...new Set(
    games.map(game => game.category || 'Other')
  )].sort((a, b) => a.localeCompare(b));

  categoryFilter.replaceChildren();

  const allOption = document.createElement('option');
  allOption.value = 'All';
  allOption.textContent = 'All Categories';
  categoryFilter.appendChild(allOption);

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  selectedCategory = 'All';
  categoryFilter.value = 'All';
}

// ============================================================
// FILTER GAMES
// ============================================================

function getFilteredGames() {
  const query = currentSearch.toLowerCase();

  return games.filter(game => {
    const matchesCategory =
      selectedCategory === 'All' ||
      game.category === selectedCategory;

    const searchableText = [
      game.name,
      game.desc,
      game.category,
      ...(game.tags || [])
    ].join(' ').toLowerCase();

    const matchesSearch = !query || searchableText.includes(query);

    return matchesCategory && matchesSearch;
  });
}

// ============================================================
// RENDER GAME CARDS
// ============================================================

function renderGames() {
  if (!grid) return;

  const filteredGames = getFilteredGames();
  grid.replaceChildren();

  if (resultCount) {
    resultCount.textContent =
      `${filteredGames.length} of ${games.length} games`;
  }

  if (!filteredGames.length) {
    const empty = document.createElement('p');
    empty.className = 'game-library-empty';
    empty.textContent = 'No games match your search.';
    grid.appendChild(empty);
    return;
  }

  filteredGames.forEach(game => {
    const card = document.createElement('a');
    card.className = 'game-card';
    card.href = getGameUrl(game);

    card.setAttribute('aria-label', `Open ${game.name}`);

    const title = document.createElement('h3');
    title.textContent = game.name;

    const description = document.createElement('p');
    description.textContent = game.desc;

    const category = document.createElement('small');
    category.className = 'game-category';
    category.textContent = game.category || 'Other';

    card.append(title, description, category);
    grid.appendChild(card);
  });
}

// ============================================================
// GAMES SEARCH
// ============================================================

if (librarySearch) {
  librarySearch.addEventListener('input', () => {
    currentSearch = librarySearch.value.trim();
    renderGames();
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener('change', () => {
    selectedCategory = categoryFilter.value;
    renderGames();
  });
}

// ============================================================
// HOME SEARCH
// ============================================================

if (searchForm && homeSearchInput) {
  searchForm.addEventListener('submit', event => {
    event.preventDefault();

    const query = homeSearchInput.value.trim();

    if (!query) {
      if (searchMsg) searchMsg.textContent = 'Type something to search.';
      return;
    }

    currentSearch = query;
    if (librarySearch) librarySearch.value = query;
    if (categoryFilter) {
      selectedCategory = 'All';
      categoryFilter.value = 'All';
    }

    renderGames();
    showPanel('games');

    if (searchMsg) {
      const count = getFilteredGames().length;
      searchMsg.textContent = `Found ${count} game(s) for "${query}".`;
    }
  });
}

// ============================================================
// TAB SWITCHING
// ============================================================

function showPanel(id) {
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === id);
  });

  panels.forEach(panel => {
    panel.classList.toggle('active', panel.id === id);
  });

  const selectedPanel = document.getElementById(id);
  if (selectedPanel) selectedPanel.scrollTop = 0;
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    showPanel(tab.dataset.tab);
    showRandomTabGif();
  });
});

// ============================================================
// RANDOM TAB GIF (full screen)
// ============================================================

const tabReactionGifs = [
  'https://media1.tenor.com/m/wbxOO4TUvpcAAAAC/cat-ruffles.gif',
  'https://media1.tenor.com/m/_Ye83OyOTUcAAAAC/hamster-meme.gif',
  'https://media.tenor.com/x8v1oNUOmg4AAAAC/loading-cat.gif',
  'https://media.tenor.com/GTC0vEvzYN0AAAAC/cat-loading.gif',
  'https://cdn.ccdiscussion.com/original/4X/6/5/5/655db820cf7aa84c473ddbf979d84d2be55856ab.gif'
];

let lastTabGifIndex = -1;
let gifHideTimer = null;

function showRandomTabGif() {
  if (!tabGifToast || !tabGifImage) return;

  let nextIndex = Math.floor(Math.random() * tabReactionGifs.length);
  while (tabReactionGifs.length > 1 && nextIndex === lastTabGifIndex) {
    nextIndex = Math.floor(Math.random() * tabReactionGifs.length);
  }

  lastTabGifIndex = nextIndex;
  tabGifImage.src = tabReactionGifs[nextIndex];
  tabGifToast.classList.add('visible');

  clearTimeout(gifHideTimer);
  gifHideTimer = setTimeout(() => {
    tabGifToast.classList.remove('visible');
  }, 2400);
}

if (tabGifToast) {
  tabGifToast.addEventListener('click', () => {
    clearTimeout(gifHideTimer);
    tabGifToast.classList.remove('visible');
  });
}

// ============================================================
// BACKGROUND PARALLAX
// ============================================================

const bgWrap = document.querySelector('.bg-wrap');
const maxShift = 30;

if (bgWrap) {
  document.addEventListener('mousemove', event => {
    const x = (event.clientX / window.innerWidth - 0.5) * -2;
    const y = (event.clientY / window.innerHeight - 0.5) * -2;
    bgWrap.style.transform =
      `translate(${x * maxShift}px, ${y * maxShift}px) scale(1.02)`;
  });
}

// ============================================================
// START
// ============================================================

loadGames();