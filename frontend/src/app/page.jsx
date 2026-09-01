'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, formatarData, diasAtraso } from '../lib/api';

export default function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [atrasados, setAtrasados] = useState([]);
  const [error, setError] = useState('');

  async function carregar() {
    try {
      const alunos = await api.listarAlunos();
      const equipamentos = await api.listarEquipamentos();
      const ativos = await api.listarAtivos();
      const atrasados = await api.listarAtrasados();

      const disponiveis = equipamentos.filter((e) => e.status === 'disponivel').length;
      const emprestados = equipamentos.filter((e) => e.status === 'emprestado').length;
      const manutencao = equipamentos.filter((e) => e.status === 'manutencao').length;

      setResumo({
        alunos: alunos.length,
        equipamentos: equipamentos.length,
        ativos: ativos.length,
        atrasados: atrasados.length,
        disponiveis,
        emprestados,
        manutencao
      });
      setAtrasados(atrasados);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  if (error) {
    return <div className="msg-error">Erro ao carregar o dashboard: {error}</div>;
  }

  if (!resumo) {
    return <div style={{ color: 'var(--gray-600)' }}>Carregando dados do almoxarifado...</div>;
  }

  return (
    <>
      <h1>Painel de Controle</h1>
      <p className="page-subtitle">Resumo operacional do almoxarifado escolar.</p>

      <div className="grid-cards">
        <div className="stat-card">
          <div className="value">{resumo.alunos}</div>
          <div className="label">Alunos cadastrados</div>
        </div>
        <div className="stat-card">
          <div className="value">{resumo.equipamentos}</div>
          <div className="label">Equipamentos no catálogo</div>
        </div>
        <div className="stat-card">
          <div className="value">{resumo.disponiveis}</div>
          <div className="label">Disponíveis</div>
        </div>
        <div className="stat-card">
          <div className="value">{resumo.emprestados}</div>
          <div className="label">Emprestados</div>
        </div>
        <div className="stat-card">
          <div className="value">{resumo.manutencao}</div>
          <div className="label">Em manutenção</div>
        </div>
        <div className="stat-card warning">
          <div className="value">{resumo.atrasados}</div>
          <div className="label">Empréstimos atrasados</div>
        </div>
        <div className="stat-card">
          <div className="value">{resumo.ativos}</div>
          <div className="label">Empréstimos ativos</div>
        </div>
      </div>

      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 12 }}>
        Empréstimos em atraso
      </h2>
      {atrasados.length === 0 ? (
        <div className="msg-success">Nenhum empréstimo em atraso. Tudo em dia.</div>
      ) : (
        <div className="alert-box">
          <h3>{atrasados.length} empréstimo(s) vencido(s), sem devolução.</h3>
          <div style={{ overflow: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Equipamento</th>
                  <th>Aluno</th>
                  <th>Retirada</th>
                  <th>Data limite</th>
                  <th>Atraso</th>
                </tr>
              </thead>
              <tbody>
                {atrasados.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.equipamento_nome}
                      <br />
                      <span style={{ color: 'var(--gray-600)', fontSize: 12.5 }}>{p.numero_patrimonio}</span>
                    </td>
                    <td>
                      {p.aluno_nome} <span style={{ color: 'var(--gray-600)', fontSize: 12.5 }}>({p.matricula})</span>
                    </td>
                    <td>{formatarData(p.data_retirada)}</td>
                    <td>{formatarData(p.data_limite, false)}</td>
                    <td>
                      <span className="badge badge-atrasado">
                        {diasAtraso(p.data_limite)} dia(s)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Link className="link" href="/emprestimos">Ir para Empréstimos →</Link>
      </div>
    </>
  );
}