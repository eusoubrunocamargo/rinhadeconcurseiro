# Sistema de classificação e autofeedback no simulado

## Objetivo
Classificar automaticamente cada questão do simulado em um caderno de revisão, combinando:

1. **Marcação do candidato**: `certo` ou `errado`
2. **Nível de certeza**: `certeza`, `dúvida` ou `chute`
3. **Gabarito**: `certo` ou `errado`
4. **Autofeedback (somente quando erra)**: `conteúdo`, `interpretação` ou `distração`

---

## Nomenclaturas recomendadas

### Resultado da questão
- `acerto_consciente` → acertou com certeza
- `acerto_com_duvida` → acertou com dúvida
- `acerto_por_chute` → acertou por chute
- `erro_conteudo` → errou por lacuna de conteúdo
- `erro_interpretacao` → errou por leitura/compreensão
- `erro_distracao` → errou por atenção/execução

### Cadernos de revisão
- **caderno_vermelho** (crítico): alta prioridade de revisão
- **caderno_amarelo** (reforço): média prioridade
- **caderno_verde** (domínio): baixa prioridade (manutenção)

> Se o produto quiser manter apenas vermelho e amarelo, o `caderno_verde` pode virar apenas uma tag analítica (“domínio”).

---

## Matriz completa de classificação (recomendada)

## 1) Quando o candidato ACERTA

| Marcação | Certeza | Gabarito | Autofeedback | Classificação | Caderno | Ação sugerida |
|---|---|---|---|---|---|---|
| certo | certeza | certo | — | acerto_consciente | verde | Revisão espaçada longa (ex.: 15-30 dias) |
| certo | dúvida | certo | — | acerto_com_duvida | amarelo | Reforço curto (ex.: 3-7 dias) |
| certo | chute | certo | — | acerto_por_chute | amarelo | Revisar fundamento (acerto não confiável) |

## 2) Quando o candidato ERRA

| Marcação | Certeza | Gabarito | Autofeedback | Classificação | Caderno | Justificativa |
|---|---|---|---|---|---|---|
| certo/errado | certeza | oposto da marcação | conteúdo | erro_conteudo | vermelho | Erro grave: confiança alta + lacuna conceitual |
| certo/errado | dúvida | oposto da marcação | conteúdo | erro_conteudo | vermelho | Erro relevante de base conceitual |
| certo/errado | chute | oposto da marcação | conteúdo | erro_conteudo | vermelho | Não domina conteúdo |
| certo/errado | certeza | oposto da marcação | interpretação | erro_interpretacao | vermelho | Confiança alta com leitura equivocada |
| certo/errado | dúvida | oposto da marcação | interpretação | erro_interpretacao | amarelo | Reforço de técnica de leitura |
| certo/errado | chute | oposto da marcação | interpretação | erro_interpretacao | vermelho | Chute + erro de compreensão |
| certo/errado | certeza | oposto da marcação | distração | erro_distracao | amarelo | Atenção/execução, não necessariamente lacuna de conteúdo |
| certo/errado | dúvida | oposto da marcação | distração | erro_distracao | amarelo | Falha de atenção com incerteza |
| certo/errado | chute | oposto da marcação | distração | erro_distracao | amarelo | Regra pedida: chute + distração = amarelo |

### Compatibilidade com os exemplos solicitados
- `certo, certeza, errado, conteúdo` → **vermelho** ✅
- `certo, dúvida, errado, conteúdo` → **vermelho** ✅
- `certo, dúvida, certo` → **amarelo** ✅
- `certo, chute, errado, conteúdo/interpretação` → **vermelho** ✅
- `certo, chute, errado, distração` → **amarelo** ✅

---

## Algoritmo recomendado

## Regra determinística (simples e previsível)

```text
if marcou == gabarito:
  if certeza == "certeza": caderno = "verde"
  else: caderno = "amarelo"
else:
  # exige autofeedback
  if tipo_erro == "conteúdo": caderno = "vermelho"
  elif tipo_erro == "interpretação":
    if certeza in ["certeza", "chute"]: caderno = "vermelho"
    else: caderno = "amarelo"
  elif tipo_erro == "distração":
    caderno = "amarelo"
```

**Vantagens**
- Fácil de explicar ao usuário
- Fácil de implementar e auditar
- Compatível com todos os exemplos fornecidos

## Evolução (opcional): score de criticidade

Além do caderno, calcular `criticidade` (0-100):
- erro: +60
- conteúdo: +25
- interpretação: +20
- distração: +10
- certeza: +15
- dúvida: +10
- chute: +8

Faixas:
- `>=80` vermelho
- `50-79` amarelo
- `<50` verde

Isso permite ranking dentro do caderno para ordenar revisões.

---

## Fluxo de UX recomendado

1. **Durante a questão**
   - Usuário marca `certo/errado`
   - Campo obrigatório de confiança: `certeza`, `dúvida`, `chute`
2. **Ao finalizar simulado**
   - Para cada questão errada, solicitar `tipo de erro`
   - Botão “Finalizar análise” só habilita quando todas as erradas forem classificadas
