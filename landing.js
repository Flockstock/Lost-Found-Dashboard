
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

let isSignUp = false;

function showMessage(message) {
    formMessage.textContent = message;
}

function goToDashboard() {
    window.location.replace('dashboard.html');
}

// Redirect users who are already logged in.
supabaseClient.auth.getSession()
    .then(({ data, error }) => {
        if (error) throw error;
        if (data.session) goToDashboard();
    })
    .catch(() => {
        showMessage('Unable to check your login. Please refresh and try again.');
    });

// Switch between Login and Sign Up.
function setMode(signUp) {
    isSignUp = signUp;

    confirmGroup.classList.toggle('hidden', !signUp);
    confirmInput.required = signUp;

    confirmNotice.classList.add('hidden');
    showMessage('');

    formTitle.textContent = signUp
        ? 'Create your account'
        : 'Welcome back';

    submitBtn.textContent = signUp
        ? 'Create Account'
        : 'Login';

    toggleMessage.textContent = signUp
        ? 'Already have an account?'
        : 'New here?';

    toggleLink.textContent = signUp
        ? 'Login'
        : 'Create an account';

    passwordInput.autocomplete = signUp
        ? 'new-password'
        : 'current-password';

    confirmInput.value = '';
}

toggleLink.addEventListener('click', (event) => {
    event.preventDefault();
    setMode(!isSignUp);
});

// Handle Login and Sign Up.
authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    showMessage('');

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (isSignUp && password !== confirmInput.value) {
        showMessage('Your passwords do not match.');
        return;
    }

    submitBtn.disabled = true;

    try {
        if (isSignUp) {
            const { data, error } =
                await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            display_name: email.split('@')[0]
                        }
                    }
                });

            if (error) throw error;

            if (data.session) {
                goToDashboard();
                return;
            }

            confirmNotice.classList.remove('hidden');
            showMessage(
                'Account created! Check your email to confirm your account.'
            );
        } else {
            const { error } =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) throw error;

            goToDashboard();
            return;
        }
    } catch (error) {
        if (/confirm/i.test(error.message)) {
            confirmNotice.classList.remove('hidden');
            showMessage(
                'Please confirm your email before logging in.'
            );
        } else if (
            /invalid login credentials/i.test(error.message)
        ) {
            showMessage('Incorrect email or password.');
        } else {
            showMessage(error.message || 'Something went wrong. Try again.');
        }
    } finally {
        submitBtn.disabled = false;
    }
});

// Resend the confirmation email.
resendBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();

    if (!email) {
        showMessage('Enter your email address first.');
        return;
    }

    resendBtn.disabled = true;
    showMessage('');

    try {
        const { error } = await supabaseClient.auth.resend({
            type: 'signup',
            email
        });

        if (error) throw error;

        showMessage('If eligible, a confirmation email has been sent.');
    } catch (error) {
        showMessage(error.message || 'Unable to resend the email.');
    } finally {
        resendBtn.disabled = false;
    }
});
