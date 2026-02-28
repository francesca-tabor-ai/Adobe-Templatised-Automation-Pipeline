# Template specification (per-app)

Rules for building InDesign, Photoshop, and After Effects templates so the pipeline scripts can merge, substitute, and export correctly.

---

## InDesign

### Data Merge setup

- **Master document**: One or more pages with merge fields (e.g. `<<headline>>`, `<<cta>>`) or **named text frames** whose names match CSV column headers (e.g. `headline`, `cta`, `legal_disclaimer_id`). The scripts use Data Merge with a CSV; column headers must match merge field names or the text frame names you use.
- **Recommended**: Use a single master page with text frames named exactly as the CSV columns: `variant_id`, `headline`, `subheadline`, `cta`, `legal_disclaimer_id`, etc.
- **Data source**: CSV with header row; encoding UTF-8. Delimiters: comma; use double quotes for fields containing commas.

### Layout and typography

- **Locked layers**: Keep logo, brand elements, and disclaimer *area* on locked layers so they are not moved during merge.
- **Paragraph and character styles**: Assign styles to each variable text frame so typography is consistent and you can define fallback font sizes for long copy.
- **Overset handling**: Define maximum copy lengths per field per language in [VARIANT_SPEC.md](VARIANT_SPEC.md). In the template, use a single text frame per variable; if copy can overflow, consider a smaller default font size or an alternate layout (script may detect overset in preflight).

### Preflight expectations

- **Disclaimer**: The preflight script looks for a text frame whose name or contents contain `disclaimer`. Ensure at least one such frame exists and is populated by the merge (e.g. from `legal_disclaimer_id` or a resolved disclaimer text column).
- **Bleed and fonts**: Set document bleed as required; embed or subset fonts. The preflight checks for missing fonts and optional bleed.

### Export

- Script exports one PDF per record (one page per record in the merged document). PDF export uses the application’s current PDF export preferences; set preset (e.g. Press Quality) before running or in script if supported.

---

## Photoshop

### Layer naming

Use consistent, script-friendly names so the batch script can find layers:

- **Smart Objects (replaceable images)**:
  - `BACKGROUND_SMART` or `background` → replaced by `background_image_id` (resolved to file path via config or `assets/{id}.jpg`).
  - `PRODUCT_SMART` or `product` → replaced by `product_image_id`.
- **Text layers**:
  - `HEADLINE_TEXT` or `headline` → `headline`
  - `CTA_TEXT` or `cta` → `cta`
  - `DISCLAIMER_TEXT` or `disclaimer` → disclaimer text or `legal_disclaimer_id`

Names are matched case-insensitively; the script searches by substring (e.g. “headline” in the layer name).

### Smart Objects

- Convert replaceable image layers to Smart Objects. The script uses Photoshop’s `placedLayerReplaceContents` to swap content by file path.
- Supported file types: PSD, TIF, JPG, etc. Paths are resolved from `config/defaults.json` (`productImageMap`, `backgroundImageMap`) or from `assets/{id}.jpg` by default.

### Export

- Script exports one PNG per variant to `output/photoshop/{variant_id}.png`. For multiple sizes/channels, extend the script to duplicate artboard or resize and export per channel (see [config/channels.json](../config/channels.json)).

---

## After Effects

### Composition and layers

- **Main comp**: One composition per aspect ratio (e.g. `Comp_16x9`, `Comp_1x1`, `Comp_9x16`) or a single comp. The script selects comp by `aspect_ratio` and a channel map in [config/channels.json](../config/channels.json).
- **Text layers**: Name layers so the script can find them: e.g. `HEADLINE`, `CTA`, `DISCLAIMER` (or “headline”, “cta”, “disclaimer”). The script sets **Source Text** on these layers from the variant record.
- **Essential Graphics**: If you use Essential Graphics (MOGRT) panels, you can extend the script to set EG properties; the current implementation sets text via the text layer’s Source Text property.

### Data feed

- **Input**: CSV or JSON. For JSON, use `data/sample/variants.json` (array of objects). For CSV, same columns as InDesign.
- **Fields used**: `headline`, `cta`, `legal_disclaimer_id`, `aspect_ratio`, `variant_id`.

### Render

- Each variant is applied to a **duplicate** of the comp (so each render has the correct text). The duplicate is added to the render queue with an output path `output/aftereffects/{variant_id}.mp4`.
- **Output module**: Script applies a template by name (e.g. `H.264`). Ensure this template exists in your AE project or use the default.
- **Duration**: Use a fixed comp duration; long copy may require alternate comps or safe-area rules (see VARIANT_SPEC).

---

## Summary

| App        | Data source   | Key naming                         | Output                    |
|-----------|----------------|------------------------------------|---------------------------|
| InDesign  | CSV            | Text frames / merge fields = columns | PDF per variant           |
| Photoshop | JSON           | Layer names: *_SMART, *_TEXT        | PNG per variant           |
| After Effects | JSON or CSV | Text layer names, comp name by ratio | MP4 per variant           |
