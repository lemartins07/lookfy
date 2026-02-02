# PRD — Lookfy (v0.1)

## 1. Visão geral
Webapp PWA (instalável em celular), mobile-first e acessível via desktop, que atua como consultor de estilo pessoal usando IA para sugerir looks com base no guarda-roupa cadastrado, no estilo desejado e no modo de guarda-roupa (cápsula ou livre). Também recomenda itens a comprar para preencher gaps e compor o guarda-roupa.

## 2. Objetivo do MVP
- Gerar looks prontos para ocasiões do dia a dia usando peças já cadastradas.
- Sugerir uma lista de compras complementar com base em gaps do guarda-roupa (sem integração com lojas).
- Permitir escolha do modo de guarda-roupa (cápsula ou livre) por usuário e ajustar recomendações.
- Ser simples, rápido e útil para uso pessoal.

## 3. Público-alvo
- Uso pessoal do criador do produto (gênero e rotina definidos pelo próprio usuário durante o onboarding).

## 4. Escopo do MVP
Inclui:
- Onboarding de estilo (preferências, objetivos, cores, restrições).
- Escolha do modo de guarda-roupa (cápsula ou livre) e possibilidade de alterar depois.
- Cadastro do guarda-roupa (manual com fotos e tags).
- Geração de looks por ocasião + clima (informado pelo usuário).
- Visão geral com métricas simples (versatilidade/variedade) e sugestões rápidas.
- Lista de compras com prioridades baseada em gaps (sem links externos).
- Feedback do usuário (👍/👎) para refinar sugestões.
- Histórico de looks salvos/favoritos.

Fora do escopo (por agora):
- Integração com lojas/marketplaces.
- Importação automática de e-commerce.
- Recomendação baseada em preços reais.
- Funcionalidade offline.

## 5. Principais fluxos
1. **Onboarding**
   - Cadastro via email/senha ou Google.
   - Definir estilo via chat com perguntas guiadas (respostas em texto livre).
   - Selecionar modo de guarda-roupa (cápsula ou livre).
   - Gerar e salvar Perfil de Estilo estruturado.
2. **Visão geral**
   - Mostrar métricas de versatilidade/variedade, peças-chave e gaps.
   - Exibir sugestões rápidas de compras baseadas no modo escolhido.
3. **Cadastro do guarda-roupa**
   - Adicionar peça com: foto, categoria, cor, material, tags, estação.
4. **Gerar look**
   - Selecionar ocasião + clima.
   - Receber 1–3 sugestões com peças do inventário.
5. **Completar look**
   - Listar itens sugeridos para compra (priorizados por gap).
6. **Feedback**
   - Avaliar looks para ajuste futuro.

## 6. Requisitos funcionais
- Usuário pode criar/editar/remover peças do guarda-roupa.
- Usuário pode definir e alterar modo de guarda-roupa (cápsula ou livre).
- Usuário pode gerar looks com base em ocasião e preferências.
- Usuário pode salvar looks e favoritar.
- Sistema identifica gaps do guarda-roupa e sugere compras complementares.
- Sistema adapta métricas e sugestões conforme o modo escolhido.
- Usuário pode dar feedback (👍/👎).

## 7. Requisitos não-funcionais
- Webapp PWA instalável (Add to Home Screen) com manifest e service worker.
- Mobile-first com layout responsivo para desktop.
- Tempo de resposta rápido (< 5s para gerar sugestões).
- Dados persistidos localmente no backend (sem offline).

## 8. Métricas de sucesso (MVP)
- % de looks salvos/favoritos.
- Número de looks gerados por semana.
- % de itens sugeridos para compra que o usuário considera úteis.
- Retenção semanal do usuário (uso pessoal).
- % de sugestões geradas a partir de gaps que recebem feedback positivo.

## 9. Dados essenciais (modelo mínimo)
- **Usuário**: estilo alvo, preferências, restrições, modo_guardaroupa (capsula | livre).
- **Perfil de estilo**: resultado final do chat (campos estruturados).
- **Peça**: categoria, cor, material, tags, estação, foto.
- **Look**: lista de peças, ocasião, clima, data, avaliação.
- **Lista de compras**: item, prioridade, motivo, gap_associado.

