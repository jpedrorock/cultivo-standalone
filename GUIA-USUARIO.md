# Guia do Usuário - App Cultivo

Manual completo de uso do App Cultivo para gerenciamento de estufas de cultivo indoor.

## 📋 Índice

1. [Introdução](#introdução)
2. [Primeiros Passos](#primeiros-passos)
3. [Gerenciamento de Estufas](#gerenciamento-de-estufas)
4. [Gerenciamento de Plantas](#gerenciamento-de-plantas)
5. [Calculadoras](#calculadoras)
6. [Sistema de Alertas](#sistema-de-alertas)
7. [Configurações](#configurações)
8. [Dicas e Boas Práticas](#dicas-e-boas-práticas)

---

## 🌱 Introdução

O **App Cultivo** é um sistema completo para gerenciar estufas de cultivo indoor. Ele permite:

- Gerenciar até 3 estufas simultâneas
- Acompanhar ciclos de cultivo (vegetativa, floração, secagem)
- Registrar e monitorar parâmetros ambientais
- Calcular fertilização e rega
- Receber alertas automáticos
- Gerenciar plantas individuais com fotos e histórico

---

## 🚀 Primeiros Passos

### 1. Acessar o Aplicativo

Acesse o aplicativo pelo navegador em `https://seu-dominio.manus.space` (ou seu domínio customizado).

### 2. Fazer Login

1. Clique em "Login" ou acesse diretamente
2. Faça login com sua conta Manus
3. Você será redirecionado para a Home

### 3. Conhecer a Interface

**Desktop:**
- **Sidebar** (esquerda): Menu de navegação principal
- **Conteúdo** (centro): Página atual
- **Header** (topo): Título da página e ações

**Mobile:**
- **Bottom Navigation**: Menu principal (Home, Plantas, Calculadoras, Mais)
- **Header**: Título e menu hambúrguer

---

## 🏠 Gerenciamento de Estufas

### Criar Nova Estufa

1. Na **Home**, clique em "Criar Nova Estufa"
2. Preencha os dados:
   - **Nome**: Ex: "Estufa A"
   - **Tipo**: A, B ou C
   - **Dimensões**: Largura × Profundidade × Altura (cm)
   - **Categoria**: Manutenção, Vegetativa, Floração ou Secagem
3. Clique em "Criar Estufa"

### Iniciar Ciclo de Cultivo

1. No card da estufa, clique em "Novo Ciclo"
2. Configure:
   - **Strain**: Selecione a variedade (ou use "Padrão")
   - **Fase Inicial**: Vegetativa, Floração, Secagem ou Manutenção
   - **Semana Atual**: Semana do ciclo (1-12)
   - **Data de Início**: Data de início do ciclo
3. Clique em "Iniciar Ciclo"

### Registrar Parâmetros Diários

1. No card da estufa, clique em "Registrar Log"
2. Preencha as medições:
   - **Temperatura** (°C)
   - **Umidade Relativa** (%)
   - **PPFD** (µmol/m²/s)
   - **pH**
3. Adicione observações (opcional)
4. Clique em "Salvar"

### Editar Ciclo

1. No card da estufa, clique em "Editar Ciclo"
2. Altere:
   - Fase atual
   - Semana atual
   - Data de início
3. Clique em "Salvar"

### Finalizar Ciclo

1. No card da estufa, clique em "Finalizar Ciclo"
2. Confirme a ação
3. O ciclo será marcado como concluído

### Excluir Estufa

1. Certifique-se de que não há ciclo ativo
2. No card da estufa, clique em "Excluir Estufa"
3. Confirme a ação

---

## 🌿 Gerenciamento de Plantas

### Adicionar Nova Planta

1. Acesse **Plantas** no menu
2. Clique em "Nova Planta"
3. Preencha:
   - **Nome**: Ex: "Planta #1"
   - **Código**: Ex: "A01"
   - **Strain**: Selecione a variedade
   - **Estufa**: Selecione a estufa
4. Clique em "Criar Planta"

### Visualizar Detalhes da Planta

1. Na lista de plantas, clique no card da planta
2. Você verá 4 abas:
   - **Saúde**: Registros de saúde
   - **Tricomas**: Status de maturação
   - **LST**: Técnicas de treinamento
   - **Observações**: Notas gerais

### Aba de Saúde

**Adicionar Registro de Saúde:**

1. Clique em "Novo Registro"
2. Preencha:
   - **Data**: Data do registro
   - **Status**: Saudável, Estressada, Doente ou Recuperando
   - **Sintomas**: Descrição dos sintomas (se houver)
   - **Tratamento**: Tratamento aplicado (se houver)
   - **Notas**: Observações adicionais
3. Faça upload de foto (opcional)
4. Clique em "Salvar"

**Editar/Excluir Registro:**

1. No accordion do histórico, clique no registro
2. Clique em "Editar" ou "Excluir"
3. Confirme a ação

### Aba de Tricomas

**Adicionar Registro de Tricomas:**

1. Clique em "Novo Registro"
2. Preencha:
   - **Data**: Data da observação
   - **Status**: Clear, Cloudy, Amber ou Mixed
   - **Percentual Clear**: % de tricomas transparentes
   - **Percentual Cloudy**: % de tricomas leitosos
   - **Percentual Amber**: % de tricomas âmbar
   - **Semana do Ciclo**: Semana atual
3. Faça upload de foto macro (opcional)
4. Clique em "Salvar"

### Aba de LST (Low Stress Training)

**Adicionar Registro de LST:**

1. Clique em "Novo Registro"
2. Selecione a técnica aplicada:
   - LST (Low Stress Training)
   - Topping
   - FIM (Fuck I Missed)
   - Super Cropping
   - Lollipopping
   - Defoliação
   - Mainlining
   - ScrOG (Screen of Green)
3. Preencha:
   - **Data**: Data da aplicação
   - **Resposta da Planta**: Como a planta reagiu
4. Clique em "Salvar"

### Aba de Observações

**Adicionar Observação:**

1. Clique em "Nova Observação"
2. Preencha:
   - **Data**: Data da observação
   - **Texto**: Sua observação
3. Clique em "Salvar"

### Upload de Fotos

**Adicionar Foto:**

1. Em qualquer aba, clique em "Upload de Foto"
2. Selecione a imagem (JPEG, PNG, HEIC)
3. A imagem será:
   - Convertida para JPEG (se HEIC)
   - Comprimida para 1080x1440 (aspect ratio 3:4)
   - Enviada para S3
4. A última foto aparecerá no card da planta na lista

**Visualizar Galeria:**

1. Clique na última foto no card da planta
2. Use as setas para navegar
3. Clique para ampliar (lightbox)
4. Clique em "Download" para baixar

### Mover Planta entre Estufas

1. Nos detalhes da planta, clique em "Mover para Outra Estufa"
2. Selecione a estufa de destino
3. Confirme a ação
4. O histórico de movimentação será registrado

### Finalizar Planta (Harvest)

1. Nos detalhes da planta, clique em "Finalizar Planta"
2. Confirme a ação
3. A planta será marcada como "Colhida"

---

## 🧮 Calculadoras

### Calculadora de Fertilização

**Calcular Receita de Sais Minerais:**

1. Acesse **Calculadoras** → **Fertilização**
2. Selecione:
   - **Fase**: Vegetativa ou Floração
   - **Semana**: 1-12
   - **Volume**: Litros de solução
3. O sistema calculará automaticamente:
   - **Nitrato de Cálcio** (g)
   - **Nitrato de Potássio** (g)
   - **MKP** (Fosfato Monopotássico) (g)
   - **Sulfato de Magnésio** (g)
   - **Micronutrientes** (g)
   - **NPK Total** (N-P-K em ppm)
   - **Micronutrientes** (Ca, Mg, Fe, S em ppm)
   - **EC Estimado** (mS/cm)

**Salvar Receita:**

1. Selecione a estufa
2. Adicione observações (opcional)
3. Clique em "Salvar Receita"

**Ver Histórico:**

1. Clique na aba "Histórico"
2. Filtre por:
   - Estufa
   - Fase
3. Veja todas as receitas salvas em accordion

### Calculadora de Rega e Runoff

**Calcular Volume de Rega:**

1. Acesse **Calculadoras** → **Rega e Runoff**
2. Preencha:
   - **Fase**: Vegetativa ou Floração
   - **Número de Plantas**: Quantidade
   - **Tamanho do Vaso**: Litros
3. O sistema calculará:
   - **Volume por Planta** (L)
   - **Volume Total** (L)
   - **Runoff Ideal** (20-30%)

**Registrar Runoff:**

1. Após regar, meça o runoff
2. Insira o valor em "Runoff Real (%)"
3. O sistema mostrará recomendação:
   - **Runoff < 20%**: Aumentar volume
   - **Runoff 20-30%**: Ideal
   - **Runoff > 30%**: Reduzir volume

**Salvar Aplicação:**

1. Selecione a estufa
2. Adicione observações (opcional)
3. Clique em "Salvar Receita"

**Ver Histórico:**

1. Clique na aba "Histórico"
2. Filtre por estufa
3. Veja todas as aplicações salvas

### Conversor Lux → PPFD

1. Acesse **Calculadoras** → **Conversor Lux → PPFD**
2. Selecione o tipo de luz:
   - LED Branco
   - LED Full Spectrum
   - HPS
   - MH
   - Luz Solar
3. Insira o valor em Lux
4. O sistema mostrará o PPFD equivalente

### Conversor PPM ↔ EC

1. Acesse **Calculadoras** → **Conversor PPM ↔ EC**
2. Insira o valor em PPM ou EC
3. O sistema converterá automaticamente

### Calculadora de pH

1. Acesse **Calculadoras** → **Calculadora de pH**
2. Preencha:
   - **pH Atual**: pH medido
   - **pH Desejado**: pH ideal
   - **Volume**: Litros de solução
3. O sistema calculará:
   - Quantidade de pH Down (ml)
   - Quantidade de pH Up (ml)

---

## 🔔 Sistema de Alertas

### Visualizar Alertas

1. Acesse **Alertas** no menu
2. Veja todos os alertas:
   - **Novos**: Alertas não visualizados
   - **Vistos**: Alertas já visualizados

### Tipos de Alertas

- **Temperatura Alta**: Temperatura acima do ideal
- **Temperatura Baixa**: Temperatura abaixo do ideal
- **Umidade Alta**: Umidade acima do ideal
- **Umidade Baixa**: Umidade abaixo do ideal
- **PPFD Baixo**: PPFD abaixo do target

### Marcar como Visto

1. Clique no alerta
2. O status mudará para "Visto"

### Configurar Alertas

1. Acesse **Configurações** → **Alertas**
2. Configure por estufa:
   - **Temperatura Mínima** (°C)
   - **Temperatura Máxima** (°C)
   - **Umidade Mínima** (%)
   - **Umidade Máxima** (%)
   - **PPFD Mínimo** (µmol/m²/s)
3. Clique em "Salvar"

**Nota**: O sistema verifica automaticamente a cada hora.

---

## ⚙️ Configurações

### Alterar Tema

1. Acesse **Configurações**
2. Localize "Modo Escuro"
3. Ative/desative o toggle

### Gerenciar Strains

1. Acesse **Gerenciar Strains** no menu
2. Veja todas as strains cadastradas
3. Clique em "Nova Strain" para adicionar
4. Configure targets por fase e semana:
   - Temperatura ideal (min/max)
   - Umidade ideal (min/max)
   - PPFD ideal

### Backup do Banco de Dados

**Exportar:**

1. Acesse **Configurações**
2. Localize "Backup do Banco de Dados"
3. Clique em "Exportar"
4. O arquivo SQL será baixado

**Importar:**

1. Acesse **Configurações**
2. Localize "Importar Backup"
3. Selecione o arquivo SQL
4. Clique em "Importar"
5. ⚠️ **Atenção**: Isso sobrescreverá todos os dados

---

## 💡 Dicas e Boas Práticas

### Gerenciamento de Estufas

- **Registre diariamente**: Mantenha um histórico consistente de parâmetros
- **Use strains específicas**: Configure targets ideais para cada variedade
- **Monitore alertas**: Verifique alertas regularmente para evitar problemas

### Fertilização

- **Siga as fases**: Use receitas específicas para vegetativa e floração
- **Ajuste EC**: Monitore EC e ajuste conforme necessidade da planta
- **Salve receitas**: Mantenha histórico para replicar sucessos

### Rega

- **Runoff ideal**: Mantenha 20-30% de runoff para evitar acúmulo de sais
- **Ajuste volume**: Use recomendações do sistema para otimizar rega
- **Registre sempre**: Mantenha histórico para identificar padrões

### Plantas

- **Fotos regulares**: Tire fotos semanalmente para acompanhar evolução
- **Registre saúde**: Documente problemas e tratamentos
- **Acompanhe tricomas**: Monitore maturação para colheita ideal

### Backup

- **Backup semanal**: Exporte banco de dados toda semana
- **Armazene seguro**: Guarde backups em local seguro (nuvem, HD externo)
- **Teste restauração**: Teste importação em ambiente de teste

---

## ❓ Perguntas Frequentes

### Como adiciono mais de 3 estufas?

O sistema atualmente suporta até 3 estufas. Para mais, entre em contato com o suporte.

### Posso usar o app offline?

Não. O app requer conexão com internet para funcionar.

### Como faço para compartilhar receitas?

Atualmente não há funcionalidade de compartilhamento. Você pode exportar o banco de dados e compartilhar o arquivo SQL.

### O app funciona em celular?

Sim! O app é responsivo e funciona perfeitamente em celulares. Você pode instalá-lo como PWA.

### Como instalo como PWA?

**Android**: Menu (⋮) → "Adicionar à tela inicial"  
**iOS**: Compartilhar (□↑) → "Adicionar à Tela de Início"

---

## 📧 Suporte

Para dúvidas, problemas ou sugestões:

- **GitHub Issues**: [Repositório](https://github.com/seu-usuario/cultivo-architecture-docs)
- **Email**: suporte@seu-dominio.com
- **Documentação**: [README.md](./README.md)

---

**Desenvolvido com 🌱 para cultivadores**
