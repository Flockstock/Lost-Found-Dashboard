// ===== LANDING: login and sign up =====

const authForm = document.querySelector('.auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm-password');
const confirmGroup = document.querySelector('.confirm-password-group');
const confirmNotice = document.querySelector('.confirm-notice');
const formTitle = document.querySelector('.form-title');
const formMessage = document.querySelector('.form-message');
const submitBtn = document.querySelector('.get-started-btn');
const toggleMessage = document.querySelector('.toggle-message');
const toggleLink = document.querySelector('.toggle-link');
const resendBtn = document.querySelector('.resend-btn');
const confirmedBtn = document.querySelector('.confirmed-btn');

let isSignUp = false;

// Already logged in? Skip straight to the dashboard.
supabaseClient.auth.getSession().then(function (result) {
    if (result.data.session) window.location.replace('dashboard.html');
});

function goToDashboard() {
    window.location.href = 'dashboard.html';
}

function showMessage(text) {
    formMessage.textContent = text;
}

function setMode(signUp) {
    isSignUp = signUp;
    confirmGroup.classList.toggle('hidden', !signUp);
    confirmInput.required = signUp;
    confirmNotice.classList.add('hidden');
    showMessage('');

    formTitle.textContent = signUp ? 'Sign Up' : 'Login';
    submitBtn.textContent = signUp ? 'Sign Up' : 'Login';
    toggleMessage.textContent = signUp ? 'Already have an account?' : 'Don\'t have an account?';
    toggleLink.textContent = signUp ? 'Login' : 'Sign Up';
    passwordInput.autocomplete = signUp ? 'new-password' : 'current-password';
}

toggleLink.addEventListener('click', function (event) {
    event.preventDefault();
    setMode(!isSignUp);
});

authForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    showMessage('');

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    submitBtn.disabled = true;

    if (isSignUp) {
        if (password !== confirmInput.value) {
            showMessage('The passwords do not match.');
            submitBtn.disabled = false;
            return;
        }
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: { data: { display_name: email.split('@')[0] } }
        });
        if (error) showMessage(error.message);
        else if (data.session) goToDashboard();          // email confirmation is off
        else confirmNotice.classList.remove('hidden');   // waiting for the confirmation email
    } else {
        const { error } = await supabaseClient.auth.signInWithPassword({ email: email, password: password });
        if (error) {
            showMessage(error.message);
            if (/confirm/i.test(error.message)) confirmNotice.classList.remove('hidden');
        } else {
            goToDashboard();
        }
    }
    submitBtn.disabled = false;
});

resendBtn.addEventListener('click', async function () {
    const { error } = await supabaseClient.auth.resend({ type: 'signup', email: emailInput.value.trim() });
    showMessage(error ? error.message : 'Confirmation email sent again.');
});

confirmedBtn.addEventListener('click', async function () {
    const { error } = await supabaseClient.auth.signInWithPassword({
        email: emailInput.value.trim(),
        password: passwordInput.value
    });
    if (error) showMessage('Not confirmed yet. Check your inbox.');
    else goToDashboard();
});
