"""
agent.py — Simula um agente autenticado respondendo simulados.

Cada agente tem um perfil de acerto por matéria. As respostas são
geradas aleatoriamente respeitando esse perfil, produzindo dados
realistas de desempenho variado entre os agentes.
"""

import random
import httpx
import asyncio
from dataclasses import dataclass, field
from typing import Optional

# ── Tipos de resposta e confiança disponíveis ────────────────────────────────

RESPOSTAS     = ["CERTO", "ERRADO"]
CONFIANCAS    = ["CERTEZA", "DUVIDA", "CHUTE"]
TIPOS_ERRO    = ["CONTEUDO", "INTERPRETACAO", "DISTRACAO"]

# ── Perfis de agente ─────────────────────────────────────────────────────────
# Cada perfil define taxa de acerto padrão e ajustes por matéria.
# Os agentes são distribuídos aleatoriamente entre os perfis ao iniciar.

PERFIS = [
    {
        "nome":    "Forte",
        "default": 0.78,
        "materias": {
            "Língua Portuguesa":       0.85,
            "Direito Constitucional":  0.80,
            "Regimento Interno":       0.72,
            "Informática":             0.65,
            "Raciocínio Lógico":       0.70,
        }
    },
    {
        "nome":    "Mediano",
        "default": 0.60,
        "materias": {
            "Língua Portuguesa":       0.68,
            "Direito Constitucional":  0.62,
            "Regimento Interno":       0.55,
            "Informática":             0.50,
            "Raciocínio Lógico":       0.58,
        }
    },
    {
        "nome":    "Fraco",
        "default": 0.42,
        "materias": {
            "Língua Portuguesa":       0.55,
            "Direito Constitucional":  0.40,
            "Regimento Interno":       0.35,
            "Informática":             0.30,
            "Raciocínio Lógico":       0.38,
        }
    },
]


@dataclass
class AgentConfig:
    base_url:  str
    username:  str
    password:  str
    agent_num: int
    perfil:    dict = field(default_factory=lambda: random.choice(PERFIS))


class Agent:
    def __init__(self, config: AgentConfig):
        self.config  = config
        self.token:  Optional[str] = None
        self.client  = httpx.AsyncClient(base_url=config.base_url, timeout=30)

    # ── Autenticação ─────────────────────────────────────────────────────────

    async def login(self) -> bool:
        try:
            resp = await self.client.post("/api/v1/auth/agent/login", json={
                "username": self.config.username,
                "password": self.config.password,
            })
            if resp.status_code == 200:
                self.token = resp.json()["token"]
                self.client.headers.update({"Authorization": f"Bearer {self.token}"})
                return True
            print(f"  [Agente {self.config.agent_num}] Login falhou: {resp.status_code}")
            return False
        except Exception as e:
            print(f"  [Agente {self.config.agent_num}] Erro no login: {e}")
            return False

    # ── Simulados disponíveis ─────────────────────────────────────────────────

    async def listar_simulados(self) -> list[dict]:
        resp = await self.client.get("/api/v1/simulados")
        if resp.status_code == 200:
            return resp.json()
        return []

    # ── Fluxo completo de um simulado ────────────────────────────────────────

    async def responder_simulado(self, simulado_id: int, questoes_cache: dict) -> bool:
        try:
            # 1. Iniciar
            resp = await self.client.post(
                f"/api/v1/simulados/{simulado_id}/iniciar?refazer=true"
            )
            if resp.status_code != 200:
                return False

            tentativa_id = resp.json()["tentativaId"]

            # 2. Buscar questões do cache (carregado antes do login)
            questoes = questoes_cache.get(simulado_id, [])
            if not questoes:
                return False

            # 3. Montar respostas com base no perfil de acerto
            respostas = []
            for q in questoes:
                materia_nome = q.get("materiaNome", "")
                taxa_acerto  = self.config.perfil["materias"].get(
                    materia_nome,
                    self.config.perfil["default"]
                )
                acerta = random.random() < taxa_acerto

                respostas.append({
                    "simuladoQuestaoId": q["id"],
                    "resposta":  "CERTO" if acerta else "ERRADO",
                    "confianca": random.choices(
                        CONFIANCAS,
                        weights=[taxa_acerto, 0.3, 1 - taxa_acerto]
                    )[0],
                    "tipoErro": None if acerta else random.choice(TIPOS_ERRO),
                })

            # 4. Salvar respostas em lote
            resp = await self.client.put(
                f"/api/v1/usuarios/me/simulados/{tentativa_id}/respostas",
                json={"respostas": respostas}
            )
            if resp.status_code != 200:
                return False

            # 5. Finalizar
            resp = await self.client.put(
                f"/api/v1/usuarios/me/simulados/{tentativa_id}/finalizar"
            )
            return resp.status_code == 200

        except Exception as e:
            print(f"  [Agente {self.config.agent_num}] Erro ao responder simulado {simulado_id}: {e}")
            return False

    # ── Execução completa do agente ───────────────────────────────────────────

    async def run(self, simulado_ids: list[int], questoes_cache: dict) -> dict:
        resultados = {"agente": self.config.agent_num, "perfil": self.config.perfil["nome"],
                      "ok": 0, "erro": 0}

        if not await self.login():
            resultados["erro"] = len(simulado_ids)
            return resultados

        for sim_id in simulado_ids:
            sucesso = await self.responder_simulado(sim_id, questoes_cache)
            if sucesso:
                resultados["ok"] += 1
            else:
                resultados["erro"] += 1

            await asyncio.sleep(0.5)

        await self.client.aclose()
        return resultados