// ===== STUDENT RADAR: links the user wants to keep close (saved per user in the radar_links table) =====

const radarForm = document.getElementById('radar-form');
const radarUrlInput = document.getElementById('radar-url');
const radarTitleInput = document.getElementById('radar-title');
const radarNoteInput = document.getElementById('radar-note');
let radarLinks = [];

async function fetchRadarLinks() {
    const { data, error } = await supabaseClient
        .from('radar_links')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

    if (error) {
        notify('Could not load saved links: ' + error.message);
        return [];
    }

    return data || [];
}


// Accepts "devpost.com" or "https://devpost.com/x". Only http and https links are allowed.
function normalizeUrl(raw) {
    let text = raw.trim();
    if (!text) return null;
    if (!/^https?:\/\//i.test(text)) {
        if (/^[a-z][a-z0-9+.-]*:\/\//i.test(text) || /^(javascript|data|vbscript|file|mailto):/i.test(text)) return null;
        text = 'https://' + text;
    }
    try {
        const url = new URL(text);
        const looksReal = url.hostname.includes('.') || url.hostname === 'localhost';
        return looksReal ? url.href : null;
    } catch (err) {
        return null;
    }
}

function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (err) { return url; }
}

radarForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const url = normalizeUrl(radarUrlInput.value);
    if (!url) {
        notify('That doesn\'t look like a web link. Try something like https://example.com');
        return;
    }

    const row = {
        user_id: currentUser.id,
        title: radarTitleInput.value.trim() || hostOf(url),
        url: url
    };
    const note = radarNoteInput.value.trim();
    if (note) row.note = note;

    const submit = radarForm.querySelector('.add-task-btn');
    submit.disabled = true;
    const { error } = await supabaseClient.from('radar_links').insert(row);
    submit.disabled = false;

    if (error) { notify('Could not save link: ' + error.message); return; }

    radarForm.reset();
    radarLinks = await fetchRadarLinks();
    drawRadar();
});

function drawRadar() {
    const list = document.getElementById('radar-list');
    list.innerHTML = '';

    if (radarLinks.length === 0) {
        list.appendChild(el('li', 'empty-note', 'Nothing on your radar yet. Save a link to something you want to keep an eye on.'));
        return;
    }

    radarLinks.forEach(function (item) {
        const li = el('li');
        const body = el('div', 'task-body');

        const link = el('a', 'radar-link', item.title);
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        body.appendChild(link);
        body.appendChild(el('small', 'task-meta', hostOf(item.url)));
        if (item.note) body.appendChild(el('small', 'task-meta', item.note));

        const remove = el('button', 'task-delete-btn', '✕');
        remove.type = 'button';
        remove.setAttribute('aria-label', 'Remove "' + item.title + '"');
        remove.addEventListener('click', async function () {
            if (!confirm('Remove "' + item.title + '" from your radar?')) return;
            const { error } = await supabaseClient.from('radar_links').delete().eq('id', item.id).eq('user_id', currentUser.id);
            if (error) { notify('Could not remove link: ' + error.message); return; }
            radarLinks = await fetchRadarLinks();
            drawRadar();
        });

        li.appendChild(body);
        li.appendChild(remove);
        list.appendChild(li);
    });
}

startPage('radar', async function () {
    radarLinks = await fetchRadarLinks();
    drawRadar();
});