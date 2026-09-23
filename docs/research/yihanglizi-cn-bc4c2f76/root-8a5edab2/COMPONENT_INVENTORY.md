# Component inventory

| Component | Structure | States |
| --- | --- | --- |
| VPNav | logo/animated wordmark, search, navigation, theme and sound controls | desktop/mobile, dropdowns, search modal |
| Wasteland shell | canvas rain, scanlines, vignette, HUD | boot/ready, time-driven background |
| Terminal hero | ASCII title, prompt, eight feed lines, two buttons | typing, scroll to quests, cipher modal |
| SYS_STATUS | operator rows, three meters and waveform | periodic telemetry |
| Quest panel | six link cards with tags and reward labels | hover/focus, navigation |
| CYBER_2048 | 4×4 board, score, knight sprite | keyboard/touch, merge, win/loss |
| SIGNAL_STREAM | animated marquee | continuous ticker |
| Vim bar/footer | editor status and copyright | static/link hover |
| STARLIGHT_OBS | hero, galaxy canvas, Dipper and zodiac wheel | theme choice, drag/click/scroll |

Markup was captured from the original server rendering for the default page and from the hydrated starry state for the alternate theme. Data attributes preserve the original scoped CSS selectors.
