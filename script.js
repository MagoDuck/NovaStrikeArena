// ============================================================
//  CANVAS / RESIZE
// ============================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ============================================================
//  TECLADO + GAMEPAD (PS3) - CORRIGIDO PARA DIAGONAIS
// ============================================================
const keys = {};
const keysPressed = {
    left: false,
    right: false,
    up: false,
    down: false
};

let gamepadConnected = false;
let gamepadIndex = null;

window.addEventListener('gamepadconnected', (e) => {
    gamepadConnected = true;
    gamepadIndex = e.gamepad.index;
    console.log('Gamepad conectado:', e.gamepad.id);
});
window.addEventListener('gamepaddisconnected', (e) => {
    gamepadConnected = false;
    gamepadIndex = null;
    console.log('Gamepad desconectado');
});

window.addEventListener('keydown', e => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Digit1', 'Digit2', 'Digit3', 'KeyR'].includes(e.code)) {
        e.preventDefault();
    }
    keys[e.code] = true;

    if (e.code === 'ArrowLeft') keysPressed.left = true;
    if (e.code === 'ArrowRight') keysPressed.right = true;
    if (e.code === 'ArrowUp') keysPressed.up = true;
    if (e.code === 'ArrowDown') keysPressed.down = true;

    if (e.code === 'KeyR' && !gameOver && !menuActive) showMenu();
    if (gameOver && e.code === 'KeyR') showMenu();

    if (!gameOver && !menuActive) {
        if (e.code === 'Digit1') ativarPower(0);
        if (e.code === 'Digit2') ativarPower(1);
        if (e.code === 'Digit3') ativarPower(2);
    }
});

window.addEventListener('keyup', e => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Digit1', 'Digit2', 'Digit3', 'KeyR'].includes(e.code)) {
        e.preventDefault();
    }
    keys[e.code] = false;

    if (e.code === 'ArrowLeft') keysPressed.left = false;
    if (e.code === 'ArrowRight') keysPressed.right = false;
    if (e.code === 'ArrowUp') keysPressed.up = false;
    if (e.code === 'ArrowDown') keysPressed.down = false;
});

// ============================================================
//  ELEMENTOS DOM / MENU
// ============================================================
const menuOverlay = document.getElementById('menuOverlay');
const btnStart = document.getElementById('btnStart');
const btnReset = document.getElementById('btnReset');
const hudContainer = document.getElementById('hudContainer');
const instrucoes = document.getElementById('instrucoes');
const shipCards = document.querySelectorAll('.ship-card');
const currentWaveInfo = document.getElementById('currentWaveInfo');
let menuActive = true;
let selectedShip = 'balanced';
let savedWave = 1;

const SHIP_CONFIGS = {
    speed: { name: 'Interceptor', speed: 8, maxHealth: 3, maxAmmo: 10, cadence: 150, color: '#00ff88', icon: '⚡' },
    balanced: { name: 'Equilibrada', speed: 5, maxHealth: 5, maxAmmo: 15, cadence: 180, color: '#00ffff', icon: '⚖️' },
    tank: { name: 'Titan', speed: 3, maxHealth: 8, maxAmmo: 12, cadence: 220, color: '#ff8800', icon: '🛡️' }
};

shipCards.forEach(card => {
    card.addEventListener('click', () => {
        shipCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedShip = card.dataset.ship;
    });
});

// ============================================================
//  SISTEMA DE MOEDAS E PODERES
// ============================================================
let coins = 0;
let ownedPowers = ['explosion', 'freeze', 'teleport'];
let selectedPowers = ['explosion', 'freeze', 'teleport'];
let allPowers = [];

const POWER_DEFS = {
    explosion: {
        id: 'explosion',
        name: 'Explosão',
        icon: '💥',
        desc: 'Explode todos os inimigos no raio',
        cooldown: 3,
        cost: 0,
        category: 'ataque'
    },
    freeze: {
        id: 'freeze',
        name: 'Congelamento',
        icon: '❄️',
        desc: 'Congela todos os inimigos por 5s',
        cooldown: 4,
        cost: 0,
        category: 'controle'
    },
    teleport: {
        id: 'teleport',
        name: 'Teleporte',
        icon: '🌀',
        desc: 'Teleporta para onde clicar',
        cooldown: 2,
        cost: 0,
        category: 'movimento'
    },
    shield: {
        id: 'shield',
        name: 'Escudo',
        icon: '🛡️',
        desc: 'Cria um escudo que bloqueia 1 hit',
        cooldown: 5,
        cost: 50,
        category: 'defesa'
    },
    heal: {
        id: 'heal',
        name: 'Cura',
        icon: '❤️‍🩹',
        desc: 'Recupera 2 pontos de vida',
        cooldown: 4,
        cost: 40,
        category: 'suporte'
    },
    speedBoost: {
        id: 'speedBoost',
        name: 'Super Velocidade',
        icon: '💨',
        desc: 'Aumenta velocidade por 3s',
        cooldown: 3,
        cost: 35,
        category: 'movimento'
    },
    laser: {
        id: 'laser',
        name: 'Laser',
        icon: '🔴',
        desc: 'Dispara um laser poderoso',
        cooldown: 3,
        cost: 60,
        category: 'ataque'
    },
    mine: {
        id: 'mine',
        name: 'Mina',
        icon: '💣',
        desc: 'Planta uma mina que explode',
        cooldown: 3,
        cost: 45,
        category: 'ataque'
    },
    homing: {
        id: 'homing',
        name: 'Mísseis Buscadores',
        icon: '🎯',
        desc: 'Dispara 3 mísseis que perseguem',
        cooldown: 4,
        cost: 70,
        category: 'ataque'
    },
    reflect: {
        id: 'reflect',
        name: 'Refletir',
        icon: '🔄',
        desc: 'Reflete balas inimigas por 2s',
        cooldown: 5,
        cost: 55,
        category: 'defesa'
    },
    gravity: {
        id: 'gravity',
        name: 'Gravidade',
        icon: '🌌',
        desc: 'Atrai inimigos e os danifica',
        cooldown: 4,
        cost: 50,
        category: 'controle'
    },
    clone: {
        id: 'clone',
        name: 'Clone',
        icon: '👥',
        desc: 'Cria um clone que atira por 5s',
        cooldown: 6,
        cost: 80,
        category: 'suporte'
    },
    berserk: {
        id: 'berserk',
        name: 'Fúria',
        icon: '🔥',
        desc: 'Dobra o dano por 4s',
        cooldown: 4,
        cost: 45,
        category: 'ataque'
    },
    slow: {
        id: 'slow',
        name: 'Campo Lentidão',
        icon: '🐢',
        desc: 'Reduz velocidade dos inimigos',
        cooldown: 3,
        cost: 30,
        category: 'controle'
    },
    scatter: {
        id: 'scatter',
        name: 'Rajada',
        icon: '💫',
        desc: 'Dispara 5 tiros em leque',
        cooldown: 2,
        cost: 40,
        category: 'ataque'
    }
};

function initPowers() {
    allPowers = Object.values(POWER_DEFS);
    ownedPowers = ['explosion', 'freeze', 'teleport'];
    selectedPowers = ['explosion', 'freeze', 'teleport'];

    const savedOwned = localStorage.getItem('spaceArenaOwnedPowers');
    const savedSelected = localStorage.getItem('spaceArenaSelectedPowers');
    const savedCoins = localStorage.getItem('spaceArenaCoins');

    if (savedOwned) {
        const parsed = JSON.parse(savedOwned);
        if (Array.isArray(parsed)) {
            ownedPowers = [...new Set([...ownedPowers, ...parsed])];
        }
    }
    if (savedSelected) {
        const parsed = JSON.parse(savedSelected);
        if (Array.isArray(parsed) && parsed.length === 3) {
            selectedPowers = parsed;
        }
    }
    if (savedCoins) {
        coins = parseInt(savedCoins) || 0;
    }
    updateCoinsDisplay();
}

function saveProgress() {
    localStorage.setItem('spaceArenaOwnedPowers', JSON.stringify(ownedPowers));
    localStorage.setItem('spaceArenaSelectedPowers', JSON.stringify(selectedPowers));
    localStorage.setItem('spaceArenaCoins', String(coins));
}

function updateCoinsDisplay() {
    document.getElementById('coinsDisplay').textContent = `🪙 Moedas: ${coins}`;
}

