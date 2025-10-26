export class SeededRandom {
    constructor(seed) {
        this.seed = seed;
        this.current = seed;
    }

    next() {
        // Linear Congruential Generator (LCG)
        this.current = (this.current * 1664525 + 1013904223) % 4294967296;
        return this.current / 4294967296;
    }

    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    nextFloat(min, max) {
        return this.next() * (max - min) + min;
    }

    choice(array) {
        return array[Math.floor(this.next() * array.length)];
    }

    reset() {
        this.current = this.seed;
    }
}