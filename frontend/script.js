const API_URL = 'http://localhost:3000';

const toast = document.getElementById('toast');
const usuariosTabela = document.getElementById('usuariosTabela');
const postsTabela = document.getElementById('postsTabela');
const resultadoUsuario = document.getElementById('resultadoUsuario');

let toastTimeout;

function mostrarMensagem(texto, tipo = '') {
  clearTimeout(toastTimeout);

  toast.textContent = texto;
  toast.className = `toast ${tipo} mostrar`;

  toastTimeout = setTimeout(() => {
    toast.classList.remove('mostrar');
    toast.classList.add('esconder');

    setTimeout(() => {
      toast.className = 'toast';
      toast.textContent = '';
    }, 300);
  }, 5000);
}

async function requisicao(endpoint, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${endpoint}`, opcoes);
  const contentType = resposta.headers.get('content-type') || '';
  const dados = contentType.includes('application/json') ? await resposta.json() : null;

  if (!resposta.ok) {
    throw new Error(dados?.message || dados?.error || `Erro HTTP ${resposta.status}`);
  }

  return dados;
}

async function listarUsuarios() {
  try {
    usuariosTabela.innerHTML = '<tr><td colspan="5">Carregando usuários...</td></tr>';
    const usuarios = await requisicao('/users');

    if (!usuarios || usuarios.length === 0) {
      usuariosTabela.innerHTML = '<tr><td colspan="5">Nenhum usuário cadastrado.</td></tr>';
      return;
    }

    usuariosTabela.innerHTML = usuarios.map(usuario => `
      <tr>
        <td>${usuario.id}</td>
        <td>${usuario.name || ''}</td>
        <td>${usuario.email || ''}</td>
        <td>${usuario.cpf || ''}</td>
        <td>
          <button class="perigo" type="button" onclick="excluirUsuario(${usuario.id})">Excluir</button>
        </td>
      </tr>
    `).join('');
  } catch (erro) {
    usuariosTabela.innerHTML = '<tr><td colspan="5">Erro ao carregar usuários.</td></tr>';
    mostrarMensagem("Erro ao listar usuários.", 'erro');
  }
}

async function buscarUsuario(evento) {
  evento.preventDefault();

  const id = document.getElementById('buscarUserId').value;

  try {
    const usuario = await requisicao(`/users/${id}`);

    resultadoUsuario.innerHTML = `
      <p><strong>ID:</strong> ${usuario.id}</p>
      <p><strong>Nome:</strong> ${usuario.name || ''}</p>
      <p><strong>Email:</strong> ${usuario.email || ''}</p>
      <p><strong>CPF:</strong> ${usuario.cpf || ''}</p>
    `;

    mostrarMensagem('Usuário encontrado com sucesso.', 'sucesso');
  } catch (erro) {
    resultadoUsuario.textContent = 'Nenhum usuário encontrado.';
    mostrarMensagem("Erro ao buscar usuário.", 'erro');
  }
}

async function criarUsuario(evento) {
  evento.preventDefault();

  const usuario = {
    name: document.getElementById('userName').value,
    email: document.getElementById('userEmail').value,
    cpf: document.getElementById('userCpf').value
  };

  try {
    await requisicao('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario)
    });

    evento.target.reset();
    await listarUsuarios();
    mostrarMensagem('Usuário cadastrado com sucesso.', 'sucesso');
  } catch (erro) {
    mostrarMensagem("Erro ao cadastrar usuário.", 'erro');
  }
}

async function excluirUsuario(id) {
  if (!confirm(`Deseja excluir o usuário ${id}?`)) return;

  try {
    await requisicao(`/users/${id}`, { method: 'DELETE' });
    await listarUsuarios();
    mostrarMensagem('Usuário excluído com sucesso.', 'sucesso');
  } catch (erro) {
    mostrarMensagem("Erro ao excluir usuário.", 'erro');
  }
}

async function criarPost(evento) {
  evento.preventDefault();

  const authorId = document.getElementById('postAuthorId').value;

  const post = {
    title: document.getElementById('postTitle').value,
    content: document.getElementById('postContent').value,
    tag: document.getElementById('postTag').value
  };

  try {
    await requisicao(`/users/${authorId}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });

    evento.target.reset();
    mostrarMensagem('Post criado com sucesso.', 'sucesso');

    if (document.getElementById('listarPostsAuthorId').value === authorId) {
      await listarPosts();
    }
  } catch (erro) {
    mostrarMensagem("Erro ao criar post.", 'erro');
  }
}

async function listarPosts(evento) {
  if (evento) evento.preventDefault();

  const authorId = document.getElementById('listarPostsAuthorId').value;

  if (!authorId) {
    postsTabela.innerHTML = '<tr><td colspan="5">Informe o ID do usuário para buscar posts.</td></tr>';
    return;
  }

  try {
    postsTabela.innerHTML = '<tr><td colspan="5">Carregando posts...</td></tr>';
    const posts = await requisicao(`/users/${authorId}/posts`);

    if (!posts || posts.length === 0) {
      postsTabela.innerHTML = '<tr><td colspan="5">Nenhum post encontrado.</td></tr>';
      mostrarMensagem('Busca concluída. Nenhum post encontrado.', 'sucesso');
      return;
    }

    postsTabela.innerHTML = posts.map(post => `
      <tr>
        <td>${post.id}</td>
        <td>${post.title || ''}</td>
        <td>${post.content || ''}</td>
        <td>${post.tag || ''}</td>
        <td>${post.authorId}</td>
      </tr>
    `).join('');

    mostrarMensagem('Posts carregados com sucesso.', 'sucesso');
  } catch (erro) {
    postsTabela.innerHTML = '<tr><td colspan="5">Erro ao carregar posts.</td></tr>';
    mostrarMensagem("Erro ao carregar posts.", 'erro');
  }
}

async function atualizarPost(evento) {
  evento.preventDefault();

  const id = document.getElementById('updatePostId').value;

  const post = {
    title: document.getElementById('updatePostTitle').value,
    content: document.getElementById('updatePostContent').value,
    tag: document.getElementById('updatePostTag').value
  };

  try {
    await requisicao(`/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });

    evento.target.reset();
    await listarPosts();
    mostrarMensagem('Post atualizado com sucesso.', 'sucesso');
  } catch (erro) {
    mostrarMensagem("Erro ao atualizar post.", 'erro');
  }
}

async function excluirPost(evento) {
  evento.preventDefault();

  const id = document.getElementById('deletePostId').value;

  if (!confirm(`Deseja excluir o post ${id}?`)) return;

  try {
    await requisicao(`/posts/${id}`, { method: 'DELETE' });
    evento.target.reset();
    await listarPosts();
    mostrarMensagem('Post excluído com sucesso.', 'sucesso');
  } catch (erro) {
    mostrarMensagem("Erro ao excluir post.", 'erro');
  }
}

document.getElementById('formCriarUsuario').addEventListener('submit', criarUsuario);
document.getElementById('formBuscarUsuario').addEventListener('submit', buscarUsuario);
document.getElementById('formCriarPost').addEventListener('submit', criarPost);
document.getElementById('formListarPosts').addEventListener('submit', listarPosts);
document.getElementById('formAtualizarPost').addEventListener('submit', atualizarPost);
document.getElementById('formExcluirPost').addEventListener('submit', excluirPost);
document.getElementById('btnAtualizarUsuarios').addEventListener('click', listarUsuarios);

listarUsuarios();