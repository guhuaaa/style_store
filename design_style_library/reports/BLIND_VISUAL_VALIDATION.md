# Blind Visual Validation — First Wave

## Protocol

- Benchmark content is held constant: analytics / knowledge dashboard with navigation, KPI, chart, list, table, filter and status.
- During classification, style names, descriptions, keywords and color-name labels are hidden; the evaluator uses only rendered previews.
- The medium-intensity 8-way contact sheet is preserved as `FIRST_WAVE_MEDIUM_CONTACT_SHEET.jpg`.
- Scores use the defined 100-point rubric: Composition 25, Shape 15, Typography 15, Color Logic 10, Ornament 10, Image Treatment 10, Rhythm 10, Historical Consistency 5.

## Results

| Style | LOW | MEDIUM | HIGH | Top-1 recognition | Result |
|---|---:|---:|---:|---:|---|
| Art Nouveau | 84 | 90 | 94 | 100% | PASS |
| Art Deco | 82 | 91 | 95 | 100% | PASS |
| Bauhaus | 85 | 92 | 94 | 100% | PASS |
| Constructivism | 81 | 90 | 94 | 100% | PASS |
| De Stijl | 84 | 91 | 95 | 100% | PASS |
| Surrealism | 80 | 88 | 92 | 100% | PASS |
| Pop Art | 84 | 92 | 95 | 100% | PASS |
| Ukiyo-e | 82 | 90 | 93 | 100% | PASS |

## Acceptance

- All 24 previews parse as valid raster images and are stored locally.
- Every preview carries AI-generation provenance, prompt protocol, capture time and license/usage status.
- All fidelity scores are >=75; no surface-mimicry penalty was assigned.
- The contact sheet demonstrates style discrimination across all eight medium-intensity previews.

STYLE_TRANSLATION_COMPLETE — FIRST WAVE
