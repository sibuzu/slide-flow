# SlideFlow 開發與重構紀錄 (Walkthrough)

## 最新更新：Refactor - 影像策略精煉 (Phase 12)

**目標**: 簡化影像生成策略，並提升預覽圖品質。

**變更**:
1.  **Unified Resolution**: 統一使用 **1920px (Q75)** 作為 Desktop 與 Mobile 的標準影像，移除額外的 `mobile` (800w) 版本。
2.  **Better LQIP**: 將佔位符 (Placeholder) 尺寸從 20px 提升至 **200px (Q50)**，提供更清晰的模糊預覽 (`-small.webp`)。
3.  **Cleanup**: 移除 `srcset` 相關邏輯與檔案 (`-tiny`, `-mobile`)。

---

## 歷史更新：Feature - 進階顯示與手機支援 (Phase 11)

**目標**: 高畫質、Lazy Loading、手機旋轉適配。

**實作**:
- **Multi-resolution**: 支援 1920px 高解析度。
- **Frontend Display**: 實作 Lazy Loading (Intersection Observer) 與 Blur-up。
- **Mobile Rotation**: 全螢幕直向觀看橫圖時自動旋轉。

## 歷史更新：Fix - 封面圖片顯示 (Cover Image)

**Fix**: 修正 `getImagePath` 回傳物件導致的封面顯示錯誤。

## 歷史更新：Perf - 效能優化 (Resize & LQIP)

**Image Resize**: 1280x1280 -> 提升至 1920x1920 (Phase 11/12)。
**LQIP**: 48px -> 20px (Phase 11) -> 200px (Phase 12)。

## 歷史更新：Build - 建置同步與清理

**Sync Clean**: `optimize-images.mjs` 自動清理 `dist` 中過期 WebP 與 Zone.Identifier。

## 歷史更新：Fix - 導航邏輯與焦點控制

**焦點控制**: "Next Chapter" Prompt 自動 Focus。
**邏輯修正**: Chapter Index Reactivity。

## 歷史更新：Fix - 路由響應性與導航修正

- **路由模式**: Hash Mode (`/#/`).
- **路由響應**: `watch(route.params)`。

## 歷史更新：Feature - 版面最大化與路由優化

- **版面**: Full Screen `w-full h-full`。
- **路由**: Redirect / Default Query。

## 歷史更新：Feature - 導航同步與增強

- **URL Sync**: `?slide=N`。
- **鍵盤導航**: 全方向鍵。

## 歷史更新：Fix - 導航控制與投影片篩選

- **投影片篩選**: 嚴格排除 `cover.*`。

## 歷史更新：UI 風格與核心重構

- **UI**: Light Theme (Sibuzu Style)。
- **圖片**: WebP 自動優化。
- **核心**: Vite Plugin 動態發現投影片。
