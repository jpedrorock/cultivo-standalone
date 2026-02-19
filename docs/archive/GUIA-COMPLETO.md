# 📖 App Cultivo - Guia Completo de Uso

**Versão:** 1.0.0  
**Última atualização:** Fevereiro 2026

---

## 📑 Índice

1. [Introdução](#introdução)
2. [Instalação](#instalação)
3. [Primeiro Acesso](#primeiro-acesso)
4. [Gerenciamento de Estufas](#gerenciamento-de-estufas)
5. [Ciclos de Cultivo](#ciclos-de-cultivo)
6. [Registro Diário](#registro-diário)
7. [Calculadoras](#calculadoras)
8. [Histórico e Análise](#histórico-e-análise)
9. [Strains (Variedades)](#strains-variedades)
10. [Alertas](#alertas)
11. [Configurações](#configurações)
12. [Dicas e Boas Práticas](#dicas-e-boas-práticas)
13. [Troubleshooting](#troubleshooting)

---

## 🌱 Introdução

O **App Cultivo** é um sistema completo de gerenciamento de estufas que permite:

- ✅ Monitorar múltiplas estufas simultaneamente
- ✅ Gerenciar ciclos de cultivo (Clonagem → Vegetativa → Floração)
- ✅ Registrar parâmetros diários (Temperatura, Umidade, PPFD)
- ✅ Calcular fertilização, pH, PPM/EC e intensidade de luz
- ✅ Acompanhar tarefas semanais por fase
- ✅ Analisar histórico e tendências
- ✅ Receber alertas de desvios

---

## 🚀 Instalação

### Requisitos

- **Node.js** 18 ou superior
- **pnpm** (gerenciador de pacotes)
- **Sistema operacional:** Windows, macOS ou Linux

### Passo a Passo

1. **Extraia o arquivo ZIP** do App Cultivo em uma pasta de sua escolha

2. **Abra o terminal** na pasta extraída

3. **Execute o script de setup:**

```bash
# Linux/macOS
./setup-local.sh

# Windows (PowerShell)
.\setup-local.ps1
```

4. **Inicie o aplicativo:**

```bash
pnpm dev
```

5. **Acesse no navegador:**
   - URL: `http://localhost:3000`

---

## 🔑 Primeiro Acesso

### Modo Local (Sem Autenticação)

Por padrão, o app funciona **sem login** para uso local. Todos os dados ficam salvos no banco SQLite (`local.db`).

### Importar Banco de Dados Inicial

Para começar com dados de exemplo:

1. Copie o arquivo `banco-inicial.sql` para a pasta do projeto
2. Execute:

```bash
# SQLite
sqlite3 local.db < banco-inicial.sql

# MySQL (se estiver usando)
mysql -u usuario -p cultivo < banco-inicial.sql
```

3. Reinicie o servidor (`pnpm dev`)

---

## 🏠 Gerenciamento de Estufas

### Criar Nova Estufa

1. Na página inicial, clique em **"Criar Nova Estufa"**
2. Preencha os dados:
   - **Nome:** Ex: "Estufa A"
   - **Tipo:** A, B ou C
   - **Dimensões:** Largura × Profundidade × Altura (cm)
   - **Fase Inicial:** Manutenção, Vegetativa ou Floração
3. Clique em **"Criar"**

### Visualizar Estufas

A página inicial mostra **cards** para cada estufa com:

- 📊 **Status do ciclo** (fase atual e semana)
- ✅ **Tarefas da semana** (checklist)
- 🌡️ **Parâmetros atuais** (Temp, RH, PPFD)
- 🎯 **Botões de ação** (Ver Detalhes, Registrar, Editar Ciclo)

### Editar Estufa

1. Clique em **"Ver Detalhes"** no card da estufa
2. Clique no ícone de edição (lápis)
3. Modifique os dados necessários
4. Salve as alterações

---

## 🔄 Ciclos de Cultivo

### O que é um Ciclo?

Um **ciclo** representa o período completo de cultivo de uma planta, desde a clonagem até a colheita.

**Fases do Ciclo:**

1. 🌱 **Clonagem** (2-3 semanas) - Enraizamento de clones
2. 🔧 **Manutenção** (variável) - Plantas-mãe para clonagem
3. 🌿 **Vegetativa** (4-8 semanas) - Crescimento vegetativo
4. 🌸 **Floração** (8-12 semanas) - Produção de flores

### Iniciar Novo Ciclo

1. Clique em **"Editar Ciclo"** no card da estufa
2. Preencha:
   - **Strain:** Selecione a variedade (ou crie nova)
   - **Fase Atual:** Escolha a fase inicial
   - **Semana Atual:** Defina a semana (1-12)
   - **Data de Início:** Data de referência do ciclo
3. Clique em **"Salvar"**

### Avançar Semana

O sistema avança automaticamente a semana a cada 7 dias. Para avançar manualmente:

1. Acesse **"Editar Ciclo"**
2. Incremente o campo **"Semana Atual"**
3. Salve

### Finalizar Ciclo

1. Clique em **"Finalizar Ciclo"** no modal de edição
2. Confirme a ação
3. O ciclo será marcado como **COMPLETED**

---

## 📝 Registro Diário

### Como Registrar

1. Clique em **"Registrar"** no card da estufa
2. Selecione o turno: **AM** (manhã) ou **PM** (tarde)
3. Preencha os parâmetros:
   - **Temperatura** (°C)
   - **Umidade Relativa** (%)
   - **PPFD** (μmol/m²/s)
4. (Opcional) Adicione observações
5. Clique em **"Salvar Registro"**

### Visualizar Registros

- **Página Histórico:** Tabela completa com todos os registros
- **Filtros:** Por estufa, data, turno
- **Exportar:** Baixe os dados em CSV

---

## 🧮 Calculadoras

O app inclui **5 calculadoras** profissionais:

### 1. Lux ↔ PPFD

Converte entre **Lux** (luxímetro) e **PPFD** (quantum sensor).

**Como usar:**
1. Escolha a direção (Lux → PPFD ou PPFD → Lux)
2. Selecione o tipo de luz (LED Branco, HPS, etc.)
3. Insira o valor ou use o slider visual
4. Veja o resultado instantaneamente

**Referências de PPFD:**
- Clonagem: 100-200 μmol/m²/s
- Vegetativa: 400-600 μmol/m²/s
- Floração: 600-900 μmol/m²/s
- Máximo: 1000-1200 μmol/m²/s

### 2. PPM ↔ EC

Converte entre **PPM** (partes por milhão) e **EC** (condutividade elétrica).

**Como usar:**
1. Escolha a direção (PPM → EC ou EC → PPM)
2. Selecione a escala (500, 640 ou 700)
3. Insira o valor
4. Veja o resultado e referências por fase

### 3. Ajuste de pH

Calcula quantidade de ácido/base para ajustar pH da solução nutritiva.

**Como usar:**
1. Insira o **volume de água** (litros)
2. Insira o **pH atual**
3. Insira o **pH desejado** (ideal: 5.5-6.5)
4. Veja a quantidade de produto necessária

### 4. Fertilização Inteligente

Calcula micronutrientes (Ca, Mg, Fe) baseado em volume e fase.

**Como usar:**
1. Insira o **volume de rega** (litros)
2. Selecione a **fase** (Vegetativa/Floração)
3. Veja as dosagens em ml para cada nutriente
4. Expanda para ver sintomas de deficiência

### 5. Conversores Rápidos

- **Temperatura:** °C ↔ °F
- **Volume:** L ↔ Gal
- **Peso:** g ↔ oz

---

## 📊 Histórico e Análise

### Visualizar Histórico

1. Acesse **"Histórico"** no menu lateral
2. Filtre por:
   - **Estufa**
   - **Período** (últimos 7, 30, 90 dias)
   - **Turno** (AM/PM)
3. Veja a tabela com todos os registros

### Gráficos (Em Desenvolvimento)

- Evolução de Temperatura ao longo do tempo
- Comparação de RH entre estufas
- Desvios de PPFD vs Target

---

## 🌿 Strains (Variedades)

### Gerenciar Strains

1. Acesse **"Strains"** no menu lateral
2. Veja a lista de variedades cadastradas
3. Clique em **"Adicionar Strain"** para criar nova

### Cadastrar Nova Strain

Preencha:
- **Nome:** Ex: "OG Kush"
- **Tipo:** Indica, Sativa ou Híbrida
- **Targets por Fase:**
  - Temperatura ideal (min/max)
  - Umidade ideal (min/max)
  - PPFD ideal (min/max)

---

## 🔔 Alertas

### Tipos de Alertas

- ⚠️ **Temperatura fora do range**
- ⚠️ **Umidade fora do range**
- ⚠️ **PPFD fora do range**
- ⚠️ **Tarefas pendentes**

### Visualizar Alertas

1. Acesse **"Alertas"** no menu lateral
2. Veja alertas **novos** e **vistos**
3. Clique em um alerta para marcar como visto

### Configurar Alertas (Futuro)

- Email/SMS automáticos
- Limites personalizados por estufa

---

## ⚙️ Configurações

### Tema

- **Modo Claro:** Fundo branco/verde claro
- **Modo Escuro:** Fundo preto/cinza escuro (recomendado)

**Como alternar:**
1. Acesse **"Configurações"**
2. Toggle **"Modo Escuro"**

### Backup

**Exportar Dados:**
1. Acesse **"Configurações"**
2. Clique em **"Exportar Dados"**
3. Baixe o arquivo JSON/CSV

**Importar Dados:**
1. Acesse **"Configurações"**
2. Clique em **"Importar Dados"**
3. Selecione o arquivo de backup

---

## 💡 Dicas e Boas Práticas

### Registro Diário

- ✅ Registre **2x por dia** (AM e PM) para melhor precisão
- ✅ Sempre no **mesmo horário** (ex: 8h e 20h)
- ✅ Calibre seus medidores regularmente

### Parâmetros Ideais

**Clonagem:**
- Temp: 22-26°C
- RH: 70-80%
- PPFD: 100-200 μmol/m²/s

**Vegetativa:**
- Temp: 22-28°C
- RH: 50-70%
- PPFD: 400-600 μmol/m²/s

**Floração:**
- Temp: 20-26°C
- RH: 40-50%
- PPFD: 600-900 μmol/m²/s

### Tarefas Semanais

- ✅ Marque tarefas conforme completa
- ✅ Use observações para registrar detalhes
- ✅ Revise tarefas pendentes diariamente

---

## 🐛 Troubleshooting

### Servidor não inicia

**Erro:** `Port 3000 is already in use`

**Solução:**
```bash
# Mude a porta no .env
PORT=3001
```

### Banco de dados vazio

**Solução:**
```bash
# Reimporte o banco inicial
sqlite3 local.db < banco-inicial.sql
```

### Dados não aparecem

**Solução:**
1. Verifique se o servidor está rodando
2. Abra o console do navegador (F12)
3. Procure por erros em vermelho
4. Reinicie o servidor (`Ctrl+C` e `pnpm dev`)

### Calculadoras não funcionam

**Solução:**
1. Limpe o cache do navegador (`Ctrl+Shift+Delete`)
2. Recarregue a página (`Ctrl+F5`)

---

## 📞 Suporte

Para dúvidas, problemas ou sugestões:

- 📧 Email: [seu-email@example.com]
- 💬 Discord: [link-do-discord]
- 🐛 Issues: [link-do-github]

---

## 📄 Licença

[Adicione sua licença aqui]

---

**Desenvolvido com ❤️ para cultivadores**
