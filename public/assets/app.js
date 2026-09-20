const themeToggle=document.createElement('button');
themeToggle.type='button';
themeToggle.className='theme-toggle no-print';
themeToggle.setAttribute('aria-label','Switch color theme');
themeToggle.innerHTML='<span class="theme-sun" aria-hidden="true">☀</span><span class="theme-moon" aria-hidden="true">☾</span>';
document.body.append(themeToggle);
const languageCloud=document.createElement('aside');
languageCloud.className='language-cloud no-print';
languageCloud.setAttribute('aria-label','Programming technologies');
const languageIcons=[
  ['PHP','PHP','18%','15%','-9deg','1.42'],
  ['JS','JavaScript','66%','22%','7deg','1.5'],
  ['HTML','HTML5','38%','31%','-6deg','1.42'],
  ['Py','Python','76%','40%','11deg','1.4'],
  ['CSS','CSS3','17%','48%','9deg','1.5'],
  ['SQL','MySQL','57%','57%','-7deg','1.48'],
  ['Git','Git','80%','66%','-10deg','1.44'],
  ['Dart','Dart','25%','74%','6deg','1.46'],
  ['◆','Flutter','67%','82%','8deg','1.45'],
  ['Linux','Fedora Linux','28%','91%','-5deg','1.4'],
];
languageIcons.forEach(([icon,label,x,y,rotation,scale],index)=>{
  const item=document.createElement('span');
  item.className='language-icon';
  item.tabIndex=0;
  item.textContent=icon;
  item.title=label;
  item.setAttribute('aria-label',label);
  item.style.setProperty('--cloud-left',x);
  item.style.setProperty('--cloud-top',y);
  item.style.setProperty('--cloud-r',rotation);
  item.style.setProperty('--cloud-scale',scale);
  item.style.setProperty('--cloud-i',String(index));
  languageCloud.append(item);
});
document.body.append(languageCloud);
const dotCanvas=document.createElement('canvas');
dotCanvas.className='cursor-dot-field no-print';
dotCanvas.setAttribute('aria-hidden','true');
document.body.append(dotCanvas);
const dotContext=dotCanvas.getContext('2d');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let dotWidth=0;
let dotHeight=0;
let dotRatio=1;
let pointerX=window.innerWidth*.72;
let pointerY=window.innerHeight*.35;
let smoothX=pointerX;
let smoothY=pointerY;
const resizeDotField=()=>{
  dotRatio=Math.min(window.devicePixelRatio||1,2);
  dotWidth=window.innerWidth;
  dotHeight=window.innerHeight;
  dotCanvas.width=Math.round(dotWidth*dotRatio);
  dotCanvas.height=Math.round(dotHeight*dotRatio);
  dotCanvas.style.width=dotWidth+'px';
  dotCanvas.style.height=dotHeight+'px';
  dotContext?.setTransform(dotRatio,0,0,dotRatio,0,0);
};
const drawDotField=(time=0)=>{
  if(!dotContext)return;
  smoothX+=((pointerX-smoothX)*(reducedMotion?1:.12));
  smoothY+=((pointerY-smoothY)*(reducedMotion?1:.12));
  dotContext.clearRect(0,0,dotWidth,dotHeight);
  const dark=document.documentElement.dataset.theme==='dark';
  const spacing=22;
  const radius=185;
  for(let y=spacing/2;y<dotHeight;y+=spacing){
    for(let x=spacing/2;x<dotWidth;x+=spacing){
      const distance=Math.hypot(x-smoothX,y-smoothY);
      const influence=Math.max(0,1-distance/radius);
      const ripple=reducedMotion?1:(.82+.18*Math.sin(distance*.07-time*.004));
      const size=.85+influence*2.35*ripple;
      const alpha=(dark ? 0.16 : 0.13)+influence*(dark ? 0.22 : 0.2);
      dotContext.beginPath();
      dotContext.fillStyle=dark?`rgba(255,255,255,${alpha})`:`rgba(55,55,55,${alpha})`;
      dotContext.arc(x,y,size,0,Math.PI*2);
      dotContext.fill();
    }
  }
  if(!reducedMotion)requestAnimationFrame(drawDotField);
};
window.addEventListener('resize',resizeDotField);
window.addEventListener('pointermove',(event)=>{pointerX=event.clientX;pointerY=event.clientY},{passive:true});
resizeDotField();
if(reducedMotion)drawDotField();else requestAnimationFrame(drawDotField);
const savedTheme=localStorage.getItem('portfolio-theme');
const preferredTheme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
const setTheme=(theme)=>{
  document.documentElement.dataset.theme=theme;
  themeToggle.setAttribute('aria-label',theme==='dark'?'Switch to light mode':'Switch to dark mode');
  themeToggle.setAttribute('aria-pressed',String(theme==='dark'));
  if(reducedMotion)drawDotField();
};
setTheme(savedTheme||preferredTheme);
themeToggle.addEventListener('click',()=>{
  const nextTheme=document.documentElement.dataset.theme==='dark'?'light':'dark';
  document.documentElement.classList.add('theme-changing');
  setTheme(nextTheme);
  localStorage.setItem('portfolio-theme',nextTheme);
  window.setTimeout(()=>document.documentElement.classList.remove('theme-changing'),550);
});

