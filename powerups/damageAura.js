import { PowerUp } from './powerups.js';

export class DamageAura extends PowerUp {
    constructor() {
        super({
            id: 'damage_aura',
            name: 'Aura de Dano',
            description: 'Causa dano aos inimigos próximos',
            duration: Infinity // Duração infinita
        });

        // Configurações base
        this.baseDamagePerSecond = 15;
        this.damagePerSecond = this.baseDamagePerSecond;
        this.damageTimer = 0;
        this.damageInterval = 0.5; // Dano a cada 0.5 segundos
        
        // Escalamento por nível
        this.damageScaling = {
            baseDamage: 15,              // Dano base
            damagePerLevel: 5,           // +5 de dano por nível
            playerDamagePercent: 0.5,    // 50% do dano do player
            criticalChanceBonus: 0.05    // +5% de chance de crítico da aura
        };
        
        // Raio e efeitos
        this.baseRadius = 100;
        this.radius = this.baseRadius;
        this.radiusPerLevel = 5; // +5 pixels de raio por nível
        
        // Efeitos visuais
        this.pulseTime = 0;
        this.pulseSpeed = this.damageInterval;
        this.color = { r: 255, g: 100, b: 100 };
        this.affectedEnemies = new Set();
        
        // Referência ao player
        this.player = null;
    }

    onActivate(player) {
        console.log(`${this.name} ativado!`);
        this.player = player;
        this.updateDamageScaling();
        this.damageTimer = 0;
        this.pulseTime = 0;
        this.affectedEnemies.clear();
    }

    onDeactivate() {
        console.log(`${this.name} desativado!`);
        this.affectedEnemies.clear();
        this.player = null;
    }

    onUpdate(deltaTime, enemies, player) {
        // Atualizar referência do player
        if (player) {
            this.player = player;
        }
        
        this.damageTimer += deltaTime;
        this.pulseTime += deltaTime * this.pulseSpeed;
        
        // Atualizar dano baseado no nível do player
        this.updateDamageScaling();
        
        if (this.damageTimer >= this.damageInterval) {
            this.damageTimer = 0;
            this.applyDamageToNearbyEnemies(enemies);
        }
    }

    /**
     * Atualiza o dano da aura baseado no nível e atributos do player
     */
    updateDamageScaling() {
        if (!this.player) return;
        
        const playerLevel = this.player.level || 1;
        
        // Fórmula de dano escalável:
        // Dano = Base + (Nível * DanoPorNível) + (Dano do Player * Percentual)
        const levelBonus = (playerLevel - 1) * this.damageScaling.damagePerLevel;
        const playerDamageBonus = this.player.damage * this.damageScaling.playerDamagePercent;
        
        this.damagePerSecond = this.damageScaling.baseDamage + levelBonus + playerDamageBonus;
        
        // Aumentar raio conforme o nível
        this.radius = this.baseRadius + ((playerLevel - 1) * this.radiusPerLevel);
        
        // Atualizar cor baseado no poder (mais forte = mais vermelho)
        const powerLevel = Math.min(playerLevel / 20, 1); // Normalizar até nível 20
        this.color.r = 255;
        this.color.g = Math.floor(100 - (powerLevel * 50)); // Fica mais vermelho
        this.color.b = Math.floor(100 - (powerLevel * 50));
    }

    applyDamageToNearbyEnemies(enemies) {
        if (!this.owner || !this.player) return;

        this.affectedEnemies.clear();

        enemies.forEach(enemy => {
            const distance = this.getDistanceTo(enemy);
            
            if (distance <= this.radius) {
                this.affectedEnemies.add(enemy);
                
                // Calcular dano com chance de crítico da aura
                const baseDamage = this.damagePerSecond * this.damageInterval;
                const isCritical = Math.random() < (this.player.criticalChance + this.damageScaling.criticalChanceBonus);
                const critMultiplier = isCritical ? (this.player.criticalMultiplier || 2.0) : 1.0;
                
                const damageInfo = {
                    value: baseDamage * critMultiplier,
                    isCritical: isCritical
                };
                
                enemy.takeDamage(damageInfo);
                
                // Efeito visual de crítico
                if (isCritical) {
                    this.showCriticalEffect(enemy);
                }
            }
        });
    }

    showCriticalEffect(enemy) {
        // Adicionar um pulso visual no inimigo que levou crítico
        enemy._auraCritTime = 0.3; // Duração do efeito
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

        // Desenhar borda pulsante (mais intensa em níveis altos)
        const borderPulse = Math.sin(this.pulseTime * 2) * 0.3 + 0.7;
        const borderAlpha = this.player ? Math.min(0.5 + (this.player.level * 0.02), 1.0) : 0.7;
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${borderPulse * borderAlpha})`;
        ctx.lineWidth = 2 + (this.player ? Math.floor(this.player.level / 5) : 0);
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
        const particleCount = 12 + (this.player ? Math.floor(this.player.level / 3) : 0);
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
        
        // Texto de dano com valor atualizado
        const displayDamage = Math.floor(this.damagePerSecond);
        ctx.fillStyle = `rgba(255, 100, 100, ${pulse})`;
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('-' + displayDamage, enemy.x, enemy.y - 35);
        
        // Indicador de crítico
        if (enemy._auraCritTime && enemy._auraCritTime > 0) {
            ctx.fillStyle = `rgba(255, 255, 0, ${enemy._auraCritTime})`;
            ctx.font = 'bold 12px Arial';
            ctx.fillText('CRIT!', enemy.x, enemy.y - 45);
            enemy._auraCritTime -= 0.016; // Aproximadamente 60 FPS
        }
    }

    // Método para aumentar o poder da aura (upgrade manual)
    upgrade(level) {
        this.baseRadius += 20 * level;
        this.damageScaling.baseDamage += 10 * level;
        this.damageScaling.damagePerLevel += 2 * level;
        this.damageInterval += 0.1 * level;
        
        console.log(`🔥 Aura de Dano melhorada! Nível ${level}`);
        console.log(`   Raio: ${this.baseRadius}px`);
        console.log(`   Dano Base: ${this.damageScaling.baseDamage}`);
    }

    // Método para obter informações de status
    getStatusInfo() {
        if (!this.player) return null;
        
        return {
            level: this.player.level,
            damage: Math.floor(this.damagePerSecond),
            radius: Math.floor(this.radius),
            dps: Math.floor(this.damagePerSecond / this.damageInterval),
            critChance: Math.floor((this.player.criticalChance + this.damageScaling.criticalChanceBonus) * 100)
        };
    }
}