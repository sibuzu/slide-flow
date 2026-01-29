# SlideFlow

SlideFlow 是一個輕量化、行動端優先的投影片展示平台。專注於「**資料驅動**」的設計，透過簡單的目錄結構與設定檔，自動生成專業的投影片展示網站。

## 🛠️ 技術棧 (Tech Stack)

- **Frontend**: Vue 3, Vite, Tailwind CSS
- **Slide Engine**: Swiper.js
- **Backend/Tools**: Python (用於 PDF 處理與索引生成)

## 🚀 快速開始 (Quick Start)

### 1. 環境準備

請確保系統已安裝 Node.js (v18+) 與 Python (v3.12+)。
專案使用 `uv` 管理 Python 虛擬環境。

```bash
# 安裝依賴 (Frontend)
npm install

# 初始化 Python 環境並安裝依賴
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -r requirements.txt # (若有 requirements.txt) 或直接安裝依賴:
uv pip install pdf2image Pillow
```

> **注意**: `pdf2image` 依賴系統安裝 `poppler`。
> - Linux: `sudo apt-get install poppler-utils`
> - macOS: `brew install poppler`
> - Windows: 請下載 poppler binary 並加入 PATH。

### 2. 開發模式

```bash
npm run dev
```

瀏覽器打開 `http://localhost:5173`。

## 📂 內容製作 (Content Creation)

### 目錄結構

將投影片資料夾放入 `public/sliders/`。

**一般投影片 (Flat)**:
```
public/sliders/mytopic/
  ├── config.json
  ├── cover.png (封面)
  ├── 01.png
  ├── 02.png
  └── ...
```

**分章節投影片 (Subgroups)**:
```
public/sliders/course101/
  ├── config.json
  ├── cover.jpg
  ├── chapter1/
  │   ├── 01.png
  │   └── ...
  └── chapter2/
      └── ...
```

### 設定檔 (`config.json`)

```json
{
  "title": "我的投影片標題",
  "orient": "landscape",  // 或 "portrait"
  "subgroup": false,      // 若為 true，需定義 chapters
  "chapters": [           // 僅當 subgroup: true 時需要
      { "id": "ch1", "title": "第一章", "path": "chapter1" },
      { "id": "ch2", "title": "第二章", "path": "chapter2" }
  ]
}
```

## 🛠️ 工具指令 (Tools)

### 1. PDF 轉圖片

將 PDF 轉換為適合 SlideFlow 使用的 png 圖片序列。

```bash
# 用法: python tools/convert_pdf.py <input_pdf> --output <output_dir>
python tools/convert_pdf.py my_slides.pdf --output public/sliders/myslides
```

### 2. 生成索引 (Generate Manifest)

每次新增或修改投影片目錄後，必須執行此指令來更新網站索引。

```bash
python tools/gen_manifest.py
```

## 📦 建置與部署 (Build & Deploy)

### 建置生產版本 (Build)

```bash
npm run build
```

這會產生 `dist/` 目錄，內含所有靜態檔案 (HTML, CSS, JS) 以及 `public/` 資料夾中的投影片資源。

### 部署 (Deploy)

本專案為純靜態網站 (Static Site)，可部署至任何靜態託管服務：

- **GitHub Pages / GitLab Pages**
- **Vercel / Netlify**
- **Nginx / Apache**
- **AWS S3 + CloudFront**

只需將 `dist/` 目錄下的所有內容上傳至伺服器根目錄即可。

> **注意**: 若部署在子路徑 (Sub-path)，請在 `vite.config.js` 中設定 `base` 選項。

## 📝 開發紀錄

詳細的開發計畫與任務追蹤文件位於 `directives/` 目錄：
- `directives/01-implementation_plan.md`: 實作計畫
- `directives/01-task.md`: 任務清單
- `directives/02-walkthrough.md`: 實作演練報告
