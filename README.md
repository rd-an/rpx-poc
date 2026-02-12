# RPX POC 本機開發指南

## 檢視首頁
在根目錄直接開啟 `index.html`：
```bash
# 方式 1: 使用瀏覽器開啟
start index.html

# 方式 2: 使用 Live Server (VS Code 擴充功能)
# 右鍵點擊 index.html → Open with Live Server
```

## 檢視 KB Audit POC
進入 kb-audit 目錄執行開發伺服器：
```bash
cd kb-audit
npm install    # 首次執行需要安裝依賴
npm run dev    # 啟動開發伺服器
```
開發伺服器預設在 `http://localhost:5173`

## 預覽建置後的完整站台
模擬 GitHub Pages 的完整結構：
```bash
# 1. 建置 kb-audit
cd kb-audit
npm run build

# 2. 回到根目錄，建立預覽結構
cd ..
mkdir -p _preview
cp index.html _preview/
cp -r kb-audit/dist _preview/kb-audit

# 3. 使用簡易 HTTP 伺服器預覽
# (需要安裝 http-server: npm install -g http-server)
cd _preview
npx http-server -p 8080
```
預覽網址：`http://localhost:8080`

## 開發模式說明
- **開發模式** (`npm run dev`)：使用 `/` 作為 base，方便本機開發
- **建置模式** (`npm run build`)：使用 `/rpx-poc/kb-audit/` 作為 base，符合 GitHub Pages 路徑
