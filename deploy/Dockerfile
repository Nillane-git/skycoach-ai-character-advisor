# Runtime-only image: copies a PREBUILT Next.js standalone server (built on a
# beefier host) so the image build does no compilation and needs almost no RAM —
# important on the small (1.8 GB) VPS this is deployed to.
#
# Expected build context layout (assembled by deploy/build-bundle.sh):
#   ./app/      -> contents of .next/standalone  (server.js, node_modules, .next)
#   ./static/   -> contents of .next/static
#   ./public/   -> contents of public
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY app/ ./
COPY static/ ./.next/static/
COPY public/ ./public/

# DEMO_MODE=0 -> real characters hit live Raider.IO; the /us/demo/skycoach
# fixture still works. No ANTHROPIC_API_KEY -> deterministic fallback analyzer.
ENV PORT=3000 HOSTNAME=0.0.0.0 DEMO_MODE=0

EXPOSE 3000
CMD ["node", "server.js"]
