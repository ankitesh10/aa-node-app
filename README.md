# aa-bot API

Backend for the AI chat assistant on Ankitesh Arora's personal website. It answers recruiter questions using a curated knowledge base and streams responses to the website.

## Stack

- TypeScript, Express, and Vercel AI SDK
- OpenAI for chat and embeddings
- PostgreSQL + pgvector, managed with Drizzle

## Run locally

Requirements: Node.js 22+, pnpm, a PostgreSQL database with `pgvector`, and an OpenAI API key.

```bash
pnpm install --frozen-lockfile
```

Create `.env`:

```dotenv
APP_PORT=3000
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
OPENAI_API_KEY=your_openai_api_key
ABUSE_HASH_SECRET=a_long_random_secret
LMNR_PROJECT_API_KEY=your_laminar_key # optional tracing
```

Enable pgvector and apply migrations:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

```bash
pnpm db:migrate
pnpm dev
```

To add knowledge-base content:

```bash
pnpm tsx src/scripts/add_resource_from_txt.ts < path/to/content.txt
```

## Endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Check API and database status |
| `GET /create_chat_session` | Create a chat session |
| `POST /bot` | Stream an AI SDK chat response |

The API limits session creation and bot requests per IP address. It stores only an HMAC hash of the IP for those counters.

## Development

```bash
pnpm build
pnpm eval
docker compose up --build
```

Keep API keys and personal knowledge-base content out of version control.

## License

[MIT](LICENSE)