function renderPowersGrid() {
    const grid = document.getElementById('powersGrid');
    grid.innerHTML = '';

    allPowers.forEach(power => {
        const isOwned = ownedPowers.includes(power.id);
        const isSelected = selectedPowers.includes(power.id);
        const canSelect = selectedPowers.length < 3 || isSelected;
        const isFree = power.cost === 0;

        const card = document.createElement('div');
        card.className = `power-card${isOwned ? ' owned' : ''}${isSelected ? ' selected-power' : ''}`;

        let badgeHtml = '';
        if (isSelected) {
            badgeHtml = '<div class="power-badge selected-badge">✓</div>';
        } else if (isOwned) {
            badgeHtml = '<div class="power-badge">✔</div>';
        }

        card.innerHTML = `
            ${badgeHtml}
            <span class="power-icon">${power.icon}</span>
            <div class="power-name">${power.name}</div>
            <div class="power-desc">${power.desc}</div>
            <div class="power-cooldown">⏱️ ${power.cooldown} rodadas</div>
            ${!isOwned ? `<div class="power-cost">🪙 ${power.cost}</div>` : ''}
            ${!isOwned && !isFree ? `<button class="buy-btn" data-id="${power.id}" ${coins < power.cost ? 'disabled' : ''}>Comprar</button>` : ''}
            ${isOwned ? `<button class="select-btn" data-id="${power.id}" ${!canSelect ? 'disabled' : ''}>${isSelected ? 'Selecionado' : 'Selecionar'}</button>` : ''}
        `;

        grid.appendChild(card);
    });

    grid.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const power = allPowers.find(p => p.id === id);
            if (power && coins >= power.cost) {
                coins -= power.cost;
                if (!ownedPowers.includes(id)) {
                    ownedPowers.push(id);
                }
                updateCoinsDisplay();
                saveProgress();
                renderPowersGrid();
                updateSelectedPowersInfo();
            }
        });
    });

    grid.querySelectorAll('.select-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (!ownedPowers.includes(id)) return;

            const idx = selectedPowers.indexOf(id);
            if (idx !== -1) {
                if (selectedPowers.length > 1) {
                    selectedPowers.splice(idx, 1);
                }
            } else {
                if (selectedPowers.length < 3) {
                    selectedPowers.push(id);
                }
            }
            saveProgress();
            renderPowersGrid();
            updateSelectedPowersInfo();
        });
    });

    updateSelectedPowersInfo();
}

function updateSelectedPowersInfo() {
    document.getElementById('selectedPowersInfo').textContent = 
        `Poderes selecionados: ${selectedPowers.length}/3`;
}

document.querySelectorAll('.menu-tabs button').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.menu-tabs button').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        document.getElementById('tabNave').style.display = target === 'nave' ? 'block' : 'none';
        document.getElementById('tabPoderes').style.display = target === 'poderes' ? 'block' : 'none';
        if (target === 'poderes') renderPowersGrid();
    });
});

// ============================================================
//  JOGADOR / ESTADO
// ============================================================
let player = {
    x: 0, y: 0, radius: 18,
    speed: 5, angle: -Math.PI / 2,
    lastShot: 0, cadence: 180,
    maxHealth: 5, health: 5,
    maxAmmo: 15, ammo: 15,
    isReloading: false, reloadDuration: 1500, reloadStart: 0,
    shipType: 'balanced'
};

function initPlayer(shipType) {
    const config = SHIP_CONFIGS[shipType];
    player.shipType = shipType;
    player.speed = config.speed;
    player.maxHealth = config.maxHealth;
    player.health = config.maxHealth;
    player.maxAmmo = config.maxAmmo;
    player.ammo = config.maxAmmo;
    player.cadence = config.cadence;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.angle = -Math.PI / 2;
    player.isReloading = false;
    player.reloadDuration = 1500;
    player.reloadStart = 0;
    player.lastShot = 0;
    player.radius = 18;
}

let playerBullets = [], enemyBullets = [], enemies = [], stars = [];
let score = 0, wave = 1, gameOver = false;
const maxEnemiesPerWave = 5;

let freezeActive = false, freezeTimer = 0;
const FREEZE_DURATION = 5000;
let teleportActive = false;
let explosionParticles = [], explosionActive = false, explosionTimer = 0;
const EXPLOSION_DURATION = 600;

let muzzleFlashes = [];
let hitSparks = [];
let deathExplosions = [];
let explosionRing = null;
let shieldActive = false;
let shieldTimer = 0;
let speedBoostActive = false;
let speedBoostTimer = 0;
let reflectActive = false;
let reflectTimer = 0;
let gravityActive = false;
let gravityTimer = 0;
let cloneActive = false;
let cloneTimer = 0;
let cloneBullets = [];
let berserkActive = false;
let berserkTimer = 0;
let slowActive = false;
let slowTimer = 0;
let mines = [];
let laserParticles = [];

let powerCooldowns = {};

const ENEMY_TYPES = {
    NORMAL: { name: 'normal', health: 1, color: '#ff0055', points: 1, radius: 36 },
    DIAMOND: { name: 'diamond', health: 2, color: '#ff8800', points: 2, radius: 32 },
    CIRCLE: { name: 'circle', health: 3, color: '#00ff88', points: 3, radius: 30 },
    SQUARE: { name: 'square', health: 4, color: '#aa66ff', points: 4, radius: 34 },
    TRIANGLE: { name: 'triangle', health: 5, color: '#ff44ff', points: 50, radius: 38 },
    MOTHER: { name: 'mother', health: 50, color: '#ff0000', points: 50, radius: 80 },
    FATHER: { name: 'father', health: 100, color: '#ff00ff', points: 100, radius: 90 }
};

