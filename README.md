# 🏡 翊安地產網站 — 部署說明

## 📁 專案結構

```
yian-site/
├── netlify.toml                  # Netlify 設定
├── package.json                  # Functions 套件
├── public/                       # 前台網站（對外公開）
│   ├── index.html                # 首頁
│   ├── main.js                   # 前台邏輯（從 API 讀資料）
│   ├── style.css                 # 樣式
│   ├── images/
│   │   ├── yian-avatar.png
│   │   └── store.jpg
│   └── admin/
│       ├── index.html            # 後台登入頁  → /admin/
│       └── dashboard.html        # 後台管理頁  → /admin/dashboard.html
└── netlify/
    └── functions/
        ├── auth.js               # 驗證密碼 → /api/auth
        └── data.js               # 讀寫網站資料 → /api/data
```

---

## 🚀 部署步驟

### 第一步：上傳到 GitHub

1. 到 [github.com](https://github.com) 建立新 Repository（名稱隨意，例：`yian-site`）
2. 把整個 `yian-site` 資料夾上傳（可用 GitHub Desktop 或拖拉上傳）

### 第二步：連接 Netlify

1. 到 [netlify.com](https://netlify.com) 登入
2. 點 **Add new site → Import an existing project**
3. 選 **GitHub**，找到剛才的 repository
4. Build 設定：
   - **Publish directory**: `public`
   - **Functions directory**: `netlify/functions`（通常自動偵測）
5. 點 **Deploy site**

### 第三步：設定環境變數 ⚠️ 重要

在 Netlify 後台 → **Site configuration → Environment variables** 新增：

| Key | Value | 說明 |
|-----|-------|------|
| `ADMIN_PASSWORD` | （自訂密碼） | 後台登入密碼，建議8碼以上 |
| `JWT_SECRET` | （隨機字串） | 加密用，越長越好，例：`xK9#mP2$vL8nQ5wR` |

> 💡 JWT_SECRET 可以到 [randomkeygen.com](https://randomkeygen.com) 複製一個 256-bit key

設完之後點 **Trigger deploy** 重新部署一次。

### 第四步：啟用 Netlify Blobs

Netlify Blobs 在部署後會自動啟用，不需要額外設定。

---

## 🔐 後台使用方式

1. 前往 `https://你的網站.netlify.app/admin/`
2. 輸入步驟三設定的 `ADMIN_PASSWORD`
3. 登入後可修改：
   - **個人資料**：姓名、標語、統計數字、自我介紹
   - **聯絡與社群**：Email、LINE、各平台連結
   - **精選影片**：新增/編輯/刪除影片卡片
   - **超級A案物件**：新增/編輯/刪除物件卡片
4. 修改完畢，點右下角 **儲存所有變更**
5. 重新整理前台即可看到更新

---

## 👥 讓客戶也能登入後台

**方法一：給她密碼（最簡單）**
直接把 `ADMIN_PASSWORD` 告訴她就好。

**方法二：邀請為 Netlify 協作者**
- Netlify 後台 → **Team settings → Members → Invite**
- 輸入客戶的 Email，她會收到邀請信
- 免費方案支援 1 位額外成員

**方法三：之後把網站轉移給客戶**
- Netlify 後台 → **Site settings → Danger zone → Transfer site**

---

## ✅ 確認清單

- [ ] GitHub repository 已建立
- [ ] Netlify 已連接並部署成功
- [ ] `ADMIN_PASSWORD` 已設定
- [ ] `JWT_SECRET` 已設定
- [ ] 前台可以正常瀏覽
- [ ] `/admin/` 可以登入
- [ ] 後台修改後前台有更新

---

## ❓ 常見問題

**Q：後台儲存後前台沒有更新？**
A：重新整理前台（Ctrl+F5），Netlify Blobs 是即時的。

**Q：忘記密碼怎麼辦？**
A：到 Netlify → Environment variables 修改 `ADMIN_PASSWORD`，然後重新部署。

**Q：Functions 顯示錯誤？**
A：檢查 Netlify → Functions 頁面的 log，通常是環境變數沒設好。
