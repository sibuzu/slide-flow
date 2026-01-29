# SlideFlow 開發與重構紀錄 (Walkthrough)

## 最新更新：Refactor - 導航體驗優化 (Instant Navigation)

**目標**: 消除投影片切換時的疊圖殘影 (Ghosting/Overlap) 以及手勢操作的不順暢感。

**修正**:
1.  **Remove Fade Effect**: 移除所有淡入淡出特效，改為 **Speed 0 (Instant Transition)**。
    -   效果：切換投影片時如按鈕般即時反應，無過場動畫，徹底解決疊圖問題。
2.  **Absolute Positioning**: 將偽旋轉圖片的定位由 `fixed` 改為 `absolute`，確保其受 Swiper 容器控制。
3.  **Explicit Direction Control**: 使用 `swiper.changeDirection()` 明確控制滑動方向切換。

---

## 歷史更新：Refactor - 滑動手勢旋轉支援 (Phase 15)

**目標**: 當進入「偽旋轉」模式時，滑動手勢方向應與視覺上的「上一頁/下一頁」一致。

**實作**:
- **Gesture Sync**: `SwiperComponent` 偵測當前旋轉狀態 (`swiperDirection`)。
    -   **Normal**: `direction="horizontal"`.
    -   **Rotated**: `direction="vertical"`.
-   **效果**: 使用者在直立手機上「上下滑動」螢幕，即可切換投影片 (視覺上為左右切換)。

## 歷史更新：Refactor - 按鈕旋轉支援 (Phase 14)

**目標**: 當手機進入「偽旋轉 (Pseudo-rotation)」模式時，導航按鈕位置與方向應同步調整，以符合視覺上的「橫向」操作體驗。

**實作**:
- **Event Sync**: `SwiperComponent` 偵測當前投影片是否處於旋轉狀態，並發送 `rotationChanged` 事件。
- **Dynamic Positioning**: `SlideViewer` 根據旋轉狀態動態切換按鈕 CSS Class：
    -   **Normal**: 左右置中 (`top-1/2 left/right-4`).
    -   **Rotated**: 上下置中 (`top-24/bottom-16 left-1/2`) 並旋轉 90 度 (`rotate-90`).

## 歷史更新：Refactor - 手機旋轉 CSS 精煉 (Phase 13)

**目標**: 解決手機瀏覽器「螢幕旋轉鎖定」導致無法橫向全螢幕觀看投影片的問題。

**實作**:
- **CSS Pseudo-rotation**: Mobile + Fullscreen + Portrait Screen + Landscape Image -> 強制旋轉 90 度並滿版顯示。

## 歷史更新：Refactor - 影像策略精煉 (Phase 12)

**目標**: 簡化影像生成策略，並提升預覽圖品質。

**變更**:
1.  **Unified Resolution**: 1920px (Q75).
2.  **Better LQIP**: 200px (Q50).
3.  **Cleanup**: Remove `srcset`.

## 歷史更新：Feature - 進階顯示與手機支援 (Phase 11)

**目標**: 高畫質、Lazy Loading、手機旋轉適配。

**實作**:
- **Multi-resolution**: 支援 1920px 高解析度。
- **Frontend Display**: 實作 Lazy Loading (Intersection Observer) 與 Blur-up。
- **Mobile Rotation**: 全螢幕直向觀看橫圖時自動旋轉 (初步實作)。

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
