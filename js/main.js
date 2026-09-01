// Espera o DOM (estrutura HTML) estar completamente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores de Elementos DOM ---
    const sourceImageInput = document.getElementById('source-image');
    const imgPreview = document.getElementById('img-preview');
    const step2Section = document.getElementById('step2');
    const step3Section = document.getElementById('step3');
    const resultDiv = document.getElementById('result');
    const copyResultBtn = document.getElementById('copy-result-btn');

    const xResizeInput = document.getElementById('x-resize');
    const yResizeInput = document.getElementById('y-resize');
    const keepRatioCheckbox = document.getElementById('keep-ratio');

    const htmlTextInput = document.getElementById('html-text');
    const convertHtmlBtn = document.getElementById('convert-html-btn');

    const bwTextInput = document.getElementById('bw-text');
    const convertTextBtn = document.getElementById('convert-text-btn');

    let originalImageRatio = 1; // Armazena a proporção da imagem original

    // --- Funções da Interface ---

    /**
     * Manipula o upload de uma nova imagem.
     * @param {Event} event - O evento 'change' do input de arquivo.
     */
    function handleImageUpload(event) {
        // Usa a função importada 'inputToImage' para carregar a imagem
        inputToImage(event.target, imgPreview)
            .then(loadedImg => {
                // Armazena a proporção original da imagem
                if (loadedImg.naturalHeight > 0) {
                    originalImageRatio = loadedImg.naturalWidth / loadedImg.naturalHeight;
                } else {
                    originalImageRatio = 1; // Proporção padrão caso algo falhe
                }

                // Exibe a pré-visualização da imagem
                imgPreview.style.display = 'block';

                // Define valores padrão para largura e dispara atualização da altura (se manter proporção)
                xResizeInput.value = 100; // Valor padrão moderno
                updateYResize(); // Atualiza Y baseado no X padrão e proporção

                // Exibe o Passo 2 e esconde o Passo 3 (caso já estivesse visível)
                step2Section.classList.remove('d-none');
                step3Section.classList.add('d-none');
                copyResultBtn.classList.add('d-none'); // Esconde botão de copiar
                resultDiv.innerHTML = ''; // Limpa resultado anterior
            })
            .catch(error => {
                console.error("Erro ao carregar imagem:", error);
                alert(`Erro ao carregar imagem: ${error.message}`);
                // Esconde a pré-visualização e o Passo 2 se houver erro
                imgPreview.style.display = 'none';
                step2Section.classList.add('d-none');
                step3Section.classList.add('d-none');
            });
    }

    /**
     * Atualiza o valor da altura (y-resize) baseado na largura (x-resize)
     * e na proporção da imagem, se a opção "Manter Proporção" estiver marcada.
     * O fator 0.5 é um ajuste comum para fontes monoespaçadas (caracteres são mais altos que largos).
     */
    function updateYResize() {
        if (keepRatioCheckbox.checked && originalImageRatio > 0 && imgPreview.src && imgPreview.style.display !== 'none') {
            const width = parseInt(xResizeInput.value, 10);
            if (!isNaN(width) && width > 0) {
                // Ajuste comum para fontes monoespaçadas (altura/largura ~0.5 ou 0.6)
                // Você pode ajustar esse fator (ex: 0.5, 0.6) para melhor aparência visual
                const heightFactor = 0.55;
                yResizeInput.value = Math.round(width / originalImageRatio * heightFactor);
            }
        }
    }

    /**
     * Atualiza o valor da largura (x-resize) baseado na altura (y-resize)
     * e na proporção da imagem, se a opção "Manter Proporção" estiver marcada.
     */
    function updateXResize() {
        if (keepRatioCheckbox.checked && originalImageRatio > 0 && imgPreview.src && imgPreview.style.display !== 'none') {
            const height = parseInt(yResizeInput.value, 10);
            if (!isNaN(height) && height > 0) {
                 // Inverso do fator usado em updateYResize
                 const heightFactor = 0.55;
                 xResizeInput.value = Math.round(height * originalImageRatio / heightFactor);
            }
        }
    }

    /**
     * Função genérica para iniciar a conversão.
     * @param {Function} conversionFunction - A função de conversão a ser chamada (canvasToHTML ou canvasToText).
     * @param {string} conversionArg - O argumento adicional para a função de conversão (texto HTML ou paleta P&B).
     */
    function performConversion(conversionFunction, conversionArg) {
        // Verifica se há uma imagem carregada
        if (!imgPreview.src || imgPreview.style.display === 'none') {
            alert("Por favor, selecione uma imagem primeiro.");
            return;
        }

        // Obtém os valores de largura e altura desejados
        const width = parseInt(xResizeInput.value, 10) || 100; // Usa 100 como padrão se inválido
        const height = parseInt(yResizeInput.value, 10) || 50;  // Usa 50 como padrão se inválido

        // Desabilita botões para evitar cliques múltiplos durante o processamento
        disableButtons(true);

        // Usa a função 'imageToCanvas' para obter o canvas redimensionado
        imageToCanvas(imgPreview, null, width, height)
            .then(canvas => {
                // Chama a função de conversão específica (HTML ou Texto)
                const resultHTML = conversionFunction(canvas, conversionArg);

                // Exibe o resultado e o Passo 3
                resultDiv.innerHTML = resultHTML;
                step3Section.classList.remove('d-none');
                copyResultBtn.classList.remove('d-none'); // Mostra botão de copiar

                // Rola a página suavemente até o resultado
                step3Section.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
                console.error("Erro durante a conversão:", error);
                alert(`Erro durante a conversão: ${error.message}`);
            })
            .finally(() => {
                // Reabilita os botões após a conclusão (ou falha)
                disableButtons(false);
            });
    }

     /**
     * Copia o conteúdo textual da área de resultado para a área de transferência.
     */
    function copyResultToClipboard() {
        // A forma de copiar depende se é HTML ou Texto Puro (<pre>)
        let textToCopy = '';
        const preElement = resultDiv.querySelector('pre');
        const htmlContainer = resultDiv.querySelector('.ascii-html-container');

        if (preElement) {
            // Se for texto puro (dentro de <pre>), copia o texto interno
            textToCopy = preElement.textContent;
        } else if (htmlContainer) {
             // Se for HTML, tenta extrair uma representação textual (pode não ser ideal)
             // Ou copia o HTML bruto (menos útil para colar em editores de texto)
             // Vamos tentar extrair o texto, linha por linha
             const lines = [];
             htmlContainer.querySelectorAll('span').forEach(span => {
                 // Pega o texto de cada span
                 lines.push(span.textContent);
                 // Verifica se o próximo elemento é um <br> para adicionar quebra de linha
                 if(span.nextSibling && span.nextSibling.tagName === 'BR') {
                     lines.push('\n');
                 }
             });
             textToCopy = lines.join('');

             // Alternativa: Copiar o HTML bruto (descomente a linha abaixo se preferir)
             // textToCopy = resultDiv.innerHTML;
        } else {
            textToCopy = resultDiv.textContent; // Fallback
        }


        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                // Feedback visual para o usuário
                const originalText = copyResultBtn.textContent;
                copyResultBtn.textContent = 'Copiado!';
                copyResultBtn.classList.remove('btn-success');
                copyResultBtn.classList.add('btn-outline-success');
                setTimeout(() => {
                    copyResultBtn.textContent = originalText;
                    copyResultBtn.classList.remove('btn-outline-success');
                    copyResultBtn.classList.add('btn-success');
                }, 2000); // Volta ao normal após 2 segundos
            })
            .catch(err => {
                console.error('Erro ao copiar para a área de transferência:', err);
                alert('Não foi possível copiar o resultado. Tente manualmente.');
            });
    }


    /**
     * Habilita ou desabilita os botões de conversão.
     * @param {boolean} disabled - True para desabilitar, false para habilitar.
     */
    function disableButtons(disabled) {
        convertHtmlBtn.disabled = disabled;
        convertTextBtn.disabled = disabled;
        // Adiciona/remove uma classe para feedback visual (opcional)
        if (disabled) {
            convertHtmlBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Convertendo...';
            convertTextBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Convertendo...';
        } else {
            convertHtmlBtn.textContent = 'Converter para HTML';
            convertTextBtn.textContent = 'Converter para Texto Puro';
        }
    }

    // --- Anexando Event Listeners ---

    // Quando um arquivo é selecionado
    sourceImageInput.addEventListener('change', handleImageUpload);

    // Quando os valores de redimensionamento mudam
    xResizeInput.addEventListener('change', updateYResize);
    yResizeInput.addEventListener('change', updateXResize);

    // Quando a opção "Manter Proporção" muda (atualiza a dimensão dependente)
    keepRatioCheckbox.addEventListener('change', () => {
        if(keepRatioCheckbox.checked) {
            updateYResize(); // Prioriza atualizar Y quando a opção é marcada
        }
    });

    // Quando o botão "Converter para HTML" é clicado
    convertHtmlBtn.addEventListener('click', () => {
        performConversion(canvasToHTML, htmlTextInput.value);
    });

    // Quando o botão "Converter para Texto Puro" é clicado
    convertTextBtn.addEventListener('click', () => {
        performConversion(canvasToText, bwTextInput.value);
    });

     // Quando o botão "Copiar Resultado" é clicado
    copyResultBtn.addEventListener('click', copyResultToClipboard);

}); // Fim do addEventListener('DOMContentLoaded')