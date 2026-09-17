/* Win254 interaction layer: live ticker, theme toggle, mobile nav and scroll reveals. */
(function(){
  const $=s=>document.querySelector(s);
  const body=document.body;
  const ticker=document.createElement('div');ticker.className='live-ticker';ticker.innerHTML='<div class="ticker-track"><span><b>● LIVE</b> Arsenal 2–1 Chelsea · 78\'</span><span><b>● LIVE</b> Nairobi City Stars 0–0 Gor Mahia · 32\'</span><span><b>⚡ BOOST</b> Enhanced odds on selected fixtures</span><span><b>● LIVE</b> Lakers 84–79 Celtics · Q3</span><span><b>● LIVE</b> Arsenal 2–1 Chelsea · 78\'</span><span><b>● LIVE</b> Nairobi City Stars 0–0 Gor Mahia · 32\'</span><span><b>⚡ BOOST</b> Enhanced odds on selected fixtures</span></div>';
  $('.topbar').after(ticker);
  const mobile=document.createElement('div');mobile.className='mobile-panel';mobile.innerHTML='<a href="#home">Home</a><a href="#sports">Sports</a><a href="#live">Live events</a><a href="#promotions">Promotions</a>';body.append(mobile);
  $('#menuButton').addEventListener('click',()=>{mobile.classList.toggle('open');body.classList.toggle('menu-open');});
  mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobile.classList.remove('open');body.classList.remove('menu-open')}));
  const tools=document.createElement('div');tools.className='floating-tools';tools.innerHTML='<button class="float-button" id="themeToggle" aria-label="Toggle theme">☾</button><button class="float-button" id="scrollTop" aria-label="Back to top">↑</button>';body.append(tools);
  $('#themeToggle').onclick=()=>{body.classList.toggle('theme-dark');$('#themeToggle').textContent=body.classList.contains('theme-dark')?'☀':'☾';localStorage.setItem('win254-theme',body.classList.contains('theme-dark')?'dark':'light')};
  if(localStorage.getItem('win254-theme')==='dark'){$('#themeToggle').click()};
  $('#scrollTop').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
  const revealTargets=document.querySelectorAll('.event-card,.promo-section,.bet-slip');
  revealTargets.forEach((el,i)=>{el.classList.add('reveal');el.style.animationDelay=(i*.06)+'s'});
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in-view')}),{threshold:.1});revealTargets.forEach(el=>observer.observe(el));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('#modal').classList.contains('open'))$('#modal').classList.remove('open');mobile.classList.remove('open');body.classList.remove('menu-open')}});
  document.querySelectorAll('.desktop-nav a').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('.desktop-nav a').forEach(x=>x.classList.remove('active'));a.classList.add('active')}));
})();
