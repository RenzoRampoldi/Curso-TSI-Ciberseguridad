# Informe del Sistema 2 – Node.js + Express

## 1. Introducción

Como segundo componente del proyecto se desarrolló una aplicación web utilizando Node.js y Express. El objetivo principal de este sistema es complementar al Sistema 1 desarrollado en Python, incorporando mecanismos de autenticación segura, autenticación multifactor, API REST, auditoría, gestión de vulnerabilidades y comunicación entre ambos sistemas.

El Sistema 2 funciona de manera independiente, pero además consume servicios expuestos por el Sistema 1 mediante API REST, demostrando así la interacción entre dos aplicaciones desarrolladas con tecnologías diferentes.

---

## 2. Tecnologías utilizadas

Para el desarrollo del Sistema 2 se utilizaron las siguientes tecnologías:

* Node.js como entorno de ejecución.
* Express como framework web.
* SQLite como base de datos.
* bcrypt para el almacenamiento seguro de contraseñas mediante hash.
* express-session para el manejo de sesiones web.
* Speakeasy para la generación y validación de códigos TOTP.
* QRCode para la generación del código QR de MFA.
* jsonwebtoken para la creación y validación de JWT.
* Axios para la comunicación con el Sistema 1.
* dotenv para el manejo de variables de entorno.
* Crypto de Node.js para el cálculo de hashes SHA-256.
* Bootstrap para la interfaz web.
* npm audit para la gestión de vulnerabilidades.

---

## 3. Funcionamiento general

El Sistema 2 cuenta con una interfaz web mediante la cual los usuarios pueden registrarse e iniciar sesión.

El flujo principal de autenticación es:

```text
Registro
   ↓
Login
   ↓
Usuario + contraseña
   ↓
MFA
   ↓
Dashboard
```

Una vez autenticado, el usuario puede acceder a las funciones internas del sistema y realizar consultas hacia el Sistema 1.

---

## 4. Registro de usuarios

El sistema permite registrar nuevos usuarios mediante un formulario web.

Los datos principales almacenados son:

* identificador del usuario;
* nombre de usuario;
* hash de contraseña;
* secreto MFA;
* estado de MFA;
* estado activo.

La contraseña no se almacena en texto plano. Se utiliza bcrypt para generar un hash seguro antes de guardar el dato en la base de datos.

---

## 5. Login de usuario

El usuario ingresa su nombre y contraseña desde la interfaz web.

El sistema consulta la base de datos y compara la contraseña ingresada con el hash almacenado mediante bcrypt.

Si las credenciales son correctas, el proceso continúa con la autenticación multifactor.

---

## 6. Autenticación multifactor

El Sistema 2 utiliza MFA basado en TOTP.

Durante la configuración, el sistema genera un secreto y un código QR que puede ser escaneado mediante aplicaciones como Google Authenticator o Microsoft Authenticator.

Posteriormente, el usuario debe ingresar el código temporal de seis dígitos generado por la aplicación.

El acceso al sistema requiere por lo tanto:

```text
Factor 1:
Contraseña

Factor 2:
Código generado por Authenticator
```

Solo después de validar ambos factores se habilita el acceso al dashboard.

---

## 7. Dashboard protegido

El dashboard solo se encuentra disponible para usuarios autenticados.

El sistema utiliza sesiones para controlar el acceso. Si un usuario intenta acceder al dashboard sin haber completado correctamente el proceso de login y MFA, es redirigido nuevamente a la pantalla de autenticación.

---

## 8. API REST

El Sistema 2 también expone una API REST.

Se implementaron endpoints como:

```text
POST /api/login
```

para autenticación de API;

y:

```text
GET /api/perfil
```

para consultar información del usuario autenticado.

Los endpoints protegidos requieren un JWT válido.

---

## 9. Autenticación de API con MFA

Para obtener un JWT, el cliente debe enviar:

```text
usuario
contraseña
código MFA
```

El flujo es:

```text
Usuario + contraseña + MFA
        ↓
Validación
        ↓
Generación JWT
        ↓
Acceso a endpoints protegidos
```

Esto permite que la autenticación de la API también utilice múltiples factores.

---

## 10. Uso de JWT

