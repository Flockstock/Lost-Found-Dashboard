// ===== Lost & Found: shared code for every logged-in page =====
// Loaded after supabaseClient.js. It handles the login check, the sidebar,
// the theme, the user's tasks/profile, and the sky (stars + Sky Collection).

const CATEGORIES = ['Build', 'Learn', 'Career', 'Creative', 'Health'];

// Each sky unlocks after finishing this many tasks (all time). To rename or reorder, edit here.
// "name" is what gets saved on the profile, so keep it stable once people use it.
const SKIES = [
    { name: 'default', label: 'The Beginning',     threshold: 0,  image: 'assets/background/stargazer-scene.png' },
    { name: 'sunset',  label: 'First Milestones',  threshold: 5,  image: 'assets/background/skycollectionone.png' },
    { name: 'night',   label: 'Breakthroughs',     threshold: 15, image: 'assets/background/skycollectiontwo.png' },
    { name: 'blossom', label: 'The Clarity Phase', threshold: 30, image: 'assets/background/skycollectionthree.png' },
    { name: 'autumn',  label: 'Golden Hour',       threshold: 50, image: 'assets/background/skycollectionfour.jpeg' }
];

// Rank follows the same milestones as the skies.
const RANKS = [
    { min: 0,  title: 'Wanderer' },
    { min: 5,  title: 'Explorer' },
    { min: 15, title: 'Navigator' },
    { min: 30, title: 'Cartographer' }
];

const NAV_ITEMS = [
    { page: 'home',        href: 'dashboard.html',   icon: 'house',              label: 'Home' },
    { page: 'missions',    href: 'missions.html',    icon: 'notepad-text',       label: 'Mission Board' },
    { page: 'observatory', href: 'observatory.html', icon: 'astroid',            label: 'Observatory' },
    { page: 'archive',     href: 'archive.html',     icon: 'notepad-text',       label: 'Archive' },
    { page: 'vault',       href: 'vault.html',       icon: 'briefcase-business', label: 'Curiosity Vault' },
    { page: 'radar',       href: 'radar.html',       icon: 'mirror-round',       label: 'Student Radar' },
    { page: 'identity',    href: 'identity.html',    icon: 'file-search-corner', label: 'Identity Map' },
    { page: 'settings',    href: 'settings.html',    icon: 'settings',           label: 'Settings' }
];

// A small hand-picked list (not live data). Edit it to whatever you want to keep an eye on.
const RADAR_ITEMS = [
    { group: 'Tools',      icon: '🎓', text: 'v0: describe a UI, get code',                 url: 'https://v0.dev' },
    { group: 'Tools',      icon: '🎒', text: 'GitHub Student Developer Pack',               url: 'https://education.github.com/pack' },
    { group: 'Hackathons', icon: '🏆', text: 'Devpost: find a hackathon to join',           url: 'https://devpost.com/hackathons' },
    { group: 'Hackathons', icon: '🛰️', text: 'Major League Hacking: student hackathons',    url: 'https://mlh.io' },
    { group: 'Careers',    icon: '💼', text: 'LinkedIn Jobs: filter for internships',       url: 'https://www.linkedin.com/jobs/' },
    { group: 'Careers',    icon: '🌱', text: 'Wellfound: startup internships',              url: 'https://wellfound.com/jobs' },
    { group: 'Learning',   icon: '🧭', text: 'roadmap.sh: step-by-step developer roadmaps', url: 'https://roadmap.sh' },
    { group: 'Learning',   icon: '📚', text: 'freeCodeCamp: free coding courses',           url: 'https://www.freecodecamp.org' }
];

let currentUser = null;
let selectedSky = 'default';
let allTasks = [];
let currentRender = null;

// ===== SMALL HELPERS =====
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
}

function notify(message) {
    const toast = el('div', 'toast', message);
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3500);
}

