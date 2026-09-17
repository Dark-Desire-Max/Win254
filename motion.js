/* Win254 interaction polish. All casino and wallet actions remain demo-only. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animateVisible = (element) => { if (!element || reduce) return; element.classList.add('reveal'); requestAnimationFrame(() => element.classList.add('in-view')); };
  const ripple = (event) => {
    const button = event.currentTarget; if (reduce || button.disabled) return;
    const rect = button.getBoundingClientRect(); const size = Math.max(rect.width, rect.height);
    const wave = document.createElement('span'); wave.className='ripple'; wave.style.width=`${size}px`; wave.style.height=`${size}px`;
    wave.style.left=`${event.clientX-rect.left-size/2}px`; wave.style.top=`${event.clientY-rect.top-size/2}px`; button.append(wave); wave.addEventListener('animationend',()=>wave.remove());
  };
  const enhance = (root=document) => {
    root.querySelectorAll('button:not([data-motion-ready])').forEach(button=>{button.dataset.motionReady='true';button.addEventListener('pointerdown',ripple)});
    root.querySelectorAll('.event-card,.casino-card,.promo-card,.account-dialog,.wallet-balance,.account-stats>div').forEach(animateVisible);
  };
  enhance();
  const observer = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => { if(node.nodeType===1) enhance(node); })));
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('pointermove',event=>{
    if (reduce) return; const card=event.target.closest('.casino-card,.promo-card'); if(!card) return;
    const rect=card.getBoundingClientRect(); const x=(event.clientX-rect.left)/rect.width-.5; const y=(event.clientY-rect.top)/rect.height-.5;
    card.style.transform=`perspective(800px) rotateX(${y*-3}deg) rotateY(${x*3}deg) translateY(-7px)`;
  });
  document.addEventListener('pointerout',event=>{const card=event.target.closest('.casino-card,.promo-card');if(card&&!card.contains(event.relatedTarget))card.style.transform='';});
})();
