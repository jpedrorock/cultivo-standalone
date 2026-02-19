# Análise de Código Não Utilizado

Data: 19/02/2026

## Componentes Não Utilizados

### 1. FertilizationPresetsManager.tsx
- **Localização**: `client/src/components/FertilizationPresetsManager.tsx`
- **Status**: Não importado em nenhuma página
- **Motivo**: Funcionalidade de predefinições foi removida da calculadora de fertilização
- **Ação**: Pode ser removido com segurança

### 2. WateringPresetsManager.tsx
- **Localização**: `client/src/components/WateringPresetsManager.tsx`
- **Status**: Não importado em nenhuma página
- **Motivo**: Funcionalidade de predefinições foi removida da calculadora de rega
- **Ação**: Pode ser removido com segurança

### 3. ComponentShowcase.tsx
- **Localização**: `client/src/pages/ComponentShowcase.tsx`
- **Status**: Não importado no App.tsx
- **Motivo**: Página de demonstração de componentes (apenas para desenvolvimento)
- **Ação**: Pode ser removido com segurança (não afeta produção)

### 4. AIChatBox.tsx
- **Localização**: `client/src/components/AIChatBox.tsx`
- **Status**: Não utilizado em nenhuma página
- **Motivo**: Componente pré-construído do template que não foi integrado
- **Ação**: Pode ser mantido para uso futuro ou removido

## Componentes Utilizados

### Map.tsx
- **Status**: Utilizado em 3 locais
- **Ação**: Manter

### FertilizationCalculator.tsx
- **Status**: Utilizado em 1 local
- **Ação**: Manter

## Recomendações

1. **Remover imediatamente**:
   - FertilizationPresetsManager.tsx
   - WateringPresetsManager.tsx
   - ComponentShowcase.tsx

2. **Avaliar para remoção futura**:
   - AIChatBox.tsx (se não houver planos de integrar chat com IA)

3. **Verificar imports não utilizados**:
   - Executar `pnpm run lint` para identificar imports não utilizados
