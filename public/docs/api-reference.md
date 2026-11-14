# kaiHEN API reference

The client interface is declared in `kaihen.h`; protocol layouts are in `kaihen/protocol.h`. Include the headers from the same pinned devkit you link against. This reference covers the inspected protocol version 6 interface.

[Client declarations](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/include/kaihen.h) · [Protocol definitions](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/include/kaihen/protocol.h)

## Open a homebrew session

```c
Result kaihenGetRoSession(Service* out);
Result kaihenOpenHomebrewSession(Service* ro, Service* out);
Result henGetStatus(Service* s, HenStatus* out);
```

`kaihenGetRoSession` wraps the loader's borrowed `ldr:ro` session. The homebrew session opened through it is owned by the caller. Close that session after use; retain the loader's handle.

```c
Service ro = {0};
Service hen = {0};
HenStatus status = {0};

Result rc = kaihenGetRoSession(&ro);
if (R_SUCCEEDED(rc))
    rc = kaihenOpenHomebrewSession(&ro, &hen);
if (R_SUCCEEDED(rc))
    rc = henGetStatus(&hen, &status);

/* Check rc, status.protocol_version and status.initialization_result. */
if (serviceIsActive(&hen)) serviceClose(&hen);
```

This is an illustrative ownership pattern. Check transport results before reading output structures, and keep a UI or log path available when the optional HEN query fails.

## Status fields

| Field | Type | Meaning |
| --- | --- | --- |
| `process_id` | `u64` | The HEN process ID |
| `protocol_version` | `u32` | Implemented HEN homebrew protocol |
| `initialization_result` | `Result` | HEN's startup result |

A successful `henGetStatus` means the request completed. Inspect the returned startup result independently. Use protocol checks to gate features rather than assuming all commands exist because the session opened.

## Owned resource copies

```c
Result henGetFilesystemRoot(Service* s, Handle* out);
Result henGetSettingsSession(Service* s, Handle* out);
Result henGetProcessHandle(Service* s, Handle* out);
Result henGetServiceManager(Service* s, Handle* out);
```

These calls return owned handles for the documented resource or proxy. Their initialization and forwarding semantics differ. Use libounce's ordinary service paths wherever possible, and read [Runtime and ABI](/docs/runtime/#service-overrides-and-ownership) before sending low-level initialization commands to an override.

For every acquired resource, record whether it is borrowed, owned, initialized, active or already closed. In C++, a move-only wrapper can encode ownership. In C, a single unwind path with initialization flags keeps partially successful startup predictable.

## Plugin discovery

```c
Result henGetPluginCount(Service* s, u32* out_count);
Result henGetPluginName(Service* s, u32 index, HenPluginName* out_name);
Result henOpenPlugin(Service* s, const HenPluginName* name, Service* out);
```

Commands 20–22 provide plugin discovery and opening. A published name is the plugin filename without `.nso`. Opening creates a fresh owned client session; a plugin's own command protocol still needs separate version negotiation.

Enumerate again after an unavailable result rather than trusting a cached process ID. A plugin may run without publishing a service, so an empty list does not prove no plugin processes exist.

See [Plugins and IPC](/docs/plugins/) for startup, readiness, payload limits and service shutdown.

## Protocol command map

| Command | Operation |
| --- | --- |
| `0` | Get status |
| `16` | Get filesystem root |
| `17` | Get settings session |
| `18` | Get caller process handle |
| `19` | Get service-manager proxy session |
| `20` | Get published plugin count |
| `21` | Get plugin name |
| `22` | Open plugin |

Use the public wrappers unless a concrete implementation gap requires raw IPC. Keep custom payloads fixed-width and validate sizes on both sides of the boundary.

## JIT entry points

Native applications use libounce's `Jit` interface and link the kaiHEN provider with `-lkaihen`:

```c
Result jitCreate(Jit* j, size_t size);
Result jitTransitionToWritable(Jit* j);
Result jitTransitionToExecutable(Jit* j);
Result jitClose(Jit* j);
```

Emit into `jitGetRwAddr` and execute through `jitGetRxAddr` only after successful publication and the required synchronization. The application-visible RW buffer is staging, so direct writes do not independently publish new executable bytes. Sparse publication uses `kaihenJitPublishRanges`.

[JIT provider guide](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/JIT.md) · [JIT runtime implementation](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/kernel/jit.c)

See [JIT and language runtimes](/docs/jit/) before integrating an emitter that assumes a directly coherent writable alias.

## Failure handling

Log the API name and hexadecimal `Result` immediately. Read outputs only after success. Keep transport failure separate from a nonzero result embedded in a reply. Clean up only resources that were actually acquired.

For a mutating plugin command, a timeout can leave the outcome uncertain. Add a request identifier and a status operation before enabling retries. A documentation example that omits application-specific recovery is not a complete retry policy.

## Version scope

The research snapshot describes concrete source revisions, not an automatically refreshed ABI contract. Review upstream changes when adopting a new devkit, rebuild static dependencies and run the relevant lifecycle tests. Source declarations and host fixtures do not establish universal console behavior.