// ============================================================
//  FUNÇÕES DO JOGO
// ============================================================
function getEnemyTypesForWave(waveNum) {
    const types = [];
    if (waveNum === 1) return [{ type: 'NORMAL', count: maxEnemiesPerWave }];
    if (waveNum >= 5 && waveNum <= 8) {
        const diamondCount = Math.min(waveNum - 4, 5);
        const normalCount = 5 - diamondCount;
        types.push({ type: 'NORMAL', count: normalCount });
        types.push({ type: 'DIAMOND', count: diamondCount });
        return types;
    }
    if (waveNum >= 9 && waveNum <= 12) {
        const circleCount = Math.min(waveNum - 8, 5);
        const remaining = 5 - circleCount;
        const diamondCount = Math.min(remaining, 5);
        const normalCount = remaining - diamondCount;
        if (normalCount > 0) types.push({ type: 'NORMAL', count: normalCount });
        if (diamondCount > 0) types.push({ type: 'DIAMOND', count: diamondCount });
        types.push({ type: 'CIRCLE', count: circleCount });
        return types;
    }
    if (waveNum >= 13 && waveNum <= 16) {
        const squareCount = Math.min(waveNum - 12, 5);
        const remaining = 5 - squareCount;
        const circleCount = Math.min(remaining, 5);
        const diamondCount = Math.min(remaining - circleCount, 5);
        const normalCount = remaining - circleCount - diamondCount;
        if (normalCount > 0) types.push({ type: 'NORMAL', count: normalCount });
        if (diamondCount > 0) types.push({ type: 'DIAMOND', count: diamondCount });
        if (circleCount > 0) types.push({ type: 'CIRCLE', count: circleCount });
        types.push({ type: 'SQUARE', count: squareCount });
        return types;
    }
    if (waveNum >= 17 && waveNum <= 20) {
        const triangleCount = Math.min(waveNum - 16, 5);
        const remaining = 5 - triangleCount;
        const squareCount = Math.min(remaining, 5);
        const circleCount = Math.min(remaining - squareCount, 5);
        const diamondCount = Math.min(remaining - squareCount - circleCount, 5);
        const normalCount = remaining - squareCount - circleCount - diamondCount;
        if (normalCount > 0) types.push({ type: 'NORMAL', count: normalCount });
        if (diamondCount > 0) types.push({ type: 'DIAMOND', count: diamondCount });
        if (circleCount > 0) types.push({ type: 'CIRCLE', count: circleCount });
        if (squareCount > 0) types.push({ type: 'SQUARE', count: squareCount });
        types.push({ type: 'TRIANGLE', count: triangleCount });
        return types;
    }
    if (waveNum === 21) return [{ type: 'MOTHER', count: 1 }];
    if (waveNum === 22) return [{ type: 'FATHER', count: 1 }];
    const baseWave = ((waveNum - 23) % 16) + 5;
    if (baseWave >= 5 && baseWave <= 8) {
        const diamondCount = Math.min(baseWave - 4, 5);
        const normalCount = 5 - diamondCount;
        types.push({ type: 'NORMAL', count: normalCount });
        types.push({ type: 'DIAMOND', count: diamondCount });
        return types;
    }
    if (baseWave >= 9 && baseWave <= 12) {
        const circleCount = Math.min(baseWave - 8, 5);
        const remaining = 5 - circleCount;
        const diamondCount = Math.min(remaining, 5);
        const normalCount = remaining - diamondCount;
        if (normalCount > 0) types.push({ type: 'NORMAL', count: normalCount });
        if (diamondCount > 0) types.push({ type: 'DIAMOND', count: diamondCount });
        types.push({ type: 'CIRCLE', count: circleCount });
        return types;
    }
    if (baseWave >= 13 && baseWave <= 16) {
        const squareCount = Math.min(baseWave - 12, 5);
        const remaining = 5 - squareCount;
        const circleCount = Math.min(remaining, 5);
        const diamondCount = Math.min(remaining - circleCount, 5);
        const normalCount = remaining - circleCount - diamondCount;
        if (normalCount > 0) types.push({ type: 'NORMAL', count: normalCount });
        if (diamondCount > 0) types.push({ type: 'DIAMOND', count: diamondCount });
        if (circleCount > 0) types.push({ type: 'CIRCLE', count: circleCount });
        types.push({ type: 'SQUARE', count: squareCount });
        return types;
    }
    if (baseWave >= 17 && baseWave <= 20) {
        const triangleCount = Math.min(baseWave - 16, 5);
        const remaining = 5 - triangleCount;
        const squareCount = Math.min(remaining, 5);
        const circleCount = Math.min(remaining - squareCount, 5);
        const diamondCount = Math.min(remaining - squareCount - circleCount, 5);
        const normalCount = remaining - squareCount - circleCount - diamondCount;
        if (normalCount > 0) types.push({ type: 'NORMAL', count: normalCount });
        if (diamondCount > 0) types.push({ type: 'DIAMOND', count: diamondCount });
        if (circleCount > 0) types.push({ type: 'CIRCLE', count: circleCount });
        if (squareCount > 0) types.push({ type: 'SQUARE', count: squareCount });
        types.push({ type: 'TRIANGLE', count: triangleCount });
        return types;
    }
    return [{ type: 'NORMAL', count: maxEnemiesPerWave }];
}

function createEnemy(type, x, y) {
    const enemyData = ENEMY_TYPES[type];
    const baseSpeed = type === 'FATHER' ? 1.5 : (Math.random() * 1.5 + 2.0);

    return {
        x: x || 0, y: y || 0,
        radius: enemyData.radius,
        speed: baseSpeed, baseSpeed: baseSpeed,
        lastShot: Date.now() + Math.random() * 1500,
        shootCadence: type === 'FATHER' ? 600 : (type === 'MOTHER' ? 800 : 2000),
        frozen: false,
        type: type,
        health: enemyData.health,
        maxHealth: enemyData.health,
        color: enemyData.color,
        points: enemyData.points,
        hitFlash: 0,
        furious: false,
        phase: 0
    };
}

function spawnWave() {
    const enemyTypes = getEnemyTypesForWave(wave);
    enemyTypes.forEach(typeGroup => {
        for (let i = 0; i < typeGroup.count; i++) {
            let edge = Math.floor(Math.random() * 4);
            let ex, ey;
            if (edge === 0) { ex = Math.random() * canvas.width; ey = -80; }
            else if (edge === 1) { ex = canvas.width + 80; ey = Math.random() * canvas.height; }
            else if (edge === 2) { ex = Math.random() * canvas.width; ey = canvas.height + 80; }
            else { ex = -80; ey = Math.random() * canvas.height; }
            const enemy = createEnemy(typeGroup.type, ex, ey);
            enemies.push(enemy);
        }
    });
}

function initStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3
        });
    }
}

function updateHealthUI() {
    const container = document.getElementById('healthContainer');
    container.innerHTML = '';
    for (let i = 0; i < player.health; i++) {
        let bar = document.createElement('div');
        bar.className = 'health-bar active';
        container.appendChild(bar);
    }
}

function updatePowerUI() {
    const container = document.getElementById('powerStatus');
    container.innerHTML = '';

    selectedPowers.forEach((powerId) => {
        const power = POWER_DEFS[powerId];
        if (!power) return;
        const span = document.createElement('span');
        const cooldown = powerCooldowns[powerId] || 0;
        const isReady = cooldown === 0;

        span.className = isReady ? 'ready' : 'cooldown';
        const label = isReady ? '✅' : `⏱️${cooldown}`;
        span.textContent = `${power.icon} ${label}`;
        span.title = `${power.name}: ${isReady ? 'Pronto!' : `Recarregando (${cooldown} rodadas)`}`;
        container.appendChild(span);
    });
}

function resetPowers() {
    powerCooldowns = {};
    freezeActive = false;
    teleportActive = false;
    explosionActive = false;
    explosionParticles = [];
    explosionRing = null;
    shieldActive = false;
    speedBoostActive = false;
    reflectActive = false;
    gravityActive = false;
    cloneActive = false;
    berserkActive = false;
    slowActive = false;
    mines = [];
    laserParticles = [];
    updatePowerUI();
}

function createDeathExplosion(x, y, color) {
    const particles = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        particles.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 5 + 1,
            life: 1,
            color: color
        });
    }
    deathExplosions.push({ particles, timer: 60 });
}

function updateFatherPhase(enemy) {
    const healthPercent = enemy.health / enemy.maxHealth;
    if (healthPercent <= 0.1) { enemy.phase = 3; enemy.speed = enemy.baseSpeed * 2; }
    else if (healthPercent <= 0.5) enemy.phase = 2;
    else if (healthPercent <= 0.75) enemy.phase = 1;
}

function resetGameState() {
    player.ammo = player.maxAmmo;
    player.health = player.maxHealth;
    player.isReloading = false;
    playerBullets = [];
    enemyBullets = [];
    enemies = [];
    cloneBullets = [];
    mines = [];
    laserParticles = [];
    if (wave === 1) score = 0;
    document.getElementById('scoreVal').innerText = score;
    document.getElementById('waveText').innerText = `ONDA: ${wave}`;
    document.getElementById('reloadBarBg').style.display = 'none';
    document.getElementById('ammoText').style.color = '#00ffff';
    document.getElementById('ammoText').innerText = `MUNIÇÃO: ${player.ammo} / ${player.maxAmmo}`;
    updateHealthUI();
    resetPowers();
    gameOver = false;
    freezeActive = false;
    teleportActive = false;
    explosionActive = false;
    explosionParticles = [];
    explosionRing = null;
    muzzleFlashes = [];
    hitSparks = [];
    deathExplosions = [];
    shieldActive = false;
    speedBoostActive = false;
    reflectActive = false;
    gravityActive = false;
    cloneActive = false;
    berserkActive = false;
    slowActive = false;
    powerCooldowns = {};
    initStars();
    spawnWave();
    updatePowerUI();
}

function showMenu() {
    menuActive = true;
    menuOverlay.style.display = 'flex';
    hudContainer.style.display = 'none';
    instrucoes.style.display = 'none';
    document.getElementById('currentWaveInfo').textContent = `🌊 Começando da Onda: ${savedWave}`;
    gameOver = false;
    saveProgress();
}

function hideMenu() {
    menuActive = false;
    menuOverlay.style.display = 'none';
    hudContainer.style.display = 'flex';
    instrucoes.style.display = 'block';
}

function startGame(continueGame = true) {
    if (continueGame) {
        wave = savedWave;
    } else {
        wave = 1;
        savedWave = 1;
        score = 0;
    }
    initPlayer(selectedShip);
    resetGameState();
    hideMenu();
}

