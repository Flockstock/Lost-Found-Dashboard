// ===== OBSERVATORY: the full-size sky. Each finished task is a star. =====

startPage('observatory', function () {
    const stats = getStats(allTasks);
    document.querySelector('.greeting').textContent = greeting();
    mountSky();
    renderStars();

    const total = stats.completed.length;
    document.querySelector('.sky-summary').textContent = total === 0
        ? 'Every star is a proof you showed up'
        : total + (total === 1 ? ' star' : ' stars') + ' so far. Every one is proof you showed up.';
});
