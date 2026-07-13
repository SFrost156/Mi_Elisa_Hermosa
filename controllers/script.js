// --- CONFIGURACIÓN DE CANVAS Y EFECTOS DE FUEGOS ARTIFICIALES ---
const canvas = document.getElementById('canvas-bg');
const ctx = canvas.getContext('2d');
let stars = [];
let fireworks = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function initStars() {
    stars = [];
    for (let i = 0; i < 120; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            alpha: Math.random(),
            speed: 0.01 + Math.random() * 0.02
        });
    }
}

function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    stars.forEach(star => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) star.speed = -star.speed;
        ctx.globalAlpha = Math.abs(star.alpha);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    animateFireworks();
    ctx.globalAlpha = 1.0;
    requestAnimationFrame(animateStars);
}

function createFirework(x, y) {
    const colors = ['#ffd3e1', '#f4d068', '#ff4d6d', '#ffb3c1'];
    const count = 40;
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const speed = 1 + Math.random() * 3;
        fireworks.push({
            x: x, y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

function animateFireworks() {
    for (let i = fireworks.length - 1; i >= 0; i--) {
        const f = fireworks[i];
        f.x += f.vx;
        f.y += f.vy;
        f.vy += 0.04;
        f.alpha -= 0.015;
        
        if (f.alpha <= 0) {
            fireworks.splice(i, 1);
            continue;
        }
        ctx.globalAlpha = f.alpha;
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

let fireworkTimer = null;
function startFireworkShow() {
    if(!fireworkTimer) {
        fireworkTimer = setInterval(() => {
            const x = Math.random() * canvas.width;
            const y = canvas.height * 0.2 + Math.random() * (canvas.height * 0.4);
            createFirework(x, y);
        }, 800);
    }
}

function stopFireworkShow() {
    if(fireworkTimer) {
        clearInterval(fireworkTimer);
        fireworkTimer = null;
    }
}

// --- PARTÍCULAS AMBIENTALES (PÉTALOS Y CORAZONES) ---
const particlesContainer = document.getElementById('particles-container');

function spawnParticle(type) {
    if (!particlesContainer) return;
    const el = document.createElement('div');
    el.classList.add('floating-element');
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (12 + Math.random() * 15) + 'px';
    el.style.animationDuration = (4 + Math.random() * 4) + 's';
    
    el.innerText = type === 'heart' ? (Math.random() > 0.5 ? '💖' : '❤️') : '🌸';
    
    particlesContainer.appendChild(el);
    setTimeout(() => el.remove(), 8000);
}

setInterval(() => spawnParticle('petal'), 600);
setInterval(() => spawnParticle('heart'), 900);

// --- CONTROLADOR DE FLUJO DE LA HISTORIA ---
let currentStep = 1;

function updateSectionDOM() {
    document.querySelectorAll('.story-section').forEach(sec => sec.classList.remove('active'));
    const targetSection = document.getElementById(`sec-${currentStep}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    if (currentStep === 6) {
        startFireworkShow();
    } else {
        stopFireworkShow();
    }
}

function nextSection(nextStep) {
    currentStep = nextStep;
    localStorage.setItem('elisa_story_progress', currentStep);
    updateSectionDOM();
}

function prevSection(prevStep) {
    currentStep = prevStep;
    localStorage.setItem('elisa_story_progress', currentStep);
    updateSectionDOM();
}

// Lógica de reemplazo limpio de la carta (Desvanece sobre, muestra carta centradita)
function openLetter() {
    const envelope = document.getElementById('mail-envelope');
    const letter = document.getElementById('mail-letter');
    const nextBtn = document.getElementById('nav-from-letter');
    
    if (envelope && letter) {
        envelope.classList.add('envelope-faded');
        letter.classList.remove('letter-hidden');
        letter.classList.add('letter-revealed');
        if (nextBtn) nextBtn.classList.remove('hidden');
        
        // Efecto extra: genera una explosión de fuegos artificiales de fondo al abrirla
        createFirework(canvas.width / 2, canvas.height * 0.4);
    }
}

function restartExperience() {
    localStorage.removeItem('elisa_story_progress');
    currentStep = 1;
    const envelope = document.getElementById('mail-envelope');
    const letter = document.getElementById('mail-letter');
    if (envelope) envelope.classList.remove('envelope-faded');
    if (letter) {
        letter.classList.remove('letter-revealed');
        letter.classList.add('letter-hidden');
    }
    const nextBtn = document.getElementById('nav-from-letter');
    if (nextBtn) nextBtn.classList.add('hidden');
    updateSectionDOM();
}

function loadProgress() {
    const saved = localStorage.getItem('elisa_story_progress');
    if (saved) {
        currentStep = parseInt(saved, 10);
        if(currentStep >= 4) {
            const envelope = document.getElementById('mail-envelope');
            const letter = document.getElementById('mail-letter');
            if (envelope) envelope.classList.add('envelope-faded');
            if (letter) {
                letter.classList.remove('letter-hidden');
                letter.classList.add('letter-revealed');
            }
            const nextBtn = document.getElementById('nav-from-letter');
            if (nextBtn) nextBtn.classList.remove('hidden');
        }
    }
    updateSectionDOM();
}

// --- GESTIÓN DE AUDIO (REPRODUCCIÓN AUTOMÁTICA INTELIGENTE) ---
const musicBtn = document.getElementById('btn-music');
const audioTrack = document.getElementById('bg-music');

function playWithPermissions() {
    if (audioTrack.paused) {
        audioTrack.play()
        .then(() => {
            musicBtn.innerText = '⏸️';
        })
        .catch(() => {
            console.log("Audio esperando interacción directa.");
        });
    }
}

// Control por clic directo en el botón musical flotante
musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audioTrack.paused) {
        playWithPermissions();
    } else {
        audioTrack.pause();
        musicBtn.innerText = '🎵';
    }
});

// Truco de inicio automático al primer toque en cualquier lugar
window.addEventListener('click', () => {
    playWithPermissions();
}, { once: true });

// Clics en la pantalla generan fuegos artificiales de forma interactiva
window.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('.gallery-item') || e.target.closest('.envelope-click-base')) return;
    createFirework(e.clientX, e.clientY);
});

// --- VISOR MODAL PARA FOTOS ---
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('img-modal-src');

function zoomImage(element) {
    const img = element.querySelector('img');
    if (modal && modalImg && img) {
        modal.style.display = "flex";
        modalImg.src = img.src;
    }
}

function closeModal() {
    if (modal) modal.style.display = "none";
}

// --- INICIALIZACIÓN COMPLETA ---
initStars();
animateStars();
loadProgress();