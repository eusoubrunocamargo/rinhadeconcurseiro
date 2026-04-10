-- V22__seed_exercicios_fase6_hiatos.sql
-- Fase 6: Hiatos Tônicos (I e U) | 12 prática (3 rodadas x 4) + 4 desafio

INSERT INTO interage_exercicio
  (id, fase_id, bloco, rodada, ordem_na_rodada, tipo, enunciado, frase_contexto, palavra_alvo, opcoes, gabarito, explicacao, nivel, ativo)
VALUES

-- ── Rodada 1 ────────────────────────────────────────────────────────────────

(81, 6, 'PRATICA', 1, 1, 'A',
 'Pela regra dos hiatos, acentuam-se com acento agudo as vogais I e U quando:',
 NULL, NULL,
 '[{"id":"A","texto":"são átonas e formam hiato com a vogal anterior"},{"id":"B","texto":"são tônicas, formam hiato e estão isoladas ou seguidas de S na mesma sílaba"},{"id":"C","texto":"estão em qualquer posição no hiato, tônicas ou átonas"},{"id":"D","texto":"vêm após ditongo decrescente, em qualquer tipo de palavra"}]',
 'B',
 'A regra exige: (1) I ou U TÔNICOS; (2) que formem HIATO; (3) que estejam isolados ou seguidos de S na mesma sílaba. Ex.: sa-ÚDE (U tônico em hiato), fa-ÍS-ca (I + S em hiato), ba-Ú (U final). Vogais átonas em hiato NÃO recebem acento.',
 'BASICO', true),

(82, 6, 'PRATICA', 1, 2, 'A',
 'Qual das palavras abaixo é acentuada pela regra dos hiatos tônicos?',
 NULL, NULL,
 '[{"id":"A","texto":"café"},{"id":"B","texto":"saúde"},{"id":"C","texto":"médico"},{"id":"D","texto":"pé"}]',
 'B',
 '"saúde" = sa-Ú-de — o Ú é tônico e forma hiato com o A anterior. Regra dos hiatos aplicada. "café" é oxítona (-e). "médico" é proparoxítona. "pé" é monossílaba tônica (-e). Outros exemplos: saída, faísca, baú, açaí.',
 'BASICO', true),

(83, 6, 'PRATICA', 1, 3, 'D',
 '"Raiz" e "juiz" não levam acento gráfico porque o I do hiato vem seguido de Z (e não de S).',
 NULL, NULL, NULL,
 'CERTO',
 'A regra exige I (ou U) tônico em hiato, isolado ou seguido de S na mesma sílaba. Em "raiz" (ra-IZ) e "juiz" (ju-IZ), o I vem seguido de Z — consoante diferente de S. Por isso a regra não se aplica. Grafar "raíz" ou "juíz" é sempre erro.',
 'BASICO', true),

(84, 6, 'PRATICA', 1, 4, 'B',
 'Na frase abaixo, clique na palavra acentuada pela regra dos hiatos tônicos.',
 'A saúde é o maior bem de todo ser humano.',
 'saúde',
 NULL,
 'saúde',
 '"saúde" = sa-Ú-de — U tônico em hiato. A regra dos hiatos se aplica. As demais palavras da frase ou não possuem hiato tônico com I/U ou são acentuadas por outra regra.',
 'BASICO', true),

-- ── Rodada 2 ────────────────────────────────────────────────────────────────

(85, 6, 'PRATICA', 2, 1, 'A',
 'Por que "rainha" e "campainha" não levam acento no I do hiato?',
 NULL, NULL,
 '[{"id":"A","texto":"Porque o I é átono nessas palavras"},{"id":"B","texto":"Porque há NH na sílaba imediatamente após o I"},{"id":"C","texto":"Porque são oxítonas e a regra não se aplica a oxítonas"},{"id":"D","texto":"Porque o I vem seguido de Z, não de S"}]',
 'B',
 'A regra prevê exceção: quando o I tônico em hiato é seguido de NH na sílaba seguinte, não se usa o acento. Ex.: ra-i-nha, ta-bu-i-nha, la-da-i-nha, cam-pa-i-nha. Não confunda com o caso do Z (raiz, juiz), onde o I está na mesma sílaba que o Z.',
 'MEDIO', true),

(86, 6, 'PRATICA', 2, 2, 'D',
 '"Baú" e "saúde" são acentuados pela mesma regra gramatical.',
 NULL, NULL, NULL,
 'CERTO',
 'Ambos têm U tônico em hiato: "baú" = ba-Ú (U tônico, isolado no final) e "saúde" = sa-Ú-de (U tônico seguido de consoante). A regra dos hiatos se aplica às duas. Outros pares semelhantes: país/saída, faísca/açaí.',
 'BASICO', true),

(87, 6, 'PRATICA', 2, 3, 'A',
 'Qual das palavras abaixo NÃO recebe acento gráfico segundo o Novo Acordo Ortográfico?',
 NULL, NULL,
 '[{"id":"A","texto":"saúde"},{"id":"B","texto":"faísca"},{"id":"C","texto":"feiura"},{"id":"D","texto":"baú"}]',
 'C',
 '"feiura" = fei-U-ra — paroxítona com U após ditongo decrescente (ei). Segundo o Novo Acordo (2009), paroxítonas com I ou U tônicos após ditongo decrescente NÃO recebem acento: feiura, bocaiuva, baiuca. "saúde", "faísca" e "baú" não têm ditongo antes do hiato e recebem acento normalmente.',
 'MEDIO', true),

