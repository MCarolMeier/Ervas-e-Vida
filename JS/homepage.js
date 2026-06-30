/**
 * script.js — Ervas & Vida: Plantas Medicinais
 *
 * Organização:
 *   1. Banco de dados local das plantas (array de objetos)
 *   2. Gradientes de fundo para cards sem foto
 *   3. Função de renderização dos cards no DOM
 *   4. Lógica de filtro por categoria e busca por texto
 *   5. Lógica do carrossel (navegação, auto-play, touch, teclado)
 *   6. Inicialização geral da página
 */
'use strict'; // Modo estrito: previne erros silenciosos
/* ================================================================
   3. RENDERIZAÇÃO DOS CARDS
      Gera o HTML de cada card dinamicamente e insere no DOM.
      Recebe um array filtrado de plantas e re-renderiza o grid.
================================================================ */
/**
 * Renderiza a lista de plantas no grid.
 * @param {Array} list - Array de objetos de plantas a exibir
 */
function renderCards(list) {
  const grid      = document.getElementById('plants-grid');
  const noResults = document.getElementById('no-results');
  const status    = document.getElementById('search-status');
  // Limpa o grid antes de re-renderizar
  grid.innerHTML = '';
  // Se não há resultados, exibe mensagem e atualiza aria-live
  if (list.length === 0) {
    noResults.classList.add('visible');
    status.textContent = 'Nenhuma planta encontrada.';
    return;
  }
  // Oculta mensagem de "sem resultados"
  noResults.classList.remove('visible');
  // Anuncia quantidade de resultados para leitores de tela
  const s = list.length !== 1;
  status.textContent = `${list.length} planta${s ? 's' : ''} encontrada${s ? 's' : ''}.`;
  // Itera sobre cada planta e cria seu card
  list.forEach((planta, index) => {
    // Seleciona gradiente com base no índice (rotativo)
    const gradienteBackground = GRADIENTS[index % GRADIENTS.length];
    // Cria o elemento article (semântico para conteúdo independente)
    const card = document.createElement('article');
    card.className = 'plant-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');   // Focável via teclado
    card.setAttribute('aria-label', `${planta.name} – ${planta.sci}`);
    // Atributos de dados para filtragem via CSS/JS
    card.setAttribute('data-tags', planta.tags.join(' '));
    card.setAttribute('data-searchable', (
      planta.name.toLowerCase() + ' ' +
      planta.sci.toLowerCase()  + ' ' +
      planta.desc.toLowerCase()
    ));
    // Gera string de estrelas para avaliação
    const qtdEstrelas   = Math.round(planta.rating);
    const estrelasCheia = '★'.repeat(qtdEstrelas);
    const estrelasVazia = '☆'.repeat(5 - qtdEstrelas);
    const estrelasStr   = estrelasCheia + estrelasVazia;
    // Gera HTML das tags de uso
    const tagsHtml = planta.tags
      .map(tag => `<span class="card-tag">${tag}</span>`)
      .join('');
    // HTML do card: imagem (ou placeholder) + corpo + rodapé
    card.innerHTML = `
      <div class="card-image-wrap">
        ${planta.img
          // Caso tenha foto: usa <img> com lazy loading e texto alternativo
          ? `<img
               src="${planta.img}"
               alt="${planta.imgAlt}"
               loading="lazy"
               width="400"
               height="300"
             />`
          // Caso não tenha foto: div com gradiente e emoji como identificador visual
          : `<div
               class="card-placeholder"
               style="background: ${gradienteBackground}"
               role="img"
               aria-label="${planta.imgAlt}"
             >
               <span aria-hidden="true">${planta.emoji}</span>
             </div>`
        }
        <!-- Badge de categoria -->
        <span class="card-badge ${planta.badgeType}" aria-label="Categoria: ${planta.badge}">
          ${planta.badge}
        </span>
        <!-- Botão de favoritar -->
        <button
          class="card-fav"
          type="button"
          aria-pressed="false"
          aria-label="Adicionar ${planta.name} aos favoritos"
        >♡</button>
      </div>
      <!-- Corpo do card -->
      <div class="card-body">
        <h2 class="card-name">${planta.name}</h2>
        <p class="card-sci">${planta.sci}</p>
        <p class="card-desc">${planta.desc}</p>
        <div class="card-tags" aria-label="Usos: ${planta.tags.join(', ')}">
          ${tagsHtml}
        </div>
      </div>
      <!-- Rodapé do card: avaliação -->
      <div class="card-footer">
        <span class="card-rating" aria-label="Avaliação: ${planta.rating} de 5 estrelas">
          <span aria-hidden="true">${estrelasStr}</span>
          ${planta.rating}
          <small>(${planta.reviews})</small>
        </span>
        <span class="card-more" aria-hidden="true">Ver mais →</span>
      </div>
    `;
    // ---- Interatividade: botão de favoritar ----
    const btnFavoritar = card.querySelector('.card-fav');
    btnFavoritar.addEventListener('click', (evento) => {
      // Impede que o clique propague para o card pai
      evento.stopPropagation();
      // Alterna o estado do favorito
      const estaFavoritado = btnFavoritar.getAttribute('aria-pressed') === 'true';
      const novoEstado     = !estaFavoritado;
      btnFavoritar.setAttribute('aria-pressed', String(novoEstado));
      btnFavoritar.textContent = novoEstado ? '♥' : '♡';    // Coração cheio / vazio
      // Atualiza o aria-label com o novo estado
      btnFavoritar.setAttribute(
        'aria-label',
        `${novoEstado ? 'Remover' : 'Adicionar'} ${planta.name} ${novoEstado ? 'dos' : 'aos'} favoritos`
      );
    });
    // ---- Acessibilidade: ativar card com Enter ou Espaço ----
    card.addEventListener('keydown', (evento) => {
      if (evento.key === 'Enter' || evento.key === ' ') {
        evento.preventDefault();
        card.click();
      }
    });
    // Adiciona o card ao grid
    grid.appendChild(card);
  });
}
/* ================================================================
   4. FILTROS E BUSCA
      Combina o filtro de categoria (chip ativo) com o texto
      digitado na barra de pesquisa para filtrar os cards.
================================================================ */
/** Estado global dos filtros */
let filtroAtivo    = 'all';  // Categoria selecionada ('all' = todas)
let termoBusca     = '';     // Texto digitado na pesquisa
/**
 * Aplica os filtros ativos (categoria + texto) e re-renderiza os cards.
 */
