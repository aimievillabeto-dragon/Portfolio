// Theme initialization
const savedTheme = localStorage.getItem('portfolio-theme');
const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
document.documentElement.dataset.theme = savedTheme || preferredTheme;

// Mobile menu toggle
const button = document.querySelector('#menu-button');
const menu = document.querySelector('#mobile-menu');
button?.addEventListener('click', () => {
  menu?.classList.toggle('hidden');
  button.setAttribute('aria-expanded', String(!menu?.classList.contains('hidden')));
});

// Sidebar navigation link check
const mainNavigation = document.querySelector('.sidebar-nav');
if (mainNavigation && !mainNavigation.querySelector('a[href*="page=about"], a[href*="page=certificates"]')) {
  const certLink = document.createElement('a');
  certLink.href = '/?page=about';
  certLink.textContent = 'Certificates';
  mainNavigation.querySelector('a')?.after(certLink);
}

// Active viewers counter (deferred to idle time so it doesn't block load)
const activeViewCount = document.querySelector('#active-view-count');
const updateActiveViews = async () => {
  if (!activeViewCount || document.hidden) return;
  try {
    const response = await fetch('/?page=heartbeat', { cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('heartbeat unavailable');
    const data = await response.json();
    activeViewCount.textContent = Number.isInteger(data.active) ? String(data.active) : '—';
  } catch {
    activeViewCount.textContent = '—';
  }
};
if (activeViewCount) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => updateActiveViews(), { timeout: 4000 });
  } else {
    setTimeout(updateActiveViews, 3000);
  }
  window.setInterval(updateActiveViews, 45000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateActiveViews();
  });
}

// Profile full information modal
const profileNameButton = document.querySelector('#profile-name-button');
const profileInfo = document.querySelector('#profile-full-info');
const profileIntro = document.querySelector('.profile-intro');
if (profileIntro && profileNameButton && !profileIntro.querySelector('.editorial-greeting')) {
  const greeting = document.createElement('p');
  greeting.className = 'editorial-greeting';
  greeting.textContent = 'Hello';
  profileIntro.prepend(greeting);
}

let profileCloseButton;
let profileBackdrop;
if (profileInfo) {
  profileInfo.setAttribute('role', 'dialog');
  profileInfo.setAttribute('aria-modal', 'true');
  profileInfo.setAttribute('aria-label', 'Full profile information');

  const infoList = profileInfo.querySelector('dl');
  if (infoList && !infoList.textContent.includes('Address')) {
    const addressValue = document.querySelector('.profile-meta span')?.textContent.trim();
    if (addressValue) {
      const addressItem = document.createElement('div');
      const addressLabel = document.createElement('dt');
      const addressText = document.createElement('dd');
      addressLabel.textContent = 'Address';
      addressText.textContent = addressValue;
      addressItem.append(addressLabel, addressText);
      infoList.append(addressItem);
    }
  }

  profileCloseButton = document.createElement('button');
  profileCloseButton.type = 'button';
  profileCloseButton.className = 'profile-info-close';
  profileCloseButton.setAttribute('aria-label', 'Close full information');
  profileCloseButton.textContent = '×';
  profileInfo.prepend(profileCloseButton);

  profileBackdrop = document.createElement('div');
  profileBackdrop.className = 'profile-modal-backdrop';
  profileBackdrop.hidden = true;

  const modalFrag = document.createDocumentFragment();
  modalFrag.append(profileInfo, profileBackdrop);
  document.body.append(modalFrag);
}

const setProfileInfoOpen = (willOpen) => {
  if (!profileInfo || !profileNameButton) return;
  profileNameButton.classList.remove('is-tapped');
  requestAnimationFrame(() => {
    profileNameButton.classList.add('is-tapped');
  });

  profileNameButton.setAttribute('aria-expanded', String(willOpen));
  profileNameButton.closest('.profile-name-wrap')?.classList.toggle('is-open', willOpen);
  document.body.classList.toggle('profile-modal-open', willOpen);
  profileInfo.hidden = !willOpen;
  profileInfo.classList.toggle('is-visible', willOpen);
  if (profileBackdrop) {
    profileBackdrop.hidden = !willOpen;
    requestAnimationFrame(() => profileBackdrop?.classList.toggle('is-visible', willOpen));
  }
  if (willOpen) profileCloseButton?.focus();
  else profileNameButton.focus();
};
profileNameButton?.addEventListener('click', () => setProfileInfoOpen(Boolean(profileInfo?.hidden)));
profileCloseButton?.addEventListener('click', () => setProfileInfoOpen(false));
profileBackdrop?.addEventListener('click', () => setProfileInfoOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !profileInfo?.hidden) setProfileInfoOpen(false);
});

// Admin Word/PDF forms
const pdfForms = document.querySelectorAll('.pdf-import-form');
if (pdfForms.length) {
  pdfForms.forEach((pdfForm) => {
    const wordForm = pdfForm.cloneNode(true);
    wordForm.classList.add('word-import-form');
    const action = wordForm.querySelector('input[name="action"]');
    const input = wordForm.querySelector('input[type="file"]');
    const label = wordForm.querySelector('label span');
    if (action) action.value = 'upload_word';
    if (input) {
      input.name = 'word';
      input.accept = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx';
    }
    if (label) label.textContent = 'Import Word (.docx)';
    pdfForm.after(wordForm);
  });

  document.querySelectorAll('.pdf-import-form input[type="file"]').forEach((input) => {
    input.addEventListener('change', () => {
      const label = input.closest('label')?.querySelector('span');
      if (label) label.textContent = input.files?.[0]?.name || (input.name === 'word' ? 'Import Word (.docx)' : 'Import PDF');
    });
  });
}

