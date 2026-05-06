# Gazella - Article Service #

Este repositorio es el servicio de tarea de Gazella

## Stack Tecnologico ##

* NodeJS
* TypeScript
* Express
* Swagger JSDoc

## Ejecutando el proyecto ##

Si va modificar el código instale las dependencias:

```bash
npm install
```

Cree un archivo .env como el siguiente:

```text
PORT=[number]
ISSUER_URL=[Endpoint oidc de gazella]
DATA_SERVICE_URL=[[nombre del servicio de datos]:[puerto]]
```

Una vez creado su archivo .env, levante el contenedor

```bash
docker compose up --build
```

Si el contenedor se ejecuta correctamente puede ir http://localhost/[puerto]/docs para leer la documentación Open API del servicio
