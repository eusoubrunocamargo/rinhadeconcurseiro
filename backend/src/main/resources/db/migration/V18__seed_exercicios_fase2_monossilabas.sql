-- V18__seed_exercicios_fase2_monossílabas.sql
-- Fase 2: Monossílabas Tônicas | 12 prática (3 rodadas x 4) + 4 desafio

INSERT INTO interage_exercicio
  (id, fase_id, bloco, rodada, ordem_na_rodada, tipo, enunciado, frase_contexto, palavra_alvo, opcoes, gabarito, explicacao, nivel, ativo)
VALUES

-- ── Rodada 1 ────────────────────────────────────────────────────────────────

(17, 2, 'PRATICA', 1, 1, 'A',
 'Acentuam-se as monossílabas tônicas terminadas em:',
 NULL, NULL,
 '[{"id":"A","texto":"-a(s), -i(s), -u(s)"},{"id":"B","texto":"-e(s), -o(s), -em"},{"id":"C","texto":"-a(s), -e(s), -o(s)"},{"id":"D","texto":"qualquer vogal tônica"}]',
 'C',
 'A regra abrange apenas as terminadas em -a(s), -e(s) e -o(s). Ex.: má/más, trás, pé/pés, mês, só/sós, pôs. Monossílabas com outras terminações — fim, bem, lei, mais — não recebem acento gráfico.',
 'BASICO', true),

(18, 2, 'PRATICA', 1, 2, 'A',
 'Qual das monossílabas tônicas abaixo NÃO deve ser acentuada graficamente?',
 NULL, NULL,
 '[{"id":"A","texto":"pé"},{"id":"B","texto":"já"},{"id":"C","texto":"só"},{"id":"D","texto":"fim"}]',
 'D',
 '"fim" é monossílaba tônica terminada em -m, não contemplada pela regra (-a(s), -e(s), -o(s)). "pé" (-e), "já" (-a) e "só" (-o) são corretamente acentuadas.',
 'BASICO', true),

(19, 2, 'PRATICA', 1, 3, 'D',
 'A palavra "mais" não recebe acento gráfico porque é monossílaba átona.',
 NULL, NULL, NULL,
 'ERRADO',
 '"mais" é monossílaba TÔNICA, não átona. Não recebe acento porque termina em -ais (ditongo + s), e não nas terminações simples -a(s), -e(s) ou -o(s). "Más" (plural de "má") leva acento por terminar em -as.',
 'BASICO', true),

(20, 2, 'PRATICA', 1, 4, 'A',
 'Qual alternativa apresenta APENAS monossílabas tônicas corretamente acentuadas?',
 NULL, NULL,
 '[{"id":"A","texto":"pé, já, só, mês, pôs"},{"id":"B","texto":"pé, há, mais, mês"},{"id":"C","texto":"pé, já, fim, só"},{"id":"D","texto":"pé, já, lei, mês"}]',
 'A',
 '"pé" (-e), "já" (-a), "só" (-o), "mês" (-es), "pôs" (-os) — todas terminadas em -a(s), -e(s) ou -o(s). "mais" termina em -ais (sem acento). "fim" termina em -im (sem acento). "lei" termina em -ei, ditongo (sem acento).',
 'BASICO', true),

-- ── Rodada 2 ────────────────────────────────────────────────────────────────

(21, 2, 'PRATICA', 2, 1, 'D',
 'Ao aplicar as regras de acentuação, os pronomes oblíquos átonos ligados ao verbo não são contados como sílaba. Assim, "dá-lo" é acentuado pela regra das monossílabas tônicas.',
 NULL, NULL, NULL,
 'CERTO',
 'Ignora-se o pronome oblíquo átono ao acentuar: "dá-lo" sem o "-lo" = "dá" (monossílaba tônica terminada em -a). Outros exemplos: "vê-los" = "vê" (monossílaba -e), "pô-lo" = "pô" (monossílaba -o).',
 'MEDIO', true),

(22, 2, 'PRATICA', 2, 2, 'A',
 'Qual das palavras abaixo é monossílaba ÁTONA e, portanto, jamais recebe acento gráfico?',
 NULL, NULL,
 '[{"id":"A","texto":"pé"},{"id":"B","texto":"há"},{"id":"C","texto":"a (artigo feminino)"},{"id":"D","texto":"só"}]',
 'C',
 'O artigo feminino "a" é monossílaba átona — não tem autonomia fonética, apoiando-se na palavra seguinte. Monossílabas átonas incluem: artigos (o, a), preposições (de, em, por), conjunções (e, mas, que) e pronomes oblíquos átonos. Nunca são acentuadas.',
 'BASICO', true),

(23, 2, 'PRATICA', 2, 3, 'D',
 '"Fé" e "café" são acentuadas pela mesma regra de acentuação.',
 NULL, NULL, NULL,
 'ERRADO',
 'Pela classificação tradicional, "fé" é monossílaba tônica (regra das monossílabas) e "café" é oxítona terminada em -é (regra das oxítonas). São regras formalmente distintas, embora o resultado prático seja idêntico. Atenção: algumas bancas, com base no Novo Acordo, tratam ambas como oxítonas.',
 'MEDIO', true),

(24, 2, 'PRATICA', 2, 4, 'A',
 'Qual monossílaba tônica NÃO recebe acento gráfico por não se encaixar nas terminações exigidas pela regra?',
 NULL, NULL,
 '[{"id":"A","texto":"pé"},{"id":"B","texto":"já"},{"id":"C","texto":"lei"},{"id":"D","texto":"só"}]',
 'C',
 '"lei" é monossílaba tônica, mas termina em -ei (ditongo), não em -e isolado. A regra exige -e(s) como terminação simples. "pé" (-e), "já" (-a) e "só" (-o) recebem acento. Outros sem acento: rei, sol, fim, bem, mais.',
 'MEDIO', true),

