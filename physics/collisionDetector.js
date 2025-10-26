import { TILE_SIZE } from '../constants.js';

export class CollisionDetector {
    constructor(map) {
        this.map = map;
        this.tileSize = TILE_SIZE;
    }

    checkCollision(position, width, height) {
        // Check collision from center point
        const left = position.x - width / 2;
        const right = position.x + width / 2;
        const top = position.y - height / 2;
        const bottom = position.y + height / 2;

        const leftTile = Math.floor(left / this.tileSize);
        const rightTile = Math.floor(right / this.tileSize);
        const topTile = Math.floor(top / this.tileSize);
        const bottomTile = Math.floor(bottom / this.tileSize);

        // Check all tiles the entity overlaps
        for (let y = topTile; y <= bottomTile; y++) {
            for (let x = leftTile; x <= rightTile; x++) {
                if (this.map.isWall(x, y)) {
                    return true;
                }
            }
        }

        return false;
    }

    checkEntityCollision(entity1, entity2, radius1 = 12, radius2 = 12) {
        const dx = entity1.x - entity2.x;
        const dy = entity1.y - entity2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (radius1 + radius2);
    }

    checkCircleRectCollision(circleX, circleY, radius, rectX, rectY, rectWidth, rectHeight) {
        const closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
        const closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));

        const distanceX = circleX - closestX;
        const distanceY = circleY - closestY;

        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        return distanceSquared < (radius * radius);
    }

    resolveCollision(entity, width, height) {
        const position = { x: entity.x, y: entity.y };
        
        if (this.checkCollision(position, width, height)) {
            entity.x = entity.previousX;
            entity.y = entity.previousY;
            entity.velocityX = 0;
            entity.velocityY = 0;
        }
    }

    getTilesInRadius(centerX, centerY, radius) {
        const tiles = [];
        const centerTileX = Math.floor(centerX / this.tileSize);
        const centerTileY = Math.floor(centerY / this.tileSize);
        const tileRadius = Math.ceil(radius / this.tileSize);

        for (let y = centerTileY - tileRadius; y <= centerTileY + tileRadius; y++) {
            for (let x = centerTileX - tileRadius; x <= centerTileX + tileRadius; x++) {
                const tileWorldX = x * this.tileSize + this.tileSize / 2;
                const tileWorldY = y * this.tileSize + this.tileSize / 2;
                
                const distance = Math.sqrt(
                    Math.pow(tileWorldX - centerX, 2) + 
                    Math.pow(tileWorldY - centerY, 2)
                );

                if (distance <= radius) {
                    tiles.push({ x, y, tile: this.map.getTile(x, y) });
                }
            }
        }

        return tiles;
    }
}