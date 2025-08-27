// === ARQUIVO PRINCIPAL - NAVEGAÇÃO E INICIALIZAÇÃO ===

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar todos os módulos
  inicializarAplicacao();
});

// Função principal de inicialização
function inicializarAplicacao() {
  // Inicializar módulos
  if (typeof inicializarAuth === 'function') {
    inicializarAuth();
  }
  
  if (typeof inicializarNavegacao === 'function') {
    inicializarNavegacao();
  }
  
  if (typeof inicializarDashboard === 'function') {
    inicializarDashboard();
  }
  
  if (typeof inicializarJogo === 'function') {
    inicializarJogo();
  }
  
  console.log('🎮 Jogo SENAC inicializado com sucesso!');
}

// Sistema de navegação
function inicializarNavegacao() {
  const btnDashboard = document.getElementById('btnDashboard');
  const btnJogo = document.getElementById('btnJogo');
  
  if (btnDashboard) {
    btnDashboard.addEventListener('click', () => mostrarTela('dashboard'));
  }
  
  if (btnJogo) {
    btnJogo.addEventListener('click', () => mostrarTela('jogo'));
  }
}

// Mostrar tela específica
function mostrarTela(tela) {
  // Esconder todas as telas
  const secoes = ['dashboardSection', 'jogoSection'];
  secoes.forEach(secaoId => {
    const secao = document.getElementById(secaoId);
    if (secao) {
      secao.classList.add('hidden');
    }
  });
  
  // Remover classe ativa dos botões
  document.querySelectorAll('.sidebar-nav button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Mostrar tela selecionada e ativar botão
  if (tela === 'dashboard') {
    mostrarDashboard();
  } else if (tela === 'jogo') {
    mostrarJogo();
  }
}

// Mostrar dashboard
function mostrarDashboard() {
  const dashboardSection = document.getElementById('dashboardSection');
  const btnDashboard = document.getElementById('btnDashboard');
  const pageTitle = document.getElementById('pageTitle');
  
  if (dashboardSection) {
    dashboardSection.classList.remove('hidden');
  }
  
  if (btnDashboard) {
    btnDashboard.classList.add('active');
  }
  
  if (pageTitle) {
    pageTitle.textContent = 'Dashboard';
  }
  
  // Atualizar dashboard
  if (typeof atualizarDashboard === 'function') {
    atualizarDashboard();
  }
}

// Mostrar área de jogo
function mostrarJogo() {
  const jogoSection = document.getElementById('jogoSection');
  const btnJogo = document.getElementById('btnJogo');
  const pageTitle = document.getElementById('pageTitle');
  
  if (jogoSection) {
    jogoSection.classList.remove('hidden');
  }
  
  if (btnJogo) {
    btnJogo.classList.add('active');
  }
  
  if (pageTitle) {
    pageTitle.textContent = 'Área de Jogo';
  }
}

// Função utilitária para debugs
function debug(mensagem, objeto = null) {
  if (console && console.log) {
    if (objeto) {
      console.log(`🐛 ${mensagem}:`, objeto);
    } else {
      console.log(`🐛 ${mensagem}`);
    }
  }
}

// Função utilitária para mostrar mensagens de erro
function mostrarErro(mensagem) {
  if (alert) {
    alert(`❌ Erro: ${mensagem}`);
  }
}

// Função utilitária para mostrar mensagens de sucesso
function mostrarSucesso(mensagem) {
  if (alert) {
    alert(`✅ Sucesso: ${mensagem}`);
  }
}

// Verificar se todos os módulos foram carregados
function verificarModulos() {
  const modulos = [
    'inicializarAuth',
    'inicializarDashboard', 
    'inicializarJogo',
    'atualizarDashboard',
    'jogoStats'
  ];
  
  const modulosCarregados = modulos.filter(modulo => typeof window[modulo] !== 'undefined');
  
  debug(`Módulos carregados: ${modulosCarregados.length}/${modulos.length}`);
  
  return modulosCarregados.length === modulos.length;
}

// Exportar funções globais para uso em outros arquivos
window.mostrarTela = mostrarTela;
window.debug = debug;
window.mostrarErro = mostrarErro;
window.mostrarSucesso = mostrarSucesso;
