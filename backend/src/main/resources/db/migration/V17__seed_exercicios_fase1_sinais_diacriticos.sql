-- V17__seed_exercicios_fase1_sinais_diacriticos.sql
-- Fase 1: Sinais Diacríticos | 12 prática (3 rodadas x 4) + 4 desafio

INSERT INTO interage_exercicio
  (id, fase_id, bloco, rodada, ordem_na_rodada, tipo, enunciado, frase_contexto, palavra_alvo, opcoes, gabarito, explicacao, nivel, ativo)
VALUES

-- ── Rodada 1 ────────────────────────────────────────────────────────────────

(1, 1, 'PRATICA', 1, 1, 'A',
 'Qual sinal diacrítico marca a nasalização das vogais a e o?',
 NULL, NULL,
 '[{"id":"A","texto":"Acento agudo"},{"id":"B","texto":"Acento circunflexo"},{"id":"C","texto":"Til"},{"id":"D","texto":"Cedilha"}]',
 'C',
 'O til (~) marca a nasalização das vogais a e o. Ex.: irmã, avião, limões, nação. O til não é acento gráfico — é sinal de nasalização.',
 'BASICO', true),

(2, 1, 'PRATICA', 1, 2, 'A',
 'O acento _______ marca a posição da sílaba tônica e indica timbre aberto da vogal.',
 NULL, NULL,
 '[{"id":"A","texto":"grave"},{"id":"B","texto":"circunflexo"},{"id":"C","texto":"agudo"},{"id":"D","texto":"til"}]',
 'C',
 'O acento agudo (´) marca a sílaba tônica com timbre aberto (vogal pronunciada de forma ampla). Ex.: pé, café, história. O circunflexo marca timbre fechado; o grave marca a crase.',
 'BASICO', true),

(3, 1, 'PRATICA', 1, 3, 'A',
 'Em qual das alternativas a palavra usa corretamente o acento CIRCUNFLEXO?',
 NULL, NULL,
 '[{"id":"A","texto":"pé"},{"id":"B","texto":"avô"},{"id":"C","texto":"café"},{"id":"D","texto":"lá"}]',
 'B',
 '"avô" usa acento circunflexo porque o ô tem timbre fechado. "pé" e "café" usam acento agudo (timbre aberto). "lá" também usa acento agudo. O circunflexo indica sempre vogal tônica com timbre fechado.',
 'BASICO', true),

(4, 1, 'PRATICA', 1, 4, 'D',
 'O til (~) é considerado um dos três acentos gráficos da língua portuguesa.',
 NULL, NULL, NULL,
 'ERRADO',
 'Os três acentos gráficos são: agudo (´), circunflexo (^) e grave (&#96;). O til (~) é um sinal gráfico — seu papel é marcar a nasalização das vogais a e o. Ex.: irmã, nação, limões.',
 'BASICO', true),

-- ── Rodada 2 ────────────────────────────────────────────────────────────────

(5, 1, 'PRATICA', 2, 1, 'A',
 'A cedilha (ç) indica que a letra C tem som de:',
 NULL, NULL,
 '[{"id":"A","texto":"K"},{"id":"B","texto":"SS"},{"id":"C","texto":"X"},{"id":"D","texto":"Z"}]',
 'B',
 'A cedilha indica que a letra C tem som de SS (/s/). Ex.: ação (a-SS-ão), açúcar, reação, criança. Sem a cedilha, o C antes de a, o, u teria som de K.',
 'BASICO', true),

(6, 1, 'PRATICA', 2, 2, 'A',
 'Segundo o Novo Acordo Ortográfico, o trema (¨) é usado em:',
 NULL, NULL,
 '[{"id":"A","texto":"Palavras como linguiça e aguenta"},{"id":"B","texto":"Palavras derivadas de nomes próprios estrangeiros que possuem esse sinal"},{"id":"C","texto":"Qualquer palavra com u pronunciado nos grupos gue/gui/que/qui"},{"id":"D","texto":"Nenhuma palavra da língua portuguesa"}]',
 'B',
 'Com o Novo Acordo Ortográfico (em vigor desde 2009), o trema foi abolido nas palavras portuguesas. Conserva-se apenas em palavras derivadas de nomes próprios estrangeiros: Müller, Hübner, Bünd­chen. "Linguiça" e "aguenta" não usam mais trema.',
 'MEDIO', true),

(7, 1, 'PRATICA', 2, 3, 'D',
 'O apóstrofo é um sinal gráfico que indica a posição da sílaba tônica da palavra.',
 NULL, NULL, NULL,
 'ERRADO',
 'O apóstrofo não é acento gráfico e não indica tonicidade. Sua função é indicar a supressão (queda) de uma vogal. Ex.: caixa d''água (supressão do "e" de "de"). Os acentos gráficos são apenas três: agudo, circunflexo e grave.',
 'BASICO', true),

