import { Entity } from './entity.js';

export class Player extends Entity {
    constructor(x, y) {
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
        
        // Sprite configuration (ready for sprite sheet)
        this.spriteWidth = 64;
        this.spriteHeight = 64;
        this.currentFrame = 0;
        this.frameCount = 4;
        this.frameTime = 0;
        this.frameDuration = 0.1;
        
        // 8 directions: N, NE, E, SE, S, SW, W, NW
        this.direction = 4; // South by default
        this.isMoving = false;
        
        this.spriteSheet = null; // Will hold the sprite sheet image
    }

    loadSpriteSheet(imagePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.spriteSheet = img;
                resolve();
            };
            img.onerror = reject;
            img.src = imagePath;
        });
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        this.isMoving = this.velocityX !== 0 || this.velocityY !== 0;
        
        if (this.isMoving) {
            this.updateDirection();
            this.updateAnimation(deltaTime);
        } else {
            this.currentFrame = 0;
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

    getSpritePosition() {
        // Returns the position in the sprite sheet
        // Assuming sprite sheet layout: 8 rows (directions) x 4 columns (frames)
        return {
            x: this.currentFrame * this.spriteWidth,
            y: this.direction * this.spriteHeight
        };
    }

    levelUp() {
        super.levelUp();
        this.gold += 50; // Bonus gold on level up
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