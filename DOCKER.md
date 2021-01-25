# Deploying the Server With Docker!
## Prerequisites
Before getting started please have the following:
- Your assets/config folder
- [Docker](https://docker.com/)
- [You have authenticated yourself to use the Github Docker Package Registry](https://docs.github.com/en/packages/guides/configuring-docker-for-use-with-github-packages)

You may also want to have
- Your environment variables file (if you choose to set any)
- [docker-compose](https://docs.docker.com/compose/)

## Docker CLI
To spin up a container using the Docker CLI just run the following command
```bash
$ docker run \
    --name ComplianceTweaks \
    --restart always \
    --publish 3000:3000 \
    --env-file "$(pwd)/.env" \
    --volume "$(pwd)/assets:/usr/src/app/assets" \
    docker.pkg.github.com/compliance-resource-pack/compliancetweaksserver/server:latest
```

## docker-compose
If you would like to use docker compose, here is a great example
```yml
version: "3"

services:
  compliance-server:
    image: "docker.pkg.github.com/compliance-resource-pack/compliancetweaksserver/server:latest"
    container_name: ComplianceTweaks
    restart: always
    ports:
      - "3000:3000"
    env_file:
      .env
    volumes:
      - "./assets:/usr/src/app/assets"
```

### Whats with the docker-compose.yml file in the repository?
That file is used for local testing, it works if the whole repo is installed on your machine but for most users the docker-compose.yml file stated above should work just fine!