(8, 1, 'PRATICA', 2, 4, 'A',
 'Qual opção apresenta CORRETAMENTE o uso do acento grave?',
 NULL, NULL,
 '[{"id":"A","texto":"Fui à praia ontem."},{"id":"B","texto":"Chegou à pouco tempo."},{"id":"C","texto":"Comprei à camisa azul."},{"id":"D","texto":"Vou à pé ao trabalho."}]',
 'A',
 '"Fui à praia" está correto: há crase (preposição "a" de movimento + artigo "a" feminino antes de substantivo feminino). Em "à pouco" e "à pé" não há crase — advérbios não admitem artigo feminino. "à camisa" também é incorreto.',
 'MEDIO', true),

-- ── Rodada 3 ────────────────────────────────────────────────────────────────

(9, 1, 'PRATICA', 3, 1, 'D',
 'Cada vocábulo da língua portuguesa pode receber apenas um acento gráfico.',
 NULL, NULL, NULL,
 'CERTO',
 'A regra geral é que cada vocábulo recebe apenas um acento gráfico. A exceção notável é "démodé" (origem francesa), que alguns dicionários grafam com dois acentos. Em formas com pronome mesoclítico (convidá-la-íamos), pode haver dois acentos por representarem, na origem, duas palavras.',
 'MEDIO', true),

(10, 1, 'PRATICA', 3, 2, 'A',
 'Em "órfão", quais sinais diacríticos estão presentes?',
 NULL, NULL,
 '[{"id":"A","texto":"Apenas acento circunflexo"},{"id":"B","texto":"Acento circunflexo e til"},{"id":"C","texto":"Acento agudo e til"},{"id":"D","texto":"Dois acentos gráficos"}]',
 'B',
 '"órfão" tem: circunflexo no ó (tonicidade e timbre fechado) e til no ã (nasalização). O til NÃO é acento gráfico, portanto "órfão" possui apenas um acento gráfico (o circunflexo). A alternativa D está errada por chamar o til de acento gráfico.',
 'MEDIO', true),

(11, 1, 'PRATICA', 3, 3, 'B',
 'Na frase abaixo, clique na palavra que possui acento CIRCUNFLEXO.',
 'O avô comprou um pé de manga no mercado.',
 'avô',
 NULL,
 'avô',
 '"avô" é acentuado com circunflexo porque o ô tem timbre fechado. "pé" é acentuado com acento agudo (timbre aberto). As demais palavras da frase não possuem acento gráfico.',
 'BASICO', true),

(12, 1, 'PRATICA', 3, 4, 'A',
 'Qual das palavras abaixo tem sua tonicidade marcada pelo acento AGUDO?',
 NULL, NULL,
 '[{"id":"A","texto":"avô"},{"id":"B","texto":"pôde"},{"id":"C","texto":"café"},{"id":"D","texto":"também"}]',
 'C',
 '"café" usa acento agudo — vogal tônica com timbre aberto. "avô" e "pôde" usam circunflexo (timbre fechado). "também" usa circunflexo no ê nasal. O acento agudo sempre indica vogal de pronuncia aberta; o circunflexo, fechada.',
 'BASICO', true),

-- ── Desafio ─────────────────────────────────────────────────────────────────

(13, 1, 'DESAFIO', NULL, 1, 'D',
 'A palavra "démodé", de origem francesa, pode ser grafada com dois acentos gráficos, o que representa exceção à regra geral de um acento por vocábulo.',
 NULL, NULL, NULL,
 'CERTO',
 'Segundo dicionários como Aulete e Priberam, "démodé" (fora de moda) é grafada com dois acentos agudos — exceção justificada por sua origem francesa. Isso não contradiz a regra geral, que prevê um acento por vocábulo nativo.',
 'AVANCADO', true),

(14, 1, 'DESAFIO', NULL, 2, 'D',
 'O hífen é utilizado exclusivamente para unir elementos de palavras compostas.',
 NULL, NULL, NULL,
 'ERRADO',
 'O hífen tem múltiplas funções: (1) une palavras compostas (guarda-chuva); (2) liga prefixos a radicais (anti-inflamatório); (3) liga verbos a pronomes oblíquos — ênclise (vê-lo) e mesóclise (dar-te-ei); (4) é usado na separação silábica.',
 'AVANCADO', true),

(15, 1, 'DESAFIO', NULL, 3, 'D',
 'Quando uma palavra acentuada recebe o sufixo -mente ou -zinho, o acento gráfico (agudo ou circunflexo) desaparece.',
 NULL, NULL, NULL,
 'CERTO',
 'Ao acrescentar sufixo (-mente, -zinho, -ismo etc.) a uma palavra acentuada, o acento gráfico é suprimido: herói → heroizinho; econômica → economicamente. Exceção: o til nunca desaparece — irmã → irmãmente, órfão → orfãozinho.',
 'AVANCADO', true),

(16, 1, 'DESAFIO', NULL, 4, 'D',
 'O acento prosódico e o acento gráfico são sinônimos, pois ambos indicam a sílaba tônica de uma palavra.',
 NULL, NULL, NULL,
 'ERRADO',
 'São conceitos distintos. O acento prosódico (ou tônico) pertence à fala — é a força com que se pronuncia a sílaba tônica. Toda palavra tem acento prosódico. O acento gráfico pertence à escrita e aparece em apenas algumas palavras. "Casa" tem acento prosódico (CA-sa) mas não tem acento gráfico.',
 'MEDIO', true);