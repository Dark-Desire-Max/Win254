/* Win254 interaction layer: live ticker, theme toggle, mobile nav and scroll reveals. */
(function(){
  const $=s=>document.querySelector(s),body=document.body;
  const ticker=document.createElement('div');ticker.className='live-ticker';ticker.innerHTML='<div class="ticker-track"><span><b>● LIVE</b> Worldwide events and markets</span><span><b>⚡ SPORTS</b> Football · Basketball · Tennis · Cricket</span><span><b>● LIVE</b> Scores update when a provider is connected</span><span><b>⚡ BOOST</b> Demo enhanced selections</span></div>';$('.topbar').after(ticker);
  const mobile=document.createElement('div');mobile.className='mobile-panel';mobile.innerHTML='<a href="#home">Home</a><a href="#sports">Sports</a><a href="#casino">Casino</a><a href="#promotions">Promotions</a>';body.append(mobile);
  $('#menuButton')?.addEventListener('click',()=>{mobile.classList.toggle('open');body.classList.toggle('menu-open')});mobile.querySelectorAll('a').forEach(a=>a.onclick=()=>{mobile.classList.remove('open');body.classList.remove('menu-open')});
  const tools=document.createElement('div');tools.className='floating-tools';tools.innerHTML='<button class="float-button" id="themeToggle" aria-label="Toggle theme">☾</button><button class="float-button" id="scrollTop" aria-label="Back to top">↑</button>';body.append(tools);
  $('#themeToggle').onclick=()=>{body.classList.toggle('theme-dark');$('#themeToggle').textContent=body.classList.contains('theme-dark')?'☀':'☾';localStorage.setItem('win254-theme',body.classList.contains('theme-dark')?'dark':'light')};if(localStorage.getItem('win254-theme')==='dark')$('#themeToggle').click();$('#scrollTop').onclick=()=>scrollTo({top:0,behavior:'smooth'});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){mobile.classList.remove('open');body.classList.remove('menu-open');$('#modal')?.classList.remove('open')}});
  const css=document.createElement('link');css.rel='stylesheet';css.href='worldwide.css';document.head.appendChild(css);const script=document.createElement('script');script.src='worldwide.js';document.body.appendChild(script);
})();
