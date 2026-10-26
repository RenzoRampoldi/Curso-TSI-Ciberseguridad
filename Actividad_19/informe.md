Actividad 19 – Seguridad HTML y XSS: escape, cabeceras y Content Security Policy
Curso: RSI – Ciberseguridad Aplicada con IA
Fecha: 26/10/2026
Entorno: Laboratorio local con Python 3.11.9, Flask 3.1.3, Cygwin, navegador web y curl
Clasificación: Actividad académica – laboratorio controlado

1. Resumen ejecutivo
Se realizó una práctica de seguridad web orientada a identificar y corregir una vulnerabilidad de Cross-Site Scripting (XSS) reflejado. Para ello se desarrolló una aplicación sencilla en Flask que mostraba en una página HTML el valor de un parámetro nombre recibido por la URL.

En la primera versión, el parámetro se insertaba sin codificación de salida. Al enviar la cadena de prueba <script>alert(1)</script>, el navegador ejecutó JavaScript y mostró una ventana emergente con el número 1. El resultado confirmó la presencia de XSS reflejado en el endpoint de laboratorio.

Posteriormente se aplicó html.escape() al valor recibido y se agregaron las cabeceras Content-Security-Policy: default-src 'self' y X-Content-Type-Options: nosniff. Al repetir el ensayo, el código se mostró como texto, sin ejecutarse. La respuesta HTTP se verificó con curl -i y devolvió 200 OK junto con las dos cabeceras configuradas.

Resultado: se demostró y corrigió el comportamiento vulnerable para el caso ensayado. La prueba no representa una auditoría de seguridad completa ni garantiza ausencia de otras vulnerabilidades.

2. Objetivos
- Crear un endpoint HTML que refleje una entrada del usuario.
- Demostrar, en un entorno local, la ejecución de un payload XSS reflejado.
- Aplicar escape de salida mediante html.escape().
- Configurar cabeceras de seguridad HTTP, incluida una política CSP.
- Verificar los resultados y preservar evidencias técnicas.

3. Marco de referencia y conceptos
La práctica toma como referencia las recomendaciones de OWASP sobre prevención de XSS y el uso de cabeceras de seguridad HTTP. La consigna también propone, como encuadre institucional simulado, la normativa del BCU, AGESIC y la protección de datos personales en Uruguay. No se efectuó una evaluación de cumplimiento regulatorio de una institución real.

El XSS ocurre cuando datos controlados por un atacante son interpretados por el navegador como código ejecutable dentro de una página web. Entre las modalidades se encuentran:
- Reflejado: el valor malicioso llega en una solicitud, por ejemplo en un parámetro de URL, y se incorpora a la respuesta.
- Almacenado: el contenido malicioso se guarda y posteriormente se muestra a otros usuarios.
- Basado en DOM: código del lado del cliente introduce datos no confiables en un contexto de ejecución inseguro.
Según el contexto y las protecciones de la aplicación, un XSS puede permitir manipular el contenido visible, actuar con permisos del usuario o acceder a información que el navegador tenga disponible para scripts. La prueba realizada utilizó únicamente una alerta inocua, sin extracción de datos.

4. Alcance, entorno y metodología
Alcance: endpoint local http://127.0.0.1:5000/ con el parámetro de consulta nombre; no se realizaron pruebas sobre sitios externos ni sistemas productivos.

Herramientas: Python 3.11.9, Flask 3.1.3, Cygwin, navegador web y curl.

Metodología: construcción de una versión vulnerable; ejecución de un payload controlado; modificación del código para codificar la salida; incorporación de cabeceras; repetición de la prueba y verificación de la respuesta HTTP mediante curl.

5. Desarrollo y resultados
5.1. Versión vulnerable
Se creó la ruta / que obtiene nombre mediante request.args.get y lo incorpora directamente en una respuesta HTML:
nombre = request.args.get("nombre", "Invitado")
return f"<p>Hola, {nombre}</p>"
Al no aplicar codificación de salida, el contenido enviado podía interpretarse como etiquetas HTML y JavaScript.

5.2. Demostración XSS
Payload utilizado:
<script>alert(1)</script>
Se introdujo el payload como valor del parámetro nombre, en el entorno local. Resultado observado: el navegador mostró un cuadro de diálogo con el número 1, confirmando la ejecución del script. Este ensayo constituye una demostración de XSS reflejado.

Evidencia: evidencias/EVI-2026-10-26-01-xss-vulnerable.png.

5.3. Corrección mediante escape de salida
Se incorporó el módulo html de Python y se escapó el parámetro antes de incluirlo en la respuesta:
import html
nombre = request.args.get("nombre", "Invitado")
nombre_seguro = html.escape(nombre)
Resultado observado: al repetir el mismo payload, la página mostró literalmente <script>alert(1)</script> sin abrir una alerta. El escape evitó que los caracteres especiales fueran tratados como marcado HTML en ese contexto.

