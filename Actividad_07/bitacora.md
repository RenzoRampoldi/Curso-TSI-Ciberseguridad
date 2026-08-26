# Bitácora - Actividad 07

## Hallazgos de Semgrep

Se ejecutó Semgrep utilizando el conjunto de reglas p/security-audit sobre el código de la actividad. El análisis finalizó correctamente y no se detectaron hallazgos de seguridad en el archivo app.py.

Posteriormente se creó una regla propia para detectar el uso de eval() en código Python. Al ejecutar Semgrep con esta regla sobre el archivo prueba_eval.py, se detectó correctamente un hallazgo asociado al uso de eval().

## Comparación Bandit vs Semgrep

Bandit analizó el mismo código Python y no identificó problemas de seguridad.

Semgrep con las reglas estándar p/security-audit tampoco encontró hallazgos en app.py.

La principal diferencia observada es que Semgrep permite crear reglas personalizadas adaptadas a las políticas internas de una organización. Esto permite detectar patrones específicos que un equipo de seguridad desea prohibir.

## Regla propia

Se creó la regla no-eval-python en el archivo reglas/no-eval.yaml.

La regla detecta el uso de eval() en Python y genera una alerta de severidad alta, debido a que eval() puede ejecutar código arbitrario.

La regla fue probada correctamente sobre codigo/prueba_eval.py.

## Decisión de integración

Se recomienda integrar Semgrep al flujo de desarrollo debido a su capacidad de automatizar controles de seguridad y definir reglas propias. Puede utilizarse durante el desarrollo y también integrarse en procesos de CI/CD para detectar patrones inseguros antes de desplegar el código.
