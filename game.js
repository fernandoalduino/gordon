import { Player } from './entities/player-with-sprite.js';
import { Enemy } from './entities/enemy.js';
import { MapGenerator } from './map/mapGenerator.js';
import { InputHandler } from './input/inputHandler.js';
import { Camera } from './camera.js';
import { UIManager } from './ui/uiManager.js';
import { CollisionDetector } from './physics/collisionDetector.js';
import { ENTITY_SIZE, TILE_SIZE } from './constants.js';
import { PowerUpManager } from './powerups/powerupManager.js';
import { PowerUpPickup } from './powerups/powerupPickup.js';
import { PowerUpUI } from './ui/powerupUI.js';
import { SpriteLoader } from './sprites/spriteLoader.js';
import { SpriteRenderer } from './sprites/spriteRenderer.js';

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.isRunning = false;
        this.lastTime = 0;
        this.isLoading = true;
        
        // Sistema de sprites
        this.spriteLoader = new SpriteLoader();
        this.spriteRenderer = new SpriteRenderer();
        
        this.initializeGame();
    }

    async initializeGame() {
        // Carregar sprites
        await this.loadSprites();
        
        const seed = Math.floor(Math.random() * 1000000);
        console.log('Map Seed:', seed);
        
        this.mapGenerator = new MapGenerator(seed, 100, 100);
        this.map = this.mapGenerator.generate();
        
        const spawnPoint = this.mapGenerator.getSpawnPoint();
        
        // Criar player com sprite
        const playerSprite = this.spriteLoader.getSprite('player');
        this.player = new Player(spawnPoint.x, spawnPoint.y, playerSprite, this.spriteRenderer);
        
        this.camera = new Camera(this.canvas.width, this.canvas.height, this.map.width * TILE_SIZE, this.map.height * TILE_SIZE);
        this.inputHandler = new InputHandler();
        this.uiManager = new UIManager();
        this.collisionDetector = new CollisionDetector(this.map);
        
        // Sistema de Power-ups
        this.powerUpManager = new PowerUpManager(this.player);
        this.powerUpUI = new PowerUpUI();
        this.powerUpPickups = [];
        
        this.enemies = this.spawnEnemies(80);
        
        // Spawnar alguns power-ups no mapa
        this.spawnPowerUpPickups(3);
        
        this.inputHandler.setupControls(this.player);
        
        // Tecla P para adicionar power-up (debug)
        this.setupDebugControls();
        
        this.isLoading = false;
        console.log('✅ Jogo inicializado com sprites!');
    }

    async loadSprites() {
        console.log('🎨 Carregando sprites...');
        
        // Carregar sprite sheet do player
        // IMPORTANTE: Coloque o arquivo da sprite sheet na pasta do projeto
        // e ajuste o caminho abaixo
        this.spriteLoader.loadSprite('player', './sprites/viado.png');
        
        // Aguardar todos os sprites carregarem
        const success = await this.spriteLoader.waitForAll();
        
        if (!success) {
            console.warn('⚠️ Alguns sprites não carregaram. Usando renderização de fallback.');
        }
    }

    setupDebugControls() {
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'p') {
                this.powerUpManager.addPowerUp('damage_aura');
                this.uiManager.addMessage('Aura de Dano ativada! (Debug)', 'info');
            }
        });
    }

    spawnEnemy(x = null, y = null) {
        const enemy = new Enemy(x, y, this.player.level);
        return enemy;
    }

    spawnEnemies(count) {
        const enemies = [];
        for (let i = 0; i < count; i++) {
            const spawnPoint = this.mapGenerator.getRandomWalkablePosition();
            const enemy = this.spawnEnemy(spawnPoint.x, spawnPoint.y);
            enemies.push(enemy);
        }
        return enemies;
    }

    spawnPowerUpPickups(count) {
        for (let i = 0; i < count; i++) {
            const spawnPoint = this.mapGenerator.getRandomWalkablePosition();
            const pickup = PowerUpPickup.createDamageAuraPickup(spawnPoint.x, spawnPoint.y);
            this.powerUpPickups.push(pickup);
        }
    }

    start() {
        if (this.isLoading) {
            console.log('⏳ Aguardando carregamento...');
            setTimeout(() => this.start(), 100);
            return;
        }
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.inputHandler.update();
        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Store previous position
        const prevX = this.player.x;
        const prevY = this.player.y;
        
        this.player.update(deltaTime);
        
        // Check collision with new position
        if (this.collisionDetector.checkCollision(
            { x: this.player.x, y: this.player.y }, 
            ENTITY_SIZE.PLAYER.width, 
            ENTITY_SIZE.PLAYER.height
        )) {
            this.player.x = prevX;
            this.player.y = prevY;
        }
        
        // Atualizar power-ups (passa os inimigos para a aura de dano)
        this.powerUpManager.update(deltaTime, this.enemies);
        
        // Atualizar pickups de power-ups
        this.powerUpPickups.forEach(pickup => {
            pickup.update(deltaTime, this.player);
            
            if (pickup.isCollected) {
                this.powerUpManager.addPowerUp(pickup.powerUpId);
                this.uiManager.addMessage(`${pickup.name} coletado!`, 'info');
            }
        });
        
        // Remover pickups coletados
        this.powerUpPickups = this.powerUpPickups.filter(p => !p.isCollected);
        
        this.enemies.forEach(enemy => {
            const enemyPrevX = enemy.x;
            const enemyPrevY = enemy.y;
            
            enemy.update(deltaTime, this.player);
            
            // Check enemy collision
            if (this.collisionDetector.checkCollision(
                { x: enemy.x, y: enemy.y }, 
                ENTITY_SIZE.ENEMY.width, 
                ENTITY_SIZE.ENEMY.height
            )) {
                enemy.x = enemyPrevX;
                enemy.y = enemyPrevY;
            }
            
            if (this.checkEntityCollision(this.player, enemy)) {
                if (enemy.canAttack()) {
                    const damage = enemy.attack(this.player);
                    if (damage.isCritical) {
                        this.uiManager.addMessage(`Inimigo causou ${damage.value} de dano CRÍTICO!`, 'critical');
                    } else {
                        this.uiManager.addMessage(`Inimigo causou ${damage.value} de dano`, 'damage');
                    }
                    
                    if (this.player.isDead()) {
                        this.gameOver();
                    }
                }
            }
        });
        
        // Remover inimigos mortos e spawnar power-ups
        const deadEnemies = this.enemies.filter(enemy => enemy.isDead());
        deadEnemies.forEach(enemy => {
            // 20% de chance de dropar power-up
            if (Math.random() < 0.2) {
                const pickup = PowerUpPickup.createDamageAuraPickup(enemy.x, enemy.y);
                this.powerUpPickups.push(pickup);
            }
        });
        
        this.enemies = this.enemies.filter(enemy => !enemy.isDead());
        
        // Spawnar mais inimigos se houver poucos
        if (this.enemies.length < 3) {
            this.enemies.push(...this.spawnEnemies(2));
        }
        
        this.checkChestInteraction();
        
        this.camera.follow(this.player);
        this.uiManager.update(this.player);
        this.powerUpUI.update(this.powerUpManager);
    }

    checkEntityCollision(entity1, entity2) {
        const distance = Math.sqrt(
            Math.pow(entity1.x - entity2.x, 2) + 
            Math.pow(entity1.y - entity2.y, 2)
        );
        return distance < 28;
    }

    checkChestInteraction() {
        if (this.inputHandler.isActionPressed()) {
            const playerTileX = Math.floor(this.player.x / TILE_SIZE);
            const playerTileY = Math.floor(this.player.y / TILE_SIZE);
            
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const tileX = playerTileX + dx;
                    const tileY = playerTileY + dy;
                    
                    if (this.map.isChest(tileX, tileY) && !this.map.isChestOpened(tileX, tileY)) {
                        const chestCost = 50;
                        if (this.player.gold >= chestCost) {
                            this.player.gold -= chestCost;
                            this.map.openChest(tileX, tileY);
                            
                            const reward = Math.floor(Math.random() * 100) + 50;
                            this.player.addExp(1000);
                            this.player.gold += reward;
                            this.uiManager.addMessage(`Baú aberto! Ganhou ${reward} de ouro (custo: ${chestCost})`, 'info');
                        } else {
                            this.uiManager.addMessage(`Ouro insuficiente! Precisa de ${chestCost} ouro`, 'damage');
                        }
                    }
                }
            }
        }
    }

    gameOver() {
        this.uiManager.addMessage('GAME OVER!', 'damage');
        this.isRunning = false;
        setTimeout(() => {
            if (confirm('Game Over! Jogar novamente?')) {
                this.powerUpUI.destroy();
                this.initializeGame();
            }
        }, 100);
    }

    render() {
        if (this.isLoading) {
            this.renderLoading();
            return;
        }

        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        this.renderMap();
        
        // Renderizar power-ups no chão
        this.powerUpPickups.forEach(pickup => pickup.render(this.ctx));
        
        // Renderizar efeitos de power-ups (aura)
        this.powerUpManager.render(this.ctx, this.camera);
        
        this.renderEnemies();
        
        // Renderizar player com sprite
        this.player.render(this.ctx, this.camera);
        
        // Renderizar health bar do player
        this.renderHealthBar(this.player);

        this.ctx.restore();
    }

    renderLoading() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Carregando sprites...', this.canvas.width / 2, this.canvas.height / 2);
    }

    renderMap() {
        const startX = Math.floor(this.camera.x / TILE_SIZE);
        const startY = Math.floor(this.camera.y / TILE_SIZE);
        const endX = Math.ceil((this.camera.x + this.canvas.width) / TILE_SIZE);
        const endY = Math.ceil((this.camera.y + this.canvas.height) / TILE_SIZE);

        for (let y = Math.max(0, startY); y < Math.min(this.map.height, endY); y++) {
            for (let x = Math.max(0, startX); x < Math.min(this.map.width, endX); x++) {
                const tile = this.map.getTile(x, y);
                this.ctx.fillStyle = this.getTileColor(tile, x, y);
                this.ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                
                this.ctx.strokeStyle = '#333';
                this.ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    getTileColor(tile, x, y) {
        switch(tile) {
            case 0: return '#2d5016'; // Floor
            case 1: return '#4a4a4a'; // Wall
            case 2: return this.map.isChestOpened(x, y) ? '#8b4513' : '#d4af37'; // Chest
            default: return '#2d5016';
        }
    }

    renderEnemies() {
        this.enemies.forEach(enemy => {
            const halfSize = ENTITY_SIZE.ENEMY.renderSize / 2;
            
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fillRect(enemy.x - halfSize, enemy.y - halfSize, ENTITY_SIZE.ENEMY.renderSize, ENTITY_SIZE.ENEMY.renderSize);
            
            this.ctx.fillStyle = '#c0392b';
            this.ctx.fillRect(enemy.x - halfSize + 4, enemy.y - halfSize + 4, ENTITY_SIZE.ENEMY.renderSize - 8, ENTITY_SIZE.ENEMY.renderSize - 8);
            
            this.renderHealthBar(enemy);
        });
    }

    renderHealthBar(entity) {
        const barWidth = 32;
        const barHeight = 4;
        const x = entity.x - barWidth / 2;
        const y = entity.y - 24;
        
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x - 1, y - 1, barWidth + 2, barHeight + 2);
        
        this.ctx.fillStyle = '#c0392b';
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        const healthPercent = entity.currentHealth / entity.maxHealth;
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    }
}