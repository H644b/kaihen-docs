# Quickstart

Build a small native Switch 2 application before adding an engine or a resident plugin. This path gets the toolchain, graphics, controller input and normal exit onto one reproducible baseline.

## Before you begin

You need a development computer, devkitPro's Switch toolchain, the ounce-devkit overlay, and a supported console environment for running the resulting NRO. Building on your computer does not require a live console.

The research baseline is ounce-devkit `20261114` and kaiHEN `20261114c`. Treat these as a pinned reference rather than a claim about every later release. Read [Platform overview](/docs/overview/) for the documented firmware and acquisition scope.

## Install the development kit

Start with the [official ounce-devkit repository](https://github.com/ouncebrew/ounce-devkit). Install devkitPro pacman using its own platform instructions, then use the versioned overlay:

```sh
git clone https://github.com/ouncebrew/ounce-devkit.git
cd ounce-devkit
git checkout f3478152dc553a104dd991efca4bde0c6e7cfe3e
sh install.sh 20261114
```

The installer can install missing packages and replace an existing `libounce` and `portlibs/switch2` overlay. Review [the pinned installer](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/install.sh) before updating an environment used by another project.

Check the installed identity and build rules:

```sh
cat "$DEVKITPRO/ounce-devkit-version.txt"
test -f "$DEVKITPRO/libounce/switch2_rules"
test -f "$DEVKITPRO/portlibs/switch2/lib/libvulkan.a"
```

If `DEVKITPRO` is not set in your shell, load the devkitPro environment for your installation. Do not substitute a guessed prefix into an existing project's configuration.

## Build the smallest graphics example

From the ounce-devkit repository, build its Vulkan clear example:

```sh
make -C examples/vulkan-clear
```

The example clears a native window without shaders and uses Plus to exit. This isolates the surface, queue and presentation path from shader compilation and asset loading. Read [the example source](https://github.com/ouncebrew/ounce-devkit/blob/f3478152dc553a104dd991efca4bde0c6e7cfe3e/examples/vulkan-clear/source/main.c) and retain the generated ELF and NRO.

For an OpenGL ES starting point:

```sh
make -C examples/gles-triangle
```

Use a clean build directory when changing the target platform or development-kit version. OunceVK is linked statically, so a driver update requires rebuilding the application.

## Run the native application

Once kaiHEN and hbmenu are running on a supported console, transfer the NRO to an application directory on SD, such as:

```text
sdmc:/switch/vulkan-clear/vulkan-clear.nro
```

That directory is a convention for organizing your app, not an access-control boundary. OunceShell's FTP service can transfer builds and retrieve logs in an existing environment.

Open the application from hbmenu. Record whether a frame appears, whether controller input works and whether Plus returns to a usable menu. Repeat the launch, then open an unrelated application. These observations test different parts of the lifecycle.

## Start your application

Copy the reference example into your own project and update its target and NACP metadata. Keep the native rules include:

```make
include $(DEVKITPRO)/libounce/switch2_rules
```

For ordinary applications, `-lnx` then resolves through the libounce installation. Select the graphics library before the runtime:

```make
LIBS := -lvulkan -lnx
```

For an EGL/GLES application use `-lEGL -lnx`. A resident plugin has different startup and linking requirements; follow [Plugins and IPC](/docs/plugins/) rather than changing an NRO's file extension.

## Add features in a useful order

| Step | Build | Observe |
| --- | --- | --- |
| Native entry | Status and a simple screen | Startup result and a normal return |
| Input | One controller action | Correct press edges and reconnect behavior |
| Files | Load one known asset | Missing-file behavior and bounded reads |
| Renderer | One representative scene | Correct output and repeated presentation |
| Audio | Short PCM output | Buffer ownership and clean stop |
| Optional systems | Network, decoder, JIT or plugin | Independent initialization and failure paths |

Keep portable logic runnable on the host. Use console tests to establish device behavior and host tests to validate parsers, protocols and deterministic algorithms.

## If the first launch fails

If a native game opens instead of hbmenu, check the environment's policy/arming stage. If hbmenu warns about the NRO, check the target metadata and runtime library selection. If the app opens but no frame appears, log each graphics initialization call and its result.

Continue with [Build your first app](/docs/first-application/) for the original status diagnostic, then [Debugging and testing](/docs/debugging/) for a subsystem-by-subsystem workflow.
