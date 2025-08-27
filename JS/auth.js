// === SISTEMA DE AUTENTICAÇÃO ===
let usuario = null;

// Inicializar sistema de login
function inicializarAuth() {
  const loginForm = document.getElementById('loginForm');
  const btnLogout = document.getElementById('btnLogout');
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  if (btnLogout) {
    btnLogout.addEventListener('click', handleLogout);
  }
  
  // Foco no primeiro campo do login
  const nomeInput = document.getElementById('nome');
  if (nomeInput) {
    nomeInput.focus();
  }

  // Restaura sessão se existir
  try {
    const salvo = localStorage.getItem('usuario');
    if (salvo) {
      usuario = JSON.parse(salvo);
      const nomeUsuario = document.getElementById('nomeUsuario');
      if (nomeUsuario) nomeUsuario.textContent = usuario.nome;
      mostrarAplicacao();
      if (typeof atualizarDashboard === 'function') atualizarDashboard();
    }
  } catch {}
}

// Processar login
function handleLogin(e) {
  e.preventDefault();
  
  const nome = document.getElementById('nome').value;
  const telefone = document.getElementById('telefone').value;
  const email = document.getElementById('email').value;
  
  if (nome && telefone && email) {
    // Validações básicas
    if (!validarEmail(email)) {
      alert('Por favor, insira um email válido.');
      return;
    }
    
    if (!validarTelefone(telefone)) {
      alert('Por favor, insira um telefone válido.');
      return;
    }
    
    // Criar usuário
    usuario = { nome, telefone, email };
    try {
      localStorage.setItem('usuario', JSON.stringify(usuario));
    } catch {}

    // Atualizar interface
    const nomeUsuario = document.getElementById('nomeUsuario');
    if (nomeUsuario) {
      nomeUsuario.textContent = nome;
    }
    
    // Mostrar aplicação
    mostrarAplicacao();
    
    // Atualizar dashboard
    if (typeof atualizarDashboard === 'function') {
      atualizarDashboard();
    }
  }
}

// Processar logout
function handleLogout() {
  if (typeof jogoAtivo !== 'undefined' && jogoAtivo) {
    if (typeof pararJogo === 'function') {
      pararJogo();
    }
  }
  
  // Limpar dados
  usuario = null;
  try {
    localStorage.removeItem('usuario');
    localStorage.removeItem('jogoStats');
  } catch {}
  
  // Recarregar página
  location.reload();
}

// Mostrar aplicação após login
function mostrarAplicacao() {
  const loginScreen = document.getElementById('loginScreen');
  const appContainer = document.getElementById('appContainer');
  
  if (loginScreen) {
    loginScreen.classList.add('hidden');
  }
  
  if (appContainer) {
    appContainer.classList.remove('hidden');
  }
}

// Validar email
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validar telefone (formato brasileiro básico)
function validarTelefone(telefone) {
  const regex = /^[\(\)\s\-\+\d]{10,}$/;
  return regex.test(telefone);
}

// Obter usuário atual
function obterUsuario() {
  return usuario;
}

// Verificar se está logado
function estaLogado() {
  return usuario !== null;
}
