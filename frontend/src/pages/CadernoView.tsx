import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { CadernoDetalhe, Caderno } from '../types';
import { getCadernoDetalhe } from '../services/tentativa';
import Layout from '../components/layout/Layout';
import DOMPurify from 'dompurify';

const CADERNO_CONFIG: Record<Caderno, { emoji: string; titulo: string; subtitulo: string; bgColor: string }> = {
    VERMELHO: {
        emoji: '🔴',
        titulo: 'Caderno Vermelho',
        subtitulo: 'Revisão crítica - Prioridade alta',
        bgColor: 'from-red-50 to-red-100',
    },
    AMARELO: {
        emoji: '🟡',
        titulo: 'Caderno Amarelo',
        subtitulo: 'Reforço - Prioridade média',
        bgColor: 'from-yellow-50 to-yellow-100',
    },
    VERDE: {
        emoji: '🟢',
        titulo: 'Caderno Verde',
        subtitulo: 'Domínio - Manutenção',
        bgColor: 'from-green-50 to-green-100',
    },
};

const TIPO_RESULTADO_LABELS: Record<string, string> = {
    ACERTO_CONSCIENTE: 'Acerto consciente',
    ACERTO_COM_DUVIDA: 'Acerto com dúvida',
    ACERTO_POR_CHUTE: 'Acerto por chute',
    ERRO_CONTEUDO: 'Erro de conteúdo',
    ERRO_INTERPRETACAO: 'Erro de interpretação',
    ERRO_DISTRACAO: 'Erro por distração',
};

export default function CadernoView() {
    const { caderno } = useParams<{ caderno: string }>();
    const [dados, setDados] = useState<CadernoDetalhe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cadernoUpper = caderno?.toUpperCase() as Caderno;
    const config = CADERNO_CONFIG[cadernoUpper];

    useEffect(() => {
        if (cadernoUpper && config) {
            loadCaderno();
        }
    }, [cadernoUpper]);

    async function loadCaderno() {
        try {
            setLoading(true);
            const data = await getCadernoDetalhe(cadernoUpper);
            setDados(data);
        } catch {
            setError('Erro ao carregar caderno.');
        } finally {
            setLoading(false);
        }
    }

    function gerarUrlBusca(comando?: string): string {
        const sites = [
            'site:tecconcursos.com.br',
            'site:grancursosonline.com.br',
            'site:qconcursos.com',
            'site:estrategiaconcursos.com.br',
        ].join(' OR ');

        const textoParaBusca = comando
            ? comando.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200)
            : '';

        return `https://www.google.com/search?q=${encodeURIComponent(textoParaBusca + ' ' + sites)}`;
    }

    if (!config) {
        return (
            <Layout>
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    Caderno inválido. Use: vermelho, amarelo ou verde.
                </div>
                <Link to="/dashboard" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
                    ← Voltar ao Dashboard
                </Link>
            </Layout>
        );
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
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
                <Link to="/dashboard" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
                    ← Voltar ao Dashboard
                </Link>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Header */}
            <div className={`bg-linear-to-r ${config.bgColor} rounded-xl p-6 mb-6`}>
                <div className="flex items-center gap-4">
                    <span className="text-4xl">{config.emoji}</span>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{config.titulo}</h1>
                        <p className="text-gray-600">{config.subtitulo}</p>
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-4">
                    <span className="text-3xl font-bold text-gray-800">{dados?.totalQuestoes ?? 0}</span>
                    <span className="text-gray-600">questões para revisar</span>
                </div>
            </div>

            {/* Navegação entre cadernos */}
            <div className="flex gap-2 mb-6">
                <Link
                    to="/cadernos/vermelho"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${cadernoUpper === 'VERMELHO'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    🔴 Vermelho
                </Link>
                <Link
                    to="/cadernos/amarelo"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${cadernoUpper === 'AMARELO'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    🟡 Amarelo
                </Link>
                <Link
                    to="/cadernos/verde"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${cadernoUpper === 'VERDE'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    🟢 Verde
                </Link>
            </div>

            {/* Lista de Questões */}
            {!dados || dados.questoes.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                    <span className="text-5xl block mb-4">📋</span>
                    <p>Nenhuma questão neste caderno ainda.</p>
                    <Link to="/simulados" className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium">
                        Fazer um simulado
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {dados.questoes.map((r) => (
                        <details key={r.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                            <summary className="p-4 cursor-pointer hover:bg-gray-50 list-none">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    {/* Lado esquerdo: Questão + Badge */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-blue-600">Questão {r.ordem}</span>
                                        <span
                                            className={`text-xs px-2 py-1 rounded whitespace-nowrap ${r.acertou ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {r.tipoResultado ? TIPO_RESULTADO_LABELS[r.tipoResultado] : ''}
                                        </span>
                                    </div>

                                    {/* Lado direito: Matéria + Seta */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 line-clamp-1">
                                            {r.materiaNome}
                                            {r.assuntoNome ? ` • ${r.assuntoNome}` : ''}
                                        </span>
                                        <svg
                                            className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180 shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </summary>

                            <div className="px-4 pb-4">
                                {/* Texto completo da questão */}
                                {r.comando && (
                                    <div
                                        className="text-gray-700 text-sm leading-relaxed mb-4 p-4 bg-gray-50 rounded-lg [&_p]:mb-3 [&_p]:last:mb-0"
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(r.comando) }}
                                    />
                                )}

                                {/* Comparativo resposta vs gabarito */}
                                <div className="flex gap-4 text-sm mb-3">
                                    <div>
                                        <span className="text-gray-500">Você marcou: </span>
                                        <span
                                            className={
                                                r.resposta === 'CERTO'
                                                    ? 'text-green-600 font-medium'
                                                    : r.resposta === 'ERRADO'
                                                        ? 'text-red-600 font-medium'
                                                        : 'text-gray-400'
                                            }
                                        >
                                            {r.resposta === 'CERTO' ? 'Certo' : r.resposta === 'ERRADO' ? 'Errado' : 'Em branco'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Gabarito: </span>
                                        <span className={r.gabarito === 'CERTO' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                            {r.gabarito === 'CERTO' ? 'Certo' : 'Errado'}
                                        </span>
                                    </div>
                                </div>

                                {/* Link de pesquisa */}
                                {!r.acertou && (

                                    <Link to={gerarUrlBusca(r.comando)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                        Pesquisar sobre essa questão
                                    </Link>
                                )}
                            </div>
                        </details>
                    ))}
                </div>
            )}

            {/* Voltar */}
            <div className="mt-8">
                <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
                    ← Voltar ao Dashboard
                </Link>
            </div>
        </Layout>
    );
}