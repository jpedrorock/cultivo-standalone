/**
 * Utilitário para processar imagens antes do upload
 * - Compressão para reduzir tamanho
 * - Crop/resize para aspect ratio iPhone (3:4 vertical)
 * - Conversão para formato otimizado
 * - Conversão automática HEIC/HEIF → JPEG
 */

import heic2any from 'heic2any';

export interface ProcessImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  aspectRatio?: number; // width/height (ex: 3/4 para iPhone)
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

/**
 * Processa imagem com compressão e crop para aspect ratio iPhone
 * @param file - Arquivo de imagem original
 * @param options - Opções de processamento
 * @returns Promise com Blob da imagem processada
 */
export async function processImage(
  file: File,
  options: ProcessImageOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1080,
    maxHeight = 1440,
    quality = 0.85,
    aspectRatio = 3 / 4, // iPhone aspect ratio (vertical)
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calcular dimensões mantendo aspect ratio
        let targetWidth = img.width;
        let targetHeight = img.height;
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        // Calcular crop para manter aspect ratio desejado
        const currentRatio = img.width / img.height;
        
        if (currentRatio > aspectRatio) {
          // Imagem mais larga que o desejado - crop nas laterais
          sourceWidth = img.height * aspectRatio;
          sourceX = (img.width - sourceWidth) / 2;
        } else if (currentRatio < aspectRatio) {
          // Imagem mais alta que o desejado - crop em cima/baixo
          sourceHeight = img.width / aspectRatio;
          sourceY = (img.height - sourceHeight) / 2;
        }

        // Calcular tamanho final respeitando limites
        targetWidth = sourceWidth;
        targetHeight = sourceHeight;

        if (targetWidth > maxWidth) {
          targetWidth = maxWidth;
          targetHeight = maxWidth / aspectRatio;
        }

        if (targetHeight > maxHeight) {
          targetHeight = maxHeight;
          targetWidth = maxHeight * aspectRatio;
        }

        // Criar canvas e desenhar imagem processada
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Não foi possível criar contexto do canvas'));
          return;
        }

        // Desenhar imagem com crop e resize
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );

        // Converter para blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Erro ao converter imagem'));
            }
          },
          format,
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
 * Converte Blob para File
 * @param blob - Blob da imagem
 * @param fileName - Nome do arquivo
 * @returns File object
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type });
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
  const heicMimeTypes = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];
  const heicExtensions = ['.heic', '.heif'];
  
  // Verificar MIME type
  if (heicMimeTypes.includes(file.type.toLowerCase())) {
    return true;
  }
  
  // Verificar extensão do arquivo
  const fileName = file.name.toLowerCase();
  return heicExtensions.some(ext => fileName.endsWith(ext));
}

/**
 * Converte arquivo HEIC/HEIF para JPEG
 * @param file - Arquivo HEIC/HEIF
 * @returns Promise com File convertido para JPEG
 */
export async function convertHEICToJPEG(file: File): Promise<File> {
  try {
    // Converter HEIC para JPEG usando heic2any
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9
    });
    
    // heic2any pode retornar array de blobs, pegar o primeiro
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    
    // Criar novo File a partir do Blob
    const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
    return new File([blob], newFileName, { type: 'image/jpeg' });
  } catch (error) {
    console.error('Erro ao converter HEIC:', error);
    throw new Error('Não foi possível converter a imagem HEIC. Tente usar uma foto em formato JPEG ou PNG.');
  }
}

/**
 * Processa arquivo de imagem com conversão automática de HEIC
 * @param file - Arquivo de imagem (pode ser HEIC)
 * @returns Promise com File processado (convertido se necessário)
 */
export async function processImageFile(file: File): Promise<File> {
  // Se for HEIC, converter para JPEG primeiro
  if (isHEIC(file)) {
    return await convertHEICToJPEG(file);
  }
  
  // Se não for HEIC, retornar o arquivo original
  return file;
}
