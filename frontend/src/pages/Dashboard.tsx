import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  const firstName = user?.apelido || user?.nome?.split(' ')[0] || 'Usuário';

  return (
    <Layout>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Olá, {firstName}!
        </h1>
        <p className="text-gray-600">
          Pronto para mais uma sessão de estudos?
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        
        <Link to="/simulados" className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <span className="text-4xl">📝</span>
          <div>
            <p className="font-semibold text-gray-800">Simulados</p>
            <p className="text-sm text-gray-500">Pratique com questões CEBRASPE</p>
          </div>
        </Link>

        
        <Link to="/ranking" className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <span className="text-4xl">🏅</span>
          <div>
            <p className="font-semibold text-gray-800">Ranking</p>
            <p className="text-sm text-gray-500">Veja sua posição</p>
          </div>
        </Link>

        <Link to="/estatisticas" className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <span className="text-4xl">📊</span>
          <div>
            <p className="font-semibold text-gray-800">Estatísticas</p>
            <p className="text-sm text-gray-500">Acompanhe seu progresso</p>
          </div>
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Atividade Recente
        </h2>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
          <p>Nenhum simulado realizado ainda.</p>
          <Link to="/simulados" className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium">
            Começar agora
          </Link>
        </div>
      </div>
    </Layout>
  );
}