// ============================================================
//  PODERES
// ============================================================
function ativarPower(index) {
    if (gameOver || menuActive) return;
    if (index >= selectedPowers.length) return;

    const powerId = selectedPowers[index];
    const power = POWER_DEFS[powerId];
    if (!power) return;

    if (powerCooldowns[powerId] && powerCooldowns[powerId] > 0) {
        return;
    }

    switch(powerId) {
        case 'explosion': ativarExplosao(); break;
        case 'freeze': ativarCongelamento(); break;
        case 'teleport': ativarTeleporte(); break;
        case 'shield': ativarEscudo(); break;
        case 'heal': ativarCura(); break;
        case 'speedBoost': ativarSpeedBoost(); break;
        case 'laser': ativarLaser(); break;
        case 'mine': ativarMina(); break;
        case 'homing': ativarHoming(); break;
        case 'reflect': ativarReflect(); break;
        case 'gravity': ativarGravity(); break;
        case 'clone': ativarClone(); break;
        case 'berserk': ativarBerserk(); break;
        case 'slow': ativarSlow(); break;
        case 'scatter': ativarScatter(); break;
        default: return;
    }

    powerCooldowns[powerId] = power.cooldown;
    updatePowerUI();
}

function ativarExplosao() {
    if (gameOver || menuActive) return;
    if (enemies.length === 0) return;
    const raioExplosao = 250;
    const centroX = player.x, centroY = player.y;

    explosionRing = {
        x: centroX,
        y: centroY,
        radius: 10,
        maxRadius: raioExplosao,
        alpha: 1,
        growing: true
    };

    explosionParticles = [];
    for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 10 + 3;
        explosionParticles.push({
            x: centroX + (Math.random() - 0.5) * 30,
            y: centroY + (Math.random() - 0.5) * 30,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 8 + 2,
            life: 1,
            color: `hsl(${Math.random() * 60 + 10}, 100%, ${Math.random() * 40 + 40}%)`
        });
    }
    explosionActive = true;
    explosionTimer = Date.now() + EXPLOSION_DURATION;

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dx = enemy.x - centroX, dy = enemy.y - centroY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < raioExplosao) {
            const damage = berserkActive ? 1.5 : 1;
            createDeathExplosion(enemy.x, enemy.y, enemy.color);

            if (enemy.type === 'FATHER') {
                enemy.health -= 15 * damage;
                enemy.hitFlash = 0.8;
                updateFatherPhase(enemy);
                if (enemy.health <= 0) {
                    score += enemy.points;
                    document.getElementById('scoreVal').innerText = score;
                    enemies.splice(i, 1);
                    if (player.health < player.maxHealth) { player.health++; updateHealthUI(); }
                }
            } else if (enemy.type === 'MOTHER') {
                enemy.health -= 10 * damage;
                enemy.hitFlash = 0.8;
                if (enemy.health <= enemy.maxHealth / 2) enemy.furious = true;
                if (enemy.health <= 0) {
                    score += enemy.points;
                    document.getElementById('scoreVal').innerText = score;
                    enemies.splice(i, 1);
                    if (player.health < player.maxHealth) { player.health++; updateHealthUI(); }
                }
            } else {
                enemy.health -= damage;
                if (enemy.health <= 0) {
                    score += enemy.points;
                    enemies.splice(i, 1);
                    document.getElementById('scoreVal').innerText = score;
                    if (player.health < player.maxHealth) { player.health++; updateHealthUI(); }
                }
            }
        }
    }
    if (enemies.length === 0) { 
        wave++; 
        savedWave = wave;
        document.getElementById('waveText').innerText = `ONDA: ${wave}`; 
        spawnWave(); 
    }
}

function ativarCongelamento() {
    if (gameOver || menuActive) return;
    if (enemies.length === 0) return;
    freezeActive = true;
    freezeTimer = Date.now() + FREEZE_DURATION;
    enemies.forEach(enemy => enemy.frozen = true);
}

function ativarTeleporte() {
    if (gameOver || menuActive) return;
    teleportActive = true;
}

function ativarEscudo() {
    if (shieldActive) return;
    shieldActive = true;
    shieldTimer = Date.now() + 5000;
    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 20;
        explosionParticles.push({
            x: player.x + Math.cos(angle) * dist,
            y: player.y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * 2,
            vy: Math.sin(angle) * 2,
            radius: 3 + Math.random() * 3,
            life: 0.8,
            color: '#00ccff'
        });
    }
}

function ativarCura() {
    const healAmount = 2;
    player.health = Math.min(player.health + healAmount, player.maxHealth);
    updateHealthUI();
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 15;
        explosionParticles.push({
            x: player.x + Math.cos(angle) * dist,
            y: player.y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * 1.5,
            vy: Math.sin(angle) * 1.5,
            radius: 3 + Math.random() * 3,
            life: 0.8,
            color: '#ff44ff'
        });
    }
}

function ativarSpeedBoost() {
    if (speedBoostActive) return;
    speedBoostActive = true;
    speedBoostTimer = Date.now() + 3000;
    player.speed *= 1.8;
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 20;
        explosionParticles.push({
            x: player.x + Math.cos(angle) * dist,
            y: player.y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            radius: 2 + Math.random() * 3,
            life: 0.6,
            color: '#88ff44'
        });
    }
}

function ativarLaser() {
    const laserDamage = 20;
    const laserRange = 600;

    for (let i = 0; i < 60; i++) {
        const dist = Math.random() * laserRange;
        const angle = player.angle + (Math.random() - 0.5) * 0.15;
        const spread = (Math.random() - 0.5) * 3;
        laserParticles.push({
            x: player.x + Math.cos(angle) * dist,
            y: player.y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * 2 + (Math.random() - 0.5) * 2,
            vy: Math.sin(angle) * 2 + (Math.random() - 0.5) * 2,
            radius: 2 + Math.random() * 6,
            life: 0.6 + Math.random() * 0.3,
            color: `hsl(${Math.random() * 20 + 340}, 100%, ${Math.random() * 30 + 50}%)`
        });
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < laserRange) {
            const angle = Math.atan2(dy, dx);
            const angleDiff = angle - player.angle;
            if (Math.abs(angleDiff) < 0.3 || Math.abs(angleDiff) > Math.PI * 2 - 0.3) {
                enemy.health -= laserDamage;
                enemy.hitFlash = 0.8;
                if (enemy.type === 'FATHER') updateFatherPhase(enemy);
                if (enemy.health <= 0) {
                    createDeathExplosion(enemy.x, enemy.y, enemy.color);
                    score += enemy.points;
                    document.getElementById('scoreVal').innerText = score;
                    enemies.splice(i, 1);
                    if (player.health < player.maxHealth) { player.health++; updateHealthUI(); }
                }
            }
        }
    }
}

function ativarMina() {
    mines.push({
        x: player.x,
        y: player.y,
        radius: 15,
        active: true,
        timer: 0
    });
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 5 + Math.random() * 10;
        explosionParticles.push({
            x: player.x + Math.cos(angle) * dist,
            y: player.y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * 1.5,
            vy: Math.sin(angle) * 1.5,
            radius: 2 + Math.random() * 3,
            life: 0.7,
            color: '#ff4400'
        });
    }
}

function ativarHoming() {
    for (let i = 0; i < 3; i++) {
        const angle = player.angle + (i - 1) * 0.3;
        const speed = 8;
        playerBullets.push({
            x: player.x + Math.cos(angle) * player.radius,
            y: player.y + Math.sin(angle) * player.radius,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 5,
            homing: true,
            damage: 3,
            target: null,
            life: 120
        });
    }
    for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 15;
        explosionParticles.push({
            x: player.x + Math.cos(angle) * dist,
            y: player.y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * 2,
            vy: Math.sin(angle) * 2,
            radius: 2 + Math.random() * 3,
            life: 0.6,
            color: '#ff44ff'
        });
    }
}

function ativarReflect() {
    if (reflectActive) return;
    reflectActive = true;
    reflectTimer = Date.now() + 3000;
    for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 15 + Math.random() * 25;
        explosionParticles.push({
            x: player.x + Math.cos(angle) * dist,
            y: player.y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * 2,
            vy: Math.sin(angle) * 2,
            radius: 2 + Math.random() * 3,
            life: 0.7,
            color: '#44ffff'
        });
    }
}

function ativarGravity() {
    if (gravityActive) return;
    gravityActive = true;
    gravityTimer = Date.now() + 4000;
    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 30;
        explosionParticles.push({
            x: player.x + Math.cos(angle) * dist,
            y: player.y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * 2,
            vy: Math.sin(angle) * 2,
            radius: 2 + Math.random() * 4,
            life: 0.8,
            color: '#8844ff'
        });
    }
}

