#!/usr/bin/env bash

set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
TOKEN="${TOKEN:-}"
TID="${TID:-}"
SIMULADO_QUESTAO_ID="${SIMULADO_QUESTAO_ID:-1}"
NONEXISTENT_TID="${NONEXISTENT_TID:-999999999}"

if [[ -z "$TOKEN" || -z "$TID" ]]; then
  echo "Uso:"
  echo "  TOKEN=<jwt> TID=<tentativa_id> [BASE_URL=http://localhost:8080] [SIMULADO_QUESTAO_ID=1] ./scripts/test-finalizacao-simulado.sh"
  exit 2
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "Erro: curl nao encontrado."
  exit 2
fi

tmp_dir="$(mktemp -d /tmp/finalizacao-check-XXXXXX)"
trap 'rm -rf "$tmp_dir"' EXIT

PASS_COUNT=0
FAIL_COUNT=0

pass() {
  local msg="$1"
  PASS_COUNT=$((PASS_COUNT + 1))
  echo "PASS - $msg"
}

fail() {
  local msg="$1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "FAIL - $msg"
}

run_put() {
  local url="$1"
  local out_file="$2"
  local data="${3:-}"

  if [[ -n "$data" ]]; then
    curl -sS -o "$out_file" -w "%{http_code}" \
      -X PUT "$url" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data"
  else
    curl -sS -o "$out_file" -w "%{http_code}" \
      -X PUT "$url" \
      -H "Authorization: Bearer $TOKEN"
  fi
}

echo "Iniciando testes em $BASE_URL para tentativa $TID"

FINALIZAR_URL="$BASE_URL/api/v1/usuarios/me/simulados/$TID/finalizar"
SALVAR_URL="$BASE_URL/api/v1/usuarios/me/simulados/$TID/respostas"
FINALIZAR_INEXISTENTE_URL="$BASE_URL/api/v1/usuarios/me/simulados/$NONEXISTENT_TID/finalizar"

# 1) Finalizacao idempotente: primeira chamada
status_1="$(run_put "$FINALIZAR_URL" "$tmp_dir/finalizar_1.json")"
if [[ "$status_1" == "200" ]]; then
  if grep -q '"finalizada"[[:space:]]*:[[:space:]]*true' "$tmp_dir/finalizar_1.json"; then
    pass "finalizar primeira chamada retorna 200 e finalizada=true"
  else
    fail "finalizar primeira chamada retornou 200, mas sem finalizada=true"
  fi
else
  fail "finalizar primeira chamada deveria retornar 200 (recebido $status_1)"
fi

# 2) Finalizacao idempotente: segunda chamada
status_2="$(run_put "$FINALIZAR_URL" "$tmp_dir/finalizar_2.json")"
if [[ "$status_2" == "200" ]]; then
  if grep -q '"finalizada"[[:space:]]*:[[:space:]]*true' "$tmp_dir/finalizar_2.json"; then
    pass "finalizar segunda chamada retorna 200 e finalizada=true (idempotente)"
  else
    fail "finalizar segunda chamada retornou 200, mas sem finalizada=true"
  fi
else
  fail "finalizar segunda chamada deveria retornar 200 (recebido $status_2)"
fi

# 3) Concorrencia: duas chamadas paralelas em tentativa ja finalizada devem manter 200
(
  run_put "$FINALIZAR_URL" "$tmp_dir/finalizar_parallel_1.json" > "$tmp_dir/finalizar_parallel_1.status"
) &
pid1=$!
(
  run_put "$FINALIZAR_URL" "$tmp_dir/finalizar_parallel_2.json" > "$tmp_dir/finalizar_parallel_2.status"
) &
pid2=$!
wait "$pid1"
wait "$pid2"

p1="$(cat "$tmp_dir/finalizar_parallel_1.status")"
p2="$(cat "$tmp_dir/finalizar_parallel_2.status")"
if [[ "$p1" == "200" && "$p2" == "200" ]]; then
  pass "finalizar em paralelo retorna 200 em ambas as chamadas"
else
  fail "finalizar em paralelo deveria retornar 200/200 (recebido $p1/$p2)"
fi

# 4) Salvar apos finalizar deve retornar 409
payload="{\"respostas\":[{\"simuladoQuestaoId\":$SIMULADO_QUESTAO_ID,\"resposta\":\"CERTO\",\"confianca\":\"CERTEZA\",\"tipoErro\":null}]}"
status_save="$(run_put "$SALVAR_URL" "$tmp_dir/salvar_apos_finalizar.json" "$payload")"
if [[ "$status_save" == "409" ]]; then
  pass "salvar respostas apos finalizar retorna 409"
else
  fail "salvar respostas apos finalizar deveria retornar 409 (recebido $status_save)"
fi

# 5) Finalizar tentativa inexistente deve retornar 404
status_404="$(run_put "$FINALIZAR_INEXISTENTE_URL" "$tmp_dir/finalizar_inexistente.json")"
if [[ "$status_404" == "404" ]]; then
  pass "finalizar tentativa inexistente retorna 404"
else
  fail "finalizar tentativa inexistente deveria retornar 404 (recebido $status_404)"
fi

echo
echo "Resumo: PASS=$PASS_COUNT FAIL=$FAIL_COUNT"
if [[ "$FAIL_COUNT" -gt 0 ]]; then
  echo "Alguns testes falharam. Consulte artefatos em $tmp_dir durante a execucao."
  exit 1
fi

echo "Todos os testes passaram."
exit 0
