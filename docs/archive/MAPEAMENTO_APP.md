# Mapeamento Completo do App Cultivo

## Rotas Existentes (App.tsx)

### Rotas Principais
| Rota | Componente | Descrição | Status |
|------|-----------|-----------|--------|
| `/` | Home | Dashboard principal com cards de estufas | ✅ Ativo |
| `/plants` | PlantsList | Lista de plantas | ✅ Ativo |
| `/plants/new` | NewPlant | Adicionar nova planta | ✅ Ativo |
| `/plants/:id` | PlantDetail | Detalhes de planta específica | ✅ Ativo |
| `/tarefas` | Tarefas | Lista de tarefas | ✅ Ativo |
| `/calculators` | CalculatorMenu | Menu de calculadoras | ✅ Ativo |
| `/calculators/:id` | Calculators | Calculadora específica | ✅ Ativo |
| `/nutrients` | Nutrients | Receitas de nutrientes | ✅ Ativo |
| `/history` | HistoryTable | Histórico de dados | ✅ Ativo |
| `/alerts` | Alerts | Alertas ativos | ✅ Ativo |
| `/alerts/history` | AlertHistory | Histórico de alertas | ✅ Ativo |

### Rotas de Estufas
| Rota | Componente | Descrição | Status |
|------|-----------|-----------|--------|
| `/tent/:id` | TentDetails | Detalhes da estufa | ✅ Ativo |
| `/tent/:id/log` | TentLog | Registro de dados da estufa | ✅ Ativo |

### Rotas de Strains
| Rota | Componente | Descrição | Status |
|------|-----------|-----------|--------|
| `/strains` | Strains | Lista de strains | ⚠️ Revisar |
| `/manage-strains` | ManageStrains | Gerenciar strains | ⚠️ Revisar |
| `/strains/:id/targets` | StrainTargets | Targets de strain | ⚠️ Revisar |

### Rotas de Configurações
| Rota | Componente | Descrição | Status |
|------|-----------|-----------|--------|
| `/settings` | Settings | Configurações gerais | ⚠️ Revisar |
| `/settings/notifications` | NotificationSettings | Config de notificações | ✅ Ativo |
| `/settings/alerts` | AlertSettings | Config de alertas | ✅ Ativo |

### Rotas de Desenvolvimento/Debug
| Rota | Componente | Descrição | Status |
|------|-----------|-----------|--------|
| `/skeleton-demo` | SkeletonDemo | Demo de skeletons | ❌ Remover? |
| `/tasks` | Tasks | Tarefas (duplicado?) | ❌ Verificar duplicação |

## Navegação (Sidebar)

### Links Principais
1. Home (`/`)
2. Plantas (`/plants`)
3. Tarefas (`/tarefas`)
4. Calculadoras (`/calculators`)
5. Nutrientes (`/nutrients`)
6. Histórico (`/history`)
7. Alertas (`/alerts`)
8. Strains (`/manage-strains`)

### Links de Rodapé
- Configurações (`/settings`)

## Navegação (BottomNav - Mobile)

*Verificar se existe e quais links estão configurados*

## Possíveis Problemas Identificados

### 1. Duplicação de Rotas
- `/tasks` vs `/tarefas` - Parecem ser duplicados

### 2. Rotas Não Acessíveis pela Navegação
- `/strains` - Não está na Sidebar (apenas `/manage-strains`)
- `/skeleton-demo` - Rota de desenvolvimento
- `/settings/notifications` - Acessível apenas via Settings
- `/settings/alerts` - Acessível apenas via Settings
- `/alerts/history` - Acessível apenas via Alerts
- `/strains/:id/targets` - Acessível apenas via detalhes de strain

### 3. Rotas a Revisar
- **Strains**: 3 rotas diferentes, verificar se todas são necessárias
- **Tasks vs Tarefas**: Verificar duplicação
- **Settings**: Revisar organização das sub-páginas

## Próximos Passos

1. Navegar por cada página para verificar funcionalidade
2. Identificar páginas não utilizadas ou redundantes
3. Revisar UX/UI de cada página
4. Propor simplificações e melhorias
