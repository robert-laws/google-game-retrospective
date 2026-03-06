class RetroGame {
    constructor(canvasId, overlayId, startBtnId, jumpBtnId, gameOverTextId, finalScoreId) {
        this.canvas = document.getElementById(canvasId);
        if(!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        // UI Elements
        this.overlay = document.getElementById(overlayId);
        this.startBtn = document.getElementById(startBtnId);
        this.jumpBtn = document.getElementById(jumpBtnId);
        this.gameOverText = document.getElementById(gameOverTextId);
        this.finalScoreText = document.getElementById(finalScoreId);
        
        // Game State
        this.gameState = 'START'; // START, PLAYING, GAMEOVER
        this.score = 0;
        this.gameSpeed = 5;
        this.frameCounter = 0;
        this.animationFrameId = null;
        
        // Entities
        this.player = {
            x: 50,
            y: 300,
            width: 32,
            height: 32,
            dy: 0,
            jumpForce: -12,
            gravity: 0.6,
            grounded: false,
            color: '#00f3ff' // Cyan neon character
        };
        
        this.obstacles = [];
        this.collectibles = [];
        this.particles = [];
        
        // Setup audio (Synth bloop function)
        this.audioCtx = null;
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        
        // Input handling
        const jumpHandler = (e) => {
            if (e.type === 'keydown' && e.code !== 'Space') return;
            if (e.type === 'keydown') e.preventDefault(); // Prevent scrolling
            
            if (this.gameState === 'PLAYING') {
                this.jump();
            } else if (this.gameState === 'GAMEOVER' || this.gameState === 'START') {
                this.start();
            }
        };

        window.addEventListener('keydown', jumpHandler);
        if (this.jumpBtn) {
            this.jumpBtn.addEventListener('click', jumpHandler);
            this.jumpBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                jumpHandler(e);
            });
        }
        
        // Canvas touch
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'PLAYING') this.jump();
        });
    }

    initAudio() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        }
    }

    playSound(type) {
        if (!this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        if (type === 'jump') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.1);
        } else if (type === 'coin') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
            osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime + 0.05);
            gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.1);
        } else if (type === 'hit') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(10, this.audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.2);
        }
    }

    start() {
        this.initAudio();
        
        // Reset state
        this.gameState = 'PLAYING';
        this.overlay.style.display = 'none';
        this.score = 0;
        this.gameSpeed = 5;
        this.frameCounter = 0;
        this.obstacles = [];
        this.collectibles = [];
        this.particles = [];
        
        this.player.y = this.canvas.height - 50 - this.player.height;
        this.player.dy = 0;
        this.player.grounded = true;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.loop();
    }

    gameOver() {
        this.gameState = 'GAMEOVER';
        this.playSound('hit');
        this.overlay.style.display = 'flex';
        this.gameOverText.style.display = 'block';
        this.finalScoreText.style.display = 'block';
        this.finalScoreText.textContent = `Score: ${Math.floor(this.score)}`;
        this.startBtn.textContent = 'PLAY AGAIN';
    }

    jump() {
        if (this.player.grounded) {
            this.player.dy = this.player.jumpForce;
            this.player.grounded = false;
            this.playSound('jump');
            this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height, '#fff', 5);
        }
    }

    spawnObstacle() {
        const height = 30 + Math.random() * 40;
        this.obstacles.push({
            x: this.canvas.width,
            y: this.canvas.height - 50 - height,
            width: 20 + Math.random() * 20,
            height: height,
            color: '#ff0055' // Magenta obstacle
        });
    }

    spawnCollectible() {
        this.collectibles.push({
            x: this.canvas.width,
            y: this.canvas.height - 150 - Math.random() * 100,
            width: 16,
            height: 16,
            color: '#ffe600', // Yellow coin/star
            collected: false
        });
    }

    createParticles(x, y, color, count) {
        for(let i=0; i<count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1,
                color: color
            });
        }
    }

    update() {
        if (this.gameState !== 'PLAYING') return;

        this.frameCounter++;
        this.score += 0.05;

        // Increase speed gradually
        if (this.frameCounter % 600 === 0) {
            this.gameSpeed += 0.5;
        }

        // Apply Gravity
        this.player.y += this.player.dy;
        if (this.player.y + this.player.height < this.canvas.height - 50) {
            this.player.dy += this.player.gravity;
            this.player.grounded = false;
        } else {
            this.player.dy = 0;
            this.player.y = this.canvas.height - 50 - this.player.height;
            if(!this.player.grounded) {
                this.player.grounded = true;
                this.createParticles(this.player.x + this.player.width/2, this.player.y + this.player.height, '#00f3ff', 3);
            }
        }

        // Spawners
        if (this.frameCounter % Math.floor(Math.random() * 60 + 80) === 0) {
            this.spawnObstacle();
        }
        if (this.frameCounter % Math.floor(Math.random() * 100 + 150) === 0) {
            this.spawnCollectible();
        }

        // Move Obstacles
        for (let i = 0; i < this.obstacles.length; i++) {
            let obs = this.obstacles[i];
            obs.x -= this.gameSpeed;

            // Collision Detection
            if (this.player.x < obs.x + obs.width &&
                this.player.x + this.player.width > obs.x &&
                this.player.y < obs.y + obs.height &&
                this.player.y + this.player.height > obs.y) {
                this.gameOver();
            }
        }
        this.obstacles = this.obstacles.filter(obs => obs.x + obs.width > 0);

        // Move Collectibles
        for (let i = 0; i < this.collectibles.length; i++) {
            let item = this.collectibles[i];
            if (!item.collected) {
                item.x -= this.gameSpeed;
                
                // Float effect
                item.y += Math.sin(this.frameCounter * 0.1) * 0.5;

                // Collision
                if (this.player.x < item.x + item.width &&
                    this.player.x + this.player.width > item.x &&
                    this.player.y < item.y + item.height &&
                    this.player.y + this.player.height > item.y) {
                    item.collected = true;
                    this.score += 50;
                    this.playSound('coin');
                    this.createParticles(item.x, item.y, '#ffe600', 10);
                }
            }
        }
        this.collectibles = this.collectibles.filter(item => !item.collected && item.x + item.width > 0);

        // Update Particles
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
        }
        this.particles = this.particles.filter(p => p.life > 0);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#111'; // Dark sky
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Ground / Floor
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        
        // Grid line on ground for synthwave feel
        this.ctx.strokeStyle = '#ff0f7b';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height - 50);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 50);
        this.ctx.stroke();

        // Draw Player (with retro glowing effect)
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.player.color;
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw Eyes (just to give it character)
        this.ctx.fillStyle = '#000';
        this.ctx.shadowBlur = 0;
        this.ctx.fillRect(this.player.x + 20, this.player.y + 8, 4, 4);
        
        // Draw Obstacles
        for (let obs of this.obstacles) {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = obs.color;
            this.ctx.fillStyle = obs.color;
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            
            // Retro inner highlight
            this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
            this.ctx.shadowBlur = 0;
            this.ctx.fillRect(obs.x, obs.y, obs.width, 4);
        }

        // Draw Collectibles
        for (let item of this.collectibles) {
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = item.color;
            this.ctx.fillStyle = item.color;
            this.ctx.beginPath();
            // Draw as a diamond
            this.ctx.moveTo(item.x + item.width/2, item.y);
            this.ctx.lineTo(item.x + item.width, item.y + item.height/2);
            this.ctx.lineTo(item.x + item.width/2, item.y + item.height);
            this.ctx.lineTo(item.x, item.y + item.height/2);
            this.ctx.fill();
            this.ctx.closePath();
        }

        // Draw Particles
        for (let p of this.particles) {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = p.color;
            this.ctx.fillRect(p.x, p.y, 4, 4);
        }
        this.ctx.globalAlpha = 1.0;
        this.ctx.shadowBlur = 0;

        // Draw Score
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px "VT323", monospace';
        this.ctx.fillText(`SCORE: ${Math.floor(this.score)}`, 20, 30);
    }

    loop() {
        this.update();
        this.draw();
        
        if (this.gameState === 'PLAYING') {
            this.animationFrameId = requestAnimationFrame(() => this.loop());
        }
    }
}

// Will be initialized in main.js
export default RetroGame;