3. **Pós-processamento**
   - Rodar classificação
   - Gerar cadernos e plano de revisão
4. **Tela de resultado**
   - Cards por caderno (vermelho/amarelo/verde)
   - Motivo da classificação em linguagem clara

---

## Ações pedagógicas por caderno

- **Vermelho**
  - Revisão imediata
  - Reestudo teórico + 5-10 questões irmãs
  - Reaparecer em curto prazo (24-72h)
- **Amarelo**
  - Reforço direcionado
  - 3-5 questões semelhantes
  - Reaparecer em 3-7 dias
- **Verde**
  - Manutenção
  - Revisão espaçada (15-30 dias)

---

## Estrutura de dados mínima (backend)

```json
{
  "question_id": "uuid",
  "marked_answer": "certo|errado",
  "confidence_level": "certeza|dúvida|chute",
  "official_answer": "certo|errado",
  "self_feedback": "conteúdo|interpretação|distração|null",
  "result_type": "acerto_consciente|acerto_com_duvida|acerto_por_chute|erro_conteudo|erro_interpretacao|erro_distracao",
  "notebook": "vermelho|amarelo|verde",
  "criticality_score": 0
}
```

---

## Regras de validação

- `self_feedback` é **obrigatório** quando `marked_answer != official_answer`
- `self_feedback` deve ser **nulo** quando houver acerto
- Não permitir finalizar o simulado com erradas sem `self_feedback`

---

## Métricas para melhoria contínua

- Taxa de acerto por nível de certeza
- Percentual de “acerto por chute”
- Distribuição de erros por tipo (`conteúdo`, `interpretação`, `distração`)
- Redução de itens no caderno vermelho ao longo do tempo

---

## Backend ideal para persistência (arquitetura recomendada)

Esta seção detalha a implementação para o fluxo em 3 etapas:

1. Usuário responde o simulado + marca nível de certeza.
2. Usuário finaliza o simulado e informa autofeedback apenas dos erros.
3. Sistema consolida classificação e persiste as questões nos cadernos.

### Princípios de desenho

- **Estado explícito por tentativa de simulado** (`IN_PROGRESS`, `AWAITING_FEEDBACK`, `COMPLETED`).
- **Persistência incremental** (salvar resposta por questão durante o simulado).
- **Consolidação transacional** ao finalizar autofeedback (classificação + cadernos no mesmo commit).
- **Idempotência** para evitar duplicidade em reenvio de requisição.
- **Rastreabilidade**: manter snapshot de regra/versão usada na classificação.

### Modelo de domínio (entidades)

1. `simulation_attempt`
   - Representa a tentativa do usuário em um simulado.
   - Campos: `id`, `user_id`, `simulation_id`, `status`, `started_at`, `finished_at`, `feedback_finished_at`, `rule_version`.

2. `simulation_attempt_question`
   - Uma linha por questão da tentativa.
   - Campos: `attempt_id`, `question_id`, `marked_answer`, `confidence_level`, `official_answer`, `is_correct`, `responded_at`.

3. `simulation_attempt_feedback`
   - Autofeedback para questões erradas.
   - Campos: `attempt_id`, `question_id`, `error_type`, `created_at`.

4. `simulation_attempt_classification`
   - Resultado final da classificação por questão.
   - Campos: `attempt_id`, `question_id`, `result_type`, `notebook`, `criticality_score`, `classified_at`, `rule_version_snapshot`.

5. `user_notebook_item`
   - Materializa o caderno do usuário.
   - Campos: `id`, `user_id`, `question_id`, `notebook`, `source_attempt_id`, `first_added_at`, `last_added_at`, `review_status`, `next_review_at`, `times_reinforced`.

6. `outbox_event` (opcional, recomendado)
   - Publicação confiável de eventos de domínio.
   - Campos: `id`, `aggregate_type`, `aggregate_id`, `event_type`, `payload_json`, `created_at`, `processed_at`.

### Esquema relacional sugerido (PostgreSQL)

