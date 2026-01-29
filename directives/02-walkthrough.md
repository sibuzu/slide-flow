# SlideFlow 開發與重構紀錄 (Walkthrough)

## 最新更新：Build - 建置同步與清理 (Sync & Cleanup)

**問題**:
1.  **檔案殘留**: 若從 `public` 刪除圖片，`dist` 中的對應 WebP 檔案未被刪除，導致發布檔案日益膨脹。
2.  **垃圾檔案**: Windows 或 WSL 環境下可能產生 `Zone.Identifier` 等原資料檔案被複製到 `dist`。

**解決**:
1.  **Sync Clean**: 修改 `scripts/optimize-images.mjs`，在轉檔完成後執行清理程序。
    - 掃描 `dist/sliders`。
    - 若發現 `*.webp` 但對應的 `public` 原始圖檔已不存在，則同步刪除。
    - 若發現 `*:Zone.Identifier` 檔案，一律刪除。
    - **驗證結果**: 成功清除 12 個過期 WebP 檔案與 Zone.Identifier 中繼資料。

---

## 歷史更新：Fix - 導航邏輯與焦點控制

**焦點控制**: "Next Chapter" Prompt 出現時自動 Focus。
**邏輯修正**: 修正 Chapter Index Reactivity。

## 歷史更新：Fix - 路由響應性與導航修正

- **路由響應**: `watch(route.params)`。

## 歷史更新：Feature - 版面最大化與路由優化

- **版面**: Full Screen。
- **路由**: Redirect / Default Query。

## 歷史更新：Feature - 導航同步與增強

- **URL Sync**: `?slide=N`。
- **鍵盤導航**: 全方向鍵。

## 歷史更新：Fix - 導航控制與投影片篩選

- **投影片篩選**: 嚴格排除 `cover.*`。

## 歷史更新：Fix - 章節封面與路由修正

- **章節封面**: Subgroup 章節顯示封面。
- **路由模式**: Hash Mode (`/#/`)。

## 歷史更新：UI 風格與核心重構

- **UI**: Light Theme (Sibuzu Style)。
- **圖片**: WebP 自動優化。
- **核心**: Vite Plugin 動態發現投影片。
