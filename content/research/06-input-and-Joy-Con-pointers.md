# kaiHEN Input and Joy-Con Pointers

Controller input remains accessible through familiar libnx-style helpers, while Joy-Con mouse input adds a Switch 2-specific path. Applications should combine these into a stable action model and preserve controller navigation when a pointer is absent.

## Ordinary controller input

The `PadState` API aggregates selected controllers, records current and previous button states, and exposes button-down/button-up edges and stick positions. `padInitializeDefault` selects the usual first-player and handheld sources. [Pad state and controller helpers](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/runtime/pad.h)

Use edges for single actions such as opening a menu or confirming a dialog. Use held state for continuous movement. Implement repeat deliberately for list navigation, with an initial delay and a repeat rate, rather than executing an action once per render loop.

Map physical buttons into application actions at one boundary. This permits a consistent UI across controller types and leaves room for remapping. Test disconnect and reconnect, handheld-to-docked transitions, multiple connected controllers and a controller becoming inactive while a modal dialog is open.

## Touch and conventional mouse

Touch input and ordinary mouse APIs remain distinct from Nmouse. The HID declarations include `hidInitializeTouchScreen`, touch-state access and the conventional mouse interface. [HID touch and conventional input API](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/services/hid.h)

Design each input path with its own coordinate conversion. A touch event is expressed in a device space; a rendered UI may have letterboxing, scaled content or a viewport offset. Convert to a common logical UI space before hit testing. Keep one source of truth for that transform so drawing and input cannot diverge.

## Joy-Con mouse through Nmouse

Nmouse supplies samples for Joy-Con and other pointer device types through a dedicated memory registration. Device identifiers are opaque values, not kernel handles or array indices. The inspected API uses a `0xC000` transfer-memory area with page alignment, supports up to two Joy-Con handles per Npad, and retains up to 16 samples per device. [Native Nmouse devices and sample memory](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch2/services/nmouse.h)

If the application supplies that memory, it must remain allocated and untouched until successful finalization. A finalization failure means the service may still own it. Treat this as a lifetime rule; freeing a buffer because shutdown “should be done” creates an asynchronous use-after-free risk.

## The PadPointer wrapper

`PadPointer` builds a higher-level pointer from a `PadState`. Initialize it with the desired logical width and height, call `padPointerUpdate` after `padUpdate`, and release it with `padPointerExit`. It follows the Joy-Con that most recently moved, scrolled or changed a button. [PadPointer public declarations](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch/runtime/pad.h)

The wrapper is an appropriate first implementation for a single visible cursor. Applications needing two independent pointers, raw sample timing or custom merging should inspect the underlying Nmouse API instead.

```text
poll lifecycle events
  -> update PadState
  -> update PadPointer
  -> convert device input to logical actions
  -> update UI state
  -> render from that state
```

Keep this ordering stable. Mixing rendering and hit testing against different input snapshots can produce clicks on a row that was not visibly selected.

## Sample history and frame stalls

The source wrapper accumulates movement from samples newer than its last sampling number, handles device changes and maintains button transitions. [Joy-Con pointer aggregation implementation](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/source/runtime/pad_pointer.c) This is useful when the application does not poll at the device's full sample rate.

A finite sample ring cannot recover an unlimited stall. Move long operations to workers and keep input polling responsive. For applications that need precise relative movement, test controlled frame stalls and inspect whether the resulting motion meets the product's requirements rather than assuming desktop mouse behavior.

## Multiple pointers and focus

Decide whether moving a pointer transfers UI focus immediately or only on click. Decide whether a controller action hides or parks the cursor. Avoid interpreting one physical gesture as two confirmations when conventional mouse, Nmouse and controller paths overlap.

For multiplayer tools, associate a pointer with a player or input source explicitly. Do not infer identity from a raw handle's numeric value. On disconnect, release pressed state and preserve the user's current task.

## Button mappings and unknown fields

Nmouse exposes button configuration structures, but the header explicitly leaves some source-button meanings and fields unestablished. [Native Nmouse devices and sample memory](https://github.com/ouncebrew/libounce/blob/9382b1ec48ac5dabdaf52f1f99e0c0aacd02cd2f/nx/include/switch2/services/nmouse.h) Keep unknown bits as unknown. Build a diagnostic view that records the observed device type, sample number, movement and recognized buttons, then validate mappings on real controllers.

This is especially important for a UI that uses shoulder buttons for pointer clicks while also supporting controller navigation. A mapping that works for one Joy-Con side may be inappropriate for the other.

## Input acceptance matrix

| Scenario | Expected behavior |
| --- | --- |
| Handheld controller navigation | Every primary action reachable |
| Docked controller navigation | Focus visible and stable |
| One Joy-Con used as a mouse | Cursor and click operate independently of frame rate |
| Left and right Joy-Con movement | Chosen ownership policy is predictable |
| Touch on a scaled UI | Hit target matches rendered target |
| Reconnect during a held action | No stuck button or repeated confirmation |
| Slow directory or network request | Input remains usable |
| Pointer initialization unavailable | Controller fallback remains functional |

Store a short interaction trace when investigating failures. “Mouse does not work” is much less useful than a record showing valid samples but a bad viewport transform, or no handles despite successful initialization.
