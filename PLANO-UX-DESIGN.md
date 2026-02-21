# Plano de Implementação - Melhorias UX/Design

**Data:** 21/02/2026  
**Versão:** 1.0  
**Checkpoint Base:** 78d8fff9

---

## 📊 Visão Geral

Este documento detalha o plano de implementação das melhorias de UX/Design solicitadas, organizadas por prioridade e complexidade.

### Estatísticas

- **Total de Melhorias:** 15
- **Bugs Críticos:** 3
- **Melhorias UX:** 7
- **Funcionalidades Novas:** 3
- **Limpeza de Dados:** 2

---

## 🎯 Priorização (Matriz Impacto × Esforço)

### Alta Prioridade (Quick Wins)

| Item | Impacto | Esforço | Tempo Estimado |
|------|---------|---------|----------------|
| 1. Favicon | ⭐⭐⭐ | 🔧 Baixo | 10 min |
| 2. Menu duplicado | ⭐⭐⭐ | 🔧 Baixo | 15 min |
| 3. Accordion fechado | ⭐⭐⭐ | 🔧 Baixo | 10 min |
| 4. Reorganizar Home | ⭐⭐⭐ | 🔧 Baixo | 20 min |
| 5. Zero à esquerda | ⭐⭐⭐ | 🔧 Baixo | 15 min |
| 6. Limpar strains | ⭐⭐ | 🔧 Baixo | 20 min |

**Subtotal:** ~1h30min

### Média Prioridade (Melhorias Visuais)

| Item | Impacto | Esforço | Tempo Estimado |
|------|---------|---------|----------------|
| 7. Destaque PPFD | ⭐⭐⭐ | 🔧🔧 Médio | 30 min |
| 8. Input responsivo | ⭐⭐⭐ | 🔧🔧 Médio | 30 min |
| 9. Histórico rega | ⭐⭐⭐ | 🔧🔧 Médio | 45 min |
| 10. Redesign pH | ⭐⭐⭐⭐ | 🔧🔧🔧 Alto | 2h |
| 11. Tema Alto Contraste | ⭐⭐⭐⭐ | 🔧🔧🔧 Alto | 2h |

**Subtotal:** ~5h45min

### Baixa Prioridade (Funcionalidades Complexas)

| Item | Impacto | Esforço | Tempo Estimado |
|------|---------|---------|----------------|
| 12. Modal mover plantas | ⭐⭐⭐⭐ | 🔧🔧🔧 Alto | 2h |
| 13. Arquivo plantas | ⭐⭐⭐⭐⭐ | 🔧🔧🔧🔧 Muito Alto | 4h |
| 14. Histórico fertilização | ⭐⭐⭐⭐ | 🔧🔧🔧 Alto | 2h |

**Subtotal:** ~8h

---

## 📅 Cronograma de Implementação

### Sprint 1: Quick Wins (1 sessão - ~2h)

**Objetivo:** Resolver bugs críticos e melhorias rápidas

#### Dia 1 - Sessão 1 (2h)

**1.1. Favicon (10 min)**
- [ ] Extrair ícone da plantinha do menu (`client/public/` ou `client/src/assets/`)
- [ ] Gerar favicon.ico (16x16, 32x32, 48x48)
- [ ] Atualizar `client/index.html` com novo favicon
- [ ] Testar em navegador

**Arquivos:**
```
client/index.html
client/public/favicon.ico
```

---

**1.2. Menu Duplicado em Gerenciar Tarefas (15 min)**
- [ ] Abrir `client/src/pages/Tasks.tsx`
- [ ] Localizar tabs duplicadas
- [ ] Remover duplicação
- [ ] Testar navegação entre tabs

**Arquivos:**
```
client/src/pages/Tasks.tsx
```

---

**1.3. Accordion Fechado por Padrão (10 min)**
- [ ] Abrir `client/src/pages/Settings.tsx` ou componente de alertas
- [ ] Localizar Accordion de margens de alertas
- [ ] Remover `defaultValue` ou definir como `undefined`
- [ ] Testar abertura/fechamento

**Arquivos:**
```
client/src/pages/Settings.tsx (ou AlertSettings.tsx)
```

---

**1.4. Reorganizar Widgets da Home (20 min)**
- [ ] Abrir `client/src/pages/Home.tsx`
- [ ] Identificar ordem atual dos widgets
- [ ] Reordenar: Estufas → Clima → Alertas → Ações Rápidas
- [ ] Ajustar espaçamentos se necessário
- [ ] Testar responsividade mobile

**Arquivos:**
```
client/src/pages/Home.tsx
```

---

**1.5. Corrigir Zero à Esquerda (15 min)**
- [ ] Abrir `client/src/pages/Calculators.tsx` (aba Fertilização)
- [ ] Localizar input de litros
- [ ] Adicionar `onInput` para remover zeros à esquerda
- [ ] Testar digitação: 01 → 1, 001 → 1

