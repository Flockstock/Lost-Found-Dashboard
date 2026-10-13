// ===== IDENTITY MAP: finished tasks by focus area =====

startPage('identity', function () {
    const stats = getStats(allTasks);
    drawIdentityChart(document.getElementById('identity-chart'), stats.categoryCounts);

    const total = CATEGORIES.reduce(function (sum, c) { return sum + stats.categoryCounts[c]; }, 0);
    const list = document.getElementById('identity-list');
    list.innerHTML = '';

    CATEGORIES.forEach(function (c) {
        const count = stats.categoryCounts[c];
        const li = el('li');
        li.appendChild(el('span', 'identity-name', c));
        const bar = el('div', 'progress-bar');
        const fill = el('div', 'progress-fill');
        fill.style.width = (total ? (count / total) * 100 : 0) + '%';
        bar.appendChild(fill);
        li.appendChild(bar);
        li.appendChild(el('span', 'identity-count', String(count)));
        list.appendChild(li);
    });

    let top = null;
    CATEGORIES.forEach(function (c) { if (stats.categoryCounts[c] > (top ? stats.categoryCounts[top] : 0)) top = c; });
    document.querySelector('.page-summary').textContent = top
        ? 'Your sky leans toward ' + top + '.'
        : 'Finish a task with a focus tag to start drawing your map.';
});
