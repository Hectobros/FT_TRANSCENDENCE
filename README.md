# FT_TRANSCENDENCE

Fait avec Lgimenez, Ladawi, Dboyer et Adenhez

Le but de ce projet est de créer un site web pour jouer au pong.

Je me suis occupé de la partie Front.
## LAUNCH

```
 make
```

```
http://localhost:8000
```

## CAREFFUL

don't forget to set up a .env file at the root of the project with env variable:

```
POSTGRES_HOST=postgres
POSTGRES_USER=root
POSTGRES_PASSWORD=root
POSTGRES_DB=transcendencedb

CLIENT_ID=<your_42_API_UUID>
CLIENT_SECRET=<your_42_API_SECRET>

REFRESH_TOKEN_SECRET=refresh
ACCESS_TOKEN_SECRET=access

VUE_APP_IP=localhost
REDIRECT_URI=http://localhost/api/auth/callback
VUE_APP_CALLBACK=<URL_of_API_callback>

EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_FROM=<your_SENDGRID_API_sender_domain>
EMAIL_PASSWORD=<your_SENDGRID_API_password>
```

## EXPLORE DB

```
make db
```

## MODIFY DB

```
SELECT * FROM "user";

INSERT INTO channel(name) VALUES ('polo_chan');

UPDATE user_channel SET role= 'member' WHERE id = 130;

DELETE FROM channel WHERE unremovable = 'false';

```

Sujet: https://cdn.intra.42.fr/pdf/pdf/67622/fr.subject.pdf
