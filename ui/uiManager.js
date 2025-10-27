export class UIManager {
    constructor() {
        this.hpBar = document.getElementById('hp-bar');
        this.hpText = document.getElementById('hp-text');
        this.xpBar = document.getElementById('xp-bar');
        this.xpText = document.getElementById('xp-text');
        this.levelText = document.getElementById('level-text');
        this.goldText = document.getElementById('gold-text');
        this.messageLog = document.getElementById('message-log');
        
        this.messages = [];
        this.maxMessages = 5;
        this.messageTimeout = 5000;
    }

    update(player) {
        this.updateHealthBar(player);
        this.updateExperienceBar(player);
        this.updateStats(player);
    }

    updateHealthBar(player) {
        const healthPercent = (player.currentHealth / player.maxHealth) * 100;
        this.hpBar.style.width = `${healthPercent}%`;
        this.hpText.textContent = `${Math.ceil(player.currentHealth)}/${Math.ceil(player.maxHealth)}`;
    }

    updateExperienceBar(player) {
        const xpPercent = (player.experience / player.experienceToNextLevel) * 100;
        this.xpBar.style.width = `${xpPercent}%`;
        this.xpText.textContent = `${player.experience}/${player.experienceToNextLevel}`;
    }

    updateStats(player) {
        this.levelText.textContent = player.level;
        this.goldText.textContent = player.gold;
    }

    addMessage(text, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = text;
        
        this.messageLog.appendChild(messageElement);
        
        this.messages.push({
            element: messageElement,
            timestamp: Date.now()
        });
        
        if (this.messages.length > this.maxMessages) {
            const oldMessage = this.messages.shift();
            oldMessage.element.remove();
        }
        
        setTimeout(() => {
            this.removeMessage(messageElement);
        }, this.messageTimeout);
    }

    removeMessage(element) {
        const index = this.messages.findIndex(msg => msg.element === element);
        if (index !== -1) {
            this.messages.splice(index, 1);
            element.remove();
        }
    }

    showLevelUp(level) {
        this.addMessage(`🎉 LEVEL UP! Agora você é nível ${level}!`, 'level-up');
    }

    showDamage(amount, isCritical = false) {
        const type = isCritical ? 'critical' : 'damage';
        const prefix = isCritical ? 'CRÍTICO! ' : '';
        this.addMessage(`${prefix}Você causou ${amount} de dano`, type);
    }

    showHeal(amount) {
        this.addMessage(`+${amount} HP recuperado`, 'heal');
    }

    showGoldGain(amount) {
        this.addMessage(`+${amount} ouro`, 'info');
    }

    showExperienceGain(amount) {
        this.addMessage(`+${amount} XP`, 'info');
    }

    clearMessages() {
        this.messages.forEach(msg => msg.element.remove());
        this.messages = [];
    }
}