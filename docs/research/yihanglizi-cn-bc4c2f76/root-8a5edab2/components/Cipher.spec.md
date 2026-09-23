# Cipher Dialog Specification

- **Target:** `ClientEnhancements.tsx` / `enhanceCipher`.
- **Interaction model:** click, keyboard Enter/Escape and overlay click.
- **Structure:** `.cipher-mask > .cipher-modal`, head/close button, Caesar shift explanation, ciphertext, input, result, VERIFY/HINT controls.
- **Text:** `DECRYPT.exe`, `凯撒密码 / shift = 3`, `solve>`, `[ VERIFY ]`, `[ HINT ]`; captured puzzles include `VWDB FXULRXV` → `STAY CURIOUS` and `NHHS FRGLQJ` → `KEEP CODING`.
- **Styles:** original source stylesheet supplies the modal colors, borders, padding and blurred fixed overlay via `data-v-fcc15a3a`. The source screen shows a centered roughly 520px wide amber bordered dialog.
- **Behavior:** close via ×, outside click or Escape; hint shows first plaintext letter; verification ignores case and spaces and shows success/error text.
- **Responsive:** original CSS scales the modal to the viewport width.
