// ===== 🔐 LOVE LOCK MINI-GAME =====
const loveLock = document.getElementById('loveLock');
const lockStage1 = document.getElementById('lockStage1');
const lockStage2 = document.getElementById('lockStage2');
const lockStage3 = document.getElementById('lockStage3');
const lockGameArea = document.getElementById('lockGameArea');
const lockCounter = document.getElementById('lockCounter');
const lockProgressFill = document.getElementById('lockProgressFill');
const lockHint = document.getElementById('lockHint');
const lockHearts = document.getElementById('lockHearts');

let lockScore = 0;
const lockTarget = 10;
const goodItems = ['💕', '🌸', '🐱', '💖', '🌷', '⚜️', '💗', '🐾'];
const badItems = ['❌', '💀', '👎', '🗑️', '💩', '😾', '🪳', '🧄'];
let gameActive = true;
let gameInterval = null;

function playBuzzerSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(80, audioCtx.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch(e) {}
}

// ===== STAGE 1: MINI-GAME =====
function spawnLockItem() {
  if (!gameActive) return;
  const existingItems = lockGameArea.querySelectorAll('.lock-item');
  if (existingItems.length >= 6) existingItems[0].remove();
  
  const item = document.createElement('span');
  item.classList.add('lock-item');
  const isGood = Math.random() < 0.7;
  const pool = isGood ? goodItems : badItems;
  item.textContent = pool[Math.floor(Math.random() * pool.length)];
  item.dataset.good = isGood ? 'true' : 'false';
  
  const areaRect = lockGameArea.getBoundingClientRect();
  const x = Math.random() * (areaRect.width - 50);
  const y = Math.random() * (areaRect.height - 50);
  item.style.left = x + 'px';
  item.style.top = y + 'px';
  
  item.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!gameActive) return;
    if (item.dataset.good === 'true') {
      lockScore++;
      lockCounter.textContent = lockScore + ' / ' + lockTarget;
      lockProgressFill.style.width = (lockScore / lockTarget * 100) + '%';
      const filledHearts = Math.min(Math.floor(lockScore / 2), 5);
      lockHearts.textContent = '❤️'.repeat(filledHearts) + '🤍'.repeat(5 - filledHearts);
      createLockSparkle(item);
      item.remove();
      if (lockScore >= lockTarget) goToStage2();
    } else {
      item.classList.add('wrong');
      lockHint.textContent = 'Oops! Not that one! Try again 💕';
      lockHint.style.color = '#d4a5a5';
      setTimeout(() => {
        lockHint.textContent = 'Tap the 💕 🌸 🐱 but avoid the ❌';
        lockHint.style.color = '#8b7b7b';
      }, 1500);
      setTimeout(() => item.remove(), 400);
    }
  });
  
  item.addEventListener('touchend', function(e) {
    e.stopPropagation();
    e.preventDefault();
    item.click();
  });
  
  lockGameArea.appendChild(item);
  setTimeout(() => { if (item.parentNode) item.remove(); }, 2500);
}

