# kaiHEN Porting Frameworks and Case Studies

Porting effort is determined by the lowest-level assumptions in an application. Inventory those assumptions before selecting a renderer or importing an entire dependency graph.

## Porting categories

| Existing project | Likely reusable parts | Main adaptation work |
| --- | --- | --- |
| Portable C or C++ library | Algorithms and ordinary data handling | Cross-build, allocation and filesystem behavior |
| libnx utility | Application logic and many service wrappers | Switch 2 rules, service access and lifecycle |
| SDL2 application | UI/game logic, input abstraction and assets | Library selection, backend and device testing |
| OpenGL ES application | Most renderer structure | EGL setup, shader profile and extensions |
| Vulkan application | Renderer organization and shaders | VI surface, limits, synchronization and presentation |
| Low-level Switch 1 renderer | Higher-level scene or UI logic | Device interfaces, memory layout and shader backend |
| Dynamic recompiler | Guest-system logic and some emitter code | JIT publication, cache coordination and ownership |
| Desktop engine | Portable subsystems | Platform layer, build graph and unsupported OS features |

This is an engineering estimate. It is not a compatibility matrix. The devkit states that Switch portlibs depending only on the C library and libnx, such as SDL2, can be reused. Low-level backend assumptions still require testing in the application that links them. [Development kit installation and usage](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/README.md)

## Dependency inventory

For every dependency, record its purpose, target platform, license identifier, whether it is static, whether it uses OS services, and whether it assumes a desktop process model. Prioritize libraries that touch graphics, threads, memory protection, sockets, audio and filesystem paths.

Common hidden assumptions include dynamic library loading, Unix signals, subprocesses, writable executable memory, desktop font directories, `/tmp`, unrestricted thread creation and a process exit that closes all resources. Replacing a compiler flag cannot resolve these architectural dependencies.

## A staged porting workflow

1. Preserve a working host build and deterministic fixtures.
2. Build a native empty application with the pinned devkit.
3. Add the portable core without graphics or networking.
4. Add asset access and validate formats.
5. Add input and one rendering frame.
6. Add audio and background work.
7. Run representative workloads.
8. Test repeated launch, failure and exit.
9. Optimize measured bottlenecks.

Keep each milestone small enough that a failing console log identifies a subsystem. A large first merge with a renderer, decoder, JIT and UI framework gives almost no diagnostic leverage when startup fails.

## Case study OunceShell

OunceShell adapts VitaShell into a Switch 2 file manager with browsing, editors, media functions and FTP. Its top-level README includes inherited Vita documentation, so platform-specific behavior should be checked in the `switch2` sources rather than inferred from every upstream paragraph. [OunceShell project and upstream context](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/README.md)

Its build selects portable VitaShell sources and a replacement platform layer. Functions for IO, networking, controller input, time, kernel-style utilities, text entry and rendering are adapted under `switch2/src`. [OunceShell platform source and dependency build](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/switch2/Makefile)

The renderer compatibility layer maps the old application's drawing concepts onto SDL, while the audio adapter uses SDL audio. [SDL rendering compatibility layer](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/switch2/src/vita2d_sdl.c) [SDL audio compatibility layer](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/switch2/src/vita_audio_sdl.c) Initialization sets up Switch 2 resources and installs defaults beneath `sdmc:/switch/ounceshell/`; unsupported Vita system features are deliberately left out. [OunceShell native initialization](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/switch2/src/init.c) [Deliberately unsupported inherited functions](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/switch2/src/dropped_features.c)

The general lesson is to preserve a mature application's internal contracts and replace the narrow platform boundary. This can be more tractable than rewriting the UI, file model and document operations at once. It also makes unsupported features visible instead of leaving them as nonfunctional menu items.

This case study does not mean every Vita application can use the same compatibility layer unchanged. The relevant artifact is the set of platform abstractions and their assumptions.

## Case study hbmenu

The Switch 2 hbmenu replaces CPU rendering with Vulkan and adds native-resolution rendering and vector assets. Its source separates rendering, Vulkan graphics and performance instrumentation. [Menu render adapter](https://github.com/ouncebrew/ounce-hbmenu/blob/d7e10c028b53da17867615ee0a3c453b9cf9464a/switch2/render.c) [Menu Vulkan renderer](https://github.com/ouncebrew/ounce-hbmenu/blob/d7e10c028b53da17867615ee0a3c453b9cf9464a/switch2/graphics_vulkan.c) [Menu performance instrumentation](https://github.com/ouncebrew/ounce-hbmenu/blob/d7e10c028b53da17867615ee0a3c453b9cf9464a/switch2/perf.c)

For a UI port, this suggests a practical split: keep application navigation and data handling, replace the render backend, then address resolution, fonts and timing explicitly. Treat a high-resolution icon or framebuffer as part of a whole scaling policy rather than an isolated cosmetic upgrade.

The project also recognizes platform metadata to warn about non-native programs. A distributor can reduce confusion further by using explicit Switch 2 artifact names and metadata in its own release process. [Menu launch and platform identification](https://github.com/ouncebrew/ounce-hbmenu/blob/d7e10c028b53da17867615ee0a3c453b9cf9464a/nx_main/nx_launch.c)

## Engine selection

For a small new application, SDL2 or a small EGL/GLES renderer has a lower integration surface than a full desktop engine. For an existing Vulkan codebase, retaining Vulkan may save more work than translating the renderer. Select based on the actual project rather than a universal preference.

This research does not establish turnkey kaiHEN exports for Unity, Unreal, Godot, Electron, Python or every Rust framework. Official console SDK support and an open homebrew build target are different integration paths. A framework candidate should first build a minimal application through this stack, then prove its renderer, input, audio, threads and shutdown.

For a large C++ engine, maintain a `platform/switch2` layer with explicit capabilities. Disable unavailable subsystems through configuration rather than scattered edits. Keep the portable engine buildable on the host so unit tests and content tools remain usable.

## Community project directory

The ouncebrew list links tools, games, streaming applications, emulators and plugins. Examples include Checkpoint, NXGallery, Sonic 3 AIR, Sonic Robo Blast 2, Moonlight, RetroArch, mGBA and an FTP plugin. [Community application and plugin directory](https://github.com/ouncebrew/hblist/blob/afb72130793e7e496ee7c021d129594efd0230b3/docs/index.md)

Use those entries to find candidate implementations of a subsystem. Before borrowing an approach, inspect the actual repository, its target branch, build instructions and dependency pins. A listing says little about whether its binary was rebuilt for the current driver or tested with the firmware available to you.

Avoid treating a similarly named project, a screenshot or a download label as proof of a working build. For every adopted component, preserve the exact source revision and its tested environment.

## Port completion criteria

A useful port should preserve the original application's important behavior, integrate platform input and storage conventions, recover from unavailable services, return cleanly, and document remaining limitations. Performance should be measured on representative workloads rather than an empty menu.

Compare host and console outputs for parsers, save formats, game simulation or media metadata where deterministic comparison is possible. For rendering and interaction, use a scenario list and recorded hardware observations. Compilation is one milestone; feature parity and reliability require additional evidence.
