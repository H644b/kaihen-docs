# kaiHEN Files Networking Audio and Video

Most useful applications combine file access with one or more asynchronous systems. Keep storage, networking, audio and decoding behind separate interfaces so each can be diagnosed and shut down independently.

## Filesystem access

libounce supplies the familiar FS service and newlib device layer. Under kaiHEN, the initialized FS proxy override has special identity semantics, so use the library initialization path rather than reinitializing a borrowed root manually. [FS initialization and proxy identity](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/services/fs.c) The filesystem device implementation adapts operations into standard file APIs. [Standard filesystem device adapter](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/runtime/devices/fs_dev.c)

Use `romfs:/` for read-only packaged data after mounting RomFS, and an application-specific `sdmc:/switch/<app>/` directory for state. These names are mount conventions. They do not impose access restrictions on code that has broader service access. [RomFS mount API](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/runtime/devices/romfs_dev.h)

For settings, use a versioned file format and bounds-checked parsing. Write a new version to a temporary file, flush and close it, then replace the old file through a carefully checked sequence. Validate replacement and durability behavior on the actual filesystem; a rename by itself is not a proof of crash-safe persistence.

Keep logs, caches, user documents and migration backups in distinguishable locations. Limit cleanup routines to their own generated paths. A file browser should normalize paths and distinguish navigation from an operation's intended destination before beginning a copy or delete.

## Storage test cases

Test no writable destination, full storage, an interrupted write, a corrupt configuration, an unexpected filename, a directory where a file is expected, and a large asset that cannot fit in memory. For copy operations, compare byte counts and a hash when correctness matters. Do not label a transfer complete merely because a socket closed or a progress bar reached its predicted total.

For game-related tools, keep save handling and raw storage operations separate from ordinary application files. This pack does not establish that any particular save operation is safe for every title. A general-purpose utility should expose a narrow task rather than enabling raw system writes as part of routine startup.

## Network initialization

The runtime exposes `socketInitializeDefault` and `socketExit`, while NIFM provides network-service functionality. [Socket runtime initialization](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/runtime/devices/socket.h) [Network interface service API](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/services/nifm.h) A project using these APIs still needs to verify the requested services under its runtime and host-title combination.

Design network operations with explicit timeouts, cancellation and bounded buffers. Distinguish name-resolution errors, connection failures, protocol errors and server-side rejection. Network loss should leave local documents and settings consistent.

Do not run a blocking connect, receive or TLS handshake on the UI thread. Give each request an ownership model: which thread may cancel it, which object receives completion, and whether the result can arrive after the screen has changed. This prevents a stale completion callback from accessing freed application state.

## Development file transfer

OunceShell bundles an FTP server and a file manager. Its Switch 2 port adapts networking and filesystem functions through a platform layer. [OunceShell project and upstream context](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/README.md) [Network compatibility layer](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/switch2/src/psp2_net.c) It is a practical way to copy application builds and retrieve logs when the environment is already running.

For a development loop, upload to a temporary filename, verify the transfer, then make the final name visible. Keep the previous known-good NRO until the new build has launched and exited. Transfer transport and application correctness are separate checks.

Use a network you control for development services. If the application exposes a listener, define its bind address, authentication and permitted operations explicitly. Avoid a general remote command channel when the product only needs a fixed set of file or diagnostic requests.

## HTTP and TLS dependencies

An HTTP client library compiling from portlibs does not prove certificate validation, clock handling, entropy or TLS backends work on the target. For a networked product, test an expected valid certificate, an expired certificate, a hostname mismatch and a disconnected network. Preserve verification errors rather than disabling checks to make a request succeed.

The exact HTTPS library and certificate-store solution are application choices requiring their own validation. The core kaiHEN sources inspected here do not define a universal web-client configuration. A local-only application can avoid that dependency entirely.

## Audio path

The Switch 2-specific `aud:u` root supplies AudioOut and AudioRenderer managers. libounce routes its `audout` and `audren` initialization through that root for native Switch 2 builds, preserving higher-level API names while changing service acquisition. [Native audio manager root](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch2/services/audu.h) [AudioOut native service selection](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/services/audout.c) [AudioRenderer native service selection](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/services/audren.c)

For a new application, prove one short PCM output before adding decoding, mixing, effects or streaming. Check returned sample rate, channel layout and format rather than assuming the requested values were selected. Retain buffers until the service reports that they are no longer in use.

For streaming audio, use a bounded ring buffer and measure underruns. Separate decoding from the real-time consumption path. Avoid allocation, filesystem scans or network waits in an audio callback. During shutdown, stop consumption before freeing buffers and join any thread that can still submit audio.

OunceShell includes a Vita audio compatibility layer implemented with SDL audio. It is a useful example of adapting an existing application-level API instead of porting the original device code directly. [SDL audio compatibility layer](https://github.com/kurumuz/ounceshell/blob/cb4c4ada491b4e0eb17f4d0419661095f96844e6/switch2/src/vita_audio_sdl.c)

## Hardware video decoding

libounce exposes a `VideoDecoder` abstraction over native services. It owns service sessions, work memory and output images, and returns NV12 frames with explicit release. The declared aggregate pixel-rate limit is `248832000` pixels per second, with a per-decoder frame-rate ceiling of 60. AV1 uses block-linear output in the documented path. [High-level hardware video decoder API](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch2/video/decoder.h)

The lower-level codec enum includes H.264, VP9, AV1 and VP8; it does not establish support for every profile or an undeclared codec. [Decoder codecs and low-level image API](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch2/services/viddec.h) A demuxer, container parser, network transport, A/V clock and presentation pipeline remain application responsibilities.

A 4K decoder is a substantial memory consumer: the header's documented working-memory examples are roughly 272 MiB for pitch-linear and 308 MiB for block-linear, plus output images. These are examples tied to the current implementation, not a universal allocation formula. [High-level hardware video decoder API](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch2/video/decoder.h)

Start media experiments with a small, known encoded sample, then add demuxing and sustained playback. Record codec, profile, dimensions, frame rate, timestamps, output layout and decoder result. A single decoded frame does not prove seeking, end-of-stream handling or long playback.

## Backpressure and synchronization

If every output image is held, a decoder cannot continue producing frames. Release frames promptly after consumption, and synchronize image access before returning them. The native graphics/video interface exposes producer and consumer synchronization concepts; ignoring those lifetimes can produce corruption that resembles a decoder failure. [Graphics image and synchronization API](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch2/services/gsv.h) [Decoder synchronization and lifetime implementation](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/switch2/video/decoder.c)

For an initial player, a CPU copy into a conventional texture may simplify validation at the cost of bandwidth. A zero-copy path needs verified layout compatibility, synchronization and ownership across decoding and rendering. Do not advertise it based only on the presence of image IDs or GPU addresses.

## Integrated shutdown order

For a streaming player: stop network input, stop creating new decode work, drain or cancel the pipeline, release outstanding video frames, stop audio consumption, join workers, close decoder and graphics resources, then close sockets and files. The precise sequence depends on which subsystem owns each buffer. Write that ownership down before implementing recovery from a disconnect.