function aplicarFiltros() {
  const listaFiltrada = PLANTS.filter((planta) => {
    // --- Filtro por categoria ---
    // 'all' passa tudo; caso contrário, verifica se a tag está no array
    const passaCategoria = filtroAtivo === 'all' || planta.tags.includes(filtroAtivo);
    // --- Filtro por texto ---
    const query = termoBusca.trim().toLowerCase();
    const textoIndexado = (
      planta.name.toLowerCase() + ' ' +
      planta.sci.toLowerCase()  + ' ' +
      planta.desc.toLowerCase()
    );
    const passaBusca = !query || textoIndexado.includes(query);
    // A planta passa apenas se atender AMBOS os critérios
    return passaCategoria && passaBusca;
  });
  renderCards(listaFiltrada);
}
// ---- Chips de filtro de categoria ----
document.querySelectorAll('.filter-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    // Remove estado ativo de todos os chips
    document.querySelectorAll('.filter-chip').forEach((c) => {
      c.setAttribute('aria-pressed', 'false');
    });
    // Ativa o chip clicado
    chip.setAttribute('aria-pressed', 'true');
    // Atualiza o filtro global e re-renderiza
    filtroAtivo = chip.dataset.filter;
    aplicarFiltros();
  });
});
// ---- Barra de pesquisa ----
const inputBusca = document.getElementById('search-input');
let timerBusca;  // Variável para o debounce
// Debounce: aguarda 280ms sem digitação antes de filtrar
// (evita filtrar a cada tecla pressionada, melhorando performance)
inputBusca.addEventListener('input', () => {
  clearTimeout(timerBusca);
  timerBusca = setTimeout(() => {
    termoBusca = inputBusca.value;
    aplicarFiltros();
  }, 280);
});
// Filtra imediatamente ao pressionar Enter
inputBusca.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') {
    clearTimeout(timerBusca);
    termoBusca = inputBusca.value;
    aplicarFiltros();
  }
});
// Botão "Buscar" executa filtro imediatamente
document.getElementById('search-btn').addEventListener('click', () => {
  clearTimeout(timerBusca);
  termoBusca = inputBusca.value;
  aplicarFiltros();
});
/* ================================================================
   5. CARROSSEL — Banner deslizante com auto-play
      Funcionalidades:
        - Navegação por botões anterior/próximo
        - Navegação por dots clicáveis
        - Auto-play a cada 5 segundos
        - Pausa ao hover e ao focar (acessibilidade)
        - Navegação por teclado (setas ← →)
        - Swipe em dispositivos touch
        - Atualização de atributos ARIA para leitores de tela
================================================================ */
// Referências aos elementos do DOM
const trackCarrossel   = document.getElementById('carousel-track');
const dotsCarrossel    = document.querySelectorAll('.carousel-dot');
const btnAnterior      = document.getElementById('carousel-prev');
const btnProximo       = document.getElementById('carousel-next');
const elementoCarrossel = document.getElementById('carousel');
const TOTAL_SLIDES = 3;        // Número fixo de slides
let slideAtual     = 0;        // Índice do slide visível
let timerAutoPlay;             // Referência ao setInterval do auto-play
/**
 * Navega para um slide específico.
 * @param {number} indice     - Índice do slide destino
 * @param {boolean} focarDot  - Se true, foca no dot correspondente (uso pelo teclado)
 */
