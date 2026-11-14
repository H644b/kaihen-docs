# Native Application Hardware Test Record

This is a blank template. No outcome is implied by its presence.

## Environment

- Date and timezone:
- Console firmware and how it was verified:
- Host game and revision:
- Acquisition route and revision:
- kaiHEN release:
- HEN protocol and startup result:
- Devkit and library revisions:
- Application commit and NRO SHA-256:
- Display mode and actual drawable extent:
- Controller and pointer devices:
- SD filesystem and relevant free space:
- Network topology when relevant:

## Scenarios

| Scenario | Expected behavior | Observed behavior | Result and evidence |
| --- | --- | --- | --- |
| Native launch | Application starts | | Not run |
| Controller interaction | Primary workflow reachable | | Not run |
| Optional pointer or touch | Correct coordinate mapping | | Not run |
| Representative content | Correct application behavior | | Not run |
| Graphics and audio | No observed corruption or underruns | | Not run |
| Missing or corrupt input | Recoverable error | | Not run |
| Network loss if used | Cancellation and consistent state | | Not run |
| Normal exit | Usable hbmenu | | Not run |
| Relaunch same app | Clean second launch | | Not run |
| Launch unrelated app | No leaked state blocks it | | Not run |
| Sustained workload | Recorded duration and metrics | | Not run |

## Failure record

- First failing operation and raw result:
- Reproduction steps and frequency:
- Relevant log paths:
- Last known-good artifact:
- Cleanup outcome and any unresolved state:

## Conclusion

State only what the observed scenarios establish. Preserve untested features as untested.
