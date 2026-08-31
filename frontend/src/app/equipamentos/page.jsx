'use client';

import { useEffect, useState } from 'react';
import { api, STATUS_LABEL } from '../../lib/api';

export default function Equipamentos() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [form, setForm] = useState({ id: null, nome: '', numero_patrimonio: '', status: 'disponivel' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function carregar() {
    try {
      setEquipamentos(await api.listarEquipamentos());
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function editar(eq) {
    setForm({ id: eq.id, nome: eq.nome, numero_patrimonio: eq.numero_patrimonio, status: eq.status });
    setSuccess('');
    setError('');
  }

  function novo() {
    setForm({ id: null, nome: '', numero_patrimonio: '', status: 'disponivel' });
    setError('');
    setSuccess('');
  }

  async function salvar(e) {
    e.preventDefault();
    try {
      if (form.id) {
        await api.atualizarEquipamento(form.id, {
          nome: form.nome,
          numero_patrimonio: form.numero_patrimonio,
          status: form.status
        });
        setSuccess('Equipamento atualizado com sucesso.');
      } else {
        await api.criarEquipamento({
          nome: form.nome,
          numero_patrimonio: form.numero_patrimonio,
          status: form.status
        });
        setSuccess('Equipamento cadastrado com sucesso.');
      }
      setError('');
      setForm({ id: null, nome: '', numero_patrimonio: '', status: 'disponivel' });
      await carregar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function mudarStatus(eq, status) {
    try {
      await api.mudarStatus(eq.id, status);
      setSuccess('Status atualizado.');
      setError('');
      await carregar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remover(id) {
    if (!confirm('Remover este equipamento?')) return;
    try {
      await api.removerEquipamento(id);
      setSuccess('Equipamento removido.');
      await carregar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <h1>Catálogo de Equipamentos</h1>
      <p className="page-subtitle">Gerencie os materiais do almoxarifado e seu status.</p>

      {error && <div className="msg-error">{error}</div>}
      {success && <div className="msg-success">{success}</div>}

      <div className="card">
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>
          {form.id ? 'Editar Equipamento' : 'Novo Equipamento'}
        </h2>
        <form className="form-grid" onSubmit={salvar}>
          <div className="field">
            <label>Nome</label>
            <input name="nome" value={form.nome} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Nº de Patrimônio</label>
            <input name="numero_patrimonio" value={form.numero_patrimonio} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="disponivel">Disponível</option>
              <option value="emprestado">Emprestado</option>
              <option value="manutencao">Em manutenção</option>
            </select>
          </div>
          <div style={{ alignSelf: 'flex-end', display: 'flex', gap: 8 }}>
            <button type="submit" className="btn">{form.id ? 'Salvar alterações' : 'Cadastrar'}</button>
            {form.id && (
              <button type="button" className="btn btn-outline" onClick={novo}>Cancelar</button>
            )}
          </div>
        </form>
      </div>

      <div className="card mt-4">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Patrimônio</th>
              <th>Status</th>
              <th style={{ width: 260 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {equipamentos.length === 0 && (
              <tr><td colSpan="5">Nenhum equipamento cadastrado.</td></tr>
            )}
            {equipamentos.map((eq) => (
              <tr key={eq.id}>
                <td>{eq.id}</td>
                <td>{eq.nome}</td>
                <td>{eq.numero_patrimonio}</td>
                <td>
                  <span className={`badge badge-${eq.status}`}>
                    {STATUS_LABEL[eq.status] || eq.status}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button className="btn btn-sm btn-outline" onClick={() => editar(eq)}>Editar</button>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => mudarStatus(eq, eq.status === 'manutencao' ? 'disponivel' : 'manutencao')}
                    >
                      {eq.status === 'manutencao' ? 'Liberar' : 'Manutenção'}
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => remover(eq.id)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}