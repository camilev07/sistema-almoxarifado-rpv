'use client';

import { useEffect, useState } from 'react';
import { api, formatarData, dataLimitePadrao, dataLimiteParaISO, mascaraData } from '../../lib/api';

export default function Emprestimos() {
  const [alunos, setAlunos] = useState([]);
  const [disponiveis, setDisponiveis] = useState([]);
  const [ativos, setAtivos] = useState([]);
  const [form, setForm] = useState({ aluno_id: '', equipamento_id: '', data_limite: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function carregar() {
    try {
      const [alunos, disponiveis, ativos] = await Promise.all([
        api.listarAlunos(),
        api.listarDisponiveis(),
        api.listarAtivos()
      ]);
      setAlunos(alunos);
      setDisponiveis(disponiveis);
      setAtivos(ativos);
      setForm((f) => ({
        ...f,
        aluno_id: f.aluno_id || (alunos[0] ? String(alunos[0].id) : ''),
        equipamento_id: f.equipamento_id || (disponiveis[0] ? String(disponiveis[0].id) : ''),
        data_limite: f.data_limite || dataLimitePadrao()
      }));
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'data_limite') {
      setForm({ ...form, data_limite: mascaraData(value) });
      return;
    }
    setForm({ ...form, [name]: value });
  }

  async function registrarEmprestimo(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.criarEmprestimo({
        aluno_id: Number(form.aluno_id),
        equipamento_id: Number(form.equipamento_id),
        data_limite: dataLimiteParaISO(form.data_limite)
      });
      setSuccess('Empréstimo registrado com sucesso.');
      setForm({ aluno_id: '', equipamento_id: '', data_limite: dataLimitePadrao() });
      await carregar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function registrarDevolucao(id) {
    if (!confirm('Registrar devolução deste empréstimo?')) return;
    try {
      await api.devolver(id);
      setSuccess('Devolução registrada. Equipamento liberado.');
      setError('');
      await carregar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <h1>Empréstimos</h1>
      <p className="page-subtitle">Registre a retirada de materiais e a devolução.</p>

      {error && <div className="msg-error">{error}</div>}
      {success && <div className="msg-success">{success}</div>}

      <div className="card">
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 16 }}>
          Registrar nova retirada
        </h2>
        <form className="form-grid" onSubmit={registrarEmprestimo}>
          <div className="field">
            <label>Aluno</label>
            <select name="aluno_id" value={form.aluno_id} onChange={handleChange} required>
              <option value="">Selecione...</option>
              {alunos.map((a) => (
                <option key={a.id} value={a.id}>{a.nome} ({a.matricula})</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Equipamento (somente disponíveis)</label>
            <select name="equipamento_id" value={form.equipamento_id} onChange={handleChange} required>
              <option value="">Selecione...</option>
              {disponiveis.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nome} — {eq.numero_patrimonio}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Data limite de devolução</label>
            <input
              type="text"
              name="data_limite"
              value={form.data_limite}
              onChange={handleChange}
              placeholder="dd/mm/aaaa"
              inputMode="numeric"
              maxLength={10}
              required
            />
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <button type="submit" className="btn">Iniciar empréstimo</button>
          </div>
        </form>
      </div>

      <div className="card mt-4">
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 16 }}>
          Empréstimos em andamento
        </h2>
        <table>
          <thead>
            <tr>
              <th>Equipamento</th>
              <th>Aluno</th>
              <th>Retirada</th>
              <th>Data limite</th>
              <th>Situação</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {ativos.length === 0 && (
              <tr><td colSpan="6" style={{ color: 'var(--gray-600)' }}>Nenhum empréstimo em andamento.</td></tr>
            )}
            {ativos.map((p) => (
              <tr key={p.id}>
                <td>{p.equipamento_nome}</td>
                <td>{p.aluno_nome} <span style={{ color: 'var(--gray-600)', fontSize: 12.5 }}>({p.matricula})</span></td>
                <td>{formatarData(p.data_retirada)}</td>
                <td>{formatarData(p.data_limite, false)}</td>
                <td>
                  {p.atrasado ? (
                    <span className="badge badge-atrasado">EM ATRASO</span>
                  ) : (
                    <span className="badge badge-emprestado">No prazo</span>
                  )}
                </td>
                <td>
                  <button className="btn btn-sm btn-success" onClick={() => registrarDevolucao(p.id)}>
                    Devolver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}