function irParaSlide(indice, focarDot = false) {
  // Garante que o índice seja circular (loop infinito)
  slideAtual = ((indice % TOTAL_SLIDES) + TOTAL_SLIDES) % TOTAL_SLIDES;
  // Move o track via CSS transform (mais performático que left/top)
  trackCarrossel.style.transform = `translateX(-${slideAtual * 100}%)`;
  // Atualiza os dots: visual + acessibilidade
  dotsCarrossel.forEach((dot, i) => {
    const ativo = i === slideAtual;
    dot.classList.toggle('active', ativo);
    dot.setAttribute('aria-selected', String(ativo));
  });
  // Atualiza aria-hidden dos slides para leitores de tela
  // (oculta slides não visíveis para evitar leitura desnecessária)
  trackCarrossel.querySelectorAll('.carousel-slide').forEach((slide, i) => {
    slide.setAttribute('aria-hidden', String(i !== slideAtual));
  });
  // Foca no dot quando navega por teclado
  if (focarDot && dotsCarrossel[slideAtual]) {
    dotsCarrossel[slideAtual].focus();
  }
  // Reinicia o timer do auto-play após navegação manual
  reiniciarAutoPlay();
}
// ---- Botões anterior e próximo ----
btnAnterior.addEventListener('click', () => irParaSlide(slideAtual - 1));
btnProximo.addEventListener('click',  () => irParaSlide(slideAtual + 1));
// ---- Dots de navegação ----
dotsCarrossel.forEach((dot) => {
  dot.addEventListener('click', () => {
    irParaSlide(Number(dot.dataset.slide));
  });
});
// ---- Navegação por teclado no carrossel ----
elementoCarrossel.addEventListener('keydown', (evento) => {
  if (evento.key === 'ArrowLeft') {
    evento.preventDefault();  // Impede scroll horizontal da página
    irParaSlide(slideAtual - 1, true);
  }
  if (evento.key === 'ArrowRight') {
    evento.preventDefault();
    irParaSlide(slideAtual + 1, true);
  }
});
// ---- Auto-play: avança slide a cada 5 segundos ----
function iniciarAutoPlay() {
  timerAutoPlay = setInterval(() => {
    irParaSlide(slideAtual + 1);
  }, 5000);
}
function pararAutoPlay() {
  clearInterval(timerAutoPlay);
}
function reiniciarAutoPlay() {
  pararAutoPlay();
  iniciarAutoPlay();
}
// Pausa auto-play quando usuário interage com o carrossel
// (evita troca de slide enquanto o usuário está lendo/navegando)
elementoCarrossel.addEventListener('mouseenter', pararAutoPlay);
elementoCarrossel.addEventListener('mouseleave', iniciarAutoPlay);
elementoCarrossel.addEventListener('focusin',    pararAutoPlay);   // Foco por teclado
elementoCarrossel.addEventListener('focusout',   iniciarAutoPlay); // Perde foco
// ---- Suporte a gestos de toque (swipe) ----
let posicaoInicialTouch = 0;  // Coordenada X do toque inicial
elementoCarrossel.addEventListener('touchstart', (evento) => {
  // Armazena posição do primeiro toque
  posicaoInicialTouch = evento.touches[0].clientX;
}, { passive: true }); // passive: true melhora performance do scroll
elementoCarrossel.addEventListener('touchend', (evento) => {
  const posicaoFinalTouch  = evento.changedTouches[0].clientX;
  const distanciaSwipe     = posicaoInicialTouch - posicaoFinalTouch;
  const LIMIAR_SWIPE        = 40; // Mínimo de pixels para considerar um swipe
  if (Math.abs(distanciaSwipe) > LIMIAR_SWIPE) {
    // Swipe para esquerda: avança; para direita: volta
    irParaSlide(distanciaSwipe > 0 ? slideAtual + 1 : slideAtual - 1);
  }
});
/* ================================================================
   6. INICIALIZAÇÃO — Executa ao carregar o script
      1. Oculta slides não-ativos para leitores de tela
      2. Inicia o auto-play do carrossel
      3. Renderiza todos os cards no grid
================================================================ */
(function inicializar() {
  // Marca todos os slides não ativos como ocultos para leitores de tela
  trackCarrossel.querySelectorAll('.carousel-slide').forEach((slide, i) => {
    if (i !== 0) {
      slide.setAttribute('aria-hidden', 'true');
    }
  });
  // Inicia o auto-play do carrossel
  iniciarAutoPlay();
  // Renderiza todos os cards (sem filtro aplicado)
  renderCards(PLANTS);
})();
