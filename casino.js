const casinoGames = [
  { id: 'aviator', icon: '✈', name: 'Aviator', category: 'Crash games', tone: 'red', description: 'Watch the multiplier rise and cash out before the flight ends.', action: 'Play demo' },
  { id: 'mines', icon: '◆', name: 'Mines', category: 'Instant games', tone: 'purple', description: 'Pick safe tiles, build your multiplier and stop at the right moment.', action: 'Play demo' },
  { id: 'roulette', icon: '◎', name: 'European Roulette', category: 'Table games', tone: 'green', description: 'A classic single-zero roulette experience with practice credits.', action: 'Play demo' },
  { id: 'blackjack', icon: '♠', name: 'Blackjack', category: 'Table games', tone: 'blue', description: 'Beat the dealer without going over 21 in this guided demo.', action: 'Play demo' },
  { id: 'slots', icon: '7', name: 'Lucky Sevens', category: 'Slots', tone: 'gold', description: 'Spin three reels and chase a lucky combination.', action: 'Play demo' },
  { id: 'plinko', icon: '✦', name: 'Plinko', category: 'Arcade', tone: 'pink', description: 'Drop a ball and see where it lands on the multiplier board.', action: 'Play demo' }
];

(() => {
  const grid = document.querySelector('#casinoGrid');
  if (!grid) return;
  grid.innerHTML = casinoGames.map(game => `<article class="casino-card ${game.tone}"><div class="game-art"><span>${game.icon}</span><small>DEMO</small></div><div class="game-info"><span class="game-category">${game.category}</span><h3>${game.name}</h3><p>${game.description}</p><button class="primary-button casino-play" data-game="${game.id}">${game.action} <span>→</span></button></div></article>`).join('');
  grid.querySelectorAll('.casino-play').forEach(button => button.addEventListener('click', () => openCasino(button.dataset.game)));

  function openCasino(id) {
    const game = casinoGames.find(item => item.id === id);
    const message = id === 'aviator'
      ? 'Aviator demo opened. The multiplier will rise for practice only—cash out before the round ends.'
      : `${game.name} demo opened. Practice credits only; no real-money play is enabled.`;
    if (typeof window.showToast === 'function') window.showToast(message); else alert(message);
  }
})();
