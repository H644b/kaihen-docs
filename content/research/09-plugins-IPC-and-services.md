# kaiHEN Plugins IPC and Services

Native plugins are separate resident processes. Use one when work must continue outside an individual NRO, when several applications need a shared service, or when an operation has a clearly defined process boundary. Ordinary application features are easier to develop and recover when they remain in the application.

## Plugin lifecycle

The bootstrap scans `.nso` files under `/kaihen/plugins`. A plugin receives its own SM-proxy session and FS-root clone through a temporary startup handoff. `pluginRuntimeInitialize` installs the necessary overrides. A plugin that uses files explicitly initializes and exits FS. [Plugin runtime handoff and teardown](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/source/plugin_runtime.cpp)

The plugin signals a ready event after completing its own initialization. The bootstrap currently waits up to five seconds. A timed-out plugin may keep running while remaining absent from HEN's published service list; `/kaihen/plugin-status.txt` records startup outcomes. [Native plugin development guide](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/PLUGINS.md)

Readiness must mean that the advertised commands are usable. A process existing is not the same as a service being ready. Allocate mandatory resources and start the service loop before signaling the ready event.

## Build model

The reference plugin uses `AppletType_None`, supplies its own small heap, replaces application initialization hooks, links `-lkaihen_plugin -lounce_core`, and converts an ELF into an NSO. [Native plugin ELF and NSO build](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/examples/plugin-echo/Makefile) [Resident echo plugin example](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/examples/plugin-echo/source/main.c)

The `-lounce_core` choice keeps the small plugin on newlib's allocator rather than the normal application mimalloc arrangement. Do not copy a large application's heap assumptions into a resident process. Start with a fixed, measured workload and expose memory use in diagnostics.

## Publishing an IPC service

`pluginRuntimeInitialize` alone does not publish a service. The opt-in function `pluginRuntimeInitializeWithService` returns the ready event and a borrowed control-session handle. `pluginServiceStart` can then serve scalar commands. The simple helper supports up to 64 request bytes and 64 reply bytes, with a maximum of 16 client sessions. [Native plugin public interface](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/include/kaihen/plugin.h)

HEN publishes the plugin under its filename without `.nso`. Each client opening it receives a fresh session. Current plugin enumeration is not a list of every running plugin; it is a list of those that published IPC and remain eligible for listing. [HEN command and plugin discovery server](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/hen/source/server.cpp)

For larger data, transferred handles, domains or mapped buffers, use a deliberately designed custom HIPC/CMIF server rather than forcing a bulk transfer through a scalar command structure. The server-side helper code is the appropriate starting point for understanding parsing and reply construction. [Server-side CMIF helpers](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/source/cmif_server.hpp)

## Client flow

An application obtains RO's borrowed session, opens an owned HEN session, queries status, enumerates names and opens the desired plugin. The devkit's echo client demonstrates a simple scalar request and writes the result to SD. [Plugin discovery and scalar client example](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/examples/plugin-echo-client/source/main.c)

Use a version-query command in the plugin's own protocol. HEN protocol version 6 establishes the discovery mechanism, but it does not describe each plugin's application-specific commands. Two plugins with the same filename can still expose incompatible payloads.

If a plugin disappears, close the failed client session and present an unavailable state. A cached name or process ID is not a durable authority across restarts. Do not automatically repeat a mutating request whose completion is uncertain after a timeout; design request IDs and status queries when retry safety matters.

## Command design

A small service protocol should define:

| Element | Required decision |
| --- | --- |
| Version | Major/minor policy and supported features |
| Request identity | Command ID, optional sequence and retry semantics |
| Payload | Fixed-width fields, size and permitted ranges |
| Reply | Transport result, operation result and output size |
| Lifetime | Which side owns buffers, handles and sessions |
| Cancellation | Whether a pending operation can be stopped |
| Limits | Maximum work, queue depth and concurrent clients |

CMIF can pad scalar input to whole words. Validate the minimum known payload and read only its declared fields, rather than assuming the callback's byte count equals the logical struct size. [Scalar plugin service implementation](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/source/plugin_server.cpp)

Avoid exposing pointers, arbitrary paths or a generic system-call proxy when a bounded operation will serve the product. A file-index service, for example, can accept a validated directory identifier and return a bounded batch of entries. That is easier to test and recover than a fully general remote filesystem interface.

## Threading and slow work

The helper separates the control thread answering HEN's fresh-session requests from the worker thread handling client commands. That protects HEN from a slow plugin callback. [Scalar plugin service implementation](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/source/plugin_server.cpp) It does not mean all client commands run in parallel.

For long tasks, accept a job and return a job ID promptly. Provide status, result and cancellation commands with bounded replies. Keep service control responsive while file scans, transfers or computations run elsewhere. Define queue saturation behavior; an unbounded queue turns a temporary slow client into a resident memory problem.

## Shutdown and error handling

Stop the service before calling `pluginRuntimeExit`. The runtime owns its startup handles; the borrowed control session should not be closed separately by client code. [Native plugin public interface](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/include/kaihen/plugin.h)

Close every plugin-owned resource on each initialization failure path. If the service cannot start, report a specific result and avoid signaling ready. If a worker fails after publication, expose the failed state and release clients in a controlled way.

A plugin persists beyond an application, so include a way to inspect its state without running its full workload. Useful fields include protocol version, uptime, active sessions, queued jobs, memory counters and last operation result. Keep the diagnostic interface read-only.

## Validation plan

Test successful startup, missing file, initialization failure, readiness timeout, malformed scalar input, unknown command, maximum sessions, client disconnect during work, service shutdown and plugin process exit. Add a deliberately slow command to confirm that HEN's discovery remains responsive.

The development-kit echo example is particularly useful because it includes ordinary request handling, an exit event and a deliberately slow command. Study those mechanics before replacing them with a real workload. [Resident echo plugin example](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/examples/plugin-echo/source/main.c)

Finally, test ordinary NRO launch and return while the plugin is active. The relevant acceptance criterion is coexistence across several application cycles, not simply that the plugin process starts.