function ativarClone() {
    if (cloneActive) return;
    cloneActive = true;
    cloneTimer = Date.now() + 5000;
    cloneBullets = [];
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 20;
        explosionParticles.push({
            x: player.x + Math.cos(angle) * dist,
            y: player.y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * 2,
            vy: Math.sin(angle) * 2,
            radius: 2 + Math.random() * 3,
            life: 0.7,
            color: '#44ff88'
        });
    }
}

function ativarBerserk() {
    if (berserkActive) return;
    berserkActive = true;
    berserkTimer = Date.now() + 4000;
    for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 20;
        explosionParticles.push({
            x: player.x + Math.cos(angle) * dist,
            y: player.y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            radius: 2 + Math.random() * 4,
            life: 0.7,
            color: '#ff4400'
        });
    }
}

function ativarSlow() {
    if (slowActive) return;
    slowActive = true;
    slowTimer = Date.now() + 4000;
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 30;
        explosionParticles.push({
            x: player.x + Math.cos(angle) * dist,
            y: player.y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * 1.5,
            vy: Math.sin(angle) * 1.5,
            radius: 2 + Math.random() * 4,
            life: 0.7,
            color: '#88aaff'
        });
    }
}

function ativarScatter() {
    const spread = 0.6;
    for (let i = 0; i < 5; i++) {
        const angle = player.angle - spread/2 + (i / 4) * spread;
        const speed = 9;
        playerBullets.push({
            x: player.x + Math.cos(angle) * player.radius,
            y: player.y + Math.sin(angle) * player.radius,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 3,
            homing: false,
            damage: 1
        });
    }
    for (let i = 0; i < 15; i++) {
        const angle = player.angle - spread/2 + Math.random() * spread;
        const dist = 10 + Math.random() * 15;
        explosionParticles.push({
            x: player.x + Math.cos(angle) * dist,
            y: player.y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            radius: 2 + Math.random() * 3,
            life: 0.5,
            color: '#ffaa44'
        });
    }
}

// ============================================================
//  CLIQUE PARA TELEPORTE
// ============================================================
canvas.addEventListener('click', (e) => {
    if (!teleportActive) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const targetX = (e.clientX - rect.left) * scaleX;
    const targetY = (e.clientY - rect.top) * scaleY;
    let valido = true;
    if (targetX < player.radius || targetX > canvas.width - player.radius ||
        targetY < player.radius || targetY > canvas.height - player.radius) valido = false;
    for (let enemy of enemies) {
        const dx = targetX - enemy.x, dy = targetY - enemy.y;
        if (Math.sqrt(dx*dx + dy*dy) < player.radius + enemy.radius) { valido = false; break; }
    }
    if (valido) {
        player.x = targetX; player.y = targetY;
        teleportActive = false;
    } else {
        teleportActive = false;
    }
});

// ============================================================
//  BOTÕES MENU
// ============================================================
btnStart.addEventListener('click', () => { initPowers(); startGame(true); });
btnReset.addEventListener('click', () => { savedWave = 1; startGame(false); });

