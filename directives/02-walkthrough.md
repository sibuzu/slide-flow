# SlideFlow 開發與重構紀錄 (Walkthrough)

## 最新更新：Fix - 導航邏輯與焦點控制 (Focus & Logic)

**問題**:
1.  **焦點缺失**: "Next Chapter" Prompt 出現時，使用者需按 Tab 或使用滑鼠才能點擊，無法直接按 Enter。
2.  **章節循環錯誤**: 在特定順序下 (如 `202601` -> `party`)，Next Chapter 錯誤地跳回自己或前一章。

**解決**:
1.  **Auto Focus**:
    - 在 Prompt 出現時 (`showPrompt = true`)，使用 `setTimeout` 延遲 50ms 後自動 `focus()` "Next Chapter" 按鈕。
    - 新增 Focus 樣式 (`focus:ring`) 提供視覺回饋。
2.  **Logic Fix**:
    - 修正 `currentChapterIndex` 計算方式，棄用 setup 階段的靜態 `chapterId`，改用 Reactive 的 `route.params.chapterId`。
    - 確保在路由參數變更時，當前章節索引能正確更新，進而算出正確的 `nextChapterId`。

---

## 歷史更新：Fix - 路由響應性與導航修正

### 1. 路由響應 (Reactivity)
- 修正 `slides` 計算依賴，確保切換章節時投影片列表更新。
- 新增 `watch(route.params)` 以在組件重用時重新檢查路由邏輯 (Redirect / Query)。

## 歷史更新：Feature - 版面最大化與路由優化

### 1. 版面優化 (Maximize Layout)
- `w-full h-full` 全版面顯示。

### 2. 路由優化 (Routing)
- **Root Redirect**: Subgroup 自動導向至列表。
- **Default Query**: 自動補上 `?slide=1`。

## 歷史更新：Feature - 導航同步與增強

- **URL Sync**: `?slide=N`。
- **鍵盤導航**: 全方向鍵，End Prompt。

## 歷史更新：Fix - 導航控制與投影片篩選

- **投影片篩選**: 嚴格排除 `cover.*`。

## 歷史更新：Fix - 章節封面與路由修正

- **章節封面**: Subgroup 章節顯示封面。
- **路由模式**: Hash Mode (`/#/`)。

## 歷史更新：UI 風格與核心重構

- **UI**: Light Theme (Sibuzu Style)。
- **圖片**: WebP 自動優化。
- **核心**: Vite Plugin 動態發現投影片。
