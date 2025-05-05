// resumo.js
document.addEventListener('DOMContentLoaded', function() {
    // Carrega a biblioteca Chart.js se não estiver carregada
    if (typeof Chart === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = carregarResumo;
      document.head.appendChild(script);
    } else {
      carregarResumo();
    }
  });
  
  function carregarResumo() {
    atualizarResumo();
  }
  
  function atualizarResumo() {
    // Atualiza os indicadores de saúde financeira
    atualizarSaudeFinanceira();
    
    // Atualiza o resumo de despesas por categoria
    atualizarResumoDespesas();
    
    // Atualiza o resumo de investimentos por categoria
    atualizarResumoInvestimentos();
  }
  
  function atualizarSaudeFinanceira() {
    const bancos = JSON.parse(localStorage.getItem('bancos')) || [];
    const despesas = JSON.parse(localStorage.getItem('despesas')) || [];
    const impostos = JSON.parse(localStorage.getItem('impostos')) || [];
    
    // Calcula saldo total
    const saldoTotal = bancos.reduce((total, banco) => total + banco.saldo, 0);
    
    // Calcula despesas pendentes
    const despesasPendentes = despesas
      .filter(d => !d.paga)
      .reduce((total, d) => total + d.valor, 0);
    
    // Calcula impostos pendentes
    const impostosPendentes = impostos
      .filter(i => i.status === 'Pendente')
      .reduce((total, i) => total + i.valor, 0);
    
    // Calcula saldo disponível (total - despesas pendentes - impostos pendentes)
    const saldoDisponivel = saldoTotal - despesasPendentes - impostosPendentes;
    
    // Atualiza a interface
    document.getElementById('resumoSaldoTotal').textContent = formatarValor(saldoTotal);
    document.getElementById('resumoDespesasPendentes').textContent = formatarValor(despesasPendentes);
    document.getElementById('resumoImpostosPendentes').textContent = formatarValor(impostosPendentes);
    document.getElementById('resumoSaldoDisponivel').textContent = formatarValor(saldoDisponivel);
    
    // Adiciona classe de cor com base no saldo disponível
    const saldoDisponivelEl = document.getElementById('resumoSaldoDisponivel');
    saldoDisponivelEl.className = 'indicador-valor ' + 
      (saldoDisponivel > 0 ? 'positivo' : 'negativo');
  }
  
  function atualizarResumoDespesas() {
    const despesas = JSON.parse(localStorage.getItem('despesas')) || [];
    
    // Agrupa despesas por categoria
    const despesasPorCategoria = {};
    despesas.forEach(despesa => {
      if (!despesasPorCategoria[despesa.categoria]) {
        despesasPorCategoria[despesa.categoria] = 0;
      }
      despesasPorCategoria[despesa.categoria] += despesa.valor;
    });
    
    // Calcula o total de despesas
    const totalDespesas = Object.values(despesasPorCategoria).reduce((total, valor) => total + valor, 0);
    
    // Preenche a tabela de resumo
    const corpoTabela = document.getElementById('corpoTabelaDespesasResumo');
    corpoTabela.innerHTML = '';
    
    Object.entries(despesasPorCategoria).forEach(([categoria, valor]) => {
      const porcentagem = totalDespesas > 0 ? (valor / totalDespesas * 100).toFixed(2) : 0;
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${categoria}</td>
        <td>${formatarValor(valor)}</td>
        <td>${porcentagem}%</td>
      `;
      corpoTabela.appendChild(row);
    });
    
    // Cria o gráfico de despesas
    criarGraficoDespesas(despesasPorCategoria);
  }

  
  function atualizarResumoInvestimentos() {
    const historicoReserva = JSON.parse(localStorage.getItem('historicoReserva')) || [];
    
    // Agrupa investimentos por categoria
    const investimentosPorCategoria = {};
    historicoReserva.forEach(item => {
      if (item.tipo === 'aporte') {
        if (!investimentosPorCategoria[item.categoria]) {
          investimentosPorCategoria[item.categoria] = 0;
        }
        investimentosPorCategoria[item.categoria] += item.valor;
      }
    });
    
    // Calcula o total de investimentos
    const totalInvestimentos = Object.values(investimentosPorCategoria).reduce((total, valor) => total + valor, 0);
    
    // Preenche a tabela de resumo
    const corpoTabela = document.getElementById('corpoTabelaInvestimentosResumo');
    corpoTabela.innerHTML = '';
    
    Object.entries(investimentosPorCategoria).forEach(([categoria, valor]) => {
      const porcentagem = totalInvestimentos > 0 ? (valor / totalInvestimentos * 100).toFixed(2) : 0;
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${categoria}</td>
        <td>${formatarValor(valor)}</td>
        <td>${porcentagem}%</td>
      `;
      corpoTabela.appendChild(row);
    });
    
    // Cria o gráfico de investimentos
    criarGraficoInvestimentos(investimentosPorCategoria);
  }
  
  function criarGraficoDespesas(dados) {
    const ctx = document.getElementById('graficoDespesas').getContext('2d');
    
    // Se já existe um gráfico, destrua antes de criar um novo
    if (window.graficoDespesas) {
      window.graficoDespesas.destroy();
    }
    
    const categorias = Object.keys(dados);
    const valores = Object.values(dados);
    
    window.graficoDespesas = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: categorias,
        datasets: [{
          data: valores,
          backgroundColor: [
            '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', 
            '#FF5722', '#607D8B', '#00BCD4', '#8BC34A'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Distribuição de Despesas por Categoria',
            color: '#ffffff'
          },
          legend: {
            position: 'bottom',
            labels: {
              color: '#ffffff'
            }
          }
        }
      }
    });
  }
  
  function criarGraficoInvestimentos(dados) {
    const ctx = document.getElementById('graficoInvestimentos').getContext('2d');
    
    // Se já existe um gráfico, destrua antes de criar um novo
    if (window.graficoInvestimentos) {
      window.graficoInvestimentos.destroy();
    }
    
    const categorias = Object.keys(dados);
    const valores = Object.values(dados);
    
    window.graficoInvestimentos = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categorias,
        datasets: [{
          data: valores,
          backgroundColor: [
            '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', 
            '#FF5722', '#607D8B', '#00BCD4', '#8BC34A'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Distribuição de Investimentos por Categoria',
            color: '#ffffff'
          },
          legend: {
            position: 'bottom',
            labels: {
              color: '#ffffff'
            }
          }
        }
      }
    });
  }
  
  function formatarValor(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }