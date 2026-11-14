# kaiHEN Debugging Performance and Testing

Diagnose a failure at the narrowest boundary where it is observable. Separate environment acquisition, loader behavior, runtime initialization, application logic and rendering so that each result supports a specific conclusion.

## Evidence ladder

| Observation | What it establishes | What it leaves open |
| --- | --- | --- |
| Headers and source exist | An interface is implemented or declared | Build and hardware behavior |
| Host fixture passes | Tested logic works in that fixture | Kernel, devices and console services |
| Cross-compilation succeeds | Chosen sources and link inputs form an artifact | Startup and runtime compatibility |
| NRO launches | Entry and initial runtime path execute | All features and cleanup |
| First visible frame | One graphics path presents | Sustained use and synchronization |
| Exit and relaunch work | A specific lifecycle sequence succeeds | Other workloads and failure paths |
| Sustained scenario passes | Recorded behavior in one environment | Universal compatibility |

Use these levels in release notes and bug reports. This prevents a host test, a build or a screenshot from becoming a broader claim than its evidence supports.

## Log design

Write a startup record containing application commit, devkit version, driver/library pins, runtime release, protocol, host title, configured features and actual display properties. Add the exact firmware from a trusted system query or a recorded system-settings observation; do not infer it solely from compatibility markers.

libounce's `hosversionGet` masks environment marker bits and can use a 20.0.0 default in native Switch 2 startup. Its comments also describe hbloader passing a compatibility version. Therefore a bare `hosversionGet` value is not sufficient to prove the console's installed firmware in every launch path. [Firmware compatibility markers and defaults](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/runtime/hosversion.c)

For each subsystem, log start, selected configuration, result and cleanup. Use monotonic timestamps and one operation identifier. Preserve the first failure before later cleanup errors overwrite it.

## Result handling

Record raw `Result` values in hexadecimal along with the operation name. Distinguish IPC transport success from a status structure's reported initialization result. For POSIX-style APIs, capture `errno` immediately after the failing call before another library call changes it.

Treat timeout as its own state. A timeout does not prove that a remote mutation did not occur. For file transfer or service operations that can modify data, include an operation identifier and a read-back method before adding automatic retry.

## Symptom map

| Symptom | First boundary to inspect | Useful next evidence |
| --- | --- | --- |
| Game opens instead of hbmenu | HEN policy/arming stage | Host title, prior policy and launch sequence |
| Menu warns about the program | NRO platform metadata | Clean rebuild and selected runtime |
| Immediate application exit | Initialization stages | First logged call and result |
| Black screen | Render and presentation stages | Device strings, surface extent, shader logs |
| Sound fails to initialize | Audio service acquisition | `aud:u` path and result |
| Joy-Con mouse absent | Nmouse setup and device discovery | Init result, handles and sample count |
| JIT unavailable | Provider linking and runtime path | Final link command and `jitCreate` result |
| Second application fails | Resource lifetime | Thread, service and GPU cleanup records |
| Intermittent device loss | GPU wait/synchronization and driver version | OunceVK revision and reduced reproduction |

## Host tests in the upstream sources

The HEN test script compiles fixtures for code-mount requests and SM decoding. The RO script tests wire decoding, image layout, client sessions and mapping against mock backends. Their configured flags include address and undefined-behavior sanitizers, while disabling alignment checks for the wire parser's intentionally unaligned fields. [HEN host test commands](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/hen/test.sh) [RO host test commands](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/ro/test.sh)

