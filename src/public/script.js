
// FinanSys Core -

let dadosAtuais = [];
let dadosFiltrados = [];
let paginaAtual = 1;
let tipoAtual = 'receber';
const ITENS_POR_PAGINA = 50;

const ROTAS = {
  receber: 'contas-receber',
  pagar: 'contas-pagar',
  fluxo: 'fluxo-caixa',
  dre: 'dre'
};


// UTILITÁRIOS DE TELA 

function mostrarTela(tela) {
  const loginScreen = document.getElementById('login-screen');
  const cadastroScreen = document.getElementById('cadastro-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  
  // Força ocultar todas as telas
  if (loginScreen) loginScreen.style.display = 'none';
  if (cadastroScreen) cadastroScreen.style.display = 'none';
  if (dashboardScreen) dashboardScreen.style.display = 'none';
  
  // Mostra apenas a tela solicitada
  if (tela === 'login' && loginScreen) {
    loginScreen.style.display = 'block';
    loginScreen.style.visibility = 'visible';
  } else if (tela === 'cadastro' && cadastroScreen) {
    cadastroScreen.style.display = 'block';
    cadastroScreen.style.visibility = 'visible';
  } else if (tela === 'dashboard' && dashboardScreen) {
    dashboardScreen.style.display = 'block';
    dashboardScreen.style.visibility = 'visible';
    
    // Carrega a primeira aba do dashboard
    setTimeout(() => {
      const primeiroBotao = document.querySelector('.nav-btn[data-tipo="receber"]');
      if (primeiroBotao) {
        primeiroBotao.click();
      } else if (typeof carregarDados === 'function') {
        carregarDados('receber');
      }
    }, 100);
  }
}

function mostrarLogin() { 
  mostrarTela('login'); 
}

function mostrarCadastro() { 
  mostrarTela('cadastro'); 
}

function mostrarDashboard() { 
  mostrarTela('dashboard'); 
}


// AUTENTICAÇÃO

function getToken() {
  return localStorage.getItem('token');
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario_nome');
  mostrarLogin();
}


// CARREGAR DADOS


async function carregarDados(tipo) {
  console.log('Carregando:', tipo);
  
  const rota = ROTAS[tipo];
  if (!rota) return;
  
  tipoAtual = tipo;
  
  const token = getToken();
  if (!token) return;
  
  const tabelaBody = document.getElementById('tabela-body');
  if (tabelaBody) {
    tabelaBody.innerHTML = '<tr><td colspan="10">Carregando...<\/td></tr>';
  }
  
  try {
    const response = await fetch(`http://localhost:3333/api/${rota}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 401) {
      alert('Sessão expirada. Faça login novamente.');
      logout();
      return;
    }
    
    const data = await response.json();
    dadosAtuais = data || [];
    dadosFiltrados = [...dadosAtuais];
    paginaAtual = 1;
    
    renderizarTabela();
    renderizarPaginacao();
    
    const btnAdd = document.getElementById('btn-add-conta');
    if (btnAdd) {
      btnAdd.style.display = (tipo === 'receber' || tipo === 'pagar') ? 'flex' : 'none';
    }
  } catch (error) {
    console.error('Erro:', error);
    if (tabelaBody) {
      tabelaBody.innerHTML = '<tr><td colspan="10">Erro ao carregar dados<\/td></tr>';
    }
  }
}


// RENDERIZAR TABELA

function renderizarTabela() {
  const thead = document.getElementById('tabela-head');
  const tbody = document.getElementById('tabela-body');
  
  if (!thead || !tbody) return;
  
  if (!dadosFiltrados || dadosFiltrados.length === 0) {
    thead.innerHTML = '<td><th>Nenhum dado encontrado</th></tr>';
    tbody.innerHTML = '';
    return;
  }
  
  const colunas = Object.keys(dadosFiltrados[0]);
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const fim = inicio + ITENS_POR_PAGINA;
  const paginaDados = dadosFiltrados.slice(inicio, fim);
  
  thead.innerHTML = `<tr>${colunas.map(c => `<th>${formatarCabecalho(c)}</th>`).join('')}</tr>`;
  tbody.innerHTML = paginaDados.map(linha => {
    return `<tr>${colunas.map(c => `<td>${formatarValor(c, linha[c])}</td>`).join('')}</tr>`;
  }).join('');
  
  if (tipoAtual === 'receber' || tipoAtual === 'pagar') {
    adicionarBotoesAcao();
  }
}

function formatarCabecalho(campo) {
  const mapa = {
    id: 'ID', nu_registro: 'ID',
    documento: 'Documento', de_documento: 'Documento',
    cliente: 'Cliente', no_cliente_cartao: 'Cliente',
    valor: 'Valor', vr_areceber: 'Valor a Receber', vr_apagar: 'Valor a Pagar',
    dt_cadastro: 'Cadastro', data_cadastro: 'Cadastro',
    dt_prevista: 'Previsão', data_prevista: 'Previsão',
    observacao: 'Observação'
  };
  return mapa[campo] || campo;
}

function formatarValor(campo, valor) {
  if (valor === null || valor === undefined) return '—';
  
  if (campo === 'valor' || campo === 'vr_areceber' || campo === 'vr_apagar') {
    const num = parseFloat(valor);
    return isNaN(num) ? '—' : num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  
  if (campo.includes('dt_') || campo === 'data_prevista' || campo === 'data_mov') {
    try {
      return new Date(valor).toLocaleDateString('pt-BR');
    } catch {
      return valor;
    }
  }
  
  return valor;
}

// BOTÕES DE AÇÃO 


function adicionarBotoesAcao() {
  const linhas = document.querySelectorAll('#tabela-body tr');
  
  linhas.forEach(linha => {
    if (linha.querySelector('.coluna-acoes')) return;
    
    const id = linha.cells[0]?.textContent;
    if (!id) return;
    
    const celulaAcao = document.createElement('td');
    celulaAcao.className = 'coluna-acoes';
    celulaAcao.style.textAlign = 'center';
    
    const btnEditar = document.createElement('button');
    btnEditar.textContent = '✏️';
    btnEditar.className = 'btn-editar';
    btnEditar.onclick = () => editarRegistro(id);
    
    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = '🗑️';
    btnExcluir.className = 'btn-excluir';
    btnExcluir.onclick = () => excluirRegistro(id);
    
    celulaAcao.appendChild(btnEditar);
    celulaAcao.appendChild(btnExcluir);
    linha.appendChild(celulaAcao);
  });
}

// EDITAR REGISTRO

async function editarRegistro(id) {
  const registro = dadosAtuais.find(r => r.id == id || r.nu_registro == id);
  if (!registro) {
    alert('Registro não encontrado');
    return;
  }
  
  const modalTitle = document.getElementById('modal-title');
  const contaId = document.getElementById('conta-id');
  const documentoInput = document.getElementById('documento');
  const clienteInput = document.getElementById('cliente');
  const valorInput = document.getElementById('valor');
  const dataPrevistaInput = document.getElementById('data_prevista');
  const observacaoInput = document.getElementById('observacao');
  const labelCliente = document.getElementById('label-cliente');
  const modal = document.getElementById('modal-conta');
  
  if (modalTitle) modalTitle.textContent = 'Editar Conta';
  if (contaId) contaId.value = id;
  if (documentoInput) documentoInput.value = registro.documento || '';
  if (clienteInput) clienteInput.value = registro.cliente || '';
  if (valorInput) valorInput.value = registro.valor || '';
  if (dataPrevistaInput) dataPrevistaInput.value = registro.data_prevista || registro.dt_prevista || '';
  if (observacaoInput) observacaoInput.value = registro.observacao || '';
  
  const isReceber = tipoAtual === 'receber';
  if (labelCliente) labelCliente.style.display = isReceber ? 'block' : 'none';
  if (clienteInput) clienteInput.style.display = isReceber ? 'block' : 'none';
  
  if (modal) modal.style.display = 'flex';
}

// EXCLUIR REGISTRO

async function excluirRegistro(id) {
  if (!confirm('Tem certeza que deseja excluir este registro?')) return;
  
  const token = getToken();
  const endpoint = tipoAtual === 'receber' ? 'contas-receber' : 'contas-pagar';
  
  try {
    const response = await fetch(`http://localhost:3333/api/${endpoint}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      alert('Registro excluído com sucesso!');
      carregarDados(tipoAtual);
    } else {
      const data = await response.json();
      alert(data.error || 'Erro ao excluir');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro de conexão');
  }
}


// MODAL (CRIAR/EDITAR)


function configurarModal() {
  const modal = document.getElementById('modal-conta');
  const fechar = document.querySelector('.modal-fechar');
  const btnAdd = document.getElementById('btn-add-conta');
  
  if (btnAdd) {
    btnAdd.onclick = () => {
      const modalTitle = document.getElementById('modal-title');
      const contaId = document.getElementById('conta-id');
      const formConta = document.getElementById('form-conta');
      const labelCliente = document.getElementById('label-cliente');
      const clienteInput = document.getElementById('cliente');
      
      if (modalTitle) modalTitle.textContent = 'Nova Conta';
      if (contaId) contaId.value = '';
      if (formConta) formConta.reset();
      
      const isReceber = tipoAtual === 'receber';
      if (labelCliente) labelCliente.style.display = isReceber ? 'block' : 'none';
      if (clienteInput) clienteInput.style.display = isReceber ? 'block' : 'none';
      
      if (modal) modal.style.display = 'flex';
    };
  }
  
  if (fechar) {
    fechar.onclick = () => {
      if (modal) modal.style.display = 'none';
    };
  }
  
  window.onclick = (e) => {
    if (modal && e.target === modal) {
      modal.style.display = 'none';
    }
  };
  
  const formConta = document.getElementById('form-conta');
  if (formConta) {
    formConta.onsubmit = async (e) => {
      e.preventDefault();
      
      const id = document.getElementById('conta-id')?.value;
      const token = getToken();
      const endpoint = tipoAtual === 'receber' ? 'contas-receber' : 'contas-pagar';
      const url = id ? `http://localhost:3333/api/${endpoint}/${id}` : `http://localhost:3333/api/${endpoint}`;
      const method = id ? 'PUT' : 'POST';
      
      const body = {
        documento: document.getElementById('documento')?.value || '',
        valor: parseFloat(document.getElementById('valor')?.value || 0),
        data_prevista: document.getElementById('data_prevista')?.value || '',
        observacao: document.getElementById('observacao')?.value || ''
      };
      
      if (tipoAtual === 'receber') {
        body.cliente = document.getElementById('cliente')?.value || '';
      }
      
      if (!body.documento || !body.valor || !body.data_prevista) {
        alert('Preencha todos os campos obrigatórios!');
        return;
      }
      
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          alert(data.message || 'Operação realizada com sucesso!');
          if (modal) modal.style.display = 'none';
          carregarDados(tipoAtual);
        } else {
          alert(data.error || 'Erro ao salvar');
        }
      } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão');
      }
    };
  }
}