Una vez autenticado correctamente, el sistema genera un JSON Web Token con tiempo de expiración.

El token debe enviarse posteriormente mediante el encabezado:

```text
Authorization: Bearer TOKEN
```

El sistema valida dicho token antes de permitir el acceso a los endpoints protegidos.

---

## 11. Auditoría

El Sistema 2 cuenta con una tabla específica para registrar eventos importantes.

Entre las acciones auditadas se encuentran:

```text
REGISTRO
LOGIN_WEB
MFA
LOGOUT
API_LOGIN
API_GET_PERFIL
CONSULTA_SISTEMA_1
```

Cada registro contiene:

* fecha;
* usuario;
* acción;
* resultado;
* dirección IP;
* hash anterior;
* hash actual.

Esto permite mantener un historial de las operaciones realizadas dentro del sistema.

---

## 12. Integridad de los registros

Los eventos de auditoría se encadenan mediante hashes SHA-256.

Cada nuevo registro utiliza el hash del evento anterior.

El funcionamiento puede representarse de la siguiente forma:

```text
Registro 1
hash_actual = AAA

        ↓

Registro 2
hash_anterior = AAA
hash_actual = BBB

        ↓

Registro 3
hash_anterior = BBB
hash_actual = CCC
```

De esta forma, cualquier modificación sobre un registro histórico afecta la cadena de hashes y puede ser detectada.

---

## 13. Comunicación con el Sistema 1

Una de las principales funcionalidades implementadas es la interacción entre ambos sistemas.

El Sistema 2 utiliza Axios para realizar solicitudes HTTP hacia la API REST del Sistema 1.

El proceso es:

```text
Sistema 2
   ↓
POST /api/login en Sistema 1
   ↓
Usuario + contraseña + MFA
   ↓
Sistema 1 devuelve JWT
   ↓
Sistema 2 utiliza el JWT
   ↓
GET /api/usuarios
   ↓
Sistema 1 devuelve JSON
   ↓
Sistema 2 muestra los resultados
```

De esta manera, el Sistema 2 no accede directamente a la base de datos del Sistema 1.

Toda la comunicación se realiza mediante servicios REST autenticados.

---

## 14. Auditoría de la interacción

La comunicación entre ambos sistemas también queda registrada.

En el Sistema 1 pueden registrarse eventos como:

```text
API_MFA OK
API_LOGIN OK
API_GET_USUARIOS OK
```

Mientras que en el Sistema 2 se registra:

```text
CONSULTA_SISTEMA_1 OK
```

Esto permite conocer cuándo se realizó una interacción entre sistemas y si la operación fue exitosa.

---

## 15. Gestión de vulnerabilidades

Para la gestión de vulnerabilidades del Sistema 2 se utiliza la herramienta incluida en npm:

```text
npm audit
```

Esta herramienta analiza las dependencias del proyecto y compara las versiones instaladas con una base de vulnerabilidades conocidas.

También puede utilizarse:

```text
npm outdated
```

para identificar dependencias que requieren actualización.

Esto permite incorporar un proceso básico de revisión y mantenimiento de seguridad.

---

## 16. Arquitectura resumida

```text
                SISTEMA 2
           Node.js + Express
                  │
       ┌──────────┴──────────┐
       │                     │
       ▼                     ▼
     UI WEB               API REST
       │                     │
 Login + MFA             MFA + JWT
       │                     │
       └──────────┬──────────┘
                  │
                  ▼
               SQLite
                  │
                  ▼
              Auditoría
                  │
                  ▼
             SHA-256
                  │
                  ▼
          Comunicación REST
                  │
                  ▼
             SISTEMA 1
           Python + Flask
```

---

## 17. Conclusión

El Sistema 2 constituye una aplicación web desarrollada en Node.js y Express que incorpora autenticación mediante usuario y contraseña, MFA, sesiones protegidas, API REST, JWT, base de datos y auditoría.

Además, implementa un mecanismo de integridad mediante hashes SHA-256 y herramientas de gestión de vulnerabilidades.

Finalmente, el sistema interactúa con el Sistema 1 mediante API REST autenticada, permitiendo demostrar la comunicación entre dos aplicaciones independientes desarrolladas con tecnologías diferentes.