// A date as 'YYYY-MM-DD' in the user's local time (same shape as the tasks.due_date column).
function dayKey(value) {
    const d = new Date(value);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function keyToDate(key) {
    const parts = key.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
}
function formatLongDate(value) {
    return new Date(value).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function formatKey(key) {
    return keyToDate(key).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
function hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
}

// ===== TODAY vs. EVERYTHING ELSE =====
// A task belongs to today if it is due today, or has no due date and was added today.
function isTodayTask(task) {
    const today = dayKey(new Date());
    return task.due_date ? task.due_date === today : dayKey(task.created_at) === today;
}
// Not finished and meant for an earlier day.
function isCarriedOver(task) {
    if (task.completed) return false;
    const today = dayKey(new Date());
    return task.due_date ? task.due_date < today : dayKey(task.created_at) < today;
}
function isLater(task) {
    return !task.completed && !!task.due_date && task.due_date > dayKey(new Date());
}

function computeStreak(doneDays) {
    const d = new Date();
    if (!doneDays.has(dayKey(d))) d.setDate(d.getDate() - 1); // today isn't over yet
    let count = 0;
    while (doneDays.has(dayKey(d))) {
        count++;
        d.setDate(d.getDate() - 1);
    }
    return count;
}

// Everything the dashboard and other pages show is calculated from the tasks here.
function getStats(tasks) {
    const completed = tasks
        .filter(function (t) { return t.completed && t.completed_at; })
        .sort(function (a, b) { return new Date(b.completed_at) - new Date(a.completed_at); });
    const todayTasks = tasks.filter(isTodayTask);
    const todayDone = todayTasks.filter(function (t) { return t.completed; }).length;
    const doneDays = new Set(completed.map(function (t) { return dayKey(t.completed_at); }));

    const categoryCounts = {};
    CATEGORIES.forEach(function (c) {
        categoryCounts[c] = completed.filter(function (t) { return t.category === c; }).length;
    });

    return {
        completed: completed,
        todayTasks: todayTasks,
        todayDone: todayDone,
        percent: todayTasks.length ? Math.round((todayDone / todayTasks.length) * 100) : 0,
        doneDays: doneDays,
        streak: computeStreak(doneDays),
        categoryCounts: categoryCounts,
        level: 1 + Math.floor(completed.length / 5),
        rank: RANKS.filter(function (r) { return completed.length >= r.min; }).pop().title
    };
}

// The badges on a star's card, worked out from what was finished that day.
function getDayAchievements(stats, key) {
    const dayTasks = stats.completed.filter(function (t) { return dayKey(t.completed_at) === key; });
    let streak = 0;
    const d = keyToDate(key);
    while (stats.doneDays.has(dayKey(d))) {
        streak++;
        d.setDate(d.getDate() - 1);
    }
    return {
        dayTasks: dayTasks,
        badges: [
            { id: 'learning',    icon: '🧠', label: 'Learning',    value: dayTasks.filter(function (t) { return t.category === 'Learn'; }).length * 30, hint: '30 for each Learn task' },
            { id: 'consistency', icon: '🔥', label: 'Consistency', value: streak * 10, hint: '10 for each day in your streak' },
            { id: 'reflection',  icon: '🔍', label: 'Reflection',  value: dayTasks.filter(function (t) { return t.description; }).length * 20, hint: '20 for each task you wrote a note on' },
            { id: 'tasks',       icon: '✅', label: 'Tasks',       value: dayTasks.length * 20, hint: '20 for each task finished' }
        ]
    };
}

// ===== USER DATA =====
function displayName() {
    const meta = currentUser.user_metadata || {};
    return meta.display_name || (currentUser.email || 'Stargazer').split('@')[0];
}

function greeting() {
    const hour = new Date().getHours();
    const part = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
    return 'Good ' + part + ' ' + displayName();
}

async function loadProfile() {
    const { data, error } = await supabaseClient
        .from('profiles')
        .select('selected_sky')
        .eq('user_id', currentUser.id)
        .maybeSingle();

    if (error) { notify('Could not load your profile: ' + error.message); return; }
    if (!data) {
        await supabaseClient.from('profiles').insert({ user_id: currentUser.id, selected_sky: 'default' });
        return;
    }
    selectedSky = data.selected_sky || 'default';
}

async function fetchTasks() {
    const { data, error } = await supabaseClient
        .from('tasks')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

    if (error) { notify('Could not load tasks: ' + error.message); return allTasks; }
    allTasks = data;
    return allTasks;
}

// Reload tasks from Supabase and redraw the current page.
async function refresh() {
    await fetchTasks();
    updateSidebarProfile();
    if (currentRender) currentRender();
}

// ===== SIDEBAR + PAGE CHROME =====
function mountSidebar(activePage) {
    const items = NAV_ITEMS.map(function (item) {
        const current = item.page === activePage;
        return '<li><a href="' + item.href + '"' + (current ? ' class="active" aria-current="page"' : '') + '>' +
            '<img src="assets/icons/' + item.icon + '.svg" class="icons" alt="" onerror="this.remove()"> ' + item.label + '</a></li>';
    }).join('');

    document.querySelector('.sidebar').innerHTML =
        '<button type="button" class="sidebar-close-btn" aria-label="Hide menu">↩</button>' +
        '<h1>✨ Lost &amp; Found</h1>' +
        '<h2>Dashboard</h2>' +
        '<div class="profile">' +
            '<div class="profile-avatar" aria-hidden="true"></div>' +
            '<p class="profile-name"></p>' +
            '<p class="profile-level"></p>' +
        '</div>' +
        '<nav class="sidebar-nav"><ul>' + items + '</ul></nav>' +
        '<button type="button" class="logout-btn">Logout</button>' +
        '<div class="quote-image">' +
            '<p>The stars don\'t rush yet they shine. You don\'t rush yet you\'re becoming.</p>' +
            '<img src="assets/icons/sky-quote.png" alt="" class="sky-image-sidebar" onerror="this.remove()">' +
        '</div>';
}

function updateSidebarProfile() {
    const stats = getStats(allTasks);
    const name = displayName();
    document.querySelector('.profile-avatar').textContent = name.charAt(0).toUpperCase();
    document.querySelector('.profile-name').textContent = name;
    document.querySelector('.profile-level').textContent = 'Level ' + stats.level + ' ' + stats.rank;
}

function applyTheme() {
    document.body.classList.toggle('light-mode', localStorage.getItem('theme') === 'light-mode');
}
function toggleTheme() {
    const light = !document.body.classList.contains('light-mode');
    document.body.classList.toggle('light-mode', light);
    localStorage.setItem('theme', light ? 'light-mode' : 'dark-mode');
}

function wireChrome() {
    const body = document.body;
    document.querySelector('.sidebar-close-btn').addEventListener('click', function () {
        body.classList.add('sidebar-collapsed');
    });
    document.querySelectorAll('.sidebar-open-btn').forEach(function (btn) {
        btn.addEventListener('click', function () { body.classList.remove('sidebar-collapsed'); });
    });
    document.querySelector('.logout-btn').addEventListener('click', async function () {
        await supabaseClient.auth.signOut();
        window.location.replace('index.html');
    });
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
        btn.addEventListener('click', toggleTheme);
    });
    document.querySelectorAll('.date').forEach(function (label) {
        label.textContent = formatLongDate(new Date());
    });
    if (window.matchMedia('(max-width: 820px)').matches) body.classList.add('sidebar-collapsed');
}

