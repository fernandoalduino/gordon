export class InputHandler {
    constructor() {
        this.keys = new Map();
        this.actionKey = false;
        this.setupKeyboardListeners();
    }

    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys.set(e.key.toLowerCase(), true);
            
            if (e.key.toLowerCase() === 'e' || e.key === ' ') {
                this.actionKey = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys.set(e.key.toLowerCase(), false);
            if (e.key.toLowerCase() === 'e' || e.key === ' ') {
                this.actionKey = false;
            }
        });
    }

    setupControls(player) {
        this.player = player;
    }

    isKeyPressed(key) {
        return this.keys.get(key.toLowerCase()) || false;
    }

    isActionPressed() {
        const pressed = this.actionKey;
        this.actionKey = false; // Reset after checking
        return pressed;
    }

    getMovementVector() {
        let vx = 0;
        let vy = 0;

        // WASD and Arrow keys
        if (this.isKeyPressed('w') || this.isKeyPressed('arrowup')) {
            vy -= 1;
        }
        if (this.isKeyPressed('s') || this.isKeyPressed('arrowdown')) {
            vy += 1;
        }
        if (this.isKeyPressed('a') || this.isKeyPressed('arrowleft')) {
            vx -= 1;
        }
        if (this.isKeyPressed('d') || this.isKeyPressed('arrowright')) {
            vx += 1;
        }

        return { vx, vy };
    }

    update() {
        
        if (!this.player) return;


        const movement = this.getMovementVector();
        this.player.setVelocity(movement.vx, movement.vy);

        // Health potion
        if (this.isKeyPressed('h')) {
            const healAmount = this.player.useHealthPotion();
            if (healAmount > 0) {
                console.log(`Healed ${healAmount} HP`);
            }
        }
    }
}