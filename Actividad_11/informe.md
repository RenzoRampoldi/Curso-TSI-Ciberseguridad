\# Actividad 11 - Análisis de red: Nmap y curl sobre API



\## 1. Introducción



En la presente actividad se realizó un análisis de red sobre el equipo local con el objetivo de identificar los servicios y puertos expuestos, reconocer la superficie de exposición del sistema y verificar el funcionamiento de la API desarrollada previamente en la Actividad 4.



Para realizar las pruebas se utilizaron las herramientas \*\*Nmap\*\* y \*\*curl\*\*, trabajando exclusivamente sobre `localhost`, es decir, sobre un sistema propio y autorizado.



El análisis permitió identificar los servicios disponibles en el equipo, comprobar específicamente la exposición de la API en el puerto 5000 y validar el funcionamiento de sus endpoints.



\---



\## 2. Objetivos



Los principales objetivos de la actividad fueron:



\- Ejecutar Nmap y comprender su funcionamiento básico.

\- Identificar los puertos y servicios abiertos en localhost.

\- Analizar específicamente el puerto 5000 utilizado por la API.

\- Probar los endpoints de la API mediante curl.

\- Relacionar los servicios encontrados con los activos correspondientes.

\- Documentar la superficie de exposición del sistema.

\- Identificar posibles riesgos asociados a los servicios expuestos.



\---



\## 3. Metodología



El análisis fue realizado dentro de un entorno local y controlado, utilizando únicamente recursos propios.



En primer lugar se levantó la API desarrollada en la Actividad 4, ejecutada mediante Flask en:



`http://127.0.0.1:5000`



Posteriormente se realizó un escaneo general del equipo con el siguiente comando:



`nmap -sV localhost`



Este comando permitió identificar los puertos TCP abiertos y obtener información sobre los servicios asociados.



Luego se realizó un análisis específico del puerto utilizado por la API:



`nmap -p 5000 -sV localhost`



Finalmente se utilizó `curl` para comprobar el funcionamiento de los endpoints `/health` y `/usuarios`.



Durante todo el procedimiento se respetaron criterios éticos y legales, realizando el escaneo únicamente sobre el equipo propio y sin efectuar pruebas sobre sistemas de terceros.



\---



\## 4. Resultados del escaneo general



El escaneo realizado sobre localhost permitió identificar los siguientes puertos TCP abiertos:



| Puerto | Servicio detectado | Descripción |

|---|---|---|

| 135/tcp | MSRPC | Servicio RPC de Microsoft Windows |

| 445/tcp | Microsoft-DS / SMB | Servicio relacionado con recursos compartidos de Windows |

| 2179/tcp | VMRDP | Servicio posiblemente asociado a virtualización |

| 3389/tcp | Microsoft Terminal Services / RDP | Servicio de escritorio remoto |

| 5000/tcp | API Flask | API desarrollada en la Actividad 4 |

| 5800/tcp | VNC-HTTP | Servicio web asociado a TightVNC |

| 5900/tcp | VNC | Servicio de acceso remoto TightVNC |

| 15000/tcp | No identificado | Servicio no identificado con certeza por Nmap |



Estos resultados muestran que el equipo posee diferentes servicios accesibles localmente, algunos de ellos relacionados con administración remota, compartición de recursos y servicios propios del sistema operativo.



\---



\## 5. Análisis del puerto 5000



El puerto 5000 fue analizado específicamente debido a que corresponde a la API desarrollada en la Actividad 4.



Se ejecutó:



`nmap -p 5000 -sV localhost`



Nmap detectó el puerto como abierto:



`5000/tcp open`



Si bien inicialmente lo identificó como un posible servicio UPnP, el análisis de la respuesta HTTP permitió observar que el servicio estaba siendo ejecutado mediante:



\- Werkzeug 3.1.8

\- Python 3.11.9

\- Flask



Esto permitió confirmar que el puerto 5000 correspondía efectivamente a la API analizada.



Las respuestas `404 Not Found` generadas durante algunas pruebas realizadas automáticamente por Nmap indicaron que el servidor se encontraba activo, aunque las rutas consultadas por la herramienta no existían dentro de la aplicación.



\---



\## 6. Pruebas de la API mediante curl



Se realizaron pruebas sobre los dos endpoints disponibles en la API.



\### Endpoint /health



Se utilizó:



`curl http://127.0.0.1:5000/health`



La API respondió correctamente, indicando que el servicio se encontraba funcionando.



Este endpoint permite comprobar el estado general de disponibilidad de la aplicación.



\### Endpoint /usuarios sin autenticación



Se realizó una solicitud al endpoint:



`curl http://127.0.0.1:5000/usuarios`



La API rechazó correctamente la solicitud debido a la ausencia del token de autenticación.



Esto permitió verificar que el endpoint se encuentra protegido.



\### Endpoint /usuarios con autenticación



Posteriormente se envió una solicitud incluyendo el encabezado:



`Authorization: Bearer <token>`



La solicitud fue aceptada correctamente y la API devolvió la información de los usuarios.



De esta forma se comprobó que el mecanismo de autenticación implementado funciona de acuerdo con lo esperado.



\---



\## 7. Relación entre servicios y activos



A partir de los resultados obtenidos se estableció la siguiente relación:



| Servicio | Activo asociado |

|---|---|

| MSRPC - Puerto 135 | Sistema operativo Windows |

| SMB - Puerto 445 | Sistema operativo Windows |

| VMRDP - Puerto 2179 | Servicio o plataforma de virtualización |

| RDP - Puerto 3389 | Equipo Windows / acceso remoto |

