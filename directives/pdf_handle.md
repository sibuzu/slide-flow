# Handle PDF Conversion in Public Directory

## Requirements

1.  Check if PDF is already converted.
2.  Conversion should occur in the same directory, creating a folder with the same name as the PDF (excluding `.pdf`).
3.   The folder must contain `config.json` and `cover.webp`.
4.  `config.json` content:
    ```json
    {
        "title": "pdf_name_without_extension",
        "orient": "landscape"
    }
    ```
6.  `cover.webp` is the first page of the PDF.
7.  Convert PDF to individual images in the folder with filenames `{pdf_name}-001.webp`, `{pdf_name}-002.webp`, etc.
    -   **Format**: WebP
    -   **Max Width**: 1920px (maintain aspect ratio)
    -   **Quality**: 75
    -   **Method**: 6
8.  Skip if already converted (existence of `config.json` and `cover.webp`).

## Implementation Plan

The goal is to automatically process PDF files located in the `public` directory. The script will check if they are already converted, and if not, generate the required directory structure, images, and config file.

### Proposed Changes

#### Tools

#### [MODIFY] [convert_pdf.py](file:///home/jack/git/antigravity/slide-flow/tools/convert_pdf.py)

- Update the script to:
    1.  Recursively scan for `*.pdf` files in the `public` directory (including subdirectories).
    2.  For each PDF found:
        -   Define output directory: `{pdf_dir}/{filename_without_ext}` (same directory as the PDF).
        -   Check existence of `config.json` and `cover.webp` in that directory.
        -   If missing:
            -   Create directory if not exists.
            -   Convert pages to WebP using `pdf2image`.
            -   Save first page as `cover.webp`.
            -   Save all pages as `{filename_without_ext}-{page_num:03d}.webp`.
            -   Write `config.json` with `{"title": "...", "orient": "landscape"}`.

### Verification Plan

#### Automated Tests
- Create a dummy PDF in `public/test_slide.pdf`.
- Run `python3 tools/convert_pdf.py`.
- Verify:
    -   Directory `public/test_slide` exists.
    -   `public/test_slide/config.json` exists and content is correct.
    -   `public/test_slide/cover.webp` exists.
    -   Images `public/test_slide/test_slide-001.webp` etc. exist.
- Run script again to verify it detects existing conversion and skips.