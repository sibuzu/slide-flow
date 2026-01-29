# SlideFlow 程式設計規格畫

## 1. 專案概述

打造一個輕量化、行動端優先的投影片展示平台。核心理念是「**資料驅動 (Data-driven)**」，只需將轉換好的圖片與 `config.json` 放入指定目錄，網站便會自動索引並呈現專業的投影片內容。

它是一個投影片網站，下面sliders目錄，且下再有多目錄，每個目錄對應一組投影片，可能直式或橫式，但不會混用。網站自動列出所有投影片與自訂標題，由目錄下的 config.json (title, orient, subgroup) 與 cover.png (或 cover.jpg) 決定。 有時投影片主題可能再細分幾個章節 (subgroup=true)，則是選這目錄後，用戶再選章節的投影片。 而這章節看完後，在下一頁時，可問 user 是要取消/返回/下一章。

投影片觀看，使用 swiper.js ，讓行動端友善、高效且專業設計。

且有一個工具程式，可以先將 pdf 轉為 png 圖檔。

## 2. 技術棧 (Tech Stack)

- **WebApp 框架**: Vite + Vanilla JS 或 Vue 3 (建議使用 Vue 3 以利狀態管理)。
- **投影片引擎**: [Swiper.js](https://swiperjs.com/) (負責滑動邏輯、分頁與轉場)。
- **樣式**: Tailwind CSS (快速建構專業 UI)。
- **PDF 工具**: Python + `pdf2image` (需安裝 `poppler`)。

------

## 3. 資料架構與目錄規範

系統將掃描 `/public/sliders` 目錄，結構如下：

Plaintext

```
/sliders
  ├── topic-a/ (一般型)
  │   ├── config.json
  │   ├── cover.png
  │   ├── 01.png
  │   └── 02.png
  └── topic-b/ (分章節型)
      ├── config.json
      ├── cover.jpg
      ├── chapter-1/
      │   ├── 01.png
      │   └── 02.png
      └── chapter-2/
          ├── 01.png
```

### `config.json` 欄位定義

| **欄位**   | **型別** | **說明**                                                    |
| ---------- | -------- | ----------------------------------------------------------- |
| `title`    | String   | 投影片組顯示的標題                                          |
| `orient`   | String   | `portrait` (直式) 或 `landscape` (橫式)                     |
| `subgroup` | Boolean  | 是否包含子目錄章節                                          |
| `chapters` | Array    | 若 subgroup 為 true，則定義章節清單 `[{ id, title, path }]` |

------

## 4. WebApp 功能邏輯設計

### A. 自動索引與主頁

- **初始化**: 程式啟動時需 fetch `/sliders/manifest.json`（此檔案可由腳本預先生成，或後端動態掃描）。
- **封面牆**: 根據各目錄下的 `cover.png` 與 `title` 生成卡片流。

### B. 投影片檢視器 (Swiper.js 實作)

- **自適應容器**: 根據 `orient` 動態調整容器寬高比。
  - `landscape`: `aspect-video` (16:9)
  - `portrait`: `aspect-[9/16]`
- **觸控優化**: 開啟 `grabCursor`, `resistance`, `passiveListeners` 以提升手機滑動流暢度。

### C. 章節切換邏輯 (Subgroup Logic)

1. **進入點**: 若 `subgroup=true`，先進入「章節選單頁」。
2. **結束觸發**: 當 Swiper 到達該章節最後一頁 (slide index === total - 1)，再往後滑動時觸發 **Navigation Overlay**。
3. **導航彈窗 (Overlay)**:
   - **下一章**: 加載下一個子目錄圖片。
   - **返回選單**: 回到章節列表。
   - **結束觀看**: 回到主首頁。

------

## 5. PDF 轉圖工具程式 (Python)

此工具需自動化處理圖片命名，確保 Swiper 能按順序讀取。

Python

```
import pdf2image
import os

def convert_pdf_to_slides(pdf_path, output_folder, dpi=200):
    # 確保輸出目錄存在
    os.makedirs(output_folder, exist_ok=True)
    
    # 轉換
    images = pdf2image.convert_from_path(pdf_path, dpi=dpi)
    
    # 儲存為 01.png, 02.png...
    for i, image in enumerate(images):
        filename = f"{i+1:02d}.png"
        image.save(os.path.join(output_folder, filename), "PNG")
```

------

## 6. UI/UX 設計重點

- **深色模式**: 預設採用深色背景（黑/深灰），讓投影片內容更突出。但用戶可以選擇 深色模式 或 淺色模式。
- **載入狀態**: 圖片採用 `lazy loading`，並在載入時顯示微光抽屜 (Skeleton) 效果。
- **全螢幕按鈕**: 提供 Web API Fullscreen 支援，點擊可進入全螢幕沉浸模式。

------

## 7. 任務拆解 (Tasks for Antigravity)

我將開發過程分為四個主要階段，Antigravity 可以按順序執行或並行處理：

### Phase 1: 環境與工具開發 (Tooling)

- **Task 1.1**: 初始化 Python 環境，安裝 `pdf2image` 與 `Pillow`。
- **Task 1.2**: 編寫 `tools/convert_pdf.py`。需支援命令列參數（輸入路徑、輸出目錄、解析度）。
- **Task 1.3**: 編寫 `tools/gen_manifest.py`。此腳本負責掃描 `/public/sliders` 目錄，讀取所有 `config.json`，並彙整成一個 `manifest.json` 供前端讀取。

### Phase 2: 前端基礎架構 (Frontend Setup)

- **Task 2.1**: 使用 Vite 建立 Vue 3 + Tailwind CSS 專案。
- **Task 2.2**: 設定路由 (Vue Router)，包含：
  - `/` : 首頁（投影片列表）。
  - `/viewer/:id` : 投影片播放頁。
  - `/viewer/:id/:chapterId` : 章節播放頁。
- **Task 2.3**: 建立全域狀態 (Pinia) 存取 `manifest.json` 的資料。

### Phase 3: 核心功能實作 (Slide Engine)

- **Task 3.1**: 封裝 `SwiperComponent.vue`。根據 `orient` 動態綁定 CSS Class（如 `aspect-video` 或 `aspect-[9/16]`）。
- **Task 3.2**: 實作圖片預載 (Preloading) 與 Lazy Loading 邏輯。
- **Task 3.3**: 實作 Swiper 事件監聽，當 `isEnd` 為 true 且用戶繼續向後滑動時，彈出導航 Overlay。

### Phase 4: UI/UX 優化 (Refinement)

- **Task 4.1**: 設計「導航彈窗」組件，包含「下一章」、「返回列表」、「取消」三個按鈕。
- **Task 4.2**: 實作全螢幕 API 切換按鈕。
- **Task 4.3**: 增加進入投影片時的過渡動畫 (Page Transitions)。

------

## 8. 運作流程圖解 (Workthrough)

這部分定義了資料如何流動以及用戶如何操作。

### A. 內容建立者流程 (Content Creator Workflow)

1. **轉換**: 執行 `python convert_pdf.py my_presentation.pdf --output ./sliders/new-topic`。
2. **配置**: 在 `./sliders/new-topic` 手動編輯 `config.json`，設定標題與方向。
3. **索引**: 執行 `python gen_manifest.py` 更新全站索引。
4. **部署**: 將靜態檔案上傳至伺服器。

### B. 使用者觀看路徑 (User Journey Walkthrough)

1. **發現**: 用戶進入首頁，看到由 `cover.png` 組成的卡片牆。
2. **選擇**: 點擊某個投影片。
   - *Case A (subgroup=false)*: 直接進入 Swiper 播放介面。
   - *Case B (subgroup=true)*: 進入章節列表頁，點選特定章節後開始播放。
3. **互動**: 左右滑動或點擊翻頁。
4. **跨章節導航**:
   - 當滑到當前章節最後一頁，再往右滑。
   - 螢幕出現半透明浮層 (Overlay)。
   - **點擊「下一章」**: Swiper 重新初始化 (destroy & re-init)，載入新路徑圖片，並跳回第一張。
   - **點擊「返回」**: 退回到章節選單或首頁。

------

## 9. 關鍵組件邏輯虛擬碼 (Logic Sketch)

為了讓 Antigravity 更有感，這裡提供 Swiper 結尾判斷的邏輯參考：

JavaScript

```
// 在 Swiper 組件中監聽滑動
swiper.on('reachEnd', () => {
  // 記錄已到達結尾
  isAtLastSlide.value = true;
});

swiper.on('sliderMove', (s, event) => {
  if (isAtLastSlide.value && swiper.swipeDirection === 'next') {
    // 如果在最後一頁還想往後滑，顯示導航 Overlay
    showNavigationOverlay.value = true;
  }
});
```

------

## 10. 其他

1. python 用 uv venv

2. 所有產生的 implement plan, task, worktrough 都存放在 directives/ 目錄，並加上序號。 其說明文件用繁體中文。

3. 若是要 commit, 請加上詳細的中文 commit message。


   