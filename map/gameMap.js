export class GameMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = Array(height).fill(null).map(() => Array(width).fill(0));
        this.openedChests = new Set();
    }

    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return 1; // Wall
        }
        return this.tiles[y][x];
    }

    setTile(x, y, value) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.tiles[y][x] = value;
        }
    }

    isWalkable(x, y) {
        const tile = this.getTile(x, y);
        return tile === 0 || tile === 2; // Floor or chest
    }

    isWall(x, y) {
        return this.getTile(x, y) === 1;
    }

    isChest(x, y) {
        return this.getTile(x, y) === 2;
    }

    openChest(x, y) {
        const key = `${x},${y}`;
        this.openedChests.add(key);
    }

    isChestOpened(x, y) {
        const key = `${x},${y}`;
        return this.openedChests.has(key);
    }

    getTileWorldPosition(x, y) {
        return {
            x: x * 32,
            y: y * 32
        };
    }

    worldToTile(worldX, worldY) {
        return {
            x: Math.floor(worldX / 32),
            y: Math.floor(worldY / 32)
        };
    }
}