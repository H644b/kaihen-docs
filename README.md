# kaiHEN developer documentation

Public documentation and a read-only MCP endpoint for kaiHEN Switch 2 application development.

- Site: <https://kaihen.timsfun.com>
- MCP: <https://kaihen.timsfun.com/mcp>
- Connection guide: <https://kaihen.timsfun.com/docs/mcp/>
- Source: <https://github.com/H644b/kaihen-docs>

## Architecture

Astro builds static HTML for sixteen guides, the documentation home and the 404 page. Markdown is rendered with Marked and Shiki. Mermaid loads only on pages containing diagrams. Navigation, local search, copying and theme selection use browser TypeScript without a client application framework.

A Cloudflare Worker serves the MCP endpoint, JSON documentation API and health endpoint alongside the static assets. The official MCP SDK and Cloudflare Agents handler expose `search`, `fetch`, `list_docs` and `get_sources`, plus sixteen Markdown resources. MCP and browser search share the same generated corpus and section IDs. The service requires no database, authentication secrets or console connection.

## Local development

Use a current Node version supported by the locked Astro and Wrangler versions. This build was validated with Node 26.11.1.

```sh
npm ci
npm run build
npm run preview
```

The Worker preview runs at `http://127.0.0.1:8788`. `npm run dev` starts Astro for page styling; use the Worker preview for MCP and JSON API checks. Rebuild after changing content before testing the Worker preview.

```sh
npm test
npm run check:build
node scripts/check-http.mjs
node scripts/check-mcp.mjs
```

The checks cover section ranking, document ID resolution, generated internal links, the public archive, HTTP error behavior, MCP discovery and an SDK client round trip. Browser evidence is under `.impeccable/review/` and `evidence/`; it covers desktop, mobile, dark appearance, search, copying, navigation, diagrams and the browser connection check.

## Updating documentation

The research inputs are included in `content/research/`, with blank record templates in `content/templates/`. The repository builds independently of the original research workspace. `scripts/prepare-content.mjs` imports thirteen research guides and adds the three site-authored guides from `content/`. The historical research index is replaced by the site navigation.

Edit the research guides in `content/research/` or `content/quickstart.md`, `content/api-reference.md` and `content/mcp.md`, then run `npm run build`. Changes to guide names, order or public slugs belong in `scripts/prepare-content.mjs` and `src/lib/content.ts`. Do not edit `src/generated/docs.json`, `dist/` or the generated Markdown and search files in `public/` by hand. When changing the evidence baseline, update `content/research/source-register.json` and `verification.json` alongside the affected claims.

The generator emits:

- A corpus with stable section IDs, canonical URLs, source references and a checksum.
- Browser search data and raw Markdown at `/docs/{slug}.md`.
- `/llms.txt`, `/llms-full.txt` and `/sitemap.xml`.
- A documentation ZIP, blank development record templates and a sanitized verification record under `/downloads/`.

Research and publication dates have different meanings. The November 13, 2026 research snapshot records inspected source revisions and the original host-test outcome; publication on November 14 does not establish new console compatibility or hardware testing. Preserve that distinction when updating pages. A source API declaration, a successful host build and a successful device test are separate evidence.

Only explicitly selected research content and blank templates enter the public archive. Local runtime records, device data, credentials, local paths and private Page links are excluded. `npm run check:build` verifies this boundary and checks generated local links and anchors. Local browser and deployment evidence is ignored by Git.

## HTTP interface

| Route | Purpose |
| --- | --- |
| `/health` | Service version, document count, research date and corpus checksum |
| `/api/docs` | Documentation catalog |
| `/api/docs/{slug}` | Complete guide as JSON |
| `/api/docs/{slug}?section={anchor}` | One guide section |
| `/api/search?q={query}&limit=8` | Ranked section search |
| `/mcp` | Streamable HTTP MCP endpoint |

The search query limit is 200 characters and results are capped at twenty. Invalid document IDs do not become filesystem paths or arbitrary remote requests. MCP supports the `2026-07-28` protocol and a stateless compatibility path for earlier HTTP clients. The connection guide documents protocol headers and examples. The server provides public documentation only; it does not execute builds or access a developer's console or files.

## Deployment

`wrangler.jsonc` names the Worker `kaihen-docs`, binds `dist/` as `ASSETS`, and attaches `kaihen.timsfun.com` as a Workers custom domain. Wrangler authentication belongs to the local Cloudflare CLI configuration, outside this project. Select the destination account through your CLI authentication or `CLOUDFLARE_ACCOUNT_ID` environment variable. There are no application secrets to upload. Forks should change the Worker name and domain before deploying.

```sh
npm run build
npm test
npm run check:build
npx wrangler deploy --dry-run
npx wrangler deploy
node scripts/check-http.mjs https://kaihen.timsfun.com
node scripts/check-mcp.mjs https://kaihen.timsfun.com/mcp
node scripts/check-published.mjs https://kaihen.timsfun.com
```

Check the public hostname over HTTPS after deployment, including an ordinary guide, a raw Markdown guide, the documentation ZIP and an unknown path returning the branded 404 page. The production corpus checksum should match the local `/health` response. Save deployment and verification evidence under `evidence/`.

When changing the public hostname, update Wrangler's custom domain, the Astro site URL, generated canonical URLs and the MCP handler's allowed hostname/origin list together. A Workers upload alone does not prove custom-domain DNS, TLS or browser behavior.

## Design maintenance

`PRODUCT.md` records the audience and product constraints. The direction contract is in `.impeccable/direction-contract.md`; `DESIGN.md` and `.impeccable/design.json` record the finished tokens and interface rules. Keep the documentation focused on reading and development tasks, with restrained controls, real source links and no decorative AI motifs.
