export const CODE_MESSAGES: Record<string,string> = {
  UNAUTHENTICATED: 'No has iniciado sesión. Inicia sesión para continuar.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NAME_REQUIRED: 'El nombre es obligatorio.',
  MISSING_FIELDS: 'Faltan campos obligatorios.',
  INVALID_PRICE: 'El precio es inválido.',
  FILE_TOO_LARGE: 'El archivo supera el tamaño máximo (2MB).',
  INVALID_MIME: 'Tipo de archivo no permitido (usa JPG, PNG, WEBP, AVIF).',
  INVALID_EXT: 'Extensión de archivo no permitida.',
  UPLOAD_FAILED: 'No se pudo subir el archivo. Intenta nuevamente.',
  SERVER_ERROR: 'Error interno. Intenta más tarde.',
  NOT_FOUND: 'El recurso no existe o fue eliminado.',
  EMAIL_REQUIRED: 'El email es obligatorio.',
};

export function mapApiError(data: any, fallback = 'Ocurrió un error') {
  if (!data) return fallback;
  if (data.code && CODE_MESSAGES[data.code]) return CODE_MESSAGES[data.code];
  if (typeof data.error === 'string') return data.error;
  if (typeof data.message === 'string') return data.message;
  return fallback;
}
