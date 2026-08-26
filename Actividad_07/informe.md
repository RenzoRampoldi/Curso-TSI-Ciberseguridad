# Informe - Actividad 07: Análisis estático avanzado con Semgrep y reglas propias

## 1. Metodología

Para la realización de la actividad se utilizó Semgrep como herramienta de análisis estático de código (SAST). Primero se instaló la herramienta mediante pip y se verificó su funcionamiento utilizando la versión 1.174.0.

Posteriormente se ejecutó Semgrep utilizando el conjunto de reglas `p/security-audit` sobre el código Python utilizado en actividades anteriores.

También se utilizó Bandit con el objetivo de realizar una comparación entre ambas herramientas de análisis estático.

Finalmente, se creó una regla propia de Semgrep en formato YAML para detectar y prohibir el uso de la función `eval()` en código Python.

## 2. Hallazgos obtenidos

La ejecución de Semgrep con el conjunto de reglas `p/security-audit` analizó un archivo Python y ejecutó 79 reglas aplicables.

El análisis finalizó correctamente y no se detectaron hallazgos de seguridad en el archivo `app.py`.

Resultado:

* Archivos analizados: 1
* Reglas ejecutadas: 79
* Hallazgos: 0

Posteriormente se ejecutó Bandit sobre el mismo código. Bandit analizó 45 líneas de código y tampoco identificó problemas de seguridad.

Resultado Bandit:

* Problemas identificados: 0
* Severidad baja: 0
* Severidad media: 0
* Severidad alta: 0

## 3. Comparación entre Bandit y Semgrep

En el código analizado, tanto Bandit como Semgrep obtuvieron resultados similares, ya que ninguna de las herramientas identificó vulnerabilidades en `app.py`.

Bandit proporciona reglas de seguridad predefinidas orientadas principalmente al análisis de código Python.

Semgrep, además de disponer de conjuntos de reglas de seguridad existentes, permite que los equipos creen reglas personalizadas para detectar patrones específicos de una organización.

Esta característica permite adaptar los controles de seguridad a las políticas internas del equipo de desarrollo.

## 4. Regla propia

Se creó la regla `no-eval-python`, almacenada en:

`reglas/no-eval.yaml`

La finalidad de la regla es detectar el uso de la función `eval()` en código Python.

La regla utilizada fue:

```yaml
rules:
  - id: no-eval-python
    languages:
      - python
    message: "Uso de eval() detectado. Esta función puede ejecutar código arbitrario y representa un riesgo de seguridad."
    severity: ERROR
    pattern: eval(...)
    metadata:
      category: security
      technology:
        - python
      cwe:
        - "CWE-95: Improper Neutralization of Directives in Dynamically Evaluated Code"
```

Para comprobar el funcionamiento de la regla se creó el archivo `codigo/prueba_eval.py` con el siguiente código:

```python
entrada = input("Ingrese una expresion: ")
resultado = eval(entrada)
print(resultado)
```

Al ejecutar Semgrep con la regla personalizada se detectó correctamente el uso de `eval()`.

Resultado:

* Reglas ejecutadas: 1
* Archivos analizados: 2
* Hallazgos: 1
* Resultado: hallazgo bloqueante

La línea identificada fue:

```python
resultado = eval(entrada)
```

La prueba permitió comprobar que la regla personalizada funciona correctamente.

## 5. Riesgo asociado

El uso de `eval()` puede representar un riesgo de seguridad debido a que permite interpretar y ejecutar expresiones dinámicamente.

En caso de utilizar información controlada por un usuario, podría permitir la ejecución de instrucciones no previstas por la aplicación.

Por este motivo se decidió crear una regla de análisis estático que permita detectar automáticamente su utilización durante el desarrollo.

## 6. Recomendación de integración

Se recomienda integrar Semgrep dentro del flujo de desarrollo de software de la organización.

La herramienta puede utilizarse tanto de forma manual durante el desarrollo como dentro de procesos automatizados de integración continua y despliegue continuo.

La incorporación de reglas personalizadas permitiría establecer políticas de seguridad propias, por ejemplo:

* Prohibir funciones consideradas inseguras.
* Detectar el registro de información sensible en logs.
* Detectar credenciales escritas directamente en el código.
* Detectar APIs o funciones internas consideradas obsoletas o inseguras.

De esta manera, los problemas podrían identificarse antes de que el código llegue a producción.

## 7. Evidencias

Las evidencias generadas durante la actividad fueron:

* `EVI-2026-08-26-01-semgrep-audit.txt`: ejecución de Semgrep con `p/security-audit`.
* `EVI-2026-08-26-02-regla-no-eval.yaml`: regla personalizada creada.
* `EVI-2026-08-26-03-semgrep-regla.txt`: ejecución de Semgrep con la regla personalizada.
* `EVI-2026-08-26-04-comparacion.png`: comparación entre Semgrep y Bandit.

## 8. Reflexión sobre el uso de IA

Un Responsable de Seguridad de la Información debería conocer cómo escribir reglas de análisis estático porque esto permite adaptar las herramientas de seguridad a las necesidades específicas de su organización.

Las reglas genéricas permiten detectar vulnerabilidades conocidas, pero cada institución puede tener políticas internas o patrones de programación que desea evitar.

En una organización podrían definirse reglas para prohibir el uso de `eval()`, impedir que se escriban contraseñas o tokens directamente en el código y evitar que información sensible de clientes sea registrada en archivos de log.

La utilización de inteligencia artificial puede colaborar en la interpretación de los hallazgos, en la creación inicial de reglas y en la documentación de los resultados. Sin embargo, las reglas deben ser revisadas y probadas antes de incorporarse al flujo de trabajo.

## 9. Conclusión

La actividad permitió utilizar Semgrep como herramienta de análisis estático avanzado y comprender la diferencia entre utilizar reglas genéricas y reglas personalizadas.

El análisis inicial no detectó vulnerabilidades en el código analizado. Sin embargo, al incorporar una regla propia se logró detectar correctamente el uso de una función definida como insegura.

Esto demuestra la utilidad de Semgrep para implementar controles de seguridad específicos y automatizar la detección de patrones de código que no cumplen con las políticas establecidas por una organización.
