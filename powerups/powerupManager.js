import { DamageAura } from './damageAura.js';

export class PowerUpManager {
    constructor(player) {
        this.player = player;
        this.activePowerUps = [];
        this.availablePowerUps = this.initializeAvailablePowerUps();
    }

    initializeAvailablePowerUps() {
        return {
            'damage_aura': () => new DamageAura(),
            // Adicione mais power-ups aqui no futuro
        };
    }

    addPowerUp(powerUpId) {
        const powerUpFactory = this.availablePowerUps[powerUpId];
        
        if (!powerUpFactory) {
            console.error(`Power-up ${powerUpId} não encontrado!`);
            return null;
        }

        // Verificar se já existe um power-up do mesmo tipo ativo
        const existingIndex = this.activePowerUps.findIndex(p => p.id === powerUpId);
        
        if (existingIndex !== -1) {
            // Renovar duração do power-up existente
            const existing = this.activePowerUps[existingIndex];
            existing.timeRemaining = existing.duration;
            console.log(`Power-up ${existing.name} renovado!`);
            return existing;
        }

        // Criar novo power-up
        const powerUp = powerUpFactory();
        powerUp.activate(this.player);
        this.activePowerUps.push(powerUp);
        
        console.log(`Power-up ${powerUp.name} adicionado!`);
        return powerUp;
    }

    removePowerUp(powerUpId) {
        const index = this.activePowerUps.findIndex(p => p.id === powerUpId);
        
        if (index !== -1) {
            const powerUp = this.activePowerUps[index];
            powerUp.deactivate();
            this.activePowerUps.splice(index, 1);
            console.log(`Power-up ${powerUp.name} removido!`);
            return true;
        }
        
        return false;
    }

    update(deltaTime, enemies, player) {
        // Atualizar todos os power-ups ativos
        this.activePowerUps.forEach(powerUp => {
            powerUp.update(deltaTime, enemies, player);
        });

        // Remover power-ups que expiraram
        this.activePowerUps = this.activePowerUps.filter(p => p.isActive);
    }

    render(ctx, camera) {
        // Renderizar efeitos visuais de todos os power-ups
        this.activePowerUps.forEach(powerUp => {
            powerUp.render(ctx, camera);
        });
    }

    getPowerUp(powerUpId) {
        return this.activePowerUps.find(p => p.id === powerUpId);
    }

    hasPowerUp(powerUpId) {
        return this.activePowerUps.some(p => p.id === powerUpId);
    }

    getActivePowerUps() {
        return [...this.activePowerUps];
    }

    clearAll() {
        this.activePowerUps.forEach(p => p.deactivate());
        this.activePowerUps = [];
    }

    // Método para debug/teste
    addRandomPowerUp() {
        const powerUpIds = Object.keys(this.availablePowerUps);
        const randomId = powerUpIds[Math.floor(Math.random() * powerUpIds.length)];
        return this.addPowerUp(randomId);
    }
}