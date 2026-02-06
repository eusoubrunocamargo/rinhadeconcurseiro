import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🏆 Rinha de Concurseiro
        </h1>
        <p className="text-gray-600 mb-6">
          Sistema de simulados para concursos
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Entrar com Google
        </button>
      </div>
    </div>
  )
}

export default App