// PAGINAÇÃO


function renderizarPaginacao() {
  const totalPaginas = Math.ceil((dadosFiltrados?.length || 0) / ITENS_POR_PAGINA);
  const container = document.getElementById('paginacao');
  if (!container) return;
  
  if (totalPaginas <= 1) {
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = (i === paginaAtual) ? 'pagina ativa' : 'pagina';
    btn.onclick = () => {
      paginaAtual = i;
      renderizarTabela();
      renderizarPaginacao();
    };
    container.appendChild(btn);
  }
}


// PESQUISA E FILTROS


function pesquisar(termo) {
  if (!termo || termo.trim() === '') {
    dadosFiltrados = [...dadosAtuais];
  } else {
    const termoLower = termo.toLowerCase();
    dadosFiltrados = dadosAtuais.filter(obj =>
      Object.values(obj).some(v => String(v).toLowerCase().includes(termoLower))
    );
  }
  paginaAtual = 1;
  renderizarTabela();
  renderizarPaginacao();
}

function filtrarPorData() {
  const inicio = document.getElementById('inicio')?.value;
  const fim = document.getElementById('fim')?.value;
  
  if (!inicio && !fim) {
    dadosFiltrados = [...dadosAtuais];
  } else {
    dadosFiltrados = dadosAtuais.filter(item => {
      const dataItem = new Date(item.dt_prevista || item.data_prevista || item.dt_cadastro);
      if (inicio && dataItem < new Date(inicio)) return false;
      if (fim && dataItem > new Date(fim)) return false;
      return true;
    });
  }
  paginaAtual = 1;
  renderizarTabela();
  renderizarPaginacao();
}


