<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
$assetVersion = time();

$feedbackMsg = "";
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['email']) && !empty($_POST['message'])) {
    $senderEmail = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $userMsg = htmlspecialchars($_POST['message']);
    
    $to = "contato@4u.ia.br";
    $subject = "=?UTF-8?B?" . base64_encode("ASCII Generator — Nova Mensagem de Suporte") . "?=";
    $body = "Nova mensagem enviada pelo ASCII Art Generator Suporte:\n\nDe: " . $senderEmail . "\nData: " . date('d/m/Y H:i') . "\n\nMensagem:\n" . $userMsg;
    
    $headers = "From: contato@4u.ia.br\r\n" .
               "Reply-To: " . $senderEmail . "\r\n" .
               "MIME-Version: 1.0\r\n" .
               "Content-Type: text/plain; charset=UTF-8\r\n" .
               "X-Mailer: PHP/" . phpversion();

    @mail($to, $subject, $body, $headers);

    // Save backup log on server
    $uploadDir = __DIR__ . '/uploads/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    $logFile = $uploadDir . 'messages_log.json';
    $existing = file_exists($logFile) ? json_decode(file_get_contents($logFile), true) : [];
    $existing[] = [
        'id' => uniqid('msg_', true),
        'app' => 'ASCII Art Generator',
        'from' => $senderEmail,
        'date' => date('Y-m-d H:i:s'),
        'message' => $_POST['message']
    ];
    file_put_contents($logFile, json_encode($existing, JSON_PRETTY_PRINT));

    $feedbackMsg = "Mensagem enviada com sucesso! Nossa equipe responderá em breve.";
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Suporte & Contato — ASCII Art Generator</title>
  <meta name="description" content="Central de Suporte e FAQ do ASCII Art Generator.">
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
    .faq-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1rem; margin-bottom: 0.75rem; }
    .faq-q { font-weight: 700; color: #fff; font-size: 0.95rem; margin-bottom: 0.3rem; }
    .faq-a { color: #94a3b8; font-size: 0.85rem; line-height: 1.5; }
    .contact-card { background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 1.25rem; margin-top: 1.5rem; }
    .input-field { width: 100%; background: #090d16; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 0.75rem; color: #fff; font-size: 0.9rem; outline: none; }
    .btn-submit { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; }
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
      
      <h1>Central de Suporte & Contato</h1>
      <p>Perguntas frequentes e canal direto de atendimento.</p>

      <h2>Perguntas Frequentes (FAQ)</h2>

      <div class="faq-item">
        <div class="faq-q">🔒 Minha imagem é enviada para algum servidor?</div>
        <div class="faq-a">Não. O conversor lê e desenha os pixels utilizando a tecnologia HTML5 Canvas diretamente no seu navegador. Suas imagens nunca saem do seu computador ou celular.</div>
      </div>

      <div class="faq-item">
        <div class="faq-q">🎨 Qual a diferença entre HTML Colorido e Texto Puro (P&B)?</div>
        <div class="faq-a">O <strong>HTML Colorido</strong> preserva as cores originais da imagem aplicando estilos CSS inline em cada caractere. O <strong>Texto Puro</strong> converte a imagem para tons de cinza usando caracteres como <code>@%#*+=-:. </code> perfeitos para copiar e colar em qualquer bloco de notas ou WhatsApp.</div>
      </div>

      <h2>Entre em Contato</h2>
      <div class="contact-card">
        <?php if ($feedbackMsg): ?>
          <div style="padding: 0.75rem; background: rgba(34, 197, 94, 0.15); border: 1px solid #22c55e; color: #22c55e; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem;">
            <?php echo $feedbackMsg; ?>
          </div>
        <?php endif; ?>

        <p style="font-size: 0.85rem; margin-bottom: 1rem;">Dúvidas ou sugestões? Envie um e-mail para <code>contato@4u.ia.br</code> ou preencha o formulário abaixo:</p>

        <form method="POST" action="suporte.php" style="display: flex; flex-direction: column; gap: 0.85rem;">
          <input type="email" name="email" placeholder="Seu e-mail de contato" class="input-field" required>
          <textarea name="message" rows="4" placeholder="Escreva sua mensagem..." class="input-field" style="resize: vertical;" required></textarea>
          <button type="submit" class="btn-submit">
            Enviar Mensagem
          </button>
        </form>
      </div>

    </div>
  </main>

  <footer class="app-footer-legal">
    <p>ASCII Art Generator • <a href="privacidade.php" style="color:#64748b; text-decoration:underline;">Privacidade</a> | <a href="termos.php" style="color:#64748b; text-decoration:underline;">Termos</a> | <a href="suporte.php" style="color:#64748b; text-decoration:underline;">Suporte</a></p>
  </footer>

</body>
</html>
