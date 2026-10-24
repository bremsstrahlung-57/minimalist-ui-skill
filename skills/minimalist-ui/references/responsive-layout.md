# Responsive layout by content

Read when choosing geometry, adapting dense views, or fixing small-screen behavior. No section sequence or device breakpoint is mandatory.

## Choose geometry for the task

- Reading: constrain prose to a comfortable measure, roughly 45–75 characters per line; let figures and code be wider.
- Discovery: use useful scan patterns; repeat cards only for genuinely comparable items.
- Transactions: keep choices, costs, validation, and next action together.
- Tools: allow enough width for data and local actions; use panes only when they improve orientation.

Share outer gutters and alignment. Set breakpoints when actual content crowds rather than following device labels.

## Reflow

| Element | Narrow-screen treatment |
| --- | --- |
| Split introduction | Stack in meaningful reading order; keep action near its explanation |
| Multi-column list | Reduce columns without tiny cards or clipped labels |
| Side navigation | Use accessible disclosure or in-flow navigation; show current location |
| Form row | Stack labels/fields; retain help and error association |
| Toolbar | Wrap or prioritize; group secondary actions only when discoverable |
| Data table | Preserve key columns or provide a labelled local scroll region; don't shrink type |
| Dialog | Fit viewport, scroll content, keep close action reachable |
| Decorative frame | Reduce padding or remove the frame before squeezing content |

Keep DOM and keyboard order meaningful. CSS reordering must not make the visible sequence differ from the assistive sequence.

## Intrinsic sizing

Prefer fluid layout over fixed widths. Use `min-width: 0` on shrinking flex/grid children and `minmax(0, 1fr)` for tracks that must not expand to an unbroken value. Wrap long URLs or identifiers locally; do not break ordinary words site-wide. Reserve media dimensions and preserve important detail. Never hide page-wide overflow to conceal a defect; fix the offending container and allow intentional local table/code scrolling.

## Persistent chrome

A theme switch alone does not justify a fixed footer. If a fixed bar or utility is useful, reserve its actual wrapped height and safe-area inset. Keep focused fields, validation, and primary actions clear of it, including with the on-screen keyboard. Avoid several floating controls on phones. Avoid transformed/filtered ancestors around fixed descendants because they can change containing blocks.

## Stress-test content

Test real short and long titles, translated labels, multi-line prices, missing images, empty results, and large result sets. Check around 390px, a tablet width, wide desktop, and 320px reflow plus 200% text zoom where applicable. Inspect the full page where browser rendering is available. Verify no unintended horizontal page scroll, clipping, overlap, or unreachable action. Prefer an honestly wrapped label to truncation that hides a distinction.
