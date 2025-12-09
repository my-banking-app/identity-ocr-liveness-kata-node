## Kata Senior - IA Developer | OCR and DeepFake

No utilices repositorios del Banco de Bogotá. Aunque el contexto del ejercicio incluye al
banco como actor, ni el nombre ni el logo deben aparecer en repositorios públicos.
Enfócate únicamente en resolver el problema planteado.

Contexto
El Banco de Bogotá busca fortalecer la seguridad de sus portales digitales frente a ataques de
hacking, deepfake y suplantación de identidad. Desde el equipo de autenticador, se han
promovido el uso de tecnologías emergentes y estrategias que garanticen las colocaciones pero
también disminuyan el riesgo de posibles fraudes. El reto consiste en diseñar e implementar un
prototipo que combine IA para detección temprana de fraude, OCR para autenticación
optimizada, y mecanismos de trazabilidad y seguridad en las transacciones, asegurando la
integridad de los datos y la experiencia del cliente.

## Objetivo del reto

Desarrollar un módulo de autenticación inteligente que:

1. Detecte intentos de suplantación mediante análisis de imágenes (rostros, documentos)
   usando Machine Learning. → (Implementa TÉCNICA DE PARPADEO o ACERCAMIENTO)
2. Implementa un mock o un repositorio local para validar documentos de identidad en tiempo
   real, saber que documentos son válidos y cuales no.
3. Garantice trazabilidad y seguridad en cada interacción (logs cifrados, auditoría).
4. Permita la correcta asociación con productos financieros (colocaciones) sin comprometer la
   experiencia del usuario. → (Implementa validaciones que indiquen que un documento fue
   tomado de forma correcta)

Tendrás puntos extra si usas algún LLM

(diagrama de imagen compartida)

Requerimientos técnicos
Lenguajes y tecnologías:
Python o Node.js para scripting.
Librerías de IA: TensorFlow, PyTorch o similares.
OCR: Tesseract, EasyOCR o equivalente.
Seguridad: JWT, cifrado AES/RSA, manejo seguro de sesiones.
Logs y trazabilidad: Elastic Stack o similar
Docker Compose: Para la contrucción del computo
Arquitectura:
API REST segura.
Pipeline para procesamiento OCR.
Buenas prácticas:
Cumplimiento OWASP.
Manejo seguro de credenciales.
Documentación clara.

## Entregables

Tendrás puntos extra si usas algún si implementas un Módulo de ML para esta KATA con
el foco de detección de anomalías (deepfake, suplantación).
Código fuente en repositorio (Git) -> “personales“
Documentación técnica (arquitectura, flujo, dependencias) → “a alto nivel“
Dataset usado (o referencia)
Evidencia de pruebas (unitarias y de seguridad)
Breve demo funcional

## Criterios de evaluación

Seguridad: ¿El módulo previene ataques comunes y protege datos?
Eficiencia: Tiempo de respuesta en autenticación.
Precisión: Tasa de detección de suplantación.
Escalabilidad: Facilidad para integrar en sistemas existentes.
Calidad del código: Legibilidad, modularidad, pruebas.
Trazabilidad: Que podamos ver el porcentaje de autenticaciones fallidas y exitosas, además
de la razón del porque se declinaron.
ReferenciasSe puntual en la presentación, solo tendrás de 5 a 7 min máximo, el material que nos
compartas será evaluado por el jurado y contrará dentro de la calificación.
Face Recognition APIs
GitHub - exadel-inc/CompreFace: Leading free and open-source face recognition sys
tem
Comparing faces in images - Amazon Rekognition
Silent-Face-Anti-Spoofing/README_EN.md at master · minivision-ai/Silent-Face-Anti-
Spoofing

## OCR

GitHub - mindee/doctr: docTR (Document Text Recognition) - a seamless, high-perfor
ming & accessible library for OCR-related tasks powered by Deep Learning.
