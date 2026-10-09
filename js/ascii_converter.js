/**
 * ASCII Studio 4U — Engine de Conversão de Alto Desempenho
 * 100% Client-side, Zero-lag buffer extraction & Canvas renderer
 */

const AsciiPresets = {
    dense: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
    blocks: '█▓▒░ ',
    matrix: '10 ',
    braille: '⣿⣶⣤⣀ ',
    minimal: '@%#*+=-:. ',
    classic: '#WMBRXVYIti+=;:,. ',
    slash: '/\\|-_+ ',
    emoji: '⬛🟫🟪🟦🟩🟨🟧🟥⬜'
};

const AsciiThemes = {
    monochrome: { bg: '#090d16', text: '#e2e8f0', name: 'Monocromático P&B' },
    matrix: { bg: '#030a05', text: '#22c55e', name: 'Terminal Matrix' },
    cyberpunk: { bg: '#0e0717', text: '#f43f5e', name: 'Cyberpunk Neon' },
    amber: { bg: '#100b02', text: '#f59e0b', name: 'Fósforo Âmbar Retro' },
    paper: { bg: '#f8fafc', text: '#0f172a', name: 'Papel Claro' },
    rgb: { bg: '#090d16', text: 'rgb', name: 'HTML Colorido (RGB)' }
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
     * Processa a imagem para ASCII Text em alta velocidade (leitura única em lote)
     */
    convertToText(imageData, options = {}) {
        const {
            palette = AsciiPresets.dense,
            contrast = 0,
            brightness = 0,
            invert = false,
            dither = false
        } = options;

        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const pLen = palette.length;

        // Fator de contraste: [-100, 100]
        const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        // Buffer de luminância para dithering ou mapeamento direto
        const lumBuffer = new Float32Array(width * height);

        let ptr = 0;
        for (let i = 0; i < lumBuffer.length; i++) {
            let r = data[ptr];
            let g = data[ptr + 1];
            let b = data[ptr + 2];
            let a = data[ptr + 3];
            ptr += 4;

            if (a < 30) {
                lumBuffer[i] = invert ? 0 : 255;
                continue;
            }

            // Brilho
            if (brightness !== 0) {
                r = Math.min(255, Math.max(0, r + brightness));
                g = Math.min(255, Math.max(0, g + brightness));
                b = Math.min(255, Math.max(0, b + brightness));
            }

            // Contraste
            if (contrast !== 0) {
                r = Math.min(255, Math.max(0, cFactor * (r - 128) + 128));
                g = Math.min(255, Math.max(0, cFactor * (g - 128) + 128));
                b = Math.min(255, Math.max(0, cFactor * (b - 128) + 128));
            }

            // Fórmula de luminância padrão ITU-R BT.601
            let lum = 0.299 * r + 0.587 * g + 0.114 * b;

            if (invert) {
                lum = 255 - lum;
            }

            lumBuffer[i] = lum;
        }

        // Floyd-Steinberg Dithering em escala de cinza (se ativado)
        if (dither) {
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

        // Construção das linhas
        const lines = new Array(height);
        for (let y = 0; y < height; y++) {
            let row = '';
            const yOffset = y * width;
            for (let x = 0; x < width; x++) {
                const lum = Math.min(255, Math.max(0, lumBuffer[yOffset + x]));
                let pIndex = Math.floor((lum / 256) * pLen);
                if (pIndex >= pLen) pIndex = pLen - 1;
                row += palette[pIndex];
            }
            lines[y] = row;
        }

        return lines.join('\n');
    }

    /**
     * Converte para matriz com cores RGB para renderização colorida em alta velocidade
     */
    convertToColorMatrix(imageData, options = {}) {
        const {
            palette = AsciiPresets.dense,
            contrast = 0,
            brightness = 0,
            invert = false,
            customText = ''
        } = options;

        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const pLen = palette.length;
        const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        const cleanCustomText = customText.replace(/\s/g, '');
        const useCustomText = cleanCustomText.length > 0;
        let charIndex = 0;

        const matrix = new Array(height);
        let ptr = 0;

        for (let y = 0; y < height; y++) {
            const row = new Array(width);
            for (let x = 0; x < width; x++) {
                let r = data[ptr];
                let g = data[ptr + 1];
                let b = data[ptr + 2];
                let a = data[ptr + 3];
                ptr += 4;

                if (a < 30) {
                    row[x] = { char: ' ', r: 0, g: 0, b: 0, a: 0 };
                    continue;
                }

                if (brightness !== 0) {
                    r = Math.min(255, Math.max(0, r + brightness));
                    g = Math.min(255, Math.max(0, g + brightness));
                    b = Math.min(255, Math.max(0, b + brightness));
                }

                if (contrast !== 0) {
                    r = Math.min(255, Math.max(0, cFactor * (r - 128) + 128));
                    g = Math.min(255, Math.max(0, cFactor * (g - 128) + 128));
                    b = Math.min(255, Math.max(0, cFactor * (b - 128) + 128));
                }

                let lum = 0.299 * r + 0.587 * g + 0.114 * b;
                if (invert) lum = 255 - lum;

                let char;
                if (useCustomText) {
                    char = cleanCustomText[charIndex % cleanCustomText.length];
                    charIndex++;
                } else {
                    let pIdx = Math.floor((lum / 256) * pLen);
                    if (pIdx >= pLen) pIdx = pLen - 1;
                    char = palette[pIdx];
                }

                row[x] = { char, r: Math.round(r), g: Math.round(g), b: Math.round(b), a };
            }
            matrix[y] = row;
        }

        return matrix;
    }

    /**
     * Gera HTML otimizado agrupando spans consecutivos da mesma cor
     */
    generateOptimizedHTML(colorMatrix, bgColor = '#090d16') {
        const height = colorMatrix.length;
        let html = `<div style="background-color:${bgColor}; font-family:'Courier New', monospace; line-height:1; font-size:10px; white-space:pre; padding:16px; border-radius:8px;">`;

        for (let y = 0; y < height; y++) {
            const row = colorMatrix[y];
            let lastColor = null;
            let currentText = '';

            for (let x = 0; x < row.length; x++) {
                const cell = row[x];
                if (cell.char === ' ') {
                    currentText += ' ';
                    continue;
                }
                const colorStr = `rgb(${cell.r},${cell.g},${cell.b})`;
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

    /**
     * Renderiza o ASCII em um Canvas alvo (alta fidelidade visual, ultra rápido, ideal para webcam e exportação HD)
     */
    renderToCanvas(targetCanvas, asciiData, isColor, options = {}) {
        const {
            theme = 'monochrome',
            fontSize = 10,
            bgColor = '#090d16',
            textColor = '#22c55e'
        } = options;

        const cellW = fontSize * 0.6;
        const cellH = fontSize;

        let widthChars, heightChars;
        if (isColor) {
            heightChars = asciiData.length;
            widthChars = asciiData[0].length;
        } else {
            const lines = asciiData.split('\n');
            heightChars = lines.length;
            widthChars = lines[0].length;
        }

        const padding = 20;
        targetCanvas.width = Math.ceil(widthChars * cellW + padding * 2);
        targetCanvas.height = Math.ceil(heightChars * cellH + padding * 2);

        const ctx = targetCanvas.getContext('2d');
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);

        ctx.font = `bold ${fontSize}px "Courier New", Courier, monospace`;
        ctx.textBaseline = 'top';

        if (isColor) {
            for (let y = 0; y < heightChars; y++) {
                const row = asciiData[y];
                const yPos = padding + y * cellH;
                for (let x = 0; x < widthChars; x++) {
                    const cell = row[x];
                    if (cell.char === ' ' || cell.a === 0) continue;
                    ctx.fillStyle = `rgb(${cell.r},${cell.g},${cell.b})`;
                    ctx.fillText(cell.char, padding + x * cellW, yPos);
                }
            }
        } else {
            const lines = asciiData.split('\n');
            ctx.fillStyle = textColor;
            for (let y = 0; y < heightChars; y++) {
                const line = lines[y];
                const yPos = padding + y * cellH;
                ctx.fillText(line, padding, yPos);
            }
        }
    }

    /**
     * Cria exportação de imagem PNG Ultra HD com acabamento profissional e moldura
     */
    exportToHDImage(asciiData, isColor, options = {}) {
        const hdCanvas = document.createElement('canvas');
        this.renderToCanvas(hdCanvas, asciiData, isColor, {
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
window.AsciiThemes = AsciiThemes;