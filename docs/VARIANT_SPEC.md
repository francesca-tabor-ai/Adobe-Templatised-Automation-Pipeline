# Variant specification (variation contract)

This document defines what can change and what cannot in templatized creative output, so that legal, brand, and creative can sign off before production.

## Locked elements (do not vary by variant)

- **Logo**: position, size, and usage (no alternate logos unless in the permitted set).
- **Disclaimer placement**: area and minimum size; content may vary by `legal_disclaimer_id` only.
- **Brand typography**: typeface, hierarchy rules, and safe zones (margins, bleed) are fixed in the template.
- **Safe zones**: all variable text and key visuals must remain within the defined safe area.

## Variable elements (driven by dataset)

| Field | Description | Notes |
|-------|-------------|--------|
| headline | Main copy | Max length per language (see boundaries). |
| subheadline | Supporting copy | Optional. |
| cta | Call-to-action | Button or link text. |
| legal_disclaimer_id | Reference to approved disclaimer text | Resolved from disclaimer library. |
| product_image_id | Asset ID for product image | Mapped to file path via config. |
| background_image_id | Asset ID for background | Mapped to file path via config. |
| market | Market code | e.g. US, DE, FR. |
| language | Language code | e.g. en, de, fr. |
| channel | Delivery channel | e.g. print_a4, social_1_1. |
| size / aspect_ratio | Output dimensions | From channels config. |
| end card (motion) | End card variant | For After Effects only. |

## Variant boundaries

- **Max characters per field per language**: Templates must define (and enforce where possible) maximum lengths to avoid overset or overflow. Example: headline en 60 chars, de 50 chars (longer words).
- **Permitted claim set per market**: Only claims that are approved for a given market may appear; `compliance_version` and `legal_disclaimer_id` tie to approved copy.
- **Variant ID**: Every output is tied to a unique `variant_id` for traceability and approval.

## Approval and compliance

- **approved** (boolean): Only variants with `approved === true` should be rendered when using `--approved-only`.
- **compliance_version**: Identifies which set of legal/claim rules was used; required for audit.

## A/B testing (optional)

- **hypothesis_id**: e.g. `H1_HookBenefitVsCuriosity`.
- **variable_changed**: e.g. `headline_style`.
- Keep other elements constant so tests are not confounded.
