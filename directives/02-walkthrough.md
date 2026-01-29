# SlideFlow 開發與重構紀錄 (Walkthrough)

## 最新更新：Fix - 封面圖片顯示 (Cover Image)

**問題**:
1.  **圖片破損**: 在實作效能優化 (Phase 10) 後，`getImagePath` 改為回傳物件 `{ src, placeholder }`，導致 `ChapterView` 與 `HomeView` 直接綁定物件至 `img.src` 而失效。

**解決**:
1.  **Frontend Logic**: 更新 `src/views/ChapterView.vue` 與 `src/views/HomeView.vue`，將 `:src="getImagePath(...)"` 修正為 `:src="getImagePath(...).src"`。
    - 確保在 Production 模式下正確讀取優化後的 WebP 路徑。

---

## 歷史更新：Perf - 效能優化 (Resize & LQIP)

**Image Resize**: 1280x1280 (Inside Fit), Quality 70。
**LQIP**: 48px Tiny Thumbnail。
**Blur-up Loading**: 漸進式模糊載入效果。

## 歷史更新：Build - 建置同步與清理

**Sync Clean**: `optimize-images.mjs` 自動清理 `dist` 中過期 WebP 與 Zone.Identifier。

## 歷史更新：Fix - 導航邏輯與焦點控制

**焦點控制**: "Next Chapter" Prompt 自動 Focus。
**邏輯修正**: Chapter Index Reactivity。

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
