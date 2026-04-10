-- V19__seed_exercicios_fase3_proparoxitonas.sql
-- Fase 3: Proparoxítonas | 12 prática (3 rodadas x 4) + 4 desafio

INSERT INTO interage_exercicio
  (id, fase_id, bloco, rodada, ordem_na_rodada, tipo, enunciado, frase_contexto, palavra_alvo, opcoes, gabarito, explicacao, nivel, ativo)
VALUES

-- ── Rodada 1 ────────────────────────────────────────────────────────────────

(33, 3, 'PRATICA', 1, 1, 'A',
 'Qual das alternativas apresenta APENAS proparoxítonas?',
 NULL, NULL,
 '[{"id":"A","texto":"médico, público, lâmpada"},{"id":"B","texto":"médico, café, álcool"},{"id":"C","texto":"lâmpada, cansado, pássaro"},{"id":"D","texto":"pássaro, colega, música"}]',
 'A',
 'Proparoxítonas têm tônica na antepenúltima sílaba: MÉ-di-co, PÚ-bli-co, LÂM-pa-da. "café" é oxítona. "cansado" é paroxítona (can-SA-do). "colega" é paroxítona (co-LE-ga).',
 'BASICO', true),

(34, 3, 'PRATICA', 1, 2, 'D',
 'Todas as proparoxítonas da língua portuguesa são obrigatoriamente acentuadas graficamente.',
 NULL, NULL, NULL,
 'CERTO',
 'A regra é absoluta e não admite exceções: toda proparoxítona recebe acento gráfico. Isso ocorre porque proparoxítonas são minoria no vocabulário português. São exemplos: álcool, réquiem, máscara, zênite, álibi, plêiade, náufrago.',
 'BASICO', true),

(35, 3, 'PRATICA', 1, 3, 'A',
 'A palavra "árvore" é classificada como:',
 NULL, NULL,
 '[{"id":"A","texto":"Oxítona"},{"id":"B","texto":"Paroxítona"},{"id":"C","texto":"Proparoxítona"},{"id":"D","texto":"Monossílaba tônica"}]',
 'C',
 '"árvore" = ÁR-vo-re. O acento tônico recai na sílaba ÁR, que é a antepenúltima. Portanto, é proparoxítona e recebe obrigatoriamente acento gráfico. Outros exemplos: câmara, xícara, cômodo.',
 'BASICO', true),

(36, 3, 'PRATICA', 1, 4, 'B',
 'Na frase abaixo, clique na palavra que é uma proparoxítona.',
 'O médico orientou o paciente com bastante calma.',
 'médico',
 NULL,
 'médico',
 '"médico" = MÉ-di-co — proparoxítona (tônica na antepenúltima). "paciente" = pa-ci-EN-te — paroxítona. "calma" = CAL-ma — paroxítona. Proparoxítonas são sempre acentuadas.',
 'BASICO', true),

-- ── Rodada 2 ────────────────────────────────────────────────────────────────

(37, 3, 'PRATICA', 2, 1, 'A',
 'Qual das palavras abaixo NÃO é proparoxítona?',
 NULL, NULL,
 '[{"id":"A","texto":"lâmpada"},{"id":"B","texto":"público"},{"id":"C","texto":"nação"},{"id":"D","texto":"música"}]',
 'C',
 '"nação" = na-ÇÃO — é oxítona (tônica na última sílaba). As demais são proparoxítonas: LÂM-pa-da, PÚ-bli-co, MÚ-si-ca. O erro clássico é confundir a posição de tonicidade.',
 'BASICO', true),

(38, 3, 'PRATICA', 2, 2, 'D',
 'As chamadas "proparoxítonas eventuais", como "história" e "paciência", podem ser classificadas tanto como paroxítonas terminadas em ditongo crescente quanto como proparoxítonas.',
 NULL, NULL, NULL,
 'CERTO',
 'Palavras como "história", "paciência", "série" e "glória" admitem dupla análise silábica: paroxítona terminada em ditongo crescente (his-TÓ-ria) OU proparoxítona eventual (his-TÓ-ri-a). Ambas as classificações são aceitas pelas bancas.',
 'MEDIO', true),

(39, 3, 'PRATICA', 2, 3, 'A',
 'Qual das proparoxítonas abaixo é acentuada com acento CIRCUNFLEXO?',
 NULL, NULL,
 '[{"id":"A","texto":"pássaro"},{"id":"B","texto":"médico"},{"id":"C","texto":"lâmpada"},{"id":"D","texto":"álcool"}]',
 'C',
 '"lâmpada" usa acento circunflexo no â (timbre fechado, nasal). "pássaro" usa agudo no á (timbre aberto). "médico" usa agudo no é. "álcool" usa agudo no á. O circunflexo indica vogal tônica de timbre fechado.',
 'MEDIO', true),

(40, 3, 'PRATICA', 2, 4, 'D',
 'Segundo o Vocabulário Ortográfico da Língua Portuguesa (VOLP), as palavras "déficit" e "deficit" (sem acento) são ambas grafias aceitas.',
 NULL, NULL, NULL,
 'CERTO',
 'O VOLP registra dupla grafia para termos latinos: "deficit" (forma latina) e "déficit" (forma vernacular). O mesmo vale para "habitat/hábitat" e "superavit/superávit". Apenas as formas acentuadas fazem plural regular: déficits, hábitats.',
 'MEDIO', true),

