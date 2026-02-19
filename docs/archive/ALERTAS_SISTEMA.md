# Sistema de Alertas Inteligentes - Documentação

## Visão Geral

Sistema completo de alertas contextuais que compara valores reais das estufas com valores ideais (baseados nas strains ativas) e gera alertas quando os valores ultrapassam margens configuráveis por fase do cultivo.

## Arquitetura

### 1. Tabela `phaseAlertMargins`

Armazena as margens de tolerância para cada fase do cultivo:

```sql
CREATE TABLE phaseAlertMargins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phase ENUM('MAINTENANCE', 'CLONING', 'VEGA', 'FLORA', 'DRYING'),
  tempMargin DECIMAL(4,2),     -- Margem de temperatura (±°C)
  rhMargin DECIMAL(4,2),       -- Margem de umidade relativa (±%)
  ppfdMargin INT,              -- Margem de PPFD (±µmol/m²/s)
  phMargin DECIMAL(3,2)        -- Margem de pH (±)
);
```

**Valores Padrão:**
- **MAINTENANCE**: ±3.0°C, ±10.0% RH, ±100 PPFD, ±0.3 pH
- **CLONING**: ±2.0°C, ±5.0% RH, ±50 PPFD, ±0.2 pH
- **VEGA**: ±2.0°C, ±5.0% RH, ±50 PPFD, ±0.2 pH
- **FLORA**: ±2.0°C, ±5.0% RH, ±50 PPFD, ±0.2 pH
- **DRYING**: ±1.0°C, ±3.0% RH, ±0 PPFD (sem pH)

### 2. Backend - Funções Principais

#### `getIdealValuesByTent(tentId: number)`

Calcula os valores ideais para uma estufa baseado em:
1. **Categoria da estufa** (MAINTENANCE, VEGA, FLORA, DRYING)
2. **Strains ativas** (plantas na estufa)
3. **Semana atual** do ciclo

**Lógica:**
- Se a estufa tem **múltiplas strains**, calcula a **média** dos valores ideais de todas as strains
- Se a estufa tem **uma strain**, retorna os valores ideais dessa strain
- Se a estufa **não tem plantas**, retorna valores padrão da categoria

**Retorno:**
```typescript
{
  tempC: number,      // Temperatura ideal (média se múltiplas strains)
  rhPct: number,      // Umidade ideal (média)
  ppfd: number,       // PPFD ideal (média)
  ph: number,         // pH ideal (média)
  photoperiod: string // Fotoperíodo ideal
}
```

#### `checkAlertsForTent(tentId: number)`

Compara valores reais (última leitura de `dailyLogs`) com valores ideais e gera alertas:

**Processo:**
1. Busca **última leitura** da estufa (`dailyLogs`)
2. Calcula **valores ideais** via `getIdealValuesByTent()`
3. Busca **margens da fase** (`phaseAlertMargins`)
4. **Compara** cada métrica:
   - Se `valor_real < (ideal - margem)` → Alerta "abaixo"
   - Se `valor_real > (ideal + margem)` → Alerta "acima"
5. **Gera mensagens contextuais**:
   - *"Estufa B: Temp 28°C acima do ideal 24°C (±2°C) para Candy Kush"*
6. **Salva alertas** em 2 tabelas:
   - `alerts` (alertas ativos: NEW/SEEN)
   - `alertHistory` (histórico permanente)

**Retorno:**
```typescript
{
  success: boolean,
  newAlerts: number,
  alerts: Alert[]
}
```

### 3. Frontend - UI de Configuração

**Componente:** `client/src/components/AlertSettings.tsx`

**Funcionalidades:**
- **5 seções** (Accordion) para cada fase do cultivo
- **Inputs editáveis** para margens (temperatura, umidade, PPFD, pH)
- **Salvamento individual** por fase
- **Textos explicativos** de como funciona o sistema
- **Info box** com exemplos práticos

**Procedures tRPC usados:**
- `trpc.alerts.getPhaseMargins.useQuery()` - Busca margens de todas as fases
- `trpc.alerts.updatePhaseMargin.useMutation()` - Atualiza margens de uma fase

### 4. Procedures tRPC

