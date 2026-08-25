Informe – Sistema 1: Aplicación web segura en Python
1. Introducción

Como parte de la actividad se desarrolló un primer sistema web utilizando Python, cuyo objetivo principal es implementar mecanismos básicos de autenticación, protección de APIs, auditoría y seguridad de acceso a la información.

El sistema fue desarrollado utilizando Flask como framework web y SQLite como base de datos. Cuenta con una interfaz web para la interacción con los usuarios y, paralelamente, expone una API REST que permite el acceso controlado a determinados recursos.

La solución incorpora autenticación mediante usuario y contraseña, segundo factor de autenticación mediante MFA, utilización de JWT para proteger la API y un sistema de auditoría que registra las principales acciones realizadas.

2. Tecnologías utilizadas

Para el desarrollo del sistema se utilizaron las siguientes tecnologías:

Tecnología	Utilización
Python	Lenguaje principal
Flask	Framework web
Flask-SQLAlchemy	Acceso y gestión de la base de datos
SQLite	Base de datos
Flask-Login	Manejo de sesiones web
Werkzeug	Hash seguro de contraseñas
PyOTP	Generación y validación de códigos MFA
QRCode	Generación del QR para configurar MFA
Flask-JWT-Extended	Creación y validación de JWT
HTML	Interfaz de usuario
Bootstrap	Diseño de la interfaz
SHA-256	Integridad de registros de auditoría

3. Arquitectura general

El Sistema 1 dispone de dos formas principales de acceso:

                        SISTEMA 1
                     Python + Flask
                           │
               ┌───────────┴───────────┐
               │                       │
               ▼                       ▼
          INTERFAZ WEB              API REST
               │                       │
        Login + contraseña        Usuario + contraseña
               │                       │
              MFA                     MFA
               │                       │
          Sesión Flask                JWT
               │                       │
               └───────────┬───────────┘
                           │
                           ▼
                     BASE DE DATOS
                           │
                           ▼
                       AUDITORÍA

La interfaz web está orientada al acceso directo del usuario, mientras que la API REST será utilizada posteriormente para permitir la comunicación con el Sistema 2.

4. Registro de usuarios

El sistema permite crear usuarios mediante una interfaz web.

Cada usuario posee información como:

ID
Username
Password hash
Estado activo
Secreto MFA
Estado de MFA

Se implementó además una validación para impedir la creación de dos usuarios con el mismo nombre.

5. Protección de contraseñas

Una de las medidas de seguridad implementadas consiste en no almacenar las contraseñas directamente en la base de datos.

Cuando el usuario selecciona una contraseña, se genera un hash utilizando las funciones de seguridad proporcionadas por Werkzeug.

Por ejemplo, el usuario puede ingresar:

Prueba123!

pero la base de datos almacena un valor similar a:

scrypt:32768:8:1$...

De esta manera, la contraseña original no queda almacenada en texto plano.

6. Login de usuario

Se implementó autenticación mediante:

Usuario
+
Contraseña

Cuando las credenciales son incorrectas, el sistema rechaza el acceso.

Cuando son correctas, el usuario debe continuar con un segundo factor de autenticación.

El flujo implementado es:

Usuario + contraseña
        ↓
Validación
        ↓
       MFA
        ↓
Dashboard
7. Autenticación multifactor – MFA

Para aumentar la seguridad del acceso se implementó autenticación multifactor mediante TOTP.

El sistema genera un código QR que puede ser escaneado mediante aplicaciones como:

Google Authenticator
Microsoft Authenticator
Authy

El usuario debe ingresar posteriormente el código temporal de seis dígitos generado por la aplicación.

Por lo tanto, para ingresar no alcanza solamente con conocer la contraseña.

Se requieren dos factores:

Factor 1:
Algo que el usuario conoce
→ contraseña

Factor 2:
Algo que el usuario posee
→ aplicación Authenticator

En la versión utilizada para la demostración se configuró el sistema para mostrar el QR durante el flujo de login. En una implementación productiva, el QR normalmente se mostraría únicamente durante la configuración inicial del MFA, ya que contiene el secreto TOTP.

8. Protección de páginas

El dashboard del sistema fue protegido utilizando Flask-Login.

Esto implica que un usuario que no se encuentre correctamente autenticado no puede acceder directamente a:

/dashboard

Si intenta hacerlo, es redirigido al login.

9. API REST

