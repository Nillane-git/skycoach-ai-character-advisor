# Deploy — инструкция

Деплой полностью через **Git**. Никаких локальных бандлов и `scp` — сервер сам
тянет `main` и пересобирает контейнер. **Без dev-ветки** (тестовое задание):
изменения уходят сразу в `main`, и ты сразу видишь результат.

## TL;DR — деплой одной командой

```bash
./ship.sh "что изменили"
```

Эта команда: коммит → пуш ветки → **PR → merge в `main`** → сервер делает
`git pull` и пересборку/рестарт Docker → health-check живого URL.

**Live:** https://821723.cloud4box.ru/

> Для агента: чтобы задеплоить, выполни `./ship.sh "<сообщение>"` из чистого
> чекаута на `main`. Это всё. Результат окажется в `main` и на сайте.

## Что делает `ship.sh` (4 шага)

1. **Коммит** на ветку `deploy/<timestamp>`, `git push`.
2. **PR в `main` + merge** (`gh pr create` → `gh pr merge --merge`), затем
   локальный `git checkout main && git pull` — `main` обновлён.
3. **Сервер деплоит**: по SSH запускается `server-deploy.sh`, который делает
   `git reset --hard origin/main` и `docker compose up -d --build`
   (пересборка из исходников + рестарт; LE-сертификат в volume сохраняется).
4. **Health-check**: `curl` живого URL (ожидаем `LIVE 200`).

Переопределяемые переменные: `SKYCOACH_SERVER` (по умолч. `root@109.248.11.136`),
`SKYCOACH_URL` (по умолч. `https://821723.cloud4box.ru/`).

## Предпосылки

- Чистое рабочее дерево на ветке `main`.
- `gh` CLI авторизован (`GH_TOKEN=<token>` или `gh auth login`) с доступом к репо
  `Nillane-git/skycoach-ai-character-advisor` (нужно для PR/merge).
- SSH-доступ к серверу (ключ настроен для `root@109.248.11.136`).

## Архитектура на сервере

Изолированно в `/opt/skycoach-advisor` (git-чекаут репозитория), VPN-стек не
трогается (X-ray :2087, VPN-nginx :80 — на месте). Docker compose
(`deploy/docker-compose.yml`, проект `skycoach-advisor`):

```
Internet ──:443──> caddy ──reverse_proxy──> app (Next.js standalone, :3000)
                   авто Let's Encrypt (TLS-ALPN-01, :443 свободен)
```

- **app** — собирается из исходников многостадийным `deploy/Dockerfile`
  (`DEMO_MODE=0`: реальные персонажи идут в живой Raider.IO; без `ANTHROPIC_API_KEY`
  работает детерминированный fallback-движок).
- **caddy** — TLS на свободном :443, авто-выпуск/продление LE.
- Сборка идёт на сервере; включён swap (сборка `next build` не уходит в OOM на
  слабой VPS).

## Ручной режим (если без `ship.sh`)

```bash
# 1. Код в main (вариант с PR)
git checkout -b deploy/manual && git add -A && git commit -m "msg" && git push -u origin deploy/manual
gh pr create --base main --head deploy/manual --title "msg" --body "" && gh pr merge deploy/manual --merge --delete-branch

# 2. Деплой на сервере (одна команда)
ssh root@109.248.11.136 'bash /opt/skycoach-advisor/deploy/server-deploy.sh'
```

## Первичная настройка сервера (one-time, уже выполнено)

```bash
ssh root@109.248.11.136
git clone https://github.com/Nillane-git/skycoach-ai-character-advisor.git /opt/skycoach-advisor
cd /opt/skycoach-advisor/deploy && docker compose up -d --build
# swap (для сборки на слабой VPS) — уже добавлен и в /etc/fstab
```

## Проверка результата

- Открыть https://821723.cloud4box.ru/ — должен быть актуальный UI.
- `main` на GitHub = задеплоенный код (`ship.sh` обновляет `main` до деплоя).
- На сервере: `ssh root@109.248.11.136 'cd /opt/skycoach-advisor/deploy && docker compose ps'`.

## Заметки

- **Поддомен** `skycoach-advisor.821723.cloud4box.ru` — Caddy уже настроен на оба
  имени; активируется автоматически, как только в DNS-зоне cloud4box появится
  `A`-запись → `109.248.11.136` (добавляет владелец/Contell — зона провайдера).
- Кеш/лимиты приложения — in-memory, эфемерные (сбрасываются при рестарте).
