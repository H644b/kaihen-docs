# kaiHEN Sources Evidence and Open Questions

This reference records the evidence behind the development guides. Primary project repositories, their implementation files and their release metadata are the technical authorities used here. Community posts were used for discovery, not as proof of API behavior or application compatibility.

## Reading the evidence

**Documented** means an upstream guide or public declaration states the behavior. **Source-inspected** means the relevant implementation or build recipe was checked. **Locally checked** means an explicit operation during this research produced a recorded result. **Recommended** describes an engineering choice proposed in the guides. These categories are not interchangeable.

The technical sources were collected on November 13, 2026 in America/New_York. Some project timestamps use another timezone and release identifiers contain `20261114`. The release API records runtime publication at 23:58:11 UTC and devkit publication at 23:15:00 UTC on November 13. These correspond to November 13 in New York as well.

## Repository snapshots

| Repository | Inspected source commit | Role |
| --- | --- | --- |
| [hblist](https://github.com/ouncebrew/hblist/tree/afb72130793e7e496ee7c021d129594efd0230b3) | `afb72130793e7e496ee7c021d129594efd0230b3` | Project discovery directory |
| [kaihen](https://github.com/ouncebrew/kaihen/tree/e897f991524590833b82fbe8d63a3c6775fb8101) | `e897f991524590833b82fbe8d63a3c6775fb8101` | Runtime, protocol, JIT and plugins |
| [libounce](https://github.com/ouncebrew/libounce/tree/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f) | `9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f` | Native application runtime |
| [ounce-devkit](https://github.com/ouncebrew/ounce-devkit/tree/f3478152dc553a104dd991efca4bde0c6e7cfe3e) | `f3478152dc553a104dd991efca4bde0c6e7cfe3e` | Build overlay and examples |
| [ounce-hbloader](https://github.com/ouncebrew/ounce-hbloader/tree/95f0e5dfbbcd28d678d30c99eeb5344feb0f6e71) | `95f0e5dfbbcd28d678d30c99eeb5344feb0f6e71` | NRO loader |
| [ounce-hbmenu](https://github.com/ouncebrew/ounce-hbmenu/tree/d7e10c028b53da17867615ee0a3c453b9cf9464a) | `d7e10c028b53da17867615ee0a3c453b9cf9464a` | Application menu |
| [ounceshell](https://github.com/kurumuz/ounceshell/tree/cb4c4ada491b4e0eb17f4d0419661095f96844e6) | `cb4c4ada491b4e0eb17f4d0419661095f96844e6` | Full application port example |
| [ouncevk](https://github.com/ouncebrew/ouncevk/tree/f5afcd27a98d47a35b7091b097ffd7f46b0be3e4) | `f5afcd27a98d47a35b7091b097ffd7f46b0be3e4` | Graphics driver |

The inspected runtime repository HEAD differs from the public release tag, and the devkit pins its own libkaihen source revision. Those identities are recorded separately in `source-manifest.json`; they should not be collapsed into one “latest” revision. A scoped comparison of the inspected kaiHEN `libkaihen`, `bootstrap` and `hen` directories against the devkit's pinned kaiHEN commit showed no differences during this research.

## Release artifact checks

Both public archives were downloaded and hashed without installation or execution. The calculated digests matched their published values.

| Artifact | Size in bytes | SHA-256 |
| --- | --- | --- |
| `kaiHEN-20261114c.zip` | 12325073 | `63b91e5e7c6f411aad758758e5a1a3cbe1f855b4304d87916afe5319b9dfd967` |
| `ounce-devkit-20261114.tar.xz` | 27312228 | `f24d5773b1ee1c2b19317f57e8ae54a60fcdcefe493a0e495297c241c4912f59` |

The runtime archive contains 59 entries and the development-kit archive 362 entries. The complete listings and metadata are in `release-verification.json`. Hash equality verifies the downloaded bytes against the published digest; it does not validate the safety or correctness of those binaries. [kaiHEN 20261114c release](https://github.com/ouncebrew/kaihen/releases/tag/20261114c) [ounce-devkit 20261114 release](https://github.com/ouncebrew/ounce-devkit/releases/tag/devkit-20261114)

## Local validation outcome

The HEN and RO host suites were attempted using the inspected libounce headers. The default Apple Clang invocation failed on HIPC `constexpr` diagnostics. A second invocation suppressing that diagnostic compiled the first fixture in each suite, but execution stopped with `Trace/BPT trap` and exit code 133. The cause remains unresolved. The suites did not pass on this host. Exact compiler identity, commands and captured output are retained under `validation/`.

No devkit was installed, no native application was cross-compiled, and no console operation, firmware change, save modification or hardware test was performed. The illustrative application is source material for a future build, not a tested release. Saved Page content is read back for structural verification; visual Page layout and Mermaid rendering have not been independently verified.

## Material source inconsistencies

- The Civilization VII launcher README refers to private kaiHEN 0.0.4 and a testship layout. The public runtime uses a release archive with a documented layout. Compatibility between that launcher's current assumptions and this public package needs a concrete test. [Civilization VII acquisition requirements](https://github.com/s8n/civ7-fs-kaihen/blob/main/README.md)
- The plugin public-header commentary describes an older startup order and failure behavior. The inspected bootstrap starts HEN first and lets it remain running when later plugin startup stops. The guides follow the implementation and current plugin guide. [Bootstrap launch and plugin readiness](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/bootstrap/source/main.cpp) [Native plugin development guide](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/PLUGINS.md)
- OunceShell's README points to `switch2/PORT.md`, but that file is absent in the inspected checkout. Its build and platform sources were used for the porting case study. [OunceShell platform source and dependency build](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/switch2/Makefile)
- OunceVK's summary describes public library names at a high level. Its packaging script gives the more exact archive/linker-script arrangement used by the toolchain guide. [Static graphics driver packaging](https://github.com/ouncebrew/ouncevk/blob/f5afcd27a98d47a35b7091b097ffd7f46b0be3e4/switch2/build/package-portlib.sh)
- The official devkitPro pacman page returned HTTP 403 to the research fetcher. The guide links the project's installer workflow without inventing host-specific package installation steps.

## Open questions and useful next experiments

| Question | Current evidence | Experiment that would settle it |
| --- | --- | --- |
| Which firmware and game revisions work? | Limited upstream baselines | Record successful acquisition and native NRO launch per exact combination |
| Does the public package work through the inspected Civ launcher? | Stale launcher documentation | Validate the release layout and run one recorded supported-device attempt |
| Which graphics features are reliable? | Source and upstream API claims | Device capability dump and small feature tests on hardware |
| What application memory is available? | Loader and allocator implementations | Measure allocation and resource budgets under a recorded host title |
| Why do local host fixtures trap? | Apple Clang compilation plus exit 133 | Reproduce with debugger and compare a supported Linux/GNU environment |
| Which app ports work with this devkit? | Project directory and source examples | Hash-identified builds with repeatable scenario tests |
| How stable are plugins and JIT under stress? | Public implementation and test fixtures | Concurrency, exhaustion and repeated lifecycle tests on hardware |
| Are turnkey engine exports available? | No validated export in this pack | Minimal engine build with a complete native runtime test |

## Primary source catalog

The links below point to exact inspected commits where available. `source-register.json` adds file SHA-256 hashes for local verification. The catalog includes different API sections in the same source file where useful; those are one underlying source, not independent corroboration.

### hblist

- [Community application and plugin directory](https://github.com/ouncebrew/hblist/blob/afb72130793e7e496ee7c021d129594efd0230b3/docs/index.md) — `docs/index.md`

### kaihen

- [kaiHEN project overview](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/README.md) — `README.md`
- [HEN runtime and launch policy](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/hen/README.md) — `hen/README.md`
- [RO implementation and test scope](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/ro/README.md) — `ro/README.md`
- [kaiHEN client API and handle ownership](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/include/kaihen.h) — `libkaihen/include/kaihen.h`
- [HEN protocol constants and layouts](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/include/kaihen/protocol.h) — `libkaihen/include/kaihen/protocol.h`
- [Native plugin public interface](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/include/kaihen/plugin.h) — `libkaihen/include/kaihen/plugin.h`
- [Native plugin development guide](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/PLUGINS.md) — `libkaihen/PLUGINS.md`
- [Plugin runtime handoff and teardown](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/source/plugin_runtime.cpp) — `libkaihen/source/plugin_runtime.cpp`
- [Scalar plugin service implementation](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/source/plugin_server.cpp) — `libkaihen/source/plugin_server.cpp`
- [Server-side CMIF helpers](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/source/cmif_server.hpp) — `libkaihen/source/cmif_server.hpp`
- [JIT backend development guide](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/JIT.md) — `libkaihen/JIT.md`
- [JIT provider and sparse publication](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/source/jit.c) — `libkaihen/source/jit.c`
- [JIT provider and plugin library build](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/Makefile) — `libkaihen/Makefile`
- [Bootstrap launch and plugin readiness](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/bootstrap/source/main.cpp) — `bootstrap/source/main.cpp`
- [Per-client service-manager proxy](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/hen/source/sm_proxy.cpp) — `hen/source/sm_proxy.cpp`
- [HEN command and plugin discovery server](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/hen/source/server.cpp) — `hen/source/server.cpp`
- [RO client and JIT bookkeeping limits](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/ro/source/session.h) — `ro/source/session.h`
- [RO command validation and JIT publication](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/ro/source/session.cpp) — `ro/source/session.cpp`
- [RO mapping and cleanup implementation](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/ro/source/mapping.cpp) — `ro/source/mapping.cpp`
- [HEN host test commands](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/hen/test.sh) — `hen/test.sh`
- [RO host test commands](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/ro/test.sh) — `ro/test.sh`
- [kaiHEN core license](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/LICENSE) — `LICENSE`
- [libkaihen license](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/LICENSE) — `libkaihen/LICENSE`

### libounce

- [libounce build and library variants](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/README.md) — `README.md`
- [Switch 2 Make rules and library overlay](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/switch2_rules) — `nx/switch2_rules`
- [Shared Switch 2 CPU flags](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/switch2_cpu.mk) — `nx/switch2_cpu.mk`
- [Runtime and allocator packaging](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/Makefile) — `nx/Makefile`
- [NRO platform identity record](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/nro.h) — `nx/include/switch/nro.h`
- [FS initialization and proxy identity](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/services/fs.c) — `nx/source/services/fs.c`
- [Standard filesystem device adapter](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/runtime/devices/fs_dev.c) — `nx/source/runtime/devices/fs_dev.c`
- [Service overrides and borrowed SM session](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/services/sm.c) — `nx/source/services/sm.c`
- [Application initialization and exit hooks](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/runtime/init.c) — `nx/source/runtime/init.c`
- [Pad state and controller helpers](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/runtime/pad.h) — `nx/include/switch/runtime/pad.h`
- [Joy-Con pointer aggregation implementation](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/runtime/pad_pointer.c) — `nx/source/runtime/pad_pointer.c`
- [HID touch and conventional input API](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/services/hid.h) — `nx/include/switch/services/hid.h`
- [Native Nmouse devices and sample memory](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch2/services/nmouse.h) — `nx/include/switch2/services/nmouse.h`
- [Switch 2 CPU framebuffer adaptation](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/display/framebuffer.c) — `nx/source/display/framebuffer.c`
- [Window size and frame-rate policies](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/display/native_window.h) — `nx/include/switch/display/native_window.h`
- [VI2 presentation and display capabilities](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch2/services/vi2.h) — `nx/include/switch2/services/vi2.h`
- [RomFS mount API](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/runtime/devices/romfs_dev.h) — `nx/include/switch/runtime/devices/romfs_dev.h`
- [Socket runtime initialization](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/runtime/devices/socket.h) — `nx/include/switch/runtime/devices/socket.h`
- [Network interface service API](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/services/nifm.h) — `nx/include/switch/services/nifm.h`
- [Native audio manager root](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch2/services/audu.h) — `nx/include/switch2/services/audu.h`
- [AudioOut native service selection](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/services/audout.c) — `nx/source/services/audout.c`
- [AudioRenderer native service selection](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/services/audren.c) — `nx/source/services/audren.c`
- [High-level hardware video decoder API](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch2/video/decoder.h) — `nx/include/switch2/video/decoder.h`
- [Decoder codecs and low-level image API](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch2/services/viddec.h) — `nx/include/switch2/services/viddec.h`
- [Decoder synchronization and lifetime implementation](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/switch2/video/decoder.c) — `nx/source/switch2/video/decoder.c`
- [Graphics image and synchronization API](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch2/services/gsv.h) — `nx/include/switch2/services/gsv.h`
- [JIT allocation and transition implementation](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/kernel/jit.c) — `nx/source/kernel/jit.c`
- [Allocator-aware heap measurements](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch2/memory/heap.h) — `nx/include/switch2/memory/heap.h`
- [Firmware compatibility markers and defaults](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/runtime/hosversion.c) — `nx/source/runtime/hosversion.c`
- [Tick frequency and time conversion](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/arm/counter.h) — `nx/include/switch/arm/counter.h`
- [libounce inherited runtime license](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/LICENSE.md) — `LICENSE.md`

### ounce-devkit

- [Development kit installation and usage](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/README.md) — `README.md`
- [Devkit installer and checksum selection](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/install.sh) — `install.sh`
- [Pinned devkit source revisions](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/build/sources) — `build/sources`
- [Development container baseline](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/Dockerfile) — `Dockerfile`
- [Switch 2 CMake toolchain](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/toolchain/cmake/Switch2.cmake) — `toolchain/cmake/Switch2.cmake`
- [CMake platform flags and overlay](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/toolchain/cmake/Platform/NintendoSwitch.cmake) — `toolchain/cmake/Platform/NintendoSwitch.cmake`
- [Cross-build environment variables](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/toolchain/switch2vars.sh) — `toolchain/switch2vars.sh`
- [Vulkan clear reference application](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/examples/vulkan-clear/source/main.c) — `examples/vulkan-clear/source/main.c`
- [Vulkan example build and metadata](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/examples/vulkan-clear/Makefile) — `examples/vulkan-clear/Makefile`
- [GLES triangle reference application](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/examples/gles-triangle/source/main.c) — `examples/gles-triangle/source/main.c`
- [GLES example NRO build pipeline](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/examples/gles-triangle/Makefile) — `examples/gles-triangle/Makefile`
- [Resident echo plugin example](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/examples/plugin-echo/source/main.c) — `examples/plugin-echo/source/main.c`
- [Native plugin ELF and NSO build](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/examples/plugin-echo/Makefile) — `examples/plugin-echo/Makefile`
- [Plugin discovery and scalar client example](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/examples/plugin-echo-client/source/main.c) — `examples/plugin-echo-client/source/main.c`
- [Devkit packaging license](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/LICENSE) — `LICENSE`

### ounce-hbloader

- [Native NRO loader usage](https://github.com/ouncebrew/ounce-hbloader/blob/95f0e5dfbbcd28d678d30c99eeb5344feb0f6e71/README.md) — `README.md`
- [NRO launch cycle and cleanup](https://github.com/ouncebrew/ounce-hbloader/blob/95f0e5dfbbcd28d678d30c99eeb5344feb0f6e71/switch2/clean_main.cpp) — `switch2/clean_main.cpp`
- [Loader resource snapshots](https://github.com/ouncebrew/ounce-hbloader/blob/95f0e5dfbbcd28d678d30c99eeb5344feb0f6e71/switch2/leak_check.c) — `switch2/leak_check.c`
- [Loader license](https://github.com/ouncebrew/ounce-hbloader/blob/95f0e5dfbbcd28d678d30c99eeb5344feb0f6e71/LICENSE.md) — `LICENSE.md`

### ounce-hbmenu

- [Switch 2 menu usage and rendering](https://github.com/ouncebrew/ounce-hbmenu/blob/d7e10c028b53da17867615ee0a3c453b9cf9464a/switch2/README.md) — `switch2/README.md`
- [Menu render adapter](https://github.com/ouncebrew/ounce-hbmenu/blob/d7e10c028b53da17867615ee0a3c453b9cf9464a/switch2/render.c) — `switch2/render.c`
- [Menu Vulkan renderer](https://github.com/ouncebrew/ounce-hbmenu/blob/d7e10c028b53da17867615ee0a3c453b9cf9464a/switch2/graphics_vulkan.c) — `switch2/graphics_vulkan.c`
- [Menu performance instrumentation](https://github.com/ouncebrew/ounce-hbmenu/blob/d7e10c028b53da17867615ee0a3c453b9cf9464a/switch2/perf.c) — `switch2/perf.c`
- [Menu launch and platform identification](https://github.com/ouncebrew/ounce-hbmenu/blob/d7e10c028b53da17867615ee0a3c453b9cf9464a/nx_main/nx_launch.c) — `nx_main/nx_launch.c`
- [Menu license](https://github.com/ouncebrew/ounce-hbmenu/blob/d7e10c028b53da17867615ee0a3c453b9cf9464a/LICENSE.md) — `LICENSE.md`

### ounceshell

- [OunceShell project and upstream context](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/README.md) — `README.md`
- [OunceShell platform source and dependency build](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/switch2/Makefile) — `switch2/Makefile`
- [OunceShell native initialization](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/switch2/src/init.c) — `switch2/src/init.c`
- [SDL rendering compatibility layer](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/switch2/src/vita2d_sdl.c) — `switch2/src/vita2d_sdl.c`
- [SDL audio compatibility layer](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/switch2/src/vita_audio_sdl.c) — `switch2/src/vita_audio_sdl.c`
- [Network compatibility layer](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/switch2/src/psp2_net.c) — `switch2/src/psp2_net.c`
- [Deliberately unsupported inherited functions](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/switch2/src/dropped_features.c) — `switch2/src/dropped_features.c`
- [OunceShell and VitaShell license](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/LICENSE) — `LICENSE`

### ouncevk

- [OunceVK and Mesa overview](https://github.com/ouncebrew/ouncevk/blob/f5afcd27a98d47a35b7091b097ffd7f46b0be3e4/README.rst) — `README.rst`
- [Native graphics interfaces and build guide](https://github.com/ouncebrew/ouncevk/blob/f5afcd27a98d47a35b7091b097ffd7f46b0be3e4/switch2/README.md) — `switch2/README.md`
- [Static graphics driver packaging](https://github.com/ouncebrew/ouncevk/blob/f5afcd27a98d47a35b7091b097ffd7f46b0be3e4/switch2/build/package-portlib.sh) — `switch2/build/package-portlib.sh`
- [Driver Rust target definition](https://github.com/ouncebrew/ouncevk/blob/f5afcd27a98d47a35b7091b097ffd7f46b0be3e4/switch2/toolchain/rust/aarch64-switch-horizon.json) — `switch2/toolchain/rust/aarch64-switch-horizon.json`
- [Native GPU completion waits](https://github.com/ouncebrew/ouncevk/blob/f5afcd27a98d47a35b7091b097ffd7f46b0be3e4/src/nouveau/vulkan/nvkmd/nvgpu/nvkmd_nvgpu_native_completion.c) — `src/nouveau/vulkan/nvkmd/nvgpu/nvkmd_nvgpu_native_completion.c`
- [Native GPU progress ownership](https://github.com/ouncebrew/ouncevk/blob/f5afcd27a98d47a35b7091b097ffd7f46b0be3e4/src/nouveau/vulkan/nvkmd/nvgpu/nvkmd_nvgpu_native_progress.c) — `src/nouveau/vulkan/nvkmd/nvgpu/nvkmd_nvgpu_native_progress.c`
- [Mesa licensing reference](https://github.com/ouncebrew/ouncevk/blob/f5afcd27a98d47a35b7091b097ffd7f46b0be3e4/docs/license.rst) — `docs/license.rst`

### Release and external references

- [kaiHEN 20261114c release](https://github.com/ouncebrew/kaihen/releases/tag/20261114c)
- [ounce-devkit 20261114 release](https://github.com/ouncebrew/ounce-devkit/releases/tag/devkit-20261114)
- [ns2jb SmileBASIC acquisition requirements](https://gitlab.com/kurumuz/ns2jb/-/blob/main/README.md)
- [Civilization VII acquisition requirements](https://github.com/s8n/civ7-fs-kaihen/blob/main/README.md)
- [Mesa Zink capabilities documentation](https://docs.mesa3d.org/drivers/zink.html)

## Refreshing this research

Preserve this snapshot, collect new commit and release identities, compare changed interfaces, and update only claims affected by the changes. Repeat artifact hashes and relevant build or hardware tests before expanding compatibility claims. A new source date does not make an old hardware observation current.
