/**
 * Sistema unificado de storage
 * Suporta storage local (servidor) ou S3 (nuvem)
 * Configurável via variável de ambiente STORAGE_TYPE
 */

import { ENV } from './_core/env';

// Tipo de storage: 'local' ou 's3'
// Se não configurado, usa 'local' por padrão
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';

/**
 * Salva arquivo no storage configurado
 * @param relKey - Caminho relativo do arquivo (ex: "plants/1/health/123456.jpg")
 * @param data - Dados do arquivo (Buffer, Uint8Array ou string)
 * @param contentType - Tipo MIME do arquivo
 * @returns Objeto com key e url do arquivo
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  if (STORAGE_TYPE === 's3') {
    // Usar S3 da Manus
    const { storagePut: s3Put } = await import('./storage');
    return s3Put(relKey, data, contentType);
  } else {
    // Usar storage local
    const { storageLocalPut } = await import('./storageLocal');
    return storageLocalPut(relKey, data, contentType);
  }
}

/**
 * Obtém URL de um arquivo no storage configurado
 * @param relKey - Caminho relativo do arquivo
 * @returns Objeto com key e url do arquivo
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  if (STORAGE_TYPE === 's3') {
    // Usar S3 da Manus
    const { storageGet: s3Get } = await import('./storage');
    return s3Get(relKey);
  } else {
    // Usar storage local
    const { storageLocalGet } = await import('./storageLocal');
    return storageLocalGet(relKey);
  }
}

/**
 * Deleta arquivo do storage configurado
 * @param relKey - Caminho relativo do arquivo
 */
export async function storageDelete(relKey: string): Promise<void> {
  if (STORAGE_TYPE === 's3') {
    // S3 não tem função de delete no template atual
    console.warn('Delete não implementado para S3');
  } else {
    // Usar storage local
    const { storageLocalDelete } = await import('./storageLocal');
    return storageLocalDelete(relKey);
  }
}

/**
 * Lista arquivos em um diretório do storage configurado
 * @param prefix - Prefixo do caminho (ex: "plants/1/")
 * @returns Array de objetos com key e url
 */
export async function storageList(prefix: string): Promise<Array<{ key: string; url: string }>> {
  if (STORAGE_TYPE === 's3') {
    // S3 não tem função de list no template atual
    console.warn('List não implementado para S3');
    return [];
  } else {
    // Usar storage local
    const { storageLocalList } = await import('./storageLocal');
    return storageLocalList(prefix);
  }
}
