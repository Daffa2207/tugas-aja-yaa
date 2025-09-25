/* toggle.js - sidebar, products, lightbox (final) */

/* --- Sidebar toggle & overlay --- */
const btn = document.getElementById('btnBurger');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

if(btn){
  btn.addEventListener('click', () => {
    if (window.innerWidth <= 900) {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
      btn.classList.toggle('expanded');
    } else {
      sidebar.classList.toggle('collapsed');
      btn.classList.toggle('expanded');
    }
  });
}
if(overlay){
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    btn && btn.classList.remove('expanded');
  });
}

/* --- active menu highlight --- */
(function setActiveMenu(){
  const items = document.querySelectorAll('.menu-item');
  const path = window.location.pathname.split('/').pop() || 'index.html';
  items.forEach(a => a.classList.toggle('active', a.getAttribute('href')===path));
})();

/* --- sidebar product toggle (collapse list) --- */
(function sidebarProductToggle(){
  const prodToggle = document.getElementById('prodToggle');
  const prodList = document.getElementById('prodList');
  if(!prodToggle || !prodList) return;
  prodToggle.addEventListener('click', () => {
    const isHidden = prodList.style.display === 'none';
    prodList.style.display = isHidden ? 'grid' : 'none';
    prodToggle.textContent = isHidden ? '▾' : '▸';
    prodToggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
  });
})();

/* --- LIGHTBOX: handles open/close/prev/next and 'openLightboxAt' event --- */
(function lightboxInit(){
  const lb = document.getElementById('lightbox');
  const lbImg = lb ? document.getElementById('lb-img') : null;
  const closeBtn = document.querySelector('.lb-close');
  const prevBtn = document.querySelector('.lb-prev');
  const nextBtn = document.querySelector('.lb-next');

  if(!lb || !lbImg) return;

  // build images array from product-grid + sidebar thumbnails (in order)
  function gatherImgs(){
    const arr = [];
    // prefer main grid first
    document.querySelectorAll('.product-card img').forEach(img => {
      const s = img.getAttribute('src');
      if(s && !arr.includes(s)) arr.push(s);
    });
    // then sidebar small thumbs
    document.querySelectorAll('.prod-item img').forEach(img => {
      const s = img.getAttribute('src');
      if(s && !arr.includes(s)) arr.push(s);
    });
    return arr;
  }

  let imgs = gatherImgs();
  let current = 0;

  function openAt(index){
    imgs = gatherImgs();
    current = Math.max(0, Math.min(imgs.length - 1, index || 0));
    lbImg.src = imgs[current] || '';
    lb.classList.remove('hidden');
    lb.setAttribute('aria-hidden','false');
    // show overlay on small screens too
    document.body.style.overflow = 'hidden';
    // store in window for other functions if needed
    window.__lightbox_imgs = imgs;
    window.__lightbox_current = current;
  }

  function closeLB(){
    lb.classList.add('hidden');
    lb.setAttribute('aria-hidden','true');
    lbImg.src = '';
    document.body.style.overflow = '';
  }

  function prev(){
    imgs = gatherImgs();
    current = (current - 1 + imgs.length) % imgs.length;
    lbImg.src = imgs[current];
    window.__lightbox_current = current;
  }

  function next(){
    imgs = gatherImgs();
    current = (current + 1) % imgs.length;
    lbImg.src = imgs[current];
    window.__lightbox_current = current;
  }

  // event listeners for controls
  closeBtn && closeBtn.addEventListener('click', closeLB);
  prevBtn && prevBtn.addEventListener('click', prev);
  nextBtn && nextBtn.addEventListener('click', next);

  // keyboard nav
  document.addEventListener('keydown', e=>{
    if(lb.classList.contains('hidden')) return;
    if(e.key === 'Escape') closeLB();
    if(e.key === 'ArrowLeft') prev();
    if(e.key === 'ArrowRight') next();
  });

  // click outside image closes
  lb.addEventListener('click', e=>{
    if(e.target === lb) closeLB();
  });

  // click on product thumbnails in main grid
  document.querySelectorAll('.product-card img').forEach(imgEl=>{
    imgEl.addEventListener('click', ()=>{
      const idx = Number(imgEl.dataset.index) - 1;
      openAt(isNaN(idx) ? 0 : idx);
    });
  });

  // support custom event: openLightboxAt
  window.addEventListener('openLightboxAt', function(e){
    const idx = (e && e.detail && typeof e.detail.index === 'number') ? e.detail.index : 0;
    openAt(idx);
  });

  // also check URL param p on load (useful when navigated from sidebar links)
  (function openFromQuery(){
    const params = new URLSearchParams(window.location.search);
    const p = params.get('p');
    if(!p) return;
    window.addEventListener('DOMContentLoaded', () => {
      const index = Math.max(0, Number(p) - 1);
      // small timeout to ensure images collected
      setTimeout(()=> window.dispatchEvent(new CustomEvent('openLightboxAt', { detail: { index } })), 80);
    });
  })();

})();
