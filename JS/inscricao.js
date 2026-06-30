/**
 * INSCREVA-SE — Jardim das Plantas
 * inscricao.js
 *
 * Responsabilidades:
 *  1. Animação de entrada da ilustração
 *  2. Mostrar/ocultar senha
 *  3. Validação dos campos (nome, senha, email)
 *  4. Simulação de envio do formulário com feedback visual
 */

/* ══════════════════════════════════════════════
   1. ANIMAÇÃO DE ENTRADA DA ILUSTRAÇÃO
   ══════════════════════════════════════════════ */
(function initHeroReveal() {
  const heroImage = document.querySelector('.hero-image');
  if (!heroImage) return;

  // Pequeno delay para garantir uma entrada suave ao carregar a página
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
   3. VALIDAÇÃO DO FORMULÁRIO
   ══════════════════════════════════════════════ */
(function initFormValidation() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  const nomeInput  = document.getElementById('nome');
  const senhaInput = document.getElementById('senha');
  const emailInput = document.getElementById('email');

  const nomeError  = document.getElementById('nome-error');
  const senhaError = document.getElementById('senha-error');
  const emailError = document.getElementById('email-error');

  const submitBtn  = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');

  // Regex simples para validação de e-mail
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Aplica estado de erro ou válido em um campo
   */
  function setFieldState(input, errorEl, message) {
    if (message) {
      input.classList.add('has-error');
      input.classList.remove('is-valid');
      errorEl.textContent = message;
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.classList.remove('has-error');
      input.classList.add('is-valid');
      errorEl.textContent = '';
      input.removeAttribute('aria-invalid');
    }
  }

  /**
   * Validações individuais — retornam string de erro ou '' se válido
   */
  function validateNome(value) {
    if (!value.trim()) return 'Por favor, informe seu nome.';
    if (value.trim().length < 2) return 'O nome deve ter ao menos 2 letras.';
    return '';
  }

  function validateSenha(value) {
    if (!value) return 'Por favor, crie uma senha.';
    if (value.length < 6) return 'A senha precisa ter ao menos 6 caracteres.';
    return '';
  }

  function validateEmail(value) {
    if (!value.trim()) return 'Por favor, informe seu e-mail.';
    if (!EMAIL_REGEX.test(value.trim())) return 'Informe um e-mail válido.';
    return '';
  }

  // Validação em tempo real (ao sair do campo)
  nomeInput.addEventListener('blur', () => {
    setFieldState(nomeInput, nomeError, validateNome(nomeInput.value));
  });
  senhaInput.addEventListener('blur', () => {
    setFieldState(senhaInput, senhaError, validateSenha(senhaInput.value));
  });
  emailInput.addEventListener('blur', () => {
    setFieldState(emailInput, emailError, validateEmail(emailInput.value));
  });

  // Remove o erro enquanto o usuário digita (feedback menos agressivo)
  [nomeInput, senhaInput, emailInput].forEach((input) => {
    input.addEventListener('input', () => {
      input.classList.remove('has-error');
    });
  });

  /* ══════════════════════════════════════════════
     4. ENVIO DO FORMULÁRIO (simulado)
     ══════════════════════════════════════════════ */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nomeMsg  = validateNome(nomeInput.value);
    const senhaMsg = validateSenha(senhaInput.value);
    const emailMsg = validateEmail(emailInput.value);

    setFieldState(nomeInput, nomeError, nomeMsg);
    setFieldState(senhaInput, senhaError, senhaMsg);
    setFieldState(emailInput, emailError, emailMsg);

    // Se houver qualquer erro, interrompe o envio e foca no primeiro campo inválido
    if (nomeMsg || senhaMsg || emailMsg) {
      const firstInvalid = [nomeInput, senhaInput, emailInput].find(
        (input) => input.classList.contains('has-error')
      );
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Verifica e-mail duplicado antes de simular o envio
    if (Auth.getCurrentUser === undefined) {
      console.error('[inscricao.js] auth.js não foi carregado. Verifique a ordem das tags <script> no HTML.');
      return;
    }

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-submit__text').textContent = 'Enviando...';

    setTimeout(() => {
      // Cria a conta de fato (antes, esta etapa não salvava nada —
      // o "sucesso" era só visual e a conta se perdia ao recarregar)
      const resultado = Auth.register({
        nome: nomeInput.value,
        email: emailInput.value,
        senha: senhaInput.value,
      });

      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-submit__text').textContent = 'Inscrevasse';

      if (!resultado.ok) {
        // E-mail já cadastrado — mostra o erro no campo de e-mail
        setFieldState(emailInput, emailError, resultado.error);
        emailInput.focus();
        return;
      }

      // Exibe mensagem de sucesso
      successMsg.textContent = `Inscrição confirmada! Bem-vindo(a), ${nomeInput.value.trim()}.`;
      successMsg.classList.add('is-visible');

      // Limpa o formulário
      form.reset();
      [nomeInput, senhaInput, emailInput].forEach((input) => {
        input.classList.remove('is-valid', 'has-error');
      });

      // Redireciona para o perfil recém-criado após a mensagem aparecer
      setTimeout(() => {
        window.location.href = 'perfil.html';
      }, 1200);
    }, 1200);
  });
})();