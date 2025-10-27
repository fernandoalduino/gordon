import { Entity } from './entity.js';

export class Enemy extends Entity {
    constructor(x, y, level = 1) {
        const stats = Enemy.generateStatsForLevel(level);
        super(x, y, stats);
        
        this.attackCooldown = 0.1
        this.aggroRange = Infinity;
        this.attackRange = 27;
        this.isAggro = false;
        this.wanderTime = 0;
        this.wanderDuration = 2;
        this.wanderDirection = { x: 0, y: 0 };
        
        // Sprite configuration
        this.spriteWidth = 128;
        this.spriteHeight = 128;
        this.currentFrame = 0;
        this.frameCount = 4;
        this.frameTime = 0;
        this.frameDuration = 0.15;
        this.direction = 4;
        this.isMoving = false;
        
        this.experienceReward = Math.floor(50 * Math.pow(1.3, level - 1));
        this.goldReward = Math.floor(10 * Math.pow(1.2, level - 1));
    }

    static generateStatsForLevel(level) {
        return {
            maxHealth: Math.floor(80 * Math.pow(1.2, level - 1)),
            damage: Math.floor(8 * Math.pow(1.15, level - 1)),
            criticalChance: 0.05 + (level * 0.01),
            criticalMultiplier: 1.8,
            defense: Math.floor(2 * Math.pow(1.1, level - 1)),
            speed: 80,
            attackCooldown: 1.5,
            level: level
        };
    }

    update(deltaTime, player) {
        const distanceToPlayer = this.getDistanceTo(player);
        
        if (distanceToPlayer <= this.aggroRange) {
            this.isAggro = true;
        }
        
        if (this.isAggro) {
            if (distanceToPlayer > this.attackRange) {
                this.moveTowards(player);
            } else {
                this.setVelocity(0, 0);
            }
        } else {
            this.wander(deltaTime);
        }
        
        super.update(deltaTime);
        
        this.isMoving = this.velocityX !== 0 || this.velocityY !== 0;
        if (this.isMoving) {
            this.updateDirection();
            this.updateAnimation(deltaTime);
        } else {
            this.currentFrame = 0;
        }
    }

    getDistanceTo(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    moveTowards(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.setVelocity(dx / distance, dy / distance);
        }
    }

    wander(deltaTime) {
        this.wanderTime += deltaTime;
        
        if (this.wanderTime >= this.wanderDuration) {
            this.wanderTime = 0;
            
            if (Math.random() < 0.3) {
                this.setVelocity(0, 0);
            } else {
                const angle = Math.random() * Math.PI * 2;
                this.wanderDirection = {
                    x: Math.cos(angle),
                    y: Math.sin(angle)
                };
                this.setVelocity(this.wanderDirection.x * 0.5, this.wanderDirection.y * 0.5);
            }
        }
    }

    updateDirection() {
        if (this.velocityX === 0 && this.velocityY === 0) return;
        
        const angle = Math.atan2(this.velocityY, this.velocityX);
        const degrees = angle * (180 / Math.PI);
        
        if (degrees >= -22.5 && degrees < 22.5) {
            this.direction = 0;
        } else if (degrees >= 22.5 && degrees < 67.5) {
            this.direction = 1;
        } else if (degrees >= 67.5 && degrees < 112.5) {
            this.direction = 2;
        } else if (degrees >= 112.5 && degrees < 157.5) {
            this.direction = 3;
        } else if (degrees >= 157.5 || degrees < -157.5) {
            this.direction = 4;
        } else if (degrees >= -157.5 && degrees < -112.5) {
            this.direction = 5;
        } else if (degrees >= -112.5 && degrees < -67.5) {
            this.direction = 6;
        } else if (degrees >= -67.5 && degrees < -22.5) {
            this.direction = 7;
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
        return {
            x: this.currentFrame * this.spriteWidth,
            y: this.direction * this.spriteHeight
        };
    }

    getRewards() {
        return {
            experience: this.experienceReward,
            gold: this.goldReward
        };
    }
}