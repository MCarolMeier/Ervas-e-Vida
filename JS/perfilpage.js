/**
 * PERFILPAGE.JS — Ervas & Vida
 * Depende de auth.js e plants-data.js (precisam ser carregados antes
 * deste arquivo, nessa ordem, no <head>/<body> do perfil.html).
 *
 * Antes, este arquivo tinha uma lista fixa de 6 plantas que apareciam
 * sempre, independente de quem estivesse "logado" (não havia conceito
 * de login ainda). Agora ele:
 *   1. Verifica se há um usuário logado (Auth.getCurrentUser)
 *   2. Se for visitante, mostra um aviso e oculta dados de conta
 *   3. Se estiver logado, preenche nome/e-mail/data/avatar/sobre reais
 *   4. Monta os cards de "Plantas Salvas" a partir dos favoritos
 *      reais salvos por Auth.toggleFavorite() na home
 *   5. Permite editar o avatar (preview local) e fazer logout
 */

'use strict';

/* -----------------------------------------------
   ELEMENTOS DO DOM
----------------------------------------------- */
const profileName     = document.getElementById('profileName');
const profileEmail    = document.getElementById('profileEmail');
const profileSince    = document.getElementById('profileSince');
const profileAbout    = document.getElementById('profileAbout');
const avatarPreview   = document.getElementById('avatarPreview');
const avatarInput     = document.getElementById('avatarInput');
const guestNotice     = document.getElementById('guestNotice');
const accountContent  = document.getElementById('accountContent');
const logoutBtn       = document.getElementById('logoutBtn');

const plantsGrid       = document.querySelector('#plants-grid');
const savedCount        = document.querySelector('#saved-count');
const emptyFavorites     = document.getElementById('emptyFavorites');

/* -----------------------------------------------
   1. VERIFICA SESSÃO E PREENCHE DADOS DO PERFIL
----------------------------------------------- */
function initProfile() {
  // Se algum desses módulos não carregou, avisa no console em vez
  // de travar silenciosamente em um getElementById de algo inexistente
  if (typeof Auth === 'undefined') {
    console.error('[perfilpage.js] auth.js não foi carregado antes deste script.');
    return;
  }

  const user = Auth.getCurrentUser();

  if (!user) {
    // ---- Modo visitante ----
    // Sem conta: mostra o estado vazio centralizado e esconde TODO
    // o conteúdo de conta (avatar, sobre, plantas salvas) — antes só
    // o profileInfo (nome/e-mail) era escondido, deixando o resto
    // visível sem sentido para quem não está logado
    if (guestNotice) guestNotice.hidden = false;
    if (accountContent) accountContent.hidden = true;
    if (logoutBtn) logoutBtn.hidden = true;
    return;
  }

  // ---- Usuário logado ----
  if (guestNotice) guestNotice.hidden = true;
  if (accountContent) accountContent.hidden = false;
  if (logoutBtn) logoutBtn.hidden = false;

  if (profileName)  profileName.textContent = user.nome || 'Sem nome';
  if (profileEmail) profileEmail.textContent = user.email;
  if (profileAbout && user.sobre) profileAbout.textContent = user.sobre;

  if (profileSince && user.criadoEm) {
    const data = new Date(user.criadoEm);
    profileSince.textContent = data.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  }

  if (avatarPreview && user.avatar) {
    avatarPreview.src = user.avatar;
  }

  renderFavoriteCards(user.favoritos || []);
}

/* -----------------------------------------------
   2. RENDERIZA OS CARDS DE PLANTAS FAVORITADAS
   Usa getPlantById (de plants-data.js) para resolver cada id
   salvo nos favoritos do usuário em um objeto completo de planta
----------------------------------------------- */
function renderFavoriteCards(favoriteIds) {
  if (!plantsGrid) return;

  plantsGrid.innerHTML = '';

  if (typeof getPlantById === 'undefined') {
    console.error('[perfilpage.js] plants-data.js não foi carregado antes deste script.');
    return;
  }

  // Resolve cada id favoritado em um objeto de planta completo,
  // ignorando ids que não existirem mais no catálogo (planta removida)
  const plantasFavoritas = favoriteIds
    .map((id) => getPlantById(id))
    .filter((planta) => planta !== null);

  if (savedCount) {
    const s = plantasFavoritas.length !== 1;
    savedCount.textContent = `${plantasFavoritas.length} item${s ? 's' : ''}`;
  }

  if (plantasFavoritas.length === 0) {
    if (emptyFavorites) emptyFavorites.hidden = false;
    return;
  }
  if (emptyFavorites) emptyFavorites.hidden = true;

  plantasFavoritas.forEach((planta) => {
    const card = document.createElement('article');
    card.className = 'plant-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${planta.name} — ${planta.sci}`);

    card.innerHTML = `
      <img class="plant-image" src="${planta.img || ''}" alt="${planta.imgAlt || planta.name}"
           ${!planta.img ? 'style="display:none"' : ''} />
      ${!planta.img
        ? `<div class="plant-image plant-image--placeholder" aria-hidden="true">${planta.emoji}</div>`
        : ''
      }
      <h3>${planta.name}</h3>
    `;

    // Permite remover o favorito direto do perfil (botão pequeno no card)
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'plant-card__remove';
    removeBtn.setAttribute('aria-label', `Remover ${planta.name} dos favoritos`);
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      Auth.toggleFavorite(planta.id);
      // Re-renderiza a partir do estado atualizado, sem precisar recarregar a página
      const user = Auth.getCurrentUser();
      renderFavoriteCards(user ? user.favoritos : []);
    });
    card.appendChild(removeBtn);

    plantsGrid.appendChild(card);
  });
}

/* -----------------------------------------------
   3. EDIÇÃO DE AVATAR
   Lê a imagem escolhida como dataURL (igual ao scanner) e
   salva no registro do usuário via Auth.updateCurrentUser
----------------------------------------------- */
if (avatarInput) {
  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      avatarPreview.src = dataUrl;
      Auth.updateCurrentUser({ avatar: dataUrl });
    };
    reader.readAsDataURL(file);
  });
}

/* -----------------------------------------------
   4. LOGOUT
----------------------------------------------- */
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    Auth.logout();
    window.location.href = 'index.html';
  });
}

/* -----------------------------------------------
   INICIALIZAÇÃO
----------------------------------------------- */
initProfile();