const button=document.querySelector('#menu-button');const menu=document.querySelector('#mobile-menu');button?.addEventListener('click',()=>{menu?.classList.toggle('hidden');button.setAttribute('aria-expanded',String(!menu?.classList.contains('hidden')))});
const mainNavigation=document.querySelector('.sidebar-nav');
if(mainNavigation&&!mainNavigation.querySelector('a[href*="page=about"], a[href*="page=certificates"]')){
  const certLink=document.createElement('a');
  certLink.href='/?page=about';
  certLink.textContent='Certificates';
  mainNavigation.querySelector('a')?.after(certLink);
}
const activeViewCount=document.querySelector('#active-view-count');
const updateActiveViews=async()=>{
  if(!activeViewCount||document.hidden)return;
  try{
    const response=await fetch('/?page=heartbeat',{cache:'no-store',headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error('heartbeat unavailable');
    const data=await response.json();
    activeViewCount.textContent=Number.isInteger(data.active)?String(data.active):'—';
  }catch{activeViewCount.textContent='—';}
};
updateActiveViews();
window.setInterval(updateActiveViews,30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateActiveViews()});

const profileNameButton=document.querySelector('#profile-name-button');
const profileInfo=document.querySelector('#profile-full-info');
const learningTags=document.querySelector('.profile-intro > .mt-6');
const currentWork=document.querySelector('.current-work');
const profileIntro=document.querySelector('.profile-intro');
if(profileIntro&&profileNameButton){
  const greeting=document.createElement('p');
  greeting.className='editorial-greeting';
  greeting.textContent='Hello';
  profileIntro.prepend(greeting);
}

let profileCloseButton;
let profileBackdrop;
if(profileInfo){
  profileInfo.setAttribute('role','dialog');
  profileInfo.setAttribute('aria-modal','true');
  profileInfo.setAttribute('aria-label','Full profile information');
  const addressValue=document.querySelector('.profile-meta span')?.textContent.trim();
  const infoList=profileInfo.querySelector('dl');
  if(addressValue&&infoList){
    const addressItem=document.createElement('div');
    const addressLabel=document.createElement('dt');
    const addressText=document.createElement('dd');
    addressLabel.textContent='Address';
    addressText.textContent=addressValue;
    addressItem.append(addressLabel,addressText);
    infoList.append(addressItem);
  }
  profileCloseButton=document.createElement('button');
  profileCloseButton.type='button';
  profileCloseButton.className='profile-info-close';
  profileCloseButton.setAttribute('aria-label','Close full information');
  profileCloseButton.textContent='×';
  profileInfo.prepend(profileCloseButton);
  document.body.append(profileInfo);
  profileBackdrop=document.createElement('div');
  profileBackdrop.className='profile-modal-backdrop';
  profileBackdrop.hidden=true;
  document.body.append(profileBackdrop);
}
const setProfileInfoOpen=(willOpen)=>{
  if(!profileInfo||!profileNameButton)return;
  profileNameButton.classList.remove('is-tapped');
  void profileNameButton.offsetWidth;
  profileNameButton.classList.add('is-tapped');
  profileNameButton.setAttribute('aria-expanded',String(willOpen));
  profileNameButton.closest('.profile-name-wrap')?.classList.toggle('is-open',willOpen);
  document.body.classList.toggle('profile-modal-open',willOpen);
  profileInfo.hidden=!willOpen;
  profileInfo.classList.toggle('is-visible',willOpen);
  if(profileBackdrop){
    profileBackdrop.hidden=!willOpen;
    requestAnimationFrame(()=>profileBackdrop?.classList.toggle('is-visible',willOpen));
  }
  if(willOpen)profileCloseButton?.focus();
  else profileNameButton.focus();
};
profileNameButton?.addEventListener('click',()=>setProfileInfoOpen(Boolean(profileInfo?.hidden)));
profileCloseButton?.addEventListener('click',()=>setProfileInfoOpen(false));
profileBackdrop?.addEventListener('click',()=>setProfileInfoOpen(false));
document.addEventListener('keydown',(event)=>{if(event.key==='Escape'&&!profileInfo?.hidden)setProfileInfoOpen(false)});

document.querySelectorAll('.pdf-import-form').forEach((pdfForm)=>{
  const wordForm=pdfForm.cloneNode(true);
  wordForm.classList.add('word-import-form');
  const action=wordForm.querySelector('input[name="action"]');
  const input=wordForm.querySelector('input[type="file"]');
  const label=wordForm.querySelector('label span');
  if(action)action.value='upload_word';
  if(input){input.name='word';input.accept='application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx';}
  if(label)label.textContent='Import Word (.docx)';
  pdfForm.after(wordForm);
});

document.querySelectorAll('.pdf-import-form input[type="file"]').forEach((input)=>{
  input.addEventListener('change',()=>{
    const label=input.closest('label')?.querySelector('span');
    if(label)label.textContent=input.files?.[0]?.name||(input.name==='word'?'Import Word (.docx)':'Import PDF');
  });
});

document.querySelectorAll('a[download]').forEach((link)=>{
  if(link.textContent.trim()!=='Download uploaded Word file')return;
  link.closest('p')?.classList.add('document-download-action');
  link.removeAttribute('href');
  link.removeAttribute('download');
  link.setAttribute('role','button');
  link.setAttribute('tabindex','0');
  link.textContent='Download PDF';
  const savePdf=()=>window.print();
  link.addEventListener('click',savePdf);
  link.addEventListener('keydown',(event)=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();savePdf();}
  });
});

