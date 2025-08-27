// === SISTEMA DE JOGO ===

// Variáveis do jogo
let jogoAtivo = false;
let partidaFinalizada = false;
let jogoStats = {
  pontos: 0,
  nivel: 1,
  itensColetados: 0,
  bolasPassaram: 0,
  partidasJogadas: 0,
  tempoInicio: null,
  // arrays separados para clareza
  intervalosTimeout: [],
  intervalosInterval: [],
  historicoPartidas: [],
  premioAtual: { key: 'nada', label: 'Nada', icon: '—' } // NOVO: estado persistido do último prêmio
};

// Persistência
function salvarStats() {
  try {
    const { intervalosTimeout, intervalosInterval, tempoInicio, ...persistivel } = jogoStats;
    localStorage.setItem('jogoStats', JSON.stringify(persistivel));
  } catch {}
}

// Inicializar sistema de jogo
function inicializarJogo() {
  // Carregar stats do storage (se houver)
  try {
    const salvo = localStorage.getItem('jogoStats');
    if (salvo) {
      const parsed = JSON.parse(salvo);
      jogoStats = {
        ...jogoStats,
        ...parsed,
        tempoInicio: null,
        intervalosTimeout: [],
        intervalosInterval: []
      };
    }
  } catch {}

  const btnIniciarJogo = document.getElementById('btnIniciarJogo');
  const btnPausarJogo = document.getElementById('btnPausarJogo');
  const btnPararJogo = document.getElementById('btnPararJogo');
  
  if (btnIniciarJogo) {
    btnIniciarJogo.addEventListener('click', iniciarJogo);
  }
  
  if (btnPausarJogo) {
    btnPausarJogo.addEventListener('click', pausarJogo);
  }
  
  if (btnPararJogo) {
    btnPararJogo.addEventListener('click', pararJogo);
  }

  // Atualiza UI ao carregar
  atualizarUIJogo();
}

// Iniciar jogo
function iniciarJogo() {
  if (jogoAtivo) return;

  // bloqueia se não logado
  if (typeof estaLogado === 'function' && !estaLogado()) {
    alert('Você precisa fazer login para jogar.');
    return;
  }
  
  jogoAtivo = true;
  partidaFinalizada = false;
  jogoStats.tempoInicio = Date.now();
  jogoStats.partidasJogadas++;

  salvarStats();
  
  // Atualizar controles
  atualizarControlesJogo(true);
  
  // Iniciar criação de itens
  criarItemInterval();
  
  // Iniciar timer
  iniciarTimer();
}

// Pausar/Retomar jogo
function pausarJogo() {
  jogoAtivo = !jogoAtivo;
  const btnPausar = document.getElementById('btnPausarJogo');
  const overlay = document.getElementById('pauseOverlay');
  
  if (btnPausar) {
    btnPausar.textContent = jogoAtivo ? 'Pausar' : 'Retomar';
  }
  
  if (jogoAtivo) {
    if (overlay) overlay.classList.add('hidden');
    criarItemInterval();
    iniciarTimer();
  } else {
    if (overlay) overlay.classList.remove('hidden');
    limparIntervalos();
    // Remover todas as bolas da tela quando pausar
    const gameArea = document.getElementById('gameArea');
    if (gameArea) {
      gameArea.querySelectorAll('.game-item').forEach(el => el.remove());
    }
  }

  salvarStats();
}

