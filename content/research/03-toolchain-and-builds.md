# kaiHEN Toolchain and Reproducible Builds

The development kit is an overlay on devkitPro. Reproducibility depends on selecting the Switch 2 headers and libraries before the original Switch libraries, recording the package versions, and rebuilding static dependencies when they change.

## Installed layout

| Location under `DEVKITPRO` | Purpose |
| --- | --- |
| `devkitA64` | Cross compiler and base rules |
| `tools/bin` | NRO, NSO and metadata conversion tools |
| `libounce` | Runtime, headers, linker scripts and build rules |
| `portlibs/switch2` | OunceVK, libkaihen and platform-specific overlay |
| `portlibs/switch` | Reusable devkitPro Switch libraries |
| `switch2vars.sh` | Environment for non-Make build systems |
| `ounce-devkit-version.txt` | Installed devkit identity |

The installer checks for `switch-dev`, `switch-zlib` and environment support, downloads a versioned archive when needed, and unpacks into the devkitPro prefix. It removes the previous `libounce` and `portlibs/switch2` directories before replacement. A local archive follows a separate path from a versioned download; verify its checksum yourself. [Devkit installer and checksum selection](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/install.sh)

Use a container or a dedicated devkitPro prefix if an existing project depends on an older overlay. These are build-environment choices; no console setup is required for a compile-only milestone.

## Published baseline

For this snapshot, the intended default is devkit `20261114`. Its published SHA-256 is:

```text
f24d5773b1ee1c2b19317f57e8ae54a60fcdcefe493a0e495297c241c4912f59
```

The release fixes GPU completion-wait handling and explicitly calls for rebuilding programs because OunceVK is linked statically. [ounce-devkit 20261114 release](https://github.com/ouncebrew/ounce-devkit/releases/tag/devkit-20261114) During this research, the downloaded archive matched that digest. This checks artifact identity; it does not establish a successful installation or console execution.

## Installation routes

The upstream documented local route, after installing devkitPro pacman, is:

```sh
git clone https://github.com/ouncebrew/ounce-devkit.git
cd ounce-devkit
sh install.sh 20261114
```

These commands are instructions for the developer, not actions performed on this machine during the research. Read the installer before running it because it can install packages and replace an existing overlay. [Development kit installation and usage](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/README.md) [Devkit installer and checksum selection](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/install.sh)

The repository's container starts from `devkitpro/devkita64:20260219` and adds shader tools and the overlay. [Development container baseline](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/Dockerfile) A typical container workflow is:

```sh
docker build -t ounce-devkit .
docker run --rm -v "$PWD:/build/project" -w /build/project ounce-devkit make
```

Pin the Dockerfile revision, development-kit version and resulting image digest in CI. A floating local image tag is convenient for interactive work but insufficient as a release record. On Apple Silicon, confirm that the selected container image supports the chosen platform or document any emulation used.

## Make projects

The central rules include is:

```make
include $(DEVKITPRO)/libounce/switch2_rules
```

Those rules set `LIBNX` to libounce, select the Switch 2 overlay first, and define `__SWITCH2__`. They preserve the familiar `-lnx` spelling through the installed library arrangement. [Switch 2 Make rules and library overlay](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/switch2_rules)

Use `$(SWITCH2_CPU)` where the project's `ARCH` is defined. The inspected CPU flags are `-mcpu=cortex-a78c+crypto`; copying a Switch 1 architecture setting later in a Makefile can override the intended target. [Shared Switch 2 CPU flags](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/switch2_cpu.mk)

Useful linking choices are:

| Feature | Primary link selection | Additional condition |
| --- | --- | --- |
| Ordinary native application | `-lnx` with Switch 2 rules | Correct include and library search order |
| Small runtime using newlib malloc | `-lounce_core` | Deliberate allocator choice |
| Vulkan | `-lvulkan` before runtime | Switch 2 driver overlay |
| OpenGL or GLES through EGL | `-lEGL` before runtime | Use the overlay EGL headers |
| kaiHEN JIT | `-lkaihen` provider | Inspect final link command |
| Native plugin | `-lkaihen_plugin -lounce_core` | NSO startup conventions |

The allocator split is implemented in libounce's build. [Runtime and allocator packaging](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/Makefile) OunceVK's packaging supplies linker scripts for the public graphics library names. [Static graphics driver packaging](https://github.com/ouncebrew/ouncevk/blob/f5afcd27a98d47a35b7091b097ffd7f46b0be3e4/switch2/build/package-portlib.sh)

## CMake, Meson and autotools

Source the environment before configuring:

```sh
source "$DEVKITPRO/switch2vars.sh"
aarch64-none-elf-cmake -S . -B build-switch2
cmake --build build-switch2
```

The CMake toolchain keeps `CMAKE_SYSTEM_NAME` as `NintendoSwitch` for existing project logic, changes `NX_ROOT` to libounce, and prioritizes Switch 2 packages. Its platform layer sets `NINTENDO_SWITCH2`. [Switch 2 CMake toolchain](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/toolchain/cmake/Switch2.cmake) [CMake platform flags and overlay](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/toolchain/cmake/Platform/NintendoSwitch.cmake)

Use separate build directories for Switch 1, Switch 2 and host builds. A cached `find_package` result can preserve the wrong graphics library even after environment variables change. For Meson or autotools, inspect their actual target, compiler, include directories and pkg-config output rather than assuming that sourcing a script proves correct configuration. The environment file exports architecture flags and the overlay prefixes. [Cross-build environment variables](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/toolchain/switch2vars.sh)

## Build products and metadata

An ordinary application should retain its `.elf` and linker map alongside the distributable `.nro`. The reference Makefiles use `nacptool` and `elf2nro` to assemble application metadata and assets; setting up an NPDM JSON can instead switch the template into an ExeFS package path. Do not add such a JSON file casually to an NRO project. [GLES example NRO build pipeline](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/examples/gles-triangle/Makefile)

The plugin example demonstrates a smaller direct route: cross-compile a C file, link an ELF against the plugin runtime, then convert with `elf2nso`. [Native plugin ELF and NSO build](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/examples/plugin-echo/Makefile)

## Reproducibility record

Store the application commit, dirty-tree state, toolchain package inventory, devkit release, library source pins, container digest, compiler version, build command and output hashes. For shader-heavy programs, also record shader compiler versions and source hashes. A deterministic build needs stable inputs; a successful build merely needs inputs that happen to work.

Inspect the full link command before debugging runtime symptoms. Search for `/libnx` paths that bypass libounce, the wrong `libEGL.a`, accidental host paths, old CPU flags and stale static libraries. Save that command in the build log. This single check often separates a platform porting issue from a dependency-selection error.
