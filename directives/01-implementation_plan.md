# SlideFlow Implementation Plan

## Goal Description
Build a lightweight, mobile-first slide presentation platform "SlideFlow". Key features include directory-based slide indexing, configuration via `config.json`, orientation support (portrait/landscape), subgroup navigation, and a Python tool for PDF-to-image conversion.

## User Review Required
> [!IMPORTANT]
> - Confirm if `uv` is the desired Python package manager (Spec mentions `uv venv`).
> - Confirm the target directory structure for the Vue app (Root or subfolder?). Assumed root of `slide-flow` since `directives/` is there.

## Proposed Changes

### Environment & Tooling (Python)
#### [NEW] [convert_pdf.py](file:///home/jack/git/antigravity/slide-flow/tools/convert_pdf.py)
- script to convert PDF to images using `pdf2image`.
- Arguments: input file, output directory, DPI.
- Auto-naming: `01.png`, `02.png`...

#### [NEW] [gen_manifest.py](file:///home/jack/git/antigravity/slide-flow/tools/gen_manifest.py)
- Scans `public/sliders` (or user defined path).
- Reads `config.json`.
- Generates `manifest.json`.

### Frontend Setup (Vue 3 + Vite + Tailwind)
#### [NEW] [package.json](file:///home/jack/git/antigravity/slide-flow/package.json)
- Vue 3, Vite, Tailwind CSS dependencies.
- Scripts for dev, build.

#### [NEW] [index.html](file:///home/jack/git/antigravity/slide-flow/index.html)
- Entry point.

#### [NEW] [src](file:///home/jack/git/antigravity/slide-flow/src)
- `App.vue`: Main layout.
- `main.js`: Bootstrap.
- `router/index.js`: Routes for `/`, `/viewer/:id`.
- `stores/slide.js`: Pinia store for manifest data.
- `components/SwiperComponent.vue`: The slide viewer.
- `components/NavigationOverlay.vue`: Quick nav for subgroups.

## Verification Plan

### Automated Tests
- Run `python tools/convert_pdf.py` on a dummy PDF and check output images.
- Run `python tools/gen_manifest.py` and check `manifest.json` structure.
- Run `npm run dev` and verify localhost access.

### Manual Verification
- **Slide Navigation**: Check swipe gesture and button navigation.
- **Orientation**: Verify `aspect-video` vs `aspect-[9/16]` application.
- **Subgroup**: Verify overlay appears at end of chapter.
