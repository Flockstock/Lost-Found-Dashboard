// ===== MISSION BOARD: add, complete and delete tasks =====

const taskForm = document.querySelector('.add-task-form');
const taskInput = document.querySelector('.task-input');
const taskDateInput = document.querySelector('.task-date');
const taskDescInput = document.querySelector('.task-description');
const focusOptions = document.querySelectorAll('.focus-option');
let selectedCategory = null;

// New tasks default to today.
taskDateInput.setAttribute('value', dayKey(new Date()));
taskDateInput.value = dayKey(new Date());

focusOptions.forEach(function (button) {
    button.addEventListener('click', function () {
        // Clicking the active tag again clears it.
        selectedCategory = selectedCategory === button.dataset.category ? null : button.dataset.category;
        focusOptions.forEach(function (o) { o.classList.toggle('active', o.dataset.category === selectedCategory); });
    });
});

taskForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const title = taskInput.value.trim();
    if (!title) return;

    const row = {
        user_id: currentUser.id,
        title: title,
        due_date: taskDateInput.value || null,
        category: selectedCategory,
        completed: false
    };
    const description = taskDescInput.value.trim();
    if (description) row.description = description;

    const submit = taskForm.querySelector('.add-task-btn');
    submit.disabled = true;
    const { error } = await supabaseClient.from('tasks').insert(row);
    submit.disabled = false;

    if (error) { notify('Could not save task: ' + error.message); return; }

    taskForm.reset();
    selectedCategory = null;
    focusOptions.forEach(function (o) { o.classList.remove('active'); });
    await refresh();
});

startPage('missions', renderMissions);

function renderMissions() {
    const stats = getStats(allTasks);

    document.querySelector('.mission-progress-label').textContent = stats.todayTasks.length
        ? stats.todayDone + ' of ' + stats.todayTasks.length + ' done today'
        : 'Nothing planned for today yet.';
    document.querySelector('.progress-fill').style.width = stats.percent + '%';
    document.querySelector('.progress-bar').setAttribute('aria-valuenow', stats.percent);

    fillList('tasks-today', stats.todayTasks.slice().reverse(), 'Add a task to start your day.');

    const carried = allTasks.filter(isCarriedOver).reverse();
    const later = allTasks.filter(isLater).reverse();
    fillList('tasks-carried', carried);
    fillList('tasks-later', later);
    document.getElementById('group-carried').classList.toggle('hidden', carried.length === 0);
    document.getElementById('group-later').classList.toggle('hidden', later.length === 0);
}

function fillList(listId, tasks, emptyText) {
    const list = document.getElementById(listId);
    list.innerHTML = '';
    if (tasks.length === 0 && emptyText) {
        list.appendChild(el('li', 'empty-note', emptyText));
        return;
    }
    tasks.forEach(function (task) { list.appendChild(buildTaskRow(task)); });
}

function buildTaskRow(task) {
    const li = el('li');
    if (task.completed) li.classList.add('task-done');

    const checkbox = el('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', 'Mark "' + task.title + '" as done');
    checkbox.addEventListener('change', async function () {
        checkbox.disabled = true;
        const { error } = await supabaseClient
            .from('tasks')
            .update({
                completed: checkbox.checked,
                completed_at: checkbox.checked ? new Date().toISOString() : null
            })
            .eq('id', task.id)
            .eq('user_id', currentUser.id);

        if (error) { notify('Could not update task: ' + error.message); checkbox.disabled = false; checkbox.checked = task.completed; return; }
        await refresh();
    });

    const body = el('div', 'task-body');
    body.appendChild(el('span', 'task-title', task.title));
    const meta = [];
    if (task.category) meta.push(task.category);
    if (task.due_date && task.due_date !== dayKey(new Date())) {
        meta.push('Due ' + keyToDate(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    if (meta.length) body.appendChild(el('small', 'task-meta', meta.join(', ')));
    if (task.description) body.appendChild(el('small', 'task-meta', task.description));

    const remove = el('button', 'task-delete-btn', '✕');
    remove.type = 'button';
    remove.setAttribute('aria-label', 'Delete "' + task.title + '"');
    remove.addEventListener('click', async function () {
        if (!confirm('Delete "' + task.title + '"?' + (task.completed ? ' Its star will disappear too.' : ''))) return;
        const { error } = await supabaseClient.from('tasks').delete().eq('id', task.id).eq('user_id', currentUser.id);
        if (error) { notify('Could not delete task: ' + error.message); return; }
        await refresh();
    });

    li.appendChild(checkbox);
    li.appendChild(body);
    li.appendChild(remove);
    return li;
}
