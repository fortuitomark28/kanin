const ADMIN_ACCOUNT = {
  username: 'admin',
  password: 'kanin123',
  name: 'Admin',
};

function getUsers() {
  const raw = localStorage.getItem('kanin_users');
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem('kanin_users', JSON.stringify(users));
}

function findUser(username) {

  if (username.toLowerCase() === ADMIN_ACCOUNT.username.toLowerCase()) {
    return ADMIN_ACCOUNT;
  }

  return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

function setSession(user) {
  sessionStorage.setItem('kanin_session', JSON.stringify({
    username: user.username,
    name: user.name,
  }));
}

function getSession() {
  const raw = sessionStorage.getItem('kanin_session');
  return raw ? JSON.parse(raw) : null;
}

function clearSession() {
  sessionStorage.removeItem('kanin_session');
}

function showError(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
  el.classList.remove('auth-success');
}

function showSuccess(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
}

function clearMessages(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('visible');
  });
}

function initToggle(btnId, inputId) {
  const btn   = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;
  btn.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.style.color = isHidden ? 'var(--green)' : 'var(--text-muted)';
  });
}

function initLoginPage() {

  if (getSession()) {
    window.location.href = 'index.html';
    return;
  }

  initToggle('toggleLogin', 'loginPass');

  const btn      = document.getElementById('loginBtn');
  const userEl   = document.getElementById('loginUser');
  const passEl   = document.getElementById('loginPass');

  function doLogin() {
    clearMessages('loginError');
    const username = userEl.value.trim();
    const password = passEl.value;

    if (!username || !password) {
      showError('loginError', 'Please enter both username and password.');
      shake(username ? passEl : userEl);
      return;
    }

    const user = findUser(username);

    if (!user || user.password !== password) {
      showError('loginError', 'Incorrect username or password.');
      shake(passEl);
      passEl.value = '';
      return;
    }

    setSession(user);
    btn.textContent = 'Signing in…';
    btn.disabled = true;
    setTimeout(() => { window.location.href = 'index.html'; }, 400);
  }

  btn.addEventListener('click', doLogin);
  [userEl, passEl].forEach(el => {
    el.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  });
}

function initSignupPage() {

  if (getSession()) {
    window.location.href = 'index.html';
    return;
  }

  initToggle('toggleSignup',  'signupPass');
  initToggle('toggleConfirm', 'signupConfirm');

  const btn         = document.getElementById('signupBtn');
  const nameEl      = document.getElementById('signupName');
  const userEl      = document.getElementById('signupUser');
  const passEl      = document.getElementById('signupPass');
  const confirmEl   = document.getElementById('signupConfirm');

  function doSignup() {
    clearMessages('signupError', 'signupSuccess');

    const name     = nameEl.value.trim();
    const username = userEl.value.trim();
    const password = passEl.value;
    const confirm  = confirmEl.value;

    if (!name) {
      showError('signupError', 'Please enter your full name.');
      shake(nameEl); return;
    }
    if (!username || username.length < 3) {
      showError('signupError', 'Username must be at least 3 characters.');
      shake(userEl); return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      showError('signupError', 'Username can only contain letters, numbers, and underscores.');
      shake(userEl); return;
    }
    if (password.length < 6) {
      showError('signupError', 'Password must be at least 6 characters.');
      shake(passEl); return;
    }
    if (password !== confirm) {
      showError('signupError', 'Passwords do not match.');
      shake(confirmEl); return;
    }

    if (findUser(username)) {
      showError('signupError', 'That username is already taken. Try another.');
      shake(userEl); return;
    }

    const users = getUsers();
    users.push({ username, password, name });
    saveUsers(users);

    setSession({ username, name });

    showSuccess('signupSuccess', `Account created! Welcome, ${name} 👋`);
    btn.textContent = 'Redirecting…';
    btn.disabled = true;
    setTimeout(() => { window.location.href = 'index.html'; }, 900);
  }

  btn.addEventListener('click', doSignup);
  [nameEl, userEl, passEl, confirmEl].forEach(el => {
    el.addEventListener('keydown', e => { if (e.key === 'Enter') doSignup(); });
  });
}

function shake(el) {
  if (!el) return;
  el.style.transition = 'transform 0.07s ease';
  const steps = [6, -6, 5, -5, 3, -3, 0];
  let i = 0;
  const run = () => {
    if (i < steps.length) {
      el.style.transform = `translateX(${steps[i]}px)`;
      i++;
      setTimeout(run, 50);
    } else {
      el.style.transform = '';
      el.focus();
    }
  };
  run();
  el.style.borderColor = 'rgba(184,85,85,0.5)';
  setTimeout(() => { el.style.borderColor = ''; }, 800);
}

document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop();

  if (page === 'login.html' || page === '') {
    initLoginPage();
  } else if (page === 'signup.html') {
    initSignupPage();
  }
});