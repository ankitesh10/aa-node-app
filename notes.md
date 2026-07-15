# Helpful comments

### how to sync file

```bash
rsync -azP --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude .env \
  ./ username@server_host:/<path_to_project>
```

### how to re-deploy

```bash
docker compose up -d --build app

docker compose logs -f --tail=100 app  #check result
```