| Flask - Puerto 5000 | API desarrollada en la Actividad 4 |

| VNC-HTTP - Puerto 5800 | TightVNC |

| VNC - Puerto 5900 | TightVNC |

| Puerto 15000 | Servicio local pendiente de identificación |



La API constituye el activo principal analizado durante esta actividad, mientras que el resto de los servicios forman parte de la superficie de exposición del equipo local.



\---



\## 8. Superficie de exposición



El escaneo permitió observar que el equipo posee distintos puertos abiertos.



Cada puerto abierto representa un posible punto de acceso al sistema y, por lo tanto, forma parte de la superficie de exposición.



Entre los servicios identificados se destacan RDP, VNC y SMB, debido a que proporcionan mecanismos de acceso remoto o intercambio de información.



La presencia de estos servicios no implica necesariamente que exista una vulnerabilidad, pero aumenta la cantidad de puntos que deben ser correctamente administrados y protegidos.



También se verificó que la API se encuentra disponible en el puerto 5000 y que uno de sus endpoints posee un mecanismo de autenticación mediante Bearer Token.



\---



\## 9. Riesgos identificados



\### R-01 - Servicios de acceso remoto expuestos



Se identificaron servicios de acceso remoto como RDP y VNC.



\*\*Probabilidad:\*\* Media  

\*\*Impacto:\*\* Alto  

\*\*Nivel:\*\* Elevado  



Estos servicios podrían representar un riesgo si estuvieran expuestos innecesariamente a redes no autorizadas o si utilizaran credenciales débiles.



\*\*Tratamiento recomendado:\*\* restringir el acceso, utilizar autenticación segura y deshabilitar los servicios cuando no sean necesarios.



\### R-02 - Servicio SMB disponible



El puerto 445 se encuentra abierto y asociado a SMB.



\*\*Probabilidad:\*\* Media  

\*\*Impacto:\*\* Medio  

\*\*Nivel:\*\* Medio  



La exposición innecesaria de SMB podría permitir acceso a recursos compartidos o incrementar la superficie de ataque.



\*\*Tratamiento recomendado:\*\* limitar el acceso mediante firewall y mantener el servicio actualizado.



\### R-03 - Puerto 15000 sin identificar



Se detectó un servicio en el puerto 15000 que no pudo ser identificado con certeza.



\*\*Probabilidad:\*\* Baja  

\*\*Impacto:\*\* Medio  

\*\*Nivel:\*\* Medio  



Un servicio desconocido debe ser revisado para determinar su función y verificar si realmente es necesario mantenerlo activo.



\*\*Tratamiento recomendado:\*\* identificar el proceso asociado al puerto y cerrar el servicio si no resulta necesario.



\### R-04 - API disponible en puerto 5000



La API se encuentra accesible a través del puerto 5000.



\*\*Probabilidad:\*\* Baja  

\*\*Impacto:\*\* Medio  

\*\*Nivel:\*\* Medio  



La exposición de una API puede representar un riesgo si no existen controles adecuados de acceso.



En este caso se verificó que el endpoint `/usuarios` requiere autenticación mediante Bearer Token.



\*\*Tratamiento recomendado:\*\* mantener controles de autenticación, evitar exponer innecesariamente el servicio y proteger adecuadamente las variables de entorno y credenciales.



\---



\## 10. Medidas recomendadas



A partir del análisis realizado se recomienda:



\- Mantener abiertos únicamente los puertos y servicios realmente necesarios.

\- Restringir RDP y VNC a equipos y usuarios autorizados.

\- Revisar la necesidad del servicio SMB.

\- Identificar el proceso asociado al puerto 15000.

\- Utilizar reglas de firewall para limitar conexiones no autorizadas.

\- Mantener los servicios y aplicaciones actualizados.

\- Proteger adecuadamente las credenciales y variables de entorno utilizadas por la API.

\- Mantener autenticación en los endpoints que manejen información sensible.

\- Realizar escaneos periódicos para detectar cambios en la superficie de exposición.

\- Documentar nuevos servicios o puertos abiertos que aparezcan en el sistema.



\---



\## 11. Evidencias



Durante la actividad se generaron las siguientes evidencias:



\- `EVI-2026-10-05-01-nmap-general.txt`: resultado del escaneo general sobre localhost.

\- `EVI-2026-10-05-02-nmap-api.txt`: análisis específico del puerto 5000.

\- `EVI-2026-10-05-03-curl-api.txt`: pruebas realizadas sobre los endpoints de la API.

\- `EVI-2026-10-05-04-exposicion.png`: mapa de la superficie de exposición y relación entre servicios y activos.



\---



\## 12. Conclusión



La actividad permitió identificar y documentar la superficie de exposición del equipo local mediante Nmap y comprobar el funcionamiento de la API utilizando curl.



Se verificó que la API se encuentra activa en el puerto 5000 y que sus endpoints responden correctamente. También se comprobó que el endpoint `/usuarios` cuenta con un mecanismo de autenticación mediante Bearer Token.



El escaneo permitió detectar además distintos servicios del sistema operativo y herramientas de acceso remoto. Algunos de estos servicios, como RDP, VNC y SMB, deben mantenerse controlados debido a que pueden aumentar la superficie de exposición si se encuentran disponibles innecesariamente.



La actividad permitió comprender la importancia de conocer qué servicios están accesibles en un sistema, relacionarlos con los activos correspondientes y aplicar medidas orientadas a reducir los puntos de exposición.



Todos los procedimientos fueron realizados exclusivamente sobre sistemas propios y autorizados, respetando los criterios éticos y legales correspondientes.

