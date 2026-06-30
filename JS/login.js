/**
 * LOGIN.JS — Jardim das Plantas
 * Depende de auth.js (precisa estar carregado antes deste arquivo).
 *
 * Responsabilidades:
 *  1. Animação de entrada da ilustração (mesma da inscrição)
 *  2. Mostrar/ocultar senha
 *  3. Autenticar via Auth.login() e redirecionar
 *  4. Se já houver um destino salvo (ex.: usuário tentou favoritar
 *     antes de logar), volta para lá depois do login
 */

/* ══════════════════════════════════════════════
   1. ANIMAÇÃO DE ENTRADA DA ILUSTRAÇÃO
   ══════════════════════════════════════════════ */
(function initHeroReveal() {
  const heroImage = document.querySelector('.hero-image');
  if (!heroImage) return;

  window.requestAnimationFrame(() => {
    setTimeout(() => heroImage.classList.add('is-visible'), 100);
  });
})();


/* ══════════════════════════════════════════════
   2. MOSTRAR / OCULTAR SENHA
   ══════════════════════════════════════════════ */
(function initPasswordToggle() {
  const toggleBtn = document.getElementById('toggleSenha');
  const senhaInput = document.getElementById('senha');
  if (!toggleBtn || !senhaInput) return;

  toggleBtn.addEventListener('click', () => {
    const isPassword = senhaInput.type === 'password';
    senhaInput.type = isPassword ? 'text' : 'password';

    toggleBtn.setAttribute('aria-pressed', String(isPassword));
    toggleBtn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
    toggleBtn.querySelector('.field__toggle-icon').textContent = isPassword ? '🙈' : '👁';
  });
})();


/* ══════════════════════════════════════════════
   3. AUTENTICAÇÃO
   ══════════════════════════════════════════════ */
(function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');
  const emailError = document.getElementById('email-error');
  const senhaError = document.getElementById('senha-error');
  const submitBtn  = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');

  function clearErrors() {
    emailError.textContent = '';
    senhaError.textContent = '';
    emailInput.classList.remove('has-error');
    senhaInput.classList.remove('has-error');
    successMsg.classList.remove('is-visible', 'is-error');
    successMsg.textContent = '';
  }

  [emailInput, senhaInput].forEach((input) => {
    input.addEventListener('input', () => input.classList.remove('has-error'));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    if (!emailInput.value.trim()) {
      emailError.textContent = 'Informe seu e-mail.';
      emailInput.classList.add('has-error');
      emailInput.focus();
      return;
    }
    if (!senhaInput.value) {
      senhaError.textContent = 'Informe sua senha.';
      senhaInput.classList.add('has-error');
      senhaInput.focus();
      return;
    }

    // Pequeno delay simulando uma chamada de rede — facilita perceber
    // o estado de carregamento e troca direto por fetch() no futuro
    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-submit__text').textContent = 'Entrando...';

    setTimeout(() => {
      const resultado = Auth.login({
        email: emailInput.value,
        senha: senhaInput.value,
      });

      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-submit__text').textContent = 'Entrar';

      if (!resultado.ok) {
        successMsg.textContent = resultado.error;
        successMsg.classList.add('is-visible', 'is-error');
        senhaInput.classList.add('has-error');
        return;
      }

      successMsg.textContent = 'Login realizado! Redirecionando...';
      successMsg.classList.add('is-visible');

      // Se o usuário veio de uma tentativa de favoritar (ou outra
      // página protegida), volta exatamente para lá. Senão, vai pro perfil.
      const destino = sessionStorage.getItem('ervasvida_redirect_after_login');
      sessionStorage.removeItem('ervasvida_redirect_after_login');

      setTimeout(() => {
        window.location.href = destino || 'perfil.html';
      }, 600);
    }, 500);
  });
})();