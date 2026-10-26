
# Actividad 19 - Seguridad HTML y XSS

**Fecha:** 26/10/2026  
**Curso:** RSI - Ciberseguridad Aplicada con IA

## Objetivo

Demostrar una vulnerabilidad XSS reflejada en una aplicación Flask y aplicar medidas de protección mediante escape de salida y cabeceras HTTP.

## 1. Aplicación vulnerable

Se desarrolló una aplicación Flask que recibe el parámetro `nombre` mediante una URL.

El valor ingresado se incorporaba directamente al HTML, sin ningún mecanismo de escape.

Código vulnerable:

```python
nombre = request.args.get("nombre", "Invitado")
return f"<p>Hola, {nombre}</p>"
```

## 2. Prueba XSS

Se utilizó el siguiente payload:

```html
<script>alert(1)</script>
```

**Resultado:** el navegador ejecutó JavaScript y mostró una ventana emergente con el número 1.

Se confirmó una vulnerabilidad XSS reflejada.

**Evidencia:** EVI-2026-10-26-01-xss-vulnerable.png

## 3. Corrección implementada

Se utilizó la función `html.escape()` para convertir los caracteres especiales en entidades HTML.

```python
nombre_seguro = html.escape(nombre)
```

**Resultado:** el navegador mostró el payload como texto, sin ejecutarlo.

**Evidencia:** EVI-2026-10-26-02-xss-corregido.png

## 4. Cabeceras de seguridad

Se configuraron las siguientes cabeceras:

- Content-Security-Policy: default-src 'self'
- X-Content-Type-Options: nosniff

Se verificaron mediante:

```bash
curl -i "http://127.0.0.1:5000/?nombre=Juan"
```

**Resultado:** HTTP 200 OK y ambas cabeceras presentes.

**Evidencia:** EVI-2026-10-26-03-cabeceras.txt

## 5. Código final

Se guardó una copia de la aplicación corregida.

**Evidencia:** EVI-2026-10-26-04-codigo-final.py

## 6. Conclusión

La prueba permitió demostrar cómo una entrada de usuario no escapada puede provocar la ejecución de JavaScript en el navegador.

La aplicación fue corregida utilizando escape de salida HTML y cabeceras de seguridad HTTP.

La prueba posterior confirmó que el payload utilizado ya no se ejecutaba.
