// Auxiliar de chamadas à API Express (SPA -> backend em http://localhost:3001)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data && data.error ? data.error : `Erro ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  //alunos
  listarAlunos: () => request('/alunos'),
  criarAluno: (body) => request('/alunos', { method: 'POST', body: JSON.stringify(body) }),
  atualizarAluno: (id, body) => request(`/alunos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  removerAluno: (id) => request(`/alunos/${id}`, { method: 'DELETE' }),

  //equipamentos
  listarEquipamentos: () => request('/equipamentos'),
  listarDisponiveis: () => request('/equipamentos/disponiveis'),
  criarEquipamento: (body) => request('/equipamentos', { method: 'POST', body: JSON.stringify(body) }),
  atualizarEquipamento: (id, body) => request(`/equipamentos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  mudarStatus: (id, status) => request(`/equipamentos/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  removerEquipamento: (id) => request(`/equipamentos/${id}`, { method: 'DELETE' }),

  //emprestimos
  listarEmprestimos: () => request('/emprestimos'),
  listarAtivos: () => request('/emprestimos/ativos'),
  listarAtrasados: () => request('/emprestimos/atrasados'),
  historico: () => request('/emprestimos/historico'),
  criarEmprestimo: (body) => request('/emprestimos', { method: 'POST', body: JSON.stringify(body) }),
  devolver: (id) => request(`/emprestimos/${id}/devolucao`, { method: 'PUT' }),
};

export const STATUS_LABEL = {
  disponivel: 'Disponível',
  emprestado: 'Emprestado',
  manutencao: 'Em manutenção',
};

export function formatarData(datetime, comHora = true) {
  if (!datetime) return '—';
  const d = new Date(datetime.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return '—';
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  const base = `${dia}/${mes}/${ano}`;
  if (!comHora) return base;
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${base} ${hora}:${min}`;
}

export function dataLimiteParaISO(dataLimite) {
  const partes = dataLimite.split('/');
  if (partes.length !== 3) return dataLimite;
  const [dia, mes, ano] = partes;
  if (dia.length !== 2 || mes.length !== 2 || ano.length !== 4) return dataLimite;
  return `${ano}-${mes}-${dia} 23:59:59`;
}

export function dataLimitePadrao(dias = 7) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${d.getFullYear()}`;
}

export function mascaraData(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 8);
  let saida = digitos;
  if (saida.length > 4) saida = `${saida.slice(0, 2)}/${saida.slice(2, 4)}/${saida.slice(4)}`;
  else if (saida.length > 2) saida = `${saida.slice(0, 2)}/${saida.slice(2)}`;
  return saida;
}

export function diasAtraso(dataLimite) {
  const limite = new Date(dataLimite.replace(' ', 'T'));
  return Math.ceil((Date.now() - limite.getTime()) / (1000 * 60 * 60 * 24));
}