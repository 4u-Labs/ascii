// ----- Funções de Conversão (Baseadas no seu código original) -----

/**
 * Lê um arquivo de imagem de um elemento input e o carrega em um elemento <img>.
 * @param {HTMLInputElement} input - O elemento input type="file".
 * @param {HTMLImageElement} [img] - O elemento img onde a imagem será carregada (opcional, será criado se não fornecido).
 * @returns {Promise<HTMLImageElement>} Uma Promise que resolve com o elemento img carregado.
 */
function inputToImage(input, img) {
    return new Promise((resolve, reject) => {
        // Verifica se algum arquivo foi selecionado
        if (!input.files || input.files.length === 0) {
            return reject(new Error("Nenhum arquivo selecionado."));
        }
        const file = input.files[0];

        // Cria um leitor de arquivos
        let reader = new FileReader();

        // Cria um elemento <img> se não foi fornecido
        if (!img) {
            img = document.createElement("img");
        }

        // Define o que fazer quando a leitura do arquivo terminar
        reader.onloadend = function() {
            img.src = reader.result;
            // A imagem pode não ter carregado ainda, esperamos o evento onload da imagem
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(new Error("Erro ao carregar a imagem no elemento <img>: " + e));
        }

        // Define o que fazer em caso de erro na leitura
        reader.onerror = (e) => reject(new Error("Erro ao ler o arquivo: " + e));
        reader.onabort = () => reject(new Error("Leitura do arquivo abortada."));

        // Inicia a leitura do arquivo como Data URL
        reader.readAsDataURL(file);
    });
}

/**
 * Desenha uma imagem em um canvas, redimensionando-a opcionalmente.
 * @param {HTMLImageElement} img - O elemento img fonte.
 * @param {HTMLCanvasElement} [canvas] - O canvas de destino (opcional, será criado se não fornecido).
 * @param {number} [xresize] - A largura desejada para o canvas. Se não fornecida, usa a largura da imagem.
 * @param {number} [yresize] - A altura desejada para o canvas. Se não fornecida, usa a altura da imagem.
 * @returns {Promise<HTMLCanvasElement>} Uma Promise que resolve com o canvas contendo a imagem desenhada.
 */
function imageToCanvas(img, canvas, xresize, yresize) {
    // Cria um canvas se não foi fornecido
    if (!canvas) {
        canvas = document.createElement('canvas');
    }

    return new Promise((resolve) => {
        // Função para desenhar no canvas
        const loadCanvas = function () {
            // Define as dimensões do canvas (prioriza os valores de redimensionamento)
            canvas.width = xresize || img.naturalWidth; // Usar naturalWidth/Height para dimensões originais
            canvas.height = yresize || img.naturalHeight;

            // Obtém o contexto 2D e desenha a imagem redimensionada
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Resolve a Promise com o canvas pronto
            resolve(canvas);
        };

        // Se a imagem já estiver completamente carregada, desenha imediatamente
        // Verifica também se tem src, pois img.complete pode ser true para img sem src
        if (img.complete && img.naturalWidth !== 0) {
            loadCanvas();
        } else {
            // Caso contrário, espera o evento 'onload' da imagem
            img.onload = loadCanvas;
             // Adiciona um manipulador de erro também
            img.onerror = () => reject(new Error("Erro ao carregar a imagem para o canvas."));
        }
    });
}

/**
 * Converte um canvas em uma representação HTML colorida usando caracteres de um texto.
 * @param {HTMLCanvasElement} canvas - O canvas fonte.
 * @param {string} text - O texto cujos caracteres serão usados e coloridos.
 * @returns {string} Uma string HTML contendo a arte ASCII colorida.
 */
function canvasToHTML(canvas, text) {
    let context = canvas.getContext("2d", { willReadFrequently: true }); // Otimização para getImageData frequente
    let textIndex = 0;
    let HTMLOut = "";

    // Remove espaços e quebras de linha do texto para usar apenas os caracteres visíveis
    const chars = text.replace(/\s/g, '');
    if (chars.length === 0) {
        // Fallback se o texto fornecido só tiver espaços
        chars = ".";
    }

    // Itera sobre cada "pixel" (célula de caractere) do canvas
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            // Obtém os dados de cor do pixel atual (RGBA)
            let imgData = context.getImageData(x, y, 1, 1);
            let r = imgData.data[0];
            let g = imgData.data[1];
            let b = imgData.data[2];

            // Pega o próximo caractere do texto (ciclicamente)
            let char = chars.charAt(textIndex % chars.length);

            // Adiciona um <span> com a cor do pixel e o caractere
            // Usar `textContent` ou escapar o caractere seria mais seguro se o texto pudesse conter HTML
            // Mas para ASCII art, geralmente é seguro. Adicionando `white-space: pre` para garantir espaçamento.
            HTMLOut += `<span style='color: rgb(${r},${g},${b});'>${char}</span>`;

            textIndex++; // Avança para o próximo caractere do texto
        }
        HTMLOut += "<br>"; // Adiciona uma quebra de linha no final de cada linha do canvas
    }
    // Envolve o resultado em uma div para aplicar estilos gerais (fundo, etc.) via CSS
    // O fundo preto foi removido daqui para ser controlado pelo CSS
    return `<div class="ascii-html-container">${HTMLOut}</div>`;
}

/**
 * Converte um canvas em uma representação ASCII em texto puro (tons de cinza).
 * @param {HTMLCanvasElement} canvas - O canvas fonte.
 * @param {string} palette - A string de caracteres representando a paleta (do mais escuro para o mais claro).
 * @returns {string} Uma string contendo a arte ASCII em texto puro, envolvida em tags <pre>.
 */
function canvasToText(canvas, palette) {
    let context = canvas.getContext("2d", { willReadFrequently: true }); // Otimização
    let textOut = "";

    // Garante que a paleta não esteja vazia
    if (!palette || palette.length === 0) {
        palette = "@%#*+=-:. "; // Paleta padrão
    }
    const paletteLength = palette.length;

    // Itera sobre cada "pixel" (célula de caractere) do canvas
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            // Obtém os dados de cor do pixel atual (RGBA)
            let imgData = context.getImageData(x, y, 1, 1);
            let r = imgData.data[0];
            let g = imgData.data[1];
            let b = imgData.data[2];

            // Calcula a intensidade de cinza (média simples) - existem fórmulas melhores (luminosidade)
            // mas esta é a original do seu código. Valor entre 0 e 255.
            let grayScale = (r + g + b) / 3;

            // Mapeia a intensidade de cinza para um índice na paleta
            // (grayScale / 255) resulta em um valor entre 0 e 1
            // Multiplica pelo último índice possível (paletteLength - 1)
            // Arredonda para obter o índice inteiro
            let index = Math.round((grayScale / 255) * (paletteLength - 1));

            // Garante que o índice esteja dentro dos limites da paleta
            index = Math.max(0, Math.min(paletteLength - 1, index));

            // Adiciona o caractere correspondente da paleta à string de saída
            textOut += palette[index];
        }
        textOut += "\n"; // Adiciona uma quebra de linha no final de cada linha do canvas
    }

    // Envolve o resultado em tags <pre> para preservar a formatação (espaços e quebras de linha)
    return "<pre>" + textOut + "</pre>";
}