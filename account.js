/* Wallet, profile and referral center. Demo-only payment controls. */
(() => {
  const body = document.body;
  const modal = document.createElement('div');
  modal.className = 'account-modal';
  modal.innerHTML = `
    <div class="account-dialog" role="dialog" aria-modal="true">
      <button class="account-close" aria-label="Close">×</button>
      <span class="eyebrow">ACCOUNT CENTER</span>
      <h2 id="accountTitle">Wallet</h2>
      <div id="accountContent"></div>
    </div>
  `;
  body.appendChild(modal);

  const content = modal.querySelector('#accountContent');
  const title = modal.querySelector('#accountTitle');

  async function loadWallet() {
    try {
      const response = await fetch('/api/wallet', { credentials: 'same-origin' });
      const result = await response.json();
      if (!response.ok || !result.wallet) {
        window.win254Wallet = { balance: 0, bonus: 0 };
        return;
      }
      window.win254Wallet = result.wallet;
      return result.wallet;
    } catch {
      window.win254Wallet = { balance: 0, bonus: 0 };
      return null;
    }
  }

  async function loadReferral() {
    try {
      const response = await fetch('/api/referrals', { credentials: 'same-origin' });
      const result = await response.json();
      return result.referral || { code: 'WIN254-UNKNOWN' };
    } catch {
      return { code: 'WIN254-UNKNOWN' };
    }
  }

  function close() { modal.classList.remove('open'); }

  function demoNotice(action) {
    title.textContent = action;
    content.innerHTML = `
      <div class="demo-alert">
        <strong>Demo only</strong>
        <p>This ${action.toLowerCase()} button is a visual demonstration. No payment provider, wallet transfer or real-money transaction is connected.</p>
      </div>
      <button class="primary-button full" data-close>Return to Win254</button>
    `;
    content.querySelector('[data-close]').onclick = close;
    modal.classList.add('open');
  }

  async function walletView() {
    const wallet = await loadWallet();
    const balance = wallet ? Number(wallet.balance) : 0;
    title.textContent = 'Wallet';
    content.innerHTML = `
      <div class="wallet-balance"><span>Demo balance</span><strong>KSh ${balance.toLocaleString()}</strong></div>
      <div class="wallet-actions">
        <button class="primary-button" data-deposit>Deposit</button>
        <button class="outline-button" data-withdraw>Withdraw</button>
      </div>
      <p class="account-muted">Demo credits only. Real payments are disabled.</p>
    `;
    content.querySelector('[data-deposit]').onclick = () => demoNotice('Deposit');
    content.querySelector('[data-withdraw]').onclick = () => demoNotice('Withdrawal');
    modal.classList.add('open');
  }

  async function profileView() {
    const user = window.win254User || null;
    const wallet = await loadWallet();
    const balance = wallet ? Number(wallet.balance) : 0;
    const referral = await loadReferral();
    title.textContent = 'My profile';
    content.innerHTML = `
      <div class="profile-row">
        <div class="avatar">${(user?.name || 'G').slice(0, 1).toUpperCase()}</div>
        <div>
          <strong>${user?.name || 'Guest player'}</strong>
          <small>${user?.email || 'Log in to unlock your profile'}</small>
        </div>
      </div>
      <div class="account-stats">
        <div><b>KSh ${balance.toLocaleString()}</b><small>Demo balance</small></div>
        <div><b>${referral.code}</b><small>Referral code</small></div>
        <div><b>0</b><small>Open bets</small></div>
      </div>
      <button class="primary-button full" data-wallet>Open wallet</button>
    `;
    content.querySelector('[data-wallet]').onclick = walletView;
    modal.classList.add('open');
  }

  async function referralView() {
    const referral = await loadReferral();
    title.textContent = 'Refer & earn';
    content.innerHTML = `
      <div class="referral-card">
        <span>Your referral code</span>
        <strong>${referral.code}</strong>
        <button class="outline-button" data-copy>Copy code</button>
      </div>
      <p>Invite friends to explore Win254. Any rewards programme must follow legal eligibility and anti-fraud checks.</p>
      <button class="primary-button full" data-share>Share invite</button>
    `;
    content.querySelector('[data-copy]').onclick = async () => {
      try { await navigator.clipboard.writeText(referral.code); window.showToast?.('Referral code copied'); }
      catch { window.showToast?.(referral.code); }
    };
    content.querySelector('[data-share]').onclick = () => {
      if (navigator.share) {
        navigator.share({ title: 'Win254', text: `Join me on Win254 with code ${referral.code}` }).catch(() => {});
      } else {
        window.showToast?.(`Share code: ${referral.code}`);
      }
    };
    modal.classList.add('open');
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-account]')) profileView();
    if (e.target.closest('[data-wallet]')) walletView();
    if (e.target.closest('[data-referrals]')) referralView();
  });

  modal.querySelector('.account-close').onclick = close;
  modal.onclick = e => { if (e.target === modal) close(); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  const actions = document.createElement('div');
  actions.className = 'account-actions';
  actions.innerHTML = '<button class="outline-button" data-wallet>Wallet</button><button class="outline-button" data-account>Profile</button><button class="primary-button" data-referrals>Refer & earn</button>';
  const topActions = document.querySelector('.top-actions');
  if (topActions) topActions.prepend(actions);

  window.refreshWallet = loadWallet;
})();
