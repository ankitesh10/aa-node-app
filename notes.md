# Helpful comments

### how to sync file

```bash
rsync -azP --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude .env \
  ./ username@server_host:/<path_to_project>
```