**Código:**
```tsx
onInput={(e) => {
  const input = e.currentTarget;
  input.value = input.value.replace(/^0+(?=\d)/, '');
}}
```

**Arquivos:**
```
client/src/pages/Calculators.tsx
```

---

**1.6. Limpar Strains de Teste (20 min)**
- [ ] Criar script `clean-strains.mjs`
- [ ] Deletar todas as strains exceto 8 comuns
- [ ] Adicionar 8 strains brasileiras se faltando:
  * OG Kush, Blue Dream, Northern Lights
  * White Widow, Gorilla Glue, Amnesia Haze
  * Girl Scout Cookies, Sour Diesel
- [ ] Executar script no banco de dados
- [ ] Verificar na interface

**Arquivos:**
```
clean-strains.mjs (novo)
```

---

### Sprint 2: Melhorias Visuais (2 sessões - ~6h)

**Objetivo:** Melhorar design e responsividade

#### Dia 2 - Sessão 1 (3h)

**2.1. Destaque no Input PPFD (30 min)**
- [ ] Abrir `client/src/pages/Calculators.tsx` (aba PPFD)
- [ ] Aumentar tamanho do input principal
- [ ] Adicionar classes: `text-4xl font-bold` no input
- [ ] Adicionar label maior e mais visível
- [ ] Testar em desktop e mobile

**Arquivos:**
```
client/src/pages/Calculators.tsx
```

---

**2.2. Input Responsivo com rem (30 min)**
- [ ] Localizar todos os inputs de números nas calculadoras
- [ ] Substituir `text-lg` por `text-base md:text-lg lg:text-xl`
- [ ] Testar em diferentes resoluções (mobile, tablet, desktop)

**Arquivos:**
```
client/src/pages/Calculators.tsx
```

---

**2.3. Redesign Calculadora de pH (2h)**

**Análise Atual:**
- Input de pH atual
- Input de pH desejado
- Botão calcular
- Resultado em texto

**Novo Design (Inspiração: App Moderno)**

