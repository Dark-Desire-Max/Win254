/* Real authentication client for the Win254 Node API. */
(() => {
  const $ = (selector) => document.querySelector(selector);
  const modal = $('#modal'); const form = $('#accountForm');
  if (!modal || !form) return;
  let mode = 'login';
  let nameField;
  const submit = form.querySelector('button[type="submit"]');
  const passwordLabel = form.querySelector('label:nth-of-type(2)');
  const switcher = document.createElement('button');
  switcher.type = 'button'; switcher.className = 'auth-switch'; form.after(switcher);
  const setMode = (next) => {
    mode = next; const register = mode === 'register';
    $('#modalTitle').textContent = register ? 'Create your account' : 'Log in to Win254';
    $('#modalEyebrow').textContent = register ? 'WELCOME TO WIN254' : 'WELCOME BACK';
    submit.textContent = register ? 'Create account' : 'Log in';
    switcher.textContent = register ? 'Already have an account? Log in' : 'New to Win254? Create an account';
    if (register && !nameField) { nameField = document.createElement('label'); nameField.innerHTML = 'Your name<input name="name" autocomplete="name" placeholder="Your name" required />'; form.insertBefore(nameField, form.firstChild); }
    if (!register && nameField) { nameField.remove(); nameField = null; }
  };
  const open = (next) => { setMode(next); modal.classList.add('open'); setTimeout(() => form.querySelector('input')?.focus(), 40); };
  $('#loginButton').onclick = () => open('login'); $('#registerButton').onclick = () => open('register');
  $('#placeBet').onclick = () => { if (window.win254User) window.showToast?.('Demo bet submitted to your account.'); else open('login'); };
  switcher.onclick = () => setMode(mode === 'login' ? 'register' : 'login');
  form.onsubmit = async (event) => {
    event.preventDefault(); submit.disabled = true; submit.textContent = 'Please wait…';
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(data) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Authentication failed.');
      window.win254User = result.user; modal.classList.remove('open'); updateAccount(result.user); window.showToast?.(`Welcome, ${result.user.name}!`);
    } catch (error) { let message = $('#modalText'); message.textContent = error.message; message.style.color = '#c84c57'; }
    finally { submit.disabled = false; submit.textContent = mode === 'register' ? 'Create account' : 'Log in'; }
  };
  function updateAccount(user) {
    const login = $('#loginButton'); const register = $('#registerButton');
    login.textContent = user ? `Hi, ${user.name.split(' ')[0]}` : 'Log in'; register.textContent = user ? 'Log out' : 'Join now';
    register.onclick = user ? async () => { await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }); window.win254User = null; updateAccount(null); window.showToast?.('You have been logged out.'); } : () => open('register');
    login.onclick = user ? () => window.showToast?.(`Signed in as ${user.email}`) : () => open('login');
  }
  fetch('/api/auth/me', { credentials: 'same-origin' }).then(r => r.json()).then(({ user }) => { window.win254User = user; if (user) updateAccount(user); }).catch(() => {});
  setMode('login');
})();
