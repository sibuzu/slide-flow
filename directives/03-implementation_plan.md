# SlideFlow 導航流程重構計畫 (Navigation Refactor)

## 目標描述 (Goal Description)
重構應用程式的導航邏輯，以符合「首頁 -> 章節選單 (若有) -> 投影片播放」的設計需求。
- **現行行為**: 點擊首頁的 Subgroup 項目直接進入 `SlideViewer`，並在其內部顯示章節列表。
- **目標行為**:
    1. **首頁 (Home)**: 顯示頂層項目卡片 (如 "AlwaysRobusInfo", "WalkingMap")。
    2. **點擊一般項目 (WalkingMap)**: 直接進入 `SlideViewer` 開始播放。
    3. **點擊分組項目 (AlwaysRobusInfo)**: 進入新的 **章節選單頁 (ChapterView)**，顯示該項目下的章節卡片 (如 "202512", "party")。
    4. **點擊章節卡片**: 進入 `SlideViewer` 開始播放該章節。

## 待修改變更 (Proposed Changes)

### 1. 路由配置 (`src/router/index.js`)
- 新增路由 `/chapters/:id` 指向 `ChapterView.vue`。
- 保持 `/viewer/:id` 與 `/viewer/:id/:chapterId` 指向 `SlideViewer.vue`。

### 2. 首頁邏輯 (`src/views/HomeView.vue`)
- 修改卡片點擊事件：
    - 若 `item.subgroup` 為 `true`，跳轉至 `/chapters/${item.id}`。
    - 否則跳轉至 `/viewer/${item.id}`。

### 3. 新增章節選單頁 (`src/views/ChapterView.vue`) [NEW]
- **功能**: 讀取路由參數 `id`，從 Store 獲取對應的 Presentation 資料。
- **UI**: 顯示標題與章節卡片列表 (Grid Layout)。
- **互動**: 點擊章節卡片跳轉至 `/viewer/${id}/${chapter.id}`。

### 4. 清理投影片播放器 (`src/views/SlideViewer.vue`)
- 移除內部的「章節選擇」邏輯 (`subgroup && !chapterId` 的區塊)。
- 此頁面將專注於播放功能，若進入 Subgroup 但未指定 chapterId，則重導向回 `/chapters/:id`。

## 驗證計畫 (Verification Plan)
1. **測試 AlwaysRobusInfo**:
   - 首頁點擊 -> 進入章節頁 (看到 202512, party 卡片)。
   - 點擊 202512 -> 進入播放器，顯示該章節圖片。
2. **測試 WalkingMap**:
   - 首頁點擊 -> 直接進入播放器。
