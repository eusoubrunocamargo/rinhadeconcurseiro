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
