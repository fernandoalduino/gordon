import { Entity } from './entity.js';

export class Player extends Entity {
    constructor(x, y, spriteSheet = null, spriteRenderer = null) {
        super(x, y, {
            maxHealth: 100,
            damage: 15,
            criticalChance: 0.15,
            criticalMultiplier: 2.5,
            defense: 5,
            speed: 150,
            attackCooldown: 0.5,
            level: 1
        });
        
        this.gold = 100;
        this.inventory = [];
        
        // Sprite configuration
        this.spriteSheet = spriteSheet;
        this.spriteRenderer = spriteRenderer;
        this.currentFrame = 0;
        this.frameCount = 8;        // 8 frames de animação
        this.frameTime = 0;
        this.frameDuration = 0.12;  // Velocidade da animação (ajustado)
        
        // 8 directions: 0=E, 1=SE, 2=S, 3=SW, 4=W, 5=NW, 6=N, 7=NE
        this.direction = 2;         // South by default
        this.isMoving = false;
        
        // Renderização
        this.useSprite = spriteSheet !== null && spriteRenderer !== null;
    }

    setSpriteSheet(spriteSheet, spriteRenderer) {
        this.spriteSheet = spriteSheet;
        this.spriteRenderer = spriteRenderer;
        this.useSprite = true;
        console.log('✅ Sprite sheet configurado no player!');
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        this.isMoving = this.velocityX !== 0 || this.velocityY !== 0;
        
        if (this.isMoving) {
            this.updateDirection();
            this.updateAnimation(deltaTime);
        } else {
            this.currentFrame = 0; // Frame parado
        }
    }

    updateDirection() {
        const angle = Math.atan2(this.velocityY, this.velocityX);
        const degrees = angle * (180 / Math.PI);
        
        // Convert angle to 8 directions
        // 0: E, 1: SE, 2: S, 3: SW, 4: W, 5: NW, 6: N, 7: NE
        if (degrees >= -22.5 && degrees < 22.5) {
            this.direction = 0; // East
        } else if (degrees >= 22.5 && degrees < 67.5) {
            this.direction = 1; // Southeast
        } else if (degrees >= 67.5 && degrees < 112.5) {
            this.direction = 2; // South
        } else if (degrees >= 112.5 && degrees < 157.5) {
            this.direction = 3; // Southwest
        } else if (degrees >= 157.5 || degrees < -157.5) {
            this.direction = 4; // West
        } else if (degrees >= -157.5 && degrees < -112.5) {
            this.direction = 5; // Northwest
        } else if (degrees >= -112.5 && degrees < -67.5) {
            this.direction = 6; // North
        } else if (degrees >= -67.5 && degrees < -22.5) {
            this.direction = 7; // Northeast
        }
    }

    updateAnimation(deltaTime) {
        this.frameTime += deltaTime;
        
        if (this.frameTime >= this.frameDuration) {
            this.frameTime = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        }
    }

    render(ctx, camera) {
        if (this.useSprite && this.spriteSheet && this.spriteRenderer) {
            this.renderWithSprite(ctx);
        } else {
            this.renderFallback(ctx);
        }
    }

    renderWithSprite(ctx) {
        const row = this.spriteRenderer.getRowFromDirection(this.direction);
        const needsFlip = this.spriteRenderer.needsFlip(this.direction);
        
        // Usar a escala configurada no spriteRenderer
        const scale = this.spriteRenderer.config.scale;
        
        if (needsFlip) {
            this.spriteRenderer.renderSpriteFlipped(
                ctx,
                this.spriteSheet,
                this.currentFrame,
                row,
                this.x,
                this.y,
                true,   // flip horizontal
                false,
                scale
            );
        } else {
            this.spriteRenderer.renderSprite(
                ctx,
                this.spriteSheet,
                this.currentFrame,
                row,
                this.x,
                this.y,
                scale
            );
        }
    }

    renderFallback(ctx) {
        // Renderização de fallback (quadrado azul)
        const size = 32;
        const halfSize = size / 2;
        
        ctx.fillStyle = '#3498db';
        ctx.fillRect(this.x - halfSize, this.y - halfSize, size, size);
        
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(this.x - halfSize + 4, this.y - halfSize + 4, size - 8, size - 8);
    }

    levelUp() {
        super.levelUp();
        this.gold += 50;
    }

    addGold(amount) {
        this.gold += amount;
    }

    removeGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }

    addExp(amount) {
        const levelsGained = this.gainExperience(amount);
        return levelsGained;
    }

    addToInventory(item) {
        this.inventory.push(item);
    }

    useHealthPotion() {
        const potionIndex = this.inventory.findIndex(item => item.type === 'health_potion');
        if (potionIndex !== -1) {
            const healAmount = this.heal(50);
            this.inventory.splice(potionIndex, 1);
            return healAmount;
        }
        return 0;
    }
}