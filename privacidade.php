<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
$assetVersion = time();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Política de Privacidade — ASCII Art Generator</title>
  <meta name="description" content="Política de Privacidade do ASCII Art Generator. Processamento 100% local de imagens com zero envio de arquivos para servidores.">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { font-family: 'Inter', system-ui, -apple-system, sans-serif; box-sizing: border-box; }
    .legal-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(34, 197, 94, 0.2);
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      line-height: 1.7;
      color: #e2e8f0;
    }
    .legal-container h1 { font-size: 1.8rem; margin-bottom: 0.5rem; color: #22c55e; font-weight: 800; }
    .legal-container h2 { font-size: 1.25rem; margin: 1.5rem 0 0.5rem; color: #38bdf8; font-weight: 600; }
    .legal-container p, .legal-container ul { font-size: 0.9rem; color: #94a3b8; margin-bottom: 1rem; }
    .legal-container ul { padding-left: 1.2rem; }
    .legal-container li { margin-bottom: 0.4rem; }
    .back-btn { display: inline-flex; align-items: center; gap: 0.4rem; color: #22c55e; text-decoration: none; font-weight: 600; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .app-header-legal { padding: 1rem 1.5rem; background: #0b0f19; border-bottom: 1px solid rgba(34, 197, 94, 0.2); }
    .app-footer-legal { text-align: center; padding: 1.25rem; font-size: 0.775rem; color: #64748b; border-top: 1px solid rgba(255,255,255,0.08); margin-top: auto; }
  </style>
</head>
<body style="background:#090d16; color:#fff; min-height:100vh; display:flex; flex-direction:column;">
  
  <header class="app-header-legal">
    <div style="max-width:1200px; margin:0 auto; display:flex; align-items:center; justify-content:space-between;">
      <a href="index.php" style="display:flex; align-items:center; gap:0.6rem; text-decoration:none; color:#fff; font-weight:800; font-size:1.3rem;">
        <img src="favicon.svg" style="width:32px; height:32px; object-fit:contain;">
        <span>ASCII<span style="color:#22c55e;">Art</span></span>
      </a>
    </div>
  </header>

  <main style="flex:1;">
    <div class="legal-container">
      <a href="index.php" class="back-btn">← Voltar ao ASCII Generator</a>
      
      <h1>Política de Privacidade</h1>
      <p>Última atualização: <?php echo date('d/m/Y'); ?></p>

      <h2>1. Processamento 100% Local de Imagens (Zero Server Upload)</h2>
      <p>O <strong>ASCII Art Generator</strong> opera de forma estritamente local em seu navegador através das APIs nativas do HTML5 Canvas. Suas imagens <strong>nunca são enviadas, enviadas por upload ou armazenadas</strong> em nenhum servidor externo.</p>

      <h2>2. Coleta Zero de Dados Pessoais</h2>
      <p>Não solicitamos cadastro, login ou qualquer informação identificável. Toda a manipulação de pixels e geração de caracteres ASCII acontece diretamente na memória temporária da sua placa gráfica / navegador.</p>

      <h2>3. Cookies e Armazenamento Local</h2>
      <p>Utilizamos apenas recursos padrão do navegador para funcionamento de Service Worker em PWA offline, sem qualquer rastreamento publicitário ou cookies de terceiros.</p>

      <h2>4. Contato</h2>
      <p>Se você tiver alguma dúvida sobre nossa política de privacidade, entre em contato via e-mail: <code>contato@4u.ia.br</code> ou pela nossa <a href="suporte.php" style="color:#22c55e;">Central de Suporte</a>.</p>
    </div>
  </main>

  <footer class="app-footer-legal">
    <p>ASCII Art Generator • <a href="privacidade.php" style="color:#64748b; text-decoration:underline;">Privacidade</a> | <a href="termos.php" style="color:#64748b; text-decoration:underline;">Termos</a> | <a href="suporte.php" style="color:#64748b; text-decoration:underline;">Suporte</a></p>
  </footer>

</body>
</html>
