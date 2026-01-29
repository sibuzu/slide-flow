---
name: SlideFlow Development Guidelines
description: Standard operating procedures, rules, and workflows for developing the SlideFlow project. Include this skill to understand project structure and constraints.
---

# SlideFlow Development Guidelines

This skill encapsulates the development rules, project structure, and workflows for the SlideFlow project, based on `directives/DesignSpec.md`.

## 1. Core Principles (Design Philosophy)
- **Data-Driven**: Content is defined by directory structure and `config.json`.
- **Mobile-First**: Optimized for touch interaction (Swiper.js).
- **Lightweight**: Static site generation, minimal backend dependencies (only build tools).

## 2. Global Rules (CRITICAL)
1. **Python Environment**: Use `uv` for virtual environment management (`uv venv`).
2. **Documentation**: All artifacts (Implementation Plan, Task List, Walkthrough) must be stored in `directives/` with sequential prefixes (e.g., `01-task.md`).
3. **Language**:
   - **Reasoning/Planning/Explanation**: Traditional Chinese (繁體中文).
   - **Commit Messages**: Detailed Traditional Chinese (繁體中文).
   - **Code**: English.
4. **Shell Execution**: **You must obtain explicit user consent before executing any shell command that modifies the project (files, git state, build artifacts, etc.).**
5. **Project Documentation**: Maintenance of `README.md` with build/deploy instructions is mandatory.

## 3. Technology Stack
- **Frontend**: Vue 3 + Vite + Tailwind CSS (v3).
- **Slide Engine**: Swiper.js (with Navigation, Pagination, Keyboard modules).
- **Backend/Tools**: Python (`pdf2image`, `Pillow`) for content generation.

## 4. Directory Structure & Content
- `public/sliders/`: Root for slide content.
- `tools/`: Python helper scripts (`convert_pdf.py`, `gen_manifest.py`).
- `src/`: Vue source code.

### Content Structure
- **Flat (Single Presentation)**:
  ```
  /sliders/topic-a/
    ├── config.json ({"subgroup": false, ...})
    ├── cover.png
    ├── 01.png
    └── ...
  ```
- **Subgroup (Chapters)**:
  ```
  /sliders/topic-b/
    ├── config.json ({"subgroup": true, "chapters": [...]})
    ├── cover.jpg
    ├── chapter-1/
    └── chapter-2/
  ```

## 5. Navigation Flow
1. **Home (`/`)**: Displays cards for top-level items.
   - Click Flat Item -> Go to `SlideViewer` (`/viewer/:id`).
   - Click Subgroup Item -> Go to `ChapterView` (`/chapters/:id`).
2. **Chapter View (`/chapters/:id`)**: Displays cards for chapters within a subgroup.
   - Click Chapter -> Go to `SlideViewer` (`/viewer/:id/:chapterId`).
3. **Slide Viewer**:
   - **Last Slide Behavior**:
     - Normal display (no auto-darken).
     - **If Next Chapter exists**: Show "Next Chapter" prompt on request.
     - **If End of Deck**: Hide "Next" navigation arrow.

## 6. Workflows

### Adding New Content
1. Convert PDF to images using `tools/convert_pdf.py`.
2. Place images in `public/sliders/<topic>/`.
3. Create `config.json` defining title, orientation, and structure.
4. Run `python tools/gen_manifest.py` to update the index.

### Development Loop
1. `npm run dev` for local server.
2. `npm run build` & `npm run preview` for production verification.

## 7. Artifact Management
When starting a new task:
1. Create/Update **Implementation Plan** in `directives/xx-implementation_plan.md`.
2. Create/Update **Task List** in `directives/xx-task.md`.
3. After completion, create **Walkthrough** in `directives/xx-walkthrough.md`.
*All in Traditional Chinese.*
