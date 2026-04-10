-- V20__seed_exercicios_fase4_paroxitonas.sql
-- Fase 4: Paroxítonas | 12 prática (3 rodadas x 4) + 4 desafio

INSERT INTO interage_exercicio
  (id, fase_id, bloco, rodada, ordem_na_rodada, tipo, enunciado, frase_contexto, palavra_alvo, opcoes, gabarito, explicacao, nivel, ativo)
VALUES

-- ── Rodada 1 ────────────────────────────────────────────────────────────────

(49, 4, 'PRATICA', 1, 1, 'A',
 'Paroxítonas terminadas em quais terminações NÃO recebem acento gráfico?',
 NULL, NULL,
 '[{"id":"A","texto":"-l, -n, -r, -x"},{"id":"B","texto":"-a(s), -e(s), -o(s), -em(-ens)"},{"id":"C","texto":"-um, -us, -i, -is"},{"id":"D","texto":"ditongo crescente ou decrescente"}]',
 'B',
 'Paroxítonas em -a(s), -e(s), -o(s), -em(-ens) são a esmagadora maioria e por isso NÃO recebem acento. Todas as demais terminações (minoria) recebem: -l (fácil), -n (hífen), -r (caráter), -x (tórax), -i (júri), -is (lápis), -us (vírus), -um (fórum), ditongos (história) etc.',
 'BASICO', true),

(50, 4, 'PRATICA', 1, 2, 'A',
 'Qual palavra é paroxítona acentuada por terminar em -r?',
 NULL, NULL,
 '[{"id":"A","texto":"caráter"},{"id":"B","texto":"café"},{"id":"C","texto":"sofá"},{"id":"D","texto":"médico"}]',
 'A',
 '"caráter" = ca-RÁ-ter — paroxítona terminada em -r. A terminação -r não está na lista das sem acento (-a, -e, -o, -em), por isso leva acento. "café" e "sofá" são oxítonas. "médico" é proparoxítona. Outro exemplo: açúcar (a-ÇÚ-car).',
 'BASICO', true),

(51, 4, 'PRATICA', 1, 3, 'D',
 '"Fácil" é acentuada por ser paroxítona terminada em -l.',
 NULL, NULL, NULL,
 'CERTO',
 'A terminação -l não está na lista das paroxítonas sem acento, portanto paroxítonas terminadas em -l sempre são acentuadas: fácil, amável, difícil, possível, útil. O acento identifica a sílaba tônica e diferencia da maioria não acentuada.',
 'BASICO', true),

(52, 4, 'PRATICA', 1, 4, 'B',
 'Na frase abaixo, clique em uma paroxítona corretamente acentuada.',
 'O fórum do júri avaliou o caráter do suspeito.',
 'júri',
 NULL,
 'júri',
 '"júri" = JÚ-ri — paroxítona terminada em -i, recebe acento. "fórum" = FÓ-rum — paroxítona terminada em -um. "caráter" = ca-RÁ-ter — paroxítona terminada em -r. Todas estão corretas; clique em qualquer uma delas.',
 'BASICO', true),

-- ── Rodada 2 ────────────────────────────────────────────────────────────────

(53, 4, 'PRATICA', 2, 1, 'A',
 '"Hífen" é acentuado por ser paroxítona terminada em:',
 NULL, NULL,
 '[{"id":"A","texto":"-em"},{"id":"B","texto":"-n"},{"id":"C","texto":"-ns"},{"id":"D","texto":"ditongo"}]',
 'B',
 '"hífen" = HÍ-fen — paroxítona terminada em -n. ATENÇÃO: o plural "hifens" NÃO é acentuado — termina em -ens, que está na lista das terminações sem acento. Mesma lógica: pólen/polens, glúten/glutens.',
 'MEDIO', true),

(54, 4, 'PRATICA', 2, 2, 'D',
 '"Hífen" (singular, com acento) e "hifens" (plural, sem acento) seguem a mesma regra de acentuação.',
 NULL, NULL, NULL,
 'ERRADO',
 '"hífen" leva acento por ser paroxítona terminada em -n. "hifens" NÃO leva acento por ser paroxítona terminada em -ens (lista das que não se acentuam). São regras opostas aplicadas às variantes do mesmo vocábulo.',
 'MEDIO', true),

(55, 4, 'PRATICA', 2, 3, 'A',
 'Quais das paroxítonas abaixo são acentuadas pela MESMA terminação?',
 NULL, NULL,
 '[{"id":"A","texto":"fórum e álbum"},{"id":"B","texto":"vírus e fácil"},{"id":"C","texto":"caráter e tórax"},{"id":"D","texto":"lápis e júri"}]',
 'A',
 '"fórum" e "álbum" são ambas paroxítonas terminadas em -um — mesma terminação, mesma regra. "vírus" (-us) e "fácil" (-l) têm terminações diferentes. "caráter" (-r) e "tórax" (-x) também são diferentes. "lápis" (-is) e "júri" (-i) são parecidas mas distintas.',
 'MEDIO', true),

(56, 4, 'PRATICA', 2, 4, 'D',
 'Verbos paroxítonos terminados em ditongo -am (como "cantam" e "mexam") não recebem acento gráfico.',
 NULL, NULL, NULL,
 'CERTO',
 'A regra das paroxítonas acentua as terminadas em ditongo — mas verbos paroxítonos terminados em -am são exceção: "cantam", "mexam", "partam", "saibam" não recebem acento. O -am verbal é diferente do ditongo crescente como terminação nominal.',
 'AVANCADO', true),

