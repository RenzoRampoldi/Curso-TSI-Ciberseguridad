# Bitácora - Actividad 06
## Vulnerabilidades en dependencias: pip-audit y CVEs

Fecha: 26/08/2026

## 1. Auditoría inicial

Se instaló la herramienta pip-audit en el entorno virtual correspondiente al proyecto de la Actividad 04.

Se ejecutó una auditoría inicial de las dependencias instaladas.

La auditoría detectó vulnerabilidades conocidas en los paquetes:

- pip versión 24.0
- setuptools versión 65.5.0

Entre los hallazgos encontrados se identificó PYSEC-2026-196, asociado a CVE-2026-8643, que afectaba a pip 24.0.

Evidencia:
EVI-2026-08-26-01-pipaudit-antes.txt

## 2. Interpretación del CVE

Se analizó el hallazgo PYSEC-2026-196 / CVE-2026-8643 utilizando inteligencia artificial.

La vulnerabilidad afectaba a pip 24.0 y estaba relacionada con la validación de rutas durante la instalación de paquetes Python.

La vulnerabilidad presentaba una severidad Media, con una puntuación CVSS v3.1 de 5.5.

En una institución financiera este tipo de vulnerabilidad podría afectar principalmente la integridad de los sistemas de desarrollo y despliegue, especialmente si se instalan paquetes manipulados o maliciosos.

La versión corregida indicada fue pip 26.1.2 o superior.

Evidencia:
EVI-2026-08-26-04-cve-explicado.png

## 3. Decisión de actualización

Se decidió actualizar las dependencias vulnerables detectadas.

pip fue actualizado:

- Versión anterior: 24.0
- Versión actual: 26.2.1

setuptools fue actualizado:

- Versión anterior: 65.5.0
- Versión actual: 84.0.0

Luego de realizar las actualizaciones se ejecutó nuevamente pip-audit.

Resultado:

No known vulnerabilities found.

Por lo tanto, los hallazgos detectados inicialmente fueron corregidos.

Evidencia:
EVI-2026-08-26-02-pipaudit-despues.txt

## 4. Reporte estructurado

Se generó un reporte de la auditoría en formato JSON utilizando pip-audit.

Evidencia:
EVI-2026-08-26-03-audit.json

## 5. Política propuesta de gestión de dependencias

Se propone aplicar la siguiente política:

- Auditar las dependencias de los proyectos periódicamente.
- Ejecutar pip-audit antes de realizar despliegues a producción.
- Revisar especialmente las vulnerabilidades de severidad alta o crítica.
- Actualizar las dependencias vulnerables después de verificar su compatibilidad con la aplicación.
- Realizar pruebas funcionales después de cada actualización.
- Mantener las versiones de las dependencias documentadas.
- Integrar la auditoría de dependencias dentro del proceso de integración continua.
- Mantener evidencias de las auditorías realizadas.