export class PowerUpUI {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'powerup-container';
        container.style.cssText = `
            position: absolute;
            top: 120px;
            left: 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            pointer-events: none;
        `;
        
        const uiOverlay = document.getElementById('ui-overlay');
        if (uiOverlay) {
            uiOverlay.appendChild(container);
        }
        
        return container;
    }

    update(powerUpManager) {
        const activePowerUps = powerUpManager.getActivePowerUps();
        
        // Limpar container
        this.container.innerHTML = '';
        
        // Adicionar cada power-up ativo
        activePowerUps.forEach(powerUp => {
            const element = this.createPowerUpElement(powerUp);
            this.container.appendChild(element);
        });
    }

    createPowerUpElement(powerUp) {
        const element = document.createElement('div');
        element.className = 'powerup-item';
        element.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            padding: 8px 12px;
            border-radius: 6px;
            border-left: 3px solid #ff6464;
            min-width: 200px;
            animation: slideIn 0.3s ease;
        `;

        const name = document.createElement('div');
        name.textContent = powerUp.name;
        name.style.cssText = `
            color: #fff;
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 4px;
        `;

        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            overflow: hidden;
        `;

        const progress = document.createElement('div');
        const percent = powerUp.getTimeRemainingPercent() * 100;
        progress.style.cssText = `
            width: ${percent}%;
            height: 100%;
            background: linear-gradient(90deg, #ff6464, #ff9999);
            transition: width 0.3s ease;
        `;

        progressBar.appendChild(progress);

        const timeText = document.createElement('div');
        if (powerUp.duration === Infinity) {
            timeText.textContent = '∞';
        } else {
            timeText.textContent = `${Math.ceil(powerUp.timeRemaining)}s`;
        }
        timeText.style.cssText = `
            color: #aaa;
            font-size: 11px;
            margin-top: 2px;
            text-align: right;
        `;

        element.appendChild(name);
        element.appendChild(progressBar);
        element.appendChild(timeText);

        return element;
    }

    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}