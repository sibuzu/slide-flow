# SlideFlow 實作演練 (Walkthrough)

## 1. 環境與建置 (Environment & Setup)
- **Python 環境**: 使用 `uv` 初始化，並安裝了 `pdf2image` 與 `Pillow`。
- **前端技術棧**: Vue 3 + Vite + Tailwind CSS (使用 Tailwind v4 指令)。
- **工具腳本**:
  - `tools/convert_pdf.py`: 用於將 PDF 轉換為圖片。
  - `tools/gen_manifest.py`: 用於建立投影片索引。

## 2. 核心功能實作 (Core Features)
### 手動投影片索引 (Manual Slide Indexing)
`gen_manifest.py` 腳本會掃描 `public/sliders/` 目錄並生成 `manifest.json`，支援：
- **扁平結構**: 單一投影片組。
- **分章結構 (Subgroups)**: 包含多個章節的投影片。
- **自動掃描**: 自動搜尋 `.png`, `.jpg` 等格式圖片。
- **設定檔**: 讀取每個目錄下的 `config.json` (定義標題、方向、是否分章)。

### 投影片播放器 (Slide Viewer)
- **Swiper 整合**: 使用 `swiper/vue` 並搭配 `EffectFade` 轉場效果。
- **方向支援**: 根據設定動態套用 `aspect-video` (橫式) 或 `aspect-[9/16]` (直式)。
- **導航彈窗 (Navigation Overlay)**: 在投影片或章節結束時顯示，提供「下一章」、「返回選單」或「回首頁」的選項。
- **全螢幕**: 支援切換全螢幕模式。

### UI/UX 優化
- **頁面轉場**: 路由切換時加入淡入淡出 (Fade) 動畫。
- **首頁**: 顯示投影片卡片牆，包含封面圖與標題、方向等資訊。

## 3. 驗證結果 (Verification Results)
- **建置 (Build)**: 使用 `npm run build` (Vite 5) 成功建置專案。
- **Manifest 生成**: 測試執行 `gen_manifest` 正常運作。

## 4. 使用說明 (How to Use)
1. **加入內容**: 將投影片資料夾放入 `public/sliders/`。
2. **生成索引**: 執行 `python tools/gen_manifest.py`。
3. **啟動開發伺服器**: `npm run dev`。
4. **瀏覽**: 打開瀏覽器 (通常是 `http://localhost:5173`) 觀看結果。
