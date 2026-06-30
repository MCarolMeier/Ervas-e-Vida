/* ==============================================
   MARCELA MEDICINAL — plantas3D.js
   Responsabilidade única: renderizar o modelo 3D
   da planta (.glb) no hero da página.

   Carregado no HTML como:
   <script type="module" src="JS/plantas3D.js"></script>

   Por ser "module", pode usar import/export normalmente
   — não precisa (e não deve) carregar o Three.js via
   <script> separado no HTML. Tudo vem daqui.
================================================ */

import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

/* -----------------------------------------------
   CONFIGURAÇÃO
   Ajuste apenas estes valores ao trocar o modelo
----------------------------------------------- */
const MODEL_PATH = "/JS/banana_plant.glb"; // caminho do seu .glb
const CONTAINER_ID = "container3D";                 // precisa bater com o id no HTML
const AUTO_ROTATE_SPEED = 0.6;                       // velocidade da rotação automática
const CAMERA_DISTANCE = 4;                           // distância inicial da câmera (ajuste conforme a escala do seu modelo)

/* -----------------------------------------------
   ELEMENTO CONTAINER
   Se não existir, aborta com aviso claro no console
   em vez de quebrar silenciosamente
----------------------------------------------- */
const container = document.getElementById(CONTAINER_ID);

if (!container) {
  console.error(
    `[plantas3D] Elemento #${CONTAINER_ID} não encontrado no HTML. ` +
    `Verifique se existe <div id="${CONTAINER_ID}"></div> na página.`
  );
} else {
  init();
}

function init() {

  /* -----------------------------------------------
     CENA, CÂMERA E RENDERIZADOR
  ----------------------------------------------- */
  const scene = new THREE.Scene();

  // Usa o tamanho do CONTAINER (não da janela inteira) —
  // assim o modelo respeita o espaço reservado no layout
  const width = container.clientWidth;
  const height = container.clientHeight;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 1, CAMERA_DISTANCE);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // nitidez em telas retina sem pesar demais
  container.appendChild(renderer.domElement);

  /* -----------------------------------------------
     LUZES
     Sem luz, o modelo aparece preto/invisível mesmo
     carregando corretamente
  ----------------------------------------------- */
  const topLight = new THREE.DirectionalLight(0xffffff, 1.2);
  topLight.position.set(5, 8, 5);
  scene.add(topLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  /* -----------------------------------------------
     CONTROLES DE ÓRBITA
     Usuário pode arrastar para girar; a rotação automática
     pausa durante a interação e retoma depois
  ----------------------------------------------- */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;       // suaviza o movimento
  controls.dampingFactor = 0.08;
  controls.enableZoom = true;
  controls.enablePan = false;          // evita que o usuário "perca" o modelo de vista
  controls.minDistance = CAMERA_DISTANCE * 0.5;
  controls.maxDistance = CAMERA_DISTANCE * 2.5;

  let isUserInteracting = false;
  controls.addEventListener("start", () => { isUserInteracting = true; });
  controls.addEventListener("end", () => { isUserInteracting = false; });

  /* -----------------------------------------------
     CARREGAMENTO DO MODELO .GLB
  ----------------------------------------------- */
  let model = null;
  const loader = new GLTFLoader();

  // Mostra um estado de carregamento simples enquanto o modelo não chega
  container.classList.add("is-loading");

  loader.load(
    MODEL_PATH,

    // sucesso
    function (gltf) {
      model = gltf.scene;

      // Centraliza o modelo e ajusta escala automaticamente,
      // independente do tamanho original do .glb exportado
      centerAndScaleModel(model, scene);

      scene.add(model);
      container.classList.remove("is-loading");
    },

    // progresso
    function (xhr) {
      if (xhr.total) {
        const percent = Math.round((xhr.loaded / xhr.total) * 100);
        console.log(`[plantas3D] Carregando modelo: ${percent}%`);
      }
    },

    // erro — mensagem clara em vez de falha silenciosa
    function (error) {
      console.error(
        `[plantas3D] Falha ao carregar o modelo em "${MODEL_PATH}". ` +
        `Verifique se o arquivo existe nesse caminho relativo ao HTML.`,
        error
      );
      container.classList.remove("is-loading");
      container.classList.add("has-error");
    }
  );

  /**
   * Centraliza o modelo na origem da cena e normaliza sua escala
   * para caber bem na câmera, independentemente de como o .glb
   * foi exportado (tamanhos variam muito entre ferramentas de modelagem)
   */
  function centerAndScaleModel(object, targetScene) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Centraliza
    object.position.x -= center.x;
    object.position.y -= center.y;
    object.position.z -= center.z;

    // Normaliza a escala para a maior dimensão ficar ~2 unidades
    const maxDimension = Math.max(size.x, size.y, size.z);
    if (maxDimension > 0) {
      const scaleFactor = 2 / maxDimension;
      object.scale.setScalar(scaleFactor);
    }
  }

  /* -----------------------------------------------
     LOOP DE RENDERIZAÇÃO
  ----------------------------------------------- */
  function animate() {
    requestAnimationFrame(animate);

    // Rotação automática apenas quando o usuário não está interagindo
    if (model && !isUserInteracting) {
      model.rotation.y += AUTO_ROTATE_SPEED * 0.01;
    }

    controls.update(); // necessário por causa do enableDamping
    renderer.render(scene, camera);
  }
  animate();

  /* -----------------------------------------------
     RESPONSIVIDADE
     Reage ao redimensionamento do CONTAINER, não da
     janela — importante porque o container pode mudar
     de tamanho em layouts responsivos sem a janela mudar
  ----------------------------------------------- */
  const resizeObserver = new ResizeObserver(() => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;

    if (newWidth === 0 || newHeight === 0) return; // evita divisão por zero

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
  resizeObserver.observe(container);

  /* -----------------------------------------------
     ECONOMIA DE RECURSOS
     Pausa a animação quando a aba não está visível
  ----------------------------------------------- */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      renderer.setAnimationLoop(null);
    } else {
      renderer.setAnimationLoop(animate);
    }
  });
}