## 10. Riscos
- Base de peças pequena → sugestões repetitivas.
- Baixa qualidade do cadastro → recomendações fracas.
- Falta de critério para priorizar compras.
- Definição de gaps vaga pode reduzir a utilidade das sugestões.

## 11. Stack recomendada
- Frontend: Next.js (App Router) + Tailadmin.
- API: Route Handlers no Next.
- Auth: Auth.js (Google Provider).
- Banco: Postgres + Prisma.
- Deploy: Vercel + Supabase ou Neon.
- IA: OpenAI via backend proxy (API do Next).

## 12. Arquitetura de backend (camadas)
Objetivo: permitir evoluir de API no Next para uma API Nest sem reescrever regras de negócio.

Camadas e responsabilidades:
- **Domain** (`src/domain/`): entidades e regras invariantes (ex.: validação de peça, regras de combinação).
- **Services/Use Cases** (`src/services/`): orquestração dos fluxos (ex.: gerar look, sugerir compras).
- **Repositories** (`src/repositories/`): contratos e implementações de persistência (Prisma como adapter).
- **API/Adapters HTTP** (`src/app/api/`): Route Handlers do Next (input/output, auth, rate limit).
- **Integrations** (`src/integrations/`): OpenAI client e providers externos (isolado).

Estrutura sugerida (MVP):
- `src/domain/models/` (User, Item, Look, ShoppingSuggestion)
- `src/domain/rules/` (regras de estilo e compatibilidade)
- `src/services/` (GenerateLook, SuggestShoppingList, ManageWardrobe)
- `src/repositories/interfaces/` (WardrobeRepo, LookRepo, UserRepo)
- `src/repositories/prisma/` (implementações Prisma)
- `src/app/api/` (routes REST internas)
- `src/integrations/openai/` (prompt templates e client)

Convenções:
- Domain e Services não importam Next/Prisma diretamente.
- Route Handlers dependem de Services e Repositories via composição.
- Prompts e lógica de IA isolados em `integrations` para facilitar troca futura.

## 13. Próximos passos sugeridos
1. Definir estrutura de dados (schemas).
2. Desenhar 3 telas principais: onboarding, guarda-roupa, gerar look.
3. Implementar MVP funcional e testar fluxo end-to-end.

## 14. Fluxo 1 — Cadastro + Definição de Estilo (Chat)
Objetivo: obter um Perfil de Estilo enxuto, porém útil para sugestões iniciais.

Cadastro:
- Email + senha (credentials) ou Google.

Chat guiado (respostas livres):
1. Como você gostaria de ser percebido(a) pelo seu estilo?
2. Quais estilos você mais gosta ou se inspira?
3. Quais cores você prefere usar no dia a dia? E quais evita?
4. Quais ocasiões são mais comuns na sua rotina?
5. Você prefere roupas mais ajustadas ou mais soltas?
6. Existe algum tecido/peça que você não usa?
7. Você prefere um guarda-roupa cápsula (mais enxuto) ou livre (mais variedade)?

Resultado do chat (Perfil de Estilo — campos do MVP):
- **estilo_base**: (ex.: minimalista, casual elegante, street, clássico)
- **paleta_cores**: lista de cores preferidas
- **cores_evitar**: lista de cores a evitar
- **nivel_formalidade**: baixo / médio / alto
- **ocasiões_frequentes**: trabalho, social, casual, academia, etc.
- **silhuetas_preferidas**: slim / regular / oversized
- **materiais_preferidos**: algodão, linho, couro, etc.
- **pecas_evitar**: itens específicos (ex.: “sem estampas grandes”)
- **modo_guardaroupa**: capsula | livre

Persistência:
- Salva apenas o resultado final do Perfil de Estilo.

## 15. Modo de guarda-roupa (cápsula vs livre)
Objetivo: ajustar métricas, gaps e sugestões sem impor limite rígido de peças.

Regras de recomendação (MVP):
- **Cápsula**: prioriza versatilidade (peças-curinga), reduz redundância e busca equilíbrio entre categorias.
- **Livre**: prioriza variedade (cores/estilos/ocasiões) e aceita redundância moderada.

Gaps e compras sugeridas:
- Gaps são definidos por baixa cobertura de ocasiões, baixa versatilidade por peça e categorias sub-representadas.
- As sugestões sempre indicam o motivo do gap e o ganho esperado em combinações.
