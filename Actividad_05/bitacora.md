# Bitácora - Actividad 05: Análisis estático de código con Bandit

**Fecha:** 19/08/2026
**Herramienta utilizada:** Bandit 1.9.4
**Lenguaje analizado:** Python 3.11.9
**Archivo analizado:** `codigo/app.py`

## 1. Objetivo

Realizar un análisis estático de seguridad (SAST) sobre el código Python desarrollado en la Actividad 04, utilizando Bandit, con el objetivo de identificar posibles vulnerabilidades, interpretar los hallazgos y aplicar las correcciones correspondientes.

El alcance de esta actividad se limitó al archivo `app.py` de la Actividad 04, debido a que no se disponía del archivo correspondiente a la Actividad 03.

## 2. Instalación y verificación de Bandit

Se creó un entorno virtual de Python y se instaló Bandit mediante:

```bash
venv/Scripts/python.exe -m pip install bandit
```

La instalación fue verificada mediante:

```bash
venv/Scripts/python.exe -m bandit --version
```

Versión obtenida:

```text
Bandit 1.9.4
Python 3.11.9
```

## 3. Análisis inicial

Se ejecutó Bandit sobre el archivo de la API mediante:

```bash
venv/Scripts/python.exe -m bandit -r codigo/app.py
```

En el código original no se identificaron problemas de seguridad:

```text
No issues identified.

Low: 0
Medium: 0
High: 0
```

Para comprobar de forma práctica la capacidad de detección de Bandit, se realizó una prueba controlada modificando temporalmente la configuración de Flask:

```python
debug=True
```

Luego se ejecutó nuevamente Bandit.

## 4. Hallazgo detectado

Bandit detectó el siguiente hallazgo:

* **ID:** B201
* **Nombre:** `flask_debug_true`
* **Severidad:** High
* **Confianza:** Medium
* **CWE:** CWE-94
* **Archivo:** `codigo/app.py`
* **Línea:** 62

El hallazgo se produjo debido a que la aplicación Flask estaba configurada para ejecutarse con:

```python
debug=True
```

Bandit indicó que esta configuración expone el depurador de Werkzeug y puede permitir la ejecución de código arbitrario.

En una aplicación utilizada por una institución financiera, mantener el modo debug habilitado podría representar un riesgo elevado debido a la exposición de información interna de la aplicación y posibles mecanismos de ejecución de código no autorizado.

La ejecución anterior a la corrección fue almacenada en:

`evidencias/EVI-2026-08-19-01-bandit-v1.txt`

## 5. Corrección aplicada

Se modificó la configuración:

```python
debug=True
```

por:

```python
debug=False
```

El bloque final quedó configurado de la siguiente forma:

```python
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
```

## 6. Análisis posterior a la corrección

Luego de aplicar la corrección se volvió a ejecutar:

```bash
venv/Scripts/python.exe -m bandit -r codigo/app.py
```

Resultado:

```text
No issues identified.

Low: 0
Medium: 0
High: 0
```

La corrección eliminó el hallazgo identificado.

La ejecución posterior a la corrección fue almacenada en:

`evidencias/EVI-2026-08-19-02-bandit-v2.txt`

## 7. Comparación antes y después

**Antes de la corrección:**

* High: 1
* Medium: 0
* Low: 0

**Después de la corrección:**

* High: 0
* Medium: 0
* Low: 0

Se corrigió satisfactoriamente el hallazgo B201 identificado por Bandit.

## 8. Reporte JSON

Se generó además un reporte estructurado de Bandit mediante:

```bash
venv/Scripts/python.exe -m bandit -r codigo -f json -o evidencias/EVI-2026-08-19-03-resultado.json
```

El archivo generado fue almacenado como:

`evidencias/EVI-2026-08-19-03-resultado.json`

## 9. Evidencias

Las evidencias correspondientes a la actividad son:

* `EVI-2026-08-19-01-bandit-v1.txt`: análisis previo a la corrección.
* `EVI-2026-08-19-02-bandit-v2.txt`: análisis posterior a la corrección.
* `EVI-2026-08-19-03-resultado.json`: reporte estructurado de Bandit.
* `EVI-2026-08-19-04-interpretacion.png`: interpretación del hallazgo realizada con asistencia de IA.

## 10. Reflexión

El análisis estático permite detectar patrones de programación potencialmente inseguros directamente sobre el código fuente y sin necesidad de ejecutar la aplicación. Esto permite identificar problemas de seguridad en etapas tempranas del desarrollo.

Sin embargo, SAST presenta limitaciones, ya que no analiza el comportamiento real de la aplicación durante su ejecución. Existen vulnerabilidades que pueden depender de la configuración del servidor, las comunicaciones, la autenticación, las sesiones o la interacción con entradas reales.

Para esos casos es necesario complementar el análisis estático con pruebas dinámicas (DAST), en las cuales la aplicación se encuentra en ejecución y se prueban sus respuestas frente a diferentes solicitudes y datos de entrada.

Como buena práctica, se recomienda incorporar herramientas SAST como Bandit dentro del flujo habitual de desarrollo y, especialmente, antes de integrar o desplegar nuevas versiones de una aplicación.
