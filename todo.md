# App Cultivo - TODO

## ✅ Funcionalidades Concluídas

### Calculadoras
- [x] Calculadora de Runoff (% ideal, volume esperado, dicas)
- [x] Calculadora de Rega (volume por planta, volume total, ajuste por runoff real)
- [x] Calculadora de Fertilização (seletor fase/semana, EC recomendado, NPK, exportar TXT)
- [x] Calculadora de Fertilização - Predefinições (salvar, carregar, excluir, compartilhar receitas)
- [x] Reorganização: todas as calculadoras em uma única página com abas

### Sistema de Plantas
- [x] Modelo de dados completo (plants, plantTentHistory, plantObservations, plantPhotos, plantRunoffLogs, plantHealthLogs, plantTrichomeLogs, plantLSTLogs)
- [x] Backend tRPC completo (CRUD plantas, observações, fotos, runoff, saúde, tricomas, LST)
- [x] Página /plants com listagem agrupada por estufa (seções colapsáveis)
- [x] Filtros por status e busca por nome/código
- [x] Cards com foto, nome, código, strain, badge de saúde, fase do ciclo
- [x] Página /plants/new com formulário de criação
- [x] Página /plants/[id] com tabs (Saúde, Tricomas, LST, Observações)
- [x] Mover planta entre estufas (modal com cards visuais)
- [x] Transplantar para Flora
- [x] Finalizar planta (harvest)
- [x] Contador de plantas por estufa no dashboard

### Sistema de Fotos
- [x] Upload de fotos com compressão (1080x1440, aspect ratio iPhone 3:4)
- [x] Conversão automática HEIC/HEIF → JPEG
- [x] Galeria com lightbox (zoom, navegação, download, contador)
- [x] Fotos na aba de Saúde e Tricomas
- [x] Última foto aparece no card da planta
- [x] Storage S3 com storagePut()

### Aba de Saúde
- [x] Registro com data, status, sintomas, tratamento, notas, foto
- [x] Galeria lateral (foto à direita, dados à esquerda)
- [x] Accordion para lista longa
- [x] Editar e excluir registros (modal de edição, confirmação)

### Aba de Tricomas
- [x] Status (clear/cloudy/amber/mixed) com percentuais
- [x] Upload de foto macro
- [x] Semana do ciclo

### Aba de LST
- [x] Seletor visual de técnicas (LST, Topping, FIM, Super Cropping, Lollipopping, Defoliação, Mainlining, ScrOG)
- [x] Descrições detalhadas de cada técnica
- [x] Campo de resposta da planta

### Estufas e Ciclos
- [x] CRUD de estufas (A, B, C)
- [x] Gerenciamento de ciclos (iniciar, editar, finalizar)
- [x] Strains com targets semanais
- [x] Tarefas por estufa/semana
- [x] Logs diários (temperatura, RH, PPFD)

### Alertas
- [x] Sistema de alertas por desvio de métricas
- [x] Página de alertas com histórico
- [x] Configurações de alertas por estufa

### UX/UI Geral
- [x] Sidebar desktop + BottomNav mobile (Home, Plantas, Calculadoras, Alertas)
- [x] Splash screen
- [x] PWA (InstallPWA)
- [x] Tema escuro/claro
- [x] Widget de clima
- [x] Notificações toast (Sonner)
- [x] Exportação de receita para TXT

---

## 🔲 Itens Pendentes

### 🟡 Funcionalidades Incompletas

- [ ] Integrar WateringPresetsManager no IrrigationCalculator (componente existe mas não está conectado)
- [ ] Botão "Editar" em predefinições de fertilização (backend update existe, falta UI)
- [ ] Botão "Editar" em predefinições de rega (backend update existe, falta UI)
- [ ] Adicionar aba "Plantas" na página de detalhes de cada estufa (TentDetails.tsx)

### 🟢 Melhorias de UX/UI

- [ ] Lightbox para zoom nas fotos dos cards da lista de plantas (PAUSADO)
- [ ] Suporte a gestos de swipe no mobile para navegar fotos no lightbox
- [ ] Modal de edição de registro de saúde com formulário preenchido (EditHealthLogDialog existe mas pode precisar de revisão)

### 🔵 Testes que Requerem Dispositivo Físico

- [ ] Testar câmera no iPhone real (capture="environment")
- [ ] Testar conversão HEIC com foto real do iPhone
- [ ] Testar responsividade mobile em dispositivo real

### 📦 Documentação

- [ ] Atualizar README com funcionalidades atuais
- [ ] Criar guia do usuário

### 🗑️ Limpeza (Opcional)

- [x] Remover tabela wateringLogs do banco (não é usada mais, mas não afeta funcionamento)
- [x] Remover arquivo PlantPhotosTab.tsx (não é importado em nenhum lugar)
- [x] Remover arquivo PlantRunoffTab.tsx (não é importado em nenhum lugar)
- [x] Remover arquivo Calculators.tsx.backup
- [x] Remover import de wateringLogs do routers.ts e schema.ts

---

## 📝 Histórico de Correções Recentes

- [x] Corrigir queries boolean no MySQL (isActive = true → isActive = 1)
- [x] Corrigir botão aninhado no AccordionTrigger do PlantHealthTab
- [x] Corrigir fotos não aparecendo nos cards (invalidação de cache)
- [x] Corrigir erro "Not authenticated" na calculadora de fertilização
- [x] Corrigir sinalizações duplicadas de fase no menu da planta
- [x] Criar tabelas faltantes no banco (strains, tents, plants, alerts, cycles, plantHealthLogs)
