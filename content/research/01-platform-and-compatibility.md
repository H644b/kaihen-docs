# kaiHEN Platform and Compatibility

Research snapshot: November 13, 2026, America/New_York. This guide concerns native Switch 2 homebrew applications built with the public ouncebrew stack. Its practical baseline is a pinned kaiHEN runtime, the ounce-devkit toolchain, libounce, and an application that can enter and exit cleanly before larger features are added.

## What kaiHEN provides

kaiHEN describes itself as a homebrew environment and minimal custom firmware. It supplies resident loader and service components rather than a complete application framework. The development repository points existing libnx applications toward libounce and OpenGL or Vulkan. Access is broad enough to include system storage; an application should therefore treat every write target as an explicit product decision. [kaiHEN project overview](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/README.md)

The stack has several independently versioned parts:

| Part | Developer role | Typical output or interface |
| --- | --- | --- |
| kaiHEN RO and HEN | Load programs and provide the homebrew environment | Native services and homebrew sessions |
| ounce-hbloader | Run sequential NROs in a native game process | The game `main` module |
| ounce-hbmenu | Select and launch applications | `hbmenu.nro` |
| libounce | Supply libnx-style runtime and operating-system wrappers | Headers and static libraries |
| OunceVK | Supply Vulkan and EGL/OpenGL rendering | Static driver libraries |
| libkaihen | Expose HEN, JIT and plugin interfaces | `kaihen.h` and supporting libraries |
| ounce-devkit | Assemble build rules, libraries and examples | A devkitPro overlay |

The library and compiler arrangement is significant: the devkit layers Switch 2 support over devkitPro rather than replacing its entire toolchain. [Development kit installation and usage](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/README.md)

## Release baseline and dates

The observed public runtime release is `20261114c`, published at `2026-11-13T23:58:11Z`. The observed development kit is `devkit-20261114`, published at `2026-11-13T23:15:00Z`. In New York these times are November 13 at 6:58 p.m. and 6:15 p.m. EST. The date-like release names are identifiers, not evidence of a later research date. [kaiHEN 20261114c release](https://github.com/ouncebrew/kaihen/releases/tag/20261114c) [ounce-devkit 20261114 release](https://github.com/ouncebrew/ounce-devkit/releases/tag/devkit-20261114)

For a new project, record both release identifiers and the individual source commits. Development-kit libraries can be pinned to a different kaiHEN revision from the runtime package. A single label such as “latest kaiHEN” leaves that distinction unresolved. The inspected devkit source list pins libounce `9382b1ec`, OunceVK `f5afcd27`, and kaiHEN `eb81e191`. [Pinned devkit source revisions](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/build/sources)

## Firmware and acquisition scope

Application development and acquiring an initial homebrew environment are separate dependencies. A working game exploit alone does not establish that a native NRO loader or all required services are available.

| Route | Upstream stated baseline | How to interpret it |
| --- | --- | --- |
| SmileBASIC through ns2jb | System software 23.0.1; SmileBASIC full 4.4.9 or the supported demo; Node.js 22+ on macOS or Linux | Treat the documented combination as the baseline; acquisition remains timing sensitive |
| Civilization VII through civ7-fs-kaihen | Claims firmware at or below 23.0.1; reports testing only on 23.0.1 with exFAT support | The wider inequality is not a tested firmware matrix |

The SmileBASIC instructions require SD storage and distinguish the HEN launcher from the older debugging/RPC workflow. [ns2jb SmileBASIC acquisition requirements](https://gitlab.com/kurumuz/ns2jb/-/blob/main/README.md) The inspected Civilization launcher README still refers to private kaiHEN 0.0.4 even though a public release now exists. Its release-path assumptions therefore need reconciliation before using it with the public archive. [Civilization VII acquisition requirements](https://github.com/s8n/civ7-fs-kaihen/blob/main/README.md)

Do not infer support for a newer firmware, a different game revision, or another entrypoint from these rows. A firmware-independent application source tree still needs a working runtime on the target console. This pack does not establish a downgrade path or a way to run the acquisition routes on unsupported firmware.

## Source compatibility and binary compatibility

libounce adds a platform record to linked programs. Its NRO definitions identify Switch 1 and Switch 2 separately; a traditional libnx program lacks that record. [NRO platform identity record](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/nro.h) hbmenu warns before launching programs that were not built with the Switch 2 devkit. [Switch 2 menu usage and rendering](https://github.com/ouncebrew/ounce-hbmenu/blob/d7e10c028b53da17867615ee0a3c453b9cf9464a/switch2/README.md)

The useful porting question is consequently: “Which source-level interfaces does this application use?” A portable C parser is easier to reuse than code issuing device ioctls or assuming a particular display-buffer layout. An old `.nro` filename is not a compatibility guarantee. A successful link is also insufficient: graphics, services, audio, file access and shutdown each have observable behavior to verify.

## Capability assessment

| Area | Evidence available | Development consequence |
| --- | --- | --- |
| Native application selection | Loader and menu source plus packaged binaries | Use this path for the first application |
| Vulkan and OpenGL ES | Driver source and small reference examples | Validate one rendered frame before an engine port |
| Joy-Con pointer input | Switch 2-specific HID APIs and wrapper | Add mouse support as a separate input path |
| JIT | Public API, provider and RO implementation | Budget publication, cache synchronization and memory |
| Resident plugins | Runtime and IPC examples | Use only where a separate process is needed |
| Broad service access | HEN and service-proxy implementation | Probe required services and handle failures |
| Universal compatibility | No complete hardware matrix in this research | Publish the exact combinations actually tested |

## Choosing a first project

The lowest-friction first projects are a diagnostic utility, a small SDL2 application, an existing libnx application with ordinary file access, or a renderer with a modest OpenGL ES feature set. This is an engineering assessment based on interface breadth, not a claim that every application in those categories already works.

An emulator, streaming client or large game engine introduces several coupled systems. Start it as a sequence of milestones: native startup, input, files, one frame, sound, workload, repeated exit, and sustained use. A project depending on a privileged service should prove that service independently before importing a large UI or renderer.

The community homebrew list is useful for finding repositories such as OunceShell, RetroArch, Moonlight, mGBA and game ports. It is a project directory, not a test certificate for a particular release binary. [Community application and plugin directory](https://github.com/ouncebrew/hblist/blob/afb72130793e7e496ee7c021d129594efd0230b3/docs/index.md)

## Initial decision record

Before choosing a framework, write down the application purpose, target firmware, acquisition route, runtime release, devkit version, rendering API, storage needs, network needs and exit behavior. Identify optional features that can be disabled when unavailable. This makes the first hardware result interpretable and turns later upstream changes into bounded updates.

Continue with [Runtime architecture](02-runtime-and-abi.md) and [Toolchain and reproducible builds](03-toolchain-and-builds.md).
