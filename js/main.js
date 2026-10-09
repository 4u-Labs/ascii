/**
 * ASCII Studio 4U — Interface Interativa, Webcam ao Vivo & Exportação
 */

document.addEventListener('DOMContentLoaded', () => {
    const engine = new AsciiEngine();

    // --- Elementos do DOM ---
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const sampleImgs = document.querySelectorAll('.sample-btn');
    
    // Configurações
    const charWidthInput = document.getElementById('charWidth');
    const charWidthVal = document.getElementById('charWidthVal');
    const charHeightInput = document.getElementById('charHeight');
    const keepRatioCheck = document.getElementById('keepRatio');
    const contrastInput = document.getElementById('contrast');
    const contrastVal = document.getElementById('contrastVal');
    const brightnessInput = document.getElementById('brightness');
    const brightnessVal = document.getElementById('brightnessVal');
    const invertCheck = document.getElementById('invert');
    const ditherCheck = document.getElementById('dither');
    const customTextInput = document.getElementById('customText');
    const customTextGroup = document.getElementById('customTextGroup');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const outputModeSelect = document.getElementById('outputMode');

    // Preview & Toolbar
    const previewCanvas = document.getElementById('previewCanvas');
    const asciiTextOutput = document.getElementById('asciiTextOutput');
    const statsBadge = document.getElementById('statsBadge');
    const timeBadge = document.getElementById('timeBadge');
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    const bgThemeSelect = document.getElementById('bgThemeSelect');
    const previewContainer = document.getElementById('previewContainer');

    // Webcam
    const webcamVideo = document.getElementById('webcamVideo');
    const webcamToggleBtn = document.getElementById('webcamToggleBtn');
    const webcamSnapBtn = document.getElementById('webcamSnapBtn');
    const webcamStatus = document.getElementById('webcamStatus');

    // Exportação
    const btnCopyText = document.getElementById('btnCopyText');
    const btnCopyHtml = document.getElementById('btnCopyHtml');
    const btnDownloadTxt = document.getElementById('btnDownloadTxt');
    const btnDownloadHtml = document.getElementById('btnDownloadHtml');
    const btnDownloadPng = document.getElementById('btnDownloadPng');

    // Estado da Aplicação
    let currentImage = null;
    let currentAspectRatio = 1.0;
    let currentPalette = AsciiPresets.dense;
    let isWebcamActive = false;
    let webcamStream = null;
    let webcamAnimationId = null;
    let liveUpdateTimer = null;
    let lastAsciiText = '';
    let lastColorMatrix = null;

    // --- Exemplos Embutidos em SVG Data URLs ---
    const SampleSvgs = {
        logo4u: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%230b0f19"/><circle cx="150" cy="150" r="100" fill="%2322c55e"/><path d="M110 90 v70 h40 v40 h30 v-40 h20 v-30 h-20 v-40 z" fill="%230b0f19"/><text x="150" y="270" fill="%2338bdf8" font-size="28" font-family="sans-serif" font-weight="bold" text-anchor="middle">4U LABS</text></svg>`,
        skull: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23090d16"/><path d="M150 40 C90 40 70 90 70 140 C70 190 100 210 110 240 L190 240 C200 210 230 190 230 140 C230 90 210 40 150 40 Z" fill="%23e2e8f0"/><ellipse cx="115" cy="140" rx="24" ry="30" fill="%23090d16"/><ellipse cx="185" cy="140" rx="24" ry="30" fill="%23090d16"/><path d="M150 180 L140 200 L160 200 Z" fill="%23090d16"/><path d="M120 220 h60 M130 210 v20 M150 210 v20 M170 210 v20" stroke="%23090d16" stroke-width="4"/></svg>`,
        cat: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%230f172a"/><polygon points="70,120 100,50 140,110" fill="%23f43f5e"/><polygon points="230,120 200,50 160,110" fill="%23f43f5e"/><circle cx="150" cy="170" r="80" fill="%23cbd5e1"/><ellipse cx="120" cy="155" rx="14" ry="20" fill="%2322c55e"/><ellipse cx="180" cy="155" rx="14" ry="20" fill="%2322c55e"/><polygon points="150,185 142,175 158,175" fill="%23f43f5e"/><path d="M150,185 Q135,200 120,195 M150,185 Q165,200 180,195" stroke="%230f172a" stroke-width="3" fill="none"/></svg>`,
        monalisa: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%231a1510"/><ellipse cx="150" cy="130" rx="55" ry="70" fill="%23e8c39e"/><path d="M85 90 C85 60 215 60 215 90 C215 160 205 240 205 260 L95 260 C95 240 85 160 85 90 Z" fill="%232d2013"/><ellipse cx="150" cy="125" rx="42" ry="55" fill="%23f3d1b0"/><ellipse cx="132" cy="115" rx="9" ry="6" fill="%233e2b1b"/><ellipse cx="168" cy="115" rx="9" ry="6" fill="%233e2b1b"/><path d="M150 115 v25 h8" stroke="%23c29571" stroke-width="3" fill="none"/><path d="M136 152 Q150 160 164 152" stroke="%238b4513" stroke-width="3" fill="none"/><path d="M95 230 L70 300 L230 300 L205 230 Z" fill="%231e3427"/></svg>`
    };

    // --- Inicialização ---
    initEventListeners();
    loadDefaultImage();

    function initEventListeners() {
        // Drag & Drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0]);
            }
        });
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
            }
        });

        // Colar direto (Ctrl+V)
        window.addEventListener('paste', (e) => {
            if (e.clipboardData && e.clipboardData.items) {
                for (let item of e.clipboardData.items) {
                    if (item.type.indexOf('image') !== -1) {
                        const file = item.getAsFile();
                        handleFile(file);
                        showToast('Imagem colada da área de transferência!', 'success');
                        break;
                    }
                }
            }
        });

        // Botões de Amostra
        sampleImgs.forEach(btn => {
            btn.addEventListener('click', () => {
                const sampleKey = btn.dataset.sample;
                if (SampleSvgs[sampleKey]) {
                    loadFromDataUrl(SampleSvgs[sampleKey], btn.textContent.trim());
                }
            });
        });

        // Controles de Configuração
        charWidthInput.addEventListener('input', () => {
            charWidthVal.textContent = charWidthInput.value;
            if (keepRatioCheck.checked && currentAspectRatio > 0) {
                updateHeightFromWidth();
            }
            scheduleLiveUpdate();
        });

        charHeightInput.addEventListener('input', scheduleLiveUpdate);

        keepRatioCheck.addEventListener('change', () => {
            if (keepRatioCheck.checked) updateHeightFromWidth();
            scheduleLiveUpdate();
        });

        contrastInput.addEventListener('input', () => {
            contrastVal.textContent = (contrastInput.value > 0 ? '+' : '') + contrastInput.value;
            scheduleLiveUpdate();
        });

        brightnessInput.addEventListener('input', () => {
            brightnessVal.textContent = (brightnessInput.value > 0 ? '+' : '') + brightnessInput.value;
            scheduleLiveUpdate();
        });

        invertCheck.addEventListener('change', scheduleLiveUpdate);
        ditherCheck.addEventListener('change', scheduleLiveUpdate);
        outputModeSelect.addEventListener('change', scheduleLiveUpdate);
        customTextInput.addEventListener('input', scheduleLiveUpdate);

        // Presets de Paleta
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                presetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const presetKey = btn.dataset.preset;

                if (presetKey === 'custom') {
                    customTextGroup.classList.remove('d-none');
                } else {
                    customTextGroup.classList.add('d-none');
                    currentPalette = AsciiPresets[presetKey] || AsciiPresets.dense;
                }
                scheduleLiveUpdate();
            });
        });

        // Toolbar de Zoom e Fundo
        fontSizeSelect.addEventListener('change', () => {
            renderCurrentOutput();
        });

        bgThemeSelect.addEventListener('change', () => {
            applyBgTheme(bgThemeSelect.value);
            renderCurrentOutput();
        });

        // Webcam
        webcamToggleBtn.addEventListener('click', toggleWebcam);
        webcamSnapBtn.addEventListener('click', captureWebcamSnapshot);

        // Exportações
        btnCopyText.addEventListener('click', () => {
            if (!lastAsciiText) return;
            navigator.clipboard.writeText(lastAsciiText).then(() => {
                showToast('Arte ASCII copiada como texto puro!', 'success');
            }).catch(() => showToast('Erro ao copiar para a área de transferência', 'error'));
        });

        btnCopyHtml.addEventListener('click', () => {
            if (!lastColorMatrix) return;
            const html = engine.generateOptimizedHTML(lastColorMatrix, bgThemeSelect.value);
            navigator.clipboard.writeText(html).then(() => {
                showToast('Código HTML otimizado copiado!', 'success');
            }).catch(() => showToast('Erro ao copiar', 'error'));
        });

        btnDownloadTxt.addEventListener('click', () => {
            if (!lastAsciiText) return;
            downloadBlob(new Blob([lastAsciiText], { type: 'text/plain;charset=utf-8' }), 'arte-ascii-4u.txt');
            showToast('Arquivo .txt baixado com sucesso!', 'success');
        });

        btnDownloadHtml.addEventListener('click', () => {
            if (!lastColorMatrix && !lastAsciiText) return;
            const mode = outputModeSelect.value;
            let bodyContent = '';
            if (mode === 'rgb' && lastColorMatrix) {
                bodyContent = engine.generateOptimizedHTML(lastColorMatrix, bgThemeSelect.value);
            } else {
                bodyContent = `<pre style="background:${bgThemeSelect.value}; color:#22c55e; font-family:'Courier New', monospace; line-height:1; font-size:10px; padding:20px; border-radius:10px;">${engine.escapeHtml(lastAsciiText)}</pre>`;
            }

            const standaloneHtml = `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Arte ASCII — Gerado no 4U Labs Studio</title>
  <style>
    body { background: #030712; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; font-family: sans-serif; }
    .card { background: #0b1120; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); overflow-x: auto; }
    .footer { text-align: center; margin-top: 15px; font-size: 12px; color: #64748b; }
    a { color: #22c55e; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    ${bodyContent}
    <div class="footer">Gerado por <a href="https://4u.ia.br/app/ascii/" target="_blank">ASCII Art Studio 4U</a></div>
  </div>
</body>
</html>`;
            downloadBlob(new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' }), 'arte-ascii-4u.html');
            showToast('Arquivo .html autônomo baixado!', 'success');
        });

        btnDownloadPng.addEventListener('click', () => {
            if (!lastColorMatrix && !lastAsciiText) return;
            const mode = outputModeSelect.value;
            const isColor = (mode === 'rgb');
            const dataToRender = isColor ? lastColorMatrix : lastAsciiText;
            const textColor = mode === 'matrix' ? '#22c55e' : (mode === 'amber' ? '#f59e0b' : '#e2e8f0');

            const pngDataUrl = engine.exportToHDImage(dataToRender, isColor, {
                bgColor: bgThemeSelect.value,
                textColor: textColor
            });

            const link = document.createElement('a');
            link.download = 'arte-ascii-ultra-hd-4u.png';
            link.href = pngDataUrl;
            link.click();
            showToast('Imagem PNG Ultra HD gerada e baixada!', 'success');
        });
    }

    // --- Manipulação de Imagens ---
    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            showToast('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP, etc.)', 'error');
            return;
        }

        stopWebcam();
        AsciiEngine.loadImage(file).then(img => {
            setImage(img, file.name);
            showToast(`Imagem carregada: ${file.name}`, 'success');
        }).catch(err => {
            showToast('Erro ao carregar arquivo de imagem', 'error');
        });
    }

    function loadFromDataUrl(dataUrl, name) {
        stopWebcam();
        const img = new Image();
        img.onload = () => {
            setImage(img, name);
            showToast(`Exemplo carregado: ${name}`, 'success');
        };
        img.src = dataUrl;
    }

    function setImage(img, name = 'Imagem') {
        currentImage = img;
        currentAspectRatio = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
        updateHeightFromWidth();
        document.getElementById('currentFileName').textContent = name;
        triggerConversion();
    }

    function loadDefaultImage() {
        loadFromDataUrl(SampleSvgs.logo4u, '4U Labs Logo');
    }

    function updateHeightFromWidth() {
        const width = parseInt(charWidthInput.value, 10) || 100;
        // Fator de proporção 0.55 para compensar caracteres monoespaçados (mais altos do que largos)
        const fontAspectFactor = 0.55;
        const height = Math.max(10, Math.round((width / currentAspectRatio) * fontAspectFactor));
        charHeightInput.value = height;
    }

    function scheduleLiveUpdate() {
        if (isWebcamActive) return;
        clearTimeout(liveUpdateTimer);
        liveUpdateTimer = setTimeout(() => {
            triggerConversion();
        }, 120);
    }

    // --- Processamento e Renderização ---
    function triggerConversion() {
        if (!currentImage) return;

        const startTime = performance.now();
        const width = parseInt(charWidthInput.value, 10) || 100;
        const height = parseInt(charHeightInput.value, 10) || 50;

        const contrast = parseInt(contrastInput.value, 10) || 0;
        const brightness = parseInt(brightnessInput.value, 10) || 0;
        const invert = invertCheck.checked;
        const dither = ditherCheck.checked;
        const mode = outputModeSelect.value;

        let activePalette = currentPalette;
        const customText = customTextInput.value.trim();
        const isCustom = document.querySelector('.preset-btn[data-preset="custom"]').classList.contains('active');

        const imageData = engine.prepareCanvas(currentImage, width, height);

        if (mode === 'rgb' || isCustom) {
            lastColorMatrix = engine.convertToColorMatrix(imageData, {
                palette: activePalette,
                contrast,
                brightness,
                invert,
                customText: isCustom ? customText : ''
            });
            // Gera também versão texto correspondente para cópia rápida
            lastAsciiText = lastColorMatrix.map(row => row.map(cell => cell.char).join('')).join('\n');
        } else {
            lastAsciiText = engine.convertToText(imageData, {
                palette: activePalette,
                contrast,
                brightness,
                invert,
                dither
            });
            lastColorMatrix = null;
        }

        const endTime = performance.now();
        const duration = (endTime - startTime).toFixed(1);

        // Atualizar estatísticas
        statsBadge.textContent = `${width} × ${height} chars (${(width * height).toLocaleString('pt-BR')} caracteres)`;
        timeBadge.textContent = `${duration} ms`;

        renderCurrentOutput();
    }

    function renderCurrentOutput() {
        const mode = outputModeSelect.value;
        const fontSize = parseInt(fontSizeSelect.value, 10) || 10;
        const bgColor = bgThemeSelect.value;

        const isColor = (mode === 'rgb');
        const dataToRender = isColor ? lastColorMatrix : lastAsciiText;
        if (!dataToRender) return;

        const textColor = mode === 'matrix' ? '#22c55e' : (mode === 'amber' ? '#f59e0b' : '#e2e8f0');

        engine.renderToCanvas(previewCanvas, dataToRender, isColor, {
            fontSize,
            bgColor,
            textColor
        });

        // Atualizar bloco oculto de texto puro para seleção fácil
        asciiTextOutput.textContent = lastAsciiText;
        asciiTextOutput.style.backgroundColor = bgColor;
        asciiTextOutput.style.color = textColor;
    }

    function applyBgTheme(bgColor) {
        previewContainer.style.backgroundColor = bgColor;
    }

    // --- Webcam (ASCII Mirror) ---
    function toggleWebcam() {
        if (isWebcamActive) {
            stopWebcam();
        } else {
            startWebcam();
        }
    }

    function startWebcam() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showToast('Seu navegador não suporta captura de câmera', 'error');
            return;
        }

        navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        }).then(stream => {
            webcamStream = stream;
            webcamVideo.srcObject = stream;
            webcamVideo.play();
            isWebcamActive = true;

            webcamToggleBtn.classList.remove('btn-outline-success');
            webcamToggleBtn.classList.add('btn-danger');
            webcamToggleBtn.innerHTML = '<i class="fas fa-video-slash me-2"></i>Desativar Câmera';
            webcamSnapBtn.classList.remove('d-none');
            webcamStatus.classList.remove('d-none');

            document.getElementById('currentFileName').textContent = 'Webcam ao Vivo (ASCII Mirror)';
            showToast('ASCII Mirror Ativo! Olhe para a câmera!', 'success');

            runWebcamLoop();
        }).catch(err => {
            showToast('Permissão de câmera negada ou dispositivo indisponível', 'error');
        });
    }

    function stopWebcam() {
        if (!isWebcamActive) return;
        isWebcamActive = false;
        if (webcamAnimationId) cancelAnimationFrame(webcamAnimationId);

        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
        }

        webcamToggleBtn.classList.remove('btn-danger');
        webcamToggleBtn.classList.add('btn-outline-success');
        webcamToggleBtn.innerHTML = '<i class="fas fa-video me-2"></i>Ativar ASCII Mirror';
        webcamSnapBtn.classList.add('d-none');
        webcamStatus.classList.add('d-none');
    }

    function runWebcamLoop() {
        if (!isWebcamActive) return;

        if (webcamVideo.readyState === webcamVideo.HAVE_ENOUGH_DATA) {
            currentImage = webcamVideo;
            currentAspectRatio = webcamVideo.videoWidth / webcamVideo.videoHeight;
            triggerConversion();
        }

        webcamAnimationId = requestAnimationFrame(runWebcamLoop);
    }

    function captureWebcamSnapshot() {
        if (!isWebcamActive || !webcamVideo) return;

        // Congelar o frame capturado
        const snapCanvas = document.createElement('canvas');
        snapCanvas.width = webcamVideo.videoWidth;
        snapCanvas.height = webcamVideo.videoHeight;
        const ctx = snapCanvas.getContext('2d');
        ctx.drawImage(webcamVideo, 0, 0);

        const snapImg = new Image();
        snapImg.onload = () => {
            stopWebcam();
            setImage(snapImg, `Captura_Webcam_${new Date().toLocaleTimeString().replace(/:/g, '-')}`);
            showToast('Foto capturada! Arte ASCII congelada para exportação.', 'success');
        };
        snapImg.src = snapCanvas.toDataURL('image/png');
    }

    // --- Utilitários de Download e Feedback ---
    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `studio-toast ${type}`;
        const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-info-circle');
        toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2800);
    }
});