Evidencia: evidencias/EVI-2026-10-26-02-xss-corregido.png.

5.4. Cabeceras de seguridad
Se añadieron a la respuesta:
respuesta.headers["Content-Security-Policy"] = "default-src 'self'"
respuesta.headers["X-Content-Type-Options"] = "nosniff"
La CSP restringe por defecto el origen de los recursos y, sin permisos adicionales para scripts en línea, añade una defensa frente a su ejecución. X-Content-Type-Options: nosniff indica al navegador que no debe inferir tipos MIME para determinados recursos. Estas medidas son complementarias y no sustituyen el escape adecuado para cada contexto de salida.
5.5. Verificación con curl
Se ejecutó:
curl -i "http://127.0.0.1:5000/?nombre=Juan"
La salida mostró, entre otros datos:
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
La presencia de ambas cabeceras y la respuesta 200 OK se verificaron en la terminal. Se guardó la respuesta HTTP en un archivo de evidencia.

Evidencias: evidencias/EVI-2026-10-26-03-cabeceras.txt y evidencias/EVI-2026-10-26-04-codigo-final.py.

6. Hallazgos, riesgos y controles
ID	Hallazgo / riesgo	Impacto potencial	Medida aplicada	Estado en el laboratorio
H-01	Inserción de datos no confiables directamente en HTML; XSS reflejado	Ejecución de JavaScript en el navegador de quien visite una URL manipulada	Escape de salida con html.escape()	Corregido para el caso probado
H-02	Ausencia inicial de una política restrictiva de recursos	Menor defensa en profundidad frente a inyecciones	Content-Security-Policy: default-src 'self'	Cabecera verificada
H-03	Ausencia inicial de X-Content-Type-Options	Riesgos vinculados a interpretación incorrecta de tipos de contenido	X-Content-Type-Options: nosniff	Cabecera verificada


Limitación: no se efectuaron pruebas exhaustivas para determinar la probabilidad, criticidad regulatoria o explotación de otras rutas y contextos HTML.

7. Registro de evidencias
Archivo	Contenido
EVI-2026-10-26-01-xss-vulnerable.png	Captura de ejecución del payload y alerta del navegador
EVI-2026-10-26-02-xss-corregido.png	Captura del payload mostrado como texto, sin ejecución
EVI-2026-10-26-03-cabeceras.txt	Respuesta de curl -i con las cabeceras de seguridad
EVI-2026-10-26-04-codigo-final.py	Copia del endpoint Flask corregido


Las evidencias se encuentran en la carpeta evidencias/ y su desarrollo se registra también en bitacora.md.

8. Incidentes y tratamiento
Se produjo una ejecución intencional de código de prueba en laboratorio, no un incidente confirmado en un sistema productivo. No se constató acceso a información real, extracción de datos ni afectación de terceros. No corresponde afirmar que existió una notificación real al BCU o a AGESIC.

9. Recomendaciones y próximos pasos
- Mantener el escape o la codificación de salida adecuados para cada contexto (HTML, atributos, JavaScript o URL).
- Priorizar plantillas que escapen automáticamente los datos e impedir inserciones HTML inseguras.
- Revisar y ajustar la CSP según los recursos legítimos de la aplicación; considerar directivas más específicas en desarrollos reales.
- Mantener cabeceras HTTP de seguridad y comprobarlas en pruebas de regresión.
- Validar entradas como control adicional, sin considerarlo sustituto del escape de salida.
- Evitar ejecutar el servidor de desarrollo de Flask como servidor de producción.

10. Conclusión
La actividad permitió observar de forma práctica cómo un parámetro de URL, al insertarse sin escape en una página HTML, puede convertirse en un vector de XSS reflejado. La ejecución inicial de alert(1) evidenció el comportamiento vulnerable. Tras implementar html.escape() y añadir las cabeceras de seguridad, el mismo payload se mostró como texto y las cabeceras se verificaron con curl.

Los objetivos técnicos de la práctica quedaron cumplidos dentro del alcance local definido. Se destaca la importancia de no confiar en la entrada del usuario y de aplicar varias capas de protección al desarrollar aplicaciones web.

11. Reflexión sobre el uso de IA
El contenido de una entrada puede parecer inocuo y aun así contener caracteres o secuencias capaces de alterar la estructura de una página. Por este motivo, incluso los datos provenientes de bases de datos, APIs o registros previamente almacenados deben tratarse como no confiables al mostrarlos. La codificación debe corresponder al contexto donde se insertan.

La IA se utilizó como asistencia para comprender el funcionamiento de XSS, preparar el código y organizar la documentación. La verificación de los resultados se realizó mediante pruebas observables en el navegador y con curl.