// Every logged-in page starts here: check login, load the user's data, draw the page.
async function startPage(activePage, render) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.replace('index.html');
        return;
    }
    currentUser = session.user;
    currentRender = render;

    applyTheme();
    mountSidebar(activePage);
    wireChrome();
    supabaseClient.auth.onAuthStateChange(function (event) {
        if (event === 'SIGNED_OUT') window.location.replace('index.html');
    });

    try {
        await loadProfile();
        await fetchTasks();
        updateSidebarProfile();
        render();
    } catch (err) {
        console.error(err);
        notify('Something went wrong while loading your data.');
    }
    document.body.classList.add('ready');
}

// ===== THE SKY (hero image + stars) — used on Home and Observatory =====
let skyRange = 'month';

function getSky(name) {
    return SKIES.find(function (s) { return s.name === name; }) || SKIES[0];
}

function applySky() {
    const img = document.querySelector('.gallery > img');
    if (!img) return;
    img.onerror = function () { img.classList.add('missing'); };
    img.onload = function () { img.classList.remove('missing'); };
    img.src = getSky(selectedSky).image;
}

async function selectSky(name) {
    const { error } = await supabaseClient
        .from('profiles')
        .update({ selected_sky: name })
        .eq('user_id', currentUser.id);

    if (error) { notify('Could not save your sky: ' + error.message); return false; }
    selectedSky = name;
    applySky();
    return true;
}

// Adds the Day/Week/Month toggle and the star card. Safe to call more than once.
function mountSky() {
    const gallery = document.querySelector('.gallery');
    if (gallery.querySelector('.view-toggle')) return;
    applySky();

    const toggle = el('div', 'view-toggle');
    toggle.appendChild(el('span', 'view-icon', '✨ View by:'));
    [['day', 'Day'], ['week', 'Week'], ['month', 'Month'], ['alltime', 'All Time']].forEach(function (pair) {
        const btn = el('button', 'view-option', pair[1]);
        btn.type = 'button';
        btn.dataset.range = pair[0];
        if (pair[0] === skyRange) btn.classList.add('active');
        btn.addEventListener('click', function () {
            skyRange = pair[0];
            toggle.querySelectorAll('.view-option').forEach(function (o) { o.classList.toggle('active', o === btn); });
            filterStars();
        });
        toggle.appendChild(btn);
    });
    gallery.appendChild(toggle);
    gallery.appendChild(el('p', 'sky-empty hidden'));

    const card = el('aside', 'star-description-chart hidden');
    card.setAttribute('aria-live', 'polite');
    card.innerHTML =
        '<button class="close-btn" type="button" aria-label="Close">↩</button>' +
        '<p>⭐</p>' +
        '<h2 class="star-title"></h2>' +
        '<div class="star-meta"><span class="achievement-tag"></span> <span class="datetime"></span></div>' +
        '<div class="today-quote"></div>' +
        '<section class="to-do-list-check"><h4>What You Did</h4><ul class="star-did"></ul></section>' +
        '<section class="badge-achievement"></section>' +
        '<p class="quote">"Progress is not the destination,<br>it\'s in the direction"</p>';
    document.body.appendChild(card);
    card.querySelector('.close-btn').addEventListener('click', function () { card.classList.add('hidden'); });
}

