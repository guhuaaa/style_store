# Pairwise Differentiation Audit

## Finding

The attached label-hidden comparison exposed a shared fallback grammar: primary-color blocks, regular pane grids, chart cards and flat dashboard composition. That makes Bauhaus, De Stijl and Pop Art visually confusable despite different labels.

## Root causes

1. **Shared benchmark overrode style structure.** The fixed dashboard content was mapped to the same equal-weight card grid.
2. **Palette was mistaken for structure.** Red, blue and yellow appeared in all three without distinct functional logic.
3. **Nearest-neighbor exclusions were absent.** Prompts stated what to add but not what each style must not resemble.
4. **Validation measured individual fidelity only.** A high single-style score did not test whether a nearby style could be mistaken for it.

## Mandatory future gate

A candidate must expose at least three style-specific structural discriminators when its name, description, keywords and color names are hidden. It is compared directly against its nearest neighbors before it can receive `STYLE_TRANSLATION_COMPLETE`.

| Candidate | Must visibly show | Must not show | Status |
|---|---|---|---|
| Bauhaus | functional asymmetry; circles plus directional geometry; color tied to task role | Mondrian-like full black grid, regular all-rectangle pane matrix, halftone/comic contour | REGENERATE |
| De Stijl | orthogonal black-rule order; large white voids; sparse primary rectangles; proportional asymmetry | circles, diagonal axes, gradients, dense multi-color charts, comic panels | REGENERATE |
| Pop Art | thick comic contour; Ben-Day field; crop/scale jump; repeated commercial-symbol rhythm | clean geometric primary-color grid, restrained functional palette, Mondrian-like composition | REGENERATE |

## Release rule

Do not use the current previews of these three styles for retrieval, training reference, or a claim of successful style translation. Regenerate LOW/MEDIUM/HIGH using `styles/generation_prompts.md`, then rerun an 8-way and nearest-neighbor blind test.
