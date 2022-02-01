const form = document.querySelector('.reg-form');
const signupBtn = document.getElementById('signup-btn');
const regUsername = document.querySelector('#reg-username');
const regPassword = document.querySelector('#reg-password');
const regEmail = document.querySelector('#reg-email');
const registrationContainer = document.querySelector(
  '.registration--container'
);

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = regUsername.value.trim();
  const email = regEmail.value.trim();
  const password = regPassword.value.trim();

  if (!username || !email || !password) {
    return showToast('All fields are required.');
  }

  if (username !== username.toLowerCase()) {
    showToast('Username must be in Lowercase.');
    return;
  }

  if (email !== email.toLowerCase()) {
    showToast('Email must be in Lowercase.');
    return;
  }

  form.disabled = true;
  signupBtn.disabled = true;
  signupBtn.style.opacity = '0.9';

  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    }).then((res) => res.json());

    form.removeAttribute('disabled');
    signupBtn.removeAttribute('disabled');
    signupBtn.style.opacity = '1';

    showToast(response.message);
    if (response.ok)
      setTimeout(() => (location.href = response.redirectUrl), 1800);
  } catch (error) {
    showToast(error.message);
  }
});

const showToast = (msg) => {
  const toasts = document.querySelectorAll('.toast');
  if (toasts) {
    toasts.forEach((toast) => toast.remove());
  }

  const div = document.createElement('div');
  div.innerText = msg;
  div.classList.add('toast');
  div.classList.add('show');

  registrationContainer.insertAdjacentElement('beforeend', div);
  setTimeout(() => {
    div.remove();
  }, 1600);
};

const showBtn = document.querySelector('.show-btn');
regPassword.addEventListener('input', () => {
  if (regPassword.value.length < 1) {
    showBtn.style.display = 'none';
    return;
  }
  showBtn.style.display = 'block';
});

showBtn.addEventListener('click', (e) => {
  const iTag = showBtn.children[0];
  e.stopImmediatePropagation();

  if (showBtn.style.display === 'block') {
    if (regPassword.type === 'password') {
      regPassword.type = 'text';
      iTag.classList.remove('fa-eye');
      iTag.classList.add('fa-eye-slash');
    } else {
      regPassword.type = 'password';
      iTag.classList.remove('fa-eye-slash');
      iTag.classList.add('fa-eye');
    }
  }
});
