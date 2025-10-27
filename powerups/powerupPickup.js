export class PowerUpPickup {
    constructor(x, y, powerUpId, config = {}) {
        this.x = x;
        this.y = y;
        this.powerUpId = powerUpId;
        this.name = config.name || 'Power-Up';
        this.color = config.color || { r: 255, g: 215, b: 0 };
        this.size = config.size || 20;
        this.pickupRadius = config.pickupRadius || 30;
        
        // Animação
        this.floatOffset = 0;
        this.floatSpeed = 2;
        this.floatAmplitude = 5;
        this.rotationAngle = 0;
        this.rotationSpeed = 2;
        
        // Partículas
        this.particleTime = 0;
        
        this.isCollected = false;
    }

    update(deltaTime, player) {
        if (this.isCollected) return;

        // Animação de flutuação
        this.floatOffset = Math.sin(this.floatSpeed * performance.now() / 1000) * this.floatAmplitude;
        this.rotationAngle += this.rotationSpeed * deltaTime;
        this.particleTime += deltaTime;

        // Verificar colisão com o player
        const distance = Math.sqrt(
            Math.pow(player.x - this.x, 2) + 
            Math.pow(player.y - this.y, 2)
        );

        if (distance <= this.pickupRadius) {
            this.collect(player);
        }
    }

    collect(player) {
        this.isCollected = true;
        // O game.js vai adicionar o power-up ao player
    }

    render(ctx) {
        if (this.isCollected) return;

        ctx.save();

        const renderY = this.y + this.floatOffset;

        // Desenhar círculo de alcance (sutil)
        ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.2)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.pickupRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Desenhar partículas ao redor
        this.renderParticles(ctx, renderY);

        // Desenhar o power-up (diamante rotacionado)
        ctx.translate(this.x, renderY);
        ctx.rotate(this.rotationAngle);

        // Brilho externo
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 1.5);
        glowGradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.6)`);
        glowGradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.3)`);
        glowGradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Diamante principal
        ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size, 0);
        ctx.lineTo(0, this.size);
        ctx.lineTo(-this.size, 0);
        ctx.closePath();
        ctx.fill();

        // Borda do diamante
        ctx.strokeStyle = `rgba(255, 255, 255, 0.8)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Centro brilhante
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Desenhar nome do power-up
        this.renderLabel(ctx, renderY);
    }

    renderParticles(ctx, renderY) {
        const particleCount = 8;
        const time = this.particleTime;

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + time;
            const distance = this.size * 2;
            const x = this.x + Math.cos(angle) * distance;
            const y = renderY + Math.sin(angle) * distance;
            
            const pulse = Math.sin(time * 3 + i) * 0.5 + 0.5;
            const size = 2 + pulse * 2;
            
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${pulse * 0.8})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderLabel(ctx, renderY) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        
        const textWidth = ctx.measureText(this.name).width;
        ctx.fillRect(this.x - textWidth / 2 - 4, renderY + this.size + 8, textWidth + 8, 16);
        
        ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
        ctx.fillText(this.name, this.x, renderY + this.size + 20);
    }

    static createDamageAuraPickup(x, y) {
        return new PowerUpPickup(x, y, 'damage_aura', {
            name: 'Aura de Dano',
            color: { r: 255, g: 100, b: 100 },
            size: 16,
            pickupRadius: 35
        });
    }
}