// LOGIN


async function fazerLogin(usuario, senha) {
  try {
    const response = await fetch('http://localhost:3333/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, senha })
    });
    
    const data = await response.json();
    
    if (response.ok && data.sucesso) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario_nome', data.nome);
      return { sucesso: true, nome: data.nome };
    } else {
      return { sucesso: false, erro: data.error || 'Credenciais inválidas' };
    }
  } catch (error) {
    console.error('Erro no login:', error);
    return { sucesso: false, erro: 'Erro de conexão com o servidor' };
  }
}

// CADASTRO


async function fazerCadastro(usuario, nome, senha) {
  try {
    const response = await fetch('http://localhost:3333/api/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: usuario, nome, senha })
    });
    
    const data = await response.json();
    
    // Sucesso: status 201 (Created)
    if (response.status === 201) {
      return { sucesso: true, message: data.message };
    }
    
    // Conflito: usuário já existe
    if (response.status === 409) {
      return { sucesso: false, erro: 'Este nome de usuário já está em uso. Escolha outro.' };
    }
    
    // Outros erros
    return { sucesso: false, erro: data.error || 'Erro ao cadastrar' };
    
  } catch (error) {
    console.error('Erro de rede no cadastro:', error);
    return { sucesso: false, erro: 'Erro de conexão com o servidor' };
  }
}


// EVENTOS E INICIALIZAÇÃO