**Wireframe:**
```
┌─────────────────────────────────────┐
│  📊 Ajuste de pH                    │
├─────────────────────────────────────┤
│                                     │
│  pH Atual                           │
│  ┌───────────────────────────────┐ │
│  │    ●────────────●────────     │ │
│  │   4.0         6.5        8.0  │ │
│  └───────────────────────────────┘ │
│                                     │
│  pH Desejado                        │
│  ┌───────────────────────────────┐ │
│  │    ●────────●────────────     │ │
│  │   4.0      5.8           8.0  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🧪 Calcular Ajuste         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  💧 Adicionar 2.5ml de      │   │
│  │     pH Down por litro       │   │
│  │                             │   │
│  │  📊 Diferença: -0.7         │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Componentes:**
- Slider visual com marcadores coloridos (vermelho < 5.5, verde 5.5-6.5, amarelo > 6.5)
- Card de resultado com ícones e cores
- Animação suave ao calcular

**Tarefas:**
- [ ] Criar componente `PHCalculatorModern.tsx`
- [ ] Implementar sliders com `shadcn/ui Slider`
- [ ] Adicionar cores condicionais (vermelho/verde/amarelo)
- [ ] Criar card de resultado animado
- [ ] Adicionar ícones (🧪 💧 📊)
- [ ] Testar usabilidade

**Arquivos:**
```
client/src/components/PHCalculatorModern.tsx (novo)
client/src/pages/Calculators.tsx (integrar)
```

---

#### Dia 2 - Sessão 2 (3h)

**2.4. Tema Alto Contraste (Kindle Mode) (2h)**

**Especificações:**
- Fundo: Branco puro (#FFFFFF)
- Texto: Preto puro (#000000)
- Bordas: Cinza escuro (#333333)
- Sem gradientes, sem sombras, sem cores
- Fonte: Serif (Georgia ou similar) para leitura longa
- Contraste mínimo: 21:1 (WCAG AAA)

**Paleta de Cores:**
```css
:root[data-theme="contrast"] {
  --background: 0 0% 100%;           /* Branco */
  --foreground: 0 0% 0%;             /* Preto */
  --card: 0 0% 98%;                  /* Cinza muito claro */
  --card-foreground: 0 0% 0%;        /* Preto */
  --primary: 0 0% 0%;                /* Preto */
  --primary-foreground: 0 0% 100%;   /* Branco */
  --border: 0 0% 20%;                /* Cinza escuro */
  --input: 0 0% 20%;                 /* Cinza escuro */
  --ring: 0 0% 0%;                   /* Preto */
}
```

**Tarefas:**
- [ ] Adicionar tema "contrast" em `client/src/index.css`
- [ ] Atualizar `ThemeProvider` para suportar 3 temas
- [ ] Criar `ThemeToggle` com 3 estados (light → dark → contrast → light)
- [ ] Adicionar ícone para tema contrast (📖 ou 🔲)
- [ ] Testar legibilidade em todas as páginas
- [ ] Ajustar componentes que usam cores hardcoded

**Arquivos:**
```
client/src/index.css
client/src/App.tsx
client/src/components/ThemeToggle.tsx
```

---

**2.5. Adicionar Semana/Ciclo no Histórico de Rega (45 min)**

**Análise:**
- Histórico atual mostra apenas receita
- Falta contexto: qual semana? qual ciclo?

**Solução:**
- [ ] Abrir backend `server/routers.ts` → `wateringApplications.list`
- [ ] Adicionar JOIN com `cycles` e `plants`
- [ ] Retornar `weekNumber` e `cycleName`
- [ ] Atualizar frontend para exibir: "Semana 3 - Ciclo Vega A"

**Arquivos:**
```
server/routers.ts
client/src/pages/Calculators.tsx (aba Rega)
```

---

### Sprint 3: Funcionalidades Complexas (3 sessões - ~8h)

**Objetivo:** Implementar funcionalidades que requerem backend + frontend

#### Dia 3 - Sessão 1 (2h)

**3.1. Modal Visual para Mover Plantas (2h)**

**Design Atual:** Dropdown simples

**Novo Design:** Modal com cards visuais

**Wireframe:**
```
┌─────────────────────────────────────────┐
│  Mover Planta: OG Kush #1               │
├─────────────────────────────────────────┤
│                                         │
│  Selecione a estufa de destino:        │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ 🏠 Estufa│  │ 🌱 Estufa│  │ 🌸 Est.││
│  │    A     │  │    B     │  │    C   ││
│  │          │  │          │  │        ││
│  │ 60x120cm │  │ 80x80cm  │  │120x120 ││
│  │ 2 plantas│  │ 3 plantas│  │3 planta││
│  │          │  │          │  │        ││
│  │ [Atual]  │  │ Selecionar│ │Selecio.││
│  └──────────┘  └──────────┘  └────────┘│
│                                         │
│  Motivo (opcional):                     │
│  ┌───────────────────────────────────┐ │
│  │ Transplantar para flora           │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [Cancelar]              [Mover Planta]│
└─────────────────────────────────────────┘
```

**Componentes:**
- Cards com ícone, nome, dimensões, contador de plantas
- Card atual desabilitado
- Textarea para motivo (opcional)

**Tarefas:**
- [ ] Criar componente `MovePlantModal.tsx`
- [ ] Buscar lista de estufas com contador de plantas
- [ ] Criar grid de cards (3 colunas desktop, 1 mobile)
- [ ] Adicionar estado selecionado (borda verde)
- [ ] Integrar com `plants.moveTent` procedure
- [ ] Substituir dropdown atual pelo modal
- [ ] Testar movimentação

**Arquivos:**
```
client/src/components/MovePlantModal.tsx (novo)
client/src/pages/PlantDetail.tsx (integrar)
```

---

#### Dia 3 - Sessão 2 (2h)

**3.2. Histórico de Fertilização (2h)**

**Problema:** Calculadora não salva histórico

**Solução:** Criar tabela e procedures

**Schema:**
```typescript
export const fertilizationApplications = mysqlTable('fertilizationApplications', {
  id: serial('id').primaryKey(),
  plantId: int('plantId').references(() => plants.id),
  cycleId: int('cycleId').references(() => cycles.id),
  weekNumber: int('weekNumber').notNull(),
  phase: mysqlEnum('phase', ['VEGA', 'FLORA']).notNull(),
  targetEC: decimal('targetEC', { precision: 3, scale: 1 }),
  volumeL: decimal('volumeL', { precision: 5, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow(),
});
```

**Backend:**
- [ ] Adicionar tabela `fertilizationApplications` ao schema
- [ ] Criar procedure `fertilizationApplications.create`
- [ ] Criar procedure `fertilizationApplications.list`
- [ ] Executar `pnpm db:push`

**Frontend:**
- [ ] Adicionar botão "Salvar no Histórico" na calculadora
- [ ] Criar seção "Histórico" na aba de Fertilização
- [ ] Exibir lista de aplicações anteriores
- [ ] Mostrar: Data, Semana, Fase, EC, Volume, Notas

**Arquivos:**
```
drizzle/schema.ts
server/routers.ts
client/src/pages/Calculators.tsx
```

---

#### Dia 4 - Sessão 1 (4h)

**3.3. Arquivo de Plantas Finalizadas (4h)**

**Análise:**
- Atualmente: "Finalizar Planta" marca como HARVESTED
- Problema: Plantas finalizadas ainda aparecem nas estufas
- Solução: Criar página "Arquivo" separada

**Mudanças no Schema:**
```typescript
export const plants = mysqlTable('plants', {
  // ... campos existentes
  archivedAt: timestamp('archivedAt'), // NULL = ativa, NOT NULL = arquivada
  archiveReason: mysqlEnum('archiveReason', ['HARVESTED', 'DISCARDED', 'DIED']),
});
```

**Backend:**
- [ ] Adicionar campos `archivedAt` e `archiveReason` à tabela `plants`
- [ ] Atualizar `plants.list` para filtrar `archivedAt IS NULL` por padrão
- [ ] Criar procedure `plants.archive` (soft delete)
- [ ] Criar procedure `plants.listArchived`
- [ ] Manter `plants.delete` para delete permanente (cadastros errados)
- [ ] Executar `pnpm db:push`

**Frontend:**
- [ ] Criar página `client/src/pages/PlantArchive.tsx`
- [ ] Adicionar link "Arquivo" na sidebar
- [ ] Criar filtros: Colhidas / Descartadas / Mortas / Todas
- [ ] Exibir cards de plantas arquivadas (sem estufa)
- [ ] Adicionar botão "Restaurar" (opcional)
- [ ] Atualizar `PlantDetail.tsx`:
  * Substituir "Finalizar" por "Arquivar"
  * Adicionar modal de confirmação com motivo (Colhida/Descartada/Morreu)
  * Manter "Excluir" para delete permanente

**Arquivos:**
```
drizzle/schema.ts
server/routers.ts
client/src/pages/PlantArchive.tsx (novo)
client/src/pages/PlantDetail.tsx
client/src/components/Sidebar.tsx
```

---

## 🧪 Testes

### Checklist de Testes por Sprint

**Sprint 1 (Quick Wins):**
- [ ] Favicon aparece em todas as abas
- [ ] Menu não está duplicado
- [ ] Accordion abre/fecha corretamente
- [ ] Ordem dos widgets está correta (mobile + desktop)
- [ ] Zero à esquerda não aparece mais
- [ ] Apenas 8 strains aparecem na lista

**Sprint 2 (Melhorias Visuais):**
- [ ] Input PPFD está maior e destacado
- [ ] Inputs responsivos em mobile/desktop
- [ ] Calculadora de pH funciona com sliders
- [ ] Tema Alto Contraste é legível em todas as páginas
- [ ] Histórico de rega mostra semana e ciclo

**Sprint 3 (Funcionalidades):**
- [ ] Modal de mover plantas abre e fecha
- [ ] Movimentação funciona com novo modal
- [ ] Histórico de fertilização salva e exibe
- [ ] Plantas arquivadas não aparecem na lista principal
- [ ] Página de Arquivo exibe plantas finalizadas
- [ ] Restaurar planta funciona

---

## 📝 Notas de Implementação

### Boas Práticas

1. **Commits Atômicos:** Um commit por tarefa
2. **Testes:** Criar teste unitário para cada procedure novo
3. **Responsividade:** Testar em mobile antes de finalizar
4. **Acessibilidade:** Manter contraste mínimo 4.5:1 (WCAG AA)
5. **Performance:** Evitar re-renders desnecessários

### Dependências

**Novas bibliotecas necessárias:**
- Nenhuma (usar apenas shadcn/ui existente)

**Comandos úteis:**
```bash
# Rodar testes
pnpm test

# Verificar TypeScript
pnpm tsc --noEmit

# Aplicar mudanças no banco
pnpm db:push

# Reiniciar servidor
pnpm dev
```

---

## 📊 Métricas de Sucesso

### KPIs

- **Tempo de implementação:** 15h30min (estimado)
- **Bugs corrigidos:** 3/3
- **Melhorias UX:** 7/7
- **Funcionalidades novas:** 3/3
- **Cobertura de testes:** >80%

### Critérios de Aceitação

✅ Todos os bugs críticos resolvidos  
✅ Design responsivo em mobile/tablet/desktop  
✅ Tema Alto Contraste legível (contraste 21:1)  
✅ Histórico de fertilização salvando corretamente  
✅ Plantas arquivadas não aparecem na lista principal  
✅ Modal de mover plantas funcional e bonito  

---

## 🚀 Próximos Passos (Pós-Implementação)

1. **Documentação:** Atualizar README com novas funcionalidades
2. **Feedback:** Coletar feedback do usuário sobre melhorias
3. **Otimização:** Identificar gargalos de performance
4. **Acessibilidade:** Audit completo com Lighthouse
5. **Testes E2E:** Criar testes Playwright para fluxos críticos

---

**Versão:** 1.0  
**Última Atualização:** 21/02/2026  
**Autor:** Manus AI