// ============================================================
//  LOOP PRINCIPAL - CORRIGIDO PARA TIROS DIAGONAIS
// ============================================================
function update() {
    if (gameOver || menuActive) return;

    const now = Date.now();

    // Verificar efeitos temporários
    if (shieldActive && now > shieldTimer) {
        shieldActive = false;
    }
    if (speedBoostActive && now > speedBoostTimer) {
        speedBoostActive = false;
        const config = SHIP_CONFIGS[player.shipType];
        player.speed = config.speed;
    }
    if (reflectActive && now > reflectTimer) {
        reflectActive = false;
    }
    if (gravityActive && now > gravityTimer) {
        gravityActive = false;
    }
    if (cloneActive && now > cloneTimer) {
        cloneActive = false;
        cloneBullets = [];
    }
    if (berserkActive && now > berserkTimer) {
        berserkActive = false;
    }
    if (slowActive && now > slowTimer) {
        slowActive = false;
    }

    // Atualizar partículas do laser
    for (let i = laserParticles.length - 1; i >= 0; i--) {
        const p = laserParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.radius *= 0.98;
        if (p.life <= 0) laserParticles.splice(i, 1);
    }

    // Atualizar minas
    for (let i = mines.length - 1; i >= 0; i--) {
        const mine = mines[i];
        mine.timer++;
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const dx = enemy.x - mine.x;
            const dy = enemy.y - mine.y;
            if (Math.sqrt(dx*dx + dy*dy) < mine.radius + enemy.radius) {
                createDeathExplosion(mine.x, mine.y, '#ff6600');
                enemy.health -= 5;
                if (enemy.health <= 0) {
                    score += enemy.points;
                    document.getElementById('scoreVal').innerText = score;
                    enemies.splice(j, 1);
                    if (player.health < player.maxHealth) { player.health++; updateHealthUI(); }
                }
                mines.splice(i, 1);
                break;
            }
        }
    }

    // ============================================================
    //  MOVIMENTO CORRIGIDO - USA RASTREAMENTO DE TECLAS
    // ============================================================
    let moveX = 0, moveY = 0;

    // Gamepad
    if (gamepadConnected && gamepadIndex !== null) {
        const gp = navigator.getGamepads()[gamepadIndex];
        if (gp) {
            const deadZone = 0.15;
            let ax = gp.axes[0] || 0;
            let ay = gp.axes[1] || 0;
            if (Math.abs(ax) > deadZone) moveX = ax;
            if (Math.abs(ay) > deadZone) moveY = ay;
        }
    }

    // Teclado - usa keysPressed
    if (keysPressed.left) moveX -= 1;
    if (keysPressed.right) moveX += 1;
    if (keysPressed.up) moveY -= 1;
    if (keysPressed.down) moveY += 1;

    // NORMALIZA O VETOR DE MOVIMENTO
    let len = Math.sqrt(moveX*moveX + moveY*moveY);
    if (len > 1) {
        moveX /= len;
        moveY /= len;
    }

    // APLICA MOVIMENTO E ATUALIZA O ÂNGULO
    if (moveX !== 0 || moveY !== 0) {
        player.angle = Math.atan2(moveY, moveX);
        player.x += moveX * player.speed;
        player.y += moveY * player.speed;

        if (player.x < player.radius) player.x = player.radius;
        if (player.x > canvas.width - player.radius) player.x = canvas.width - player.radius;
        if (player.y < player.radius) player.y = player.radius;
        if (player.y > canvas.height - player.radius) player.y = canvas.height - player.radius;
    }

    // ============================================================
    //  TIRO PELO GAMEPAD - USA O ÂNGULO ATUAL
    // ============================================================
    if (gamepadConnected && gamepadIndex !== null) {
        const gp = navigator.getGamepads()[gamepadIndex];
        if (gp) {
            for (let i = 0; i < gp.buttons.length; i++) {
                const pressed = gp.buttons[i] ? gp.buttons[i].pressed : false;
                if (i === 5 && pressed && !player.isReloading) {
                    if (now - player.lastShot > player.cadence) {
                        const damage = berserkActive ? 2 : 1;
                        const angle = player.angle;
                        playerBullets.push({
                            x: player.x + Math.cos(angle) * player.radius,
                            y: player.y + Math.sin(angle) * player.radius,
                            vx: Math.cos(angle) * 11,
                            vy: Math.sin(angle) * 11,
                            radius: 3,
                            homing: false,
                            damage: damage
                        });
                        player.lastShot = now;
                        player.ammo--;
                        document.getElementById('ammoText').innerText = `MUNIÇÃO: ${player.ammo} / ${player.maxAmmo}`;
                        if (player.ammo <= 0) {
                            player.isReloading = true;
                            player.reloadStart = now;
                            document.getElementById('reloadBarBg').style.display = 'block';
                            document.getElementById('ammoText').style.color = '#ff3300';
                        }
                        muzzleFlashes.push({
                            x: player.x + Math.cos(angle) * player.radius,
                            y: player.y + Math.sin(angle) * player.radius,
                            life: 0.15,
                            angle: player.angle
                        });
                    }
                }
                if (i === 0 && pressed) ativarPower(0);
                if (i === 2 && pressed) ativarPower(1);
                if (i === 1 && pressed) ativarPower(2);
                if (i === 3 && pressed && !gameOver) { showMenu(); }
            }
        }
    }

    // ============================================================
    //  TIRO PELO TECLADO - USA O ÂNGULO ATUAL
    // ============================================================
    if (keys['Space'] && !player.isReloading && !gamepadConnected) {
        if (now - player.lastShot > player.cadence) {
            const damage = berserkActive ? 2 : 1;
            const angle = player.angle;
            playerBullets.push({
                x: player.x + Math.cos(angle) * player.radius,
                y: player.y + Math.sin(angle) * player.radius,
                vx: Math.cos(angle) * 11,
                vy: Math.sin(angle) * 11,
                radius: 3,
                homing: false,
                damage: damage
            });
            player.lastShot = now;
            player.ammo--;
            document.getElementById('ammoText').innerText = `MUNIÇÃO: ${player.ammo} / ${player.maxAmmo}`;
            if (player.ammo <= 0) {
                player.isReloading = true;
                player.reloadStart = now;
                document.getElementById('reloadBarBg').style.display = 'block';
                document.getElementById('ammoText').style.color = '#ff3300';
            }
            muzzleFlashes.push({
                x: player.x + Math.cos(angle) * player.radius,
                y: player.y + Math.sin(angle) * player.radius,
                life: 0.15,
                angle: player.angle
            });
        }
    }

    // Clone atira
    if (cloneActive) {
        if (now - (cloneBullets._lastShot || 0) > 300) {
            const angle = player.angle + (Math.random() - 0.5) * 0.5;
            cloneBullets.push({
                x: player.x + Math.cos(angle) * player.radius * 1.5,
                y: player.y + Math.sin(angle) * player.radius * 1.5,
                vx: Math.cos(angle) * 8,
                vy: Math.sin(angle) * 8,
                radius: 3,
                damage: 1
            });
            cloneBullets._lastShot = now;
        }
        for (let i = cloneBullets.length - 1; i >= 0; i--) {
            const b = cloneBullets[i];
            b.x += b.vx; b.y += b.vy;
            if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
                cloneBullets.splice(i, 1);
                continue;
            }
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                const dx = b.x - enemy.x, dy = b.y - enemy.y;
                if (Math.sqrt(dx*dx + dy*dy) < enemy.radius + b.radius) {
                    enemy.health -= b.damage;
                    enemy.hitFlash = 0.8;
                    if (enemy.health <= 0) {
                        createDeathExplosion(enemy.x, enemy.y, enemy.color);
                        score += enemy.points;
                        document.getElementById('scoreVal').innerText = score;
                        enemies.splice(j, 1);
                        if (player.health < player.maxHealth) { player.health++; updateHealthUI(); }
                    }
                    cloneBullets.splice(i, 1);
                    break;
                }
            }
        }
    }

    // Recarga
    if (player.isReloading) {
        let elapsed = now - player.reloadStart;
        if (elapsed >= player.reloadDuration) {
            player.ammo = player.maxAmmo;
            player.isReloading = false;
            document.getElementById('reloadBarBg').style.display = 'none';
            document.getElementById('ammoText').style.color = '#00ffff';
            document.getElementById('ammoText').innerText = `MUNIÇÃO: ${player.ammo} / ${player.maxAmmo}`;
        } else {
            let progress = (elapsed / player.reloadDuration) * 100;
            document.getElementById('reloadBarFill').style.width = `${progress}%`;
            let timeLeft = ((player.reloadDuration - elapsed) / 1000).toFixed(1);
            document.getElementById('ammoText').innerText = `RECARREGANDO: ${timeLeft}s`;
        }
    }

    // Estrelas
    stars.forEach(star => {
        star.x += star.vx; star.y += star.vy;
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
    });

    // Balas do jogador com homing
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        let b = playerBullets[i];
        if (b.homing && enemies.length > 0) {
            let closest = null;
            let closestDist = Infinity;
            for (let enemy of enemies) {
                const dx = enemy.x - b.x;
                const dy = enemy.y - b.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < closestDist) {
                    closestDist = dist;
                    closest = enemy;
                }
            }
            if (closest) {
                const dx = closest.x - b.x;
                const dy = closest.y - b.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist > 0) {
                    const homingSpeed = 0.1;
                    b.vx += (dx/dist) * homingSpeed;
                    b.vy += (dy/dist) * homingSpeed;
                    const speed = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
                    if (speed > 10) {
                        b.vx = (b.vx/speed) * 10;
                        b.vy = (b.vy/speed) * 10;
                    }
                }
            }
            b.life--;
            if (b.life <= 0) {
                playerBullets.splice(i, 1);
                continue;
            }
        }
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            playerBullets.splice(i, 1);
        }
    }

    // Balas inimigas com reflexão
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let eb = enemyBullets[i];
        eb.x += eb.vx; eb.y += eb.vy;
        let pDx = eb.x - player.x, pDy = eb.y - player.y;
        const distToPlayer = Math.sqrt(pDx*pDx + pDy*pDy);

        if (distToPlayer < player.radius + eb.radius) {
            if (reflectActive) {
                const angle = Math.atan2(pDy, pDx);
                const speed = Math.sqrt(eb.vx*eb.vx + eb.vy*eb.vy);
                eb.vx = Math.cos(angle) * speed * -1;
                eb.vy = Math.sin(angle) * speed * -1;
                eb.x = player.x + Math.cos(angle) * (player.radius + eb.radius + 5);
                eb.y = player.y + Math.sin(angle) * (player.radius + eb.radius + 5);
                eb.reflected = true;
                continue;
            } else if (shieldActive) {
                enemyBullets.splice(i, 1);
                shieldActive = false;
                continue;
            } else {
                enemyBullets.splice(i, 1);
                player.health--;
                updateHealthUI();
                if (player.health <= 0) { 
                    gameOver = true; 
                    savedWave = wave;
                    setTimeout(showMenu, 2000); 
                }
                continue;
            }
        }
        if (eb.x < 0 || eb.x > canvas.width || eb.y < 0 || eb.y > canvas.height) {
            enemyBullets.splice(i, 1);
        }
    }

    // Inimigos
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        if (enemy.hitFlash > 0) enemy.hitFlash -= 0.05;
        if (enemy.type === 'FATHER') updateFatherPhase(enemy);
        if (enemy.type === 'MOTHER' && enemy.health <= enemy.maxHealth / 2) enemy.furious = true;

        let currentSpeed = enemy.speed;
        if (slowActive) currentSpeed *= 0.4;

        if (!enemy.frozen) {
            let dx = player.x - enemy.x, dy = player.y - enemy.y;
            let dist = Math.sqrt(dx*dx + dy*dy);

            if (gravityActive && dist < 300) {
                const pullForce = 0.3;
                enemy.x += (dx/dist) * pullForce * 2;
                enemy.y += (dy/dist) * pullForce * 2;
                if (dist < 80) {
                    enemy.health -= 0.02;
                    if (enemy.health <= 0) {
                        createDeathExplosion(enemy.x, enemy.y, enemy.color);
                        score += enemy.points;
                        document.getElementById('scoreVal').innerText = score;
                        enemies.splice(i, 1);
                        if (player.health < player.maxHealth) { player.health++; updateHealthUI(); }
                        continue;
                    }
                }
            }

            if (dist > 350) { 
                enemy.x += (dx/dist) * currentSpeed; 
                enemy.y += (dy/dist) * currentSpeed; 
            }
            else if (dist < 200) { 
                enemy.x -= (dx/dist) * currentSpeed * 0.5; 
                enemy.y -= (dy/dist) * currentSpeed * 0.5; 
            }
        }

        if (!enemy.frozen && now - enemy.lastShot > enemy.shootCadence) {
            if (enemy.type === 'FATHER') {
                let dirs = [];
                if (enemy.phase >= 1) dirs = [Math.PI/4, 3*Math.PI/4, 5*Math.PI/4, 7*Math.PI/4];
                if (enemy.phase >= 2) dirs = [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI, 5*Math.PI/4, 3*Math.PI/2, 7*Math.PI/4];
                if (enemy.phase === 0) {
                    const eAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                    dirs = [eAngle];
                }
                dirs.forEach(angle => {
                    enemyBullets.push({
                        x: enemy.x + Math.cos(angle) * enemy.radius,
                        y: enemy.y + Math.sin(angle) * enemy.radius,
                        vx: Math.cos(angle) * 5.5,
                        vy: Math.sin(angle) * 5.5,
                        radius: 5,
                        reflected: false
                    });
                });
            } else if (enemy.type === 'MOTHER' && enemy.furious) {
                [0, Math.PI/2, Math.PI, 3*Math.PI/2].forEach(angle => {
                    enemyBullets.push({
                        x: enemy.x + Math.cos(angle) * enemy.radius,
                        y: enemy.y + Math.sin(angle) * enemy.radius,
                        vx: Math.cos(angle) * 5.5,
                        vy: Math.sin(angle) * 5.5,
                        radius: 5,
                        reflected: false
                    });
                });
            } else {
                let eAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                enemyBullets.push({
                    x: enemy.x + Math.cos(eAngle) * enemy.radius,
                    y: enemy.y + Math.sin(eAngle) * enemy.radius,
                    vx: Math.cos(eAngle) * 5.5,
                    vy: Math.sin(eAngle) * 5.5,
                    radius: 5,
                    reflected: false
                });
            }
            enemy.lastShot = now + Math.random() * 400;
        }

        for (let j = playerBullets.length - 1; j >= 0; j--) {
            let pb = playerBullets[j];
            let bDx = pb.x - enemy.x, bDy = pb.y - enemy.y;
            if (Math.sqrt(bDx*bDx + bDy*bDy) < enemy.radius + pb.radius) {
                const damage = pb.damage || 1;
                enemy.health -= damage;
                enemy.hitFlash = 0.8;
                for (let s = 0; s < 8; s++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 4 + 1;
                    hitSparks.push({
                        x: pb.x,
                        y: pb.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: 0.3,
                        color: '#ffff88'
                    });
                }
                playerBullets.splice(j, 1);
                if (enemy.type === 'FATHER') updateFatherPhase(enemy);
                if (enemy.type === 'MOTHER' && enemy.health <= enemy.maxHealth / 2) enemy.furious = true;
                if (enemy.health <= 0) {
                    createDeathExplosion(enemy.x, enemy.y, enemy.color);
                    score += enemy.points;
                    document.getElementById('scoreVal').innerText = score;
                    enemies.splice(i, 1);
                    if (Math.random() < 0.3) {
                        coins += 5 + Math.floor(Math.random() * 10);
                        updateCoinsDisplay();
                    }
                    if (player.health < player.maxHealth) { player.health++; updateHealthUI(); }
                }
                break;
            }
        }
    }

    // Atualizar sparks
    for (let i = hitSparks.length - 1; i >= 0; i--) {
        let s = hitSparks[i];
        s.x += s.vx; s.y += s.vy;
        s.life -= 0.02;
        if (s.life <= 0) hitSparks.splice(i, 1);
    }

    // Atualizar flash de tiro
    for (let i = muzzleFlashes.length - 1; i >= 0; i--) {
        let m = muzzleFlashes[i];
        m.life -= 0.005;
        if (m.life <= 0) muzzleFlashes.splice(i, 1);
    }

    // Atualizar explosões de morte
    for (let i = deathExplosions.length - 1; i >= 0; i--) {
        let de = deathExplosions[i];
        de.timer--;
        let pList = de.particles;
        for (let j = pList.length - 1; j >= 0; j--) {
            let p = pList[j];
            p.x += p.vx; p.y += p.vy;
            p.vx *= 0.97; p.vy *= 0.97;
            p.life -= 0.025;
            p.radius *= 0.99;
            if (p.life <= 0) pList.splice(j, 1);
        }
        if (de.timer <= 0 || de.particles.length === 0) {
            deathExplosions.splice(i, 1);
        }
    }

    // Anel de explosão
    if (explosionRing) {
        explosionRing.radius += 8;
        if (explosionRing.radius >= explosionRing.maxRadius) {
            explosionRing.growing = false;
            explosionRing.alpha -= 0.03;
        }
        if (explosionRing.alpha <= 0) {
            explosionRing = null;
        }
    }

    // Próxima onda - decrementa cooldowns
    if (enemies.length === 0 && !gameOver) {
        for (let key in powerCooldowns) {
            if (powerCooldowns[key] > 0) {
                powerCooldowns[key]--;
            }
        }
        updatePowerUI();

        coins += 10 + wave;
        updateCoinsDisplay();
        wave++;
        savedWave = wave;
        document.getElementById('waveText').innerText = `ONDA: ${wave}`;
        spawnWave();
        freezeActive = false;
        enemies.forEach(enemy => enemy.frozen = false);
    }

    // Explosão ativa
    if (explosionActive) {
        if (now > explosionTimer) {
            explosionActive = false;
            explosionParticles = [];
        } else {
            for (let i = explosionParticles.length - 1; i >= 0; i--) {
                const p = explosionParticles[i];
                p.x += p.vx; p.y += p.vy;
                p.vx *= 0.98; p.vy *= 0.98;
                p.life -= 0.02;
                p.radius *= 0.99;
                if (p.life <= 0) explosionParticles.splice(i, 1);
            }
        }
    }

    // Congelamento
    if (freezeActive && now > freezeTimer) {
        freezeActive = false;
        enemies.forEach(enemy => enemy.frozen = false);
    }
}

