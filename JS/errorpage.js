/* ==============================================
   404.js — Espinhos Procedurais · Canvas 2D
   -----------------------------------------------
   Responsabilidades:
     1. Inicialização do canvas
     2. Gerador pseudoaleatório determinístico (LCG)
     3. Desenho de galhos curvos (Bézier quadrática)
     4. Espinhos afiados ao longo dos galhos
     5. Sub-galhos com seus próprios espinhos
     6. Redesenho responsivo no resize da janela

   Não usa Math.random() — usa um LCG com semente
   fixa para que o padrão seja sempre idêntico,
   independente da resolução ou do refresh.
================================================ */

'use strict';

(function initThorns() {

  /* -----------------------------------------------
     1. REFERÊNCIAS E CONFIGURAÇÃO
  ----------------------------------------------- */

  const canvas = document.getElementById('thorns-canvas');
  if (!canvas) return; /* sai silenciosamente se o canvas não existir */

  const ctx = canvas.getContext('2d');

  /* Cores dos espinhos — bege escuros, extraídas da imagem de referência */
  const GALHO_COR   = 'rgba(180, 158, 110, 0.55)'; /* galho principal */
  const ESPINHO_COR = 'rgba(160, 138, 90, 0.45)';  /* espinhos afiados */


  /* -----------------------------------------------
     2. GERADOR PSEUDOALEATÓRIO DETERMINÍSTICO (LCG)
     Linear Congruential Generator com semente fixa.
     Sempre produz a mesma sequência de "números
     aleatórios", garantindo que o padrão de espinhos
     seja igual em cada renderização ou resize.
  ----------------------------------------------- */
  let seed = 42; /* semente inicial — pode ser qualquer inteiro */

  /**
   * rand() — retorna um número entre 0 (inclusive) e 1 (exclusive).
   * Atualiza a semente a cada chamada (stateful).
   */
  function rand() {
    /* Fórmula LCG clássica: Xₙ₊₁ = (a·Xₙ + c) mod m */
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    /* >>> 0 converte para unsigned 32-bit antes de dividir */
    return (seed >>> 0) / 0xffffffff;
  }


  /* -----------------------------------------------
     3. FUNÇÃO PRINCIPAL: DESENHA TODOS OS GALHOS
     Redimensiona o canvas para preencher a janela,
     reseta a semente para reproduzir o mesmo padrão
     e desenha nGalhos proporcional à área da tela.
  ----------------------------------------------- */

  /**
   * draw() — limpa e redesenha todo o canvas.
   * Chamada na inicialização e a cada resize.
   */
  function draw() {
    /* Ajusta o canvas ao tamanho real da janela */
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, W, H);

    /* Reset da semente — garante o mesmo padrão visual */
    seed = 42;

    /*
      Quantidade de galhos proporcional à área da tela.
      28 000px² por galho é um valor calibrado para densidade
      similar à da imagem de referência em desktop e mobile.
    */
    const nGalhos = Math.round((W * H) / 28000);

    for (let i = 0; i < nGalhos; i++) {
      desenharGalho(W, H);
    }
  }


  /* -----------------------------------------------
     4. DESENHA UM GALHO COM ESPINHOS
     Cada galho é uma curva de Bézier quadrática com
     3–9 espinhos distribuídos ao longo do percurso.
     Os espinhos usam gradiente linear para a ponta
     afiada (espessa na base, transparente na ponta).
  ----------------------------------------------- */

  /**
   * desenharGalho(W, H) — traça um galho completo.
   * @param {number} W — largura do canvas em pixels
   * @param {number} H — altura do canvas em pixels
   */
  function desenharGalho(W, H) {

    /* Ponto de início: posição aleatória em toda a área */
    const startX = rand() * W;
    const startY = rand() * H;

    /* Ângulo aleatório (0 a 360°) — galhos em todas as direções */
    const angulo = rand() * Math.PI * 2;

    /* Comprimento: 120–380px dependendo da resolução */
    const comprimento = 120 + rand() * 260;

    /* Espessura: 1.2–3.4px — galhos mais finos parecem mais distantes */
    const espessura = 1.2 + rand() * 2.2;

    /* Ponto final em linha reta (antes de curvar) */
    const endX = startX + Math.cos(angulo) * comprimento;
    const endY = startY + Math.sin(angulo) * comprimento;

    /*
      Ponto de controle da curva de Bézier quadrática.
      O desvio de ±40px e a rotação de +0.3rad no ângulo
      cria curvas suaves e naturais como galhos reais.
    */
    const cpX = startX
      + Math.cos(angulo + 0.3) * comprimento * 0.5
      + (rand() - 0.5) * 40;
    const cpY = startY
      + Math.sin(angulo + 0.3) * comprimento * 0.5
      + (rand() - 0.5) * 40;

    /* ─── Traça o galho como curva de Bézier quadrática ─── */
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.strokeStyle = GALHO_COR;
    ctx.lineWidth   = espessura;
    ctx.lineCap     = 'round';
    ctx.stroke();

    /* ─── Espinhos ao longo do galho ─── */
    const nEspinhos = Math.floor(3 + rand() * 7); /* 3 a 9 espinhos por galho */

    for (let s = 0; s < nEspinhos; s++) {
      desenharEspinho(s, startX, startY, cpX, cpY, endX, endY, espessura);
    }

    /* ─── Sub-galho com 60% de probabilidade ─── */
    if (rand() > 0.4) {
      desenharSubGalho(startX, startY, cpX, cpY, endX, endY, angulo, espessura);
    }
  }


  /* -----------------------------------------------
     5. DESENHA UM ESPINHO
     Calcula a posição exata na curva de Bézier usando
     a fórmula paramétrica com t ∈ [0,1].
     Usa a tangente da curva para orientar o espinho
     perpendicularmente ao galho, alternando lados.
  ----------------------------------------------- */

  /**
   * desenharEspinho() — desenha um espinho em posição t da curva.
   * @param {number} idx — índice do espinho (determina o lado)
   * @param {number} x0, y0 — ponto inicial da curva
   * @param {number} cx, cy — ponto de controle
   * @param {number} x1, y1 — ponto final da curva
   * @param {number} espessura — espessura do galho pai
   */
  function desenharEspinho(idx, x0, y0, cx, cy, x1, y1, espessura) {

    /*
      Parâmetro t: posição ao longo da curva.
      Evita as extremidades (0.1 a 0.9) para
      não colocar espinhos nas pontas do galho.
    */
    const t = 0.1 + rand() * 0.8;

    /*
      Ponto na curva de Bézier quadrática:
      P(t) = (1-t)²·P0 + 2(1-t)t·Pc + t²·P1
    */
    const px = Math.pow(1 - t, 2) * x0
             + 2 * (1 - t) * t * cx
             + Math.pow(t, 2) * x1;

    const py = Math.pow(1 - t, 2) * y0
             + 2 * (1 - t) * t * cy
             + Math.pow(t, 2) * y1;

    /*
      Tangente na curva (derivada de Bézier quadrática):
      T(t) = 2(1-t)(Pc-P0) + 2t(P1-Pc)
      Usada para orientar o espinho perpendicularmente.
    */
    const tx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx);
    const ty = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy);
    const tangAng = Math.atan2(ty, tx);

    /*
      Alterna espinhos à esquerda (idx par) e direita (ímpar).
      O leve desvio aleatório (±0.2 rad) rompe a simetria
      e imita espinhos reais que nunca são perfeitamente opostos.
    */
    const lado = (idx % 2 === 0) ? 1 : -1;
    const espinhoAng = tangAng + lado * (Math.PI / 2 + (rand() - 0.5) * 0.4);

    /* Comprimento: 10–32px */
    const espinhoLen = 10 + rand() * 22;

    const pontaX = px + Math.cos(espinhoAng) * espinhoLen;
    const pontaY = py + Math.sin(espinhoAng) * espinhoLen;

    /*
      Gradiente linear da base (opaco) à ponta (transparente).
      Cria a ilusão de ponta afiada sem desenhar uma forma real.
    */
    const grad = ctx.createLinearGradient(px, py, pontaX, pontaY);
    grad.addColorStop(0, ESPINHO_COR);
    grad.addColorStop(1, 'rgba(160, 138, 90, 0)');

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(pontaX, pontaY);
    ctx.strokeStyle = grad;
    ctx.lineWidth   = espessura * 0.55; /* mais fino que o galho */
    ctx.lineCap     = 'round';
    ctx.stroke();
  }


  /* -----------------------------------------------
     6. DESENHA UM SUB-GALHO
     Bifurcação menor que nasce em ~30–70% do galho pai.
     Tem seus próprios 2–5 espinhos, criando a densidade
     visual de um arbusto espinhoso como na imagem.
  ----------------------------------------------- */

  /**
   * desenharSubGalho() — traça um ramo secundário.
   * @param {number} x0, y0 — início do galho pai
   * @param {number} cx, cy — ponto de controle do pai
   * @param {number} x1, y1 — fim do galho pai
   * @param {number} anguloPai — ângulo do galho pai
   * @param {number} espessura — espessura do galho pai
   */
  function desenharSubGalho(x0, y0, cx, cy, x1, y1, anguloPai, espessura) {

    /* Ponto de nascimento do sub-galho (30–70% do galho pai) */
    const t2 = 0.3 + rand() * 0.4;

    const bx = Math.pow(1 - t2, 2) * x0 + 2 * (1 - t2) * t2 * cx + Math.pow(t2, 2) * x1;
    const by = Math.pow(1 - t2, 2) * y0 + 2 * (1 - t2) * t2 * cy + Math.pow(t2, 2) * y1;

    /* Ângulo diverge levemente do pai (±0.6 rad = ±34°) */
    const subAng = anguloPai + (rand() - 0.5) * 1.2;

    /* Comprimento: 50–150px — menor que o galho pai */
    const subLen = 50 + rand() * 100;

    const subEx = bx + Math.cos(subAng) * subLen;
    const subEy = by + Math.sin(subAng) * subLen;

    /* Traça o sub-galho como linha reta (sem curva) */
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(subEx, subEy);
    ctx.strokeStyle = GALHO_COR;
    ctx.lineWidth   = espessura * 0.6; /* mais fino que o pai */
    ctx.lineCap     = 'round';
    ctx.stroke();

    /* Espinhos do sub-galho (2–5 espinhos) */
    const nSubEsp = Math.floor(2 + rand() * 4);

    for (let k = 0; k < nSubEsp; k++) {

      /* Posição linear ao longo do sub-galho (sem Bézier) */
      const st = 0.15 + rand() * 0.7;
      const spx = bx + (subEx - bx) * st;
      const spy = by + (subEy - by) * st;

      /* Comprimento menor: 7–21px */
      const sLen = 7 + rand() * 14;

      /* Alterna lados + pequena variação angular */
      const sAng = subAng
        + (k % 2 === 0 ? 1 : -1)
        * (Math.PI * 0.5 + (rand() - 0.5) * 0.3);

      ctx.beginPath();
      ctx.moveTo(spx, spy);
      ctx.lineTo(
        spx + Math.cos(sAng) * sLen,
        spy + Math.sin(sAng) * sLen
      );
      ctx.strokeStyle = ESPINHO_COR;
      ctx.lineWidth   = 0.9;
      ctx.lineCap     = 'round';
      ctx.stroke();
    }
  }


  /* -----------------------------------------------
     7. RESIZE RESPONSIVO
     O canvas precisa ser redimensionado manualmente
     (não basta CSS width/height 100%) pois o contexto
     2D opera em pixels reais.
     Debounce de 150ms evita redesenhos excessivos
     enquanto o usuário está arrastando a janela.
  ----------------------------------------------- */
  let resizeTimer;

  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(draw, 150); /* aguarda 150ms após o último evento */
  });


  /* -----------------------------------------------
     8. INICIALIZAÇÃO
     Primeiro desenho assim que o script é executado.
  ----------------------------------------------- */
  draw();

})(); /* IIFE — evita poluir o escopo global */