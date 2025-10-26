export class Entity {
    constructor(x, y, stats = {}) {
        this.x = x;
        this.y = y;
        this.previousX = x;
        this.previousY = y;
        
        this.maxHealth = stats.maxHealth || 100;
        this.currentHealth = this.maxHealth;
        this.damage = stats.damage || 10;
        this.criticalChance = stats.criticalChance || 0.1;
        this.criticalMultiplier = stats.criticalMultiplier || 2.0;
        this.defense = stats.defense || 0;
        
        this.level = stats.level || 1;
        this.experience = 0;
        this.experienceToNextLevel = this.calculateExperienceRequired();
        
        this.speed = stats.speed || 100;
        this.attackCooldown = stats.attackCooldown || 1.0;
        this.lastAttackTime = 0;
        
        this.velocityX = 0;
        this.velocityY = 0;
    }

    calculateExperienceRequired() {
        return Math.floor(100 * Math.pow(1.5, this.level - 1));
    }

    takeDamage(damageInfo) {
        const actualDamage = Math.max(1, damageInfo.value - this.defense);
        this.currentHealth = Math.max(0, this.currentHealth - actualDamage);
        return actualDamage;
    }

    heal(amount) {
        const healAmount = Math.min(amount, this.maxHealth - this.currentHealth);
        this.currentHealth += healAmount;
        return healAmount;
    }

    attack(target) {
        const isCritical = Math.random() < this.criticalChance;
        const damageValue = isCritical 
            ? Math.floor(this.damage * this.criticalMultiplier)
            : this.damage;
        
        const damageInfo = {
            value: damageValue,
            isCritical: isCritical
        };
        
        target.takeDamage(damageInfo);
        this.lastAttackTime = performance.now();
        
        return damageInfo;
    }

    canAttack() {
        const currentTime = performance.now();
        return (currentTime - this.lastAttackTime) >= (this.attackCooldown * 1000);
    }

    gainExperience(amount) {
        this.experience += amount;
        
        const levelsGained = [];
        while (this.experience >= this.experienceToNextLevel) {
            this.experience -= this.experienceToNextLevel;
            this.levelUp();
            levelsGained.push(this.level);
        }
        
        return levelsGained;
    }

    levelUp() {
        this.level++;
        
        const healthIncrease = Math.floor(this.maxHealth * 0.1);
        this.maxHealth += healthIncrease;
        this.currentHealth = this.maxHealth;
        
        this.damage += Math.floor(this.damage * 0.15);
        this.defense += 1;
        this.criticalChance = Math.min(0.5, this.criticalChance + 0.01);
        
        this.experienceToNextLevel = this.calculateExperienceRequired();
    }

    isDead() {
        return this.currentHealth <= 0;
    }

    update(deltaTime) {
        this.previousX = this.x;
        this.previousY = this.y;
        
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }

    setVelocity(vx, vy) {
        const magnitude = Math.sqrt(vx * vx + vy * vy);
        
        if (magnitude > 0) {
            this.velocityX = (vx / magnitude) * this.speed;
            this.velocityY = (vy / magnitude) * this.speed;
        } else {
            this.velocityX = 0;
            this.velocityY = 0;
        }
    }

    getStats() {
        return {
            level: this.level,
            health: this.currentHealth,
            maxHealth: this.maxHealth,
            damage: this.damage,
            defense: this.defense,
            criticalChance: this.criticalChance,
            experience: this.experience,
            experienceToNextLevel: this.experienceToNextLevel
        };
    }
}