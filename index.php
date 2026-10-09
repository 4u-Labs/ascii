<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
$assetVersion = '2.0.1';
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>ASCII Art Studio 4U — Conversor de Imagens &amp; Webcam em Arte ASCII</title>
    <meta name="description" content="Converta fotos, ilustrações e webcam em incrível arte ASCII em tempo real. Processamento 100% local, exportação PNG HD, TXT e HTML.">
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
    <link rel="apple-touch-icon" href="apple-touch-icon.png">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#090d18">

    <!-- Open Graph / Redes Sociais -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="ASCII Art Studio 4U — Conversor de Imagens &amp; Webcam em Arte ASCII">
    <meta property="og:description" content="Transforme fotos e webcam em arte ASCII em tempo real com exportação PNG Ultra HD. 100% local no navegador.">
    <meta property="og:image" content="banner-16-9.jpg">
    <meta property="og:url" content="https://4u.ia.br/app/ascii/">

    <!-- Fontes Google & FontAwesome -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&family=Orbitron:wght@600;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">

    <!-- Bootstrap 5 CSS Grid -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- CSS Personalizado -->
    <link rel="stylesheet" type="text/css" href="css/style.css?v=<?php echo $assetVersion; ?>">
</head>
<body>

    <!-- Header Principal -->
    <header class="studio-header">
        <div class="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <div class="brand-area d-flex align-items-center gap-3">
                <div class="brand-logo-glow">
                    <i class="fas fa-terminal text-success"></i>
                </div>
                <div>
                    <h1 class="brand-title mb-0">ASCII <span class="text-neon-cyan">ART</span> <span class="badge-studio">STUDIO</span></h1>
                    <p class="brand-sub mb-0">Motor de Arte ASCII em Tempo Real • 100% Seguro no Navegador</p>
                </div>
            </div>
            <div class="header-badges d-flex align-items-center gap-2">
                <span class="badge bg-dark-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                    <i class="fas fa-shield-halved me-1"></i> Zero Envio de Dados
                </span>
                <span class="badge bg-dark-subtle text-info border border-info-subtle px-3 py-2 rounded-pill">
                    <i class="fas fa-bolt me-1"></i> 60 FPS Engine
                </span>
            </div>
        </div>
    </header>

    <!-- Conteúdo Principal Split-Screen -->
    <main class="container py-4">
        <div class="row g-4">

            <!-- ================= COLUNA DA ESQUERDA: CONTROLES & CALIBRAÇÃO ================= -->
            <div class="col-lg-5">
                
                <!-- 1. Card de Entrada de Imagem / Drag & Drop -->
                <div class="studio-card mb-4">
                    <div class="card-header-styled">
                        <i class="fas fa-upload text-success"></i>
                        <span>1. Selecionar ou Colar Imagem</span>
                    </div>
                    <div class="card-body-styled">
                        <div id="dropZone" class="drop-zone">
                            <i class="fas fa-cloud-arrow-up drop-icon"></i>
                            <div class="drop-title">Arraste sua imagem aqui</div>
                            <div class="drop-sub">ou clique para navegar no computador/celular</div>
                            <div class="drop-hint mt-2">
                                <kbd>Ctrl</kbd> + <kbd>V</kbd> para colar print diretamente da área de transferência
                            </div>
                            <input type="file" id="fileInput" accept="image/*" class="d-none">
                        </div>

                        <!-- Arquivo Ativo -->
                        <div class="file-active-bar mt-3 d-flex align-items-center justify-content-between">
                            <span class="text-muted small"><i class="fas fa-image me-1"></i>Arquivo Atual:</span>
                            <strong id="currentFileName" class="text-truncate text-neon-cyan small" style="max-width: 220px;">4U Labs Logo</strong>
                        </div>

                        <!-- Exemplos Rápidos -->
                        <div class="mt-3">
                            <div class="small text-muted mb-2"><i class="fas fa-sparkles text-warning me-1"></i>Ou teste com um exemplo de 1 clique:</div>
                            <div class="d-flex flex-wrap gap-2">
                                <button type="button" class="btn btn-sm btn-sample sample-btn" data-sample="logo4u">
                                    <i class="fas fa-cube text-success me-1"></i>4U Logo
                                </button>
                                <button type="button" class="btn btn-sm btn-sample sample-btn" data-sample="skull">
                                    <i class="fas fa-skull text-info me-1"></i>Cyber Skull
                                </button>
                                <button type="button" class="btn btn-sm btn-sample sample-btn" data-sample="cat">
                                    <i class="fas fa-cat text-danger me-1"></i>Neon Cat
                                </button>
                                <button type="button" class="btn btn-sm btn-sample sample-btn" data-sample="monalisa">
                                    <i class="fas fa-palette text-warning me-1"></i>Mona Lisa
                                </button>
                            </div>
                        </div>

                        <!-- ASCII Mirror (Câmera ao Vivo) -->
                        <div class="mt-3 pt-3 border-top border-secondary border-opacity-25">
                            <div class="d-flex align-items-center justify-content-between">
                                <button type="button" id="webcamToggleBtn" class="btn btn-outline-success btn-sm w-100">
                                    <i class="fas fa-video me-2"></i>Ativar ASCII Mirror (Webcam ao Vivo)
                                </button>
                            </div>
                            <div id="webcamStatus" class="webcam-live-indicator d-none mt-2">
                                <span class="pulse-dot"></span>
                                <span>Câmera transmitindo em tempo real.</span>
                                <button type="button" id="webcamSnapBtn" class="btn btn-sm btn-warning ms-auto">
                                    <i class="fas fa-camera me-1"></i>Congelar Foto
                                </button>
                            </div>
                            <video id="webcamVideo" autoplay playsinline muted style="display:none;"></video>
                        </div>
                    </div>
                </div>

                <!-- 2. Card de Paletas & Estilo de Caracteres -->
                <div class="studio-card mb-4">
                    <div class="card-header-styled">
                        <i class="fas fa-font text-info"></i>
                        <span>2. Paleta de Caracteres</span>
                    </div>
                    <div class="card-body-styled">
                        <div class="preset-buttons-grid">
                            <button type="button" class="preset-btn active" data-preset="dense">
                                <div class="preset-name">💎 Ultra Denso</div>
                                <div class="preset-preview">$@B%8WM#*</div>
                            </button>
                            <button type="button" class="preset-btn" data-preset="blocks">
                                <div class="preset-name">🧱 Blocos Unicode</div>
                                <div class="preset-preview">█▓▒░</div>
                            </button>
                            <button type="button" class="preset-btn" data-preset="matrix">
                                <div class="preset-name">🟢 Matrix Hacker</div>
                                <div class="preset-preview">101010</div>
                            </button>
                            <button type="button" class="preset-btn" data-preset="braille">
                                <div class="preset-name">⠿ Braille Art</div>
                                <div class="preset-preview">⣿⣶⣤⣀</div>
                            </button>
                            <button type="button" class="preset-btn" data-preset="minimal">
                                <div class="preset-name">⚡ Minimalista</div>
                                <div class="preset-preview">@%#*+=-:.</div>
                            </button>
                            <button type="button" class="preset-btn" data-preset="custom">
                                <div class="preset-name">✏️ Texto Personalizado</div>
                                <div class="preset-preview">Sua Frase</div>
                            </button>
                        </div>

                        <!-- Campo de Texto Personalizado -->
                        <div id="customTextGroup" class="mt-3 d-none">
                            <label for="customText" class="form-label small text-info">Digite o texto que será repetido na arte:</label>
                            <input type="text" id="customText" class="form-control form-control-sm" value="4U LABS ART " placeholder="Ex: SEU NOME OU FRASE">
                        </div>
                    </div>
                </div>

                <!-- 3. Card de Calibração Fina & Resolução -->
                <div class="studio-card mb-4">
                    <div class="card-header-styled">
                        <i class="fas fa-sliders text-warning"></i>
                        <span>3. Calibração &amp; Resolução</span>
                    </div>
                    <div class="card-body-styled">
                        <!-- Modo de Cor -->
                        <div class="mb-3">
                            <label for="outputMode" class="form-label small d-flex justify-content-between">
                                <span>Modo de Renderização:</span>
                            </label>
                            <select id="outputMode" class="form-select">
                                <option value="monochrome" selected>⚪ Monocromático (Escala de Cinza P&amp;B)</option>
                                <option value="rgb">🌈 HTML Colorido Fiel (Cores Originais RGB)</option>
                                <option value="matrix">🟢 Terminal Hacker (Verde Fosforescente Matrix)</option>
                                <option value="amber">🟠 Terminal Vintage (Fósforo Âmbar Retro)</option>
                            </select>
                        </div>

                        <!-- Largura e Altura -->
                        <div class="row g-2 mb-3">
                            <div class="col-6">
                                <label for="charWidth" class="form-label small d-flex justify-content-between">
                                    <span>Largura:</span>
                                    <strong id="charWidthVal" class="text-neon-cyan">100</strong>
                                </label>
                                <input type="range" class="form-range" id="charWidth" min="40" max="220" step="5" value="100">
                            </div>
                            <div class="col-6">
                                <label for="charHeight" class="form-label small">Altura (linhas):</label>
                                <input type="number" id="charHeight" class="form-control form-control-sm" value="55" min="10" max="180">
                            </div>
                            <div class="col-12 mt-1">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="keepRatio" checked>
                                    <label class="form-check-label small text-muted" for="keepRatio">Manter Proporção Natural (Aspect Ratio 0.55)</label>
                                </div>
                            </div>
                        </div>

                        <hr class="border-secondary border-opacity-25 my-3">

                        <!-- Contraste e Brilho -->
                        <div class="row g-3 mb-3">
                            <div class="col-6">
                                <label for="contrast" class="form-label small d-flex justify-content-between">
                                    <span>Contraste:</span>
                                    <strong id="contrastVal" class="text-info">0</strong>
                                </label>
                                <input type="range" class="form-range" id="contrast" min="-100" max="100" step="5" value="0">
                            </div>
                            <div class="col-6">
                                <label for="brightness" class="form-label small d-flex justify-content-between">
                                    <span>Brilho:</span>
                                    <strong id="brightnessVal" class="text-info">0</strong>
                                </label>
                                <input type="range" class="form-range" id="brightness" min="-100" max="100" step="5" value="0">
                            </div>
                        </div>

                        <!-- Toggles: Invert & Dither -->
                        <div class="d-flex flex-wrap justify-content-between gap-2 pt-2">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="invert">
                                <label class="form-check-label small" for="invert">Inverter Cores (Negativo)</label>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="dither">
                                <label class="form-check-label small" for="dither">Dithering (Floyd-Steinberg)</label>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- ================= COLUNA DA DIREITA: PREVIEW & EXPORTAÇÕES ================= -->
            <div class="col-lg-7">
                
                <div class="studio-card sticky-preview-card">
                    <!-- Toolbar Superior -->
                    <div class="preview-toolbar d-flex flex-wrap align-items-center justify-content-between gap-2 p-3">
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1.5" id="statsBadge">
                                100 × 55 chars
                            </span>
                            <span class="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5" id="timeBadge">
                                1.8 ms
                            </span>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <!-- Tamanho da Fonte -->
                            <div class="d-flex align-items-center gap-1">
                                <label for="fontSizeSelect" class="small text-muted mb-0"><i class="fas fa-text-height"></i></label>
                                <select id="fontSizeSelect" class="form-select form-select-sm" style="width: 85px;">
                                    <option value="6">6 px</option>
                                    <option value="8">8 px</option>
                                    <option value="10" selected>10 px</option>
                                    <option value="12">12 px</option>
                                    <option value="14">14 px</option>
                                </select>
                            </div>

                            <!-- Fundo do Preview -->
                            <div class="d-flex align-items-center gap-1">
                                <label for="bgThemeSelect" class="small text-muted mb-0"><i class="fas fa-circle-half-stroke"></i></label>
                                <select id="bgThemeSelect" class="form-select form-select-sm" style="width: 105px;">
                                    <option value="#090d16" selected>Dark Slate</option>
                                    <option value="#000000">Preto Puro</option>
                                    <option value="#030a05">Matrix Dark</option>
                                    <option value="#f8fafc">Papel Branco</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Container do Viewport de Arte ASCII -->
                    <div id="previewContainer" class="preview-viewport-container">
                        <canvas id="previewCanvas" class="ascii-canvas-display"></canvas>
                        <pre id="asciiTextOutput" class="d-none"></pre>
                    </div>

                    <!-- Rodapé com Ações de Exportação -->
                    <div class="export-actions-bar p-3 border-top border-secondary border-opacity-25">
                        <div class="row g-2">
                            <!-- Download PNG HD -->
                            <div class="col-sm-6">
                                <button type="button" id="btnDownloadPng" class="btn btn-primary w-100 btn-glow-cyan">
                                    <i class="fas fa-file-image me-2"></i>Baixar Imagem PNG HD
                                </button>
                            </div>
                            <!-- Copiar Texto -->
                            <div class="col-sm-6">
                                <button type="button" id="btnCopyText" class="btn btn-success w-100 btn-glow-green">
                                    <i class="fas fa-copy me-2"></i>Copiar Texto Puro
                                </button>
                            </div>
                            <!-- Download TXT -->
                            <div class="col-4">
                                <button type="button" id="btnDownloadTxt" class="btn btn-secondary btn-sm w-100">
                                    <i class="fas fa-file-lines me-1"></i>Baixar .TXT
                                </button>
                            </div>
                            <!-- Download HTML -->
                            <div class="col-4">
                                <button type="button" id="btnDownloadHtml" class="btn btn-secondary btn-sm w-100">
                                    <i class="fas fa-code me-1"></i>Baixar .HTML
                                </button>
                            </div>
                            <!-- Copiar HTML -->
                            <div class="col-4">
                                <button type="button" id="btnCopyHtml" class="btn btn-outline-secondary btn-sm w-100">
                                    <i class="fas fa-copy me-1"></i>Copiar HTML
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </main>

    <!-- Rodapé Padronizado 4U -->
    <footer class="footer-clean">
        <span>&copy; <?php echo date('Y'); ?> ASCII Art Studio 4U — Processamento 100% Local • <a href="privacidade.php">Privacidade</a> | <a href="termos.php">Termos</a> | <a href="suporte.php">Suporte &amp; Contato</a></span>
    </footer>

    <!-- Scripts CDN & Motor -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/ascii_converter.js?v=<?php echo $assetVersion; ?>"></script>
    <script src="js/main.js?v=<?php echo $assetVersion; ?>"></script>

    <!-- PWA Service Worker -->
    <script>
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker.register("sw.js").catch(err => console.log("SW error:", err));
        });
      }
    </script>
</body>
</html>