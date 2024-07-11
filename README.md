# CLINITECH
Bienvenido a Clinitech, un proyecto desarrollado con Angular y Firebase para la gestión virtual de pacientes, especialistas y turnos.

Link:
https://clinica-efd25.web.app/home

Descripción

Este proyecto tiene como objetivo facilitar la gestión de citas médicas y la organización de especialistas dentro de una clínica virtual. Utiliza Angular como framework frontend y Firebase para el backend, lo que proporciona una plataforma escalable y en tiempo real para la administración de datos.

Los perfiles de usuarios son:

    Administrador
    Especialista
    Pacientes


Pantallas 

Home:
En esta sección, te dará la bienvenida la opcion de iniciar sesion o de registrarte.

![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/8d0d4ac5-71c9-4b7e-a58e-7b5bd6789ef6)


Login:
Permite ingresar al sistema teniendo un usuario y contraseña creados previamente en la seccion de registro, tambien cuenta con botones de acceso rapido (3 pacientes,2 especialista,1 administrador).
Los usuarios especialistas solo podran acceder al sistema si verificaron su email y su cuenta fue aprobada por un administrador
Los usuarios pacientes solo podran acceder al sistema si verificaron su email 
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/3a9b0bdd-95b2-4c94-9f0f-cce32ad08a3c)

Registro:
Podemos registrarnos como Especialistas o Pacientes.
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/71077969-ef3c-454b-985d-5f974da0bc86)

Registro Especialista:
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/89c5c2c2-de17-4fcc-a85b-076e427a507c)

Registro Paciente:
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/bd68483e-cd56-4bea-8ff6-0521dd67667f)

Solicitar turno:
Tanto el administrador como el usuario tendrán la opción de reservar un turno en cualquier especialidad con cualquier especialista.
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/d106136d-ed46-4106-95ce-af8ab075f05b)


 Turnos:
 En esta pantalla, podrás visualizar detalladamente:
 Especialistas: Los turnos asignados a los especialistas.
 Usuarios: Los turnos solicitados por los usuarios.
 Admin: Los turnos generales de la clínica.

![imagen](https://github.com/Abriluberti/CLINICA/assets/98592504/03bdfbc9-cc12-4055-908f-c9da3d65805b)
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/8d19deb0-73c9-418d-bab3-de43082047e9)
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/3cc7172c-c14d-4d00-be67-f55193b693a1)


Mi Perfil:
Cuenta con los datos del usuario, Nombre,Apellido,Imagenes y si sos paciente permite descargar su historia clinica por especialista.
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/d4f54fdc-bc0f-4039-a215-eba02f27b984)

Usuarios: 
Esta sesion es solo para los admins, donde podra descargar la historia clinica de los pacientes, registrar a otros admins y habilitar/deshabilitar especialistas
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/1ed16d7b-ae11-4cb7-afb3-933da3b8ffad)



Graficos:
Esta pantalla es exclusiva para el administrador y le va a permitir visualizar diferentes tipos de graficos  de la clinica.
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/50e5e732-c60f-49a5-a0a5-6ede9fbac4bd)

Pacientes:
Esta sesion es para los Especialistas y muestra a los pacientes atendidos al menos una vez
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/f1a2992e-a405-4afb-b0cc-4f875aadb2cb)


LOGO:
![imagen](https://github.com/Abriluberti/CLINICA/assets/98592504/2950d599-4aae-4436-99b2-cf17addc7af1)

PIPES:

Uppercase:Tranforma el texto a Mayuscula
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/066ea152-3635-4dbc-9ebe-bc9ef881e1ba)

LowerCase:Tranforma el texto a Minuscula
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/0bb3e79c-44d4-4a1a-bd49-ab52d7e52659)

Capitalize: Tranforma la primer letra en mayuscula
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/ee831f53-f148-4aa4-959e-6bc81589cf54)


DIRECTIVAS:
RandomBackground:Crea un fondo de color random cada vez que se entra al componente
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/5c223533-fbf3-4bef-b075-eaa02d011428)
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/b6fea5ea-fc55-44d9-ab06-8666f0dad1c7)

ChangeBackgroundHover: Cambia el color del boton al pasar el mouse
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/0c247786-51df-4ef6-9e54-d00210ed1440)

HoverTrace:Genera un rastro visual del cursor del mouse cuando pasa
![Sin título](https://github.com/Abriluberti/CLINICA/assets/98592504/d8276ecf-0020-49d9-9500-4cbc68a5bed2)