/* ============================================================
   Polaroid photo stack — cycle & lightbox
   ============================================================ */
const CERTS = [
  { src: '/assets/achievements/ai-literacy.pdf#navpanes=1',   label: 'Introduction to AI Literacy and Responsible Use'    },
  { src: '/assets/achievements/cybersecurity.pdf#navpanes=1', label: 'Introduction to Cybersecurity'     },
  { src: '/assets/profile-photo.png',                         label: 'Aimie Villabeto · BSIT Student Developer' }
];
let currentCert = 0;
let isAnimating  = false;

/** Sync info cards highlight to the current front photo */
function syncInfoCards(idx) {
  // Support both old (.achievement-info-card) and new (.ach-item) selectors
  const cards = document.querySelectorAll('.ach-item, .achievement-info-card');
  cards.forEach((card, i) => {
    card.classList.toggle('is-active', i === idx);
  });
  // update dots
  document.querySelectorAll('.polaroid-dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
}

/** Cycle the polaroid stack to show the next photo */
window.cyclePolaroid = function() {
  if (isAnimating) return;
  const front = document.getElementById('polaroidFront');
  const back  = document.getElementById('polaroidBack');
  if (!front || !back) return;

  isAnimating = true;

  // Step 1 — animate front card flying off
  front.classList.add('is-flipping-out');

  // Step 2 — simultaneously bring back card up
  back.classList.add('is-rising');

  // Step 3 — after animation settles, swap roles
  setTimeout(() => {
    // Remove animation classes
    front.classList.remove('is-flipping-out');
    back.classList.remove('is-rising');

    // Swap content (images + captions)
    const nextIdx = (currentCert + 1) % CERTS.length;
    const prevIdx = currentCert;

    // New front shows nextIdx cert
    front.querySelector('.polaroid-img').src = CERTS[nextIdx].src;
    front.querySelector('.polaroid-caption-strip').textContent = CERTS[nextIdx].label;
    front.style.zIndex = '2';
    front.style.transform = 'rotate(-3deg)';

    // New back shows prevIdx (now behind)
    back.querySelector('.polaroid-img').src = CERTS[prevIdx].src;
    back.querySelector('.polaroid-caption-strip').textContent = CERTS[prevIdx].label;
    back.classList.add('is-new-back');
    setTimeout(() => back.classList.remove('is-new-back'), 500);

    currentCert = nextIdx;
    syncInfoCards(currentCert);
    isAnimating = false;
  }, 520);
};

/** Track the currently open cert index in the lightbox */
let openCertIdx = 0;

/** Open full-screen lightbox for a given cert index */
window.openCertModal = function(idx) {
  openCertIdx = idx;
  const cert  = CERTS[idx];
  const lb    = document.getElementById('cert-lightbox');
  const frame = document.getElementById('cert-lightbox-img');
  const title = document.getElementById('cert-lightbox-title');
  if (!lb || !frame) return;
  frame.src = cert.src;
  frame.title = cert.label;
  if (title) title.textContent = cert.label;
  lb.classList.add('is-open');
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // Update nav button visibility (hide prev/next if only 1 cert)
  const nav = document.querySelector('.cert-lightbox-nav');
  if (nav) nav.style.display = CERTS.length > 1 ? 'flex' : 'none';
};

let certNavBusy = false;

/** Navigate to prev (-1) or next (+1) cert inside the lightbox */
window.navigateCert = function(direction) {
  if (certNavBusy) return;
  const total    = CERTS.length;
  // Only navigate through actual certificates (skip profile photo at index 2)
  const certOnly = CERTS.map((_, i) => i).filter(i => i < total - 1);
  const currentPos = certOnly.indexOf(openCertIdx);
  let nextPos = currentPos + direction;
  if (nextPos < 0 || nextPos >= certOnly.length) {
    window.closeCertLightbox();
    return;
  }
  const nextIdx = certOnly[nextPos];
  if (nextIdx === openCertIdx) return;

  certNavBusy = true;
  const inner  = document.querySelector('.cert-lightbox-inner');
  const frame  = document.getElementById('cert-lightbox-img');
  const title  = document.getElementById('cert-lightbox-title');
  const cert   = CERTS[nextIdx];

  // Pick slide directions: going next → slide left; going prev → slide right
  const outClass = direction > 0 ? 'slide-out-left'  : 'slide-out-right';
  const inClass  = direction > 0 ? 'slide-in-left'   : 'slide-in-right';

  // Step 1 — slide out current
  if (inner) inner.classList.add(outClass);

  // Caption fade out
  if (title) { title.style.opacity = '0'; title.style.transform = 'translateY(6px)'; title.style.transition = 'opacity 0.18s ease, transform 0.18s ease'; }

  setTimeout(() => {
    // Step 2 — swap src & remove out class
    if (inner) { inner.classList.remove(outClass); }
    if (frame) { frame.src = cert.src; frame.title = cert.label; }
    openCertIdx = nextIdx;

    // Step 3 — slide in new
    if (inner) inner.classList.add(inClass);

    // Caption fade in
    if (title) {
      title.style.transform = 'translateY(-6px)';
      requestAnimationFrame(() => {
        if (title) { title.textContent = cert.label; title.style.opacity = '1'; title.style.transform = 'translateY(0)'; }
      });
    }

    // Step 4 — clean up after slide-in
    setTimeout(() => {
      if (inner) inner.classList.remove(inClass);
      certNavBusy = false;
    }, 340);
  }, 230);
};

window.closeCertLightbox = function() {
  const lb = document.getElementById('cert-lightbox');
  if (!lb) return;
  lb.classList.remove('is-open');
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  const frame = document.getElementById('cert-lightbox-img');
  if (frame) setTimeout(() => { frame.src = ''; }, 350);
};

document.addEventListener('keydown', function(e) {
  const lb = document.getElementById('cert-lightbox');
  const lightboxOpen = lb && lb.classList.contains('is-open');
  if (e.key === 'Escape') window.closeCertLightbox();
  if (lightboxOpen) {
    if (e.key === 'ArrowRight') window.navigateCert(1);
    if (e.key === 'ArrowLeft')  window.navigateCert(-1);
  } else {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') window.cyclePolaroid();
  }
});

// Init active state on page load
syncInfoCards(0);

