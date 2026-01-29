# SlideFlow 動態投影片發現 (Dynamic Discovery via Vite Plugin)

## 目標描述 (Goal Description)
移除需手動執行的 `gen_manifest.py` 與靜態 `manifest.json`，改用 **Vite Plugin** 在開發與構建階段自動掃描 `public/sliders` 目錄，動態生成投影片結構資料。

## 待修改變更 (Proposed Changes)

### 1. 移除舊機制
- 刪除 `tools/gen_manifest.py`。
- 刪除 `public/sliders/manifest.json` (若存在)。

### 2. 建立 Vite Plugin (`plugins/vite-plugin-slides.js`) [NEW]
- **功能**:
    - 掃描 `public/sliders` 目錄。
    - **Card 生成**:
        - 讀取 `config.json` (取得 title, orient, subgroup)。
        - 尋找 `cover.*`，若無則取第一張圖片作為封面。
    - **Slider 生成**:
        - 收集目錄下所有圖片 (排除 cover)。
    - **虛擬模組**: 提供 `virtual:slides` 供前端引用。
    - **HMR**: (Optional) 監聽目錄變更觸發熱更新。

### 3. 設定 (`vite.config.js`)
- 引入並註冊 `SlideLoaderPlugin`。

### 4. 前端整合 (`src/stores/slide.js`)
- 移除 `fetchManifest` (不再請求 JSON)。
- 改為直接導入: `import slidesData from 'virtual:slides'`.
- Store 初始化時直接使用 `slidesData`。

### 5. 導航與網址同步 (Navigation & URL Sync) [NEW]
- **SlideViewer.vue**:
    - 監聽 `currentSlideIndex` 變更，同步更新 URL Query (例如 `?slide=3`)。
    - 初始化時讀取 URL Query 跳轉至指定頁面。
    - 修正最後一頁導航行為：監聽來自 Swiper 的 `reachEnd` 事件，觸發「下一章」提示。
- **SwiperComponent.vue**:
    - 增強鍵盤監聽：當嘗試在最後一頁繼續往後時，發送 `attemptNext` 事件。

### 6. 版面與路由優化 (Layout & Routing Optimization) [NEW]
- **SwiperComponent.vue**:
    - 調整容器 CSS，移除固定比例 (`aspect-*`)，改為 `w-full h-full` 以充分利用螢幕空間，讓投影片在 `object-contain` 模式下達到最大可視面積。
- **SlideViewer.vue**:
    - **Root Redirect**: 若進入 Subgroup Root (如 `AlwaysRobusInfo`) 且無 Chapter ID，自動重導向至章節列表 (`/chapters/:id`)。
    - **Default Query**: 若進入 Viewer 但無 `?slide=N` 參數，自動補上 `?slide=1`。

### 7. 焦點與邏輯修復 (Focus & Logic Fixes) [NEW]
- **SlideViewer.vue**:
    - **Auto Focus**: 當顯示 "Next Chapter" Prompt 時，自動將焦點移至 Next Chapter 按鈕，支援 Enter 操作。
    - **Chapter Logic**: 修正 `currentChapterIndex` 計算與路由響應邏輯，確保能正確跳轉至 `party` 章節 (debug 排序或 reactivity 問題)。

### 8. 建置同步與清理 (Build Sync & Cleanup) [NEW]
- **scripts/optimize-images.mjs**:
    - **Sync Clean**: 在優化結束後，遍歷 `dist/sliders`。
        - 若 `dist` 中的 WebP 對應的原始圖片 (PNG/JPG) 在 `public` 已不存在，則刪除該 WebP。
        - 若 `dist` 中存在 `Zone.Identifier` 檔案，一律刪除。

### 9. 效能優化 (Performance Optimization) [NEW]
- **scripts/optimize-images.mjs**:
    - **Resize & Quality**: 調整設定為 `resize: 1280x1280` (`fit: inside`)，`quality: 70`，以縮減檔案大小。
    - **LQIP Generation**: 為每張投影片生成縮圖 (e.g. `filename-small.webp`, width: 48px)，作為載入時的佔位符。
- **Frontend Logic**:
    - **utils/image.js**: 修改 `getImagePath` 回傳 `{ src, placeholder }` 物件結構。
        - Prod: `src` = `.webp`, `placeholder` = `-small.webp`。
        - Dev: `src` = `.png`, `placeholder` = null (或原圖)。
- **SwiperComponent.vue**:
    - 實作 **Blur-up Loading**: 優先顯示模糊的 Placeholder，圖片載入完成後淡入主圖。

### 10. 進階顯示與手機支援 (Advanced Display & Mobile Support) [NEW]
- **scripts/optimize-images.mjs**:
    - **Image Gen Update**:
        - Limit Max Size: 1920x1920 (`fit: inside`), Quality 75.
        - Generate `mobile.webp` (800w) and `tiny.webp` (20px, LQIP).
- **Backend Logic (Build)**:
    - Main output: `desktop.webp` (1920w), `mobile.webp` (800w), `tiny.webp` (20px). (Replaces old `-small` naming if needed, or mapping strategy).
- **utils/image.js**:
    - Return `srcset` object: `{ src, srcset, placeholder }`
    - `srcset`: "mobile.webp 800w, desktop.webp 1920w".
- **SwiperComponent.vue**:
    - **Multi-resolution**: Use `srcset` or `picture` element for responsive loading.
    - **Lazy Loading**: Integrate `Intersection Observer` logic to trigger image loading only when slide is near viewport (if `loading="lazy"` insufficient or for explicit placeholder swap control).
    - **Mobile Rotation**:
        - Detect if device is mobile (`< 768px`) + Fullscreen mode.
        - If image aspect ratio (or `orient`) mismatches viewport aspect ratio (e.g. Landscape Image on Portrait Phone), apply CSS `transform: rotate(90deg)` to maximize screen usage.

### 11. 影像策略精煉 (Refining Image Strategy) [NEW]
- **scripts/optimize-images.mjs**:
    - **Simplification**:
        - Remove distinct `mobile` (800px) generation.
        - Use `1920px` (Q75) for both Desktop and Mobile.
        - Increase LQIP size to `200px` (rename/use as `-small.webp`).
- **utils/image.js**:
    - Remove `srcset`. Return `{ src: '1920w', placeholder: '200w' }`.
- **SwiperComponent.vue**:
    - Remove `srcset` binding.
    - Continue utilizing Lazy Loading & Mobile Rotation.

## 驗證計畫 (Verification Plan)
1. **Build**: `npm run build`
    - Check output: `dist/sliders` should contain `*.webp` (1920) and `*-small.webp` (200).
    - Check absence of `*-mobile.webp` and `*-tiny.webp`.
2. **Review**: `npm run preview`
    - Verify image quality and loading behavior.
