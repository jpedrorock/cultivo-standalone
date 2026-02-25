/**
 * Utilitário simplificado para processar imagens antes do upload
 * - Upload direto sem processamento complexo
 * - Conversão básica para base64
 * - Conversão automática de HEIC para PNG
 */

import heic2any from 'heic2any';

export interface ProcessImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Processa imagem com compressão otimizada
 * - Redimensiona para max 1920px (mantém aspect ratio)
 * - Comprime com qualidade 85% para reduzir tamanho
 * - Converte para PNG (mais confiável que JPEG)
 * @param file - Arquivo de imagem original
 * @param options - Opções de processamento
 * @returns Promise com Blob da imagem processada
 */
export async function processImage(
  file: File,
  options: ProcessImageOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calcular dimensões mantendo aspect ratio
        let width = img.width;
        let height = img.height;

        // Redimensionar apenas se necessário
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Criar canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Não foi possível criar contexto do canvas'));
          return;
        }

        // Desenhar imagem
        ctx.drawImage(img, 0, 0, width, height);

        // Converter para blob com PNG (mais confiável que JPEG)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Erro ao converter imagem'));
            }
          },
          'image/png',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Erro ao carregar imagem'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Converte Blob para base64 string
 * @param blob - Blob da imagem
 * @returns Promise com string base64
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Formata tamanho de arquivo para exibição
 * @param bytes - Tamanho em bytes
 * @returns String formatada (ex: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Detecta se o arquivo é HEIC/HEIF
 * @param file - Arquivo a verificar
 * @returns true se for HEIC/HEIF
 */
export function isHEIC(file: File): boolean {
  const heicMimeTypes = ['image/heic', 'image/heif'];
  const heicExtensions = ['.heic', '.heif'];
  
  if (heicMimeTypes.includes(file.type.toLowerCase())) {
    return true;
  }
  
  const fileName = file.name.toLowerCase();
  return heicExtensions.some(ext => fileName.endsWith(ext));
}

/**
 * Converte arquivo HEIC para PNG
 * @param file - Arquivo HEIC
 * @returns Promise com File PNG convertido
 */
export async function convertHEICToPNG(file: File): Promise<File> {
  try {
    // Converte HEIC para blob PNG usando heic2any
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/png',
      quality: 1 // Qualidade máxima na conversão, compressão vem depois
    });

    // heic2any pode retornar array de blobs, pega o primeiro
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

    // Cria novo File a partir do blob
    const fileName = file.name.replace(/\.(heic|heif)$/i, '.png');
    return new File([blob], fileName, { type: 'image/png' });
  } catch (error) {
    console.error('Erro ao converter HEIC:', error);
    throw new Error('Não foi possível converter a imagem HEIC. Tente usar JPEG ou PNG.');
  }
}

/**
 * Processa arquivo de imagem com conversão automática de HEIC
 * @param file - Arquivo de imagem
 * @returns Promise com File processado
 */
export async function processImageFile(file: File): Promise<File> {
  // Se for HEIC, converte para PNG
  if (isHEIC(file)) {
    console.log('Arquivo HEIC detectado, convertendo para PNG...');
    return await convertHEICToPNG(file);
  }
  
  return file;
}
