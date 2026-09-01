'use client';

import { useEffect, useState } from 'react';
import { api, formatarData } from '../../../lib/api';

export default function Historico() {
  const [historico, setHistorico] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        setHistorico(await api.historico());
      } catch (e) {
        setError(e.message);
      }
    }
    carregar();
  }, []);

  if (error) {
    return <div className="msg-error">{error}</div>;
  }

  return (
    <>
      <h1>Histórico de Empréstimos</h1>
      <p className="page-subtitle">
        Registro completo e imutável. Por regra de negócio, os empréstimos nunca são eliminados,
        garantindo a rastreabilidade de quem usou cada equipamento.
      </p>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Equipamento</th>
              <th>Aluno</th>
              <th>Retirada</th>
              <th>Limite</th>
              <th>Devolução</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {historico.length === 0 && (
              <tr><td colSpan="6" style={{ color: 'var(--gray-600)' }}>Ainda não há empréstimos registrados.</td></tr>
            )}
            {historico.map((p) => (
              <tr key={p.id}>
                <td>{p.equipamento_nome}</td>
                <td>{p.aluno_nome} <span style={{ color: 'var(--gray-600)', fontSize: 12.5 }}>({p.matricula})</span></td>
                <td>{formatarData(p.data_retirada)}</td>
                <td>{formatarData(p.data_limite, false)}</td>
                <td>{formatarData(p.data_devolucao, false)}</td>
                <td>
                  {p.data_devolucao ? (
                    <span className="badge badge-devolvido">Devolvido</span>
                  ) : (
                    <span className="badge badge-atrasado">Pendente</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}