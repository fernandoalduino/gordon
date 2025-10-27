export class SpriteLoader {
    constructor() {
        this.sprites = new Map();
        this.loadingPromises = [];
    }

    loadSprite(name, path) {
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.sprites.set(name, img);
                console.log(`✅ Sprite "${name}" carregado com sucesso!`);
                resolve(img);
            };
            img.onerror = () => {
                console.error(`❌ Erro ao carregar sprite "${name}" de ${path}`);
                reject(new Error(`Failed to load sprite: ${name}`));
            };
            img.src = path;
        });

        this.loadingPromises.push(promise);
        return promise;
    }

    getSprite(name) {
        return this.sprites.get(name);
    }

    hasSprite(name) {
        return this.sprites.has(name);
    }

    async waitForAll() {
        try {
            await Promise.all(this.loadingPromises);
            console.log('✅ Todos os sprites carregados!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao carregar sprites:', error);
            return false;
        }
    }

    clear() {
        this.sprites.clear();
        this.loadingPromises = [];
    }
}