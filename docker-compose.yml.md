# DOCKER COMPOSE
If you would like to use this server with docker compose here is an example docker-compose.yml file

```yml
version: "3"

services:
  compliance-server:
    image: "docker.pkg.github.com/compliance-resource-pack/compliancetweaksserver/server:latest"
    container_name: ComplianceTweaks
    ports:
      - "3000:3000"
    env_file:
      .env
    volumes:
      - "./assets:/usr/src/app/assets"
```

### Whats with the docker-compose.yml file in the repository
That file is used for local testing, it works if the whole repo is installed on your machine but for most users the following yml should work just fine!