-- ── Rodada 3 ────────────────────────────────────────────────────────────────

(25, 2, 'PRATICA', 3, 1, 'A',
 'Em qual opção NENHUMA das monossílabas precisa de acento gráfico?',
 NULL, NULL,
 '[{"id":"A","texto":"mais, fim, bem"},{"id":"B","texto":"pé, fim, não"},{"id":"C","texto":"já, mês, mais"},{"id":"D","texto":"só, pé, bem"}]',
 'A',
 '"mais" (-ais), "fim" (-im) e "bem" (-em) são monossílabas tônicas que não seguem as terminações -a(s), -e(s), -o(s). Nenhuma leva acento. Nas demais opções há pelo menos uma que deve ser acentuada.',
 'AVANCADO', true),

(26, 2, 'PRATICA', 3, 2, 'A',
 '"dá-lo" é acentuado por qual regra?',
 NULL, NULL,
 '[{"id":"A","texto":"Monossílabas tônicas: o pronome é ignorado e resta \"dá\" (1 sílaba, terminada em -a)"},{"id":"B","texto":"Oxítonas: o pronome não altera a classificação da forma verbal"},{"id":"C","texto":"Paroxítonas: o pronome adiciona sílabas à palavra"},{"id":"D","texto":"Acentos diferenciais: para distinguir do infinitivo \"dar\""}]',
 'A',
 'Ignorando "-lo", resta "dá" — monossílaba tônica terminada em -a. Se a forma verbal, após ignorar o pronome, tiver mais de uma sílaba, aplica-se a regra das oxítonas (ex.: "comprá-las" → "comprá", 2 sílabas, oxítona).',
 'AVANCADO', true),

(27, 2, 'PRATICA', 3, 3, 'D',
 '"Trás" (advérbio de lugar) e "traz" (forma do verbo trazer) diferenciam-se graficamente pela presença ou ausência do acento.',
 NULL, NULL, NULL,
 'CERTO',
 '"trás" (para trás) recebe acento por ser monossílaba tônica terminada em -ás. "traz" (ele traz o livro) não recebe acento — termina em -az. A distinção gráfica é importante e muito cobrada pelo CEBRASPE.',
 'MEDIO', true),

(28, 2, 'PRATICA', 3, 4, 'B',
 'Na frase abaixo, clique na monossílaba tônica que DEVE ser acentuada.',
 'Deu um pé de mato ao cão que rosnou no fim da tarde.',
 'pé',
 NULL,
 'pé',
 '"pé" é monossílaba tônica terminada em -e, portanto acentuada. "deu" termina em -eu (ditongo). "fim" termina em -im, sem acento. "cão" tem til. "tarde" é paroxítona.',
 'BASICO', true),

-- ── Desafio ─────────────────────────────────────────────────────────────────

(29, 2, 'DESAFIO', NULL, 1, 'D',
 '"Comprá-las" é acentuada pela regra das monossílabas tônicas, pois ao ignorar o pronome oblíquo, resta uma sílaba terminada em -a.',
 NULL, NULL, NULL,
 'ERRADO',
 'Ao ignorar "-las", resta "comprá" — que tem DUAS sílabas (com-PRÁ), não uma. Portanto é oxítona, e a acentuação segue a regra das OXÍTONAS terminadas em -a. A regra das monossílabas aplica-se apenas quando o resultado tem uma sílaba, como "dá-lo" = "dá".',
 'AVANCADO', true),

(30, 2, 'DESAFIO', NULL, 2, 'D',
 '"Vê-los" é acentuada pela regra das monossílabas tônicas terminadas em -e.',
 NULL, NULL, NULL,
 'CERTO',
 'Ignorando "-los", resta "vê" — monossílaba tônica terminada em -e. Outros exemplos: "dá-lo" (dá = monossílaba -a), "pô-lo" (pô = monossílaba -o). Quando o resultado tem 2+ sílabas, aplica-se a regra das oxítonas.',
 'AVANCADO', true),

(31, 2, 'DESAFIO', NULL, 3, 'D',
 'Monossílabas átonas como os artigos "o" e "a", as preposições "de", "em" e "por" e a conjunção "e" nunca recebem acento gráfico.',
 NULL, NULL, NULL,
 'CERTO',
 'Monossílabas átonas não têm autonomia fonética — apoiam-se em palavras adjacentes. A lista completa inclui: artigos (o, a, os, as), pronomes oblíquos átonos, preposições (a, com, de, em, por, sem, sob), conjunções (e, nem, mas, ou, que, se) e formas de tratamento (dom, frei, são, seu).',
 'MEDIO', true),

(32, 2, 'DESAFIO', NULL, 4, 'D',
 'A palavra "pôs" (pretérito perfeito do verbo pôr) é acentuada tanto pela regra das monossílabas tônicas quanto pela função de acento diferencial.',
 NULL, NULL, NULL,
 'CERTO',
 '"pôs" recebe acento circunflexo: (1) pela regra das monossílabas tônicas terminadas em -o(s); e (2) pela função diferencial, distinguindo o pretérito perfeito "pôs" (ele pôs o livro ontem) da preposição "por" e do prefixo "pos-". Dupla justificativa aceita pelas bancas.',
 'AVANCADO', true);