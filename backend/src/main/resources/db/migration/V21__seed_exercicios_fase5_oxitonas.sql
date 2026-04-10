-- V21__seed_exercicios_fase5_oxitonas.sql
-- Fase 5: Oxítonas | 12 prática (3 rodadas x 4) + 4 desafio

INSERT INTO interage_exercicio
  (id, fase_id, bloco, rodada, ordem_na_rodada, tipo, enunciado, frase_contexto, palavra_alvo, opcoes, gabarito, explicacao, nivel, ativo)
VALUES

-- ── Rodada 1 ────────────────────────────────────────────────────────────────

(65, 5, 'PRATICA', 1, 1, 'A',
 'Acentuam-se as oxítonas terminadas em:',
 NULL, NULL,
 '[{"id":"A","texto":"-a(s), -e(s), -o(s) apenas"},{"id":"B","texto":"-a(s), -e(s), -o(s), -em e -ens"},{"id":"C","texto":"qualquer vogal tônica"},{"id":"D","texto":"-a(s), -e(s), -o(s) e -i(s)"}]',
 'B',
 'A regra das oxítonas inclui: -a(s) (sofá), -e(s) (café), -o(s) (avó), -em (também, vintém) e -ens (armazéns, vinténs). Diferentemente das monossílabas, as oxítonas incluem -em/-ens. Oxítonas com outras terminações não recebem acento: rapaz, batom, anel.',
 'BASICO', true),

(66, 5, 'PRATICA', 1, 2, 'A',
 'Qual oxítona NÃO recebe acento gráfico, segundo a norma?',
 NULL, NULL,
 '[{"id":"A","texto":"sofá"},{"id":"B","texto":"café"},{"id":"C","texto":"rapaz"},{"id":"D","texto":"avó"}]',
 'C',
 '"rapaz" é oxítona terminada em -az, terminação não listada na regra (-a(s), -e(s), -o(s), -em, -ens). "sofá" (-a), "café" (-e) e "avó" (-o) são corretamente acentuadas. Outros sem acento: anel, batom, capim, cortez.',
 'BASICO', true),

(67, 5, 'PRATICA', 1, 3, 'D',
 '"Jerusalém" recebe acento gráfico por ser oxítona terminada em -em.',
 NULL, NULL, NULL,
 'CERTO',
 '"Jerusalém" = Je-ru-sa-LÉM — oxítona com tônica na última sílaba, terminada em -em. A terminação -em é uma das cinco que justificam o acento nas oxítonas. Outros exemplos: vintém, também, ninguém, alguém, armazém, Belém.',
 'BASICO', true),

(68, 5, 'PRATICA', 1, 4, 'B',
 'Na frase a seguir, clique em uma palavra que é oxítona acentuada.',
 'O médico tomou café enquanto lia no sofá confortável.',
 'café',
 NULL,
 'café',
 '"café" = ca-FÉ — oxítona terminada em -é. "sofá" = so-FÁ — também é oxítona acentuada. "médico" é proparoxítona. "confortável" é paroxítona terminada em -el.',
 'BASICO', true),

-- ── Rodada 2 ────────────────────────────────────────────────────────────────

(69, 5, 'PRATICA', 2, 1, 'D',
 '"Comprá-las" é acentuada pela regra das oxítonas, pois ao ignorar o pronome "-las", resta "comprá" — oxítona terminada em -a.',
 NULL, NULL, NULL,
 'CERTO',
 '"comprá" = com-PRÁ — duas sílabas, tônica na última = oxítona terminada em -a. A regra determina ignorar o pronome oblíquo átono ao acentuar. Outros exemplos: "revê-lo" = "revê" (oxítona -e), "mantém-no" = "mantém" (oxítona -em).',
 'MEDIO', true),

(70, 5, 'PRATICA', 2, 2, 'A',
 'Qual das palavras abaixo é oxítona que NÃO recebe acento gráfico?',
 NULL, NULL,
 '[{"id":"A","texto":"sofá"},{"id":"B","texto":"rapaz"},{"id":"C","texto":"Jerusalém"},{"id":"D","texto":"avó"}]',
 'B',
 '"rapaz" é oxítona terminada em -az — terminação não contemplada pela regra (-a(s), -e(s), -o(s), -em, -ens). "sofá" (-a), "Jerusalém" (-em) e "avó" (-o) recebem acento. Outros sem acento: anel, batom, xadrez, capim.',
 'BASICO', true),

(71, 5, 'PRATICA', 2, 3, 'D',
 'A palavra "bongós" (plural de "bongô") mantém o acento no plural por ser oxítona terminada em -o(s).',
 NULL, NULL, NULL,
 'CERTO',
 '"bongô" → "bongós": ambas são oxítonas, terminadas respectivamente em -o e -os. A regra das oxítonas contempla -o(s), portanto o acento se mantém no plural. Da mesma forma: sofá/sofás, café/cafés, avó/avós.',
 'MEDIO', true),

(72, 5, 'PRATICA', 2, 4, 'A',
 'Qual das oxítonas abaixo deve ser acentuada por terminar em -em?',
 NULL, NULL,
 '[{"id":"A","texto":"rapaz"},{"id":"B","texto":"vintém"},{"id":"C","texto":"batom"},{"id":"D","texto":"anel"}]',
 'B',
 '"vintém" = vin-TÉM — oxítona terminada em -em, recebe acento. "rapaz" (-az), "batom" (-om) e "anel" (-el) terminam em consoantes não listadas na regra. Outros em -em/-ens: também, ninguém, alguém, armazém, armazéns, vinténs.',
 'BASICO', true),

