import RetroGame from './game.js';
import { topGames } from './data.js';

class BackgroundChiptune {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63]; // C Major Arp
        this.noteIndex = 0;
        this.timerID = null;
        this.speed = 200; // ms per note
    }

    init() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
    }

    playNote() {
        if (!this.isPlaying || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        // Retro square wave
        osc.type = 'square';
        osc.frequency.value = this.notes[this.noteIndex];
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (this.speed / 1000) * 0.9);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + (this.speed / 1000));
        
        this.noteIndex = (this.noteIndex + 1) % this.notes.length;
        
        this.timerID = setTimeout(() => this.playNote(), this.speed);
    }

    toggle() {
        if (!this.ctx) this.init();
        
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            this.noteIndex = 0;
            this.playNote();
        } else {
            clearTimeout(this.timerID);
        }
        return this.isPlaying;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Welcome to the 1990s.");
    
    // Create Dust Particles
    const dustContainer = document.getElementById('dust-particles');
    if (dustContainer) {
        for (let i = 0; i < 50; i++) {
            let dust = document.createElement('div');
            dust.className = 'dust';
            
            // Randomize position, size, and animation delay
            let x = Math.random() * 100;
            let size = Math.random() * 3 + 1;
            let delay = Math.random() * 8;
            let duration = Math.random() * 5 + 5;
            
            dust.style.left = `${x}%`;
            dust.style.width = `${size}px`;
            dust.style.height = `${size}px`;
            dust.style.animationDelay = `${delay}s`;
            dust.style.animationDuration = `${duration}s`;
            
            dustContainer.appendChild(dust);
        }
    }
    
    // Background Music Setup
    const bgMusic = new BackgroundChiptune();
    const audioBtn = document.getElementById('audio-toggle');
    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            const isPlaying = bgMusic.toggle();
            audioBtn.textContent = isPlaying ? '🔊 MUSIC: ON' : '🔈 MUSIC: OFF';
            if(isPlaying) {
                audioBtn.style.background = 'var(--clr-secondary)';
                audioBtn.style.color = '#000';
            } else {
                audioBtn.style.background = 'rgba(0,0,0,0.7)';
                audioBtn.style.color = 'var(--clr-secondary)';
            }
        });
    }

    // Initialize Game
    const game = new RetroGame(
        'gameCanvas', 
        'game-overlay', 
        'start-btn', 
        'btn-jump',
        'game-over-text',
        'final-score'
    );

    // Populate Roster Grid
    const grid = document.getElementById('roster-grid');
    if (grid) {
        topGames.forEach((gameItem, index) => {
            const card = document.createElement('div');
            card.className = 'game-card';
            // Custom CSS property for dynamic styling (colors per card)
            card.style.setProperty('--card-color', gameItem.color || '#00f3ff');
            
            // Add a slight stagger to animation if we implement IntersectionObserver later
            card.style.animationDelay = `${index * 0.1}s`;

            card.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">${gameItem.title}</h3>
                    <span class="card-year">${gameItem.year}</span>
                </div>
                <div class="card-platform">${gameItem.platform}</div>
                <p class="card-desc">${gameItem.description}</p>
                <div class="card-fact">
                    <strong>DID YOU KNOW?</strong>
                    ${gameItem.fact}
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe static elements
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    
    // Add fade-in to dynamically created cards and observe them
    document.querySelectorAll('.game-card').forEach((card, index) => {
        card.classList.add('fade-in');
        card.style.transitionDelay = `${(index % 3) * 0.1}s`;
        observer.observe(card);
    });
});
