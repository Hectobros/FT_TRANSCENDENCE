DOCKER_COMPOSE_FILE = docker-compose.yml

all: launch nestjs

launch:
	@-docker-compose -f ${DOCKER_COMPOSE_FILE} up --build -d

nestjs:
	npm install ; npm run start:dev

down:
	@-docker-compose -f ${DOCKER_COMPOSE_FILE} down

nuke:
	@-docker stop $(docker ps -qa)
	@-docker rmi $(docker ps -qa)
	@-docker system prune --force --all
	@-docker volume prune --force
	@-docker network prune --force

.PHONY: all launch nestjs down nuke