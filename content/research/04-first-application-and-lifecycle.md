# kaiHEN First Application and Lifecycle

The first useful application is a small native diagnostic: it should render something simple, obtain HEN status, respond to a controller button, and return to hbmenu. This gives a clear baseline before assets, network services or an engine obscure failures.

## Recommended project structure

```text
myapp/
  source/main.c
  include/
  romfs/
  tests/
  Makefile
  README.md
  LICENSE
```

Keep application logic independent of console initialization. A parser, asset index, state machine or protocol codec should be testable on the host. Put platform calls behind a small layer so a hardware failure does not require rewriting the entire project.

Use a current upstream example Makefile as the build foundation and change its title, author, target and source directories. The devkit's GLES and Vulkan examples demonstrate the native rules and output pipeline. [GLES example NRO build pipeline](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/examples/gles-triangle/Makefile) [Vulkan example build and metadata](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/examples/vulkan-clear/Makefile)

## Original diagnostic example

The following is an illustrative application assembled for this research. It has not been cross-compiled or executed on a console. It uses declared libounce and libkaihen interfaces; hardware validation remains the next acceptance step. The console renderer is useful for diagnostics, while a production UI can use SDL2, EGL or Vulkan.

```c
#include <inttypes.h>
#include <stdio.h>
#include <switch.h>
#include <kaihen.h>

int main(void) {
    if (!consoleInit(NULL)) return 1;

    padConfigureInput(1, HidNpadStyleSet_NpadStandard);
    PadState input;
    padInitializeDefault(&input);

    Service ro = {0};
    Service hen = {0};
    HenStatus status = {0};
    Result rc = kaihenGetRoSession(&ro);
    if (R_SUCCEEDED(rc))
        rc = kaihenOpenHomebrewSession(&ro, &hen);
    if (R_SUCCEEDED(rc))
        rc = henGetStatus(&hen, &status);

    printf("Native homebrew diagnostic\n");
    printf("Status query: 0x%08" PRIx32 "\n", (uint32_t)rc);
    if (R_SUCCEEDED(rc)) {
        printf("Protocol: %" PRIu32 "\n", status.protocol_version);
        printf("HEN PID: %" PRIu64 "\n", status.process_id);
        printf("Startup: 0x%08" PRIx32 "\n",
               (uint32_t)status.initialization_result);
    }
    printf("Press Plus to return.\n");

    while (appletMainLoop()) {
        padUpdate(&input);
        if (padGetButtonsDown(&input) & HidNpadButton_Plus) break;
        consoleUpdate(NULL);
    }

    if (serviceIsActive(&hen)) serviceClose(&hen);
    /* ro borrows the loader's session. */
    consoleExit(NULL);
    return R_FAILED(rc) ? 1 : 0;
}
```

The status calls and session ownership follow the client declarations. [kaiHEN client API and handle ownership](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/include/kaihen.h) Pad helpers provide the controller aggregation and edge detection. [Pad state and controller helpers](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/runtime/pad.h) libounce has a Switch 2 CPU framebuffer implementation behind the familiar display API. [Switch 2 CPU framebuffer adaptation](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/display/framebuffer.c)

An IPC request succeeding does not imply `initialization_result` is zero. Display both values and gate features on the required protocol. If status fails, leave ordinary UI and exit controls functional so the application can still report a useful failure.

## Initialization as a transaction

For larger programs, maintain explicit state for each completed initialization stage. Allocate only after its prerequisites are available. If a later step fails, unwind completed stages in reverse order.

```text
runtime defaults
  -> diagnostic output
  -> read-only configuration
  -> input
  -> optional HEN features
  -> renderer
  -> audio
  -> worker threads and network activity
```

This ordering is a suggested design. Some applications need different dependencies, but the invariant remains: cleanup must know which resources were actually acquired. Do not call a close routine on an uninitialized structure merely because another platform tolerated it.

## File and asset conventions

Use RomFS for immutable packaged assets and an application-specific SD directory for mutable state. `romfsInit` and `romfsExit` expose the packaged asset mount through the runtime. [RomFS mount API](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/runtime/devices/romfs_dev.h)

For example, choose `sdmc:/switch/myapp/` for settings and logs. This path is an application convention, not a kaiHEN-enforced sandbox. Keep user files separate from generated caches so a cleanup command can remove disposable data without touching valuable content.

Treat file errors as normal outcomes: missing SD card, directory creation failure, incomplete file, full storage and unsupported format should produce a recoverable state. Keep the last valid configuration when a new one fails to parse.

## Main-loop design

Poll input and platform lifecycle events regularly. Move long file scans, network waits and decompression out of the render loop. Worker results should enter the UI through a bounded queue or a documented synchronization primitive. A worker must not directly mutate renderer-owned objects without the rendering API's threading rules being satisfied.

Use frame elapsed time for animation and game simulation. Do not equate one iteration with 1/60 second. Docked output, display changes and stalled frames make that assumption fragile.

## Shutdown contract

Stop accepting new work, notify workers, cancel or finish outstanding requests, join threads, stop audio, release graphics resources, flush and close files, close owned sessions and return from `main`. Teardown should tolerate a partially initialized application.

The loader and libounce perform additional cleanup between NROs, but a living thread can still refer to application code and heap memory. The loader's cleanup and leak checks are evidence that cross-application lifetime management is a real requirement. [Loader resource snapshots](https://github.com/ouncebrew/ounce-hbloader/blob/95f0e5dfbbcd28d678d30c99eeb5344feb0f6e71/switch2/leak_check.c) [Application initialization and exit hooks](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/runtime/init.c)

## First hardware acceptance checklist

- The menu recognizes a native Switch 2 build.
- A visible diagnostic frame appears.
- HEN transport and initialization results are recorded separately.
- Plus exits, and hbmenu becomes usable again.
- The application launches again in the same process.
- A second, unrelated application can launch afterward.
- A missing optional feature produces a clear message and a usable exit path.
- The application leaves its own settings intact after an interrupted run.

Run the repeated-launch sequence before adding a large dependency. A one-time screenshot proves far less than a clean return followed by another launch.