#### Alertas
- `alerts.getIdealValues({ tentId })` - Retorna valores ideais para uma estufa
- `alerts.checkAlerts({ tentId })` - Verifica e gera alertas para uma estufa
- `alerts.list({ tentId?, status? })` - Lista alertas ativos
- `alerts.getHistory({ tentId?, limit })` - Lista histórico de alertas
- `alerts.markAsSeen({ alertId })` - Marca alerta como visto

#### Margens por Fase
- `alerts.getPhaseMargins()` - Lista margens de todas as fases
- `alerts.updatePhaseMargin({ phase, tempMargin?, rhMargin?, ppfdMargin?, phMargin? })` - Atualiza margens de uma fase

## Fluxo de Uso

### 1. Configurar Margens (uma vez)

1. Acessar **Configurações** → **Margens de Alertas por Fase**
2. Expandir a fase desejada (ex: VEGA)
3. Editar margens:
   - Temperatura: ±2.5°C
   - Umidade: ±5.0%
   - PPFD: ±50 µmol/m²/s
   - pH: ±0.2
4. Clicar em **Salvar Vegetativa**

### 2. Verificar Alertas (automático ou manual)

**Manual:**
```typescript
const checkAlerts = trpc.alerts.checkAlerts.useMutation();
await checkAlerts.mutateAsync({ tentId: 2 });
```

**Resultado:**
- Compara última leitura com valores ideais
- Gera alertas se valores estiverem fora da faixa (ideal ± margem)
- Salva em `alerts` e `alertHistory`

### 3. Visualizar Alertas

**Página de Alertas:**
- Lista alertas ativos (NEW/SEEN)
- Filtro por estufa
- Histórico de alertas
- Mensagens contextuais:
  - *"Estufa B: Temp 28°C acima do ideal 24°C (±2°C) para Candy Kush"*
  - *"Estufa C: RH 35% abaixo do ideal 50% (±5%) para Northern Lights"*

## Exemplo Prático

### Cenário: Estufa B em VEGA com Candy Kush

**Configuração:**
- **Fase:** VEGA (semana 3)
- **Strain:** Candy Kush
- **Margens:** ±2.0°C, ±5.0% RH, ±50 PPFD, ±0.2 pH

**Valores Ideais (weeklyTargets):**
- Temperatura: 24°C
- Umidade: 60%
- PPFD: 500 µmol/m²/s
- pH: 6.0

**Última Leitura (dailyLogs):**
- Temperatura: 28°C ❌ (acima de 24 + 2 = 26°C)
- Umidade: 58% ✅ (dentro de 60 ± 5%)
- PPFD: 480 ✅ (dentro de 500 ± 50)
- pH: 6.3 ❌ (acima de 6.0 + 0.2 = 6.2)

**Alertas Gerados:**
1. *"Estufa B: Temp 28°C acima do ideal 24°C (±2°C) para Candy Kush"*
2. *"Estufa B: pH 6.3 acima do ideal 6.0 (±0.2) para Candy Kush"*

## Múltiplas Strains

### Cenário: Estufa C com 3 strains diferentes

**Plantas:**
- 1x Northern Lights (FLORA sem 5)
- 1x Candy Kush (FLORA sem 6)
- 1x White Widow (FLORA sem 5)

**Valores Ideais (média):**
```typescript
{
  tempC: (22 + 23 + 22) / 3 = 22.3°C,
  rhPct: (50 + 55 + 50) / 3 = 51.7%,
  ppfd: (600 + 650 + 600) / 3 = 616 µmol/m²/s,
  ph: (6.0 + 6.2 + 6.0) / 3 = 6.07
}
```

**Margens (FLORA):** ±2.0°C, ±5.0% RH, ±50 PPFD, ±0.2 pH

**Faixa Aceitável:**
- Temperatura: 20.3°C - 24.3°C
- Umidade: 46.7% - 56.7%
- PPFD: 566 - 666 µmol/m²/s
- pH: 5.87 - 6.27

## Próximos Passos

- [ ] Implementar verificação automática de alertas (cron job)
- [ ] Adicionar notificações push quando alertas são gerados
- [ ] Criar dashboard de alertas na Home
- [ ] Adicionar gráficos de tendências (valores vs faixa ideal)
- [ ] Permitir configurar margens por estufa (além de por fase)