// PDF print handler for Word download links
const downloadLinks = Array.from(document.querySelectorAll('a[download]')).filter(
  link => link.textContent.trim() === 'Download uploaded Word file'
);
if (downloadLinks.length) {
  const savePdf = () => window.print();
  downloadLinks.forEach((link) => {
    link.closest('p')?.classList.add('document-download-action');
    link.removeAttribute('href');
    link.removeAttribute('download');
    link.setAttribute('role', 'button');
    link.setAttribute('tabindex', '0');
    link.textContent = 'Download PDF';
    link.addEventListener('click', savePdf);
    link.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        savePdf();
      }
    });
  });
}

/* ============================================================
   Certificates Stack & Lightbox
   ============================================================ */
const CERTS = [
  { src: '/assets/achievements/ai-literacy.pdf#navpanes=1',   label: 'Introduction to AI Literacy and Responsible Use' },
  { src: '/assets/achievements/cybersecurity.pdf#navpanes=1', label: 'Introduction to Cybersecurity' },
  { src: '/assets/achievements/ai-power-user.pdf#navpanes=1', label: 'AI Power User Launchpad' },
  { src: '/assets/achievements/soft-skills-seminar.pdf#navpanes=1', label: 'Soft Skills Seminar' },
  { src: '/assets/achievements/cloud-computing-microsoft.pdf#navpanes=1', label: 'Building Your IT Career: Opportunities in Cloud Computing and Microsoft Technologies' },
  { src: '/assets/profile-photo.webp',                        label: 'Aimie Villabeto · BSIT Student Developer' }
];
let currentCert = 0;
let isAnimating  = false;

function syncInfoCards(idx) {
  const cards = document.querySelectorAll('.ach-item, .achievement-info-card');
  const dots  = document.querySelectorAll('.polaroid-dot');
  if (!cards.length && !dots.length) return;
  cards.forEach((card, i) => {
    card.classList.toggle('is-active', i === idx);
  });
  dots.forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
}

window.cyclePolaroid = function() {
  if (isAnimating) return;
  const front = document.getElementById('polaroidFront');
  const back  = document.getElementById('polaroidBack');
  if (!front || !back) return;

  isAnimating = true;
  front.classList.add('is-flipping-out');
  back.classList.add('is-rising');

  setTimeout(() => {
    front.classList.remove('is-flipping-out');
    back.classList.remove('is-rising');

    const nextIdx = (currentCert + 1) % CERTS.length;
    const prevIdx = currentCert;

    front.querySelector('.polaroid-img').src = CERTS[nextIdx].src;
    front.querySelector('.polaroid-caption-strip').textContent = CERTS[nextIdx].label;
    front.style.zIndex = '2';
    front.style.transform = 'rotate(-3deg)';

    back.querySelector('.polaroid-img').src = CERTS[prevIdx].src;
    back.querySelector('.polaroid-caption-strip').textContent = CERTS[prevIdx].label;
    back.classList.add('is-new-back');
    setTimeout(() => back.classList.remove('is-new-back'), 500);

    currentCert = nextIdx;
    syncInfoCards(currentCert);
    isAnimating = false;
  }, 520);
};

let openCertIdx = 0;

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
  const nav = document.querySelector('.cert-lightbox-nav');
  if (nav) nav.style.display = CERTS.length > 1 ? 'flex' : 'none';
};

let certNavBusy = false;

window.navigateCert = function(direction) {
  if (certNavBusy) return;
  const total    = CERTS.length;
  const certOnly = CERTS.map((_, i) => i).filter(i => i < total - 1);
  const currentPos = certOnly.indexOf(openCertIdx);
  let nextPos = currentPos + direction;
  if (nextPos < 0) nextPos = certOnly.length - 1;
  if (nextPos >= certOnly.length) nextPos = 0;
  const nextIdx = certOnly[nextPos];
  if (nextIdx === openCertIdx) return;

  certNavBusy = true;
  const inner  = document.querySelector('.cert-lightbox-inner');
  const frame  = document.getElementById('cert-lightbox-img');
  const title  = document.getElementById('cert-lightbox-title');
  const cert   = CERTS[nextIdx];

  const outClass = direction > 0 ? 'slide-out-left'  : 'slide-out-right';
  const inClass  = direction > 0 ? 'slide-in-left'   : 'slide-in-right';

  if (inner) inner.classList.add(outClass);
  if (title) {
    title.style.opacity = '0';
    title.style.transform = 'translateY(6px)';
    title.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
  }

  setTimeout(() => {
    if (inner) inner.classList.remove(outClass);
    if (frame) {
      frame.src = cert.src;
      frame.title = cert.label;
    }
    openCertIdx = nextIdx;
    if (inner) inner.classList.add(inClass);

    if (title) {
      title.style.transform = 'translateY(-6px)';
      requestAnimationFrame(() => {
        title.textContent = cert.label;
        title.style.opacity = '1';
        title.style.transform = 'translateY(0)';
      });
    }

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

if (document.querySelector('.ach-item, .achievement-info-card, .polaroid-dot')) {
  syncInfoCards(0);
}
