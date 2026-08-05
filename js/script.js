// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('img');
const lightboxPrev = lightbox.querySelector('.lightbox-prev');
const lightboxNext = lightbox.querySelector('.lightbox-next');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxLabel = document.getElementById('lightbox-label');
const imageGroups = {};
let currentGroup = [];
let currentIndex = 0;

function getImageInfo(img) {
  const expCard = img.closest('.exp-card');
  if (expCard) {
    const name = expCard.querySelector('.exp-body h3')?.textContent || '';
    const role = expCard.querySelector('.exp-tag')?.textContent || '';
    return `${role} — ${name}`;
  }
  const eduCard = img.closest('.edu-card');
  if (eduCard) {
    const name = eduCard.querySelector('.edu-info h3')?.textContent || '';
    return name;
  }
  const certCard = img.closest('.cert-card');
  if (certCard) {
    const name = certCard.querySelector('.cert-body h3')?.textContent || '';
    return name;
  }
  return '';
}

function getImageGroup(img) {
  if (img.closest('.hero-photo')) return 'hero';
  if (img.closest('.edu-card')) return 'education';
  if (img.closest('.exp-card')) return 'experience';
  if (img.closest('.cert-card')) return 'certificate';
  return 'other';
}

function getGroupLabel(img) {
  if (img.closest('.hero-photo')) return 'FOTO PROFIL';
  if (img.closest('#organization')) return 'PENGALAMAN ORGANISASI';
  if (img.closest('#committee')) return 'PENGALAMAN KEPANITIAAN';
  if (img.closest('.edu-card')) return 'PENDIDIKAN';
  if (img.closest('.cert-card')) return 'SERTIFIKAT';
  return '';
}

function updateLightbox() {
  resetZoom();
  const img = currentGroup[currentIndex];
  lightboxImg.src = img.src;
  const info = getImageInfo(img);
  lightboxCaption.textContent = info;
  lightboxCaption.style.display = info ? 'block' : 'none';
  lightboxPrev.style.display = currentGroup.length > 1 ? '' : 'none';
  lightboxNext.style.display = currentGroup.length > 1 ? '' : 'none';
  lightboxLabel.textContent = getGroupLabel(img);
}

function openLightbox(index, group) {
  currentGroup = group;
  currentIndex = index;
  updateLightbox();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function prevImage() {
  currentIndex = (currentIndex - 1 + currentGroup.length) % currentGroup.length;
  updateLightbox();
}

function nextImage() {
  currentIndex = (currentIndex + 1) % currentGroup.length;
  updateLightbox();
}

const allImages = document.querySelectorAll('.exp-photo img, .cert-photo img, .edu-photo img, .hero-photo img');

allImages.forEach(img => {
  const group = getImageGroup(img);
  if (!imageGroups[group]) imageGroups[group] = [];
  imageGroups[group].push(img);
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', (e) => {
    e.stopPropagation();
    const groupImages = imageGroups[group];
    const idx = groupImages.indexOf(img);
    openLightbox(idx, groupImages);
  });
});

lightboxPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  prevImage();
});

lightboxNext.addEventListener('click', (e) => {
  e.stopPropagation();
  nextImage();
});

lightbox.addEventListener('click', closeLightbox);

setTimeout(function() {
  var els = document.querySelectorAll('#hero .hero-text > *, .hero-photo-wrapper');
  for (var i = 0; i < els.length; i++) {
    els[i].style.animation = 'none';
    els[i].style.opacity = '1';
  }
}, 1800);

var zoomLevel = 1;
var panX = 0, panY = 0;
var isDragging = false, wasDragged = false, dragStartX = 0, dragStartY = 0, basePanX = 0, basePanY = 0;

function resetZoom() {
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  lightboxImg.style.transform = '';
}

function clampPan() {
  var vw = lightbox.clientWidth || window.innerWidth;
  var vh = lightbox.clientHeight || window.innerHeight;
  var bw = lightboxImg.offsetWidth;
  var bh = lightboxImg.offsetHeight;
  if (!bw || !bh) { panX = 0; panY = 0; return; }
  var maxX = Math.max(0, (bw * zoomLevel - vw) / 2);
  var maxY = Math.max(0, (bh * zoomLevel - vh) / 2);
  panX = Math.max(-maxX, Math.min(maxX, panX));
  panY = Math.max(-maxY, Math.min(maxY, panY));
}

function applyZoom() {
  if (zoomLevel < 1.1) { resetZoom(); return; }
  clampPan();
  lightboxImg.style.transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + zoomLevel + ')';
}

lightboxImg.addEventListener('click', function(e) {
  if (wasDragged) { wasDragged = false; return; }
  e.stopPropagation();
  if (zoomLevel > 1) { resetZoom(); }
  else { zoomLevel = 2; applyZoom(); }
});

lightboxImg.addEventListener('wheel', function(e) {
  e.preventDefault();
  var prev = zoomLevel;
  if (e.deltaY < 0) zoomLevel = Math.min(5, zoomLevel + 0.25);
  else zoomLevel = Math.max(1, zoomLevel - 0.25);
  if (zoomLevel !== prev) applyZoom();
}, { passive: false });

lightboxImg.addEventListener('mousedown', function(e) {
  if (zoomLevel <= 1 || e.button !== 2) return;
  isDragging = true;
  wasDragged = false;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  basePanX = panX;
  basePanY = panY;
  lightboxImg.style.cursor = 'grabbing';
});

lightboxImg.addEventListener('contextmenu', function(e) {
  if (zoomLevel > 1) e.preventDefault();
});

lightboxImg.addEventListener('load', function() {
  if (lightbox.classList.contains('active') && zoomLevel > 1) applyZoom();
});

lightbox.addEventListener('wheel', function(e) {
  e.preventDefault();
}, { passive: false });

document.addEventListener('mousemove', function(e) {
  if (!isDragging) return;
  var dx = e.clientX - dragStartX;
  var dy = e.clientY - dragStartY;
  if (!wasDragged && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) wasDragged = true;
  if (!wasDragged) return;
  panX = basePanX + dx;
  panY = basePanY + dy;
  applyZoom();
});

document.addEventListener('mouseup', function() {
  if (!isDragging) return;
  isDragging = false;
  lightboxImg.style.cursor = '';
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') prevImage();
  if (e.key === 'ArrowRight') nextImage();
});

// Navbar Toggle
const toggle = document.getElementById('nav-toggle');
const menu = document.getElementById('nav-menu');

toggle.addEventListener('click', () => {
  menu.classList.toggle('active');
});

// Tutup menu saat link diklik (mobile)
document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.remove('active');
  });
});

// Highlight active nav link saat scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-menu a');

const sectionToNav = {
  'hero': '#about',
  'about': '#about',
  'education': '#about',
  'organization': '#organization',
  'committee': '#organization',
  'projects': '#projects',
  'skills': '#skills',
  'certificates': '#skills',
  'contact': '#contact'
};

function updateActiveNav() {
  let current = '';
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 100) {
      current = section.getAttribute('id');
    }
  });
  const target = sectionToNav[current] || '';
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === target);
  });
}

window.addEventListener('scroll', updateActiveNav);
window.addEventListener('load', updateActiveNav);
updateActiveNav();

// Scroll Reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));