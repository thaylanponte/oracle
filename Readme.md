# Oracle (API própria)

API simples em Node/TS para servir um “Oracle” (repositório de regras, links e convenções) consumível por humanos e por IA.

## Requisitos
- Node.js 18+ (ou Docker)

## Configuração
1. Copie `.env.example` para `.env` e ajuste as variáveis.
2. Edite `data/oracle.json` com suas informações (sensíveis **não** devem ir aqui).

## Rodando (local)
```bash
npm install
npm run dev
# Abra http://localhost:${PORT:-3009}/oracle
