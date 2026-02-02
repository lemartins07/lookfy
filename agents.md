# AGENTS.md — Guia de Desenvolvimento (Monorepo Next.js + NestJS)

Este repositório é desenvolvido com suporte de agentes (IA) e humanos.
O objetivo é manter código limpo, testável e com arquitetura limpa com um app Web em Next e a API em Nest.

---

## 0) Regra de ouro (antes de codar)

✅ Antes de codar uma solução, apresente o plano de desenvolvimento e aguarde a confirmação para executar o código.

O plano deve incluir:

- abordagem técnica
- arquivos que serão criados/alterados
- impacto em rotas, schema e banco
- testes a adicionar/ajustar
- migrações (se houver)

Sempre que apresentar opcoes de escolha, incluir uma breve descricao do motivo para usar cada uma e seus trade-offs.

✅ Usar `next/image` para todas as imagens (evitar `<img>`).

---

## 1) Princípios do MVP (Next e Nest)

- API roda no **Nest** (`apps/api`) e o app web no **Next** (`apps/web`).
- Separacao clara entre Web (UI) e API (regras/infra), sem acesso direto do web ao banco.
- Contratos entre API e Web devem ser tipados e consistentes.

---

## 2) Arquitetura (camadas) e regras de dependência

### Camadas

- **API (Nest):** módulos, controllers, serviços, casos de uso, DTOs, infra (Prisma, providers externos).
- **Web (Next):** UI, server actions/route handlers quando necessario para o web, integracao com API.
- **Shared (opcional):** contratos tipados reutilizados entre API e Web.

### Regras de dependência (obrigatórias)

- **Web** nao importa Prisma nem acessa DB direto.
- **API** concentra regras de negocio e infra; controllers apenas orquestram.
- **Shared** (se existir) nao depende de Next/Nest.

---

## 3) Estrutura de pastas (sugestão)

- `apps/api/src/`
  - `modules/`, `infra/`, `presentation/`, `application/`
- `apps/web/src/`
  - `app/`, `components/`, `lib/`, `hooks/`
- `packages/contracts/` (opcional)
  - schemas e tipos compartilhados

---

## 4) Contratos (tipos) — padrão obrigatório

- **API (Nest):** usar DTOs + validação com **Zod** (ou class-validator quando fizer sentido).
- **Web (Next):** usar tipos derivados dos contratos expostos pela API e validar input com **Zod** nas bordas.
- **Shared:** os tipos devem ser derivados dos schemas Zod.

---

## 5) Padrão de endpoints (Nest) e Web

### API (Nest)

- Controllers:
  1. autenticação/autorização (se aplicável)
  2. validar input (DTOs + pipes)
  3. chamar use case/servico
  4. mapear retorno/erro para HTTP

### Web (Next)

- Server actions/route handlers apenas quando necessario para o web.

---

## 6) Regras de banco (Prisma) e migrações

- Prisma será adotado no futuro. **Mantenha as regras abaixo quando ele entrar no projeto.**
- Alterou model Prisma? ✅ criar migration.
- DB fica na API. Nao usar query direta no web.

---

## 7) Tratamento de erros (padrão único)
exige migração
- Erros de domínio (core): `DomainError` (ex.: `NotFound`, `Validation`, `Conflict`)
- Web layer converte erro → status code + body padronizado.

**Não** lançar `Error("string")` no core.

---

## 7.1) Finalização do desenvolvimento do código

- executar o script `typecheck` para verificar erros;
- caso tenha erro corriji-los;

## 8) Convenções de commit e branches

- Branches:
  - `feat/...`, `fix/...`, `chore/...`, `docs/...`
- Commits (sugestão):
  - Conventional Commits: `feat:`, `fix:`, etc.

---

## 9) Testes (mínimo aceitável)

- `api`: testes unitarios para regras relevantes
- `adapters`: teste quando houver lógica de mapeamento relevante
- `web`: smoke test/integração quando endpoints críticos mudarem
- rodar `lint` quando houver mudanças relevantes

### 9.1) Estrutura de testes (a adotar)

- `apps/api/tests/unit/` e `apps/api/tests/integration/`
- `apps/web/tests/unit/` e `apps/web/tests/e2e/`
- Para o repositório atual (apenas web em `app/`), usar `app/tests/unit/` e `app/tests/e2e/`

---

## 10) Segurança (mínimo do MVP)

- Validar input com Zod sempre.
- Nunca logar tokens/segredos.
- Sanitizar/normalizar dados de entrada onde fizer sentido.
- Rate limit e proteção básica em endpoints sensíveis (quando aplicável).

---

## 11) Definition of Done (DoD)

Uma tarefa está “pronta” quando:

- passa lint/typecheck/build (api e web)
- lint rodado sem erros
- contratos Zod estão corretos
- regra de dependência não foi violada (core sem infra)
- testes adicionados/ajustados (quando aplicável)
- sem TODOs soltos sem issue linkada

---

## 12) Checklist rápido (antes do PR)

- [ ] Zod schema para input
- [ ] Use case no core (sem dependência de infra)
- [ ] Port + adapter quando precisar DB/IA
- [ ] Erros de domínio mapeados
- [ ] passa lint/typecheck/build (api e web)
- [ ] lint rodado sem erros
- [ ] Testes relevantes
- [ ] Documentação mínima atualizada (README/PRD se necessário)
