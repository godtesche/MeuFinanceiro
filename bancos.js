// Função para cadastrar um banco
function cadastrarBanco() {
    const nome = document.getElementById('bancoNome').value;
    const saldoInicial = parseFloat(document.getElementById('saldoInicial').value);
    const principal = document.getElementById('principal').checked;

    if (!nome || isNaN(saldoInicial)) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    const banco = {
      nome: nome,
      saldo: saldoInicial,
      principal: principal,
    };

    // Salva o banco no localStorage
    let bancos = JSON.parse(localStorage.getItem('bancos')) || [];
    bancos.push(banco);
    localStorage.setItem('bancos', JSON.stringify(bancos));

    // Limpar os campos de entrada após o cadastro
    document.getElementById('bancoNome').value = '';
    document.getElementById('saldoInicial').value = '';
    document.getElementById('principal').checked = false;

    carregarBancos();  // Atualiza a lista de bancos
    atualizarSaldos(); // Atualiza os saldos e lembretes
}

// Função para carregar a lista de bancos cadastrados (para tabela e select)
function carregarBancos() {
    const saldosElement = document.getElementById('saldos');
    const bancoSelect = document.getElementById('bancoSelect');
    let bancos = JSON.parse(localStorage.getItem('bancos')) || [];

    // Atualiza a tabela de bancos
    saldosElement.innerHTML = '';  // Limpa a lista antes de preencher
    bancos.forEach((banco, index) => {
        const row = document.createElement('tr');  // Cria uma nova linha para a tabela

        // Adiciona as células com os dados
        row.innerHTML = `
            <td>${banco.nome}</td>
            <td>R$ ${banco.saldo.toFixed(2)}</td>
            <td><button onclick="deletarBanco(${index})">Excluir</button></td>
        `;

        // Adiciona a linha à tabela
        saldosElement.appendChild(row);
    });

    // Atualiza o select de bancos na aba de movimentações
    bancoSelect.innerHTML = '';  // Limpa o conteúdo do <select> antes de adicionar novos bancos

    // Adiciona uma opção inicial, caso não haja bancos cadastrados
    if (bancos.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Nenhum banco cadastrado';
        bancoSelect.appendChild(option);
    } else {
        bancos.forEach((banco, index) => {
            const option = document.createElement('option');
            option.value = index;  // Usando o índice como valor
            option.textContent = banco.nome;  // Exibe o nome do banco
            bancoSelect.appendChild(option);
        });
    }
}

// Função para excluir um banco
function deletarBanco(index) {
    let bancos = JSON.parse(localStorage.getItem('bancos')) || [];
    bancos.splice(index, 1);  // Remove o banco da lista
    localStorage.setItem('bancos', JSON.stringify(bancos));

    carregarBancos();  // Atualiza a lista após exclusão
    atualizarSaldos(); // Atualiza os saldos e lembretes
}

// Função para atualizar os saldos na tela principal
function atualizarSaldos() {
    const bancos = JSON.parse(localStorage.getItem('bancos')) || [];
    const investimentos = JSON.parse(localStorage.getItem('investimentos')) || [];

    let saldoTotal = 0;
    let saldoPrincipal = 0;

    // Calcular os saldos totais e principais
    bancos.forEach(banco => {
        saldoTotal += banco.saldo;
        if (banco.principal) saldoPrincipal += banco.saldo;
    });

    // Calcular o total de investimentos
    const totalInvestimentos = investimentos.reduce((acc, inv) => acc + inv.valor, 0);

    // Atualizar os elementos na tela com os valores calculados
    document.getElementById('saldoContaPrincipal').textContent = formatarValor(saldoPrincipal);
    document.getElementById('saldoTotal').textContent = formatarValor(saldoTotal);
    document.getElementById('saldoInvestimentos').textContent = formatarValor(totalInvestimentos);

    // Atualiza a reserva de investimentos
    renderizarReserva(totalInvestimentos);
}

// Função de renderização da reserva de investimentos (caso haja)
function renderizarReserva(totalInvestimentos) {
    document.getElementById('reservaValor').textContent = formatarValor(totalInvestimentos);
}

// Função para formatar valores
function formatarValor(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função chamada ao inicializar a página para carregar os bancos
function inicializar() {
    carregarBancos();  // Carrega os bancos
    atualizarSaldos(); // Atualiza os saldos
}

// Chama a função para inicializar a exibição dos bancos
inicializar();
