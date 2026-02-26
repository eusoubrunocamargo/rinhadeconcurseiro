"""
run.py — Orquestra agentes em paralelo para gerar massa de dados.

Uso:
    python run.py --url http://localhost:8080 --agents 50 --concurrency 10

Parâmetros:
    --url           URL base do backend         (default: http://localhost:8080)
    --agents        Número de agentes a simular (default: 50)
    --concurrency   Agentes rodando em paralelo (default: 10)
    --simulados     IDs dos simulados separados por vírgula (default: todos disponíveis)
    --password      Senha dos agentes           (default: agent@rinha2024)
"""

import asyncio
import argparse
import httpx
import time
from agent import Agent, AgentConfig, PERFIS
import random


async def buscar_simulados_disponiveis(base_url: str) -> list[int]:
    """Busca IDs de todos os simulados disponíveis (sem autenticação)."""
    async with httpx.AsyncClient(base_url=base_url, timeout=10) as client:
        resp = await client.get("/api/v1/simulados")
        if resp.status_code == 200:
            return [s["id"] for s in resp.json()]
        return []


async def carregar_questoes_cache(base_url: str, simulado_ids: list[int]) -> dict:
    """Busca os simuladoQuestaoId+materiaNome de cada simulado uma única vez."""
    cache = {}
    async with httpx.AsyncClient(base_url=base_url, timeout=30) as client:
        for sim_id in simulado_ids:
            resp = await client.get(f"/api/v1/simulados/{sim_id}/questoes")
            if resp.status_code == 200:
                cache[sim_id] = resp.json()
            else:
                print(f"  Aviso: não foi possível carregar questões do simulado {sim_id}")
    print(f"Cache carregado: {len(cache)} simulados, "
          f"{sum(len(v) for v in cache.values())} questões no total.")
    return cache


async def rodar_agente(semaphore: asyncio.Semaphore, config: AgentConfig,
                       simulado_ids: list[int], questoes_cache: dict) -> dict:
    async with semaphore:
        agent = Agent(config)
        return await agent.run(simulado_ids, questoes_cache)


async def main():
    parser = argparse.ArgumentParser(description="Orquestrador de agentes — Rinha de Concurseiro")
    parser.add_argument("--url",         default="http://localhost:8080")
    parser.add_argument("--agents",      default=50,  type=int)
    parser.add_argument("--concurrency", default=10,  type=int)
    parser.add_argument("--simulados",   default=None, help="IDs separados por vírgula, ex: 1,2,3")
    parser.add_argument("--password",    default="agent@rinha2024")
    args = parser.parse_args()

    # Resolver simulados alvo
    if args.simulados:
        simulado_ids = [int(x) for x in args.simulados.split(",")]
    else:
        print("Buscando simulados disponíveis...")
        simulado_ids = await buscar_simulados_disponiveis(args.url)
        if not simulado_ids:
            print("Nenhum simulado encontrado. Verifique a URL e se o backend está rodando.")
            return

    print(f"Simulados alvo: {simulado_ids}")
    print(f"Carregando questões dos simulados...")
    questoes_cache = await carregar_questoes_cache(args.url, simulado_ids)

    print(f"Iniciando {args.agents} agentes (concorrência: {args.concurrency})...\n")

    semaphore = asyncio.Semaphore(args.concurrency)
    inicio    = time.time()

    tarefas = [
        rodar_agente(
            semaphore,
            AgentConfig(
                base_url  = args.url,
                username  = f"agent{i+1:04d}@rinha.internal",
                password  = args.password,
                agent_num = i + 1,
                perfil    = random.choice(PERFIS),
            ),
            simulado_ids,
            questoes_cache,
        )
        for i in range(args.agents)
    ]

    resultados = await asyncio.gather(*tarefas)

    # ── Relatório ────────────────────────────────────────────────────────────
    duracao    = time.time() - inicio
    total_ok   = sum(r["ok"]   for r in resultados)
    total_erro = sum(r["erro"] for r in resultados)

    por_perfil: dict[str, dict] = {}
    for r in resultados:
        p = r["perfil"]
        if p not in por_perfil:
            por_perfil[p] = {"agentes": 0, "simulados_ok": 0}
        por_perfil[p]["agentes"]      += 1
        por_perfil[p]["simulados_ok"] += r["ok"]

    print("\n" + "═" * 50)
    print("  RELATÓRIO FINAL")
    print("═" * 50)
    print(f"  Agentes executados : {args.agents}")
    print(f"  Simulados alvo     : {len(simulado_ids)}")
    print(f"  Tentativas criadas : {total_ok}")
    print(f"  Erros              : {total_erro}")
    print(f"  Tempo total        : {duracao:.1f}s")
    print()
    print("  Por perfil:")
    for perfil, dados in por_perfil.items():
        print(f"    {perfil:10s} → {dados['agentes']} agentes, {dados['simulados_ok']} tentativas")
    print("═" * 50)


if __name__ == "__main__":
    asyncio.run(main())