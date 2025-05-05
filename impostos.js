function registrarImposto() {
    const tipo = document.getElementById('tipoImposto').value;
    const data = document.getElementById('dataImposto').value;
    const valor = parseFloat(document.getElementById('valorImposto').value);
    const descricao = document.getElementById('descricaoImposto').value;
    const status = document.getElementById('statusImposto').value;
  
    if (!tipo || !data || isNaN(valor) || !descricao || !status) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
  
    const imposto = {
      tipo,
      data,
      valor,
      descricao,
      status,
      mesAno: data.slice(0, 7),
      id: Date.now()
    };
  
    const impostos = JSON.parse(localStorage.getItem('impostos')) || [];
    impostos.push(imposto);
    localStorage.setItem('impostos', JSON.stringify(impostos));
  
    if (status === 'Pago') {
      descontarImpostoDaContaPrincipal(valor);
    }
  
    limparFormularioImpostos();
    renderizarTabelaImpostos();
    verificarAlertasImpostos();
    atualizarSaldos();
  }
  
  function limparFormularioImpostos() {
    document.getElementById('tipoImposto').value = 'DAS';
    document.getElementById('dataImposto').value = '';
    document.getElementById('valorImposto').value = '';
    document.getElementById('descricaoImposto').value = '';
    document.getElementById('statusImposto').value = 'Pendente';
  }
  
  function renderizarTabelaImpostos() {
    const tbody = document.getElementById('tabelaImpostos');
    tbody.innerHTML = '';
  
    const impostos = JSON.parse(localStorage.getItem('impostos')) || [];
  
    impostos.forEach((imposto) => {
      const row = document.createElement('tr');
  
      row.innerHTML = `
        <td>${imposto.tipo}</td>
        <td>${imposto.data}</td>
        <td>${formatarValor(imposto.valor)}</td>
        <td>${imposto.descricao}</td>
        <td>${imposto.status}</td>
        <td>
          ${imposto.status === 'Pendente' ? `<button onclick="marcarComoPago(${imposto.id})">Marcar como Pago</button>` : ''}
          <button onclick="excluirImposto(${imposto.id})">Excluir</button>
        </td>
      `;
  
      tbody.appendChild(row);
    });
  }
  
  function marcarComoPago(id) {
    const impostos = JSON.parse(localStorage.getItem('impostos')) || [];
    const index = impostos.findIndex(imp => imp.id === id);
    if (index >= 0 && impostos[index].status === 'Pendente') {
      impostos[index].status = 'Pago';
      descontarImpostoDaContaPrincipal(impostos[index].valor);
      localStorage.setItem('impostos', JSON.stringify(impostos));
      renderizarTabelaImpostos();
      atualizarSaldos();
    }
  }
  
  function excluirImposto(id) {
    let impostos = JSON.parse(localStorage.getItem('impostos')) || [];
    impostos = impostos.filter(imp => imp.id !== id);
    localStorage.setItem('impostos', JSON.stringify(impostos));
    renderizarTabelaImpostos();
    atualizarSaldos();
  }
  
  function descontarImpostoDaContaPrincipal(valor) {
    let bancos = JSON.parse(localStorage.getItem('bancos')) || [];
    const bancoPrincipal = bancos.find(b => b.principal);
    if (bancoPrincipal) {
      bancoPrincipal.saldo -= valor;
      localStorage.setItem('bancos', JSON.stringify(bancos));
    }
  }
  
  // Verifica se há impostos pendentes com vencimento em até 5 dias
  function verificarAlertasImpostos() {
    const alertaContainer = document.getElementById('alertaImpostos');
    if (!alertaContainer) return;
  
    const hoje = new Date();
    const impostos = JSON.parse(localStorage.getItem('impostos')) || [];
  
    const proximosVencimentos = impostos.filter(imposto => {
      if (imposto.status !== 'Pendente') return false;
      const dataVencimento = new Date(imposto.data);
      const diffDias = (dataVencimento - hoje) / (1000 * 60 * 60 * 24);
      return diffDias >= 0 && diffDias <= 5;
    });
  
    alertaContainer.innerHTML = '';
  
    proximosVencimentos.forEach(imposto => {
      const alerta = document.createElement('div');
      alerta.className = 'alerta';
      alerta.textContent = `⚠️ Imposto "${imposto.tipo}" vence em breve (${imposto.data})`;
      alertaContainer.appendChild(alerta);
    });
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    renderizarTabelaImpostos();
    verificarAlertasImpostos();
  });
  