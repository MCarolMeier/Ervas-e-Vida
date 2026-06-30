/**
 * ESCANEAR PLANTA — Jardim das Plantas
 * scanner.js
 *
 * Funcionalidades:
 *  1. Alternância entre abas Câmera / Galeria
 *  2. Câmera ao vivo via getUserMedia (funciona em desktop e mobile)
 *     - Detecta e permite alternar câmera frontal/traseira em celulares
 *     - Fallback automático para <input capture="environment"> quando
 *       getUserMedia não está disponível (navegadores mais antigos)
 *  3. Upload de imagem por clique, arraste-e-solte (drag & drop) ou
 *     seleção de galeria
 *  4. Captura do frame de vídeo via canvas → Blob/base64
 *  5. Envio da imagem para análise (mock — pronta para plugar numa API real)
 *  6. Exibição do resultado da identificação
 */

/* ══════════════════════════════════════════════
   ESTADO GLOBAL DO MÓDULO
   ══════════════════════════════════════════════ */
const ScannerState = {
  mode: 'camera',        // 'camera' | 'upload'
  stream: null,           // MediaStream ativo da câmera
  facingMode: 'environment', // câmera traseira por padrão em celulares
  capturedImage: null,    // dataURL da imagem capturada/selecionada
};

/* ══════════════════════════════════════════════
   ELEMENTOS DOM
   ══════════════════════════════════════════════ */
const el = {
  tabCamera:        document.getElementById('tabCamera'),
  tabUpload:        document.getElementById('tabUpload'),
  panelCamera:      document.getElementById('panelCamera'),
  panelUpload:      document.getElementById('panelUpload'),

  cameraFrame:       document.getElementById('cameraFrame'),
  cameraVideo:       document.getElementById('cameraVideo'),
  cameraCanvas:      document.getElementById('cameraCanvas'),
  cameraPlaceholder: document.getElementById('cameraPlaceholder'),
  cameraGuide:       document.querySelector('.camera-frame__guide'),
  cameraError:       document.getElementById('cameraError'),
  cameraErrorText:   document.getElementById('cameraErrorText'),

  shutterBtn:        document.getElementById('shutterBtn'),
  switchCameraBtn:    document.getElementById('switchCameraBtn'),
  nativeCameraInput: document.getElementById('nativeCameraInput'),

  dropzone:          document.getElementById('dropzone'),
  galleryInput:      document.getElementById('galleryInput'),
  previewWrap:       document.getElementById('previewWrap'),
  previewImg:        document.getElementById('previewImg'),
  previewRemove:     document.getElementById('previewRemove'),
  analyzeBtn:        document.getElementById('analyzeBtn'),

  analyzingState:    document.getElementById('analyzingState'),
  resultCard:        document.getElementById('resultCard'),
  resultThumb:       document.getElementById('resultThumb'),
  tryAgainBtn:       document.getElementById('tryAgainBtn'),
};

/* ══════════════════════════════════════════════
   1. ALTERNÂNCIA DE ABAS (Câmera / Galeria)
   ══════════════════════════════════════════════ */
function switchTab(mode) {
  ScannerState.mode = mode;
  const isCamera = mode === 'camera';

  el.tabCamera.classList.toggle('is-active', isCamera);
  el.tabUpload.classList.toggle('is-active', !isCamera);
  el.tabCamera.setAttribute('aria-selected', String(isCamera));
  el.tabUpload.setAttribute('aria-selected', String(!isCamera));

  el.panelCamera.classList.toggle('is-active', isCamera);
  el.panelUpload.classList.toggle('is-active', !isCamera);
  el.panelCamera.hidden = !isCamera;
  el.panelUpload.hidden = isCamera;

  // Para a câmera ao sair da aba, economizando bateria/recursos
  if (!isCamera) {
    stopCamera();
  }

  hideResult();
}

el.tabCamera.addEventListener('click', () => switchTab('camera'));
el.tabUpload.addEventListener('click', () => switchTab('upload'));


/* ══════════════════════════════════════════════
   2. CÂMERA AO VIVO (getUserMedia)
   Funciona em navegadores desktop e mobile (Chrome,
   Safari, Firefox, Edge) desde que em HTTPS ou localhost.
   ══════════════════════════════════════════════ */

/**
 * Verifica se o navegador suporta a API de câmera
 */
function isCameraSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Inicia a câmera com a facingMode atual (frontal/traseira)
 */
async function startCamera() {
  // Se o navegador não suporta getUserMedia, usa o input nativo como fallback
  if (!isCameraSupported()) {
    showCameraError('Câmera não suportada neste navegador. Use o botão de captura abaixo.');
    el.nativeCameraInput.parentElement.hidden = false;
    return;
  }

  try {
    // Solicita acesso à câmera — em celulares, "environment" abre a traseira
    const constraints = {
      video: {
        facingMode: ScannerState.facingMode,
        width:  { ideal: 1280 },
        height: { ideal: 1280 },
      },
      audio: false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    ScannerState.stream = stream;

    el.cameraVideo.srcObject = stream;
    el.cameraVideo.style.display = 'block';
    el.cameraPlaceholder.style.display = 'none';
    el.cameraGuide.style.display = 'block';
    el.cameraError.hidden = true;

    // Mostra o botão de alternar câmera apenas se houver múltiplas câmeras disponíveis
    checkMultipleCameras();

  } catch (err) {
    // Trata erros comuns: permissão negada, câmera ocupada, etc.
    let message = 'Não foi possível acessar a câmera.';
    if (err.name === 'NotAllowedError') {
      message = 'Permissão de câmera negada. Habilite o acesso nas configurações do navegador.';
    } else if (err.name === 'NotFoundError') {
      message = 'Nenhuma câmera foi encontrada neste dispositivo.';
    } else if (err.name === 'NotReadableError') {
      message = 'A câmera está sendo usada por outro aplicativo.';
    }
    showCameraError(message);

    // Mostra o fallback nativo como alternativa
    el.nativeCameraInput.parentElement.hidden = false;
  }
}

/**
 * Para a câmera e libera os recursos (importante para bateria/privacidade)
 */
function stopCamera() {
  if (ScannerState.stream) {
    ScannerState.stream.getTracks().forEach((track) => track.stop());
    ScannerState.stream = null;
  }
  el.cameraVideo.style.display = 'none';
  el.cameraVideo.srcObject = null;
  el.cameraGuide.style.display = 'none';
  el.cameraPlaceholder.style.display = 'flex';
}

function showCameraError(message) {
  el.cameraError.hidden = false;
  el.cameraErrorText.textContent = message;
  el.cameraPlaceholder.style.display = 'none';
}

/**
 * Verifica quantas câmeras existem no dispositivo e exibe
 * o botão de alternância (frontal/traseira) se houver mais de uma
 */
async function checkMultipleCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((d) => d.kind === 'videoinput');
    el.switchCameraBtn.hidden = cameras.length < 2;
  } catch {
    el.switchCameraBtn.hidden = true;
  }
}

/**
 * Alterna entre câmera frontal e traseira
 */
el.switchCameraBtn.addEventListener('click', async () => {
  stopCamera();
  ScannerState.facingMode = ScannerState.facingMode === 'environment' ? 'user' : 'environment';
  await startCamera();
});

/**
 * Ativa a câmera ao tocar/clicar na área de preview (apenas se ainda não ativa)
 */
el.cameraFrame.addEventListener('click', () => {
  if (!ScannerState.stream && el.cameraVideo.style.display !== 'block') {
    startCamera();
  }
});

/**
 * Botão de disparo — captura o frame atual do vídeo
 */
el.shutterBtn.addEventListener('click', () => {
  if (!ScannerState.stream) {
    // Se a câmera ainda não foi ativada, ativa primeiro
    startCamera();
    return;
  }
  capturePhotoFromVideo();
});

/**
 * Desenha o frame atual do <video> em um <canvas> oculto
 * e converte para dataURL — é assim que "tiramos a foto"
 */
function capturePhotoFromVideo() {
  const video = el.cameraVideo;
  const canvas = el.cameraCanvas;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  ScannerState.capturedImage = dataUrl;

  // Para a câmera após capturar, e envia para análise
  stopCamera();
  analyzeImage(dataUrl);
}

/**
 * Fallback nativo: quando o navegador não suporta getUserMedia
 * (ou o usuário prefere), este input abre a câmera do sistema
 * operacional diretamente (comportamento padrão em iOS/Android)
 */
el.nativeCameraInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  readFileAsDataUrl(file).then((dataUrl) => {
    ScannerState.capturedImage = dataUrl;
    analyzeImage(dataUrl);
  });
});

/**
 * Libera a câmera quando o usuário sai/troca de aba do navegador
 * (boas práticas de privacidade e economia de bateria)
 */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopCamera();
});


/* ══════════════════════════════════════════════
   3. UPLOAD DE IMAGEM (clique, galeria, drag & drop)
   Funciona igualmente em desktop (arrastar arquivo)
   e mobile (toque para abrir a galeria de fotos)
   ══════════════════════════════════════════════ */

// Abre o seletor de arquivos ao clicar/tocar na dropzone
el.dropzone.addEventListener('click', () => el.galleryInput.click());
el.dropzone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    el.galleryInput.click();
  }
});

