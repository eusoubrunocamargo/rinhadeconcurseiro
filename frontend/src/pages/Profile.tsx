import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateApelido } from '../services/user';
import Layout from '../components/layout/Layout';

export default function Profile() {
  const { user, refreshUser } = useAuth();

  const [apelido, setApelido] = useState(user?.apelido || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await updateApelido(apelido);
      await refreshUser();
      setMessage({ type: 'success', text: 'Apelido atualizado com sucesso!' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar apelido.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Meu Perfil</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Card de Informações */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            {user?.fotoUrl ? (
              <img
                src={user.fotoUrl}
                alt={user.nome}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                {user?.nome?.charAt(0).toUpperCase()}
              </div>
            )}

            <h2 className="text-xl font-semibold text-gray-800">
              {user?.nome}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {user?.email}
            </p>

            {user?.apelido && (
              <span className="inline-block mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {user.apelido}
              </span>
            )}
          </div>
        </div>

        {/* Card de Edição */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Editar Perfil
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="apelido"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Apelido
                </label>
                <input
                  type="text"
                  id="apelido"
                  value={apelido}
                  onChange={(e) => setApelido(e.target.value)}
                  placeholder="Como quer ser chamado no ranking?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  maxLength={30}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Máximo 30 caracteres. Será exibido no ranking.
                </p>
              </div>

              {/* Mensagem de feedback */}
              {message && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    message.type === 'success'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </form>
          </div>

          {/* Card de Estatísticas (placeholder) */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Estatísticas
            </h3>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-800">0</p>
                <p className="text-sm text-gray-500">Simulados</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-800">0%</p>
                <p className="text-sm text-gray-500">Aproveitamento</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-800">-</p>
                <p className="text-sm text-gray-500">Ranking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}