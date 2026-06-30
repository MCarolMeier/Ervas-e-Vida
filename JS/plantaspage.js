/* ==============================================
   MARCELA MEDICINAL — plantaspage.js
   Responsabilidades:
   1. Tabs das receitas medicinais
   2. Scroll-reveal de elementos
   3. Header que muda ao rolar
   4. Navegação mobile (hambúrguer)
   5. Smooth scroll com offset do header

   O modelo 3D NÃO está mais aqui — ele vive isolado
   em plantas3D.js (carregado como <script type="module">
   separadamente no HTML). Misturar os dois no mesmo
   arquivo causava erro de "import fora de um module"
   e travava a execução de tudo que vem depois.
================================================ */

'use strict';


/* -----------------------------------------------
   1. TABS DE RECEITAS
   Controla qual painel de receita está visível
----------------------------------------------- */
(function initTabs() {

  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.receita-panel');

  if (!tabBtns.length) return;

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Remove estado ativo de todos os botões
      tabBtns.forEach((b) => {
        b.classList.remove('tab-btn--active');
        b.setAttribute('aria-selected', 'false');
      });

      // Oculta todos os painéis
      tabPanels.forEach((p) => {
        p.classList.add('receita-panel--hidden');
      });

      // Ativa o botão clicado
      btn.classList.add('tab-btn--active');
      btn.setAttribute('aria-selected', 'true');

      // Exibe o painel correspondente
      const targetId = btn.getAttribute('aria-controls');
      const target   = document.getElementById(targetId);
      if (target) {
        target.classList.remove('receita-panel--hidden');

        // Rola suavemente para o painel em mobile
        if (window.innerWidth <= 600) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });

    // Navegação por teclado (← → entre tabs)
    btn.addEventListener('keydown', (e) => {
      const btns = Array.from(tabBtns);
      const idx  = btns.indexOf(btn);
      if (e.key === 'ArrowRight') {
        btns[(idx + 1) % btns.length].focus();
      } else if (e.key === 'ArrowLeft') {
        btns[(idx - 1 + btns.length) % btns.length].focus();
      }
    });
  });

})();


/* -----------------------------------------------
   2. SCROLL-REVEAL
   Anima elementos ao entrarem na viewport
----------------------------------------------- */
(function initScrollReveal() {

  // Adiciona classe .reveal a todos os elementos-alvo
  const targets = [
    '.card',
    '.cultivo-item',
    '.beneficio-card',
    '.prec-card',
    '.section-header',
    '.partes-usadas',
    '.compostos',
    '.aviso-banner',
  ];

  targets.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      // Escalonamento por índice (máximo 5 delays)
      const delay = Math.min(i % 6, 5);
      if (delay > 0) el.classList.add(`reveal-delay-${delay}`);
    });
  });

  // IntersectionObserver — ativa .visible quando entra na tela
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // anima apenas 1x
        }
      });
    },
    {
      threshold: 0.12,     // 12% do elemento visível dispara
      rootMargin: '0px 0px -40px 0px',
    }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

})();


/* -----------------------------------------------
   3. HEADER — sombra ao rolar
----------------------------------------------- */
(function initHeader() {

  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // checa posição inicial

})();


/* -----------------------------------------------
   4. NAVEGAÇÃO MOBILE — hambúrguer
----------------------------------------------- */
(function initMobileNav() {

  const toggle  = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  if (!toggle || !navList) return;

  // Abre/fecha o menu
  toggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('nav-open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Fecha ao clicar em qualquer link de nav
  navList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navList.classList.remove('nav-open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Fecha ao clicar fora do menu
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !navList.contains(e.target)) {
      navList.classList.remove('nav-open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

})();


/* -----------------------------------------------
   5. SMOOTH SCROLL — âncoras com offset do header
   Compensa a altura do header fixo
----------------------------------------------- */
(function initSmoothScroll() {

  const header = document.querySelector('.site-header');

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      const target   = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const headerH = header ? header.offsetHeight : 0;
      const top     = target.getBoundingClientRect().top
                      + window.scrollY
                      - headerH
                      - 16; // margem extra

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();