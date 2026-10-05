\# Bitácora - Actividad 11: Análisis de red con Nmap y curl



\## Fecha

05/10/2026



\## Objetivo

Analizar la superficie de exposición del equipo local y verificar el funcionamiento de la API desarrollada en la Actividad 4 mediante el uso de Nmap y curl.



\## Escaneo general de localhost

Se ejecutó el siguiente comando:



`nmap -sV localhost`



El escaneo permitió identificar distintos puertos TCP abiertos y los servicios asociados.



\### Servicios identificados



\- Puerto 135/tcp: MSRPC - servicio RPC de Microsoft Windows.

\- Puerto 445/tcp: Microsoft-DS/SMB - servicio asociado a compartición de archivos y recursos de Windows.

\- Puerto 2179/tcp: servicio identificado por Nmap como VMRDP, posiblemente asociado a virtualización.

\- Puerto 3389/tcp: Microsoft Terminal Services / RDP - servicio de escritorio remoto.

\- Puerto 5000/tcp: servicio correspondiente a la API Flask de la Actividad 4. Nmap lo identificó inicialmente como `upnp?`, aunque en la respuesta HTTP se observó el servidor Werkzeug 3.1.8 sobre Python 3.11.9.

\- Puerto 5800/tcp: VNC-HTTP, asociado a TightVNC.

\- Puerto 5900/tcp: VNC, identificado como TightVNC con protocolo VNC 3.8.

\- Puerto 15000/tcp: servicio no identificado con certeza por Nmap.



\## Escaneo específico de la API

Se ejecutó:



`nmap -p 5000 -sV localhost`



El puerto 5000 se encontraba abierto y respondió correctamente a las pruebas de detección de servicio. Se identificó que la aplicación estaba ejecutándose mediante Flask/Werkzeug.



\## Pruebas con curl

Se realizaron pruebas sobre los endpoints de la API:



\- `/health`: respondió correctamente indicando que la API estaba funcionando.

\- `/usuarios` sin token: devolvió un error de autenticación, confirmando que el endpoint se encuentra protegido.

\- `/usuarios` con token Bearer válido: respondió correctamente devolviendo la información de usuarios.



\## Relación servicio-activo



| Puerto | Servicio | Activo asociado |

|---|---|---|

| 135 | MSRPC | Equipo Windows |

| 445 | SMB / Microsoft-DS | Equipo Windows |

| 2179 | VMRDP | Plataforma o servicio de virtualización |

| 3389 | RDP | Equipo Windows / acceso remoto |

| 5000 | Flask / Werkzeug | API Actividad 4 |

| 5800 | VNC-HTTP | TightVNC |

| 5900 | VNC | TightVNC |

| 15000 | No identificado | Servicio local pendiente de identificación |



\## Superficie de exposición

Se identificaron varios servicios accesibles en localhost. Cada puerto abierto representa un posible punto de exposición, por lo que es importante verificar que los servicios habilitados sean necesarios y que cuenten con las medidas de seguridad correspondientes.



Se presta especial atención a servicios de administración remota como RDP y VNC, así como al servicio SMB, debido a que una exposición innecesaria podría aumentar la superficie de ataque.



\## Evidencias



\- EVI-2026-10-05-01-nmap-general.txt

\- EVI-2026-10-05-02-nmap-api.txt

\- EVI-2026-10-05-03-curl-api.txt



\## Nota legal y ética

Los escaneos realizados durante esta actividad fueron ejecutados exclusivamente sobre sistemas propios y autorizados, utilizando localhost. No se realizaron pruebas sobre sistemas de terceros.