Mocked mapping tests cannot prove console kernel mappings or actual service registration. The RO README makes that limitation explicit. [RO implementation and test scope](https://github.com/ouncebrew/kaihen/blob/e897f991524590833b82fbe8d63a3c6775fb8101/ro/README.md)

During this research, the default host invocation failed to compile under the installed Apple Clang because of `constexpr` diagnostics in the HIPC headers. Retrying with `CXX='clang++ -Wno-invalid-constexpr'` compiled the first fixtures, but both suites stopped with `Trace/BPT trap` and exit 133. The trap's cause was not established. These local suites did not pass; their logs are retained in `research/validation/`.

This is a bounded result for this host and invocation, not proof that the upstream tests fail on their intended environment. No source files were changed to make them pass. A clean Linux/GNU toolchain run is a sensible next verification step, followed by hardware tests where relevant.

## Application tests

Use host tests for meaningful portable behavior: configuration migration, path validation, binary parsing, transfer state machines, queue limits and deterministic simulation. Avoid tests that merely duplicate a function's implementation line for line.

On hardware, test initialize/fail/unwind, launch/exit/relaunch, an unrelated application after exit, input reconnect, missing files, full storage, network disconnect, renderer initialization failure and sustained workload. If a test changes storage, use disposable application-owned fixtures.

Preserve expected and observed outcomes. “Tested on Switch 2” is not a reproducible test record without firmware, runtime, devkit, workload and artifact hash.

## Timing and CPU performance

libounce's native tick helpers use a 31.25 MHz counter model, equivalent to 32 ns per tick, and expose the counter-frequency register. [Tick frequency and time conversion](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/arm/counter.h) Do not reuse an old Switch 1 hard-coded conversion in an engine profiler.

Record distributions instead of only average FPS. Useful metrics include median frame time, slow-frame percentiles, maximum stall, startup time, asset-load duration and input-to-action delay. Measure UI idle and active workloads separately. Instrument CPU update, rendering preparation, GPU wait, presentation and background IO.

## Memory performance

Normal libounce applications use mimalloc. Its `heapGetTotalSize` and `heapGetFreeSize` helpers describe that allocator's heap, while newlib's `mallinfo` and `sbrk` do not describe the same state. The free-size helper is a lower bound that excludes free space within partly used allocator pages. [Allocator-aware heap measurements](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch2/memory/heap.h)

Track allocation peaks and subsystem budgets: assets, render targets, compressed data, decoded media, JIT staging and worker queues. A decreasing “free” counter is a symptom to investigate, not automatically a leak. Compare equivalent checkpoints after repeated workloads and teardown.

## GPU and lifecycle diagnostics

hbmenu includes an optional performance overlay and platform timing instrumentation. [Menu performance instrumentation](https://github.com/ouncebrew/ounce-hbmenu/blob/d7e10c028b53da17867615ee0a3c453b9cf9464a/switch2/perf.c) OunceVK's native backend has completion and progress code that distinguishes pending work from completed work; its recent wait fix makes exact driver identity important when reporting device loss. [Native GPU completion waits](https://github.com/ouncebrew/ouncevk/blob/f5afcd27a98d47a35b7091b097ffd7f46b0be3e4/src/nouveau/vulkan/nvkmd/nvgpu/nvkmd_nvgpu_native_completion.c) [Native GPU progress ownership](https://github.com/ouncebrew/ouncevk/blob/f5afcd27a98d47a35b7091b097ffd7f46b0be3e4/src/nouveau/vulkan/nvkmd/nvgpu/nvkmd_nvgpu_native_progress.c)

The loader also snapshots resources and reports remaining threads, handles, memory and map changes after an NRO. Its cleanup code should be read before assuming every reported difference is harmless. [Loader resource snapshots](https://github.com/ouncebrew/ounce-hbloader/blob/95f0e5dfbbcd28d678d30c99eeb5344feb0f6e71/switch2/leak_check.c) [NRO launch cycle and cleanup](https://github.com/ouncebrew/ounce-hbloader/blob/95f0e5dfbbcd28d678d30c99eeb5344feb0f6e71/switch2/clean_main.cpp)

Reduce failures to the smallest workload that preserves the symptom. A useful report contains a minimal source commit, build inputs, exact steps, first failing call, full relevant log, frequency and a comparison against a known-good version. Include hardware captures only when they add information the logs cannot express.
