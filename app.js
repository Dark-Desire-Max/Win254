const events=[
 {id:1,sport:'Football',league:'Premier League · Today, 18:00',home:'Arsenal',away:'Chelsea',homeIcon:'🔴',awayIcon:'🔵',score:'—',status:'PRE-MATCH',odds:[['1','1.72'],['X','3.80'],['2','4.60']]},
 {id:2,sport:'Football',league:'La Liga · Today, 20:30',home:'Barcelona',away:'Atletico Madrid',homeIcon:'🔵',awayIcon:'🔴',score:'—',status:'PRE-MATCH',odds:[['1','1.95'],['X','3.45'],['2','3.90']]},
 {id:3,sport:'Basketball',league:'NBA · Today, 22:00',home:'Boston Celtics',away:'Miami Heat',homeIcon:'☘️',awayIcon:'🔥',score:'—',status:'PRE-MATCH',odds:[['1','1.48'],['X','—'],['2','2.55']]},
 {id:4,sport:'Tennis',league:'ATP 500 · Today, 16:00',home:'A. Zverev',away:'C. Alcaraz',homeIcon:'🎾',awayIcon:'🎾',score:'—',status:'PRE-MATCH',odds:[['1','2.10'],['X','—'],['2','1.70']]},
 {id:5,sport:'Rugby',league:'World Championship · Today, 19:00',home:'Kenya',away:'South Africa',homeIcon:'🇰🇪',awayIcon:'🇿🇦',score:'—',status:'PRE-MATCH',odds:[['1','5.20'],['X','26.00'],['2','1.12']]}
];
let picks=[]; let activeFilter='all';
const $ = s => document.querySelector(s);

function renderEvents() {
  const list = $('#eventList');
  const visible = activeFilter === 'all' ? events : events.filter(e => e.sport === activeFilter);
  list.innerHTML = visible.map(e => `
    <article class="event-card">
      <div class="event-meta"><span>${e.sport} · ${e.league}</span><span class="${e.status === 'LIVE' ? 'live' : ''}">${e.status === 'LIVE' ? '● ' : ''}${e.status}</span></div>
      <div class="teams">
        <div class="team"><span class="team-logo">${e.homeIcon}</span>${e.home}</div>
        <div class="score">${e.score}</div>
        <div class="team"><span>${e.away}</span><span class="team-logo">${e.awayIcon}</span></div>
      </div>
      <div class="markets">${e.odds.map((o,i) => `<button class="odd ${picks.some(p => p.id === e.id && p.index === i) ? 'selected' : ''}" data-event="${e.id}" data-index="${i}">${o[0]} <b>${o[1]}</b></button>`).join('')}</div>
    </article>
  `).join('');

  list.querySelectorAll('.odd').forEach(button => button.addEventListener('click', () => addPick(+button.dataset.event, +button.dataset.index)));
}

function addPick(id, index) {
  const event = events.find(x => x.id === id);
  const odd = event.odds[index];
  if (odd[1] === '—') return showToast('That market is not available');

  const existing = picks.findIndex(p => p.id === id);
  const pick = { id, index, event, market: odd[0], price: Number(odd[1]) };

  if (existing > -1) {
    if (picks[existing].index === index) picks.splice(existing, 1); else picks[existing] = pick;
  } else {
    picks.push(pick);
  }

  renderEvents();
  renderSlip();
}

function renderSlip() {
  const count = picks.length;
  $('#betCount').textContent = count;
  $('#tabBetCount').textContent = count;
  const body = $('#slipBody');

  if (!count) {
    body.innerHTML = '<div class="empty-slip"><div class="empty-icon">＋</div><b>Your bet slip is empty</b><p>Tap any odds to add a selection.<br>Your picks will appear here.</p></div>';
    $('#potentialReturn').textContent = 'KSh 0.00';
    return;
  }

  body.innerHTML = picks.map((pick, i) => `
    <div class="slip-pick">
      <button data-remove="${i}">×</button>
      <strong>${pick.event.home} v ${pick.event.away}</strong>
      <small>${pick.market} · ${pick.price.toFixed(2)} · ${pick.event.sport}</small>
    </div>
  `).join('');

  body.querySelectorAll('[data-remove]').forEach(button => button.onclick = () => {
    picks.splice(Number(button.dataset.remove), 1);
    renderEvents();
    renderSlip();
  });

  updateReturn();
}

function updateReturn() {
  const stake = Number($('#stake').value || 0);
  const total = picks.reduce((sum, pick) => sum * pick.price, 1);
  $('#potentialReturn').textContent = `KSh ${(stake * total || 0).toFixed(2)}`;
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}
window.showToast = showToast;

function openModal(title='Create your account', eyebrow='WELCOME TO WIN254') {
  $('#modalTitle').textContent = title;
  $('#modalEyebrow').textContent = eyebrow;
  $('#modal').classList.add('open');
}

async function placeBet() {
  if (!window.win254User) return openModal('Log in to place your bet', 'ONE STEP AWAY');
  const stake = Number($('#stake').value || 0);
  if (!stake || !picks.length) return showToast('Select a bet and set a valid stake.');
  const total = picks.reduce((sum, pick) => sum * pick.price, 1);
  const market = picks.map(p => `${p.event.home} vs ${p.event.away} ${p.market}@${p.price}`).join(' | ');

  try {
    const response = await fetch('/api/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ market, stake, odds: total })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Bet placement failed.');
    picks = [];
    renderEvents();
    renderSlip();
    showToast(`Bet placed: KSh ${stake.toFixed(2)}`);
    const wallet = window.win254Wallet; if (wallet) wallet.balance = Number(result.wallet.balance);
  } catch (error) {
    showToast(error.message || 'Could not place bet');
  }
}

renderEvents(); renderSlip();

document.querySelectorAll('.quick').forEach(button => button.onclick = () => {
  document.querySelectorAll('.quick').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  activeFilter = button.dataset.filter;
  renderEvents();
});

$('#stake').oninput = updateReturn;
$('#clearSlip').onclick = () => { picks = []; renderEvents(); renderSlip(); };
$('#loginButton').onclick = () => openModal('Log in to Win254', 'WELCOME BACK');
$('#registerButton').onclick = () => openModal();
$('#placeBet').onclick = placeBet;
$('#modalClose').onclick = () => $('#modal').classList.remove('open');
$('#modal').onclick = e => { if (e.target.id === 'modal') $('#modal').classList.remove('open'); };
$('#accountForm').onsubmit = e => { e.preventDefault(); $('#modal').classList.remove('open'); showToast('Demo account ready — welcome to Win254!'); };
$('#howItWorks').onclick = () => showToast('Choose an event, tap odds, review your slip, then place your bet.');
$('#promoButton').onclick = () => openModal('Claim your welcome offer', 'WELCOME TO WIN254');
$('#searchButton').onclick = () => showToast('Search is coming soon in the next release.');
$('#moreButton').onclick = () => showToast('More filters will be available soon.');
$('#dateButton').onclick = () => showToast("Showing today's events");
