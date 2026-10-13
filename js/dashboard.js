// ===== HOME: every card here is worked out from the user's own tasks =====

startPage('home', renderDashboard);

function renderDashboard() {
    const stats = getStats(allTasks);

    document.querySelector('.greeting').textContent = greeting();
    mountSky();
    renderStars();

    renderMission(stats);
    renderFocus(stats);
    renderStreak(stats);
    renderRadarTeaser();
    drawIdentityChart(document.getElementById('identity-chart'), stats.categoryCounts);
    renderRecentArchive(stats);
    renderSkyCollection(stats);
}

// Today's Mission: the next unfinished task planned for today.
function renderMission(stats) {
    const total = stats.todayTasks.length;
    const next = stats.todayTasks.slice().reverse().find(function (t) { return !t.completed; });
    const text = document.querySelector('.mission-text');
    const button = document.querySelector('.continue-btn');

    if (next) {
        text.textContent = next.title;
        button.textContent = 'Continue Mission';
    } else if (total > 0) {
        text.textContent = 'Everything planned for today is done.';
        button.textContent = 'Add another mission';
    } else {
        text.textContent = 'Nothing planned yet. What matters today?';
        button.textContent = 'Plan today';
    }

    document.querySelector('.mission-progress-label').textContent = total
        ? stats.todayDone + ' of ' + total + ' done today'
        : 'No tasks for today';
    document.querySelector('.progress-fill').style.width = stats.percent + '%';
    document.querySelector('.progress-bar').setAttribute('aria-valuenow', stats.percent);
}

// Focus Signal: today's progress, and the focus area you chose most for today.
function renderFocus(stats) {
    const total = stats.todayTasks.length;
    let focus = null;
    let best = 0;
    CATEGORIES.forEach(function (c) {
        const n = stats.todayTasks.filter(function (t) { return t.category === c; }).length;
        if (n > best) { focus = c; best = n; }
    });

    let name = 'Nothing set for today';
    let message = 'Add a task to light this up.';
    if (total > 0) {
        name = focus ? focus + ' focus' : 'No focus tag yet';
        const left = total - stats.todayDone;
        if (left === 0) message = 'Today\'s sky is clear.';
        else if (stats.todayDone === 0) message = 'Pick one and begin.';
        else message = left + ' to go, keep going ' + displayName() + '!';
    }

    document.querySelector('.focus-name').textContent = name;
    document.querySelector('.focus-message').textContent = message;
    document.querySelector('.focus-ring').style.setProperty('--p', stats.percent + '%');
    document.querySelector('.focus-ring-inner').textContent = stats.percent + '%';
}

// Streak: consecutive days with at least one finished task, plus the last 7 days.
function renderStreak(stats) {
    document.querySelector('.streak-count').textContent = stats.streak + (stats.streak === 1 ? ' Day' : ' Days');

    const week = document.querySelector('.weekdays');
    week.innerHTML = '';
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const day = el('span', 'day', d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0));
        day.title = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        if (stats.doneDays.has(dayKey(d))) day.classList.add('done');
        week.appendChild(day);
    }
}

function renderRadarTeaser() {
    const list = document.querySelector('.radar-list');
    list.innerHTML = '';
    ['Tools', 'Hackathons', 'Careers'].forEach(function (group) {
        const item = RADAR_ITEMS.find(function (i) { return i.group === group; });
        const li = el('li');
        const link = el('a', '', item.text);
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        li.appendChild(document.createTextNode(item.icon + ' '));
        li.appendChild(link);
        list.appendChild(li);
    });
}

function renderRecentArchive(stats) {
    const list = document.querySelector('.archive-list');
    list.innerHTML = '';
    if (stats.completed.length === 0) {
        list.appendChild(el('p', 'empty-note', 'Finished tasks are saved here.'));
        return;
    }
    stats.completed.slice(0, 6).forEach(function (task) {
        const card = el('div', 'archive-card');
        card.appendChild(el('span', 'archive-date', new Date(task.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })));
        card.appendChild(el('strong', '', task.title));
        list.appendChild(card);
    });
}

function renderSkyCollection(stats) {
    const list = document.querySelector('.sky-list');
    const total = stats.completed.length;
    list.innerHTML = '';

    SKIES.forEach(function (sky) {
        const unlocked = total >= sky.threshold;
        const card = el('button', 'sky-card');
        card.type = 'button';

        if (!unlocked) {
            card.classList.add('locked');
            card.disabled = true;
            card.appendChild(el('span', '', '🔒 ' + sky.label + ' (' + sky.threshold + ' tasks)'));
        } else {
            const img = el('img');
            img.src = sky.image;
            img.alt = '';
            img.loading = 'lazy';
            img.decoding = 'async';
            img.onerror = function () { img.remove(); };
            card.appendChild(img);
            const isSelected = sky.name === selectedSky;
            card.appendChild(el('span', '', (isSelected ? '✓ ' : '') + sky.label));
            if (isSelected) {
                card.classList.add('selected');
                card.setAttribute('aria-pressed', 'true');
            }
            card.addEventListener('click', async function () {
                if (await selectSky(sky.name)) renderSkyCollection(stats);
            });
        }
        list.appendChild(card);
    });
}
