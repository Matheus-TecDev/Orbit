# Orbit AI API

Backend inicial do Orbit AI, criado em Python 3.12 com FastAPI, PostgreSQL, SQLAlchemy, Alembic, Pydantic, JWT e Passlib/Bcrypt.

## Recursos desta versao

- Healthcheck em `GET /health`
- Cadastro, login JWT e usuario autenticado
- Perfil do usuario e preferencias
- Recomendacoes mockadas por regras simples
- Likes, passes e matches reciprocos
- Chats e mensagens iniciais sem WebSocket
- Docker Compose com backend e PostgreSQL
- Migration inicial com Alembic
- Seed opcional com usuarios mockados

## Como rodar com Docker

1. Crie o arquivo local de ambiente:

```bash
cp .env.example .env
```

2. Edite o `SECRET_KEY` do `.env` para um valor forte em ambientes reais.

3. Suba os containers:

```bash
docker compose up --build -d
```

4. Rode as migrations:

```bash
docker compose exec backend alembic upgrade head
```

5. Verifique a API:

```bash
curl http://localhost:8000/health
```

Resposta esperada:

```json
{"status":"ok","database":"ok"}
```

A documentacao interativa fica em:

- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

## Seed opcional

Depois das migrations, execute:

```bash
docker compose exec backend python -m scripts.seed
```

Usuarios criados:

- `ana@orbitai.dev`
- `bruno@orbitai.dev`
- `carla@orbitai.dev`

Senha mockada para todos: `Orbit123!`

## Fluxo rapido de teste

Cadastro:

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@orbitai.dev","password":"Orbit123!","full_name":"Usuario Teste"}'
```

Login:

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@orbitai.dev","password":"Orbit123!"}'
```

Use o `access_token` retornado como Bearer Token:

```bash
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer SEU_TOKEN"
```

Criar perfil:

```bash
curl -X POST http://localhost:8000/profiles \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "display_name": "Teste",
    "bio": "Perfil inicial",
    "birth_date": "1998-05-10",
    "gender": "masculino",
    "city": "Fortaleza",
    "country": "Brasil",
    "intention": "relacionamento serio",
    "interests": ["tecnologia", "musica"]
  }'
```

Criar preferencias:

```bash
curl -X POST http://localhost:8000/preferences \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "min_age": 22,
    "max_age": 35,
    "city": "Fortaleza",
    "intention": "relacionamento serio",
    "interests": ["tecnologia", "cafes"]
  }'
```

## Endpoints

### Publicos

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`

### Privados

Todas as rotas abaixo exigem `Authorization: Bearer <token>`.

- `GET /auth/me`
- `GET /users/me`
- `PATCH /users/me`
- `POST /profiles`
- `GET /profiles/me`
- `PATCH /profiles/me`
- `POST /preferences`
- `GET /preferences/me`
- `PATCH /preferences/me`
- `GET /recommendations`
- `POST /matches/like/{profile_id}`
- `POST /matches/pass/{profile_id}`
- `GET /matches`
- `GET /chats`
- `GET /chats/{chat_id}/messages`
- `POST /chats/{chat_id}/messages`

## Desenvolvimento local sem Docker

Use Python 3.12.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Configure `DATABASE_URL` no `.env` para apontar para um PostgreSQL acessivel localmente e rode:

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

## Notas de seguranca

- Nenhuma credencial real deve ser versionada.
- `.env` fica ignorado pelo Git.
- `.env.example` usa valores locais de desenvolvimento e placeholders.
- Troque `SECRET_KEY` antes de qualquer deploy real.

## Fora do escopo nesta versao

- IA real
- WebSocket
- Upload real de fotos
- Pagamentos
- Frontend
