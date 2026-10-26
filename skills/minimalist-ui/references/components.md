# Component decisions

These are adaptable treatments, not mandatory markup. Keep semantic elements and project components; map visual roles into them rather than replacing them wholesale.

- **Navigation:** use familiar labels, indicate the current destination, and keep narrow-screen navigation reachable and keyboard-operable. Add a skip link before navigation.
- **Heading and list:** use meaningful heading levels. A dashed accent underline may mark the section title. Terminal `*` marks are decorative while list semantics stay real; metadata is secondary but readable.
- **Buttons and links:** distinguish primary, secondary, and destructive purpose at rest. Dashed buttons may invert or bevel on hover, but control geometry must remain stable and hover cannot be the only affordance. Links remain visibly identifiable in body text.
- **Fields:** persistent visible labels, native types and autocomplete as appropriate. Associate help/errors with fields, set invalid state, retain input on failure, and keep focus clear.
- **Panels and callouts:** use open space and hierarchy before adding a box. A solid edge can group regular content; dashed accent is for a callout with meaning. Never put every paragraph in a panel.
- **Tables:** semantic headers and aligned figures. Solid horizontal separators; avoid borders around every cell. Wrap the table in its own labelled horizontal-scroll region on narrow screens; do not shrink text until unreadable.
- **Tabs:** use established accessible tab behavior only if the content truly switches. Otherwise use links. Keep selected state distinct from focus and hover.
- **Code:** retain copyable text, provide an intentional overflow region, and avoid decorative glyphs inside code values.
- **Dialogs:** use the existing tested overlay or native dialog. Supply an accessible name, reachable close action, Escape, focus containment, and focus restoration. Win98 chrome is optional texture only.
- **Footer bar / floating utility:** fixed chrome earns its space only when it serves a frequent setting or action. Reserve its real wrapped height and safe-area inset; keep it clear of focused fields and content. Avoid multiple floaters on phones.

- **Data surfaces:** `stats` (hairline-ruled grid, large value, small uppercase label), `bipolar` (centre-out bar for opposed pairs with a plain-language foot line), and `strip` (one cell per step, doubles as progress). Values are always real text; bars and colour are the second channel. See `craft.md`.
- **Choice cards and chips:** `choice` for pick-one answers (dashed available, solid chosen, keycap inverts) and `chip` for layer or filter toggles; both use `aria-pressed`, keep a 40px target, and never rely on tint alone.
- **Primary action:** `button--primary` keeps a hard accent offset shadow that collapses on press; hover geometry does not move.

Every relevant component state must be addressed: resting, hover, focus, active/selected, disabled, pending, empty, failure, and success. Use text/icons as well as semantic colours. See `interaction-states.md` for detailed behavior.
