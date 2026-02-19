# Análise de Arquivos de Documentação

Data: 19/02/2026

## Arquivos Principais (Manter)

### README.md (5.6K)
- **Status**: Principal arquivo de documentação
- **Ação**: Revisar e atualizar com funcionalidades atuais

### todo.md (43K)
- **Status**: Lista de tarefas do projeto
- **Ação**: Manter (em uso ativo)

### CHANGELOG.md (5.0K)
- **Status**: Histórico de mudanças
- **Ação**: Atualizar com últimas mudanças

## Guias de Instalação (Consolidar)

**Problema**: 12 arquivos diferentes de instalação causam confusão

### Arquivos Duplicados/Redundantes:
1. INSTALACAO.md (13K)
2. GUIA_INSTALACAO_SIMPLES.md (11K)
3. README-LOCAL.md (6.0K)
4. QUICK-START.md (2.3K)
5. README-INSTALACAO-MAC.md (5.0K)
6. README-INSTALL-MAC.md (6.5K)
7. LEIA-ME-MAC.md (4.8K)
8. README-MYSQL.md (4.3K)
9. README-MYSQL-MAC.md (6.8K)

**Ação Recomendada**: Consolidar em 1-2 arquivos:
- `INSTALACAO.md` - Guia completo de instalação (todas as plataformas)
- Remover os outros 8 arquivos

## Guias de Deploy (Consolidar)

### Arquivos Duplicados:
1. DEPLOY_GUIDE.md (14K)
2. GUIA-DEPLOY-RAPIDO.md (6.6K)
3. README-DEPLOY.md (3.9K)
4. GUIA-VERCEL.md (7.9K)
5. GUIA-PLANETSCALE.md (7.5K)

**Ação Recomendada**: Consolidar em 1 arquivo:
- `DEPLOY.md` - Guia completo de deploy (Manus, Vercel, Railway)
- Remover os outros 4 arquivos

## Guias de Uso

### GUIA-DO-USUARIO.md (14K)
- **Status**: Guia de uso do aplicativo
- **Ação**: Revisar e atualizar com novas funcionalidades (calculadoras, históricos)

### GUIA-COMPLETO.md (9.1K)
- **Status**: Possivelmente duplicado com GUIA-DO-USUARIO.md
- **Ação**: Verificar conteúdo e mesclar ou remover

## Arquivos de Análise/Testes (Manter Temporariamente)

### Análises:
- ANALISE_HOME.md (3.3K)
- ANALISE_STRAINS.md (3.2K)
- MAPEAMENTO_APP.md (3.4K)
- RELATORIO_REVISAO_COMPLETA.md (8.1K)
- REVISAO_GERAL.md (2.1K)

**Ação**: Manter por enquanto (úteis para referência)

### Testes:
- TESTE_CALCULADORA_REGA.md (2.0K)
- TESTE_CALCULADORA_SAIS_MINERAIS.md (3.1K)
- test-reference-page.md (2.6K)
- test-registro-page.md (2.7K)

**Ação**: Mover para pasta `docs/tests/` ou remover após validação

## Arquivos de Referência

### CODIGO_NAO_UTILIZADO.md (1.8K)
- **Status**: Análise de código não utilizado
- **Ação**: Manter (referência útil)

### REFERENCIA_PLANILHA_EXCEL.md (1.9K)
- **Status**: Referência da planilha de fertilização
- **Ação**: Manter (referência útil)

### plant-training-techniques.md (6.2K)
- **Status**: Técnicas de treinamento de plantas
- **Ação**: Mover para pasta `docs/` ou remover se não usado

## Arquivos de Configuração

### ENV_VARS.md (2.3K)
- **Status**: Documentação de variáveis de ambiente
- **Ação**: Manter e atualizar

### STORAGE_GUIDE.md (4.5K)
- **Status**: Guia de armazenamento S3
- **Ação**: Manter

### ALERTAS_SISTEMA.md (6.3K)
- **Status**: Documentação do sistema de alertas
- **Ação**: Manter

### MIGRATION.md (2.0K)
- **Status**: Guia de migração
- **Ação**: Verificar se ainda é relevante

## Resumo de Ações

### Consolidar (de 12 para 2 arquivos):
- **Instalação**: Manter apenas `INSTALACAO.md` (remover 8 arquivos)
- **Deploy**: Criar `DEPLOY.md` único (remover 4 arquivos)

### Revisar e Atualizar:
- README.md
- GUIA-DO-USUARIO.md
- CHANGELOG.md

### Organizar:
- Mover arquivos de teste para `docs/tests/`
- Mover arquivos de análise para `docs/analysis/`

### Total de arquivos a remover: ~12-15 arquivos
