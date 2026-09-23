# Observed behaviors

- Terminal command and brand lettering animate on load. HUD time, uptime, meter values, waveform, and throughput update periodically.
- ENTER scrolls toward the quest section; DECRYPT opens a centered blurred modal. It asks for the Caesar shift-three plaintext of `VWDB FXULRXV`; hint says first letter `S`. VERIFY shows feedback. Escape/close dismisses it.
- Quest cards slightly rise on hover and increase amber border emphasis. Links navigate to blog, tech notes, life notes, friends, tools, and about.
- The background button opens a two-choice popover (`⚡ 赛博编程`, `✦ 星空极光`); selecting a choice changes backdrop. Sound opens a popover with interaction sound, background music and volume controls.
- Search button/Ctrl+K opens the VitePress local search modal. Nav social menu expands to tech and life pages. Mobile menu reveals the same links.
- 2048 uses arrow keys/WASD and touch swipes, updating tiles and scores; a pixel knight appears to the right of the board. Tile positions use absolute percentage coordinates over a 4×4 background grid.
- Skill ticker scrolls horizontally continuously. Scanline, matrix rain and cursor blink are time driven. No section switches as a function of scrolling.
- At 1440 px, HUD width 1180 px and hero is approximately 645/464 px columns with 25.6 px gap; quest grid has two 559.6 px columns. At 768 and 390 px, hero and quest cards stack; the mobile terminal buttons stack.
