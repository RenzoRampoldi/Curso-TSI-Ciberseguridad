# Informe - Actividad 05: Análisis estático de código con Bandit

**Fecha:** 19/08/2026
**Actividad:** Análisis estático de código con Bandit
**Tipo de análisis:** SAST - Static Application Security Testing

## 1. Metodología

En la presente actividad se realizó un análisis estático de seguridad sobre código Python desarrollado previamente en el curso.

El alcance se centró en el archivo `app.py` correspondiente a la Actividad 04, el cual implementa una API utilizando Flask.

Para el análisis se utilizó **Bandit 1.9.4**, herramienta de análisis estático especializada en la identificación de patrones de código Python potencialmente inseguros.

Bandit analiza directamente el código fuente sin necesidad de ejecutar la aplicación, permitiendo identificar determinadas vulnerabilidades durante las etapas de desarrollo.

## 2. Desarrollo de la actividad

En primer lugar se instaló Bandit dentro de un entorno virtual de Python y se verificó su correcto funcionamiento.

Posteriormente se ejecutó:

```bash
venv/Scripts/python.exe -m bandit -r codigo/app.py
```

El código original no presentó hallazgos de seguridad.

Con fines prácticos y para comprobar el funcionamiento de la herramienta, se realizó posteriormente una prueba controlada habilitando temporalmente el modo debug de Flask mediante:

```python
debug=True
```

Al analizar nuevamente el código, Bandit identificó correctamente una vulnerabilidad asociada a dicha configuración.

## 3. Hallazgo identificado

Bandit informó el siguiente hallazgo:

* **Código:** B201
* **Descripción:** `flask_debug_true`
* **Severidad:** Alta
* **Confianza:** Media
* **CWE:** CWE-94

La causa identificada fue la ejecución de Flask con el modo de depuración habilitado.

Esta configuración puede exponer funcionalidades del depurador de Werkzeug y representar un riesgo de ejecución de código arbitrario.

En un entorno financiero, una vulnerabilidad de estas características podría comprometer la confidencialidad, integridad y disponibilidad de los sistemas, por lo que el modo debug no debería utilizarse en ambientes productivos.

## 4. Corrección aplicada

Para mitigar el riesgo se modificó la configuración de Flask de:

```python
debug=True
```

a:

```python
debug=False
```

Una vez realizada la corrección se ejecutó nuevamente Bandit sobre el archivo.

El nuevo análisis obtuvo:

```text
No issues identified.
```

Los resultados posteriores fueron:

* Hallazgos altos: 0
* Hallazgos medios: 0
* Hallazgos bajos: 0

Por lo tanto, el hallazgo identificado fue corregido satisfactoriamente.

## 5. Evidencias

Como respaldo de la actividad se generaron las siguientes evidencias:

* `EVI-2026-08-19-01-bandit-v1.txt`: análisis con el hallazgo B201.
* `EVI-2026-08-19-02-bandit-v2.txt`: análisis posterior a la corrección.
* `EVI-2026-08-19-03-resultado.json`: reporte estructurado generado por Bandit.
* `EVI-2026-08-19-04-interpretacion.png`: interpretación del hallazgo con asistencia de IA.

## 6. Recomendaciones

Se recomienda incorporar herramientas de análisis estático como Bandit dentro del ciclo habitual de desarrollo de aplicaciones Python.

El análisis SAST debería realizarse de forma periódica y especialmente antes de integrar cambios a las ramas principales o realizar despliegues en ambientes productivos.

También se recomienda complementar SAST con otros mecanismos de seguridad, incluyendo pruebas dinámicas (DAST), revisión de dependencias, pruebas de autenticación y autorización y controles de configuración.

La utilización conjunta de distintas técnicas permite aumentar la cobertura del análisis de seguridad y reducir el riesgo de que vulnerabilidades lleguen a ambientes productivos.

## 7. Conclusión

La actividad permitió instalar y utilizar correctamente Bandit como herramienta de análisis estático de seguridad para Python.

Durante la prueba controlada se identificó un hallazgo de severidad alta correspondiente al uso del modo debug de Flask. El problema fue interpretado, corregido y posteriormente validado mediante una nueva ejecución de Bandit.

El resultado final fue satisfactorio, obteniéndose cero hallazgos de severidad alta, media o baja.

La experiencia demuestra la utilidad del análisis estático para detectar determinados errores de seguridad durante las primeras etapas del desarrollo y destaca la importancia de integrar este tipo de controles dentro del ciclo de desarrollo de software.
