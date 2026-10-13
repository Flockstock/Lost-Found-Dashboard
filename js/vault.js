// ===== CURIOSITY VAULT: Learn and Creative tasks, open and finished =====

startPage('vault', function () {
    const curious = allTasks.filter(function (t) { return t.category === 'Learn' || t.category === 'Creative'; });
    fillVault('vault-open', curious.filter(function (t) { return !t.completed; }), 'Nothing waiting. Add a Learn or Creative task to start one.');
    fillVault('vault-done', curious.filter(function (t) { return t.completed; }), 'Nothing uncovered yet.');
});

function fillVault(id, tasks, emptyText) {
    const list = document.getElementById(id);
    list.innerHTML = '';
    if (tasks.length === 0) {
        list.appendChild(el('p', 'empty-note', emptyText));
        return;
    }
    tasks.forEach(function (task) {
        const card = el('div', 'archive-card');
        card.appendChild(el('strong', '', task.title));
        card.appendChild(el('span', 'archive-date', task.category));
        if (task.description) card.appendChild(el('span', 'archive-note', task.description));
        list.appendChild(card);
    });
}