-- ── Rodada 3 ────────────────────────────────────────────────────────────────

(41, 3, 'PRATICA', 3, 1, 'A',
 'Qual alternativa apresenta TODAS as palavras corretamente grafadas?',
 NULL, NULL,
 '[{"id":"A","texto":"pássaro, lâmina, médico"},{"id":"B","texto":"passaro, lâmina, médico"},{"id":"C","texto":"pássaro, lamina, médico"},{"id":"D","texto":"pássaro, lâmina, medico"}]',
 'A',
 'Todas são proparoxítonas e devem ser acentuadas: PÁS-sa-ro, LÂ-mi-na, MÉ-di-co. Na alternativa B, falta acento em "passaro". Na C, falta em "lamina". Na D, falta em "medico".',
 'MEDIO', true),

(42, 3, 'PRATICA', 3, 2, 'A',
 'Quantas proparoxítonas há na frase: "O médico pediu exames específicos para o diagnóstico"?',
 NULL, NULL,
 '[{"id":"A","texto":"1"},{"id":"B","texto":"2"},{"id":"C","texto":"3"},{"id":"D","texto":"4"}]',
 'C',
 'São três: "médico" (MÉ-di-co), "específicos" (es-pe-CÍ-fi-cos) e "diagnóstico" (di-ag-NÓS-ti-co). "pediu" é paroxítona (pe-DI-u). "exames" é paroxítona (e-XA-mes).',
 'AVANCADO', true),

(43, 3, 'PRATICA', 3, 3, 'D',
 'As proparoxítonas representam a maioria das palavras acentuadas na língua portuguesa.',
 NULL, NULL, NULL,
 'ERRADO',
 'As proparoxítonas representam uma minoria absoluta no vocabulário. Por serem raras, a regra é que TODAS recebam acento — é a única classe sem exceção. A maioria das palavras em português é paroxítona, e grande parte delas não precisa de acento gráfico.',
 'MEDIO', true),

(44, 3, 'PRATICA', 3, 4, 'B',
 'Na frase abaixo, clique na proparoxítona que está INCORRETAMENTE grafada.',
 'O público adorou o espetáculo da musica clássica.',
 'musica',
 NULL,
 'musica',
 '"musica" está incorreto — deveria ser "música" (MÚ-si-ca). "público" (PÚ-bli-co) e "clássica" (CLÁS-si-ca) estão corretos. Proparoxítonas sem acento são sempre erros ortográficos, sem exceção.',
 'MEDIO', true),

-- ── Desafio ─────────────────────────────────────────────────────────────────

(45, 3, 'DESAFIO', NULL, 1, 'D',
 'A palavra "veículos" é acentuada pela regra dos hiatos tônicos (I e U), e não pela regra das proparoxítonas.',
 NULL, NULL, NULL,
 'ERRADO',
 'Segundo o Novo Acordo Ortográfico, a regra dos hiatos aplica-se apenas a oxítonas e paroxítonas — não a proparoxítonas. "veículos" = VE-Í-cu-los é proparoxítona, portanto se acentua exclusivamente pela regra das proparoxítonas. O CEBRASPE já cobrou exatamente essa distinção.',
 'AVANCADO', true),

(46, 3, 'DESAFIO', NULL, 2, 'D',
 'As palavras "acróbata" e "acrobata" são ambas aceitas como corretas pelo Vocabulário Ortográfico da Língua Portuguesa.',
 NULL, NULL, NULL,
 'CERTO',
 'O VOLP registra diversas palavras com dupla possibilidade de grafia: acróbata/acrobata, hieróglifo/hieroglifo, zênite/zenite, autopsia/autópsia. Em concursos, ambas as formas são corretas, salvo indicação em contrário da banca.',
 'AVANCADO', true),

(47, 3, 'DESAFIO', NULL, 3, 'D',
 'A palavra "seriíssimo" é uma proparoxítona e, por isso, obrigatoriamente acentuada.',
 NULL, NULL, NULL,
 'CERTO',
 '"seriíssimo" = se-ri-ÍS-si-mo — proparoxítona (tônica na antepenúltima sílaba). O sufixo -íssimo (superlativo absoluto sintético) sempre forma proparoxítonas, que obrigatoriamente recebem acento. Exemplos: riquíssimo, belíssimo, lentíssimo.',
 'AVANCADO', true),

(48, 3, 'DESAFIO', NULL, 4, 'D',
 '"Líderes", "empréstimo" e "públicas" recebem acento gráfico com base na mesma justificativa gramatical.',
 NULL, NULL, NULL,
 'CERTO',
 'Todas são proparoxítonas: LÍ-de-res, em-PRÉS-ti-mo, PÚ-bli-cas. Questão inspirada em CESPE/UnB - Instituto Rio Branco - Diplomata - 2008, cujo gabarito foi CERTO. A banca confirmou que proparoxítonas formam um grupo com a mesma justificativa de acentuação.',
 'AVANCADO', true);