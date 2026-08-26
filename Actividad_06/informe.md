# Informe - Actividad 06

## Vulnerabilidades en dependencias: pip-audit y CVEs

Fecha: 26/08/2026

## 1. Objetivo de la actividad

El objetivo de la actividad fue realizar una auditoría de seguridad sobre las dependencias utilizadas en el proyecto Python correspondiente a la Actividad 04.

Para ello se utilizó la herramienta `pip-audit`, que permite comparar las dependencias instaladas con bases de datos de vulnerabilidades conocidas y detectar posibles fallas de seguridad asociadas a CVE y otros identificadores de vulnerabilidades.

La actividad también incluyó la interpretación de uno de los hallazgos encontrados, la actualización de las dependencias vulnerables, una nueva auditoría de verificación y la generación de evidencias.

## 2. Metodología de la auditoría

La auditoría se realizó sobre el entorno virtual del proyecto de la Actividad 04.

El procedimiento aplicado fue el siguiente:

1. Se activó el entorno virtual del proyecto.
2. Se instaló la herramienta `pip-audit`.
3. Se verificó correctamente su instalación.
4. Se ejecutó una auditoría inicial de las dependencias.
5. Se analizaron los hallazgos encontrados.
6. Se seleccionó uno de los hallazgos para su interpretación con ayuda de inteligencia artificial.
7. Se actualizaron las dependencias vulnerables.
8. Se ejecutó nuevamente `pip-audit`.
9. Se verificó que ya no existieran vulnerabilidades conocidas.
10. Se generó un reporte estructurado en formato JSON.
11. Se documentaron las evidencias obtenidas durante el proceso.

## 3. Resultados de la auditoría inicial

La auditoría inicial detectó vulnerabilidades conocidas en los siguientes paquetes:

* `pip` versión 24.0.
* `setuptools` versión 65.5.0.

Entre los hallazgos asociados a `pip` se identificaron:

* PYSEC-2026-196
* PYSEC-2026-1795
* PYSEC-2026-1796
* PYSEC-2026-196
* PYSEC-2026-2875
* PYSEC-2026-2876
* PYSEC-2026-3721

También se identificaron múltiples hallazgos correspondientes a `setuptools` versión 65.5.0.

La evidencia correspondiente a esta etapa quedó registrada en:

`EVI-2026-08-26-01-pipaudit-antes.txt`

## 4. Interpretación de un CVE

Se seleccionó el hallazgo `PYSEC-2026-196`, asociado a `CVE-2026-8643`, correspondiente a `pip 24.0`.

La vulnerabilidad se encontraba relacionada con la validación de rutas durante la instalación de paquetes Python. Bajo determinadas condiciones, un paquete manipulado podía intentar escribir archivos fuera del directorio previsto durante el proceso de instalación.

La vulnerabilidad presentaba una severidad Media, con una puntuación CVSS v3.1 de 5.5.

CVSS, o Common Vulnerability Scoring System, es un sistema utilizado para expresar la gravedad técnica de una vulnerabilidad mediante una puntuación entre 0 y 10.

En el contexto de una institución financiera, este tipo de vulnerabilidad puede representar un riesgo para la integridad de los sistemas de desarrollo, automatización y despliegue, especialmente si un atacante logra introducir un paquete malicioso en el proceso de instalación.

La versión indicada como corregida fue `pip 26.1.2` o superior.

La explicación del hallazgo se documentó como:

`EVI-2026-08-26-04-cve-explicado.png`

## 5. Acciones tomadas

Luego de analizar los hallazgos se decidió actualizar las dependencias afectadas.

Se realizaron las siguientes actualizaciones:

### pip

Versión inicial:

`24.0`

Versión posterior a la actualización:

`26.2.1`

### setuptools

Versión inicial:

`65.5.0`

Versión posterior a la actualización:

`84.0.0`

Las actualizaciones fueron realizadas dentro del entorno virtual del proyecto.

## 6. Verificación posterior

Una vez actualizadas las dependencias se ejecutó nuevamente la herramienta `pip-audit`.

El resultado obtenido fue:

`No known vulnerabilities found`

Esto permitió verificar que los hallazgos detectados inicialmente ya no estaban presentes luego de las actualizaciones realizadas.

La evidencia correspondiente fue registrada en:

`EVI-2026-08-26-02-pipaudit-despues.txt`

También se generó un reporte estructurado en formato JSON:

`EVI-2026-08-26-03-audit.json`

## 7. Validación de la aplicación

Luego de actualizar las dependencias se realizó una prueba de ejecución de la aplicación correspondiente a la Actividad 04.

Durante la primera ejecución se detectó que la variable de entorno `API_TOKEN` no se encontraba configurada.

Este inconveniente no estaba relacionado con las actualizaciones realizadas, sino con un requisito previo de configuración de la propia aplicación.

Una vez configurada correctamente la variable de entorno, se pudo continuar con la validación de funcionamiento del proyecto.

## 8. Riesgos identificados

El principal riesgo detectado fue la utilización de dependencias desactualizadas con vulnerabilidades conocidas.

En un entorno institucional o financiero, este tipo de riesgo puede afectar:

* Integridad del software.
* Seguridad de los procesos de desarrollo.
* Procesos de integración y despliegue.
* Configuraciones del sistema.
* Gestión de la cadena de suministro de software.

La actualización de las dependencias permitió reducir el riesgo identificado durante esta actividad.

## 9. Política propuesta para la gestión de dependencias

Se propone establecer una política de revisión periódica de dependencias que contemple los siguientes puntos:

* Ejecutar auditorías de dependencias de forma periódica.
* Ejecutar `pip-audit` antes de realizar despliegues a producción.
* Priorizar la corrección de vulnerabilidades críticas y altas.
* Evaluar también las vulnerabilidades de severidad media cuando afecten sistemas sensibles.
* Revisar la compatibilidad de las nuevas versiones antes de actualizar.
* Realizar pruebas funcionales después de cada actualización.
* Mantener las dependencias y sus versiones documentadas.
* Utilizar entornos virtuales para aislar las dependencias de cada proyecto.
* Integrar herramientas de auditoría dentro de procesos de integración continua.
* Conservar evidencias de las auditorías y actualizaciones realizadas.

## 10. Conclusión

La actividad permitió comprobar que las dependencias de una aplicación pueden introducir vulnerabilidades incluso cuando el código desarrollado no presenta errores directos de seguridad.

Mediante el uso de `pip-audit` se detectaron vulnerabilidades en las versiones instaladas de `pip` y `setuptools`.

Luego del análisis se actualizaron ambas dependencias y se realizó una nueva auditoría, obteniendo como resultado que no existían vulnerabilidades conocidas.

La actividad demuestra la importancia de mantener un proceso continuo de revisión y actualización de dependencias como parte de la gestión de vulnerabilidades y de la seguridad de la cadena de suministro de software.
