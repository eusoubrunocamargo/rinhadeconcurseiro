import { useState, useEffect } from 'react';
import type { Simulado } from '../types';
import { getSimulados } from '../services/simulado';
import Layout from '../components/layout/Layout';
import { Link } from 'react-router-dom';


export default function SimuladosList() {
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSimulados();
  }, []);

  async function loadSimulados() {
    try {
      const data = await getSimulados();
      setSimulados(data);
    } catch (err) {
      setError('Erro ao carregar simulados.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Simulados</h1>

      {simulados.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
          <span className="text-5xl block mb-4">📝</span>
          <p>Nenhum simulado disponível no momento.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {simulados.map((simulado) => (
            
            <Link key={simulado.id} to={`/simulados/${simulado.id}`}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="font-semibold text-gray-800 mb-2">
                {simulado.titulo}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Simulado #{simulado.numero}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {simulado.totalQuestoes} questões
                </span>
                <span className="text-blue-600 font-medium">
                  Iniciar
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}