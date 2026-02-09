import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            Rinha de Concurseiro
          </h1>
          
          <div className="flex items-center gap-4">
            {/* Foto e nome do usuário */}
            <div className="flex items-center gap-3">
              {user?.fotoPerfil ? (
                <img
                  src={user.fotoPerfil}
                  alt={user.nome}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {user?.nome?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-gray-700 hidden sm:inline">
                {user?.nome}
              </span>
            </div>

            {/* Botão Logout */}
            <button
              onClick={logout}
              className="text-gray-500 hover:text-gray-700 text-sm cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Card de Boas-vindas */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Olá, {user?.nome?.split(' ')[0]}! 
          </h2>
          <p className="text-gray-600">
            Pronto para mais uma sessão de estudos?
          </p>
        </div>

        {/* Card de Ações */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            O que deseja fazer?
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Botão Simulados */}
            <button
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left cursor-pointer"
              onClick={() => alert('Em breve: Lista de Simulados')}
            >
              <span className="text-3xl">📝</span>
              <div>
                <p className="font-medium text-gray-800">Simulados</p>
                <p className="text-sm text-gray-500">Pratique com questões CEBRASPE</p>
              </div>
            </button>

            {/* Botão Ranking */}
            <button
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left cursor-pointer"
              onClick={() => alert('Em breve: Ranking')}
            >
              <span className="text-3xl">🏅</span>
              <div>
                <p className="font-medium text-gray-800">Ranking</p>
                <p className="text-sm text-gray-500">Veja sua posição</p>
              </div>
            </button>
          </div>
        </div>

        {/* Info de Debug (remover depois) */}
        <details className="mt-6 text-sm text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">
            Debug: Dados do usuário
          </summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </details>
      </main>
    </div>
  );
}