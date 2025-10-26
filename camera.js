export class Camera {
    constructor(viewportWidth, viewportHeight, worldWidth, worldHeight) {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        
        this.x = 0;
        this.y = 0;
        
        this.smoothing = 0.1;
        this.targetX = 0;
        this.targetY = 0;
    }

    follow(target) {
        this.targetX = target.x - this.viewportWidth / 2;
        this.targetY = target.y - this.viewportHeight / 2;
        
        // Smooth camera movement
        this.x += (this.targetX - this.x) * this.smoothing;
        this.y += (this.targetY - this.y) * this.smoothing;
        
        // Clamp camera to world bounds
        this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.viewportWidth));
        this.y = Math.max(0, Math.min(this.y, this.worldHeight - this.viewportHeight));
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
    }

    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }

    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }

    isInView(x, y, width, height) {
        return x + width > this.x &&
               x < this.x + this.viewportWidth &&
               y + height > this.y &&
               y < this.y + this.viewportHeight;
    }
}