export class SpriteRenderer {
    constructor() {
        // Configuração da sprite sheet da tartaruga ninja
        // Analisando a imagem: 8 colunas x 4 linhas
        // Tamanho total aproximado: 1344x768 pixels
        // Cada frame: 168x192 pixels
        this.config = {
            frameWidth: 168,     // Largura de cada frame (1344/8)
            frameHeight: 192,    // Altura de cada frame (768/4)
            columns: 8,          // 8 frames de animação
            rows: 4,             // 4 direções
            scale: 0.35          // Escala de renderização (ajustado para ficar proporcional)
        };
    }

    /**
     * Renderiza um sprite do sprite sheet
     * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
     * @param {HTMLImageElement} spriteSheet - Imagem do sprite sheet
     * @param {number} frameX - Frame horizontal (0-7)
     * @param {number} frameY - Frame vertical (0-3)
     * @param {number} x - Posição X no canvas
     * @param {number} y - Posição Y no canvas
     * @param {number} scale - Escala opcional
     */
    renderSprite(ctx, spriteSheet, frameX, frameY, x, y, scale = this.config.scale) {
        if (!spriteSheet) {
            console.warn('Sprite sheet não carregado!');
            return;
        }

        const { frameWidth, frameHeight } = this.config;
        
        // Posição no sprite sheet
        const sourceX = frameX * frameWidth;
        const sourceY = frameY * frameHeight;
        
        // Tamanho de renderização
        const renderWidth = frameWidth * scale;
        const renderHeight = frameHeight * scale;
        
        // Centralizar o sprite na posição
        const renderX = x - renderWidth / 2;
        const renderY = y - renderHeight / 2;

        // Habilitar suavização de imagem para pixel art
        ctx.imageSmoothingEnabled = false;

        ctx.drawImage(
            spriteSheet,
            sourceX, sourceY,           // Posição no sprite sheet
            frameWidth, frameHeight,    // Tamanho do frame
            renderX, renderY,           // Posição no canvas
            renderWidth, renderHeight   // Tamanho renderizado
        );
    }

    /**
     * Renderiza um sprite com rotação
     */
    renderSpriteRotated(ctx, spriteSheet, frameX, frameY, x, y, rotation, scale = this.config.scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        this.renderSprite(ctx, spriteSheet, frameX, frameY, 0, 0, scale);
        ctx.restore();
    }

    /**
     * Renderiza um sprite com flip horizontal
     */
    renderSpriteFlipped(ctx, spriteSheet, frameX, frameY, x, y, flipX = false, flipY = false, scale = this.config.scale) {
        ctx.save();
        ctx.translate(x, y);
        
        if (flipX) ctx.scale(-1, 1);
        if (flipY) ctx.scale(1, -1);
        
        this.renderSprite(ctx, spriteSheet, frameX, frameY, 0, 0, scale);
        ctx.restore();
    }

    /**
     * Mapeia direção (0-7) para linha do sprite sheet (0-3)
     * Direções: 0=E, 1=SE, 2=S, 3=SW, 4=W, 5=NW, 6=N, 7=NE
     * 
     * Baseado na análise da sprite sheet:
     * Linha 0: Frente/Sul
     * Linha 1: Diagonal (SE/NE)
     * Linha 2: Lado (E/W)
     * Linha 3: Costas/Norte
     */
    getRowFromDirection(direction) {
        const directionMap = {
            0: 2,  // East -> Linha 2 (lado direito)
            1: 1,  // Southeast -> Linha 1 (diagonal)
            2: 0,  // South -> Linha 0 (frente)
            3: 1,  // Southwest -> Linha 1 (diagonal, com flip)
            4: 2,  // West -> Linha 2 (lado, com flip)
            5: 1,  // Northwest -> Linha 1 (diagonal, com flip)
            6: 3,  // North -> Linha 3 (costas)
            7: 1   // Northeast -> Linha 1 (diagonal)
        };
        
        return directionMap[direction] || 0;
    }

    /**
     * Verifica se precisa fazer flip horizontal baseado na direção
     */
    needsFlip(direction) {
        // Direções que precisam de flip: W, NW, SW
        return direction >= 3 && direction <= 5;
    }

    setScale(scale) {
        this.config.scale = scale;
    }

    getConfig() {
        return { ...this.config };
    }
}