-- ── Rodada 3 ────────────────────────────────────────────────────────────────

(57, 4, 'PRATICA', 3, 1, 'A',
 'Por que a palavra "história" recebe acento gráfico?',
 NULL, NULL,
 '[{"id":"A","texto":"Por ser oxítona terminada em -a"},{"id":"B","texto":"Por ser paroxítona terminada em ditongo crescente (-ia)"},{"id":"C","texto":"Por ser proparoxítona com tônica na antepenúltima"},{"id":"D","texto":"Por ser monossílaba tônica terminada em -a"}]',
 'B',
 '"história" = his-TÓ-ria — paroxítona terminada em ditongo crescente (-ia). Observação: "história" pode ser interpretada como proparoxítona eventual (his-TÓ-ri-a), justificativa também aceita pelas bancas.',
 'MEDIO', true),

(58, 4, 'PRATICA', 3, 2, 'D',
 '"Órgão" é paroxítona terminada em -ão e, por isso, obrigatoriamente acentuada.',
 NULL, NULL, NULL,
 'CERTO',
 '"órgão" = ÓR-gão — paroxítona terminada em -ão. A terminação -ão(s) não está na lista das paroxítonas sem acento, portanto recebe acento. Outros exemplos: sótão, bênção, órgãos.',
 'MEDIO', true),

(59, 4, 'PRATICA', 3, 3, 'A',
 'Qual das alternativas apresenta TODAS as paroxítonas corretamente grafadas?',
 NULL, NULL,
 '[{"id":"A","texto":"tórax, lápis, vírus, fórum"},{"id":"B","texto":"torax, lapis, virus, forum"},{"id":"C","texto":"tórax, lapis, vírus, fórum"},{"id":"D","texto":"tórax, lápis, virus, fórum"}]',
 'A',
 'Todas exigem acento: tórax (-x), lápis (-is), vírus (-us), fórum (-um). Na alternativa B, nenhuma está acentuada. Na C, falta acento em "lapis". Na D, falta em "virus".',
 'AVANCADO', true),

(60, 4, 'PRATICA', 3, 4, 'D',
 'As palavras "ônibus" e "invioláveis" são acentuadas de acordo com a mesma regra de acentuação gráfica.',
 NULL, NULL, NULL,
 'ERRADO',
 '"ônibus" = Ô-ni-bus — PROPAROXÍTONA, acentuada pela regra das proparoxítonas. "invioláveis" = in-vi-o-LÁ-veis — PAROXÍTONA terminada em ditongo decrescente, acentuada pela regra das paroxítonas. Regras distintas. Questão inspirada em CESPE/UnB - Correios - 2011 (gabarito: ERRADO).',
 'AVANCADO', true),

-- ── Desafio ─────────────────────────────────────────────────────────────────

(61, 4, 'DESAFIO', NULL, 1, 'D',
 '"Brasília", "prêmios" e "vitória" são acentuadas pela mesma razão gramatical.',
 NULL, NULL, NULL,
 'CERTO',
 'As três são paroxítonas terminadas em ditongo crescente (ou proparoxítonas eventuais): bra-SÍ-lia (-ia), PRÊ-mi-os (-io) e vi-TÓ-ria (-ia). Questão inspirada em FUNIVERSA - CEB - Advogado - 2010, gabarito: CERTO.',
 'AVANCADO', true),

(62, 4, 'DESAFIO', NULL, 2, 'D',
 'A palavra "pátria" pode ser justificada simultaneamente como paroxítona terminada em ditongo crescente e como proparoxítona eventual.',
 NULL, NULL, NULL,
 'CERTO',
 '"pátria" = PÁ-tria (paroxítona, ditongo crescente -ia) OU PÁ-tri-a (proparoxítona eventual). A FGV, em 2017, considerou "pátria" e "tênue" como "vocábulos cuja acentuação gráfica pode ser justificada simultaneamente por duas regras". Ambas as justificativas são corretas.',
 'AVANCADO', true),

(63, 4, 'DESAFIO', NULL, 3, 'D',
 '"Analítica" e "teríamos" recebem acento gráfico com base na mesma regra de acentuação.',
 NULL, NULL, NULL,
 'CERTO',
 'Ambas são proparoxítonas: a-na-LÍ-ti-ca e te-RÍ-a-mos. Questão inspirada em CESPE/UnB - TJ/ES - 2011 (gabarito: CERTO). A CESPE confirmou que formas como "teríamos" (futuro do pretérito) são proparoxítonas e seguem a mesma regra de "analítica".',
 'AVANCADO', true),

(64, 4, 'DESAFIO', NULL, 4, 'D',
 'Afixos paroxítonos terminados em -r, como o prefixo "hiper-", não recebem acento gráfico, exceto quando substantivados.',
 NULL, NULL, NULL,
 'CERTO',
 'A regra prevê que prefixos paroxítonos terminados em -r ou -i não são acentuados como prefixos: hiper-, mini-, semi-. Mas, quando substantivados, recebem acento por serem paroxítonas terminadas em -r: "o hiper" (supermercado), "a mini" (minissaia).',
 'AVANCADO', true);