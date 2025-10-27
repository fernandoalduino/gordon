import { PowerUp } from './powerups.js';

export class DamageAura extends PowerUp {
    constructor() {
        super({
            id: 'damage_aura',
            name: 'Aura de Dano',
            description: 'Causa dano aos inimigos próximos',
            duration: 30 // 30 segundos
        });

        this.radius = 100;
        this.damagePerSecond = 15;
        this.damageTimer = 0;
        this.damageInterval = 0.5; // Dano a cada 0.5 segundos
        
        // Efeitos visuais
        this.pulseTime = 0;
        this.pulseSpeed = 2;
        this.color = { r: 255, g: 100, b: 100 };
        this.affectedEnemies = new Set();
    }

    onActivate(player) {
        console.log(`${this.name} ativado!`);
        this.damagePerSecond += player.damage;
        this.damageTimer = 0;
        this.pulseTime = 0;
        this.affectedEnemies.clear();
    }

    onDeactivate() {
        console.log(`${this.name} desativado!`);
        this.affectedEnemies.clear();
    }

    onUpdate(deltaTime, enemies) {
        this.damageTimer += deltaTime;
        this.pulseTime += deltaTime * this.pulseSpeed;

        if (this.damageTimer >= this.damageInterval) {
            this.damageTimer = 0;
            this.applyDamageToNearbyEnemies(enemies);
        }
    }

    applyDamageToNearbyEnemies(enemies) {
        if (!this.owner) return;

        this.affectedEnemies.clear();

        enemies.forEach(enemy => {
            const distance = this.getDistanceTo(enemy);
            
            if (distance <= this.radius) {
                this.affectedEnemies.add(enemy);
                
                const damageInfo = {
                    value: this.damagePerSecond * this.damageInterval,
                    isCritical: false
                };
                
                enemy.takeDamage(damageInfo);
            }
        });
    }

    getDistanceTo(target) {
        const dx = target.x - this.owner.x;
        const dy = target.y - this.owner.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    render(ctx, camera) {
        if (!this.isActive || !this.owner) return;

        ctx.save();

        // Desenhar múltiplas ondas de aura
        const numWaves = 3;
        for (let i = 0; i < numWaves; i++) {
            const waveOffset = (i / numWaves) * Math.PI * 2;
            const pulse = Math.sin(this.pulseTime + waveOffset) * 0.15 + 0.85;
            const currentRadius = this.radius * pulse;
            
            // Gradiente radial
            const gradient = ctx.createRadialGradient(
                this.owner.x, this.owner.y, 0,
                this.owner.x, this.owner.y, currentRadius
            );
            
            const alpha = 0.15 - (i * 0.04);
            gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`);
            gradient.addColorStop(0.7, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.5})`);
            gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.owner.x, this.owner.y, currentRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Desenhar borda pulsante
        const borderPulse = Math.sin(this.pulseTime * 2) * 0.3 + 0.7;
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${borderPulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.owner.x, this.owner.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Desenhar partículas ao redor
        this.renderParticles(ctx);

        // Desenhar indicadores nos inimigos afetados
        this.affectedEnemies.forEach(enemy => {
            this.renderEnemyIndicator(ctx, enemy);
        });

        ctx.restore();
    }

    renderParticles(ctx) {
        const particleCount = 12;
        const time = this.pulseTime;

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + time * 0.5;
            const distance = this.radius * 0.9;
            const x = this.owner.x + Math.cos(angle) * distance;
            const y = this.owner.y + Math.sin(angle) * distance;
            
            const pulse = Math.sin(time * 3 + i) * 0.5 + 0.5;
            const size = 3 + pulse * 2;
            
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${pulse})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderEnemyIndicator(ctx, enemy) {
        const indicatorSize = 6;
        const pulse = Math.sin(this.pulseTime * 4) * 0.5 + 0.5;
        
        /*ctx.fillStyle = `rgba(255, 50, 50, ${pulse})`;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y - 30, indicatorSize, 0, Math.PI * 2);
        ctx.fill();*/
        
        // Texto de dano
        ctx.fillStyle = `rgba(255, 100, 100, ${pulse})`;
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('-' + Math.floor(this.damagePerSecond), enemy.x, enemy.y - 35);
    }

    // Método para aumentar o poder da aura (upgrade)
    upgrade(level) {
        this.radius += 20 * level;
        this.damagePerSecond += 5 * level;
        this.duration += 10 * level;
    }
}