function renderStars() {
    const gallery = document.querySelector('.gallery');
    gallery.querySelectorAll('.star').forEach(function (s) { s.remove(); });

    getStats(allTasks).completed.forEach(function (task) {
        const h = hashString(String(task.id));
        const star = el('button', 'star');
        star.type = 'button';
        star.style.left = (6 + (h % 88)) + '%';
        star.style.top = (24 + (Math.floor(h / 89) % 42)) + '%';
        star.style.animationDelay = ((h % 30) / 10) + 's';
        star.dataset.completedAt = task.completed_at;
        star.title = task.title;
        star.setAttribute('aria-label', task.title);
        star.addEventListener('click', function () { openStarCard(task); });
        gallery.appendChild(star);
    });
    filterStars();
}

function filterStars() {
    const today = keyToDate(dayKey(new Date()));
    const stars = document.querySelectorAll('.gallery .star');
    let visible = 0;

    stars.forEach(function (star) {
        const daysAgo = Math.round((today - keyToDate(dayKey(star.dataset.completedAt))) / 86400000);
        let show = true;
        if (skyRange === 'day') show = daysAgo < 1;
        if (skyRange === 'week') show = daysAgo < 7;
        if (skyRange === 'month') show = daysAgo < 30;
        star.classList.toggle('hidden', !show);
        if (show) visible++;
    });

    const empty = document.querySelector('.gallery .sky-empty');
    if (!empty) return;
    empty.classList.toggle('hidden', visible > 0);
    empty.textContent = stars.length === 0
        ? 'No stars yet. Finish a task and it appears here.'
        : 'No stars in this range. Try a longer view.';
}

function openStarCard(task) {
    const card = document.querySelector('.star-description-chart');
    const stats = getStats(allTasks);
    const day = getDayAchievements(stats, dayKey(task.completed_at));

    card.querySelector('.star-title').textContent = task.title;
    card.querySelector('.achievement-tag').textContent = task.category || 'Achievement';
    card.querySelector('.datetime').textContent = formatLongDate(task.completed_at);
    card.querySelector('.today-quote').textContent = task.description || 'One more step forward.';

    const did = card.querySelector('.star-did');
    did.innerHTML = '';
    day.dayTasks.forEach(function (t) { did.appendChild(el('li', '', t.title)); });

    const badges = card.querySelector('.badge-achievement');
    badges.innerHTML = '';
    day.badges.forEach(function (b) {
        const badge = el('div', 'badge' + (b.value === 0 ? ' empty' : ''));
        badge.id = 'badge-' + b.id;
        badge.title = b.hint;
        badge.appendChild(document.createTextNode(b.icon));
        badge.appendChild(el('p', '', '+' + b.value));
        badge.appendChild(el('p', '', b.label));
        badges.appendChild(badge);
    });

    card.classList.remove('hidden');
}

// ===== IDENTITY RADAR CHART (Home + Identity Map) =====
function drawIdentityChart(canvas, counts) {
    if (!canvas || typeof Chart === 'undefined') return;
    const data = CATEGORIES.map(function (c) { return counts[c]; });

    if (canvas.chart) {
        canvas.chart.data.datasets[0].data = data;
        canvas.chart.update();
        return;
    }
    const muted = getComputedStyle(document.body).getPropertyValue('--text-muted').trim() || '#9aa3b8';
    const lines = 'rgba(127,127,160,0.25)';

    canvas.chart = new Chart(canvas, {
        type: 'radar',
        data: {
            labels: CATEGORIES,
            datasets: [{
                label: 'Finished tasks',
                data: data,
                backgroundColor: 'rgba(124, 92, 255, 0.25)',
                borderColor: '#7c5cff',
                pointBackgroundColor: '#7c5cff'
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    suggestedMax: 3,
                    angleLines: { color: lines },
                    grid: { color: lines },
                    pointLabels: { color: muted },
                    ticks: { display: false, stepSize: 1 }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}