// ============================================================
//  DRAW
// ============================================================
function drawEnemy(enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    const color = enemy.hitFlash > 0 ? '#ffffff' : enemy.color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = color;
    const r = enemy.radius;
    switch(enemy.type) {
        case 'NORMAL':
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.lineTo(-r, -r * 0.8);
            ctx.lineTo(-r * 0.4, 0);
            ctx.lineTo(-r, r * 0.8);
            ctx.closePath();
            ctx.fill();
            break;
        case 'DIAMOND':
            ctx.beginPath();
            ctx.moveTo(0, -r);
            ctx.lineTo(r, 0);
            ctx.lineTo(0, r);
            ctx.lineTo(-r, 0);
            ctx.closePath();
            ctx.fill();
            break;
        case 'CIRCLE':
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'SQUARE':
            ctx.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
            break;
        case 'TRIANGLE':
            ctx.beginPath();
            ctx.moveTo(0, -r);
            ctx.lineTo(r * 0.87, r * 0.5);
            ctx.lineTo(-r * 0.87, r * 0.5);
            ctx.closePath();
            ctx.fill();
            break;
        case 'MOTHER':
            ctx.shadowBlur = 25;
            ctx.shadowColor = enemy.furious ? '#ff4400' : '#ff0000';
            if (enemy.furious) { const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7; ctx.globalAlpha = pulse; }
            ctx.beginPath();
            ctx.moveTo(0, -r);
            ctx.lineTo(r * 0.6, -r * 0.3);
            ctx.lineTo(r * 0.8, 0);
            ctx.lineTo(r * 0.6, r * 0.3);
            ctx.lineTo(0, r);
            ctx.lineTo(-r * 0.6, r * 0.3);
            ctx.lineTo(-r * 0.8, 0);
            ctx.lineTo(-r * 0.6, -r * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = enemy.furious ? '#ff8800' : '#ff4400';
            ctx.shadowColor = enemy.furious ? '#ff8800' : '#ff4400';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(r * 0.3, -r * 0.1);
            ctx.lineTo(r * 1.2, -r * 0.6);
            ctx.lineTo(r * 0.8, 0);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-r * 0.3, -r * 0.1);
            ctx.lineTo(-r * 1.2, -r * 0.6);
            ctx.lineTo(-r * 0.8, 0);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = enemy.furious ? '#ffcc00' : '#ff8800';
            ctx.shadowColor = enemy.furious ? '#ffcc00' : '#ff8800';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, -r * 0.2, r * 0.25, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(-r, -r - 20, r * 2, 8);
            ctx.fillStyle = enemy.furious ? '#ff4400' : '#ff0000';
            const hp = enemy.health / enemy.maxHealth;
            ctx.fillRect(-r, -r - 20, r * 2 * hp, 8);
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${enemy.health}/${enemy.maxHealth}`, 0, -r - 13);
            if (enemy.furious) {
                ctx.fillStyle = '#ff4400';
                ctx.font = 'bold 12px Arial';
                ctx.fillText('⚡ FURIOSA ⚡', 0, r + 18);
            }
            break;
        case 'FATHER':
            ctx.shadowBlur = 30;
            ctx.shadowColor = enemy.phase >= 2 ? '#ff00ff' : (enemy.phase >= 1 ? '#ff44ff' : '#ff88ff');
            const glow = enemy.phase >= 2 ? 0.8 : (enemy.phase >= 1 ? 0.5 : 0.3);
            ctx.globalAlpha = 0.7 + Math.sin(Date.now() / 200) * glow * 0.3;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
                const outerR = r, innerR = r * 0.5;
                if (i === 0) ctx.moveTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
                else {
                    ctx.lineTo(Math.cos(angle - Math.PI/6) * innerR, Math.sin(angle - Math.PI/6) * innerR);
                    ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
                }
            }
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = '#ff88ff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(-r, -r - 25, r * 2, 10);
            let barColor = '#ff88ff';
            if (enemy.phase >= 2) barColor = '#ff00ff';
            else if (enemy.phase >= 1) barColor = '#ff44ff';
            ctx.fillStyle = barColor;
            const hpP = enemy.health / enemy.maxHealth;
            ctx.fillRect(-r, -r - 25, r * 2 * hpP, 10);
            ctx.fillStyle = '#fff';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${enemy.health}/${enemy.maxHealth}`, 0, -r - 17);
            let phaseText = '';
            if (enemy.phase === 3) phaseText = '⚡ FASE 3 ⚡';
            else if (enemy.phase === 2) phaseText = '🌀 FASE 2 🌀';
            else if (enemy.phase === 1) phaseText = '🔱 FASE 1 🔱';
            if (phaseText) {
                ctx.fillStyle = '#ff88ff';
                ctx.font = 'bold 12px Arial';
                ctx.shadowColor = '#ff88ff';
                ctx.shadowBlur = 15;
                ctx.fillText(phaseText, 0, r + 22);
                ctx.shadowBlur = 0;
            }
            break;
    }
    ctx.restore();
    ctx.shadowBlur = 0;
}