document.addEventListener('DOMContentLoaded', () => {
  console.log(' Inicializando FinanSys Core...');
  
  // LOGIN 
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const usuario = document.getElementById('usuario')?.value.trim() || '';
      const senha = document.getElementById('senha')?.value || '';
      const resposta = document.getElementById('resposta');
      const submitBtn = loginForm.querySelector('button');
      
      if (!usuario || !senha) {
        if (resposta) {
          resposta.innerText = 'Preencha usuário e senha.';
          resposta.style.color = 'red';
        }
        return;
      }
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Entrando...';
      }
      
      const result = await fazerLogin(usuario, senha);
      
      if (result.sucesso) {
        if (resposta) {
          resposta.innerText = `Bem-vindo, ${result.nome}! Redirecionando...`;
          resposta.style.color = 'green';
        }
        setTimeout(() => mostrarDashboard(), 1000);
      } else {
        if (resposta) {
          resposta.innerText = result.erro;
          resposta.style.color = 'red';
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Entrar';
        }
      }
    });
  }
  
  // CADASTRO 
  const cadastroForm = document.getElementById('cadastro-form');
  if (cadastroForm) {
    cadastroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const usuario = document.getElementById('cadastro-usuario')?.value.trim() || '';
      const nome = document.getElementById('cadastro-nome')?.value.trim() || '';
      const senha = document.getElementById('cadastro-senha')?.value || '';
      const confirmar = document.getElementById('cadastro-confirmar-senha')?.value || '';
      const resposta = document.getElementById('cadastro-resposta');
      const submitBtn = cadastroForm.querySelector('button');
      
      if (!usuario || !nome || !senha) {
        if (resposta) {
          resposta.innerText = 'Preencha todos os campos.';
          resposta.style.color = 'red';
        }
        return;
      }
      
      if (senha !== confirmar) {
        if (resposta) {
          resposta.innerText = 'As senhas não coincidem.';
          resposta.style.color = 'red';
        }
        return;
      }
      
      if (senha.length < 6) {
        if (resposta) {
          resposta.innerText = 'A senha deve ter no mínimo 6 caracteres.';
          resposta.style.color = 'red';
        }
        return;
      }
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Cadastrando...';
      }
      
      const result = await fazerCadastro(usuario, nome, senha);
      
      if (result.sucesso) {
        if (resposta) {
          resposta.innerText = result.message + ' Agora faça login.';
          resposta.style.color = 'green';
        }
        setTimeout(() => mostrarLogin(), 2000);
      } else {
        if (resposta) {
          resposta.innerText = result.erro;
          resposta.style.color = 'red';
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Cadastrar';
        }
      }
    });
  }
  
  // LINKS DE NAVEGAÇÃO 
  const criarContaLink = document.getElementById('criar-conta-link');
  if (criarContaLink) {
    criarContaLink.addEventListener('click', (e) => {
      e.preventDefault();
      mostrarCadastro();
    });
  }
  
  const voltarLoginLink = document.getElementById('voltar-login-link');
  if (voltarLoginLink) {
    voltarLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      mostrarLogin();
    });
  }
  
  // CAMPO DE PESQUISA 
  const filtrosDiv = document.querySelector('.filtros');
  if (filtrosDiv) {
    const inputPesquisa = document.createElement('input');
    inputPesquisa.placeholder = '🔍 Pesquisar...';
    inputPesquisa.className = 'input-pesquisa';
    inputPesquisa.oninput = (e) => pesquisar(e.target.value);
    filtrosDiv.appendChild(inputPesquisa);
  }
  
  // CONTAINER DE PAGINAÇÃO 
  const mainContent = document.querySelector('.dashboard-content');
  if (mainContent && !document.getElementById('paginacao')) {
    const pagDiv = document.createElement('div');
    pagDiv.id = 'paginacao';
    pagDiv.className = 'paginacao';
    mainContent.appendChild(pagDiv);
  }
  
  // BOTÕES DE NAVEGAÇÃO 
  const botoes = document.querySelectorAll('.nav-btn');
  botoes.forEach(btn => {
    const tipo = btn.getAttribute('data-tipo');
    if (tipo && tipo !== 'sair') {
      btn.onclick = () => {
        botoes.forEach(b => b.classList.remove('ativo'));
        btn.classList.add('ativo');
        carregarDados(tipo);
      };
    }
  });
  
  // BOTÃO DE LOGOUT 
  const btnLogout = document.getElementById('logout-btn');
  if (btnLogout) {
    btnLogout.onclick = () => logout();
  }
  
  // BOTÃO FILTRAR 
  const btnFiltrar = document.querySelector('.filtros button');
  if (btnFiltrar) {
    btnFiltrar.onclick = () => filtrarPorData();
  }
  
  // MODAL 
  configurarModal();
  
  // VERIFICAR SESSÃO 
  const token = getToken();
  if (token) {
    mostrarDashboard();
  } else {
    mostrarLogin();
  }
});