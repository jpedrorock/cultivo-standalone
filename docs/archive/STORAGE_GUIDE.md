# Guia de Configuração de Storage

Este aplicativo suporta dois tipos de armazenamento de fotos:

## 1. Storage Local (Padrão) ✅ Recomendado para Deploy Próprio

As fotos são armazenadas na pasta `uploads/` do servidor.

### Vantagens:
- ✅ Simples de configurar
- ✅ Sem custos adicionais
- ✅ Funciona em qualquer servidor
- ✅ Com compressão (~100-200KB por foto), é totalmente viável

### Configuração:

**Não precisa configurar nada!** O storage local é o padrão.

As fotos serão salvas em: `uploads/plants/{plantId}/health/` e `uploads/plants/{plantId}/trichomes/`

### Deploy:

1. **Vercel/Railway/Render:**
   - As fotos serão salvas no sistema de arquivos do container
   - ⚠️ **Importante**: Configure volume persistente para não perder fotos ao reiniciar

2. **Servidor Próprio (VPS/Dedicado):**
   - As fotos ficam na pasta `uploads/` do projeto
   - ✅ Persistem automaticamente
   - Configure backup regular da pasta `uploads/`

3. **Nginx/Apache:**
   - As fotos são servidas automaticamente em `/uploads/`
   - Nenhuma configuração adicional necessária

---

## 2. Storage S3 (Nuvem)

As fotos são armazenadas no Amazon S3 ou compatível.

### Vantagens:
- ✅ Backup automático
- ✅ CDN global (mais rápido)
- ✅ Escalável
- ✅ Não ocupa espaço no servidor

### Configuração:

1. **Adicione a variável de ambiente:**

```bash
STORAGE_TYPE=s3
```

2. **Configure as credenciais do S3:**

As credenciais já estão configuradas para o S3 da Manus. Se quiser usar seu próprio S3, edite `server/storage.ts`:

```typescript
// AWS S3
const baseUrl = "https://s3.amazonaws.com";
const apiKey = "sua-chave-aqui";

// Ou Cloudflare R2 (mais barato)
const baseUrl = "https://seu-account.r2.cloudflarestorage.com";
const apiKey = "sua-chave-r2";
```

---

## 3. Alternativas de Storage em Nuvem

### Cloudflare R2 (Recomendado - Mais Barato)

- **Custo**: $0.015/GB/mês (10x mais barato que S3)
- **Sem custo de transferência**
- **Compatível com S3 API**

**Como configurar:**

1. Crie conta no Cloudflare
2. Ative R2 no dashboard
3. Crie um bucket
4. Obtenha as credenciais (Access Key ID e Secret Access Key)
5. Atualize `server/storage.ts` com as credenciais do R2

### Backblaze B2

- **Custo**: $0.005/GB/mês (ainda mais barato)
- **Primeiros 10GB grátis**

### Google Cloud Storage

- **Custo**: Similar ao S3
- **Integração com Google Cloud**

---

## Comparação de Custos (100GB de fotos)

| Storage | Custo Mensal | Transferência |
|---------|--------------|---------------|
| **Local (VPS)** | $0 (incluído no servidor) | Ilimitado |
| **Cloudflare R2** | $1.50 | Grátis |
| **Backblaze B2** | $0.50 | $0.01/GB |
| **AWS S3** | $2.30 | $0.09/GB |
| **S3 Manus** | Grátis (enquanto usar Manus) | Grátis |

---

## Recomendações

### Para Deploy em Servidor Próprio (VPS/Dedicado):
✅ **Use Storage Local** (padrão)
- Simples
- Sem custos extras
- Com compressão, 1000 fotos = ~100-200MB

### Para Deploy em Plataformas (Vercel/Railway):
⚠️ **Use S3 ou Cloudflare R2**
- Containers podem ser reiniciados (perda de fotos)
- Storage local não é persistente

### Para Alto Volume (10.000+ fotos):
✅ **Use Cloudflare R2**
- Mais barato
- Escalável
- Sem custo de transferência

---

## Migração entre Storages

Se você começar com storage local e quiser migrar para S3:

1. Configure `STORAGE_TYPE=s3`
2. As novas fotos irão para o S3
3. As fotos antigas continuam funcionando (no servidor local)
4. Opcionalmente, migre fotos antigas:
   - Faça upload manual das fotos da pasta `uploads/` para o S3
   - Atualize os URLs no banco de dados

---

## Backup

### Storage Local:
```bash
# Backup da pasta uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/

# Restaurar backup
tar -xzf uploads-backup-20260218.tar.gz
```

### Storage S3/R2:
- Backup automático (versionamento de objetos)
- Configure lifecycle policies para arquivamento

---

## Troubleshooting

### Fotos não aparecem (Storage Local):

1. Verifique se a pasta `uploads/` existe
2. Verifique permissões: `chmod 755 uploads/`
3. Verifique se o servidor está servindo `/uploads/`

### Fotos não aparecem (Storage S3):

1. Verifique variável `STORAGE_TYPE=s3`
2. Verifique credenciais do S3
3. Verifique permissões do bucket (público para leitura)

---

## Suporte

Para dúvidas ou problemas, consulte:
- Documentação do Cloudflare R2: https://developers.cloudflare.com/r2/
- Documentação do AWS S3: https://docs.aws.amazon.com/s3/
