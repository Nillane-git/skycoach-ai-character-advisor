# Deploy — SkyCoach AI Character Advisor

Containerised deployment that runs **fully isolated** next to an existing VPN
(X-ray) stack on the same host, without touching it.

## Live

- **https://821723.cloud4box.ru/** — port **443** (free on the host; X-ray is on
  2087, the VPN's nginx on 80).

## Topology

```
Internet ──:443──> caddy (skycoach_caddy)  ── reverse_proxy ──> app (skycoach_app, :3000)
                   auto Let's Encrypt (TLS-ALPN-01)             Next.js standalone server
```

Own bridge network `skycoach_net`, own published port `:443` only. Lives in an
isolated dir on the server (`/opt/skycoach-advisor`).

### Why Caddy instead of nginx

The host's **port 80 is already taken by the VPN's own nginx** container, so the
ACME **HTTP-01** challenge is unavailable and a manual nginx + acme.sh setup
would need brittle stop/renew/start cycles for every renewal. Caddy obtains and
**auto-renews** the certificate over **TLS-ALPN-01 on the free :443** with zero
scripting. Swap to nginx by replacing the `caddy` service and supplying a cert.

## Runtime config

- `DEMO_MODE=0` — real characters hit **live Raider.IO**; `/us/demo/skycoach`
  still serves the bundled fixture.
- No `ANTHROPIC_API_KEY` — the **deterministic fallback** analyzer is used (the
  app runs with zero secrets). Add the key to `app.environment` to enable
  Claude-authored text.

## Build & deploy

Built on a normal host (not the 1.8 GB VPS — `next build` would OOM there); the
image itself is copy-only.

```bash
# 1. Build the standalone bundle locally
deploy/build-bundle.sh            # -> deploy/_bundle/

# 2. Copy to the server
rsync -a deploy/_bundle/ root@109.248.11.136:/opt/skycoach-advisor/

# 3. Bring it up (Docker already installed on the host)
ssh root@109.248.11.136 'cd /opt/skycoach-advisor && docker compose up -d --build'
```

Caddy fetches the LE cert on first boot (a few seconds). Certs persist in the
`caddy_data` volume across restarts.

## Ops

```bash
docker compose ps                 # status
docker compose logs -f caddy      # watch cert issuance
docker compose logs -f app        # app logs
docker compose down               # stop (VPN stack unaffected)
```

Renewal is automatic (Caddy). Nothing to cron.
