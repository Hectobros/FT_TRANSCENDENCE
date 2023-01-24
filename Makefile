DOCKER_COMPOSE_FILE = docker-compose.yml
FRONT_FOLDER= ./front
LOCAL_IP := $(shell ipconfig getifaddr en1)
ENV_FILE = ./.env

all: init up

local:
	sed -i '' "s/localhost/$(LOCAL_IP)/g" $(ENV_FILE)

init:
	cp ${ENV_FILE} ${FRONT_FOLDER}/.env

up:
	@-docker-compose -f ${DOCKER_COMPOSE_FILE} up --build -d

down:
	@-docker-compose -f ${DOCKER_COMPOSE_FILE} down

stop:
	@-docker-compose -f ${DOCKER_COMPOSE_FILE} stop

restart:
	@-docker-compose -f ${DOCKER_COMPOSE_FILE} restart

nuke:
	@-docker-compose -f ${DOCKER_COMPOSE_FILE} down
	@-docker stop $$(docker ps -qa)
	@-docker rmi $$(docker images -qa)
	@-docker volume rm $$(docker volume ls -q)
	@-docker system prune --force --all
	@-docker volume prune --force
	@-docker network prune --force

db: 
	@-docker-compose exec postgres psql transcendencedb

reset_db:
	@-docker-compose -f ${DOCKER_COMPOSE_FILE} down
	@-docker volume rm $$(docker volume ls -q)

sgapi:
	@-cd sendgrid; bundle
	@-ruby sendgrid/api_info.rb

.PHONY: all init up down stop restart nuke db local sgapi reset_db