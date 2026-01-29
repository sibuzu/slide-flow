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

## 驗證計畫 (Verification Plan)
1. **Dev**: `npm run dev` -> 確認首頁能顯示 AlwaysRobusInfo 與 WalkingMap (資料來自 Plugin)。
2. **Build**: `npm run build` -> 確認構建過程 Plugin 能正確生成資料。
3. **Preview**: `npm run preview` -> 確認 WebP 優化與動態資料整合正常。
