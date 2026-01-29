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

## 驗證計畫 (Verification Plan)
1. **Dev**: `npm run dev`
    - 檢查 URL 是否隨投影片切換變更。
    - 重新整理頁面，檢查是否停留在同一張投影片。
    - 在最後一頁按右鍵/下鍵，檢查是否跳出提示。
    - 點擊「Next Chapter」檢查是否正確跳轉。
    - 訪問 `/viewer/AlwaysRobusInfo` -> 應跳轉至 `/chapters/AlwaysRobusInfo`。
    - 訪問 `/viewer/AlwaysRobusInfo/202601` -> 應變成 `.../202601?slide=1`。
    - 檢查投影片是否填滿可用空間。
    - 檢查 Prompt 出現時，按 Enter 是否觸發 Next Chapter。
    - 檢查 `202601` -> `party` 是否正常跳轉。
2. **Build Sync**:
    - 建立 `public/sliders/test_del.png`，執行 `npm run build`。
    - 確認 `dist/sliders/test_del.webp` 存在。
    - 刪除 `public/sliders/test_del.png`，再次執行 `npm run build`。
    - 確認 `dist/sliders/test_del.webp` 已被刪除。
