# MCP integration

Use the documentation from your development tools through the same source-backed corpus that powers this site. The public endpoint supports read-only search, topic retrieval and source lookup.

## Connection URL

```text
https://kaihen.timsfun.com/mcp
```

Add this URL as a remote HTTP MCP server in a compatible client. No API key or account is required for these public documents. Each request is independent; the service stores no chat history and has no access to your console, workspace or local credentials.

The endpoint supports MCP `2026-07-28` and a stateless compatibility path for earlier HTTP clients. It uses the MCP SDK v2 and the Cloudflare Workers handler. Legacy standalone SSE connections and resumable sessions are not offered.

## Available tools

| Tool | Inputs | Result |
| --- | --- | --- |
| `search` | `query`, optional `limit` | Ranked sections with IDs, excerpts and canonical links |
| `fetch` | `id` | Full page or section Markdown with evidence dates and source URLs |
| `list_docs` | Optional `group` | Topic index with descriptions |
| `get_sources` | `id` | Source references for the topic |

The server also exposes documentation pages as Markdown resources. All tools are declared read-only and return the site's published documentation. They do not acquire a homebrew environment, run builds or perform filesystem operations.

## Search, then retrieve

Start with a specific subsystem or API name:

```json
{
  "query": "sparse JIT publication",
  "limit": 5
}
```

Use a returned section ID with `fetch`:

```json
{
  "id": "jit#sparse-publication"
}
```

Document IDs such as `toolchain` return the whole guide. Canonical documentation URLs are accepted as well. `get_sources` returns the underlying references so a client can preserve citations while explaining an API or recommending a change.

## Example development questions

- Find the native build rules and explain which library `-lnx` resolves to.
- Retrieve the ownership rules for RO and HEN sessions.
- Find the difference between JIT staging writes and publication.
- Find the plugin readiness deadline and scalar command limits.
- Retrieve the hardware validation checklist before a release.

Ask the client to preserve the research date and distinguish a declared API from hardware-tested behavior. The server cannot add evidence of a test that has not been run.

## Test an HTTP connection

For a basic compatibility-path check, send an initialization request:

```sh
curl https://kaihen.timsfun.com/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"docs-check","version":"1.0"}}}'
```

A successful response includes the server identity and negotiated protocol. A compatible client normally handles negotiation for you. Use `POST` for MCP requests; opening `/mcp` in a browser address bar is a GET request and is not a connection test.

If a connection fails, verify the URL, HTTP transport support and the client's negotiation output. A browser-origin rejection is distinct from a missing document or a tool argument error.

## Direct documentation endpoints

| URL | Format |
| --- | --- |
| `/llms.txt` | Compact topic index with canonical links |
| `/llms-full.txt` | The full published documentation in Markdown |
| `/docs/toolchain.md` | One guide as Markdown |
| `/api/docs` | JSON document index |
| `/api/search?q=jit` | JSON section search |
| `/api/docs/jit?section=sparse-publication` | One section as JSON |

The raw Markdown and API routes are useful when a tool cannot connect through MCP. They use the same document corpus rather than a separately maintained summary.

## Scope and provenance

The original research snapshot is November 13, 2026; the website publication is November 14. Source links are pinned where available. Compatibility and verification limitations remain attached to the guides.

Client transport behavior is delegated to the official [MCP SDK](https://ts.sdk.modelcontextprotocol.io/v2/) and [Cloudflare Workers MCP handler](https://developers.cloudflare.com/agents/model-context-protocol/apis/handler-api/). See [Sources and evidence](/docs/sources/) for the development research's version and testing scope.