// Parar jogo
function pararJogo() {
  const tempoFinal = jogoStats.tempoInicio ? Math.floor((Date.now() - jogoStats.tempoInicio) / 1000) : 0;
  const duracaoFormatada = typeof formatarDuracao === 'function' ? formatarDuracao(tempoFinal) : `${tempoFinal}s`;
  
  // Determinar status da partida
  let status = 'Interrompida';
  if (partidaFinalizada) {
    status = 'Concluída';
  } else if (jogoStats.pontos === 0) {
    status = 'Não Iniciada';
  }
  
  // Adicionar ao histórico apenas se teve progresso e não foi finalizada já
  if ((jogoStats.pontos > 0 || tempoFinal > 0) && !partidaFinalizada) {
    if (typeof adicionarPartidaHistorico === 'function') {
      adicionarPartidaHistorico(jogoStats.pontos, jogoStats.nivel, duracaoFormatada, status);
    }
  }
  
  // Resetar estado do jogo
  jogoAtivo = false;
  partidaFinalizada = false;
  limparIntervalos();
  
  // Limpar área de jogo
  const gameArea = document.getElementById('gameArea');
  if (gameArea) {
    gameArea.querySelectorAll('.game-item').forEach(el => el.remove());
    const overlay = document.getElementById('pauseOverlay');
    if (overlay) overlay.classList.add('hidden');
  }
  
  // Atualizar controles
  atualizarControlesJogo(false);
  
  // Reset stats da partida atual (mantém histórico acumulado)
  jogoStats.pontos = 0;
  jogoStats.nivel = 1;
  jogoStats.itensColetados = 0;
  jogoStats.bolasPassaram = 0;
  jogoStats.tempoInicio = null;
  
  // Atualizar interfaces
  atualizarUIJogo();
  salvarStats();
  
  if (typeof atualizarDashboard === 'function') {
    atualizarDashboard();
  }
}

// Atualizar controles do jogo
function atualizarControlesJogo(jogando) {
  const btnIniciar = document.getElementById('btnIniciarJogo');
  const btnPausar = document.getElementById('btnPausarJogo');
  const btnParar = document.getElementById('btnPararJogo');
  
  if (btnIniciar) {
    btnIniciar.disabled = jogando;
  }
  
  if (btnPausar) {
    btnPausar.disabled = !jogando;
    btnPausar.textContent = 'Pausar';
  }
  
  if (btnParar) {
    btnParar.disabled = !jogando;
  }
}

// Criar intervalo para geração de itens
function criarItemInterval() {
  if (!jogoAtivo) return;
  
  // Velocidade base de 1200ms, reduzindo 5% a cada nível (máximo 80%)
  const velocidadeBase = 1200;
  const reducaoPercentual = 0.05; // 5%
  const reducaoMaxima = 0.80; // 80% máximo
  const reducaoAtual = Math.min(reducaoMaxima, reducaoPercentual * (jogoStats.nivel - 1));
  const velocidade = Math.max(200, velocidadeBase * (1 - reducaoAtual));
  
  const timeout = setTimeout(() => {
    if (jogoAtivo) {
      criarItem();
      criarItemInterval();
    }
  }, velocidade);
  
  jogoStats.intervalosTimeout.push(timeout);
}

// Criar item do jogo
function criarItem() {
  const gameArea = document.getElementById('gameArea');
  if (!gameArea) return;
  
  const item = document.createElement('div');
  
  const tipos = [
    { class: 'item-pen', emoji: '✏️', pontos: 100 },
    { class: 'item-cup', emoji: '☕', pontos: 150 },
    { class: 'item-book', emoji: '📚', pontos: 200 },
    { class: 'item-star', emoji: '⭐', pontos: 300 }
  ];
  
  const tipoAleatorio = tipos[Math.floor(Math.random() * tipos.length)];
  
  item.classList.add('game-item', tipoAleatorio.class);
  item.textContent = tipoAleatorio.emoji;
  item.style.left = Math.random() * (gameArea.clientWidth - 50) + 'px';
  
  // Velocidade de queda aumenta até 80% (máximo no nível 16)
  const velocidadeQuedaBase = 4; // segundos
  const reducaoMaxima = 0.80; // 80% máximo
  const reducaoAtual = Math.min(reducaoMaxima, 0.05 * (jogoStats.nivel - 1));
  const velocidadeQueda = Math.max(0.8, velocidadeQuedaBase * (1 - reducaoAtual));
  item.style.animationDuration = `${velocidadeQueda}s`;

  // Acessibilidade e mobile-friendly
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `Item ${tipoAleatorio.emoji} vale ${tipoAleatorio.pontos} pontos`);
  
  const onItemHit = () => {
    jogoStats.pontos += tipoAleatorio.pontos;
    jogoStats.itensColetados++;
    
    // Verificar mudança de nível (a cada 3000 pontos, máximo nível 10)
    const novoNivel = Math.min(10, Math.floor(jogoStats.pontos / 3000) + 1);
    if (novoNivel > jogoStats.nivel) {
      jogoStats.nivel = novoNivel;
      mostrarNotificacaoNivel(novoNivel);
    }
    
    atualizarUIJogo();
    salvarStats();
    item.remove();
    
    // Verificar vitória (10 níveis - 30000 pontos)
    if (jogoStats.pontos >= 30000) {
      finalizarJogoVitoria();
    }
  };

  item.addEventListener('pointerdown', onItemHit);
  item.addEventListener('click', onItemHit); // fallback desktop
  
  gameArea.appendChild(item);
  
  // Remover item ao final da animação (robusto)
  item.addEventListener('animationend', () => {
    if (item.parentNode) {
      // Bola passou sem ser clicada
      jogoStats.bolasPassaram++;
      atualizarUIJogo();
      salvarStats();
      
      // Verificar Game Over (30 bolas passaram)
      if (jogoStats.bolasPassaram >= 30) {
        finalizarJogoGameOver();
        return;
      }
      
      item.remove();
    }
  });
}

