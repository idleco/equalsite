### Docker container commands
```
// start infra
docker compose up -d --build

// laravel commands
docker compose exec web php artisan migrate
// open shell
docker compose exec web bash

// install frontend package
pnpm add axios --filter web

```
