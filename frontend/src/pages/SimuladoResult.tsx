import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { SimuladoDetalhado, RespostaUsuario } from '../types';
import Layout from '../components/layout/Layout';

interface DadosResultado {
  simulado: SimuladoDetalhado;
  respostas: RespostaUsuario[];
}

interface Metricas {
  acertos: number;
  erros: number;
  emBranco: number;
  pontuacao: number;
  percentual: number;
}

export default function SimuladoResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dados, setDados] = useState<DadosResultado | null>(null);
  const [metricas, setMetricas] = useState<Metricas | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`resultado_${id}`);
    if (!stored) {
      navigate('/simulados');
      return;
    }

    const parsed: DadosResultado = JSON.parse(stored);
    setDados(parsed);
    setMetricas(calcularMetricas(parsed));
  }, [id, navigate]);

  function calcularMetricas(dados: DadosResultado): Metricas {
    let acertos = 0;
    let erros = 0;
    let emBranco = 0;

    dados.respostas.forEach((resp) => {
      if (resp.resposta === null) {
        emBranco++;
        return;
      }

      const questao = dados.simulado.questoes.find(q => q.questaoId === resp.questaoId);
      if (!questao) return;

      const gabaritoBoolean = questao.gabarito === 'CERTO';
      if (resp.resposta === gabaritoBoolean) {
        acertos++;
      } else {
        erros++;
      }
    });

    const pontuacao = acertos - erros;
    const total = dados.simulado.questoes.length;
    const percentual = total > 0 ? (acertos / total) * 100 : 0;

    return { acertos, erros, emBranco, pontuacao, percentual };
  }

  function handleRefazer() {
    sessionStorage.removeItem(`resultado_${id}`);
    navigate(`/simulados/${id}`);
  }

  if (!dados || !metricas) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Resultado</h1>
        <p className="text-gray-600">{dados.simulado.titulo}</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{metricas.acertos}</p>
          <p className="text-sm text-gray-500">Acertos</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{metricas.erros}</p>
          <p className="text-sm text-gray-500">Erros</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-gray-400">{metricas.emBranco}</p>
          <p className="text-sm text-gray-500">Em Branco</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className={`text-3xl font-bold ${metricas.pontuacao >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {metricas.pontuacao}
          </p>
          <p className="text-sm text-gray-500">Pontuação</p>
        </div>
      </div>

      {/* Percentual */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700 font-medium">Aproveitamento</span>
          <span className="text-lg font-bold text-gray-800">
            {metricas.percentual.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full">
          <div
            className="h-3 bg-blue-600 rounded-full transition-all"
            style={{ width: `${metricas.percentual}%` }}
          ></div>
        </div>
      </div>

      {/* Gabarito */}
      {/* <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Gabarito</h2>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {dados.simulado.questoes.map((questao, index) => {
            const resposta = dados.respostas.find(r => r.questaoId === questao.questaoId);
            const gabaritoBoolean = questao.gabarito === 'CERTO';
            
            let status: 'acerto' | 'erro' | 'branco' = 'branco';
            if (resposta?.resposta !== null && resposta?.resposta !== undefined) {
              status = resposta.resposta === gabaritoBoolean ? 'acerto' : 'erro';
            }

            const cores = {
              acerto: 'bg-green-100 text-green-700 border-green-300',
              erro: 'bg-red-100 text-red-700 border-red-300',
              branco: 'bg-gray-100 text-gray-500 border-gray-300',
            };

            return (
              <div
                key={questao.id}
                className={`w-full aspect-square flex items-center justify-center rounded-lg border text-sm font-medium ${cores[status]}`}
                title={`Q${index + 1}: Gabarito ${questao.gabarito}`}
              >
                {index + 1}
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
            <span className="text-gray-600">Acerto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
            <span className="text-gray-600">Erro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
            <span className="text-gray-600">Em branco</span>
          </div>
        </div>
      </div> */}
      {/* Questões Erradas */}
{(() => {
  const questoesErradas = dados.simulado.questoes.filter((questao) => {
    const resposta = dados.respostas.find(r => r.questaoId === questao.questaoId);
    if (resposta?.resposta === null || resposta?.resposta === undefined) return false;
    const gabaritoBoolean = questao.gabarito === 'CERTO';
    return resposta.resposta !== gabaritoBoolean;
  });

  if (questoesErradas.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center">
        <span className="text-4xl mb-2 block">🎉</span>
        <p className="text-green-700 font-medium">Parabéns! Você não errou nenhuma questão.</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Questões Erradas ({questoesErradas.length})
      </h2>
      <div className="space-y-4">
        {questoesErradas.map((questao) => {
          const resposta = dados.respostas.find(r => r.questaoId === questao.questaoId);
          const marcou = resposta?.resposta ? 'Certo' : 'Errado';
          
          // Monta a URL de busca no Google
          const textoParaBusca = questao.comando 
            ? questao.comando.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200)
            : '';
          const sites = [
            'site:tecconcursos.com.br',
            'site:grancursosonline.com.br',
            'site:qconcursos.com',
            'site:estrategiaconcursos.com.br'
          ].join(' OR ');
          const urlBusca = `https://www.google.com/search?q=${encodeURIComponent(textoParaBusca + ' ' + sites)}`;

          return (
            <div key={questao.id} className="bg-white rounded-xl shadow-sm p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-blue-600">
                  Questão {questao.ordem}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {questao.materiaNome}{questao.assuntoNome ? ` • ${questao.assuntoNome}` : ''}
                </span>
              </div>

              {/* Texto da questão */}
              {questao.comando && (
                <div 
                  className="text-gray-700 text-sm leading-relaxed mb-4 [&_p]:mb-2 [&_p]:last:mb-0"
                  dangerouslySetInnerHTML={{ __html: questao.comando }}
                />
              )}

              {/* Resposta vs Gabarito */}
              <div className="flex flex-wrap gap-4 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Você marcou:</span>
                  <span className={`font-medium ${resposta?.resposta ? 'text-green-600' : 'text-red-600'}`}>
                    {marcou}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Gabarito:</span>
                  <span className={`font-medium ${questao.gabarito === 'CERTO' ? 'text-green-600' : 'text-red-600'}`}>
                    {questao.gabarito === 'CERTO' ? 'Certo' : 'Errado'}
                  </span>
                </div>
              </div>

              {/* Botão de Pesquisa */}
              
               <Link to={urlBusca}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Pesquisar sobre essa questão
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
})()}

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleRefazer}
          className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Refazer Simulado
        </button>
        <Link
          to="/simulados"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
        >
          Ver Outros Simulados
        </Link>
      </div>
    </Layout>
  );
}