function draw() {
    ctx.fillStyle = '#02020a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    laserParticles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    mines.forEach(mine => {
        const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#ff4400';
        ctx.shadowColor = '#ff4400';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(mine.x, mine.y, mine.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff8800';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(mine.x, mine.y, mine.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    });

    hitSparks.forEach(s => {
        ctx.globalAlpha = s.life;
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    muzzleFlashes.forEach(m => {
        ctx.globalAlpha = m.life * 2;
        const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 20);
        grad.addColorStop(0, 'rgba(255, 255, 200, 1)');
        grad.addColorStop(0.3, 'rgba(255, 200, 100, 0.8)');
        grad.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 20, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    deathExplosions.forEach(de => {
        de.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    if (explosionRing) {
        ctx.globalAlpha = explosionRing.alpha * 0.6;
        ctx.strokeStyle = '#ff8800';
        ctx.shadowColor = '#ff4400';
        ctx.shadowBlur = 30;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(explosionRing.x, explosionRing.y, explosionRing.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#ffcc00';
        ctx.shadowColor = '#ff8800';
        ctx.shadowBlur = 20;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(explosionRing.x, explosionRing.y, explosionRing.radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    explosionParticles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    cloneBullets.forEach(b => {
        ctx.fillStyle = '#44ff88';
        ctx.shadowColor = '#44ff88';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    playerBullets.forEach(b => {
        ctx.fillStyle = b.homing ? '#ff44ff' : '#ffff00';
        ctx.shadowColor = b.homing ? '#ff44ff' : '#ffff00';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        if (b.homing) {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#ff44ff';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(b.x - b.vx * 0.5, b.y - b.vy * 0.5, b.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    });

    enemyBullets.forEach(eb => {
        const color = eb.reflected ? '#44ffff' : '#ff4400';
        ctx.fillStyle = color;
        ctx.shadowColor = eb.reflected ? '#44ffff' : '#ff2200';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(eb.x, eb.y, eb.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = eb.reflected ? '#44ffff' : '#ff8800';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(eb.x - eb.vx * 0.4, eb.y - eb.vy * 0.4, eb.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    if (shieldActive) {
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.5)';
        ctx.shadowColor = '#00ccff';
        ctx.shadowBlur = 30;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.2)';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    if (berserkActive) {
        ctx.shadowColor = '#ff4400';
        ctx.shadowBlur = 30;
    }

    let fireGrad = ctx.createLinearGradient(-player.radius, -5, -player.radius - 15, -5);
    fireGrad.addColorStop(0, '#ffff00');
    fireGrad.addColorStop(0.5, '#ff8800');
    fireGrad.addColorStop(1, '#ff4400');
    ctx.fillStyle = fireGrad;
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 20;
    ctx.fillRect(-player.radius - 5, -6, -15, 12);
    ctx.shadowBlur = 8;
    ctx.fillRect(-player.radius - 2, -4, -8, 8);

    const shipConfig = SHIP_CONFIGS[player.shipType];
    let playerGrad = ctx.createLinearGradient(-player.radius, -player.radius, player.radius, player.radius);
    playerGrad.addColorStop(0, shipConfig.color);
    playerGrad.addColorStop(1, '#004488');
    ctx.fillStyle = playerGrad;
    ctx.shadowColor = shipConfig.color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(player.radius, 0);
    ctx.lineTo(-player.radius, -player.radius);
    ctx.lineTo(-player.radius, player.radius);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 5;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(player.radius * 0.3, 0);
    ctx.lineTo(-player.radius * 0.3, -player.radius * 0.5);
    ctx.moveTo(player.radius * 0.3, 0);
    ctx.lineTo(-player.radius * 0.3, player.radius * 0.5);
    ctx.stroke();

    if (speedBoostActive) {
        ctx.shadowBlur = 0;
        for (let i = 0; i < 8; i++) {
            const angle = -player.angle + Math.PI + (Math.random() - 0.5) * 0.5;
            const dist = 15 + Math.random() * 20;
            ctx.fillStyle = `rgba(100, 255, 50, ${0.3 + Math.random() * 0.3})`;
            ctx.shadowColor = '#88ff44';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(-dist, (Math.random() - 0.5) * 15, 2 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
    ctx.shadowBlur = 0;

    enemies.forEach(enemy => drawEnemy(enemy));
    ctx.shadowBlur = 0;

    if (teleportActive) {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 24px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillText('Clique em um local para teleportar', canvas.width/2, 50);
        ctx.shadowBlur = 0;
        canvas.style.cursor = 'crosshair';
    } else {
        canvas.style.cursor = 'default';
    }

    if (freezeActive) {
        ctx.fillStyle = 'rgba(0, 150, 255, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4488ff';
        ctx.font = '18px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#4488ff';
        ctx.shadowBlur = 10;
        ctx.fillText('❄️ CONGELADO ❄️', canvas.width/2, 80);
        ctx.shadowBlur = 0;
    }

    if (reflectActive) {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#44ffff';
        ctx.font = '16px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#44ffff';
        ctx.shadowBlur = 10;
        ctx.fillText('🔄 REFLETINDO BALAS', canvas.width/2, 110);
        ctx.shadowBlur = 0;
    }

    if (gravityActive) {
        ctx.fillStyle = 'rgba(136, 68, 255, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const pulse = Math.sin(Date.now() / 500) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(136, 68, 255, ${pulse * 0.1})`;
        ctx.shadowColor = '#8844ff';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 200, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    if (gameOver) {
        ctx.fillStyle = 'rgba(3, 3, 15, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff0055';
        ctx.font = 'bold 45px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 15;
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = '22px "Segoe UI", sans-serif';
        ctx.fillText(`Sobreviveu até a Onda: ${wave} | Pontos: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
        ctx.font = '18px "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`🪙 Moedas ganhas: ${coins}`, canvas.width / 2, canvas.height / 2 + 55);
        ctx.fillStyle = '#8a8ab0';
        ctx.fillText('Voltando ao menu...', canvas.width / 2, canvas.height / 2 + 95);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ============================================================
//  INICIALIZAÇÃO
// ============================================================
initPowers();
menuActive = true;
menuOverlay.style.display = 'flex';
hudContainer.style.display = 'none';
instrucoes.style.display = 'none';
document.getElementById('currentWaveInfo').textContent = `🌊 Começando da Onda: ${savedWave}`;
initStars();
initPlayer('balanced');
renderPowersGrid();
gameLoop();