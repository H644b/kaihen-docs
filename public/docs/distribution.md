# kaiHEN Packaging Distribution and Development Roadmap

Ship an application as a traceable build with clear requirements and a tested lifecycle. A good release tells another developer exactly what was built, how it was validated and which features remain conditional.

## Application package layout

A conventional application package can contain:

```text
switch/
  myapp/
    myapp.nro
    README.txt
    licenses/
```

This is a suggested distribution convention. Keep mutable settings and downloaded content outside the archive's overwrite-sensitive files. Include required external assets only when their distribution is authorized; otherwise explain how the user supplies them.

For the environment itself, the verified kaiHEN archive contains `bootstrap.bin`, `hbmenu.nro`, `ro/main`, `hen/main`, `game/main`, `programs/ounceshell.nro` and license files. These are different artifacts from an application's own `.nro`. [kaiHEN 20261114c release](https://github.com/ouncebrew/kaihen/releases/tag/20261114c)

## Metadata and artifact identity

Use an unambiguous artifact name such as `myapp-switch2-v0.1.0.nro`. Populate application title, author and version through NACP generation, and retain a recognizable icon. The reference Makefile documents those fields and NRO asset options. [GLES example NRO build pipeline](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/examples/gles-triangle/Makefile)

Generate SHA-256 hashes for the distributable and preserve its unstripped ELF and linker map privately or as developer artifacts. Record source commits for the application and the static runtime/driver dependencies. Use the downloadable [build record template](/downloads/application-build-record.json) and [hardware test record](/downloads/hardware-test-record.md) to preserve the exact environment and results.

Separate release version from tested environment. An application version may be unchanged while a rebuild adopts a new OunceVK. Indicate that dependency change explicitly, because the binary's graphics behavior can change even when application source does not.

## Minimum release notes

| Field | Useful content |
| --- | --- |
| Purpose | What the application does and its primary workflow |
| Requirements | Native Switch 2 environment, runtime/devkit baseline, required services |
| Installation | Exact SD directory and external assets |
| Controls | Confirm, cancel, exit and optional pointer/touch actions |
| Data | Where settings, logs and user content are stored |
| Validation | Firmware, host title, artifact hash and scenarios tested |
| Limitations | Unsupported functions and recoverable failure behavior |
| Changes | Application and dependency changes |
| Sources | Repository and exact source revision |

Avoid “works on all Switch 2 consoles” unless the evidence actually supports that scope. A correct narrower statement is more useful to a developer diagnosing a mismatch.

## Dependency licenses

The inspected projects declare different licenses:

| Component | Declared license or license family |
| --- | --- |
| kaiHEN core | GPL-2.0-only with the repository's named exemption |
| libkaihen | ISC |
| libounce and inherited libnx code | ISC; bundled mimalloc is MIT |
| ounce-devkit packaging | MIT |
| hbloader and hbmenu | ISC, with separately licensed bundled dependencies |
| OunceShell | GPL-3.0-or-later, with separately licensed dependencies |
| OunceVK/Mesa | Per-file and bundled license texts |

Use the exact license files for the revisions you ship; the runtime release's `licenses/` directory is a useful inventory example. This table records project declarations and does not resolve a particular product's redistribution obligations. [kaiHEN core license](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/LICENSE) [libkaihen license](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/libkaihen/LICENSE) [libounce inherited runtime license](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/LICENSE.md) [Devkit packaging license](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/LICENSE) [Loader license](https://github.com/ouncebrew/ounce-hbloader/blob/95f0e5dfbbcd28d678d30c99eeb5344feb0f6e71/LICENSE.md) [Menu license](https://github.com/ouncebrew/ounce-hbmenu/blob/d7e10c028b53da17867615ee0a3c453b9cf9464a/LICENSE.md) [OunceShell and VitaShell license](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/LICENSE) [Mesa licensing reference](https://github.com/ouncebrew/ouncevk/blob/f5afcd27a98d47a35b7091b097ffd7f46b0be3e4/docs/license.rst)

For a release pipeline, inventory what actually links into the binary rather than relying on only the top-level repository license. Preserve notices and review third-party assets, fonts and codecs alongside code dependencies.

## Continuous integration

A practical CI pipeline builds portable host targets, runs meaningful host tests, cross-compiles the native application, stores logs and symbols, and assembles a versioned artifact with hashes. Hardware acceptance remains a separate recorded step unless a reliable device test rig exists.

Pin toolchain and source inputs. Keep the host test build separate from the cross build so a host library cannot accidentally satisfy a target dependency. Fail the release when required assets are missing, the expected NRO is absent or a hash manifest does not match the artifact being uploaded.

If CI cannot run the application, label that limitation directly. “CI passed” then means the configured checks passed, not that gameplay, audio or GPU execution succeeded.

## Suggested milestone roadmap

| Milestone | Deliverable | Acceptance gate |
| --- | --- | --- |
| 0 Platform baseline | Recorded console/runtime/toolchain combination | Environment reproducible and source pins saved |
| 1 Native diagnostic | Small NRO with status and exit | Launch, exit and relaunch on hardware |
| 2 Portable core | Main algorithms and data model | Host fixtures and known data agree |
| 3 Interaction and assets | UI/input with real content | Controller fallback and file errors handled |
| 4 Rendering and sound | Representative frame and audio | Sustained use without corruption or underruns |
| 5 Optional services | Network, decoder, JIT or plugin | Independent feature probes and cleanup pass |
| 6 Reliability | Recovery paths and resource tracking | Repeated mixed-application cycles pass |
| 7 Release candidate | Package, manifest and notes | Artifact identity and hardware matrix reviewed |

These are suggested gates, not estimated completion dates. A small utility may skip several optional systems; an emulator or streaming client will spend more time on their interactions.

## Maintaining compatibility

When adopting a new runtime or devkit, rebuild from clean directories, compare link maps, run the minimal diagnostic, then repeat representative workloads and lifecycle tests. Record regressions against the last known-good artifact.

Track upstream changes by subsystem. A graphics fix suggests rendering and presentation tests; a loader cleanup change suggests repeated-launch tests; a plugin protocol change suggests discovery and payload tests. This is more efficient than retesting every scenario for every documentation edit, while still responding to consequential code changes.

## Release-readiness decision

Publish when the application's main workflow, failure behavior and exit path have been observed on the stated environment, and the package can be reproduced from its inputs. Keep experiments available as clearly labeled developer builds when those gates remain open. The label should tell users what evidence exists, not hide uncertainty behind a generic beta designation.
