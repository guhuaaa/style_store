# Generation Prompt Protocol

All final previews use the same fixed Analytics / Knowledge Dashboard benchmark. Each request is intentionally short to reduce backend timeouts and is generated one style × one intensity at a time.

## Shared constraints

`16:10 front-facing flat desktop UI; abstract charts/table/KPI/filter/status; no readable text; no people; no device mockup; no watermark.`

## DNA prompt rule

Use each style's `STYLE_DNA.md` CORE rules to specify composition, shape, color logic and rhythm. LOW keeps product structure with restrained DNA; MEDIUM changes layout and components; HIGH lets the DNA dominate composition while preserving dashboard affordances. Do not prompt only with a historical style name.

## Pairwise differentiation gate

Before generation, include the candidate's **required structural signature** and its nearest-neighbor **negative constraints**. After generation, hide all labels and reject an asset unless it has at least three visible structural discriminators from every nearest neighbor.

| Style | Required signature | Veto / nearest-neighbor exclusion |
|---|---|---|
| Bauhaus | asymmetric functional geometry; at least one circle and one non-orthogonal directional relationship; color assigned to task role | Reject a regular Mondrian-like black grid, all-rectangle pane matrix, decorative halftone or comic contour. |
| De Stijl | orthogonal black-rule composition; large white field; only a few primary rectangular planes; asymmetry through proportion | Reject circles, diagonal axes, gradients, halftone, speech-bubble panels, dense multi-color chart decoration. |
| Pop Art | thick comic contour; Ben-Day/halftone field; crop/scale jump; repeated commercial-symbol rhythm; irregular comic framing | Reject a clean geometric primary-color grid, restrained functional color coding, or a Mondrian-like rectangle composition. |

## Generated asset policy

Images are stored locally as research previews. Historic references remain separately recorded as museum/institution pages; these generated previews do not contain downloaded third-party reference images.
