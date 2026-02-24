/**
 * Utilitário simplificado para processar imagens antes do upload
 * - Upload direto sem processamento complexo
 * - Conversão básica para base64
 */

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
 * Processa arquivo de imagem (sem conversão HEIC por enquanto)
 * @param file - Arquivo de imagem
 * @returns Promise com File processado
 */
export async function processImageFile(file: File): Promise<File> {
  // Por enquanto apenas retorna o arquivo original
  // HEIC não é suportado nesta versão simplificada
  if (isHEIC(file)) {
    throw new Error('Formato HEIC não suportado. Use JPEG ou PNG.');
  }
  
  return file;
}
