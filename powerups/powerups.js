export class PowerUp {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.duration = config.duration || Infinity; // Infinity = permanente
        this.isActive = false;
        this.timeRemaining = 0;
        this.owner = null;
    }

    activate(owner) {
        this.isActive = true;
        this.owner = owner;
        this.timeRemaining = this.duration;
        this.onActivate(owner);
    }

    deactivate() {
        this.isActive = false;
        this.onDeactivate();
        this.owner = null;
    }

    update(deltaTime, enemies = [], owner) {
        if (!this.isActive){
            return;
        }

        if (this.duration !== Infinity) {
            this.timeRemaining -= deltaTime;
            if (this.timeRemaining <= 0) {
                this.deactivate();
                return;
            }
        }

        this.onUpdate(deltaTime, enemies, owner);
    }

    // Métodos para serem sobrescritos pelas subclasses
    onActivate(player) {}
    onDeactivate() {}
    onUpdate(deltaTime, enemies, owner) {}
    render(ctx, camera) {}

    getTimeRemainingPercent() {
        if (this.duration === Infinity) return 1;
        return this.timeRemaining / this.duration;
    }
}