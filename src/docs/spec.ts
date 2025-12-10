export const openapiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Identity OCR Liveness API',
    version: '1.0.0',
    description: 'API para autenticación, OCR, liveness, ML y auditoría',
  },
  servers: [
    { url: '/', description: 'Servidor local' }
  ],
  tags: [
    { name: 'Auth' },
    { name: 'OCR' },
    { name: 'Liveness' },
    { name: 'Validation' },
    { name: 'Audit' },
    { name: 'System' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Message: { type: 'object', properties: { message: { type: 'string' }, version: { type: 'string' } } },
      Health: { type: 'object', properties: { status: { type: 'string' } } },
      User: { type: 'object', properties: { id: { type: 'string' }, email: { type: 'string' }, name: { type: 'string' }, role: { type: 'string' } } },
      RegisterResponse: { type: 'object', properties: { message: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } },
      LoginResponse: { type: 'object', properties: { accessToken: { type: 'string' }, refreshToken: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } },
      AccessToken: { type: 'object', properties: { accessToken: { type: 'string' } } },
      ErrorResponse: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      OCRResult: { type: 'object', properties: { text: { type: 'string' }, confidence: { type: 'number' }, data: { type: 'object', additionalProperties: true } } },
      OCRJobStatus: { type: 'object', properties: { id: { type: 'string' }, state: { type: 'string' }, result: { type: 'object', nullable: true }, error: { type: 'string', nullable: true } } },
      LivenessSession: { type: 'object', properties: { id: { type: 'string' }, userId: { type: 'string' }, challenge: { type: 'string', enum: ['BLINK','ZOOM_IN'] }, status: { type: 'string', enum: ['PENDING','PASSED'] }, createdAt: { type: 'string' }, attempts: { type: 'integer' } } },
      FaceAnalysisDetails: { type: 'object', properties: { blinkDetected: { type: 'boolean' }, ear: { type: 'number' }, faceDetected: { type: 'boolean' } } },
      FaceAnalysisResult: { type: 'object', properties: { isLive: { type: 'boolean' }, score: { type: 'number' }, details: { $ref: '#/components/schemas/FaceAnalysisDetails' } } },
      ValidationResult: { type: 'object', properties: { isValid: { type: 'boolean' }, source: { type: 'string', enum: ['LOCAL_DB','EXTERNAL_ENTITY','BLACKLIST'] }, details: { type: 'object', nullable: true } } },
      DocumentStatus: { type: 'object', properties: { status: { type: 'string', enum: ['BLACKLISTED','valid','invalid','UNKNOWN'] }, details: { type: 'object', nullable: true } } },
      FaceMatchResult: { type: 'object', properties: { match: { type: 'boolean' }, score: { type: 'number' }, reason: { type: 'string' } }, required: ['match','score'] },
      DeepfakeAnalysisResult: { type: 'object', properties: { isReal: { type: 'boolean' }, score: { type: 'number' }, confidence: { type: 'number' }, artifacts: { type: 'array', items: { type: 'string' } }, processingTimeMs: { type: 'integer' } } },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['System'],
        summary: 'Estado del API',
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' }, examples: { default: { value: { message: 'Identity OCR Liveness API is running', version: '1.0.0' } } } } } } },
      },
    },
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Health' }, examples: { default: { value: { status: 'UP' } } } } } } },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registro de usuario',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' }, name: { type: 'string' } }, required: ['email', 'password', 'name'] } } } },
        responses: { '201': { description: 'Registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterResponse' }, examples: { default: { value: { message: 'User registered successfully', user: { id: 'uuid', email: 'user@example.com', name: 'User' } } } } } } }, '400': { description: 'Error de validación', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } } } },
        responses: { '200': { description: 'Autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' }, examples: { default: { value: { accessToken: 'jwt', refreshToken: 'jwt', user: { id: 'uuid', email: 'user@example.com', name: 'User', role: 'user' } } } } } } }, '401': { description: 'Credenciales inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } } },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refrescar token',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } }, required: ['refreshToken'] } } } },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AccessToken' }, examples: { default: { value: { accessToken: 'jwt' } } } } } }, '403': { description: 'Token inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } } },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } }, required: ['refreshToken'] } } } },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } }, examples: { default: { value: { message: 'Logged out successfully' } } } } } } },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Perfil',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } } } } }, '401': { description: 'No autorizado' } },
      },
    },
    '/api/ocr/analyze': {
      post: {
        tags: ['OCR'],
        summary: 'Analizar documento (sync)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { document: { type: 'string', format: 'binary' } }, required: ['document'] } } } },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/OCRResult' }, examples: { default: { value: { text: 'ABC', confidence: 0.92, data: { documentNumber: '1022954370' } } } } } } }, '400': { description: 'Archivo inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }, '500': { description: 'Error de servidor' } },
      },
    },
    '/api/ocr/queue': {
      post: {
        tags: ['OCR'],
        summary: 'Encolar análisis (async)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { document: { type: 'string', format: 'binary' } }, required: ['document'] } } } },
        responses: { '202': { description: 'Encolado', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, jobId: { type: 'string' }, statusUrl: { type: 'string' } } }, examples: { default: { value: { message: 'Document accepted for processing', jobId: '123', statusUrl: '/api/ocr/status/123' } } } } } }, '400': { description: 'Archivo inválido' } },
      },
    },
    '/api/ocr/status/{id}': {
      get: {
        tags: ['OCR'],
        summary: 'Estado de análisis',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/OCRJobStatus' } } } }, '404': { description: 'No encontrado' } },
      },
    },
    '/api/liveness/start-session': {
      post: {
        tags: ['Liveness'],
        summary: 'Iniciar sesión de liveness',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Creado', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, sessionId: { type: 'string' }, challenge: { type: 'string' } } }, examples: { default: { value: { message: 'Liveness session started', sessionId: 'uuid', challenge: 'ZOOM_IN' } } } } } }, '401': { description: 'No autorizado' } },
      },
    },
    '/api/liveness/validate-frame': {
      post: {
        tags: ['Liveness'],
        summary: 'Validar frame',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { frame: { type: 'string', format: 'binary' }, sessionId: { type: 'string' } }, required: ['frame','sessionId'] } } } },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, result: { $ref: '#/components/schemas/FaceAnalysisResult' } } }, examples: { default: { value: { message: 'Frame processed', result: { isLive: true, score: 0.78, details: { blinkDetected: false, ear: 0.28, faceDetected: true } } } } } } } }, '400': { description: 'Datos faltantes' }, '500': { description: 'Error de servidor' } },
      },
    },
    '/api/liveness/session/{id}': {
      get: {
        tags: ['Liveness'],
        summary: 'Obtener sesión',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/LivenessSession' } } } }, '404': { description: 'No encontrada' } },
      },
    },
    '/api/liveness/finalize': {
      post: {
        tags: ['Liveness'],
        summary: 'Finalizar sesión',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { sessionId: { type: 'string' }, reason: { type: 'string' } }, required: ['sessionId'] } } } },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } }, examples: { default: { value: { message: 'Session finalized' } } } } } }, '400': { description: 'Datos faltantes' } },
      },
    },
    '/api/validation/cedula': {
      post: {
        tags: ['Validation'],
        summary: 'Validar cédula',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { documentNumber: { type: 'string' } }, required: ['documentNumber'] } } } },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationResult' } } } }, '400': { description: 'Error de validación' } },
      },
    },
    '/api/validation/passport': {
      post: {
        tags: ['Validation'],
        summary: 'Validar pasaporte',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { documentNumber: { type: 'string' }, mrz: { type: 'string' } }, required: ['documentNumber'] } } } },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationResult' } } } }, '400': { description: 'MRZ inválida' } },
      },
    },
    '/api/validation/license': {
      post: {
        tags: ['Validation'],
        summary: 'Validar licencia',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { documentNumber: { type: 'string' } }, required: ['documentNumber'] } } } },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationResult' } } } } },
      },
    },
    '/api/validation/blacklist-check': {
      post: {
        tags: ['Validation'],
        summary: 'Chequeo de listas negras',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { documentNumber: { type: 'string' } }, required: ['documentNumber'] } } } },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { blacklisted: { type: 'boolean' }, details: { type: 'object', nullable: true } } } } } } },
      },
    },
    '/api/validation/cross-check': {
      post: {
        tags: ['Validation'],
        summary: 'Cross-check',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { documentNumber: { type: 'string' }, type: { type: 'string', enum: ['cedula','passport','license'] }, name: { type: 'string' }, issueDate: { type: 'string' } }, required: ['documentNumber','type'] } } } },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object', allOf: [ { $ref: '#/components/schemas/ValidationResult' }, { type: 'object', properties: { crossCheck: { type: 'string' }, mismatches: { type: 'object', properties: { name: { type: 'boolean' }, issueDate: { type: 'boolean' } } } } } ] } } } } },
      },
    },
    '/api/validation/status/{number}': {
      get: {
        tags: ['Validation'],
        summary: 'Estado del documento',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'number', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/DocumentStatus' } } } } },
      },
    },
    '/api/validation/face-match': {
      post: {
        tags: ['Validation'],
        summary: 'Face match doc vs live',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { doc: { type: 'string', format: 'binary' }, live: { type: 'string', format: 'binary' } }, required: ['doc', 'live'] } } } },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/FaceMatchResult' } } } }, '400': { description: 'Datos faltantes' } },
      },
    },
    '/api/audit/logs': {
      get: {
        tags: ['Audit'],
        summary: 'Logs de aplicación',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { file: { type: 'string' }, logs: { type: 'array', items: { type: 'object' } } } } } } } },
      },
    },
    '/api/audit/security-logs': {
      get: {
        tags: ['Audit'],
        summary: 'Logs de seguridad',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { file: { type: 'string' }, logs: { type: 'array', items: { type: 'object' } } } } } } } },
      },
    },
  },
};
