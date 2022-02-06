const form = document.querySelector('.login-form');
const loginPassword = document.querySelector('#login-password');
const loginEmail = document.querySelector('#login-email');
const loginContainer = document.querySelector('.login--container');
const BASE_URL = 'https://drop-it-file.herokuapp.com';

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    return showToast('All fields are required.');
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
      redirect: 'follow',
    }).then((res) => res.json());

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
  loginContainer.insertAdjacentElement('beforeend', div);

  setTimeout(() => {
    div.remove();
  }, 1600);
};

const showBtn = document.querySelector('.show-btn');
loginPassword.addEventListener('input', () => {
  if (loginPassword.value.length < 1) {
    showBtn.style.display = 'none';
    return;
  }
  showBtn.style.display = 'block';
});

showBtn.addEventListener('click', (e) => {
  const iTag = showBtn.children[0];
  e.stopImmediatePropagation();

  if (showBtn.style.display === 'block') {
    if (loginPassword.type === 'password') {
      loginPassword.type = 'text';
      iTag.classList.remove('fa-eye');
      iTag.classList.add('fa-eye-slash');
    } else {
      loginPassword.type = 'password';
      iTag.classList.remove('fa-eye-slash');
      iTag.classList.add('fa-eye');
    }
  }
});
