import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Almoxarifado - Gestão de Materiais',
  description: 'Sistema de gestão de empréstimos do almoxarifado escolar',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="navbar">
          <div className="brand">
            <span className="brand-icon">📦</span>
            <span>Almoxarifado</span>
          </div>
          <nav>
            <Link href="/">Dashboard</Link>
            <Link href="/alunos">Alunos</Link>
            <Link href="/equipamentos">Equipamentos</Link>
            <Link href="/emprestimos">Empréstimos</Link>
            <Link href="/emprestimos/historico">Histórico</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer className="footer">
          Almoxarifado · Next.js + Express + MySQL
        </footer>
      </body>
    </html>
  );
}