/**
 * Sistema de armazenamento local de arquivos
 * Alternativa ao S3 para deploy em servidores próprios
 */

import fs from 'fs';
import path from 'path';
import { ENV } from './_core/env';

// Diretório base para uploads (relativo à raiz do projeto)
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

/**
 * Garante que o diretório de uploads existe
 */
function ensureUploadsDirExists() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

/**
 * Salva arquivo no storage local
 * @param relKey - Caminho relativo do arquivo (ex: "plants/1/health/123456.jpg")
 * @param data - Dados do arquivo (Buffer, Uint8Array ou string)
 * @param contentType - Tipo MIME do arquivo
 * @returns Objeto com key e url do arquivo
 */
export async function storageLocalPut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  ensureUploadsDirExists();

  // Normalizar key (remover barras iniciais)
  const key = relKey.replace(/^\/+/, "");
  
  // Caminho completo do arquivo
  const filePath = path.join(UPLOADS_DIR, key);
  
  // Criar diretórios intermediários se não existirem
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Converter dados para Buffer se necessário
  let buffer: Buffer;
  if (typeof data === 'string') {
    buffer = Buffer.from(data);
  } else if (data instanceof Uint8Array) {
    buffer = Buffer.from(data);
  } else {
    buffer = data;
  }
  
  // Salvar arquivo
  fs.writeFileSync(filePath, buffer);
  
  // Gerar URL pública
  // Em produção, isso será servido pelo servidor web (ex: /uploads/plants/1/health/123456.jpg)
  const url = `/uploads/${key}`;
  
  return { key, url };
}

/**
 * Obtém URL de um arquivo no storage local
 * @param relKey - Caminho relativo do arquivo
 * @returns Objeto com key e url do arquivo
 */
export async function storageLocalGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  const url = `/uploads/${key}`;
  
  return { key, url };
}

/**
 * Deleta arquivo do storage local
 * @param relKey - Caminho relativo do arquivo
 */
export async function storageLocalDelete(relKey: string): Promise<void> {
  const key = relKey.replace(/^\/+/, "");
  const filePath = path.join(UPLOADS_DIR, key);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Lista arquivos em um diretório do storage local
 * @param prefix - Prefixo do caminho (ex: "plants/1/")
 * @returns Array de objetos com key e url
 */
export async function storageLocalList(prefix: string): Promise<Array<{ key: string; url: string }>> {
  ensureUploadsDirExists();
  
  const normalizedPrefix = prefix.replace(/^\/+/, "");
  const dirPath = path.join(UPLOADS_DIR, normalizedPrefix);
  
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  
  const files: Array<{ key: string; url: string }> = [];
  
  function walkDir(dir: string, basePrefix: string) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath, path.join(basePrefix, item));
      } else {
        const key = path.join(basePrefix, item).replace(/\\/g, '/');
        files.push({
          key,
          url: `/uploads/${key}`
        });
      }
    }
  }
  
  walkDir(dirPath, normalizedPrefix);
  
  return files;
}