function createLockSparkle(item) {
  const rect = item.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < 8; i++) {
    const sparkle = document.createElement('span');
    sparkle.textContent = '✨';
    sparkle.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;font-size:0.8rem;pointer-events:none;z-index:10001;transition:all 0.7s ease-out;opacity:1;`;
    document.body.appendChild(sparkle);
    const angle = (Math.PI * 2 * i) / 8;
    const distance = 30 + Math.random() * 20;
    requestAnimationFrame(() => {
      sparkle.style.transform = `translate(${Math.cos(angle)*distance}px,${Math.sin(angle)*distance}px) scale(0)`;
      sparkle.style.opacity = '0';
    });
    setTimeout(() => sparkle.remove(), 700);
  }
}

function goToStage2() {
  gameActive = false;
  if (gameInterval) clearInterval(gameInterval);
  lockGameArea.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;animation:popIn 0.5s ease;">✅</div>';
  setTimeout(() => {
    lockStage1.style.display = 'none';
    lockStage2.style.display = 'block';
    initStage2();
  }, 1000);
}

gameInterval = setInterval(spawnLockItem, 1200);
for (let i = 0; i < 4; i++) { setTimeout(spawnLockItem, i * 300); }
lockGameArea.addEventListener('click', spawnLockItem);

// ===== STAGE 2: ARE YOU MY GIRLFRIEND? =====
let noClickCount = 0;
const noMessages = ["hey! that's not very nice 😾","stop that! >:(","BAMBI WHY 😭","you're being mean to me... 💔","okay seriously stop","😿😿😿","i'm telling on you","LAST WARNING 🔴"];

function initStage2() {
  const gfBtnYes = document.getElementById('gfBtnYes');
  const gfBtnNo = document.getElementById('gfBtnNo');
  const gfHint = document.getElementById('gfHint');
  const gfButtons = document.getElementById('gfButtons');
  const explosionParticles = document.getElementById('explosionParticles');
  
  gfBtnYes.addEventListener('click', function() {
    gfHint.textContent = "That's right! 💖";
    gfHint.style.color = '#b88a8a';
    gfBtnYes.style.transform = 'scale(1.2)';
    setTimeout(() => {
      lockStage2.style.display = 'none';
      lockStage3.style.display = 'block';
      initStage3();
    }, 1000);
  });
  
  gfBtnNo.addEventListener('click', function(e) {
    noClickCount++;
    if (noClickCount === 1) {
      gfBtnNo.classList.add('fleeing');
      const btnRect = gfBtnNo.getBoundingClientRect();
      const containerRect = gfButtons.getBoundingClientRect();
      let newX = Math.random() * (containerRect.width - btnRect.width);
      let newY = Math.random() * (containerRect.height - btnRect.height);
      gfBtnNo.style.position = 'absolute';
      gfBtnNo.style.left = newX + 'px';
      gfBtnNo.style.top = newY + 'px';
      gfHint.textContent = 'Nice try... 😏';
      gfHint.style.color = '#c9a98b';
    } else if (noClickCount === 2) {
      const btnRect = gfBtnNo.getBoundingClientRect();
      const containerRect = gfButtons.getBoundingClientRect();
      let newX = Math.random() * (containerRect.width - btnRect.width);
      let newY = Math.random() * (containerRect.height - btnRect.height);
      gfBtnNo.style.left = newX + 'px';
      gfBtnNo.style.top = newY + 'px';
      playBuzzerSound();
      gfHint.textContent = noMessages[0];
      gfHint.style.color = '#d4a5a5';
    } else if (noClickCount === 3) {
      playBuzzerSound();
      createExplosion(gfBtnNo, explosionParticles);
      gfBtnNo.classList.add('exploding');
      gfHint.textContent = '💥 BOOM! Only YES remains! 💖';
      gfHint.style.color = '#d4a5a5';
      setTimeout(() => { gfBtnNo.style.display = 'none'; }, 600);
    } else {
      playBuzzerSound();
      gfHint.textContent = noMessages[Math.min(noClickCount - 3, noMessages.length - 1)];
    }
  });
  
  gfBtnNo.addEventListener('touchend', function(e) { e.preventDefault(); gfBtnNo.click(); });
}

function createExplosion(btn, container) {
  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const particles = ['💥','💢','💣','🔥','⚡','💨','❗','❌','✖️','💔'];
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('span');
    particle.classList.add('explosion-particle');
    particle.textContent = particles[Math.floor(Math.random() * particles.length)];
    particle.style.left = cx + 'px';
    particle.style.top = cy + 'px';
    particle.style.setProperty('--dx', (Math.random() - 0.5) * 200 + 'px');
    particle.style.setProperty('--dy', (Math.random() - 0.5) * 200 + 'px');
    container.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
  }
}

// ===== STAGE 3: PASSWORD =====
function initStage3() {
  const passwordInput = document.getElementById('passwordInput');
  const passwordSubmit = document.getElementById('passwordSubmit');
  const pwHint = document.getElementById('pwHint');
  const correctPassword = 'k1tty@nd6unny';
  
  function checkPassword() {
    const entered = passwordInput.value.trim();
    if (entered === correctPassword) {
      pwHint.textContent = 'Welcome home, Bambi! 💕🌸';
      pwHint.style.color = '#b88a8a';
      passwordInput.classList.remove('wrong');
      passwordInput.style.borderColor = '#c9a98b';
      passwordInput.style.background = '#fafff5';
      setTimeout(() => { loveLock.classList.add('unlocked'); }, 800);
      setTimeout(() => { loveLock.style.display = 'none'; }, 1800);
    } else {
      passwordInput.classList.add('wrong');
      pwHint.textContent = 'Nope! Try again... hint: 🐱 & 🐰';
      pwHint.style.color = '#d4a5a5';
      playBuzzerSound();
      setTimeout(() => { passwordInput.classList.remove('wrong'); }, 500);
      passwordInput.value = '';
      passwordInput.focus();
    }
  }
  
  passwordSubmit.addEventListener('click', checkPassword);
  passwordInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') checkPassword(); });
  setTimeout(() => passwordInput.focus(), 500);
}

// ===== COUNTDOWN TIMER =====
function updateCountdown() {
  const targetDate = new Date('October 24, 2026 00:00:00').getTime();
  const now = new Date().getTime();
  const difference = targetDate - now;

  if (difference < 0) {
    document.getElementById('days').textContent = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
    return;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ===== ENVELOPE / LOVE LETTER ANIMATION =====
const envelope = document.getElementById('envelope');
const letterPaper = document.getElementById('letterPaper');

envelope.addEventListener('click', function() {
  envelope.classList.add('opened');
  setTimeout(() => {
    letterPaper.classList.add('visible');
  }, 500);
});

letterPaper.addEventListener('click', function(e) {
  if (letterPaper.classList.contains('visible')) {
    letterPaper.classList.remove('visible');
    setTimeout(() => {
      envelope.classList.remove('opened');
    }, 600);
  }
});

// ===== GALLERY LIGHTBOX =====
const polaroids = document.querySelectorAll('.polaroid');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');

let currentImageIndex = 0;
const galleryImages = Array.from(polaroids).map(p => p.getAttribute('data-src'));

polaroids.forEach((polaroid, index) => {
  polaroid.addEventListener('click', function() {
    currentImageIndex = index;
    openLightbox(galleryImages[currentImageIndex]);
  });
});

function openLightbox(src) {
  lightbox.classList.add('active');
  lightboxImg.src = src;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function showNext() {
  currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
  lightboxImg.style.opacity = '0';
  setTimeout(() => {
    lightboxImg.src = galleryImages[currentImageIndex];
    lightboxImg.style.opacity = '1';
  }, 200);
}

function showPrev() {
  currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
  lightboxImg.style.opacity = '0';
  setTimeout(() => {
    lightboxImg.src = galleryImages[currentImageIndex];
    lightboxImg.style.opacity = '1';
  }, 200);
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxNext.addEventListener('click', showNext);
lightboxPrev.addEventListener('click', showPrev);

lightbox.addEventListener('click', function(e) {
  if (e.target === lightbox) closeLightbox();
});

let touchStartX = 0;
let touchEndX = 0;

lightbox.addEventListener('touchstart', function(e) {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox.addEventListener('touchend', function(e) {
  touchEndX = e.changedTouches[0].screenX;
  const swipeDistance = touchStartX - touchEndX;
  if (Math.abs(swipeDistance) > 50) {
    if (swipeDistance > 0) showNext();
    else showPrev();
  }
});

document.addEventListener('keydown', function(e) {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') showNext();
  if (e.key === 'ArrowLeft') showPrev();
});

lightboxImg.style.transition = 'opacity 0.2s ease';

// ===== FLOATING PETALS =====
const petalsContainer = document.getElementById('petalsContainer');
const petalEmojis = ['🌸', '💮', '🌷', '⚜️', '🌺', '💐', '🏵️'];

function createPetal() {
  const petal = document.createElement('span');
  petal.classList.add('petal');
  petal.textContent = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
  petal.style.left = Math.random() * 100 + '%';
  petal.style.fontSize = (Math.random() * 1.2 + 1) + 'rem';
  petal.style.opacity = Math.random() * 0.4 + 0.2;
  petal.style.animationDuration = (Math.random() * 10 + 10) + 's';
  petal.style.animationDelay = Math.random() * 5 + 's';
  petalsContainer.appendChild(petal);
  setTimeout(() => petal.remove(), 20000);
}

for (let i = 0; i < 12; i++) {
  setTimeout(createPetal, Math.random() * 5000);
}
setInterval(createPetal, 3000);

// ===== SCROLL REVEAL ANIMATIONS =====
const revealElements = document.querySelectorAll('.reveal');

function checkReveal() {
  const windowHeight = window.innerHeight;
  const revealPoint = 120;
  revealElements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    if (elementTop < windowHeight - revealPoint) {
      element.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', checkReveal);
window.addEventListener('load', checkReveal);

// ===== HEART CLICK EASTER EGG =====
let heartClicks = 0;
const heartTracker = document.getElementById('heartTracker');
const heartCount = document.getElementById('heartCount');
const secretOverlay = document.getElementById('secretOverlay');
const closeSecret = document.getElementById('closeSecret');

document.addEventListener('click', function(e) {
  const heartElement = document.querySelector('.rose-gold-heart');
  if (heartElement && heartElement.contains(e.target)) {
    heartClicks++;
    heartCount.textContent = heartClicks;
    if (heartClicks === 1) heartTracker.classList.add('visible');
    createHeartBurst(e.pageX, e.pageY);
    if (heartClicks >= 10) {
      setTimeout(() => {
        secretOverlay.classList.add('active');
        heartClicks = 0;
        heartCount.textContent = '0';
        heartTracker.classList.remove('visible');
      }, 600);
    }
  }
});

document.addEventListener('touchstart', function(e) {
  const heartElement = document.querySelector('.rose-gold-heart');
  if (heartElement && heartElement.contains(e.target)) {
    e.preventDefault();
    heartClicks++;
    heartCount.textContent = heartClicks;
    if (heartClicks === 1) heartTracker.classList.add('visible');
    const touch = e.touches[0];
    createHeartBurst(touch.pageX, touch.pageY);
    if (heartClicks >= 10) {
      setTimeout(() => {
        secretOverlay.classList.add('active');
        heartClicks = 0;
        heartCount.textContent = '0';
        heartTracker.classList.remove('visible');
      }, 600);
    }
  }
}, { passive: false });

function createHeartBurst(x, y) {
  const hearts = ['💕', '💖', '💗', '💝', '💘'];
  for (let i = 0; i < 5; i++) {
    const heart = document.createElement('span');
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      font-size: 1.2rem;
      pointer-events: none;
      z-index: 9999;
      transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      opacity: 1;
    `;
    document.body.appendChild(heart);
    const angle = (Math.PI * 2 * i) / 5;
    const distance = 40 + Math.random() * 30;
    requestAnimationFrame(() => {
      heart.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance - 40}px) scale(0)`;
      heart.style.opacity = '0';
    });
    setTimeout(() => heart.remove(), 800);
  }
}

closeSecret.addEventListener('click', () => secretOverlay.classList.remove('active'));
secretOverlay.addEventListener('click', function(e) {
  if (e.target === secretOverlay) secretOverlay.classList.remove('active');
});

// ===== MUSIC PLAYER =====
const musicToggle = document.getElementById('musicToggle');
let isPlaying = false;
let audioElement = null;

function createAudio() {
  audioElement = new Audio();
  audioElement.src = 'https://docs.google.com/uc?export=open&id=1Q2zF5Rl2_RDBU5lVQdgxi3b0KuVBJ7FK';
  audioElement.loop = true;
  audioElement.volume = 0.5;
}
createAudio();

musicToggle.addEventListener('click', function() {
  if (isPlaying) {
    audioElement.pause();
    musicToggle.classList.remove('playing');
    musicToggle.querySelector('.music-icon').textContent = '🎵';
    isPlaying = false;
  } else {
    audioElement.play().then(() => {
      musicToggle.classList.add('playing');
      musicToggle.querySelector('.music-icon').textContent = '🎶';
      isPlaying = true;
    }).catch(err => {
      console.log('Audio failed — try a different hosting service.');
    });
  }
});

// ===== 🐱 INTERACTIVE CAT COMPANION =====
const catContainer = document.getElementById('catCompanion');
const catSpeech = document.getElementById('catSpeech');
const catImg = document.getElementById('catImg');

// ===== TEXT BLIP SOUND GENERATOR (Undertale/Mii style) =====
let audioCtx = null;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playTextBlip() {
  initAudioContext();
  
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  // Random pitch for variety (like Undertale's varying blips)
  const baseFrequency = 200 + Math.random() * 200;
  oscillator.frequency.setValueAtTime(baseFrequency, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(baseFrequency * 1.5, audioCtx.currentTime + 0.03);
  oscillator.frequency.exponentialRampToValueAtTime(baseFrequency * 0.8, audioCtx.currentTime + 0.06);
  
  // Short blip
  oscillator.type = 'square';
  gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.07);
  
  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.07);
}

function playTextSoundForMessage(msg) {
  // Play a blip for each character, with slight delays
  const chars = msg.length;
  const totalDuration = Math.min(chars * 30, 2000); // Cap at 2 seconds
  
  for (let i = 0; i < chars; i++) {
    setTimeout(() => {
      playTextBlip();
    }, i * (totalDuration / chars));
  }
}

// Cat's message pool
const catMessages = [
  "i love you bambi",
  "HAIAIAIAIAIAIAI BAMBI",
  "im kitty website simon, bambi",
  "bambi .. they put me in a website",
  "bambi bambi bambi, HELP IM IN A WEBSITE!!",
  "meow meow meow peg me .. I mean, BAMBI!",
  "you + me = 4ever 💕",
  "HAIAIAIAI *flips*",
  "i'm watching you scroll .. and read ",
  "this website smells like lilies and froyo",
  "bambi click the heart 10 times for an awesome super secret message!!",
  "i'm a digital kitty neowww >w<",
  "HAIAIAIAIAIAIAI",
  "they coded me with love... and treats",
  "bambi i see u, you look so cute and adorable :3",
  "*purrs aggressively and seductively*",
  "i live here now",
  "BAMBI LOOK AT THE COUNTDOWN",
  "i am the guardian of this website",
  "u think this is a game? it is. i'm winning cz i got you bambi.",
];

let messageTimeout = null;
let wanderInterval = null;
let isDragging = false;
let wasDragged = false;
let startX, startY, initialLeft, initialTop;

// ===== SHOW CAT MESSAGE (WITH SOUND) =====
function showCatMessage(msg, playSound = true) {
  if (messageTimeout) clearTimeout(messageTimeout);
  catSpeech.textContent = msg;
  catSpeech.classList.add('visible');
  
  // Play Undertale-style text blips
  if (playSound) {
    playTextSoundForMessage(msg);
  }
  
  messageTimeout = setTimeout(() => {
    catSpeech.classList.remove('visible');
  }, 4000);
}

// ===== RANDOM SPONTANEOUS MESSAGE =====
function randomSpontaneousMessage() {
  const delay = Math.random() * 15000 + 10000;
  setTimeout(() => {
    if (!catSpeech.classList.contains('visible')) {
      const msg = catMessages[Math.floor(Math.random() * catMessages.length)];
      showCatMessage(msg, true);
    }
    randomSpontaneousMessage();
  }, delay);
}
randomSpontaneousMessage();

// ===== CAT FLIPS (25% CHANCE EVERY 30 SECONDS) =====
function attemptFlip() {
  const chance = Math.random();
  if (chance <= 0.25) {
    let flipCount = 0;
    const maxFlips = 3;
    const flipInterval = setInterval(() => {
      const isFrontFlip = Math.random() < 0.5;
      if (isFrontFlip) {
        catImg.classList.add('cat-frontflip');
        setTimeout(() => catImg.classList.remove('cat-frontflip'), 600);
      } else {
        catImg.classList.add('cat-backflip');
        setTimeout(() => catImg.classList.remove('cat-backflip'), 600);
      }
      flipCount++;
      if (flipCount >= maxFlips) {
        clearInterval(flipInterval);
        const flipMessages = [
          "HAIAIAIAIAIAIAI BAMBI",
          "did u see that bambi",
          "i can do flips!!",
          "*dizzy kitty*",
          "BAMBI I'M SPINNING",
          "front flips AND back flips",
          "360 no scope",
        ];
        showCatMessage(flipMessages[Math.floor(Math.random() * flipMessages.length)], true);
      }
    }, 700);
  }
  setTimeout(attemptFlip, 30000);
}
setTimeout(attemptFlip, 15000);

// ===== CAT AUTONOMOUS WANDERING WITH WADDLE =====
function wanderCat() {
  const maxX = window.innerWidth - 120;
  const maxY = window.innerHeight - 120;
  
  const randomX = Math.random() * maxX;
  const randomY = Math.random() * maxY;
  
  catContainer.classList.add('waddling');
  catContainer.style.transition = 'left 3s ease-in-out, top 3s ease-in-out';
  catContainer.style.left = randomX + 'px';
  catContainer.style.top = randomY + 'px';
  catContainer.style.right = 'auto';
  catContainer.style.bottom = 'auto';
  
  setTimeout(() => {
    catContainer.classList.remove('waddling');
  }, 3000);
  
  const wanderDelay = Math.random() * 20000 + 15000;
  wanderInterval = setTimeout(wanderCat, wanderDelay);
}
setTimeout(wanderCat, 20000);

// ===== CAT TAP MESSAGE (WITH SOUND) =====
catImg.addEventListener('click', function(e) {
  if (wasDragged) {
    wasDragged = false;
    return;
  }
  const msg = catMessages[Math.floor(Math.random() * catMessages.length)];
  showCatMessage(msg, true);
  catImg.classList.add('cat-wiggle');
  setTimeout(() => catImg.classList.remove('cat-wiggle'), 500);
});

// ===== CAT DRAG (DESKTOP) =====
catImg.addEventListener('mousedown', function(e) {
  isDragging = true;
  wasDragged = false;
  startX = e.clientX;
  startY = e.clientY;
  const rect = catContainer.getBoundingClientRect();
  initialLeft = rect.left;
  initialTop = rect.top;
  catImg.style.cursor = 'grabbing';
  catContainer.style.transition = 'none';
  catContainer.classList.remove('waddling');
  // Switch to grabbed GIF
  catImg.src = 'https://i.postimg.cc/VkwSNZDJ/tyler-the-creator-call-me-if-you-get-lost.gif';
  e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
  if (!isDragging) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  if (Math.abs(dx) > 5 || Math.abs(dy) > 5) wasDragged = true;
  let newLeft = initialLeft + dx;
  let newTop = initialTop + dy;
  const maxX = window.innerWidth - 120;
  const maxY = window.innerHeight - 120;
  newLeft = Math.max(0, Math.min(newLeft, maxX));
  newTop = Math.max(0, Math.min(newTop, maxY));
  catContainer.style.left = newLeft + 'px';
  catContainer.style.top = newTop + 'px';
  catContainer.style.right = 'auto';
  catContainer.style.bottom = 'auto';
});

document.addEventListener('mouseup', function() {
  if (isDragging) {
    isDragging = false;
    catImg.style.cursor = 'pointer';
    // Switch back to static image
    catImg.src = 'https://i.postimg.cc/PxskQ99q/Untitled2-20260616134236.png';
  }
});

// ===== CAT DRAG (MOBILE TOUCH) =====
catImg.addEventListener('touchstart', function(e) {
  isDragging = true;
  wasDragged = false;
  const touch = e.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
  const rect = catContainer.getBoundingClientRect();
  initialLeft = rect.left;
  initialTop = rect.top;
  catContainer.style.transition = 'none';
  catContainer.classList.remove('waddling');
  // Switch to grabbed GIF
  catImg.src = 'https://i.postimg.cc/VkwSNZDJ/tyler-the-creator-call-me-if-you-get-lost.gif';
}, { passive: false });

document.addEventListener('touchmove', function(e) {
  if (!isDragging) return;
  const touch = e.touches[0];
  const dx = touch.clientX - startX;
  const dy = touch.clientY - startY;
  if (Math.abs(dx) > 5 || Math.abs(dy) > 5) wasDragged = true;
  let newLeft = initialLeft + dx;
  let newTop = initialTop + dy;
  const maxX = window.innerWidth - 120;
  const maxY = window.innerHeight - 120;
  newLeft = Math.max(0, Math.min(newLeft, maxX));
  newTop = Math.max(0, Math.min(newTop, maxY));
  catContainer.style.left = newLeft + 'px';
  catContainer.style.top = newTop + 'px';
  catContainer.style.right = 'auto';
  catContainer.style.bottom = 'auto';
}, { passive: false });

document.addEventListener('touchend', function() {
  if (isDragging) {
    isDragging = false;
    catImg.style.cursor = 'pointer';
    // Switch back to static image
    catImg.src = 'https://i.postimg.cc/PxskQ99q/Untitled2-20260616134236.png';
  }
});

// ===== KEEP CAT ON SCREEN =====
window.addEventListener('resize', function() {
  if (!catContainer) return;
  const maxX = window.innerWidth - 120;
  const maxY = window.innerHeight - 120;
  const rect = catContainer.getBoundingClientRect();
  catContainer.style.transition = 'none';
  if (rect.left > maxX) catContainer.style.left = maxX + 'px';
  if (rect.top > maxY) catContainer.style.top = maxY + 'px';
});

// ===== INITIAL CAT POSITION FIX =====
window.addEventListener('load', function() {
  if (!catContainer) return;
  catContainer.style.bottom = '7rem';
  catContainer.style.right = '2rem';
  catContainer.style.top = 'auto';
  catContainer.style.left = 'auto';
  catContainer.style.display = 'flex';
});