let meals = [];
let budget = 0;
let activeFilter = 'all';

const CAT_ICONS = {
  Breakfast: '☀',
  Lunch:     '◈',
  Dinner:    '◐',
  Snack:     '✦',
};

function formatPHP(amount) {
  return '₱' + Number(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function timeLabel() {
  const now = new Date();
  return now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
}

function storageKey(type) {
  const session = getSession();
  const user = session ? session.username.toLowerCase() : 'guest';
  return `kanin_${type}_${user}`;
}

function saveToLocalStorage() {
  localStorage.setItem(storageKey('meals'),  JSON.stringify(meals));
  localStorage.setItem(storageKey('budget'), JSON.stringify(budget));
}

function loadFromLocalStorage() {
  const savedMeals  = localStorage.getItem(storageKey('meals'));
  const savedBudget = localStorage.getItem(storageKey('budget'));
  meals  = savedMeals  ? JSON.parse(savedMeals)  : [];
  budget = savedBudget ? JSON.parse(savedBudget) : 0;
}

function calculateTotal() {
  return meals.reduce((sum, m) => sum + m.cost, 0);
}

function addMeal() {
  const nameEl = document.getElementById('mealName');
  const costEl = document.getElementById('mealCost');
  const catEl  = document.getElementById('mealCategory');

  const name = nameEl.value.trim();
  const cost = parseFloat(costEl.value);
  const category = catEl.value;

  if (!name) {
    shake(nameEl);
    return;
  }
  if (isNaN(cost) || cost <= 0) {
    shake(costEl);
    return;
  }

  const meal = {
    id:       Date.now(),
    name,
    cost,
    category,
    time:     timeLabel(),
  };

  meals.unshift(meal);
  saveToLocalStorage();
  updateUI();

  nameEl.value = '';
  costEl.value = '';
  nameEl.focus();
}

function deleteMeal(id) {
  meals = meals.filter(m => m.id !== id);
  saveToLocalStorage();
  updateUI();
}

function shake(el) {
  el.style.transition = 'transform 0.07s ease';
  const steps = [6, -6, 5, -5, 3, -3, 0];
  let i = 0;
  const run = () => {
    if (i < steps.length) {
      el.style.transform = `translateX(${steps[i]}px)`;
      i++;
      setTimeout(run, 50);
    } else {
      el.style.transform = '';
      el.focus();
    }
  };
  run();
  el.style.borderColor = 'rgba(224,112,112,0.5)';
  setTimeout(() => { el.style.borderColor = ''; }, 800);
}

function updateRing(pct) {
  const ring = document.getElementById('budgetRing');
  const circumference = 314;
  const clampedPct = Math.min(pct, 100);
  const offset = circumference - (clampedPct / 100) * circumference;
  ring.style.strokeDashoffset = offset;

  if (pct <= 60) {
    ring.style.stroke = '#4a9e6e';
    ring.style.filter = 'drop-shadow(0 0 5px rgba(74,158,110,0.35))';
  } else if (pct <= 85) {
    ring.style.stroke = '#c28a2a';
    ring.style.filter = 'drop-shadow(0 0 5px rgba(194,138,42,0.35))';
  } else {
    ring.style.stroke = '#b85555';
    ring.style.filter = 'drop-shadow(0 0 5px rgba(184,85,85,0.4))';
  }
}

function updateVelocity(total) {
  const el = document.getElementById('velocityText');
  if (meals.length === 0) {
    el.textContent = 'No meals yet';
    return;
  }
  const avg = total / meals.length;
  el.textContent = `${formatPHP(total)} spent · ${formatPHP(avg)}/meal avg`;
}

function renderMeals(filter = 'all', query = '') {
  const list = document.getElementById('mealList');
  const emptyState = document.getElementById('emptyState');
  const countEl = document.getElementById('mealCount');
  const titleEl = document.getElementById('listTitle');

  let filtered = meals;

  if (filter !== 'all') {
    filtered = filtered.filter(m => m.category === filter);
  }

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(m => m.name.toLowerCase().includes(q));
  }

  Array.from(list.querySelectorAll('.meal-card')).forEach(el => el.remove());

  countEl.textContent = filtered.length === 1 ? '1 meal' : `${filtered.length} meals`;
  titleEl.textContent = filter === 'all' ? 'All Meals' : filter;

  if (filtered.length === 0) {
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
    filtered.forEach((meal, i) => {
      const card = buildMealCard(meal, i);
      list.appendChild(card);
    });
  }
}

function buildMealCard(meal, index) {
  const card = document.createElement('div');
  card.className = 'meal-card';
  card.style.animationDelay = `${index * 55}ms`;

  const icon = CAT_ICONS[meal.category] || '•';

  card.innerHTML = `
    <div class="cat-dot ${meal.category}">${icon}</div>
    <div class="meal-info">
      <div class="meal-name">${escapeHTML(meal.name)}</div>
      <div class="meal-meta">
        <span class="meal-cat-badge ${meal.category}">${meal.category}</span>
        <span class="meal-time">${meal.time}</span>
      </div>
    </div>
    <div class="meal-cost">${formatPHP(meal.cost)}</div>
    <button class="btn-delete" title="Remove meal" aria-label="Delete ${escapeHTML(meal.name)}">✕</button>
  `;

  card.querySelector('.btn-delete').addEventListener('click', () => {
    card.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
    card.style.opacity = '0';
    card.style.transform = 'translateX(18px)';
    setTimeout(() => deleteMeal(meal.id), 220);
  });

  return card;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function updateUI() {
  const total     = calculateTotal();
  const remaining = budget - total;
  const pct       = budget > 0 ? (total / budget) * 100 : 0;

  document.getElementById('displayBudget').textContent = formatPHP(budget);
  document.getElementById('displaySpent').textContent  = formatPHP(total);
  document.getElementById('displayLeft').textContent   = formatPHP(remaining);
  document.getElementById('ringPct').textContent       = Math.round(pct) + '%';

  updateRing(pct);

  updateVelocity(total);

  const leftEl = document.getElementById('displayLeft');
  leftEl.className = 'fig-val ' + (remaining < 0 ? 'accent-red' : 'accent-green');

  const banner = document.getElementById('overBudgetBanner');
  if (budget > 0 && total > budget) {
    banner.classList.add('visible');
  } else {
    banner.classList.remove('visible');
  }

  const query = document.getElementById('searchInput').value.trim();
  renderMeals(activeFilter, query);
}

function setDateLabel() {
  const el = document.getElementById('sidebarDate');
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-PH', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

function initBudgetInput() {
  const input = document.getElementById('budgetInput');
  const btn   = document.getElementById('setBudgetBtn');

  if (budget > 0) input.value = budget;

  const applyBudget = () => {
    const val = parseFloat(input.value);
    if (!isNaN(val) && val >= 0) {
      budget = val;
      saveToLocalStorage();
      updateUI();
    } else {
      shake(input);
    }
  };

  btn.addEventListener('click', applyBudget);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') applyBudget(); });
}

function initFilterPills() {
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.dataset.cat;
      updateUI();
    });
  });
}

function initSearch() {
  document.getElementById('searchInput').addEventListener('input', () => {
    updateUI();
  });
}

function initAddMeal() {
  document.getElementById('addMealBtn').addEventListener('click', addMeal);

  ['mealName', 'mealCost'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') addMeal();
    });
  });
}

function init() {

  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  const greet = document.getElementById('pageSubGreet');
  if (greet) greet.textContent = `Hello, ${session.name}! Track every peso you spend on food.`;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearSession();
      window.location.href = 'login.html';
    });
  }

  loadFromLocalStorage();
  setDateLabel();
  initBudgetInput();
  initFilterPills();
  initSearch();
  initAddMeal();
  updateUI();
}

document.addEventListener('DOMContentLoaded', init);