// Finalizar jogo com vitória
function finalizarJogoVitoria() {
  const tempoFinal = Math.floor((Date.now() - jogoStats.tempoInicio) / 1000);
  const duracaoFormatada = typeof formatarDuracao === 'function' ? formatarDuracao(tempoFinal) : `${tempoFinal}s`;
  
  partidaFinalizada = true;
  
  if (typeof adicionarPartidaHistorico === 'function') {
    adicionarPartidaHistorico(jogoStats.pontos, jogoStats.nivel, duracaoFormatada, 'Concluída');
  }
  
  alert(`🎉 Parabéns! Você completou todos os 10 níveis com ${jogoStats.pontos} pontos!`);
  pararJogo();
}

// Finalizar jogo com Game Over
function finalizarJogoGameOver() {
  const tempoFinal = Math.floor((Date.now() - jogoStats.tempoInicio) / 1000);
  const duracaoFormatada = typeof formatarDuracao === 'function' ? formatarDuracao(tempoFinal) : `${tempoFinal}s`;
  
  partidaFinalizada = true;
  
  if (typeof adicionarPartidaHistorico === 'function') {
    adicionarPartidaHistorico(jogoStats.pontos, jogoStats.nivel, duracaoFormatada, 'Game Over');
  }
  
  alert(`💀 Game Over! Você perdeu 30 bolas. Pontuação final: ${jogoStats.pontos} pontos!`);
  pararJogo();
}

// Iniciar timer do jogo
function iniciarTimer() {
  if (!jogoAtivo || !jogoStats.tempoInicio) return;
  
  const interval = setInterval(() => {
    if (!jogoAtivo) {
      clearInterval(interval);
      return;
    }
    
    const tempoDecorrido = Math.floor((Date.now() - jogoStats.tempoInicio) / 1000);
    const minutos = Math.floor(tempoDecorrido / 60);
    const segundos = tempoDecorrido % 60;
    
    const tempoElement = document.getElementById('tempoJogo');
    if (tempoElement) {
      tempoElement.textContent = `${minutos}:${String(segundos).padStart(2, '0')}`;
    }
  }, 1000);
  
  jogoStats.intervalosInterval.push(interval);
}

// Limpar intervalos do jogo
function limparIntervalos() {
  jogoStats.intervalosTimeout.forEach(clearTimeout);
  jogoStats.intervalosInterval.forEach(clearInterval);
  jogoStats.intervalosTimeout = [];
  jogoStats.intervalosInterval = [];
}

// Atualizar interface do jogo
function atualizarUIJogo() {
  const elementos = {
    'pontuacaoAtual': jogoStats.pontos,
    'nivelJogo': jogoStats.nivel,
    'itensColetados': jogoStats.itensColetados,
    'bolasPassaramJogo': jogoStats.bolasPassaram
  };
  
  Object.entries(elementos).forEach(([id, valor]) => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.textContent = valor;
    }
  });
}

// Mostrar notificação de novo nível
function mostrarNotificacaoNivel(nivel) {
  const notificacao = document.getElementById('nivelNotificacao');
  if (notificacao) {
    notificacao.textContent = `🚀 NÍVEL ${nivel} DESBLOQUEADO!`;
    notificacao.classList.remove('hidden');
    
    // Remover após 3 segundos
    setTimeout(() => {
      notificacao.classList.add('hidden');
    }, 3000);
  }
}
