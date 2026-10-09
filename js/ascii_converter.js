/**
 * ASCII Studio 4U — Engine de Conversão de Alto Desempenho
 * 100% Client-side, Zero-lag buffer extraction & Multi-mode Canvas renderer
 */

const AsciiPresets = {
    dense: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
    blocks: ' ░▒▓█',
    matrix: ' 01',
    braille: ' ⣀⣤⣶⣿',
    minimal: ' .:-=+*#%@',
    classic: ' .,:;=+itYVXRBMW#',
    slash: ' -_\\/|+'
};

class AsciiEngine {
    constructor() {
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
    }

    /**
     * Carrega imagem a partir de File ou Blob em um Image object
     */
    static loadImage(fileOrBlob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = (err) => reject(new Error('Falha ao decodificar imagem: ' + err));
                img.src = e.target.result;
            };
            reader.onerror = (err) => reject(new Error('Erro na leitura do arquivo: ' + err));
            reader.readAsDataURL(fileOrBlob);
        });
    }

    /**
     * Redimensiona a imagem para a resolução de caracteres desejada
     */
    prepareCanvas(sourceImg, width, height) {
        this.offscreenCanvas.width = width;
        this.offscreenCanvas.height = height;
        this.offscreenCtx.clearRect(0, 0, width, height);
        this.offscreenCtx.drawImage(sourceImg, 0, 0, width, height);
        return this.offscreenCtx.getImageData(0, 0, width, height);
    }

    /**
     * Processa a imagem em alta performance retornando texto ASCII e matriz com suporte a todos os modos
     */
    processImage(imageData, options = {}) {
        const {
            palette = AsciiPresets.dense,
            contrast = 0,
            brightness = 0,
            invert = false,
            dither = false,
            isCustom = false,
            customText = '',
            isLightBg = false
        } = options;

        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const pLen = palette.length;

        // Fator de contraste: [-100, 100]
        const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        // Buffer de luminância e cores
        const lumBuffer = new Float32Array(width * height);
        const rgbBuffer = new Array(width * height);

        let ptr = 0;
        for (let i = 0; i < width * height; i++) {
            let r = data[ptr];
            let g = data[ptr + 1];
            let b = data[ptr + 2];
            let a = data[ptr + 3];
            ptr += 4;

            if (a < 25) {
                // Transparência total
                lumBuffer[i] = (invert || isLightBg) ? 255 : 0;
                rgbBuffer[i] = { r: 0, g: 0, b: 0, a: 0 };
                continue;
            }

            // Ajuste de Brilho
            if (brightness !== 0) {
                r = Math.min(255, Math.max(0, r + brightness));
                g = Math.min(255, Math.max(0, g + brightness));
                b = Math.min(255, Math.max(0, b + brightness));
            }

            // Ajuste de Contraste
            if (contrast !== 0) {
                r = Math.min(255, Math.max(0, cFactor * (r - 128) + 128));
                g = Math.min(255, Math.max(0, cFactor * (g - 128) + 128));
                b = Math.min(255, Math.max(0, cFactor * (b - 128) + 128));
            }

            // Luminância perceptiva ITU-R BT.601
            let lum = 0.299 * r + 0.587 * g + 0.114 * b;

            let finalLum = lum;
            if (invert) {
                finalLum = 255 - finalLum;
            }

            lumBuffer[i] = finalLum;
            rgbBuffer[i] = { r: Math.round(r), g: Math.round(g), b: Math.round(b), a };
        }

        // Floyd-Steinberg Dithering em escala de cinza (se ativado e não for texto customizado)
        if (dither && !isCustom && pLen > 1) {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = y * width + x;
                    const oldVal = lumBuffer[idx];
                    const step = 255 / (pLen - 1);
                    const quantized = Math.round(oldVal / step) * step;
                    lumBuffer[idx] = Math.min(255, Math.max(0, quantized));
                    const error = oldVal - quantized;

                    if (x + 1 < width) lumBuffer[idx + 1] += error * (7 / 16);
                    if (y + 1 < height) {
                        if (x > 0) lumBuffer[(y + 1) * width + (x - 1)] += error * (3 / 16);
                        lumBuffer[(y + 1) * width + x] += error * (5 / 16);
                        if (x + 1 < width) lumBuffer[(y + 1) * width + (x + 1)] += error * (1 / 16);
                    }
                }
            }
        }

        const cleanCustomText = customText.replace(/\s/g, '');
        const hasCustomText = isCustom && cleanCustomText.length > 0;
        let charIndex = 0;

        const matrix = new Array(height);
        const textLines = new Array(height);

        for (let y = 0; y < height; y++) {
            const row = new Array(width);
            let lineStr = '';
            const yOffset = y * width;

            for (let x = 0; x < width; x++) {
                const idx = yOffset + x;
                const lum = Math.min(255, Math.max(0, lumBuffer[idx]));
                const rgb = rgbBuffer[idx];

                let char;

                if (hasCustomText) {
                    // Texto Personalizado: pixels escuros (fundo) são espaços vazios para revelar o contorno
                    const darkThreshold = 30;
                    if (isLightBg) {
                        if (lum > (255 - darkThreshold) || rgb.a === 0) {
                            char = ' ';
                        } else {
                            char = cleanCustomText[charIndex % cleanCustomText.length];
                            charIndex++;
                        }
                    } else {
                        if (lum < darkThreshold || rgb.a === 0) {
                            char = ' ';
                        } else {
                            char = cleanCustomText[charIndex % cleanCustomText.length];
                            charIndex++;
                        }
                    }
                } else {
                    // Paleta de densidade normal (index 0 = espaço, index final = caractere denso)
                    if (rgb.a === 0) {
                        char = ' ';
                    } else {
                        let pIndex = Math.floor((lum / 256) * pLen);
                        if (pIndex >= pLen) pIndex = pLen - 1;
                        char = palette[pIndex];
                    }
                }

                row[x] = {
                    char,
                    r: rgb.r,
                    g: rgb.g,
                    b: rgb.b,
                    lum,
                    a: rgb.a
                };
                lineStr += char;
            }

            matrix[y] = row;
            textLines[y] = lineStr;
        }

        return {
            text: textLines.join('\n'),
            matrix
        };
    }

    /**
     * Renderiza o ASCII em Canvas com suporte total a todos os modos (RGB, Matrix, Âmbar, Monocromático)
     */
    renderToCanvas(targetCanvas, matrix, mode = 'monochrome', options = {}) {
        const {
            fontSize = 10,
            bgColor = '#090d16'
        } = options;

        if (!matrix || matrix.length === 0) return;

        const heightChars = matrix.length;
        const widthChars = matrix[0].length;

        const cellW = fontSize * 0.6;
        const cellH = fontSize;
        const padding = 20;

        targetCanvas.width = Math.ceil(widthChars * cellW + padding * 2);
        targetCanvas.height = Math.ceil(heightChars * cellH + padding * 2);

        const ctx = targetCanvas.getContext('2d');
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);

        ctx.font = `bold ${fontSize}px "Courier New", Courier, monospace`;
        ctx.textBaseline = 'top';

        const isLightBg = (bgColor === '#f8fafc');

        for (let y = 0; y < heightChars; y++) {
            const row = matrix[y];
            const yPos = padding + y * cellH;

            for (let x = 0; x < widthChars; x++) {
                const cell = row[x];
                if (cell.char === ' ' || cell.a === 0) continue;

                const xPos = padding + x * cellW;
                const lum = cell.lum;

                // Definir cor exata de acordo com o modo de renderização
                if (mode === 'rgb') {
                    ctx.fillStyle = `rgb(${cell.r},${cell.g},${cell.b})`;
                } else if (mode === 'matrix') {
                    // Verde Terminal Matrix graduado por luminância
                    const alpha = Math.max(0.35, lum / 255);
                    const g = Math.round(150 + (lum / 255) * 105);
                    ctx.fillStyle = `rgba(34, ${g}, 94, ${alpha})`;
                } else if (mode === 'amber') {
                    // Âmbar Vintage graduado por luminância
                    const alpha = Math.max(0.35, lum / 255);
                    const r = Math.round(180 + (lum / 255) * 75);
                    const g = Math.round(100 + (lum / 255) * 105);
                    ctx.fillStyle = `rgba(${r}, ${g}, 11, ${alpha})`;
                } else {
                    // Monocromático (Escala de Cinza P&B)
                    if (isLightBg) {
                        const alpha = Math.max(0.25, (255 - lum) / 255);
                        ctx.fillStyle = `rgba(15, 23, 42, ${alpha})`;
                    } else {
                        const alpha = Math.max(0.3, lum / 255);
                        const gray = Math.round(140 + (lum / 255) * 115);
                        ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
                    }
                }

                ctx.fillText(cell.char, xPos, yPos);
            }
        }
    }

    /**
     * Cria exportação de imagem PNG Ultra HD com acabamento profissional
     */
    exportToHDImage(matrix, mode = 'monochrome', options = {}) {
        const hdCanvas = document.createElement('canvas');
        this.renderToCanvas(hdCanvas, matrix, mode, {
            ...options,
            fontSize: 14 // Resolução expandida para impressão e compartilhamento
        });

        // Adicionar assinatura/marca discreta no rodapé
        const ctx = hdCanvas.getContext('2d');
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('Gerado por 4u.ia.br/app/ascii', hdCanvas.width - 15, hdCanvas.height - 8);

        return hdCanvas.toDataURL('image/png');
    }

    /**
     * Gera HTML otimizado agrupando spans consecutivos para qualquer modo
     */
    generateOptimizedHTML(matrix, mode = 'rgb', bgColor = '#090d16') {
        const height = matrix.length;
        let html = `<div style="background-color:${bgColor}; font-family:'Courier New', monospace; line-height:1; font-size:10px; white-space:pre; padding:16px; border-radius:8px;">`;

        for (let y = 0; y < height; y++) {
            const row = matrix[y];
            let lastColor = null;
            let currentText = '';

            for (let x = 0; x < row.length; x++) {
                const cell = row[x];
                if (cell.char === ' ' || cell.a === 0) {
                    currentText += ' ';
                    continue;
                }

                let colorStr;
                if (mode === 'rgb') {
                    colorStr = `rgb(${cell.r},${cell.g},${cell.b})`;
                } else if (mode === 'matrix') {
                    const g = Math.round(150 + (cell.lum / 255) * 105);
                    colorStr = `rgb(34,${g},94)`;
                } else if (mode === 'amber') {
                    const r = Math.round(180 + (cell.lum / 255) * 75);
                    const g = Math.round(100 + (cell.lum / 255) * 105);
                    colorStr = `rgb(${r},${g},11)`;
                } else {
                    const gray = Math.round(140 + (cell.lum / 255) * 115);
                    colorStr = `rgb(${gray},${gray},${gray})`;
                }

                if (colorStr === lastColor) {
                    currentText += cell.char;
                } else {
                    if (lastColor && currentText.length > 0) {
                        html += `<span style="color:${lastColor}">${this.escapeHtml(currentText)}</span>`;
                    } else if (currentText.length > 0) {
                        html += this.escapeHtml(currentText);
                    }
                    lastColor = colorStr;
                    currentText = cell.char;
                }
            }

            if (lastColor && currentText.length > 0) {
                html += `<span style="color:${lastColor}">${this.escapeHtml(currentText)}</span>`;
            } else if (currentText.length > 0) {
                html += this.escapeHtml(currentText);
            }
            html += '<br>';
        }

        html += '</div>';
        return html;
    }

    escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

window.AsciiEngine = AsciiEngine;
window.AsciiPresets = AsciiPresets;