# 🌱 App Cultivo - Instalação para Mac

## 📦 O que você baixou?

Este pacote contém **todos os arquivos** do App Cultivo para rodar localmente no seu Mac.

---

## 🚀 Instalação Rápida (3 passos)

### **Passo 1: Extrair os arquivos**

1. Localize o arquivo `app-cultivo.zip` que você baixou
2. Dê dois cliques para extrair
3. Você verá uma pasta chamada `cultivo-architecture-docs`

### **Passo 2: Abrir o Terminal**

1. Abra o **Finder**
2. Vá em **Aplicativos** → **Utilitários** → **Terminal**
3. Ou pressione `Cmd+Espaço` e digite "Terminal"

### **Passo 3: Executar o instalador**

No Terminal, digite os seguintes comandos (um de cada vez):

```bash
cd ~/Downloads/cultivo-architecture-docs
```
*(Pressione Enter)*

```bash
./install-mac.sh
```
*(Pressione Enter)*

**Pronto!** O instalador vai:
- ✅ Instalar Node.js (se necessário)
- ✅ Instalar todas as dependências
- ✅ Configurar o banco de dados
- ✅ Preparar tudo para uso

**Tempo estimado**: 5-10 minutos (dependendo da sua internet)

---

## 🎯 Iniciar o Aplicativo

Depois da instalação, para iniciar o app:

```bash
pnpm dev
```

Aguarde alguns segundos até aparecer:

```
Server running on http://localhost:3000/
```

Então abra seu navegador e acesse:

```
http://localhost:3000
```

**Pronto! O App Cultivo está rodando! 🎉**

---

## 🛑 Parar o Aplicativo

Para parar o servidor:

1. Volte ao Terminal
2. Pressione `Ctrl+C`

---

## 📁 Estrutura dos Arquivos

```
cultivo-architecture-docs/
├── install-mac.sh          ← Script de instalação
├── LEIA-ME-MAC.md          ← Este arquivo
├── GUIA_INSTALACAO_SIMPLES.pdf  ← Guia completo de uso
├── client/                 ← Interface do usuário
├── server/                 ← Servidor e API
├── drizzle/                ← Banco de dados
├── package.json            ← Dependências
└── local.db                ← Banco de dados local (criado após instalação)
```

---

## 💾 Backup dos Dados

**Importante**: Seus dados ficam salvos em `local.db`

Para fazer backup:

1. Acesse o app no navegador
2. Vá em **Configurações** (menu lateral)
3. Clique em **"Exportar Banco de Dados"**
4. Salve o arquivo `.sql` em local seguro

**Ou** simplesmente copie o arquivo `local.db` para outro lugar.

---

## 🔧 Solução de Problemas

### **Erro: "comando não encontrado: pnpm"**

Execute no Terminal:

```bash
npm install -g pnpm
```

Depois tente novamente.

### **Erro: "Permission denied"**

Execute:

```bash
chmod +x install-mac.sh
```

Depois execute o instalador novamente.

### **Erro: "Node.js não encontrado"**

O instalador deve instalar automaticamente. Se não funcionar:

1. Acesse: https://nodejs.org
2. Baixe a versão LTS (recomendada)
3. Instale
4. Execute o instalador novamente

### **Porta 3000 já está em uso**

Outro aplicativo está usando a porta 3000. Para usar outra porta:

```bash
PORT=3001 pnpm dev
```

Depois acesse: `http://localhost:3001`

### **Aplicativo não abre no navegador**

1. Verifique se o servidor está rodando (veja mensagem no Terminal)
2. Tente outro navegador (Chrome, Firefox, Safari)
3. Limpe o cache do navegador
4. Tente acessar: `http://127.0.0.1:3000`

---

## 🔄 Atualizar o Aplicativo

Quando houver uma nova versão:

1. Baixe o novo pacote
2. Extraia em uma nova pasta
3. **Copie seu arquivo `local.db`** da pasta antiga para a nova
4. Execute `./install-mac.sh` na nova pasta
5. Inicie com `pnpm dev`

---

## 📱 Acessar de Outros Dispositivos

Para acessar o app do seu celular/tablet na mesma rede Wi-Fi:

1. Descubra o IP do seu Mac:
   - Vá em **Preferências do Sistema** → **Rede**
   - Anote o IP (ex: 192.168.1.100)

2. No celular/tablet, acesse:
   ```
   http://192.168.1.100:3000
   ```
   *(Substitua pelo seu IP)*

---

## 🆘 Precisa de Ajuda?

**Documentação Completa**: Veja o arquivo `GUIA_INSTALACAO_SIMPLES.pdf`

**Suporte**:
- Email: suporte@appcultivo.com
- WhatsApp: (61) 99999-9999

---

## ⚙️ Comandos Úteis

| Comando | O que faz |
|---------|-----------|
| `pnpm dev` | Inicia o servidor de desenvolvimento |
| `pnpm build` | Compila o app para produção |
| `pnpm db:push` | Atualiza o banco de dados |
| `pnpm test` | Executa testes |

---

## 📊 Requisitos do Sistema

- **macOS**: 10.15 (Catalina) ou superior
- **RAM**: Mínimo 4GB (recomendado 8GB)
- **Espaço em disco**: 500MB livres
- **Internet**: Necessária para instalação inicial

---

## 🎓 Primeiros Passos Após Instalação

1. ✅ Criar primeira estufa
2. ✅ Iniciar primeiro ciclo
3. ✅ Registrar primeira medição
4. ✅ Usar calculadora Lux → PPFD
5. ✅ Fazer primeiro backup

**Veja o guia completo em**: `GUIA_INSTALACAO_SIMPLES.pdf`

---

**Versão**: 1.0.0  
**Data**: Fevereiro 2026  
**Desenvolvido por**: Equipe App Cultivo
