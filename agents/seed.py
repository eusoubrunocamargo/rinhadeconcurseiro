"""
seed.py — Cria usuários agentes no banco de dados.

Uso:
    python seed.py --host localhost --port 5432 \
                   --db rinhadeconcurseiro \
                   --user postgres --password senha \
                   --agents 50
"""

import argparse
import psycopg2
import bcrypt

# ── Configuração padrão dos agentes ─────────────────────────────────────────

SENHA_PADRAO = "agent@rinha2024"  # mesma senha para todos — só usada pelo script


def criar_agentes(conn, total: int):
    cursor = conn.cursor()
    criados = 0
    pulados = 0

    for i in range(1, total + 1):
        google_id    = f"AGENT_{i:04d}"
        email        = f"agent{i:04d}@rinha.internal"
        nome         = f"Agente {i:04d}"
        password_hash = bcrypt.hashpw(SENHA_PADRAO.encode(), bcrypt.gensalt()).decode()

        try:
            cursor.execute("""
                INSERT INTO usuario (google_id, nome, email, ativo, role, password_hash, created_at)
                VALUES (%s, %s, %s, true, 'AGENT', %s, NOW())
                ON CONFLICT (google_id) DO NOTHING
            """, (google_id, nome, email, password_hash))

            if cursor.rowcount > 0:
                criados += 1
            else:
                pulados += 1

        except Exception as e:
            print(f"  Erro ao criar agente {i}: {e}")

    conn.commit()
    cursor.close()
    print(f"\n✅ Agentes criados: {criados} | Já existiam: {pulados}")


def main():
    parser = argparse.ArgumentParser(description="Seed de agentes para Rinha de Concurseiro")
    parser.add_argument("--host",     default="localhost")
    parser.add_argument("--port",     default=5432, type=int)
    parser.add_argument("--db",       default="rinhadeconcurseiro")
    parser.add_argument("--user",     default="postgres")
    parser.add_argument("--password", required=True)
    parser.add_argument("--agents",   default=50, type=int, help="Número de agentes a criar")
    args = parser.parse_args()

    print(f"Conectando ao banco {args.db}@{args.host}:{args.port}...")
    conn = psycopg2.connect(
        host=args.host, port=args.port,
        dbname=args.db, user=args.user, password=args.password
    )
    print(f"Criando {args.agents} agentes...")
    criar_agentes(conn, args.agents)
    conn.close()


if __name__ == "__main__":
    main()