-- ── Rodada 3 ────────────────────────────────────────────────────────────────

(73, 5, 'PRATICA', 3, 1, 'D',
 '"Ninguém", "alguém" e "também" são oxítonas terminadas em -em e recebem acento gráfico pela mesma regra.',
 NULL, NULL, NULL,
 'CERTO',
 'As três são oxítonas terminadas em -em e seguem a mesma regra de acentuação. A terminação -em em oxítonas é uma das cinco que obrigam o acento gráfico.',
 'MEDIO', true),

(74, 5, 'PRATICA', 3, 2, 'A',
 'Quantas palavras da frase "Também o café sofreu os efeitos da crise" são oxítonas corretamente acentuadas?',
 NULL, NULL,
 '[{"id":"A","texto":"1"},{"id":"B","texto":"2"},{"id":"C","texto":"3"},{"id":"D","texto":"4"}]',
 'B',
 '"Também" (tam-BÉM, -em) e "café" (ca-FÉ, -e) são as oxítonas acentuadas. "sofreu" é oxítona em -eu (ditongo, não na lista simples), sem acento. "efeitos" é paroxítona. "crise" é paroxítona terminada em -e, sem acento.',
 'AVANCADO', true),

(75, 5, 'PRATICA', 3, 3, 'A',
 'Qual das alternativas apresenta formas verbais que são oxítonas corretamente acentuadas?',
 NULL, NULL,
 '[{"id":"A","texto":"manter e conter (infinitivos)"},{"id":"B","texto":"contém e mantém"},{"id":"C","texto":"cantam e deixam"},{"id":"D","texto":"aviso e anúncio"}]',
 'B',
 '"contém" e "mantém" = oxítonas terminadas em -em. "manter" e "conter" são PAROXÍTONAS terminadas em -r (não oxítonas). "cantam" e "deixam" são paroxítonas em -am, sem acento. "anúncio" é paroxítona terminada em ditongo crescente.',
 'MEDIO', true),

(76, 5, 'PRATICA', 3, 4, 'D',
 '"Também" seria escrita sem acento gráfico se fosse paroxítona, pois paroxítonas terminadas em -em não recebem acento.',
 NULL, NULL, NULL,
 'CERTO',
 'A lógica é exata: "também" é oxítona (-em) e por isso leva acento. Se fosse paroxítona terminada em -em, estaria na lista das que NÃO recebem acento. Nas oxítonas, -em/-ens recebem acento; nas paroxítonas, -em/-ens não recebem.',
 'MEDIO', true),

-- ── Desafio ─────────────────────────────────────────────────────────────────

(77, 5, 'DESAFIO', NULL, 1, 'D',
 '"Comprá-las", "revê-lo" e "mantém-no" são formas em que os pronomes oblíquos enclíticos são ignorados ao aplicar a regra de acentuação das oxítonas.',
 NULL, NULL, NULL,
 'CERTO',
 'Ignorando os pronomes "-las", "-lo" e "-no": "comprá" (oxítona -a), "revê" (oxítona -e) e "mantém" (oxítona -em). O pronome oblíquo átono nunca altera a classificação da forma verbal para fins de acentuação. Uma das questões mais cobradas pelo CEBRASPE.',
 'AVANCADO', true),

(78, 5, 'DESAFIO', NULL, 2, 'D',
 'Os verbos "manter" e "conter", em suas formas infinitivas, são oxítonos e por isso recebem acento gráfico.',
 NULL, NULL, NULL,
 'ERRADO',
 'Os infinitivos "manter" e "conter" são PAROXÍTONAS terminadas em -r (man-TER, con-TER), não oxítonas. Recebem acento pela regra das paroxítonas (terminação -r). As formas oxítonas são "contém" e "mantém" (3ª p. sing. pres. ind.) — aí sim se aplica a regra das oxítonas (-em).',
 'AVANCADO', true),

(79, 5, 'DESAFIO', NULL, 3, 'D',
 'As palavras "já" (advérbio) e "sofá" (substantivo) são acentuadas pela mesma regra.',
 NULL, NULL, NULL,
 'ERRADO',
 '"já" é MONOSSÍLABA tônica terminada em -a (regra das monossílabas). "sofá" é OXÍTONA (so-FÁ, 2 sílabas) terminada em -a (regra das oxítonas). São regras formalmente distintas, embora o resultado — acento agudo no -a — seja o mesmo.',
 'AVANCADO', true),

(80, 5, 'DESAFIO', NULL, 4, 'D',
 '"Ninguém" é oxítona terminada em -em e, portanto, recebe acento gráfico pela mesma regra que "Belém" e "vintém".',
 NULL, NULL, NULL,
 'CERTO',
 'As três são oxítonas terminadas em -em: nin-GUÉM, Be-LÉM, vin-TÉM. A terminação -em em oxítonas obriga o acento. No plural: armazéns, vinténs (terminação -ens, também com acento). Pronome, topônimo ou substantivo — a regra de acentuação é a mesma.',
 'MEDIO', true);