(88, 6, 'PRATICA', 2, 4, 'D',
 'Segundo o Novo Acordo Ortográfico, paroxítonas com I ou U tônicos que aparecem após ditongo decrescente não recebem acento gráfico.',
 NULL, NULL, NULL,
 'CERTO',
 'O Novo Acordo (2009) eliminou o acento nessas paroxítonas: feiura, bocaiuva, baiuca, Sauipe. A regra continua valendo para oxítonas: Piauí, tuiuiú — nessas, o acento se mantém porque são oxítonas. A exceção se aplica apenas a paroxítonas.',
 'MEDIO', true),

-- ── Rodada 3 ────────────────────────────────────────────────────────────────

(89, 6, 'PRATICA', 3, 1, 'D',
 '"Paraíso" é acentuado pela regra dos hiatos tônicos.',
 NULL, NULL, NULL,
 'CERTO',
 '"paraíso" = pa-ra-Í-so — o Í é tônico e forma hiato com o A anterior. Sem ditongo decrescente antes, sem NH na sílaba seguinte. A regra dos hiatos se aplica normalmente.',
 'MEDIO', true),

(90, 6, 'PRATICA', 3, 2, 'A',
 'Qual par ilustra a regra dos hiatos (COM acento) versus a exceção após ditongo decrescente em paroxítona (SEM acento)?',
 NULL, NULL,
 '[{"id":"A","texto":"saúde / feiura"},{"id":"B","texto":"raiz / saúde"},{"id":"C","texto":"baú / baía"},{"id":"D","texto":"paraíso / parabéns"}]',
 'A',
 '"saúde" — U tônico em hiato, sem ditongo antes → recebe acento. "feiura" — U após ditongo decrescente (ei) em paroxítona → sem acento (Novo Acordo). Par perfeito para ilustrar a regra e sua exceção.',
 'AVANCADO', true),

(91, 6, 'PRATICA', 3, 3, 'D',
 '"Atribuí-lo" e "distribuí-la" mantêm o acento no I mesmo com pronomes oblíquos enclíticos.',
 NULL, NULL, NULL,
 'CERTO',
 'A regra dos hiatos continua valendo com enclíticos: ignore o pronome e analise a forma verbal. "atribuí-lo" → ignora "-lo" → "atribuí" (I tônico em hiato) → recebe acento. "distribuí-la" → ignora "-la" → "distribuí" → recebe acento.',
 'AVANCADO', true),

(92, 6, 'PRATICA', 3, 4, 'A',
 'Qual das opções está CORRETAMENTE grafada conforme a regra dos hiatos?',
 NULL, NULL,
 '[{"id":"A","texto":"saude"},{"id":"B","texto":"saúde"},{"id":"C","texto":"raíz"},{"id":"D","texto":"ruina"}]',
 'B',
 '"saúde" está correta — U tônico em hiato. "saude" (sem acento) está errada. "raíz" está errada — deve ser "raiz" (I antes de Z, sem acento). "ruina" está errada — deve ser "ruína" (I tônico em hiato ru-Í-na, sem ditongo antes, sem NH depois).',
 'MEDIO', true),

-- ── Desafio ─────────────────────────────────────────────────────────────────

(93, 6, 'DESAFIO', NULL, 1, 'D',
 '"Piauí" e "tuiuiú" recebem acento no I e U porque são oxítonas — e a exceção do Novo Acordo (sem acento após ditongo em paroxítona) não se aplica a elas.',
 NULL, NULL, NULL,
 'CERTO',
 'O Novo Acordo eliminou o acento apenas em PAROXÍTONAS com I/U após ditongo decrescente (feiura, bocaiuva). Para OXÍTONAS, o acento se mantém mesmo após ditongo: Pi-au-Í, tu-iu-i-Ú. A regra e sua exceção dependem da classificação acentual (oxítona vs. paroxítona).',
 'AVANCADO', true),

(94, 6, 'DESAFIO', NULL, 2, 'D',
 'A regra dos hiatos tônicos (I e U) aplica-se a oxítonas, paroxítonas e também a proparoxítonas.',
 NULL, NULL, NULL,
 'ERRADO',
 'Segundo o Novo Acordo Ortográfico, a regra dos hiatos aplica-se apenas a oxítonas e paroxítonas — NÃO a proparoxítonas. Proparoxítonas seguem sua própria regra. "veículos" = VE-Í-cu-los é proparoxítona → acentuada pela regra das proparoxítonas, não dos hiatos.',
 'AVANCADO', true),

(95, 6, 'DESAFIO', NULL, 3, 'D',
 'Os vocábulos "países" e "áreas" são acentuados de acordo com a mesma regra de acentuação gráfica.',
 NULL, NULL, NULL,
 'ERRADO',
 '"países" = pa-Í-ses — I tônico em hiato → regra dos hiatos. "áreas" = Á-re-as — proparoxítona eventual (ou paroxítona terminada em ditongo crescente) → regra das paroxítonas/proparoxítonas. São regras distintas. Questão tirada de CESPE/UnB - TJ/ES - 2011, gabarito ERRADO.',
 'AVANCADO', true),

(96, 6, 'DESAFIO', NULL, 4, 'D',
 '"Contribuí-lo" é acentuado pela regra dos hiatos, pois ao ignorar o pronome "-lo", resta "contribuí" com I tônico em hiato.',
 NULL, NULL, NULL,
 'CERTO',
 'Ignorando "-lo": "contribuí" = con-tri-bu-Í — I tônico em hiato, sem ditongo decrescente antes, sem NH depois. A regra dos hiatos se aplica. O princípio de ignorar o pronome enclítico vale para todas as regras de acentuação, incluindo a dos hiatos.',
 'AVANCADO', true);