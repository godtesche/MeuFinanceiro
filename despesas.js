document.addEventListener('DOMContentLoaded', function() {
  // Inicializa o formulário e carrega as despesas
  const formDespesa = document.getElementById('formDespesa');
  if (formDespesa) {
    formDespesa.addEventListener('submit', function(e) {
      e.preventDefault();
      cadastrarDespesa();
    });
  }
  
  carregarDespesas();
});

// Função para formatar data no formato brasileiro
function formatarData(dataString) {
  if (!dataString) return '';
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dataString).toLocaleDateString('pt-BR', options);
}

// Função para cadastrar nova despesa
function cadastrarDespesa() {
  // Obter valores dos campos
  const data = document.getElementById('dataDespesa').value;
  const descricao = document.getElementById('descricaoDespesa').value.trim();
  const categoria = document.getElementById('categoriaDespesa').value;
  const valorInput = document.getElementById('valorDespesa');
  const valor = parseFloat(valorInput.value);

  // Validação dos campos
  if (!data) {
    alert('Por favor, informe a data da despesa');
    document.getElementById('dataDespesa').focus();
    return;
  }

  if (descricao.length < 3) {
    alert('A descrição deve ter pelo menos 3 caracteres');
    document.getElementById('descricaoDespesa').focus();
    return;
  }

  if (!categoria) {
    alert('Por favor, selecione uma categoria');
    document.getElementById('categoriaDespesa').focus();
    return;
  }

  if (isNaN(valor)) {
    alert('Por favor, informe um valor numérico válido');
    valorInput.focus();
    return;
  }

  if (valor <= 0) {
    alert('O valor deve ser maior que zero');
    valorInput.focus();
    return;
  }

  // Obter ou inicializar array de despesas
  const despesas = JSON.parse(localStorage.getItem('despesas')) || [];

  // Criar nova despesa
  const novaDespesa = {
    id: Date.now(), // ID único baseado no timestamp
    data,
    descricao,
    categoria,
    valor,
    paga: false
  };

  // Adicionar ao array e salvar no localStorage
  despesas.push(novaDespesa);
  localStorage.setItem('despesas', JSON.stringify(despesas));

  // Feedback visual
  const btnSubmit = document.querySelector('#formDespesa button[type="submit"]');
  btnSubmit.textContent = '✓ Cadastrado!';
  btnSubmit.classList.add('success');
  
  setTimeout(() => {
    btnSubmit.textContent = 'Cadastrar Despesa';
    btnSubmit.classList.remove('success');
  }, 2000);

  // Limpar formulário e recarregar lista
  document.getElementById('formDespesa').reset();
  carregarDespesas();
}

// Função para carregar e exibir as despesas
function carregarDespesas() {
  const despesas = JSON.parse(localStorage.getItem('despesas')) || [];
  const corpoTabela = document.getElementById('tabelaDespesasBody');
  corpoTabela.innerHTML = '';

  // Ordenar despesas por data (mais recente primeiro)
  despesas.sort((a, b) => new Date(b.data) - new Date(a.data));

  if (despesas.length === 0) {
    corpoTabela.innerHTML = '<tr><td colspan="6" style="text-align:center">Nenhuma despesa cadastrada</td></tr>';
    return;
  }

  despesas.forEach((despesa, index) => {
    const tr = document.createElement('tr');
    tr.dataset.id = despesa.id;
    if (despesa.paga) {
      tr.classList.add('paga');
    }
    
    tr.innerHTML = `
      <td>${formatarData(despesa.data)}</td>
      <td>${despesa.descricao}</td>
      <td>${despesa.categoria}</td>
      <td>R$ ${despesa.valor.toFixed(2).replace('.', ',')}</td>
      <td>${despesa.paga ? 'Paga' : 'Pendente'}</td>
      <td class="acoes">
        ${!despesa.paga
          ? `<button class="btn-pagar" onclick="pagarDespesa(${index})">Pagar</button>`
          : `<button class="btn-reverter" onclick="reverterDespesa(${index})">Reverter</button>`}
        <button class="btn-excluir" onclick="excluirDespesa(${index})">Excluir</button>
      </td>
    `;
    corpoTabela.appendChild(tr);
  });
}

// Função para marcar despesa como paga
function pagarDespesa(index) {
  const despesas = JSON.parse(localStorage.getItem('despesas')) || [];
  const bancos = JSON.parse(localStorage.getItem('bancos')) || [];

  if (index < 0 || index >= despesas.length) {
    alert('Despesa não encontrada');
    return;
  }

  const despesa = despesas[index];
  if (despesa.paga) {
    alert('Esta despesa já está paga');
    return;
  }

  const bancoPrincipal = bancos.find(b => b.principal);
  if (!bancoPrincipal) {
    alert('Nenhuma conta bancária principal definida');
    return;
  }

  if (bancoPrincipal.saldo < despesa.valor) {
    alert(`Saldo insuficiente na conta ${bancoPrincipal.nome}`);
    return;
  }

  if (confirm(`Confirmar pagamento de R$ ${despesa.valor.toFixed(2)} para "${despesa.descricao}"?`)) {
    // Atualizar saldo do banco
    bancoPrincipal.saldo -= despesa.valor;
    
    // Atualizar status da despesa
    despesa.paga = true;
    despesa.dataPagamento = new Date().toISOString().split('T')[0];
    
    // Salvar alterações
    localStorage.setItem('bancos', JSON.stringify(bancos));
    localStorage.setItem('despesas', JSON.stringify(despesas));
    
    // Recarregar dados
    carregarDespesas();
    if (typeof carregarBancos === 'function') {
      carregarBancos();
    }
  }
}

// Função para reverter despesa paga
function reverterDespesa(index) {
  const despesas = JSON.parse(localStorage.getItem('despesas')) || [];
  const bancos = JSON.parse(localStorage.getItem('bancos')) || [];

  if (index < 0 || index >= despesas.length) {
    alert('Despesa não encontrada');
    return;
  }

  const despesa = despesas[index];
  if (!despesa.paga) {
    alert('Esta despesa já está como pendente');
    return;
  }

  const bancoPrincipal = bancos.find(b => b.principal);
  if (!bancoPrincipal) {
    alert('Nenhuma conta bancária principal definida');
    return;
  }

  if (confirm(`Reverter pagamento de R$ ${despesa.valor.toFixed(2)} para "${despesa.descricao}"?`)) {
    // Estornar valor para o banco
    bancoPrincipal.saldo += despesa.valor;
    
    // Atualizar status da despesa
    despesa.paga = false;
    delete despesa.dataPagamento;
    
    // Salvar alterações
    localStorage.setItem('bancos', JSON.stringify(bancos));
    localStorage.setItem('despesas', JSON.stringify(despesas));
    
    // Recarregar dados
    carregarDespesas();
    if (typeof carregarBancos === 'function') {
      carregarBancos();
    }
  }
}

// Função para excluir despesa
function excluirDespesa(index) {
  const despesas = JSON.parse(localStorage.getItem('despesas')) || [];

  if (index < 0 || index >= despesas.length) {
    alert('Despesa não encontrada');
    return;
  }

  const despesa = despesas[index];
  
  if (confirm(`Tem certeza que deseja excluir a despesa "${despesa.descricao}" no valor de R$ ${despesa.valor.toFixed(2)}?`)) {
    // Remover despesa do array
    despesas.splice(index, 1);
    
    // Salvar alterações
    localStorage.setItem('despesas', JSON.stringify(despesas));
    
    // Recarregar lista
    carregarDespesas();
  }
}