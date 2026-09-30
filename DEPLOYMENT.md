# Production deployment

Domain: https://blog.noova.cloud

Server directory: `/home/ubuntu/personal-blog`

The blog runs as Compose project `noova-blog`. MySQL 8.0 uses its own
`noova-blog_mysql_data` volume. Images and Markdown records are stored in
the `blog` database. Both containers use Asia/Shanghai time.

```sh
cd /home/ubuntu/personal-blog
docker compose -f compose.yaml -f compose.caddy.yaml up -d --build
docker compose -f compose.yaml -f compose.caddy.yaml ps
docker compose -f compose.yaml -f compose.caddy.yaml logs --tail=80 app
```

The protected `.env` contains production credentials. Keep it out of Git.
The administration page is `/write`; the navigation `+` opens it.

## Existing Caddy

The existing `gogo-app-caddy-1` container serves `noova.cloud` and
`www.noova.cloud`. Its host configuration is:
`/home/ubuntu/gogo-app/deploy/production/Caddyfile`.

The blog app joins the external `gogo-app_app` network under alias
`blog-app`. Caddy proxies `blog.noova.cloud` to `blog-app:3000`.
The existing Compose file now mounts the host Caddyfile read-only, so
future container recreations preserve this route. Date-stamped backups
of the original Caddyfile and Compose file are beside them.

## Backups

Back up the blog database separately, including `media` image blobs.
Do not delete its volume when updating the app. For a private dump:

```sh
umask 077
docker compose -f compose.yaml -f compose.caddy.yaml exec -T db sh -c \
  'MYSQL_PWD="$MYSQL_PASSWORD" mysqldump -u "$MYSQL_USER" --single-transaction --hex-blob --no-tablespaces blog' \
  > blog-backup.sql
```