// Seleção via input de arquivo (galeria do celular ou explorador no desktop)
el.galleryInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleSelectedFile(file);
});

/**
 * Suporte a arrastar-e-soltar — apenas relevante em desktop,
 * mas não interfere no comportamento mobile
 */
['dragenter', 'dragover'].forEach((eventName) => {
  el.dropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    el.dropzone.classList.add('is-dragover');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  el.dropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    el.dropzone.classList.remove('is-dragover');
  });
});

el.dropzone.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files[0];
  if (file) handleSelectedFile(file);
});

/**
 * Valida e processa o arquivo selecionado (de qualquer origem)
 */
function handleSelectedFile(file) {
  // Validação de tipo
  if (!file.type.startsWith('image/')) {
    alert('Por favor, selecione um arquivo de imagem (JPG, PNG ou WEBP).');
    return;
  }
  // Validação de tamanho (10MB)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    alert('A imagem deve ter no máximo 10MB.');
    return;
  }

  readFileAsDataUrl(file).then((dataUrl) => {
    ScannerState.capturedImage = dataUrl;
    showPreview(dataUrl);
  });
}

/**
 * Converte um File em dataURL (base64) usando FileReader —
 * funciona de forma idêntica em qualquer navegador/dispositivo
 */
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Exibe a pré-visualização da imagem escolhida antes de analisar
 */
function showPreview(dataUrl) {
  el.previewImg.src = dataUrl;
  el.previewWrap.hidden = false;
  el.analyzeBtn.hidden = false;
  el.dropzone.hidden = true;
}

el.previewRemove.addEventListener('click', () => {
  ScannerState.capturedImage = null;
  el.previewWrap.hidden = true;
  el.analyzeBtn.hidden = true;
  el.dropzone.hidden = false;
  el.galleryInput.value = '';
});

el.analyzeBtn.addEventListener('click', () => {
  if (ScannerState.capturedImage) {
    analyzeImage(ScannerState.capturedImage);
  }
});


/* ══════════════════════════════════════════════
   4. ANÁLISE DA IMAGEM
   Aqui é onde a imagem capturada/enviada é processada.
   Atualmente simulado — substitua a função `mockIdentify`
   por uma chamada real à sua API de identificação de plantas.
   ══════════════════════════════════════════════ */

function analyzeImage(dataUrl) {
  // Esconde painéis e mostra o estado de carregamento
  el.panelCamera.hidden = true;
  el.panelUpload.hidden = true;
  hideResult();
  el.analyzingState.hidden = false;

  // Chamada real ficaria assim (exemplo comentado):
  //
  // const blob = await (await fetch(dataUrl)).blob();
  // const formData = new FormData();
  // formData.append('image', blob, 'planta.jpg');
  //
  // const response = await fetch('https://sua-api.com/identificar', {
  //   method: 'POST',
  //   body: formData,
  // });
  // const result = await response.json();

  mockIdentify(dataUrl).then((result) => {
    el.analyzingState.hidden = true;
    showResult(dataUrl, result);
  });
}

/**
 * Simulação de identificação — troque por uma API real
 * de reconhecimento de plantas (ex.: PlantNet, Plant.id, ou
 * um modelo próprio treinado para a flora do RS)
 */
function mockIdentify(dataUrl) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        nomePopular: 'Marcela',
        nomeCientifico: 'Achyrocline satureioides',
        confianca: 92,
        descricao: 'Espécie nativa do Rio Grande do Sul, tradicionalmente usada em chás digestivos e calmantes.',
      });
    }, 1800); // simula o tempo de processamento de uma API real
  });
}

function showResult(imageDataUrl, result) {
  el.resultThumb.src = imageDataUrl;
  el.resultCard.querySelector('#result-title').textContent = result.nomePopular;
  el.resultCard.querySelector('.result-card__sci').textContent = result.nomeCientifico;
  document.getElementById('resultConfidence').textContent = `${result.confianca}% de confiança`;
  document.getElementById('resultDesc').textContent = result.descricao;
  el.resultCard.hidden = false;
  el.resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideResult() {
  el.resultCard.hidden = true;
}

/**
 * Botão "Tentar outra foto" — reinicia o fluxo do zero
 */
el.tryAgainBtn.addEventListener('click', () => {
  hideResult();
  ScannerState.capturedImage = null;

  // Restaura painel de upload
  el.previewWrap.hidden = true;
  el.analyzeBtn.hidden = true;
  el.dropzone.hidden = false;
  el.galleryInput.value = '';

  // Restaura visibilidade dos painéis conforme a aba ativa
  el.panelCamera.hidden = ScannerState.mode !== 'camera';
  el.panelUpload.hidden = ScannerState.mode !== 'upload';
});
