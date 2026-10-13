// ===== SETTINGS: display name (kept on the Supabase user) and light/dark theme =====

startPage('settings', function () {
    document.getElementById('name-input').value = displayName();
    document.getElementById('account-email').textContent = 'Signed in as ' + currentUser.email;
    updateThemeLabel();
});

document.getElementById('name-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const name = document.getElementById('name-input').value.trim();
    if (!name) return;

    const { data, error } = await supabaseClient.auth.updateUser({ data: { display_name: name } });
    if (error) { notify('Could not save your name: ' + error.message); return; }

    currentUser = data.user;
    updateSidebarProfile();
    notify('Name saved.');
});

document.getElementById('theme-switch').addEventListener('click', function () {
    toggleTheme();
    updateThemeLabel();
});

function updateThemeLabel() {
    document.getElementById('theme-switch').textContent = document.body.classList.contains('light-mode')
        ? 'Switch to dark sky'
        : 'Switch to light mode';
}
