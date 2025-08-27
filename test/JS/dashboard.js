// === SISTEMA DE DASHBOARD ===

// TABELA DE PRÊMIOS
// 0–14999: Nada
// 15000–19999: Bolinha
// 20000–24999: Copo
// 25000–29999: Régua
// 30000+: Porta celular
function determinarPremio(pontos) {
  if (pontos >= 30000) return { key: 'porta_celular', label: 'Porta celular', icon: '📱' };
  if (pontos >= 25000) return { key: 'regua', label: 'Régua', icon: '📏' };
  if (pontos >= 20000) return { key: 'copo', label: 'Copo', icon: '🥤' };
  if (pontos >= 15000) return { key: 'bolinha', label: 'Bolinha', icon: '🔵' };
  return { key: 'nada', label: 'Nada', icon: '—' };
}

// Inicializar dashboard
function inicializarDashboard() {
  const searchBox = document.getElementById('searchBox');
  if (searchBox) {
    let t;
    searchBox.addEventListener('input', (e) => {
      clearTimeout(t);
      t = setTimeout(() => handleBuscarHistorico(e), 150); // debounce
    });
  }
}

// Atualizar dashboard com estatísticas
function atualizarDashboard() {
  if (typeof jogoStats === 'undefined') return;
  
  atualizarElemento('totalPontos', jogoStats.pontos);
  atualizarElemento('partidasJogadas', jogoStats.partidasJogadas);
  atualizarElemento('itensClicados', jogoStats.itensColetados);
  atualizarElemento('bolasPassaram', jogoStats.bolasPassaram);
  atualizarElemento('nivelAtual', jogoStats.nivel);

  // NOVO: prêmio atual (da última partida registrada)
  const premioLabel = (jogoStats.premioAtual && jogoStats.premioAtual.label) ? jogoStats.premioAtual.label : 'Nada';
  atualizarElemento('premioAtual', premioLabel);
  
  atualizarTabelaHistorico();
}

// Atualizar elemento do DOM
function atualizarElemento(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) {
    elemento.textContent = valor;
  }
}

// Atualizar tabela de histórico
function atualizarTabelaHistorico() {
  if (typeof jogoStats === 'undefined' || !jogoStats.historicoPartidas) return;
  
  const tabela = document.getElementById('historicoTabela');
  if (!tabela) return;
  
  tabela.innerHTML = '';
  
  jogoStats.historicoPartidas.forEach(partida => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${partida.dataHora}</td>
      <td>${partida.pontos}</td>
      <td>${partida.nivel}</td>
      <td>${partida.duracao}</td>
      <td><span class="status-badge ${partida.statusClass}">${partida.status}</span></td>
      <td>${partida.premioIcon || ''} ${partida.premioLabel || '—'}</td>
    `;
    tabela.appendChild(row);
  });
}

// Adicionar partida ao histórico
function adicionarPartidaHistorico(pontos, nivel, duracao, status) {
  if (typeof jogoStats === 'undefined') return;

  // Determina o prêmio dessa partida
  const premio = determinarPremio(pontos);

  const agora = new Date();
  const dataHora = agora.toLocaleDateString('pt-BR') + ' ' + 
                  agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
  
  let statusClass = 'status-failed';
  if (status === 'Concluída') statusClass = 'status-completed';
  else if (status === 'Interrompida') statusClass = 'status-playing';
  else if (status === 'Game Over') statusClass = 'status-gameover';
  
  const novaPartida = {
    dataHora,
    pontos,
    nivel,
    duracao,
    status,
    statusClass,
    premioKey: premio.key,
    premioLabel: premio.label,
    premioIcon: premio.icon
  };
  
  // Adiciona no início do array
  jogoStats.historicoPartidas.unshift(novaPartida);
  
  // Mantém apenas os últimos 10 registros
  if (jogoStats.historicoPartidas.length > 10) {
    jogoStats.historicoPartidas = jogoStats.historicoPartidas.slice(0, 10);
  }

  // Atualiza o "prêmio atual" exibido no dashboard
  jogoStats.premioAtual = premio;

  // persiste
  if (typeof salvarStats === 'function') salvarStats();
}

// Formatar duração em minutos e segundos (com zero à esquerda)
function formatarDuracao(segundos) {
  const minutos = Math.floor(segundos / 60);
  const segs = String(segundos % 60).padStart(2, '0');
  return `${minutos}min ${segs}s`;
}

// Buscar no histórico
function handleBuscarHistorico(e) {
  const termo = e.target.value.toLowerCase();
  const linhas = document.querySelectorAll('#historicoTabela tr');
  
  linhas.forEach(linha => {
    const texto = linha.textContent.toLowerCase();
    linha.style.display = texto.includes(termo) ? '' : 'none';
  });
}
