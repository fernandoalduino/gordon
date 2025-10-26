import { SeededRandom } from '../utils/seededRandom.js';
import { GameMap } from './gameMap.js';

export class MapGenerator {
    constructor(seed, width, height) {
        this.seed = seed;
        this.width = width;
        this.height = height;
        this.random = new SeededRandom(seed);
    }

    generate() {
        const map = new GameMap(this.width, this.height);
        
        // Fill with walls
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                map.setTile(x, y, 1);
            }
        }
        
        // Generate rooms using BSP (Binary Space Partitioning)
        const rooms = this.generateRooms();
        
        // Carve out rooms
        rooms.forEach(room => {
            for (let y = room.y; y < room.y + room.height; y++) {
                for (let x = room.x; x < room.x + room.width; x++) {
                    map.setTile(x, y, 0);
                }
            }
        });
        
        // Connect rooms with corridors
        this.connectRooms(map, rooms);
        
        // Place chests
        this.placeChests(map, rooms);
        
        this.rooms = rooms;
        this.map = map;
        
        return map;
    }

    generateRooms() {
        const rooms = [];
        const minRoomSize = 6;
        const maxRoomSize = 15;
        const numRooms = 20;
        
        for (let i = 0; i < numRooms; i++) {
            const width = Math.floor(this.random.next() * (maxRoomSize - minRoomSize)) + minRoomSize;
            const height = Math.floor(this.random.next() * (maxRoomSize - minRoomSize)) + minRoomSize;
            const x = Math.floor(this.random.next() * (this.width - width - 2)) + 1;
            const y = Math.floor(this.random.next() * (this.height - height - 2)) + 1;
            
            const newRoom = { x, y, width, height };
            
            let overlaps = false;
            for (const room of rooms) {
                if (this.roomsOverlap(newRoom, room)) {
                    overlaps = true;
                    break;
                }
            }
            
            if (!overlaps) {
                rooms.push(newRoom);
            }
        }
        
        return rooms;
    }

    roomsOverlap(room1, room2) {
        return room1.x < room2.x + room2.width + 1 &&
               room1.x + room1.width + 1 > room2.x &&
               room1.y < room2.y + room2.height + 1 &&
               room1.y + room1.height + 1 > room2.y;
    }

    connectRooms(map, rooms) {
        for (let i = 0; i < rooms.length - 1; i++) {
            const room1 = rooms[i];
            const room2 = rooms[i + 1];
            
            const center1 = {
                x: Math.floor(room1.x + room1.width / 2),
                y: Math.floor(room1.y + room1.height / 2)
            };
            
            const center2 = {
                x: Math.floor(room2.x + room2.width / 2),
                y: Math.floor(room2.y + room2.height / 2)
            };
            
            if (this.random.next() > 0.5) {
                this.createHorizontalCorridor(map, center1.x, center2.x, center1.y);
                this.createVerticalCorridor(map, center1.y, center2.y, center2.x);
            } else {
                this.createVerticalCorridor(map, center1.y, center2.y, center1.x);
                this.createHorizontalCorridor(map, center1.x, center2.x, center2.y);
            }
        }
    }

    createHorizontalCorridor(map, x1, x2, y) {
        const startX = Math.min(x1, x2);
        const endX = Math.max(x1, x2);
        
        for (let x = startX; x <= endX; x++) {
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                map.setTile(x, y, 0);
            }
        }
    }

    createVerticalCorridor(map, y1, y2, x) {
        const startY = Math.min(y1, y2);
        const endY = Math.max(y1, y2);
        
        for (let y = startY; y <= endY; y++) {
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                map.setTile(x, y, 0);
            }
        }
    }

    placeChests(map, rooms) {
        const numChests = Math.floor(rooms.length * 0.3);
        
        for (let i = 0; i < numChests; i++) {
            const room = rooms[Math.floor(this.random.next() * rooms.length)];
            const x = room.x + Math.floor(this.random.next() * room.width);
            const y = room.y + Math.floor(this.random.next() * room.height);
            
            if (map.getTile(x, y) === 0) {
                map.setTile(x, y, 2); // Chest
            }
        }
    }

    getSpawnPoint() {
        if (this.rooms && this.rooms.length > 0) {
            const firstRoom = this.rooms[0];
            return {
                x: (firstRoom.x + Math.floor(firstRoom.width / 2)) * 32,
                y: (firstRoom.y + Math.floor(firstRoom.height / 2)) * 32
            };
        }
        return { x: 100, y: 100 };
    }

    getRandomWalkablePosition() {
        if (this.rooms && this.rooms.length > 0) {
            const room = this.rooms[Math.floor(this.random.next() * this.rooms.length)];
            return {
                x: (room.x + Math.floor(this.random.next() * room.width)) * 32,
                y: (room.y + Math.floor(this.random.next() * room.height)) * 32
            };
        }
        return { x: 100, y: 100 };
    }
}