```sql
create table simulation_attempt (
  id uuid primary key,
  user_id uuid not null,
  simulation_id uuid not null,
  status varchar(32) not null check (status in ('IN_PROGRESS','AWAITING_FEEDBACK','COMPLETED')),
  rule_version varchar(16) not null default 'v1',
  started_at timestamptz not null,
  finished_at timestamptz,
  feedback_finished_at timestamptz,
  unique (user_id, id)
);

create table simulation_attempt_question (
  attempt_id uuid not null references simulation_attempt(id) on delete cascade,
  question_id uuid not null,
  marked_answer varchar(8) not null check (marked_answer in ('certo','errado')),
  confidence_level varchar(16) not null check (confidence_level in ('certeza','dúvida','chute')),
  official_answer varchar(8) not null check (official_answer in ('certo','errado')),
  is_correct boolean generated always as (marked_answer = official_answer) stored,
  responded_at timestamptz not null,
  primary key (attempt_id, question_id)
);

create table simulation_attempt_feedback (
  attempt_id uuid not null,
  question_id uuid not null,
  error_type varchar(32) not null check (error_type in ('conteúdo','interpretação','distração')),
  created_at timestamptz not null,
  primary key (attempt_id, question_id),
  foreign key (attempt_id, question_id)
    references simulation_attempt_question(attempt_id, question_id)
    on delete cascade
);

create table simulation_attempt_classification (
  attempt_id uuid not null,
  question_id uuid not null,
  result_type varchar(32) not null,
  notebook varchar(16) not null check (notebook in ('vermelho','amarelo','verde')),
  criticality_score int not null default 0,
  rule_version_snapshot varchar(16) not null,
  classified_at timestamptz not null,
  primary key (attempt_id, question_id),
  foreign key (attempt_id, question_id)
    references simulation_attempt_question(attempt_id, question_id)
    on delete cascade
);

create table user_notebook_item (
  id uuid primary key,
  user_id uuid not null,
  question_id uuid not null,
  notebook varchar(16) not null check (notebook in ('vermelho','amarelo','verde')),
  source_attempt_id uuid not null references simulation_attempt(id),
  first_added_at timestamptz not null,
  last_added_at timestamptz not null,
  review_status varchar(24) not null default 'PENDING',
  next_review_at timestamptz,
  times_reinforced int not null default 1,
  unique (user_id, question_id, notebook)
);
```

### Contratos de API (REST)

#### 1) Iniciar tentativa
- `POST /api/simulations/{simulationId}/attempts`
- Saída: `attemptId`, `status=IN_PROGRESS`, lista de questões (ou paginação).

#### 2) Salvar resposta da questão (durante prova)
- `PUT /api/attempts/{attemptId}/questions/{questionId}/answer`
- Payload:

```json
{
  "markedAnswer": "certo",
  "confidenceLevel": "dúvida"
}
```

- Regra: upsert por `(attempt_id, question_id)`.

#### 3) Finalizar prova (sem autofeedback ainda)
- `POST /api/attempts/{attemptId}/finish`
- Ações:
  - valida que todas as questões têm resposta + confiança;
  - calcula score/acertos;
  - muda status para `AWAITING_FEEDBACK`;
  - retorna questões erradas pendentes de autofeedback.

#### 4) Salvar autofeedback de uma questão errada
- `PUT /api/attempts/{attemptId}/questions/{questionId}/feedback`
- Payload:

```json
{
  "errorType": "conteúdo"
}
```

- Regra: só aceita se questão estiver errada.

#### 5) Finalizar autofeedback e classificar
- `POST /api/attempts/{attemptId}/feedback/finish`
- Cabeçalho recomendado: `Idempotency-Key`.
- Ações transacionais:
  1. valida que toda questão errada possui `errorType`;
  2. aplica matriz de classificação por questão;
  3. grava `simulation_attempt_classification`;
  4. atualiza/insere em `user_notebook_item`;
  5. marca tentativa como `COMPLETED`.

### Serviço de aplicação (orquestração)

`SimulationAttemptService`
- `startAttempt(userId, simulationId)`
- `saveAnswer(attemptId, questionId, markedAnswer, confidenceLevel)`
- `finishAttempt(attemptId)`
- `saveFeedback(attemptId, questionId, errorType)`
- `finishFeedback(attemptId, idempotencyKey)`

`ClassificationService`
- Implementa regra determinística deste documento.
- Assinatura sugerida:
  - `ClassificationResult classify(AttemptQuestion q, ErrorType feedback, RuleVersion ruleVersion)`

`NotebookService`
- Upsert em `user_notebook_item` com política de prioridade:
  - se questão já estiver no vermelho, não rebaixar para amarelo automaticamente;
  - se subir de amarelo para vermelho, promover imediatamente.

### Regras de consistência (importantes)

- Não permitir `finishAttempt` se faltar `confidenceLevel` em qualquer questão.
- Não permitir `feedback` para questão correta.
- Não permitir `finishFeedback` se houver erro sem `errorType`.
- `simulation_attempt_classification` só existe após `feedback/finish`.
- Todas as gravações finais devem ocorrer em **uma transação**.

### Estratégia de concorrência e idempotência

- `@Version` (optimistic locking) em `simulation_attempt`.
- `Idempotency-Key` armazenada em tabela `request_idempotency` para `feedback/finish`.
- Em caso de retry, retornar o mesmo resultado já consolidado.

### Observabilidade e auditoria

- Logar transições de estado da tentativa.
- Persistir `rule_version_snapshot` por questão classificada.
- Expor métricas:
  - tempo médio para concluir feedback,
  - % de tentativas com feedback completo,
  - distribuição por caderno.

### Estratégia de implementação incremental

1. **MVP**
   - tabelas principais + fluxo completo sem `outbox_event`.
2. **V2**
   - adicionar `criticality_score` e ordenação por prioridade.
3. **V3**
   - adicionar revisão espaçada automática (`next_review_at`) e eventos assíncronos.
