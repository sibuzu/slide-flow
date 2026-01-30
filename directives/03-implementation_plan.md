# SlideFlow 動態投影片發現 (Dynamic Discovery via Vite Plugin)

## 目標描述 (Goal Description)
移除需手動執行的 `gen_manifest.py` 與靜態 `manifest.json`，改用 **Vite Plugin** 在開發與構建階段自動掃描 `public/sliders` 目錄，動態生成投影片結構資料。

## 待修改變更 (Proposed Changes)

### 15. 滑動手勢旋轉支援 (Gesture Rotation Support) [NEW]
- **SwiperComponent.vue**:
    - Detect current rotation state.
    - Dynamically switch Swiper `direction` prop between `horizontal` (default) and `vertical` (rotated).
    - Bind `:direction` to computed property.

### 16. 上一章節導航支援 (Previous Chapter Support) [NEW]
- **SwiperComponent.vue**:
    - `handleKeydown`: 當 `isBeginning` 且按下來源為 Prev (Left/Up/PgUp) 時，發送 `attemptPrev` 事件。
- **SlideViewer.vue**:
    - **Computeds**: 新增 `prevChapterId` 計算屬性。
    - **Logic**:
        - `onAttemptPrev`: 顯示提示視窗 (Prompt)。
        - `onPrevChapter`: 導航至上一章的 **最後一頁** (`?slide=Length`) 以維持閱讀連續性。
    - **UI**:
        - 更新 "Prev Button" `v-show`: `currentSlideIndex > 0 || prevChapterId`。
        - 更新 Prompt Dialog: 支援 "Next Chapter" 與 "Previous Chapter" 兩種模式 (Text/Action)。

## 驗證計畫 (Verification Plan)
1. **Dev**: Mobile Fullscreen Test.
2. **Gesture**: Try swiping Up/Down on rotated slide. Should change slide.
3. **Prev Nav**: Go to Slide 1, Press Left -> Prompt -> Confirm -> Go to Prev Chapter Last Slide.
