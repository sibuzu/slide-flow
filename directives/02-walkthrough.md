# SlideFlow 開發與重構紀錄 (Walkthrough)

## 最新更新：Fix - 路由模式切換 (Router Hash Mode)

**問題**: 使用 `createWebHistory` 搭配相對路徑 `base: './'` 時，若使用者在巢狀路由 (如 `/chapters/AlwaysRobusInfo`) 重新整理頁面，瀏覽器會嘗試從該層級讀取相對路徑資源 (`/chapters/assets/...`)，導致 404 錯誤。

**解決**: 改用 `createWebHashHistory` (Hash Mode)。
- 網址結構變為 `/#/chapters/...`。
- 瀏覽器始終向 `index.html` 請求資源，確保相對路徑 (`./assets/...`) 正確解析。
- **好處**: 完美支援靜態部署與相對路徑設定。

---

## 歷史更新：UI 風格重構與淺色主題 (UI Redesign)

本次更新將介面風格從深色模式重構為 **Sibuzu 風格的淺色主題 (Light Theme)**，提升專業感與閱讀體驗。

### 1. 視覺風格變更 (Visual Changes)

- **全域主題**:
    - **背景**: 改為 Slate-50 (`#F8FAFC`)，營造乾淨明亮的氛圍。
    - **文字**: 改為 Slate-800 (`#1E293B`)，搭配 Inter 字體，提升可讀性。
    - **字體**: 引入 Google Fonts `Inter`。

- **卡片設計 (HomeView & ChapterView)**:
    - **背景**: 純白 (`#FFFFFF`)。
    - **邊框**: 1px Slate-200 (`#E2E8F0`)。
    - **陰影**: 預設 `shadow-sm`，懸浮時 `shadow-xl` 並上浮 5px。
    - **圖片容器**: 底部增加 1px 邊框，強化層次感。

### 2. 功能修正 (Functional Fixes)

- **Tailwind CSS**: 降級至 v3 以確保樣式正確加載與 PostCSS 兼容性。
- **導航優化**:
    - `ChapterView` 成為 Subgroup 投影片的標準入口。
    - `SlideViewer` 在章節結尾提供明確的「下一章」引導。

### 3. 圖片優化 (Image Optimization)

- **WebP 轉換**: 
    - 實作此構建腳本 (`scripts/optimize-images.mjs`)，在 `npm run build` 時自動將 PNG 轉換為 WebP。
    - **增量構建 (Incremental Build)**:
        - 腳本會比對檔案時間戳記，若 WebP 已存在且較新，則自動跳過轉換（顯示 `s`），大幅縮短重複構建時間。
        - 設定 `vite.config.js` 之 `emptyOutDir: false` 以保留緩存。
    - 自動清理 `dist/` 中未使用的原始 PNG 檔案，顯著減少部署體積 (約減少 90%)。
- **前端適配**:
    - 實作 `getImagePath` helper，在生產環境自動切換至 `.webp`，開發環境維持 `.png`。

### 4. 動態發現 (Dynamic Discovery)

- **Vite Plugin**:
    - 實作 `plugins/vite-plugin-slides.js` 取代舊有的 Python 腳本。
    - **自動掃描**: 啟動 Dev Server 或 Build 時自動掃描 `public/sliders`。
    - **虛擬模組**: 將掃描結果封裝為 `virtual:slides`，供前端 Store 直接引入。
    - **無需手動執行**: 當新增圖片或 Config 時，重啟 Dev Server 即可生效 (Plugin 亦支援 HMR 監聽)。

### 5. 驗證結果 (Verification)

- **首頁**: 確認卡片呈現正確，無破圖或樣式跑版。
- **導航**:
    - `WalkingMap` (Flat): 點擊卡片 -> 直接進入播放器 -> 正常播放。
    - `AlwaysRobusInfo` (Subgroup): 點擊卡片 -> 進入章節列表 -> 選擇 202512 -> 正常播放。
    - **End-of-Slide**: 到達最後一張時，隱藏右箭頭 (若無下一章) 或顯示提示 (若有下一章)。
- **Build Output**: 確認 `dist/sliders` 下僅保留優化後的 WebP 檔案。
