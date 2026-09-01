<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
$assetVersion = time();
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Gerador de ASCII Art Moderno — Processamento 100% Local</title>
    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
    <link rel="apple-touch-icon" href="favicon.svg">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#0f172a">

    <!-- Bootstrap 5 CSS (Apenas para layout de Grid - row/col e utilitários como d-none) -->
    <!-- NOTA: Muitos estilos do Bootstrap serão sobrescritos pelo nosso CSS personalizado -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">

    <!-- CSS Personalizado (Tema Escuro) -->
    <link rel="stylesheet" type="text/css" href="css/style.css">

 

    <style>
        /* 4U.IA.BR Standardized Footer */
        .footer-clean {
            position: relative;
            width: 100%;
            z-index: 10000;
            padding: 2.5rem 0;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 4rem;
        }
        .footer-clean span {
            font-size: 0.65rem;
            color: rgba(255, 255, 255, 0.3);
            letter-spacing: 0.25em;
            text-transform: uppercase;
            font-weight: 600;
        }
    </style>
</head>
<body>

    <!-- Cabeçalho com novo estilo e spans para cor -->
    <header class="site-header">
        <h1><span class="geek">ASCII</span> Art <span class="code">Generator</span></h1>
        <p class="lead">Converta suas imagens em incrível arte ASCII diretamente no seu navegador!</p>
    </header>

    <main class="container">

        <!-- PASSO 1: Seleção da Imagem -->
        <!-- Removido shadow-sm, border, border-success. A nova classe .card lida com isso -->
        <section id="step1" class="card mb-4">
            <div class="card-body">
                <h2 class="card-title">Passo 1: Selecione sua Imagem</h2>
                <p class="text-muted mb-4" style="color: var(--medium-gray) !important;">(Todo o processamento é feito localmente no seu navegador. Sua imagem <strong>não</strong> será enviada para nenhum servidor.)</p>
                <div class="mb-3">
                    <label for="source-image" class="form-label">Escolha um arquivo de imagem:</label>
                    <input type="file" class="form-control" id="source-image" accept="image/*">
                </div>
            </div>
        </section>

        <!-- PASSO 2: Pré-visualização e Configuração -->
        <!-- Removido shadow-sm, border, border-success. d-none permanece -->
        <section id="step2" class="card mb-4 d-none">
            <div class="card-body">
                <h2 class="card-title">Passo 2: Pré-visualização e Ajustes</h2>

                <!-- Pré-visualização -->
                <div class="text-center mb-4">
                    <img id="img-preview" src="#" alt="Pré-visualização da Imagem" class="img-fluid" style="max-height: 300px; display: none;">
                </div>

                <h3 class="h5 mb-3" style="color: var(--light-yellow);">Parâmetros de Conversão</h3>
                <p class="text-muted small mb-4" style="color: var(--medium-gray) !important;">(Ajuste os valores para otimizar o resultado. Os padrões geralmente funcionam bem.)</p>

                <!-- Controles de Redimensionamento -->
                <div class="row g-3 align-items-end mb-4">
                     <div class="col-md-4">
                        <label for="x-resize" class="form-label">Largura (chars):</label>
                        <input type="number" class="form-control" id="x-resize" value="100" min="10">
                     </div>
                     <div class="col-md-4">
                        <label for="y-resize" class="form-label">Altura (chars):</label>
                        <input type="number" class="form-control" id="y-resize" value="50" min="5">
                     </div>
                     <div class="col-md-4 d-flex align-items-center justify-content-start justify-content-md-center pt-3 pt-md-0">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="keep-ratio" checked>
                            <label class="form-check-label" for="keep-ratio">
                                Manter Proporção
                            </label>
                        </div>
                     </div>
                </div>

                <hr> <!-- Divisor visual -->

                <!-- Opções de Conversão (HTML Colorido vs Texto P&B) -->
                <div class="row g-4">
                    <!-- Coluna HTML Colorido -->
                    <div class="col-lg-6">
                        <!-- Este é um card conceitual, sem a classe .card para não aninhar estilos complexos -->
                        <div class="conversion-option p-3 rounded" style="background-color: rgba(0,0,0,0.1); border: 1px solid var(--dark-gray);">
                            <h4 class="h5 mb-3" style="color: var(--neon-green);">Opção 1: HTML Colorido</h4>
                            <div class="mb-3">
                                <label for="html-text" class="form-label">Texto para preenchimento:</label>
                                <textarea id="html-text" class="form-control" rows="6">Tyger Tyger, burning bright, In the forests of the night; What immortal hand or eye, Could frame thy fearful symmetry? In what distant deeps or skies, Burnt the fire of thine eyes? On what wings dare he aspire? What the hand, dare seize the fire?</textarea>
                                <div class="form-text mt-2" style="font-size: 0.8rem; color: var(--medium-gray);">O texto será repetido. Espaços são ignorados na contagem.</div>
                            </div>
                            <button id="convert-html-btn" class="btn btn-success w-100">Converter para HTML</button>
                        </div>
                    </div>

                    <!-- Coluna Texto Puro (P&B) -->
                    <div class="col-lg-6">
                         <div class="conversion-option p-3 rounded" style="background-color: rgba(0,0,0,0.1); border: 1px solid var(--dark-gray);">
                            <h4 class="h5 mb-3" style="color: var(--neon-green);">Opção 2: Texto Puro (P&B)</h4>
                            <div class="mb-3">
                                <label for="bw-text" class="form-label">Paleta (escuro p/ claro):</label>
                                <input type="text" id="bw-text" class="form-control" value="@%#*+=-:. ">
                                 <div class="form-text mt-2" style="font-size: 0.8rem; color: var(--medium-gray);">Mais caracteres = mais tons de cinza.</div>
                            </div>
                            <button id="convert-text-btn" class="btn btn-success w-100">Converter para Texto Puro</button>
                         </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- PASSO 3: Resultado da Conversão -->
        <!-- Removido shadow-sm, border, border-success. d-none permanece -->
        <section id="step3" class="card mb-4 d-none">
            <div class="card-body">
                <h2 class="card-title">Passo 3: Resultado da Conversão ASCII</h2>
                <div id="result" class="ascii-output mb-3">
                    <!-- O resultado da conversão ASCII aparecerá aqui -->
                    Aguardando conversão...
                </div>
                 <button id="copy-result-btn" class="btn btn-success mt-2 d-none">Copiar Resultado</button> <!-- Botão verde -->
                 <a href="#step1" class="btn btn-link mt-2 float-end">Converter Nova Imagem</a> <!-- Link rosa -->
            </div>
        </section>

    </main>

    <footer class="footer-clean">
        <span>&copy; <?php echo date('Y'); ?> ASCII Art Generator — Processamento 100% Local • <a href="privacidade.php" style="color:#22c55e; text-decoration:underline;">Privacidade</a> | <a href="termos.php" style="color:#22c55e; text-decoration:underline;">Termos</a> | <a href="suporte.php" style="color:#22c55e; text-decoration:underline;">Suporte & Contato</a></span>
    </footer>
    <!-- Bootstrap 5 JS Bundle (Necessário para alguns utilitários como d-none talvez, mas principalmente Popper se usado) -->
    <!-- Manter caso alguma funcionalidade Bootstrap seja necessária futuramente ou por dependências -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

    <!-- Scripts Funcionais (Mantidos Intactos) -->
    <script src="js/ascii_converter.js"></script>
    <script src="js/main.js"></script>



    <script>
      // PWA Service Worker Registration & Anti-Cache
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker.register("sw.js").catch(err => console.log("SW reg error:", err));
        });
      }
    </script>
</body>
</html>