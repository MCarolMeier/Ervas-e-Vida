/**
 * AUTH.JS — Ervas & Vida
 * Módulo central de autenticação e favoritos simulados com localStorage.
 *
 * IMPORTANTE — Isto é uma simulação client-side, não é seguro:
 * senhas ficam salvas em texto plano no navegador do próprio usuário.
 * Serve para prototipar o fluxo de UI antes de existir um backend real.
 * Quando houver um servidor, troque as funções internas (marcadas com
 * TODO) por chamadas fetch() a uma API, mantendo os mesmos nomes de
 * função para não precisar reescrever as páginas que os usam.
 *
 * Como usar em qualquer página:
 *   <script src="JS/auth.js"></script>   (carregar ANTES do script da página)
 *   Auth.getCurrentUser()  → objeto do usuário logado, ou null (visitante)
 *   Auth.isLoggedIn()      → true/false
 *   Auth.register(...)     → cria conta + loga automaticamente
 *   Auth.login(...)        → autentica usuário existente
 *   Auth.logout()          → encerra sessão
 *   Auth.toggleFavorite(id)→ adiciona/remove planta dos favoritos do usuário logado
 *   Auth.isFavorite(id)    → true/false
 *   Auth.getFavorites()    → array de ids favoritados pelo usuário atual
 */

const Auth = (function () {
  'use strict';

  /* ── Chaves usadas no localStorage ──
     Prefixo "ervasvida_" evita colidir com outras chaves que
     o navegador possa ter de outros sites/testes */
  const KEY_USERS    = 'ervasvida_users';     // lista de todas as contas cadastradas
  const KEY_SESSION  = 'ervasvida_session';   // e-mail do usuário logado agora (ou nada)

  /* ── Helpers internos de leitura/escrita ── */

  function readUsers() {
    try {
      const raw = localStorage.getItem(KEY_USERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      // Se o JSON salvo estiver corrompido, melhor reiniciar do zero
      // do que travar o site inteiro
      return [];
    }
  }

  function writeUsers(users) {
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
  }

  function normalizeEmail(email) {
    return email.trim().toLowerCase();
  }

  /* ── Sessão atual ── */

  /**
   * Retorna o objeto do usuário logado (sem a senha) ou null se for visitante
   */
  function getCurrentUser() {
    const email = localStorage.getItem(KEY_SESSION);
    if (!email) return null;

    const users = readUsers();
    const user = users.find((u) => u.email === email);
    if (!user) return null; // sessão "fantasma" — usuário foi removido

    // Nunca devolve a senha para o resto da aplicação
    const { senha, ...userSemSenha } = user;
    return userSemSenha;
  }

  function isLoggedIn() {
    return getCurrentUser() !== null;
  }

  /* ── Cadastro ── */

  /**
   * Cria uma nova conta. Retorna { ok: true } ou { ok: false, error: '...' }
   * TODO: ao integrar com backend, troque o corpo desta função por um
   * fetch('/api/register', { method: 'POST', body: ... }) e mantenha
   * o mesmo formato de retorno para as páginas continuarem funcionando.
   */
  function register({ nome, email, senha }) {
    const emailNormalizado = normalizeEmail(email);
    const users = readUsers();

    const jaExiste = users.some((u) => u.email === emailNormalizado);
    if (jaExiste) {
      return { ok: false, error: 'Já existe uma conta com este e-mail.' };
    }

    const novoUsuario = {
      nome: nome.trim(),
      email: emailNormalizado,
      senha, // texto plano — ver aviso de segurança no topo do arquivo
      avatar: null,        // dataURL da foto de perfil, se o usuário trocar depois
      sobre: '',           // texto livre da seção "Sobre"
      favoritos: [],       // array de ids de plantas favoritadas
      criadoEm: new Date().toISOString(),
    };

    users.push(novoUsuario);
    writeUsers(users);

    // Loga automaticamente após o cadastro
    localStorage.setItem(KEY_SESSION, emailNormalizado);

    return { ok: true };
  }

  /* ── Login ── */

  /**
   * Autentica um usuário existente. Retorna { ok: true } ou { ok: false, error }
   * TODO: ao integrar com backend, troque por fetch('/api/login', ...)
   */
  function login({ email, senha }) {
    const emailNormalizado = normalizeEmail(email);
    const users = readUsers();
    const user = users.find((u) => u.email === emailNormalizado);

    if (!user || user.senha !== senha) {
      // Mensagem genérica de propósito — não revela se o e-mail existe ou não,
      // boa prática mesmo numa simulação
      return { ok: false, error: 'E-mail ou senha incorretos.' };
    }

    localStorage.setItem(KEY_SESSION, emailNormalizado);
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem(KEY_SESSION);
  }

  /* ── Atualização de perfil ── */

  /**
   * Atualiza campos do usuário logado (ex.: avatar, sobre).
   * Aceita um objeto parcial — só os campos passados são alterados.
   */
  function updateCurrentUser(partialData) {
    const email = localStorage.getItem(KEY_SESSION);
    if (!email) return { ok: false, error: 'Nenhum usuário logado.' };

    const users = readUsers();
    const index = users.findIndex((u) => u.email === email);
    if (index === -1) return { ok: false, error: 'Usuário não encontrado.' };

    users[index] = { ...users[index], ...partialData };
    writeUsers(users);
    return { ok: true };
  }

  /* ── Favoritos ──
     Guardados dentro do próprio registro do usuário, então cada
     conta tem sua lista independente */

  function getFavorites() {
    const email = localStorage.getItem(KEY_SESSION);
    if (!email) return [];

    const users = readUsers();
    const user = users.find((u) => u.email === email);
    return user ? (user.favoritos || []) : [];
  }

  function isFavorite(plantId) {
    return getFavorites().includes(plantId);
  }

  /**
   * Adiciona ou remove uma planta dos favoritos do usuário logado.
   * Retorna { ok: false, requiresAuth: true } se for visitante —
   * as páginas usam essa flag para redirecionar ao login.
   */
  function toggleFavorite(plantId) {
    const email = localStorage.getItem(KEY_SESSION);
    if (!email) {
      return { ok: false, requiresAuth: true };
    }

    const users = readUsers();
    const index = users.findIndex((u) => u.email === email);
    if (index === -1) return { ok: false, requiresAuth: true };

    const favoritos = users[index].favoritos || [];
    const jaEra = favoritos.includes(plantId);

    users[index].favoritos = jaEra
      ? favoritos.filter((id) => id !== plantId)
      : [...favoritos, plantId];

    writeUsers(users);
    return { ok: true, isFavorite: !jaEra };
  }

  /* ── API pública do módulo ── */
  return {
    getCurrentUser,
    isLoggedIn,
    register,
    login,
    logout,
    updateCurrentUser,
    getFavorites,
    isFavorite,
    toggleFavorite,
  };
})();