'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [form, setForm] = useState({ id: null, nome: '', matricula: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function carregar() {
    try {
      setAlunos(await api.listarAlunos());
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

  function editar(a) {
    setForm({ id: a.id, nome: a.nome, matricula: a.matricula });
    setSuccess('');
    setError('');
  }

  function novo() {
    setForm({ id: null, nome: '', matricula: '' });
    setError('');
    setSuccess('');
  }

  async function salvar(e) {
    e.preventDefault();
    try {
      if (form.id) {
        await api.atualizarAluno(form.id, { nome: form.nome, matricula: form.matricula });
        setSuccess('Aluno atualizado com sucesso.');
      } else {
        await api.criarAluno({ nome: form.nome, matricula: form.matricula });
        setSuccess('Aluno cadastrado com sucesso.');
      }
      setError('');
      setForm({ id: null, nome: '', matricula: '' });
      await carregar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remover(id) {
    if (!confirm('Remover este aluno?')) return;
    try {
      await api.removerAluno(id);
      setSuccess('Aluno removido.');
      await carregar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <h1>Cadastro de Alunos</h1>
      <p className="page-subtitle">Gerencie os alunos que podem retirar materiais.</p>

      {error && <div className="msg-error">{error}</div>}
      {success && <div className="msg-success">{success}</div>}

      <div className="card">
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>
          {form.id ? 'Editar Aluno' : 'Novo Aluno'}
        </h2>
        <form className="form-grid" onSubmit={salvar}>
          <div className="field">
            <label>Nome</label>
            <input name="nome" value={form.nome} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Matrícula</label>
            <input name="matricula" value={form.matricula} onChange={handleChange} required />
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
              <th>Matrícula</th>
              <th style={{ width: 160 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunos.length === 0 && (
              <tr><td colSpan="4">Nenhum aluno cadastrado.</td></tr>
            )}
            {alunos.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.nome}</td>
                <td>{a.matricula}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-sm btn-outline" onClick={() => editar(a)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => remover(a.id)}>Excluir</button>
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