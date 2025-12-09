# Identity OCR + Liveness (Node 20)

Prototipo mínimo en Node 20 para el reto `kata_ocr_deepfake.md` que combina:

- API REST ligera sin dependencias externas.
- Autenticación con JWT (HS256) y auditoría con cifrado AES-GCM.
- Pipeline de OCR simulado (hashing del buffer) con métricas de calidad.
- Detección de liveness con prueba de parpadeo y cercanía.
- Repositorio local/mock de documentos de identidad.

> Nota: El código está listo para conectarse a librerías reales (Tesseract, EasyOCR o visión por computadora) cuando se disponga de conectividad a npm. Mientras tanto se mantienen implementaciones determinísticas sin dependencias para que el flujo sea reproducible en este entorno aislado.

## Requerimientos previos
- Node.js 20 o superior.
- Opcional: archivo `.env` basado en `.env.example`.

## Configuración rápida
```bash
cp .env.example .env # ajusta claves seguras en entornos reales
npm run start
```
La API expone por defecto el puerto 3000.

## Endpoints principales
- `GET /health` → estado del servicio.
- `GET /auth/demo-token` → genera un JWT de prueba para usar en los headers `Authorization: Bearer <token>`.
- `POST /api/ocr/extract` → `{ imageBase64 }` devuelve texto simulado, confianza y métricas de calidad (brillo, claridad y riesgo de brillo).
- `POST /api/liveness/blink` → `{ frames: [frame1, frame2] }` calcula confianza de parpadeo comparando frames.
- `POST /api/liveness/proximity` → `{ faceBox: {width,height}, frame: {width,height} }` valida cercanía de la cara.
- `POST /api/documents/verify` → `{ documentNumber, fullName }` consulta el repositorio local (aprobado, pendiente, rechazado o desconocido).

Todas las rutas bajo `/api` requieren JWT.

## Auditoría y seguridad
- Logs cifrados en `logs/audit.log` usando AES-256-GCM con clave hex `AUDIT_LOG_KEY`.
- JWT HS256 con secreto `JWT_SECRET`.
- Lógica de parsing defensivo y tamaños limitados de payload.

## Pruebas
Se usa el runner nativo de Node (`node:test`) para mantener cero dependencias adicionales.
```bash
npm test
```

## Extender a librerías de IA reales
- Sustituir `extractText` en `src/services/ocrService.js` por la llamada a Tesseract/EasyOCR.
- Reemplazar `blinkAnalysis`/`proximityCheck` con un modelo anti-spoofing (p.ej., Silent-Face-Anti-Spoofing) o un detector de landmarks.
- El diseño del servicio y los tests están desacoplados para facilitar ese cambio.

## Dataset de referencia
Puedes usar documentos sintéticos o conjuntos abiertos como [DocVQA](https://rrc.cvc.uab.es/?ch=17) para alimentar el pipeline cuando se integre un OCR real.

## Docker Compose
```yaml
docker-compose up --build
```
Levanta el contenedor con Node 20 y expone el puerto configurado en `PORT`.

## Estructura
```
src/
  app.js              # Router HTTP minimalista
  server.js           # Bootstrap del servidor
  config.js           # Gestión de entorno y defaults seguros
  middleware/auth.js  # JWT HS256 manual
  services/
    auditLogger.js    # Logs cifrados AES-GCM
    documentRepository.js
    livenessService.js
    ocrService.js
kata_ocr_deepfake.md  # enunciado original
logs/                 # salida de auditoría
```
