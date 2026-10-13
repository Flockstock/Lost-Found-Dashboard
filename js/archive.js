// ===== ARCHIVE: finished tasks, grouped by the day they were finished =====

startPage('archive', function () {
    const stats = getStats(allTasks);
    const body = document.getElementById('archive-body');
    body.innerHTML = '';

    document.querySelector('.page-summary').textContent = stats.completed.length
        ? stats.completed.length + ' finished so far, newest first.'
        : 'Everything you have finished, newest first.';

    if (stats.completed.length === 0) {
        body.appendChild(el('p', 'empty-note', 'Nothing here yet. Finish a task on the Mission Board and it is saved here.'));
        return;
    }

    let currentKey = null;
    let list = null;
    stats.completed.forEach(function (task) {
        const key = dayKey(task.completed_at);
        if (key !== currentKey) {
            currentKey = key;
            const group = el('section', 'vault-group');
            group.appendChild(el('h4', '', formatKey(key)));
            list = el('div', 'archive-list');
            group.appendChild(list);
            body.appendChild(group);
        }
        const card = el('div', 'archive-card');
        card.appendChild(el('strong', '', task.title));
        if (task.category) card.appendChild(el('span', 'archive-date', task.category));
        if (task.description) card.appendChild(el('span', 'archive-note', task.description));
        list.appendChild(card);
    });
});