Además de la interfaz web, el Sistema 1 expone una API REST.

Se implementaron, entre otros, los siguientes endpoints:

POST /api/login

Permite autenticarse y obtener un token JWT.

GET /api/usuarios

Devuelve la lista de usuarios.

GET /api/usuarios/<id>

Devuelve la información correspondiente a un usuario particular.

Los endpoints con información de usuarios se encuentran protegidos.

10. MFA en la API

Para obtener un JWT mediante la API no alcanza con enviar usuario y contraseña.

La solicitud requiere:

{
    "username": "renzo",
    "password": "contraseña",
    "codigo_mfa": "123456"
}

El servidor verifica:

Usuario
   ↓
Contraseña
   ↓
Código MFA
   ↓
JWT

Si cualquiera de los factores es incorrecto, el token no es generado.

11. Autenticación mediante JWT

Una vez completada correctamente la autenticación de API, el sistema genera un JSON Web Token.

Ese JWT debe ser enviado posteriormente en las solicitudes:

Authorization: Bearer TOKEN

Sin el token, los endpoints protegidos rechazan la petición.

Por lo tanto:

SIN JWT
   ↓
Acceso denegado

CON JWT válido
   ↓
Acceso permitido

Esto será fundamental cuando implementemos el Sistema 2, porque permitirá que ambos sistemas interactúen de manera autenticada.

12. Seguridad de información expuesta

La API únicamente devuelve información necesaria.

Por ejemplo:

{
    "id": 1,
    "username": "renzo",
    "activo": true,
    "mfa_activado": true
}

No se exponen datos sensibles como:

password_hash
mfa_secret
13. Auditoría

Se implementó una tabla específica para registrar las operaciones relevantes realizadas dentro del sistema.

Entre los eventos registrados se encuentran:

LOGIN_WEB OK
LOGIN_WEB FALLIDO

MFA OK
MFA FALLIDO

LOGOUT

API_LOGIN OK
API_LOGIN FALLIDO

API_MFA OK
API_MFA FALLIDO

API_GET_USUARIOS
API_GET_USUARIO

Cada registro contiene información como:

ID
Fecha
Usuario
Acción
Resultado
Dirección IP

Por ejemplo:

renzo LOGIN_WEB OK 127.0.0.1
renzo MFA OK 127.0.0.1
renzo LOGOUT OK 127.0.0.1

Esto permite conocer quién realizó una determinada acción y cuál fue su resultado.

14. Integridad de la auditoría

Para aumentar la confiabilidad de los registros se implementó un mecanismo de hashes encadenados mediante SHA-256.

Cada registro contiene:

hash_anterior
hash_actual

El funcionamiento es similar al siguiente:

REGISTRO 1
hash_anterior = 0
hash_actual = AAA

        ↓

REGISTRO 2
hash_anterior = AAA
hash_actual = BBB

        ↓

REGISTRO 3
hash_anterior = BBB
hash_actual = CCC

De esta manera, cada evento queda relacionado criptográficamente con el anterior.

Si se modifica un registro histórico, los hashes dejan de coincidir y el sistema puede detectar que la cadena fue alterada.

Se creó para ello una función:

verificar_integridad_auditoria()

que devuelve:

True

cuando los registros mantienen su integridad.

Importante para explicarlo en clase: este mecanismo permite detectar alteraciones. Para hablar de inmutabilidad estricta a nivel de base de datos sería necesario complementarlo con restricciones de permisos, triggers o almacenamiento append-only que impida físicamente UPDATE y DELETE.

15. Gestión de vulnerabilidades

Como parte de las buenas prácticas del proyecto se prevé utilizar:

pip-audit

para analizar las dependencias de Python y comprobar si contienen vulnerabilidades conocidas.

También puede utilizarse:

pip list --outdated

para detectar dependencias desactualizadas.

Si todavía no realizaste esta parte, presentala como el último punto a completar del Sistema 1 antes de cerrar la entrega.

16. Conclusión

El Sistema 1 constituye una aplicación web desarrollada en Python que incorpora diferentes capas de seguridad.

Se implementaron mecanismos de autenticación tradicional, MFA, protección de sesiones, API REST protegida mediante JWT y auditoría de las principales operaciones.

Además, los eventos de auditoría pueden encadenarse mediante hashes SHA-256 para comprobar su integridad.

El sistema queda preparado para posteriormente interactuar con un segundo sistema mediante API REST autenticada.